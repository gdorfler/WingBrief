import type { Explainer, SourceReference } from "@/lib/types";

/**
 * Visual explainers.
 *
 * In the other courses these are conceptual: what the atmosphere is doing, why
 * a wing stalls. Navigation's are METHODS — a worked operation animated one
 * step at a time, so you watch the procedure happen rather than being told
 * about it. Ninety seconds each, and every one ends on the thing that goes
 * wrong if you skip a step.
 */

const TG = (chapter: string): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter,
});

export const EXPLAINERS: Explainer[] = [
  {
    id: "nx-what-dr-is",
    title: "Three Types, One Method",
    promise: "Why dead reckoning is the only one of the three that stands on its own.",
    unit: "n1",
    conceptIds: ["nav-dead-reckoning", "nav-types", "nav-dr-components"],
    lessonId: "nl01-what-navigation-is",
    diagram: { id: "nav-dr-components" },
    frames: [
      { caption: "Four components. Position, direction, time and speed.", hold: 3000, props: { highlight: "none" } },
      { caption: "Position: a set of coordinates above the earth's surface.", hold: 2800, props: { highlight: "position" } },
      { caption: "Direction: an angular measurement from a reference.", hold: 2800, props: { highlight: "direction" } },
      { caption: "Time and speed, which multiply to give distance.", hold: 3000, props: { highlight: "speed" } },
      { caption: "Know any three and the fourth follows. That is dead reckoning.", hold: 3400, props: { highlight: "none" } },
      { caption: "Visual and electronic help. Neither replaces the plot.", hold: 3400, props: { highlight: "time" } },
    ],
    predict: {
      at: 3,
      question:
        "You know your position, your direction and your speed — but not how long you have been flying. Can dead reckoning still solve it?",
      options: [
        "No — time is the one it cannot do without",
        "Yes — any three of the four give you the fourth",
        "Only if you also have a visual fix",
      ],
      answer: 1,
      because:
        "Position, direction, time and speed are one closed set. Any three determine the fourth, which is why dead reckoning stands on its own — visual and electronic navigation help you check it, but neither one replaces the plot.",
    },
    knowCold: "Position, direction, time, speed — three known gives the fourth.",
    source: TG("Introduction to Air Navigation"),
  },
  {
    id: "nx-great-circles",
    title: "Why a Straight Line Is a Great Circle",
    promise: "What a cone does to the earth, and why it makes measuring easy.",
    unit: "n2",
    conceptIds: ["nav-great-circle", "nav-lambert", "nav-undevelopable"],
    lessonId: "nl05-lambert",
    diagram: { id: "nav-conic-projection" },
    frames: [
      { caption: "A sphere cannot be flattened. Something always tears.", hold: 3000, props: { cone: false } },
      { caption: "So lay a cone over it, cutting at two standard parallels.", hold: 3200, props: { cone: true } },
      { caption: "Scale is exact along both, and near enough between them.", hold: 3200, props: { cone: true } },
      { caption: "Unroll the cone: parallels curve, meridians converge.", hold: 3200, props: { cone: false } },
      { caption: "And a great circle — the shortest route — plots straight.", hold: 3400, props: { cone: false } },
      { caption: "The meridians point at TRUE north, so your line is a true course.", hold: 3600, props: { cone: false } },
    ],
    predict: {
      at: 3,
      question:
        "On a Lambert conformal chart the parallels curve and the meridians converge. So what does the shortest route between two points look like?",
      options: [
        "A curve, matching the parallels",
        "A straight line",
        "A curve bending away from the pole",
      ],
      answer: 1,
      because:
        "That is the whole reason for the projection. The cone is cut so great circles — the genuinely shortest routes — come out straight, which means you can draw one with a ruler and measure it against a meridian for a true course.",
    },
    knowCold: "Parallels curve, meridians converge, great circles are straight — and it is all true.",
    source: TG("Chart Projections, Plotting and Global Timekeeping"),
  },
  {
    id: "nx-three-directions",
    title: "Course, Heading, Track",
    promise: "Three lines from one point, and why they are never all the same.",
    unit: "n3",
    conceptIds: ["nav-course", "nav-heading", "nav-track", "nav-crab-drift"],
    lessonId: "nl06-course-heading-track",
    diagram: { id: "nav-course-heading-track" },
    frames: [
      { caption: "The course: the line you drew, from departure to destination.", hold: 3000, props: { show: "course" } },
      { caption: "The heading: where the nose is pointed.", hold: 3000, props: { show: "heading" } },
      { caption: "They differ because the aircraft is crabbing into a crosswind.", hold: 3200, props: { show: "heading" } },
      { caption: "The track: where the aircraft actually went.", hold: 3000, props: { show: "track" } },
      { caption: "All three together. Intended, pointed, achieved.", hold: 3400, props: { show: "all" } },
      { caption: "Preflight compares course and heading. In flight, heading and track.", hold: 3600, props: { show: "all" } },
    ],
    predict: {
      at: 1,
      question:
        "You have drawn a course and pointed the nose down it. In a crosswind, will you fly that line?",
      options: [
        "Yes — heading and course are the same thing",
        "No — the track will drift off the course",
        "Only if the wind is behind you",
      ],
      answer: 1,
      because:
        "Course is what you intended, heading is where the nose points, and track is where you actually went. A crosswind separates them, which is why you crab: you point the nose off the course deliberately so the track lands on it.",
    },
    knowCold: "Course intended, heading pointed, track achieved.",
    source: TG("Chart Projections, Plotting and Global Timekeeping"),
  },
  {
    id: "nx-variation",
    title: "East Is Least — Both Ways",
    promise: "One rule, two directions, and the reversal that costs marks.",
    unit: "n3",
    conceptIds: ["nav-variation", "nav-variation-conversion", "nav-isogonic"],
    lessonId: "nl08-applying-variation",
    diagram: { id: "nav-variation" },
    frames: [
      { caption: "Two norths: the top of the earth, and northern Canada.", hold: 3000, props: { east: 8 } },
      { caption: "The angle between them, from where you are, is the variation.", hold: 3200, props: { east: 8 } },
      { caption: "Isogonic lines on the chart join points of equal variation.", hold: 3200, props: { east: 5 } },
      { caption: "Chart to cockpit: subtract east, add west. East is least.", hold: 3400, props: { east: 5 } },
      { caption: "Cockpit to chart, plotting a radial: the formula reverses.", hold: 3400, props: { east: 5 } },
      { caption: "Same variation. Opposite sign. This is where the marks go.", hold: 3600, props: { east: 5 } },
    ],
    predict: {
      at: 3,
      question:
        "Chart to cockpit, easterly variation is subtracted. Going the other way — plotting a magnetic radial on a true chart — what happens to it?",
      options: [
        "Subtracted again",
        "Added",
        "Ignored; radials are already true",
      ],
      answer: 1,
      because:
        "The conversion runs backwards, so the sign flips. East is least going true to magnetic, and east ADDS coming back the other way. Same variation, opposite sign — and getting it wrong puts you out by twice the variation, in the wrong direction.",
    },
    knowCold: "True → magnetic: east subtracts. Magnetic → true: east adds.",
    source: TG("Chart Projections, Plotting and Global Timekeeping"),
  },
  {
    id: "nx-zulu",
    title: "Fly in Zulu",
    promise: "Three steps that stop a time-zone crossing from going wrong.",
    unit: "n4",
    conceptIds: ["nav-time-zones", "nav-zulu-conversion", "nav-fly-in-zulu"],
    lessonId: "nl10-flying-in-zulu",
    diagram: { id: "nav-time-zones" },
    frames: [
      { caption: "The earth turns 360° in 24 hours: 15° an hour, 24 zones.", hold: 3200, props: { zd: 0 } },
      { caption: "Each zone's description is its offset from Greenwich in hours.", hold: 3000, props: { zd: -8 } },
      { caption: "Step one: convert the departure time to Zulu.", hold: 3200, props: { zd: -8 } },
      { caption: "Step two: add the time en route — in Zulu, where no boundary is crossed.", hold: 3400, props: { zd: 0 } },
      { caption: "Step three: convert the arrival to the destination's local time.", hold: 3200, props: { zd: -6 } },
      { caption: "Subtracting a negative adds. That is where the sign errors live.", hold: 3400, props: { zd: -6 } },
    ],
    predict: {
      at: 3,
      question:
        "Why is the time en route added in Zulu rather than in local time?",
      options: [
        "Zulu arithmetic is simpler",
        "Because no time-zone boundary is crossed in Zulu",
        "Because Zulu ignores daylight saving",
      ],
      answer: 1,
      because:
        "Local time steps by an hour whenever you cross a boundary, so adding en-route time to it can jump or double-count. Zulu has no boundaries at all: convert out, do the whole flight in Zulu, and convert back once at the end.",
    },
    knowCold: "Convert out, fly in Zulu, convert back.",
    source: TG("Chart Projections, Plotting and Global Timekeeping"),
  },
  {
    id: "nx-measuring-direction",
    title: "How to Read the Plotter",
    promise: "Four moves, and the estimate that keeps you off the reciprocal.",
    unit: "n5",
    conceptIds: ["nav-plotter", "nav-measuring-direction", "nav-north-south-scale"],
    lessonId: "nl13-measuring-direction",
    diagram: { id: "nav-plotter" },
    frames: [
      { caption: "The plotter: a straightedge, a protractor and a grommet.", hold: 3000, props: { highlight: "none" } },
      { caption: "The grommet is the reference. It goes on a meridian.", hold: 3000, props: { highlight: "grommet" } },
      { caption: "The outer scale counts up to the LEFT. It offers two answers.", hold: 3400, props: { highlight: "outer" } },
      { caption: "Estimate the direction first. That is what chooses between them.", hold: 3400, props: { highlight: "outer" } },
      { caption: "For a north–south course, use a parallel and the inner scale.", hold: 3200, props: { highlight: "inner" } },
      { caption: "Bracket the meridian before committing, or be ten degrees out.", hold: 3400, props: { highlight: "outer" } },
    ],
    predict: {
      at: 2,
      question:
        "The outer scale of the plotter offers you two numbers at once. What decides which one is right?",
      options: [
        "Always take the smaller",
        "The estimate you made before you measured",
        "The scale on the opposite edge",
      ],
      answer: 1,
      because:
        "The two readings are reciprocals — 060 and 240 sit on the same mark. Nothing on the plotter separates them, so the rough estimate you make first is what does. Skip it and you will eventually plot a course exactly backwards.",
    },
    knowCold: "Meridian → outer scale. Parallel → inner. Estimate first, always.",
    source: TG("Chart Projections, Plotting and Global Timekeeping"),
  },
  {
    id: "nx-tacan-fix",
    title: "The Conversion That Runs Backwards",
    promise: "Why plotting a radial adds the variation instead of subtracting it.",
    unit: "n5",
    conceptIds: ["nav-tacan-fix", "nav-needle-head-tail", "nav-variation-conversion"],
    lessonId: "nl16-tacan-fixes",
    diagram: { id: "nav-tacan-fix" },
    frames: [
      { caption: "The BDHI gives a radial and a distance. Both are magnetic.", hold: 3200, props: { stage: "magnetic", radial: 135, variation: 7 } },
      { caption: "The head of the needle is the bearing TO. The tail is your radial.", hold: 3400, props: { stage: "magnetic", radial: 135, variation: 7 } },
      { caption: "But the chart is TRUE, so the radial cannot be plotted as it stands.", hold: 3400, props: { stage: "magnetic", radial: 135, variation: 7 } },
      { caption: "Magnetic to true, so the easterly variation is ADDED: 135 + 7.", hold: 3600, props: { stage: "true", radial: 135, variation: 7 } },
      { caption: "Plot 142 true from the station, measure the DME, circle it.", hold: 3400, props: { stage: "true", radial: 135, variation: 7 } },
      { caption: "Get the sign wrong and you are twice the variation off, the wrong way.", hold: 3600, props: { stage: "true", radial: 135, variation: 7 } },
    ],
    predict: {
      at: 2,
      question:
        "The BDHI shows you on the 135 radial and the variation is 7° east. What do you plot on the chart?",
      options: [
        "135 — a radial is a radial",
        "142 true",
        "128 true",
      ],
      answer: 1,
      because:
        "The radial is magnetic and the chart is true, so this conversion runs the opposite way to the familiar one: east ADDS. 135 plus 7 gives 142 true from the station. Subtract instead and you are 14° off — twice the variation, the wrong way.",
    },
    knowCold: "Radial magnetic, chart true. East ADDS.",
    source: TG("Chart Projections, Plotting and Global Timekeeping"),
  },
  {
    id: "nx-cr3-in-two-minutes",
    title: "The CR-3 in Two Minutes",
    promise: "One rotation, one ratio, and every equivalent pair at once.",
    unit: "n6",
    conceptIds: ["nav-cr3-wheels", "nav-ratio", "nav-rate-index", "nav-high-speed-index", "nav-unit-index"],
    lessonId: "nl17-the-cr3",
    diagram: { id: "nav-cr3-indexes" },
    frames: [
      { caption: "Two logarithmic scales. Outer: distance and fuel. Inner: time.", hold: 3200, props: { highlight: "none" } },
      { caption: "Rotate the inner wheel and you fix a ratio between them.", hold: 3200, props: { highlight: "none" } },
      { caption: "The rate index at 60 means one hour — most rates are per hour.", hold: 3400, props: { highlight: "rate" } },
      { caption: "The SEC bug at 36 means the same hour, counted in seconds.", hold: 3400, props: { highlight: "sec" } },
      { caption: "The unit index at 10, for anything with no time in it.", hold: 3200, props: { highlight: "unit" } },
      { caption: "The wheel gives you digits. Your estimate gives the decimal point.", hold: 3600, props: { highlight: "none" } },
    ],
    predict: {
      at: 4,
      question:
        "The wheel has given you the digits 235. Is the answer 23.5, 235 or 2,350?",
      options: [
        "The wheel tells you — read the scale",
        "Your own rough estimate decides",
        "It is always the middle one",
      ],
      answer: 1,
      because:
        "A logarithmic scale only knows digits; it has no idea of magnitude. The wheel gives you 2-3-5 and your estimate places the decimal point. That is why estimating first is part of the method rather than a nicety.",
    },
    knowCold: "Rate 60, seconds 36, unit 10.",
    source: TG("CR-3 Air Navigation Computer"),
  },
  {
    id: "nx-log-scale",
    title: "Why a Tick Is Not Always Worth the Same",
    promise: "The graduation changes as you go round, and so does your error.",
    unit: "n6",
    conceptIds: ["nav-tick-values", "nav-floating-decimal"],
    lessonId: "nl17-the-cr3",
    diagram: { id: "nav-log-scale" },
    frames: [
      { caption: "The scale is logarithmic, so it is not evenly spaced.", hold: 3000 },
      { caption: "From 10 to 15 there are nine ticks: each one is worth one.", hold: 3200 },
      { caption: "From 15 to 30 there are four: each is worth two.", hold: 3200 },
      { caption: "From 30 to 60, a single tick worth five.", hold: 3200 },
      { caption: "So knowing where you are on the scale comes before reading it.", hold: 3400 },
      { caption: "±1 unit is defined on the 10-to-15 stretch — about ±1%.", hold: 3400 },
    ],
    predict: {
      at: 2,
      question:
        "One tick between 10 and 15 is worth one unit. What is a single tick worth between 30 and 60?",
      options: [
        "One — ticks are ticks",
        "Two",
        "Five",
      ],
      answer: 2,
      because:
        "The scale is logarithmic, so the graduations coarsen as you go round: one from 10 to 15, two from 15 to 30, five from 30 to 60. Read a tick at the wrong end of the scale and the error is five times what you thought.",
    },
    knowCold: "10–15 → 1. 15–30 → 2. 30–60 → 5.",
    source: TG("CR-3 Air Navigation Computer"),
  },
  {
    id: "nx-airspeed-chain",
    title: "From the Dial to the Ground",
    promise: "Four airspeeds, three corrections, and which one the wind touches.",
    unit: "n7",
    conceptIds: ["nav-ias", "nav-cas", "nav-tas", "nav-groundspeed", "nav-density-effect"],
    lessonId: "nl23-airspeeds",
    diagram: { id: "nav-airspeed-chain" },
    frames: [
      { caption: "Indicated airspeed: what the needle says.", hold: 2800, props: { stage: 1 } },
      { caption: "Correct it for instrument error and you have calibrated.", hold: 3000, props: { stage: 2 } },
      { caption: "Correct that for air density and you have true airspeed.", hold: 3200, props: { stage: 3 } },
      { caption: "That is the speed through the air mass. Wind does not touch it.", hold: 3400, props: { stage: 3 } },
      { caption: "Correct for the head or tail component and you have ground speed.", hold: 3200, props: { stage: 4 } },
      { caption: "Climb at a fixed indicated and TAS rises. The air thins out.", hold: 3400, props: { stage: 4 } },
    ],
    predict: {
      at: 2,
      question:
        "You have corrected indicated airspeed for instrument error and for density. Which of the three corrections is left, and what does it give you?",
      options: [
        "None — that is ground speed already",
        "Wind, which turns true airspeed into ground speed",
        "Temperature, which turns it into calibrated",
      ],
      answer: 1,
      because:
        "Instrument error gives calibrated, density gives true. True airspeed is your speed through the air mass, and wind never touches it. Only the head or tail component converts that into speed over the ground.",
    },
    knowCold: "Instrument error, density, wind — in that order.",
    source: TG("Airspeeds"),
  },
  {
    id: "nx-altitudes",
    title: "Five Altitudes, One Question",
    promise: "Which one the airspeed problem is actually asking for.",
    unit: "n7",
    conceptIds: ["nav-altitude-types", "nav-pressure-altitude", "nav-standard-day"],
    lessonId: "nl22-altitude",
    diagram: { id: "nav-altitude-ladder" },
    frames: [
      { caption: "Indicated: what the altimeter reads on the local setting.", hold: 3000, props: { highlight: "indicated" } },
      { caption: "Calibrated: indicated, corrected for instrument error.", hold: 3000, props: { highlight: "calibrated" } },
      { caption: "Pressure: calibrated, corrected to 29.92 — the standard datum plane.", hold: 3400, props: { highlight: "pressure" } },
      { caption: "This is the one a true airspeed solution wants.", hold: 3200, props: { highlight: "pressure" } },
      { caption: "True: actual height above sea level, which is what terrain uses.", hold: 3200, props: { highlight: "true" } },
      { caption: "Absolute: height above the ground beneath you.", hold: 3000, props: { highlight: "absolute" } },
    ],
    predict: {
      at: 2,
      question:
        "You are solving for true airspeed. Which altitude does the solution actually want?",
      options: [
        "Indicated",
        "Pressure",
        "True",
      ],
      answer: 1,
      because:
        "True airspeed depends on air density, and density comes from pressure altitude with temperature. Pressure altitude is calibrated corrected to 29.92. True altitude is a different question entirely — that is the one terrain is measured against.",
    },
    knowCold: "TAS wants PRESSURE altitude. Terrain is measured against TRUE.",
    source: TG("Airspeeds"),
  },
  {
    id: "nx-wind-triangle",
    title: "How the Wind Triangle Works",
    promise: "Three vectors, and why two of them always give you the third.",
    unit: "n8",
    conceptIds: ["nav-wind-triangle", "nav-crab-drift", "nav-balloon"],
    lessonId: "nl25-the-wind-triangle",
    diagram: { id: "nav-wind-triangle" },
    frames: [
      { caption: "The air vector: where the nose points, at true airspeed.", hold: 3000, props: { show: "air" } },
      { caption: "The wind vector: the air mass itself, moving over the ground.", hold: 3200, props: { show: "wind" } },
      { caption: "Add them and you get the ground vector — where you actually go.", hold: 3400, props: { show: "all" } },
      { caption: "The angle between air and ground is the crab you turned in.", hold: 3200, props: { show: "all", crab: 14 } },
      { caption: "Preflight you know the ground direction and the wind: solve for air.", hold: 3400, props: { show: "all" } },
      { caption: "In flight you know air and ground: solve for wind. Same triangle.", hold: 3600, props: { show: "all" } },
    ],
    knowCold: "Air + wind = ground. Any two sides give the third.",
    source: TG("Preflight Winds"),
  },
  {
    id: "nx-quartering",
    title: "Name the Quarter First",
    promise: "The thirty-second estimate that catches a wrong answer.",
    unit: "n8",
    conceptIds: ["nav-quartering", "nav-ten-percent"],
    lessonId: "nl26-estimating-the-wind",
    diagram: { id: "nav-quartering" },
    frames: [
      { caption: "Draw the course, then the wind against it.", hold: 3000, props: { highlight: "none" } },
      { caption: "Left head: heading below course, ground speed below TAS.", hold: 3000, props: { highlight: "leftHead" } },
      { caption: "Right head: heading above course, ground speed still below.", hold: 3000, props: { highlight: "rightHead" } },
      { caption: "Left tail: heading below course, ground speed above TAS.", hold: 3000, props: { highlight: "leftTail" } },
      { caption: "Right tail: heading above, ground speed above.", hold: 3000, props: { highlight: "rightTail" } },
      { caption: "Then use the ten percent rule for the size, and check the wheel against it.", hold: 3600, props: { highlight: "none" } },
    ],
    predict: {
      at: 2,
      question:
        "The wind is off your right, from ahead. Where will the heading and the ground speed sit relative to course and TAS?",
      options: [
        "Heading above course, ground speed below TAS",
        "Heading below course, ground speed below TAS",
        "Heading above course, ground speed above TAS",
      ],
      answer: 0,
      because:
        "Name the quarter first and both answers fall out. A wind from the right means crabbing right, so heading is above course; a wind with any headwind component means ground speed is below TAS. That takes thirty seconds and catches a wrong wheel answer.",
    },
    knowCold: "Crosswind = 10% of TAS → 6° of crab.",
    source: TG("Preflight Winds"),
  },
  {
    id: "nx-inflight-winds",
    title: "The Wind You Actually Have",
    promise: "Entering the same triangle from the other corner.",
    unit: "n9",
    conceptIds: ["nav-inflight-theory", "nav-inflight-procedure", "nav-inflight-estimate"],
    lessonId: "nl29-solving-in-flight-winds",
    diagram: { id: "nav-wind-triangle" },
    frames: [
      { caption: "You flew a heading at a true airspeed. That is the air vector.", hold: 3200, props: { show: "air" } },
      { caption: "The fix gives a track, and the clock gives a ground speed.", hold: 3200, props: { show: "ground" } },
      { caption: "Two sides known, so the wind vector is determined.", hold: 3200, props: { show: "all" } },
      { caption: "Ground speed above TAS is a tailwind. Below, a headwind.", hold: 3200, props: { show: "all", crab: 8 } },
      { caption: "Drifting right means the wind pushed from the left.", hold: 3200, props: { show: "all", crab: 8 } },
      { caption: "And on the wheel, TRACK goes at the index — not course.", hold: 3600, props: { show: "all" } },
    ],
    predict: {
      at: 4,
      question:
        "Solving for winds in flight, what goes at the index on the wheel?",
      options: [
        "The course you planned",
        "The track you actually made good",
        "The heading you flew",
      ],
      answer: 1,
      because:
        "In flight you are entering the triangle from the other corner: you know the air vector you flew and the ground vector you achieved. The ground vector's direction is TRACK, not the course you intended — and it is track that goes at the index.",
    },
    knowCold: "In flight, TRACK at the index.",
    source: TG("In Flight Winds"),
  },
  {
    id: "nx-jet-log",
    title: "How a Jet Log Comes Together",
    promise: "Four computations per leg, each feeding the next.",
    unit: "n10",
    conceptIds: ["nav-jet-log-enroute", "nav-planning-steps", "nav-efr-update"],
    lessonId: "nl32-planning-a-route",
    diagram: { id: "nav-jet-log" },
    frames: [
      { caption: "Measure the course and distance. They go in CUS and DIST.", hold: 3200, props: { highlight: "cus" } },
      { caption: "The distance is the dividers' answer, carried to a meridian.", hold: 3000, props: { highlight: "dist" } },
      { caption: "Spin the preflight winds for a heading and a ground speed.", hold: 3200, props: { highlight: "none" } },
      { caption: "Ground speed and distance give the ETE.", hold: 3000, props: { highlight: "ete" } },
      { caption: "ETE and fuel flow give the leg fuel.", hold: 3000, props: { highlight: "fuel" } },
      { caption: "Then it accumulates: each EFR starts from the one above it.", hold: 3600, props: { highlight: "efr" } },
    ],
    predict: {
      at: 3,
      question:
        "You have a ground speed and a distance for the leg. Which log entry comes out next?",
      options: [
        "The leg fuel",
        "The ETE",
        "The estimated fuel remaining",
      ],
      answer: 1,
      because:
        "Each computation feeds the next in a fixed order. Distance over ground speed gives ETE; ETE times fuel flow gives the leg fuel; and only then does the fuel remaining accumulate down the log from the line above.",
    },
    knowCold: "Measure, wind, time, fuel — then carry it down the log.",
    source: TG("Flight Planning and Conduct"),
  },
  {
    id: "nx-plan-conduct",
    title: "When the Forecast Is Wrong",
    promise: "The same four operations, restarted from where you actually are.",
    unit: "n10",
    conceptIds: ["nav-flight-conduct", "nav-eta-update", "nav-plan-is-an-estimate"],
    lessonId: "nl33-flight-conduct",
    diagram: { id: "nav-plan-conduct" },
    frames: [
      { caption: "Planning: measure, wind, time, fuel. Four steps, in order.", hold: 3200, props: { side: "plan" } },
      { caption: "Strapped in, all of it is the crew's best estimate.", hold: 3000, props: { side: "plan" } },
      { caption: "A fix says otherwise. Plot it, and measure what you actually flew.", hold: 3200, props: { side: "conduct" } },
      { caption: "Measure a NEW course direct to the turn point. Do not fly back.", hold: 3400, props: { side: "conduct" } },
      { caption: "Compute the actual winds from track and ground speed.", hold: 3200, props: { side: "conduct" } },
      { caption: "Apply them, and update from the clock and fuel you have now.", hold: 3600, props: { side: "both" } },
    ],
    predict: {
      at: 2,
      question:
        "A fix shows you well off the planned course. Do you turn back to rejoin the line you drew?",
      options: [
        "Yes — the plan is the plan",
        "No — measure a new course direct to the turn point",
        "Yes, but only if the fix is early in the leg",
      ],
      answer: 1,
      because:
        "The plan was the crew's best estimate before takeoff; the fix is fact. Flying back to the old line spends time and fuel to reach a place you no longer need to be. Measure a new course from where you actually are, and update time and fuel from now forward.",
    },
    knowCold: "Update from the fix forward, not from the plan.",
    source: TG("Flight Planning and Conduct"),
  },
];
