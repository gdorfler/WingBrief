/**
 * The geometry of the CR-3's circular slide rule.
 *
 * The calculation side is two concentric logarithmic scales. Everything the
 * instrument can do follows from one fact: a rotation of the inner wheel fixes
 * a ratio between the two scales, and once that ratio is set, *every* pair of
 * values in that ratio is simultaneously aligned. That is why the guide says a
 * ratio problem is solved by "transferring the ratio directly to the outer and
 * inner scales" — you do not compute anything, you set one pair and read
 * another.
 *
 * This file exists separately from the component so the maths can be tested
 * against the worked examples in Information Sheet 6-3-2 without rendering
 * anything. A wheel that looks right and reads wrong would be worse than no
 * wheel at all.
 */

/* ------------------------------------------------------------------ */
/* The logarithmic scale                                               */
/* ------------------------------------------------------------------ */

/**
 * Both scales are graduated 10 to 100, printed as 10 through 90, and wrap at
 * a full turn. Any value is brought into that decade first — the CR-3's
 * "floating decimal", where the printed 21 stands equally for 0.21, 2.1, 21,
 * 210 or 2100, and the student places the decimal from their estimate.
 */
export function toDecade(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 10;
  let v = value;
  while (v >= 100) v /= 10;
  while (v < 10) v *= 10;
  return v;
}

/** How many powers of ten were removed to bring a value into the decade. */
export function decadeExponent(value: number): number {
  return Math.round(Math.log10(value / toDecade(value)));
}

/** Clockwise angle in degrees, from the 10 index at twelve o'clock. */
export function valueToAngle(value: number): number {
  return (Math.log10(toDecade(value) / 10) * 360) % 360;
}

/** The inverse: what is printed at this angle, within the decade. */
export function angleToValue(angleDeg: number): number {
  const a = ((angleDeg % 360) + 360) % 360;
  return 10 * 10 ** (a / 360);
}

/* ------------------------------------------------------------------ */
/* The indexes                                                         */
/* ------------------------------------------------------------------ */

/**
 * The rate index sits where 60 would be on the inner wheel, because 60
 * minutes is an hour and almost every rate problem in aviation is per hour.
 */
export const RATE_INDEX = 60;

/**
 * The high-speed, or "seconds bug", index sits at 36 — 3,600 seconds is also
 * an hour. Used when the time being read is seconds rather than minutes.
 * The reference card gives four triggers for reaching for it: time under five
 * minutes, distance under five miles, speed at or above 500 knots, or seconds
 * appearing anywhere in the estimate, the question or the answer.
 */
export const HIGH_SPEED_INDEX = 36;

/** The unit index, at 10, for anything that is not a rate. */
export const UNIT_INDEX = 10;

/* ------------------------------------------------------------------ */
/* Rotation and reading                                                */
/* ------------------------------------------------------------------ */

/**
 * The rotation that places `innerValue` under `outerValue`.
 *
 * Positive rotation turns the inner wheel clockwise. Because both scales are
 * logarithmic, this is entirely determined by the ratio — which is the whole
 * trick of the instrument.
 */
export function rotationFor(outerValue: number, innerValue: number): number {
  return normalizeRotation(valueToAngle(outerValue) - valueToAngle(innerValue));
}

export function normalizeRotation(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * The outer value currently sitting above a given inner value — the read.
 *
 * The result is a bare mantissa in 10–100, exactly what the printed scale
 * shows. Placing the decimal is the student's job, and the guide is emphatic
 * about that: "Always estimate the approximate answer before interpreting the
 * computer."
 */
export function readOuter(rotation: number, innerValue: number): number {
  return angleToValue(valueToAngle(innerValue) + rotation);
}

/** The inner value currently sitting below a given outer value. */
export function readInner(rotation: number, outerValue: number): number {
  return angleToValue(valueToAngle(outerValue) - rotation);
}

/**
 * The ratio the wheel is currently set to, outer over inner, as a pure number
 * between 1 and 10. Every aligned pair on the instrument sits in this ratio.
 */
export function currentRatio(rotation: number): number {
  return 10 ** (normalizeRotation(rotation) / 360);
}

/* ------------------------------------------------------------------ */
/* Tick marks                                                          */
/* ------------------------------------------------------------------ */

export interface Tick {
  value: number;
  angle: number;
  /** "major" is a printed number, "mid" a longer mark, "minor" a hairline. */
  weight: "major" | "mid" | "minor";
  label?: string;
}

/**
 * The graduation pattern, straight out of Information Sheet 6-3-2: nine ticks
 * between whole numbers from 10 to 15, four from 15 to 30, one from 30 to 60,
 * and none above. That unevenness is not decoration — it is why a student has
 * to know which stretch of the scale they are on before they can say what a
 * mark is worth, and why "±1 unit on the logarithmic scale" is defined
 * against the 10-to-15 section specifically.
 */
export function buildTicks(): Tick[] {
  const ticks: Tick[] = [];
  const push = (value: number, weight: Tick["weight"], label?: string) => {
    ticks.push({ value, angle: valueToAngle(value), weight, label });
  };

  for (let whole = 10; whole < 15; whole++) {
    push(whole, "major", String(whole));
    for (let i = 1; i < 10; i++) push(whole + i / 10, i === 5 ? "mid" : "minor");
  }
  for (let whole = 15; whole < 30; whole++) {
    const labelled = whole % 5 === 0;
    push(whole, "major", labelled ? String(whole) : undefined);
    for (let i = 1; i < 5; i++) push(whole + i / 5, i === 2 ? "mid" : "minor");
  }
  for (let whole = 30; whole < 60; whole += 5) {
    push(whole, "major", String(whole));
    push(whole + 2.5, "minor");
  }
  for (let whole = 60; whole < 100; whole += 10) {
    push(whole, "major", String(whole));
    push(whole + 5, "minor");
  }
  return ticks;
}

/** What one tick mark is worth at a given point on the scale. */
export function tickIncrement(value: number): number {
  const v = toDecade(value);
  if (v < 15) return 0.1;
  if (v < 30) return 0.2;
  if (v < 60) return 2.5;
  return 5;
}

/* ------------------------------------------------------------------ */
/* The hour circle                                                     */
/* ------------------------------------------------------------------ */

export interface HourMark {
  /** Minutes on the time scale. */
  minutes: number;
  angle: number;
  label: string;
  major: boolean;
}

/**
 * The inner hour circle, which converts the minute scale to hours and minutes
 * without any arithmetic: 150 on the time scale reads 2:30 directly beneath
 * it. The same marks serve minutes-and-seconds when the time scale is being
 * read as seconds, since the ratio is identical.
 */
export function buildHourMarks(): HourMark[] {
  const marks: HourMark[] = [];
  for (let minutes = 60; minutes < 1000; minutes += 10) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    marks.push({
      minutes,
      angle: valueToAngle(minutes),
      label: `${h}:${String(m).padStart(2, "0")}`,
      major: m === 0,
    });
  }
  return marks;
}

