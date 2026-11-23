"use client";

import React from "react";
import { Sliders, ShieldAlert, CheckCircle2, Award, Sparkles, X } from "lucide-react";

interface RadarVarianceChartProps {
  projectName: string;
  juriesData: Array<{
    name: string;
    totalScore: number;
    scores: {
      codeQuality: number;   // 30
      security: number;      // 20
      performance: number;   // 20
      functionality: number; // 20
      documentation: number; // 10
    };
  }>;
  onClose?: () => void;
}

export function RadarVarianceChart({
  projectName,
  juriesData,
  onClose
}: RadarVarianceChartProps) {
  // If no data, use sample benchmark
  const data = juriesData.length >= 2 ? juriesData : [
    {
      name: "Gaspare LoDuca",
      totalScore: 95,
      scores: { codeQuality: 29, security: 20, performance: 19, functionality: 19, documentation: 8 }
    },
    {
      name: "Olu Brown",
      totalScore: 92,
      scores: { codeQuality: 27, security: 19, performance: 18, functionality: 19, documentation: 9 }
    }
  ];

  // Calculate Variance
  const maxScore = Math.max(...data.map(d => d.totalScore));
  const minScore = Math.min(...data.map(d => d.totalScore));
  const variance = maxScore - minScore;
  const isDisputed = variance > 15;

  // Normalized values for 5 axes (0 to 1)
  const axes = [
    { label: "Kod Kalitesi (30)", key: "codeQuality", max: 30 },
    { label: "Güvenlik (20)", key: "security", max: 20 },
    { label: "Performans (20)", key: "performance", max: 20 },
    { label: "İşlevsellik (20)", key: "functionality", max: 20 },
    { label: "Dokümantasyon (10)", key: "documentation", max: 10 },
  ];

  const centerX = 160;
  const centerY = 160;
  const radius = 110;

  // Function to calculate polygon points for a jury
  const getPolygonPoints = (juryScores: any) => {
    return axes.map((axis, i) => {
      const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
      const val = (juryScores[axis.key] || 0) / axis.max;
      const r = radius * val;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#060a17] border border-blue-900/60 rounded-2xl shadow-2xl p-6 space-y-6 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900/40 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>5 Eksenli Çoklu Jüri Varyans ve Konsensüs Radarı</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                  isDisputed ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}>
                  {isDisputed ? "UYUŞMAZLIK MEVCUT" : "KONSENSÜS TAM"}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                İncelenen Proje: <strong className="text-slate-200">{projectName}</strong>
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content: Radar SVG + Stats */}
        <div className="grid grid-cols-2 gap-6 items-center">
          {/* Radar Chart SVG */}
          <div className="flex items-center justify-center relative">
            <svg width="320" height="320" className="overflow-visible">
              {/* Background web rings */}
              {[0.25, 0.5, 0.75, 1].map((step, ringIdx) => {
                const ringPoints = axes.map((_, i) => {
                  const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
                  const r = radius * step;
                  return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                }).join(" ");
                return (
                  <polygon
                    key={ringIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray={step < 1 ? "2 2" : "none"}
                  />
                );
              })}

              {/* Axis lines */}
              {axes.map((axis, i) => {
                const angle = (Math.PI * 2 / axes.length) * i - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return (
                  <g key={i}>
                    <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#1e293b" strokeWidth="1" />
                    <text
                      x={centerX + (radius + 18) * Math.cos(angle)}
                      y={centerY + (radius + 14) * Math.sin(angle)}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="monospace"
                      dominantBaseline="central"
                    >
                      {axis.label}
                    </text>
                  </g>
                );
              })}

              {/* Jury 1 Polygon (Blue) */}
              <polygon
                points={getPolygonPoints(data[0].scores)}
                fill="rgba(59, 130, 246, 0.25)"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Jury 2 Polygon (Amber) */}
              {data[1] && (
                <polygon
                  points={getPolygonPoints(data[1].scores)}
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>

          {/* Variance Breakdown & Arbitration */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-300">Jüriler Arası Puan Farkı:</span>
                <span className={`font-mono text-sm font-bold ${isDisputed ? "text-rose-400" : "text-emerald-400"}`}>
                  Δ {variance} Puan
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {isDisputed 
                  ? "Puan farkı 15'ten büyüktür. Sistem otomatik olarak Global CTO Gökçenur Öztürk'ün hakemlik masasına sevk etmiştir."
                  : "Puanlar birbirine son derece yakındır (Varyans < 15). Otomatik konsensüs sağlanmıştır."}
              </div>
            </div>

            {/* Juries comparison list */}
            <div className="space-y-2">
              {data.map((j, i) => (
                <div key={j.name} className="p-3 rounded-lg bg-[#0a1128] border border-blue-900/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`h-3 w-3 rounded-full ${i === 0 ? "bg-blue-500" : "bg-amber-500"}`} />
                    <span className="font-semibold text-white">{j.name}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">{j.totalScore} / 100 Puan</span>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 italic">
              * Global CTO Gökçenur Öztürk uyuşmazlık durumunda her kriterin puanına doğrudan override yetkisine sahiptir.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
          >
            Tamam
          </button>
        </div>

      </div>
    </div>
  );
}
