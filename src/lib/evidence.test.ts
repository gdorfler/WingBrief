import { describe, expect, it } from "vitest";
import { evidenceFor, provesApplication } from "./evidence";
import { COURSE_ORDER, contentFor } from "@/content";
import type { Difficulty, QuestionType } from "./types";

const q = (type: QuestionType, difficulty: Difficulty) => ({ type, difficulty });

describe("evidenceFor", () => {
  it("treats plain recognition multiple choice as recall", () => {
    expect(evidenceFor(q("mcq", 1))).toBe("recall");
    expect(evidenceFor(q("mcq", 2))).toBe("recall");
  });

  it("treats the hardest multiple choice as application", () => {
    // Difficulty 3 in this bank is consistently multi-variable or scenario
    // framed, which cannot be answered without holding the relationship.
    expect(evidenceFor(q("mcq", 3))).toBe("apply");
  });

  it("treats every doing-shaped question as application at any difficulty", () => {
    for (const type of [
      "numeric",
      "sliderPredict",
      "curveShift",
      "beforeAfter",
      "graphRead",
      "tapDiagram",
      "dragLabel",
      "connectChain",
      "spotTheTrap",
    ] as QuestionType[]) {
      expect(evidenceFor(q(type, 1)), `${type} at difficulty 1`).toBe("apply");
    }
  });

  it("lets a question override the derivation in both directions", () => {
    expect(evidenceFor({ ...q("mcq", 1), evidenceOverride: "apply" })).toBe("apply");
    expect(evidenceFor({ ...q("numeric", 3), evidenceOverride: "recall" })).toBe("recall");
  });

  it("exposes the same decision as a predicate", () => {
    expect(provesApplication(q("curveShift", 1))).toBe(true);
    expect(provesApplication(q("mcq", 2))).toBe(false);
  });
});

describe("evidence coverage across the curriculum", () => {
  /**
   * The gate in `levelFor` is only fair if every concept has some route to
   * proving application. A concept with nothing but recognition questions
   * behind it would be permanently stuck below mastery through no fault of
   * the student — a content bug wearing an engine bug's clothes.
   */
  for (const course of COURSE_ORDER) {
    it(`${course}: every concept has at least one application-tier question`, () => {
      const { concepts, questions } = contentFor(course);
      const provable = new Set<string>();
      for (const question of questions) {
        if (!provesApplication(question)) continue;
        for (const id of question.conceptIds) provable.add(id);
      }
      const stranded = concepts.filter((c) => !provable.has(c.id)).map((c) => c.id);
      expect(stranded, `${stranded.length} concept(s) cannot reach mastery`).toEqual([]);
    });
  }
});
