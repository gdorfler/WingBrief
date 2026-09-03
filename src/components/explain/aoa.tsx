"use client";

/**
 * Angle of Attack — gold-standard explainer.
 *
 * VISUAL THESIS
 * Two aircraft holding the identical nose attitude, with wildly different
 * angles of attack. If the student remembers one image from this, it is that
 * one — because it is the image that makes the rule unforgettable: you cannot
 * read AOA off the nose.
 *
 * The old version drew the horizon, the flight path, the relative wind, the
 * chord line, two corner readouts and the aircraft simultaneously in frame one,
 * then dimmed things to indicate emphasis. Everything arrived before any of it
 * meant anything, and the two readouts both said 2°, which quietly taught the
 * opposite of the lesson on first impression.
 *
 * Here the geometry is built one line at a time, each line introduced only when
 * the previous one has a reason to need it, and the numbers live ON the angle
 * arcs rather than in a corner.
 *
 * TWO HONESTY NOTES
 *
 * 1. Angles are drawn at EXAG times their true value. Real flight angles are
 *    small — a truthful 10° over a 270-unit reach is a 47-unit rise, which
 *    renders as a flat ribbon in an empty frame and teaches nothing. Every
 *    aerodynamics text exaggerates for this reason. The exaggeration is LINEAR,
 *    so AOA = pitch − flight path stays exactly true in the drawing, and every
 *    printed number is the real one. The stage says so on screen.
 *
 * 2. The phone gets a different composition, not a smaller one. A landscape
 *    geometry shrunk into a portrait stage is a ribbon floating in white space,
 *    so on a phone the frame crops in on the vertex, the rays run off the edges,
 *    and the values become large stacked blocks that are part of the drawing.
 *
 * Accuracy: pitch attitude is measured from the chord line to the HORIZON;
 * angle of attack from the chord line to the RELATIVE WIND; relative wind is
 * directly opposite the flight path. AOA = pitch − flight path.
 */

import { useState } from "react";
import { AngleArc, Datum, Layer, PulseRing, ROLE_STROKE, Tag, Vector } from "./grammar";
import type { GateOutcome } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";

/* ------------------------------------------------------------------ */
/* Frames                                                              */
/* ------------------------------------------------------------------ */

/** Drawn degrees per real degree. Linear, so the subtraction stays exact. */
const EXAG = 2.2;

interface Frame {
  w: number;
  h: number;
  cx: number;
  cy: number;
  reach: number;
  /** Half-length of the horizon datum. */
  hz: number;
  pitchR: number;
  pitchGap: number;
  aoaR: number;
  aoaGap: number;
  /** Plates on the arcs (wide), stacked blocks (phone), or nothing at all —
   *  the comparison panels caption themselves, so numbers on the arcs there are
   *  the same fact printed twice. */
  values: "plates" | "blocks" | "none";
  /** Where along each ray its name is written, as a fraction of reach. */
  tagR: number;
  tagAlign: "start" | "end";
  /** Which end of the horizon carries its name. The relative wind always runs
   *  left of the vertex, so a cramped frame must put the word on the right. */
  hzSide: -1 | 1;
  /** Which side of the horizon line its name sits on. On a cramped frame the
   *  pitch arc sweeps across the space above the line, so the word goes below. */
  hzDy: number;
  /** Names on the rays. Off for comparison panels, where the words are clutter
   *  and the crop needs the room more than the reader needs the reminder. */
  tags: boolean;
  aircraft: number;
}

const LAND: Frame = {
  w: 820, h: 320, cx: 400, cy: 158, reach: 268, hz: 396,
  /* Both arcs must clear the fuselage — an arc drawn inside a navy silhouette
   * is invisible, which is what buried the AOA arc in the first pass. */
  pitchR: 200, pitchGap: 52, aoaR: 132, aoaGap: 26,
  values: "plates", tagR: 1, tagAlign: "start", hzSide: -1, hzDy: -13, tags: true, aircraft: 4,
};

const PORT: Frame = {
  w: 360, h: 560, cx: 180, cy: 150, reach: 180, hz: 176,
  pitchR: 150, pitchGap: 0, aoaR: 96, aoaGap: 0,
  values: "blocks", tagR: 0.6, tagAlign: "end", hzSide: 1, hzDy: 19, tags: true, aircraft: 3,
};

