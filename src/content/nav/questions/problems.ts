import type { NumericQuestion, SourceReference } from "@/lib/types";
import { featureAt, featureLatLon, legBetween, variationAt } from "@/lib/nav/chart";
import {
  courseAndDistance,
  formatElapsed,
  formatLat,
  formatLon,
  fuelBurned,
  magneticToTrue,
  parseClock,
  pointToPoint,
  preflightWind,
  projectPoint,
  radialFromBearingTo,
  timeFor,
  trueToMagnetic,
} from "@/lib/nav/math";

/**
 * The chart and planning problems.
 *
 * Every answer in this file is computed at load time from the same functions
 * the app grades against, so a problem statement and its key are physically
 * incapable of disagreeing. Where a value is quoted in the prompt it comes
 * from the chart definition, not from a number typed twice.
 *
 * The chart work uses WingBrief's generated training sheet — see
 * src/lib/nav/chart.ts for why, and what it does and does not claim to be.
 * The procedures being practised are the guide's, unchanged.
 */

const TG = (chapter: string, eo: string[]): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter,
  eo,
});

const C2 = "Chart Projections, Plotting and Global Timekeeping";
const C6 = "In Flight Winds";
const C7 = "Flight Planning and Conduct";

const pad = (n: number) => String(Math.round(n)).padStart(3, "0");
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Minutes of latitude in a coordinate, which is what the ±1 minute grades. */
const latMinutes = (lat: number) => (lat - Math.floor(lat)) * 60;
const lonMinutes = (lonW: number) => (lonW - Math.floor(lonW)) * 60;

/* ------------------------------------------------------------------ */
/* Pulling coordinates                                                 */
/* ------------------------------------------------------------------ */

const PULL_TARGETS = ["twr-marsh", "af-brackish", "twn-vermilion", "isl-pelican", "twr-ridge"];

const PULL_QUESTIONS: NumericQuestion[] = PULL_TARGETS.map((id, i) => {
  const f = featureAt(id);
  return {
    id: `nq-chart-pull-${i + 1}`,
    type: "numeric",
    unit: "n5",
    conceptIds: ["nav-pulling-coordinates", "nav-speed-marks", "nav-plotter"],
    skillIds: ["sk-pull-coords"],
    prompt: `Find ${f.name} on the chart and pull its coordinates. Give the minutes of latitude and of longitude — the whole degrees are ${Math.floor(f.lat)}° N and ${String(Math.floor(f.lonW)).padStart(3, "0")}° W.`,
    given: [
      { label: "Feature", value: f.name },
      { label: "Whole degrees", value: `${Math.floor(f.lat)}° N / ${String(Math.floor(f.lonW)).padStart(3, "0")}° W` },
    ],
    fields: [
      {
        key: "lat",
        label: "Latitude, minutes",
        unit: "latMinutes",
        answer: latMinutes(f.lat),
        tolerance: "latLong",
      },
      {
        key: "lon",
        label: "Longitude, minutes",
        unit: "lonMinutes",
        answer: lonMinutes(f.lonW),
        tolerance: "latLong",
      },
    ],
    allowedTools: ["chart", "scratch", "reference"],
    worked: [
      {
        action: `Find ${f.name} on the sheet.`,
        tool: "chart",
      },
      {
        action: "Align the grommet and the 90° mark along a meridian, then slide the straightedge down onto the point.",
        detail: "Check the alignment again after sliding — it drifts.",
        tool: "chart",
      },
      {
        action: "Mark where the straightedge crosses the meridian and count up from the nearest whole degree.",
        detail: "Ten-minute marks cross the line, five-minute marks sit to its left.",
        result: formatLat(f.lat),
      },
      {
        action: "Rotate ninety degrees, align to a parallel, and repeat for longitude.",
        tool: "chart",
        result: formatLon(f.lonW),
      },
    ],
    explanation: `${f.name} sits at ${formatLat(f.lat)}, ${formatLon(f.lonW)}. Latitude is counted up a meridian; longitude is counted along a parallel.`,
    knowCold: "Latitude against a meridian, longitude against a parallel, ±1 minute.",
    difficulty: 2,
    source: TG(C2, ["4.3"]),
  };
});

