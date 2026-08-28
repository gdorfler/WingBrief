"use client";

/**
 * React binding for the learning engine.
 *
 * All mutations funnel through `recordAnswer` / `completeLesson` etc. so XP,
 * mastery, streaks and achievements can never drift out of sync. State is
 * hydrated asynchronously; `ready` gates anything that would flash zeros.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./auth";
import { applyAttempt, markIntroduced } from "./mastery";
import { isEmptyProgress } from "./merge-progress";
import {
  LocalProgressStore,
  emptyCourseProgress,
  emptyProgress,
  type ProgressStore,
} from "./storage";
import { getSupabase } from "./supabase";
import { SupabaseProgressStore, readGuestProgress } from "./supabase-store";
import {
  XP,
  evaluateAchievements,
  registerCurriculumHooks,
  touchStreak,
  xpForAnswer,
} from "./xp";
import type {
  Attempt,
  ConceptId,
  CourseId,
  CourseProgressView,
  ExamResult,
  PredictionRecord,
  ProgressState,
} from "./types";
import { QUESTION_BY_ID, conceptIdsFor, unitConceptIds, unitLessonIds } from "@/content";
import { evidenceFor } from "./evidence";

export interface AnswerInput {
  questionId: string;
  conceptIds: ConceptId[];
  correct: boolean;
  firstTry: boolean;
  elapsedMs: number;
  context: Attempt["context"];
  /** What they answered, for courses that diagnose the kind of error. */
  answerKey?: string;
}

/** A commitment made at an explainer gate. Correctness is derived, not passed. */
export interface PredictionInput {
  explainerId: string;
  scene: number;
  conceptIds: ConceptId[];
  chosen: number;
  answer: number;
}

export interface ProgressApi {
  /**
   * The active course's progress plus the platform-level fields. Screens read
   * this and never touch the stored multi-course document.
   */
  state: CourseProgressView;
  ready: boolean;
  /** True while a store swap or first account sync is in flight. */
  syncing: boolean;
  /** Achievements unlocked since the last render, for the toast queue. */
  pendingAwards: string[];
  clearAwards: () => void;

  recordAnswer: (input: AnswerInput) => void;
  introduceConcepts: (conceptIds: ConceptId[]) => void;
  completeLesson: (
    lessonId: string,
    score: number,
    perfect: boolean,
    bonusXp?: number,
  ) => void;
  recordExam: (result: ExamResult) => void;
  markExplainerWatched: (id: string) => void;
  recordPrediction: (input: PredictionInput) => void;
  markLabExplored: (id: string) => void;
  toggleSavedQuestion: (id: string) => void;
  toggleSavedKnowCold: (id: string) => void;
  setOnboarded: (v: boolean) => void;
  setActiveCourse: (id: CourseId) => void;
  /** Wipes the active course only. Other courses are untouched. */
  resetProgress: () => void;
  /** The full multi-course document, for export. */
  exportState: () => ProgressState;
  importState: (state: ProgressState) => void;
}

/**
 * Flatten the stored document into the single-course view screens consume.
 * Course fields come from the active bucket; streak, achievements and
 * onboarding are platform-wide.
 */
function toView(stored: ProgressState): CourseProgressView {
  return {
    ...stored.courses[stored.activeCourse],
    streak: stored.streak,
    achievements: stored.achievements,
    onboarded: stored.onboarded,
    activeCourse: stored.activeCourse,
  };
}

