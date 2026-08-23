import type { Mission, NumericQuestion, SourceReference } from "@/lib/types";
import { featureAt, featureLatLon, legBetween, variationAt } from "@/lib/nav/chart";
import {
  courseAndDistance,
  formatClock,
  formatElapsed,
  formatLat,
  formatLon,
  fuelBurned,
  inflightWind,
  magneticToTrue,
  parseClock,
  preflightWind,
  projectPoint,
  speedFor,
  timeFor,
  trueToMagnetic,
} from "@/lib/nav/math";

/**
 * Missions — the capstone.
 *
 * A mission is one continuous problem rather than a set of related ones. You
 * plot the route, measure it, work the winds, compute the times and the fuel,
 * fill the log, and then a fix says the forecast was wrong and you do the
 * second half again with the numbers that actually happened. That last part is
 * the point: Information Sheet 6-7-2 spends as long on flight conduct as on
 * flight planning, because the plan never survives contact with the air.
 *
 * Every value below is computed from the chart and the validated maths, so the
 * stages are guaranteed to be consistent with each other — a student who gets
 * stage two right cannot be handed a stage three that disagrees with it.
 */

const TG = (eo: string[]): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter: "Flight Planning and Conduct",
  eo,
});

const pad = (n: number) => String(Math.round(n)).padStart(3, "0");
const round1 = (n: number) => Math.round(n * 10) / 10;

/* ================================================================== */
/* Mission 1 — a two-leg cross-country                                */
/* ================================================================== */

const M1 = (() => {
  const legs: [string, string][] = [
    ["af-brackish", "af-longleaf"],
    ["af-longleaf", "twn-cutgrass"],
  ];
  const tas = 190;
  const wind: [number, number] = [40, 30];
  const flow = 240;
  const fuelStart = 1800;
  const off = parseClock("1400")!;

  const measured = legs.map(([a, b]) => ({
    from: featureAt(a),
    to: featureAt(b),
    ...legBetween(a, b),
    variation: variationAt(featureLatLon(a)),
  }));

  const solved = measured.map((m) => {
    const w = preflightWind({
      tas,
      trueCourse: m.trueCourse,
      windDirection: wind[0],
      windVelocity: wind[1],
    });
    const ete = timeFor(m.distance, w.groundspeed);
    return { ...m, w, ete, legFuel: fuelBurned(flow, ete) };
  });

  let clock = off;
  let fuel = fuelStart;
  const rows = solved.map((s) => {
    clock += s.ete / 60;
    fuel -= s.legFuel;
    return { ...s, eta: clock, efr: fuel };
  });

  /* The in-flight fix: eight minutes out, a little south of the planned line. */
  const fixMinutes = 8;
  const fixTrack = rows[0].trueCourse + 6;
  const fixGs = 205;
  const fixDistance = (fixGs * fixMinutes) / 60;
  const fixPoint = projectPoint(featureLatLon("af-brackish"), fixTrack, fixDistance);
  const actualWind = inflightWind({
    trueHeading: rows[0].w.trueHeading,
    tas,
    track: fixTrack,
    groundspeed: fixGs,
  });
  const newLeg = courseAndDistance(fixPoint, featureLatLon("af-longleaf"));
  const replan = preflightWind({
    tas,
    trueCourse: newLeg.trueCourse,
    windDirection: actualWind.direction,
    windVelocity: actualWind.velocity,
  });
  const newEte = timeFor(newLeg.distance, replan.groundspeed);
  const fuelAtFix = fuelStart - fuelBurned(flow, fixMinutes * 60);

  return { legs, tas, wind, flow, fuelStart, off, rows, fixMinutes, fixTrack, fixGs, fixPoint, actualWind, newLeg, replan, newEte, fuelAtFix };
})();

