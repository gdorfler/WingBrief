/**
 * Answer checking and exam scoring.
 *
 * Every question type collapses to a single serialized "answer key" string so
 * attempts, exam results and review-missed lists can be stored uniformly.
 */

import type {
  ConceptId,
  ExamResult,
  MasteryRecord,
  Question,
  UnitId,
} from "./types";

/* ------------------------------------------------------------------ */
/* Answer serialization                                                */
/* ------------------------------------------------------------------ */

export type AnswerValue =
  | { kind: "index"; value: number }
  | { kind: "target"; value: string }
  | { kind: "order"; value: string[] }
  | { kind: "map"; value: Record<string, string> }
  | { kind: "rows"; value: number[] };

export function serializeAnswer(a: AnswerValue): string {
  switch (a.kind) {
    case "index":
      return `i:${a.value}`;
    case "target":
      return `t:${a.value}`;
    case "order":
      return `o:${a.value.join("|")}`;
    case "map":
      return `m:${Object.keys(a.value)
        .sort()
        .map((k) => `${k}=${a.value[k]}`)
        .join("|")}`;
    case "rows":
      return `r:${a.value.join("|")}`;
  }
}

/** Canonical key for a question's correct answer. */
export function correctKey(q: Question): string {
  switch (q.type) {
    case "mcq":
    case "spotTheTrap":
    case "sliderPredict":
      return serializeAnswer({ kind: "index", value: q.answer });
    case "tapDiagram":
    case "graphRead":
      return serializeAnswer({ kind: "target", value: q.answer });
    case "connectChain":
      return serializeAnswer({ kind: "order", value: q.steps });
    case "curveShift":
      return serializeAnswer({
        kind: "index",
        value: q.options.indexOf(q.answer),
      });
    case "dragLabel":
      return serializeAnswer({ kind: "map", value: q.answer });
    case "beforeAfter":
      return serializeAnswer({
        kind: "rows",
        value: q.rows.map((r) => r.answer),
      });
  }
}

export function isCorrect(q: Question, given: string): boolean {
  return given === correctKey(q);
}

/**
 * Partial credit, used only to colour per-row feedback on multi-part
 * questions. Scoring itself is all-or-nothing so exam percentages stay
 * comparable to the real NIFE exam.
 */
export function partialScore(q: Question, given: string): number {
  const key = correctKey(q);
  if (given === key) return 1;
  if (q.type === "beforeAfter" && given.startsWith("r:")) {
    const g = given.slice(2).split("|");
    const k = key.slice(2).split("|");
    if (g.length !== k.length) return 0;
    return g.filter((v, i) => v === k[i]).length / k.length;
  }
  if (q.type === "connectChain" && given.startsWith("o:")) {
    const g = given.slice(2).split("|");
    const k = key.slice(2).split("|");
    if (g.length !== k.length) return 0;
    return g.filter((v, i) => v === k[i]).length / k.length;
  }
  if (q.type === "dragLabel" && given.startsWith("m:")) {
    const g = new Set(given.slice(2).split("|"));
    const k = key.slice(2).split("|");
    return k.filter((pair) => g.has(pair)).length / k.length;
  }
  return 0;
}

/* ------------------------------------------------------------------ */
/* Exam scoring                                                        */
/* ------------------------------------------------------------------ */

export interface ExamBreakdownRow {
  key: string;
  label: string;
  correct: number;
  total: number;
  pct: number;
}

export interface ExamScoreSummary {
  score: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
  correctIds: string[];
  incorrectIds: string[];
  byUnit: ExamBreakdownRow[];
  byConcept: ExamBreakdownRow[];
  /** Weakest concept rows, worst first, only where the student was tested. */
  weakAreas: ExamBreakdownRow[];
}

