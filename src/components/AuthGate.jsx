import React, { useEffect, useState } from "react";
import { requireSupabase } from "../lib/supabase";
import { LoginForm } from "./LoginForm";

export function AuthGate({ children }) {
  const supabase = requireSupabase();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  if (loading) {
    return <div className="muted">Loading…</div>;
  }

  if (!session) return <LoginForm />;

  return <>{children}</>;
}