/* ------------------------------------------------------------------ */
/* Measuring a leg                                                     */
/* ------------------------------------------------------------------ */

const LEGS: [string, string][] = [
  ["af-brackish", "af-longleaf"],
  ["tcn-driftwood", "af-oyster"],
  ["af-sabine", "twn-pinewood"],
  ["tcn-cypress", "af-palmetto"],
  ["twr-delta", "isl-pelican"],
  ["af-redfish", "tcn-mariner"],
];

const LEG_QUESTIONS: NumericQuestion[] = LEGS.map(([fromId, toId], i) => {
  const from = featureAt(fromId);
  const to = featureAt(toId);
  const leg = legBetween(fromId, toId);
  const variation = variationAt(featureLatLon(fromId));
  const mc = trueToMagnetic(leg.trueCourse, variation);
  const quadrant =
    leg.trueCourse < 90
      ? "north-east"
      : leg.trueCourse < 180
        ? "south-east"
        : leg.trueCourse < 270
          ? "south-west"
          : "north-west";
  return {
    id: `nq-chart-leg-${i + 1}`,
    type: "numeric",
    unit: "n5",
    conceptIds: [
      "nav-measuring-direction",
      "nav-measuring-distance",
      "nav-variation-conversion",
      "nav-dividers",
    ],
    skillIds: ["sk-measure-direction", "sk-measure-distance", "sk-variation"],
    prompt: `Measure the true course, the magnetic course and the distance from ${from.name} to ${to.name}.`,
    given: [
      { label: "From", value: `${from.name} — ${formatLat(from.lat)}, ${formatLon(from.lonW)}` },
      { label: "To", value: `${to.name} — ${formatLat(to.lat)}, ${formatLon(to.lonW)}` },
    ],
    fields: [
      { key: "tc", label: "True course", unit: "deg", answer: leg.trueCourse, tolerance: "direction", wraps: true },
      { key: "mc", label: "Magnetic course", unit: "deg", answer: mc, tolerance: "direction", wraps: true },
      { key: "d", label: "Distance", unit: "nm", answer: leg.distance, tolerance: "distance" },
    ],
    estimate: {
      prompt: "Before the plotter: which way does this leg generally run?",
      options: ["North-east", "South-east", "South-west", "North-west"],
      answer: ["north-east", "south-east", "south-west", "north-west"].indexOf(quadrant),
      why: `It runs ${quadrant}, so the true course has to fall between ${Math.floor(leg.trueCourse / 90) * 90 || 360}° and ${(Math.floor(leg.trueCourse / 90) + 1) * 90}°. Any reading outside that band is the reciprocal.`,
    },
    allowedTools: ["chart", "scratch", "reference"],
    worked: [
      {
        action: `Draw the line from ${from.name} to ${to.name}, with a single arrow for the direction of travel.`,
        tool: "chart",
      },
      {
        action: `Estimate: the leg runs ${quadrant}.`,
        detail: "Two readings will present themselves. This is how you choose.",
      },
      {
        action: "Span the dividers along the line, lay the straightedge against their points, and slide until the grommet sits on a meridian.",
        detail: "A meridian halfway along the course is the most accurate; a nearby one is fine.",
        tool: "chart",
        result: `${pad(leg.trueCourse)}° true`,
      },
      {
        action: `Apply the variation. The nearest isogonic line here reads ${variation}° East.`,
        detail: "East is least — subtract it from the true course.",
        result: `${pad(mc)}° magnetic`,
      },
      {
        action: "Span the dividers between the two points and carry the span to a meridian to count the miles.",
        detail: "Never count along a parallel.",
        tool: "chart",
        result: `${round1(leg.distance)} NM`,
      },
    ],
    explanation: `${pad(leg.trueCourse)}° true, ${variation}° East variation gives ${pad(mc)}° magnetic, and the leg measures ${round1(leg.distance)} NM.`,
    difficulty: 3,
    source: TG(C2, ["4.5", "4.6", "2.338"]),
  };
});

