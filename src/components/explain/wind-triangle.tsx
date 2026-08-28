"use client";

/**
 * How the Wind Triangle Works — gold-standard Navigation explainer.
 *
 * VISUAL THESIS
 * The triangle is not a diagram to memorise, it is an addition. The air vector
 * plus the wind vector IS the ground vector, and the reason a heading is never
 * the course is that you are adding something to it whether you like it or not.
 *
 * Students draw the triangle correctly and still cannot say which side they are
 * solving for, because every textbook shows it already closed. Here it is built
 * one vector at a time in the order the aircraft actually experiences them: the
 * course you drew, the heading you flew, the air that moved underneath you, and
 * only then the track you got. The gate arrives at the moment the drift is
 * visible and the correction is not yet obvious.
 *
 * Accuracy: heading = course + WCA, where sin(WCA) = crosswind / TAS, and
 * groundspeed = TAS·cos(WCA) − headwind component. Both are computed here, not
 * tabulated, so the interactive scene stays true at every wind angle.
 */

import { useState } from "react";
import { AngleArc, Tag, Vector } from "./grammar";
import type { GateOutcome } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";

/* ------------------------------------------------------------------ */
/* The problem                                                         */
/* ------------------------------------------------------------------ */

const VB = { w: 380, h: 470 };
const O = { x: 150, y: 356 };
const SCALE = 2.4;

const TC = 0; // true course, degrees
const TAS = 120; // knots
const WS = 40; // knots
const WD_DEFAULT = 270; // wind FROM, degrees

const rad = (d: number) => (d * Math.PI) / 180;
/** Compass degrees to a screen vector: north is up, east is right. */
const vec = (deg: number, mag: number) => ({
  x: mag * Math.sin(rad(deg)),
  y: -mag * Math.cos(rad(deg)),
});
const norm = (d: number) => ((d % 360) + 360) % 360;
/** Signed difference in (-180, 180]. A heading of 341 against a course of 000
 *  is 19 degrees left, not 341 degrees right — and an arc drawn from the
 *  unsigned difference sweeps almost the whole circle. */
const diff = (a: number, b: number) => ((a - b + 540) % 360) - 180;
/** Compass degrees to the screen degrees AngleArc expects: north is up. */
const arcDeg = (compass: number) => compass - 90;

/** Everything the triangle knows, from a wind direction and speed. */
function solve(wd: number, ws: number) {
  const theta = rad(wd - TC);
  const cross = ws * Math.sin(theta);
  const head = ws * Math.cos(theta);
  const wca = (Math.asin(Math.max(-1, Math.min(1, cross / TAS))) * 180) / Math.PI;
  const hdg = norm(TC + wca);
  const gs = TAS * Math.cos(rad(wca)) - head;
  return { wca, hdg, gs, cross, head };
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Scene {
  idea: string;
  sub?: string;
  /** Whether this scene is flying the wind correction angle yet. */
  corrected?: boolean;
  show: { air?: boolean; wind?: boolean; ground?: boolean; drift?: boolean; wca?: boolean };
  identity?: boolean;
  play?: boolean;
  tone?: "reveal";
  predict?: { question: string; options: string[]; answer: number; because: string };
}

const SCENES: Scene[] = [
  {
    idea: "This is the course you drew on the chart.",
    sub: "Due north. It is a line on paper — nothing has flown it yet.",
    show: {},
  },
  {
    idea: "Point the nose down that line and fly. This is your AIR vector.",
    sub: "Heading 000, 120 knots true airspeed. Where the aeroplane goes through the air.",
    show: { air: true },
  },
  {
    idea: "But the air is moving too — 40 knots out of the west.",
    sub: "The wind vector starts where the air vector ends. It carries you for an hour.",
    show: { air: true, wind: true },
  },
  {
    idea: "Close the triangle and you get where you actually went.",
    sub: "Track 018, groundspeed 126. Eighteen degrees off the course you drew.",
    show: { air: true, wind: true, ground: true, drift: true },
  },
  {
    idea: "So you are drifting eighteen degrees right of course.",
    show: { air: true, wind: true, ground: true, drift: true },
    predict: {
      question: "The wind is pushing you right of course. Which way do you turn the nose?",
      options: ["Left, into the wind", "Right, with the drift", "Keep the heading, accept it"],
      answer: 0,
      because:
        "You crab into the wind by exactly the angle that cancels the crosswind — sin(WCA) = crosswind ÷ TAS. Here 40 ÷ 120 gives 19°, so you fly heading 341 to make good a course of 000.",
    },
  },
  {
    idea: "Turn 19° into the wind. Now the ground vector lands on the course.",
    sub: "Heading 341, and the track finally reads 000. That angle is the wind correction angle.",
    corrected: true,
    show: { air: true, wind: true, ground: true, wca: true },
    tone: "reveal",
  },
  {
    idea: "Air plus wind equals ground. Any two sides give you the third.",
    sub: "Planning: you know course and wind, solve for heading. In flight: you know heading and track, solve for wind.",
    corrected: true,
    show: { air: true, wind: true, ground: true },
    identity: true,
  },
  {
    idea: "Swing the wind around and watch the triangle answer.",
    sub: "Find the wind direction that needs no correction at all — and the one that costs you the most groundspeed.",
    corrected: true,
    show: { air: true, wind: true, ground: true, wca: true },
    play: true,
  },
];

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function Compass() {
  return (
    <g transform={`translate(${VB.w - 40} 46)`}>
      <circle r={22} fill="var(--color-surface-2)" stroke="var(--color-line)" strokeWidth={1.4} />
      <path d="M0 -16 L4.5 4 L0 0.5 L-4.5 4 Z" fill="var(--color-navy)" />
      <text y={-27} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--color-navy-faint)">
        N
      </text>
    </g>
  );
}

