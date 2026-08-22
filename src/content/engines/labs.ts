import type { Lab } from "@/lib/types";

/**
 * Engines sim labs.
 *
 * These are relationship simulators, not engine models. The sources give
 * directions, splits and one break point (36,000 ft); they do not publish a
 * thrust table or a compressor map, so nothing here computes an absolute
 * value it cannot justify.
 */
export const LABS: Lab[] = [
  {
    id: "elab-flow",
    title: "Engine Flow Lab",
    subtitle: "Step the gas path station by station",
    teaches:
      "What pressure, temperature and velocity do in each section — including the slight pressure drop across combustion.",
    unit: "e1",
    conceptIds: ["e-station-changes", "e-gas-generator"],
    component: "EngineFlowLab",
    chain: [
      "Inlet acts as a diffuser: pressure up, velocity down",
      "Compressor adds energy: pressure, temperature and velocity all up",
      "Combustion: temperature and velocity up, pressure slightly down",
      "Turbine extracts 75% of the energy: velocity up, pressure down",
      "Exhaust: final velocity increase, pressure decrease",
    ],
  },
  {
    id: "elab-duct",
    title: "Duct Lab",
    subtitle: "Convergent, divergent, subsonic, supersonic",
    teaches:
      "That duct shape alone predicts nothing — the speed regime decides whether a duct is a nozzle or a diffuser.",
    unit: "e1",
    conceptIds: ["e-subsonic-convergent", "e-subsonic-divergent", "e-supersonic-ducts", "e-nozzle", "e-diffuser"],
    component: "DuctLab",
    chain: [
      "Pick a shape: convergent or divergent",
      "Pick a regime: subsonic or supersonic",
      "Subsonic follows Bernoulli",
      "Supersonic inverts it",
      "Read whether the duct is acting as a nozzle or a diffuser",
    ],
  },
  {
    id: "elab-thrust",
    title: "Thrust Factor Lab",
    subtitle: "Temperature, altitude, RPM, airspeed",
    teaches:
      "Which way thrust moves for each factor, and why altitude has a break point at 36,000 ft.",
    unit: "e2",
    conceptIds: ["e-density-thrust", "e-altitude-thrust", "e-rpm-thrust", "e-airspeed-thrust"],
    component: "ThrustFactorLab",
    chain: [
      "Every atmospheric factor acts through density",
      "Density sets the mass term in T = m × a",
      "Altitude: pressure loss beats temperature gain",
      "Above 36,000 ft temperature stops offsetting pressure",
      "RPM is strongly non-linear",
    ],
  },
  {
    id: "elab-compressor",
    title: "Compressor Lab",
    subtitle: "Stages, spools and pressure rise",
    teaches:
      "How stacking rotor-stator stages multiplies pressure, and what a dual spool arrangement buys.",
    unit: "e3",
    conceptIds: ["e-axial-compressor", "e-spools", "e-centrifugal-compressor"],
    component: "CompressorLab",
    chain: [
      "One rotor plus one stator is one stage",
      "Rotor adds velocity and pressure",
      "Stator converts velocity to pressure and straightens flow",
      "More stages, more overall compression",
      "The diffuser gives the final rise — the highest pressure in the engine",
    ],
  },
  {
    id: "elab-stall",
    title: "Compressor Stall Lab",
    subtitle: "Drive blade AOA to the stall",
    teaches:
      "That inlet airflow and compressor RPM push blade angle of attack in opposite directions.",
    unit: "e5",
    conceptIds: ["e-compressor-aoa", "e-compressor-relative-wind", "e-stall-indications"],
    component: "CompressorStallLab",
    chain: [
      "Relative wind = inlet airflow + compressor RPM",
      "Reduce inlet airflow → relative wind swings → AOA up",
      "Increase RPM → same result",
      "Past the limit the flow breaks away",
      "Indications: RPM down, ITT up",
    ],
  },
  {
    id: "elab-turboprop",
    title: "Turboprop Power Lab",
    subtitle: "Turbine to gear box to propeller",
    teaches:
      "Where a turboprop's thrust comes from, and what the reduction gear box is actually for.",
    unit: "e6",
    conceptIds: ["e-turboprop", "e-rgb", "e-turboshaft", "e-turbofan"],
    component: "TurbopropLab",
    chain: [
      "Combustion energy reaches the turbine",
      "Turbine drives the shaft at high RPM, low torque",
      "Reduction gear box trades RPM for torque",
      "Propeller tips stay subsonic",
      "90% of thrust from the propeller, 10% from exhaust",
    ],
  },
  {
    id: "elab-systems",
    title: "Systems Trace Lab",
    subtitle: "Follow fuel and oil through the engine",
    teaches:
      "The order of components in the fuel and lubrication paths, and what each one is there to prevent.",
    unit: "e7",
    conceptIds: ["e-fuel-path", "e-fcu", "e-oil-subsystems", "e-chip-detector"],
    component: "SystemsTraceLab",
    chain: [
      "Fuel: tank → boost pump → filter → engine-driven pump → FCU → manifolds → nozzles",
      "Boost pump prevents aeration during climb",
      "FCU meters against CIT, RPM, ITT and PCL",
      "Oil: pressure supplies, scavenge returns, breather pressurizes",
      "Chip detector watches the scavenge path for metal",
    ],
  },
  {
    id: "elab-malfunction",
    title: "Malfunction Lab",
    subtitle: "Read the symptoms, name the failure",
    teaches:
      "How to work backwards from cockpit indications to the mechanical cause.",
    unit: "e5",
    conceptIds: ["e-mechanical-malfunctions", "e-stall-indications", "e-abnormal-starts"],
    component: "MalfunctionLab",
    chain: [
      "Read the indications presented",
      "Decide whether it is airflow distortion or a mechanical malfunction",
      "Name the specific failure",
      "See the mechanical explanation",
    ],
  },
  {
    id: "elab-hot-section",
    title: "Hot Section Lab",
    subtitle: "Burner, turbine, exhaust",
    teaches:
      "Where the burner's air actually goes, how much of the turbine's energy never reaches the exhaust, and why a supersonic nozzle needs a divergent section.",
    unit: "e4",
    conceptIds: ["e-burner-purpose", "e-turbine-construction", "e-exhaust-nozzles", "e-afterburner"],
    component: "HotSectionLab",
    chain: [
      "25% of burner air supports combustion, 75% cools",
      "Combustion: temperature and velocity up, pressure slightly down",
      "The turbine takes 75% of the energy back for the compressor",
      "A convergent nozzle can only reach the speed of sound",
      "The divergent section is what takes the flow supersonic",
    ],
  },
];

export const LAB_BY_ID: Record<string, Lab> = Object.fromEntries(
  LABS.map((l) => [l.id, l]),
);
