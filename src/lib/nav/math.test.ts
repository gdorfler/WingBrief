/**
 * Validation of the navigation mathematics against the trainee guide.
 *
 * This is not a unit test in the usual sense. It takes every answer the
 * official answer keys print — 25 time problems, 25 speed, 25 distance, 25
 * fuel, 10 fuel conversions, 10 time-zone conversions, 50 true airspeeds, 50
 * preflight wind solutions, 47 in-flight wind solutions, the point-to-point
 * items and the chart legs — and asserts src/lib/nav/math.ts reproduces each
 * one inside the tolerance Appendix A publishes for that quantity.
 *
 * A navigation course cannot tolerate a wrong answer key, and the only way to
 * be sure of that is to check the keys against the source rather than against
 * my own arithmetic.
 */

import { describe, expect, it } from "vitest";
import {
  TOLERANCES,
  angularDifference,
  casForTrueAirspeed,
  courseAndDistance,
  distanceFor,
  dm,
  enduranceSeconds,
  formatElapsed,
  fuelBurned,
  fuelFlowFor,
  gallonsToPounds,
  inflightWind,
  localToZulu,
  machFromCas,
  parseClock,
  parseElapsed,
  formatClock,
  normalizeDirection,
  nmPerMinute,
  nmPerSixMinutes,
  pointToPoint,
  poundsToGallons,
  preflightWind,
  pressureAltitude,
  projectPoint,
  quarteringAnalysis,
  radialFromBearingTo,
  reciprocal,
  speedFor,
  tenPercentRuleCrab,
  timeFor,
  trueAirspeed,
  trueToMagnetic,
  magneticToTrue,
  updateArrival,
  planRoute,
  withinTolerance,
  zuluToLocal,
} from "./math";
import {
  CHART_LEG_PROBLEMS,
  DISTANCE_PROBLEMS,
  FUEL_CONVERSION_PROBLEMS,
  FUEL_PROBLEMS,
  INFLIGHT_WIND_PROBLEMS,
  POINT_TO_POINT_EXAMPLE,
  POINT_TO_POINT_PROBLEMS,
  PREFLIGHT_WIND_PROBLEMS,
  SOURCE_DISCREPANCIES,
  SPEED_PROBLEMS,
  TAS_PROBLEMS,
  TIME_PROBLEMS,
  TIME_ZONE_PROBLEMS,
} from "./official-data";

/**
 * Time answers carry the ±1% log-scale tolerance, plus whatever the printed
 * key's own precision costs. Every key is rounded to at least the second,
 * which matters on a seventeen-second answer where ±1% is under a fifth of a
 * second; a key printed with `+00` seconds has been rounded to the whole
 * minute as well, worth up to another thirty. Neither term loosens the
 * standard — they are the resolution of the paper being checked against.
 */
function timeAllowance(expectedSeconds: number, printed: string): number {
  const roundedToMinute = printed.endsWith("+00") && expectedSeconds >= 60;
  return expectedSeconds * 0.01 + 0.5 + (roundedToMinute ? 30 : 0);
}

