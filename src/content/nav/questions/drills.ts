import type { NumericQuestion, SourceReference } from "@/lib/types";
import {
  DISTANCE_PROBLEMS,
  FUEL_CONVERSION_PROBLEMS,
  FUEL_PROBLEMS,
  INFLIGHT_WIND_PROBLEMS,
  PREFLIGHT_WIND_PROBLEMS,
  SPEED_PROBLEMS,
  TAS_PROBLEMS,
  TIME_PROBLEMS,
  TIME_ZONE_PROBLEMS,
} from "@/lib/nav/official-data";
import {
  distanceFor,
  enduranceSeconds,
  formatElapsed,
  fuelBurned,
  fuelFlowFor,
  gallonsToPounds,
  localToZulu,
  machFromCas,
  parseClock,
  parseElapsed,
  poundsToGallons,
  pressureAltitude,
  speedFor,
  timeFor,
  trueAirspeed,
  zuluToLocal,
} from "@/lib/nav/math";

/**
 * The reps.
 *
 * These are not lookalike problems — they are the actual sets the trainee
 * guide assigns, all 187 of them, turned into gradeable work. Generating
 * imitations when the real ones are published and keyed would have been
 * strictly worse: worse provenance, worse coverage of the awkward cases the
 * course deliberately includes, and no way to check the answers against
 * anything but my own arithmetic.
 *
 * Each answer is recomputed here from src/lib/nav/math.ts rather than copied
 * from the printed key, and math.test.ts proves those two agree across the
 * whole set. That way the grader's tolerance is applied to an exact value
 * instead of to a number someone read off a plastic wheel in 2017.
 */

const RATE = (chapter: string, eo: string[]): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter,
  eo,
});

const CH3 = "CR-3 Air Navigation Computer";
const CH2 = "Chart Projections, Plotting and Global Timekeeping";
const CH4 = "Airspeeds";
const CH5 = "Preflight Winds";
const CH6 = "In Flight Winds";

const pad = (n: number) => String(n).padStart(3, "0");

/** Every drill answer is graded on the log scale unless the guide says otherwise. */
const LOG = "logScale" as const;

/* ------------------------------------------------------------------ */
/* Time, speed and distance                                            */
/* ------------------------------------------------------------------ */

/** Whether a problem belongs on the seconds bug, by the guide's own triggers. */
function usesHighSpeedIndex(speedKt: number, distanceNm: number, seconds: number): boolean {
  return seconds <= 300 || distanceNm <= 5 || speedKt >= 500;
}

function indexName(highSpeed: boolean): string {
  return highSpeed ? "high-speed index (SEC, at 36)" : "rate index (at 60)";
}

const TIME_DRILLS: NumericQuestion[] = TIME_PROBLEMS.map((row, i) => {
  const seconds = timeFor(row.d, row.s);
  const highSpeed = usesHighSpeedIndex(row.s, row.d, seconds);
  const perMinute = row.s / 60;
  return {
    id: `nq-tsd-t${pad(i + 1)}`,
    type: "numeric",
    unit: "n6",
    conceptIds: ["nav-ratio", "nav-rate-index", highSpeed ? "nav-high-speed-index" : "nav-rule-of-60"],
    skillIds: ["sk-tsd", "sk-estimate"],
    prompt: `How long will it take to cover ${row.d} NM at a groundspeed of ${row.s} kt?`,
    given: [
      { label: "Distance", value: `${row.d} NM` },
      { label: "Groundspeed", value: `${row.s} kt` },
    ],
    fields: [{ key: "t", label: "Time en route", unit: "elapsed", answer: seconds, tolerance: LOG }],
    allowedTools: ["cr3calc", "scratch"],
    worked: [
      {
        action: `Estimate. At ${row.s} kt you cover about ${perMinute.toFixed(1)} NM a minute.`,
        detail: "Rule of 60: groundspeed over sixty is miles per minute.",
        result: `≈ ${formatElapsed(Math.round(seconds / 30) * 30)}`,
      },
      {
        action: `Set ${row.s} on the outer scale over the ${indexName(highSpeed)}.`,
        tool: "cr3calc",
      },
      {
        action: `Find ${row.d} on the outer scale and read the time beneath it.`,
        tool: "cr3calc",
        result: formatElapsed(seconds),
      },
      {
        action: "Place the decimal from the estimate, not from the wheel.",
        detail: "The printed digits are the same for 14 minutes and 140; only your estimate separates them.",
      },
    ],
    explanation: `${row.d} NM at ${row.s} kt is ${formatElapsed(seconds)}. Set the speed over the ${indexName(highSpeed)}, find the distance on the outer scale, read the time below.`,
    difficulty: highSpeed ? 2 : 1,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH3, ["4.9"]),
  };
});

