"use client";

/**
 * Sim Lab.
 *
 * These are the full-size labs, each with its own control panel and live
 * readouts. They teach RELATIONSHIPS: where a real number is not supported by
 * the trainee guide, the output is relative or indexed rather than invented.
 */

import { useMemo, useState } from "react";
import {
  CL_CONFIG,
  type DragConfig,
  type EngineType,
  REFERENCE_DRAG,
  T6B_VN,
  acceleratedStallSpeed,
  argMax,
  atmosphereAt,
  coefficientOfLift,
  envelopeVerdict,
  excessPower,
  excessThrust,
  inducedDrag,
  ldMaxVelocity,
  loadFactor,
  maneuverSpeed,
  maxEnduranceVelocity,
  parasiteDrag,
  stallSpeedMultiplier,
  turnRadius,
  turnRate,
  vortexStrength,
  wakeSinkRate,
  withFlaps,
} from "@/lib/aero";
import { DiagramHost } from "@/components/diagrams/registry";
import { Formula, type Tone, cn } from "@/components/ui";
import { ChainStrip, Readout, Segmented, Slider, Toggle } from "./controls";
import {
  CompressorLab,
  CompressorStallLab,
  DuctLab,
  EngineFlowLab,
  MalfunctionLab,
  SystemsTraceLab,
  ThrustFactorLab,
  TurbopropLab,
  HotSectionLab,
} from "./engine-labs";
import {
  AirportLab,
  VfrIfrLab,
  AltitudeLab,
  AirspaceLab,
  RulesLab,
  PublicationLab,
  WeatherBriefLab,
  OxygenLab,
} from "./frr-labs";
import { NAV_LAB_COMPONENTS } from "./nav-labs";
import {
  AtmosphereLab,
  AltimeterLab,
  CloudTypeLab,
  TurbulenceLab,
  CloudLab,
  FrontLab,
  StormLab,
  IcingLab,
  WindLab,
  ProductLab,
  WaveLab,
} from "./weather-labs";

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

