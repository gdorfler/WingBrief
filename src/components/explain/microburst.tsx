"use client";

/**
 * The Airspeed You Get Back — gold-standard Weather explainer.
 *
 * VISUAL THESIS
 * The airspeed gain is the warning, not the good news. A microburst hands you
 * fifteen knots on the way in and takes twenty-five back on the way out, and
 * the pilots who die in one are the pilots who spent the gift — pulling power
 * to correct the balloon, and having nothing left when the tailwind arrives.
 *
 * So this follows ONE aircraft through ONE encounter rather than diagramming a
 * microburst. The same aircraft, the same approach, moving left to right, with
 * its airspeed and its position relative to the glidepath moving underneath it.
 * The prediction gate lands at the exact moment a real crew has to decide, and
 * the last static scene is the whole encounter drawn as one airspeed trace —
 * the shape that is worth remembering.
 *
 * Source accuracy: a microburst outflow gives a headwind on entry, becomes a
 * pure downdraft at the core, and becomes a tailwind on exit. Performance-
 * increasing shear first, performance-decreasing shear second. The numbers here
 * are a legible reading of that shape, not a specific event.
 */

import { useState } from "react";
import type { GateOutcome } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";

/* ------------------------------------------------------------------ */
/* The encounter, as functions of position                             */
/* ------------------------------------------------------------------ */

const VB = { w: 960, h: 400 };
const GROUND = 330;
const CORE_X = 520;
const HALF = 210;
const APPROACH_KT = 120;

/** The portrait window: wide enough for the aircraft, its wind arrow and the
 *  glidepath under it, and nothing else. */
const CROP = { w: 470, h: 400 };
/** The horizontal extent of a drawing frame, in viewBox units. */
interface Win {
  x0: number;
  x1: number;
}
/** The trace is a chart, so its portrait window is the burst span, not the sky. */
const TRACE_CROP = { w: 480, h: 300 };

/** Glidepath: a straight line to the threshold. */
const gpY = (x: number) => 96 + (GROUND - 96) * ((x - 60) / (900 - 60));

/**
 * Headwind component. Positive is a headwind — the gift. One smooth cycle
 * through the burst: headwind in, nothing at the core, tailwind out.
 */
function headwind(x: number) {
  const t = (x - (CORE_X - HALF)) / (2 * HALF);
  if (t <= 0 || t >= 1) return 0;
  return 24 * Math.sin(2 * Math.PI * t);
}

/** Downdraft, concentrated under the core rather than smeared over the whole
 *  encounter — which is both what a microburst does and what keeps the vertical
 *  speed readout agreeing with the caption. */
function downdraft(x: number) {
  const t = (x - (CORE_X - HALF)) / (2 * HALF);
  if (t <= 0 || t >= 1) return 0;
  return -1900 * Math.sin(Math.PI * t) ** 4;
}

const airspeed = (x: number) => APPROACH_KT + headwind(x);
/** Baseline descent, plus the core's sink, plus the performance change the
 *  headwind itself produces — gaining airspeed lifts you, losing it drops you. */
const vsi = (x: number) => -700 + downdraft(x) + 6 * headwind(x);
/** Above the glidepath while gaining, below it while losing. */
const offset = (x: number) => -0.95 * headwind(x);
const acY = (x: number) => gpY(x) + offset(x);

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Scene {
  idea: string;
  sub?: string;
  x: number;
  /** Which part of the wind field is drawn yet. */
  show: { cloud?: boolean; column?: boolean; outflow?: boolean; wind?: boolean };
  tone?: "reveal" | "danger";
  trace?: boolean;
  play?: boolean;
  predict?: { question: string; options: string[]; answer: number; because: string };
}

