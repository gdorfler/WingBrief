import type { Lesson, UnitId } from "@/lib/types";
import { LESSONS_A } from "./lessons/part-a";
import { LESSONS_B } from "./lessons/part-b";

export { UNITS, UNIT_BY_ID } from "./units";
export { CONCEPTS, CONCEPT_BY_ID, CONCEPT_IDS } from "./concepts";
export { QUESTIONS, QUESTION_BY_ID, questionsForConcept } from "./questions";
export { EXPLAINERS, EXPLAINER_BY_ID } from "./explainers";
export { LABS, LAB_BY_ID } from "./labs";
export { KNOW_COLD, KNOW_COLD_BY_ID, KNOW_COLD_CATEGORIES } from "./know-cold";

import { UNITS } from "./units";
import { CONCEPTS } from "./concepts";
import { QUESTIONS } from "./questions";
import { EXPLAINERS } from "./explainers";
import { LABS } from "./labs";
import { KNOW_COLD } from "./know-cold";

export const LESSONS: Lesson[] = [...LESSONS_A, ...LESSONS_B].sort(
  (a, b) => a.index - b.index,
);

export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);

export const ALL_CONCEPT_IDS: string[] = CONCEPTS.map((c) => c.id);

export function unitConceptIds(unit: string): string[] {
  return CONCEPTS.filter((c) => c.unit === unit).map((c) => c.id);
}

export function unitLessonIds(unit: string): string[] {
  return LESSONS.filter((l) => l.unit === unit).map((l) => l.id);
}

export function lessonsForUnit(unit: UnitId): Lesson[] {
  return LESSONS.filter((l) => l.unit === unit).sort((a, b) => a.index - b.index);
}

export function explainersForLesson(lessonId: string) {
  return EXPLAINERS.filter((e) => e.lessonId === lessonId);
}

export function labsForUnit(unit: UnitId) {
  return LABS.filter((l) => l.unit === unit);
}

/** Every lesson that teaches a given concept. */
export function lessonsForConcept(conceptId: string): Lesson[] {
  return LESSONS.filter((l) => l.conceptIds.includes(conceptId));
}

/* ------------------------------------------------------------------ */
/* Enabling Objective coverage matrix                                  */
/* ------------------------------------------------------------------ */

export interface EoCoverage {
  eo: string;
  lessonIds: string[];
  conceptIds: string[];
  questionIds: string[];
  /** True when the EO is both taught (in a lesson) and assessed (a question). */
  covered: boolean;
}

/**
 * Builds the EO → lesson → concept → question matrix at runtime so it can
 * never drift from the content. `/profile` renders it, and the content test
 * asserts that every EO taught is also assessed.
 */
export function buildEoMatrix(): EoCoverage[] {
  const map = new Map<string, EoCoverage>();

  const ensure = (eo: string) => {
    let row = map.get(eo);
    if (!row) {
      row = { eo, lessonIds: [], conceptIds: [], questionIds: [], covered: false };
      map.set(eo, row);
    }
    return row;
  };

  for (const lesson of LESSONS) {
    for (const eo of lesson.enablingObjectives) {
      const row = ensure(eo);
      if (!row.lessonIds.includes(lesson.id)) row.lessonIds.push(lesson.id);
      for (const c of lesson.conceptIds) {
        if (!row.conceptIds.includes(c)) row.conceptIds.push(c);
      }
    }
  }

  for (const concept of CONCEPTS) {
    for (const eo of concept.source.eo ?? []) {
      const row = ensure(eo);
      if (!row.conceptIds.includes(concept.id)) row.conceptIds.push(concept.id);
    }
  }

  for (const q of QUESTIONS) {
    for (const eo of q.source.eo ?? []) {
      const row = ensure(eo);
      if (!row.questionIds.includes(q.id)) row.questionIds.push(q.id);
    }
    // A question also assesses every EO its concepts are mapped to.
    for (const conceptId of q.conceptIds) {
      const concept = CONCEPTS.find((c) => c.id === conceptId);
      for (const eo of concept?.source.eo ?? []) {
        const row = ensure(eo);
        if (!row.questionIds.includes(q.id)) row.questionIds.push(q.id);
      }
    }
  }

  for (const row of map.values()) {
    row.covered = row.lessonIds.length > 0 && row.questionIds.length > 0;
  }

  return [...map.values()].sort((a, b) => {
    const [aMaj, aMin] = a.eo.split(".").map(Number);
    const [bMaj, bMin] = b.eo.split(".").map(Number);
    return aMaj - bMaj || aMin - bMin;
  });
}

/* ------------------------------------------------------------------ */
/* Curriculum stats, used on the dashboard and profile                 */
/* ------------------------------------------------------------------ */

export const CURRICULUM_STATS = {
  units: UNITS.length,
  lessons: LESSONS.length,
  concepts: CONCEPTS.length,
  questions: QUESTIONS.length,
  explainers: EXPLAINERS.length,
  labs: LABS.length,
  knowColdCards: KNOW_COLD.length,
  totalMinutes: LESSONS.reduce((sum, l) => sum + l.estimatedMinutes, 0),
};
