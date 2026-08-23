/**
 * Navigation mathematics.
 *
 * Every number the Navigation course asks a student to produce is computed
 * here, and nowhere else. The rest of the course — problems, drills, missions,
 * the CR-3 and the chart workspace — reads answers from these functions, so a
 * problem statement and its answer key can never disagree.
 *
 * Two rules govern this file:
 *
 * 1. **Teach the course.** Where the trainee guide's procedure differs from a
 *    strict vector solution, the guide wins and the deviation is commented.
 *    The clearest case is groundspeed: the guide computes GS = TAS ± the
 *    head/tail component, without the cos(crab) reduction. A student who
 *    followed a "better" method would be marked wrong on the real exam.
 * 2. **Validate against the source.** math.test.ts runs every answer key
 *    printed in NAVAVSCOLSCOM-SG-200 Unit 6 — several hundred published
 *    values — through these functions and asserts each lands inside the
 *    tolerance Appendix A allows for that quantity.
 *
 * Source: Naval Aviation Fundamentals, NAVAVSCOLSCOM-SG-200, Module/Unit 6,
 * "Introduction to Air Navigation", CIN Q-9B-0020L.
 */

/* ------------------------------------------------------------------ */
/* Tolerances — NAVAVSCOLSCOM-SG-200 Unit 6, Appendix A                */
/* ------------------------------------------------------------------ */

/**
 * "+/- one unit on the logarithmic scale" is defined by Appendix A NOTE 2 as
 * the distance per tick mark on the 10-to-15 section of the CR-3, which the
 * guide itself equates to approximately +/- 1%. Everything read off the
 * circular slide rule — time, groundspeed, distance, fuel flow, fuel quantity
 * — carries that tolerance.
 */
export const LOG_SCALE_TOLERANCE_PCT = 1;

export type ToleranceKind =
  | "logScale"
  | "trueAirspeed"
  | "mach"
  | "direction"
  | "distance"
  | "latLong"
  | "windComponent"
  | "windComponentStrong"
  | "inflightWindDirection"
  | "inflightWindDirectionStrong"
  | "pointToPointCourse"
  | "pointToPointDistance"
  | "exact";

export interface Tolerance {
  /** Absolute allowance in the answer's own unit. */
  abs?: number;
  /** Percentage allowance, used for the logarithmic scale. */
  pct?: number;
  label: string;
}

export const TOLERANCES: Record<ToleranceKind, Tolerance> = {
  logScale: { pct: LOG_SCALE_TOLERANCE_PCT, label: "±1 unit on the log scale (≈1%)" },
  trueAirspeed: { abs: 2, label: "±2 kt" },
  mach: { abs: 0.01, label: "±0.01" },
  direction: { abs: 1, label: "±1°" },
  distance: { abs: 0.5, label: "±0.5 NM" },
  latLong: { abs: 1, label: "±1 minute" },
  windComponent: { abs: 3, label: "±3 kt" },
  windComponentStrong: { abs: 5, label: "±5 kt (wind ≥ 70 kt)" },
  inflightWindDirection: { abs: 3, label: "±3°" },
  inflightWindDirectionStrong: { abs: 5, label: "±5° (wind ≥ 70 kt)" },
  pointToPointCourse: { abs: 3, label: "±3°" },
  pointToPointDistance: { abs: 1, label: "±1 NM" },
  exact: { abs: 0, label: "exact" },
};

/** Wind tolerances widen at and above 70 knots — Appendix A, Back Side. */
export function windToleranceKind(
  velocity: number,
  what: "component" | "direction",
): ToleranceKind {
  const strong = velocity >= 70;
  if (what === "component") return strong ? "windComponentStrong" : "windComponent";
  return strong ? "inflightWindDirectionStrong" : "inflightWindDirection";
}

export function toleranceBand(kind: ToleranceKind, expected: number): number {
  const t = TOLERANCES[kind];
  if (t.pct !== undefined) return (Math.abs(expected) * t.pct) / 100;
  return t.abs ?? 0;
}

