"use client";

/** Unit 1 diagrams: mechanics, atmosphere, airflow, airspeed, axes. */

import { atmosphereAt, tasFromIas } from "@/lib/aero";
import {
  AircraftSide,
  Arrow,
  ArrowDefs,
  Axes,
  Diagram,
  type DiagramProps,
  RegionLabel,
  bool,
  makePlot,
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

export function MomentArm(p: DiagramProps) {
  const arm = num(p.arm, 0.7);
  const fulcrumX = 90;
  const beamY = 168;
  const forceX = fulcrumX + arm * 320;
  const moment = Math.round(arm * 100);

  return (
    <Diagram title="Moment equals force times perpendicular distance">
      <ArrowDefs colors={{ force: NOGO, arm: BRAND }} />

      <line x1={fulcrumX} y1={beamY} x2={460} y2={beamY} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
      <path d={`M${fulcrumX - 16} ${beamY + 26} L${fulcrumX} ${beamY + 4} L${fulcrumX + 16} ${beamY + 26} Z`} fill={MUTED} />
      <text x={fulcrumX} y={beamY + 44} textAnchor="middle">Fulcrum / axis</text>

      <Arrow x1={forceX} y1={beamY - 76} x2={forceX} y2={beamY - 10} color={NOGO} id="force" width={3.5} />
      <text x={forceX} y={beamY - 86} textAnchor="middle" fill={NOGO} fontWeight={750} fontSize={12}>
        Force (F)
      </text>

      <line x1={fulcrumX} y1={beamY + 62} x2={forceX} y2={beamY + 62} stroke={BRAND} strokeWidth={2} strokeDasharray="5 4" />
      <line x1={fulcrumX} y1={beamY + 54} x2={fulcrumX} y2={beamY + 70} stroke={BRAND} strokeWidth={2} />
      <line x1={forceX} y1={beamY + 54} x2={forceX} y2={beamY + 70} stroke={BRAND} strokeWidth={2} />
      <text x={(fulcrumX + forceX) / 2} y={beamY + 84} textAnchor="middle" fill={BRAND} fontWeight={700}>
        Moment arm (d)
      </text>

      <g transform="translate(250 46)">
        <rect x={-118} y={-24} width={236} height={44} rx={12} fill="var(--color-surface-2)" />
        <text x={0} y={5} textAnchor="middle" fill={NAVY} fontWeight={750} fontSize={15}>
          M = F × d
        </text>
      </g>
      <RegionLabel x={420} y={46} text={`Moment ${moment}%`} color={BRAND} bg="var(--color-brand-soft)" />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function AtmosphereColumn(p: DiagramProps) {
  const altitude = num(p.altitude, 0);
  const state = atmosphereAt(altitude);
  const maxAlt = 40_000;
  const plot = makePlot({ left: 62, right: 176, top: 26, bottom: 44, yMin: 0, yMax: maxAlt });
  const y = plot.sy(altitude);

  const bars = [
    { label: "Pressure", value: state.pressure / 29.92, text: `${state.pressure.toFixed(1)} in-Hg`, color: BRAND },
    { label: "Temperature", value: (state.temperature + 60) / 75, text: `${state.temperature.toFixed(0)} °C`, color: CAUTION },
    { label: "Density", value: state.densityRatio, text: `${(state.densityRatio * 100).toFixed(0)}% of ρ₀`, color: GO },
  ];

  return (
    <Diagram title="Atmospheric properties versus altitude">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#cfe3f7" />
          <stop offset="100%" stopColor="#eef5fd" />
        </linearGradient>
      </defs>
      <rect x={plot.x0} y={plot.y1} width={plot.w} height={plot.h} fill="url(#skyGrad)" rx={6} />
      <Axes plot={plot} yLabel="Altitude (ft)" grid={false} />

      {[0, 10_000, 20_000, 30_000, 40_000].map((a) => (
        <g key={a}>
          <line className="grid" x1={plot.x0} y1={plot.sy(a)} x2={plot.x1} y2={plot.sy(a)} />
          <text x={plot.x0 - 8} y={plot.sy(a) + 4} textAnchor="end" fontSize={10}>
            {a / 1000}k
          </text>
        </g>
      ))}

      <line
        x1={plot.x0}
        y1={plot.sy(36_000)}
        x2={plot.x1}
        y2={plot.sy(36_000)}
        stroke={NOGO}
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <text x={plot.x0 + 6} y={plot.sy(36_000) - 6} fill={NOGO} fontSize={9.5} fontWeight={700}>
        Isothermal layer −56.5 °C
      </text>

      <g transform={`translate(${(plot.x0 + plot.x1) / 2} ${y})`}>
        <AircraftSide x={0} y={0} scale={0.62} />
      </g>
      <line x1={plot.x0} y1={y} x2={plot.x1} y2={y} stroke={NAVY} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />

      <g transform="translate(336 34)">
        {bars.map((b, i) => (
          <g key={b.label} transform={`translate(0 ${i * 62})`}>
            <text x={0} y={0} fontSize={10.5} fontWeight={700} fill={MUTED}>
              {b.label}
            </text>
            <rect x={0} y={8} width={130} height={9} rx={4.5} fill="var(--color-surface-3)" />
            <rect
              x={0}
              y={8}
              width={Math.max(3, Math.min(1, b.value) * 130)}
              height={9}
              rx={4.5}
              fill={b.color}
            />
            <text x={0} y={34} fontSize={13} fontWeight={750} fill={NAVY} className="tabular">
              {b.text}
            </text>
          </g>
        ))}
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function Streamtube(p: DiagramProps) {
  const constriction = Math.min(0.85, Math.max(0, num(p.constriction, 0.5)));
  const wideH = 78;
  const narrowH = wideH * (1 - constriction * 0.72);
  const cy = 150;
  const throatX = 250;

  // Continuity: A₁V₁ = A₂V₂, so velocity scales as the area ratio.
  const vRatio = wideH / narrowH;
  const qRatio = vRatio ** 2;
  const staticDrop = Math.min(0.92, (qRatio - 1) * 0.16);

  const top = `M60 ${cy - wideH / 2} C160 ${cy - wideH / 2}, 190 ${cy - narrowH / 2}, ${throatX} ${cy - narrowH / 2} C310 ${cy - narrowH / 2}, 340 ${cy - wideH / 2}, 440 ${cy - wideH / 2}`;
  const bottom = `M60 ${cy + wideH / 2} C160 ${cy + wideH / 2}, 190 ${cy + narrowH / 2}, ${throatX} ${cy + narrowH / 2} C310 ${cy + narrowH / 2}, 340 ${cy + wideH / 2}, 440 ${cy + wideH / 2}`;

  return (
    <Diagram title="Continuity and Bernoulli in a streamtube">
      <ArrowDefs colors={{ flow: BRAND, fast: NOGO }} />
      <path d={`${top} L440 ${cy + wideH / 2} ${bottom.replace("M", "L").split(" C")[0]} Z`} fill="none" />
      <path d={top} fill="none" stroke={NAVY} strokeWidth={2.5} />
      <path d={bottom} fill="none" stroke={NAVY} strokeWidth={2.5} />

      {[-0.62, -0.2, 0.2, 0.62].map((f, i) => {
        const yWide = cy + f * wideH;
        const yNarrow = cy + f * narrowH;
        return (
          // Marching dashes: the point of continuity is that this is the same
          // air speeding up, which a static line cannot say.
          <path
            key={i}
            d={`M64 ${yWide} C164 ${yWide}, 192 ${yNarrow}, ${throatX} ${yNarrow} C308 ${yNarrow}, 336 ${yWide}, 436 ${yWide}`}
            fill="none"
            stroke={BRAND}
            strokeWidth={1.6}
            opacity={0.5}
            className="flow-line"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        );
      })}

      <Arrow x1={78} y1={cy} x2={78 + 42} y2={cy} color={BRAND} id="flow" width={3} />
      <Arrow
        x1={throatX - 30}
        y1={cy}
        x2={throatX - 30 + 42 * vRatio}
        y2={cy}
        color={NOGO}
        id="fast"
        width={3}
      />

      <text x={100} y={cy - wideH / 2 - 12} textAnchor="middle" fontWeight={700} fill={NAVY}>
        A₁ · V₁
      </text>
      <text x={throatX} y={cy - narrowH / 2 - 12} textAnchor="middle" fontWeight={700} fill={NOGO}>
        A₂ ↓ · V₂ ↑
      </text>

      <g transform="translate(250 258)">
        <text x={-150} y={0} fontSize={11} fontWeight={700} fill={MUTED}>
          Velocity
        </text>
        <text x={-70} y={0} fontSize={11} fontWeight={750} fill={NOGO} className="tabular">
          ×{vRatio.toFixed(2)}
        </text>
        <text x={0} y={0} fontSize={11} fontWeight={700} fill={MUTED}>
          Dynamic q
        </text>
        <text x={78} y={0} fontSize={11} fontWeight={750} fill={CAUTION} className="tabular">
          ×{qRatio.toFixed(2)}
        </text>
        <text x={124} y={0} fontSize={11} fontWeight={700} fill={MUTED}>
          Static Pₛ
        </text>
        <text x={196} y={0} fontSize={11} fontWeight={750} fill={GO} className="tabular">
          −{Math.round(staticDrop * 100)}%
        </text>
      </g>
      <text x={250} y={30} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={NAVY}>
        Total pressure H is constant
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function PitotStatic(p: DiagramProps = {}) {
  const labels = bool(p.labels, true);
  return (
    <Diagram title="Pitot-static system">
      <ArrowDefs colors={{ air: BRAND }} />

      {[92, 112, 132].map((y) => (
        <Arrow key={y} x1={18} y1={y} x2={58} y2={y} color={BRAND} id="air" width={2} />
      ))}

      <g>
        <rect x={64} y={84} width={92} height={26} rx={13} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.5} />
        <circle cx={70} cy={97} r={7} fill="var(--color-brand-soft)" stroke={BRAND} strokeWidth={2} />
        {labels && (
          <>
            <text x={110} y={72} textAnchor="middle" fontWeight={750} fill={NAVY} fontSize={12}>
              Pitot tube
            </text>
            <text x={110} y={58} textAnchor="middle" fill={BRAND} fontWeight={700} fontSize={11}>
              Total pressure H
            </text>
          </>
        )}
      </g>

      <path d="M180 200 C180 200 300 200 300 200" stroke={NAVY} strokeWidth={2.5} fill="none" />
      <path
        d="M180 214 C240 214 244 176 300 176"
        stroke={NAVY}
        strokeWidth={2}
        fill="none"
        strokeDasharray="0"
      />
      <path d="M156 97 C220 97 236 118 300 118" stroke={BRAND} strokeWidth={2.5} fill="none" />

      <g>
        <path d="M172 200 L246 200 L246 228 L172 228 Z" fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2} />
        {[184, 196, 208, 220, 232].map((x) => (
          <circle key={x} cx={x} cy={200} r={2.4} fill={NAVY} />
        ))}
        {labels && (
          <>
            <text x={208} y={252} textAnchor="middle" fontWeight={750} fill={NAVY} fontSize={12}>
              Static port
            </text>
            <text x={208} y={266} textAnchor="middle" fill={GO} fontWeight={700} fontSize={11}>
              Static pressure Pₛ
            </text>
          </>
        )}
      </g>
      <path d="M246 214 C280 214 280 150 300 150" stroke={GO} strokeWidth={2.5} fill="none" />

      <g>
        <rect x={300} y={96} width={128} height={78} rx={12} fill="var(--color-surface)" stroke={NAVY} strokeWidth={2.5} />
        {labels && (
          <>
            <text x={364} y={120} textAnchor="middle" fontWeight={750} fill={NAVY} fontSize={11.5}>
              Differential gauge
            </text>
            <text x={364} y={142} textAnchor="middle" fontWeight={800} fill={CAUTION} fontSize={16}>
              q = H − Pₛ
            </text>
            <text x={364} y={160} textAnchor="middle" fill={MUTED} fontSize={10}>
              dynamic pressure
            </text>
          </>
        )}
      </g>

      <path d="M364 174 L364 196" stroke={NAVY} strokeWidth={2} markerEnd="url(#arrow-air)" />
      <g>
        <rect x={306} y={200} width={116} height={48} rx={10} fill="var(--color-brand-soft)" stroke={BRAND} strokeWidth={2} />
        {labels && (
          <>
            <text x={364} y={220} textAnchor="middle" fontWeight={750} fill={BRAND} fontSize={11.5}>
              Airspeed indicator
            </text>
            <text x={364} y={238} textAnchor="middle" fontWeight={800} fill={NAVY} fontSize={13}>
              INDICATED
            </text>
          </>
        )}
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

const ICETG_STEPS = [
  { key: "IAS", name: "Indicated", correction: "what the instrument shows" },
  { key: "CAS", name: "Calibrated", correction: "corrected for instrument error" },
  { key: "EAS", name: "Equivalent", correction: "corrected for compressibility" },
  { key: "TAS", name: "True", correction: "corrected for density" },
  { key: "GS", name: "Ground", correction: "corrected for wind" },
];

export function IcetgLadder(p: DiagramProps) {
  const step = Math.min(5, Math.max(0, Math.round(num(p.step, 5))));
  return (
    <Diagram title="The ICE-TG airspeed ladder">
      {ICETG_STEPS.map((s, i) => {
        const active = i <= step;
        const y = 40 + i * 50;
        return (
          <g key={s.key} opacity={active ? 1 : 0.26}>
            <rect
              x={40}
              y={y - 19}
              width={420}
              height={38}
              rx={11}
              fill={i === step ? "var(--color-brand-soft)" : "var(--color-surface-2)"}
              stroke={i === step ? BRAND : "var(--color-line)"}
              strokeWidth={i === step ? 2 : 1}
            />
            <circle cx={66} cy={y} r={13} fill={i === step ? BRAND : "var(--color-surface-3)"} />
            <text
              x={66}
              y={y + 4}
              textAnchor="middle"
              fill={i === step ? "#fff" : NAVY}
              fontWeight={800}
              fontSize={11}
            >
              {s.key[0]}
            </text>
            <text x={90} y={y + 4} fontWeight={750} fill={NAVY} fontSize={12.5}>
              {s.key}
            </text>
            <text x={132} y={y + 4} fontWeight={650} fill={NAVY} fontSize={12}>
              {s.name}
            </text>
            <text x={228} y={y + 4} fill={MUTED} fontSize={10.5}>
              {s.correction}
            </text>
            {i < ICETG_STEPS.length - 1 && (
              <path
                d={`M250 ${y + 19} L250 ${y + 31}`}
                stroke={MUTED}
                strokeWidth={2}
                markerEnd="url(#arrow-step)"
              />
            )}
          </g>
        );
      })}
      <ArrowDefs colors={{ step: MUTED }} />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function IasTasLadder(p: DiagramProps) {
  const altitude = num(p.altitude, 0);
  const ias = num(p.ias, 150);
  const { densityRatio } = atmosphereAt(altitude);
  const tas = tasFromIas(ias, densityRatio);
  const maxSpeed = 260;

  const barY = (i: number) => 150 + i * 62;
  const barW = (v: number) => (v / maxSpeed) * 336;

  return (
    <Diagram title="Indicated versus true airspeed with altitude">
      <text x={250} y={34} textAnchor="middle" fontSize={12} fontWeight={700} fill={MUTED}>
        Pressure altitude
      </text>
      <text x={250} y={68} textAnchor="middle" fontSize={30} fontWeight={800} fill={NAVY} className="tabular">
        {altitude.toLocaleString()} ft
      </text>
      <text x={250} y={92} textAnchor="middle" fontSize={11} fontWeight={650} fill={MUTED} className="tabular">
        density {Math.round(densityRatio * 100)}% of sea level
      </text>

      {[
        { label: "IAS", value: ias, color: BRAND, note: "held constant" },
        { label: "TAS", value: tas, color: NOGO, note: "actual speed through the air" },
      ].map((row, i) => (
        <g key={row.label}>
          <text x={44} y={barY(i) + 5} fontWeight={800} fill={row.color} fontSize={13}>
            {row.label}
          </text>
          <rect x={84} y={barY(i) - 13} width={336} height={26} rx={13} fill="var(--color-surface-3)" />
          <rect x={84} y={barY(i) - 13} width={Math.max(8, barW(row.value))} height={26} rx={13} fill={row.color} />
          <text
            x={84 + Math.max(8, barW(row.value)) - 10}
            y={barY(i) + 5}
            textAnchor="end"
            fill="#fff"
            fontWeight={800}
            fontSize={12}
            className="tabular"
          >
            {Math.round(row.value)} kt
          </text>
          <text x={84} y={barY(i) + 30} fill={MUTED} fontSize={10}>
            {row.note}
          </text>
        </g>
      ))}

      <RegionLabel
        x={250}
        y={276}
        text={`TAS exceeds IAS by ${Math.round(tas - ias)} kt`}
        color={NOGO}
        bg="var(--color-nogo-soft)"
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function HumidityDensity(p: DiagramProps) {
  const humidity = Math.min(1, Math.max(0, num(p.humidity, 0)));
  const showDensity = bool(p.showDensity, false);
  const showPerformance = bool(p.showPerformance, false);

  const total = 36;
  const water = Math.round(humidity * 14);
  const cols = 6;
  const cell = 30;
  const ox = 118;
  const oy = 78;

  return (
    <Diagram title="Humidity displaces air molecules and lowers density">
      <rect x={ox - 14} y={oy - 14} width={cols * cell + 28} height={(total / cols) * cell + 28} rx={14} fill="var(--color-surface-2)" stroke="var(--color-line)" />
      {Array.from({ length: total }, (_, i) => {
        const isWater = i % 3 === 0 && i / 3 < water;
        const cx = ox + (i % cols) * cell + cell / 2;
        const cy = oy + Math.floor(i / cols) * cell + cell / 2;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={isWater ? 6.5 : 9} fill={isWater ? BRAND : "var(--color-navy-soft)"} opacity={isWater ? 0.95 : 0.75} />
            {isWater && (
              <text x={cx} y={cy + 3.4} textAnchor="middle" fill="#fff" fontSize={7.5} fontWeight={800}>
                H₂O
              </text>
            )}
          </g>
        );
      })}

      <text x={ox + (cols * cell) / 2} y={oy - 26} textAnchor="middle" fontWeight={700} fill={MUTED} fontSize={11}>
        Same volume · same particle count
      </text>

      <g transform="translate(330 96)">
        <text x={0} y={0} fontSize={10.5} fontWeight={700} fill={MUTED}>
          Water vapour
        </text>
        <text x={0} y={24} fontSize={22} fontWeight={800} fill={BRAND} className="tabular">
          {Math.round(humidity * 100)}%
        </text>
        {showDensity && (
          <>
            <text x={0} y={62} fontSize={10.5} fontWeight={700} fill={MUTED}>
              Air density
            </text>
            <text x={0} y={86} fontSize={22} fontWeight={800} fill={GO} className="tabular">
              −{(humidity * 3).toFixed(1)}%
            </text>
          </>
        )}
        {showPerformance && (
          <>
            <text x={0} y={124} fontSize={10.5} fontWeight={700} fill={MUTED}>
              Takeoff distance
            </text>
            <text x={0} y={148} fontSize={22} fontWeight={800} fill={NOGO} className="tabular">
              longer
            </text>
          </>
        )}
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function FourForces(p: DiagramProps) {
  const labels = bool(p.labels, true);
  const cx = 250;
  const cy = 142;
  return (
    <Diagram title="The four forces of flight">
      <ArrowDefs colors={{ lift: GO, weight: NAVY, thrust: BRAND, drag: CAUTION }} />
      <AircraftSide x={cx} y={cy} scale={1.5} />
      <Arrow x1={cx} y1={cy - 20} x2={cx} y2={cy - 88} color={GO} id="lift" width={3.5} label={labels ? "LIFT" : undefined} labelOffset={{ x: 0, y: -10 }} />
      <Arrow x1={cx} y1={cy + 20} x2={cx} y2={cy + 88} color={NAVY} id="weight" width={3.5} label={labels ? "WEIGHT" : undefined} labelOffset={{ x: 0, y: 18 }} />
      <Arrow x1={cx + 52} y1={cy} x2={cx + 138} y2={cy} color={BRAND} id="thrust" width={3.5} label={labels ? "THRUST" : undefined} labelOffset={{ x: 6, y: -12 }} />
      <Arrow x1={cx - 52} y1={cy} x2={cx - 138} y2={cy} color={CAUTION} id="drag" width={3.5} label={labels ? "DRAG" : undefined} labelOffset={{ x: -6, y: -12 }} />
      <text x={250} y={280} textAnchor="middle" fontSize={11} fill={MUTED} fontWeight={650}>
        Only lift and drag are aerodynamic forces
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function EquilibriumForces(p: DiagramProps) {
  const mode = str<"level" | "climb" | "turn" | "summary">(p.mode, "level");

  if (mode === "summary") {
    return (
      <Diagram title="Equilibrium implies trimmed, but not the reverse">
        <g transform="translate(250 150)">
          <ellipse cx={0} cy={0} rx={200} ry={100} fill="var(--color-brand-soft)" stroke={BRAND} strokeWidth={2} />
          <ellipse cx={-46} cy={0} rx={110} ry={64} fill="var(--color-go-soft)" stroke={GO} strokeWidth={2} />
          <text x={-46} y={4} textAnchor="middle" fontWeight={800} fill={GO} fontSize={13}>
            Equilibrium
          </text>
          <text x={-46} y={22} textAnchor="middle" fill={GO} fontSize={10}>
            forces + moments = 0
          </text>
          <text x={126} y={-4} textAnchor="middle" fontWeight={800} fill={BRAND} fontSize={13}>
            Trimmed
          </text>
          <text x={126} y={14} textAnchor="middle" fill={BRAND} fontSize={10}>
            moments = 0
          </text>
        </g>
      </Diagram>
    );
  }

  const config = {
    level: { rotate: 0, caption: "Straight and level — equilibrium", verdict: "EQUILIBRIUM", color: GO },
    climb: { rotate: -14, caption: "Steady climb, constant airspeed — still equilibrium", verdict: "EQUILIBRIUM", color: GO },
    turn: { rotate: 0, caption: "Constant-bank turn — trimmed, but accelerating", verdict: "TRIMMED ONLY", color: CAUTION },
  }[mode];

  return (
    <Diagram title={config.caption}>
      <ArrowDefs colors={{ f: NAVY }} />
      {mode === "turn" ? (
        <g transform="translate(250 140)">
          <ellipse cx={0} cy={40} rx={150} ry={44} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="6 5" />
          <g transform="rotate(-38)">
            <AircraftSide x={0} y={0} scale={1.25} />
          </g>
          <Arrow x1={0} y1={-16} x2={-58} y2={-70} color={GO} id="f" width={3} label="Total lift" labelOffset={{ x: -14, y: -8 }} />
          <Arrow x1={0} y1={16} x2={0} y2={76} color={NAVY} id="f" width={3} label="Weight" labelOffset={{ x: 0, y: 16 }} />
        </g>
      ) : (
        <g transform={`translate(250 148) rotate(${config.rotate})`}>
          <AircraftSide x={0} y={0} scale={1.4} />
          <Arrow x1={0} y1={-18} x2={0} y2={-82} color={GO} id="f" width={3} label="Lift" labelOffset={{ x: 0, y: -10 }} />
          <Arrow x1={0} y1={18} x2={0} y2={82} color={NAVY} id="f" width={3} label="Weight" labelOffset={{ x: 0, y: 16 }} />
          <Arrow x1={48} y1={0} x2={126} y2={0} color={BRAND} id="f" width={3} label="Thrust" labelOffset={{ x: 4, y: -10 }} />
          <Arrow x1={-48} y1={0} x2={-126} y2={0} color={CAUTION} id="f" width={3} label="Drag" labelOffset={{ x: -4, y: -10 }} />
        </g>
      )}
      <RegionLabel
        x={250}
        y={270}
        text={config.verdict}
        color={config.color}
        bg={config.color === GO ? "var(--color-go-soft)" : "var(--color-caution-soft)"}
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function Axes3d(p: DiagramProps = {}) {
  const labels = bool(p.labels, true);
  return (
    <Diagram title="Airplane three-axis reference system">
      <ArrowDefs colors={{ lon: BRAND, lat: GO, vert: CAUTION }} />

      <g opacity={0.9}>
        <AircraftTopSchematic />
      </g>

      <line x1={92} y1={150} x2={412} y2={150} stroke={BRAND} strokeWidth={2.5} strokeDasharray="7 5" />
      {labels && (
        <text x={104} y={140} fill={BRAND} fontWeight={750} fontSize={11.5}>
          Longitudinal — ROLL — ailerons
        </text>
      )}

      <line x1={250} y1={44} x2={250} y2={256} stroke={GO} strokeWidth={2.5} strokeDasharray="7 5" />
      {labels && (
        <text x={258} y={62} fill={GO} fontWeight={750} fontSize={11.5}>
          Lateral — PITCH — elevator
        </text>
      )}

      <line x1={186} y1={244} x2={318} y2={62} stroke={CAUTION} strokeWidth={2.5} strokeDasharray="7 5" />
      {labels && (
        <>
          <text x={322} y={198} fill={CAUTION} fontWeight={750} fontSize={11.5}>
            Vertical
          </text>
          <text x={322} y={212} fill={CAUTION} fontWeight={750} fontSize={11.5}>
            YAW — rudder
          </text>
        </>
      )}

      <circle cx={250} cy={150} r={5.5} fill={NAVY} />
      {labels && (
        <text x={250} y={176} textAnchor="middle" fontWeight={750} fill={NAVY} fontSize={11}>
          CG
        </text>
      )}
    </Diagram>
  );
}

function AircraftTopSchematic() {
  return (
    <g transform="translate(250 150) rotate(-90)">
      <path
        d="M0 -74 L7 -44 L7 -10 L86 16 L86 30 L7 20 L7 46 L24 62 L24 72 L0 66 L-24 72 L-24 62 L-7 46 L-7 20 L-86 30 L-86 16 L-7 -10 L-7 -44 Z"
        fill="var(--color-surface-3)"
        stroke="var(--color-navy-soft)"
        strokeWidth={1.6}
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */

export function AoaVsPitch(p: DiagramProps) {
  const pitch = num(p.pitch, 8);
  const flightPath = num(p.flightPath, 0);
  const highlight = str<"none" | "pitch" | "aoa" | "both">(p.highlight, "none");
  const labels = bool(p.labels, true);
  const aoa = pitch - flightPath;

  const cx = 236;
  const cy = 158;
  const L = 150;
  const rad = (d: number) => (-d * Math.PI) / 180;
  const pt = (deg: number, len: number) => ({
    x: cx + Math.cos(rad(deg)) * len,
    y: cy + Math.sin(rad(deg)) * len,
  });

  const fp = pt(flightPath, L);
  const rw = pt(flightPath + 180, L * 0.78);
  const chord = pt(pitch, L * 0.72);
  const horizon = pt(0, L);

  const dim = (on: boolean) => (highlight === "none" || on ? 1 : 0.24);

  return (
    <Diagram title="Pitch attitude versus angle of attack">
      <ArrowDefs colors={{ fp: BRAND, rw: NOGO, ch: NAVY, hz: MUTED }} />

      <line x1={70} y1={cy} x2={horizon.x + 34} y2={cy} stroke={MUTED} strokeWidth={2} strokeDasharray="6 5" opacity={dim(highlight === "pitch" || highlight === "both")} />
      {labels && (
        <text x={420} y={cy - 8} textAnchor="end" fill={MUTED} fontWeight={700} fontSize={11} opacity={dim(highlight === "pitch" || highlight === "both")}>
          Horizon
        </text>
      )}

      <g transform={`translate(${cx} ${cy}) rotate(${-pitch})`} opacity={dim(true)}>
        <AircraftSide x={0} y={0} scale={1.05} />
      </g>

      <line
        x1={cx - Math.cos(rad(pitch)) * 40}
        y1={cy - Math.sin(rad(pitch)) * -40}
        x2={chord.x}
        y2={chord.y}
        stroke={NAVY}
        strokeWidth={2.2}
        strokeDasharray="4 4"
        opacity={dim(highlight === "aoa" || highlight === "both" || highlight === "pitch")}
      />
      {labels && (
        <text x={chord.x + 6} y={chord.y - 6} fill={NAVY} fontWeight={700} fontSize={11} opacity={dim(highlight !== "none")}>
          Chord line
        </text>
      )}

      <Arrow x1={cx} y1={cy} x2={fp.x} y2={fp.y} color={BRAND} id="fp" width={2.8} opacity={dim(highlight === "aoa" || highlight === "both")} />
      {labels && (
        <text x={fp.x + 4} y={fp.y + 18} fill={BRAND} fontWeight={750} fontSize={11} opacity={dim(highlight === "aoa" || highlight === "both")}>
          Flight path
        </text>
      )}

      <Arrow x1={rw.x} y1={rw.y} x2={cx - 44} y2={cy + Math.sin(rad(flightPath)) * 44} color={NOGO} id="rw" width={2.8} opacity={dim(highlight === "aoa" || highlight === "both")} />
      {labels && (
        <text x={rw.x - 4} y={rw.y - 12} textAnchor="middle" fill={NOGO} fontWeight={750} fontSize={11} opacity={dim(highlight === "aoa" || highlight === "both")}>
          Relative wind
        </text>
      )}

      <g transform="translate(392 42)">
        <rect x={-76} y={-18} width={152} height={44} rx={11} fill={highlight === "aoa" || highlight === "both" ? "var(--color-nogo-soft)" : "var(--color-surface-2)"} />
        <text x={0} y={-2} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
          ANGLE OF ATTACK
        </text>
        <text x={0} y={18} textAnchor="middle" fontSize={17} fontWeight={800} fill={aoa > 16 ? NOGO : NAVY} className="tabular">
          {aoa.toFixed(0)}°
        </text>
      </g>
      <g transform="translate(392 104)">
        <rect x={-76} y={-18} width={152} height={44} rx={11} fill={highlight === "pitch" ? "var(--color-brand-soft)" : "var(--color-surface-2)"} />
        <text x={0} y={-2} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
          PITCH ATTITUDE
        </text>
        <text x={0} y={18} textAnchor="middle" fontSize={17} fontWeight={800} fill={NAVY} className="tabular">
          {pitch.toFixed(0)}°
        </text>
      </g>
      {aoa > 16 && (
        <RegionLabel x={250} y={282} text="Past CLmax AOA — stalled" color={NOGO} bg="var(--color-nogo-soft)" />
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function LiftEquationAnatomy() {
  const terms = [
    { sym: "½ρ", name: "Density", note: "altitude, temperature, humidity", color: BRAND, pilot: false },
    { sym: "V²", name: "Velocity", note: "SQUARED — the dominant term", color: NOGO, pilot: true },
    { sym: "S", name: "Wing area", note: "span × average chord", color: MUTED, pilot: false },
    { sym: "C_L", name: "Coeff. of lift", note: "C.AR.V.A.C — AOA and camber", color: GO, pilot: true },
  ];
  return (
    <Diagram title="Anatomy of the lift equation">
      <text x={250} y={54} textAnchor="middle" fontSize={30} fontWeight={800} fill={NAVY}>
        L = ½ρV²S C
        <tspan fontSize={19} dy={6}>L</tspan>
      </text>
      {terms.map((t, i) => (
        <g key={t.sym} transform={`translate(${44 + i * 108} 118)`}>
          <rect x={0} y={0} width={96} height={104} rx={13} fill="var(--color-surface-2)" stroke={t.pilot ? t.color : "var(--color-line)"} strokeWidth={t.pilot ? 2 : 1} />
          <text x={48} y={32} textAnchor="middle" fontSize={20} fontWeight={800} fill={t.color}>
            {t.sym}
          </text>
          <text x={48} y={54} textAnchor="middle" fontSize={10.5} fontWeight={750} fill={NAVY}>
            {t.name}
          </text>
          <foreignObject x={6} y={60} width={84} height={40}>
            <div
              style={{
                fontSize: 9,
                lineHeight: 1.25,
                color: "var(--color-navy-faint)",
                textAlign: "center",
                fontFamily: "inherit",
              }}
            >
              {t.note}
            </div>
          </foreignObject>
          {t.pilot && (
            <circle cx={86} cy={10} r={5} fill={t.color} />
          )}
        </g>
      ))}
      <g transform="translate(250 256)">
        <circle cx={-98} cy={-4} r={5} fill={NOGO} />
        <text x={-84} y={0} fontSize={11} fontWeight={700} fill={NAVY}>
          Marked terms are the ones a pilot can change in flight
        </text>
      </g>
    </Diagram>
  );
}

