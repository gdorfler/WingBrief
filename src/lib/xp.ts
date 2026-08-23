/**
 * XP, streaks and achievements.
 *
 * Gamification here exists to reward the behaviour that actually produces exam
 * performance — retrieval, review of weak concepts, and coming back tomorrow —
 * not raw time-on-app. There is deliberately no rank progression: this is a
 * professional tool for adult military students.
 */

import type {
  AchievementState,
  ExamResult,
  LessonProgress,
  MasteryRecord,
  CourseProgressView,
  StreakState,
} from "./types";

/* ------------------------------------------------------------------ */
/* XP                                                                  */
/* ------------------------------------------------------------------ */

export const XP = {
  correctFirstTry: 10,
  correctAfterMiss: 4,
  incorrect: 1,
  lessonComplete: 40,
  lessonPerfect: 25,
  /** Bonus per concept that crossed into level 4 or 5 during a session. */
  conceptStrengthened: 15,
  reviewQuestion: 6,
  explainerWatched: 8,
  examCompleted: 60,
  examPerfect: 120,
  labExplored: 12,
} as const;

export function xpForAnswer(correct: boolean, firstTry: boolean): number {
  if (!correct) return XP.incorrect;
  return firstTry ? XP.correctFirstTry : XP.correctAfterMiss;
}

/** XP required to reach a given level. Grows ~quadratically, capped in slope. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(120 * (level - 1) ** 1.55);
}

export function levelFromXp(xp: number): {
  level: number;
  intoLevel: number;
  span: number;
  progress: number;
} {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 60) level += 1;
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const span = Math.max(1, ceil - floor);
  const intoLevel = xp - floor;
  return { level, intoLevel, span, progress: Math.min(1, intoLevel / span) };
}

/* ------------------------------------------------------------------ */
/* Streak                                                              */
/* ------------------------------------------------------------------ */

/** Local calendar day key. Streaks follow the student's own clock. */
export function dayKey(at: number): string {
  const d = new Date(at);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysBetweenKeys(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ta = Date.UTC(ay, am - 1, ad);
  const tb = Date.UTC(by, bm - 1, bd);
  return Math.round((tb - ta) / 86_400_000);
}

export function emptyStreak(): StreakState {
  return { current: 0, longest: 0, lastActiveDay: null, history: [] };
}

export function touchStreak(streak: StreakState, at: number): StreakState {
  const today = dayKey(at);
  if (streak.lastActiveDay === today) return streak;

  const gap =
    streak.lastActiveDay === null
      ? Infinity
      : daysBetweenKeys(streak.lastActiveDay, today);

  // A negative gap means the clock moved backwards (timezone/travel). Treat it
  // as the same day rather than punishing the student.
  const current = gap === 1 ? streak.current + 1 : gap <= 0 ? streak.current : 1;

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDay: today,
    history: [today, ...streak.history.filter((d) => d !== today)].slice(0, 60),
  };
}

/**
 * A streak that was not touched today is still alive (the day is not over) but
 * is broken if the last activity was more than one day ago.
 */
export function liveStreak(streak: StreakState, now: number): number {
  if (!streak.lastActiveDay) return 0;
  const gap = daysBetweenKeys(streak.lastActiveDay, dayKey(now));
  return gap <= 1 ? streak.current : 0;
}

/* ------------------------------------------------------------------ */
/* Achievements                                                        */
/* ------------------------------------------------------------------ */

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  test: (s: CourseProgressView, now: number) => boolean;
}

const lessonsCompleted = (s: CourseProgressView) =>
  Object.values(s.lessons).filter((l: LessonProgress) => l.completed).length;

const masteredCount = (s: CourseProgressView, unitPrefix?: string) =>
  Object.values(s.mastery).filter(
    (m: MasteryRecord) =>
      m.level >= 5 && (!unitPrefix || m.conceptId.startsWith(unitPrefix)),
  ).length;

