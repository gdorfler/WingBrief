import type { Question, SourceReference } from "@/lib/types";
import { CONCEPTS } from "../concepts";
import { CONCEPTS_B } from "../concepts-b";

/** Weather splits its concept graph across two files; both are in scope here. */
const ALL_CONCEPTS = [...CONCEPTS, ...CONCEPTS_B];

/**
 * Application-tier questions for concepts the bank could previously only
 * assess by recognition.
 *
 * Weather's gap was 28 concepts, and it came with a second problem the other
 * courses did not have: of 217 questions, exactly one was modelled on an
 * official review question. The bank knew the material and did not sound like
 * the exam.
 *
 * Weather is a subject about systems that evolve, so the demand here is
 * prediction rather than identification — given this state of the atmosphere,
 * what happens next, and what does it mean for the aircraft. Recognising a
 * warm front is worth little; knowing what you will fly through, in what
 * order, is the whole skill.
 */

function sourceOf(conceptId: string): SourceReference {
  const concept = ALL_CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) throw new Error(`application.ts references unknown concept ${conceptId}`);
  return concept.source;
}

type AppliedSpec = Question extends infer T
  ? T extends Question
    ? Omit<T, "source" | "conceptIds">
    : never
  : never;

function applied(conceptId: string, q: AppliedSpec): Question {
  return { ...q, conceptIds: [conceptId], source: sourceOf(conceptId) } as Question;
}

