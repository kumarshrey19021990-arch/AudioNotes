import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthGate } from "../components/AuthGate";
import { WaveBars } from "../components/WaveBars";
import { requireSupabase } from "../lib/supabase";
import { formatTime } from "../lib/format";

function buildTitleFromTranscript(t) {
  const trimmed = String(t || "").trim();
  if (!trimmed) return "Voice note";
  const words = trimmed.split(/\s+/).slice(0, 5).join(" ");
  return words.length > 64 ? `${words.slice(0, 61)}…` : words;
}

function RecordInner() {
  const supabase = requireSupabase();
  const nav = useNavigate();

  const [status, setStatus] = useState("starting"); // starting | recording | saving | error
  const [error, setError] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [previewText, setPreviewText] = useState("");

  const startAtRef = useRef(Date.now());
  const tickRef = useRef(null);
  const chunksRef = useRef([]);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const timeLabel = useMemo(() => formatTime(seconds), [seconds]);

  useEffect(() => {
    document.title = "Recording — Voice Journal";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setStatus("starting");
      setError(null);
      setPreviewText("");
      chunksRef.current = [];
      startAtRef.current = Date.now();
      setSeconds(0);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) return;
        streamRef.current = stream;

        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

        const recorder = new MediaRecorder(stream, { mimeType: mime });
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.start(250);

        tickRef.current = window.setInterval(() => {
          const delta = Math.floor((Date.now() - startAtRef.current) / 1000);
          setSeconds(delta);
        }, 250);

        setStatus("recording");
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Microphone permission denied.");
      }
    }

    void start();

    return () => {
      cancelled = true;
      if (tickRef.current) window.clearInterval(tickRef.current);
      try {
        recorderRef.current?.stop?.();
      } catch {
        // ignore
      }
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
    };
  }, []);

  async function stopAndSave() {
    if (status !== "recording") return;
    setStatus("saving");
    setError(null);

    if (tickRef.current) window.clearInterval(tickRef.current);

    const recorder = recorderRef.current;
    const stream = streamRef.current;

    const blob = await new Promise((resolve, reject) => {
      if (!recorder) {
        reject(new Error("Recorder not initialized."));
        return;
      }
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      try {
        recorder.stop();
      } catch (err) {
        reject(err);
      } finally {
        stream?.getTracks?.().forEach((t) => t.stop());
      }
    });

    try {
      // 1) Whisper transcription (server-side)
      const form = new FormData();
      form.append("file", blob, "voice-note.webm");
      const resp = await fetch("/api/transcribe", { method: "POST", body: form });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || "Whisper transcription failed.");
      }
      const { text } = await resp.json();
      const transcript = String(text || "").trim();
      setPreviewText(transcript);

      // 2) Save audio + entry to Supabase
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error("Please sign in again.");

      const audioPath = `${user.id}/${crypto.randomUUID()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("audio")
        .upload(audioPath, blob, { contentType: blob.type || "audio/webm", upsert: false });
      if (upErr) throw upErr;

      const title = buildTitleFromTranscript(transcript);
      const { data, error: insErr } = await supabase
        .from("entries")
        .insert({
          user_id: user.id,
          title,
          transcript: transcript || null,
          audio_path: audioPath,
          duration_seconds: Math.max(0, Math.floor(seconds)),
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      nav(`/entries/${data.id}`, { replace: true });
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not save this voice note.");
    }
  }

  return (
    <div className="vj-shell">
      <div className="app">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/app" className="chip" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            Back
          </Link>
          <span className="chip" style={{ opacity: 0.8, cursor: "default" }}>
            {status === "saving" ? "Saving…" : status === "recording" ? "Recording" : "Starting"}
          </span>
        </div>

        <div className="record-title">Recording…</div>
        <div className="record-sub">Express yourself freely</div>

        <div className="wave">
          <WaveBars />
        </div>

        <div className="time">{timeLabel}</div>

        <div className="stop-wrap">
          <button className="stop-btn" type="button" onClick={() => void stopAndSave()} disabled={status !== "recording"}>
            <span className="stop-btn-inner">
              <span className="stop-square" />
            </span>
          </button>
        </div>

        {previewText ? (
          <div className="card" style={{ marginTop: 18 }}>
            <div className="muted" style={{ textAlign: "left", marginBottom: 6 }}>
              Whisper transcript
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.55 }}>{previewText}</div>
          </div>
        ) : null}

        {error ? <div className="error">{error}</div> : null}
      </div>
    </div>
  );
}

export function RecordPage() {
  return (
    <AuthGate>
      <RecordInner />
    </AuthGate>
  );
}

