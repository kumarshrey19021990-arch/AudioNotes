import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Mic, ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOwnerKeyFromCookies } from "@/lib/owner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NOTE_STYLE_LABEL } from "@/lib/noteStyles";

export default async function Home() {
  const ownerKey = await getOwnerKeyFromCookies();
  // Server component: fetch your notes history.
  const notes = await prisma().note.findMany({
    where: { ownerKey },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      summary: true,
      status: true,
      style: true,
      createdAt: true,
      isPublic: true,
    },
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
          <Sparkles className="h-3.5 w-3.5" />
          Audiopen-style voice notes
        </div>
        <h1 className="text-pretty text-4xl font-semibold tracking-tight">
          Speak. Upload. Get a polished note.
        </h1>
        <p className="max-w-2xl text-pretty text-zinc-600">
          Record or upload audio and get a transcript, a cleaned note, action
          items, and (our small tweak) follow-up questions to tighten the output.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/new">
            <Button className="h-11 px-5">
              <Mic className="h-4 w-4" />
              New note
            </Button>
          </Link>
          <a
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            href="https://audiopen.ai"
            target="_blank"
            rel="noreferrer"
          >
            Inspired by Audiopen <ArrowRight className="inline h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Your notes</h2>
          <span className="text-xs text-zinc-500">
            Stored locally (SQLite) in this project.
          </span>
        </div>

        {notes.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-zinc-600">
              No notes yet. Create your first one.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3">
            {notes.map((n) => (
              <Link key={n.id} href={`/note/${n.id}`}>
                <Card className="p-5 transition hover:border-zinc-300">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold tracking-tight">
                          {n.title ??
                            (n.status === "PROCESSING"
                              ? "Processing…"
                              : "Untitled")}
                        </h3>
                        <Badge className="bg-zinc-100 text-zinc-800">
                          {NOTE_STYLE_LABEL[n.style]}
                        </Badge>
                        {n.isPublic ? (
                          <Badge className="bg-emerald-50 text-emerald-700">
                            Public
                          </Badge>
                        ) : null}
                        {n.status !== "READY" ? (
                          <Badge
                            className={
                              n.status === "ERROR"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                            }
                          >
                            {n.status}
                          </Badge>
                        ) : null}
                      </div>
                      {n.summary ? (
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                          {n.summary}
                        </p>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-xs text-zinc-500">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