export function withinTolerance(
  kind: ToleranceKind,
  given: number,
  expected: number,
): boolean {
  return Math.abs(given - expected) <= toleranceBand(kind, expected) + 1e-9;
}

/**
 * Directions wrap, so 359° and 001° are two degrees apart, not 358. Any
 * comparison of a bearing has to go through this.
 */
export function angularDifference(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

export function withinDirectionTolerance(
  kind: ToleranceKind,
  given: number,
  expected: number,
): boolean {
  return angularDifference(given, expected) <= (TOLERANCES[kind].abs ?? 0) + 1e-9;
}

/* ------------------------------------------------------------------ */
/* Angles                                                              */
/* ------------------------------------------------------------------ */

const RAD = Math.PI / 180;

export const sinDeg = (d: number) => Math.sin(d * RAD);
export const cosDeg = (d: number) => Math.cos(d * RAD);

/**
 * Directions run 001° to 360°, never 000° — Information Sheet 6-1-2:
 * "Direction, stated in whole numbers, is measured from 001° to a maximum of
 * 360°." So due north prints as 360, not 000.
 */
export function normalizeDirection(deg: number): number {
  const n = ((Math.round(deg) % 360) + 360) % 360;
  return n === 0 ? 360 : n;
}

/** Same wrap, but keeping the fraction, for intermediate work. */
export function wrap360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function reciprocal(deg: number): number {
  return normalizeDirection(deg + 180);
}

/* ------------------------------------------------------------------ */
/* Time                                                                */
/* ------------------------------------------------------------------ */

/** Elapsed time as h+mm+ss, the format the trainee guide's answer keys use. */
export function formatElapsed(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}+${String(m).padStart(2, "0")}+${String(sec).padStart(2, "0")}`;
}

/** Shorter form used in the jet log's ETE column: 1+24 or 0+06. */
export function formatHoursMinutes(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60);
  return `${Math.floor(m / 60)}+${String(m % 60).padStart(2, "0")}`;
}

export function parseElapsed(text: string): number | null {
  const parts = text.trim().split(/[+:]/).map((p) => p.trim());
  if (parts.some((p) => p === "" || !/^\d+(\.\d+)?$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.length === 1) return nums[0] * 60;
  if (nums.length === 2) return nums[0] * 3600 + nums[1] * 60;
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  return null;
}

/** Clock time of day as minutes past midnight, from a 4-digit string. */
export function parseClock(text: string): number | null {
  const m = text.trim().match(/^(\d{1,2}):?(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatClock(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}`;
}

/**
 * Global timekeeping. Information Sheet 6-2-2:
 *   GMT (Z) = LMT − (ZD)
 *   LMT     = GMT + (ZD)
 */
export interface ZuluConversion {
  minutes: number;
  /** −1, 0 or +1 days relative to the input. */
  dayShift: number;
  text: string;
}

function shifted(raw: number): ZuluConversion {
  const dayShift = Math.floor(raw / 1440);
  const minutes = ((raw % 1440) + 1440) % 1440;
  return { minutes, dayShift, text: formatClock(minutes) };
}

export function localToZulu(lmtMinutes: number, zoneDescription: number): ZuluConversion {
  return shifted(lmtMinutes - zoneDescription * 60);
}

export function zuluToLocal(gmtMinutes: number, zoneDescription: number): ZuluConversion {
  return shifted(gmtMinutes + zoneDescription * 60);
}

/* ------------------------------------------------------------------ */
/* Rate problems — the CR-3 calculation side                           */
/* ------------------------------------------------------------------ */

/** Seconds needed to cover a distance at a groundspeed. */
export function timeFor(distanceNm: number, speedKt: number): number {
  return (distanceNm / speedKt) * 3600;
}

export function speedFor(distanceNm: number, seconds: number): number {
  return (distanceNm / seconds) * 3600;
}

export function distanceFor(speedKt: number, seconds: number): number {
  return (speedKt * seconds) / 3600;
}

export function fuelBurned(pph: number, seconds: number): number {
  return (pph * seconds) / 3600;
}

