"use client";

/**
 * The flight path.
 *
 * A snaking route through the units. Node states are read from concept
 * mastery, not just completion, so a lesson you passed but have since gone
 * weak on is visibly amber rather than quietly green.
 *
 * The connecting line is a real curve threaded through the measured centre of
 * every node rather than a straight rule behind them, so the route reads as one
 * continuous path. Segments already flown are drawn solid in the unit accent;
 * the leg leading out of the current lesson gets a slow marching glow, as the
 * one you are about to fly; everything further out stays faint.
 *
 * One route marker — a small wing, tinted to the unit it is over — sits at
 * whichever lesson is current, drifting gently at rest. When a lesson has
 * just been finished, it flies there from the lesson that earned it, measured
 * in page coordinates so the flight can cross a unit boundary if it needs to.
 * A one-shot session signal (see `lib/route-marker-signal`) is what tells this
 * component that a flight — rather than a plain arrival — is called for.
 */

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, FastForward, Lock, Play, Star, TriangleAlert } from "lucide-react";
import type { Lesson, Unit } from "@/lib/types";
import type { LessonNodeState } from "@/lib/review";
import { clearLessonCompletedSignal, peekLessonCompletedSignal } from "@/lib/route-marker-signal";
import { LessonIcon } from "./lesson-icon";
import { RouteMarker, WingGlyph, type RouteMarkerPoint } from "./route-marker";
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

/** A measured node centre, in a coordinate space shared across the whole map. */
interface Point {
  x: number;
  y: number;
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeElsRef = useRef<Record<string, HTMLElement | null>>({});
  const registerNode = useCallback((id: string, el: HTMLElement | null) => {
    nodeElsRef.current[id] = el;
  }, []);

  // Exactly one lesson is ever "current" — lessonStates() guarantees it.
  const currentLessonId = useMemo(
    () => lessons.find((l) => states[l.id] === "current")?.id ?? null,
    [lessons, states],
  );

