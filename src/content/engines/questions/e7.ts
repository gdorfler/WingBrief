import type { Question, SourceReference } from "@/lib/types";

const NOTES = (chapter: string): SourceReference => ({
  document: "Engines Condensed Notes",
  chapter,
});

/** The lubrication lecture is now the authority for the lubrication block. */
const L208: SourceReference = {
  document: "Lubricants and Lubrication Systems",
  chapter: "Lubricants and Lubrication Systems",
};

/**
 * Unit e7 — Aircraft Systems.
 *
 * Fuel, lubrication, starting, hydraulics and electrics. As with e6 the only
 * supplied source is the condensed notes, so no enabling objective is claimed.
 */
export const E7_QUESTIONS: Question[] = [
  {
    id: "eq-e7-001",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-boost-pump"],
    prompt: "A critical function of the fuel boost pump is to",
    options: [
      "meter fuel to the combustion chamber",
      "prevent aeration of the fuel, which may result from rapid pressure change during climb",
      "cool the engine lubricant",
      "filter impurities from the fuel",
    ],
    answer: 1,
    explanation:
      "The boost pump is submerged in the tank and ensures adequate supply to the engine-driven pump. Preventing aeration during rapid pressure change in a climb is its critical function.",
    whyWrong: "Metering is the FCU's job; filtering is the low pressure filter's.",
    knowCold: "Boost pump prevents aeration.",
    difficulty: 2,
    source: NOTES("Fuel Systems"),
  },
  {
    id: "eq-e7-002",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-fcu"],
    prompt: "The Fuel Control Unit senses all of the following EXCEPT",
    options: [
      "Compressor Inlet Temperature (CIT)",
      "engine RPM",
      "turbine temperature (ITT)",
      "outside air humidity",
    ],
    answer: 3,
    explanation:
      "The FCU senses CIT, RPM, ITT and PCL input from the aviator to meet fuel-flow requirements for starting, acceleration, deceleration and stabilized operation.",
    knowCold: "FCU senses CIT, RPM, ITT and PCL.",
    difficulty: 2,
    source: NOTES("Fuel Systems"),
  },
  {
    id: "eq-e7-003",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-fcu"],
    prompt: "During manual FCU operation, the pilot",
    options: [
      "retains full acceleration limiting and RPM governing",
      "must monitor ITT visually and loses acceleration limiting and governing capability",
      "cannot control fuel flow at all",
      "must shut down the engine within 30 minutes",
    ],
    answer: 1,
    explanation:
      "Manual operation lets the PCL act as a throttle regulating fuel flow directly, but the pilot must watch ITT visually and loses the normal system's acceleration limiting, RPM limiting and governing.",
    knowCold: "Manual FCU: you are the governor, and you watch ITT yourself.",
    difficulty: 3,
    source: NOTES("Fuel Systems"),
  },
  {
    id: "eq-e7-004",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-fuel-types"],
    prompt: "The Navy's primary jet fuel, and the only jet fuel used aboard ships, is",
    options: ["JP-4", "JP-5", "JP-8", "Avgas 100LL"],
    answer: 1,
    explanation:
      "JP-5 is the Navy's primary jet fuel: thermally stable, high heat content per gallon, and a high flash point of 140 °F that makes it safe for shipboard handling.",
    knowCold: "JP-5: Navy, shipboard, 140 °F flash point.",
    difficulty: 1,
    source: NOTES("Fuel Systems"),
  },
  {
    id: "eq-e7-005",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-fuel-types"],
    prompt: "Volatility and flash point are related how?",
    options: [
      "Directly — higher volatility means higher flash point",
      "Inversely — higher volatility means lower flash point",
      "They are unrelated properties",
      "Only for aviation gasoline",
    ],
    answer: 1,
    explanation:
      "Volatility is a fluid's ability to evaporate and is inversely related to flash point. JP-4 is highly volatile with a −35 °F flash point; JP-5's 140 °F flash point makes it far less volatile.",
    knowCold: "Volatility ↑ → flash point ↓.",
    difficulty: 2,
    source: NOTES("Fuel Systems"),
  },
  {
    id: "eq-e7-006",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-thrust-ratings"],
    prompt: "Military thrust is produced at the maximum turbine temperature for approximately",
    options: [
      "no time limit",
      "30 minutes",
      "5 minutes",
      "as long as the afterburner is lit",
    ],
    answer: 1,
    explanation:
      "Normal thrust has no time limit at maximum continuous turbine temperature. Military thrust runs at maximum turbine temperature for a limited time, roughly 30 minutes. Combat thrust uses the afterburner and is not based on turbine temperature limits.",
    knowCold: "Normal = unlimited · Military ≈ 30 min · Combat = afterburner.",
    difficulty: 2,
    source: NOTES("Fuel Systems"),
  },
  {
    id: "eq-e7-007",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-fuel-manifolds"],
    prompt: "The primary fuel manifold is smaller than the secondary in order to",
    options: [
      "reduce fuel weight",
      "let fuel reach high pressure for good atomization during starting and altitude idling",
      "prevent fuel from freezing at altitude",
      "allow manual FCU operation",
    ],
    answer: 1,
    explanation:
      "The smaller primary manifold lets fuel reach a high pressure, achieving a high degree of atomization during starting and altitude idling. The secondary supplies fuel once RPM raises pressure to a set level.",
    knowCold: "Small primary = high pressure = good atomization for starting.",
    difficulty: 3,
    source: NOTES("Fuel Systems"),
  },
  {
    id: "eq-e7-008",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-oil-sumps"],
    prompt: "Compared with a wet sump, a dry sump system",
    options: [
      "stores oil inside the engine for faster warm-up",
      "stores oil externally, allowing better cooling and larger oil quantities",
      "requires no scavenge pump",
      "cannot be used in modern aircraft",
    ],
    answer: 1,
    explanation:
      "A dry sump keeps oil in a tank external to the engine, allowing easier and better cooling, a more streamlined engine, and larger oil quantities. A wet sump stores oil internally, making cooling difficult.",
    knowCold: "Dry sump = external tank = better cooling.",
    difficulty: 2,
    source: NOTES("Lubrication"),
  },
  {
    id: "eq-e7-009",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-oil-pump"],
    prompt: "The scavenge component of the oil pump has greater capacity than the pressure component in order to",
    options: [
      "increase oil pressure at the bearings",
      "prevent back pressure and accumulation of oil in the bearing sump cavities",
      "speed up engine warm-up",
      "allow the use of mineral-based oils",
    ],
    answer: 1,
    explanation:
      "Greater scavenge capacity prevents back pressure and stops oil pooling in the bearing sump cavities.",
    knowCold: "Scavenge capacity > pressure capacity.",
    difficulty: 3,
    source: NOTES("Lubrication"),
  },
  {
    id: "eq-e7-010",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-oil-contamination"],
    prompt: "The most common form of lubrication system contamination is",
    options: ["coking", "metal particles", "foreign objects such as sand", "aerated oil"],
    answer: 1,
    explanation:
      "Metal particles generated by metal-to-metal contact are the most common contamination and can block passages and filters, causing engine failure.",
    knowCold: "Metal particles: most common oil contamination.",
    difficulty: 2,
    source: NOTES("Lubrication"),
  },
  {
    id: "eq-e7-011",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-chip-detector"],
    prompt: "The magnetic chip detector is located in the",
    options: [
      "pressure oil line ahead of the bearings",
      "scavenge oil path",
      "fuel-oil cooler outlet",
      "breather subsystem",
    ],
    answer: 1,
    explanation:
      "It is a magnetized plug in the scavenge oil path — the return flow that has already passed the bearings — and it illuminates a cockpit warning light once it collects enough metal particles.",
    knowCold: "Chip detector sits in the scavenge path, catching what came off the bearings.",
    difficulty: 3,
    source: NOTES("Lubrication"),
  },
  {
    id: "eq-e7-012",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-viscosity"],
    prompt: "Viscosity is ___ related to temperature.",
    options: ["directly", "inversely", "not", "exponentially"],
    answer: 1,
    explanation:
      "Viscosity resists flow and is inversely related to temperature — hotter oil flows more easily. Proper viscosity is required to form the squeeze film that prevents metal-to-metal contact.",
    knowCold: "Temperature ↑ → viscosity ↓.",
    difficulty: 2,
    source: NOTES("Lubrication"),
  },
  {
    id: "eq-e7-013",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-oil-subsystems"],
    prompt: "The breather subsystem uses compressor bleed air to",
    options: [
      "cool the oil before it returns to the tank",
      "pressurize the oil tank and engine, minimising leakage and ensuring proper spray patterns",
      "drive the scavenge pump",
      "detect metal particles in the oil",
    ],
    answer: 1,
    explanation:
      "The breather pressurizing valve encases the oil sumps with pressurized air to minimise internal leakage, and mixes pressurized air with oil to form a fine mist.",
    knowCold: "Breather pressurizes sumps and makes the oil mist.",
    difficulty: 2,
    source: NOTES("Lubrication"),
  },
  {
    id: "eq-e7-014",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-start-sequence"],
    prompt: "In a normal start, fuel flow begins after engine RPM reaches",
    options: ["10%", "30%", "50%", "self-accelerating speed"],
    answer: 1,
    explanation:
      "The starter engages until the engine attains self-accelerating speed, fuel flows after RPM reaches 30%, and ignition occurs when sufficient airflow supports combustion.",
    knowCold: "Fuel at 30% RPM.",
    difficulty: 2,
    source: NOTES("Starting and Ignition"),
  },
  {
    id: "eq-e7-015",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-abnormal-starts"],
    prompt:
      "Compressor RPM stabilizes below normal while turbine temperature continues to RISE. This is a",
    options: ["hot start", "hung start", "false start", "wet start"],
    answer: 1,
    explanation:
      "A hung start is RPM stabilized below normal WITH temperature continuing to rise. A false start also has RPM below normal but temperature stays within limits.",
    whyWrong:
      "Hung and false both stabilize RPM low — temperature is the only thing separating them.",
    knowCold: "Hung = RPM low + temp rising. False = RPM low + temp OK.",
    difficulty: 3,
    source: NOTES("Starting and Ignition"),
  },
  {
    id: "eq-e7-016",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-abnormal-starts"],
    prompt: "The most dangerous type of abnormal start is a",
    options: ["hot start", "hung start", "false start", "wet start"],
    answer: 3,
    explanation:
      "A wet start is when the fuel-air mixture does not light off initially but can at any time — usually an ignition error. That unpredictability is what makes it the most dangerous.",
    knowCold: "Wet start: unburned fuel that could light at any moment.",
    difficulty: 2,
    source: NOTES("Starting and Ignition"),
  },
  {
    id: "eq-e7-017",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-starters"],
    prompt: "An air turbine starter is normally used on",
    options: [
      "smaller engines, using battery voltage",
      "larger gas turbine engines",
      "reciprocating engines only",
      "engines without an accessory gear box",
    ],
    answer: 1,
    explanation:
      "Air turbine starters are used on larger gas turbine engines: a small geared air turbine through which air is delivered to accelerate the compressor. DC electric motor starters serve smaller engines.",
    knowCold: "Big engines: air turbine starter. Small engines: DC motor.",
    difficulty: 2,
    source: NOTES("Starting and Ignition"),
  },
  {
    id: "eq-e7-018",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-pascal"],
    prompt:
      "In a hydraulic system, if the output force is twice the input force, the output displacement is",
    options: [
      "twice the input displacement",
      "half the input displacement",
      "equal to the input displacement",
      "four times the input displacement",
    ],
    answer: 1,
    explanation:
      "Pascal's law: linear displacement is inversely proportional to the multiplied force. You buy force with distance.",
    knowCold: "Force ×2 → travel ÷2. P = F/A.",
    difficulty: 2,
    source: NOTES("Hydraulic Systems"),
  },
  {
    id: "eq-e7-019",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-hydraulic-pumps"],
    prompt: "Which hydraulic pump MUST incorporate a pressure regulator or unloader valve?",
    options: [
      "Hand pump",
      "Variable displacement pump",
      "Constant displacement pump",
      "All hydraulic pumps",
    ],
    answer: 2,
    explanation:
      "A constant displacement pump delivers steady flow regardless of system pressure, so it needs a regulator or unloader valve. A variable displacement pump regulates volume itself to maintain near constant pressure.",
    knowCold: "Constant displacement → needs an unloader valve.",
    difficulty: 3,
    source: NOTES("Hydraulic Systems"),
  },
  {
    id: "eq-e7-020",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-accumulator"],
    prompt: "The hydraulic accumulator does all of the following EXCEPT",
    options: [
      "act as a shock absorber",
      "provide pressure for one-time emergency use",
      "direct fluid flow to the selected actuator",
      "maintain system pressure during shutdown together with the check valve",
    ],
    answer: 2,
    explanation:
      "Directing flow where it is needed is the selector control valve's job. The accumulator absorbs shock, provides emergency pressure, supports peak demand and holds pressure at shutdown.",
    knowCold: "Accumulator stores pressure; the selector valve routes flow.",
    difficulty: 2,
    source: NOTES("Hydraulic Systems"),
  },
  {
    id: "eq-e7-021",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-power-sources"],
    prompt: "An inverter transforms",
    options: ["AC to DC", "DC to AC", "mechanical energy to AC", "AC to a higher AC voltage"],
    answer: 1,
    explanation:
      "An inverter is an electro-mechanical device transforming DC to AC. A transformer rectifier does the reverse, transforming AC to DC.",
    whyWrong:
      "Inverter and transformer rectifier are direct opposites, which is precisely why they get swapped.",
    knowCold: "Inverter: DC → AC. Transformer rectifier: AC → DC.",
    difficulty: 2,
    source: NOTES("Electrical Systems"),
  },
  {
    id: "eq-e7-022",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-csd"],
    prompt: "The Constant Speed Drive converts",
    options: [
      "variable engine RPM to the constant speed output the generator needs",
      "AC voltage to DC voltage",
      "constant generator speed to variable engine speed",
      "hydraulic pressure to electrical power",
    ],
    answer: 0,
    explanation:
      "The CSD is a hydro-mechanical linkage between engine and generator that turns variable engine RPM into the constant speed the generator requires.",
    knowCold: "CSD: variable engine RPM → constant generator speed.",
    difficulty: 2,
    source: NOTES("Electrical Systems"),
  },
  {
    id: "eq-e7-023",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-buses"],
    prompt: "Equipment required for flight safety, such as the primary attitude gyro, is supplied by the",
    options: ["primary bus", "essential bus", "monitor bus", "starter bus"],
    answer: 1,
    explanation:
      "The essential bus supplies equipment required for flight safety. The primary bus serves mission equipment, the monitor or secondary bus serves convenience circuits, and the starter bus serves the starter circuit.",
    knowCold: "Essential = safety · Primary = mission · Monitor = convenience.",
    difficulty: 2,
    source: NOTES("Electrical Systems"),
  },
  {
    id: "eq-e7-024",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-ac-dc"],
    prompt: "An advantage of alternating current over direct current in aircraft is that AC",
    options: [
      "requires less current, permitting lighter aircraft wiring",
      "is simpler to store in batteries",
      "requires no generator",
      "needs no circuit protection",
    ],
    answer: 0,
    explanation:
      "AC requires less current load, permitting lighter aircraft wiring and saving weight. DC uses heavier components and needs increased maintenance.",
    knowCold: "AC: lighter wiring, less weight.",
    difficulty: 2,
    source: NOTES("Electrical Systems"),
  },
  {
    id: "ecc-e7-025",
    type: "connectChain",
    unit: "e7",
    conceptIds: ["e-fuel-path", "e-fcu"],
    prompt: "Order the fuel path from tank to flame.",
    trigger: "Fuel sits in the tank",
    steps: [
      "Boost pump ensures supply and prevents aeration",
      "Low pressure filter strains impurities",
      "Engine-driven fuel pump delivers high pressure fuel",
      "Fuel Control Unit meters it to engine demand",
      "Manifolds feed the fuel nozzles",
    ],
    explanation:
      "The FCU sits late in the path deliberately: everything upstream just delivers clean fuel at pressure, and the FCU decides how much of it the engine actually gets.",
    knowCold: "Tank → boost → filter → engine pump → FCU → manifolds → nozzles.",
    difficulty: 2,
    source: NOTES("Fuel Systems"),
  },
  /* ---------------- lubricant fundamentals ---------------- */
  {
    id: "eq-lub-001",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-lubricant-function"],
    prompt: "The PRIMARY function of an aircraft lubricant is to",
    options: [
      "carry heat away from the bearings",
      "reduce friction caused by metal-to-metal contact",
      "seal the bearing sump against leakage",
      "trap metal particles before they reach the filter",
    ],
    answer: 1,
    explanation:
      "Reducing friction from metal-to-metal contact is the primary function. The oil provides a film that lets surfaces glide over one another, and without it the engine deteriorates mechanically. Carrying heat away is real, but it is not the headline answer.",
    knowCold: "Primary function: reduce friction from metal-to-metal contact.",
    difficulty: 2,
    source: L208,
  },
  {
    id: "eq-lub-002",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-lubricant-function"],
    prompt:
      "Oil pressure is lost in flight and the film between two bearing surfaces breaks down. The immediate consequence is",
    options: [
      "a rise in oil quantity as the sump refills",
      "metal-to-metal contact and mechanical deterioration",
      "an increase in viscosity from the added heat",
      "no effect until the oil temperature limit is exceeded",
    ],
    answer: 1,
    explanation:
      "The film is the whole mechanism. Lose it and the surfaces touch, which is precisely the friction the lubricant exists to prevent — and it is why a chip detector light matters long before an oil temperature limit is reached.",
    knowCold: "No film → metal on metal → deterioration.",
    difficulty: 3,
    source: L208,
  },
  {
    id: "eq-lub-003",
    type: "spotTheTrap",
    unit: "e7",
    conceptIds: ["e-synthetic-oil"],
    prompt:
      '"Synthetic oils from two different manufacturers may be mixed provided both meet the same specification."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Synthetic oils from different manufacturers should never be mixed or used indiscriminately in the same engine, and they are not compatible with mineral or petroleum base oils at all.",
    knowCold: "Never mix synthetics from different makers. Never mix synthetic with mineral.",
    difficulty: 3,
    source: L208,
  },
  {
    id: "eq-lub-004",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-synthetic-oil"],
    prompt: "Which is an ADVANTAGE of synthetic oil over a petroleum base oil?",
    options: [
      "Longer shelf life",
      "Improved chemical stability at high temperatures",
      "Non-corrosive when spilled",
      "Compatible with mineral oils",
    ],
    answer: 1,
    explanation:
      "The advantages describe how the oil behaves HOT: lower volatility, less tendency to form coking deposits, and improved chemical stability at high temperature. The disadvantages describe how it behaves on the ground — very corrosive, blisters paint when spilled, limited shelf life.",
    whyWrong:
      "Shelf life and corrosion are both on the disadvantage list, which is what makes them tempting distractors.",
    knowCold: "Synthetic advantages are all about heat. Disadvantages are all about handling.",
    difficulty: 3,
    source: L208,
  },
];

