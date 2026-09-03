"use client";

/**
 * Air Through the Engine — gold-standard explainer.
 *
 * VISUAL THESIS
 * The turbine and the compressor are bolted to the same shaft. The engine is a
 * loop, not a line: the hot gas on its way out is what keeps the cold air
 * coming in. Students memorise five section names and still cannot say what
 * drives the compressor, because the diagram that teaches the sections never
 * draws the connection.
 *
 * So the sections are not five highlights of a static cutaway. One parcel of
 * air is followed the whole way through, riding the gas path between the hub
 * and the casing; its pressure, temperature and velocity move as it passes each
 * station; and the shaft is deliberately withheld until the turbine scene,
 * where revealing it reframes everything already watched.
 *
 * Every property change below is the trainee guide's own station table:
 *   inlet       P up             T unchanged   V down
 *   compressor  P up             T up          V up
 *   burner      P slightly down  T up          V up
 *   turbine     P down           T down        V up
 *   exhaust     P down           T down        V up
 *
 * The numbers driving the bars are a reading of that table, not measurements —
 * the direction of each change is what the exam asks for, so the direction is
 * printed in words beside every bar.
 */

import { useState } from "react";
import { PulseRing } from "./grammar";
import type { GateOutcome } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";

/* ------------------------------------------------------------------ */
/* Engine geometry                                                     */
/* ------------------------------------------------------------------ */

const VB = { w: 960, h: 244 };
const AXIS = 112;
/** One baseline for every station name. Hanging each off its own local casing
 *  radius scattered them across 40px of vertical and pushed EXHAUST inside the
 *  engine body. */
const LABEL_Y = 227;
const R_MAX = 89;

/** Outer casing half-height. A nacelle: fat through the core, tapering to the
 *  nozzle. The first pass varied this so hard the engine read as a bowtie. */
const CASING: [number, number][] = [
  [92, 62], [150, 81], [250, 89], [460, 84], [470, 86],
  [600, 86], [610, 84], [730, 78], [880, 43],
];

/** Inner hub half-height. The annulus between hub and casing IS the gas path,
 *  and it narrowing through the compressor is what compression looks like. */
const HUB: [number, number][] = [
  [250, 8], [330, 27], [460, 46], [600, 46], [700, 35], [732, 14],
];

function lerp(table: [number, number][], x: number) {
  if (x <= table[0][0]) return table[0][1];
  const last = table[table.length - 1];
  if (x >= last[0]) return last[1];
  for (let i = 0; i < table.length - 1; i++) {
    const [ax, av] = table[i];
    const [bx, bv] = table[i + 1];
    if (x >= ax && x <= bx) return av + ((x - ax) / (bx - ax)) * (bv - av);
  }
  return last[1];
}

const casingAt = (x: number) => lerp(CASING, x);
const hubAt = (x: number) => (x < 250 || x > 732 ? 0 : lerp(HUB, x));
/** Mid-annulus — where a parcel of air actually travels. */
const flowY = (x: number) => AXIS - (casingAt(x) + hubAt(x)) / 2;

const poly = (table: [number, number][], sign: 1 | -1) =>
  table.map(([x, r], i) => `${i === 0 ? "M" : "L"} ${x} ${AXIS + sign * r}`).join(" ");

type Station = "inlet" | "compressor" | "burner" | "turbine" | "exhaust";

const STATIONS: { id: Station; x0: number; x1: number; label: string }[] = [
  { id: "inlet", x0: 92, x1: 250, label: "Inlet" },
  { id: "compressor", x0: 250, x1: 460, label: "Compressor" },
  { id: "burner", x0: 470, x1: 600, label: "Burner" },
  { id: "turbine", x0: 610, x1: 732, label: "Turbine" },
  { id: "exhaust", x0: 732, x1: 880, label: "Exhaust" },
];

/** The guide's table, as bar heights and as the words the exam asks for. */
const STATE: Record<
  Station | "ambient",
  { p: number; t: number; v: number; pw: string; tw: string; vw: string }
> = {
  ambient: { p: 0.18, t: 0.14, v: 0.5, pw: "ambient", tw: "ambient", vw: "free stream" },
  inlet: { p: 0.38, t: 0.14, v: 0.24, pw: "increases", tw: "unchanged", vw: "decreases" },
  compressor: { p: 0.88, t: 0.42, v: 0.4, pw: "increases", tw: "increases", vw: "increases" },
  burner: { p: 0.8, t: 0.95, v: 0.56, pw: "slightly down", tw: "increases", vw: "increases" },
  turbine: { p: 0.42, t: 0.66, v: 0.74, pw: "decreases", tw: "decreases", vw: "increases" },
  exhaust: { p: 0.2, t: 0.5, v: 0.96, pw: "decreases", tw: "decreases", vw: "increases" },
};

