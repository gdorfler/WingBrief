/**
 * Aerodynamic models shared by every diagram, explainer and Sim Lab.
 *
 * Design rule from the content brief: DO NOT FABRICATE PRECISE AIRCRAFT
 * PERFORMANCE VALUES. Anything genuinely computable from a supported equation
 * (standard atmosphere, load factor, turn rate and radius, stall-speed ratios,
 * Mach number) is computed exactly. Everything else — drag, thrust, power — is
 * expressed in RELATIVE / INDEXED units so the shape and direction of every
 * relationship is correct without inventing pounds and knots.
 */

/* ------------------------------------------------------------------ */
/* Standard atmosphere — real values, from the trainee guide           */
/* ------------------------------------------------------------------ */

export const ISA = {
  /** in-Hg */
  pressureSL: 29.92,
  /** °C */
  tempSL: 15,
  /** slugs/ft³ */
  densitySL: 0.0024,
  /** knots */
  lsosSL: 661.7,
  /** °C per 1,000 ft */
  lapseRatePer1000: 2,
  /** ft — top of the troposphere in the course's model */
  tropopause: 36_000,
  /** °C — isothermal layer temperature */
  isothermalTemp: -56.5,
} as const;

export interface AtmosphereState {
  altitude: number;
  /** °C */
  temperature: number;
  /** in-Hg */
  pressure: number;
  /** slugs/ft³ */
  density: number;
  /** density ÷ sea-level density */
  densityRatio: number;
  /** knots */
  speedOfSound: number;
  inIsothermalLayer: boolean;
}

/** Standard-atmosphere state at a pressure altitude, with an OAT deviation. */
export function atmosphereAt(altitude: number, tempDeviationC = 0): AtmosphereState {
  const inIsothermalLayer = altitude >= ISA.tropopause;
  const standardTemp = inIsothermalLayer
    ? ISA.isothermalTemp
    : ISA.tempSL - (ISA.lapseRatePer1000 * altitude) / 1000;
  const temperature = standardTemp + tempDeviationC;

  // Troposphere pressure ratio from the standard lapse-rate model.
  const tempRatioStd = (ISA.tempSL + 273.15 - (ISA.lapseRatePer1000 * Math.min(altitude, ISA.tropopause)) / 1000) /
    (ISA.tempSL + 273.15);
  let pressureRatio = Math.pow(tempRatioStd, 5.2559);
  if (inIsothermalLayer) {
    // Above the tropopause pressure decays exponentially at constant T.
    const dz = altitude - ISA.tropopause;
    pressureRatio *= Math.exp(-dz / 20_805);
  }

  const pressure = ISA.pressureSL * pressureRatio;
  // P = ρRT rearranged into ratios: ρ/ρ₀ = (P/P₀) / (T/T₀).
  const absTempRatio = (temperature + 273.15) / (ISA.tempSL + 273.15);
  const densityRatio = pressureRatio / absTempRatio;

  return {
    altitude,
    temperature,
    pressure,
    density: ISA.densitySL * densityRatio,
    densityRatio,
    speedOfSound: ISA.lsosSL * Math.sqrt((temperature + 273.15) / (ISA.tempSL + 273.15)),
    inIsothermalLayer,
  };
}

/**
 * Density altitude — pressure altitude corrected for temperature deviation.
 * Uses the standard 120 ft per °C approximation the course charts imply.
 */
export function densityAltitude(pressureAltitude: number, tempDeviationC: number): number {
  return Math.round(pressureAltitude + 120 * tempDeviationC);
}

/** Humidity lowers density. Modelled as a small proportional reduction. */
export function humidityDensityFactor(relativeHumidity: number, temperatureC: number): number {
  // Warm air holds far more vapour, so the effect scales with temperature.
  const vapourCapacity = Math.max(0, (temperatureC + 10) / 45);
  return 1 - 0.03 * relativeHumidity * vapourCapacity;
}

