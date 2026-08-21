"use client";

/**
 * Exam Mode.
 *
 * Deliberately more restrained than Learning Mode: dark instrument chrome, no
 * explanations, no hints, no mastery feedback until the exam is submitted.
 * The question set is derived deterministically from a seed so a refresh or a
 * back-button does not reshuffle the paper.
 */

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock, Flag, Grid3x3, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CourseContent, ExamResult, Question, UnitId } from "@/lib/types";
import { CONCEPT_BY_ID, UNIT_BY_ID } from "@/content";
import { buildExamResult, scoreExam, selectExamQuestions } from "@/lib/scoring";
import { weakConcepts } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { QuestionPlayer } from "./questions";
import { Button, Pill, ProgressBar, cn } from "./ui";

export interface ExamConfig {
  mode: ExamResult["mode"];
  count: number;
  timed: boolean;
  /** Seconds allowed when timed. */
  seconds: number;
  unit?: UnitId;
  seed: string;
  label: string;
}

/** Builds the question pool for a configuration. */
export function poolFor(
  config: ExamConfig,
  weakIds: string[],
  content: CourseContent,
): Question[] {
  if (config.mode === "unit" && config.unit) {
    return content.questions.filter((q) => q.unit === config.unit);
  }
  if (config.mode === "weak") {
    const wanted = new Set(weakIds);
    const targeted = content.questions.filter((q) => q.conceptIds.some((c) => wanted.has(c)));
    return targeted.length >= config.count ? targeted : content.questions;
  }
  return content.questions;
}

/**
 * The paper is frozen at mount so it cannot reshuffle under the student. That
 * makes hydration order load-bearing: on a cold page load the progress store
 * starts on the DEFAULT course and only then resolves the stored one, so a
 * runner mounted before that resolves would freeze the wrong course's
 * questions. Gate on `ready` and let the inner component mount once.
 */
export function ExamRunner({ config }: { config: ExamConfig }) {
  const { ready } = useProgress();
  if (!ready) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[13px] font-semibold text-navy-faint">Building your paper…</p>
      </div>
    );
  }
  return <ExamPaper config={config} />;
}

