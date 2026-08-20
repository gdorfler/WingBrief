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
import { applyAttempt, markIntroduced } from "./mastery";
import { LocalProgressStore, emptyProgress, type ProgressStore } from "./storage";
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
  ExamResult,
  ProgressState,
} from "./types";
import {
  ALL_CONCEPT_IDS,
  unitConceptIds,
  unitLessonIds,
} from "@/content";

registerCurriculumHooks({
  unitConceptIds,
  unitLessonIds,
  allConceptIds: () => ALL_CONCEPT_IDS,
});

export interface AnswerInput {
  questionId: string;
  conceptIds: ConceptId[];
  correct: boolean;
  firstTry: boolean;
  elapsedMs: number;
  context: Attempt["context"];
}

export interface ProgressApi {
  state: ProgressState;
  ready: boolean;
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
  markLabExplored: (id: string) => void;
  toggleSavedQuestion: (id: string) => void;
  toggleSavedKnowCold: (id: string) => void;
  setOnboarded: (v: boolean) => void;
  resetProgress: () => void;
  importState: (state: ProgressState) => void;
}

const ProgressContext = createContext<ProgressApi | null>(null);

export function ProgressProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store?: ProgressStore;
}) {
  const storeRef = useRef<ProgressStore>(store ?? new LocalProgressStore());
  const [state, setState] = useState<ProgressState>(emptyProgress);
  const [ready, setReady] = useState(false);
  const [pendingAwards, setPendingAwards] = useState<string[]>([]);
  const exploredLabs = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    storeRef.current.load().then((loaded) => {
      if (cancelled) return;
      setState(loaded);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every change once hydrated. Debounced so rapid-fire answering
  // does not hit localStorage on every keystroke-speed interaction.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void storeRef.current.save(state);
    }, 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  /**
   * Single funnel for state changes. Runs the achievement pass on the result so
   * every mutation can unlock awards without each caller remembering to.
   */
  const mutate = useCallback(
    (fn: (prev: ProgressState) => ProgressState) => {
      setState((prev) => {
        const next = fn(prev);
        const now = Date.now();
        const newly = evaluateAchievements(next, now);
        if (newly.length === 0) return next;
        setPendingAwards((q) => [...q, ...newly.map((a) => a.id)]);
        return { ...next, achievements: [...next.achievements, ...newly] };
      });
    },
    [],
  );

  const recordAnswer = useCallback(
    (input: AnswerInput) => {
      const now = Date.now();
      mutate((prev) => {
        const attempt: Attempt = {
          questionId: input.questionId,
          conceptIds: input.conceptIds,
          correct: input.correct,
          elapsedMs: input.elapsedMs,
          at: now,
          context: input.context,
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
      setState((prev) => {
        const mastery = markIntroduced(prev.mastery, conceptIds, now);
        // Reference equality check keeps this from looping when a screen
        // re-renders with the same concept list.
        const changed = conceptIds.some(
          (id) => mastery[id]?.level !== prev.mastery[id]?.level,
        );
        return changed ? { ...prev, mastery } : prev;
      });
    },
    [],
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
    setState((prev) => ({
      ...prev,
      savedQuestionIds: prev.savedQuestionIds.includes(id)
        ? prev.savedQuestionIds.filter((x) => x !== id)
        : [...prev.savedQuestionIds, id],
    }));
  }, []);

  const toggleSavedKnowCold = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      savedKnowColdIds: prev.savedKnowColdIds.includes(id)
        ? prev.savedKnowColdIds.filter((x) => x !== id)
        : [...prev.savedKnowColdIds, id],
    }));
  }, []);

  const setOnboarded = useCallback((v: boolean) => {
    setState((prev) => (prev.onboarded === v ? prev : { ...prev, onboarded: v }));
  }, []);

  const resetProgress = useCallback(() => {
    exploredLabs.current.clear();
    setState(emptyProgress());
    void storeRef.current.clear();
  }, []);

  const importState = useCallback((next: ProgressState) => {
    setState(next);
  }, []);

  const clearAwards = useCallback(() => setPendingAwards([]), []);

  const api = useMemo<ProgressApi>(
    () => ({
      state,
      ready,
      pendingAwards,
      clearAwards,
      recordAnswer,
      introduceConcepts,
      completeLesson,
      recordExam,
      markExplainerWatched,
      markLabExplored,
      toggleSavedQuestion,
      toggleSavedKnowCold,
      setOnboarded,
      resetProgress,
      importState,
    }),
    [
      state,
      ready,
      pendingAwards,
      clearAwards,
      recordAnswer,
      introduceConcepts,
      completeLesson,
      recordExam,
      markExplainerWatched,
      markLabExplored,
      toggleSavedQuestion,
      toggleSavedKnowCold,
      setOnboarded,
      resetProgress,
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
