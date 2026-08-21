"use client";

/**
 * Diagram registry.
 *
 * Lesson screens, explainer frames and questions all reference diagrams by a
 * string id plus a loose prop bag. This is the single place those ids resolve,
 * so content can never reference a diagram that does not exist without the
 * content test catching it.
 */

import type { ReactElement } from "react";
import type { DiagramProps } from "./primitives";
import {
  AoaVsPitch,
  AtmosphereColumn,
  Axes3d,
  EquilibriumForces,
  FourForces,
  HumidityDensity,
  IasTasLadder,
  IcetgLadder,
  LiftEquationAnatomy,
  MomentArm,
  PitotStatic,
  Streamtube,
} from "./basics";
import {
  AeroForceComponents,
  AirfoilGeometry,
  AirfoilPressure,
  BoundaryLayer,
  ChordwiseSpanwise,
  ClVsAoa,
  HighLiftComparison,
  StallProgression,
  StallSpeedEquation,
} from "./airfoil";
import { DragCurves, GroundEffect, ParasiteComponents, WingtipVortex } from "./drag";
import {
  ClimbVectors,
  ExcessCurves,
  GlideVectors,
  PowerCurves,
  TakeoffForces,
  ThrustCurves,
  ThrustPowerPair,
} from "./performance";
import {
  SlipSkid,
  SpinWings,
  StabilityBall,
  TurnForces,
  TurnGeometry,
  VnDiagram,
  WakeVortex,
  WindShear,
} from "./maneuvering";
import {
  AxialCompressor,
  BladeAoa,
  BurnerAirSplit,
  CentrifugalCompressor,
  CycleCompare,
  DuctFlow,
  ElectricalBuses,
  EngineCutaway,
  EngineTypeSplit,
  FuelSystem,
  HydraulicCircuit,
  OilSystem,
  PressureSplit,
  SpoolLayout,
  StallIndications,
  StartSequence,
  StationChanges,
  ThrustFactor,
  TurbineEnergySplit,
  TurbopropPowerFlow,
} from "./engines";

export type DiagramRenderer = (props: DiagramProps) => ReactElement;

export const DIAGRAMS: Record<string, DiagramRenderer> = {
  /* Unit 1 */
  "moment-arm": MomentArm,
  "atmosphere-column": AtmosphereColumn,
  streamtube: Streamtube,
  "pitot-static": PitotStatic,
  "icetg-ladder": IcetgLadder,
  "ias-tas-ladder": IasTasLadder,
  "humidity-density": HumidityDensity,
  "equilibrium-forces": EquilibriumForces,
  "four-forces": FourForces,
  "axes-3d": Axes3d,
  "aoa-vs-pitch": AoaVsPitch,
  "airfoil-geometry": AirfoilGeometry,
  "chordwise-spanwise": ChordwiseSpanwise,

  /* Unit 2 */
  "airfoil-pressure": AirfoilPressure,
  "aero-force-components": AeroForceComponents,
  "lift-equation-anatomy": LiftEquationAnatomy,
  "cl-vs-aoa": ClVsAoa,

  /* Unit 3 */
  "parasite-components": ParasiteComponents,
  "wingtip-vortex": WingtipVortex,
  "ground-effect": GroundEffect,
  "drag-curves": DragCurves,

  /* Unit 4 */
  "thrust-curves": ThrustCurves,
  "power-curves": PowerCurves,
  "excess-curves": ExcessCurves,
  "thrust-power-pair": ThrustPowerPair,
  "takeoff-forces": TakeoffForces,
  "climb-vectors": ClimbVectors,
  "glide-vectors": GlideVectors,

  /* Unit 5 */
  "boundary-layer": BoundaryLayer,
  "stall-progression": StallProgression,
  "stall-speed-equation": StallSpeedEquation,
  "high-lift-comparison": HighLiftComparison,
  "turn-forces": TurnForces,
  "turn-geometry": TurnGeometry,
  "vn-diagram": VnDiagram,

  /* Unit 6 */
  "slip-skid": SlipSkid,
  "spin-wings": SpinWings,
  "wake-vortex": WakeVortex,
  "wind-shear": WindShear,
  "stability-ball": StabilityBall,

  /* ---- Engines ---- */
  "eng-cutaway": EngineCutaway,
  "eng-station-changes": StationChanges,
  "eng-duct": DuctFlow,
  "eng-pressure-split": PressureSplit,
  "eng-cycles": CycleCompare,
  "eng-thrust-factor": ThrustFactor,
  "eng-centrifugal": CentrifugalCompressor,
  "eng-axial": AxialCompressor,
  "eng-spools": SpoolLayout,
  "eng-burner-split": BurnerAirSplit,
  "eng-turbine-energy": TurbineEnergySplit,
  "eng-blade-aoa": BladeAoa,
  "eng-stall-indications": StallIndications,
  "eng-type-split": EngineTypeSplit,
  "eng-turboprop-flow": TurbopropPowerFlow,
  "eng-fuel-system": FuelSystem,
  "eng-oil-system": OilSystem,
  "eng-start-sequence": StartSequence,
  "eng-electrical": ElectricalBuses,
  "eng-hydraulic": HydraulicCircuit,
};

export const DIAGRAM_IDS = Object.keys(DIAGRAMS);

export function hasDiagram(id: string): boolean {
  return id in DIAGRAMS;
}

/** Renders a diagram by id. Unknown ids fail visibly in development only. */
export function DiagramHost({
  id,
  props = {},
  caption,
}: {
  id: string;
  props?: DiagramProps;
  caption?: string;
}) {
  const Component = DIAGRAMS[id];
  if (!Component) {
    return (
      <div className="rounded-xl border border-dashed border-nogo/40 bg-nogo-soft/50 p-6 text-center text-sm font-semibold text-nogo">
        Missing diagram: {id}
      </div>
    );
  }
  return (
    <figure className="w-full">
      <Component {...props} />
      {caption && (
        <figcaption className="mt-2 text-center text-xs font-medium text-navy-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
