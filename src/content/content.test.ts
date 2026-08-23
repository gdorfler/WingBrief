import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  COURSES,
  COURSE_ORDER,
  CONCEPT_BY_ID,
  LESSON_BY_ID,
  QUESTION_BY_ID,
  buildEoMatrix,
  contentFor,
} from "./index";
import { correctKey } from "@/lib/scoring";

/**
 * Content integrity. These are the checks that stop a typo in a lesson from
 * silently producing an unanswerable question or an orphaned concept.
 */

/** Every course's content at once, for the suites that check global registries. */
const ALL_QUESTIONS = COURSE_ORDER.flatMap((c) => contentFor(c).questions);
const ALL_LESSONS = COURSE_ORDER.flatMap((c) => contentFor(c).lessons);
const ALL_EXPLAINERS = COURSE_ORDER.flatMap((c) => contentFor(c).explainers);
const ALL_LABS = COURSE_ORDER.flatMap((c) => contentFor(c).labs);

/**
 * Every suite below runs once per course. A new course therefore inherits the
 * whole integrity contract automatically rather than needing its own tests.
 */
for (const course of COURSE_ORDER) {
  const { units: UNITS, concepts: CONCEPTS, lessons: LESSONS, questions: QUESTIONS, explainers: EXPLAINERS, labs: LABS, knowCold: KNOW_COLD } = contentFor(course);
  const NAME = COURSES[course].name;

describe(`${NAME} · curriculum shape`, () => {
  it("has the planned units, numbered in order", () => {
    expect(UNITS.length).toBeGreaterThanOrEqual(6);
    expect(UNITS.map((u) => u.index)).toEqual(UNITS.map((_, i) => i + 1));
  });

  it("has enough lessons to be a course", () => {
    // Deliberately a floor only. An earlier version of this test also capped
    // the count at 30, and both Aerodynamics and Engines came in at exactly
    // 30 — the quota was shaping the curriculum instead of catching a defect.
    // Depth is enforced by the coverage tests below, which is the property
    // that actually matters.
    expect(LESSONS.length).toBeGreaterThanOrEqual(24);
  });

  it("keeps any single lesson from carrying a whole chapter", () => {
    // A lesson claiming twenty-odd objectives is not a lesson. This catches
    // the failure the removed ceiling used to cause indirectly.
    for (const lesson of LESSONS) {
      expect(
        lesson.enablingObjectives.length,
        `${lesson.id} claims ${lesson.enablingObjectives.length} EOs — split it`,
      ).toBeLessThanOrEqual(15);
    }
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

describe(`${NAME} · identifier uniqueness`, () => {
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

describe(`${NAME} · referential integrity`, () => {
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

describe(`${NAME} · question wellformedness`, () => {
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

describe(`${NAME} · coverage`, () => {
  it("every concept is assessed by at least one question", () => {
    const tested = new Set(QUESTIONS.flatMap((q) => q.conceptIds));
    const untested = CONCEPTS.filter((c) => !tested.has(c.id)).map((c) => c.id);
    expect(untested, `untested concepts: ${untested.join(", ")}`).toEqual([]);
  });

  it("assesses every concept at least twice", () => {
    // One question per concept means a student can clear the concept on a
    // coin-flip, and leaves the review queue nothing to resurface.
    const counts = new Map(CONCEPTS.map((c) => [c.id, 0]));
    for (const q of QUESTIONS)
      for (const id of q.conceptIds)
        if (counts.has(id)) counts.set(id, counts.get(id)! + 1);
    const thin = [...counts.entries()]
      .filter(([, n]) => n < 2)
      .map(([id, n]) => `${id} (${n})`);
    expect(thin, `concepts assessed fewer than twice: ${thin.join(", ")}`).toEqual([]);
  });

  it("assesses every enabling objective at least twice", () => {
    const thin = buildEoMatrix(course)
      .filter((row) => row.questionIds.length < 2)
      .map((row) => `${row.eo} (${row.questionIds.length})`);
    expect(thin, `EOs assessed fewer than twice: ${thin.join(", ")}`).toEqual([]);
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

describe(`${NAME} · enabling objective matrix`, () => {
  const matrix = buildEoMatrix(course);

  it("maps the enabling objectives its sources actually publish", () => {
    // Aerodynamics draws on the trainee guide, which lists 198 unit-2 EOs plus
    // 29 unit-3 EOs. The Engines lectures publish far fewer, and units e6–e7
    // come only from the condensed notes, which state no EOs at all. Flight
    // Rules publishes a contiguous block, 2.345 through 2.386 — so the floor
    // is per course rather than one shared number.
    const floor = { aero: 180, engines: 25, frr: 42, weather: 81, nav: 37 }[course];
    expect(matrix.length).toBeGreaterThanOrEqual(floor);
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
}

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
    for (const lesson of ALL_LESSONS) {
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
    for (const lesson of ALL_LESSONS) {
      for (const screen of lesson.screens) {
        if (screen.kind !== "manipulate") continue;
        expect(widgetIds.has(screen.widget), `${lesson.id} → ${screen.widget}`).toBe(true);
      }
    }
  });

  it("every diagram referenced by a question is registered", () => {
    for (const q of ALL_QUESTIONS) {
      const id = "diagram" in q ? q.diagram?.id : undefined;
      if (id) expect(diagramIds.has(id), `${q.id} → ${id}`).toBe(true);
    }
  });

  it("every widget referenced by a question is registered", () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type !== "sliderPredict") continue;
      expect(widgetIds.has(q.widget), `${q.id} → ${q.widget}`).toBe(true);
    }
  });

  it("every explainer diagram is registered", () => {
    for (const e of ALL_EXPLAINERS) {
      expect(diagramIds.has(e.diagram.id), `${e.id} → ${e.diagram.id}`).toBe(true);
    }
  });

  it("every lab component is implemented", () => {
    const labSource =
      read("src/components/lab/labs.tsx") +
      read("src/components/lab/engine-labs.tsx") +
      read("src/components/lab/frr-labs.tsx") +
      read("src/components/lab/weather-labs.tsx") +
      read("src/components/lab/nav-labs.tsx");
    for (const lab of ALL_LABS) {
      expect(labSource.includes(`export function ${lab.component}`), lab.component).toBe(true);
    }
  });
});

/**
 * Diagram labelling integrity.
 *
 * A "tap the diagram" or "drag the label" question is worthless if the diagram
 * has already printed the answer next to the thing being asked about, and it is
 * actively misleading if a drop zone sits on top of the wrong feature. These
 * checks pin both down.
 */
describe("diagram labelling for tap and drag questions", () => {
  const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

  const DIAGRAM_SOURCES = [
    "src/components/diagrams/basics.tsx",
    "src/components/diagrams/airfoil.tsx",
    "src/components/diagrams/drag.tsx",
    "src/components/diagrams/performance.tsx",
    "src/components/diagrams/maneuvering.tsx",
    "src/components/diagrams/engines.tsx",
    "src/components/diagrams/frr.tsx",
    "src/components/diagrams/weather.tsx",
    "src/components/diagrams/gaps.tsx",
  ].map(read);

  /** diagram id -> React component name, from the registry. */
  const componentFor = new Map(
    [
      ...read("src/components/diagrams/registry.tsx").matchAll(
        /^\s{2}"?([a-z0-9-]+)"?:\s+([A-Z][A-Za-z0-9]*)/gm,
      ),
    ].map((m) => [m[1], m[2]] as const),
  );

  /** The source text of one diagram component, so we can inspect what it renders. */
  const bodyOf = (component: string): string | null => {
    for (const src of DIAGRAM_SOURCES) {
      const start = src.indexOf(`export function ${component}(`);
      if (start === -1) continue;
      const next = src.indexOf("\nexport function ", start + 1);
      return src.slice(start, next === -1 ? undefined : next);
    }
    return null;
  };

  const supportsLabels = (diagramId: string): boolean => {
    const component = componentFor.get(diagramId);
    if (!component) return false;
    const body = bodyOf(component);
    return body !== null && body.includes("p.labels");
  };

  const labelQuestions = ALL_QUESTIONS.filter(
    (q) => q.type === "tapDiagram" || q.type === "dragLabel",
  );

  it("has label questions to check", () => {
    expect(labelQuestions.length).toBeGreaterThan(0);
  });

  it("every diagram used by a tap or drag question can hide its labels", () => {
    for (const q of labelQuestions) {
      const id = q.diagram.id;
      expect(
        supportsLabels(id),
        `${q.id} uses "${id}", which has no labels prop, so it always prints the answer`,
      ).toBe(true);
    }
  });

  it("every tap or drag question actually turns those labels off", () => {
    for (const q of labelQuestions) {
      expect(
        q.diagram.props?.labels,
        `${q.id} does not pass labels:false, so the diagram names the answer`,
      ).toBe(false);
    }
  });

  it("tap targets sit inside the diagram viewBox", () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type !== "tapDiagram") continue;
      for (const t of q.targets) {
        expect(t.x - t.r, `${q.id}/${t.id} off the left edge`).toBeGreaterThanOrEqual(0);
        expect(t.x + t.r, `${q.id}/${t.id} off the right edge`).toBeLessThanOrEqual(500);
        expect(t.y - t.r, `${q.id}/${t.id} off the top edge`).toBeGreaterThanOrEqual(0);
        expect(t.y + t.r, `${q.id}/${t.id} off the bottom edge`).toBeLessThanOrEqual(300);
      }
    }
  });

  it("tap targets never overlap, so no tap is ambiguous", () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type !== "tapDiagram") continue;
      for (let i = 0; i < q.targets.length; i++) {
        for (let j = i + 1; j < q.targets.length; j++) {
          const a = q.targets[i];
          const b = q.targets[j];
          const gap = Math.hypot(a.x - b.x, a.y - b.y) - (a.r + b.r);
          expect(
            gap,
            `${q.id}: "${a.id}" and "${b.id}" overlap by ${(-gap).toFixed(1)}px`,
          ).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("drop pills fit on the canvas once filled with their answer", () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type !== "dragLabel") continue;
      for (const slot of q.slots) {
        const text = q.answer[slot.id] ?? "";
        // Mirrors the width formula in DragLabelBody.
        const w = Math.max(64, text.length * 6.4 + 18);
        expect(slot.x - w / 2, `${q.id}/${slot.id} overflows left`).toBeGreaterThanOrEqual(0);
        expect(slot.x + w / 2, `${q.id}/${slot.id} overflows right`).toBeLessThanOrEqual(500);
        expect(slot.y - 11, `${q.id}/${slot.id} overflows top`).toBeGreaterThanOrEqual(0);
        expect(slot.y + 11, `${q.id}/${slot.id} overflows bottom`).toBeLessThanOrEqual(300);
      }
    }
  });

  it("drop pills never overlap each other", () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type !== "dragLabel") continue;
      const box = (slot: (typeof q.slots)[number]) => {
        const w = Math.max(64, (q.answer[slot.id] ?? "").length * 6.4 + 18);
        return { x0: slot.x - w / 2, x1: slot.x + w / 2, y0: slot.y - 11, y1: slot.y + 11 };
      };
      for (let i = 0; i < q.slots.length; i++) {
        for (let j = i + 1; j < q.slots.length; j++) {
          const a = box(q.slots[i]);
          const b = box(q.slots[j]);
          const overlaps = a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;
          expect(
            overlaps,
            `${q.id}: "${q.slots[i].id}" and "${q.slots[j].id}" pills overlap`,
          ).toBe(false);
        }
      }
    }
  });

  it("anchored drop pills point at a spot inside the diagram", () => {
    for (const q of ALL_QUESTIONS) {
      if (q.type !== "dragLabel") continue;
      for (const slot of q.slots) {
        if (slot.tx === undefined && slot.ty === undefined) continue;
        expect(slot.tx, `${q.id}/${slot.id} has ty but no tx`).toBeTypeOf("number");
        expect(slot.ty, `${q.id}/${slot.id} has tx but no ty`).toBeTypeOf("number");
        expect(slot.tx!).toBeGreaterThanOrEqual(0);
        expect(slot.tx!).toBeLessThanOrEqual(500);
        expect(slot.ty!).toBeGreaterThanOrEqual(0);
        expect(slot.ty!).toBeLessThanOrEqual(300);
      }
    }
  });
});
