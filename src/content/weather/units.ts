import type { Unit } from "@/lib/types";

/**
 * Weather units.
 *
 * The condensed notes are organised into four blocks — Theory, Mechanics,
 * Hazards, Planning and Resources — which is how the material was written but
 * not how it is learned. WX 2 alone runs from gradient wind through cloud
 * types, stability, four lifting methods and all four fronts.
 *
 * These units instead follow the atmosphere itself, from the ground upward and
 * from cause to consequence: what the air IS, how high you are in it, what
 * moisture does to it, what makes it move, what it builds, where masses meet,
 * and then the three hazards that come out of all of that — before finishing
 * with the products that let you see it coming.
 */
export const UNITS: Unit[] = [
  {
    id: "w1",
    index: 1,
    title: "The Atmosphere",
    subtitle: "Pressure, temperature and the layer weather lives in",
    promise:
      "Describe the troposphere, quote the standard atmosphere and both lapse rates, and explain why every bit of weather is ultimately a heat exchange.",
    accent: "brand",
  },
  {
    id: "w2",
    index: 2,
    title: "Altitude and the Altimeter",
    subtitle: "Five altitudes, one instrument",
    promise:
      "Name each type of altitude, say what the Kollsman window is doing, and predict which way the altimeter lies on a hot or a cold day.",
    accent: "navy",
  },
  {
    id: "w3",
    index: 3,
    title: "Moisture and Stability",
    subtitle: "Dew point, saturation and whether air wants to rise",
    promise:
      "Read a temperature and dew point together, know what a shrinking spread means, and say whether a given air mass is stable or unstable.",
    accent: "go",
  },
  {
    id: "w4",
    index: 4,
    title: "Wind",
    subtitle: "What makes air move, and which way it turns",
    promise:
      "Trace wind back to the pressure gradient force, distinguish gradient from surface wind, and locate a low using nothing but the wind on your back.",
    accent: "brand",
  },
  {
    id: "w5",
    index: 5,
    title: "Clouds and Lifting",
    subtitle: "Four ways to lift air, and what it builds",
    promise:
      "Name the four lifting methods, place a cloud in its group, and read cumuliform versus stratiform as a statement about stability.",
    accent: "violet",
  },
  {
    id: "w6",
    index: 6,
    title: "Fronts",
    subtitle: "Where two air masses meet",
    promise:
      "Identify all four fronts, predict the cloud type, precipitation and turbulence each brings, and list the four discontinuities that define any front.",
    accent: "caution",
  },
  {
    id: "w7",
    index: 7,
    title: "Turbulence and Wind Shear",
    subtitle: "Disturbed air, and the four things that cause it",
    promise:
      "Classify turbulence by intensity and duration, name its four causative factors, and fly the published technique instead of chasing the needles.",
    accent: "caution",
  },
  {
    id: "w8",
    index: 8,
    title: "Icing",
    subtitle: "Three conditions, four types, one set of consequences",
    promise:
      "State exactly what icing requires, match a temperature band to an ice type, and know which way every performance number moves once ice forms.",
    accent: "nogo",
  },
  {
    id: "w9",
    index: 9,
    title: "Storms and Low Visibility",
    subtitle: "Thunderstorms, microbursts and fog",
    promise:
      "List the thunderstorm hazards and the avoidance priorities in order, recognise a microburst from its visual cues, and state what fog requires to form.",
    accent: "nogo",
  },
  {
    id: "w10",
    index: 10,
    title: "Weather Products",
    subtitle: "Reading what the system is telling you",
    promise:
      "Interpret a station model, know what each report and chart is for and how often it comes, and say when a PIREP stops being optional.",
    accent: "navy",
  },
];