export function scoreExam(
  questions: Question[],
  answers: Record<string, string>,
  labels: { unit: (u: UnitId) => string; concept: (c: ConceptId) => string },
): ExamScoreSummary {
  const correctIds: string[] = [];
  const incorrectIds: string[] = [];
  let unanswered = 0;

  const unitTally = new Map<string, { correct: number; total: number }>();
  const conceptTally = new Map<string, { correct: number; total: number }>();

  for (const q of questions) {
    const given = answers[q.id];
    const ok = given !== undefined && isCorrect(q, given);
    if (given === undefined) unanswered += 1;
    if (ok) correctIds.push(q.id);
    else incorrectIds.push(q.id);

    const u = unitTally.get(q.unit) ?? { correct: 0, total: 0 };
    u.total += 1;
    if (ok) u.correct += 1;
    unitTally.set(q.unit, u);

    for (const c of q.conceptIds) {
      const t = conceptTally.get(c) ?? { correct: 0, total: 0 };
      t.total += 1;
      if (ok) t.correct += 1;
      conceptTally.set(c, t);
    }
  }

  const toRows = (
    map: Map<string, { correct: number; total: number }>,
    label: (k: string) => string,
  ): ExamBreakdownRow[] =>
    [...map.entries()]
      .map(([key, v]) => ({
        key,
        label: label(key),
        correct: v.correct,
        total: v.total,
        pct: v.total === 0 ? 0 : Math.round((v.correct / v.total) * 100),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));

  const byUnit = toRows(unitTally, (k) => labels.unit(k as UnitId));
  const byConcept = toRows(conceptTally, labels.concept);

  return {
    score: questions.length === 0 ? 0 : correctIds.length / questions.length,
    correct: correctIds.length,
    incorrect: incorrectIds.length,
    unanswered,
    total: questions.length,
    correctIds,
    incorrectIds,
    byUnit,
    byConcept,
    weakAreas: [...byConcept]
      .filter((r) => r.pct < 100)
      .sort((a, b) => a.pct - b.pct || b.total - a.total)
      .slice(0, 6),
  };
}

export function buildExamResult(
  params: {
    id: string;
    at: number;
    mode: ExamResult["mode"];
    label: string;
    timed: boolean;
    elapsedMs: number;
    flaggedIds: string[];
    answers: Record<string, string>;
  },
  questions: Question[],
  summary: ExamScoreSummary,
): ExamResult {
  return {
    id: params.id,
    at: params.at,
    mode: params.mode,
    label: params.label,
    questionIds: questions.map((q) => q.id),
    answers: params.answers,
    correctIds: summary.correctIds,
    incorrectIds: summary.incorrectIds,
    flaggedIds: params.flaggedIds,
    elapsedMs: params.elapsedMs,
    timed: params.timed,
    score: summary.score,
  };
}

/* ------------------------------------------------------------------ */
/* Lesson scoring                                                      */
/* ------------------------------------------------------------------ */

export interface LessonScoreSummary {
  answered: number;
  firstTryCorrect: number;
  eventuallyCorrect: number;
  score: number;
  perfect: boolean;
  missedQuestionIds: string[];
}

export function summarizeLesson(
  results: { questionId: string; firstTry: boolean; correct: boolean }[],
): LessonScoreSummary {
  const byQuestion = new Map<string, { firstTry: boolean; correct: boolean }>();
  for (const r of results) {
    const existing = byQuestion.get(r.questionId);
    if (!existing) byQuestion.set(r.questionId, { firstTry: r.firstTry, correct: r.correct });
    else if (r.correct) byQuestion.set(r.questionId, { ...existing, correct: true });
  }
  const rows = [...byQuestion.entries()];
  const firstTryCorrect = rows.filter(([, v]) => v.firstTry && v.correct).length;
  const eventuallyCorrect = rows.filter(([, v]) => v.correct).length;
  return {
    answered: rows.length,
    firstTryCorrect,
    eventuallyCorrect,
    score: rows.length === 0 ? 0 : firstTryCorrect / rows.length,
    perfect: rows.length > 0 && firstTryCorrect === rows.length,
    missedQuestionIds: rows.filter(([, v]) => !v.firstTry || !v.correct).map(([k]) => k),
  };
}

/* ------------------------------------------------------------------ */
/* Selection helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Deterministic shuffle so a given exam id always produces the same order.
 * Uses a small xorshift PRNG seeded from the string.
 */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0 || 1;
  const rand = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Picks an exam set that covers units proportionally and biases toward the
 * student's weak concepts without becoming a pure weak-area drill.
 */
export function selectExamQuestions(
  pool: Question[],
  count: number,
  mastery: Record<ConceptId, MasteryRecord>,
  seed: string,
): Question[] {
  if (pool.length <= count) return seededShuffle(pool, seed);

  const weakness = (q: Question) => {
    if (q.conceptIds.length === 0) return 0.5;
    const total = q.conceptIds.reduce(
      (sum, id) => sum + (1 - (mastery[id]?.level ?? 0) / 5),
      0,
    );
    return total / q.conceptIds.length;
  };

  // Proportional allocation by unit, then weak-biased pick inside each unit.
  const byUnit = new Map<UnitId, Question[]>();
  for (const q of pool) {
    const list = byUnit.get(q.unit) ?? [];
    list.push(q);
    byUnit.set(q.unit, list);
  }

  const units = [...byUnit.keys()].sort();
  const picked: Question[] = [];
  const quotas = units.map((u) => ({
    unit: u,
    quota: Math.max(1, Math.round((byUnit.get(u)!.length / pool.length) * count)),
  }));

  for (const { unit, quota } of quotas) {
    const list = seededShuffle(byUnit.get(unit)!, `${seed}:${unit}`);
    // Stable sort: weakest concepts first, but shuffled within equal weakness.
    const ranked = [...list].sort((a, b) => weakness(b) - weakness(a));
    // Take 60% weak-biased, 40% spread, so strong areas still get sampled.
    const weakTake = Math.ceil(quota * 0.6);
    picked.push(...ranked.slice(0, weakTake));
    const remaining = list.filter((q) => !picked.includes(q));
    picked.push(...remaining.slice(0, quota - weakTake));
  }

  const unique = [...new Set(picked)];
  if (unique.length < count) {
    const rest = seededShuffle(
      pool.filter((q) => !unique.includes(q)),
      `${seed}:fill`,
    );
    unique.push(...rest.slice(0, count - unique.length));
  }

  return seededShuffle(unique.slice(0, count), `${seed}:final`);
}
