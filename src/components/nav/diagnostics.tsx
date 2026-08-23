"use client";

/**
 * Navigation's diagnostic panels.
 *
 * A percentage tells a student they were wrong. It does not tell them whether
 * their chart work is fine and their wind solutions are not, or whether the
 * same reciprocal error has now cost them four marks in a row. On a course
 * this procedural, that distinction is the difference between useful feedback
 * and a grade.
 *
 * Two panels: one keyed to a single exam, one to everything the student has
 * ever done. Both are additive — they sit alongside the platform's standard
 * unit and concept breakdowns rather than replacing them.
 */

import Link from "next/link";
import { AlertTriangle, ArrowRight, Repeat, Target } from "lucide-react";
import type { CourseContent, ExamResult } from "@/lib/types";
import { QUESTION_BY_ID } from "@/content";
import {
  NAV_CATEGORIES,
  categoryStats,
  errorTaxonomy,
  navPerformance,
  recommendNext,
  weakSkills,
} from "@/lib/nav/analytics";
import { Card, Pill, ProgressBar, SectionHeading, cn } from "../ui";
import type { Attempt } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Exam results                                                        */
/* ------------------------------------------------------------------ */

/**
 * The breakdown for one exam.
 *
 * Built from the exam's own answers rather than from lifetime attempts, so it
 * describes this sitting and nothing else.
 */
