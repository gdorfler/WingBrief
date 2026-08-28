import { describe, expect, it } from "vitest";
import {
  beliefsFrom,
  chosenIndex,
  diagnoseConcepts,
  diagnosisCoverage,
} from "./diagnosis";
import type { Attempt, CourseContent, PredictionRecord } from "./types";

/* A deliberately tiny curriculum: two questions on one concept, one on another. */
const content = {
  concepts: [
    { id: "c-clmax", name: "CLmax and the critical angle" },
    { id: "c-flaps", name: "Flaps" },
  ],
  questions: [
    {
      id: "q1",
      type: "mcq",
      conceptIds: ["c-clmax"],
      options: ["It keeps rising", "It levels off", "It falls"],
      answer: 2,
    },
    {
      id: "q2",
      type: "mcq",
      conceptIds: ["c-clmax", "c-flaps"],
      options: ["Up and left", "Up and right", "Down and left"],
      answer: 0,
    },
    {
      id: "q3",
      type: "numeric",
      conceptIds: ["c-flaps"],
    },
  ],
} as unknown as CourseContent;

const miss = (questionId: string, answerKey: string | undefined, at: number): Attempt => ({
  questionId,
  conceptIds: [],
  correct: false,
  elapsedMs: 9000,
  at,
  context: "lesson",
  answerKey,
});

const hit = (questionId: string, at: number): Attempt => ({
  questionId,
  conceptIds: [],
  correct: true,
  elapsedMs: 8000,
  at,
  context: "lesson",
  answerKey: "i:2",
});

describe("chosenIndex", () => {
  it("reads an indexed answer", () => {
    expect(chosenIndex("i:2")).toBe(2);
    expect(chosenIndex("i:0")).toBe(0);
  });

  it("ignores answer shapes that are not a choice", () => {
    // Targets, orders, maps and numeric field sets are all real answers, and
    // none of them is a distractor pick.
    expect(chosenIndex("t:leading-edge")).toBeNull();
    expect(chosenIndex("o:a|b|c")).toBeNull();
    expect(chosenIndex("f:hdg=214")).toBeNull();
    expect(chosenIndex(undefined)).toBeNull();
    expect(chosenIndex("i:x")).toBeNull();
  });
});

describe("beliefsFrom", () => {
  it("names the distractor in the question's own words", () => {
    const beliefs = beliefsFrom(content, [miss("q1", "i:0", 100)]);
    expect(beliefs).toHaveLength(1);
    expect(beliefs[0].text).toBe("It keeps rising");
    expect(beliefs[0].correctText).toBe("It falls");
    expect(beliefs[0].standing).toBe(true);
  });

  it("counts a repeated wrong choice as one belief, not two", () => {
    const beliefs = beliefsFrom(content, [
      miss("q1", "i:0", 100),
      miss("q1", "i:0", 200),
    ]);
    expect(beliefs).toHaveLength(1);
    expect(beliefs[0].count).toBe(2);
    expect(beliefs[0].lastAt).toBe(200);
  });

  it("separates two different wrong choices on the same question", () => {
    const beliefs = beliefsFrom(content, [
      miss("q1", "i:0", 100),
      miss("q1", "i:1", 200),
    ]);
    expect(beliefs).toHaveLength(2);
    expect(beliefs.map((b) => b.option).sort()).toEqual([0, 1]);
  });

  it("retires a belief once the question is answered correctly after it", () => {
    const beliefs = beliefsFrom(content, [miss("q1", "i:0", 100), hit("q1", 300)]);
    // Chosen once and since corrected: not something they still believe.
    expect(beliefs).toHaveLength(0);
  });

  it("keeps a corrected belief that was held more than once, but not standing", () => {
    const beliefs = beliefsFrom(content, [
      miss("q1", "i:0", 100),
      miss("q1", "i:0", 200),
      hit("q1", 300),
    ]);
    expect(beliefs).toHaveLength(1);
    expect(beliefs[0].count).toBe(2);
    expect(beliefs[0].standing).toBe(false);
  });

  it("re-raises a belief that returns after a correct answer", () => {
    const beliefs = beliefsFrom(content, [
      miss("q1", "i:0", 100),
      hit("q1", 200),
      miss("q1", "i:0", 300),
    ]);
    expect(beliefs[0].standing).toBe(true);
  });

  it("skips attempts recorded before answers were stored", () => {
    expect(beliefsFrom(content, [miss("q1", undefined, 100)])).toHaveLength(0);
  });

  it("skips question types that have no options to name", () => {
    expect(beliefsFrom(content, [miss("q3", "f:hdg=214", 100)])).toHaveLength(0);
  });

  it("ignores a miss whose chosen option is now the key", () => {
    // The question was re-keyed after it was answered; that is content drift,
    // not a belief, and reporting it would accuse the student of the truth.
    expect(beliefsFrom(content, [miss("q1", "i:2", 100)])).toHaveLength(0);
  });
});

describe("diagnoseConcepts", () => {
  it("attaches a belief to every concept its question teaches", () => {
    const rows = diagnoseConcepts(content, [miss("q2", "i:1", 100)]);
    expect(rows.map((r) => r.conceptId).sort()).toEqual(["c-clmax", "c-flaps"]);
  });

  it("ranks a standing belief above one that has been corrected", () => {
    const rows = diagnoseConcepts(content, [
      // c-flaps only: corrected, held twice.
      miss("q2", "i:1", 100),
      miss("q2", "i:1", 150),
      hit("q2", 200),
      // c-clmax only: standing, held twice.
      miss("q1", "i:0", 300),
      miss("q1", "i:0", 400),
    ]);
    expect(rows[0].conceptId).toBe("c-clmax");
  });

  it("counts predictions without letting them rank a student as weak", () => {
    const predictions: PredictionRecord[] = [
      {
        explainerId: "x-cl-vs-aoa",
        scene: 3,
        conceptIds: ["c-clmax"],
        chosen: 0,
        answer: 2,
        correct: false,
        at: 500,
      },
    ];
    const rows = diagnoseConcepts(content, [], predictions);
    expect(rows).toHaveLength(1);
    expect(rows[0].predictionsMade).toBe(1);
    expect(rows[0].predictionsWrong).toBe(1);
    // A wrong prediction before instruction is the explainer doing its job.
    expect(rows[0].weight).toBe(0);
  });
});

describe("diagnosisCoverage", () => {
  it("separates what can be read from what was never recorded", () => {
    const cov = diagnosisCoverage(
      content,
      [
        miss("q1", "i:0", 100),
        miss("q2", "i:1", 200),
        miss("q1", undefined, 50),
        miss("q3", "f:hdg=214", 300),
        hit("q1", 400),
      ],
      [],
    );
    expect(cov.misses).toBe(4);
    expect(cov.diagnosable).toBe(2);
    expect(cov.unrecorded).toBe(1);
  });
});
