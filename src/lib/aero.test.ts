import { describe, expect, it } from "vitest";
import {
  CL_CONFIG,
  ISA,
  REFERENCE_DRAG,
  T6B_VN,
  acceleratedStallSpeed,
  argMin,
  atmosphereAt,
  bankForLoadFactor,
  coefficientOfLift,
  densityAltitude,
  envelopeVerdict,
  excessPower,
  excessThrust,
  humidityDensityFactor,
  iasFromTas,
  inducedDrag,
  indicatedStallSpeed,
  ldMaxVelocity,
  loadFactor,
  machNumber,
  maneuverSpeed,
  maxEnduranceVelocity,
  parasiteDrag,
  powerRequired,
  stallSpeedMultiplier,
  takeoffDistanceRatio,
  tasFromIas,
  thrustAvailable,
  totalDrag,
  trueStallSpeed,
  turnRadius,
  turnRate,
  vortexStrength,
  withFlaps,
  withSlat,
} from "./aero";

/**
 * These tests exist to protect the DIRECTION of every relationship the app
 * teaches. A diagram that animates the wrong way is worse than no diagram.
 */

describe("standard atmosphere", () => {
  it("matches sea-level standard values", () => {
    const sl = atmosphereAt(0);
    expect(sl.temperature).toBeCloseTo(ISA.tempSL, 5);
    expect(sl.pressure).toBeCloseTo(ISA.pressureSL, 3);
    expect(sl.densityRatio).toBeCloseTo(1, 3);
    expect(sl.speedOfSound).toBeCloseTo(ISA.lsosSL, 1);
  });

  it("applies the 2 °C per 1,000 ft lapse rate", () => {
    expect(atmosphereAt(10_000).temperature).toBeCloseTo(15 - 20, 5);
    expect(atmosphereAt(20_000).temperature).toBeCloseTo(15 - 40, 5);
  });

  it("holds the isothermal layer at −56.5 °C above 36,000 ft", () => {
    expect(atmosphereAt(40_000).temperature).toBeCloseTo(ISA.isothermalTemp, 5);
    expect(atmosphereAt(40_000).inIsothermalLayer).toBe(true);
  });

  it("drops pressure, temperature and density together with altitude", () => {
    const low = atmosphereAt(0);
    const mid = atmosphereAt(10_000);
    const high = atmosphereAt(25_000);
    expect(mid.pressure).toBeLessThan(low.pressure);
    expect(high.pressure).toBeLessThan(mid.pressure);
    expect(mid.temperature).toBeLessThan(low.temperature);
    expect(mid.densityRatio).toBeLessThan(low.densityRatio);
    expect(high.densityRatio).toBeLessThan(mid.densityRatio);
  });

  it("slows the speed of sound as temperature falls", () => {
    expect(atmosphereAt(30_000).speedOfSound).toBeLessThan(atmosphereAt(0).speedOfSound);
  });

  it("raises density altitude on a hot day", () => {
    expect(densityAltitude(2_000, 20)).toBeGreaterThan(2_000);
    expect(densityAltitude(2_000, -20)).toBeLessThan(2_000);
  });

  it("reduces density as humidity rises", () => {
    expect(humidityDensityFactor(1, 30)).toBeLessThan(humidityDensityFactor(0, 30));
    expect(humidityDensityFactor(1, 30)).toBeLessThan(1);
  });
});

describe("airspeed conversions", () => {
  it("makes TAS exceed IAS above sea level", () => {
    const ratio = atmosphereAt(10_000).densityRatio;
    expect(tasFromIas(150, ratio)).toBeGreaterThan(150);
  });

  it("makes TAS equal IAS at sea level", () => {
    expect(tasFromIas(150, 1)).toBeCloseTo(150, 6);
  });

  it("round-trips IAS and TAS", () => {
    const ratio = atmosphereAt(18_000).densityRatio;
    expect(iasFromTas(tasFromIas(120, ratio), ratio)).toBeCloseTo(120, 6);
  });

  it("widens the TAS/IAS gap with altitude", () => {
    const gap = (alt: number) => tasFromIas(150, atmosphereAt(alt).densityRatio) - 150;
    expect(gap(20_000)).toBeGreaterThan(gap(10_000));
  });

  it("raises Mach number with altitude at constant IAS", () => {
    const machAt = (alt: number) => {
      const a = atmosphereAt(alt);
      return machNumber(tasFromIas(250, a.densityRatio), a.speedOfSound);
    };
    expect(machAt(25_000)).toBeGreaterThan(machAt(5_000));
  });
});

