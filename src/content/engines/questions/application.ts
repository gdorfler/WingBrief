import type { Question, SourceReference } from "@/lib/types";
import { CONCEPTS } from "../concepts";

/**
 * Application-tier questions for concepts the bank could previously only
 * assess by recognition.
 *
 * Engines came out of the audit worst on two counts at once: 41 of its 100
 * concepts had nothing but definition questions behind them, and 25 of its 30
 * lessons contained no screen where the student does anything. A course about
 * a machine had become a course about vocabulary.
 *
 * So the bias here is deliberately toward the two shapes that suit the
 * subject — and that the bank had almost none of:
 *
 * - **`connectChain`** for the sequences. An engine is a series of events in a
 *   fixed order, and "put these in order" is a fundamentally different demand
 *   from "which of these is the definition of".
 * - **Cause → malfunction scenarios.** The student is given an indication or a
 *   failure and has to trace it back through the machine, which is what the
 *   job actually asks and what the compressor-stall block is entirely about.
 *
 * Attribution is copied from each concept rather than retyped, so a citation
 * cannot drift from the fact it cites.
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
  /* E1 — PRINCIPLES OF OPERATION                                      */
  /* ================================================================ */

  applied("e-static-pressure", {
    id: "eq-ap-001",
    type: "spotTheTrap",
    unit: "e1",
    prompt:
      '"A maintenance manual describing conditions inside the gas generator refers to \'pressure\' at station 3. It means total pressure."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Inside a gas generator the bare word 'pressure' means STATIC pressure — the potential of molecules at rest — and the bare word 'velocity' means dynamic pressure. Reading either as anything else inverts half the engine's flow story.",
    knowCold: "In the engine: 'pressure' = static, 'velocity' = dynamic.",
    difficulty: 3,
  }),

  applied("e-dynamic-pressure", {
    id: "eq-ap-002",
    type: "mcq",
    unit: "e1",
    prompt:
      "Air is accelerated through a section of the engine. In gas-generator language, what has increased?",
    options: [
      "Pressure, because the molecules carry more energy",
      "Velocity, which is the engine's word for dynamic pressure",
      "Static pressure, because kinetic energy converts to potential",
      "Nothing — acceleration does not change either quantity",
    ],
    answer: 1,
    explanation:
      "Dynamic pressure is the kinetic energy of molecules in motion, and inside the engine it is simply called velocity. Accelerating the air raises it. Static pressure — the potential of molecules at rest — moves the other way.",
    knowCold: "Molecules moving → kinetic energy → dynamic pressure → 'velocity'.",
    difficulty: 3,
  }),

  applied("e-subsonic-divergent", {
    id: "eq-ap-003",
    type: "mcq",
    unit: "e1",
    prompt:
      "Subsonic air enters a duct whose cross-section widens steadily along its length. At the far end the air is",
    options: [
      "faster and at lower pressure",
      "slower and at higher pressure",
      "faster and at higher pressure",
      "unchanged in both, since the duct only changes shape",
    ],
    answer: 1,
    explanation:
      "A widening duct is divergent, and subsonic flow through a divergent opening slows down and gains pressure. This is exactly the job of an inlet duct and of a compressor stator — and it reverses above the speed of sound, which is the trap the supersonic block builds on.",
    whyWrong:
      "'Faster and lower pressure' is the convergent result. The shape alone does not decide the outcome — the speed regime does.",
    knowCold: "Subsonic + divergent → velocity ↓, pressure ↑.",
    difficulty: 3,
  }),

  applied("e-brayton", {
    id: "eq-ap-004",
    type: "spotTheTrap",
    unit: "e1",
    prompt:
      '"The Brayton cycle differs from the Otto cycle in having a different set of events."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False, and this is the distinction the exam actually wants. Both cycles run the same four events — intake, compression, combustion, exhaust. The difference is timing: Brayton runs them SIMULTANEOUSLY and continuously, Otto runs them SEQUENTIALLY in one cylinder.",
    knowCold: "Same four events. Brayton = all at once. Otto = one after another.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* E2 — MAKING THRUST                                                */
  /* ================================================================ */

  applied("e-thrust-equation", {
    id: "eq-ap-005",
    type: "mcq",
    unit: "e2",
    prompt:
      "Two engines accelerate air by the same amount, but one moves twice the mass of air per second. Compared with the other, it produces",
    options: ["half the thrust", "the same thrust", "twice the thrust", "four times the thrust"],
    answer: 2,
    explanation:
      "Thrust = mass × acceleration. Doubling the mass flow at the same acceleration doubles the thrust. This is the whole principle behind the turbofan: move much more air, accelerate it rather less, and come out ahead.",
    knowCold: "Thrust = mass × acceleration. Both levers work.",
    difficulty: 3,
  }),

  applied("e-gross-thrust", {
    id: "eq-ap-006",
    type: "mcq",
    unit: "e2",
    prompt:
      "An engine is run up on a static test stand on a standard day. The figure it produces is gross thrust because the measurement",
    options: [
      "ignores inlet air velocity and reads exhaust velocity only",
      "corrects for inlet air velocity",
      "excludes the effects of ambient pressure",
      "is taken before the afterburner lights",
    ],
    answer: 0,
    explanation:
      "Gross thrust ignores inlet velocity entirely and measures exhaust gas velocity alone. Net thrust is the same measurement corrected for inlet airflow — which is why the two are equal when inlet velocity is zero, exactly the static run-up case.",
    knowCold: "Gross ignores inlet velocity. Net corrects for it. Equal only when static.",
    difficulty: 3,
  }),

  applied("e-net-thrust", {
    id: "eq-ap-007",
    type: "mcq",
    unit: "e2",
    prompt:
      "An aircraft accelerates down the runway at constant RPM. As airspeed builds, net thrust",
    options: [
      "increases, because ram air raises mass flow",
      "decreases, because inlet velocity is rising",
      "is unchanged, because RPM is unchanged",
      "decreases, because the exhaust slows down",
    ],
    answer: 1,
    explanation:
      "Net thrust is corrected for inlet airflow velocity, and rising inlet velocity reduces it: the engine is adding less acceleration to air that already arrives moving. Ram effect works the other way and partly offsets this at higher speeds, but the inlet-velocity term is the one being asked about here.",
    knowCold: "Inlet velocity ↑ → net thrust ↓.",
    difficulty: 3,
  }),

  applied("e-pressure-thrust", {
    id: "eq-ap-008",
    type: "connectChain",
    unit: "e2",
    trigger: "The aircraft climbs to a higher altitude",
    steps: [
      "Ambient air pressure decreases",
      "Air molecules move farther apart",
      "Air density decreases",
      "Thrust decreases",
    ],
    prompt: "Trace what falling ambient pressure does to thrust.",
    explanation:
      "Pressure is the driver and density is the mechanism: fewer molecules in the same volume means less mass through the engine each second, and thrust is mass × acceleration. Colder air at altitude helps a little, but the pressure loss wins.",
    knowCold: "Pressure ↓ → density ↓ → mass flow ↓ → thrust ↓.",
    difficulty: 2,
  }),

  applied("e-rpm-thrust", {
    id: "eq-ap-009",
    type: "mcq",
    unit: "e2",
    prompt:
      "A pilot advances the PCL by 5% twice: once from 40% RPM, once from 90% RPM. The thrust gained is",
    options: [
      "about the same both times",
      "greater from 40%, because there is more room to accelerate",
      "greater from 90%, because the relationship is not linear",
      "zero below 60% RPM",
    ],
    answer: 2,
    explanation:
      "RPM and thrust rise together but not proportionally. At low RPM a throttle increase buys very little; at high RPM a small increase buys a lot. Most of the thrust lives in the top end of the range, which is why go-around power is set decisively rather than gradually.",
    knowCold: "RPM → thrust is NON-linear. The top end is where the thrust is.",
    difficulty: 3,
  }),

  applied("e-epr", {
    id: "eq-ap-010",
    type: "mcq",
    unit: "e2",
    prompt:
      "A turbofan pilot needs to set a precise thrust value for takeoff. The gauge that reports it is",
    options: ["the tachometer", "the torquemeter", "EPR", "the ITT gauge"],
    answer: 2,
    explanation:
      "Engine Pressure Ratio compares inlet and exhaust pressure and automatically accounts for some inlet airflow variation, which is why turbojet and turbofan aircraft use it to set thrust. The torquemeter is the propeller-driven equivalent; the tachometer only monitors rotation speed.",
    knowCold: "EPR → turbojet/turbofan. Torquemeter → turboprop/turboshaft.",
    difficulty: 3,
  }),

  applied("e-torquemeter", {
    id: "eq-ap-011",
    type: "spotTheTrap",
    unit: "e2",
    prompt: '"A turboprop pilot determines power available by reading EPR."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False, and the pairing is worth memorising in both directions. Propeller and rotor driven aircraft use the TORQUEMETER, which indicates shaft horsepower available to drive the propeller. EPR belongs to turbojets and turbofans.",
    knowCold: "Propeller or rotor → torquemeter. Jet or fan → EPR.",
    difficulty: 3,
  }),

  applied("e-tachometer", {
    id: "eq-ap-012",
    type: "spotTheTrap",
    unit: "e2",
    prompt:
      '"The tachometer is the cockpit gauge used to measure the thrust the engine is producing."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The tachometer is the most commonly used gauge and reads engine rotation speed in percent RPM — it MONITORS. It gives a quick sense of the energy the engine is making, but it does not measure thrust; EPR and the torquemeter do that job.",
    knowCold: "Tachometer monitors RPM. It does not measure thrust.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* E3 — INLET AND COMPRESSOR                                         */
  /* ================================================================ */

  applied("e-inlet-purpose", {
    id: "eq-ap-013",
    type: "mcq",
    unit: "e3",
    prompt:
      "Air passes through the inlet duct before reaching the first compressor stage. Across the duct, pressure and velocity respectively",
    options: ["rise and fall", "fall and rise", "both rise", "both fall"],
    answer: 0,
    explanation:
      "Inlet ducts are designed to act as DIFFUSERS, so pressure rises and velocity falls. The purpose is to deliver high-pressure, turbulence-free, steady and uniform air to the first compressor stage — and uniform delivery is precisely what keeps the compressor out of a stall.",
    knowCold: "Inlet = diffuser: pressure up, velocity down, flow made uniform.",
    difficulty: 3,
  }),

  applied("e-single-entrance", {
    id: "eq-ap-014",
    type: "mcq",
    unit: "e3",
    prompt:
      "An aircraft with a short single-entrance inlet duct is flown slowly at high angle of attack. The risk this creates is",
    options: [
      "excessive ram pressure at the compressor face",
      "compressor stall, from disturbed inlet airflow",
      "turbine creep, from raised ITT",
      "flameout, from fuel starvation",
    ],
    answer: 1,
    explanation:
      "The single-entrance duct is the simplest and most efficient because it sits directly in front of the engine and scoops undisturbed air — but a short one loses that advantage at slow airspeed or high AOA, where the airflow reaching it is no longer clean. Disturbed inlet air is the classic compressor-stall setup.",
    knowCold: "Short single duct + slow + high AOA = stall risk.",
    difficulty: 3,
  }),

  applied("e-centrifugal-compressor", {
    id: "eq-ap-015",
    type: "connectChain",
    unit: "e3",
    trigger: "Air enters a centrifugal compressor",
    steps: [
      "The impeller accelerates air outward, raising velocity",
      "The diffuser converts that velocity into pressure",
      "The manifold routes the air to the combustion chambers",
    ],
    prompt: "Follow one parcel of air through the three components.",
    explanation:
      "Impeller, diffuser, manifold. The impeller's job is velocity — its divergent blade shape raises pressure too — and the diffuser's job is converting that velocity into the pressure the burner needs. Swapping the first two roles is the usual error.",
    knowCold: "Impeller → velocity. Diffuser → pressure. Manifold → delivery.",
    difficulty: 2,
  }),

  applied("e-axial-compressor", {
    id: "eq-ap-016",
    type: "spotTheTrap",
    unit: "e3",
    prompt:
      '"An axial compressor with sixteen rows of blades therefore has sixteen stages."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. One stage is one ROTOR plus one STATOR, so sixteen alternating rows make eight stages. The rotor raises both pressure and velocity; the stator then lowers velocity, raises pressure again and straightens the flow for the next rotor.",
    knowCold: "A stage = 1 rotor + 1 stator. Not one blade row.",
    difficulty: 3,
  }),

  applied("e-axial-centrifugal", {
    id: "eq-ap-017",
    type: "mcq",
    unit: "e3",
    prompt:
      "The axial-centrifugal compressor is well suited to smaller mission aircraft but is NOT suited to",
    options: [
      "high compression ratios",
      "supersonic airflow",
      "straight-through airflow",
      "engines with reduction gearboxes",
    ],
    answer: 1,
    explanation:
      "It combines straight-through axial flow with the large pressure rise of an impeller, which suits smaller aircraft well — but it is not suited to supersonic airflow. The T-6 uses this arrangement: four axial stages plus one centrifugal impeller.",
    knowCold: "Axial-centrifugal: great for small aircraft, wrong for supersonic.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* E4 — BURN, TURBINE, EXHAUST                                       */
  /* ================================================================ */

  applied("e-burner-purpose", {
    id: "eq-ap-018",
    type: "mcq",
    unit: "e4",
    prompt:
      "Beyond mixing fuel and air, the burner section must deliver gas to the turbine at a temperature that",
    options: [
      "is as high as the fuel can produce, for maximum thrust",
      "will not exceed turbine blade limits",
      "matches compressor discharge temperature",
      "stays below the fuel's flash point",
    ],
    answer: 1,
    explanation:
      "Three jobs: mix fuel and air well enough to ensure combustion, add enough heat energy to accelerate the gases and make the desired thrust, and — the constraint that bounds the other two — hand the turbine gas it can survive. Turbine blade temperature limits are what cap the whole cycle.",
    knowCold: "The burner is limited by what the TURBINE BLADES can take.",
    difficulty: 3,
  }),

  applied("e-annular-chamber", {
    id: "eq-ap-019",
    type: "mcq",
    unit: "e4",
    prompt:
      "A designer needs the smallest possible engine diameter and the most uniform heat distribution across the turbine face. The combustion chamber to choose, and its cost, are",
    options: [
      "annular — but maintenance requires major engine overhaul",
      "can — but heat distribution is uneven",
      "can-annular — but the engine diameter grows",
      "annular — with no significant disadvantage",
    ],
    answer: 0,
    explanation:
      "The annular chamber's continuous liner and shroud give uniform heat across the turbine face and a much smaller circumference. The price is real: maintenance needs a major engine overhaul, and the large thin-walled shrouds bring structural problems.",
    knowCold: "Annular = uniform heat + smallest diameter, paid for in maintenance.",
    difficulty: 3,
  }),

  applied("e-creep", {
    id: "eq-ap-020",
    type: "connectChain",
    unit: "e4",
    trigger: "Turbine section is operated over temperature at high speed",
    steps: [
      "Turbine blades are stressed beyond their design limit",
      "The blades abnormally elongate",
      "The deformation becomes permanent",
    ],
    prompt: "Trace how an overtemperature ends in creep.",
    explanation:
      "Creep is abnormal elongation of turbine blades from overheating, and the turbine is the most stressed part of the engine. Excessive temperature AND speed together drive it, and once the deformation is permanent the blade does not recover — which is why ITT limits are hard limits.",
    knowCold: "Over-temp + over-speed → blade elongation → permanent deformation.",
    difficulty: 2,
  }),

  applied("e-fir-tree", {
    id: "eq-ap-021",
    type: "mcq",
    unit: "e4",
    prompt:
      "Turbine blades are attached to the wheel by a fir-tree mount specifically so that the blades can",
    options: [
      "be replaced without removing the wheel",
      "expand normally as they heat",
      "change pitch with power setting",
      "shed foreign object damage safely",
    ],
    answer: 1,
    explanation:
      "The fir-tree attachment exists to allow for normal expansion of the blades due to heating. A rigid mount on a component that runs hundreds of degrees hotter in operation than at rest would simply tear itself apart.",
    knowCold: "Fir-tree = room for the blade to grow when it gets hot.",
    difficulty: 3,
  }),

  applied("e-afterburner", {
    id: "eq-ap-022",
    type: "mcq",
    unit: "e4",
    prompt:
      "An engine producing 10,000 lb of thrust selects afterburner. Available thrust becomes approximately",
    options: ["11,000 lb", "12,500 lb", "15,000 lb or more", "20,000 lb exactly"],
    answer: 2,
    explanation:
      "The afterburner ignites secondary and bypass air and can raise thrust by 50% or more — so 15,000 lb or better. It is for short periods such as takeoff, because the fuel cost of that extra thrust is severe.",
    knowCold: "Afterburner: +50% or more, for short periods.",
    difficulty: 3,
  }),

  applied("e-recip-components", {
    id: "eq-ap-023",
    type: "mcq",
    unit: "e4",
    prompt:
      "Which of these is NOT one of the basic components of a reciprocating engine?",
    options: ["Crankshaft", "Connecting rods", "Stator vanes", "Valve-operating mechanism"],
    answer: 2,
    explanation:
      "Stator vanes belong to an axial compressor in a gas turbine. The reciprocating engine's basic components are the crankcase, cylinders, pistons, connecting rods, valves, valve-operating mechanism and crankshaft.",
    knowCold: "Recip: crankcase, cylinders, pistons, rods, valves, valve gear, crankshaft.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* E5 — COMPRESSOR STALLS                                            */
  /* ================================================================ */

  applied("e-compressor-relative-wind", {
    id: "eq-ap-024",
    type: "mcq",
    unit: "e5",
    prompt:
      "The pilot slams the PCL forward. Compressor RPM begins to rise while inlet airflow has not yet caught up. The immediate consequence inside the compressor is that",
    options: [
      "relative wind is unchanged, since inlet airflow is unchanged",
      "the relative wind angle changes, raising blade angle of attack",
      "the stators begin to rotate",
      "static pressure at the inlet rises to compensate",
    ],
    answer: 1,
    explanation:
      "Compressor relative wind is the combination of inlet airflow and compressor RPM. Change either one and the relative wind changes — so an RPM surge that outruns the inlet airflow swings the relative wind and drives up blade AOA, which is the beginning of a compressor stall.",
    knowCold: "Relative wind = inlet airflow + RPM. Change one, you change the AOA.",
    difficulty: 3,
  }),

  applied("e-stall-definition", {
    id: "eq-ap-025",
    type: "mcq",
    unit: "e5",
    prompt:
      "A compressor stall is correctly described as an aerodynamic event because rotors and stators",
    options: [
      "spin fast enough to reach supersonic tip speeds",
      "are airfoils, and stall from excessive angle of attack like any airfoil",
      "are mechanically linked to the turbine",
      "operate in air that has already been compressed",
    ],
    answer: 1,
    explanation:
      "Rotors and stators are airfoils. Airflow over them breaks away and they lose lift when AOA becomes excessive — the same mechanism as a wing stall, in a different place. Left alone a compressor stall could lead to engine flameout.",
    knowCold: "Compressor blades are airfoils. They stall on AOA, same as a wing.",
    difficulty: 3,
  }),

  applied("e-stall-indications", {
    id: "eq-ap-026",
    type: "mcq",
    unit: "e5",
    prompt:
      "Loud bangs and a marked change in engine sound accompany a severe compressor stall. On the gauges the pilot should expect",
    options: [
      "RPM increasing and ITT decreasing",
      "RPM decreasing and ITT increasing",
      "both RPM and ITT decreasing",
      "both RPM and ITT increasing",
    ],
    answer: 1,
    explanation:
      "RPM DOWN and ITT UP — the pair moves in opposite directions and that is the whole diagnostic. Milder stalls show pulsations, vibration and noise with fluctuating torquemeter, ITT, compressor and fuel-flow gauges; the severe case adds the bangs and the divergent RPM/ITT pair.",
    whyWrong:
      "Both-increasing feels intuitive if you picture the engine working harder — but the compressor is no longer pumping, so RPM falls while unburnt energy drives temperature up.",
    knowCold: "Severe compressor stall: RPM ↓, ITT ↑.",
    difficulty: 3,
  }),

  applied("e-airflow-distortion", {
    id: "eq-ap-027",
    type: "spotTheTrap",
    unit: "e5",
    prompt: '"The most common cause of compressor stall is mechanical malfunction."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. AIRFLOW DISTORTION is the most common cause — abrupt attitude change, turbulence, a deficiency of air velocity or volume from atmospheric conditions, and rapid throttle movement. Mechanical malfunctions cause stalls too, but they are the less common family.",
    knowCold: "Most common cause of compressor stall = airflow distortion.",
    difficulty: 3,
  }),

  applied("e-mechanical-malfunctions", {
    id: "eq-ap-028",
    type: "mcq",
    unit: "e5",
    prompt:
      "A fuel control unit fails and allows extra fuel to reach the burner. The compressor stalls because the failure has produced",
    options: [
      "insufficient airflow at low RPM",
      "excessive back pressure",
      "foreign object damage to the blades",
      "a loss of variable inlet guide vane authority",
    ],
    answer: 1,
    explanation:
      "Extra fuel means extra heat and expansion downstream of the compressor, and that excessive back pressure opposes the flow the compressor is trying to push — stalling it. The other three options are the other three mechanical causes: guide vane failure, foreign object damage, and a variable exhaust nozzle that fails to open in afterburner.",
    knowCold: "Extra fuel → excessive back pressure → compressor stall.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* E6 — ENGINE TYPES                                                 */
  /* ================================================================ */

  applied("e-turbofan", {
    id: "eq-ap-029",
    type: "mcq",
    unit: "e6",
    prompt:
      "A transport aircraft and a fighter both use turbofans. Compared with the fighter's, the transport's engine typically has",
    options: [
      "a lower bypass ratio, to behave more like a turbojet",
      "a higher bypass ratio, for lower TSFC",
      "the same bypass ratio, since both are turbofans",
      "no bypass, since bypass air produces no thrust",
    ],
    answer: 1,
    explanation:
      "Airliners and cargo aircraft run HIGH bypass ratios because raising bypass lowers TSFC — better fuel efficiency, higher thrust at low airspeed, shorter takeoff and much less noise. Fighters run LOW bypass to behave more like a turbojet, accepting the fuel penalty for high-speed performance.",
    knowCold: "High bypass = efficient transport. Low bypass = fast fighter.",
    difficulty: 3,
  }),

  applied("e-tsfc", {
    id: "eq-ap-030",
    type: "mcq",
    unit: "e6",
    prompt: "Engine A has a lower TSFC than engine B. Engine A therefore",
    options: [
      "burns more fuel per pound of thrust",
      "burns less fuel per pound of thrust",
      "produces more total thrust",
      "has a lower bypass ratio",
    ],
    answer: 1,
    explanation:
      "TSFC is the fuel required to produce one pound of thrust, so a LOWER number is the more efficient engine. It says nothing directly about total thrust — a small efficient engine and a large thirsty one can sit anywhere relative to each other on absolute thrust.",
    knowCold: "TSFC ↓ = more fuel efficient. Lower is better.",
    difficulty: 3,
  }),

  applied("e-recip-propulsion", {
    id: "eq-ap-031",
    type: "mcq",
    unit: "e6",
    prompt: "In a reciprocating engine installation, all thrust is produced by",
    options: [
      "exhaust gas leaving the cylinders",
      "the propeller, driven by crankshaft rotation",
      "the combination of exhaust thrust and propeller thrust",
      "the reduction gearbox",
    ],
    answer: 1,
    explanation:
      "All of it comes from the propeller, turned by the crankshaft either directly or through a reduction gearbox. A governor controls blade angle and propeller speed. The gearbox transmits power; it does not produce thrust.",
    knowCold: "Recip thrust is 100% propeller.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* E7 — AIRCRAFT SYSTEMS                                             */
  /* ================================================================ */

  applied("e-fuel-types", {
    id: "eq-ap-032",
    type: "mcq",
    unit: "e7",
    prompt:
      "JP-5 is the only jet fuel used aboard ships. The property that makes it the shipboard choice is its",
    options: [
      "low flash point of −35 °F, for reliable cold starting",
      "high flash point of 140 °F, which resists ignition",
      "high volatility, which aids atomisation",
      "low cost relative to JP-8",
    ],
    answer: 1,
    explanation:
      "A 140 °F flash point is HIGH, and on a ship that is the entire point: fuel that resists catching fire is what you want in a hangar deck. Volatility and flash point are inversely related, so JP-5's high flash point means low volatility — the opposite of JP-4 (−35 °F) and avgas (−45 °F).",
    whyWrong:
      "Choosing the low flash point inverts the relationship: volatility ↑ means flash point ↓, and volatile fuel is exactly what a ship does not want.",
    knowCold: "JP-5: 140 °F flash point, high, which is why it goes to sea.",
    difficulty: 3,
  }),

  applied("e-oil-sumps", {
    id: "eq-ap-033",
    type: "mcq",
    unit: "e7",
    prompt:
      "An engine must hold a large oil quantity, cool it well, and keep working through unusual flight attitudes. The sump type required is",
    options: [
      "wet, because oil stays close to the bearings",
      "dry, because the oil is stored externally",
      "either — sump type does not affect attitude tolerance",
      "wet, because it allows a more streamlined engine",
    ],
    answer: 1,
    explanation:
      "A dry sump stores oil externally, which allows better cooling, larger oil quantities and a more streamlined engine. The wet sump keeps oil in a tank internal to the engine, which makes cooling difficult and cannot adapt to unusual flight attitudes.",
    knowCold: "Dry sump = external tank = better cooling, more oil, any attitude.",
    difficulty: 3,
  }),

  applied("e-oil-contamination", {
    id: "eq-ap-034",
    type: "mcq",
    unit: "e7",
    prompt:
      "An oil analysis is run after a routine flight. The contamination most likely to be found is",
    options: [
      "carbon deposits from coking",
      "metal particles from metal-to-metal contact",
      "sand and dirt ingested through the inlet",
      "degraded synthetic oil from long storage",
    ],
    answer: 1,
    explanation:
      "Metal particles from metal-to-metal contact are the MOST COMMON contamination. The other three are the other three recognised causes — coking, foreign objects, and synthetic oil stored too long — but they are not the one to expect first.",
    knowCold: "Most common oil contamination = metal particles.",
    difficulty: 3,
  }),

  applied("e-viscosity", {
    id: "eq-ap-035",
    type: "mcq",
    unit: "e7",
    prompt:
      "Oil temperature rises well above normal. The effect on the squeeze film protecting the bearings is that",
    options: [
      "viscosity rises and the film thickens",
      "viscosity falls and the film may fail to form",
      "viscosity is unaffected; only pressure matters",
      "the film thickens, raising the risk of coking",
    ],
    answer: 1,
    explanation:
      "Viscosity resists flow and is inversely related to temperature, so hot oil is thin oil. The squeeze film is the thin layer that prevents metal-to-metal contact and carries heat away, and it needs proper viscosity to form — which is why an oil over-temperature is a bearing problem waiting to happen.",
    knowCold: "Temperature ↑ → viscosity ↓ → squeeze film at risk.",
    difficulty: 3,
  }),

  applied("e-start-sequence", {
    id: "eq-ap-036",
    type: "connectChain",
    unit: "e7",
    trigger: "The pilot initiates an engine start",
    steps: [
      "The starter engages and accelerates the compressor",
      "Engine RPM reaches 30%",
      "Fuel flows to the burner",
      "Ignition occurs once airflow supports combustion",
      "The starter drops out at self-accelerating speed",
    ],
    prompt: "Put the start sequence in order.",
    explanation:
      "Air first, then fuel, then light. The 30% RPM gate exists because fuel introduced before there is enough airflow to burn it cleanly produces a hot start rather than a start — which is why the order is a limit, not a preference.",
    knowCold: "Starter → 30% RPM → fuel → ignition.",
    difficulty: 2,
  }),

  applied("e-starters", {
    id: "eq-ap-037",
    type: "mcq",
    unit: "e7",
    prompt: "A large gas turbine engine is most likely to be started by",
    options: [
      "a DC electric motor drawing from the battery",
      "an air turbine starter",
      "the accumulator discharging into the compressor",
      "a constant speed drive run in reverse",
    ],
    answer: 1,
    explanation:
      "Air turbine starters are used on larger gas turbines — a small geared air turbine spun by delivered air to accelerate the compressor. DC electric motor starters, mechanically connected to the compressor and fed by the battery, are the smaller-engine solution.",
    knowCold: "Small engine → DC electric starter. Large engine → air turbine starter.",
    difficulty: 3,
  }),

  applied("e-accumulator", {
    id: "eq-ap-038",
    type: "mcq",
    unit: "e7",
    prompt:
      "Hydraulic system pressure spikes sharply as a large actuator reaches the end of its travel. The component that absorbs the spike is the",
    options: ["check valve", "accumulator", "constant speed drive", "reservoir"],
    answer: 1,
    explanation:
      "The accumulator is compressed air or nitrogen held behind a diaphragm, and shock absorption is the first of its four jobs. It also provides pressure for one-time emergency use, supports system pressure at peak demand, and — with the check valve — maintains pressure after shutdown.",
    knowCold: "Accumulator: shock absorber, emergency store, peak support, shutdown pressure.",
    difficulty: 3,
  }),

  applied("e-ac-dc", {
    id: "eq-ap-039",
    type: "mcq",
    unit: "e7",
    prompt:
      "An aircraft designer chooses AC over DC for the primary electrical system principally because AC",
    options: [
      "requires lower current loads, permitting lighter wiring",
      "provides straight-line voltage that is easier to regulate",
      "eliminates the need for a constant speed drive",
      "is inherently safer at high voltage",
    ],
    answer: 0,
    explanation:
      "AC alternates equally either side of base voltage and needs lower current for the same power, so the wiring can be lighter — and on an aircraft, weight saved is the argument that wins. DC is the straight-line one, with heavier components and increased maintenance.",
    knowCold: "AC → lower current → lighter wiring → weight saved.",
    difficulty: 3,
  }),

  applied("e-csd", {
    id: "eq-ap-040",
    type: "mcq",
    unit: "e7",
    prompt:
      "Engine RPM varies continuously in flight, but the generator requires a constant input speed. The component that resolves this is the",
    options: ["accumulator", "constant speed drive", "essential bus", "torquemeter"],
    answer: 1,
    explanation:
      "The constant speed drive is a hydro-mechanical linkage between engine and generator that converts variable engine RPM into the constant speed output the generator needs. Without it, generator frequency would wander with every power change.",
    knowCold: "CSD: variable engine RPM in, constant generator speed out.",
    difficulty: 3,
  }),

  applied("e-buses", {
    id: "eq-ap-041",
    type: "mcq",
    unit: "e7",
    prompt:
      "After a major electrical failure, load shedding leaves only one bus powered. The bus that must remain live is the",
    options: [
      "primary bus, which supplies mission equipment",
      "essential bus, which supplies equipment required for flight safety",
      "monitor bus, which supplies convenience circuits",
      "starter bus, which supplies the start circuit",
    ],
    answer: 1,
    explanation:
      "Essential means what it says: equipment required for FLIGHT SAFETY. The primary bus carries mission equipment, the monitor or secondary bus carries convenience circuits such as cabin lighting, and the starter bus feeds the start circuit — all of which can go before safety does.",
    knowCold: "Essential = flight safety · Primary = mission · Monitor = convenience.",
    difficulty: 3,
  }),
];
