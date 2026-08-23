/**
 * The training chart has to be a real projection, not a picture of one.
 *
 * If the sheet and the answer key disagree, a student measuring correctly gets
 * marked wrong, which is the worst failure this course could have. These tests
 * check that the projection inverts, that a minute of latitude really is a
 * nautical mile everywhere on the sheet, and that a course measured off the
 * drawing lands inside the ±1° and ±0.5 NM the guide allows.
 */

import { describe, expect, it } from "vitest";
import {
  CHART_BOUNDS,
  CHART_FEATURES,
  ISOGONIC_LINES,
  legBetween,
  featureLatLon,
  meridianConvergence,
  meridianTicks,
  meridians,
  parallels,
  project,
  unproject,
  variationAt,
} from "./chart";
import { angularDifference, courseAndDistance, dm } from "./math";

/** Every corner and centre of the sheet, to keep the sweeps honest. */
const SAMPLE_POINTS = [
  { lat: 28.0, lonW: 94.5 },
  { lat: 28.0, lonW: 89.5 },
  { lat: 31.5, lonW: 94.5 },
  { lat: 31.5, lonW: 89.5 },
  { lat: 30.0, lonW: 92.0 },
  { lat: dm(29, 42), lonW: dm(91, 18) },
];

describe("the Lambert projection", () => {
  it("inverts to the same coordinate everywhere on the sheet", () => {
    for (const p of SAMPLE_POINTS) {
      const back = unproject(project(p));
      expect(Math.abs(back.lat - p.lat)).toBeLessThan(1e-6);
      expect(Math.abs(back.lonW - p.lonW)).toBeLessThan(1e-6);
    }
  });

  it("makes one minute of latitude one nautical mile up any meridian", () => {
    for (const lonW of [89.5, 92, 94.5]) {
      for (const lat of [28.5, 30, 31]) {
        const a = project({ lat, lonW });
        const b = project({ lat: lat + 10 / 60, lonW });
        expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(10, 1);
      }
    }
  });

  it("shrinks a minute of longitude by the cosine of the latitude", () => {
    const atSouth = (() => {
      const a = project({ lat: 28.5, lonW: 92 });
      const b = project({ lat: 28.5, lonW: 92 - 10 / 60 });
      return Math.hypot(b.x - a.x, b.y - a.y);
    })();
    const atNorth = (() => {
      const a = project({ lat: 31.5, lonW: 92 });
      const b = project({ lat: 31.5, lonW: 92 - 10 / 60 });
      return Math.hypot(b.x - a.x, b.y - a.y);
    })();
    expect(atSouth).toBeGreaterThan(atNorth);
    expect(atSouth).toBeCloseTo(10 * Math.cos((28.5 * Math.PI) / 180), 0);
  });

  it("converges the meridians, which is what makes a conic a conic", () => {
    // The central meridian is dead vertical; the sheet's edges lean in
    // opposite directions, by about a degree each at two degrees of longitude.
    expect(meridianConvergence(92)).toBeCloseTo(0, 9);
    expect(meridianConvergence(94)).toBeLessThan(-0.5);
    expect(meridianConvergence(90)).toBeGreaterThan(0.5);
    expect(meridianConvergence(94)).toBeCloseTo(-meridianConvergence(90), 6);
    // The cone constant is the sine of the mean standard parallel, near enough.
    expect(Math.abs(meridianConvergence(90) / 2)).toBeCloseTo(0.515, 2);
  });

  it("keeps the scale honest between the standard parallels", () => {
    // Scale is exact at 29° and 33° and very nearly exact between; a ten-mile
    // step should never be off by more than a couple of percent on this sheet.
    for (let lat = 28; lat <= 31.5; lat += 0.5) {
      const a = project({ lat, lonW: 92 });
      const b = project({ lat: lat + 10 / 60, lonW: 92 });
      const measured = Math.hypot(b.x - a.x, b.y - a.y);
      expect(Math.abs(measured - 10)).toBeLessThan(0.2);
    }
  });
});

describe("measuring off the drawing", () => {
  /**
   * A straight line on the sheet, measured against the meridian nearest its
   * midpoint, is what a student physically does with a plotter. It has to
   * agree with courseAndDistance, which is what the answer keys are built on.
   */
  function measureOnChart(from: { lat: number; lonW: number }, to: { lat: number; lonW: number }) {
    const a = project(from);
    const b = project(to);
    const midLon = (from.lonW + to.lonW) / 2;
    // The plotter is aligned to the meridian, so chart north at that meridian
    // is the reference — not the top of the page.
    const chartBearing = (Math.atan2(b.x - a.x, -(b.y - a.y)) * 180) / Math.PI;
    return {
      trueCourse: chartBearing + meridianConvergence(midLon),
      distance: Math.hypot(b.x - a.x, b.y - a.y),
    };
  }

  it("agrees with the answer-key geometry on every pair of chart features", () => {
    const worst = { course: 0, distance: 0, pair: "" };
    for (let i = 0; i < CHART_FEATURES.length; i++) {
      for (let j = i + 1; j < CHART_FEATURES.length; j++) {
        const from = featureLatLon(CHART_FEATURES[i].id);
        const to = featureLatLon(CHART_FEATURES[j].id);
        const drawn = measureOnChart(from, to);
        const keyed = courseAndDistance(from, to);
        const dc = angularDifference(drawn.trueCourse, keyed.trueCourse);
        const dd = Math.abs(drawn.distance - keyed.distance);
        if (dc > worst.course) {
          worst.course = dc;
          worst.pair = `${CHART_FEATURES[i].name} → ${CHART_FEATURES[j].name}`;
        }
        worst.distance = Math.max(worst.distance, dd);
      }
    }
    // The plotter reads to a degree and the dividers to half a mile, so the
    // drawing and the key have to agree well inside both.
    expect(worst.course, `worst course pair: ${worst.pair}`).toBeLessThan(1);
    expect(worst.distance).toBeLessThan(0.5);
  });
});

