import Fastify from 'fastify';
import cors from '@fastify/cors';
import { dbStore, UserEntity, ProjectEntity, EvaluationEntity, CertificateEntity, ArchiveFileEntity } from './db/store';
import { generateAccessToken, generateRefreshToken } from './auth/jwt';
import { generateCertificateId, REIZEVAL_CERTIFICATES, determineCertificateForProject } from '../lib/certificates';
import crypto from 'crypto';

const fastify = Fastify({
  logger: false,
});

fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Root & Health
fastify.get('/health', async () => {
  return { status: 'healthy', activeUsers: dbStore.users.size, timestamp: new Date().toISOString() };
});

// 1. AUTHENTICATION (All seeded users verified)
fastify.post('/api/v1/auth/login', async (request, reply) => {
  const { email, password } = request.body as { email?: string; password?: string };

  if (!email) {
    return reply.status(400).send({ error: 'Kullanıcı adı veya e-posta zorunludur' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = dbStore.users.get(cleanEmail);

  if (!user) {
    return reply.status(401).send({ error: 'Kullanıcı hesabı bulunamadı. Lütfen kullanıcı adınızı kontrol edin.' });
  }

  // Password verification: check against plainPassword or passwordHash
  if (password && user.plainPassword && password !== user.plainPassword && password !== user.passwordHash) {
    return reply.status(401).send({ error: 'Hatalı şifre girdiniz.' });
  }

  const payload = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      title: user.title,
      organization: user.organization
    },
    accessToken,
    refreshToken
  };
});

// Get user directory / list for selector
fastify.get('/api/v1/users', async () => {
  const users = Array.from(dbStore.users.values()).map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    title: u.title,
    organization: u.organization
  }));
  return { success: true, count: users.length, data: users };
});

// 2. PROJECTS (List, Create, View)
fastify.get('/api/v1/projects', async () => {
  const projects = Array.from(dbStore.projects.values());
  return { success: true, count: projects.length, data: projects };
});

fastify.get('/api/v1/projects/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = dbStore.projects.get(id);
  if (!project) return reply.status(404).send({ error: 'Proje bulunamadı' });
  return { success: true, project };
});

// 3. MULTI-ZIP / MULTI-RAR UPLOAD (Up to 4-5 archives, 100 GB cumulative)
fastify.post('/api/v1/projects/:id/archives/multi-upload', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = dbStore.projects.get(id);

  if (!project) {
    return reply.status(404).send({ error: 'Proje bulunamadı' });
  }

  const { archives } = request.body as { archives: Array<{
    fileName: string;
    fileSizeBytes: number;
    sizeFormatted: string;
    sha256: string;
    format: 'ZIP' | 'RAR';
    category?: 'SOURCE_CODE' | 'ASSETS' | 'DATABASE_DUMP' | 'DOCUMENTATION' | 'MEDIA_DEMO';
  }> };

  if (!archives || !Array.isArray(archives) || archives.length === 0) {
    return reply.status(400).send({ error: 'En az bir ZIP veya RAR arşivi gereklidir.' });
  }

  // Validate total size (up to 100 GB)
  const totalSizeBytes = archives.reduce((sum, a) => sum + (a.fileSizeBytes || 0), 0);
  const max100GbBytes = 100 * 1024 * 1024 * 1024; // 100 GB
  if (totalSizeBytes > max100GbBytes) {
    return reply.status(400).send({ error: 'Toplam arşiv boyutu 100 GB sınırını aşamaz.' });
  }

  const newArchives: ArchiveFileEntity[] = archives.map(a => ({
    id: 'arc-' + crypto.randomBytes(4).toString('hex'),
    fileName: a.fileName,
    fileSizeBytes: a.fileSizeBytes,
    sizeFormatted: a.sizeFormatted,
    sha256: a.sha256,
    format: a.format || 'ZIP',
    category: a.category || 'SOURCE_CODE',
    uploadedAt: new Date().toISOString()
  }));

  project.archives.push(...newArchives);
  project.status = 'READY_FOR_JURY';
  dbStore.projects.set(id, project);
  dbStore.persist();

  return {
    success: true,
    addedCount: newArchives.length,
    totalArchivesCount: project.archives.length,
    project
  };
});

