"use client";

/**
 * CL vs AOA — the curve, drawn by flying it.
 *
 * The version this replaces showed the finished curve from the first frame and
 * slid a marker along it. Every answer the explainer builds toward — that CL
 * peaks, that pushing past the peak makes it FALL, that flaps move the whole
 * thing up and left — was already on screen before the student was asked to
 * think about any of it.
 *
 * Here the curve does not exist ahead of the aircraft. A wing sits beside the
 * plot at the angle currently being flown, and the trace is drawn only as far
 * as it has been flown. The student watches CL climb, watches the climb flatten,
 * commits to a prediction, and only then sees the line go over the top.
 *
 * Numbers follow NIFE's cambered-wing shape: lift at zero AOA, CLmax near 16
 * degrees clean, and flaps raising CLmax while lowering the angle it arrives at.
 */

import { useState } from "react";
import { Layer, Tag } from "./grammar";
import type { GateOutcome } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";
import { useEasedNumber } from "./motion";

/* ------------------------------------------------------------------ */
/* The curve                                                           */
/* ------------------------------------------------------------------ */

interface Config {
  /** Zero-lift angle of attack — negative for a cambered wing. */
  a0: number;
  clMax: number;
  /** The critical angle: where CLmax occurs. */
  aStall: number;
}

const CLEAN: Config = { a0: -4, clMax: 1.5, aStall: 16 };
/* Flaps add camber: more maximum lift, arriving at a LOWER angle. */
const FLAPS: Config = { a0: -8, clMax: 2.0, aStall: 13 };

/**
 * A sine to the peak gives the real shape for free — near-linear through the
 * working range and naturally rounded as it approaches CLmax — without pasting
 * a straight line onto a curve and hoping the join does not show.
 */
function cl(a: number, c: Config): number {
  if (a <= c.a0) return Math.max(0, 0.06 * (a - c.a0) + 0);
  if (a <= c.aStall) {
    return c.clMax * Math.sin((Math.PI / 2) * ((a - c.a0) / (c.aStall - c.a0)));
  }
  // Past the critical angle the flow separates and CL drops away.
  return Math.max(c.clMax * 0.55, c.clMax - 0.055 * (a - c.aStall));
}

/* ------------------------------------------------------------------ */
/* Frames                                                             */
/* ------------------------------------------------------------------ */

interface Frame {
  w: number;
  h: number;
  /** Plot rectangle. */
  px: number;
  py: number;
  pw: number;
  ph: number;
  /** Where the wing silhouette sits, and how big. */
  wingX: number;
  wingY: number;
  wingR: number;
  fs: number;
}

const LAND: Frame = { w: 780, h: 430, px: 250, py: 44, pw: 470, ph: 300, wingX: 120, wingY: 200, wingR: 62, fs: 1 };
const PORT: Frame = { w: 470, h: 640, px: 74, py: 200, pw: 356, ph: 330, wingX: 235, wingY: 104, wingR: 70, fs: 1.32 };

const A_MIN = -8;
const A_MAX = 22;
const CL_MAX_AXIS = 2.2;

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Scene {
  idea: string;
  sub?: string;
  aoa: number;
  flaps?: boolean;
  /** Draw the clean curve as a ghost behind the flapped one. */
  compare?: boolean;
  play?: boolean;
  tone?: "reveal";
  predict?: {
    question: string;
    options: string[];
    answer: number;
    because: string;
  };
}

