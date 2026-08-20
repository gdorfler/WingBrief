"use client";

/**
 * Shared SVG primitives for every technical diagram in the app.
 *
 * Diagrams are interface, not decoration: axes, gridlines and labels follow one
 * visual grammar so a student reading their fifth drag curve does not have to
 * re-learn what a dashed line means.
 */

import { type ReactNode } from "react";

export const DIAGRAM_W = 500;
export const DIAGRAM_H = 300;

export interface Plot {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Data-space → pixel-space. */
  sx: (v: number) => number;
  sy: (v: number) => number;
  w: number;
  h: number;
}

export function makePlot(opts: {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  width?: number;
  height?: number;
}): Plot {
  const {
    left = 46,
    right = 18,
    top = 20,
    bottom = 38,
    xMin = 0,
    xMax = 1,
    yMin = 0,
    yMax = 1,
    width = DIAGRAM_W,
    height = DIAGRAM_H,
  } = opts;
  const x0 = left;
  const x1 = width - right;
  const y0 = height - bottom;
  const y1 = top;
  return {
    x0,
    y0,
    x1,
    y1,
    w: x1 - x0,
    h: y0 - y1,
    sx: (v) => x0 + ((v - xMin) / (xMax - xMin)) * (x1 - x0),
    sy: (v) => y0 - ((v - yMin) / (yMax - yMin)) * (y0 - y1),
  };
}

