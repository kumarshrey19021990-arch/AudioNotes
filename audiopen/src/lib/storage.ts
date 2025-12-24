import path from "node:path";
import fs from "node:fs/promises";

export const DATA_DIR = path.join(process.cwd(), ".data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export async function ensureDataDirs() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function writeUpload(noteId: string, file: File) {
  await ensureDataDirs();
  const ext = guessExtension(file.type) ?? "bin";
  const fileName = `${noteId}.${ext}`;
  const absPath = path.join(UPLOADS_DIR, fileName);
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(absPath, buf);
  return { absPath, relPath: path.join(".data", "uploads", fileName) };
}

function guessExtension(mime: string): string | null {
  const m = mime.toLowerCase();
  if (m.includes("webm")) return "webm";
  if (m.includes("mpeg") || m.includes("mp3")) return "mp3";
  if (m.includes("wav")) return "wav";
  if (m.includes("m4a") || m.includes("mp4")) return "m4a";
  if (m.includes("ogg")) return "ogg";
  return null;
}

