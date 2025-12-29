import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function setMeta(name, content) {
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.setAttribute("content", content);
}

export function LandingPage() {
  useEffect(() => {
    document.title = "Voice Journal — Voice Notes, Audio to Text, Voice to Text";
    setMeta(
      "description",
      "Record voice notes and convert audio to text with Whisper. A simple voice to text journal built with React and Supabase.",
    );
  }, []);

  return (
    <div className="vj-shell">
      <div className="app">
        <div className="title">Voice Journal</div>
        <div className="prompt">
          Voice notes that turn <strong>audio to text</strong> — fast. Keep a private{" "}
          <strong>voice to text</strong> journal you can search later.
        </div>

        <Link className="mic-wrapper" to="/app" aria-label="Open voice notes app">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
          </svg>
        </Link>
        <div className="tap">Open the app</div>

        <div className="entries">
          <div className="entry" style={{ justifyContent: "center" }}>
            <div className="entry-title" style={{ textAlign: "center", whiteSpace: "normal" }}>
              Keywords: voice notes • audio to text • voice to text
            </div>
          </div>
        </div>

        <Link to="/app" className="cta" style={{ display: "inline-block", textAlign: "center", textDecoration: "none" }}>
          Start recording
        </Link>
      </div>
    </div>
  );
}

