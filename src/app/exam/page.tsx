"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { ClipboardCheck, Clock, History, Play, Target, Timer } from "lucide-react";
import type { UnitId } from "@/lib/types";

import { weakConcepts } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  ProgressBar,
  SectionHeading,
  cn,
} from "@/components/ui";

type Mode = "quick" | "full" | "unit" | "weak" | "custom";

const MODES: {
  id: Mode;
  title: string;
  body: string;
  count: number;
  minutes: number;
  icon: typeof ClipboardCheck;
}[] = [
  {
    id: "quick",
    title: "Quick exam",
    body: "Twenty questions across the whole course, weighted toward your weak areas.",
    count: 20,
    minutes: 20,
    icon: Play,
  },
  {
    id: "full",
    title: "Full exam",
    body: "Fifty questions — the length and spread of the real NIFE exam.",
    count: 50,
    minutes: 50,
    icon: ClipboardCheck,
  },
  {
    id: "unit",
    title: "Unit exam",
    body: "Everything from one unit, to find out whether it has actually landed.",
    count: 15,
    minutes: 15,
    icon: Target,
  },
  {
    id: "weak",
    title: "Weak-area exam",
    body: "Built entirely from the concepts you are currently weakest on.",
    count: 20,
    minutes: 20,
    icon: Timer,
  },
];

export default function ExamPage() {
  return (
    <Suspense fallback={null}>
      <ExamConfigurator />
    </Suspense>
  );
}

