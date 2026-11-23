import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  plainPassword?: string; // For instant verification
  fullName: string;
  role: 'SYSTEM_ADMIN' | 'GLOBAL_CTO' | 'TECHNICAL_JURY' | 'DEVELOPER';
  title?: string;
  userCode?: string;
  organization: string;
  country: string;
  isActive: boolean;
  createdAt: string;
}

export interface ArchiveFileEntity {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  sizeFormatted: string;
  sha256: string;
  format: 'ZIP' | 'RAR';
  category: 'SOURCE_CODE' | 'ASSETS' | 'DATABASE_DUMP' | 'DOCUMENTATION' | 'MEDIA_DEMO';
  uploadedAt: string;
}

export interface ProjectEntity {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  version: string;
  status: 'DRAFT' | 'READY_FOR_JURY' | 'UNDER_REVIEW' | 'REVISION_REQUESTED' | 'DISPUTED' | 'PENDING_CTO_APPROVAL' | 'APPROVED_PUBLISHED';
  ownerId: string;
  ownerName: string;
  ownerTitle?: string;
  createdAt: string;
  archives: ArchiveFileEntity[];
  evaluations: EvaluationEntity[];
}

export interface EvaluationEntity {
  id: string;
  projectId: string;
  juryId: string;
  juryName: string;
  codeQualityScore: number; // 30
  securityScore: number;    // 20
  performanceScore: number; // 20
  functionalityScore: number; // 20
  documentationScore: number; // 10
  totalScore: number;       // 100
  technicalReport: string;
  revisionRequested: boolean;
  revisionDetails?: string;
  isApprovedByCto: boolean;
  ctoNotes?: string;
  createdAt: string;
}

export interface CertificateEntity {
  id: string;
  certificateNumber: string;
  type: string;
  titleTr: string;
  titleEn: string;
  recipientId: string;
  recipientName: string;
  projectId: string;
  projectTitle: string;
  finalScore: number;
  approvedByCtoName: string;
  approvedByEntity: string;
  issuedAt: string;
  cryptoSignature: string;
}

export interface MessageEntity {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

class InMemoryDataStore {
  public users: Map<string, UserEntity> = new Map();
  public projects: Map<string, ProjectEntity> = new Map();
  public certificates: Map<string, CertificateEntity> = new Map();
  public messages: MessageEntity[] = [];

  constructor() {
    this.seedExactUsers();
    this.loadFromDisk();
  }

