import type { CourseContent, Lesson } from "@/lib/types";
import { UNITS } from "./units";
import { SKILLS } from "./skills";
import { CONCEPTS } from "./concepts";
import { QUESTIONS } from "./questions";
import { MISSIONS, MISSION_QUESTIONS } from "./missions";
import { DRILLS } from "./drills";
import { LESSONS_A } from "./lessons/part-a";
import { LESSONS_B } from "./lessons/part-b";
import { LESSONS_C } from "./lessons/part-c";
import { EXPLAINERS } from "./explainers";
import { LABS } from "./labs";
import { KNOW_COLD } from "./know-cold";

/**
 * Navigation.
 *
 * Built from NAVAVSCOLSCOM-SG-200 Module/Unit 6, "Introduction to Air
 * Navigation" (CIN Q-9B-0020L), with the NETSAFA Navigation final examination
 * booklet as a second source of official question wording.
 *
 * The guide publishes its enabling objectives in two numbering series — the
 * 2.xxx block shared with the rest of the syllabus, and a separate 4.x block
 * for the objectives unique to this unit. Thirty-seven distinct objectives in
 * all, and this course carries every one.
 *
 * As in Weather, lessons INHERIT their enabling objectives from the concepts
 * they teach rather than restating the mapping. The concept graph is already
 * the single source of truth for which objective a piece of material serves,
 * and writing it twice would only create somewhere for the two to disagree.
 */

const EO_BY_CONCEPT = new Map(CONCEPTS.map((c) => [c.id, c.source.eo ?? []]));

function withEnablingObjectives(lesson: Lesson): Lesson {
  const eos = [
    ...new Set(lesson.conceptIds.flatMap((id) => EO_BY_CONCEPT.get(id) ?? [])),
  ].sort(compareEo);
  return { ...lesson, enablingObjectives: eos };
}

/** 2.42 before 2.330, and 4.2 before 4.10 — numeric, not lexical. */
function compareEo(a: string, b: string): number {
  const [aMaj, aMin] = a.split(".").map(Number);
  const [bMaj, bMin] = b.split(".").map(Number);
  return aMaj - bMaj || aMin - bMin;
}

const LESSONS: Lesson[] = [...LESSONS_A, ...LESSONS_B, ...LESSONS_C]
  .map(withEnablingObjectives)
  .sort((a, b) => a.index - b.index)
  .map((l, i) => ({ ...l, index: i + 1 }));

export const NAV_CONTENT: CourseContent = {
  units: UNITS,
  concepts: CONCEPTS,
  lessons: LESSONS,
  questions: [...QUESTIONS, ...MISSION_QUESTIONS],
  explainers: EXPLAINERS,
  labs: LABS,
  knowCold: KNOW_COLD,
  skills: SKILLS,
  drills: DRILLS,
  missions: MISSIONS,
};

export { SKILLS, DRILLS, MISSIONS };