export const APPLICATION_QUESTIONS: Question[] = [
  /* ================================================================ */
  /* W1 — THE ATMOSPHERE                                               */
  /* ================================================================ */

  applied("wx-troposphere", {
    id: "wq-ap-001",
    type: "mcq",
    unit: "w1",
    prompt:
      "Climbing through the troposphere, temperature and wind speed respectively tend to",
    options: ["fall and fall", "fall and rise", "rise and fall", "rise and rise"],
    answer: 1,
    explanation:
      "Within the troposphere altitude ↑ brings temperature ↓ and wind ↑. That pairing is why the strongest winds and the jet stream sit at the top of the layer rather than the bottom, and why nearly all weather lives below them.",
    knowCold: "Up through the troposphere: colder and windier.",
    difficulty: 3,
  }),

  applied("wx-atmospheric-pressure", {
    id: "wq-ap-002",
    type: "mcq",
    unit: "w1",
    prompt:
      "Station pressure at a 4,000 ft field is measured. Compared with sea level pressure on the same day it will be lower by roughly",
    options: ["0.4 inHg", "1 inHg", "4 inHg", "14 inHg"],
    answer: 2,
    explanation:
      "The standard pressure lapse is about 1 inHg per 1,000 ft, so 4,000 ft costs roughly 4 inHg. Pressure is the weight of the air column above you, and standing 4,000 ft higher removes 4,000 ft of that column.",
    knowCold: "1 inHg per 1,000 ft.",
    difficulty: 3,
  }),

  applied("wx-standard-atmosphere", {
    id: "wq-ap-003",
    type: "mcq",
    unit: "w1",
    prompt:
      "A sea level station reports 30.42 inHg and 15 °C. Relative to the standard atmosphere this is",
    options: [
      "standard pressure, standard temperature",
      "half an inch above standard pressure, standard temperature",
      "half an inch below standard pressure, standard temperature",
      "standard pressure, 15 degrees above standard temperature",
    ],
    answer: 1,
    explanation:
      "Standard sea level is 29.92 inHg and 15 °C. 30.42 is 0.50 inHg ABOVE standard; the temperature is exactly standard. Knowing the baseline in both units is what makes any 'compared with standard' question answerable.",
    knowCold: "29.92 inHg and 15 °C (59 °F) at sea level.",
    difficulty: 3,
  }),

  applied("wx-slp-sp", {
    id: "wq-ap-004",
    type: "spotTheTrap",
    unit: "w1",
    prompt:
      '"A station at 2,500 ft elevation can report a station pressure higher than its sea level pressure."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Station pressure is measured at the field; sea level pressure is the value at — or reduced to — sea level. Any station above sea level has less air column above it, so SP is ALWAYS less than SLP. The altimeter setting is the sea level figure.",
    knowCold: "Station above sea level → SP always < SLP.",
    difficulty: 3,
  }),

  applied("wx-layer-flight-conditions", {
    id: "wq-ap-005",
    type: "mcq",
    unit: "w1",
    prompt:
      "A crew wants the smoothest ride with the best visibility, accepting a long climb. They should plan to cruise in the",
    options: ["troposphere", "tropopause", "stratosphere", "lowest 2,000 ft AGL"],
    answer: 2,
    explanation:
      "The stratosphere is smooth with excellent visibility. The troposphere carries nearly all the weather and therefore the turbulence, icing and restricted visibility; the tropopause is where the jet stream and its wind shear sit.",
    knowCold: "Troposphere = weather · Tropopause = jet stream · Stratosphere = smooth.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W2 — ALTITUDE AND THE ALTIMETER                                   */
  /* ================================================================ */

  applied("wx-indicated-altitude", {
    id: "wq-ap-006",
    type: "mcq",
    unit: "w2",
    prompt:
      "With the current local altimeter setting in the Kollsman window, the number on the altimeter is",
    options: [
      "pressure altitude",
      "indicated altitude, which is attempting to be true altitude",
      "absolute altitude",
      "density altitude",
    ],
    answer: 1,
    explanation:
      "Indicated altitude is simply what the barometric altimeter shows, and with a correct local setting it is attempting to show true altitude — height above mean sea level. Non-standard temperature is what keeps the attempt from being exact.",
    knowCold: "Indicated = what the needle says, trying to be true altitude.",
    difficulty: 3,
  }),

  applied("wx-true-altitude", {
    id: "wq-ap-007",
    type: "mcq",
    unit: "w2",
    prompt:
      "Terrain clearance over a 3,200 ft MSL ridge must be evaluated against which altitude?",
    options: ["pressure altitude", "true altitude", "indicated altitude uncorrected", "density altitude"],
    answer: 1,
    explanation:
      "True altitude is height above mean sea level, and charted terrain is given in MSL — so the comparison has to be made in the same reference. It is the standard altitude, and the one obstacle clearance is written in.",
    knowCold: "True altitude = height above MSL = the one terrain is charted in.",
    difficulty: 3,
  }),

  applied("wx-pressure-altitude", {
    id: "wq-ap-008",
    type: "mcq",
    unit: "w2",
    prompt: "Above the Class A floor every aircraft sets 29.92. They are therefore all flying",
    options: [
      "true altitude, so terrain clearance is assured",
      "pressure altitude, so vertical separation is consistent between aircraft",
      "indicated altitude corrected for temperature",
      "absolute altitude above the terrain",
    ],
    answer: 1,
    explanation:
      "29.92 in the Kollsman window gives pressure altitude — height above the standard datum plane. It is standard in Class A precisely because a common reference keeps aircraft correctly separated FROM EACH OTHER, even when none of them is reading true altitude.",
    knowCold: "29.92 set = pressure altitude = everyone on the same datum.",
    difficulty: 3,
  }),

  applied("wx-altimeter", {
    id: "wq-ap-009",
    type: "mcq",
    unit: "w2",
    prompt:
      "An altimeter is set to 30.12 when the correct local setting is 29.82. The indication is in error by",
    options: ["30 ft", "100 ft", "300 ft", "1,000 ft"],
    answer: 2,
    explanation:
      "The altimeter is calibrated to show 1,000 ft for every 1 inHg of difference, so 0.30 inHg of setting error is 300 ft of indication error. The instrument is measuring the difference between static pressure and whatever is set in the window — set the wrong number and the whole scale shifts.",
    whyWrong:
      "1,000 ft is the error from a full inch; 0.30 of an inch gives 0.30 of that.",
    knowCold: "1 inHg = 1,000 ft. So 0.01 inHg = 10 ft.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W4 — WIND                                                         */
  /* ================================================================ */

  applied("wx-gradient-wind", {
    id: "wq-ap-010",
    type: "mcq",
    unit: "w4",
    prompt:
      "At 6,000 ft AGL the wind is flowing around a low pressure centre. Its direction relative to the isobars and its sense of rotation are",
    options: [
      "across the isobars, clockwise",
      "parallel to the isobars, counter-clockwise",
      "parallel to the isobars, clockwise",
      "across the isobars, counter-clockwise",
    ],
    answer: 1,
    explanation:
      "Above 2,000 ft AGL friction is negligible, so the gradient wind runs PARALLEL to the isobars — counter-clockwise around a low and clockwise around a high in the northern hemisphere.",
    knowCold: "Gradient wind: above 2,000 AGL, parallel to isobars, CCW round a low.",
    difficulty: 3,
  }),

  applied("wx-surface-wind", {
    id: "wq-ap-011",
    type: "mcq",
    unit: "w4",
    prompt:
      "Descending through 2,000 ft AGL on approach, the wind begins to shift direction relative to the isobars. The cause is",
    options: [
      "the Coriolis force strengthening near the ground",
      "surface friction",
      "the pressure gradient reversing",
      "thermal turbulence only",
    ],
    answer: 1,
    explanation:
      "2,000 ft AGL is the dividing line for both winds. Below it, surface friction slows the flow and adds directional variation, so the surface wind is similar to the gradient wind but no longer neatly parallel to the isobars.",
    knowCold: "2,000 ft AGL splits gradient wind from surface wind. Friction is the reason.",
    difficulty: 3,
  }),

  applied("wx-buys-ballot", {
    id: "wq-ap-012",
    type: "mcq",
    unit: "w4",
    prompt:
      "In the northern hemisphere a pilot stands with the wind at their back. The low pressure centre lies to their",
    options: ["left", "right", "front", "rear"],
    answer: 0,
    explanation:
      "Buys Ballot's law: wind at your back, low to the LEFT and high to the right. It is the fastest way to locate a system from a single wind observation, with no chart at all.",
    knowCold: "Wind at your back → L left, H right.",
    difficulty: 3,
  }),

  applied("wx-jet-stream", {
    id: "wq-ap-013",
    type: "mcq",
    unit: "w4",
    prompt:
      "Planning an eastbound transcontinental leg, the crew looks for the jet stream at approximately",
    options: ["FL180", "FL300", "FL450", "the surface to 2,000 ft AGL"],
    answer: 1,
    explanation:
      "The jet stream averages FL300 over the US, sitting at the top of the troposphere. It generally runs west to east — a tailwind eastbound — averaging 100–150 kt and occasionally exceeding 250 kt, and it can shift hourly.",
    knowCold: "Jet stream ≈ FL300, west to east, 100–150 kt typical.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W5 — CLOUDS AND LIFTING                                           */
  /* ================================================================ */

  applied("wx-cloud-groups", {
    id: "wq-ap-014",
    type: "mcq",
    unit: "w5",
    prompt: "What determines which group a cloud belongs to?",
    options: [
      "Its shape",
      "The altitude group it occupies",
      "Whether it produces precipitation",
      "Its water content",
    ],
    answer: 1,
    explanation:
      "The four groups are Low, Middle, High and Special, and a cloud is defined by the ALTITUDE group it is in. Shape and precipitation describe the cloud's type and behaviour within its group, not which group it belongs to.",
    knowCold: "Low, Middle, High, Special — grouped by altitude.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W6 — FRONTS                                                       */
  /* ================================================================ */

  applied("wx-frontal-discontinuities", {
    id: "wq-ap-015",
    type: "mcq",
    unit: "w6",
    prompt:
      "Crossing a surface front, which set of quantities should be expected to change?",
    options: [
      "Temperature, dew point, wind and pressure",
      "Temperature and pressure only",
      "Wind and visibility only",
      "Dew point and cloud type only",
    ],
    answer: 0,
    explanation:
      "TDWP — Temperature, Dew point, Wind and Pressure. A front is a discontinuity between contrasting air masses, and those four are the measurable ways the contrast shows itself. Where they all shift together, you have crossed one.",
    knowCold: "TDWP: Temperature · Dew point · Wind · Pressure.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W7 — TURBULENCE AND WIND SHEAR                                    */
  /* ================================================================ */

  applied("wx-turbulence", {
    id: "wq-ap-016",
    type: "mcq",
    unit: "w7",
    prompt: "Turbulence is most hazardous",
    options: [
      "at cruise altitude, where true airspeed is greatest",
      "at low altitudes",
      "in the stratosphere",
      "wherever the jet stream is found",
    ],
    answer: 1,
    explanation:
      "Irregular or disturbed flow producing gusts and eddies is most hazardous at LOW altitude — where there is least room and least time to recover from an upset, and where the aircraft is slow and configured.",
    knowCold: "Turbulence hurts most down low.",
    difficulty: 3,
  }),

  applied("wx-turbulence-intensity", {
    id: "wq-ap-017",
    type: "mcq",
    unit: "w7",
    prompt:
      "An aircraft encounters turbulence classified as extreme. The required response is to",
    options: [
      "report it by PIREP and continue on course",
      "declare an emergency and exit the area as soon as possible",
      "reduce to penetration speed and maintain altitude",
      "climb above the layer before taking further action",
    ],
    answer: 1,
    explanation:
      "Extreme is the category that carries a mandated response: declare an emergency and get out as soon as possible. Light, moderate and severe are flown through with technique; extreme is not. PIREPs additionally use 'trace' at the bottom of the scale.",
    knowCold: "Extreme turbulence → declare an emergency, exit ASAP.",
    difficulty: 3,
  }),

  applied("wx-thermal-turbulence", {
    id: "wq-ap-018",
    type: "mcq",
    unit: "w7",
    prompt:
      "On a hot afternoon, the strongest thermal turbulence is likely over",
    options: ["a large lake", "irrigated farmland", "dry desert terrain", "dense forest"],
    answer: 2,
    explanation:
      "Thermal turbulence comes from heating below, and its strength depends on the surface being heated: generally, the DRIER the surface, the stronger the turbulence. Dry ground heats fastest and drives the most vigorous convection; water heats slowly and gives the smoothest air.",
    knowCold: "Drier surface → stronger thermal turbulence.",
    difficulty: 3,
  }),

  applied("wx-mechanical-turbulence", {
    id: "wq-ap-019",
    type: "mcq",
    unit: "w7",
    prompt:
      "Strong wind is flowing over a ridge line and a built-up area near the field. Mechanical turbulence from this is usually found",
    options: [
      "above 10,000 ft AGL",
      "usually below 1,000 ft AGL",
      "only in the stratosphere",
      "uniformly at all altitudes",
    ],
    answer: 1,
    explanation:
      "Mechanical turbulence occurs when buildings, ground objects, hills and valleys interfere with the normal wind flow, and it usually lives below 1,000 ft AGL. Rougher terrain, faster wind and more unstable air each make it worse — which puts all three squarely in the approach and departure phase.",
    knowCold: "Mechanical turbulence: usually below 1,000 ft AGL.",
    difficulty: 3,
  }),

  applied("wx-turbulence-technique", {
    id: "wq-ap-020",
    type: "mcq",
    unit: "w7",
    prompt:
      "Penetrating moderate turbulence, airspeed fluctuates ±15 kt and altitude wanders 200 ft. The correct technique is to",
    options: [
      "chase airspeed with power and hold altitude precisely",
      "maintain a level attitude on the attitude indicator and let airspeed and altitude vary",
      "increase power and climb above the layer immediately",
      "disconnect the attitude indicator and fly by altimeter alone",
    ],
    answer: 1,
    explanation:
      "Fly ATTITUDE. Set the recommended turbulence penetration power, trim for level flight, and then leave it alone: do not chase airspeed deviations with power, do not chase the altimeter. Pitch and bank come from the attitude indicator, with a VFR scan when conditions permit.",
    whyWrong:
      "Chasing the instruments is the instinct the rule exists to override — corrections in turbulence add stress and can make the excursions worse.",
    knowCold: "Fly attitude. Let airspeed and altitude wander.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W8 — ICING                                                        */
  /* ================================================================ */

  applied("wx-icing-requirements", {
    id: "wq-ap-021",
    type: "mcq",
    unit: "w8",
    prompt:
      "An aircraft is in cloud at −8 °C, but its surfaces have been heated to +3 °C. Structural icing",
    options: [
      "will form, since visible moisture and freezing air are present",
      "will not form, since the aircraft surface is above freezing",
      "will form only on unheated surfaces below the wing",
      "cannot be predicted from this information",
    ],
    answer: 1,
    explanation:
      "All THREE conditions are required together: visible moisture, free air temperature below freezing, AND aircraft surface temperature below freezing. Heating the surface removes the third, so ice cannot form — which is exactly how anti-ice systems work.",
    knowCold: "Visible moisture + FAT below freezing + surface below freezing. Remove one, no ice.",
    difficulty: 3,
  }),

  applied("wx-icing-effects", {
    id: "wq-ap-022",
    type: "mcq",
    unit: "w8",
    prompt:
      "An aircraft accumulates airframe ice. Which pair BOTH increase?",
    options: ["Lift and thrust", "Drag and stall speed", "Range and lift", "Thrust and range"],
    answer: 1,
    explanation:
      "Ice raises drag, weight, stall speed and fuel consumption; it lowers thrust, range and lift. Drag and stall speed both belong to the rising group, and the stall speed rise is the one that bites — the aircraft stalls at a higher speed than the pilot expects.",
    knowCold: "Ice: ↑ drag, weight, stall speed, fuel burn · ↓ thrust, range, lift.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W9 — STORMS AND LOW VISIBILITY                                    */
  /* ================================================================ */

  applied("wx-thunderstorm-hazards", {
    id: "wq-ap-023",
    type: "mcq",
    unit: "w9",
    prompt:
      "Which of these is NOT one of the six recognised thunderstorm hazards?",
    options: ["Hail", "Microbursts", "Structural icing", "Freezing fog"],
    answer: 3,
    explanation:
      "HI MELT — Hail, Icing, Microbursts, Extreme turbulence, Lightning and Tornados. Freezing fog is a visibility and icing phenomenon in its own right but it is not on the thunderstorm list.",
    knowCold: "HI MELT: Hail · Icing · Microbursts · Extreme turbulence · Lightning · Tornados.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* W10 — WEATHER PRODUCTS                                            */
  /* ================================================================ */

  applied("wx-ceiling", {
    id: "wq-ap-024",
    type: "mcq",
    unit: "w10",
    prompt:
      "A report gives SCT008 BKN025 OVC060. The ceiling is",
    options: ["800 ft", "2,500 ft", "6,000 ft", "there is no ceiling"],
    answer: 1,
    explanation:
      "The ceiling is the LOWEST broken, overcast or vertical visibility layer, in AGL. Scattered does not count, so the 800 ft layer is passed over and the broken layer at 2,500 ft is the ceiling.",
    whyWrong:
      "800 ft is the trap: it is the lowest layer reported, but scattered is not a ceiling.",
    knowCold: "Ceiling = lowest BKN, OVC or VV. Scattered never counts.",
    difficulty: 3,
  }),

  applied("wx-pirep", {
    id: "wq-ap-025",
    type: "mcq",
    unit: "w10",
    prompt:
      "Which of these situations does NOT require a PIREP?",
    options: [
      "Wind shear encountered on departure",
      "Conditions differing from the last observation on an IFR approach",
      "A routine arrival in forecast conditions",
      "Executing a missed approach",
    ],
    answer: 2,
    explanation:
      "IWRUM — required when conditions differ from the last observation on an IFR approach, on wind shear during departure or arrival, when requested in-flight by ATC, on unusual or unforeseen weather, and on a missed approach. A routine arrival matching the forecast tells other aviators nothing new.",
    knowCold: "PIREP required: IWRUM.",
    difficulty: 3,
  }),

  applied("wx-prognostic-chart", {
    id: "wq-ap-026",
    type: "mcq",
    unit: "w10",
    prompt:
      "A crew planning a flight two days out wants the big picture of expected conditions including precipitation. The product is the",
    options: ["surface analysis chart", "prognostic chart", "winds aloft forecast", "radar summary"],
    answer: 1,
    explanation:
      "Prognostic charts forecast FUTURE conditions with precipitation, for big-picture planning. A radar summary and a surface analysis describe what is happening now; winds aloft answer a narrower question about a chosen flight level.",
    knowCold: "Prog chart = forecast future conditions, with precipitation.",
    difficulty: 3,
  }),

  applied("wx-radar-satellite", {
    id: "wq-ap-027",
    type: "mcq",
    unit: "w10",
    prompt:
      "Weather over a remote ocean area far from any station is best assessed using",
    options: [
      "ground radar, which has the longer range",
      "satellite imagery, which is not ground based",
      "a surface analysis chart",
      "PIREPs only",
    ],
    answer: 1,
    explanation:
      "Radar is ground based and restricted to line of sight, so a remote ocean is simply outside it. Satellite is not ground based and shows cloud reflectivity — the whiter the image, the thicker the cloud.",
    knowCold: "Radar: ground based, line of sight. Satellite: neither.",
    difficulty: 3,
  }),

  applied("wx-winds-aloft", {
    id: "wq-ap-028",
    type: "mcq",
    unit: "w10",
    prompt: "The winds aloft forecast is used principally to",
    options: [
      "determine the ceiling at destination",
      "choose a flight level and aid navigation planning",
      "identify frontal positions",
      "establish the altimeter setting en route",
    ],
    answer: 1,
    explanation:
      "It gives current and forecast winds at altitude, and its job is helping the crew pick a flight level and plan the navigation — used alongside other variables rather than alone. Ceilings, fronts and altimeter settings come from other products.",
    knowCold: "Winds aloft → pick your flight level, plan the leg.",
    difficulty: 3,
  }),
];
