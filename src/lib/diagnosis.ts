/**
 * What this student believes that is wrong.
 *
 * Navigation has had an error taxonomy since it shipped: a wrong number carries
 * a signature, so `nav/grade.ts` can tell a reciprocal from a decimal-place slip
 * and say something useful about each. The other four courses had nothing of the
 * kind, because "incorrect" was all that reached the mastery record — even
 * though the attempt log has stored the answer actually given all along.
 *
 * This module is the equivalent for choice questions, and it needs no new
 * authoring to work. A wrong option that a student picks repeatedly IS the
 * misconception, stated in the question's own words. Which one they chose is
 * the diagnosis; prose explaining it can be written later for the handful that
 * turn out to matter, rather than pre-written for all 1,163 up front.
 *
 * Pure functions over (content, attempts, predictions), like the rest of the
 * engine. Nothing here mutates or reaches for global state.
 */

import type {
  Attempt,
  ConceptId,
  CourseContent,
  PredictionRecord,
  Question,
} from "./types";

/* ------------------------------------------------------------------ */
/* Decoding                                                            */
/* ------------------------------------------------------------------ */

/** Question types whose answer is an option index and whose options are prose. */
const CHOICE_TYPES = new Set(["mcq", "spotTheTrap", "sliderPredict"]);

/**
 * The option index inside a serialised answer, or null.
 *
 * Indexed answers serialise as `i:<n>`. Everything else — targets, orders,
 * maps, numeric field sets — is a different shape and is not a distractor
 * choice, so it is skipped rather than coerced.
 */
