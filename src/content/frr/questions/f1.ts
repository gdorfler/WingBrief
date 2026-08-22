import type { Question, SourceReference } from "@/lib/types";

const ORG = (eo: string[]): SourceReference => ({
  document: "Flight Rules and Regulations Trainee Guide",
  chapter: "Federal Aviation Organization",
  eo,
});

/**
 * Units f1 and f2 — the rulebook, and planning.
 *
 * Several of these are modelled directly on the Assignment Sheet 7-1-3 study
 * questions, whose answer key the trainee guide publishes; those are tagged
 * officialStyle.
 */
export const F1_QUESTIONS: Question[] = [
  {
    id: "fq-f1-001",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-far"],
    prompt:
      "The regulatory publication issued by the FAA which most concerns the naval aircrew member is",
    options: ["the AIM", "FAR Part 91", "FLIP", "CNAF M-3710.7"],
    answer: 1,
    explanation:
      "FAR Part 91 contains the general operating and flight rules. It is the FAA publication that bears most directly on naval aircrew.",
    whyWrong:
      "The AIM is FAA but non-regulatory. FLIP is DOD. CNAF M-3710.7 is Navy.",
    knowCold: "FAR Part 91 = general operating and flight rules.",
    difficulty: 1,
    officialStyle: true,
    source: ORG(["2.345"]),
  },
  {
    id: "fq-f1-002",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-cnaf"],
    prompt:
      "In addition to the regulations set forth by the FAA, what set of regulations issued by the Navy governs the operation of all naval aircraft throughout the world?",
    options: ["CNAF M-3710.7", "T-6 NATOPS", "FAR Part 91", "AIM"],
    answer: 0,
    explanation:
      "CNAF M-3710.7 contains general operating procedures applying to all naval aircraft worldwide, subordinate only to aircraft NATOPS.",
    whyWrong:
      "NATOPS is specific to one aircraft model, not to all naval aircraft.",
    knowCold: "CNAF M-3710.7 = all naval aircraft, worldwide.",
    difficulty: 1,
    officialStyle: true,
    source: ORG(["2.346"]),
  },
  {
    id: "fq-f1-003",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-aim"],
    prompt: "The Aeronautical Information Manual is",
    options: [
      "regulatory, and published by the DOD",
      "non-regulatory, and published by the FAA",
      "regulatory, and published by the FAA",
      "non-regulatory, and published by the Navy",
    ],
    answer: 1,
    explanation:
      "The AIM is published by the FAA and is non-regulatory. It uses plain language to amplify and explain information for pilots.",
    knowCold: "FAR is regulatory; the AIM explains.",
    difficulty: 2,
    source: ORG(["2.345", "2.346"]),
  },
  {
    id: "fcc-f1-004",
    type: "connectChain",
    unit: "f1",
    conceptIds: ["fr-priority"],
    prompt: "Order the publications from highest regulatory priority to lowest.",
    trigger: "A conflict exists between publications",
    steps: [
      "Aircraft NATOPS",
      "CNAF M-3710.7",
      "FLIP",
      "FAR Part 91",
    ],
    explanation:
      "The more specific the document, the higher it ranks. The aircraft's own manual outranks the fleet-wide manual, which outranks the DOD publication, which outranks the FAA regulation.",
    knowCold: "NATOPS → CNAF → FLIP → FAR.",
    difficulty: 2,
    source: ORG(["2.347"]),
  },
  {
    id: "fq-f1-005",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-priority", "fr-natops"],
    prompt: "Which publication takes precedence over all others?",
    options: ["FAR Part 91", "CNAF M-3710.7", "The aircraft's NATOPS manual", "FLIP"],
    answer: 2,
    explanation:
      "Aircraft NATOPS is specific to one aircraft model and takes precedence over all other publications.",
    knowCold: "NATOPS wins.",
    difficulty: 1,
    officialStyle: true,
    source: ORG(["2.347"]),
  },
  {
    id: "ftap-f1-006",
    type: "tapDiagram",
    unit: "f1",
    conceptIds: ["fr-priority"],
    prompt:
      "The stack is ordered highest authority at the top. Tap the layer that applies to all naval aircraft worldwide.",
    diagram: { id: "frr-priority", props: { highlight: "none", labels: false } },
    targets: [
      { id: "natops", label: "Aircraft NATOPS", x: 250, y: 69, r: 25 },
      { id: "cnaf", label: "CNAF M-3710.7", x: 250, y: 121, r: 25 },
      { id: "flip", label: "FLIP", x: 250, y: 173, r: 25 },
      { id: "far", label: "FAR Part 91", x: 250, y: 225, r: 25 },
    ],
    answer: "cnaf",
    explanation:
      "CNAF M-3710.7 governs all naval aircraft worldwide. NATOPS above it is specific to one aircraft type.",
    knowCold: "CNAF M-3710.7: every naval aircraft, everywhere.",
    difficulty: 2,
    source: ORG(["2.347"]),
  },
  {
    id: "fq-f1-007",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-wording"],
    prompt: "Per CNAF M-3710.7, the word 'will' is used only to indicate",
    options: [
      "a mandatory procedure",
      "a recommended procedure",
      "an optional procedure",
      "futurity",
    ],
    answer: 3,
    explanation:
      "'Will' indicates futurity only, and never any degree of requirement. 'Shall' is mandatory, 'should' is recommended, 'may' is optional.",
    whyWrong:
      "This is the trap: 'will' sounds like a requirement in everyday English, but the manual gives it no force at all.",
    knowCold: "Shall = must. Should = recommended. May = optional. Will = futurity.",
    difficulty: 2,
    officialStyle: true,
    source: ORG(["2.348"]),
  },
  {
    id: "fdl-f1-008",
    type: "dragLabel",
    unit: "f1",
    conceptIds: ["fr-priority"],
    prompt:
      "The stack runs highest authority at the top. Drop each publication onto its own layer.",
    diagram: { id: "frr-priority", props: { highlight: "none", labels: false } },
    labels: ["Aircraft NATOPS", "CNAF M-3710.7", "FLIP", "FAR Part 91"],
    slots: [
      { id: "s-1", label: "", x: 250, y: 69 },
      { id: "s-2", label: "", x: 250, y: 121 },
      { id: "s-3", label: "", x: 250, y: 173 },
      { id: "s-4", label: "", x: 250, y: 225 },
    ],
    answer: {
      "s-1": "Aircraft NATOPS",
      "s-2": "CNAF M-3710.7",
      "s-3": "FLIP",
      "s-4": "FAR Part 91",
    },
    explanation:
      "The narrower the audience a publication is written for, the higher it ranks. NATOPS covers one aircraft, CNAF every naval aircraft, FLIP every service, and FAR Part 91 everyone who flies.",
    knowCold: "NATOPS → CNAF M-3710.7 → FLIP → FAR Part 91.",
    difficulty: 3,
    source: ORG(["2.347"]),
  },
  {
    id: "fq-f1-009",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-atc"],
    prompt: "What agency grants all IFR clearances?",
    options: ["Flight Service Station", "Air Traffic Control", "The FAA administrator", "Base operations"],
    answer: 1,
    explanation:
      "ATC enforces the FAR, approves flight plans and grants clearances, including all IFR clearances.",
    knowCold: "ATC grants the clearances.",
    difficulty: 1,
    officialStyle: true,
    source: ORG(["2.349"]),
  },
  {
    id: "fq-f1-010",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-tower"],
    prompt:
      "The responsibility for the movement of air and ground traffic at and around an airport lies with the",
    options: ["Approach Control", "ARTCC", "Control Tower", "Flight Service Station"],
    answer: 2,
    explanation:
      "The Control Tower is responsible for the safe, orderly and expeditious flow of traffic operating on and in the vicinity of the airport.",
    whyWrong:
      "Approach Control handles terminal instrument traffic; the tower owns movement at the field itself.",
    knowCold: "Tower = traffic at and around the airport.",
    difficulty: 1,
    officialStyle: true,
    source: ORG(["2.349"]),
  },
  {
    id: "fq-f1-011",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-approach"],
    prompt:
      "Which subordinate agency of ATC is responsible for handling all terminal instrument air traffic?",
    options: ["Approach Control", "ARTCC", "Control Tower", "FSS"],
    answer: 0,
    explanation:
      "Approach Control (TRACON) controls all instrument flight within its terminal area, primarily by direct pilot-controller communication.",
    whyWrong: "ARTCC has the en route phase, not the terminal area.",
    knowCold: "Approach = terminal IFR. Center = en route IFR.",
    difficulty: 2,
    officialStyle: true,
    source: ORG(["2.349"]),
  },
  {
    id: "fq-f1-012",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-artcc"],
    prompt: "The Air Route Traffic Control Center provides",
    options: [
      "pilot briefings and flight plan filing",
      "positive control of IFR aircraft principally during the en route phase",
      "control of all traffic on and around an airport",
      "clearance delivery only",
    ],
    answer: 1,
    explanation:
      "ARTCC provides control service to IFR aircraft within controlled airspace principally during the en route phase, and can offer advisories to VFR aircraft when workload permits.",
    knowCold: "ARTCC = en route IFR.",
    difficulty: 2,
    source: ORG(["2.349"]),
  },
  {
    id: "fq-f1-013",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-fss"],
    prompt: "Which of these is a function of the Flight Service Station?",
    options: [
      "Granting IFR clearances",
      "Pilot briefings, flight plan filing and search and rescue support",
      "Separating IFR traffic in the terminal area",
      "Controlling ground movement at a towered field",
    ],
    answer: 1,
    explanation:
      "FSS provides pilot briefings covering weather, route and NOTAMs, processes flight plans, relays en route communications and supports search and rescue. At military fields it is base operations.",
    knowCold: "FSS = briefings, flight plans, SAR. Also called base ops.",
    difficulty: 2,
    source: ORG(["2.349"]),
  },
  {
    id: "fq-f1-014",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-notam"],
    prompt: "A NOTAM contains information concerning",
    options: [
      "permanent changes to published approach procedures",
      "the establishment, condition or change of any aeronautical facility, service, procedure or hazard which is temporary in nature",
      "forecast weather along the route of flight",
      "aircraft-specific operating limitations",
    ],
    answer: 1,
    explanation:
      "NOTAMs cover temporary matters, or matters not known far enough in advance to publicise by other means.",
    knowCold: "NOTAM = temporary, or too late to publish otherwise.",
    difficulty: 2,
    source: ORG(["2.351"]),
  },
  {
    id: "fq-f1-015",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-transponder"],
    prompt: "Mode C of a transponder provides",
    options: [
      "aircraft identification",
      "aircraft pressure altitude information",
      "GPS position once per second",
      "two-way voice communication",
    ],
    answer: 1,
    explanation:
      "Mode 3 identifies the aircraft; Mode C reports pressure altitude. ADS-B is what broadcasts GPS position, altitude and ground speed once per second.",
    knowCold: "Mode 3 = who you are. Mode C = how high you are.",
    difficulty: 2,
    source: ORG(["2.349"]),
  },

  /* ================= f2 · Planning and Responsibility ================= */
  {
    id: "fq-f2-001",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-pic"],
    prompt: "As pilot in command you are responsible for which of the following?",
    options: [
      "Operation and safety of the aircraft",
      "Safe and orderly conduct of the flight",
      "Well-being of the crew",
      "All of the above",
    ],
    answer: 3,
    explanation:
      "The FAR makes the PIC directly responsible and the final authority as to the operation of the aircraft. CNAF adds responsibility for the safe, orderly flight and the well-being of the crew.",
    knowCold: "PIC: the aircraft, the flight, and the crew.",
    difficulty: 1,
    officialStyle: true,
    source: ORG(["2.350"]),
  },
  {
    id: "fq-f2-002",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-deviation"],
    prompt: "When, if ever, is it permissible to deviate from FAR Part 91?",
    options: [
      "Never",
      "During emergencies",
      "Whenever the mission requires it",
      "Only with prior ATC approval",
    ],
    answer: 1,
    explanation:
      "CNAF M-3710.7 authorises deviation in emergency situations when, in the judgment of the pilot in command, safety justifies it.",
    knowCold: "Emergencies permit a deviation; the PIC judges.",
    difficulty: 1,
    officialStyle: true,
    source: ORG(["2.354"]),
  },
  {
    id: "fq-f2-003",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-preflight"],
    prompt:
      "According to CNAF M-3710.7, preflight planning is required on which of the following occasions?",
    options: [
      "Urgent combat missions",
      "Local training flights",
      "Flights departing uncontrolled airports with no control tower",
      "All of the above",
    ],
    answer: 3,
    explanation:
      "Preflight planning is a PIC responsibility on every flight, with no exception for familiarity or urgency.",
    knowCold: "Preflight planning: every flight, no exceptions.",
    difficulty: 2,
    officialStyle: true,
    source: ORG(["2.351"]),
  },
  {
    id: "fq-f2-004",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-preflight"],
    prompt: "Preflight planning must include all of the following EXCEPT",
    options: [
      "available weather reports and forecasts",
      "NOTAMs",
      "the names of the controllers on duty",
      "alternates available if the flight cannot be completed as planned",
    ],
    answer: 2,
    explanation:
      "The minimum list is weather reports and forecasts, NOTAMs, fuel requirements, available alternates, and anticipated traffic delays.",
    knowCold: "Weather, NOTAMs, fuel, alternates, delays.",
    difficulty: 2,
    source: ORG(["2.351"]),
  },
  {
    id: "fq-f2-005",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-flight-plan"],
    prompt: "The primary purpose of a flight plan is to",
    options: [
      "obtain an IFR clearance",
      "establish a baseline for lost communications and lost aircraft procedures",
      "reserve airspace along the route",
      "satisfy the weather brief requirement",
    ],
    answer: 1,
    explanation:
      "Flight plans give ATC the departure and destination airfields and intermediate agencies, but their primary purpose is a search-and-rescue baseline.",
    whyWrong:
      "The clearance is a separate transaction with ATC. The plan is what lets somebody come looking for you.",
    knowCold: "Flight plan = the baseline if you go missing.",
    difficulty: 2,
    officialStyle: true,
    source: ORG(["2.352"]),
  },
  {
    id: "fq-f2-006",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-weather-brief"],
    prompt:
      "A naval flight weather brief is completed on a DD-175-1 and is valid for",
    options: [
      "3 hours past brief time, or ETD + 30 minutes, whichever is later",
      "3 hours past brief time, or ETD + 30 minutes, whichever is earlier",
      "6 hours past brief time regardless of ETD",
      "until the ETA plus one hour",
    ],
    answer: 1,
    explanation:
      "Two clocks run against the brief — brief time plus 3 hours, and ETD plus 30 minutes — and the EARLIER of the two voids it.",
    whyWrong:
      "Choosing 'later' is the trap. The stricter of the two limits always governs.",
    knowCold: "DD-175-1: void at brief+3 hr or ETD+30 min, whichever comes first.",
    difficulty: 3,
    officialStyle: true,
    source: ORG(["2.353"]),
  },
  {
    id: "fsl-f2-007",
    type: "sliderPredict",
    unit: "f2",
    conceptIds: ["fr-weather-brief"],
    prompt:
      "Move the ETD later and later. Which clock ends up voiding the brief?",
    widget: "BriefVoidWidget",
    options: [
      "Brief + 3 hours, once ETD is late enough",
      "ETD + 30 minutes, always",
      "Neither — the brief never expires",
    ],
    answer: 0,
    explanation:
      "With an early ETD the brief dies 30 minutes after departure. Push the ETD out past 2 hours 30 and the brief-plus-3-hours clock fires first instead.",
    knowCold: "Whichever clock runs out first is the one that matters.",
    difficulty: 3,
    source: ORG(["2.353"]),
  },
  {
    id: "fq-f2-008",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-icing-thunderstorms"],
    prompt:
      "CNAF M-3710.7 states that flights shall be planned to circumvent areas of forecast",
    options: [
      "atmospheric icing and thunderstorm conditions whenever practicable",
      "turbulence of any intensity",
      "crosswinds exceeding aircraft limits",
      "restricted airspace",
    ],
    answer: 0,
    explanation:
      "The requirement names icing and thunderstorms specifically, qualified by 'whenever practicable'.",
    knowCold: "Plan around forecast icing and thunderstorms when practicable.",
    difficulty: 2,
    source: ORG(["2.353"]),
  },
  {
    id: "fq-f2-009",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-closing-plans"],
    prompt: "Who is responsible for ensuring a flight plan is closed?",
    options: [
      "The PIC only",
      "The formation leader only",
      "Both the PIC and the formation leader",
      "The destination control tower",
    ],
    answer: 2,
    explanation:
      "Both carry the responsibility. At military installations closing is done verbally to the tower or base operations, or by delivering the flight plan to base ops; at non-military fields with an FSS by any means.",
    knowCold: "PIC and formation leader both own closing the plan.",
    difficulty: 2,
    officialStyle: true,
    source: ORG(["2.355"]),
  },
  {
    id: "fq-f2-010",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-authorized-airfields"],
    prompt:
      "For naval aircraft operating at a civilian airfield, the PIC should consider",
    options: [
      "local or special procedures",
      "runway length and load-bearing capability",
      "whether DoD contract services are available",
      "all of the above, plus security and force protection",
    ],
    answer: 3,
    explanation:
      "Prior permission is required, and the PIC must be familiar with special procedures, runway length and load-bearing capability, DoD contract services, and security and force protection.",
    knowCold: "Procedures, runway, services, security — and prior permission.",
    difficulty: 2,
    officialStyle: true,
    source: ORG(["2.355"]),
  },
  {
    id: "fq-f2-011",
    type: "mcq",
    unit: "f2",
    conceptIds: ["fr-fuel-purchase"],
    prompt:
      "PICs shall make every effort to purchase fuel from military or government contract sources, EXCEPT for",
    options: [
      "any flight over 500 nm",
      "mission requirements, emergency landings and alternate airfield landings",
      "flights outside the continental United States",
      "training flights",
    ],
    answer: 1,
    explanation:
      "Those three cases are the stated exceptions to the fuel purchase rule.",
    knowCold: "Mission, emergency, alternate — the three fuel exceptions.",
    difficulty: 2,
    source: ORG(["2.355"]),
  },
  {
    id: "ftrap-f2-012",
    type: "spotTheTrap",
    unit: "f2",
    conceptIds: ["fr-deviation"],
    prompt:
      '"A pilot may deviate from FAR Part 91 whenever the mission requires it."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The deviation provision is for EMERGENCY situations, when in the PIC's judgment safety justifies it. Mission requirement alone is not the test.",
    knowCold: "Emergency and safety — not mission convenience.",
    difficulty: 3,
    source: ORG(["2.354"]),
  },
  {
    id: "fq-f1-016",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-wording"],
    prompt:
      "A CNAF procedure reads: \"The aircraft WILL be configured prior to the break.\" What degree of requirement does that impose?",
    options: [
      "Mandatory — 'will' has the same force as 'shall'",
      "None — 'will' indicates futurity only",
      "Recommended",
      "Optional",
    ],
    answer: 1,
    explanation:
      "CNAF M-3710.7 reserves 'shall' for mandatory procedures. 'Will' is used only to indicate futurity and carries no degree of requirement.",
    whyWrong:
      "In ordinary English 'will' sounds like a command. In this manual it is the one word of the four that compels nothing.",
    knowCold: "Only 'shall' is mandatory.",
    difficulty: 3,
    source: ORG(["2.348"]),
  },
  {
    id: "fq-f1-017",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-flip"],
    prompt: "Where would you find en route charts, approach plates and planning guides?",
    options: ["The AIM", "FLIP", "FAR Part 91", "The aircraft NATOPS manual"],
    answer: 1,
    explanation:
      "Flight Information Publications, published by the Department of Defense for all branches, covering both IFR and VFR.",
    knowCold: "FLIP is DOD, and it is where the charts live.",
    difficulty: 1,
    source: ORG(["2.346"]),
  },
  {
    id: "fq-f1-018",
    type: "mcq",
    unit: "f1",
    conceptIds: ["fr-transponder"],
    prompt: "Mode C on a transponder reports",
    options: [
      "the aircraft's identity",
      "the aircraft's pressure altitude",
      "the aircraft's ground speed",
      "the aircraft's GPS position",
    ],
    answer: 1,
    explanation:
      "Mode 3 answers who you are; Mode C answers how high you are. ADS-B is the one that broadcasts GPS position, altitude and ground speed.",
    whyWrong: "Identity is Mode 3. Position and ground speed are ADS-B.",
    knowCold: "Mode 3 = who. Mode C = how high.",
    difficulty: 2,
    source: ORG(["2.351"]),
  },
];
