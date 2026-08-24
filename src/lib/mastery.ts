/**
 * Concept-level mastery + deterministic spaced repetition.
 *
 * Deliberately arithmetic, not probabilistic: the same answer history always
 * produces the same mastery level and the same due date. That makes the whole
 * thing testable, debuggable and explainable to the student ("you missed
 * CLmax AOA twice in a row, so it comes back tomorrow").
 */

import type { Attempt, ConceptId, EvidenceKind, MasteryLevel, MasteryRecord } from "./types";

export const DAY_MS = 86_400_000;

/** Newest-last window of outcomes kept per concept. */
export const RECENT_WINDOW = 8;

/**
 * Interval ladder in days, indexed by mastery level. Level 0/1 concepts come
 * back inside the same session-day; level 5 rests for two weeks.
 */
export const INTERVAL_BY_LEVEL: Record<MasteryLevel, number> = {
  0: 0,
  1: 0.25,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

/** Answering faster than this (ms) counts as confident. */
export const CONFIDENT_MS = 12_000;
/** Slower than this (ms) is "correct but shaky" — we shorten the interval. */
export const SLOW_MS = 25_000;

export function emptyMastery(conceptId: ConceptId): MasteryRecord {
  return {
    conceptId,
    level: 0,
    seen: 0,
    correct: 0,
    recent: [],
    lastSeenAt: null,
    dueAt: null,
    intervalDays: 0,
    applied: 0,
  };
}

/**
 * Recency-weighted accuracy over the recent window. The most recent answer
 * carries the most weight, so one fresh miss visibly dents a strong concept
 * without erasing a long correct history.
 */
export function weightedAccuracy(recent: boolean[]): number {
  if (recent.length === 0) return 0;
  let num = 0;
  let den = 0;
  recent.forEach((ok, i) => {
    // i = 0 is oldest; weight grows linearly toward the newest answer.
    const w = i + 1;
    den += w;
    if (ok) num += w;
  });
  return num / den;
}

/**
 * The ceiling a concept can reach on recognition alone.
 *
 * Level 5 is the claim the rest of the app acts on: it is what marks a
 * concept done on the readiness dial, what lets a lesson be skipped, and what
 * rests a concept for two weeks. Handing that out for six correct definition
 * questions is the "false mastery" failure — the student is told they know
 * something the exam has not actually asked them yet.
 *
 * "Strong" is the honest description of a concept you can reliably recognise
 * and have never had to use. It is a good score, it just is not the top one.
 */
export const RECOGNITION_CEILING: MasteryLevel = 4;

/**
 * Level is driven by recency-weighted accuracy, gated by exposure so a single
 * lucky answer can never read as "mastered", and gated again by the KIND of
 * evidence so recognition alone cannot either.
 */
export function levelFor(record: {
  seen: number;
  recent: boolean[];
  /** Correct application-tier answers. Defaults to none. */
  applied?: number;
}): MasteryLevel {
  const { seen, recent, applied = 0 } = record;
  if (seen === 0) return 0;

  const acc = weightedAccuracy(recent);
  const lastTwoWrong =
    recent.length >= 2 && !recent[recent.length - 1] && !recent[recent.length - 2];

  // Two consecutive misses always drops the concept into review territory.
  if (lastTwoWrong) return seen >= 4 ? 2 : 1;

  if (seen >= 6 && acc >= 0.95) {
    return applied >= 1 ? 5 : RECOGNITION_CEILING;
  }
  if (seen >= 4 && acc >= 0.85) return 4;
  if (seen >= 3 && acc >= 0.7) return 3;
  if (acc >= 0.5) return 2;
  return 1;
}

/**
 * Scheduling. Correct-and-confident earns the full interval for the new level;
 * correct-but-slow earns half; incorrect resets to a short interval and always
 * comes back inside the day.
 */
export function nextIntervalDays(
  level: MasteryLevel,
  correct: boolean,
  elapsedMs: number,
  previousIntervalDays: number,
): number {
  if (!correct) {
    // A miss collapses spacing but never fully to zero for well-known concepts,
    // so a fluke on a level-5 concept does not flood tomorrow's review.
    return Math.min(0.25, Math.max(0.05, previousIntervalDays * 0.1));
  }
  const base = INTERVAL_BY_LEVEL[level];
  if (elapsedMs > SLOW_MS) return Math.max(0.25, base * 0.5);
  if (elapsedMs > CONFIDENT_MS) return Math.max(0.25, base * 0.75);
  // Confident and correct: honour the ladder, but never shrink an earned interval.
  return Math.max(base, previousIntervalDays);
}

export interface MasteryUpdate {
  record: MasteryRecord;
  previousLevel: MasteryLevel;
  levelDelta: number;
}

export function applyAnswer(
  existing: MasteryRecord | undefined,
  conceptId: ConceptId,
  correct: boolean,
  elapsedMs: number,
  at: number,
  /**
   * What this answer proved. Defaults to recognition, which is the safe
   * assumption: an unclassified answer should never be the one that unlocks
   * mastery.
   */
  evidence: EvidenceKind = "recall",
): MasteryUpdate {
  const prev = existing ?? emptyMastery(conceptId);
  const recent = [...prev.recent, correct].slice(-RECENT_WINDOW);

  const seen = prev.seen + 1;
  const correctCount = prev.correct + (correct ? 1 : 0);
  // Only a correct application answer counts. Getting a hard question wrong
  // is not evidence that you can do the hard thing.
  const applied = prev.applied + (correct && evidence === "apply" ? 1 : 0);
  const level = levelFor({ seen, recent, applied });
  const intervalDays = nextIntervalDays(
    level,
    correct,
    elapsedMs,
    prev.intervalDays,
  );

  return {
    previousLevel: prev.level,
    levelDelta: level - prev.level,
    record: {
      conceptId,
      level,
      seen,
      correct: correctCount,
      recent,
      lastSeenAt: at,
      dueAt: at + intervalDays * DAY_MS,
      intervalDays,
      applied,
    },
  };
}

/** Applies one attempt across every concept the question is tagged with. */
export function applyAttempt(
  mastery: Record<ConceptId, MasteryRecord>,
  attempt: Attempt,
): { mastery: Record<ConceptId, MasteryRecord>; updates: MasteryUpdate[] } {
  const next = { ...mastery };
  const updates: MasteryUpdate[] = [];
  for (const conceptId of attempt.conceptIds) {
    const update = applyAnswer(
      next[conceptId],
      conceptId,
      attempt.correct,
      attempt.elapsedMs,
      attempt.at,
      attempt.evidence,
    );
    next[conceptId] = update.record;
    updates.push(update);
  }
  return { mastery: next, updates };
}

/** Merely seeing a concept in a lesson screen nudges it off "unseen". */
export function markIntroduced(
  mastery: Record<ConceptId, MasteryRecord>,
  conceptIds: ConceptId[],
  at: number,
): Record<ConceptId, MasteryRecord> {
  const next = { ...mastery };
  for (const id of conceptIds) {
    const existing = next[id];
    if (existing && existing.level > 0) continue;
    next[id] = {
      ...(existing ?? emptyMastery(id)),
      level: 1,
      lastSeenAt: at,
      dueAt: existing?.dueAt ?? at + INTERVAL_BY_LEVEL[1] * DAY_MS,
      intervalDays: existing?.intervalDays || INTERVAL_BY_LEVEL[1],
    };
  }
  return next;
}

/* ------------------------------------------------------------------ */
/* Aggregates                                                          */
/* ------------------------------------------------------------------ */

/** Mastery of one concept as a 0–1 fraction. */
export function conceptFraction(record: MasteryRecord | undefined): number {
  return (record?.level ?? 0) / 5;
}

/**
 * Readiness across a set of concepts, 0–100. Unseen concepts count as zero —
 * readiness is "how ready are you for the exam", not "how well did you do on
 * what you happened to study".
 */
export function readiness(
  mastery: Record<ConceptId, MasteryRecord>,
  conceptIds: ConceptId[],
): number {
  if (conceptIds.length === 0) return 0;
  const total = conceptIds.reduce(
    (sum, id) => sum + conceptFraction(mastery[id]),
    0,
  );
  return Math.round((total / conceptIds.length) * 100);
}

/**
 * Review priority: higher means "put this in front of the student sooner".
 * Combines how weak the concept is with how overdue it is.
 */
export function reviewPriority(
  record: MasteryRecord | undefined,
  now: number,
): number {
  if (!record || record.seen === 0) return 0;
  const weakness = 1 - conceptFraction(record);
  const overdueDays = record.dueAt ? (now - record.dueAt) / DAY_MS : 0;
  const overdue = Math.max(0, Math.min(overdueDays / 7, 1.5));
  const recentMiss = record.recent.at(-1) === false ? 0.5 : 0;
  return weakness * 2 + overdue + recentMiss;
}

export function isDue(record: MasteryRecord | undefined, now: number): boolean {
  if (!record || record.seen === 0) return false;
  if (record.level >= 5 && record.recent.at(-1) !== false) {
    return record.dueAt !== null && record.dueAt <= now;
  }
  return record.dueAt === null || record.dueAt <= now;
}

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: "Unseen",
  1: "Introduced",
  2: "Familiar",
  3: "Developing",
  4: "Strong",
  5: "Mastered",
};