function LabFrame({
  diagram,
  diagramProps,
  controls,
  readouts,
  chain,
  formula,
  note,
  secondaryDiagram,
  secondaryProps,
}: {
  diagram: string;
  diagramProps: Record<string, unknown>;
  controls: React.ReactNode;
  readouts: { label: string; value: string; tone?: Tone; hint?: string; big?: boolean }[];
  chain?: { label: string; trend?: "up" | "down" | "same" }[];
  formula?: string;
  note?: string;
  secondaryDiagram?: string;
  secondaryProps?: Record<string, unknown>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface p-3">
            <DiagramHost id={diagram} props={diagramProps} />
          </div>
          {secondaryDiagram && (
            <div className="overflow-hidden rounded-2xl border border-line bg-surface p-3">
              <DiagramHost id={secondaryDiagram} props={secondaryProps ?? {}} />
            </div>
          )}
          {formula && (
            <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
              <Formula tex={formula} display />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-3.5">
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            <p className="eyebrow text-navy-faint">Controls</p>
            {controls}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {readouts.map((r) => (
              <Readout key={r.label} {...r} />
            ))}
          </div>
        </div>
      </div>

      {chain && <ChainStrip nodes={chain} />}
      {note && (
        <p className="rounded-xl bg-brand-soft px-4 py-3 text-[13px] font-medium leading-relaxed text-brand">
          {note}
        </p>
      )}
    </div>
  );
}

const pctS = (v: number) => `${Math.round(v * 100)}%`;
const xS = (v: number) => `×${v.toFixed(2)}`;
const ktS = (v: number) => `${Math.round(v)} kt`;
const ftS = (v: number) => `${Math.round(v).toLocaleString()} ft`;

/* ------------------------------------------------------------------ */
/* 1. Lift Lab                                                         */
/* ------------------------------------------------------------------ */

export function LiftLab() {
  const [altitude, setAltitude] = useState(0);
  const [velocity, setVelocity] = useState(1);
  const [area, setArea] = useState(1);
  const [aoa, setAoa] = useState(6);
  const [flaps, setFlaps] = useState(false);

  const atmos = atmosphereAt(altitude);
  const cfg = flaps ? withFlaps(CL_CONFIG.positive) : CL_CONFIG.positive;
  const cl = coefficientOfLift(aoa, cfg);
  const q = atmos.densityRatio * velocity ** 2;
  const lift = q * area * Math.max(cl, 0);
  const stalled = aoa > cfg.clMaxAoa;

  return (
    <LabFrame
      diagram="cl-vs-aoa"
      diagramProps={{ marker: aoa, flaps, camber: "positive" }}
      formula="L = \tfrac{1}{2}\rho V^2 S C_L"
      controls={
        <>
          <Slider
            label="Altitude (density ρ)"
            value={altitude}
            min={0}
            max={30000}
            step={500}
            display={ftS(altitude)}
            onChange={setAltitude}
            hint={`ρ = ${pctS(atmos.densityRatio)} of sea level`}
          />
          <Slider
            label="Velocity V"
            value={velocity}
            min={0.4}
            max={2}
            step={0.02}
            tone="nogo"
            display={xS(velocity)}
            onChange={setVelocity}
            hint="squared in the lift equation"
          />
          <Slider
            label="Wing area S"
            value={area}
            min={0.6}
            max={1.6}
            step={0.02}
            display={xS(area)}
            onChange={setArea}
          />
          <Slider
            label="Angle of attack"
            value={aoa}
            min={-6}
            max={24}
            step={1}
            tone={stalled ? "nogo" : "go"}
            display={`${aoa}°`}
            onChange={setAoa}
          />
          <Toggle label="Flaps" value={flaps} onChange={setFlaps} onLabel="DOWN" offLabel="UP" tone="caution" />
        </>
      }
      readouts={[
        { label: "Dynamic pressure q", value: xS(q), tone: "caution", hint: "½ρV²" },
        { label: "Coefficient C_L", value: cl.toFixed(2), tone: stalled ? "nogo" : "go" },
        { label: "Lift", value: pctS(lift), tone: lift >= 1 ? "go" : "caution", big: true, hint: "relative to baseline" },
        {
          label: "State",
          value: stalled ? "STALLED" : "flying",
          tone: stalled ? "nogo" : "go",
          big: true,
          hint: `CLmax AOA ${cfg.clMaxAoa}°`,
        },
      ]}
      chain={[
        { label: "Velocity", trend: "up" },
        { label: "Dynamic pressure (as V²)", trend: "up" },
        { label: "Lift (as V²)", trend: "up" },
      ]}
      note={
        Math.abs(velocity - 2) < 0.03
          ? "Velocity is at ×2.00 and lift is four times the baseline. Only V is squared — everything else is linear."
          : stalled
            ? "Past CLmax AOA, more angle of attack gives LESS coefficient of lift. No amount of speed fixes an excessive AOA."
            : "Set velocity to ×2.00 and watch lift reach 400%. Then halve the density and watch it only halve."
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 2. AOA Lab                                                          */
/* ------------------------------------------------------------------ */

export function AoaLab() {
  const [pitch, setPitch] = useState(6);
  const [flightPath, setFlightPath] = useState(0);
  const aoa = pitch - flightPath;
  const stalled = aoa > 18;

  return (
    <LabFrame
      diagram="aoa-vs-pitch"
      diagramProps={{ pitch, flightPath, highlight: "both" }}
      controls={
        <>
          <Slider
            label="Pitch attitude"
            value={pitch}
            min={-15}
            max={30}
            step={1}
            display={`${pitch}°`}
            onChange={setPitch}
            hint="longitudinal axis vs HORIZON"
          />
          <Slider
            label="Flight path angle"
            value={flightPath}
            min={-25}
            max={25}
            step={1}
            tone="brand"
            display={`${flightPath}°`}
            onChange={setFlightPath}
            hint="where the CG is actually going"
          />
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { label: "Level", p: 3, f: 0 },
              { label: "Climb", p: 14, f: 12 },
              { label: "Descent", p: 6, f: -8 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setPitch(preset.p);
                  setFlightPath(preset.f);
                }}
                className="rounded-lg bg-surface-2 px-2 py-1.5 text-[11.5px] font-semibold text-navy-soft transition-colors hover:bg-surface-3 hover:text-navy"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      }
      readouts={[
        { label: "Pitch attitude", value: `${pitch}°`, hint: "vs horizon" },
        { label: "Flight path", value: `${flightPath}°`, tone: "brand" },
        {
          label: "Angle of attack",
          value: `${aoa}°`,
          tone: stalled ? "nogo" : aoa > 14 ? "caution" : "go",
          big: true,
          hint: "chord line vs RELATIVE WIND",
        },
        {
          label: "T-6B stall AOA",
          value: "18 units",
          tone: "neutral",
          big: true,
          hint: stalled ? "EXCEEDED" : "not exceeded",
        },
      ]}
      chain={[
        { label: "Flight path", trend: "down" },
        { label: "Relative wind rotates" },
        { label: "Angle of attack", trend: "up" },
      ]}
      note={
        stalled
          ? "The wing is stalled. Note that the nose can still be above the horizon — pitch attitude tells you nothing about AOA."
          : "Try Climb and Descent. Both can produce the same pitch attitude with completely different angles of attack."
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 3. Drag Lab                                                         */
/* ------------------------------------------------------------------ */

export function DragLab() {
  const [velocity, setVelocity] = useState(0.4);
  const [weight, setWeight] = useState(1);
  const [altitude, setAltitude] = useState(0);
  const [gear, setGear] = useState(false);
  const [flaps, setFlaps] = useState(false);
  const [groundEffect, setGroundEffect] = useState(false);

  const densityRatio = atmosphereAt(altitude).densityRatio;
  const cfg: DragConfig = {
    f: REFERENCE_DRAG.f * (gear ? 1.45 : 1) * (flaps ? 1.7 : 1),
    weight,
    densityRatio,
    span: REFERENCE_DRAG.span,
  };

  const dp = parasiteDrag(velocity, cfg);
  const diRaw = inducedDrag(velocity, cfg);
  const di = groundEffect ? diRaw * 0.4 : diRaw;
  const ld = ldMaxVelocity(cfg);
  const atLd = Math.abs(velocity - ld) < 0.035;

  return (
    <LabFrame
      diagram="drag-curves"
      diagramProps={{
        weight,
        gear,
        flaps,
        densityRatio,
        marker: velocity / 1.5,
        reveal: "all",
        showRegions: true,
      }}
      secondaryDiagram={groundEffect ? "ground-effect" : undefined}
      secondaryProps={{ heightFraction: 0.15 }}
      formula="D_T = \tfrac{1}{2}\rho V^2 f + \frac{kW^2}{\rho V^2 b^2}"
      controls={
        <>
          <Slider label="Airspeed" value={velocity} min={0.16} max={1.5} step={0.01} display={xS(velocity)} onChange={setVelocity} />
          <Slider label="Weight" value={weight} min={0.7} max={1.6} step={0.02} tone="nogo" display={xS(weight)} onChange={setWeight} />
          <Slider label="Altitude" value={altitude} min={0} max={25000} step={1000} tone="brand" display={ftS(altitude)} onChange={setAltitude} />
          <Toggle label="Landing gear" value={gear} onChange={setGear} onLabel="DOWN" offLabel="UP" tone="caution" />
          <Toggle label="Flaps" value={flaps} onChange={setFlaps} onLabel="DOWN" offLabel="UP" tone="caution" />
          <Toggle label="In ground effect" value={groundEffect} onChange={setGroundEffect} onLabel="YES" offLabel="NO" tone="go" />
        </>
      }
      readouts={[
        { label: "Parasite drag", value: dp.toFixed(2), tone: "caution" },
        { label: "Induced drag", value: di.toFixed(2), tone: "brand" },
        { label: "Total drag", value: (dp + di).toFixed(2), big: true },
        {
          label: "L/Dmax airspeed",
          value: xS(ld),
          tone: atLd ? "go" : "neutral",
          big: true,
          hint: atLd ? "you are there" : velocity < ld ? "you are below" : "you are above",
        },
      ]}
      chain={[
        { label: "Airspeed", trend: "up" },
        { label: "Parasite drag (as V²)", trend: "up" },
        { label: "Induced drag", trend: "down" },
        { label: "L/Dmax where they are equal" },
      ]}
      note={
        groundEffect
          ? "Within one wingspan the ground blocks the downwash: effective lift rises and induced drag drops by up to 60%."
          : atLd
            ? "Parasite drag equals induced drag. This is L/Dmax — minimum total drag, max range for a prop, and best glide for anything."
            : velocity < ld
              ? "Below L/Dmax, induced drag dominates. Slowing further makes TOTAL drag worse, not better."
              : "Above L/Dmax, parasite drag dominates and climbs with the square of velocity."
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 4. Performance Lab                                                  */
/* ------------------------------------------------------------------ */

export function PerformanceLab() {
  const [engine, setEngine] = useState<EngineType>("turboprop");
  const [weight, setWeight] = useState(1);
  const [altitude, setAltitude] = useState(0);
  const [throttle, setThrottle] = useState(1);
  const [gear, setGear] = useState(false);
  const [flaps, setFlaps] = useState(false);
  const [view, setView] = useState<"thrust" | "power">("thrust");

  const densityRatio = atmosphereAt(altitude).densityRatio;
  const cfg: DragConfig = {
    f: REFERENCE_DRAG.f * (gear ? 1.45 : 1) * (flaps ? 1.7 : 1),
    weight,
    densityRatio,
    span: REFERENCE_DRAG.span,
  };

  const ld = ldMaxVelocity(cfg);
  const teV = argMax((v) => excessThrust(v, cfg, engine, throttle));
  const peV = argMax((v) => excessPower(v, cfg, engine, throttle));
  const maxTe = excessThrust(teV, cfg, engine, throttle);
  const maxPe = excessPower(peV, cfg, engine, throttle);

  const shifts: string[] = [];
  if (weight !== 1) shifts.push("weight → up and right");
  if (altitude > 0) shifts.push(view === "thrust" ? "altitude → right only" : "altitude → right and up");
  if (gear) shifts.push("gear → straight up");
  if (flaps) shifts.push("flaps → up and left");

  return (
    <LabFrame
      diagram={view === "thrust" ? "thrust-curves" : "power-curves"}
      diagramProps={{
        engine,
        weight,
        altitude,
        gear,
        flaps,
        showExcess: true,
        showAvailable: true,
        ghost: weight !== 1 || altitude > 0 || gear || flaps,
      }}
      controls={
        <>
          <Segmented
            label="Curve"
            value={view}
            options={[
              { value: "thrust", label: "Thrust" },
              { value: "power", label: "Power" },
            ]}
            onChange={setView}
          />
          <Segmented
            label="Engine"
            value={engine}
            options={[
              { value: "turboprop", label: "Turboprop" },
              { value: "turbojet", label: "Turbojet" },
            ]}
            onChange={setEngine}
          />
          <Slider label="Gross weight" value={weight} min={0.8} max={1.5} step={0.02} tone="nogo" display={xS(weight)} onChange={setWeight} />
          <Slider label="Altitude" value={altitude} min={0} max={30000} step={1000} tone="brand" display={ftS(altitude)} onChange={setAltitude} />
          <Slider label="Throttle" value={throttle} min={0.4} max={1} step={0.02} tone="go" display={pctS(throttle)} onChange={setThrottle} />
          <Toggle label="Landing gear" value={gear} onChange={setGear} onLabel="DOWN" offLabel="UP" tone="caution" />
          <Toggle label="Flaps" value={flaps} onChange={setFlaps} onLabel="DOWN" offLabel="UP" tone="caution" />
        </>
      }
      readouts={[
        { label: "L/Dmax airspeed", value: xS(ld), tone: "brand" },
        { label: "Max endurance", value: xS(maxEnduranceVelocity(cfg)), tone: "caution" },
        {
          label: "Max excess thrust",
          value: maxTe > 0 ? maxTe.toFixed(2) : "none",
          tone: maxTe > 0 ? "go" : "nogo",
          hint: `at ${xS(teV)}`,
        },
        {
          label: "Max excess power",
          value: maxPe > 0 ? maxPe.toFixed(2) : "none",
          tone: maxPe > 0 ? "go" : "nogo",
          hint: `at ${xS(peV)}`,
        },
      ]}
      chain={
        gear || flaps
          ? [
              { label: gear ? "Gear down" : "Flaps down" },
              { label: "Parasite drag", trend: "up" },
              { label: "Thrust required", trend: "up" },
              { label: "Excess thrust", trend: "down" },
              { label: "Climb performance", trend: "down" },
            ]
          : [
              { label: "Thrust excess" },
              { label: "→ angle of climb" },
              { label: "Power excess" },
              { label: "→ rate of climb" },
            ]
      }
      note={
        shifts.length > 0
          ? `Curve shifts active: ${shifts.join(" · ")}. Every one of them shrinks both excesses.`
          : engine === "turboprop"
            ? "Turboprop: max thrust excess sits BELOW L/Dmax and max power excess sits AT L/Dmax. Switch to Turbojet and the pair swaps."
            : "Turbojet: max thrust excess is AT L/Dmax and max power excess is ABOVE it — the mirror of the turboprop."
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 5. Turn Lab                                                         */
/* ------------------------------------------------------------------ */

export function TurnLab() {
  const [bank, setBank] = useState(30);
  const [speed, setSpeed] = useState(150);
  const [baseStall, setBaseStall] = useState(86);

  const n = loadFactor(bank);
  const mult = stallSpeedMultiplier(n);
  const accelStall = baseStall * mult;
  const radius = turnRadius(bank, speed);
  const rate = turnRate(bank, speed);
  const willStall = speed < accelStall;

  return (
    <LabFrame
      diagram="turn-forces"
      diagramProps={{ bank, showRequired: true, showStall: true }}
      secondaryDiagram="turn-geometry"
      secondaryProps={{ bank, speed: (speed - 90) / 180, show: "both" }}
      formula="n = \frac{1}{\cos\phi} \quad\quad \omega = \frac{g\tan\phi}{V} \quad\quad r = \frac{V^2}{g\tan\phi}"
      controls={
        <>
          <Slider label="Angle of bank" value={bank} min={0} max={80} step={1} tone="caution" display={`${bank}°`} onChange={setBank} />
          <Slider label="True airspeed" value={speed} min={80} max={300} step={5} tone="brand" display={ktS(speed)} onChange={setSpeed} />
          <Slider label="Wings-level stall speed" value={baseStall} min={60} max={120} step={1} display={ktS(baseStall)} onChange={setBaseStall} hint="T-6B is about 86 KIAS" />
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[0, 30, 45, 60].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBank(b)}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-[11.5px] font-semibold transition-colors",
                  bank === b ? "bg-brand text-white" : "bg-surface-2 text-navy-soft hover:bg-surface-3",
                )}
              >
                {b}°
              </button>
            ))}
          </div>
        </>
      }
      readouts={[
        { label: "Load factor", value: `${n.toFixed(2)} G`, tone: n > 4 ? "nogo" : n > 2 ? "caution" : "neutral", big: true },
        { label: "Lift required", value: `${Math.round(n * 100)}%`, tone: "go", big: true, hint: "of weight" },
        { label: "Stall speed", value: ktS(accelStall), tone: willStall ? "nogo" : "caution", hint: `×${mult.toFixed(2)}` },
        { label: "Turn rate", value: `${rate.toFixed(1)}°/s`, tone: "go" },
        { label: "Turn radius", value: Number.isFinite(radius) ? ftS(radius) : "∞", tone: "brand" },
        { label: "Margin above stall", value: willStall ? "STALLED" : ktS(speed - accelStall), tone: willStall ? "nogo" : "go" },
      ]}
      chain={[
        { label: "Bank angle", trend: "up" },
        { label: "Load factor", trend: "up" },
        { label: "Lift required", trend: "up" },
        { label: "Stall speed", trend: "up" },
      ]}
      note={
        willStall
          ? "You are below the accelerated stall speed for this bank angle. This is the approach-turn accident, exactly."
          : bank >= 58 && bank <= 62
            ? "60° of bank is exactly 2 G, and stall speed is 40% above the wings-level figure."
            : "Change airspeed and watch rate and radius move — but load factor and stall multiplier depend on BANK alone."
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 6. V-n Lab                                                          */
/* ------------------------------------------------------------------ */

export function VnLab() {
  const [kias, setKias] = useState(200);
  const [g, setG] = useState(2);
  const [weight, setWeight] = useState(1);

  const cfg = useMemo(
    () => ({
      ...T6B_VN,
      stallSpeed: T6B_VN.stallSpeed * Math.sqrt(weight),
      positiveLimit: T6B_VN.positiveLimit / weight,
      negativeLimit: T6B_VN.negativeLimit / weight,
    }),
    [weight],
  );

  const verdict = envelopeVerdict(cfg, kias, g);
  const va = maneuverSpeed(cfg);
  const verdictCopy: Record<typeof verdict, { text: string; tone: Tone }> = {
    safe: { text: "Inside the envelope", tone: "go" },
    stall: { text: "STALL — CLmax AOA exceeded", tone: "caution" },
    "overG-positive": { text: "OVER-G — positive limit exceeded", tone: "nogo" },
    "overG-negative": { text: "OVER-G — negative limit exceeded", tone: "nogo" },
    overspeed: { text: "OVERSPEED — beyond V_NE", tone: "nogo" },
  };

  return (
    <LabFrame
      diagram="vn-diagram"
      diagramProps={{ kias, loadFactor: g, weight, reveal: 6 }}
      formula="V_{S_{accel}} = V_S\sqrt{|n|} \quad\quad n_{ultimate} = 1.5\,n_{limit}"
      controls={
        <>
          <Slider label="Indicated airspeed" value={kias} min={60} max={360} step={5} tone="brand" display={ktS(kias)} onChange={setKias} />
          <Slider label="Load factor" value={g} min={-5} max={9} step={0.25} tone="nogo" display={`${g.toFixed(2)} G`} onChange={setG} />
          <Slider label="Gross weight" value={weight} min={0.85} max={1.3} step={0.05} display={xS(weight)} onChange={setWeight} />
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[
              { label: "Cruise", k: 200, g: 1 },
              { label: "Corner", k: Math.round(va), g: cfg.positiveLimit },
              { label: "Over-G", k: 300, g: 8 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setKias(p.k);
                  setG(Number(p.g.toFixed(2)));
                }}
                className="rounded-lg bg-surface-2 px-2 py-1.5 text-[11.5px] font-semibold text-navy-soft transition-colors hover:bg-surface-3 hover:text-navy"
              >
                {p.label}
              </button>
            ))}
          </div>
        </>
      }
      readouts={[
        { label: "Verdict", value: verdictCopy[verdict].text, tone: verdictCopy[verdict].tone, big: true },
        { label: "Maneuver speed Va", value: ktS(va), tone: "brand", big: true, hint: "cornering velocity" },
        { label: "Stall speed at this G", value: ktS(acceleratedStallSpeed(cfg, g)), tone: "caution" },
        { label: "Limit load", value: `+${cfg.positiveLimit.toFixed(1)} / ${cfg.negativeLimit.toFixed(1)} G`, tone: "nogo" },
        { label: "Ultimate load", value: `${(cfg.positiveLimit * 1.5).toFixed(1)} G`, tone: "nogo", hint: "1.5 × limit" },
        { label: "Redline V_NE", value: ktS(cfg.redline), tone: "nogo" },
      ]}
      chain={[
        { label: "Airspeed below Va" },
        { label: "Stall line sits below the limit load" },
        { label: "The wing stalls before the structure loads" },
      ]}
      note={
        kias < va
          ? "Below maneuver speed an over-G is impossible: pull harder and you reach CLmax AOA first. Drag the load factor up and watch it stall instead."
          : "Above maneuver speed the structure is the first thing to give. Now the G limit is a real limit."
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 7. Spin Lab                                                         */
/* ------------------------------------------------------------------ */

const RECOVERY_STEPS = [
  "Gear, flaps and speed brake — RETRACTED",
  "PCL — IDLE",
  "Rudder — FULL OPPOSITE to turn needle deflection",
  "Control stick — FORWARD of neutral, ailerons NEUTRAL",
  "Smoothly recover to level flight after rotation stops",
];

export function SpinLab() {
  const [aoa, setAoa] = useState(14);
  const [yaw, setYaw] = useState(0);
  const [step, setStep] = useState(-1);

  const stalled = aoa > 18;
  const spinning = stalled && yaw > 0.15;

  return (
    <LabFrame
      diagram="spin-wings"
      diagramProps={{ yaw: spinning ? yaw : 0, showRelWind: true, showCoeffs: stalled }}
      controls={
        <>
          <Slider
            label="Angle of attack"
            value={aoa}
            min={6}
            max={28}
            step={1}
            tone={stalled ? "nogo" : "go"}
            display={`${aoa}°`}
            onChange={setAoa}
            hint="T-6B stalls at 18 units"
          />
          <Slider
            label="Yaw input"
            value={yaw}
            min={0}
            max={1}
            step={0.05}
            tone="caution"
            display={pctS(yaw)}
            onChange={setYaw}
            hint="rudder, or an uncoordinated stall"
          />
          <div className="pt-1">
            <p className="mb-1.5 text-[12.5px] font-semibold text-navy">Recovery — PARE</p>
            <ol className="space-y-1">
              {RECOVERY_STEPS.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    disabled={!spinning}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[11.5px] font-medium transition-colors disabled:opacity-40",
                      step >= i && spinning
                        ? "bg-go-soft text-go"
                        : "bg-surface-2 text-navy-soft hover:bg-surface-3",
                    )}
                  >
                    <span className="tabular font-extrabold">{i + 1}</span>
                    {s}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </>
      }
      readouts={[
        { label: "Stalled?", value: stalled ? "YES" : "no", tone: stalled ? "nogo" : "go", big: true },
        { label: "Yaw present?", value: yaw > 0.15 ? "YES" : "no", tone: yaw > 0.15 ? "nogo" : "go", big: true },
        {
          label: "Result",
          value: spinning ? (step >= 4 ? "RECOVERED" : "AUTOROTATION") : stalled ? "straight stall" : "flying",
          tone: spinning && step < 4 ? "nogo" : "go",
        },
        {
          label: "Spin direction",
          value: spinning ? "read the TURN NEEDLE" : "—",
          tone: "caution",
          hint: "the ball tells you nothing",
        },
      ]}
      chain={[
        { label: "Stall" },
        { label: "+ yaw" },
        { label: "Down-going wing AOA", trend: "up" },
        { label: "Its C_L", trend: "down" },
        { label: "Its drag", trend: "up" },
        { label: "Autorotation" },
      ]}
      note={
        spinning
          ? step >= 4
            ? "Recovered. The rudder stopped the yaw and forward stick broke the stall — in that order."
            : "Both wings are stalled and the down-going one is more stalled. Work the recovery list on the left."
          : stalled
            ? "Stalled but coordinated. No yaw, no spin. Add yaw and it departs."
            : "Below CLmax AOA the wings cannot autorotate no matter how much yaw you add. Both conditions are required."
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* 8. Wake Lab                                                         */
/* ------------------------------------------------------------------ */

export function WakeLab() {
  const [weight, setWeight] = useState(1.3);
  const [speed, setSpeed] = useState(0.5);
  const [dirty, setDirty] = useState(false);
  const [time, setTime] = useState(0.5);
  const [profile, setProfile] = useState<"none" | "takeoff" | "landing">("none");

  const strength = vortexStrength({ weight, speed, dirty });
  const sink = wakeSinkRate(strength);

  return (
    <LabFrame
      diagram="wake-vortex"
      diagramProps={{
        weight,
        speed,
        dirty,
        time,
        showGround: time > 0.7,
        showAvoidance: profile,
      }}
      controls={
        <>
          <Slider label="Generator weight" value={weight} min={0.4} max={1.6} step={0.05} tone="nogo" display={xS(weight)} onChange={setWeight} />
          <Slider label="Generator speed" value={speed} min={0.3} max={1.4} step={0.05} tone="brand" display={xS(speed)} onChange={setSpeed} />
          <Toggle label="Flaps and gear" value={dirty} onChange={setDirty} onLabel="DOWN" offLabel="UP" tone="go" />
          <Slider label="Time since passage" value={time} min={0} max={1} step={0.05} display={`${(time * 2).toFixed(1)} min`} onChange={setTime} />
          <Segmented
            label="Avoidance profile"
            value={profile}
            options={[
              { value: "none", label: "Off" },
              { value: "takeoff", label: "Takeoff" },
              { value: "landing", label: "Landing" },
            ]}
            onChange={setProfile}
          />
        </>
      }
      readouts={[
        {
          label: "Vortex strength",
          value: `${strength}`,
          tone: strength > 66 ? "nogo" : strength > 33 ? "caution" : "go",
          big: true,
          hint: strength > 66 ? "heavy, slow and clean" : strength < 33 ? "light, fast or dirty" : "moderate",
        },
        { label: "Sink rate", value: `${sink} fpm`, tone: "caution", big: true },
        { label: "Levels off", value: "~900 ft below", tone: "brand" },
        { label: "Ground drift", value: "≈5 kt outward", tone: "neutral" },
        { label: "T-6B takeoff spacing", value: "2 minutes", tone: "go", hint: "behind a heavy" },
        { label: "T-6B landing spacing", value: "3 minutes", tone: "go", hint: "behind a heavy" },
      ]}
      chain={[
        { label: "Heavy", trend: "up" },
        { label: "Slow", trend: "down" },
        { label: "Clean" },
        { label: "Vortex strength", trend: "up" },
      ]}
      note={
        profile === "takeoff"
          ? "Rotate BEFORE their rotation point and climb above their flight path. No vortices exist before their nosewheel leaves the runway."
          : profile === "landing"
            ? "Stay at or above their approach path and touch down BEYOND their touchdown point."
            : strength > 70
              ? "Heavy, slow and clean is the worst case. Note that a 4–6 knot crosswind parks the upwind vortex in the touchdown zone."
              : "Try heavy + slow + clean for maximum strength, then light + fast + dirty for the minimum."
      }
    />
  );
}

export const LAB_COMPONENTS: Record<string, () => React.ReactElement> = {
  LiftLab,
  AoaLab,
  DragLab,
  PerformanceLab,
  TurnLab,
  VnLab,
  SpinLab,
  WakeLab,

  /* Engines */
  EngineFlowLab,
  DuctLab,
  ThrustFactorLab,
  CompressorLab,
  CompressorStallLab,
  TurbopropLab,
  SystemsTraceLab,
  MalfunctionLab,
  HotSectionLab,

  /* Flight Rules */
  AirportLab,
  VfrIfrLab,
  AltitudeLab,
  AirspaceLab,
  RulesLab,
  PublicationLab,
  WeatherBriefLab,
  OxygenLab,

  /* Weather */
  AtmosphereLab,
  AltimeterLab,
  CloudTypeLab,
  TurbulenceLab,
  CloudLab,
  FrontLab,
  StormLab,
  IcingLab,
  WindLab,
  ProductLab,
  WaveLab,

  /* Navigation — instrument benches rather than relationship simulators */
  ...NAV_LAB_COMPONENTS,
};

export function LabHost({ component }: { component: string }) {
  const Comp = LAB_COMPONENTS[component];
  if (!Comp) {
    return (
      <div className="rounded-xl border border-dashed border-nogo/40 bg-nogo-soft/50 p-6 text-center text-sm font-semibold text-nogo">
        Missing lab: {component}
      </div>
    );
  }
  return <Comp />;
}

