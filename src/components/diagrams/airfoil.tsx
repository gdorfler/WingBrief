"use client";

/** Unit 2 and 5 diagrams: airfoil geometry, lift production, CL curves, stalls. */

import {
  CL_CONFIG,
  type ClCurveConfig,
  coefficientOfLift,
  withFlaps,
  withSlat,
} from "@/lib/aero";
import {
  Arrow,
  ArrowDefs,
  Axes,
  Band,
  Curve,
  Diagram,
  type DiagramProps,
  Marker,
  RegionLabel,
  airfoilPath,
  bool,
  curvePath,
  makePlot,
  maybeNum,
  num,
  str,
} from "./primitives";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";
const VIOLET = "var(--color-series-alt)";

/* ------------------------------------------------------------------ */

export function AirfoilGeometry(p: DiagramProps) {
  const camber = num(p.camber, 0.06);
  const labels = bool(p.labels, true);
  const chord = 340;
  const x = 76;
  const y = 152;
  const { d, chordLine, mclPath } = airfoilPath({ x, y, chord, camber, thickness: 0.13 });

  return (
    <Diagram title="Airfoil geometry">
      <ArrowDefs colors={{ cam: VIOLET }} />
      <path d={d} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.4} />
      <line
        x1={chordLine[0] - 22}
        y1={chordLine[1]}
        x2={chordLine[2] + 22}
        y2={chordLine[3]}
        stroke={BRAND}
        strokeWidth={2}
        strokeDasharray="7 5"
      />
      <path d={mclPath} fill="none" stroke={VIOLET} strokeWidth={2} strokeDasharray="3 3" />

      <circle cx={x} cy={y} r={4} fill={NOGO} />
      <circle cx={x + chord} cy={y} r={4} fill={NOGO} />

      {camber > 0.005 && (
        <Arrow
          x1={x + chord * 0.42}
          y1={y}
          x2={x + chord * 0.42}
          y2={y - camber * chord * 0.98}
          color={VIOLET}
          id="cam"
          width={2}
        />
      )}

      {labels && (
        <>
          <text x={x - 26} y={y + 26} textAnchor="middle" fill={NOGO} fontWeight={700}>
            Leading edge
          </text>
          <text x={x + chord + 18} y={y + 28} textAnchor="middle" fill={NOGO} fontWeight={700}>
            Trailing edge
          </text>
          <text x={x + chord * 0.72} y={y + 24} fill={BRAND} fontWeight={700}>
            Chord line
          </text>
          <text x={x + chord * 0.66} y={y - 34} fill={VIOLET} fontWeight={700}>
            Mean camber line
          </text>
          <text x={x + chord * 0.42 - 6} y={y - camber * chord - 12} textAnchor="middle" fill={VIOLET} fontWeight={700}>
            Camber
          </text>
          <text x={250} y={266} textAnchor="middle" fill={MUTED} fontSize={10.5} fontWeight={650}>
            Chord line joins the EDGES · mean camber line splits the SURFACES
          </text>
        </>
      )}
    </Diagram>
  );
}


/* ------------------------------------------------------------------ */

/**
 * Wing planform seen from above, with the four measurements the guide
 * defines: root chord, tip chord, sweep to the 25% chord line, and span.
 * Dihedral cannot be shown from above, so it gets a small front view inset.
 */