const M1_QUESTIONS: NumericQuestion[] = [
  {
    id: "nm1-s1",
    type: "numeric",
    unit: "n10",
    conceptIds: ["nav-planning-steps", "nav-measuring-direction", "nav-measuring-distance"],
    skillIds: ["sk-measure-direction", "sk-measure-distance", "sk-variation"],
    prompt:
      "Step one. Measure both legs of the route: Brackish Field direct Longleaf Muni, then direct Cutgrass.",
    given: [
      { label: "Leg 1", value: "Brackish Field → Longleaf Muni" },
      { label: "Leg 2", value: "Longleaf Muni → Cutgrass" },
    ],
    fields: [
      { key: "mc1", label: "Leg 1 magnetic course", unit: "deg", answer: trueToMagnetic(M1.rows[0].trueCourse, M1.rows[0].variation), tolerance: "direction", wraps: true },
      { key: "d1", label: "Leg 1 distance", unit: "nm", answer: M1.rows[0].distance, tolerance: "distance" },
      { key: "mc2", label: "Leg 2 magnetic course", unit: "deg", answer: trueToMagnetic(M1.rows[1].trueCourse, M1.rows[1].variation), tolerance: "direction", wraps: true },
      { key: "d2", label: "Leg 2 distance", unit: "nm", answer: M1.rows[1].distance, tolerance: "distance" },
    ],
    allowedTools: ["chart", "jetlog", "scratch", "reference"],
    worked: [
      { action: "Draw both legs, each with a single direction arrow.", tool: "chart" },
      { action: "Estimate each one's quadrant before you read the plotter." },
      {
        action: "Measure each course against a meridian near its midpoint.",
        tool: "chart",
        result: `${pad(M1.rows[0].trueCourse)}°T and ${pad(M1.rows[1].trueCourse)}°T`,
      },
      {
        action: "Apply the variation from the nearest isogonic line to each leg.",
        result: `${pad(trueToMagnetic(M1.rows[0].trueCourse, M1.rows[0].variation))}°M and ${pad(trueToMagnetic(M1.rows[1].trueCourse, M1.rows[1].variation))}°M`,
      },
      {
        action: "Span the dividers on each leg and carry the span to a meridian.",
        tool: "chart",
        result: `${round1(M1.rows[0].distance)} NM and ${round1(M1.rows[1].distance)} NM`,
      },
      { action: "Write the courses and distances into the CUS and DIST columns.", tool: "jetlog" },
    ],
    explanation: `Leg 1 is ${pad(trueToMagnetic(M1.rows[0].trueCourse, M1.rows[0].variation))}°M for ${round1(M1.rows[0].distance)} NM; leg 2 is ${pad(trueToMagnetic(M1.rows[1].trueCourse, M1.rows[1].variation))}°M for ${round1(M1.rows[1].distance)} NM. Nothing else can be computed until these two are right.`,
    difficulty: 3,
    source: TG(["4.11", "4.13"]),
  },
  {
    id: "nm1-s2",
    type: "numeric",
    unit: "n10",
    conceptIds: ["nav-preflight-procedure", "nav-quartering"],
    skillIds: ["sk-preflight-wind"],
    prompt: `Step two. The forecast wind is ${pad(M1.wind[0])}° at ${M1.wind[1]} kt and you will fly ${M1.tas} kt TAS. What heading and groundspeed for each leg?`,
    given: [
      { label: "Wind", value: `${pad(M1.wind[0])}° / ${M1.wind[1]} kt` },
      { label: "TAS", value: `${M1.tas} kt` },
      { label: "Leg 1 true course", value: `${pad(M1.rows[0].trueCourse)}°` },
      { label: "Leg 2 true course", value: `${pad(M1.rows[1].trueCourse)}°` },
    ],
    fields: [
      { key: "th1", label: "Leg 1 true heading", unit: "deg", answer: M1.rows[0].w.trueHeading, tolerance: "inflightWindDirection", wraps: true },
      { key: "gs1", label: "Leg 1 groundspeed", unit: "kt", answer: M1.rows[0].w.groundspeed, tolerance: "logScale" },
      { key: "th2", label: "Leg 2 true heading", unit: "deg", answer: M1.rows[1].w.trueHeading, tolerance: "inflightWindDirection", wraps: true },
      { key: "gs2", label: "Leg 2 groundspeed", unit: "kt", answer: M1.rows[1].w.groundspeed, tolerance: "logScale" },
    ],
    estimate: {
      prompt: "On leg 1, will the groundspeed be above or below true airspeed?",
      options: ["Above", "Below"],
      answer: M1.rows[0].w.componentType === "H" ? 1 : 0,
      why: `The wind is ${M1.rows[0].w.componentType === "H" ? "ahead of" : "behind"} you on this leg, so groundspeed comes out ${M1.rows[0].w.componentType === "H" ? "under" : "over"} ${M1.tas} kt.`,
    },
    allowedTools: ["cr3wind", "jetlog", "scratch", "reference"],
    worked: [
      { action: "Erase the wheel before each leg. Two problems on one face is how they contaminate each other.", tool: "cr3wind" },
      { action: "Leg 1: plot the wind, set the TAS, set the course, read the components.", tool: "cr3wind" },
      {
        action: "Apply the head/tail to TAS and the crab to the course.",
        result: `${pad(M1.rows[0].w.trueHeading)}° / ${M1.rows[0].w.groundspeed} kt`,
      },
      {
        action: "Repeat for leg 2 — same wind, different course, so a different answer.",
        tool: "cr3wind",
        result: `${pad(M1.rows[1].w.trueHeading)}° / ${M1.rows[1].w.groundspeed} kt`,
      },
      { action: "Heading and groundspeed go in the NOTES column, not CUS.", tool: "jetlog" },
    ],
    explanation: `Leg 1: ${pad(M1.rows[0].w.trueHeading)}° at ${M1.rows[0].w.groundspeed} kt. Leg 2: ${pad(M1.rows[1].w.trueHeading)}° at ${M1.rows[1].w.groundspeed} kt. One wind, two courses, two quite different answers.`,
    difficulty: 3,
    source: TG(["4.15"]),
  },
  {
    id: "nm1-s3",
    type: "numeric",
    unit: "n10",
    conceptIds: ["nav-jet-log-enroute", "nav-planning-steps"],
    skillIds: ["sk-tsd", "sk-fuel-rate", "sk-jetlog"],
    prompt: `Steps three and four. Off Brackish at 1400Z with ${M1.fuelStart} lb and a fuel flow of ${M1.flow} pph. Complete the log to Cutgrass.`,
    given: [
      { label: "Take-off", value: "1400Z" },
      { label: "Fuel on board", value: `${M1.fuelStart} lb` },
      { label: "Fuel flow", value: `${M1.flow} pph` },
      { label: "Leg 1", value: `${round1(M1.rows[0].distance)} NM at ${M1.rows[0].w.groundspeed} kt` },
      { label: "Leg 2", value: `${round1(M1.rows[1].distance)} NM at ${M1.rows[1].w.groundspeed} kt` },
    ],
    fields: [
      { key: "ete1", label: "Leg 1 ETE", unit: "elapsed", answer: M1.rows[0].ete, tolerance: "logScale" },
      { key: "eta1", label: "ETA Longleaf", unit: "clock", answer: Math.round(M1.rows[0].eta), tolerance: "exact" },
      { key: "efr1", label: "EFR Longleaf", unit: "lb", answer: M1.rows[0].efr, tolerance: "logScale" },
      { key: "ete2", label: "Leg 2 ETE", unit: "elapsed", answer: M1.rows[1].ete, tolerance: "logScale" },
      { key: "eta2", label: "ETA Cutgrass", unit: "clock", answer: Math.round(M1.rows[1].eta), tolerance: "exact" },
      { key: "efr2", label: "EFR Cutgrass", unit: "lb", answer: M1.rows[1].efr, tolerance: "logScale" },
    ],
    allowedTools: ["cr3calc", "jetlog", "scratch", "reference"],
    worked: [
      {
        action: `Leg 1 time: set ${M1.rows[0].w.groundspeed} over the rate index, read under ${round1(M1.rows[0].distance)}.`,
        tool: "cr3calc",
        result: formatElapsed(M1.rows[0].ete),
      },
      {
        action: `Leg 1 fuel: set ${M1.flow} over the rate index, read above that time.`,
        tool: "cr3calc",
        result: `${Math.round(M1.rows[0].legFuel)} lb`,
      },
      {
        action: "Carry the ETA and the EFR down the log before starting leg 2.",
        detail: "Leg 2's EFR starts from leg 1's, not from the original fuel load.",
        tool: "jetlog",
        result: `${formatClock(M1.rows[0].eta)}Z · ${Math.round(M1.rows[0].efr)} lb`,
      },
      {
        action: "Repeat for leg 2.",
        tool: "cr3calc",
        result: `${formatClock(M1.rows[1].eta)}Z · ${Math.round(M1.rows[1].efr)} lb`,
      },
    ],
    explanation: `Overhead Cutgrass at ${formatClock(M1.rows[1].eta)}Z with ${Math.round(M1.rows[1].efr)} lb. The log accumulates: each line starts where the one above it finished.`,
    difficulty: 3,
    source: TG(["4.13", "4.17"]),
  },
  {
    id: "nm1-s4",
    type: "numeric",
    unit: "n10",
    conceptIds: ["nav-flight-conduct", "nav-inflight-procedure"],
    skillIds: ["sk-inflight-wind"],
    prompt: `Eight minutes out you take a fix. Your track has been ${pad(M1.fixTrack)}° and the distance run works out at ${round1(M1.fixGs * M1.fixMinutes / 60)} NM. What wind is actually blowing?`,
    given: [
      { label: "Time since take-off", value: `${M1.fixMinutes} minutes` },
      { label: "True heading flown", value: `${pad(M1.rows[0].w.trueHeading)}°` },
      { label: "TAS", value: `${M1.tas} kt` },
      { label: "Track measured", value: `${pad(M1.fixTrack)}°` },
      { label: "Distance run", value: `${round1((M1.fixGs * M1.fixMinutes) / 60)} NM` },
    ],
    fields: [
      { key: "gs", label: "Actual groundspeed", unit: "kt", answer: M1.fixGs, tolerance: "logScale" },
      { key: "dir", label: "Wind direction", unit: "deg", answer: M1.actualWind.direction, tolerance: "inflightWindDirection", wraps: true },
      { key: "vel", label: "Wind velocity", unit: "kt", answer: M1.actualWind.velocity, tolerance: "windComponent" },
    ],
    allowedTools: ["cr3calc", "cr3wind", "chart", "scratch", "reference"],
    worked: [
      {
        action: "Groundspeed first: distance run over time flown.",
        tool: "cr3calc",
        result: `${Math.round(speedFor((M1.fixGs * M1.fixMinutes) / 60, M1.fixMinutes * 60))} kt`,
      },
      {
        action: `Compare: GS ${M1.fixGs > M1.tas ? "beats" : "is under"} TAS, and you drifted ${M1.fixTrack > M1.rows[0].w.trueHeading ? "right" : "left"} of the heading.`,
        detail: "That names the quarter before the wheel says anything.",
      },
      { action: "Set TAS over the index and the TRACK over the course index.", tool: "cr3wind" },
      {
        action: "Input the drift, read the crosswind, draw both components, rotate to twelve o'clock.",
        tool: "cr3wind",
        result: `${pad(M1.actualWind.direction)}° / ${M1.actualWind.velocity} kt`,
      },
    ],
    explanation: `${round1((M1.fixGs * M1.fixMinutes) / 60)} NM in ${M1.fixMinutes} minutes is ${M1.fixGs} kt, and with ${M1.actualWind.drift}° of ${M1.actualWind.driftSide === "R" ? "right" : "left"} drift the actual wind is ${pad(M1.actualWind.direction)}° at ${M1.actualWind.velocity} kt — not the ${pad(M1.wind[0])}/${M1.wind[1]} you planned on.`,
    difficulty: 3,
    source: TG(["4.11", "2.343"]),
  },
  {
    id: "nm1-s5",
    type: "numeric",
    unit: "n10",
    conceptIds: ["nav-flight-conduct", "nav-eta-update", "nav-efr-update"],
    skillIds: ["sk-update-eta", "sk-update-efr", "sk-plan-leg"],
    prompt: `Replan. From the fix, the new course direct to Longleaf measures ${pad(M1.newLeg.trueCourse)}° for ${round1(M1.newLeg.distance)} NM. Apply the actual wind and update the arrival and the fuel.`,
    given: [
      { label: "New true course", value: `${pad(M1.newLeg.trueCourse)}°` },
      { label: "Distance remaining", value: `${round1(M1.newLeg.distance)} NM` },
      { label: "Actual wind", value: `${pad(M1.actualWind.direction)}° / ${M1.actualWind.velocity} kt` },
      { label: "TAS", value: `${M1.tas} kt` },
      { label: "Fuel on board at the fix", value: `${Math.round(M1.fuelAtFix)} lb` },
      { label: "Time now", value: `${formatClock(M1.off + M1.fixMinutes)}Z` },
    ],
    fields: [
      { key: "th", label: "New true heading", unit: "deg", answer: M1.replan.trueHeading, tolerance: "inflightWindDirection", wraps: true },
      { key: "gs", label: "New groundspeed", unit: "kt", answer: M1.replan.groundspeed, tolerance: "logScale" },
      { key: "ete", label: "New ETE", unit: "elapsed", answer: M1.newEte, tolerance: "logScale" },
      {
        key: "eta",
        label: "New ETA Longleaf",
        unit: "clock",
        answer: Math.round(M1.off + M1.fixMinutes + M1.newEte / 60),
        tolerance: "exact",
      },
      {
        key: "efr",
        label: "EFR Longleaf",
        unit: "lb",
        answer: M1.fuelAtFix - fuelBurned(M1.flow, M1.newEte),
        tolerance: "logScale",
      },
    ],
    allowedTools: ["cr3wind", "cr3calc", "chart", "jetlog", "scratch", "reference"],
    worked: [
      {
        action: "Spin the ACTUAL wind against the NEW course — not the forecast against the old one.",
        tool: "cr3wind",
        result: `${pad(M1.replan.trueHeading)}° / ${M1.replan.groundspeed} kt`,
      },
      {
        action: "New ETE from the remaining distance and the new groundspeed.",
        tool: "cr3calc",
        result: formatElapsed(M1.newEte),
      },
      {
        action: "Add it to the current time, not to the original take-off time.",
        result: `${formatClock(M1.off + M1.fixMinutes + M1.newEte / 60)}Z`,
      },
      {
        action: "Fuel: start from what is on board now, and subtract the burn for the new ETE.",
        detail: "The eight minutes already flown have come out of the tanks whether or not they were in the plan.",
        tool: "cr3calc",
        result: `${Math.round(M1.fuelAtFix - fuelBurned(M1.flow, M1.newEte))} lb`,
      },
    ],
    explanation: `${pad(M1.replan.trueHeading)}° at ${M1.replan.groundspeed} kt gets you to Longleaf at ${formatClock(M1.off + M1.fixMinutes + M1.newEte / 60)}Z with ${Math.round(M1.fuelAtFix - fuelBurned(M1.flow, M1.newEte))} lb. The whole update runs from the fix forward — nothing is recovered by going back to the plan.`,
    knowCold: "Actual wind, new course, current time, current fuel.",
    difficulty: 3,
    source: TG(["4.16", "4.17"]),
  },
];

