/**
 * Persistence.
 *
 * The app is fully usable with zero configuration: everything lives in
 * localStorage. The `ProgressStore` interface is the seam where a Supabase (or
 * any server) adapter drops in later — `load`/`save` are already async, so
 * swapping the implementation does not change a single call site.
 */

import {
  PROGRESS_SCHEMA_VERSION,
  type Attempt,
  type CourseId,
  type CourseProgress,
  type MasteryRecord,
  type ProgressState,
} from "./types";
import { emptyStreak } from "./xp";
import { evidenceFor } from "./evidence";
import { COURSE_ORDER, DEFAULT_COURSE, isCourseId } from "@/content/courses";
import { QUESTION_BY_ID } from "@/content";

export const STORAGE_KEY = "wingbrief:progress";

/** The key v1 wrote to, read once so existing Aerodynamics work survives. */
export const LEGACY_STORAGE_KEY = "nife-aero:progress:v1";

export function emptyCourseProgress(): CourseProgress {
  return {
    xp: 0,
    mastery: {},
    lessons: {},
    attempts: [],
    exams: [],
    savedQuestionIds: [],
    savedKnowColdIds: [],
    watchedExplainerIds: [],
    predictions: [],
  };
}

function emptyCourseMap(): Record<CourseId, CourseProgress> {
  return Object.fromEntries(
    COURSE_ORDER.map((id) => [id, emptyCourseProgress()]),
  ) as Record<CourseId, CourseProgress>;
}

export function emptyProgress(): ProgressState {
  return {
    version: PROGRESS_SCHEMA_VERSION,
    activeCourse: DEFAULT_COURSE,
    streak: emptyStreak(),
    achievements: [],
    onboarded: false,
    courses: emptyCourseMap(),
  };
}

/** Keeps localStorage bounded on a heavy user. */
const MAX_ATTEMPTS = 1500;
const MAX_EXAMS = 40;

export function pruneProgress(state: ProgressState): ProgressState {
  let touched = false;
  const courses = {} as Record<CourseId, CourseProgress>;
  for (const [id, course] of Object.entries(state.courses) as [CourseId, CourseProgress][]) {
    if (course.attempts.length <= MAX_ATTEMPTS && course.exams.length <= MAX_EXAMS) {
      courses[id] = course;
      continue;
    }
    touched = true;
    courses[id] = {
      ...course,
      attempts: course.attempts.slice(-MAX_ATTEMPTS),
      exams: course.exams.slice(-MAX_EXAMS),
    };
  }
  return touched ? { ...state, courses } : state;
}

function migrateCourse(raw: unknown): CourseProgress {
  const base = emptyCourseProgress();
  if (!raw || typeof raw !== "object") return base;
  const input = raw as Partial<CourseProgress>;
  const attempts = Array.isArray(input.attempts) ? input.attempts : [];
  return {
    xp: typeof input.xp === "number" && Number.isFinite(input.xp) ? input.xp : 0,
    mastery: backfillApplied(isRecord(input.mastery) ? input.mastery : {}, attempts),
    lessons: isRecord(input.lessons) ? input.lessons : {},
    attempts,
    exams: Array.isArray(input.exams) ? input.exams : [],
    savedQuestionIds: Array.isArray(input.savedQuestionIds) ? input.savedQuestionIds : [],
    savedKnowColdIds: Array.isArray(input.savedKnowColdIds) ? input.savedKnowColdIds : [],
    watchedExplainerIds: Array.isArray(input.watchedExplainerIds)
      ? input.watchedExplainerIds
      : [],
    predictions: Array.isArray(input.predictions) ? input.predictions : [],
  };
}

/**
 * Reconstructs the application-evidence count for records written before the
 * evidence model existed.
 *
 * Without this, every returning student would be told their mastery had
 * dropped — most unfairly the Navigation students, whose course is almost
 * entirely worked problems and who therefore have the strongest claim to the
 * top of the ladder. The attempt log already says which questions they
 * answered, so the count is recoverable rather than guessed.
 *
 * Records that already carry a count are left alone; only the ones predating
 * the field are rebuilt.
 */
