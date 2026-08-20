"use client";

/**
 * The flight path.
 *
 * A vertical, snaking route through the six units. Node states are read from
 * concept mastery, not just completion, so a lesson you passed but have since
 * gone weak on is visibly amber rather than quietly green.
 */

import Link from "next/link";
import { Check, Lock, Play, Star } from "lucide-react";
import type { Lesson, Unit } from "@/lib/types";
import type { LessonNodeState } from "@/lib/review";
import { LessonIcon } from "./lesson-icon";
import { Pill, cn } from "./ui";

const NODE_STYLES: Record<
  LessonNodeState,
  { ring: string; fill: string; icon: string; label: string; tone: string }
> = {
  locked: {
    ring: "border-line",
    fill: "bg-surface-2",
    icon: "text-navy-faint",
    label: "Locked",
    tone: "text-navy-faint",
  },
  current: {
    ring: "border-brand",
    fill: "bg-brand",
    icon: "text-white",
    label: "Start",
    tone: "text-brand",
  },
  completed: {
    ring: "border-go",
    fill: "bg-go-soft",
    icon: "text-go",
    label: "Complete",
    tone: "text-go",
  },
  perfect: {
    ring: "border-go",
    fill: "bg-go",
    icon: "text-white",
    label: "Perfect",
    tone: "text-go",
  },
  mastered: {
    ring: "border-gold",
    fill: "bg-gold-soft",
    icon: "text-gold",
    label: "Mastered",
    tone: "text-gold",
  },
  weak: {
    ring: "border-caution",
    fill: "bg-caution-soft",
    icon: "text-caution",
    label: "Needs review",
    tone: "text-caution",
  },
};

const UNIT_ACCENT: Record<Unit["accent"], string> = {
  brand: "var(--color-brand)",
  go: "var(--color-go)",
  caution: "var(--color-caution)",
  violet: "var(--color-series-alt)",
  navy: "var(--color-navy)",
  nogo: "var(--color-nogo)",
};

export function LessonMap({
  units,
  lessons,
  states,
  readinessByUnit,
}: {
  units: Unit[];
  lessons: Lesson[];
  states: Record<string, LessonNodeState>;
  readinessByUnit: Record<string, number>;
}) {
  return (
    <div className="space-y-10">
      {units.map((unit) => {
        const unitLessons = lessons
          .filter((l) => l.unit === unit.id)
          .sort((a, b) => a.index - b.index);
        const done = unitLessons.filter((l) =>
          ["completed", "perfect", "mastered", "weak"].includes(states[l.id]),
        ).length;

        return (
          <section key={unit.id} id={unit.id} className="scroll-mt-20">
            <UnitHeader
              unit={unit}
              done={done}
              total={unitLessons.length}
              readiness={readinessByUnit[unit.id] ?? 0}
            />
            <ol className="relative mt-5">
              {unitLessons.map((lesson, i) => (
                <MapNode
                  key={lesson.id}
                  lesson={lesson}
                  state={states[lesson.id] ?? "locked"}
                  side={i % 2 === 0 ? "left" : "right"}
                  isLast={i === unitLessons.length - 1}
                  accent={UNIT_ACCENT[unit.accent]}
                />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function UnitHeader({
  unit,
  done,
  total,
  readiness,
}: {
  unit: Unit;
  done: number;
  total: number;
  readiness: number;
}) {
  const accent = UNIT_ACCENT[unit.accent];
  return (
    <div
      className="rounded-2xl border border-line bg-surface p-4 sm:p-5"
      style={{ borderLeftWidth: 4, borderLeftColor: accent }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow" style={{ color: accent }}>
            Unit {unit.index} · {unit.subtitle}
          </p>
          <h2 className="mt-1 text-xl text-navy">{unit.title}</h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-navy-soft">
            {unit.promise}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Pill tone="neutral">
            {done}/{total} lessons
          </Pill>
          <Pill tone={readiness >= 80 ? "go" : readiness >= 40 ? "brand" : "neutral"}>
            {readiness}% mastery
          </Pill>
        </div>
      </div>
    </div>
  );
}

function MapNode({
  lesson,
  state,
  side,
  isLast,
  accent,
}: {
  lesson: Lesson;
  state: LessonNodeState;
  side: "left" | "right";
  isLast: boolean;
  accent: string;
}) {
  const style = NODE_STYLES[state];
  const locked = state === "locked";
  const content = (
    <div
      className={cn(
        "flex items-center gap-4",
        side === "right" && "sm:flex-row-reverse sm:text-right",
      )}
    >
      <div className="relative shrink-0">
        <span
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl border-[2.5px] transition-transform",
            style.ring,
            style.fill,
            !locked && "group-hover:scale-[1.04]",
          )}
        >
          <LessonIcon name={lesson.mapIcon} className={cn("h-8 w-8", style.icon)} />
        </span>
        <span
          className={cn(
            "absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-canvas",
            state === "locked" && "bg-surface-3 text-navy-faint",
            state === "current" && "bg-brand text-white",
            state === "completed" && "bg-go text-white",
            state === "perfect" && "bg-go text-white",
            state === "mastered" && "bg-gold text-white",
            state === "weak" && "bg-caution text-white",
          )}
        >
          {state === "locked" && <Lock size={11} strokeWidth={3} />}
          {state === "current" && <Play size={11} fill="currentColor" />}
          {(state === "completed" || state === "weak") && <Check size={12} strokeWidth={3.5} />}
          {(state === "mastered" || state === "perfect") && (
            <Star size={11} fill="currentColor" strokeWidth={0} />
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            side === "right" && "sm:justify-end",
          )}
        >
          <span className="tabular text-[11px] font-bold text-navy-faint">
            {String(lesson.index).padStart(2, "0")}
          </span>
          <span className={cn("text-[11px] font-bold uppercase tracking-wide", style.tone)}>
            {style.label}
          </span>
          <span className="tabular text-[11px] font-semibold text-navy-faint">
            {lesson.estimatedMinutes} min
          </span>
        </div>
        <p
          className={cn(
            "mt-0.5 text-[15.5px] font-semibold leading-snug",
            locked ? "text-navy-faint" : "text-navy",
          )}
        >
          {lesson.title}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-navy-soft">{lesson.subtitle}</p>
      </div>
    </div>
  );

  return (
    <li className="relative pb-6 last:pb-0">
      {!isLast && (
        <span
          className="absolute left-8 top-16 h-full w-0.5 -translate-x-1/2 sm:left-1/2"
          style={{
            backgroundImage: `repeating-linear-gradient(to bottom, ${accent}55 0 6px, transparent 6px 12px)`,
          }}
          aria-hidden
        />
      )}
      <div
        className={cn(
          "relative sm:w-[calc(50%+2rem)]",
          side === "right" && "sm:ml-auto",
        )}
      >
        {locked ? (
          <div className="group cursor-not-allowed rounded-2xl border border-line bg-surface/60 p-3 opacity-70">
            {content}
          </div>
        ) : (
          <Link
            href={`/lessons/${lesson.id}`}
            className="group block rounded-2xl border border-line bg-surface p-3 transition-all hover:border-brand/40 hover:shadow-sm"
          >
            {content}
          </Link>
        )}
      </div>
    </li>
  );
}
