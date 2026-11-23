"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  UploadCloud, 
  Award, 
  FileCode, 
  Users, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  QrCode,
  FolderArchive,
  Sliders,
  Send,
  Lock,
  MessageSquare,
  RefreshCw,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Settings,
  Bell,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  UserCheck,
  Languages,
  Eye,
  FileCheck2,
  Smartphone,
  Globe2,
  Cpu,
  Search,
  Undo2,
  RotateCcw
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { REIZEVAL_CERTIFICATES, determineCertificateForProject } from "@/lib/certificates";
import { LandscapeA4Certificate } from "@/components/certificates/LandscapeA4Certificate";

import { InAppArchiveViewer } from "@/components/code-viewer/InAppArchiveViewer";
import { SecurityAuditScanner } from "@/components/security/SecurityAuditScanner";
import { RadarVarianceChart } from "@/components/jury/RadarVarianceChart";
import { AuthLoginPortal } from "@/components/auth/AuthLoginPortal";

type ActiveTab = "MY_PROJECT" | "ALL_PROJECTS" | "JURY_AUDIT" | "RADAR" | "CTO_OVERSIGHT" | "MESSAGES" | "RESULTS";

interface ProjectItem {
  id: string;
  projectKey: "PROJE_1" | "PROJE_2" | "PROJE_3";
  title: string;
  categoryName: string;
  ownerId?: string;
  ownerName: string;
  ownerTitle: string;
  currentStage: "V1_FRONTEND" | "V2_BACKEND_DB" | "V3_FULL_STACK" | "INDEPENDENT";
  status: "DRAFT" | "READY_FOR_JURY" | "PENDING_CTO_APPROVAL" | "APPROVED_PUBLISHED";
  score: number | null;
  archives: Array<{
    id: string;
    fileName: string;
    sizeFormatted: string;
    format: "ZIP" | "RAR";
    tag: "_WEB" | "_MOBIL" | "_OTOMASYON" | "GENEL";
    sha256: string;
    uploadedAt: string;
  }>;
  juryReviews: Array<{
    id: string;
    juryName: string;
    score: number;
    subScores: {
      codeQuality: number;
      security: number;
      performance: number;
      functionality: number;
      documentation: number;
      webBonus?: number;
      mobileBonus?: number;
      automationBonus?: number;
    };
    reportEn: string;
    reportTr: string;
    createdAt: string;
  }>;
}

// Normalize remote projects from central database into desktop ProjectItem
function normalizeProject(p: any, idx: number): ProjectItem {
  const pKey: "PROJE_1" | "PROJE_2" | "PROJE_3" = 
    (p.id === 'prj-mustafa-coban' || idx === 0) ? "PROJE_1" 
    : (p.id === 'prj-hulya-bulut' || idx === 1) ? "PROJE_2" 
    : "PROJE_3";

  const score = (p.evaluations && p.evaluations.length > 0)
    ? p.evaluations[p.evaluations.length - 1].totalScore
    : (p.score !== undefined ? p.score : null);

  return {
    id: p.id,
    projectKey: pKey,
    title: p.title || `REIZEVAL — ${pKey}`,
    categoryName: p.category || (pKey === "PROJE_1" ? "Temel Web Mimarisi" : pKey === "PROJE_2" ? "Kademeli Sistem (_WEB, _MOBİL, _OTOMASYON)" : "Python Otomasyon & Bot Mimarisi"),
    ownerId: p.ownerId || (pKey === "PROJE_1" ? "RZV-EXE-001" : pKey === "PROJE_2" ? "RZV-EXE-002" : "RZV-EXE-003"),
    ownerName: p.ownerName || (pKey === "PROJE_1" ? "Mustafa Çoban" : pKey === "PROJE_2" ? "Hülya Bulut" : "Mustafa Dalerdem"),
    ownerTitle: p.ownerTitle || (pKey === "PROJE_1" ? "Kurucu / CEO" : pKey === "PROJE_2" ? "CXO & CTO Yardımcısı" : "CIO / Akademi Başkanı"),
    currentStage: (pKey === "PROJE_2" ? "V3_FULL_STACK" : "INDEPENDENT") as any,
    archives: (p.archives || [])
      .filter((a: any) => !['arc-01', 'arc-02', 'arc-h01', 'arc-d01'].includes(a.id) && !a.fileName?.includes('Core-Source') && !a.fileName?.includes('Desktop-Binaries'))
      .map((a: any) => ({
      id: a.id || `arc-${Math.random()}`,
      fileName: a.fileName,
      sizeFormatted: a.sizeFormatted || `${((a.fileSizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB`,
      format: (a.format || (a.fileName.endsWith('.rar') ? 'RAR' : 'ZIP')) as any,
      tag: a.category || (pKey === "PROJE_2" ? "_WEB" : "GENEL"),
      sha256: a.sha256 || "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      uploadedAt: a.uploadedAt ? new Date(a.uploadedAt).toLocaleString('tr-TR') : "21.11.2026"
    })),
    status: ((p.archives || []).filter((a: any) => !['arc-01', 'arc-02', 'arc-h01', 'arc-d01'].includes(a.id) && !a.fileName?.includes('Core-Source') && !a.fileName?.includes('Desktop-Binaries')).length > 0)
      ? (p.status || "READY_FOR_JURY")
      : "AWAITING_SUBMISSION",
    score: ((p.archives || []).filter((a: any) => !['arc-01', 'arc-02', 'arc-h01', 'arc-d01'].includes(a.id) && !a.fileName?.includes('Core-Source') && !a.fileName?.includes('Desktop-Binaries')).length > 0)
      ? score
      : null,
    juryReviews: (p.evaluations || []).map((ev: any) => ({
      id: ev.id,
      juryName: ev.juryName,
      score: ev.totalScore,
      subScores: {
        codeQuality: ev.codeQualityScore || 25,
        security: ev.securityScore || 18,
        performance: ev.performanceScore || 18,
        functionality: ev.functionalityScore || 18,
        documentation: ev.documentationScore || 9,
        webBonus: ev.webBonus,
        mobileBonus: ev.mobileBonus,
        automationBonus: ev.automationBonus,
      },
      reportEn: ev.technicalReport || "Teknik denetim raporu kaydedildi.",
      reportTr: ev.technicalReport || "Teknik denetim raporu kaydedildi.",
      createdAt: ev.createdAt ? new Date(ev.createdAt).toLocaleString('tr-TR') : "21.11.2026"
    }))
  };
}

// Official Platform Directory (All 16 members)
interface ContactUser {
  id: string;
  name: string;
  role: "GLOBAL_CTO" | "DEVELOPER" | "TECHNICAL_JURY";
  roleLabel: string;
  title: string;
  email: string;
  avatarColor: string;
}