/* ================================================================== */
/* Mission 2 — offshore, on the TACAN                                 */
/* ================================================================== */

const M2 = (() => {
  const station = featureAt("tcn-driftwood");
  const from = { radial: 205, dme: 39 };
  const to = { radial: 140, dme: 18 };
  const tas = 160;
  const wind: [number, number] = [130, 20];
  const flow = 123;
  const fuel = 862;
  const off = parseClock("0200")!;

  const p2p = (() => {
    const a = { x: from.dme * Math.sin((from.radial * Math.PI) / 180), y: from.dme * Math.cos((from.radial * Math.PI) / 180) };
    const b = { x: to.dme * Math.sin((to.radial * Math.PI) / 180), y: to.dme * Math.cos((to.radial * Math.PI) / 180) };
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return {
      course: ((Math.round((Math.atan2(dx, dy) * 180) / Math.PI) % 360) + 360) % 360 || 360,
      distance: Math.hypot(dx, dy),
    };
  })();

  const variation = station.variationEast ?? 4;
  const trueCourse = magneticToTrue(p2p.course, variation);
  const w = preflightWind({ tas, trueCourse, windDirection: wind[0], windVelocity: wind[1] });
  const ete = timeFor(p2p.distance, w.groundspeed);
  const fixPoint = projectPoint(featureLatLon("tcn-driftwood"), magneticToTrue(from.radial, variation), from.dme);

  return { station, from, to, tas, wind, flow, fuel, off, p2p, variation, trueCourse, w, ete, fixPoint };
})();