function stationAtX(x: number): Station | "ambient" {
  for (const s of STATIONS) if (x >= s.x0 && x <= s.x1) return s.id;
  return x < 92 ? "ambient" : "exhaust";
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Scene {
  idea: string;
  sub?: string;
  parcel: number;
  at: Station | "ambient";
  focus: Station | "all" | "none";
  zoom?: number;
  /** A phone shows a quarter of the width a desktop does, so it needs its own
   *  crop — including on scenes the desktop shows whole. */
  mzoom?: number;
  shaft?: boolean;
  thrust?: boolean;
  predict?: { question: string; options: string[]; answer: number; because: string };
  play?: boolean;
  tone?: "reveal";
  look?: number;
}

const SCENES: Scene[] = [
  {
    idea: "One parcel of air. Follow it the whole way through.",
    sub: "Everything the engine does, it does to this.",
    parcel: 40,
    at: "ambient",
    focus: "none",
  },
  {
    idea: "The inlet widens. The parcel slows down and its pressure rises.",
    sub: "A widening duct in subsonic flow is a diffuser — velocity down, pressure up.",
    parcel: 200,
    at: "inlet",
    focus: "inlet",
    zoom: 1.5,
  },
  {
    idea: "Stage after stage, the compressor squeezes it.",
    sub: "The gas path narrows as the hub swells. Each rotor accelerates the flow; each stator turns that speed into pressure.",
    parcel: 420,
    at: "compressor",
    focus: "compressor",
    zoom: 1.45,
  },
  {
    idea: "Fuel arrives, and the mixture lights.",
    sub: "Temperature climbs hard. Pressure actually eases back slightly — the burner is not a pump.",
    parcel: 545,
    at: "burner",
    focus: "burner",
    zoom: 1.5,
  },
  {
    idea: "The turbine takes energy back out of the gas.",
    sub: "Pressure and temperature both fall across it. Something is being paid for.",
    parcel: 675,
    at: "turbine",
    focus: "turbine",
    zoom: 1.5,
    predict: {
      question:
        "The turbine is extracting roughly three quarters of the gas's energy. What is that energy spent on?",
      options: ["Making thrust", "Driving the compressor", "Heating the cabin"],
      answer: 1,
      because:
        "About 75% of the energy the turbine extracts goes straight back to driving the compressor and the accessory gear box. Only what is left over — roughly a quarter — leaves as thrust.",
    },
  },
  {
    idea: "They are on the same shaft.",
    sub: "The turbine at the back is what turns the compressor at the front. The engine powers itself.",
    parcel: 675,
    at: "turbine",
    focus: "all",
    shaft: true,
    tone: "reveal",
  },
  {
    idea: "What is left accelerates out the back — and the aircraft goes forward.",
    sub: "The nozzle narrows, so the gas leaves faster than it arrived. Equal and opposite.",
    parcel: 860,
    at: "exhaust",
    focus: "exhaust",
    shaft: true,
    thrust: true,
  },
  {
    idea: "Scrub the parcel back and forth. Watch the three bars move.",
    sub: "Only one of the three rises at every single station after the inlet. Find it.",
    parcel: 40,
    at: "ambient",
    focus: "all",
    shaft: true,
    play: true,
  },
];

/* ------------------------------------------------------------------ */
/* Parts                                                               */
/* ------------------------------------------------------------------ */

/**
 * The property readout.
 *
 * A band across the foot of the frame rather than a floating corner card. The
 * old explainers parked readouts in a corner where they read as chrome; here
 * the bars are the second half of the drawing, sized to be read from across a
 * room, and each one names the direction of change in the guide's own words.
 */
/**
 * The property readout.
 *
 * HTML, not SVG, and a band under the drawing rather than a floating corner
 * card. Two reasons: inside the viewBox its type scaled with the engine and
 * became illegible on a phone, and a corner card reads as chrome — the bars are
 * half of what this explainer teaches. Each names the direction of change in
 * the guide's own words, which is the form the exam asks for.
 */
function Readout({
  state,
  station,
}: {
  state: (typeof STATE)[Station | "ambient"];
  station: Station | "ambient";
}) {
  const rows = [
    { key: "Pressure", v: state.p, w: state.pw, c: "var(--color-brand)" },
    { key: "Temperature", v: state.t, w: state.tw, c: "var(--color-nogo)" },
    { key: "Velocity", v: state.v, w: state.vw, c: "var(--color-go)" },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center border-t border-line px-4 py-3 sm:flex-none sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-navy-faint">
          Parcel is at
        </p>
        <p className="mb-3 text-[24px] font-extrabold leading-tight text-navy sm:mb-2 sm:text-[22px]">
          {station === "ambient" ? "Ambient air" : STATIONS.find((s) => s.id === station)!.label}
        </p>
        <div className="space-y-3 sm:space-y-1.5">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center gap-3">
              <span className="w-[86px] shrink-0 text-[11px] font-bold uppercase tracking-wider text-navy-faint sm:w-[104px] sm:text-[12px]">
                {r.key}
              </span>
              <span className="h-3.5 min-w-0 flex-1 rounded-full bg-surface-3 sm:h-2.5">
                <span
                  className="block h-3.5 rounded-full transition-[width] duration-500 ease-out sm:h-2.5"
                  style={{ width: `${Math.max(4, r.v * 100)}%`, background: r.c }}
                />
              </span>
              <span
                className="w-[96px] shrink-0 text-right text-[13.5px] font-extrabold sm:w-[112px]"
                style={{ color: r.c }}
              >
                {r.w}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EngineBody({ focus, shaft }: { focus: Scene["focus"]; shaft?: boolean }) {
  const lit = (id: Station) => focus === "all" || focus === "none" || focus === id;
  const dim = (id: Station) => (lit(id) ? 1 : 0.3);

  return (
    <>
      {/* Gas path fill, so the annulus the parcel rides in is a visible space. */}
      <path
        d={`${poly(CASING, -1)} L 880 ${AXIS + 32} ${[...CASING].reverse().map(([x, r]) => `L ${x} ${AXIS + r}`).join(" ")} Z`}
        fill="var(--color-surface-2)"
        opacity={0.75}
      />

      {STATIONS.map((s) => {
        const mid = (s.x0 + s.x1) / 2;
        return (
          <g key={s.id} opacity={dim(s.id)} style={{ transition: "opacity 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
            {focus === s.id && (
              <rect
                x={s.x0} y={AXIS - R_MAX} width={s.x1 - s.x0} height={R_MAX * 2}
                fill="color-mix(in srgb, var(--color-brand) 11%, transparent)"
              />
            )}
            <line
              x1={s.x0} y1={AXIS - casingAt(s.x0)} x2={s.x0} y2={AXIS + casingAt(s.x0)}
              stroke="var(--color-line-strong)" strokeWidth={1.4} strokeDasharray="4 4"
            />
            {/* A zoomed camera would slice far labels in half at the frame edge. */}
            {(focus === "all" || focus === "none" || focus === s.id) && (
              <text
                x={mid} y={LABEL_Y} textAnchor="middle"
                fontSize={13} fontWeight={800} letterSpacing="0.06em"
                fill={focus === s.id ? "var(--color-brand)" : "var(--color-navy-faint)"}
              >
                {s.label.toUpperCase()}
              </text>
            )}
          </g>
        );
      })}

      {/* Compressor: alternating rotor and stator rows, hub to casing. */}
      <g opacity={dim("compressor")} style={{ transition: "opacity 460ms" }}>
        {Array.from({ length: 8 }, (_, i) => {
          const x = 268 + i * 24;
          const r0 = hubAt(x) + 3;
          const r1 = casingAt(x) - 5;
          return (
            <g key={i}>
              <line x1={x} y1={AXIS - r1} x2={x} y2={AXIS - r0}
                stroke={i % 2 === 0 ? "var(--color-brand)" : "var(--color-navy-faint)"}
                strokeWidth={i % 2 === 0 ? 3.2 : 2} strokeLinecap="round" />
              <line x1={x} y1={AXIS + r0} x2={x} y2={AXIS + r1}
                stroke={i % 2 === 0 ? "var(--color-brand)" : "var(--color-navy-faint)"}
                strokeWidth={i % 2 === 0 ? 3.2 : 2} strokeLinecap="round" />
            </g>
          );
        })}
      </g>

      {/* Burner cans, straddling the hub, with the fuel line coming in. */}
      <g opacity={dim("burner")} style={{ transition: "opacity 460ms" }}>
        {[-1, 1].map((sgn) => (
          <rect
            key={sgn}
            x={482} y={AXIS + (sgn === -1 ? -73 : 55)} width={104} height={18} rx={9}
            fill="var(--color-caution-soft)" stroke="var(--color-caution)" strokeWidth={2}
          />
        ))}
        <line x1={470} y1={18} x2={492} y2={AXIS - 76}
          stroke="var(--color-caution)" strokeWidth={2.6} strokeLinecap="round" />
        {lit("burner") && (
          <text x={462} y={14} textAnchor="end" fontSize={12.5} fontWeight={800} fill="var(--color-caution)">
            FUEL
          </text>
        )}
      </g>

      {/* Turbine wheels. */}
      <g opacity={dim("turbine")} style={{ transition: "opacity 460ms" }}>
        {[630, 664, 698].map((x) => {
          const r0 = hubAt(x) + 3;
          const r1 = casingAt(x) - 5;
          return (
            <g key={x}>
              <line x1={x} y1={AXIS - r1} x2={x} y2={AXIS - r0}
                stroke="var(--color-nogo)" strokeWidth={3.6} strokeLinecap="round" />
              <line x1={x} y1={AXIS + r0} x2={x} y2={AXIS + r1}
                stroke="var(--color-nogo)" strokeWidth={3.6} strokeLinecap="round" />
            </g>
          );
        })}
      </g>

      {/* Hub, drawn over the blades so they read as attached to it. */}
      <path
        d={`${poly(HUB, -1)} ${[...HUB].reverse().map(([x, r]) => `L ${x} ${AXIS + r}`).join(" ")} Z`}
        fill="var(--color-surface-3)" stroke="var(--color-navy-faint)" strokeWidth={1.6}
      />

      {/* Casing outline last, so nothing spills over it. */}
      <path d={poly(CASING, -1)} fill="none" stroke="var(--color-navy)" strokeWidth={3.4} strokeLinejoin="round" />
      <path d={poly(CASING, 1)} fill="none" stroke="var(--color-navy)" strokeWidth={3.4} strokeLinejoin="round" />

      {/* THE SHAFT — withheld until the turbine has been paid for. */}
      {shaft && (
        <g>
          <line x1={262} y1={AXIS} x2={720} y2={AXIS}
            stroke="var(--color-gold)" strokeWidth={9} strokeLinecap="round" filter="url(#wb-glow)" />
          <line x1={262} y1={AXIS} x2={720} y2={AXIS}
            stroke="var(--color-gold)" strokeWidth={4} strokeLinecap="round" />
          <path d={`M 720 ${AXIS} L 694 ${AXIS - 9} L 694 ${AXIS + 9} Z`} fill="var(--color-gold)" />
          <path d={`M 262 ${AXIS} L 288 ${AXIS - 9} L 288 ${AXIS + 9} Z`} fill="var(--color-gold)" />
          <text x={491} y={AXIS - 18} textAnchor="middle" fontSize={14} fontWeight={800}
            letterSpacing="0.08em" fill="var(--color-gold)">
            ONE SHAFT
          </text>
        </g>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export function EngineFlowExplainer({
  scene,
  onResolveGate,
}: {
  scene: number;
  onResolveGate: (outcome: GateOutcome) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [scrub, setScrub] = useState(40);

  const s = SCENES[Math.min(scene, SCENES.length - 1)];
  const parcelX = s.play ? scrub : s.parcel;
  const at = s.play ? stationAtX(scrub) : s.at;
  const state = STATE[at];

  /* Camera: a translate+scale about the focused station. The readout lives
   * outside this group, so zooming never carries the numbers off screen. */
  const focusX = s.zoom
    ? (() => {
        const st = STATIONS.find((x) => x.id === s.focus);
        return st ? (st.x0 + st.x1) / 2 : VB.w / 2;
      })()
    : VB.w / 2;
  /* The camera crops horizontally and never vertically.
   *
   * Scaling the whole group up to magnify a station also crops the top and
   * bottom of the frame, and on a phone that cropped away the burner cans and
   * the blade tips — the only things the scene existed to show. So instead the
   * SVG uses preserveAspectRatio="slice" with a frame whose aspect ratio IS the
   * window width, and the camera is a pure horizontal pan. Vertical extent is
   * always fully visible, and translateX still transitions smoothly. */
  const winW = (k: number) => VB.w / k;
  const panFor = (k: number) => {
    const half = winW(k) / 2;
    const cx = Math.min(Math.max(focusX, half), VB.w - half);
    return (VB.w / 2 - cx).toFixed(1);
  };
  const kDesk = s.zoom ?? 1;
  const kMob = s.mzoom ?? (s.zoom ? s.zoom * 2 : 1.05);

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
          Scene {Math.min(scene, SCENES.length - 1) + 1} / {SCENES.length}
        </StageChip>
        {s.play && <StageChip corner="tr">Interactive</StageChip>}

        <div className="flex h-full flex-col pt-10 sm:pt-0">
        <div className="wb-frame relative w-full flex-none">
        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={`Air parcel at the ${at} station`}
        >

          <g className="wb-cam" style={{ transition: "transform 720ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
            <EngineBody focus={s.focus} shaft={s.shaft} />

            {/* Thrust sits above the engine, where nothing else is drawn. */}
            {s.thrust && (
              <g>
                <line x1={890} y1={flowY(870)} x2={946} y2={flowY(870)}
                  stroke="var(--color-go)" strokeWidth={5} strokeLinecap="round"
                  markerEnd="url(#wb-arrow-safe)" />
                <text x={800} y={AXIS - 84} textAnchor="middle" fontSize={12.5} fontWeight={800}
                  letterSpacing="0.06em" fill="var(--color-go)">
                  GAS AFT
                </text>
                <line x1={214} y1={LABEL_Y - 5} x2={104} y2={LABEL_Y - 5}
                  stroke="var(--color-brand)" strokeWidth={6} strokeLinecap="round"
                  markerEnd="url(#wb-arrow-primary)" />
                <text x={224} y={LABEL_Y} fontSize={14} fontWeight={800} letterSpacing="0.06em" fill="var(--color-brand)">
                  THRUST FORWARD
                </text>
              </g>
            )}

            {/* The parcel rides the gas path: size tracks pressure, colour
                tracks temperature, and the trail behind it is velocity. */}
            <g
              transform={`translate(${parcelX} ${flowY(parcelX)})`}
              style={{ transition: s.play ? "none" : "transform 760ms cubic-bezier(0.22, 1, 0.36, 1)" }}
            >
              <line
                x1={-16 - state.v * 46} y1={0} x2={-15} y2={0}
                stroke="var(--color-go)" strokeWidth={3.4} strokeLinecap="round" opacity={0.8}
                style={{ transition: "all 620ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
              <circle
                r={8 + state.p * 8}
                fill={`color-mix(in srgb, var(--color-nogo) ${Math.round(state.t * 100)}%, var(--color-brand))`}
                stroke="var(--color-surface)"
                strokeWidth={2.5}
                style={{ transition: "all 620ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
            </g>

            {s.look && <PulseRing cx={s.look} cy={AXIS} r={58} role="primary" />}
          </g>

        </svg>
        {/* One markup tree, two cameras: the phone crops to the station. */}
        <style>{`
          .wb-frame { aspect-ratio: ${winW(kMob).toFixed(1)} / ${VB.h}; }
          .wb-cam { transform: translateX(${panFor(kMob)}px); }
          @media (min-width: 1100px) {
            .wb-frame { aspect-ratio: ${winW(kDesk).toFixed(1)} / ${VB.h}; }
            .wb-cam { transform: translateX(${panFor(kDesk)}px); }
          }
        `}</style>
        </div>
        <Readout state={state} station={at} />
        </div>
      </Stage>

      {s.play && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <div className="w-28 shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-navy-faint">Station</p>
              <p className="text-[15px] font-extrabold capitalize text-navy">
                {at === "ambient" ? "Ambient" : at}
              </p>
            </div>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Parcel position through the engine</span>
              <input
                type="range"
                min={40}
                max={880}
                step={4}
                value={scrub}
                onChange={(e) => setScrub(Number(e.target.value))}
                className="w-full accent-[var(--color-brand)]"
              />
              <span className="mt-0.5 block text-center text-[11px] font-bold uppercase tracking-wider text-navy-faint">
                Drag the parcel through the engine
              </span>
            </label>
          </div>
        </div>
      )}
    </>
  );
}

EngineFlowExplainer.sceneCount = SCENES.length;
EngineFlowExplainer.blocksAt = (scene: number) => Boolean(SCENES[scene]?.predict);
EngineFlowExplainer.nextLabel = (scene: number) => {
  const s = SCENES[scene];
  if (!s) return "Next";
  if (s.predict) return "Reveal";
  if (s.play) return "Finish";
  if (s.tone === "reveal") return "Then what?";
  return "Follow it";
};
EngineFlowExplainer.anchor = [
  "Inlet P↑ V↓ · Compressor P↑ · Burner T↑ · Turbine P↓ T↓ · Exhaust V↑",
  "The turbine and compressor share ONE shaft — the turbine drives the compressor.",
  "About 75% of turbine energy goes back into the engine. The rest leaves as thrust.",
];
