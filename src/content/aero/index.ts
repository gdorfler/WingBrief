/** The Aerodynamics course bundle. */

import type { CourseContent, Lesson } from "@/lib/types";
import { UNITS } from "./units";
import { CONCEPTS } from "./concepts";
import { QUESTIONS } from "./questions";
import { EXPLAINERS } from "./explainers";
import { LABS } from "./labs";
import { KNOW_COLD } from "./know-cold";
import { LESSONS_A } from "./lessons/part-a";
import { LESSONS_B } from "./lessons/part-b";

const LESSONS: Lesson[] = [...LESSONS_A, ...LESSONS_B].sort(
  (a, b) => a.index - b.index,
);

export const AERO_CONTENT: CourseContent = {
  units: UNITS,
  concepts: CONCEPTS,
  lessons: LESSONS,
  questions: QUESTIONS,
  explainers: EXPLAINERS,
  labs: LABS,
  knowCold: KNOW_COLD,
};