export function fuelFlowFor(pounds: number, seconds: number): number {
  return (pounds / seconds) * 3600;
}

export function enduranceSeconds(pounds: number, pph: number): number {
  return (pounds / pph) * 3600;
}

/**
 * Fuel conversion. Information Sheet 6-3-2: the ratio is pounds per gallon
 * over one gallon, and "there will always be more pounds than gallons" — the
 * check the guide gives students against an inverted setup.
 */
export function gallonsToPounds(gallons: number, poundsPerGallon: number): number {
  return gallons * poundsPerGallon;
}

export function poundsToGallons(pounds: number, poundsPerGallon: number): number {
  return pounds / poundsPerGallon;
}

/* ------------------------------------------------------------------ */
/* Estimation aids                                                     */
/* ------------------------------------------------------------------ */

/** Rule of 60: groundspeed ÷ 60 is nautical miles per minute. */
export function nmPerMinute(speedKt: number): number {
  return speedKt / 60;
}

/** Rule of 6: a tenth of groundspeed is the distance covered in six minutes. */
export function nmPerSixMinutes(speedKt: number): number {
  return speedKt / 10;
}

/**
 * Ten percent rule. Information Sheet 6-5-2: a crosswind equal to 10% of TAS
 * produces about 6° of crab, and the relationship holds across the airspeeds
 * of tactical aviation.
 */
export function tenPercentRuleCrab(crosswindKt: number, tas: number): number {
  return (crosswindKt / (tas * 0.1)) * 6;
}

/* ------------------------------------------------------------------ */
/* Direction and variation                                             */
/* ------------------------------------------------------------------ */

/**
 * "East is least, and West is best": subtract easterly variation, add
 * westerly. `variationEast` is signed — positive east, negative west.
 */
export function trueToMagnetic(trueDeg: number, variationEast: number): number {
  return normalizeDirection(trueDeg - variationEast);
}

/** The reverse, used when plotting a TACAN radial (magnetic) onto a true chart. */
export function magneticToTrue(magneticDeg: number, variationEast: number): number {
  return normalizeDirection(magneticDeg + variationEast);
}

/* ------------------------------------------------------------------ */
/* Altitude                                                            */
/* ------------------------------------------------------------------ */

export const STANDARD_DATUM_PLANE = 29.92;
/** Standard lapse rate: 1 inHg per 1,000 ft, 2 °C per 1,000 ft. */
export const INHG_PER_1000_FT = 1;
export const DEG_C_PER_1000_FT = 2;
export const STANDARD_SEA_LEVEL_TEMP_C = 15;

/**
 * Pressure altitude from calibrated altitude and the altimeter setting.
 *
 * "LAGS" — if the setting is Less than 29.92, Add; if Greater, Subtract.
 * Information Sheet 6-4-2.
 */
export function pressureAltitude(calibratedAlt: number, altimeterSetting: number): number {
  return calibratedAlt + (STANDARD_DATUM_PLANE - altimeterSetting) * 1000;
}

/** Indicated altitude corrected for instrument error gives calibrated altitude. */
export function calibratedAltitude(indicatedAltitude: number, instrumentErrorFt = 0): number {
  return indicatedAltitude - instrumentErrorFt;
}

/* ------------------------------------------------------------------ */
/* Airspeed                                                            */
/* ------------------------------------------------------------------ */

const P0_HPA = 1013.25;
const A0_KT = 661.4788;

/** ICAO standard atmosphere static pressure, hPa, from pressure altitude. */
export function staticPressureHpa(pressureAlt: number): number {
  if (pressureAlt < 36089) return P0_HPA * Math.pow(1 - 6.87559e-6 * pressureAlt, 5.2559);
  return 226.32 * Math.exp(-(pressureAlt - 36089) / 20806);
}

/**
 * Mach number from calibrated airspeed and pressure altitude.
 *
 * Temperature deliberately does not appear. On the CR-3 the Mach index is read
 * from the same CAS-over-PA setting with no temperature input, and the guide
 * makes the point explicitly: "at a constant Mach Number the corresponding TAS
 * is temperature dependent" — Mach itself is not.
 */