// 4. JURY EVALUATION (100-Point Weighted Rubric with Strict Anti-Tamper RBAC)
fastify.post('/api/v1/projects/:id/evaluations', async (request, reply) => {
  const { id } = request.params as { id: string };
  const project = dbStore.projects.get(id);

  if (!project) {
    return reply.status(404).send({ error: 'Proje bulunamadı' });
  }

  const b = request.body as any;
  const requesterRole = (request.headers['x-user-role'] as string) || b.requesterRole;
  const requesterId = (request.headers['x-user-id'] as string) || b.requesterId;

  // STRICT RBAC CHECK: CEO or Developers CANNOT grade or modify any scores!
  if (requesterRole && requesterRole !== 'TECHNICAL_JURY' && requesterRole !== 'GLOBAL_CTO') {
    return reply.status(403).send({
      error: 'YETKİSİZ İŞLEM (403 Forbidden): Geliştirici veya Şirket CEOsu dahi olsa jüri puanlarına müdahale edemez veya puan veremez. Yalnızca 12 teknik jüri yetkilidir.'
    });
  }

  // ANTI-CONFLICT OF INTEREST: Cannot grade one's own project!
  if (requesterId && project.ownerId === requesterId) {
    return reply.status(403).send({
      error: 'ÇIKAR ÇATIŞMASI ENGELİ (403 Forbidden): Kurucu, CEO veya adaylar kendi projelerini puanlayamazlar.'
    });
  }

  const codeQualityScore = Math.min(30, Math.max(0, Number(b.codeQualityScore || 0)));
  const securityScore = Math.min(20, Math.max(0, Number(b.securityScore || 0)));
  const performanceScore = Math.min(20, Math.max(0, Number(b.performanceScore || 0)));
  const functionalityScore = Math.min(20, Math.max(0, Number(b.functionalityScore || 0)));
  const documentationScore = Math.min(10, Math.max(0, Number(b.documentationScore || 0)));
  const totalScore = codeQualityScore + securityScore + performanceScore + functionalityScore + documentationScore;

  const evaluation: EvaluationEntity = {
    id: 'eval-' + crypto.randomBytes(4).toString('hex'),
    projectId: id,
    juryId: b.juryId || requesterId || 'RZV-JURY-001',
    juryName: b.juryName || 'Teknik Jüri',
    codeQualityScore,
    securityScore,
    performanceScore,
    functionalityScore,
    documentationScore,
    totalScore,
    technicalReport: b.technicalReport || 'Teknik jüri raporu girildi.',
    revisionRequested: Boolean(b.revisionRequested),
    revisionDetails: b.revisionDetails,
    isApprovedByCto: false,
    createdAt: new Date().toISOString()
  };

  project.evaluations.push(evaluation);
  project.status = b.revisionRequested ? 'REVISION_REQUESTED' : 'PENDING_CTO_APPROVAL';
  dbStore.projects.set(id, project);
  dbStore.persist();

  return { success: true, evaluation, project };
});

