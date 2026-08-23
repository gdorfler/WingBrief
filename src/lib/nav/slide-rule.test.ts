/**
 * The simulated CR-3 has to give the same answers as the real one.
 *
 * Every case here is a setup the trainee guide walks through in prose, driven
 * through the slide-rule geometry and read back off the scales. If the wheel
 * were rendered correctly but geared wrongly, these would fail; a screenshot
 * would not.
 */

import { describe, expect, it } from "vitest";
import {
  HIGH_SPEED_INDEX,
  RATE_INDEX,
  UNIT_INDEX,
  angleToValue,
  buildHourMarks,
  buildTicks,
  chooseIndex,
  crabFromCrosswind,
  crosswindFromCrab,
  currentRatio,
  decadeExponent,
  readInner,
  readOuter,
  rotationFor,
  suggestedWindScale,
  tickIncrement,
  toDecade,
  valueToAngle,
} from "./slide-rule";

/** Reads are mantissas; the student places the decimal from their estimate. */
function expectReading(actual: number, expected: number, pctTolerance = 1) {
  const target = toDecade(expected);
  const error = Math.abs(actual - target);
  expect(error, `${actual.toFixed(3)} vs ${target}`).toBeLessThanOrEqual(
    (target * pctTolerance) / 100,
  );
}

describe("the logarithmic scale", () => {
  it("wraps every value into the printed decade", () => {
    expect(toDecade(21)).toBeCloseTo(21, 9);
    expect(toDecade(2.1)).toBeCloseTo(21, 9);
    expect(toDecade(0.21)).toBeCloseTo(21, 9);
    expect(toDecade(210)).toBeCloseTo(21, 9);
    expect(toDecade(2100)).toBeCloseTo(21, 9);
  });

  it("tracks how many powers of ten it removed", () => {
    expect(decadeExponent(21)).toBe(0);
    expect(decadeExponent(210)).toBe(1);
    expect(decadeExponent(2100)).toBe(2);
    expect(decadeExponent(2.1)).toBe(-1);
  });

  it("puts 10 at the top and runs a full turn to the next 10", () => {
    expect(valueToAngle(10)).toBeCloseTo(0, 9);
    expect(valueToAngle(100)).toBeCloseTo(0, 9);
    expect(valueToAngle(31.6227766)).toBeCloseTo(180, 6);
  });

  it("is its own inverse", () => {
    for (const v of [10, 12.5, 17, 23.4, 36, 48, 60, 77, 99.9]) {
      expect(angleToValue(valueToAngle(v))).toBeCloseTo(v, 9);
    }
  });

  it("graduates the way Information Sheet 6-3-2 describes", () => {
    // Nine ticks between whole numbers from 10 to 15, so each is worth one
    // unit at that end of the scale.
    expect(tickIncrement(11)).toBeCloseTo(0.1, 9);
    expect(tickIncrement(14.9)).toBeCloseTo(0.1, 9);
    // Four between 15 and 30, so each is worth two.
    expect(tickIncrement(15)).toBeCloseTo(0.2, 9);
    expect(tickIncrement(29)).toBeCloseTo(0.2, 9);
    // One between whole numbers from 30 to 60, worth five.
    expect(tickIncrement(30)).toBeCloseTo(2.5, 9);

    const ticks = buildTicks();
    expect(ticks.filter((t) => t.label !== undefined).length).toBeGreaterThan(10);
    // The scale never doubles back on itself.
    const angles = ticks.map((t) => t.angle);
    expect(angles).toEqual([...angles].sort((a, b) => a - b));
  });
});

describe("ratio problems", () => {
  it("solves the guide's 1:2 = 8:X example", () => {
    // Set 10 over 20, then read under 80. The answer is 16.
    const rotation = rotationFor(10, 20);
    expectReading(readInner(rotation, 80), 16);
  });

  it("holds every equivalent ratio at once, which is the point of the wheel", () => {
    const rotation = rotationFor(10, 20);
    expect(currentRatio(rotation)).toBeCloseTo(toDecade(10) / toDecade(20) < 1 ? 5 : 5, 6);
    // One setup, several reads: 30/60, 45/90, 12.5/25 are all aligned.
    expectReading(readInner(rotation, 30), 60);
    expectReading(readInner(rotation, 45), 90);
    expectReading(readInner(rotation, 12.5), 25);
  });
});