const SPEED_DRILLS: NumericQuestion[] = SPEED_PROBLEMS.map((row, i) => {
  const seconds = parseElapsed(row.t)!;
  const kt = speedFor(row.d, seconds);
  const highSpeed = usesHighSpeedIndex(kt, row.d, seconds);
  return {
    id: `nq-tsd-s${pad(i + 1)}`,
    type: "numeric",
    unit: "n6",
    conceptIds: ["nav-ratio", "nav-rate-index", "nav-dr-components"],
    skillIds: ["sk-tsd", "sk-estimate"],
    prompt: `What groundspeed covers ${row.d} NM in ${row.t}?`,
    given: [
      { label: "Distance", value: `${row.d} NM` },
      { label: "Time", value: row.t },
    ],
    fields: [{ key: "gs", label: "Groundspeed", unit: "kt", answer: kt, tolerance: LOG }],
    allowedTools: ["cr3calc", "scratch"],
    worked: [
      {
        action: "Estimate. How many times does the time go into an hour?",
        detail: `${(3600 / seconds).toFixed(1)} times, so the speed is about that many times ${row.d}.`,
        result: `≈ ${Math.round(kt / 10) * 10} kt`,
      },
      {
        action: `Set ${row.d} on the outer scale over ${highSpeed ? `${seconds} seconds` : `${(seconds / 60).toFixed(0)} minutes`} on the inner.`,
        tool: "cr3calc",
      },
      {
        action: `Read the speed above the ${indexName(highSpeed)}.`,
        tool: "cr3calc",
        result: `${Math.round(kt)} kt`,
      },
    ],
    explanation: `${row.d} NM in ${row.t} is ${Math.round(kt)} kt. Distance over time, then read above the ${indexName(highSpeed)}.`,
    difficulty: highSpeed ? 2 : 1,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH3, ["4.9"]),
  };
});

const DISTANCE_DRILLS: NumericQuestion[] = DISTANCE_PROBLEMS.map((row, i) => {
  const seconds = parseElapsed(row.t)!;
  const nm = distanceFor(row.s, seconds);
  const highSpeed = usesHighSpeedIndex(row.s, nm, seconds);
  return {
    id: `nq-tsd-d${pad(i + 1)}`,
    type: "numeric",
    unit: "n6",
    conceptIds: ["nav-ratio", "nav-rule-of-6", "nav-dr-components"],
    skillIds: ["sk-tsd", "sk-estimate"],
    prompt: `How far will you travel in ${row.t} at ${row.s} kt?`,
    given: [
      { label: "Groundspeed", value: `${row.s} kt` },
      { label: "Time", value: row.t },
    ],
    fields: [{ key: "d", label: "Distance", unit: "nm", answer: nm, tolerance: LOG }],
    allowedTools: ["cr3calc", "scratch"],
    worked: [
      {
        action: `Estimate. ${row.s} kt is ${(row.s / 60).toFixed(1)} NM a minute.`,
        result: `≈ ${Math.round(nm / 10) * 10 || Math.round(nm * 10) / 10} NM`,
      },
      {
        action: `Set ${row.s} over the ${indexName(highSpeed)}.`,
        tool: "cr3calc",
      },
      {
        action: `Find the time on the inner scale and read the distance above it.`,
        tool: "cr3calc",
        result: `${nm < 10 ? nm.toFixed(1) : Math.round(nm)} NM`,
      },
    ],
    explanation: `At ${row.s} kt, ${row.t} covers ${nm < 10 ? nm.toFixed(1) : Math.round(nm)} NM. One setup on the ${indexName(highSpeed)}, then read above the time.`,
    difficulty: highSpeed ? 2 : 1,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH3, ["4.9"]),
  };
});

