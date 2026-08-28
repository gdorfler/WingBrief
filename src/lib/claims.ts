/**
 * What the app is willing to say this student can do.
 *
 * Readiness — "the share of a course's concepts at a sufficient mastery level"
 * — is a statement about how much of the syllabus has been touched. It is the
 * publisher's view of the student, it only ever goes up, and it answers a
 * question nobody asks. A student wants to know whether they will pass, what
 * they are bad at, and whether they are better than last week.
 *
 * A claim is a different data structure, not a rebrand of the same number: a
 * sentence the app will stand behind, withheld until it has been demonstrated,
 * and WITHDRAWN when contradicted. That last part is the whole point. A claim
 * can be lost, which is something no percentage in this product has ever done.
 *
 * The boundary against the no-rank-ladder rule matters, because they look
 * similar and are opposites. A rank invents a hierarchy and pays out for
 * effort. A claim is a true statement about demonstrated performance, and it
 * costs nothing to withhold.
 *
 * This is not a new idea in this codebase so much as an overdue one. Navigation
 * already distinguishes a concept — something you know — from a Skill, "something
 * you can do, at a stated speed, to a stated tolerance", and is graded on the
 * second. The four knowledge courses only ever had the first. A claim is the
 * knowledge-course sibling of a skill, and the two should converge: once
 * Navigation's drills report against its skills, those become claims too, and
 * this module gains a second source of evidence rather than a second vocabulary.
 */

import { beliefsFrom, type Belief } from "./diagnosis";
import { evidenceFor } from "./evidence";
import type { Attempt, ConceptId, CourseContent, CourseId } from "./types";

/* ------------------------------------------------------------------ */
/* Shape                                                               */
/* ------------------------------------------------------------------ */

export interface Claim {
  id: string;
  /**
   * The sentence the app will say, written as a capability.
   *
   * Phrased as something a student could repeat out loud to another person —
   * "read a METAR and say what the weather is doing", not "METAR proficiency".
   * If it does not survive being said aloud it is not a claim, it is a label.
   */
  label: string;
  /** What earning it takes, in the student's terms. */
  earnedBy: string;
  conceptIds: ConceptId[];
  /**
   * Distinct apply-tier questions that must have been answered correctly.
   *
   * Distinct, because otherwise a claim is farmable by re-answering one
   * question until it sticks. Apply-tier, because recognising the right
   * sentence out of four is not doing the thing.
   */
  applied: number;
}

export type ClaimStatus =
  /** Demonstrated, and nothing since has contradicted it. */
  | "earned"
  /** Was demonstrated; a standing wrong answer has since withdrawn it. */
  | "contested"
  /** Some evidence, not enough. */
  | "open"
  /** Nothing yet. */
  | "untouched";

export interface ClaimState {
  claim: Claim;
  status: ClaimStatus;
  /** Distinct apply-tier questions correct so far. */
  have: number;
  need: number;
  /** The wrong answer that withdrew it, when contested. */
  contradiction?: Belief;
}

/* ------------------------------------------------------------------ */
/* Weather                                                             */
/* ------------------------------------------------------------------ */

/**
 * Weather goes first because it is examined on production as much as
 * Navigation is — three of its objectives use the word INTERPRET — and because
 * every claim below has six to eight apply-tier questions behind it, which was
 * checked before these were written rather than assumed.
 */
