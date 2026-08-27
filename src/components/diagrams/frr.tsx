"use client";

/**
 * Flight Rules and Regulations diagrams.
 *
 * Aerodynamics draws air over a wing and Engines draws a machine working on
 * it. FR&R has no physical system to draw, so its visual language is the one
 * pilots already read: charts, airspace cross-sections, light signals,
 * position reports and decision paths.
 *
 * Every value shown comes from Module 7 of the trainee guide. Where the guide
 * only reproduces something as a figure, the diagram teaches the surrounding
 * rule rather than inventing the figure's contents.
 */

import {
  ArrowDefs,
  Diagram,
  type DiagramProps,
  RegionLabel,
  bool,
  num,
  str,
} from "./primitives";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";

/* ------------------------------------------------------------------ */
/* Publications and priority                                           */
/* ------------------------------------------------------------------ */

/** The regulation stack, most authoritative on top. */
export function PriorityStack(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  // A tap question asks the student to find a layer, so the names must be
  // suppressible — otherwise the diagram prints the answer.
  const labels = bool(p.labels, true);

  const layers = [
    { id: "natops", label: "Aircraft NATOPS", by: "USN · this aircraft", color: NOGO },
    { id: "cnaf", label: "CNAF M-3710.7", by: "USN · all naval aircraft", color: CAUTION },
    { id: "flip", label: "FLIP", by: "DOD · all branches", color: BRAND },
    { id: "far", label: "FAR Part 91", by: "FAA · military and civil", color: MUTED },
  ];

  return (
    <Diagram title="Priority of regulations">
      <text x={250} y={34} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={MUTED}>
        HIGHEST AUTHORITY
      </text>

      {layers.map((l, i) => {
        const y = 48 + i * 52;
        // Each step down is wider: lower authority, broader reach.
        const w = 180 + i * 56;
        const on = highlight === "none" || highlight === l.id;
        return (
          <g key={l.id} opacity={on ? 1 : 0.3}>
            <rect
              x={250 - w / 2}
              y={y}
              width={w}
              height={42}
              rx={9}
              fill={`color-mix(in srgb, ${l.color} 15%, transparent)`}
              stroke={l.color}
              strokeWidth={highlight === l.id ? 2.4 : 1.7}
            />
            {labels ? (
              <>
                <text x={250} y={y + 19} textAnchor="middle" fontSize={12} fontWeight={800} fill={NAVY}>
                  {l.label}
                </text>
                <text x={250} y={y + 33} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
                  {l.by}
                </text>
              </>
            ) : (
              <text x={250} y={y + 27} textAnchor="middle" fontSize={15} fontWeight={800} fill={MUTED}>
                {i + 1}
              </text>
            )}
          </g>
        );
      })}

      <text x={250} y={276} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        The more specific the document, the higher it ranks
      </text>
    </Diagram>
  );
}

