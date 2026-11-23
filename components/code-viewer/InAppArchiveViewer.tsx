"use client";

import React, { useState } from "react";
import { 
  FileCode, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  ShieldAlert, 
  Lock, 
  Copy, 
  Check, 
  Eye, 
  GitCompare, 
  X,
  FileText,
  FileCheck2,
  Sparkles
} from "lucide-react";

interface InAppArchiveViewerProps {
  archiveName: string;
  projectName: string;
  developerName: string;
  reviewerName: string;
  onClose: () => void;
}

interface VirtualFile {
  name: string;
  path: string;
  language: "typescript" | "python" | "prisma" | "json" | "markdown" | "yaml";
  linesCount: number;
  content: string;
  diffType?: "ADDED" | "MODIFIED" | "UNCHANGED";
}

export function InAppArchiveViewer({
  archiveName,
  projectName,
  developerName,
  reviewerName,
  onClose
}: InAppArchiveViewerProps) {
  const [selectedFilePath, setSelectedFilePath] = useState("backend/server.ts");
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Virtual files inside the archive (PROJE_2 Full-Stack & _WEB, _MOBİL, _OTOMASYON)
  const virtualFiles: VirtualFile[] = [
    {
      name: "server.ts",
      path: "backend/server.ts",
      language: "typescript",
      linesCount: 38,
      diffType: "MODIFIED",
      content: `// REIZEVAL Central Fastify Engine
import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({ logger: false });
fastify.register(cors, { origin: true });

// 100 GB Multi-Archive Upload Endpoint
fastify.post('/api/v1/projects/:id/archives/multi-upload', async (req, reply) => {
  const { archives } = req.body as any;
  // Validates SHA-256 and stages archives for Jury Audit
  return { success: true, count: archives.length };
});

export default fastify;`
    },
    {
      name: "schema.prisma",
      path: "backend/prisma/schema.prisma",
      language: "prisma",
      linesCount: 42,
      diffType: "ADDED",
      content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  SYSTEM_ADMIN
  GLOBAL_CTO
  TECHNICAL_JURY
  DEVELOPER
}

enum CertificateType {
  PROJECT_PARTICIPATION
  COMMENDATION
  SOFTWARE_PROJECT_PARTICIPATION
  VOLUNTEER_PROJECT_DEV_SUCCESS
  AUTOMATION_PROJECT_COMPLETION
}`
    },
    {
      name: "MobileNavigation.tsx",
      path: "mobile/_MOBIL/MobileNavigation.tsx",
      language: "typescript",
      linesCount: 28,
      diffType: "ADDED",
      content: `// PROJE_2 — _MOBİL Alt Modülü (Ek Puan Kapsamında)
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function MobileNavigation() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a1128', padding: 16 }}>
      <Text style={{ color: '#60a5fa', fontWeight: 'bold' }}>REIZEVAL Mobile Suite</Text>
      <Text style={{ color: '#cbd5e1' }}>100 Puan Rubrik & Jüri Ekranı</Text>
    </View>
  );
}`
    },
    {
      name: "automation_engine.py",
      path: "scripts/_OTOMASYON/automation_engine.py",
      language: "python",
      linesCount: 32,
      diffType: "ADDED",
      content: `# PROJE_2 / PROJE_3 — _OTOMASYON Modülü (Python Bağımsız Denetim)
import hashlib
import sys
import json

def verify_archive_integrity(archive_path: str) -> dict:
    hasher = hashlib.sha256()
    with open(archive_path, 'rb') as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return {
        "verified": True,
        "sha256": hasher.hexdigest(),
        "status": "A_PLUS_CLEAN"
    }