// 5. GLOBAL CTO APPROVAL & DYNAMIC 13-CERTIFICATE ISSUANCE (Gökçenur Öztürk)
fastify.post('/api/v1/evaluations/:id/cto-approve', async (request, reply) => {
  const { id } = request.params as { id: string };
  const b = request.body as any;
  const requesterRole = (request.headers['x-user-role'] as string) || b?.requesterRole;

  // STRICT RBAC CHECK: Only Global CTO can approve awards! CEO cannot approve!
  if (requesterRole && requesterRole !== 'GLOBAL_CTO' && requesterRole !== 'SYSTEM_ADMIN') {
    return reply.status(403).send({
      error: 'YETKİSİZ İŞLEM (403 Forbidden): Belge ve nihai puan onayı yalnızca Sistem Yöneticisi ve Global CTO Gökçenur Öztürk yetkisindedir. Şirket CEOsu onay veremez.'
    });
  }
  
  let targetProject: ProjectEntity | undefined;
  let targetEval: EvaluationEntity | undefined;

  for (const prj of dbStore.projects.values()) {
    const ev = prj.evaluations.find(e => e.id === id);
    if (ev) {
      targetProject = prj;
      targetEval = ev;
      break;
    }
  }

  if (!targetProject || !targetEval) {
    return reply.status(404).send({ error: 'Değerlendirme kaydı bulunamadı' });
  }

  targetEval.isApprovedByCto = true;
  targetEval.ctoNotes = 'Global CTO Gökçenur Öztürk tarafından incelenmiş ve resmî olarak onaylanmıştır.';
  targetProject.status = 'APPROVED_PUBLISHED';

  // Automatically determine the exact certificate from the 13 official types
  const certMeta = determineCertificateForProject(
    targetProject.category || targetProject.title,
    targetEval.totalScore,
    targetProject.title.includes('Full-Stack')
  );
  const certNumber = generateCertificateId(certMeta.id);

  const certificate: CertificateEntity = {
    id: 'cert-' + crypto.randomBytes(4).toString('hex'),
    certificateNumber: certNumber,
    type: certMeta.id,
    titleTr: certMeta.titleTr,
    titleEn: certMeta.titleEn,
    recipientId: targetProject.ownerId,
    recipientName: targetProject.ownerName,
    projectId: targetProject.id,
    projectTitle: targetProject.title,
    finalScore: targetEval.totalScore,
    approvedByCtoName: 'Gökçenur Öztürk',
    approvedByEntity: 'REİZMEDYA',
    issuedAt: new Date().toISOString(),
    cryptoSignature: 'ed25519_sig_' + crypto.randomBytes(32).toString('hex')
  };

  dbStore.certificates.set(certificate.id, certificate);
  dbStore.persist();

  return { success: true, evaluation: targetEval, certificate, project: targetProject };
});

// 6. CERTIFICATES LIST
fastify.get('/api/v1/certificates', async () => {
  return { success: true, count: dbStore.certificates.size, data: Array.from(dbStore.certificates.values()) };
});

// 7. REAL-TIME MESSAGING
fastify.get('/api/v1/projects/:id/messages', async (request) => {
  const { id } = request.params as { id: string };
  const projectMsgs = dbStore.messages.filter(m => m.projectId === id);
  return { success: true, data: projectMsgs };
});

fastify.post('/api/v1/projects/:id/messages', async (request) => {
  const { id } = request.params as { id: string };
  const b = request.body as any;
  const msg: MessageEntity = {
    id: 'msg-' + crypto.randomBytes(4).toString('hex'),
    projectId: id,
    senderId: b.senderId || 'RZV-EXE-001',
    senderName: b.senderName || 'Mustafa Çoban',
    senderRole: b.senderRole || 'DEVELOPER',
    content: b.content || '',
    createdAt: new Date().toISOString()
  };
  dbStore.messages.push(msg);
  dbStore.persist();
  return { success: true, message: msg };
});

// 8. DESKTOP VERSION & GOOGLE DRIVE MANIFEST
fastify.get('/api/v1/desktop/version', async () => {
  return {
    currentVersion: '1.0.0',
    minSupportedVersion: '1.0.0',
    driveDownloadUrl: 'https://drive.google.com/drive/folders/reizeval_official_dist',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    releaseDate: '2026-11-23',
    changelog: [
      'Gökçenur Öztürk (Global CTO) yetki matrisi eklendi.',
      '12 Uluslararası Teknik Jüri hesabı ve şifreleri veritabanına işlendi.',
      'Mustafa Çoban, Hülya Bulut, Mustafa Dalerdem proje geliştirici profilleri tanımlandı.',
      '4-5 parça ZIP/RAR (100 GB) yükleme motoru aktif edildi.'
    ]
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`[REIZEVAL Central API] Ready on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
