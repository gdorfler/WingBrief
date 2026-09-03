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
 * One route marker — a small waypoint puck, tinted to the unit it is over —
 * docks on the path just off the edge of the current lesson's tile, on the
 * side the student arrived from. It is deliberately never centred on the
 * tile: the card is the destination, the marker is the traveller, and the
 * two must never occupy the same spot or the marker reads as a badge pasted
 * over the lesson rather than a position on a route. When a lesson has just
 * been finished, it flies there from a matching dock beside the lesson that
 * earned it, measured in page coordinates so the flight can cross a unit
 * boundary if it needs to. A one-shot session signal (see
 * `lib/route-marker-signal`) is what tells this component that a flight —
 * rather than a plain arrival — is called for.
 */

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FastForward } from "lucide-react";
import type { Lesson, Unit } from "@/lib/types";
import type { LessonNodeState } from "@/lib/review";
import { clearLessonCompletedSignal, peekLessonCompletedSignal } from "@/lib/route-marker-signal";
import { LessonToken } from "./lesson-token";
import { RouteMarker, type RouteMarkerPoint } from "./route-marker";
import { SkyBackdrop } from "./sky";
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
 * Per-state presentation, reduced to what this file still decides: the words,
 * the diameter, and the label colour against the sky.
 *
 * How a node actually looks — its face, rim, glow, badge and warning ring —
 * belongs to <LessonToken>, so the two cannot drift apart. Locked nodes keep
 * showing their diagram, drained rather than hidden: a wall of grey padlocks
 * tells a student nothing about what is coming.
 */
const NODE_STYLES: Record<
  LessonNodeState,
  {
    label: string;
    /** Token diameter. The current lesson is the largest thing on the path. */
    size: number;
    /** The state label's colour against the night sky. */
    onSky: string;
  }
> = {
  locked: { label: "Locked", size: 74, onSky: "text-white/45" },
  current: { label: "Current sortie", size: 96, onSky: "text-brand-light" },
  completed: {
    label: "Complete",
    size: 80,
    onSky: "text-[color-mix(in_srgb,var(--color-go)_45%,white)]",
  },
  perfect: {
    label: "Perfect",
    size: 80,
    onSky: "text-[color-mix(in_srgb,var(--color-gold)_40%,white)]",
  },
  mastered: {
    label: "Mastered",
    size: 82,
    onSky: "text-[color-mix(in_srgb,var(--color-gold)_40%,white)]",
  },
  weak: {
    label: "Needs review",
    size: 80,
    onSky: "text-[color-mix(in_srgb,var(--color-caution)_38%,white)]",
  },
};

/** A measured node centre, in a coordinate space shared across the whole map. */
interface Point {
  x: number;
  y: number;
}

/** Gap between a tile's edge and the marker docked beside it, in pixels. */
const DOCK_CLEARANCE = 15;

