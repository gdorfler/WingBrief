import type { Unit } from "@/lib/types";

/**
 * Flight Rules and Regulations units.
 *
 * The trainee guide runs three long lesson topics (7-1 Federal Aviation
 * Organization, 7-2 Visual/Instrument Flight Rules, 7-3 Airspace and General
 * Flight Rules). Those are the right SOURCE boundaries but the wrong LEARNING
 * boundaries — 7-3 alone carries fifteen enabling objectives spanning airspace
 * classes, right-of-way and noise abatement.
 *
 * So the units are cut by what a student has to hold in their head at once:
 * who writes the rules, how you plan, what keeps you alive, the airport, the
 * VFR/IFR divide, cruising altitudes, airspace, and the general rules that
 * apply everywhere.
 */
export const UNITS: Unit[] = [
  {
    id: "f1",
    index: 1,
    title: "Rules and Regulators",
    subtitle: "Who writes them, which wins",
    promise:
      "Name the publication that governs any given situation, know which one outranks the others, and read 'shall' and 'should' as the regulation means them.",
    accent: "brand",
  },
  {
    id: "f2",
    index: 2,
    title: "Planning and Responsibility",
    subtitle: "The PIC and the paperwork",
    promise:
      "Know exactly what the pilot in command is answerable for before the aircraft moves, and what a flight plan and weather brief actually buy you.",
    accent: "navy",
  },
  {
    id: "f3",
    index: 3,
    title: "Safety and the Human",
    subtitle: "Equipment, oxygen, fatigue",
    promise:
      "Recall the equipment you must be wearing, the altitudes that demand oxygen, and the limits CNAF places on crew rest, alcohol and medication.",
    accent: "go",
  },
  {
    id: "f4",
    index: 4,
    title: "The Airport",
    subtitle: "Signals, signs and lights",
    promise:
      "Read a runway number, a light gun signal, a tetrahedron and a glideslope indicator without hesitating.",
    accent: "caution",
  },
  {
    id: "f5",
    index: 5,
    title: "VFR and IFR",
    subtitle: "Which rules you are flying under",
    promise:
      "Separate VMC from VFR, know the minimums for takeoff and destination, and know your options when the weather closes in en route.",
    accent: "brand",
  },
  {
    id: "f6",
    index: 6,
    title: "Altitudes and Aerobatics",
    subtitle: "Semicircular rules and limits",
    promise:
      "Pick a legal cruising altitude from a magnetic course in seconds, and know exactly where aerobatics are prohibited.",
    accent: "violet",
  },
  {
    id: "f7",
    index: 7,
    title: "Airspace",
    subtitle: "Six classes, one set of questions",
    promise:
      "Identify any airspace class from its dimensions, state what it takes to enter, and recall the VFR weather minimums that apply inside it.",
    accent: "brand",
  },
  {
    id: "f8",
    index: 8,
    title: "General Flight Rules",
    subtitle: "Rules that apply everywhere",
    promise:
      "Resolve a right-of-way conflict, stay above the minimum safe altitude, stay under the speed limit, and know what CNAF forbids outright.",
    accent: "nogo",
  },
];

export const UNIT_BY_ID: Record<string, Unit> = Object.fromEntries(
  UNITS.map((u) => [u.id, u]),
);
