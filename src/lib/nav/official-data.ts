/**
 * The published answer keys from NAVAVSCOLSCOM-SG-200 Unit 6.
 *
 * Every table in this file is transcribed verbatim from the trainee guide's
 * end-of-chapter answer keys. It exists for two reasons, and both matter:
 *
 * 1. **Validation.** math.test.ts runs all of it through src/lib/nav/math.ts
 *    and asserts each computed value lands inside the tolerance Appendix A
 *    publishes. If a formula in this course is wrong, several hundred official
 *    numbers say so immediately.
 * 2. **Drill material.** These are the actual reps the course sets — 25 time
 *    problems, 25 speed, 25 distance, 25 fuel, 50 preflight winds, 47 in-flight
 *    winds. Generating lookalikes when the real ones are published and keyed
 *    would be strictly worse.
 *
 * Nothing here is invented. Where a printed key disagrees with the arithmetic,
 * that row is listed in SOURCE_DISCREPANCIES rather than quietly corrected.
 */

/* ------------------------------------------------------------------ */
/* Chapter 3 — CR-3 calculation side                                   */
/* ------------------------------------------------------------------ */

/** Assignment 6-3-3 A: find the TIME, given distance (NM) and speed (kt). */
export const TIME_PROBLEMS: { d: number; s: number; answer: string }[] = [
  { d: 310, s: 220, answer: "1+24+33" },
  { d: 45, s: 430, answer: "0+06+17" },
  { d: 215, s: 165, answer: "1+18+11" },
  { d: 125, s: 545, answer: "0+13+48" },
  { d: 1500, s: 330, answer: "4+32+43" },
  { d: 5, s: 210, answer: "0+01+26" },
  { d: 2, s: 415, answer: "0+00+17" },
  { d: 15, s: 620, answer: "0+01+27" },
  { d: 435, s: 145, answer: "3+00+00" },
  { d: 2600, s: 360, answer: "7+13+20" },
  { d: 85, s: 510, answer: "0+10+00" },
  { d: 560, s: 405, answer: "1+22+58" },
  { d: 1.5, s: 110, answer: "0+00+49" },
  { d: 95, s: 225, answer: "0+25+20" },
  { d: 135, s: 450, answer: "0+18+00" },
  { d: 1450, s: 300, answer: "4+50+00" },
  { d: 850, s: 185, answer: "4+35+40" },
  { d: 3, s: 215, answer: "0+00+50" },
  { d: 90, s: 640, answer: "0+08+26" },
  { d: 500, s: 260, answer: "1+55+23" },
  { d: 117, s: 415, answer: "0+16+54" },
  { d: 720, s: 150, answer: "4+48+00" },
  { d: 510, s: 380, answer: "1+20+30" },
  { d: 480, s: 530, answer: "0+54+20" },
  { d: 3.5, s: 650, answer: "0+00+19" },
];

/** Assignment 6-3-3 B: find the SPEED, given distance (NM) and time. */
export const SPEED_PROBLEMS: { d: number; t: string; answer: number }[] = [
  { d: 425, t: "1+50+00", answer: 232 },
  { d: 300, t: "2+00+00", answer: 150 },
  { d: 20, t: "0+30+00", answer: 40 },
  { d: 600, t: "2+30+00", answer: 240 },
  { d: 1200, t: "4+00+00", answer: 300 },
  { d: 15, t: "0+10+00", answer: 90 },
  { d: 285, t: "0+50+00", answer: 342 },
  { d: 5, t: "0+00+20", answer: 900 },
  { d: 1000, t: "3+20+00", answer: 300 },
  { d: 22, t: "0+15+00", answer: 88 },
  { d: 3, t: "0+00+15", answer: 720 },
  { d: 300, t: "1+00+00", answer: 300 },
  { d: 550, t: "3+00+00", answer: 184 },
  { d: 3000, t: "7+00+00", answer: 430 },
  { d: 300, t: "0+45+00", answer: 400 },
  { d: 195, t: "0+30+00", answer: 390 },
  { d: 1600, t: "4+00+00", answer: 400 },
  { d: 5.5, t: "0+00+45", answer: 440 },
  { d: 625, t: "1+50+00", answer: 340 },
  { d: 60, t: "0+20+00", answer: 180 },
  { d: 375, t: "1+40+00", answer: 225 },
  { d: 98, t: "0+19+00", answer: 309 },
  { d: 525, t: "1+10+00", answer: 450 },
  { d: 200, t: "1+40+00", answer: 120 },
  { d: 3, t: "0+00+31", answer: 348 },
];

