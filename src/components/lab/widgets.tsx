"use client";

/**
 * Interactive widgets.
 *
 * Almost every widget is "controls + a parametric diagram + live readouts", so
 * they are declared as DATA rather than written as bespoke components. That
 * keeps 29 widgets consistent and makes adding one a five-line change.
 */

import { useMemo, useState } from "react";
import {
  CL_CONFIG,
  REFERENCE_DRAG,
  T6B_VN,
  acceleratedStallSpeed,
  atmosphereAt,
  coefficientOfLift,
  humidityDensityFactor,
  inducedDrag,
  ldMaxVelocity,
  loadFactor,
  maneuverSpeed,
  maxEnduranceVelocity,
  parasiteDrag,
  powerRequired,
  stallSpeedMultiplier,
  takeoffDistanceRatio,
  takeoffSpeedRatio,
  tasFromIas,
  totalDrag,
  trueStallSpeed,
  turnRadius,
  turnRate,
  vortexStrength,
  withFlaps,
  withSlat,
} from "@/lib/aero";
import type { DiagramProps } from "@/components/diagrams/primitives";
import { DiagramHost } from "@/components/diagrams/registry";
import { type Tone, cn } from "@/components/ui";
import { ChainStrip, Readout, Segmented, Slider, Toggle } from "./controls";

/* ------------------------------------------------------------------ */
/* Spec                                                                */
/* ------------------------------------------------------------------ */

type State = Record<string, number>;

interface SliderControl {
  kind: "slider";
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  format: (v: number) => string;
  tone?: Tone;
  hint?: string;
}

interface ToggleControl {
  kind: "toggle";
  key: string;
  label: string;
  initial: 0 | 1;
  onLabel?: string;
  offLabel?: string;
  tone?: Tone;
}

interface SegmentedControl {
  kind: "segmented";
  key: string;
  label?: string;
  initial: number;
  options: { value: number; label: string }[];
}

type Control = SliderControl | ToggleControl | SegmentedControl;

export interface WidgetSpec {
  diagram: string;
  controls: Control[];
  toProps: (s: State) => DiagramProps;
  readouts?: (s: State) => { label: string; value: string; tone?: Tone; hint?: string }[];
  chain?: (s: State) => { label: string; trend?: "up" | "down" | "same" }[];
  /** Rendered under the controls — the one sentence the widget exists to make. */
  note?: (s: State) => string;
  /** Two-column layout on desktop when true (default). */
  wide?: boolean;
}

const pct = (v: number) => `${Math.round(v * 100)}%`;
const deg = (v: number) => `${Math.round(v)}°`;
const x = (v: number) => `×${v.toFixed(2)}`;
const kt = (v: number) => `${Math.round(v)} kt`;
const ft = (v: number) => `${Math.round(v).toLocaleString()} ft`;

/* ------------------------------------------------------------------ */
/* Widget definitions                                                  */
/* ------------------------------------------------------------------ */