function ExamConfigurator() {
  const router = useRouter();
  const params = useSearchParams();
  const { state } = useProgress();
  const { content, meta } = useCourse();
  /*
   * Where a source states the real examination's conditions, use them. The
   * NETSAFA Navigation booklet prints 50 questions in 2 hours 30 minutes, which
   * is three minutes a question rather than the one minute the other courses
   * allow — because half of those questions are worked on a slide rule.
   */
  const policy = meta.examPolicy;

  const [mode, setMode] = useState<Mode>((params.get("mode") as Mode) ?? "quick");
  const [unit, setUnit] = useState<UnitId>((params.get("unit") as UnitId) ?? "u1");
  const [timed, setTimed] = useState(true);
  const [customCount, setCustomCount] = useState(30);

  const weak = useMemo(
    () => weakConcepts(content.concepts, content.questions, state.mastery, Date.now(), { limit: 12 }),
    [content.concepts, content.questions, state.mastery],
  );

  const selected = MODES.find((m) => m.id === mode);
  const count =
    mode === "custom"
      ? customCount
      : mode === "full" && policy
        ? policy.questionCount
        : (selected?.count ?? 20);

  const available = useMemo(() => {
    if (mode === "unit") return content.questions.filter((q) => q.unit === unit).length;
    if (mode === "weak") {
      const ids = new Set(weak.map((w) => w.concept.id));
      return content.questions.filter((q) => q.conceptIds.some((c) => ids.has(c))).length;
    }
    return content.questions.length;
  }, [content.questions, mode, unit, weak]);

  const effectiveCount = Math.min(count, available);
  const perQuestion = policy ? policy.minutes / policy.questionCount : 1;
  const minutes = Math.max(5, Math.round(effectiveCount * perQuestion));

  const start = () => {
    const seed = `exam-${Date.now().toString(36)}`;
    const qs = new URLSearchParams({
      seed,
      mode,
      count: String(effectiveCount),
      timed: timed ? "1" : "0",
      minutes: String(minutes),
    });
    if (mode === "unit") qs.set("unit", unit);
    router.push(`/exam/run?${qs.toString()}`);
  };

  const history = [...state.exams].sort((a, b) => b.at - a.at).slice(0, 5);
  const best = state.exams.reduce((m, e) => Math.max(m, e.score), 0);

  return (
    <>
      <PageHeader
        eyebrow="Exam mode"
        title="Practice exam"
        subtitle="No hints, no explanations until you submit. Question style is modelled on the official review questions and the NIFE practice test."
        actions={
          state.exams.length > 0 ? (
            <Pill tone={best >= 0.9 ? "go" : "brand"}>Best {Math.round(best * 100)}%</Pill>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <SectionHeading eyebrow="Choose a paper" title="Exam type" />
          <ul className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "flex h-full w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all",
                      active
                        ? "border-brand bg-brand-soft"
                        : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        active ? "bg-brand text-white" : "bg-surface-2 text-navy-soft",
                      )}
                    >
                      <m.icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[15px] font-semibold text-navy">{m.title}</span>
                        <span className="tabular shrink-0 text-[12px] font-bold text-navy-faint">
                          {m.count} Q
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-navy-soft">
                        {m.body}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {mode === "unit" && (
            <Card className="mt-4">
              <p className="eyebrow mb-2.5 text-navy-faint">Which unit</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {content.units.map((u) => {
                  const n = content.questions.filter((q) => q.unit === u.id).length;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUnit(u.id)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all",
                        unit === u.id
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-surface hover:border-line-strong",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="tabular mr-1.5 text-[11px] font-bold text-navy-faint">
                          {u.index}
                        </span>
                        <span className="text-[13px] font-semibold text-navy">{u.title}</span>
                      </span>
                      <span className="tabular shrink-0 text-[11.5px] font-bold text-navy-faint">
                        {n} Q
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {mode === "weak" && (
            <Card className="mt-4">
              <p className="eyebrow mb-2 text-navy-faint">Targeting</p>
              {weak.length === 0 ? (
                <p className="text-[13px] text-navy-soft">
                  Nothing is weak yet. This exam will fall back to a full-course sample.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {weak.map((w) => (
                    <Pill key={w.concept.id} tone={w.mastery < 40 ? "nogo" : "caution"} size="sm">
                      {w.concept.name} {w.mastery}%
                    </Pill>
                  ))}
                </div>
              )}
            </Card>
          )}

          <Card className="mt-4">
            <p className="eyebrow mb-3 text-navy-faint">Settings</p>

            <div className="mb-4">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[12.5px] font-semibold text-navy">Questions</span>
                <span className="tabular text-[13px] font-bold text-brand">{effectiveCount}</span>
              </div>
              <input
                type="range"
                min={5}
                max={Math.min(60, available)}
                step={5}
                value={Math.min(customCount, available)}
                onChange={(e) => {
                  setCustomCount(Number(e.target.value));
                  setMode("custom");
                }}
                className="lab-range h-6 w-full cursor-pointer appearance-none bg-transparent"
                style={
                  {
                    "--accent": "var(--color-brand)",
                    "--track": `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${((Math.min(customCount, available) - 5) / Math.max(1, Math.min(60, available) - 5)) * 100}%, var(--color-surface-3) ${((Math.min(customCount, available) - 5) / Math.max(1, Math.min(60, available) - 5)) * 100}%, var(--color-surface-3) 100%)`,
                  } as React.CSSProperties
                }
              />
              <p className="text-[11px] text-navy-faint">
                {available} questions available for this selection
              </p>
            </div>

            {policy && (
              <div className="rounded-xl border border-brand/25 bg-brand-soft/50 px-3.5 py-3">
                <p className="eyebrow mb-1 text-brand-dark">Real exam conditions</p>
                <p className="text-[12.5px] leading-relaxed text-navy">{policy.note}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-navy-faint">
                  Taken from the NETSAFA Navigation examination booklet and Appendix A of the
                  trainee guide. Where a source does not state a condition, none is invented.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12.5px] font-semibold text-navy">Timed</p>
                <p className="text-[11px] text-navy-faint">
                  {timed ? `${minutes} minutes, auto-submits at zero` : "No clock"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={timed}
                onClick={() => setTimed((t) => !t)}
                className={cn(
                  "relative flex h-7 w-[62px] shrink-0 items-center rounded-full px-1 transition-colors",
                  timed ? "bg-brand" : "bg-surface-3",
                )}
              >
                <span
                  className={cn(
                    "absolute text-[9.5px] font-extrabold tracking-wide",
                    timed ? "left-2 text-white" : "right-2 text-navy-faint",
                  )}
                >
                  {timed ? "ON" : "OFF"}
                </span>
                <span
                  className={cn(
                    "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                    timed ? "translate-x-[36px]" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          </Card>

          <div className="mt-5">
            <Button size="lg" fullWidth onClick={start}>
              <ClipboardCheck size={18} />
              Begin {effectiveCount}-question exam
              {timed && (
                <span className="tabular ml-1 flex items-center gap-1 opacity-80">
                  <Clock size={14} />
                  {minutes}m
                </span>
              )}
            </Button>
          </div>
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <p className="eyebrow mb-2.5 text-navy-faint">What is on the paper</p>
            <ul className="space-y-2 text-[12.5px] leading-relaxed text-navy-soft">
              {[
                "Definitions and exact wording",
                "Increase / decrease relationships",
                "Curve shifts and graph reading",
                "Numerical values from the guide",
                "T-6B aircraft-specific facts",
                "Common wording traps",
              ].map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>

          {history.length > 0 && (
            <Card padded={false}>
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <History size={15} className="text-navy-faint" />
                <p className="text-[13px] font-semibold text-navy">Recent exams</p>
              </div>
              <ul className="divide-y divide-line">
                {history.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/exam/results/${encodeURIComponent(e.id)}`}
                      className="block px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[12.5px] font-semibold text-navy">{e.label}</p>
                        <span
                          className={cn(
                            "tabular shrink-0 text-[14px] font-bold",
                            e.score >= 0.8 ? "text-go" : e.score >= 0.6 ? "text-caution" : "text-nogo",
                          )}
                        >
                          {Math.round(e.score * 100)}%
                        </span>
                      </div>
                      <ProgressBar
                        value={e.score}
                        tone={e.score >= 0.8 ? "go" : e.score >= 0.6 ? "caution" : "nogo"}
                        height={4}
                        className="mt-1.5"
                      />
                      <p className="mt-1 text-[11px] text-navy-faint">
                        {new Date(e.at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        · {e.correctIds.length}/{e.questionIds.length} correct
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}
