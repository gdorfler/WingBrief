import type { Drill, SourceReference } from "@/lib/types";
import { DRILL_SETS, PROBLEM_SETS } from "./questions";

/**
 * Ten reps of one thing.
 *
 * A drill is not a short lesson. It is the same operation over and over until
 * the setup stops needing thought, which is the only way the wheel gets fast
 * enough to be useful in an aircraft. The target time on each is the pace a
 * fluent student holds — not a limit, and nothing is scored against it; it is
 * there so improvement is visible.
 *
 * Each set draws on the trainee guide's own published problems, so the reps
 * are the reps the course actually assigns.
 */

const TG = (chapter: string, eo: string[]): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter,
  eo,
});

const C2 = "Chart Projections, Plotting and Global Timekeeping";
const C3 = "CR-3 Air Navigation Computer";
const C4 = "Airspeeds";
const C5 = "Preflight Winds";
const C6 = "In Flight Winds";

/** Take the first n ids from a set, so a drill is a fixed, repeatable ten. */
const take = (ids: string[], n: number) => ids.slice(0, n);

export const DRILLS: Drill[] = [
  {
    id: "nd-zulu",
    title: "Zulu conversions",
    operation: "Move a time between local and Greenwich using the zone description",
    unit: "n4",
    skillIds: ["sk-zulu"],
    questionIds: take(DRILL_SETS.zulu, 10),
    targetSeconds: 20,
    source: TG(C2, ["4.2"]),
  },
  {
    id: "nd-coords",
    title: "Coordinate pulls",
    operation: "Read a latitude and longitude off the chart",
    unit: "n5",
    skillIds: ["sk-pull-coords"],
    questionIds: PROBLEM_SETS.pullCoordinates,
    targetSeconds: 75,
    source: TG(C2, ["4.3"]),
  },
  {
    id: "nd-legs",
    title: "Course and distance",
    operation: "Measure a leg with the plotter and dividers, then apply variation",
    unit: "n5",
    skillIds: ["sk-measure-direction", "sk-measure-distance", "sk-variation"],
    questionIds: PROBLEM_SETS.measureLeg,
    targetSeconds: 110,
    source: TG(C2, ["4.5", "4.6"]),
  },
  {
    id: "nd-fixes",
    title: "TACAN fixes",
    operation: "Convert a radial to true, plot it, and pull the position",
    unit: "n5",
    skillIds: ["sk-tacan-fix"],
    questionIds: PROBLEM_SETS.tacanFix,
    targetSeconds: 120,
    source: TG(C2, ["4.7"]),
  },
  {
    id: "nd-time",
    title: "Time",
    operation: "Given distance and speed, find the time",
    unit: "n6",
    skillIds: ["sk-tsd", "sk-estimate"],
    questionIds: take(DRILL_SETS.time, 10),
    targetSeconds: 25,
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nd-speed",
    title: "Speed",
    operation: "Given distance and time, find the groundspeed",
    unit: "n6",
    skillIds: ["sk-tsd", "sk-estimate"],
    questionIds: take(DRILL_SETS.speed, 10),
    targetSeconds: 25,
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nd-distance",
    title: "Distance",
    operation: "Given speed and time, find the distance",
    unit: "n6",
    skillIds: ["sk-tsd", "sk-estimate"],
    questionIds: take(DRILL_SETS.distance, 10),
    targetSeconds: 25,
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nd-fuel",
    title: "Fuel consumption",
    operation: "Move between fuel flow, time and quantity burned",
    unit: "n6",
    skillIds: ["sk-fuel-rate", "sk-estimate"],
    questionIds: take(DRILL_SETS.fuel, 10),
    targetSeconds: 30,
    source: TG(C3, ["4.10"]),
  },
  {
    id: "nd-fuel-conversion",
    title: "Gallons and pounds",
    operation: "Convert fuel quantity off the unit index",
    unit: "n6",
    skillIds: ["sk-fuel-convert"],
    questionIds: take(DRILL_SETS.fuelConversion, 10),
    targetSeconds: 25,
    source: TG(C3, ["4.10"]),
  },
  {
    id: "nd-tas",
    title: "True airspeed and Mach",
    operation: "Pressure altitude, then TAS, then the Mach index",
    unit: "n7",
    skillIds: ["sk-pressure-altitude", "sk-tas", "sk-mach"],
    questionIds: take(DRILL_SETS.tas, 10),
    targetSeconds: 70,
    source: TG(C4, ["2.340", "2.341"]),
  },
  {
    id: "nd-preflight",
    title: "Preflight winds",
    operation: "Course and wind in, heading and groundspeed out",
    unit: "n8",
    skillIds: ["sk-preflight-wind", "sk-quartering"],
    questionIds: take(DRILL_SETS.preflightWind, 10),
    targetSeconds: 90,
    source: TG(C5, ["4.15"]),
  },
  {
    id: "nd-preflight-strong",
    title: "Preflight winds — strong",
    operation: "The same solution with the wind at 60 kt or more, on the small scale",
    unit: "n8",
    skillIds: ["sk-preflight-wind", "sk-quartering"],
    questionIds: DRILL_SETS.preflightWind.filter((_, i) =>
      // The published rows with winds at or above 60 kt, where the scale changes.
      [4, 6, 19, 31, 33, 35, 36, 38, 45, 49].includes(i),
    ),
    targetSeconds: 100,
    source: TG(C5, ["4.15"]),
  },
  {
    id: "nd-inflight",
    title: "In-flight winds",
    operation: "Heading, TAS, track and groundspeed in — the wind out",
    unit: "n9",
    skillIds: ["sk-inflight-wind"],
    questionIds: take(DRILL_SETS.inflightWind, 10),
    targetSeconds: 90,
    source: TG(C6, ["2.343"]),
  },
  {
    id: "nd-point-to-point",
    title: "Point to point",
    operation: "Direct from one radial and DME to another",
    unit: "n9",
    skillIds: ["sk-point-to-point"],
    questionIds: PROBLEM_SETS.pointToPoint,
    targetSeconds: 90,
    source: TG(C6, ["2.344"]),
  },
];

export const DRILL_BY_ID = Object.fromEntries(DRILLS.map((d) => [d.id, d]));
