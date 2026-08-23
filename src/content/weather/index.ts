/** The Weather course bundle. */

import type { CourseContent, Lesson } from "@/lib/types";
import { UNITS } from "./units";
import { CONCEPTS } from "./concepts";
import { CONCEPTS_B } from "./concepts-b";
import { QUESTIONS } from "./questions";
import { EXPLAINERS, EXPLAINERS_B, EXPLAINERS_C } from "./explainers";
import { LABS } from "./labs";
import { KNOW_COLD } from "./know-cold";
import { LESSONS_A } from "./lessons/part-a";
import { LESSONS_B } from "./lessons/part-b";
import { LESSONS_C } from "./lessons/part-c";

/**
 * Weather lessons were authored before the trainee guide was supplied, so none
 * of them hard-code an enabling objective. Rather than restate the mapping in
 * two places, each lesson inherits the EOs of the concepts it teaches — the
 * concept graph is already the single source of truth for that link.
 */
const EO_BY_CONCEPT = new Map(
  [...CONCEPTS, ...CONCEPTS_B].map((c) => [c.id, c.source.eo ?? []]),
);

function withEnablingObjectives(lesson: Lesson): Lesson {
  const eos = [
    ...new Set(lesson.conceptIds.flatMap((id) => EO_BY_CONCEPT.get(id) ?? [])),
  ].sort((a, b) => Number(a.split(".")[1]) - Number(b.split(".")[1]));
  return { ...lesson, enablingObjectives: eos };
}

const LESSONS: Lesson[] = [...LESSONS_A, ...LESSONS_B, ...LESSONS_C]
  .map(withEnablingObjectives)
  .sort((a, b) => a.index - b.index)
  // part-c inserts lessons mid-sequence, so indices are re-derived from the
  // sorted order rather than maintained by hand in three files.
  .map((l, i) => ({ ...l, index: i + 1 }));

export const WEATHER_CONTENT: CourseContent = {
  units: UNITS,
  concepts: [...CONCEPTS, ...CONCEPTS_B],
  lessons: LESSONS,
  questions: QUESTIONS,
  explainers: [...EXPLAINERS, ...EXPLAINERS_B, ...EXPLAINERS_C],
  labs: LABS,
  knowCold: KNOW_COLD,
};
