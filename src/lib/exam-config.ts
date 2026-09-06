import { UNIT_BY_ID } from "@/content";
import type { CourseContent, ExamResult, UnitId } from "./types";

export const PICKABLE_EXAM_MODES = ["quick", "full", "unit", "weak"] as const;
export type PickableExamMode = (typeof PICKABLE_EXAM_MODES)[number];

const EXAM_MODES: readonly ExamResult["mode"][] = [
  ...PICKABLE_EXAM_MODES,
  "custom",
];

const DEFAULT_COUNTS: Record<ExamResult["mode"], number> = {
  quick: 20,
  full: 50,
  unit: 15,
  weak: 20,
  custom: 20,
};

export interface ExamConfig {
  mode: ExamResult["mode"];
  /** Preserve the selected question pool when length is customised. */
  scope?: PickableExamMode;
  count: number;
  timed: boolean;
  /** Seconds allowed when timed. */
  seconds: number;
  unit?: UnitId;
  seed: string;
  label: string;
}

/** Query strings are untrusted, even when the app normally creates them. */
export function parsePickableExamMode(value: string | null): PickableExamMode {
  return PICKABLE_EXAM_MODES.includes(value as PickableExamMode)
    ? (value as PickableExamMode)
    : "quick";
}

function parseExamMode(value: string | null): ExamResult["mode"] {
  return EXAM_MODES.includes(value as ExamResult["mode"])
    ? (value as ExamResult["mode"])
    : "quick";
}

function boundedInteger(value: string | null, fallback: number, maximum: number): number {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback;
}

function labelFor(mode: ExamResult["mode"], unit: UnitId | undefined, count: number): string {
  if (mode === "unit" && unit) return `${UNIT_BY_ID[unit]?.title ?? "Unit"} exam`;
  if (mode === "weak") return "Weak-area exam";
  if (mode === "full") return `Full ${count}-question exam`;
  if (mode === "quick") return `Quick ${count}-question exam`;
  return `${count}-question exam`;
}

/** Parse and bound every value accepted by the directly addressable exam URL. */
export function parseExamConfig(params: Pick<URLSearchParams, "get">): ExamConfig {
  let mode = parseExamMode(params.get("mode"));
  let scope = mode === "custom" ? parsePickableExamMode(params.get("scope")) : mode;
  const rawUnit = params.get("unit");
  let unit = rawUnit && UNIT_BY_ID[rawUnit] ? (rawUnit as UnitId) : undefined;

  // A unit paper without a real unit cannot produce a question pool.
  if (scope === "unit" && !unit) {
    if (mode !== "custom") mode = "quick";
    scope = "quick";
    unit = undefined;
  }

  const count = boundedInteger(params.get("count"), DEFAULT_COUNTS[mode], 100);
  const minutes = boundedInteger(params.get("minutes"), count, 24 * 60);

  return {
    mode,
    scope,
    unit,
    count,
    timed: params.get("timed") === "1",
    seconds: minutes * 60,
    seed: params.get("seed")?.trim() || "exam-default",
    label: labelFor(mode, unit, count),
  };
}

/**
 * Hydration decides the active course after the URL has been parsed. A valid
 * unit id from a different course is still invalid for the paper being built,
 * so fall back to a whole-course quick exam instead of mounting an empty one.
 */
export function normalizeExamConfig(
  config: ExamConfig,
  content: CourseContent,
): ExamConfig {
  const unitIsActive =
    (config.scope ?? config.mode) !== "unit" ||
    (config.unit !== undefined && content.units.some((unit) => unit.id === config.unit));
  const mode = unitIsActive ? config.mode : "quick";
  const unit = unitIsActive ? config.unit : undefined;
  const scope = unitIsActive ? (config.scope ?? (mode === "custom" ? "quick" : mode)) : "quick";
  const available = scope === "unit" ? content.questions.filter(q => q.unit === unit).length : content.questions.length;
  const fallback = DEFAULT_COUNTS[mode];
  const requested = Number.isSafeInteger(config.count) && config.count > 0
    ? config.count
    : fallback;
  const count = Math.max(1, Math.min(requested, available));

  return {
    ...config,
    mode,
    scope,
    unit,
    count,
    label: labelFor(mode, unit, count),
  };
}
