import type { Question } from "@/lib/types";
import { CONCEPT_QUESTIONS } from "./concepts";
import { DEPTH_QUESTIONS } from "./depth";
import { DRILL_QUESTIONS, DRILL_SETS } from "./drills";
import { PROBLEM_QUESTIONS, PROBLEM_SETS } from "./problems";

/**
 * The Navigation question bank, in three parts that do different jobs.
 *
 * - **Concepts** — the forty-odd recognition items the exam opens with.
 * - **Drills** — the published problem sets, turned into gradeable reps.
 * - **Problems** — multi-output chart and planning work, where the answer is
 *   several numbers and the tolerance on each is different.
 */
export const QUESTIONS: Question[] = [
  ...CONCEPT_QUESTIONS,
  ...DEPTH_QUESTIONS,
  ...PROBLEM_QUESTIONS,
  ...DRILL_QUESTIONS,
];

export { DRILL_SETS, PROBLEM_SETS };
