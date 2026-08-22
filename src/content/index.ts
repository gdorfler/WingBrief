/**
 * Curriculum aggregation across every course on the platform.
 *
 * Two access patterns, deliberately separated:
 *
 * - **Course-scoped** (`contentFor(courseId)`, `statsFor`, `buildEoMatrix`) —
 *   what a screen uses. Only ever returns one course's material, which is what
 *   keeps Engines work out of an Aerodynamics review queue.
 * - **Global by id** (`CONCEPT_BY_ID`, `LESSON_BY_ID`, …) — what a stored
 *   record uses. A saved attempt only knows a question id, and ids are unique
 *   across courses, so these resolve without the caller knowing the course.
 */

import type {
  Concept,
  CourseContent,
  CourseId,
  Explainer,
  KnowColdCard,
  Lab,
  Lesson,
  Question,
  Unit,
} from "@/lib/types";
import { AERO_CONTENT } from "./aero";
import { ENGINES_CONTENT } from "./engines";
import { FRR_CONTENT } from "./frr";
import { WEATHER_CONTENT } from "./weather";
import { COURSES, COURSE_ORDER } from "./courses";

export { COURSES, COURSE_ORDER, DEFAULT_COURSE, PLANNED_COURSES, isCourseId } from "./courses";
export { KNOW_COLD_CATEGORIES } from "./aero/know-cold";

export const COURSE_CONTENT: Record<CourseId, CourseContent> = {
  aero: AERO_CONTENT,
  engines: ENGINES_CONTENT,
  frr: FRR_CONTENT,
  weather: WEATHER_CONTENT,
};

export function contentFor(course: CourseId): CourseContent {
  return COURSE_CONTENT[course];
}

/* ------------------------------------------------------------------ */
/* Global id lookups                                                   */
/* ------------------------------------------------------------------ */

const ALL: CourseContent[] = COURSE_ORDER.map((id) => COURSE_CONTENT[id]);

function index<T extends { id: string }>(pick: (c: CourseContent) => T[]): Record<string, T> {
  return Object.fromEntries(ALL.flatMap(pick).map((item) => [item.id, item]));
}

export const UNIT_BY_ID: Record<string, Unit> = index((c) => c.units);
export const CONCEPT_BY_ID: Record<string, Concept> = index((c) => c.concepts);
export const LESSON_BY_ID: Record<string, Lesson> = index((c) => c.lessons);
export const QUESTION_BY_ID: Record<string, Question> = index((c) => c.questions);
export const EXPLAINER_BY_ID: Record<string, Explainer> = index((c) => c.explainers);
export const LAB_BY_ID: Record<string, Lab> = index((c) => c.labs);
export const KNOW_COLD_BY_ID: Record<string, KnowColdCard> = index((c) => c.knowCold);

/** Which course a given entity belongs to, for records that only carry an id. */
export const COURSE_OF_UNIT: Record<string, CourseId> = Object.fromEntries(
  COURSE_ORDER.flatMap((id) => COURSE_CONTENT[id].units.map((u) => [u.id, id])),
);

export function courseOfConcept(conceptId: string): CourseId | undefined {
  const concept = CONCEPT_BY_ID[conceptId];
  return concept ? COURSE_OF_UNIT[concept.unit] : undefined;
}

export function courseOfQuestion(questionId: string): CourseId | undefined {
  const q = QUESTION_BY_ID[questionId];
  return q ? COURSE_OF_UNIT[q.unit] : undefined;
}

/* ------------------------------------------------------------------ */
/* Course-scoped helpers                                               */
/* ------------------------------------------------------------------ */

export function conceptIdsFor(course: CourseId): string[] {
  return COURSE_CONTENT[course].concepts.map((c) => c.id);
}

export function unitConceptIds(unit: string): string[] {
  const course = COURSE_OF_UNIT[unit];
  if (!course) return [];
  return COURSE_CONTENT[course].concepts.filter((c) => c.unit === unit).map((c) => c.id);
}

export function unitLessonIds(unit: string): string[] {
  const course = COURSE_OF_UNIT[unit];
  if (!course) return [];
  return COURSE_CONTENT[course].lessons.filter((l) => l.unit === unit).map((l) => l.id);
}

export function lessonsForUnit(unit: string): Lesson[] {
  const course = COURSE_OF_UNIT[unit];
  if (!course) return [];
  return COURSE_CONTENT[course].lessons
    .filter((l) => l.unit === unit)
    .sort((a, b) => a.index - b.index);
}

