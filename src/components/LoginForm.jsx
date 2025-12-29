import React, { useState } from "react";
import { requireSupabase } from "../lib/supabase";

export function LoginForm() {
  const supabase = requireSupabase();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [message, setMessage] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setMessage(null);
    setStatus("sending");

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for a magic link to sign in.");
  }

  return (
    <div className="card">
      <div className="title">Sign in</div>
      <div className="prompt" style={{ marginTop: 10 }}>
        Save voice notes and audio to text transcripts to your journal.
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 18, display: "grid", gap: 10 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          style={{
            height: 44,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(0,0,0,0.12)",
            color: "#fff",
            padding: "0 12px",
            outline: "none",
          }}
        />
        <button className="cta" type="submit" disabled={status === "sending" || status === "sent"}>
          {status === "sending" ? "Sending…" : status === "sent" ? "Email sent" : "Send magic link"}
        </button>
        {message ? (
          <div className="muted" style={{ color: status === "error" ? "#ffd0d0" : undefined }}>
            {message}
          </div>
        ) : null}
      </form>
    </div>
  );
}

