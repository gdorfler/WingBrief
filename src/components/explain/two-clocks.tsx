"use client";

/**
 * Two Clocks — gold-standard FR&R explainer.
 *
 * VISUAL THESIS
 * Two bars start at the same instant and end at different times, and the SHORT
 * one is the answer. Everything students get wrong about this rule comes from
 * treating it as one rule with an exception, when it is two independent clocks
 * and a minimum.
 *
 * The trap the gate is built around: delaying your departure feels like it buys
 * validity, and it does — right up to the point where the three-hour ceiling
 * takes over and buys you nothing at all. The closing scene draws that as a
 * crossover chart, which is the shape worth carrying into the exam: a diagonal
 * that flattens.
 *
 * Source: a Naval flight weather brief (DD-175-1) is void 3 hours after brief
 * time, or 30 minutes after ETD, whichever is EARLIER. The two clocks therefore
 * tie when ETD is brief + 2:30, and the ceiling governs after that.
 */

import { useState } from "react";
import type { GateOutcome } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";

/* ------------------------------------------------------------------ */
/* The rule                                                            */
/* ------------------------------------------------------------------ */

const VB = { w: 500, h: 320 };
const BRIEF_MIN = 9 * 60; // brief taken at 0900
const CEILING = 180; // brief + 3:00
const AFTER_ETD = 30; // ETD + 0:30
const SPAN = 240; // four hours of axis