export const WIDGETS: Record<string, WidgetSpec> = {
  /* ---------------- Unit 1 ---------------- */
  MomentArmSlider: {
    diagram: "moment-arm",
    controls: [
      { kind: "slider", key: "arm", label: "Moment arm", min: 0.1, max: 1, step: 0.01, initial: 0.6, format: (v) => `${(v * 100).toFixed(0)}%` },
      { kind: "slider", key: "force", label: "Force", min: 0.2, max: 1, step: 0.01, initial: 0.6, format: pct, tone: "nogo" },
    ],
    toProps: (s) => ({ arm: s.arm }),
    readouts: (s) => [
      { label: "Force", value: pct(s.force), tone: "nogo" },
      { label: "Arm", value: pct(s.arm), tone: "brand" },
      { label: "Moment = F × d", value: pct(s.force * s.arm), tone: "go" },
    ],
    note: () => "Doubling the arm doubles the moment for the same force — which is why trim tabs work.",
  },

  AtmosphereSlider: {
    diagram: "atmosphere-column",
    controls: [
      { kind: "slider", key: "altitude", label: "Altitude", min: 0, max: 40000, step: 500, initial: 0, format: ft },
    ],
    toProps: (s) => ({ altitude: s.altitude }),
    readouts: (s) => {
      const a = atmosphereAt(s.altitude);
      return [
        { label: "Pressure", value: `${a.pressure.toFixed(1)} in-Hg`, tone: "brand" },
        { label: "Temperature", value: `${a.temperature.toFixed(0)} °C`, tone: "caution" },
        { label: "Density", value: pct(a.densityRatio), tone: "go", hint: "of sea level" },
        { label: "Speed of sound", value: kt(a.speedOfSound), tone: "violet" },
      ];
    },
    chain: (s) =>
      s.altitude > 0
        ? [
            { label: "Altitude", trend: "up" },
            { label: "Pressure", trend: "down" },
            { label: "Temperature", trend: "down" },
            { label: "Density", trend: "down" },
          ]
        : [{ label: "Sea level standard day" }],
    note: (s) =>
      s.altitude >= 36000
        ? "Above 36,000 ft the temperature holds at −56.5 °C — the isothermal layer."
        : "All three fall together. Temperature at 2 °C per 1,000 ft.",
  },

  StreamtubeSlider: {
    diagram: "streamtube",
    controls: [
      { kind: "slider", key: "constriction", label: "Constriction", min: 0, max: 0.8, step: 0.01, initial: 0.35, format: pct },
    ],
    toProps: (s) => ({ constriction: s.constriction }),
    readouts: (s) => {
      const vRatio = 1 / (1 - s.constriction * 0.72);
      return [
        { label: "Area at throat", value: pct(1 - s.constriction * 0.72), tone: "neutral" },
        { label: "Velocity", value: x(vRatio), tone: "nogo" },
        { label: "Dynamic q", value: x(vRatio ** 2), tone: "caution" },
        { label: "Static pressure", value: "falls", tone: "go" },
      ];
    },
    chain: () => [
      { label: "Area", trend: "down" },
      { label: "Velocity", trend: "up" },
      { label: "Dynamic q", trend: "up" },
      { label: "Static pressure", trend: "down" },
    ],
    note: () => "Total pressure never moves. Static and dynamic just trade against each other.",
  },

  IcetgLadderWidget: {
    diagram: "ias-tas-ladder",
    controls: [
      { kind: "slider", key: "altitude", label: "Pressure altitude", min: 0, max: 30000, step: 500, initial: 0, format: ft },
      { kind: "slider", key: "ias", label: "Indicated airspeed", min: 80, max: 250, step: 5, initial: 150, format: kt, tone: "brand" },
    ],
    toProps: (s) => ({ altitude: s.altitude, ias: s.ias }),
    readouts: (s) => {
      const a = atmosphereAt(s.altitude);
      const tas = tasFromIas(s.ias, a.densityRatio);
      return [
        { label: "IAS", value: kt(s.ias), tone: "brand" },
        { label: "TAS", value: kt(tas), tone: "nogo" },
        { label: "Difference", value: `+${Math.round(tas - s.ias)} kt`, tone: "caution" },
        { label: "Mach", value: (tas / a.speedOfSound).toFixed(2), tone: "violet" },
      ];
    },
    note: () => "About +3 knots of TAS per 1,000 ft at a constant indicated airspeed.",
  },

  AoaVsPitchSlider: {
    diagram: "aoa-vs-pitch",
    controls: [
      { kind: "slider", key: "pitch", label: "Pitch attitude", min: -10, max: 25, step: 1, initial: 8, format: deg },
      { kind: "slider", key: "flightPath", label: "Flight path angle", min: -20, max: 20, step: 1, initial: 2, format: deg, tone: "brand" },
    ],
    toProps: (s) => ({ pitch: s.pitch, flightPath: s.flightPath }),
    readouts: (s) => {
      const aoa = s.pitch - s.flightPath;
      return [
        { label: "Pitch attitude", value: deg(s.pitch), tone: "neutral", hint: "vs horizon" },
        { label: "Flight path", value: deg(s.flightPath), tone: "brand" },
        { label: "Angle of attack", value: deg(aoa), tone: aoa > 16 ? "nogo" : "go", hint: "vs relative wind" },
      ];
    },
    note: (s) =>
      s.pitch - s.flightPath > 16
        ? "Past CLmax AOA. The wing is stalled — and the nose may still be above the horizon."
        : "Hold pitch constant and change the flight path: AOA moves anyway.",
  },

  CamberSlider: {
    diagram: "airfoil-geometry",
    controls: [
      { kind: "slider", key: "camber", label: "Camber", min: -0.08, max: 0.1, step: 0.005, initial: 0.06, format: (v) => (Math.abs(v) < 0.005 ? "symmetric" : `${(v * 100).toFixed(1)}% chord`), tone: "violet" },
    ],
    toProps: (s) => ({ camber: s.camber, labels: true }),
    readouts: (s) => [
      {
        label: "Airfoil type",
        value: s.camber > 0.005 ? "Positive" : s.camber < -0.005 ? "Negative" : "Symmetric",
        tone: "violet",
      },
      {
        label: "Lift at 0° AOA",
        value: s.camber > 0.005 ? "positive" : s.camber < -0.005 ? "negative" : "ZERO",
        tone: Math.abs(s.camber) < 0.005 ? "go" : "neutral",
      },
    ],
    note: () => "Only the symmetric airfoil produces zero lift at zero angle of attack.",
  },

  AeroForceSlider: {
    diagram: "aero-force-components",
    controls: [
      { kind: "slider", key: "aoa", label: "Angle of attack", min: -2, max: 18, step: 1, initial: 8, format: deg },
    ],
    toProps: (s) => ({ aoa: s.aoa }),
    readouts: (s) => [
      { label: "AOA", value: deg(s.aoa) },
      { label: "Lift", value: "⟂ relative wind", tone: "go" },
      { label: "Drag", value: "∥ relative wind", tone: "caution" },
    ],
    note: () => "Both components rotate with the relative wind. Lift never cares where the horizon is.",
  },

  /* ---------------- Unit 2 ---------------- */
  PressureDistributionSlider: {
    diagram: "airfoil-pressure",
    controls: [
      { kind: "slider", key: "aoa", label: "Angle of attack", min: -4, max: 20, step: 1, initial: 4, format: deg },
      { kind: "slider", key: "camber", label: "Camber", min: 0, max: 0.09, step: 0.005, initial: 0.06, format: (v) => `${(v * 100).toFixed(1)}%`, tone: "violet" },
    ],
    toProps: (s) => ({ aoa: s.aoa, camber: s.camber, arrows: true, showResultant: true }),
    readouts: (s) => {
      const cl = coefficientOfLift(s.aoa, CL_CONFIG.positive);
      return [
        { label: "AOA", value: deg(s.aoa) },
        { label: "Upper-surface suction", value: s.aoa > 16 ? "collapsing" : "growing", tone: s.aoa > 16 ? "nogo" : "brand" },
        { label: "Coefficient of lift", value: cl.toFixed(2), tone: s.aoa > 16 ? "nogo" : "go" },
      ];
    },
    note: (s) =>
      s.aoa > 16
        ? "Past CLmax AOA the suction peak collapses and CL falls. That is the stall."
        : "More AOA squeezes the upper streamtube harder — more velocity, less static pressure, more lift.",
  },

  LiftLabMini: {
    diagram: "lift-equation-anatomy",
    controls: [
      { kind: "slider", key: "density", label: "Density ρ", min: 0.4, max: 1.2, step: 0.02, initial: 1, format: x, tone: "brand" },
      { kind: "slider", key: "velocity", label: "Velocity V", min: 0.4, max: 2, step: 0.02, initial: 1, format: x, tone: "nogo" },
      { kind: "slider", key: "area", label: "Wing area S", min: 0.6, max: 1.6, step: 0.02, initial: 1, format: x },
      { kind: "slider", key: "cl", label: "Coefficient C_L", min: 0.3, max: 1.6, step: 0.02, initial: 1, format: x, tone: "go" },
    ],
    toProps: () => ({}),
    readouts: (s) => {
      const lift = s.density * s.velocity ** 2 * s.area * s.cl;
      const q = s.density * s.velocity ** 2;
      return [
        { label: "Dynamic pressure q", value: x(q), tone: "caution", hint: "½ρV²" },
        { label: "Lift", value: pct(lift), tone: lift >= 1 ? "go" : "nogo", hint: "relative to baseline" },
      ];
    },
    chain: () => [
      { label: "Velocity", trend: "up" },
      { label: "q (as V²)", trend: "up" },
      { label: "Lift (as V²)", trend: "up" },
    ],
    note: (s) =>
      Math.abs(s.velocity - 2) < 0.05
        ? "Velocity doubled — and lift is four times the baseline. Only V is squared."
        : "Try setting velocity to ×2.00 and watch lift reach 400%.",
  },

  CLCurveSlider: {
    diagram: "cl-vs-aoa",
    controls: [
      { kind: "slider", key: "aoa", label: "Angle of attack", min: -6, max: 24, step: 1, initial: 6, format: deg },
      { kind: "segmented", key: "camber", label: "Camber", initial: 0, options: [
        { value: 0, label: "Positive" },
        { value: 1, label: "Symmetric" },
        { value: 2, label: "Negative" },
      ] },
      { kind: "toggle", key: "flaps", label: "Flaps", initial: 0, onLabel: "DOWN", offLabel: "UP", tone: "caution" },
    ],
    toProps: (s) => ({
      marker: s.aoa,
      camber: (["positive", "symmetric", "negative"] as const)[s.camber],
      flaps: s.flaps === 1,
    }),
    readouts: (s) => {
      const base = CL_CONFIG[(["positive", "symmetric", "negative"] as const)[s.camber]];
      const cfg = s.flaps === 1 ? withFlaps(base) : base;
      const cl = coefficientOfLift(s.aoa, cfg);
      return [
        { label: "C_L now", value: cl.toFixed(2), tone: s.aoa > cfg.clMaxAoa ? "nogo" : "go" },
        { label: "CLmax", value: cfg.clMax.toFixed(2), tone: "brand" },
        { label: "CLmax AOA", value: deg(cfg.clMaxAoa), tone: "caution" },
        { label: "State", value: s.aoa > cfg.clMaxAoa ? "STALLED" : "flying", tone: s.aoa > cfg.clMaxAoa ? "nogo" : "go" },
      ];
    },
    note: (s) =>
      s.flaps === 1
        ? "Flaps down: CLmax is higher, but it arrives at a LOWER angle of attack."
        : "Drag the AOA marker past the peak and watch CL fall. That is the definition of a stall.",
  },

  /* ---------------- Unit 3 ---------------- */
  FormDragSlider: {
    diagram: "parasite-components",
    controls: [
      { kind: "slider", key: "streamlining", label: "Streamlining", min: 0, max: 1, step: 0.01, initial: 0.3, format: (v) => (v < 0.33 ? "flat plate" : v < 0.66 ? "sphere" : "teardrop") },
    ],
    toProps: () => ({}),
    readouts: (s) => [
      { label: "Wake size", value: pct(1 - s.streamlining * 0.86), tone: "caution" },
      { label: "Form drag", value: pct(1 - s.streamlining * 0.82), tone: "nogo" },
      { label: "Friction drag", value: pct(0.35 + s.streamlining * 0.4), tone: "brand" },
      { label: "Total parasite", value: pct(0.9 - s.streamlining * 0.48), tone: "go" },
    ],
    note: () => "Streamlining trades a little extra friction drag for a much smaller wake.",
  },

  InducedDragSlider: {
    diagram: "wingtip-vortex",
    controls: [
      { kind: "slider", key: "velocity", label: "Airspeed", min: 0.3, max: 1.4, step: 0.02, initial: 0.6, format: x },
      { kind: "slider", key: "weight", label: "Weight", min: 0.7, max: 1.6, step: 0.02, initial: 1, format: x, tone: "nogo" },
      { kind: "toggle", key: "infinite", label: "Infinite wing (no tips)", initial: 0, onLabel: "YES", offLabel: "NO" },
    ],
    toProps: (s) => ({ infinite: s.infinite === 1, showVectors: true }),
    readouts: (s) => {
      const cfg = { ...REFERENCE_DRAG, weight: s.weight };
      const di = s.infinite === 1 ? 0 : inducedDrag(s.velocity, cfg);
      return [
        { label: "Induced drag", value: s.infinite === 1 ? "none" : x(di), tone: s.infinite === 1 ? "go" : "brand" },
        { label: "AOA required", value: s.velocity < 0.6 ? "high" : "low", tone: s.velocity < 0.6 ? "caution" : "go" },
        { label: "Vortex strength", value: s.infinite === 1 ? "none" : s.velocity < 0.6 ? "strong" : "weak", tone: "caution" },
      ];
    },
    chain: () => [
      { label: "Airspeed", trend: "down" },
      { label: "AOA", trend: "up" },
      { label: "C_L", trend: "up" },
      { label: "Vortex strength", trend: "up" },
      { label: "Induced drag", trend: "up" },
    ],
    note: (s) =>
      s.infinite === 1
        ? "No tips means upwash exactly balances downwash — and no induced drag at all."
        : "D_I = kW²/(ρV²b²). Weight squared on top; velocity squared underneath.",
  },

  GroundEffectSlider: {
    diagram: "ground-effect",
    controls: [
      { kind: "slider", key: "height", label: "Height above ground", min: 0.04, max: 1.8, step: 0.02, initial: 1.4, format: (v) => `${v.toFixed(2)} wingspans` },
    ],
    toProps: (s) => ({ heightFraction: s.height }),
    note: (s) =>
      s.height <= 1
        ? "Inside one wingspan: the ground blocks the downwash, so effective lift rises and induced drag falls."
        : "Above one wingspan there is essentially no ground effect.",
  },

  DragLabMini: {
    diagram: "drag-curves",
    controls: [
      { kind: "slider", key: "velocity", label: "Airspeed", min: 0.16, max: 1.5, step: 0.01, initial: 0.35, format: x },
      { kind: "slider", key: "weight", label: "Weight", min: 0.7, max: 1.5, step: 0.02, initial: 1, format: x, tone: "nogo" },
    ],
    toProps: (s) => ({ weight: s.weight, marker: s.velocity / 1.5, reveal: "all", showRegions: true }),
    readouts: (s) => {
      const cfg = { ...REFERENCE_DRAG, weight: s.weight };
      const dp = parasiteDrag(s.velocity, cfg);
      const di = inducedDrag(s.velocity, cfg);
      const ld = ldMaxVelocity(cfg);
      return [
        { label: "Parasite drag", value: dp.toFixed(2), tone: "caution" },
        { label: "Induced drag", value: di.toFixed(2), tone: "brand" },
        { label: "Total drag", value: totalDrag(s.velocity, cfg).toFixed(2), tone: "neutral" },
        {
          label: "Versus L/Dmax",
          value: Math.abs(s.velocity - ld) < 0.04 ? "AT L/Dmax" : s.velocity < ld ? "below" : "above",
          tone: Math.abs(s.velocity - ld) < 0.04 ? "go" : "neutral",
        },
      ];
    },
    note: (s) => {
      const cfg = { ...REFERENCE_DRAG, weight: s.weight };
      const ld = ldMaxVelocity(cfg);
      if (Math.abs(s.velocity - ld) < 0.04) return "Parasite drag equals induced drag. This is L/Dmax — minimum total drag.";
      return s.velocity < ld
        ? "Below L/Dmax: induced drag dominates, and slowing further makes total drag worse."
        : "Above L/Dmax: parasite drag dominates and grows with the square of velocity.";
    },
  },

  /* ---------------- Unit 4 ---------------- */
  ThrustPowerMini: {
    diagram: "thrust-power-pair",
    controls: [
      { kind: "segmented", key: "engine", label: "Engine", initial: 0, options: [
        { value: 0, label: "Turboprop" },
        { value: 1, label: "Turbojet" },
      ] },
      { kind: "toggle", key: "available", label: "Show available curves", initial: 1, onLabel: "ON", offLabel: "OFF", tone: "go" },
    ],
    toProps: (s) => ({ engine: s.engine === 0 ? "turboprop" : "turbojet", showAvailable: s.available === 1 }),
    note: () => "L/Dmax sits at the bottom of the thrust required curve, but to the RIGHT of the bottom of the power curve.",
    wide: false,
  },

  CurveShiftLab: {
    diagram: "thrust-curves",
    controls: [
      { kind: "slider", key: "weight", label: "Gross weight", min: 0.8, max: 1.4, step: 0.02, initial: 1, format: x, tone: "nogo" },
      { kind: "slider", key: "altitude", label: "Altitude", min: 0, max: 25000, step: 1000, initial: 0, format: ft, tone: "brand" },
      { kind: "toggle", key: "gear", label: "Landing gear", initial: 0, onLabel: "DOWN", offLabel: "UP", tone: "caution" },
      { kind: "toggle", key: "flaps", label: "Flaps", initial: 0, onLabel: "DOWN", offLabel: "UP", tone: "caution" },
    ],
    toProps: (s) => ({
      weight: s.weight,
      altitude: s.altitude,
      gear: s.gear === 1,
      flaps: s.flaps === 1,
      showExcess: true,
      ghost: true,
    }),
    readouts: (s) => {
      const rows: { label: string; value: string; tone?: Tone }[] = [];
      if (s.weight !== 1) rows.push({ label: "Weight", value: "UP and RIGHT", tone: "nogo" });
      if (s.altitude > 0) rows.push({ label: "Altitude", value: "RIGHT only", tone: "brand" });
      if (s.gear === 1) rows.push({ label: "Gear", value: "straight UP", tone: "caution" });
      if (s.flaps === 1) rows.push({ label: "Flaps", value: "UP and LEFT", tone: "caution" });
      if (rows.length === 0) rows.push({ label: "Baseline", value: "no shift", tone: "neutral" });
      rows.push({
        label: "Excess thrust",
        value: rows[0].label === "Baseline" ? "baseline" : "reduced",
        tone: rows[0].label === "Baseline" ? "neutral" : "nogo",
      });
      return rows;
    },
    note: (s) =>
      s.altitude > 0 && s.weight === 1 && s.gear === 0 && s.flaps === 0
        ? "Altitude moves thrust required RIGHT but not UP — the density loss is offset by the velocity gain."
        : "Every one of these changes reduces both excess thrust and excess power.",
  },

  TakeoffLab: {
    diagram: "takeoff-forces",
    controls: [
      { kind: "slider", key: "weight", label: "Weight", min: 0.7, max: 2, step: 0.02, initial: 1, format: x, tone: "nogo" },
      { kind: "slider", key: "elevation", label: "Field elevation", min: 0, max: 8000, step: 250, initial: 0, format: ft },
      { kind: "slider", key: "temp", label: "OAT deviation", min: -20, max: 35, step: 1, initial: 0, format: (v) => `${v > 0 ? "+" : ""}${v} °C`, tone: "caution" },
      { kind: "slider", key: "humidity", label: "Humidity", min: 0, max: 1, step: 0.05, initial: 0.3, format: pct, tone: "brand" },
      { kind: "slider", key: "wind", label: "Wind", min: -0.2, max: 0.3, step: 0.01, initial: 0, format: (v) => (v > 0 ? `${Math.round(v * 100)}% headwind` : v < 0 ? `${Math.round(-v * 100)}% tailwind` : "calm"), tone: "go" },
      { kind: "toggle", key: "flaps", label: "Takeoff flaps", initial: 0, onLabel: "SET", offLabel: "UP", tone: "go" },
    ],
    toProps: () => ({}),
    readouts: (s) => {
      const a = atmosphereAt(s.elevation, s.temp);
      const densityRatio = a.densityRatio * humidityDensityFactor(s.humidity, a.temperature);
      const clMaxRatio = s.flaps === 1 ? 1.35 : 1;
      const inputs = { weightRatio: s.weight, densityRatio, clMaxRatio, windFraction: s.wind };
      return [
        { label: "Density altitude", value: ft(s.elevation + 120 * s.temp), tone: "brand" },
        { label: "Takeoff TAS", value: x(takeoffSpeedRatio(inputs)), tone: "caution", hint: "indicated is unchanged" },
        {
          label: "Takeoff distance",
          value: x(takeoffDistanceRatio(inputs)),
          tone: takeoffDistanceRatio(inputs) > 1.5 ? "nogo" : takeoffDistanceRatio(inputs) > 1 ? "caution" : "go",
        },
      ];
    },
    chain: (s) =>
      s.weight > 1.1
        ? [
            { label: "Weight", trend: "up" },
            { label: "Lift required", trend: "up" },
            { label: "Takeoff speed", trend: "up" },
            { label: "Distance (as W²)", trend: "up" },
          ]
        : [
            { label: "High · Hot · Humid", trend: "up" },
            { label: "Density", trend: "down" },
            { label: "True takeoff speed", trend: "up" },
            { label: "Distance", trend: "up" },
          ],
    note: (s) =>
      s.weight >= 1.95
        ? "Weight doubled — and the distance is roughly four times the baseline. Weight is squared."
        : "Note that INDICATED takeoff speed never changes. Only true airspeed and distance do.",
  },

  ClimbLab: {
    diagram: "climb-vectors",
    controls: [
      { kind: "segmented", key: "which", label: "Profile", initial: 0, options: [
        { value: 0, label: "Both" },
        { value: 1, label: "Vx only" },
        { value: 2, label: "Vy only" },
      ] },
    ],
    toProps: (s) => ({ which: (["both", "vx", "vy"] as const)[s.which] }),
    readouts: () => [
      { label: "Vx — max angle", value: "thrust excess", tone: "brand", hint: "obstacle clearance" },
      { label: "Vy — max rate", value: "power excess", tone: "go", hint: "expedite the climb" },
    ],
    note: () => "Turboprop: Vx is BELOW L/Dmax airspeed; Vy is AT L/Dmax. A headwind steepens the angle but not the rate.",
  },

  RangeEnduranceLab: {
    diagram: "power-curves",
    controls: [
      { kind: "slider", key: "weight", label: "Weight", min: 0.8, max: 1.4, step: 0.02, initial: 1, format: x, tone: "nogo" },
      { kind: "slider", key: "altitude", label: "Altitude", min: 0, max: 25000, step: 1000, initial: 0, format: ft, tone: "brand" },
    ],
    toProps: (s) => ({ weight: s.weight, altitude: s.altitude, showRangeEndurance: true, ghost: true }),
    readouts: (s) => {
      const cfg = { ...REFERENCE_DRAG, weight: s.weight };
      return [
        { label: "Max endurance", value: x(maxEnduranceVelocity(cfg)), tone: "caution", hint: "bottom of P_R" },
        { label: "Max range", value: x(ldMaxVelocity(cfg)), tone: "brand", hint: "at L/Dmax" },
        { label: "Altitude effect", value: s.altitude > 0 ? "both improve" : "baseline", tone: s.altitude > 0 ? "go" : "neutral" },
      ];
    },
    chain: () => [
      { label: "Max endurance" },
      { label: "AOA", trend: "down" },
      { label: "Velocity", trend: "up" },
      { label: "Max range" },
    ],
    note: () => "Max range is always the FASTER of the two — and altitude improves both.",
  },

  ReverseCommandLab: {
    diagram: "power-curves",
    controls: [
      { kind: "slider", key: "velocity", label: "Airspeed", min: 0.05, max: 1, step: 0.01, initial: 0.7, format: (v) => `${Math.round(v * 100)}%` },
    ],
    toProps: (s) => ({ marker: s.velocity, showRegions: true }),
    readouts: (s) => {
      const cfg = REFERENCE_DRAG;
      const v = 0.1 + s.velocity * 1.4;
      const endurance = maxEnduranceVelocity(cfg);
      const inReverse = v < endurance;
      return [
        { label: "Region", value: inReverse ? "REVERSE" : "NORMAL", tone: inReverse ? "nogo" : "go" },
        { label: "Power required", value: powerRequired(v, cfg).toFixed(2), tone: "brand" },
        { label: "To fly slower", value: inReverse ? "ADD power" : "reduce power", tone: inReverse ? "nogo" : "neutral" },
        { label: "Airspeed stability", value: inReverse ? "unstable" : "stable", tone: inReverse ? "caution" : "go" },
      ];
    },
    note: (s) =>
      0.1 + s.velocity * 1.4 < maxEnduranceVelocity(REFERENCE_DRAG)
        ? "In reverse command, pulling back to slow down deepens the power deficit. Use throttle."
        : "In normal command a gust self-corrects: slow down and a thrust excess speeds you back up.",
  },

  /* ---------------- Unit 5 ---------------- */
  BoundaryLayerSlider: {
    diagram: "boundary-layer",
    controls: [
      { kind: "slider", key: "aoa", label: "Angle of attack", min: 0, max: 24, step: 1, initial: 6, format: deg },
      { kind: "toggle", key: "gradient", label: "Show pressure gradient", initial: 0, onLabel: "ON", offLabel: "OFF" },
    ],
    toProps: (s) => ({ aoa: s.aoa, showGradient: s.gradient === 1 }),
    chain: () => [
      { label: "AOA", trend: "up" },
      { label: "Boundary layer energy", trend: "down" },
      { label: "Adverse gradient", trend: "up" },
      { label: "Separation moves FORWARD" },
      { label: "C_L", trend: "down" },
    ],
    note: (s) =>
      s.aoa > 16
        ? "The separation point is far enough forward that CL is falling. Stalled."
        : "Raise AOA and the separation point marches FORWARD, toward the leading edge.",
  },

  StallSpeedLab: {
    diagram: "stall-speed-equation",
    controls: [
      { kind: "slider", key: "weight", label: "Weight", min: 0.7, max: 1.5, step: 0.02, initial: 1, format: x, tone: "nogo" },
      { kind: "slider", key: "altitude", label: "Altitude", min: 0, max: 25000, step: 1000, initial: 0, format: ft, tone: "brand" },
      { kind: "slider", key: "bank", label: "Angle of bank", min: 0, max: 75, step: 5, initial: 0, format: deg, tone: "caution" },
      { kind: "toggle", key: "flaps", label: "Flaps", initial: 0, onLabel: "DOWN", offLabel: "UP", tone: "go" },
      { kind: "toggle", key: "power", label: "Power", initial: 0, onLabel: "ON", offLabel: "OFF", tone: "go" },
    ],
    toProps: () => ({}),
    readouts: (s) => {
      const a = atmosphereAt(s.altitude);
      const n = loadFactor(s.bank);
      const clMaxRatio = (s.flaps === 1 ? 1.35 : 1) * (s.power === 1 ? 1.08 : 1);
      const base = { weightRatio: s.weight, clMaxRatio, loadFactor: n, baseline: 86 };
      const trueVs = trueStallSpeed({ ...base, densityRatio: a.densityRatio });
      const indicatedVs = trueStallSpeed({ ...base, densityRatio: 1 });
      return [
        { label: "Load factor", value: `${n.toFixed(2)} G`, tone: n > 2 ? "nogo" : "neutral" },
        { label: "TRUE stall speed", value: kt(trueVs), tone: "nogo" },
        { label: "INDICATED stall speed", value: kt(indicatedVs), tone: "brand", hint: "does not change with altitude" },
      ];
    },
    note: (s) =>
      s.altitude > 0
        ? "Altitude raises TRUE stall speed but leaves INDICATED stall speed untouched — ρ₀ is a constant."
        : s.bank > 0
          ? "Bank multiplies stall speed by √n. At 60° that is about 40% higher."
          : "Weight up, stall speed up. Flaps down or power on, stall speed down.",
  },

  HighLiftLab: {
    diagram: "high-lift-comparison",
    controls: [
      { kind: "segmented", key: "device", label: "Device", initial: 0, options: [
        { value: 0, label: "Slat (BLC)" },
        { value: 1, label: "Flap (camber)" },
        { value: 2, label: "Both" },
      ] },
    ],
    toProps: (s) => ({ device: (["slat", "flap", "both"] as const)[s.device] }),
    readouts: (s) => {
      const clean = CL_CONFIG.positive;
      const cfg = s.device === 0 ? withSlat(clean) : s.device === 1 ? withFlaps(clean) : withFlaps(withSlat(clean));
      return [
        { label: "CLmax", value: cfg.clMax.toFixed(2), tone: "go", hint: `clean ${clean.clMax.toFixed(2)}` },
        {
          label: "CLmax AOA",
          value: deg(cfg.clMaxAoa),
          tone: cfg.clMaxAoa > clean.clMaxAoa ? "go" : "nogo",
          hint: `clean ${clean.clMaxAoa}°`,
        },
      ];
    },
    note: (s) =>
      s.device === 0
        ? "Boundary layer control delays separation to a HIGHER angle of attack — and does nothing at low AOA."
        : s.device === 1
          ? "Camber raises CL everywhere, but the stall arrives at a LOWER angle of attack."
          : "Both together: a high CLmax reached at a flat, high-visibility approach attitude.",
  },

  TurnLabMini: {
    diagram: "turn-forces",
    controls: [
      { kind: "slider", key: "bank", label: "Angle of bank", min: 0, max: 80, step: 1, initial: 30, format: deg, tone: "caution" },
      { kind: "slider", key: "speed", label: "True airspeed", min: 90, max: 280, step: 5, initial: 150, format: kt, tone: "brand" },
    ],
    toProps: (s) => ({ bank: s.bank, showRequired: true, showStall: true }),
    readouts: (s) => {
      const n = loadFactor(s.bank);
      return [
        { label: "Load factor", value: `${n.toFixed(2)} G`, tone: n > 4 ? "nogo" : n > 2 ? "caution" : "neutral" },
        { label: "Stall speed", value: `×${stallSpeedMultiplier(n).toFixed(2)}`, tone: "nogo" },
        { label: "Turn rate", value: `${turnRate(s.bank, s.speed).toFixed(1)}°/s`, tone: "go" },
        {
          label: "Turn radius",
          value: Number.isFinite(turnRadius(s.bank, s.speed)) ? ft(turnRadius(s.bank, s.speed)) : "∞",
          tone: "brand",
        },
      ];
    },
    chain: () => [
      { label: "Bank angle", trend: "up" },
      { label: "Load factor", trend: "up" },
      { label: "Lift required", trend: "up" },
      { label: "Stall speed", trend: "up" },
    ],
    note: (s) =>
      s.bank >= 58 && s.bank <= 62
        ? "60° of bank is exactly 2 G — and a stall speed 40% above the wings-level figure."
        : "Turn rate and radius depend only on airspeed and bank. Weight appears in neither formula.",
  },

  VnLabMini: {
    diagram: "vn-diagram",
    controls: [
      { kind: "slider", key: "kias", label: "Indicated airspeed", min: 60, max: 360, step: 5, initial: 200, format: kt, tone: "brand" },
      { kind: "slider", key: "loadFactor", label: "Load factor", min: -5, max: 9, step: 0.25, initial: 2, format: (v) => `${v.toFixed(2)} G`, tone: "nogo" },
      { kind: "slider", key: "weight", label: "Gross weight", min: 0.85, max: 1.3, step: 0.05, initial: 1, format: x },
    ],
    toProps: (s) => ({ kias: s.kias, loadFactor: s.loadFactor, weight: s.weight, reveal: 6 }),
    readouts: (s) => {
      const cfg = {
        ...T6B_VN,
        stallSpeed: T6B_VN.stallSpeed * Math.sqrt(s.weight),
        positiveLimit: T6B_VN.positiveLimit / s.weight,
        negativeLimit: T6B_VN.negativeLimit / s.weight,
      };
      return [
        { label: "Maneuver speed", value: kt(maneuverSpeed(cfg)), tone: "brand" },
        { label: "Stall speed at this G", value: kt(acceleratedStallSpeed(cfg, s.loadFactor)), tone: "caution" },
        { label: "Limit load", value: `+${cfg.positiveLimit.toFixed(1)} G`, tone: "nogo" },
      ];
    },
    note: (s) =>
      s.kias < maneuverSpeed(T6B_VN)
        ? "Below maneuver speed the wing stalls before the structure loads. An over-G is impossible here."
        : "Above maneuver speed you can exceed the limit load before the wing stalls. Respect the G.",
  },

  /* ---------------- Unit 6 ---------------- */
  PropEffectsLab: {
    diagram: "aoa-vs-pitch",
    controls: [
      { kind: "slider", key: "power", label: "Power setting", min: 0, max: 1, step: 0.05, initial: 0.9, format: pct, tone: "nogo" },
      { kind: "slider", key: "speed", label: "Airspeed", min: 0, max: 1, step: 0.05, initial: 0.2, format: (v) => (v < 0.35 ? "low" : v < 0.7 ? "cruise" : "high") },
    ],
    toProps: (s) => ({ pitch: 4 + (1 - s.speed) * 12, flightPath: 2, highlight: "aoa" }),
    readouts: (s) => {
      const severity = s.power * (1 - s.speed);
      const label = severity > 0.6 ? "STRONG" : severity > 0.3 ? "moderate" : "slight";
      const tone: Tone = severity > 0.6 ? "nogo" : severity > 0.3 ? "caution" : "neutral";
      return [
        { label: "P-factor", value: label, tone, hint: "needs high power + high AOA" },
        { label: "Slipstream swirl", value: label, tone, hint: "hits the LEFT of the fin" },
        { label: "Net yaw", value: severity > 0.15 ? "LEFT" : "negligible", tone },
        { label: "Correction", value: severity > 0.15 ? "RIGHT rudder" : "—", tone: "go" },
      ];
    },
    chain: () => [
      { label: "High power + low airspeed" },
      { label: "Relative wind below the thrust line" },
      { label: "Down-going right blade AOA", trend: "up" },
      { label: "Nose yaws LEFT" },
      { label: "Right rudder" },
    ],
    note: () => "Torque, P-factor, slipstream swirl and gyroscopic precession all push the nose left. All want right rudder.",
  },

  SpinLabMini: {
    diagram: "spin-wings",
    controls: [
      { kind: "slider", key: "aoa", label: "Angle of attack", min: 8, max: 26, step: 1, initial: 22, format: deg, tone: "nogo" },
      { kind: "slider", key: "yaw", label: "Yaw input", min: 0, max: 1, step: 0.05, initial: 0, format: pct, tone: "caution" },
    ],
    toProps: (s) => ({ yaw: s.aoa > 18 ? s.yaw : 0, showRelWind: true, showCoeffs: true }),
    readouts: (s) => {
      const stalled = s.aoa > 18;
      const spinning = stalled && s.yaw > 0.15;
      return [
        { label: "Stalled?", value: stalled ? "YES" : "no", tone: stalled ? "nogo" : "go" },
        { label: "Yaw present?", value: s.yaw > 0.15 ? "YES" : "no", tone: s.yaw > 0.15 ? "nogo" : "go" },
        { label: "Result", value: spinning ? "AUTOROTATION" : stalled ? "straight stall" : "flying", tone: spinning ? "nogo" : stalled ? "caution" : "go" },
      ];
    },
    note: (s) =>
      s.aoa > 18 && s.yaw > 0.15
        ? "Stall plus yaw. The down-going wing is more stalled, and the asymmetry sustains itself."
        : s.aoa > 18
          ? "Stalled but coordinated — no yaw, no spin. Add yaw and watch it depart."
          : "Below CLmax AOA the wings cannot autorotate no matter how much yaw you add.",
  },

  StabilityContributors: {
    diagram: "stability-ball",
    controls: [
      { kind: "segmented", key: "kind", label: "Behaviour", initial: 0, options: [
        { value: 0, label: "Positive" },
        { value: 1, label: "Neutral" },
        { value: 2, label: "Negative" },
        { value: 3, label: "Damped" },
        { value: 4, label: "Divergent" },
      ] },
    ],
    toProps: (s) => ({
      kind: (["positive-static", "neutral-static", "negative-static", "damped", "divergent"] as const)[s.kind],
    }),
    readouts: () => [
      { label: "Longitudinal", value: "Horizontal stabiliser", tone: "go", hint: "greatest positive contributor" },
      { label: "Directional", value: "Vertical stabiliser", tone: "brand", hint: "weathervane effect" },
      { label: "Lateral", value: "Dihedral wings", tone: "violet", hint: "anhedral is the worst" },
    ],
    note: () => "Static instability guarantees dynamic instability. The reverse does not hold.",
  },

  WakeLabMini: {
    diagram: "wake-vortex",
    controls: [
      { kind: "slider", key: "weight", label: "Generator weight", min: 0.4, max: 1.6, step: 0.05, initial: 1.3, format: x, tone: "nogo" },
      { kind: "slider", key: "speed", label: "Generator speed", min: 0.3, max: 1.4, step: 0.05, initial: 0.5, format: x, tone: "brand" },
      { kind: "toggle", key: "dirty", label: "Flaps and gear", initial: 0, onLabel: "DOWN", offLabel: "UP", tone: "go" },
      { kind: "slider", key: "time", label: "Time since passage", min: 0, max: 1, step: 0.05, initial: 0.5, format: (v) => `${(v * 2).toFixed(1)} min` },
    ],
    toProps: (s) => ({
      weight: s.weight,
      speed: s.speed,
      dirty: s.dirty === 1,
      time: s.time,
      showGround: s.time > 0.7,
    }),
    readouts: (s) => {
      const strength = vortexStrength({ weight: s.weight, speed: s.speed, dirty: s.dirty === 1 });
      return [
        { label: "Vortex strength", value: `${strength}`, tone: strength > 66 ? "nogo" : strength > 33 ? "caution" : "go" },
        { label: "Sink rate", value: "400–500 fpm", tone: "caution" },
        { label: "Levels off", value: "~900 ft below", tone: "brand" },
      ];
    },
    chain: () => [
      { label: "Heavy", trend: "up" },
      { label: "Slow", trend: "down" },
      { label: "Clean" },
      { label: "Vortex strength", trend: "up" },
    ],
    note: (s) =>
      vortexStrength({ weight: s.weight, speed: s.speed, dirty: s.dirty === 1 }) > 70
        ? "Heavy, slow and clean — the worst case. T-6B spacing: 2 minutes takeoff, 3 minutes landing."
        : "Light, fast and dirty is the weakest wake — but every aircraft producing lift makes one.",
  },

  WindShearLab: {
    diagram: "wind-shear",
    controls: [
      { kind: "slider", key: "phase", label: "Approach phase", min: 0, max: 5, step: 1, initial: 0, format: (v) => `${v + 1} of 6` },
    ],
    toProps: (s) => ({ phase: s.phase, type: "microburst" }),
    readouts: (s) => {
      const rows: Record<number, { ias: string; lift: string; tone: Tone }> = {
        0: { ias: "on speed", lift: "steady", tone: "go" },
        1: { ias: "+20 kt", lift: "increasing", tone: "caution" },
        2: { ias: "+20 kt", lift: "high", tone: "caution" },
        3: { ias: "settling", lift: "reducing", tone: "caution" },
        4: { ias: "−25 kt", lift: "falling", tone: "nogo" },
        5: { ias: "−25 kt", lift: "LOST", tone: "nogo" },
      };
      const r = rows[s.phase] ?? rows[0];
      return [
        { label: "Indicated airspeed", value: r.ias, tone: r.tone },
        { label: "Lift", value: r.lift, tone: r.tone },
        {
          label: "Shear type",
          value: s.phase >= 4 ? "DECREASING" : s.phase >= 1 ? "increasing" : "none",
          tone: s.phase >= 4 ? "nogo" : s.phase >= 1 ? "caution" : "neutral",
        },
      ];
    },
    note: (s) =>
      s.phase >= 4
        ? "This is the killer. Nose already low, power already back, and the lift has just gone."
        : "A microburst gives you the performance INCREASE first. That is what sets up the trap.",
  },

  /* ---------------- Engines ---------------- */

  EnginePressureSplit: {
    diagram: "eng-pressure-split",
    controls: [
      {
        kind: "slider",
        key: "dynamic",
        label: "Dynamic share (velocity)",
        min: 0.05,
        max: 0.85,
        step: 0.01,
        initial: 0.35,
        format: pct,
        tone: "caution",
      },
    ],
    toProps: (s) => ({ dynamic: s.dynamic }),
    readouts: (s) => [
      { label: "Static (pressure)", value: pct(1 - s.dynamic), tone: "brand" },
      { label: "Dynamic (velocity)", value: pct(s.dynamic), tone: "caution" },
      { label: "Total", value: "100%", tone: "go", hint: "never changes" },
    ],
    chain: (s) =>
      s.dynamic > 0.35
        ? [
            { label: "Velocity", trend: "up" },
            { label: "Static pressure", trend: "down" },
            { label: "Total pressure", trend: "same" },
          ]
        : [
            { label: "Velocity", trend: "down" },
            { label: "Static pressure", trend: "up" },
            { label: "Total pressure", trend: "same" },
          ],
    note: () => "Total pressure is a fixed budget. Spend one side and the other grows to match.",
  },

  DuctRegimeToggle: {
    diagram: "eng-duct",
    controls: [
      {
        kind: "segmented",
        key: "shape",
        label: "Duct shape",
        initial: 0,
        options: [
          { value: 0, label: "Convergent" },
          { value: 1, label: "Divergent" },
        ],
      },
      {
        kind: "segmented",
        key: "regime",
        label: "Flow regime",
        initial: 0,
        options: [
          { value: 0, label: "Subsonic" },
          { value: 1, label: "Supersonic" },
        ],
      },
    ],
    toProps: (s) => ({
      shape: s.shape === 0 ? "convergent" : "divergent",
      regime: s.regime === 0 ? "subsonic" : "supersonic",
    }),
    readouts: (s) => {
      // Subsonic follows Bernoulli; supersonic inverts it.
      const convergent = s.shape === 0;
      const velocityUp = s.regime === 0 ? convergent : !convergent;
      return [
        { label: "Velocity", value: velocityUp ? "Increases" : "Decreases", tone: velocityUp ? "go" : "nogo" },
        { label: "Pressure", value: velocityUp ? "Decreases" : "Increases", tone: velocityUp ? "nogo" : "go" },
        { label: "Acting as a", value: velocityUp ? "Nozzle" : "Diffuser", tone: "brand" },
      ];
    },
    note: () =>
      "Flip only the regime and the same duct reverses. Shape never decides the outcome on its own.",
  },

  ThrustFactorExplorer: {
    diagram: "eng-thrust-factor",
    controls: [
      {
        kind: "segmented",
        key: "factor",
        label: "Factor",
        initial: 1,
        options: [
          { value: 0, label: "Temp" },
          { value: 1, label: "Altitude" },
          { value: 2, label: "RPM" },
          { value: 3, label: "Airspeed" },
        ],
      },
      { kind: "slider", key: "point", label: "Operating point", min: 0, max: 1, step: 0.01, initial: 0.4, format: pct },
    ],
    toProps: (s) => {
      const factor = ["temperature", "altitude", "rpm", "airspeed"][s.factor];
      const range = [
        [-40, 45],
        [0, 50],
        [30, 100],
        [0, 100],
      ][s.factor];
      return { factor, marker: range[0] + (range[1] - range[0]) * s.point };
    },
    readouts: (s) => {
      const labels: { label: string; value: string; tone: Tone }[] = [
        { label: "Colder air", value: "Denser, more thrust", tone: "go" },
        { label: "Higher altitude", value: "Less thrust", tone: "nogo" },
        { label: "Higher RPM", value: "More thrust, non-linear", tone: "go" },
        { label: "Higher airspeed", value: "Less thrust, before ram", tone: "caution" },
      ];
      const extra: { label: string; value: string; tone: Tone; hint?: string }[] =
        s.factor === 1
          ? [{ label: "Break point", value: "36,000 ft", tone: "nogo", hint: "temperature stops helping" }]
          : [];
      return [labels[s.factor], ...extra];
    },
    note: (s) =>
      s.factor === 1
        ? "Pressure loss beats temperature gain, and above 36,000 ft nothing offsets it any more."
        : "Every atmospheric factor reaches thrust through density, and so through the mass term of T = m x a.",
  },

  AxialStageBuilder: {
    diagram: "eng-axial",
    controls: [
      { kind: "slider", key: "stages", label: "Compressor stages", min: 2, max: 8, step: 1, initial: 4, format: (v) => String(v) },
    ],
    toProps: (s) => ({ stages: s.stages }),
    readouts: (s) => [
      { label: "Stages", value: String(s.stages), tone: "brand" },
      { label: "Blade rows", value: String(s.stages * 2), tone: "neutral", hint: "one rotor + one stator each" },
      {
        label: "Overall ratio",
        value: s.stages >= 7 ? "Approaching 30:1" : s.stages >= 5 ? "Mid range" : "Toward 15:1",
        tone: "go",
        hint: "axial compressors run 15:1 to 30:1",
      },
    ],
    chain: () => [
      { label: "Rotor: velocity and pressure", trend: "up" },
      { label: "Stator: velocity", trend: "down" },
      { label: "Stator: pressure", trend: "up" },
    ],
    note: () =>
      "One rotor plus one stator is a single stage. Stacking them is what buys the high overall compression ratio.",
  },

  BladeAoaWidget: {
    diagram: "eng-blade-aoa",
    controls: [
      { kind: "slider", key: "inletFlow", label: "Inlet airflow", min: 0.25, max: 1.4, step: 0.01, initial: 1, format: x, tone: "brand" },
      { kind: "slider", key: "rpm", label: "Compressor RPM", min: 0.4, max: 1.5, step: 0.01, initial: 1, format: x, tone: "caution" },
    ],
    toProps: (s) => ({ inletFlow: s.inletFlow, rpm: s.rpm }),
    readouts: (s) => {
      // Mirrors the geometry inside the diagram, so the two cannot disagree.
      const rwAngle = (Math.atan2(92 * s.rpm, 92 * s.inletFlow) * 180) / Math.PI;
      const aoa = rwAngle - 32;
      const stalled = aoa > 18;
      return [
        { label: "Blade AOA", value: deg(aoa), tone: stalled ? "nogo" : "neutral" },
        { label: "State", value: stalled ? "STALLED" : "Attached", tone: stalled ? "nogo" : "go" },
        { label: "If stalled", value: "RPM down, ITT up", tone: "caution", hint: "the indication pair" },
      ];
    },
    chain: (s) => {
      const rwAngle = (Math.atan2(92 * s.rpm, 92 * s.inletFlow) * 180) / Math.PI;
      return [
        { label: "Inlet airflow", trend: s.inletFlow < 1 ? "down" : s.inletFlow > 1 ? "up" : "same" },
        { label: "Compressor RPM", trend: s.rpm > 1 ? "up" : s.rpm < 1 ? "down" : "same" },
        { label: "Blade AOA", trend: rwAngle - 32 > 18 ? "up" : "same" },
      ];
    },
    note: () =>
      "Less inlet airflow or more RPM both swing the relative wind the same way, toward a stall.",
  },

  EngineStationStepper: {
    diagram: "eng-cutaway",
    controls: [
      {
        kind: "segmented",
        key: "station",
        label: "Station",
        initial: 0,
        options: [
          { value: 0, label: "Inlet" },
          { value: 1, label: "Compressor" },
          { value: 2, label: "Burner" },
          { value: 3, label: "Turbine" },
          { value: 4, label: "Exhaust" },
        ],
      },
    ],
    toProps: (s) => ({
      highlight: ["inlet", "compressor", "burner", "turbine", "exhaust"][s.station],
    }),
    readouts: (s) => {
      // Straight from slide 28, Thrust Development.
      const row = [
        { p: "Increases", t: "Unchanged", v: "Decreases" },
        { p: "Increases", t: "Increases", v: "Increases" },
        { p: "Slightly decreases", t: "Increases", v: "Increases" },
        { p: "Decreases", t: "Decreases", v: "Increases" },
        { p: "Decreases", t: "Decreases", v: "Increases" },
      ][s.station];
      return [
        { label: "Pressure", value: row.p, tone: row.p.startsWith("Increase") ? "go" : "nogo" },
        { label: "Temperature", value: row.t, tone: row.t.startsWith("Increase") ? "nogo" : "neutral" },
        { label: "Velocity", value: row.v, tone: row.v.startsWith("Increase") ? "go" : "nogo" },
      ];
    },
    note: (s) =>
      s.station === 2
        ? "Combustion is the one that surprises people: pressure drops slightly, because the heat goes into temperature and velocity."
        : "Step through all five and the gas path becomes one continuous story.",
  },

  TurbopropFlowStepper: {
    diagram: "eng-turboprop-flow",
    controls: [
      {
        kind: "segmented",
        key: "step",
        label: "Stage",
        initial: 0,
        options: [
          { value: 0, label: "Burn" },
          { value: 1, label: "Turbine" },
          { value: 2, label: "Shaft" },
          { value: 3, label: "RGB" },
          { value: 4, label: "Prop" },
        ],
      },
    ],
    toProps: (s) => ({
      highlight: ["combustion", "turbine", "shaft", "rgb", "prop"][s.step],
    }),
    readouts: (s) => {
      const rows: { label: string; value: string; tone: Tone }[] = [
        { label: "Combustion", value: "Heat energy released", tone: "nogo" },
        { label: "Turbine", value: "Extracts 75%", tone: "caution" },
        { label: "Shaft", value: "High RPM, low torque", tone: "neutral" },
        { label: "Reduction gear box", value: "Trades RPM for torque", tone: "brand" },
        { label: "Propeller", value: "90% of thrust", tone: "go" },
      ];
      return [rows[s.step]];
    },
    note: () =>
      "The gear box exists to keep propeller tips subsonic. Without it, efficiency collapses.",
  },

  HydraulicAdvantage: {
    diagram: "eng-hydraulic",
    controls: [
      { kind: "slider", key: "ratio", label: "Output area", min: 1, max: 6, step: 1, initial: 3, format: (v) => "x" + v },
    ],
    toProps: (s) => ({ ratio: s.ratio }),
    readouts: (s) => [
      { label: "Force", value: "x" + s.ratio, tone: "go" },
      { label: "Travel", value: "x" + (1 / s.ratio).toFixed(2), tone: "caution" },
      { label: "Pressure", value: "Constant", tone: "brand", hint: "Pascal's law" },
    ],
    note: () => "You buy force with distance. Pressure through the confined fluid never changes.",
  },
};

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