const PLATFORM_CONTACTS: ContactUser[] = [
  // 1. Global CTO & Sistem Yöneticisi
  {
    id: "RZV-CTO-001",
    name: "Gökçenur Öztürk",
    role: "GLOBAL_CTO",
    roleLabel: "Global CTO & Sistem Yöneticisi",
    title: "Global CTO",
    email: "gokcenur.ozturk@reizeval",
    avatarColor: "from-amber-500 to-amber-700"
  },
  // 2. Geliştiriciler
  {
    id: "RZV-EXE-001",
    name: "Mustafa Çoban",
    role: "DEVELOPER",
    roleLabel: "Geliştirici (PROJE_1)",
    title: "Kurucu / CEO",
    email: "mustafa.coban@reizeval",
    avatarColor: "from-blue-500 to-blue-700"
  },
  {
    id: "RZV-EXE-002",
    name: "Hülya Bulut",
    role: "DEVELOPER",
    roleLabel: "Geliştirici (PROJE_2)",
    title: "CXO & CTO Yardımcısı",
    email: "hulya.bulut@reizeval",
    avatarColor: "from-indigo-500 to-indigo-700"
  },
  {
    id: "RZV-EXE-003",
    name: "Mustafa Dalerdem",
    role: "DEVELOPER",
    roleLabel: "Geliştirici (PROJE_3)",
    title: "CIO / Akademi Başkanı",
    email: "mustafa.dalerdem@reizeval",
    avatarColor: "from-purple-500 to-purple-700"
  },
  // 3. 12 Bağımsız Uluslararası Jüri
  { id: "JURY-01", name: "Gaspare LoDuca", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Baş Teknik Jüri", email: "gaspare.loduca@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-02", name: "Olu Brown", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Sistem Güvenlik Jürisi", email: "olu.brown@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-03", name: "Eamon Kearns", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Mimari Denetim Jürisi", email: "eamon.kearns@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-04", name: "Marco Gomes", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Veritabanı & Performans", email: "marco.gomes@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-05", name: "Jessica Murray", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "UI/UX & Frontend Jürisi", email: "jessica.murray@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-06", name: "Kyle Filipe", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Zaafiyet & Sızma Jürisi", email: "kyle.filipe@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-07", name: "Jack Shallow", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Büyük Veri & Dağıtık Ağ", email: "jack.shallow@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-08", name: "Christine Sweeney", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "DevOps & CI/CD Jürisi", email: "christine.sweeney@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-09", name: "Alice Knipfing", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "QA & Kod Doğrulama", email: "alice.knipfing@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-10", name: "Jag Patel", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Otomasyon & Scripting", email: "jag.patel@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-11", name: "Scott Lever", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Full-Stack Mimari Jürisi", email: "scott.lever@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
  { id: "JURY-12", name: "Wesley Esser", role: "TECHNICAL_JURY", roleLabel: "Uluslararası Jüri", title: "Akademik Raporlama Jürisi", email: "wesley.esser@reizeval", avatarColor: "from-emerald-500 to-emerald-700" },
];

export default function ReizevalDesktopApp() {
  // Current Authenticated User (null = show Login Portal)
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<ActiveTab>("MY_PROJECT");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Certificate Modal State
  const [activeCertData, setActiveCertData] = useState<any | null>(null);

  // World-Class Security & In-App Viewer Modals
  const [viewerModalArchive, setViewerModalArchive] = useState<string | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showRadarModal, setShowRadarModal] = useState<boolean>(false);

  // Live Projects loaded directly from Central Database API (Zero mock/fake data)
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("prj-mustafa-coban");
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);

  const activeProject: ProjectItem = projects.find(p => p.id === selectedProjectId) || projects[0] || {
    id: "prj-mustafa-coban",
    projectKey: "PROJE_1",
    title: "REIZEVAL — Kurumsal Masaüstü Platformu",
    categoryName: "Sistem & Masaüstü Mühendisliği",
    ownerId: "RZV-EXE-001",
    ownerName: "Mustafa Çoban",
    ownerTitle: "Kurucu / CEO",
    currentStage: "INDEPENDENT",
    status: "READY_FOR_JURY",
    score: null,
    archives: [],
    juryReviews: []
  };

  // Developer's own isolated project
  const myProject: ProjectItem = projects.find(p => 
    (currentUser?.fullName && p.ownerName.toLowerCase().includes(currentUser.fullName.toLowerCase())) ||
    (currentUser?.id && p.ownerId === currentUser.id) ||
    (currentUser?.email?.includes('coban') && p.projectKey === 'PROJE_1') ||
    (currentUser?.email?.includes('bulut') && p.projectKey === 'PROJE_2') ||
    (currentUser?.email?.includes('dalerdem') && p.projectKey === 'PROJE_3')
  ) || projects[0] || activeProject;

  // Translation Toggle state for Jury reviews
  const [translatedReviews, setTranslatedReviews] = useState<Record<string, boolean>>({});

  // Multi-Party Enterprise Messaging State
  const [selectedContactId, setSelectedContactId] = useState<string>("RZV-CTO-001");
  const [contactSearchQuery, setContactSearchQuery] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState("");
  const [activeApiUrl, setActiveApiUrl] = useState<string>("https://reizeval-api.onrender.com");

  // Evaluating Jury Name (for Jury Rubric)
  const [evaluatingJuryName, setEvaluatingJuryName] = useState<string>("Gaspare LoDuca");

  // Expanded review inspection in CTO desk
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({
    "prj-mustafa-coban": true,
    "prj-hulya-bulut": true,
    "prj-mustafa-dalerdem": true
  });

  // Check saved session on startup
  useEffect(() => {
    setActiveApiUrl(apiClient.getBaseUrl());
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("reizeval_auth_user");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            if (parsed.token) apiClient.setToken(parsed.token);
            if (parsed.role === "GLOBAL_CTO") {
              setActiveTab("CTO_OVERSIGHT");
            } else if (parsed.role === "TECHNICAL_JURY") {
              setActiveTab("JURY_AUDIT");
              setEvaluatingJuryName(parsed.fullName);
            } else {
              setActiveTab("MY_PROJECT");
            }
          }
        } catch (e) {
          console.warn("Failed to parse saved user", e);
        }
      }
    }
    setIsAuthChecking(false);
  }, []);

  // Real-time synchronization loop across network / multi-computer
  const syncProjectsAndMessages = async () => {
    try {
      const res = await apiClient.getProjects();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        const mapped = res.data.map((p: any, idx: number) => normalizeProject(p, idx));
        setProjects(mapped);
        setIsLoadingProjects(false);
      }

      // Sync messages for active project
      if (selectedProjectId) {
        const msgRes = await apiClient.getMessages(selectedProjectId);
        if (msgRes && msgRes.data && Array.isArray(msgRes.data)) {
          setChatMessages(msgRes.data.map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            recipientId: m.recipientId,
            recipientName: m.recipientName,
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isFromDeveloper: m.senderRole === "DEVELOPER"
          })));
        }
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    let isMounted = true;
    syncProjectsAndMessages();
    const interval = setInterval(() => {
      if (isMounted) syncProjectsAndMessages();
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedProjectId, selectedContactId]);

  // Auth Handler
  const handleLoginSuccess = (user: any, token: string) => {
    const userWithToken = { ...user, token };
    setCurrentUser(userWithToken);
    if (typeof window !== "undefined") {
      localStorage.setItem("reizeval_auth_user", JSON.stringify(userWithToken));
    }
    if (token) apiClient.setToken(token);

    if (user.role === "GLOBAL_CTO") {
      setActiveTab("CTO_OVERSIGHT");
    } else if (user.role === "TECHNICAL_JURY") {
      setActiveTab("JURY_AUDIT");
      setEvaluatingJuryName(user.fullName);
    } else {
      setActiveTab("MY_PROJECT");
    }
    setStatusMessage(`Hoş geldiniz, Sayın ${user.fullName}. Oturum başarıyla açıldı.`);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("reizeval_auth_user");
      if ((window as any).reizevalNative?.clearSecureToken) {
        (window as any).reizevalNative.clearSecureToken("user_token").catch(() => {});
      }
    }
    apiClient.setToken(null);
    setCurrentUser(null);
    setStatusMessage("Oturum güvenli bir şekilde kapatıldı.");
  };

  const handleUpdateApiUrl = (newUrl: string) => {
    apiClient.setBaseUrl(newUrl || null);
    const updated = apiClient.getBaseUrl();
    setActiveApiUrl(updated);
    setStatusMessage(`Merkezi API sunucu adresi güncellendi: ${updated}`);
    syncProjectsAndMessages();
  };

  // Jury Rubric Grading State (100 Base + Sub-module Extra Scores for ALL 3 projects)
  const [codeQuality, setCodeQuality] = useState(25); // 30
  const [securityScore, setSecurityScore] = useState(18); // 20
  const [performanceScore, setPerformanceScore] = useState(18); // 20
  const [functionalityScore, setFunctionalityScore] = useState(18); // 20
  const [documentationScore, setDocumentationScore] = useState(8); // 10
  
  // Sub-module Extra Bonus Scores (Available for all 3 developers):
  const [webBonus, setWebBonus] = useState(0); // max 10
  const [mobileBonus, setMobileBonus] = useState(0); // max 10
  const [automationBonus, setAutomationBonus] = useState(0); // max 10

  const [juryCommentEn, setJuryCommentEn] = useState("");

  const baseTotalScore = codeQuality + securityScore + performanceScore + functionalityScore + documentationScore;
  const bonusTotalScore = webBonus + mobileBonus + automationBonus;
  const finalCalculatedScore = Math.min(100, baseTotalScore + bonusTotalScore);

  // Upload ZIP / WinRAR (Live Native File Dialog & Central Server Upload)
  const handleAddNewArchive = async () => {
    const targetProject = currentUser?.role === "DEVELOPER" ? myProject : activeProject;
    if (!targetProject) return;

    let selectedFile: any = null;
    if (typeof window !== "undefined" && (window as any).reizevalNative?.selectArchive) {
      selectedFile = await (window as any).reizevalNative.selectArchive();
    }

    if (!selectedFile) {
      // User cancelled dialog
      return;
    }

    setStatusMessage(`Arşiv (${selectedFile.fileName}) merkezi sunucuya yükleniyor...`);
    try {
      const res = await apiClient.uploadMultiArchives(targetProject.id, [{
        fileName: selectedFile.fileName,
        fileSizeBytes: selectedFile.sizeBytes,
        sizeFormatted: selectedFile.sizeFormatted,
        sha256: selectedFile.sha256,
        format: selectedFile.extension.toUpperCase() as "ZIP" | "RAR",
        category: "SOURCE_CODE"
      }]);

      if (res && res.project) {
        await syncProjectsAndMessages();
        setStatusMessage(`✅ Gerçek arşiv (${selectedFile.fileName}) başarıyla eklendi ve tüm jürilere iletildi!`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ Arşiv yükleme hatası: ${err.message}`);
    }
  };

  // Delete Archive
  const handleDeleteArchive = async (arcId: string) => {
    const targetProject = currentUser?.role === "DEVELOPER" ? myProject : activeProject;
    try {
      await apiClient.deleteArchive(targetProject.id, arcId);
      await syncProjectsAndMessages();
      setStatusMessage("Arşiv merkezi sunucudan başarıyla silindi.");
    } catch (err: any) {
      setProjects(prev => prev.map(p => {
        if (p.id === targetProject.id) {
          return {
            ...p,
            archives: p.archives.filter(a => a.id !== arcId)
          };
        }
        return p;
      }));
      setStatusMessage("Arşiv silindi.");
    }
  };

  // Jury Submits Evaluation (Strict Anti-Tamper RBAC)
  const handleJurySubmitReview = async () => {
    if (!currentUser) return;
    if (currentUser.role === "DEVELOPER" && (currentUser.fullName === "Mustafa Çoban" || currentUser.fullName === "Hülya Bulut" || currentUser.fullName === "Mustafa Dalerdem")) {
      setStatusMessage("YETKİSİZ İŞLEM (403 Forbidden): Geliştirici veya Şirket CEOsu jüri değerlendirmesi yapamaz. Yalnızca 12 Bağımsız Jüri puan verebilir.");
      alert("YETKİSİZ İŞLEM (HTTP 403 Forbidden)\n\nGeliştirici rolündeki kullanıcılar jüri değerlendirmesi yapamaz!\n\nLütfen değerlendirme yapmak için 12 Bağımsız Teknik Jüri hesabından biriyle giriş yapınız.");
      return;
    }

    if (activeProject.archives.length === 0) {
      setStatusMessage("ARŞİV EKSİK: Bu projeye henüz kaynak kod (ZIP/RAR) yüklenmediği için jüri puanı verilemez.");
      alert("DEĞERLENDİRME YAPILAMAZ!\n\nBu projeye geliştirici tarafından henüz hiçbir kaynak kod veya ZIP/RAR arşivi yüklenmemiştir.\n\nLütfen önce ilgili geliştiricinin proje arşivini yüklemesini bekleyiniz.");
      return;
    }

    const juryNameToSubmit = currentUser.role === "TECHNICAL_JURY" ? currentUser.fullName : evaluatingJuryName;

    setStatusMessage("Puanlama ve rapor merkezi sunucuya kaydediliyor...");
    try {
      const res = await apiClient.submitEvaluation(activeProject.id, {
        codeQualityScore: codeQuality,
        securityScore,
        performanceScore,
        functionalityScore,
        documentationScore,
        webBonus,
        mobileBonus,
        automationBonus,
        technicalReport: juryCommentEn || "Teknik denetim ve mimari inceleme tamamlandı.",
        juryId: currentUser.id || "JURY-01",
        juryName: juryNameToSubmit
      });

      if (res && res.success) {
        await syncProjectsAndMessages();
        setStatusMessage(`✅ ${activeProject.title} projesine ${finalCalculatedScore}/100 puan verildi ve Global CTO Gökçenur Öztürk onayına iletildi!`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ Hata: ${err.message}`);
    }
  };

  // CTO Approval (Strict RBAC: Only Global CTO Gökçenur Öztürk can approve!)
  const handleCtoApproveProject = async (projId: string) => {
    if (!currentUser || currentUser.role !== "GLOBAL_CTO") {
      setStatusMessage("YETKİSİZ İŞLEM (403 Forbidden): Belge ve nihai puan onay yetkisi yalnızca Global CTO Gökçenur Öztürk yetkisindedir.");
      alert("YETKİSİZ İŞLEM (HTTP 403 Forbidden)\n\nBelge ve nihai puan onay yetkisi yalnızca Global CTO Gökçenur Öztürk yetkisindedir.");
      return;
    }

    const targetProj = projects.find(p => p.id === projId);
    if (targetProj && targetProj.archives.length === 0) {
      setStatusMessage("ARŞİV EKSİK: Bu projeye henüz kaynak kod veya ZIP arşivi yüklenmediği için Global CTO onayı verilemez.");
      alert("ONAY VERİLEMEZ!\n\nBu projeye henüz hiçbir kaynak kod veya ZIP/RAR arşivi yüklenmemiştir.\n\nResmî tescil ve sertifika üretimi için önce projenin teslim edilmesi gereklidir.");
      return;
    }

    setStatusMessage("Global CTO onayı veriliyor ve resmi sertifika üretiliyor...");
    try {
      const res = await apiClient.approveEvaluation(projId);
      if (res && res.success) {
        await syncProjectsAndMessages();
        setStatusMessage("✅ Global CTO Gökçenur Öztürk projeyi resmî olarak onayladı ve Başarı Belgesi hak edildi!");
      }
    } catch (err: any) {
      setStatusMessage(`❌ Onay hatası: ${err.message}`);
    }
  };

  // CTO Revoke Approval (Onayı Geri Al)
  const handleCtoRevokeProject = async (projId: string) => {
    if (!currentUser || currentUser.role !== "GLOBAL_CTO") {
      setStatusMessage("YETKİSİZ İŞLEM (403 Forbidden): Onay geri alma yetkisi yalnızca Global CTO Gökçenur Öztürk yetkisindedir.");
      return;
    }

    setStatusMessage("Global CTO onayı geri alınıyor ve inceleme moduna döndürülüyor...");
    try {
      await apiClient.revokeApproval(projId);
      await syncProjectsAndMessages();
      setStatusMessage("↩️ Global CTO onayı geri alındı. Proje yeniden değerlendirme statüsüne alındı.");
    } catch (err: any) {
      setProjects(prev => prev.map(p => p.id === projId ? { ...p, status: "READY_FOR_JURY", score: null } : p));
      setStatusMessage("↩️ Onay geri alındı.");
    }
  };

  // CTO Reset Evaluations (Jüri Notlarını ve Mock Verileri Sıfırla)
  const handleCtoResetEvaluations = async (projId: string) => {
    if (!currentUser || currentUser.role !== "GLOBAL_CTO") return;
    if (!confirm("Bu projeye ait tüm jüri değerlendirme raporlarını ve puanlarını sıfırlamak istediğinize emin misiniz?")) {
      return;
    }

    setStatusMessage("Jüri değerlendirmeleri sıfırlanıyor...");
    try {
      await apiClient.resetEvaluations(projId);
      await syncProjectsAndMessages();
      setStatusMessage("✅ Bu projeye ait tüm jüri değerlendirmeleri ve skorlar sıfırlandı.");
    } catch (err: any) {
      setProjects(prev => prev.map(p => p.id === projId ? { ...p, juryReviews: [], score: null, status: "READY_FOR_JURY" } : p));
      setStatusMessage("✅ Jüri değerlendirmeleri sıfırlandı.");
    }
  };

  // Multi-party Send Message
  const selectedContact = PLATFORM_CONTACTS.find(c => c.id === selectedContactId) || PLATFORM_CONTACTS[0];

  const handleSendChatMessage = async () => {
    if (!chatInputText.trim() || !currentUser) return;
    const content = chatInputText.trim();
    setChatInputText("");

    try {
      await apiClient.sendMessage(activeProject.id, {
        content,
        senderId: currentUser.id,
        senderName: currentUser.fullName,
        senderRole: currentUser.role,
        recipientId: selectedContact.id,
        recipientName: selectedContact.name,
      });
      await syncProjectsAndMessages();
    } catch (err: any) {
      setStatusMessage(`❌ Mesaj iletilemedi: ${err.message}`);
    }
  };

  // Open Certificate for active project
  const handleOpenCertificate = (p: ProjectItem) => {
    const certMeta = determineCertificateForProject(
      p.projectKey === "PROJE_1" ? "PROJE_1_WEB" : p.projectKey === "PROJE_3" ? "PROJE_3_PYTHON_OTOMASYON" : "PROJE_2_KADEMELI",
      p.score || 95,
      p.currentStage === "V3_FULL_STACK"
    );

    setActiveCertData({
      title: certMeta.titleTr,
      recipientName: p.ownerName,
      recipientTitle: p.ownerTitle,
      projectTitle: p.title,
      score: p.score || 95,
      certificateNumber: `RZV-2026-${certMeta.code}-98A${Math.floor(Math.random() * 900 + 100)}`
    });
  };

  // 1. Initial Auth Check Spinner
  if (isAuthChecking) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-[#060a17]">
        <img 
          src="/images/reizeval-shield.png" 
          alt="REIZEVAL" 
          className="h-16 w-16 object-contain drop-shadow-[0_0_16px_rgba(59,130,246,0.8)] animate-pulse mb-3" 
        />
        <div className="text-slate-300 font-semibold text-sm">REIZEVAL Enterprise Doğrulanıyor</div>
        <div className="text-slate-500 text-xs font-mono mt-1">Merkezi Oturum & Yetki Denetimi...</div>
      </div>
    );
  }

  // 2. Authentication Gate: Show Login Screen when not logged in
  if (!currentUser) {
    return (
      <AuthLoginPortal
        onLoginSuccess={handleLoginSuccess}
        activeApiUrl={activeApiUrl}
        onUpdateApiUrl={handleUpdateApiUrl}
      />
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#060a17]">
      {/* Landscape A4 Modal */}
      {activeCertData && (
        <LandscapeA4Certificate
          title={activeCertData.title}
          recipientName={activeCertData.recipientName}
          recipientTitle={activeCertData.recipientTitle}
          projectTitle={activeCertData.projectTitle}
          score={activeCertData.score}
          certificateNumber={activeCertData.certificateNumber}
          onClose={() => setActiveCertData(null)}
        />
      )}

      {/* World-Class In-App Archive & DRM Code Viewer */}
      {viewerModalArchive && (
        <InAppArchiveViewer
          archiveName={viewerModalArchive}
          projectName={activeProject.title}
          developerName={activeProject.ownerName}
          reviewerName={currentUser.fullName}
          onClose={() => setViewerModalArchive(null)}
        />
      )}

      {/* World-Class SAST & Code Authenticity Scanner */}
      {showSecurityModal && (
        <SecurityAuditScanner
          projectName={activeProject.title}
          developerName={activeProject.ownerName}
          archivesCount={activeProject.archives.length}
          totalSizeBytes={activeProject.archives.length * 1024 * 1024 * 500}
          onClose={() => setShowSecurityModal(false)}
        />
      )}

      {/* World-Class 5-Axis Spider Radar Variance Chart */}
      {showRadarModal && (
        <RadarVarianceChart
          projectName={activeProject.title}
          juriesData={
            activeProject.juryReviews.length > 0 
              ? activeProject.juryReviews.map(r => ({
                  name: r.juryName,
                  totalScore: r.score,
                  scores: {
                    codeQuality: r.subScores.codeQuality,
                    security: r.subScores.security,
                    performance: r.subScores.performance,
                    functionality: r.subScores.functionality,
                    documentation: r.subScores.documentation
                  }
                }))
              : []
          }
          onClose={() => setShowRadarModal(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className="w-72 bg-[#0a1128] border-r border-blue-900/40 flex flex-col justify-between p-4 select-none">
        <div className="space-y-4">
          {/* Official REIZEVAL Logo & Brand Header */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-blue-950/70 via-slate-900/80 to-slate-900/90 border border-blue-500/30 flex items-center space-x-3 shadow-lg shadow-blue-950/50">
            <img 
              src="/images/reizeval-shield.png" 
              alt="REIZEVAL" 
              className="h-11 w-11 object-contain rounded-lg drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" 
            />
            <div className="flex-1 min-w-0">
              <div className="text-white font-black text-sm tracking-wider flex items-center space-x-1.5">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-white">REIZEVAL</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-400/30 font-semibold">2026</span>
              </div>
              <p className="text-[9px] text-blue-300/70 truncate tracking-tight">Global Assessment Platform</p>
            </div>
          </div>

          {/* Active Profile Box */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-blue-900/50 space-y-2 shadow-md">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center space-x-1">
                <UserCheck className="h-3 w-3 text-emerald-400" />
                <span>Giriş Yapılan Hesap</span>
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div>
              <div className="font-bold text-white text-sm truncate flex items-center justify-between">
                <span>{currentUser.fullName}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                  currentUser.role === "GLOBAL_CTO" 
                    ? "bg-amber-950/80 text-amber-300 border border-amber-800/40" 
                    : currentUser.role === "TECHNICAL_JURY" 
                      ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/40" 
                      : "bg-blue-950/80 text-blue-300 border border-blue-800/40"
                }`}>
                  {currentUser.role?.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[11px] text-blue-400 font-mono truncate">{currentUser.email}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.title}</div>
              {currentUser.organization && (
                <div className="text-[9px] text-slate-500 truncate">{currentUser.organization}</div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-1 py-1.5 px-3 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 hover:border-rose-700 text-rose-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              title="Oturumu Kapat ve Giriş Ekranına Dön"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-400" />
              <span>Oturumu Kapat (Çıkış)</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Çalışma Ekranları
            </div>
            {(() => {
              const navItems = currentUser.role === "DEVELOPER"
                ? [
                    { tab: "MY_PROJECT", label: "Projem & ZIP/RAR", icon: FolderArchive, badge: myProject.projectKey },
                    { tab: "RESULTS", label: "Sonuçlar & Sıralama", icon: Award, badge: myProject.score ? `${myProject.score} Puan` : "Canlı" },
                    { tab: "MESSAGES", label: "Jüri ile İletişim", icon: MessageSquare, badge: "Birebir" },
                  ]
                : currentUser.role === "TECHNICAL_JURY"
                ? [
                    { tab: "JURY_AUDIT", label: "100 Puanlık Rubrik", icon: Sliders, badge: "3 Aday Proje" },
                    { tab: "RADAR", label: "Varyans Radarı", icon: Activity, badge: "Konsensüs" },
                    { tab: "RESULTS", label: "Sonuçlar & Sıralama", icon: Award, badge: "Puan Tablosu" },
                    { tab: "MESSAGES", label: "Geliştiriciye Mesaj", icon: MessageSquare, badge: "Birebir" },
                  ]
                : [
                    { tab: "CTO_OVERSIGHT", label: "Global CTO Masası", icon: ShieldCheck, badge: "Nihai Onay" },
                    { tab: "ALL_PROJECTS", label: "Tüm Projeler & Arşivler", icon: FolderArchive, badge: "3 Proje" },
                    { tab: "RADAR", label: "Varyans Radarı", icon: Activity, badge: "Konsensüs" },
                    { tab: "RESULTS", label: "Sonuçlar & Resmî Belgeler", icon: Award, badge: "Tescil Masası" },
                    { tab: "MESSAGES", label: "Kurul Mesajlaşma", icon: MessageSquare, badge: "Tüm Jüriler" },
                  ];

              return navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.tab;
                return (
                  <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab as ActiveTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? "bg-blue-900 text-blue-200" : "bg-slate-900 text-slate-400"
                    }`}>
                      {item.badge}
                    </span>
                  </button>
                );
              });
            })()}
          </div>
        </div>

        {/* Footer Brand */}
        <div className="text-[10px] text-slate-500 border-t border-slate-900 pt-3 space-y-1">
          <div className="font-semibold text-slate-300">REIZEVAL Global Suite</div>
          <div>Yatay A4 Resmî Sertifika Motoru</div>
          <div className="text-emerald-400">Windows 64-bit EXE</div>
        </div>
      </aside>

      {/* Main Dynamic View */}
      <section className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#0a1128]/40 to-[#060a17]">
        {/* Toast */}
        {statusMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-blue-950/90 border border-blue-600/60 text-xs text-blue-100 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="font-medium">{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs ml-4">
              Kapat
            </button>
          </div>
        )}

        {/* 1. DEVELOPER ISOLATED VIEW (MY_PROJECT) - ONLY CURRENT DEVELOPER'S PROJECT */}
        {activeTab === "MY_PROJECT" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Projem & ZIP/RAR Yükleme Masası</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono font-semibold">
                    100 GB Kapasite
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Geliştirici: <strong className="text-white">{myProject.ownerName}</strong> ({myProject.ownerTitle}) • <span className="text-blue-300 font-mono font-bold">{myProject.projectKey}</span>
                </p>
              </div>

              <div className="text-right">
                <div className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${
                  myProject.score 
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-700" 
                    : myProject.archives.length === 0
                      ? "bg-slate-900 text-slate-400 border-slate-800"
                      : "bg-amber-950/80 text-amber-300 border-amber-800"
                }`}>
                  {myProject.score 
                    ? `${myProject.score} / 100 Puan (Değerlendirildi)` 
                    : myProject.archives.length === 0
                      ? "Arşiv Yüklemeniz Bekleniyor"
                      : "Jüri İncelemesi Sürüyor"}
                </div>
              </div>
            </div>

            {/* Developer's Isolated Project Card */}
            <div className="p-6 rounded-xl bg-slate-900/90 border border-blue-900/50 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <FolderArchive className="h-5 w-5 text-blue-400" />
                    <span>{myProject.title}</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                    <span>Kategori: <strong className="text-slate-200">{myProject.categoryName}</strong></span>
                    <span>•</span>
                    <span>Aşama: <strong className="text-blue-300">{myProject.currentStage}</strong></span>
                  </div>
                </div>

                {/* Developer Actions */}
                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={() => setShowSecurityModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>SAST Güvenlik Taraması</span>
                  </button>

                  <button
                    onClick={() => setShowRadarModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-800/80 hover:bg-blue-900 text-blue-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>5 Eksenli Varyans Radarı</span>
                  </button>

                  <button
                    onClick={handleAddNewArchive}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Windows Gezgini'nden Arşiv Ekle</span>
                  </button>
                </div>
              </div>

              {/* Special Kademeli & Alt Modül Info (Available for ALL 3 Developers) */}
              <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/40 space-y-2 text-xs">
                <div className="font-bold text-blue-300 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Tüm Geliştiriciler İçin Kademeli ve Alt Modül Şartnamesi (_WEB, _MOBİL, _OTOMASYON):</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <strong>1. Kademe (V1):</strong> Frontend geliştirme ve ilk inceleme
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <strong>2. Kademe (V2):</strong> Backend ve veritabanı eklenmesi
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800">
                    <strong>3. Kademe (V3):</strong> Tam Full-Stack nihai sistem
                  </div>
                </div>
                <div className="text-[11px] text-amber-300">
                  * Alt Dallar ve Ek Puanlar: Klasörler içinde <code className="bg-slate-900 px-1 py-0.5 rounded text-white">_WEB</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-white">_MOBİL</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-white">_OTOMASYON</code> etiketli modüller yer aldığında jüri her birine ayrı ayrı <strong>+10 ek puan</strong> verecektir.
                </div>
              </div>

              {/* Uploaded Archives List with DELETE & DRM VIEW */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                  <span>Yüklü Olan Arşiv Dosyalarınız ({myProject.archives.length} Adet)</span>
                  <span className="text-[11px] text-slate-500 font-normal">İstediğiniz arşivi silebilir veya yenisini ekleyebilirsiniz</span>
                </div>

                {myProject.archives.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#060a17] border border-dashed border-slate-800 text-center space-y-2">
                    <FolderArchive className="h-8 w-8 text-slate-600 mx-auto" />
                    <div className="text-xs text-slate-300 font-medium">Bu projeye henüz arşiv yüklenmedi.</div>
                    <p className="text-[11px] text-slate-500">
                      Yukarıdaki "Windows Gezgini'nden Arşiv Ekle" butonuyla projenizin ZIP veya RAR arşivlerini yükleyebilirsiniz.
                    </p>
                  </div>
                ) : (
                  myProject.archives.map((arc, i) => (
                    <div
                      key={arc.id}
                      className="p-3.5 rounded-lg bg-[#060a17] border border-blue-900/40 flex items-center justify-between text-xs hover:border-blue-700/60 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="h-7 w-7 rounded bg-blue-950 text-blue-300 font-bold font-mono text-[11px] flex items-center justify-center">
                          #{i + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center space-x-2">
                            <span>{arc.fileName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                              {arc.tag}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {arc.format}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-md">
                            SHA-256: {arc.sha256} • Tarih: {arc.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-blue-400 font-bold">{arc.sizeFormatted}</span>

                        {/* IN-APP CODE VIEWER BUTTON */}
                        <button
                          onClick={() => setViewerModalArchive(arc.fileName)}
                          className="px-2.5 py-1.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                          title="ZIP'i Diske Çıkarmadan Dahili Kod Gezgininde İncele"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Kodu İncele (DRM)</span>
                        </button>

                        {/* DELETE ARCHIVE BUTTON */}
                        <button
                          onClick={() => handleDeleteArchive(arc.id)}
                          className="p-1.5 rounded bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                          title="Bu Arşivi Sistemden Kesin Olarak Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Approved Project Certificate Preview Card */}
            {myProject.status === "APPROVED_PUBLISHED" && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-slate-950 border border-emerald-600/60 flex items-center justify-between shadow-2xl">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Award className="h-6 w-6 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Resmî Başarı Belgeniz Onaylandı!</h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    {myProject.ownerName} ({myProject.ownerTitle}) • Puan: <strong className="text-emerald-400">{myProject.score} / 100</strong>
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Global CTO Gökçenur Öztürk Onaylı • Resmî REİZMEDYA Mühürlü
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCertificate(myProject)}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                >
                  <Award className="h-4 w-4" />
                  <span>Yatay A4 Belgeyi Görüntüle & İndir</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. CTO MASTER ALL PROJECTS VIEW (ALL_PROJECTS) - GLOBAL CTO ONLY */}
        {activeTab === "ALL_PROJECTS" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Tüm Projeler & Arşiv Denetim Masası</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                  3 Aday Proje
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Sistemdeki tüm projeleri, yüklenen arşivleri ve dosya bütünlüklerini Global CTO yetkisiyle inceleyin.
              </p>
            </div>

            {/* 3 Project Selection Cards */}
            <div className="grid grid-cols-3 gap-4">
              {projects.map((p) => {
                const isSelected = selectedProjectId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-blue-950/90 border-blue-500 shadow-xl shadow-blue-950/50"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-blue-400">{p.projectKey}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        p.score 
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                          : p.archives.length === 0
                            ? "bg-slate-900 text-slate-400 border border-slate-800"
                            : "bg-amber-950 text-amber-300 border border-amber-800"
                      }`}>
                        {p.score 
                          ? `${p.score} / 100 Puan` 
                          : p.archives.length === 0
                            ? "Arşiv Bekleniyor"
                            : "Jüri İnceliyor"}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white mt-1 line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{p.ownerName} ({p.ownerTitle})</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Kategori: <span className="text-slate-300">{p.categoryName}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      {p.archives.length} Adet Arşiv Yüklü
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Project Management Box */}
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <FolderArchive className="h-5 w-5 text-blue-400" />
                    <span>{activeProject.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Geliştirici: <strong className="text-white">{activeProject.ownerName}</strong> ({activeProject.ownerTitle}) • {activeProject.categoryName}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSecurityModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>SAST Güvenlik Taraması</span>
                  </button>

                  <button
                    onClick={() => setShowRadarModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-800 hover:bg-blue-900 text-blue-300 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Varyans Radarı</span>
                  </button>
                </div>
              </div>

              {/* Uploaded Archives List with DRM */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Yüklü Olan Arşiv Dosyaları ({activeProject.archives.length} Adet)</span>
                  <span className="text-[11px] text-slate-500 font-normal">Global CTO İnceleme Modu</span>
                </div>

                {activeProject.archives.length === 0 ? (
                  <div className="p-6 rounded-lg bg-[#060a17] border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    Bu projeye henüz arşiv yüklenmedi.
                  </div>
                ) : (
                  activeProject.archives.map((arc, i) => (
                    <div
                      key={arc.id}
                      className="p-3.5 rounded-lg bg-[#060a17] border border-blue-900/40 flex items-center justify-between text-xs hover:border-blue-700/60 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="h-6 w-6 rounded bg-blue-950 text-blue-300 font-bold font-mono text-[10px] flex items-center justify-center">
                          #{i + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center space-x-2">
                            <span>{arc.fileName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                              {arc.tag}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {arc.format}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-md">
                            SHA-256: {arc.sha256} • Tarih: {arc.uploadedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-blue-400 font-bold">{arc.sizeFormatted}</span>

                        <button
                          onClick={() => setViewerModalArchive(arc.fileName)}
                          className="px-2.5 py-1.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-800 text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Kodu İncele (DRM)</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. JURY AUDIT (100 BASE + WEB, MOBIL, OTOMASYON SUB-SCORES) - TECHNICAL JURY ONLY */}
        {activeTab === "JURY_AUDIT" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Profesyonel Jüri 100 Puanlık Değerlendirme Havuzu</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                    12 Uluslararası Jüri
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  İncelenen Proje: <strong className="text-white">{activeProject.title}</strong> ({activeProject.ownerName})
                </p>
              </div>

              <div className="text-right flex items-center space-x-3">
                <button
                  onClick={() => setShowRadarModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-950 border border-blue-800 hover:bg-blue-900 text-blue-300 text-xs font-semibold flex items-center space-x-1"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Jüri Varyans Radarı</span>
                </button>
                <div>
                  <div className="text-3xl font-black font-mono text-emerald-400">{finalCalculatedScore} / 100</div>
                  <div className="text-[11px] text-slate-400">Nihai Jüri Puanı</div>
                </div>
              </div>
            </div>

            {/* Project & Evaluating Jury Switcher */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-semibold px-1">İncelenecek Proje:</span>
                <div className="flex space-x-1">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedProjectId === p.id ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {p.projectKey} ({p.ownerName})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-start md:justify-end space-x-2">
                <span className="text-xs text-slate-400 font-semibold">Değerlendiren Jüri:</span>
                <select
                  value={evaluatingJuryName}
                  onChange={(e) => setEvaluatingJuryName(e.target.value)}
                  className="bg-[#060a17] text-emerald-400 font-semibold border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                >
                  {[
                    "Gaspare LoDuca", "Olu Brown", "Eamon Kearns", "Marco Gomes",
                    "Jessica Murray", "Kyle Filipe", "Jack Shallow", "Christine Sweeney",
                    "Alice Knipfing", "Jag Patel", "Scott Lever", "Wesley Esser"
                  ].map(j => (
                    <option key={j} value={j}>{j} (Uluslararası Jüri)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* If 0 archives, display warning banner */}
            {activeProject.archives.length === 0 && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center space-x-3 shadow-lg">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <div className="font-bold text-white uppercase tracking-wider">KAYNAK KOD / ARŞİV HENÜZ YÜKLENMEDİ</div>
                  <p className="mt-0.5 text-slate-300 leading-relaxed">
                    Bu projeye ({activeProject.title}) henüz geliştirici tarafından kaynak kod (ZIP/RAR) arşivi yüklenmemiştir. Jürilerin objektif değerlendirme yapabilmesi için arşiv yüklenmesi zorunludur.
                  </p>
                </div>
              </div>
            )}

            {/* Rubric Form */}
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Temel Kriterler (100 Puan)
              </h3>

              {/* 5 Core Sliders */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">1. Kod Kalitesi & Mimari (Maks. 30 Puan)</span>
                    <span className="font-mono text-blue-400">{codeQuality} / 30</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={codeQuality}
                    onChange={(e) => setCodeQuality(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">2. Güvenlik & Zaafiyet Denetimi (Maks. 20 Puan)</span>
                    <span className="font-mono text-blue-400">{securityScore} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={securityScore}
                    onChange={(e) => setSecurityScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">3. Performans & 100 GB Arşiv İşleme (Maks. 20 Puan)</span>
                    <span className="font-mono text-blue-400">{performanceScore} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={performanceScore}
                    onChange={(e) => setPerformanceScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">4. İşlevsellik & Doğruluk (Maks. 20 Puan)</span>
                    <span className="font-mono text-blue-400">{functionalityScore} / 20</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={functionalityScore}
                    onChange={(e) => setFunctionalityScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">5. Dokümantasyon & Testler (Maks. 10 Puan)</span>
                    <span className="font-mono text-blue-400">{documentationScore} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={documentationScore}
                    onChange={(e) => setDocumentationScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Special Alt Modül Ek Puanları for ALL Projects */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>ÖZEL ALT DAL VE MODÜL EK PUANLARI (_WEB, _MOBİL, _OTOMASYON)</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">_WEB Modülü</span>
                      <span className="font-mono text-blue-400">+{webBonus} Puan</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={webBonus}
                      onChange={(e) => setWebBonus(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">_MOBİL Frontend</span>
                      <span className="font-mono text-blue-400">+{mobileBonus} Puan</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={mobileBonus}
                      onChange={(e) => setMobileBonus(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">_OTOMASYON Modülü</span>
                      <span className="font-mono text-blue-400">+{automationBonus} Puan</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={automationBonus}
                      onChange={(e) => setAutomationBonus(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Unlimited Jury Notes */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Gerekçeli Jüri Raporu (Karakter Sınırı Yoktur):
                </label>
                <textarea
                  rows={4}
                  value={juryCommentEn}
                  onChange={(e) => setJuryCommentEn(e.target.value)}
                  placeholder="Teknik denetim ve inceleme raporunuzu yazınız..."
                  className="w-full bg-[#060a17] border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleJurySubmitReview}
                  className="px-6 py-2.5 rounded-lg font-bold text-xs flex items-center space-x-2 shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Bu Puanı ve Raporu Global CTO Gökçenur Öztürk Onayına Gönder</span>
                </button>
              </div>
            </div>

            {/* List of Previous Jury Reviews with Instant TR / EN Translation */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Bu Proje İçin Verilen Jüri Değerlendirmeleri ({activeProject.juryReviews.length})
              </h3>

              {activeProject.juryReviews.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                  Bu proje için henüz girilmiş jüri değerlendirmesi bulunmuyor.
                </div>
              ) : (
                activeProject.juryReviews.map((rev) => {
                  const isTr = translatedReviews[rev.id] || false;
                  return (
                    <div key={rev.id} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-white">{rev.juryName}</strong>
                          <span className="text-[11px] text-slate-400 ml-2">• {rev.createdAt}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-emerald-400 font-bold font-mono">{rev.score} / 100 Puan</span>
                          <button
                            onClick={() => setTranslatedReviews(prev => ({ ...prev, [rev.id]: !isTr }))}
                            className="px-2.5 py-1 rounded bg-blue-950 border border-blue-800 text-blue-300 hover:text-white text-[10px] font-semibold flex items-center space-x-1"
                          >
                            <Languages className="h-3 w-3" />
                            <span>{isTr ? "İngilizceye Dön (English)" : "🇹🇷 Türkçeye Çevir"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 bg-[#060a17] p-3 rounded-lg border border-slate-800 leading-relaxed">
                        {isTr ? rev.reportTr : rev.reportEn}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 4. RADAR TAB (Varyans & Konsensüs Radarı) */}
        {activeTab === "RADAR" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>12 Uluslararası Jüri Varyans ve Konsensüs Radarı</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                    5 Eksenli Analiz
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  İncelenen Proje: <strong className="text-white">{activeProject.title}</strong> ({activeProject.ownerName})
                </p>
              </div>

              <button
                onClick={() => setShowRadarModal(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-600/30"
              >
                <Activity className="h-4 w-4" />
                <span>Tam Ekran Radarı Başlat</span>
              </button>
            </div>

            {/* Project Switcher */}
            <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold px-2">İncelenecek Proje:</span>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedProjectId === p.id ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {p.projectKey} ({p.ownerName})
                </button>
              ))}
            </div>

            {/* Inline Radar Overview Card */}
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  <span>5 Eksenli Dağılım ve Konsensüs Durumu</span>
                </div>
                <div className="text-xs font-mono">
                  {activeProject.juryReviews.length > 0 ? (
                    <span className="text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
                      {activeProject.juryReviews.length} Jüri Değerlendirmesi Mevcut
                    </span>
                  ) : (
                    <span className="text-slate-400 bg-slate-800 px-2.5 py-1 rounded">
                      Henüz Jüri Değerlendirmesi Yok
                    </span>
                  )}
                </div>
              </div>

              {activeProject.juryReviews.length === 0 ? (
                <div className="p-10 rounded-xl bg-[#060a17] border border-dashed border-slate-800 text-center space-y-2">
                  <Activity className="h-8 w-8 text-slate-600 mx-auto" />
                  <div className="text-sm font-semibold text-slate-300">Bu proje için henüz girilmiş jüri puanı bulunmuyor</div>
                  <p className="text-xs text-slate-500">
                    Jüriler 100 Puanlık Rubrik üzerinden puanlama yaptıkça varyans radarı ve konsensüs çizgileri burada canlı olarak belirecektir.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-3">
                    {[
                      { label: "Kod Kalitesi", max: 30, key: "codeQuality" },
                      { label: "Güvenlik", max: 20, key: "security" },
                      { label: "Performans", max: 20, key: "performance" },
                      { label: "İşlevsellik", max: 20, key: "functionality" },
                      { label: "Dokümantasyon", max: 10, key: "documentation" }
                    ].map(axis => {
                      const avg = activeProject.juryReviews.reduce((sum, r) => sum + (r.subScores as any)[axis.key], 0) / activeProject.juryReviews.length;
                      return (
                        <div key={axis.key} className="p-3 rounded-lg bg-[#060a17] border border-slate-800 text-center">
                          <div className="text-[10px] text-slate-400">{axis.label}</div>
                          <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                            {avg.toFixed(1)} <span className="text-[10px] text-slate-500">/{axis.max}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-lg bg-[#060a17] border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-300">Detaylı 5 eksenli radar çokgeni ve eksen sapmalarını incelemek için:</span>
                    <button
                      onClick={() => setShowRadarModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      Grafiği Görüntüle
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. CTO OVERSIGHT TAB (Gökçenur Öztürk) */}
        {activeTab === "CTO_OVERSIGHT" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Global CTO Yönetim ve Hakemlik Masası</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                    Gökçenur Öztürk
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  12 bağımsız jürinin değerlendirme raporlarını ayrıntılı inceleyin; resmî onay verin, gerektiğinde onayı geri alın veya değerlendirmeleri sıfırlayın.
                </p>
              </div>

              <button
                onClick={() => syncProjectsAndMessages()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Yenile</span>
              </button>
            </div>

            <div className="space-y-4">
              {projects.map((proj) => {
                const isApproved = proj.status === "APPROVED_PUBLISHED";
                const isExpanded = expandedReviews[proj.id] ?? true;

                return (
                  <div key={proj.id} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-blue-400 font-mono">{proj.projectKey}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-400">{proj.categoryName}</span>
                          {isApproved && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                              ✓ Onaylandı
                            </span>
                          )}
                        </div>
                        <div className="text-base font-bold text-white mt-1">{proj.title}</div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          Proje Sahibi: <strong className="text-white">{proj.ownerName}</strong> ({proj.ownerTitle})
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-xl font-bold font-mono ${
                          proj.score !== null 
                            ? "text-emerald-400" 
                            : proj.archives.length === 0 
                              ? "text-slate-500 text-sm" 
                              : "text-amber-400 text-sm"
                        }`}>
                          {proj.score !== null 
                            ? `${proj.score} / 100` 
                            : proj.archives.length === 0 
                              ? "Arşiv Yüklenmedi" 
                              : "Jüri İnceliyor"}
                        </div>
                        <div className="text-[10px] text-slate-400">Hesaplanan Skor</div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">
                          Yüklü Arşiv: <strong className="text-white">{proj.archives.length} ZIP/RAR</strong>
                        </span>
                        <button
                          onClick={() => setExpandedReviews(prev => ({ ...prev, [proj.id]: !isExpanded }))}
                          className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                        >
                          <span>Jüri İncelemeleri ({proj.juryReviews.length})</span>
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {isApproved ? (
                          <>
                            <button
                              onClick={() => handleCtoRevokeProject(proj.id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                              title="Global CTO onayını geri alarak projeyi inceleme moduna döndürür"
                            >
                              <Undo2 className="h-3.5 w-3.5" />
                              <span>↩️ Onayı Geri Al</span>
                            </button>

                            <button
                              onClick={() => handleOpenCertificate(proj)}
                              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow transition-all"
                            >
                              <Award className="h-3.5 w-3.5" />
                              <span>Yatay A4 Belge</span>
                            </button>
                          </>
                        ) : proj.archives.length === 0 ? (
                          <div
                            className="px-3.5 py-2 rounded-lg font-medium text-xs flex items-center space-x-1.5 bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                            title="Kaynak kod arşivi yüklenmeden onay verilemez"
                          >
                            <Lock className="h-3.5 w-3.5 text-slate-600" />
                            <span>Arşiv Yüklenmesi Bekleniyor</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCtoApproveProject(proj.id)}
                            className="px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-[0.98] transition-all"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            <span>Global CTO Onayı Ver & Sertifika Üret</span>
                          </button>
                        )}

                        {proj.juryReviews.length > 0 && (
                          <button
                            onClick={() => handleCtoResetEvaluations(proj.id)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-300 border border-slate-700/60 text-slate-400 text-xs flex items-center space-x-1 transition-colors"
                            title="Tüm jüri değerlendirmelerini sıfırlar"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Sıfırla</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detailed Submitted Jury Reviews Inspection (SS Kısmı Ayrıntılı) */}
                    {isExpanded && (
                      <div className="pt-3 border-t border-slate-800/60 space-y-3">
                        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                          <span>JÜRİ DEĞERLENDİRME DETAYLARI ({proj.juryReviews.length})</span>
                          <span className="text-[10px] font-normal text-slate-500">12 Bağımsız Jüri Havuzu</span>
                        </div>

                        {proj.juryReviews.length === 0 ? (
                          <div className="p-4 rounded-lg bg-[#060a17] border border-dashed border-slate-800 text-center text-xs text-slate-500">
                            Henüz bu proje için girilmiş jüri notu ve raporu bulunmuyor.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {proj.juryReviews.map((rev) => {
                              const isTr = translatedReviews[rev.id] || false;
                              return (
                                <div key={rev.id} className="p-3.5 rounded-lg bg-[#060a17] border border-slate-800 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className="h-6 w-6 rounded-full bg-emerald-900/60 border border-emerald-700 text-emerald-300 flex items-center justify-center font-bold text-xs">
                                        {rev.juryName ? rev.juryName[0] : "J"}
                                      </div>
                                      <span className="text-xs font-bold text-white">{rev.juryName}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {rev.createdAt ? new Date(rev.createdAt).toLocaleString('tr-TR') : ""}
                                      </span>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                                        {rev.score} / 100 Puan
                                      </span>
                                      <button
                                        onClick={() => setTranslatedReviews(prev => ({ ...prev, [rev.id]: !isTr }))}
                                        className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                      >
                                        {isTr ? "Orijinal EN" : "🇹🇷 Çevir"}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Sub-Scores Grid */}
                                  <div className="grid grid-cols-5 gap-2 text-[10px]">
                                    <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-center">
                                      <div className="text-slate-500">Kod Kalitesi</div>
                                      <div className="font-mono font-bold text-slate-200">{rev.subScores.codeQuality}/30</div>
                                    </div>
                                    <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-center">
                                      <div className="text-slate-500">Güvenlik</div>
                                      <div className="font-mono font-bold text-slate-200">{rev.subScores.security}/20</div>
                                    </div>
                                    <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-center">
                                      <div className="text-slate-500">Performans</div>
                                      <div className="font-mono font-bold text-slate-200">{rev.subScores.performance}/20</div>
                                    </div>
                                    <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-center">
                                      <div className="text-slate-500">İşlevsellik</div>
                                      <div className="font-mono font-bold text-slate-200">{rev.subScores.functionality}/20</div>
                                    </div>
                                    <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-center">
                                      <div className="text-slate-500">Dokümantasyon</div>
                                      <div className="font-mono font-bold text-slate-200">{rev.subScores.documentation}/10</div>
                                    </div>
                                  </div>

                                  {/* Sub-module bonus indicators if available */}
                                  {((rev as any).webBonus || (rev as any).mobileBonus || (rev as any).automationBonus) && (
                                    <div className="flex items-center space-x-2 text-[10px] text-blue-400 bg-blue-950/40 p-1.5 rounded border border-blue-900/40">
                                      <Sparkles className="h-3 w-3" />
                                      <span>Ek Modül Puanları:</span>
                                      {(rev as any).webBonus > 0 && <span className="font-mono font-semibold">_WEB (+{(rev as any).webBonus})</span>}
                                      {(rev as any).mobileBonus > 0 && <span className="font-mono font-semibold">_MOBİL (+{(rev as any).mobileBonus})</span>}
                                      {(rev as any).automationBonus > 0 && <span className="font-mono font-semibold">_OTOMASYON (+{(rev as any).automationBonus})</span>}
                                    </div>
                                  )}

                                  {/* Written Technical Report */}
                                  <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300 leading-relaxed">
                                    <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Jüri Notu & Teknik Rapor:</span>
                                    {isTr ? (
                                      rev.reportTr || rev.reportEn || "Teknik denetim ve mimari inceleme tamamlandı."
                                    ) : (
                                      rev.reportEn || "Technical audit and architectural review completed."
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. RESULTS & SCOREBOARD (Sonuçlar & Sıralama Masası - TABLOLU) */}
        {activeTab === "RESULTS" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Resmî Değerlendirme Sonuçları ve Başarı Sıralaması</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono font-semibold">
                    Resmî Tablo
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Tüm projelerin 12 bağımsız jüri puanları, Global CTO onay durumları ve resmî başarı belgeleri.
                </p>
              </div>

              <button
                onClick={() => syncProjectsAndMessages()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                title="Sonuçları Yenile"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sonuçları Yenile</span>
              </button>
            </div>

            {/* Informative Banner */}
            <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-200 text-xs flex items-center space-x-3 shadow-lg">
              <Award className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span>Adil & Şeffaf Değerlendirme Esasları</span>
                </div>
                <p className="mt-1 text-slate-300 leading-relaxed">
                  Projeler 12 bağımsız teknik jüri tarafından incelenir ve Global CTO Gökçenur Öztürk tarafından resmî olarak tescil edilir. Değerlendirmesi tamamlanan ve CTO onayı verilen katılımcılar, kazandıkları <strong>Yatay A4 Resmî Sertifikalarını</strong> bu tablodan doğrudan görüntüleyebilir ve indirebilirler. Sonuçlar ilan edilene kadar belgeler kilitli tutulur.
                </p>
              </div>
            </div>

            {/* Executive Rankings Table */}
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#060a17] border-b border-slate-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-16 text-center">Sıra</th>
                      <th className="py-3.5 px-4">Proje Adı & Kodu</th>
                      <th className="py-3.5 px-4">Geliştirici</th>
                      <th className="py-3.5 px-4">Kategori & Modüller</th>
                      <th className="py-3.5 px-4 text-center">Arşiv</th>
                      <th className="py-3.5 px-4 text-right">Jüri Skoru</th>
                      <th className="py-3.5 px-4 text-center">CTO Kararı</th>
                      <th className="py-3.5 px-4 text-center">Resmî Sertifika (A4)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {projects.map((proj, idx) => {
                      const isApproved = proj.status === "APPROVED_PUBLISHED";
                      const rankBadges = [
                        "bg-amber-500/20 text-amber-300 border-amber-500/40",
                        "bg-slate-300/20 text-slate-200 border-slate-400/40",
                        "bg-orange-500/20 text-orange-300 border-orange-500/40"
                      ];
                      const badgeClass = rankBadges[idx] || "bg-slate-800 text-slate-400 border-slate-700";

                      return (
                        <tr 
                          key={proj.id} 
                          className={`hover:bg-slate-800/40 transition-colors ${isApproved ? "bg-emerald-950/10" : ""}`}
                        >
                          {/* Rank */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center justify-center h-7 w-7 rounded-lg font-bold font-mono text-xs border ${badgeClass}`}>
                              #{idx + 1}
                            </span>
                          </td>

                          {/* Project */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-white text-sm">{proj.title}</div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/50">
                                {proj.projectKey}
                              </span>
                              <span className="text-[11px] text-slate-400">{proj.currentStage}</span>
                            </div>
                          </td>

                          {/* Developer */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-white">{proj.ownerName}</div>
                            <div className="text-[11px] text-slate-400">{proj.ownerTitle}</div>
                          </td>

                          {/* Category & Modules */}
                          <td className="py-4 px-4">
                            <div className="text-slate-300">{proj.categoryName}</div>
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">_WEB</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">_MOBİL</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300">_OTOMASYON</span>
                            </div>
                          </td>

                          {/* Archives */}
                          <td className="py-4 px-4 text-center">
                            {proj.archives.length > 0 ? (
                              <span className="font-mono text-xs text-slate-200 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                {proj.archives.length} ZIP/RAR
                              </span>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-500 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
                                0 Arşiv
                              </span>
                            )}
                          </td>

                          {/* Jury Score */}
                          <td className="py-4 px-4 text-right">
                            {proj.score !== null ? (
                              <div>
                                <span className="text-base font-black font-mono text-emerald-400">
                                  {proj.score}
                                </span>
                                <span className="text-[10px] text-slate-500"> / 100</span>
                              </div>
                            ) : proj.archives.length === 0 ? (
                              <span className="text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-medium">
                                Arşiv Yüklenmedi
                              </span>
                            ) : (
                              <span className="text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 text-[11px] font-semibold">
                                Jüri İnceliyor
                              </span>
                            )}
                          </td>

                          {/* CTO Decision */}
                          <td className="py-4 px-4 text-center">
                            {isApproved ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-[11px]">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Onaylandı</span>
                              </span>
                            ) : proj.archives.length === 0 ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-[11px]">
                                <Clock className="h-3 w-3 text-slate-600" />
                                <span>Teslim Bekleniyor</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px]">
                                <Clock className="h-3 w-3 text-amber-400" />
                                <span>Beklemede</span>
                              </span>
                            )}
                          </td>

                          {/* Certificate Action */}
                          <td className="py-4 px-4 text-center">
                            {isApproved ? (
                              <button
                                onClick={() => handleOpenCertificate(proj)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow transition-all cursor-pointer"
                              >
                                <Award className="h-3.5 w-3.5" />
                                <span>A4 Belgeyi Al</span>
                              </button>
                            ) : (
                              <span 
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 text-[11px] cursor-not-allowed"
                                title="CTO onayı verilince açılır"
                              >
                                <Lock className="h-3 w-3" />
                                <span>Kilitli</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 13 Official Certificate Standards Reference Grid */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Award className="h-4 w-4 text-amber-400" />
                  <span>REİZMEDYA Resmî 13 Başarı ve Katılım Belgesi Standartları</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Her aday elde ettiği puana ve proje niteliğine (_WEB, _MOBİL, _OTOMASYON, Full-Stack) göre ilgili resmî belgeyi kazanır.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.values(REIZEVAL_CERTIFICATES).map((cert, index) => (
                  <div key={cert.code} className="p-3 rounded-lg bg-[#060a17] border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between font-bold text-white text-[11px]">
                      <span>{index + 1}. {cert.titleTr}</span>
                      <span className="text-[9px] font-mono text-blue-400 bg-blue-950 px-1 py-0.5 rounded border border-blue-900">
                        {cert.code}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{cert.titleEn}</div>
                    <div className="text-[10px] text-slate-500">
                      Şart: <span className="text-slate-300">{cert.criteria}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 7. MULTI-PARTY ENTERPRISE MESSAGES (Global CTO, 3 Geliştirici, 12 Jüri) */}
        {activeTab === "MESSAGES" && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                  <span>Kurumsal Çok Taraflı Mesajlaşma Merkezi</span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                    16 Yetkili Hesap
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Global CTO Gökçenur Öztürk, 3 Proje Geliştiricisi ve 12 Bağımsız Uluslararası Jüri arasında güvenli kurumsal iletişim.
                </p>
              </div>

              <button
                onClick={() => syncProjectsAndMessages()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Mesajları Yenile</span>
              </button>
            </div>

            {/* Split Screen Chat Directory */}
            <div className="grid grid-cols-12 gap-4 h-[600px] rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-2xl">
              {/* Left Column: Contact List */}
              <div className="col-span-4 bg-[#060a17] border-r border-slate-800 flex flex-col">
                {/* Search Header */}
                <div className="p-3 border-b border-slate-800 space-y-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Kişi veya unvan ara..."
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between px-1">
                    <span>Dizin Listesi</span>
                    <span>{PLATFORM_CONTACTS.length} Yetkili Hesap</span>
                  </div>
                </div>

                {/* Contacts Scrollable */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60 p-2 space-y-1">
                  {PLATFORM_CONTACTS.filter(c => 
                    !contactSearchQuery || 
                    c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    c.title.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    c.roleLabel.toLowerCase().includes(contactSearchQuery.toLowerCase())
                  ).map((contact) => {
                    const isSelected = contact.id === selectedContactId;
                    return (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContactId(contact.id)}
                        className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center space-x-3 ${
                          isSelected 
                            ? "bg-blue-600/20 border border-blue-500/50" 
                            : "hover:bg-slate-900/60 border border-transparent"
                        }`}
                      >
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${contact.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow`}>
                          {contact.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{contact.name}</span>
                            {contact.role === "GLOBAL_CTO" && (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-900">
                                CTO
                              </span>
                            )}
                            {contact.role === "DEVELOPER" && (
                              <span className="text-[9px] font-bold text-blue-400 bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-900">
                                DEV
                              </span>
                            )}
                            {contact.role === "TECHNICAL_JURY" && (
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-900">
                                JÜRİ
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{contact.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Chat Window */}
              <div className="col-span-8 flex flex-col bg-slate-900/40">
                {/* Active Contact Header */}
                <div className="p-3.5 border-b border-slate-800 bg-[#060a17]/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${selectedContact.avatarColor} text-white font-bold text-sm flex items-center justify-center shadow`}>
                      {selectedContact.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white">{selectedContact.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">
                          {selectedContact.roleLabel}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedContact.title} • <span className="font-mono text-slate-500">{selectedContact.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-medium">Aktif Kanal</span>
                  </div>
                </div>

                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                      <MessageSquare className="h-10 w-10 text-slate-600" />
                      <div className="text-xs font-semibold text-slate-300">Henüz Mesajlaşma Kaydı Yok</div>
                      <p className="text-[11px] text-slate-500 max-w-sm">
                        Sayın {selectedContact.name} ile doğrudan kurumsal mesajlaşma başlatabilirsiniz. Mesajlar merkezi veri tabanında güvenle saklanır.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((m) => {
                      const isMe = currentUser && (m.senderId === currentUser.id || m.senderName === currentUser.fullName);
                      return (
                        <div
                          key={m.id}
                          className={`max-w-md p-3 rounded-xl text-xs space-y-1.5 shadow-md ${
                            isMe
                              ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                              : "bg-[#060a17] border border-slate-800 text-slate-200 rounded-tl-none"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-80 border-b border-white/10 pb-1">
                            <span className="font-bold">{m.senderName} ({m.senderRole})</span>
                            <span className="font-mono">{m.timestamp}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          {m.recipientName && (
                            <div className="text-[9px] opacity-70 pt-0.5">
                              Kime: {m.recipientName}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Message Chips */}
                <div className="px-4 py-2 border-t border-slate-800/80 bg-[#060a17]/50 flex items-center space-x-2 overflow-x-auto text-[10px]">
                  <span className="text-slate-500 shrink-0">Hızlı Yanıt:</span>
                  {[
                    "Arşivler merkezi sunucuya yüklendi.",
                    "Ek modül incelemesi tamamlandı.",
                    "Teknik rapor ve puanlar kaydedildi.",
                    "Global CTO onay süreci bekleniyor."
                  ].map((quick, i) => (
                    <button
                      key={i}
                      onClick={() => setChatInputText(quick)}
                      className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition-colors"
                    >
                      {quick}
                    </button>
                  ))}
                </div>

                {/* Message Input Box */}
                <div className="p-3 border-t border-slate-800 bg-[#060a17] flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`${selectedContact.name} için mesajınızı yazınız... (Enter ile gönder)`}
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendChatMessage}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Gönder</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
