"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut, Mic } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { EntryList } from "@/components/EntryList";
import { supabase } from "@/lib/supabase";
import { todayLabel } from "@/lib/format";

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
    <div className="pb-10">
      <div className="rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Voice Journal</h1>
            <p className="mt-1 text-sm text-white/60">{todayLabel()}</p>
            <p className="mt-3 text-sm text-white/70">What’s on your mind?</p>
          </div>

          <button
            type="button"
            onClick={() => void supabase.auth.signOut().then(() => window.location.reload())}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
            aria-label="Sign out"
            disabled={loading}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <div className="mt-8 grid place-items-center">
          <Link
            href="/app/record"
            className="group grid h-44 w-44 place-items-center rounded-full bg-gradient-to-br from-[#5A7BFF] via-[#A855F7] to-[#FF4D9D] p-[3px] shadow-xl shadow-black/40"
            aria-label="Tap to record a voice note"
          >
            <span className="grid h-full w-full place-items-center rounded-full bg-[#0B1020]">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/10 transition-transform group-hover:scale-[1.02]">
                <Mic className="h-9 w-9 text-white" />
              </span>
            </span>
          </Link>
          <p className="mt-4 text-sm text-white/70">Tap to Record</p>
        </div>

        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">Recent entries</h2>
            <Link
              href="/app"
              className="text-xs font-semibold text-white/70 hover:text-white"
            >
              Refresh
            </Link>
          </div>
          {user ? <EntryList user={user} /> : null}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-white/45">
        Voice notes • Audio to text • Voice to text
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

