"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { conceptIcons, type ConceptKey } from "@/lib/assets";
import { useXP } from "@/context/XPContext";
import { Feedback } from "@/components/Feedback";

/**
 * Switch Match — tap a switch image, then tap the label that fits.
 * No penalties, no trick questions. Wrong picks stay unlocked so
 * children can try again.
 */

type SwitchId = "press" | "rocker" | "slide";

interface SwitchCard {
  id: SwitchId;
  label: string;
  image: ConceptKey; // image key
  examples: string;
}

const SWITCHES: SwitchCard[] = [
  {
    id: "rocker",
    label: "Rocker switch",
    image: "rockerSwitch",
    examples: "You flip it up or down — like for ceiling lights.",
  },
  {
    id: "press",
    label: "Press switch",
    image: "pressSwitch",
    examples:
      "You push a button — like for whiteboards, computers, TVs, remotes, and calculators.",
  },
  {
    id: "slide",
    label: "Slide switch",
    image: "slideSwitch",
    examples: "You slide it across — like on a small toy robot.",
  },
];

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MatchingGame() {
  const { stars, setStars } = useXP();
  const [pickedImage, setPickedImage] = useState<SwitchId | null>(null);
  const [matched, setMatched] = useState<Set<SwitchId>>(new Set());
  const [labels] = useState(() => shuffle(SWITCHES.map((s) => s.id)));
  const [feedback, setFeedback] = useState<{
    kind: "correct" | "retry";
    message: string;
  } | null>(null);

  const done = matched.size === SWITCHES.length;

  const byId = useMemo(
    () => Object.fromEntries(SWITCHES.map((s) => [s.id, s])) as Record<SwitchId, SwitchCard>,
    []
  );

  function tapImage(id: SwitchId) {
    if (matched.has(id)) return;
    setPickedImage(id);
  }

  function tapLabel(id: SwitchId) {
    if (matched.has(id)) return;
    if (!pickedImage) {
      setFeedback({
        kind: "retry",
        message: "Tap a switch picture first.",
      });
      return;
    }
    if (pickedImage === id) {
      const next = new Set(matched);
      next.add(id);
      setMatched(next);
      setPickedImage(null);
      setStars("matching", next.size);
      setFeedback({ kind: "correct", message: "Great match!" });
    } else {
      setFeedback({
        kind: "retry",
        message: "Not this one. Look at the picture again.",
      });
      setPickedImage(null);
    }
  }

  function reset() {
    setMatched(new Set());
    setPickedImage(null);
    setStars("matching", 0);
  }

  return (
    <div className="space-y-6">
      <header className="glass-strong p-5 sm:p-6">
        <h1 className="text-xl font-extrabold text-slate-800 sm:text-2xl">
          Switch Match 🔘
        </h1>
        <p className="mt-1 text-slate-600">
          Tap a picture, then tap the name that goes with it.
        </p>
      </header>

      {/* Pictures row */}
      <section className="glass p-4 sm:p-5">
        <h2 className="mb-3 font-bold text-slate-800">Switch pictures</h2>
        <div className="grid grid-cols-3 gap-3">
          {SWITCHES.map((s) => {
            const isPicked = pickedImage === s.id;
            const isMatched = matched.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => tapImage(s.id)}
                disabled={isMatched}
                aria-pressed={isPicked}
                className={[
                  "glass-strong p-3 text-center transition",
                  isMatched
                    ? "opacity-60"
                    : isPicked
                    ? "ring-4 ring-spark-400 bg-spark-50"
                    : "hover:-translate-y-0.5",
                ].join(" ")}
              >
                <div className="relative mx-auto h-20 w-20 sm:h-24 sm:w-24">
                  <Image
                    src={conceptIcons[s.image]}
                    alt={s.label}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                {isMatched && (
                  <div className="mt-1 text-xs font-bold text-spark-700">
                    {s.label} ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Labels row */}
      <section className="glass p-4 sm:p-5">
        <h2 className="mb-3 font-bold text-slate-800">Switch names</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {labels.map((id) => {
            const s = byId[id];
            const isMatched = matched.has(id);
            return (
              <button
                key={id}
                onClick={() => tapLabel(id)}
                disabled={isMatched}
                className={[
                  "glass-strong p-4 text-left transition",
                  isMatched
                    ? "opacity-60"
                    : "hover:-translate-y-0.5",
                ].join(" ")}
              >
                <div className="text-lg font-bold text-slate-800">
                  {s.label}
                </div>
                <p className="mt-1 text-sm text-slate-600">{s.examples}</p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <span className="pill">
          <span className="text-sun-500" aria-hidden>
            ★
          </span>
          {stars.matching} for this game
        </span>
        <button className="btn-ghost" onClick={reset}>
          Start again
        </button>
      </div>

      {done && (
        <div className="glass-strong p-5 text-center">
          <p className="text-lg font-bold text-slate-800">
            All matched! You earned 3 stars. ⭐
          </p>
        </div>
      )}

      {feedback && (
        <Feedback
          kind={feedback.kind}
          message={feedback.message}
          onDone={() => setFeedback(null)}
        />
      )}
    </div>
  );
}