describe("the graticule", () => {
  it("rules meridians and parallels every thirty minutes", () => {
    const m = meridians();
    const p = parallels();
    expect(m[0].value).toBeCloseTo(CHART_BOUNDS.east, 9);
    expect(m[m.length - 1].value).toBeCloseTo(CHART_BOUNDS.west, 9);
    expect(m.every((line, i) => i === 0 || line.value - m[i - 1].value === 0.5)).toBe(true);
    expect(p.filter((line) => line.major).length).toBe(4);
  });

  it("ticks a meridian the way the guide says to count it", () => {
    const ticks = meridianTicks(92);
    // One mark per minute across the sheet.
    expect(ticks.length).toBe(Math.round((CHART_BOUNDS.north - CHART_BOUNDS.south) * 60) + 1);
    // Longer marks every five, longer still every ten.
    const at30 = ticks.find((t) => Math.abs(t.lat - 30) < 1e-9);
    const at30_05 = ticks.find((t) => Math.abs(t.lat - (30 + 5 / 60)) < 1e-9);
    const at30_03 = ticks.find((t) => Math.abs(t.lat - (30 + 3 / 60)) < 1e-9);
    expect(at30?.kind).toBe("ten");
    expect(at30_05?.kind).toBe("five");
    expect(at30_03?.kind).toBe("minute");
  });
});

describe("variation", () => {
  it("reads the nearest drawn isogonic line", () => {
    // Right on a line, you get that line.
    expect(variationAt({ lat: 28, lonW: 92.0 })).toBe(4);
    expect(variationAt({ lat: 28, lonW: 90.4 })).toBe(3);
    expect(variationAt({ lat: 28, lonW: 93.6 })).toBe(5);
    // The far east of the sheet is on the 3° line's side of the sheet.
    expect(variationAt({ lat: 30, lonW: 89.6 })).toBe(3);
    // The far west is on the 5° side.
    expect(variationAt({ lat: 30, lonW: 94.4 })).toBe(5);
  });

  it("leans the lines north-north-west, as real isogonics do", () => {
    for (const line of ISOGONIC_LINES) {
      expect(line.lonAtNorth).toBeGreaterThan(line.lonAtSouth);
    }
  });

  it("gives every TACAN a variation matching the line nearest it", () => {
    for (const f of CHART_FEATURES) {
      if (f.variationEast === undefined) continue;
      expect(variationAt({ lat: f.lat, lonW: f.lonW }), f.name).toBe(f.variationEast);
    }
  });
});

describe("the sheet's contents", () => {
  it("keeps every feature inside the sheet", () => {
    for (const f of CHART_FEATURES) {
      expect(f.lat, f.name).toBeGreaterThanOrEqual(CHART_BOUNDS.south);
      expect(f.lat, f.name).toBeLessThanOrEqual(CHART_BOUNDS.north);
      expect(f.lonW, f.name).toBeGreaterThanOrEqual(CHART_BOUNDS.east);
      expect(f.lonW, f.name).toBeLessThanOrEqual(CHART_BOUNDS.west);
    }
  });

  it("gives every feature a unique id and name", () => {
    expect(new Set(CHART_FEATURES.map((f) => f.id)).size).toBe(CHART_FEATURES.length);
    expect(new Set(CHART_FEATURES.map((f) => f.name)).size).toBe(CHART_FEATURES.length);
  });

  it("keeps features far enough apart to be told apart at half a mile", () => {
    // Coordinates are graded to ±1 minute, so two features closer than a few
    // miles would make a "pull the coordinates" question ambiguous.
    for (let i = 0; i < CHART_FEATURES.length; i++) {
      for (let j = i + 1; j < CHART_FEATURES.length; j++) {
        const d = courseAndDistance(
          featureLatLon(CHART_FEATURES[i].id),
          featureLatLon(CHART_FEATURES[j].id),
        ).distance;
        expect(d, `${CHART_FEATURES[i].name} / ${CHART_FEATURES[j].name}`).toBeGreaterThan(8);
      }
    }
  });

  it("has at least one leg long enough to need walking the dividers", () => {
    // The guide teaches setting the dividers to 30 NM and stepping them out
    // when a leg will not fit in one span, so the sheet has to contain one.
    const longest = Math.max(
      ...CHART_FEATURES.flatMap((a) =>
        CHART_FEATURES.map((b) => (a === b ? 0 : legBetween(a.id, b.id).distance)),
      ),
    );
    expect(longest).toBeGreaterThan(120);
  });
});
