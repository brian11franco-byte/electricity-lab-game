"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { StarBadge } from "./StarBadge";

interface NavItem {
  href: string;
  label: string;
  icon: string; // simple emoji icon — friendly and works without an icon library
}

const NAV: NavItem[] = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/games/sorting", label: "Sort the Power", icon: "🔌" },
  { href: "/games/sequencing", label: "Electricity Journey", icon: "⚡" },
  { href: "/games/matching", label: "Switch Match", icon: "🔘" },
  { href: "/games/sentence", label: "Finish the Sentence", icon: "✍️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Top bar (all screens) */}
      <header className="sticky top-0 z-30 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              className="btn-ghost lg:hidden"
              onClick={() => setOpen((o) => !o)}
            >
              <span aria-hidden>☰</span>
              <span className="sr-only">Menu</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 shadow-glass border border-white"
            >
              <span className="text-xl" aria-hidden>
                ⚡
              </span>
              <span className="font-bold text-slate-800">
                Electricity Labs
              </span>
            </Link>
          </div>
          <StarBadge />
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-6 top-20 bottom-6 w-64 flex-col gap-2 glass p-4"
        aria-label="Main navigation"
      >
        <NavList pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 glass-strong p-4 animate-pop"
            aria-label="Main navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-bold text-slate-800">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                className="btn-ghost"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <NavList pathname={pathname} />
          </aside>
        </div>
      )}
    </>
  );
}

function NavList({ pathname }: { pathname: string | null }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              active
                ? "bg-spark-500 text-white shadow-soft"
                : "bg-white/70 text-slate-700 hover:bg-white",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <span className="text-lg leading-none" aria-hidden>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
