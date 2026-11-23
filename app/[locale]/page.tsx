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
  Cpu
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { REIZEVAL_CERTIFICATES, determineCertificateForProject } from "@/lib/certificates";
import { LandscapeA4Certificate } from "@/components/certificates/LandscapeA4Certificate";

import { InAppArchiveViewer } from "@/components/code-viewer/InAppArchiveViewer";
import { SecurityAuditScanner } from "@/components/security/SecurityAuditScanner";
import { RadarVarianceChart } from "@/components/jury/RadarVarianceChart";

type ActiveTab = "PROJECTS" | "JURY_AUDIT" | "CTO_OVERSIGHT" | "MESSAGES" | "CERTIFICATES";

interface ProjectItem {
  id: string;
  projectKey: "PROJE_1" | "PROJE_2" | "PROJE_3";
  title: string;
  categoryName: string;
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

export default function ReizevalDesktopApp() {
  // Current Logged in User
  const [currentUser, setCurrentUser] = useState<any>({
    id: "RZV-EXE-001",
    fullName: "Mustafa Çoban",
    email: "mustafa.coban@reizeval",
    role: "DEVELOPER",
    title: "Kurucu / CEO"
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("PROJECTS");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Certificate Modal State
  const [activeCertData, setActiveCertData] = useState<any | null>(null);

  // World-Class Security & In-App Viewer Modals
  const [viewerModalArchive, setViewerModalArchive] = useState<string | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showRadarModal, setShowRadarModal] = useState<boolean>(false);

  // 3 Distinct Projects (PROJE_1, PROJE_2, PROJE_3)
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: "p1-temel-web",
      projectKey: "PROJE_1",
      title: "REIZEVAL — Kurumsal Masaüstü Platformu (PROJE_1)",
      categoryName: "Temel Web Mimarisi (Bağımsız Değerlendirme)",
      ownerName: "Mustafa Çoban",
      ownerTitle: "Kurucu / CEO",
      currentStage: "INDEPENDENT",
      status: "READY_FOR_JURY",
      score: null,
      archives: [
        {
          id: "arc-p1-1",
          fileName: "Temel-Web-Frontend.zip",
          sizeFormatted: "128.50 MB",
          format: "ZIP",
          tag: "_WEB",
          sha256: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
          uploadedAt: "2026-11-21 10:00"
        }
      ],
      juryReviews: []
    },
    {
      id: "p2-kademeli",
      projectKey: "PROJE_2",
      title: "REIZ Omni-Channel Deneyim & Güvenlik Mimarisi (PROJE_2 — V1, V2, V3 Full-Stack)",
      categoryName: "Kademeli Sistem (_WEB, _MOBİL, _OTOMASYON)",
      ownerName: "Hülya Bulut",
      ownerTitle: "CXO & CTO Yardımcısı",
      currentStage: "V3_FULL_STACK",
      status: "READY_FOR_JURY",
      score: null,
      archives: [
        {
          id: "arc-p2-v1",
          fileName: "V1_Frontend_Arayuz_WEB.zip",
          sizeFormatted: "340.00 MB",
          format: "ZIP",
          tag: "_WEB",
          sha256: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
          uploadedAt: "2026-11-22 11:30"
        },
        {
          id: "arc-p2-v2",
          fileName: "V2_Backend_Database_MOBIL.zip",
          sizeFormatted: "850.00 MB",
          format: "ZIP",
          tag: "_MOBIL",
          sha256: "f4c3b2a10987654321fedcba0987654321fedcba0987654321fedcba09876543",
          uploadedAt: "2026-11-22 13:00"
        },
        {
          id: "arc-p2-v3",
          fileName: "V3_FullStack_Final_OTOMASYON.rar",
          sizeFormatted: "1.45 GB",
          format: "RAR",
          tag: "_OTOMASYON",
          sha256: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
          uploadedAt: "2026-11-23 09:15"
        }
      ],
      juryReviews: []
    },
    {
      id: "p3-python-otomasyon",
      projectKey: "PROJE_3",
      title: "REIZ Akademi & Global Jüri Ekosistemi (PROJE_3 — Python Otomasyon)",
      categoryName: "Python Otomasyon & Bot Mimarisi (Bağımsız Değerlendirme)",
      ownerName: "Mustafa Dalerdem",
      ownerTitle: "CIO / Akademi ve Ekosistem Başkanı",
      currentStage: "INDEPENDENT",
      status: "READY_FOR_JURY",
      score: null,
      archives: [
        {
          id: "arc-p3-1",
          fileName: "Python_Otomasyon_Scriptleri_OTOMASYON.zip",
          sizeFormatted: "410.20 MB",
          format: "ZIP",
          tag: "_OTOMASYON",
          sha256: "f0e1d2c3b4a5968778695a4b3c2d1e0f0e1d2c3b4a5968778695a4b3c2d1e0f0",
          uploadedAt: "2026-11-22 15:45"
        }
      ],
      juryReviews: []
    }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("p2-kademeli");
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Translation Toggle state for Jury reviews
  const [translatedReviews, setTranslatedReviews] = useState<Record<string, boolean>>({});

  // 1-on-1 Private Messages State
  const [selectedJuryForChat, setSelectedJuryForChat] = useState("Gaspare LoDuca");
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "cm-1",
      senderName: "Mustafa Çoban",
      juryName: "Gaspare LoDuca",
      content: "Merhaba Sayın LoDuca, PROJE_2 için V3 Full-Stack arşivini ekledim, _MOBİL ve _OTOMASYON klasörlerini inceleyebilirsiniz.",
      timestamp: "10:15",
      isFromDeveloper: true
    },
    {
      id: "cm-2",
      senderName: "Gaspare LoDuca",
      juryName: "Gaspare LoDuca",
      content: "Hello Mustafa, I received the archives. I am checking the _MOBİL frontend and database connections right now. The structure looks very solid.",
      timestamp: "10:22",
      isFromDeveloper: false
    }
  ]);
  const [chatInputText, setChatInputText] = useState("");
  const [activeApiUrl, setActiveApiUrl] = useState<string>("https://reizeval-api.onrender.com");

  useEffect(() => {
    setActiveApiUrl(apiClient.getBaseUrl());
  }, []);

  // Real-time synchronization loop across network / multi-computer
  useEffect(() => {
    let isMounted = true;
    const syncProjectsAndMessages = async () => {
      try {
        const res = await apiClient.getProjects();
        if (isMounted && res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setProjects(prev => prev.map(localP => {
            const remoteP = res.data.find((r: any) => r.id === localP.id || r.ownerId === localP.id);
            if (remoteP) {
              return {
                ...localP,
                status: remoteP.status || localP.status,
                score: remoteP.evaluations && remoteP.evaluations.length > 0
                  ? remoteP.evaluations[remoteP.evaluations.length - 1].totalScore
                  : localP.score,
                archives: remoteP.archives && remoteP.archives.length > 0
                  ? remoteP.archives
                  : localP.archives
              };
            }
            return localP;
          }));
        }

        // Sync messages for active project
        const msgRes = await apiClient.getMessages(selectedProjectId);
        if (isMounted && msgRes && msgRes.data && Array.isArray(msgRes.data) && msgRes.data.length > 0) {
          setChatMessages(msgRes.data.map((m: any) => ({
            id: m.id,
            senderName: m.senderName,
            juryName: selectedJuryForChat,
            content: m.content,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isFromDeveloper: m.senderRole === "DEVELOPER"
          })));
        }
      } catch {
        // Graceful fallback to local state if offline
      }
    };

    syncProjectsAndMessages();
    const interval = setInterval(syncProjectsAndMessages, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedProjectId, selectedJuryForChat]);

  // Jury Rubric Grading State (100 Base + Sub-module Extra Scores)
  const [codeQuality, setCodeQuality] = useState(28); // 30
  const [securityScore, setSecurityScore] = useState(19); // 20
  const [performanceScore, setPerformanceScore] = useState(19); // 20
  const [functionalityScore, setFunctionalityScore] = useState(19); // 20
  const [documentationScore, setDocumentationScore] = useState(9); // 10
  
  // PROJE_2 Specific Extra Sub-scores:
  const [webBonus, setWebBonus] = useState(8); // max 10
  const [mobileBonus, setMobileBonus] = useState(9); // max 10
  const [automationBonus, setAutomationBonus] = useState(8); // max 10

  const [juryCommentEn, setJuryCommentEn] = useState(
    "The staged development (V1, V2, V3) was executed flawlessly. The extra _MOBİL frontend and _OTOMASYON scripts add substantial value to the full stack suite."
  );

  const baseTotalScore = codeQuality + securityScore + performanceScore + functionalityScore + documentationScore;
  const finalCalculatedScore = activeProject.projectKey === "PROJE_2"
    ? Math.min(100, Math.round(baseTotalScore * 0.8 + ((webBonus + mobileBonus + automationBonus) / 30) * 20))
    : baseTotalScore;

  // Profile Switcher
  const switchProfile = (roleKey: string) => {
    if (roleKey === "coban") {
      setCurrentUser({ id: "RZV-EXE-001", fullName: "Mustafa Çoban", email: "mustafa.coban@reizeval", role: "DEVELOPER", title: "Kurucu / CEO" });
      setSelectedProjectId("p1-temel-web");
      setActiveTab("PROJECTS");
    } else if (roleKey === "bulut") {
      setCurrentUser({ id: "RZV-EXE-002", fullName: "Hülya Bulut", email: "hulya.bulut@reizeval", role: "DEVELOPER", title: "CXO & CTO Yardımcısı" });
      setSelectedProjectId("p2-kademeli");
      setActiveTab("PROJECTS");
    } else if (roleKey === "dalerdem") {
      setCurrentUser({ id: "RZV-EXE-003", fullName: "Mustafa Dalerdem", email: "mustafa.dalerdem@reizeval", role: "DEVELOPER", title: "CIO / Akademi ve Ekosistem Başkanı" });
      setSelectedProjectId("p3-python-otomasyon");
      setActiveTab("PROJECTS");
    } else if (roleKey === "cto") {
      setCurrentUser({ id: "RZV-CTO-001", fullName: "Gökçenur Öztürk", email: "gokcenurozturk@reizeval@gmail.com", role: "GLOBAL_CTO", title: "Global CTO & Sistem Yöneticisi" });
      setActiveTab("CTO_OVERSIGHT");
    } else if (roleKey === "jury1") {
      setCurrentUser({ id: "RZV-JURY-001", fullName: "Gaspare LoDuca", email: "gaspare.loduca@reizeval", role: "TECHNICAL_JURY", title: "Uluslararası Teknik Jüri" });
      setActiveTab("JURY_AUDIT");
    }
  };

  // Upload ZIP / WinRAR
  const handleAddNewArchive = async () => {
    const format: "ZIP" | "RAR" = activeProject.archives.length % 2 === 0 ? "ZIP" : "RAR";
    const tag: "_WEB" | "_MOBIL" | "_OTOMASYON" = activeProject.archives.length === 0 ? "_WEB" : activeProject.archives.length === 1 ? "_MOBIL" : "_OTOMASYON";
    const newArc = {
      id: "arc-" + Date.now(),
      fileName: `${activeProject.projectKey}_Paket_${activeProject.archives.length + 1}${tag}.${format.toLowerCase()}`,
      sizeFormatted: `${(Math.random() * 6 + 1.2).toFixed(2)} GB`,
      format,
      tag,
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      uploadedAt: "Bugün 11:30"
    };

    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          status: "READY_FOR_JURY",
          archives: [...p.archives, newArc]
        };
      }
      return p;
    }));

    // Dispatch to Central API for remote computers
    apiClient.uploadMultiArchives(activeProject.id, [{
      fileName: newArc.fileName,
      fileSizeBytes: 1024 * 1024 * 500,
      sizeFormatted: newArc.sizeFormatted,
      sha256: newArc.sha256,
      format: newArc.format,
      category: 'SOURCE_CODE'
    }]).catch(console.warn);

    setStatusMessage(`Yeni arşiv (${newArc.fileName}) başarıyla eklendi ve tüm jürilere iletildi!`);
  };

  // Delete Archive
  const handleDeleteArchive = (arcId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          archives: p.archives.filter(a => a.id !== arcId)
        };
      }
      return p;
    }));
    setStatusMessage("Arşiv başarıyla silindi.");
  };

  // Jury Submits Evaluation (Strict Anti-Tamper RBAC)
  const handleJurySubmitReview = () => {
    if (currentUser.role === "DEVELOPER") {
      setStatusMessage("YETKİSİZ İŞLEM (403 Forbidden): Geliştirici veya Şirket CEOsu dahi olsa jüri puanlarına müdahale edemez veya puan veremez!");
      return;
    }

    const newRev = {
      id: "rev-" + Date.now(),
      juryName: currentUser.fullName,
      score: finalCalculatedScore,
      subScores: {
        codeQuality,
        security: securityScore,
        performance: performanceScore,
        functionality: functionalityScore,
        documentation: documentationScore,
        webBonus: activeProject.projectKey === "PROJE_2" ? webBonus : undefined,
        mobileBonus: activeProject.projectKey === "PROJE_2" ? mobileBonus : undefined,
        automationBonus: activeProject.projectKey === "PROJE_2" ? automationBonus : undefined,
      },
      reportEn: juryCommentEn,
      reportTr: "Kademeli geliştirme (V1, V2, V3) kusursuz tamamlanmış. Ek olarak sağlanan _MOBİL ve _OTOMASYON klasörleri projeye yüksek değer katmış.",
      createdAt: "Bugün 11:45"
    };

    setProjects(prev => prev.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          status: "PENDING_CTO_APPROVAL",
          score: finalCalculatedScore,
          juryReviews: [...p.juryReviews, newRev]
        };
      }
      return p;
    }));

    // Dispatch to Central API
    apiClient.submitEvaluation(activeProject.id, {
      codeQualityScore: codeQuality,
      securityScore,
      performanceScore,
      functionalityScore,
      documentationScore,
      technicalReport: juryCommentEn,
      juryId: currentUser.id,
      juryName: currentUser.fullName
    }).catch(console.warn);

    setStatusMessage(`${activeProject.title} projesine ${finalCalculatedScore}/100 puan verildi ve Global CTO Gökçenur Öztürk onayına sunuldu!`);
  };

  // CTO Approval (Strict RBAC: Only Global CTO Gökçenur Öztürk can approve!)
  const handleCtoApproveProject = (projId: string) => {
    if (currentUser.role !== "GLOBAL_CTO") {
      setStatusMessage("YETKİSİZ İŞLEM (403 Forbidden): Belge ve nihai puan onay yetkisi yalnızca Global CTO Gökçenur Öztürk yetkisindedir. Şirket CEOsu onay veremez.");
      return;
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          status: "APPROVED_PUBLISHED",
          score: p.score || 96
        };
      }
      return p;
    }));

    apiClient.approveEvaluation(`eval-${projId}`).catch(console.warn);

    setStatusMessage("Global CTO Gökçenur Öztürk projeyi resmî olarak onayladı ve Başarı Belgesi hak edildi!");
  };

  // Send 1-on-1 message to jury
  const handleSendChatMessage = () => {
    if (!chatInputText.trim()) return;
    const content = chatInputText;
    setChatMessages(prev => [
      ...prev,
      {
        id: "cm-" + Date.now(),
        senderName: currentUser.fullName,
        juryName: selectedJuryForChat,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromDeveloper: currentUser.role === "DEVELOPER"
      }
    ]);
    setChatInputText("");

    apiClient.sendMessage(activeProject.id, {
      content,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role
    }).catch(console.warn);
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
          juriesData={[
            {
              name: "Gaspare LoDuca",
              totalScore: activeProject.score || 95,
              scores: { codeQuality: 29, security: 20, performance: 19, functionality: 19, documentation: 8 }
            },
            {
              name: "Olu Brown",
              totalScore: (activeProject.score || 95) - 3,
              scores: { codeQuality: 27, security: 19, performance: 18, functionality: 19, documentation: 9 }
            }
          ]}
          onClose={() => setShowRadarModal(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside className="w-72 bg-[#0a1128] border-r border-blue-900/40 flex flex-col justify-between p-4 select-none">
        <div className="space-y-4">
          {/* Active Profile Box */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-blue-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Aktif Yetki</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div>
              <div className="font-bold text-white text-sm truncate">{currentUser.fullName}</div>
              <div className="text-[11px] text-blue-400 font-mono truncate">{currentUser.email}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.title}</div>
            </div>

            {/* Quick Profile Switcher */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-medium">Yetki Değiştir (Test):</div>
              <select
                onChange={(e) => switchProfile(e.target.value)}
                className="w-full bg-[#060a17] text-slate-200 border border-slate-700 rounded p-1.5 text-[11px] focus:outline-none"
              >
                <option value="coban">Mustafa Çoban (Kurucu / CEO)</option>
                <option value="bulut">Hülya Bulut (CXO & CTO Yrd.)</option>
                <option value="dalerdem">Mustafa Dalerdem (CIO / Akademi Bşk.)</option>
                <option value="cto">Gökçenur Öztürk (Global CTO & Admin)</option>
                <option value="jury1">Gaspare LoDuca (Uluslararası Jüri)</option>
              </select>
            </div>
          </div>

          {/* Dual-Engine Central API & Tunnel Network Status */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-900/50 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center space-x-1">
                <Globe2 className="h-3 w-3 text-cyan-400" />
                <span>Merkezi Ağ Köprüsü</span>
              </span>
              <span className={`h-2 w-2 rounded-full ${
                activeApiUrl.includes('127.0.0.1') || activeApiUrl.includes('localhost') 
                  ? 'bg-blue-400' 
                  : activeApiUrl.includes('ngrok') 
                    ? 'bg-amber-400' 
                    : 'bg-emerald-400'
              } animate-pulse`} />
            </div>

            <div className="text-[10px] font-mono text-slate-300 truncate bg-[#060a17] p-1.5 rounded border border-slate-800" title={activeApiUrl}>
              {activeApiUrl}
            </div>

            <button
              onClick={() => {
                const nextUrl = window.prompt(
                  "Merkezi Bulut API veya Güvenli Tünel adresini giriniz:\n(Örn: https://reizeval-api.onrender.com veya https://xxxx.ngrok-free.app veya http://127.0.0.1:4000):",
                  activeApiUrl
                );
                if (nextUrl !== null) {
                  const cleaned = nextUrl.trim();
                  apiClient.setBaseUrl(cleaned || null);
                  const updated = apiClient.getBaseUrl();
                  setActiveApiUrl(updated);
                  setStatusMessage(`Merkezi API sunucu adresi başarıyla güncellendi: ${updated}`);
                }
              }}
              className="w-full text-center py-1 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold border border-slate-700 transition-colors flex items-center justify-center space-x-1"
            >
              <Settings className="h-3 w-3" />
              <span>Ağ / Sunucu Değiştir</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Çalışma Ekranları
            </div>
            {[
              { tab: "PROJECTS", label: "Projeler & ZIP/RAR", icon: FolderArchive, badge: "3 Proje" },
              { tab: "JURY_AUDIT", label: "100 Puanlık Rubrik", icon: Sliders, badge: "12 Jüri" },
              { tab: "CTO_OVERSIGHT", label: "Global CTO Masası", icon: ShieldCheck, badge: "Gökçenur Öztürk" },
              { tab: "MESSAGES", label: "Jüriye Özelden Mesaj", icon: MessageSquare, badge: "Birebir" },
              { tab: "CERTIFICATES", label: "Yatay A4 Sertifikalar", icon: Award, badge: "13 Resmî Tür" },
            ].map((item) => {
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
            })}
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

        {/* 1. PROJECTS TAB (PROJE_1, PROJE_2, PROJE_3 + ZIP UPLOAD & DELETE) */}
        {activeTab === "PROJECTS" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Proje Yönetimi, Çoklu ZIP Yükleme ve Silme Masası</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                  100 GB Kapasite
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Kullanıcılar arşivleri yükleyebilir, silebilir ve jürilerin verdiği puanları canlı olarak takip edebilir.
              </p>
            </div>

            {/* 3 Project Cards */}
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
                        p.score ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-slate-800 text-slate-400"
                      }`}>
                        {p.score ? `${p.score} / 100 Puan` : "Değerlendiriliyor"}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white mt-1 line-clamp-1">{p.title}</div>
                    <div className="text-[11px] text-slate-300 mt-0.5">{p.ownerName} ({p.ownerTitle})</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Kategori: <span className="text-slate-300">{p.categoryName}</span>
                    </div>

                    {p.score && (
                      <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
                        <span className="text-emerald-400 font-semibold">Onaylandı</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCertificate(p);
                          }}
                          className="text-amber-400 hover:text-amber-300 font-bold underline flex items-center space-x-1"
                        >
                          <Award className="h-3 w-3" />
                          <span>Yatay A4 Belge</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active Project Management Box */}
            <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <FolderArchive className="h-5 w-5 text-blue-400" />
                    <span>{activeProject.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Geliştirici: <strong className="text-white">{activeProject.ownerName}</strong> • {activeProject.categoryName}
                  </p>
                </div>

                {/* Upload Action & World-Class Tools */}
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
                    <Sliders className="h-3.5 w-3.5" />
                    <span>5 Eksenli Varyans Radarı</span>
                  </button>

                  <button
                    onClick={handleAddNewArchive}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Windows Gezgini'nden Arşiv Ekle</span>
                  </button>
                </div>
              </div>

              {/* Special Kademeli & Alt Modül Info (If PROJE_2) */}
              {activeProject.projectKey === "PROJE_2" && (
                <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-800/40 space-y-2 text-xs">
                  <div className="font-bold text-blue-300 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>PROJE_2 Kademeli ve Alt Modül Şartnamesi:</span>
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
                    * Alt Dallar ve Ek Puanlar: Klasörler içinde <code className="bg-slate-900 px-1 py-0.5 rounded text-white">_WEB</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-white">_MOBİL</code>, <code className="bg-slate-900 px-1 py-0.5 rounded text-white">_OTOMASYON</code> etiketli modüller yer aldığında jüri ayrı ayrı ek puan verecektir.
                  </div>
                </div>
              )}

              {/* Uploaded Archives List with DELETE button */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                  <span>Yüklü Olan Arşiv Dosyaları ({activeProject.archives.length} Adet)</span>
                  <span className="text-[11px] text-slate-500 font-normal">İstediğiniz arşivi silebilir veya yenisini ekleyebilirsiniz</span>
                </div>

                {activeProject.archives.length === 0 ? (
                  <div className="p-6 rounded-lg bg-[#060a17] border border-dashed border-slate-800 text-center text-xs text-slate-400">
                    Bu projeye henüz arşiv yüklenmedi. Yukarıdaki butonla ZIP veya RAR yükleyebilirsiniz.
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
            {activeProject.score && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-950/90 via-slate-900 to-slate-950 border border-blue-700/60 flex items-center justify-between shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Award className="h-6 w-6 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Resmî Başarı Belgeniz Hazırlandı</h3>
                  </div>
                  <p className="text-xs text-slate-300">
                    {activeProject.ownerName} ({activeProject.ownerTitle}) • Puan: <strong className="text-emerald-400">{activeProject.score} / 100 A+</strong>
                  </p>
                  <div className="text-[10px] text-slate-400">
                    Onay: Global CTO Gökçenur Öztürk • Resmî REİZMEDYA Mühürlü
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCertificate(activeProject)}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20"
                >
                  <Award className="h-4 w-4" />
                  <span>Yatay A4 Belgeyi Görüntüle & İndir</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. JURY AUDIT (100 BASE + WEB, MOBIL, OTOMASYON SUB-SCORES + EN/TR TRANSLATION) */}
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
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Jüri Varyans Radarı</span>
                </button>
                <div>
                  <div className="text-3xl font-black font-mono text-emerald-400">{finalCalculatedScore} / 100</div>
                  <div className="text-[11px] text-slate-400">Nihai Jüri Puanı</div>
                </div>
              </div>
            </div>

            {/* Project Switcher for Jury */}
            <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold px-2">İncelenecek Projeyi Seç:</span>
              {projects.map(p => (
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

            {/* Developer / CEO Security Lockout Notice */}
            {currentUser.role === "DEVELOPER" && (
              <div className="p-4 rounded-xl bg-red-950/70 border border-red-700/60 text-red-200 text-xs flex items-center space-x-3 shadow-lg">
                <Lock className="h-6 w-6 text-red-400 shrink-0" />
                <div>
                  <div className="font-bold text-red-100 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>Sıfır İltimas & Yetki Kısıtlaması (RBAC / 403 Forbidden)</span>
                  </div>
                  <p className="mt-1 text-red-300 leading-relaxed">
                    Sayın <strong>{currentUser.fullName}</strong> ({currentUser.title}); sistem yetki matrisine göre <strong>Geliştirici</strong> rolündesiniz. 
                    Şirket Kurucusu / CEO dahi olsanız, puanlara müdahale edemez, kendi projenize veya başkasının projesine puan veremezsiniz. 
                    Puanlama yetkisi yalnızca bağımsız 12 uluslararası teknik jüriye aittir.
                  </p>
                </div>
              </div>
            )}

            {/* Rubric Form */}
            <div className={`p-6 rounded-xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl ${
              currentUser.role === "DEVELOPER" ? "opacity-75" : ""
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Temel Kriterler (100 Puan) {currentUser.role === "DEVELOPER" && "(Yalnızca İnceleme Modu - Puanlama Kilitli)"}
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
                    disabled={currentUser.role === "DEVELOPER"}
                    value={codeQuality}
                    onChange={(e) => setCodeQuality(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
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
                    disabled={currentUser.role === "DEVELOPER"}
                    value={securityScore}
                    onChange={(e) => setSecurityScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
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
                    disabled={currentUser.role === "DEVELOPER"}
                    value={performanceScore}
                    onChange={(e) => setPerformanceScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
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
                    disabled={currentUser.role === "DEVELOPER"}
                    value={functionalityScore}
                    onChange={(e) => setFunctionalityScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
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
                    disabled={currentUser.role === "DEVELOPER"}
                    value={documentationScore}
                    onChange={(e) => setDocumentationScore(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Special Alt Modül Ek Puanları for PROJE_2 */}
              {activeProject.projectKey === "PROJE_2" && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>PROJE_2 Özel Alt Dal Ek Puanları (_WEB, _MOBİL, _OTOMASYON)</span>
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
                        disabled={currentUser.role === "DEVELOPER"}
                        value={webBonus}
                        onChange={(e) => setWebBonus(Number(e.target.value))}
                        className="w-full accent-blue-500 disabled:cursor-not-allowed"
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
                        disabled={currentUser.role === "DEVELOPER"}
                        value={mobileBonus}
                        onChange={(e) => setMobileBonus(Number(e.target.value))}
                        className="w-full accent-blue-500 disabled:cursor-not-allowed"
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
                        disabled={currentUser.role === "DEVELOPER"}
                        value={automationBonus}
                        onChange={(e) => setAutomationBonus(Number(e.target.value))}
                        className="w-full accent-blue-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Unlimited Jury Notes */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Gerekçeli Jüri Raporu (Karakter Sınırı Yoktur):
                </label>
                <textarea
                  rows={4}
                  disabled={currentUser.role === "DEVELOPER"}
                  value={juryCommentEn}
                  onChange={(e) => setJuryCommentEn(e.target.value)}
                  className="w-full bg-[#060a17] border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleJurySubmitReview}
                  disabled={currentUser.role === "DEVELOPER"}
                  className={`px-6 py-2.5 rounded-lg font-bold text-xs flex items-center space-x-2 shadow-lg transition-all ${
                    currentUser.role === "DEVELOPER"
                      ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                  }`}
                >
                  {currentUser.role === "DEVELOPER" ? (
                    <>
                      <Lock className="h-4 w-4 text-slate-500" />
                      <span>Yetkisiz: Geliştirici / CEO Puan Veremez (RBAC Kilitli)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Bu Puanı ve Raporu Global CTO Gökçenur Öztürk Onayına Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of Previous Jury Reviews with Instant TR / EN Translation */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Bu Proje İçin Verilen Jüri Değerlendirmeleri ({activeProject.juryReviews.length})
              </h3>

              {activeProject.juryReviews.map((rev) => {
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
                        {/* TRANSLATE BUTTON */}
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
              })}
            </div>
          </div>
        )}

        {/* 3. CTO OVERSIGHT TAB (Gökçenur Öztürk) */}
        {activeTab === "CTO_OVERSIGHT" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Global CTO Yönetim ve Hakemlik Masası</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                  Gökçenur Öztürk
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Tüm jürilerin bağımsız değerlendirmelerini inceleyin; Mustafa Çoban, Hülya Bulut veya Mustafa Dalerdem'in projelerini resmî olarak onaylayın.
              </p>
            </div>

            {/* Non-CTO Security Notice */}
            {currentUser.role !== "GLOBAL_CTO" && (
              <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-700/60 text-amber-200 text-xs flex items-center space-x-3 shadow-lg">
                <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-amber-100 uppercase tracking-wider">
                    Yalnızca Global CTO Yetkilidir (Gökçenur Öztürk)
                  </div>
                  <p className="mt-0.5 text-amber-300">
                    Sistem ve jüri kararlarını resmî olarak onaylama ve başarı belgesi tescil etme yetkisi yalnızca Global CTO Gökçenur Öztürk makamına aittir. Şirket Kurucusu / CEO dahi olsa nihai onay veremez veya belge tescilini değiştiremez.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-blue-400">{proj.projectKey} • {proj.categoryName}</div>
                      <div className="text-base font-bold text-white mt-0.5">{proj.title}</div>
                      <div className="text-xs text-slate-300">
                        Proje Sahibi: <strong className="text-white">{proj.ownerName}</strong> ({proj.ownerTitle})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-emerald-400">
                        {proj.score ? `${proj.score} / 100` : "Jüri İnceliyor"}
                      </div>
                      <div className="text-[10px] text-slate-400">Hesaplanan Skor</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">
                      Yüklü Arşiv: <strong className="text-white">{proj.archives.length} ZIP/RAR</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      {proj.status === "APPROVED_PUBLISHED" ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center space-x-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Onaylandı</span>
                          </span>
                          <button
                            onClick={() => handleOpenCertificate(proj)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1"
                          >
                            <Award className="h-3.5 w-3.5" />
                            <span>Yatay A4 Belge</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCtoApproveProject(proj.id)}
                          disabled={currentUser.role !== "GLOBAL_CTO"}
                          className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-1.5 shadow transition-all ${
                            currentUser.role !== "GLOBAL_CTO"
                              ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                          }`}
                        >
                          {currentUser.role !== "GLOBAL_CTO" ? (
                            <>
                              <Lock className="h-4 w-4 text-slate-500" />
                              <span>Onay Yetkisi Global CTO'dadır</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              <span>Global CTO Onayı Ver & Sertifika Üret</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. PRIVATE 1-ON-1 MESSAGES (Geliştirici <-> Özel Jüri) */}
        {activeTab === "MESSAGES" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>Jüriye Özel Birebir Mesajlaşma Masası</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono">
                  1-on-1 Gizli İletişim
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Geliştiriciler (Mustafa Çoban, Hülya Bulut, Mustafa Dalerdem) 12 jüriden dilediğine doğrudan özel mesaj gönderebilir.
              </p>
            </div>

            {/* Select Which Jury to Chat with */}
            <div className="flex items-center space-x-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold px-2">Özelden Mesajlaşılacak Jüri:</span>
              <select
                value={selectedJuryForChat}
                onChange={(e) => setSelectedJuryForChat(e.target.value)}
                className="bg-[#060a17] text-slate-200 border border-slate-700 rounded px-2.5 py-1 text-xs focus:outline-none"
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

            {/* Chat Box */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 h-[480px] flex flex-col justify-between shadow-xl">
              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {chatMessages
                  .filter(m => m.juryName === selectedJuryForChat)
                  .map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-lg max-w-lg text-xs space-y-1 ${
                        m.isFromDeveloper
                          ? "bg-slate-800 border border-slate-700 text-slate-200 ml-auto"
                          : "bg-blue-950 border border-blue-800/40 text-blue-100"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold">{m.senderName}</span>
                        <span>{m.timestamp}</span>
                      </div>
                      <p>{m.content}</p>
                    </div>
                  ))}
              </div>

              {/* Chat Input */}
              <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={`${selectedJuryForChat} isimli jüriye özel mesajınızı yazın...`}
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
                  className="flex-1 bg-[#060a17] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Gönder</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. 13 RESMÎ SERTİFİKA LİSTESİ VE GÖRÜNTÜLEYİCİ */}
        {activeTab === "CERTIFICATES" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>REİZMEDYA Resmî 13 Başarı ve Katılım Belgesi</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 font-mono">
                  Puan ve Proje Kademelerine Göre Tescil
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Tüm belgeler yatay A4 formatında, REİZMEDYA neon blue logolu, alınan tam puana ve proje kategorisine göre verilir; Global CTO Gökçenur Öztürk onaylıdır.
              </p>
            </div>

            {/* Equal Opportunity & Dynamic Awarding Banner */}
            <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-700/60 text-blue-200 text-xs flex items-center space-x-3 shadow-lg">
              <Award className="h-6 w-6 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span>Adil & Eşit Katılım İlkeleri: 13 Belge Herkes İçin Geçerlidir</span>
                </div>
                <p className="mt-1 text-slate-300 leading-relaxed">
                  Bu 13 belge herhangi bir kişiye ipotekli değildir. Mustafa Çoban, Hülya Bulut, Mustafa Dalerdem veya sisteme dahil olacak herhangi bir geliştirici, sunduğu projenin niteliğine (_WEB, _MOBİL, _OTOMASYON, Full-Stack) ve 12 bağımsız jürinin vereceği tam puana göre hak ettiği tüm belgeleri alır. 1. olan ve 95-100 tam puan alan zirve katılımcı, en yüksek onur olan <strong>4. Takdir Belgesi</strong> ile birlikte tüm ilgili başarı belgelerini eksiksiz kazanır.
                </p>
              </div>
            </div>

            {/* Grid of all 13 Certificate Specs with Instant Preview */}
            <div className="grid grid-cols-2 gap-3">
              {Object.values(REIZEVAL_CERTIFICATES).map((cert, index) => (
                <div key={cert.code} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span>{index + 1}. {cert.titleTr}</span>
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-900">
                        {cert.code}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{cert.titleEn}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Şart: <span className="text-slate-300">{cert.criteria}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => setActiveCertData({
                        title: cert.titleTr,
                        recipientName: currentUser.fullName,
                        recipientTitle: currentUser.title,
                        projectTitle: activeProject.title,
                        score: activeProject.score || 95,
                        certificateNumber: `RZV-2026-${cert.code}-${Math.floor(Math.random() * 899999 + 100000)}`
                      })}
                      className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 border border-blue-700/60 text-blue-300 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Yatay A4 Olarak Gör</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
