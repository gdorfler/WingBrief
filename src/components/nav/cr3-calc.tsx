"use client";

/**
 * The CR-3 air navigation computer — calculation side.
 *
 * This is a slide rule, not a calculator, and the distinction is the whole
 * point of the tool. It renders the two logarithmic scales with the actual
 * graduation the guide describes, lets the student rotate the inner wheel,
 * and then stops. It never prints the value under the hairline. Reading the
 * scale — working out that this mark is worth two rather than five, and where
 * the decimal goes — is the skill, and a numeric readout would quietly delete
 * it while looking like a feature.
 *
 * What the tool does provide is what a real one does: faithful scales, the
 * three indexes, a cursor hairline, and a magnifier for leaning in. Training
 * mode adds the labels a student needs while learning where things are; the
 * ±1% tolerance the course grades to exists precisely because this reading is
 * done by eye.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import {
  HIGH_SPEED_INDEX,
  RATE_INDEX,
  UNIT_INDEX,
  buildHourMarks,
  buildTicks,
  normalizeRotation,
  rotationFor,
  valueToAngle,
} from "@/lib/nav/slide-rule";
import { Pill, cn } from "../ui";

const SIZE = 440;
const C = SIZE / 2;

/** Radii, outside in. */
const R = {
  outerEdge: 208,
  outerTick: 196,
  outerLabel: 178,
  gap: 168,
  innerTick: 166,
  innerLabel: 148,
  hourRing: 126,
  hourLabel: 113,
  hub: 40,
};

export type Cr3ScalePair = "distanceTime" | "fuelTime" | "poundsGallons";

const SCALE_LABELS: Record<Cr3ScalePair, { outer: string; inner: string }> = {
  distanceTime: { outer: "DISTANCE", inner: "TIME" },
  fuelTime: { outer: "FUEL — LB", inner: "TIME" },
  poundsGallons: { outer: "POUNDS", inner: "GALLONS" },
};

export interface Cr3CalcProps {
  /** Controlled rotation, for the worked-solution replay. */
  rotation?: number;
  onRotationChange?: (rotation: number) => void;
  /** Training mode names the indexes and scales; practice mode does not. */
  mode?: "training" | "practice";
  scales?: Cr3ScalePair;
  /** A value to highlight on the outer scale, used by guided steps. */
  highlightOuter?: number;
  /** An index to highlight, used by guided steps. */
  highlightIndex?: number;
  compact?: boolean;
}