/** Assignment 6-3-3 C: find the DISTANCE, given speed (kt) and time. */
export const DISTANCE_PROBLEMS: { s: number; t: string; answer: number }[] = [
  { s: 220, t: "2+00+00", answer: 440 },
  { s: 175, t: "1+30+00", answer: 262 },
  { s: 310, t: "0+40+00", answer: 207 },
  { s: 420, t: "0+45+00", answer: 315 },
  { s: 250, t: "0+00+13", answer: 0.9 },
  { s: 195, t: "7+00+00", answer: 1368 },
  { s: 620, t: "1+30+00", answer: 930 },
  { s: 725, t: "1+40+00", answer: 1210 },
  { s: 230, t: "0+00+50", answer: 3.2 },
  { s: 385, t: "2+30+00", answer: 960 },
  { s: 435, t: "0+17+00", answer: 123 },
  { s: 150, t: "0+37+00", answer: 93 },
  { s: 240, t: "1+10+00", answer: 280 },
  { s: 400, t: "0+00+45", answer: 5 },
  { s: 520, t: "1+30+00", answer: 780 },
  { s: 210, t: "0+50+00", answer: 175 },
  { s: 340, t: "0+30+00", answer: 170 },
  { s: 175, t: "0+22+00", answer: 64 },
  { s: 700, t: "4+00+00", answer: 2800 },
  { s: 210, t: "1+50+00", answer: 384 },
  { s: 120, t: "0+00+42", answer: 1.4 },
  { s: 625, t: "2+00+00", answer: 1250 },
  { s: 430, t: "0+40+00", answer: 286 },
  { s: 195, t: "0+00+37", answer: 2 },
  { s: 300, t: "5+20+00", answer: 1600 },
];

/**
 * Assignment 6-3-3 D: fuel consumption. Exactly one of the three columns is
 * blank on the printed sheet; `solve` names which one the student produces.
 */
export const FUEL_PROBLEMS: {
  flow?: number;
  time?: string;
  quantity?: number;
  solve: "flow" | "time" | "quantity";
  answer: number | string;
}[] = [
  { flow: 1500, time: "1+25+00", solve: "quantity", answer: 2124 },
  { flow: 175, time: "0+17+00", solve: "quantity", answer: 49.5 },
  { flow: 550, time: "3+30+00", solve: "quantity", answer: 1920 },
  { flow: 2900, time: "2+54+00", solve: "quantity", answer: 8400 },
  { time: "1+15+00", quantity: 2500, solve: "flow", answer: 2000 },
  { flow: 270, quantity: 3250, solve: "time", answer: "12+02+00" },
  { flow: 1400, quantity: 15000, solve: "time", answer: "10+42+00" },
  { time: "0+45+00", quantity: 117, solve: "flow", answer: 156 },
  { flow: 1870, time: "2+10+00", solve: "quantity", answer: 4050 },
  { flow: 770, quantity: 2800, solve: "time", answer: "3+38+00" },
  { time: "6+30+00", quantity: 25000, solve: "flow", answer: 3850 },
  { flow: 325, time: "4+27+00", solve: "quantity", answer: 1445 },
  { flow: 1660, time: "5+50+00", solve: "quantity", answer: 9700 },
  { time: "0+36+00", quantity: 256, solve: "flow", answer: 427 },
  { flow: 425, quantity: 250, solve: "time", answer: "0+36+00" },
  { time: "3+00+00", quantity: 756, solve: "flow", answer: 252 },
  { flow: 1100, time: "2+15+00", solve: "quantity", answer: 2470 },
  { flow: 4300, quantity: 7500, solve: "time", answer: "1+45+00" },
  { time: "7+00+00", quantity: 1250, solve: "flow", answer: 178 },
  { time: "1+25+00", quantity: 335, solve: "flow", answer: 236 },
  { flow: 655, time: "4+45+00", solve: "quantity", answer: 3120 },
  { flow: 1750, time: "10+30+00", solve: "quantity", answer: 18400 },
  { flow: 350, quantity: 935, solve: "time", answer: "2+42+00" },
  { time: "3+35+00", quantity: 1675, solve: "flow", answer: 468 },
  { time: "0+53+00", quantity: 850, solve: "flow", answer: 960 },
];

/** Assignment 6-3-3 E: fuel conversion between gallons and pounds. */
export const FUEL_CONVERSION_PROBLEMS: {
  lbsPerGal: number;
  pounds?: number;
  gallons?: number;
  solve: "pounds" | "gallons";
  answer: number;
}[] = [
  { lbsPerGal: 6.4, pounds: 2340, solve: "gallons", answer: 365 },
  { lbsPerGal: 6.6, pounds: 4200, solve: "gallons", answer: 638 },
  { lbsPerGal: 6.8, gallons: 2200, solve: "pounds", answer: 14950 },
  { lbsPerGal: 6.5, pounds: 14000, solve: "gallons", answer: 2158 },
  { lbsPerGal: 6.6, gallons: 640, solve: "pounds", answer: 4230 },
  { lbsPerGal: 6.5, gallons: 1200, solve: "pounds", answer: 7800 },
  { lbsPerGal: 6.8, pounds: 8750, solve: "gallons", answer: 1285 },
  { lbsPerGal: 6.5, gallons: 3000, solve: "pounds", answer: 19500 },
  { lbsPerGal: 6.8, pounds: 12600, solve: "gallons", answer: 1855 },
  { lbsPerGal: 6.5, gallons: 860, solve: "pounds", answer: 5600 },
];

/* ------------------------------------------------------------------ */
/* Chapter 2 — global timekeeping                                      */
/* ------------------------------------------------------------------ */

/**
 * Assignment 6-2-3 items 30–39. Exactly one of GMT / LMT is printed; the
 * student supplies the other. Times are minutes past midnight.
 */