/**
 * Gap-fillers. Written after the coverage test flagged concepts that were
 * taught but never assessed — the matrix is what decides these exist, not a
 * guess about what felt under-covered.
 */
export const E_COVERAGE_QUESTIONS: Question[] = [
  {
    id: "eq-cov-001",
    type: "mcq",
    unit: "e4",
    conceptIds: ["e-turbine-construction"],
    prompt: "A turbine section consists of",
    options: [
      "a rotor followed by a stationary stator",
      "a stationary stator followed by a rotor",
      "two counter-rotating rotors",
      "an impeller and a diffuser",
    ],
    answer: 1,
    explanation:
      "Turbines consist of a stationary stator followed by a rotor. The rotor connects to the compressor by a drive shaft, and the section increases airflow velocity.",
    whyWrong:
      "The compressor runs rotor-then-stator; the turbine is the other way round, because the stator must aim the gas at the rotor first.",
    knowCold: "Turbine: stator first, then rotor.",
    difficulty: 2,
    source: {
      document: "Gas Turbine/Reciprocating Engines",
      chapter: "Gas Turbine/Reciprocating Engines",
      eo: ["2.5"],
    },
  },
  {
    id: "eq-cov-002",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-igniters"],
    prompt: "The most common spark igniter in a gas turbine engine is the",
    options: [
      "constrained-gap igniter",
      "annular-gap igniter",
      "hot streak igniter",
      "torch igniter",
    ],
    answer: 1,
    explanation:
      "The annular-gap igniter is most common, protruding into the chamber to provide an effective spark. The constrained-gap type extends the spark beyond the chamber liner face and runs cooler.",
    knowCold: "Annular-gap is the common one; constrained-gap runs cooler.",
    difficulty: 2,
    source: { document: "Engines Condensed Notes", chapter: "Starting and Ignition" },
  },
  {
    id: "eq-cov-003",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-bleed-air"],
    prompt: "Compressor bleed air is used to power",
    options: [
      "the fuel control unit",
      "environmental systems, cabin pressurization and engine anti-icing",
      "the reduction gear box",
      "the magnetic chip detector",
    ],
    answer: 1,
    explanation:
      "Bleed air systems operate off compressor bleed air and power environmental systems, cabin pressurization and engine anti-icing. Mechanically driven accessories instead hang off the accessory gear box.",
    knowCold: "Bleed air: environmental, pressurization, anti-ice.",
    difficulty: 2,
    source: { document: "Engines Condensed Notes", chapter: "Starting and Ignition" },
  },
  {
    id: "eq-cov-004",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-hydraulic-components"],
    prompt: "The component that ensures a fluid leak does not deplete the hydraulic system is the",
    options: ["check valve", "pressure relief valve", "hydraulic fuse", "accumulator"],
    answer: 2,
    explanation:
      "The hydraulic fuse exists specifically so a leak cannot drain the system. The check valve prevents backflow, the relief valve prevents over-pressure, and the accumulator stores pressure.",
    whyWrong:
      "Each of these guards a different failure. The fuse is the one that guards against loss of fluid.",
    knowCold: "Hydraulic fuse stops a leak emptying the system.",
    difficulty: 2,
    source: { document: "Engines Condensed Notes", chapter: "Hydraulic Systems" },
  },
];
