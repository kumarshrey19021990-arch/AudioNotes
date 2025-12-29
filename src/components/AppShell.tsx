import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070A19] text-white">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-5">
        <Link href="/app" className="text-sm font-semibold tracking-wide">
          Voice Journal
        </Link>
        <Link
          href="/"
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          Home
        </Link>
      </header>
      <main className="mx-auto w-full max-w-2xl px-5 pb-16">{children}</main>
    </div>
  );
}

