"use client";

import Link from "next/link";
import CircuitBuilder from "@/components/builder/CircuitBuilder";

export default function BuilderPage() {
  return (
    <div className="fixed inset-0 top-16 lg:left-80 z-20 flex flex-col p-4 bg-[#FDFBF7] lg:pl-0">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <Link href="/" className="btn-ghost">
          ← Back
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-slate-800">
            Electric Circuit Builder 💡
          </h1>
        </div>
        <div className="w-24" /> {/* Spacer */}
      </header>

      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        <CircuitBuilder />
      </main>
    </div>
  );
}
