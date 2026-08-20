"use client";

/**
 * A review drill.
 *
 * Shared by weak areas, spaced review, missed questions and saved questions.
 * Same immersive frame as the lesson player, but purely retrieval — no
 * teaching screens, and every answer feeds mastery immediately.
 */

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import { CONCEPT_BY_ID } from "@/content";
import { useProgress } from "@/lib/progress-store";
import { QuestionPlayer, type QuestionResult } from "./questions";
import {
  ButtonLink,
  Card,
  EmptyState,
  Pill,
  ProgressBar,
  ProgressRing,
  cn,
} from "./ui";

export function ReviewSession({
  title,
  subtitle,
  questions,
  emptyTitle,
  emptyBody,
}: {
  title: string;
  subtitle: string;
  questions: Question[];
  emptyTitle: string;
  emptyBody: string;
}) {
  const { state, recordAnswer, toggleSavedQuestion } = useProgress();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<
    { questionId: string; correct: boolean; firstTry: boolean }[]
  >([]);
  const [done, setDone] = useState(false);

  // Freeze the set on mount so answering does not reshuffle the queue.
  const set = useMemo(() => questions, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (r: QuestionResult) => {
      const q = set.find((x) => x.id === r.questionId);
      if (!q) return;
      recordAnswer({
        questionId: r.questionId,
        conceptIds: q.conceptIds,
        correct: r.correct,
        firstTry: r.firstTry,
        elapsedMs: r.elapsedMs,
        context: "review",
      });
      setResults((prev) => [
        ...prev,
        { questionId: r.questionId, correct: r.correct, firstTry: r.firstTry },
      ]);
    },
    [recordAnswer, set],
  );

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= set.length) {
        setDone(true);
        return i;
      }
      return i + 1;
    });
  }, [set.length]);

  if (set.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title={emptyTitle}
          body={emptyBody}
          action={<ButtonLink href="/review">Back to review</ButtonLink>}
        />
      </div>
    );
  }

  if (done) {
    const firstTry = results.filter((r) => r.firstTry && r.correct).length;
    const score = results.length === 0 ? 0 : firstTry / new Set(results.map((r) => r.questionId)).size;
    const missed = [...new Set(results.filter((r) => !r.correct).map((r) => r.questionId))];

    return (
      <div className="min-h-dvh bg-canvas">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-3xl bg-ink-800 p-6 text-center sm:p-8">
              <p className="eyebrow text-[#8fb0d4]">Review complete</p>
              <h1 className="mt-1 text-2xl text-white">{title}</h1>
              <div className="mt-6 flex justify-center">
                <ProgressRing
                  value={score}
                  size={110}
                  stroke={10}
                  tone={score >= 0.8 ? "go" : score >= 0.5 ? "brand" : "caution"}
                  trackClassName="stroke-ink-600"
                >
                  <span className="tabular text-[28px] font-extrabold leading-none text-white">
                    {Math.round(score * 100)}
                    <span className="text-base">%</span>
                  </span>
                </ProgressRing>
              </div>
              <p className="mt-4 text-[13px] text-[#a8c2dd]">
                {firstTry} of {set.length} correct on the first try
              </p>
            </div>

            {missed.length > 0 && (
              <Card className="mt-5">
                <p className="eyebrow mb-2 text-navy-faint">Concepts to revisit</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    ...new Set(
                      missed.flatMap((id) => set.find((q) => q.id === id)?.conceptIds ?? []),
                    ),
                  ].map((cid) => (
                    <Link key={cid} href={`/review/concept/${cid}`}>
                      <Pill tone="caution">{CONCEPT_BY_ID[cid]?.name ?? cid}</Pill>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <ButtonLink href="/review" variant="secondary" size="lg" fullWidth>
                <RotateCcw size={16} />
                Back to review
              </ButtonLink>
              <ButtonLink href="/" variant="primary" size="lg" fullWidth>
                Home
                <ArrowRight size={16} />
              </ButtonLink>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = set[index];
  const answeredIds = new Set(results.map((r) => r.questionId));

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/review"
            aria-label="Leave review"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-navy-faint transition-colors hover:bg-surface-2 hover:text-navy"
          >
            <X size={19} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[12.5px] font-semibold text-navy">{title}</p>
              <span className="tabular shrink-0 text-[11.5px] font-bold text-navy-faint">
                {index + 1} / {set.length}
              </span>
            </div>
            <ProgressBar value={index / set.length} tone="brand" height={6} className="mt-1.5" />
          </div>
          <span className="hidden shrink-0 items-center gap-1 sm:flex">
            {set.map((q, i) => (
              <span
                key={q.id}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  answeredIds.has(q.id)
                    ? results.find((r) => r.questionId === q.id)?.correct
                      ? "bg-go"
                      : "bg-nogo"
                    : i === index
                      ? "bg-brand"
                      : "bg-surface-3",
                )}
              />
            ))}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="mb-4 text-[12.5px] font-medium text-navy-soft">{subtitle}</p>
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <QuestionPlayer
            question={question}
            onAnswer={handleAnswer}
            onContinue={advance}
            saved={state.savedQuestionIds.includes(question.id)}
            onToggleSave={() => toggleSavedQuestion(question.id)}
            continueLabel={index === set.length - 1 ? "Finish review" : "Next"}
          />
        </motion.div>
      </main>
    </div>
  );
}

