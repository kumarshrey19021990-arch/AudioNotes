import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="vj-shell">
      <div className="vj-app">
        <header className="flex items-center justify-between">
          <Link href="/app" className="text-sm font-semibold tracking-wide">
            Voice Journal
          </Link>
          <Link
            href="/"
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/15"
          >
            Home
          </Link>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

