/**
 * The training chart.
 *
 * WingBrief cannot ship a Tactical Pilotage Chart, so it draws one. This is a
 * generated Lambert conformal sheet built to the conventions the trainee guide
 * teaches against — a real conic projection with converging meridians, one
 * nautical mile per minute of latitude ticked along every meridian, the five-
 * and ten-minute speed marks the guide tells you to count by, and dashed blue
 * isogonic lines carrying whole-degree variation. The place names on it are
 * invented. It is a chart to learn chart work on, not a reproduction of a
 * real one, and the workspace says so on its face.
 *
 * Everything the projection does is reversible, so a coordinate pulled off the
 * drawing is checkable to the ±1 minute the course allows, and a course
 * measured against a meridian is checkable to ±1°.
 */

import { courseAndDistance, cosDeg, dm, sinDeg, type LatLon } from "./math";

/* ------------------------------------------------------------------ */
/* Lambert conformal conic projection                                  */
/* ------------------------------------------------------------------ */

const EARTH_NM = 3440.065;
const RAD = Math.PI / 180;

/**
 * Standard parallels. A Lambert is developed by laying a secant cone over the
 * earth so it cuts at two parallels; scale is exact along both and very nearly
 * exact between them, which is the "constant distance scale" the guide lists
 * as a characteristic. 29° and 33° bracket the sheet.
 */
export const STANDARD_PARALLELS: [number, number] = [29, 33];
export const CHART_ORIGIN = { lat: 30, lonW: 92 };

const [phi1, phi2] = STANDARD_PARALLELS;

/** Cone constant: how much of a full turn 360° of longitude becomes. */
const N =
  Math.log(cosDeg(phi1) / cosDeg(phi2)) /
  Math.log(Math.tan((45 + phi2 / 2) * RAD) / Math.tan((45 + phi1 / 2) * RAD));

const F = (cosDeg(phi1) * Math.tan((45 + phi1 / 2) * RAD) ** N) / N;

function rho(lat: number): number {
  return (EARTH_NM * F) / Math.tan((45 + lat / 2) * RAD) ** N;
}

const RHO0 = rho(CHART_ORIGIN.lat);

/**
 * Chart coordinates in nautical miles: +x east, +y SOUTH, so the value grows
 * downward the way an SVG coordinate does.
 */
export interface ChartXY {
  x: number;
  y: number;
}

export function project(point: LatLon): ChartXY {
  // lonW is west-positive, so east longitude difference is the negative of it.
  const theta = N * -(point.lonW - CHART_ORIGIN.lonW);
  const r = rho(point.lat);
  return {
    x: r * sinDeg(theta),
    y: -(RHO0 - r * cosDeg(theta)),
  };
}

export function unproject(xy: ChartXY): LatLon {
  const y = -xy.y;
  const r = Math.hypot(xy.x, RHO0 - y) * Math.sign(N);
  const theta = (Math.atan2(xy.x, RHO0 - y) * 180) / Math.PI;
  const lat = 2 * (Math.atan((EARTH_NM * F / r) ** (1 / N)) / RAD) - 90;
  return { lat, lonW: CHART_ORIGIN.lonW - theta / N };
}

/**
 * Grid convergence: how far chart north at a point leans from the top of the
 * page, in degrees, positive clockwise.
 *
 * This is why the guide insists you slide the plotter until the grommet sits
 * on a meridian — ideally one halfway along the course — rather than
 * measuring against the edge of the paper. On a conic the meridians are not
 * parallel, so a direction is only meaningful relative to the one you used.
 *
 * The value is the angle from chart north at that meridian round to the top
 * of the page, so a direction measured off the page converts with
 *   true course = page bearing + convergence at the meridian you used.
 * It is negative west of the central meridian and positive east of it.
 */
export function meridianConvergence(lonW: number): number {
  return N * -(lonW - CHART_ORIGIN.lonW);
}

/* ------------------------------------------------------------------ */
/* Sheet extent                                                        */
/* ------------------------------------------------------------------ */

export const CHART_BOUNDS = {
  north: 31.5,
  south: 28,
  west: 94.5,
  east: 89.5,
};

/** Nominal scale, matching the TPC the course uses. */
export const CHART_SCALE = "1:500,000";

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

export type FeatureKind = "tacan" | "airfield" | "tower" | "town" | "island" | "platform";

export interface ChartFeature {
  id: string;
  name: string;
  kind: FeatureKind;
  lat: number;
  lonW: number;
  /** TACAN channel, where the feature is a station. */
  channel?: number;
  /** Tower height in feet, where the feature is an obstruction. */
  heightFt?: number;
  /** Variation at the station, needed to plot a magnetic radial on a true chart. */
  variationEast?: number;
}

