"use client";

/**
 * The flight path.
 *
 * A snaking route through the six units. Node states are read from concept
 * mastery, not just completion, so a lesson you passed but have since gone
 * weak on is visibly amber rather than quietly green.
 *
 * The connecting line is a real curve threaded through the measured centre of
 * every node rather than a straight rule behind them, so the route reads as one
 * continuous path. Segments already flown are drawn solid in the unit accent;
 * the rest stay faint, which turns the spine itself into a progress bar.
 */

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, FastForward, Lock, Play, Star, TriangleAlert } from "lucide-react";
import type { Lesson, Unit } from "@/lib/types";
import type { LessonNodeState } from "@/lib/review";
import { LessonIcon } from "./lesson-icon";
import { Pill, cn } from "./ui";

const FLOWN: LessonNodeState[] = ["completed", "perfect", "mastered", "weak"];

const UNIT_ACCENT: Record<Unit["accent"], string> = {
  brand: "var(--color-brand)",
  go: "var(--color-go)",
  caution: "var(--color-caution)",
  violet: "var(--color-series-alt)",
  navy: "var(--color-navy)",
  nogo: "var(--color-nogo)",
};

/**
 * Per-state presentation. Locked nodes still show their diagram — a wall of
 * grey padlocks tells a student nothing about what is coming.
 */
const NODE_STYLES: Record<
  LessonNodeState,
  { tile: string; art: string; badge: string; label: string; tone: string; size: number }