export const TIME_ZONE_PROBLEMS: {
  zd: number;
  gmt?: string;
  lmt?: string;
  solve: "gmt" | "lmt";
  answer: string;
}[] = [
  { zd: +9, gmt: "1320", solve: "lmt", answer: "2220" },
  { zd: -3, gmt: "2130", solve: "lmt", answer: "1830" },
  { zd: +4, lmt: "1410", solve: "gmt", answer: "1010" },
  { zd: -6, lmt: "1652", solve: "gmt", answer: "2252" },
  { zd: -11, gmt: "0412", solve: "lmt", answer: "1712" },
  { zd: +7, lmt: "1815", solve: "gmt", answer: "1115" },
  { zd: +4, gmt: "0710", solve: "lmt", answer: "1110" },
  { zd: -10, gmt: "1215", solve: "lmt", answer: "0215" },
  { zd: +3, gmt: "1730", solve: "lmt", answer: "2030" },
  { zd: -6, lmt: "1920", solve: "gmt", answer: "0120" },
];

/* ------------------------------------------------------------------ */
/* Chapter 4 — airspeeds                                               */
/* ------------------------------------------------------------------ */

/**
 * Assignment 6-4-3 A, all 50 rows. `calt`/`altim` are printed for rows 11–50
 * only; where they are absent the pressure altitude is given directly.
 * `casGiven` is false on the rows where the sheet prints TAS and the student
 * works backwards to CAS.
 */
export const TAS_PROBLEMS: {
  calt?: number;
  altim?: number;
  pa: number;
  cas: number;
  oat: number;
  tas: number;
}[] = [
  { pa: 10000, cas: 177, oat: 10, tas: 208 },
  { pa: 9000, cas: 177, oat: 10, tas: 205 },
  { pa: 10240, cas: 160, oat: 10, tas: 190 },
  { pa: 19300, cas: 303, oat: -12, tas: 396 },
  { pa: 5940, cas: 126, oat: 14, tas: 140 },
  { pa: 8320, cas: 151, oat: -2, tas: 170 },
  { pa: 10000, cas: 177, oat: -10, tas: 201 },
  { pa: 10000, cas: 177, oat: 0, tas: 205 },
  { pa: 8500, cas: 137, oat: -5, tas: 154 },
  { pa: 3720, cas: 219, oat: 20, tas: 233 },
  { calt: 10000, altim: 29.92, pa: 10000, cas: 177, oat: 10, tas: 209 },
  { calt: 10000, altim: 30.92, pa: 9000, cas: 177, oat: 10, tas: 205 },
  { calt: 11000, altim: 30.68, pa: 10240, cas: 160, oat: 10, tas: 190 },
  { calt: 19500, altim: 30.12, pa: 19300, cas: 303, oat: -12, tas: 396 },
  { calt: 6000, altim: 29.98, pa: 5940, cas: 126, oat: 14, tas: 140 },
  { calt: 8000, altim: 29.6, pa: 8320, cas: 151, oat: -2, tas: 170 },
  { calt: 10000, altim: 29.92, pa: 10000, cas: 177, oat: -10, tas: 201 },
  { calt: 10000, altim: 29.92, pa: 10000, cas: 177, oat: 0, tas: 204 },
  { calt: 8000, altim: 29.42, pa: 8500, cas: 137, oat: -5, tas: 154 },
  { calt: 3500, altim: 29.7, pa: 3720, cas: 219, oat: 20, tas: 234 },
  { calt: 10000, altim: 28.92, pa: 11000, cas: 177, oat: 10, tas: 213 },
  { calt: 8000, altim: 30.2, pa: 7720, cas: 163, oat: -7, tas: 179 },
  { calt: 7500, altim: 28.92, pa: 8500, cas: 182, oat: 5, tas: 207 },
  { calt: 12000, altim: 30.42, pa: 11500, cas: 180, oat: -5, tas: 212 },
  { calt: 2750, altim: 29.9, pa: 2770, cas: 180, oat: 10, tas: 186 },
  { calt: 6000, altim: 30.92, pa: 5000, cas: 219, oat: -10, tas: 226 },
  { calt: 8500, altim: 29.5, pa: 8920, cas: 203, oat: -15, tas: 223 },
  { calt: 11500, altim: 29.92, pa: 11500, cas: 298, oat: 20, tas: 360 },
  { calt: 4550, altim: 27.92, pa: 6550, cas: 300, oat: -20, tas: 309 },
  { calt: 14925, altim: 28.5, pa: 16345, cas: 233, oat: 0, tas: 300 },
  { calt: 10500, altim: 30.42, pa: 10000, cas: 280, oat: 5, tas: 322 },
  { calt: 1700, altim: 28.42, pa: 3200, cas: 282, oat: -5, tas: 283 },
  { calt: 8500, altim: 27.62, pa: 10800, cas: 194, oat: 10, tas: 232 },
  { calt: 3000, altim: 28.92, pa: 4000, cas: 195, oat: -10, tas: 199 },
  { calt: 2380, altim: 29.02, pa: 3280, cas: 320, oat: -20, tas: 311 },
  { calt: 6300, altim: 28.02, pa: 8200, cas: 278, oat: 0, tas: 308 },
  { calt: 5600, altim: 29.92, pa: 5600, cas: 263, oat: 0, tas: 279 },
  { calt: 8000, altim: 29.82, pa: 8100, cas: 255, oat: 15, tas: 290 },
  { calt: 7500, altim: 29.95, pa: 7470, cas: 245, oat: 10, tas: 274 },
  { calt: 6800, altim: 30.15, pa: 6570, cas: 235, oat: -10, tas: 250 },
  { calt: 15000, altim: 28.95, pa: 15970, cas: 450, oat: -20, tas: 520 },
  { calt: 14500, altim: 30.01, pa: 14410, cas: 500, oat: 0, tas: 576 },
  { calt: 8900, altim: 29.99, pa: 8830, cas: 475, oat: 5, tas: 512 },
  { calt: 6900, altim: 30.25, pa: 6570, cas: 460, oat: 10, tas: 486 },
  { calt: 6500, altim: 29.95, pa: 6470, cas: 355, oat: -25, tas: 358 },
  { calt: 20000, altim: 29.92, pa: 20000, cas: 274, oat: -20, tas: 359 },
  { calt: 15000, altim: 29.99, pa: 14930, cas: 315, oat: 15, tas: 399 },
  { calt: 1900, altim: 30.05, pa: 1770, cas: 495, oat: 10, tas: 483 },
  { calt: 18000, altim: 30.55, pa: 17370, cas: 800, oat: 0, tas: 865 },
  { calt: 30000, altim: 29.63, pa: 30290, cas: 500, oat: -5, tas: 716 },
];

