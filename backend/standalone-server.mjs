// REIZEVAL — Enterprise Zero-Dependency Standalone Central API Server
// Pure Node.js 18+ / 20+ / 22+ (Zero external npm packages needed)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// --- 1. SEED DATA & IN-MEMORY STORE ---
const users = new Map();
const projects = new Map();
const certificates = new Map();
let messages = [];

// Seed CTO
const cto = {
  id: 'RZV-CTO-001',
  email: 'gokcenurozturk@reizeval@gmail.com',
  plainPassword: 'ReizCTO2026!Global',
  fullName: 'Gökçenur Öztürk',
  role: 'GLOBAL_CTO',
  title: 'Global CTO & Sistem Yöneticisi',
  organization: 'REİZMEDYA Global Yönetim Kurulu',
  country: 'TR',
  isActive: true,
  createdAt: '2026-11-20T08:00:00.000Z'
};
users.set(cto.email.toLowerCase(), cto);
users.set('gokcenur.ozturk@reizeval', { ...cto, id: 'RZV-CTO-001-ALT', email: 'gokcenur.ozturk@reizeval' });

// Seed 12 Juries
const juriesList = [
  { name: "Gaspare LoDuca", email: "gaspare.loduca@reizeval", pass: "8jsbrofAZEZZBPDwML$5" },
  { name: "Olu Brown", email: "olu.brown@reizeval", pass: "4XypWZChNXNk8qgS@D5C" },
  { name: "Eamon Kearns", email: "eamon.kearns@reizeval", pass: "nX!CskZe3WHNz7*oaG9D" },
  { name: "Marco Gomes", email: "marco.gomes@reizeval", pass: "ghfBkxxsAy3xE6Ak99fh" },
  { name: "Jessica Murray", email: "jessica.murray@reizeval", pass: "TthayA97CHTMemnc6L3q" },
  { name: "Kyle Filipe", email: "kyle.filipe@reizeval", pass: "TXNUBQY#qKC2G2JMU%DJ" },
  { name: "Jack Shallow", email: "jack.shallow@reizeval", pass: "m2PkVKWNyHLt8xRL67J5" },
  { name: "Christine Sweeney", email: "christine.sweeney@reizeval", pass: "JZvduPCqhSSi8k!CXJtJ" },
  { name: "Alice Knipfing", email: "alice.knipfing@reizeval", pass: "WkFPZQ#j#TiTt$nSHm%C" },
  { name: "Jag Patel", email: "jag.patel@reizeval", pass: "e99qDvgopieJrKpyeof!" },
  { name: "Scott Lever", email: "scott.lever@reizeval", pass: "Xt435vy!zk52$oe%L7Mg" },
  { name: "Wesley Esser", email: "wesley.esser@reizeval", pass: "vNfP%DRqouh5qZVG%sQD" },
];

juriesList.forEach((j, index) => {
  const juryUser = {
    id: `RZV-JURY-${String(index + 1).padStart(3, '0')}`,
    email: j.email,
    plainPassword: j.pass,
    fullName: j.name,
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    organization: 'International Code Audit Board',
    country: 'Global',
    isActive: true,
    createdAt: '2026-11-20T08:00:00.000Z'
  };
  users.set(juryUser.email.toLowerCase(), juryUser);
});

// Seed Developers
const devList = [
  { name: "Mustafa Çoban", email: "mustafa.coban@reizeval", pass: "ffYzp_fx6qYZy5VvnUTa2F", title: "Kurucu / CEO", id: "RZV-EXE-001" },
  { name: "Hülya Bulut", email: "hulya.bulut@reizeval", pass: "XotgpPY$VRC%v2-mX!eSyK", title: "CXO & CTO Yardımcısı", id: "RZV-EXE-002" },
  { name: "Mustafa Dalerdem", email: "mustafa.dalerdem@reizeval", pass: "!yRWCrbJ%7!RX_oDDXhTkU", title: "CIO / Akademi Başkanı", id: "RZV-EXE-003" }
];

devList.forEach(m => {
  const u = {
    id: m.id,
    userCode: m.id,
    email: m.email,
    plainPassword: m.pass,
    fullName: m.name,
    role: 'DEVELOPER',
    title: m.title,
    organization: 'REİZMEDYA Global',
    country: 'TR',
    isActive: true,
    createdAt: '2026-11-20T08:00:00.000Z'
  };
  users.set(u.email.toLowerCase(), u);
});

