"use client";

/**
 * One Squared Term — why velocity dominates the lift equation.
 *
 * The version this replaces stated the point and never showed it: five frames
 * that highlighted different letters of a static equation while a caption said
 * "double the speed and lift quadruples". The student read the answer instead
 * of watching it happen.
 *
 * So the drawing is built around a single claim the eye can check. Every term
 * gets pushed from 1x to 2x in turn, driving one shared lift bar. Three of them
 * move it to the same place. The fourth does not, and the bar runs off the end
 * of the row the others stopped at.
 *
 * L = 1/2 · rho · V² · S · C_L. Only V is squared, which is the whole lesson.
 */

import { useState } from "react";
import { Layer, Tag } from "./grammar";
import type { GateOutcome } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";
import { useEasedNumber } from "./motion";

/* ------------------------------------------------------------------ */
/* Frames                                                              */
/* ------------------------------------------------------------------ */

interface Frame {
  w: number;
  h: number;
  /** Left edge of the term rows and of the lift bar's zero. */
  x0: number;
  /** Width available to the bar at its full 4x extent. */
  barW: number;
  rowTop: number;
  rowGap: number;
  barY: number;
  /** Type scale. Portrait is scaled down harder to fit a phone, so its type
   *  starts larger to land at the same rendered size. */
  fs: number;
}

/* Landscape has room for the rows and the bar to sit apart; portrait tightens
 * the gaps rather than shrinking the type, which is what made the old cards
 * unreadable on a phone. */
const LAND: Frame = { w: 780, h: 430, x0: 56, barW: 660, rowTop: 96, rowGap: 46, barY: 330, fs: 1 };
const PORT: Frame = { w: 470, h: 640, x0: 40, barW: 388, rowTop: 150, rowGap: 62, barY: 500, fs: 1.3 };

/* ------------------------------------------------------------------ */
/* Terms                                                               */
/* ------------------------------------------------------------------ */

type TermId = "rho" | "v" | "s" | "cl";

interface Term {
  id: TermId;
  symbol: string;
  name: string;
  /** The exponent this term carries in the lift equation. */
  power: 1 | 2;
}

const TERMS: Term[] = [
  { id: "rho", symbol: "ρ", name: "Air density", power: 1 },
  { id: "v", symbol: "V", name: "Velocity", power: 2 },
  { id: "s", symbol: "S", name: "Wing area", power: 1 },
  { id: "cl", symbol: "Cₗ", name: "Coefficient of lift", power: 1 },
];

/** Lift factor when one term is scaled by `mult` and the rest are left at 1. */
const liftFactor = (term: Term, mult: number) => Math.pow(mult, term.power);

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Scene {
  idea: string;
  sub?: string;
  /** Which term is being pushed, and how far. */
  active: TermId | null;
  mult: number;
  /** Terms whose row is drawn at all yet. */
  shown: TermId[];
  /** Swap the bar for the curve that separates V from everything else. */
  chart?: boolean;
  play?: boolean;
  tone?: "reveal";
  predict?: {
    question: string;
    options: string[];
    answer: number;
    because: string;
  };
}

const ALL: TermId[] = ["rho", "v", "s", "cl"];

const SCENES: Scene[] = [
  {
    idea: "Lift comes from four things, and one bar that measures the result.",
    sub: "Every term starts at its normal value. The bar is the lift you get.",
    active: null,
    mult: 1,
    shown: ALL,
  },
  {
    idea: "Double the air density. The bar doubles.",
    sub: "Twice as much air, twice as much lift. Nothing surprising yet.",
    active: "rho",
    mult: 2,
    shown: ALL,
  },
  {
    idea: "Put density back, and double the wing area instead.",
    sub: "The bar lands in exactly the same place.",
    active: "s",
    mult: 2,
    shown: ALL,
  },
  {
    idea: "Same again for coefficient of lift, which angle of attack sets.",
    sub: "Three terms tried. Three identical answers. Doubling the input doubles the lift.",
    active: "cl",
    mult: 2,
    shown: ALL,
  },
  {
    idea: "One term left. Everything back to normal, and now double the speed.",
    active: null,
    mult: 1,
    shown: ALL,
    predict: {
      question:
        "Density, wing area and Cₗ each doubled the lift when you doubled them. Now you double AIRSPEED and change nothing else. What does the bar do?",
      options: [
        "Doubles, like the other three",
        "Quadruples",
        "Rises by about half",
      ],
      answer: 1,
      because:
        "Velocity is the only squared term in L = ½ρV²SCₗ. Doubling it multiplies lift by two twice over, so the bar goes to four times its original length while every other term would have stopped at two.",
    },
  },
  {
    idea: "Four times the lift. The bar runs clean off the mark the others stopped at.",
    sub: "Because V is squared, doubling it multiplies lift twice.",
    active: "v",
    mult: 2,
    shown: ALL,
    tone: "reveal",
  },
  {
    idea: "Plotted against each other, three terms are the same straight line.",
    sub: "Velocity is the curve peeling away from them, and the gap widens the faster you go.",
    active: "v",
    mult: 2,
    shown: ALL,
    chart: true,
  },
  {
    idea: "Move the speed yourself and watch the bar.",
    sub: "Halve it and lift falls to a quarter — which is the same rule running the other way, and why slow flight is unforgiving.",
    active: "v",
    mult: 2,
    shown: ALL,
    play: true,
  },
];

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

