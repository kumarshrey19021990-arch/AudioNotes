"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Upload, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NOTE_STYLE_LABEL, type NoteStyle } from "@/lib/noteStyles";

const STYLES: NoteStyle[] = ["DEFAULT", "MEETING", "JOURNAL", "IDEA"];

export function NewNoteForm() {
  const router = useRouter();
  const [style, setStyle] = React.useState<NoteStyle>("DEFAULT");
  const [isRecording, setIsRecording] = React.useState(false);
  const [recorded, setRecorded] = React.useState<File | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);

  async function startRecording() {
    setErr(null);
    setRecorded(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const file = new File([blob], "recording.webm", {
          type: blob.type || "audio/webm",
        });
        setRecorded(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to start recording.");
    }
  }

  function stopRecording() {
    setErr(null);
    try {
      recorderRef.current?.stop();
      setIsRecording(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to stop recording.");
    }
  }

  async function submit(file: File) {
    setErr(null);
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("audio", file);
      fd.set("style", style);
      const res = await fetch("/api/notes", { method: "POST", body: fd });
      const json = (await res.json()) as { id?: string; error?: string };
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      if (!json.id) throw new Error("Missing note id.");
      router.push(`/note/${json.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Create a note
            </h2>
            <p className="text-sm text-zinc-600">
              Record audio or upload a file.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-zinc-600">
              Style
              <select
                className="ml-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900"
                value={style}
                onChange={(e) => setStyle(e.target.value as NoteStyle)}
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {NOTE_STYLE_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Record</div>
              {isRecording ? (
                <span className="text-xs font-medium text-rose-700">
                  Recording…
                </span>
              ) : (
                <span className="text-xs text-zinc-500">Mic permission</span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Mic className="h-4 w-4" />
                  Start
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="secondary"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              )}
            </div>

            {recorded ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white p-3 ring-1 ring-zinc-200">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">
                    {recorded.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {(recorded.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <Button
                  onClick={() => submit(recorded)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm font-medium">Upload</div>
            <p className="mt-1 text-xs text-zinc-500">
              Supports common audio formats (webm/mp3/wav/m4a/ogg).
            </p>
            <div className="mt-3">
              <input
                type="file"
                accept="audio/*"
                disabled={isSubmitting}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (f) submit(f);
                }}
                className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-zinc-900 file:ring-1 file:ring-zinc-200 hover:file:bg-zinc-50"
              />
              <div className="mt-3 text-xs text-zinc-500">
                Upload starts immediately after selecting a file.
              </div>
            </div>
          </div>
        </div>
      </Card>

      {err ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {err}
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-zinc-100 p-2 text-zinc-800">
            <Upload className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold tracking-tight">
              AI configuration
            </div>
            <p className="text-sm text-zinc-600">
              If <code className="font-mono text-xs">OPENAI_API_KEY</code> is not
              set, the app will generate a mock transcript/note so you can still
              use the UI.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