/** Root <svg> for every diagram. */
export function Diagram({
  children,
  width = DIAGRAM_W,
  height = DIAGRAM_H,
  ink = false,
  title,
  className = "",
}: {
  children: ReactNode;
  width?: number;
  height?: number;
  ink?: boolean;
  title: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`diagram ${ink ? "diagram-ink" : ""} ${className}`}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

export function Axes({
  plot,
  xLabel,
  yLabel,
  xTicks = 0,
  yTicks = 0,
  grid = true,
}: {
  plot: Plot;
  xLabel?: string;
  yLabel?: string;
  xTicks?: number;
  yTicks?: number;
  grid?: boolean;
}) {
  const gx = Array.from({ length: xTicks }, (_, i) => plot.x0 + ((i + 1) * plot.w) / (xTicks + 1));
  const gy = Array.from({ length: yTicks }, (_, i) => plot.y0 - ((i + 1) * plot.h) / (yTicks + 1));
  return (
    <g>
      {grid &&
        gx.map((x) => (
          <line key={`gx${x}`} className="grid" x1={x} y1={plot.y1} x2={x} y2={plot.y0} />
        ))}
      {grid &&
        gy.map((y) => (
          <line key={`gy${y}`} className="grid" x1={plot.x0} y1={y} x2={plot.x1} y2={y} />
        ))}
      <line className="axis" x1={plot.x0} y1={plot.y0} x2={plot.x1} y2={plot.y0} />
      <line className="axis" x1={plot.x0} y1={plot.y0} x2={plot.x0} y2={plot.y1} />
      {xLabel && (
        <text x={(plot.x0 + plot.x1) / 2} y={plot.y0 + 26} textAnchor="middle">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          transform={`translate(14 ${(plot.y0 + plot.y1) / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          {yLabel}
        </text>
      )}
    </g>
  );
}

/** Samples f across the plot's x-range and returns an SVG path. */
export function curvePath(
  plot: Plot,
  f: (t: number) => number,
  opts: { from?: number; to?: number; steps?: number; clampTop?: number } = {},
): string {
  const { from = 0, to = 1, steps = 96, clampTop } = opts;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    let v = f(t);
    if (clampTop !== undefined) v = Math.min(v, clampTop);
    if (!Number.isFinite(v)) continue;
    const x = plot.sx(t);
    const y = plot.sy(v);
    d += `${d === "" ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

export function Curve({
  d,
  color,
  width = 2.5,
  dashed = false,
  opacity = 1,
  label,
  labelAt,
}: {
  d: string;
  color: string;
  width?: number;
  dashed?: boolean;
  opacity?: number;
  label?: string;
  labelAt?: { x: number; y: number };
}) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashed ? "6 5" : undefined}
        opacity={opacity}
      />
      {label && labelAt && (
        <text
          x={labelAt.x}
          y={labelAt.y}
          fill={color}
          fontWeight={650}
          fontSize={11}
          opacity={opacity}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Circular marker with an optional callout label. */
export function Marker({
  x,
  y,
  color = "var(--color-navy)",
  label,
  side = "right",
  r = 5,
  pulse = false,
}: {
  x: number;
  y: number;
  color?: string;
  label?: string;
  side?: "right" | "left" | "top" | "bottom";
  r?: number;
  pulse?: boolean;
}) {
  const dx = side === "right" ? r + 8 : side === "left" ? -(r + 8) : 0;
  const dy = side === "top" ? -(r + 9) : side === "bottom" ? r + 15 : 4;
  const anchor = side === "left" ? "end" : side === "right" ? "start" : "middle";
  return (
    <g>
      {pulse && (
        <circle cx={x} cy={y} r={r + 5} fill={color} opacity={0.16}>
          <animate
            attributeName="r"
            values={`${r + 3};${r + 9};${r + 3}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.22;0.04;0.22"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      <circle cx={x} cy={y} r={r} fill="var(--color-surface)" stroke={color} strokeWidth={2.5} />
      {label && (
        <text x={x + dx} y={y + dy} textAnchor={anchor} fill={color} fontWeight={700} fontSize={11}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Arrowhead marker defs, referenced by id from any diagram. */
export function ArrowDefs({ colors }: { colors: Record<string, string> }) {
  return (
    <defs>
      {Object.entries(colors).map(([id, color]) => (
        <marker
          key={id}
          id={`arrow-${id}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  id,
  width = 2.5,
  dashed = false,
  label,
  labelOffset = { x: 0, y: -6 },
  opacity = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  id: string;
  width?: number;
  dashed?: boolean;
  label?: string;
  labelOffset?: { x: number; y: number };
  opacity?: number;
}) {
  return (
    <g opacity={opacity}>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? "5 4" : undefined}
        markerEnd={`url(#arrow-${id})`}
      />
      {label && (
        <text
          x={x2 + labelOffset.x}
          y={y2 + labelOffset.y}
          fill={color}
          fontWeight={700}
          fontSize={11}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Airfoil outline generated from camber and thickness so every diagram that
 * shows a wing shows the SAME wing.
 */
export function airfoilPath(opts: {
  x: number;
  y: number;
  chord: number;
  camber?: number;
  thickness?: number;
  aoaDeg?: number;
}): { d: string; chordLine: [number, number, number, number]; mclPath: string } {
  const { x, y, chord, camber = 0.05, thickness = 0.12, aoaDeg = 0 } = opts;
  const a = (-aoaDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const rot = (px: number, py: number): [number, number] => [
    x + px * cos - py * sin,
    y + px * sin + py * cos,
  ];

  const N = 40;
  const camberAt = (t: number) => -camber * chord * 4 * t * (1 - t);
  const thickAt = (t: number) =>
    (thickness * chord) *
    (1.4845 * Math.sqrt(t) - 0.63 * t - 1.758 * t ** 2 + 1.4215 * t ** 3 - 0.5075 * t ** 4);

  const upper: [number, number][] = [];
  const lower: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const px = t * chord;
    const yc = camberAt(t);
    const th = thickAt(t);
    upper.push(rot(px, yc - th));
    lower.push(rot(px, yc + th));
  }

  const d =
    `M${upper[0][0].toFixed(2)} ${upper[0][1].toFixed(2)}` +
    upper.slice(1).map((p) => `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join("") +
    lower
      .reverse()
      .map((p) => `L${p[0].toFixed(2)} ${p[1].toFixed(2)}`)
      .join("") +
    "Z";

  const [cx0, cy0] = rot(0, 0);
  const [cx1, cy1] = rot(chord, 0);

  let mcl = "";
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const [mx, my] = rot(t * chord, camberAt(t));
    mcl += `${i === 0 ? "M" : "L"}${mx.toFixed(2)} ${my.toFixed(2)}`;
  }

  return { d, chordLine: [cx0, cy0, cx1, cy1], mclPath: mcl };
}

/** Small pill used to label a region of a chart. */
export function RegionLabel({
  x,
  y,
  text,
  color = "var(--color-navy-soft)",
  bg = "var(--color-surface-2)",
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  bg?: string;
}) {
  const w = text.length * 5.8 + 16;
  return (
    <g>
      <rect x={x - w / 2} y={y - 10} width={w} height={20} rx={10} fill={bg} opacity={0.94} />
      <text x={x} y={y + 4} textAnchor="middle" fill={color} fontWeight={700} fontSize={10.5}>
        {text}
      </text>
    </g>
  );
}

/** Shaded band, used for stall regions, envelopes and danger zones. */
export function Band({
  plot,
  from,
  to,
  color,
  opacity = 0.08,
}: {
  plot: Plot;
  from: number;
  to: number;
  color: string;
  opacity?: number;
}) {
  const x = plot.sx(from);
  const w = plot.sx(to) - x;
  return (
    <rect x={x} y={plot.y1} width={w} height={plot.h} fill={color} opacity={opacity} />
  );
}

/** Simple aircraft silhouette (top view) used by turn and wake diagrams. */
export function AircraftTop({
  x,
  y,
  scale = 1,
  rotate = 0,
  fill = "var(--color-navy)",
  opacity = 1,
}: {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  fill?: string;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
      <path
        d="M0 -22 L3.4 -12 L3.4 -2 L26 6 L26 11 L3.4 6.5 L3.4 14 L9 19 L9 22 L0 20 L-9 22 L-9 19 L-3.4 14 L-3.4 6.5 L-26 11 L-26 6 L-3.4 -2 L-3.4 -12 Z"
        fill={fill}
      />
    </g>
  );
}

/** Aircraft silhouette (side view) used by AOA, climb and glide diagrams. */
export function AircraftSide({
  x,
  y,
  scale = 1,
  rotate = 0,
  fill = "var(--color-navy)",
  opacity = 1,
}: {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  fill?: string;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} opacity={opacity}>
      <path
        d="M-30 0 C-30 -3.4 -26 -5 -18 -5.4 L4 -6 C12 -6 22 -3.6 30 0 C22 3.6 12 6 4 6 L-18 5.4 C-26 5 -30 3.4 -30 0 Z"
        fill={fill}
      />
      <path d="M-4 -1 L-13 -16 L-8 -16 L4 -1 Z" fill={fill} />
      <path d="M-22 -1 L-30 -13 L-26 -13 L-18 -1 Z" fill={fill} opacity={0.75} />
      <path d="M-2 1 L-12 12 L-6 12 L4 1 Z" fill={fill} opacity={0.55} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Prop coercion                                                       */
/* ------------------------------------------------------------------ */

/**
 * Diagrams receive loosely-typed prop bags from lesson screens, explainer
 * frames and question specs. These helpers read them safely with a default.
 */
export type DiagramProps = Record<string, unknown>;

export function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function str<T extends string>(v: unknown, fallback: T): T {
  return typeof v === "string" ? (v as T) : fallback;
}

export function maybeNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