export const WEATHER_CLAIMS: Claim[] = [
  {
    id: "wxc-metar",
    label: "Read a METAR and say what the weather is actually doing",
    earnedBy: "Decoding real observations, not naming the code groups.",
    conceptIds: ["wx-metar", "wx-metar-groups", "wx-metar-speci", "wx-station-model"],
    applied: 4,
  },
  {
    id: "wxc-taf",
    label: "Read a TAF and say what it is forecasting, and until when",
    earnedBy: "Working change groups and validity periods on real forecasts.",
    conceptIds: ["wx-taf", "wx-taf-change-groups", "wx-taf-differences"],
    applied: 4,
  },
  {
    id: "wxc-altimeter",
    label: "Say which way the altimeter is lying, and why",
    earnedBy: "Working the altitude the instrument shows against the one you have.",
    conceptIds: [
      "wx-altimeter",
      "wx-temp-altimeter-error",
      "wx-pressure-altitude",
      "wx-density-altitude",
      "wx-true-altitude",
      "wx-indicated-altitude",
    ],
    applied: 4,
  },
  {
    id: "wxc-icing",
    label: "Decide whether ice will form, and which kind you will get",
    earnedBy: "Reading a temperature band and a moisture state into an outcome.",
    conceptIds: [
      "wx-icing-requirements",
      "wx-clear-ice",
      "wx-rime-ice",
      "wx-mixed-ice",
      "wx-icing-effects",
      "wx-icing-response",
    ],
    applied: 4,
  },
  {
    id: "wxc-storm",
    label: "Call the thunderstorm hazards and the avoidance priorities in order",
    earnedBy: "Ordering the response, not listing the hazards.",
    conceptIds: [
      "wx-thunderstorm-hazards",
      "wx-thunderstorm-avoidance",
      "wx-thunderstorm-radar",
      "wx-microburst",
    ],
    applied: 4,
  },
  {
    id: "wxc-fronts",
    label: "Say what a front will do to your flight before you reach it",
    earnedBy: "Predicting the weather a front brings from its type and slope.",
    conceptIds: [
      "wx-cold-front",
      "wx-warm-front",
      "wx-frontal-weather-factors",
      "wx-frontal-icing",
      "wx-occluded-front",
      "wx-stationary-front",
    ],
    applied: 4,
  },
];

const BY_COURSE: Partial<Record<CourseId, Claim[]>> = {
  weather: WEATHER_CLAIMS,
};

/** The claims defined for a course, or none — most courses still show coverage. */
export function claimsFor(course: CourseId): Claim[] {
  return BY_COURSE[course] ?? [];
}

export function courseHasClaims(course: CourseId): boolean {
  return claimsFor(course).length > 0;
}

/* ------------------------------------------------------------------ */
/* Evaluation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Work out what the app will currently stand behind.
 *
 * A claim is withdrawn — not merely un-earned — when a standing wrong answer
 * touches one of its concepts, even if the evidence bar is still met. Saying
 * "you can decide whether ice will form" to someone who is right now getting
 * clear ice and rime ice the wrong way round would make every other claim on
 * the page worth less.
 */
export function evaluateClaims(
  content: CourseContent,
  attempts: Attempt[],
  claims: Claim[],
): ClaimState[] {
  const byQuestion = new Map(content.questions.map((q) => [q.id, q]));
  const beliefs = beliefsFrom(content, attempts).filter((b) => b.standing);

  return claims.map((claim) => {
    const set = new Set(claim.conceptIds);

    /* Distinct questions, so the bar cannot be cleared by repetition. */
    const proven = new Set<string>();
    for (const a of attempts) {
      if (!a.correct) continue;
      const q = byQuestion.get(a.questionId);
      if (!q) continue;
      if (!q.conceptIds.some((id) => set.has(id))) continue;
      // Trust the attempt's own tier where it has one; fall back to deriving it
      // for attempts written before the evidence model existed.
      const tier = a.evidence ?? evidenceFor(q);
      if (tier !== "apply") continue;
      proven.add(a.questionId);
    }

    const contradiction = beliefs.find((b) => b.conceptIds.some((id) => set.has(id)));
    const have = proven.size;
    const met = have >= claim.applied;

    let status: ClaimStatus;
    if (met && contradiction) status = "contested";
    else if (met) status = "earned";
    else if (have > 0) status = "open";
    else status = "untouched";

    return { claim, status, have, need: claim.applied, contradiction };
  });
}

/* ------------------------------------------------------------------ */
/* Reading it back                                                     */
/* ------------------------------------------------------------------ */

export interface ClaimSummary {
  states: ClaimState[];
  earned: ClaimState[];
  contested: ClaimState[];
  /** The claim closest to being earned, for "go and get this one". */
  nearest: ClaimState | null;
}

export function summariseClaims(states: ClaimState[]): ClaimSummary {
  const earned = states.filter((s) => s.status === "earned");
  const contested = states.filter((s) => s.status === "contested");

  /*
   * "Nearest" is the most nearly-earned claim that is not already earned. A
   * contested one is deliberately eligible and sorts first: getting a withdrawn
   * claim back is a better next move than starting a new one, and it is the
   * only place in the product where the student has something to win back.
   */
  const nearest =
    [...states]
      .filter((s) => s.status !== "earned")
      .sort((a, b) => {
        if (a.status === "contested" && b.status !== "contested") return -1;
        if (b.status === "contested" && a.status !== "contested") return 1;
        return b.have - a.have;
      })[0] ?? null;

  return { states, earned, contested, nearest };
}