/* ------------------------------------------------------------------ */
/* Plotting from a point                                               */
/* ------------------------------------------------------------------ */

const PROJECTIONS: { fromId: string; mc: number; nm: number }[] = [
  { fromId: "twr-marsh", mc: 235, nm: 25 },
  { fromId: "af-oyster", mc: 315, nm: 41 },
  { fromId: "tcn-cypress", mc: 185, nm: 49 },
];

const PROJECTION_QUESTIONS: NumericQuestion[] = PROJECTIONS.map((row, i) => {
  const from = featureLatLon(row.fromId);
  const feature = featureAt(row.fromId);
  const variation = variationAt(from);
  const tc = magneticToTrue(row.mc, variation);
  const point = projectPoint(from, tc, row.nm);
  return {
    id: `nq-chart-plot-${i + 1}`,
    type: "numeric",
    unit: "n5",
    conceptIds: ["nav-plotting-direction", "nav-plotting-coordinates", "nav-variation-conversion"],
    skillIds: ["sk-plot-direction", "sk-plot-coords", "sk-variation"],
    prompt: `From ${feature.name}, draw a magnetic course of ${pad(row.mc)}° and measure ${row.nm} NM along it. What are the coordinates of that point?`,
    given: [
      { label: "From", value: `${feature.name} — ${formatLat(from.lat)}, ${formatLon(from.lonW)}` },
      { label: "Magnetic course", value: `${pad(row.mc)}°` },
      { label: "Distance", value: `${row.nm} NM` },
    ],
    fields: [
      {
        key: "lat",
        label: "Latitude, minutes",
        unit: "latMinutes",
        answer: latMinutes(point.lat),
        tolerance: "latLong",
      },
      {
        key: "lon",
        label: "Longitude, minutes",
        unit: "lonMinutes",
        answer: lonMinutes(point.lonW),
        tolerance: "latLong",
      },
      {
        key: "deg",
        label: "Whole degrees of latitude",
        unit: "latDegrees",
        answer: Math.floor(point.lat),
        tolerance: "exact",
      },
    ],
    allowedTools: ["chart", "scratch", "reference"],
    worked: [
      {
        action: `The course you were given is MAGNETIC and the chart is TRUE. Variation here is ${variation}° East.`,
        detail: "Magnetic to true, so the easterly variation is added.",
        result: `${pad(tc)}° true`,
      },
      {
        action: `Hold a pencil on ${feature.name}, slide the straightedge against it, and move the grommet along the nearest meridian until ${pad(tc)}° reads on the outer scale.`,
        tool: "chart",
      },
      {
        action: `Set the dividers to ${row.nm} NM off a meridian and mark it along the line.`,
        tool: "chart",
      },
      {
        action: "Pull the coordinates of the new point.",
        result: `${formatLat(point.lat)}, ${formatLon(point.lonW)}`,
      },
    ],
    explanation: `${pad(row.mc)}° magnetic plus ${variation}° East is ${pad(tc)}° true; ${row.nm} NM along it lands at ${formatLat(point.lat)}, ${formatLon(point.lonW)}.`,
    difficulty: 3,
    source: TG(C2, ["4.4", "4.5", "2.338"]),
  };
});

/* ------------------------------------------------------------------ */
/* TACAN position fixing                                               */
/* ------------------------------------------------------------------ */

const FIXES: { stationId: string; radial: number; dme: number }[] = [
  { stationId: "tcn-mariner", radial: 74, dme: 31 },
  { stationId: "tcn-cypress", radial: 306, dme: 35 },
  { stationId: "tcn-tidewater", radial: 144, dme: 25 },
];