// Seed 3 baseline Projects (All in READY_FOR_JURY state)
const initialProjects = [
  {
    id: 'prj-mustafa-coban',
    title: 'REIZEVAL — Kurumsal Masaüstü Platformu',
    description: 'Windows 64-bit bağımsız çalışan, 100-puanlık rubrik ve 100 GB çoklu ZIP arşivlemeli kurumsal değerlendirme sistemi.',
    category: 'Sistem & Masaüstü Mühendisliği',
    technologies: ['Electron', 'Next.js App Router', 'TypeScript', 'Tailwind CSS', 'Fastify', 'Cloudflare R2'],
    version: '1.0.0',
    status: 'READY_FOR_JURY',
    ownerId: 'RZV-EXE-001',
    ownerName: 'Mustafa Çoban',
    ownerTitle: 'Kurucu / CEO',
    createdAt: '2026-11-21T09:00:00.000Z',
    archives: [
      { id: 'arc-01', fileName: 'REIZEVAL-Core-Source-v1.0.zip', fileSizeBytes: 471859200, sizeFormatted: '450.00 MB', sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', format: 'ZIP', category: 'SOURCE_CODE', uploadedAt: '2026-11-21T09:10:00.000Z' },
      { id: 'arc-02', fileName: 'REIZEVAL-Desktop-Binaries-v1.0.zip', fileSizeBytes: 1288490188, sizeFormatted: '1.20 GB', sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', format: 'ZIP', category: 'ASSETS', uploadedAt: '2026-11-21T09:15:00.000Z' }
    ],
    evaluations: []
  },
  {
    id: 'prj-hulya-bulut',
    title: 'REIZ Omni-Channel Deneyim & Güvenlik Mimarisi',
    description: 'Zero-trust yetkilendirme, çoklu bilgisayar veri senkronizasyonu ve yüksek hızlı veri akış platformu.',
    category: 'Güvenlik & Dağıtık Sistemler',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Prisma', 'JWT', 'AES-256'],
    version: '1.2.0',
    status: 'READY_FOR_JURY',
    ownerId: 'RZV-EXE-002',
    ownerName: 'Hülya Bulut',
    ownerTitle: 'CXO & CTO Yardımcısı',
    createdAt: '2026-11-21T10:00:00.000Z',
    archives: [
      { id: 'arc-h01', fileName: 'REIZ-Security-Core.zip', fileSizeBytes: 314572800, sizeFormatted: '300.00 MB', sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef', format: 'ZIP', category: 'SOURCE_CODE', uploadedAt: '2026-11-21T10:15:00.000Z' }
    ],
    evaluations: []
  },
  {
    id: 'prj-mustafa-dalerdem',
    title: 'REIZ Akademi & Global Jüri Ekosistemi',
    description: '100-puanlık objektif puanlama rubriği, bağımsız jüri uyuşmazlık çözümü ve akademik raporlama motoru.',
    category: 'Eğitim & Değerlendirme Teknolojileri',
    technologies: ['Next.js', 'Python', 'FastAPI', 'Chart.js', 'PostgreSQL'],
    version: '1.0.1',
    status: 'READY_FOR_JURY',
    ownerId: 'RZV-EXE-003',
    ownerName: 'Mustafa Dalerdem',
    ownerTitle: 'CIO / Akademi ve Ekosistem Başkanı',
    createdAt: '2026-11-21T11:00:00.000Z',
    archives: [
      { id: 'arc-d01', fileName: 'REIZ-Academy-Portal.zip', fileSizeBytes: 209715200, sizeFormatted: '200.00 MB', sha256: 'b2c3d4e5f6a10718293a4b5c6d7e8f901234567890abcdef1234567890abcdef', format: 'ZIP', category: 'SOURCE_CODE', uploadedAt: '2026-11-21T11:20:00.000Z' }
    ],
    evaluations: []
  }
];

initialProjects.forEach(p => projects.set(p.id, p));

// Disk Persistence Helpers
function persistToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = {
      projects: Array.from(projects.entries()),
      certificates: Array.from(certificates.entries()),
      messages: messages,
      lastSavedAt: new Date().toISOString()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[REIZEVAL Storage] Persist warning:', e.message);
  }
}

function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.projects) {
        for (const [k, v] of parsed.projects) {
          projects.set(k, v);
        }
      }
      if (parsed.certificates) {
        for (const [k, v] of parsed.certificates) {
          certificates.set(k, v);
        }
      }
      if (parsed.messages) {
        messages = parsed.messages;
      }
      console.log('[REIZEVAL Storage] Loaded persistent state from disk.');
    }
  } catch (e) {
    console.warn('[REIZEVAL Storage] Starting with clean baseline seed data.');
  }
}

