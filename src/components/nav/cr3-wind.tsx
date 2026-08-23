"use client";

/**
 * The CR-3 air navigation computer — wind side.
 *
 * Three problems live on this face and they are the same problem viewed from
 * different corners: preflight winds (course and wind known, find heading and
 * groundspeed), in-flight winds (heading and track known, find the wind), and
 * TACAN point-to-point, which is not a wind problem at all but uses the same
 * grid as a map with the station at the centre.
 *
 * As on the calculation side, the tool renders the instrument and the student
 * works it. The crab scale is a real logarithmic scale geared to
 * crab ≈ 57.3 × crosswind ÷ TAS, so setting TAS against the index and reading
 * a crosswind gives the angle the physical device gives — which is also where
 * the ten percent rule comes from. Nothing here prints an answer.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import { Eraser, RotateCcw } from "lucide-react";
import {
  WIND_SCALE_MAX,
  type WindScale,
  buildTicks,
  normalizeRotation,
  rotationFor,
  valueToAngle,
} from "@/lib/nav/slide-rule";
import { cn } from "../ui";

const SIZE = 460;
const C = SIZE / 2;

const R = {
  outerEdge: 218,
  outerTick: 206,
  outerLabel: 190,
  middleEdge: 178,
  middleTick: 172,
  middleLabel: 158,
  rose: 146,
  roseLabel: 133,
  grid: 122,
};

/** The crab scale is geared so that a crosswind equal to TAS reads 57.3°. */
const CRAB_INDEX_VALUE = 57.29577951308232;

export type WindMode = "preflight" | "inflight" | "pointToPoint";

export interface WindDot {
  /** Grid units: +x right of the vertical axis, +y below centre. */
  x: number;
  y: number;
  label?: string;
}

export interface Cr3WindProps {
  mode?: WindMode;
  training?: boolean;
  /** Controlled compass-rose rotation, for replays. */
  roseRotation?: number;
  onRoseRotationChange?: (deg: number) => void;
  dots?: WindDot[];
  onDotsChange?: (dots: WindDot[]) => void;
  compact?: boolean;
}

