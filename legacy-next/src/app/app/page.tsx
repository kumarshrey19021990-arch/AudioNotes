"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { EntryList } from "@/components/EntryList";
import { supabase } from "@/lib/supabase";

function Journal() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="vj-title">Voice Journal</div>
      <div className="vj-prompt">What’s on your mind?</div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={() =>
            void supabase.auth.signOut().then(() => window.location.reload())
          }
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/15 disabled:opacity-60"
          aria-label="Sign out"
          disabled={loading}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <Link
        href="/app/record"
        className="vj-mic-wrapper"
        aria-label="Tap to record a voice note"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
        </svg>
      </Link>

      <div className="vj-tap">Tap to Record</div>

      <div className="vj-entries">{user ? <EntryList user={user} /> : null}</div>

      <button
        type="button"
        className="vj-cta"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        View All Entries
      </button>

      <p className="mt-5 vj-muted">
        Voice notes, audio to text, and voice to text — in one simple journal.
      </p>
    </div>
  );
}

export default function AppPage() {
  return (
    <AuthGate>
      <Journal />
    </AuthGate>
  );
}