function Triangle({ hdg, wd, ws, show }: { hdg: number; wd: number; ws: number; show: Scene["show"] }) {
  const air = vec(hdg, TAS * SCALE);
  const wind = vec(wd + 180, ws * SCALE);
  const airEnd = { x: O.x + air.x, y: O.y + air.y };
  const gndEnd = { x: airEnd.x + wind.x, y: airEnd.y + wind.y };

  const course = vec(TC, 320);
  const trackDeg = norm((Math.atan2(gndEnd.x - O.x, -(gndEnd.y - O.y)) * 180) / Math.PI);
  const driftDeg = diff(trackDeg, TC);
  const wcaDeg = diff(hdg, TC);

  return (
    <>
      {/* The course: a chart line, so it is dashed — nothing is flying it. */}
      <line
        x1={O.x} y1={O.y} x2={O.x + course.x} y2={O.y + course.y}
        stroke="var(--color-navy-faint)" strokeWidth={2} strokeDasharray="8 7"
      />
      <Tag x={O.x + course.x} y={O.y + course.y} dy={-14} text="COURSE 000" role="reference" align="middle" />

      {show.air && (
        <Vector
          x1={O.x} y1={O.y} x2={airEnd.x} y2={airEnd.y}
          role="subject" width={3.6} label="AIR" labelSide="above" labelAt={0.52}
        />
      )}

      {show.wind && (
        <Vector
          x1={airEnd.x} y1={airEnd.y} x2={gndEnd.x} y2={gndEnd.y}
          role="danger" width={3.4} label="WIND" labelSide="below"
        />
      )}

      {show.ground && (
        <Vector
          x1={O.x} y1={O.y} x2={gndEnd.x} y2={gndEnd.y}
          role="safe" width={4} label="GROUND" labelSide="below" labelAt={0.42}
        />
      )}

      {/* Drift: course against the track you actually made good. */}
      {show.drift && (
        <AngleArc
          cx={O.x} cy={O.y} from={arcDeg(0)} to={arcDeg(driftDeg)} r={160} labelGap={40}
          role="danger" label={`${Math.round(Math.abs(driftDeg))}° drift`} glow
        />
      )}

      {/* WCA: course against the heading you are holding. */}
      {show.wca && Math.abs(wcaDeg) > 0.7 && (
        <AngleArc
          cx={O.x} cy={O.y} from={arcDeg(wcaDeg)} to={arcDeg(0)} r={160} labelGap={40}
          role="primary" label={`${Math.round(Math.abs(wcaDeg))}° WCA`} glow
        />
      )}

      <circle cx={O.x} cy={O.y} r={5.5} fill="var(--color-navy)" />
    </>
  );
}

