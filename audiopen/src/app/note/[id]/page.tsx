import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getOwnerKeyFromCookies } from "@/lib/owner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NOTE_STYLE_LABEL } from "@/lib/noteStyles";
import { NoteAutoRefresh } from "@/components/note-auto-refresh";
import { NoteActions } from "@/components/note-actions";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ownerKey = await getOwnerKeyFromCookies();

  const note = await prisma().note.findFirst({
    where: { id, ownerKey },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      style: true,
      title: true,
      summary: true,
      noteMd: true,
      transcript: true,
      actionItems: true,
      bullets: true,
      followUps: true,
      isPublic: true,
      shareId: true,
      error: true,
    },
  });

  if (!note) return notFound();

  const bullets = asStringArray(note.bullets);
  const actionItems = asStringArray(note.actionItems);
  const followUps = asStringArray(note.followUps);

  return (
    <div className="space-y-4">
      <NoteAutoRefresh enabled={note.status === "PROCESSING"} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-pretty text-3xl font-semibold tracking-tight">
            {note.title ?? (note.status === "PROCESSING" ? "Processing…" : "Untitled")}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{NOTE_STYLE_LABEL[note.style]}</Badge>
            <Badge className="bg-zinc-100 text-zinc-700">
              {format(note.createdAt, "PPpp")}
            </Badge>
            {note.status !== "READY" ? (
              <Badge
                className={
                  note.status === "ERROR"
                    ? "bg-rose-50 text-rose-700"
                    : "bg-amber-50 text-amber-700"
                }
              >
                {note.status}
              </Badge>
            ) : null}
          </div>
        </div>

        <NoteActions
          noteId={note.id}
          noteTitle={note.title}
          markdown={note.noteMd}
          isPublic={note.isPublic}
          shareId={note.shareId}
        />
      </div>

      {note.status === "ERROR" ? (
        <Card className="border-rose-200 bg-rose-50 p-5">
          <div className="text-sm font-semibold text-rose-900">Error</div>
          <div className="mt-1 text-sm text-rose-800">
            {note.error ?? "Failed to process this audio."}
          </div>
        </Card>
      ) : null}

      {note.summary ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Summary</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
            {note.summary}
          </p>
        </Card>
      ) : null}

      {note.noteMd ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Note</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-800">
            {note.noteMd}
          </pre>
        </Card>
      ) : (
        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Note</h2>
          <p className="mt-2 text-sm text-zinc-600">
            {note.status === "PROCESSING"
              ? "Generating your note… this page will auto-refresh."
              : "No note generated yet."}
          </p>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Key points</h2>
          {bullets.length ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">—</p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Action items</h2>
          {actionItems.length ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
              {actionItems.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-600">—</p>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold tracking-tight">
          Follow-up questions (2% change)
        </h2>
        {followUps.length ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            {followUps.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">—</p>
        )}
      </Card>

      {note.transcript ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Transcript</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
            {note.transcript}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}

function asStringArray(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string") as string[];
  return [];
}