const FIX_QUESTIONS: NumericQuestion[] = FIXES.map((row, i) => {
  const station = featureAt(row.stationId);
  const from = featureLatLon(row.stationId);
  const variation = station.variationEast ?? variationAt(from);
  const trueRadial = magneticToTrue(row.radial, variation);
  const point = projectPoint(from, trueRadial, row.dme);
  return {
    id: `nq-chart-fix-${i + 1}`,
    type: "numeric",
    unit: "n5",
    conceptIds: ["nav-tacan-fix", "nav-variation-conversion", "nav-needle-head-tail"],
    skillIds: ["sk-tacan-fix", "sk-variation", "sk-plot-coords"],
    prompt: `Your BDHI shows the ${station.name} TACAN (channel ${station.channel}) ${row.radial}° radial at ${row.dme} DME. Plot the fix and pull its coordinates.`,
    given: [
      { label: "Station", value: `${station.name} — ${formatLat(station.lat)}, ${formatLon(station.lonW)}` },
      { label: "Radial", value: `${pad(row.radial)}°` },
      { label: "DME", value: `${row.dme} NM` },
      { label: "Variation at the station", value: `${variation}° East` },
    ],
    fields: [
      { key: "tr", label: "True radial to plot", unit: "deg", answer: trueRadial, tolerance: "direction", wraps: true },
      {
        key: "lat",
        label: "Latitude, minutes",
        unit: "latMinutes",
        answer: latMinutes(point.lat),
        tolerance: "latLong",
      },
      {
        key: "lon",
        label: "Longitude, minutes",
        unit: "lonMinutes",
        answer: lonMinutes(point.lonW),
        tolerance: "latLong",
      },
    ],
    estimate: {
      prompt: "Before plotting: is the true radial larger or smaller than the magnetic radial?",
      options: ["Larger", "Smaller", "The same"],
      answer: 0,
      why: "Radials are magnetic and the chart is true, so this conversion runs the reverse of the usual one and easterly variation is ADDED.",
    },
    allowedTools: ["chart", "scratch", "reference"],
    worked: [
      {
        action: `Convert the radial: ${row.radial} + ${variation}.`,
        detail: "Magnetic to true. This is the step almost everyone gets backwards.",
        result: `${pad(trueRadial)}° true`,
      },
      {
        action: `Plot ${pad(trueRadial)}° out from ${station.name}.`,
        tool: "chart",
      },
      {
        action: `Measure ${row.dme} NM along it and circle the point.`,
        detail: "The DME is slant range; for this course, treat it as ground range.",
        tool: "chart",
      },
      { action: "Pull the coordinates.", result: `${formatLat(point.lat)}, ${formatLon(point.lonW)}` },
    ],
    explanation: `${pad(row.radial)}° magnetic plus ${variation}° East is ${pad(trueRadial)}° true; ${row.dme} NM out puts you at ${formatLat(point.lat)}, ${formatLon(point.lonW)}.`,
    knowCold: "Radial is magnetic, chart is true. East ADDS on the way in.",
    difficulty: 3,
    source: TG(C2, ["4.7"]),
  };
});

/* ------------------------------------------------------------------ */
/* Point to point                                                      */
/* ------------------------------------------------------------------ */

const P2P: { from: [number, number]; to: [number, number]; bearingTo?: number }[] = [
  { from: [210, 30], to: [45, 44] },
  { from: [10, 13], to: [332, 84] },
  { from: [160, 53], to: [170, 15], bearingTo: 340 },
  { from: [64, 60], to: [310, 50] },
];

