import type { Question, SourceReference } from "@/lib/types";

/**
 * The second question on each concept.
 *
 * One question per concept means a student can clear it on a coin flip and the
 * review queue has nothing to resurface. These are the second passes — written
 * to come at the same idea from a different angle rather than to reword the
 * first, so getting both right means something.
 */

const TG = (chapter: string, eo?: string[]): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter,
  eo,
});

const EXAM = (eo?: string[]): SourceReference => ({
  document: "Navigation Final Examination",
  chapter: "NETSAFA Navigation, Test Booklet No. 4",
  eo,
});

const C1 = "Introduction to Air Navigation";
const C2 = "Chart Projections, Plotting and Global Timekeeping";
const C3 = "CR-3 Air Navigation Computer";
const C4 = "Airspeeds";
const C5 = "Preflight Winds";
const C7 = "Flight Planning and Conduct";

export const DEPTH_QUESTIONS: Question[] = [
  {
    id: "nq-d-001",
    type: "spotTheTrap",
    unit: "n1",
    conceptIds: ["nav-definition", "nav-dead-reckoning"],
    prompt: '"Navigation is only about predicting where the aircraft will be."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The guide calls navigation both the history AND the prediction of the flight path. The record of where you have been is what makes the prediction possible.",
    difficulty: 2,
    source: TG(C1, ["2.330"]),
  },
  {
    id: "nq-d-002",
    type: "mcq",
    unit: "n1",
    conceptIds: ["nav-primary-instruments", "nav-secondary-instruments"],
    prompt: "Why are the altimeter and OAT gauge classed as secondary rather than primary?",
    options: [
      "They are less accurate",
      "They do not measure a DR component — they supply the density that corrects speed",
      "They are only fitted to some aircraft",
      "They are read less often",
    ],
    answer: 1,
    explanation:
      "Each primary instrument measures one of the four components directly. The secondary pair measure something else entirely, and feed it into the speed calculation.",
    difficulty: 3,
    source: TG(C1, ["2.333"]),
  },
  {
    id: "nq-d-003",
    type: "mcq",
    unit: "n1",
    conceptIds: ["nav-tacan-station"],
    prompt: "How many unique signals does a TACAN station emit, and what are they calibrated to?",
    options: [
      "126, calibrated to true north",
      "360, calibrated to magnetic north",
      "360, calibrated to true north",
      "126, calibrated to magnetic north",
    ],
    answer: 1,
    explanation:
      "360 radials, carefully calibrated to MAGNETIC north — which is exactly why plotting one on a true chart needs the variation applied. The 126 is the channel count.",
    difficulty: 2,
    source: TG(C1, ["2.331"]),
  },
  {
    id: "nq-d-004",
    type: "mcq",
    unit: "n1",
    conceptIds: ["nav-elapsed-time"],
    prompt: "Which of these is an elapsed time rather than a time of day?",
    options: ["1400", "0815", "2+30", "1652Z"],
    answer: 2,
    explanation:
      "The plus sign marks it. Elapsed times are written 2+30 or 09+15+20; times of day are four digits.",
    difficulty: 1,
    source: TG(C1, ["2.330"]),
  },
  {
    id: "nq-d-005",
    type: "mcq",
    unit: "n2",
    conceptIds: ["nav-undevelopable", "nav-small-circle"],
    prompt:
      "The intersection of a sphere and a plane is always a circle. What makes it a SMALL circle rather than a great one?",
    options: [
      "The plane does not pass through the centre of the sphere",
      "The circle is under a certain diameter",
      "The plane is horizontal",
      "The circle lies in the southern hemisphere",
    ],
    answer: 0,
    explanation:
      "Through the centre gives a great circle; anywhere else gives a small one. Every parallel except the equator is a small circle, which is why you never measure distance along one.",
    difficulty: 2,
    source: TG(C2, ["2.334"]),
  },
  {
    id: "nq-d-006",
    type: "mcq",
    unit: "n3",
    conceptIds: ["nav-direction"],
    prompt: "An aircraft is heading due north. How is that written?",
    options: ["000°", "360°", "0°", "Either 000 or 360"],
    answer: 1,
    explanation:
      "360. Direction is stated in whole numbers from 001° to a maximum of 360°, so there is no 000 in this system.",
    difficulty: 2,
    source: TG(C1, ["2.336"]),
  },
  {
    id: "nq-d-007",
    type: "mcq",
    unit: "n3",
    conceptIds: ["nav-isogonic"],
    prompt: "How do isogonic lines appear on a TPC?",
    options: [
      "Solid black lines with the value in minutes",
      "Dashed blue lines with the variation stated in degrees",
      "Red hatching around each navaid",
      "They do not appear; you look the variation up in the supplement",
    ],
    answer: 1,
    explanation:
      "Dashed blue, with the value in degrees. For a TACAN fix, use the line nearest the navaid — which is the guide's own instruction.",
    difficulty: 2,
    source: TG(C2, ["2.337"]),
  },
  {
    id: "nq-d-008",
    type: "mcq",
    unit: "n4",
    conceptIds: ["nav-time-zones"],
    prompt: "Each time zone is centred on a meridian that is",
    options: [
      "a multiple of 15°",
      "a multiple of 10°",
      "the nearest national boundary",
      "24° from its neighbours",
    ],
    answer: 0,
    explanation:
      "A multiple of 15°, because 15° of longitude is one hour of the earth's rotation. The BOUNDARIES then get moved for political convenience, but the centres are fixed.",
    difficulty: 2,
    source: TG(C2, ["4.1"]),
  },
  {
    id: "nq-d-009",
    type: "mcq",
    unit: "n5",
    conceptIds: ["nav-north-south-scale"],
    prompt: "The north/south scale on the plotter is",
    options: [
      "the outer scale, used with meridians",
      "the innermost scale, used when a parallel is under the grommet",
      "the distance scale on the straightedge",
      "a second protractor on the reverse",
    ],
    answer: 1,
    explanation:
      "Innermost, and it exists for course lines running so close to north–south that no meridian can be brought under the grommet. Put a parallel there instead and read the inner scale.",
    difficulty: 2,
    source: TG(C2, ["4.6"]),
  },
  {
    id: "nq-d-010",
    type: "mcq",
    unit: "n5",
    conceptIds: ["nav-walking-dividers"],
    prompt:
      "You have walked the dividers four times at 30 NM and the fifth step overshoots the destination. What do you do?",
    options: [
      "Call it 150 NM",
      "Close the dividers on the remaining distance and add it to 120",
      "Start again with a smaller span",
      "Measure the last bit on the plotter's straightedge",
    ],
    answer: 1,
    explanation:
      "Four full steps is 120 NM. Squeeze the dividers closed on what is left, carry that to a meridian, and add it.",
    difficulty: 2,
    source: TG(C2, ["4.5"]),
  },
  {
    id: "nq-d-011",
    type: "mcq",
    unit: "n6",
    conceptIds: ["nav-cr3-wheels"],
    prompt: "On the CR-3 calculation side, what does the OUTER wheel usually represent?",
    options: [
      "Time",
      "Distance and fuel",
      "Gallons only",
      "Whichever value is smaller",
    ],
    answer: 1,
    explanation:
      "The outer white scale on the base carries distance and fuel; the inner grey rotating scale carries time. On a conversion the inner one becomes gallons instead.",
    difficulty: 1,
    source: TG(C3, ["4.8"]),
  },
  {
    id: "nq-d-012",
    type: "mcq",
    unit: "n6",
    conceptIds: ["nav-floating-decimal", "nav-tick-values"],
    prompt:
      "You are reading between 15 and 16 on the scale and land on the first unmarked tick past 15. What could that value be?",
    options: ["15.1, 151 or 1510", "15.2, 152 or 1520", "15.5, 155 or 1550", "16, 160 or 1600"],
    answer: 1,
    explanation:
      "From 15 to 30 there are four ticks between whole numbers, so each is worth two — the first is 15.2. The floating decimal then makes it 152 or 1520 depending on your estimate.",
    difficulty: 3,
    source: TG(C3, ["4.8"]),
  },
  {
    id: "nq-d-013",
    type: "mcq",
    unit: "n6",
    conceptIds: ["nav-cursor"],
    prompt: "What is the cursor hairline's SECONDARY purpose?",
    options: [
      "Locking the wheel",
      "Interpolating values between the printed marks",
      "Marking the rate index",
      "Reading the hour circle",
    ],
    answer: 1,
    explanation:
      "Its primary job is inputting temperature for a true airspeed solution. Helping you interpolate between printed marks is the secondary one.",
    difficulty: 2,
    source: TG(C3, ["4.8"]),
  },
  {
    id: "nq-d-014",
    type: "mcq",
    unit: "n6",
    conceptIds: ["nav-hour-circle"],
    prompt: "You read 190 on the time scale. What does the hour circle show beneath it?",
    options: ["1:90", "3:10", "1:30", "19:00"],
    answer: 1,
    explanation:
      "190 minutes is three hours and ten. The hour circle does that conversion with no arithmetic — it is the guide's own worked example.",
    difficulty: 2,
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nq-d-015",
    type: "mcq",
    unit: "n7",
    conceptIds: ["nav-standard-day"],
    prompt: "On a standard day, which two altitudes are the same?",
    options: [
      "Indicated and absolute",
      "Calibrated and true",
      "Pressure and absolute",
      "Indicated and true",
    ],
    answer: 1,
    explanation:
      "Calibrated altitude and true altitude coincide on a standard day. The whole reason for correcting for density is that standard days rarely happen.",
    difficulty: 3,
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nq-d-016",
    type: "mcq",
    unit: "n7",
    conceptIds: ["nav-instrument-error"],
    prompt: "How is instrument error determined?",
    options: [
      "By comparing two altimeters in flight",
      "By noting the difference between known field elevation and indicated altitude with the current setting in",
      "By reading it off the airspeed calibration card",
      "It is published for each airframe",
    ],
    answer: 1,
    explanation:
      "On the ground, before departure, with the current setting dialled in. It cannot be corrected for — only noted — and above 75 feet total the aircraft is unsafe for IFR.",
    difficulty: 3,
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nq-d-017",
    type: "mcq",
    unit: "n7",
    conceptIds: ["nav-altimeter-errors"],
    prompt: "A change of 0.10 inHg in pressure changes the altimeter reading by",
    options: ["10 feet", "100 feet", "1,000 feet", "It depends on altitude"],
    answer: 1,
    explanation:
      "100 feet, which follows from the standard lapse rate of one inch per thousand feet. It is why you get a setting from the destination tower before landing.",
    difficulty: 2,
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nq-d-018",
    type: "mcq",
    unit: "n7",
    conceptIds: ["nav-temperature-error"],
    prompt: "The air is colder than the standard atmosphere. Where is the aircraft?",
    options: [
      "Higher than the altimeter indicates",
      "Lower than the altimeter indicates",
      "Exactly where it indicates",
      "It depends on the altimeter setting",
    ],
    answer: 1,
    explanation:
      "Colder than standard, the aircraft is LOWER than indicated. Warmer than standard and it is higher. Eleven degrees off standard is worth four percent.",
    difficulty: 3,
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nq-d-019",
    type: "mcq",
    unit: "n7",
    conceptIds: ["nav-ias", "nav-cas"],
    prompt: "Where does the correction from indicated to calibrated airspeed come from?",
    options: [
      "The CR-3's TAS window",
      "The airspeed calibration card in the cockpit",
      "The en route supplement",
      "It is calculated from pressure altitude",
    ],
    answer: 1,
    explanation:
      "A card in the cockpit, giving what the indicator reads against what it should read. Where the exact indicated value is not listed, use the nearest and apply the same correction.",
    difficulty: 2,
    source: TG(C4, ["2.42", "2.43"]),
  },
  {
    id: "nq-d-020",
    type: "mcq",
    unit: "n7",
    conceptIds: ["nav-groundspeed", "nav-tas"],
    prompt:
      "To maintain a constant ground speed as the headwind increases, what must happen to true airspeed?",
    options: [
      "It can decrease",
      "It remains constant, because wind is not a factor",
      "It must increase",
      "It increases because of the standard lapse rate",
    ],
    answer: 2,
    explanation:
      "Ground speed is TAS less the headwind. More headwind for the same ground speed means more TAS. Wind does not change TAS on its own — the pilot does.",
    difficulty: 2,
    officialStyle: true,
    source: EXAM(["2.46"]),
  },
  {
    id: "nq-d-021",
    type: "mcq",
    unit: "n7",
    conceptIds: ["nav-shock-wave", "nav-mach"],
    prompt: "Why does the aircraft's speed get compared with the speed of sound at all?",
    options: [
      "Because airspeed indicators are calibrated in Mach above 20,000 feet",
      "Because pressure waves travel at the speed of sound, and catching them piles them into a shock wave",
      "Because the local speed of sound sets the stall speed",
      "Because Mach is easier to read than knots",
    ],
    answer: 1,
    explanation:
      "As long as the airflow stays below the local speed of sound the aircraft does not suffer compressibility. Once it does not, the waves cannot get out of the way.",
    difficulty: 2,
    source: TG(C4, ["2.341"]),
  },
  {
    id: "nq-d-022",
    type: "mcq",
    unit: "n8",
    conceptIds: ["nav-balloon", "nav-wind-triangle"],
    prompt:
      "An aircraft flies east at 50 kt inside an air mass moving east at 50 kt. After an hour, how far has it gone over the ground?",
    options: ["Nowhere", "50 NM", "100 NM", "It cannot be determined"],
    answer: 2,
    explanation:
      "Fifty through the air plus fifty of air movement is a hundred over the ground. Reverse the balloon and the same aircraft goes nowhere — while still crossing the balloon.",
    difficulty: 2,
    source: TG(C5, ["4.14"]),
  },
  {
    id: "nq-d-023",
    type: "mcq",
    unit: "n8",
    conceptIds: ["nav-ten-percent"],
    prompt: "Why does the ten percent rule work at any airspeed?",
    options: [
      "It is an approximation that only holds near 150 kt",
      "Because crab angle depends on the RATIO of crosswind to TAS, not on either alone",
      "Because tactical aircraft all fly similar speeds",
      "It does not; it is a rough guide only",
    ],
    answer: 1,
    explanation:
      "Crab is set by the ratio, so a tenth of TAS gives the same angle whether TAS is 100 kt or 800. It is a reading of the CR-3's own geometry, not a coincidence.",
    difficulty: 3,
    source: TG(C5, ["4.15"]),
  },
  {
    id: "nq-d-024",
    type: "spotTheTrap",
    unit: "n8",
    conceptIds: ["nav-wind-scales"],
    prompt:
      '"You can plot the wind on the large scale and read the components on the small one, as long as you convert."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Once a scale is chosen it must be used throughout the problem. The guide warns about this specifically because the resulting answer is wrong by a factor of two and looks perfectly reasonable.",
    difficulty: 2,
    source: TG(C5, ["4.15"]),
  },
  {
    id: "nq-d-026",
    type: "numeric",
    unit: "n6",
    conceptIds: ["nav-ratio", "nav-cr3-wheels", "nav-floating-decimal"],
    skillIds: ["sk-ratio", "sk-estimate"],
    prompt:
      "The guide's own ratio example. Solve for X: one is to two as eight is to X.",
    given: [
      { label: "The ratio", value: "1 ÷ 2 = 8 ÷ X" },
    ],
    fields: [{ key: "x", label: "X", unit: "kt", answer: 16, tolerance: "logScale" }],
    estimate: {
      prompt: "Before the wheel: roughly how big is X?",
      options: ["About 4", "About 16", "About 40", "About 160"],
      answer: 1,
      why: "Eight is about eight times one, so X is about eight times two. That estimate is the only thing that tells you whether the 16 on the scale means 1.6, 16, 160 or 1600.",
    },
    allowedTools: ["cr3calc", "scratch"],
    worked: [
      {
        action: "Estimate first. Eight is eight times one, so X is eight times two.",
        result: "≈ 16",
      },
      {
        action: "Set 10 on the outer scale over 20 on the inner — the ratio as written.",
        detail: "Numerators outside, denominators inside.",
        tool: "cr3calc",
      },
      {
        action: "Find 80 on the outer scale and read the value directly below it.",
        tool: "cr3calc",
        result: "16",
      },
      {
        action: "Place the decimal from the estimate.",
        detail: "The scale offers 1.6, 16, 160 and 1600 with equal enthusiasm.",
      },
    ],
    explanation:
      "X is 16. Transferring the fraction straight onto the two scales sets every equal fraction at the same time, which is why one rotation answers the whole family.",
    knowCold: "Numerator outer, denominator inner. Then read anywhere.",
    difficulty: 1,
    officialStyle: true,
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nq-d-027",
    type: "mcq",
    unit: "n6",
    conceptIds: ["nav-ratio", "nav-cr3-wheels"],
    skillIds: ["sk-ratio"],
    prompt:
      "You set 30 NM on the outer scale over 11 minutes on the inner. Which of these pairs is NOT also aligned as a result?",
    options: [
      "60 NM over 22 minutes",
      "15 NM over 5.5 minutes",
      "164 NM over the rate index",
      "45 NM over 15 minutes",
    ],
    answer: 3,
    explanation:
      "One rotation fixes one ratio, and every equal fraction lines up with it. 30/11 also gives 60/22 and 15/5.5, and above the rate index it reads 164 kt. 45 over 15 is 3.0, not 2.73 — a different ratio entirely.",
    whyWrong:
      "This is the property that makes a slide rule worth carrying: you set the problem once and read whichever unknown you happen to need.",
    difficulty: 3,
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nq-d-025",
    type: "mcq",
    unit: "n10",
    conceptIds: ["nav-plan-is-an-estimate", "nav-flight-conduct"],
    prompt:
      "The guide says aircrew should strive to maintain their course as planned. What does it say to do if you find yourself off it?",
    options: [
      "Turn back onto the original course line",
      "Compute a new course and heading direct to the turn point, and update the ETA and EFR",
      "Continue on the planned heading and accept the error",
      "Declare a diversion",
    ],
    answer: 1,
    explanation:
      "Direct to the turn point, with updated winds, a new ETA and a new EFR. Recovering to the original line is not what this course teaches.",
    difficulty: 2,
    source: TG(C7, ["4.11"]),
  },
];
