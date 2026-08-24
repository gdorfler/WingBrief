import type { Question, SourceReference } from "@/lib/types";
import { CONCEPTS } from "../concepts";

/**
 * Application-tier questions for concepts the bank could previously only
 * assess by recognition.
 *
 * Flight Rules had the largest gap of the five courses: 52 of 106 concepts
 * were assessed purely by "what does this regulation say". That is the wrong
 * demand for the subject. Nobody is ever asked to recite CNAF M-3710.7 from
 * memory; they are asked, in a specific situation, which rule bites and what
 * they must therefore do.
 *
 * So every question here starts from a situation and asks for the ruling. The
 * distractors are drawn from the neighbouring rule, the common exception, or
 * the documented trap — because on this material the realistic error is
 * applying a real regulation that happens to be the wrong one, not inventing
 * a fictional one.
 */

function sourceOf(conceptId: string): SourceReference {
  const concept = CONCEPTS.find((c) => c.id === conceptId);
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
  /* F1 — RULES AND REGULATORS                                         */
  /* ================================================================ */

  applied("fr-far", {
    id: "fq-ap-001",
    type: "spotTheTrap",
    unit: "f1",
    prompt:
      '"A pilot cited for violating a procedure published in the AIM has broken a federal regulation."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The FAA publishes both, but only the FAR is regulatory — the AIM is advisory. Part 91 of the FAR holds the general operating and flight rules that most concern the naval aircrew member.",
    knowCold: "FAR = regulatory. AIM = advisory. Same publisher, different force.",
    difficulty: 3,
  }),

  applied("fr-flip", {
    id: "fq-ap-002",
    type: "mcq",
    unit: "f1",
    prompt:
      "A crew planning a cross-country needs approach plates and en route charts for both an IFR leg and a VFR leg. The publication that carries all of it is",
    options: ["the FAR", "the AIM", "FLIP", "NATOPS"],
    answer: 2,
    explanation:
      "Flight Information Publications, published by the Department of Defense for all branches, carry en route charts, approach plates and planning guides for both IFR and VFR. The FAR and AIM are FAA products and carry rules, not charts.",
    knowCold: "FLIP = DoD charts and plates, IFR and VFR both.",
    difficulty: 3,
  }),

  applied("fr-cnaf", {
    id: "fq-ap-003",
    type: "mcq",
    unit: "f1",
    prompt:
      "The FAR permits an operation that CNAF M-3710.7 restricts more tightly. The naval aircrew member must",
    options: [
      "follow the FAR, as federal regulation outranks service instruction",
      "follow CNAF, the more stringent of the two",
      "request a waiver before either applies",
      "follow whichever the local commanding officer designates",
    ],
    answer: 1,
    explanation:
      "CNAF is usually MORE stringent than the FAR, and where both speak you follow the tighter one. CNAF is the NATOPS General Flight and Operating Instructions Manual, applying to all naval aircraft worldwide, and is subordinate only to aircraft-specific NATOPS.",
    knowCold: "When both speak, the tighter rule wins — and that is usually CNAF.",
    difficulty: 3,
  }),

  applied("fr-natops", {
    id: "fq-ap-004",
    type: "mcq",
    unit: "f1",
    prompt:
      "A limitation in the aircraft's own NATOPS manual conflicts with a general procedure in CNAF M-3710.7. Which governs?",
    options: [
      "CNAF, because it applies worldwide",
      "Aircraft NATOPS, which takes precedence over all other publications",
      "The FAR, as the senior authority",
      "Neither until the conflict is formally resolved",
    ],
    answer: 1,
    explanation:
      "Aircraft NATOPS is model-specific and takes precedence over all other publications. The hierarchy runs from the specific to the general: the document written for THIS aircraft knows something the fleet-wide manual cannot.",
    knowCold: "Aircraft NATOPS beats CNAF beats DoD beats FAA.",
    difficulty: 3,
  }),

  applied("fr-atc", {
    id: "fq-ap-005",
    type: "mcq",
    unit: "f1",
    prompt: "The agency that approves flight plans and issues all IFR clearances is",
    options: ["the FAA administrator", "ATC", "base operations", "the FSS"],
    answer: 1,
    explanation:
      "Air Traffic Control enforces the FAR, approves flight plans and grants clearances, including every IFR clearance, working through four subordinate agencies. The FSS processes flight plans and briefs pilots but does not clear them.",
    knowCold: "ATC clears. FSS briefs and files.",
    difficulty: 3,
  }),

  applied("fr-fss", {
    id: "fq-ap-006",
    type: "mcq",
    unit: "f1",
    prompt:
      "A pilot at a military field needs a weather and NOTAM briefing and wants to file. The facility providing this is",
    options: [
      "the control tower",
      "base operations, the military equivalent of an FSS",
      "approach control",
      "the TRACON",
    ],
    answer: 1,
    explanation:
      "The Flight Service Station briefs weather, route and NOTAMs, processes flight plans, relays en route communications and supports search and rescue and flight following. At military fields that function is base operations.",
    knowCold: "FSS = base operations at a military field.",
    difficulty: 3,
  }),

  applied("fr-tower", {
    id: "fq-ap-007",
    type: "mcq",
    unit: "f1",
    prompt:
      "An aircraft is taxiing from the ramp to the runway. The agency responsible for that movement is",
    options: ["approach control", "the tower", "the FSS", "centre"],
    answer: 1,
    explanation:
      "The tower owns the safe, orderly and expeditious flow of both AIR and GROUND traffic on and in the vicinity of the airport, working through clearance delivery, ground and tower positions. Terminal instrument traffic belongs to Approach Control instead.",
    knowCold: "Tower = at and around the airport, air and ground. Approach = terminal instrument.",
    difficulty: 3,
  }),

  applied("fr-approach", {
    id: "fq-ap-008",
    type: "mcq",
    unit: "f1",
    prompt:
      "An aircraft on an instrument approach ten miles from the field, having left the en route structure, is talking to",
    options: ["the tower", "TRACON (approach control)", "the FSS", "clearance delivery"],
    answer: 1,
    explanation:
      "Terminal Radar Approach Control — Approach or Departure Control — controls all instrument flight within its area, which may cover several airfields, primarily by direct pilot-controller communication. The handoff to tower comes later.",
    knowCold: "Instrument flight in the terminal area = TRACON.",
    difficulty: 3,
  }),

  applied("fr-notam", {
    id: "fq-ap-009",
    type: "mcq",
    unit: "f1",
    prompt:
      "A taxiway will be closed for three days starting tomorrow. This is promulgated by",
    options: ["a NOTAM", "a revision to FLIP", "an AIM amendment", "a TFR"],
    answer: 0,
    explanation:
      "A NOTAM carries information about the establishment, condition or change of any aeronautical facility, service, procedure or hazard that is TEMPORARY, or not known far enough ahead to publish any other way. A three-day closure is exactly that.",
    knowCold: "Temporary or short-notice change → NOTAM.",
    difficulty: 3,
  }),

  applied("fr-transponder", {
    id: "fq-ap-010",
    type: "mcq",
    unit: "f1",
    prompt:
      "A controller can see the aircraft's identity on the scope but not its altitude. The mode that has failed is",
    options: ["Mode 3", "Mode C", "ADS-B", "the radar beacon receiver"],
    answer: 1,
    explanation:
      "Mode 3 identifies the aircraft; Mode C reports pressure altitude. Identity present and altitude missing points squarely at Mode C. ADS-B is a separate broadcast of GPS position, altitude and ground speed once per second.",
    knowCold: "Mode 3 → who you are. Mode C → how high you are.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* F2 — PLANNING AND RESPONSIBILITY                                  */
  /* ================================================================ */

  applied("fr-pic", {
    id: "fq-ap-011",
    type: "mcq",
    unit: "f2",
    prompt:
      "Under CNAF M-3710.7, the pilot in command is responsible for",
    options: [
      "the safe operation of the aircraft only",
      "the aircraft and the conduct of the flight, but not crew welfare",
      "the safe orderly flight of the aircraft and the well-being of the crew",
      "only those duties formally delegated by the commanding officer",
    ],
    answer: 2,
    explanation:
      "The FAR makes the PIC directly responsible for, and final authority as to, the operation of the aircraft. CNAF adds the crew explicitly: the safe, orderly flight of the aircraft AND the well-being of the crew. The scope is broader than candidates expect, which is why the widest defensible option is usually right.",
    knowCold: "PIC owns the aircraft, the flight, and the crew.",
    difficulty: 3,
  }),

  applied("fr-preflight", {
    id: "fq-ap-012",
    type: "spotTheTrap",
    unit: "f2",
    prompt:
      '"A short local training flight in the pattern does not require preflight planning."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Preflight planning is a PIC responsibility on EVERY flight — local training flights and urgent combat missions included. At minimum it covers weather reports and forecasts, NOTAMs, fuel requirements, available alternates and anticipated traffic delays.",
    knowCold: "Every flight. No exception for local, short, or urgent.",
    difficulty: 3,
  }),

  applied("fr-flight-plan", {
    id: "fq-ap-013",
    type: "mcq",
    unit: "f2",
    prompt: "The primary purpose of filing a flight plan is to",
    options: [
      "obtain an ATC clearance",
      "establish a baseline for lost communication and lost aircraft procedures",
      "reserve airspace along the route",
      "satisfy the fuel reserve requirement",
    ],
    answer: 1,
    explanation:
      "Search and rescue is the point: the plan tells someone where to start looking. A clearance is a separate transaction with ATC — filing and being cleared are not the same act, and the exam leans on that confusion.",
    knowCold: "Flight plan = SAR baseline, not a clearance.",
    difficulty: 3,
  }),

  applied("fr-icing-thunderstorms", {
    id: "fq-ap-014",
    type: "mcq",
    unit: "f2",
    prompt:
      "Forecast thunderstorms lie across the planned route and a practicable detour exists. CNAF M-3710.7 requires the flight to be",
    options: [
      "flown as planned, with airborne radar used to pick a way through",
      "planned to circumvent the area",
      "cancelled outright",
      "refiled as IFR at a higher altitude",
    ],
    answer: 1,
    explanation:
      "Flights shall be PLANNED to circumvent areas of forecast atmospheric icing and thunderstorm conditions whenever practicable. The obligation lands at the planning table, not on the radar in flight — and it applies to forecast icing on the same terms.",
    knowCold: "Plan around forecast icing and thunderstorms whenever practicable.",
    difficulty: 3,
  }),

  applied("fr-authorized-airfields", {
    id: "fq-ap-015",
    type: "mcq",
    unit: "f2",
    prompt:
      "Before operating into an airfield that requires prior permission, the PIC must be familiar with all of the following EXCEPT",
    options: [
      "runway and taxiway load-bearing capability",
      "local or special procedures",
      "the field's historical weather minimums for the past year",
      "security and force protection",
    ],
    answer: 2,
    explanation:
      "Prior permission is required and the PIC must know local or special procedures, runway length, runway and taxiway load-bearing capability, availability of DoD contract services, and security and force protection. A year of historical weather is not on that list.",
    knowCold: "PPR fields: procedures, runway length, load bearing, contract services, security.",
    difficulty: 3,
  }),

  applied("fr-fuel-purchase", {
    id: "fq-ap-016",
    type: "mcq",
    unit: "f2",
    prompt:
      "A flight diverts to a civilian field as an alternate and needs fuel. Purchasing from a commercial source is",
    options: [
      "prohibited without prior approval from the commanding officer",
      "permitted — alternate airfield landings are an exception",
      "permitted only if the fuel is JP-5",
      "prohibited in all circumstances",
    ],
    answer: 1,
    explanation:
      "PICs shall make every effort to buy from military or government contract sources, but there are three stated exceptions: mission requirements, emergency landings, and alternate airfield landings. A diversion to an alternate is squarely inside one of them.",
    knowCold: "Buy government fuel — except mission need, emergency, or alternate.",
    difficulty: 3,
  }),

  applied("fr-closing-plans", {
    id: "fq-ap-017",
    type: "mcq",
    unit: "f2",
    prompt:
      "A two-aircraft formation lands at a civilian field. Responsibility for ensuring the flight plan is closed rests with",
    options: [
      "the formation leader alone",
      "each PIC alone",
      "both the PIC and the formation leader",
      "the receiving FSS automatically",
    ],
    answer: 2,
    explanation:
      "Both carry it. At a non-military field closure is made with an FSS by any means of communication; at a military installation it is done verbally to the tower or base operations, or by delivering the flight plan to base operations. Nothing closes automatically.",
    knowCold: "PIC and formation leader both own closing the plan.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* F3 — SAFETY AND THE HUMAN                                         */
  /* ================================================================ */

  applied("fr-harness", {
    id: "fq-ap-018",
    type: "mcq",
    unit: "f3",
    prompt:
      "High G forces are anticipated during a manoeuvre. Where inertial reels are fitted, they shall be",
    options: [
      "left unlocked to permit reach to controls",
      "manually locked",
      "locked only if the aircraft is single-seat",
      "removed from service until after landing",
    ],
    answer: 1,
    explanation:
      "Inertial reels shall be manually locked for takeoff and landing and when high G forces are anticipated — with the single exception of cases where locking would itself be detrimental to safety. The harness is worn and tightened from before takeoff until the flight is complete.",
    knowCold: "Lock the reels: takeoff, landing, and anticipated high G.",
    difficulty: 3,
  }),

  applied("fr-ppe", {
    id: "fq-ap-019",
    type: "mcq",
    unit: "f3",
    prompt:
      "An inflatable life preserver is required to be worn on which of these sorties?",
    options: [
      "Any flight in a fire-resistant flight suit",
      "A mission flown below 1,000 feet over water",
      "Any flight above 10,000 feet",
      "Only flights launching from a ship",
    ],
    answer: 1,
    explanation:
      "The life preserver is worn aboard ship, in ejection-seat aircraft, and on missions below 1,000 feet over water. Shipboard is one trigger of three, so an answer naming only that one is incomplete.",
    knowCold: "Life preserver: aboard ship · ejection seat · below 1,000 ft over water.",
    difficulty: 3,
  }),

  applied("fr-life-rafts", {
    id: "fq-ap-020",
    type: "mcq",
    unit: "f3",
    prompt: "Life rafts must be carried when",
    options: [
      "any part of the route crosses water",
      "there is significant risk of water entry during a mishap",
      "the flight exceeds one hour",
      "passengers are aboard",
    ],
    answer: 1,
    explanation:
      "The trigger is significant risk of water entry during a mishap, and capacity must be sufficient for all passengers and crew. It is a risk test, not a simple did-you-cross-water test.",
    knowCold: "Rafts on significant risk of water entry — enough for everyone aboard.",
    difficulty: 3,
  }),

  applied("fr-oxygen-tacjet", {
    id: "fq-ap-021",
    type: "mcq",
    unit: "f3",
    prompt:
      "In a tactical jet training aircraft on a low-level sortie never exceeding 5,000 feet, oxygen shall be used",
    options: [
      "only above 10,000 feet cabin altitude",
      "from takeoff to landing by all occupants",
      "at the discretion of the PIC",
      "only if the flight exceeds 30 minutes",
    ],
    answer: 1,
    explanation:
      "In tactical jet and tactical jet training aircraft, oxygen is used by ALL occupants from takeoff to landing — altitude does not enter into it. Emergency bailout bottles, where provided, are connected before takeoff.",
    knowCold: "Tac jet: oxygen takeoff to landing, whatever the altitude.",
    difficulty: 3,
  }),

  applied("fr-performance-factors", {
    id: "fq-ap-022",
    type: "mcq",
    unit: "f3",
    prompt:
      "Which of these is a recognised factor affecting aircrew performance under CNAF?",
    options: [
      "The circadian clock",
      "The aircraft's wing loading",
      "The number of sorties flown that month",
      "Airfield elevation",
    ],
    answer: 0,
    explanation:
      "The recognised factors are human and environmental: weather, temperature extremes, night operations, vision imaging systems, mission delays, personal equipment and life support, duty period duration, quality and duration of sleep, the circadian clock, and dehydration. Airframe and airfield characteristics are not on the list.",
    knowCold: "Performance factors are about the human and the conditions, not the airframe.",
    difficulty: 3,
  }),

  applied("fr-crew-rest", {
    id: "fq-ap-023",
    type: "mcq",
    unit: "f3",
    prompt:
      "A crew member has been on duty for 17 hours and is asked to accept a further 3-hour sortie. Under CNAF this is a problem because crew day",
    options: [
      "should not exceed 12 hours",
      "should not exceed 18 hours",
      "should not exceed 24 hours",
      "has no stated limit if crew rest was adequate",
    ],
    answer: 1,
    explanation:
      "Crew day should not exceed 18 hours, and 17 + 3 puts the crew well past it. The companion requirement is the opportunity for 8 hours of UNINTERRUPTED sleep in every 24-hour period — the two work together.",
    knowCold: "8 hours uninterrupted sleep per 24 · crew day not beyond 18 hours.",
    difficulty: 3,
  }),

  applied("fr-caffeine-drugs", {
    id: "fq-ap-024",
    type: "spotTheTrap",
    unit: "f3",
    prompt:
      '"An aircrew member may self-medicate with an over-the-counter antihistamine before flight, since no prescription is involved."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. BOTH prescription and over-the-counter drugs are prohibited for flight personnel unless specifically approved by a flight surgeon. The 'it's only over-the-counter' reasoning is the exact trap. Recommended maximum caffeine is separately set at 450 mg a day.",
    knowCold: "Prescription AND over-the-counter both need the flight surgeon.",
    difficulty: 3,
  }),

  applied("fr-immunization-blood", {
    id: "fq-ap-025",
    type: "mcq",
    unit: "f3",
    prompt:
      "An aircrew member donates one pint of blood on Monday morning. The earliest they may resume flight duties is",
    options: ["Monday evening", "Tuesday morning", "Friday morning", "the following Monday"],
    answer: 2,
    explanation:
      "Four days after donating a pint of blood — Monday to Friday. Immunizations are the shorter one at 12 hours, and the exam routinely offers the two intervals against each other.",
    knowCold: "Immunization 12 hours · blood donation 4 days.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* F4 — THE AIRPORT                                                  */
  /* ================================================================ */

  applied("fr-runway-numbering", {
    id: "fq-ap-026",
    type: "mcq",
    unit: "f4",
    prompt:
      "A runway is aligned with a magnetic heading of 267°. It is numbered",
    options: ["26", "27", "267", "07"],
    answer: 1,
    explanation:
      "Round the magnetic heading to the nearest 10 degrees — 267 rounds to 270 — then drop the last digit, giving runway 27. Truncating instead of rounding gives 26, which is the distractor.",
    whyWrong: "26 comes from chopping the 7 rather than rounding it. Round first, then drop.",
    knowCold: "Round to the nearest 10, then drop the last digit.",
    difficulty: 3,
  }),

  applied("fr-airport-signs", {
    id: "fq-ap-027",
    type: "mcq",
    unit: "f4",
    prompt:
      "While taxiing the pilot sees a sign with white lettering on a red background. This is",
    options: [
      "a location sign",
      "a direction sign",
      "a mandatory instruction sign",
      "an information sign",
    ],
    answer: 2,
    explanation:
      "Mandatory instruction signs are white on red. Red on an airfield means stop and think — these mark the places you may not cross without a clearance.",
    knowCold: "White on red = mandatory instruction.",
    difficulty: 3,
  }),

  applied("fr-displaced-threshold", {
    id: "fq-ap-028",
    type: "mcq",
    unit: "f4",
    prompt:
      "Runway 09 has a displaced threshold. The paved surface before the threshold may be used for",
    options: [
      "landing and takeoff",
      "takeoff and rollout, but not landing",
      "landing but not takeoff",
      "no operations of any kind",
    ],
    answer: 1,
    explanation:
      "Take off from it, roll out over it, do not land on it. The displacement exists because something — obstacle clearance, noise, a road — makes touchdown there unsafe, while the pavement itself is structurally fine.",
    knowCold: "Displaced threshold: takeoff yes, rollout yes, landing no.",
    difficulty: 3,
  }),

  applied("fr-waveoff", {
    id: "fq-ap-029",
    type: "mcq",
    unit: "f4",
    prompt:
      "On short final the pilot sees high-intensity red lights at the approach end. The required action is to",
    options: [
      "continue, treating them as advisory",
      "treat them as a waveoff and go around",
      "query the tower before deciding",
      "land long, past the lights",
    ],
    answer: 1,
    explanation:
      "Any high-intensity red lights at the approach end should be treated as a waveoff signal. A waveoff means DO NOT LAND and compliance is mandatory — the only exception is an emergency.",
    knowCold: "Waveoff = do not land. Mandatory, emergencies excepted.",
    difficulty: 3,
  }),

  applied("fr-beacon", {
    id: "fq-ap-030",
    type: "mcq",
    unit: "f4",
    prompt:
      "At night a pilot sees a beacon showing two quick white flashes alternating with a green flash. This identifies",
    options: [
      "a civilian airport",
      "a military airport",
      "a heliport",
      "a lighted obstruction",
    ],
    answer: 1,
    explanation:
      "Dual-peaked — two quick — white flashes alternating with green marks a MILITARY airport. A civilian beacon alternates solid white with solid green. Both operate sunset to sunrise, and in daylight when visibility is restricted.",
    knowCold: "Two quick whites + green = military. Single white + green = civilian.",
    difficulty: 3,
  }),

  applied("fr-iflols", {
    id: "fq-ap-031",
    type: "mcq",
    unit: "f4",
    prompt:
      "Approaching the ship, the pilot sees the ball sitting below the green datum lights and turning red. The aircraft is",
    options: ["above glideslope", "on glideslope", "below glideslope", "lined up left"],
    answer: 2,
    explanation:
      "On the IFLOLS the amber centre ball moves with the aircraft's position relative to glideslope and aligns with the bar of green datum lights when on slope. Below the datum — and turning red — means below glideslope.",
    knowCold: "Ball below the datum and red = you are low.",
    difficulty: 3,
  }),

  applied("fr-sgsi", {
    id: "fq-ap-032",
    type: "mcq",
    unit: "f4",
    prompt:
      "A helicopter approaching a ship sees a steady green on the SGSI. The aircraft is",
    options: [
      "on glideslope",
      "slightly above glideslope",
      "well above glideslope",
      "below glideslope",
    ],
    answer: 2,
    explanation:
      "On the SGSI green means WELL ABOVE glideslope. Red is below, the amber-red interface is on slope, and amber alone is slightly above. Green being the 'wrong' answer here is what makes it worth knowing — it is not a go signal.",
    knowCold: "SGSI: red low · amber-red on · amber slightly high · green well high.",
    difficulty: 3,
  }),

  applied("fr-als", {
    id: "fq-ap-033",
    type: "mcq",
    unit: "f4",
    prompt: "The approach lighting system exists to",
    options: [
      "mark the runway edges for night taxi",
      "provide the transition from instrument flight to visual flight for landing",
      "identify the airport from en route",
      "indicate glideslope deviation",
    ],
    answer: 1,
    explanation:
      "ALS bridges instrument flight and visual flight for landing, beginning at the landing threshold and extending into the approach area. Airport identification is the beacon's job; glideslope is IFLOLS, SGSI or an electronic system.",
    knowCold: "ALS = the instrument-to-visual bridge at the threshold.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* F5 — VFR AND IFR                                                  */
  /* ================================================================ */

  applied("fr-forecast", {
    id: "fq-ap-034",
    type: "mcq",
    unit: "f5",
    prompt:
      "ETA at the destination is 1400Z. The forecast that must be evaluated covers",
    options: ["1400Z only", "1300Z to 1500Z", "1200Z to 1600Z", "the whole day of arrival"],
    answer: 1,
    explanation:
      "ETA ± 1 hour, and it is the WORST conditions expected in that window that count — not the average and not the value at the ETA itself. Conditions are stated ceiling then visibility, so '1000/3' is a 1,000 ft ceiling and 3 SM.",
    knowCold: "ETA ± 1 hour, worst case in the window.",
    difficulty: 3,
  }),

  applied("fr-see-and-avoid", {
    id: "fq-ap-035",
    type: "spotTheTrap",
    unit: "f5",
    prompt:
      '"A pilot operating on an IFR flight plan in visual conditions has no see-and-avoid obligation, since ATC provides separation."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. When weather permits, pilots must observe and manoeuvre to avoid other aircraft REGARDLESS of flight plan type. CNAF adds that airborne radar should be used when feasible in multi-seat aircraft and that radar advisory service should be requested when available.",
    knowCold: "See and avoid applies whatever the flight plan says.",
    difficulty: 3,
  }),

  applied("fr-basic-vfr", {
    id: "fq-ap-036",
    type: "mcq",
    unit: "f5",
    prompt:
      "The field reports a 900 ft ceiling and 5 SM visibility. A VFR takeoff is",
    options: [
      "permitted, since visibility exceeds 3 SM",
      "not permitted, since the ceiling is below 1,000 ft",
      "permitted with a special VFR clearance from ground",
      "permitted, since only one of the two criteria must be met",
    ],
    answer: 1,
    explanation:
      "Basic VFR is 1,000/3 and BOTH halves must be satisfied — a 900 ft ceiling fails regardless of how good the visibility is. Any more stringent minimums established for that airport apply on top.",
    whyWrong:
      "Treating the pair as either/or is the error the good visibility is there to invite.",
    knowCold: "1000/3 — ceiling AND visibility, not either.",
    difficulty: 3,
  }),

  applied("fr-vfr-destination", {
    id: "fq-ap-037",
    type: "mcq",
    unit: "f5",
    prompt:
      "Destination forecast for the ETA window shows a 1,200 ft ceiling at ETA−1, 800 ft at ETA, and 1,500 ft at ETA+1. Filing VFR is",
    options: [
      "acceptable, since the average exceeds 1,000 ft",
      "acceptable, since conditions improve by ETA+1",
      "not acceptable, since the worst case in the window is below 1,000 ft",
      "acceptable only with an alternate filed",
    ],
    answer: 2,
    explanation:
      "Destination weather must be at least 1,000/3 and forecast to REMAIN so throughout ETA ± 1 hour. The 800 ft figure inside the window breaks it — the criterion is the worst case, not the average or the endpoint.",
    knowCold: "Must hold 1000/3 across the whole ETA ± 1 window.",
    difficulty: 3,
  }),

  applied("fr-vfr-enroute", {
    id: "fq-ap-038",
    type: "mcq",
    unit: "f5",
    prompt:
      "En route on a VFR flight plan, the visibility criteria the pilot must satisfy are set by",
    options: [
      "the departure field's minimums",
      "the class of airspace being flown in",
      "a single fleet-wide standard of 3 SM",
      "the destination forecast",
    ],
    answer: 1,
    explanation:
      "VMC must be maintained throughout, according to the weather criteria for the CLASS OF AIRSPACE being flown in — the requirement changes as the airspace changes beneath and around the aircraft.",
    knowCold: "En route VFR minimums follow the airspace class you are in.",
    difficulty: 3,
  }),

  applied("fr-vfr-fuel", {
    id: "fq-ap-039",
    type: "mcq",
    unit: "f5",
    prompt:
      "Planned fuel to destination is 100 minutes' worth. The minimum VFR reserve on top of that is",
    options: ["10 minutes", "20 minutes", "30 minutes", "45 minutes"],
    answer: 1,
    explanation:
      "The reserve is 10% of planned requirements — 10 minutes here — but in no case less than 20 minutes, so the floor governs. For turbine-powered fixed-wing aircraft the reserve is computed at maximum endurance at 10,000 ft MSL.",
    whyWrong:
      "10 minutes is the arithmetic answer that forgets the floor. The 10% and the 20-minute minimum are both live; take the larger.",
    knowCold: "10% of planned fuel, never less than 20 minutes.",
    difficulty: 3,
  }),

  applied("fr-ifr-general", {
    id: "fq-ap-040",
    type: "mcq",
    unit: "f5",
    prompt:
      "Weather is clear and a VFR flight is entirely practicable. Navy policy is nonetheless to",
    options: [
      "file VFR, to reduce controller workload",
      "file IFR to the maximum extent practicable",
      "file VFR unless crossing controlled airspace",
      "leave the choice entirely to the PIC with no policy preference",
    ],
    answer: 1,
    explanation:
      "All flights in naval aircraft shall be conducted under IFR to the maximum extent practicable, specifically to decrease the probability of midair collision. That is stricter than the FAR requires, and good weather does not relax it.",
    knowCold: "Navy files IFR wherever practicable — stricter than the FAR.",
    difficulty: 3,
  }),

  applied("fr-approach-types", {
    id: "fq-ap-041",
    type: "mcq",
    unit: "f5",
    prompt:
      "Of the approaches available, which will generally offer the lowest landing minimums?",
    options: ["VOR", "TACAN", "ILS", "ASR"],
    answer: 2,
    explanation:
      "ILS is a precision approach — it provides an electronic glideslope, as does PAR. The more accurate the course and glideslope information, the lower the minimums. VOR, TACAN, LOC, NDB and ASR are non-precision and therefore sit higher.",
    knowCold: "Electronic glideslope → precision → lowest minimums.",
    difficulty: 3,
  }),

  applied("fr-missed-approach", {
    id: "fq-ap-042",
    type: "mcq",
    unit: "f5",
    prompt:
      "At decision height the pilot does not have the runway environment in sight. They may",
    options: [
      "descend 100 ft further to look",
      "continue only if the controller reports the field in sight",
      "not continue below decision height, and must execute the missed approach",
      "hold at decision height until the field appears",
    ],
    answer: 2,
    explanation:
      "Pilots shall not descend below MDA or continue below DH unless the runway environment is in sight AND a safe landing can be made. A controller-directed missed approach is mandatory, and separately the pilot may elect one at their own discretion at any time.",
    knowCold: "No runway environment at DH = go missed. Not negotiable.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* F6 — ALTITUDES AND AEROBATICS                                     */
  /* ================================================================ */

  applied("fr-aerobatic-definition", {
    id: "fq-ap-043",
    type: "mcq",
    unit: "f6",
    prompt:
      "Which of these intentional manoeuvres meets the definition of aerobatic flight?",
    options: [
      "A 55° banked turn at 1.8 g",
      "A 70° banked turn",
      "A 40° nose-high pitch attitude",
      "A break manoeuvre flown per the model NATOPS flight manual",
    ],
    answer: 1,
    explanation:
      "Any ONE of the three thresholds is enough: bank beyond 60°, pitch beyond ±45°, or acceleration beyond 2.0 g. A 70° bank clears the first. The 55°/1.8 g case and the 40° pitch both sit under their thresholds, and a NATOPS-conforming break is explicitly excluded.",
    knowCold: "Bank > 60° · pitch > ±45° · accel > 2.0 g. Any one of the three.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* F7 — AIRSPACE                                                     */
  /* ================================================================ */

  applied("fr-controlled", {
    id: "fq-ap-044",
    type: "mcq",
    unit: "f7",
    prompt: "Controlled airspace is the generic term covering",
    options: [
      "Classes A, B, C and D only",
      "Classes A, B, C, D and E",
      "Classes A through G",
      "any airspace with radar coverage",
    ],
    answer: 1,
    explanation:
      "Classes A, B, C, D and E — airspace of defined dimensions in which ATC service is provided according to the classification, and where the controlling ATC has both the authority and the ability to control it. Class G is the one left out.",
    knowCold: "Controlled = A, B, C, D, E. Uncontrolled = G.",
    difficulty: 3,
  }),

  applied("fr-uncontrolled", {
    id: "fq-ap-045",
    type: "mcq",
    unit: "f7",
    prompt:
      "Airspace is designated uncontrolled when the controlling ATC has",
    options: [
      "no radar coverage, regardless of authority",
      "no authority, no ability, or neither",
      "delegated control to a military agency",
      "suspended service temporarily",
    ],
    answer: 1,
    explanation:
      "Uncontrolled airspace is all airspace under FAA jurisdiction that is not A, B, C, D or E, and in which no ATC service is provided — because the controlling ATC has no authority, no ability, or neither. That is Class G.",
    knowCold: "No authority, no ability, or neither → uncontrolled → Class G.",
    difficulty: 3,
  }),

  applied("fr-class-g", {
    id: "fq-ap-046",
    type: "mcq",
    unit: "f7",
    prompt: "Class G airspace typically exists where",
    options: [
      "traffic density is highest",
      "radar coverage is incomplete or air traffic is minimal",
      "military operations are conducted",
      "the terrain exceeds 10,000 ft",
    ],
    answer: 1,
    explanation:
      "Class G is uncontrolled airspace, generally found where radar coverage is incomplete or traffic is minimal, and the FAA provides only minimal guidance to pilots operating in it.",
    knowCold: "Class G = thin radar, thin traffic, minimal guidance.",
    difficulty: 3,
  }),

  applied("fr-mode-c", {
    id: "fq-ap-047",
    type: "mcq",
    unit: "f7",
    prompt:
      "An aircraft is operating at 8,000 ft MSL, 20 nm from a Class B primary airport. An operable Mode C transponder is",
    options: [
      "not required below 10,000 ft MSL",
      "required, being within 30 nm of a Class B airport",
      "required only inside the Class B boundary itself",
      "not required outside controlled airspace",
    ],
    answer: 1,
    explanation:
      "The 30 nm ring around a Class B airport requires Mode C from the surface to 10,000 ft MSL — 20 nm and 8,000 ft is inside it. The other triggers are at and above 10,000 ft MSL generally, and above the ceiling and lateral boundaries of Class B and C up to 10,000 ft MSL.",
    whyWrong:
      "The 10,000 ft rule is real but it is not the only one; the Class B veil catches this aircraft first.",
    knowCold: "Mode C: ≥10,000 MSL · within 30 nm of Class B · above B and C to 10,000.",
    difficulty: 3,
  }),

  applied("fr-prohibited-area", {
    id: "fq-ap-048",
    type: "mcq",
    unit: "f7",
    prompt:
      "Airspace within which flight is prohibited outright, established for security or national welfare reasons, is a",
    options: ["restricted area", "prohibited area", "warning area", "alert area"],
    answer: 1,
    explanation:
      "A prohibited area bars flight entirely, for security or other reasons associated with the national welfare. Restricted areas permit entry with authorisation — the distinction between 'not without permission' and 'not at all' is the whole point.",
    knowCold: "Prohibited = never. Restricted = not without permission.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* F8 — GENERAL FLIGHT RULES                                         */
  /* ================================================================ */

  applied("fr-altitude-congested", {
    id: "fq-ap-049",
    type: "mcq",
    unit: "f8",
    prompt:
      "Overflying a town, the tallest obstacle within 2,000 ft horizontally of the aircraft is a 450 ft mast on ground at 600 ft MSL. The minimum altitude is",
    options: ["1,000 ft MSL", "1,450 ft MSL", "2,050 ft MSL", "1,600 ft MSL"],
    answer: 2,
    explanation:
      "1,000 ft above the highest obstacle within a 2,000 ft horizontal radius. The mast tops out at 600 + 450 = 1,050 ft MSL, so the minimum is 2,050 ft MSL. The rule is measured from the obstacle top, not from the ground or from the aircraft's own position.",
    whyWrong:
      "1,450 ft adds the 1,000 to the ground elevation and forgets the mast; 1,600 adds it to the mast height and forgets the terrain.",
    knowCold: "1,000 ft above the highest obstacle within 2,000 ft.",
    difficulty: 3,
  }),

  applied("fr-noise-sensitive", {
    id: "fq-ap-050",
    type: "mcq",
    unit: "f8",
    prompt:
      "Pilots shall avoid noise-sensitive and wilderness areas below 3,000 ft AGL, EXCEPT when",
    options: [
      "the flight is operating VFR in daylight",
      "complying with an approved traffic or approach pattern",
      "the aircraft is single-engine",
      "the area is more than 10 nm from a National Park",
    ],
    answer: 1,
    explanation:
      "The stated exceptions are approved traffic or approach patterns, VFR and IFR training routes, and special use airspace. Examples of the areas themselves include breeding farms, resorts, beaches, National Parks, National Monuments and National Recreational Areas.",
    knowCold: "Below 3,000 AGL avoid noise-sensitive areas — patterns and training routes excepted.",
    difficulty: 3,
  }),

  applied("fr-wildlife", {
    id: "fq-ap-051",
    type: "mcq",
    unit: "f8",
    prompt:
      "When it is necessary to fly over known wildlife habitations, the minimum altitude conditions permitting is",
    options: ["1,000 ft AGL", "2,000 ft AGL", "3,000 ft AGL", "500 ft AGL"],
    answer: 2,
    explanation:
      "At least 3,000 ft AGL, conditions permitting. Commanding officers are separately required to take steps to prevent aircraft frightening wild fowl or driving them from feeding grounds.",
    knowCold: "Wildlife habitations: 3,000 ft AGL, conditions permitting.",
    difficulty: 3,
  }),

  applied("fr-tfr", {
    id: "fq-ap-052",
    type: "mcq",
    unit: "f8",
    prompt:
      "A major sporting event has generated a temporary flight restriction. The exact dimensions of the restricted volume are found",
    options: [
      "in the FAR",
      "in the NOTAM designating it",
      "on the en route chart",
      "in CNAF M-3710.7",
    ],
    answer: 1,
    explanation:
      "CNAF states that aircraft shall not operate within an area designated by NOTAM within which temporary flight restrictions apply — and the NOTAM is where the dimensions live. TFRs arise around natural disasters, riots, major sporting events, parades and forest fires, all of which are too short-notice for charted publication.",
    knowCold: "The TFR's NOTAM carries its dimensions.",
    difficulty: 3,
  }),
];