/* ------------------------------------------------------------------ */
/* Airspeed conversions — exact                                        */
/* ------------------------------------------------------------------ */

export function tasFromIas(ias: number, densityRatio: number): number {
  return ias / Math.sqrt(Math.max(densityRatio, 1e-6));
}

export function iasFromTas(tas: number, densityRatio: number): number {
  return tas * Math.sqrt(Math.max(densityRatio, 1e-6));
}

export function machNumber(tas: number, speedOfSound: number): number {
  return tas / speedOfSound;
}

/* ------------------------------------------------------------------ */
/* Lift — indexed                                                      */
/* ------------------------------------------------------------------ */

/**
 * CL vs AOA. Linear to CLmax AOA, then a rounded fall-off into the stall.
 * Camber shifts the curve horizontally; flaps raise CLmax and lower CLmax AOA.
 */
export interface ClCurveConfig {
  /** Zero-lift AOA in degrees. Negative for positive camber. */
  zeroLiftAoa: number;
  /** Lift-curve slope, CL per degree. */
  slope: number;
  clMax: number;
  clMaxAoa: number;
}

export const CL_CONFIG = {
  positive: { zeroLiftAoa: -4, slope: 0.1, clMax: 1.5, clMaxAoa: 16 },
  symmetric: { zeroLiftAoa: 0, slope: 0.1, clMax: 1.3, clMaxAoa: 16 },
  negative: { zeroLiftAoa: 4, slope: 0.1, clMax: 1.1, clMaxAoa: 16 },
} as const satisfies Record<string, ClCurveConfig>;

/** Flaps: camber increases, so CLmax rises and CLmax AOA falls. */
export function withFlaps(config: ClCurveConfig): ClCurveConfig {
  return {
    zeroLiftAoa: config.zeroLiftAoa - 6,
    slope: config.slope,
    clMax: config.clMax + 0.55,
    clMaxAoa: config.clMaxAoa - 3,
  };
}

/** Boundary layer control: CLmax AND CLmax AOA both rise; low-AOA CL unchanged. */
export function withSlat(config: ClCurveConfig): ClCurveConfig {
  return {
    zeroLiftAoa: config.zeroLiftAoa,
    slope: config.slope,
    clMax: config.clMax + 0.4,
    clMaxAoa: config.clMaxAoa + 6,
  };
}

export function coefficientOfLift(aoaDeg: number, config: ClCurveConfig): number {
  const { zeroLiftAoa, slope, clMax, clMaxAoa } = config;
  const linear = slope * (aoaDeg - zeroLiftAoa);
  if (aoaDeg <= clMaxAoa - 4) return linear;

  // Round the peak so CLmax is reached smoothly, then fall away past the stall.
  if (aoaDeg <= clMaxAoa) {
    const t = (aoaDeg - (clMaxAoa - 4)) / 4;
    const target = clMax;
    const base = slope * (clMaxAoa - 4 - zeroLiftAoa);
    return base + (target - base) * (1 - (1 - t) ** 2);
  }
  const past = aoaDeg - clMaxAoa;
  return Math.max(0.25, clMax - 0.055 * past ** 1.35);
}

/** L = ½ρV²SC_L, in whatever consistent units the caller supplies. */
export function lift(
  density: number,
  velocity: number,
  wingArea: number,
  cl: number,
): number {
  return 0.5 * density * velocity ** 2 * wingArea * cl;
}

export function dynamicPressure(density: number, velocity: number): number {
  return 0.5 * density * velocity ** 2;
}

/* ------------------------------------------------------------------ */
/* Drag — indexed, shape-correct                                       */
/* ------------------------------------------------------------------ */

export interface DragConfig {
  /** Equivalent parasite area, indexed. Gear and flaps raise it. */
  f: number;
  /** Weight, indexed to 1.0 at reference. */
  weight: number;
  /** Density ratio, 1.0 at sea level. */
  densityRatio: number;
  /** Wingspan, indexed to 1.0. */
  span: number;
}