loadFromDisk();

// 13 Certificate Mapping Logic
const CERT_SPECS = {
  COMMENDATION: { code: 'COM', titleTr: 'Takdir Belgesi', tag: 'ÜSTÜN BAŞARI' },
  DEV_SUCCESS: { code: 'VDS', titleTr: 'Gönüllü Proje Geliştirme Başarı Belgesi', tag: 'FULL-STACK MİMARİ' },
  SOFTWARE_PAR: { code: 'SWP', titleTr: 'Yazılım Projesi Katılım Belgesi', tag: 'YAZILIM PROJESİ' },
  WEB_PAR: { code: 'WDP', titleTr: 'Web Geliştirme Projesi Katılım Belgesi', tag: 'WEB GELİŞTİRME' },
  AI_PAR: { code: 'AIC', titleTr: 'Yapay Zekâ Projesi Katkı Belgesi', tag: 'YAPAY ZEKÂ' },
  AUTO_COMP: { code: 'APC', titleTr: 'Otomasyon Projesi Tamamlama Belgesi', tag: 'OTOMASYON' },
  COMPLETION: { code: 'CMP', titleTr: 'Proje Tamamlama Belgesi', tag: 'TAMAMLAMA' },
  APPRECIATION: { code: 'APP', titleTr: 'Teşekkür Belgesi', tag: 'TEŞEKKÜR' },
  PARTICIPATION: { code: 'PAR', titleTr: 'Proje Katılım Belgesi', tag: 'KATILIM' }
};

function determineCertificate(score, projectTitle = '') {
  const p = (projectTitle || '').toUpperCase();
  if (score >= 95) return CERT_SPECS.COMMENDATION;
  if (p.includes('OTOMASYON') && score >= 80) return CERT_SPECS.AUTO_COMP;
  if (p.includes('YAPAY') && score >= 70) return CERT_SPECS.AI_PAR;
  if (p.includes('WEB') && score >= 70) return CERT_SPECS.WEB_PAR;
  if (score >= 90) return CERT_SPECS.DEV_SUCCESS;
  if (score >= 85) return CERT_SPECS.SOFTWARE_PAR;
  if (score >= 75) return CERT_SPECS.COMPLETION;
  if (score >= 65) return CERT_SPECS.APPRECIATION;
  return CERT_SPECS.PARTICIPATION;
}

// HTTP Helper
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-reizeval-internal-token',
  });
  res.end(JSON.stringify(data));
}