/** The bar is scaled so 4x fills the row; 1x therefore sits at a quarter. */
const MAX_FACTOR = 4;

function Rows({
  F,
  scene,
  mult,
}: {
  F: Frame;
  scene: Scene;
  mult: number;
}) {
  return (
    <>
      {TERMS.map((t, i) => {
        const on = scene.active === t.id;
        const y = F.rowTop + i * F.rowGap;
        const value = on ? mult : 1;
        return (
          <Layer key={t.id} at={on ? "lead" : "context"} show={scene.shown.includes(t.id)}>
            <g>
              <text
                x={F.x0}
                y={y}
                fontSize={19 * F.fs}
                fontWeight={800}
                fill={on ? "var(--color-brand)" : "var(--color-navy)"}
              >
                {t.symbol}
                {t.power === 2 && (
                  <tspan fontSize={13 * F.fs} dy={-8}>
                    2
                  </tspan>
                )}
              </text>
              <text x={F.x0 + 42} y={y} fontSize={13 * F.fs} fontWeight={600} fill="var(--color-navy-soft)">
                {t.name}
              </text>
              {/* The multiplier only appears on the term actually being pushed,
                  so the row reads as "this is the one that changed". */}
              {on && (
                <text
                  x={F.x0 + F.barW}
                  y={y}
                  textAnchor="end"
                  fontSize={15 * F.fs}
                  fontWeight={800}
                  fill="var(--color-brand)"
                >
                  {value.toFixed(2).replace(/\.?0+$/, "")}× normal
                </text>
              )}
              {/* The squared term is marked in the row itself, not only in the
                  caption — the exponent is the entire reason this explainer
                  exists, so it should be visible before anyone reads a word. */}
              {t.power === 2 && (
                <text
                  x={F.x0 + F.barW}
                  y={y + 15}
                  textAnchor="end"
                  fontSize={10.5 * F.fs}
                  fontWeight={800}
                  letterSpacing="0.08em"
                  fill="var(--color-caution)"
                >
                  {on ? "" : "SQUARED"}
                </text>
              )}
            </g>
          </Layer>
        );
      })}
    </>
  );
}

