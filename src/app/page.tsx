"use client";

/**
 * The entry point.
 *
 * Deliberately course-agnostic. Nothing here reads the active course's
 * lessons, weak concepts or unit standing — a student arriving at WingBrief is
 * choosing which course to fly, not already inside one. Everything scoped to a
 * single course lives at /course, which is where picking a card lands you.
 *
 * That means the numbers on this screen are platform numbers: readiness
 * averaged across all five courses, lessons and concepts totalled across all
 * five, and a daily goal counted across all five. Streak, XP, level and
 * achievements were always platform-level — they live on the stored document
 * rather than in any course bucket.
 */

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Play, Star, Trophy } from "lucide-react";

import { DAILY_LESSON_GOAL, dayKey, levelFromXp, liveStreak, rankForLevel } from "@/lib/xp";
import { achievementById } from "@/lib/xp";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import {
  ButtonLink,
  Card,
  InkCard,
  ProgressBar,
  ProgressRing,
  SectionHeading,
  cn,
} from "@/components/ui";
import { CourseGrid, useCourseRows } from "@/components/course-grid";
import { AchievementIcon } from "@/components/achievement-icon";
import { StreakWeek } from "@/components/streak-week";
import { SkyBackdrop } from "@/components/sky";
import { WingGlyph } from "@/components/route-marker";
import { useCountUp } from "@/components/reward";

export default function EntryPage() {
  const { state, exportState } = useProgress();
  const { meta } = useCourse();
  const now = Date.now();

  const rows = useCourseRows();
  const stored = exportState();

  const streak = liveStreak(state.streak, now);
  const level = levelFromXp(state.xp);

  const totals = useMemo(
    () => ({
      lessonsDone: rows.reduce((n, r) => n + r.lessonsDone, 0),
      lessonsTotal: rows.reduce((n, r) => n + r.lessonsTotal, 0),
      conceptsMastered: rows.reduce((n, r) => n + r.conceptsMastered, 0),
      conceptsTotal: rows.reduce((n, r) => n + r.conceptsTotal, 0),
      started: rows.filter((r) => r.lessonsDone > 0).length,
    }),
    [rows],
  );

  const platformReadiness = useMemo(
    () => (rows.length === 0 ? 0 : Math.round(rows.reduce((n, r) => n + r.readiness, 0) / rows.length)),
    [rows],
  );

  /*
   * The daily goal counts every course, not just the open one. Studying
   * Weather in the morning and Engines at night is two lessons toward the
   * day's goal, and a per-course count would have thrown one of them away.
   */
  const doneToday = useMemo(() => {
    const today = dayKey(now);
    return Object.values(stored.courses).reduce(
      (n, bucket) =>
        n +
        Object.values(bucket?.lessons ?? {}).filter(
          (l) => l.completed && l.lastCompletedAt !== null && dayKey(l.lastCompletedAt) === today,
        ).length,
      0,
    );
  }, [stored, now]);

  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const isNew = totals.lessonsDone === 0;

  const readinessShown = useCountUp(platformReadiness, 800);
  const xpShown = useCountUp(state.xp);

  const recentAwards = [...state.achievements].sort((a, b) => b.unlockedAt - a.unlockedAt).slice(0, 4);

  return (
    <div className="space-y-7">
      {/* ---------------- Hero ---------------- */}
      <InkCard className="relative overflow-hidden" padded={false}>
        <SkyBackdrop />
        <div className="relative p-6 sm:p-8">
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-[#a9c2da]">{greeting}</p>
            <h1 className="mt-1 text-[30px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[34px]">
              {isNew ? "Ready for takeoff?" : "Where are we flying today?"}
            </h1>
            <p className="mt-2 max-w-md text-[14.5px] leading-snug text-[#bed2e6]">
              {isNew
                ? "Five courses, one journey. Pick one below and start with Unit 1."
                : `Five courses, one journey. ${totals.started} under way.`}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <ButtonLink href="/course" variant="primary" size="lg">
                <Play size={17} fill="currentColor" />
                {isNew ? `Start ${meta.name}` : `Continue ${meta.name}`}
              </ButtonLink>
              <a
                href="#courses"
                className="flex h-13 items-center gap-2 rounded-xl border border-white/20 px-5 text-[14.5px] font-bold text-white transition-colors hover:bg-white/10"
              >
                All courses
                <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-y-5 rounded-2xl bg-ink-900/70 p-4 ring-1 ring-inset ring-white/10 backdrop-blur-md sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-white/10">
            <div className="flex items-center gap-3 sm:pr-4">
              <ProgressRing
                value={platformReadiness / 100}
                size={54}
                stroke={6}
                tone={platformReadiness >= 80 ? "go" : platformReadiness >= 50 ? "brand" : "caution"}
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
                  all courses
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

      {/* ---------------- The five courses ---------------- */}
      <section id="courses" className="scroll-mt-6">
        <SectionHeading
          title="Your courses"
          action={
            <span className="tabular text-[13px] font-semibold text-navy-soft">
              {totals.lessonsDone}/{totals.lessonsTotal} lessons · {totals.conceptsMastered}/
              {totals.conceptsTotal} concepts
            </span>
          }
        />
        <CourseGrid rows={rows} />
      </section>

      {/* ---------------- Platform progress ---------------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-extrabold text-navy">Daily goal</p>
              <p className="mt-0.5 text-[13px] text-navy-soft">
                {doneToday >= DAILY_LESSON_GOAL
                  ? "Done for today. Anything more is a bonus."
                  : `Complete ${DAILY_LESSON_GOAL} lessons, any course`}
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

        <Card>
          <StreakWeek history={state.streak.history} current={streak} />
          {state.streak.longest > streak && (
            <p className="mt-2 text-[11.5px] font-semibold text-navy-faint">
              Best run: {state.streak.longest} days
            </p>
          )}
        </Card>

        <Card padded={false} className="flex flex-col">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="flex items-center gap-2 text-[14px] font-extrabold text-navy">
              <Trophy size={15} className="text-gold" />
              Achievements
            </p>
            <Link
              href="/profile"
              className="text-[12.5px] font-semibold text-brand hover:underline"
            >
              All
            </Link>
          </div>
          {recentAwards.length === 0 ? (
            <p className="px-4 py-4 text-[13px] leading-relaxed text-navy-soft">
              Finish a lesson to earn your first.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-3 px-4 py-3.5">
              {recentAwards.map((a) => {
                const def = achievementById(a.id);
                if (!def) return null;
                return (
                  <li key={a.id} className="flex items-center gap-2">
                    <AchievementIcon icon={def.icon} size={30} />
                    <span className="text-[12.5px] font-semibold text-navy">{def.name}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
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
