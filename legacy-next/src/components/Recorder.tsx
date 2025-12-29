"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Square } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatTime } from "@/lib/format";
import { WaveBars } from "@/components/WaveBars";

type RecStatus = "starting" | "recording" | "saving" | "error";

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = { 0: SpeechRecognitionAlternativeLike; length: number };
type SpeechRecognitionResultListLike = {
  length: number;
  item: (index: number) => SpeechRecognitionResultLike;
  [index: number]: SpeechRecognitionResultLike;
};
type SpeechRecognitionEventLike = { results: SpeechRecognitionResultListLike };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

function buildTitleFromTranscript(t: string | null | undefined): string {
  const trimmed = (t ?? "").trim();
  if (!trimmed) return "Voice note";
  const words = trimmed.split(/\s+/).slice(0, 5).join(" ");
  return words.length > 64 ? `${words.slice(0, 61)}…` : words;
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return typeof e === "string" ? e : "Unknown error";
}

function createSpeechRecognition(): SpeechRecognitionLike | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recog = new Ctor();
  recog.continuous = true;
  recog.interimResults = true;
  recog.lang = "en-US";
  return recog;
}

export function Recorder() {
  const router = useRouter();

  const [status, setStatus] = useState<RecStatus>("starting");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [whisperText, setWhisperText] = useState<string | null>(null);

  const transcriptRef = useRef("");
  const startAtRef = useRef<number>(Date.now());
  const tickRef = useRef<number | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const timeLabel = useMemo(() => formatTime(seconds), [seconds]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStatus("starting");
      setError(null);
      setTranscript("");
      setWhisperText(null);
      transcriptRef.current = "";
      chunksRef.current = [];
      startAtRef.current = Date.now();
      setSeconds(0);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;

        streamRef.current = stream;

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : undefined,
        });
        recorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.start(250);

        // Optional voice-to-text (Web Speech API). Some browsers/devices won’t support it.
        const recognition = createSpeechRecognition();
        recognitionRef.current = recognition;
        if (recognition) {
          recognition.onresult = (event: SpeechRecognitionEventLike) => {
            const parts: string[] = [];
            for (let i = 0; i < event.results.length; i++) {
              const res = event.results.item ? event.results.item(i) : event.results[i];
              parts.push(res[0].transcript);
            }
            const next = parts.join(" ").trim();
            setTranscript(next);
          };
          try {
            recognition.start();
          } catch {
            // Ignore double-start errors.
          }
        }

        tickRef.current = window.setInterval(() => {
          const delta = Math.floor((Date.now() - startAtRef.current) / 1000);
          setSeconds(delta);
        }, 250);

        setStatus("recording");
      } catch (e: unknown) {
        setStatus("error");
        setError(
          errorMessage(e) ??
            "Microphone permission was denied or is unavailable on this device.",
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (tickRef.current) window.clearInterval(tickRef.current);
      try {
        recognitionRef.current?.stop();
      } catch {
        // no-op
      }
      recorderRef.current?.stop?.();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function stopAndSave() {
    if (status !== "recording") return;
    setStatus("saving");
    setError(null);

    if (tickRef.current) window.clearInterval(tickRef.current);
    try {
      recognitionRef.current?.stop();
    } catch {
      // no-op
    }

    const recorder = recorderRef.current;
    const stream = streamRef.current;

    const blob: Blob = await new Promise((resolve, reject) => {
      if (!recorder) {
        reject(new Error("Recorder not initialized."));
        return;
      }

      recorder.onstop = () => {
        try {
          const b = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          resolve(b);
        } catch (err) {
          reject(err);
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        reject(err);
      } finally {
        stream?.getTracks().forEach((t) => t.stop());
      }
    });

    try {
      // 1) Transcribe with OpenAI Whisper (server-side API route)
      const form = new FormData();
      form.append("file", blob, "voice-note.webm");
      // Optional: pass language hint like "en"
      // form.append("language", "en");

      const resp = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const body = (await resp.json().catch(() => null)) as unknown;
        const errMsg =
          body && typeof body === "object" && "error" in body
            ? String((body as { error?: unknown }).error ?? "")
            : "";
        throw new Error(errMsg || "Whisper transcription failed.");
      }

      const { text } = (await resp.json()) as { text: string };
      const finalTranscript = (text ?? "").trim();
      setWhisperText(finalTranscript);

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Please sign in again.");

      const audioPath = `${user.id}/${crypto.randomUUID()}.webm`;
      const contentType = blob.type && blob.type.length > 0 ? blob.type : "audio/webm";

      const { error: upErr } = await supabase.storage
        .from("audio")
        .upload(audioPath, blob, { contentType, upsert: false });
      if (upErr) throw upErr;

      // Use Whisper transcript for saved text; fall back to any live transcript.
      const transcriptText = finalTranscript || transcriptRef.current.trim();
      const title = buildTitleFromTranscript(transcriptText);

      const { data, error: insErr } = await supabase
        .from("entries")
        .insert({
          user_id: user.id,
          title,
          transcript: transcriptText || null,
          audio_path: audioPath,
          duration_seconds: Math.max(0, Math.floor(seconds)),
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

      router.replace(`/app/entries/${data.id}`);
    } catch (e: unknown) {
      setStatus("error");
      setError(
        errorMessage(e) ?? "Could not save this voice note. Please try again.",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl shadow-black/40">
      <div className="text-center">
        <p className="text-lg font-semibold">
          {status === "saving" ? "Saving…" : status === "error" ? "Problem" : "Recording…"}
        </p>
        <p className="mt-1 text-sm text-white/60">Express yourself freely</p>
      </div>

      <div className="mt-10">
        <WaveBars />
        <p className="mt-6 text-center text-lg font-semibold tabular-nums">
          {timeLabel}
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center">
        <button
          type="button"
          onClick={() => void stopAndSave()}
          disabled={status !== "recording"}
          className="group grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#FF4D9D] via-[#A855F7] to-[#5A7BFF] p-[3px] shadow-xl shadow-black/40 disabled:opacity-60"
          aria-label="Stop recording"
        >
          <span className="grid h-full w-full place-items-center rounded-full bg-[#0B1020]">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
              <Square className="h-6 w-6 text-white" />
            </span>
          </span>
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-white/60">Recording…</p>

      {whisperText?.trim() ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold text-white/70">Whisper transcript</p>
          <p className="mt-2 text-sm leading-6 text-white/85">{whisperText}</p>
        </div>
      ) : transcript.trim() ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold text-white/70">Live voice to text</p>
          <p className="mt-2 text-sm leading-6 text-white/85">{transcript}</p>
        </div>
      ) : (
        <p className="mt-6 text-center text-xs text-white/50">
          Tip: Live preview may be unavailable; final transcript comes from Whisper.
        </p>
      )}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
          <p className="text-sm text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => router.replace("/app")}
            className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#070A19]"
          >
            Back to journal
          </button>
        </div>
      ) : null}
    </div>
  );
}

