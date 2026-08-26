import type { Explainer, SourceReference } from "@/lib/types";

const NOTES = (chapter: string): SourceReference => ({
  document: "Weather Trainee Guide",
  chapter,
});

const TGX = (chapter: string): SourceReference => ({
  document: "Weather Trainee Guide",
  chapter,
});

const THEORY = NOTES("WX 1: Theory");
const MECH = NOTES("WX 2: Mechanics");
const HAZ = NOTES("WX 3: Hazards");
const PLAN = NOTES("WX 4: Planning and Resources");

/**
 * Weather visual explainers.
 *
 * Weather is the one course where the subject genuinely moves, so these lean
 * harder on the frame sequence than the other courses do: the frames are the
 * teaching, and the caption is the narration over it. Almost every one is a
 * vertical cross-section, because that is where the causality lives.
 */
export const EXPLAINERS: Explainer[] = [
  {
    id: "wx-x-atmosphere",
    title: "One Thin Layer",
    promise: "Where weather happens, and where it stops.",
    unit: "w1",
    conceptIds: ["wx-troposphere", "wx-tropopause", "wx-heat-exchange"],
    lessonId: "wl01-the-troposphere",
    diagram: { id: "wx-atmosphere" },
    frames: [
      { caption: "The troposphere holds 0 to 5% water vapour by volume.", hold: 3000, props: { highlight: "troposphere" } },
      { caption: "Nearly all weather happens inside it.", hold: 2800, props: { highlight: "troposphere" } },
      { caption: "Climbing through: temperature falls, wind strengthens.", hold: 3200, props: { highlight: "troposphere" } },
      { caption: "At the top — 36,000 ft over the US — the cooling stops.", hold: 3200, props: { highlight: "tropopause" } },
      { caption: "That isothermal layer is the tropopause. Above it, the stratosphere.", hold: 3400, props: { highlight: "stratosphere" } },
    ],
    predict: {
      at: 2,
      question:
        "You keep climbing and the temperature keeps falling. What happens at the top of the troposphere?",
      options: [
        "It carries on falling",
        "The cooling stops — the layer goes isothermal",
        "It starts rising steeply",
      ],
      answer: 1,
      because:
        "That isothermal layer IS the tropopause, around 36,000 ft over the US, and it is the lid on the weather. Nearly everything that matters to a pilot happens below it, in the 0 to 5% of the atmosphere that holds water vapour.",
    },
    knowCold: "Weather is a troposphere phenomenon. The tropopause is isothermal.",
    source: THEORY,
  },
  {
    id: "wx-x-lapse-rates",
    title: "Two Rates, Two Units",
    promise: "Watch temperature and pressure fall at their own separate speeds.",
    unit: "w1",
    conceptIds: ["wx-lapse-rate", "wx-standard-atmosphere", "wx-atmospheric-pressure"],
    lessonId: "wl02-pressure-and-lapse-rates",
    diagram: { id: "wx-lapse-rates" },
    frames: [
      { caption: "Sea level, standard day: 29.92 inHg and 15 °C.", hold: 3000, props: { altitude: 0, show: "both" } },
      { caption: "Temperature falls 2 °C for every 1,000 ft.", hold: 3000, props: { altitude: 5000, show: "temperature" } },
      { caption: "Pressure falls 1 inHg for every 1,000 ft.", hold: 3000, props: { altitude: 5000, show: "pressure" } },
      { caption: "At 10,000 ft: −5 °C and 19.92 inHg.", hold: 3200, props: { altitude: 10000, show: "both" } },
      { caption: "Both fall together — but at different rates, in different units.", hold: 3200, props: { altitude: 18000, show: "both" } },
    ],
    predict: {
      at: 2,
      question:
        "Standard day, sea level: 29.92 inHg and 15 °C. What are the two readings at 10,000 ft?",
      options: [
        "−5 °C and 19.92 inHg",
        "5 °C and 19.92 inHg",
        "−5 °C and 9.92 inHg",
      ],
      answer: 0,
      because:
        "Two rates, two units, both per 1,000 ft: temperature down 2 °C, pressure down 1 inHg. Ten thousand feet costs you 20 °C and 10 inHg — 15 minus 20 is −5, and 29.92 minus 10 is 19.92.",
    },
    knowCold: "2 °C and 1 inHg, both per 1,000 ft.",
    source: THEORY,
  },
  {
    id: "wx-x-altitudes",
    title: "Five Answers, One Aircraft",
    promise: "Why the same aeroplane is at five different altitudes at once.",
    unit: "w2",
    conceptIds: ["wx-true-altitude", "wx-absolute-altitude", "wx-pressure-altitude", "wx-density-altitude"],
    lessonId: "wl04-five-altitudes",
    diagram: { id: "wx-altitude-types" },
    frames: [
      { caption: "TRUE altitude is measured from mean sea level.", hold: 3000, props: { highlight: "true" } },
      { caption: "ABSOLUTE altitude is measured from the terrain below you.", hold: 3200, props: { highlight: "absolute" } },
      { caption: "Over rising ground, that number shrinks while true stays put.", hold: 3400, props: { highlight: "absolute" } },
      { caption: "PRESSURE altitude is measured from the 29.92 datum plane.", hold: 3200, props: { highlight: "pressure" } },
      { caption: "And DENSITY altitude is not a height at all — it is performance.", hold: 3400, props: { highlight: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "You hold a steady indicated altitude while flying over rising ground. Which altitude changes?",
      options: [
        "True altitude",
        "Absolute altitude",
        "Both, by the same amount",
      ],
      answer: 1,
      because:
        "True is measured from sea level and does not care what is underneath you. Absolute is measured from the terrain below, so it shrinks as the ground comes up — which is precisely why terrain clearance is not the altimeter's job alone.",
    },
    knowCold: "True MSL · Absolute AGL · Pressure from 29.92 · Density is performance.",
    source: THEORY,
  },
  {
    id: "wx-x-altimeter",
    title: "Cold, High, and Lower Than You Think",
    promise: "The temperature error, and why only one direction is dangerous.",
    unit: "w2",
    conceptIds: ["wx-temp-altimeter-error", "wx-altimeter"],
    lessonId: "wl05-altimeter-errors",
    diagram: { id: "wx-altimeter-error" },
    frames: [
      { caption: "Standard day: the indication and the truth agree.", hold: 3000, props: { condition: "standard" } },
      { caption: "Now make it colder than standard.", hold: 2600, props: { condition: "cold" } },
      { caption: "The altimeter indicates HIGHER than true.", hold: 3000, props: { condition: "cold" } },
      { caption: "Which means the aircraft is LOWER than the number says.", hold: 3400, props: { condition: "cold" } },
      { caption: "Hotter than standard reverses it — and that direction is safe.", hold: 3200, props: { condition: "hot" } },
    ],
    predict: {
      at: 1,
      question:
        "The air is colder than standard. What does the altimeter do, and where are you really?",
      options: [
        "Indicates lower than true, so you are higher than it says",
        "Indicates higher than true, so you are lower than it says",
        "Nothing — it reads pressure, not temperature",
      ],
      answer: 1,
      because:
        "Cold air is dense, so pressure falls off faster with height and the altimeter thinks it has climbed more than it has. Cold: indicates high, you are low. Hotter than standard reverses it, and that direction is the safe one.",
    },
    knowCold: "Cold: indicates high, you are low.",
    source: THEORY,
  },
  {
    id: "wx-x-dewpoint",
    title: "Closing the Gap",
    promise: "Watch condensation appear as temperature and dew point converge.",
    unit: "w3",
    conceptIds: ["wx-dew-point", "wx-dew-point-spread", "wx-relative-humidity"],
    lessonId: "wl06-moisture",
    diagram: { id: "wx-dewpoint-spread" },
    frames: [
      { caption: "A wide spread. The air is nowhere near saturation.", hold: 2800, props: { spread: 18 } },
      { caption: "Cool the air, and the two lines move toward each other.", hold: 3000, props: { spread: 12 } },
      { caption: "As the depression shrinks, more moisture condenses.", hold: 3200, props: { spread: 6 } },
      { caption: "Relative humidity is this same gap, as a percentage.", hold: 3200, props: { spread: 3 } },
      { caption: "Spread zero: saturated, 100% relative humidity, cloud.", hold: 3400, props: { spread: 0 } },
    ],
    predict: {
      at: 1,
      question:
        "Temperature and dew point are converging. What is happening to condensation?",
      options: [
        "Less of it",
        "More of it",
        "Nothing until they actually meet",
      ],
      answer: 1,
      because:
        "The spread is a continuous measure, not a switch. As the depression shrinks more moisture condenses out, and relative humidity — the same gap expressed as a percentage — climbs. Zero spread is saturation, 100%, cloud.",
    },
    knowCold: "Smaller spread, more condensation. Zero spread is saturation.",
    source: THEORY,
  },
  {
    id: "wx-x-stability",
    title: "Compared With What?",
    promise: "Stability is never about an absolute temperature.",
    unit: "w3",
    conceptIds: ["wx-air-stability", "wx-air-mass"],
    lessonId: "wl07-stability",
    diagram: { id: "wx-stability" },
    frames: [
      { caption: "A parcel of air, sitting in its surroundings.", hold: 2600, props: { state: "neutral" } },
      { caption: "Same temperature as the air around it: neutral. It stays.", hold: 3000, props: { state: "neutral" } },
      { caption: "Colder than its surroundings: denser. It sinks back. STABLE.", hold: 3400, props: { state: "stable" } },
      { caption: "Hotter than its surroundings: less dense. It keeps going. UNSTABLE.", hold: 3400, props: { state: "unstable" } },
      { caption: "Warm air masses are stable. Cold air masses are unstable.", hold: 3400, props: { state: "neutral" } },
    ],
    predict: {
      at: 1,
      question:
        "A parcel of air is COLDER than the air around it. What does it do?",
      options: [
        "Keeps rising — unstable",
        "Sinks back where it came from — stable",
        "Holds its level — neutral",
      ],
      answer: 1,
      because:
        "Colder means denser, so it sinks back and the atmosphere resists the displacement — that is stability. Hotter means less dense, so it keeps going, which is instability. It is always relative to the surroundings, never an absolute temperature.",
    },
    knowCold: "Cold stable, hot unstable — always relative to the surroundings.",
    source: MECH,
  },
  {
    id: "wx-x-wind",
    title: "Why Wind Happens",
    promise: "From a pressure difference to the wind that actually blows.",
    unit: "w4",
    conceptIds: ["wx-pgf", "wx-gradient-wind", "wx-surface-wind"],
    lessonId: "wl08-gradient-and-surface-wind",
    diagram: { id: "wx-pressure-field" },
    frames: [
      { caption: "Two pressure centres. Isobars join equal pressures.", hold: 3000, props: { level: "gradient", labels: true } },
      { caption: "PGF pushes across the isobars — that is what starts the wind.", hold: 3200, props: { level: "gradient" } },
      { caption: "But the wind ends up running PARALLEL to them.", hold: 3200, props: { level: "gradient" } },
      { caption: "Counter-clockwise around the low, clockwise around the high.", hold: 3400, props: { level: "gradient" } },
      { caption: "Below 2,000 ft AGL, friction drags it back across the isobars.", hold: 3400, props: { level: "both" } },
    ],
    predict: {
      at: 1,
      question:
        "The pressure gradient force pushes ACROSS the isobars. So which way does the wind above 2,000 ft AGL actually blow?",
      options: [
        "Across them, the way PGF pushes",
        "Parallel to them",
        "Straight into the centre of the low",
      ],
      answer: 1,
      because:
        "PGF starts the wind, then Coriolis turns it until it runs parallel to the isobars — counter-clockwise around a low, clockwise around a high. Only below about 2,000 ft AGL does friction drag it back across them.",
    },
    knowCold: "PGF starts it. Above 2,000 AGL it runs parallel to the isobars.",
    source: MECH,
  },
  {
    id: "wx-x-breeze",
    title: "The Coast Breathes",
    promise: "One circulation that reverses every twelve hours.",
    unit: "w4",
    conceptIds: ["wx-sea-land-breeze"],
    lessonId: "wl09-buys-ballot-and-breezes",
    diagram: { id: "wx-sea-land-breeze" },
    frames: [
      { caption: "Daytime. The land heats faster than the sea.", hold: 3000, props: { phase: "day" } },
      { caption: "Warm land air rises and flows out to sea aloft.", hold: 3200, props: { phase: "day" } },
      { caption: "Cool dense sea air moves in beneath it: the sea breeze, 15–20 kt.", hold: 3400, props: { phase: "day" } },
      { caption: "After dark, land cools faster than sea. The contrast inverts.", hold: 3400, props: { phase: "night" } },
      { caption: "The whole cycle flips: now it is a land breeze.", hold: 3200, props: { phase: "night" } },
    ],
    predict: {
      at: 2,
      question:
        "After dark, land cools faster than the sea. What happens to the coastal breeze?",
      options: [
        "It stops until morning",
        "It reverses into a land breeze",
        "It keeps blowing the same way, more weakly",
      ],
      answer: 1,
      because:
        "The circulation follows the temperature contrast, and after sunset that contrast inverts. By day the land is warmer and the sea breeze blows inland at 15 to 20 kt; by night the whole cycle runs the other way.",
    },
    knowCold: "Day sea breeze, night land breeze. Land cools faster.",
    source: MECH,
  },
  {
    id: "wx-x-clouds",
    title: "How Clouds Form",
    promise: "Four ways to start it, one chain to finish it.",
    unit: "w5",
    conceptIds: ["wx-lifting-methods", "wx-dew-point-spread"],
    lessonId: "wl11-lifting-methods",
    diagram: { id: "wx-lifting" },
    frames: [
      { caption: "Moisture alone builds nothing. The air has to be lifted.", hold: 3000, props: { method: "none" } },
      { caption: "FRONTAL: one air mass forces another upward.", hold: 2800, props: { method: "frontal" } },
      { caption: "OROGRAPHIC: terrain does the lifting.", hold: 2800, props: { method: "orographic" } },
      { caption: "CONVERGENCE: air flows together with nowhere to go but up.", hold: 3000, props: { method: "convergence" } },
      { caption: "THERMAL: heating from below.", hold: 2800, props: { method: "thermal" } },
      { caption: "All four then follow the same chain: rise, cool, saturate, cloud.", hold: 3400, props: { method: "none" } },
    ],
    predict: {
      at: 0,
      question:
        "There is plenty of moisture in the air. Is that enough to build a cloud?",
      options: [
        "Yes — moisture is what cloud is made of",
        "No — the air still has to be lifted",
        "Only over water",
      ],
      answer: 1,
      because:
        "Moisture alone builds nothing. Something has to lift the air so it cools to saturation — frontal, orographic, convergence or thermal. Four different triggers, then all four run the same chain: rise, cool, saturate, cloud.",
    },
    knowCold: "Frontal, Orographic, Convergence, Thermal — then lift, cool, saturate.",
    source: MECH,
  },
  {
    id: "wx-x-cold-front",
    title: "Inside a Cold Front",
    promise: "Cold air undercuts warm air, and everything else follows.",
    unit: "w6",
    conceptIds: ["wx-cold-front"],
    lessonId: "wl13-cold-and-warm-fronts",
    diagram: { id: "wx-front" },
    frames: [
      { caption: "Cooler, denser air advances into the warm air.", hold: 3000, props: { kind: "cold" } },
      { caption: "It slides underneath and forces the warm air up — steeply.", hold: 3200, props: { kind: "cold" } },
      { caption: "Steep lifting means unstable conditions.", hold: 3000, props: { kind: "cold" } },
      { caption: "Unstable air builds VERTICALLY: cumuliform cloud.", hold: 3200, props: { kind: "cold" } },
      { caption: "And cumuliform cloud gives showery precipitation.", hold: 3200, props: { kind: "cold" } },
    ],
    predict: {
      at: 1,
      question:
        "A cold front undercuts the warm air and lifts it STEEPLY. What cloud does that build, and what precipitation?",
      options: [
        "Stratiform cloud, continuous rain",
        "Cumuliform cloud, showery precipitation",
        "Little cloud either way",
      ],
      answer: 1,
      because:
        "Steep lifting means unstable conditions, unstable air builds vertically, and vertical cloud is cumuliform — which gives showery precipitation and turbulence. The slope of the lift decides everything downstream of it.",
    },
    knowCold: "Cold front: unstable, cumuliform, showery.",
    source: MECH,
  },
  {
    id: "wx-x-warm-front",
    title: "Inside a Warm Front",
    promise: "The same two air masses, with the other one moving.",
    unit: "w6",
    conceptIds: ["wx-warm-front"],
    lessonId: "wl13-cold-and-warm-fronts",
    diagram: { id: "wx-front" },
    frames: [
      { caption: "Now the warm air is the one advancing — usually more slowly.", hold: 3200, props: { kind: "warm" } },
      { caption: "It rides up over the cold air on a shallow slope.", hold: 3200, props: { kind: "warm" } },
      { caption: "Shallow lifting means stable conditions prior to passage.", hold: 3200, props: { kind: "warm" } },
      { caption: "Stable air builds in LAYERS: stratiform cloud.", hold: 3200, props: { kind: "warm" } },
      { caption: "Continuous precipitation, and little to no turbulence.", hold: 3400, props: { kind: "warm" } },
    ],
    predict: {
      at: 1,
      question:
        "A warm front rides up over the cold air on a SHALLOW slope. What does that produce?",
      options: [
        "Cumuliform cloud and showers",
        "Stratiform cloud and continuous precipitation",
        "The same weather as a cold front",
      ],
      answer: 1,
      because:
        "Same two air masses, opposite mover, opposite result. Shallow lifting means stable conditions, stable air builds in layers, and layered cloud gives continuous precipitation with little or no turbulence.",
    },
    knowCold: "Warm front: stable, stratiform, continuous, smooth.",
    source: MECH,
  },
  {
    id: "wx-x-occlusion",
    title: "When a Cold Front Catches a Warm One",
    promise: "The occlusion, and why the warm air leaves the ground.",
    unit: "w6",
    conceptIds: ["wx-occluded-front", "wx-stationary-front"],
    lessonId: "wl14-stationary-and-occluded",
    diagram: { id: "wx-front" },
    frames: [
      { caption: "A stationary front: neither air mass can move the other.", hold: 3200, props: { kind: "stationary" } },
      { caption: "Now let the cold front win, and catch the warm front.", hold: 3000, props: { kind: "cold" } },
      { caption: "The warm air is lifted clear of the ground entirely.", hold: 3400, props: { kind: "occluded" } },
      { caption: "The wind shifts 180°, from SE to NW.", hold: 3200, props: { kind: "occluded" } },
      { caption: "And you get the weather of BOTH fronts, over a wide area.", hold: 3400, props: { kind: "occluded" } },
    ],
    predict: {
      at: 1,
      question:
        "A cold front catches the warm front ahead of it. What happens to the warm air between them?",
      options: [
        "It is pushed along faster",
        "It is lifted clear of the ground entirely",
        "It mixes and both fronts dissipate",
      ],
      answer: 1,
      because:
        "That is what an occlusion is — the warm sector loses contact with the surface altogether. The wind shifts through 180°, from SE to NW, and you get the weather of both fronts spread over a wide area. Purple symbol on the chart.",
    },
    knowCold: "Cold overtakes warm. 180° shift, SE to NW, purple symbol.",
    source: MECH,
  },
  {
    id: "wx-x-turbulence",
    title: "What Creates Turbulence",
    promise: "Four causes — and the one place it never happens.",
    unit: "w7",
    conceptIds: ["wx-turbulence-causes", "wx-wind-shear", "wx-frontal-turbulence"],
    lessonId: "wl16-four-causes",
    diagram: { id: "wx-turbulence-causes" },
    frames: [
      { caption: "WIND SHEAR: a sudden change in speed or direction. Anywhere.", hold: 3200, props: { cause: "windshear" } },
      { caption: "THERMAL: heating from below. Drier surface, stronger turbulence.", hold: 3400, props: { cause: "thermal" } },
      { caption: "FRONTAL: cold front lifting — worse in a fast cold front.", hold: 3200, props: { cause: "frontal" } },
      { caption: "There is NO warm frontal turbulence. Warm fronts barely lift.", hold: 3400, props: { cause: "frontal" } },
      { caption: "MECHANICAL: obstructions and terrain, usually below 1,000 ft AGL.", hold: 3400, props: { cause: "mechanical" } },
    ],
    predict: {
      at: 2,
      question:
        "Wind shear, thermal, frontal, mechanical. Which front produces essentially no turbulence of its own?",
      options: [
        "The cold front",
        "The warm front",
        "Both produce it equally",
      ],
      answer: 1,
      because:
        "Frontal turbulence comes from lifting, and a warm front barely lifts — it slides up a shallow slope. There is no warm frontal turbulence to speak of, while a fast-moving cold front is the worst of them.",
    },
    knowCold: "Wind shear, thermal, frontal, mechanical. No warm frontal turbulence.",
    source: HAZ,
  },
  {
    id: "wx-x-icing",
    title: "Why Icing Forms",
    promise: "Three conditions, and what happens when you remove one.",
    unit: "w8",
    conceptIds: ["wx-icing-requirements", "wx-icing-response"],
    lessonId: "wl18-what-icing-needs",
    diagram: { id: "wx-icing-requirements" },
    frames: [
      { caption: "Ice needs three things at once, and all three are required.", hold: 3200, props: { missing: "none" } },
      { caption: "Visible moisture — something to freeze.", hold: 2800, props: { missing: "fat" } },
      { caption: "Free air temperature below freezing.", hold: 2800, props: { missing: "surface" } },
      { caption: "And the aircraft surface below freezing too.", hold: 3000, props: { missing: "moisture" } },
      { caption: "Remove any one and ice cannot form. That is every escape option.", hold: 3400, props: { missing: "none" } },
    ],
    predict: {
      at: 3,
      question:
        "Visible moisture, free air below freezing, and an airframe below freezing. How many must you remove to stop ice forming?",
      options: [
        "All three",
        "Any one of them",
        "At least two",
      ],
      answer: 1,
      because:
        "All three are required simultaneously, so breaking any single one stops it. That is not a piece of trivia — it is the complete list of escape options: climb above the moisture, or find air warm enough to break the other two.",
    },
    knowCold: "Visible moisture + cold air + cold surface.",
    source: HAZ,
  },
  {
    id: "wx-x-ice-types",
    title: "Read the Temperature, Name the Ice",
    promise: "Three bands, and the one that overlaps the other two.",
    unit: "w8",
    conceptIds: ["wx-clear-ice", "wx-rime-ice", "wx-mixed-ice"],
    lessonId: "wl19-ice-types",
    diagram: { id: "wx-icing-ladder" },
    frames: [
      { caption: "Just below freezing: CLEAR ice, 0 to −10 °C.", hold: 3200, props: { temp: -5 } },
      { caption: "Large droplets spread out, then freeze slowly. The wing changes shape.", hold: 3400, props: { temp: -5 } },
      { caption: "Colder still: RIME, −10 to −20 °C. Tiny droplets freeze instantly.", hold: 3400, props: { temp: -15 } },
      { caption: "MIXED sits at −8 to −15 — overlapping both, not between them.", hold: 3400, props: { temp: -12 } },
      { caption: "Below −20 °C is where you climb to in order to escape.", hold: 3200, props: { temp: -23 } },
    ],
    predict: {
      at: 2,
      question:
        "Clear ice runs 0 to −10 and rime runs −10 to −20. So where does MIXED sit?",
      options: [
        "Between them, right around −10",
        "Overlapping both, from −8 to −15",
        "Below −20, colder than either",
      ],
      answer: 1,
      because:
        "This is the one people get wrong. Mixed is not a band between the other two — it straddles them, −8 to −15, overlapping the bottom of clear and the top of rime. Below −20 is where you climb to in order to escape all three.",
    },
    knowCold: "Clear 0/−10 · Rime −10/−20 · Mixed −8/−15.",
    source: HAZ,
  },
  {
    id: "wx-x-thunderstorm",
    title: "Four Ways Past a Thunderstorm",
    promise: "In priority order, and why the order matters.",
    unit: "w9",
    conceptIds: ["wx-thunderstorm-avoidance", "wx-thunderstorm-hazards"],
    lessonId: "wl21-thunderstorms",
    diagram: { id: "wx-storm-avoidance" },
    frames: [
      { caption: "Inside: hail, icing, microbursts, extreme turbulence, lightning, tornados.", hold: 3400, props: { option: "none" } },
      { caption: "FIRST: circumnavigate. Fly around it.", hold: 3000, props: { option: "circumnavigate" } },
      { caption: "SECOND: over — 1,000 ft per 10 kt of wind at the top.", hold: 3400, props: { option: "over" } },
      { caption: "THIRD: under — the lower third from cloud base to ground.", hold: 3200, props: { option: "under" } },
      { caption: "LAST: through the lower third, with no angle.", hold: 3200, props: { option: "through" } },
    ],
    predict: {
      at: 1,
      question:
        "You cannot circumnavigate the storm. What is the next choice, in priority order?",
      options: [
        "Under it",
        "Over it",
        "Straight through the middle",
      ],
      answer: 1,
      because:
        "The order is fixed: circumnavigate, over, under, through. Over needs 1,000 ft for every 10 kt of wind at the top. Under means the lower third from cloud base down, and through — with no turn angle — is genuinely the last resort.",
    },
    knowCold: "Circumnavigate, Over, Under, Through — and that IS the priority.",
    source: HAZ,
  },
  {
    id: "wx-x-microburst",
    title: "The Airspeed You Get Back",
    promise: "Why a microburst helps you before it kills you.",
    unit: "w9",
    conceptIds: ["wx-microburst"],
    lessonId: "wl22-microbursts",
    diagram: { id: "wx-microburst" },
    frames: [
      { caption: "Virga, blowing dust, rain shafts, roll clouds — the cues.", hold: 3200, props: { stage: "approach" } },
      { caption: "Entering the outflow: a headwind. Airspeed RISES.", hold: 3200, props: { stage: "headwind" } },
      { caption: "It feels like a performance gain. It is borrowed.", hold: 3000, props: { stage: "headwind" } },
      { caption: "The core: 2,000 to 6,000 feet per minute straight down.", hold: 3400, props: { stage: "downdraft" } },
      { caption: "Out the far side, the headwind becomes a tailwind. Sudden loss.", hold: 3400, props: { stage: "tailwind" } },
    ],
    knowCold: "It gives airspeed on the way in and takes it on the way out.",
    source: HAZ,
  },
  {
    id: "wx-x-fog",
    title: "A Cloud on the Deck",
    promise: "Three conditions, three numbers, one narrow window.",
    unit: "w9",
    conceptIds: ["wx-fog"],
    lessonId: "wl23-fog-and-visibility",
    diagram: { id: "wx-fog" },
    frames: [
      { caption: "Fog needs condensation nuclei to form on.", hold: 2800, props: { highlight: "nuclei" } },
      { caption: "A low temperature/dew point spread — the air near saturation.", hold: 3200, props: { highlight: "spread" } },
      { caption: "And LIGHT surface winds. Not calm, not strong.", hold: 3200, props: { highlight: "wind" } },
      { caption: "Calm will not mix it through the layer; strong disperses it.", hold: 3400, props: { highlight: "wind" } },
      { caption: "Base within 50 ft, over 20 ft thick, visibility below ⅝ SM.", hold: 3400, props: { highlight: "geometry" } },
    ],
    predict: {
      at: 1,
      question:
        "Nuclei are present and the temperature/dew point spread is tiny. What wind does fog need?",
      options: [
        "Dead calm",
        "Light — neither calm nor strong",
        "Strong, to carry the moisture in",
      ],
      answer: 1,
      because:
        "It needs a narrow window. Calm air will not mix the saturated layer through any depth, and strong wind disperses it. Light surface wind is the third condition, alongside nuclei and a small spread.",
    },
    knowCold: "Nuclei, small spread, light winds. 50 ft, 20 ft, ⅝ SM.",
    source: HAZ,
  },
  {
    id: "wx-x-metar-taf",
    title: "Now Versus Later",
    promise: "Which product decides the flight, and which one plans it.",
    unit: "w10",
    conceptIds: ["wx-metar", "wx-taf", "wx-station-model"],
    lessonId: "wl25-metar-taf-pirep",
    diagram: { id: "wx-station-model" },
    frames: [
      { caption: "A METAR reports what IS, hourly at xx:55 to xx:59.", hold: 3200, props: { knots: 15 } },
      { caption: "It is the criteria for takeoff and landing.", hold: 3000, props: { knots: 15 } },
      { caption: "Half line 5 kt, full line 10 kt, triangular flag 50 kt.", hold: 3400, props: { knots: 25 } },
      { caption: "Sixty-five knots: one flag, one full line, one half.", hold: 3400, props: { knots: 65 } },
      { caption: "A TAF forecasts what WILL BE — every 6 hours, for planning.", hold: 3400, props: { knots: 25 } },
    ],
    predict: {
      at: 2,
      question:
        "A wind barb carries one triangular flag, one full line and one half line. What is the speed?",
      options: [
        "55 kt",
        "65 kt",
        "75 kt",
      ],
      answer: 1,
      because:
        "Half line 5, full line 10, flag 50 — so 50 plus 10 plus 5 is 65 kt. And keep the two products straight: a METAR reports what IS and decides takeoff and landing; a TAF forecasts what WILL BE and is for planning.",
    },
    knowCold: "METAR decides. TAF plans. Half 5, full 10, flag 50.",
    source: PLAN,
  },
  {
    id: "wx-x-advisories",
    title: "How Far Forward Each Reaches",
    promise: "SIGMET, AIRMET, and the validity periods that separate them.",
    unit: "w10",
    conceptIds: ["wx-convective-sigmet", "wx-nonconvective-sigmet", "wx-airmet"],
    lessonId: "wl27-advisories-and-briefings",
    diagram: { id: "wx-product-timeline" },
    frames: [
      { caption: "A METAR covers the hour it was issued in.", hold: 2800, props: { product: "metar" } },
      { caption: "A convective SIGMET runs 2 hours — thunderstorm hazards.", hold: 3200, props: { product: "csigmet" } },
      { caption: "A non-convective SIGMET runs 4 hours. Six, for hurricanes.", hold: 3400, props: { product: "sigmet" } },
      { caption: "An AIRMET covers 3,000 square miles, every 6 hours.", hold: 3400, props: { product: "airmet" } },
      { caption: "And the TAF reaches out 24 hours or more.", hold: 3200, props: { product: "taf" } },
    ],
    predict: {
      at: 1,
      question:
        "A convective SIGMET runs 2 hours. How long does a non-convective one run?",
      options: [
        "The same 2 hours",
        "4 hours — or 6 for hurricanes",
        "6 hours in every case",
      ],
      answer: 1,
      because:
        "The reach is the thing that separates them: convective SIGMET 2 hours, non-convective 4 (6 for hurricanes), AIRMET every 6 over 3,000 square miles, TAF out to 24 or more. SIGMET is severe, AIRMET is moderate.",
    },
    knowCold: "AIRMET moderate, SIGMET severe. 2 / 4 / 6 hours.",
    source: PLAN,
  },
];


/** Second set, covering the lessons the first pass left without one. */
export const EXPLAINERS_B: Explainer[] = [
  {
    id: "wx-x-pgf",
    title: "Reading a Gradient",
    promise: "Why closely spaced isobars mean strong wind.",
    unit: "w1",
    conceptIds: ["wx-pgf", "wx-heat-exchange"],
    lessonId: "wl03-pressure-gradient-force",
    diagram: { id: "wx-pressure-field" },
    frames: [
      { caption: "Isobars join points of equal pressure.", hold: 2800, props: { level: "gradient" } },
      { caption: "The gradient is measured PERPENDICULAR to them.", hold: 3200, props: { level: "gradient" } },
      { caption: "Close together means a steep gradient — and strong wind.", hold: 3200, props: { level: "gradient" } },
      { caption: "PGF is the initiating force. Nothing blows without it.", hold: 3200, props: { level: "gradient" } },
      { caption: "Everything else only modifies what PGF began.", hold: 3000, props: { level: "both" } },
    ],
    predict: {
      at: 1,
      question:
        "The isobars on the chart are packed close together. What does that tell you?",
      options: [
        "A weak gradient and light wind",
        "A steep gradient and strong wind",
        "Nothing about wind speed by itself",
      ],
      answer: 1,
      because:
        "The gradient is measured perpendicular to the isobars, so spacing is the gradient. Close together means a lot of pressure change over a short distance, which is a strong PGF — and PGF is the force that starts every wind there is.",
    },
    knowCold: "PGF starts every wind. Measured across the isobars.",
    source: THEORY,
  },
  {
    id: "wx-x-jetstream",
    title: "The River at the Top",
    promise: "Where the jet stream sits, and what it does besides push you along.",
    unit: "w4",
    conceptIds: ["wx-jet-stream", "wx-troposphere"],
    lessonId: "wl10-jet-stream",
    diagram: { id: "wx-atmosphere" },
    frames: [
      { caption: "At the top of the troposphere, averaging FL300 over the US.", hold: 3200, props: { highlight: "troposphere" } },
      { caption: "Generally west to east — and it can change hourly.", hold: 3000, props: { highlight: "troposphere" } },
      { caption: "100 to 150 kt on average, and it can exceed 250.", hold: 3200, props: { highlight: "troposphere" } },
      { caption: "100–400 miles wide, 1,000–3,000 long, 3,000–7,000 ft thick.", hold: 3400, props: { highlight: "tropopause" } },
      { caption: "Its wind fluctuations are a major source of clear air turbulence.", hold: 3400, props: { highlight: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "The jet stream averages FL300 over the US. What speed does it typically run?",
      options: [
        "40 to 60 kt",
        "100 to 150 kt, and it can exceed 250",
        "250 to 400 kt",
      ],
      answer: 1,
      because:
        "100 to 150 kt on average, with excursions past 250. It is 100 to 400 miles wide and only 3,000 to 7,000 ft thick, and the fluctuations along its edges are a leading source of clear air turbulence.",
    },
    knowCold: "FL300, west to east, 100–150 kt.",
    source: MECH,
  },
  {
    id: "wx-x-cloud-types",
    title: "Group, Shape, Consequence",
    promise: "Altitude names the group. Shape reports the stability.",
    unit: "w5",
    conceptIds: ["wx-cloud-groups", "wx-special-clouds", "wx-precipitation-types"],
    lessonId: "wl12-cloud-types",
    diagram: { id: "wx-cloud-groups" },
    frames: [
      { caption: "Low, Middle and High are set purely by altitude.", hold: 3000, props: { group: "low" } },
      { caption: "The same shapes recur in each band.", hold: 2800, props: { group: "middle" } },
      { caption: "Cumuliform means unstable air, and gives showery precipitation.", hold: 3400, props: { group: "high" } },
      { caption: "Stratiform means stable air, and gives continuous precipitation.", hold: 3400, props: { group: "low" } },
      { caption: "Special is the fourth group — cumulonimbus spans everything.", hold: 3400, props: { group: "special" } },
    ],
    predict: {
      at: 1,
      question:
        "Cloud GROUP — low, middle, high — is set purely by altitude. What does the SHAPE tell you?",
      options: [
        "Altitude as well",
        "The stability of the air it formed in",
        "The season it formed in",
      ],
      answer: 1,
      because:
        "Two independent axes. Group is height; shape is stability. Cumuliform means unstable air and showery precipitation, stratiform means stable air and continuous precipitation — and the same shapes recur in every altitude band.",
    },
    knowCold: "Group is altitude. Shape is stability.",
    source: MECH,
  },
  {
    id: "wx-x-turbulence-scales",
    title: "How Bad, and How Often",
    promise: "Two scales that get read as one.",
    unit: "w7",
    conceptIds: ["wx-turbulence-intensity", "wx-turbulence-duration", "wx-turbulence"],
    lessonId: "wl15-turbulence-classification",
    diagram: { id: "wx-turbulence-causes" },
    frames: [
      { caption: "Intensity: light, moderate, severe, extreme.", hold: 3000, props: { cause: "none" } },
      { caption: "Extreme means declare an emergency and exit the area ASAP.", hold: 3400, props: { cause: "windshear" } },
      { caption: "Duration is a SEPARATE scale: occasional, intermittent, continuous.", hold: 3400, props: { cause: "thermal" } },
      { caption: "Occasional under a third, intermittent to two thirds, continuous beyond.", hold: 3400, props: { cause: "frontal" } },
      { caption: "Continuous LIGHT turbulence is an ordinary report. Both scales matter.", hold: 3400, props: { cause: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "A PIREP reports CONTINUOUS LIGHT turbulence. Is that a serious report?",
      options: [
        "Yes — continuous is the worst there is",
        "No — intensity and duration are separate scales, and light is light",
        "Only above FL180",
      ],
      answer: 1,
      because:
        "Two scales, read independently. Intensity runs light, moderate, severe, extreme — and extreme means declare an emergency and leave. Duration runs occasional, intermittent, continuous. Continuous light is an ordinary, unremarkable report.",
    },
    knowCold: "Intensity and duration are two different scales.",
    source: HAZ,
  },
  {
    id: "wx-x-technique",
    title: "Stop Chasing the Needles",
    promise: "The turbulence technique, which is mostly a list of things not to do.",
    unit: "w7",
    conceptIds: ["wx-turbulence-technique"],
    lessonId: "wl17-flying-turbulence",
    diagram: { id: "wx-turbulence-causes" },
    frames: [
      { caption: "Set the power for the recommended penetration airspeed.", hold: 3000, props: { cause: "none" } },
      { caption: "Trim for level flight, then leave the trim alone.", hold: 3000, props: { cause: "none" } },
      { caption: "Airspeed will wander. Do NOT correct it with power.", hold: 3200, props: { cause: "windshear" } },
      { caption: "Altitude will wander. Do NOT chase the altimeter.", hold: 3200, props: { cause: "thermal" } },
      { caption: "Fly pitch and bank on the attitude indicator. Keep it level.", hold: 3400, props: { cause: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "Penetrating turbulence, your airspeed starts wandering. Do you correct it with power?",
      options: [
        "Yes — hold the recommended penetration speed",
        "No — let it wander and fly attitude",
        "Only if it moves more than 20 kt",
      ],
      answer: 1,
      because:
        "Chasing the needles feeds energy into an aircraft that is already being thrown around, and the corrections arrive out of phase with the gusts. Set the power, trim once, then fly pitch and bank on the attitude indicator and let airspeed and altitude move.",
    },
    knowCold: "Fly attitude. Let airspeed and altitude move.",
    source: HAZ,
  },
  {
    id: "wx-x-icing-cost",
    title: "Everything Moves the Wrong Way",
    promise: "What ice costs, and the four ways out.",
    unit: "w8",
    conceptIds: ["wx-icing-effects", "wx-icing-response"],
    lessonId: "wl20-icing-consequences",
    diagram: { id: "wx-icing-ladder" },
    frames: [
      { caption: "Drag up. Weight up. Stall speed up. Fuel consumption up.", hold: 3400, props: { temp: -5 } },
      { caption: "Thrust down. Range down. Lift down. Performance falls.", hold: 3400, props: { temp: -5 } },
      { caption: "De-icing REMOVES ice. Anti-icing PREVENTS accumulation.", hold: 3400, props: { temp: -12 } },
      { caption: "Climb to colder than −20 °C, or descend to warmer air.", hold: 3400, props: { temp: -22 } },
      { caption: "Or leave the visible moisture. And minimise manoeuvring throughout.", hold: 3400, props: { temp: 2 } },
    ],
    predict: {
      at: 1,
      question:
        "De-icing and anti-icing — what is the difference?",
      options: [
        "Nothing, two names for the same system",
        "De-icing removes ice that formed; anti-icing prevents it forming",
        "Anti-icing is for propellers only",
      ],
      answer: 1,
      because:
        "One is a cure, the other a preventative, and they are used at different moments. Either way, every number moves the wrong way once ice is on: drag, weight and stall speed up, thrust, range and lift down.",
    },
    knowCold: "De-ice removes, anti-ice prevents. Colder than −20 °C.",
    source: HAZ,
  },
  {
    id: "wx-x-ceiling",
    title: "What Counts as a Ceiling",
    promise: "One definition, and four visibilities that are not interchangeable.",
    unit: "w10",
    conceptIds: ["wx-ceiling", "wx-visibility-types"],
    lessonId: "wl24-reading-the-sky",
    diagram: { id: "wx-fog" },
    frames: [
      { caption: "The ceiling is the lowest BROKEN or OVERCAST layer, in AGL.", hold: 3400, props: { highlight: "none" } },
      { caption: "Or the vertical visibility, if the sky is totally obscured.", hold: 3200, props: { highlight: "geometry" } },
      { caption: "Scattered is never a ceiling, however low it sits.", hold: 3200, props: { highlight: "none" } },
      { caption: "Prevailing visibility covers at least half the horizon circle.", hold: 3400, props: { highlight: "spread" } },
      { caption: "And RVR is the only one of the four measured in feet.", hold: 3200, props: { highlight: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "A scattered layer sits at 400 ft AGL. Is that a ceiling?",
      options: [
        "Yes — it is the lowest layer there is",
        "No — only broken, overcast or vertical visibility count",
        "Only if it is below 500 ft",
      ],
      answer: 1,
      because:
        "Scattered is never a ceiling, however low it sits. The ceiling is the lowest broken or overcast layer in AGL, or the vertical visibility if the sky is totally obscured. And of the four visibility measures, RVR is the only one in feet.",
    },
    knowCold: "Broken, overcast or VV. Never scattered. RVR is in feet.",
    source: PLAN,
  },
  {
    id: "wx-x-charts",
    title: "Now, Later, and How It Was Made",
    promise: "Two charts and two imagery sources, and what separates each pair.",
    unit: "w10",
    conceptIds: ["wx-surface-analysis", "wx-prognostic-chart", "wx-radar-satellite"],
    lessonId: "wl26-charts-and-imagery",
    diagram: { id: "wx-pressure-field" },
    frames: [
      { caption: "The surface analysis: troughs, fronts, pressure systems, isobars.", hold: 3400, props: { level: "both" } },
      { caption: "Isobars at 4 mb spacing — and NO precipitation on it.", hold: 3400, props: { level: "gradient" } },
      { caption: "The prognostic chart is the forecast one, WITH precipitation.", hold: 3400, props: { level: "surface" } },
      { caption: "Radar is ground based, and restricted to line of sight.", hold: 3200, props: { level: "both" } },
      { caption: "Satellite is not — and the whiter the image, the thicker the cloud.", hold: 3400, props: { level: "both" } },
    ],
    predict: {
      at: 1,
      question:
        "You want to see where the precipitation is. Which chart do you reach for?",
      options: [
        "The surface analysis",
        "The prognostic chart",
        "Either — both carry it",
      ],
      answer: 1,
      because:
        "The surface analysis shows what is happening now — fronts, troughs, pressure systems, isobars at 4 mb — and carries NO precipitation at all. The prognostic chart is the forecast one, and that is where precipitation appears.",
    },
    knowCold: "No rain on a surface analysis. Whiter is thicker.",
    source: PLAN,
  },
];


/** Explainers for the trainee guide material. */
export const EXPLAINERS_C: Explainer[] = [
  {
    id: "wx-x-squall-line",
    title: "Out Ahead of the Front",
    promise: "Why the worst weather at a cold front is often nowhere near it.",
    unit: "w6",
    conceptIds: ["wx-squall-line", "wx-frontal-weather-factors"],
    lessonId: "wl14b-squall-lines-and-dry-fronts",
    diagram: { id: "wx-front" },
    frames: [
      { caption: "A cold front advances, undercutting the warm air.", hold: 3000, props: { kind: "cold" } },
      { caption: "Its downdrafts run out ahead of it along the surface.", hold: 3200, props: { kind: "cold" } },
      { caption: "They lift more warm unstable air, 50 to 300 miles out front.", hold: 3400, props: { kind: "cold" } },
      { caption: "That air starts its own thunderstorm cycle: the squall line.", hold: 3400, props: { kind: "cold" } },
      { caption: "Too close together to fly through, even with radar.", hold: 3200, props: { kind: "occluded" } },
    ],
    predict: {
      at: 2,
      question:
        "A squall line has built 150 miles ahead of the cold front. Can radar find you a way through it?",
      options: [
        "Yes — that is exactly what radar is for",
        "No — the cells are packed too close together",
        "Only underneath, below 10,000 ft",
      ],
      answer: 1,
      because:
        "The line forms where the front's own surface downdrafts run out ahead and lift more warm unstable air — 50 to 300 miles out. The resulting cells sit too close together to thread, radar or no radar. It is a thing to go around, not through.",
    },
    knowCold: "50–300 miles ahead, parallel, and radar will not get you through.",
    source: TGX("Frontal Mechanics"),
  },
  {
    id: "wx-x-mountain-wave",
    title: "The Wave That Stands Still",
    promise: "Three clouds, one standing wave, and the wind speed that makes it extreme.",
    unit: "w7",
    conceptIds: ["wx-mountain-wave", "wx-wave-clouds", "wx-wave-technique"],
    lessonId: "wl16b-mountain-waves",
    diagram: { id: "wx-mountain-wave" },
    frames: [
      { caption: "Strong wind, perpendicular to the ridge, in stable air.", hold: 3200, props: { wind: 30, clouds: false } },
      { caption: "The air oscillates downwind, forming a standing wave.", hold: 3200, props: { wind: 40, clouds: false } },
      { caption: "The cap cloud sits on the peak; the rotor at ridge height.", hold: 3400, props: { wind: 60, clouds: true, highlight: "clouds" } },
      { caption: "Lenticular clouds mark the crests, usually above 20,000 ft.", hold: 3400, props: { wind: 60, clouds: true, highlight: "clouds" } },
      { caption: "At 50 kt or more at the peak, it turns severe — 150 miles downwind.", hold: 3400, props: { wind: 80, clouds: true } },
    ],
    predict: {
      at: 2,
      question:
        "Wind at the peak reaches 50 kt across the ridge. How far downwind can the severe turbulence reach?",
      options: [
        "About 10 miles",
        "Up to 150 miles",
        "It stays over the ridge itself",
      ],
      answer: 1,
      because:
        "50 kt at the peak is the threshold where it turns severe, and the standing wave carries that turbulence as far as 150 miles downwind. The clouds map it for you: cap on the peak, rotor at ridge height, lenticulars marking the crests.",
    },
    knowCold: "50 kt at the peak. Lenticular high, rotor at the ridge, cap on the peak.",
    source: TGX("Turbulence"),
  },
  {
    id: "wx-x-ash",
    title: "The One Radar Cannot See",
    promise: "Why over and under are both wrong for an ash cloud.",
    unit: "w9",
    conceptIds: ["wx-ash-clouds", "wx-ash-avoidance"],
    lessonId: "wl23b-volcanic-ash",
    diagram: { id: "wx-storm-avoidance" },
    frames: [
      { caption: "For a thunderstorm, over and under are options two and three.", hold: 3200, props: { option: "over" } },
      { caption: "An ash cloud is hundreds of miles long and thousands of feet thick.", hold: 3400, props: { option: "under" } },
      { caption: "And radar cannot see it — the particles are too small.", hold: 3200, props: { option: "none" } },
      { caption: "You may not know until torching appears at the tailpipe.", hold: 3400, props: { option: "through" } },
      { caption: "So there is one option: a 180° turn, then ATC and a PIREP.", hold: 3400, props: { option: "circumnavigate" } },
    ],
    predict: {
      at: 1,
      question:
        "For a thunderstorm, over and under are options two and three. What are they for a volcanic ash cloud?",
      options: [
        "The same — over is safest",
        "Neither. A 180° turn is the only option",
        "Under, because ash rises",
      ],
      answer: 1,
      because:
        "An ash cloud is hundreds of miles long and thousands of feet thick, and radar cannot see it — the particles are too small to return. You may not know you are in it until torching appears at the tailpipe. Turn 180°, then tell ATC and file a PIREP.",
    },
    knowCold: "180° out. Never over, never under.",
    source: TGX("Atmospheric Hazards"),
  },
];
