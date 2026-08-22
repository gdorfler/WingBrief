import type { Question, SourceReference } from "@/lib/types";

const NOTES = (chapter: string): SourceReference => ({
  document: "Weather Condensed Notes",
  chapter,
});

const THEORY = NOTES("WX 1: Theory");
const MECH = NOTES("WX 2: Mechanics");
const HAZ = NOTES("WX 3: Hazards");
const PLAN = NOTES("WX 4: Planning and Resources");

/**
 * Assessment depth.
 *
 * A second question on every concept the first pass covered only once, so no
 * Weather concept can be cleared on a single coin-flip and every one has
 * something for the review queue to resurface.
 */
export const DEPTH_QUESTIONS: Question[] = [
  {
    id: "wq-wd-001",
    type: "mcq",
    unit: "w2",
    conceptIds: ["wx-indicated-altitude", "wx-true-altitude"],
    prompt:
      "With the correct local altimeter setting on a standard day, indicated altitude is",
    options: [
      "always higher than true altitude",
      "essentially true altitude",
      "the same as absolute altitude",
      "the same as pressure altitude",
    ],
    answer: 1,
    explanation:
      "Indicated altitude attempts to be true altitude, and on a standard day with the right setting it succeeds. Deviations in temperature or an incorrect setting are what pull the two apart.",
    knowCold: "Indicated is the attempt at true.",
    difficulty: 2,
    source: THEORY,
  },
  {
    id: "wq-wd-002",
    type: "mcq",
    unit: "w2",
    conceptIds: ["wx-true-altitude", "wx-absolute-altitude"],
    prompt:
      "An aircraft is at 6,500 ft MSL over terrain that is 1,500 ft MSL. Its absolute altitude is",
    options: ["1,500 ft", "5,000 ft", "6,500 ft", "8,000 ft"],
    answer: 1,
    explanation:
      "Absolute altitude is height above the terrain: 6,500 − 1,500 = 5,000 ft AGL. True altitude is the 6,500 ft MSL figure.",
    knowCold: "True is MSL. Absolute is what is left after the terrain.",
    difficulty: 2,
    source: THEORY,
  },
  {
    id: "wq-wd-003",
    type: "mcq",
    unit: "w2",
    conceptIds: ["wx-density-altitude"],
    prompt: "On a hot day at a high-elevation airfield, density altitude will be",
    options: [
      "lower than pressure altitude, improving performance",
      "higher than pressure altitude, degrading performance",
      "equal to true altitude",
      "unaffected by temperature",
    ],
    answer: 1,
    explanation:
      "Density altitude is a calculation of the altitude the airplane is effectively experiencing given the air density environment, and it is used to gauge performance. Hot, thin air makes the aircraft behave as though it were higher still.",
    knowCold: "Density altitude is the altitude the aircraft thinks it is at.",
    difficulty: 3,
    source: THEORY,
  },
  {
    id: "wq-wd-004",
    type: "spotTheTrap",
    unit: "w3",
    conceptIds: ["wx-dew-point"],
    prompt:
      '"Dew point is the temperature at which air will condense, at any pressure."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The definition specifies AT CONSTANT PRESSURE — that clause is part of it, and it is what makes dew point a property of the parcel rather than of the conditions around it.",
    knowCold: "At constant pressure.",
    difficulty: 3,
    source: THEORY,
  },
  {
    id: "wq-wd-005",
    type: "mcq",
    unit: "w7",
    conceptIds: ["wx-turbulence-intensity"],
    prompt: "Which intensity is the lowest reported on a PIREP?",
    options: ["Trace", "Light", "Moderate", "Occasional"],
    answer: 0,
    explanation:
      "PIREPs report trace, light, moderate, severe and extreme. Occasional is a DURATION, not an intensity.",
    whyWrong:
      "Occasional belongs to the other scale entirely — it describes how much of the time, not how bad.",
    knowCold: "Trace, light, moderate, severe, extreme.",
    difficulty: 2,
    source: HAZ,
  },
  {
    id: "wq-wd-006",
    type: "connectChain",
    unit: "w7",
    conceptIds: ["wx-turbulence-causes"],
    prompt: "Name the four causative factors in order.",
    trigger: "Turbulence is reported",
    steps: ["Large scale wind shear", "Thermal", "Frontal", "Mechanical"],
    explanation:
      "Four causes. One of them — frontal — only exists at cold fronts, because warm fronts produce little or no lifting.",
    knowCold: "Wind shear, Thermal, Frontal, Mechanical.",
    difficulty: 2,
    source: HAZ,
  },
  {
    id: "wq-wd-007",
    type: "mcq",
    unit: "w7",
    conceptIds: ["wx-shear-sources"],
    prompt: "Which of the following is a source of large wind shear?",
    options: [
      "Orographic lifting",
      "Fluctuations in wind intensity through the jet stream",
      "A stationary front",
      "Continuous precipitation",
    ],
    answer: 1,
    explanation:
      "The jet stream and the temperature inversion boundary are the two sources the notes name. Both produce large changes in wind over a short distance.",
    knowCold: "Jet stream and inversion boundary.",
    difficulty: 3,
    source: HAZ,
  },
  {
    id: "wq-wd-008",
    type: "mcq",
    unit: "w7",
    conceptIds: ["wx-thermal-turbulence"],
    prompt: "Thermal turbulence results from",
    options: [
      "wind flowing over obstructions",
      "heating below",
      "the passage of a cold front",
      "shear at the tropopause",
    ],
    answer: 1,
    explanation:
      "Heating from below drives the rising air. Its strength depends on the surface being heated — the drier the surface, the stronger.",
    knowCold: "Heating below. Drier is stronger.",
    difficulty: 2,
    source: HAZ,
  },
  {
    id: "wq-wd-009",
    type: "mcq",
    unit: "w8",
    conceptIds: ["wx-structural-icing"],
    prompt: "Which of the following is a STRUCTURAL concern from icing, rather than an aerodynamic one?",
    options: [
      "Altered airfoil shape",
      "Reduced maximum lift",
      "Pitot tube blockage",
      "Increased stall speed",
    ],
    answer: 2,
    explanation:
      "Structural concerns include flight controls and vibration, pitot tube blockage, and panels freezing over. The aerodynamic effect on the airfoil is the separate — and most hazardous — category.",
    knowCold: "Aerodynamic is the worst. Structural is everything else.",
    difficulty: 3,
    source: HAZ,
  },
  {
    id: "wq-wd-010",
    type: "spotTheTrap",
    unit: "w8",
    conceptIds: ["wx-frost"],
    prompt: '"A thin layer of frost may be scraped off the windshield before flight."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Frost SHALL be removed prior to flight, but the notes are explicit: no scraping it off the aircraft, especially the windshield.",
    knowCold: "Remove it. Do not scrape it.",
    difficulty: 2,
    source: HAZ,
  },
  {
    id: "wq-wd-011",
    type: "mcq",
    unit: "w8",
    conceptIds: ["wx-icing-effects"],
    prompt: "Which of the following DECREASES when structural ice accumulates?",
    options: ["Stall speed", "Drag", "Fuel consumption", "Range"],
    answer: 3,
    explanation:
      "Thrust, range and lift decrease. Drag, weight, stall speed and fuel consumption all increase.",
    knowCold: "↓ thrust, range, lift.",
    difficulty: 2,
    source: HAZ,
  },
  {
    id: "wq-wd-012",
    type: "mcq",
    unit: "w9",
    conceptIds: ["wx-obscuring-phenomenon", "wx-fog"],
    prompt: "Visibility is reported at 5 SM in haze. This is",
    options: [
      "fog",
      "an obscuring phenomenon",
      "neither, since 5 SM is above all thresholds",
      "a convective SIGMET criterion",
    ],
    answer: 1,
    explanation:
      "An obscuring phenomenon reduces horizontal visibility below 7 SM, so 5 SM qualifies. Fog requires visibility below ⅝ SM, plus the base and thickness criteria.",
    knowCold: "Obscuration below 7 SM. Fog below ⅝ SM.",
    difficulty: 3,
    source: HAZ,
  },
  {
    id: "wq-wd-013",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-prognostic-chart", "wx-surface-analysis"],
    prompt: "You want to see forecast precipitation for tomorrow's route. You would use the",
    options: [
      "surface analysis chart",
      "prognostic chart",
      "station model",
      "winds aloft forecast",
    ],
    answer: 1,
    explanation:
      "The prognostic chart shows forecast future conditions WITH precipitation, for big picture planning. The surface analysis shows the current picture and carries no precipitation at all.",
    knowCold: "Prog chart: the future, with rain on it.",
    difficulty: 2,
    source: PLAN,
  },
  {
    id: "wq-wd-014",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-winds-aloft"],
    prompt: "A winds aloft forecast provides",
    options: [
      "current winds only",
      "forecast winds only",
      "both current and forecast winds at altitude",
      "surface winds at reporting stations",
    ],
    answer: 2,
    explanation:
      "Both, and they are used with other variables to choose a flight level and to aid navigation planning.",
    knowCold: "Current AND forecast, at altitude.",
    difficulty: 2,
    source: PLAN,
  },
  {
    id: "wq-wd-015",
    type: "mcq",
    unit: "w5",
    conceptIds: ["wx-cloud-groups", "wx-special-clouds"],
    prompt: "Cumulonimbus is placed in which cloud group?",
    options: ["Low", "Middle", "High", "Special"],
    answer: 3,
    explanation:
      "Special. Its base starts at low altitudes and its tops reach high altitudes, so it does not sit in any single altitude group.",
    knowCold: "CB is Special, because it spans everything.",
    difficulty: 2,
    source: MECH,
  },
  {
    id: "wq-wd-016",
    type: "mcq",
    unit: "w4",
    conceptIds: ["wx-sea-land-breeze", "wx-air-stability"],
    prompt:
      "During a sea breeze, the air over the LAND is",
    options: [
      "cool and sinking",
      "warm and rising",
      "cool and rising",
      "warm and sinking",
    ],
    answer: 1,
    explanation:
      "The land heats faster by day. Warm land air rises, and the cool dense sea air moves in underneath it to take its place.",
    knowCold: "Day: land warm, air rises, sea air moves in.",
    difficulty: 2,
    source: MECH,
  },
];
