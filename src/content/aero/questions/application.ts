import type { Question, SourceReference } from "@/lib/types";
import { CONCEPTS } from "../concepts";

/**
 * Application-tier questions for concepts the bank could previously only
 * assess by recognition.
 *
 * The audit that produced this file found 32 Aerodynamics concepts whose every
 * question was "X is defined as" — including `c-stall-speed`, which states
 * three separate relationships in its own definition and had one of them
 * assessed. A student could answer six definition questions about stall speed
 * and be told they had mastered it without ever meeting the altitude trap that
 * the exam actually asks.
 *
 * Two rules held while writing these:
 *
 * 1. **Nothing new is asserted.** Every question here tests a relationship or
 *    a trap the concept already declares, so the source attribution is the
 *    concept's own — copied by `applied()` rather than retyped, which is what
 *    stops a citation drifting from the fact it cites.
 * 2. **The distractor is the documented confusion.** Where a concept records a
 *    `commonTrap`, that trap is the wrong answer on offer. A distractor nobody
 *    would pick teaches nothing.
 */

/** Copies the concept's own source so attribution cannot drift from content. */
function sourceOf(conceptId: string): SourceReference {
  const concept = CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) throw new Error(`application.ts references unknown concept ${conceptId}`);
  return concept.source;
}

/**
 * `Question` is a discriminated union, and a bare `Omit` over a union collapses
 * it to the shared keys — which would let a multiple-choice question be written
 * without its options. Distributing the Omit across each member keeps every
 * variant's own fields required.
 */
type AppliedSpec = Question extends infer T
  ? T extends Question
    ? Omit<T, "source" | "conceptIds">
    : never
  : never;

/** One application-tier question, attributed to its concept's source. */
function applied(conceptId: string, q: AppliedSpec): Question {
  return { ...q, conceptIds: [conceptId], source: sourceOf(conceptId) } as Question;
}

