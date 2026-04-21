"use client";

import { GameCard } from "@/components/GameCard";
import { useXP } from "@/context/XPContext";

export default function Dashboard() {
  const { totalStars, reset } = useXP();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="glass-strong p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-spark-600">
              Grade 2 Science
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">
              Welcome to Electricity Labs ⚡
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Pick a game to play. Every correct answer gives you a star.
              Take your time — there are no wrong moves here, only chances
              to try again.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass px-4 py-3 text-center">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your stars
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 text-3xl font-extrabold text-slate-800">
                <span className="text-sun-400 animate-sparkle" aria-hidden>
                  ★
                </span>
                <span className="tabular-nums">{totalStars}</span>
              </div>
            </div>
            <button
              className="btn-ghost"
              onClick={() => {
                if (
                  confirm(
                    "Start fresh? This will set your stars back to zero."
                  )
                ) {
                  reset();
                }
              }}
            >
              Start again
            </button>
          </div>
        </div>
      </section>

      {/* Game cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        <GameCard
          href="/games/sorting"
          title="Sort the Power"
          subtitle="Drag each thing to the right box: Mains, Cells, or Non-electrical."
          emoji="🔌"
          game="sorting"
          tone="blue"
        />
        <GameCard
          href="/games/sequencing"
          title="The Electricity Journey"
          subtitle="Put the pictures in the correct order, from power station to your house."
          emoji="⚡"
          game="sequencing"
          tone="yellow"
        />
        <GameCard
          href="/games/matching"
          title="Switch Match"
          subtitle="Match each switch to its name. Look at how it moves."
          emoji="🔘"
          game="matching"
          tone="blue"
        />
        <GameCard
          href="/games/sentence"
          title="Finish the Sentence"
          subtitle="Drag the word that makes each sentence true."
          emoji="✍️"
          game="sentence"
          tone="yellow"
        />
      </section>

      {/* Helper */}
      <section className="glass p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-800">How to play</h2>
        <ul className="mt-3 grid gap-2 text-slate-700 sm:grid-cols-2">
          <li className="flex gap-2">
            <span aria-hidden>👆</span>
            Tap or drag items into the right place.
          </li>
          <li className="flex gap-2">
            <span aria-hidden>⭐</span>
            Every correct move gives you a star.
          </li>
          <li className="flex gap-2">
            <span aria-hidden>🔁</span>
            You can always try again. Nothing is lost.
          </li>
          <li className="flex gap-2">
            <span aria-hidden>📱</span>
            Works on tablets and phones.
          </li>
        </ul>
      </section>
    </div>
  );
}
