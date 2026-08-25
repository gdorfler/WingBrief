import type { Question, SourceReference } from "@/lib/types";

/**
 * Reading coded reports.
 *
 * Enabling objectives 4.19 and 4.22 do not say "describe a METAR" — they say
 * INTERPRET weather conditions from one. Nothing in the bank did that. Every
 * METAR question was a definition question wearing a METAR's name: what the
 * letters stand for, how often it is issued, what it is used for.
 *
 * So these questions put an actual coded report in the prompt and ask what it
 * says. The reports are the trainee guide's own worked examples — Figure 6-2
 * for the METAR, Figure 6-27 for the military TAF — plus two variants built
 * strictly from the same coding rules, so a student who can read these can
 * read the ones the instructor puts on the board.
 */

const PRODUCTS: SourceReference = {
  document: "Weather Trainee Guide",
  chapter: "Weather Products",
};

/** The guide's own sample, used as the anchor report throughout the unit. */
const SAMPLE =
  "METAR KNPA 082255Z 27004KT 7/8SM R04/4500FT DZ FG SCT000 BKN011 OVC380 19/18 A2997";

export const DECODE_QUESTIONS: Question[] = [
  /* ================================================================ */
  /* METAR — 4.18, 4.19                                                */
  /* ================================================================ */

  {
    id: "wq-dec-001",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-metar-groups"],
    prompt: `${SAMPLE}\n\nWhat is the ceiling?`,
    options: ["Surface", "1,100 ft", "38,000 ft", "There is no ceiling"],
    answer: 1,
    explanation:
      "The ceiling is the lowest BROKEN or OVERCAST layer, so BKN011 gives 1,100 ft AGL. SCT000 is a partial obscuration and never counts as a ceiling, and OVC380 is far above the first broken layer.",
    whyWrong:
      "Answering 'surface' takes SCT000 as the ceiling — the single most common error in reading a METAR.",
    knowCold: "Ceiling = lowest BKN or OVC. Scattered never counts.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-002",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-metar-groups"],
    prompt: `${SAMPLE}\n\nWhat is the wind?`,
    options: [
      "From 027° at 4 knots",
      "From 270° at 4 knots",
      "From 270° at 40 knots",
      "Toward 270° at 4 knots",
    ],
    answer: 1,
    explanation:
      "27004KT is three digits of direction then two of speed: from 270 degrees true at 4 knots. Wind is always reported as the direction it blows FROM.",
    whyWrong:
      "Splitting the digits as 027 / 04 is the trap. The direction group is always three digits, so the split is fixed.",
    knowCold: "Three digits direction, then speed, then KT. Always FROM.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-003",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-metar-groups"],
    prompt: `${SAMPLE}\n\nThe temperature and dew point are one degree apart. What does the report already tell you is happening because of it?`,
    options: [
      "Drizzle and fog",
      "Freezing rain",
      "Thunderstorms in the vicinity",
      "Nothing — one degree of spread is unremarkable",
    ],
    answer: 0,
    explanation:
      "19/18 is a one-degree spread, which means the air is effectively saturated — and DZ FG in the present weather group confirms it: drizzle and fog. The visibility of 7/8SM is the consequence.",
    knowCold: "Small spread → saturated → fog. The groups corroborate each other.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-004",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-metar-groups"],
    prompt: `${SAMPLE}\n\nWhat is the altimeter setting?`,
    options: ["2,997 ft", "29.97 inHg", "299.7 mb", "2.997 inHg"],
    answer: 1,
    explanation:
      "A2997 is the letter A followed by tens, units, tenths and hundredths of inches of mercury: 29.97 inHg. The decimal point is implied and always sits after the second digit.",
    knowCold: "A + 4 digits = inches of mercury, decimal after the second digit.",
    difficulty: 2,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-005",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-metar-groups"],
    prompt:
      "METAR KDAB 141853Z 09014G26KT 060V120 2SM +TSRA BKN008 OVC020CB 24/23 A2989\n\nWhat is the wind doing?",
    options: [
      "From 090° at 14 knots, steady",
      "From 090° at 14 knots gusting 26, varying between 060° and 120°",
      "From 090° at 14 knots, with a 26 knot crosswind",
      "Variable at 26 knots",
    ],
    answer: 1,
    explanation:
      "G marks gusts, so 09014G26KT is 14 knots gusting 26. The separate 060V120 group follows when the direction is variable at more than 6 knots, and lists the limits clockwise.",
    whyWrong:
      "The G group is a peak, not a crosswind component — nothing in a METAR resolves wind onto a runway for you.",
    knowCold: "G = gust. A separate dddVddd group = variable direction, listed clockwise.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-006",
    type: "spotTheTrap",
    unit: "w10",
    conceptIds: ["wx-metar-groups"],
    prompt:
      '"In the report METAR KDAB 141853Z 09014G26KT 060V120 2SM +TSRA BKN008 OVC020CB 24/23 A2989, the field is VFR."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The ceiling is BKN008 — 800 ft — and the visibility is 2 SM. Basic VFR needs 1,000 ft and 3 SM, and this report fails both. Reading a METAR is not the objective in itself; deciding what it permits is.",
    knowCold: "Pull ceiling and visibility, then compare against 1,000/3.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-007",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-metar-speci"],
    prompt:
      "A report is transmitted at 2317Z, twenty-two minutes after the hourly observation, because the visibility has dropped sharply. It will be headed",
    options: ["METAR", "SPECI", "METAR COR", "METAR AUTO"],
    answer: 1,
    explanation:
      "SPECI — an unscheduled special observation, made as soon as possible after critical data change from the previous report. It contains all the same elements as a METAR. COR marks a correction to an earlier report, and AUTO marks a fully automated one.",
    knowCold: "Routine and hourly → METAR. Something changed → SPECI.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-008",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-metar-speci"],
    prompt: "Routine METAR observations are taken in the window",
    options: [
      "on the hour exactly",
      "55 to 59 minutes past the hour",
      "45 to 50 minutes past the hour",
      "any time within the hour",
    ],
    answer: 1,
    explanation:
      "The manual observation window runs from 55 to 59 minutes past the hour, with the fastest-changing elements evaluated last. That is why checking the weather just after the top of the hour gets you the freshest report available.",
    knowCold: "METAR window: xx:55 to xx:59.",
    difficulty: 2,
    source: PRODUCTS,
  },

  /* ================================================================ */
  /* TAF — 4.20, 4.21, 4.22                                            */
  /* ================================================================ */

  {
    id: "wq-dec-009",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-taf-change-groups"],
    prompt:
      "KNSE TAF 2609/2709 28004KT 9000 HZ SCT020 SCT200 QNH2998INS\nTEMPO 2619/2702 8000 TSSHRA SCT010 BKN025CB\n\nAt 0300Z on the 27th, what is forecast?",
    options: [
      "Thunderstorms and rain showers, broken 2,500 CB",
      "The base forecast — the TEMPO window has closed",
      "Nothing is forecast; the TAF has expired",
      "Both lines apply simultaneously",
    ],
    answer: 1,
    explanation:
      "TEMPO ran from 1900Z on the 26th up to but not including 0200Z on the 27th. At 0300Z that window has closed, and because TEMPO supersedes nothing, the base forecast simply resumes. The TAF itself is valid until 0900Z on the 27th.",
    whyWrong:
      "Treating TEMPO as permanent is the classic error — it is the one change group that leaves nothing behind.",
    knowCold: "TEMPO is an overlay. When it ends, what was underneath comes back.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-010",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-taf-change-groups"],
    prompt:
      "A TAF line reads BECMG 2617/2618 23015G25KT. The wind was previously 26007KT and the visibility 9999. After 1800Z on the 26th, the visibility is forecast to be",
    options: [
      "unknown — BECMG lines replace the whole forecast",
      "9999, because BECMG carries over anything it does not list",
      "reduced, because a gusting wind implies it",
      "9000, reverting to the first line",
    ],
    answer: 1,
    explanation:
      "BECMG changes only the elements it names and carries everything else over unchanged. The line names wind only, so the visibility stays as previously forecast. FM is the group that replaces the whole line.",
    knowCold: "BECMG changes what it lists. FM replaces everything.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-011",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-taf-change-groups"],
    prompt:
      "Which change group indicates a rapid, permanent change that supersedes every previous line and carries all forecast elements?",
    options: ["BECMG", "TEMPO", "FM", "PROB"],
    answer: 2,
    explanation:
      "FM — From. It marks a quick and permanent shift in the whole weather pattern, so the line carries every element and everything above it is superseded. BECMG is the slow permanent one, TEMPO the brief one, and PROB a civilian probability group.",
    knowCold: "FM fast and total · BECMG slow and partial · TEMPO brief and temporary.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-012",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-taf-change-groups"],
    prompt:
      "KNSE TAF 2609/2709 — the forecast period runs from the 26th at 0900Z",
    options: [
      "through the 27th at 0900Z inclusive",
      "up to but not including the 27th at 0900Z",
      "for 12 hours only",
      "until amended, with no fixed end",
    ],
    answer: 1,
    explanation:
      "The two four-digit blocks are start and expiry: date then time. The period runs up to but NOT including the second, which is how consecutive TAFs join without overlapping.",
    knowCold: "TAF periods are up to, never including, the end time.",
    difficulty: 2,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-013",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-taf-differences"],
    prompt:
      "A military TAF forecasts visibility as 9000. A civil TAF for the same conditions would read",
    options: ["9000", "9SM", "6SM", "9999"],
    answer: 2,
    explanation:
      "Military TAFs report visibility in metres; U.S. civil TAFs use statute miles. 9000 metres is about 6 statute miles. This is the difference that changes the number rather than just the layout, which is why it is the one worth knowing cold.",
    whyWrong:
      "Reading 9000 as 9 of anything familiar is the trap — the unit is metres, and the conversion is not optional.",
    knowCold: "Military metres, civil statute miles. 9999 = 7 miles or more.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-014",
    type: "spotTheTrap",
    unit: "w10",
    conceptIds: ["wx-taf-differences"],
    prompt: '"A PROB40 group may appear in a TAF issued by a USN or USMC station."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. PROB is a civilian group giving a percentage chance of an occurrence, and USN and USMC stations do not use it. When a military station amends, corrects or delays a forecast it appends a remark to the last line instead of modifying the heading.",
    knowCold: "PROB is civil only.",
    difficulty: 3,
    source: PRODUCTS,
  },

  /* ================================================================ */
  /* Severe Weather Watch — 4.31                                       */
  /* ================================================================ */

  {
    id: "wq-dec-015",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-severe-weather-watch"],
    prompt:
      "A Severe Weather Watch bulletin has been issued for the area you are routing through. It means",
    options: [
      "severe thunderstorms or tornadoes have been observed there",
      "conditions are favourable for severe thunderstorms or tornadoes to develop there",
      "the airspace is closed to VFR traffic",
      "an alternate is now mandatory",
    ],
    answer: 1,
    explanation:
      "A watch defines an area and a period in which severe weather is expected to be POSSIBLE. It is not a report of observed weather — that distinction between watch and warning is the whole point of the bulletin.",
    knowCold: "Watch = conditions are favourable. Warning = it is happening.",
    difficulty: 3,
    source: PRODUCTS,
  },
  {
    id: "wq-dec-016",
    type: "mcq",
    unit: "w10",
    conceptIds: ["wx-severe-weather-watch"],
    prompt: "A Severe Weather Watch message defines",
    options: [
      "a single airfield and its approaches",
      "an area and a time period",
      "a flight level band",
      "a named storm cell and its track",
    ],
    answer: 1,
    explanation:
      "Area and period — where severe thunderstorms or tornadoes are expected to become possible, and between what times. Neither a specific field nor a specific cell is named.",
    knowCold: "Severe Weather Watch: an area, and a window.",
    difficulty: 2,
    source: PRODUCTS,
  },

  /* ================================================================ */
  /* Ground icing — 5.1                                                */
  /* ================================================================ */

  {
    id: "wq-dec-017",
    type: "mcq",
    unit: "w8",
    conceptIds: ["wx-ground-icing"],
    prompt:
      "A thin layer of frost has formed on the upper wing surface overnight. Its effect on the takeoff is that",
    options: [
      "it will sublimate in the takeoff roll and can be ignored",
      "lift is reduced and stall speed is raised, at the point of least margin",
      "only the weight penalty matters",
      "it affects the aircraft only above the stall angle",
    ],
    answer: 1,
    explanation:
      "Frost roughens the surface and disrupts the boundary layer, so lift falls and stall speed rises — exactly as in-flight ice does, but on takeoff there is no altitude in hand. That is why the requirement is clean surfaces, not nearly clean ones.",
    whyWrong:
      "The weight of frost is trivial; the aerodynamic penalty is not. Weighing it is the wrong instinct.",
    knowCold: "Frost does not need to change the wing's shape to ruin it. Roughness is enough.",
    difficulty: 3,
    source: {
      document: "Weather Trainee Guide",
      chapter: "Icing",
    },
  },
  {
    id: "wq-dec-018",
    type: "mcq",
    unit: "w8",
    conceptIds: ["wx-ground-icing"],
    prompt: "Ground icing is more dangerous than the equivalent accumulation in flight because",
    options: [
      "the ice is denser at ground level",
      "there is no altitude or airspeed margin available to recover",
      "de-icing equipment does not work on the ground",
      "it always forms as clear ice",
    ],
    answer: 1,
    explanation:
      "The aerodynamic penalty is the same; the margin is not. A wing that will not make lift as expected is survivable at altitude and is not at rotation, which is the whole reason for the pre-flight requirement.",
    knowCold: "Same penalty, no margin. That is the ground-icing hazard.",
    difficulty: 3,
    source: {
      document: "Weather Trainee Guide",
      chapter: "Icing",
    },
  },
];
