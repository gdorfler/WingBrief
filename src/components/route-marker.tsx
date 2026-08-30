"use client";

/**
 * The route marker — "you are here" on the flight path, not on the lesson.
 *
 * Earlier drafts sized this like a lesson tile and centred it on the current
 * lesson's card, which read as a logo pasted over the content rather than a
 * position on a route. This version is a small waypoint puck — a fraction of
 * a tile's size, filled solid in the unit's accent rather than badged in
 * white — that LessonMap docks just off the edge of the current tile, on the
 * path, on the side the student is arriving from. It never sits over a card.
 *
 * Purely presentational: position, colour, heading and whether it is
 * mid-flight are all props. The flight's own timing is owned by LessonMap,
 * which measures the dock points in the first place; this component only
 * ever renders wherever it is told to.
 *
 * The wing glyph below is unrelated to the marker itself — it is the shape a
 * mastered lesson's badge borrows from the WingBrief mark, kept here because
 * it began life alongside the marker that used to carry it.
 */

import { motion, useReducedMotion } from "motion/react";
import { Navigation2 } from "lucide-react";

export interface RouteMarkerPoint {
  x: number;
  y: number;
}

/** The two paths of the wing sweep, used by the mastered-lesson badge. */
const WING_PATH =
  "M7 18.5 C11 15.7 14 14.9 16 14.9 C18 14.9 21 15.7 25 18.5 L25 20.2 C20 18.5 17.6 18 16 18 C14.4 18 12 18.5 7 20.2 Z";
const NOSE_PATH = "M16 8.4 L17.7 12.7 L16 14.2 L14.3 12.7 Z";

/** The wing sweep alone, sized and coloured by the caller via className. */
export function WingGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="currentColor" aria-hidden>
      <path d={WING_PATH} />
      <path d={NOSE_PATH} />
    </svg>
  );
}

export function RouteMarker({
  point,
  accent,
  angle = 180,
  flying,
}: {
  point: RouteMarkerPoint;
  accent: string;
  /** Degrees to rotate the glyph so its nose faces the direction of travel. */
  angle?: number;
  /** True only for the brief window the caller is actively animating toward `point`. */
  flying: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const transitionOn = flying && !reduceMotion;

  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-20"
      style={{
        transform: `translate(${point.x}px, ${point.y}px)`,
        transition: transitionOn ? "transform 620ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* A soft beacon glow — brighter and wider mid-flight, a slow quiet
            breathe at rest. This is the only part that moves while idle;
            the puck itself stays still so it reads as docked, not floating. */}
        <motion.span
          className="absolute inset-0 -z-10 rounded-full blur-[7px]"
          style={{ background: accent }}
          animate={
            reduceMotion
              ? { opacity: 0.26 }
              : flying
                ? { opacity: [0.3, 0.62, 0.28], scale: [1, 2.1, 1.15] }
                : { opacity: [0.2, 0.36, 0.2], scale: [1, 1.15, 1] }
          }
          transition={
            flying ? { duration: 0.62, ease: "easeOut" } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
          }
        />
        {/* The puck: small, solid, and coloured — a position marker, not a
            second badge trying to look like the lesson tile's own state. */}
        <span
          className="relative flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-surface"
          style={{ background: accent, boxShadow: "0 2px 7px -1px rgba(13,28,46,0.5)" }}
        >
          <Navigation2
            size={9}
            className="text-white"
            style={{ transform: `rotate(${angle}deg)` }}
            strokeWidth={3}
            fill="white"
          />
        </span>
      </div>
    </div>
  );
}
