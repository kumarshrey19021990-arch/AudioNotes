import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOwnerKeyFromRequest } from "@/lib/owner";
import { writeUpload } from "@/lib/storage";
import { generateNoteFromTranscript, transcribeAudio } from "@/lib/ai";
import { NoteStyleSchema } from "@/lib/noteStyles";

export const runtime = "nodejs";

const MAX_BYTES = 100 * 1024 * 1024; // 100MB

export async function POST(req: Request) {
  let noteId: string | null = null;
  try {
    const ownerKey = getOwnerKeyFromRequest(req);
    const form = await req.formData();
    const style = NoteStyleSchema.catch("DEFAULT").parse(form.get("style"));

    const audio = form.get("audio");
    if (!(audio instanceof File)) {
      return NextResponse.json(
        { error: "Missing audio file (form field: audio)." },
        { status: 400 },
      );
    }
    if (audio.size <= 0) {
      return NextResponse.json({ error: "Empty audio file." }, { status: 400 });
    }
    if (audio.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Audio file too large (max 100MB)." },
        { status: 413 },
      );
    }

    const note = await prisma().note.create({
      data: {
        ownerKey,
        status: "PROCESSING",
        style,
        audioMime: audio.type || "application/octet-stream",
      },
      select: { id: true },
    });
    noteId = note.id;

    const upload = await writeUpload(note.id, audio);
    await prisma().note.update({
      where: { id: note.id },
      data: { audioPath: upload.relPath },
    });

    const { transcript, rawTranscript, language } = await transcribeAudio({
      filePath: upload.absPath,
      mime: audio.type || "",
    });

    const gen = await generateNoteFromTranscript({ transcript, style });

    await prisma().note.update({
      where: { id: note.id },
      data: {
        status: "READY",
        language,
        rawTranscript,
        transcript,
        title: gen.title,
        summary: gen.summary,
        noteMd: gen.noteMd,
        bullets: gen.bullets,
        actionItems: gen.actionItems,
        followUps: gen.followUps,
      },
    });

    return NextResponse.json({ id: note.id });
  } catch (err) {
    const msg =
      err instanceof z.ZodError
        ? err.issues.map((i) => i.message).join(", ")
        : err instanceof Error
          ? err.message
          : "Unknown error";
    if (noteId) {
      await prisma().note.update({
        where: { id: noteId },
        data: { status: "ERROR", error: msg },
      });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

