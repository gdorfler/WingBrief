import type { Skill, SourceReference } from "@/lib/types";

const TG = (chapter: string, eo?: string[]): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter,
  eo,
});

/**
 * The skill map.
 *
 * Navigation is examined on what a student can produce, not on what they can
 * recognise, so the course tracks a second axis alongside the concept graph.
 * Every entry here is an operation with a tolerance attached, and every one of
 * them is named by an enabling objective that begins with a doing verb —
 * COMPUTE, CALCULATE, SOLVE, LOCATE, PLOT, MEASURE, PERFORM, DETERMINE.
 *
 * That verb is the reason the list exists. The guide's DESCRIBE objectives are
 * concepts and are covered by the concept graph; these are the ones you cannot
 * pass by reading.
 */
export const SKILLS: Skill[] = [
  /* ---------------- Direction ---------------- */
  {
    id: "sk-variation",
    name: "Apply variation",
    operation: "Convert a true direction to magnetic, or a magnetic radial to true",
    unit: "n3",
    tolerance: "±1°",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["2.338"]),
  },

  /* ---------------- Time ---------------- */
  {
    id: "sk-zulu",
    name: "Convert Zulu",
    operation: "Move between local mean time and Greenwich mean time using a zone description",
    unit: "n4",
    tool: "timezone",
    tolerance: "exact to the minute",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.2"]),
  },
  {
    id: "sk-zulu-leg",
    name: "Fly a leg in Zulu",
    operation: "Convert out, add the time en route, convert back, and carry the day",
    unit: "n4",
    tool: "timezone",
    tolerance: "exact to the minute",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.2"]),
  },

  /* ---------------- Chart work ---------------- */
  {
    id: "sk-pull-coords",
    name: "Pull coordinates",
    operation: "Read a latitude and longitude off the chart for a point you can see",
    unit: "n5",
    tool: "chart",
    tolerance: "±1 minute",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.3"]),
  },
  {
    id: "sk-plot-coords",
    name: "Plot coordinates",
    operation: "Put a point on the chart from a latitude and longitude",
    unit: "n5",
    tool: "chart",
    tolerance: "±1 minute",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.4"]),
  },
  {
    id: "sk-measure-direction",
    name: "Measure direction",
    operation: "Read the course of a line already on the chart, against a meridian",
    unit: "n5",
    tool: "chart",
    tolerance: "±1°",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.6"]),
  },
  {
    id: "sk-plot-direction",
    name: "Plot direction",
    operation: "Draw a line from a point on a given course",
    unit: "n5",
    tool: "chart",
    tolerance: "±1°",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.5"]),
  },
  {
    id: "sk-measure-distance",
    name: "Measure distance",
    operation: "Span the dividers, carry the span to a meridian and count",
    unit: "n5",
    tool: "chart",
    tolerance: "±½ NM",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.5", "4.6"]),
  },
  {
    id: "sk-tacan-fix",
    name: "Fix from a TACAN",
    operation: "Plot a position from a radial and DME, converting the radial to true first",
    unit: "n5",
    tool: "chart",
    tolerance: "±1° and ±½ NM",
    source: TG("Chart Projections, Plotting and Global Timekeeping", ["4.7"]),
  },

  /* ---------------- The CR-3 calculation side ---------------- */
  {
    id: "sk-ratio",
    name: "Set a ratio",
    operation: "Transfer a proportion onto the two scales and read the fourth term",
    unit: "n6",
    tool: "cr3calc",
    tolerance: "±1 unit on the log scale",
    source: TG("CR-3 Air Navigation Computer", ["4.9"]),
  },
  {
    id: "sk-estimate",
    name: "Estimate first",
    operation: "Produce a rough answer before reading any instrument, and place the decimal from it",
    unit: "n6",
    tolerance: "the right order of magnitude",
    source: TG("CR-3 Air Navigation Computer", ["4.9"]),
  },
  {
    id: "sk-tsd",
    name: "Solve time, speed, distance",
    operation: "Given any two, produce the third against the rate or high-speed index",
    unit: "n6",
    tool: "cr3calc",
    tolerance: "±1 unit on the log scale",
    source: TG("CR-3 Air Navigation Computer", ["4.9"]),
  },
  {
    id: "sk-fuel-rate",
    name: "Solve fuel consumption",
    operation: "Move between fuel flow, time and quantity burned",
    unit: "n6",
    tool: "cr3calc",
    tolerance: "±1 unit on the log scale",
    source: TG("CR-3 Air Navigation Computer", ["4.10"]),
  },
  {
    id: "sk-fuel-convert",
    name: "Convert fuel",
    operation: "Move between gallons and pounds at a given fuel weight, off the unit index",
    unit: "n6",
    tool: "cr3calc",
    tolerance: "±1 unit on the log scale",
    source: TG("CR-3 Air Navigation Computer", ["4.10"]),
  },

  /* ---------------- Airspeed ---------------- */
  {
    id: "sk-pressure-altitude",
    name: "Find pressure altitude",
    operation: "Correct calibrated altitude for the difference from 29.92",
    unit: "n7",
    tolerance: "exact",
    source: TG("Airspeeds", ["2.340"]),
  },
  {
    id: "sk-tas",
    name: "Calculate true airspeed",
    operation: "Set CAS over pressure altitude, dial the temperature, read TAS",
    unit: "n7",
    tool: "cr3calc",
    tolerance: "±2 kt",
    source: TG("Airspeeds", ["2.340"]),
  },
  {
    id: "sk-mach",
    name: "Calculate Mach number",
    operation: "Read the Mach index from the same CAS-over-altitude setting",
    unit: "n7",
    tool: "cr3calc",
    tolerance: "±0.01",
    source: TG("Airspeeds", ["2.341"]),
  },

  /* ---------------- Winds ---------------- */
  {
    id: "sk-quartering",
    name: "Quartering analysis",
    operation: "Sketch the wind against the course and say which way heading and speed will move",
    unit: "n8",
    tolerance: "the right quadrant",
    source: TG("Preflight Winds", ["4.14"]),
  },
  {
    id: "sk-preflight-wind",
    name: "Solve preflight winds",
    operation: "From TAS, true course and a forecast wind, produce heading and groundspeed",
    unit: "n8",
    tool: "cr3wind",
    tolerance: "±3° and ±3 kt, ±5 and ±5 above 70 kt",
    source: TG("Preflight Winds", ["4.15"]),
  },
  {
    id: "sk-inflight-wind",
    name: "Solve in-flight winds",
    operation: "From heading, TAS, track and groundspeed, recover the wind",
    unit: "n9",
    tool: "cr3wind",
    tolerance: "±3° and ±3 kt, ±5 and ±5 above 70 kt",
    source: TG("In Flight Winds", ["2.343"]),
  },
  {
    id: "sk-point-to-point",
    name: "TACAN point to point",
    operation: "Go direct from one radial and DME to another without overflying the station",
    unit: "n9",
    tool: "cr3wind",
    tolerance: "±3° and ±1 NM",
    source: TG("In Flight Winds", ["2.344"]),
  },

  /* ---------------- Planning ---------------- */
  {
    id: "sk-plan-leg",
    name: "Plan a leg",
    operation: "Course and distance, then heading and groundspeed, then ETE, then leg fuel",
    unit: "n10",
    tool: "jetlog",
    tolerance: "each step to its own tolerance",
    source: TG("Flight Planning and Conduct", ["4.13"]),
  },
  {
    id: "sk-jetlog",
    name: "Fill the jet log",
    operation: "Carry course, distance, time and fuel down the en-route section",
    unit: "n10",
    tool: "jetlog",
    tolerance: "each step to its own tolerance",
    source: TG("Flight Planning and Conduct", ["4.12", "4.13"]),
  },
  {
    id: "sk-update-eta",
    name: "Update the ETA",
    operation: "Recompute arrival from an updated groundspeed and the distance still to run",
    unit: "n10",
    tool: "cr3calc",
    tolerance: "±1 unit on the log scale",
    source: TG("Flight Planning and Conduct", ["4.16"]),
  },
  {
    id: "sk-update-efr",
    name: "Update the fuel",
    operation: "Recompute estimated fuel remaining from fuel on board and a predicted flow",
    unit: "n10",
    tool: "cr3calc",
    tolerance: "±1 unit on the log scale",
    source: TG("Flight Planning and Conduct", ["4.17"]),
  },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