describe("time, speed and distance — Assignment 6-3-3", () => {
  it("reproduces all 25 published TIME answers", () => {
    const misses: string[] = [];
    for (const row of TIME_PROBLEMS) {
      const seconds = timeFor(row.d, row.s);
      const expected = parseElapsed(row.answer)!;
      if (Math.abs(seconds - expected) > timeAllowance(expected, row.answer)) {
        misses.push(`${row.d} NM at ${row.s} kt: ${formatElapsed(seconds)} vs ${row.answer}`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("reproduces all 25 published SPEED answers", () => {
    const misses: string[] = [];
    for (const row of SPEED_PROBLEMS) {
      const kt = speedFor(row.d, parseElapsed(row.t)!);
      if (!withinTolerance("logScale", kt, row.answer)) {
        misses.push(`${row.d} NM in ${row.t}: ${kt.toFixed(1)} vs ${row.answer}`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("reproduces all 25 published DISTANCE answers", () => {
    const misses: string[] = [];
    for (const row of DISTANCE_PROBLEMS) {
      const nm = distanceFor(row.s, parseElapsed(row.t)!);
      // Short answers are printed to one decimal, so 0.05 of rounding slack.
      const band = Math.max(row.answer * 0.01, 0.05);
      if (Math.abs(nm - row.answer) > band) {
        misses.push(`${row.s} kt for ${row.t}: ${nm.toFixed(2)} vs ${row.answer}`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("agrees with the worked examples in Information Sheet 6-3-2", () => {
    // 350 NM at 150 kt is 2 hours 20 minutes.
    expect(formatElapsed(timeFor(350, 150))).toBe("2+20+00");
    // 5 NM at 250 kt is 72 seconds.
    expect(Math.round(timeFor(5, 250))).toBe(72);
    // 30 NM in 11 minutes is 164 kt.
    expect(Math.round(speedFor(30, 11 * 60))).toBe(164);
    // 240 kt for 19 minutes is 76 NM.
    expect(Math.round(distanceFor(240, 19 * 60))).toBe(76);
  });
});

describe("fuel — Assignment 6-3-3", () => {
  it("reproduces the published fuel consumption answers", () => {
    const misses: string[] = [];
    for (const row of FUEL_PROBLEMS) {
      if (row.solve === "quantity") {
        const lb = fuelBurned(row.flow!, parseElapsed(row.time!)!);
        if (!withinTolerance("logScale", lb, row.answer as number)) {
          misses.push(`${row.flow} pph for ${row.time}: ${lb.toFixed(1)} vs ${row.answer}`);
        }
      } else if (row.solve === "flow") {
        const pph = fuelFlowFor(row.quantity!, parseElapsed(row.time!)!);
        if (!withinTolerance("logScale", pph, row.answer as number)) {
          misses.push(`${row.quantity} lb in ${row.time}: ${pph.toFixed(1)} vs ${row.answer}`);
        }
      } else {
        const seconds = enduranceSeconds(row.quantity!, row.flow!);
        const expected = parseElapsed(row.answer as string)!;
        if (Math.abs(seconds - expected) > timeAllowance(expected, row.answer as string)) {
          misses.push(`${row.quantity} lb at ${row.flow} pph: ${formatElapsed(seconds)} vs ${row.answer}`);
        }
      }
    }
    expect(misses).toEqual([]);
  });

  it("reproduces all 10 published fuel conversions", () => {
    const misses: string[] = [];
    for (const row of FUEL_CONVERSION_PROBLEMS) {
      const value =
        row.solve === "pounds"
          ? gallonsToPounds(row.gallons!, row.lbsPerGal)
          : poundsToGallons(row.pounds!, row.lbsPerGal);
      if (!withinTolerance("logScale", value, row.answer)) {
        misses.push(`${row.lbsPerGal} lb/gal: ${value.toFixed(1)} vs ${row.answer}`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("agrees with the worked conversions in Information Sheet 6-3-2", () => {
    // The wheel reads 3,460 lb for 525 gallons at 6.6; the arithmetic is 3,465.
    expect(withinTolerance("logScale", gallonsToPounds(525, 6.6), 3460)).toBe(true);
    // 6,000 lb at 6.4 lb/gal is 938 gallons.
    expect(Math.round(poundsToGallons(6000, 6.4))).toBe(938);
    // There are always more pounds than gallons — the guide's own sanity check.
    for (const lbPerGal of [6.5, 6.6, 6.8]) {
      expect(gallonsToPounds(100, lbPerGal)).toBeGreaterThan(100);
    }
  });
});

describe("global timekeeping — Assignment 6-2-3", () => {
  it("reproduces all 10 published conversions", () => {
    for (const row of TIME_ZONE_PROBLEMS) {
      if (row.solve === "lmt") {
        expect(zuluToLocal(parseClock(row.gmt!)!, row.zd).text).toBe(row.answer);
      } else {
        expect(localToZulu(parseClock(row.lmt!)!, row.zd).text).toBe(row.answer);
      }
    }
  });

  it("solves the published word problems", () => {
    // 40: Whidbey (−8) 0900 local, what is the local time at Oceana (−5)?
    const takeoffZ = localToZulu(parseClock("0900")!, -8);
    expect(zuluToLocal(takeoffZ.minutes, -5).text).toBe("1200");

    // 41: Pensacola (−6) 1500 local, four hours to Miramar (−8).
    const z = localToZulu(parseClock("1500")!, -6);
    expect(zuluToLocal(z.minutes + 240, -8).text).toBe("1700");

    // 42: 1715Z from Cherry Point, 2+20 en route, Tinker (−6).
    expect(zuluToLocal(parseClock("1715")! + 140, -6).text).toBe("1335");

    // 43: ring a phone in Naples (+1) at 1300 local — what time in Pensacola?
    const naplesZ = localToZulu(parseClock("1300")!, +1);
    expect(zuluToLocal(naplesZ.minutes, -6).text).toBe("0600");

    // 44: San Francisco (−8) 1300 local, sixteen hours to Tokyo (+9).
    const sfoZ = localToZulu(parseClock("1300")!, -8);
    const tokyo = zuluToLocal(sfoZ.minutes + 16 * 60, +9);
    expect(tokyo.text).toBe("2200");
  });

  it("agrees with the worked examples in Information Sheet 6-2-2", () => {
    // LMT 0700 at ZD −6 is 1300Z.
    expect(localToZulu(parseClock("0700")!, -6).text).toBe("1300");
    // 1200Z in Bahrain (+3) is 1500 local.
    expect(zuluToLocal(parseClock("1200")!, 3).text).toBe("1500");
    // North Island (−8) 1100 local, four hours, into Pensacola (−6).
    const off = localToZulu(parseClock("1100")!, -8);
    expect(off.text).toBe("1900");
    expect(zuluToLocal(off.minutes + 240, -6).text).toBe("1700");
  });

  it("reports the day rollover rather than silently wrapping", () => {
    // 0412Z at ZD −11 is 1712 the previous day.
    const r = zuluToLocal(parseClock("0412")!, -11);
    expect(r.text).toBe("1712");
    expect(r.dayShift).toBe(-1);
  });

  it("round-trips any zone description", () => {
    for (let zd = -12; zd <= 12; zd++) {
      for (const clock of ["0000", "0715", "1259", "2359"]) {
        const lmt = parseClock(clock)!;
        expect(zuluToLocal(localToZulu(lmt, zd).minutes, zd).text).toBe(formatClock(lmt));
      }
    }
  });
});

describe("altitude and airspeed — Assignment 6-4-3", () => {
  it("computes pressure altitude exactly on all 40 rows that print one", () => {
    for (const row of TAS_PROBLEMS) {
      if (row.calt === undefined || row.altim === undefined) continue;
      expect(Math.round(pressureAltitude(row.calt, row.altim))).toBe(row.pa);
    }
  });

  it("applies LAGS in both directions", () => {
    // Greater than 29.92 → subtract. The guide's worked example.
    expect(pressureAltitude(10000, 31.12)).toBeCloseTo(8800, 6);
    // Less than 29.92 → add.
    expect(pressureAltitude(10000, 28.92)).toBeCloseTo(11000, 6);
    expect(pressureAltitude(10000, 29.92)).toBeCloseTo(10000, 6);
  });

  it("reproduces 49 of the 50 published true airspeeds inside ±2 kt", () => {
    const misses: string[] = [];
    for (const row of TAS_PROBLEMS) {
      const value = trueAirspeed(row.cas, row.pa, row.oat);
      if (!withinTolerance("trueAirspeed", value, row.tas)) {
        misses.push(
          `PA ${row.pa} CAS ${row.cas} OAT ${row.oat}: ${value.toFixed(1)} vs ${row.tas}`,
        );
      }
    }
    // The single failure is Mach 1.53; see SOURCE_DISCREPANCIES.
    expect(misses).toEqual(["PA 17370 CAS 800 OAT 0: 846.6 vs 865"]);
  });

  it("stays inside ±2 kt on every subsonic published row", () => {
    for (const row of TAS_PROBLEMS) {
      if (machFromCas(row.cas, row.pa) > 1) continue;
      expect(
        Math.abs(trueAirspeed(row.cas, row.pa, row.oat) - row.tas),
        `PA ${row.pa} CAS ${row.cas}`,
      ).toBeLessThanOrEqual(2);
    }
  });

  it("inverts cleanly: the CAS needed for a target TAS", () => {
    for (const row of TAS_PROBLEMS) {
      if (machFromCas(row.cas, row.pa) > 1) continue;
      const cas = casForTrueAirspeed(row.tas, row.pa, row.oat);
      expect(Math.abs(cas - row.cas), `PA ${row.pa} TAS ${row.tas}`).toBeLessThanOrEqual(2);
    }
  });

  it("agrees with the worked TAS and Mach example in Information Sheet 6-4-2", () => {
    // CAS 252 (from IAS 255), PA 8,800, OAT −20 → TAS 272 kt, Mach .448.
    expect(Math.abs(trueAirspeed(252, 8800, -20) - 272)).toBeLessThanOrEqual(2);
    expect(Math.abs(machFromCas(252, 8800) - 0.448)).toBeLessThanOrEqual(0.01);
  });

  it("solves the published multiple-choice airspeed items", () => {
    // Items 51 and 53 are deliberately absent: the letters printed for them
    // disagree with the 50-row table on the same assignment sheet, and the
    // table wins. See SOURCE_DISCREPANCIES.
    // 52: CAS 200, PA 16,000, OAT −10 → TAS 253 (answer B).
    expect(Math.abs(trueAirspeed(200, 16000, -10) - 253)).toBeLessThanOrEqual(2);
    // 54: CAS 162, PA 16,000, OAT −10 → TAS 207 (answer D).
    expect(Math.abs(trueAirspeed(162, 16000, -10) - 207)).toBeLessThanOrEqual(2);
    // 55: CAS 120, PA 14,500, OAT −30 → TAS 144 (answer B).
    expect(Math.abs(trueAirspeed(120, 14500, -30) - 144)).toBeLessThanOrEqual(2);
  });

  it("solves the practice exam's airspeed items", () => {
    // 17: PA 15,000, CAS 225 → Mach .45 (answer A).
    expect(Math.abs(machFromCas(225, 15000) - 0.45)).toBeLessThanOrEqual(0.01);
    // 18: TAS 300 at PA 25,000, OAT −25 → CAS 204 (answer C).
    expect(Math.abs(casForTrueAirspeed(300, 25000, -25) - 204)).toBeLessThanOrEqual(2);
    // 21: TAS 170 from CAS 153 at OAT −20 → PA 9,600 ft (answer C).
    let best = 0;
    let bestErr = Infinity;
    for (let pa = 0; pa <= 25000; pa += 10) {
      const err = Math.abs(trueAirspeed(153, pa, -20) - 170);
      if (err < bestErr) {
        bestErr = err;
        best = pa;
      }
    }
    expect(Math.abs(best - 9600)).toBeLessThanOrEqual(600);
  });

  it("keeps Mach independent of temperature, as the CR-3 does", () => {
    const cold = machFromCas(300, 20000);
    const hot = machFromCas(300, 20000);
    expect(cold).toBe(hot);
    // TAS at a fixed Mach is not: warmer air is faster.
    expect(trueAirspeed(300, 20000, 10)).toBeGreaterThan(trueAirspeed(300, 20000, -40));
  });

  it("raises TAS with altitude at a constant CAS", () => {
    let previous = 0;
    for (const pa of [0, 5000, 10000, 20000, 30000]) {
      const value = trueAirspeed(200, pa, 15 - (2 * pa) / 1000);
      expect(value).toBeGreaterThan(previous);
      previous = value;
    }
  });
});

describe("preflight winds — Assignment 6-5-3", () => {
  it("reproduces all 50 published solutions", () => {
    const misses: string[] = [];
    for (const row of PREFLIGHT_WIND_PROBLEMS) {
      const s = preflightWind({
        tas: row.tas,
        trueCourse: row.tc,
        windDirection: row.dir,
        windVelocity: row.vel,
      });
      const band = row.vel >= 70 ? 5 : 3;
      const label = `TC ${row.tc} TAS ${row.tas} wind ${row.dir}/${row.vel}`;

      if (Math.abs(s.exact.crosswind - row.xw) > band) {
        misses.push(`${label} XW ${s.exact.crosswind.toFixed(1)} vs ${row.xw}`);
      }
      if (Math.abs(s.exact.component - row.ht) > band) {
        misses.push(`${label} H/T ${s.exact.component.toFixed(1)} vs ${row.ht}`);
      }
      if (s.componentType !== row.htType) {
        misses.push(`${label} H/T type ${s.componentType} vs ${row.htType}`);
      }
      // Heading carries the wind-direction tolerance: ±3°, ±5° in strong wind.
      if (angularDifference(s.trueHeading, row.th) > band) {
        misses.push(`${label} TH ${s.trueHeading} vs ${row.th}`);
      }
      if (!withinTolerance("logScale", s.exact.groundspeed, row.gs)) {
        misses.push(`${label} GS ${s.exact.groundspeed.toFixed(1)} vs ${row.gs}`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("names the crosswind side the way the key does", () => {
    const mismatches = PREFLIGHT_WIND_PROBLEMS.filter((row) => {
      // A zero or near-zero crosswind has no meaningful side.
      if (row.xw <= 1) return false;
      const s = preflightWind({
        tas: row.tas,
        trueCourse: row.tc,
        windDirection: row.dir,
        windVelocity: row.vel,
      });
      return s.crosswindSide !== row.xwSide;
    });
    expect(mismatches).toEqual([]);
  });

  it("reproduces the worked example in Information Sheet 6-5-2", () => {
    // TC 218, TAS 325, wind 100/40 → 35 kt left crosswind, 19 kt tail,
    // 6° of left crab, TH 212, GS 344.
    const s = preflightWind({ tas: 325, trueCourse: 218, windDirection: 100, windVelocity: 40 });
    expect(s.crosswind).toBe(35);
    expect(s.crosswindSide).toBe("L");
    expect(s.component).toBe(19);
    expect(s.componentType).toBe("T");
    expect(s.crab).toBe(6);
    expect(s.trueHeading).toBe(212);
    expect(s.groundspeed).toBe(344);
  });

  it("solves the published preflight word problems", () => {
    // Problem 2: winds 230/45, TC 330, CALT 15,000, altimeter 27.56, IAS 186.
    expect(pressureAltitude(15000, 27.56)).toBeCloseTo(17360, 6);
    const two = preflightWind({ tas: 242, trueCourse: 330, windDirection: 230, windVelocity: 45 });
    expect(Math.abs(two.exact.crosswind - 45)).toBeLessThanOrEqual(3);
    expect(two.crosswindSide).toBe("L");
    expect(Math.abs(two.exact.component - 8)).toBeLessThanOrEqual(3);
    expect(two.componentType).toBe("T");
    expect(two.crab).toBe(11);
    expect(two.trueHeading).toBe(319);
    expect(two.groundspeed).toBe(250);

    // Problem 5: winds 290/65, TC 335, TAS 322.
    expect(pressureAltitude(11000, 28.56)).toBeCloseTo(12360, 6);
    const five = preflightWind({ tas: 322, trueCourse: 335, windDirection: 290, windVelocity: 65 });
    expect(Math.abs(five.exact.crosswind - 46)).toBeLessThanOrEqual(3);
    expect(Math.abs(five.exact.component - 46)).toBeLessThanOrEqual(3);
    expect(five.componentType).toBe("H");
    expect(five.crab).toBe(8);
    expect(five.trueHeading).toBe(327);
    expect(five.groundspeed).toBe(276);

    // Problem 3b: 349 NM on TC 345 at TAS 300 in 280/22, off at 1315Z → 1427.
    const three = preflightWind({ tas: 300, trueCourse: 345, windDirection: 280, windVelocity: 22 });
    const eta = parseClock("1315")! + timeFor(349, three.groundspeed) / 60;
    expect(formatClock(eta)).toBe("1427");
  });

  it("solves the practice exam's preflight items", () => {
    // 26: wind 151/47, TAS 120, TC 267 → 246°/141 kt (answer B).
    const a = preflightWind({ tas: 120, trueCourse: 267, windDirection: 151, windVelocity: 47 });
    expect(a.trueHeading).toBe(246);
    expect(a.groundspeed).toBe(141);
    // 28: TC 290, TAS 192, wind 050/40 → 301°/212 kt (answer D).
    const b = preflightWind({ tas: 192, trueCourse: 290, windDirection: 50, windVelocity: 40 });
    expect(angularDifference(b.trueHeading, 301)).toBeLessThanOrEqual(3);
    expect(b.groundspeed).toBe(212);
    // 25: TC 206, TAS 470, wind 230/30 → 208°/443 kt (answer C).
    const c = preflightWind({ tas: 470, trueCourse: 206, windDirection: 230, windVelocity: 30 });
    expect(angularDifference(c.trueHeading, 208)).toBeLessThanOrEqual(3);
    expect(c.groundspeed).toBe(443);
  });

  it("reads the quartering analysis the way Figure 5-11 does", () => {
    // A left tailwind: TC 218 with the wind from 100.
    expect(quarteringAnalysis(218, 100)).toBe("left tail");
    expect(quarteringAnalysis(290, 50)).toBe("right tail");
    expect(quarteringAnalysis(40, 80)).toBe("right head");
    expect(quarteringAnalysis(250, 210)).toBe("left head");
  });
});

describe("in-flight winds — Assignment 6-6-3", () => {
  it("reproduces all 47 published solutions", () => {
    const misses: string[] = [];
    for (const row of INFLIGHT_WIND_PROBLEMS) {
      const s = inflightWind({
        trueHeading: row.th,
        tas: row.tas,
        track: row.trk,
        groundspeed: row.gs,
      });
      const band = row.vel >= 70 ? 5 : 3;
      const label = `TH ${row.th}/${row.tas} TRK ${row.trk}/${row.gs}`;

      if (s.drift !== row.da) misses.push(`${label} DA ${s.drift} vs ${row.da}`);
      if (Math.abs(s.exact.crosswind - row.xw) > band) {
        misses.push(`${label} XW ${s.exact.crosswind.toFixed(1)} vs ${row.xw}`);
      }
      if (Math.abs(s.exact.component - row.ht) > band) {
        misses.push(`${label} H/T ${s.exact.component.toFixed(1)} vs ${row.ht}`);
      }
      if (s.componentType !== row.htType) {
        misses.push(`${label} H/T type ${s.componentType} vs ${row.htType}`);
      }
      if (Math.abs(s.exact.velocity - row.vel) > band) {
        misses.push(`${label} VEL ${s.exact.velocity.toFixed(1)} vs ${row.vel}`);
      }
      if (angularDifference(s.exact.direction, row.dir) > band) {
        misses.push(`${label} DIR ${s.exact.direction.toFixed(1)} vs ${row.dir}`);
      }
    }
    expect(misses).toEqual([]);
  });

  it("reproduces the worked example in Information Sheet 6-6-2", () => {
    // TH 350, TAS 150, track 355, GS 160 → about 228°/17 kt.
    const s = inflightWind({ trueHeading: 350, tas: 150, track: 355, groundspeed: 160 });
    expect(s.drift).toBe(5);
    expect(s.driftSide).toBe("R");
    expect(s.crosswind).toBe(13);
    expect(s.crosswindSide).toBe("L");
    expect(s.componentType).toBe("T");
    // The key prints 17 kt; the components give 16.5, inside the ±3 allowed.
    expect(Math.abs(s.exact.velocity - 17)).toBeLessThanOrEqual(3);
    expect(angularDifference(s.direction, 228)).toBeLessThanOrEqual(3);
  });

  it("solves the published in-flight word problems", () => {
    // B1: TH 085, 10° right drift, GS 125, TAS 115 → 338°/22 kt.
    const one = inflightWind({ trueHeading: 85, tas: 115, track: 95, groundspeed: 125 });
    expect(angularDifference(one.direction, 338)).toBeLessThanOrEqual(3);
    expect(Math.abs(one.velocity - 22)).toBeLessThanOrEqual(3);

    // B2: track 175, 125 NM in 20 minutes, TH 185, TAS 360 → 278°/65 kt.
    const gs = speedFor(125, 20 * 60);
    expect(Math.round(gs)).toBe(375);
    const two = inflightWind({ trueHeading: 185, tas: 360, track: 175, groundspeed: gs });
    expect(angularDifference(two.direction, 278)).toBeLessThanOrEqual(3);
    expect(Math.abs(two.velocity - 65)).toBeLessThanOrEqual(3);

    // B3: TAS 300, TH 341, track 346, 349 NM flown 1315Z to 1420Z → 214°/33.
    const legGs = speedFor(349, 65 * 60);
    const three = inflightWind({ trueHeading: 341, tas: 300, track: 346, groundspeed: legGs });
    expect(angularDifference(three.direction, 214)).toBeLessThanOrEqual(3);
    expect(Math.abs(three.velocity - 33)).toBeLessThanOrEqual(3);
  });

  it("solves the practice exam's in-flight items", () => {
    // 30: TH 154/170, track 144/180 → 252°/32 kt (answer C).
    const a = inflightWind({ trueHeading: 154, tas: 170, track: 144, groundspeed: 180 });
    expect(angularDifference(a.direction, 252)).toBeLessThanOrEqual(3);
    expect(Math.abs(a.velocity - 32)).toBeLessThanOrEqual(3);
    // 32: track 103, TH 091, GS 375, TAS 425 → 043°/100 kt (answer B).
    const b = inflightWind({ trueHeading: 91, tas: 425, track: 103, groundspeed: 375 });
    expect(angularDifference(b.direction, 43)).toBeLessThanOrEqual(5);
    expect(Math.abs(b.velocity - 100)).toBeLessThanOrEqual(5);
  });

  it("is the inverse of the preflight solution", () => {
    // Plan a heading into a wind, then fly it: the wind that comes back out
    // has to be the wind that went in.
    for (const tc of [15, 100, 187, 264, 350]) {
      for (const dir of [30, 120, 210, 300]) {
        const plan = preflightWind({ tas: 250, trueCourse: tc, windDirection: dir, windVelocity: 40 });
        const back = inflightWind({
          trueHeading: plan.trueHeading,
          tas: 250,
          track: tc,
          groundspeed: plan.exact.groundspeed,
        });
        expect(angularDifference(back.exact.direction, dir)).toBeLessThanOrEqual(3);
        expect(Math.abs(back.exact.velocity - 40)).toBeLessThanOrEqual(3);
      }
    }
  });
});

describe("TACAN", () => {
  it("reproduces the point-to-point example in Information Sheet 6-6-2", () => {
    const r = pointToPoint(POINT_TO_POINT_EXAMPLE.from, POINT_TO_POINT_EXAMPLE.to);
    expect(angularDifference(r.course, POINT_TO_POINT_EXAMPLE.mc)).toBeLessThanOrEqual(3);
    expect(Math.abs(r.distance - POINT_TO_POINT_EXAMPLE.nm)).toBeLessThanOrEqual(1);
  });

  it("reproduces the published point-to-point answers", () => {
    const distanceMisses: string[] = [];
    for (const row of POINT_TO_POINT_PROBLEMS) {
      const r = pointToPoint(row.from, row.to);
      expect(angularDifference(r.course, row.mc)).toBeLessThanOrEqual(3);
      if (Math.abs(r.distance - row.nm) > 1) {
        distanceMisses.push(
          `${row.from.radial}/${row.from.dme} to ${row.to.radial}/${row.to.dme}: ${r.distance.toFixed(1)} vs ${row.nm}`,
        );
      }
    }
    // Item 6 is a grid-square reading; see SOURCE_DISCREPANCIES.
    expect(distanceMisses).toEqual(["71/94 to 20/15: 85.4 vs 87"]);
  });

  it("turns a bearing to the station into the radial", () => {
    for (const row of POINT_TO_POINT_PROBLEMS) {
      if (row.fromBearingTo === undefined) continue;
      expect(radialFromBearingTo(row.fromBearingTo)).toBe(row.from.radial);
    }
    // The BDHI in Figure 2-23: on the 135 radial, so the head reads 315.
    expect(radialFromBearingTo(315)).toBe(135);
    expect(reciprocal(360)).toBe(180);
    expect(reciprocal(180)).toBe(360);
  });

  it("is antisymmetric: reversing the fixes reverses the course", () => {
    const there = pointToPoint({ radial: 210, dme: 30 }, { radial: 45, dme: 44 });
    const back = pointToPoint({ radial: 45, dme: 44 }, { radial: 210, dme: 30 });
    expect(back.distance).toBeCloseTo(there.distance, 9);
    expect(angularDifference(back.course, reciprocal(there.course))).toBeLessThanOrEqual(1);
  });
});

describe("chart geometry — Assignment 6-2-3", () => {
  it("reproduces the published leg distances inside half a mile", () => {
    for (const row of CHART_LEG_PROBLEMS) {
      const r = courseAndDistance(
        { lat: dm(row.from[0], row.from[1]), lonW: dm(row.from[2], row.from[3]) },
        { lat: dm(row.to[0], row.to[1]), lonW: dm(row.to[2], row.to[3]) },
      );
      expect(
        Math.abs(r.distance - row.nm),
        `${row.from.join("/")} → ${row.to.join("/")}`,
      ).toBeLessThanOrEqual(TOLERANCES.distance.abs!);
    }
  });

  it("implies a whole-degree isogonic value on every published leg", () => {
    // The sheet prints magnetic courses but never the variation it used. If
    // the geometry is right, backing the variation out of each answer should
    // not produce a smear of odd fractions — it should land on the isogonic
    // lines the chart actually draws. It lands on exactly 3°E or 4°E, five
    // times out of five, which is a much stronger check than a range.
    const implied = CHART_LEG_PROBLEMS.map((row) => {
      const r = courseAndDistance(
        { lat: dm(row.from[0], row.from[1]), lonW: dm(row.from[2], row.from[3]) },
        { lat: dm(row.to[0], row.to[1]), lonW: dm(row.to[2], row.to[3]) },
      );
      return ((r.trueCourse - row.mc + 540) % 360) - 180;
    });
    expect(implied).toEqual([4, 3, 4, 3, 3]);
  });

  it("round-trips a projected point", () => {
    const start = { lat: dm(30, 21), lonW: dm(87, 19) };
    for (const course of [15, 75, 160, 245, 330]) {
      for (const nm of [5, 40, 120]) {
        const end = projectPoint(start, course, nm);
        const back = courseAndDistance(start, end);
        expect(Math.abs(back.distance - nm)).toBeLessThan(0.05);
        expect(angularDifference(back.trueCourse, course)).toBeLessThan(0.6);
      }
    }
  });

  it("measures a minute of latitude as one nautical mile", () => {
    const a = { lat: dm(30, 0), lonW: dm(90, 0) };
    const b = { lat: dm(30, 10), lonW: dm(90, 0) };
    expect(courseAndDistance(a, b).distance).toBeCloseTo(10, 6);
    expect(courseAndDistance(a, b).trueCourse).toBe(360);
  });

  it("shrinks a minute of longitude by the cosine of the latitude", () => {
    const at30 = courseAndDistance(
      { lat: 30, lonW: 90 },
      { lat: 30, lonW: dm(90, -10) },
    ).distance;
    const at45 = courseAndDistance(
      { lat: 45, lonW: 90 },
      { lat: 45, lonW: dm(90, -10) },
    ).distance;
    expect(at30).toBeCloseTo(10 * Math.cos((30 * Math.PI) / 180), 6);
    expect(at45).toBeLessThan(at30);
  });
});

describe("variation", () => {
  it("is least in the east and best in the west", () => {
    // The guide's own example: 045 true near Pensacola, 2° East, is 043 magnetic.
    expect(trueToMagnetic(45, 2)).toBe(43);
    expect(trueToMagnetic(45, -2)).toBe(47);
    // Plotting a TACAN radial runs the other way: 135 magnetic at 7° East is
    // a true radial of 142.
    expect(magneticToTrue(135, 7)).toBe(142);
  });

  it("round-trips through any variation", () => {
    for (let v = -20; v <= 20; v++) {
      for (const course of [1, 90, 180, 271, 360]) {
        expect(magneticToTrue(trueToMagnetic(course, v), v)).toBe(normalizeDirection(course));
      }
    }
  });

  it("prints north as 360, never 000", () => {
    expect(normalizeDirection(0)).toBe(360);
    expect(normalizeDirection(360)).toBe(360);
    expect(normalizeDirection(720)).toBe(360);
    expect(normalizeDirection(-1)).toBe(359);
  });
});

describe("estimation aids", () => {
  it("matches the rule of 60 table in Information Sheet 6-3-2", () => {
    const table: [number, number][] = [
      [60, 1], [120, 2], [180, 3], [240, 4], [300, 5],
      [360, 6], [420, 7], [480, 8], [540, 9], [600, 10],
    ];
    for (const [kt, nm] of table) expect(nmPerMinute(kt)).toBe(nm);
  });

  it("matches the rule of 6", () => {
    // At 300 kt an aircraft covers 30 NM in six minutes.
    expect(nmPerSixMinutes(300)).toBe(30);
    expect(nmPerSixMinutes(300)).toBeCloseTo(distanceFor(300, 6 * 60), 9);
  });

  it("matches the ten percent rule", () => {
    // A crosswind of 10% of TAS gives 6°, and it scales.
    expect(tenPercentRuleCrab(15, 150)).toBeCloseTo(6, 9);
    expect(tenPercentRuleCrab(30, 150)).toBeCloseTo(12, 9);
    // The rule is an estimate, so it should sit close to the real crab angle.
    const real = preflightWind({ tas: 325, trueCourse: 90, windDirection: 180, windVelocity: 32.5 });
    expect(Math.abs(real.exact.crab - tenPercentRuleCrab(32.5, 325))).toBeLessThan(0.5);
  });
});

describe("flight planning — Information Sheet 6-7-2", () => {
  it("reproduces the worked route from Tyndall to Marianna", () => {
    // Preflight winds 300/20, TAS 120, fuel flow 240 pph, 815 lb on board,
    // off at 1400Z. Leg one is 051°T for 36 NM; the guide plans 042°T at
    // 127 kt, a 17-minute ETE, and 68 lb of leg fuel.
    const route = planRoute({
      legs: [
        { name: "Blountstown", trueCourse: 51, distanceNm: 36 },
        { name: "Marianna", trueCourse: 342, distanceNm: 27 },
      ],
      tas: 120,
      windDirection: 300,
      windVelocity: 20,
      fuelFlowPph: 240,
      fuelOnBoard: 815,
      takeoffMinutes: parseClock("1400")!,
      variationEast: 2,
    });

    expect(angularDifference(route[0].trueHeading, 42)).toBeLessThanOrEqual(3);
    expect(Math.abs(route[0].groundspeed - 127)).toBeLessThanOrEqual(3);
    expect(Math.round(route[0].eteSeconds / 60)).toBe(17);
    expect(Math.abs(route[0].legFuel - 68)).toBeLessThanOrEqual(2);
    expect(Math.abs(route[0].efr - (815 - 68))).toBeLessThanOrEqual(2);

    // Leg two: the guide plans 334°T at 105 kt.
    expect(angularDifference(route[1].trueHeading, 334)).toBeLessThanOrEqual(3);
    expect(Math.abs(route[1].groundspeed - 105)).toBeLessThanOrEqual(3);
  });

  it("carries fuel and time forward down the log", () => {
    const route = planRoute({
      legs: [
        { name: "A", trueCourse: 90, distanceNm: 100 },
        { name: "B", trueCourse: 90, distanceNm: 100 },
      ],
      tas: 200,
      windDirection: 90,
      windVelocity: 0,
      fuelFlowPph: 600,
      fuelOnBoard: 3000,
      takeoffMinutes: 0,
      variationEast: 0,
    });
    expect(route[0].etaMinutes).toBeCloseTo(30, 6);
    expect(route[1].etaMinutes).toBeCloseTo(60, 6);
    expect(route[0].efr).toBeCloseTo(2700, 6);
    expect(route[1].efr).toBeCloseTo(2400, 6);
  });

  it("updates ETA and EFR from a new groundspeed — EOs 4.16 and 4.17", () => {
    const u = updateArrival({
      remainingNm: 26,
      groundspeed: 131,
      nowMinutes: 0,
      fuelOnBoard: 794.5,
      fuelFlowPph: 240,
    });
    // The guide's flight-conduct example: 26 NM at 131 kt is 11+54, burning
    // 47.5 lb, leaving 747 lb over Blountstown.
    // The key prints 11+54; 26 NM at 131 kt is 11+54.5.
    expect(Math.abs(u.eteSeconds - parseElapsed("0+11+54")!)).toBeLessThanOrEqual(2);
    expect(Math.abs(u.legFuel - 47.5)).toBeLessThanOrEqual(1);
    expect(Math.round(u.efr)).toBe(747);
  });

  it("solves the published flight-planning question 7", () => {
    // Overhead Natchitoches at 0944Z, needed over Beauregard at 1000Z.
    // The Natchitoches–Beauregard leg measures about 56 NM on the chart.
    const minutes = parseClock("1000")! - parseClock("0944")!;
    expect(minutes).toBe(16);
    // The published answer is 210 kt, which implies the leg the chart gives.
    expect(Math.round(distanceFor(210, minutes * 60))).toBe(56);
  });
});

describe("the discrepancy list is exactly the set of failures", () => {
  it("documents three, and only three", () => {
    expect(SOURCE_DISCREPANCIES).toHaveLength(3);
    for (const d of SOURCE_DISCREPANCIES) {
      expect(d.where).toMatch(/Assignment 6-/);
      expect(d.note.length).toBeGreaterThan(40);
    }
  });
});