function LiftBar({ F, factor }: { F: Frame; factor: number }) {
  const unit = F.barW / MAX_FACTOR;
  /*
   * The scale stays fixed at 1x–4x so the bar is always read against the same
   * ruler. In the interactive scene the student can push speed to 2.5x, which
   * is 6.25x lift and would otherwise draw a bar half again as long as the
   * canvas. Clamping and marking it "off the scale" is both honest and the
   * better lesson: the point of a squared term is that it leaves the chart.
   */
  const over = factor > MAX_FACTOR;
  const len = Math.min(F.barW, Math.max(2, unit * factor));
  const h = 34;
  return (
    <g>
      {/* Ticks at every whole multiple, so the bar is read against a scale
          rather than against the previous scene's memory of it. */}
      {[1, 2, 3, 4].map((n) => (
        <g key={n}>
          <line
            x1={F.x0 + unit * n}
            y1={F.barY - 12}
            x2={F.x0 + unit * n}
            y2={F.barY + h + 12}
            stroke="var(--color-line-strong)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <text
            x={F.x0 + unit * n}
            y={F.barY + h + 27}
            textAnchor="middle"
            fontSize={11 * F.fs}
            fontWeight={700}
            fill="var(--color-navy-faint)"
          >
            {n}×
          </text>
        </g>
      ))}

      <rect
        x={F.x0}
        y={F.barY}
        width={F.barW}
        height={h}
        rx={6}
        fill="var(--color-surface-3)"
      />
      <rect
        x={F.x0}
        y={F.barY}
        width={len}
        height={h}
        rx={6}
        fill="var(--color-brand)"
      />
      <text
        x={F.x0 + 12}
        y={F.barY + h / 2 + 5}
        fontSize={13 * F.fs}
        fontWeight={800}
        letterSpacing="0.1em"
        fill="#fff"
      >
        LIFT
      </text>
      {/* Past the end of the scale the value moves inside the bar, or it would
          be drawn off the edge of the canvas. */}
      <text
        x={over ? F.x0 + len - 12 : F.x0 + len + 12}
        y={F.barY + h / 2 + 6}
        textAnchor={over ? "end" : "start"}
        fontSize={19 * F.fs}
        fontWeight={800}
        fill={over ? "#fff" : "var(--color-navy)"}
      >
        {factor.toFixed(2).replace(/\.?0+$/, "")}×
      </text>
      {over && (
        <g>
          <path
            d={`M ${F.x0 + len + 6} ${F.barY + 4} L ${F.x0 + len + 20} ${F.barY + h / 2} L ${F.x0 + len + 6} ${F.barY + h - 4}`}
            fill="none"
            stroke="var(--color-caution)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Above the bar, right-aligned to its end: to the right of the
              arrow there is no canvas left in either frame. */}
          <text
            x={F.x0 + len}
            y={F.barY - 14}
            textAnchor="end"
            fontSize={10.5 * F.fs}
            fontWeight={800}
            letterSpacing="0.08em"
            fill="var(--color-caution)"
          >
            OFF THE SCALE
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * Lift factor against input multiplier.
 *
 * The memory image: three linear terms share one straight line, and V's
 * parabola separates from it and keeps separating. Drawn over the same 1x–2x
 * range the scenes just walked through, so the chart is a summary of what the
 * student watched rather than a new idea.
 */
function Divergence({ F, mult }: { F: Frame; mult: number }) {
  const x0 = F.x0 + 18;
  const y0 = F.h - 92;
  const w = F.barW - 60;
  const h = F.h - F.rowTop - 120;
  const X = (m: number) => x0 + ((m - 1) / 1.5) * w;
  const Y = (f: number) => y0 - ((f - 1) / 3) * h;

  const linear = `M ${X(1)} ${Y(1)} L ${X(2.5)} ${Y(2.5)}`;
  const square = Array.from({ length: 31 }, (_, i) => {
    const m = 1 + (i / 30) * 1.5;
    return `${i === 0 ? "M" : "L"} ${X(m)} ${Y(m * m)}`;
  }).join(" ");

  return (
    <g>
      <line x1={x0} y1={y0} x2={X(2.5)} y2={y0} stroke="var(--color-line-strong)" strokeWidth={1.5} />
      <line x1={x0} y1={y0} x2={x0} y2={Y(4)} stroke="var(--color-line-strong)" strokeWidth={1.5} />
      <text x={X(1.75)} y={y0 + 30} textAnchor="middle" fontSize={11 * F.fs} fontWeight={700} fill="var(--color-navy-faint)">
        input × normal
      </text>
      <text
        x={x0 - 14}
        y={Y(2.5)}
        textAnchor="middle"
        fontSize={11 * F.fs}
        fontWeight={700}
        fill="var(--color-navy-faint)"
        transform={`rotate(-90 ${x0 - 14} ${Y(2.5)})`}
      >
        lift × normal
      </text>

      <path d={linear} fill="none" stroke="var(--color-navy-faint)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={square} fill="none" stroke="var(--color-brand)" strokeWidth={3.5} strokeLinecap="round" />

      {/* The two readings at 2x, which is the comparison the scenes made. */}
      <circle cx={X(2)} cy={Y(2)} r={5} fill="var(--color-navy-faint)" />
      <circle cx={X(2)} cy={Y(4)} r={6} fill="var(--color-brand)" />
      <line
        x1={X(2)}
        y1={Y(2)}
        x2={X(2)}
        y2={Y(4)}
        stroke="var(--color-caution)"
        strokeWidth={2}
        strokeDasharray="4 3"
      />

      <Tag x={X(2) + 12} y={Y(4) - 4} role="primary" text="V doubled → 4×" strong size={13 * F.fs} />
      <Tag x={X(2) + 12} y={Y(2) + 16} role="muted" text="anything else → 2×" size={12 * F.fs} />
      <text x={X(mult)} y={y0 + 15} textAnchor="middle" fontSize={10.5 * F.fs} fontWeight={800} fill="var(--color-brand)">
        {mult}×
      </text>
    </g>
  );
}

function Equation({ F, active }: { F: Frame; active: TermId | null }) {
  const paint = (id: TermId) =>
    active === id ? "var(--color-brand)" : "var(--color-navy)";
  return (
    <text x={F.w / 2} y={52} textAnchor="middle" fontSize={26 * F.fs} fontWeight={800} fill="var(--color-navy)">
      L = ½
      <tspan fill={paint("rho")}> ρ</tspan>
      <tspan fill={paint("v")}> V</tspan>
      <tspan fill={paint("v")} fontSize={16 * F.fs} dy={-10}>
        2
      </tspan>
      <tspan dy={10}> </tspan>
      <tspan fill={paint("s")}>S</tspan>
      <tspan fill={paint("cl")}> C</tspan>
      <tspan fill={paint("cl")} fontSize={16 * F.fs} dy={5}>
        L
      </tspan>
    </text>
  );
}

function Drawing({
  F,
  scene,
  mult,
  factor,
  className,
}: {
  F: Frame;
  scene: Scene;
  mult: number;
  factor: number;
  className: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${F.w} ${F.h}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Lift equation with ${scene.active ?? "no term"} at ${mult} times normal, giving ${factor.toFixed(2)} times lift`}
    >
      <Equation F={F} active={scene.active} />
      <Rows F={F} scene={scene} mult={mult} />
      {scene.chart ? <Divergence F={F} mult={2} /> : <LiftBar F={F} factor={factor} />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export function LiftEquationExplainer({
  scene,
  onResolveGate,
}: {
  scene: number;
  onResolveGate: (outcome: GateOutcome) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [drag, setDrag] = useState(2);

  const n = Math.min(Math.max(scene, 0), SCENES.length - 1);
  const s = SCENES[n];

  const term = TERMS.find((t) => t.id === s.active) ?? null;
  const rawMult = s.play ? drag : s.mult;
  const rawFactor = term ? liftFactor(term, rawMult) : 1;

  // Both the bar and its readout ease, so the student sees lift travel to 4x
  // rather than find it already there.
  const factor = useEasedNumber(rawFactor);
  const mult = useEasedNumber(rawMult);

  const caption = s.predict ? (
    <PredictionGate
      question={s.predict.question}
      options={s.predict.options}
      answer={s.predict.answer}
      chosen={choice}
      because={s.predict.because}
      onChoose={(i) => {
        setChoice(i);
        onResolveGate({ chosen: i, answer: s.predict!.answer });
      }}
    />
  ) : (
    <SceneIdea sub={s.sub} tone={s.tone}>
      {s.idea}
    </SceneIdea>
  );

  return (
    <>
      <Stage caption={caption}>
        <StageChip>
          Scene {n + 1} / {SCENES.length}
        </StageChip>
        <StageChip corner="tr">{s.play ? "Interactive" : s.chart ? "Summary" : "One term at a time"}</StageChip>

        <Drawing F={LAND} scene={s} mult={mult} factor={factor} className="hidden h-full w-full sm:block" />
        <Drawing F={PORT} scene={s} mult={mult} factor={factor} className="h-full w-full sm:hidden" />
      </Stage>

      {s.play && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <div className="shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-navy-faint">ρ · S · Cₗ</p>
              <p className="tabular text-[15px] font-extrabold text-navy">all locked</p>
            </div>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Velocity multiplier</span>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={drag}
                onChange={(e) => setDrag(Number(e.target.value))}
                className="w-full accent-[var(--color-brand)]"
              />
              <span className="mt-0.5 block text-center text-[11px] font-bold uppercase tracking-wider text-navy-faint">
                Speed {drag.toFixed(1)}× normal
              </span>
            </label>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-navy-faint">Lift</p>
              <p className="tabular text-[19px] font-extrabold leading-none text-brand">
                {(drag * drag).toFixed(2)}×
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

LiftEquationExplainer.sceneCount = SCENES.length;
LiftEquationExplainer.blocksAt = (scene: number) => Boolean(SCENES[scene]?.predict);
LiftEquationExplainer.nextLabel = (scene: number) => {
  const s = SCENES[scene];
  if (!s) return "Next";
  if (s.predict) return "Reveal";
  if (s.play) return "Finish";
  if (s.chart) return "Try it";
  return "Next";
};
LiftEquationExplainer.anchor = [
  "L = ½ρV²SCₗ — velocity is the ONLY squared term.",
  "Double ρ, S or Cₗ and lift doubles. Double V and lift quadruples.",
  "Halve the speed and lift falls to a quarter. The rule cuts both ways.",
];
