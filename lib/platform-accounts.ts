export interface PlatformAccount {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: 'GLOBAL_CTO' | 'DEVELOPER' | 'TECHNICAL_JURY';
  title: string;
  category: 'LEADERSHIP' | 'JURY';
  badgeColor: string;
}

export const PLATFORM_ACCOUNTS: PlatformAccount[] = [
  // --- LEADERSHIP & DEVELOPERS (4) ---
  {
    id: 'RZV-EXE-001',
    fullName: 'Mustafa Çoban',
    email: 'mustafa.coban@reizeval',
    password: 'ffYzp_fx6qYZy5VvnUTa2F',
    role: 'DEVELOPER',
    title: 'Kurucu / CEO',
    category: 'LEADERSHIP',
    badgeColor: 'blue'
  },
  {
    id: 'RZV-EXE-002',
    fullName: 'Hülya Bulut',
    email: 'hulya.bulut@reizeval',
    password: 'XotgpPY$VRC%v2-mX!eSyK',
    role: 'DEVELOPER',
    title: 'CXO & CTO Yardımcısı',
    category: 'LEADERSHIP',
    badgeColor: 'purple'
  },
  {
    id: 'RZV-EXE-003',
    fullName: 'Mustafa Dalerdem',
    email: 'mustafa.dalerdem@reizeval',
    password: '!yRWCrbJ%7!RX_oDDXhTkU',
    role: 'DEVELOPER',
    title: 'CIO / Akademi ve Ekosistem Başkanı',
    category: 'LEADERSHIP',
    badgeColor: 'indigo'
  },
  {
    id: 'RZV-CTO-001',
    fullName: 'Gökçenur Öztürk',
    email: 'gokcenurozturk@reizeval@gmail.com',
    password: 'ReizCTO2026!Global',
    role: 'GLOBAL_CTO',
    title: 'Global CTO & Sistem Yöneticisi',
    category: 'LEADERSHIP',
    badgeColor: 'amber'
  },

  // --- 12 INDEPENDENT TECHNICAL JURIES ---
  {
    id: 'RZV-JURY-001',
    fullName: 'Gaspare LoDuca',
    email: 'gaspare.loduca@reizeval',
    password: '8jsbrofAZEZZBPDwML$5',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-002',
    fullName: 'Olu Brown',
    email: 'olu.brown@reizeval',
    password: '4XypWZChNXNk8qgS@D5C',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-003',
    fullName: 'Eamon Kearns',
    email: 'eamon.kearns@reizeval',
    password: 'nX!CskZe3WHNz7*oaG9D',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-004',
    fullName: 'Marco Gomes',
    email: 'marco.gomes@reizeval',
    password: 'ghfBkxxsAy3xE6Ak99fh',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-005',
    fullName: 'Jessica Murray',
    email: 'jessica.murray@reizeval',
    password: 'TthayA97CHTMemnc6L3q',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-006',
    fullName: 'Kyle Filipe',
    email: 'kyle.filipe@reizeval',
    password: 'TXNUBQY#qKC2G2JMU%DJ',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-007',
    fullName: 'Jack Shallow',
    email: 'jack.shallow@reizeval',
    password: 'm2PkVKWNyHLt8xRL67J5',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-008',
    fullName: 'Christine Sweeney',
    email: 'christine.sweeney@reizeval',
    password: 'JZvduPCqhSSi8k!CXJtJ',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-009',
    fullName: 'Alice Knipfing',
    email: 'alice.knipfing@reizeval',
    password: 'WkFPZQ#j#TiTt$nSHm%C',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-010',
    fullName: 'Jag Patel',
    email: 'jag.patel@reizeval',
    password: 'e99qDvgopieJrKpyeof!',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-011',
    fullName: 'Scott Lever',
    email: 'scott.lever@reizeval',
    password: 'Xt435vy!zk52$oe%L7Mg',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  },
  {
    id: 'RZV-JURY-012',
    fullName: 'Wesley Esser',
    email: 'wesley.esser@reizeval',
    password: 'vNfP%DRqouh5qZVG%sQD',
    role: 'TECHNICAL_JURY',
    title: 'Uluslararası Profesyonel Teknik Jüri',
    category: 'JURY',
    badgeColor: 'cyan'
  }
];
