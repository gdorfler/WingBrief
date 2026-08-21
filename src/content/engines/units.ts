import type { Unit } from "@/lib/types";

/**
 * Engines units.
 *
 * The spine is the physical path air takes through the engine — inlet,
 * compressor, burner, turbine, exhaust — because that is both how the official
 * lectures are ordered and how the exam reasons about cause and effect. The
 * principles that govern that path come first, stalls follow the compressor
 * they happen in, and the surrounding aircraft systems close the course.
 */
export const UNITS: Unit[] = [
  {
    id: "e1",
    index: 1,
    title: "Principles of Operation",
    subtitle: "Pressure, velocity and the cycle",
    promise:
      "Read any duct in the engine and say what pressure and velocity are doing — including the supersonic case, where the rules flip.",
    accent: "brand",
  },
  {
    id: "e2",
    index: 2,
    title: "Making Thrust",
    subtitle: "Mass, acceleration and density",
    promise:
      "Predict which way thrust moves when temperature, altitude, RPM or airspeed changes, and name the gauge that shows it.",
    accent: "caution",
  },
  {
    id: "e3",
    index: 3,
    title: "Inlet and Compressor",
    subtitle: "Getting air ready to burn",
    promise:
      "Know what each compressor type buys and costs, and why the air arriving at the burner is high pressure and low velocity.",
    accent: "brand",
  },
  {
    id: "e4",
    index: 4,
    title: "Burn, Turbine, Exhaust",
    subtitle: "Where the energy goes",
    promise:
      "Follow the 25/75 splits — of air in the burner and of energy at the turbine — and know what the exhaust section does with what is left.",
    accent: "nogo",
  },
  {
    id: "e5",
    index: 5,
    title: "Compressor Stalls",
    subtitle: "Blade AOA, causes and recovery",
    promise:
      "Recognise a compressor stall from its indications, name what caused it, and fly the recovery in the right order.",
    accent: "caution",
  },
  {
    id: "e6",
    index: 6,
    title: "Engine Types",
    subtitle: "Turbojet to turboshaft",
    promise:
      "Match an engine type to its mission from its thrust split, TSFC and speed limits.",
    accent: "violet",
  },
  {
    id: "e7",
    index: 7,
    title: "Aircraft Systems",
    subtitle: "Fuel, oil, air and power",
    promise:
      "Trace fuel, oil, hydraulic and electrical power from source to use, and read the warning that says one has failed.",
    accent: "navy",
  },
];

export const UNIT_BY_ID: Record<string, Unit> = Object.fromEntries(
  UNITS.map((u) => [u.id, u]),
);
