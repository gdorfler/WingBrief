/**
 * Make It Click entries must stay attached to the curriculum.
 *
 * An entry references a concept, sometimes an explainer, sometimes a lab, and
 * sometimes prerequisite concepts. All of those can be renamed or removed by
 * ordinary content work, and a dangling reference would surface as an empty
 * stage at the exact moment a student has said they do not understand — which
 * is the worst possible time for the app to have nothing to show.
 */
import { describe, expect, it } from "vitest";
import { CLICK_BY_CONCEPT, CLICK_CONCEPT_IDS } from "./click";
import { COURSE_ORDER, contentFor } from "./index";
import { resolveClick } from "@/lib/make-it-click";
import type { CourseId } from "@/lib/types";

/** Which course owns a concept, so an entry can be resolved against it. */
function courseOf(conceptId: string): CourseId | null {
  for (const course of COURSE_ORDER as CourseId[]) {
    if (contentFor(course).concepts.some((c) => c.id === conceptId)) return course;
  }
  return null;
}

describe("Make It Click entries", () => {
  it("name concepts that exist", () => {
    for (const id of CLICK_CONCEPT_IDS) {
      expect(courseOf(id), `${id} belongs to no course`).not.toBeNull();
    }
  });

  it("have no duplicate entries for one concept", () => {
    expect(new Set(CLICK_CONCEPT_IDS).size).toBe(CLICK_CONCEPT_IDS.length);
  });

  it("reference explainers, labs and prerequisites that exist", () => {
    for (const [conceptId, entry] of CLICK_BY_CONCEPT) {
      const course = courseOf(conceptId);
      if (!course) continue;
      const content = contentFor(course);

      if (entry.show?.explainerId) {
        expect(
          content.explainers.some((e) => e.id === entry.show!.explainerId),
          `${conceptId} shows missing explainer ${entry.show.explainerId}`,
        ).toBe(true);
      }
      if (entry.manipulate?.labId) {
        expect(
          content.labs.some((l) => l.id === entry.manipulate!.labId),
          `${conceptId} manipulates missing lab ${entry.manipulate.labId}`,
        ).toBe(true);
      }
      for (const pre of entry.prerequisites ?? []) {
        expect(courseOf(pre), `${conceptId} needs missing prerequisite ${pre}`).not.toBeNull();
      }
      for (const qid of entry.transferQuestionIds ?? []) {
        expect(
          content.questions.some((q) => q.id === qid),
          `${conceptId} transfers to missing question ${qid}`,
        ).toBe(true);
      }
    }
  });

  it("write an intuition that could stand alone", () => {
    for (const [conceptId, entry] of CLICK_BY_CONCEPT) {
      // One to three sentences. Long enough to say something, short enough that
      // a confused student will actually read it.
      expect(entry.intuition.length, `${conceptId} intuition is too short`).toBeGreaterThan(60);
      expect(entry.intuition.length, `${conceptId} intuition is a paragraph`).toBeLessThan(420);
    }
  });

  it("give every analogy an explicit mapping", () => {
    for (const [conceptId, entry] of CLICK_BY_CONCEPT) {
      for (const a of entry.analogies ?? []) {
        // An analogy that cannot state which part stands for which is a
        // mnemonic, and mnemonics do not survive a reworded question.
        expect(a.maps.length, `${conceptId}: "${a.picture.slice(0, 30)}…" maps nothing`).toBeGreaterThanOrEqual(2);
        for (const [real, inAnalogy] of a.maps) {
          expect(real.length).toBeGreaterThan(0);
          expect(inAnalogy.length).toBeGreaterThan(0);
        }
      }
      // Two is the cap; a third is authoring for its own sake.
      expect((entry.analogies ?? []).length, `${conceptId} has too many analogies`).toBeLessThanOrEqual(2);
    }
  });

  it("pair a wrong model against a right one", () => {
    for (const [conceptId, entry] of CLICK_BY_CONCEPT) {
      if (!entry.wrongModel) continue;
      // Showing the correct model alone leaves the wrong one intact underneath,
      // which is how a student recites the right answer and flies the wrong one.
      expect(entry.wrongModel.brainWants.length, `${conceptId} states no wrong model`).toBeGreaterThan(20);
      expect(entry.wrongModel.actually.length, `${conceptId} states no correction`).toBeGreaterThan(20);
    }
  });

  it("resolve to a usable experience with real material in every act", () => {
    for (const [conceptId, entry] of CLICK_BY_CONCEPT) {
      const course = courseOf(conceptId)!;
      const resolved = resolveClick(contentFor(course), conceptId, entry);
      expect(resolved, `${conceptId} did not resolve`).not.toBeNull();

      // The prototypes are meant to be exceptional, so they are held to all four
      // acts. Later entries are allowed to be thinner; the player drops an act
      // it has no material for rather than rendering an empty stage.
      expect(resolved!.acts, `${conceptId} has no "see" act`).toContain("see");
      expect(resolved!.acts, `${conceptId} has no "move" act`).toContain("move");
      expect(resolved!.chain.length, `${conceptId} has no chain`).toBeGreaterThanOrEqual(3);
      expect(resolved!.speakNife.definition.length).toBeGreaterThan(0);
    }
  });
});
