import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const note = await prisma().note.findFirst({
    where: { shareId, isPublic: true },
    select: {
      title: true,
      createdAt: true,
      summary: true,
      noteMd: true,
    },
  });
  if (!note) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-pretty text-3xl font-semibold tracking-tight">
            {note.title ?? "Shared note"}
          </h1>
          <Badge className="bg-emerald-50 text-emerald-700">Public link</Badge>
        </div>
        <Link
          href="/"
          className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
        >
          Create your own
        </Link>
      </div>

      <Card className="p-5">
        <div className="text-xs text-zinc-500">{format(note.createdAt, "PP")}</div>
        {note.summary ? (
          <>
            <h2 className="mt-3 text-sm font-semibold tracking-tight">Summary</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
              {note.summary}
            </p>
          </>
        ) : null}
      </Card>

      {note.noteMd ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold tracking-tight">Note</h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-800">
            {note.noteMd}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}

