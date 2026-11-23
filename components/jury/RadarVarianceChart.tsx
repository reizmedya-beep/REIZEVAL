"use client";

import React from "react";
import { Sliders, ShieldAlert, CheckCircle2, Award, Sparkles, X, AlertCircle } from "lucide-react";

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
  const hasData = juriesData && juriesData.length > 0;
  const data = juriesData || [];

  // Calculate Variance
  const maxScore = hasData ? Math.max(...data.map(d => d.totalScore)) : 0;
  const minScore = hasData ? Math.min(...data.map(d => d.totalScore)) : 0;
  const variance = hasData ? maxScore - minScore : 0;
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
                {hasData && (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    isDisputed ? "bg-rose-950 text-rose-400 border border-rose-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  }`}>
                    {isDisputed ? "UYUŞMAZLIK MEVCUT" : "KONSENSÜS TAM"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                İncelenen Proje: <strong className="text-slate-200">{projectName}</strong>
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        {!hasData ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 bg-slate-900/40 rounded-xl border border-slate-800">
            <AlertCircle className="h-10 w-10 text-blue-400/60" />
            <div className="text-sm font-bold text-white">Henüz Jüri Değerlendirmesi Bulunmuyor</div>
            <p className="text-xs text-slate-400 max-w-md">
              Bu proje için bağımsız jüriler tarafından henüz puan verilmedi. 
              Jüri üyeleri 100 puanlık rubrik üzerinden değerlendirme kaydettiğinde varyans radarı ve konsensüs analizi canlı olarak hesaplanacaktır.
            </p>
          </div>
        ) : (
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
                        y={centerY + (radius + 18) * Math.sin(angle)}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {axis.label}
                      </text>
                    </g>
                  );
                })}

                {/* Dynamic Polygons for Juries */}
                {data.map((j, idx) => {
                  const colors = [
                    { stroke: "#3b82f6", fill: "rgba(59, 130, 246, 0.25)" },
                    { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.25)" },
                    { stroke: "#a855f7", fill: "rgba(168, 85, 247, 0.25)" },
                    { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.25)" }
                  ];
                  const c = colors[idx % colors.length];
                  return (
                    <polygon
                      key={idx}
                      points={getPolygonPoints(j.scores)}
                      stroke={c.stroke}
                      fill={c.fill}
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Stats Panel */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Jüri Skor Dağılımı ve Konsensüs
                </div>

                <div className="space-y-2">
                  {data.map((j, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">{j.name}:</span>
                      <span className="font-mono text-emerald-400 font-bold">{j.totalScore} / 100</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Maksimum Varyans Farkı:</span>
                  <span className={`font-mono font-bold ${isDisputed ? "text-rose-400" : "text-emerald-400"}`}>
                    {variance} Puan ({isDisputed ? "Uyuşmazlık" : "Uyumlu"})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-900">
          REIZEVAL Kurumsal Değerlendirme Standardı • 100 Puanlık Objektif Rubrik
        </div>
      </div>
    </div>
  );
}
