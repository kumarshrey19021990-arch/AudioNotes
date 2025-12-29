import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthGate } from "../components/AuthGate";
import { requireSupabase } from "../lib/supabase";
import { EntryList } from "../components/EntryList";

function setMeta(name, content) {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.setAttribute("content", content);
}

function JournalInner() {
  const supabase = requireSupabase();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    document.title = "Voice Journal App — Voice Notes";
    setMeta("description", "Record voice notes and save audio to text transcripts.");
  }, []);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user ?? null);
        setLoadingUser(false);
      })
      .catch(() => {
        setUser(null);
        setLoadingUser(false);
      });
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="vj-shell">
      <div className="app">
        <div className="title">Voice Journal</div>
        <div className="prompt">What’s on your mind?</div>

        <div className="top-actions">
          <button className="chip" type="button" onClick={() => void signOut()} disabled={loadingUser}>
            Sign out
          </button>
        </div>

        <Link className="mic-wrapper" to="/record" aria-label="Tap to record">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
          </svg>
        </Link>
        <div className="tap">Tap to Record</div>

        <div className="entries">{user ? <EntryList user={user} /> : null}</div>

        <button className="cta" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          View All Entries
        </button>

        <p className="muted" style={{ marginTop: 14 }}>
          Voice notes • Audio to text • Voice to text
        </p>
        <p className="muted" style={{ marginTop: 6 }}>
          <Link to="/" style={{ color: "inherit" }}>
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export function JournalPage() {
  return (
    <AuthGate>
      <JournalInner />
    </AuthGate>
  );
}

