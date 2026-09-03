"use client";

/**
 * Home.
 *
 * Three questions, in priority order: where am I, what do I do next, am I
 * making progress. Everything else is secondary and is allowed to be quiet.
 *
 * The hero deliberately carries only readiness, streak and level. Lessons
 * completed and concepts mastered are real numbers but they are review
 * material, not motivation, so they live on the profile where a student goes
 * to study their own record rather than on the screen they open to start
 * work. The daily flight leads with one elevated card because a plan with
 * four equal rows is not a plan, it is a menu.
 */

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Flame,
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
import { LessonIcon } from "@/components/lesson-icon";
import { useCountUp } from "@/components/reward";
import { ClaimsHero } from "@/components/claims-hero";
import { claimsFor, evaluateClaims, summariseClaims } from "@/lib/claims";
import { NavDeskDashboard } from "@/components/nav/desk-dashboard";
import { hasClick } from "@/content/click";
import { MakeItClick } from "@/components/click/trigger";

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
  const { id: activeCourse, content, meta } = useCourse();
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
  const weak = weakConcepts(content.concepts, content.questions, state.mastery, now, { limit: 3 });
  const unwatched = content.explainers.filter((e) => !state.watchedExplainerIds.includes(e.id)).slice(0, 3);
  const lessonsDone = Object.values(state.lessons).filter((l) => l.completed).length;
  const isNew = ready && lessonsDone === 0 && state.attempts.length === 0;

  const readinessShown = useCountUp(readiness, 800);
  const xpShown = useCountUp(state.xp);

  /*
   * Weather leads with claims rather than with coverage.
   *
   * Readiness measures how much of the syllabus has been touched — the
   * publisher's view of the student. A claim is a sentence the app will stand
   * behind, earned by applied work and withdrawn when contradicted.
   */
  const claims = claimsFor(activeCourse);
  const claimSummary = useMemo(
    () => (claims.length ? summariseClaims(evaluateClaims(content, state.attempts, claims)) : null),
    [claims, content, state.attempts],
  );

  const continueHref = flight.items[0]?.href ?? "/lessons";
  const [lead, ...rest] = flight.items;

  return (
    <div className="space-y-7">
      {/* ---------------- Hero ---------------- */}
      {claimSummary ? (
        <>
          <ClaimsHero
            summary={claimSummary}
            courseName={meta.name}
            continueHref={continueHref}
            isNew={isNew}
          />
          {/* Streak and XP are what bring a student back. Coverage counts are
              not, so they stay on the profile. */}
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Streak" value={`${streak}`} hint={streak === 1 ? "day" : "days"} tone={streak > 0 ? "caution" : "neutral"} />
            <StatTile label="XP" value={xpShown.toLocaleString()} hint={`Level ${level.level}`} tone="brand" />
          </div>
        </>
      ) : (
        <InkCard className="relative overflow-hidden" padded={false}>
          <BackdropGrid />
          <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-5">
              <ProgressRing
                value={readiness / 100}
                size={96}
                stroke={9}
                tone={readiness >= 80 ? "go" : readiness >= 50 ? "brand" : "caution"}
                trackClassName="stroke-ink-600"
              >
                <span className="tabular text-[26px] font-extrabold leading-none text-white">
                  {readinessShown}
                  <span className="text-[15px]">%</span>
                </span>
              </ProgressRing>
              <div className="min-w-0">
                <p className="eyebrow text-[#8fb0d4]">{meta.name}</p>
                <p className="mt-1 max-w-[17rem] text-[17px] font-bold leading-snug text-white">
                  {readiness >= 85
                    ? "Checkride ready. Hold the edge."
                    : readiness >= 60
                      ? "Strong base. Attack the weak areas."
                      : readiness > 0
                        ? "Momentum building. Keep it going."
                        : "Welcome aboard. Start with Unit 1."}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <InkChip tone={streak > 0 ? "caution" : "neutral"}>
                    <Flame size={13} />
                    {streak} day{streak === 1 ? "" : "s"}
                  </InkChip>
                  <InkChip>Level {level.level}</InkChip>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2.5 sm:w-48">
              <ButtonLink href={continueHref} variant="primary" size="lg" fullWidth>
                <Play size={17} fill="currentColor" />
                {isNew ? "Start flying" : "Continue"}
              </ButtonLink>
              <Link
                href="/exam"
                className="text-center text-[12.5px] font-semibold text-[#8fb0d4] transition-colors hover:text-white"
              >
                Practice exam
              </Link>
            </div>
          </div>
        </InkCard>
      )}

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-7">
          {/* ---------------- Today's Flight ---------------- */}
          <section>
            <SectionHeading
              title="Today's flight"
              action={
                <Pill tone="brand">
                  <Clock size={12} /> {flight.totalMinutes} min
                </Pill>
              }
            />

            {/* The first item is the plan. The rest are what follows it, and
                they are styled to say so. */}
            {lead && (
              <Link
                href={lead.href}
                className="card card-lift group mb-2.5 flex items-center gap-4 border-brand/30 bg-brand-soft/40 p-4 sm:p-5"
              >
                <FlightIcon kind={lead.kind} art={lead.art} lead />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-bold text-navy">{lead.title}</p>
                  <p className="mt-0.5 truncate text-[13px] leading-snug text-navy-soft">
                    {lead.detail}
                  </p>
                </div>
                <span className="tabular shrink-0 text-[12px] font-bold text-brand">
                  {lead.minutes} min
                </span>
                <ChevronRight
                  size={19}
                  className="shrink-0 text-brand transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            )}

            {rest.length > 0 && (
              <Card padded={false}>
                <ul className="divide-y divide-line">
                  {rest.map((item, i) => (
                    <li key={`${item.kind}-${i}`}>
                      <Link
                        href={item.href}
                        className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-surface-2"
                      >
                        <FlightIcon kind={item.kind} art={item.art} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14.5px] font-semibold text-navy">{item.title}</p>
                          <p className="truncate text-[12.5px] leading-snug text-navy-soft">
                            {item.detail}
                          </p>
                        </div>
                        <span className="tabular shrink-0 text-[12px] font-semibold text-navy-faint">
                          {item.minutes} min
                        </span>
                        <ChevronRight
                          size={17}
                          className="shrink-0 text-navy-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>

          {/* ---------------- Unit readiness ---------------- */}
          <section>
            <SectionHeading
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
                  return (
                    <li key={u.unit}>
                      <Link
                        href={`/lessons#${u.unit}`}
                        className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2"
                      >
                        <span className="tabular w-6 shrink-0 text-[12px] font-bold text-navy-faint">
                          {String(unit.index).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <p className="truncate text-[14.5px] font-semibold text-navy">{unit.title}</p>
                            <span className="tabular shrink-0 text-[13px] font-bold text-navy">
                              {u.readiness}%
                            </span>
                          </div>
                          <ProgressBar value={u.readiness / 100} tone="brand" height={6} className="mt-2" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </section>
        </div>

        <div className="min-w-0 space-y-7">
          {/* ---------------- Weak areas ---------------- */}
          {/*
            Make It Click lives here rather than in a section of its own: it is
            most useful exactly where a concept is already flagged as weak.
            The full assessment view is one tap away under Review, so this is
            a teaser with a single way in, not a dashboard.
          */}
          <section>
            <SectionHeading title="Weak areas" />
            {weak.length === 0 ? (
              <Card className="text-center">
                <TrendingUp size={22} className="mx-auto mb-2 text-go" />
                <p className="text-sm font-semibold text-navy">
                  {state.attempts.length === 0 ? "Nothing tracked yet" : "No weak concepts"}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-navy-soft">
                  {state.attempts.length === 0
                    ? "Answer a few questions and this fills with exactly what to fix."
                    : "Everything you have been tested on is at strong mastery or better."}
                </p>
              </Card>
            ) : (
              <Card padded={false}>
                <ul className="divide-y divide-line">
                  {weak.map((w) => (
                    <li
                      key={w.concept.id}
                      className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <Link href={`/review/concept/${w.concept.id}`} className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                        <p className="truncate text-[14.5px] font-semibold text-navy">
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
                      </Link>
                      {hasClick(w.concept.id) && (
                        <MakeItClick conceptId={w.concept.id} variant="inline" className="shrink-0" />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line p-3">
                  <ButtonLink href="/review" variant="secondary" size="md" fullWidth>
                    Review weak areas
                  </ButtonLink>
                </div>
              </Card>
            )}
          </section>

          {/* ---------------- Explainers ---------------- */}
          <section>
            <SectionHeading
              title="Quick explainers"
              action={
                <Link href="/explainers" className="text-[13px] font-semibold text-brand hover:underline">
                  All {content.explainers.length}
                </Link>
              }
            />
            <ul className="space-y-2.5">
              {unwatched.map((e) => {
                const lesson = content.lessons.find((l) => l.id === e.lessonId);
                return (
                  <li key={e.id}>
                    <Link
                      href={`/explainers/${e.id}`}
                      className="card card-lift group flex items-center gap-3.5 p-3.5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        {lesson?.mapIcon ? (
                          <LessonIcon name={lesson.mapIcon} className="h-6 w-6" />
                        ) : (
                          <Sparkles size={18} />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-semibold text-navy">{e.title}</p>
                        <p className="truncate text-[12.5px] text-navy-soft">{e.promise}</p>
                      </div>
                      <ArrowRight
                        size={16}
                        className="shrink-0 text-navy-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

/** A small inline stat for the hero, where a full StatTile would be too loud. */
function InkChip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "caution";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold",
        tone === "caution"
          ? "bg-caution/20 text-[#ffc46b]"
          : "bg-white/10 text-[#c5d8ec]",
      )}
    >
      {children}
    </span>
  );
}

function FlightIcon({
  kind,
  art,
  lead = false,
}: {
  kind: string;
  /** When the item is a specific lesson, its own diagram beats a generic icon. */
  art?: string;
  /** The lead item's icon is larger, matching its promotion to primary action. */
  lead?: boolean;
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
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-[1.06]",
        lead ? "h-14 w-14" : "h-10 w-10",
        // A lesson's own diagram sits on a plain surface so the artwork reads;
        // a generic glyph keeps the tinted tile that identifies its kind.
        art ? "border border-brand/25 bg-surface text-brand" : entry.tone,
      )}
    >
      {art ? <LessonIcon name={art} className={lead ? "h-8 w-8" : "h-6 w-6"} /> : entry.glyph}
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