/** Compare mode halves the width available, so it gets its own crop. */
const CMP: Frame = {
  w: 300, h: 388, cx: 150, cy: 118, reach: 148, hz: 146,
  pitchR: 104, pitchGap: 0, aoaR: 58, aoaGap: 0,
  values: "none", tagR: 0.7, tagAlign: "end", hzSide: -1, hzDy: -13, tags: false, aircraft: 1.5,
};

/** Screen degrees: nose-up is negative y, and exaggerated for legibility. */
const scr = (deg: number) => -deg * EXAG;
const pt = (F: Frame, deg: number, r: number) => ({
  x: F.cx + r * Math.cos((scr(deg) * Math.PI) / 180),
  y: F.cy + r * Math.sin((scr(deg) * Math.PI) / 180),
});

/** The T-6B in side view, drawn big enough to be the subject of the scene. */
function Aircraft({ F, pitch }: { F: Frame; pitch: number }) {
  return (
    <g
      transform={`translate(${F.cx} ${F.cy}) rotate(${scr(pitch)}) scale(${F.aircraft})`}
      style={{ transition: "transform 620ms cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <path
        d="M-30 0 C-30 -3.4 -26 -5 -18 -5.4 L4 -6 C12 -6 22 -3.6 30 0 C22 3.6 12 6 4 6 L-18 5.4 C-26 5 -30 3.4 -30 0 Z"
        fill="var(--color-navy)"
      />
      <path d="M-4 -1 L-13 -16 L-8 -16 L4 -1 Z" fill="var(--color-navy)" />
      <path d="M-22 -1 L-30 -13 L-26 -13 L-18 -1 Z" fill="var(--color-navy)" opacity={0.78} />
      <path d="M-2 1 L-12 12 L-6 12 L4 1 Z" fill="var(--color-navy)" opacity={0.6} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Scene {
  idea: string;
  sub?: string;
  pitch: number;
  path: number;
  /** Progressive reveal — a layer appears only once it is needed. */
  show: {
    horizon?: boolean;
    path?: boolean;
    wind?: boolean;
    chord?: boolean;
    pitchArc?: boolean;
    aoaArc?: boolean;
  };
  lead?: "pitch" | "aoa" | "wind" | "none";
  look?: boolean;
  predict?: { question: string; options: string[]; answer: number; because: string };
  compare?: boolean;
  play?: boolean;
  tone?: "reveal";
}

const SCENES: Scene[] = [
  {
    idea: "An aircraft, and one line to measure it against.",
    sub: "The horizon never moves. Everything else in this explainer does.",
    pitch: 0,
    path: 0,
    show: { horizon: true },
    lead: "none",
  },
  {
    idea: "Raise the nose. The angle to the horizon is PITCH ATTITUDE.",
    sub: "This is what the attitude indicator shows you.",
    pitch: 10,
    path: 0,
    show: { horizon: true, chord: true, pitchArc: true },
    lead: "pitch",
  },
  {
    idea: "But where the nose points is not where the aircraft is going.",
    sub: "The flight path is the direction it actually travels.",
    pitch: 10,
    path: 4,
    show: { horizon: true, chord: true, pitchArc: true, path: true },
    lead: "none",
  },
  {
    idea: "Relative wind runs down that same line, backwards.",
    sub: "One straight line, two arrowheads. Relative wind is always exactly opposite the flight path.",
    pitch: 10,
    path: 4,
    show: { horizon: true, chord: true, path: true, wind: true },
    lead: "wind",
  },
  {
    idea: "Angle of attack is the angle between the chord line and the relative wind.",
    sub: "That is the whole definition. Two lines, one angle.",
    pitch: 10,
    path: 4,
    show: { horizon: true, chord: true, path: true, wind: true, aoaArc: true },
    lead: "aoa",
    look: true,
  },
  {
    idea: "Now hold the nose exactly where it is — and descend.",
    pitch: 10,
    path: 4,
    show: { horizon: true, chord: true, path: true, wind: true, aoaArc: true, pitchArc: true },
    lead: "none",
    predict: {
      question:
        "Pitch attitude stays locked at 10°. The flight path drops below the horizon. What happens to AOA?",
      options: ["It decreases", "It stays the same", "It increases"],
      answer: 2,
      because:
        "The chord line has not moved — pitch is still 10°. But the relative wind swung upward to meet the new flight path, so the angle between them opened up.",
    },
  },
  {
    idea: "Same nose attitude. Sixteen degrees of AOA.",
    sub: "Nothing about the nose changed. The air arriving changed.",
    pitch: 10,
    path: -6,
    show: { horizon: true, chord: true, path: true, wind: true, aoaArc: true, pitchArc: true },
    lead: "aoa",
    tone: "reveal",
  },
  {
    idea: "Both of these aircraft are pitched 10° nose-up.",
    sub: "One is cruising. One is close to the stall. The attitude indicator reads the same in both.",
    pitch: 10,
    path: 4,
    show: { horizon: true, chord: true, path: true, wind: true, aoaArc: true },
    compare: true,
    lead: "aoa",
  },
  {
    idea: "Your turn. Hold the nose still and move the flight path.",
    sub: "Pitch is locked at 10°. Drag the slider and watch AOA do whatever it likes.",
    pitch: 10,
    path: 4,
    show: { horizon: true, chord: true, path: true, wind: true, aoaArc: true, pitchArc: true },
    play: true,
    lead: "aoa",
  },
];

/* ------------------------------------------------------------------ */
/* The geometry drawing                                                */
/* ------------------------------------------------------------------ */

function Geometry({
  F,
  pitch,
  path,
  show,
  lead,
  look,
}: {
  F: Frame;
  pitch: number;
  path: number;
  show: Scene["show"];
  lead?: Scene["lead"];
  look?: boolean;
}) {
  const aoa = pitch - path;

  const chordTip = pt(F, pitch, F.reach);
  const chordTail = pt(F, pitch, -F.reach * 0.46);
  const chordTag = pt(F, pitch, F.reach * F.tagR);

  /* Flight path and relative wind are the SAME line through the vertex, drawn
   * with opposed arrowheads. That is the whole of "relative wind is exactly
   * opposite the flight path" as a picture, so the caption need not carry it. */
  const pathTip = pt(F, path, F.reach * 0.9);
  const pathTag = pt(F, path, F.reach * 0.9 * F.tagR);
  const windTip = pt(F, path, -F.reach * 0.9);

  const dx = F.tagAlign === "end" ? -8 : 9;
  /* One lead, everything else supporting. Pushing the chord line to "context"
   * while teaching an angle measured FROM the chord line defeats the scene. */
  const at = (k: Scene["lead"]): "lead" | "support" =>
    lead === k || lead === undefined || lead === "none" ? "lead" : "support";

  return (
    <>
      <Layer at="support" show={Boolean(show.horizon)}>
        <Datum x1={F.cx - F.hz} y1={F.cy} x2={F.cx + F.hz} y2={F.cy} role="reference" />
        {F.tags && (
          <Tag
            x={F.cx + F.hzSide * (F.hz - 6)} y={F.cy} dy={F.hzDy}
            text="HORIZON" role="reference" align={F.hzSide === 1 ? "end" : "start"}
          />
        )}
      </Layer>

      <Layer at={at("wind")} show={Boolean(show.wind)}>
        <Vector
          x1={F.cx} y1={F.cy} x2={windTip.x} y2={windTip.y}
          role="danger" width={3.4} glow={lead === "wind"}
          label={F.tags ? "RELATIVE WIND" : undefined} labelSide="above"
        />
      </Layer>

      <Layer at={at("none")} show={Boolean(show.path)}>
        <Vector x1={F.cx} y1={F.cy} x2={pathTip.x} y2={pathTip.y} role="safe" width={2.8} />
        {F.tags && (
          <Tag
            x={pathTag.x} y={pathTag.y} dx={dx} dy={26}
            text="FLIGHT PATH" role="safe" align={F.tagAlign}
          />
        )}
      </Layer>

      <Layer at={at("pitch")} show={Boolean(show.chord)}>
        <Datum
          x1={chordTail.x} y1={chordTail.y} x2={chordTip.x} y2={chordTip.y}
          role="subject" width={2.4}
        />
        {F.tags && (
          <Tag
            x={chordTag.x} y={chordTag.y} dx={dx} dy={-14}
            text="CHORD LINE" role="subject" align={F.tagAlign}
          />
        )}
      </Layer>

      <Aircraft F={F} pitch={pitch} />

      {/* Pitch: chord line against the horizon. Outer arc, outer plate. */}
      <Layer at={at("pitch")} show={Boolean(show.pitchArc)}>
        <AngleArc
          cx={F.cx} cy={F.cy} from={0} to={scr(pitch)} r={F.pitchR}
          role="subject" label={F.values === "plates" ? `${Math.round(pitch)}° pitch` : undefined}
          glow={lead === "pitch"} labelGap={F.pitchGap}
        />
      </Layer>

      {/* AOA: chord line against the relative wind. Inner arc, inner plate. */}
      <Layer at={at("aoa")} show={Boolean(show.aoaArc)}>
        <AngleArc
          cx={F.cx} cy={F.cy} from={scr(path)} to={scr(pitch)} r={F.aoaR}
          role="primary" label={F.values === "plates" ? `${Math.round(aoa)}° AOA` : undefined}
          glow={lead === "aoa"} labelGap={F.aoaGap}
        />
      </Layer>

      {look && <PulseRing cx={F.cx} cy={F.cy} r={F.aoaR + 20} role="primary" />}
    </>
  );
}

/**
 * The phone's value display.
 *
 * On a wide frame the numbers live on their arcs. A phone frame has no room for
 * two plates around one vertex without them landing on each other, so the
 * values become large stacked blocks below the geometry — still colour-bound to
 * their arcs, and large enough to be the second thing the eye lands on.
 */
function ValueBlocks({
  F,
  pitch,
  aoa,
  show,
  lead,
}: {
  F: Frame;
  pitch: number;
  aoa: number;
  show: Scene["show"];
  lead?: Scene["lead"];
}) {
  const rows = [
    show.pitchArc && {
      key: "PITCH ATTITUDE",
      ref: "measured to the horizon",
      v: pitch,
      role: "subject" as const,
      on: lead === "pitch",
    },
    show.aoaArc && {
      key: "ANGLE OF ATTACK",
      ref: "measured to the relative wind",
      v: aoa,
      role: "primary" as const,
      on: lead === "aoa",
    },
  ].filter(Boolean) as {
    key: string;
    ref: string;
    v: number;
    role: "subject" | "primary";
    on: boolean;
  }[];

  if (!rows.length) return null;
  const top = F.h - rows.length * 102 - 14;

  return (
    <g>
      {rows.map((r, i) => (
        <g key={r.key} transform={`translate(16 ${top + i * 102})`}>
          <rect
            x={0} y={0} width={F.w - 32} height={88} rx={14}
            fill="var(--color-surface-2)"
            stroke={r.on ? ROLE_STROKE[r.role] : "var(--color-line)"}
            strokeWidth={r.on ? 2.6 : 1.4}
          />
          <rect x={0} y={0} width={7} height={88} rx={3.5} fill={ROLE_STROKE[r.role]} />
          <text x={22} y={32} fontSize={13.5} fontWeight={800} letterSpacing="0.05em" fill="var(--color-navy-faint)">
            {r.key}
          </text>
          <text x={22} y={54} fontSize={12.5} fontWeight={600} fill="var(--color-navy-soft)">
            {r.ref}
          </text>
          <text
            x={F.w - 50} y={60} textAnchor="end" fontSize={44} fontWeight={800}
            fill={ROLE_STROKE[r.role]} style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {Math.round(r.v)}°
          </text>
        </g>
      ))}
    </g>
  );
}

function CompareCaption({
  F,
  label,
  aoa,
  tone,
}: {
  F: Frame;
  label: string;
  aoa: number;
  tone: "safe" | "danger";
}) {
  return (
    <g>
      <text x={F.w / 2} y={252} textAnchor="middle" fontSize={14} fontWeight={800}
        letterSpacing="0.08em" fill="var(--color-navy-faint)">
        {label.toUpperCase()}
      </text>
      <text x={F.w / 2} y={296} textAnchor="middle" fontSize={30} fontWeight={800}
        fill="var(--color-navy)" style={{ fontVariantNumeric: "tabular-nums" }}>
        PITCH 10°
      </text>
      <text x={F.w / 2} y={360} textAnchor="middle" fontSize={38} fontWeight={800}
        fill={tone === "danger" ? "var(--color-nogo)" : "var(--color-go)"}
        style={{ fontVariantNumeric: "tabular-nums" }}>
        AOA {aoa}°
      </text>
    </g>
  );
}

function Drawing({
  F: base,
  pitch,
  path,
  scene,
  className,
  note,
}: {
  F: Frame;
  pitch: number;
  path: number;
  scene: Scene;
  className: string;
  note?: { label: string; aoa: number; tone: "safe" | "danger" };
}) {
  const aoa = pitch - path;
  const blocks = base.values === "blocks";
  const rows = blocks
    ? Number(Boolean(scene.show.pitchArc)) + Number(Boolean(scene.show.aoaArc))
    : 0;
  /* Height follows content: an empty value area is just letterboxing. */
  const F: Frame = blocks ? { ...base, h: 260 + rows * 102 } : base;
  return (
    <svg
      viewBox={`0 0 ${F.w} ${F.h}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Pitch ${pitch} degrees, flight path ${path} degrees, angle of attack ${Math.round(aoa)} degrees`}
    >
      <Geometry F={F} pitch={pitch} path={path} show={scene.show} lead={scene.lead} look={scene.look} />
      {blocks && <ValueBlocks F={F} pitch={pitch} aoa={aoa} show={scene.show} lead={scene.lead} />}
      {note && <CompareCaption F={F} label={note.label} aoa={note.aoa} tone={note.tone} />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                              */
/* ------------------------------------------------------------------ */

export function AoaExplainer({
  scene,
  onResolveGate,
}: {
  scene: number;
  onResolveGate: (outcome: GateOutcome) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [drag, setDrag] = useState(4);

  const s = SCENES[Math.min(scene, SCENES.length - 1)];
  const livePath = s.play ? drag : s.path;
  const liveAoa = s.pitch - livePath;

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
        <StageChip corner="tr">{s.play ? "Interactive" : "Angles exaggerated"}</StageChip>

        {s.compare ? (
          /* The thesis image: identical nose attitude, two different worlds. */
          <div className="grid h-full grid-rows-2 xl:grid-cols-2 xl:grid-rows-1">
            {[
              { path: 4, label: "Climbing gently", aoa: 6, tone: "safe" as const },
              { path: -6, label: "Descending", aoa: 16, tone: "danger" as const },
            ].map((side) => (
              <div
                key={side.label}
                className="relative min-h-0 border-line [&:not(:last-child)]:border-b xl:[&:not(:last-child)]:border-r xl:[&:not(:last-child)]:border-b-0"
              >
                <Drawing
                  F={CMP}
                  pitch={10}
                  path={side.path}
                  scene={s}
                  className="h-full w-full"
                  note={{ label: side.label, aoa: side.aoa, tone: side.tone }}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            <Drawing F={LAND} pitch={s.pitch} path={livePath} scene={s} className="hidden h-full w-full sm:block" />
            <Drawing F={PORT} pitch={s.pitch} path={livePath} scene={s} className="h-full w-full sm:hidden" />
          </>
        )}
      </Stage>

      {s.play && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            <div className="shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-navy-faint">Pitch</p>
              <p className="tabular text-[15px] font-extrabold text-navy">10° locked</p>
            </div>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Flight path angle</span>
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={drag}
                onChange={(e) => setDrag(Number(e.target.value))}
                className="w-full accent-[var(--color-go)]"
              />
              <span className="mt-0.5 block text-center text-[11px] font-bold uppercase tracking-wider text-navy-faint">
                Flight path {drag > 0 ? "+" : ""}
                {drag}°
              </span>
            </label>
            <div className="shrink-0 text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-navy-faint">AOA</p>
              <p
                className={`tabular text-[19px] font-extrabold leading-none ${
                  liveAoa >= 15 ? "text-nogo" : liveAoa >= 10 ? "text-caution" : "text-go"
                }`}
              >
                {Math.round(liveAoa)}°
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

AoaExplainer.sceneCount = SCENES.length;
AoaExplainer.blocksAt = (scene: number) => Boolean(SCENES[scene]?.predict);
AoaExplainer.nextLabel = (scene: number) => {
  const s = SCENES[scene];
  if (!s) return "Next";
  if (s.predict) return "Reveal";
  if (s.play) return "Finish";
  if (s.compare) return "Try it";
  return "Next";
};
AoaExplainer.anchor = [
  "AOA is the angle between the CHORD LINE and the RELATIVE WIND.",
  "Pitch attitude is measured against the HORIZON — a different reference entirely.",
  "Never infer AOA from the nose. Same pitch can be 6° or 16°.",
];