const M2_QUESTIONS: NumericQuestion[] = [
  {
    id: "nm2-s1",
    type: "numeric",
    unit: "n9",
    conceptIds: ["nav-tacan-fix", "nav-variation-conversion"],
    skillIds: ["sk-tacan-fix", "sk-variation"],
    prompt: `You are offshore on the DRIFTWOOD ${pad(M2.from.radial)}° radial at ${M2.from.dme} DME. Plot the fix and pull the position.`,
    given: [
      { label: "Station", value: `DRIFTWOOD, ${formatLat(M2.station.lat)}, ${formatLon(M2.station.lonW)}` },
      { label: "Radial / DME", value: `${pad(M2.from.radial)}° / ${M2.from.dme} NM` },
      { label: "Variation", value: `${M2.variation}° East` },
    ],
    fields: [
      {
        key: "tr",
        label: "True radial to plot",
        unit: "deg",
        answer: magneticToTrue(M2.from.radial, M2.variation),
        tolerance: "direction",
        wraps: true,
      },
      {
        key: "lat",
        label: "Latitude, minutes",
        unit: "latMinutes",
        answer: (M2.fixPoint.lat - Math.floor(M2.fixPoint.lat)) * 60,
        tolerance: "latLong",
      },
      {
        key: "lon",
        label: "Longitude, minutes",
        unit: "lonMinutes",
        answer: (M2.fixPoint.lonW - Math.floor(M2.fixPoint.lonW)) * 60,
        tolerance: "latLong",
      },
    ],
    allowedTools: ["chart", "scratch", "reference"],
    worked: [
      {
        action: `Convert the radial: ${M2.from.radial} + ${M2.variation}.`,
        detail: "Magnetic to true, so east adds.",
        result: `${pad(magneticToTrue(M2.from.radial, M2.variation))}° true`,
      },
      { action: "Plot it out from DRIFTWOOD and mark the DME.", tool: "chart" },
      { action: "Pull the coordinates.", result: `${formatLat(M2.fixPoint.lat)}, ${formatLon(M2.fixPoint.lonW)}` },
    ],
    explanation: `${pad(M2.from.radial)}°M plus ${M2.variation}°E is ${pad(magneticToTrue(M2.from.radial, M2.variation))}°T, putting you at ${formatLat(M2.fixPoint.lat)}, ${formatLon(M2.fixPoint.lonW)}.`,
    difficulty: 3,
    source: TG(["4.7"]),
  },
  {
    id: "nm2-s2",
    type: "numeric",
    unit: "n9",
    conceptIds: ["nav-point-to-point"],
    skillIds: ["sk-point-to-point"],
    prompt: `Approach clears you direct to the DRIFTWOOD ${pad(M2.to.radial)}° radial at ${M2.to.dme} DME. Course and distance?`,
    given: [
      { label: "Present position", value: `${pad(M2.from.radial)}° / ${M2.from.dme} DME` },
      { label: "Cleared to", value: `${pad(M2.to.radial)}° / ${M2.to.dme} DME` },
    ],
    fields: [
      { key: "mc", label: "Magnetic course", unit: "deg", answer: M2.p2p.course, tolerance: "pointToPointCourse", wraps: true },
      { key: "d", label: "Distance", unit: "nm", answer: M2.p2p.distance, tolerance: "pointToPointDistance" },
    ],
    allowedTools: ["cr3wind", "scratch", "reference"],
    worked: [
      { action: "Treat the green grid as a map with DRIFTWOOD at its centre.", tool: "cr3wind" },
      { action: "Plot both fixes and circle the destination.", tool: "cr3wind" },
      {
        action: "Rotate until the line is vertical with the destination above, then read the course at the index.",
        tool: "cr3wind",
        result: `${pad(M2.p2p.course)}°M`,
      },
      { action: "Read the distance off the head/tail scale.", result: `${Math.round(M2.p2p.distance)} NM` },
    ],
    explanation: `${pad(M2.p2p.course)}° magnetic for ${Math.round(M2.p2p.distance)} NM. No variation is applied — the radials were magnetic and so is the answer.`,
    difficulty: 3,
    source: TG(["2.344"]),
  },
  {
    id: "nm2-s3",
    type: "numeric",
    unit: "n10",
    conceptIds: ["nav-preflight-procedure", "nav-eta-update", "nav-efr-update"],
    skillIds: ["sk-preflight-wind", "sk-update-eta", "sk-update-efr"],
    prompt: `Apply the wind to that leg and work out when you arrive and with what fuel. Wind ${pad(M2.wind[0])}° at ${M2.wind[1]} kt, TAS ${M2.tas} kt, fuel flow ${M2.flow} pph, ${M2.fuel} lb on board, time now 0204Z.`,
    given: [
      { label: "Magnetic course", value: `${pad(M2.p2p.course)}°` },
      { label: "True course", value: `${pad(M2.trueCourse)}° (variation ${M2.variation}°E)` },
      { label: "Distance", value: `${round1(M2.p2p.distance)} NM` },
      { label: "Wind", value: `${pad(M2.wind[0])}° / ${M2.wind[1]} kt` },
      { label: "TAS", value: `${M2.tas} kt` },
      { label: "Fuel flow", value: `${M2.flow} pph` },
      { label: "Fuel on board", value: `${M2.fuel} lb` },
    ],
    fields: [
      { key: "gs", label: "Groundspeed", unit: "kt", answer: M2.w.groundspeed, tolerance: "logScale" },
      { key: "ete", label: "ETE", unit: "elapsed", answer: M2.ete, tolerance: "logScale" },
      {
        key: "eta",
        label: "ETA",
        unit: "clock",
        answer: Math.round(parseClock("0204")! + M2.ete / 60),
        tolerance: "exact",
      },
      {
        key: "efr",
        label: "Fuel remaining",
        unit: "lb",
        answer: M2.fuel - fuelBurned(M2.flow, M2.ete),
        tolerance: "logScale",
      },
    ],
    estimate: {
      prompt: "The wind is nearly on the nose of this course. Roughly how long for the leg?",
      options: ["Under five minutes", "Five to fifteen minutes", "Fifteen to thirty minutes", "Over half an hour"],
      answer: M2.ete < 300 ? 0 : M2.ete < 900 ? 1 : M2.ete < 1800 ? 2 : 3,
      why: `About ${Math.round(M2.w.groundspeed / 60)} NM a minute over ${round1(M2.p2p.distance)} NM.`,
    },
    allowedTools: ["cr3wind", "cr3calc", "jetlog", "scratch", "reference"],
    worked: [
      {
        action: "The wind is true and the course you read was magnetic. Convert the course to true before spinning the wind.",
        detail: `${pad(M2.p2p.course)} + ${M2.variation} = ${pad(M2.trueCourse)}°T.`,
        result: `${pad(M2.trueCourse)}°T`,
      },
      {
        action: "Spin the wind against the true course.",
        tool: "cr3wind",
        result: `${pad(M2.w.trueHeading)}° / ${M2.w.groundspeed} kt`,
      },
      { action: "Time from distance and groundspeed.", tool: "cr3calc", result: formatElapsed(M2.ete) },
      {
        action: "Fuel from the flow and that time, then subtract.",
        tool: "cr3calc",
        result: `${Math.round(M2.fuel - fuelBurned(M2.flow, M2.ete))} lb`,
      },
    ],
    explanation: `Convert the magnetic course to true first — the winds aloft are true. Then ${M2.w.groundspeed} kt gives ${formatElapsed(M2.ete)}, arriving ${formatClock(parseClock("0204")! + M2.ete / 60)}Z with ${Math.round(M2.fuel - fuelBurned(M2.flow, M2.ete))} lb.`,
    knowCold: "Winds aloft are TRUE. Convert the course before you spin them.",
    difficulty: 3,
    source: TG(["4.15", "4.16", "4.17"]),
  },
];

