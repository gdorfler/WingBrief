import type { Question, SourceReference } from "@/lib/types";

/**
 * Depth for the six lectures that were missing when units e6 and e7 were
 * built.
 *
 * Those units were written from the condensed notes, which are a summary — so
 * they inherited a summary's density. Once the systems lectures were
 * supplied and their 36 objectives mapped, fourteen of them turned out to be
 * carrying only two questions each, against a median of six across e1–e5.
 *
 * These are the third questions for the thinnest of them, written from the
 * lecture slides rather than the notes — which is why several of them can now
 * ask about detail the notes never carried: the two shafts inside a
 * torquemeter, the difference between a hung and a false start, and the two
 * types of spark igniter.
 */

const L204: SourceReference = {
  document: "Gas Turbine/Reciprocating Engine Types",
  chapter: "Gas Turbine/Reciprocating Engine Types",
};
const L205: SourceReference = {
  document: "Hydraulic Systems",
  chapter: "Hydraulic Systems",
};
const L207: SourceReference = {
  document: "Fuel Systems",
  chapter: "Fuel Systems",
};
const L208: SourceReference = {
  document: "Lubricants and Lubrication Systems",
  chapter: "Lubricants and Lubrication Systems",
};
const L209: SourceReference = {
  document: "Accessory, Starter and Ignition Systems",
  chapter: "Accessory, Starter and Ignition Systems",
};

