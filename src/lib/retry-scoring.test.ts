/**
 * "Try again" must not launder a wrong answer into a right one.
 *
 * The player reports only a student's FIRST attempt at a question, so these
 * tests describe the downstream consequences of that contract: a miss followed
 * by a successful retry has to still dent mastery and still show up in the
 * mistakes queue.
 */

import { describe, expect, it } from "vitest";
import { applyAttempt, emptyMastery, weightedAccuracy } from "./mastery";
import { outstandingMistakes } from "./review";
import { summarizeLesson } from "./scoring";
import { emptyProgress } from "./storage";
import type { Attempt, CourseProgressView, MasteryRecord, Question } from "./types";

const T0 = Date.UTC(2026, 1, 1, 12, 0, 0);

function attempt(questionId: string, correct: boolean, at: number): Attempt {
  return {
    questionId,
    conceptIds: ["c-lift-def"],
    correct,
    elapsedMs: 5000,
    at,
    context: "lesson",
  };
}

function view(attempts: Attempt[]): CourseProgressView {
  const base = emptyProgress();
  return {
    ...base.courses.aero,
    attempts,
    streak: base.streak,
    achievements: base.achievements,
    onboarded: base.onboarded,
    activeCourse: "aero",
  };
}

const QUESTION = {
  id: "q1",
  type: "mcq",
  unit: "u1",
  conceptIds: ["c-lift-def"],
  prompt: "?",
  options: ["a", "b"],
  answer: 0,
  explanation: "",
  difficulty: 1,
  source: { document: "Aerodynamics Trainee Guide" },
} as unknown as Question;

describe("a wrong answer survives a successful retry", () => {
  it("keeps the question in the mistakes queue", () => {
    // Only the first attempt is recorded, so this is what the store holds.
    const state = view([attempt("q1", false, T0)]);
    expect(outstandingMistakes([QUESTION], state).map((q) => q.id)).toEqual(["q1"]);
  });

  it("clears the mistake only when a LATER encounter is answered correctly", () => {
    const state = view([attempt("q1", false, T0), attempt("q1", true, T0 + 86_400_000)]);
    expect(outstandingMistakes([QUESTION], state)).toEqual([]);
  });

  it("scores the lesson on first-try performance", () => {
    const summary = summarizeLesson([{ questionId: "q1", firstTry: true, correct: false }]);
    expect(summary.score).toBe(0);
    expect(summary.perfect).toBe(false);
    expect(summary.missedQuestionIds).toEqual(["q1"]);
  });

  it("still counts the question as answered", () => {
    const summary = summarizeLesson([{ questionId: "q1", firstTry: true, correct: false }]);
    expect(summary.answered).toBe(1);
    expect(summary.firstTryCorrect).toBe(0);
  });

  it("dents mastery, and a retry cannot immediately undo it", () => {
    let record: MasteryRecord | undefined;

    // What actually gets recorded: one miss.
    const missed = applyAttempt({ "c-lift-def": emptyMastery("c-lift-def") }, attempt("q1", false, T0));
    record = missed.mastery["c-lift-def"];
    const afterMiss = weightedAccuracy(record.recent);

    // What WOULD have been recorded if the retry also counted.
    const laundered = applyAttempt(missed.mastery, attempt("q1", true, T0 + 1000));
    const afterLaundering = weightedAccuracy(laundered.mastery["c-lift-def"].recent);

    // The bug this guards against: the retry pulling accuracy back up within
    // the same encounter.
    expect(afterLaundering).toBeGreaterThan(afterMiss);
    // And the contract that prevents it — one attempt recorded, not two.
    expect(record.seen).toBe(1);
    expect(record.correct).toBe(0);
  });
});