export const REFERENCE_DRAG: DragConfig = {
  f: 1,
  weight: 1,
  densityRatio: 1,
  span: 1,
};

/** D_P = ½ρV²f — rises with the square of velocity. */
export function parasiteDrag(v: number, cfg: DragConfig): number {
  return 0.5 * cfg.densityRatio * v ** 2 * cfg.f;
}

/** D_I = kW² / (ρV²b²) — falls with the square of velocity. */
export function inducedDrag(v: number, cfg: DragConfig): number {
  const k = 0.5;
  return (k * cfg.weight ** 2) / (cfg.densityRatio * Math.max(v, 0.05) ** 2 * cfg.span ** 2);
}

export function totalDrag(v: number, cfg: DragConfig): number {
  return parasiteDrag(v, cfg) + inducedDrag(v, cfg);
}

/**
 * Velocity at L/Dmax — where parasite equals induced. Solved analytically so
 * the marker always lands exactly on the minimum of the plotted curve.
 */
export function ldMaxVelocity(cfg: DragConfig): number {
  // ½ρV²f = kW²/(ρV²b²)  →  V⁴ = 2kW² / (ρ²fb²)
  const k = 0.5;
  const v4 =
    (2 * k * cfg.weight ** 2) / (cfg.densityRatio ** 2 * cfg.f * cfg.span ** 2);
  return Math.pow(v4, 0.25);
}

export function minTotalDrag(cfg: DragConfig): number {
  return totalDrag(ldMaxVelocity(cfg), cfg);
}

/* ------------------------------------------------------------------ */
/* Thrust and power — indexed                                          */
/* ------------------------------------------------------------------ */

export type EngineType = "turboprop" | "turbojet";

/** Thrust required equals total drag in equilibrium flight. */
export function thrustRequired(v: number, cfg: DragConfig): number {
  return totalDrag(v, cfg);
}

/**
 * Thrust available. A turboprop loses thrust with velocity because the
 * propeller accelerates the incoming air less; a turbojet's ram effect keeps
 * it roughly flat. Both fall with density.
 */
export function thrustAvailable(
  v: number,
  engine: EngineType,
  densityRatio: number,
  throttle = 1,
): number {
  const base = 3.4 * throttle * Math.pow(densityRatio, 0.8);
  if (engine === "turbojet") return base * 0.62;
  return base / (1 + 1.55 * v);
}

export function powerRequired(v: number, cfg: DragConfig): number {
  return thrustRequired(v, cfg) * v;
}

export function powerAvailable(
  v: number,
  engine: EngineType,
  densityRatio: number,
  throttle = 1,
): number {
  return thrustAvailable(v, engine, densityRatio, throttle) * v;
}

export function excessThrust(
  v: number,
  cfg: DragConfig,
  engine: EngineType,
  throttle = 1,
): number {
  return thrustAvailable(v, engine, cfg.densityRatio, throttle) - thrustRequired(v, cfg);
}

export function excessPower(
  v: number,
  cfg: DragConfig,
  engine: EngineType,
  throttle = 1,
): number {
  return powerAvailable(v, engine, cfg.densityRatio, throttle) - powerRequired(v, cfg);
}

/** Numerically finds the velocity that maximises a function over a range. */
export function argMax(
  f: (v: number) => number,
  from = 0.08,
  to = 1.6,
  steps = 400,
): number {
  let best = from;
  let bestVal = -Infinity;
  for (let i = 0; i <= steps; i++) {
    const v = from + ((to - from) * i) / steps;
    const val = f(v);
    if (val > bestVal) {
      bestVal = val;
      best = v;
    }
  }
  return best;
}

export function argMin(
  f: (v: number) => number,
  from = 0.08,
  to = 1.6,
  steps = 400,
): number {
  return argMax((v) => -f(v), from, to, steps);
}

