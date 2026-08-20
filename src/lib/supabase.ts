"use client";

/**
 * Supabase client.
 *
 * Authentication is optional by design. With no Supabase project configured the
 * app runs exactly as before — everything in localStorage, no account, no
 * network — so a student can open it and start learning without a signup wall.
 * Configuring the two public env vars turns on accounts and cross-device sync.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Whether this build has an account backend wired up. */
export function isSupabaseConfigured(): boolean {
  return Boolean(URL && ANON_KEY);
}

let client: SupabaseClient | null = null;

/**
 * The shared browser client, or null when the app is running account-free.
 * Callers must handle null rather than assuming a backend exists.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!client) client = createBrowserClient(URL!, ANON_KEY!);
  return client;
}

/** Table holding one progress row per user. */
export const PROGRESS_TABLE = "progress";
