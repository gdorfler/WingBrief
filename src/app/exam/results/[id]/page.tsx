"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Clock, RotateCcw, Target, TrendingUp } from "lucide-react";
import { CONCEPT_BY_ID, QUESTION_BY_ID, UNIT_BY_ID } from "@/content";
import { scoreExam } from "@/lib/scoring";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { NavExamDiagnostic } from "@/components/nav/diagnostics";
import { PlacementBanner } from "@/components/placement-banner";
import { QuestionReview } from "@/components/questions";
import {

  ButtonLink,
  Card,
  EmptyState,
  FilterChip,
  Pill,
  ProgressBar,
  ProgressRing,
  SectionHeading,
  cn,
} from "@/components/ui";

type Filter = "missed" | "flagged" | "all";

export default function ExamResultsPage() {
  const params = useParams<{ id: string }>();
  const { state, ready } = useProgress();
  const { content, meta } = useCourse();
  const [filter, setFilter] = useState<Filter>("missed");

  const result = state.exams.find((e) => e.id === decodeURIComponent(params.id));

  const questions = useMemo(
    () => (result ? result.questionIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean) : []),
    [result],
  );

  const summary = useMemo(
    () =>
      result
        ? scoreExam(questions, result.answers, {
            unit: (u) => UNIT_BY_ID[u]?.title ?? u,
            concept: (c) => CONCEPT_BY_ID[c]?.name ?? c,
          })
        : null,
    [questions, result],
  );

  if (!ready) return null;

  if (!result || !summary) {
    return (
      <EmptyState
        title="Exam not found"
        body="That result is no longer in your history. Older exams are pruned to keep local storage small."
        action={<ButtonLink href="/exam">Back to exams</ButtonLink>}
      />
    );
  }

  const pct = Math.round(summary.score * 100);
  const minutes = Math.floor(result.elapsedMs / 60000);
  const seconds = Math.floor((result.elapsedMs % 60000) / 1000);

  const shown =
    filter === "all"
      ? questions
      : filter === "flagged"
        ? questions.filter((q) => result.flaggedIds.includes(q.id))
        : questions.filter((q) => summary.incorrectIds.includes(q.id));

  const weakConceptIds = summary.weakAreas.map((w) => w.key);

  return (
    <>
      {/* Score header */}
      <div className="mb-6 overflow-hidden rounded-3xl bg-ink-800 p-6 sm:p-8">
        <p className="eyebrow text-[#8fb0d4]">{result.label}</p>
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ProgressRing
            value={summary.score}
            size={132}
            stroke={12}
            tone={pct >= 80 ? "go" : pct >= 60 ? "caution" : "nogo"}
            trackClassName="stroke-ink-600"
          >
            <span className="tabular text-[34px] font-extrabold leading-none text-white">
              {pct}
              <span className="text-xl">%</span>
            </span>
          </ProgressRing>

          <div className="grid flex-1 grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat label="Correct" value={`${summary.correct}`} tone="text-go" />
            <Stat label="Incorrect" value={`${summary.incorrect}`} tone="text-nogo" />
            <Stat
              label="Time"
              value={`${minutes}:${String(seconds).padStart(2, "0")}`}
              tone="text-white"
            />
            <Stat label="Flagged" value={`${result.flaggedIds.length}`} tone="text-caution" />
          </div>
        </div>

        <p className="mt-6 text-center text-[13.5px] font-semibold text-[#c9dcf0] sm:text-left">
          {pct >= 90
            ? "Exam-ready. Keep the weak concepts warm with spaced review."
            : pct >= 75
              ? "Solid. Clear the missed questions below and re-test."
              : pct >= 50
                ? "The base is there. Work the weak areas before the next attempt."
                : "Go back through the lessons for the units below, then re-test."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {/*
           * A percentage says you were wrong; it does not say whether the
           * chart work or the wind solutions were the problem. On a
           * procedural course that is the whole of useful feedback, so
           * Navigation gets a diagnostic above the standard breakdowns.
           */}
          <PlacementBanner />

          {meta.layout === "desk" && (
            <NavExamDiagnostic
              content={content}
              exam={result}
              passPct={meta.examPolicy?.passPct}
            />
          )}

          {/* Unit performance */}
          <section className="mb-6">
            <SectionHeading eyebrow="Where the marks went" title="Unit performance" />
            <Card padded={false}>
              <ul className="divide-y divide-line">
                {summary.byUnit.map((u) => (
                  <li key={u.key} className="flex items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-[13.5px] font-semibold text-navy">{u.label}</p>
                        <span className="tabular shrink-0 text-[13px] font-bold text-navy">
                          {u.correct}/{u.total} · {u.pct}%
                        </span>
                      </div>
                      <ProgressBar
                        value={u.pct / 100}
                        tone={u.pct >= 80 ? "go" : u.pct >= 60 ? "caution" : "nogo"}
                        height={6}
                        className="mt-2"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Question review */}
          <section>
            <SectionHeading
              eyebrow="Learn from every flight"
              title="Question review"
              action={
                <div className="flex gap-1.5">
                  <FilterChip active={filter === "missed"} onClick={() => setFilter("missed")}>
                    Missed {summary.incorrect}
                  </FilterChip>
                  <FilterChip active={filter === "flagged"} onClick={() => setFilter("flagged")}>
                    Flagged {result.flaggedIds.length}
                  </FilterChip>
                  <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                    All
                  </FilterChip>
                </div>
              }
            />
            {shown.length === 0 ? (
              <Card className="py-10 text-center">
                <p className="text-sm font-semibold text-go">
                  {filter === "missed"
                    ? "Nothing missed on this exam."
                    : "No questions flagged on this exam."}
                </p>
              </Card>
            ) : (
              <ul className="space-y-3">
                {shown.map((q) => (
                  <li key={q.id}>
                    <QuestionReview question={q} givenAnswer={result.answers[q.id]} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <div className="mb-2.5 flex items-center gap-2">
              <TrendingUp size={15} className="text-nogo" />
              <p className="text-[13px] font-semibold text-navy">Weak areas</p>
            </div>
            {summary.weakAreas.length === 0 ? (
              <p className="text-[12.5px] text-navy-soft">
                Every concept tested came back clean.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {summary.weakAreas.map((w) => (
                  <li key={w.key}>
                    <Link
                      href={`/review/concept/${w.key}`}
                      className="block rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-[12.5px] font-semibold text-navy">
                          {w.label}
                        </span>
                        <span
                          className={cn(
                            "tabular shrink-0 text-[12px] font-bold",
                            w.pct < 50 ? "text-nogo" : "text-caution",
                          )}
                        >
                          {w.pct}%
                        </span>
                      </div>
                      <ProgressBar
                        value={w.pct / 100}
                        tone={w.pct < 50 ? "nogo" : "caution"}
                        height={4}
                        className="mt-1.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="space-y-2">
            <ButtonLink href="/review/weak" size="lg" fullWidth>
              <Target size={17} />
              Review weak areas
            </ButtonLink>
            {summary.incorrect > 0 && (
              <ButtonLink href="/review/mistakes" variant="secondary" size="lg" fullWidth>
                <RotateCcw size={16} />
                Retry missed questions
              </ButtonLink>
            )}
            <ButtonLink
              href={`/exam?mode=${result.mode}`}
              variant="secondary"
              size="lg"
              fullWidth
            >
              <Clock size={16} />
              Retry exam
            </ButtonLink>
            <ButtonLink href="/lessons" variant="ghost" size="lg" fullWidth>
              Return to flight path
              <ArrowRight size={16} />
            </ButtonLink>
          </div>

          <Card>
            <p className="eyebrow mb-2 text-navy-faint">Concept detail</p>
            <div className="flex flex-wrap gap-1.5">
              {summary.byConcept.slice(0, 14).map((c) => (
                <Link key={c.key} href={`/review/concept/${c.key}`}>
                  <Pill
                    tone={c.pct === 100 ? "go" : c.pct >= 50 ? "caution" : "nogo"}
                    size="sm"
                  >
                    {c.label} {c.pct}%
                  </Pill>
                </Link>
              ))}
            </div>
            {weakConceptIds.length > 0 && (
              <p className="mt-3 text-[11px] leading-relaxed text-navy-faint">
                These concepts have been pushed to the front of your spaced-review queue.
              </p>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl bg-ink-700/70 px-3 py-3 text-center sm:text-left">
      <p className="eyebrow text-[#8fb0d4]">{label}</p>
      <p className={cn("tabular mt-1 text-2xl font-bold leading-none", tone)}>{value}</p>
    </div>
  );
}