export function machFromCas(cas: number, pressureAlt: number): number {
  const p = staticPressureHpa(pressureAlt);
  const qc = P0_HPA * (Math.pow(1 + 0.2 * Math.pow(cas / A0_KT, 2), 3.5) - 1);
  return Math.sqrt(5 * (Math.pow(qc / p + 1, 2 / 7) - 1));
}

/**
 * Ram-rise recovery factor for the CR-3's temperature input.
 *
 * The CR-3's TAS window treats the temperature the student dials in as an
 * *indicated* reading and removes the ram rise as part of the solution — which
 * is why a purely static-temperature calculation runs two to three knots fast
 * against the trainee guide's answer key at every airspeed.
 *
 * 0.76 is not a physical constant. It is the value that reproduces the
 * official 50-row TAS table most closely: at 0.76, 49 of the 50 published
 * answers fall inside the ±2 kt tolerance Appendix A allows. The single
 * exception is CAS 800 at 17,370 ft — Mach 1.53, well past anything the course
 * flies and past where a Mach spiral printed on a plastic wheel stays
 * trustworthy. math.test.ts asserts all of that, so the claim cannot rot.
 */
export const CR3_RECOVERY_FACTOR = 0.76;

/** Upper Mach bound inside which the TAS model is validated against the source. */
export const TAS_MODEL_VALID_TO_MACH = 1.3;

export function trueAirspeed(cas: number, pressureAlt: number, oatC: number): number {
  const m = machFromCas(cas, pressureAlt);
  const staticK = (oatC + 273.15) / (1 + 0.2 * CR3_RECOVERY_FACTOR * m * m);
  return m * 38.967854 * Math.sqrt(staticK);
}

/**
 * The inverse: what CAS must be flown to achieve a target TAS. Solved by
 * bisection rather than algebra because trueAirspeed is monotonic in CAS but
 * not analytically invertible through the compressibility term.
 */
