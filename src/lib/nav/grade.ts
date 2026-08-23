/**
 * Tolerance-aware, unit-aware grading for numeric navigation answers.
 *
 * Everything else on the platform grades by string equality against a
 * serialized answer key, which works because every other question type has
 * one right answer. A navigation answer does not: the trainee guide publishes
 * a tolerance for each quantity, and 246 through 250 knots are all correct
 * when the answer is 248 ± 2. So numeric questions keep the same serialized
 * envelope — attempts, exam results and the review queue never learn a new
 * shape — but the comparison inside it is numeric, per field, against the
 * band Appendix A allows for that quantity.
 *
 * The unit is graded too. "250" typed into a field that wants nautical miles
 * is not the same answer as "250" typed into a field that wants knots, and a
 * grader that shrugs at the difference is teaching the wrong lesson.
 */

import type { NavUnit, NumericField, NumericQuestion } from "@/lib/types";
import {
  TOLERANCES,
  formatClock,
  formatElapsed,
  formatHoursMinutes,
  parseClock,
  parseElapsed,
  toleranceBand,
  withinDirectionTolerance,
  withinTolerance,
} from "./math";

/* ------------------------------------------------------------------ */
/* Parsing what the student typed                                      */
/* ------------------------------------------------------------------ */

/**
 * Turns raw input into the field's canonical measure, or null if it is not a
 * number at all. Clock and elapsed inputs accept the shapes the course
 * actually writes: 1427, 14:27, 2+30, 1+24+33, or plain minutes.
 */
export function parseFieldInput(raw: string, unit: NavUnit): number | null {
  const text = raw.trim().replace(/[,\s]/g, "");
  if (text === "") return null;

  if (unit === "clock") return parseClock(text);
  if (unit === "elapsed") {
    if (/[+:]/.test(text)) return parseElapsed(text);
    // A bare number in an elapsed field is minutes, which is how the jet log
    // writes an ETE.
    const n = Number(text);
    return Number.isFinite(n) ? n * 60 : null;
  }

  // Strip a trailing unit the student may have typed, and any degree sign.
  const stripped = text.replace(/°/g, "").replace(/(kts?|nm|lbs?|gal|pph|ft|inhg|z|m)$/i, "");
  const n = Number(stripped);
  return Number.isFinite(n) ? n : null;
}

export function formatFieldValue(value: number, unit: NavUnit): string {
  switch (unit) {
    case "deg":
      return `${String(Math.round(value)).padStart(3, "0")}°`;
    case "kt":
      return `${round(value, 0)} kt`;
    case "nm":
      return `${round(value, 1)} NM`;
    case "lb":
      return `${round(value, 0)} lb`;
    case "gal":
      return `${round(value, 0)} gal`;
    case "pph":
      return `${round(value, 0)} pph`;
    case "ft":
      return `${round(value, 0)} ft`;
    case "inHg":
      return `${value.toFixed(2)}"`;
    case "mach":
      return `M ${value.toFixed(3)}`;
    case "minutes":
      return `${round(value, 0)} min`;
    case "elapsed":
      return value < 3600 ? formatElapsed(value) : formatHoursMinutes(value);
    case "clock":
      return `${formatClock(value)}Z`;
    case "latMinutes":
    case "lonMinutes":
      return `${value.toFixed(1)}'`;
    case "latDegrees":
      return `${Math.round(value)}° N`;
    case "lonDegrees":
      return `${String(Math.round(value)).padStart(3, "0")}° W`;
  }
}

function round(value: number, places: number): string {
  const factor = 10 ** places;
  return String(Math.round(value * factor) / factor);
}

/** Short unit label for the input adornment. */
export const UNIT_LABEL: Record<NavUnit, string> = {
  deg: "°",
  kt: "kt",
  nm: "NM",
  lb: "lb",
  gal: "gal",
  pph: "pph",
  ft: "ft",
  inHg: "inHg",
  mach: "M",
  minutes: "min",
  elapsed: "h+mm+ss",
  clock: "Z",
  latMinutes: "min",
  lonMinutes: "min",
  latDegrees: "° N",
  lonDegrees: "° W",
};