const P2P_QUESTIONS: NumericQuestion[] = P2P.map((row, i) => {
  const solution = pointToPoint(
    { radial: row.from[0], dme: row.from[1] },
    { radial: row.to[0], dme: row.to[1] },
  );
  const opening = row.bearingTo
    ? `Your BDHI's #2 needle head reads ${pad(row.bearingTo)}° at ${row.from[1]} DME.`
    : `You are on the ${pad(row.from[0])}° radial at ${row.from[1]} DME.`;
  return {
    id: `nq-p2p-${i + 1}`,
    type: "numeric",
    unit: "n9",
    conceptIds: row.bearingTo
      ? ["nav-point-to-point", "nav-needle-head-tail"]
      : ["nav-point-to-point"],
    skillIds: ["sk-point-to-point"],
    prompt: `${opening} You are cleared direct to the ${pad(row.to[0])}° radial at ${row.to[1]} DME of the same station. What magnetic course and distance?`,
    given: [
      ...(row.bearingTo
        ? [{ label: "Bearing TO the station", value: `${pad(row.bearingTo)}°` }]
        : [{ label: "Present radial", value: `${pad(row.from[0])}°` }]),
      { label: "Present DME", value: `${row.from[1]} NM` },
      { label: "Destination", value: `${pad(row.to[0])}° / ${row.to[1]} DME` },
    ],
    fields: [
      {
        key: "mc",
        label: "Magnetic course",
        unit: "deg",
        answer: solution.course,
        tolerance: "pointToPointCourse",
        wraps: true,
      },
      { key: "d", label: "Distance", unit: "nm", answer: solution.distance, tolerance: "pointToPointDistance" },
    ],
    allowedTools: ["cr3wind", "scratch", "reference"],
    worked: [
      ...(row.bearingTo
        ? [
            {
              action: `The head of the needle gives the bearing TO the station. Flip it for the radial.`,
              detail: `${pad(row.bearingTo)} reciprocal is ${pad(radialFromBearingTo(row.bearingTo))}.`,
              result: `${pad(radialFromBearingTo(row.bearingTo))}° radial`,
            },
          ]
        : []),
      {
        action: "Treat the CR-3's grid as a map with the station at the centre.",
        tool: "cr3wind",
      },
      {
        action: `Plot the present position at ${pad(row.from[0])}° / ${row.from[1]}, and the destination at ${pad(row.to[0])}° / ${row.to[1]}.`,
        detail: "Circle the destination so you cannot read the reciprocal.",
        tool: "cr3wind",
      },
      {
        action: "Connect the dots and rotate the grid until the line is vertical with the destination above.",
        tool: "cr3wind",
      },
      {
        action: "Read the course above the index and the distance off the head/tail scale.",
        tool: "cr3wind",
        result: `${pad(solution.course)}°M / ${Math.round(solution.distance)} NM`,
      },
    ],
    explanation: `${pad(solution.course)}° magnetic for ${Math.round(solution.distance)} NM. The radials are magnetic, so the course you read is magnetic too — no variation is applied.`,
    difficulty: 3,
    officialStyle: true,
    source: TG(C6, ["2.344"]),
  };
});

/* ------------------------------------------------------------------ */
/* Leg planning                                                        */
/* ------------------------------------------------------------------ */

const PLANNING: {
  fromId: string;
  toId: string;
  tas: number;
  wind: [number, number];
  fuelFlow: number;
  offMinutes: number;
  fuelOnBoard: number;
}[] = [
  {
    fromId: "af-brackish",
    toId: "af-longleaf",
    tas: 190,
    wind: [80, 35],
    fuelFlow: 240,
    offMinutes: 14 * 60,
    fuelOnBoard: 1800,
  },
  {
    fromId: "tcn-driftwood",
    toId: "af-oyster",
    tas: 135,
    wind: [190, 45],
    fuelFlow: 100,
    offMinutes: 9 * 60 + 44,
    fuelOnBoard: 620,
  },
];

