"use client";

/**
 * Session state.
 *
 * Deliberately thin: it knows who is signed in and how to change that, and
 * nothing about progress. `ProgressProvider` watches this and swaps its storage
 * adapter when the user changes.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export interface AuthApi {
  /** Null while signed out, or when no backend is configured. */
  user: User | null;
  session: Session | null;
  /** False until the first session check resolves, to avoid a signed-out flash. */
  ready: boolean;
  /** Whether this build has accounts at all. */
  enabled: boolean;
  /** Sends a sign-in link. Resolves with an error message, or null on success. */
  sendLink: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const enabled = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!enabled);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendLink = useCallback(async (email: string): Promise<string | null> => {
    const supabase = getSupabase();
    if (!supabase) return "Accounts are not configured for this build.";
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return "That does not look like an email address.";
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return error ? error.message : null;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ user: session?.user ?? null, session, ready, enabled, sendLink, signOut }),
    [session, ready, enabled, sendLink, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