function backfillApplied(
  mastery: Record<string, MasteryRecord>,
  attempts: Attempt[],
): Record<string, MasteryRecord> {
  const missing = Object.values(mastery).some(
    (r) => r && typeof r.applied !== "number",
  );
  if (!missing) return mastery;

  const counts = new Map<string, number>();
  for (const attempt of attempts) {
    if (!attempt?.correct) continue;
    const question = QUESTION_BY_ID[attempt.questionId];
    const kind = attempt.evidence ?? (question ? evidenceFor(question) : "recall");
    if (kind !== "apply") continue;
    for (const conceptId of attempt.conceptIds ?? []) {
      counts.set(conceptId, (counts.get(conceptId) ?? 0) + 1);
    }
  }

  const next: Record<string, MasteryRecord> = {};
  for (const [id, record] of Object.entries(mastery)) {
    if (!record) continue;
    next[id] =
      typeof record.applied === "number"
        ? record
        : { ...record, applied: counts.get(id) ?? 0 };
  }
  return next;
}

/**
 * Defensive migration. Anything missing from a stored blob is filled from the
 * empty state so a schema addition can never white-screen a returning student.
 *
 * Version 1 was single-course and stored mastery, lessons and attempts at the
 * top level. That shape is recognised by the absence of `courses` and folded
 * into the Aerodynamics bucket, because when v1 was written Aerodynamics was
 * the only course that existed — so all of it is Aerodynamics work.
 */
export function migrate(raw: unknown): ProgressState {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const input = raw as Record<string, unknown>;

  const streak = { ...base.streak, ...((input.streak as object) ?? {}) };
  const achievements = Array.isArray(input.achievements) ? input.achievements : [];
  const onboarded = input.onboarded === true;

  if (!input.courses) {
    // v1 document: everything at the top level belongs to Aerodynamics.
    return {
      version: PROGRESS_SCHEMA_VERSION,
      activeCourse: DEFAULT_COURSE,
      streak,
      achievements,
      onboarded,
      courses: { ...base.courses, aero: migrateCourse(input) },
    };
  }

  const stored = input.courses as Record<string, unknown>;
  const courses = { ...base.courses };
  for (const id of COURSE_ORDER) {
    courses[id] = migrateCourse(stored[id]);
  }

  const active = input.activeCourse;
  return {
    version: PROGRESS_SCHEMA_VERSION,
    activeCourse: isCourseId(active) ? active : DEFAULT_COURSE,
    streak,
    achievements,
    onboarded,
    courses,
  };
}

function isRecord<T>(v: unknown): v is Record<string, T> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/* ------------------------------------------------------------------ */
/* Store adapter                                                       */
/* ------------------------------------------------------------------ */

export interface ProgressStore {
  load(): Promise<ProgressState>;
  save(state: ProgressState): Promise<void>;
  clear(): Promise<void>;
}

export class LocalProgressStore implements ProgressStore {
  constructor(private key: string = STORAGE_KEY) {}

  async load(): Promise<ProgressState> {
    if (typeof window === "undefined") return emptyProgress();
    try {
      const raw = window.localStorage.getItem(this.key);
      if (raw) return migrate(JSON.parse(raw));

      // Nothing under the current key. A student who used the app before
      // Engines existed has their work under the v1 key, so look there once
      // rather than greeting them with an empty course.
      if (this.key === STORAGE_KEY) {
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) return migrate(JSON.parse(legacy));
      }
      return emptyProgress();
    } catch {
      // Corrupt blob: start clean rather than trapping the student on a crash.
      return emptyProgress();
    }
  }

  async save(state: ProgressState): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(this.key, JSON.stringify(pruneProgress(state)));
    } catch {
      // Quota exceeded — drop history across every course and retry once.
      try {
        const lean: ProgressState = {
          ...state,
          courses: Object.fromEntries(
            (Object.entries(state.courses) as [CourseId, CourseProgress][]).map(
              ([id, course]) => [
                id,
                { ...course, attempts: course.attempts.slice(-200), exams: course.exams.slice(-5) },
              ],
            ),
          ) as Record<CourseId, CourseProgress>,
        };
        window.localStorage.setItem(this.key, JSON.stringify(lean));
      } catch {
        /* Give up silently; the session still works in memory. */
      }
    }
  }

  async clear(): Promise<void> {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.key);
  }
}

/** In-memory store, used by tests and by SSR. */
export class MemoryProgressStore implements ProgressStore {
  private state: ProgressState = emptyProgress();
  async load() {
    return this.state;
  }
  async save(state: ProgressState) {
    this.state = state;
  }
  async clear() {
    this.state = emptyProgress();
  }
}

/* ------------------------------------------------------------------ */
/* Import / export                                                     */
/* ------------------------------------------------------------------ */

export function exportProgress(state: ProgressState): string {
  return JSON.stringify(state, null, 2);
}

export function importProgress(json: string): ProgressState | null {
  try {
    return migrate(JSON.parse(json));
  } catch {
    return null;
  }
}