/* ------------------------------------------------------------------ */
/* Fuel                                                                */
/* ------------------------------------------------------------------ */

const FUEL_DRILLS: NumericQuestion[] = FUEL_PROBLEMS.map((row, i) => {
  const id = `nq-fuel-${pad(i + 1)}`;
  const base = {
    type: "numeric" as const,
    unit: "n6",
    conceptIds: ["nav-fuel-consumption", "nav-ratio", "nav-rate-index"],
    skillIds: ["sk-fuel-rate", "sk-estimate"],
    allowedTools: ["cr3calc", "scratch"] as NumericQuestion["allowedTools"],
    difficulty: 1 as const,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH3, ["4.10"]),
  };

  if (row.solve === "quantity") {
    const seconds = parseElapsed(row.time!)!;
    const lb = fuelBurned(row.flow!, seconds);
    return {
      ...base,
      id,
      prompt: `How much fuel is burned in ${row.time} at ${row.flow} pph?`,
      given: [
        { label: "Fuel flow", value: `${row.flow} pph` },
        { label: "Time", value: row.time! },
      ],
      fields: [{ key: "lb", label: "Fuel consumed", unit: "lb", answer: lb, tolerance: LOG }],
      worked: [
        {
          action: `Estimate. ${(seconds / 3600).toFixed(1)} hours at ${row.flow} pph.`,
          result: `≈ ${Math.round(lb / 100) * 100 || Math.round(lb)} lb`,
        },
        { action: `Set ${row.flow} over the rate index.`, tool: "cr3calc" },
        {
          action: `Convert the time to minutes, find it on the inner scale, read the fuel above.`,
          detail: `${row.time} is ${Math.round(seconds / 60)} minutes.`,
          tool: "cr3calc",
          result: `${Math.round(lb)} lb`,
        },
      ],
      explanation: `${row.flow} pph for ${row.time} burns ${Math.round(lb)} lb. Fuel is the same rate problem as distance, with pounds on the outer scale.`,
    };
  }

  if (row.solve === "flow") {
    const seconds = parseElapsed(row.time!)!;
    const pph = fuelFlowFor(row.quantity!, seconds);
    return {
      ...base,
      id,
      prompt: `What fuel flow burns ${row.quantity} lb in ${row.time}?`,
      given: [
        { label: "Fuel consumed", value: `${row.quantity} lb` },
        { label: "Time", value: row.time! },
      ],
      fields: [{ key: "pph", label: "Fuel flow", unit: "pph", answer: pph, tolerance: LOG }],
      worked: [
        {
          action: `Estimate. ${(3600 / seconds).toFixed(1)} of those periods make an hour.`,
          result: `≈ ${Math.round(pph / 100) * 100 || Math.round(pph)} pph`,
        },
        {
          action: `Set ${row.quantity} on the outer scale over ${Math.round(seconds / 60)} minutes.`,
          tool: "cr3calc",
        },
        { action: "Read the flow above the rate index.", tool: "cr3calc", result: `${Math.round(pph)} pph` },
      ],
      explanation: `${row.quantity} lb in ${row.time} is ${Math.round(pph)} pph. Set the pair, then read the hourly rate above the rate index.`,
    };
  }

  const seconds = enduranceSeconds(row.quantity!, row.flow!);
  return {
    ...base,
    id,
    prompt: `How long will ${row.quantity} lb last at ${row.flow} pph?`,
    given: [
      { label: "Fuel available", value: `${row.quantity} lb` },
      { label: "Fuel flow", value: `${row.flow} pph` },
    ],
    fields: [{ key: "t", label: "Endurance", unit: "elapsed", answer: seconds, tolerance: LOG }],
    worked: [
      {
        action: `Estimate. ${row.quantity} divided by ${row.flow} is roughly ${(row.quantity! / row.flow!).toFixed(1)} hours.`,
        result: `≈ ${Math.round(seconds / 3600)} h`,
      },
      { action: `Set ${row.flow} over the rate index.`, tool: "cr3calc" },
      {
        action: `Find ${row.quantity} on the outer scale and read the time beneath it.`,
        tool: "cr3calc",
        result: formatElapsed(seconds),
      },
      { action: "Read the hour circle underneath to get hours and minutes.", tool: "cr3calc" },
    ],
    explanation: `${row.quantity} lb at ${row.flow} pph lasts ${formatElapsed(seconds)}. Same setup as fuel burned, read the other way.`,
  };
});