/* ------------------------------------------------------------------ */
/* Serialization                                                       */
/* ------------------------------------------------------------------ */

export interface NumericAnswerMap {
  [fieldKey: string]: string;
}

/**
 * Numeric answers ride inside the same serialized envelope as everything
 * else: `f:` then `key=value` pairs in key order. Qualifiers hang off their
 * field's key with a `~`, so a crosswind of 35 knots from the left stores as
 * `xw=35~L`.
 */
export function serializeFields(values: NumericAnswerMap): string {
  const keys = Object.keys(values).sort();
  return `f:${keys.map((k) => `${k}=${values[k]}`).join("|")}`;
}

export function deserializeFields(serialized: string): NumericAnswerMap {
  if (!serialized.startsWith("f:")) return {};
  const body = serialized.slice(2);
  if (body === "") return {};
  const out: NumericAnswerMap = {};
  for (const pair of body.split("|")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    out[pair.slice(0, eq)] = pair.slice(eq + 1);
  }
  return out;
}

/** The canonical key, used for display in review and for storage parity. */
export function numericCorrectKey(q: NumericQuestion): string {
  const values: NumericAnswerMap = {};
  for (const f of q.fields) {
    values[f.key] = f.qualifier ? `${f.answer}~${f.qualifier.answer}` : String(f.answer);
  }
  return serializeFields(values);
}

/* ------------------------------------------------------------------ */
/* Grading                                                             */
/* ------------------------------------------------------------------ */

export interface FieldVerdict {
  key: string;
  label: string;
  /** What the student typed, unparsed. */
  given: string;
  /** Parsed value, or null if it was blank or unreadable. */
  value: number | null;
  expected: number;
  unit: NavUnit;
  correct: boolean;
  /** True when the number is right but the L/R or H/T qualifier is not. */
  qualifierWrong: boolean;
  /** How far off, in the field's own unit. Null when nothing was entered. */
  error: number | null;
  /** The band that was allowed, for the feedback line. */
  band: number;
  toleranceLabel: string;
}

export interface NumericVerdict {
  correct: boolean;
  /** Fraction of fields right, used for partial credit in practice. */
  score: number;
  fields: FieldVerdict[];
}

function fieldValueAndQualifier(raw: string): { value: string; qualifier?: string } {
  const tilde = raw.indexOf("~");
  if (tilde === -1) return { value: raw };
  return { value: raw.slice(0, tilde), qualifier: raw.slice(tilde + 1) };
}

export function gradeField(field: NumericField, raw: string | undefined): FieldVerdict {
  const { value: text, qualifier } = fieldValueAndQualifier(raw ?? "");
  const value = parseFieldInput(text, field.unit);
  const band = toleranceBand(field.tolerance, field.answer);

  const numberOk =
    value !== null &&
    (field.wraps
      ? withinDirectionTolerance(field.tolerance, value, field.answer)
      : withinTolerance(field.tolerance, value, field.answer));

  const qualifierOk = field.qualifier ? qualifier === field.qualifier.answer : true;

  return {
    key: field.key,
    label: field.label,
    given: text,
    value,
    expected: field.answer,
    unit: field.unit,
    correct: numberOk && qualifierOk,
    qualifierWrong: numberOk && !qualifierOk,
    error: value === null ? null : signedError(value, field),
    band,
    toleranceLabel: TOLERANCES[field.tolerance].label,
  };
}

function signedError(value: number, field: NumericField): number {
  if (!field.wraps) return value - field.answer;
  return ((value - field.answer + 540) % 360) - 180;
}

/**
 * All-or-nothing for the mark, per-field for the feedback.
 *
 * Exam scoring stays all-or-nothing so a percentage remains comparable to the
 * real NIFE exam, which does not award part marks. `score` is what the
 * practice UI colours the rows with, and what skill analytics use to tell
 * "one slip in a five-part problem" apart from "no idea".
 */