  // Read once, on mount: which lesson (if any) was just finished. Cleared
  // from an effect below, so a later visit to this page never replays it.
  const [signal] = useState(() => peekLessonCompletedSignal(lessons.map((l) => l.id)));
  useEffect(() => {
    if (signal) clearLessonCompletedSignal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [marker, setMarker] = useState<{
    point: RouteMarkerPoint;
    accent: string;
    angle: number;
    /** Set only on the render(s) where a flight has just been newly measured. */
    from: RouteMarkerPoint | null;
  } | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container || !currentLessonId) {
      setMarker(null);
      return;
    }
    const currentEl = nodeElsRef.current[currentLessonId];
    if (!currentEl) return;
    const box = container.getBoundingClientRect();
    const toPoint = (el: HTMLElement): Point => {
      const r = el.getBoundingClientRect();
      return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
    };
    const point = toPoint(currentEl);

    const currentLesson = lessons.find((l) => l.id === currentLessonId);
    const currentUnit = currentLesson ? units.find((u) => u.id === currentLesson.unit) : undefined;
    const accent = currentUnit ? UNIT_ACCENT[currentUnit.accent] : "var(--color-brand)";

    // Face the direction just travelled: from the just-finished lesson when
    // this is a fresh arrival, otherwise from whichever lesson precedes the
    // current one in the overall course order — so an idle marker still
    // banks the way it must have come in, rather than sitting square-on.
    const ordered = [...lessons].sort((a, b) => a.index - b.index);
    const precedingId = ordered[ordered.findIndex((l) => l.id === currentLessonId) - 1]?.id;
    const originId = signal?.lessonId ?? precedingId ?? null;
    const originEl = originId ? nodeElsRef.current[originId] : null;
    const from = originEl ? toPoint(originEl) : null;
    const angle = from ? angleBetween(from, point) : 180;

    setMarker({ point, accent, angle, from: signal ? from : null });
  }, [currentLessonId, lessons, signal, units]);

  // Layout effect so the marker lands in the same frame the nodes do, rather
  // than popping in a beat later.
  useLayoutEffect(() => {
    measure();
  }, [measure, states]);

  useEffect(() => {
    // Node entrance transforms can still be settling a beat after mount, and
    // a resize should always relocate the marker rather than strand it.
    const settle = setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    if (typeof ResizeObserver === "undefined") {
      return () => {
        clearTimeout(settle);
        window.removeEventListener("resize", measure);
      };
    }
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  /*
   * The flight's own timing, kept entirely separate from measuring: a timer
   * created inside an arbitrary callback (inside `measure`, say) has no
   * effect of its own to be cleaned up by, so React's Strict Mode mount →
   * cleanup → mount rehearsal on first mount cancels it via whatever
   * unrelated effect happens to be tracking it, before it ever gets to fire.
   * A timer that is itself the entire body of a `useEffect` does not have
   * that problem: Strict Mode's rehearsal cancels it and immediately
   * reschedules a fresh one in the same synchronous pass, and THAT one runs
   * normally afterward.
   *
   * `pendingFlight` flips true the moment `measure` first reports a fresh
   * `from`; `flightHandled` guards against the point that follows (a resize,
   * the 400ms settle) re-arming a flight that already ran.
   */
  const [flying, setFlying] = useState(false);
  const [pendingFlight, setPendingFlight] = useState(false);
  const flightHandled = useRef(false);

  useEffect(() => {
    if (!marker?.from || flightHandled.current) return;
    flightHandled.current = true;
    setPendingFlight(true);
  }, [marker?.from]);

  useEffect(() => {
    if (!pendingFlight) return;
    const t = setTimeout(() => {
      setFlying(true);
      setPendingFlight(false);
    }, 50);
    return () => clearTimeout(t);
  }, [pendingFlight]);

  useEffect(() => {
    if (!flying) return;
    const t = setTimeout(() => setFlying(false), 700);
    return () => clearTimeout(t);
  }, [flying]);

  // While priming (from just measured, not yet airborne) the marker renders
  // at the origin with no transition; once `flying`, at the real point with
  // one. `pendingFlight` therefore doubles as "hold at the origin."
  const displayPoint = pendingFlight && marker?.from ? marker.from : marker?.point;

  // Which unit, if any, was just finished off by the signalled lesson — the
  // cue for that unit's header to take its one arrival bow.
  const justArrivedUnitId = useMemo(() => {
    if (!signal) return null;
    const completedLesson = lessons.find((l) => l.id === signal.lessonId);
    if (!completedLesson) return null;
    const unitLessons = lessons.filter((l) => l.unit === completedLesson.unit);
    const doneCount = unitLessons.filter((l) => FLOWN.includes(states[l.id])).length;
    return doneCount === unitLessons.length ? completedLesson.unit : null;
  }, [lessons, signal, states]);

  return (
    <div ref={containerRef} className="relative space-y-8">
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
              justArrived={unit.id === justArrivedUnitId}
            />
            <UnitTrack
              lessons={unitLessons}
              states={states}
              accent={accent}
              currentLessonId={currentLessonId}
              justCompletedLessonId={signal?.lessonId ?? null}
              xpEarned={signal?.xpEarned}
              registerNode={registerNode}
            />
          </section>
        );
      })}

      {marker && displayPoint && (
        <RouteMarker point={displayPoint} accent={marker.accent} angle={marker.angle} flying={flying} />
      )}
    </div>
  );
}

/** Compass angle, in the CSS-rotation degrees the marker's glyph expects. */
function angleBetween(from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return 180;
  return (Math.atan2(dy, dx) * 180) / Math.PI + 90;
}

