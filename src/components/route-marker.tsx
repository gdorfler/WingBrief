"use client";

/**
 * The route marker — "you are here" on a lesson map.
 *
 * Rather than clip-art of an aeroplane, this borrows the wing sweep from the
 * WingBrief mark itself and tints it to whichever unit the student is
 * currently in, so the "you are here" pin reads as part of the brand rather
 * than a bolted-on game piece. The same wing shape reappears, tiny, on a
 * mastered lesson's badge — the mark you get for actually earning one.
 *
 * Purely presentational: position, colour and whether it is mid-flight are
 * all props. The flight's own timing — pausing at the origin for a beat
 * before moving, then dropping the transition once it lands — is owned by
 * LessonMap, which measures the origin and destination in the first place;
 * this component only ever renders wherever it is told to.
 */

import { motion, useReducedMotion } from "motion/react";

export interface RouteMarkerPoint {
  x: number;
  y: number;
}

/** The two paths of the wing sweep, shared by the marker and the mastered badge. */
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
        transition: transitionOn ? "transform 680ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* A soft glow rather than a hard badge — brighter and wider mid-flight. */}
        <motion.span
          className="absolute inset-0 -z-10 rounded-full blur-md"
          style={{ background: accent }}
          animate={
            reduceMotion
              ? { opacity: 0.22 }
              : flying
                ? { opacity: [0.24, 0.5, 0.24], scale: [1, 1.6, 1] }
                : { opacity: [0.16, 0.3, 0.16], scale: 1 }
          }
          transition={
            flying ? { duration: 0.68, ease: "easeInOut" } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          animate={reduceMotion || flying ? { y: 0 } : { y: [0, -3, 0] }}
          transition={reduceMotion || flying ? { duration: 0 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={30} height={30} viewBox="0 0 32 32" style={{ rotate: `${angle}deg` }}>
            <defs>
              <filter id="route-marker-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1.6" floodColor="rgba(13,28,46,0.35)" />
              </filter>
            </defs>
            <g filter="url(#route-marker-shadow)">
              <circle cx="16" cy="16" r="14" fill="var(--color-surface)" stroke={accent} strokeWidth="2" />
              <g fill={accent}>
                <path d={WING_PATH} />
                <path d={NOSE_PATH} />
              </g>
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}