describe("coefficient of lift", () => {
  it("gives a positively cambered airfoil positive lift at zero AOA", () => {
    expect(coefficientOfLift(0, CL_CONFIG.positive)).toBeGreaterThan(0);
  });

  it("gives a symmetric airfoil zero lift at zero AOA", () => {
    expect(coefficientOfLift(0, CL_CONFIG.symmetric)).toBeCloseTo(0, 6);
  });

  it("gives a negatively cambered airfoil negative lift at zero AOA", () => {
    expect(coefficientOfLift(0, CL_CONFIG.negative)).toBeLessThan(0);
  });

  it("rises with AOA up to CLmax AOA", () => {
    const cfg = CL_CONFIG.positive;
    expect(coefficientOfLift(4, cfg)).toBeGreaterThan(coefficientOfLift(0, cfg));
    expect(coefficientOfLift(12, cfg)).toBeGreaterThan(coefficientOfLift(4, cfg));
  });

  it("falls past CLmax AOA — the definition of a stall", () => {
    const cfg = CL_CONFIG.positive;
    const peak = coefficientOfLift(cfg.clMaxAoa, cfg);
    expect(coefficientOfLift(cfg.clMaxAoa + 4, cfg)).toBeLessThan(peak);
    expect(coefficientOfLift(cfg.clMaxAoa + 10, cfg)).toBeLessThan(
      coefficientOfLift(cfg.clMaxAoa + 4, cfg),
    );
  });

  it("keeps some lift in the stall rather than dropping to zero", () => {
    const cfg = CL_CONFIG.positive;
    expect(coefficientOfLift(30, cfg)).toBeGreaterThan(0);
  });

  it("flaps raise CLmax and LOWER CLmax AOA", () => {
    const clean = CL_CONFIG.positive;
    const flapped = withFlaps(clean);
    expect(flapped.clMax).toBeGreaterThan(clean.clMax);
    expect(flapped.clMaxAoa).toBeLessThan(clean.clMaxAoa);
    // And CL is higher at every ordinary angle of attack.
    expect(coefficientOfLift(4, flapped)).toBeGreaterThan(coefficientOfLift(4, clean));
  });

  it("slats raise CLmax AND CLmax AOA, without changing low-AOA CL", () => {
    const clean = CL_CONFIG.positive;
    const slatted = withSlat(clean);
    expect(slatted.clMax).toBeGreaterThan(clean.clMax);
    expect(slatted.clMaxAoa).toBeGreaterThan(clean.clMaxAoa);
    expect(coefficientOfLift(2, slatted)).toBeCloseTo(coefficientOfLift(2, clean), 6);
  });
});

describe("drag", () => {
  it("makes parasite drag rise with the square of velocity", () => {
    const d1 = parasiteDrag(0.5, REFERENCE_DRAG);
    const d2 = parasiteDrag(1.0, REFERENCE_DRAG);
    expect(d2 / d1).toBeCloseTo(4, 4);
  });

  it("makes induced drag fall with the square of velocity", () => {
    const d1 = inducedDrag(0.5, REFERENCE_DRAG);
    const d2 = inducedDrag(1.0, REFERENCE_DRAG);
    expect(d1 / d2).toBeCloseTo(4, 4);
  });

  it("makes induced drag rise with the square of weight", () => {
    const light = inducedDrag(0.6, REFERENCE_DRAG);
    const heavy = inducedDrag(0.6, { ...REFERENCE_DRAG, weight: 2 });
    expect(heavy / light).toBeCloseTo(4, 4);
  });

  it("reduces induced drag with a longer wingspan", () => {
    const short = inducedDrag(0.6, REFERENCE_DRAG);
    const long = inducedDrag(0.6, { ...REFERENCE_DRAG, span: 1.5 });
    expect(long).toBeLessThan(short);
  });

  it("puts L/Dmax exactly where parasite equals induced", () => {
    const v = ldMaxVelocity(REFERENCE_DRAG);
    expect(parasiteDrag(v, REFERENCE_DRAG)).toBeCloseTo(
      inducedDrag(v, REFERENCE_DRAG),
      6,
    );
  });

  it("puts L/Dmax at the minimum of the total drag curve", () => {
    const analytic = ldMaxVelocity(REFERENCE_DRAG);
    const numeric = argMin((v) => totalDrag(v, REFERENCE_DRAG), 0.1, 2, 4000);
    expect(numeric).toBeCloseTo(analytic, 2);
  });

  it("moves L/Dmax airspeed up with weight and with altitude", () => {
    const base = ldMaxVelocity(REFERENCE_DRAG);
    expect(ldMaxVelocity({ ...REFERENCE_DRAG, weight: 1.4 })).toBeGreaterThan(base);
    expect(ldMaxVelocity({ ...REFERENCE_DRAG, densityRatio: 0.6 })).toBeGreaterThan(base);
  });

  it("makes induced drag dominate below L/Dmax and parasite above it", () => {
    const v = ldMaxVelocity(REFERENCE_DRAG);
    expect(inducedDrag(v * 0.6, REFERENCE_DRAG)).toBeGreaterThan(
      parasiteDrag(v * 0.6, REFERENCE_DRAG),
    );
    expect(parasiteDrag(v * 1.6, REFERENCE_DRAG)).toBeGreaterThan(
      inducedDrag(v * 1.6, REFERENCE_DRAG),
    );
  });

  it("raises the whole curve when the gear adds parasite area", () => {
    const clean = totalDrag(0.8, REFERENCE_DRAG);
    const dirty = totalDrag(0.8, { ...REFERENCE_DRAG, f: 1.5 });
    expect(dirty).toBeGreaterThan(clean);
  });
});

