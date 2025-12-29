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
      <>
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            className="vj-entry"
            style={{ opacity: 0.6, justifyContent: "flex-start" }}
          >
            <div className="vj-entry-title" style={{ width: "60%" }}>
              Loading…
            </div>
            <div className="vj-entry-time">—</div>
          </div>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <div className="vj-entry" style={{ justifyContent: "space-between" }}>
        <div>
          <div className="vj-entry-title">Couldn’t load entries</div>
          <div className="vj-entry-time">{error}</div>
        </div>
        <button
          onClick={() => void load()}
          className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="vj-entry" style={{ justifyContent: "flex-start" }}>
        <div>
          <div className="vj-entry-title">No entries yet</div>
          <div className="vj-entry-time">
            Tap record to create your first voice note.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {entries.map((e) => (
        <Link
          key={e.id}
          href={`/app/entries/${e.id}`}
          className="vj-entry"
        >
          <div className="vj-entry-title">
            {e.title?.trim() ? e.title : "Untitled voice note"}
          </div>
          <div className="vj-entry-time">{formatDateTimeShort(e.created_at)}</div>
        </Link>
      ))}
    </>
  );
}

