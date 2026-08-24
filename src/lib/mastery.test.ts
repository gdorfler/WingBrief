import { describe, expect, it } from "vitest";
import {
  DAY_MS,
  applyAnswer,
  applyAttempt,
  conceptFraction,
  emptyMastery,
  isDue,
  levelFor,
  RECOGNITION_CEILING,
  markIntroduced,
  nextIntervalDays,
  readiness,
  reviewPriority,
  weightedAccuracy,
} from "./mastery";
import type { Attempt } from "./types";

const NOW = 1_700_000_000_000;

describe("weightedAccuracy", () => {
  it("returns 0 for an empty history", () => {
    expect(weightedAccuracy([])).toBe(0);
  });

  it("weights the most recent answer most heavily", () => {
    // Same 50% raw accuracy, but the recent-correct case must score higher.
    const recentGood = weightedAccuracy([false, false, true, true]);
    const recentBad = weightedAccuracy([true, true, false, false]);
    expect(recentGood).toBeGreaterThan(recentBad);
    expect(recentGood).toBeGreaterThan(0.5);
    expect(recentBad).toBeLessThan(0.5);
  });

  it("is 1 for an all-correct history", () => {
    expect(weightedAccuracy([true, true, true])).toBe(1);
  });
});

describe("levelFor", () => {
  it("is 0 when never seen", () => {
    expect(levelFor({ seen: 0, recent: [] })).toBe(0);
  });

  it("requires exposure before awarding mastery", () => {
    // One perfect answer must not read as mastered.
    expect(levelFor({ seen: 1, recent: [true] })).toBeLessThan(5);
  });

  it("awards level 5 for sustained accuracy backed by application", () => {
    expect(
      levelFor({ seen: 6, recent: [true, true, true, true, true, true], applied: 1 }),
    ).toBe(5);
  });

  it("caps recognition-only work below mastery, however perfect it is", () => {
    // The false-mastery guard. Six flawless definition questions is a strong
    // record and still not proof the student can use the concept.
    expect(
      levelFor({ seen: 12, recent: [true, true, true, true, true, true, true, true], applied: 0 }),
    ).toBe(RECOGNITION_CEILING);
  });

  it("promotes to mastery as soon as one applied answer lands", () => {
    const recent = [true, true, true, true, true, true];
    expect(levelFor({ seen: 6, recent, applied: 0 })).toBe(RECOGNITION_CEILING);
    expect(levelFor({ seen: 6, recent, applied: 1 })).toBe(5);
  });

  it("treats missing evidence as recognition rather than assuming the best", () => {
    expect(levelFor({ seen: 6, recent: [true, true, true, true, true, true] })).toBe(
      RECOGNITION_CEILING,
    );
  });

  it("drops to review territory after two consecutive misses", () => {
    const level = levelFor({
      seen: 8,
      recent: [true, true, true, true, true, true, false, false],
    });
    expect(level).toBe(2);
  });
});

describe("nextIntervalDays", () => {
  it("collapses spacing after an incorrect answer", () => {
    expect(nextIntervalDays(5, false, 5_000, 14)).toBeLessThanOrEqual(0.25);
  });

  it("never returns zero after a miss on a well-known concept", () => {
    expect(nextIntervalDays(5, false, 5_000, 14)).toBeGreaterThan(0);
  });

  it("shortens the interval when the answer was slow", () => {
    const fast = nextIntervalDays(4, true, 3_000, 0);
    const slow = nextIntervalDays(4, true, 40_000, 0);
    expect(slow).toBeLessThan(fast);
  });

  it("never shrinks an already-earned interval on a confident correct", () => {
    expect(nextIntervalDays(3, true, 2_000, 10)).toBe(10);
  });
});