/* ------------------------------------------------------------------ */
/* Chapter 5 — preflight winds                                         */
/* ------------------------------------------------------------------ */

/**
 * Assignment 6-5-3 A, all 50 rows. Columns as printed: true course, TAS, wind
 * direction and velocity, then the keyed crosswind, crab, true heading,
 * head/tail component and groundspeed.
 */
export interface PreflightWindRow {
  tc: number;
  tas: number;
  dir: number;
  vel: number;
  xw: number;
  xwSide: "L" | "R";
  crab: number;
  crabSide: "L" | "R";
  th: number;
  ht: number;
  htType: "H" | "T";
  gs: number;
}

export const PREFLIGHT_WIND_PROBLEMS: PreflightWindRow[] = [
  { tc: 218, tas: 325, dir: 100, vel: 40, xw: 35, xwSide: "L", crab: 6, crabSide: "L", th: 212, ht: 19, htType: "T", gs: 344 },
  { tc: 299, tas: 164, dir: 340, vel: 30, xw: 20, xwSide: "R", crab: 7, crabSide: "R", th: 306, ht: 23, htType: "H", gs: 141 },
  { tc: 110, tas: 280, dir: 330, vel: 30, xw: 19, xwSide: "L", crab: 4, crabSide: "L", th: 106, ht: 23, htType: "T", gs: 303 },
  { tc: 45, tas: 350, dir: 180, vel: 50, xw: 35, xwSide: "R", crab: 6, crabSide: "R", th: 51, ht: 35, htType: "T", gs: 385 },
  { tc: 40, tas: 400, dir: 80, vel: 100, xw: 64, xwSide: "R", crab: 9, crabSide: "R", th: 49, ht: 77, htType: "H", gs: 323 },
  { tc: 10, tas: 170, dir: 210, vel: 60, xw: 21, xwSide: "L", crab: 7, crabSide: "L", th: 3, ht: 56, htType: "T", gs: 226 },
  { tc: 250, tas: 330, dir: 210, vel: 80, xw: 51, xwSide: "L", crab: 9, crabSide: "L", th: 241, ht: 61, htType: "H", gs: 269 },
  { tc: 292, tas: 164, dir: 340, vel: 32, xw: 24, xwSide: "R", crab: 8, crabSide: "R", th: 300, ht: 21, htType: "H", gs: 143 },
  { tc: 176, tas: 150, dir: 220, vel: 35, xw: 24, xwSide: "R", crab: 9, crabSide: "R", th: 185, ht: 25, htType: "H", gs: 125 },
  { tc: 190, tas: 220, dir: 10, vel: 20, xw: 0, xwSide: "R", crab: 0, crabSide: "R", th: 190, ht: 20, htType: "T", gs: 240 },
  { tc: 325, tas: 150, dir: 120, vel: 20, xw: 8, xwSide: "R", crab: 3, crabSide: "R", th: 328, ht: 18, htType: "T", gs: 168 },
  { tc: 188, tas: 234, dir: 30, vel: 20, xw: 7, xwSide: "L", crab: 2, crabSide: "L", th: 186, ht: 19, htType: "T", gs: 253 },
  { tc: 40, tas: 135, dir: 270, vel: 28, xw: 21, xwSide: "L", crab: 9, crabSide: "L", th: 31, ht: 18, htType: "T", gs: 153 },
  { tc: 54, tas: 186, dir: 360, vel: 14, xw: 11, xwSide: "L", crab: 3, crabSide: "L", th: 51, ht: 8, htType: "H", gs: 178 },
  { tc: 253, tas: 136, dir: 290, vel: 33, xw: 20, xwSide: "R", crab: 8, crabSide: "R", th: 261, ht: 26, htType: "H", gs: 110 },
  { tc: 300, tas: 175, dir: 10, vel: 16, xw: 15, xwSide: "R", crab: 5, crabSide: "R", th: 305, ht: 5, htType: "H", gs: 170 },
  { tc: 252, tas: 170, dir: 198, vel: 27, xw: 22, xwSide: "L", crab: 7, crabSide: "L", th: 245, ht: 16, htType: "H", gs: 154 },
  { tc: 127, tas: 192, dir: 320, vel: 18, xw: 4, xwSide: "L", crab: 1, crabSide: "L", th: 126, ht: 18, htType: "T", gs: 210 },
  { tc: 136, tas: 204, dir: 40, vel: 22, xw: 22, xwSide: "L", crab: 6, crabSide: "L", th: 130, ht: 2, htType: "T", gs: 206 },
  { tc: 115, tas: 114, dir: 310, vel: 46, xw: 12, xwSide: "L", crab: 6, crabSide: "L", th: 109, ht: 44, htType: "T", gs: 158 },
  { tc: 87, tas: 192, dir: 50, vel: 40, xw: 24, xwSide: "L", crab: 7, crabSide: "L", th: 80, ht: 32, htType: "H", gs: 160 },
  { tc: 294, tas: 325, dir: 170, vel: 48, xw: 40, xwSide: "L", crab: 7, crabSide: "L", th: 287, ht: 27, htType: "T", gs: 352 },
  { tc: 334, tas: 100, dir: 310, vel: 33, xw: 13, xwSide: "L", crab: 8, crabSide: "L", th: 326, ht: 30, htType: "H", gs: 70 },
  { tc: 246, tas: 165, dir: 180, vel: 14, xw: 13, xwSide: "L", crab: 5, crabSide: "L", th: 241, ht: 6, htType: "H", gs: 159 },
  { tc: 232, tas: 231, dir: 250, vel: 48, xw: 15, xwSide: "R", crab: 4, crabSide: "R", th: 236, ht: 46, htType: "H", gs: 185 },
  { tc: 265, tas: 320, dir: 30, vel: 50, xw: 41, xwSide: "R", crab: 7, crabSide: "R", th: 272, ht: 29, htType: "T", gs: 349 },
  { tc: 218, tas: 257, dir: 110, vel: 24, xw: 23, xwSide: "L", crab: 5, crabSide: "L", th: 213, ht: 7, htType: "T", gs: 264 },
  { tc: 279, tas: 145, dir: 310, vel: 36, xw: 19, xwSide: "R", crab: 7, crabSide: "R", th: 286, ht: 31, htType: "H", gs: 114 },
  { tc: 65, tas: 410, dir: 210, vel: 25, xw: 14, xwSide: "R", crab: 2, crabSide: "R", th: 67, ht: 20, htType: "T", gs: 430 },
  { tc: 265, tas: 253, dir: 330, vel: 28, xw: 25, xwSide: "R", crab: 6, crabSide: "R", th: 271, ht: 12, htType: "H", gs: 241 },
  { tc: 24, tas: 230, dir: 160, vel: 12, xw: 8, xwSide: "R", crab: 2, crabSide: "R", th: 26, ht: 9, htType: "T", gs: 239 },
  { tc: 250, tas: 460, dir: 10, vel: 60, xw: 52, xwSide: "R", crab: 6, crabSide: "R", th: 256, ht: 30, htType: "T", gs: 490 },
  { tc: 115, tas: 300, dir: 45, vel: 10, xw: 9, xwSide: "L", crab: 2, crabSide: "L", th: 113, ht: 3, htType: "H", gs: 297 },
  { tc: 105, tas: 200, dir: 125, vel: 95, xw: 32, xwSide: "R", crab: 9, crabSide: "R", th: 114, ht: 89, htType: "H", gs: 111 },
  { tc: 148, tas: 150, dir: 330, vel: 15, xw: 1, xwSide: "L", crab: 0, crabSide: "L", th: 148, ht: 15, htType: "T", gs: 165 },
  { tc: 135, tas: 115, dir: 125, vel: 85, xw: 15, xwSide: "L", crab: 7, crabSide: "L", th: 128, ht: 84, htType: "H", gs: 31 },
  { tc: 127, tas: 800, dir: 315, vel: 75, xw: 10, xwSide: "L", crab: 1, crabSide: "L", th: 126, ht: 74, htType: "T", gs: 874 },
  { tc: 159, tas: 458, dir: 50, vel: 20, xw: 19, xwSide: "L", crab: 2, crabSide: "L", th: 157, ht: 7, htType: "T", gs: 465 },
  { tc: 220, tas: 658, dir: 110, vel: 65, xw: 61, xwSide: "L", crab: 5, crabSide: "L", th: 215, ht: 22, htType: "T", gs: 680 },
  { tc: 257, tas: 521, dir: 210, vel: 30, xw: 22, xwSide: "L", crab: 2, crabSide: "L", th: 255, ht: 20, htType: "H", gs: 501 },
  { tc: 198, tas: 547, dir: 310, vel: 55, xw: 51, xwSide: "R", crab: 5, crabSide: "R", th: 203, ht: 21, htType: "T", gs: 568 },
  { tc: 248, tas: 841, dir: 115, vel: 45, xw: 33, xwSide: "L", crab: 2, crabSide: "L", th: 246, ht: 31, htType: "T", gs: 872 },
  { tc: 258, tas: 621, dir: 225, vel: 50, xw: 28, xwSide: "L", crab: 3, crabSide: "L", th: 255, ht: 42, htType: "H", gs: 579 },
  { tc: 147, tas: 210, dir: 135, vel: 45, xw: 9, xwSide: "L", crab: 2, crabSide: "L", th: 145, ht: 44, htType: "H", gs: 166 },
  { tc: 159, tas: 541, dir: 245, vel: 35, xw: 35, xwSide: "R", crab: 4, crabSide: "R", th: 163, ht: 2, htType: "H", gs: 539 },
  { tc: 257, tas: 687, dir: 155, vel: 60, xw: 59, xwSide: "L", crab: 5, crabSide: "L", th: 252, ht: 12, htType: "T", gs: 699 },
  { tc: 248, tas: 214, dir: 265, vel: 25, xw: 7, xwSide: "R", crab: 2, crabSide: "R", th: 250, ht: 24, htType: "H", gs: 190 },
  { tc: 205, tas: 368, dir: 175, vel: 70, xw: 35, xwSide: "L", crab: 5, crabSide: "L", th: 200, ht: 61, htType: "H", gs: 307 },
  { tc: 159, tas: 985, dir: 285, vel: 15, xw: 12, xwSide: "R", crab: 1, crabSide: "R", th: 160, ht: 9, htType: "T", gs: 994 },
  { tc: 167, tas: 623, dir: 195, vel: 80, xw: 38, xwSide: "R", crab: 3, crabSide: "R", th: 170, ht: 71, htType: "H", gs: 552 },
];

