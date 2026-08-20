import type { Unit } from "@/lib/types";

/**
 * Six units, reordered from the trainee guide into the clearest learning
 * progression while preserving source accuracy. The trainee guide's own order
 * (Basic Theory → Lift & Drag → Stalls → Performance & Maneuvering → Spins →
 * Wake/Wind Shear) buries drag inside the lift lesson and splits stalls away
 * from the boundary layer that causes them. This ordering builds the chain:
 *
 *   atmosphere → dynamic pressure → lift → drag → performance → limits → hazards
 */
export const UNITS: Unit[] = [
  {
    id: "u1",
    index: 1,
    title: "Learn the Language",
    subtitle: "Air, airspeed and geometry",
    promise:
      "Every later answer depends on these definitions. Get them exact once.",
    accent: "brand",
  },
  {
    id: "u2",
    index: 2,
    title: "Understand the Wing",
    subtitle: "How lift is actually made",
    promise: "Pressure difference, the lift equation, and the CL vs AOA curve.",
    accent: "go",
  },
  {
    id: "u3",
    index: 3,
    title: "Master Drag",
    subtitle: "Parasite, induced, and L/Dₘₐₓ",
    promise:
      "Two drags that move in opposite directions — and where they cross.",
    accent: "caution",
  },
  {
    id: "u4",
    index: 4,
    title: "Performance",
    subtitle: "Thrust, power and the curves",
    promise:
      "Read a thrust or power curve and predict what every change does to it.",
    accent: "violet",
  },
  {
    id: "u5",
    index: 5,
    title: "Limits & Maneuvering",
    subtitle: "Stalls, turns and the envelope",
    promise: "Where the wing quits, and how hard you may pull before it does.",
    accent: "navy",
  },
  {
    id: "u6",
    index: 6,
    title: "Departures & Hazards",
    subtitle: "Spins, wake and shear",
    promise: "The ways controlled flight ends, and how to avoid each one.",
    accent: "nogo",
  },
];

export const UNIT_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u])) as Record<
  Unit["id"],
  Unit
>;
