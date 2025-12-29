"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/lib/supabase";
import type { Entry } from "@/lib/types";
import { formatDateTimeShort } from "@/lib/format";

function EntryPageInner({ id }: { id: string }) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const createdLabel = useMemo(() => {
    if (!entry) return "";
    return formatDateTimeShort(entry.created_at);
  }, [entry]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      setSavedMsg(null);

      const { data, error: err } = await supabase
        .from("entries")
        .select("*")
        .eq("id", id)
        .single();

      if (!mounted) return;

      if (err) {
        setError(err.message);
        setEntry(null);
        setLoading(false);
        return;
      }

      const e = data as Entry;
      setEntry(e);
      setTitle(e.title ?? "");
      setTranscript(e.transcript ?? "");
      setLoading(false);

      if (e.audio_path) {
        const { data: signed, error: signErr } = await supabase.storage
          .from("audio")
          .createSignedUrl(e.audio_path, 60 * 60);
        if (!mounted) return;
        if (!signErr) setAudioUrl(signed?.signedUrl ?? null);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  async function save() {
    if (!entry) return;
    setSaving(true);
    setError(null);
    setSavedMsg(null);

    const { error: err } = await supabase
      .from("entries")
      .update({
        title: title.trim() || null,
        transcript: transcript.trim() || null,
      })
      .eq("id", entry.id);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setSavedMsg("Saved.");
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/70">Loading…</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="rounded-[2rem] border border-red-400/30 bg-red-500/10 p-6">
        <p className="text-sm text-red-200">{error ?? "Entry not found."}</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-4">
        <Link
          href="/app"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <article className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl shadow-black/40">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold">Voice note</h1>
            <p className="mt-1 text-xs text-white/60">{createdLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#070A19] hover:bg-white/90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save"}
          </button>
        </header>

        <div className="mt-6 grid gap-3">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-white/70">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled voice note"
              className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold text-white/70">
              Transcript (audio to text)
            </span>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your voice to text transcript will appear here…"
              className="min-h-[160px] resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
          </label>
        </div>

        {audioUrl ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold text-white/70">Audio</p>
            <audio className="mt-2 w-full" controls src={audioUrl} />
          </div>
        ) : null}

        {savedMsg ? <p className="mt-4 text-xs text-white/60">{savedMsg}</p> : null}
        {error ? (
          <p className="mt-4 text-sm text-red-200">Couldn’t save: {error}</p>
        ) : null}
      </article>
    </div>
  );
}

export default function EntryPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <AuthGate>
      <EntryPageInner id={params.id} />
    </AuthGate>
  );
}

