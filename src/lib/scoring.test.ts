import { describe, expect, it } from "vitest";
import {
  correctKey,
  isCorrect,
  partialScore,
  scoreExam,
  seededShuffle,
  selectExamQuestions,
  serializeAnswer,
  summarizeLesson,
} from "./scoring";
import type { Question } from "./types";

const mcq = (id: string, answer: number, unit: Question["unit"] = "u1"): Question => ({
  id,
  type: "mcq",
  unit,
  conceptIds: [`c-${id}`],
  prompt: "?",
  options: ["a", "b", "c", "d"],
  answer,
  explanation: "",
  difficulty: 1,
  source: { document: "Aerodynamics Trainee Guide" },
});

describe("answer serialization", () => {
  it("round-trips each answer shape distinctly", () => {
    expect(serializeAnswer({ kind: "index", value: 2 })).toBe("i:2");
    expect(serializeAnswer({ kind: "target", value: "clmax" })).toBe("t:clmax");
    expect(serializeAnswer({ kind: "order", value: ["a", "b"] })).toBe("o:a|b");
    expect(serializeAnswer({ kind: "rows", value: [0, 1, 2] })).toBe("r:0|1|2");
  });

  it("sorts map keys so equivalent maps serialize identically", () => {
    const a = serializeAnswer({ kind: "map", value: { s2: "y", s1: "x" } });
    const b = serializeAnswer({ kind: "map", value: { s1: "x", s2: "y" } });
    expect(a).toBe(b);
  });
});

describe("correctKey and isCorrect", () => {
  it("handles multiple choice", () => {
    const q = mcq("q1", 2);
    expect(correctKey(q)).toBe("i:2");
    expect(isCorrect(q, "i:2")).toBe(true);
    expect(isCorrect(q, "i:1")).toBe(false);
  });

  it("handles a curve shift by mapping the direction to its option index", () => {
    const q: Question = {
      id: "cs-1",
      type: "curveShift",
      unit: "u4",
      conceptIds: ["c-x"],
      prompt: "?",
      change: "Weight increases",
      curveLabel: "T_R",
      diagram: { id: "thrust-curves" },
      options: ["up", "right", "upRight"],
      answer: "upRight",
      afterProps: {},
      explanation: "",
      difficulty: 2,
      source: { document: "Aerodynamics Trainee Guide" },
    };
    expect(correctKey(q)).toBe("i:2");
  });

  it("handles an ordered chain", () => {
    const q: Question = {
      id: "cc-1",
      type: "connectChain",
      unit: "u5",
      conceptIds: ["c-x"],
      prompt: "?",
      trigger: "Bank increases",
      steps: ["A", "B", "C"],
      explanation: "",
      difficulty: 2,
      source: { document: "Aerodynamics Trainee Guide" },
    };
    expect(isCorrect(q, "o:A|B|C")).toBe(true);
    expect(isCorrect(q, "o:B|A|C")).toBe(false);
  });
});

describe("partialScore", () => {
  const chain: Question = {
    id: "cc-2",
    type: "connectChain",
    unit: "u5",
    conceptIds: ["c-x"],
    prompt: "?",
    trigger: "t",
    steps: ["A", "B", "C", "D"],
    explanation: "",
    difficulty: 2,
    source: { document: "Aerodynamics Trainee Guide" },
  };

  it("is 1 for an exact match", () => {
    expect(partialScore(chain, "o:A|B|C|D")).toBe(1);
  });

  it("awards credit per correctly positioned step", () => {
    expect(partialScore(chain, "o:A|B|D|C")).toBe(0.5);
  });

  it("is 0 for an unrelated answer shape", () => {
    expect(partialScore(chain, "i:1")).toBe(0);
  });
});

