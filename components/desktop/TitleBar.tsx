"use client";

import React, { useEffect, useState } from "react";
import { Minus, Square, Copy, X, Shield, Wifi, WifiOff } from "lucide-react";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleMinimize = () => {
    if (typeof window !== "undefined" && (window as any).reizevalNative) {
      (window as any).reizevalNative.minimize();
    }
  };

  const handleMaximize = async () => {
    if (typeof window !== "undefined" && (window as any).reizevalNative) {
      const maximized = await (window as any).reizevalNative.maximize();
      setIsMaximized(maximized);
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && (window as any).reizevalNative) {
      (window as any).reizevalNative.close();
    }
  };

  return (
    <header className="h-10 w-full bg-[#0a1128] border-b border-blue-900/40 select-none flex items-center justify-between px-3 fixed top-0 left-0 z-50 drag-region text-slate-300 text-xs">
      {/* Brand & Left Info */}
      <div className="flex items-center space-x-2.5 no-drag">
        <div className="h-5 w-5 rounded bg-blue-600 flex items-center justify-center font-black text-[10px] text-white tracking-tighter shadow-sm">
          RZ
        </div>
        <div className="flex items-center space-x-2 font-semibold tracking-wider text-slate-200">
          <span>REIZEVAL</span>
          <span className="text-blue-500 font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/40">
            ENTERPRISE v1.0.0
          </span>
        </div>
      </div>

      {/* Center Drag Area & Status */}
      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
        <span className="hidden md:inline-block font-mono tracking-wide text-slate-500">
          REİZMEDYA • GLOBAL CTO: GÖKÇENUR ÖZTÜRK
        </span>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 no-drag">
          {isOnline ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-medium">Merkezi API Aktif</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="text-[10px] text-rose-400 font-medium">Bağlantı Kesildi</span>
            </>
          )}
        </div>
      </div>

      {/* Windows Window Controls (Minimize / Maximize / Close) */}
      <div className="flex items-center space-x-1 no-drag">
        <button
          onClick={handleMinimize}
          className="h-7 w-9 flex items-center justify-center rounded hover:bg-slate-800/80 active:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Simge Durumuna Küçült"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="h-7 w-9 flex items-center justify-center rounded hover:bg-slate-800/80 active:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title={isMaximized ? "Aşağı Geri Getir" : "Ekranı Kapla"}
        >
          {isMaximized ? (
            <Copy className="h-3.5 w-3.5 rotate-180" />
          ) : (
            <Square className="h-3 w-3" />
          )}
        </button>
        <button
          onClick={handleClose}
          className="h-7 w-9 flex items-center justify-center rounded hover:bg-rose-600 active:bg-rose-700 text-slate-400 hover:text-white transition-colors"
          title="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