const FUEL_CONVERSION_DRILLS: NumericQuestion[] = FUEL_CONVERSION_PROBLEMS.map((row, i) => {
  const toPounds = row.solve === "pounds";
  const value = toPounds
    ? gallonsToPounds(row.gallons!, row.lbsPerGal)
    : poundsToGallons(row.pounds!, row.lbsPerGal);
  return {
    id: `nq-fuelconv-${pad(i + 1)}`,
    type: "numeric",
    unit: "n6",
    conceptIds: ["nav-fuel-conversion", "nav-unit-index"],
    // A conversion is a plain ratio with no time in it, so it exercises the
    // ratio setup as directly as anything on the calculation side does.
    skillIds: ["sk-fuel-convert", "sk-ratio", "sk-estimate"],
    prompt: toPounds
      ? `What do ${row.gallons} gallons weigh at ${row.lbsPerGal} lb per gallon?`
      : `How many gallons is ${row.pounds} lb at ${row.lbsPerGal} lb per gallon?`,
    given: [
      { label: "Fuel weight", value: `${row.lbsPerGal} lb/gal` },
      toPounds
        ? { label: "Gallons", value: `${row.gallons} gal` }
        : { label: "Pounds", value: `${row.pounds} lb` },
    ],
    fields: [
      {
        key: "v",
        label: toPounds ? "Total weight" : "Total gallons",
        unit: toPounds ? "lb" : "gal",
        answer: value,
        tolerance: LOG,
      },
    ],
    estimate: {
      prompt: "Before you turn anything: which is the bigger number here?",
      options: ["The pounds", "The gallons", "They are equal"],
      answer: 0,
      why: "There are always more pounds than gallons. If a conversion comes out the other way round, the setup is inverted.",
    },
    allowedTools: ["cr3calc", "scratch"],
    worked: [
      {
        action: `Estimate by rounding the fuel weight to ${Math.round(row.lbsPerGal)}.`,
        result: `≈ ${toPounds ? Math.round((row.gallons! * Math.round(row.lbsPerGal)) / 100) * 100 : Math.round(row.pounds! / Math.round(row.lbsPerGal) / 100) * 100}`,
      },
      {
        action: `Set ${row.lbsPerGal} on the outer scale over 10 on the inner — the unit index.`,
        detail: "There is no time in this problem, so the rate index is the wrong mark.",
        tool: "cr3calc",
      },
      {
        action: toPounds
          ? `Find ${row.gallons} on the inner scale and read the weight above it.`
          : `Find ${row.pounds} on the outer scale and read the gallons below it.`,
        tool: "cr3calc",
        result: `${Math.round(value)} ${toPounds ? "lb" : "gal"}`,
      },
    ],
    explanation: `At ${row.lbsPerGal} lb per gallon the answer is ${Math.round(value)} ${toPounds ? "lb" : "gal"}. Conversions run off the unit index, because no time is involved.`,
    difficulty: 1,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH3, ["4.10"]),
  };
});

/* ------------------------------------------------------------------ */
/* Global timekeeping                                                  */
/* ------------------------------------------------------------------ */