export function WingPlanform(p: DiagramProps) {
  const labels = bool(p.labels, true);

  // Half-span drawn right of the centerline, mirrored for the left.
  const cx = 250;
  const rootLE = 74;
  const rootTE = 196;
  const tipLE = 116;
  const tipTE = 172;
  const halfSpan = 168;

  const half = (dir: number) => {
    const x = (v: number) => cx + dir * v;
    return (
      <g key={dir}>
        <path
          d={`M${x(0)} ${rootLE} L${x(halfSpan)} ${tipLE} L${x(halfSpan)} ${tipTE} L${x(0)} ${rootTE} Z`}
          fill="var(--color-surface-2)"
          stroke={NAVY}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        {/* 25% chord line — the reference sweep is measured to. */}
        <line
          x1={x(0)}
          y1={rootLE + (rootTE - rootLE) * 0.25}
          x2={x(halfSpan)}
          y2={tipLE + (tipTE - tipLE) * 0.25}
          stroke={BRAND}
          strokeWidth={1.8}
          strokeDasharray="6 4"
        />
      </g>
    );
  };

  return (
    <Diagram title="Wing planform">
      {/* Lateral axis, which sweep is measured from. */}
      <line x1={40} y1={rootLE + (rootTE - rootLE) * 0.25} x2={460} y2={rootLE + (rootTE - rootLE) * 0.25} stroke={MUTED} strokeWidth={1.2} strokeDasharray="3 4" />

      {[1, -1].map(half)}

      {/* Fuselage. */}
      <rect x={cx - 13} y={rootLE - 26} width={26} height={(rootTE - rootLE) + 62} rx={13} fill="var(--color-surface-3)" stroke={NAVY} strokeWidth={2} />

      {/* Root chord. */}
      <line x1={cx + 30} y1={rootLE} x2={cx + 30} y2={rootTE} stroke={NOGO} strokeWidth={2.4} />
      {/* Tip chord. */}
      <line x1={cx + halfSpan - 6} y1={tipLE} x2={cx + halfSpan - 6} y2={tipTE} stroke={GO} strokeWidth={2.4} />

      {labels && (
        <>
          <text x={cx + 38} y={rootLE + (rootTE - rootLE) / 2 + 4} fontSize={10.5} fontWeight={800} fill={NOGO}>
            root chord c_R
          </text>
          <text x={cx + halfSpan - 12} y={tipLE - 8} textAnchor="end" fontSize={10.5} fontWeight={800} fill={GO}>
            tip chord c_T
          </text>
          <text x={cx + halfSpan - 4} y={tipTE + 30} textAnchor="middle" fontSize={10} fontWeight={750} fill={BRAND}>
            25% chord line
          </text>
          <text x={cx + halfSpan - 4} y={tipTE + 43} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
            sweep is measured to THIS
          </text>
          <text x={44} y={rootLE + (rootTE - rootLE) * 0.25 - 8} fontSize={10} fontWeight={750} fill={MUTED}>
            lateral axis
          </text>
          <text x={250} y={272} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
            taper ratio λ = c_T ÷ c_R · wing area S = b × c
          </text>
        </>
      )}

      {/* Front-view inset: dihedral cannot be seen from above. */}
      <g transform="translate(392 42)">
        <rect x={-56} y={-20} width={112} height={44} rx={8} fill="var(--color-surface)" stroke={MUTED} strokeWidth={1.2} />
        <line x1={-44} y1={10} x2={0} y2={-4} stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
        <line x1={0} y1={-4} x2={44} y2={10} stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" />
        <line x1={-44} y1={10} x2={44} y2={10} stroke={MUTED} strokeWidth={1} strokeDasharray="3 3" />
        {labels && (
          <text x={0} y={20} textAnchor="middle" fontSize={9} fontWeight={750} fill={MUTED}>
            dihedral, from the front
          </text>
        )}
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function ChordwiseSpanwise() {
  return (
    <Diagram title="Chordwise versus spanwise flow">
      <ArrowDefs colors={{ chord: GO, span: CAUTION }} />
      <path
        d="M110 96 L392 118 L392 186 L110 208 Z"
        fill="var(--color-surface-2)"
        stroke={NAVY}
        strokeWidth={2.2}
      />
      <text x={104} y={92} textAnchor="end" fill={MUTED} fontSize={10} fontWeight={700}>
        Root
      </text>
      <text x={400} y={112} fill={MUTED} fontSize={10} fontWeight={700}>
        Tip
      </text>
      <text x={250} y={94} textAnchor="middle" fill={NAVY} fontSize={10} fontWeight={700}>
        Leading edge
      </text>

      {[0.15, 0.4, 0.65, 0.9].map((f) => {
        const x = 110 + f * 282;
        const yTop = 96 + f * 22;
        return (
          <Arrow key={f} x1={x} y1={yTop - 32} x2={x} y2={yTop + 88} color={GO} id="chord" width={2.2} />
        );
      })}

      <Arrow x1={140} y1={162} x2={370} y2={178} color={CAUTION} id="span" width={2.6} dashed />

      <g transform="translate(84 244)">
        <circle cx={0} cy={-4} r={5} fill={GO} />
        <text x={12} y={0} fill={NAVY} fontSize={11} fontWeight={700}>
          Chordwise — ⟂ leading edge — MAKES LIFT
        </text>
      </g>
      <g transform="translate(84 268)">
        <circle cx={0} cy={-4} r={5} fill={CAUTION} />
        <text x={12} y={0} fill={NAVY} fontSize={11} fontWeight={700}>
          Spanwise — ∥ leading edge — no lift
        </text>
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function AirfoilPressure(p: DiagramProps) {
  const aoa = num(p.aoa, 6);
  const camber = num(p.camber, 0.06);
  const arrows = bool(p.arrows, true);
  const showTubes = bool(p.showTubes, false);
  const showVelocity = bool(p.showVelocity, false);
  const showResultant = bool(p.showResultant, false);

  const chord = 300;
  const x = 100;
  const y = 158;
  const { d } = airfoilPath({ x, y, chord, camber, thickness: 0.12, aoaDeg: aoa });

  // Suction peaks near the point of maximum thickness and grows with AOA.
  const strength = Math.min(1.6, 0.35 + aoa * 0.075 + camber * 4);
  const samples = 11;

  return (
    <Diagram originY={22} height={156} title="Pressure distribution around an airfoil">
      <ArrowDefs colors={{ up: BRAND, down: CAUTION, res: GO, vel: NOGO }} />

      {showTubes && (
        <>
          <path
            d={`M40 ${y - 62} C140 ${y - 74}, 200 ${y - 52 - aoa}, 300 ${y - 46 - aoa} C370 ${y - 44}, 400 ${y - 52}, 460 ${y - 58}`}
            fill="none"
            stroke={BRAND}
            strokeWidth={1.6}
            opacity={0.6}
          />
          <path
            d={`M40 ${y - 38} C140 ${y - 46}, 200 ${y - 30 - aoa}, 300 ${y - 26 - aoa} C370 ${y - 26}, 400 ${y - 32}, 460 ${y - 36}`}
            fill="none"
            stroke={BRAND}
            strokeWidth={1.6}
            opacity={0.6}
          />
          <text x={54} y={y - 68} fill={BRAND} fontSize={10} fontWeight={700}>
            Streamtube A
          </text>
          <path
            d={`M40 ${y + 48} C140 ${y + 52}, 200 ${y + 46}, 300 ${y + 44} C370 ${y + 44}, 400 ${y + 46}, 460 ${y + 48}`}
            fill="none"
            stroke={MUTED}
            strokeWidth={1.6}
            opacity={0.6}
          />
          <text x={54} y={y + 64} fill={MUTED} fontSize={10} fontWeight={700}>
            Streamtube B
          </text>
        </>
      )}

      <path d={d} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.4} />

      {arrows &&
        Array.from({ length: samples }, (_, i) => {
          const t = (i + 0.5) / samples;
          const px = x + t * chord * Math.cos((-aoa * Math.PI) / 180);
          const py = y + t * chord * Math.sin((-aoa * Math.PI) / 180);
          // Suction distribution: sharp peak just aft of the leading edge.
          const suction = strength * Math.exp(-((t - 0.22) ** 2) / 0.055) * 46;
          const pressure = strength * Math.exp(-((t - 0.3) ** 2) / 0.13) * 15;
          return (
            <g key={i}>
              {suction > 3 && (
                <Arrow
                  x1={px}
                  y1={py - 22 - suction}
                  x2={px}
                  y2={py - 22}
                  color={BRAND}
                  id="up"
                  width={2}
                />
              )}
              {pressure > 2 && (
                <Arrow
                  x1={px}
                  y1={py + 22 + pressure}
                  x2={px}
                  y2={py + 22}
                  color={CAUTION}
                  id="down"
                  width={2}
                />
              )}
            </g>
          );
        })}

      {showVelocity && (
        <text x={x + chord * 0.22} y={y - 96} textAnchor="middle" fill={NOGO} fontWeight={750} fontSize={11}>
          velocity ↑ · static pressure ↓
        </text>
      )}

      {showResultant && (
        <Arrow
          x1={x + chord * 0.26}
          y1={y - 12}
          x2={x + chord * 0.26 + aoa * 1.5}
          y2={y - 12 - strength * 62}
          color={GO}
          id="res"
          width={3.6}
          label="LIFT"
          labelOffset={{ x: 8, y: -8 }}
        />
      )}

      <g transform="translate(58 44)">
        <text x={0} y={0} fontSize={10.5} fontWeight={700} fill={MUTED}>
          AOA
        </text>
        <text x={0} y={22} fontSize={20} fontWeight={800} fill={NAVY} className="tabular">
          {aoa.toFixed(0)}°
        </text>
      </g>
      <g transform="translate(396 44)">
        <circle cx={-8} cy={-4} r={4.5} fill={BRAND} />
        <text x={2} y={0} fontSize={10} fontWeight={700} fill={BRAND}>
          low static pressure
        </text>
        <circle cx={-8} cy={14} r={4.5} fill={CAUTION} />
        <text x={2} y={18} fontSize={10} fontWeight={700} fill={CAUTION}>
          high static pressure
        </text>
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function AeroForceComponents(p: DiagramProps) {
  const aoa = num(p.aoa, 8);
  const chord = 250;
  const x = 130;
  const y = 168;
  const { d } = airfoilPath({ x, y, chord, camber: 0.05, thickness: 0.12, aoaDeg: aoa });

  const acx = x + chord * 0.25;
  const acy = y - chord * 0.25 * Math.tan((aoa * Math.PI) / 180);
  const afLen = 120;
  const afAngle = 74 - aoa * 0.8;
  const rad = (afAngle * Math.PI) / 180;
  const afx = acx + Math.cos(rad) * afLen * 0.5;
  const afy = acy - Math.sin(rad) * afLen;

  return (
    <Diagram title="Aerodynamic force resolved into lift and drag">
      <ArrowDefs colors={{ af: VIOLET, lift: GO, drag: CAUTION, rw: NOGO }} />

      <line x1={40} y1={y + 6} x2={460} y2={y + 6} stroke={NOGO} strokeWidth={1.8} strokeDasharray="6 5" opacity={0.55} />
      <Arrow x1={94} y1={y + 6} x2={46} y2={y + 6} color={NOGO} id="rw" width={2.4} />
      <text x={62} y={y + 26} fill={NOGO} fontWeight={700} fontSize={10.5}>
        Relative wind
      </text>

      <path d={d} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.4} />

      <Arrow x1={acx} y1={acy} x2={afx} y2={afy} color={VIOLET} id="af" width={3.6} />
      <text x={afx + 8} y={afy - 6} fill={VIOLET} fontWeight={800} fontSize={11.5}>
        Aerodynamic force
      </text>

      <Arrow x1={acx} y1={acy} x2={acx} y2={afy} color={GO} id="lift" width={3} dashed />
      <text x={acx - 8} y={(acy + afy) / 2} textAnchor="end" fill={GO} fontWeight={800} fontSize={11.5}>
        LIFT ⟂
      </text>

      <Arrow x1={acx} y1={acy} x2={afx} y2={acy} color={CAUTION} id="drag" width={3} dashed />
      <text x={(acx + afx) / 2} y={acy + 18} textAnchor="middle" fill={CAUTION} fontWeight={800} fontSize={11.5}>
        DRAG ∥
      </text>

      <circle cx={acx} cy={acy} r={4} fill={NAVY} />
      <text x={acx} y={acy + 34} textAnchor="middle" fill={NAVY} fontSize={9.5} fontWeight={700}>
        AC ≈25% chord
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

function clConfigFrom(p: DiagramProps): { base: ClCurveConfig; label: string } {
  const camber = str<"positive" | "symmetric" | "negative">(p.camber, "positive");
  let cfg: ClCurveConfig = CL_CONFIG[camber];
  const parts: string[] = [];
  if (bool(p.slat, false)) {
    cfg = withSlat(cfg);
    parts.push("slat");
  }
  if (bool(p.flaps, false)) {
    cfg = withFlaps(cfg);
    parts.push("flaps");
  }
  return { base: cfg, label: parts.join(" + ") };
}

export function ClVsAoa(p: DiagramProps) {
  const camber = str<"positive" | "symmetric" | "negative">(p.camber, "positive");
  const clean = CL_CONFIG[camber];
  const { base: active, label } = clConfigFrom(p);
  const changed = label !== "";
  const marker = maybeNum(p.marker);
  const showAllCambers = bool(p.showAllCambers, false);

  const plot = makePlot({ xMin: -8, xMax: 26, yMin: -0.6, yMax: 2.2, left: 52, bottom: 42, right: 26 });
  const path = (cfg: ClCurveConfig) =>
    curvePath(plot, (a) => coefficientOfLift(a, cfg), { from: -8, to: 26, steps: 140 });

  const peakX = plot.sx(active.clMaxAoa);
  const peakY = plot.sy(active.clMax);

  return (
    <Diagram title="Coefficient of lift versus angle of attack">
      <Axes plot={plot} xLabel="Angle of attack (degrees)" yLabel="Coefficient of lift" xTicks={5} yTicks={3} />

      <Band plot={plot} from={active.clMaxAoa} to={26} color={NOGO} opacity={0.07} />
      <line x1={plot.x0} y1={plot.sy(0)} x2={plot.x1} y2={plot.sy(0)} stroke="var(--color-line-strong)" strokeWidth={1.2} />

      {showAllCambers ? (
        <>
          <Curve d={path(CL_CONFIG.positive)} color={GO} label="Positive camber" labelAt={{ x: plot.sx(19), y: plot.sy(1.62) }} />
          <Curve d={path(CL_CONFIG.symmetric)} color={BRAND} label="Symmetric" labelAt={{ x: plot.sx(19), y: plot.sy(1.28) }} />
          <Curve d={path(CL_CONFIG.negative)} color={CAUTION} label="Negative camber" labelAt={{ x: plot.sx(19), y: plot.sy(0.94) }} />
        </>
      ) : (
        <>
          {changed && <Curve d={path(clean)} color={MUTED} dashed opacity={0.75} label="clean" labelAt={{ x: plot.sx(21), y: plot.sy(0.72) }} />}
          <Curve d={path(active)} color={changed ? BRAND : NAVY} width={3} />
        </>
      )}

      <Marker x={peakX} y={peakY} color={NOGO} label="CLmax" side="top" pulse={!changed} />
      <line x1={peakX} y1={peakY} x2={peakX} y2={plot.y0} stroke={NOGO} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.6} />
      <text x={peakX} y={plot.y0 + 15} textAnchor="middle" fill={NOGO} fontWeight={700} fontSize={10}>
        CLmax AOA
      </text>

      <RegionLabel x={plot.sx(22.5)} y={plot.sy(2.02)} text="STALL" color={NOGO} bg="var(--color-nogo-soft)" />

      {marker !== null && (
        <Marker
          x={plot.sx(marker)}
          y={plot.sy(coefficientOfLift(marker, active))}
          color={BRAND}
          label={`${marker.toFixed(0)}°`}
          side="left"
        />
      )}

      {changed && (
        <RegionLabel x={plot.sx(-1)} y={plot.sy(2.02)} text={label.toUpperCase()} color={BRAND} bg="var(--color-brand-soft)" />
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function HighLiftComparison(p: DiagramProps) {
  const device = str<"slat" | "flap" | "both">(p.device, "slat");
  const clean = CL_CONFIG.positive;
  const active =
    device === "slat" ? withSlat(clean) : device === "flap" ? withFlaps(clean) : withFlaps(withSlat(clean));

  const plot = makePlot({ xMin: -10, xMax: 28, yMin: -0.4, yMax: 2.4, left: 52, bottom: 42, right: 26 });
  const path = (cfg: ClCurveConfig) =>
    curvePath(plot, (a) => coefficientOfLift(a, cfg), { from: -10, to: 28, steps: 140 });

  const color = device === "slat" ? BRAND : device === "flap" ? CAUTION : VIOLET;
  const note =
    device === "slat"
      ? "CLmax ↑ and CLmax AOA ↑ · no change at low AOA"
      : device === "flap"
        ? "CLmax ↑ but CLmax AOA ↓ · more CL everywhere"
        : "BLC plus camber — high CLmax at a flat attitude";

  return (
    <Diagram title="Boundary layer control versus camber change">
      <Axes plot={plot} xLabel="Angle of attack (degrees)" yLabel="Coefficient of lift" xTicks={5} yTicks={3} />
      <line x1={plot.x0} y1={plot.sy(0)} x2={plot.x1} y2={plot.sy(0)} stroke="var(--color-line-strong)" strokeWidth={1.2} />

      <Curve d={path(clean)} color={MUTED} dashed label="Clean" labelAt={{ x: plot.sx(20.5), y: plot.sy(0.7) }} />
      <Curve d={path(active)} color={color} width={3} />

      <Marker x={plot.sx(clean.clMaxAoa)} y={plot.sy(clean.clMax)} color={MUTED} r={4} />
      <Marker x={plot.sx(active.clMaxAoa)} y={plot.sy(active.clMax)} color={color} label="CLmax" side="top" />

      <line
        x1={plot.sx(clean.clMaxAoa)}
        y1={plot.y0}
        x2={plot.sx(clean.clMaxAoa)}
        y2={plot.sy(clean.clMax)}
        stroke={MUTED}
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line
        x1={plot.sx(active.clMaxAoa)}
        y1={plot.y0}
        x2={plot.sx(active.clMaxAoa)}
        y2={plot.sy(active.clMax)}
        stroke={color}
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />

      <RegionLabel x={250} y={plot.y0 + 30} text={note} color={color} bg="var(--color-surface-2)" />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

/** Where the boundary layer separates, as a fraction of chord from the LE. */
function separationPoint(aoa: number): number {
  if (aoa <= 4) return 0.94;
  if (aoa >= 22) return 0.06;
  // Accelerates forward as CLmax AOA is approached.
  const t = (aoa - 4) / 18;
  return 0.94 - 0.88 * t ** 1.6;
}

export function BoundaryLayer(p: DiagramProps) {
  const aoa = num(p.aoa, 6);
  const showGradient = bool(p.showGradient, false);
  const sep = separationPoint(aoa);

  const chord = 340;
  const x = 78;
  const y = 168;
  const { d } = airfoilPath({ x, y, chord, camber: 0.05, thickness: 0.13, aoaDeg: aoa * 0.55 });
  const sepX = x + sep * chord;

  return (
    <Diagram title="Boundary layer and separation point">
      <ArrowDefs colors={{ flow: BRAND, rev: NOGO, grad: CAUTION }} />
      <path d={d} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.4} />

      {/* Laminar then turbulent boundary layer above the surface */}
      <path
        d={`M${x + 6} ${y - 16} C${x + 60} ${y - 26}, ${x + 120} ${y - 30}, ${sepX} ${y - 32}`}
        fill="none"
        stroke={BRAND}
        strokeWidth={2}
        opacity={0.85}
      />
      {Array.from({ length: 9 }, (_, i) => {
        const t = 0.08 + i * 0.1;
        const px = x + t * chord;
        if (px > sepX) return null;
        const laminar = t < 0.28;
        return (
          <path
            key={i}
            d={
              laminar
                ? `M${px} ${y - 20} l16 -1`
                : `M${px} ${y - 24} q5 -5 9 0 q4 5 8 0`
            }
            fill="none"
            stroke={laminar ? BRAND : VIOLET}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* Separated, reversed flow aft of the separation point */}
      {sep < 0.9 &&
        Array.from({ length: 6 }, (_, i) => {
          const px = sepX + 14 + i * 22;
          if (px > x + chord + 24) return null;
          return (
            <path
              key={i}
              d={`M${px} ${y - 26 - (i % 2) * 10} q-9 8 -18 0`}
              fill="none"
              stroke={NOGO}
              strokeWidth={1.8}
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}

      <line x1={sepX} y1={y - 62} x2={sepX} y2={y + 6} stroke={NOGO} strokeWidth={2} strokeDasharray="4 4" />
      <circle cx={sepX} cy={y - 62} r={5} fill={NOGO} />
      <text x={sepX} y={y - 74} textAnchor="middle" fill={NOGO} fontWeight={750} fontSize={11}>
        Separation point
      </text>

      {showGradient && (
        <>
          <Arrow x1={x + 20} y1={y + 52} x2={x + chord * 0.3} y2={y + 52} color={GO} id="grad" width={2.2} />
          <text x={x + chord * 0.16} y={y + 70} textAnchor="middle" fill={GO} fontSize={10} fontWeight={700}>
            FAVOURABLE
          </text>
          <Arrow x1={x + chord * 0.34} y1={y + 52} x2={x + chord * 0.96} y2={y + 52} color={CAUTION} id="grad" width={2.2} />
          <text x={x + chord * 0.66} y={y + 70} textAnchor="middle" fill={CAUTION} fontSize={10} fontWeight={700}>
            ADVERSE
          </text>
        </>
      )}

      <g transform="translate(56 42)">
        <text x={0} y={0} fontSize={10.5} fontWeight={700} fill={MUTED}>
          AOA
        </text>
        <text x={0} y={22} fontSize={20} fontWeight={800} fill={aoa > 16 ? NOGO : NAVY} className="tabular">
          {aoa.toFixed(0)}°
        </text>
      </g>
      <g transform="translate(392 42)">
        <text x={0} y={0} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
          SEPARATION AT
        </text>
        <text x={0} y={22} textAnchor="middle" fontSize={20} fontWeight={800} fill={NOGO} className="tabular">
          {Math.round(sep * 100)}% chord
        </text>
      </g>
      {aoa > 16 && <RegionLabel x={250} y={276} text="CL falling — STALLED" color={NOGO} bg="var(--color-nogo-soft)" />}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function StallProgression(p: DiagramProps) {
  const aoa = num(p.aoa, 10);
  const showGradient = bool(p.showGradient, false);
  const stages = [4, 10, 16, 22];
  const active = stages.reduce((best, s) => (Math.abs(s - aoa) < Math.abs(best - aoa) ? s : best), stages[0]);

  return (
    <Diagram title="Separation point progression with increasing AOA">
      {stages.map((s, i) => {
        const sep = separationPoint(s);
        const y = 56 + i * 62;
        const chord = 250;
        const x = 128;
        const { d } = airfoilPath({ x, y, chord, camber: 0.05, thickness: 0.12, aoaDeg: s * 0.5 });
        const isActive = s === active;
        return (
          <g key={s} opacity={isActive ? 1 : 0.34}>
            <text x={104} y={y + 4} textAnchor="end" fontWeight={750} fill={isActive ? NAVY : MUTED} fontSize={12} className="tabular">
              {s}°
            </text>
            <path d={d} fill={isActive ? "var(--color-surface-2)" : "var(--color-surface-3)"} stroke={isActive ? NAVY : MUTED} strokeWidth={2} />
            <line
              x1={x + sep * chord}
              y1={y - 26}
              x2={x + sep * chord}
              y2={y + 12}
              stroke={NOGO}
              strokeWidth={2}
            />
            <circle cx={x + sep * chord} cy={y - 26} r={4} fill={NOGO} />
            <text x={x + chord + 24} y={y + 4} fontSize={10.5} fontWeight={700} fill={s >= 18 ? NOGO : MUTED}>
              {s >= 18 ? "CL falling" : `${Math.round(sep * 100)}% chord`}
            </text>
          </g>
        );
      })}
      {showGradient && (
        <text x={250} y={288} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={CAUTION}>
          Adverse gradient runs from max thickness aft to the trailing edge
        </text>
      )}
      {!showGradient && (
        <text x={250} y={288} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
          The separation point moves FORWARD as AOA increases
        </text>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function StallSpeedEquation() {
  const rows = [
    { term: "W", where: "numerator", effect: "Weight ↑ → stall speed ↑", color: NOGO },
    { term: "n", where: "numerator", effect: "Load factor ↑ → stall speed ↑ (×√n)", color: NOGO },
    { term: "ρ", where: "denominator", effect: "Density ↓ (altitude ↑) → TRUE stall speed ↑", color: CAUTION },
    { term: "S", where: "denominator", effect: "Wing area — fixed by the airframe", color: MUTED },
    { term: "CLmax", where: "denominator", effect: "Flaps down → CLmax ↑ → stall speed ↓", color: GO },
  ];
  return (
    <Diagram title="Reading the stall speed equation">
      <g transform="translate(250 52)">
        <text x={0} y={0} textAnchor="middle" fontSize={15} fontWeight={800} fill={NAVY}>
          Vs = √( 2Wn ÷ ρS·CLmax )
        </text>
        <text x={0} y={20} textAnchor="middle" fontSize={10.5} fill={MUTED} fontWeight={650}>
          swap ρ for ρ₀ and you get INDICATED stall speed — which does not change with altitude
        </text>
      </g>
      {rows.map((r, i) => (
        <g key={r.term} transform={`translate(46 ${100 + i * 36})`}>
          <rect x={0} y={-14} width={408} height={28} rx={9} fill="var(--color-surface-2)" />
          <text x={16} y={5} fontWeight={800} fill={r.color} fontSize={12}>
            {r.term}
          </text>
          <text x={72} y={5} fontSize={9.5} fontWeight={700} fill={MUTED}>
            {r.where}
          </text>
          <text x={150} y={5} fontSize={11} fontWeight={650} fill={NAVY}>
            {r.effect}
          </text>
        </g>
      ))}
    </Diagram>
  );
}
