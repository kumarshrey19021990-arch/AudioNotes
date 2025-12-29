import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { requireSupabase } from "../lib/supabase";
import { formatDateTimeShort } from "../lib/format";

export function EntryList({ user }) {
  const supabase = requireSupabase();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    setEntries(Array.isArray(data) ? data : []);
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
          <div key={k} className="entry" style={{ opacity: 0.7 }}>
            <div className="entry-title">Loading…</div>
            <div className="entry-time">—</div>
          </div>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <div className="entry" style={{ justifyContent: "space-between" }}>
        <div style={{ minWidth: 0 }}>
          <div className="entry-title">Couldn’t load entries</div>
          <div className="entry-time" style={{ whiteSpace: "normal" }}>
            {error}
          </div>
        </div>
        <button type="button" className="chip" onClick={() => void load()}>
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="entry" style={{ justifyContent: "flex-start" }}>
        <div>
          <div className="entry-title">No entries yet</div>
          <div className="entry-time">Tap record to create your first voice note.</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {entries.map((e) => (
        <Link key={e.id} to={`/entries/${e.id}`} className="entry">
          <div className="entry-title">{e.title?.trim() ? e.title : "Untitled voice note"}</div>
          <div className="entry-time">{formatDateTimeShort(e.created_at)}</div>
        </Link>
      ))}
    </>
  );
}

