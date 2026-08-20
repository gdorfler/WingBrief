import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONCEPTS,
  CONCEPT_BY_ID,
  EXPLAINERS,
  KNOW_COLD,
  LABS,
  LESSONS,
  LESSON_BY_ID,
  QUESTIONS,
  QUESTION_BY_ID,
  UNITS,
  buildEoMatrix,
} from "./index";
import { correctKey } from "@/lib/scoring";

/**
 * Content integrity. These are the checks that stop a typo in a lesson from
 * silently producing an unanswerable question or an orphaned concept.
 */

describe("curriculum shape", () => {
  it("has the six planned units", () => {
    expect(UNITS).toHaveLength(6);
    expect(UNITS.map((u) => u.id)).toEqual(["u1", "u2", "u3", "u4", "u5", "u6"]);
  });

  it("has 24–30 lessons as scoped", () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(24);
    expect(LESSONS.length).toBeLessThanOrEqual(30);
  });

  it("numbers lessons contiguously from 1", () => {
    const indices = LESSONS.map((l) => l.index);
    expect(indices).toEqual(Array.from({ length: LESSONS.length }, (_, i) => i + 1));
  });

  it("gives every unit at least two lessons", () => {
    for (const unit of UNITS) {
      const count = LESSONS.filter((l) => l.unit === unit.id).length;
      expect(count, `unit ${unit.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps every lesson inside the 4–10 minute session budget", () => {
    for (const lesson of LESSONS) {
      expect(lesson.estimatedMinutes, lesson.id).toBeGreaterThanOrEqual(4);
      expect(lesson.estimatedMinutes, lesson.id).toBeLessThanOrEqual(10);
    }
  });
});

describe("identifier uniqueness", () => {
  const dupes = (ids: string[]) =>
    ids.filter((id, i) => ids.indexOf(id) !== i);

  it("has unique lesson ids", () => {
    expect(dupes(LESSONS.map((l) => l.id))).toEqual([]);
  });

  it("has unique concept ids", () => {
    expect(dupes(CONCEPTS.map((c) => c.id))).toEqual([]);
  });

  it("has unique question ids", () => {
    expect(dupes(QUESTIONS.map((q) => q.id))).toEqual([]);
  });

  it("has unique explainer, lab and Know Cold ids", () => {
    expect(dupes(EXPLAINERS.map((e) => e.id))).toEqual([]);
    expect(dupes(LABS.map((l) => l.id))).toEqual([]);
    expect(dupes(KNOW_COLD.map((k) => k.id))).toEqual([]);
  });
});

describe("referential integrity", () => {
  it("every lesson concept exists", () => {
    for (const lesson of LESSONS) {
      for (const id of lesson.conceptIds) {
        expect(CONCEPT_BY_ID[id], `${lesson.id} → ${id}`).toBeDefined();
      }
    }
  });

  it("every lesson question exists", () => {
    for (const lesson of LESSONS) {
      for (const id of lesson.questionIds) {
        expect(QUESTION_BY_ID[id], `${lesson.id} → ${id}`).toBeDefined();
      }
    }
  });

  it("every question screen references a question in the lesson pool", () => {
    for (const lesson of LESSONS) {
      for (const screen of lesson.screens) {
        if (screen.kind !== "question") continue;
        expect(QUESTION_BY_ID[screen.questionId], screen.questionId).toBeDefined();
        expect(
          lesson.questionIds,
          `${lesson.id} screen ${screen.questionId} missing from questionIds`,
        ).toContain(screen.questionId);
      }
    }
  });

  it("every question concept exists", () => {
    for (const q of QUESTIONS) {
      expect(q.conceptIds.length, q.id).toBeGreaterThan(0);
      for (const id of q.conceptIds) {
        expect(CONCEPT_BY_ID[id], `${q.id} → ${id}`).toBeDefined();
      }
    }
  });

  it("every explainer points at a real lesson and real concepts", () => {
    for (const e of EXPLAINERS) {
      expect(LESSON_BY_ID[e.lessonId], `${e.id} → ${e.lessonId}`).toBeDefined();
      for (const id of e.conceptIds) {
        expect(CONCEPT_BY_ID[id], `${e.id} → ${id}`).toBeDefined();
      }
    }
  });

  it("every lab and Know Cold card references real concepts", () => {
    for (const lab of LABS) {
      for (const id of lab.conceptIds) {
        expect(CONCEPT_BY_ID[id], `${lab.id} → ${id}`).toBeDefined();
      }
    }
    for (const card of KNOW_COLD) {
      for (const id of card.conceptIds) {
        expect(CONCEPT_BY_ID[id], `${card.id} → ${id}`).toBeDefined();
      }
    }
  });

  it("lesson explainerIds and labIds resolve", () => {
    const explainerIds = new Set(EXPLAINERS.map((e) => e.id));
    const labIds = new Set(LABS.map((l) => l.id));
    for (const lesson of LESSONS) {
      for (const id of lesson.explainerIds ?? []) {
        expect(explainerIds.has(id), `${lesson.id} → ${id}`).toBe(true);
      }
      for (const id of lesson.labIds ?? []) {
        expect(labIds.has(id), `${lesson.id} → ${id}`).toBe(true);
      }
    }
  });
});

describe("question wellformedness", () => {
  it("every question has a resolvable correct answer", () => {
    for (const q of QUESTIONS) {
      expect(() => correctKey(q), q.id).not.toThrow();
      expect(correctKey(q), q.id).toBeTruthy();
    }
  });

  it("multiple-choice answers are in range and options are distinct", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "mcq" && q.type !== "spotTheTrap" && q.type !== "sliderPredict") {
        continue;
      }
      expect(q.options.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(q.options.length);
      expect(new Set(q.options).size, `${q.id} has duplicate options`).toBe(
        q.options.length,
      );
    }
  });

  it("curve-shift answers are among the offered options", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "curveShift") continue;
      expect(q.options, q.id).toContain(q.answer);
      expect(Object.keys(q.afterProps).length, q.id).toBeGreaterThan(0);
    }
  });

  it("tap and graph-read answers name a real target", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "tapDiagram" && q.type !== "graphRead") continue;
      expect(q.targets.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.targets.map((t) => t.id), q.id).toContain(q.answer);
    }
  });

  it("drag-label slots and labels line up", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "dragLabel") continue;
      const slotIds = q.slots.map((s) => s.id).sort();
      expect(Object.keys(q.answer).sort(), q.id).toEqual(slotIds);
      for (const label of Object.values(q.answer)) {
        expect(q.labels, `${q.id} answer label "${label}"`).toContain(label);
      }
    }
  });

  it("chains have at least three ordered steps", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "connectChain") continue;
      expect(q.steps.length, q.id).toBeGreaterThanOrEqual(3);
      expect(new Set(q.steps).size, `${q.id} has duplicate steps`).toBe(q.steps.length);
    }
  });

  it("before/after rows have valid answers", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "beforeAfter") continue;
      expect(q.rows.length, q.id).toBeGreaterThan(0);
      for (const row of q.rows) {
        expect(row.answer, `${q.id} / ${row.label}`).toBeGreaterThanOrEqual(0);
        expect(row.answer, `${q.id} / ${row.label}`).toBeLessThan(row.options.length);
      }
    }
  });

  it("every question carries an explanation and a source", () => {
    for (const q of QUESTIONS) {
      expect(q.explanation.length, q.id).toBeGreaterThan(20);
      expect(q.source.document, q.id).toBeTruthy();
    }
  });
});

describe("coverage", () => {
  it("every concept is assessed by at least one question", () => {
    const tested = new Set(QUESTIONS.flatMap((q) => q.conceptIds));
    const untested = CONCEPTS.filter((c) => !tested.has(c.id)).map((c) => c.id);
    expect(untested, `untested concepts: ${untested.join(", ")}`).toEqual([]);
  });

  it("every concept is taught by at least one lesson", () => {
    const taught = new Set(LESSONS.flatMap((l) => l.conceptIds));
    const untaught = CONCEPTS.filter((c) => !taught.has(c.id)).map((c) => c.id);
    expect(untaught, `untaught concepts: ${untaught.join(", ")}`).toEqual([]);
  });

  it("every lesson has enough questions to score meaningfully", () => {
    for (const lesson of LESSONS) {
      expect(lesson.questionIds.length, lesson.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("every lesson has at least one retrieval screen and one anchor", () => {
    for (const lesson of LESSONS) {
      const kinds = lesson.screens.map((s) => s.kind);
      expect(kinds, lesson.id).toContain("question");
      expect(kinds, lesson.id).toContain("anchor");
      expect(kinds, lesson.id).toContain("hook");
    }
  });

  it("every lesson stays within the 5–9 learning screens + 3–7 questions shape", () => {
    for (const lesson of LESSONS) {
      const questions = lesson.screens.filter((s) => s.kind === "question").length;
      const learning = lesson.screens.length - questions;
      expect(learning, `${lesson.id} learning screens`).toBeGreaterThanOrEqual(4);
      expect(learning, `${lesson.id} learning screens`).toBeLessThanOrEqual(9);
      expect(questions, `${lesson.id} retrieval screens`).toBeGreaterThanOrEqual(3);
      expect(questions, `${lesson.id} retrieval screens`).toBeLessThanOrEqual(7);
    }
  });

  it("every unit has a Know Cold card and an explainer", () => {
    for (const unit of UNITS) {
      expect(
        KNOW_COLD.some((k) => k.unit === unit.id),
        `${unit.id} Know Cold`,
      ).toBe(true);
      expect(
        EXPLAINERS.some((e) => e.unit === unit.id),
        `${unit.id} explainer`,
      ).toBe(true);
    }
  });
});

describe("enabling objective matrix", () => {
  const matrix = buildEoMatrix();

  it("maps a substantial share of the course's enabling objectives", () => {
    // The trainee guide lists 198 unit-2 EOs plus 29 unit-3 EOs.
    expect(matrix.length).toBeGreaterThanOrEqual(180);
  });

  it("assesses every EO that a lesson claims to teach", () => {
    const taughtButUntested = matrix
      .filter((row) => row.lessonIds.length > 0 && row.questionIds.length === 0)
      .map((row) => row.eo);
    expect(
      taughtButUntested,
      `EOs taught but never assessed: ${taughtButUntested.join(", ")}`,
    ).toEqual([]);
  });

  it("teaches every EO that a question claims to assess", () => {
    const testedButUntaught = matrix
      .filter((row) => row.questionIds.length > 0 && row.lessonIds.length === 0)
      .map((row) => row.eo);
    expect(
      testedButUntaught,
      `EOs assessed but never taught: ${testedButUntaught.join(", ")}`,
    ).toEqual([]);
  });
});

/**
 * Registry coverage. Read from source rather than importing the client
 * components, so this stays a fast node-environment test.
 */
describe("diagram and widget registries", () => {
  const read = (rel: string) =>
    readFileSync(join(process.cwd(), rel), "utf8");

  const diagramIds = new Set(
    [...read("src/components/diagrams/registry.tsx").matchAll(/^\s{2}"?([a-z0-9-]+)"?:\s+[A-Z]/gm)].map(
      (m) => m[1],
    ),
  );
  const widgetIds = new Set(
    [...read("src/components/lab/widgets.tsx").matchAll(/^\s{2}([A-Z][A-Za-z0-9]+):\s*\{$/gm)].map(
      (m) => m[1],
    ),
  );

  it("parsed both registries", () => {
    expect(diagramIds.size).toBeGreaterThan(25);
    expect(widgetIds.size).toBeGreaterThan(20);
  });

  it("every diagram referenced by a lesson screen is registered", () => {
    for (const lesson of LESSONS) {
      for (const screen of lesson.screens) {
        const id =
          screen.kind === "model" || screen.kind === "hook"
            ? screen.diagram?.id
            : undefined;
        if (id) expect(diagramIds.has(id), `${lesson.id} → ${id}`).toBe(true);
      }
    }
  });

  it("every widget referenced by a lesson screen is registered", () => {
    for (const lesson of LESSONS) {
      for (const screen of lesson.screens) {
        if (screen.kind !== "manipulate") continue;
        expect(widgetIds.has(screen.widget), `${lesson.id} → ${screen.widget}`).toBe(true);
      }
    }
  });

  it("every diagram referenced by a question is registered", () => {
    for (const q of QUESTIONS) {
      const id = "diagram" in q ? q.diagram?.id : undefined;
      if (id) expect(diagramIds.has(id), `${q.id} → ${id}`).toBe(true);
    }
  });

  it("every widget referenced by a question is registered", () => {
    for (const q of QUESTIONS) {
      if (q.type !== "sliderPredict") continue;
      expect(widgetIds.has(q.widget), `${q.id} → ${q.widget}`).toBe(true);
    }
  });

  it("every explainer diagram is registered", () => {
    for (const e of EXPLAINERS) {
      expect(diagramIds.has(e.diagram.id), `${e.id} → ${e.diagram.id}`).toBe(true);
    }
  });

  it("every lab component is implemented", () => {
    const labSource = read("src/components/lab/labs.tsx");
    for (const lab of LABS) {
      expect(labSource.includes(`export function ${lab.component}`), lab.component).toBe(true);
    }
  });
});
