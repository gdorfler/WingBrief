import type { Question } from "@/lib/types";
import { E1_QUESTIONS } from "./e1";
import { E2_QUESTIONS } from "./e2";
import { E3_QUESTIONS } from "./e3";
import { E4_QUESTIONS } from "./e4";
import { E5_QUESTIONS } from "./e5";
import { E6_QUESTIONS } from "./e6";
import { E7_QUESTIONS, E_COVERAGE_QUESTIONS } from "./e7";
import { DEPTH_QUESTIONS } from "./depth";
import { APPLICATION_QUESTIONS } from "./application";

export const QUESTIONS: Question[] = [
  ...E1_QUESTIONS,
  ...E2_QUESTIONS,
  ...E3_QUESTIONS,
  ...E4_QUESTIONS,
  ...E5_QUESTIONS,
  ...E6_QUESTIONS,
  ...E7_QUESTIONS,
  ...E_COVERAGE_QUESTIONS,
  ...DEPTH_QUESTIONS,
  ...APPLICATION_QUESTIONS,
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);
