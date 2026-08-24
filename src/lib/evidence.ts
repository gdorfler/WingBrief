/**
 * What kind of proof an answer actually is.
 *
 * The mastery engine used to count answers without asking what they proved.
 * Six correct definition questions and six correct scenario problems produced
 * exactly the same record, so "Mastered" could mean "can pick the right
 * sentence out of four" — which is not what the NIFE exam asks for and not
 * what a student needs on a check ride.
 *
 * Two tiers, deliberately. A finer ladder would be more precise on paper and
 * unusable in practice, because the curriculum would have to be hand-graded
 * question by question to populate it. These two are derivable from the shape
 * of the question itself, so they can never drift out of sync with content:
 *
 * - **recall** — you retrieved a stored fact. Definitions, values, names.
 * - **apply** — you did something with it. Predicted a change, read a graph,
 *   worked a number, ordered a causal chain, or resisted a wording trap.
 *
 * The split is derived rather than authored because an author flag would be
 * one more thing to forget. Where the derivation would be wrong for a specific
 * question, `evidenceOverride` on that question wins.
 */

import type { EvidenceKind, Question, QuestionType } from "./types";

/**
 * Question types that cannot be answered by recognition alone.
 *
 * Each of these makes the student operate on the concept rather than identify
 * it: `numeric` works the problem, `curveShift` and `sliderPredict` and
 * `beforeAfter` predict the effect of a change, `graphRead` and `tapDiagram`
 * and `dragLabel` interpret a visual, `connectChain` orders a causal sequence,
 * and `spotTheTrap` discriminates against the exact wording the exam exploits.
 */
const APPLY_TYPES: ReadonlySet<QuestionType> = new Set<QuestionType>([
  "numeric",
  "sliderPredict",
  "curveShift",
  "beforeAfter",
  "graphRead",
  "tapDiagram",
  "dragLabel",
  "connectChain",
  "spotTheTrap",
]);

/**
 * The difficulty at which a multiple-choice question stops being recognition.
 *
 * Calibrated against the bank rather than assumed. A sample across all five
 * courses shows difficulty 1 and 2 multiple choice is overwhelmingly "X is
 * defined as" — while difficulty 3 is consistently multi-variable or
 * scenario-framed ("At 5,000 ft MSL, IAS is ___ TAS and ___ as TAS ___",
 * "An aircraft flown into a microburst will initially encounter"). Those
 * cannot be answered without holding the relationship, so they count.
 */
const APPLIED_MCQ_DIFFICULTY = 3;

/** What one question proves when answered correctly. */
export function evidenceFor(
  question: Pick<Question, "type" | "difficulty"> & {
    evidenceOverride?: EvidenceKind;
  },
): EvidenceKind {
  if (question.evidenceOverride) return question.evidenceOverride;
  if (APPLY_TYPES.has(question.type)) return "apply";
  return question.difficulty >= APPLIED_MCQ_DIFFICULTY ? "apply" : "recall";
}

/** True when this question can carry a concept to full mastery. */
export function provesApplication(
  question: Pick<Question, "type" | "difficulty"> & {
    evidenceOverride?: EvidenceKind;
  },
): boolean {
  return evidenceFor(question) === "apply";
}