describe("time, speed and distance on the wheel", () => {
  it("reproduces the worked TIME example: 350 NM at 150 kt", () => {
    // Groundspeed over the rate index, then read below 350.
    const rotation = rotationFor(150, RATE_INDEX);
    expectReading(readInner(rotation, 350), 140); // 140 minutes = 2+20
  });

  it("reproduces the worked high-speed example: 5 NM at 250 kt", () => {
    // Speed over the seconds bug, then read below 5.
    const rotation = rotationFor(250, HIGH_SPEED_INDEX);
    expectReading(readInner(rotation, 5), 72); // 72 seconds
  });

  it("reproduces the worked SPEED example: 30 NM in 11 minutes", () => {
    // Distance over time, then read above the rate index.
    const rotation = rotationFor(30, 11);
    expectReading(readOuter(rotation, RATE_INDEX), 164);
  });

  it("reproduces the worked DISTANCE example: 240 kt for 19 minutes", () => {
    const rotation = rotationFor(240, RATE_INDEX);
    expectReading(readOuter(rotation, 19), 76);
  });

  /*
   * The two sweeps below check the wheel against the formulas in math.ts
   * rather than against the printed keys directly. math.test.ts already
   * proves the formulas reproduce the keys; what has to be true here is that
   * setting the instrument up the way the guide describes reads back the same
   * number the formula gives — otherwise a student following the procedure
   * would be led somewhere the answer key is not.
   */
  it("reads the same time as the formula on all 25 published setups", async () => {
    const { TIME_PROBLEMS } = await import("./official-data");
    const { timeFor } = await import("./math");
    for (const row of TIME_PROBLEMS) {
      const seconds = timeFor(row.d, row.s);
      const useSeconds = seconds < 300;
      const rotation = rotationFor(row.s, useSeconds ? HIGH_SPEED_INDEX : RATE_INDEX);
      const read = readInner(rotation, row.d);
      expectReading(read, useSeconds ? seconds : seconds / 60, 0.01);
    }
  });

  it("reads the same speed as the formula on all 25 published setups", async () => {
    const { SPEED_PROBLEMS } = await import("./official-data");
    const { parseElapsed, speedFor } = await import("./math");
    for (const row of SPEED_PROBLEMS) {
      const seconds = parseElapsed(row.t)!;
      const useSeconds = seconds < 300;
      const rotation = rotationFor(row.d, useSeconds ? seconds : seconds / 60);
      const read = readOuter(rotation, useSeconds ? HIGH_SPEED_INDEX : RATE_INDEX);
      expectReading(read, speedFor(row.d, seconds), 0.01);
    }
  });

  it("reads the same distance and fuel as the formulas", async () => {
    const { DISTANCE_PROBLEMS, FUEL_PROBLEMS } = await import("./official-data");
    const { distanceFor, fuelBurned, parseElapsed } = await import("./math");
    for (const row of DISTANCE_PROBLEMS) {
      const seconds = parseElapsed(row.t)!;
      const useSeconds = seconds < 300;
      const rotation = rotationFor(row.s, useSeconds ? HIGH_SPEED_INDEX : RATE_INDEX);
      const read = readOuter(rotation, useSeconds ? seconds : seconds / 60);
      expectReading(read, distanceFor(row.s, seconds), 0.01);
    }
    for (const row of FUEL_PROBLEMS) {
      if (row.solve !== "quantity") continue;
      const seconds = parseElapsed(row.time!)!;
      const rotation = rotationFor(row.flow!, RATE_INDEX);
      const read = readOuter(rotation, seconds / 60);
      expectReading(read, fuelBurned(row.flow!, seconds), 0.01);
    }
  });
});