const bestExam = (s: CourseProgressView) =>
  s.exams.reduce((best: number, e: ExamResult) => Math.max(best, e.score), 0);

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-flight",
    name: "First Flight",
    description: "Complete your first lesson.",
    icon: "takeoff",
    test: (s) => lessonsCompleted(s) >= 1,
  },
  {
    id: "first-solo",
    name: "First Solo",
    description: "Complete an entire unit.",
    icon: "wings",
    test: (s) => unitCompleted(s) >= 1,
  },
  {
    id: "lift-master",
    name: "Lift Master",
    description: "Master every concept in Understand the Wing.",
    icon: "airfoil",
    test: (s) => unitFullyMastered(s, "u2"),
  },
  {
    id: "drag-master",
    name: "Drag Master",
    description: "Master every concept in Master Drag.",
    icon: "drag",
    test: (s) => unitFullyMastered(s, "u3"),
  },
  {
    id: "stall-proof",
    name: "Stall Proof",
    description: "Reach strong mastery on all stall-mechanics concepts.",
    icon: "stall",
    test: (s) =>
      ["c-stall", "c-clmax-aoa", "c-bl-separation", "c-stall-speed"].every(
        (id) => (s.mastery[id]?.level ?? 0) >= 4,
      ),
  },
  {
    id: "curve-reader",
    name: "Curve Reader",
    description: "Answer 15 curve-shift or graph-reading questions correctly.",
    icon: "chart",
    test: (s) =>
      s.attempts.filter(
        (a) => a.correct && (a.questionId.includes("cs-") || a.questionId.includes("gr-")),
      ).length >= 15,
  },
  {
    id: "systems-thinker",
    name: "Systems Thinker",
    description: "Correctly order 10 cause-and-effect chains.",
    icon: "chain",
    test: (s) =>
      s.attempts.filter((a) => a.correct && a.questionId.includes("cc-")).length >= 10,
  },
  {
    id: "hot-streak",
    name: "Hot Streak",
    description: "Study seven days in a row.",
    icon: "flame",
    test: (s, now) => liveStreak(s.streak, now) >= 7,
  },
  {
    id: "no-go-around",
    name: "No Go-Around",
    description: "Finish a lesson with a perfect first-try score.",
    icon: "target",
    test: (s) => Object.values(s.lessons).some((l) => l.perfect),
  },
  {
    id: "quiz-ace",
    name: "Quiz Ace",
    description: "Score 90% or better on any practice exam.",
    icon: "star",
    test: (s) => bestExam(s) >= 0.9,
  },
  {
    id: "perfect-exam",
    name: "Perfect Exam",
    description: "Score 100% on a 20-question exam or longer.",
    icon: "medal",
    test: (s) => s.exams.some((e) => e.score === 1 && e.questionIds.length >= 20),
  },
  {
    id: "checkride-ready",
    name: "Checkride Ready",
    description: "Reach 85% overall readiness in any course.",
    icon: "shield",
    test: (s) => overallReadinessFromState(s) >= 85,
  },
];

/* These three helpers need the curriculum, injected to keep this module pure. */
let curriculumHooks: {
  unitConceptIds: (unit: string) => string[];
  unitLessonIds: (unit: string) => string[];
  allConceptIds: () => string[];
} = {
  unitConceptIds: () => [],
  unitLessonIds: () => [],
  allConceptIds: () => [],
};

export function registerCurriculumHooks(hooks: typeof curriculumHooks) {
  curriculumHooks = hooks;
}

function unitCompleted(s: CourseProgressView): number {
  const units = ["u1", "u2", "u3", "u4", "u5", "u6"];
  return units.filter((u) => {
    const ids = curriculumHooks.unitLessonIds(u);
    return ids.length > 0 && ids.every((id) => s.lessons[id]?.completed);
  }).length;
}

function unitFullyMastered(s: CourseProgressView, unit: string): boolean {
  const ids = curriculumHooks.unitConceptIds(unit);
  return ids.length > 0 && ids.every((id) => (s.mastery[id]?.level ?? 0) >= 5);
}

function overallReadinessFromState(s: CourseProgressView): number {
  const ids = curriculumHooks.allConceptIds();
  if (ids.length === 0) return 0;
  const total = ids.reduce((sum, id) => sum + (s.mastery[id]?.level ?? 0) / 5, 0);
  return Math.round((total / ids.length) * 100);
}

export function evaluateAchievements(
  state: CourseProgressView,
  now: number,
): AchievementState[] {
  const owned = new Set(state.achievements.map((a) => a.id));
  const newly: AchievementState[] = [];
  for (const def of ACHIEVEMENTS) {
    if (owned.has(def.id)) continue;
    try {
      if (def.test(state, now)) newly.push({ id: def.id, unlockedAt: now });
    } catch {
      // A malformed achievement predicate must never break a lesson.
    }
  }
  return newly;
}

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/** masteredCount is exported for the profile screen's stat row. */
export { masteredCount, lessonsCompleted, bestExam };
