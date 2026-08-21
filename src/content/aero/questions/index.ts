import type { Question } from "@/lib/types";
import { U1_QUESTIONS } from "./u1";
import { U2_QUESTIONS } from "./u2";
import { U3_QUESTIONS } from "./u3";
import { U4_QUESTIONS } from "./u4";
import { U5_QUESTIONS } from "./u5";
import { U6_QUESTIONS } from "./u6";
import { COVERAGE_QUESTIONS } from "./coverage";

export const QUESTIONS: Question[] = [
  ...U1_QUESTIONS,
  ...U2_QUESTIONS,
  ...U3_QUESTIONS,
  ...U4_QUESTIONS,
  ...U5_QUESTIONS,
  ...U6_QUESTIONS,
  ...COVERAGE_QUESTIONS,
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);

export function questionsForConcept(conceptId: string): Question[] {
  return QUESTIONS.filter((q) => q.conceptIds.includes(conceptId));
}
