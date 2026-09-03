"use client";

/**
 * Home.
 *
 * Three questions, in priority order: where am I, what do I do next, am I
 * making progress. Everything else is secondary and is allowed to be quiet.
 *
 * The hero carries the four numbers that answer "is coming back today worth
 * it" — readiness, streak, XP and level — as one strip on a single surface
 * rather than four boxed tiles. Coverage counts (lessons completed, concepts
 * mastered) are review material rather than motivation, so they stay on the
 * profile. The daily flight leads with one elevated card because a plan with
 * four equal rows is not a plan, it is a menu.
 *
 * On the gamification: streak, XP, level and a single reachable daily goal
 * earn their place because each one is a real measure of work done. The
 * layer past that in the reference designs — chests, timed daily rewards,
 * "top 12% of trainees" — is deliberately absent. Two of those would require
 * inventing data the app does not have, and all of them reward opening the
 * app rather than learning anything.
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
  Star,
  TrendingUp,
} from "lucide-react";

import { buildDailyFlight, overallReadiness, unitReadiness, weakConcepts } from "@/lib/review";
import { DAILY_LESSON_GOAL, levelFromXp, lessonsCompletedToday, liveStreak, rankForLevel } from "@/lib/xp";
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
import { SkyBackdrop } from "@/components/sky";
import { WingGlyph } from "@/components/route-marker";
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

  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const doneToday = lessonsCompletedToday(state.lessons, now);

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
          <SkyBackdrop />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                {/* No display name is stored — only a sign-in email — and
                    guessing a first name from an address gets it wrong more
                    often than not, so the greeting stands on its own. */}
                <p className="text-[13.5px] font-semibold text-[#a9c2da]">{greeting}</p>
                <h1 className="mt-1 text-[30px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[34px]">
                  {isNew ? "Ready for takeoff?" : "Ready to keep climbing?"}
                </h1>
                <p className="mt-2 max-w-sm text-[14.5px] leading-snug text-[#bed2e6]">
                  {readiness >= 85
                    ? "Checkride ready. Hold the edge with exams."
                    : readiness >= 60
                      ? "Strong base. Attack the weak areas next."
                      : readiness > 0
                        ? "You're making progress. Let's keep going."
                        : "Welcome aboard. Start with Unit 1."}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <ButtonLink href={continueHref} variant="primary" size="lg">
                    <Play size={17} fill="currentColor" />
                    {isNew ? "Start flying" : "Continue"}
                  </ButtonLink>
                  <Link
                    href="/exam"
                    className="flex h-13 items-center gap-2 rounded-xl border border-white/20 px-5 text-[14.5px] font-bold text-white transition-colors hover:bg-white/10"
                  >
                    <ClipboardCheck size={16} />
                    Exam
                  </Link>
                </div>
              </div>
            </div>

            {/*
              The four numbers live back inside the hero.
              Readiness alone answered "where am I" but said nothing about
              whether coming back today was worth it, which is what streak, XP
              and level are for. They are a strip rather than four boxed
              tiles: one surface, hairline dividers, no card apiece.
            */}
            {/* Opaque enough to hold its own contrast whatever the sky is
                doing behind it — the cloud bank sits at exactly this height. */}
            <div className="mt-7 grid grid-cols-2 gap-y-5 rounded-2xl bg-ink-900/70 p-4 ring-1 ring-inset ring-white/10 backdrop-blur-md sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-white/10">
              <div className="flex items-center gap-3 sm:pr-4">
                <ProgressRing
                  value={readiness / 100}
                  size={54}
                  stroke={6}
                  tone={readiness >= 80 ? "go" : readiness >= 50 ? "brand" : "caution"}
                  trackClassName="stroke-white/15"
                >
                  <span className="tabular text-[14px] font-extrabold leading-none text-white">
                    {readinessShown}
                  </span>
                </ProgressRing>
                <div className="min-w-0">
                  <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#8fb0d4]">
                    Readiness
                  </p>
                  <p className="mt-0.5 text-[12.5px] font-semibold leading-tight text-white">
                    {meta.name}
                  </p>
                </div>
              </div>

              <HeroStat
                icon={<Flame size={17} className="text-caution" fill="currentColor" strokeWidth={0} />}
                label="Streak"
                value={`${streak}`}
                hint={streak === 1 ? "day" : "days"}
              />
              <HeroStat
                icon={<Star size={17} className="text-gold" fill="currentColor" strokeWidth={0} />}
                label="XP"
                value={xpShown.toLocaleString()}
                hint="points"
              />
              <HeroStat
                icon={<WingGlyph className="h-[17px] w-[17px] text-brand-light" />}
                label="Level"
                value={`${level.level}`}
                hint={rankForLevel(level.level)}
              />
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
          {/* ---------------- Daily goal ---------------- */}
          {/*
            One goal, real numbers, no prize attached. A small target that is
            actually reachable is the part of a daily streak that works; the
            chests and timed rewards around it are the part that turns a
            training tool into a slot machine.
          */}
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[15px] font-extrabold text-navy">Daily goal</p>
                <p className="mt-0.5 text-[13px] text-navy-soft">
                  {doneToday >= DAILY_LESSON_GOAL
                    ? "Done for today. Anything more is a bonus."
                    : `Complete ${DAILY_LESSON_GOAL} lessons`}
                </p>
              </div>
              <span
                className={cn(
                  "tabular shrink-0 rounded-full px-2.5 py-1 text-[12.5px] font-extrabold",
                  doneToday >= DAILY_LESSON_GOAL ? "bg-go-soft text-go" : "bg-brand-soft text-brand",
                )}
              >
                {Math.min(doneToday, DAILY_LESSON_GOAL)} / {DAILY_LESSON_GOAL}
              </span>
            </div>
            <ProgressBar
              value={Math.min(1, doneToday / DAILY_LESSON_GOAL)}
              tone={doneToday >= DAILY_LESSON_GOAL ? "go" : "brand"}
              height={9}
              className="mt-3"
            />
          </Card>

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

/** One cell of the hero's stat strip: icon, label, big number, unit. */
function HeroStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="min-w-0 sm:px-4">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-[#8fb0d4]">
          {label}
        </p>
      </div>
      <p className="tabular mt-0.5 text-[22px] font-extrabold leading-none text-white">{value}</p>
      <p className="mt-0.5 text-[11.5px] font-semibold text-[#8fb0d4]">{hint}</p>
    </div>
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