/**
 * The sheet's contents. Coordinates are exact, which is what lets a problem
 * ask for a bearing and distance between two of them and know the answer to
 * the last tenth of a mile.
 *
 * Names are deliberately plain and invented — nothing here claims to be a
 * real navaid, and no real frequency or channel assignment is implied.
 */
export const CHART_FEATURES: ChartFeature[] = [
  // --- TACAN stations -------------------------------------------------
  { id: "tcn-mariner", name: "MARINER", kind: "tacan", lat: dm(30, 12), lonW: dm(92, 48), channel: 41, variationEast: 4 },
  { id: "tcn-cypress", name: "CYPRESS", kind: "tacan", lat: dm(30, 48), lonW: dm(91, 36), channel: 68, variationEast: 3 },
  { id: "tcn-driftwood", name: "DRIFTWOOD", kind: "tacan", lat: dm(29, 24), lonW: dm(92, 6), channel: 87, variationEast: 4 },
  { id: "tcn-harrier", name: "HARRIER", kind: "tacan", lat: dm(31, 6), lonW: dm(93, 42), channel: 22, variationEast: 5 },
  { id: "tcn-tidewater", name: "TIDEWATER", kind: "tacan", lat: dm(29, 42), lonW: dm(90, 18), channel: 113, variationEast: 3 },

  // --- Airfields ------------------------------------------------------
  { id: "af-brackish", name: "Brackish Field", kind: "airfield", lat: dm(30, 30), lonW: dm(92, 42) },
  { id: "af-longleaf", name: "Longleaf Muni", kind: "airfield", lat: dm(31, 18), lonW: dm(92, 24) },
  { id: "af-oyster", name: "Oyster Bay", kind: "airfield", lat: dm(29, 6), lonW: dm(91, 12) },
  { id: "af-sabine", name: "Sabine Point", kind: "airfield", lat: dm(29, 54), lonW: dm(93, 54) },
  { id: "af-palmetto", name: "Palmetto Strip", kind: "airfield", lat: dm(30, 54), lonW: dm(90, 42) },
  { id: "af-redfish", name: "Redfish Regional", kind: "airfield", lat: dm(28, 42), lonW: dm(92, 48) },

  // --- Towers ---------------------------------------------------------
  { id: "twr-marsh", name: "Marsh tower", kind: "tower", lat: dm(30, 6), lonW: dm(92, 30), heightFt: 1240 },
  { id: "twr-bayou", name: "Bayou tower", kind: "tower", lat: dm(29, 36), lonW: dm(91, 0), heightFt: 980 },
  { id: "twr-ridge", name: "Ridge tower", kind: "tower", lat: dm(31, 0), lonW: dm(93, 6), heightFt: 1470 },
  { id: "twr-delta", name: "Delta tower", kind: "tower", lat: dm(28, 54), lonW: dm(90, 6), heightFt: 620 },

  // --- Towns ----------------------------------------------------------
  { id: "twn-vermilion", name: "Vermilion", kind: "town", lat: dm(29, 48), lonW: dm(92, 54) },
  { id: "twn-cutgrass", name: "Cutgrass", kind: "town", lat: dm(31, 24), lonW: dm(91, 12) },
  { id: "twn-shellbank", name: "Shellbank", kind: "town", lat: dm(29, 12), lonW: dm(90, 36) },
  { id: "twn-pinewood", name: "Pinewood", kind: "town", lat: dm(30, 36), lonW: dm(94, 0) },

  // --- Offshore -------------------------------------------------------
  { id: "isl-pelican", name: "Pelican Island", kind: "island", lat: dm(28, 30), lonW: dm(91, 42) },
  { id: "plt-gannet", name: "Gannet platform", kind: "platform", lat: dm(28, 18), lonW: dm(92, 18) },
];

export const FEATURE_BY_ID = Object.fromEntries(CHART_FEATURES.map((f) => [f.id, f]));

export function featureAt(id: string): ChartFeature {
  const f = FEATURE_BY_ID[id];
  if (!f) throw new Error(`No chart feature "${id}"`);
  return f;
}

export function featureLatLon(id: string): LatLon {
  const f = featureAt(id);
  return { lat: f.lat, lonW: f.lonW };
}

/** Course and distance between two named features. */
export function legBetween(fromId: string, toId: string) {
  return courseAndDistance(featureLatLon(fromId), featureLatLon(toId));
}

/* ------------------------------------------------------------------ */
/* Isogonic lines                                                      */
/* ------------------------------------------------------------------ */

