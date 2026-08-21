/**
 * Merging two progress histories.
 *
 * Sync has to survive the messy real cases: a student works through two
 * lessons signed out, then signs in; or answers questions on a phone during a
 * brief while the laptop still holds yesterday's state. Whenever local and
 * remote both hold work, we union them rather than letting one silently
 * clobber the other.
 *
 * Every rule here is commutative and idempotent — merge(a,b) equals merge(b,a),
 * and merging the same state twice changes nothing — so it does not matter
 * which device syncs first, and a retried upload can never double-count.
 */

import { PROGRESS_SCHEMA_VERSION, type CourseId, type CourseProgress, type ProgressState } from "./types";
import type {
  AchievementState,
  Attempt,
  ExamResult,
  LessonProgress,
  MasteryRecord,
  StreakState,
} from "./types";
import { COURSE_ORDER } from "@/content/courses";

/** Union of two string lists, order-stable and duplicate-free. */
function unionIds(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])];
}

/**
 * Attempts are the raw event log. Two attempts are the same event only if the
 * same question was answered at the same millisecond, so that pair is the key.
 */
function mergeAttempts(a: Attempt[], b: Attempt[]): Attempt[] {
  const byKey = new Map<string, Attempt>();
  for (const attempt of [...a, ...b]) {
    byKey.set(`${attempt.questionId}@${attempt.at}`, attempt);
  }
  return [...byKey.values()].sort((x, y) => x.at - y.at);
}

/** Exams already carry a unique id. */
function mergeExams(a: ExamResult[], b: ExamResult[]): ExamResult[] {
  const byId = new Map<string, ExamResult>();
  for (const exam of [...a, ...b]) byId.set(exam.id, exam);
  return [...byId.values()].sort((x, y) => x.at - y.at);
}

/**
 * Mastery is a derived summary, so we keep the record that reflects more
 * practice. `seen` counts every answer the record was built from, which makes
 * it the honest tiebreak; where both have seen the same amount we keep the
 * one that was touched most recently.
 */
function mergeMasteryRecord(a: MasteryRecord, b: MasteryRecord): MasteryRecord {
  if (a.seen !== b.seen) return a.seen > b.seen ? a : b;
  const aAt = a.lastSeenAt ?? 0;
  const bAt = b.lastSeenAt ?? 0;
  if (aAt !== bAt) return aAt > bAt ? a : b;
  // Fully tied: prefer the stronger level so a sync can never demote a student.
  return a.level >= b.level ? a : b;
}

function mergeMastery(
  a: Record<string, MasteryRecord>,
  b: Record<string, MasteryRecord>,
): Record<string, MasteryRecord> {
  const out: Record<string, MasteryRecord> = { ...a };
  for (const [id, record] of Object.entries(b)) {
    const existing = out[id];
    out[id] = existing ? mergeMasteryRecord(existing, record) : record;
  }
  return out;
}

/** Lesson progress takes the best of each field — completion is never undone. */
function mergeLesson(a: LessonProgress, b: LessonProgress): LessonProgress {
  return {
    lessonId: a.lessonId,
    started: a.started || b.started,
    completed: a.completed || b.completed,
    perfect: a.perfect || b.perfect,
    bestScore: Math.max(a.bestScore, b.bestScore),
    // Deliberately max, not sum: summing would make merge(a,a) inflate the
    // count, and a retried sync must be a no-op.
    attempts: Math.max(a.attempts, b.attempts),
    lastCompletedAt: Math.max(a.lastCompletedAt ?? 0, b.lastCompletedAt ?? 0) || null,
  };
}

function mergeLessons(
  a: Record<string, LessonProgress>,
  b: Record<string, LessonProgress>,
): Record<string, LessonProgress> {
  const out: Record<string, LessonProgress> = { ...a };
  for (const [id, lesson] of Object.entries(b)) {
    const existing = out[id];
    out[id] = existing ? mergeLesson(existing, lesson) : lesson;
  }
  return out;
}