const SCENES: Scene[] = [
  {
    idea: "A normal approach. On speed, on glidepath.",
    sub: "120 knots, 700 feet per minute down. Nothing to see yet.",
    x: 130,
    show: {},
  },
  {
    idea: "Ahead of you, a column of air is falling out of that cloud.",
    sub: "It hits the ground and has nowhere to go but sideways.",
    x: 130,
    show: { cloud: true, column: true, outflow: true },
  },
  {
    idea: "The near side of the outflow blows straight at you. Airspeed rises.",
    sub: "You are above glidepath and fast. Every instinct says reduce power.",
    x: 380,
    show: { cloud: true, column: true, outflow: true, wind: true },
  },
  {
    idea: "This is the moment that decides the outcome.",
    x: 380,
    show: { cloud: true, column: true, outflow: true, wind: true },
    predict: {
      question:
        "On short final your airspeed jumps 15 knots and you balloon above glidepath. What happens next?",
      options: [
        "It settles — ride it out",
        "A downdraft, then a tailwind that takes it all back",
        "You stay fast the whole way in",
      ],
      answer: 1,
      because:
        "The outflow is symmetric. Whatever headwind it gave you on the near side, it gives you as a tailwind on the far side — with the downdraft in between. The extra knots were never yours to spend.",
    },
  },
  {
    idea: "The core. No headwind left, and the air itself is going down.",
    sub: "Airspeed is back to normal. The descent rate is not.",
    x: 520,
    show: { cloud: true, column: true, outflow: true, wind: true },
  },
  {
    idea: "Now the outflow is behind you. Airspeed collapses.",
    sub: "Below glidepath, below approach speed, sinking, low and slow.",
    x: 660,
    show: { cloud: true, column: true, outflow: true, wind: true },
    tone: "danger",
  },
  {
    idea: "One encounter, one shape. The gain is the warning.",
    sub: "Everything the burst gives you on the left, it takes back on the right.",
    x: 660,
    show: { cloud: true, column: true, outflow: true },
    trace: true,
    tone: "reveal",
  },
  {
    idea: "Fly it yourself. Drag through the burst and watch the numbers.",
    sub: "Find the point where airspeed reads normal and the aeroplane is still falling out of the sky.",
    x: 130,
    show: { cloud: true, column: true, outflow: true, wind: true },
    play: true,
  },
];

/* ------------------------------------------------------------------ */
/* Drawing                                                             */
/* ------------------------------------------------------------------ */