/** The closing image: three sides, one sentence. */
function Identity() {
  return (
    <g>
      <rect x={10} y={392} width={360} height={54} rx={14} fill="var(--color-surface-2)" />
      <text x={190} y={426} textAnchor="middle" fontSize={22} fontWeight={800} fill="var(--color-navy)">
        <tspan fill="var(--color-navy)">AIR</tspan>
        <tspan fill="var(--color-navy-faint)"> + </tspan>
        <tspan fill="var(--color-nogo)">WIND</tspan>
        <tspan fill="var(--color-navy-faint)"> = </tspan>
        <tspan fill="var(--color-go)">GROUND</tspan>
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Readout                                                             */
/* ------------------------------------------------------------------ */

function Readout({
  hdg, gs, wca, wd, ws, show,
}: {
  hdg: number; gs: number; wca: number; wd: number; ws: number; show: Scene["show"];
}) {
  const DASH = "—";
  const cell = (label: string, value: string, sub: string, tone?: "brand" | "go") => (
    <div className="min-w-0 rounded-xl bg-surface-2 px-3 py-2 sm:flex-1 sm:py-2.5">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-navy-faint">{label}</p>
      <p
        className={`tabular text-[21px] font-extrabold leading-tight sm:text-[24px] ${
          tone === "brand" ? "text-brand" : tone === "go" ? "text-go" : "text-navy"
        }`}
      >
        {value}
      </p>
      <p className="truncate text-[11.5px] font-semibold text-navy-soft">{sub}</p>
    </div>
  );

  return (
    <div className="shrink-0 border-t border-line px-4 py-3 sm:px-6">
      <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-2 sm:flex sm:gap-2.5">
        {cell(
          "Wind",
          show.wind ? `${String(Math.round(norm(wd)) || 360).padStart(3, "0")}/${ws}` : DASH,
          show.wind ? "from / knots" : "not yet",
        )}
        {cell(
          "Heading",
          show.air ? `${String(Math.round(hdg)).padStart(3, "0")}°` : DASH,
          show.air ? "nose points here" : "nothing flying yet",
          "brand",
        )}
        {cell(
          "WCA",
          show.air ? `${wca > 0 ? "+" : ""}${Math.round(wca)}°` : DASH,
          !show.air ? "not yet" : Math.abs(wca) < 0.5 ? "no correction" : wca < 0 ? "crab left" : "crab right",
          "brand",
        )}
        {cell(
          "Groundspeed",
          show.ground ? `${Math.round(gs)}` : DASH,
          show.ground ? "knots" : "close the triangle",
          "go",
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export function WindTriangleExplainer({
  scene,
  onResolveGate,
}: {
  scene: number;
  onResolveGate: (outcome: GateOutcome) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [wd, setWd] = useState(WD_DEFAULT);

  const s = SCENES[Math.min(scene, SCENES.length - 1)];
  const windDir = s.play ? wd : WD_DEFAULT;
  const sol = solve(windDir, WS);
  const hdg = s.corrected ? sol.hdg : TC;
  const uncorrected = !s.corrected;

  /* Uncorrected, the ground vector is the raw sum, so groundspeed is longer. */
  const air = vec(hdg, TAS);
  const wind = vec(windDir + 180, WS);
  const gnd = { x: air.x + wind.x, y: air.y + wind.y };
  const gs = uncorrected ? Math.hypot(gnd.x, gnd.y) : sol.gs;
  const wca = uncorrected ? 0 : sol.wca;

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

  const drawing = (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Wind triangle: heading ${Math.round(hdg)}, groundspeed ${Math.round(gs)} knots`}
    >
      <Compass />
      <Triangle hdg={hdg} wd={windDir} ws={WS} show={s.show} />
      {s.identity && <Identity />}
    </svg>
  );

  return (
    <>
      <Stage caption={caption}>
        <div className="flex h-full flex-col pt-10 sm:pt-0">
          <StageChip>
            Scene {Math.min(scene, SCENES.length - 1) + 1} / {SCENES.length}
          </StageChip>
          {s.play && <StageChip corner="tr">Interactive</StageChip>}

          <div className="relative min-h-0 flex-1">{drawing}</div>

          <Readout hdg={hdg} gs={gs} wca={wca} wd={windDir} ws={WS} show={s.show} />
        </div>
      </Stage>

      {s.play && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <label className="block">
              <span className="sr-only">Wind direction</span>
              <input
                type="range"
                min={0}
                max={359}
                step={5}
                value={wd === 360 ? 0 : wd}
                onChange={(e) => setWd(Number(e.target.value) === 0 ? 360 : Number(e.target.value))}
                className="w-full accent-[var(--color-brand)]"
              />
              <span className="mt-0.5 block text-center text-[10.5px] font-bold uppercase tracking-wider text-navy-faint">
                Wind from {String(Math.round(norm(windDir)) || 360).padStart(3, "0")}° at {WS} kt
              </span>
            </label>
          </div>
        </div>
      )}
    </>
  );
}

WindTriangleExplainer.sceneCount = SCENES.length;
WindTriangleExplainer.blocksAt = (scene: number) => Boolean(SCENES[scene]?.predict);
WindTriangleExplainer.nextLabel = (scene: number) => {
  const s = SCENES[scene];
  if (!s) return "Next";
  if (s.predict) return "Reveal";
  if (s.play) return "Finish";
  if (s.identity) return "Try it";
  return "Next";
};
WindTriangleExplainer.anchor = [
  "AIR + WIND = GROUND. Three vectors, and any two give you the third.",
  "Air vector is heading and TAS. Ground vector is track and groundspeed.",
  "Crab INTO the wind: sin(WCA) = crosswind ÷ TAS.",
];
