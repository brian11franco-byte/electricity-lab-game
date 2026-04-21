"use client";

import Link from "next/link";
import { useXP, type GameId } from "@/context/XPContext";

export function GameCard({
  href,
  title,
  subtitle,
  emoji,
  game,
  tone = "blue",
}: {
  href: string;
  title: string;
  subtitle: string;
  emoji: string;
  game: GameId;
  tone?: "blue" | "yellow" | "green";
}) {
  const { stars } = useXP();
  const earned = stars[game];

  return (
    <Link
      href={href}
      className="group relative glass-strong p-5 sm:p-6 transition hover:-translate-y-0.5 hover:shadow-soft focus-visible:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            "flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-soft",
            tone === "blue"
              ? "bg-spark-100 text-spark-700"
              : tone === "yellow"
              ? "bg-sun-200 text-slate-800"
              : "bg-emerald-100 text-emerald-700",
          ].join(" ")}
          aria-hidden
        >
          {emoji}
        </div>
        <span className="pill" aria-label={`${earned} stars earned`}>
          <span className="text-sun-500" aria-hidden>
            ★
          </span>
          {earned}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-800 sm:text-xl">
        {title}
      </h3>
      <p className="mt-1 text-sm text-slate-600 sm:text-base">{subtitle}</p>

      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-spark-700 group-hover:gap-2 transition-all">
        Play now <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
