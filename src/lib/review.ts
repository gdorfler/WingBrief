/**
 * Review scheduling: what the student should do next, and why.
 *
 * Pure functions over (curriculum, progress, now) so every recommendation is
 * reproducible and testable. Nothing here reaches for global state.
 */

import { isDue, reviewPriority, conceptFraction } from "./mastery";
import type {
  Concept,
  ConceptId,
  Lesson,
  MasteryRecord,
  CourseProgressView,
  Question,
  UnitId,
} from "./types";

export interface WeakConcept {
  concept: Concept;
  record: MasteryRecord | undefined;
  /** 0–100. */
  mastery: number;
  priority: number;
  due: boolean;
  /** Questions available to drill this concept. */
  questionCount: number;
}

export function weakConcepts(
  concepts: Concept[],
  questions: Question[],
  mastery: Record<ConceptId, MasteryRecord>,
  now: number,
  opts: { includeUnseen?: boolean; limit?: number; unit?: UnitId } = {},
): WeakConcept[] {
  const counts = new Map<ConceptId, number>();
  for (const q of questions) {
    for (const c of q.conceptIds) counts.set(c, (counts.get(c) ?? 0) + 1);
  }

  return concepts
    .filter((c) => (opts.unit ? c.unit === opts.unit : true))
    .map((concept) => {
      const record = mastery[concept.id];
      return {
        concept,
        record,
        mastery: Math.round(conceptFraction(record) * 100),
        priority: reviewPriority(record, now),
        due: isDue(record, now),
        questionCount: counts.get(concept.id) ?? 0,
      };
    })
    .filter((w) => {
      if (w.questionCount === 0) return false;
      if (!w.record || w.record.seen === 0) return opts.includeUnseen === true;
      return w.record.level < 4;
    })
    .sort((a, b) => b.priority - a.priority || a.mastery - b.mastery)
    .slice(0, opts.limit ?? 50);
}

export interface UnitReadiness {
  unit: UnitId;
  title: string;
  readiness: number;
  conceptsTotal: number;
  conceptsMastered: number;
  lessonsTotal: number;
  lessonsCompleted: number;
}

export function unitReadiness(
  units: { id: UnitId; title: string }[],
  concepts: Concept[],
  lessons: Lesson[],
  state: CourseProgressView,
): UnitReadiness[] {
  return units.map((u) => {
    const unitConcepts = concepts.filter((c) => c.unit === u.id);
    const unitLessons = lessons.filter((l) => l.unit === u.id);
    const total = unitConcepts.reduce(
      (sum, c) => sum + conceptFraction(state.mastery[c.id]),
      0,
    );
    return {
      unit: u.id,
      title: u.title,
      readiness:
        unitConcepts.length === 0
          ? 0
          : Math.round((total / unitConcepts.length) * 100),
      conceptsTotal: unitConcepts.length,
      conceptsMastered: unitConcepts.filter(
        (c) => (state.mastery[c.id]?.level ?? 0) >= 5,
      ).length,
      lessonsTotal: unitLessons.length,
      lessonsCompleted: unitLessons.filter((l) => state.lessons[l.id]?.completed)
        .length,
    };
  });
}

export function overallReadiness(
  concepts: Concept[],
  mastery: Record<ConceptId, MasteryRecord>,
): number {
  if (concepts.length === 0) return 0;
  const total = concepts.reduce(
    (sum, c) => sum + conceptFraction(mastery[c.id]),
    0,
  );
  return Math.round((total / concepts.length) * 100);
}

/* ------------------------------------------------------------------ */
/* Lesson gating                                                       */
/* ------------------------------------------------------------------ */

export type LessonNodeState =
  | "locked"
  | "current"
  | "completed"
  | "mastered"
  | "weak"
  | "perfect";

/**
 * Lessons unlock in order, but never punitively: finishing lesson N unlocks
 * N+1, and the first incomplete lesson is always "current" and always open.
 */
export function lessonStates(
  lessons: Lesson[],
  state: CourseProgressView,
): Record<string, LessonNodeState> {
  const ordered = [...lessons].sort((a, b) => a.index - b.index);
  const out: Record<string, LessonNodeState> = {};
  let currentAssigned = false;

  for (const lesson of ordered) {
    const progress = state.lessons[lesson.id];

    if (progress?.completed) {
      const conceptLevels: number[] = lesson.conceptIds.map(
        (c) => state.mastery[c]?.level ?? 0,
      );
      const avg =
        conceptLevels.length === 0
          ? 0
          : conceptLevels.reduce((a, b) => a + b, 0) / conceptLevels.length;
      const anyWeak = conceptLevels.some((l) => l > 0 && l < 3);

      if (avg >= 4.5) out[lesson.id] = "mastered";
      else if (anyWeak) out[lesson.id] = "weak";
      else if (progress.perfect) out[lesson.id] = "perfect";
      else out[lesson.id] = "completed";
      continue;
    }

    // The first incomplete lesson is the one the student is on; everything
    // after it stays locked so the map reads as a single flight path.
    out[lesson.id] = currentAssigned ? "locked" : "current";
    currentAssigned = true;
  }
  return out;
}

export function isLessonOpen(
  lessonId: string,
  states: Record<string, LessonNodeState>,
): boolean {
  return states[lessonId] !== "locked";
}

/* ------------------------------------------------------------------ */
/* Today's Flight                                                      */
/* ------------------------------------------------------------------ */

