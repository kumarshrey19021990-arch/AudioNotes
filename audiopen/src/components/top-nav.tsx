import Link from "next/link";
import { Mic, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TopNav() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-900"
        >
          <NotebookPen className="h-4 w-4" />
          Audiopen Replica
        </Link>
        <Link href="/new">
          <Button>
            <Mic className="h-4 w-4" />
            New
          </Button>
        </Link>
      </div>
    </header>
  );
}

