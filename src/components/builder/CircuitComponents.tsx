"use client";

import React from "react";

export const BatteryIcon = ({ active }: { active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
    <defs>
      <linearGradient id="batteryBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d1d5db" />
        <stop offset="40%" stopColor="#9ca3af" />
        <stop offset="100%" stopColor="#4b5563" />
      </linearGradient>
      <linearGradient id="batteryCap" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="batteryLabel" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    {/* Body */}
    <rect x="5" y="5" width="80" height="50" rx="4" fill="url(#batteryBody)" stroke="#1f2937" strokeWidth="2" />
    {/* Label / Brand area */}
    <rect x="15" y="8" width="60" height="44" rx="2" fill="url(#batteryLabel)" opacity="0.9" />
    <text x="45" y="38" fill="white" fontSize="24" fontWeight="bold" textAnchor="middle" style={{ fontFamily: "system-ui" }}>9V</text>
    {/* Terminals */}
    <rect x="85" y="20" width="8" height="20" rx="2" fill="url(#batteryCap)" stroke="#1f2937" strokeWidth="2" />
    {/* Indicators */}
    <path d="M10 30H25M17.5 22.5V37.5" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
    <path d="M70 30H80" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
    {active && (
      <rect x="2" y="2" width="96" height="56" rx="6" stroke="#fbbf24" strokeWidth="3" strokeDasharray="8 4" className="animate-[spin_8s_linear_infinite]" />
    )}
  </svg>
);

export const BulbIcon = ({ active, intensity = 1, isBroken }: { active?: boolean, intensity?: number, isBroken?: boolean }) => {
  const numRays = active && !isBroken ? 12 + (intensity - 1) * 4 : 0;
  const rayLength = 50 + (intensity - 1) * 20;

  return (
    <svg width="80" height="100" viewBox="0 0 80 100" fill="none" overflow="visible" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-lg">
      <defs>
        <radialGradient id="bulbGlass" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={active ? "#fef08a" : "#e0f2fe"} stopOpacity="0.8" />
          <stop offset="80%" stopColor={active ? "#fde047" : "#bae6fd"} stopOpacity="0.6" />
          <stop offset="100%" stopColor={active ? "#eab308" : "#7dd3fc"} stopOpacity="0.9" />
        </radialGradient>
        <linearGradient id="bulbScrew" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="20%" stopColor="#f8fafc" />
          <stop offset="80%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Rays */}
      {active && Array.from({ length: numRays }).map((_, i) => {
        const angle = (i * 360) / numRays;
        const rad = (angle * Math.PI) / 180;
        const x1 = 40 + Math.cos(rad) * 35;
        const y1 = 35 + Math.sin(rad) * 35;
        const x2 = 40 + Math.cos(rad) * rayLength;
        const y2 = 35 + Math.sin(rad) * rayLength;
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fef08a" strokeWidth="3" strokeLinecap="round" className="animate-pulse" style={{ animationDuration: `${1.5 + Math.random()}s` }} />
        );
      })}

      {/* Glass Bulb Dome */}
      {isBroken ? (
        <path d="M40 75 C15 75, 10 50, 10 35 C10 15, 25 5, 40 5 C55 5, 70 15, 70 35 C70 50, 65 75, 40 75 Z" fill="rgba(0,0,0,0.5)" stroke="#333" strokeWidth="2" strokeDasharray="4 2" />
      ) : (
        <path d="M40 75 C15 75, 10 50, 10 35 C10 15, 25 5, 40 5 C55 5, 70 15, 70 35 C70 50, 65 75, 40 75 Z" fill="url(#bulbGlass)" stroke={active ? "#ca8a04" : "#38bdf8"} strokeWidth="2" />
      )}
      
      {/* Filament */}
      {isBroken ? (
        <path d="M 30 65 L 30 45 L 35 35 M 45 35 L 50 45 L 50 65" stroke="#333" strokeWidth="2" fill="none" strokeLinejoin="round" />
      ) : (
        <>
          <path d="M 30 65 L 30 45 L 35 35 L 45 35 L 50 45 L 50 65" stroke={active ? "#f59e0b" : "#94a3b8"} strokeWidth="2" fill="none" strokeLinejoin="round" />
          {active && <circle cx="40" cy="35" r="4" fill="#fef08a" className="animate-pulse" />}
        </>
      )}

      {/* Screw Base */}
      <rect x="26" y="65" width="28" height="22" rx="2" fill="url(#bulbScrew)" stroke="#475569" strokeWidth="1" />
      <path d="M 26 70 L 54 70 M 26 75 L 54 75 M 26 80 L 54 80" stroke="#64748b" strokeWidth="2" fill="none" opacity="0.6"/>
      
      {/* Bottom Tip / Terminal Contact Area */}
      <path d="M 32 87 C 32 95 48 95 48 87 Z" fill="#1e293b" />
    </svg>
  );
};

export const SwitchIcon = ({ isOpen, active }: { isOpen: boolean; active?: boolean }) => (
  <svg width="100" height="60" viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
    <rect x="10" y="40" width="80" height="12" rx="4" fill="#4b5563" stroke="#1f2937" strokeWidth="2" />
    <circle cx="20" cy="46" r="6" fill="#9ca3af" stroke="#1f2937" strokeWidth="2" />
    <circle cx="80" cy="46" r="6" fill="#9ca3af" stroke="#1f2937" strokeWidth="2" />
    
    {/* Lever */}
    <g transform={isOpen ? "rotate(-30 20 46)" : "rotate(0 20 46)"} className="transition-transform duration-300">
      <rect x="18" y="43" width="64" height="6" rx="3" fill="#d1d5db" stroke="#1f2937" strokeWidth="2" />
    </g>
    
    {active && !isOpen && (
      <circle cx="80" cy="46" r="10" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" className="animate-spin" />
    )}
  </svg>
);

export const BuzzerIcon = ({ active, isBroken }: { active?: boolean, isBroken?: boolean }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
    <rect x="10" y="25" width="60" height="45" rx="4" fill={isBroken ? "#1f2937" : "#374151"} stroke="#111827" strokeWidth="2" />
    <circle cx="40" cy="40" r="15" fill={isBroken ? "#111827" : "#1f2937"} stroke="#111827" strokeWidth="2" />
    {isBroken ? (
      <path d="M30 30 L 50 50 M 50 30 L 30 50" stroke="#ef4444" strokeWidth="4" />
    ) : (
      <path d="M32 40 L 48 40 M 40 32 L 40 48" stroke="#4b5563" strokeWidth="2" />
    )}
    {active && !isBroken && (
      <g className="animate-[bounce_0.5s_infinite]">
        <path d="M15 20 Q 5 10 15 0" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <path d="M65 20 Q 75 10 65 0" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      </g>
    )}
  </svg>
);

export const WireIcon = () => (
  <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-md">
    <path d="M10 20 Q 40 0 70 20" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="10" cy="20" r="6" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
    <circle cx="70" cy="20" r="6" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
  </svg>
);