export function chosenIndex(answerKey: string | undefined): number | null {
  if (!answerKey || !answerKey.startsWith("i:")) return null;
  const n = Number(answerKey.slice(2));
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function optionsOf(q: Question): string[] | null {
  if (!CHOICE_TYPES.has(q.type)) return null;
  const opts = (q as unknown as { options?: unknown }).options;
  return Array.isArray(opts) && opts.every((o) => typeof o === "string")
    ? (opts as string[])
    : null;
}

/* ------------------------------------------------------------------ */
/* The belief record                                                   */
/* ------------------------------------------------------------------ */

/**
 * One wrong answer this student has chosen, and how persistently.
 *
 * `text` is the distractor in the question's own words, which is what makes
 * this legible without any new content: the app can say "you keep choosing
 * *the whole curve shifts right*" rather than "you keep getting q-142 wrong".
 */
export interface Belief {
  questionId: string;
  conceptIds: ConceptId[];
  /** Index of the wrong option chosen. */
  option: number;
  text: string;
  /** The option that was correct, for phrasing the contrast. */
  correctText: string;
  /** How many times this exact wrong option was chosen. */
  count: number;
  lastAt: number;
  /** True while the student has not since answered this question correctly. */
  standing: boolean;
}

/**
 * Every distractor this student has chosen more than once, or chose most
 * recently and has not since corrected.
 *
 * A single wrong answer is noise — a slip, a misread, a tired evening. The
 * signal is a wrong answer they *return to*, which is why repetition and
 * standing-ness are both tracked and a one-off correct-since miss drops out.
 */
export function beliefsFrom(content: CourseContent, attempts: Attempt[]): Belief[] {
  const byQuestion = new Map(content.questions.map((q) => [q.id, q]));

  /** Most recent correct answer per question, so a fixed belief can retire. */
  const lastCorrectAt = new Map<string, number>();
  for (const a of attempts) {
    if (!a.correct) continue;
    lastCorrectAt.set(a.questionId, Math.max(lastCorrectAt.get(a.questionId) ?? 0, a.at));
  }

  const byChoice = new Map<string, Belief>();

  for (const a of attempts) {
    if (a.correct) continue;
    const option = chosenIndex(a.answerKey);
    if (option === null) continue;

    const q = byQuestion.get(a.questionId);
    if (!q) continue;
    const options = optionsOf(q);
    if (!options) continue;

    const answer = (q as unknown as { answer?: unknown }).answer;
    if (typeof answer !== "number") continue;
    // A "wrong" answer equal to the key means the attempt and the content have
    // drifted — the question was re-keyed after it was answered. Not a belief.
    if (option === answer) continue;
    if (options[option] === undefined) continue;

    const key = `${a.questionId}#${option}`;
    const existing = byChoice.get(key);
    if (existing) {
      existing.count += 1;
      existing.lastAt = Math.max(existing.lastAt, a.at);
    } else {
      byChoice.set(key, {
        questionId: a.questionId,
        conceptIds: q.conceptIds,
        option,
        text: options[option],
        correctText: options[answer] ?? "",
        count: 1,
        lastAt: a.at,
        standing: true,
      });
    }
  }

  const out: Belief[] = [];
  for (const belief of byChoice.values()) {
    belief.standing = (lastCorrectAt.get(belief.questionId) ?? 0) < belief.lastAt;
    // Chosen more than once, or still uncorrected. Everything else is noise.
    if (belief.count > 1 || belief.standing) out.push(belief);
  }

  return out.sort((a, b) => b.count - a.count || b.lastAt - a.lastAt);
}

/* ------------------------------------------------------------------ */
/* Rolled up to the concept                                            */
/* ------------------------------------------------------------------ */

export interface ConceptDiagnosis {
  conceptId: ConceptId;
  name: string;
  /** Wrong choices attached to this concept, strongest first. */
  beliefs: Belief[];
  /** Gate predictions on explainers that teach it. */
  predictionsMade: number;
  predictionsWrong: number;
  /** Total weight of standing wrong choices — the ranking signal. */
  weight: number;
}

/**
 * The concepts this student is most likely to be wrong about, and why.
 *
 * Predictions are counted but weighted at zero, deliberately. A wrong
 * prediction before instruction is expected and healthy; it says the explainer
 * had something to teach, not that the student is deficient. It is shown
 * alongside so a human can see the before-and-after, never used to rank someone
 * as weak.
 */
export function diagnoseConcepts(
  content: CourseContent,
  attempts: Attempt[],
  predictions: PredictionRecord[] = [],
): ConceptDiagnosis[] {
  const nameOf = new Map(content.concepts.map((c) => [c.id, c.name]));
  const rows = new Map<ConceptId, ConceptDiagnosis>();

  const row = (id: ConceptId): ConceptDiagnosis | null => {
    if (!nameOf.has(id)) return null;
    let r = rows.get(id);
    if (!r) {
      r = {
        conceptId: id,
        name: nameOf.get(id) ?? id,
        beliefs: [],
        predictionsMade: 0,
        predictionsWrong: 0,
        weight: 0,
      };
      rows.set(id, r);
    }
    return r;
  };

  for (const belief of beliefsFrom(content, attempts)) {
    for (const id of belief.conceptIds) {
      const r = row(id);
      if (!r) continue;
      r.beliefs.push(belief);
      // A belief they have since corrected still counts, but much less than one
      // they are walking around with today.
      r.weight += belief.standing ? belief.count : belief.count * 0.25;
    }
  }

  for (const p of predictions) {
    for (const id of p.conceptIds) {
      const r = row(id);
      if (!r) continue;
      r.predictionsMade += 1;
      if (!p.correct) r.predictionsWrong += 1;
    }
  }

  return [...rows.values()]
    .filter((r) => r.beliefs.length > 0 || r.predictionsMade > 0)
    .sort((a, b) => b.weight - a.weight || b.beliefs.length - a.beliefs.length);
}

/* ------------------------------------------------------------------ */
/* Coverage of the instrument itself                                   */
/* ------------------------------------------------------------------ */

export interface DiagnosisCoverage {
  /** Wrong attempts in the log. */
  misses: number;
  /** Of those, how many carry an answer we can decode into a distractor. */
  diagnosable: number;
  /** Wrong attempts predating the answerKey field, which can never be recovered. */
  unrecorded: number;
  /** Gate predictions captured. */
  predictions: number;
}

/**
 * How much of this student's history the instrument can actually read.
 *
 * Worth surfacing before anyone trusts a diagnosis: attempts recorded before
 * `answerKey` existed carry no answer, and a report built mostly from those
 * would look confidently empty rather than honestly blind.
 */
export function diagnosisCoverage(
  content: CourseContent,
  attempts: Attempt[],
  predictions: PredictionRecord[] = [],
): DiagnosisCoverage {
  const byQuestion = new Map(content.questions.map((q) => [q.id, q]));
  let misses = 0;
  let diagnosable = 0;
  let unrecorded = 0;

  for (const a of attempts) {
    if (a.correct) continue;
    misses += 1;
    if (a.answerKey === undefined) {
      unrecorded += 1;
      continue;
    }
    const q = byQuestion.get(a.questionId);
    if (q && optionsOf(q) && chosenIndex(a.answerKey) !== null) diagnosable += 1;
  }

  return { misses, diagnosable, unrecorded, predictions: predictions.length };
}
