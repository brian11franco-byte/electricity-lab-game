"use client";

import { Sidebar } from "./Sidebar";
import { XPProvider } from "@/context/XPContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <XPProvider>
      <Sidebar />
      <main className="mx-auto max-w-7xl px-3 pb-16 pt-2 sm:px-6 lg:pl-80">
        {children}
      </main>
    </XPProvider>
  );
}