/** Bottom of the power required curve — max endurance for a turboprop. */
export function maxEnduranceVelocity(cfg: DragConfig): number {
  return argMin((v) => powerRequired(v, cfg));
}

/* ------------------------------------------------------------------ */
/* Maneuvering — exact                                                 */
/* ------------------------------------------------------------------ */

const G_FT_S2 = 32.174;
const KTS_TO_FT_S = 1.68781;

/** n = 1 / cos φ. */
export function loadFactor(bankDeg: number): number {
  const rad = (Math.min(Math.abs(bankDeg), 89.4) * Math.PI) / 180;
  return 1 / Math.cos(rad);
}

/** Stall speed multiplier at a given load factor: √n. */
export function stallSpeedMultiplier(n: number): number {
  return Math.sqrt(Math.max(n, 0));
}

/** ω = g tan φ / V, in degrees per second, V in knots (TAS). */
export function turnRate(bankDeg: number, velocityKts: number): number {
  const rad = (Math.min(Math.abs(bankDeg), 89.4) * Math.PI) / 180;
  const vFtS = Math.max(velocityKts, 1) * KTS_TO_FT_S;
  return ((G_FT_S2 * Math.tan(rad)) / vFtS) * (180 / Math.PI);
}

/** r = V² / (g tan φ), in feet, V in knots (TAS). */
export function turnRadius(bankDeg: number, velocityKts: number): number {
  const rad = (Math.min(Math.abs(bankDeg), 89.4) * Math.PI) / 180;
  const tan = Math.tan(rad);
  if (tan < 1e-4) return Infinity;
  const vFtS = velocityKts * KTS_TO_FT_S;
  return vFtS ** 2 / (G_FT_S2 * tan);
}

/**
 * Bank angle needed for a given load factor — the inverse of n = 1/cos φ.
 * Used by the V-n lab to place the aircraft state.
 */
export function bankForLoadFactor(n: number): number {
  if (n <= 1) return 0;
  return (Math.acos(1 / n) * 180) / Math.PI;
}

/* ------------------------------------------------------------------ */
/* Stall speed — exact ratios                                          */
/* ------------------------------------------------------------------ */

export interface StallSpeedInputs {
  /** Reference weight ratio, 1.0 at the baseline. */
  weightRatio: number;
  /** Local density ÷ sea level density. */
  densityRatio: number;
  /** CLmax ÷ baseline CLmax. Flaps raise this. */
  clMaxRatio: number;
  /** Load factor. */
  loadFactor: number;
  /** Baseline (clean, 1 G, sea level) stall speed in knots. */
  baseline: number;
}

/** True stall speed. Vs = √(2Wn / ρSC_Lmax). */
export function trueStallSpeed(i: StallSpeedInputs): number {
  return (
    i.baseline *
    Math.sqrt(
      (i.weightRatio * i.loadFactor) / (Math.max(i.densityRatio, 1e-6) * i.clMaxRatio),
    )
  );
}

/** Indicated stall speed uses ρ₀ — so it does NOT change with altitude. */
export function indicatedStallSpeed(i: StallSpeedInputs): number {
  return i.baseline * Math.sqrt((i.weightRatio * i.loadFactor) / i.clMaxRatio);
}

/* ------------------------------------------------------------------ */
/* V-n envelope — exact shape                                          */
/* ------------------------------------------------------------------ */

export interface VnConfig {
  /** Wings-level 1 G stall speed, KIAS. */
  stallSpeed: number;
  positiveLimit: number;
  negativeLimit: number;
  redline: number;
}

export const T6B_VN: VnConfig = {
  // 1 G stall speed is implied by the T-6B maneuver speed (227 KIAS) and its
  // +7.0 G limit: Va = Vs√n → Vs = 227 / √7 ≈ 86 KIAS.
  stallSpeed: 86,
  positiveLimit: 7,
  negativeLimit: -3.5,
  redline: 316,
};

