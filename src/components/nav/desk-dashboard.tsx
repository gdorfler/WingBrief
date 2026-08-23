"use client";

/**
 * The Navigation home screen.
 *
 * The standard dashboard answers "how much of the material do you know". That
 * is the wrong headline for a course examined on production, so this one leads
 * with accuracy and solve time, lists skills rather than concepts, and puts
 * OPEN NAV DESK where the other courses put CONTINUE LESSON.
 *
 * It is still recognisably the same product — same cards, same rings, same
 * typography. What changed is which numbers are large.
 */

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  Compass,
  Gauge,
  Layers,
  Play,
  Repeat,
  Target,
  Timer,
} from "lucide-react";

import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { levelFromXp, liveStreak } from "@/lib/xp";
import {
  categoryStats,
  errorTaxonomy,
  navPerformance,
  navReadiness,
  recommendNext,
  weakSkills,
} from "@/lib/nav/analytics";
import {
  ButtonLink,
  Card,
  InkCard,
  Pill,
  ProgressBar,
  ProgressRing,
  SectionHeading,
  StatTile,
  cn,
} from "@/components/ui";
import { LessonIcon } from "@/components/lesson-icon";

export function NavDeskDashboard() {
  const { state, ready } = useProgress();
  const { content, stats, meta } = useCourse();
  const now = Date.now();

  const readiness = navReadiness(content, state.attempts);
  const perf = navPerformance(content, state.attempts);
  const categories = categoryStats(content, state.attempts);
  const weak = weakSkills(content, state.attempts, 5);
  const errors = errorTaxonomy(content, state.attempts).slice(0, 2);
  const plan = recommendNext(content, state.attempts, 4);
  const streak = liveStreak(state.streak, now);
  const level = levelFromXp(state.xp);
  const lessonsDone = Object.values(state.lessons).filter((l) => l.completed).length;
  const isNew = ready && state.attempts.length === 0;

  const nextLesson =
    content.lessons.find((l) => !state.lessons[l.id]?.completed) ?? content.lessons[0];

  return (
    <div className="space-y-6">
      {/* ---------------- Hero: the planning station ---------------- */}
      <InkCard className="relative overflow-hidden" padded={false}>
        <ChartBackdrop />
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-5">
            <ProgressRing
              value={readiness / 100}
              size={104}
              stroke={10}
              tone={readiness >= 80 ? "go" : readiness >= 50 ? "brand" : "caution"}
              trackClassName="stroke-ink-600"
            >
              <span className="figure text-[27px] font-extrabold leading-none text-white">
                {readiness}
                <span className="text-base">%</span>
              </span>
            </ProgressRing>
            <div>
              <p className="eyebrow text-[#8fc4ac]">Navigation readiness</p>
              <p className="mt-1 max-w-[15rem] text-[15px] font-semibold leading-snug text-white">
                {isNew
                  ? "Nothing solved yet. The desk is set up and waiting."
                  : readiness >= 85
                    ? "Fast and accurate. Hold it with missions."
                    : readiness >= 60
                      ? "The methods are there. Speed is the gap."
                      : "Method first, then speed. Start with the drills."}
              </p>
              <p className="mt-2 text-[11.5px] leading-snug text-[#a7c9b8]">
                Measured on skills performed, not concepts seen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:px-4">
            <StatTile
              ink
              label="Accuracy"
              value={perf.calculationPct === null ? "—" : `${perf.calculationPct}%`}
              hint="on problems"
              tone={perf.calculationPct !== null && perf.calculationPct >= 80 ? "go" : "brand"}
            />
            <StatTile
              ink
              label="Solve time"
              value={perf.medianSolveSeconds === null ? "—" : formatSeconds(perf.medianSolveSeconds)}
              hint="median"
              tone="brand"
            />
            <StatTile
              ink
              label="Problems"
              value={perf.totalProblems.toLocaleString()}
              hint="worked"
            />
            <StatTile ink label="Streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} tone={streak > 0 ? "caution" : "neutral"} />
          </div>

          <div className="flex flex-col gap-2 lg:w-44">
            <ButtonLink href="/nav-desk" variant="primary" size="lg" fullWidth>
              <Compass size={17} />
              Open Nav Desk
            </ButtonLink>
            <ButtonLink href={`/lessons/${nextLesson?.id ?? ""}`} variant="ink" size="md" fullWidth>
              <Play size={15} fill="currentColor" />
              {isNew ? "Start the route" : "Continue route"}
            </ButtonLink>
          </div>
        </div>
      </InkCard>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* ---------------- Today's nav plan ---------------- */}
          <section>
            <SectionHeading
              eyebrow="Built from your weakest skills"
              title="Today's nav plan"
              action={
                <Pill tone="brand">
                  <Timer size={12} /> {plan.length} items
                </Pill>
              }
            />
            <ul className="space-y-2.5">
              {plan.map((item) => (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.kind === "mission" ? `/missions/${item.id}` : `/drills/${item.id}`}
                    className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-all hover:border-brand/40 hover:shadow-sm"
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        item.kind === "mission" ? "bg-brand text-white" : "bg-brand-soft text-brand",
                      )}
                    >
                      {item.kind === "mission" ? <Target size={19} /> : <Repeat size={19} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-navy">{item.label}</p>
                        <Pill tone="neutral" size="sm">
                          {item.kind === "mission" ? "Mission" : "Drill"}
                        </Pill>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] leading-snug text-navy-soft">
                        {item.reason}
                      </p>
                    </div>
                    <ArrowRight
                      size={18}
                      className="shrink-0 text-navy-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------------- Diagnostic breakdown ---------------- */}
          <section>
            <SectionHeading
              eyebrow="Where the marks are going"
              title="By kind of work"
              action={
                <Link href="/profile" className="text-[13px] font-semibold text-brand hover:underline">
                  Full profile
                </Link>
              }
            />
            <Card padded={false}>
              <ul className="divide-y divide-line">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex items-center gap-4 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13.5px] font-semibold text-navy">{cat.label}</p>
                        <span className="figure shrink-0 text-[13px] font-bold text-navy">
                          {cat.pct === null ? "—" : `${cat.pct}%`}
                        </span>
                      </div>
                      <ProgressBar
                        value={(cat.pct ?? 0) / 100}
                        tone={cat.pct === null ? "neutral" : cat.pct >= 80 ? "go" : cat.pct >= 60 ? "brand" : "caution"}
                        className="mt-1.5"
                      />
                      <p className="mt-1 text-[11px] text-navy-faint">
                        {cat.attempts === 0
                          ? "Not attempted"
                          : `${cat.correct} of ${cat.attempts} correct`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="min-w-0 space-y-6">
          <section>
            <SectionHeading eyebrow="Weakest first" title="Skills" />
            <Card padded={false}>
              {weak.length === 0 ? (
                <p className="px-4 py-6 text-center text-[13px] text-navy-soft">
                  Work a drill and your skills will start appearing here.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {weak.map((s) => (
                    <li key={s.skill.id} className="px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13.5px] font-semibold text-navy">{s.skill.name}</p>
                        <span
                          className={cn(
                            "figure shrink-0 text-[13px] font-bold",
                            s.proficiency >= 80 ? "text-go" : s.proficiency >= 60 ? "text-brand" : "text-caution",
                          )}
                        >
                          {s.proficiency}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-navy-soft">
                        {s.skill.operation}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {s.recent.slice(-8).map((ok, i) => (
                            <span
                              key={i}
                              className={cn(
                                "h-1.5 w-3 rounded-full",
                                ok ? "bg-go" : "bg-nogo/60",
                              )}
                            />
                          ))}
                        </div>
                        {s.medianSeconds !== null && (
                          <span className="figure text-[10.5px] font-semibold text-navy-faint">
                            {formatSeconds(s.medianSeconds)} median
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>

          {errors.length > 0 && (
            <section>
              <SectionHeading eyebrow="What keeps going wrong" title="Common errors" />
              <div className="space-y-2">
                {errors.map((e) => (
                  <Card key={e.kind} className="border-caution/25 bg-caution-soft/40">
                    <p className="text-[13.5px] font-bold text-navy">{e.label}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-navy-soft">{e.advice}</p>
                    <p className="figure mt-1.5 text-[11px] font-semibold text-caution">
                      {e.count} {e.count === 1 ? "time" : "times"}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeading eyebrow="Quick start" title="Straight to work" />
            <div className="grid grid-cols-2 gap-2">
              <QuickTile href="/nav-desk" icon={Compass} label="Nav Desk" hint="Every tool" />
              <QuickTile href="/drills" icon={Repeat} label="Drills" hint={`${content.drills?.length ?? 0} sets`} />
              <QuickTile href="/missions" icon={Target} label="Missions" hint={`${content.missions?.length ?? 0} routes`} />
              <QuickTile href="/exam" icon={ClipboardCheck} label="Exam" hint={meta.examPolicy ? `${meta.examPolicy.questionCount} questions` : "Practice"} />
            </div>
          </section>

          <section>
            <SectionHeading eyebrow="The route" title="Course progress" />
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Layers size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13.5px] font-semibold text-navy">Waypoints reached</p>
                    <span className="figure text-[13px] font-bold text-navy">
                      {lessonsDone}/{stats.lessons}
                    </span>
                  </div>
                  <ProgressBar value={lessonsDone / Math.max(1, stats.lessons)} tone="brand" className="mt-1.5" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-navy-soft">
                  <Gauge size={14} className="text-brand" />
                  Level {level.level} · {state.xp.toLocaleString()} XP
                </span>
                {perf.onPacePct !== null && (
                  <span className="figure text-[12px] font-semibold text-navy-soft">
                    {perf.onPacePct}% on pace
                  </span>
                )}
              </div>
              <Link
                href="/lessons"
                className="mt-3 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5 transition-colors hover:bg-surface-3"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <LessonIcon name={nextLesson?.mapIcon ?? "compass"} className="h-6 w-6 text-brand" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-navy">
                      {nextLesson?.title ?? "Flight path"}
                    </span>
                    <span className="block text-[11px] text-navy-faint">Next waypoint</span>
                  </span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-navy-faint" />
              </Link>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuickTile({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string;
  icon: typeof Compass;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1.5 rounded-2xl border border-line bg-surface p-3.5 transition-all hover:border-brand/40 hover:shadow-sm"
    >
      <Icon size={18} className="text-brand" />
      <span className="text-[13.5px] font-semibold text-navy">{label}</span>
      <span className="text-[11px] text-navy-faint">{hint}</span>
    </Link>
  );
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** A faint graticule with a plotted leg across it, behind the hero. */
function ChartBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="none"
      viewBox="0 0 800 260"
    >
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={i * 80}
          y1={0}
          x2={i * 80}
          y2={260}
          stroke="var(--color-brand-light)"
          strokeWidth="0.6"
          opacity="0.12"
        />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={i * 65}
          x2={800}
          y2={i * 65}
          stroke="var(--color-brand-light)"
          strokeWidth="0.6"
          opacity="0.12"
        />
      ))}
      <path
        d="M 60 210 L 300 120 L 520 155 L 740 60"
        fill="none"
        stroke="var(--color-brand-light)"
        strokeWidth="2"
        opacity="0.32"
      />
      {[
        [60, 210],
        [300, 120],
        [520, 155],
        [740, 60],
      ].map(([x, y]) => (
        <circle key={`${x}`} cx={x} cy={y} r="4.5" fill="var(--color-brand-light)" opacity="0.45" />
      ))}
    </svg>
  );
}