export function NavExamDiagnostic({
  content,
  exam,
  passPct,
}: {
  content: CourseContent;
  exam: ExamResult;
  passPct?: number;
}) {
  /* Turn the exam into attempt-shaped rows so the analytics can read them. */
  const rows: Attempt[] = exam.questionIds.map((id) => ({
    questionId: id,
    conceptIds: QUESTION_BY_ID[id]?.conceptIds ?? [],
    correct: exam.correctIds.includes(id),
    elapsedMs: exam.elapsedMs / Math.max(1, exam.questionIds.length),
    at: exam.at,
    context: "exam" as const,
    answerKey: exam.answers[id],
  }));

  const categories = categoryStats(content, rows).filter((c) => c.attempts > 0);
  const perf = navPerformance(content, rows);
  const errors = errorTaxonomy(content, rows).slice(0, 3);
  const plan = recommendNext(content, rows, 3);
  const pct = Math.round(exam.score * 100);
  const passed = passPct === undefined ? undefined : pct >= passPct;

  return (
    <section className="mb-6">
      <SectionHeading
        eyebrow="Navigation diagnostic"
        title="What kind of work went wrong"
        action={
          passed !== undefined && (
            <Pill tone={passed ? "go" : "nogo"}>
              {passed ? "Above" : "Below"} the {passPct}% pass mark
            </Pill>
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          label="Calculation"
          value={perf.calculationPct === null ? "—" : `${perf.calculationPct}%`}
          hint={`${perf.totalProblems} worked problems`}
          tone={perf.calculationPct !== null && perf.calculationPct >= 80 ? "go" : "caution"}
        />
        <Metric
          label="Recognition"
          value={perf.recognitionPct === null ? "—" : `${perf.recognitionPct}%`}
          hint="definitions and logic"
          tone={perf.recognitionPct !== null && perf.recognitionPct >= 80 ? "go" : "caution"}
        />
        <Metric
          label="Median solve"
          value={perf.medianSolveSeconds === null ? "—" : `${Math.round(perf.medianSolveSeconds)}s`}
          hint="per problem"
          tone="brand"
        />
      </div>

      <Card className="mt-3" padded={false}>
        <ul className="divide-y divide-line">
          {categories.map((cat) => (
            <li key={cat.id} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13.5px] font-semibold text-navy">{cat.label}</p>
                <span className="figure shrink-0 text-[13px] font-bold text-navy">
                  {cat.correct}/{cat.attempts} · {cat.pct}%
                </span>
              </div>
              <ProgressBar
                value={(cat.pct ?? 0) / 100}
                tone={(cat.pct ?? 0) >= 80 ? "go" : (cat.pct ?? 0) >= 60 ? "caution" : "nogo"}
                height={6}
                className="mt-2"
              />
            </li>
          ))}
        </ul>
      </Card>

      {errors.length > 0 && (
        <Card className="mt-3 border-caution/25 bg-caution-soft/40">
          <p className="eyebrow mb-2 text-caution">
            {errors.length === 1 ? "Most common error" : "Most common errors"}
          </p>
          <ul className="space-y-2.5">
            {errors.map((e, i) => (
              <li key={e.kind} className="flex gap-2.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-caution" />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-navy">
                    {i === 0 ? "" : "Also: "}
                    {e.label}
                    <span className="figure ml-1.5 font-semibold text-caution">
                      ×{e.count}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-navy-soft">{e.advice}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {plan.length > 0 && (
        <Card className="mt-3">
          <p className="eyebrow mb-2 text-brand-dark">Recommended</p>
          <ul className="space-y-1.5">
            {plan.map((item) => (
              <li key={`${item.kind}-${item.id}`}>
                <Link
                  href={item.kind === "mission" ? `/missions/${item.id}` : `/drills/${item.id}`}
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-brand-soft/50"
                >
                  {item.kind === "mission" ? (
                    <Target size={14} className="shrink-0 text-brand" />
                  ) : (
                    <Repeat size={14} className="shrink-0 text-brand" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-navy">
                    {item.label}
                  </span>
                  <span className="hidden shrink-0 text-[11.5px] text-navy-faint sm:block">
                    {item.reason}
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-navy-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "go" | "brand" | "caution";
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
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] text-navy-faint">{hint}</p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Review                                                              */
/* ------------------------------------------------------------------ */

/**
 * Review, for a course where reviewing means doing.
 *
 * The platform's spaced-repetition engine schedules concepts, and that still
 * runs underneath — a definition you have not seen in three weeks should come
 * back. But the top of a Navigation review session should be problems, chosen
 * by which skill has decayed, not a list of facts to re-read.
 */
export function NavReviewPanel({
  content,
  attempts,
}: {
  content: CourseContent;
  attempts: Attempt[];
}) {
  const plan = recommendNext(content, attempts, 4);
  const weak = weakSkills(content, attempts, 4);
  const categories = categoryStats(content, attempts);
  const untouched = categories.filter((c) => c.attempts === 0);

  return (
    <>
      <SectionHeading
        eyebrow="Review is doing"
        title="Work these"
        action={
          <Link href="/drills" className="text-[13px] font-semibold text-brand hover:underline">
            All drills
          </Link>
        }
      />
      <ul className="mb-6 grid gap-3 sm:grid-cols-2">
        {plan.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link
              href={item.kind === "mission" ? `/missions/${item.id}` : `/drills/${item.id}`}
              className="group flex h-full items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 transition-all hover:border-brand/40 hover:shadow-sm"
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  item.kind === "mission" ? "bg-brand text-white" : "bg-brand-soft text-brand",
                )}
              >
                {item.kind === "mission" ? <Target size={19} /> : <Repeat size={19} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14.5px] font-semibold text-navy">
                  {item.label}
                </span>
                <span className="block truncate text-[12px] text-navy-soft">{item.reason}</span>
              </span>
              <ArrowRight size={17} className="shrink-0 text-navy-faint group-hover:text-brand" />
            </Link>
          </li>
        ))}
      </ul>

      {weak.length > 0 && (
        <>
          <SectionHeading eyebrow="Weakest skills" title="What is actually slipping" />
          <Card className="mb-6" padded={false}>
            <ul className="divide-y divide-line">
              {weak.map((s) => (
                <li key={s.skill.id} className="px-4 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13.5px] font-semibold text-navy">{s.skill.name}</p>
                    <span
                      className={cn(
                        "figure shrink-0 text-[13px] font-bold",
                        s.proficiency >= 80
                          ? "text-go"
                          : s.proficiency >= 60
                            ? "text-brand"
                            : "text-caution",
                      )}
                    >
                      {s.proficiency}%
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-navy-soft">
                    {s.skill.operation}
                    {s.skill.tolerance ? ` · ${s.skill.tolerance}` : ""}
                  </p>
                  <ProgressBar
                    value={s.proficiency / 100}
                    tone={s.proficiency >= 80 ? "go" : s.proficiency >= 60 ? "brand" : "caution"}
                    height={5}
                    className="mt-2"
                  />
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {untouched.length > 0 && untouched.length < NAV_CATEGORIES.length && (
        <Card className="mb-6 border-brand/25 bg-brand-soft/40">
          <p className="text-[12.5px] leading-relaxed text-navy">
            <span className="font-bold">Not attempted yet: </span>
            {untouched.map((c) => c.label).join(", ")}. A skill you have never tried is a bigger
            gap than one you have tried badly, so those come first in the plan above.
          </p>
        </Card>
      )}
    </>
  );
}