export function gradeNumeric(q: NumericQuestion, serialized: string): NumericVerdict {
  const given = deserializeFields(serialized);
  const fields = q.fields.map((f) => gradeField(f, given[f.key]));
  const right = fields.filter((f) => f.correct).length;
  return {
    correct: right === fields.length,
    score: fields.length === 0 ? 0 : right / fields.length,
    fields,
  };
}

/* ------------------------------------------------------------------ */
/* Error taxonomy                                                      */
/* ------------------------------------------------------------------ */

/**
 * What went wrong, not just that something did.
 *
 * "Incorrect" is close to useless in a calculation course. A reciprocal, a
 * decimal place and a sign error all look identical in the answer box and
 * need completely different remediation, and each has a signature you can
 * read off the number itself.
 */
export type NavErrorKind =
  | "blank"
  | "reciprocal"
  | "decimalPlace"
  | "sign"
  | "qualifier"
  | "scaleRead"
  | "closeButOutside"
  | "wrongMethod";

export interface NavErrorDiagnosis {
  kind: NavErrorKind;
  label: string;
  advice: string;
}

const DIAGNOSES: Record<NavErrorKind, Omit<NavErrorDiagnosis, "kind">> = {
  blank: {
    label: "Left blank",
    advice: "Put something down. An estimate inside the tolerance scores; a blank never does.",
  },
  reciprocal: {
    label: "Reciprocal",
    advice:
      "You read the far end of the plotter scale. Estimating the general direction first is the whole defence against this — a course heading north-west has to come out between 270 and 360.",
  },
  decimalPlace: {
    label: "Decimal place",
    advice:
      "The digits are right and the magnitude is not, which is the classic floating-decimal miss on the CR-3. Estimate the answer before you read the wheel and the decimal places itself.",
  },
  sign: {
    label: "Added instead of subtracted",
    advice:
      "Check the direction of the correction. East is least and west is best; less than 29.92 you add; a headwind comes off the true airspeed.",
  },
  qualifier: {
    label: "Right number, wrong side",
    advice:
      "The magnitude is good but the left/right or head/tail is not. Sketch the wind against the course before you touch the wheel.",
  },
  scaleRead: {
    label: "Scale misread",
    advice:
      "Close, but outside tolerance in a way that looks like a tick-mark miscount. Check which scale you were on and how much each mark is worth.",
  },
  closeButOutside: {
    label: "Just outside tolerance",
    advice: "The method is right. This is reading precision — slow down on the final read.",
  },
  wrongMethod: {
    label: "Wrong method",
    advice: "Far enough out that the setup is the problem, not the reading. Replay the worked example.",
  },
};

export function diagnoseField(verdict: FieldVerdict): NavErrorDiagnosis | null {
  if (verdict.correct) return null;
  const make = (kind: NavErrorKind): NavErrorDiagnosis => ({ kind, ...DIAGNOSES[kind] });

  if (verdict.value === null) return make("blank");
  if (verdict.qualifierWrong) return make("qualifier");

  const { value, expected, band } = verdict;

  // A direction 180 out is a reciprocal, full stop.
  if (verdict.unit === "deg") {
    const spread = Math.abs((((value - expected) % 360) + 360) % 360);
    if (Math.abs(spread - 180) <= 5) return make("reciprocal");
  }

  // Powers of ten in either direction are the floating-decimal miss.
  if (expected !== 0 && value !== 0) {
    for (const factor of [0.01, 0.1, 10, 100]) {
      if (Math.abs(value - expected * factor) <= Math.abs(expected * factor) * 0.02) {
        return make("decimalPlace");
      }
    }
  }

  // The right magnitude applied the wrong way round a reference.
  if (Math.abs(value + expected) <= band) return make("sign");

  const error = Math.abs(value - expected);
  if (error <= band * 2) return make("closeButOutside");
  if (error <= Math.abs(expected) * 0.1) return make("scaleRead");
  return make("wrongMethod");
}

/** The diagnosis for a whole answer: the first field that went wrong. */
export function diagnoseNumeric(verdict: NumericVerdict): NavErrorDiagnosis | null {
  for (const f of verdict.fields) {
    const d = diagnoseField(f);
    if (d) return d;
  }
  return null;
}