/** ATC and the four subordinate agencies. */
export function AtcOrg(p: DiagramProps) {
  const highlight = str(p.highlight, "none");

  const agencies = [
    { id: "fss", label: "FSS", role: "Briefings, flight plans, SAR", color: GO },
    { id: "tower", label: "Tower", role: "Traffic at and around the field", color: BRAND },
    { id: "approach", label: "Approach", role: "Terminal IFR traffic", color: CAUTION },
    { id: "artcc", label: "ARTCC", role: "En route IFR traffic", color: NOGO },
  ];

  return (
    <Diagram title="Air Traffic Control organisation">
      <ArrowDefs colors={{ l: MUTED }} />

      <rect x={168} y={34} width={164} height={42} rx={10} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2} />
      <text x={250} y={54} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={NAVY}>
        Air Traffic Control
      </text>
      <text x={250} y={68} textAnchor="middle" fontSize={9} fontWeight={650} fill={MUTED}>
        enforces FAR · grants clearances
      </text>

      <line x1={250} y1={76} x2={250} y2={94} stroke={MUTED} strokeWidth={1.8} />
      <line x1={70} y1={94} x2={430} y2={94} stroke={MUTED} strokeWidth={1.8} />

      {agencies.map((a, i) => {
        const x = 42 + i * 108;
        const on = highlight === "none" || highlight === a.id;
        return (
          <g key={a.id} opacity={on ? 1 : 0.3}>
            <line x1={x + 47} y1={94} x2={x + 47} y2={118} stroke={MUTED} strokeWidth={1.6} />
            <rect
              x={x}
              y={118}
              width={94}
              height={76}
              rx={10}
              fill={`color-mix(in srgb, ${a.color} 13%, transparent)`}
              stroke={a.color}
              strokeWidth={highlight === a.id ? 2.2 : 1.7}
            />
            <text x={x + 47} y={142} textAnchor="middle" fontSize={12} fontWeight={800} fill={NAVY}>
              {a.label}
            </text>
            <foreignObject x={x + 5} y={148} width={84} height={44}>
              <div
                style={{
                  fontSize: "8.6px",
                  lineHeight: 1.3,
                  fontWeight: 650,
                  color: "var(--color-navy-soft)",
                  textAlign: "center",
                }}
              >
                {a.role}
              </div>
            </foreignObject>
          </g>
        );
      })}

      <text x={250} y={228} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        Approach owns terminal IFR · Center owns en route IFR
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Airspace                                                            */
/* ------------------------------------------------------------------ */

/**
 * The airspace cross-section. Every dimension is from the trainee guide:
 * A from 18,000 MSL to FL600, B surface to 10,000 MSL, C surface to 4,000 AGL
 * with a 5 nm core and 10 nm shelf, D surface to 2,500 AGL.
 */
export function AirspaceProfile(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  const labels = bool(p.labels, true);

  const ground = 250;
  const on = (id: string) => highlight === "none" || highlight === id;
  const dim = (id: string) => (on(id) ? 1 : 0.25);

  return (
    <Diagram title="Airspace classes in profile">
      {/* Ground */}
      <line x1={20} y1={ground} x2={480} y2={ground} stroke={NAVY} strokeWidth={2.4} />

      {/* Class A: a band across the top */}
      <g opacity={dim("a")}>
        <rect x={20} y={40} width={460} height={40} fill="color-mix(in srgb, var(--color-nogo) 12%, transparent)" />
        <line x1={20} y1={80} x2={480} y2={80} stroke={NOGO} strokeWidth={2} strokeDasharray="6 4" />
        {labels && (
          <>
            <text x={30} y={62} fontSize={12} fontWeight={800} fill={NOGO}>
              CLASS A
            </text>
            <text x={474} y={62} textAnchor="end" fontSize={9.5} fontWeight={700} fill={NOGO}>
              18,000 MSL to FL600 · IFR only
            </text>
          </>
        )}
      </g>

      {/* Class E fills the middle */}
      <g opacity={dim("e")}>
        <rect x={20} y={80} width={460} height={ground - 80} fill="color-mix(in srgb, var(--color-brand) 5%, transparent)" />
        {labels && (
          <text x={250} y={104} textAnchor="middle" fontSize={11} fontWeight={750} fill={BRAND}>
            CLASS E — all other controlled airspace
          </text>
        )}
      </g>

      {/* Class B: upside-down wedding cake, surface to 10,000 MSL */}
      <g opacity={dim("b")}>
        <path
          d={`M62 ${ground} L62 ${ground - 46} L96 ${ground - 46} L96 ${ground - 74} L134 ${ground - 74} L134 ${ground - 102} L38 ${ground - 102} L38 ${ground - 74} L62 ${ground - 74} Z`}
          fill="color-mix(in srgb, var(--color-brand) 22%, transparent)"
          stroke={BRAND}
          strokeWidth={2}
        />
        {labels && (
          <>
            <text x={86} y={ground - 112} textAnchor="middle" fontSize={11} fontWeight={800} fill={BRAND}>
              CLASS B
            </text>
            <text x={86} y={ground + 14} textAnchor="middle" fontSize={8.6} fontWeight={650} fill={MUTED}>
              SFC–10,000 MSL
            </text>
          </>
        )}
      </g>

      {/* Class C: 5 nm core + 10 nm shelf */}
      <g opacity={dim("c")}>
        <rect x={206} y={ground - 62} width={54} height={62} fill="color-mix(in srgb, var(--color-caution) 22%, transparent)" stroke={CAUTION} strokeWidth={2} />
        <rect x={176} y={ground - 62} width={30} height={40} fill="color-mix(in srgb, var(--color-caution) 14%, transparent)" stroke={CAUTION} strokeWidth={1.6} />
        <rect x={260} y={ground - 62} width={30} height={40} fill="color-mix(in srgb, var(--color-caution) 14%, transparent)" stroke={CAUTION} strokeWidth={1.6} />
        {labels && (
          <>
            <text x={233} y={ground - 72} textAnchor="middle" fontSize={11} fontWeight={800} fill={CAUTION}>
              CLASS C
            </text>
            <text x={233} y={ground + 14} textAnchor="middle" fontSize={8.6} fontWeight={650} fill={MUTED}>
              SFC–4,000 AGL
            </text>
            <text x={296} y={ground - 30} fontSize={8} fontWeight={650} fill={MUTED}>
              shelf 1,200–4,000
            </text>
          </>
        )}
      </g>

      {/* Class D */}
      <g opacity={dim("d")}>
        <rect x={356} y={ground - 40} width={54} height={40} fill="color-mix(in srgb, var(--color-go) 20%, transparent)" stroke={GO} strokeWidth={2} />
        {labels && (
          <>
            <text x={383} y={ground - 50} textAnchor="middle" fontSize={11} fontWeight={800} fill={GO}>
              CLASS D
            </text>
            <text x={383} y={ground + 14} textAnchor="middle" fontSize={8.6} fontWeight={650} fill={MUTED}>
              SFC–2,500 AGL
            </text>
          </>
        )}
      </g>

      {/* Class G hugging the ground where nothing else is */}
      <g opacity={dim("g")}>
        <rect x={430} y={ground - 16} width={50} height={16} fill="color-mix(in srgb, var(--color-navy) 12%, transparent)" />
        {labels && (
          <text x={455} y={ground + 14} textAnchor="middle" fontSize={9} fontWeight={800} fill={MUTED}>
            CLASS G
          </text>
        )}
      </g>

      {labels && (
        <text x={250} y={284} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
          Not to scale · Class G is uncontrolled, everything else is controlled
        </text>
      )}
    </Diagram>
  );
}

/** VFR cloud clearance, drawn as the distances they actually are. */
export function CloudClearance(p: DiagramProps) {
  const preset = str<"standard" | "high" | "classb">(p.preset, "standard");

  const config = {
    standard: { above: "1,000'", below: "500'", horiz: "2,000'", vis: "3 SM", note: "Class C, D, and E below 10,000 MSL" },
    high: { above: "1,000'", below: "1,000'", horiz: "1 SM", vis: "5 SM", note: "Class E at or above 10,000 MSL" },
    classb: { above: "—", below: "—", horiz: "—", vis: "3 SM", note: "Class B: clear of clouds" },
  }[preset];

  const cy = 150;
  const clearOfClouds = preset === "classb";

  return (
    <Diagram title="VFR cloud clearance">
      {/* Cloud above */}
      <path
        d="M150 56 q-22 0 -22 16 q-20 2 -18 18 q2 12 20 12 h200 q22 0 22 -16 q0 -16 -22 -16 q-6 -18 -28 -14 q-16 -20 -46 -12 q-20 -12 -38 4 Z"
        fill="var(--color-surface-3)"
        stroke={MUTED}
        strokeWidth={1.4}
      />

      {/* Aircraft */}
      <g transform={`translate(250 ${cy})`}>
        <path d="M-18 0 L10 0 M0 -9 L0 9 M8 -5 L8 5" stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
        <circle cx={-2} cy={0} r={3.2} fill={NAVY} />
      </g>

      {clearOfClouds ? (
        <>
          <text x={250} y={cy + 46} textAnchor="middle" fontSize={14} fontWeight={800} fill={BRAND}>
            CLEAR OF CLOUDS
          </text>
          <text x={250} y={cy + 68} textAnchor="middle" fontSize={11.5} fontWeight={750} fill={NAVY}>
            3 SM visibility
          </text>
        </>
      ) : (
        <>
          {/* Above */}
          <line x1={250} y1={102} x2={250} y2={cy - 14} stroke={BRAND} strokeWidth={1.6} strokeDasharray="4 3" />
          <text x={258} y={126} fontSize={11} fontWeight={800} fill={BRAND}>
            {config.above} above
          </text>

          {/* Below */}
          <line x1={250} y1={cy + 14} x2={250} y2={212} stroke={CAUTION} strokeWidth={1.6} strokeDasharray="4 3" />
          <text x={258} y={192} fontSize={11} fontWeight={800} fill={CAUTION}>
            {config.below} below
          </text>
          <path
            d="M180 214 q-16 0 -16 12 q-14 2 -12 12 q2 8 14 8 h160 q16 0 16 -12 q0 -12 -16 -12 q-6 -12 -22 -10 Z"
            fill="var(--color-surface-3)"
            stroke={MUTED}
            strokeWidth={1.2}
          />

          {/* Horizontal */}
          <line x1={268} y1={cy} x2={400} y2={cy} stroke={GO} strokeWidth={1.6} strokeDasharray="4 3" />
          <text x={334} y={cy - 8} textAnchor="middle" fontSize={11} fontWeight={800} fill={GO}>
            {config.horiz}
          </text>
          <path
            d="M406 128 q-14 0 -14 10 q-12 2 -10 10 q2 7 12 7 h56 q14 0 14 -10 q0 -10 -14 -10 Z"
            fill="var(--color-surface-3)"
            stroke={MUTED}
            strokeWidth={1.2}
          />
        </>
      )}

      <g transform="translate(58 46)">
        <rect x={-38} y={-16} width={76} height={38} rx={9} fill="var(--color-surface-2)" />
        <text x={0} y={-2} textAnchor="middle" fontSize={9} fontWeight={750} fill={MUTED}>
          VISIBILITY
        </text>
        <text x={0} y={16} textAnchor="middle" fontSize={15} fontWeight={800} fill={NAVY}>
          {config.vis}
        </text>
      </g>

      <text x={250} y={282} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        {config.note}
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Semicircular cruising altitudes                                     */
/* ------------------------------------------------------------------ */

/**
 * The compass split into the east and west halves that decide cruising
 * altitude, with a course needle the student can move.
 */
export function SemicircularRule(p: DiagramProps) {
  const course = ((num(p.course, 90) % 360) + 360) % 360;
  const rules = str<"vfr" | "ifr">(p.rules, "vfr");

  const cx = 158;
  const cy = 152;
  const r = 92;
  // 0-179 is east, 180-359 is west. 360 wraps to 0, so it is east.
  const east = course < 180;
  const rad = ((course - 90) * Math.PI) / 180;

  const answer = rules === "vfr"
    ? east
      ? "Odd thousands + 500"
      : "Even thousands + 500"
    : east
      ? "Odd thousands"
      : "Even thousands";
  const example = rules === "vfr"
    ? east
      ? "3,500 · 5,500 · 9,500"
      : "4,500 · 6,500 · 10,500"
    : east
      ? "3,000 · 5,000 · 9,000"
      : "4,000 · 6,000 · 10,000";

  return (
    <Diagram title="Semicircular cruising altitude rule">
      {/* East half */}
      <path
        d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} Z`}
        fill="color-mix(in srgb, var(--color-brand) 14%, transparent)"
        stroke={BRAND}
        strokeWidth={1.6}
      />
      {/* West half */}
      <path
        d={`M${cx} ${cy} L${cx} ${cy + r} A${r} ${r} 0 0 1 ${cx} ${cy - r} Z`}
        fill="color-mix(in srgb, var(--color-caution) 14%, transparent)"
        stroke={CAUTION}
        strokeWidth={1.6}
      />

      <text x={cx + 44} y={cy - 34} textAnchor="middle" fontSize={11} fontWeight={800} fill={BRAND}>
        EAST
      </text>
      <text x={cx + 44} y={cy - 20} textAnchor="middle" fontSize={8.6} fontWeight={650} fill={BRAND}>
        000°–179°
      </text>
      <text x={cx - 44} y={cy + 26} textAnchor="middle" fontSize={11} fontWeight={800} fill={CAUTION}>
        WEST
      </text>
      <text x={cx - 44} y={cy + 40} textAnchor="middle" fontSize={8.6} fontWeight={650} fill={CAUTION}>
        180°–359°
      </text>

      {/* Course needle */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + Math.cos(rad) * (r - 6)}
        y2={cy + Math.sin(rad) * (r - 6)}
        stroke={NAVY}
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={5} fill={NAVY} />

      {/* Readout */}
      <g transform="translate(360 92)">
        <rect x={-92} y={-32} width={184} height={62} rx={11} fill="var(--color-surface-2)" />
        <text x={0} y={-14} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
          MAGNETIC COURSE
        </text>
        <text x={0} y={12} textAnchor="middle" fontSize={24} fontWeight={800} fill={NAVY} className="tabular">
          {course.toFixed(0).padStart(3, "0")}°
        </text>
      </g>

      <g transform="translate(360 186)">
        <rect
          x={-92}
          y={-30}
          width={184}
          height={72}
          rx={11}
          fill={`color-mix(in srgb, ${east ? BRAND : CAUTION} 14%, transparent)`}
          stroke={east ? BRAND : CAUTION}
          strokeWidth={1.8}
        />
        <text x={0} y={-12} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={east ? BRAND : CAUTION}>
          {rules.toUpperCase()} · {east ? "EAST" : "WEST"}
        </text>
        <text x={0} y={8} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={NAVY}>
          {answer}
        </text>
        <text x={0} y={28} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
          {example}
        </text>
      </g>

      <text x={250} y={276} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        {rules === "vfr"
          ? "VFR applies above 3,000 ft AGL · below that any altitude may be used"
          : "In controlled airspace ATC assigns the altitude"}
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Right of way and position lights                                    */
/* ------------------------------------------------------------------ */

/** Two aircraft in one of the four geometries, with the rule stated. */
export function RightOfWay(p: DiagramProps) {
  const scenario = str<"headon" | "converging" | "overtaking" | "landing">(p.scenario, "converging");
  // The converging case reads differently for two categories than for one, so
  // a caller resolving a specific pairing can replace the caption.
  const detailOverride = str(p.detail, "");

  const config = {
    headon: {
      rule: "BOTH alter course to the right",
      detail: "Approaching head-on, or nearly so, at the same altitude",
      tone: CAUTION,
    },
    converging: {
      rule: "The aircraft to the other's RIGHT has right of way",
      detail: "Same category, converging at about the same altitude",
      tone: BRAND,
    },
    overtaking: {
      rule: "The overtaken aircraft has right of way",
      detail: "The overtaking aircraft alters course to the right to pass well clear",
      tone: GO,
    },
    landing: {
      rule: "The aircraft at the LOWER altitude has right of way",
      detail: "Two or more aircraft approaching an airport to land",
      tone: NOGO,
    },
  }[scenario];

  const plane = (x: number, y: number, rot: number, color: string, tag?: string) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d="M-16 0 L12 0 M0 -11 L0 11 M10 -6 L10 6" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <circle cx={-1} cy={0} r={3.6} fill={color} />
      {tag && (
        <text x={0} y={-18} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={color} transform={`rotate(${-rot})`}>
          {tag}
        </text>
      )}
    </g>
  );

  return (
    <Diagram title={`Right of way — ${scenario}`}>
      {scenario === "headon" && (
        <>
          {plane(150, 148, 0, BRAND)}
          {plane(350, 148, 180, NOGO)}
          <path d="M172 132 q28 -22 56 -6" stroke={BRAND} strokeWidth={2} fill="none" strokeDasharray="4 3" markerEnd="url(#arrow-r)" />
          <path d="M328 164 q-28 22 -56 6" stroke={NOGO} strokeWidth={2} fill="none" strokeDasharray="4 3" markerEnd="url(#arrow-r2)" />
        </>
      )}
      {scenario === "converging" && (
        <>
          {plane(140, 200, -35, BRAND, "gives way")}
          {plane(330, 108, 125, GO, "has right of way")}
          <text x={250} y={168} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
            on the other&rsquo;s right
          </text>
        </>
      )}
      {scenario === "overtaking" && (
        <>
          {plane(180, 150, 0, GO, "has right of way")}
          {plane(90, 150, 0, BRAND, "overtaking")}
          <path d="M112 166 q40 40 96 12" stroke={BRAND} strokeWidth={2} fill="none" strokeDasharray="4 3" markerEnd="url(#arrow-r)" />
          <text x={330} y={154} fontSize={10} fontWeight={700} fill={MUTED}>
            pass well clear, to the right
          </text>
        </>
      )}
      {scenario === "landing" && (
        <>
          <line x1={60} y1={228} x2={440} y2={228} stroke={NAVY} strokeWidth={3} />
          {plane(200, 120, 18, CAUTION, "gives way")}
          {plane(300, 186, 18, GO, "lower — right of way")}
        </>
      )}

      <ArrowDefs colors={{ r: BRAND, r2: NOGO }} />

      <g transform="translate(250 262)">
        <rect
          x={-215}
          y={-24}
          width={430}
          height={46}
          rx={11}
          fill={`color-mix(in srgb, ${config.tone} 13%, transparent)`}
          stroke={config.tone}
          strokeWidth={1.6}
        />
        <text x={0} y={-6} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={NAVY}>
          {config.rule}
        </text>
        <text x={0} y={11} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
          {detailOverride || config.detail}
        </text>
      </g>
    </Diagram>
  );
}

/** What the other aircraft's lights tell you about where it is going. */
export function PositionLights(p: DiagramProps) {
  const view = str<"headon" | "tail" | "left" | "right">(p.view, "headon");
  // With labels off the lamps go dark as well as unnamed: a tap question that
  // asks which wingtip is red cannot be answered by looking at the colours.
  const labels = bool(p.labels, true);

  const config = {
    headon: { see: "Red AND green", meaning: "Head-on, opposite direction", tone: NOGO },
    tail: { see: "White only", meaning: "Tail on, same direction", tone: GO },
    left: { see: "Red only", meaning: "Its left side — crossing right to left", tone: CAUTION },
    right: { see: "Green only", meaning: "Its right side — crossing left to right", tone: BRAND },
  }[view];

  const showRed = labels && (view === "headon" || view === "left");
  const showGreen = labels && (view === "headon" || view === "right");
  const showWhite = labels && view === "tail";

  return (
    <Diagram title="Reading position lights">
      {/* Aircraft from behind/front depending on view */}
      <g transform="translate(250 130)">
        <path
          d="M-96 0 L96 0"
          stroke={NAVY}
          strokeWidth={7}
          strokeLinecap="round"
        />
        <ellipse cx={0} cy={0} rx={17} ry={26} fill={NAVY} />
        <path d="M-30 34 L30 34" stroke={NAVY} strokeWidth={5} strokeLinecap="round" />

        {/* Left wing tip = red, right = green, from the observed aircraft's own frame. */}
        <circle cx={-96} cy={0} r={9} fill={showRed ? NOGO : "var(--color-surface-3)"} />
        <circle cx={96} cy={0} r={9} fill={showGreen ? GO : "var(--color-surface-3)"} />
        <circle cx={0} cy={40} r={8} fill={showWhite ? "#fff" : "var(--color-surface-3)"} stroke={showWhite ? MUTED : "transparent"} strokeWidth={1.4} />

        {labels && (
          <>
            <text x={-96} y={-20} textAnchor="middle" fontSize={9} fontWeight={750} fill={showRed ? NOGO : MUTED}>
              RED
            </text>
            <text x={96} y={-20} textAnchor="middle" fontSize={9} fontWeight={750} fill={showGreen ? GO : MUTED}>
              GREEN
            </text>
            <text x={0} y={62} textAnchor="middle" fontSize={9} fontWeight={750} fill={showWhite ? NAVY : MUTED}>
              WHITE aft
            </text>
          </>
        )}
      </g>

      {labels && (
      <g transform="translate(250 236)">
        <rect x={-190} y={-26} width={380} height={52} rx={11} fill={`color-mix(in srgb, ${config.tone} 13%, transparent)`} stroke={config.tone} strokeWidth={1.7} />
        <text x={0} y={-6} textAnchor="middle" fontSize={11} fontWeight={800} fill={config.tone}>
          You see: {config.see}
        </text>
        <text x={0} y={13} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={NAVY}>
          {config.meaning}
        </text>
      </g>
      )}

      {labels && (
        <text x={250} y={286} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
          Red left wing · green right wing · white facing aft
        </text>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Airport                                                             */
/* ------------------------------------------------------------------ */

/** Magnetic heading rounded to the runway number painted on the threshold. */
export function RunwayNumbering(p: DiagramProps) {
  const heading = ((num(p.heading, 93) % 360) + 360) % 360;
  const rounded = Math.round(heading / 10) * 10;
  const display = rounded === 0 ? 36 : rounded / 10;
  const label = String(display).padStart(2, "0");
  // The reciprocal end carries the opposite number.
  const recip = ((rounded + 180) % 360) / 10;
  const recipLabel = String(recip === 0 ? 36 : recip).padStart(2, "0");

  return (
    <Diagram title="Runway orientation">
      <g transform={`translate(250 148) rotate(${rounded - 90})`}>
        <rect x={-140} y={-26} width={280} height={52} rx={3} fill="var(--color-surface-3)" stroke={NAVY} strokeWidth={2} />
        {Array.from({ length: 7 }, (_, i) => (
          <line key={i} x1={-96 + i * 32} y1={0} x2={-76 + i * 32} y2={0} stroke="#fff" strokeWidth={3} />
        ))}
        <text x={-76} y={7} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" transform={`rotate(${90 - rounded} -76 0)`}>
          {label}
        </text>
        <text x={76} y={7} textAnchor="middle" fontSize={19} fontWeight={800} fill="#fff" transform={`rotate(${90 - rounded} 76 0)`}>
          {recipLabel}
        </text>
      </g>

      <g transform="translate(250 56)">
        <rect x={-118} y={-20} width={236} height={40} rx={10} fill="var(--color-surface-2)" />
        <text x={-52} y={5} textAnchor="middle" fontSize={13} fontWeight={800} fill={NAVY} className="tabular">
          {heading.toFixed(0).padStart(3, "0")}°
        </text>
        <text x={0} y={5} textAnchor="middle" fontSize={13} fill={MUTED}>
          →
        </text>
        <text x={56} y={5} textAnchor="middle" fontSize={13} fontWeight={800} fill={BRAND}>
          RWY {label}
        </text>
      </g>

      <text x={250} y={262} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Magnetic heading, rounded to the nearest 10°, last digit dropped
      </text>
      <text x={250} y={280} textAnchor="middle" fontSize={9.5} fill={MUTED}>
        The opposite end is always the reciprocal
      </text>
    </Diagram>
  );
}

/** Aldis lamp / light gun signals from the tower. */
export function LightGun(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  // The meanings ARE the answer to the tap question, so they are suppressible.
  const labels = bool(p.labels, true);

  const signals = [
    { id: "green", label: "Steady green", meaning: "Cleared to land", color: GO },
    { id: "red", label: "Steady red", meaning: "Give way and continue circling", color: NOGO },
    { id: "white", label: "Flashing white", meaning: "Return for landing", color: "#ffffff" },
  ];

  return (
    <Diagram title="Aldis lamp signals">
      <text x={250} y={40} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Used when an aircraft cannot be reached by radio
      </text>

      {signals.map((s, i) => {
        const y = 70 + i * 62;
        const on = highlight === "none" || highlight === s.id;
        return (
          <g key={s.id} opacity={on ? 1 : 0.3}>
            <rect
              x={54}
              y={y}
              width={392}
              height={50}
              rx={11}
              fill={highlight === s.id ? "var(--color-surface-2)" : "transparent"}
              stroke={MUTED}
              strokeWidth={1.2}
            />
            <circle
              cx={90}
              cy={y + 25}
              r={15}
              fill={s.color}
              stroke={s.id === "white" ? MUTED : "none"}
              strokeWidth={1.4}
            />
            {labels ? (
              <>
                <text x={122} y={y + 21} fontSize={11.5} fontWeight={800} fill={NAVY}>
                  {s.label}
                </text>
                <text x={122} y={y + 38} fontSize={10.5} fontWeight={650} fill={MUTED}>
                  {s.meaning}
                </text>
              </>
            ) : (
              <text x={122} y={y + 30} fontSize={11} fontWeight={700} fill={MUTED}>
                {s.id === "white" ? "Flashing" : "Steady"}
              </text>
            )}
          </g>
        );
      })}

      {labels && (
        <text x={250} y={274} textAnchor="middle" fontSize={9.8} fontWeight={700} fill={CAUTION}>
          Flashing white is &ldquo;return for landing&rdquo; — steady green is the clearance
        </text>
      )}
    </Diagram>
  );
}

/** VASI indication. */
export function Vasi(p: DiagramProps) {
  const state = str<"low" | "on" | "high">(p.state, "on");

  const bars = {
    low: { near: NOGO, far: NOGO, text: "Below glideslope", tone: NOGO },
    on: { near: NOGO, far: "#ffffff", text: "On glideslope", tone: GO },
    high: { near: "#ffffff", far: "#ffffff", text: "Above glideslope", tone: CAUTION },
  }[state];

  return (
    <Diagram title="VASI indication">
      <line x1={40} y1={228} x2={460} y2={228} stroke={NAVY} strokeWidth={3} />

      {/* Glideslope reference */}
      <line x1={70} y1={96} x2={330} y2={228} stroke={MUTED} strokeWidth={1.6} strokeDasharray="6 5" />
      <text x={92} y={90} fontSize={9.5} fontWeight={700} fill={MUTED}>
        glideslope
      </text>

      {/* Aircraft placed according to indication */}
      <g transform={`translate(${state === "low" ? 150 : state === "on" ? 150 : 150} ${state === "low" ? 190 : state === "on" ? 156 : 116})`}>
        <path d="M-16 0 L12 0 M0 -9 L0 9 M10 -5 L10 5" stroke={BRAND} strokeWidth={2.8} strokeLinecap="round" />
      </g>

      {/* The two light bars */}
      <g transform="translate(376 150)">
        <rect x={-46} y={-52} width={92} height={104} rx={12} fill="var(--color-ink-800)" />
        <circle cx={0} cy={-24} r={15} fill={bars.far} stroke={bars.far === "#ffffff" ? MUTED : "none"} strokeWidth={1.2} />
        <circle cx={0} cy={22} r={15} fill={bars.near} stroke={bars.near === "#ffffff" ? MUTED : "none"} strokeWidth={1.2} />
        <text x={0} y={-44} textAnchor="middle" fontSize={8.4} fontWeight={700} fill="#9db2c9">
          FAR BAR
        </text>
        <text x={0} y={46} textAnchor="middle" fontSize={8.4} fontWeight={700} fill="#9db2c9">
          NEAR BAR
        </text>
      </g>

      <RegionLabel x={250} y={264} text={bars.text} color={bars.tone} bg="var(--color-surface-2)" />
      <text x={250} y={286} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
        Red over white, you&rsquo;re alright · red over red, you&rsquo;re dead
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Limits                                                              */
/* ------------------------------------------------------------------ */

/** Airspeed limits, by where you are. */
export function AirspeedLimits(p: DiagramProps) {
  const highlight = str(p.highlight, "none");

  const rows = [
    { id: "below10", where: "Below 10,000' MSL", limit: "250 KIAS", color: BRAND },
    { id: "inb", where: "Inside Class B", limit: "250 kt", color: BRAND },
    { id: "underb", where: "Beneath Class B (the shelf)", limit: "200 kt", color: CAUTION },
    { id: "cd", where: "Within 4 nm of a Class C or D primary airport, SFC–2,500 AGL", limit: "200 kt", color: CAUTION },
  ];

  return (
    <Diagram title="Airspeed restrictions">
      {rows.map((r, i) => {
        const y = 48 + i * 52;
        const on = highlight === "none" || highlight === r.id;
        return (
          <g key={r.id} opacity={on ? 1 : 0.3}>
            <rect
              x={34}
              y={y}
              width={432}
              height={42}
              rx={10}
              fill={highlight === r.id ? `color-mix(in srgb, ${r.color} 12%, transparent)` : "var(--color-surface-2)"}
              stroke={highlight === r.id ? r.color : "transparent"}
              strokeWidth={1.8}
            />
            <foreignObject x={48} y={y + 6} width={300} height={32}>
              <div style={{ fontSize: "11px", fontWeight: 700, lineHeight: 1.25, color: "var(--color-navy)" }}>
                {r.where}
              </div>
            </foreignObject>
            <text x={452} y={y + 27} textAnchor="end" fontSize={15} fontWeight={800} fill={r.color} className="tabular">
              {r.limit}
            </text>
          </g>
        );
      })}

      <text x={250} y={276} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        Inside Class B you may do 250 — it is underneath it that drops to 200
      </text>
    </Diagram>
  );
}

/** Minimum safe altitudes, congested versus not. */
export function AltitudeRestrictions(p: DiagramProps) {
  const setting = str<"congested" | "other">(p.setting, "congested");
  const ground = 236;

  return (
    <Diagram title="Minimum safe altitudes">
      <line x1={20} y1={ground} x2={480} y2={ground} stroke={NAVY} strokeWidth={2.6} />

      {setting === "congested" ? (
        <>
          {/* City skyline with the tallest obstacle marked */}
          {[
            [120, 44],
            [156, 68],
            [196, 96],
            [240, 60],
            [280, 78],
          ].map(([x, h], i) => (
            <rect key={i} x={x} y={ground - h} width={30} height={h} fill="var(--color-surface-3)" stroke={MUTED} strokeWidth={1.2} />
          ))}
          <line x1={196} y1={ground - 96} x2={196} y2={ground - 176} stroke={NOGO} strokeWidth={1.8} strokeDasharray="5 4" />
          <line x1={110} y1={ground - 176} x2={330} y2={ground - 176} stroke={NOGO} strokeWidth={2} />
          <text x={206} y={ground - 138} fontSize={11.5} fontWeight={800} fill={NOGO}>
            1,000&apos; above the highest obstacle
          </text>

          {/* 2,000 ft radius */}
          <line x1={196} y1={ground + 14} x2={330} y2={ground + 14} stroke={BRAND} strokeWidth={1.6} />
          <text x={336} y={ground + 18} fontSize={10} fontWeight={750} fill={BRAND}>
            within 2,000&apos; radius
          </text>

          <g transform={`translate(250 ${ground - 190})`}>
            <path d="M-16 0 L12 0 M0 -9 L0 9 M10 -5 L10 5" stroke={BRAND} strokeWidth={2.8} strokeLinecap="round" />
          </g>
          <text x={250} y={40} textAnchor="middle" fontSize={12} fontWeight={800} fill={NAVY}>
            OVER A CONGESTED AREA
          </text>
        </>
      ) : (
        <>
          <path d="M60 236 q60 -22 130 -6 q70 16 130 -4 q60 -18 120 6" fill="none" stroke={MUTED} strokeWidth={2} />
          <g transform={`translate(250 ${ground - 108})`}>
            <path d="M-16 0 L12 0 M0 -9 L0 9 M10 -5 L10 5" stroke={BRAND} strokeWidth={2.8} strokeLinecap="round" />
          </g>
          <line x1={250} y1={ground - 98} x2={250} y2={ground - 6} stroke={GO} strokeWidth={1.8} strokeDasharray="5 4" />
          <text x={262} y={ground - 50} fontSize={13} fontWeight={800} fill={GO}>
            500&apos; AGL minimum
          </text>
          <text x={250} y={40} textAnchor="middle" fontSize={12} fontWeight={800} fill={NAVY}>
            OTHER THAN CONGESTED
          </text>
          <text x={250} y={272} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
            Over open water or sparsely populated areas: no closer than 500&apos; to any
            person, vessel, vehicle or structure
          </text>
        </>
      )}

      {setting === "congested" && (
        <text x={250} y={272} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          Highest obstacle within a 2,000&apos; horizontal radius of the aircraft
        </text>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Signature FR&R components                                           */
/* ------------------------------------------------------------------ */

/**
 * A branching decision path — the shape most FR&R rules actually have.
 * Nodes are supplied as props so one component serves every rule.
 */
export function DecisionTree(p: DiagramProps) {
  const question = str(p.question, "Is the condition met?");
  const yes = str(p.yes, "Yes");
  const no = str(p.no, "No");
  const yesLabel = str(p.yesLabel, "YES");
  const noLabel = str(p.noLabel, "NO");
  const chosen = str<"yes" | "no" | "none">(p.chosen, "none");

  return (
    <Diagram title="Decision path">
      <ArrowDefs colors={{ y: GO, n: CAUTION }} />

      <g>
        <rect x={110} y={40} width={280} height={54} rx={12} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2} />
        <foreignObject x={122} y={48} width={256} height={40}>
          <div style={{ fontSize: "12px", fontWeight: 750, lineHeight: 1.3, textAlign: "center", color: "var(--color-navy)" }}>
            {question}
          </div>
        </foreignObject>
      </g>

      <path d="M200 94 L140 138" stroke={GO} strokeWidth={2.2} markerEnd="url(#arrow-y)" opacity={chosen === "no" ? 0.3 : 1} />
      <path d="M300 94 L360 138" stroke={CAUTION} strokeWidth={2.2} markerEnd="url(#arrow-n)" opacity={chosen === "yes" ? 0.3 : 1} />

      <text x={158} y={118} fontSize={10.5} fontWeight={800} fill={GO} opacity={chosen === "no" ? 0.3 : 1}>
        {yesLabel}
      </text>
      <text x={318} y={118} fontSize={10.5} fontWeight={800} fill={CAUTION} opacity={chosen === "yes" ? 0.3 : 1}>
        {noLabel}
      </text>

      <g opacity={chosen === "no" ? 0.3 : 1}>
        <rect x={24} y={146} width={212} height={82} rx={12} fill="color-mix(in srgb, var(--color-go) 12%, transparent)" stroke={GO} strokeWidth={chosen === "yes" ? 2.4 : 1.7} />
        <foreignObject x={36} y={158} width={188} height={62}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, lineHeight: 1.35, textAlign: "center", color: "var(--color-navy)" }}>
            {yes}
          </div>
        </foreignObject>
      </g>

      <g opacity={chosen === "yes" ? 0.3 : 1}>
        <rect x={264} y={146} width={212} height={82} rx={12} fill="color-mix(in srgb, var(--color-caution) 12%, transparent)" stroke={CAUTION} strokeWidth={chosen === "no" ? 2.4 : 1.7} />
        <foreignObject x={276} y={158} width={188} height={62}>
          <div style={{ fontSize: "11.5px", fontWeight: 700, lineHeight: 1.35, textAlign: "center", color: "var(--color-navy)" }}>
            {no}
          </div>
        </foreignObject>
      </g>
    </Diagram>
  );
}

/** Weather brief void time — two clocks, the earlier one wins. */
export function BriefVoidClock(p: DiagramProps) {
  const etdMinutes = num(p.etd, 120);

  // Both clocks start at the brief. The brief dies at whichever fires first.
  const briefPlus3 = 180;
  const etdPlus30 = etdMinutes + 30;
  const voidAt = Math.min(briefPlus3, etdPlus30);
  const scale = 260 / 260;
  const x = (m: number) => 70 + Math.min(m, 260) * scale;

  return (
    <Diagram title="DD-175-1 weather brief void time">
      <line x1={70} y1={150} x2={440} y2={150} stroke={MUTED} strokeWidth={2} />

      {/* Brief */}
      <circle cx={x(0)} cy={150} r={6} fill={NAVY} />
      <text x={x(0)} y={176} textAnchor="middle" fontSize={10} fontWeight={800} fill={NAVY}>
        BRIEF
      </text>

      {/* ETD */}
      <circle cx={x(etdMinutes)} cy={150} r={5} fill={BRAND} />
      <text x={x(etdMinutes)} y={176} textAnchor="middle" fontSize={10} fontWeight={750} fill={BRAND}>
        ETD
      </text>

      {/* Brief + 3 hours */}
      <line x1={x(briefPlus3)} y1={118} x2={x(briefPlus3)} y2={150} stroke={CAUTION} strokeWidth={2} strokeDasharray="4 3" />
      <text x={x(briefPlus3)} y={110} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={CAUTION}>
        brief + 3 hr
      </text>

      {/* ETD + 30 */}
      <line x1={x(etdPlus30)} y1={150} x2={x(etdPlus30)} y2={196} stroke={NOGO} strokeWidth={2} strokeDasharray="4 3" />
      <text x={x(etdPlus30)} y={212} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={NOGO}>
        ETD + 30 min
      </text>

      {/* Valid window */}
      <rect x={x(0)} y={142} width={x(voidAt) - x(0)} height={16} fill="color-mix(in srgb, var(--color-go) 30%, transparent)" />

      <g transform="translate(250 62)">
        <rect x={-158} y={-24} width={316} height={44} rx={11} fill="var(--color-surface-2)" />
        <text x={0} y={4} textAnchor="middle" fontSize={12} fontWeight={800} fill={NAVY}>
          Void at{" "}
          <tspan fill={voidAt === briefPlus3 ? CAUTION : NOGO}>
            {voidAt === briefPlus3 ? "brief + 3 hours" : "ETD + 30 minutes"}
          </tspan>
        </text>
      </g>

      <text x={250} y={252} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Two clocks run against the brief — the EARLIER one voids it
      </text>
    </Diagram>
  );
}
