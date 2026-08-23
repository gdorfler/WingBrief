import { describe, expect, it } from "vitest";
import { groupPlacementCandidates, placementCandidates } from "./placement";
import { emptyCourseProgress } from "./storage";
import { emptyStreak } from "./xp";
import type { CourseProgressView, Lesson, MasteryRecord } from "./types";

const UNITS = [
  { id: "u1", title: "Basics" },
  { id: "u2", title: "Advanced" },
];

function lesson(id: string, index: number, unit: string, conceptIds: string[]): Lesson {
  return {
    id,
    unit,
    index,
    title: `Lesson ${id}`,
    subtitle: "Subtitle",
    estimatedMinutes: 6,
    enablingObjectives: [],
    conceptIds,
    mapIcon: "vector",
    screens: [],
    questionIds: [],
    memorize: [],
    sourceReferences: [],
    masteryThreshold: 0.8,
  };
}

/** A mastery record at a given level, built the way the real engine would. */
function record(level: 0 | 1 | 2 | 3 | 4 | 5, seen = 6): MasteryRecord {
  return {
    conceptId: "c",
    level,
    seen,
    correct: seen,
    recent: Array(Math.min(seen, 8)).fill(true),
    lastSeenAt: Date.now(),
    dueAt: null,
    intervalDays: 1,
  };
}

function view(
  lessons: Record<string, boolean>,
  mastery: Record<string, MasteryRecord>,
): CourseProgressView {
  return {
    ...emptyCourseProgress(),
    lessons: Object.fromEntries(
      Object.entries(lessons).map(([id, completed]) => [
        id,
        {
          lessonId: id,
          started: true,
          completed,
          bestScore: completed ? 1 : 0,
          attempts: 1,
          lastCompletedAt: completed ? Date.now() : null,
          perfect: false,
        },
      ]),
    ),
    mastery,
    streak: emptyStreak(),
    achievements: [],
    onboarded: true,
    activeCourse: "aero",
  };
}

describe("placementCandidates", () => {
  it("credits a lesson whose concepts are all solidly mastered", () => {
    const lessons = [lesson("l1", 1, "u1", ["c1", "c2"])];
    const candidates = placementCandidates(
      lessons,
      UNITS,
      view({}, { c1: record(5), c2: record(4) }),
    );
    expect(candidates).toHaveLength(1);
    expect(candidates[0]).toMatchObject({ lessonId: "l1", unitTitle: "Basics" });
    expect(candidates[0].score).toBeCloseTo(0.9, 5);
  });

  it("never credits an already-completed lesson", () => {
    const lessons = [lesson("l1", 1, "u1", ["c1"])];
    const candidates = placementCandidates(lessons, UNITS, view({ l1: true }, { c1: record(5) }));
    expect(candidates).toEqual([]);
  });

  it("skips a lesson with any concept never seen", () => {
    const lessons = [lesson("l1", 1, "u1", ["c1", "c2"])];
    const candidates = placementCandidates(lessons, UNITS, view({}, { c1: record(5) }));
    expect(candidates).toEqual([]);
  });

  it("skips a lesson with any concept below the weak cutoff, even if the average clears the bar", () => {
    // Average of 5 and 3 is 4/5 = 0.8, which would pass a naive threshold —
    // but one concept at level 2 means it has not actually been proven.
    const lessons = [lesson("l1", 1, "u1", ["c1", "c2"])];
    const candidates = placementCandidates(
      lessons,
      UNITS,
      view({}, { c1: record(5), c2: record(2) }),
    );
    expect(candidates).toEqual([]);
  });

  it("respects each lesson's own masteryThreshold", () => {
    const strict = { ...lesson("l1", 1, "u1", ["c1"]), masteryThreshold: 0.95 };
    const lenient = { ...lesson("l2", 2, "u1", ["c2"]), masteryThreshold: 0.6 };
    // Level 4 → fraction 0.8: clears 0.6, misses 0.95.
    const candidates = placementCandidates(
      [strict, lenient],
      UNITS,
      view({}, { c1: record(4), c2: record(4) }),
    );
    expect(candidates.map((c) => c.lessonId)).toEqual(["l2"]);
  });

  it("never credits a lesson with no concepts to prove", () => {
    const lessons = [lesson("l1", 1, "u1", [])];
    const candidates = placementCandidates(lessons, UNITS, view({}, {}));
    expect(candidates).toEqual([]);
  });

  it("orders candidates by lesson index", () => {
    const lessons = [
      lesson("l3", 3, "u1", ["c3"]),
      lesson("l1", 1, "u1", ["c1"]),
      lesson("l2", 2, "u1", ["c2"]),
    ];
    const candidates = placementCandidates(
      lessons,
      UNITS,
      view({}, { c1: record(5), c2: record(5), c3: record(5) }),
    );
    expect(candidates.map((c) => c.lessonId)).toEqual(["l1", "l2", "l3"]);
  });
});

describe("groupPlacementCandidates", () => {
  it("groups by unit, preserving each unit's title", () => {
    const candidates = placementCandidates(
      [lesson("l1", 1, "u1", ["c1"]), lesson("l2", 2, "u2", ["c2"])],
      UNITS,
      view({}, { c1: record(5), c2: record(5) }),
    );
    const grouped = groupPlacementCandidates(candidates);
    expect(grouped.map((g) => g.unit)).toEqual(["u1", "u2"]);
    expect(grouped[0].unitTitle).toBe("Basics");
    expect(grouped[0].lessons.map((l) => l.lessonId)).toEqual(["l1"]);
  });
});