function Aircraft({ x, y, danger }: { x: number; y: number; danger: boolean }) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(4) scale(2)`}
      style={{ transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      stroke="var(--color-surface)"
      strokeWidth={2.4}
      strokeLinejoin="round"
    >
      <path
        d="M-24 0 C-24 -2.8 -21 -4 -14 -4.4 L3 -5 C10 -5 18 -3 24 0 C18 3 10 5 3 5 L-14 4.4 C-21 4 -24 2.8 -24 0 Z"
        fill="var(--color-navy)"
      />
      <path d="M-3 -1 L-11 -13 L-6 -13 L3 -1 Z" fill="var(--color-navy)" />
      <path d="M-18 -1 L-24 -11 L-21 -11 L-15 -1 Z" fill="var(--color-navy)" opacity={0.75} />
      <path d="M-2 1 L-10 10 L-5 10 L3 1 Z" fill="var(--color-navy)" opacity={0.6} />
      {danger && (
        <circle r={19} fill="none" stroke="var(--color-nogo)" strokeWidth={2} opacity={0.8} />
      )}
    </g>
  );
}

/** The airspeed trace — the one image worth carrying out of this explainer. */
function Trace() {
  const x0 = CORE_X - HALF;
  const x1 = CORE_X + HALF;

  const top = 60;
  const h = 210;
  const kt = (v: number) => top + h / 2 - (v - APPROACH_KT) * 3.4;

  const pts: string[] = [];
  for (let x = 60; x <= 900; x += 6) pts.push(`${x} ${kt(airspeed(x))}`);

  const gain = [`M ${x0} ${kt(APPROACH_KT)}`];
  for (let x = x0; x <= CORE_X; x += 6) gain.push(`L ${x} ${kt(airspeed(x))}`);
  gain.push(`L ${CORE_X} ${kt(APPROACH_KT)} Z`);

  const loss = [`M ${CORE_X} ${kt(APPROACH_KT)}`];
  for (let x = CORE_X; x <= x1; x += 6) loss.push(`L ${x} ${kt(airspeed(x))}`);
  loss.push(`L ${x1} ${kt(APPROACH_KT)} Z`);

  return (
    <g>
      <path d={gain.join(" ")} fill="var(--color-go)" opacity={0.16} />
      <path d={loss.join(" ")} fill="var(--color-nogo)" opacity={0.16} />

      <line x1={60} y1={kt(APPROACH_KT)} x2={900} y2={kt(APPROACH_KT)}
        stroke="var(--color-navy-faint)" strokeWidth={1.8} strokeDasharray="7 6" />
      <text x={318} y={kt(APPROACH_KT) + 24} fontSize={12.5} fontWeight={800} fill="var(--color-navy-faint)">
        APPROACH SPEED 120 KT
      </text>

      <polyline points={pts.join(" ")} fill="none" stroke="var(--color-brand)" strokeWidth={4} strokeLinecap="round" />

      <text x={430} y={kt(APPROACH_KT) - 40} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--color-go-dark)">
        +24 kt given
      </text>
      <text x={630} y={kt(APPROACH_KT) + 35} textAnchor="middle" fontSize={15} fontWeight={800} fill="var(--color-nogo)">
        −24 kt taken
      </text>

      <line x1={CORE_X} y1={top} x2={CORE_X} y2={top + h} stroke="var(--color-line-strong)" strokeWidth={1.6} />
      <text x={CORE_X} y={top + h + 22} textAnchor="middle" fontSize={12.5} fontWeight={800} fill="var(--color-navy-faint)">
        CORE
      </text>
    </g>
  );
}

/**
 * Does a label fit entirely inside the camera window?
 *
 * The portrait crop moves with the aircraft, so a label that is comfortably in
 * frame on desktop can end up sliced down the middle on a phone. Half a word is
 * worse than no word, so anything that does not fit is not drawn.
 */
function fits(win: Win, x: number, chars: number, anchor: "start" | "middle" | "end" = "middle") {
  const w = chars * 7.6;
  const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
  return left >= win.x0 + 4 && left + w <= win.x1 - 4;
}

function Field({ show, x, win }: { show: Scene["show"]; x: number; win: Win }) {
  const hw = headwind(x);
  return (
    <>
      {/* Ground and runway. */}
      <line x1={0} y1={GROUND} x2={VB.w} y2={GROUND} stroke="var(--color-navy)" strokeWidth={3} />
      <rect x={820} y={GROUND - 5} width={132} height={10} rx={2} fill="var(--color-navy)" opacity={0.28} />
      {fits(win, 886, 6) && (
        <text x={886} y={GROUND + 24} textAnchor="middle" fontSize={12.5} fontWeight={800}
          letterSpacing="0.06em" fill="var(--color-navy-faint)">
          RUNWAY
        </text>
      )}

      <line x1={60} y1={gpY(60)} x2={900} y2={gpY(900)}
        stroke="var(--color-navy-faint)" strokeWidth={2} strokeDasharray="8 7" />
      {fits(win, 92, 9, "start") && (
        <text x={92} y={gpY(92) - 14} fontSize={12.5} fontWeight={800}
          letterSpacing="0.06em" fill="var(--color-navy-faint)">
          GLIDEPATH
        </text>
      )}

      {show.cloud && (
        <g>
          <ellipse cx={CORE_X} cy={36} rx={122} ry={27} fill="var(--color-navy)" opacity={0.13} />
          <ellipse cx={CORE_X - 58} cy={45} rx={68} ry={21} fill="var(--color-navy)" opacity={0.13} />
          <ellipse cx={CORE_X + 62} cy={43} rx={72} ry={21} fill="var(--color-navy)" opacity={0.13} />
        </g>
      )}

      {/* The falling column. */}
      {show.column &&
        [-46, 0, 46].map((dx) => (
          <line
            key={dx}
            x1={CORE_X + dx} y1={78} x2={CORE_X + dx} y2={GROUND - 12}
            stroke="var(--color-nogo)" strokeWidth={dx === 0 ? 5 : 3.4}
            strokeLinecap="round" opacity={dx === 0 ? 0.9 : 0.55}
            markerEnd="url(#wb-arrow-danger)"
          />
        ))}
      {show.column && fits(win, CORE_X + 64, 9, "start") && (
        <text x={CORE_X + 64} y={126} fontSize={13} fontWeight={800}
          letterSpacing="0.06em" fill="var(--color-nogo)">
          DOWNDRAFT
        </text>
      )}

      {/* Outflow, spreading both ways along the ground. */}
      {show.outflow && (
        <g>
          <line x1={CORE_X - 60} y1={GROUND - 14} x2={CORE_X - 210} y2={GROUND - 14}
            stroke="var(--color-nogo)" strokeWidth={3.6} strokeLinecap="round" markerEnd="url(#wb-arrow-danger)" />
          <line x1={CORE_X + 60} y1={GROUND - 14} x2={CORE_X + 210} y2={GROUND - 14}
            stroke="var(--color-nogo)" strokeWidth={3.6} strokeLinecap="round" markerEnd="url(#wb-arrow-danger)" />
          {fits(win, CORE_X - 136, 7) && (
            <text x={CORE_X - 136} y={GROUND + 24} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--color-nogo)">
              OUTFLOW
            </text>
          )}
          {fits(win, CORE_X + 136, 7) && (
            <text x={CORE_X + 136} y={GROUND + 24} textAnchor="middle" fontSize={12} fontWeight={800} fill="var(--color-nogo)">
              OUTFLOW
            </text>
          )}
        </g>
      )}

      {/* The wind the aircraft is actually feeling, drawn at the aircraft. */}
      {show.wind && Math.abs(hw) > 1.5 && (
        <g
          transform={`translate(${x} ${acY(x) - 58})`}
          style={{ transition: "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <line
            x1={hw > 0 ? 62 : -62} y1={0} x2={hw > 0 ? 8 : -8} y2={0}
            stroke={hw > 0 ? "var(--color-go)" : "var(--color-nogo)"}
            strokeWidth={4} strokeLinecap="round"
            markerEnd={hw > 0 ? "url(#wb-arrow-safe)" : "url(#wb-arrow-danger)"}
          />
          <text
            x={hw > 0 ? 34 : -34} y={-12} textAnchor="middle" fontSize={12.5} fontWeight={800}
            fill={hw > 0 ? "var(--color-go-dark)" : "var(--color-nogo)"}
          >
            {hw > 0 ? "HEADWIND" : "TAILWIND"}
          </text>
        </g>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Readout                                                             */
/* ------------------------------------------------------------------ */

function Readout({ x }: { x: number }) {
  const kt = airspeed(x);
  const rate = vsi(x);
  const off = offset(x);
  const dev = Math.round(-off * 2.2);

  const speedTone = kt < APPROACH_KT - 8 ? "nogo" : kt > APPROACH_KT + 8 ? "caution" : "go";
  const rateTone = rate < -1400 ? "nogo" : rate < -900 ? "caution" : "go";

  const cell = (label: string, value: string, sub: string, tone: string) => (
    <div className="min-w-0 flex-1 rounded-xl bg-surface-2 px-3 py-2.5">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-navy-faint">{label}</p>
      <p
        className={`tabular text-[24px] font-extrabold leading-tight sm:text-[27px] ${
          tone === "nogo" ? "text-nogo" : tone === "caution" ? "text-caution" : "text-go"
        }`}
      >
        {value}
      </p>
      <p className="truncate text-[11.5px] font-semibold text-navy-soft">{sub}</p>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center border-t border-line px-4 py-3 sm:px-6 xl:flex-none">
      <div className="mx-auto flex w-full max-w-3xl gap-2.5">
        {cell(
          "Airspeed",
          `${Math.round(kt)} kt`,
          kt > APPROACH_KT + 3 ? "borrowed" : kt < APPROACH_KT - 3 ? "being repaid" : "on speed",
          speedTone,
        )}
        {cell(
          "Vertical speed",
          `${Math.round(rate / 50) * 50} fpm`,
          rate < -1400 ? "sinking hard" : rate < -900 ? "above normal" : "normal descent",
          rateTone,
        )}
        {cell(
          "Glidepath",
          dev === 0 ? "on" : `${dev > 0 ? "+" : ""}${dev} ft`,
          dev > 4 ? "high" : dev < -4 ? "low" : "on glidepath",
          dev < -4 ? "nogo" : dev > 4 ? "caution" : "go",
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export function MicroburstExplainer({
  scene,
  onResolveGate,
}: {
  scene: number;
  onResolveGate: (outcome: GateOutcome) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [scrub, setScrub] = useState(130);

  const s = SCENES[Math.min(scene, SCENES.length - 1)];
  const x = s.play ? scrub : s.x;
  const danger = airspeed(x) < APPROACH_KT - 6;

  /* Play pins the window over the burst so scrubbing does not swing the
   * camera; every other scene centres on wherever the aeroplane is. */
  const cropX = s.trace
    ? 286
    : s.play
      ? 250
      : Math.min(Math.max(x - CROP.w / 2, 0), VB.w - CROP.w);
  const crop = s.trace ? TRACE_CROP : CROP;
  const cropVb = `${cropX} ${s.trace ? 40 : 0} ${crop.w} ${crop.h}`;

  const label = s.trace
    ? "Airspeed trace across the microburst encounter"
    : `Aircraft in a microburst, airspeed ${Math.round(airspeed(x))} knots`;

  const frameFor = (win: Win) =>
    s.trace ? (
      <Trace />
    ) : (
      <>
        <Field show={s.show} x={x} win={win} />
        <Aircraft x={x} y={acY(x)} danger={danger} />
      </>
    );
  const cropBody = frameFor({ x0: cropX, x1: cropX + crop.w });
  const fullBody = frameFor({ x0: 0, x1: VB.w });

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
    <SceneIdea sub={s.sub} tone={s.tone === "reveal" ? "reveal" : undefined}>
      {s.idea}
    </SceneIdea>
  );

  return (
    <>
      <Stage caption={caption}>
        <div className="flex h-full flex-col pt-10 sm:pt-0">
          <StageChip>
            Scene {Math.min(scene, SCENES.length - 1) + 1} / {SCENES.length}
          </StageChip>
          {s.play && <StageChip corner="tr">Interactive</StageChip>}

          {/* Two compositions, not one shrunk.
              A 2.4:1 encounter dropped into a portrait frame leaves the
              aeroplane 12px long. Narrow screens get a camera cropped around
              the aircraft instead — the cloud and the far outflow are context,
              and context is what a small frame should spend last. */}
          <div
            className="relative w-full flex-none xl:hidden"
            style={{ aspectRatio: `${crop.w} / ${crop.h}` }}
          >
            <svg
              viewBox={cropVb}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={label}
            >
              {cropBody}
            </svg>
          </div>

          <div className="relative hidden min-h-0 flex-1 xl:block">
            <svg
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={label}
            >
              {fullBody}
            </svg>
          </div>

          {!s.trace && <Readout x={x} />}
        </div>
      </Stage>

      {s.play && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <label className="block">
              <span className="sr-only">Position along the approach</span>
              <input
                type="range"
                min={90}
                max={780}
                step={5}
                value={scrub}
                onChange={(e) => setScrub(Number(e.target.value))}
                className="w-full accent-[var(--color-brand)]"
              />
              <span className="mt-0.5 block text-center text-[10.5px] font-bold uppercase tracking-wider text-navy-faint">
                Fly the approach
              </span>
            </label>
          </div>
        </div>
      )}
    </>
  );
}

MicroburstExplainer.sceneCount = SCENES.length;
MicroburstExplainer.blocksAt = (scene: number) => Boolean(SCENES[scene]?.predict);
MicroburstExplainer.nextLabel = (scene: number) => {
  const s = SCENES[scene];
  if (!s) return "Next";
  if (s.predict) return "Reveal";
  if (s.play) return "Finish";
  if (s.trace) return "Fly it";
  return "Next";
};
MicroburstExplainer.anchor = [
  "A microburst gives you airspeed on the way in and takes it on the way out.",
  "The gain is the warning. Do not spend it — the tailwind is already coming.",
  "At the core, airspeed reads normal while the air itself is going down.",
];