/** A point `distance` px from `origin`, along the line toward `toward`. */
function pointAtDistance(origin: Point, toward: Point, distance: number): Point {
  const dx = toward.x - origin.x;
  const dy = toward.y - origin.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: origin.x + (dx / len) * distance, y: origin.y + (dy / len) * distance };
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
    const currentCentre = toPoint(currentEl);
    const currentRadius = (NODE_STYLES.current.size ?? 86) / 2;

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
    const originCentre = originEl ? toPoint(originEl) : null;
    const angle = originCentre ? angleBetween(originCentre, currentCentre) : 180;

    // Dock on the path just short of the current tile, on the side the
    // student is arriving from — never centred on the tile itself. With no
    // preceding node (the very first lesson) fall back to docking just above
    // it, as if the route simply begins there.
    const arrivingFrom = originCentre ?? { x: currentCentre.x, y: currentCentre.y - 120 };
    const point = pointAtDistance(currentCentre, arrivingFrom, currentRadius + DOCK_CLEARANCE);

    // The flight's departure dock, symmetrically placed just past the edge
    // of the lesson that was just finished, on the side facing the current
    // lesson — so the marker visibly leaves one checkpoint before arriving
    // at the next rather than teleporting from a tile's centre.
    let from: Point | null = null;
    if (signal && originCentre && originId) {
      const originRadius = (NODE_STYLES[states[originId] ?? "completed"]?.size ?? 72) / 2;
      from = pointAtDistance(originCentre, currentCentre, originRadius + DOCK_CLEARANCE);
    }

    setMarker({ point, accent, angle, from });
  }, [currentLessonId, lessons, signal, states, units]);

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
        const accent = UNIT_ACCENT[unit.accent];

        return (
          <section
            key={unit.id}
            id={unit.id}
            className="relative scroll-mt-20 overflow-hidden rounded-3xl bg-ink-900 shadow-[0_1px_2px_rgba(13,28,46,0.06),0_18px_40px_-24px_rgba(13,28,46,0.45)]"
            style={{
              // A whisper of the unit's colour over the ink, so the sections
              // still read as distinct chapters rather than one long night.
              backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${accent} 16%, transparent) 0%, transparent 240px)`,
            }}
          >
            {/*
              The route runs through the sky rather than across a page. Node
              tiles are all either light or fully saturated, so they gain
              contrast against the ink rather than losing it; the labels beside
              them switch to their `onSky` tones to keep up.
            */}
            <SkyBackdrop arc={false} clouds={0.35} />
            <UnitHeader
              unit={unit}
              accent={accent}
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

/**
 * The banner a unit's stretch of path hangs under.
 *
 * Reduced to the three things that help someone decide whether to fly this
 * unit: which one it is, what it promises, and how well it has landed. The
 * category eyebrow duplicated the title, and the lesson count duplicated the
 * path directly below it, which already shows every stop and which are done.
 */
function UnitHeader({
  unit,
  accent,
  readiness,
  justArrived,
}: {
  unit: Unit;
  accent: string;
  readiness: number;
  /** This unit's last lesson was the one just finished — its one arrival bow. */
  justArrived: boolean;
}) {
  return (
    <div
      className="relative border-b px-4 pb-4 pt-5 sm:px-6"
      style={{
        borderColor: "rgba(255,255,255,0.12)",
        background: `color-mix(in srgb, ${accent} 14%, transparent)`,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="relative shrink-0">
            {justArrived && (
              <span
                className="animate-burst pointer-events-none absolute inset-0 rounded-2xl"
                style={{ backgroundColor: accent }}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "tabular relative flex h-12 w-12 items-center justify-center rounded-2xl text-[16px] font-extrabold text-white",
                justArrived && "animate-pop",
              )}
              style={{ backgroundColor: accent }}
            >
              {String(unit.index).padStart(2, "0")}
            </span>
          </span>
          <div className="min-w-0">
            <h2 className="text-[19px] font-extrabold leading-tight text-white">{unit.title}</h2>
            <p className="mt-0.5 max-w-xl text-[13.5px] leading-snug text-[#bed2e6]">
              {unit.promise}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Pill tone={readiness >= 80 ? "go" : readiness >= 40 ? "brand" : "neutral"}>
            {readiness}% mastery
          </Pill>
          <Link
            href={`/exam?mode=unit&unit=${unit.id}`}
            className="flex items-center gap-1 rounded-full border border-white/25 px-2.5 py-1 text-[11.5px] font-semibold text-[#cfe0f0] transition-colors hover:border-white/50 hover:text-white"
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
    <div className="relative z-10 px-4 py-6 sm:px-6">
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
                  // Unflown legs are white-based rather than the light-mode
                  // hairline colour, which all but vanished against the ink.
                  stroke={flown || isNextLeg ? accent : "rgba(255,255,255,0.9)"}
                  // The route is the subject of this screen, so it is drawn
                  // heavy enough to read as one continuous line at a glance
                  // rather than as hairlines between cards.
                  strokeWidth={flown ? 5 : isNextLeg ? 4.5 : 3.5}
                  strokeLinecap="round"
                  strokeDasharray={flown ? undefined : isNextLeg ? "6 9" : "3 9"}
                  opacity={flown ? 0.95 : isNextLeg ? 0.85 : 0.3}
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
    <motion.span
      ref={tileRef}
      className="relative shrink-0"
      // Hover bob: the token lifts toward the cursor, the whole badge with
      // its shadow, so the depth reads on the way up.
      animate={reduceMotion ? undefined : { y: 0 }}
      whileHover={reduceMotion || locked ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 340, damping: 22 }}
    >
      <LessonToken
        state={state}
        icon={lesson.mapIcon}
        size={style.size}
        celebrate={justCompleted}
      />

      {/* The XP the lesson just paid, rising once and gone. The sparkle
          itself lives in the token. */}
      {justCompleted && !reduceMotion && typeof xpEarned === "number" && (
        <span
          className="animate-rise tabular pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[12px] font-extrabold text-gold"
          aria-hidden
        >
          +{xpEarned} XP
        </span>
      )}
    </motion.span>
  );

  /*
   * A stop on a route needs to say what it is and where you stand with it.
   * The lesson number is already implied by position on the path, and the
   * subtitle is a second sentence nobody reads while scanning for the next
   * thing to do, so both are gone: title first and biggest, state and length
   * underneath it in one quiet line.
   */
  const text = (
    <span className="min-w-0 flex-1">
      <span
        className={cn(
          "block leading-snug",
          current ? "text-[18px] font-extrabold" : "text-[16px] font-bold",
          locked ? "text-white/55" : "text-white",
        )}
      >
        {lesson.title}
      </span>
      <span
        className={cn(
          "mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5",
          side === "left" && "sm:justify-end",
        )}
      >
        <span className={cn("text-[11px] font-extrabold uppercase tracking-wider", style.onSky)}>
          {style.label}
        </span>
        <span className="tabular text-[11.5px] font-semibold text-white/55">
          {lesson.estimatedMinutes} min
        </span>
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
    /*
     * Entrance is driven by mount, not by `whileInView`.
     *
     * The scroll-reveal version gated visibility on an IntersectionObserver
     * callback that does not reliably fire on first paint — if the tab is not
     * being painted when the observer is installed, nothing fires, `once:
     * true` never latches, and the whole map sits at opacity 0 until the
     * student happens to scroll. A blank flight path is a far worse failure
     * than a reveal that plays slightly early, so the nodes now always
     * animate in and the stagger alone carries the sense of the route
     * drawing itself.
     */
    <motion.li
      className="relative pb-5 last:pb-0"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
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
        {/*
          Only the current lesson is a card. Giving every stop a bordered
          container turned the route into a stack of tiles joined by hairlines;
          without them the node tiles sit on the path itself and the eye
          follows the line, which is the whole point of a map. Note the border
          utility is applied per-branch rather than in the shared base: a
          global border-colour default overrides `border-transparent`, so a
          base `border` would draw a visible outline on every row.
        */}
        {locked ? (
          <div
            className={cn(
              "flex w-full cursor-not-allowed items-center gap-4 rounded-2xl p-2.5",
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
              "group flex w-full items-center gap-4 rounded-2xl p-2.5 transition-all duration-200",
              side === "left" && "sm:flex-row-reverse",
              current
                ? "-translate-y-0.5 border-2 border-brand/60 bg-brand/[0.16] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.5)] hover:border-brand/80 hover:bg-brand/[0.24]"
                : "hover:bg-white/[0.07]",
            )}
          >
            {inner}
          </Link>
        )}
      </div>
    </motion.li>
  );
}
