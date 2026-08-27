import type { Concept, SourceReference } from "@/lib/types";

/**
 * FR&R concepts.
 *
 * Every entry traces to Module 7 of the trainee guide (EOs 2.345–2.386). Where
 * the guide states a number, the number appears exactly as written; where it
 * refers to a table that is only reproduced as a figure, the concept teaches
 * the rule around it rather than inventing values.
 */

const TG = (chapter: string, eo: string[]): SourceReference => ({
  document: "Flight Rules and Regulations Trainee Guide",
  chapter,
  eo,
});
const ORG = (eo: string[]) => TG("Federal Aviation Organization", eo);
const VIFR = (eo: string[]) => TG("Visual / Instrument Flight Rules", eo);
const AIR = (eo: string[]) => TG("Airspace and General Flight Rules", eo);

export const CONCEPTS: Concept[] = [
  /* ================= f1 · Rules and Regulators ================= */
  {
    id: "fr-far",
    unit: "f1",
    name: "Federal Aviation Regulations",
    definition:
      "Broad regulations published by the FAA covering military and civilian aviation. Part 91 contains the general operating and flight rules, and is the part that most concerns the naval aircrew member.",
    commonTraps: [
      "The FAA publishes both the FAR and the AIM. The FAR is regulatory; the AIM is not.",
    ],
    source: ORG(["2.345", "2.346"]),
  },
  {
    id: "fr-aim",
    unit: "f1",
    name: "Aeronautical Information Manual",
    definition:
      "Published by the FAA. Non-regulatory, plain-language material that amplifies and explains information for pilots.",
    relationships: ["FAR = regulatory · AIM = explanatory"],
    source: ORG(["2.345", "2.346"]),
  },
  {
    id: "fr-flip",
    unit: "f1",
    name: "Flight Information Publications",
    definition:
      "FLIP, published by the Department of Defense for all branches. Includes en route charts, approach plates and planning guides for both IFR and VFR.",
    source: ORG(["2.346", "2.347"]),
  },
  {
    id: "fr-cnaf",
    unit: "f1",
    name: "CNAF M-3710.7",
    definition:
      "The NATOPS General Flight and Operating Instructions Manual. Contains general operating procedures applying to all naval aircraft worldwide, and is subordinate only to aircraft NATOPS.",
    commonTraps: [
      "CNAF is usually MORE stringent than the FAR, not less. When both speak, follow the tighter one.",
    ],
    source: ORG(["2.346", "2.347"]),
  },
  {
    id: "fr-natops",
    unit: "f1",
    name: "Aircraft NATOPS",
    definition:
      "Naval Air Training and Operating Procedures Standardization, specific to one aircraft model. It takes precedence over all other publications.",
    source: ORG(["2.347"]),
  },
  {
    id: "fr-priority",
    unit: "f1",
    name: "Priority of regulations",
    definition:
      "Highest to lowest: aircraft NATOPS, then CNAF M-3710.7, then FLIP, then the FAR.",
    relationships: ["NATOPS → CNAF M-3710.7 → FLIP → FAR Part 91"],
    commonTraps: [
      "The aircraft-specific document wins. NATOPS beats the fleet-wide manual, which beats the DOD publication, which beats the FAA.",
    ],
    source: ORG(["2.347"]),
  },
  {
    id: "fr-wording",
    unit: "f1",
    name: "Shall, should, may, will",
    definition:
      "Shall is used only when a procedure is mandatory. Should is used only when it is recommended. May is used only when it is optional. Will is used only to indicate futurity, and never to indicate any degree of requirement.",
    relationships: [
      "Shall = mandatory",
      "Should = recommended",
      "May = optional",
      "Will = futurity only",
    ],
    commonTraps: [
      "'Will' carries NO requirement. It only says something is going to happen.",
    ],
    source: ORG(["2.348"]),
  },
  {
    id: "fr-atc",
    unit: "f1",
    name: "Air Traffic Control",
    definition:
      "The agency that enforces the FAR, approves flight plans and grants clearances, including all IFR clearances. It has four subordinate agencies.",
    source: ORG(["2.349"]),
  },
  {
    id: "fr-fss",
    unit: "f1",
    name: "Flight Service Station",
    definition:
      "Provides pilot briefings covering weather, route and NOTAMs, processes flight plans, relays en route communications, supports search and rescue and flight following. Known at military fields as base operations.",
    source: ORG(["2.349"]),
  },
  {
    id: "fr-tower",
    unit: "f1",
    name: "Control Tower",
    definition:
      "Responsible for the safe, orderly and expeditious flow of traffic operating on and in the vicinity of an airport — both air and ground traffic. It has three positions: clearance delivery, ground and tower.",
    commonTraps: [
      "The tower owns movement at and around the airport. Terminal instrument traffic belongs to Approach Control.",
    ],
    source: ORG(["2.349"]),
  },
  {
    id: "fr-approach",
    unit: "f1",
    name: "Approach Control",
    definition:
      "Terminal Radar Approach Control (TRACON), also called Approach or Departure Control. Responsible for controlling all instrument flight within its area, which may cover one or more airfields, primarily by direct pilot-controller communication.",
    source: ORG(["2.349"]),
  },
  {
    id: "fr-artcc",
    unit: "f1",
    name: "Air Route Traffic Control Center",
    definition:
      "Provides positive control to IFR aircraft within controlled airspace, principally during the en route phase. When equipment and workload permit it can also provide advisory service to VFR aircraft.",
    relationships: ["Approach Control = terminal IFR · ARTCC = en route IFR"],
    source: ORG(["2.349"]),
  },
  {
    id: "fr-notam",
    unit: "f1",
    name: "NOTAM",
    definition:
      "Notice to Airmen. Contains information about the establishment, condition or change of any aeronautical facility, service, procedure or hazard that is temporary in nature, or not known far enough in advance to publicise by other means.",
    source: ORG(["2.351"]),
  },
  {
    id: "fr-transponder",
    unit: "f1",
    name: "Transponder and ADS-B",
    definition:
      "A transponder is an airborne radar beacon receiver/transmitter that answers interrogations with a squawk. Mode 3 identifies the aircraft; Mode C reports pressure altitude. ADS-B broadcasts GPS position, altitude, ground speed and other data once per second.",
    relationships: ["Mode 3 → identity · Mode C → altitude"],
    source: ORG(["2.349"]),
  },

  /* ================= f2 · Planning and Responsibility ================= */
  {
    id: "fr-pic",
    unit: "f2",
    name: "Pilot in Command",
    definition:
      "Under the FAR the PIC is directly responsible for, and is the final authority as to, the operation of that aircraft. Under CNAF M-3710.7 the PIC is responsible for the safe, orderly flight of the aircraft and the well-being of the crew.",
    commonTraps: [
      "The PIC is responsible for the aircraft, the conduct of the flight AND the crew — the exam answer is usually 'all of the above'.",
    ],
    source: ORG(["2.350"]),
  },
  {
    id: "fr-preflight",
    unit: "f2",
    name: "Preflight planning",
    definition:
      "A PIC responsibility on every flight. At minimum it includes available weather reports and forecasts, NOTAMs, fuel requirements, alternates available if the flight cannot be completed as planned, and any anticipated traffic delays.",
    commonTraps: [
      "Preflight planning is required for ALL flights — local training flights and urgent combat missions included.",
    ],
    source: ORG(["2.351"]),
  },
  {
    id: "fr-flight-plan",
    unit: "f2",
    name: "Flight plans",
    definition:
      "Give ATC the departure and destination airfields and intermediate agencies. Filed at base operations or a Flight Service Station. Their primary purpose is to establish a baseline for lost communication and lost aircraft procedures.",
    commonTraps: [
      "The primary purpose is search-and-rescue baseline, not obtaining a clearance.",
    ],
    source: ORG(["2.352"]),
  },
  {
    id: "fr-weather-brief",
    unit: "f2",
    name: "DD-175-1 weather brief",
    definition:
      "Naval flight weather briefs are completed on a DD-175-1. The brief is void 3 hours after brief time, or 30 minutes after ETD, whichever is earlier. The primary source is the Fleet Weather Brief, with USAF, USMC weather services or an FSS as alternates.",
    relationships: ["Void at brief time + 3 hours, OR ETD + 30 minutes — whichever comes first"],
    commonTraps: [
      "Two clocks run against the brief and the EARLIER one voids it.",
    ],
    source: ORG(["2.353"]),
  },
  {
    id: "fr-icing-thunderstorms",
    unit: "f2",
    name: "Icing and thunderstorm avoidance",
    definition:
      "CNAF M-3710.7 requires that flights shall be planned to circumvent areas of forecast atmospheric icing and thunderstorm conditions whenever practicable.",
    source: ORG(["2.353"]),
  },
  {
    id: "fr-deviation",
    unit: "f2",
    name: "Deviation authority",
    definition:
      "CNAF M-3710.7 authorises deviation from specified flight and operating instructions in emergency situations, when in the judgment of the pilot in command safety justifies such a deviation.",
    relationships: ["Emergency + PIC judgment that safety requires it → deviation authorised"],
    commonTraps: [
      "It is emergencies that permit a deviation, and the judgment is the PIC's.",
    ],
    source: ORG(["2.354"]),
  },
  {
    id: "fr-authorized-airfields",
    unit: "f2",
    name: "Authorized airfields",
    definition:
      "Prior permission is required. The PIC must be familiar with local or special procedures, runway length, runway and taxiway load-bearing capability, availability of DoD contract services, and security and force protection.",
    source: ORG(["2.355"]),
  },
  {
    id: "fr-fuel-purchase",
    unit: "f2",
    name: "Fuel purchases",
    definition:
      "PICs shall make every effort to purchase fuel from military or government contract sources, except for mission requirements, emergency landings and alternate airfield landings.",
    source: ORG(["2.355"]),
  },
  {
    id: "fr-closing-plans",
    unit: "f2",
    name: "Closing flight plans",
    definition:
      "The PIC must ensure the proper agency is notified that the flight has terminated. At military installations this is done verbally to the tower or base operations, or by delivering the flight plan to base operations. At non-military fields it is done with an FSS by any means of communication.",
    commonTraps: [
      "Both the PIC and the formation leader carry responsibility for ensuring plans are closed.",
    ],
    source: ORG(["2.355"]),
  },

  /* ================= f3 · Safety and the Human ================= */
  {
    id: "fr-harness",
    unit: "f3",
    name: "Safety belts and harnesses",
    definition:
      "Shall be worn and tightened prior to takeoff and until completion of flight, except when necessary activities require removal. Inertial reels, where provided, shall be manually locked for takeoff and landing and when high G forces are anticipated, except where doing so would be detrimental to safety.",
    source: ORG(["2.356"]),
  },
  {
    id: "fr-ppe",
    unit: "f3",
    name: "Minimum aircrew PPE",
    definition:
      "Protective helmet, aircrew safety or flyer boots, fire-resistant flight suit and gloves, survival knife, personal survival kit, signal device, survival radio, emergency beacon, flashlight and identification tags. An inflatable life preserver is worn aboard ship, in ejection-seat aircraft, and on missions below 1,000 feet over water.",
    source: ORG(["2.356"]),
  },
  {
    id: "fr-life-rafts",
    unit: "f3",
    name: "Life rafts",
    definition:
      "Carried with sufficient capacity for all passengers and crew when there is significant risk of water entry during a mishap.",
    source: ORG(["2.356"]),
  },
{
    id: "fr-performance-factors",
    unit: "f3",
    name: "Factors affecting aircrew performance",
    definition:
      "Weather, extremes of temperature, nighttime operations, use of vision imaging systems, mission delays, personal equipment and life support systems, duration of the duty period, quality and duration of sleep, the circadian clock, and dehydration.",
    source: ORG(["2.358"]),
  },
  {
    id: "fr-crew-rest",
    unit: "f3",
    name: "Crew rest and crew day",
    definition:
      "A crew rest period shall include the opportunity for 8 hours of uninterrupted sleep in every 24-hour period. Crew day should not exceed 18 hours.",
    relationships: ["8 hours uninterrupted sleep per 24 · crew day not beyond 18 hours"],
    source: ORG(["2.359"]),
  },
  {
    id: "fr-alcohol",
    unit: "f3",
    name: "Alcohol",
    definition:
      "No alcohol within 12 hours of any mission brief or flight planning, and flight crews shall ensure they are free of the effects of alcohol prior to flight.",
    commonTraps: [
      "The 12 hours runs from the BRIEF or flight planning, not from takeoff.",
    ],
    source: ORG(["2.359"]),
  },
  {
    id: "fr-caffeine-drugs",
    unit: "f3",
    name: "Caffeine, drugs and supplements",
    definition:
      "Recommended maximum caffeine intake is 450 mg per day, roughly three to four cups of coffee. Use of BOTH prescription and over-the-counter drugs is prohibited for flight personnel unless specifically approved by a flight surgeon.",
    commonTraps: [
      "Over-the-counter medication is prohibited too, not just prescription.",
    ],
    source: ORG(["2.359"]),
  },
/* ================= f4 · The Airport ================= */
  {
    id: "fr-runway-numbering",
    unit: "f4",
    name: "Runway orientation",
    definition:
      "Runway numbering is based on the magnetic heading flown on takeoff or landing, rounded to the nearest 10 degrees with the last digit dropped.",
    relationships: ["Magnetic heading 093° → round to 090 → runway 09"],
    source: VIFR(["2.360"]),
  },
  {
    id: "fr-aldis",
    unit: "f4",
    name: "Aldis lamp signals",
    definition:
      "Coded light signals used by the tower for aircraft that cannot be reached by radio. Steady green means cleared to land. Steady red means give way to other aircraft and continue circling. Flashing white means return for landing.",
    commonTraps: [
      "Flashing white is 'return for landing', not 'cleared to land'. Steady green is the clearance.",
    ],
    source: VIFR(["2.361"]),
  },
  {
    id: "fr-airport-signs",
    unit: "f4",
    name: "Airport signs",
    definition:
      "Mandatory instruction signs carry white letters on a red background.",
    source: VIFR(["2.361"]),
  },
  {
    id: "fr-displaced-threshold",
    unit: "f4",
    name: "Displaced threshold",
    definition:
      "A threshold located at a point on the runway other than the designated runway end. The pavement before it is available for takeoff or rollout, but NOT for landing.",
    commonTraps: [
      "You may take off from it and roll out over it. You may not land on it.",
    ],
    source: VIFR(["2.361"]),
  },
  {
    id: "fr-waveoff",
    unit: "f4",
    name: "Waveoff signals",
    definition:
      "A waveoff means DO NOT LAND and compliance is mandatory except in an emergency. Any high-intensity red lights at the approach end should be treated as a waveoff signal.",
    source: VIFR(["2.361"]),
  },
  {
    id: "fr-wind-indicators",
    unit: "f4",
    name: "Wind and landing indicators",
    definition:
      "A wind sock is a free-swinging indicator giving wind direction and approximate velocity. A tetrahedron indicates the direction of landing and takeoff, and carries green lights on the port base and red on the starboard base and spine.",
    commonTraps: [
      "The wind sock gives wind. The tetrahedron gives landing direction — its spar points the way you land.",
    ],
    source: VIFR(["2.361"]),
  },
  {
    id: "fr-runway-lighting",
    unit: "f4",
    name: "Runway and taxiway lighting",
    definition:
      "Runway edges are outlined in white. Runway end lights are green viewed on approach (threshold lights) and red viewed from the runway (overrun lights). Touchdown zone lighting is white. Runway centerline lighting is white, alternating white and red for the last 3,000 feet, and red for the final 1,000 feet. Taxiways are outlined in blue with green centerlines, and taxiway turnoff lights are green.",
    commonTraps: [
      "Green means threshold when you are approaching and red means end of useable runway when you are on it — the same lights, seen from opposite ends.",
    ],
    source: VIFR(["2.361"]),
  },
  {
    id: "fr-beacon",
    unit: "f4",
    name: "Airport rotating beacon",
    definition:
      "Indicates the location of a lighted airport. A civilian beacon alternates solid white with solid green; a military beacon shows dual-peaked (two quick) white flashes alternating with a green flash. It operates sunset to sunrise, and during daylight when visibility is restricted.",
    source: VIFR(["2.361"]),
  },
  {
    id: "fr-vasi",
    unit: "f4",
    name: "VASI",
    definition:
      "A visual glideslope indicator. Red over white indicates on glideslope; white over white indicates above glideslope; red over red indicates below glideslope.",
    commonTraps: [
      "Red over white is on slope. All red means you are low — 'red over red, you're dead'.",
    ],
    source: VIFR(["2.361"]),
  },
{
    id: "fr-als",
    unit: "f4",
    name: "Approach Light Systems",
    definition:
      "Provide the transition from instrument flight to visual flight for landing. They begin at the landing threshold and extend into the approach area.",
    source: VIFR(["2.361"]),
  },

  /* ================= f5 · VFR and IFR ================= */
  {
    id: "fr-vmc",
    unit: "f5",
    name: "Visual Meteorological Conditions",
    definition:
      "Meteorological conditions expressed in terms of visibility, distance from clouds and ceiling, equal to or better than specified minima. VMC describes the WEATHER.",
    source: VIFR(["2.362"]),
  },
  {
    id: "fr-imc",
    unit: "f5",
    name: "Instrument Meteorological Conditions",
    definition:
      "Conditions expressed in terms of visibility, distance from clouds and ceiling less than the minima specified for VMC. CNAF M-3710.7 adds that IMC exists any time a visible horizon is not distinguishable.",
    commonTraps: [
      "CNAF's extra clause matters: no distinguishable horizon means IMC even if the numbers look fine.",
    ],
    source: VIFR(["2.362"]),
  },
  {
    id: "fr-vfr-ifr-terms",
    unit: "f5",
    name: "VFR and IFR as terms",
    definition:
      "VFR and IFR are RULES governing procedures. Each term is also used three other ways: to describe weather relative to 1,000/3, to describe the rules an airport is operating under, and to describe a type of flight plan.",
    relationships: ["VMC/IMC describe weather · VFR/IFR describe rules"],
    commonTraps: [
      "An IFR flight plan can be flown in VMC. The flight plan and the weather are independent.",
    ],
    source: VIFR(["2.362"]),
  },
  {
    id: "fr-forecast",
    unit: "f5",
    name: "Forecast",
    definition:
      "The WORST conditions expected from one hour before to one hour after the estimated time of arrival (ETA ± 1 hour). Stated as ceiling then visibility, so '1000/3' means a 1,000 foot ceiling and 3 statute miles visibility.",
    source: VIFR(["2.362", "2.364"]),
  },
  {
    id: "fr-see-and-avoid",
    unit: "f5",
    name: "See and avoid",
    definition:
      "When weather conditions permit, regardless of flight plan type, pilots are required to observe the presence of and manoeuvre to avoid other aircraft. CNAF adds that airborne radar should be used when feasible in multi-seat aircraft, and that all aircraft shall request radar advisory service when available.",
    commonTraps: [
      "See and avoid applies REGARDLESS of flight plan type — being on an IFR plan does not excuse it.",
    ],
    source: VIFR(["2.363"]),
  },
  {
    id: "fr-basic-vfr",
    unit: "f5",
    name: "Basic VFR minimums",
    definition:
      "1,000 foot ceiling and 3 statute miles visibility — written 1000/3. For VFR takeoff the ceiling at the point of departure must be at least 1,000 feet AGL and prevailing visibility 3 SM or greater, or above any more stringent minimums established for that airport.",
    relationships: ["Basic VFR = 1,000 ft ceiling / 3 SM visibility"],
    source: VIFR(["2.364"]),
  },
  {
    id: "fr-vfr-destination",
    unit: "f5",
    name: "VFR destination weather",
    definition:
      "Destination weather must also be at least 1,000/3, or above established minimums, and forecast to remain so from one hour before to one hour after the ETA.",
    source: VIFR(["2.364"]),
  },
  {
    id: "fr-vfr-enroute",
    unit: "f5",
    name: "VFR en route weather",
    definition:
      "Maintain VMC throughout the flight, according to the weather criteria for the class of airspace being flown in.",
    source: VIFR(["2.364"]),
  },
  {
    id: "fr-precluding-vfr",
    unit: "f5",
    name: "Weather precluding VFR flight",
    definition:
      "On encountering weather en route that precludes VFR minimums the PIC has three alternatives: alter the route of flight to continue in VMC; remain in VMC until a change of flight plan is filed and an IFR clearance obtained; or remain in VMC and land at a suitable alternate.",
    relationships: ["Alter route · get an IFR clearance · land at an alternate"],
    commonTraps: [
      "All three options keep you in VMC. Pressing on into IMC without a clearance is not on the list.",
    ],
    source: VIFR(["2.365"]),
  },
  {
    id: "fr-vfr-fuel",
    unit: "f5",
    name: "VFR fuel planning",
    definition:
      "Enough usable fuel to fly from takeoff to the destination airfield plus a reserve of 10% of planned fuel requirements. In no case shall that reserve be less than 20 minutes of flight time. For turbine-powered fixed-wing aircraft the reserve is computed at maximum endurance at 10,000 feet MSL.",
    relationships: ["Destination + 10% reserve, never less than 20 minutes"],
    source: VIFR(["2.364"]),
  },
  {
    id: "fr-ifr-general",
    unit: "f5",
    name: "IFR general requirements",
    definition:
      "All flights in naval aircraft shall be conducted under instrument flight rules to the maximum extent practicable, to decrease the probability of midair collision. Flights shall not be made in IFR conditions within controlled airspace until an ATC clearance has been obtained.",
    commonTraps: [
      "Navy policy is to file IFR wherever practicable, which is stricter than the FAR requires.",
    ],
    source: VIFR(["2.366"]),
  },
  {
    id: "fr-vfr-on-top",
    unit: "f5",
    name: "VFR-on-top",
    definition:
      "ATC authorisation for an IFR aircraft to operate in VFR conditions at any appropriate VFR altitude. The pilot must comply with VFR visibility and distance-from-cloud criteria and with minimum IFR altitudes.",
    commonTraps: [
      "VFR-on-top is still an IFR flight. The VFR semicircular cruising altitudes apply.",
    ],
    source: VIFR(["2.366", "2.368"]),
  },
  {
    id: "fr-approach-types",
    unit: "f5",
    name: "Precision and non-precision approaches",
    definition:
      "A precision approach provides an electronic glideslope, such as ILS or PAR. A non-precision approach does not, such as VOR, TACAN, LOC, NDB or ASR. The more accurate the course and glideslope information, the lower the minimums, so precision approaches usually have the lowest landing minimums.",
    relationships: ["Electronic glideslope → precision → lowest minimums"],
    source: VIFR(["2.367"]),
  },
  {
    id: "fr-landing-minimums",
    unit: "f5",
    name: "Landing minimums",
    definition:
      "The lowest ceiling and visibility that can exist for a pilot to legally fly an approach. They depend on the approach being flown and the approach speed of the aircraft. Absolute minimums for a single-piloted aircraft flying a precision approach are a 200 foot ceiling (height above touchdown) and ½ SM visibility or 2,400 feet RVR, or the published minimums, whichever is higher.",
    commonTraps: [
      "Single-piloted absolute minimums are 200 ft and ½ SM — or published, whichever is HIGHER.",
    ],
    source: VIFR(["2.367"]),
  },
  {
    id: "fr-approach-criteria",
    unit: "f5",
    name: "Commencing an approach",
    definition:
      "A single-piloted aircraft shall not commence an approach if reported weather is below published minimums; once commenced, the pilot may continue to published minimums. A multi-piloted aircraft shall not commence an approach at or below published minimums unless it can proceed to a suitable alternate after a missed approach.",
    source: VIFR(["2.367"]),
  },
  {
    id: "fr-missed-approach",
    unit: "f5",
    name: "Missed approach",
    definition:
      "Pilots shall not descend below the minimum descent altitude or continue below decision height unless they have the runway environment in sight and judge a safe landing can be made. When a controller directs a missed approach, execution is mandatory — but pilots may execute one at their own discretion at any time.",
    source: VIFR(["2.367"]),
  },
  {
    id: "fr-alternate",
    unit: "f5",
    name: "Alternate airfield requirements",
    definition:
      "The IFR Filing Criteria table in CNAF M-3710.7 determines whether an alternate is required, using the destination forecast for ETA ± 1 hour. When an alternate is required it must have a published approach flyable without two-way radio, compatible with installed operable navigation equipment, whenever the destination lacks such an approach or the alternate's forecast is below a 3,000 foot ceiling and 3 SM visibility during ETA ± 1 hour.",
    commonTraps: [
      "The table that decides whether an alternate is needed is the IFR Filing Criteria.",
    ],
    source: VIFR(["2.367"]),
  },
  {
    id: "fr-ifr-fuel",
    unit: "f5",
    name: "IFR fuel requirements",
    definition:
      "With no alternate required, the same as VFR. With an alternate required, enough usable fuel to fly from takeoff to the approach fix serving the destination, then to the alternate, plus a reserve of 10% of planned fuel requirements — never less than 20 minutes.",
    source: VIFR(["2.367"]),
  },

  /* ================= f6 · Altitudes and Aerobatics ================= */
  {
    id: "fr-semicircular",
    unit: "f6",
    name: "Semicircular rule basis",
    definition:
      "Cruising altitudes are set by magnetic COURSE, not heading. Courses of 0° through 179° count as east; courses of 180° through 359° count as west.",
    commonTraps: [
      "It is the COURSE that decides, never the heading — a question giving you both is testing exactly that.",
      "360° is 0°, which counts as EAST.",
    ],
    source: VIFR(["2.368"]),
  },
  {
    id: "fr-vfr-altitudes",
    unit: "f6",
    name: "VFR cruising altitudes",
    definition:
      "Apply above 3,000 feet AGL. Below 18,000 MSL: east flies odd thousands plus 500, west flies even thousands plus 500. Above 18,000 MSL to FL290: east odd flight levels plus 500, west even flight levels plus 500. Above FL290: east any flight level at 4,000 foot intervals from FL300, west from FL320.",
    relationships: ["East odd + 500 · West even + 500"],
    commonTraps: [
      "At or below 3,000 ft AGL any altitude may be used regardless of direction.",
    ],
    source: VIFR(["2.368"]),
  },
  {
    id: "fr-ifr-altitudes",
    unit: "f6",
    name: "IFR cruising altitudes",
    definition:
      "In controlled airspace ATC assigns the altitude; the semicircular rules are used mainly for preflight planning and in uncontrolled airspace. Below 18,000 MSL: east odd thousands, west even thousands. From 18,000 to FL290: east odd flight levels, west even. At FL290 and above: east 4,000 foot intervals from FL290, west from FL310.",
    relationships: ["East odd · West even — no added 500 on IFR"],
    commonTraps: [
      "The +500 belongs to VFR only. In controlled airspace the real answer is 'the assigned altitude'.",
    ],
    source: VIFR(["2.368"]),
  },
  {
    id: "fr-aerobatic-definition",
    unit: "f6",
    name: "Aerobatic flight defined",
    definition:
      "An intentional manoeuvre involving abrupt bank angles greater than 60°, pitch angles greater than ±45°, or accelerations greater than 2.0 g. A break manoeuvre conforming to the model NATOPS flight manual is not considered aerobatic flight.",
    relationships: ["Bank > 60° · pitch > ±45° · acceleration > 2.0 g"],
    source: VIFR(["2.369"]),
  },
  {
    id: "fr-aerobatic-rules",
    unit: "f6",
    name: "Aerobatic flight restrictions",
    definition:
      "FAR Part 91 prohibits aerobatic flight over any congested area of a city, town or settlement; over an open air assembly of persons; within Class B, C, D or E airspace designated for an airport, or within the limits of federal airways; below 1,500 feet AGL; or when visibility is less than 3 SM. CNAF M-3710.7 restates all of these and adds that aerobatics shall not be performed if prohibited by the aircraft's NATOPS manual.",
    commonTraps: [
      "Individual commands may be more restrictive — 5,000 ft AGL is the Training Command minimum.",
    ],
    source: VIFR(["2.370"]),
  },
  {
    id: "fr-unusual-maneuvers",
    unit: "f6",
    name: "Unusual maneuvers in Class B, C and D",
    definition:
      "CNAF M-3710.7 states that pilots shall not perform, or request clearance to perform, unusual manoeuvres within Class B, C or D airspace if they are not essential to the flight. ATC personnel are not permitted to approve such a request or to ask a pilot to perform them. Unusual manoeuvres include unnecessary low passes, unscheduled flybys, very steep climbs, and flat hatting.",
    source: VIFR(["2.371"]),
  },

  /* ================= f7 · Airspace ================= */
  {
    id: "fr-controlled",
    unit: "f7",
    name: "Controlled airspace",
    definition:
      "A generic term covering Classes A, B, C, D and E — airspace of defined dimensions within which ATC service is provided according to the classification. The controlling ATC has both the authority and the ability to control it.",
    source: AIR(["2.372"]),
  },
  {
    id: "fr-uncontrolled",
    unit: "f7",
    name: "Uncontrolled airspace",
    definition:
      "All airspace under FAA jurisdiction that is not Class A, B, C, D or E, and in which no ATC service is provided. This is Class G. The controlling ATC has no authority, no ability, or neither.",
    source: AIR(["2.372"]),
  },
  {
    id: "fr-class-a",
    unit: "f7",
    name: "Class A airspace",
    definition:
      "From 18,000 feet MSL up to and including FL600 over the continental United States, including within 12 nautical miles of the coast. All aircraft must operate IFR; ATC will not authorise VFR or VFR-on-top. Requires an instrument certified pilot and aircraft, a transponder with Mode C, an IFR clearance prior to entry, and two-way radio communication with ATC.",
    commonTraps: [
      "There is no VFR in Class A at all — not even VFR-on-top.",
    ],
    source: AIR(["2.373"]),
  },
  {
    id: "fr-class-b",
    unit: "f7",
    name: "Class B airspace",
    definition:
      "Generally surface to 10,000 feet MSL around the nation's busiest airports, individually tailored into layers resembling an upside-down wedding cake. Requires at least a private pilot certificate (or designated aviator in a military aircraft), an operable VOR or TACAN receiver for IFR, a transponder with Mode C, an ATC clearance prior to operations, and two-way radio communication.",
    commonTraps: [
      "Class B is the only class that demands a pilot certification level.",
    ],
    source: AIR(["2.373"]),
  },
  {
    id: "fr-class-c",
    unit: "f7",
    name: "Class C airspace",
    definition:
      "Generally surface to 4,000 feet AGL around airports with an operational tower and radar approach control. Usually a 5 nm radius core from the surface to 4,000 AGL, plus a 10 nm radius shelf from 1,200 to 4,000 AGL. Requires an operable Mode C transponder and two-way radio communication established before entry.",
    relationships: ["5 nm core to 4,000 AGL · 10 nm shelf from 1,200 to 4,000 AGL"],
    source: AIR(["2.373"]),
  },
  {
    id: "fr-two-way-established",
    unit: "f7",
    name: "Two-way communication established",
    definition:
      "Communication is established when ATC responds using the aircraft's specific call sign. A reply of 'aircraft calling, stand by' does not establish communication and does not permit entry.",
    commonTraps: [
      "Your call sign in their reply is the test. A generic acknowledgement is not enough.",
    ],
    source: AIR(["2.373"]),
  },
  {
    id: "fr-class-d",
    unit: "f7",
    name: "Class D airspace",
    definition:
      "Surface to 2,500 feet AGL around airports with an operational control tower, generally a 4 nm core radius with extensions for instrument approaches. Two-way radio communication must be established before entry and maintained within.",
    commonTraps: [
      "Class D exists only while the tower is in operation.",
    ],
    source: AIR(["2.373"]),
  },
  {
    id: "fr-class-e",
    unit: "f7",
    name: "Class E airspace",
    definition:
      "All controlled airspace that is not A, B, C or D. Unless designated lower it begins at 14,500 feet MSL, excluding airspace less than 1,500 feet AGL. Lower floors are the surface for an airport without an operating tower, 700 feet AGL where an instrument approach is prescribed, and 1,200 feet AGL for transitions and airway segments. There are no certification, equipment or entry requirements.",
    commonTraps: [
      "Class E is controlled airspace, but you must volunteer for control — there are no entry requirements.",
    ],
    source: AIR(["2.373"]),
  },
  {
    id: "fr-class-g",
    unit: "f7",
    name: "Class G airspace",
    definition:
      "Uncontrolled airspace, generally where radar coverage is incomplete or air traffic is minimal. The FAA provides minimal guidance to pilots operating in it.",
    source: AIR(["2.373"]),
  },
  {
    id: "fr-victor-airways",
    unit: "f7",
    name: "VOR (Victor) airways",
    definition:
      "Identified by the letter V and a number. They are Class E, extend from 1,200 feet AGL up to but not including 18,000 feet MSL, and are 4 nm either side of centerline, 8 nm total. Numbered like the highway system: east-west even, north-south odd.",
    source: AIR(["2.374"]),
  },
  {
    id: "fr-jet-routes",
    unit: "f7",
    name: "Jet routes",
    definition:
      "Not airways. They standardise routing in Class A airspace, are designated by the letter J and a number, extend from 18,000 feet MSL to FL450, and have no defined width.",
    commonTraps: [
      "Victor airways have a defined width; jet routes do not.",
    ],
    source: AIR(["2.374"]),
  },
  {
    id: "fr-mode-c",
    unit: "f7",
    name: "Mode C requirements",
    definition:
      "Beyond the requirements already stated for Classes A, B and C, an operable Mode C transponder is required in all airspace at and above 10,000 feet MSL, within 30 nm of a Class B airport from the surface to 10,000 feet MSL, in extensions beyond 30 nm above the Class B ceiling up to 10,000 feet MSL, and above the ceiling and lateral boundaries of Class C up to 10,000 feet MSL.",
    relationships: ["At/above 10,000 MSL · within 30 nm of a Class B airport · above Class B and C up to 10,000 MSL"],
    source: AIR(["2.375"]),
  },
  {
    id: "fr-vfr-minimums-table",
    unit: "f7",
    name: "VFR weather minimums by airspace",
    definition:
      "Class A: VFR not allowed. Class B: 3 SM, clear of clouds. Classes C, D and E below 10,000 MSL: 3 SM with 500 below, 1,000 above and 2,000 horizontal. Class E at or above 10,000 MSL: 5 SM with 1,000 below, 1,000 above and 1 SM horizontal. Class G below 1,200 AGL: 1 SM clear of clouds by day, 3 SM with 500/1,000/2,000 by night. Class G above 1,200 AGL and below 10,000 MSL: 1 SM by day, 3 SM by night, both 500/1,000/2,000. Class G above 1,200 AGL and above 10,000 MSL: 5 SM with 1,000/1,000/1 SM.",
    relationships: [
      "Standard clearance = 500 below, 1,000 above, 2,000 horizontal",
      "Above 10,000 MSL = 5 SM with 1,000/1,000/1 SM",
    ],
    commonTraps: [
      "Class B is the odd one out: 3 SM and merely CLEAR OF CLOUDS.",
      "Above 10,000 MSL the horizontal clearance becomes 1 statute mile, not 2,000 feet.",
    ],
    source: AIR(["2.376"]),
  },
  {
    id: "fr-prohibited-area",
    unit: "f7",
    name: "Prohibited Area",
    definition:
      "Airspace of defined dimensions within which the flight of aircraft is prohibited, established for security or other reasons associated with the national welfare.",
    source: AIR(["2.377"]),
  },
  {
    id: "fr-restricted-area",
    unit: "f7",
    name: "Restricted Area",
    definition:
      "Airspace within which flight is not wholly prohibited but is subject to restriction. Restricted Areas denote unusual, often invisible hazards such as artillery firing, aerial gunnery or guided missiles. Prior approval from the controlling authority is required to fly through.",
    commonTraps: [
      "Restricted is about HAZARDS. Prohibited is about national security.",
    ],
    source: AIR(["2.377"]),
  },
  {
    id: "fr-warning-area",
    unit: "f7",
    name: "Warning Area",
    definition:
      "Airspace that may contain hazards to nonparticipating aircraft, generally in international airspace, established beyond the three-mile limit. The activity may be as hazardous as a Restricted Area, but the FAA has no jurisdiction over international airspace. Permission is not required, but you enter at your own risk.",
    source: AIR(["2.377"]),
  },
  {
    id: "fr-moa",
    unit: "f7",
    name: "Military Operations Area",
    definition:
      "Airspace of defined vertical and lateral limits established to separate certain military training activities from IFR traffic. Nonparticipating IFR traffic may be cleared through if separation can be provided, otherwise ATC reroutes it. VFR pilots need no permission but should exercise extreme caution and contact the controlling agency for advisories.",
    commonTraps: [
      "A MOA separates military training from IFR traffic. VFR aircraft need no permission at all.",
    ],
    source: AIR(["2.377"]),
  },
  {
    id: "fr-alert-area",
    unit: "f7",
    name: "Alert Area",
    definition:
      "Charted to inform nonparticipating pilots of areas that may contain a high volume of pilot training or unusual aerial activity. All activity is conducted under the FAR and VFR, and participating and transiting pilots are equally responsible for collision avoidance. No permission is required.",
    source: AIR(["2.377"]),
  },
  {
    id: "fr-controlled-firing",
    unit: "f7",
    name: "Controlled Firing Area",
    definition:
      "Contains activities that would be hazardous if not controlled. Its distinguishing feature is that activity is suspended immediately when a spotter, radar or ground lookout indicates an aircraft is approaching. It is not charted, because it never requires a nonparticipating aircraft to change course.",
    commonTraps: [
      "The only special use airspace that is NOT depicted on charts.",
    ],
    source: AIR(["2.377"]),
  },

  /* ================= f8 · General Flight Rules ================= */
  {
    id: "fr-position-lights",
    unit: "f8",
    name: "Position lights",
    definition:
      "Red on the left wing, green on the right wing, white facing aft. They shall be on from 30 minutes before official sunset until 30 minutes after official sunrise, or whenever flight visibility from the cockpit is less than 3 SM.",
    relationships: ["Red left · green right · white aft"],
    commonTraps: [
      "The window is sunset MINUS 30 minutes to sunrise PLUS 30 minutes — wider than the hours of darkness.",
    ],
    source: AIR(["2.378"]),
  },
  {
    id: "fr-relative-position",
    unit: "f8",
    name: "Reading relative position",
    definition:
      "Seeing both a red and a green light ahead at the same altitude means the other aircraft is head-on, travelling in the opposite direction. Seeing only white means you are looking at its tail and it is travelling in the same direction.",
    relationships: ["Red + green together → head-on · white only → same direction"],
    source: AIR(["2.379"]),
  },
  {
    id: "fr-anticollision",
    unit: "f8",
    name: "Anti-collision lights",
    definition:
      "Bright red or white strobes or rotating beacons. They shall be used from before engine start until engine shutdown. CNAF permits them off when flying through clouds, to prevent distracting the pilot, and when their use adversely affects ground operations.",
    source: AIR(["2.378"]),
  },
  {
    id: "fr-row-order",
    unit: "f8",
    name: "Right-of-way order",
    definition:
      "An aircraft in distress has right of way over all other air traffic. Then aircraft landing or on final approach, and where two are approaching to land the one at the lower altitude has right of way. An aircraft being overtaken has right of way and the overtaking aircraft alters course to the right. Head-on, both alter course to the right. Converging at the same altitude, the aircraft to the other's right has right of way.",
    relationships: ["Distress → landing → overtaken → head-on → converging"],
    commonTraps: [
      "Head-on: BOTH aircraft turn right, regardless of category.",
    ],
    source: AIR(["2.380"]),
  },
  {
    id: "fr-row-category",
    unit: "f8",
    name: "Right-of-way by category",
    definition:
      "Priority follows manoeuvrability, least manoeuvrable first: balloons have the highest priority, then gliders, then airships, then airplanes, and helicopters have the lowest.",
    relationships: ["Balloon > glider > airship > airplane > helicopter"],
    commonTraps: [
      "The LESS manoeuvrable the aircraft, the HIGHER its priority.",
    ],
    source: AIR(["2.380"]),
  },
  {
    id: "fr-altitude-congested",
    unit: "f8",
    name: "Minimum altitude over congested areas",
    definition:
      "Over any congested area of a city, town or settlement, or over an open-air assembly of persons, maintain 1,000 feet above the highest obstacle within a horizontal radius of 2,000 feet of the aircraft.",
    relationships: ["1,000 ft above the highest obstacle within 2,000 ft"],
    source: AIR(["2.381"]),
  },
  {
    id: "fr-altitude-other",
    unit: "f8",
    name: "Minimum altitude elsewhere",
    definition:
      "Over other than congested areas, 500 feet AGL is the minimum, except over open water or sparsely populated areas where the aircraft may not be operated closer than 500 feet to any person, vessel, vehicle or structure. Anywhere, a pilot should maintain an altitude allowing an emergency landing without undue hazard if the engine fails.",
    source: AIR(["2.381"]),
  },
  {
    id: "fr-altitude-cnaf",
    unit: "f8",
    name: "CNAF altitude restrictions",
    definition:
      "During VFR operations, except for takeoff and landing or when the mission requires otherwise, fixed-wing flights shall not be conducted below 500 feet above the terrain or water. During IFR operations outside controlled airspace, an aircraft shall not be flown less than 1,000 feet above the highest terrain, water or obstacle within 22 miles of the intended line of flight, or 2,000 feet over designated mountainous terrain.",
    commonTraps: [
      "The IFR figure is 1,000 ft within 22 miles, rising to 2,000 ft over mountainous terrain.",
    ],
    source: AIR(["2.381"]),
  },
  {
    id: "fr-airspeed",
    unit: "f8",
    name: "Airspeed restrictions",
    definition:
      "Below 10,000 feet MSL, 250 KIAS. Inside Class B, 250 knots. Beneath the lateral limits of Class B — the shelf — 200 knots. Within 4 nm of the primary airport of Class C or D airspace, from the surface to 2,500 feet AGL, 200 knots. If the minimum safe airspeed for an operation is higher than the limit, the aircraft may be flown at that minimum speed.",
    relationships: ["250 below 10,000 · 250 inside B · 200 under B · 200 in C and D"],
    commonTraps: [
      "Inside Class B you may do 250. It is UNDERNEATH it that drops to 200.",
    ],
    source: AIR(["2.382"]),
  },
{
    id: "fr-cnaf-speed-exemption",
    unit: "f8",
    name: "CNAF speed exemption",
    definition:
      "The FAA has exempted naval aircraft from the airspeed limitations to accommodate high-performance aircraft and military missions. Examples include climbs and descents from traffic patterns, designated training areas and authorised low-level routes; flight within restricted areas and MOAs; and cases where crew or aircraft safety requires it.",
    source: AIR(["2.382"]),
  },
  {
    id: "fr-careless",
    unit: "f8",
    name: "Careless or reckless flying",
    definition:
      "The FAR prohibits operating an aircraft in a careless or reckless manner so as to endanger the life or property of another. CNAF is more stringent: flights shall be conducted so a minimum of annoyance is experienced by persons on the ground, and it is not enough that no one is actually endangered — particular effort shall be taken so that individuals do not BELIEVE they or their property are endangered.",
    commonTraps: [
      "CNAF's test is what the person on the ground perceives, not what the pilot judges to be safe.",
    ],
    source: AIR(["2.383", "2.384"]),
  },
  {
    id: "fr-noise-sensitive",
    unit: "f8",
    name: "Noise sensitive and wilderness areas",
    definition:
      "Pilots shall avoid noise-sensitive and wilderness areas below 3,000 feet AGL, except when complying with an approved traffic or approach pattern, VFR and IFR training routes, or special use airspace. Examples include breeding farms, resorts, beaches, National Parks, National Monuments and National Recreational Areas.",
    source: AIR(["2.385"]),
  },
  {
    id: "fr-wildlife",
    unit: "f8",
    name: "Wildlife preserves",
    definition:
      "Commanding officers shall take steps to prevent aircraft frightening wild fowl or driving them from feeding grounds. When it is necessary to fly over known wildlife habitations, maintain at least 3,000 feet AGL, conditions permitting.",
    source: AIR(["2.385"]),
  },
  {
    id: "fr-tfr",
    unit: "f8",
    name: "Temporary flight restrictions",
    definition:
      "Imposed around incidents or events generating a high degree of public interest that could create hazardous congestion — natural disasters, riots, major sporting events, parades, forest fires. CNAF states aircraft shall not be operated within an area designated by NOTAM within which temporary flight restrictions apply; the exact dimensions are in that NOTAM.",
    source: AIR(["2.385"]),
  },
  {
    id: "fr-commercial-avoidance",
    unit: "f8",
    name: "Avoiding commercial and civil aircraft",
    definition:
      "The FAR forbids operating so close to another aircraft as to create a collision hazard. Commercial carriers and civil aircraft are comparatively difficult to manoeuvre and relatively blind, so CNAF is more stringent, requiring avoidance by at least 500 feet vertically and/or 1 SM laterally unless directed otherwise by competent ATC, with no erratic or aerobatic flight in their vicinity.",
    source: AIR(["2.385"]),
  },
  {
    id: "fr-flat-hatting",
    unit: "f8",
    name: "Flat hatting and zooming",
    definition:
      "CNAF M-3710.7 prohibits flat hatting — any manoeuvre conducted at low altitude and/or a high rate of speed for thrill purposes, over land or water. Restrictions on zooming of vessels are not intended to hamper standardised shipping and antisubmarine warfare surveillance, rigging and photography procedures.",
    commonTraps: [
      "'For thrill purposes' is the defining phrase. The same profile flown for a mission is not flat hatting.",
    ],
    source: AIR(["2.386"]),
  },
];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);