  public persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = {
        projects: Array.from(this.projects.entries()),
        certificates: Array.from(this.certificates.entries()),
        messages: this.messages,
        lastSavedAt: new Date().toISOString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[REIZEVAL Storage] Failed to persist data to disk:', e);
    }
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.projects && Array.isArray(parsed.projects)) {
          this.projects = new Map(parsed.projects);
        }
        if (parsed.certificates && Array.isArray(parsed.certificates)) {
          this.certificates = new Map(parsed.certificates);
        }
        if (parsed.messages && Array.isArray(parsed.messages)) {
          this.messages = parsed.messages;
        }
      }
    } catch (e) {
      console.warn('[REIZEVAL Storage] Starting with clean baseline seed data');
    }
  }

  private seedExactUsers() {
    // 1. GLOBAL CTO & SYSTEM ADMIN
    const cto: UserEntity = {
      id: 'RZV-CTO-001',
      email: 'gokcenurozturk@reizeval@gmail.com',
      plainPassword: 'ReizCTO2026!Global',
      passwordHash: 'ReizCTO2026!Global',
      fullName: 'Gökçenur Öztürk',
      role: 'GLOBAL_CTO',
      title: 'Global CTO & Sistem Yöneticisi',
      organization: 'REİZMEDYA Global Yönetim Kurulu',
      country: 'TR',
      isActive: true,
      createdAt: '2026-11-20T08:00:00.000Z'
    };
    this.users.set(cto.email.toLowerCase(), cto);

    // Also support alias without @gmail.com for ease of access
    const ctoAlias: UserEntity = {
      ...cto,
      id: 'RZV-CTO-001-ALT',
      email: 'gokcenur.ozturk@reizeval',
    };
    this.users.set(ctoAlias.email.toLowerCase(), ctoAlias);

    // 2. 12 PROFESSIONAL JURIES
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
      const juryUser: UserEntity = {
        id: `RZV-JURY-${String(index + 1).padStart(3, '0')}`,
        email: j.email,
        plainPassword: j.pass,
        passwordHash: j.pass,
        fullName: j.name,
        role: 'TECHNICAL_JURY',
        title: 'Uluslararası Profesyonel Teknik Jüri',
        organization: 'International Code Audit Board',
        country: 'Global',
        isActive: true,
        createdAt: '2026-11-20T08:00:00.000Z'
      };
      this.users.set(juryUser.email.toLowerCase(), juryUser);
    });

    // 3. PROJECT SUBMITTERS / DEVELOPERS / FOUNDING TEAM
    const teamList = [
      {
        name: "Mustafa Çoban",
        email: "mustafa.coban@reizeval",
        pass: "ffYzp_fx6qYZy5VvnUTa2F",
        title: "Kurucu / CEO",
        id: "RZV-EXE-001"
      },
      {
        name: "Hülya Bulut",
        email: "hulya.bulut@reizeval",
        pass: "XotgpPY$VRC%v2-mX!eSyK",
        title: "CXO & CTO Yardımcısı",
        id: "RZV-EXE-002"
      },
      {
        name: "Mustafa Dalerdem",
        email: "mustafa.dalerdem@reizeval",
        pass: "!yRWCrbJ%7!RX_oDDXhTkU",
        title: "CIO / Akademi ve Ekosistem Başkanı",
        id: "RZV-EXE-003"
      }
    ];

    teamList.forEach((member) => {
      const devUser: UserEntity = {
        id: member.id,
        userCode: member.id,
        email: member.email,
        plainPassword: member.pass,
        passwordHash: member.pass,
        fullName: member.name,
        role: 'DEVELOPER',
        title: member.title,
        organization: 'REİZMEDYA Global',
        country: 'TR',
        isActive: true,
        createdAt: '2026-11-20T08:00:00.000Z'
      };
      this.users.set(devUser.email.toLowerCase(), devUser);
    });

    // Seed Initial Submitted Projects with Multi-ZIP archives (up to 100 GB support)
    // No pre-assigned points or awards! All projects start in 'READY_FOR_JURY' state waiting for impartial jury evaluation.
    const p1: ProjectEntity = {
      id: 'prj-mustafa-coban',
      title: 'REIZEVAL — Kurumsal Masaüstü Platformu',
      description: 'Windows 64-bit bağımsız çalışan, 100-puanlık rubrik ve 100 GB çoklu ZIP arşivlemeli A+ kurumsal değerlendirme sistemi.',
      category: 'Sistem & Masaüstü Mühendisliği',
      technologies: ['Electron', 'Next.js App Router', 'TypeScript', 'Tailwind CSS', 'Fastify', 'Cloudflare R2'],
      version: '1.0.0',
      status: 'READY_FOR_JURY',
      ownerId: 'RZV-EXE-001',
      ownerName: 'Mustafa Çoban',
      ownerTitle: 'Kurucu / CEO',
      createdAt: '2026-11-21T09:00:00.000Z',
      archives: [
        {
          id: 'arc-01',
          fileName: 'REIZEVAL-Core-Source-v1.0.zip',
          fileSizeBytes: 471859200, // ~450 MB
          sizeFormatted: '450.00 MB',
          sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          format: 'ZIP',
          category: 'SOURCE_CODE',
          uploadedAt: '2026-11-21T09:10:00.000Z'
        },
        {
          id: 'arc-02',
          fileName: 'REIZEVAL-Desktop-Binaries-v1.0.zip',
          fileSizeBytes: 1288490188, // ~1.2 GB
          sizeFormatted: '1.20 GB',
          sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          format: 'ZIP',
          category: 'ASSETS',
          uploadedAt: '2026-11-21T09:15:00.000Z'
        },
        {
          id: 'arc-03',
          fileName: 'REIZEVAL-Database-Dumps-v1.0.rar',
          fileSizeBytes: 858993459, // ~800 MB
          sizeFormatted: '819.20 MB',
          sha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
          format: 'RAR',
          category: 'DATABASE_DUMP',
          uploadedAt: '2026-11-21T09:20:00.000Z'
        },
        {
          id: 'arc-04',
          fileName: 'REIZEVAL-Audit-Documentation.zip',
          fileSizeBytes: 157286400, // ~150 MB
          sizeFormatted: '150.00 MB',
          sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
          format: 'ZIP',
          category: 'DOCUMENTATION',
          uploadedAt: '2026-11-21T09:25:00.000Z'
        }
      ],
      evaluations: []
    };

    const p2: ProjectEntity = {
      id: 'prj-hulya-bulut',
      title: 'REIZ Omni-Channel Deneyim & Güvenlik Mimarisi',
      description: 'Çok faktörlü kimlik doğrulama, Windows DPAPI kasa şifreleme ve jüri-aday uçtan uca şifreli iletişim motoru.',
      category: 'Siber Güvenlik & Deneyim Tasarımı',
      technologies: ['Electron SafeStorage', 'Fastify WSS', 'Ed25519', 'Zod', 'Tailwind CSS'],
      version: '1.2.0',
      status: 'READY_FOR_JURY',
      ownerId: 'RZV-EXE-002',
      ownerName: 'Hülya Bulut',
      ownerTitle: 'CXO & CTO Yardımcısı',
      createdAt: '2026-11-22T11:00:00.000Z',
      archives: [
        {
          id: 'arc-hb-01',
          fileName: 'OmniExperience-Architecture.zip',
          fileSizeBytes: 629145600,
          sizeFormatted: '600.00 MB',
          sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
          format: 'ZIP',
          category: 'SOURCE_CODE',
          uploadedAt: '2026-11-22T11:30:00.000Z'
        }
      ],
      evaluations: []
    };

    const p3: ProjectEntity = {
      id: 'prj-mustafa-dalerdem',
      title: 'REIZ Akademi & Global Jüri Ekosistemi',
      description: '12 uluslararası teknik jüri için 100 puanlık rubrik puanlama havuzu, varyans denetimi ve otomatik 13 resmî belge üretim hattı.',
      category: 'Ekosistem & Akademi',
      technologies: ['Prisma ORM', 'PDFKit', 'QRCode Vector', 'TypeScript Strict'],
      version: '1.0.1',
      status: 'READY_FOR_JURY',
      ownerId: 'RZV-EXE-003',
      ownerName: 'Mustafa Dalerdem',
      ownerTitle: 'CIO / Akademi ve Ekosistem Başkanı',
      createdAt: '2026-11-22T13:00:00.000Z',
      archives: [
        {
          id: 'arc-md-01',
          fileName: 'Akademi-Ecosystem-Suite.zip',
          fileSizeBytes: 838860800,
          sizeFormatted: '800.00 MB',
          sha256: 'f0e1d2c3b4a5968778695a4b3c2d1e0f0e1d2c3b4a5968778695a4b3c2d1e0f0',
          format: 'ZIP',
          category: 'SOURCE_CODE',
          uploadedAt: '2026-11-22T13:45:00.000Z'
        }
      ],
      evaluations: []
    };

    this.projects.set(p1.id, p1);
    this.projects.set(p2.id, p2);
    this.projects.set(p3.id, p3);

    // No pre-awarded certificates! All certificates are unlocked dynamically after jury evaluation and CTO approval.
  }
}

export const dbStore = new InMemoryDataStore();