/* ------------------------------------------------------------------ */
/* Setups for the problem families                                     */
/* ------------------------------------------------------------------ */

export type Cr3Setup =
  | { kind: "rate"; outer: number; innerIndex: typeof RATE_INDEX }
  | { kind: "highSpeed"; outer: number; innerIndex: typeof HIGH_SPEED_INDEX }
  | { kind: "unit"; outer: number; innerIndex: typeof UNIT_INDEX }
  | { kind: "pair"; outer: number; inner: number };

/**
 * The rotation a given setup requires. Used by the worked-solution replay to
 * drive the wheel to the position the guide describes, one step at a time.
 */
export function rotationForSetup(setup: Cr3Setup): number {
  switch (setup.kind) {
    case "rate":
    case "highSpeed":
    case "unit":
      return rotationFor(setup.outer, setup.innerIndex);
    case "pair":
      return rotationFor(setup.outer, setup.inner);
  }
}

/**
 * Which index a problem should be set up against.
 *
 * The four triggers for the high-speed index are printed on the reference
 * card at the back of the trainee guide, and the point of them is that a
 * student should not be deciding this by feel.
 */
export function chooseIndex(params: {
  speedKt?: number;
  distanceNm?: number;
  seconds?: number;
  involvesTime: boolean;
}): typeof RATE_INDEX | typeof HIGH_SPEED_INDEX | typeof UNIT_INDEX {
  if (!params.involvesTime) return UNIT_INDEX;
  const highSpeed =
    (params.seconds !== undefined && params.seconds <= 300) ||
    (params.distanceNm !== undefined && params.distanceNm <= 5) ||
    (params.speedKt !== undefined && params.speedKt >= 500);
  return highSpeed ? HIGH_SPEED_INDEX : RATE_INDEX;
}

/* ------------------------------------------------------------------ */
/* The wind side                                                       */
/* ------------------------------------------------------------------ */

/**
 * The wind side's crab scale is logarithmic too, for the same reason.
 *
 * For the angles this course produces, crab ≈ 57.3 × crosswind ÷ TAS, and the
 * logarithm turns that division into the same fixed offset the calculation
 * side uses. It is also exactly where the ten percent rule comes from: a
 * crosswind of a tenth of TAS gives 57.3 × 0.1 ≈ 6°, at any airspeed. The
 * rule is not a rule of thumb bolted on afterwards — it is a reading of the
 * instrument's own geometry.
 */
export const DEG_PER_RADIAN = 57.29577951308232;

export function crabFromCrosswind(crosswindKt: number, tas: number): number {
  return (DEG_PER_RADIAN * crosswindKt) / tas;
}

export function crosswindFromCrab(crabDeg: number, tas: number): number {
  return (crabDeg * tas) / DEG_PER_RADIAN;
}

/**
 * The two wind grids. Information Sheet 6-5-2: the large scale runs 0 to 80
 * and is used when the wind is under 60 knots; the small scale runs 0 to 160
 * for anything stronger. Mixing them inside one problem is the classic way to
 * get a plausible, wrong answer, so the tool tracks which one is in use.
 */
export type WindScale = "large" | "small";

export const WIND_SCALE_MAX: Record<WindScale, number> = { large: 80, small: 160 };

export function suggestedWindScale(velocity: number): WindScale {
  return velocity < 60 ? "large" : "small";
}
