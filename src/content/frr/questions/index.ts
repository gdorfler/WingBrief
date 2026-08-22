import type { Question } from "@/lib/types";
import { F1_QUESTIONS } from "./f1";
import { F3_QUESTIONS } from "./f3";
import { F5_QUESTIONS } from "./f5";
import { F7_QUESTIONS } from "./f7";
import { F8_QUESTIONS } from "./f8";

export const QUESTIONS: Question[] = [
  ...F1_QUESTIONS,
  ...F3_QUESTIONS,
  ...F5_QUESTIONS,
  ...F7_QUESTIONS,
  ...F8_QUESTIONS,
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);