> = {
  locked: {
    tile: "border-line bg-surface-2 border-dashed",
    art: "text-navy-faint opacity-60",
    badge: "bg-surface-3 text-navy-faint",
    label: "Locked",
    tone: "text-navy-faint",
    size: 66,
  },
  current: {
    tile: "border-brand bg-brand shadow-[0_10px_28px_-10px_var(--color-brand)]",
    art: "text-white",
    badge: "bg-white text-brand",
    label: "Start here",
    tone: "text-brand",
    size: 86,
  },
  completed: {
    tile: "border-go/45 bg-go-soft",
    art: "text-go",
    badge: "bg-go text-white",
    label: "Complete",
    tone: "text-go",
    size: 72,
  },
  perfect: {
    tile: "border-go bg-go shadow-[0_8px_22px_-12px_var(--color-go)]",
    art: "text-white",
    badge: "bg-white text-go",
    label: "Perfect",
    tone: "text-go",
    size: 72,
  },
  mastered: {
    tile: "border-gold/55 bg-gold-soft shadow-[0_8px_22px_-12px_var(--color-gold)]",
    art: "text-gold",
    badge: "bg-gold text-white",
    label: "Mastered",
    tone: "text-gold",
    size: 74,
  },
  weak: {
    tile: "border-caution/50 bg-caution-soft",
    art: "text-caution",
    badge: "bg-caution text-white",
    label: "Needs review",
    tone: "text-caution",
    size: 72,
  },
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
    <div className="space-y-8">
      {units.map((unit) => {
        const unitLessons = lessons
          .filter((l) => l.unit === unit.id)
          .sort((a, b) => a.index - b.index);
        const done = unitLessons.filter((l) => FLOWN.includes(states[l.id])).length;
        const accent = UNIT_ACCENT[unit.accent];

        return (
          <section
            key={unit.id}
            id={unit.id}
            className="scroll-mt-20 overflow-hidden rounded-3xl border border-line shadow-[0_1px_2px_rgba(13,28,46,0.04),0_12px_28px_-20px_rgba(13,28,46,0.28)]"
            style={{
              // A whisper of the unit's colour, so the six sections read as
              // distinct chapters without turning into a paint chart.
              background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 5%, var(--color-surface)) 0%, var(--color-surface) 190px)`,
            }}
          >
            <UnitHeader
              unit={unit}
              accent={accent}
              done={done}
              total={unitLessons.length}
              readiness={readinessByUnit[unit.id] ?? 0}
            />
            <UnitTrack
              lessons={unitLessons}
              states={states}
              accent={accent}
            />
          </section>
        );
      })}
    </div>
  );
}

function UnitHeader({
  unit,
  accent,
  done,
  total,
  readiness,
}: {
  unit: Unit;
  accent: string;
  done: number;
  total: number;
  readiness: number;
}) {
  return (
    <div className="border-b border-line/70 px-4 pb-4 pt-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3.5">
          <span
            className="tabular mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[15px] font-extrabold text-white"
            style={{ backgroundColor: accent }}
          >
            {String(unit.index).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="eyebrow" style={{ color: accent }}>
              {unit.subtitle}
            </p>
            <h2 className="mt-0.5 text-xl leading-tight text-navy">{unit.title}</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-navy-soft">
              {unit.promise}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Pill tone="neutral">
            {done}/{total} lessons
          </Pill>
          <Pill tone={readiness >= 80 ? "go" : readiness >= 40 ? "brand" : "neutral"}>
            {readiness}% mastery
          </Pill>
          <Link
            href={`/exam?mode=unit&unit=${unit.id}`}
            className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11.5px] font-semibold text-navy-soft transition-colors hover:border-brand/40 hover:text-brand"
            title="Already know this unit? Take its exam to test out."
          >
            <FastForward size={12} />
            Test out
          </Link>
        </div>
      </div>
    </div>
  );
}

/** A measured node centre, in the track's own coordinate space. */
interface Point {
  x: number;
  y: number;
}

function UnitTrack({
  lessons,
  states,
  accent,
}: {
  lessons: Lesson[];
  states: Record<string, LessonNodeState>;
  accent: string;
}) {
  const trackRef = useRef<HTMLOListElement | null>(null);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduceMotion = useReducedMotion();

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const box = track.getBoundingClientRect();
    const next: Point[] = [];
    for (const node of nodeRefs.current) {
      if (!node) continue;
      const r = node.getBoundingClientRect();
      next.push({
        x: r.left - box.left + r.width / 2,
        y: r.top - box.top + r.height / 2,
      });
    }
    setPoints(next);
    setSize({ w: box.width, h: box.height });
  }, []);

  // Layout effect so the spine is drawn in the same frame the nodes land,
  // rather than flashing in a beat later.
  useLayoutEffect(() => {
    measure();
  }, [measure, lessons.length, states]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <div className="relative px-4 py-6 sm:px-6">
      {/* Capped and centred: at full width the snake stretches so wide that
          consecutive lessons stop reading as one route. */}
      <ol ref={trackRef} className="relative mx-auto max-w-3xl">
        {points.length > 1 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${size.w} ${size.h}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {points.slice(0, -1).map((_from, i) => {
              const flown = FLOWN.includes(states[lessons[i]?.id]);
              return (
                <motion.path
                  key={i}
                  d={curveBetween(points, i)}
                  fill="none"
                  stroke={flown ? accent : "var(--color-line-strong)"}
                  strokeWidth={flown ? 3 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray={flown ? undefined : "1 9"}
                  opacity={flown ? 0.85 : 0.75}
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.05 * i, ease: "easeOut" }}
                />
              );
            })}
          </svg>
        )}

        {lessons.map((lesson, i) => (
          <MapNode
            key={lesson.id}
            lesson={lesson}
            state={states[lesson.id] ?? "locked"}
            side={i % 2 === 0 ? "left" : "right"}
            index={i}
            reduceMotion={Boolean(reduceMotion)}
            tileRef={(el) => {
              nodeRefs.current[i] = el;
            }}
          />
        ))}
      </ol>
    </div>
  );
}

/**
 * One smooth segment of the spine, built with Catmull-Rom tangents so the
 * joins between segments are continuous rather than kinked.
 */
function curveBetween(points: Point[], i: number): string {
  const p0 = points[i - 1] ?? points[i];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[i + 2] ?? p2;

  const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
  const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };

  return `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}

function MapNode({
  lesson,
  state,
  side,
  index,
  reduceMotion,
  tileRef,
}: {
  lesson: Lesson;
  state: LessonNodeState;
  side: "left" | "right";
  index: number;
  reduceMotion: boolean;
  tileRef: (el: HTMLSpanElement | null) => void;
}) {
  const style = NODE_STYLES[state];
  const locked = state === "locked";
  const current = state === "current";

  const tile = (
    <span ref={tileRef} className="relative shrink-0">
      {/* A slow halo behind the one lesson the student should open next. */}
      {current && !reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-[22px] bg-brand"
          animate={{ opacity: [0.28, 0, 0.28], scale: [1, 1.28, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}
      <span
        className={cn(
          "relative flex items-center justify-center rounded-[22px] border-2 transition-transform duration-200",
          style.tile,
          !locked && "group-hover:scale-[1.05]",
        )}
        style={{ height: style.size, width: style.size }}
      >
        <LessonIcon
          name={lesson.mapIcon}
          className={cn("h-[58%] w-[58%]", style.art)}
        />
      </span>
      <span
        className={cn(
          "absolute -bottom-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-surface shadow-sm",
          style.badge,
        )}
      >
        {locked && <Lock size={11} strokeWidth={3} />}
        {current && <Play size={11} fill="currentColor" />}
        {state === "completed" && <Check size={12} strokeWidth={3.5} />}
        {state === "weak" && <TriangleAlert size={11} strokeWidth={3} />}
        {(state === "mastered" || state === "perfect") && (
          <Star size={11} fill="currentColor" strokeWidth={0} />
        )}
      </span>
    </span>
  );

  const text = (
    <span className="min-w-0 flex-1">
      <span
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-0.5",
          side === "left" && "sm:justify-end",
        )}
      >
        <span className="tabular text-[11px] font-bold text-navy-faint">
          {String(lesson.index).padStart(2, "0")}
        </span>
        <span
          className={cn("text-[10.5px] font-extrabold uppercase tracking-wider", style.tone)}
        >
          {style.label}
        </span>
        <span className="tabular text-[11px] font-semibold text-navy-faint">
          {lesson.estimatedMinutes} min
        </span>
      </span>
      <span
        className={cn(
          "mt-0.5 block leading-snug",
          current ? "text-[17px] font-bold" : "text-[15.5px] font-semibold",
          locked ? "text-navy-faint" : "text-navy",
        )}
      >
        {lesson.title}
      </span>
      <span className="mt-0.5 block text-[12.5px] leading-snug text-navy-soft">
        {lesson.subtitle}
      </span>
    </span>
  );

  const inner = (
    <>
      {tile}
      {text}
    </>
  );

  return (
    <motion.li
      className="relative pb-5 last:pb-0"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.32, delay: Math.min(index, 6) * 0.035, ease: "easeOut" }}
    >
      <div
        className={cn(
          "relative flex items-center gap-4",
          // Each row occupies one half of the track, so the tiles alternate
          // around the centre line and the spine can snake between them.
          "sm:w-[calc(50%-0.75rem)]",
          side === "left" ? "sm:flex-row-reverse sm:text-right" : "sm:ml-auto",
        )}
      >
        {locked ? (
          <div
            className={cn(
              "flex w-full cursor-not-allowed items-center gap-4 rounded-2xl border border-transparent p-2.5",
              side === "left" && "sm:flex-row-reverse",
            )}
            title="Finish the lesson before this one to unlock"
          >
            {inner}
          </div>
        ) : (
          <Link
            href={`/lessons/${lesson.id}`}
            className={cn(
              "group flex w-full items-center gap-4 rounded-2xl border p-2.5 transition-all duration-200",
              side === "left" && "sm:flex-row-reverse",
              current
                ? "border-brand/30 bg-brand-soft/45 shadow-[0_2px_10px_-4px_rgba(13,28,46,0.14)] hover:border-brand/55 hover:bg-brand-soft/70"
                : "border-transparent hover:border-line hover:bg-surface-2/70",
            )}
          >
            {inner}
          </Link>
        )}
      </div>
    </motion.li>
  );
}