const ZULU_DRILLS: NumericQuestion[] = TIME_ZONE_PROBLEMS.map((row, i) => {
  const toLocal = row.solve === "lmt";
  const input = parseClock((toLocal ? row.gmt : row.lmt)!)!;
  const result = toLocal ? zuluToLocal(input, row.zd) : localToZulu(input, row.zd);
  const zdText = `${row.zd >= 0 ? "+" : "−"}${Math.abs(row.zd)}`;
  return {
    id: `nq-zulu-${pad(i + 1)}`,
    type: "numeric",
    unit: "n4",
    conceptIds: ["nav-zulu-conversion", "nav-zone-description", "nav-gmt"],
    skillIds: ["sk-zulu"],
    prompt: toLocal
      ? `It is ${row.gmt}Z in a zone described ${zdText}. What is the local mean time?`
      : `Local mean time is ${row.lmt} in a zone described ${zdText}. What is Zulu?`,
    given: [
      { label: "Zone description", value: zdText },
      toLocal ? { label: "GMT", value: `${row.gmt}Z` } : { label: "LMT", value: row.lmt! },
    ],
    fields: [
      {
        key: "t",
        label: toLocal ? "Local mean time" : "Greenwich mean time",
        unit: "clock",
        answer: result.minutes,
        tolerance: "exact",
      },
    ],
    allowedTools: ["timezone", "scratch"],
    worked: [
      {
        action: toLocal ? "Write the formula: LMT = GMT + (ZD)." : "Write the formula: GMT = LMT − (ZD).",
        detail: "Keep the brackets. They are the whole reason the sign works out.",
      },
      {
        action: `Substitute: ${toLocal ? `${row.gmt} + (${zdText})` : `${row.lmt} − (${zdText})`}.`,
        detail:
          row.zd < 0
            ? "Subtracting a negative adds; adding a negative subtracts."
            : "A positive zone description is east of Greenwich.",
      },
      { action: "Read the answer.", result: `${result.text}${toLocal ? "" : "Z"}` },
    ],
    explanation: `${toLocal ? "LMT = GMT + (ZD)" : "GMT = LMT − (ZD)"}, so the answer is ${result.text}${toLocal ? "" : "Z"}. Watch the sign — a negative zone description reverses the operation.`,
    difficulty: row.zd < 0 ? 2 : 1,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH2, ["4.2"]),
  };
});

/* ------------------------------------------------------------------ */
/* Airspeed                                                            */
/* ------------------------------------------------------------------ */

/** The rows that print a calibrated altitude and a setting can be worked end to end. */
const TAS_DRILLS: NumericQuestion[] = TAS_PROBLEMS.filter(
  (row) => row.calt !== undefined && row.altim !== undefined && machFromCas(row.cas, row.pa) < 1,
).map((row, i) => {
  const pa = pressureAltitude(row.calt!, row.altim!);
  const tas = trueAirspeed(row.cas, pa, row.oat);
  const mach = machFromCas(row.cas, pa);
  const lags = row.altim! < 29.92 ? "less than 29.92, so ADD" : row.altim! > 29.92 ? "greater than 29.92, so SUBTRACT" : "exactly 29.92, so no correction";
  return {
    id: `nq-tas-${pad(i + 1)}`,
    type: "numeric",
    unit: "n7",
    conceptIds: ["nav-pressure-altitude", "nav-tas", "nav-tas-procedure", "nav-density-effect"],
    skillIds: ["sk-pressure-altitude", "sk-tas", "sk-mach"],
    prompt: `Calibrated altitude ${row.calt!.toLocaleString()} ft, altimeter ${row.altim!.toFixed(2)}", OAT ${row.oat > 0 ? "+" : ""}${row.oat} °C, CAS ${row.cas} kt. Find the pressure altitude, the true airspeed and the Mach number.`,
    given: [
      { label: "Calibrated altitude", value: `${row.calt!.toLocaleString()} ft` },
      { label: "Altimeter setting", value: `${row.altim!.toFixed(2)}"` },
      { label: "OAT", value: `${row.oat > 0 ? "+" : ""}${row.oat} °C` },
      { label: "CAS", value: `${row.cas} kt` },
    ],
    fields: [
      { key: "pa", label: "Pressure altitude", unit: "ft", answer: pa, tolerance: "exact" },
      { key: "tas", label: "True airspeed", unit: "kt", answer: tas, tolerance: "trueAirspeed" },
      { key: "mach", label: "Mach number", unit: "mach", answer: mach, tolerance: "mach" },
    ],
    estimate: {
      prompt: "Before the wheel: will true airspeed be above or below the calibrated airspeed?",
      options: ["Above", "Below", "The same"],
      answer: tas >= row.cas ? 0 : 1,
      why:
        tas >= row.cas
          ? "Thinner air up here, so the aircraft has to move faster through it to give the same pitot pressure. TAS beats CAS."
          : "Cold and low: the air is denser than standard, so true airspeed comes out under calibrated. It is unusual, and worth noticing.",
    },
    allowedTools: ["cr3calc", "scratch", "reference"],
    worked: [
      {
        action: `Pressure altitude first. The setting is ${lags}.`,
        detail: `The difference from 29.92 is ${Math.abs(row.altim! - 29.92).toFixed(2)}", worth ${Math.abs(Math.round((29.92 - row.altim!) * 1000))} ft.`,
        result: `${Math.round(pa).toLocaleString()} ft`,
      },
      {
        action: `Set CAS ${row.cas} over pressure altitude ${Math.round(pa).toLocaleString()} in the window.`,
        detail: "Careful — those two scales increase in opposite directions.",
        tool: "cr3calc",
      },
      {
        action: `Put the hairline where the ${row.oat > 0 ? "+" : ""}${row.oat} °C curve crosses the Mach spiral, then read TAS below it.`,
        tool: "cr3calc",
        result: `${Math.round(tas)} kt`,
      },
      {
        action: "Read the Mach number at the index in the same window.",
        detail: "No temperature needed for Mach — the same setting already carries it.",
        tool: "cr3calc",
        result: mach.toFixed(3),
      },
    ],
    explanation: `${lags.split(",")[0]} gives ${Math.round(pa).toLocaleString()} ft pressure altitude; that with ${row.cas} kt CAS and ${row.oat} °C reads ${Math.round(tas)} kt TAS and Mach ${mach.toFixed(2)}.`,
    difficulty: 3,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH4, ["2.340", "2.341"]),
  };
});