/* ------------------------------------------------------------------ */
/* Chapter 6 — in-flight winds                                         */
/* ------------------------------------------------------------------ */

export interface InflightWindRow {
  th: number;
  tas: number;
  trk: number;
  gs: number;
  da: number;
  daSide: "L" | "R";
  xw: number;
  xwSide: "L" | "R";
  ht: number;
  htType: "H" | "T";
  dir: number;
  vel: number;
}

/** Assignment 6-6-3 A, all 47 rows. */
export const INFLIGHT_WIND_PROBLEMS: InflightWindRow[] = [
  { th: 350, tas: 150, trk: 355, gs: 160, da: 5, daSide: "R", xw: 13, xwSide: "L", ht: 10, htType: "T", dir: 229, vel: 17 },
  { th: 91, tas: 200, trk: 100, gs: 180, da: 9, daSide: "R", xw: 31, xwSide: "L", ht: 20, htType: "H", dir: 42, vel: 37 },
  { th: 340, tas: 250, trk: 335, gs: 240, da: 5, daSide: "L", xw: 22, xwSide: "R", ht: 10, htType: "H", dir: 40, vel: 24 },
  { th: 186, tas: 130, trk: 195, gs: 150, da: 9, daSide: "R", xw: 20, xwSide: "L", ht: 20, htType: "T", dir: 61, vel: 28 },
  { th: 65, tas: 300, trk: 60, gs: 290, da: 5, daSide: "L", xw: 26, xwSide: "R", ht: 10, htType: "H", dir: 128, vel: 27 },
  { th: 305, tas: 400, trk: 314, gs: 340, da: 9, daSide: "R", xw: 65, xwSide: "L", ht: 60, htType: "H", dir: 267, vel: 88 },
  { th: 149, tas: 265, trk: 142, gs: 287, da: 7, daSide: "L", xw: 32, xwSide: "R", ht: 22, htType: "T", dir: 266, vel: 38 },
  { th: 275, tas: 324, trk: 281, gs: 284, da: 6, daSide: "R", xw: 34, xwSide: "L", ht: 40, htType: "H", dir: 241, vel: 52 },
  { th: 63, tas: 290, trk: 60, gs: 308, da: 3, daSide: "L", xw: 15, xwSide: "R", ht: 18, htType: "T", dir: 200, vel: 23 },
  { th: 208, tas: 445, trk: 201, gs: 495, da: 7, daSide: "L", xw: 54, xwSide: "R", ht: 50, htType: "T", dir: 334, vel: 74 },
  { th: 170, tas: 255, trk: 176, gs: 235, da: 6, daSide: "R", xw: 27, xwSide: "L", ht: 20, htType: "H", dir: 123, vel: 33 },
  { th: 171, tas: 450, trk: 168, gs: 418, da: 3, daSide: "L", xw: 24, xwSide: "R", ht: 32, htType: "H", dir: 205, vel: 39 },
  { th: 122, tas: 420, trk: 122, gs: 380, da: 0, daSide: "R", xw: 0, xwSide: "L", ht: 40, htType: "H", dir: 122, vel: 40 },
  { th: 160, tas: 340, trk: 158, gs: 342, da: 2, daSide: "L", xw: 12, xwSide: "R", ht: 2, htType: "T", dir: 259, vel: 12 },
  { th: 295, tas: 210, trk: 299, gs: 192, da: 4, daSide: "R", xw: 15, xwSide: "L", ht: 18, htType: "H", dir: 260, vel: 24 },
  { th: 11, tas: 300, trk: 8, gs: 322, da: 3, daSide: "L", xw: 16, xwSide: "R", ht: 22, htType: "T", dir: 153, vel: 27 },
  { th: 213, tas: 256, trk: 209, gs: 242, da: 4, daSide: "L", xw: 18, xwSide: "R", ht: 14, htType: "H", dir: 262, vel: 23 },
  { th: 248, tas: 280, trk: 240, gs: 285, da: 8, daSide: "L", xw: 39, xwSide: "R", ht: 5, htType: "T", dir: 337, vel: 39 },
  { th: 125, tas: 112, trk: 133, gs: 122, da: 8, daSide: "R", xw: 16, xwSide: "L", ht: 10, htType: "T", dir: 10, vel: 17 },
  { th: 225, tas: 358, trk: 228, gs: 365, da: 3, daSide: "R", xw: 19, xwSide: "L", ht: 7, htType: "T", dir: 116, vel: 20 },
  { th: 235, tas: 687, trk: 240, gs: 700, da: 5, daSide: "R", xw: 60, xwSide: "L", ht: 13, htType: "T", dir: 137, vel: 61 },
  { th: 105, tas: 250, trk: 113, gs: 220, da: 8, daSide: "R", xw: 35, xwSide: "L", ht: 30, htType: "H", dir: 63, vel: 46 },
  { th: 110, tas: 248, trk: 105, gs: 210, da: 5, daSide: "L", xw: 22, xwSide: "R", ht: 38, htType: "H", dir: 135, vel: 43 },
  { th: 115, tas: 257, trk: 106, gs: 265, da: 9, daSide: "L", xw: 40, xwSide: "R", ht: 8, htType: "T", dir: 208, vel: 41 },
  { th: 315, tas: 954, trk: 310, gs: 875, da: 5, daSide: "L", xw: 83, xwSide: "R", ht: 79, htType: "H", dir: 357, vel: 117 },
  { th: 225, tas: 568, trk: 229, gs: 550, da: 4, daSide: "R", xw: 40, xwSide: "L", ht: 18, htType: "H", dir: 164, vel: 44 },
  { th: 248, tas: 457, trk: 240, gs: 465, da: 8, daSide: "L", xw: 64, xwSide: "R", ht: 8, htType: "T", dir: 337, vel: 65 },
  { th: 167, tas: 851, trk: 175, gs: 825, da: 8, daSide: "R", xw: 119, xwSide: "L", ht: 26, htType: "H", dir: 97, vel: 121 },
  { th: 159, tas: 248, trk: 150, gs: 265, da: 9, daSide: "L", xw: 39, xwSide: "R", ht: 17, htType: "T", dir: 262, vel: 42 },
  { th: 128, tas: 210, trk: 135, gs: 205, da: 7, daSide: "R", xw: 26, xwSide: "L", ht: 5, htType: "H", dir: 56, vel: 26 },
  { th: 305, tas: 541, trk: 313, gs: 533, da: 8, daSide: "R", xw: 75, xwSide: "L", ht: 8, htType: "H", dir: 225, vel: 75 },
  { th: 248, tas: 620, trk: 250, gs: 600, da: 2, daSide: "R", xw: 22, xwSide: "L", ht: 20, htType: "H", dir: 201, vel: 30 },
  { th: 119, tas: 570, trk: 122, gs: 564, da: 3, daSide: "R", xw: 30, xwSide: "L", ht: 6, htType: "H", dir: 42, vel: 30 },
  { th: 106, tas: 541, trk: 109, gs: 535, da: 3, daSide: "R", xw: 28, xwSide: "L", ht: 6, htType: "H", dir: 30, vel: 29 },
  { th: 111, tas: 587, trk: 118, gs: 601, da: 7, daSide: "R", xw: 71, xwSide: "L", ht: 14, htType: "T", dir: 17, vel: 73 },
  { th: 210, tas: 248, trk: 215, gs: 268, da: 5, daSide: "R", xw: 22, xwSide: "L", ht: 20, htType: "T", dir: 81, vel: 30 },
  { th: 310, tas: 158, trk: 319, gs: 175, da: 9, daSide: "R", xw: 25, xwSide: "L", ht: 17, htType: "T", dir: 195, vel: 30 },
  { th: 48, tas: 168, trk: 57, gs: 185, da: 9, daSide: "R", xw: 26, xwSide: "L", ht: 17, htType: "T", dir: 294, vel: 30 },
  { th: 150, tas: 164, trk: 158, gs: 175, da: 8, daSide: "R", xw: 23, xwSide: "L", ht: 11, htType: "T", dir: 42, vel: 25 },
  { th: 25, tas: 335, trk: 32, gs: 350, da: 7, daSide: "R", xw: 41, xwSide: "L", ht: 15, htType: "T", dir: 282, vel: 43 },
  { th: 358, tas: 125, trk: 3, gs: 133, da: 5, daSide: "R", xw: 11, xwSide: "L", ht: 8, htType: "T", dir: 235, vel: 14 },
  { th: 89, tas: 205, trk: 94, gs: 218, da: 5, daSide: "R", xw: 18, xwSide: "L", ht: 13, htType: "T", dir: 326, vel: 23 },
  { th: 148, tas: 695, trk: 140, gs: 705, da: 8, daSide: "L", xw: 96, xwSide: "R", ht: 10, htType: "T", dir: 235, vel: 96 },
  { th: 157, tas: 850, trk: 165, gs: 845, da: 8, daSide: "R", xw: 118, xwSide: "L", ht: 5, htType: "H", dir: 77, vel: 118 },
  { th: 248, tas: 450, trk: 250, gs: 435, da: 2, daSide: "R", xw: 16, xwSide: "L", ht: 15, htType: "H", dir: 203, vel: 22 },
  { th: 269, tas: 445, trk: 273, gs: 440, da: 4, daSide: "R", xw: 31, xwSide: "L", ht: 5, htType: "H", dir: 191, vel: 31 },
  { th: 258, tas: 205, trk: 266, gs: 213, da: 8, daSide: "R", xw: 29, xwSide: "L", ht: 8, htType: "T", dir: 160, vel: 30 },
];

