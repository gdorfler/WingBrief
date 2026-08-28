"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Play,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { buildDailyFlight, overallReadiness, unitReadiness, weakConcepts } from "@/lib/review";
import { levelFromXp, liveStreak } from "@/lib/xp";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
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
import { AchievementIcon } from "@/components/achievement-icon";
import { LessonIcon } from "@/components/lesson-icon";
import { achievementById } from "@/lib/xp";
import { useCountUp } from "@/components/reward";
import { ClaimsHero } from "@/components/claims-hero";
import { claimsFor, evaluateClaims, summariseClaims } from "@/lib/claims";
import { NavDeskDashboard } from "@/components/nav/desk-dashboard";

const UNIT_TONE = {
  brand: "brand",
  go: "go",
  caution: "caution",
  violet: "violet",
  navy: "neutral",
  nogo: "nogo",
} as const;

export default function HomePage() {
  const { meta: activeMeta } = useCourse();
  /*
   * Navigation gets a different home screen, not a differently-worded one.
   * A course examined on production should lead with accuracy and solve time
   * rather than with how much of the material has been seen.
   */
  if (activeMeta.layout === "desk") return <NavDeskDashboard />;
  return <StandardHome />;
}

function StandardHome() {
  const { state, ready } = useProgress();
  const { id: activeCourse, content, stats, meta } = useCourse();
  const now = Date.now();

  const readiness = overallReadiness(content.concepts, state.mastery);
  const units = unitReadiness(content.units, content.concepts, content.lessons, state);
  const streak = liveStreak(state.streak, now);
  const level = levelFromXp(state.xp);
  const flight = buildDailyFlight(
    { lessons: content.lessons, concepts: content.concepts, questions: content.questions, explainers: content.explainers },
    state,
    now,
  );
  const weak = weakConcepts(content.concepts, content.questions, state.mastery, now, { limit: 4 });
  const recentAwards = [...state.achievements].sort((a, b) => b.unlockedAt - a.unlockedAt).slice(0, 4);
  const unwatched = content.explainers.filter((e) => !state.watchedExplainerIds.includes(e.id)).slice(0, 4);
  const lessonsDone = Object.values(state.lessons).filter((l) => l.completed).length;
  const isNew = ready && lessonsDone === 0 && state.attempts.length === 0;

  // The two headline numbers settle into place as the stored progress loads,
  // rather than appearing fully formed.
  const readinessShown = useCountUp(readiness, 800);
  const xpShown = useCountUp(state.xp);

  /*
   * Weather leads with claims rather than with coverage.
   *
   * Readiness measures how much of the syllabus has been touched — the
   * publisher's view of the student. A claim is a sentence the app will stand
   * behind, earned by applied work and withdrawn when contradicted. Weather
   * goes first because it is examined on production as much as Navigation is:
   * three of its objectives use the word INTERPRET.
   *
   * Every other course keeps the readiness hero until this is proven out, which
   * is the point of changing one course rather than five.
   */
  const claims = claimsFor(activeCourse);
  const claimSummary = useMemo(
    () => (claims.length ? summariseClaims(evaluateClaims(content, state.attempts, claims)) : null),
    [claims, content, state.attempts],
  );

  return (
    <div className="space-y-6">
      {/* ---------------- Hero ---------------- */}
      {claimSummary ? (
        <ClaimsHero
          summary={claimSummary}
          courseName={meta.name}
          continueHref={flight.items[0]?.href ?? "/lessons"}
          isNew={isNew}
        />
      ) : (
      <InkCard className="relative overflow-hidden" padded={false}>
        <BackdropGrid />
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-5">
            <ProgressRing
              value={readiness / 100}
              size={104}
              stroke={10}
              tone={readiness >= 80 ? "go" : readiness >= 50 ? "brand" : "caution"}
              trackClassName="stroke-ink-600"
            >
              <span className="tabular text-[27px] font-extrabold leading-none text-white">
                {readinessShown}
                <span className="text-base">%</span>
              </span>
            </ProgressRing>
            <div>
              <p className="eyebrow text-[#8fb0d4]">{meta.name} readiness</p>
              <p className="mt-1 max-w-[15rem] text-[15px] font-semibold leading-snug text-white">
                {readiness >= 85
                  ? "Checkride ready. Hold the edge with exams."
                  : readiness >= 60
                    ? "Strong base. Attack the weak areas next."
                    : readiness > 0
                      ? "Momentum building. Keep the daily flight going."
                      : "Welcome aboard. Start with Unit 1."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:px-4">
            <StatTile ink label="Streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} tone={streak > 0 ? "caution" : "neutral"} />
            <StatTile ink label="XP" value={xpShown.toLocaleString()} hint={`Level ${level.level}`} tone="brand" />
            <StatTile ink label="Lessons" value={`${lessonsDone}/${stats.lessons}`} hint="completed" />
            <StatTile
              ink
              label="Mastered"
              value={Object.values(state.mastery).filter((m) => m.level >= 5).length}
              hint={`of ${stats.concepts} concepts`}
              tone="go"
            />
          </div>

          <div className="flex flex-col gap-2 lg:w-44">
            <ButtonLink href={flight.items[0]?.href ?? "/lessons"} variant="primary" size="lg" fullWidth>
              <Play size={17} fill="currentColor" />
              {isNew ? "Start flying" : "Continue"}
            </ButtonLink>
            <ButtonLink href="/exam" variant="ink" size="md" fullWidth>
              <ClipboardCheck size={16} />
              Practice exam
            </ButtonLink>
          </div>
        </div>
      </InkCard>
      )}

      {/* The stat row still belongs on a claims course; it is the streak and XP
          that motivate returning, and neither is a coverage metric. */}
      {claimSummary && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatTile label="Streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} tone={streak > 0 ? "caution" : "neutral"} />
          <StatTile label="XP" value={xpShown.toLocaleString()} hint={`Level ${level.level}`} tone="brand" />
          <StatTile label="Lessons" value={`${lessonsDone}/${stats.lessons}`} hint="completed" />
          <StatTile
            label="Applied"
            value={claimSummary.states.reduce((n, s) => n + s.have, 0)}
            hint="questions worked"
            tone="go"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* ---------------- Today's Flight ---------------- */}
          <section>
            <SectionHeading
              eyebrow="Your plan for today"
              title="Today's Flight"
              action={
                <Pill tone="brand">
                  <Clock size={12} /> {flight.totalMinutes} min
                </Pill>
              }
            />
            <ul className="space-y-2.5">
              {flight.items.map((item, i) => (
                <li key={`${item.kind}-${i}`}>
                  <Link
                    href={item.href}
                    className="card card-lift group flex items-center gap-4 p-4"
                  >
                    <FlightIcon kind={item.kind} index={i} art={item.art} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-navy">{item.title}</p>
                        <span className="tabular shrink-0 text-[11px] font-bold text-navy-faint">
                          {item.minutes} min
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[12.5px] leading-snug text-navy-soft">
                        {item.detail}
                      </p>
                      {item.meta && item.meta.length > 0 && (
                        <p className="mt-1.5 truncate text-[11px] font-medium text-navy-faint">
                          {item.meta.join(" · ")}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-navy-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------------- Unit readiness ---------------- */}
          <section>
            {/*
              On a claims course this list is navigation, not a verdict. Calling
              it "concept mastery" and "where you stand" would put the coverage
              metric back as an assessment of the student, two sections below the
              panel that exists to replace it. The bars still say what has been
              worked through, which is a fair thing for them to say.
            */}
            <SectionHeading
              eyebrow={claimSummary ? "Ground covered" : "Concept mastery by unit"}
              title={claimSummary ? "By unit" : "Where you stand"}
              action={
                <Link href="/lessons" className="text-[13px] font-semibold text-brand hover:underline">
                  Flight path
                </Link>
              }
            />
            <Card padded={false}>
              <ul className="divide-y divide-line">
                {units.map((u) => {
                  const unit = content.units.find((x) => x.id === u.unit)!;
                  const tone = UNIT_TONE[unit.accent];
                  return (
                    <li key={u.unit}>
                      <Link
                        href={`/lessons#${u.unit}`}
                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-2"
                      >
                        <span className="tabular w-7 shrink-0 text-[12px] font-bold text-navy-faint">
                          {String(unit.index).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="truncate text-[13.5px] font-semibold text-navy">{unit.title}</p>
                            <span className="tabular shrink-0 text-[13px] font-bold text-navy">
                              {u.readiness}%
                            </span>
                          </div>
                          <ProgressBar value={u.readiness / 100} tone={tone} height={6} className="mt-2" />
                          <p className="mt-1.5 text-[11px] text-navy-faint">
                            {u.lessonsCompleted}/{u.lessonsTotal} lessons · {u.conceptsMastered}/
                            {u.conceptsTotal} concepts mastered
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          {/* ---------------- Weak areas ---------------- */}
          <section>
            <SectionHeading
              eyebrow="Resurfaced automatically"
              title="Weak areas"
              action={
                <Link href="/review" className="text-[13px] font-semibold text-brand hover:underline">
                  Review
                </Link>
              }
            />
            {weak.length === 0 ? (
              <Card className="text-center">
                <TrendingUp size={22} className="mx-auto mb-2 text-go" />
                <p className="text-sm font-semibold text-navy">
                  {state.attempts.length === 0 ? "Nothing tracked yet" : "No weak concepts"}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-navy-soft">
                  {state.attempts.length === 0
                    ? "Answer a few questions and this fills with exactly what to fix."
                    : "Everything you have been tested on is at strong mastery or better."}
                </p>
              </Card>
            ) : (
              <Card padded={false}>
                <ul className="divide-y divide-line">
                  {weak.map((w) => (
                    <li key={w.concept.id}>
                      <Link
                        href={`/review/concept/${w.concept.id}`}
                        className="block px-4 py-3 transition-colors hover:bg-surface-2"
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="truncate text-[13.5px] font-semibold text-navy">
                            {w.concept.name}
                          </p>
                          <span
                            className={cn(
                              "tabular shrink-0 text-[13px] font-bold",
                              w.mastery < 40 ? "text-nogo" : "text-caution",
                            )}
                          >
                            {w.mastery}%
                          </span>
                        </div>
                        <ProgressBar
                          value={w.mastery / 100}
                          tone={w.mastery < 40 ? "nogo" : "caution"}
                          height={5}
                          className="mt-2"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          {w.due && <Pill tone="nogo" size="sm">Due</Pill>}
                          <span className="text-[11px] text-navy-faint">
                            {w.questionCount} question{w.questionCount === 1 ? "" : "s"} available
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          {/* ---------------- Explainers ---------------- */}
          <section>
            <SectionHeading
              eyebrow="60–120 seconds each"
              title="Quick visual explainers"
              action={
                <Link href="/explainers" className="text-[13px] font-semibold text-brand hover:underline">
                  All {content.explainers.length}
                </Link>
              }
            />
            <ul className="space-y-2">
              {unwatched.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/explainers/${e.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 transition-all hover:border-brand/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <Sparkles size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-semibold text-navy">{e.title}</p>
                      <p className="truncate text-[11.5px] text-navy-faint">{e.promise}</p>
                    </div>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-navy-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* ---------------- Achievements ---------------- */}
          {recentAwards.length > 0 && (
            <section>
              <SectionHeading
                eyebrow="Recent"
                title="Achievements"
                action={
                  <Link href="/profile" className="text-[13px] font-semibold text-brand hover:underline">
                    All
                  </Link>
                }
              />
              <Card>
                <ul className="space-y-3">
                  {recentAwards.map((a) => {
                    const def = achievementById(a.id);
                    if (!def) return null;
                    return (
                      <li key={a.id} className="flex items-center gap-3">
                        <AchievementIcon icon={def.icon} size={32} />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-navy">{def.name}</p>
                          <p className="truncate text-[11.5px] text-navy-faint">{def.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function FlightIcon({
  kind,
  index,
  art,
}: {
  kind: string;
  index: number;
  /** When the item is a specific lesson, its own diagram beats a generic icon. */
  art?: string;
}) {
  const map: Record<string, { tone: string; glyph: React.ReactNode }> = {
    spacedReview: { tone: "bg-caution-soft text-caution", glyph: <Clock size={17} /> },
    weakConcepts: { tone: "bg-nogo-soft text-nogo", glyph: <TrendingUp size={17} /> },
    newLesson: { tone: "bg-brand-soft text-brand", glyph: <Play size={16} fill="currentColor" /> },
    challenge: { tone: "bg-go-soft text-go", glyph: <ClipboardCheck size={17} /> },
    explainer: { tone: "bg-[var(--color-surface-3)] text-[var(--color-series-alt)]", glyph: <Sparkles size={16} /> },
  };
  const entry = map[kind] ?? map.newLesson;
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      <span className="tabular w-4 text-[11px] font-bold text-navy-faint">{index + 1}</span>
      <span
        className={cn(
          "flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-[1.06]",
          art ? "h-12 w-12 border border-brand/25" : "h-10 w-10",
          entry.tone,
        )}
      >
        {art ? <LessonIcon name={art} className="h-7 w-7" /> : entry.glyph}
      </span>
    </span>
  );
}

function BackdropGrid() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id="hero-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M34 0 L0 0 0 34" fill="none" stroke="#4d7cae" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-grid)" />
    </svg>
  );
}