describe("thrust and power", () => {
  it("drops turboprop thrust available as velocity rises", () => {
    expect(thrustAvailable(1.0, "turboprop", 1)).toBeLessThan(
      thrustAvailable(0.3, "turboprop", 1),
    );
  });

  it("keeps turbojet thrust available flat with velocity", () => {
    expect(thrustAvailable(1.0, "turbojet", 1)).toBeCloseTo(
      thrustAvailable(0.3, "turbojet", 1),
      6,
    );
  });

  it("reduces thrust available with density for both engine types", () => {
    expect(thrustAvailable(0.6, "turboprop", 0.6)).toBeLessThan(
      thrustAvailable(0.6, "turboprop", 1),
    );
    expect(thrustAvailable(0.6, "turbojet", 0.6)).toBeLessThan(
      thrustAvailable(0.6, "turbojet", 1),
    );
  });

  it("places minimum power required LEFT of L/Dmax", () => {
    const ldmax = ldMaxVelocity(REFERENCE_DRAG);
    const minPr = maxEnduranceVelocity(REFERENCE_DRAG);
    expect(minPr).toBeLessThan(ldmax);
  });

  it("places turboprop max power excess at approximately L/Dmax", () => {
    const ldmax = ldMaxVelocity(REFERENCE_DRAG);
    let best = 0;
    let bestV = 0;
    for (let v = 0.1; v < 1.6; v += 0.002) {
      const pe = excessPower(v, REFERENCE_DRAG, "turboprop");
      if (pe > best) {
        best = pe;
        bestV = v;
      }
    }
    expect(Math.abs(bestV - ldmax)).toBeLessThan(0.16);
  });

  it("places turboprop max thrust excess BELOW L/Dmax", () => {
    const ldmax = ldMaxVelocity(REFERENCE_DRAG);
    let best = -Infinity;
    let bestV = 0;
    for (let v = 0.1; v < 1.6; v += 0.002) {
      const te = excessThrust(v, REFERENCE_DRAG, "turboprop");
      if (te > best) {
        best = te;
        bestV = v;
      }
    }
    expect(bestV).toBeLessThan(ldmax);
  });

  it("shrinks excess thrust when weight increases", () => {
    const light = excessThrust(0.6, REFERENCE_DRAG, "turboprop");
    const heavy = excessThrust(0.6, { ...REFERENCE_DRAG, weight: 1.4 }, "turboprop");
    expect(heavy).toBeLessThan(light);
  });

  it("shrinks excess power when the gear comes down", () => {
    const clean = excessPower(0.6, REFERENCE_DRAG, "turboprop");
    const dirty = excessPower(0.6, { ...REFERENCE_DRAG, f: 1.6 }, "turboprop");
    expect(dirty).toBeLessThan(clean);
  });

  it("keeps power required as thrust required times velocity", () => {
    expect(powerRequired(0.7, REFERENCE_DRAG)).toBeCloseTo(
      totalDrag(0.7, REFERENCE_DRAG) * 0.7,
      8,
    );
  });
});

describe("load factor and turn performance", () => {
  it("gives 2 G at 60 degrees of bank", () => {
    expect(loadFactor(60)).toBeCloseTo(2, 3);
  });

  it("gives 1 G wings level", () => {
    expect(loadFactor(0)).toBeCloseTo(1, 6);
  });

  it("raises stall speed by about 40% at 2 G", () => {
    expect(stallSpeedMultiplier(2)).toBeCloseTo(1.414, 3);
  });

  it("inverts cleanly between bank and load factor", () => {
    expect(bankForLoadFactor(2)).toBeCloseTo(60, 2);
    expect(bankForLoadFactor(1)).toBe(0);
  });

  it("increases turn radius and decreases turn rate with airspeed", () => {
    expect(turnRadius(30, 200)).toBeGreaterThan(turnRadius(30, 100));
    expect(turnRate(30, 200)).toBeLessThan(turnRate(30, 100));
  });

  it("decreases turn radius and increases turn rate with bank", () => {
    expect(turnRadius(60, 150)).toBeLessThan(turnRadius(30, 150));
    expect(turnRate(60, 150)).toBeGreaterThan(turnRate(30, 150));
  });

  it("returns an infinite radius wings level", () => {
    expect(turnRadius(0, 150)).toBe(Infinity);
  });
});