const PLANNING_QUESTIONS: NumericQuestion[] = PLANNING.map((row, i) => {
  const from = featureAt(row.fromId);
  const to = featureAt(row.toId);
  const leg = legBetween(row.fromId, row.toId);
  const variation = variationAt(featureLatLon(row.fromId));
  const mc = trueToMagnetic(leg.trueCourse, variation);
  const wind = preflightWind({
    tas: row.tas,
    trueCourse: leg.trueCourse,
    windDirection: row.wind[0],
    windVelocity: row.wind[1],
  });
  const ete = timeFor(leg.distance, wind.groundspeed);
  const legFuel = fuelBurned(row.fuelFlow, ete);
  const eta = row.offMinutes + ete / 60;
  const efr = row.fuelOnBoard - legFuel;
  const quarter = `${wind.crosswindSide === "R" ? "right" : "left"} ${wind.componentType === "H" ? "head" : "tail"}`;

  return {
    id: `nq-plan-${i + 1}`,
    type: "numeric",
    unit: "n10",
    conceptIds: ["nav-planning-steps", "nav-jet-log-enroute", "nav-preflight-procedure"],
    skillIds: ["sk-plan-leg", "sk-preflight-wind", "sk-tsd", "sk-fuel-rate", "sk-jetlog"],
    prompt: `Plan the leg from ${from.name} to ${to.name}. Off at ${String(Math.floor(row.offMinutes / 60)).padStart(2, "0")}${String(row.offMinutes % 60).padStart(2, "0")}Z with ${row.fuelOnBoard} lb on board. Give the magnetic course, the distance, the heading and groundspeed, the ETE, the leg fuel, the ETA and the fuel remaining over ${to.name}.`,
    given: [
      { label: "From", value: `${from.name} — ${formatLat(from.lat)}, ${formatLon(from.lonW)}` },
      { label: "To", value: `${to.name} — ${formatLat(to.lat)}, ${formatLon(to.lonW)}` },
      { label: "TAS", value: `${row.tas} kt` },
      { label: "Preflight wind", value: `${pad(row.wind[0])}° / ${row.wind[1]} kt` },
      { label: "Fuel flow", value: `${row.fuelFlow} pph` },
      { label: "Fuel on board", value: `${row.fuelOnBoard} lb` },
      {
        label: "Take-off",
        value: `${String(Math.floor(row.offMinutes / 60)).padStart(2, "0")}${String(row.offMinutes % 60).padStart(2, "0")}Z`,
      },
      { label: "Variation", value: `${variation}° East` },
    ],
    fields: [
      { key: "mc", label: "Magnetic course", unit: "deg", answer: mc, tolerance: "direction", wraps: true },
      { key: "dist", label: "Distance", unit: "nm", answer: leg.distance, tolerance: "distance" },
      {
        key: "th",
        label: "True heading",
        unit: "deg",
        answer: wind.trueHeading,
        tolerance: "inflightWindDirection",
        wraps: true,
      },
      { key: "gs", label: "Groundspeed", unit: "kt", answer: wind.groundspeed, tolerance: "logScale" },
      { key: "ete", label: "ETE", unit: "elapsed", answer: ete, tolerance: "logScale" },
      { key: "fuel", label: "Leg fuel", unit: "lb", answer: legFuel, tolerance: "logScale" },
      { key: "eta", label: "ETA", unit: "clock", answer: Math.round(eta), tolerance: "exact" },
      { key: "efr", label: "Fuel remaining", unit: "lb", answer: efr, tolerance: "logScale" },
    ],
    estimate: {
      prompt: "Quartering analysis before anything else. What wind is this?",
      options: ["Left head", "Right head", "Left tail", "Right tail"],
      answer: ["Left head", "Right head", "Left tail", "Right tail"].indexOf(
        `${wind.crosswindSide === "R" ? "Right" : "Left"} ${wind.componentType === "H" ? "head" : "tail"}`,
      ),
      why: `A ${quarter}: heading goes ${wind.crosswindSide === "R" ? "right of" : "left of"} course, and groundspeed comes out ${wind.componentType === "H" ? "under" : "over"} ${row.tas} kt.`,
    },
    allowedTools: ["chart", "cr3wind", "cr3calc", "jetlog", "scratch", "reference"],
    worked: [
      {
        action: `Step 1 — measure. Draw the leg and read the course and distance.`,
        tool: "chart",
        result: `${pad(leg.trueCourse)}°T, ${round1(leg.distance)} NM`,
      },
      {
        action: `Apply ${variation}° East variation for the magnetic course on the log.`,
        result: `${pad(mc)}°M`,
      },
      {
        action: `Step 2 — winds. ${pad(row.wind[0])}° at ${row.wind[1]} against a course of ${pad(leg.trueCourse)}° is a ${quarter}.`,
        tool: "cr3wind",
        result: `TH ${pad(wind.trueHeading)}°, GS ${wind.groundspeed} kt`,
      },
      {
        action: `Step 3 — time. ${round1(leg.distance)} NM at ${wind.groundspeed} kt.`,
        tool: "cr3calc",
        result: formatElapsed(ete),
      },
      {
        action: `Step 4 — fuel. ${row.fuelFlow} pph for that ETE.`,
        tool: "cr3calc",
        result: `${Math.round(legFuel)} lb`,
      },
      {
        action: "Carry it down the log: take-off time plus ETE, fuel on board less leg fuel.",
        tool: "jetlog",
        result: `ETA ${String(Math.floor(eta / 60) % 24).padStart(2, "0")}${String(Math.round(eta) % 60).padStart(2, "0")}Z, EFR ${Math.round(efr)} lb`,
      },
    ],
    explanation: `${pad(mc)}°M for ${round1(leg.distance)} NM. A ${quarter} gives ${pad(wind.trueHeading)}° and ${wind.groundspeed} kt, so ${formatElapsed(ete)} en route burning ${Math.round(legFuel)} lb — leaving ${Math.round(efr)} lb over ${to.name}.`,
    difficulty: 3,
    source: TG(C7, ["4.11", "4.13"]),
  };
});

