import { describe, expect, it } from "vitest";
import { claimsFor, evaluateClaims, summariseClaims, type Claim } from "./claims";
import { contentFor } from "@/content";
import type { Attempt, CourseContent } from "./types";

/* A miniature course: four apply-tier questions and one recall one. */
const content = {
  concepts: [
    { id: "wx-metar", name: "METAR" },
    { id: "wx-taf", name: "TAF" },
  ],
  questions: [
    { id: "a1", type: "spotTheTrap", difficulty: 3, conceptIds: ["wx-metar"], options: ["A", "B"], answer: 1 },
    { id: "a2", type: "spotTheTrap", difficulty: 3, conceptIds: ["wx-metar"], options: ["A", "B"], answer: 1 },
    { id: "a3", type: "connectChain", difficulty: 3, conceptIds: ["wx-metar"] },
    { id: "a4", type: "curveShift", difficulty: 3, conceptIds: ["wx-metar"] },
    { id: "r1", type: "mcq", difficulty: 1, conceptIds: ["wx-metar"], options: ["A", "B"], answer: 1 },
  ],
} as unknown as CourseContent;

const CLAIM: Claim = {
  id: "test-metar",
  label: "Read a METAR",
  earnedBy: "Decoding real observations.",
  conceptIds: ["wx-metar"],
  applied: 3,
};

let clock = 1000;
const answer = (questionId: string, correct: boolean, answerKey?: string): Attempt => ({
  questionId,
  conceptIds: ["wx-metar"],
  correct,
  elapsedMs: 8000,
  at: (clock += 1000),
  context: "lesson",
  answerKey,
});

const evaluate = (attempts: Attempt[]) => evaluateClaims(content, attempts, [CLAIM])[0];

describe("evaluateClaims", () => {
  it("says nothing about a student who has done nothing", () => {
    const s = evaluate([]);
    expect(s.status).toBe("untouched");
    expect(s.have).toBe(0);
  });

  it("stays open until the bar is actually met", () => {
    const s = evaluate([answer("a1", true), answer("a2", true)]);
    expect(s.status).toBe("open");
    expect(s.have).toBe(2);
    expect(s.need).toBe(3);
  });

  it("is earned once enough distinct applied work is done", () => {
    const s = evaluate([answer("a1", true), answer("a2", true), answer("a3", true)]);
    expect(s.status).toBe("earned");
  });

  it("cannot be farmed by answering one question repeatedly", () => {
    const s = evaluate([answer("a1", true), answer("a1", true), answer("a1", true), answer("a1", true)]);
    expect(s.have).toBe(1);
    expect(s.status).toBe("open");
  });

  it("does not count recognising the right sentence out of four", () => {
    // r1 is a difficulty-1 MCQ: recall, not application.
    const s = evaluate([answer("a1", true), answer("a2", true), answer("r1", true)]);
    expect(s.have).toBe(2);
    expect(s.status).toBe("open");
  });

  it("does not count work that was wrong", () => {
    const s = evaluate([answer("a1", true), answer("a2", false), answer("a3", true)]);
    expect(s.have).toBe(2);
  });

  it("WITHDRAWS an earned claim when a standing wrong answer contradicts it", () => {
    // The bar is still met — but the student is currently getting a1 wrong.
    const s = evaluate([
      answer("a1", true),
      answer("a2", true),
      answer("a3", true),
      answer("a4", true),
      answer("a1", false, "i:0"),
    ]);
    expect(s.status).toBe("contested");
    expect(s.contradiction?.text).toBe("A");
  });

  it("restores a withdrawn claim once the contradiction is beaten", () => {
    const s = evaluate([
      answer("a1", true),
      answer("a2", true),
      answer("a3", true),
      answer("a4", true),
      answer("a1", false, "i:0"),
      answer("a1", true),
    ]);
    expect(s.status).toBe("earned");
  });

  it("takes the contested concept from the question, not from the attempt", () => {
    // Attempts carry their own conceptIds, and a stale or mislabelled one must
    // not let a wrong answer escape notice. This attempt claims to be about
    // TAFs; the question it names is a METAR question, and that is what counts.
    // Built last so the miss is the most recent word on a1 — a miss followed by
    // a correct answer is a corrected slip, which is a different test above.
    const correct = [answer("a1", true), answer("a2", true), answer("a3", true)];
    const mislabelled: Attempt = { ...answer("a1", false, "i:0"), conceptIds: ["wx-taf"] };
    const s = evaluateClaims(content, [...correct, mislabelled], [CLAIM])[0];
    expect(s.status).toBe("contested");
  });
});

describe("summariseClaims", () => {
  it("puts a withdrawn claim ahead of an unstarted one to win back", () => {
    const contested: Claim = { ...CLAIM, id: "c1" };
    const fresh: Claim = { ...CLAIM, id: "c2", conceptIds: ["wx-taf"] };
    const states = evaluateClaims(
      content,
      [answer("a1", true), answer("a2", true), answer("a3", true), answer("a1", false, "i:0")],
      [contested, fresh],
    );
    const summary = summariseClaims(states);
    expect(summary.contested.map((s) => s.claim.id)).toEqual(["c1"]);
    expect(summary.nearest?.claim.id).toBe("c1");
  });
});

describe("the shipped Weather claims", () => {
  const weather = contentFor("weather");

  it("only Weather has claims so far", () => {
    expect(claimsFor("weather").length).toBeGreaterThan(0);
    expect(claimsFor("aero")).toHaveLength(0);
  });

  it("names only concepts that exist", () => {
    const known = new Set(weather.concepts.map((c) => c.id));
    for (const claim of claimsFor("weather")) {
      for (const id of claim.conceptIds) {
        expect(known, `${claim.id} names ${id}`).toContain(id);
      }
    }
  });

  it("is earnable — every claim has enough apply-tier questions behind it", () => {
    for (const claim of claimsFor("weather")) {
      const set = new Set(claim.conceptIds);
      const applyQuestions = weather.questions.filter(
        (q) =>
          q.conceptIds.some((id) => set.has(id)) &&
          evaluateClaims(weather, [], [claim]) && // keeps the content import honest
          (q.type !== "mcq" || q.difficulty >= 2),
      );
      expect(applyQuestions.length, `${claim.id} is unearnable`).toBeGreaterThanOrEqual(claim.applied);
    }
  });

  it("starts every claim unearned for a new student", () => {
    const states = evaluateClaims(weather, [], claimsFor("weather"));
    expect(states.every((s) => s.status === "untouched")).toBe(true);
    // Nothing is said about a student who has not done anything.
    expect(summariseClaims(states).earned).toHaveLength(0);
  });
});