/** Every lesson that teaches a concept, within that concept's own course. */
export function lessonsForConcept(conceptId: string): Lesson[] {
  const course = courseOfConcept(conceptId);
  if (!course) return [];
  return COURSE_CONTENT[course].lessons.filter((l) => l.conceptIds.includes(conceptId));
}

export function questionsForConcept(conceptId: string): Question[] {
  const course = courseOfConcept(conceptId);
  if (!course) return [];
  return COURSE_CONTENT[course].questions.filter((q) => q.conceptIds.includes(conceptId));
}

export function explainersForLesson(lessonId: string): Explainer[] {
  const lesson = LESSON_BY_ID[lessonId];
  const course = lesson ? COURSE_OF_UNIT[lesson.unit] : undefined;
  if (!course) return [];
  return COURSE_CONTENT[course].explainers.filter((e) => e.lessonId === lessonId);
}

export function labsForUnit(unit: string): Lab[] {
  const course = COURSE_OF_UNIT[unit];
  if (!course) return [];
  return COURSE_CONTENT[course].labs.filter((l) => l.unit === unit);
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
 * Builds one course's EO → lesson → concept → question matrix at runtime so it
 * can never drift from the content. `/profile` renders it, and the content
 * test asserts that every EO taught is also assessed.
 */
export function buildEoMatrix(course: CourseId): EoCoverage[] {
  const { lessons, concepts, questions } = COURSE_CONTENT[course];
  const map = new Map<string, EoCoverage>();

  const ensure = (eo: string) => {
    let row = map.get(eo);
    if (!row) {
      row = { eo, lessonIds: [], conceptIds: [], questionIds: [], covered: false };
      map.set(eo, row);
    }
    return row;
  };

  for (const lesson of lessons) {
    for (const eo of lesson.enablingObjectives) {
      const row = ensure(eo);
      if (!row.lessonIds.includes(lesson.id)) row.lessonIds.push(lesson.id);
      for (const c of lesson.conceptIds) {
        if (!row.conceptIds.includes(c)) row.conceptIds.push(c);
      }
    }
  }

  for (const concept of concepts) {
    for (const eo of concept.source.eo ?? []) {
      const row = ensure(eo);
      if (!row.conceptIds.includes(concept.id)) row.conceptIds.push(concept.id);
    }
  }

  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  for (const q of questions) {
    for (const eo of q.source.eo ?? []) {
      const row = ensure(eo);
      if (!row.questionIds.includes(q.id)) row.questionIds.push(q.id);
    }
    // A question also assesses every EO its concepts are mapped to.
    for (const conceptId of q.conceptIds) {
      for (const eo of conceptById.get(conceptId)?.source.eo ?? []) {
        const row = ensure(eo);
        if (!row.questionIds.includes(q.id)) row.questionIds.push(q.id);
      }
    }
  }

  for (const row of map.values()) {
    row.covered = row.lessonIds.length > 0 && row.questionIds.length > 0;
  }

  return [...map.values()].sort(compareEo);
}

/** EOs sort numerically by section then item, e.g. 2.9 before 2.10. */
function compareEo(a: EoCoverage, b: EoCoverage): number {
  const [aMaj, aMin] = a.eo.split(".").map(Number);
  const [bMaj, bMin] = b.eo.split(".").map(Number);
  return (aMaj - bMaj) || (aMin - bMin);
}

/* ------------------------------------------------------------------ */
/* Curriculum stats, used on the dashboard and profile                 */
/* ------------------------------------------------------------------ */

export interface CurriculumStats {
  units: number;
  lessons: number;
  concepts: number;
  questions: number;
  explainers: number;
  labs: number;
  knowColdCards: number;
  totalMinutes: number;
}

export function statsFor(course: CourseId): CurriculumStats {
  const c = COURSE_CONTENT[course];
  return {
    units: c.units.length,
    lessons: c.lessons.length,
    concepts: c.concepts.length,
    questions: c.questions.length,
    explainers: c.explainers.length,
    labs: c.labs.length,
    knowColdCards: c.knowCold.length,
    totalMinutes: c.lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0),
  };
}

/** Course metadata plus its headline numbers, for the switcher and landing copy. */
export function courseSummaries() {
  return COURSE_ORDER.map((id) => ({ ...COURSES[id], stats: statsFor(id) }));
}
