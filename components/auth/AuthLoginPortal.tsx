"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  LogIn, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Settings,
  ArrowRight,
  Server
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authenticate against central API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Lütfen e-posta veya kullanıcı adı giriniz.");
      return;
    }
    if (!password) {
      setErrorMessage("Lütfen şifrenizi giriniz.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.login(email.trim(), password);
      if (res && res.success && res.user) {
        onLoginSuccess(res.user, res.accessToken);
      } else {
        setErrorMessage(res.error || "Giriş başarısız. Kullanıcı adı veya şifre hatalı.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || "Merkezi API sunucusuna bağlanılamadı. Lütfen sunucu adresini veya internetinizi kontrol edin."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto bg-[#060a17] relative select-none">
      {/* Ambient Cyber Neon Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10 flex flex-col space-y-6 my-auto">
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-blue-950/60 border border-blue-500/40 shadow-2xl shadow-blue-950/70 mb-1">
            <img 
              src="/images/reizeval-shield.png" 
              alt="REIZEVAL" 
              className="h-20 w-20 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.85)]" 
            />
          </div>

          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-100 to-white tracking-wider">
              REIZEVAL
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold tracking-widest uppercase">
              Kurumsal v1.0.0
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium tracking-tight">
            Global Project Assessment Platform — Kurumsal Giriş Portalı
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center space-x-2.5 animate-fadeIn shadow-lg shadow-rose-950/40">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Pure Enterprise Login Card */}
        <div className="bg-slate-900/95 border border-blue-900/40 rounded-2xl p-6 md:p-7 shadow-2xl shadow-black/90 backdrop-blur-md space-y-5">
          <div className="border-b border-slate-800/80 pb-3">
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <span>Güvenli Kurumsal Oturum Açma</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Jüri, Geliştirici veya Sistem Yöneticisi kimlik bilgilerinizle giriş yapınız.
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email / Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                <span>Kullanıcı E-Postası veya Kimlik Kodu:</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Örn: mustafa.coban@reizeval veya gaspare.loduca@reizeval"
                className="w-full bg-[#080d1e] text-slate-100 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none placeholder:text-slate-600 font-mono transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-blue-400" />
                <span>Şifre:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrenizi giriniz..."
                  className="w-full bg-[#080d1e] text-slate-100 border border-slate-700/80 focus:border-blue-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:outline-none placeholder:text-slate-600 font-mono transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-xl shadow-blue-950/80 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Kimlik Doğrulanıyor...</span>
                </div>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sisteme Giriş Yap</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Security & System Info Footer */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col space-y-1 text-[10px] text-slate-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>256-Bit SSL/TLS & DPAPI Şifreleme</span>
              </span>
              <span className="font-mono text-slate-600">v1.0.0 Enterprise</span>
            </div>
            <div className="text-slate-600 text-[9px] pt-1 text-center font-mono">
              REİZMEDYA Kurumsal Yazılım Denetim ve Güvenlik Altyapısı (2026)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
