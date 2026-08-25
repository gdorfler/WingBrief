"use client";

/**
 * WingBrief visual grammar.
 *
 * Every mark in an explainer means one thing, and means it in every course.
 * A student who learns that a dashed line is a REFERENCE in Aerodynamics
 * should not have to relearn it in Weather. The vocabulary:
 *
 *   solid arrow      a physical force or a real motion
 *   dashed line      a reference or a projection — nothing physically there
 *   angle arc        an angular measurement between two lines
 *   glow             the quantity that is changing right now
 *   dimmed           context, deliberately pushed back
 *   pulse ring       look here
 *   trail            the path something took through the system
 *
 * The rule that keeps it honest: an element may only appear because it carries
 * meaning. Nothing is drawn to fill space or to make a frame look busier.
 */

import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Roles → colour                                                      */
/* ------------------------------------------------------------------ */

/**
 * Semantic roles, not colours. Scenes name the role; the grammar decides how
 * it is painted, so a change of palette never has to be chased through
 * fifty diagrams.
 */
export type Role =
  | "subject" /* the thing being taught about — the aircraft, the parcel */
  | "primary" /* the quantity in focus this scene */
  | "reference" /* the datum being measured against */
  | "danger" /* the hazardous state */
  | "safe" /* the benign state */
  | "muted"; /* context */

export const ROLE_STROKE: Record<Role, string> = {
  subject: "var(--color-navy)",
  primary: "var(--color-brand)",
  reference: "var(--color-navy-faint)",
  danger: "var(--color-nogo)",
  safe: "var(--color-go)",
  muted: "var(--color-navy-faint)",
};

/* ------------------------------------------------------------------ */
/* Focus                                                               */
/* ------------------------------------------------------------------ */

/**
 * One layer of a scene, at one of three attention levels.
 *
 * `lead` is what the student is meant to be looking at, `support` is what
 * gives it meaning, and `context` is everything that has to stay on screen for
 * continuity but must not compete. Roughly one lead and two supports at a
 * time — beyond that the scene is teaching more than one idea.
 */
export type Attention = "lead" | "support" | "context";

/* Context at 0.22 rendered the horizon and chord line as ghosts — and those are
 * the datums the angles are MEASURED AGAINST, so erasing them erases the point
 * of the measurement. Context recedes; it does not disappear. */
const ATTENTION_OPACITY: Record<Attention, number> = {
  lead: 1,
  support: 0.88,
  context: 0.44,
};