describe("scoreExam", () => {
  const labels = { unit: (u: string) => u.toUpperCase(), concept: (c: string) => c };

  it("scores, splits correct/incorrect and counts unanswered", () => {
    const questions = [mcq("a", 0), mcq("b", 1, "u2"), mcq("c", 2)];
    const summary = scoreExam(questions, { a: "i:0", b: "i:3" }, labels);
    expect(summary.correct).toBe(1);
    expect(summary.incorrect).toBe(2);
    expect(summary.unanswered).toBe(1);
    expect(summary.score).toBeCloseTo(1 / 3);
    expect(summary.correctIds).toEqual(["a"]);
  });

  it("breaks results down by unit", () => {
    const questions = [mcq("a", 0), mcq("b", 0), mcq("c", 0, "u2")];
    const summary = scoreExam(questions, { a: "i:0", b: "i:0", c: "i:1" }, labels);
    const u1 = summary.byUnit.find((r) => r.key === "u1");
    const u2 = summary.byUnit.find((r) => r.key === "u2");
    expect(u1?.pct).toBe(100);
    expect(u2?.pct).toBe(0);
  });

  it("surfaces weak areas worst-first", () => {
    const questions = [mcq("a", 0), mcq("b", 0), mcq("c", 0)];
    const summary = scoreExam(questions, { a: "i:1", b: "i:0", c: "i:1" }, labels);
    expect(summary.weakAreas[0].pct).toBe(0);
  });

  it("returns zero for an empty exam rather than NaN", () => {
    const summary = scoreExam([], {}, labels);
    expect(summary.score).toBe(0);
    expect(Number.isNaN(summary.score)).toBe(false);
  });
});

describe("summarizeLesson", () => {
  it("scores on first-try correctness", () => {
    const s = summarizeLesson([
      { questionId: "a", firstTry: true, correct: true },
      { questionId: "b", firstTry: false, correct: true },
    ]);
    expect(s.answered).toBe(2);
    expect(s.firstTryCorrect).toBe(1);
    expect(s.eventuallyCorrect).toBe(2);
    expect(s.score).toBe(0.5);
    expect(s.perfect).toBe(false);
  });

  it("flags a perfect lesson", () => {
    const s = summarizeLesson([
      { questionId: "a", firstTry: true, correct: true },
      { questionId: "b", firstTry: true, correct: true },
    ]);
    expect(s.perfect).toBe(true);
    expect(s.missedQuestionIds).toEqual([]);
  });

  it("is not perfect with zero questions answered", () => {
    expect(summarizeLesson([]).perfect).toBe(false);
  });
});

describe("seededShuffle", () => {
  it("is deterministic for a given seed", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(seededShuffle(items, "exam-1")).toEqual(seededShuffle(items, "exam-1"));
  });

  it("produces a different order for a different seed", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(seededShuffle(items, "a")).not.toEqual(seededShuffle(items, "b"));
  });

  it("preserves every element", () => {
    const items = [1, 2, 3, 4, 5];
    expect([...seededShuffle(items, "s")].sort()).toEqual(items);
  });
});

describe("selectExamQuestions", () => {
  const pool: Question[] = [
    ...Array.from({ length: 12 }, (_, i) => mcq(`u1-${i}`, 0, "u1")),
    ...Array.from({ length: 12 }, (_, i) => mcq(`u2-${i}`, 0, "u2")),
  ];

  it("returns the whole pool when it is smaller than the request", () => {
    expect(selectExamQuestions(pool.slice(0, 5), 20, {}, "s")).toHaveLength(5);
  });

  it("returns exactly the requested count", () => {
    expect(selectExamQuestions(pool, 10, {}, "s")).toHaveLength(10);
  });

  it("returns no duplicates", () => {
    const picked = selectExamQuestions(pool, 16, {}, "s");
    expect(new Set(picked.map((q) => q.id)).size).toBe(16);
  });

  it("samples both units rather than draining one", () => {
    const picked = selectExamQuestions(pool, 12, {}, "s");
    expect(picked.some((q) => q.unit === "u1")).toBe(true);
    expect(picked.some((q) => q.unit === "u2")).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    const a = selectExamQuestions(pool, 10, {}, "seed").map((q) => q.id);
    const b = selectExamQuestions(pool, 10, {}, "seed").map((q) => q.id);
    expect(a).toEqual(b);
  });
});