function initialState(spec: WidgetSpec): State {
  const s: State = {};
  for (const c of spec.controls) s[c.key] = c.initial;
  return s;
}

export function Widget({
  name,
  className,
  compact = false,
}: {
  name: string;
  className?: string;
  compact?: boolean;
}) {
  const spec = WIDGETS[name];
  const [state, setState] = useState<State>(() => (spec ? initialState(spec) : {}));

  const props = useMemo(() => (spec ? spec.toProps(state) : {}), [spec, state]);

  if (!spec) {
    return (
      <div className="rounded-xl border border-dashed border-nogo/40 bg-nogo-soft/50 p-6 text-center text-sm font-semibold text-nogo">
        Missing widget: {name}
      </div>
    );
  }

  const readouts = spec.readouts?.(state) ?? [];
  const chain = spec.chain?.(state);
  const note = spec.note?.(state);
  const set = (key: string, value: number) => setState((prev) => ({ ...prev, [key]: value }));

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("grid gap-4", spec.wide !== false && !compact && "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]")}>
        <div className="min-w-0 overflow-hidden rounded-2xl border border-line bg-surface p-3">
          <DiagramHost id={spec.diagram} props={props} />
        </div>

        <div className="min-w-0 space-y-3.5">
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            {spec.controls.map((c) => {
              if (c.kind === "slider") {
                return (
                  <Slider
                    key={c.key}
                    label={c.label}
                    value={state[c.key]}
                    min={c.min}
                    max={c.max}
                    step={c.step}
                    tone={c.tone}
                    hint={c.hint}
                    display={c.format(state[c.key])}
                    onChange={(v) => set(c.key, v)}
                  />
                );
              }
              if (c.kind === "toggle") {
                return (
                  <Toggle
                    key={c.key}
                    label={c.label}
                    value={state[c.key] === 1}
                    onLabel={c.onLabel}
                    offLabel={c.offLabel}
                    tone={c.tone}
                    onChange={(v) => set(c.key, v ? 1 : 0)}
                  />
                );
              }
              return (
                <Segmented
                  key={c.key}
                  label={c.label}
                  value={String(state[c.key])}
                  options={c.options.map((o) => ({ value: String(o.value), label: o.label }))}
                  onChange={(v) => set(c.key, Number(v))}
                />
              );
            })}
          </div>

          {readouts.length > 0 && (
            <div className={cn("grid gap-2", readouts.length > 2 ? "grid-cols-2" : "grid-cols-1")}>
              {readouts.map((r) => (
                <Readout key={r.label} label={r.label} value={r.value} tone={r.tone} hint={r.hint} />
              ))}
            </div>
          )}
        </div>
      </div>

      {chain && <ChainStrip nodes={chain} />}

      {note && (
        <p className="rounded-xl bg-brand-soft px-3.5 py-2.5 text-[12.5px] font-medium leading-relaxed text-brand">
          {note}
        </p>
      )}
    </div>
  );
}

export const WIDGET_NAMES = Object.keys(WIDGETS);
export function hasWidget(name: string): boolean {
  return name in WIDGETS;
}

