import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthGate } from "../components/AuthGate";
import { requireSupabase } from "../lib/supabase";

export function EntryPage() {
  return (
    <AuthGate>
      <EntryInner />
    </AuthGate>
  );
}

function EntryInner() {
  const supabase = requireSupabase();
  const { id } = useParams();

  const [entry, setEntry] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedMsg, setSavedMsg] = useState(null);

  useEffect(() => {
    document.title = "Entry — Voice Journal";
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      setSavedMsg(null);

      const { data, error: err } = await supabase.from("entries").select("*").eq("id", id).single();
      if (!mounted) return;

      if (err) {
        setError(err.message);
        setEntry(null);
        setLoading(false);
        return;
      }

      setEntry(data);
      setTitle(data.title ?? "");
      setTranscript(data.transcript ?? "");
      setLoading(false);

      if (data.audio_path) {
        const { data: signed, error: signErr } = await supabase.storage
          .from("audio")
          .createSignedUrl(data.audio_path, 60 * 60);
        if (!mounted) return;
        if (!signErr) setAudioUrl(signed?.signedUrl ?? null);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [id, supabase]);

  async function save() {
    if (!entry) return;
    setSaving(true);
    setError(null);
    setSavedMsg(null);

    const { error: err } = await supabase
      .from("entries")
      .update({ title: title.trim() || null, transcript: transcript.trim() || null })
      .eq("id", entry.id);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    setSavedMsg("Saved.");
    setSaving(false);
  }

  return (
    <div className="vj-shell">
      <div className="app">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link to="/app" className="chip" style={{ textDecoration: "none" }}>
            Back
          </Link>
          <button className="chip" type="button" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {loading ? (
          <div className="muted" style={{ marginTop: 16 }}>
            Loading…
          </div>
        ) : !entry ? (
          <div className="error">{error || "Entry not found."}</div>
        ) : (
          <>
            <div className="card" style={{ marginTop: 16 }}>
              <div className="muted" style={{ textAlign: "left", marginBottom: 8 }}>
                Title
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled voice note"
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(0,0,0,0.12)",
                  color: "#fff",
                  padding: "0 12px",
                  outline: "none",
                }}
              />
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div className="muted" style={{ textAlign: "left", marginBottom: 8 }}>
                Transcript (audio to text)
              </div>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Your voice to text transcript will appear here…"
                style={{
                  width: "100%",
                  minHeight: 160,
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(0,0,0,0.12)",
                  color: "#fff",
                  padding: 12,
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.55,
                }}
              />
            </div>

            {audioUrl ? (
              <div className="card" style={{ marginTop: 12 }}>
                <div className="muted" style={{ textAlign: "left", marginBottom: 8 }}>
                  Audio
                </div>
                <audio controls src={audioUrl} style={{ width: "100%" }} />
              </div>
            ) : null}

            {savedMsg ? <div className="muted" style={{ marginTop: 10 }}>{savedMsg}</div> : null}
            {error ? <div className="error">{error}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}