export const LECTURE_QUESTIONS: Question[] = [
  /* ---------------- engine types ---------------- */
  {
    id: "eq-lec-001",
    type: "mcq",
    unit: "e6",
    conceptIds: ["e-turbojet"],
    prompt:
      "A design team needs the best high-end performance and the lightest specific weight, and can accept the fuel penalty. The engine type is a",
    options: ["turbojet", "high-bypass turbofan", "turboprop", "turboshaft"],
    answer: 0,
    explanation:
      "The turbojet flies higher and faster than the other types, has the best high-end performance and the lightest specific weight — weight per pound of thrust. It pays for that with low propulsive efficiency at low airspeed, a high TSFC and longer takeoff requirements.",
    knowCold: "Turbojet: highest and fastest, lightest per pound of thrust, thirstiest.",
    difficulty: 3,
    source: L204,
  },
  {
    id: "eq-lec-002",
    type: "mcq",
    unit: "e6",
    conceptIds: ["e-rgb"],
    prompt:
      "The reduction gear box on a turboprop takes the turbine's high RPM and low torque and delivers",
    options: [
      "high RPM and high torque",
      "low RPM and high torque",
      "low RPM and low torque",
      "the same RPM at reduced torque",
    ],
    answer: 1,
    explanation:
      "Low RPM and high torque, which is what a propeller needs to work efficiently. The RGB also keeps the blade tips from reaching supersonic speeds — where efficiency collapses — and doubles as a mounting pad for accessories.",
    knowCold: "RGB: high RPM low torque IN, low RPM high torque OUT.",
    difficulty: 3,
    source: L204,
  },
  {
    id: "eq-lec-003",
    type: "mcq",
    unit: "e6",
    conceptIds: ["e-turboprop-torquemeter"],
    prompt:
      "Inside a torquemeter assembly, the component that twists under load and produces the measurement is the",
    options: [
      "reference shaft, the outer one",
      "torque shaft, the inner one",
      "reduction gear box output shaft",
      "propeller governor drive",
    ],
    answer: 1,
    explanation:
      "The torque shaft is the INNER shaft: it carries the load from the propeller and produces the measured twist. The reference shaft is the outer one and does NOT twist — it exists to give the torque shaft something to be measured against. The assembly sits between the gas generator and the RGB.",
    whyWrong:
      "If the reference shaft twisted too there would be nothing to compare against, which is precisely why it does not.",
    knowCold: "Torque shaft inner and twists. Reference shaft outer and does not.",
    difficulty: 3,
    source: L204,
  },
  {
    id: "eq-lec-004",
    type: "spotTheTrap",
    unit: "e6",
    conceptIds: ["e-turboshaft"],
    prompt:
      '"A free or power turbine is mechanically connected to the gas generator shaft."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False, and that is the whole point of the arrangement. A free or power turbine has NO physical connection to the gas generator — it is driven by the gas stream alone, which lets it turn at a speed independent of the compressor.",
    knowCold: "Free turbine: driven by the gas, connected to nothing.",
    difficulty: 3,
    source: L204,
  },

  /* ---------------- hydraulics ---------------- */
  {
    id: "eq-lec-005",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-pascal"],
    prompt:
      "In a closed hydraulic system the output piston multiplies force by four. Its linear displacement compared with the input piston is",
    options: ["four times as far", "the same distance", "one quarter as far", "unrelated to the force"],
    answer: 2,
    explanation:
      "Linear displacement is INVERSELY proportional to the multiplied force. Multiply force by four and the output piston moves a quarter of the distance. Pressure through the confined fluid never changes — you are buying force with distance, not creating energy.",
    whyWrong:
      "Getting four times the force over four times the distance would be free energy, which is the intuition this objective exists to correct.",
    knowCold: "Force x4 → travel ÷4. Pressure unchanged.",
    difficulty: 3,
    source: L205,
  },

  /* ---------------- thrust ratings ---------------- */
  {
    id: "eq-lec-006",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-thrust-ratings"],
    prompt: "Which thrust rating is NOT based on a turbine temperature limit?",
    options: ["Normal", "Military", "Combat", "All three are"],
    answer: 2,
    explanation:
      "Combat thrust is produced with the afterburner in operation and is not based on turbine temperature limitations. Normal is the maximum continuous turbine temperature with no time limit; Military is the maximum turbine temperature for a limited time, 30 minutes.",
    knowCold: "Normal unlimited · Military 30 min · Combat afterburner, no turbine temp basis.",
    difficulty: 3,
    source: L207,
  },

  /* ---------------- accessories, starting, ignition ---------------- */
  {
    id: "eq-lec-007",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-bleed-air"],
    prompt: "Gas turbine accessory systems are powered either by compressor bleed air or by",
    options: [
      "the aircraft battery",
      "being mechanically driven off the accessory gear box",
      "ram air through the inlet",
      "the exhaust gas stream",
    ],
    answer: 1,
    explanation:
      "Two routes, and only two: compressor bleed air, or a mechanical drive off the accessory gear box mounted around the compressor. Bleed air powers environmental systems, cabin pressurisation and engine anti-ice; the gear box drives the tachometer, hydraulic pumps and the alternator or generator.",
    knowCold: "Accessories run on bleed air or off the accessory gear box.",
    difficulty: 3,
    source: L209,
  },
  {
    id: "eq-lec-008",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-abnormal-starts"],
    prompt:
      "During a start the compressor RPM stabilises below normal while turbine temperature stays within limits. This is a",
    options: ["hot start", "hung start", "false start", "wet start"],
    answer: 2,
    explanation:
      "A false start: RPM stabilises below normal and the temperature remains WITHIN limits. A hung start looks similar on the tachometer but the turbine temperature keeps RISING — the temperature is what separates the two.",
    whyWrong:
      "Hung and false both stall the RPM below normal. Only the temperature tells them apart, which is why the exam pairs them.",
    knowCold: "Hung: RPM low and temp climbing. False: RPM low, temp fine.",
    difficulty: 3,
    source: L209,
  },
  {
    id: "eq-lec-009",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-abnormal-starts"],
    prompt: "The most dangerous type of abnormal start is the",
    options: ["hot start", "hung start", "false start", "wet start"],
    answer: 3,
    explanation:
      "The wet start — the fuel-air mixture does not light off initially but CAN at any time. Unburnt fuel is sitting in a hot engine waiting for an ignition source, which is why it is rated above even a hot start.",
    knowCold: "Wet start is the dangerous one: it did not light, and it still might.",
    difficulty: 3,
    source: L209,
  },
  {
    id: "eq-lec-010",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-igniters"],
    prompt:
      "Of the two types of spark igniter, the one that extends the spark beyond the face of the chamber liner and runs cooler is the",
    options: ["annular-gap igniter", "constrained-gap igniter", "torch igniter", "hot streak igniter"],
    answer: 1,
    explanation:
      "The constrained-gap igniter extends its spark beyond the liner face and therefore operates at cooler temperatures than the annular-gap type, which protrudes into the chamber and is the more common of the two.",
    knowCold: "Annular-gap protrudes in and is common. Constrained-gap reaches out and runs cooler.",
    difficulty: 3,
    source: L209,
  },
  {
    id: "eq-lec-011",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-igniters"],
    prompt:
      "Military aircraft use a high heat-intensity capacitor ignition system in order to",
    options: [
      "reduce the electrical load on the starter bus",
      "ensure ignition of low-volatility fuel at all temperatures and high altitudes",
      "allow the igniters to run continuously in cruise",
      "eliminate the need for an air turbine starter",
    ],
    answer: 1,
    explanation:
      "The high heat discharge guarantees the low-volatility fuel lights at any temperature and at altitude, and it also keeps the igniters from fouling. Low volatility is what makes JP-5 safe aboard ship, and it is the same property that makes a powerful igniter necessary.",
    knowCold: "High-intensity capacitor ignition: lights low-volatility fuel anywhere, and stays clean.",
    difficulty: 3,
    source: L209,
  },
  {
    id: "eq-lec-012",
    type: "spotTheTrap",
    unit: "e7",
    conceptIds: ["e-lubricant-function"],
    prompt:
      '"The primary function of an aircraft lubricant is to carry heat away from the bearings."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Cooling is real and useful, but the PRIMARY function is reducing friction caused by metal-to-metal contact. The oil provides a film that lets the surfaces glide over one another, and losing that film is what causes mechanical deterioration.",
    knowCold: "Primary function: reduce friction. Cooling is a bonus, not the headline.",
    difficulty: 3,
    source: L208,
  },
  {
    id: "eq-lec-013",
    type: "mcq",
    unit: "e7",
    conceptIds: ["e-synthetic-oil"],
    prompt:
      "Oil is spilled on the airframe during a synthetic oil servicing. The concern this raises is",
    options: [
      "the oil will thicken and block the scavenge line",
      "paint blistering or removal, because synthetic oil is very corrosive",
      "the oil will evaporate and leave coking deposits",
      "none — synthetic oil is inert on external surfaces",
    ],
    answer: 1,
    explanation:
      "Synthetic oil is very corrosive and blisters or removes paint when spilled. That, along with a limited shelf life, is on the disadvantage side. Lower volatility, less coking tendency and better high-temperature stability are the advantages — and those are all about how it behaves inside a hot engine.",
    knowCold: "Synthetic: great hot, hazardous spilled.",
    difficulty: 3,
    source: L208,
  },
];