export const APPLICATION_QUESTIONS: Question[] = [
  /* ================================================================ */
  /* UNIT 1 — LEARN THE LANGUAGE                                       */
  /* ================================================================ */

  applied("c-scalar-vector", {
    id: "q-ap-001",
    type: "spotTheTrap",
    unit: "u1",
    prompt:
      '"An aircraft holding at a constant 250 knots in a circular pattern has a constant velocity."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The speed is constant; the velocity is not. Velocity carries direction, and the direction is changing continuously around the turn — which is exactly why a level turn requires a force and produces an acceleration.",
    knowCold: "Constant speed in a turn still means changing velocity.",
    difficulty: 2,
  }),

  applied("c-density", {
    id: "q-ap-002",
    type: "mcq",
    unit: "u1",
    prompt: "Which set of conditions produces the LOWEST air density?",
    options: [
      "Sea level, 0 °C, dry",
      "Sea level, 35 °C, humid",
      "8,000 ft, 35 °C, humid",
      "8,000 ft, 0 °C, dry",
    ],
    answer: 2,
    explanation:
      "All three density reducers stack: altitude ↑, temperature ↑ and humidity ↑ each lower density, so the hot humid day at altitude is the worst of the four. This is the combination behind every hot-and-high performance warning.",
    whyWrong:
      "Picking the sea-level hot day means you caught temperature and humidity but not altitude; picking cold-and-high means you weighted altitude alone.",
    knowCold: "Hot, high and humid — three ways to lose density, and they add.",
    difficulty: 3,
  }),

  applied("c-moment", {
    id: "q-ap-003",
    type: "spotTheTrap",
    unit: "u1",
    prompt:
      '"A large force applied directly through the fulcrum produces a large moment."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Moment is force × the PERPENDICULAR distance from the fulcrum. Applied straight through the pivot the moment arm is zero, so however large the force, the moment is zero.",
    knowCold: "No arm, no moment — however hard you push.",
    difficulty: 2,
  }),

  applied("c-work-power-energy", {
    id: "q-ap-004",
    type: "mcq",
    unit: "u1",
    prompt:
      "Two aircraft lift identical loads through the same height, but one takes half as long. Compared with the slower aircraft, the faster one has done",
    options: [
      "twice the work at the same power",
      "the same work at twice the power",
      "twice the work at twice the power",
      "the same work at the same power",
    ],
    answer: 1,
    explanation:
      "Work is force × displacement, and both moved the same load the same distance — so the work is identical. Power is the RATE of doing work, so halving the time doubles the power.",
    whyWrong:
      "Answering 'twice the work' is the classic swap: time appears nowhere in the definition of work.",
    knowCold: "Same load, same height = same work. Faster = more power.",
    difficulty: 3,
  }),

  applied("c-newton-laws", {
    id: "q-ap-005",
    type: "mcq",
    unit: "u1",
    prompt:
      "A propeller accelerates a mass of air rearwards and the airplane moves forward. This is best described by Newton's law of",
    options: ["equilibrium", "acceleration", "interaction", "universal gravitation"],
    answer: 2,
    explanation:
      "Interaction — the third law. The propeller pushes air aft (action) and the air pushes the airplane forward (reaction), equal and opposite.",
    whyWrong:
      "Acceleration (F = ma) explains how much thrust that mass flow produces, but the forward-from-rearward pairing itself is the interaction law.",
    knowCold: "Action and reaction = interaction = third law.",
    difficulty: 3,
  }),

  applied("c-static-pressure", {
    id: "q-ap-006",
    type: "mcq",
    unit: "u1",
    prompt:
      "Climbing from sea level to 3,000 ft on a standard day, ambient static pressure falls by approximately",
    options: ["0.3 in-Hg", "1 in-Hg", "3 in-Hg", "10 in-Hg"],
    answer: 2,
    explanation:
      "About 1.0 in-Hg per 1,000 ft at low altitude, so roughly 3 in-Hg over 3,000 ft — 29.92 down to about 26.9. This is the same rate behind the 1 in-Hg / 1,000 ft altimeter rule.",
    knowCold: "1 in-Hg per 1,000 ft, low down.",
    difficulty: 3,
  }),

  applied("c-temperature-lapse", {
    id: "q-ap-007",
    type: "mcq",
    unit: "u1",
    prompt:
      "Sea level temperature is a standard +15 °C. On a standard day, the outside air temperature at 10,000 ft is closest to",
    options: ["+5 °C", "−5 °C", "−15 °C", "−25 °C"],
    answer: 1,
    explanation:
      "2 °C per 1,000 ft × 10 = 20 °C of cooling. 15 − 20 = −5 °C. The lapse stays linear to roughly 36,000 ft, where the isothermal layer holds at −56.5 °C.",
    whyWrong:
      "−15 °C comes from using 3 °C per 1,000 ft — that is the FAHRENHEIT rate (3.57 °F), not the Celsius one.",
    knowCold: "2 °C per 1,000 ft. 3.57 °F per 1,000 ft. Do not mix the units.",
    difficulty: 3,
  }),

  applied("c-speed-of-sound", {
    id: "q-ap-008",
    type: "mcq",
    unit: "u1",
    prompt:
      "Two aircraft are at 25,000 ft. One is over a very warm air mass, the other over a very cold one. The local speed of sound is higher",
    options: [
      "for the aircraft in the warmer air",
      "for the aircraft in the colder air",
      "for whichever aircraft is heavier",
      "equally for both — altitude sets it",
    ],
    answer: 0,
    explanation:
      "Local speed of sound depends on temperature alone, so the warmer air mass gives the higher figure. Altitude only matters because temperature usually falls with it — it is not a cause in its own right.",
    whyWrong:
      "'Altitude sets it' is the trap: same altitude, different temperature, different speed of sound.",
    knowCold: "Speed of sound tracks TEMPERATURE — nothing else.",
    difficulty: 3,
  }),

  applied("c-standard-atmosphere", {
    id: "q-ap-009",
    type: "mcq",
    unit: "u1",
    prompt:
      "A field reports 29.92 in-Hg and 30 °C. Compared with the standard atmosphere, this day is",
    options: [
      "standard in pressure and warmer than standard",
      "standard in both pressure and temperature",
      "lower than standard pressure and warmer than standard",
      "higher than standard pressure and colder than standard",
    ],
    answer: 0,
    explanation:
      "Standard sea level is 29.92 in-Hg and 15 °C. The pressure matches exactly; the temperature is 15 °C above standard, which is why density altitude on this day sits well above field elevation.",
    knowCold: "29.92 in-Hg and 15 °C (59 °F) is the baseline everything is measured against.",
    difficulty: 3,
  }),

  applied("c-dynamic-pressure", {
    id: "q-ap-010",
    type: "mcq",
    unit: "u1",
    prompt:
      "At constant air density, true airspeed doubles. Dynamic pressure becomes",
    options: ["half", "unchanged", "double", "four times"],
    answer: 3,
    explanation:
      "q = ½ρV². Velocity is squared, so doubling it multiplies q by four. That square is why lift and drag change so violently with speed and why airspeed limits matter more than they look.",
    whyWrong:
      "'Double' is the answer you get by reading the equation as linear in V — the single most common slip in the whole unit.",
    knowCold: "q goes with V SQUARED. Double the speed, quadruple the q.",
    difficulty: 3,
  }),

  applied("c-altitude-types", {
    id: "q-ap-011",
    type: "mcq",
    unit: "u1",
    prompt:
      "With 29.92 set in the altimeter window, the instrument reads 18,000 ft. That reading is",
    options: ["true altitude", "pressure altitude", "absolute altitude", "density altitude"],
    answer: 1,
    explanation:
      "Pressure altitude is height above the standard datum plane, which is exactly what the altimeter shows once 29.92 is set. True altitude is height above sea level; absolute altitude is height above the terrain.",
    whyWrong:
      "True altitude only coincides with this on a standard day — the reading itself is pressure altitude by definition.",
    knowCold: "Set 29.92, read pressure altitude.",
    difficulty: 3,
  }),

  applied("c-wing-planform", {
    id: "q-ap-012",
    type: "mcq",
    unit: "u1",
    prompt: "A wing spans 36 ft with an average chord of 6 ft. Its aspect ratio is",
    options: ["3", "6", "18", "216"],
    answer: 1,
    explanation:
      "AR = span ÷ average chord = 36 ÷ 6 = 6. Multiplying instead gives 216, which is the wing AREA in square feet — a different quantity that uses the same two numbers.",
    whyWrong:
      "216 is wing area (S = b × c). The exam offers both because the inputs are identical.",
    knowCold: "AR = b ÷ c. Area = b × c. Same numbers, different operation.",
    difficulty: 3,
  }),

  applied("c-cg", {
    id: "q-ap-013",
    type: "spotTheTrap",
    unit: "u1",
    prompt:
      '"As fuel burns off in flight, the point about which all changes in aerodynamic force take place moves forward."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False, and it is a deliberate swap. Burning fuel moves the CENTRE OF GRAVITY — where weight is concentrated. The point where aerodynamic force changes act is the AERODYNAMIC CENTRE, which stays near 25% chord subsonically whatever the fuel state.",
    knowCold: "CG moves with loading. AC stays at ~25% chord.",
    difficulty: 3,
  }),

  applied("c-aerodynamic-center", {
    id: "q-ap-014",
    type: "mcq",
    unit: "u1",
    prompt:
      "On a subsonic airfoil with a 40-inch chord, the aerodynamic centre sits approximately",
    options: [
      "10 inches aft of the leading edge",
      "20 inches aft of the leading edge",
      "10 inches forward of the trailing edge",
      "at the leading edge",
    ],
    answer: 0,
    explanation:
      "Roughly 25% of the chord aft of the LEADING edge: 0.25 × 40 = 10 inches. Measuring the 25% from the trailing edge instead puts it at 30 inches — the usual error.",
    knowCold: "AC ≈ 25% chord, measured from the LEADING edge.",
    difficulty: 3,
  }),

  applied("c-aircraft-airplane", {
    id: "q-ap-015",
    type: "mcq",
    unit: "u1",
    prompt: "A hot air balloon is",
    options: [
      "an airplane but not an aircraft",
      "an aircraft but not an airplane",
      "both an aircraft and an airplane",
      "neither",
    ],
    answer: 1,
    explanation:
      "An aircraft is any device used for flight, supported by buoyancy OR by dynamic reaction. A balloon qualifies on buoyancy. It is not an airplane, which must be mechanically driven, fixed-wing, heavier than air and supported by dynamic reaction — the balloon fails all four.",
    knowCold: "Every airplane is an aircraft. Not every aircraft is an airplane.",
    difficulty: 3,
  }),

  applied("c-airplane-components", {
    id: "q-ap-016",
    type: "mcq",
    unit: "u1",
    prompt:
      "The pilot needs to yaw the nose left without banking. The control surface that does this sits on the",
    options: [
      "trailing edge of each wing",
      "vertical stabiliser",
      "horizontal stabiliser",
      "leading edge of each wing",
    ],
    answer: 1,
    explanation:
      "The rudder controls yaw and lives on the vertical stabiliser, part of the empennage. Ailerons on the wing trailing edges control roll; elevators on the horizontal stabiliser control pitch.",
    knowCold: "Ailerons roll · rudder yaws · elevators pitch.",
    difficulty: 3,
  }),

  applied("c-cantilever-wing", {
    id: "q-ap-017",
    type: "spotTheTrap",
    unit: "u1",
    prompt:
      '"A wing braced by external struts running to the fuselage can still be a full cantilever wing."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Full cantilever means the bracing is ENTIRELY internal — no external struts or wires at all. The term describes where the structure carries its loads, not where the wing is mounted or what shape it is.",
    knowCold: "Full cantilever = no external bracing, full stop.",
    difficulty: 2,
  }),

  applied("c-root-tip-chord", {
    id: "q-ap-018",
    type: "mcq",
    unit: "u1",
    prompt: "A wing has a 6 ft root chord and a 3 ft tip chord. Its taper ratio is",
    options: ["0.5", "2.0", "3.0", "18"],
    answer: 0,
    explanation:
      "Taper ratio is TIP over ROOT: 3 ÷ 6 = 0.5. On any tapered wing the answer is therefore less than 1 — if you get a number above 1 you have inverted the fraction.",
    whyWrong: "2.0 is root ÷ tip, the inversion the distractor exists to catch.",
    knowCold: "Taper ratio = tip ÷ root, always < 1 on a tapered wing.",
    difficulty: 3,
  }),

  applied("c-dihedral", {
    id: "q-ap-019",
    type: "mcq",
    unit: "u1",
    prompt:
      "A designer increases the upward slope of the wings seen from the front. This primarily improves",
    options: [
      "longitudinal stability",
      "lateral stability",
      "directional stability",
      "maneuverability in pitch",
    ],
    answer: 1,
    explanation:
      "That upward slope is dihedral, and dihedral buys LATERAL stability — resistance to roll displacement. Sweep is the feature that helps longitudinally; the vertical stabiliser handles directional.",
    knowCold: "Dihedral → lateral stability. The T-6B has it for exactly that.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* UNIT 2 — UNDERSTAND THE WING                                      */
  /* ================================================================ */

  applied("c-aero-force", {
    id: "q-ap-020",
    type: "spotTheTrap",
    unit: "u2",
    prompt: '"Thrust and weight are aerodynamic forces."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Of the four forces of flight only LIFT and DRAG are aerodynamic — they are the two components of the aerodynamic force produced by pressure and shear-stress distribution over the airfoil. Thrust comes from the engine; weight comes from gravity.",
    knowCold: "Aerodynamic force resolves into lift and drag. Those two only.",
    difficulty: 2,
  }),

  applied("c-coefficient-of-lift", {
    id: "q-ap-021",
    type: "mcq",
    unit: "u2",
    prompt:
      "In flight, which pair inside the coefficient of lift can the pilot directly change?",
    options: [
      "Viscosity and compressibility",
      "Aspect ratio and camber",
      "Angle of attack and camber",
      "Angle of attack and aspect ratio",
    ],
    answer: 2,
    explanation:
      "C_L accounts for Compressibility, Aspect Ratio, Viscosity, AOA and Camber (C.AR.V.A.C). Of those the pilot moves only AOA — with the stick — and camber, by selecting flaps. Aspect ratio is built into the airframe; viscosity and compressibility belong to the air.",
    whyWrong:
      "Aspect ratio is fixed once the wing is built, which is what rules out the two options offering it.",
    knowCold: "Inside C_L the pilot owns AOA and camber. Nothing else.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* UNIT 3 — MASTER DRAG                                              */
  /* ================================================================ */

  applied("c-interference-drag", {
    id: "q-ap-022",
    type: "mcq",
    unit: "u3",
    prompt:
      "A fairing is added where the wing meets the fuselage. The drag it is there to reduce is",
    options: ["induced drag", "form drag", "interference drag", "friction drag"],
    answer: 2,
    explanation:
      "Interference drag comes from the mixing of streamlines where two components meet — the whole is greater than the sum of the parts. Fairing and filleting the junction is the standard cure, and the junction is where it lives.",
    knowCold: "Two components meeting = interference drag. Fillet the junction.",
    difficulty: 3,
  }),

  applied("c-induced-drag-reduction", {
    id: "q-ap-023",
    type: "mcq",
    unit: "u3",
    prompt:
      "Winglets, wingtip fuel tanks and missile rails all reduce induced drag because they",
    options: [
      "reduce the wetted area of the wing",
      "impede spanwise airflow around the wingtip",
      "smooth the streamline mixing between components",
      "lower the aircraft's weight",
    ],
    answer: 1,
    explanation:
      "Induced drag is the price of making lift on a finite wing: high pressure below spills around the tip into low pressure above, creating the vortex and the downwash. Anything that blocks that spanwise escape weakens the vortex and cuts induced drag.",
    whyWrong:
      "Wetted area and streamline mixing are the parasite drags — a different family with the opposite speed behaviour.",
    knowCold: "Block the spanwise flow at the tip, cut induced drag.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* UNIT 4 — PERFORMANCE                                              */
  /* ================================================================ */

  applied("c-prop-efficiency", {
    id: "q-ap-024",
    type: "mcq",
    unit: "u4",
    prompt:
      "The same airplane departs from a hot, high field instead of a cool, sea-level one. Propeller efficiency",
    options: [
      "increases, because the propeller turns more freely in thin air",
      "decreases, because density has fallen",
      "is unchanged — it depends only on gearbox friction",
      "increases, because shaft horsepower is flat rated",
    ],
    answer: 1,
    explanation:
      "Propeller efficiency is THP ÷ SHP. Altitude ↑ and temperature ↑ both lower density, and a propeller working in less dense air converts less of the shaft's output into thrust — so efficiency falls with it.",
    knowCold: "Density ↓ → propeller efficiency ↓.",
    difficulty: 3,
  }),

  applied("c-takeoff-landing-speeds", {
    id: "q-ap-025",
    type: "mcq",
    unit: "u4",
    prompt:
      "Power-off stall speed is 80 knots. Minimum takeoff and minimum landing speeds are respectively",
    options: ["96 and 104 knots", "104 and 96 knots", "88 and 92 knots", "96 and 96 knots"],
    answer: 0,
    explanation:
      "Takeoff is 1.2 Vs = 96 knots; landing is 1.3 Vs = 104 knots. Landing carries the larger margin, and the exam routinely offers the pair reversed.",
    whyWrong:
      "104 and 96 is the reversal the second option exists to catch — check which number is the bigger one before you commit.",
    knowCold: "Takeoff 1.2 Vs · Landing 1.3 Vs. Landing is the bigger margin.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* UNIT 5 — LIMITS & MANEUVERING                                     */
  /* ================================================================ */

  applied("c-increasing-maneuverability", {
    id: "q-ap-026",
    type: "mcq",
    unit: "u5",
    prompt:
      "A fighter is designed to be markedly more maneuverable than a transport. The two design levers that buy this are",
    options: [
      "greater stability and larger control surfaces",
      "weaker stability and larger control surfaces",
      "weaker stability and smaller control surfaces",
      "greater stability and a more forward centre of gravity",
    ],
    answer: 1,
    explanation:
      "Maneuverability is the ease of moving OUT of equilibrium, and it is the opposite of stability — so reducing stability increases it. Larger control surfaces generate larger aerodynamic forces and therefore larger moments. The cost of both is that the aircraft demands more of the pilot's attention.",
    knowCold: "Less stability + bigger controls = more maneuverable. It is a choice, not a fault.",
    difficulty: 3,
  }),

  applied("c-boundary-layer", {
    id: "q-ap-027",
    type: "mcq",
    unit: "u5",
    prompt:
      "Moving aft from the leading edge along the upper surface of a wing, the boundary layer",
    options: [
      "thins, as the air accelerates",
      "thickens, having started around 1 mm thick",
      "stays a constant thickness until separation",
      "disappears once flow becomes turbulent",
    ],
    answer: 1,
    explanation:
      "The boundary layer is the film of air showing local retardation from viscosity. It starts on the order of a millimetre at the leading edge and thickens as it travels aft — which is part of why separation, when it comes, comes from the rear.",
    knowCold: "Boundary layer starts ~1 mm and thickens going aft.",
    difficulty: 3,
  }),

  applied("c-laminar-turbulent", {
    id: "q-ap-028",
    type: "spotTheTrap",
    unit: "u5",
    prompt:
      '"Laminar flow is preferable everywhere on the wing, because it both reduces friction drag and resists separation."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False — it gets the second half backwards. Laminar flow does produce very little friction drag, but it separates EASILY. Turbulent flow costs more friction drag and in exchange adheres better and delays separation, which is why the aft portion of the boundary layer being turbulent is useful rather than a failure.",
    knowCold: "Laminar = low friction, separates easily. Turbulent = more friction, sticks better.",
    difficulty: 3,
  }),

  applied("c-stall-speed", {
    id: "q-ap-029",
    type: "mcq",
    unit: "u5",
    prompt:
      "The same airplane at the same weight stalls at 5,000 ft and again at 15,000 ft. Comparing the two, at the higher altitude the",
    options: [
      "indicated stall speed is higher and the true stall speed is unchanged",
      "true stall speed is higher and the indicated stall speed is unchanged",
      "both indicated and true stall speeds are higher",
      "both are unchanged",
    ],
    answer: 1,
    explanation:
      "TRUE stall speed rises with altitude because density has fallen. INDICATED stall speed does not move, because the airspeed indicator works from dynamic pressure and the calibration uses sea-level density as a constant. This is why the same needle position marks the stall at any altitude — and why the exam keeps asking it.",
    whyWrong:
      "Answering 'both are higher' is the intuitive error: it forgets that the instrument is measuring q, not V.",
    knowCold: "Altitude ↑ → TRUE stall speed ↑, INDICATED stall speed unchanged.",
    difficulty: 3,
  }),

  applied("c-stall-recovery", {
    id: "q-ap-030",
    type: "connectChain",
    unit: "u5",
    trigger: "The wing stalls",
    steps: [
      "Relax back stick pressure to reduce AOA",
      "Advance the PCL to full power",
      "Level the wings",
      "Centre the ball with rudder",
    ],
    prompt: "Put the stall recovery in the order it is flown.",
    explanation:
      "RELAX, MAX, LEVEL, BALL. Relaxing comes first because reducing AOA is the only thing that actually breaks the stall — power, bank and balance all help the recovery but none of them un-stalls the wing. Recovery is complete wings level, clean and safely climbing.",
    knowCold: "RELAX · MAX · LEVEL · BALL — and RELAX is first for a reason.",
    difficulty: 2,
  }),

  applied("c-high-lift-purpose", {
    id: "q-ap-031",
    type: "mcq",
    unit: "u5",
    prompt:
      "Flaps are selected for landing. Their primary purpose in doing so is to",
    options: [
      "increase drag so the aircraft slows more quickly",
      "reduce both indicated and true stall speed, allowing a lower approach speed",
      "raise the stalling angle of attack",
      "move the aerodynamic centre aft for stability",
    ],
    answer: 1,
    explanation:
      "High lift devices increase C_L at high AOA, and a higher C_Lmax lowers stall speed — both indicated and true. A lower stall speed is what permits the lower takeoff and landing speeds that are the whole point. Added drag is a side effect, useful on approach but not the purpose.",
    whyWrong:
      "Raising the stalling AOA is what SLATS do. Flaps lower stall speed; slats raise stall AOA.",
    knowCold: "High lift devices exist to lower takeoff and landing speeds.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* UNIT 6 — DEPARTURES & HAZARDS                                     */
  /* ================================================================ */

  applied("c-wind-shear", {
    id: "q-ap-032",
    type: "mcq",
    unit: "u6",
    prompt: "Wind shear is most hazardous when encountered",
    options: [
      "at cruise altitude, where true airspeed is highest",
      "at low altitude and low airspeed, on takeoff or landing",
      "in the descent, where power is already reduced",
      "at any altitude equally — the airspeed change is the same",
    ],
    answer: 1,
    explanation:
      "Shear momentarily changes indicated airspeed and AOA until the aircraft settles into the new air mass. Low and slow there is neither the height nor the speed margin to absorb that change, which is why takeoff and landing are where it kills.",
    knowCold: "Shear is a margin problem: low altitude and low airspeed leave none.",
    difficulty: 3,
  }),
];