/**
 * Variation across the sheet, drawn as dashed blue lines carrying whole
 * degrees east. They lean the way real isogonics do — roughly north-north-west
 * — so the value a student picks up depends on where on the sheet they are,
 * which is the entire reason the guide says to use the line nearest the
 * navaid.
 */
export interface IsogonicLine {
  variationEast: number;
  /** Longitude of the line at the southern and northern edges of the sheet. */
  lonAtSouth: number;
  lonAtNorth: number;
}

export const ISOGONIC_LINES: IsogonicLine[] = [
  { variationEast: 3, lonAtSouth: 90.4, lonAtNorth: 91.1 },
  { variationEast: 4, lonAtSouth: 92.0, lonAtNorth: 92.7 },
  { variationEast: 5, lonAtSouth: 93.6, lonAtNorth: 94.3 },
];

/**
 * The variation a student should read at a point: the nearest drawn line,
 * because that is the instruction the guide gives — "use the magnetic
 * variation from the nearest isogonic line to the NAVAID".
 */
export function variationAt(point: LatLon): number {
  const t = (point.lat - CHART_BOUNDS.south) / (CHART_BOUNDS.north - CHART_BOUNDS.south);
  let best = ISOGONIC_LINES[0];
  let bestGap = Infinity;
  for (const line of ISOGONIC_LINES) {
    const lonHere = line.lonAtSouth + (line.lonAtNorth - line.lonAtSouth) * t;
    const gap = Math.abs(lonHere - point.lonW);
    if (gap < bestGap) {
      bestGap = gap;
      best = line;
    }
  }
  return best.variationEast;
}

/* ------------------------------------------------------------------ */
/* Coastline                                                           */
/* ------------------------------------------------------------------ */

/**
 * A generated shoreline. It exists so the sheet reads as a chart rather than
 * graph paper, and so "over water" means something in a problem. No feature a
 * question depends on sits on it.
 */
export const COASTLINE: LatLon[] = [
  { lat: dm(30, 18), lonW: 94.5 },
  { lat: dm(30, 2), lonW: dm(94, 0) },
  { lat: dm(29, 46), lonW: dm(93, 24) },
  { lat: dm(29, 40), lonW: dm(92, 48) },
  { lat: dm(29, 32), lonW: dm(92, 12) },
  { lat: dm(29, 20), lonW: dm(91, 36) },
  { lat: dm(29, 6), lonW: dm(91, 0) },
  { lat: dm(29, 14), lonW: dm(90, 24) },
  { lat: dm(29, 30), lonW: dm(89, 54) },
  { lat: dm(29, 48), lonW: 89.5 },
];

/* ------------------------------------------------------------------ */
/* Graticule                                                           */
/* ------------------------------------------------------------------ */

export interface GraticuleLine {
  /** Degrees; the value the line is drawn at. */
  value: number;
  major: boolean;
  label: string;
}

/** Meridians every 30 minutes, labelled on the whole degree. */
export function meridians(): GraticuleLine[] {
  const out: GraticuleLine[] = [];
  for (let lon = CHART_BOUNDS.east; lon <= CHART_BOUNDS.west + 1e-9; lon += 0.5) {
    const whole = Math.abs(lon % 1) < 1e-9;
    out.push({
      value: lon,
      major: whole,
      label: `${String(Math.floor(lon)).padStart(3, "0")}°${whole ? "" : "30'"}`,
    });
  }
  return out;
}

/** Parallels every 30 minutes. */
export function parallels(): GraticuleLine[] {
  const out: GraticuleLine[] = [];
  for (let lat = CHART_BOUNDS.south; lat <= CHART_BOUNDS.north + 1e-9; lat += 0.5) {
    const whole = Math.abs(lat % 1) < 1e-9;
    out.push({
      value: lat,
      major: whole,
      label: `${Math.floor(lat)}°${whole ? "" : "30'"}`,
    });
  }
  return out;
}

export type SpeedMark = "minute" | "five" | "ten";

/**
 * The tick marks up a meridian. Information Sheet 6-2-2 describes exactly
 * this: a mark every minute, a longer one every five that stays on the left
 * of the meridian, and a longer one still every ten that crosses it — so you
 * can count sixty miles up a line without counting sixty ticks.
 */
export function meridianTicks(lonW: number): { lat: number; kind: SpeedMark }[] {
  const out: { lat: number; kind: SpeedMark }[] = [];
  const startMinutes = Math.round(CHART_BOUNDS.south * 60);
  const endMinutes = Math.round(CHART_BOUNDS.north * 60);
  for (let m = startMinutes; m <= endMinutes; m++) {
    const kind: SpeedMark = m % 10 === 0 ? "ten" : m % 5 === 0 ? "five" : "minute";
    out.push({ lat: m / 60, kind });
  }
  void lonW;
  return out;
}