function ExamPaper({ config }: { config: ExamConfig }) {
  const router = useRouter();
  const { state, recordAnswer, recordExam } = useProgress();
  const { content } = useCourse();

  const weakIds = useMemo(
    () =>
      weakConcepts(content.concepts, content.questions, state.mastery, Date.now(), { limit: 12 }).map(
        (w) => w.concept.id,
      ),
    // Frozen at mount so the paper does not change as the student answers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const questions = useMemo(
    () => selectExamQuestions(poolFor(config, weakIds, content), config.count, state.mastery, config.seed),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.seed],
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showNav, setShowNav] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [remaining, setRemaining] = useState(config.seconds);
  const startedAt = useRef(Date.now());
  const submitted = useRef(false);

  const question = questions[index];
  const answeredCount = Object.keys(answers).length;

  const submit = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;

    const now = Date.now();
    const summary = scoreExam(questions, answers, {
      unit: (u) => UNIT_BY_ID[u]?.title ?? u,
      concept: (c) => CONCEPT_BY_ID[c]?.name ?? c,
    });

    // Feed every graded question into mastery in one pass.
    for (const q of questions) {
      const given = answers[q.id];
      if (given === undefined) continue;
      recordAnswer({
        questionId: q.id,
        conceptIds: q.conceptIds,
        correct: summary.correctIds.includes(q.id),
        firstTry: true,
        elapsedMs: Math.round((now - startedAt.current) / Math.max(1, answeredCount)),
        context: "exam",
      });
    }

    const result = buildExamResult(
      {
        id: config.seed,
        at: now,
        mode: config.mode,
        label: config.label,
        timed: config.timed,
        elapsedMs: now - startedAt.current,
        flaggedIds: [...flagged],
        answers,
      },
      questions,
      summary,
    );
    recordExam(result);
    router.replace(`/exam/results/${encodeURIComponent(result.id)}`);
  }, [
    answeredCount,
    answers,
    config.label,
    config.mode,
    config.seed,
    config.timed,
    flagged,
    questions,
    recordAnswer,
    recordExam,
    router,
  ]);

  // Countdown.
  useEffect(() => {
    if (!config.timed) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          submit();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [config.timed, submit]);

  const setAnswer = useCallback((qid: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  }, []);

  const toggleFlag = useCallback((qid: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }, []);

  if (!question) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const lowTime = config.timed && remaining < 120;

  return (
    <div className="flex min-h-dvh flex-col bg-ink-900">
      {/* Instrument header */}
      <header className="sticky top-0 z-30 border-b border-ink-line bg-ink-800">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            aria-label="End exam"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8fb0d4] transition-colors hover:bg-ink-700 hover:text-white"
          >
            <X size={19} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[12px] font-bold uppercase tracking-wide text-[#8fb0d4]">
                {config.label}
              </p>
              <span className="tabular shrink-0 text-[12px] font-bold text-white">
                {index + 1} / {questions.length}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-600">
              <div
                className="h-full rounded-full bg-brand-light transition-[width] duration-300"
                style={{ width: `${((index + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {config.timed && (
            <span
              className={cn(
                "tabular flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-bold",
                lowTime ? "bg-nogo text-white" : "bg-ink-700 text-white",
              )}
            >
              <Clock size={14} />
              {mins}:{String(secs).padStart(2, "0")}
            </span>
          )}

          <button
            type="button"
            onClick={() => setShowNav((s) => !s)}
            aria-label="Question navigator"
            aria-expanded={showNav}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
              showNav ? "bg-brand text-white" : "text-[#8fb0d4] hover:bg-ink-700 hover:text-white",
            )}
          >
            <Grid3x3 size={17} />
          </button>
        </div>

        {showNav && (
          <div className="border-t border-ink-line bg-ink-900 px-4 py-3">
            <div className="mx-auto max-w-3xl">
              <div className="mb-2 flex flex-wrap gap-3 text-[11px] font-semibold text-[#8fb0d4]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-brand" /> answered
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-caution" /> flagged
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded bg-ink-600" /> unanswered
                </span>
              </div>
              <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
                {questions.map((q, i) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isFlagged = flagged.has(q.id);
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setIndex(i);
                        setShowNav(false);
                      }}
                      className={cn(
                        "tabular flex h-9 items-center justify-center rounded-lg text-[12px] font-bold transition-colors",
                        i === index && "ring-2 ring-white",
                        isFlagged
                          ? "bg-caution text-white"
                          : isAnswered
                            ? "bg-brand text-white"
                            : "bg-ink-600 text-[#8fb0d4]",
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <p className="tabular mt-3 text-[11.5px] font-semibold text-[#8fb0d4]">
                {answeredCount} answered · {questions.length - answeredCount} remaining ·{" "}
                {flagged.size} flagged
              </p>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl bg-surface p-4 sm:p-5"
        >
          <QuestionPlayer
            question={question}
            mode="exam"
            initialAnswer={answers[question.id]}
            onAnswer={(r) => setAnswer(question.id, r.answerKey)}
            onContinue={() => undefined}
            flagged={flagged.has(question.id)}
            onToggleFlag={() => toggleFlag(question.id)}
            showConcepts={false}
          />
        </motion.div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-ink-line bg-ink-800 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Button
            variant="ink"
            size="lg"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="Previous question"
          >
            <ChevronLeft size={18} />
          </Button>
          {index === questions.length - 1 ? (
            <Button variant="success" size="lg" fullWidth onClick={() => setConfirmSubmit(true)}>
              Submit exam
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
            >
              Next
              <ChevronRight size={17} />
            </Button>
          )}
          <Button
            variant="ink"
            size="lg"
            onClick={() => toggleFlag(question.id)}
            aria-label="Flag question"
            className={cn(flagged.has(question.id) && "!bg-caution !border-caution")}
          >
            <Flag size={17} fill={flagged.has(question.id) ? "currentColor" : "none"} />
          </Button>
        </div>
      </footer>

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 p-4 backdrop-blur-sm sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm rounded-2xl bg-surface p-5"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-caution-soft text-caution">
                <AlertTriangle size={18} />
              </span>
              <h2 className="text-lg text-navy">Submit exam?</h2>
            </div>
            <p className="text-[13.5px] leading-relaxed text-navy-soft">
              You have answered <strong className="text-navy">{answeredCount}</strong> of{" "}
              {questions.length} questions.
              {questions.length - answeredCount > 0 && (
                <>
                  {" "}
                  Unanswered questions are marked incorrect.
                </>
              )}
            </p>
            {flagged.size > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <Pill tone="caution" size="sm">
                  {flagged.size} still flagged
                </Pill>
              </div>
            )}
            <ProgressBar value={answeredCount / questions.length} tone="brand" className="mt-4" />
            <div className="mt-5 flex gap-2">
              <Button variant="secondary" size="lg" fullWidth onClick={() => setConfirmSubmit(false)}>
                Keep going
              </Button>
              <Button variant="success" size="lg" fullWidth onClick={submit}>
                Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
