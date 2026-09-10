import React from 'react';

export const IntelligenceNetworkScene: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={`network-scene ${compact ? 'h-72' : 'h-[420px] md:h-[520px]'} relative overflow-hidden rounded-2xl`}>
    <div className="absolute inset-0 network-scene-bg" />
    <svg viewBox="0 0 900 520" className="absolute inset-0 w-full h-full" aria-hidden>
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0c07a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e0c07a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="link" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4a54c" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#d4a54c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#d4a54c" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <g className="network-links" stroke="url(#link)" strokeWidth="1.2" fill="none">
        <line x1="450" y1="250" x2="220" y2="140" />
        <line x1="450" y1="250" x2="180" y2="300" />
        <line x1="450" y1="250" x2="280" y2="420" />
        <line x1="450" y1="250" x2="680" y2="120" />
        <line x1="450" y1="250" x2="740" y2="260" />
        <line x1="450" y1="250" x2="640" y2="410" />
        <line x1="220" y1="140" x2="120" y2="80" />
        <line x1="680" y1="120" x2="800" y2="70" />
        <line x1="740" y1="260" x2="840" y2="320" />
      </g>
      <circle className="pulse-ring" cx="450" cy="250" r="42" fill="none" stroke="#d4a54c" strokeOpacity="0.35" />
      <circle cx="450" cy="250" r="28" fill="#2a1d0c" stroke="#e0c07a" strokeWidth="2" />
      <circle cx="450" cy="250" r="8" fill="#e0c07a" />
      {[
        [220, 140, '#f43f5e', 10],
        [180, 300, '#f59e0b', 8],
        [280, 420, '#f43f5e', 9],
        [680, 120, '#d4a54c', 8],
        [740, 260, '#10b981', 10],
        [640, 410, '#f59e0b', 8],
        [120, 80, '#64748b', 6],
        [800, 70, '#10b981', 7],
        [840, 320, '#d4a54c', 6],
      ].map(([x, y, color, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={Number(r) + 10} fill={String(color)} opacity="0.12" />
          <circle cx={x} cy={y} r={Number(r)} fill={String(color)} />
        </g>
      ))}
    </svg>
    <div className="absolute inset-0 pointer-events-none particles" />
    <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4">
      <div className="text-[11px] tracking-[0.28em] uppercase text-cyan-300/80 font-semibold text-center">
        Claim → Network → Spread → Evidence → Response
      </div>
    </div>
  </div>
);
