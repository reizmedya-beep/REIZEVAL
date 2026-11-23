"use client";

import React, { useRef } from "react";
import { Printer, X } from "lucide-react";

interface CertificateProps {
  title: string;
  recipientName: string;
  recipientTitle: string;
  projectTitle: string;
  score: number;
  certificateNumber: string;
  issueDate?: string;
  categoryTag?: string;
  descriptionText?: string;
  onClose?: () => void;
}

export function LandscapeA4Certificate({
  title,
  recipientName,
  recipientTitle,
  projectTitle,
  score,
  certificateNumber,
  issueDate = "21.11.2026",
  categoryTag = "YAPAY ZEKÂ",
  descriptionText,
  onClose
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const defaultDesc = descriptionText || `REİZMEDYA kapsamında yürütülen projeye sağladığı teknik veya yaratıcı katkılarından dolayı bu belge kendisine takdim edilmiştir.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto select-none">
      {/* Top Action Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 text-white">
        <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 font-mono">
          <span>REİZMEDYA Cyber-Tech Yatay A4 Belge</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Yatay A4 Yazdır / PDF Kaydet</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
            >
              Kapat
            </button>
          )}
        </div>
      </div>

      {/* Cyber HUD A4 Landscape Document Box (297mm x 210mm Ratio: 1.414) */}
      <div 
        ref={certRef}
        id="reizeval-printable-certificate"
        className="w-full max-w-4xl aspect-[1.414/1] bg-[#03081a] text-slate-100 rounded-lg p-8 border-2 border-cyan-500/60 shadow-2xl relative flex flex-col justify-between overflow-hidden select-text"
        style={{
          boxShadow: "0 0 50px rgba(0, 240, 255, 0.25), inset 0 0 35px rgba(2, 132, 199, 0.2)"
        }}
      >
        {/* Futuristic HUD Corner Brackets */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Subtle Background Radial Radar Rings */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 85% 25%, rgba(0, 240, 255, 0.4) 0%, transparent 40%), linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "100% 100%, 30px 30px, 30px 30px"
          }}
        />

        {/* 1. Header (Logo on Left, Category & Reticle Target on Right) */}
        <div className="flex items-center justify-between z-10 border-b border-cyan-500/30 pb-3">
          {/* Logo Block */}
          <div className="flex items-center space-x-3">
            <img 
              src="/images/reizmedya-logo.jpg" 
              alt="REİZMEDYA Logo" 
              className="h-12 w-auto rounded-md shadow border border-cyan-400/40" 
            />
            <div>
              <div className="text-xl font-black tracking-widest text-white uppercase flex items-center space-x-1">
                <span>REIZMEDYA</span>
              </div>
              <div className="text-[9px] font-mono tracking-wider text-cyan-300">
                YAZILIM • TEKNOLOJİ • PROJE EKİBİ
              </div>
            </div>
          </div>

          {/* Top Right Reticle & Category */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase">
                BELGELENDİRME / REİZMEDYA
              </div>
              <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {categoryTag}
              </div>
            </div>

            {/* Cyan Radar Target Reticle Icon */}
            <div className="h-10 w-10 rounded-full border border-cyan-400/70 flex items-center justify-center relative shadow-sm">
              <div className="h-5 w-5 rounded-full border border-cyan-400/50 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <div className="absolute inset-x-0 h-[1px] bg-cyan-400/60" />
              <div className="absolute inset-y-0 w-[1px] bg-cyan-400/60" />
            </div>
          </div>
        </div>

        {/* 2. Certificate Body Content */}
        <div className="text-center my-auto space-y-3 z-10 py-1">
          <div className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase">
            REİZMEDYA / PROJE FAALİYETLERİ
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-wider text-white uppercase font-sans">
            {title}
          </h1>

          {/* Glowing cyan dot & line */}
          <div className="flex items-center justify-center space-x-2 py-0.5">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-cyan-500" />
            <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-cyan-500" />
          </div>

          <div className="text-[10px] font-mono tracking-[0.25em] text-slate-400 uppercase pt-1">
            S A Y I N
          </div>

          <div>
            <div className="text-2xl md:text-3xl font-black text-white tracking-wider underline decoration-cyan-400 decoration-2 underline-offset-8">
              {recipientName}
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed pt-1">
            {defaultDesc}
          </p>

          {/* Project Box Pill */}
          <div className="max-w-xl mx-auto mt-2">
            <div className="px-4 py-2 rounded-lg bg-[#05112e]/70 border border-cyan-500/40 text-left text-xs font-mono flex items-center justify-between">
              <span className="text-cyan-400 font-bold truncate">PROJE TANIMI:</span>
              <span className="text-slate-200 truncate ml-2">{projectTitle}</span>
            </div>
          </div>
        </div>

        {/* 3. Footer (Date on Left, Tagline Center, Signature on Right) */}
        <div className="flex items-end justify-between z-10 border-t border-cyan-500/30 pt-3 text-xs">
          {/* Left: Date */}
          <div className="text-left font-mono">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">
              DÜZENLENME TARİHİ
            </div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">
              {issueDate}
            </div>
          </div>

          {/* Center: Community Tagline */}
          <div className="text-center font-mono text-[9px] tracking-wider text-slate-400">
            REİZMEDYA • DİJİTAL PROJELER • GÖNÜLLÜ ÇALIŞMALAR
          </div>

          {/* Right: Signature */}
          <div className="text-right">
            <div className="text-sm font-serif italic text-cyan-200 pr-2">
              Gökçenur Öztürk
            </div>
            <div className="w-36 h-[1px] bg-slate-500 my-1 ml-auto" />
            <div className="text-xs font-bold tracking-wider text-white">
              GÖKÇENUR ÖZTÜRK
            </div>
            <div className="text-[8px] font-mono tracking-widest text-cyan-400 uppercase">
              GLOBAL CTO • İMZA
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
