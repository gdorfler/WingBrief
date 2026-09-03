import type { Concept, SourceReference } from "@/lib/types";

/**
 * Engines concepts — the atoms mastery is tracked against.
 *
 * Provenance matters here. All nine systems lectures are now available, so every
 * concept below cites the lecture that actually publishes it and carries that
 * lecture's enabling objectives — including units e6 and e7, which were built
 * from the condensed notes for as long as the systems lectures were
 * missing. Nothing below states a number the sources do not.
 */

const L201 = (eo: string[]): SourceReference => ({
  document: "Principles of Gas Turbine/Reciprocating Operation",
  chapter: "Principles of Gas Turbine/Reciprocating Operation",
  eo,
});
const L202 = (eo: string[]): SourceReference => ({
  document: "Gas Turbine/Reciprocating Engines",
  chapter: "Gas Turbine/Reciprocating Engines",
  eo,
});
const L203 = (eo: string[]): SourceReference => ({
  document: "Compressor Stalls",
  chapter: "Compressor Stalls",
  eo,
});
const L204 = (eo: string[]): SourceReference => ({
  document: "Gas Turbine/Reciprocating Engine Types",
  chapter: "Gas Turbine/Reciprocating Engine Types",
  eo,
});
const L205 = (eo: string[]): SourceReference => ({
  document: "Hydraulic Systems",
  chapter: "Hydraulic Systems",
  eo,
});
const L206 = (eo: string[]): SourceReference => ({
  document: "Electrical Systems",
  chapter: "Electrical Systems",
  eo,
});
const L207 = (eo: string[]): SourceReference => ({
  document: "Fuel Systems",
  chapter: "Fuel Systems",
  eo,
});
const L208 = (eo: string[]): SourceReference => ({
  document: "Lubricants and Lubrication Systems",
  chapter: "Lubricants and Lubrication Systems",
  eo,
});
const L209 = (eo: string[]): SourceReference => ({
  document: "Accessory, Starter and Ignition Systems",
  chapter: "Accessory, Starter and Ignition Systems",
  eo,
});

