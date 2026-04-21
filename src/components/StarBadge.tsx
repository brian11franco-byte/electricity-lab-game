"use client";

import { useXP } from "@/context/XPContext";

export function StarBadge({ compact = false }: { compact?: boolean }) {
  const { totalStars } = useXP();
  return (
    <div
      className="pill"
      aria-label={`You have ${totalStars} stars`}
      title={`You have ${totalStars} stars`}
    >
      <span className="text-sun-500 text-base leading-none" aria-hidden>
        ★
      </span>
      <span className="tabular-nums">{totalStars}</span>
      {!compact && <span className="hidden sm:inline">stars</span>}
    </div>
  );
}