function UnitHeader({
  unit,
  accent,
  done,
  total,
  readiness,
  justArrived,
}: {
  unit: Unit;
  accent: string;
  done: number;
  total: number;
  readiness: number;
  /** This unit's last lesson was the one just finished — its one arrival bow. */
  justArrived: boolean;
}) {
  return (
    <div className="border-b border-line/70 px-4 pb-4 pt-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3.5">
          <span className="relative mt-0.5 shrink-0">
            {justArrived && (
              <span
                className="animate-burst pointer-events-none absolute inset-0 rounded-2xl"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "tabular relative flex h-11 w-11 items-center justify-center rounded-2xl text-[15px] font-extrabold text-white",
                justArrived && "animate-pop",
              )}
              style={{ backgroundColor: accent }}
            >
              {String(unit.index).padStart(2, "0")}
            </span>
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

function UnitTrack({
  lessons,
  states,
  accent,
  currentLessonId,
  justCompletedLessonId,
  xpEarned,
  registerNode,
}: {
  lessons: Lesson[];
  states: Record<string, LessonNodeState>;
  accent: string;
  currentLessonId: string | null;
  justCompletedLessonId: string | null;
  xpEarned?: number;
  registerNode: (id: string, el: HTMLElement | null) => void;
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

  const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);

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
              // The one leg not yet flown that leads OUT of the current
              // lesson — the next thing to do, so it gets a slow glow
              // instead of the neutral dashes every other unflown leg gets.
              const isNextLeg = i === currentIndex;
              return (
                <motion.path
                  key={i}
                  d={curveBetween(points, i)}
                  fill="none"
                  stroke={flown || isNextLeg ? accent : "var(--color-line-strong)"}
                  strokeWidth={flown ? 3 : isNextLeg ? 2.75 : 2.5}
                  strokeLinecap="round"
                  strokeDasharray={flown ? undefined : isNextLeg ? "5 8" : "1 9"}
                  opacity={flown ? 0.85 : isNextLeg ? 0.65 : 0.75}
                  className={isNextLeg && !reduceMotion ? "flow-line-slow" : undefined}
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
            justCompleted={lesson.id === justCompletedLessonId}
            xpEarned={lesson.id === justCompletedLessonId ? xpEarned : undefined}
            tileRef={(el) => {
              nodeRefs.current[i] = el;
              registerNode(lesson.id, el);
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
  justCompleted,
  xpEarned,
  tileRef,
}: {
  lesson: Lesson;
  state: LessonNodeState;
  side: "left" | "right";
  index: number;
  reduceMotion: boolean;
  /** This is the lesson the route marker just flew from — its one XP pulse. */
  justCompleted: boolean;
  xpEarned?: number;
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
      <motion.span
        className={cn(
          "relative flex items-center justify-center rounded-[22px] border-2 transition-transform duration-200",
          style.tile,
          !locked && "group-hover:scale-[1.05]",
        )}
        style={{ height: style.size, width: style.size }}
        animate={current && !reduceMotion ? { scale: [1, 1.015, 1] } : undefined}
        transition={current && !reduceMotion ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        <LessonIcon
          name={lesson.mapIcon}
          className={cn("h-[58%] w-[58%]", style.art)}
        />
      </motion.span>
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
        {state === "perfect" && <Star size={11} fill="currentColor" strokeWidth={0} />}
        {/* Mastered earns the same wing the route marker carries, not just
            another star — a visibly different reward for a visibly different
            state. */}
        {state === "mastered" && <WingGlyph className="h-[11px] w-[11px]" />}
      </span>

      {/* The one moment this node gets: a quiet burst as the marker leaves it,
          and — if the lesson just finished said how much — a small +XP that
          rises and fades. Plays once, on the visit right after finishing. */}
      {justCompleted && !reduceMotion && (
        <>
          <span
            className="animate-burst pointer-events-none absolute inset-0 rounded-[22px]"
            style={{ backgroundColor: "var(--color-go)" }}
            aria-hidden
          />
          {typeof xpEarned === "number" && (
            <span
              className="animate-rise tabular pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-extrabold text-go"
              aria-hidden
            >
              +{xpEarned} XP
            </span>
          )}
        </>
      )}
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