/** Accelerated stall speed at a load factor: Vs√|n|. */
export function acceleratedStallSpeed(cfg: VnConfig, n: number): number {
  return cfg.stallSpeed * Math.sqrt(Math.abs(n));
}

/** Maneuver speed (cornering velocity) = Vs√(limit load). */
export function maneuverSpeed(cfg: VnConfig): number {
  return acceleratedStallSpeed(cfg, cfg.positiveLimit);
}

/** Maximum load factor achievable at a given indicated airspeed. */
export function maxLoadFactorAt(cfg: VnConfig, kias: number): number {
  return Math.min(cfg.positiveLimit, (kias / cfg.stallSpeed) ** 2);
}

export function isInsideEnvelope(cfg: VnConfig, kias: number, n: number): boolean {
  if (kias > cfg.redline) return false;
  if (n > cfg.positiveLimit || n < cfg.negativeLimit) return false;
  const stallN = (kias / cfg.stallSpeed) ** 2;
  return Math.abs(n) <= stallN;
}

export type EnvelopeVerdict =
  | "safe"
  | "stall"
  | "overG-positive"
  | "overG-negative"
  | "overspeed";

export function envelopeVerdict(
  cfg: VnConfig,
  kias: number,
  n: number,
): EnvelopeVerdict {
  if (kias > cfg.redline) return "overspeed";
  // The stall boundary is checked BEFORE the structural limit: below maneuver
  // speed the wing runs out of CL first, which is exactly why an over-G is
  // impossible down there.
  const stallN = (kias / cfg.stallSpeed) ** 2;
  if (Math.abs(n) > stallN) return "stall";
  if (n > cfg.positiveLimit) return "overG-positive";
  if (n < cfg.negativeLimit) return "overG-negative";
  return "safe";
}

/* ------------------------------------------------------------------ */
/* Takeoff and landing — relative                                      */
/* ------------------------------------------------------------------ */

export interface TakeoffInputs {
  weightRatio: number;
  densityRatio: number;
  clMaxRatio: number;
  /** Headwind positive, tailwind negative, as a fraction of takeoff speed. */
  windFraction: number;
}

/** Takeoff speed as a multiple of the baseline. TAS grows as density falls. */
export function takeoffSpeedRatio(i: TakeoffInputs): number {
  return Math.sqrt(i.weightRatio / (i.densityRatio * i.clMaxRatio));
}

/**
 * Takeoff distance relative to baseline. Weight enters squared; density and
 * CLmax divide; wind shifts the required groundspeed.
 */
export function takeoffDistanceRatio(i: TakeoffInputs): number {
  const base = i.weightRatio ** 2 / (i.densityRatio * i.clMaxRatio);
  // Thrust also falls with density, which lengthens the roll further.
  const thrustPenalty = 1 / Math.pow(Math.max(i.densityRatio, 0.4), 0.6);
  const windEffect = Math.max(0.35, (1 - i.windFraction) ** 2);
  return base * thrustPenalty * windEffect;
}

/* ------------------------------------------------------------------ */
/* Wake turbulence — relative                                          */
/* ------------------------------------------------------------------ */

export interface WakeInputs {
  /** 0.4–1.6, indexed. */
  weight: number;
  /** 0.3–1.4, indexed. */
  speed: number;
  /** true = flaps/gear extended. */
  dirty: boolean;
}

/**
 * Vortex strength, 0–100. Strongest when heavy, slow and clean — the exact
 * relationship the trainee guide states.
 */
export function vortexStrength(i: WakeInputs): number {
  const weightTerm = i.weight;
  const speedTerm = 1 / Math.max(i.speed, 0.2);
  const configTerm = i.dirty ? 0.62 : 1;
  const raw = weightTerm * speedTerm * configTerm;
  return Math.round(Math.min(100, (raw / 3.2) * 100));
}

/** Sink rate in fpm — the guide's 400–500 fpm, scaled by strength. */
export function wakeSinkRate(strength: number): number {
  return Math.round(400 + (strength / 100) * 100);
}
