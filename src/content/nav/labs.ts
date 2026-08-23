import type { Lab } from "@/lib/types";

/**
 * The benches.
 *
 * Aerodynamics and Engines simulate a relationship; Flight Rules resolves a
 * situation; Weather moves the atmosphere. Navigation's interactive section is
 * the instrument itself, out on the bench with nothing riding on the answer —
 * which is the right shape for a course whose subject is the tool.
 */
export const LABS: Lab[] = [
  {
    id: "nlab-variation",
    title: "Variation, both ways",
    subtitle: "East is least, and the reversal",
    teaches: "That the conversion has a direction, and the sign follows it",
    unit: "n3",
    conceptIds: ["nav-variation", "nav-variation-conversion"],
    component: "VariationLab",
    chain: ["True course", "Apply variation", "Magnetic course"],
  },
  {
    id: "nlab-zone-wheel",
    title: "The zone wheel",
    subtitle: "Local and Zulu, on one face",
    teaches: "That the sign in the formula is a direction of rotation",
    unit: "n4",
    conceptIds: ["nav-time-zones", "nav-zulu-conversion"],
    component: "ZoneWheelLab",
    chain: ["Local time", "Zone description", "Zulu"],
  },
  {
    id: "nlab-chart",
    title: "The chart table",
    subtitle: "Plotter, dividers, and a whole sheet",
    teaches: "Where every measurement on a Lambert chart comes from",
    unit: "n5",
    conceptIds: ["nav-plotter", "nav-dividers", "nav-measuring-direction", "nav-measuring-distance"],
    component: "ChartLab",
    chain: ["Draw the line", "Measure the course", "Carry the span"],
  },
  {
    id: "nlab-cr3-calc",
    title: "The calculation side",
    subtitle: "One rotation, every ratio",
    teaches: "That a slide rule fixes a relationship, not an answer",
    unit: "n6",
    conceptIds: ["nav-cr3-wheels", "nav-ratio", "nav-rate-index", "nav-floating-decimal"],
    component: "Cr3CalcLab",
    chain: ["Set a pair", "A ratio is fixed", "Read any other pair"],
  },
  {
    id: "nlab-airspeed",
    title: "Airspeed and altitude",
    subtitle: "Watch TAS pull away from CAS",
    teaches: "How density turns one airspeed into another",
    unit: "n7",
    conceptIds: ["nav-tas", "nav-cas", "nav-density-effect", "nav-pressure-altitude", "nav-mach"],
    component: "AirspeedLab",
    chain: ["Altitude ↑", "Density ↓", "TAS ↑"],
  },
  {
    id: "nlab-cr3-wind",
    title: "The wind side",
    subtitle: "One wind, every course",
    teaches: "How the two components trade places as the course turns",
    unit: "n8",
    conceptIds: ["nav-wind-triangle", "nav-quartering", "nav-preflight-procedure", "nav-wind-scales"],
    component: "Cr3WindLab",
    chain: ["Plot the wind", "Turn the rose", "Read the components"],
  },
  {
    id: "nlab-point-to-point",
    title: "Point to point",
    subtitle: "The wind grid as a map",
    teaches: "That the same face solves a problem with no wind in it at all",
    unit: "n9",
    conceptIds: ["nav-point-to-point"],
    component: "PointToPointLab",
    chain: ["Plot both fixes", "Rotate vertical", "Read the course"],
  },
  {
    id: "nlab-jet-log",
    title: "The jet log",
    subtitle: "An empty en route section",
    teaches: "What belongs in each column, and that nothing fills itself in",
    unit: "n10",
    conceptIds: ["nav-jet-log", "nav-jet-log-enroute", "nav-planning-steps"],
    component: "JetLogLab",
    chain: ["Course and distance", "ETE", "Leg fuel", "EFR"],
  },
  {
    id: "nlab-reference",
    title: "The reference card",
    subtitle: "Formulas, memory aids and tolerances",
    teaches: "Everything the guide prints on its own back cover",
    unit: "n1",
    conceptIds: ["nav-dr-components", "nav-definition"],
    component: "ReferenceLab",
  },
];
