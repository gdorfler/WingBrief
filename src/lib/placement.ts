/**
 * Placement credit — testing out of a lesson you already know.
 *
 * Lessons unlock strictly in order today (see `lessonStates` in review.ts):
 * finishing lesson N unlocks N+1, full stop. That is right for someone
 * starting cold, and wrong for someone who already knows the material —
 * a returning student, someone who studied elsewhere, or someone who just
 * did well on a unit exam should not have to click through screens for
 * concepts they have already demonstrated.
 *
 * The credit check is deliberately conservative and reuses evidence that
 * already exists rather than administering a special "placement test":
 * mastery levels are built from real answer history (see mastery.ts —
 * level 4 needs at least four attempts at 85% weighted accuracy, level 5
 * needs six at 95%), so a lesson only qualifies once every one of its
 * concepts has actually been proven, not just brushed against once. There
 * is no separate quiz format to build or keep in sync; any question that
 * feeds `recordAnswer` — a lesson, review, or an exam — can produce credit.
 *
 * Skipping teaching is the highest-stakes thing the mastery record is
 * allowed to authorise, so this is the one place that demands application
 * evidence outright rather than letting a high average stand in for it.
 * Recognising every term in a lesson is not a reason to skip the lesson:
 * the student who can pick "stall speed" out of four options has not
 * thereby shown they know what altitude does to it.
 */

import { conceptFraction } from "./mastery";
import type { CourseProgressView, Lesson, UnitId } from "./types";

export interface PlacementCandidate {
  lessonId: string;
  title: string;
  subtitle: string;
  unit: UnitId;
  unitTitle: string;
  /** Average concept mastery fraction (0–1) backing this credit. */
  score: number;
}

/**
 * Not-yet-completed lessons whose concepts are already mastered well past
 * the lesson's own bar.
 *
 * A lesson qualifies only when EVERY one of its concepts has been seen at
 * least once, has at least one correct application-tier answer behind it,
 * none of them sits below level 3 (the same "weak" cutoff `lessonStates`
 * uses elsewhere), and the average fraction across them clears
 * `lesson.masteryThreshold` — the exact bar the lesson would want a student
 * to hit if they had taken it. A lesson with no concepts (a pure
 * orientation screen, say) is never a placement candidate: there is nothing
 * for the mastery record to have proven.
 */
export function placementCandidates(
  lessons: Lesson[],
  units: { id: UnitId; title: string }[],
  state: CourseProgressView,
): PlacementCandidate[] {
  const unitTitle = new Map(units.map((u) => [u.id, u.title]));

  return [...lessons]
    .sort((a, b) => a.index - b.index)
    .filter((lesson) => {
      if (state.lessons[lesson.id]?.completed) return false;
      if (lesson.conceptIds.length === 0) return false;

      const records = lesson.conceptIds.map((id) => state.mastery[id]);
      if (records.some((r) => !r || r.seen === 0)) return false;
      if (records.some((r) => r!.level < 3)) return false;
      // Every concept must have been USED correctly at least once, not just
      // recognised. Averages hide a concept that was only ever named.
      if (records.some((r) => (r!.applied ?? 0) < 1)) return false;

      const avg =
        records.reduce((sum, r) => sum + conceptFraction(r), 0) / records.length;
      return avg >= lesson.masteryThreshold;
    })
    .map((lesson) => {
      const records = lesson.conceptIds.map((id) => state.mastery[id]);
      const avg =
        records.reduce((sum, r) => sum + conceptFraction(r), 0) / records.length;
      return {
        lessonId: lesson.id,
        title: lesson.title,
        subtitle: lesson.subtitle,
        unit: lesson.unit,
        unitTitle: unitTitle.get(lesson.unit) ?? lesson.unit,
        score: avg,
      };
    });
}

/** Grouped by unit, in unit order, for a display that reads like a summary. */
export function groupPlacementCandidates(
  candidates: PlacementCandidate[],
): { unit: UnitId; unitTitle: string; lessons: PlacementCandidate[] }[] {
  const byUnit = new Map<UnitId, PlacementCandidate[]>();
  for (const c of candidates) {
    const list = byUnit.get(c.unit) ?? [];
    list.push(c);
    byUnit.set(c.unit, list);
  }
  return [...byUnit.entries()].map(([unit, list]) => ({
    unit,
    unitTitle: list[0].unitTitle,
    lessons: list,
  }));
}

