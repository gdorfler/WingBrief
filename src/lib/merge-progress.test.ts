import { describe, expect, it } from "vitest";
import { isEmptyProgress, mergeProgress } from "./merge-progress";
import { emptyProgress } from "./storage";
import type { Attempt, CourseProgress, ExamResult, PredictionRecord, ProgressState } from "./types";

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 0, 10, 12, 0, 0);

function attempt(questionId: string, at: number, correct = true): Attempt {
  return { questionId, conceptIds: ["c-lift-def"], correct, elapsedMs: 4000, at, context: "lesson" };
}

function prediction(explainerId: string, scene: number, at: number): PredictionRecord {
  return {
    explainerId,
    scene,
    conceptIds: ["c-lift-def"],
    chosen: 0,
    answer: 1,
    correct: false,
    at,
  };
}

function exam(id: string, at: number, score: number): ExamResult {
  return {
    id,
    at,
    mode: "quick",
    label: "Quick check",
    questionIds: ["q1"],
    answers: { q1: "i:0" },
    correctIds: ["q1"],
    incorrectIds: [],
    flaggedIds: [],
    elapsedMs: 60_000,
    timed: false,
    score,
  };
}

/**
 * A document with some of everything, so merges exercise every branch.
 *
 * Overrides may name either course fields or platform fields; they are split
 * to the right place, which keeps the tests reading as plain progress rather
 * than as document plumbing.
 */
type Over = Partial<CourseProgress> & Partial<Pick<ProgressState, "streak" | "achievements" | "onboarded">>;

function populated(overrides: Over = {}): ProgressState {
  const { streak, achievements, onboarded, ...course } = overrides;
  const base = emptyProgress();
  const aero: CourseProgress = {
    xp: 400,
    mastery: {
      "c-lift-def": {
        conceptId: "c-lift-def",
        level: 3,
        seen: 6,
        correct: 5,
        recent: [true, true, false, true],
        lastSeenAt: T0,
        applied: 1,
        dueAt: T0 + 3 * DAY,
        intervalDays: 3,
      },
    },
    lessons: {
      l01: {
        lessonId: "l01",
        started: true,
        completed: true,
        bestScore: 0.8,
        attempts: 1,
        lastCompletedAt: T0,
        perfect: false,
      },
    },
    attempts: [attempt("q1", T0)],
    exams: [exam("e1", T0, 0.8)],
    savedQuestionIds: ["q1"],
    savedKnowColdIds: ["k1"],
    watchedExplainerIds: ["x1"],
    predictions: [
      {
        explainerId: "x-what-lift-really-is",
        scene: 2,
        conceptIds: ["c-lift-def"],
        chosen: 0,
        answer: 1,
        correct: false,
        at: 1_700_000_100_000,
      },
    ],
    ...course,
  };
  return {
    ...base,
    streak: streak ?? {
      current: 2,
      longest: 3,
      lastActiveDay: "2026-01-10",
      history: ["2026-01-10", "2026-01-09"],
    },
    achievements: achievements ?? [{ id: "first-flight", unlockedAt: T0 }],
    onboarded: onboarded ?? true,
    courses: { ...base.courses, aero },
  };
}

/** The Aerodynamics bucket of a merged result, which is what most tests assert on. */
const aeroOf = (s: ProgressState) => s.courses.aero;