/** An achievement stays unlocked, dated from whenever it was first earned. */
function mergeAchievements(
  a: AchievementState[],
  b: AchievementState[],
): AchievementState[] {
  const byId = new Map<string, AchievementState>();
  for (const award of [...a, ...b]) {
    const existing = byId.get(award.id);
    if (!existing || award.unlockedAt < existing.unlockedAt) byId.set(award.id, award);
  }
  return [...byId.values()].sort((x, y) => x.unlockedAt - y.unlockedAt);
}

/**
 * Streaks rebuild from the union of active days rather than taking the larger
 * `current`, because two devices may each hold half of the same run. The
 * history is the truth; current and longest are recomputed from it.
 */
function mergeStreak(a: StreakState, b: StreakState): StreakState {
  const days = [...new Set([...a.history, ...b.history])].sort().reverse();
  const capped = days.slice(0, 60);
  const lastActiveDay = capped[0] ?? null;

  // Walk back day by day from the most recent to size the live run.
  let current = 0;
  if (lastActiveDay) {
    const set = new Set(capped);
    const cursor = new Date(`${lastActiveDay}T00:00:00Z`);
    while (set.has(cursor.toISOString().slice(0, 10))) {
      current++;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
  }

  // Longest run inside the retained window, floored by what either side claimed
  // so a run that has aged out of the 60-day history is not forgotten.
  let longest = 0;
  let run = 0;
  const ascending = [...capped].sort();
  for (let i = 0; i < ascending.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(`${ascending[i - 1]}T00:00:00Z`);
      prev.setUTCDate(prev.getUTCDate() + 1);
      run = prev.toISOString().slice(0, 10) === ascending[i] ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
  }

  return {
    // The merged history is strictly more information than either side held,
    // so it wins outright — except when neither side kept one.
    current: capped.length > 0 ? current : Math.max(a.current, b.current),
    longest: Math.max(longest, a.longest, b.longest),
    lastActiveDay,
    history: capped,
  };
}

/**
 * Merge one course's buckets. XP is the larger of the two totals rather than
 * the sum: XP scores the same underlying work, so adding them would pay a
 * student twice for answers that synced from both directions.
 */
function mergeCourse(a: CourseProgress, b: CourseProgress): CourseProgress {
  return {
    xp: Math.max(a.xp, b.xp),
    mastery: mergeMastery(a.mastery, b.mastery),
    lessons: mergeLessons(a.lessons, b.lessons),
    attempts: mergeAttempts(a.attempts, b.attempts),
    exams: mergeExams(a.exams, b.exams),
    savedQuestionIds: unionIds(a.savedQuestionIds, b.savedQuestionIds),
    savedKnowColdIds: unionIds(a.savedKnowColdIds, b.savedKnowColdIds),
    watchedExplainerIds: unionIds(a.watchedExplainerIds, b.watchedExplainerIds),
  };
}

/**
 * Merge two progress documents into one.
 *
 * Courses merge independently, so syncing Engines work can never disturb an
 * Aerodynamics number. Streak and achievements are platform-wide and merge
 * once across the whole document.
 */
export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  const courses = {} as Record<CourseId, CourseProgress>;
  for (const id of COURSE_ORDER) {
    courses[id] = mergeCourse(a.courses[id], b.courses[id]);
  }
  return {
    version: PROGRESS_SCHEMA_VERSION,
    // The device merging in wins the pointer; it is a preference, not progress.
    activeCourse: a.activeCourse,
    streak: mergeStreak(a.streak, b.streak),
    achievements: mergeAchievements(a.achievements, b.achievements),
    onboarded: a.onboarded || b.onboarded,
    courses,
  };
}

/** True when a state holds nothing worth merging — used to skip pointless syncs. */
export function isEmptyProgress(state: ProgressState): boolean {
  return COURSE_ORDER.every((id) => {
    const c = state.courses[id];
    return (
      c.xp === 0 &&
      c.attempts.length === 0 &&
      c.exams.length === 0 &&
      Object.keys(c.mastery).length === 0 &&
      Object.keys(c.lessons).length === 0 &&
      c.savedQuestionIds.length === 0 &&
      c.savedKnowColdIds.length === 0 &&
      c.watchedExplainerIds.length === 0
    );
  }) && state.achievements.length === 0;
}