export function casForTrueAirspeed(
  targetTas: number,
  pressureAlt: number,
  oatC: number,
): number {
  let lo = 1;
  let hi = 1200;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (trueAirspeed(mid, pressureAlt, oatC) < targetTas) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Indicated airspeed corrected for instrument error gives calibrated airspeed.
 * The correction comes off the aircraft's airspeed calibration card.
 */
export function calibratedAirspeed(ias: number, correctionKt = 0): number {
  return ias + correctionKt;
}

/* ------------------------------------------------------------------ */
/* The wind triangle                                                   */
/* ------------------------------------------------------------------ */

export type Side = "L" | "R";
export type WindEffect = "H" | "T";

export interface PreflightWindSolution {
  /** Crosswind component magnitude, knots, rounded as the CR-3 is read. */
  crosswind: number;
  crosswindSide: Side;
  /** Head or tail component magnitude, knots. */
  component: number;
  componentType: WindEffect;
  /** Crab angle in whole degrees — the guide rounds to the nearest degree. */
  crab: number;
  crabSide: Side;
  trueHeading: number;
  groundspeed: number;
  /** Unrounded intermediates, for the worked solution and tolerance checks. */
  exact: { crosswind: number; component: number; crab: number; groundspeed: number };
}

/**
 * Preflight winds: given TAS, true course and the forecast wind, find the
 * heading to fly and the groundspeed to expect.
 *
 * Wind direction is the direction the wind blows FROM, in degrees true.
 *
 * The groundspeed line is the one place this deliberately departs from a
 * strict vector solution. Step 6 of Information Sheet 6-5-2 adds or subtracts
 * the head/tail component from TAS and stops there; a full solution would also
 * shave off the cos(crab) term. At the crab angles this course produces that
 * is a knot or two, inside the ±1% the CR-3 is read to, and the exam key is
 * built on the guide's arithmetic.
 */
export function preflightWind(params: {
  tas: number;
  trueCourse: number;
  windDirection: number;
  windVelocity: number;
}): PreflightWindSolution {
  const { tas, trueCourse, windDirection, windVelocity } = params;
  const relative = windDirection - trueCourse;

  // Positive = wind coming from the right of course; positive = headwind.
  const crossSigned = windVelocity * sinDeg(relative);
  const headSigned = windVelocity * cosDeg(relative);

  const crabExact = Math.asin(Math.max(-1, Math.min(1, crossSigned / tas))) / RAD;
  const gsExact = tas - headSigned;

  const crab = Math.round(Math.abs(crabExact));

  return {
    crosswind: Math.round(Math.abs(crossSigned)),
    crosswindSide: crossSigned >= 0 ? "R" : "L",
    component: Math.round(Math.abs(headSigned)),
    componentType: headSigned >= 0 ? "H" : "T",
    crab,
    crabSide: crossSigned >= 0 ? "R" : "L",
    // Crab into the wind: a right crosswind turns the heading right.
    trueHeading: normalizeDirection(trueCourse + (crossSigned >= 0 ? crab : -crab)),
    groundspeed: Math.round(gsExact),
    exact: {
      crosswind: Math.abs(crossSigned),
      component: Math.abs(headSigned),
      crab: Math.abs(crabExact),
      groundspeed: gsExact,
    },
  };
}

export interface InflightWindSolution {
  drift: number;
  driftSide: Side;
  crosswind: number;
  crosswindSide: Side;
  component: number;
  componentType: WindEffect;
  /** The answer: wind direction (from) and velocity. */
  direction: number;
  velocity: number;
  exact: { crosswind: number; component: number; velocity: number; direction: number };
}

/**
 * In-flight winds: given the air vector (TH/TAS) and the ground vector
 * (track/GS), recover the wind.
 *
 * This mirrors the CR-3 procedure in Information Sheet 6-6-2 rather than doing
 * plain vector subtraction, because the two do not agree to the last knot and
 * the answer key follows the procedure. The steps are: drift angle from TH and
 * track; crosswind from TAS and drift; head/tail from TAS minus GS; then the
 * wind is the resultant of those two components read against the track.
 */
export function inflightWind(params: {
  trueHeading: number;
  tas: number;
  track: number;
  groundspeed: number;
}): InflightWindSolution {
  const { trueHeading, tas, track, groundspeed } = params;

  // Signed drift: positive is drift to the right of heading.
  const driftSigned = ((track - trueHeading + 540) % 360) - 180;

  const crossSigned = tas * sinDeg(driftSigned);
  const headSigned = tas - groundspeed; // positive = headwind

  // Drifting right means the wind is pushing from the left, so the wind's
  // right-of-track component is the negative of the drift-induced crosswind.
  const fromRight = -crossSigned;
  const velocity = Math.hypot(fromRight, headSigned);
  const directionExact = wrap360(track + Math.atan2(fromRight, headSigned) / RAD);

  return {
    drift: Math.round(Math.abs(driftSigned)),
    driftSide: driftSigned >= 0 ? "R" : "L",
    crosswind: Math.round(Math.abs(crossSigned)),
    crosswindSide: fromRight >= 0 ? "R" : "L",
    component: Math.round(Math.abs(headSigned)),
    componentType: headSigned >= 0 ? "H" : "T",
    direction: normalizeDirection(directionExact),
    velocity: Math.round(velocity),
    exact: {
      crosswind: Math.abs(crossSigned),
      component: Math.abs(headSigned),
      velocity,
      direction: directionExact,
    },
  };
}

/**
 * Quartering analysis — the estimate that has to come before the wheel.
 * Information Sheet 6-5-2, Figure 5-11.
 */
export type Quarter = "left head" | "right head" | "left tail" | "right tail" | "pure cross";

export function quarteringAnalysis(trueCourse: number, windDirection: number): Quarter {
  const rel = wrap360(windDirection - trueCourse);
  const head = cosDeg(rel);
  const right = sinDeg(rel);
  if (Math.abs(head) < 1e-9) return "pure cross";
  const side = right >= 0 ? "right" : "left";
  return `${side} ${head > 0 ? "head" : "tail"}` as Quarter;
}

/* ------------------------------------------------------------------ */
/* TACAN                                                               */
/* ------------------------------------------------------------------ */

export interface Point2D {
  x: number;
  y: number;
}

/** A radial/DME fix as a position relative to the station, in nautical miles. */
export function radialDmeToOffset(radial: number, dme: number): Point2D {
  return { x: dme * sinDeg(radial), y: dme * cosDeg(radial) };
}

export interface PointToPoint {
  course: number;
  distance: number;
}

/**
 * TACAN point-to-point. Both fixes are expressed against the same station, so
 * the answer is the difference of two offsets — which is exactly what the
 * student does physically by plotting both dots on the CR-3's green grid and
 * rotating the connecting line vertical.
 *
 * Radials are magnetic, so the course that comes out is magnetic too.
 */
export function pointToPoint(
  from: { radial: number; dme: number },
  to: { radial: number; dme: number },
): PointToPoint {
  const a = radialDmeToOffset(from.radial, from.dme);
  const b = radialDmeToOffset(to.radial, to.dme);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return {
    course: normalizeDirection(Math.atan2(dx, dy) / RAD),
    distance: Math.hypot(dx, dy),
  };
}

/**
 * The head of the BDHI's #2 needle is the magnetic bearing TO the station; the
 * tail is the radial the aircraft is on. Several official problems give the
 * bearing and expect the student to make that flip.
 */
export function radialFromBearingTo(bearingToStation: number): number {
  return reciprocal(bearingToStation);
}

/* ------------------------------------------------------------------ */
/* Coordinates and chart geometry                                      */
/* ------------------------------------------------------------------ */

export interface LatLon {
  /** Decimal degrees, north positive. */
  lat: number;
  /** Decimal degrees, WEST positive — the whole course works in the Gulf. */
  lonW: number;
}

export function dm(degrees: number, minutes: number): number {
  return degrees + minutes / 60;
}

/** "N 30° 21.4'" style, the format the answer keys are written in. */
export function formatLat(lat: number): string {
  const d = Math.floor(Math.abs(lat));
  const m = (Math.abs(lat) - d) * 60;
  return `${lat >= 0 ? "N" : "S"} ${String(d).padStart(2, "0")}° ${m.toFixed(1).padStart(4, "0")}'`;
}

export function formatLon(lonW: number): string {
  const d = Math.floor(Math.abs(lonW));
  const m = (Math.abs(lonW) - d) * 60;
  return `${lonW >= 0 ? "W" : "E"} ${String(d).padStart(3, "0")}° ${m.toFixed(1).padStart(4, "0")}'`;
}

/**
 * Course and distance between two chart points.
 *
 * Uses the mean-latitude (departure) construction, which is what the plotter
 * and dividers physically measure on a Lambert conformal sheet at this scale:
 * one minute of latitude is one nautical mile along any meridian, and a minute
 * of longitude shrinks by the cosine of the latitude you are at. Checked
 * against the trainee guide's own plotting answers, it lands inside the ±1°
 * and ±0.5 NM the course allows.
 */
export function courseAndDistance(
  from: LatLon,
  to: LatLon,
): { trueCourse: number; distance: number } {
  const meanLat = (from.lat + to.lat) / 2;
  const northNm = (to.lat - from.lat) * 60;
  // lonW grows westward, so an increase in lonW is movement to the WEST.
  const eastNm = -(to.lonW - from.lonW) * 60 * cosDeg(meanLat);
  return {
    trueCourse: normalizeDirection(Math.atan2(eastNm, northNm) / RAD),
    distance: Math.hypot(northNm, eastNm),
  };
}

/** The inverse: step out along a true course for a distance. */
export function projectPoint(from: LatLon, trueCourse: number, distanceNm: number): LatLon {
  const northNm = distanceNm * cosDeg(trueCourse);
  const eastNm = distanceNm * sinDeg(trueCourse);
  const lat = from.lat + northNm / 60;
  const meanLat = (from.lat + lat) / 2;
  return { lat, lonW: from.lonW - eastNm / (60 * cosDeg(meanLat)) };
}

/* ------------------------------------------------------------------ */
/* Flight planning                                                     */
/* ------------------------------------------------------------------ */

export interface LegPlanInput {
  trueCourse: number;
  distanceNm: number;
  tas: number;
  windDirection: number;
  windVelocity: number;
  fuelFlowPph: number;
  variationEast: number;
}

export interface LegPlan {
  magneticCourse: number;
  trueHeading: number;
  magneticHeading: number;
  groundspeed: number;
  /** Estimated time en route, seconds. */
  eteSeconds: number;
  legFuel: number;
  wind: PreflightWindSolution;
}

/**
 * One leg of a jet log, following the four flight-planning steps in
 * Information Sheet 6-7-2: measure course and distance, apply preflight winds
 * for heading and groundspeed, compute ETE, then compute leg fuel.
 */
export function planLeg(input: LegPlanInput): LegPlan {
  const wind = preflightWind({
    tas: input.tas,
    trueCourse: input.trueCourse,
    windDirection: input.windDirection,
    windVelocity: input.windVelocity,
  });
  const eteSeconds = timeFor(input.distanceNm, wind.groundspeed);
  return {
    magneticCourse: trueToMagnetic(input.trueCourse, input.variationEast),
    trueHeading: wind.trueHeading,
    magneticHeading: trueToMagnetic(wind.trueHeading, input.variationEast),
    groundspeed: wind.groundspeed,
    eteSeconds,
    legFuel: fuelBurned(input.fuelFlowPph, eteSeconds),
    wind,
  };
}

export interface RouteLegResult extends LegPlan {
  name: string;
  distanceNm: number;
  /** Cumulative: clock time over this point, minutes past midnight. */
  etaMinutes: number;
  /** Estimated fuel remaining over this point. */
  efr: number;
}

/**
 * A whole route: ETA and EFR accumulate down the jet log, which is the point
 * of the log. Times are carried in seconds and only rounded for display, so a
 * three-leg flight does not drift by rounding each leg to the minute.
 */
export function planRoute(params: {
  legs: { name: string; trueCourse: number; distanceNm: number }[];
  tas: number;
  windDirection: number;
  windVelocity: number;
  fuelFlowPph: number;
  fuelOnBoard: number;
  takeoffMinutes: number;
  variationEast: number;
}): RouteLegResult[] {
  let elapsed = 0;
  let fuel = params.fuelOnBoard;
  return params.legs.map((leg) => {
    const plan = planLeg({
      trueCourse: leg.trueCourse,
      distanceNm: leg.distanceNm,
      tas: params.tas,
      windDirection: params.windDirection,
      windVelocity: params.windVelocity,
      fuelFlowPph: params.fuelFlowPph,
      variationEast: params.variationEast,
    });
    elapsed += plan.eteSeconds;
    fuel -= plan.legFuel;
    return {
      ...plan,
      name: leg.name,
      distanceNm: leg.distanceNm,
      etaMinutes: params.takeoffMinutes + elapsed / 60,
      efr: fuel,
    };
  });
}

/**
 * Updating in flight. Given an updated groundspeed and the distance still to
 * run, the new ETA and EFR — EOs 4.16 and 4.17.
 */
export function updateArrival(params: {
  remainingNm: number;
  groundspeed: number;
  nowMinutes: number;
  fuelOnBoard: number;
  fuelFlowPph: number;
}): { eteSeconds: number; etaMinutes: number; legFuel: number; efr: number } {
  const eteSeconds = timeFor(params.remainingNm, params.groundspeed);
  const legFuel = fuelBurned(params.fuelFlowPph, eteSeconds);
  return {
    eteSeconds,
    etaMinutes: params.nowMinutes + eteSeconds / 60,
    legFuel,
    efr: params.fuelOnBoard - legFuel,
  };
}