describe("fuel on the wheel", () => {
  it("reproduces the worked consumption example: 1,000 pph for 1+45", () => {
    const rotation = rotationFor(1000, RATE_INDEX);
    expectReading(readOuter(rotation, 105), 1750);
  });

  it("reproduces the worked fuel-flow example: 117 lb in 45 seconds", () => {
    const rotation = rotationFor(117, 45);
    expectReading(readOuter(rotation, HIGH_SPEED_INDEX), 9350, 1.5);
  });

  it("reproduces the worked conversion: 525 gallons at 6.6 lb", () => {
    // Conversions use the unit index — there is no time in the problem.
    const rotation = rotationFor(6.6, UNIT_INDEX);
    expectReading(readOuter(rotation, 525), 3465);
  });

  it("reproduces the worked conversion: 6,000 lb at 6.4 lb per gallon", () => {
    const rotation = rotationFor(6.4, UNIT_INDEX);
    expectReading(readInner(rotation, 6000), 938);
  });
});

describe("choosing the index", () => {
  it("uses the unit index when no time is involved", () => {
    expect(chooseIndex({ involvesTime: false })).toBe(UNIT_INDEX);
  });

  it("reaches for the seconds bug on each of the four printed triggers", () => {
    expect(chooseIndex({ involvesTime: true, seconds: 120 })).toBe(HIGH_SPEED_INDEX);
    expect(chooseIndex({ involvesTime: true, distanceNm: 4 })).toBe(HIGH_SPEED_INDEX);
    expect(chooseIndex({ involvesTime: true, speedKt: 650 })).toBe(HIGH_SPEED_INDEX);
    expect(chooseIndex({ involvesTime: true, speedKt: 500 })).toBe(HIGH_SPEED_INDEX);
  });

  it("otherwise uses the rate index", () => {
    expect(chooseIndex({ involvesTime: true, speedKt: 220, distanceNm: 310 })).toBe(RATE_INDEX);
  });
});

describe("the hour circle", () => {
  it("reads 150 minutes as 2:30, as the guide's figure shows", () => {
    const marks = buildHourMarks();
    const at150 = marks.find((m) => m.minutes === 150);
    expect(at150?.label).toBe("2:30");
    expect(at150?.angle).toBeCloseTo(valueToAngle(150), 9);
  });

  it("reads 190 minutes as 3:10 — the guide's conversion example", () => {
    expect(buildHourMarks().find((m) => m.minutes === 190)?.label).toBe("3:10");
  });

  it("puts the ten-minute marks between the hours", () => {
    const marks = buildHourMarks();
    expect(marks.find((m) => m.minutes === 160)?.label).toBe("2:40");
    expect(marks.find((m) => m.minutes === 120)?.major).toBe(true);
    expect(marks.find((m) => m.minutes === 130)?.major).toBe(false);
  });
});

describe("the wind side", () => {
  it("gives 6 degrees of crab for a crosswind of ten percent of TAS", () => {
    for (const tas of [100, 150, 325, 470, 800]) {
      expect(crabFromCrosswind(tas * 0.1, tas)).toBeCloseTo(5.73, 2);
    }
  });

  it("reproduces the guide's crab reading: 35 kt crosswind at 325 kt TAS", () => {
    expect(crabFromCrosswind(35, 325)).toBeCloseTo(6.2, 1);
  });

  it("reproduces the in-flight read: 5 degrees of drift at 150 kt is 13 kt", () => {
    expect(Math.round(crosswindFromCrab(5, 150))).toBe(13);
  });

  it("round-trips", () => {
    for (const tas of [120, 250, 600]) {
      for (const xw of [5, 20, 60]) {
        expect(crosswindFromCrab(crabFromCrosswind(xw, tas), tas)).toBeCloseTo(xw, 9);
      }
    }
  });

  it("agrees with the trigonometric solution across the course's range", () => {
    // The wheel is a small-angle approximation. Inside the crab angles this
    // course actually produces it has to be indistinguishable from asin.
    for (const tas of [100, 200, 400, 800]) {
      for (let xw = 0; xw <= tas * 0.2; xw += tas * 0.02) {
        const linear = crabFromCrosswind(xw, tas);
        const exact = (Math.asin(xw / tas) * 180) / Math.PI;
        expect(Math.abs(linear - exact)).toBeLessThan(0.5);
      }
    }
  });

  it("picks the scale the guide prescribes", () => {
    expect(suggestedWindScale(40)).toBe("large");
    expect(suggestedWindScale(59)).toBe("large");
    expect(suggestedWindScale(60)).toBe("small");
    expect(suggestedWindScale(120)).toBe("small");
  });
});