/* ------------------------------------------------------------------ */
/* TACAN point to point                                                */
/* ------------------------------------------------------------------ */

/**
 * Assignment 6-6-3 C, the items that state both fixes in text. Items 3, 4 and
 * 5 refer to BDHI figures rather than printed radials and are therefore not
 * transcribable; they are covered instead by authored problems built on the
 * same procedure.
 */
export const POINT_TO_POINT_PROBLEMS: {
  from: { radial: number; dme: number };
  to: { radial: number; dme: number };
  mc: number;
  nm: number;
  /** Set when the sheet gives the bearing TO the station instead of the radial. */
  fromBearingTo?: number;
}[] = [
  { from: { radial: 210, dme: 30 }, to: { radial: 45, dme: 44 }, mc: 39, nm: 74 },
  { from: { radial: 10, dme: 13 }, to: { radial: 332, dme: 84 }, mc: 326, nm: 75 },
  { from: { radial: 71, dme: 94 }, to: { radial: 20, dme: 15 }, mc: 259, nm: 87, fromBearingTo: 251 },
  { from: { radial: 160, dme: 53 }, to: { radial: 170, dme: 15 }, mc: 335, nm: 38, fromBearingTo: 340 },
];

/** The worked example in Information Sheet 6-6-2: 307/11 to 180/15. */
export const POINT_TO_POINT_EXAMPLE = {
  from: { radial: 307, dme: 11 },
  to: { radial: 180, dme: 15 },
  mc: 157,
  nm: 24,
};

