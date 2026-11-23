"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  LogIn, 
  Users, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Globe2, 
  Settings,
  Search,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PLATFORM_ACCOUNTS, PlatformAccount } from "@/lib/platform-accounts";

interface AuthLoginPortalProps {
  onLoginSuccess: (user: any, token: string) => void;
  activeApiUrl: string;
  onUpdateApiUrl: (newUrl: string) => void;
}

export function AuthLoginPortal({
  onLoginSuccess,
  activeApiUrl,
  onUpdateApiUrl,
}: AuthLoginPortalProps) {
  const [activeTab, setActiveTab] = useState<"QUICK" | "MANUAL">("QUICK");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "JURY" | "LEADERSHIP">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [manualEmail, setManualEmail] = useState("");
  const [manualPassword, setManualPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authenticate against live API
  const handlePerformLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.login(email.trim(), pass);
      if (res && res.success && res.user) {
        onLoginSuccess(res.user, res.accessToken);
      } else {
        setErrorMessage(res.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol ediniz.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Merkezi API sunucusuna bağlanılamadı. Lütfen internet bağlantınızı veya sunucu adresini kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) {
      setErrorMessage("Lütfen e-posta veya kullanıcı adı giriniz.");
      return;
    }
    handlePerformLogin(manualEmail, manualPassword);
  };

  // Filter accounts
  const filteredAccounts = PLATFORM_ACCOUNTS.filter(acc => {
    if (categoryFilter === "JURY" && acc.category !== "JURY") return false;
    if (categoryFilter === "LEADERSHIP" && acc.category !== "LEADERSHIP") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return acc.fullName.toLowerCase().includes(q) || acc.email.toLowerCase().includes(q) || acc.title.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto bg-[#060a17] relative select-none">
      {/* Ambient Cyber Neon Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl z-10 flex flex-col space-y-5 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-blue-950/60 border border-blue-500/30 shadow-xl shadow-blue-950/60 mb-1">
            <img 
              src="/images/reizeval-shield.png" 
              alt="REIZEVAL" 
              className="h-16 w-16 object-contain drop-shadow-[0_0_16px_rgba(59,130,246,0.8)]"
            />
          </div>

          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-100 to-white tracking-wider">
              REIZEVAL
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold tracking-widest uppercase">
              Kurumsal v1.0.0
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 font-medium tracking-tight">
            Global Project Assessment Platform — Kurumsal Yetkilendirme Kapısı
          </p>

          {/* Central API Link Pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-400">Merkezi API:</span>
            <span className="font-mono text-cyan-400 truncate max-w-[260px]">{activeApiUrl}</span>
            <button
              onClick={() => {
                const nextUrl = window.prompt("Merkezi API veya Tünel adresini girin:", activeApiUrl);
                if (nextUrl) onUpdateApiUrl(nextUrl.trim());
              }}
              className="text-slate-400 hover:text-white p-0.5 rounded"
              title="Sunucu Adresini Değiştir"
            >
              <Settings className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2.5 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Main Auth Container */}
        <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/80 backdrop-blur-md space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[#080d1e] p-1 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab("QUICK"); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                activeTab === "QUICK" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950 font-bold" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Yetkili Kurul Hesapları (Hızlı Seçim)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-blue-950/70 border border-blue-400/40 text-cyan-200">
                16 Hesap
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("MANUAL"); setErrorMessage(null); }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all ${
                activeTab === "MANUAL" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950 font-bold" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Kullanıcı Bilgileriyle Giriş Yap</span>
            </button>
          </div>

          {/* TAB 1: QUICK AUTHORIZED ACCOUNTS */}
          {activeTab === "QUICK" && (
            <div className="space-y-3">
              {/* Category Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                <div className="flex items-center space-x-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setCategoryFilter("ALL")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === "ALL"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    Tümü (16)
                  </button>
                  <button
                    onClick={() => setCategoryFilter("JURY")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === "JURY"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    12 Uluslararası Teknik Jüri
                  </button>
                  <button
                    onClick={() => setCategoryFilter("LEADERSHIP")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      categoryFilter === "LEADERSHIP"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                        : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent"
                    }`}
                  >
                    Geliştirici & Yönetim (4)
                  </button>
                </div>

                {/* Quick Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="İsim veya e-posta ara..."
                    className="w-full bg-[#080d1e] border border-slate-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Accounts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {filteredAccounts.map((acc) => {
                  const isJury = acc.category === "JURY";
                  const isCTO = acc.role === "GLOBAL_CTO";

                  return (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-[#090f22] border border-slate-800 hover:border-blue-500/50 hover:bg-[#0d1530] transition-all flex flex-col justify-between group shadow-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                            isCTO 
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800/50" 
                              : isJury 
                                ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/50" 
                                : "bg-blue-950/80 text-blue-300 border border-blue-800/50"
                          }`}>
                            {acc.role.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{acc.id}</span>
                        </div>

                        <div>
                          <div className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition-colors">
                            {acc.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{acc.title}</div>
                          <div className="text-[9px] text-blue-400/80 font-mono truncate">{acc.email}</div>
                        </div>
                      </div>

                      <button
                        disabled={isLoading}
                        onClick={() => handlePerformLogin(acc.email, acc.password)}
                        className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <span className="text-[11px]">Giriş yapılıyor...</span>
                        ) : (
                          <>
                            <span>Bu Hesapla Giriş Yap</span>
                            <ArrowRight className="h-3 w-3" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL CREDENTIALS */}
          {activeTab === "MANUAL" && (
            <form onSubmit={handleManualSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                  <span>Kullanıcı E-Posta veya Tanımlı Kod:</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="örn: mustafa.coban@reizeval veya gaspare.loduca@reizeval"
                  className="w-full bg-[#080d1e] text-slate-200 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Şifre:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                    placeholder="Şifrenizi giriniz..."
                    className="w-full bg-[#080d1e] text-slate-200 border border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Giriş yapılıyor, lütfen bekleyiniz...</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>Güvenli Giriş Yap</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security & System Info Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>256-Bit SSL/TLS & Windows DPAPI Koruması • Bağımsız Jüri Denetim Mimarisi</span>
            </div>
            <div className="font-mono text-slate-600">
              REİZMEDYA Kurumsal Yazılım Denetim Standartları (2026)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
