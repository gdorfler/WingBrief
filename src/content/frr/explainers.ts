import type { Explainer, SourceReference } from "@/lib/types";

const ORG: SourceReference = {
  document: "Flight Rules and Regulations Trainee Guide",
  chapter: "Federal Aviation Organization",
};
const VIFR: SourceReference = {
  document: "Flight Rules and Regulations Trainee Guide",
  chapter: "Visual / Instrument Flight Rules",
};
const AIR: SourceReference = {
  document: "Flight Rules and Regulations Trainee Guide",
  chapter: "Airspace and General Flight Rules",
};

/**
 * Flight Rules visual explainers.
 *
 * A regulation read aloud is forgettable; a regulation watched resolving a
 * situation is not. Each explainer drives one diagram through a short sequence
 * so the student sees the rule select an answer rather than merely state one.
 */
export const EXPLAINERS: Explainer[] = [
  {
    id: "fx-priority",
    title: "Which Publication Wins",
    promise: "Watch four publications sort themselves from broadest to most specific.",
    unit: "f1",
    conceptIds: ["fr-priority", "fr-natops", "fr-cnaf", "fr-flip", "fr-far"],
    lessonId: "fl02-priority-of-regulations",
    diagram: { id: "frr-priority" },
    frames: [
      { caption: "FAR Part 91 sits at the bottom — it governs everyone who flies.", hold: 2800, props: { highlight: "far" } },
      { caption: "FLIP narrows it to the Department of Defense.", hold: 2600, props: { highlight: "flip" } },
      { caption: "CNAF M-3710.7 narrows it again to naval aircraft.", hold: 2800, props: { highlight: "cnaf" } },
      { caption: "NATOPS narrows it to YOUR aircraft — and outranks them all.", hold: 3200, props: { highlight: "natops" } },
      { caption: "The narrower the document, the higher the authority.", hold: 2800, props: { highlight: "none" } },
    ],
    predict: {
      at: 2,
      question:
        "NATOPS covers one aircraft type; FAR Part 91 covers everyone who flies. Which one outranks the other?",
      options: [
        "Part 91 — it is federal law",
        "NATOPS — the narrower document wins",
        "Whichever was published later",
      ],
      answer: 1,
      because:
        "Authority runs the opposite way to breadth. Part 91 is the floor for everybody, FLIP narrows it to the DoD, CNAF M-3710.7 to naval aircraft, and NATOPS to yours specifically — so NATOPS sits on top.",
    },
    knowCold: "NATOPS → CNAF M-3710.7 → FLIP → FAR Part 91.",
    source: ORG,
  },
  {
    id: "fx-atc",
    title: "Handing You Off",
    promise: "Follow one flight from the briefing room to cruise and back, agency by agency.",
    unit: "f1",
    conceptIds: ["fr-fss", "fr-tower", "fr-approach", "fr-artcc"],
    lessonId: "fl04-air-traffic-control",
    diagram: { id: "frr-atc-org" },
    frames: [
      { caption: "It starts at the FSS: brief, file, check the NOTAMs.", hold: 2800, props: { highlight: "fss" } },
      { caption: "The tower moves you around the field and launches you.", hold: 2800, props: { highlight: "tower" } },
      { caption: "Approach owns the instrument traffic in the terminal area.", hold: 3000, props: { highlight: "approach" } },
      { caption: "Center takes you en route, with positive control under IFR.", hold: 3000, props: { highlight: "artcc" } },
      { caption: "Coming home the chain runs in reverse: Center, Approach, Tower.", hold: 3000, props: { highlight: "none" } },
    ],
    predict: {
      at: 2,
      question:
        "You have just left the terminal area on an IFR flight plan. Who are you talking to next?",
      options: [
        "Approach — it owns you until landing",
        "Center — it takes you en route",
        "The FSS, which filed the plan",
      ],
      answer: 1,
      because:
        "Approach is the terminal-area agency and Center is the en-route one. The chain runs FSS, Tower, Approach, Center on the way out, and exactly the same list backwards on the way home.",
    },
    knowCold: "Approach = terminal. Center = en route.",
    source: ORG,
  },
  {
    id: "fx-brief-void",
    title: "Two Clocks",
    promise: "See exactly when a weather brief dies, and which clock killed it.",
    unit: "f2",
    conceptIds: ["fr-weather-brief"],
    lessonId: "fl08-weather-brief",
    diagram: { id: "frr-brief-void" },
    frames: [
      { caption: "You are briefed. Both clocks start now.", hold: 2600, props: { etd: 60 } },
      { caption: "Depart an hour later and the brief dies at +90 minutes.", hold: 2800, props: { etd: 60 } },
      { caption: "Push the departure back — the void time moves with it.", hold: 2800, props: { etd: 120 } },
      { caption: "At an ETD of +150 the two clocks tie at three hours.", hold: 3000, props: { etd: 150 } },
      { caption: "Later than that and the three-hour clock takes over.", hold: 3200, props: { etd: 230 } },
    ],
    knowCold: "Brief + 3 hours, or ETD + 30 minutes — whichever is EARLIER.",
    source: ORG,
  },
  {
    id: "fx-oxygen",
    title: "Climbing Past 10,000",
    promise: "Watch the oxygen rules change as the cabin altitude rises.",
    unit: "f3",
    conceptIds: ["fr-oxygen", "fr-oxygen-unpressurized"],
    lessonId: "fl11-oxygen",
    diagram: { id: "frr-oxygen" },
    frames: [
      { caption: "Below 10,000 ft cabin altitude, nothing is required.", hold: 2600, props: { altitude: 8000, equipped: true } },
      { caption: "Past 10,000 all occupants use supplemental oxygen.", hold: 3000, props: { altitude: 11000, equipped: true } },
      { caption: "Where others have none, that band is limited to 3 hours.", hold: 3200, props: { altitude: 12500, equipped: true } },
      { caption: "Above 13,000 with a system fitted, flight is prohibited.", hold: 3200, props: { altitude: 14500, equipped: true } },
      { caption: "With no system at all, the ceiling drops to 12,000 and one hour.", hold: 3400, props: { altitude: 12500, equipped: false } },
    ],
    predict: {
      at: 2,
      question:
        "Cabin altitude is climbing past 13,000 ft and the aircraft HAS an oxygen system. What does the rule say?",
      options: [
        "Carry on — the system covers it",
        "Flight is prohibited above 13,000",
        "Three hours maximum, then descend",
      ],
      answer: 1,
      because:
        "10,000 is what triggers supplemental oxygen for all occupants. 13,000 is the hard ceiling with a system fitted; with no system at all the ceiling drops to 12,000 and one hour. Having the system raises the limit — it does not remove it.",
    },
    knowCold: "10,000 triggers it. 13,000 with a system, 12,000 without.",
    source: ORG,
  },
  {
    id: "fx-light-gun",
    title: "No Radio",
    promise: "Three light signals, and what each one is actually telling you to do.",
    unit: "f4",
    conceptIds: ["fr-aldis"],
    lessonId: "fl14-signals-and-signs",
    diagram: { id: "frr-light-gun" },
    frames: [
      { caption: "Your radio is out. The tower can still talk to you.", hold: 2600, props: { highlight: "none" } },
      { caption: "Steady green: cleared to land. This is the clearance.", hold: 3000, props: { highlight: "green" } },
      { caption: "Steady red: give way and continue circling.", hold: 2800, props: { highlight: "red" } },
      { caption: "Flashing white: return for landing — not yet a clearance.", hold: 3200, props: { highlight: "white" } },
    ],
    predict: {
      at: 2,
      question:
        "Radio out, and the tower gives you a FLASHING WHITE light. Are you cleared to land?",
      options: [
        "Yes — white means cleared",
        "No — it only tells you to return for landing",
        "No — it means give way and circle",
      ],
      answer: 1,
      because:
        "Only STEADY GREEN is a landing clearance. Flashing white sends you back to the field to await one, and steady red tells you to give way and keep circling. Treating flashing white as a clearance is landing without one.",
    },
    knowCold: "Steady green clears you. Flashing white only sends you back.",
    source: VIFR,
  },
  {
    id: "fx-glideslope",
    title: "Red Over White",
    promise: "Fly a VASI from low to high and watch the bars flip.",
    unit: "f4",
    conceptIds: ["fr-vasi"],
    lessonId: "fl16-glideslope-indicators",
    diagram: { id: "frr-vasi" },
    frames: [
      { caption: "Too low: both bars red. Red over red, you're dead.", hold: 3000, props: { state: "low" } },
      { caption: "On slope: the far bar turns white. Red over white.", hold: 3200, props: { state: "on" } },
      { caption: "Too high: both bars white. Time to come down.", hold: 3000, props: { state: "high" } },
      { caption: "Back to red over white — the only one you want.", hold: 2800, props: { state: "on" } },
    ],
    predict: {
      at: 1,
      question:
        "You are on a VASI and both bars show WHITE. Where are you?",
      options: [
        "On slope",
        "Too high",
        "Too low",
      ],
      answer: 1,
      because:
        "Red over red, you're dead — too low. Red over white, you're alright — on slope. White over white and you are high, with too much runway disappearing behind you. Only one combination is the one you want.",
    },
    knowCold: "Red over white, you're alright.",
    source: VIFR,
  },
  {
    id: "fx-approach",
    title: "Down to Minimums",
    promise: "The one test that decides whether you may leave the MDA.",
    unit: "f5",
    conceptIds: ["fr-landing-minimums", "fr-missed-approach"],
    lessonId: "fl20-approaches-and-minimums",
    diagram: { id: "frr-decision" },
    frames: [
      {
        caption: "You reach the MDA. Now the regulation asks two things.",
        hold: 2800,
        props: { question: "Runway environment in sight?", yes: "Second test", no: "Go missed", chosen: "none" },
      },
      {
        caption: "No runway environment — execute the missed approach.",
        hold: 3000,
        props: { question: "Runway environment in sight?", yes: "Second test", no: "Go missed", chosen: "no" },
      },
      {
        caption: "In sight. Now: can a safe landing be made?",
        hold: 3000,
        props: { question: "Can a safe landing be made?", yes: "Descend and land", no: "Go missed", chosen: "none" },
      },
      {
        caption: "Both yes — and only then may you descend below.",
        hold: 3200,
        props: { question: "Can a safe landing be made?", yes: "Descend and land", no: "Go missed", chosen: "yes" },
      },
    ],
    predict: {
      at: 1,
      question:
        "At the MDA you have the runway environment clearly in sight. May you descend below?",
      options: [
        "Yes — having it in sight is the test",
        "Not yet — a safe landing must also be judged possible",
        "Only with a clearance from the tower",
      ],
      answer: 1,
      because:
        "The regulation asks two questions, not one. Runway environment in sight AND a normal descent to a safe landing judged possible. Either answer being no sends you missed — seeing the runway is necessary but not sufficient.",
    },
    knowCold: "Runway environment in sight AND a safe landing judged. Both, or go missed.",
    source: VIFR,
  },
  {
    id: "fx-semicircular",
    title: "East Odd, West Even",
    promise: "Rotate the course and watch the legal altitude change with it.",
    unit: "f6",
    conceptIds: ["fr-semicircular", "fr-vfr-altitudes", "fr-ifr-altitudes"],
    lessonId: "fl22-semicircular-rule",
    diagram: { id: "frr-semicircular" },
    frames: [
      { caption: "Course 090 — the east semicircle. Odd thousands.", hold: 2800, props: { course: 90, rules: "vfr" } },
      { caption: "Flying VFR adds 500 feet: 5,500, 7,500, 9,500.", hold: 3000, props: { course: 90, rules: "vfr" } },
      { caption: "Turn to 270 and you are west. Even thousands.", hold: 3000, props: { course: 270, rules: "vfr" } },
      { caption: "Switch to IFR and the 500 disappears.", hold: 3000, props: { course: 270, rules: "ifr" } },
      { caption: "179 is still east. 180 is west. It is the COURSE that decides.", hold: 3200, props: { course: 179, rules: "ifr" } },
    ],
    predict: {
      at: 1,
      question:
        "You are flying VFR on a course of 090. Which of these is a legal cruising altitude?",
      options: [
        "6,500",
        "7,500",
        "7,000",
      ],
      answer: 1,
      because:
        "A course of 0 to 179 is the east semicircle, which takes odd thousands, and VFR adds 500 on top — so 5,500, 7,500, 9,500. Note it is the COURSE that decides, not the heading you are holding to make it good.",
    },
    knowCold: "0–179 east, odd. 180–359 west, even. VFR adds 500.",
    source: VIFR,
  },
  {
    id: "fx-airspace",
    title: "Building the Airspace",
    promise: "Stack the classes one at a time and see what each one asks of you.",
    unit: "f7",
    conceptIds: ["fr-class-a", "fr-class-b", "fr-class-c", "fr-class-d", "fr-class-e", "fr-class-g"],
    lessonId: "fl25-airspace-classes",
    diagram: { id: "frr-airspace-profile" },
    frames: [
      { caption: "Class G at the bottom — uncontrolled, nothing required.", hold: 2800, props: { highlight: "g" } },
      { caption: "Class E fills the controlled airspace above and around it.", hold: 2800, props: { highlight: "e" } },
      { caption: "Class D wraps a towered field. Establish two-way comms.", hold: 3000, props: { highlight: "d" } },
      { caption: "Class C: busier field, same two-way requirement.", hold: 3000, props: { highlight: "c" } },
      { caption: "Class B: the busiest. This one needs a CLEARANCE.", hold: 3200, props: { highlight: "b" } },
      { caption: "Class A caps it at 18,000 MSL. IFR only, to FL600.", hold: 3000, props: { highlight: "a" } },
    ],
    predict: {
      at: 3,
      question:
        "You have established two-way radio communication with a Class B approach controller. Is that enough to enter?",
      options: [
        "Yes — same as Class C and D",
        "No — Class B needs an explicit clearance",
        "Only below 10,000 ft",
      ],
      answer: 1,
      because:
        "C and D need a conversation: two-way comms with your callsign is the requirement. B is the only one that needs an actual clearance. Hearing your callsign back is not the same thing as being cleared in.",
    },
    knowCold: "B needs a clearance. C and D need a conversation.",
    source: AIR,
  },
  {
    id: "fx-sua",
    title: "Prohibited, Restricted, Warning",
    promise: "Why the same hazard gets three different names depending on where it is.",
    unit: "f7",
    conceptIds: ["fr-prohibited-area", "fr-restricted-area", "fr-warning-area"],
    lessonId: "fl28-special-use-airspace",
    diagram: { id: "frr-decision" },
    frames: [
      {
        caption: "Start with the reason the airspace exists.",
        hold: 2600,
        props: { question: "National security or welfare?", yes: "PROHIBITED", no: "Keep going", chosen: "none" },
      },
      {
        caption: "Security or welfare makes it prohibited. No entry, ever.",
        hold: 3000,
        props: { question: "National security or welfare?", yes: "PROHIBITED", no: "Keep going", chosen: "yes" },
      },
      {
        caption: "Otherwise the hazard is gunfire, artillery or missiles.",
        hold: 2800,
        props: { question: "Is it over international waters?", yes: "WARNING area", no: "RESTRICTED area", chosen: "none" },
      },
      {
        caption: "Over land, it can be legally restricted — permission required.",
        hold: 3000,
        props: { question: "Is it over international waters?", yes: "WARNING area", no: "RESTRICTED area", chosen: "no" },
      },
      {
        caption: "Beyond 3 nm nobody can forbid you. So it warns instead.",
        hold: 3200,
        props: { question: "Is it over international waters?", yes: "WARNING area", no: "RESTRICTED area", chosen: "yes" },
      },
    ],
    predict: {
      at: 2,
      question:
        "The same gunnery hazard exists over land and 5 nm out to sea. Why can only one of them be RESTRICTED airspace?",
      options: [
        "The over-water one is less dangerous",
        "Beyond 3 nm nobody has authority to forbid entry",
        "Restricted areas are only drawn near airfields",
      ],
      answer: 1,
      because:
        "Restricted means entry can be legally denied, and that authority stops at the 3 nm territorial limit. Past it the same hazard can only be advertised — which is exactly what a Warning Area is. Same hazard, different legal reach.",
    },
    knowCold: "Same hazard. Over water it can only warn.",
    source: AIR,
  },
  {
    id: "fx-night-lights",
    title: "Three Dots at Night",
    promise: "Work out where another aircraft is going from the lights alone.",
    unit: "f8",
    conceptIds: ["fr-position-lights", "fr-relative-position"],
    lessonId: "fl29-lights-and-relative-position",
    diagram: { id: "frr-position-lights" },
    frames: [
      { caption: "Red on the left wing, green on the right, white aft.", hold: 2800, props: { view: "headon" } },
      { caption: "You see BOTH wingtips — it is coming straight at you.", hold: 3200, props: { view: "headon" } },
      { caption: "White only: you are behind it, going the same way.", hold: 3000, props: { view: "tail" } },
      { caption: "Red only: you see its left side, crossing right to left.", hold: 3000, props: { view: "left" } },
      { caption: "Green only: its right side, crossing left to right.", hold: 3000, props: { view: "right" } },
    ],
    predict: {
      at: 1,
      question:
        "At night you see a red light and a green light side by side, no white. What is that aircraft doing?",
      options: [
        "Flying away from you",
        "Coming straight at you",
        "Crossing left to right",
      ],
      answer: 1,
      because:
        "Red is the left wingtip and green the right, so seeing both means you are looking at its nose. That is the one combination that matters — a single colour is a crossing aircraft, and white alone means you are behind it.",
    },
    knowCold: "Red and green together is the one that matters.",
    source: AIR,
  },
  {
    id: "fx-right-of-way",
    title: "Who Gives Way",
    promise: "Four conflicts, four different answers — and only one uses the category list.",
    unit: "f8",
    conceptIds: ["fr-row-order", "fr-row-category"],
    lessonId: "fl30-right-of-way",
    diagram: { id: "frr-right-of-way" },
    frames: [
      { caption: "Head-on: both aircraft turn right. Category is irrelevant.", hold: 3000, props: { scenario: "headon" } },
      { caption: "Overtaking: the overtaken aircraft has it. Pass to the right.", hold: 3000, props: { scenario: "overtaking" } },
      { caption: "Landing: the lower aircraft — but no cutting in on final.", hold: 3000, props: { scenario: "landing" } },
      { caption: "Converging, same category: the one on your right.", hold: 3000, props: { scenario: "converging" } },
      { caption: "Different categories? Then the least manoeuvrable wins.", hold: 3200, props: { scenario: "converging" } },
    ],
    predict: {
      at: 2,
      question:
        "Two aircraft are converging and one is far less manoeuvrable. Does the category list settle it?",
      options: [
        "Yes — category is the rule",
        "Only if the situation rules do not already cover it",
        "No — category never applies",
      ],
      answer: 1,
      because:
        "The situation is checked first: distress, then head-on, overtaking, landing, and converging-same-category takes the aircraft on the right. Only when none of those settles it does the least-manoeuvrable category list decide. Category is the last resort, not the first.",
    },
    knowCold: "Distress first. Then the situation. Category is the last resort.",
    source: AIR,
  },
  {
    id: "fx-airspeed",
    title: "Slower Underneath",
    promise: "The inversion that catches everyone: 250 inside Class B, 200 beneath it.",
    unit: "f8",
    conceptIds: ["fr-airspeed"],
    lessonId: "fl31-altitude-and-airspeed",
    diagram: { id: "frr-airspeed" },
    frames: [
      { caption: "Below 10,000 MSL the general limit is 250 knots.", hold: 2800, props: { highlight: "below10" } },
      { caption: "Inside Class B it stays 250 — ATC is separating everyone.", hold: 3000, props: { highlight: "inb" } },
      { caption: "Beneath the Class B shelf it TIGHTENS to 200.", hold: 3400, props: { highlight: "underb" } },
      { caption: "Same 200 near a Class C or D field, within 4 nm to 2,500 AGL.", hold: 3200, props: { highlight: "cd" } },
      { caption: "The tighter number is where ATC is not separating you.", hold: 3000, props: { highlight: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "You are just beneath the Class B shelf, below 10,000 ft. What is your speed limit?",
      options: [
        "250 knots, the general limit",
        "200 knots",
        "No limit outside the Class B itself",
      ],
      answer: 1,
      because:
        "It is the inversion everyone misses: inside Class B it stays 250, because ATC is separating everyone in there. Underneath the shelf, where nobody is separating you from the traffic above, it tightens to 200.",
    },
    knowCold: "Inside B: 250. Under the shelf: 200.",
    source: AIR,
  },
];
