/**
 * Skill analytics.
 *
 * Everywhere else on the platform, readiness is a function of concept mastery:
 * how well do you know the material. That is the wrong question for a course
 * examined on production. A student can hold every definition in this unit and
 * still be unable to get a groundspeed out of a CR-3 inside a minute, and the
 * dashboard should say so.
 *
 * So Navigation reads a second axis out of the same attempt log — no new
 * storage, no migration. Every attempt already records a question id; every
 * question records the skills it exercises; and attempts now carry the answer
 * that was given, which is what lets the diagnosis name the KIND of error
 * rather than just its existence.
 */

import type { Attempt, CourseContent, NumericQuestion, Question, Skill } from "@/lib/types";
import { diagnoseNumeric, gradeNumeric, type NavErrorKind } from "./grade";

/* ------------------------------------------------------------------ */
/* Per-skill                                                           */
/* ------------------------------------------------------------------ */

export interface SkillStat {
  skill: Skill;
  attempts: number;
  correct: number;
  /** 0–1, or null when the skill has never been attempted. */
  accuracy: number | null;
  /** Median seconds per attempt, or null. */
  medianSeconds: number | null;
  /** Most recent attempts, newest last, capped at 10. */
  recent: boolean[];
  lastSeenAt: number | null;
  /**
   * 0–100. Accuracy carries most of it, with a smaller contribution from
   * recency of success, because a skill you had in March is not a skill you
   * have today.
   */
  proficiency: number;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function skillStats(content: CourseContent, attempts: Attempt[]): SkillStat[] {
  const skills = content.skills ?? [];
  if (skills.length === 0) return [];

  const byQuestion = new Map(content.questions.map((q) => [q.id, q]));
  const buckets = new Map<string, { correct: boolean; seconds: number; at: number }[]>(
    skills.map((s) => [s.id, []]),
  );

  for (const attempt of attempts) {
    const q = byQuestion.get(attempt.questionId);
    if (!q?.skillIds) continue;
    for (const id of q.skillIds) {
      buckets.get(id)?.push({
        correct: attempt.correct,
        seconds: attempt.elapsedMs / 1000,
        at: attempt.at,
      });
    }
  }

  return skills.map((skill) => {
    const rows = (buckets.get(skill.id) ?? []).sort((a, b) => a.at - b.at);
    const correct = rows.filter((r) => r.correct).length;
    const accuracy = rows.length === 0 ? null : correct / rows.length;
    const recent = rows.slice(-10).map((r) => r.correct);
    const recentAccuracy =
      recent.length === 0 ? 0 : recent.filter(Boolean).length / recent.length;

    /*
     * Unattempted is zero rather than null-shaped, because a skill you have
     * never tried is not a skill you have. Attempted skills weight the recent
     * window at 40% so a run of misses shows up before the all-time average
     * catches on.
     */
    const proficiency =
      accuracy === null ? 0 : Math.round((accuracy * 0.6 + recentAccuracy * 0.4) * 100);

    return {
      skill,
      attempts: rows.length,
      correct,
      accuracy,
      medianSeconds: median(rows.map((r) => r.seconds)),
      recent,
      lastSeenAt: rows.length === 0 ? null : rows[rows.length - 1].at,
      proficiency,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Diagnostic categories                                               */
/* ------------------------------------------------------------------ */

/**
 * What the results screen breaks a Navigation score into.
 *
 * These are not the units. A student wants to know whether their chart work or
 * their wind solutions are the problem, and units 8 and 9 are the same skill
 * approached from two directions.
 */
export const NAV_CATEGORIES: { id: string; label: string; units: string[] }[] = [
  { id: "concepts", label: "Concepts", units: ["n1", "n2", "n3", "n4"] },
  { id: "chart", label: "Chart work", units: ["n5"] },
  { id: "cr3", label: "CR-3", units: ["n6"] },
  { id: "airspeed", label: "Airspeed", units: ["n7"] },
  { id: "winds", label: "Wind problems", units: ["n8", "n9"] },
  { id: "planning", label: "Flight planning", units: ["n10"] },
];

export interface CategoryStat {
  id: string;
  label: string;
  attempts: number;
  correct: number;
  pct: number | null;
}

export function categoryStats(content: CourseContent, attempts: Attempt[]): CategoryStat[] {
  const byQuestion = new Map(content.questions.map((q) => [q.id, q]));
  return NAV_CATEGORIES.map((cat) => {
    const rows = attempts.filter((a) => {
      const q = byQuestion.get(a.questionId);
      return q ? cat.units.includes(q.unit) : false;
    });
    const correct = rows.filter((r) => r.correct).length;
    return {
      id: cat.id,
      label: cat.label,
      attempts: rows.length,
      correct,
      pct: rows.length === 0 ? null : Math.round((correct / rows.length) * 100),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Cross-cutting measures                                              */
/* ------------------------------------------------------------------ */

export interface NavPerformance {
  /** Accuracy on numeric problems only — the calculation half of the course. */
  calculationPct: number | null;
  /** Accuracy on everything else. */
  recognitionPct: number | null;
  /** Median seconds on numeric problems. */
  medianSolveSeconds: number | null;
  /** Numeric problems answered inside their drill's target time. */
  onPacePct: number | null;
  totalProblems: number;
}

export function navPerformance(content: CourseContent, attempts: Attempt[]): NavPerformance {
  const byQuestion = new Map(content.questions.map((q) => [q.id, q]));
  const targetByQuestion = new Map<string, number>();
  for (const drill of content.drills ?? []) {
    for (const id of drill.questionIds) targetByQuestion.set(id, drill.targetSeconds);
  }

  const numeric: { correct: boolean; seconds: number; target?: number }[] = [];
  const other: boolean[] = [];

  for (const a of attempts) {
    const q = byQuestion.get(a.questionId);
    if (!q) continue;
    if (q.type === "numeric") {
      numeric.push({
        correct: a.correct,
        seconds: a.elapsedMs / 1000,
        target: targetByQuestion.get(q.id),
      });
    } else {
      other.push(a.correct);
    }
  }

  const paced = numeric.filter((n) => n.target !== undefined);
  const pct = (n: number, d: number) => (d === 0 ? null : Math.round((n / d) * 100));

  return {
    calculationPct: pct(numeric.filter((n) => n.correct).length, numeric.length),
    recognitionPct: pct(other.filter(Boolean).length, other.length),
    medianSolveSeconds: median(numeric.map((n) => n.seconds)),
    onPacePct: pct(paced.filter((n) => n.seconds <= n.target!).length, paced.length),
    totalProblems: numeric.length,
  };
}

/* ------------------------------------------------------------------ */
/* Error taxonomy                                                      */
/* ------------------------------------------------------------------ */

export interface ErrorTally {
  kind: NavErrorKind;
  label: string;
  count: number;
  advice: string;
}

/**
 * What kind of mistake this student keeps making.
 *
 * Only wrong numeric attempts can be diagnosed, and only those recorded since
 * attempts started carrying the answer given. Everything older is skipped
 * rather than guessed at.
 */
export function errorTaxonomy(content: CourseContent, attempts: Attempt[]): ErrorTally[] {
  const byQuestion = new Map(content.questions.map((q) => [q.id, q]));
  const tally = new Map<NavErrorKind, ErrorTally>();

  for (const a of attempts) {
    if (a.correct || a.answerKey === undefined) continue;
    const q = byQuestion.get(a.questionId);
    if (!q || q.type !== "numeric") continue;
    const diagnosis = diagnoseNumeric(gradeNumeric(q as NumericQuestion, a.answerKey));
    if (!diagnosis) continue;
    const row = tally.get(diagnosis.kind) ?? {
      kind: diagnosis.kind,
      label: diagnosis.label,
      advice: diagnosis.advice,
      count: 0,
    };
    row.count += 1;
    tally.set(diagnosis.kind, row);
  }

  return [...tally.values()].sort((a, b) => b.count - a.count);
}

/* ------------------------------------------------------------------ */
/* What to do next                                                     */
/* ------------------------------------------------------------------ */

export interface NavRecommendation {
  kind: "drill" | "mission" | "lesson";
  id: string;
  label: string;
  reason: string;
}

/**
 * The plan for today, built from the weakest skills rather than from a
 * schedule. A skill nobody has attempted outranks one attempted badly, because
 * the first gap is bigger than the second.
 */
export function recommendNext(
  content: CourseContent,
  attempts: Attempt[],
  limit = 4,
): NavRecommendation[] {
  const stats = skillStats(content, attempts);
  const byId = new Map(stats.map((s) => [s.skill.id, s]));
  const out: NavRecommendation[] = [];

  const ranked = [...(content.drills ?? [])]
    .map((drill) => {
      const rows = drill.skillIds.map((id) => byId.get(id)).filter(Boolean) as SkillStat[];
      const untried = rows.filter((r) => r.attempts === 0).length;
      const worst = rows.length === 0 ? 0 : Math.min(...rows.map((r) => r.proficiency));
      return { drill, untried, worst, tried: rows.some((r) => r.attempts > 0) };
    })
    .sort((a, b) => b.untried - a.untried || a.worst - b.worst);

  for (const row of ranked) {
    if (out.length >= limit - 1) break;
    out.push({
      kind: "drill",
      id: row.drill.id,
      label: row.drill.title,
      reason: !row.tried
        ? "Not attempted yet"
        : row.worst < 60
          ? `Weakest skill here is at ${row.worst}%`
          : `Holding at ${row.worst}% — keep it warm`,
    });
  }

  const mission = (content.missions ?? [])[0];
  if (mission) {
    out.push({
      kind: "mission",
      id: mission.id,
      label: mission.title,
      reason: "Puts the separate skills back together",
    });
  }

  return out.slice(0, limit);
}

/** Overall readiness for a problem-solving course, 0–100. */
export function navReadiness(content: CourseContent, attempts: Attempt[]): number {
  const stats = skillStats(content, attempts);
  if (stats.length === 0) return 0;
  return Math.round(stats.reduce((sum, s) => sum + s.proficiency, 0) / stats.length);
}

/** Skills sorted worst first, for the weak-areas panel. */
export function weakSkills(content: CourseContent, attempts: Attempt[], limit = 5): SkillStat[] {
  return skillStats(content, attempts)
    .filter((s) => s.attempts > 0)
    .sort((a, b) => a.proficiency - b.proficiency)
    .slice(0, limit);
}

/** Whether a question belongs to the drill bank rather than the lesson flow. */
export function isDrillQuestion(q: Question): boolean {
  return q.tags?.includes("drill") ?? false;
}