describe("stall speed", () => {
  const base = {
    weightRatio: 1,
    densityRatio: 1,
    clMaxRatio: 1,
    loadFactor: 1,
    baseline: 100,
  };

  it("raises stall speed with weight", () => {
    expect(trueStallSpeed({ ...base, weightRatio: 1.44 })).toBeCloseTo(120, 4);
  });

  it("raises TRUE stall speed with altitude", () => {
    expect(trueStallSpeed({ ...base, densityRatio: 0.7 })).toBeGreaterThan(100);
  });

  it("leaves INDICATED stall speed unchanged with altitude", () => {
    expect(indicatedStallSpeed({ ...base, densityRatio: 0.5 })).toBeCloseTo(100, 6);
    expect(indicatedStallSpeed({ ...base, densityRatio: 1 })).toBeCloseTo(100, 6);
  });

  it("lowers stall speed when flaps raise CLmax", () => {
    expect(trueStallSpeed({ ...base, clMaxRatio: 1.4 })).toBeLessThan(100);
  });

  it("raises stall speed with load factor by √n", () => {
    expect(trueStallSpeed({ ...base, loadFactor: 4 })).toBeCloseTo(200, 4);
  });
});

describe("V-n envelope", () => {
  it("derives the T-6B maneuver speed near its published 227 KIAS", () => {
    expect(maneuverSpeed(T6B_VN)).toBeGreaterThan(220);
    expect(maneuverSpeed(T6B_VN)).toBeLessThan(234);
  });

  it("scales the accelerated stall line as √n", () => {
    expect(acceleratedStallSpeed(T6B_VN, 4)).toBeCloseTo(T6B_VN.stallSpeed * 2, 4);
  });

  it("accepts a point inside the envelope", () => {
    expect(envelopeVerdict(T6B_VN, 200, 3)).toBe("safe");
  });

  it("stalls below the accelerated stall line", () => {
    expect(envelopeVerdict(T6B_VN, 100, 3)).toBe("stall");
  });

  it("over-Gs above the positive limit", () => {
    expect(envelopeVerdict(T6B_VN, 280, 8)).toBe("overG-positive");
  });

  it("over-Gs below the negative limit", () => {
    expect(envelopeVerdict(T6B_VN, 280, -4)).toBe("overG-negative");
  });

  it("overspeeds beyond redline", () => {
    expect(envelopeVerdict(T6B_VN, 340, 1)).toBe("overspeed");
  });

  it("makes over-G impossible below maneuver speed", () => {
    const va = maneuverSpeed(T6B_VN);
    for (let n = 1; n <= 12; n += 0.25) {
      const verdict = envelopeVerdict(T6B_VN, va - 20, n);
      expect(verdict === "overG-positive").toBe(false);
    }
  });
});

describe("takeoff performance", () => {
  const base = { weightRatio: 1, densityRatio: 1, clMaxRatio: 1, windFraction: 0 };

  it("quadruples distance when weight doubles", () => {
    const ratio = takeoffDistanceRatio({ ...base, weightRatio: 2 });
    expect(ratio).toBeCloseTo(4, 4);
  });

  it("lengthens the roll as density falls", () => {
    expect(takeoffDistanceRatio({ ...base, densityRatio: 0.75 })).toBeGreaterThan(1);
  });

  it("shortens the roll with a headwind and lengthens it with a tailwind", () => {
    expect(takeoffDistanceRatio({ ...base, windFraction: 0.2 })).toBeLessThan(1);
    expect(takeoffDistanceRatio({ ...base, windFraction: -0.2 })).toBeGreaterThan(1);
  });

  it("shortens the roll when flaps raise CLmax", () => {
    expect(takeoffDistanceRatio({ ...base, clMaxRatio: 1.3 })).toBeLessThan(1);
  });
});

describe("wake turbulence", () => {
  it("is strongest heavy, slow and clean", () => {
    const worst = vortexStrength({ weight: 1.6, speed: 0.3, dirty: false });
    const best = vortexStrength({ weight: 0.4, speed: 1.4, dirty: true });
    expect(worst).toBeGreaterThan(best);
    expect(worst).toBeGreaterThan(80);
    expect(best).toBeLessThan(20);
  });

  it("weakens with a dirty configuration", () => {
    const clean = vortexStrength({ weight: 1, speed: 0.6, dirty: false });
    const dirty = vortexStrength({ weight: 1, speed: 0.6, dirty: true });
    expect(dirty).toBeLessThan(clean);
  });

  it("weakens as the generating aircraft speeds up", () => {
    expect(vortexStrength({ weight: 1, speed: 1.2, dirty: false })).toBeLessThan(
      vortexStrength({ weight: 1, speed: 0.5, dirty: false }),
    );
  });
});
