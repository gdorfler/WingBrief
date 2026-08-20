"use client";

/** Unit 4 diagrams: thrust and power curves, excess, takeoff, climb, glide. */

import {
  type DragConfig,
  type EngineType,
  REFERENCE_DRAG,
  argMax,
  ldMaxVelocity,
  maxEnduranceVelocity,
  powerAvailable,
  powerRequired,
  thrustAvailable,
  thrustRequired,
} from "@/lib/aero";
import {
  AircraftSide,
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
import { dragConfigFrom } from "./drag";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";
const GHOST = "var(--color-series-ghost)";

const V_MAX = 1.5;

function baselineFor(p: DiagramProps): DragConfig | null {
  const changed =
    num(p.weight, 1) !== 1 ||
    num(p.altitude, 0) !== 0 ||
    bool(p.gear, false) ||
    bool(p.flaps, false);
  return changed ? REFERENCE_DRAG : null;
}

function configFrom(p: DiagramProps): { cfg: DragConfig; engine: EngineType } {
  const altitude = num(p.altitude, 0);
  // Density ratio from the standard atmosphere, so altitude shifts are honest.
  const densityRatio = altitude === 0 ? 1 : Math.exp(-altitude / 27_500);
  const cfg = dragConfigFrom({ ...p, densityRatio });
  return { cfg, engine: str<EngineType>(p.engine, "turboprop") };
}

/* ------------------------------------------------------------------ */

export function ThrustCurves(p: DiagramProps) {
  const { cfg, engine } = configFrom(p);
  const baseline = baselineFor(p);
  const ghost = bool(p.ghost, baseline !== null);
  const showExcess = bool(p.showExcess, false);
  const showAvailable = bool(p.showAvailable, true);

  const yMax = 3.4;
  const plot = makePlot({ xMin: 0.1, xMax: V_MAX, yMin: 0, yMax, left: 52, bottom: 42, right: 24 });
  const ldV = ldMaxVelocity(cfg);

  const teV = argMax((v) => thrustAvailable(v, engine, cfg.densityRatio) - thrustRequired(v, cfg));

  return (
    <Diagram title="Thrust required and thrust available">
      <Axes plot={plot} xLabel="Velocity (TAS)" yLabel="Thrust" xTicks={4} yTicks={3} />

      {ghost && baseline && (
        <Curve
          d={curvePath(plot, (v) => thrustRequired(v, baseline), { from: 0.16, to: V_MAX, clampTop: yMax })}
          color={GHOST}
          dashed
          width={2}
          label="baseline T_R"
          labelAt={{ x: plot.sx(0.22), y: plot.sy(Math.min(yMax * 0.92, thrustRequired(0.3, baseline))) - 10 }}
        />
      )}

      <Curve
        d={curvePath(plot, (v) => thrustRequired(v, cfg), { from: 0.16, to: V_MAX, clampTop: yMax })}
        color={NAVY}
        width={3}
        label="T required"
        labelAt={{ x: plot.sx(V_MAX * 0.78), y: plot.sy(Math.min(yMax * 0.9, thrustRequired(V_MAX * 0.78, cfg))) - 10 }}
      />

      {showAvailable && (
        <Curve
          d={curvePath(plot, (v) => thrustAvailable(v, engine, cfg.densityRatio), { from: 0.1, to: V_MAX, clampTop: yMax })}
          color={GO}
          width={2.6}
          label="T available"
          labelAt={{ x: plot.sx(0.16), y: plot.sy(Math.min(yMax * 0.96, thrustAvailable(0.16, engine, cfg.densityRatio))) - 10 }}
        />
      )}

      {showExcess && showAvailable && (
        <g>
          <line
            x1={plot.sx(teV)}
            y1={plot.sy(Math.min(yMax, thrustAvailable(teV, engine, cfg.densityRatio)))}
            x2={plot.sx(teV)}
            y2={plot.sy(thrustRequired(teV, cfg))}
            stroke={NOGO}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.8}
          />
          <text x={plot.sx(teV) + 8} y={plot.sy(thrustRequired(teV, cfg)) - 22} fill={NOGO} fontSize={10} fontWeight={750}>
            max excess thrust
          </text>
        </g>
      )}

      <line x1={plot.sx(ldV)} y1={plot.sy(thrustRequired(ldV, cfg))} x2={plot.sx(ldV)} y2={plot.y0} stroke={BRAND} strokeWidth={1.3} strokeDasharray="4 4" />
      <Marker x={plot.sx(ldV)} y={plot.sy(thrustRequired(ldV, cfg))} color={BRAND} label="L/Dmax" side="bottom" />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function PowerCurves(p: DiagramProps) {
  const { cfg, engine } = configFrom(p);
  const baseline = baselineFor(p);
  const ghost = bool(p.ghost, baseline !== null);
  const showRegions = bool(p.showRegions, false);
  const showRangeEndurance = bool(p.showRangeEndurance, false);
  const showAvailable = bool(p.showAvailable, !showRegions && !showRangeEndurance);
  const markerV = maybeNum(p.marker);

  const yMax = 1.9;
  const plot = makePlot({ xMin: 0.1, xMax: V_MAX, yMin: 0, yMax, left: 52, bottom: 42, right: 24 });

  const ldV = ldMaxVelocity(cfg);
  const enduranceV = maxEnduranceVelocity(cfg);

  return (
    <Diagram title="Power required and the regions of command">
      <Axes plot={plot} xLabel="Velocity (TAS)" yLabel="Power" xTicks={4} yTicks={3} />

      {showRegions && (
        <>
          <rect
            x={plot.x0}
            y={plot.y1}
            width={plot.sx(enduranceV) - plot.x0}
            height={plot.h}
            fill={NOGO}
            opacity={0.06}
          />
          <RegionLabel x={(plot.x0 + plot.sx(enduranceV)) / 2} y={plot.y1 + 20} text="REVERSE command" color={NOGO} bg="var(--color-nogo-soft)" />
          <RegionLabel x={(plot.sx(enduranceV) + plot.x1) / 2} y={plot.y1 + 20} text="NORMAL command" color={GO} bg="var(--color-go-soft)" />
        </>
      )}

      {ghost && baseline && (
        <Curve
          d={curvePath(plot, (v) => powerRequired(v, baseline), { from: 0.16, to: V_MAX, clampTop: yMax })}
          color={GHOST}
          dashed
          width={2}
        />
      )}

      <Curve
        d={curvePath(plot, (v) => powerRequired(v, cfg), { from: 0.16, to: V_MAX, clampTop: yMax })}
        color={NAVY}
        width={3}
        label="P required"
        labelAt={{ x: plot.sx(V_MAX * 0.76), y: plot.sy(Math.min(yMax * 0.9, powerRequired(V_MAX * 0.76, cfg))) - 10 }}
      />

      {showAvailable && (
        <Curve
          d={curvePath(plot, (v) => powerAvailable(v, engine, cfg.densityRatio), { from: 0.1, to: V_MAX, clampTop: yMax })}
          color={GO}
          width={2.6}
          label="P available"
          labelAt={{ x: plot.sx(0.5), y: plot.sy(Math.min(yMax * 0.96, powerAvailable(0.5, engine, cfg.densityRatio))) - 10 }}
        />
      )}

      <line x1={plot.sx(enduranceV)} y1={plot.sy(powerRequired(enduranceV, cfg))} x2={plot.sx(enduranceV)} y2={plot.y0} stroke={CAUTION} strokeWidth={1.3} strokeDasharray="4 4" />
      <Marker x={plot.sx(enduranceV)} y={plot.sy(powerRequired(enduranceV, cfg))} color={CAUTION} label={showRangeEndurance ? "Max endurance" : "Min P_R"} side="bottom" />

      {showRangeEndurance && (
        <>
          <line x1={plot.x0} y1={plot.y0} x2={plot.sx(ldV)} y2={plot.sy(powerRequired(ldV, cfg))} stroke={BRAND} strokeWidth={1.6} strokeDasharray="5 4" />
          <Marker x={plot.sx(ldV)} y={plot.sy(powerRequired(ldV, cfg))} color={BRAND} label="Max range = L/Dmax" side="top" />
        </>
      )}
      {!showRangeEndurance && (
        <Marker x={plot.sx(ldV)} y={plot.sy(powerRequired(ldV, cfg))} color={BRAND} label="L/Dmax" side="top" r={4} />
      )}

      {markerV !== null && (
        <Marker
          x={plot.sx(0.1 + markerV * (V_MAX - 0.1))}
          y={plot.sy(Math.min(yMax, powerRequired(0.1 + markerV * (V_MAX - 0.1), cfg)))}
          color={NOGO}
          r={6}
          pulse
        />
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function ExcessCurves(p: DiagramProps) {
  const { cfg, engine } = configFrom(p);
  const yMax = 1.9;
  const plot = makePlot({ xMin: 0.1, xMax: V_MAX, yMin: 0, yMax, left: 52, bottom: 42, right: 24 });

  const ldV = ldMaxVelocity(cfg);
  const teV = argMax((v) => thrustAvailable(v, engine, cfg.densityRatio) - thrustRequired(v, cfg));
  const peV = argMax((v) => powerAvailable(v, engine, cfg.densityRatio) - powerRequired(v, cfg));

  return (
    <Diagram title="Where maximum excess thrust and excess power occur">
      <Axes plot={plot} xLabel="Velocity (TAS)" yLabel="Power" xTicks={4} yTicks={3} />

      <Curve d={curvePath(plot, (v) => powerRequired(v, cfg), { from: 0.16, to: V_MAX, clampTop: yMax })} color={NAVY} width={2.8} label="P required" labelAt={{ x: plot.sx(1.18), y: plot.sy(Math.min(yMax * 0.86, powerRequired(1.18, cfg))) - 10 }} />
      <Curve d={curvePath(plot, (v) => powerAvailable(v, engine, cfg.densityRatio), { from: 0.1, to: V_MAX, clampTop: yMax })} color={GO} width={2.6} label="P available" labelAt={{ x: plot.sx(0.42), y: plot.sy(Math.min(yMax * 0.96, powerAvailable(0.42, engine, cfg.densityRatio))) - 10 }} />

      <line
        x1={plot.sx(peV)}
        y1={plot.sy(Math.min(yMax, powerAvailable(peV, engine, cfg.densityRatio)))}
        x2={plot.sx(peV)}
        y2={plot.sy(powerRequired(peV, cfg))}
        stroke={BRAND}
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.85}
      />
      <Marker x={plot.sx(peV)} y={plot.sy(powerRequired(peV, cfg))} color={BRAND} label="max P excess" side="bottom" r={4} />

      <line x1={plot.sx(teV)} y1={plot.y0} x2={plot.sx(teV)} y2={plot.y1} stroke={NOGO} strokeWidth={1.4} strokeDasharray="4 4" />
      <text x={plot.sx(teV) - 6} y={plot.y1 + 16} textAnchor="end" fill={NOGO} fontSize={10} fontWeight={750}>
        max T excess
      </text>

      <line x1={plot.sx(ldV)} y1={plot.y0} x2={plot.sx(ldV)} y2={plot.y1} stroke={CAUTION} strokeWidth={1.4} strokeDasharray="4 4" />
      <text x={plot.sx(ldV) + 6} y={plot.y1 + 16} fill={CAUTION} fontSize={10} fontWeight={750}>
        L/Dmax
      </text>

      <text x={250} y={plot.y0 + 34} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        {engine === "turboprop"
          ? "Turboprop: max T excess BELOW L/Dmax · max P excess AT L/Dmax"
          : "Turbojet: max T excess AT L/Dmax · max P excess ABOVE L/Dmax"}
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function ThrustPowerPair(p: DiagramProps) {
  const highlight = str<"none" | "tr" | "pr">(p.highlight, "none");
  const altitude = num(p.altitude, 0);
  const showAvailable = bool(p.showAvailable, false);
  const dim = (on: boolean) => (highlight === "none" || on ? 1 : 0.3);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div style={{ opacity: dim(highlight === "tr") }}>
        <ThrustCurves altitude={altitude} showAvailable={showAvailable} ghost={altitude !== 0} />
      </div>
      <div style={{ opacity: dim(highlight === "pr") }}>
        <PowerCurves altitude={altitude} showAvailable={showAvailable} ghost={altitude !== 0} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function TakeoffForces() {
  const y = 176;
  return (
    <Diagram title="Forces during the takeoff roll">
      <ArrowDefs colors={{ t: BRAND, d: CAUTION, fr: NOGO, l: GO, w: NAVY }} />
      <rect x={0} y={y + 26} width={500} height={40} fill="var(--color-surface-3)" />
      <line x1={0} y1={y + 26} x2={500} y2={y + 26} stroke={MUTED} strokeWidth={2} />

      <AircraftSide x={250} y={y} scale={1.4} />

      <Arrow x1={296} y1={y} x2={404} y2={y} color={BRAND} id="t" width={3.4} label="Thrust" labelOffset={{ x: 0, y: -12 }} />
      <Arrow x1={204} y1={y} x2={112} y2={y} color={CAUTION} id="d" width={3} label="Drag" labelOffset={{ x: 0, y: -12 }} />
      <Arrow x1={250} y1={y - 18} x2={250} y2={y - 84} color={GO} id="l" width={3} label="Lift" labelOffset={{ x: 0, y: -10 }} />
      <Arrow x1={250} y1={y + 18} x2={250} y2={y + 24} color={NAVY} id="w" width={3} />
      <Arrow x1={216} y1={y + 26} x2={140} y2={y + 26} color={NOGO} id="fr" width={2.6} label="Rolling friction" labelOffset={{ x: -6, y: 18 }} />

      <g transform="translate(250 52)">
        <rect x={-158} y={-22} width={316} height={40} rx={12} fill="var(--color-surface-2)" />
        <text x={0} y={4} textAnchor="middle" fontWeight={800} fill={NAVY} fontSize={14}>
          Net accelerating force = T − D − F_R
        </text>
      </g>
      <text x={250} y={282} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        F_R = μ(W − L) — friction falls as lift builds during the roll
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function ClimbVectors(p: DiagramProps) {
  const which = str<"both" | "vx" | "vy">(p.which, "both");
  const groundY = 250;
  const startX = 62;

  const profiles = [
    { key: "vx", label: "Vx — max ANGLE", angle: 26, distance: 150, gain: 120, color: BRAND, note: "obstacle clearance · thrust excess" },
    { key: "vy", label: "Vy — max RATE", angle: 15, distance: 300, gain: 148, color: GO, note: "expedite climb · power excess" },
  ].filter((pr) => which === "both" || which === pr.key);

  return (
    <Diagram title="Maximum angle of climb versus maximum rate of climb">
      <ArrowDefs colors={{ vx: BRAND, vy: GO }} />
      <rect x={0} y={groundY} width={500} height={50} fill="var(--color-surface-3)" />
      <line x1={0} y1={groundY} x2={500} y2={groundY} stroke={MUTED} strokeWidth={2} />

      <rect x={214} y={groundY - 96} width={22} height={96} fill="var(--color-surface-3)" stroke={MUTED} strokeWidth={1.5} />
      <text x={225} y={groundY - 104} textAnchor="middle" fill={MUTED} fontSize={9.5} fontWeight={700}>
        obstacle
      </text>

      {profiles.map((pr) => {
        const endX = startX + pr.distance;
        const endY = groundY - pr.gain;
        return (
          <g key={pr.key}>
            <Arrow x1={startX} y1={groundY} x2={endX} y2={endY} color={pr.color} id={pr.key} width={3} />
            <g transform={`translate(${endX} ${endY}) rotate(${-pr.angle})`}>
              <AircraftSide x={0} y={0} scale={0.8} fill={pr.color} />
            </g>
            <text x={endX + 12} y={endY - 14} fill={pr.color} fontWeight={800} fontSize={11}>
              {pr.label}
            </text>
            <text x={endX + 12} y={endY} fill={MUTED} fontSize={9.5}>
              {pr.note}
            </text>
          </g>
        );
      })}

      <text x={250} y={groundY + 32} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Both flown at maximum power — only AOA and airspeed differ
      </text>
      <g transform="translate(56 42)">
        <text x={0} y={0} fontSize={10.5} fontWeight={750} fill={BRAND}>
          sin γ = T_E / W
        </text>
        <text x={0} y={18} fontSize={10.5} fontWeight={750} fill={GO}>
          ROC = P_E / W
        </text>
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function GlideVectors(p: DiagramProps) {
  const which = str<"both" | "range" | "endurance">(p.which, "both");
  const startX = 74;
  const startY = 66;

  const profiles = [
    { key: "range", label: "Max glide RANGE", sub: "minimum angle of descent · L/Dmax", dx: 330, dy: 150, color: BRAND },
    { key: "endurance", label: "Max glide ENDURANCE", sub: "minimum rate of descent · below L/Dmax", dx: 210, dy: 176, color: CAUTION },
  ].filter((pr) => which === "both" || which === pr.key);

  return (
    <Diagram title="Maximum glide range versus maximum glide endurance">
      <ArrowDefs colors={{ range: BRAND, endurance: CAUTION }} />
      <rect x={0} y={252} width={500} height={48} fill="var(--color-surface-3)" />
      <line x1={0} y1={252} x2={500} y2={252} stroke={MUTED} strokeWidth={2} />

      <AircraftSide x={startX} y={startY} scale={0.9} />

      {profiles.map((pr) => (
        <g key={pr.key}>
          <Arrow x1={startX + 26} y1={startY + 8} x2={startX + pr.dx} y2={startY + pr.dy} color={pr.color} id={pr.key} width={2.8} dashed />
          <text x={startX + pr.dx + 6} y={startY + pr.dy + 4} fill={pr.color} fontWeight={800} fontSize={10.5} textAnchor={pr.key === "range" ? "end" : "start"}>
            {pr.label}
          </text>
          <text x={startX + pr.dx + 6} y={startY + pr.dy + 18} fill={MUTED} fontSize={9} textAnchor={pr.key === "range" ? "end" : "start"}>
            {pr.sub}
          </text>
        </g>
      ))}

      <text x={250} y={286} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Max glide range is L/Dmax for ANY aircraft · T-6B 125 KIAS, 11:1 clean
      </text>
    </Diagram>
  );
}