export function Cr3Wind({
  mode = "preflight",
  training = true,
  roseRotation: controlledRose,
  onRoseRotationChange,
  dots: controlledDots,
  onDotsChange,
  compact = false,
}: Cr3WindProps) {
  const [internalRose, setInternalRose] = useState(0);
  const rose = controlledRose ?? internalRose;
  const setRose = useCallback(
    (v: number) => {
      const next = normalizeRotation(v);
      if (controlledRose === undefined) setInternalRose(next);
      onRoseRotationChange?.(next);
    },
    [controlledRose, onRoseRotationChange],
  );

  const [internalDots, setInternalDots] = useState<WindDot[]>([]);
  const dots = controlledDots ?? internalDots;
  const setDots = useCallback(
    (next: WindDot[]) => {
      if (controlledDots === undefined) setInternalDots(next);
      onDotsChange?.(next);
    },
    [controlledDots, onDotsChange],
  );

  const [middle, setMiddle] = useState(0);
  const [scale, setScale] = useState<WindScale>("large");

  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ target: "rose" | "middle"; startAngle: number; startValue: number } | null>(
    null,
  );

  const maxValue = mode === "pointToPoint" ? 80 : WIND_SCALE_MAX[scale];
  /** Pixels per unit on the grid. */
  const unit = R.grid / maxValue;

  const localPoint = useCallback((event: React.PointerEvent | React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SIZE - C,
      y: ((event.clientY - rect.top) / rect.height) * SIZE - C,
    };
  }, []);

  const pointerAngle = useCallback(
    (event: React.PointerEvent) => {
      const p = localPoint(event);
      return (Math.atan2(p.x, -p.y) * 180) / Math.PI;
    },
    [localPoint],
  );

  const startDrag = (target: "rose" | "middle") => (event: React.PointerEvent) => {
    event.preventDefault();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    drag.current = {
      target,
      startAngle: pointerAngle(event),
      startValue: target === "rose" ? rose : middle,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const delta = pointerAngle(event) - d.startAngle;
    if (d.target === "rose") setRose(d.startValue + delta);
    else setMiddle(normalizeRotation(d.startValue + delta));
  };

  const endDrag = () => {
    drag.current = null;
  };

  /** Clicking the grid plots a point, in grid units, in the rose's frame. */
  const plot = (event: React.MouseEvent) => {
    if (drag.current) return;
    const p = localPoint(event);
    if (Math.hypot(p.x, p.y) > R.grid + 6) return;
    // Undo the rose rotation so the dot is stored in the rose's own frame and
    // travels with it, the way a pencil mark on the disc does.
    const rad = (-rose * Math.PI) / 180;
    const rx = p.x * Math.cos(rad) - p.y * Math.sin(rad);
    const ry = p.x * Math.sin(rad) + p.y * Math.cos(rad);
    const limit = mode === "pointToPoint" ? 2 : 1;
    const next: WindDot[] = [
      ...dots.slice(Math.max(0, dots.length - limit + 1)),
      { x: rx / unit, y: ry / unit },
    ];
    setDots(next);
  };

  const ticks = useMemo(() => buildTicks(), []);
  const ringStep = maxValue / 4;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "instrument-face relative mx-auto w-full overflow-hidden rounded-full",
          compact ? "max-w-[320px]" : "max-w-[460px]",
        )}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="block w-full touch-none select-none"
          role="img"
          aria-label={`CR-3 wind side, ${mode} mode. Compass rose at ${Math.round(rose)} degrees.`}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          {/* ---------- Outer: airspeed and crosswind ---------- */}
          <circle cx={C} cy={C} r={R.outerEdge} fill="#fbfaf6" stroke="var(--color-line-strong)" />
          {ticks.map((t) => (
            <RadialTick
              key={`w-o-${t.value}`}
              angle={t.angle}
              from={R.outerTick}
              length={t.weight === "major" ? 13 : t.weight === "mid" ? 9 : 5}
              label={t.label}
              labelRadius={R.outerLabel}
              weight={t.weight}
            />
          ))}
          {training && (
            <CurvedNote text="AIRSPEED · CROSSWIND" radius={R.outerEdge - 7} angle={180} />
          )}

          {/* ---------- Middle: the crab and drift scale ---------- */}
          <g
            transform={`rotate(${middle} ${C} ${C})`}
            onPointerDown={startDrag("middle")}
            className="cursor-grab active:cursor-grabbing"
          >
            <circle cx={C} cy={C} r={R.middleEdge} fill="#eeece3" stroke="var(--color-line-strong)" />
            {ticks
              .filter((t) => t.value <= 60)
              .map((t) => (
                <RadialTick
                  key={`w-m-${t.value}`}
                  angle={t.angle}
                  from={R.middleTick}
                  length={t.weight === "major" ? -12 : t.weight === "mid" ? -8 : -5}
                  label={t.label ? String(Number(t.label) / 10) : undefined}
                  labelRadius={R.middleLabel}
                  weight={t.weight}
                  tone="pencil"
                />
              ))}
            {/* The TAS index: put the airspeed over this before reading crab. */}
            <g transform={`rotate(${valueToAngle(CRAB_INDEX_VALUE)} ${C} ${C})`}>
              <path
                d={`M ${C} ${C - R.middleEdge} l -8 -13 l 16 0 Z`}
                fill="var(--color-brand)"
                stroke="var(--color-brand-dark)"
                strokeWidth={0.7}
              />
              {training && (
                <text
                  x={C}
                  y={C - R.middleEdge - 17}
                  textAnchor="middle"
                  fontSize={7.5}
                  fontWeight={800}
                  letterSpacing="0.1em"
                  fill="var(--color-brand-dark)"
                  transform={`rotate(${-valueToAngle(CRAB_INDEX_VALUE) - middle} ${C} ${C - R.middleEdge - 17})`}
                >
                  TAS
                </text>
              )}
            </g>
            {training && <CurvedNote text="CRAB · DRIFT" radius={R.middleEdge - 8} angle={180} tone="pencil" />}
          </g>

          {/* ---------- The compass rose and its grid ---------- */}
          <g transform={`rotate(${rose} ${C} ${C})`}>
            <circle
              cx={C}
              cy={C}
              r={R.rose}
              fill="#fdfcf7"
              stroke="var(--color-line-strong)"
              onPointerDown={startDrag("rose")}
              className="cursor-grab active:cursor-grabbing"
            />
            {Array.from({ length: 72 }, (_, i) => i * 5).map((deg) => (
              <g key={`rose-${deg}`} transform={`rotate(${deg} ${C} ${C})`}>
                <line
                  x1={C}
                  y1={C - R.rose}
                  x2={C}
                  y2={C - R.rose + (deg % 30 === 0 ? 10 : deg % 10 === 0 ? 6 : 3.5)}
                  stroke="var(--color-ink-700)"
                  strokeWidth={deg % 30 === 0 ? 1.1 : 0.5}
                  opacity={deg % 10 === 0 ? 0.9 : 0.5}
                />
                {deg % 30 === 0 && (
                  <text
                    x={C}
                    y={C - R.roseLabel}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={9.5}
                    fontWeight={700}
                    className="figure"
                    fill="var(--color-ink-800)"
                    transform={`rotate(${-deg - rose} ${C} ${C - R.roseLabel})`}
                  >
                    {String(deg === 0 ? 36 : deg / 10).padStart(2, "0")}
                  </text>
                )}
              </g>
            ))}

            {/* The grid: range rings and the head/tail and crosswind axes. */}
            <g pointerEvents="none">
              {[1, 2, 3, 4].map((i) => (
                <circle
                  key={`ring-${i}`}
                  cx={C}
                  cy={C}
                  r={i * (R.grid / 4)}
                  fill="none"
                  stroke="var(--color-brand)"
                  strokeWidth={0.7}
                  opacity={0.4}
                />
              ))}
              <line
                x1={C}
                y1={C - R.grid}
                x2={C}
                y2={C + R.grid}
                stroke="var(--color-brand)"
                strokeWidth={1}
                opacity={0.65}
              />
              <line
                x1={C - R.grid}
                y1={C}
                x2={C + R.grid}
                y2={C}
                stroke="var(--color-brand)"
                strokeWidth={1}
                opacity={0.65}
              />
              {[1, 2, 3, 4].map((i) => (
                <g key={`gl-${i}`}>
                  <text
                    x={C + 5}
                    y={C - i * (R.grid / 4) + 3}
                    fontSize={8}
                    className="figure"
                    fill="var(--color-brand-dark)"
                    transform={`rotate(${-rose} ${C + 5} ${C - i * (R.grid / 4) + 3})`}
                  >
                    {Math.round(i * ringStep)}
                  </text>
                  <text
                    x={C + i * (R.grid / 4)}
                    y={C - 5}
                    fontSize={8}
                    textAnchor="middle"
                    className="figure"
                    fill="var(--color-brand-dark)"
                    transform={`rotate(${-rose} ${C + i * (R.grid / 4)} ${C - 5})`}
                  >
                    {Math.round(i * ringStep)}
                  </text>
                </g>
              ))}
            </g>

            {/* Plotted marks travel with the disc, as pencil marks do. */}
            {dots.map((dot, i) => (
              <PlottedDot
                key={i}
                x={C + dot.x * unit}
                y={C + dot.y * unit}
                index={i}
                total={dots.length}
                mode={mode}
                counterRotate={-rose}
              />
            ))}

            {/* The lines the student draws to the two axes. */}
            {mode !== "pointToPoint" &&
              dots.length > 0 &&
              (() => {
                const d = dots[dots.length - 1];
                return (
                  <g pointerEvents="none">
                    <line
                      x1={C + d.x * unit}
                      y1={C + d.y * unit}
                      x2={C + d.x * unit}
                      y2={C}
                      className="pencil-line"
                      strokeDasharray="4 3"
                    />
                    <line
                      x1={C + d.x * unit}
                      y1={C + d.y * unit}
                      x2={C}
                      y2={C + d.y * unit}
                      className="pencil-line"
                      strokeDasharray="4 3"
                    />
                  </g>
                );
              })()}

            {mode === "pointToPoint" && dots.length === 2 && (
              <line
                x1={C + dots[0].x * unit}
                y1={C + dots[0].y * unit}
                x2={C + dots[1].x * unit}
                y2={C + dots[1].y * unit}
                className="plot-line"
                pointerEvents="none"
              />
            )}
          </g>

          {/* Transparent capture layer for plotting, above the rose. */}
          <circle
            cx={C}
            cy={C}
            r={R.grid}
            fill="transparent"
            onClick={plot}
            className="cursor-crosshair"
          />

          {/* ---------- The fixed course index at twelve o'clock ---------- */}
          <g pointerEvents="none">
            <path
              d={`M ${C} ${C - R.rose - 2} l -9 -15 l 18 0 Z`}
              fill="var(--color-ink-800)"
            />
            {training && (
              <text
                x={C}
                y={C - R.rose - 21}
                textAnchor="middle"
                fontSize={7.5}
                fontWeight={800}
                letterSpacing="0.1em"
                fill="var(--color-ink-800)"
              >
                {mode === "inflight" ? "TRACK" : mode === "pointToPoint" ? "COURSE" : "TC"}
              </text>
            )}
          </g>

          <circle cx={C} cy={C} r={4.5} fill="var(--color-ink-800)" pointerEvents="none" />
        </svg>
      </div>

      {/* ---------- Controls ---------- */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {mode !== "pointToPoint" && (
          <div className="flex overflow-hidden rounded-lg border border-line-strong">
            {(["large", "small"] as WindScale[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  scale === s ? "bg-brand text-white" : "bg-surface text-navy-soft hover:bg-surface-2",
                )}
              >
                {s === "large" ? "0–80" : "0–160"}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setDots([])}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2.5 text-[11px] font-semibold text-navy-soft hover:bg-surface-2"
        >
          <Eraser size={13} />
          Erase
        </button>
        <button
          type="button"
          onClick={() => {
            setRose(0);
            setMiddle(0);
            setDots([]);
          }}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2.5 text-[11px] font-semibold text-navy-soft hover:bg-surface-2"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {training && (
        <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-1.5 rounded-xl bg-surface-2 px-2.5 py-2">
          <span className="text-[11px] font-semibold text-navy-soft">Set TAS</span>
          <TasSetter onSet={(tas) => setMiddle(rotationFor(tas, CRAB_INDEX_VALUE))} />
          <span className="text-[11px] font-semibold text-navy-soft">· rose to</span>
          <RoseSetter onSet={(deg) => setRose(-deg)} />
        </div>
      )}

      <p className="text-center text-[11px] leading-relaxed text-navy-faint">
        {mode === "pointToPoint" ? (
          <>
            Plot both fixes as radial and DME, turn the line vertical with the destination on top,
            then read the course at the index and the distance off the grid.
          </>
        ) : (
          <>
            Erase between problems. Choose one grid scale and stay on it —{" "}
            <span className="font-semibold text-navy-soft">mixing the two is the classic miss.</span>
          </>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function RadialTick({
  angle,
  from,
  length,
  label,
  labelRadius,
  weight,
  tone = "ink",
}: {
  angle: number;
  from: number;
  length: number;
  label?: string;
  labelRadius: number;
  weight: "major" | "mid" | "minor";
  tone?: "ink" | "pencil";
}) {
  const colour = tone === "pencil" ? "var(--color-pencil)" : "var(--color-ink-800)";
  return (
    <g transform={`rotate(${angle} ${C} ${C})`}>
      <line
        x1={C}
        y1={C - from}
        x2={C}
        y2={C - from + length}
        stroke={colour}
        strokeWidth={weight === "major" ? 1.2 : weight === "mid" ? 0.8 : 0.45}
        opacity={weight === "minor" ? 0.6 : 1}
      />
      {label && (
        <text
          x={C}
          y={C - labelRadius}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={700}
          className="figure"
          fill={colour}
          transform={`rotate(${-angle} ${C} ${C - labelRadius})`}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function PlottedDot({
  x,
  y,
  index,
  total,
  mode,
  counterRotate,
}: {
  x: number;
  y: number;
  index: number;
  total: number;
  mode: WindMode;
  counterRotate: number;
}) {
  const isDestination = mode === "pointToPoint" && index === total - 1 && total === 2;
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={3.2} fill="var(--color-plot)" />
      <circle
        cx={x}
        cy={y}
        r={isDestination ? 9 : 7}
        fill="none"
        stroke="var(--color-plot)"
        strokeWidth={isDestination ? 1.8 : 1}
      />
      {mode === "pointToPoint" && (
        <text
          x={x + 12}
          y={y + 3.5}
          fontSize={9}
          fontWeight={800}
          fill="var(--color-brand-dark)"
          transform={`rotate(${counterRotate} ${x + 12} ${y + 3.5})`}
        >
          {index === 0 ? "FROM" : "TO"}
        </text>
      )}
    </g>
  );
}

function CurvedNote({
  text,
  radius,
  angle,
  tone = "faint",
}: {
  text: string;
  radius: number;
  angle: number;
  tone?: "faint" | "pencil";
}) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return (
    <text
      x={C + radius * Math.cos(rad)}
      y={C + radius * Math.sin(rad)}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={7.5}
      fontWeight={800}
      letterSpacing="0.14em"
      fill={tone === "pencil" ? "var(--color-pencil)" : "var(--color-navy-faint)"}
    >
      {text}
    </text>
  );
}

function TasSetter({ onSet }: { onSet: (tas: number) => void }) {
  const [value, setValue] = useState("");
  const n = Number(value);
  return (
    <span className="inline-flex items-center gap-1">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => Number.isFinite(n) && n > 0 && onSet(n)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && Number.isFinite(n) && n > 0) onSet(n);
        }}
        inputMode="numeric"
        placeholder="325"
        aria-label="True airspeed"
        className="figure h-7 w-16 rounded-md border border-line-strong bg-surface px-2 text-[12px] text-navy"
      />
    </span>
  );
}

function RoseSetter({ onSet }: { onSet: (deg: number) => void }) {
  const [value, setValue] = useState("");
  const n = Number(value);
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => Number.isFinite(n) && onSet(n)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && Number.isFinite(n)) onSet(n);
      }}
      inputMode="numeric"
      placeholder="218"
      aria-label="Direction to place at the index"
      className="figure h-7 w-16 rounded-md border border-line-strong bg-surface px-2 text-[12px] text-navy"
    />
  );
}

/** A miniature wind triangle, for lesson cards. */
export function WindTriangleGlyph({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <path d="M 7 33 L 26 9" stroke="var(--color-ink-700)" strokeWidth="1.6" fill="none" />
      <path d="M 26 9 L 33 15" stroke="var(--color-series-alt)" strokeWidth="1.6" fill="none" />
      <path d="M 7 33 L 33 15" className="plot-line" strokeWidth="1.6" />
      <circle cx="7" cy="33" r="2" fill="var(--color-ink-800)" />
      <path d="M 31.4 14 l 2.6 1 l -1.4 2.4 Z" fill="var(--color-plot)" />
    </svg>
  );
}