/* ================================================================== */

export const MISSION_QUESTIONS: NumericQuestion[] = [...M1_QUESTIONS, ...M2_QUESTIONS];

export const MISSIONS: Mission[] = [
  {
    id: "nmission-cross-country",
    title: "Brackish to Cutgrass",
    subtitle: "Plan two legs, fly one, then replan the rest",
    unit: "n10",
    skillIds: [
      "sk-measure-direction",
      "sk-measure-distance",
      "sk-variation",
      "sk-preflight-wind",
      "sk-tsd",
      "sk-fuel-rate",
      "sk-jetlog",
      "sk-inflight-wind",
      "sk-update-eta",
      "sk-update-efr",
    ],
    situation: [
      { label: "Route", value: "Brackish Field → Longleaf Muni → Cutgrass" },
      { label: "TAS", value: `${M1.tas} kt` },
      { label: "Forecast wind", value: `${pad(M1.wind[0])}° / ${M1.wind[1]} kt` },
      { label: "Fuel flow", value: `${M1.flow} pph` },
      { label: "Fuel on board", value: `${M1.fuelStart} lb` },
      { label: "Take-off", value: "1400Z" },
    ],
    stages: [
      {
        id: "nm1-stage-measure",
        title: "Measure the route",
        brief: "Chart out. Draw both legs, measure the courses and the distances, apply the variation.",
        questionIds: ["nm1-s1"],
      },
      {
        id: "nm1-stage-wind",
        title: "Work the winds",
        brief: "One forecast wind, two courses. Estimate each quarter before you touch the wheel.",
        questionIds: ["nm1-s2"],
      },
      {
        id: "nm1-stage-log",
        title: "Fill the log",
        brief: "Times, fuel, and the running totals down the en-route section.",
        questionIds: ["nm1-s3"],
      },
      {
        id: "nm1-stage-fix",
        title: "Take a fix",
        brief: "Eight minutes out, the aircraft is not where the plan said. Find out what the wind is really doing.",
        questionIds: ["nm1-s4"],
      },
      {
        id: "nm1-stage-replan",
        title: "Replan from the fix",
        brief: "New course, actual wind, current clock, current fuel. Nothing is recovered by going back to the line.",
        questionIds: ["nm1-s5"],
      },
    ],
    jetLogLegs: ["Brackish Field", "Longleaf Muni", "Cutgrass"],
    source: TG(["4.11", "4.12", "4.13", "4.16", "4.17"]),
  },
  {
    id: "nmission-offshore",
    title: "Offshore on the TACAN",
    subtitle: "Fix, go direct, and land the fuel plan",
    unit: "n9",
    skillIds: [
      "sk-tacan-fix",
      "sk-variation",
      "sk-point-to-point",
      "sk-preflight-wind",
      "sk-update-eta",
      "sk-update-efr",
    ],
    situation: [
      { label: "Station", value: `DRIFTWOOD, channel ${M2.station.channel}` },
      { label: "Present position", value: `${pad(M2.from.radial)}° / ${M2.from.dme} DME` },
      { label: "TAS", value: `${M2.tas} kt` },
      { label: "Wind", value: `${pad(M2.wind[0])}° / ${M2.wind[1]} kt` },
      { label: "Fuel flow", value: `${M2.flow} pph` },
      { label: "Fuel on board", value: `${M2.fuel} lb` },
      { label: "Time", value: "0204Z" },
    ],
    stages: [
      {
        id: "nm2-stage-fix",
        title: "Where are you?",
        brief: "Convert the radial, plot it, and pull the position off the chart.",
        questionIds: ["nm2-s1"],
      },
      {
        id: "nm2-stage-direct",
        title: "Cleared direct",
        brief: "Point to point on the CR-3. Two dots, one line, rotate it vertical.",
        questionIds: ["nm2-s2"],
      },
      {
        id: "nm2-stage-fuel",
        title: "When, and with what",
        brief: "Winds aloft are true and your course is magnetic. Convert before you spin.",
        questionIds: ["nm2-s3"],
      },
    ],
    source: TG(["4.7", "2.344", "4.16", "4.17"]),
  },
];