export const CONCEPTS: Concept[] = [
  /* ================= e1 · Principles ================= */
  {
    id: "e-static-pressure",
    unit: "e1",
    name: "Static pressure",
    definition:
      "The potential of fluid molecules at rest. Inside a gas generator, static pressure is simply called pressure.",
    relationships: ["Molecules at rest → potential energy → static pressure"],
    commonTraps: [
      "Inside the engine, the word 'pressure' on its own means STATIC pressure, and 'velocity' means dynamic pressure.",
    ],
    source: L201(["1.1"]),
  },
  {
    id: "e-dynamic-pressure",
    unit: "e1",
    name: "Dynamic pressure",
    definition:
      "The kinetic energy of fluid molecules in motion. Inside a gas generator, dynamic pressure is simply called velocity.",
    relationships: ["Molecules in motion → kinetic energy → dynamic pressure"],
    source: L201(["1.1"]),
  },
  {
    id: "e-total-pressure",
    unit: "e1",
    name: "Total pressure",
    definition:
      "The sum of static pressure and dynamic pressure. Total pressure = pressure + velocity.",
    relationships: [
      "Static pressure ↓ → dynamic pressure ↑ (total pressure unchanged)",
      "Static pressure ↑ → dynamic pressure ↓ (total pressure unchanged)",
    ],
    formula: "P_{total} = P_{static} + P_{dynamic}",
    commonTraps: [
      "Total pressure is only constant in a closed system. The compressor adds energy, so total pressure rises across it.",
    ],
    source: L201(["1.1"]),
  },
  {
    id: "e-compressibility",
    unit: "e1",
    name: "Air compressibility",
    definition:
      "Air is a compressible fluid, but airflow is treated as relatively incompressible at subsonic speeds. As flow approaches supersonic speed it becomes more compressible.",
    relationships: ["Speed → supersonic → compressibility ↑"],
    commonTraps: [
      "Air is compressible; subsonic AIRFLOW is treated as incompressible. The distinction is what makes the supersonic rules flip.",
    ],
    source: L201(["1.2", "1.3"]),
  },
  {
    id: "e-subsonic-convergent",
    unit: "e1",
    name: "Subsonic flow, convergent duct",
    definition:
      "Bernoulli: an incompressible fluid passing through a convergent opening increases velocity and decreases pressure.",
    relationships: ["Subsonic + convergent → velocity ↑, pressure ↓"],
    source: L201(["1.2"]),
  },
  {
    id: "e-subsonic-divergent",
    unit: "e1",
    name: "Subsonic flow, divergent duct",
    definition:
      "As a subsonic fluid passes through a divergent opening the velocity decreases and the pressure increases.",
    relationships: ["Subsonic + divergent → velocity ↓, pressure ↑"],
    source: L201(["1.2"]),
  },
  {
    id: "e-supersonic-ducts",
    unit: "e1",
    name: "Supersonic flow reverses",
    definition:
      "Supersonic airflow does the opposite of subsonic. A convergent opening decreases supersonic velocity and increases pressure; a divergent opening increases velocity and decreases pressure.",
    relationships: [
      "Supersonic + convergent → velocity ↓, pressure ↑",
      "Supersonic + divergent → velocity ↑, pressure ↓",
    ],
    commonTraps: [
      "The most reliable trap in the block: the shape does not decide the outcome, the SPEED REGIME does.",
    ],
    source: L201(["1.3"]),
  },
  {
    id: "e-nozzle",
    unit: "e1",
    name: "Nozzle",
    definition:
      "A duct that always increases velocity and decreases pressure. Whether it is convergent or divergent depends on whether the flow is subsonic or supersonic.",
    relationships: ["Nozzle → velocity ↑, pressure ↓ (always)"],
    commonTraps: [
      "A nozzle is defined by what it DOES, not by its shape. A supersonic nozzle is divergent.",
    ],
    source: L201(["1.2", "1.3"]),
  },
  {
    id: "e-diffuser",
    unit: "e1",
    name: "Diffuser",
    definition:
      "A duct that always decreases velocity and increases pressure. Whether it is convergent or divergent depends on the speed regime.",
    relationships: ["Diffuser → velocity ↓, pressure ↑ (always)"],
    commonTraps: [
      "A subsonic diffuser is divergent; a supersonic diffuser is convergent. Same job, opposite shape.",
    ],
    source: L201(["1.2", "1.3"]),
  },
  {
    id: "e-gas-generator",
    unit: "e1",
    name: "Gas generator",
    definition:
      "The core that produces the high energy airflow needed to create thrust. Every gas generator minimally includes a compressor, a combustion chamber and a turbine.",
    relationships: ["Compressor → combustion chamber → turbine"],
    commonTraps: [
      "The three main sections are compressor, combustion chamber and turbine. The inlet and exhaust are not part of the gas generator.",
    ],
    source: L201(["1.4", "1.7"]),
  },
  {
    id: "e-brayton",
    unit: "e1",
    name: "Brayton cycle",
    definition:
      "The gas turbine operating cycle: intake, compression, combustion, exhaust. Its four events occur SIMULTANEOUSLY and continuously.",
    relationships: ["Intake → compression → combustion → exhaust, all at once"],
    commonTraps: [
      "Brayton and Otto have the same four events. The difference is simultaneous (Brayton) versus sequential (Otto).",
    ],
    source: L201(["1.5"]),
  },
  {
    id: "e-otto",
    unit: "e1",
    name: "Otto cycle",
    definition:
      "The reciprocating engine operating cycle: intake, compression, combustion, exhaust. Its four events occur SEQUENTIALLY — suck, squeeze, bang, blow.",
    relationships: ["Intake → compression → combustion → exhaust, one after another"],
    source: L201(["1.6"]),
  },

  /* ================= e2 · Thrust ================= */
  {
    id: "e-thrust-equation",
    unit: "e2",
    name: "Thrust equation",
    definition:
      "Thrust is the result of the pressure, temperature and velocity changes as airflow passes through the engine: thrust equals mass times acceleration.",
    formula: "T = m \\times a",
    relationships: ["Mass ↑ → thrust ↑", "Acceleration ↑ → thrust ↑"],
    source: L201(["1.8"]),
  },
  {
    id: "e-gross-thrust",
    unit: "e2",
    name: "Gross thrust",
    definition:
      "Thrust measured on stationary engines or aircraft ground run-ups, based on standard day conditions (29.92 inHg, 15 °C). It ignores inlet air velocity and measures exhaust gas velocity only.",
    commonTraps: [
      "Gross thrust IGNORES inlet velocity. That is the whole difference from net thrust.",
    ],
    source: L201(["1.8"]),
  },
  {
    id: "e-net-thrust",
    unit: "e2",
    name: "Net thrust",
    definition:
      "Thrust corrected for the effects of inlet airflow velocity — the more realistic measurement, and what 'thrust' usually means. Net and gross thrust are equal when inlet velocity is zero at standard day conditions.",
    formula: "T_{net} = m \\times \\frac{V_{final} - V_{initial}}{t}",
    relationships: ["Inlet velocity ↑ → net thrust ↓"],
    source: L201(["1.8"]),
  },
  {
    id: "e-density-thrust",
    unit: "e2",
    name: "Density drives thrust",
    definition:
      "Density is mass per unit volume, and it feeds the mass term directly. If air density increases, mass increases, so thrust increases. Every atmospheric factor works through density.",
    relationships: ["Density ↑ → mass ↑ → thrust ↑"],
    source: L201(["1.9", "1.10", "1.11"]),
  },
  {
    id: "e-temperature-thrust",
    unit: "e2",
    name: "Temperature and thrust",
    definition:
      "Decreasing air temperature moves molecules closer together, increasing density, which increases thrust. Colder air means more thrust.",
    relationships: ["Temperature ↓ → density ↑ → thrust ↑"],
    source: L201(["1.9"]),
  },
  {
    id: "e-pressure-thrust",
    unit: "e2",
    name: "Pressure and thrust",
    definition:
      "As air pressure decreases the molecules move farther apart, making the air less dense. Lower pressure produces less thrust.",
    relationships: ["Pressure ↓ → density ↓ → thrust ↓"],
    source: L201(["1.11"]),
  },
  {
    id: "e-altitude-thrust",
    unit: "e2",
    name: "Altitude and thrust",
    definition:
      "Thrust decreases with altitude because the drop in pressure has a greater impact than the drop in temperature. Above 36,000 ft temperature stabilises and no longer offsets pressure, so thrust falls off more rapidly.",
    relationships: [
      "Altitude ↑ → thrust ↓",
      "Above 36,000 ft → thrust ↓ more rapidly",
    ],
    commonTraps: [
      "Altitude brings both colder air (helps) and lower pressure (hurts). Pressure wins — thrust drops.",
      "36,000 ft is the point where temperature stops helping, so the loss accelerates.",
    ],
    source: L201(["1.10"]),
  },
  {
    id: "e-rpm-thrust",
    unit: "e2",
    name: "RPM and thrust",
    definition:
      "Any increase in RPM increases thrust, but not linearly. At low RPM a throttle increase produces very little extra thrust; at high RPM a small throttle increase produces a large thrust increase.",
    relationships: ["RPM ↑ → thrust ↑, and the effect grows with RPM"],
    commonTraps: [
      "The relationship is not linear. Most of the thrust lives in the top end of the RPM range.",
    ],
    source: L201(["1.12"]),
  },
  {
    id: "e-airspeed-thrust",
    unit: "e2",
    name: "Airspeed and thrust",
    definition:
      "Airspeed acts on the acceleration term. As inlet velocity approaches the magnitude of exhaust velocity, thrust is reduced.",
    relationships: ["Airspeed ↑ → inlet velocity approaches exhaust velocity → thrust ↓"],
    source: L201(["1.13"]),
  },
  {
    id: "e-ram-effect",
    unit: "e2",
    name: "Ram effect",
    definition:
      "At higher speeds more air molecules are rammed into the inlet, increasing mass. This increase keeps thrust fairly constant at subsonic speeds, and at supersonic speeds thrust greatly increases.",
    relationships: [
      "Speed ↑ → mass rammed in ↑ → offsets the airspeed thrust loss",
      "Subsonic → thrust roughly constant · Supersonic → thrust increases greatly",
    ],
    commonTraps: [
      "Airspeed alone reduces thrust; ram effect is what cancels it out. The exam tests both halves.",
    ],
    source: L201(["1.14"]),
  },
  {
    id: "e-epr",
    unit: "e2",
    name: "Engine Pressure Ratio (EPR)",
    definition:
      "A gauge indicating the pressure ratio between inlet and exhaust airflow. It automatically accounts for some inlet airflow variation and is used in most turbojet and turbofan aircraft.",
    source: L201(["1.15"]),
  },
  {
    id: "e-torquemeter",
    unit: "e2",
    name: "Torquemeter",
    definition:
      "The gauge propeller or rotor driven aircraft use to determine power available. It indicates shaft horsepower available to drive the propeller or rotor.",
    commonTraps: [
      "Torquemeter is for turboprop and turboshaft. EPR is for turbojet and turbofan.",
    ],
    source: L201(["1.15"]),
  },
  {
    id: "e-tachometer",
    unit: "e2",
    name: "Tachometer",
    definition:
      "The most commonly used cockpit gauge, indicating engine rotation speed calibrated in percent RPM. It does not measure thrust, but gives a quick assessment of the energy the engine is producing.",
    commonTraps: [
      "The tachometer MONITORS only — it does not measure thrust.",
    ],
    source: L201(["1.15"]),
  },

  /* ================= e3 · Inlet and Compressor ================= */
  {
    id: "e-inlet-purpose",
    unit: "e3",
    name: "Inlet duct purpose",
    definition:
      "To provide the proper amount of high pressure, turbulent-free air that is steady and uniform to the first stage of the compressor. Inlet ducts are designed to act as diffusers.",
    relationships: ["Uniform, turbulence-free air → compressor stalls avoided"],
    commonTraps: [
      "The inlet is a DIFFUSER: it raises pressure and lowers velocity before the compressor.",
    ],
    source: L202(["2.1"]),
  },
  {
    id: "e-single-entrance",
    unit: "e3",
    name: "Single entrance inlet duct",
    definition:
      "The simplest and most efficient duct, located directly in front of the engine to scoop in undisturbed air. Short single ducts can cause stall at slow airspeed or high AOA.",
    source: L202(["2.1"]),
  },
  {
    id: "e-divided-entrance",
    unit: "e3",
    name: "Divided entrance inlet duct",
    definition:
      "Ducts in the wing root or either side of the fuselage. Shorter ducts, pilots sit lower, less friction loss — but they create more inlet air turbulence.",
    commonTraps: [
      "Divided entrance trades less friction loss for MORE turbulence.",
    ],
    source: L202(["2.1"]),
  },
  {
    id: "e-inlet-geometry",
    unit: "e3",
    name: "Inlet duct geometry",
    definition:
      "A subsonic inlet is divergent. A supersonic inlet is convergent/divergent: it must first slow the flow below supersonic, then further reduce velocity and raise pressure like a subsonic inlet.",
    relationships: ["Subsonic inlet → divergent", "Supersonic inlet → convergent/divergent"],
    source: L202(["2.1"]),
  },
  {
    id: "e-variable-geometry-inlet",
    unit: "e3",
    name: "Variable geometry inlet",
    definition:
      "Uses mechanical ramps, cones or wedges to change duct shape with speed: divergent at subsonic speeds, convergent/divergent at supersonic speeds, so it keeps acting as a diffuser throughout.",
    source: L202(["2.1"]),
  },
  {
    id: "e-compressor-purpose",
    unit: "e3",
    name: "Compressor purpose",
    definition:
      "To supply enough high pressure air to satisfy combustion. Because the compressor is driven by energy from the turbine, both airflow pressure AND velocity increase across it.",
    relationships: ["Compressor → pressure ↑ and velocity ↑"],
    commonTraps: [
      "The compressor raises both pressure and velocity — it is not a closed system, the turbine is feeding energy in.",
    ],
    source: L202(["2.2"]),
  },
  {
    id: "e-centrifugal-compressor",
    unit: "e3",
    name: "Centrifugal flow compressor",
    definition:
      "Three main components: impeller, diffuser and manifold. The impeller accelerates air outward (velocity ↑, and its divergent blade shape raises pressure), the diffuser converts velocity to pressure, and the manifold routes air to the combustion chambers.",
    relationships: ["Impeller → velocity ↑ · Diffuser → pressure ↑"],
    source: L202(["2.2"]),
  },
  {
    id: "e-centrifugal-tradeoffs",
    unit: "e3",
    name: "Centrifugal advantages and disadvantages",
    definition:
      "Advantages: rugged, low cost, good power output over a large RPM range, high pressure increase per stage. Disadvantages: large frontal area increases drag, and it is impractical for multiple stages.",
    commonTraps: [
      "Centrifugal gives a high pressure rise PER STAGE but cannot be practically stacked into many stages.",
    ],
    source: L202(["2.2"]),
  },
  {
    id: "e-axial-compressor",
    unit: "e3",
    name: "Axial flow compressor",
    definition:
      "Applies straight-line flow through two elements: a rotor and a stator. One rotor blade plus one stator forms a single stage. Multiple stages give the greatest overall compression ratios, between 15:1 and 30:1.",
    relationships: [
      "Rotor → pressure and velocity ↑",
      "Stator → velocity ↓, pressure ↑, and straightens the flow",
    ],
    commonTraps: [
      "A stage is ONE rotor plus ONE stator, not one blade row.",
    ],
    source: L202(["2.2"]),
  },
  {
    id: "e-axial-tradeoffs",
    unit: "e3",
    name: "Axial advantages and disadvantages",
    definition:
      "Advantages: high peak efficiencies, less drag from a small frontal area, straight-through airflow, higher combustion efficiency from multiple stages. Disadvantages: compressor stalls more likely at low airspeeds, difficult and costly to manufacture, good efficiency only in a narrow RPM range.",
    commonTraps: [
      "Axial is the stall-prone one at low airspeed; centrifugal is the rugged wide-RPM one.",
    ],
    source: L202(["2.2"]),
  },
  {
    id: "e-spools",
    unit: "e3",
    name: "Single and dual spool",
    definition:
      "A single spool compressor is driven by a single turbine. A dual spool has two independent compressor spools each driven by its own turbine, arranged forward to aft as low pressure compressor, high pressure compressor, high pressure turbine, low pressure turbine.",
    relationships: [
      "LP turbine drives LP compressor · HP turbine drives HP compressor",
      "Different spool speeds → vacuum effect → smoother airflow transition",
    ],
    commonTraps: [
      "Order forward to aft is LPC → HPC → HPT → LPT. The high pressure pair sits in the middle.",
    ],
    source: L202(["2.2"]),
  },
  {
    id: "e-axial-centrifugal",
    unit: "e3",
    name: "Axial-centrifugal compressor",
    definition:
      "Combines both types: straight-through airflow plus a large pressure increase through the impeller. Well suited to smaller mission aircraft but not suited to supersonic airflow. The T-6 uses a four-stage axial compressor and one centrifugal impeller.",
    source: L202(["2.2"]),
  },
  {
    id: "e-guide-vanes",
    unit: "e3",
    name: "Inlet and exit guide vanes",
    definition:
      "Inlet guide vanes impart swirl in the direction of compressor rotation, directing air to the first stage rotor and reducing aerodynamic drag on it. Exit (straightening) vanes are the last stator set, preparing airflow for the diffuser and reducing rotational turbulence.",
    source: L202(["2.2"]),
  },
  {
    id: "e-compressor-diffuser",
    unit: "e3",
    name: "The diffuser",
    definition:
      "Prepares air for the burner section by decreasing velocity and giving a final pressure increase. It is the point of highest compression in the engine and is divergent in design.",
    commonTraps: [
      "The diffuser — not the last compressor stage — is the point of HIGHEST pressure in the engine.",
    ],
    source: L202(["2.2"]),
  },
  {
    id: "e-station-changes",
    unit: "e3",
    name: "Changes through the engine",
    definition:
      "Section by section: inlet raises pressure and drops velocity; compressor raises velocity, temperature and pressure; the diffuser raises pressure and drops velocity; combustion raises temperature and velocity with a slight pressure drop; the turbine raises velocity and drops pressure; the exhaust gives a final velocity increase and pressure decrease.",
    relationships: [
      "Inlet → P ↑, V ↓",
      "Compressor → V ↑, T ↑, P ↑",
      "Combustion → T ↑, V ↑, P slightly ↓",
      "Turbine → V ↑, P ↓",
      "Exhaust → V ↑, P ↓",
    ],
    commonTraps: [
      "Combustion causes a SLIGHT PRESSURE DROP, not a rise — the heat goes into temperature and velocity.",
    ],
    source: L201(["1.7"]),
  },

  /* ================= e4 · Burn, Turbine, Exhaust ================= */
  {
    id: "e-burner-purpose",
    unit: "e4",
    name: "Burner section purpose",
    definition:
      "Provides proper mixing of fuel and air to ensure combustion, delivers gases to the turbine at a temperature that will not exceed turbine blade limits, and adds enough heat energy to accelerate the gases and produce the desired thrust.",
    source: L202(["2.3"]),
  },
  {
    id: "e-primary-secondary-air",
    unit: "e4",
    name: "Primary and secondary air",
    definition:
      "The combustion chamber splits airflow from the diffuser: 25% is primary air, mixed with fuel for ignition; 75% is secondary air, flowing around the chamber to cool the thin chamber walls and the turbine, control the flame, and feed afterburner operation.",
    relationships: ["25% primary → burns · 75% secondary → cools and controls"],
    commonTraps: [
      "Only a quarter of the air is actually burned. The 25/75 split is a favourite exam number.",
    ],
    source: L202(["2.3"]),
  },
  {
    id: "e-burner-criteria",
    unit: "e4",
    name: "Combustion chamber design criteria",
    definition:
      "Minimise pressure decrease, achieve combustion efficiency, prevent the flame blowing out, and complete burning before gases enter the turbine section.",
    source: L202(["2.4"]),
  },
  {
    id: "e-can-chamber",
    unit: "e4",
    name: "Can combustion chamber",
    definition:
      "Used with older centrifugal compressor engines. Primary air is ducted to each can via the manifold; secondary air flows around the liners. Advantages: strength, durability, ease of maintenance. Disadvantages: poor use of chamber space, greater pressure loss, and malfunctions can cause cold spots on the turbine.",
    source: L202(["2.4"]),
  },
  {
    id: "e-annular-chamber",
    unit: "e4",
    name: "Annular combustion chamber",
    definition:
      "A continuous circular inner liner and outer shroud surrounding the compressor drive shaft, the liner called the burner basket, with fuel introduced through a series of nozzles. Advantages: uniform heat distribution across the turbine face, much smaller circumference reducing engine diameter. Disadvantages: maintenance requires major engine overhaul, and structural problems in the large thin-walled shrouds.",
    commonTraps: [
      "Annular is the one that gives UNIFORM heat across the turbine face and the smallest diameter.",
    ],
    source: L202(["2.4"]),
  },
  {
    id: "e-can-annular-chamber",
    unit: "e4",
    name: "Can-annular combustion chamber",
    definition:
      "Combustion occurs in cans with hot gases mixing in the annular portion, used primarily on larger high performance aircraft. It eliminates cold spots from clogged nozzles. Advantages: ease of maintenance with good thermodynamics, greater structural stability, efficient design, lower pressure loss. Disadvantage: high cost of procurement and replacement.",
    source: L202(["2.4"]),
  },
  {
    id: "e-turbine-purpose",
    unit: "e4",
    name: "Turbine energy split",
    definition:
      "The sole purpose of the turbine is to transform 75% of the heat energy of the expanding gases into mechanical energy to drive the compressor and accessory gear box. The remaining 25% is used for thrust.",
    relationships: ["75% of heat energy → drives compressor and AGB · 25% → thrust"],
    commonTraps: [
      "Two different 25/75 splits live one section apart: AIR in the burner (25% primary) and ENERGY at the turbine (75% to the compressor).",
    ],
    source: L202(["2.5"]),
  },
  {
    id: "e-turbine-construction",
    unit: "e4",
    name: "Turbine construction",
    definition:
      "A stationary stator followed by a rotor. Turbine rotors connect to the compressor by a drive shaft, and the turbine section increases airflow velocity in developing thrust. Turbines may be single or dual spool, matching the compressor they drive.",
    source: L202(["2.5"]),
  },
  {
    id: "e-creep",
    unit: "e4",
    name: "Creep",
    definition:
      "The abnormal elongation of turbine blades due to overheating, which can result in permanent blade deformation. Caused by excessive temperature and speed at the most stressed part of the engine.",
    relationships: ["Excessive temperature and speed → blade elongation → permanent deformation"],
    source: L202(["2.6"]),
  },
  {
    id: "e-fir-tree",
    unit: "e4",
    name: "Fir tree attachment",
    definition:
      "The method of attaching turbine blades to the wheel that provides for normal expansion of the blades due to heating.",
    source: L202(["2.6"]),
  },
  {
    id: "e-exhaust-section",
    unit: "e4",
    name: "Exhaust section",
    definition:
      "Directs the flow of hot gases rearward, causing a high exit velocity while preventing turbulence. Its parts are the exhaust outer duct, the exhaust inner cone and radial struts.",
    source: L202(["2.7"]),
  },
  {
    id: "e-exhaust-nozzles",
    unit: "e4",
    name: "Exhaust nozzle types",
    definition:
      "A convergent nozzle accelerates gases from the turbine, increasing velocity and directing exhaust to a focal point. A convergent/divergent nozzle is used in supersonic aircraft: the convergent section accelerates gases toward the speed of sound and the divergent section allows further acceleration to supersonic speeds.",
    source: L202(["2.7"]),
  },
  {
    id: "e-afterburner",
    unit: "e4",
    name: "Afterburner",
    definition:
      "Increases maximum thrust available for short periods, such as takeoff, by igniting secondary and bypass air. Thrust can increase by 50% or more.",
    relationships: ["Afterburner on → thrust ↑ 50% or more"],
    source: L202(["2.8"]),
  },
  {
    id: "e-afterburner-ignition",
    unit: "e4",
    name: "Afterburner ignition types",
    definition:
      "Spark ignition using a spark igniter is most common. Torch ignition uses a pilot light. Hot streak ignition sends additional ignited fuel from the combustion chamber streaking through the turbine to light the afterburner.",
    source: L202(["2.8"]),
  },
  {
    id: "e-afterburner-components",
    unit: "e4",
    name: "Afterburner components",
    definition:
      "Spray bars introduce fuel to the exhaust section. Flame holders mix fuel and air and stabilise flames in the duct. Screech liners are perforated sleeves reducing pressure fluctuations and vibration like a shock absorber. The variable exhaust nozzle opens and closes with a leaf or iris arrangement.",
    source: L202(["2.8"]),
  },
  {
    id: "e-variable-exhaust-nozzle",
    unit: "e4",
    name: "Variable exhaust nozzle",
    definition:
      "Convergent when the afterburner is off, accelerating subsonic gases. It opens during afterburner operation to let gases expand, preventing them backing up and causing back pressure — which can stall the compressor.",
    relationships: ["Nozzle fails to open in afterburner → back pressure → compressor stall"],
    commonTraps: [
      "This is the link between the exhaust and a compressor stall: back pressure travels forward.",
    ],
    source: L202(["2.8"]),
  },
  {
    id: "e-recip-components",
    unit: "e4",
    name: "Reciprocating engine components",
    definition:
      "The basic components are the crankcase, cylinders, pistons, connecting rods, valves, valve-operating mechanism and crankshaft.",
    source: L202(["2.9"]),
  },

  /* ================= e5 · Compressor Stalls ================= */
  {
    id: "e-compressor-relative-wind",
    unit: "e5",
    name: "Compressor relative wind",
    definition:
      "Relative wind inside the compressor is formed by combining the inlet airflow with the compressor RPM. Any change to inlet airflow or compressor RPM changes the relative wind.",
    relationships: ["Inlet airflow + compressor RPM → compressor relative wind"],
    source: L203(["3.1"]),
  },
  {
    id: "e-compressor-aoa",
    unit: "e5",
    name: "Compressor blade AOA",
    definition:
      "The angle between the rotor blade chordline and the compressor relative wind. Too low an AOA is inefficient; too high an AOA yields a stall.",
    relationships: [
      "Compressor RPM ↑ (inlet airflow constant) → AOA ↑",
      "Inlet airflow ↓ (RPM constant) → AOA ↑",
      "AOA ↑ → compressor stall likelihood ↑",
    ],
    commonTraps: [
      "Anything that DECREASES inlet airflow or INCREASES compressor RPM raises blade AOA and stall risk.",
    ],
    source: L203(["3.1", "3.2"]),
  },
  {
    id: "e-stall-definition",
    unit: "e5",
    name: "Compressor stall",
    definition:
      "Rotors and stators are airfoils, and a stall occurs when airflow over an airfoil breaks away and it loses lift due to excessive angle of attack. A compressor stall could lead to engine flameout.",
    source: L203(["3.2"]),
  },
  {
    id: "e-stall-indications",
    unit: "e5",
    name: "Compressor stall indications",
    definition:
      "Depending on severity: mild pulsations, engine vibration with noise, and fluctuating torquemeter, ITT, compressor and fuel flow gauges. Severe stalls show a noticeable change in engine sound with loud bangs, engine RPM decrease and ITT increase.",
    relationships: ["Severe stall → RPM ↓ and ITT ↑"],
    commonTraps: [
      "The directional pair to memorise: RPM goes DOWN, ITT goes UP.",
    ],
    source: L203(["3.2"]),
  },
  {
    id: "e-airflow-distortion",
    unit: "e5",
    name: "Airflow distortion",
    definition:
      "The most common cause of compressor stall. Sources are abrupt aircraft attitude change, air turbulence, deficiency of air velocity or volume caused by atmospheric conditions, and rapid throttle movement.",
    commonTraps: [
      "Airflow distortion — not mechanical failure — is the MOST COMMON cause.",
    ],
    source: L203(["3.3"]),
  },
  {
    id: "e-mechanical-malfunctions",
    unit: "e5",
    name: "Mechanical malfunctions causing stall",
    definition:
      "Four of them: variable inlet guide vane failure causing insufficient airflow at lower RPM; fuel control unit failure letting extra fuel flow to the burner and causing excessive back pressure; foreign object damage reducing blades' ability to act as airfoils; and variable exhaust nozzle failure to open during afterburner operation causing massive back pressure.",
    source: L203(["3.3"]),
  },
  {
    id: "e-stall-avoidance",
    unit: "e5",
    name: "Stall avoidance",
    definition:
      "Pilot actions: avoid erratic or abrupt Power Control Lever movement, maintain prescribed minimums, avoid abrupt changes in aircraft attitude, and avoid flight through severe weather or air turbulence.",
    commonTraps: [
      "Avoidance is what the PILOT does. Prevention is what the ENGINE is designed with.",
    ],
    source: L203(["3.4"]),
  },
  {
    id: "e-stall-prevention",
    unit: "e5",
    name: "Stall prevention design features",
    definition:
      "Four engine system components reduce stall possibility: variable inlet guide vanes, a dual/twin/split-spool axial flow compressor, bleed valves, and a variable exhaust nozzle.",
    source: L203(["3.5"]),
  },
  {
    id: "e-stall-recovery",
    unit: "e5",
    name: "Compressor stall recovery",
    definition:
      "In order: reduce aircraft attitude to lower the inlet air AOA; slowly retard the PCL below the stall threshold so the engine can catch up with the inlet airflow; bleed valves increase airflow; once indications return to normal, slowly advance the PCL to the desired setting.",
    relationships: ["Lower the nose → retard PCL slowly → bleed valves → slowly advance PCL"],
    commonTraps: [
      "The FIRST action is lowering the nose to reduce AOA, not touching the throttle.",
      "Every PCL movement in the recovery is SLOW. Avoid unnecessary PCL movement.",
    ],
    source: L203(["3.4"]),
  },

  /* ================= e6 · Engine Types ================= */
  {
    id: "e-turbojet",
    unit: "e6",
    name: "Turbojet",
    definition:
      "A gas turbine engine with an inlet and exhaust section that derives thrust from accelerating air through the engine. Advantages: flies higher and faster than other types, best high-end performance, lightest specific weight. Disadvantages: low propulsive efficiency at low airspeeds, high TSFC, longer takeoff requirements.",
    source: L204(["4.2"]),
  },
  {
    id: "e-turbofan",
    unit: "e6",
    name: "Turbofan",
    definition:
      "Generates additional thrust from bypassed air using a fan driven by the turbine: 40–70% of thrust from the gas generator and 30–60% from the ducted fan, with lower TSFC than a turbojet. Advantages: higher thrust at low airspeed, lower TSFC, shorter takeoff, considerable noise reduction. Disadvantages: higher specific weight, larger frontal area for drag, less efficient at higher altitudes.",
    relationships: ["Bypass ratio ↑ → TSFC ↓ (more fuel efficient)"],
    commonTraps: [
      "Airliners and cargo aircraft run HIGH bypass ratios; fighters run LOW bypass to behave more like a turbojet.",
    ],
    source: L204(["4.3", "4.4"]),
  },
  {
    id: "e-turboprop",
    unit: "e6",
    name: "Turboprop",
    definition:
      "A gas generator with a propeller driven by the turbine section: 90% of thrust comes from the propeller and 10% from the exhaust gases. Advantages: very high thrust at low airspeed, excellent takeoff and low altitude performance, superior for heavy loads off short runways, lowest TSFC of any gas turbine engine. Disadvantages: heavier and more complicated, speed limited to roughly 400–450 knots.",
    relationships: ["90% thrust from propeller · 10% from exhaust"],
    source: L204(["4.5", "4.6"]),
  },
  {
    id: "e-rgb",
    unit: "e6",
    name: "Reduction gear box",
    definition:
      "Converts high RPM, low torque turbine rotation to low RPM, high torque for the propeller. It prevents the propeller reaching supersonic tip speeds, which would lower efficiency.",
    relationships: ["Turbine RPM high, torque low → RGB → prop RPM low, torque high"],
    source: L204(["4.7"]),
  },
  {
    id: "e-turboprop-torquemeter",
    unit: "e6",
    name: "Turboprop torquemeter",
    definition:
      "Connects the reduction gear box to the turbine and measures power output from the gas turbine engine. It comprises an inner torque shaft carrying the load from engine to propeller, and a reference outer shaft providing a stationary reference.",
    source: L204(["4.8"]),
  },
  {
    id: "e-propeller-ranges",
    unit: "e6",
    name: "Alpha and beta range",
    definition:
      "Alpha is the flight range: PCL from idle to full power, the PCL controls the fuel control unit which controls fuel flow, and the propeller governor controls blade angle. Beta is the ground-only range: PCL from idle to max reverse, mechanically connected to the FCU and the pitch change assembly.",
    commonTraps: [
      "Alpha is flight, beta is ground only. In beta the PCL is mechanically linked to blade pitch.",
    ],
    source: L204(["4.6"]),
  },
  {
    id: "e-turboshaft",
    unit: "e6",
    name: "Turboshaft",
    definition:
      "Very similar to a turboprop but always uses a free or power turbine separate from the gas generator to power its rotor, driven by the exhaust gases. All propulsive energy comes from rotor rotation and none from the exhaust gases.",
    commonTraps: [
      "Turboshaft gets NO propulsive thrust from exhaust; a turboprop still gets 10%.",
    ],
    source: L204(["4.9", "4.10"]),
  },
  {
    id: "e-tsfc",
    unit: "e6",
    name: "TSFC and propulsive efficiency",
    definition:
      "Thrust Specific Fuel Consumption is the amount of fuel required to produce one pound of thrust. Propulsive efficiency is the efficiency of converting kinetic energy to propulsive force. Bypass ratio is the ratio of bypassed air to air through the gas generator.",
    relationships: ["TSFC ↓ → more fuel efficient"],
    source: L204(["4.1", "4.12", "4.13"]),
  },
  {
    id: "e-recip-propulsion",
    unit: "e6",
    name: "Reciprocating engine propulsion",
    definition:
      "All thrust comes from a propeller driven by crankshaft rotation, either directly connected or through a reduction gear box. A governor controls blade angle and propeller speed.",
    source: L204(["4.11"]),
  },

  /* ================= e7 · Aircraft Systems ================= */
  {
    id: "e-fuel-path",
    unit: "e7",
    name: "Fuel system path",
    definition:
      "Fuel tank, boost pump, low pressure filter, engine-driven fuel pump, fuel control unit, pressurizing and dump valve, then the primary and secondary manifolds to the fuel nozzles.",
    relationships: ["Tank → boost pump → filter → engine-driven pump → FCU → P&D valve → manifolds → nozzles"],
    source: L207(["7.4"]),
  },
  {
    id: "e-boost-pump",
    unit: "e7",
    name: "Boost pump",
    definition:
      "Submerged in the fuel tanks, it ensures adequate fuel supply to the engine-driven fuel pump. A critical function is preventing aeration of the fuel, which may result from rapid pressure change during climb.",
    commonTraps: [
      "The boost pump's critical job is preventing AERATION, not just moving fuel.",
    ],
    source: L207(["7.4"]),
  },
  {
    id: "e-fcu",
    unit: "e7",
    name: "Fuel Control Unit",
    definition:
      "The brain of the fuel system, providing the fuel manifold with metered fuel. It senses compressor inlet temperature, RPM, turbine temperature (ITT) and PCL input to meet fuel-flow requirements for starting, acceleration, deceleration and stabilized operation. Where an afterburner is fitted, the basic fuel system includes a separate afterburner FCU, which meters fuel to the afterburner nozzles — the spraybars.",
    commonTraps: [
      "In manual FCU operation the pilot must monitor ITT visually, and loses acceleration-limiting, RPM-limiting and governing protection.",
    ],
    source: L207(["7.4", "7.6", "7.7"]),
  },
  {
    id: "e-fuel-manifolds",
    unit: "e7",
    name: "Primary and secondary manifolds",
    definition:
      "The primary manifold is smaller, letting fuel reach high pressure for a high degree of atomization during starting and altitude idling. The secondary manifold supplies fuel once engine RPM raises fuel pressure to a predetermined level.",
    source: L207(["7.4"]),
  },
  {
    id: "e-fuel-types",
    unit: "e7",
    name: "Military fuels",
    definition:
      "JP-4 is highly volatile with a −35 °F flash point. JP-5 is the Navy's primary jet fuel with a 140 °F flash point, thermally stable, and the only jet fuel used aboard ships. JP-8 has a 100 °F flash point and is used by NATO and the Air Force. Avgas has a −45 °F flash point and is highly volatile.",
    relationships: ["Volatility ↑ → flash point ↓ (inversely related)"],
    commonTraps: [
      "JP-5 is the shipboard fuel precisely because its flash point is HIGH (140 °F).",
    ],
    source: L207(["7.1", "7.2", "7.3"]),
  },
  {
    id: "e-thrust-ratings",
    unit: "e7",
    name: "Thrust ratings",
    definition:
      "Based on allowable turbine inlet temperature. Normal thrust is produced at the maximum continuous turbine temperature with no time limit. Military thrust is at maximum turbine temperature for a limited time, roughly 30 minutes. Combat thrust uses the afterburner and is not based on turbine temperature limitations.",
    source: L207(["7.5"]),
  },
  {
    id: "e-oil-sumps",
    unit: "e7",
    name: "Wet and dry sump",
    definition:
      "A wet sump stores oil in a tank internal to the engine, which makes cooling difficult and cannot adapt to unusual flight attitudes. A dry sump stores oil externally, allowing better cooling, a more streamlined engine and larger oil quantities.",
    source: L208(["8.4"]),
  },
  {
    id: "e-oil-subsystems",
    unit: "e7",
    name: "The three oil subsystems",
    definition:
      "Pressure supplies oil to the engine and accessory gear box. Scavenge removes oil from bearings and accessory drives, circulates it through coolers and returns it to the tank. Breather uses compressor bleed air to pressurize the tank and engine, minimising leakage and ensuring proper spray patterns.",
    relationships: ["Pressure → scavenge → breather"],
    source: L208(["8.4"]),
  },
  {
    id: "e-oil-pump",
    unit: "e7",
    name: "Oil pump and scavenge capacity",
    definition:
      "The oil pump has pressure and scavenge components, with the scavenge side having greater capacity to prevent back pressure and accumulation of oil in the bearing sump cavities.",
    commonTraps: [
      "Scavenge capacity is deliberately GREATER than pressure capacity.",
    ],
    source: L208(["8.4"]),
  },
  {
    id: "e-oil-contamination",
    unit: "e7",
    name: "Oil contamination",
    definition:
      "Four causes: metal particles from metal-to-metal contact, which is the most common; coking, or carbon deposits formed by oil evaporation; foreign objects such as sand and dirt; and oil contamination from storing synthetic oil too long.",
    commonTraps: [
      "Metal particles are the MOST COMMON contamination.",
    ],
    source: L208(["8.4"]),
  },
  {
    id: "e-chip-detector",
    unit: "e7",
    name: "Magnetic chip detector",
    definition:
      "A magnetized metal plug in the scavenge oil path that illuminates a cockpit warning light once it collects enough metal particles.",
    source: L208(["8.4"]),
  },
  {
    id: "e-viscosity",
    unit: "e7",
    name: "Viscosity and squeeze film",
    definition:
      "Viscosity is the property of a fluid that resists force tending to make it flow, and it is inversely related to temperature. Squeeze film is a thin film of lubricant preventing metal-to-metal contact and dissipating heat; proper viscosity is required to form it.",
    relationships: ["Temperature ↑ → viscosity ↓"],
    source: L208(["8.3"]),
  },
  {
    id: "e-start-sequence",
    unit: "e7",
    name: "Normal starting sequence",
    definition:
      "The starter engages until the engine attains self-accelerating speed, fuel flows after engine RPM reaches 30%, and ignition occurs when sufficient airflow supports combustion of the fuel/air mixture.",
    relationships: ["Starter → 30% RPM → fuel → ignition"],
    source: L209(["9.3"]),
  },
  {
    id: "e-abnormal-starts",
    unit: "e7",
    name: "Four abnormal starts",
    definition:
      "Hot start: turbine temperature exceeds the maximum allowed during start. Hung start: turbine temperature continues to rise while compressor RPM stabilizes below normal. False start: compressor RPM stabilizes below normal but turbine temperature stays within limits. Wet start: the fuel-air mixture does not light off initially but can at any time — the most dangerous type.",
    commonTraps: [
      "Hung and false starts both stabilize RPM below normal. The difference is TEMPERATURE: hung is rising, false is within limits.",
      "Wet start is the MOST DANGEROUS abnormal start.",
    ],
    source: L209(["9.4"]),
  },
  {
    id: "e-starters",
    unit: "e7",
    name: "Engine starters",
    definition:
      "A DC electric motor starter is used on smaller engines, mechanically connected to the compressor with the battery supplying voltage. An air turbine starter is used on larger gas turbine engines, a small geared air turbine through which air is delivered to accelerate the compressor.",
    source: L209(["9.5", "9.6"]),
  },
  {
    id: "e-igniters",
    unit: "e7",
    name: "Spark igniters",
    definition:
      "The annular-gap igniter is most common, protruding into the chamber to provide an effective spark. The constrained-gap igniter extends the spark beyond the face of the chamber liner and operates at cooler temperatures.",
    source: L209(["9.7"]),
  },
  {
    id: "e-bleed-air",
    unit: "e7",
    name: "Bleed air and accessories",
    definition:
      "Bleed air systems operate off compressor bleed air and power environmental systems, cabin pressurization and engine anti-icing. Mechanically driven accessories attach to the accessory gear box, gear driven off the main shaft, and include the tachometer, hydraulic pumps and alternator.",
    source: L209(["9.1", "9.2"]),
  },
  {
    id: "e-pascal",
    unit: "e7",
    name: "Pascal's law",
    definition:
      "Pressure applied to a liquid in a confined system is constant, P = F/A. Linear displacement is inversely proportional to the multiplied force: if output force is twice the input, output displacement is half the input.",
    formula: "P = \\frac{F}{A}",
    relationships: ["Force multiplied ×2 → displacement ÷2"],
    source: L205(["5.1", "5.2"]),
  },
  {
    id: "e-hydraulic-pumps",
    unit: "e7",
    name: "Hydraulic pumps",
    definition:
      "A hand pump is a backup providing alternate hydraulic power, normally classified as an emergency system. A variable displacement power pump regulates fluid volume to system demand, maintaining near constant pressure. A constant displacement power pump delivers steady flow regardless of system pressure and must incorporate a pressure regulator or unloader valve.",
    commonTraps: [
      "The constant displacement pump is the one that REQUIRES a pressure regulator/unloader valve.",
    ],
    source: L205(["5.3"]),
  },
  {
    id: "e-accumulator",
    unit: "e7",
    name: "Accumulator",
    definition:
      "Compressed air or nitrogen separated from fluid by a diaphragm. It acts as a shock absorber, provides pressure for one-time emergency use, supports system pressure during peak operation, and maintains system pressure during shutdown together with the check valve.",
    source: L205(["5.3"]),
  },
  {
    id: "e-hydraulic-components",
    unit: "e7",
    name: "Hydraulic components",
    definition:
      "The check valve allows one-way flow, preventing backflow. The pressure relief valve prevents pressure building up and bursting seals by returning fluid to the reservoir. The hydraulic fuse ensures a leak does not deplete the system. The selector control valve directs flow where needed. The actuator converts fluid power into mechanical force and motion.",
    source: L205(["5.3"]),
  },
  {
    id: "e-ac-dc",
    unit: "e7",
    name: "AC and DC power",
    definition:
      "Alternating current alternates equally either side of base voltage and requires lower current loads, permitting lighter aircraft wiring and saving weight. Direct current is straight line voltage with heavier components and increased maintenance.",
    source: L206(["6.1"]),
  },
  {
    id: "e-power-sources",
    unit: "e7",
    name: "Electrical power sources",
    definition:
      "AC comes from an alternator, which transforms mechanical energy into AC and is the primary source, or an inverter, which transforms DC to AC. DC comes from a DC generator, a transformer rectifier which transforms AC to DC, or the battery, primarily for emergency power and engine starting.",
    commonTraps: [
      "Inverter goes DC → AC. Transformer rectifier goes AC → DC. The exam swaps them.",
    ],
    source: L206(["6.2"]),
  },
  {
    id: "e-csd",
    unit: "e7",
    name: "Constant Speed Drive",
    definition:
      "A hydro-mechanical linkage connecting engine and generator that converts the variable RPM from the engine to the constant speed output the generator needs.",
    source: L206(["6.2"]),
  },
  {
    id: "e-buses",
    unit: "e7",
    name: "Distribution buses",
    definition:
      "Four types. The essential bus supplies equipment required for flight safety. The primary bus supplies equipment for the aircraft mission. The monitor or secondary bus supplies convenience circuits such as cabin lighting. The starter bus supplies the starter circuit for engine starts.",
    commonTraps: [
      "Essential = flight safety. Primary = mission. Monitor/secondary = convenience.",
    ],
    source: L206(["6.2"]),
  },
  {
    id: "e-lubricant-function",
    unit: "e7",
    name: "What a lubricant is for",
    definition:
      "The primary function of aircraft lubricants is to reduce friction caused by metal-to-metal contact. The lubricant provides a film that lets surfaces glide over one another with less friction, and lubrication is essential to avoid mechanical deterioration.",
    relationships: [
      "Film between the surfaces → less friction → less wear",
      "No film → metal-to-metal contact → mechanical deterioration",
    ],
    commonTraps: [
      "Reducing friction is the PRIMARY function. Carrying heat away matters too, but it is not the headline answer.",
    ],
    source: L208(["8.1"]),
  },
  {
    id: "e-synthetic-oil",
    unit: "e7",
    name: "Synthetic lubricants",
    definition:
      "Today's military aircraft use synthetic oil. Synthetic oils from different manufacturers should never be mixed or used indiscriminately in the same engine, and they are not compatible with mineral or petroleum base oils. Advantages are lower volatility, less tendency to form coking deposits, and improved chemical stability at high temperatures. Disadvantages are that it is very corrosive, blisters or removes paint when spilled, and has a limited shelf life.",
    relationships: [
      "Lower volatility and better high-temperature stability → suits gas turbine temperatures",
      "Very corrosive and blisters paint → a handling problem on the ground",
    ],
    commonTraps: [
      "Never mix synthetic oils from different manufacturers, and never mix synthetic with mineral or petroleum base oil.",
      "The advantages are about how the oil behaves HOT; the disadvantages are about how it behaves when it is spilled or stored.",
    ],
    source: L208(["8.2"]),
  },
];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);
