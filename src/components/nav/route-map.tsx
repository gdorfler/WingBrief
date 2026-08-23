"use client";

/**
 * The Navigation course map.
 *
 * The other courses draw a flight path: nodes on a curve, one after another.
 * Navigation draws a ROUTE — a leg of chart per unit, waypoints where the
 * lessons are, a course line running between them with its magnetic bearing
 * and leg distance annotated in pencil, and a tick count that grows as the
 * route is flown.
 *
 * The annotations are not decoration. Each leg carries a bearing derived from
 * where its waypoints actually sit on the drawing, and a distance in "miles"
 * scaled from the unit's instruction time — so the numbers on the chart are
 * measurements of the same thing the numbers in the header are.
 */

import Link from "next/link";
import { Check, Lock } from "lucide-react";
import type { Lesson, Unit } from "@/lib/types";
import type { LessonNodeState } from "@/lib/review";
import { LessonIcon } from "../lesson-icon";
import { Pill, cn } from "../ui";

const FLOWN: LessonNodeState[] = ["completed", "mastered"];

/* The chart's own coordinate space. Legs are laid out inside it. */
const W = 1000;
const ROW_H = 250;
const MARGIN_X = 64;

export function NavRouteMap({
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
    <div className="space-y-6">
      {units.map((unit) => {
        const unitLessons = lessons
          .filter((l) => l.unit === unit.id)
          .sort((a, b) => a.index - b.index);
        const done = unitLessons.filter((l) => FLOWN.includes(states[l.id])).length;
        return (
          <section key={unit.id} id={unit.id} className="scroll-mt-20">
            <RouteLeg
              unit={unit}
              lessons={unitLessons}
              states={states}
              done={done}
              readiness={readinessByUnit[unit.id] ?? 0}
            />
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function RouteLeg({
  unit,
  lessons,
  states,
  done,
  readiness,
}: {
  unit: Unit;
  lessons: Lesson[];
  states: Record<string, LessonNodeState>;
  done: number;
  readiness: number;
}) {
  const points = layout(lessons.length, unit.index);
  const complete = done === lessons.length && lessons.length > 0;

  return (
    <div className="chart-paper overflow-hidden rounded-2xl">
      {/* ---------------- Leg header ---------------- */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-strong bg-[color-mix(in_srgb,var(--color-brand-soft)_55%,#fffdf7)] px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 gap-3.5">
          <span
            className={cn(
              "figure mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold",
              complete ? "bg-brand text-white" : "bg-surface text-brand ring-1 ring-brand/30",
            )}
          >
            {String(unit.index).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <p className="eyebrow text-brand-dark">Leg {unit.index} · {unit.subtitle}</p>
            <h2 className="mt-0.5 text-xl leading-tight text-navy">{unit.title}</h2>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-navy-soft">
              {unit.promise}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Pill tone="neutral">
            {done}/{lessons.length} waypoints
          </Pill>
          <Pill tone={readiness >= 80 ? "go" : readiness >= 40 ? "brand" : "neutral"}>
            {readiness}% mastery
          </Pill>
        </div>
      </div>

      {/* ---------------- The plotted leg ---------------- */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[720px] px-4 py-5 sm:px-5">
          <svg
            viewBox={`0 0 ${W} ${ROW_H}`}
            className="block w-full"
            role="img"
            aria-label={`Route leg ${unit.index}: ${unit.title}, ${done} of ${lessons.length} waypoints reached`}
          >
            <Graticule />

            {/* The course line, drawn behind the waypoints. */}
            {points.slice(0, -1).map((p, i) => {
              const next = points[i + 1];
              const flown = FLOWN.includes(states[lessons[i]?.id]);
              const bearing = bearingBetween(p, next);
              const nm = Math.round(
                Math.hypot(next.x - p.x, next.y - p.y) / 6 + (lessons[i]?.estimatedMinutes ?? 5),
              );
              const mid = { x: (p.x + next.x) / 2, y: (p.y + next.y) / 2 };
              return (
                <g key={`leg-${i}`}>
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={next.x}
                    y2={next.y}
                    stroke={flown ? "var(--color-plot)" : "var(--color-pencil)"}
                    strokeWidth={flown ? 2.4 : 1.4}
                    strokeDasharray={flown ? undefined : "6 5"}
                    opacity={flown ? 1 : 0.5}
                    strokeLinecap="round"
                  />
                  {/* One arrow per leg, the way the guide says to draw it. */}
                  <path
                    d={`M ${mid.x} ${mid.y} l -6 -3.4 l 0 6.8 Z`}
                    fill={flown ? "var(--color-plot)" : "var(--color-pencil)"}
                    opacity={flown ? 1 : 0.5}
                    transform={`rotate(${(Math.atan2(next.y - p.y, next.x - p.x) * 180) / Math.PI} ${mid.x} ${mid.y})`}
                  />
                  {/* Pencilled annotation: bearing and distance, as on a real plot. */}
                  <text
                    x={mid.x}
                    y={mid.y - 11}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={700}
                    className="figure"
                    fill={flown ? "var(--color-brand-dark)" : "var(--color-pencil)"}
                    opacity={flown ? 1 : 0.65}
                  >
                    {String(bearing).padStart(3, "0")}° · {nm} NM
                  </text>
                </g>
              );
            })}

            {points.map((p, i) => {
              const lesson = lessons[i];
              if (!lesson) return null;
              return (
                <Waypoint
                  key={lesson.id}
                  lesson={lesson}
                  state={states[lesson.id]}
                  x={p.x}
                  y={p.y}
                  index={i + 1}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* ---------------- Waypoint list ---------------- */}
      <ul className="divide-y divide-line border-t border-line-strong bg-surface/70">
        {lessons.map((lesson) => {
          const state = states[lesson.id];
          const locked = state === "locked";
          return (
            <li key={lesson.id}>
              <Link
                href={locked ? "#" : `/lessons/${lesson.id}`}
                aria-disabled={locked}
                className={cn(
                  "group flex items-center gap-3.5 px-4 py-3 transition-colors sm:px-5",
                  locked ? "cursor-not-allowed opacity-55" : "hover:bg-brand-soft/40",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    FLOWN.includes(state)
                      ? "bg-brand text-white"
                      : locked
                        ? "bg-surface-2 text-navy-faint"
                        : "bg-brand-soft text-brand",
                  )}
                >
                  {FLOWN.includes(state) ? (
                    <Check size={16} strokeWidth={3} />
                  ) : locked ? (
                    <Lock size={14} />
                  ) : (
                    <LessonIcon name={lesson.mapIcon} className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-navy">
                    {lesson.title}
                  </span>
                  <span className="block truncate text-[12px] text-navy-soft">
                    {lesson.subtitle}
                  </span>
                </span>
                <span className="figure shrink-0 text-[11.5px] font-bold text-navy-faint">
                  {lesson.estimatedMinutes} min
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Waypoint({
  lesson,
  state,
  x,
  y,
  index,
}: {
  lesson: Lesson;
  state: LessonNodeState;
  x: number;
  y: number;
  index: number;
}) {
  const flown = FLOWN.includes(state);
  const current = state === "current";
  const locked = state === "locked";

  return (
    <g>
      {current && (
        <circle cx={x} cy={y} r={22} fill="var(--color-brand)" opacity={0.12}>
          <animate attributeName="r" values="18;24;18" dur="2.6s" repeatCount="indefinite" />
        </circle>
      )}
      {/* The waypoint symbol: a plotted triangle, circled once reached. */}
      <circle
        cx={x}
        cy={y}
        r={14}
        fill={flown ? "var(--color-plot)" : locked ? "#efece2" : "#fffdf7"}
        stroke={flown ? "var(--color-brand-dark)" : current ? "var(--color-brand)" : "var(--color-pencil)"}
        strokeWidth={current ? 2.4 : 1.4}
      />
      {flown ? (
        <path
          d={`M ${x - 5} ${y} l 3.6 3.8 l 6.4 -7.4`}
          fill="none"
          stroke="#fff"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <text
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={800}
          className="figure"
          fill={locked ? "var(--color-navy-faint)" : "var(--color-brand-dark)"}
        >
          {index}
        </text>
      )}
      <text
        x={x}
        y={y + 32}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={700}
        fill={locked ? "var(--color-navy-faint)" : "var(--color-ink-800)"}
      >
        {truncate(lesson.title, 22)}
      </text>
    </g>
  );
}

/** A faint graticule behind the leg, with a scale bar. */
function Graticule() {
  return (
    <g>
      {Array.from({ length: 13 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={i * 80}
          y1={0}
          x2={i * 80}
          y2={ROW_H}
          className="chart-grid-line"
        />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={i * 62}
          x2={W}
          y2={i * 62}
          className="chart-grid-line"
        />
      ))}
      {/* Minute ticks up one meridian, so the sheet reads as a chart. */}
      {Array.from({ length: 25 }, (_, i) => (
        <line
          key={`t${i}`}
          x1={MARGIN_X - 4}
          y1={8 + i * 9}
          x2={MARGIN_X + (i % 5 === 0 ? 4 : 0)}
          y2={8 + i * 9}
          stroke="var(--color-pencil)"
          strokeWidth={i % 5 === 0 ? 0.9 : 0.5}
          opacity={0.5}
        />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Waypoint positions.
 *
 * Deterministic, so a unit's route looks the same every time it is drawn, but
 * varied between units so the ten legs do not read as one repeated graphic.
 * The unit index seeds a gentle vertical wander around the mid-line.
 */
function layout(count: number, seed: number): { x: number; y: number }[] {
  if (count === 0) return [];
  const usable = W - MARGIN_X * 2;
  const step = count === 1 ? 0 : usable / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const phase = (seed * 1.7 + i * 1.15) % (Math.PI * 2);
    return {
      x: MARGIN_X + i * step,
      y: ROW_H / 2 - 16 + Math.sin(phase) * 82,
    };
  });
}

function bearingBetween(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const deg = (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI;
  const n = Math.round(((deg % 360) + 360) % 360);
  return n === 0 ? 360 : n;
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}