describe("mergeProgress", () => {
  it("returns the other side when one is empty", () => {
    const local = populated();
    expect(aeroOf(mergeProgress(local, emptyProgress())).xp).toBe(400);
    expect(aeroOf(mergeProgress(emptyProgress(), local)).xp).toBe(400);
  });

  it("is idempotent — a retried sync changes nothing", () => {
    const state = populated();
    const once = mergeProgress(state, state);
    const twice = mergeProgress(once, state);
    expect(once).toEqual(twice);
    expect(aeroOf(once).attempts).toHaveLength(1);
    expect(aeroOf(once).lessons.l01.attempts).toBe(1);
    expect(aeroOf(once).xp).toBe(400);
  });

  it("is commutative — sync order between devices does not matter", () => {
    const phone = populated({ xp: 500, attempts: [attempt("q2", T0 + 1000)] });
    const laptop = populated({ xp: 300, attempts: [attempt("q3", T0 + 2000)] });
    expect(mergeProgress(phone, laptop)).toEqual(mergeProgress(laptop, phone));
  });

  it("unions attempts from both devices without duplicating shared ones", () => {
    const shared = attempt("q1", T0);
    const phone = populated({ attempts: [shared, attempt("q2", T0 + 1000)] });
    const laptop = populated({ attempts: [shared, attempt("q3", T0 + 2000)] });
    const merged = mergeProgress(phone, laptop);
    expect(aeroOf(merged).attempts.map((a) => a.questionId)).toEqual(["q1", "q2", "q3"]);
  });

  it("treats the same question answered at different times as two attempts", () => {
    const phone = populated({ attempts: [attempt("q1", T0)] });
    const laptop = populated({ attempts: [attempt("q1", T0 + 5000)] });
    expect(aeroOf(mergeProgress(phone, laptop)).attempts).toHaveLength(2);
  });

  it("unions predictions without duplicating a gate answered on both devices", () => {
    const shared = prediction("x-cl-vs-aoa", 3, T0);
    const phone = populated({
      predictions: [shared, prediction("x-aoa-in-90-seconds", 5, T0 + 1000)],
    });
    const laptop = populated({ predictions: [shared, prediction("fx-brief-void", 2, T0 + 2000)] });
    const merged = mergeProgress(phone, laptop);
    expect(aeroOf(merged).predictions.map((p) => p.explainerId)).toEqual([
      "x-cl-vs-aoa",
      "x-aoa-in-90-seconds",
      "fx-brief-void",
    ]);
  });

  it("treats the same gate answered on a second viewing as two predictions", () => {
    // Watching an explainer again and predicting again is two observations of
    // what the student believed, taken at two different times.
    const phone = populated({ predictions: [prediction("x-cl-vs-aoa", 3, T0)] });
    const laptop = populated({ predictions: [prediction("x-cl-vs-aoa", 3, T0 + 5000)] });
    expect(aeroOf(mergeProgress(phone, laptop)).predictions).toHaveLength(2);
  });

  it("keeps two gates in the same explainer apart", () => {
    const phone = populated({ predictions: [prediction("x-cl-vs-aoa", 3, T0)] });
    const laptop = populated({ predictions: [prediction("x-cl-vs-aoa", 6, T0)] });
    expect(aeroOf(mergeProgress(phone, laptop)).predictions).toHaveLength(2);
  });

  it("keeps the mastery record built from more practice", () => {
    const weak = populated();
    const strong = populated({
      mastery: {
        "c-lift-def": {
          ...aeroOf(populated()).mastery["c-lift-def"],
          level: 5,
          seen: 20,
          correct: 19,
        },
      },
    });
    expect(aeroOf(mergeProgress(weak, strong)).mastery["c-lift-def"].level).toBe(5);
    expect(aeroOf(mergeProgress(strong, weak)).mastery["c-lift-def"].seen).toBe(20);
  });

  it("never demotes a concept when both sides saw the same amount", () => {
    const low = populated();
    const high = populated({
      mastery: { "c-lift-def": { ...aeroOf(populated()).mastery["c-lift-def"], level: 5 } },
    });
    expect(aeroOf(mergeProgress(low, high)).mastery["c-lift-def"].level).toBe(5);
    expect(aeroOf(mergeProgress(high, low)).mastery["c-lift-def"].level).toBe(5);
  });

  it("keeps a lesson completed even if the other device never finished it", () => {
    const done = populated();
    const partial = populated({
      lessons: {
        l01: {
          lessonId: "l01",
          started: true,
          completed: false,
          bestScore: 0.2,
          attempts: 1,
          lastCompletedAt: null,
          perfect: false,
        },
      },
    });
    const merged = mergeProgress(done, partial);
    expect(aeroOf(merged).lessons.l01.completed).toBe(true);
    expect(aeroOf(merged).lessons.l01.bestScore).toBe(0.8);
  });

  it("dates an achievement from when it was first earned", () => {
    const early = populated({ achievements: [{ id: "first-flight", unlockedAt: T0 }] });
    const late = populated({ achievements: [{ id: "first-flight", unlockedAt: T0 + DAY }] });
    const merged = mergeProgress(late, early);
    expect(merged.achievements).toHaveLength(1);
    expect(merged.achievements[0].unlockedAt).toBe(T0);
  });

  it("rebuilds a streak split across two devices", () => {
    // Neither device alone shows a 4-day run; together they do.
    const phone = populated({
      streak: { current: 2, longest: 2, lastActiveDay: "2026-01-10", history: ["2026-01-10", "2026-01-09"] },
    });
    const laptop = populated({
      streak: { current: 2, longest: 2, lastActiveDay: "2026-01-08", history: ["2026-01-08", "2026-01-07"] },
    });
    const merged = mergeProgress(phone, laptop);
    expect(merged.streak.history).toEqual([
      "2026-01-10",
      "2026-01-09",
      "2026-01-08",
      "2026-01-07",
    ]);
    expect(merged.streak.current).toBe(4);
    expect(merged.streak.longest).toBe(4);
  });

  it("does not invent a streak across a missed day", () => {
    const a = populated({
      streak: { current: 1, longest: 1, lastActiveDay: "2026-01-10", history: ["2026-01-10"] },
    });
    const b = populated({
      streak: { current: 1, longest: 1, lastActiveDay: "2026-01-08", history: ["2026-01-08"] },
    });
    // 2026-01-09 is missing, so the live run is just the most recent day.
    expect(mergeProgress(a, b).streak.current).toBe(1);
  });

  it("remembers a long run that has aged out of the retained history", () => {
    const veteran = populated({
      streak: { current: 1, longest: 30, lastActiveDay: "2026-01-10", history: ["2026-01-10"] },
    });
    expect(mergeProgress(veteran, emptyProgress()).streak.longest).toBe(30);
  });

  it("takes the higher XP rather than summing the same work twice", () => {
    const merged = mergeProgress(populated({ xp: 500 }), populated({ xp: 300 }));
    expect(aeroOf(merged).xp).toBe(500);
  });

  it("unions saved and watched lists", () => {
    const a = populated({ savedQuestionIds: ["q1", "q2"], watchedExplainerIds: ["x1"] });
    const b = populated({ savedQuestionIds: ["q2", "q3"], watchedExplainerIds: ["x2"] });
    const merged = mergeProgress(a, b);
    expect(aeroOf(merged).savedQuestionIds.sort()).toEqual(["q1", "q2", "q3"]);
    expect(aeroOf(merged).watchedExplainerIds.sort()).toEqual(["x1", "x2"]);
  });

  it("dedupes exams by id and keeps them in order", () => {
    const a = populated({ exams: [exam("e1", T0, 0.8), exam("e2", T0 + DAY, 0.9)] });
    const b = populated({ exams: [exam("e1", T0, 0.8), exam("e3", T0 + 2 * DAY, 0.7)] });
    const merged = mergeProgress(a, b);
    expect(aeroOf(merged).exams.map((e) => e.id)).toEqual(["e1", "e2", "e3"]);
  });
});

describe("isEmptyProgress", () => {
  it("recognises a fresh state", () => {
    expect(isEmptyProgress(emptyProgress())).toBe(true);
  });

  it("recognises a state with real work in it", () => {
    expect(isEmptyProgress(populated())).toBe(false);
    const withWork = emptyProgress();
    withWork.courses.aero.attempts = [attempt("q1", T0)];
    expect(isEmptyProgress(withWork)).toBe(false);
  });

  it("ignores the onboarding flag, which is not progress", () => {
    expect(isEmptyProgress({ ...emptyProgress(), onboarded: true })).toBe(true);
  });
});
