import type { Question } from "@/lib/types";
import { W1_QUESTIONS } from "./w1";
import { W4_QUESTIONS } from "./w4";
import { W7_QUESTIONS } from "./w7";
import { W10_QUESTIONS } from "./w10";
import { DEPTH_QUESTIONS } from "./depth";
import { GUIDE_QUESTIONS } from "./guide";
import { APPLICATION_QUESTIONS } from "./application";
import { DECODE_QUESTIONS } from "./decode";

export const QUESTIONS: Question[] = [
  ...W1_QUESTIONS,
  ...W4_QUESTIONS,
  ...W7_QUESTIONS,
  ...W10_QUESTIONS,
  ...DEPTH_QUESTIONS,
  ...GUIDE_QUESTIONS,
  ...APPLICATION_QUESTIONS,
  ...DECODE_QUESTIONS,
];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);