const SCENES: Scene[] = [
  {
    idea: "A cambered wing at −2°, already making lift.",
    sub: "Nose slightly below the relative wind and the wing still lifts. Camber does that.",
    aoa: -2,
  },
  {
    idea: "Raise the angle of attack and CL climbs, almost in a straight line.",
    sub: "The trace is drawn only as far as the wing has actually been flown.",
    aoa: 6,
  },
  {
    idea: "Keep going. The climb starts to flatten.",
    sub: "Sixteen degrees, and the line is running out of steepness.",
    aoa: 16,
  },
  {
    idea: "That flattening is CLmax, at the critical angle of attack.",
    aoa: 16,
    predict: {
      question:
        "The wing is at its critical angle of attack. You pull to a HIGHER angle of attack still. What does CL do?",
      options: [
        "Keeps rising, more slowly",
        "Levels off and stays there",
        "Falls",
      ],
      answer: 2,
      because:
        "Past the critical angle the airflow separates from the upper surface and CL FALLS. That is the stall — and it is defined by angle of attack, not by speed. The wing stalls at the same critical angle every time.",
    },
  },
  {
    idea: "Past the critical angle CL falls away. That is the stall.",
    sub: "The wing did not run out of speed. It ran out of angle.",
    aoa: 21,
    tone: "reveal",
  },
  {
    idea: "Now lower the flaps, and fly the same sweep again.",
    sub: "The whole curve moves up and to the LEFT.",
    aoa: 13,
    flaps: true,
    compare: true,
  },
  {
    idea: "More maximum lift — arriving at a LOWER angle of attack.",
    sub: "Which is why, with flaps down, the stall arrives at a lower nose attitude than you expect.",
    aoa: 13,
    flaps: true,
    compare: true,
    tone: "reveal",
  },
  {
    idea: "Fly it yourself.",
    sub: "Move the angle of attack and watch both the wing and the trace. The critical angle does not move when you change speed — only when you change the wing.",
    aoa: 8,
    play: true,
  },
];

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function Plot({
  F,
  aoa,
  config,
  ghost,
  showStallZone,
}: {
  F: Frame;
  aoa: number;
  config: Config;
  ghost?: Config;
  showStallZone: boolean;
}) {
  const X = (a: number) => F.px + ((a - A_MIN) / (A_MAX - A_MIN)) * F.pw;
  const Y = (v: number) => F.py + F.ph - (v / CL_MAX_AXIS) * F.ph;

  /** The trace stops at the angle currently flown — the curve is not a given. */
  const trace = (c: Config, upTo: number) => {
    const pts: string[] = [];
    for (let a = A_MIN; a <= upTo + 0.001; a += 0.4) {
      pts.push(`${pts.length === 0 ? "M" : "L"} ${X(a).toFixed(1)} ${Y(cl(a, c)).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const peakX = X(config.aStall);
  const peakY = Y(config.clMax);
  const atPeak = aoa >= config.aStall - 0.4;

  return (
    <g>
      {/* Past the critical angle is a different regime, so it is shaded rather
          than left to the caption to explain. */}
      <Layer at="context" show={showStallZone}>
        <rect
          x={peakX}
          y={F.py}
          width={F.px + F.pw - peakX}
          height={F.ph}
          fill="var(--color-nogo)"
          opacity={0.07}
        />
      </Layer>

      {/* Axes */}
      <line x1={F.px} y1={F.py + F.ph} x2={F.px + F.pw} y2={F.py + F.ph} stroke="var(--color-line-strong)" strokeWidth={1.5} />
      <line x1={X(0)} y1={F.py} x2={X(0)} y2={F.py + F.ph} stroke="var(--color-line-strong)" strokeWidth={1.5} />
      {/* On its own line below the ticks: right-aligned to the axis end it
          sat directly on top of the 20° label. */}
      <text x={F.px + F.pw} y={F.py + F.ph + 46 * F.fs} textAnchor="end" fontSize={11.5 * F.fs} fontWeight={700} fill="var(--color-navy-faint)">
        angle of attack →
      </text>
      <text
        x={F.px - 16 * F.fs}
        y={F.py + F.ph / 2}
        textAnchor="middle"
        fontSize={11.5 * F.fs}
        fontWeight={700}
        fill="var(--color-navy-faint)"
        transform={`rotate(-90 ${F.px - 16 * F.fs} ${F.py + F.ph / 2})`}
      >
        C∟ →
      </text>
      {[0, 10, 20].map((a) => (
        <text key={a} x={X(a)} y={F.py + F.ph + 26 * F.fs} textAnchor="middle" fontSize={11 * F.fs} fontWeight={700} fill="var(--color-navy-faint)">
          {a}°
        </text>
      ))}

      {/* The clean curve stays as a ghost so the flapped one is read as a MOVE
          rather than as a different picture. */}
      {ghost && (
        <path d={trace(ghost, A_MAX)} fill="none" stroke="var(--color-navy-faint)" strokeWidth={2} strokeDasharray="5 4" opacity={0.75} />
      )}

      <path
        d={trace(config, aoa)}
        fill="none"
        stroke="var(--color-brand)"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* CLmax is only named once it has been reached. */}
      <Layer at="lead" show={atPeak}>
        <line x1={peakX} y1={peakY} x2={peakX} y2={F.py + F.ph} stroke="var(--color-caution)" strokeWidth={1.5} strokeDasharray="4 3" />
        <circle cx={peakX} cy={peakY} r={4.5} fill="var(--color-caution)" />
        <Tag x={peakX + 8} y={peakY - 8} role="danger" text={`C∟max ${config.clMax.toFixed(1)} at ${config.aStall}°`} size={12 * F.fs} strong />
      </Layer>

      {/* Where the wing is right now. */}
      <circle cx={X(aoa)} cy={Y(cl(aoa, config))} r={6.5} fill="var(--color-brand)" stroke="#fff" strokeWidth={2} />
    </g>
  );
}

/** A wing at the angle being flown, so the curve stays attached to a real thing. */
function Wing({ F, aoa, flaps, stalled }: { F: Frame; aoa: number; flaps: boolean; stalled: boolean }) {
  const r = F.wingR;
  return (
    <g transform={`translate(${F.wingX} ${F.wingY})`}>
      {/* Relative wind: the datum the angle is measured from. */}
      <line x1={-r * 1.5} y1={0} x2={r * 1.4} y2={0} stroke="var(--color-navy-faint)" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={-r * 1.5} y={-9 * F.fs} fontSize={10.5 * F.fs} fontWeight={700} fill="var(--color-navy-faint)">
        relative wind
      </text>

      <g transform={`rotate(${-aoa})`}>
        <path
          d={`M ${-r} 0 Q ${-r * 0.4} ${-r * 0.30} ${r * 0.55} ${-r * 0.10} Q ${r * 0.75} ${-r * 0.04} ${r} 0 Q ${r * 0.3} ${r * 0.10} ${-r} 0 Z`}
          fill={stalled ? "var(--color-nogo)" : "var(--color-navy)"}
          opacity={0.92}
        />
        {flaps && (
          <path
            d={`M ${r * 0.55} ${r * 0.02} L ${r * 1.02} ${r * 0.34}`}
            stroke="var(--color-brand)"
            strokeWidth={5}
            strokeLinecap="round"
          />
        )}
      </g>

      <text x={0} y={r * 1.35} textAnchor="middle" fontSize={13 * F.fs} fontWeight={800} fill={stalled ? "var(--color-nogo)" : "var(--color-navy)"}>
        {aoa >= 0 ? "+" : ""}
        {aoa.toFixed(0)}° AOA
      </text>
      {stalled && (
        <text x={0} y={r * 1.35 + 17 * F.fs} textAnchor="middle" fontSize={11 * F.fs} fontWeight={800} letterSpacing="0.08em" fill="var(--color-nogo)">
          STALLED
        </text>
      )}
    </g>
  );
}

function Drawing({
  F,
  scene,
  aoa,
  className,
}: {
  F: Frame;
  scene: Scene;
  aoa: number;
  className: string;
}) {
  const config = scene.flaps ? FLAPS : CLEAN;
  const stalled = aoa > config.aStall + 0.3;
  return (
    <svg
      viewBox={`0 0 ${F.w} ${F.h}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Coefficient of lift against angle of attack, ${scene.flaps ? "flaps down" : "clean"}, currently ${aoa.toFixed(0)} degrees${stalled ? ", stalled" : ""}`}
    >
      <Wing F={F} aoa={aoa} flaps={Boolean(scene.flaps)} stalled={stalled} />
      <Plot
        F={F}
        aoa={aoa}
        config={config}
        ghost={scene.compare ? CLEAN : undefined}
        showStallZone={aoa >= config.aStall - 0.4}
      />
      {/* The shift is the lesson in the flaps scenes, so it gets an arrow. */}
      {scene.compare && (
        <Layer at="lead">
          <path
            d={`M ${F.px + ((CLEAN.aStall - A_MIN) / (A_MAX - A_MIN)) * F.pw} ${F.py + F.ph - (CLEAN.clMax / CL_MAX_AXIS) * F.ph}
                L ${F.px + ((FLAPS.aStall - A_MIN) / (A_MAX - A_MIN)) * F.pw} ${F.py + F.ph - (FLAPS.clMax / CL_MAX_AXIS) * F.ph}`}
            stroke="var(--color-go)"
            strokeWidth={2.5}
            strokeDasharray="5 4"
            markerEnd="url(#wb-arrow-safe)"
            fill="none"
          />
          <Tag
            x={F.px + 12}
            y={F.py + 20 * F.fs}
            role="safe"
            text="up, and to the LEFT"
            size={12.5 * F.fs}
            strong
          />
        </Layer>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export function ClCurveExplainer({
  scene,
  onResolveGate,
}: {
  scene: number;
  onResolveGate: (outcome: GateOutcome) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [drag, setDrag] = useState(8);

  const n = Math.min(Math.max(scene, 0), SCENES.length - 1);
  const s = SCENES[n];
  const target = s.play ? drag : s.aoa;
  const aoa = useEasedNumber(target, 900);

  const config = s.flaps ? FLAPS : CLEAN;
  const liveCl = cl(s.play ? drag : aoa, config);

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
        <StageChip corner="tr">{s.play ? "Interactive" : s.flaps ? "Flaps down" : "Clean wing"}</StageChip>

        <Drawing F={LAND} scene={s} aoa={aoa} className="hidden h-full w-full sm:block" />
        <Drawing F={PORT} scene={s} aoa={aoa} className="h-full w-full sm:hidden" />
      </Stage>

      {s.play && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <div className="shrink-0">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-navy-faint">Critical</p>
              <p className="tabular text-[15px] font-extrabold text-navy">{CLEAN.aStall}°</p>
            </div>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Angle of attack</span>
              <input
                type="range"
                min={-6}
                max={22}
                step={1}
                value={drag}
                onChange={(e) => setDrag(Number(e.target.value))}
                className="w-full accent-[var(--color-brand)]"
              />
              <span className="mt-0.5 block text-center text-[10.5px] font-bold uppercase tracking-wider text-navy-faint">
                AOA {drag > 0 ? "+" : ""}
                {drag}°
              </span>
            </label>
            <div className="shrink-0 text-right">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-navy-faint">C∟</p>
              <p
                className={`tabular text-[19px] font-extrabold leading-none ${
                  drag > CLEAN.aStall ? "text-nogo" : "text-brand"
                }`}
              >
                {liveCl.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

ClCurveExplainer.sceneCount = SCENES.length;
ClCurveExplainer.blocksAt = (scene: number) => Boolean(SCENES[scene]?.predict);
ClCurveExplainer.nextLabel = (scene: number) => {
  const s = SCENES[scene];
  if (!s) return "Next";
  if (s.predict) return "Reveal";
  if (s.play) return "Finish";
  return "Next";
};
ClCurveExplainer.anchor = [
  "C∟ rises with AOA, peaks at C∟max, then FALLS. The peak is the critical angle.",
  "A stall is an angle of attack, not a speed. The critical angle never moves.",
  "Flaps down: C∟max goes UP, and the angle it arrives at goes DOWN.",
];