/** The inverse: file a mutated view back into the right course bucket. */
function fromView(stored: ProgressState, view: CourseProgressView): ProgressState {
  const { streak, achievements, onboarded, activeCourse, ...course } = view;
  return {
    ...stored,
    activeCourse,
    streak,
    achievements,
    onboarded,
    courses: { ...stored.courses, [activeCourse]: course },
  };
}

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store?: ProgressStore;
}) {
  const { user, ready: authReady } = useAuth();
  /** Tests inject a store directly; that bypasses all account handling. */
  const injected = store !== undefined;

  const storeRef = useRef<ProgressStore>(store ?? new LocalProgressStore());
  const [stored, setStored] = useState<ProgressState>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingAwards, setPendingAwards] = useState<string[]>([]);
  const exploredLabs = useRef<Set<string>>(new Set());

  /**
   * Which account the live store belongs to. `undefined` means nothing has been
   * hydrated yet; `null` is the signed-out guest store.
   */
  const boundUserId = useRef<string | null | undefined>(undefined);
  /** Bumped on every store swap so an in-flight debounced save can be dropped. */
  const generation = useRef(0);

  useEffect(() => {
    if (injected) {
      let cancelled = false;
      void storeRef.current.load().then((loaded) => {
        if (cancelled) return;
        setStored(loaded);
        setReady(true);
      });
      return () => {
        cancelled = true;
      };
    }

    // Wait for the session check, otherwise we would hydrate the guest store
    // and immediately throw it away when the session resolves.
    if (!authReady) return;

    const userId = user?.id ?? null;
    if (boundUserId.current === userId) return;
    boundUserId.current = userId;

    const gen = ++generation.current;
    let cancelled = false;
    const stale = () => cancelled || gen !== generation.current;

    setReady(false);
    setSyncing(true);

    void (async () => {
      const supabase = getSupabase();
      let next: ProgressStore;
      let loaded: ProgressState;

      if (userId && supabase) {
        const remote = new SupabaseProgressStore(supabase, userId);
        // Work done before signing in follows the student into the account.
        const guest = await readGuestProgress();
        loaded = isEmptyProgress(guest)
          ? await remote.load()
          : await remote.adoptGuestProgress(guest);
        next = remote;
      } else {
        const local = new LocalProgressStore();
        loaded = await local.load();
        next = local;
      }

      if (stale()) return;
      storeRef.current = next;
      setStored(loaded);
      setReady(true);
      setSyncing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, user?.id, injected]);

  // Persist on every change once hydrated. Debounced so rapid-fire answering
  // does not hit storage on every keystroke-speed interaction.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready) return;
    const gen = generation.current;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      // A store swap between scheduling and firing would file this state under
      // the wrong account, so anything from a previous generation is discarded.
      if (gen !== generation.current) return;
      void storeRef.current.save(stored);
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [stored, ready]);

  /**
   * Single funnel for state changes. Runs the achievement pass on the result so
   * every mutation can unlock awards without each caller remembering to.
   */
  const view = useMemo(() => toView(stored), [stored]);

  /**
   * Achievement rules ask questions like "how many concepts are in this unit".
   * Those answers are course-dependent, so the hooks are re-pointed whenever
   * the active course changes rather than being registered once at module load.
   */
  useEffect(() => {
    registerCurriculumHooks({
      unitConceptIds,
      unitLessonIds,
      allConceptIds: () => conceptIdsFor(stored.activeCourse),
    });
  }, [stored.activeCourse]);

  /** A view mutation that cannot unlock an achievement, so it skips that pass. */
  const setViewState = useCallback(
    (fn: (prev: CourseProgressView) => CourseProgressView) => {
      setStored((prevStored) => fromView(prevStored, fn(toView(prevStored))));
    },
    [],
  );

  const mutate = useCallback(
    (fn: (prev: CourseProgressView) => CourseProgressView) => {
      setStored((prevStored) => {
        const next = fn(toView(prevStored));
        const now = Date.now();
        const newly = evaluateAchievements(next, now);
        if (newly.length > 0) {
          /*
           * Enqueue by set union, not by append.
           *
           * This runs inside a state updater, and React deliberately invokes
           * updaters twice in development to surface impure ones — so a plain
           * append queued every achievement twice and the toast list rendered
           * two children with the same key. Users saw "First Flight" unlock
           * twice, back to back.
           *
           * An achievement unlocks exactly once, so ignoring an id already in
           * the queue is not merely a guard against the double call: it is
           * what the queue means.
           */
          setPendingAwards((q) => {
            const merged = q.slice();
            for (const a of newly) if (!merged.includes(a.id)) merged.push(a.id);
            return merged.length === q.length ? q : merged;
          });
        }
        return fromView(prevStored, {
          ...next,
          achievements: newly.length > 0 ? [...next.achievements, ...newly] : next.achievements,
        });
      });
    },
    [],
  );

  const recordAnswer = useCallback(
    (input: AnswerInput) => {
      const now = Date.now();
      mutate((prev) => {
        // Classified here rather than at the five call sites, so every path
        // that can answer a question — lesson, review, exam, drill, mission —
        // records what the answer proved without having to remember to.
        const question = QUESTION_BY_ID[input.questionId];
        const attempt: Attempt = {
          questionId: input.questionId,
          conceptIds: input.conceptIds,
          correct: input.correct,
          elapsedMs: input.elapsedMs,
          at: now,
          context: input.context,
          answerKey: input.answerKey,
          evidence: question ? evidenceFor(question) : "recall",
        };
        const { mastery } = applyAttempt(prev.mastery, attempt);
        const gained =
          xpForAnswer(input.correct, input.firstTry) +
          (input.context === "review" && input.correct ? XP.reviewQuestion : 0);

        return {
          ...prev,
          xp: prev.xp + gained,
          mastery,
          attempts: [...prev.attempts, attempt],
          streak: touchStreak(prev.streak, now),
        };
      });
    },
    [mutate],
  );

  const introduceConcepts = useCallback(
    (conceptIds: ConceptId[]) => {
      if (conceptIds.length === 0) return;
      const now = Date.now();
      setViewState((prev) => {
        const mastery = markIntroduced(prev.mastery, conceptIds, now);
        // Reference equality check keeps this from looping when a screen
        // re-renders with the same concept list.
        const changed = conceptIds.some(
          (id) => mastery[id]?.level !== prev.mastery[id]?.level,
        );
        return changed ? { ...prev, mastery } : prev;
      });
    },
    [setViewState],
  );

  const completeLesson = useCallback(
    (lessonId: string, score: number, perfect: boolean, bonusXp = 0) => {
      const now = Date.now();
      mutate((prev) => {
        const existing = prev.lessons[lessonId];
        const wasCompleted = existing?.completed === true;
        return {
          ...prev,
          xp:
            prev.xp +
            (wasCompleted ? Math.round(XP.lessonComplete * 0.25) : XP.lessonComplete) +
            (perfect ? XP.lessonPerfect : 0) +
            bonusXp,
          lessons: {
            ...prev.lessons,
            [lessonId]: {
              lessonId,
              started: true,
              completed: true,
              bestScore: Math.max(existing?.bestScore ?? 0, score),
              attempts: (existing?.attempts ?? 0) + 1,
              lastCompletedAt: now,
              perfect: existing?.perfect === true || perfect,
            },
          },
          streak: touchStreak(prev.streak, now),
        };
      });
    },
    [mutate],
  );

  const recordExam = useCallback(
    (result: ExamResult) => {
      mutate((prev) => ({
        ...prev,
        xp:
          prev.xp + XP.examCompleted + (result.score === 1 ? XP.examPerfect : 0),
        exams: [...prev.exams, result],
        streak: touchStreak(prev.streak, result.at),
      }));
    },
    [mutate],
  );

  /**
   * Record a prediction made at an explainer gate.
   *
   * Deliberately does NOT touch mastery, XP or the streak.
   *
   * A prediction is made BEFORE the explanation, which is the entire reason it
   * is worth having: it reads what the student believed walking in. Scoring it
   * would invert that. A student who worked out that guessing wrong costs them
   * something starts picking the safe option instead of the one they actually
   * believe, and the signal disappears at exactly the moment it is measured.
   * Being wrong at a gate is the system working.
   *
   * It is stored so that later analysis can ask what a student believed and
   * when they stopped believing it — not so it can be graded.
   */
  const recordPrediction = useCallback(
    (input: PredictionInput) => {
      mutate((prev) => {
        const record: PredictionRecord = {
          explainerId: input.explainerId,
          scene: input.scene,
          conceptIds: input.conceptIds,
          chosen: input.chosen,
          answer: input.answer,
          correct: input.chosen === input.answer,
          at: Date.now(),
        };
        return { ...prev, predictions: [...(prev.predictions ?? []), record] };
      });
    },
    [mutate],
  );

  const markExplainerWatched = useCallback(
    (id: string) => {
      mutate((prev) => {
        if (prev.watchedExplainerIds.includes(id)) return prev;
        return {
          ...prev,
          xp: prev.xp + XP.explainerWatched,
          watchedExplainerIds: [...prev.watchedExplainerIds, id],
          streak: touchStreak(prev.streak, Date.now()),
        };
      });
    },
    [mutate],
  );

  // Labs award XP once per session rather than once ever, so returning to a
  // lab to actually explore it still feels rewarded without being farmable.
  const markLabExplored = useCallback(
    (id: string) => {
      if (exploredLabs.current.has(id)) return;
      exploredLabs.current.add(id);
      mutate((prev) => ({
        ...prev,
        xp: prev.xp + XP.labExplored,
        streak: touchStreak(prev.streak, Date.now()),
      }));
    },
    [mutate],
  );

  const toggleSavedQuestion = useCallback((id: string) => {
    setViewState((prev) => ({
      ...prev,
      savedQuestionIds: prev.savedQuestionIds.includes(id)
        ? prev.savedQuestionIds.filter((x) => x !== id)
        : [...prev.savedQuestionIds, id],
    }));
  }, [setViewState]);

  const toggleSavedKnowCold = useCallback((id: string) => {
    setViewState((prev) => ({
      ...prev,
      savedKnowColdIds: prev.savedKnowColdIds.includes(id)
        ? prev.savedKnowColdIds.filter((x) => x !== id)
        : [...prev.savedKnowColdIds, id],
    }));
  }, [setViewState]);

  const setOnboarded = useCallback((v: boolean) => {
    setViewState((prev) => (prev.onboarded === v ? prev : { ...prev, onboarded: v }));
  }, [setViewState]);

  /**
   * Resets the ACTIVE course only. Wiping Engines should not cost a student
   * their Aerodynamics history, so the other buckets and the streak survive.
   */
  const resetProgress = useCallback(() => {
    exploredLabs.current.clear();
    setStored((prev) => {
      const next: ProgressState = {
        ...prev,
        courses: { ...prev.courses, [prev.activeCourse]: emptyCourseProgress() },
      };
      void storeRef.current.save(next);
      return next;
    });
  }, []);

  const setActiveCourse = useCallback((id: CourseId) => {
    setStored((prev) => (prev.activeCourse === id ? prev : { ...prev, activeCourse: id }));
  }, []);

  const exportState = useCallback(() => stored, [stored]);

  const importState = useCallback((next: ProgressState) => {
    setStored(next);
  }, []);

  const clearAwards = useCallback(() => setPendingAwards([]), []);

  const api = useMemo<ProgressApi>(
    () => ({
      state: view,
      ready,
      syncing,
      pendingAwards,
      clearAwards,
      recordAnswer,
      recordPrediction,
      introduceConcepts,
      completeLesson,
      recordExam,
      markExplainerWatched,
      markLabExplored,
      toggleSavedQuestion,
      toggleSavedKnowCold,
      setOnboarded,
      setActiveCourse,
      resetProgress,
      exportState,
      importState,
    }),
    [
      view,
      ready,
      syncing,
      pendingAwards,
      clearAwards,
      recordAnswer,
      recordPrediction,
      introduceConcepts,
      completeLesson,
      recordExam,
      markExplainerWatched,
      markLabExplored,
      toggleSavedQuestion,
      toggleSavedKnowCold,
      setOnboarded,
      setActiveCourse,
      resetProgress,
      exportState,
      importState,
    ],
  );

  return (
    <ProgressContext.Provider value={api}>{children}</ProgressContext.Provider>
  );
}

export function useProgress(): ProgressApi {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used inside <ProgressProvider>");
  }
  return ctx;
}