/* ------------------------------------------------------------------ */
/* Chart plotting                                                      */
/* ------------------------------------------------------------------ */

/**
 * Assignment 6-2-3, the items that name both endpoints in latitude and
 * longitude. Distances are checkable outright; magnetic courses depend on the
 * chart's local isogonic value, which the sheet does not print, so the test
 * asserts the implied variation lands in the 2–4° East band a Gulf-coast TPC
 * of that vintage carries.
 */
export const CHART_LEG_PROBLEMS: {
  from: [number, number, number, number];
  to: [number, number, number, number];
  mc: number;
  nm: number;
}[] = [
  { from: [29, 14, 90, 58], to: [29, 6, 92, 8], mc: 259, nm: 61.5 },
  { from: [29, 14, 90, 58], to: [28, 36, 91, 8], mc: 190, nm: 39 },
  { from: [28, 36, 91, 8], to: [28, 59, 91, 31], mc: 315, nm: 30.5 },
  { from: [28, 59, 91, 31], to: [28, 25, 91, 28], mc: 173, nm: 34 },
  { from: [28, 25, 91, 28], to: [29, 30, 92, 0], mc: 334, nm: 70.6 },
];

/* ------------------------------------------------------------------ */
/* Known disagreements between a printed key and the arithmetic        */
/* ------------------------------------------------------------------ */

