"use client";

/** Unit 3 diagrams: parasite drag, induced drag, ground effect, the drag curve. */

import {
  type DragConfig,
  REFERENCE_DRAG,
  inducedDrag,
  ldMaxVelocity,
  parasiteDrag,
  totalDrag,
} from "@/lib/aero";
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
const GHOST = "var(--color-series-ghost)";

export function dragConfigFrom(p: DiagramProps, base: DragConfig = REFERENCE_DRAG): DragConfig {
  return {
    f: base.f * num(p.f, 1) * (bool(p.gear, false) ? 1.45 : 1) * (bool(p.flaps, false) ? 1.7 : 1),
    weight: base.weight * num(p.weight, 1),
    densityRatio: num(p.densityRatio, base.densityRatio),
    span: base.span * num(p.span, 1),
  };
}

/* ------------------------------------------------------------------ */

export function ParasiteComponents() {
  const shapes = [
    {
      x: 92,
      label: "Form drag",
      note: "separation + low-pressure wake",
      fix: "streamline it",
      color: CAUTION,
      body: <rect x={-14} y={-30} width={12} height={60} rx={2} fill={CAUTION} />,
      wake: 46,
    },
    {
      x: 250,
      label: "Friction drag",
      note: "viscous shear over the skin",
      fix: "paint, clean, flush rivets",
      color: BRAND,
      body: <ellipse cx={0} cy={0} rx={30} ry={16} fill={BRAND} />,
      wake: 14,
    },
    {
      x: 408,
      label: "Interference",
      note: "streamlines mixing at junctions",
      fix: "fairings and fillets",
      color: NOGO,
      body: (
        <g>
          <ellipse cx={-6} cy={0} rx={26} ry={13} fill={NOGO} />
          <ellipse cx={16} cy={14} rx={13} ry={9} fill={NOGO} opacity={0.7} />
        </g>
      ),
      wake: 30,
    },
  ];

  return (
    <Diagram title="Three components of parasite drag">
      <ArrowDefs colors={{ air: MUTED }} />
      {shapes.map((s) => (
        <g key={s.label} transform={`translate(${s.x} 118)`}>
          {[-26, 0, 26].map((dy) => (
            <Arrow key={dy} x1={-72} y1={dy} x2={-40} y2={dy} color={MUTED} id="air" width={1.6} />
          ))}
          {s.body}
          {Array.from({ length: 5 }, (_, i) => (
            <path
              key={i}
              d={`M${18 + i * 8} ${-s.wake / 2 + (i % 2) * s.wake} q6 6 0 12`}
              stroke={s.color}
              strokeWidth={1.4}
              fill="none"
              opacity={0.5}
            />
          ))}
          <text x={0} y={62} textAnchor="middle" fontWeight={800} fill={s.color} fontSize={12}>
            {s.label}
          </text>
          <foreignObject x={-66} y={70} width={132} height={54}>
            <div style={{ fontSize: 9.5, lineHeight: 1.35, textAlign: "center", color: "var(--color-navy-faint)" }}>
              {s.note}
              <div style={{ marginTop: 4, fontWeight: 700, color: "var(--color-navy)" }}>{s.fix}</div>
            </div>
          </foreignObject>
        </g>
      ))}
      <text x={250} y={276} textAnchor="middle" fontSize={11} fontWeight={700} fill={NAVY}>
        D_P = ½ρV²f — rises with the SQUARE of velocity
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function WingtipVortex(p: DiagramProps) {
  const showVectors = bool(p.showVectors, true);
  const infinite = bool(p.infinite, false);

  return (
    <Diagram title={infinite ? "Infinite wing: upwash balances downwash" : "Finite wing, vortices and induced drag"}>
      <ArrowDefs colors={{ up: GO, down: BRAND, lift: GO, tilt: NOGO, ind: CAUTION }} />

      {/* Wing seen from ahead-left, with the tip on the right */}
      <path d="M60 154 L330 148 L330 172 L60 178 Z" fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.2} />
      <text x={70} y={196} fill={MUTED} fontSize={10} fontWeight={700}>
        Root
      </text>
      {!infinite && (
        <text x={330} y={196} textAnchor="end" fill={MUTED} fontSize={10} fontWeight={700}>
          Tip
        </text>
      )}
      {infinite && (
        <>
          <rect x={330} y={110} width={16} height={110} fill="var(--color-surface-3)" stroke={MUTED} strokeWidth={1.5} />
          <text x={338} y={104} textAnchor="middle" fill={MUTED} fontSize={9} fontWeight={700}>
            wall
          </text>
        </>
      )}

      <Arrow x1={96} y1={196} x2={96} y2={166} color={GO} id="up" width={2.2} />
      <text x={96} y={212} textAnchor="middle" fill={GO} fontSize={10} fontWeight={700}>
        upwash
      </text>

      <Arrow x1={230} y1={148} x2={230} y2={infinite ? 176 : 196} color={BRAND} id="down" width={infinite ? 2.2 : 3.2} />
      <text x={230} y={infinite ? 194 : 214} textAnchor="middle" fill={BRAND} fontSize={10} fontWeight={700}>
        downwash{infinite ? "" : " ×2"}
      </text>

      {!infinite && (
        <g>
          <path
            d="M330 172 C356 176 372 158 366 140 C360 124 336 122 328 138 C322 152 336 162 348 156"
            fill="none"
            stroke={CAUTION}
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <text x={368} y={118} fill={CAUTION} fontSize={10.5} fontWeight={750}>
            wingtip vortex
          </text>
          <text x={368} y={132} fill={MUTED} fontSize={9}>
            high below → low above
          </text>
        </g>
      )}

      {showVectors && (
        <g transform="translate(150 108)">
          <Arrow x1={0} y1={0} x2={0} y2={-62} color={GO} id="lift" width={2.6} dashed />
          <text x={-6} y={-68} textAnchor="end" fill={GO} fontSize={10} fontWeight={700}>
            effective lift
          </text>
          {!infinite && (
            <>
              <Arrow x1={0} y1={0} x2={26} y2={-58} color={NOGO} id="tilt" width={3.2} />
              <text x={34} y={-58} fill={NOGO} fontSize={10.5} fontWeight={750}>
                total lift
              </text>
              <text x={34} y={-46} fill={NOGO} fontSize={9}>
                rotated aft
              </text>
              <Arrow x1={0} y1={-62} x2={26} y2={-62} color={CAUTION} id="ind" width={2.6} />
              <text x={30} y={-70} fill={CAUTION} fontSize={10} fontWeight={750}>
                induced drag
              </text>
            </>
          )}
        </g>
      )}

      <text x={250} y={276} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        {infinite
          ? "No tips → upwash exactly balances downwash → no induced drag"
          : "Downwash tilts the average relative wind, so total lift tilts aft"}
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

/** Induced-drag reduction as a fraction of wingspan above the ground. */
function groundEffectReduction(heightFraction: number): number {
  if (heightFraction >= 1) return 0.014;
  if (heightFraction <= 0.05) return 0.6;
  // Anchored on the trainee guide's three published points.
  const pts: [number, number][] = [
    [0.05, 0.6],
    [0.25, 0.235],
    [1, 0.014],
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    const [h0, r0] = pts[i];
    const [h1, r1] = pts[i + 1];
    if (heightFraction >= h0 && heightFraction <= h1) {
      const t = (heightFraction - h0) / (h1 - h0);
      return r0 + (r1 - r0) * t;
    }
  }
  return 0.014;
}

export function GroundEffect(p: DiagramProps) {
  const hf = Math.max(0.03, num(p.heightFraction, 0.4));
  const reduction = groundEffectReduction(hf);
  const inEffect = hf <= 1;

  const groundY = 246;
  const span = 150;
  const y = groundY - Math.min(1.7, hf) * 110;
  const cx = 200;

  const tilt = 26 * (1 - reduction / 0.6);

  return (
    <Diagram title="Ground effect within one wingspan">
      <ArrowDefs colors={{ lift: GO, down: BRAND }} />

      <rect x={0} y={groundY} width={500} height={54} fill="var(--color-surface-3)" />
      <line x1={0} y1={groundY} x2={500} y2={groundY} stroke={MUTED} strokeWidth={2} />
      {Array.from({ length: 16 }, (_, i) => (
        <line key={i} x1={i * 32} y1={groundY} x2={i * 32 - 12} y2={groundY + 12} stroke={MUTED} strokeWidth={1} opacity={0.5} />
      ))}

      <line x1={cx - span / 2} y1={groundY} x2={cx - span / 2} y2={groundY - 110} stroke={BRAND} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.5} />
      <text x={cx - span / 2 - 6} y={groundY - 116} textAnchor="middle" fill={BRAND} fontSize={9.5} fontWeight={700}>
        1 wingspan
      </text>

      <g transform={`translate(${cx} ${y})`}>
        <path d={`M${-span / 2} 0 L${span / 2} 0 L${span / 2} 9 L${-span / 2} 9 Z`} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2} />
        <Arrow x1={0} y1={-4} x2={tilt * 0.8} y2={-58} color={GO} id="lift" width={3} />
        <text x={tilt + 10} y={-62} fill={GO} fontSize={10} fontWeight={750}>
          total lift
        </text>
        <Arrow x1={span / 2 - 16} y1={9} x2={span / 2 - 16} y2={9 + 34 * (1 - reduction / 0.6)} color={BRAND} id="down" width={2.2} />
      </g>

      <g transform="translate(354 74)">
        <text x={0} y={0} fontSize={10.5} fontWeight={700} fill={MUTED}>
          HEIGHT
        </text>
        <text x={0} y={22} fontSize={19} fontWeight={800} fill={NAVY} className="tabular">
          {hf.toFixed(2)} span
        </text>
        <text x={0} y={58} fontSize={10.5} fontWeight={700} fill={MUTED}>
          INDUCED DRAG
        </text>
        <text x={0} y={80} fontSize={19} fontWeight={800} fill={inEffect ? GO : MUTED} className="tabular">
          −{Math.round(reduction * 100)}%
        </text>
        <text x={0} y={116} fontSize={10.5} fontWeight={700} fill={MUTED}>
          EFFECTIVE LIFT
        </text>
        <text x={0} y={138} fontSize={19} fontWeight={800} fill={inEffect ? GO : MUTED} className="tabular">
          {inEffect ? "increased" : "normal"}
        </text>
      </g>

      <RegionLabel
        x={200}
        y={36}
        text={inEffect ? "IN GROUND EFFECT" : "OUT OF GROUND EFFECT"}
        color={inEffect ? GO : MUTED}
        bg={inEffect ? "var(--color-go-soft)" : "var(--color-surface-2)"}
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function DragCurves(p: DiagramProps) {
  const cfg = dragConfigFrom(p);
  const reveal = str<"parasite" | "induced" | "total" | "all">(p.reveal, "all");
  const showComponents = bool(p.showComponents, true) && reveal !== "total";
  const showRegions = bool(p.showRegions, false);
  const ghostCfg = maybeNum(p.weight) !== null && num(p.weight, 1) !== 1 ? REFERENCE_DRAG : null;
  const markerV = maybeNum(p.marker);

  const vMax = 1.5;
  const dMax = 3.2;
  const plot = makePlot({ xMin: 0.1, xMax: vMax, yMin: 0, yMax: dMax, left: 52, bottom: 42, right: 24 });

  const ldV = ldMaxVelocity(cfg);
  const ldD = totalDrag(ldV, cfg);

  const show = (which: "parasite" | "induced" | "total") =>
    reveal === "all" || reveal === which || (reveal === "total" && which === "total");

  return (
    <Diagram title="Parasite, induced and total drag versus velocity">
      <Axes plot={plot} xLabel="Velocity (TAS)" yLabel="Drag" xTicks={4} yTicks={3} />

      {showRegions && (
        <>
          <RegionLabel x={plot.sx(ldV * 0.48)} y={plot.y1 + 22} text="INDUCED dominates" color={BRAND} bg="var(--color-brand-soft)" />
          <RegionLabel x={plot.sx(Math.min(vMax * 0.86, ldV * 2.1))} y={plot.y1 + 22} text="PARASITE dominates" color={CAUTION} bg="var(--color-caution-soft)" />
        </>
      )}

      {ghostCfg && (
        <Curve
          d={curvePath(plot, (v) => totalDrag(v, ghostCfg), { from: 0.1, to: vMax, clampTop: dMax })}
          color={GHOST}
          dashed
          width={2}
          label="baseline"
          labelAt={{ x: plot.sx(vMax * 0.72), y: plot.sy(totalDrag(vMax * 0.72, ghostCfg)) - 10 }}
        />
      )}

      {showComponents && show("parasite") && (
        <Curve
          d={curvePath(plot, (v) => parasiteDrag(v, cfg), { from: 0.1, to: vMax, clampTop: dMax })}
          color={CAUTION}
          width={2.2}
          label="Parasite"
          labelAt={{ x: plot.sx(vMax * 0.8), y: plot.sy(Math.min(dMax * 0.94, parasiteDrag(vMax * 0.8, cfg))) - 8 }}
        />
      )}
      {showComponents && show("induced") && (
        <Curve
          d={curvePath(plot, (v) => inducedDrag(v, cfg), { from: 0.16, to: vMax, clampTop: dMax })}
          color={BRAND}
          width={2.2}
          label="Induced"
          labelAt={{ x: plot.sx(vMax * 0.6), y: plot.sy(inducedDrag(vMax * 0.6, cfg)) + 18 }}
        />
      )}
      {show("total") && (
        <Curve
          d={curvePath(plot, (v) => totalDrag(v, cfg), { from: 0.16, to: vMax, clampTop: dMax })}
          color={NAVY}
          width={3}
          label="Total drag"
          labelAt={{ x: plot.sx(0.24), y: plot.sy(Math.min(dMax * 0.9, totalDrag(0.3, cfg))) - 12 }}
        />
      )}

      {(reveal === "all" || reveal === "total") && (
        <>
          <line x1={plot.sx(ldV)} y1={plot.sy(ldD)} x2={plot.sx(ldV)} y2={plot.y0} stroke={GO} strokeWidth={1.4} strokeDasharray="4 4" />
          <Marker x={plot.sx(ldV)} y={plot.sy(ldD)} color={GO} label="L/Dmax" side="top" pulse />
          <text x={plot.sx(ldV)} y={plot.y0 + 15} textAnchor="middle" fill={GO} fontSize={9.5} fontWeight={700}>
            min total drag
          </text>
        </>
      )}

      {markerV !== null && (
        <Marker
          x={plot.sx(markerV * vMax)}
          y={plot.sy(Math.min(dMax, totalDrag(markerV * vMax, cfg)))}
          color={NOGO}
          r={6}
        />
      )}
    </Diagram>
  );
}
