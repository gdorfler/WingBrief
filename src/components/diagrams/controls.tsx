"use client";

/**
 * Flight control diagrams.
 *
 * The guide teaches control surfaces, trim, balancing and control feel as one
 * block (Lesson 2.2, sections 15 to 19), and every part of it is geometric:
 * which surface moves the aircraft about which axis, which way a trim tab has
 * to go, where the control surface's centre of gravity sits relative to the
 * hinge line. None of that reads well as prose, and all of it draws in one
 * picture.
 *
 * Numbers and behaviour come from the Aerodynamics Trainee Guide, EOs
 * 2.117 through 2.123, including the T-6B specifics it states.
 */

import { AircraftTop, Diagram, type DiagramProps, num, str } from "./primitives";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";

/* ------------------------------------------------------------------ */
/* 2.117 — primary flight controls                                     */
/* ------------------------------------------------------------------ */

/**
 * Which surface produces which motion, about which axis.
 *
 * Drawn from above with the three surfaces marked in place, because the thing
 * students confuse is not what an aileron IS but which axis it turns the
 * aircraft about — and that is a spatial fact.
 */
export function ControlSurfaces(p: DiagramProps) {
  const highlight = str<"elevator" | "aileron" | "rudder" | "none">(p.highlight, "none");
  const on = (id: string) => highlight === "none" || highlight === id;
  const lit = (id: string) => highlight === id;

  const cx = 250;
  const cy = 148;

  return (
    <Diagram title="The three primary flight controls">
      {/* Aircraft, nose up the page. */}
      <AircraftTop x={cx} y={cy} scale={4.1} fill={MUTED} opacity={0.35} />

      {/* Ailerons — outboard trailing edges. */}
      {[-1, 1].map((s) => (
        <rect
          key={`ail${s}`}
          x={cx + s * 78 - 22}
          y={cy + 26}
          width={44}
          height={12}
          rx={3}
          fill={lit("aileron") ? BRAND : "var(--color-surface-2)"}
          stroke={lit("aileron") ? BRAND : MUTED}
          strokeWidth={lit("aileron") ? 2.2 : 1.3}
          opacity={on("aileron") ? 1 : 0.22}
        />
      ))}
      <text
        x={cx - 78}
        y={cy + 58}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={lit("aileron") ? 800 : 650}
        fill={lit("aileron") ? BRAND : MUTED}
        opacity={on("aileron") ? 1 : 0.3}
      >
        Aileron
      </text>
      <text
        x={cx + 78}
        y={cy + 58}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={lit("aileron") ? 800 : 650}
        fill={lit("aileron") ? BRAND : MUTED}
        opacity={on("aileron") ? 1 : 0.3}
      >
        Aileron
      </text>

      {/* Elevator — trailing edge of the horizontal stabiliser. */}
      {[-1, 1].map((s) => (
        <rect
          key={`elev${s}`}
          x={cx + s * 22 - 16}
          y={cy + 78}
          width={32}
          height={11}
          rx={3}
          fill={lit("elevator") ? GO : "var(--color-surface-2)"}
          stroke={lit("elevator") ? GO : MUTED}
          strokeWidth={lit("elevator") ? 2.2 : 1.3}
          opacity={on("elevator") ? 1 : 0.22}
        />
      ))}
      <text
        x={cx + 92}
        y={cy + 88}
        fontSize={10.5}
        fontWeight={lit("elevator") ? 800 : 650}
        fill={lit("elevator") ? GO : MUTED}
        opacity={on("elevator") ? 1 : 0.3}
      >
        Elevator
      </text>

      {/* Rudder — trailing edge of the vertical stabiliser. */}
      <rect
        x={cx - 5}
        y={cy + 62}
        width={10}
        height={30}
        rx={3}
        fill={lit("rudder") ? NOGO : "var(--color-surface-2)"}
        stroke={lit("rudder") ? NOGO : MUTED}
        strokeWidth={lit("rudder") ? 2.2 : 1.3}
        opacity={on("rudder") ? 1 : 0.22}
      />
      <text
        x={cx - 92}
        y={cy + 88}
        textAnchor="end"
        fontSize={10.5}
        fontWeight={lit("rudder") ? 800 : 650}
        fill={lit("rudder") ? NOGO : MUTED}
        opacity={on("rudder") ? 1 : 0.3}
      >
        Rudder
      </text>

      <text x={250} y={34} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Viewed from above, nose up the page
      </text>

      {highlight === "none" ? (
        <text x={250} y={272} textAnchor="middle" fontSize={11} fontWeight={700} fill={MUTED}>
          Each surface changes the lift of the airfoil it is attached to.
        </text>
      ) : (
        <>
          <text x={250} y={258} textAnchor="middle" fontSize={12} fontWeight={800} fill={NAVY}>
            {highlight === "elevator"
              ? "Pitch, about the LATERAL axis"
              : highlight === "aileron"
                ? "Roll, about the LONGITUDINAL axis"
                : "Yaw, about the VERTICAL axis"}
          </text>
          <text x={250} y={276} textAnchor="middle" fontSize={10.5} fontWeight={650} fill={MUTED}>
            {highlight === "elevator"
              ? "Stick forward → elevator down → more camber → more lift → tail up → nose down"
              : highlight === "aileron"
                ? "Ailerons move in unison, in OPPOSITE directions"
                : "Right pedal → rudder right → tail flies left → nose yaws right"}
          </text>
        </>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* 2.118 — trim                                                        */
/* ------------------------------------------------------------------ */

/**
 * Why a trim tab works: two moments about one hinge line.
 *
 * The tab's force is small, but its moment arm is long — which is the entire
 * reason a surface a fraction of the size can hold a control surface that the
 * pilot would otherwise have to hold by hand.
 */
export function TrimTabMoment(p: DiagramProps) {
  /** 0 = untrimmed (pilot holding), 1 = trimmed (tab deflected). */
  const trimmed = num(p.trimmed, 0) >= 0.5;

  const hinge = { x: 168, y: 150 };
  const surfaceLen = 150;
  const tabLen = 40;
  const angle = -14;
  const tabAngle = trimmed ? 26 : 0;

  return (
    <Diagram title="How a trim tab holds the surface">
      <text x={250} y={30} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Elevator deflected up, seen from the left
      </text>

      {/* Fixed surface ahead of the hinge. */}
      <path
        d={`M40 ${hinge.y - 9} L${hinge.x} ${hinge.y - 7} L${hinge.x} ${hinge.y + 7} L40 ${hinge.y + 9} Z`}
        fill="var(--color-surface-3)"
        stroke={MUTED}
        strokeWidth={1.3}
      />
      <text x={95} y={hinge.y + 30} textAnchor="middle" fontSize={9.6} fontWeight={650} fill={MUTED}>
        Horizontal stabiliser
      </text>

      {/* Control surface. */}
      <g transform={`rotate(${angle} ${hinge.x} ${hinge.y})`}>
        <rect
          x={hinge.x}
          y={hinge.y - 7}
          width={surfaceLen}
          height={14}
          rx={3}
          fill="color-mix(in srgb, var(--color-navy) 12%, transparent)"
          stroke={NAVY}
          strokeWidth={1.7}
        />
        {/* Trim tab, hinged at the trailing edge. */}
        <g transform={`rotate(${tabAngle} ${hinge.x + surfaceLen} ${hinge.y})`}>
          <rect
            x={hinge.x + surfaceLen}
            y={hinge.y - 6}
            width={tabLen}
            height={12}
            rx={2.5}
            fill={trimmed ? `color-mix(in srgb, ${GO} 26%, transparent)` : "var(--color-surface-2)"}
            stroke={trimmed ? GO : MUTED}
            strokeWidth={trimmed ? 2.1 : 1.4}
          />
        </g>
      </g>

      {/* Hinge line. */}
      <circle cx={hinge.x} cy={hinge.y} r={5} fill="var(--color-surface)" stroke={NOGO} strokeWidth={2.2} />
      <text x={hinge.x} y={hinge.y - 16} textAnchor="middle" fontSize={9.8} fontWeight={800} fill={NOGO}>
        HINGE LINE
      </text>

      {/* The two moments. */}
      <text x={250} y={228} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={trimmed ? GO : CAUTION}>
        {trimmed
          ? "Tab moment = elevator moment · sum is zero · hands off"
          : "Elevator moment is unopposed · the pilot must hold the stick"}
      </text>
      <text x={250} y={250} textAnchor="middle" fontSize={10.6} fontWeight={650} fill={MUTED}>
        {trimmed
          ? "The tab's force is SMALL, but its moment arm is LONG"
          : "Airflow pushes the deflected surface back toward the neutral position"}
      </text>
      <text x={250} y={272} textAnchor="middle" fontSize={10.6} fontWeight={800} fill={BRAND}>
        For trimming, the tab always moves OPPOSITE the control surface
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* 2.122 — the three tab types                                         */
/* ------------------------------------------------------------------ */

const TAB_TYPES = {
  servo: {
    label: "Servo",
    tab: -30,
    effect: "Moves OPPOSITE the surface",
    feel: "HELPS the pilot deflect it — easier to manoeuvre",
    fitted: "Generally on ailerons",
    tone: GO,
  },
  antiservo: {
    label: "Anti-servo",
    tab: 34,
    effect: "Moves the SAME direction, at a faster rate",
    feel: "Requires MORE force to hold at full deflection",
    fitted: "T-6B rudder",
    tone: NOGO,
  },
  neutral: {
    label: "Neutral",
    tab: 0,
    effect: "Holds a CONSTANT angle to the surface",
    feel: "Neither helps nor resists",
    fitted: "T-6B elevator and ailerons",
    tone: BRAND,
  },
} as const;

/** Servo, anti-servo and neutral tabs, drawn by what they do to the pilot's hand. */
export function TabTypes(p: DiagramProps) {
  const kind = str<keyof typeof TAB_TYPES>(p.kind, "servo");
  const t = TAB_TYPES[kind];

  const hinge = { x: 150, y: 132 };
  const len = 132;
  const angle = -16;

  return (
    <Diagram title={`${t.label} trim tab`}>
      <path
        d={`M40 ${hinge.y - 8} L${hinge.x} ${hinge.y - 7} L${hinge.x} ${hinge.y + 7} L40 ${hinge.y + 8} Z`}
        fill="var(--color-surface-3)"
        stroke={MUTED}
        strokeWidth={1.3}
      />
      <g transform={`rotate(${angle} ${hinge.x} ${hinge.y})`}>
        <rect
          x={hinge.x}
          y={hinge.y - 7}
          width={len}
          height={14}
          rx={3}
          fill="color-mix(in srgb, var(--color-navy) 12%, transparent)"
          stroke={NAVY}
          strokeWidth={1.7}
        />
        <g transform={`rotate(${t.tab} ${hinge.x + len} ${hinge.y})`}>
          <rect
            x={hinge.x + len}
            y={hinge.y - 6}
            width={40}
            height={12}
            rx={2.5}
            fill={`color-mix(in srgb, ${t.tone} 28%, transparent)`}
            stroke={t.tone}
            strokeWidth={2.1}
          />
        </g>
      </g>
      <circle cx={hinge.x} cy={hinge.y} r={4.5} fill="var(--color-surface)" stroke={MUTED} strokeWidth={2} />

      <rect x={30} y={186} width={440} height={84} rx={12} fill="var(--color-surface-2)" stroke={t.tone} strokeWidth={1.4} />
      <text x={48} y={210} fontSize={10.5} fontWeight={800} fill={t.tone}>
        {t.effect.toUpperCase()}
      </text>
      <text x={48} y={232} fontSize={11.4} fontWeight={650} fill={NAVY}>
        {t.feel}
      </text>
      <text x={48} y={254} fontSize={10.6} fontWeight={700} fill={MUTED}>
        {t.fitted}
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* 2.119 / 2.120 — mass balance and the hinge line                     */
/* ------------------------------------------------------------------ */

/**
 * Where the control surface's centre of gravity sits, and what that buys.
 *
 * The guide is explicit that this is a design trade: forward of the hinge for
 * stability, aft of it for response, and the T-6B deliberately on it.
 */
export function HingeLineBalance(p: DiagramProps) {
  /** -1 forward of the hinge, 0 on it, +1 aft of it. */
  const pos = num(p.cg, 0);
  const hinge = { x: 210, y: 136 };
  const cgX = hinge.x + pos * 52;

  const verdict =
    pos < -0.5
      ? {
          who: "Transports and bombers",
          gets: "MORE control-free stability",
          why: "Stays aligned with the fixed surface when struck by a gust",
          tone: BRAND,
        }
      : pos > 0.5
        ? {
            who: "High-performance aircraft",
            gets: "FASTER response, more manoeuvrable",
            why: "The surface floats into the relative wind and displaces further",
            tone: NOGO,
          }
        : {
            who: "The T-6B",
            gets: "A balance of response and stability",
            why: "Weights forward of the hinge put the CG exactly on the hinge line",
            tone: GO,
          };

  return (
    <Diagram title="Control surface CG against the hinge line">
      <path
        d={`M50 ${hinge.y - 9} L${hinge.x} ${hinge.y - 8} L${hinge.x} ${hinge.y + 8} L50 ${hinge.y + 9} Z`}
        fill="var(--color-surface-3)"
        stroke={MUTED}
        strokeWidth={1.3}
      />
      <rect
        x={hinge.x}
        y={hinge.y - 8}
        width={186}
        height={16}
        rx={3}
        fill="color-mix(in srgb, var(--color-navy) 10%, transparent)"
        stroke={NAVY}
        strokeWidth={1.7}
      />
      {/* Overhang forward of the hinge, where the balance weights live. */}
      <rect
        x={hinge.x - 42}
        y={hinge.y - 7}
        width={42}
        height={14}
        rx={3}
        fill="color-mix(in srgb, var(--color-navy) 18%, transparent)"
        stroke={NAVY}
        strokeWidth={1.4}
      />
      <text x={hinge.x - 21} y={hinge.y + 30} textAnchor="middle" fontSize={9.4} fontWeight={650} fill={MUTED}>
        overhang
      </text>

      <line x1={hinge.x} y1={hinge.y - 40} x2={hinge.x} y2={hinge.y + 40} stroke={NOGO} strokeWidth={2} strokeDasharray="5 4" />
      <text x={hinge.x} y={hinge.y - 48} textAnchor="middle" fontSize={9.8} fontWeight={800} fill={NOGO}>
        HINGE LINE
      </text>

      {/* The CG marker. */}
      <circle cx={cgX} cy={hinge.y} r={9} fill="var(--color-surface)" stroke={verdict.tone} strokeWidth={2.6} />
      <circle cx={cgX} cy={hinge.y} r={3.4} fill={verdict.tone} />
      <text x={cgX} y={hinge.y + 34} textAnchor="middle" fontSize={10} fontWeight={800} fill={verdict.tone}>
        CG
      </text>

      <rect x={30} y={190} width={440} height={82} rx={12} fill="var(--color-surface-2)" stroke={verdict.tone} strokeWidth={1.4} />
      <text x={48} y={214} fontSize={10.5} fontWeight={800} fill={verdict.tone}>
        {verdict.who.toUpperCase()}
      </text>
      <text x={48} y={236} fontSize={11.6} fontWeight={700} fill={NAVY}>
        {verdict.gets}
      </text>
      <text x={48} y={257} fontSize={10.5} fontWeight={650} fill={MUTED}>
        {verdict.why}
      </text>
    </Diagram>
  );
}
