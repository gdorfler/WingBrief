/** The Flight Rules and Regulations course bundle. */

import type { CourseContent, Lesson } from "@/lib/types";
import { UNITS } from "./units";
import { CONCEPTS } from "./concepts";
import { QUESTIONS } from "./questions";
import { EXPLAINERS } from "./explainers";
import { EXPLAINERS_B } from "./explainers-b";
import { LABS } from "./labs";
import { KNOW_COLD } from "./know-cold";
import { LESSONS_A } from "./lessons/part-a";
import { LESSONS_B } from "./lessons/part-b";

const LESSONS: Lesson[] = [...LESSONS_A, ...LESSONS_B].sort(
  (a, b) => a.index - b.index,
);

export const FRR_CONTENT: CourseContent = {
  units: UNITS,
  concepts: CONCEPTS,
  lessons: LESSONS,
  questions: QUESTIONS,
  explainers: [...EXPLAINERS, ...EXPLAINERS_B],
  labs: LABS,
  knowCold: KNOW_COLD,
};