export type FlightItemKind =
  | "newLesson"
  | "weakConcepts"
  | "spacedReview"
  | "challenge"
  | "explainer";

export interface FlightItem {
  kind: FlightItemKind;
  title: string;
  detail: string;
  minutes: number;
  href: string;
  /** Concepts or lesson this item addresses, for the "why" line. */
  meta?: string[];
  /**
   * The lesson diagram glyph to show, when this item is a specific lesson.
   * Lets the plan show what the lesson is about rather than a generic play icon.
   */
  art?: string;
}

export interface DailyFlight {
  totalMinutes: number;
  items: FlightItem[];
}

/**
 * Builds the "Today's Flight" plan. Order matters: warm up on due reviews,
 * repair the weakest concepts, then learn something new, then a challenge.
 * Total target is 8–12 minutes so the session stays daily-doable.
 */
export function buildDailyFlight(
  params: {
    lessons: Lesson[];
    concepts: Concept[];
    questions: Question[];
    explainers: { id: string; title: string; conceptIds: ConceptId[] }[];
  },
  state: CourseProgressView,
  now: number,
): DailyFlight {
  const { lessons, concepts, questions, explainers } = params;
  const items: FlightItem[] = [];

  const due = concepts
    .map((c) => ({ c, r: state.mastery[c.id] }))
    .filter((x) => x.r && x.r.seen > 0 && isDue(x.r, now))
    .sort(
      (a, b) => reviewPriority(b.r, now) - reviewPriority(a.r, now),
    );

  if (due.length > 0) {
    const n = Math.min(due.length, 8);
    items.push({
      kind: "spacedReview",
      title: `${n} spaced review${n === 1 ? "" : "s"}`,
      detail: "Concepts scheduled to come back today.",
      minutes: Math.max(2, Math.round(n * 0.4)),
      href: "/review/spaced",
      meta: due.slice(0, 3).map((x) => x.c.name),
    });
  }

  const weak = weakConcepts(concepts, questions, state.mastery, now, {
    limit: 3,
  });
  if (weak.length > 0) {
    items.push({
      kind: "weakConcepts",
      title: `${weak.length} weak concept${weak.length === 1 ? "" : "s"}`,
      detail: "Your lowest-mastery ideas, drilled with targeted questions.",
      minutes: 3,
      href: "/review/weak",
      meta: weak.map((w) => w.concept.name),
    });
  }

  const states = lessonStates(lessons, state);
  const nextLesson = [...lessons]
    .sort((a, b) => a.index - b.index)
    .find((l) => states[l.id] === "current");

  if (nextLesson) {
    items.push({
      kind: "newLesson",
      title: nextLesson.title,
      detail: `New lesson · Unit ${nextLesson.unit.slice(1)} · ${nextLesson.subtitle}`,
      minutes: nextLesson.estimatedMinutes,
      href: `/lessons/${nextLesson.id}`,
      meta: [nextLesson.subtitle],
      art: nextLesson.mapIcon,
    });
  } else {
    items.push({
      kind: "challenge",
      title: "20-question quick exam",
      detail: "Every lesson is complete — keep the edge with a timed set.",
      minutes: 12,
      href: "/exam?mode=quick",
    });
  }

  // A single explainer, chosen to reinforce whatever is weakest and unwatched.
  const watched = new Set(state.watchedExplainerIds);
  const weakIds = new Set(weak.map((w) => w.concept.id));
  const explainer =
    explainers.find(
      (e) => !watched.has(e.id) && e.conceptIds.some((c) => weakIds.has(c)),
    ) ?? explainers.find((e) => !watched.has(e.id));

  if (explainer) {
    items.push({
      kind: "explainer",
      title: explainer.title,
      detail: "90-second visual explainer.",
      minutes: 2,
      href: `/explainers/${explainer.id}`,
    });
  }

  return {
    totalMinutes: items.reduce((sum, i) => sum + i.minutes, 0),
    items,
  };
}

/* ------------------------------------------------------------------ */
/* Question selection for review sessions                              */
/* ------------------------------------------------------------------ */

/**
 * Picks review questions for a set of concepts, preferring questions the
 * student has actually missed, then unseen questions, then anything else.
 */
export function selectReviewQuestions(
  questions: Question[],
  conceptIds: ConceptId[],
  state: CourseProgressView,
  count: number,
): Question[] {
  const wanted = new Set(conceptIds);
  const candidates = questions.filter((q) =>
    q.conceptIds.some((c) => wanted.has(c)),
  );

  const missedIds = new Set(
    state.attempts.filter((a) => !a.correct).map((a) => a.questionId),
  );
  const seenIds = new Set(state.attempts.map((a) => a.questionId));

  const missed = candidates.filter((q) => missedIds.has(q.id));
  const unseen = candidates.filter((q) => !seenIds.has(q.id));
  const rest = candidates.filter(
    (q) => seenIds.has(q.id) && !missedIds.has(q.id),
  );

  return [...missed, ...unseen, ...rest].slice(0, count);
}

/** Every question the student has ever got wrong and not since fixed. */
export function outstandingMistakes(
  questions: Question[],
  state: CourseProgressView,
): Question[] {
  const byQuestion = new Map<string, boolean>();
  for (const a of state.attempts) {
    byQuestion.set(a.questionId, a.correct);
  }
  const ids = new Set(
    [...byQuestion.entries()].filter(([, ok]) => !ok).map(([id]) => id),
  );
  return questions.filter((q) => ids.has(q.id));
}
