"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Entry } from "@/lib/types";
import { formatDateTimeShort } from "@/lib/format";

export function EntryList({ user }: { user: User }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (err) {
      setError(err.message);
      setEntries([]);
      setLoading(false);
      return;
    }

    setEntries((data ?? []) as Entry[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  if (loading) {
    return (
      <div className="grid gap-3">
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            className="h-[60px] rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4">
        <p className="text-sm text-red-200">Couldn’t load entries: {error}</p>
        <button
          onClick={() => void load()}
          className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#070A19]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm text-white/70">
          No voice notes yet. Tap record to create your first audio to text entry.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {entries.map((e) => (
        <Link
          key={e.id}
          href={`/app/entries/${e.id}`}
          className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/90">
              {e.title?.trim() ? e.title : "Untitled voice note"}
            </p>
            <p className="truncate text-xs text-white/60">
              {formatDateTimeShort(e.created_at)}
              {e.transcript?.trim()
                ? ` · ${e.transcript.trim().slice(0, 60)}`
                : ""}
            </p>
          </div>
          <div className="ml-4 h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/10 group-hover:bg-white/15" />
        </Link>
      ))}
    </div>
  );
}

