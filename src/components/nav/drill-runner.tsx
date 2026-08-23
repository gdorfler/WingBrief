"use client";

/**
 * Drills.
 *
 * Ten reps of one operation, and nothing else on the screen. A drill is not a
 * short lesson: there is no teaching here, no diagram, no explanation before
 * the fact. The whole value is repetition until the setup stops needing
 * thought, so the interface gets out of the way and shows a pace clock.
 *
 * The clock is deliberately not a countdown. Speed matters in this course, but
 * a timer that punishes you produces guessing, and a guessed answer inside the
 * tolerance would be worse than a slow correct one. So the pace readout tracks
 * you against the target and says nothing about it until the end.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, RotateCcw, Timer, XCircle } from "lucide-react";
import type { Drill, Question } from "@/lib/types";
import { QUESTION_BY_ID, UNIT_BY_ID } from "@/content";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { QuestionPlayer, type QuestionResult } from "@/components/questions";
import { Button, ButtonLink, Card, PageHeader, Pill, ProgressBar, cn } from "@/components/ui";

interface Rep {
  questionId: string;
  correct: boolean;
  seconds: number;
}

export function DrillRunner({ drill }: { drill: Drill }) {
  const { recordAnswer } = useProgress();
  const questions = drill.questionIds
    .map((id) => QUESTION_BY_ID[id])
    .filter(Boolean) as Question[];

  const [index, setIndex] = useState(0);
  const [reps, setReps] = useState<Rep[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  const unit = UNIT_BY_ID[drill.unit];
  const done = index >= questions.length;

  /* A running clock, so pace is visible without being a countdown. */
  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => setElapsed(Date.now() - startedAt.current), 500);
    return () => window.clearInterval(t);
  }, [done]);

  const handleAnswer = useCallback(
    (r: QuestionResult) => {
      const q = QUESTION_BY_ID[r.questionId];
      if (!q) return;
      recordAnswer({
        questionId: r.questionId,
        conceptIds: q.conceptIds,
        correct: r.correct,
        firstTry: r.firstTry,
        elapsedMs: r.elapsedMs,
        context: "rapidFire",
        answerKey: r.answerKey,
      });
      setReps((prev) => [
        ...prev,
        { questionId: r.questionId, correct: r.correct, seconds: r.elapsedMs / 1000 },
      ]);
    },
    [recordAnswer],
  );

  const restart = () => {
    setIndex(0);
    setReps([]);
    setElapsed(0);
    startedAt.current = Date.now();
  };

  if (questions.length === 0) {
    return (
      <Card>
        <p className="text-[14px] font-semibold text-nogo">This drill has no reps.</p>
      </Card>
    );
  }

  if (done) return <DrillSummary drill={drill} reps={reps} onRestart={restart} />;

  const current = questions[index];
  const target = drill.targetSeconds * (index + 1);
  const onPace = elapsed / 1000 <= target;

  return (
    <>
      <Link
        href="/drills"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-soft transition-colors hover:text-navy"
      >
        <ArrowLeft size={15} />
        All drills
      </Link>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-brand">
            Drill · Unit {unit?.index} {unit?.title}
          </p>
          <h1 className="mt-0.5 text-[22px] font-semibold leading-tight text-navy">{drill.title}</h1>
          <p className="mt-0.5 text-[13px] text-navy-soft">{drill.operation}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="eyebrow text-navy-faint">Elapsed</p>
            <p
              className={cn(
                "figure text-[19px] font-extrabold leading-none",
                onPace ? "text-go" : "text-caution",
              )}
            >
              {formatClock(elapsed / 1000)}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-navy-soft">
            <Timer size={17} />
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="figure text-[12px] font-bold text-navy-soft">
            Rep {index + 1} of {questions.length}
          </span>
          <span className="flex gap-0.5">
            {reps.map((r, i) => (
              <span
                key={i}
                className={cn("h-1.5 w-4 rounded-full", r.correct ? "bg-go" : "bg-nogo/70")}
              />
            ))}
            {Array.from({ length: questions.length - reps.length }, (_, i) => (
              <span key={`e${i}`} className="h-1.5 w-4 rounded-full bg-surface-3" />
            ))}
          </span>
        </div>
        <ProgressBar value={index / questions.length} tone="brand" height={5} />
      </div>

      <Card>
        <QuestionPlayer
          key={current.id}
          question={current}
          onAnswer={handleAnswer}
          onContinue={() => setIndex((i) => i + 1)}
          continueLabel={index === questions.length - 1 ? "Finish the set" : "Next rep"}
          showConcepts={false}
        />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */

function DrillSummary({
  drill,
  reps,
  onRestart,
}: {
  drill: Drill;
  reps: Rep[];
  onRestart: () => void;
}) {
  const correct = reps.filter((r) => r.correct).length;
  const total = Math.max(1, reps.length);
  const pct = Math.round((correct / total) * 100);
  const totalSeconds = reps.reduce((s, r) => s + r.seconds, 0);
  const average = totalSeconds / total;
  const onPace = reps.filter((r) => r.seconds <= drill.targetSeconds).length;
  const best = reps.length === 0 ? 0 : Math.min(...reps.map((r) => r.seconds));

  return (
    <>
      <PageHeader
        eyebrow="Set complete"
        title={drill.title}
        subtitle={`${correct} of ${reps.length} correct, averaging ${formatSeconds(average)} a rep.`}
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Accuracy" value={`${pct}%`} tone={pct >= 80 ? "go" : pct >= 60 ? "brand" : "caution"} />
        <Stat label="Average" value={formatSeconds(average)} hint={`target ${drill.targetSeconds}s`} />
        <Stat
          label="On pace"
          value={`${onPace}/${reps.length}`}
          tone={onPace >= reps.length / 2 ? "go" : "neutral"}
        />
        <Stat label="Fastest" value={formatSeconds(best)} tone="brand" />
      </div>

      <Card className="mt-4" padded={false}>
        <ul className="divide-y divide-line">
          {reps.map((r, i) => {
            const q = QUESTION_BY_ID[r.questionId];
            return (
              <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="figure w-6 shrink-0 text-[12px] font-bold text-navy-faint">
                  {i + 1}
                </span>
                {r.correct ? (
                  <CheckCircle2 size={16} className="shrink-0 text-go" />
                ) : (
                  <XCircle size={16} className="shrink-0 text-nogo" />
                )}
                <p className="min-w-0 flex-1 truncate text-[12.5px] text-navy">{q?.prompt}</p>
                <span
                  className={cn(
                    "figure shrink-0 text-[12px] font-bold",
                    r.seconds <= drill.targetSeconds ? "text-go" : "text-navy-faint",
                  )}
                >
                  {formatSeconds(r.seconds)}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onRestart} size="lg">
          <RotateCcw size={16} />
          Run it again
        </Button>
        <ButtonLink href="/drills" variant="secondary" size="lg">
          All drills
        </ButtonLink>
      </div>

      {pct < 70 && (
        <Card className="mt-4 border-caution/25 bg-caution-soft/40">
          <p className="text-[12.5px] leading-relaxed text-navy">
            <span className="font-bold">Slow down before you speed up. </span>
            Accuracy under 70% means the method is not settled yet, and drilling faster will only
            make the wrong setup automatic. Work through the explainer for this unit, then come back.
          </p>
        </Card>
      )}
    </>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "brand" | "go" | "caution";
}) {
  return (
    <Card>
      <p className="eyebrow text-navy-faint">{label}</p>
      <p
        className={cn(
          "figure mt-1 text-[24px] font-extrabold leading-none",
          tone === "go" && "text-go",
          tone === "brand" && "text-brand",
          tone === "caution" && "text-caution",
          tone === "neutral" && "text-navy",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-navy-faint">{hint}</p>}
    </Card>
  );
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Index                                                               */
/* ------------------------------------------------------------------ */

export function DrillIndex() {
  const { state } = useProgress();
  const { content } = useCourse();
  const drills = content.drills ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Drills"
        title="Do ten reps"
        subtitle="One operation, repeated until the setup stops needing thought. Not another lesson — there is nothing to read here."
      />

      <ul className="grid gap-3 md:grid-cols-2">
        {drills.map((drill) => {
          const unit = UNIT_BY_ID[drill.unit];
          const attempts = state.attempts.filter((a) => drill.questionIds.includes(a.questionId));
          const correct = attempts.filter((a) => a.correct).length;
          const pct = attempts.length === 0 ? null : Math.round((correct / attempts.length) * 100);
          return (
            <li key={drill.id}>
              <Link
                href={`/drills/${drill.id}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-4 transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow text-navy-faint">
                      Unit {unit?.index} · {unit?.title}
                    </p>
                    <h3 className="mt-0.5 text-[16px] font-semibold text-navy">{drill.title}</h3>
                  </div>
                  <Pill tone={pct === null ? "neutral" : pct >= 80 ? "go" : "brand"} size="sm">
                    {pct === null ? "New" : `${pct}%`}
                  </Pill>
                </div>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-navy-soft">
                  {drill.operation}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
                  <span className="figure text-[11.5px] font-semibold text-navy-faint">
                    {drill.questionIds.length} reps
                  </span>
                  <span className="figure flex items-center gap-1 text-[11.5px] font-semibold text-navy-faint">
                    <Timer size={12} />
                    {drill.targetSeconds}s target
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