export function Layer({
  at,
  show = true,
  children,
}: {
  at: Attention;
  /** Progressive reveal: a layer that has not been introduced yet is absent. */
  show?: boolean;
  children: ReactNode;
}) {
  if (!show) return null;
  return (
    <g
      opacity={ATTENTION_OPACITY[at]}
      style={{ transition: "opacity 420ms cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      {children}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Marks                                                               */
/* ------------------------------------------------------------------ */

/** Arrowheads, one per role, registered once per SVG. */
export function GrammarDefs() {
  return (
    <defs>
      {(Object.keys(ROLE_STROKE) as Role[]).map((role) => (
        <marker
          key={role}
          id={`wb-arrow-${role}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill={ROLE_STROKE[role]} />
        </marker>
      ))}
      <filter id="wb-glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="3.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/** A physical force or a real motion. Solid, arrowheaded. */
export function Vector({
  x1, y1, x2, y2, role = "primary", width = 3, glow = false, label, labelSide = "above",
}: {
  x1: number; y1: number; x2: number; y2: number;
  role?: Role; width?: number; glow?: boolean;
  label?: string; labelSide?: "above" | "below";
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const flip = Math.abs(angle) > 90;
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={ROLE_STROKE[role]}
        strokeWidth={width}
        strokeLinecap="round"
        markerEnd={`url(#wb-arrow-${role})`}
        filter={glow ? "url(#wb-glow)" : undefined}
        style={{ transition: "all 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      {label && (
        <text
          x={mx}
          y={my + (labelSide === "above" ? -10 : 18)}
          textAnchor="middle"
          fontSize={12}
          fontWeight={750}
          fill={ROLE_STROKE[role]}
          transform={`rotate(${flip ? angle + 180 : angle} ${mx} ${my})`}
          style={{ transition: "all 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** A reference or projection. Dashed, never arrowheaded — nothing is moving. */
export function Datum({
  x1, y1, x2, y2, role = "reference", label, width = 2,
}: {
  x1: number; y1: number; x2: number; y2: number;
  role?: Role; label?: string; width?: number;
}) {
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={ROLE_STROKE[role]}
        strokeWidth={width}
        strokeDasharray="7 6"
        strokeLinecap="round"
        style={{ transition: "all 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      {label && (
        <text
          x={x2 + 8}
          y={y2 + 4}
          fontSize={12}
          fontWeight={700}
          fill={ROLE_STROKE[role]}
          transform={`rotate(${angle} ${x2 + 8} ${y2 + 4})`}
          style={{ transition: "all 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * An angular measurement between two lines from a shared vertex.
 *
 * The value is drawn ON the arc rather than in a corner readout, because an
 * angle is a property of the geometry and reads as one when it sits there.
 */
export function AngleArc({
  cx, cy, from, to, r = 62, role = "primary", label, glow = false, labelGap = 22,
}: {
  cx: number; cy: number;
  /** Degrees, screen convention: 0 is +x, negative is up. */
  from: number; to: number;
  r?: number; role?: Role; label?: string; glow?: boolean;
  /** Extra radius for the value plate. Arcs sharing a vertex must not share a
   *  label radius, or their plates land on top of each other. */
  labelGap?: number;
}) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(from));
  const y1 = cy + r * Math.sin(rad(from));
  const x2 = cx + r * Math.cos(rad(to));
  const y2 = cy + r * Math.sin(rad(to));
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  const mid = rad((from + to) / 2);
  const lx = cx + (r + labelGap) * Math.cos(mid);
  const ly = cy + (r + labelGap) * Math.sin(mid);
  const plateW = Math.max(52, (label?.length ?? 0) * 7.1 + 14);
  const spread = Math.abs(to - from);

  return (
    <g style={{ transition: "all 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
      <path
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`}
        fill="none"
        stroke={ROLE_STROKE[role]}
        strokeWidth={spread > 2 ? 3.4 : 2}
        strokeLinecap="round"
        filter={glow ? "url(#wb-glow)" : undefined}
      />
      {label && spread > 1.5 && (
        <>
          <rect
            x={lx - plateW / 2} y={ly - 13} width={plateW} height={25} rx={7}
            fill="var(--color-surface)" stroke={ROLE_STROKE[role]} strokeWidth={1.6}
          />
          <text
            x={lx} y={ly + 5} textAnchor="middle"
            fontSize={13.5} fontWeight={800} fill={ROLE_STROKE[role]}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

/** Look here. A soft ring that breathes, and stops for reduced-motion users. */
export function PulseRing({ cx, cy, r = 34, role = "primary" }: {
  cx: number; cy: number; r?: number; role?: Role;
}) {
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={ROLE_STROKE[role]} strokeWidth={2} opacity={0.55}
        className="wb-pulse"
      />
      <style>{`
        @keyframes wb-pulse-kf {
          0%   { r: ${r * 0.72}px; opacity: 0.65; }
          70%  { r: ${r * 1.18}px; opacity: 0; }
          100% { r: ${r * 1.18}px; opacity: 0; }
        }
        .wb-pulse { animation: wb-pulse-kf 2.1s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .wb-pulse { animation: none; opacity: 0.4; } }
      `}</style>
    </g>
  );
}

/**
 * A label bound to the thing it names.
 *
 * Takes the anchor point of the feature and offsets from it, so the label
 * travels when the feature does. The old explainers parked readouts in a
 * corner and let the geometry drift away from them; this cannot.
 */
export function Tag({
  x, y, dx = 0, dy = 0, text, role = "primary", align = "start", strong = false,
}: {
  x: number; y: number; dx?: number; dy?: number;
  text: string; role?: Role; align?: "start" | "middle" | "end"; strong?: boolean;
}) {
  return (
    <text
      x={x + dx}
      y={y + dy}
      textAnchor={align}
      fontSize={strong ? 13 : 12}
      fontWeight={strong ? 800 : 700}
      fill={ROLE_STROKE[role]}
      style={{ transition: "all 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      {text}
    </text>
  );
}