/**
 * Three published answers do not reproduce inside their own tolerance, and
 * pretending otherwise would mean loosening a band until the tests stopped
 * meaning anything. Each is listed with what the source prints, what the
 * arithmetic gives, and why the gap is what it is. The test asserts this list
 * is exactly the set of failures, so a future edit that breaks a fourth row
 * fails loudly rather than quietly joining the list.
 *
 * None of the three is used as question material anywhere in the course.
 */
export const SOURCE_DISCREPANCIES = [
  {
    where: "Assignment 6-4-3 A, item 49",
    printed: "865 kt from CAS 800 at 17,370 ft",
    computed: "847 kt",
    note: "Mach 1.53. A Mach spiral printed on a plastic wheel is not trustworthy that far supersonic, and neither is any single-factor model of it. Every subsonic row in the same 50-row table reproduces inside ±2 kt.",
  },
  {
    where: "Assignment 6-4-3 B, items 51 and 53",
    printed: "CAS 166 for TAS 210, and CAS 249 for TAS 300, both at 15,000 ft and −15 °C",
    computed: "CAS 169 and CAS 245",
    note: "These two disagree with the 50-row table printed on the same assignment sheet: the ratios they imply are higher at −15 °C than the table's own rows at +15 °C, which is backwards, since colder air is denser and lowers TAS for a given CAS. The table is the larger and self-consistent dataset, so the model follows it and these two items are left out of the question bank.",
  },
  {
    where: "Assignment 6-6-3 C, item 6",
    printed: "87 NM from the 071/94 fix to the 020/15 fix",
    computed: "85.4 NM",
    note: "1.6 NM. A CR-3 point-to-point distance is read off a grid ruled at 10 NM per square, so the published answer is a visual estimate good to roughly half a square.",
  },
] as const;