/* ------------------------------------------------------------------ */
/* Winds                                                               */
/* ------------------------------------------------------------------ */

const PREFLIGHT_DRILLS: NumericQuestion[] = PREFLIGHT_WIND_PROBLEMS.map((row, i) => {
  const strong = row.vel >= 70;
  const componentTolerance = strong ? "windComponentStrong" : "windComponent";
  const directionTolerance = strong ? "inflightWindDirectionStrong" : "inflightWindDirection";
  const quarter = `${row.xwSide === "R" ? "right" : "left"} ${row.htType === "H" ? "head" : "tail"}`;
  return {
    id: `nq-pfw-${pad(i + 1)}`,
    type: "numeric",
    unit: "n8",
    conceptIds: ["nav-preflight-procedure", "nav-wind-triangle", "nav-quartering", "nav-crab-drift"],
    skillIds: ["sk-preflight-wind", "sk-quartering"],
    prompt: `True course ${pad(row.tc)}° at ${row.tas} kt TAS, with the wind forecast ${pad(row.dir)}° at ${row.vel} kt. What heading do you fly, and what groundspeed do you expect?`,
    given: [
      { label: "True course", value: `${pad(row.tc)}°` },
      { label: "TAS", value: `${row.tas} kt` },
      { label: "Wind", value: `${pad(row.dir)}° / ${row.vel} kt` },
    ],
    fields: [
      {
        key: "xw",
        label: "Crosswind component",
        unit: "kt",
        answer: row.xw,
        tolerance: componentTolerance,
        qualifier: { options: ["L", "R"], answer: row.xwSide, label: "which side" },
      },
      {
        key: "ht",
        label: "Head or tail component",
        unit: "kt",
        answer: row.ht,
        tolerance: componentTolerance,
        qualifier: { options: ["H", "T"], answer: row.htType, label: "head or tail" },
      },
      { key: "th", label: "True heading", unit: "deg", answer: row.th, tolerance: directionTolerance, wraps: true },
      { key: "gs", label: "Groundspeed", unit: "kt", answer: row.gs, tolerance: LOG },
    ],
    estimate: {
      prompt: "Quartering analysis first. What kind of wind is this?",
      options: ["Left head", "Right head", "Left tail", "Right tail"],
      answer: ["Left head", "Right head", "Left tail", "Right tail"].indexOf(
        `${row.xwSide === "R" ? "Right" : "Left"} ${row.htType === "H" ? "head" : "tail"}`,
      ),
      why: `A ${quarter} wind means heading goes ${row.xwSide === "R" ? "right of" : "left of"} course and groundspeed comes out ${row.htType === "H" ? "under" : "over"} true airspeed. Check the wheel against that before you trust it.`,
    },
    allowedTools: ["cr3wind", "cr3calc", "scratch", "reference"],
    worked: [
      {
        action: "Estimate. Sketch the wind against the course and name the quarter.",
        detail: `This one is a ${quarter}.`,
        result: `TH ${row.xwSide === "R" ? ">" : "<"} TC, GS ${row.htType === "H" ? "<" : ">"} TAS`,
      },
      {
        action: `Plot the wind: set ${pad(row.dir)}° over the course index and mark ${row.vel} kt on the ${row.vel < 60 ? "large" : "small"} scale.`,
        tool: "cr3wind",
      },
      { action: `Set ${row.tas} kt over the TAS index.`, tool: "cr3wind" },
      {
        action: `Rotate the rose to put ${pad(row.tc)}° at the course index, then check the estimate.`,
        tool: "cr3wind",
      },
      {
        action: "Read the crosswind and the head/tail component off the grid.",
        tool: "cr3wind",
        result: `${row.xw} kt ${row.xwSide} · ${row.ht} kt ${row.htType}`,
      },
      {
        action: `Apply the component to TAS for groundspeed.`,
        detail: `${row.tas} ${row.htType === "H" ? "−" : "+"} ${row.ht}.`,
        result: `${row.gs} kt`,
      },
      {
        action: `Put ${row.xw} on the outer scale and read the crab under it.`,
        detail: `Ten percent of ${row.tas} is ${(row.tas * 0.1).toFixed(0)} kt, which would be 6° — so expect about ${row.crab}°.`,
        tool: "cr3wind",
        result: `${row.crab}° ${row.crabSide}`,
      },
      {
        action: `Apply the crab to the course.`,
        result: `TH ${pad(row.th)}°`,
      },
    ],
    explanation: `A ${quarter} wind: ${row.xw} kt across and ${row.ht} kt ${row.htType === "H" ? "on the nose" : "behind"}. Crab ${row.crab}° ${row.crabSide === "L" ? "left" : "right"} for a heading of ${pad(row.th)}°, and groundspeed ${row.gs} kt.`,
    difficulty: strong ? 3 : 2,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH5, ["4.15"]),
  };
});

