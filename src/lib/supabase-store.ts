"use client";

/**
 * The account-backed progress store.
 *
 * Implements the same `ProgressStore` interface as `LocalProgressStore`, so the
 * learning engine has no idea whether it is talking to localStorage or Postgres.
 *
 * Two things make this safe on a flaky connection:
 *
 * 1. Every write also lands in localStorage. If the network is down mid-lesson
 *    the student loses nothing, and the next successful sync merges it up.
 * 2. Loads and saves merge rather than overwrite, so a device that has been
 *    offline for a week cannot wipe out work done elsewhere in the meantime.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeProgress } from "./merge-progress";
import {
  LocalProgressStore,
  emptyProgress,
  migrate,
  pruneProgress,
  type ProgressStore,
} from "./storage";
import { PROGRESS_TABLE } from "./supabase";
import type { ProgressState } from "./types";

/** Per-account localStorage key, so two accounts on one browser stay separate. */
export function cacheKeyFor(userId: string): string {
  return `wingbrief:progress:${userId}`;
}

export class SupabaseProgressStore implements ProgressStore {
  private cache: LocalProgressStore;

  constructor(
    private supabase: SupabaseClient,
    private userId: string,
  ) {
    this.cache = new LocalProgressStore(cacheKeyFor(userId));
  }

  /**
   * Read the server row and reconcile it with whatever this device has cached.
   * On a network error we fall back to the cache rather than handing back an
   * empty state, which would look to the student like their progress vanished.
   */
  async load(): Promise<ProgressState> {
    const local = await this.cache.load();
    try {
      const { data, error } = await this.supabase
        .from(PROGRESS_TABLE)
        .select("state")
        .eq("user_id", this.userId)
        .maybeSingle();

      if (error) throw error;
      if (!data?.state) return local;

      const remote = migrate(data.state);
      const merged = mergeProgress(local, remote);
      // Push the reconciled view back so both sides agree from here on.
      await this.cache.save(merged);
      return merged;
    } catch {
      return local;
    }
  }

  /**
   * Cache first, then upload. The cache write is the one that must not fail;
   * a failed upload is retried implicitly by the next save.
   */
  async save(state: ProgressState): Promise<void> {
    const pruned = pruneProgress(state);
    await this.cache.save(pruned);
    try {
      await this.supabase.from(PROGRESS_TABLE).upsert(
        {
          user_id: this.userId,
          state: pruned,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    } catch {
      // Offline. The cache holds it; the next successful save carries it up.
    }
  }

  async clear(): Promise<void> {
    await this.cache.clear();
    try {
      await this.supabase.from(PROGRESS_TABLE).delete().eq("user_id", this.userId);
    } catch {
      /* Nothing useful to do client-side; the local copy is already gone. */
    }
  }

  /**
   * Fold guest progress into the account. Called once when a student who has
   * been working signed-out signs in, so that work follows them into the
   * account instead of being stranded in the browser.
   */
  async adoptGuestProgress(guest: ProgressState): Promise<ProgressState> {
    const current = await this.load();
    const merged = mergeProgress(current, guest);
    await this.save(merged);
    return merged;
  }
}

/** Reads the signed-out progress blob so it can be adopted at sign-in. */
export async function readGuestProgress(): Promise<ProgressState> {
  try {
    return await new LocalProgressStore().load();
  } catch {
    return emptyProgress();
  }
}