/* ------------------------------------------------------------------ */
/* Updating in flight                                                  */
/* ------------------------------------------------------------------ */

const UPDATE_QUESTIONS: NumericQuestion[] = [
  (() => {
    const remaining = 26;
    const gs = 131;
    const flow = 240;
    const fuelNow = 794.5;
    const nowMinutes = parseClock("1405")! + 5;
    const ete = timeFor(remaining, gs);
    const legFuel = fuelBurned(flow, ete);
    return {
      id: "nq-update-1",
      type: "numeric" as const,
      unit: "n10",
      conceptIds: ["nav-eta-update", "nav-efr-update", "nav-flight-conduct"],
      skillIds: ["sk-update-eta", "sk-update-efr"],
      prompt:
        "Five minutes into the leg a fix puts you off the plan. The new course to the turn point measures 26 NM, the updated winds give a groundspeed of 131 kt, and the fuel flow is still 240 pph. You have 794.5 lb on board and the clock reads 1410Z. What is the new ETE, ETA and fuel remaining over the turn point?",
      given: [
        { label: "Distance remaining", value: "26 NM" },
        { label: "Updated groundspeed", value: "131 kt" },
        { label: "Fuel flow", value: "240 pph" },
        { label: "Fuel on board", value: "794.5 lb" },
        { label: "Time now", value: "1410Z" },
      ],
      fields: [
        { key: "ete", label: "New ETE", unit: "elapsed" as const, answer: ete, tolerance: "logScale" as const },
        {
          key: "eta",
          label: "New ETA",
          unit: "clock" as const,
          answer: Math.round(nowMinutes + ete / 60),
          tolerance: "exact" as const,
        },
        { key: "fuel", label: "Leg fuel", unit: "lb" as const, answer: legFuel, tolerance: "logScale" as const },
        {
          key: "efr",
          label: "Fuel remaining",
          unit: "lb" as const,
          answer: fuelNow - legFuel,
          tolerance: "logScale" as const,
        },
      ],
      allowedTools: ["cr3calc", "jetlog", "scratch"] as NumericQuestion["allowedTools"],
      worked: [
        {
          action: "Estimate. 131 kt is a shade over 2 NM a minute, so 26 NM is about twelve minutes.",
          result: "≈ 12 min",
        },
        { action: "Set 131 over the rate index and read the time under 26.", tool: "cr3calc" as const, result: formatElapsed(ete) },
        { action: "Add it to the clock.", result: "1421Z" },
        {
          action: "Set 240 over the rate index and read the fuel above that time.",
          tool: "cr3calc" as const,
          result: `${Math.round(legFuel)} lb`,
        },
        {
          action: "Subtract from fuel on board.",
          detail: "The fuel already burned getting off the plan is why this starts from 794.5 rather than the original load.",
          result: `${Math.round(fuelNow - legFuel)} lb`,
        },
      ],
      explanation:
        "26 NM at 131 kt is 11+54, so 1422Z, burning about 48 lb and leaving 747 lb. Note that the fuel already spent going off course has come out first — the update starts from where you actually are, not from the plan.",
      knowCold: "Update from the fix, not from the plan.",
      difficulty: 3,
      officialStyle: true,
      source: TG(C7, ["4.16", "4.17"]),
    };
  })(),
  (() => {
    const distance = courseAndDistance(featureLatLon("tcn-cypress"), featureLatLon("af-palmetto")).distance;
    const needMinutes = 16;
    const gs = (distance / needMinutes) * 60;
    return {
      id: "nq-update-2",
      type: "numeric" as const,
      unit: "n10",
      conceptIds: ["nav-eta-update", "nav-planning-steps"],
      skillIds: ["sk-update-eta", "sk-tsd"],
      prompt: `You are overhead CYPRESS at 0944Z and you need to be overhead Palmetto Strip at 1000Z. What groundspeed must you hold?`,
      given: [
        { label: "Overhead CYPRESS", value: "0944Z" },
        { label: "Required over Palmetto Strip", value: "1000Z" },
        { label: "Leg", value: `CYPRESS to Palmetto Strip, ${round1(distance)} NM` },
      ],
      fields: [
        { key: "gs", label: "Required groundspeed", unit: "kt" as const, answer: gs, tolerance: "logScale" as const },
      ],
      estimate: {
        prompt: "You have sixteen minutes. Roughly what speed does that need?",
        options: ["Under 150 kt", "About 200 kt", "About 300 kt", "Over 400 kt"],
        answer: gs < 150 ? 0 : gs < 250 ? 1 : gs < 350 ? 2 : 3,
        why: `Sixteen minutes is a bit over a quarter of an hour, so the speed is roughly four times the distance — about ${Math.round(gs / 10) * 10} kt.`,
      },
      allowedTools: ["chart", "cr3calc", "scratch"] as NumericQuestion["allowedTools"],
      worked: [
        { action: "Measure the leg with the dividers.", tool: "chart" as const, result: `${round1(distance)} NM` },
        { action: "Work out the time available: 1000 minus 0944.", result: "16 minutes" },
        {
          action: "Set the distance over 16 minutes and read the speed above the rate index.",
          tool: "cr3calc" as const,
          result: `${Math.round(gs)} kt`,
        },
      ],
      explanation: `${round1(distance)} NM in 16 minutes needs about ${Math.round(gs)} kt. This is a plain time-speed-distance problem wearing a flight-planning hat.`,
      difficulty: 2,
      officialStyle: true,
      source: TG(C7, ["4.16"]),
    };
  })(),
];

/* ------------------------------------------------------------------ */

export const PROBLEM_QUESTIONS: NumericQuestion[] = [
  ...PULL_QUESTIONS,
  ...LEG_QUESTIONS,
  ...PROJECTION_QUESTIONS,
  ...FIX_QUESTIONS,
  ...P2P_QUESTIONS,
  ...PLANNING_QUESTIONS,
  ...UPDATE_QUESTIONS,
];

export const PROBLEM_SETS = {
  pullCoordinates: PULL_QUESTIONS.map((q) => q.id),
  measureLeg: LEG_QUESTIONS.map((q) => q.id),
  plotDirection: PROJECTION_QUESTIONS.map((q) => q.id),
  tacanFix: FIX_QUESTIONS.map((q) => q.id),
  pointToPoint: P2P_QUESTIONS.map((q) => q.id),
  planning: PLANNING_QUESTIONS.map((q) => q.id),
  updates: UPDATE_QUESTIONS.map((q) => q.id),
};