export function Cr3Calc({
  rotation: controlled,
  onRotationChange,
  mode = "training",
  scales = "distanceTime",
  highlightOuter,
  highlightIndex,
  compact = false,
}: Cr3CalcProps) {
  const [internal, setInternal] = useState(0);
  const rotation = controlled ?? internal;
  const setRotation = useCallback(
    (next: number) => {
      const value = normalizeRotation(next);
      if (controlled === undefined) setInternal(value);
      onRotationChange?.(value);
    },
    [controlled, onRotationChange],
  );

  const [cursor, setCursor] = useState(0);
  const [magnify, setMagnify] = useState(false);
  const [scalePair, setScalePair] = useState<Cr3ScalePair>(scales);
  useEffect(() => setScalePair(scales), [scales]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const drag = useRef<{ target: "wheel" | "cursor"; startAngle: number; startValue: number } | null>(
    null,
  );

  const pointerAngle = useCallback((event: React.PointerEvent | PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * SIZE - C;
    const y = ((event.clientY - rect.top) / rect.height) * SIZE - C;
    return (Math.atan2(x, -y) * 180) / Math.PI;
  }, []);

  const startDrag = (target: "wheel" | "cursor") => (event: React.PointerEvent) => {
    event.preventDefault();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    drag.current = {
      target,
      startAngle: pointerAngle(event),
      startValue: target === "wheel" ? rotation : cursor,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const delta = pointerAngle(event) - d.startAngle;
    if (d.target === "wheel") setRotation(d.startValue + delta);
    else setCursor(normalizeRotation(d.startValue + delta));
  };

  const endDrag = () => {
    drag.current = null;
  };

  const ticks = useMemo(() => buildTicks(), []);
  const hourMarks = useMemo(() => buildHourMarks(), []);
  const labels = SCALE_LABELS[scalePair];
  const training = mode === "training";

  /** Nudge in tick-sized steps so a precise setup is reachable by keyboard. */
  const nudge = (degrees: number) => setRotation(rotation + degrees);

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "instrument-face relative mx-auto w-full overflow-hidden rounded-full",
          compact ? "max-w-[300px]" : "max-w-[440px]",
        )}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="block w-full touch-none select-none"
          role="img"
          aria-label={`CR-3 calculation side. Inner wheel rotated ${Math.round(rotation)} degrees.`}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <radialGradient id="cr3-hub" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d9d5c8" />
            </radialGradient>
            <clipPath id="cr3-lens">
              <circle cx={C} cy={C - 150} r={54} />
            </clipPath>
          </defs>

          {/* ---------- Outer wheel: the fixed base ---------- */}
          <circle cx={C} cy={C} r={R.outerEdge} fill="#fbfaf6" stroke="var(--color-line-strong)" />
          <circle cx={C} cy={C} r={R.gap} fill="#f0eee6" stroke="var(--color-line-strong)" />

          <g>
            {ticks.map((t) => (
              <ScaleTick
                key={`o-${t.value}`}
                angle={t.angle}
                weight={t.weight}
                label={t.label}
                from={R.outerTick}
                length={t.weight === "major" ? 15 : t.weight === "mid" ? 10 : 6}
                labelRadius={R.outerLabel}
                inward
                highlighted={
                  highlightOuter !== undefined &&
                  Math.abs(t.angle - valueToAngle(highlightOuter)) < 1.5
                }
              />
            ))}
          </g>

          {training && (
            <ArcLabel text={labels.outer} radius={R.outerEdge - 6} angle={132} tone="outer" />
          )}

          {/* ---------- Inner wheel: rotates ---------- */}
          <g
            transform={`rotate(${rotation} ${C} ${C})`}
            onPointerDown={startDrag("wheel")}
            className="cursor-grab active:cursor-grabbing"
          >
            <circle cx={C} cy={C} r={R.innerTick} fill="#e7e4d8" />
            <circle
              cx={C}
              cy={C}
              r={R.hourRing}
              fill="#f4f2ea"
              stroke="var(--color-line-strong)"
              strokeWidth={0.8}
            />

            {ticks.map((t) => (
              <ScaleTick
                key={`i-${t.value}`}
                angle={t.angle}
                weight={t.weight}
                label={t.label}
                from={R.innerTick}
                length={t.weight === "major" ? -15 : t.weight === "mid" ? -10 : -6}
                labelRadius={R.innerLabel}
                highlighted={
                  highlightIndex !== undefined &&
                  Math.abs(t.angle - valueToAngle(highlightIndex)) < 1.5
                }
              />
            ))}

            {/* The hour circle: minutes to hours with no arithmetic. */}
            {hourMarks.map((m) => (
              <g key={`h-${m.minutes}`} transform={`rotate(${m.angle} ${C} ${C})`}>
                <line
                  x1={C}
                  y1={C - R.hourRing}
                  x2={C}
                  y2={C - R.hourRing + (m.major ? 9 : 5)}
                  stroke="var(--color-pencil)"
                  strokeWidth={m.major ? 0.9 : 0.5}
                  opacity={0.8}
                />
                {m.major && m.minutes <= 720 && (
                  <text
                    x={C}
                    y={C - R.hourLabel}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={8.5}
                    className="figure"
                    fill="var(--color-pencil)"
                    transform={`rotate(${-m.angle - rotation} ${C} ${C - R.hourLabel})`}
                  >
                    {m.label}
                  </text>
                )}
              </g>
            ))}

            <IndexMark value={RATE_INDEX} glyph="triangle" label="RATE" training={training} />
            <IndexMark value={HIGH_SPEED_INDEX} glyph="arrow" label="SEC" training={training} />
            <IndexMark value={UNIT_INDEX} glyph="unit" label="UNIT" training={training} />
          </g>

          {/* ---------- Cursor hairline ---------- */}
          <g
            transform={`rotate(${cursor} ${C} ${C})`}
            onPointerDown={startDrag("cursor")}
            className="cursor-ew-resize"
          >
            <line
              x1={C}
              y1={C - R.outerEdge + 4}
              x2={C}
              y2={C - R.hub}
              stroke="rgba(18,168,110,0.85)"
              strokeWidth={1.4}
            />
            <line
              x1={C}
              y1={C - R.outerEdge + 4}
              x2={C}
              y2={C - R.hub}
              stroke="transparent"
              strokeWidth={20}
            />
            <circle cx={C} cy={C - R.outerEdge + 14} r={7} fill="rgba(18,168,110,0.16)" />
          </g>

          {/* ---------- Hub ---------- */}
          <circle cx={C} cy={C} r={R.hub} fill="url(#cr3-hub)" stroke="var(--color-line-strong)" />
          <text
            x={C}
            y={C - 6}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="var(--color-brand-dark)"
            letterSpacing="0.08em"
          >
            CR-3
          </text>
          <text
            x={C}
            y={C + 8}
            textAnchor="middle"
            fontSize={7}
            fill="var(--color-navy-faint)"
            letterSpacing="0.14em"
          >
            CALC
          </text>

          {/* ---------- Magnifier ---------- */}
          {magnify && (
            <g>
              <circle
                cx={C}
                cy={C - 150}
                r={54}
                fill="#fffdf6"
                stroke="var(--color-brand)"
                strokeWidth={2}
              />
              <g clipPath="url(#cr3-lens)">
                <g transform={`translate(${C} ${C - 150}) scale(2.6) translate(${-C} ${-C + 150})`}>
                  <g transform={`translate(0 ${150 - 150 / 2.6})`}>
                    <MagnifiedScales rotation={rotation} cursor={cursor} ticks={ticks} />
                  </g>
                </g>
              </g>
              <circle cx={C} cy={C - 150} r={54} fill="none" stroke="rgba(0,0,0,0.12)" />
            </g>
          )}
        </svg>
      </div>

      {/* ---------- Controls ---------- */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <WheelButton onClick={() => nudge(-4)} aria-label="Rotate the inner wheel back">
          <Minus size={14} />
        </WheelButton>
        <WheelButton onClick={() => nudge(-0.6)} aria-label="Rotate back finely">
          <span className="text-[11px] font-bold">·</span>
        </WheelButton>
        <WheelButton onClick={() => nudge(0.6)} aria-label="Rotate forward finely">
          <span className="text-[11px] font-bold">·</span>
        </WheelButton>
        <WheelButton onClick={() => nudge(4)} aria-label="Rotate the inner wheel forward">
          <Plus size={14} />
        </WheelButton>
        <WheelButton
          onClick={() => {
            setRotation(0);
            setCursor(0);
          }}
          aria-label="Reset the wheel"
        >
          <RotateCcw size={14} />
        </WheelButton>
        <WheelButton
          onClick={() => setMagnify((m) => !m)}
          aria-pressed={magnify}
          aria-label="Magnifier"
          active={magnify}
        >
          <Search size={14} />
        </WheelButton>
      </div>

      {training && (
        <>
          <div className="flex flex-wrap justify-center gap-1.5">
            {(Object.keys(SCALE_LABELS) as Cr3ScalePair[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setScalePair(key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  scalePair === key
                    ? "bg-brand text-white"
                    : "bg-surface-2 text-navy-soft hover:text-navy",
                )}
              >
                {SCALE_LABELS[key].outer} / {SCALE_LABELS[key].inner}
              </button>
            ))}
          </div>
          <SetHelper onSet={(outer, inner) => setRotation(rotationFor(outer, inner))} />
        </>
      )}

      <p className="text-center text-[11px] leading-relaxed text-navy-faint">
        Drag the grey wheel to set up the ratio, drag the green hairline to read.{" "}
        <span className="font-semibold text-navy-soft">
          The wheel never tells you the number — that read is yours.
        </span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function ScaleTick({
  angle,
  weight,
  label,
  from,
  length,
  labelRadius,
  inward = false,
  highlighted = false,
}: {
  angle: number;
  weight: "major" | "mid" | "minor";
  label?: string;
  from: number;
  length: number;
  labelRadius: number;
  inward?: boolean;
  highlighted?: boolean;
}) {
  const stroke = highlighted
    ? "var(--color-brand)"
    : weight === "major"
      ? "var(--color-ink-800)"
      : "var(--color-pencil)";
  return (
    <g transform={`rotate(${angle} ${C} ${C})`}>
      <line
        x1={C}
        y1={C - from}
        x2={C}
        y2={C - from + (inward ? length : length)}
        stroke={stroke}
        strokeWidth={highlighted ? 2.2 : weight === "major" ? 1.3 : weight === "mid" ? 0.9 : 0.5}
        opacity={weight === "minor" ? 0.65 : 1}
      />
      {label && (
        <text
          x={C}
          y={C - labelRadius}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={inward ? 12 : 11}
          fontWeight={700}
          className="figure"
          fill={highlighted ? "var(--color-brand)" : "var(--color-ink-800)"}
          transform={`rotate(${-angle} ${C} ${C - labelRadius})`}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function IndexMark({
  value,
  glyph,
  label,
  training,
}: {
  value: number;
  glyph: "triangle" | "arrow" | "unit";
  label: string;
  training: boolean;
}) {
  const angle = valueToAngle(value);
  const y = C - R.innerTick + 4;
  return (
    <g transform={`rotate(${angle} ${C} ${C})`}>
      {glyph === "triangle" && (
        <path
          d={`M ${C} ${y} l -7 13 l 14 0 Z`}
          fill="var(--color-brand)"
          stroke="var(--color-brand-dark)"
          strokeWidth={0.7}
        />
      )}
      {glyph === "arrow" && (
        <path
          d={`M ${C} ${y} l -5 10 l 5 -3 l 5 3 Z`}
          fill="var(--color-nogo)"
          stroke="var(--color-nogo)"
          strokeWidth={0.6}
        />
      )}
      {glyph === "unit" && (
        <path
          d={`M ${C - 6} ${y + 2} h 12 M ${C} ${y + 2} v 11`}
          stroke="var(--color-ink-800)"
          strokeWidth={1.6}
          fill="none"
        />
      )}
      {training && (
        <text
          x={C}
          y={y + 26}
          textAnchor="middle"
          fontSize={7.5}
          fontWeight={800}
          letterSpacing="0.08em"
          fill={
            glyph === "triangle"
              ? "var(--color-brand-dark)"
              : glyph === "arrow"
                ? "var(--color-nogo)"
                : "var(--color-ink-700)"
          }
          transform={`rotate(${-angle} ${C} ${y + 26})`}
        >
          {label}
        </text>
      )}
    </g>
  );
}

function ArcLabel({
  text,
  radius,
  angle,
  tone,
}: {
  text: string;
  radius: number;
  angle: number;
  tone: "outer" | "inner";
}) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return (
    <text
      x={C + radius * Math.cos(rad)}
      y={C + radius * Math.sin(rad)}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={8}
      fontWeight={800}
      letterSpacing="0.16em"
      fill={tone === "outer" ? "var(--color-navy-faint)" : "var(--color-pencil)"}
    >
      {text}
    </text>
  );
}

/** The lens content: the same scales, drawn again at the top of the wheel. */
function MagnifiedScales({
  rotation,
  cursor,
  ticks,
}: {
  rotation: number;
  cursor: number;
  ticks: ReturnType<typeof buildTicks>;
}) {
  const near = (angle: number, centre: number, span: number) => {
    const d = Math.abs((((angle - centre) % 360) + 540) % 360) - 180;
    return Math.abs(d) < span;
  };
  return (
    <g>
      <circle cx={C} cy={C} r={R.outerEdge} fill="#fffdf6" />
      <circle cx={C} cy={C} r={R.gap} fill="#f4f2e9" />
      {ticks
        .filter((t) => near(t.angle, cursor, 14))
        .map((t) => (
          <g key={`mo-${t.value}`}>
            <ScaleTick
              angle={t.angle}
              weight={t.weight}
              label={t.label}
              from={R.outerTick}
              length={t.weight === "major" ? 15 : t.weight === "mid" ? 10 : 6}
              labelRadius={R.outerLabel}
              inward
            />
          </g>
        ))}
      <g transform={`rotate(${rotation} ${C} ${C})`}>
        {ticks
          .filter((t) => near(t.angle + rotation, cursor, 14))
          .map((t) => (
            <ScaleTick
              key={`mi-${t.value}`}
              angle={t.angle}
              weight={t.weight}
              label={t.label}
              from={R.innerTick}
              length={t.weight === "major" ? -15 : t.weight === "mid" ? -10 : -6}
              labelRadius={R.innerLabel}
            />
          ))}
      </g>
      <g transform={`rotate(${cursor} ${C} ${C})`}>
        <line
          x1={C}
          y1={C - R.outerEdge}
          x2={C}
          y2={C - R.hub}
          stroke="rgba(18,168,110,0.9)"
          strokeWidth={0.9}
        />
      </g>
    </g>
  );
}

function WheelButton({
  children,
  active,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 w-9 items-center justify-center rounded-lg border transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-line-strong bg-surface text-navy-soft hover:bg-surface-2 hover:text-navy",
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Training-mode setup helper.
 *
 * It places a value over an index — the mechanical half of step 2 in every
 * procedure the guide prints — so a student learning where the rate index is
 * does not have to fight a trackpad to get there. It deliberately does not
 * read anything back: the setup is assisted, the read never is.
 */
function SetHelper({ onSet }: { onSet: (outer: number, inner: number) => void }) {
  const [value, setValue] = useState("");
  const [index, setIndex] = useState<number>(RATE_INDEX);
  const numeric = Number(value);
  const valid = value.trim() !== "" && Number.isFinite(numeric) && numeric > 0;

  return (
    <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-1.5 rounded-xl bg-surface-2 px-2.5 py-2">
      <span className="text-[11px] font-semibold text-navy-soft">Set</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputMode="decimal"
        placeholder="150"
        aria-label="Value to place on the outer scale"
        className="figure h-7 w-16 rounded-md border border-line-strong bg-surface px-2 text-[12px] text-navy"
      />
      <span className="text-[11px] font-semibold text-navy-soft">over the</span>
      <select
        value={index}
        onChange={(e) => setIndex(Number(e.target.value))}
        aria-label="Index to set against"
        className="h-7 rounded-md border border-line-strong bg-surface px-1.5 text-[11px] font-semibold text-navy"
      >
        <option value={RATE_INDEX}>rate index</option>
        <option value={HIGH_SPEED_INDEX}>seconds bug</option>
        <option value={UNIT_INDEX}>unit index</option>
      </select>
      <button
        type="button"
        disabled={!valid}
        onClick={() => valid && onSet(numeric, index)}
        className="rounded-md bg-brand px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-40"
      >
        Place
      </button>
    </div>
  );
}

/**
 * A small non-interactive CR-3 face, for lesson cards and drill thumbnails.
 */
export function Cr3Glyph({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <circle cx="20" cy="20" r="18.5" fill="#f1efe8" stroke="var(--color-line-strong)" />
      <circle cx="20" cy="20" r="12" fill="#e3e0d3" stroke="var(--color-line-strong)" strokeWidth={0.6} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * 360;
        return (
          <line
            key={i}
            x1="20"
            y1="2.5"
            x2="20"
            y2={i % 6 === 0 ? 7 : 5}
            stroke="var(--color-pencil)"
            strokeWidth={i % 6 === 0 ? 1 : 0.5}
            transform={`rotate(${a} 20 20)`}
          />
        );
      })}
      <path d="M 20 8.6 l -2.6 4.6 l 5.2 0 Z" fill="var(--color-brand)" transform="rotate(280 20 20)" />
      <circle cx="20" cy="20" r="4" fill="#fbfaf6" stroke="var(--color-line-strong)" />
      <line x1="20" y1="3" x2="20" y2="16" stroke="var(--color-plot)" strokeWidth="0.9" transform="rotate(38 20 20)" />
    </svg>
  );
}

export function Cr3Legend() {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Pill tone="brand" size="sm">▲ rate index — 60 min</Pill>
      <Pill tone="nogo" size="sm">SEC — 3,600 sec</Pill>
      <Pill tone="neutral" size="sm">unit index — 10</Pill>
    </div>
  );
}
