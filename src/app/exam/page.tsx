"use client";

/**
 * Exam setup.
 *
 * One question is asked at a time. First: which paper. Only once that is
 * answered does the screen commit to a specific exam and offer to start it,
 * and only if the student asks to customise does it show a question count or
 * a clock. Presenting the type cards, the length slider and the timer switch
 * together made a settings form out of what is really a single choice.
 */

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import {
  ClipboardCheck,
  History,
  Play,
  SlidersHorizontal,
  Target,
  Timer,
} from "lucide-react";
import type { UnitId } from "@/lib/types";

import { weakConcepts } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { Button, Card, PageHeader, Pill, ProgressBar, cn } from "@/components/ui";

/** The papers a student can pick. `custom` is not one of them — see below. */
type PickableMode = "quick" | "full" | "unit" | "weak";
type Mode = PickableMode | "custom";

const MODES: {
  id: PickableMode;
  title: string;
  body: string;
  count: number;
  icon: typeof ClipboardCheck;
}[] = [
  {
    id: "quick",
    title: "Quick exam",
    body: "Across the whole course, weighted toward your weak areas.",
    count: 20,
    icon: Play,
  },
  {
    id: "full",
    title: "Full exam",
    body: "The length and spread of the real NIFE exam.",
    count: 50,
    icon: ClipboardCheck,
  },
  {
    id: "unit",
    title: "Unit exam",
    body: "One unit, to find out whether it has actually landed.",
    count: 15,
    icon: Target,
  },
  {
    id: "weak",
    title: "Weak areas",
    body: "Built entirely from the concepts you are weakest on.",
    count: 20,
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

  const [mode, setMode] = useState<PickableMode>(
    (params.get("mode") as PickableMode) ?? "quick",
  );
  /*
   * Unit ids are course-scoped: Aerodynamics numbers them u1..u6, Engines
   * e1..e7, and so on. Defaulting to a literal "u1" therefore selected a unit
   * that does not exist on four of the five courses, and the unit paper came
   * out with zero questions in it. Fall back to whichever unit the active
   * course actually starts with, and re-anchor if the course changes while
   * this screen is open.
   */
  const [unit, setUnit] = useState<UnitId>(
    (params.get("unit") as UnitId) ?? content.units[0].id,
  );
  const activeUnit = content.units.some((u) => u.id === unit)
    ? unit
    : (content.units[0]?.id ?? unit);
  const [timed, setTimed] = useState(true);
  const [customising, setCustomising] = useState(false);
  /*
   * Null means "however many this paper normally has". Only once the student
   * moves the slider does the exam stop being the paper they picked and become
   * a custom one, which is what the stored result should be called.
   */
  const [countOverride, setCountOverride] = useState<number | null>(null);

  const weak = useMemo(
    () => weakConcepts(content.concepts, content.questions, state.mastery, Date.now(), { limit: 12 }),
    [content.concepts, content.questions, state.mastery],
  );

  const selected = MODES.find((m) => m.id === mode)!;

  const available = useMemo(() => {
    if (mode === "unit") return content.questions.filter((q) => q.unit === activeUnit).length;
    if (mode === "weak") {
      const ids = new Set(weak.map((w) => w.concept.id));
      return content.questions.filter((q) => q.conceptIds.some((c) => ids.has(c))).length;
    }
    return content.questions.length;
  }, [content.questions, mode, activeUnit, weak]);

  const baseCount = mode === "full" && policy ? policy.questionCount : selected.count;
  const effectiveCount = Math.min(countOverride ?? baseCount, available);
  const perQuestion = policy ? policy.minutes / policy.questionCount : 1;
  const minutes = Math.max(5, Math.round(effectiveCount * perQuestion));
  const submittedMode: Mode = countOverride === null ? mode : "custom";

  const pick = (m: PickableMode) => {
    setMode(m);
    setCountOverride(null);
  };

  const start = () => {
    const seed = `exam-${Date.now().toString(36)}`;
    const qs = new URLSearchParams({
      seed,
      mode: submittedMode,
      count: String(effectiveCount),
      timed: timed ? "1" : "0",
      minutes: String(minutes),
    });
    if (mode === "unit") qs.set("unit", activeUnit);
    router.push(`/exam/run?${qs.toString()}`);
  };

  const history = [...state.exams].sort((a, b) => b.at - a.at).slice(0, 5);
  const best = state.exams.reduce((m, e) => Math.max(m, e.score), 0);
  const sliderMax = Math.max(10, Math.min(60, available));
  const sliderValue = Math.min(countOverride ?? baseCount, sliderMax);

  return (
    <>
      <PageHeader
        title="Practice exam"
        subtitle="No hints and no explanations until you submit."
        actions={
          state.exams.length > 0 ? (
            <Pill tone={best >= 0.9 ? "go" : "brand"}>Best {Math.round(best * 100)}%</Pill>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          <h2 className="mb-3 text-[19px] font-extrabold text-navy">
            What do you want to practice?
          </h2>

          <ul className="grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => {
              const active = mode === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => pick(m.id)}
                    aria-pressed={active}
                    className={cn(
                      "pressable flex h-full w-full items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all",
                      active
                        ? "border-brand bg-brand-soft shadow-[0_8px_20px_-12px_rgba(13,28,46,0.3)]"
                        : "border-line bg-surface hover:border-line-strong hover:bg-surface-2/50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                        active ? "bg-brand text-white" : "bg-surface-2 text-navy-soft",
                      )}
                    >
                      <m.icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-bold text-navy">{m.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-navy-soft">
                        {m.body}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Which unit is part of choosing the paper, not a setting, so it
              appears as soon as the unit paper is picked. */}
          {mode === "unit" && (
            <Card className="mt-3">
              <p className="mb-2.5 text-[13px] font-bold text-navy">Which unit</p>
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
                        activeUnit === u.id
                          ? "border-brand bg-brand-soft"
                          : "border-line bg-surface hover:border-line-strong",
                      )}
                    >
                      <span className="min-w-0 text-[13.5px] font-semibold text-navy">
                        {u.title}
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

          {/* ---------------- The commitment ---------------- */}
          <div className="mt-4 rounded-2xl border-2 border-brand/30 bg-brand-soft/35 p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-brand">
              {countOverride === null ? selected.title : "Custom exam"}
            </p>
            <p className="mt-1 text-[17px] font-bold text-navy">
              {effectiveCount} questions
              {timed ? `, ${minutes} minutes` : ", untimed"}
            </p>
            {mode === "weak" && (
              <p className="mt-1 text-[13px] leading-snug text-navy-soft">
                {weak.length === 0
                  ? "Nothing is weak yet, so this falls back to a full-course sample."
                  : `Targeting ${weak.length} concept${weak.length === 1 ? "" : "s"} you are weakest on.`}
              </p>
            )}

            <div className="mt-4">
              <Button size="lg" fullWidth onClick={start}>
                <ClipboardCheck size={18} />
                Start exam
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setCustomising((c) => !c)}
              aria-expanded={customising}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-[12.5px] font-semibold text-navy-soft transition-colors hover:text-brand"
            >
              <SlidersHorizontal size={13} />
              {customising ? "Hide options" : "Customize"}
            </button>

            {customising && (
              <div className="mt-4 space-y-4 border-t border-brand/20 pt-4">
                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[13px] font-semibold text-navy">Questions</span>
                    <span className="tabular text-[13px] font-bold text-brand">
                      {effectiveCount}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={sliderMax}
                    step={5}
                    value={sliderValue}
                    onChange={(e) => setCountOverride(Number(e.target.value))}
                    className="lab-range h-6 w-full cursor-pointer appearance-none bg-transparent"
                    style={
                      {
                        "--accent": "var(--color-brand)",
                        "--track": `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${((sliderValue - 5) / Math.max(1, sliderMax - 5)) * 100}%, var(--color-surface-3) ${((sliderValue - 5) / Math.max(1, sliderMax - 5)) * 100}%, var(--color-surface-3) 100%)`,
                      } as React.CSSProperties
                    }
                  />
                  <p className="text-[11.5px] text-navy-faint">
                    {available} available for this selection
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-navy">Timed</p>
                    <p className="text-[11.5px] text-navy-faint">
                      {timed ? "Auto-submits at zero" : "No clock"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={timed}
                    aria-label="Timed exam"
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

                {policy && (
                  <div className="rounded-xl border border-brand/25 bg-surface px-3.5 py-3">
                    <p className="text-[12px] font-bold text-brand-dark">Real exam conditions</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-navy">{policy.note}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="min-w-0 space-y-4">
          {history.length > 0 && (
            <Card padded={false}>
              <div className="flex items-center gap-2 border-b border-line px-4 py-3">
                <History size={15} className="text-navy-faint" />
                <p className="text-[13.5px] font-bold text-navy">Recent exams</p>
              </div>
              <ul className="divide-y divide-line">
                {history.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/exam/results/${encodeURIComponent(e.id)}`}
                      className="block px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[13px] font-semibold text-navy">{e.label}</p>
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
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <p className="mb-2 text-[13.5px] font-bold text-navy">What is on the paper</p>
            <ul className="space-y-1.5 text-[12.5px] leading-relaxed text-navy-soft">
              {[
                "Definitions and exact wording",
                "Increase and decrease relationships",
                "Curve shifts and graph reading",
                "Numerical values from the guide",
                "T-6B aircraft-specific facts",
                "Common wording traps",
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
