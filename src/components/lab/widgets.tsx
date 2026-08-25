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

  /* ---------------- Flight Rules ---------------- */
  BriefVoidWidget: {
    diagram: "frr-brief-void",
    controls: [
      { kind: "slider", key: "etd", label: "ETD after the brief", min: 0, max: 260, step: 5, initial: 120, format: (v) => `+${Math.round(v)} min` },
    ],
    toProps: (s) => ({ etd: s.etd }),
    readouts: (s) => {
      const etdClock = s.etd + 30;
      const wins = etdClock <= 180;
      return [
        { label: "Brief + 3 hours", value: "+180 min", tone: wins ? "neutral" : "nogo" },
        { label: "ETD + 30 min", value: `+${Math.round(etdClock)} min`, tone: wins ? "nogo" : "neutral" },
        { label: "Brief goes void at", value: `+${Math.round(Math.min(180, etdClock))} min`, tone: "caution" },
      ];
    },
    note: (s) =>
      s.etd + 30 <= 180
        ? "The ETD clock fires first — the brief dies 30 minutes after your planned departure."
        : "A late departure pushes the ETD clock past three hours, so the brief-time clock governs.",
  },

  SemicircularWidget: {
    diagram: "frr-semicircular",
    controls: [
      { kind: "slider", key: "course", label: "Magnetic course", min: 0, max: 359, step: 1, initial: 90, format: deg },
      { kind: "segmented", key: "rules", label: "Flight rules", initial: 0, options: [
        { value: 0, label: "VFR" },
        { value: 1, label: "IFR" },
      ] },
    ],
    toProps: (s) => ({ course: s.course, rules: s.rules === 1 ? "ifr" : "vfr" }),
    readouts: (s) => {
      const east = s.course < 180;
      const ifr = s.rules === 1;
      return [
        { label: "Hemisphere", value: east ? "East (0–179°)" : "West (180–359°)", tone: east ? "brand" : "violet" },
        { label: "Thousands", value: east ? "Odd" : "Even", tone: "neutral" },
        { label: "Add 500 ft?", value: ifr ? "No — IFR" : "Yes — VFR", tone: ifr ? "neutral" : "go" },
      ];
    },
    note: (s) =>
      s.course === 0 || s.course === 360
        ? "360° is 0°, which counts as EAST — a favourite exam trap."
        : "It is the magnetic COURSE that decides, never the heading.",
  },

  RunwayNumberWidget: {
    diagram: "frr-runway-numbering",
    controls: [
      { kind: "slider", key: "heading", label: "Magnetic heading", min: 0, max: 359, step: 1, initial: 93, format: deg },
    ],
    toProps: (s) => ({ heading: s.heading }),
    readouts: (s) => {
      const rounded = Math.round(s.heading / 10) * 10;
      const n = rounded === 0 ? 36 : rounded / 10;
      const r = ((rounded + 180) % 360) / 10;
      return [
        { label: "Rounded to", value: `${rounded === 0 ? 360 : rounded}°`, tone: "neutral" },
        { label: "Runway", value: String(n).padStart(2, "0"), tone: "brand" },
        { label: "Reciprocal end", value: String(r === 0 ? 36 : r).padStart(2, "0"), tone: "violet" },
      ];
    },
    note: () => "Round to the nearest ten, drop the last digit. The far end is always 18 away.",
  },

  VasiWidget: {
    diagram: "frr-vasi",
    controls: [
      { kind: "segmented", key: "state", label: "Where you are", initial: 1, options: [
        { value: 0, label: "Low" },
        { value: 1, label: "On" },
        { value: 2, label: "High" },
      ] },
    ],
    toProps: (s) => ({ state: ["low", "on", "high"][s.state] }),
    readouts: (s) => {
      const rows = [
        { bars: "Red over red", tone: "nogo" as const, act: "Climb" },
        { bars: "Red over white", tone: "go" as const, act: "Hold it" },
        { bars: "White over white", tone: "caution" as const, act: "Descend" },
      ][s.state];
      return [
        { label: "You see", value: rows.bars, tone: rows.tone },
        { label: "Action", value: rows.act, tone: rows.tone },
      ];
    },
    note: () => "Red over white, you're alright. Red over red, you're dead.",
  },

  AirspaceProfileWidget: {
    diagram: "frr-airspace-profile",
    controls: [
      { kind: "segmented", key: "cls", label: "Class", initial: 0, options: [
        { value: 0, label: "All" },
        { value: 1, label: "A" },
        { value: 2, label: "B" },
        { value: 3, label: "C" },
      ] },
    ],
    toProps: (s) => ({ highlight: ["none", "a", "b", "c"][s.cls] }),
    readouts: (s) =>
      [
        [{ label: "Controlled", value: "A, B, C, D, E", tone: "brand" as const }, { label: "Uncontrolled", value: "G", tone: "neutral" as const }],
        [{ label: "Floor", value: "18,000 MSL", tone: "nogo" as const }, { label: "Ceiling", value: "FL600", tone: "nogo" as const }, { label: "Rules", value: "IFR only", tone: "nogo" as const }],
        [{ label: "Typical", value: "SFC to 10,000 MSL", tone: "brand" as const }, { label: "Entry", value: "ATC clearance", tone: "caution" as const }],
        [{ label: "Typical", value: "SFC to 4,000 AGL", tone: "brand" as const }, { label: "Entry", value: "Two-way comms established", tone: "caution" as const }],
      ][s.cls],
    note: (s) =>
      s.cls === 2
        ? "Class B needs an actual CLEARANCE. Class C and D need only two-way communication established."
        : "A, B, C, D and E are controlled. Only G is not.",
  },

  OxygenWidget: {
    diagram: "frr-oxygen",
    controls: [
      { kind: "slider", key: "altitude", label: "Cabin altitude", min: 0, max: 16000, step: 250, initial: 9000, format: ft },
      { kind: "toggle", key: "equipped", label: "Oxygen system fitted", initial: 1, onLabel: "Fitted", offLabel: "None" },
    ],
    toProps: (s) => ({ altitude: s.altitude, equipped: s.equipped === 1 }),
    readouts: (s) => {
      const eq = s.equipped === 1;
      const ceiling = eq ? 13000 : 12000;
      const hours = eq ? "3 hours" : "1 hour";
      return [
        { label: "Oxygen required", value: s.altitude > 10000 ? "Yes" : "No", tone: s.altitude > 10000 ? "caution" : "go" },
        { label: "Time limit", value: s.altitude > 10000 ? hours : "—", tone: "neutral" },
        { label: "Ceiling", value: ft(ceiling), tone: s.altitude > ceiling ? "nogo" : "neutral" },
      ];
    },
    note: (s) =>
      s.altitude > (s.equipped === 1 ? 13000 : 12000)
        ? "Above this ceiling the flight is prohibited, not merely time-limited."
        : "10,000 ft cabin altitude is the trigger. What happens above it depends on the equipment fitted.",
  },

  /* ---------------- Weather ---------------- */
  LapseRateWidget: {
    diagram: "wx-lapse-rates",
    controls: [
      { kind: "slider", key: "altitude", label: "Altitude", min: 0, max: 20000, step: 500, initial: 0, format: ft },
    ],
    toProps: (s) => ({ altitude: s.altitude }),
    readouts: (s) => [
      { label: "Temperature", value: `${(15 - (s.altitude / 1000) * 2).toFixed(0)} °C`, tone: "nogo" },
      { label: "Pressure", value: `${(29.92 - s.altitude / 1000).toFixed(2)} inHg`, tone: "brand" },
      { label: "Temp lapse", value: "2 °C / 1,000 ft", tone: "neutral" },
      { label: "Pressure lapse", value: "1 inHg / 1,000 ft", tone: "neutral" },
    ],
    note: () => "Two variables, two lapse rates, two units. Both start from the standard sea level values.",
  },

  DewPointWidget: {
    diagram: "wx-dewpoint-spread",
    controls: [
      { kind: "slider", key: "spread", label: "Dew point spread", min: 0, max: 20, step: 1, initial: 10, format: (v) => `${Math.round(v)} °C` },
    ],
    toProps: (s) => ({ spread: s.spread }),
    readouts: (s) => [
      { label: "Temperature", value: "20 °C", tone: "nogo" },
      { label: "Dew point", value: `${(20 - s.spread).toFixed(0)} °C`, tone: "brand" },
      { label: "Condensation", value: s.spread <= 0.5 ? "Saturated" : s.spread < 6 ? "Increasing" : "Little", tone: s.spread < 6 ? "caution" : "neutral" },
    ],
    note: (s) =>
      s.spread <= 0.5
        ? "Spread zero means 100% relative humidity — the air cannot hold any more."
        : "The smaller the depression, the more moisture will condense.",
  },

  IcingWidget: {
    diagram: "wx-icing-ladder",
    controls: [
      { kind: "slider", key: "temp", label: "Free air temperature", min: -25, max: 5, step: 1, initial: -5, format: (v) => `${Math.round(v)} °C` },
    ],
    toProps: (s) => ({ temp: s.temp }),
    readouts: (s) => {
      const t = s.temp;
      const type =
        t > 0 ? "None" : t >= -10 ? "Clear" : t >= -20 ? "Rime" : "Below the bands";
      const mixed = t <= -8 && t >= -15;
      return [
        { label: "Primary type", value: type, tone: t > 0 ? "go" : t >= -10 ? "nogo" : "brand" },
        { label: "Mixed possible", value: mixed ? "Yes, −8 to −15" : "No", tone: mixed ? "caution" : "neutral" },
        { label: "Conditions", value: t >= -10 && t <= 0 ? "Unstable" : t < -10 && t >= -20 ? "Stable" : "—", tone: "neutral" },
      ];
    },
    note: (s) =>
      s.temp < -20
        ? "Colder than −20 °C is where you climb to in order to escape icing."
        : "The mixed band overlaps both clear and rime — it is not a gap between them.",
  },

  StationModelWidget: {
    diagram: "wx-station-model",
    controls: [
      { kind: "slider", key: "knots", label: "Wind speed", min: 0, max: 95, step: 5, initial: 25, format: kt },
    ],
    toProps: (s) => ({ knots: s.knots }),
    readouts: (s) => {
      let left = Math.round(s.knots / 5) * 5;
      const flags = Math.floor(left / 50);
      left -= flags * 50;
      const fulls = Math.floor(left / 10);
      left -= fulls * 10;
      return [
        { label: "Flags (50 kt)", value: String(flags), tone: "nogo" },
        { label: "Full lines (10 kt)", value: String(fulls), tone: "brand" },
        { label: "Half lines (5 kt)", value: String(Math.floor(left / 5)), tone: "caution" },
      ];
    },
    note: () => "Build the barb from 50s first, then 10s, then a single 5.",
  },

  PressureFieldWidget: {
    diagram: "wx-pressure-field",
    controls: [
      { kind: "segmented", key: "level", label: "Altitude band", initial: 2, options: [
        { value: 0, label: "Gradient" },
        { value: 1, label: "Surface" },
        { value: 2, label: "Both" },
      ] },
    ],
    toProps: (s) => ({ level: ["gradient", "surface", "both"][s.level] }),
    readouts: (s) => [
      { label: "Band", value: ["Above 2,000 AGL", "Below 2,000 AGL", "Both"][s.level], tone: "brand" },
      { label: "Around a LOW", value: "Counter-clockwise", tone: "nogo" },
      { label: "Around a HIGH", value: "Clockwise", tone: "brand" },
      { label: "Friction", value: s.level === 0 ? "Negligible" : "Turns the wind", tone: "caution" },
    ],
    note: () => "2,000 ft AGL is the dividing line. Below it, friction turns the wind across the isobars.",
  },

  StabilityWidget: {
    diagram: "wx-stability",
    controls: [
      { kind: "segmented", key: "state", label: "Parcel vs surroundings", initial: 0, options: [
        { value: 0, label: "Colder" },
        { value: 1, label: "Same" },
        { value: 2, label: "Hotter" },
      ] },
    ],
    toProps: (s) => ({ state: ["stable", "neutral", "unstable"][s.state] }),
    readouts: (s) => [
      { label: "Classification", value: ["Stable", "Neutral", "Unstable"][s.state], tone: (["brand", "neutral", "nogo"] as const)[s.state] },
      { label: "What it does", value: ["Sinks back", "Stays put", "Keeps rising"][s.state], tone: "neutral" },
      { label: "Air mass", value: ["Warm mass", "—", "Cold mass"][s.state], tone: "neutral" },
    ],
    note: () => "Stability is always relative to the surrounding air, never to an absolute temperature.",
  },

  /* ================================================================ */
  /* ENGINES — tracing the machine                                     */
  /*                                                                   */
  /* Engines is a course about a sequence of events in a fixed order,  */
  /* and it had five manipulate screens across thirty lessons. These   */
  /* put the student's hand on the part of the machine being taught:   */
  /* pick a station, a subsystem or a failure and watch what changes.  */
  /* ================================================================ */

  FuelPathTracer: {
    diagram: "eng-fuel-system",
    controls: [
      {
        kind: "segmented",
        key: "stage",
        label: "Follow the fuel",
        initial: 0,
        options: [
          { value: 0, label: "Tank" },
          { value: 1, label: "Boost" },
          { value: 2, label: "Pump" },
          { value: 3, label: "FCU" },
          { value: 4, label: "Nozzle" },
        ],
      },
    ],
    toProps: (s) => ({ highlight: ["tank", "boost", "pump", "fcu", "nozzle"][s.stage] }),
    readouts: (s) =>
      [
        [{ label: "Job", value: "Stores the fuel", tone: "neutral" as const }],
        [
          { label: "Job", value: "Raises pressure to feed the engine pump", tone: "brand" as const },
          { label: "If it fails", value: "The engine pump cavitates", tone: "nogo" as const },
        ],
        [
          { label: "Job", value: "Engine-driven, delivers high pressure", tone: "brand" as const },
          { label: "Driven by", value: "The engine itself", tone: "neutral" as const },
        ],
        [
          { label: "Job", value: "Meters fuel — the brain of the system", tone: "go" as const },
          { label: "Senses", value: "CIT, RPM, ITT and PCL", tone: "neutral" as const },
          { label: "If it fails", value: "Over-fuelling, then compressor stall", tone: "nogo" as const },
        ],
        [{ label: "Job", value: "Atomises fuel into the burner", tone: "brand" as const }],
      ][s.stage],
    note: (s) =>
      s.stage === 3
        ? "The FCU is the one component that DECIDES. Everything upstream just moves fuel; the FCU chooses how much."
        : "Follow the path once and the failure questions stop being memory: each component can only break in the way its job allows.",
  },

  OilSubsystemPicker: {
    diagram: "eng-oil-system",
    controls: [
      {
        kind: "segmented",
        key: "sub",
        label: "Subsystem",
        initial: 0,
        options: [
          { value: 0, label: "Pressure" },
          { value: 1, label: "Scavenge" },
          { value: 2, label: "Breather" },
        ],
      },
    ],
    toProps: (s) => ({ subsystem: ["pressure", "scavenge", "breather"][s.sub] }),
    readouts: (s) =>
      [
        [
          { label: "Direction", value: "Oil out to the engine", tone: "brand" as const },
          { label: "Carries", value: "Tank, pump, filter, relief valve", tone: "neutral" as const },
        ],
        [
          { label: "Direction", value: "Oil back from the sumps", tone: "caution" as const },
          { label: "Capacity", value: "GREATER than the pressure side", tone: "go" as const, hint: "returning oil is aerated" },
          { label: "Watches for", value: "Chip detector — metal particles", tone: "nogo" as const },
        ],
        [
          { label: "Direction", value: "Bleed air into the sumps", tone: "go" as const },
          { label: "Why", value: "Pressurises sumps to hold the spray pattern", tone: "neutral" as const },
        ],
      ][s.sub],
    note: (s) =>
      s.sub === 1
        ? "Scavenge has greater capacity than pressure on purpose: returning oil is frothy, so the same mass of oil takes up more volume."
        : "Three subsystems, three directions. Out, back, and the air that makes the other two work.",
  },

  StartSequenceStepper: {
    diagram: "eng-start-sequence",
    controls: [
      {
        kind: "segmented",
        key: "stage",
        label: "Start stage",
        initial: 0,
        options: [
          { value: 0, label: "Starter" },
          { value: 1, label: "Fuel" },
          { value: 2, label: "Ignition" },
          { value: 3, label: "Idle" },
        ],
      },
    ],
    toProps: (s) => ({ stage: ["starter", "fuel", "ignition", "idle"][s.stage] }),
    readouts: (s) =>
      [
        [
          { label: "Happening", value: "Starter accelerates the compressor", tone: "brand" as const },
          { label: "Fuel", value: "None yet", tone: "neutral" as const },
        ],
        [
          { label: "The gate", value: "30% RPM", tone: "caution" as const, hint: "a limit, not a preference" },
          { label: "Why wait", value: "Enough airflow to burn it cleanly", tone: "neutral" as const },
        ],
        [
          { label: "Happening", value: "Igniters fire, combustion begins", tone: "nogo" as const },
          { label: "Watch", value: "ITT — a hot start starts here", tone: "nogo" as const },
        ],
        [
          { label: "Happening", value: "Self-accelerating speed reached", tone: "go" as const },
          { label: "Starter", value: "Drops out", tone: "neutral" as const },
        ],
      ][s.stage],
    chain: () => [
      { label: "Air", trend: "up" },
      { label: "Fuel", trend: "up" },
      { label: "Light", trend: "up" },
    ],
    note: (s) =>
      s.stage === 1
        ? "Fuel before 30% RPM is the classic hot start: fuel arrives faster than the air needed to burn it, and ITT runs away."
        : "Air first, then fuel, then light. The order is a limit, not a habit.",
  },

  BusPicker: {
    diagram: "eng-electrical",
    controls: [
      {
        kind: "segmented",
        key: "bus",
        label: "Which bus",
        initial: 0,
        options: [
          { value: 0, label: "Essential" },
          { value: 1, label: "Primary" },
          { value: 2, label: "Monitor" },
          { value: 3, label: "Starter" },
        ],
      },
    ],
    toProps: (s) => ({ highlight: ["essential", "primary", "monitor", "starter"][s.bus] }),
    readouts: (s) =>
      [
        [
          { label: "Feeds", value: "Equipment required for FLIGHT SAFETY", tone: "nogo" as const },
          { label: "Shed it", value: "Never — this is the last one standing", tone: "nogo" as const },
        ],
        [
          { label: "Feeds", value: "Equipment for the aircraft MISSION", tone: "brand" as const },
          { label: "Shed it", value: "Lose the mission, keep the aircraft", tone: "caution" as const },
        ],
        [
          { label: "Feeds", value: "Convenience circuits, such as cabin lighting", tone: "neutral" as const },
          { label: "Shed it", value: "First to go", tone: "go" as const },
        ],
        [
          { label: "Feeds", value: "The engine start circuit", tone: "caution" as const },
          { label: "Shed it", value: "Irrelevant once airborne", tone: "go" as const },
        ],
      ][s.bus],
    note: () =>
      "Buses group equipment by how much flight safety depends on it — which is also the order you shed them in.",
  },

  StallGaugeToggle: {
    diagram: "eng-stall-indications",
    controls: [
      {
        kind: "toggle",
        key: "stalled",
        label: "Compressor stalled",
        initial: 0,
        onLabel: "Stalled",
        offLabel: "Normal",
        tone: "nogo",
      },
    ],
    toProps: (s) => ({ stalled: s.stalled === 1 }),
    readouts: (s) =>
      s.stalled === 1
        ? [
            { label: "RPM", value: "DECREASING", tone: "nogo" as const, hint: "the compressor has stopped pumping" },
            { label: "ITT", value: "INCREASING", tone: "nogo" as const, hint: "unburnt energy has nowhere to go" },
            { label: "Sound", value: "Loud bangs, changed note", tone: "caution" as const },
          ]
        : [
            { label: "RPM", value: "Steady", tone: "go" as const },
            { label: "ITT", value: "Steady", tone: "go" as const },
            { label: "Sound", value: "Normal", tone: "go" as const },
          ],
    chain: (s) =>
      s.stalled === 1
        ? [
            { label: "Airflow breaks down", trend: "down" },
            { label: "RPM", trend: "down" },
            { label: "ITT", trend: "up" },
          ]
        : [{ label: "Airflow steady", trend: "same" }],
    note: () =>
      "The two needles move in OPPOSITE directions. That divergence is the whole diagnosis — RPM down, ITT up.",
  },

  /* ================================================================ */
  /* FLIGHT RULES — which rule applies, and when it flips              */
  /*                                                                   */
  /* A regulation read as prose is a paragraph. The same regulation    */
  /* with its conditions on a control becomes a decision the student   */
  /* makes and gets feedback on, which is the demand the exam makes.   */
  /* ================================================================ */

  PriorityPicker: {
    diagram: "frr-priority",
    controls: [
      {
        kind: "segmented",
        key: "doc",
        label: "Which document",
        initial: 0,
        options: [
          { value: 0, label: "NATOPS" },
          { value: 1, label: "CNAF" },
          { value: 2, label: "FLIP" },
          { value: 3, label: "FAR" },
        ],
      },
    ],
    toProps: (s) => ({ highlight: ["natops", "cnaf", "flip", "far"][s.doc] }),
    readouts: (s) =>
      [
        [
          { label: "Scope", value: "This aircraft model", tone: "nogo" as const },
          { label: "Beats", value: "Everything else", tone: "go" as const },
        ],
        [
          { label: "Scope", value: "All naval aircraft, worldwide", tone: "caution" as const },
          { label: "Beats", value: "FLIP and the FAR", tone: "go" as const },
          { label: "Loses to", value: "Aircraft NATOPS", tone: "nogo" as const },
        ],
        [
          { label: "Scope", value: "DOD, all branches", tone: "brand" as const },
          { label: "Carries", value: "Charts and plates, not rules", tone: "neutral" as const },
        ],
        [
          { label: "Scope", value: "Military and civil", tone: "neutral" as const },
          { label: "Loses to", value: "Everything above it", tone: "nogo" as const },
        ],
      ][s.doc],
    note: (s) =>
      s.doc === 0
        ? "The most specific document wins. The manual written for THIS aircraft knows something the fleet-wide one cannot."
        : "Specific beats general, all the way down. And where two of them speak, the tighter rule governs.",
  },

  AtcOrgPicker: {
    diagram: "frr-atc-org",
    controls: [
      {
        kind: "segmented",
        key: "agency",
        label: "Who owns this traffic",
        initial: 0,
        options: [
          { value: 0, label: "FSS" },
          { value: 1, label: "Tower" },
          { value: 2, label: "Approach" },
          { value: 3, label: "ARTCC" },
        ],
      },
    ],
    toProps: (s) => ({ highlight: ["fss", "tower", "approach", "artcc"][s.agency] }),
    readouts: (s) =>
      [
        [
          { label: "Owns", value: "Briefings, flight plans, SAR", tone: "go" as const },
          { label: "Clears you", value: "No — it files, it does not clear", tone: "nogo" as const },
        ],
        [
          { label: "Owns", value: "Traffic AT and AROUND the field", tone: "brand" as const },
          { label: "Includes", value: "Ground movement as well as air", tone: "neutral" as const },
        ],
        [
          { label: "Owns", value: "Terminal INSTRUMENT traffic", tone: "caution" as const },
          { label: "Also called", value: "TRACON, Departure Control", tone: "neutral" as const },
        ],
        [
          { label: "Owns", value: "En route IFR traffic", tone: "nogo" as const },
          { label: "Hands off to", value: "Approach, then Tower", tone: "neutral" as const },
        ],
      ][s.agency],
    note: () =>
      "Walk it inbound: ARTCC en route, Approach in the terminal area, Tower at the field. The FSS sits outside that chain entirely.",
  },

  RightOfWayPicker: {
    diagram: "frr-right-of-way",
    controls: [
      {
        kind: "segmented",
        key: "scenario",
        label: "The situation",
        initial: 0,
        options: [
          { value: 0, label: "Head-on" },
          { value: 1, label: "Converging" },
          { value: 2, label: "Overtaking" },
          { value: 3, label: "Landing" },
        ],
      },
    ],
    toProps: (s) => ({
      scenario: ["headon", "converging", "overtaking", "landing"][s.scenario],
    }),
    readouts: (s) =>
      [
        [
          { label: "Action", value: "BOTH alter course to the RIGHT", tone: "nogo" as const },
          { label: "The trap", value: "Neither aircraft has right of way", tone: "caution" as const },
        ],
        [
          { label: "Right of way", value: "The aircraft on the RIGHT", tone: "go" as const },
          { label: "Applies", value: "At approximately the same altitude", tone: "neutral" as const },
        ],
        [
          { label: "Right of way", value: "The aircraft being OVERTAKEN", tone: "go" as const },
          { label: "Action", value: "The overtaker alters to the right", tone: "brand" as const },
        ],
        [
          { label: "Right of way", value: "The lower aircraft on final", tone: "go" as const },
          { label: "The trap", value: "It is not a licence to cut in front", tone: "caution" as const },
        ],
      ][s.scenario],
    note: (s) =>
      s.scenario === 0
        ? "Head-on is the one where nobody wins. Both turn right — an answer that names a winner is wrong by construction."
        : "Work out who is obliged to move before working out what you would do. The rule names one aircraft.",
  },

  AltitudeRulePicker: {
    diagram: "frr-altitude",
    controls: [
      {
        kind: "segmented",
        key: "setting",
        label: "What is below you",
        initial: 0,
        options: [
          { value: 0, label: "Congested area" },
          { value: 1, label: "Open country" },
        ],
      },
    ],
    toProps: (s) => ({ setting: ["congested", "other"][s.setting] }),
    readouts: (s) =>
      s.setting === 0
        ? [
            { label: "Minimum", value: "1,000 ft above the highest obstacle", tone: "nogo" as const },
            { label: "Within", value: "A 2,000 ft horizontal radius", tone: "caution" as const },
            { label: "Measured from", value: "The OBSTACLE top, not the ground", tone: "brand" as const },
          ]
        : [
            { label: "Minimum", value: "500 ft above the surface", tone: "caution" as const },
            { label: "Near people or structures", value: "500 ft clearance from them", tone: "brand" as const },
          ],
    note: (s) =>
      s.setting === 0
        ? "Both halves bite: the 1,000 ft is measured from the top of the tallest obstacle inside the 2,000 ft circle, not from the terrain."
        : "Away from a congested area the number drops, but the obligation to stay clear of people and structures does not.",
  },

  /* ================================================================ */
  /* WEATHER — watching the system change                              */
  /*                                                                   */
  /* Weather is the one subject where the thing being taught MOVES.    */
  /* A cross-section of a cold front is a picture; the same section    */
  /* with a control that switches it to a warm front is the lesson.    */
  /* ================================================================ */

  FrontTypePicker: {
    diagram: "wx-front",
    controls: [
      {
        kind: "segmented",
        key: "kind",
        label: "Front type",
        initial: 0,
        options: [
          { value: 0, label: "Cold" },
          { value: 1, label: "Warm" },
          { value: 2, label: "Stationary" },
          { value: 3, label: "Occluded" },
        ],
      },
    ],
    toProps: (s) => ({ kind: ["cold", "warm", "stationary", "occluded"][s.kind] }),
    readouts: (s) =>
      [
        [
          { label: "Slope", value: "Steep", tone: "nogo" as const },
          { label: "Speed", value: "Fast", tone: "nogo" as const },
          { label: "Weather", value: "Narrow band, violent, cumuliform", tone: "nogo" as const },
          { label: "Turbulence", value: "Significant", tone: "nogo" as const },
        ],
        [
          { label: "Slope", value: "Shallow", tone: "brand" as const },
          { label: "Speed", value: "Slow", tone: "brand" as const },
          { label: "Weather", value: "Wide band, steady, stratiform", tone: "caution" as const },
          { label: "Turbulence", value: "Little or none", tone: "go" as const },
        ],
        [
          { label: "Movement", value: "Neither mass displaces the other", tone: "neutral" as const },
          { label: "Weather", value: "Like a warm front — and it lingers", tone: "caution" as const },
          { label: "Duration", value: "Days over one area", tone: "caution" as const },
        ],
        [
          { label: "Formed by", value: "A cold front overtaking a warm one", tone: "brand" as const },
          { label: "Weather", value: "Both types at once", tone: "nogo" as const },
        ],
      ][s.kind],
    note: (s) =>
      s.kind === 0
        ? "Steep and fast is the whole story: the air is forced up violently over a short distance, so the weather is narrow and rough."
        : "Slope sets the weather. Steep lifting gives cumuliform cloud and turbulence; shallow lifting gives stratiform cloud and steady rain.",
  },

  MicroburstStepper: {
    diagram: "wx-microburst",
    controls: [
      {
        kind: "segmented",
        key: "stage",
        label: "Where you are in it",
        initial: 0,
        options: [
          { value: 0, label: "Approaching" },
          { value: 1, label: "Headwind" },
          { value: 2, label: "Downdraft" },
          { value: 3, label: "Tailwind" },
        ],
      },
    ],
    toProps: (s) => ({
      stage: ["approach", "headwind", "downdraft", "tailwind"][s.stage],
    }),
    readouts: (s) =>
      [
        [{ label: "Indications", value: "Nothing yet", tone: "neutral" as const }],
        [
          { label: "Airspeed", value: "INCREASES", tone: "go" as const, hint: "the reassuring part" },
          { label: "Tendency", value: "Balloons above the glidepath", tone: "caution" as const },
          { label: "Instinct", value: "Reduce power — and that is the trap", tone: "nogo" as const },
        ],
        [
          { label: "Vertical", value: "Strong downdraft", tone: "nogo" as const },
          { label: "Altitude", value: "Falling fast", tone: "nogo" as const },
        ],
        [
          { label: "Airspeed", value: "DROPS sharply", tone: "nogo" as const },
          { label: "Altitude", value: "Already low, still sinking", tone: "nogo" as const },
          { label: "Power available", value: "Whatever you did not give away", tone: "nogo" as const },
        ],
      ][s.stage],
    chain: () => [
      { label: "Headwind", trend: "up" },
      { label: "Downdraft", trend: "down" },
      { label: "Tailwind", trend: "down" },
    ],
    note: (s) =>
      s.stage === 1
        ? "Step through to the end before deciding what to do here. The performance increase at entry is borrowed, and the tailwind takes it back with interest."
        : "Three phases in sequence, and the first one feels good. That is exactly why it kills.",
  },

  AltitudeTypePicker: {
    diagram: "wx-altitude-types",
    controls: [
      {
        kind: "segmented",
        key: "kind",
        label: "Which altitude",
        initial: 0,
        options: [
          { value: 0, label: "True" },
          { value: 1, label: "Absolute" },
          { value: 2, label: "Pressure" },
        ],
      },
    ],
    toProps: (s) => ({ highlight: ["true", "absolute", "pressure"][s.kind] }),
    readouts: (s) =>
      [
        [
          { label: "Measured from", value: "Mean sea level", tone: "brand" as const },
          { label: "Used for", value: "Terrain and obstacles — charted in MSL", tone: "go" as const },
        ],
        [
          { label: "Measured from", value: "The terrain directly below", tone: "caution" as const },
          { label: "Changes", value: "As the ground rises beneath you", tone: "caution" as const },
        ],
        [
          { label: "Measured from", value: "The standard datum plane", tone: "nogo" as const },
          { label: "Set", value: "29.92 in the Kollsman window", tone: "neutral" as const },
          { label: "Used for", value: "Separation in Class A", tone: "go" as const },
        ],
      ][s.kind],
    note: () =>
      "Three references, three different numbers for the same aeroplane. Which one is right depends entirely on what you are trying not to hit.",
  },

  AltimeterConditionPicker: {
    diagram: "wx-altimeter-error",
    controls: [
      {
        kind: "segmented",
        key: "condition",
        label: "The air you flew into",
        initial: 0,
        options: [
          { value: 0, label: "Standard" },
          { value: 1, label: "Colder" },
          { value: 2, label: "Warmer" },
        ],
      },
    ],
    toProps: (s) => ({ condition: ["standard", "cold", "hot"][s.condition] }),
    readouts: (s) =>
      [
        [
          { label: "Indicated vs true", value: "They agree", tone: "go" as const },
          { label: "Terrain margin", value: "As planned", tone: "go" as const },
        ],
        [
          { label: "Indicated vs true", value: "Altimeter reads HIGH", tone: "nogo" as const },
          { label: "You are", value: "LOWER than indicated", tone: "nogo" as const },
          { label: "The saying", value: "High to low, look out below", tone: "caution" as const },
        ],
        [
          { label: "Indicated vs true", value: "Altimeter reads LOW", tone: "caution" as const },
          { label: "You are", value: "HIGHER than indicated", tone: "go" as const },
          { label: "The saying", value: "Low to high, plenty of sky", tone: "go" as const },
        ],
      ][s.condition],
    note: (s) =>
      s.condition === 1
        ? "Cold air is dense, so the pressure levels sit lower than standard — and the aircraft sits down with them, below what the needle claims."
        : "Only one of these two directions is dangerous. Learn which, and the saying takes care of the rest.",
  },

  LiftingMethodPicker: {
    diagram: "wx-lifting",
    controls: [
      {
        kind: "segmented",
        key: "method",
        label: "What lifts the air",
        initial: 0,
        options: [
          { value: 0, label: "Orographic" },
          { value: 1, label: "Frontal" },
          { value: 2, label: "Convergence" },
          { value: 3, label: "Thermal" },
        ],
      },
    ],
    toProps: (s) => ({
      method: ["orographic", "frontal", "convergence", "thermal"][s.method],
    }),
    readouts: (s) =>
      [
        [
          { label: "Lifted by", value: "Terrain", tone: "brand" as const },
          { label: "Windward side", value: "Cloud and precipitation", tone: "caution" as const },
          { label: "Lee side", value: "Descending air, mountain wave", tone: "nogo" as const },
        ],
        [
          { label: "Lifted by", value: "One air mass riding over another", tone: "brand" as const },
          { label: "Steepness", value: "Decides whether it is rough or steady", tone: "caution" as const },
        ],
        [
          { label: "Lifted by", value: "Air flowing into the same place", tone: "brand" as const },
          { label: "Nowhere to go", value: "But up", tone: "neutral" as const },
        ],
        [
          { label: "Lifted by", value: "Heating from the surface below", tone: "brand" as const },
          { label: "Strongest over", value: "Dry ground", tone: "nogo" as const },
        ],
      ][s.method],
    note: () =>
      "Four ways to get air to rise, one consequence: rising air cools, and cooling air condenses. The method decides where, and how rough.",
  },

  StormAvoidancePicker: {
    diagram: "wx-storm-avoidance",
    controls: [
      {
        kind: "segmented",
        key: "option",
        label: "Your choice",
        initial: 0,
        options: [
          { value: 0, label: "Circumnavigate" },
          { value: 1, label: "Over" },
          { value: 2, label: "Under" },
          { value: 3, label: "Through" },
        ],
      },
    ],
    toProps: (s) => ({
      option: ["circumnavigate", "over", "under", "through"][s.option],
    }),
    readouts: (s) =>
      [
        [
          { label: "Priority", value: "FIRST choice, always", tone: "go" as const },
          { label: "Cost", value: "Track miles and fuel", tone: "neutral" as const },
        ],
        [
          { label: "Priority", value: "Second", tone: "caution" as const },
          { label: "Cost", value: "1,000 ft per 10 kt of wind at the top", tone: "nogo" as const },
          { label: "In practice", value: "Rarely achievable", tone: "nogo" as const },
        ],
        [
          { label: "Priority", value: "Third", tone: "nogo" as const },
          { label: "Underneath", value: "Microburst, hail, extreme turbulence", tone: "nogo" as const },
        ],
        [
          { label: "Priority", value: "LAST", tone: "nogo" as const },
          { label: "Why last", value: "The only option inside the hazards", tone: "nogo" as const },
        ],
      ][s.option],
    note: () =>
      "COUT is a priority order, not a menu. Each step down trades distance for exposure, and the last one has no distance left to trade.",
  },

  SeaLandBreezePhase: {
    diagram: "wx-sea-land-breeze",
    controls: [
      {
        kind: "segmented",
        key: "phase",
        label: "Time of day",
        initial: 0,
        options: [
          { value: 0, label: "Day" },
          { value: 1, label: "Night" },
        ],
      },
    ],
    toProps: (s) => ({ phase: ["day", "night"][s.phase] }),
    readouts: (s) =>
      s.phase === 0
        ? [
            { label: "Land", value: "Heats faster than the water", tone: "nogo" as const },
            { label: "Air over the land", value: "Rises", tone: "caution" as const },
            { label: "Surface wind", value: "SEA breeze — sea to land", tone: "brand" as const },
          ]
        : [
            { label: "Land", value: "Cools faster than the water", tone: "brand" as const },
            { label: "Air over the water", value: "Rises", tone: "caution" as const },
            { label: "Surface wind", value: "LAND breeze — land to sea", tone: "brand" as const },
          ],
    note: () =>
      "Both breezes are named for where the air comes FROM. Work out which surface is warmer, put the rising air over it, and the direction falls out.",
  },

  StationChangePicker: {
    diagram: "eng-station-changes",
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
      const row = [
        { p: "Increases", t: "Unchanged", v: "Decreases" },
        { p: "Increases", t: "Increases", v: "Increases" },
        { p: "Slightly decreases", t: "Increases", v: "Increases" },
        { p: "Decreases", t: "Decreases", v: "Increases" },
        { p: "Decreases", t: "Decreases", v: "Increases" },
      ][s.station];
      const tone = (v: string): Tone =>
        v.startsWith("Increase") ? "go" : v.startsWith("Decrease") || v.startsWith("Slightly") ? "nogo" : "neutral";
      return [
        { label: "Pressure", value: row.p, tone: tone(row.p) },
        { label: "Temperature", value: row.t, tone: tone(row.t) },
        { label: "Velocity", value: row.v, tone: tone(row.v) },
      ];
    },
    note: (s) =>
      s.station === 2
        ? "The burner is the odd one out: pressure drops SLIGHTLY here even though this is where the energy is added."
        : "Three quantities, five stations. Learn the pattern by stepping it, not by memorising a grid.",
  },

  EngineTypePicker: {
    diagram: "eng-type-split",
    controls: [
      {
        kind: "segmented",
        key: "type",
        label: "Engine type",
        initial: 0,
        options: [
          { value: 0, label: "Turbojet" },
          { value: 1, label: "Turbofan" },
          { value: 2, label: "Turboprop" },
          { value: 3, label: "Turboshaft" },
        ],
      },
    ],
    toProps: (s) => ({
      type: ["turbojet", "turbofan", "turboprop", "turboshaft"][s.type],
    }),
    readouts: (s) =>
      [
        [
          { label: "Thrust from", value: "The exhaust jet, all of it", tone: "nogo" as const },
          { label: "Best at", value: "High speed, high altitude", tone: "brand" as const },
          { label: "TSFC", value: "Highest of the four", tone: "nogo" as const },
        ],
        [
          { label: "Thrust from", value: "40–70% gas generator, 30–60% fan", tone: "brand" as const },
          { label: "Bypass ratio", value: "High for transports, low for fighters", tone: "caution" as const },
          { label: "TSFC", value: "Lower than a turbojet", tone: "go" as const },
        ],
        [
          { label: "Thrust from", value: "The propeller — about 90%", tone: "go" as const },
          { label: "Needs", value: "A reduction gear box", tone: "caution" as const },
          { label: "Best at", value: "Lower speed and altitude", tone: "brand" as const },
        ],
        [
          { label: "Output", value: "Shaft power, not thrust", tone: "brand" as const },
          { label: "Drives", value: "A rotor rather than a propeller", tone: "neutral" as const },
        ],
      ][s.type],
    note: () =>
      "One gas generator, four ways to spend its energy. Where the thrust comes from is what separates them.",
  },

  CyclePicker: {
    diagram: "eng-cycles",
    controls: [
      {
        kind: "segmented",
        key: "cycle",
        label: "Show",
        initial: 2,
        options: [
          { value: 0, label: "Brayton" },
          { value: 1, label: "Otto" },
          { value: 2, label: "Both" },
        ],
      },
    ],
    toProps: (s) => ({ cycle: ["brayton", "otto", "both"][s.cycle] }),
    readouts: (s) =>
      [
        [
          { label: "Events", value: "Intake, compression, combustion, exhaust", tone: "brand" as const },
          { label: "Timing", value: "SIMULTANEOUS and continuous", tone: "go" as const },
        ],
        [
          { label: "Events", value: "Intake, compression, combustion, exhaust", tone: "brand" as const },
          { label: "Timing", value: "SEQUENTIAL, one cylinder at a time", tone: "caution" as const },
        ],
        [
          { label: "Same", value: "All four events, in the same order", tone: "brand" as const },
          { label: "Different", value: "Only WHEN they happen", tone: "nogo" as const },
        ],
      ][s.cycle],
    note: () =>
      "Put them side by side and the exam question answers itself: the events are identical, the timing is not.",
  },

  CloudClearancePicker: {
    diagram: "frr-cloud-clearance",
    controls: [
      {
        kind: "segmented",
        key: "preset",
        label: "Where you are",
        initial: 0,
        options: [
          { value: 0, label: "Standard" },
          { value: 1, label: "Above 10,000" },
          { value: 2, label: "Class B" },
        ],
      },
    ],
    toProps: (s) => ({ preset: ["standard", "high", "classb"][s.preset] }),
    readouts: (s) =>
      [
        [
          { label: "Above cloud", value: "1,000 ft", tone: "brand" as const },
          { label: "Below cloud", value: "500 ft", tone: "brand" as const },
          { label: "Horizontally", value: "2,000 ft", tone: "brand" as const },
          { label: "Visibility", value: "3 SM", tone: "caution" as const },
        ],
        [
          { label: "Above cloud", value: "1,000 ft", tone: "brand" as const },
          { label: "Below cloud", value: "1,000 ft", tone: "nogo" as const, hint: "doubled" },
          { label: "Horizontally", value: "1 SM", tone: "nogo" as const },
          { label: "Visibility", value: "5 SM", tone: "nogo" as const },
        ],
        [
          { label: "Clearance", value: "Clear of clouds", tone: "go" as const },
          { label: "Visibility", value: "3 SM", tone: "caution" as const },
          { label: "Why so loose", value: "Everyone here is talking to ATC", tone: "neutral" as const },
        ],
      ][s.preset],
    note: (s) =>
      s.preset === 2
        ? "Class B is the exception that looks like a mistake: clear of clouds is LESS demanding, because separation is being provided for you."
        : "The numbers tighten with altitude because closing speeds rise. Above 10,000 ft everything grows except the horizontal, which switches units.",
  },

  PositionLightView: {
    diagram: "frr-position-lights",
    controls: [
      {
        kind: "segmented",
        key: "view",
        label: "You are looking at it from",
        initial: 0,
        options: [
          { value: 0, label: "Head-on" },
          { value: 1, label: "Behind" },
          { value: 2, label: "Its left" },
          { value: 3, label: "Its right" },
        ],
      },
    ],
    toProps: (s) => ({ view: ["headon", "tail", "left", "right"][s.view] }),
    readouts: (s) =>
      [
        [
          { label: "You see", value: "Red AND green", tone: "nogo" as const },
          { label: "Means", value: "It is pointing at you", tone: "nogo" as const },
        ],
        [
          { label: "You see", value: "White only", tone: "go" as const },
          { label: "Means", value: "You are overtaking it", tone: "caution" as const },
        ],
        [
          { label: "You see", value: "Red", tone: "caution" as const },
          { label: "Means", value: "It is crossing right to left", tone: "neutral" as const },
        ],
        [
          { label: "You see", value: "Green", tone: "go" as const },
          { label: "Means", value: "It is crossing left to right", tone: "neutral" as const },
        ],
      ][s.view],
    note: (s) =>
      s.view === 0
        ? "Both colours at once is the one that matters: red and green together means you are looking down its nose."
        : "The lights are not decoration — they are a geometry readout. What you can see tells you where it is going.",
  },

  AtmosphereLayerPicker: {
    diagram: "wx-atmosphere",
    controls: [
      {
        kind: "segmented",
        key: "layer",
        label: "Layer",
        initial: 0,
        options: [
          { value: 0, label: "Troposphere" },
          { value: 1, label: "Tropopause" },
          { value: 2, label: "Stratosphere" },
        ],
      },
    ],
    toProps: (s) => ({
      highlight: ["troposphere", "tropopause", "stratosphere"][s.layer],
    }),
    readouts: (s) =>
      [
        [
          { label: "Contains", value: "Nearly all the weather", tone: "nogo" as const },
          { label: "Going up", value: "Colder, and windier", tone: "caution" as const },
          { label: "Expect", value: "Turbulence, icing, poor visibility", tone: "nogo" as const },
        ],
        [
          { label: "Contains", value: "The jet stream", tone: "caution" as const },
          { label: "Temperature", value: "Stops falling — isothermal", tone: "brand" as const },
          { label: "Expect", value: "Wind shear and clear air turbulence", tone: "nogo" as const },
        ],
        [
          { label: "Conditions", value: "Smooth", tone: "go" as const },
          { label: "Visibility", value: "Excellent", tone: "go" as const },
        ],
      ][s.layer],
    note: () =>
      "Three layers, three completely different rides. Where you plan to cruise decides what you are planning around.",
  },

  CloudGroupPicker: {
    diagram: "wx-cloud-groups",
    controls: [
      {
        kind: "segmented",
        key: "group",
        label: "Altitude group",
        initial: 0,
        options: [
          { value: 0, label: "Low" },
          { value: 1, label: "Middle" },
          { value: 2, label: "High" },
        ],
      },
    ],
    toProps: (s) => ({ group: ["low", "middle", "high"][s.group] }),
    readouts: (s) =>
      [
        [
          { label: "Prefix", value: "Strato- or none", tone: "brand" as const },
          { label: "Made of", value: "Water droplets", tone: "caution" as const },
          { label: "Matters for", value: "Ceilings and icing", tone: "nogo" as const },
        ],
        [
          { label: "Prefix", value: "Alto-", tone: "brand" as const },
          { label: "Made of", value: "Water, ice, or both", tone: "caution" as const },
        ],
        [
          { label: "Prefix", value: "Cirro-", tone: "brand" as const },
          { label: "Made of", value: "Ice crystals", tone: "go" as const },
          { label: "Matters for", value: "Little — no icing, no turbulence", tone: "go" as const },
        ],
      ][s.group],
    note: () =>
      "The group is set by ALTITUDE, and the prefix tells you the group. Shape describes what the air is doing inside it — a separate question.",
  },

  TurbulenceCausePicker: {
    diagram: "wx-turbulence-causes",
    controls: [
      {
        kind: "segmented",
        key: "cause",
        label: "Cause",
        initial: 0,
        options: [
          { value: 0, label: "Wind shear" },
          { value: 1, label: "Thermal" },
          { value: 2, label: "Frontal" },
          { value: 3, label: "Mechanical" },
        ],
      },
    ],
    toProps: (s) => ({ cause: ["shear", "thermal", "frontal", "mechanical"][s.cause] }),
    readouts: (s) =>
      [
        [
          { label: "Where", value: "Jet streams, inversions, fronts", tone: "nogo" as const },
          { label: "Also called", value: "Clear air turbulence, up high", tone: "caution" as const },
        ],
        [
          { label: "Where", value: "Over surfaces heated from below", tone: "caution" as const },
          { label: "Strongest over", value: "DRY ground", tone: "nogo" as const },
        ],
        [
          { label: "Where", value: "At the frontal boundary", tone: "caution" as const },
          { label: "Worst with", value: "A fast cold front — steep lifting", tone: "nogo" as const },
        ],
        [
          { label: "Where", value: "Downwind of terrain and buildings", tone: "caution" as const },
          { label: "Usually", value: "Below 1,000 ft AGL", tone: "nogo" as const },
        ],
      ][s.cause],
    note: () =>
      "Four causes, and each one tells you WHERE to expect it. That is the useful half — turbulence you predicted is turbulence you slowed down for.",
  },

  IcingConditionRemover: {
    diagram: "wx-icing-requirements",
    controls: [
      {
        kind: "segmented",
        key: "missing",
        label: "Take one away",
        initial: 0,
        options: [
          { value: 0, label: "Nothing" },
          { value: 1, label: "Moisture" },
          { value: 2, label: "Free air temp" },
          { value: 3, label: "Surface temp" },
        ],
      },
    ],
    toProps: (s) => ({ missing: ["none", "moisture", "fat", "surface"][s.missing] }),
    readouts: (s) =>
      s.missing === 0
        ? [
            { label: "Visible moisture", value: "Present", tone: "nogo" as const },
            { label: "Free air temp", value: "Below freezing", tone: "nogo" as const },
            { label: "Surface temp", value: "Below freezing", tone: "nogo" as const },
            { label: "Result", value: "ICE FORMS", tone: "nogo" as const },
          ]
        : [
            {
              label: "Missing",
              value: ["", "Visible moisture", "Free air below freezing", "Surface below freezing"][s.missing],
              tone: "go" as const,
            },
            { label: "Result", value: "No ice", tone: "go" as const },
          ],
    note: (s) =>
      s.missing === 3
        ? "This is how anti-ice works: it cannot change the weather, so it removes the only condition the aircraft controls — its own surface temperature."
        : "All three, together. Remove any ONE and ice cannot form — which is why the question is always about which one is absent.",
  },

  MountainWaveSlider: {
    diagram: "wx-mountain-wave",
    controls: [
      {
        kind: "slider",
        key: "wind",
        label: "Wind across the ridge",
        min: 10,
        max: 100,
        step: 5,
        initial: 25,
        format: kt,
        tone: "caution",
      },
      { kind: "toggle", key: "clouds", label: "Show wave clouds", initial: 1 },
    ],
    toProps: (s) => ({ wind: s.wind, clouds: s.clouds === 1 }),
    readouts: (s) => [
      {
        label: "Wave activity",
        value: s.wind >= 40 ? "Significant" : s.wind >= 25 ? "Developing" : "Slight",
        tone: s.wind >= 40 ? "nogo" : s.wind >= 25 ? "caution" : "go",
      },
      {
        label: "Turbulence",
        value: s.wind >= 40 ? "Severe, and it reaches well above the ridge" : "Moderate near the terrain",
        tone: s.wind >= 40 ? "nogo" : "caution",
      },
      { label: "Downdraft", value: "On the LEE side", tone: "nogo" },
    ],
    note: (s) =>
      s.wind >= 40
        ? "Strong flow perpendicular to a ridge is the setup. The wave propagates upward, so cruising above the peaks is not clear of it."
        : "Wind speed across the ridge is the dial. Below about 25 knots there is little wave; wind it up and watch the disturbance grow.",
  },

  FogConditionPicker: {
    diagram: "wx-fog",
    controls: [
      {
        kind: "segmented",
        key: "need",
        label: "What fog needs",
        initial: 0,
        options: [
          { value: 0, label: "Nuclei" },
          { value: 1, label: "Small spread" },
          { value: 2, label: "Light wind" },
        ],
      },
    ],
    toProps: (s) => ({ highlight: ["nuclei", "spread", "wind"][s.need] }),
    readouts: (s) =>
      [
        [
          { label: "Needs", value: "Condensation nuclei to form on", tone: "brand" as const },
          { label: "Supplied by", value: "Dust, salt, combustion products", tone: "neutral" as const },
        ],
        [
          { label: "Needs", value: "Temperature and dew point close together", tone: "brand" as const },
          { label: "Watch", value: "A closing spread through the evening", tone: "caution" as const },
        ],
        [
          { label: "Needs", value: "LIGHT wind — not calm, not strong", tone: "nogo" as const },
          { label: "Calm air", value: "Will not mix moisture through the layer", tone: "caution" as const },
          { label: "Strong wind", value: "Disperses it", tone: "caution" as const },
        ],
      ][s.need],
    note: (s) =>
      s.need === 2
        ? "The wind condition is the counter-intuitive one. Fog wants a light breeze: calm air gives dew instead, and strong wind blows it away."
        : "Three ingredients. Miss any one and you get something other than fog.",
  },

  ProductPicker: {
    diagram: "wx-product-timeline",
    controls: [
      {
        kind: "segmented",
        key: "product",
        label: "Product",
        initial: 0,
        options: [
          { value: 0, label: "METAR" },
          { value: 1, label: "TAF" },
          { value: 2, label: "AIRMET" },
          { value: 3, label: "SIGMET" },
        ],
      },
    ],
    toProps: (s) => ({ product: ["metar", "taf", "airmet", "sigmet"][s.product] }),
    readouts: (s) =>
      [
        [
          { label: "Tells you", value: "Observed conditions, now", tone: "brand" as const },
          { label: "Identifier", value: "—", tone: "neutral" as const },
        ],
        [
          { label: "Tells you", value: "Forecast for one aerodrome", tone: "brand" as const },
          { label: "Identifier", value: "—", tone: "neutral" as const },
        ],
        [
          { label: "Tells you", value: "Hazard, moderate — affects light aircraft", tone: "caution" as const },
          { label: "Identifier", value: "WA", tone: "neutral" as const },
        ],
        [
          { label: "Tells you", value: "Hazard, severe — affects ALL aircraft", tone: "nogo" as const },
          { label: "Identifier", value: "WS · Convective is WST", tone: "neutral" as const },
        ],
      ][s.product],
    note: () =>
      "Observation, forecast, then two levels of warning. AIRMET is the moderate one and SIGMET the severe one — WA, WS, and WST for convective.",
  },

  MetarGroupStepper: {
    diagram: "wx-metar-decode",
    controls: [
      {
        kind: "segmented",
        key: "g",
        label: "Group",
        initial: 0,
        options: [
          { value: 0, label: "All" },
          { value: 1, label: "Wind" },
          { value: 2, label: "Vis" },
          { value: 3, label: "Wx" },
          { value: 4, label: "Sky" },
          { value: 5, label: "T/Td" },
          { value: 6, label: "Alt" },
        ],
      },
    ],
    toProps: (s) => ({
      group: ["none", "wind", "vis", "weather", "sky", "temp", "altimeter"][s.g],
    }),
    readouts: (s) =>
      [
        [{ label: "Order", value: "Type, station, time, wind, vis, RVR, wx, sky, T/Td, altimeter", tone: "neutral" as const }],
        [{ label: "27004KT", value: "From 270 true at 4 kt", tone: "brand" as const }, { label: "Format", value: "3 digits direction, then speed, then KT", tone: "neutral" as const }],
        [{ label: "7/8SM", value: "Seven eighths of a statute mile", tone: "nogo" as const }, { label: "Under 7 SM", value: "An obstruction must also be reported", tone: "caution" as const }],
        [{ label: "DZ FG", value: "Drizzle and fog", tone: "caution" as const }, { label: "Why here", value: "It is the obstruction the visibility demanded", tone: "neutral" as const }],
        [{ label: "BKN011", value: "Broken at 1,100 ft AGL", tone: "nogo" as const }, { label: "Ceiling", value: "1,100 ft — lowest BKN or OVC", tone: "nogo" as const }, { label: "SCT000", value: "Partial obscuration, NOT a ceiling", tone: "caution" as const }],
        [{ label: "19/18", value: "19 °C over 18 °C", tone: "brand" as const }, { label: "Spread", value: "1 °C — saturated, hence the fog", tone: "nogo" as const }],
        [{ label: "A2997", value: "29.97 inHg", tone: "brand" as const }, { label: "Format", value: "Four digits: tens, units, tenths, hundredths", tone: "neutral" as const }],
      ][s.g],
    note: (s) =>
      s.g === 4
        ? "Ceiling is the lowest BROKEN or OVERCAST layer. SCT000 is a partial obscuration and does not count, which is the trap this report is built around."
        : "A METAR is positional. The same four digits mean different things depending on which slot they sit in.",
  },

  TafChangeGroupPicker: {
    diagram: "wx-taf-decode",
    controls: [
      {
        kind: "segmented",
        key: "line",
        label: "Change group",
        initial: 0,
        options: [
          { value: 0, label: "All" },
          { value: 1, label: "Base" },
          { value: 2, label: "FM" },
          { value: 3, label: "BECMG" },
          { value: 4, label: "TEMPO" },
        ],
      },
    ],
    toProps: (s) => ({ line: ["none", "base", "fm", "becmg", "tempo"][s.line] }),
    readouts: (s) =>
      [
        [{ label: "The question", value: "How fast does it change, and does it stick?", tone: "neutral" as const }],
        [{ label: "Valid", value: "26th 0900Z up to but NOT including 27th 0900Z", tone: "brand" as const }, { label: "9000", value: "Metres — 6 miles. Military TAFs use metres", tone: "caution" as const }],
        [{ label: "Speed", value: "Fast", tone: "nogo" as const }, { label: "Sticks", value: "Yes — supersedes everything above", tone: "nogo" as const }, { label: "Carries", value: "ALL elements", tone: "neutral" as const }],
        [{ label: "Speed", value: "Slow, over about 2 hours", tone: "caution" as const }, { label: "Sticks", value: "Yes", tone: "caution" as const }, { label: "Carries", value: "Only what changes; the rest carries over", tone: "neutral" as const }],
        [{ label: "Speed", value: "Brief", tone: "brand" as const }, { label: "Sticks", value: "NO — the base forecast resumes after", tone: "go" as const }, { label: "Carries", value: "Only the listed elements", tone: "neutral" as const }],
      ][s.line],
    note: (s) =>
      s.line === 4
        ? "TEMPO is the only group that does not supersede anything. When its window closes, whatever was underneath comes back."
        : "Three groups, two questions each: how quickly does it arrive, and does it replace what came before?",
  },

  ControlSurfacePicker: {
    diagram: "control-surfaces",
    controls: [
      {
        kind: "segmented",
        key: "s",
        label: "Surface",
        initial: 0,
        options: [
          { value: 0, label: "All" },
          { value: 1, label: "Elevator" },
          { value: 2, label: "Ailerons" },
          { value: 3, label: "Rudder" },
        ],
      },
    ],
    toProps: (s) => ({ highlight: ["none", "elevator", "aileron", "rudder"][s.s] }),
    readouts: (s) =>
      [
        [{ label: "Three surfaces", value: "Elevator, ailerons, rudder", tone: "neutral" as const }],
        [
          { label: "Axis", value: "Lateral", tone: "go" as const },
          { label: "Motion", value: "Pitch", tone: "go" as const },
          { label: "Stick forward", value: "Elevator down → nose down", tone: "brand" as const },
        ],
        [
          { label: "Axis", value: "Longitudinal", tone: "brand" as const },
          { label: "Motion", value: "Roll", tone: "brand" as const },
          { label: "Watch", value: "They move in OPPOSITE directions", tone: "caution" as const },
        ],
        [
          { label: "Axis", value: "Vertical", tone: "nogo" as const },
          { label: "Motion", value: "Yaw", tone: "nogo" as const },
          { label: "Right pedal", value: "Tail flies left → nose right", tone: "brand" as const },
        ],
      ][s.s],
    note: (s) =>
      s.s === 2
        ? "Deflection commands a ROLL RATE, not a bank angle. Hold the stick over and it keeps rolling; centre it and the bank holds."
        : "Each surface changes the lift of the airfoil it is attached to. Where that airfoil sits decides the axis.",
  },

  TrimTabSlider: {
    diagram: "trim-tab-moment",
    controls: [
      {
        kind: "toggle",
        key: "trimmed",
        label: "Trim tab deflected",
        initial: 0,
        onLabel: "Trimmed",
        offLabel: "Untrimmed",
        tone: "go",
      },
    ],
    toProps: (s) => ({ trimmed: s.trimmed }),
    readouts: (s) =>
      s.trimmed === 1
        ? [
            { label: "Tab force", value: "Small", tone: "go" as const },
            { label: "Tab moment arm", value: "LONG — it sits at the trailing edge", tone: "go" as const },
            { label: "Sum of moments", value: "Zero — the surface holds", tone: "go" as const },
            { label: "Pilot", value: "Hands off", tone: "go" as const },
          ]
        : [
            { label: "Airflow force", value: "Large, close to the hinge", tone: "nogo" as const },
            { label: "Moment", value: "Unopposed — pushes the surface to neutral", tone: "nogo" as const },
            { label: "Pilot", value: "Must hold the stick", tone: "caution" as const },
          ],
    note: (s) =>
      s.trimmed === 1
        ? "Moment is force x arm. A small force far behind the hinge produces the same moment as a large force close to it — which is the whole trick."
        : "Deflect the surface and the airflow immediately tries to put it back. Something has to oppose that, and until you trim, it is your arm.",
  },

  TabTypePicker: {
    diagram: "tab-types",
    controls: [
      {
        kind: "segmented",
        key: "k",
        label: "Tab type",
        initial: 0,
        options: [
          { value: 0, label: "Servo" },
          { value: 1, label: "Anti-servo" },
          { value: 2, label: "Neutral" },
        ],
      },
    ],
    toProps: (s) => ({ kind: ["servo", "antiservo", "neutral"][s.k] }),
    readouts: (s) =>
      [
        [
          { label: "Moves", value: "OPPOSITE the surface", tone: "go" as const },
          { label: "Effect on the pilot", value: "Helps — easier to manoeuvre", tone: "go" as const },
          { label: "Usually on", value: "Ailerons", tone: "neutral" as const },
        ],
        [
          { label: "Moves", value: "SAME direction, faster", tone: "nogo" as const },
          { label: "Effect on the pilot", value: "Resists — more force at full deflection", tone: "nogo" as const },
          { label: "On the T-6B", value: "The rudder", tone: "brand" as const },
        ],
        [
          { label: "Moves", value: "Holds a CONSTANT angle", tone: "brand" as const },
          { label: "Effect on the pilot", value: "Neither helps nor resists", tone: "neutral" as const },
          { label: "On the T-6B", value: "Elevator and ailerons", tone: "brand" as const },
        ],
      ][s.k],
    note: (s) =>
      s.k === 2
        ? "Because a tab alone does not give the elevator the feel it needs, the T-6B adds two downsprings for low airspeed and a bobweight for manoeuvring flight."
        : "A trimming tab and a servo tab both move opposite the surface. One holds the surface; the other lightens it. Same geometry, different job.",
  },

  HingeLineSlider: {
    diagram: "hinge-line-balance",
    controls: [
      {
        kind: "slider",
        key: "cg",
        label: "Control surface CG",
        min: -1,
        max: 1,
        step: 1,
        initial: 0,
        format: (v) => (v < 0 ? "Forward of hinge" : v > 0 ? "Aft of hinge" : "On the hinge line"),
        tone: "brand",
      },
    ],
    toProps: (s) => ({ cg: s.cg }),
    readouts: (s) =>
      s.cg < 0
        ? [
            { label: "Control-free stability", value: "Greater", tone: "go" as const },
            { label: "Response", value: "Slower", tone: "caution" as const },
            { label: "Chosen by", value: "Transports and bombers", tone: "brand" as const },
          ]
        : s.cg > 0
          ? [
              { label: "Control-free stability", value: "Lower", tone: "nogo" as const },
              { label: "Response", value: "Faster — the surface floats into the wind", tone: "go" as const },
              { label: "Chosen by", value: "High-performance aircraft", tone: "brand" as const },
            ]
          : [
              { label: "Control-free stability", value: "Balanced", tone: "brand" as const },
              { label: "Response", value: "Balanced", tone: "brand" as const },
              { label: "Chosen by", value: "The T-6B", tone: "go" as const },
            ],
    note: (s) =>
      s.cg === 0
        ? "Weights placed forward of the hinge line — in the shielded horn and leading edges — put the CG exactly on it. That technique is mass balancing."
        : "This is a design trade, not a design error. Stability and response pull in opposite directions and the mission decides which one wins.",
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