/** Minutes after brief time to a Zulu-style clock reading. */
const hhmm = (t: number) => {
  const m = BRIEF_MIN + t;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}`;
};

const etdClock = (etd: number) => etd + AFTER_ETD;
const voidAt = (etd: number) => Math.min(CEILING, etdClock(etd));
const ceilingWins = (etd: number) => CEILING <= etdClock(etd);
/** The two clocks tie here — the only number in the rule you have to derive. */
const TIE_ETD = CEILING - AFTER_ETD; // 150 minutes, i.e. 1130

/* Timeline geometry */
const AX = { x0: 46, x1: 456, y: 254 };
const px = (t: number) => AX.x0 + (t / SPAN) * (AX.x1 - AX.x0);

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

interface Scene {
  idea: string;
  sub?: string;
  etd: number;
  show: { ceiling?: boolean; etdBar?: boolean; verdict?: boolean };
  chart?: boolean;
  play?: boolean;
  tone?: "reveal";
  predict?: { question: string; options: string[]; answer: number; because: string };
}

const SCENES: Scene[] = [
  {
    idea: "You take a weather brief at 0900. Two clocks start.",
    sub: "Neither of them is the one you think it is.",
    etd: 60,
    show: {},
  },
  {
    idea: "The first clock is fixed. Three hours from the brief, and it never moves.",
    sub: "Whatever else happens today, this brief cannot survive past 1200.",
    etd: 60,
    show: { ceiling: true },
  },
  {
    idea: "The second clock hangs off your departure. Thirty minutes after ETD.",
    sub: "Planning to go at 1000 means this clock runs out at 1030.",
    etd: 60,
    show: { ceiling: true, etdBar: true },
  },
  {
    idea: "Whichever bar ends first is the one that kills the brief.",
    sub: "1030 beats 1200, so the ETD clock wins and the three-hour clock never gets used.",
    etd: 60,
    show: { ceiling: true, etdBar: true, verdict: true },
  },
  {
    idea: "Now the crew slips. New ETD is 1200.",
    etd: 180,
    show: { ceiling: true, etdBar: true },
    predict: {
      question: "Brief at 0900, new ETD 1200. When does the brief go void?",
      options: ["1230 — ETD plus thirty", "1200 — brief plus three hours", "Not until you take off"],
      answer: 1,
      because:
        "ETD + 0:30 gives 1230, but brief + 3:00 gives 1200, and the rule takes the EARLIER of the two. Slipping the departure bought nothing — past 1130 the three-hour ceiling governs every time.",
    },
  },
  {
    idea: "1200. The ceiling took over, and delaying bought you nothing.",
    sub: "Push the ETD as late as you like — this brief still dies at 1200.",
    etd: 180,
    show: { ceiling: true, etdBar: true, verdict: true },
    tone: "reveal",
  },
  {
    idea: "A diagonal that flattens. That is the whole rule in one shape.",
    sub: "Before an ETD of 1130 the departure clock governs. After it, the three-hour clock does — and the tie is at 1130 exactly.",
    etd: 150,
    show: {},
    chart: true,
  },
  {
    idea: "Move the departure and watch which clock wins.",
    sub: "Find the ETD where the two clocks tie — it is the only number in this rule you have to work out.",
    etd: 60,
    show: { ceiling: true, etdBar: true, verdict: true },
    play: true,
  },
];

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

function Bar({
  y,
  end,
  role,
  label,
  dim,
}: {
  y: number;
  end: number;
  role: "ceiling" | "etd";
  label: string;
  dim: boolean;
}) {
  const color = role === "ceiling" ? "var(--color-navy)" : "var(--color-brand)";
  return (
    <g opacity={dim ? 0.34 : 1} style={{ transition: "opacity 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
      <text x={AX.x0} y={y - 9} fontSize={12.5} fontWeight={800} letterSpacing="0.06em" fill={color}>
        {label}
      </text>
      <rect
        x={AX.x0} y={y} width={Math.max(4, px(end) - AX.x0)} height={26} rx={13}
        fill={color} opacity={0.18}
      />
      <rect
        x={AX.x0} y={y} width={Math.max(4, px(end) - AX.x0)} height={26} rx={13}
        fill="none" stroke={color} strokeWidth={2.2}
        style={{ transition: "width 560ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      <text
        x={px(end) - 10} y={y + 18} textAnchor="end" fontSize={13.5} fontWeight={800} fill={color}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {hhmm(end)}
      </text>
    </g>
  );
}

function Timeline({ etd, show }: { etd: number; show: Scene["show"] }) {
  const v = voidAt(etd);
  const ceilingGoverns = ceilingWins(etd);

  return (
    <>
      {/* Axis */}
      <line x1={AX.x0} y1={AX.y} x2={AX.x1} y2={AX.y} stroke="var(--color-line-strong)" strokeWidth={2} />
      {[0, 60, 120, 180, 240].map((t) => (
        <g key={t}>
          <line x1={px(t)} y1={AX.y} x2={px(t)} y2={AX.y + 7} stroke="var(--color-line-strong)" strokeWidth={2} />
          <text
            x={px(t)} y={AX.y + 25} textAnchor="middle" fontSize={12} fontWeight={700}
            fill="var(--color-navy-faint)" style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {hhmm(t)}
          </text>
        </g>
      ))}

      <text x={AX.x0} y={54} fontSize={12} fontWeight={800} letterSpacing="0.07em" fill="var(--color-navy-faint)">
        BRIEF 0900
      </text>
      <line x1={AX.x0} y1={62} x2={AX.x0} y2={AX.y} stroke="var(--color-line-strong)" strokeWidth={1.6} strokeDasharray="5 5" />

      {show.ceiling && (
        <Bar y={86} end={CEILING} role="ceiling" label="BRIEF + 3:00" dim={Boolean(show.verdict) && !ceilingGoverns} />
      )}

      {show.etdBar && (
        <>
          <Bar
            y={152} end={etdClock(etd)} role="etd" label="ETD + 0:30"
            dim={Boolean(show.verdict) && ceilingGoverns}
          />
          {/* The departure itself, marked on the bar it drives. */}
          <g opacity={Boolean(show.verdict) && ceilingGoverns ? 0.34 : 1}>
            <line x1={px(etd)} y1={146} x2={px(etd)} y2={184} stroke="var(--color-brand-dark)" strokeWidth={2.4} />
            <text
              x={px(etd)} y={200} textAnchor="middle" fontSize={11.5} fontWeight={800}
              fill="var(--color-brand-dark)" stroke="var(--color-surface)" strokeWidth={4}
              paintOrder="stroke" style={{ fontVariantNumeric: "tabular-nums" }}
            >
              ETD {hhmm(etd)}
            </text>
          </g>
        </>
      )}

      {/* The verdict: one vertical line through both bars. */}
      {show.verdict && (
        <g style={{ transition: "transform 460ms" }}>
          <line
            x1={px(v)} y1={68} x2={px(v)} y2={AX.y}
            stroke="var(--color-nogo)" strokeWidth={3} strokeLinecap="round"
          />
          <rect x={px(v) - 52} y={40} width={104} height={26} rx={13} fill="var(--color-nogo)" />
          <text
            x={px(v)} y={58} textAnchor="middle" fontSize={13.5} fontWeight={800} fill="#fff"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            VOID {hhmm(v)}
          </text>
        </g>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Vertical timeline — the portrait composition                        */
/* ------------------------------------------------------------------ */

/**
 * Time running DOWN the page.
 *
 * The horizontal timeline squeezed into a 390px phone rendered its axis labels
 * at nine pixels. A timeline is just as truthful vertically, and vertically it
 * matches the shape of the screen — so the phone gets the same two bars and the
 * same verdict line, at a size that can actually be read.
 */
const VBV = { w: 360, h: 520 };
const AY = { y0: 62, y1: 438 };
const py = (t: number) => AY.y0 + (t / SPAN) * (AY.y1 - AY.y0);
const COL = { a: { x: 84, w: 52 }, b: { x: 168, w: 52 } };

function VBar({
  col, end, role, top, bottom, dim,
}: {
  col: { x: number; w: number };
  end: number;
  role: "ceiling" | "etd";
  top: string;
  bottom: string;
  dim: boolean;
}) {
  const color = role === "ceiling" ? "var(--color-navy)" : "var(--color-brand)";
  const mid = col.x + col.w / 2;
  return (
    <g opacity={dim ? 0.34 : 1} style={{ transition: "opacity 460ms cubic-bezier(0.22, 1, 0.36, 1)" }}>
      <text x={mid} y={26} textAnchor="middle" fontSize={15} fontWeight={800} fill={color}>
        {top}
      </text>
      <text x={mid} y={52} textAnchor="middle" fontSize={15} fontWeight={800} fill={color}>
        {bottom}
      </text>
      <rect
        x={col.x} y={py(0)} width={col.w} height={Math.max(4, py(end) - py(0))} rx={12}
        fill={color} opacity={0.18}
      />
      <rect
        x={col.x} y={py(0)} width={col.w} height={Math.max(4, py(end) - py(0))} rx={12}
        fill="none" stroke={color} strokeWidth={2.4}
        style={{ transition: "height 560ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
      <text
        x={mid} y={py(end) + 22} textAnchor="middle" fontSize={16} fontWeight={800} fill={color}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {hhmm(end)}
      </text>
    </g>
  );
}

function TimelineV({ etd, show }: { etd: number; show: Scene["show"] }) {
  const v = voidAt(etd);
  const governs = ceilingWins(etd);

  return (
    <>
      {[0, 60, 120, 180, 240].map((t) => (
        <g key={t}>
          <line x1={62} y1={py(t)} x2={VBV.w - 14} y2={py(t)} stroke="var(--color-line)" strokeWidth={1.2} />
          <text
            x={56} y={py(t) + 5} textAnchor="end" fontSize={14} fontWeight={700}
            fill="var(--color-navy-faint)" style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {hhmm(t)}
          </text>
        </g>
      ))}

      {show.ceiling && (
        <VBar
          col={COL.a} end={CEILING} role="ceiling" top="BRIEF" bottom="+3:00"
          dim={Boolean(show.verdict) && !governs}
        />
      )}

      {show.etdBar && (
        <>
          <VBar
            col={COL.b} end={etdClock(etd)} role="etd" top="ETD" bottom="+0:30"
            dim={Boolean(show.verdict) && governs}
          />
          <g opacity={Boolean(show.verdict) && governs ? 0.34 : 1}>
            <line
              x1={COL.b.x - 6} y1={py(etd)} x2={COL.b.x + COL.b.w + 6} y2={py(etd)}
              stroke="var(--color-brand-dark)" strokeWidth={2.6}
            />
            <text
              x={COL.b.x + COL.b.w / 2} y={py(etd) + 17} textAnchor="middle"
              fontSize={12.5} fontWeight={800} fill="var(--color-brand-dark)"
              stroke="var(--color-surface)" strokeWidth={4} paintOrder="stroke"
            >
              ETD
            </text>
          </g>
        </>
      )}

      {show.verdict && (
        <g>
          <line x1={70} y1={py(v)} x2={252} y2={py(v)} stroke="var(--color-nogo)" strokeWidth={3} strokeLinecap="round" />
          <rect x={252} y={py(v) - 15} width={98} height={30} rx={15} fill="var(--color-nogo)" />
          <text
            x={301} y={py(v) + 6} textAnchor="middle" fontSize={15} fontWeight={800} fill="#fff"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {hhmm(v)}
          </text>
          <text
            x={301} y={py(v) - 22} textAnchor="middle" fontSize={11.5} fontWeight={800}
            letterSpacing="0.08em" fill="var(--color-nogo)"
          >
            VOID
          </text>
        </g>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Crossover chart — the memory image                                  */
/* ------------------------------------------------------------------ */

const VBC = { w: 420, h: 360 };

function Chart() {
  const cx = (t: number) => 66 + (t / SPAN) * 316;
  const cy = (t: number) => 286 - (t / SPAN) * 224;

  return (
    <g>
      {/* Frame */}
      <line x1={66} y1={286} x2={396} y2={286} stroke="var(--color-line-strong)" strokeWidth={2} />
      <line x1={66} y1={50} x2={66} y2={286} stroke="var(--color-line-strong)" strokeWidth={2} />
      <text x={396} y={318} textAnchor="end" fontSize={12.5} fontWeight={800}
        letterSpacing="0.07em" fill="var(--color-navy-faint)">
        YOUR ETD
      </text>
      <text x={22} y={168} fontSize={12.5} fontWeight={800} letterSpacing="0.07em"
        fill="var(--color-navy-faint)" transform="rotate(-90 22 168)" textAnchor="middle">
        BRIEF VOIDS AT
      </text>

      {/* What each clock would say on its own. */}
      <line x1={cx(0)} y1={cy(CEILING)} x2={cx(SPAN)} y2={cy(CEILING)}
        stroke="var(--color-navy)" strokeWidth={2} strokeDasharray="7 6" opacity={0.5} />
      <line x1={cx(0)} y1={cy(AFTER_ETD)} x2={cx(210)} y2={cy(240)}
        stroke="var(--color-brand)" strokeWidth={2} strokeDasharray="7 6" opacity={0.5} />

      {/* What the rule actually gives you: the lower of the two. */}
      <polyline
        points={`${cx(0)} ${cy(AFTER_ETD)} ${cx(TIE_ETD)} ${cy(CEILING)} ${cx(SPAN)} ${cy(CEILING)}`}
        fill="none" stroke="var(--color-nogo)" strokeWidth={4.5} strokeLinejoin="round" strokeLinecap="round"
      />

      <text x={cx(52)} y={cy(24)} fontSize={12.5} fontWeight={800} fill="var(--color-brand)">
        ETD + 0:30 governs
      </text>
      <text x={cx(238)} y={cy(CEILING) + 28} textAnchor="end" fontSize={12.5} fontWeight={800} fill="var(--color-navy)">
        BRIEF + 3:00 governs
      </text>

      <circle cx={cx(TIE_ETD)} cy={cy(CEILING)} r={7} fill="var(--color-nogo)" />
      <line x1={cx(TIE_ETD)} y1={cy(CEILING)} x2={cx(TIE_ETD)} y2={286}
        stroke="var(--color-nogo)" strokeWidth={1.6} strokeDasharray="4 4" />
      <text x={cx(TIE_ETD)} y={306} textAnchor="middle" fontSize={12.5} fontWeight={800}
        fill="var(--color-nogo)" style={{ fontVariantNumeric: "tabular-nums" }}>
        1130
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Readout                                                             */
/* ------------------------------------------------------------------ */

function Readout({ etd, show }: { etd: number; show: Scene["show"] }) {
  const DASH = "—";
  const v = voidAt(etd);
  const govern = ceilingWins(etd);

  const cell = (label: string, value: string, sub: string, tone?: "navy" | "brand" | "nogo") => (
    <div className="min-w-0 rounded-xl bg-surface-2 px-3 py-2 sm:flex-1 sm:py-2.5">
      <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-navy-faint">{label}</p>
      <p
        className={`tabular text-[21px] font-extrabold leading-tight sm:text-[24px] ${
          tone === "nogo" ? "text-nogo" : tone === "brand" ? "text-brand" : "text-navy"
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
        {cell("Brief clock", show.ceiling ? hhmm(CEILING) : DASH, show.ceiling ? "brief + 3:00" : "not yet")}
        {cell(
          "ETD clock",
          show.etdBar ? hhmm(etdClock(etd)) : DASH,
          show.etdBar ? `ETD ${hhmm(etd)} + 0:30` : "not yet",
          "brand",
        )}
        {cell("Void at", show.verdict ? hhmm(v) : DASH, show.verdict ? "the earlier one" : "—", "nogo")}
        {cell(
          "Governed by",
          show.verdict ? (govern ? "3:00" : "0:30") : DASH,
          show.verdict ? (govern ? "the ceiling" : "your departure") : "—",
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Player                                                             */
/* ------------------------------------------------------------------ */

export function TwoClocksExplainer({
  scene,
  onResolveGate,
}: {
  scene: number;
  onResolveGate: (outcome: GateOutcome) => void;
}) {
  const [choice, setChoice] = useState<number | null>(null);
  const [drag, setDrag] = useState(60);

  const s = SCENES[Math.min(scene, SCENES.length - 1)];
  const etd = s.play ? drag : s.etd;
  const label = s.chart
    ? "Chart of void time against ETD, showing the crossover at 1130"
    : `Brief clock ends ${hhmm(CEILING)}, ETD clock ends ${hhmm(etdClock(etd))}`;

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
        <div className="flex h-full flex-col pt-10 sm:pt-0">
          <StageChip>
            Scene {Math.min(scene, SCENES.length - 1) + 1} / {SCENES.length}
          </StageChip>
          {s.play && <StageChip corner="tr">Interactive</StageChip>}

          <div className="relative min-h-0 w-full flex-1 xl:hidden">
            <svg
              viewBox={s.chart ? `0 0 ${VBC.w} ${VBC.h}` : `0 0 ${VBV.w} ${VBV.h}`}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={label}
            >
              {s.chart ? <Chart /> : <TimelineV etd={etd} show={s.show} />}
            </svg>
          </div>

          <div className="relative hidden min-h-0 w-full flex-1 xl:block">
            <svg
              viewBox={s.chart ? `0 0 ${VBC.w} ${VBC.h}` : `0 0 ${VB.w} ${VB.h}`}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={label}
            >
              {s.chart ? <Chart /> : <Timeline etd={etd} show={s.show} />}
            </svg>
          </div>

          {!s.chart && <Readout etd={etd} show={s.show} />}
        </div>
      </Stage>

      {s.play && (
        <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3">
          <div className="mx-auto max-w-3xl">
            <label className="block">
              <span className="sr-only">Estimated time of departure</span>
              <input
                type="range"
                min={0}
                max={210}
                step={5}
                value={drag}
                onChange={(e) => setDrag(Number(e.target.value))}
                className="w-full accent-[var(--color-brand)]"
              />
              <span className="mt-0.5 block text-center text-[10.5px] font-bold uppercase tracking-wider text-navy-faint">
                ETD {hhmm(drag)} — {ceilingWins(drag) ? "ceiling governs" : "departure governs"}
              </span>
            </label>
          </div>
        </div>
      )}
    </>
  );
}

TwoClocksExplainer.sceneCount = SCENES.length;
TwoClocksExplainer.blocksAt = (scene: number) => Boolean(SCENES[scene]?.predict);
TwoClocksExplainer.nextLabel = (scene: number) => {
  const s = SCENES[scene];
  if (!s) return "Next";
  if (s.predict) return "Reveal";
  if (s.play) return "Finish";
  if (s.chart) return "Try it";
  return "Next";
};
TwoClocksExplainer.anchor = [
  "A DD-175-1 is void at brief + 3:00 OR ETD + 0:30 — whichever is EARLIER.",
  "Two clocks, and the shorter one always wins. There is no exception.",
  "They tie when ETD is brief + 2:30. Later than that, the ceiling governs.",
];