if __name__ == '__main__':
    print("REIZEVAL Python Automation Daemon Active.")`
    },
    {
      name: "package.json",
      path: "package.json",
      language: "json",
      linesCount: 26,
      diffType: "UNCHANGED",
      content: `{
  "name": "reizeval-desktop",
  "version": "1.0.0",
  "description": "REIZEVAL - Global Project Assessment Platform",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "electron:dev": "npm run electron:compile && electron ."
  }
}`
    }
  ];

  const currentFile = virtualFiles.find(f => f.path === selectedFilePath) || virtualFiles[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const watermarkText = `REIZEVAL GİZLİ KOD DENETİMİ • İNCELEYEN: ${reviewerName} • ADAY: ${developerName} • ${new Date().toLocaleDateString('tr-TR')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[88vh] bg-[#060a17] border border-blue-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Anti-Leak Transparent DRM Watermark Overlay across the entire modal */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex flex-wrap items-center justify-around opacity-[0.04] select-none rotate-[-15deg]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="text-white font-mono text-sm tracking-widest whitespace-nowrap m-8">
              {watermarkText}
            </div>
          ))}
        </div>

        {/* Top Header */}
        <div className="h-14 bg-[#0a1128] border-b border-blue-900/40 px-5 flex items-center justify-between z-40 select-none">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileCode className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-2">
                <span>Dahili Kod İnceleme & DRM Zırhı:</span>
                <span className="text-blue-400 font-mono">{archiveName}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Proje: <strong className="text-slate-200">{projectName}</strong> • Geliştirici: <strong className="text-slate-200">{developerName}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Diff View Toggle */}
            <button
              onClick={() => setIsDiffMode(!isDiffMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                isDiffMode 
                  ? "bg-amber-500 text-slate-950 font-bold" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>{isDiffMode ? "Diff Modu Açık (V1-V2-V3)" : "Diff Karşılaştırma"}</span>
            </button>

            {/* DRM Badge */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-700/50 text-[10px] text-emerald-400 font-mono">
              <Lock className="h-3 w-3" />
              <span>DRM & Sızıntı Koruması Aktif</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar Tree + Code Pane */}
        <div className="flex-1 flex overflow-hidden z-20">
          {/* Left: Archive File Tree */}
          <div className="w-72 bg-[#080d1f] border-r border-blue-900/30 flex flex-col p-3 select-none">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Arşiv Dosya Ağacı</span>
              <span className="font-mono text-blue-400 text-[10px]">{virtualFiles.length} Dosya</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {virtualFiles.map((f) => {
                const isSelected = selectedFilePath === f.path;
                return (
                  <div
                    key={f.path}
                    onClick={() => setSelectedFilePath(f.path)}
                    className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white font-semibold shadow"
                        : "text-slate-300 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-white" : "text-blue-400"}`} />
                      <span className="truncate">{f.name}</span>
                    </div>

                    {f.diffType === "ADDED" && (
                      <span className="text-[9px] font-mono px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        +YENİ
                      </span>
                    )}
                    {f.diffType === "MODIFIED" && (
                      <span className="text-[9px] font-mono px-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        DEĞİŞTİ
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="text-slate-200 font-semibold flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Zero-Extract Güvenliği:</span>
              </div>
              <div>Arşiv bilgisayara açılmadan doğrudan bellek sandbox'ında taranır.</div>
            </div>
          </div>

          {/* Right: Code Editor & Syntax Display */}
          <div className="flex-1 flex flex-col bg-[#050814] overflow-hidden">
            {/* Editor File Bar */}
            <div className="h-10 bg-[#080d1f] border-b border-slate-800/80 px-4 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-mono text-slate-400">{currentFile.path}</span>
                <span className="text-[10px] text-blue-400 font-mono">({currentFile.linesCount} Satır)</span>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Kopyalandı" : "Kodu Kopyala"}</span>
              </button>
            </div>

            {/* Code Lines Display */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed bg-[#030610]">
              <table className="w-full border-collapse">
                <tbody>
                  {currentFile.content.split('\n').map((line, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-blue-950/30 ${
                        isDiffMode && currentFile.diffType === "ADDED" ? "bg-emerald-950/20" : ""
                      }`}
                    >
                      <td className="w-10 text-right pr-4 text-slate-600 select-none text-[11px] align-top">
                        {idx + 1}
                      </td>
                      <td className="pl-2 text-slate-300 whitespace-pre">
                        {line}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Status Bar */}
            <div className="h-7 bg-[#080d1f] border-t border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-400 select-none">
              <div className="flex items-center space-x-3">
                <span>Dil: <strong className="text-white uppercase">{currentFile.language}</strong></span>
                <span>Kodlama: <strong className="text-white">UTF-8</strong></span>
              </div>
              <div className="font-mono text-blue-400 truncate">
                İnceleyen Jüri: {reviewerName} (Doğrulandı)
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
