"use client";

/**
 * The lesson player.
 *
 * One screen at a time, a progress bar across the top, and an X that gets you
 * out. Learning screens are read-and-advance; question screens block until
 * answered. Mastery, XP and the streak are all committed as you go, so a
 * student who abandons halfway still keeps what they learned.
 */

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Check, FlaskConical, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Lesson, LessonScreen } from "@/lib/types";
import { CONCEPT_BY_ID, EXPLAINER_BY_ID, LAB_BY_ID, QUESTION_BY_ID } from "@/content";
import { summarizeLesson } from "@/lib/scoring";
import { MASTERY_LABELS } from "@/lib/mastery";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { DiagramHost } from "./diagrams/registry";
import { NavToolPanel, WorkedExample } from "./nav/lesson-screens";
import { Widget } from "./lab/widgets";
import { QuestionPlayer, type QuestionResult } from "./questions";
import {
  Button,
  ButtonLink,
  Card,
  Formula,
  Pill,
  ProgressBar,
  ProgressRing,
  TrendChip,
  cn,
} from "./ui";

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { state, recordAnswer, introduceConcepts, completeLesson, toggleSavedQuestion } =
    useProgress();

  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<
    { questionId: string; firstTry: boolean; correct: boolean }[]
  >([]);
  const [finished, setFinished] = useState(false);
  const committed = useRef(false);
  const masteryBefore = useRef<Record<string, number>>({});

  // Snapshot mastery on entry so the summary can show what moved.
  useEffect(() => {
    masteryBefore.current = Object.fromEntries(
      lesson.conceptIds.map((id) => [id, state.mastery[id]?.level ?? 0]),
    );
    introduceConcepts(lesson.conceptIds);
    // Runs once per lesson.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const screens = lesson.screens;
  const screen = screens[index];
  const progress = finished ? 1 : index / screens.length;

  const advance = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= screens.length) {
        setFinished(true);
        return i;
      }
      return i + 1;
    });
  }, [screens.length]);

  const handleAnswer = useCallback(
    (r: QuestionResult) => {
      const question = QUESTION_BY_ID[r.questionId];
      if (!question) return;
      recordAnswer({
        questionId: r.questionId,
        conceptIds: question.conceptIds,
        correct: r.correct,
        firstTry: r.firstTry,
        elapsedMs: r.elapsedMs,
        context: "lesson",
        answerKey: r.answerKey,
      });
      setResults((prev) => [
        ...prev,
        { questionId: r.questionId, firstTry: r.firstTry, correct: r.correct },
      ]);
    },
    [recordAnswer],
  );

  const summary = useMemo(() => summarizeLesson(results), [results]);

  // Commit the lesson exactly once when the student reaches the end screen.
  useEffect(() => {
    if (!finished || committed.current) return;
    committed.current = true;
    completeLesson(lesson.id, summary.score, summary.perfect);
  }, [finished, lesson.id, summary.score, summary.perfect, completeLesson]);

  // Keyboard: Escape leaves, Enter advances a learning screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/lessons");
      if (e.key === "Enter" && screen && screen.kind !== "question" && !finished) {
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, finished, router, screen]);

  if (finished) {
    return (
      <LessonComplete
        lesson={lesson}
        summary={summary}
        masteryBefore={masteryBefore.current}
      />
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/lessons"
            aria-label="Leave lesson"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-navy-faint transition-colors hover:bg-surface-2 hover:text-navy"
          >
            <X size={19} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[12.5px] font-semibold text-navy">{lesson.title}</p>
              <span className="tabular shrink-0 text-[11.5px] font-bold text-navy-faint">
                {index + 1} / {screens.length}
              </span>
            </div>
            <ProgressBar value={progress} tone="brand" height={6} className="mt-1.5" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28">
        {/*
          Keyed remount replays the entry animation on every screen change.
          Deliberately enter-only: an exit animation that fails to settle would
          strand the student on a screen they have already finished.
        */}
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <ScreenView
            screen={screen}
            onAdvance={advance}
            onAnswer={handleAnswer}
            savedIds={state.savedQuestionIds}
            onToggleSave={toggleSavedQuestion}
            isLast={index === screens.length - 1}
          />
        </motion.div>
      </main>

      {screen.kind !== "question" && (
        <footer className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl">
            <Button onClick={advance} size="lg" fullWidth>
              Continue
              <ArrowRight size={17} />
            </Button>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

function ScreenView({
  screen,
  onAdvance,
  onAnswer,
  savedIds,
  onToggleSave,
  isLast,
}: {
  screen: LessonScreen;
  onAdvance: () => void;
  onAnswer: (r: QuestionResult) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  isLast: boolean;
}) {
  switch (screen.kind) {
    case "hook":
      return (
        <div className="pt-6 text-center sm:pt-12">
          <p className="eyebrow mb-3 text-brand">Why this matters</p>
          <h2 className="text-2xl leading-tight text-navy sm:text-3xl">{screen.headline}</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-navy-soft">
            {screen.line}
          </p>
          {screen.diagram && (
            <div className="mt-7 rounded-2xl border border-line bg-surface p-3">
              <DiagramHost id={screen.diagram.id} props={screen.diagram.props} />
            </div>
          )}
        </div>
      );

    case "model":
      return (
        <div>
          <h2 className="text-xl leading-snug text-navy sm:text-2xl">{screen.headline}</h2>
          {screen.line && (
            <p className="mt-2 text-[14.5px] leading-relaxed text-navy-soft">{screen.line}</p>
          )}
          <div className="mt-4 rounded-2xl border border-line bg-surface p-3">
            <DiagramHost
              id={screen.diagram.id}
              props={screen.diagram.props}
              caption={screen.diagram.caption}
            />
          </div>
          {screen.bullets && (
            <ul className="mt-4 space-y-2">
              {screen.bullets.map((b) => (
                <li key={b} className="flex gap-2.5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span className="text-[14px] leading-relaxed text-navy">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case "manipulate":
      return (
        <div>
          <p className="eyebrow mb-2 text-brand">Try it</p>
          <h2 className="text-xl leading-snug text-navy sm:text-2xl">{screen.headline}</h2>
          {screen.line && (
            <p className="mt-2 text-[14.5px] leading-relaxed text-navy-soft">{screen.line}</p>
          )}
          <div className="mt-4">
            <Widget name={screen.widget} />
          </div>
        </div>
      );

    case "chain":
      return (
        <div>
          <p className="eyebrow mb-2 text-brand">The chain</p>
          <h2 className="text-xl leading-snug text-navy sm:text-2xl">{screen.headline}</h2>
          {screen.line && (
            <p className="mt-2 text-[14.5px] leading-relaxed text-navy-soft">{screen.line}</p>
          )}
          <ol className="mt-5 space-y-1">
            {screen.nodes.map((node, i) => (
              <li key={`${node.label}-${i}`}>
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3",
                    node.emphasis
                      ? "border-brand/35 bg-brand-soft"
                      : "border-line bg-surface",
                  )}
                >
                  <span
                    className={cn(
                      "tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold",
                      node.emphasis ? "bg-brand text-white" : "bg-surface-3 text-navy-soft",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "flex-1 text-[14.5px] leading-snug",
                      node.emphasis ? "font-bold text-navy" : "font-medium text-navy",
                    )}
                  >
                    {node.label}
                  </span>
                  {node.trend && <TrendChip trend={node.trend} />}
                </div>
                {i < screen.nodes.length - 1 && (
                  <div className="flex justify-center py-1">
                    <span className="text-lg font-bold leading-none text-navy-faint">↓</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {screen.footnote && (
            <p className="mt-4 rounded-xl bg-caution-soft px-4 py-3 text-[13px] font-medium leading-relaxed text-caution">
              {screen.footnote}
            </p>
          )}
        </div>
      );

    case "compare":
      return (
        <div>
          <p className="eyebrow mb-2 text-brand">Side by side</p>
          <h2 className="text-xl leading-snug text-navy sm:text-2xl">{screen.headline}</h2>
          {screen.line && (
            <p className="mt-2 text-[14.5px] leading-relaxed text-navy-soft">{screen.line}</p>
          )}
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="bg-ink-800 text-white">
                  <th className="w-[26%] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide" />
                  <th className="px-3 py-2.5 text-[12px] font-bold">{screen.columns[0]}</th>
                  <th className="px-3 py-2.5 text-[12px] font-bold">{screen.columns[1]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {screen.rows.map((row) => (
                  <tr key={row.label}>
                    <th className="px-3 py-2.5 align-top text-[12px] font-bold text-navy-soft">
                      {row.label}
                    </th>
                    <td className="px-3 py-2.5 align-top text-[13px] leading-snug text-navy">
                      {row.a}
                    </td>
                    <td className="px-3 py-2.5 align-top text-[13px] leading-snug text-navy">
                      {row.b}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "anchor":
      return (
        <div className="pt-2">
          <div className="rounded-2xl bg-ink-800 p-5 sm:p-6">
            <p className="eyebrow mb-3 text-gold">{screen.headline}</p>
            <ul className="space-y-2.5">
              {screen.statements.map((s) => (
                <li key={s} className="flex gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-gold" strokeWidth={3} />
                  <span className="text-[14.5px] font-medium leading-relaxed text-white">{s}</span>
                </li>
              ))}
            </ul>
            {screen.formula && (
              <div className="mt-5 rounded-xl bg-ink-700 px-4 py-3.5 text-white">
                <Formula tex={screen.formula} display />
              </div>
            )}
            {screen.mnemonic && (
              <p className="mt-4 text-center text-[15px] font-extrabold tracking-wide text-gold">
                {screen.mnemonic}
              </p>
            )}
          </div>
        </div>
      );

    case "rule":
      return (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-brand/25 bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-brand/20 bg-brand-soft px-4 py-2.5">
              <p className="eyebrow text-brand">The rule</p>
              {screen.authority && (
                <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-wide text-brand">
                  {screen.authority}
                </span>
              )}
            </div>
            <p className="px-4 py-4 text-[15.5px] font-semibold leading-relaxed text-navy">
              {screen.rule}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <p className="eyebrow mb-2.5 text-navy-faint">Applies when</p>
            <ul className="space-y-2">
              {screen.appliesWhen.map((a) => (
                <li key={a} className="flex gap-2.5">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span className="text-[13.5px] leading-relaxed text-navy">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {screen.watchFor && (
            <div className="rounded-2xl border border-caution/30 bg-caution-soft/50 px-4 py-3.5">
              <p className="eyebrow mb-1.5 text-caution">Watch for</p>
              <p className="text-[13.5px] leading-relaxed text-navy">{screen.watchFor}</p>
            </div>
          )}
        </div>
      );

    /*
     * Navigation's signature screen. A method is not a fact, and flattening it
     * into a paragraph loses the part that makes it usable: what you are
     * handed, what you have to produce, and the order in between. The estimate
     * sits above step one because that is where the guide puts it.
     */
    case "method":
      return (
        <div className="space-y-3">
          <h2 className="text-xl leading-snug text-navy sm:text-2xl">{screen.headline}</h2>

          {screen.estimateFirst && (
            <div className="rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3">
              <p className="eyebrow mb-1 text-brand-dark">Estimate first</p>
              <p className="text-[13.5px] leading-relaxed text-navy">{screen.estimateFirst}</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="given-block rounded-2xl px-4 py-3.5">
              <p className="eyebrow mb-2 text-brand-dark">Given</p>
              <ul className="space-y-1.5">
                {screen.given.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="text-[13.5px] leading-relaxed text-navy">{g}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
              <p className="eyebrow mb-2 text-navy-faint">Find</p>
              <ul className="space-y-1.5">
                {screen.find.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-go" />
                    <span className="text-[13.5px] font-semibold leading-relaxed text-navy">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface px-4 py-4">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <p className="eyebrow text-navy-faint">The method</p>
              {screen.tolerance && (
                <span className="figure shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10.5px] font-bold text-navy-soft">
                  {screen.tolerance}
                </span>
              )}
            </div>
            <ol className="space-y-2">
              {screen.steps.map((step, i) => (
                <li key={step} className="flex gap-2.5">
                  <span className="figure mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-navy">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {screen.watchFor && (
            <div className="rounded-2xl border border-caution/30 bg-caution-soft/50 px-4 py-3.5">
              <p className="eyebrow mb-1.5 text-caution">Watch for</p>
              <p className="text-[13.5px] leading-relaxed text-navy">{screen.watchFor}</p>
            </div>
          )}
        </div>
      );

    /*
     * A worked example. The question is rendered already graded, so its
     * solution replay is available without the student having to answer it
     * first — the point of this screen is to watch, not to be tested.
     */
    case "worked": {
      const problem = QUESTION_BY_ID[screen.problemId];
      if (!problem) {
        return (
          <Card>
            <p className="text-sm font-semibold text-nogo">Missing problem: {screen.problemId}</p>
          </Card>
        );
      }
      return (
        <div className="space-y-3">
          <div>
            <p className="eyebrow mb-1 text-brand">Worked example</p>
            <h2 className="text-xl leading-snug text-navy sm:text-2xl">{screen.headline}</h2>
            {screen.line && (
              <p className="mt-2 text-[14.5px] leading-relaxed text-navy-soft">{screen.line}</p>
            )}
          </div>
          <WorkedExample question={problem} />
        </div>
      );
    }

    /* A live instrument, embedded in the lesson. */
    case "tool":
      return (
        <div className="space-y-3">
          <div>
            <h2 className="text-xl leading-snug text-navy sm:text-2xl">{screen.headline}</h2>
            {screen.line && (
              <p className="mt-2 text-[14.5px] leading-relaxed text-navy-soft">{screen.line}</p>
            )}
          </div>
          <Card>
            <NavToolPanel tool={screen.tool} props={screen.props} />
          </Card>
        </div>
      );

    case "question": {
      const question = QUESTION_BY_ID[screen.questionId];
      if (!question) {
        return (
          <Card>
            <p className="text-sm font-semibold text-nogo">
              Missing question: {screen.questionId}
            </p>
          </Card>
        );
      }
      return (
        <QuestionPlayer
          question={question}
          onAnswer={onAnswer}
          onContinue={onAdvance}
          saved={savedIds.includes(question.id)}
          onToggleSave={() => onToggleSave(question.id)}
          continueLabel={isLast ? "Finish lesson" : "Continue"}
        />
      );
    }
  }
}

/* ------------------------------------------------------------------ */
/* End screen                                                          */
/* ------------------------------------------------------------------ */

function LessonComplete({
  lesson,
  summary,
  masteryBefore,
}: {
  lesson: Lesson;
  summary: ReturnType<typeof summarizeLesson>;
  masteryBefore: Record<string, number>;
}) {
  const { state } = useProgress();
  const { content, meta } = useCourse();
  const next = content.lessons.find((l) => l.index === lesson.index + 1);
  const xpEarned =
    summary.firstTryCorrect * 10 +
    (summary.answered - summary.firstTryCorrect) * 4 +
    40 +
    (summary.perfect ? 25 : 0);

  const moved = lesson.conceptIds
    .map((id) => ({
      id,
      name: CONCEPT_BY_ID[id]?.name ?? id,
      before: masteryBefore[id] ?? 0,
      after: state.mastery[id]?.level ?? 0,
    }))
    .sort((a, b) => b.after - b.before - (a.after - a.before));

  const weak = moved
    .filter((m) => (state.mastery[m.id]?.seen ?? 0) > 0 && m.after < 3)
    .slice(0, 4);
  const explainers = (lesson.explainerIds ?? []).map((id) => EXPLAINER_BY_ID[id]).filter(Boolean);
  const labs = (lesson.labIds ?? []).map((id) => LAB_BY_ID[id]).filter(Boolean);

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-3xl px-4 py-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl bg-ink-800 p-6 text-center sm:p-8">
            <p className="eyebrow text-[#8fb0d4]">Lesson complete</p>
            <h1 className="mt-1.5 text-2xl text-white sm:text-3xl">{lesson.title}</h1>

            <div className="mt-6 flex justify-center">
              <ProgressRing
                value={summary.score}
                size={120}
                stroke={11}
                tone={summary.score >= 0.8 ? "go" : summary.score >= 0.5 ? "brand" : "caution"}
                trackClassName="stroke-ink-600"
              >
                <span className="tabular text-[30px] font-extrabold leading-none text-white">
                  {Math.round(summary.score * 100)}
                  <span className="text-lg">%</span>
                </span>
                <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8fb0d4]">
                  first try
                </span>
              </ProgressRing>
            </div>

            {summary.perfect && (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-[12.5px] font-bold text-gold">
                <Check size={13} strokeWidth={3} /> Perfect lesson — every question first try
              </p>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-ink-700/70 px-3 py-3">
                <p className="eyebrow text-[#8fb0d4]">Correct</p>
                <p className="tabular mt-1 text-xl font-bold text-go">
                  {summary.firstTryCorrect}/{summary.answered}
                </p>
              </div>
              <div className="rounded-xl bg-ink-700/70 px-3 py-3">
                <p className="eyebrow text-[#8fb0d4]">XP earned</p>
                <p className="tabular mt-1 text-xl font-bold text-brand-light">+{xpEarned}</p>
              </div>
              <div className="rounded-xl bg-ink-700/70 px-3 py-3">
                <p className="eyebrow text-[#8fb0d4]">Concepts</p>
                <p className="tabular mt-1 text-xl font-bold text-white">{lesson.conceptIds.length}</p>
              </div>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="mb-3 text-base text-navy">Concept mastery</h2>
            <Card padded={false}>
              <ul className="divide-y divide-line">
                {moved.map((m) => {
                  const delta = m.after - m.before;
                  return (
                    <li key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-navy">
                        {m.name}
                      </span>
                      {delta > 0 && (
                        <Pill tone="go" size="sm">
                          +{delta}
                        </Pill>
                      )}
                      <span
                        className={cn(
                          "shrink-0 text-[12px] font-bold",
                          m.after >= 4 ? "text-go" : m.after >= 3 ? "text-brand" : "text-caution",
                        )}
                      >
                        {MASTERY_LABELS[m.after as 0 | 1 | 2 | 3 | 4 | 5]}
                      </span>
                      <span className="flex shrink-0 gap-0.5">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <span
                            key={lvl}
                            className={cn(
                              "h-4 w-1.5 rounded-full",
                              lvl <= m.after
                                ? m.after >= 4
                                  ? "bg-go"
                                  : m.after >= 3
                                    ? "bg-brand"
                                    : "bg-caution"
                                : "bg-surface-3",
                            )}
                          />
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>

          {weak.length > 0 && (
            <section className="mt-5">
              <h2 className="mb-3 text-base text-navy">Come back to these</h2>
              <Card className="space-y-2.5">
                <ul className="space-y-1.5">
                  {weak.map((w) => (
                    <li key={w.id} className="flex items-center gap-2 text-[13.5px] text-navy">
                      <span className="h-1.5 w-1.5 rounded-full bg-caution" />
                      {w.name}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/review/weak" variant="secondary" size="sm">
                  Drill these now
                </ButtonLink>
              </Card>
            </section>
          )}

          {(explainers.length > 0 || labs.length > 0) && (
            <section className="mt-5">
              <h2 className="mb-3 text-base text-navy">Go deeper</h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {explainers.map((e) => (
                  <Link
                    key={e.id}
                    href={`/explainers/${e.id}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-brand/40"
                  >
                    <Sparkles size={17} className="shrink-0 text-brand" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold text-navy">
                        {e.title}
                      </span>
                      <span className="block truncate text-[11.5px] text-navy-faint">
                        Visual explainer
                      </span>
                    </span>
                  </Link>
                ))}
                {labs.map((l) => (
                  <Link
                    key={l.id}
                    href={`/lab/${l.id}`}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-brand/40"
                  >
                    <FlaskConical size={17} className="shrink-0 text-[var(--color-series-alt)]" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold text-navy">
                        {l.title}
                      </span>
                      <span className="block truncate text-[11.5px] text-navy-faint">{meta.labLabel}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="mt-5">
            <h2 className="mb-3 text-base text-navy">Know cold</h2>
            <Card className="space-y-2">
              {lesson.memorize.map((m) => (
                <p key={m} className="flex gap-2.5 text-[13.5px] leading-relaxed text-navy">
                  <BookOpen size={15} className="mt-0.5 shrink-0 text-navy-faint" />
                  {m}
                </p>
              ))}
            </Card>
          </section>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <ButtonLink href="/lessons" variant="secondary" size="lg" fullWidth>
              Back to flight path
            </ButtonLink>
            <ButtonLink
              href={next ? `/lessons/${next.id}` : "/exam"}
              variant="primary"
              size="lg"
              fullWidth
            >
              {next ? "Next lesson" : "Take a practice exam"}
              <ArrowRight size={17} />
            </ButtonLink>
          </div>
          <p className="mt-3 text-center text-[11px] text-navy-faint">
            {next ? `Up next: ${next.title}` : "Course complete"} · progress saved automatically
          </p>
        </motion.div>
      </div>
    </div>
  );
}
