/**
 * A one-shot signal from "a lesson just finished" to "the lesson map should
 * fly its marker there."
 *
 * sessionStorage rather than component state because the two moments happen
 * on different pages — the lesson-complete screen and the flight-path page —
 * with a full navigation in between. Consumed exactly once: reading it clears
 * it, so coming back to the map later never replays a stale flight.
 */

const KEY = "wb:route-marker-flight";
const MAX_AGE_MS = 5 * 60_000;

interface FlightSignal {
  lessonId: string;
  ts: number;
  xpEarned?: number;
}

export function signalLessonCompleted(lessonId: string, xpEarned?: number) {
  if (typeof window === "undefined") return;
  try {
    const payload: FlightSignal = { lessonId, ts: Date.now(), xpEarned };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable (private mode, quota) — the map simply will
    // not animate the flight, which is not worth failing anything over.
  }
}

/**
 * Reads the signal WITHOUT clearing it, returning it only if it names a
 * lesson on this map.
 *
 * Deliberately side-effect-free so it is safe to use as a `useState` lazy
 * initializer: React's Strict Mode calls initializers twice in development to
 * catch exactly the bug a clear-on-read version would have had here — the
 * first call would consume the signal and the second, finding nothing left,
 * would overwrite it with null before the component ever saw it. Pair with
 * `clearLessonCompletedSignal`, called once from an effect, to actually
 * consume it.
 */
export function peekLessonCompletedSignal(validLessonIds: string[]): FlightSignal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FlightSignal;
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null;
    if (!validLessonIds.includes(parsed.lessonId)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Clears the signal so a later visit never replays the same flight. Idempotent. */
export function clearLessonCompletedSignal() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do — worst case a stale signal lingers and expires on its own.
  }
}
