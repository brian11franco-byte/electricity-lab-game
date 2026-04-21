"use client";

import { useEffect, useState } from "react";

/**
 * Simple, friendly feedback banner.
 * We never penalise — "try again" is a gentle nudge, not a loss.
 */
export function Feedback({
  kind,
  message,
  onDone,
  duration = 1200,
}: {
  kind: "correct" | "retry";
  message: string;
  onDone?: () => void;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, duration);
    return () => window.clearTimeout(id);
  }, [duration, onDone]);

  if (!visible) return null;

  const isCorrect = kind === "correct";
  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        "pointer-events-none fixed bottom-6 left-1/2 z-40 -translate-x-1/2",
        "animate-pop glass-strong px-5 py-3 flex items-center gap-2",
        isCorrect ? "border-spark-300" : "border-sun-300",
      ].join(" ")}
    >
      <span className="text-2xl" aria-hidden>
        {isCorrect ? "⭐" : "💡"}
      </span>
      <span className="font-semibold text-slate-800">{message}</span>
    </div>
  );
}