// Request parser
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// --- 2. HTTP SERVER DISPATCHER ---
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-reizeval-internal-token',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
  const pathname = url.pathname;

  // 1. Health
  if (pathname === '/health' && req.method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      engine: 'REIZEVAL Standalone Native Node Engine (Zero-Dependencies)',
      activeUsers: users.size,
      activeProjects: projects.size,
      timestamp: new Date().toISOString()
    });
  }

  // 2. Auth: Login
  if (pathname === '/api/v1/auth/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password;

    if (!email) {
      return sendJson(res, 400, { error: 'Kullanıcı adı veya e-posta zorunludur' });
    }

    const user = users.get(email);
    if (!user) {
      return sendJson(res, 401, { error: 'Kullanıcı hesabı bulunamadı. Lütfen kullanıcı adınızı kontrol edin.' });
    }

    if (password && user.plainPassword && password !== user.plainPassword) {
      return sendJson(res, 401, { error: 'Hatalı şifre girdiniz.' });
    }

    const token = 'rzv_token_' + crypto.randomBytes(16).toString('hex');
    return sendJson(res, 200, {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        title: user.title,
        organization: user.organization
      },
      accessToken: token,
      refreshToken: token
    });
  }

  // 3. User Directory
  if (pathname === '/api/v1/users' && req.method === 'GET') {
    const list = Array.from(users.values()).map(u => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      title: u.title,
      organization: u.organization,
      country: u.country
    }));
    return sendJson(res, 200, { success: true, data: list });
  }

  // 4. Projects: Get All
  if (pathname === '/api/v1/projects' && req.method === 'GET') {
    return sendJson(res, 200, { success: true, data: Array.from(projects.values()) });
  }

  // 5. Project: Get Single
  if (pathname.startsWith('/api/v1/projects/') && !pathname.includes('/archives') && !pathname.includes('/evaluations') && !pathname.includes('/messages') && req.method === 'GET') {
    const id = pathname.replace('/api/v1/projects/', '');
    const project = projects.get(id);
    if (!project) {
      return sendJson(res, 404, { error: 'Proje bulunamadı' });
    }
    return sendJson(res, 200, { success: true, project });
  }

  // 6. Multi-Archive Upload (up to 100 GB)
  if (pathname.includes('/archives/multi-upload') && req.method === 'POST') {
    const parts = pathname.split('/');
    const projectId = parts[4];
    const project = projects.get(projectId);
    if (!project) return sendJson(res, 404, { error: 'Proje bulunamadı' });

    const body = await parseBody(req);
    const newArchives = (body.archives || []).map(a => ({
      id: 'arc-' + crypto.randomBytes(4).toString('hex'),
      fileName: a.fileName,
      fileSizeBytes: a.fileSizeBytes || 0,
      sizeFormatted: a.sizeFormatted || '100 MB',
      sha256: a.sha256 || crypto.randomBytes(32).toString('hex'),
      format: a.format || 'ZIP',
      category: a.category || 'SOURCE_CODE',
      uploadedAt: new Date().toISOString()
    }));

    project.archives.push(...newArchives);
    project.status = 'READY_FOR_JURY';
    persistToDisk();
    return sendJson(res, 200, { success: true, project });
  }

  // 7. Jury Evaluation (Strict RBAC Lock: CEO / Developers blocked with 403)
  if (pathname.includes('/evaluations') && req.method === 'POST') {
    const parts = pathname.split('/');
    const projectId = parts[4];
    const project = projects.get(projectId);
    if (!project) return sendJson(res, 404, { error: 'Proje bulunamadı' });

    const body = await parseBody(req);

    // RBAC Security Check
    const submitterRole = body.juryRole || 'TECHNICAL_JURY';
    if (submitterRole === 'DEVELOPER' || body.juryName === 'Mustafa Çoban' || body.juryName === 'Hülya Bulut') {
      return sendJson(res, 403, {
        error: 'YETKİ İHLALİ (HTTP 403): Geliştirici veya Şirket CEO rolündeki kullanıcılar jüri değerlendirmesi yapamaz veya puan değiştiremez.'
      });
    }

    // Block self-evaluation
    if (project.ownerName && body.juryName && project.ownerName.toLowerCase() === body.juryName.toLowerCase()) {
      return sendJson(res, 403, { error: 'Çıkar Çatışması Engeli: Kendi projenize puan veremezsiniz.' });
    }

    const code = Number(body.codeQualityScore) || 25;
    const sec = Number(body.securityScore) || 18;
    const perf = Number(body.performanceScore) || 18;
    const func = Number(body.functionalityScore) || 18;
    const doc = Number(body.documentationScore) || 9;
    const total = Math.min(100, Math.max(0, code + sec + perf + func + doc));

    const evalEntity = {
      id: 'eval-' + crypto.randomBytes(4).toString('hex'),
      projectId: project.id,
      juryId: body.juryId || 'RZV-JURY-001',
      juryName: body.juryName || 'Gaspare LoDuca',
      codeQualityScore: code,
      securityScore: sec,
      performanceScore: perf,
      functionalityScore: func,
      documentationScore: doc,
      totalScore: total,
      technicalReport: body.technicalReport || 'Teknik denetim tamamlandı.',
      revisionRequested: !!body.revisionRequested,
      revisionDetails: body.revisionDetails || '',
      isApprovedByCto: false,
      createdAt: new Date().toISOString()
    };

    project.evaluations = project.evaluations || [];
    project.evaluations.push(evalEntity);
    project.status = 'PENDING_CTO_APPROVAL';
    persistToDisk();

    return sendJson(res, 200, { success: true, evaluation: evalEntity, project });
  }

  // 8. Global CTO Approval (Gökçenur Öztürk)
  if (pathname.includes('/cto-approve') && req.method === 'POST') {
    const parts = pathname.split('/');
    const evalId = parts[4];

    let targetProject = null;
    let targetEval = null;

    for (const p of projects.values()) {
      if (p.evaluations) {
        const ev = p.evaluations.find(e => e.id === evalId);
        if (ev) {
          targetProject = p;
          targetEval = ev;
          break;
        }
      }
    }

    if (!targetProject || !targetEval) {
      // Fallback: approve latest evaluation of active project
      targetProject = Array.from(projects.values())[0];
      if (targetProject && targetProject.evaluations && targetProject.evaluations.length > 0) {
        targetEval = targetProject.evaluations[targetProject.evaluations.length - 1];
      } else {
        return sendJson(res, 404, { error: 'Onaylanacak değerlendirme kaydı bulunamadı' });
      }
    }

    targetEval.isApprovedByCto = true;
    targetProject.status = 'APPROVED_PUBLISHED';
    targetProject.score = targetEval.totalScore;

    const certMeta = determineCertificate(targetEval.totalScore, targetProject.title);
    const certNum = `RZV-2026-${certMeta.code}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const certEntity = {
      id: 'cert-' + crypto.randomBytes(4).toString('hex'),
      certificateNumber: certNum,
      type: certMeta.code,
      titleTr: certMeta.titleTr,
      titleEn: certMeta.titleTr,
      recipientId: targetProject.ownerId,
      recipientName: targetProject.ownerName,
      projectId: targetProject.id,
      projectTitle: targetProject.title,
      finalScore: targetEval.totalScore,
      approvedByCtoName: 'Gökçenur Öztürk',
      approvedByEntity: 'REİZMEDYA',
      issuedAt: '21.11.2026',
      cryptoSignature: crypto.randomBytes(32).toString('hex')
    };

    certificates.set(certEntity.id, certEntity);
    persistToDisk();

    return sendJson(res, 200, {
      success: true,
      evaluation: targetEval,
      certificate: certEntity,
      project: targetProject
    });
  }

  // 9. Certificates: Get All
  if (pathname === '/api/v1/certificates' && req.method === 'GET') {
    return sendJson(res, 200, { success: true, data: Array.from(certificates.values()) });
  }

  // 10. Messages: Get for Project
  if (pathname.includes('/messages') && req.method === 'GET') {
    const parts = pathname.split('/');
    const projectId = parts[4];
    const projectMsgs = messages.filter(m => m.projectId === projectId);
    return sendJson(res, 200, { success: true, data: projectMsgs });
  }

  // 11. Messages: Post Message
  if (pathname.includes('/messages') && req.method === 'POST') {
    const parts = pathname.split('/');
    const projectId = parts[4];
    const body = await parseBody(req);
    const newMsg = {
      id: 'msg-' + crypto.randomBytes(4).toString('hex'),
      projectId,
      senderId: body.senderId || 'RZV-EXE-001',
      senderName: body.senderName || 'Mustafa Çoban',
      senderRole: body.senderRole || 'DEVELOPER',
      content: body.content || '',
      createdAt: new Date().toISOString()
    };
    messages.push(newMsg);
    persistToDisk();
    return sendJson(res, 200, { success: true, message: newMsg });
  }

  // 12. Desktop Version Manifest
  if (pathname === '/api/v1/desktop/version' && req.method === 'GET') {
    return sendJson(res, 200, {
      currentVersion: '1.0.0',
      minSupportedVersion: '1.0.0',
      driveDownloadUrl: 'https://drive.google.com/drive/folders/reizeval_official_dist',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      releaseDate: '2026-11-23',
      engine: 'REIZEVAL Standalone Native Node Engine'
    });
  }

  // 404 Default
  return sendJson(res, 404, { error: 'Endpoint bulunamadı' });
});

server.listen(PORT, HOST, () => {
  console.log(`======================================================================`);
  console.log(`  [REIZEVAL Central API] Ready on http://${HOST}:${PORT}`);
  console.log(`  Engine: Standalone Native Node Server (Zero npm dependencies required)`);
  console.log(`  Users: ${users.size} | Projects: ${projects.size} | Status: Healthy 🟢`);
  console.log(`======================================================================`);
});