describe("applyAnswer", () => {
  it("increments exposure and records the outcome", () => {
    const { record } = applyAnswer(undefined, "c-stall", true, 5_000, NOW);
    expect(record.seen).toBe(1);
    expect(record.correct).toBe(1);
    expect(record.recent).toEqual([true]);
    expect(record.lastSeenAt).toBe(NOW);
    expect(record.dueAt).toBeGreaterThan(NOW);
  });

  it("caps the recent window at 8 entries", () => {
    let record = emptyMastery("c-stall");
    for (let i = 0; i < 12; i++) {
      record = applyAnswer(record, "c-stall", true, 4_000, NOW + i).record;
    }
    expect(record.recent).toHaveLength(8);
    expect(record.seen).toBe(12);
  });

  it("reports the level delta so the UI can celebrate a promotion", () => {
    let record = emptyMastery("c-ldmax");
    let lastDelta = 0;
    for (let i = 0; i < 6; i++) {
      const update = applyAnswer(record, "c-ldmax", true, 4_000, NOW + i * 1000, "apply");
      record = update.record;
      lastDelta = update.levelDelta;
    }
    expect(record.level).toBe(5);
    expect(lastDelta).toBeGreaterThanOrEqual(0);
  });

  it("counts only correct applied answers as application evidence", () => {
    // Getting the hard question wrong is not proof you can do the hard thing.
    const missed = applyAnswer(undefined, "c-vn", false, 9_000, NOW, "apply").record;
    expect(missed.applied).toBe(0);

    const landed = applyAnswer(missed, "c-vn", true, 9_000, NOW + 1, "apply").record;
    expect(landed.applied).toBe(1);
  });

  it("does not count recognition answers toward application evidence", () => {
    let record = emptyMastery("c-drag");
    for (let i = 0; i < 8; i++) {
      record = applyAnswer(record, "c-drag", true, 3_000, NOW + i, "recall").record;
    }
    expect(record.applied).toBe(0);
    expect(record.level).toBe(RECOGNITION_CEILING);
  });
});

describe("applyAttempt", () => {
  it("updates every concept the question is tagged with", () => {
    const attempt: Attempt = {
      questionId: "q-1",
      conceptIds: ["c-a", "c-b"],
      correct: true,
      elapsedMs: 4_000,
      at: NOW,
      context: "lesson",
    };
    const { mastery } = applyAttempt({}, attempt);
    expect(Object.keys(mastery).sort()).toEqual(["c-a", "c-b"]);
    expect(mastery["c-a"].seen).toBe(1);
    expect(mastery["c-b"].seen).toBe(1);
  });

  it("does not mutate the input record map", () => {
    const before = {};
    applyAttempt(before, {
      questionId: "q-1",
      conceptIds: ["c-a"],
      correct: false,
      elapsedMs: 1_000,
      at: NOW,
      context: "exam",
    });
    expect(before).toEqual({});
  });
});

describe("markIntroduced", () => {
  it("moves unseen concepts to level 1", () => {
    const mastery = markIntroduced({}, ["c-a", "c-b"], NOW);
    expect(mastery["c-a"].level).toBe(1);
    expect(mastery["c-b"].level).toBe(1);
  });

  it("never downgrades a concept the student already knows", () => {
    const strong = { ...emptyMastery("c-a"), level: 4 as const, seen: 5, correct: 5 };
    const mastery = markIntroduced({ "c-a": strong }, ["c-a"], NOW);
    expect(mastery["c-a"].level).toBe(4);
  });
});

describe("readiness", () => {
  it("counts unseen concepts as zero", () => {
    const mastery = { "c-a": { ...emptyMastery("c-a"), level: 5 as const } };
    // One mastered out of two concepts should read 50%, not 100%.
    expect(readiness(mastery, ["c-a", "c-b"])).toBe(50);
  });

  it("returns 0 for an empty concept list", () => {
    expect(readiness({}, [])).toBe(0);
  });

  it("returns 100 when everything is mastered", () => {
    const mastery = {
      "c-a": { ...emptyMastery("c-a"), level: 5 as const },
      "c-b": { ...emptyMastery("c-b"), level: 5 as const },
    };
    expect(readiness(mastery, ["c-a", "c-b"])).toBe(100);
  });
});

describe("scheduling and priority", () => {
  it("marks a concept due once its interval elapses", () => {
    const { record } = applyAnswer(undefined, "c-a", true, 3_000, NOW);
    expect(isDue(record, NOW)).toBe(false);
    expect(isDue(record, NOW + 30 * DAY_MS)).toBe(true);
  });

  it("ranks a weak overdue concept above a strong fresh one", () => {
    const weak = applyAnswer(undefined, "c-weak", false, 20_000, NOW - 10 * DAY_MS).record;
    let strong = emptyMastery("c-strong");
    for (let i = 0; i < 6; i++) {
      strong = applyAnswer(strong, "c-strong", true, 3_000, NOW).record;
    }
    expect(reviewPriority(weak, NOW)).toBeGreaterThan(reviewPriority(strong, NOW));
  });

  it("gives unseen concepts zero review priority", () => {
    expect(reviewPriority(undefined, NOW)).toBe(0);
  });
});

describe("conceptFraction", () => {
  it("maps levels onto 0–1", () => {
    expect(conceptFraction(undefined)).toBe(0);
    expect(conceptFraction({ ...emptyMastery("x"), level: 5 })).toBe(1);
    expect(conceptFraction({ ...emptyMastery("x"), level: 3 })).toBeCloseTo(0.6);
  });
});
