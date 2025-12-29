"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setStatus("sending");

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    const emailRedirectTo = `${window.location.origin}/app`;

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo },
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
    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-white/70">
        Save voice notes and audio to text transcripts to your private journal.
      </p>

      <form className="mt-6 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-2">
          <span className="text-xs font-semibold text-white/70">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending" || status === "sent"}
          className="h-12 rounded-2xl bg-white px-4 text-sm font-semibold text-[#070A19] hover:bg-white/90 disabled:opacity-60"
        >
          {status === "sending"
            ? "Sending…"
            : status === "sent"
              ? "Email sent"
              : "Send magic link"}
        </button>

        {message ? (
          <p
            className={`text-sm ${
              status === "error" ? "text-red-300" : "text-white/70"
            }`}
          >
            {message}
          </p>
        ) : null}
      </form>
    </div>
  );
}