const INFLIGHT_DRILLS: NumericQuestion[] = INFLIGHT_WIND_PROBLEMS.map((row, i) => {
  const strong = row.vel >= 70;
  return {
    id: `nq-ifw-${pad(i + 1)}`,
    type: "numeric",
    unit: "n9",
    conceptIds: ["nav-inflight-procedure", "nav-inflight-theory", "nav-inflight-estimate", "nav-crab-drift"],
    skillIds: ["sk-inflight-wind"],
    prompt: `You are heading ${pad(row.th)}° at ${row.tas} kt TAS. The fix gives a track of ${pad(row.trk)}° and a groundspeed of ${row.gs} kt. What wind is actually blowing?`,
    given: [
      { label: "True heading", value: `${pad(row.th)}°` },
      { label: "TAS", value: `${row.tas} kt` },
      { label: "Track", value: `${pad(row.trk)}°` },
      { label: "Groundspeed", value: `${row.gs} kt` },
    ],
    fields: [
      {
        key: "da",
        label: "Drift angle",
        unit: "deg",
        answer: row.da,
        tolerance: "pointToPointCourse",
        qualifier: { options: ["L", "R"], answer: row.daSide, label: "which way" },
      },
      {
        key: "dir",
        label: "Wind direction",
        unit: "deg",
        answer: row.dir,
        tolerance: strong ? "inflightWindDirectionStrong" : "inflightWindDirection",
        wraps: true,
      },
      {
        key: "vel",
        label: "Wind velocity",
        unit: "kt",
        answer: row.vel,
        tolerance: strong ? "windComponentStrong" : "windComponent",
      },
    ],
    estimate: {
      prompt: "Before the wheel: what kind of wind must this be?",
      options: ["Left head", "Right head", "Left tail", "Right tail"],
      answer: ["Left head", "Right head", "Left tail", "Right tail"].indexOf(
        `${row.xwSide === "R" ? "Right" : "Left"} ${row.htType === "H" ? "head" : "tail"}`,
      ),
      why: `Groundspeed is ${row.htType === "H" ? "below" : "above"} TAS, so it is a ${row.htType === "H" ? "head" : "tail"}wind. You drifted ${row.daSide === "R" ? "right" : "left"}, which takes a wind from the ${row.xwSide === "R" ? "right" : "left"}.`,
    },
    allowedTools: ["cr3wind", "cr3calc", "scratch", "reference"],
    worked: [
      {
        action: "Estimate. Compare groundspeed to TAS, then heading to track.",
        detail: `GS ${row.htType === "H" ? "<" : ">"} TAS is a ${row.htType === "H" ? "head" : "tail"}wind; drifting ${row.daSide === "R" ? "right" : "left"} means the wind is from the ${row.xwSide === "R" ? "right" : "left"}.`,
      },
      {
        action: `Drift angle is track minus heading: ${pad(row.trk)} − ${pad(row.th)}.`,
        result: `${row.da}° ${row.daSide}`,
      },
      { action: `Set ${row.tas} kt over the TAS index.`, tool: "cr3wind" },
      {
        action: `Set the TRACK, ${pad(row.trk)}°, over the course index — not the course.`,
        detail: "This is the step people get wrong. In flight the ground vector's direction is track.",
        tool: "cr3wind",
      },
      {
        action: `Input ${row.da}° of drift and read the crosswind above it.`,
        tool: "cr3wind",
        result: `${row.xw} kt`,
      },
      {
        action: `Draw the crosswind to the ${row.xwSide === "R" ? "right" : "left"} and the ${row.htType === "H" ? "head" : "tail"}wind of ${row.ht} kt.`,
        detail: `${row.tas} − ${row.gs} = ${row.ht} kt ${row.htType === "H" ? "headwind" : "tailwind"}.`,
        tool: "cr3wind",
      },
      {
        action: "Rotate the intersection to twelve o'clock and read the direction and velocity.",
        tool: "cr3wind",
        result: `${pad(row.dir)}° / ${row.vel} kt`,
      },
    ],
    explanation: `Drift ${row.da}° ${row.daSide === "R" ? "right" : "left"} gives ${row.xw} kt of crosswind, and ${row.tas} − ${row.gs} gives ${row.ht} kt ${row.htType === "H" ? "on the nose" : "behind"}. Together: ${pad(row.dir)}° at ${row.vel} kt.`,
    difficulty: strong ? 3 : 2,
    tags: ["drill"],
    officialStyle: true,
    source: RATE(CH6, ["2.343"]),
  };
});

/* ------------------------------------------------------------------ */

export const DRILL_QUESTIONS: NumericQuestion[] = [
  ...TIME_DRILLS,
  ...SPEED_DRILLS,
  ...DISTANCE_DRILLS,
  ...FUEL_DRILLS,
  ...FUEL_CONVERSION_DRILLS,
  ...ZULU_DRILLS,
  ...TAS_DRILLS,
  ...PREFLIGHT_DRILLS,
  ...INFLIGHT_DRILLS,
];

/** Ids grouped by drill, so drills.ts can pick its reps without re-deriving. */
export const DRILL_SETS = {
  time: TIME_DRILLS.map((q) => q.id),
  speed: SPEED_DRILLS.map((q) => q.id),
  distance: DISTANCE_DRILLS.map((q) => q.id),
  fuel: FUEL_DRILLS.map((q) => q.id),
  fuelConversion: FUEL_CONVERSION_DRILLS.map((q) => q.id),
  zulu: ZULU_DRILLS.map((q) => q.id),
  tas: TAS_DRILLS.map((q) => q.id),
  preflightWind: PREFLIGHT_DRILLS.map((q) => q.id),
  inflightWind: INFLIGHT_DRILLS.map((q) => q.id),
};
