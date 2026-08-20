"use client";

/** Units 5 and 6 diagrams: turns, V-n, slips and skids, spins, wake, shear. */

import {
  T6B_VN,
  type VnConfig,
  acceleratedStallSpeed,
  envelopeVerdict,
  loadFactor,
  maneuverSpeed,
  stallSpeedMultiplier,
  turnRadius,
  turnRate,
  vortexStrength,
  wakeSinkRate,
} from "@/lib/aero";
import {
  AircraftSide,
  AircraftTop,
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

/* ------------------------------------------------------------------ */

export function TurnForces(p: DiagramProps) {
  const bank = num(p.bank, 45);
  const showRequired = bool(p.showRequired, true);
  const showAoa = bool(p.showAoa, false);
  const showStall = bool(p.showStall, false);

  const n = loadFactor(bank);
  const cx = 200;
  const cy = 156;
  const weightLen = 78;
  const liftLen = weightLen * n;
  const rad = (bank * Math.PI) / 180;
  const lx = cx + Math.sin(rad) * liftLen;
  const ly = cy - Math.cos(rad) * liftLen;

  return (
    <Diagram title="Lift components in a level banked turn">
      <ArrowDefs colors={{ lift: GO, weight: NAVY, horiz: BRAND, vert: CAUTION }} />

      <g transform={`translate(${cx} ${cy}) rotate(${-bank})`}>
        <path d="M-84 0 L84 0 L84 9 L-84 9 Z" fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2} />
        <circle cx={0} cy={4} r={11} fill="var(--color-surface)" stroke={NAVY} strokeWidth={2} />
      </g>

      <Arrow x1={cx} y1={cy} x2={lx} y2={ly} color={GO} id="lift" width={3.6} />
      <text x={lx + 8} y={ly - 6} fill={GO} fontWeight={800} fontSize={11}>
        Total lift
      </text>

      {showRequired && (
        <>
          <line x1={cx} y1={cy} x2={cx} y2={cy - weightLen} stroke={CAUTION} strokeWidth={2.6} strokeDasharray="5 4" />
          <line x1={cx} y1={cy - weightLen} x2={lx} y2={cy - weightLen} stroke={GHOST} strokeWidth={1.4} strokeDasharray="3 3" />
          <line x1={lx} y1={cy - weightLen} x2={lx} y2={ly} stroke={GHOST} strokeWidth={1.4} strokeDasharray="3 3" />
          <text x={cx - 8} y={cy - weightLen / 2} textAnchor="end" fill={CAUTION} fontSize={10} fontWeight={750}>
            vertical
          </text>
          <Arrow x1={cx} y1={cy} x2={lx} y2={cy} color={BRAND} id="horiz" width={2.4} />
          <text x={(cx + lx) / 2} y={cy + 18} textAnchor="middle" fill={BRAND} fontSize={10} fontWeight={750}>
            horizontal (centripetal)
          </text>
        </>
      )}

      <Arrow x1={cx} y1={cy} x2={cx} y2={cy + weightLen} color={NAVY} id="weight" width={3} />
      <text x={cx - 8} y={cy + weightLen} textAnchor="end" fill={NAVY} fontSize={11} fontWeight={800}>
        Weight
      </text>

      <g transform="translate(392 60)">
        <text x={0} y={0} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          BANK
        </text>
        <text x={0} y={22} textAnchor="middle" fontSize={20} fontWeight={800} fill={NAVY} className="tabular">
          {Math.round(bank)}°
        </text>
        <text x={0} y={56} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          LOAD FACTOR
        </text>
        <text x={0} y={78} textAnchor="middle" fontSize={20} fontWeight={800} fill={n > 4 ? NOGO : NAVY} className="tabular">
          {n.toFixed(2)} G
        </text>
        {showStall && (
          <>
            <text x={0} y={112} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
              STALL SPEED
            </text>
            <text x={0} y={134} textAnchor="middle" fontSize={20} fontWeight={800} fill={NOGO} className="tabular">
              ×{stallSpeedMultiplier(n).toFixed(2)}
            </text>
          </>
        )}
        {showAoa && !showStall && (
          <>
            <text x={0} y={112} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
              AOA DEMAND
            </text>
            <text x={0} y={134} textAnchor="middle" fontSize={16} fontWeight={800} fill={CAUTION}>
              higher
            </text>
          </>
        )}
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function TurnGeometry(p: DiagramProps) {
  const bank = num(p.bank, 30);
  const speedT = num(p.speed, 0.5);
  const show = str<"rate" | "radius" | "both" | "formulas">(p.show, "both");

  const kts = 90 + speedT * 180;
  const rate = turnRate(bank, kts);
  const radiusFt = turnRadius(bank, kts);
  const pxRadius = Math.max(24, Math.min(122, radiusFt / 62));

  const cx = 190;
  const cy = 158;

  return (
    <Diagram title="Turn rate and turn radius">
      <ArrowDefs colors={{ r: BRAND }} />
      <circle cx={cx} cy={cy} r={pxRadius} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="6 5" />
      <circle cx={cx} cy={cy} r={3.5} fill={MUTED} />

      {(show === "radius" || show === "both") && (
        <>
          <Arrow x1={cx} y1={cy} x2={cx + pxRadius} y2={cy} color={BRAND} id="r" width={2.2} />
          <text x={cx + pxRadius / 2} y={cy - 8} textAnchor="middle" fill={BRAND} fontSize={10.5} fontWeight={750}>
            radius
          </text>
        </>
      )}

      <AircraftTop x={cx} y={cy - pxRadius} scale={0.7} rotate={90} />

      {(show === "rate" || show === "both") && (
        <path
          d={`M${cx + pxRadius * 0.62} ${cy - pxRadius * 0.62} A ${pxRadius * 0.88} ${pxRadius * 0.88} 0 0 1 ${cx + pxRadius * 0.88} ${cy + pxRadius * 0.3}`}
          fill="none"
          stroke={GO}
          strokeWidth={2.4}
          markerEnd="url(#arrow-r)"
          opacity={0.85}
        />
      )}

      <g transform="translate(390 68)">
        <text x={0} y={0} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          AIRSPEED
        </text>
        <text x={0} y={20} textAnchor="middle" fontSize={17} fontWeight={800} fill={NAVY} className="tabular">
          {Math.round(kts)} kt
        </text>
        <text x={0} y={50} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          BANK
        </text>
        <text x={0} y={70} textAnchor="middle" fontSize={17} fontWeight={800} fill={NAVY} className="tabular">
          {Math.round(bank)}°
        </text>
        <text x={0} y={100} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          TURN RATE
        </text>
        <text x={0} y={120} textAnchor="middle" fontSize={17} fontWeight={800} fill={GO} className="tabular">
          {rate.toFixed(1)}°/s
        </text>
        <text x={0} y={150} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
          TURN RADIUS
        </text>
        <text x={0} y={170} textAnchor="middle" fontSize={17} fontWeight={800} fill={BRAND} className="tabular">
          {Math.round(radiusFt).toLocaleString()} ft
        </text>
      </g>

      {show === "formulas" && (
        <g transform="translate(190 274)">
          <text x={0} y={0} textAnchor="middle" fontSize={11.5} fontWeight={750} fill={NAVY}>
            ω = g tan φ / V · r = V² / (g tan φ)
          </text>
        </g>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function VnDiagram(p: DiagramProps) {
  const weight = num(p.weight, 1);
  const reveal = Math.round(num(p.reveal, 6));
  const pointKias = maybeNum(p.kias);
  const pointN = maybeNum(p.loadFactor);

  const cfg: VnConfig = {
    ...T6B_VN,
    stallSpeed: T6B_VN.stallSpeed * Math.sqrt(weight),
    positiveLimit: T6B_VN.positiveLimit / weight,
    negativeLimit: T6B_VN.negativeLimit / weight,
  };

  const plot = makePlot({ xMin: 0, xMax: 360, yMin: -5, yMax: 9, left: 50, bottom: 40, right: 22 });
  const zeroY = plot.sy(0);
  const va = maneuverSpeed(cfg);

  const stallCurve = (sign: 1 | -1, limit: number) =>
    curvePath(
      plot,
      (t) => {
        const kias = t;
        const nAt = sign * (kias / cfg.stallSpeed) ** 2;
        return sign > 0 ? Math.min(nAt, limit) : Math.max(nAt, limit);
      },
      { from: 0, to: 360, steps: 200 },
    );

  const verdict =
    pointKias !== null && pointN !== null ? envelopeVerdict(cfg, pointKias, pointN) : null;
  const verdictColor =
    verdict === "safe" ? GO : verdict === "stall" ? CAUTION : verdict === null ? NAVY : NOGO;

  return (
    <Diagram title="V-n diagram: the safe flight envelope">
      <Axes plot={plot} xLabel="Indicated airspeed (KIAS)" yLabel="Load factor (G)" grid={false} />

      {[0, 100, 200, 300].map((v) => (
        <line key={v} className="grid" x1={plot.sx(v)} y1={plot.y1} x2={plot.sx(v)} y2={plot.y0} />
      ))}
      {[-4, -2, 0, 2, 4, 6, 8].map((n) => (
        <g key={n}>
          <line className="grid" x1={plot.x0} y1={plot.sy(n)} x2={plot.x1} y2={plot.sy(n)} />
          <text x={plot.x0 - 7} y={plot.sy(n) + 4} textAnchor="end" fontSize={9.5}>
            {n}
          </text>
        </g>
      ))}
      {[100, 200, 300].map((v) => (
        <text key={v} x={plot.sx(v)} y={plot.y0 + 15} textAnchor="middle" fontSize={9.5}>
          {v}
        </text>
      ))}

      {reveal >= 6 && (
        <path
          d={`${stallCurve(1, cfg.positiveLimit)} L${plot.sx(cfg.redline)} ${plot.sy(cfg.positiveLimit)} L${plot.sx(cfg.redline)} ${plot.sy(cfg.negativeLimit)} ${stallCurve(-1, cfg.negativeLimit).replace("M", "L").split("L").slice(1).reverse().map((s) => `L${s}`).join("")} Z`}
          fill={GO}
          opacity={0.08}
        />
      )}

      <line x1={plot.x0} y1={zeroY} x2={plot.x1} y2={zeroY} stroke="var(--color-line-strong)" strokeWidth={1.4} />

      {reveal >= 2 && (
        <>
          <Curve d={stallCurve(1, cfg.positiveLimit)} color={CAUTION} width={2.6} />
          <Curve d={stallCurve(-1, cfg.negativeLimit)} color={CAUTION} width={2.6} />
          <text x={plot.sx(58)} y={plot.sy(3.4)} fill={CAUTION} fontSize={9.5} fontWeight={750}>
            accelerated
          </text>
          <text x={plot.sx(58)} y={plot.sy(2.8)} fill={CAUTION} fontSize={9.5} fontWeight={750}>
            stall lines
          </text>
        </>
      )}

      {reveal >= 3 && (
        <>
          <line x1={plot.sx(va)} y1={plot.sy(cfg.positiveLimit)} x2={plot.sx(cfg.redline)} y2={plot.sy(cfg.positiveLimit)} stroke={NOGO} strokeWidth={2.6} />
          <line
            x1={plot.sx(acceleratedStallSpeed(cfg, Math.abs(cfg.negativeLimit)))}
            y1={plot.sy(cfg.negativeLimit)}
            x2={plot.sx(cfg.redline)}
            y2={plot.sy(cfg.negativeLimit)}
            stroke={NOGO}
            strokeWidth={2.6}
          />
          <text x={plot.sx(300)} y={plot.sy(cfg.positiveLimit) - 8} textAnchor="end" fill={NOGO} fontSize={9.5} fontWeight={750}>
            limit load +{cfg.positiveLimit.toFixed(1)} G
          </text>
          <text x={plot.sx(300)} y={plot.sy(cfg.negativeLimit) + 16} textAnchor="end" fill={NOGO} fontSize={9.5} fontWeight={750}>
            limit load {cfg.negativeLimit.toFixed(1)} G
          </text>
        </>
      )}

      {reveal >= 4 && (
        <>
          <line x1={plot.sx(cfg.redline)} y1={plot.y0} x2={plot.sx(cfg.redline)} y2={plot.y1} stroke={NOGO} strokeWidth={2.8} />
          <text
            transform={`translate(${plot.sx(cfg.redline) - 8} ${plot.sy(1)}) rotate(-90)`}
            textAnchor="middle"
            fill={NOGO}
            fontSize={9.5}
            fontWeight={800}
          >
            V_NE {cfg.redline}
          </text>
        </>
      )}

      {reveal >= 5 && (
        <>
          <Marker x={plot.sx(va)} y={plot.sy(cfg.positiveLimit)} color={BRAND} label="maneuver point" side="top" pulse={reveal === 5} />
          <line x1={plot.sx(va)} y1={plot.sy(cfg.positiveLimit)} x2={plot.sx(va)} y2={plot.y0} stroke={BRAND} strokeWidth={1.3} strokeDasharray="4 4" />
          <text x={plot.sx(va)} y={plot.y0 + 28} textAnchor="middle" fill={BRAND} fontSize={9.5} fontWeight={750}>
            Va {Math.round(va)} KIAS
          </text>
        </>
      )}

      {pointKias !== null && pointN !== null && (
        <>
          <Marker x={plot.sx(pointKias)} y={plot.sy(pointN)} color={verdictColor} r={7} pulse />
          <RegionLabel
            x={250}
            y={plot.y1 + 12}
            text={
              verdict === "safe"
                ? "INSIDE THE ENVELOPE"
                : verdict === "stall"
                  ? "STALL — CLmax AOA exceeded"
                  : verdict === "overspeed"
                    ? "OVERSPEED — beyond V_NE"
                    : "OVER-G — limit load exceeded"
            }
            color={verdictColor}
            bg={verdict === "safe" ? "var(--color-go-soft)" : verdict === "stall" ? "var(--color-caution-soft)" : "var(--color-nogo-soft)"}
          />
        </>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function SlipSkid(p: DiagramProps) {
  const mode = str<"coordinated" | "slip" | "skid">(p.mode, "skid");

  const config = {
    coordinated: { noseOffset: 0, ballOffset: 0, label: "COORDINATED", color: GO, rudder: "correct rudder", radius: "—", rate: "—" },
    slip: { noseOffset: 16, ballOffset: -16, label: "SLIP", color: CAUTION, rudder: "insufficient rudder", radius: "increases", rate: "decreases" },
    skid: { noseOffset: -16, ballOffset: 16, label: "SKID", color: NOGO, rudder: "excessive rudder", radius: "decreases", rate: "increases" },
  }[mode];

  const cx = 156;
  const cy = 142;

  return (
    <Diagram title={`Turn coordination: ${config.label.toLowerCase()}`}>
      <ArrowDefs colors={{ path: MUTED }} />

      <path d={`M40 ${cy + 80} Q${cx} ${cy - 96} ${cx + 130} ${cy + 48}`} fill="none" stroke={MUTED} strokeWidth={2} strokeDasharray="6 5" />
      <text x={54} y={cy + 98} fill={MUTED} fontSize={9.5} fontWeight={700}>
        flight path
      </text>

      <AircraftTop x={cx} y={cy} scale={1.1} rotate={-30 + config.noseOffset} />
      {mode !== "coordinated" && (
        <text
          x={cx + (config.noseOffset > 0 ? 54 : -60)}
          y={cy - 34}
          fill={config.color}
          fontSize={10}
          fontWeight={800}
          textAnchor="middle"
        >
          nose {config.noseOffset > 0 ? "OUTSIDE" : "INSIDE"}
        </text>
      )}

      {/* Turn and slip indicator */}
      <g transform="translate(368 106)">
        <rect x={-84} y={-58} width={168} height={116} rx={14} fill="var(--color-ink-800)" />
        <text x={0} y={-38} textAnchor="middle" fill="#8fb0d4" fontSize={9} fontWeight={700}>
          TURN AND SLIP
        </text>
        <line x1={0} y1={-28} x2={0} y2={-6} stroke="#e6eefa" strokeWidth={2.5} />
        <line x1={-30} y1={-28} x2={-30} y2={-14} stroke="#5f7fa4" strokeWidth={2} />
        <line x1={30} y1={-28} x2={30} y2={-14} stroke="#5f7fa4" strokeWidth={2} />
        <g transform="rotate(-18)">
          <line x1={0} y1={-26} x2={0} y2={-4} stroke="#4fa3ff" strokeWidth={3.5} strokeLinecap="round" />
        </g>
        <path d="M-44 22 A 50 50 0 0 0 44 22" fill="none" stroke="#31506f" strokeWidth={14} strokeLinecap="round" />
        <circle cx={config.ballOffset} cy={config.ballOffset === 0 ? 24 : 26} r={6.5} fill="#f2f7fd" />
        <line x1={-7} y1={16} x2={-7} y2={34} stroke="#6f8fb4" strokeWidth={1.5} />
        <line x1={7} y1={16} x2={7} y2={34} stroke="#6f8fb4" strokeWidth={1.5} />
        <text x={0} y={50} textAnchor="middle" fill={config.color} fontSize={11} fontWeight={800}>
          {config.label}
        </text>
      </g>

      <g transform="translate(56 236)">
        <text x={0} y={0} fontSize={10.5} fontWeight={750} fill={config.color}>
          {config.rudder}
        </text>
        {mode !== "coordinated" && (
          <>
            <text x={0} y={20} fontSize={10} fontWeight={650} fill={NAVY}>
              turn radius {config.radius} · turn rate {config.rate}
            </text>
            <text x={0} y={38} fontSize={10} fontWeight={700} fill={mode === "skid" ? NOGO : GO}>
              {mode === "skid" ? "a stall here rolls you INVERTED" : "a stall here rolls toward wings level"}
            </text>
          </>
        )}
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function SpinWings(p: DiagramProps) {
  const yaw = Math.min(1, Math.max(0, num(p.yaw, 1)));
  const showRelWind = bool(p.showRelWind, true);
  const showCoeffs = bool(p.showCoeffs, true);
  const highlight = str<"none" | "lift" | "drag">(p.highlight, "none");

  const baseAoa = 22;
  const downAoa = baseAoa + yaw * 10;
  const upAoa = baseAoa - yaw * 7;

  // Past CLmax AOA, more AOA means less CL and more CD.
  const clOf = (a: number) => Math.max(0.3, 1.5 - (a - 16) * 0.055);
  const cdOf = (a: number) => 0.2 + (a - 12) * 0.055;

  const wings = [
    { key: "down", label: "DOWN-GOING (inside)", aoa: downAoa, x: 130, color: NOGO, note: "MORE stalled" },
    { key: "up", label: "UP-GOING (outside)", aoa: upAoa, x: 370, color: BRAND, note: "less stalled" },
  ];

  return (
    <Diagram title="Asymmetric stall during a spin">
      <ArrowDefs colors={{ rw: MUTED, roll: NOGO, lift: GO, drag: CAUTION }} />

      <text x={250} y={30} textAnchor="middle" fontSize={11} fontWeight={750} fill={NAVY}>
        Both wings stalled — but not equally
      </text>

      {wings.map((w) => {
        const cy = 128;
        const cl = clOf(w.aoa);
        const cd = cdOf(w.aoa);
        return (
          <g key={w.key}>
            <g transform={`translate(${w.x} ${cy}) rotate(${-w.aoa * 0.7})`}>
              <path d="M-46 0 L46 0 L46 8 L-46 8 Z" fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2} />
            </g>
            {showRelWind && (
              <Arrow
                x1={w.x - 66}
                y1={cy + (w.key === "down" ? 40 : -30)}
                x2={w.x - 24}
                y2={cy + (w.key === "down" ? 16 : -6)}
                color={MUTED}
                id="rw"
                width={2}
              />
            )}
            <text x={w.x} y={cy - 44} textAnchor="middle" fill={w.color} fontSize={10.5} fontWeight={800}>
              {w.label}
            </text>
            <text x={w.x} y={cy - 30} textAnchor="middle" fill={MUTED} fontSize={9.5}>
              AOA {w.aoa.toFixed(0)}° · {w.note}
            </text>

            {showCoeffs && (
              <g transform={`translate(${w.x} ${cy + 62})`}>
                <g opacity={highlight === "drag" ? 0.3 : 1}>
                  <text x={-52} y={0} fontSize={9.5} fontWeight={700} fill={MUTED}>
                    C_L
                  </text>
                  <rect x={-22} y={-8} width={74} height={11} rx={5.5} fill="var(--color-surface-3)" />
                  <rect x={-22} y={-8} width={Math.max(4, cl * 46)} height={11} rx={5.5} fill={GO} />
                </g>
                <g opacity={highlight === "lift" ? 0.3 : 1}>
                  <text x={-52} y={24} fontSize={9.5} fontWeight={700} fill={MUTED}>
                    C_D
                  </text>
                  <rect x={-22} y={16} width={74} height={11} rx={5.5} fill="var(--color-surface-3)" />
                  <rect x={-22} y={16} width={Math.max(4, cd * 62)} height={11} rx={5.5} fill={CAUTION} />
                </g>
              </g>
            )}
          </g>
        );
      })}

      {yaw > 0.1 && (
        <g>
          <path
            d="M186 224 A 74 74 0 0 1 314 224"
            fill="none"
            stroke={NOGO}
            strokeWidth={2.6}
            markerEnd="url(#arrow-roll)"
          />
          <text x={250} y={252} textAnchor="middle" fill={NOGO} fontSize={11} fontWeight={800}>
            {highlight === "lift"
              ? "Lift differential → ROLL"
              : highlight === "drag"
                ? "Drag differential → YAW"
                : "AUTOROTATION"}
          </text>
        </g>
      )}
      {yaw <= 0.1 && (
        <text x={250} y={248} textAnchor="middle" fill={MUTED} fontSize={11} fontWeight={700}>
          Symmetric stall — no yaw, no rotation
        </text>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function WakeVortex(p: DiagramProps) {
  const time = Math.min(1, Math.max(0, num(p.time, 0.6)));
  const weight = num(p.weight, 1.3);
  const speed = num(p.speed, 0.5);
  const dirty = bool(p.dirty, false);
  const showGround = bool(p.showGround, false);
  const avoidance = str<"none" | "takeoff" | "landing">(p.showAvoidance, "none");

  const strength = vortexStrength({ weight, speed, dirty });
  const sink = wakeSinkRate(strength);

  const pathY = 92;
  const groundY = 252;
  const sinkPx = Math.min(groundY - pathY - 16, time * 132);

  return (
    <Diagram title="Wake turbulence behaviour and avoidance">
      <ArrowDefs colors={{ sink: CAUTION, avoid: GO }} />

      <rect x={0} y={groundY} width={500} height={48} fill="var(--color-surface-3)" />
      <line x1={0} y1={groundY} x2={500} y2={groundY} stroke={MUTED} strokeWidth={2} />

      <line x1={40} y1={pathY} x2={460} y2={pathY} stroke={MUTED} strokeWidth={1.6} strokeDasharray="6 5" />
      <text x={44} y={pathY - 10} fill={MUTED} fontSize={9.5} fontWeight={700}>
        generating aircraft flight path
      </text>
      <AircraftSide x={412} y={pathY} scale={1.15} />

      {[0.2, 0.42, 0.64, 0.86].map((f, i) => {
        const x = 90 + f * 280;
        const y = pathY + sinkPx * (1 - f) * 1.05;
        const r = 9 + (strength / 100) * 11;
        return (
          <g key={i} opacity={0.42 + (strength / 100) * 0.5}>
            <circle cx={x} cy={y} r={r} fill="none" stroke={CAUTION} strokeWidth={2} />
            <path
              d={`M${x} ${y - r} A ${r} ${r} 0 0 1 ${x + r} ${y}`}
              fill="none"
              stroke={CAUTION}
              strokeWidth={2.6}
              markerEnd="url(#arrow-sink)"
            />
          </g>
        );
      })}

      <line
        x1={72}
        y1={pathY}
        x2={72}
        y2={pathY + sinkPx}
        stroke={CAUTION}
        strokeWidth={1.6}
        strokeDasharray="4 4"
      />
      <text x={66} y={pathY + sinkPx / 2} textAnchor="end" fill={CAUTION} fontSize={9.5} fontWeight={750}>
        ~900 ft
      </text>

      {showGround && (
        <>
          <Arrow x1={150} y1={groundY - 8} x2={92} y2={groundY - 8} color={CAUTION} id="sink" width={2} />
          <Arrow x1={300} y1={groundY - 8} x2={358} y2={groundY - 8} color={CAUTION} id="sink" width={2} />
          <text x={225} y={groundY + 22} textAnchor="middle" fill={CAUTION} fontSize={9.5} fontWeight={750}>
            drift outward ≈5 kt
          </text>
        </>
      )}

      {avoidance === "takeoff" && (
        <>
          <Arrow x1={96} y1={groundY - 4} x2={300} y2={pathY - 30} color={GO} id="avoid" width={2.8} />
          <text x={200} y={pathY - 44} textAnchor="middle" fill={GO} fontSize={10} fontWeight={800}>
            rotate BEFORE their rotation point · climb above
          </text>
        </>
      )}
      {avoidance === "landing" && (
        <>
          <Arrow x1={70} y1={pathY - 26} x2={330} y2={groundY - 4} color={GO} id="avoid" width={2.8} />
          <text x={230} y={pathY - 30} textAnchor="middle" fill={GO} fontSize={10} fontWeight={800}>
            stay at or above · touch down BEYOND theirs
          </text>
        </>
      )}

      <g transform="translate(414 218)">
        <text x={0} y={0} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
          VORTEX STRENGTH
        </text>
        <text
          x={0}
          y={22}
          textAnchor="middle"
          fontSize={22}
          fontWeight={800}
          fill={strength > 66 ? NOGO : strength > 33 ? CAUTION : GO}
          className="tabular"
        >
          {strength}
        </text>
        <text x={0} y={40} textAnchor="middle" fontSize={9} fill={MUTED} className="tabular">
          sink {sink} fpm
        </text>
      </g>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function WindShear(p: DiagramProps) {
  const phase = Math.round(num(p.phase, 0));
  const type = str<"increasing" | "decreasing" | "microburst">(p.type, "microburst");

  const groundY = 250;
  const startX = 56;
  const startY = 62;
  const runwayX = 400;

  const glideY = (x: number) => startY + ((x - startX) / (runwayX - startX)) * (groundY - startY);

  // Deviation from the glidepath as the shear takes effect.
  const deviation =
    phase === 0 ? 0 : phase === 1 ? -8 : phase === 2 ? -30 : phase === 3 ? -12 : phase === 4 ? 14 : 46;

  const shearX = 236;
  const acX = phase === 0 ? 110 : phase <= 2 ? shearX - 20 : phase <= 3 ? shearX + 10 : shearX + 70;
  const acY = glideY(acX) + (acX > shearX - 40 ? deviation : 0);

  const captions = [
    "Stabilised on glidepath",
    "Sudden headwind — IAS increases",
    "Lift increases — ballooning high",
    "Nose down, power back",
    "Headwind becomes tailwind — IAS collapses",
    "Lift falls with the nose already low",
  ];

  return (
    <Diagram title="Wind shear on approach">
      <ArrowDefs colors={{ hw: GO, tw: NOGO, path: MUTED }} />

      <rect x={0} y={groundY} width={500} height={50} fill="var(--color-surface-3)" />
      <line x1={0} y1={groundY} x2={500} y2={groundY} stroke={MUTED} strokeWidth={2} />
      <rect x={runwayX - 6} y={groundY - 3} width={94} height={6} fill={NAVY} rx={3} />
      <text x={runwayX + 42} y={groundY + 20} textAnchor="middle" fill={MUTED} fontSize={9.5} fontWeight={700}>
        runway
      </text>

      <line x1={startX} y1={startY} x2={runwayX} y2={groundY} stroke={MUTED} strokeWidth={2} strokeDasharray="6 5" />
      <text x={startX + 24} y={startY - 8} fill={MUTED} fontSize={9.5} fontWeight={700}>
        glidepath
      </text>

      <line x1={shearX} y1={40} x2={shearX} y2={groundY} stroke={CAUTION} strokeWidth={2} strokeDasharray="8 4" opacity={0.75} />
      <text x={shearX} y={34} textAnchor="middle" fill={CAUTION} fontSize={9.5} fontWeight={800}>
        shear boundary
      </text>

      {(type !== "decreasing" || phase >= 4) && (
        <>
          {[92, 122].map((y) => (
            <Arrow key={`hw${y}`} x1={shearX - 96} y1={y} x2={shearX - 34} y2={y} color={GO} id="hw" width={2} />
          ))}
          <text x={shearX - 66} y={80} textAnchor="middle" fill={GO} fontSize={9} fontWeight={750}>
            headwind
          </text>
        </>
      )}
      {(phase >= 4 || type === "decreasing") && (
        <>
          {[92, 122].map((y) => (
            <Arrow key={`tw${y}`} x1={shearX + 96} y1={y} x2={shearX + 34} y2={y} color={NOGO} id="tw" width={2} />
          ))}
          <text x={shearX + 66} y={80} textAnchor="middle" fill={NOGO} fontSize={9} fontWeight={750}>
            tailwind
          </text>
        </>
      )}

      <g transform={`translate(${acX} ${acY}) rotate(${phase >= 3 ? 6 : -2})`}>
        <AircraftSide x={0} y={0} scale={0.85} fill={phase >= 4 ? NOGO : NAVY} />
      </g>

      <RegionLabel
        x={250}
        y={282}
        text={captions[Math.min(phase, captions.length - 1)]}
        color={phase >= 4 ? NOGO : phase >= 1 ? CAUTION : NAVY}
        bg={phase >= 4 ? "var(--color-nogo-soft)" : "var(--color-surface-2)"}
      />
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */

export function StabilityBall(p: DiagramProps) {
  const kind = str<"positive-static" | "neutral-static" | "negative-static" | "damped" | "undamped" | "divergent">(
    p.kind,
    "positive-static",
  );

  const isMotion = kind === "damped" || kind === "undamped" || kind === "divergent";

  if (isMotion) {
    const plot = makePlot({ xMin: 0, xMax: 1, yMin: -1.2, yMax: 1.2, left: 50, bottom: 42, right: 24 });
    const decay = kind === "damped" ? -3.2 : kind === "undamped" ? 0 : 1.8;
    const d = curvePath(plot, (t) => Math.cos(t * 15) * Math.exp(decay * t), { steps: 260 });
    const color = kind === "damped" ? GO : kind === "undamped" ? CAUTION : NOGO;
    const label =
      kind === "damped"
        ? "Positive static + positive dynamic → DAMPED"
        : kind === "undamped"
          ? "Positive static + neutral dynamic → UNDAMPED"
          : "Positive static + negative dynamic → DIVERGENT";
    return (
      <Diagram title={label}>
        <Axes plot={plot} xLabel="Time" yLabel="Displacement" yTicks={1} />
        <line x1={plot.x0} y1={plot.sy(0)} x2={plot.x1} y2={plot.sy(0)} stroke="var(--color-line-strong)" strokeWidth={1.3} />
        <Curve d={d} color={color} width={2.8} />
        <RegionLabel x={250} y={plot.y1 + 12} text={label} color={color} bg="var(--color-surface-2)" />
      </Diagram>
    );
  }

  const bowls = {
    "positive-static": { path: "M140 200 Q250 96 360 200", ball: { x: 320, y: 172 }, arrow: -1, color: GO, label: "POSITIVE static stability", note: "initial tendency back toward equilibrium" },
    "neutral-static": { path: "M140 200 L360 200", ball: { x: 300, y: 190 }, arrow: 0, color: CAUTION, label: "NEUTRAL static stability", note: "accepts the new position" },
    "negative-static": { path: "M140 130 Q250 234 360 130", ball: { x: 300, y: 162 }, arrow: 1, color: NOGO, label: "NEGATIVE static stability", note: "initial tendency further away" },
  }[kind];

  return (
    <Diagram title={bowls.label}>
      <ArrowDefs colors={{ tend: bowls.color }} />
      <path d={bowls.path} fill="none" stroke={NAVY} strokeWidth={3} strokeLinecap="round" />
      <circle cx={bowls.ball.x} cy={bowls.ball.y} r={12} fill={bowls.color} />
      {bowls.arrow !== 0 && (
        <Arrow
          x1={bowls.ball.x + bowls.arrow * 6}
          y1={bowls.ball.y - 26}
          x2={bowls.ball.x + bowls.arrow * 52}
          y2={bowls.ball.y - 26}
          color={bowls.color}
          id="tend"
          width={2.6}
        />
      )}
      <RegionLabel x={250} y={252} text={bowls.label} color={bowls.color} bg="var(--color-surface-2)" />
      <text x={250} y={276} textAnchor="middle" fill={MUTED} fontSize={10.5} fontWeight={650}>
        {bowls.note}
      </text>
    </Diagram>
  );
}
