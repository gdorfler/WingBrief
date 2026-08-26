"use client";

/**
 * Engines diagrams.
 *
 * The Aerodynamics set draws air moving over a wing; this set draws air being
 * worked on inside a machine. The recurring motif is the engine cutaway with
 * its five stations, so a student sees the same silhouette in the lesson, the
 * explainer, the lab and the exam, and learns to locate any fact on it.
 *
 * Everything stated here comes from the engines lectures or the condensed notes.
 * Where the sources give a direction but no number, the drawing shows the
 * direction only.
 */

import {
  Arrow,
  ArrowDefs,
  Axes,
  Curve,
  Diagram,
  type DiagramProps,
  Marker,
  RegionLabel,
  bool,
  curvePath,
  makePlot,
  px,
  num,
  str,
} from "./primitives";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";
const HOT = "var(--color-nogo)";

/* ------------------------------------------------------------------ */
/* The shared engine silhouette                                        */
/* ------------------------------------------------------------------ */

export type Station = "inlet" | "compressor" | "burner" | "turbine" | "exhaust";

export const STATIONS: Station[] = [
  "inlet",
  "compressor",
  "burner",
  "turbine",
  "exhaust",
];

export const STATION_LABEL: Record<Station, string> = {
  inlet: "Inlet",
  compressor: "Compressor",
  burner: "Combustion",
  turbine: "Turbine",
  exhaust: "Exhaust",
};

/** Horizontal extent of each station in the shared 500-wide cutaway. */
const SPAN: Record<Station, [number, number]> = {
  inlet: [40, 130],
  compressor: [130, 236],
  burner: [236, 312],
  turbine: [312, 384],
  exhaust: [384, 468],
};

/**
 * Outer casing profile. The waist at the burner is what makes the shape read
 * as an engine rather than a tube, and it matches the real reduction in
 * annulus area as pressure peaks at the diffuser.
 */
function casingPath(cy: number): string {
  return [
    `M40 ${cy - 30}`,
    `L130 ${cy - 44}`,
    `L236 ${cy - 40}`,
    `L312 ${cy - 34}`,
    `L384 ${cy - 36}`,
    `L468 ${cy - 46}`,
    `L468 ${cy + 46}`,
    `L384 ${cy + 36}`,
    `L312 ${cy + 34}`,
    `L236 ${cy + 40}`,
    `L130 ${cy + 44}`,
    `L40 ${cy + 30}`,
    "Z",
  ].join(" ");
}

function stationFill(station: Station, active: boolean): string {
  if (!active) return "transparent";
  switch (station) {
    case "burner":
      return "color-mix(in srgb, var(--color-nogo) 16%, transparent)";
    case "turbine":
      return "color-mix(in srgb, var(--color-caution) 18%, transparent)";
    case "exhaust":
      return "color-mix(in srgb, var(--color-caution) 10%, transparent)";
    default:
      return "color-mix(in srgb, var(--color-brand) 14%, transparent)";
  }
}

/** Compressor blade rows: alternating rotor and stator, drawn to scale. */
function bladeRows(cy: number, x0: number, x1: number, count: number) {
  const step = (x1 - x0) / (count + 1);
  return Array.from({ length: count }, (_, i) => {
    const x = x0 + step * (i + 1);
    // Blades shorten aft as the annulus narrows and pressure climbs.
    const h = 30 - (i / Math.max(1, count - 1)) * 12;
    return { x, h, rotor: i % 2 === 0 };
  });
}

/**
 * The engine cutaway every Engines screen is built on.
 *
 * `highlight` dims everything but one station, which is how the lesson walks
 * the student along the gas path one section at a time.
 */
