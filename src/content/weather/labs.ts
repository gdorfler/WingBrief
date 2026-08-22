import type { Lab } from "@/lib/types";

/**
 * Weather Labs.
 *
 * Relationship models built from the Weather Condensed Notes. They change an
 * atmospheric CONDITION and show what the air does about it — which is the
 * question the whole course is organised around.
 */
export const LABS: Lab[] = [
  {
    id: "wxlab-atmosphere",
    title: "Atmosphere Lab",
    subtitle: "Climb the column",
    teaches:
      "That temperature and pressure fall together on the standard day, at two different rates in two different units — and where that puts you relative to the icing bands.",
    unit: "w1",
    conceptIds: ["wx-lapse-rate", "wx-standard-atmosphere", "wx-atmospheric-pressure"],
    component: "AtmosphereLab",
    chain: [
      "Start from 29.92 inHg and 15 °C at sea level",
      "Temperature falls 2 °C per 1,000 ft",
      "Pressure falls 1 inHg per 1,000 ft",
      "Around 36,000 ft over the US the cooling stops at the tropopause",
    ],
  },
  {
    id: "wxlab-altimeter",
    title: "Altimeter Lab",
    subtitle: "Which way is it lying?",
    teaches:
      "That a cold day makes the altimeter over-read — so the aircraft is LOWER than indicated — and that 1 inHg of setting error is worth 1,000 ft.",
    unit: "w2",
    conceptIds: ["wx-altimeter", "wx-temp-altimeter-error"],
    component: "AltimeterLab",
    chain: [
      "The altimeter compares static pressure with the Kollsman setting",
      "1 inHg of difference displays as 1,000 ft",
      "Colder than standard: indicates HIGHER than true",
      "So the aircraft is lower than the number says",
    ],
  },
  {
    id: "wxlab-clouds",
    title: "Cloud Lab",
    subtitle: "Group, shape and what each one brings",
    teaches:
      "That the group comes from altitude and the shape comes from stability — and that nimbostratus is heavy and continuous but has no thunder.",
    unit: "w5",
    conceptIds: ["wx-cloud-groups", "wx-special-clouds", "wx-precipitation-types"],
    component: "CloudTypeLab",
    chain: [
      "Altitude sets the group: Low, Middle, High, Special",
      "Shape reports the stability of the air",
      "Cumuliform means unstable and showery",
      "Stratiform means stable and continuous",
      "Nimbo or nimbus means violent or heavy",
    ],
  },
  {
    id: "wxlab-turbulence",
    title: "Turbulence Lab",
    subtitle: "Four causes, four signatures",
    teaches:
      "What produces each kind of turbulence, where to expect it, and why there is no such thing as warm frontal turbulence.",
    unit: "w7",
    conceptIds: [
      "wx-turbulence-causes",
      "wx-wind-shear",
      "wx-thermal-turbulence",
      "wx-frontal-turbulence",
      "wx-mechanical-turbulence",
    ],
    component: "TurbulenceLab",
    chain: [
      "Wind shear: a sudden change in speed or direction, anywhere",
      "Thermal: heating below, strongest over dry surfaces",
      "Frontal: cold fronts only, worst in a fast one",
      "Mechanical: obstructions, usually below 1,000 ft AGL",
    ],
  },
  {
    id: "wxlab-cloud",
    title: "Cloud Lab",
    subtitle: "Temperature, dew point, lifting",
    teaches:
      "That moisture alone builds nothing: it takes a lifting mechanism to raise the parcel so it can cool to its dew point.",
    unit: "w3",
    conceptIds: ["wx-dew-point-spread", "wx-lifting-methods", "wx-relative-humidity"],
    component: "CloudLab",
    chain: [
      "Set the surface temperature and dew point",
      "Read the spread between them",
      "Apply a lifting mechanism",
      "The parcel rises and cools, closing the spread",
      "At saturation, cloud forms",
    ],
  },
  {
    id: "wxlab-front",
    title: "Front Lab",
    subtitle: "Two air masses, four outcomes",
    teaches:
      "That the SLOPE of the lifting decides everything downstream — the stability, the cloud type, the precipitation and the ride.",
    unit: "w6",
    conceptIds: ["wx-cold-front", "wx-warm-front", "wx-stationary-front", "wx-occluded-front"],
    component: "FrontLab",
    chain: [
      "Decide which air mass is advancing",
      "That sets the slope of the lifting",
      "Steep means unstable, shallow means stable",
      "Unstable builds cumuliform, stable builds stratiform",
      "Cumuliform gives showers, stratiform gives continuous rain",
    ],
  },
  {
    id: "wxlab-wind",
    title: "Wind Lab",
    subtitle: "Pressure systems and the wind they make",
    teaches:
      "Why wind runs parallel to the isobars rather than straight from high to low, and what changes below 2,000 ft AGL.",
    unit: "w4",
    conceptIds: ["wx-pgf", "wx-gradient-wind", "wx-surface-wind", "wx-buys-ballot"],
    component: "WindLab",
    chain: [
      "Uneven heating creates a pressure gradient",
      "PGF pushes across the isobars",
      "The resulting wind runs parallel to them",
      "Counter-clockwise around a low, clockwise around a high",
      "Below 2,000 ft AGL friction turns it across the isobars",
    ],
  },
  {
    id: "wxlab-icing",
    title: "Icing Lab",
    subtitle: "Three conditions, and which ice you get",
    teaches:
      "That all three icing conditions are required, and that the free air temperature alone decides which type forms.",
    unit: "w8",
    conceptIds: ["wx-icing-requirements", "wx-clear-ice", "wx-rime-ice", "wx-mixed-ice"],
    component: "IcingLab",
    chain: [
      "Visible moisture must be present",
      "Free air temperature below freezing",
      "Aircraft surface below freezing",
      "0 to −10 gives clear, −10 to −20 gives rime",
      "The mixed band, −8 to −15, overlaps both",
    ],
  },
  {
    id: "wxlab-storm",
    title: "Storm Lab",
    subtitle: "Four options, in priority order",
    teaches:
      "Why circumnavigating is always first, and how quickly going over becomes impractical as the wind at the top increases.",
    unit: "w9",
    conceptIds: ["wx-thunderstorm-avoidance", "wx-thunderstorm-hazards"],
    component: "StormLab",
    chain: [
      "Circumnavigate — fly around it",
      "Over — 1,000 ft per 10 kt of wind at the top",
      "Under — the lower third from cloud base to ground",
      "Through — the lower third, with no angle",
    ],
  },
  {
    id: "wxlab-products",
    title: "Weather Product Lab",
    subtitle: "Decode a barb, place a product in time",
    teaches:
      "How to build and read a wind barb, and how far forward each report and advisory actually reaches.",
    unit: "w10",
    conceptIds: ["wx-station-model", "wx-metar", "wx-taf", "wx-airmet", "wx-convective-sigmet"],
    component: "ProductLab",
    chain: [
      "Build the barb from 50s, then 10s, then a 5",
      "METAR: hourly, current, decides takeoff and landing",
      "TAF: every 6 hours, covers 24+, for planning",
      "Convective SIGMET 2 hours · non-convective 4, or 6 for hurricanes",
      "AIRMET every 6 hours, and it is the MODERATE one",
    ],
  },
];