export function EngineCutaway(p: DiagramProps) {
  const highlight = str<Station | "none" | "all">(p.highlight, "none");
  const labels = bool(p.labels, true);
  const showFlow = bool(p.flow, true);
  const cy = 150;

  const lit = (s: Station) => highlight === "all" || highlight === s;
  const dim = (s: Station) => (highlight === "none" || lit(s) ? 1 : 0.28);

  return (
    <Diagram originY={74} height={162} title="Gas turbine engine cutaway">
      <ArrowDefs colors={{ air: BRAND, hot: HOT, shaft: MUTED }} />

      <path d={casingPath(cy)} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.4} />

      {/* Station tints */}
      {STATIONS.map((s) => {
        const [x0, x1] = SPAN[s];
        return (
          <rect
            key={s}
            x={x0}
            y={cy - 46}
            width={x1 - x0}
            height={92}
            fill={stationFill(s, lit(s))}
          />
        );
      })}

      {/* Station dividers */}
      {STATIONS.slice(1).map((s) => (
        <line
          key={s}
          x1={SPAN[s][0]}
          y1={cy - 42}
          x2={SPAN[s][0]}
          y2={cy + 42}
          stroke={MUTED}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}

      {/* Shaft */}
      <rect x={112} y={cy - 5} width={286} height={10} rx={5} fill={MUTED} opacity={0.45} />

      {/* Compressor blades */}
      <g opacity={dim("compressor")}>
        {bladeRows(cy, SPAN.compressor[0] + 4, SPAN.compressor[1] - 6, 8).map((b, i) => (
          <g key={i}>
            <rect
              x={b.x - 2}
              y={cy - b.h}
              width={4}
              height={b.h - 5}
              rx={1.6}
              fill={b.rotor ? BRAND : MUTED}
              opacity={b.rotor ? 0.95 : 0.6}
            />
            <rect
              x={b.x - 2}
              y={cy + 5}
              width={4}
              height={b.h - 5}
              rx={1.6}
              fill={b.rotor ? BRAND : MUTED}
              opacity={b.rotor ? 0.95 : 0.6}
            />
          </g>
        ))}
      </g>

      {/* Burner can with flame */}
      <g opacity={dim("burner")}>
        <path
          d={`M${SPAN.burner[0] + 8} ${cy - 28} L${SPAN.burner[1] - 6} ${cy - 22} L${SPAN.burner[1] - 6} ${cy - 8} L${SPAN.burner[0] + 8} ${cy - 12} Z`}
          fill="var(--color-surface)"
          stroke={NAVY}
          strokeWidth={1.6}
        />
        <path
          d={`M${SPAN.burner[0] + 8} ${cy + 28} L${SPAN.burner[1] - 6} ${cy + 22} L${SPAN.burner[1] - 6} ${cy + 8} L${SPAN.burner[0] + 8} ${cy + 12} Z`}
          fill="var(--color-surface)"
          stroke={NAVY}
          strokeWidth={1.6}
        />
        {[-1, 1].map((sign) => (
          <path
            key={sign}
            d={`M${SPAN.burner[0] + 16} ${cy + sign * 20} q18 ${sign * -6} 34 0 q-14 ${sign * 5} -34 0 Z`}
            fill={HOT}
            opacity={0.75}
          />
        ))}
      </g>

      {/* Turbine blades — fewer, larger, hot */}
      <g opacity={dim("turbine")}>
        {bladeRows(cy, SPAN.turbine[0] + 6, SPAN.turbine[1] - 6, 4).map((b, i) => (
          <g key={i}>
            <rect x={b.x - 2.6} y={cy - 30} width={5.2} height={25} rx={2} fill={CAUTION} />
            <rect x={b.x - 2.6} y={cy + 5} width={5.2} height={25} rx={2} fill={CAUTION} />
          </g>
        ))}
      </g>

      {/* Exhaust cone */}
      <g opacity={dim("exhaust")}>
        <path
          d={`M${SPAN.exhaust[0]} ${cy - 14} L${SPAN.exhaust[1] - 14} ${cy - 4} L${SPAN.exhaust[1] - 14} ${cy + 4} L${SPAN.exhaust[0]} ${cy + 14} Z`}
          fill={MUTED}
          opacity={0.5}
        />
      </g>

      {/* Airflow: cool in, hot out */}
      {showFlow && (
        <g>
          {[-16, 0, 16].map((dy, i) => (
            <path
              key={`in${dy}`}
              d={`M6 ${cy + dy} L${SPAN.compressor[0] - 4} ${cy + dy * 0.8}`}
              stroke={BRAND}
              strokeWidth={2}
              fill="none"
              className="flow-line"
              style={{ animationDelay: `${i * 0.16}s` }}
            />
          ))}
          {[-10, 0, 10].map((dy, i) => (
            <path
              key={`out${dy}`}
              d={`M${SPAN.exhaust[1] - 10} ${cy + dy} L496 ${cy + dy * 1.5}`}
              stroke={HOT}
              strokeWidth={2.2}
              fill="none"
              className="flow-line"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </g>
      )}

      {labels && (
        <g>
          {STATIONS.map((s) => {
            const [x0, x1] = SPAN[s];
            return (
              <text
                key={s}
                x={(x0 + x1) / 2}
                y={cy + 68}
                textAnchor="middle"
                fontSize={10}
                fontWeight={750}
                fill={lit(s) || highlight === "none" ? NAVY : MUTED}
                opacity={dim(s)}
              >
                {STATION_LABEL[s]}
              </text>
            );
          })}
          <text x={24} y={cy - 44} fontSize={10} fontWeight={700} fill={BRAND}>
            Cool air in
          </text>
          <text x={476} y={cy - 52} textAnchor="end" fontSize={10} fontWeight={700} fill={HOT}>
            Hot gas out
          </text>
        </g>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Station-by-station property changes                                 */
/* ------------------------------------------------------------------ */

/** Direction of travel for one property across one station. */
type Dir = "up" | "down" | "slightDown" | "flat";

/**
 * The per-station changes, verbatim from slide 28 "Thrust
 * Development". Combustion's slight pressure DROP is the detail the exam
 * reaches for, so it gets its own direction rather than being rounded to flat.
 */
export const STATION_CHANGES: Record<
  Station,
  { pressure: Dir; temperature: Dir; velocity: Dir }
> = {
  inlet: { pressure: "up", temperature: "flat", velocity: "down" },
  compressor: { pressure: "up", temperature: "up", velocity: "up" },
  burner: { pressure: "slightDown", temperature: "up", velocity: "up" },
  turbine: { pressure: "down", temperature: "down", velocity: "up" },
  exhaust: { pressure: "down", temperature: "down", velocity: "up" },
};

const DIR_GLYPH: Record<Dir, string> = {
  up: "▲",
  down: "▼",
  slightDown: "▽",
  flat: "—",
};

const DIR_COLOR: Record<Dir, string> = {
  up: "var(--color-go)",
  down: "var(--color-nogo)",
  slightDown: "var(--color-caution)",
  flat: "var(--color-navy-faint)",
};

export function StationChanges(p: DiagramProps) {
  const highlight = str<Station | "none">(p.highlight, "none");
  const rows: { key: keyof (typeof STATION_CHANGES)["inlet"]; label: string }[] = [
    { key: "pressure", label: "Pressure" },
    { key: "temperature", label: "Temp" },
    { key: "velocity", label: "Velocity" },
  ];
  const colW = 78;
  const x0 = 96;

  return (
    <Diagram title="Pressure, temperature and velocity through the engine">
      {STATIONS.map((s, i) => {
        const on = highlight === "none" || highlight === s;
        return (
          <g key={s} opacity={on ? 1 : 0.3}>
            <rect
              x={x0 + i * colW - colW / 2 + 4}
              y={34}
              width={colW - 8}
              height={196}
              rx={10}
              fill={highlight === s ? "color-mix(in srgb, var(--color-brand) 10%, transparent)" : "transparent"}
            />
            <text
              x={x0 + i * colW}
              y={50}
              textAnchor="middle"
              fontSize={9.5}
              fontWeight={800}
              fill={NAVY}
            >
              {STATION_LABEL[s].toUpperCase()}
            </text>
          </g>
        );
      })}

      {rows.map((row, r) => {
        const y = 96 + r * 48;
        return (
          <g key={row.key}>
            <text x={80} y={y + 4} textAnchor="end" fontSize={11} fontWeight={700} fill={MUTED}>
              {row.label}
            </text>
            <line x1={88} y1={y - 18} x2={470} y2={y - 18} className="grid" />
            {STATIONS.map((s, i) => {
              const dir = STATION_CHANGES[s][row.key];
              const on = highlight === "none" || highlight === s;
              return (
                <text
                  key={s}
                  x={x0 + i * colW}
                  y={y + 6}
                  textAnchor="middle"
                  fontSize={17}
                  fill={DIR_COLOR[dir]}
                  opacity={on ? 1 : 0.3}
                >
                  {DIR_GLYPH[dir]}
                </text>
              );
            })}
          </g>
        );
      })}

      <text x={250} y={252} textAnchor="middle" fontSize={10} fontWeight={650} fill={MUTED}>
        ▽ = slight decrease · combustion trades pressure for temperature and velocity
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Ducts: the subsonic / supersonic reversal                           */
/* ------------------------------------------------------------------ */

/**
 * A convergent or divergent duct annotated with what velocity and pressure do.
 * One component covers all four cases because the whole teaching point is that
 * the same shape does opposite things either side of Mach 1.
 */
export function DuctFlow(p: DiagramProps) {
  const shape = str<"convergent" | "divergent">(p.shape, "convergent");
  const regime = str<"subsonic" | "supersonic">(p.regime, "subsonic");
  const labels = bool(p.labels, true);
  const cy = 148;

  const convergent = shape === "convergent";
  const inH = convergent ? 62 : 26;
  const outH = convergent ? 26 : 62;

  // Subsonic follows Bernoulli; supersonic inverts it.
  const velocityUp = regime === "subsonic" ? convergent : !convergent;
  const vDir = velocityUp ? "increases" : "decreases";
  const pDir = velocityUp ? "decreases" : "increases";
  const acts = velocityUp ? "NOZZLE" : "DIFFUSER";

  const top = `M110 ${cy - inH} L390 ${cy - outH}`;
  const bottom = `M110 ${cy + inH} L390 ${cy + outH}`;

  return (
    <Diagram title={`${regime} flow through a ${shape} duct`}>
      <ArrowDefs colors={{ f: BRAND }} />

      <path
        d={`${top} L390 ${cy + outH} L110 ${cy + inH} Z`}
        fill="var(--color-surface-2)"
        opacity={0.7}
      />
      <path d={top} stroke={NAVY} strokeWidth={2.6} fill="none" />
      <path d={bottom} stroke={NAVY} strokeWidth={2.6} fill="none" />

      {[-0.55, 0, 0.55].map((f, i) => (
        <path
          key={i}
          d={`M96 ${cy + f * inH} L404 ${cy + f * outH}`}
          stroke={BRAND}
          strokeWidth={1.8}
          fill="none"
          opacity={0.55}
          className="flow-line"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}

      <Arrow x1={40} y1={cy} x2={92} y2={cy} color={BRAND} id="f" width={3} />

      {labels && (
        <>
          <RegionLabel
            x={250}
            y={40}
            text={`${regime.toUpperCase()} · ${shape.toUpperCase()} · acts as a ${acts}`}
            color={NAVY}
            bg="var(--color-surface-2)"
          />
          <g transform={`translate(250 ${cy + 96})`}>
            <text x={-70} y={0} textAnchor="middle" fontSize={11.5} fontWeight={750} fill={velocityUp ? GO : NOGO}>
              Velocity {vDir}
            </text>
            <text x={70} y={0} textAnchor="middle" fontSize={11.5} fontWeight={750} fill={velocityUp ? NOGO : GO}>
              Pressure {pDir}
            </text>
          </g>
        </>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Bernoulli split                                                     */
/* ------------------------------------------------------------------ */

/** Static + dynamic = total, as a stacked bar the student can push around. */
export function PressureSplit(p: DiagramProps) {
  const dynamicFraction = Math.min(0.85, Math.max(0.05, num(p.dynamic, 0.35)));
  const staticFraction = 1 - dynamicFraction;
  const barX = 90;
  const barW = 320;
  const y = 118;

  return (
    <Diagram title="Total pressure is static plus dynamic">
      <text x={250} y={44} textAnchor="middle" fontSize={12} fontWeight={750} fill={NAVY}>
        Total pressure stays the same
      </text>

      <rect x={barX} y={y} width={barW} height={46} rx={8} fill="var(--color-surface-2)" stroke={MUTED} strokeWidth={1.2} />
      <rect
        x={barX}
        y={y}
        width={barW * staticFraction}
        height={46}
        rx={8}
        fill={BRAND}
        opacity={0.85}
      />
      <rect
        x={barX + barW * staticFraction}
        y={y}
        width={barW * dynamicFraction}
        height={46}
        fill={CAUTION}
        opacity={0.9}
      />

      <text
        x={barX + (barW * staticFraction) / 2}
        y={y + 29}
        textAnchor="middle"
        fontSize={11.5}
        fontWeight={800}
        fill="#fff"
      >
        {staticFraction > 0.22 ? "STATIC (pressure)" : "STATIC"}
      </text>
      <text
        x={barX + barW * staticFraction + (barW * dynamicFraction) / 2}
        y={y + 29}
        textAnchor="middle"
        fontSize={11.5}
        fontWeight={800}
        fill="#fff"
      >
        {dynamicFraction > 0.24 ? "DYNAMIC (velocity)" : "DYN"}
      </text>

      <line x1={barX} y1={y - 12} x2={barX + barW} y2={y - 12} stroke={NAVY} strokeWidth={1.4} />
      <line x1={barX} y1={y - 17} x2={barX} y2={y - 7} stroke={NAVY} strokeWidth={1.4} />
      <line x1={barX + barW} y1={y - 17} x2={barX + barW} y2={y - 7} stroke={NAVY} strokeWidth={1.4} />

      <text x={250} y={214} textAnchor="middle" fontSize={11} fontWeight={700} fill={MUTED}>
        Squeeze one side and the other grows to match
      </text>
      <text x={250} y={236} textAnchor="middle" fontSize={10.5} fill={MUTED}>
        Inside the engine: &ldquo;pressure&rdquo; means static, &ldquo;velocity&rdquo; means dynamic
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Cycles                                                              */
/* ------------------------------------------------------------------ */

/** Brayton (simultaneous) versus Otto (sequential) — the only real difference. */
export function CycleCompare(p: DiagramProps) {
  const cycle = str<"brayton" | "otto" | "both">(p.cycle, "both");
  const events = ["Intake", "Compression", "Combustion", "Exhaust"];
  const showBrayton = cycle === "brayton" || cycle === "both";
  const showOtto = cycle === "otto" || cycle === "both";

  // One cycle drawn takes a little over half the height of two, so a fixed
  // crop either clips the pair or leaves the single one floating in space.
  const crop =
    cycle === "both"
      ? { y: 32, h: 190 }
      : cycle === "brayton"
        ? { y: 32, h: 122 }
        : { y: 62, h: 116 };

  return (
    <Diagram
      originX={34}
      width={430}
      originY={crop.y}
      height={crop.h}
      title="Brayton and Otto cycles"
    >
      {showBrayton && (
        <g>
          <text x={44} y={54} fontSize={11.5} fontWeight={800} fill={BRAND}>
            BRAYTON · gas turbine
          </text>
          <text x={44} y={70} fontSize={10} fill={MUTED}>
            all four happen at once, continuously
          </text>
          {events.map((e, i) => (
            <g key={e}>
              <rect
                x={44 + i * 104}
                y={84}
                width={94}
                height={34}
                rx={9}
                fill="color-mix(in srgb, var(--color-brand) 14%, transparent)"
                stroke={BRAND}
                strokeWidth={1.4}
              />
              <text x={91 + i * 104} y={105} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={NAVY}>
                {e}
              </text>
            </g>
          ))}
          <rect x={40} y={78} width={418} height={46} rx={12} fill="none" stroke={BRAND} strokeWidth={1.6} strokeDasharray="5 4" />
          <text x={250} y={140} textAnchor="middle" fontSize={10} fontWeight={700} fill={BRAND}>
            simultaneous
          </text>
        </g>
      )}

      {showOtto && (
        <g transform={showBrayton ? "translate(0 82)" : "translate(0 30)"}>
          <text x={44} y={54} fontSize={11.5} fontWeight={800} fill={CAUTION}>
            OTTO · reciprocating
          </text>
          <text x={44} y={70} fontSize={10} fill={MUTED}>
            one after another — suck, squeeze, bang, blow
          </text>
          {events.map((e, i) => (
            <g key={e}>
              <rect
                x={44 + i * 104}
                y={84}
                width={94}
                height={34}
                rx={9}
                fill="color-mix(in srgb, var(--color-caution) 16%, transparent)"
                stroke={CAUTION}
                strokeWidth={1.4}
              />
              <text x={91 + i * 104} y={105} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={NAVY}>
                {e}
              </text>
              {i < events.length - 1 && (
                <text x={143 + i * 104} y={105} textAnchor="middle" fontSize={13} fill={CAUTION}>
                  ›
                </text>
              )}
            </g>
          ))}
        </g>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Thrust factors                                                      */
/* ------------------------------------------------------------------ */

/**
 * Thrust against one chosen factor, drawn as an indexed curve. The sources
 * give directions and one break point (36,000 ft), never a thrust table, so
 * the y-axis is deliberately relative.
 */
export function ThrustFactor(p: DiagramProps) {
  const factor = str<"temperature" | "altitude" | "rpm" | "airspeed">(p.factor, "rpm");
  const marker = num(p.marker, NaN);

  const config = {
    temperature: {
      xLabel: "Outside air temperature →",
      xMin: -40,
      xMax: 45,
      // Colder air is denser, so thrust falls as temperature rises.
      f: (t: number) => 1.22 - (t + 40) * 0.0045,
      note: "Colder air is denser · thrust ↑ as temperature ↓",
      color: BRAND,
    },
    altitude: {
      xLabel: "Altitude, thousands of feet →",
      xMin: 0,
      xMax: 50,
      // Pressure loss dominates; above 36,000 ft temperature stops helping.
      f: (a: number) => (a <= 36 ? 1 - a * 0.0165 : 1 - 36 * 0.0165 - (a - 36) * 0.031),
      note: "Above 36,000 ft temperature stabilises · thrust falls off faster",
      color: CAUTION,
    },
    rpm: {
      xLabel: "Engine RPM, percent →",
      xMin: 30,
      xMax: 100,
      // Little thrust down low, a lot up high.
      f: (r: number) => Math.pow((r - 28) / 72, 2.1),
      note: "Not linear · most thrust lives at the top of the RPM range",
      color: GO,
    },
    airspeed: {
      xLabel: "Airspeed →",
      xMin: 0,
      xMax: 100,
      // Inlet velocity approaching exhaust velocity erodes thrust.
      f: (v: number) => 1 - v * 0.006,
      note: "Inlet velocity approaches exhaust velocity · thrust ↓",
      color: NOGO,
    },
  }[factor];

  const plot = makePlot({
    left: 62,
    right: 30,
    top: 44,
    bottom: 74,
    xMin: config.xMin,
    xMax: config.xMax,
    yMin: 0,
    yMax: 1.3,
  });

  return (
    <Diagram title={`Thrust versus ${factor}`}>
      <Axes plot={plot} xLabel={config.xLabel} yLabel="Thrust (relative)" xTicks={4} yTicks={3} />
      <Curve
        d={curvePath(plot, config.f, { from: config.xMin, to: config.xMax })}
        color={config.color}
        width={3}
      />

      {factor === "altitude" && (
        <g>
          <line
            x1={plot.sx(36)}
            y1={plot.y1}
            x2={plot.sx(36)}
            y2={plot.y0}
            stroke={NOGO}
            strokeWidth={1.6}
            strokeDasharray="5 4"
          />
          <text x={plot.sx(36) + 6} y={plot.y1 + 16} fontSize={10} fontWeight={750} fill={NOGO}>
            36,000 ft
          </text>
        </g>
      )}

      {Number.isFinite(marker) && (
        <Marker
          x={plot.sx(marker)}
          y={plot.sy(config.f(marker))}
          color={config.color}
          side="top"
        />
      )}

      <text x={250} y={262} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        {config.note}
      </text>
      <text x={250} y={280} textAnchor="middle" fontSize={9.5} fill={MUTED}>
        Relative scale — the sources give directions, not a thrust table
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Compressors                                                         */
/* ------------------------------------------------------------------ */

/** Centrifugal: impeller flings air out, diffuser converts speed to pressure. */
export function CentrifugalCompressor(p: DiagramProps) {
  const labels = bool(p.labels, true);
  const cx = 190;
  const cy = 150;

  return (
    <Diagram title="Centrifugal flow compressor">
      <ArrowDefs colors={{ air: BRAND, out: GO }} />

      <circle cx={cx} cy={cy} r={78} fill="var(--color-surface-2)" stroke={MUTED} strokeWidth={1.4} />
      <circle cx={cx} cy={cy} r={54} fill="var(--color-surface)" stroke={NAVY} strokeWidth={2} />

      {/* Impeller vanes */}
      {Array.from({ length: 9 }, (_, i) => {
        const a0 = (i / 9) * Math.PI * 2;
        const r0 = 14;
        const r1 = 52;
        const curl = 0.55;
        const x0 = px(cx + Math.cos(a0) * r0);
        const y0 = px(cy + Math.sin(a0) * r0);
        const x1 = px(cx + Math.cos(a0 + curl) * r1);
        const y1 = px(cy + Math.sin(a0 + curl) * r1);
        const xc = px(cx + Math.cos(a0 + curl * 0.35) * (r1 * 0.72));
        const yc = px(cy + Math.sin(a0 + curl * 0.35) * (r1 * 0.72));
        return (
          <path
            key={i}
            d={`M${x0} ${y0} Q${xc} ${yc} ${x1} ${y1}`}
            stroke={BRAND}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={13} fill={NAVY} />

      {/* Diffuser vanes in the surrounding ring */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + 0.26;
        return (
          <line
            key={i}
            x1={px(cx + Math.cos(a) * 58)}
            y1={px(cy + Math.sin(a) * 58)}
            x2={px(cx + Math.cos(a + 0.3) * 76)}
            y2={px(cy + Math.sin(a + 0.3) * 76)}
            stroke={GO}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        );
      })}

      <Arrow x1={cx} y1={cy - 118} x2={cx} y2={cy - 88} color={BRAND} id="air" width={3} />
      <Arrow x1={cx + 92} y1={cy} x2={cx + 140} y2={cy} color={GO} id="out" width={3} />

      {labels && (
        <g>
          <text x={cx} y={cy - 126} textAnchor="middle" fontSize={10.5} fontWeight={750} fill={BRAND}>
            Air in
          </text>
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#fff">
            HUB
          </text>
          <text x={330} y={104} fontSize={11} fontWeight={750} fill={BRAND}>
            Impeller
          </text>
          <text x={330} y={120} fontSize={9.5} fill={MUTED}>
            velocity ↑
          </text>
          <text x={330} y={146} fontSize={11} fontWeight={750} fill={GO}>
            Diffuser
          </text>
          <text x={330} y={162} fontSize={9.5} fill={MUTED}>
            pressure ↑
          </text>
          <text x={330} y={188} fontSize={11} fontWeight={750} fill={NAVY}>
            Manifold
          </text>
          <text x={330} y={204} fontSize={9.5} fill={MUTED}>
            routes to burner
          </text>
        </g>
      )}
    </Diagram>
  );
}

/** Axial: rotor/stator pairs, one pair per stage. */
export function AxialCompressor(p: DiagramProps) {
  const stages = Math.max(2, Math.min(8, Math.round(num(p.stages, 5))));
  const labels = bool(p.labels, true);
  const cy = 148;
  const x0 = 66;
  const x1 = 434;
  const step = (x1 - x0) / (stages * 2);

  return (
    <Diagram title="Axial flow compressor stages">
      <ArrowDefs colors={{ air: BRAND }} />

      <path
        d={`M${x0 - 20} ${cy - 54} L${x1 + 16} ${cy - 30} L${x1 + 16} ${cy + 30} L${x0 - 20} ${cy + 54} Z`}
        fill="var(--color-surface-2)"
        stroke={NAVY}
        strokeWidth={2}
      />
      <rect x={x0 - 16} y={cy - 6} width={x1 - x0 + 30} height={12} rx={6} fill={MUTED} opacity={0.4} />

      {Array.from({ length: stages * 2 }, (_, i) => {
        const x = x0 + step * (i + 0.5);
        const rotor = i % 2 === 0;
        const frac = i / (stages * 2 - 1);
        const h = 44 - frac * 16;
        return (
          <g key={i}>
            <rect x={x - 3} y={cy - h} width={6} height={h - 7} rx={2.4} fill={rotor ? BRAND : MUTED} opacity={rotor ? 1 : 0.62} />
            <rect x={x - 3} y={cy + 7} width={6} height={h - 7} rx={2.4} fill={rotor ? BRAND : MUTED} opacity={rotor ? 1 : 0.62} />
          </g>
        );
      })}

      {[-24, 0, 24].map((dy, i) => (
        <path
          key={dy}
          d={`M20 ${cy + dy} L${x1 + 30} ${cy + dy * 0.55}`}
          stroke={BRAND}
          strokeWidth={1.6}
          fill="none"
          opacity={0.4}
          className="flow-line"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}

      {labels && (
        <g>
          <rect x={x0 - 2} y={cy - 78} width={step * 2} height={17} rx={8} fill="color-mix(in srgb, var(--color-brand) 16%, transparent)" />
          <text x={x0 - 2 + step} y={cy - 66} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={NAVY}>
            1 STAGE
          </text>
          {step >= 40 && (
            <>
              <text x={x0 + step * 0.5} y={cy + 78} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={BRAND}>
                rotor
              </text>
              <text x={x0 + step * 1.5} y={cy + 78} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
                stator
              </text>
            </>
          )}
          <text x={250} y={264} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
            Rotor: velocity and pressure ↑ · Stator: velocity ↓, pressure ↑, flow straightened
          </text>
          <text x={250} y={282} textAnchor="middle" fontSize={10} fill={MUTED}>
            {stages} stages · one rotor + one stator = one stage
          </text>
        </g>
      )}
    </Diagram>
  );
}

/** Dual spool layout: LPC → HPC → HPT → LPT, forward to aft. */
export function SpoolLayout(p: DiagramProps) {
  const dual = bool(p.dual, true);
  const cy = 150;

  const parts = dual
    ? [
        { x: 70, w: 78, label: "LPC", color: BRAND },
        { x: 156, w: 78, label: "HPC", color: BRAND },
        { x: 244, w: 62, label: "Burner", color: NOGO },
        { x: 314, w: 62, label: "HPT", color: CAUTION },
        { x: 384, w: 62, label: "LPT", color: CAUTION },
      ]
    : [
        { x: 92, w: 132, label: "Compressor", color: BRAND },
        { x: 234, w: 66, label: "Burner", color: NOGO },
        { x: 310, w: 122, label: "Turbine", color: CAUTION },
      ];

  return (
    <Diagram title={dual ? "Dual spool arrangement" : "Single spool arrangement"}>
      {/* Shafts: inner drives LP, outer drives HP */}
      {dual ? (
        <>
          <rect x={100} y={cy + 30} width={316} height={7} rx={3.5} fill={BRAND} opacity={0.5} />
          <rect x={186} y={cy + 42} width={158} height={7} rx={3.5} fill={CAUTION} opacity={0.6} />
          <text x={110} y={cy + 66} fontSize={9.5} fontWeight={750} fill={BRAND}>
            LP shaft: LPT drives LPC
          </text>
          <text x={300} y={cy + 66} fontSize={9.5} fontWeight={750} fill={CAUTION}>
            HP shaft
          </text>
        </>
      ) : (
        <>
          <rect x={120} y={cy + 32} width={280} height={8} rx={4} fill={MUTED} opacity={0.5} />
          <text x={250} y={cy + 60} textAnchor="middle" fontSize={10} fontWeight={750} fill={MUTED}>
            One turbine drives one compressor
          </text>
        </>
      )}

      {parts.map((part) => (
        <g key={part.label}>
          <rect
            x={part.x}
            y={cy - 44}
            width={part.w}
            height={64}
            rx={9}
            fill={`color-mix(in srgb, ${part.color} 15%, transparent)`}
            stroke={part.color}
            strokeWidth={1.8}
          />
          <text
            x={part.x + part.w / 2}
            y={cy - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={800}
            fill={NAVY}
          >
            {part.label}
          </text>
        </g>
      ))}

      <text x={250} y={58} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Forward → aft
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Burner and turbine energy splits                                    */
/* ------------------------------------------------------------------ */

/** The 25/75 air split in the combustion chamber. */
export function BurnerAirSplit(p: DiagramProps) {
  const labels = bool(p.labels, true);
  const cy = 152;

  return (
    <Diagram title="Primary and secondary air in the burner">
      <ArrowDefs colors={{ prim: NOGO, sec: BRAND }} />

      <path
        d="M120 96 L392 104 L392 200 L120 208 Z"
        fill="var(--color-surface-2)"
        stroke={NAVY}
        strokeWidth={2}
      />
      <path
        d="M158 124 L356 130 L356 174 L158 180 Z"
        fill="var(--color-surface)"
        stroke={NAVY}
        strokeWidth={1.6}
      />

      {/* Flame in the liner */}
      <path d={`M186 ${cy} q34 -20 68 0 q-34 20 -68 0 Z`} fill={NOGO} opacity={0.7} />
      <path d={`M244 ${cy} q30 -16 60 0 q-30 16 -60 0 Z`} fill={CAUTION} opacity={0.7} />

      {/* Primary air straight into the liner */}
      {[-8, 8].map((dy) => (
        <path
          key={`p${dy}`}
          d={`M96 ${cy + dy} L178 ${cy + dy}`}
          stroke={NOGO}
          strokeWidth={2.4}
          fill="none"
          className="flow-line"
        />
      ))}
      {/* Secondary air around the outside */}
      {[-34, -26, 26, 34].map((dy, i) => (
        <path
          key={`s${dy}`}
          d={`M96 ${cy + dy * 0.7} L140 ${cy + dy} L360 ${cy + dy} L400 ${cy + dy * 0.7}`}
          stroke={BRAND}
          strokeWidth={2}
          fill="none"
          className="flow-line"
          style={{ animationDelay: `${i * 0.14}s` }}
        />
      ))}

      {labels && (
        <g>
          <rect x={20} y={112} width={62} height={34} rx={9} fill="color-mix(in srgb, var(--color-nogo) 16%, transparent)" />
          <text x={51} y={128} textAnchor="middle" fontSize={13} fontWeight={800} fill={NOGO}>
            25%
          </text>
          <text x={51} y={141} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={NOGO}>
            PRIMARY
          </text>

          <rect x={20} y={172} width={62} height={34} rx={9} fill="color-mix(in srgb, var(--color-brand) 16%, transparent)" />
          <text x={51} y={188} textAnchor="middle" fontSize={13} fontWeight={800} fill={BRAND}>
            75%
          </text>
          <text x={51} y={201} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={BRAND}>
            SECONDARY
          </text>

          <text x={256} y={238} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
            Primary burns · secondary cools the walls and turbine, controls the flame
          </text>
        </g>
      )}
    </Diagram>
  );
}

/** The 75/25 energy split at the turbine. */
export function TurbineEnergySplit() {
  const cx = 250;
  const total = 300;

  return (
    <Diagram title="Where the turbine sends its energy">
      <text x={cx} y={54} textAnchor="middle" fontSize={12} fontWeight={750} fill={NAVY}>
        Heat energy arriving at the turbine
      </text>

      <rect x={cx - total / 2} y={74} width={total} height={30} rx={7} fill={HOT} opacity={0.85} />
      <text x={cx} y={94} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">
        100%
      </text>

      <Arrow x1={cx - 80} y1={112} x2={cx - 120} y2={152} color={CAUTION} id="a" width={2.4} />
      <Arrow x1={cx + 80} y1={112} x2={cx + 120} y2={152} color={GO} id="b" width={2.4} />
      <ArrowDefs colors={{ a: CAUTION, b: GO }} />

      <g>
        <rect x={62} y={158} width={196} height={62} rx={10} fill="color-mix(in srgb, var(--color-caution) 16%, transparent)" stroke={CAUTION} strokeWidth={1.8} />
        <text x={160} y={182} textAnchor="middle" fontSize={19} fontWeight={800} fill={CAUTION}>
          75%
        </text>
        <text x={160} y={202} textAnchor="middle" fontSize={10} fontWeight={700} fill={NAVY}>
          drives compressor + accessory gear box
        </text>
      </g>

      <g>
        <rect x={280} y={158} width={158} height={62} rx={10} fill="color-mix(in srgb, var(--color-go) 16%, transparent)" stroke={GO} strokeWidth={1.8} />
        <text x={359} y={182} textAnchor="middle" fontSize={19} fontWeight={800} fill={GO}>
          25%
        </text>
        <text x={359} y={202} textAnchor="middle" fontSize={10} fontWeight={700} fill={NAVY}>
          left for thrust
        </text>
      </g>

      <text x={cx} y={250} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Most of the fire goes into keeping the engine turning
      </text>
      <text x={cx} y={268} textAnchor="middle" fontSize={9.5} fill={MUTED}>
        Do not confuse with the burner&rsquo;s 25% primary AIR split
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Compressor blade AOA and stalls                                     */
/* ------------------------------------------------------------------ */

/**
 * The compressor blade vector triangle: inlet airflow plus blade speed from
 * RPM gives the relative wind, and the angle between that and the chordline
 * is the AOA that stalls.
 */
export function BladeAoa(p: DiagramProps) {
  const inletFlow = Math.max(0.25, Math.min(1.4, num(p.inletFlow, 1)));
  const rpm = Math.max(0.4, Math.min(1.5, num(p.rpm, 1)));
  const labels = bool(p.labels, true);

  const ox = 190;
  const oy = 176;
  const axialLen = 92 * inletFlow;
  const rotLen = 92 * rpm;

  // Axial component points aft (right); blade motion component points up.
  const tipX = ox + axialLen;
  const tipY = oy - rotLen;
  const rwAngle = (Math.atan2(rotLen, axialLen) * 180) / Math.PI;
  // Blade chord is fixed; AOA is the gap between it and the relative wind.
  const chordAngle = 32;
  const aoa = rwAngle - chordAngle;
  const stalled = aoa > 18;

  return (
    <Diagram title="Compressor blade angle of attack">
      <ArrowDefs colors={{ ax: BRAND, rot: CAUTION, rw: NOGO }} />

      {/* Blade, drawn at its fixed chord angle */}
      <g transform={`translate(${ox} ${oy}) rotate(${-chordAngle})`}>
        <path
          d="M-16 0 C-6 -9 46 -12 74 -4 C46 6 -6 8 -16 0 Z"
          fill={stalled ? "color-mix(in srgb, var(--color-nogo) 22%, var(--color-surface-2))" : "var(--color-surface-2)"}
          stroke={NAVY}
          strokeWidth={2}
        />
        <line x1={-22} y1={0} x2={96} y2={0} stroke={NAVY} strokeWidth={1.4} strokeDasharray="5 4" />
      </g>

      {/* Vector triangle */}
      <Arrow x1={ox} y1={oy} x2={ox + axialLen} y2={oy} color={BRAND} id="ax" width={2.6} />
      <Arrow x1={ox + axialLen} y1={oy} x2={tipX} y2={tipY} color={CAUTION} id="rot" width={2.6} />
      <Arrow x1={ox} y1={oy} x2={tipX} y2={tipY} color={NOGO} id="rw" width={3} />

      {labels && (
        <g>
          <text x={ox + axialLen / 2} y={oy + 18} textAnchor="middle" fontSize={10} fontWeight={750} fill={BRAND}>
            inlet airflow
          </text>
          <text x={tipX + 8} y={oy - rotLen / 2} fontSize={10} fontWeight={750} fill={CAUTION}>
            blade speed (RPM)
          </text>
          <text x={ox - 6} y={oy - rotLen - 10} textAnchor="start" fontSize={10.5} fontWeight={800} fill={NOGO}>
            relative wind
          </text>
        </g>
      )}

      <g transform="translate(392 58)">
        <rect
          x={-74}
          y={-20}
          width={148}
          height={50}
          rx={11}
          fill={stalled ? "var(--color-nogo-soft)" : "var(--color-surface-2)"}
        />
        <text x={0} y={-4} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
          BLADE AOA
        </text>
        <text
          x={0}
          y={19}
          textAnchor="middle"
          fontSize={18}
          fontWeight={800}
          fill={stalled ? NOGO : NAVY}
          className="tabular"
        >
          {aoa.toFixed(0)}°
        </text>
      </g>

      {stalled && <RegionLabel x={250} y={268} text="AOA too high — compressor stall" color={NOGO} bg="var(--color-nogo-soft)" />}
      {!stalled && (
        <text x={250} y={272} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          Less inlet airflow or more RPM swings the relative wind upward
        </text>
      )}
    </Diagram>
  );
}

/** The gauge cluster a stall shows up on: RPM down, ITT up. */
export function StallIndications(p: DiagramProps) {
  const stalled = bool(p.stalled, true);

  const gauges = [
    { label: "RPM", value: stalled ? 0.62 : 0.86, dir: stalled ? "down" : "flat", color: stalled ? NOGO : GO },
    { label: "ITT", value: stalled ? 0.9 : 0.58, dir: stalled ? "up" : "flat", color: stalled ? NOGO : GO },
    { label: "TORQUE", value: stalled ? 0.5 : 0.74, dir: stalled ? "down" : "flat", color: stalled ? CAUTION : GO },
    { label: "FUEL FLOW", value: stalled ? 0.66 : 0.7, dir: stalled ? "down" : "flat", color: stalled ? CAUTION : GO },
  ];

  return (
    <Diagram title="Compressor stall indications">
      <text x={250} y={44} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={stalled ? NOGO : GO}>
        {stalled ? "STALLED — RPM decays, ITT climbs" : "Normal indications"}
      </text>

      {gauges.map((g, i) => {
        const cx = 88 + i * 108;
        const cy = 150;
        const r = 38;
        // Sweep from 135° round to 405°, the usual round-dial convention.
        const a0 = Math.PI * 0.75;
        const a1 = Math.PI * 2.25;
        const a = a0 + (a1 - a0) * g.value;
        return (
          <g key={g.label}>
            <circle cx={cx} cy={cy} r={r} fill="var(--color-surface-2)" stroke={MUTED} strokeWidth={1.4} />
            <path
              d={`M${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A${r} ${r} 0 1 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r}`}
              fill="none"
              stroke={MUTED}
              strokeWidth={2}
              opacity={0.5}
            />
            <line
              x1={cx}
              y1={cy}
              x2={cx + Math.cos(a) * (r - 8)}
              y2={cy + Math.sin(a) * (r - 8)}
              stroke={g.color}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r={4} fill={NAVY} />
            <text x={cx} y={cy + r + 18} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={NAVY}>
              {g.label}
            </text>
            {stalled && g.dir !== "flat" && (
              <text x={cx} y={cy + r + 33} textAnchor="middle" fontSize={12} fontWeight={800} fill={g.color}>
                {g.dir === "up" ? "▲" : "▼"}
              </text>
            )}
          </g>
        );
      })}

      <text x={250} y={266} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        Mild: pulsations · Severe: loud bangs, RPM decrease, ITT increase
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Engine types                                                        */
/* ------------------------------------------------------------------ */

/** Where each engine type's thrust actually comes from. */
export function EngineTypeSplit(p: DiagramProps) {
  const type = str<"turbojet" | "turbofan" | "turboprop" | "turboshaft">(p.type, "turboprop");

  const config = {
    turbojet: {
      bars: [{ label: "Exhaust jet", pct: 100, color: NOGO }],
      note: "All thrust from accelerating air through the engine",
    },
    turbofan: {
      bars: [
        { label: "Ducted fan", pct: 50, color: BRAND },
        { label: "Gas generator", pct: 50, color: NOGO },
      ],
      note: "40–70% gas generator · 30–60% ducted fan",
    },
    turboprop: {
      bars: [
        { label: "Propeller", pct: 90, color: BRAND },
        { label: "Exhaust", pct: 10, color: NOGO },
      ],
      note: "90% propeller · 10% exhaust gases",
    },
    turboshaft: {
      bars: [{ label: "Rotor", pct: 100, color: BRAND }],
      note: "All propulsive energy from rotor rotation — none from exhaust",
    },
  }[type];

  const x0 = 70;
  const w = 360;
  const y = 128;
  let cursor = x0;

  return (
    <Diagram title={`${type} thrust split`}>
      <text x={250} y={64} textAnchor="middle" fontSize={13} fontWeight={800} fill={NAVY}>
        {type.toUpperCase()}
      </text>

      {config.bars.map((bar) => {
        const bw = (w * bar.pct) / 100;
        const x = cursor;
        cursor += bw;
        return (
          <g key={bar.label}>
            <rect x={x} y={y} width={bw} height={54} fill={bar.color} opacity={0.85} />
            {bw > 70 && (
              <>
                <text x={x + bw / 2} y={y + 26} textAnchor="middle" fontSize={17} fontWeight={800} fill="#fff">
                  {bar.pct}%
                </text>
                <text x={x + bw / 2} y={y + 43} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
                  {bar.label}
                </text>
              </>
            )}
            {bw <= 70 && (
              <text x={x + bw / 2} y={y + 32} textAnchor="middle" fontSize={12} fontWeight={800} fill="#fff">
                {bar.pct}%
              </text>
            )}
          </g>
        );
      })}
      <rect x={x0} y={y} width={w} height={54} rx={8} fill="none" stroke={NAVY} strokeWidth={1.8} />

      {config.bars.length > 1 && config.bars[1].pct <= 20 && (
        <text x={x0 + w - 6} y={y + 76} textAnchor="end" fontSize={10} fontWeight={700} fill={NOGO}>
          {config.bars[1].label}
        </text>
      )}

      <text x={250} y={232} textAnchor="middle" fontSize={11} fontWeight={700} fill={MUTED}>
        {config.note}
      </text>
    </Diagram>
  );
}

/** Turboprop power path: combustion → turbine → shaft → RGB → propeller. */
export function TurbopropPowerFlow(p: DiagramProps) {
  const highlight = str<"combustion" | "turbine" | "shaft" | "rgb" | "prop" | "none">(
    p.highlight,
    "none",
  );

  const steps = [
    { id: "combustion", label: "Combustion", detail: "heat energy", color: NOGO },
    { id: "turbine", label: "Turbine", detail: "extracts 75%", color: CAUTION },
    { id: "shaft", label: "Shaft", detail: "high RPM, low torque", color: MUTED },
    { id: "rgb", label: "Reduction gear box", detail: "trades RPM for torque", color: BRAND },
    { id: "prop", label: "Propeller", detail: "90% of thrust", color: GO },
  ];

  return (
    <Diagram title="Turboprop power flow">
      <ArrowDefs colors={{ n: MUTED }} />
      {steps.map((s, i) => {
        const y = 46 + i * 44;
        const on = highlight === "none" || highlight === s.id;
        return (
          <g key={s.id} opacity={on ? 1 : 0.32}>
            <rect
              x={96}
              y={y}
              width={310}
              height={34}
              rx={9}
              fill={`color-mix(in srgb, ${s.color} 14%, transparent)`}
              stroke={s.color}
              strokeWidth={1.7}
            />
            <text x={116} y={y + 22} fontSize={11.5} fontWeight={800} fill={NAVY}>
              {s.label}
            </text>
            <text x={388} y={y + 22} textAnchor="end" fontSize={10} fontWeight={650} fill={MUTED}>
              {s.detail}
            </text>
            {i < steps.length - 1 && (
              <path
                d={`M251 ${y + 34} L251 ${y + 44}`}
                stroke={MUTED}
                strokeWidth={2}
                markerEnd="url(#arrow-n)"
              />
            )}
          </g>
        );
      })}
      <text x={250} y={280} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        The gear box exists to keep propeller tips subsonic
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Systems                                                             */
/* ------------------------------------------------------------------ */

/** A generic left-to-right system schematic, used for fuel and oil paths. */
function SystemChain({
  title,
  nodes,
  highlight,
  accent,
  footnote,
}: {
  title: string;
  nodes: { id: string; label: string }[];
  highlight: string;
  accent: string;
  footnote: string;
}) {
  const perRow = 3;
  const rows = Math.ceil(nodes.length / perRow);
  const boxW = 128;
  const boxH = 38;
  const gapX = 22;
  const gapY = 20;
  const startY = 150 - (rows * (boxH + gapY) - gapY) / 2;

  return (
    <Diagram title={title}>
      <ArrowDefs colors={{ s: accent }} />
      {nodes.map((n, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        // Serpentine so the path reads continuously across rows.
        const c = row % 2 === 0 ? col : perRow - 1 - col;
        const x = 46 + c * (boxW + gapX);
        const y = startY + row * (boxH + gapY);
        const on = highlight === "none" || highlight === n.id;
        return (
          <g key={n.id} opacity={on ? 1 : 0.32}>
            <rect
              x={x}
              y={y}
              width={boxW}
              height={boxH}
              rx={9}
              fill={highlight === n.id ? `color-mix(in srgb, ${accent} 18%, transparent)` : "var(--color-surface-2)"}
              stroke={highlight === n.id ? accent : MUTED}
              strokeWidth={highlight === n.id ? 2 : 1.3}
            />
            <text x={x + boxW / 2} y={y + 23} textAnchor="middle" fontSize={9.8} fontWeight={750} fill={NAVY}>
              {n.label}
            </text>
          </g>
        );
      })}
      <text x={250} y={272} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        {footnote}
      </text>
    </Diagram>
  );
}

export function FuelSystem(p: DiagramProps) {
  return (
    <SystemChain
      title="Fuel system path"
      accent={CAUTION}
      highlight={str(p.highlight, "none")}
      nodes={[
        { id: "tank", label: "Fuel tank" },
        { id: "boost", label: "Boost pump" },
        { id: "filter", label: "LP filter" },
        { id: "pump", label: "Engine-driven pump" },
        { id: "fcu", label: "Fuel Control Unit" },
        { id: "pd", label: "P&D valve" },
        { id: "manifold", label: "Manifolds" },
        { id: "nozzle", label: "Fuel nozzles" },
      ]}
      footnote="The FCU is the brain: it senses CIT, RPM, ITT and PCL"
    />
  );
}

export function OilSystem(p: DiagramProps) {
  const subsystem = str<"pressure" | "scavenge" | "breather" | "none">(p.subsystem, "none");

  const groups = [
    {
      id: "pressure",
      label: "PRESSURE",
      color: BRAND,
      items: ["Oil tank", "Oil pump", "Filter", "Relief valve"],
      note: "supplies engine + accessory gear box",
    },
    {
      id: "scavenge",
      label: "SCAVENGE",
      color: CAUTION,
      items: ["Scavenge pump", "Chip detector", "Oil cooler"],
      note: "greater capacity than pressure side",
    },
    {
      id: "breather",
      label: "BREATHER",
      color: GO,
      items: ["Bleed air", "Breather valve"],
      note: "pressurizes sumps, ensures spray pattern",
    },
  ];

  return (
    <Diagram title="Lubrication subsystems">
      {groups.map((g, i) => {
        const y = 42 + i * 76;
        const on = subsystem === "none" || subsystem === g.id;
        return (
          <g key={g.id} opacity={on ? 1 : 0.3}>
            <rect
              x={38}
              y={y}
              width={424}
              height={62}
              rx={11}
              fill={subsystem === g.id ? `color-mix(in srgb, ${g.color} 12%, transparent)` : "transparent"}
              stroke={g.color}
              strokeWidth={1.7}
            />
            <text x={54} y={y + 22} fontSize={10} fontWeight={800} fill={g.color}>
              {g.label}
            </text>
            <text x={54} y={y + 52} fontSize={9.5} fill={MUTED}>
              {g.note}
            </text>
            {g.items.map((item, j) => (
              <g key={item}>
                <rect
                  x={150 + j * 78}
                  y={y + 14}
                  width={72}
                  height={26}
                  rx={7}
                  fill="var(--color-surface-2)"
                  stroke={MUTED}
                  strokeWidth={1}
                />
                <text x={186 + j * 78} y={y + 31} textAnchor="middle" fontSize={8.6} fontWeight={700} fill={NAVY}>
                  {item}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </Diagram>
  );
}

/** Start sequence as a timeline against RPM. */
export function StartSequence(p: DiagramProps) {
  const stage = str<"starter" | "fuel" | "ignition" | "idle" | "none">(p.stage, "none");
  const plot = makePlot({ left: 62, right: 36, top: 54, bottom: 86, xMin: 0, xMax: 100, yMin: 0, yMax: 100 });

  // Indexed spin-up curve: the shape matters, the clock does not.
  const rpm = (t: number) => 100 / (1 + Math.exp(-(t - 46) / 12));

  const marks = [
    { id: "starter", at: 6, label: "Starter engages", color: BRAND },
    { id: "fuel", at: 34, label: "Fuel at 30% RPM", color: CAUTION },
    { id: "ignition", at: 48, label: "Ignition", color: NOGO },
    { id: "idle", at: 86, label: "Self-accelerating", color: GO },
  ];

  return (
    <Diagram title="Normal starting sequence">
      <Axes plot={plot} xLabel="Time →" yLabel="Compressor RPM %" yTicks={3} />
      <Curve d={curvePath(plot, rpm, { from: 0, to: 100 })} color={NAVY} width={3} />

      <line
        x1={plot.x0}
        y1={plot.sy(30)}
        x2={plot.x1}
        y2={plot.sy(30)}
        stroke={CAUTION}
        strokeWidth={1.4}
        strokeDasharray="5 4"
      />
      <text x={plot.x1 - 4} y={plot.sy(30) - 6} textAnchor="end" fontSize={9.5} fontWeight={750} fill={CAUTION}>
        30% RPM
      </text>

      {marks.map((m) => {
        const on = stage === "none" || stage === m.id;
        return (
          <g key={m.id} opacity={on ? 1 : 0.28}>
            <line
              x1={plot.sx(m.at)}
              y1={plot.y0}
              x2={plot.sx(m.at)}
              y2={plot.sy(rpm(m.at))}
              stroke={m.color}
              strokeWidth={1.4}
              strokeDasharray="3 3"
            />
            <circle cx={plot.sx(m.at)} cy={plot.sy(rpm(m.at))} r={5} fill={m.color} />
          </g>
        );
      })}

      {marks.map((m, i) => (
        <text
          key={m.id}
          x={Math.min(Math.max(plot.sx(m.at), 46), 454)}
          y={plot.y0 + 42 + (i % 2) * 16}
          textAnchor="middle"
          fontSize={9.3}
          fontWeight={750}
          fill={m.color}
          opacity={stage === "none" || stage === m.id ? 1 : 0.3}
        >
          {m.label}
        </text>
      ))}
    </Diagram>
  );
}

/** Electrical distribution: sources into buses. */
export function ElectricalBuses(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  const buses = [
    { id: "essential", label: "Essential", detail: "flight safety", color: NOGO },
    { id: "primary", label: "Primary", detail: "mission equipment", color: BRAND },
    { id: "monitor", label: "Monitor", detail: "convenience circuits", color: MUTED },
    { id: "starter", label: "Starter", detail: "engine start", color: CAUTION },
  ];

  return (
    <Diagram title="Electrical distribution buses">
      <ArrowDefs colors={{ p: MUTED }} />

      <rect x={172} y={38} width={156} height={34} rx={9} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={1.8} />
      <text x={250} y={60} textAnchor="middle" fontSize={11} fontWeight={800} fill={NAVY}>
        Generator / Battery
      </text>
      <path d="M250 72 L250 92" stroke={MUTED} strokeWidth={2} markerEnd="url(#arrow-p)" />
      <line x1={70} y1={94} x2={430} y2={94} stroke={NAVY} strokeWidth={2.4} />

      {buses.map((b, i) => {
        const x = 46 + i * 106;
        const on = highlight === "none" || highlight === b.id;
        return (
          <g key={b.id} opacity={on ? 1 : 0.3}>
            <line x1={x + 46} y1={94} x2={x + 46} y2={126} stroke={MUTED} strokeWidth={1.8} />
            <rect
              x={x}
              y={126}
              width={92}
              height={60}
              rx={10}
              fill={`color-mix(in srgb, ${b.color} 13%, transparent)`}
              stroke={b.color}
              strokeWidth={1.8}
            />
            <text x={x + 46} y={150} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={NAVY}>
              {b.label}
            </text>
            <text x={x + 46} y={168} textAnchor="middle" fontSize={8.6} fontWeight={650} fill={MUTED}>
              {b.detail}
            </text>
          </g>
        );
      })}

      <text x={250} y={222} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Buses group equipment by how much flight safety depends on it
      </text>
      <text x={250} y={244} textAnchor="middle" fontSize={9.8} fill={MUTED}>
        Inverter: DC → AC · Transformer rectifier: AC → DC
      </text>
    </Diagram>
  );
}

/** Hydraulic circuit, Pascal's law made concrete. */
export function HydraulicCircuit(p: DiagramProps) {
  const ratio = Math.max(1, Math.min(6, num(p.ratio, 3)));
  // The piston height encodes area, and the tallest case (6x) has to fit
  // between the fluid at y=140 and the load at y=64. At 26 the 3x case already
  // overflowed, which drove the connecting rod to a negative height.
  const inputArea = 11;
  const outputArea = inputArea * ratio;
  // Pascal: force scales with area, displacement scales inversely.
  const displacement = 1 / ratio;

  return (
    <Diagram title="Pascal's law in a hydraulic system">
      <rect x={58} y={140} width={340} height={26} rx={6} fill={BRAND} opacity={0.28} />

      <g>
        <rect x={78} y={140 - inputArea} width={44} height={inputArea} fill="var(--color-surface)" stroke={NAVY} strokeWidth={2} />
        <rect x={92} y={64} width={16} height={Math.max(0, 140 - inputArea - 64)} fill={MUTED} />
        <text x={100} y={56} textAnchor="middle" fontSize={10} fontWeight={750} fill={NAVY}>
          Input
        </text>
        <text x={100} y={196} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
          area 1×
        </text>
      </g>

      <g>
        <rect x={314} y={140 - outputArea} width={72} height={outputArea} fill="var(--color-surface)" stroke={NAVY} strokeWidth={2} />
        <rect x={342} y={64} width={16} height={Math.max(0, 140 - outputArea - 64)} fill={MUTED} />
        <text x={350} y={56} textAnchor="middle" fontSize={10} fontWeight={750} fill={NAVY}>
          Output
        </text>
        <text x={350} y={196} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
          area {ratio.toFixed(0)}×
        </text>
      </g>

      <g transform="translate(250 232)">
        <text x={-96} y={0} textAnchor="middle" fontSize={11} fontWeight={800} fill={GO}>
          Force ×{ratio.toFixed(0)}
        </text>
        <text x={96} y={0} textAnchor="middle" fontSize={11} fontWeight={800} fill={CAUTION}>
          Travel ×{displacement.toFixed(2)}
        </text>
      </g>
      <text x={250} y={262} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        Pressure is constant · you buy force with distance
      </text>
    </Diagram>
  );
}
