import type { Lab } from "@/lib/types";

/**
 * Flight Rules Scenario Labs.
 *
 * Regulations have no curve to plot, so these are decision engines rather than
 * simulators: set the conditions, read the ruling, and see which clause
 * produced it. Nothing here computes a threshold the NIFE material does not
 * publish.
 */
export const LABS: Lab[] = [
  {
    id: "flab-airport",
    title: "Airport Lab",
    subtitle: "Runway numbers, light guns, glideslope",
    teaches:
      "How to read an airport without a radio — turn a heading into a runway number, decode an Aldis lamp signal, and call a VASI.",
    unit: "f4",
    conceptIds: ["fr-runway-numbering", "fr-aldis", "fr-vasi"],
    component: "AirportLab",
    chain: [
      "Round the magnetic heading to the nearest ten",
      "Drop the last digit — that is your runway",
      "The far end of the same strip is 18 away",
      "Steady green clears you to land",
      "Red over white, you're alright",
    ],
  },
  {
    id: "flab-vfr-ifr",
    title: "VFR or IFR",
    subtitle: "Read the forecast, pick the rules",
    teaches:
      "That filing VFR needs the destination forecast to hold 1,000 and 3 across ETA ± 1 hour AND the route to permit visual flight — both tests, not either.",
    unit: "f5",
    conceptIds: ["fr-vfr-destination", "fr-precluding-vfr", "fr-vfr-fuel"],
    component: "VfrIfrLab",
    chain: [
      "Check the destination ceiling against 1,000 ft",
      "Check the destination visibility against 3 SM",
      "Check whether the route permits visual flight",
      "Any failure means an IFR flight plan",
    ],
  },
  {
    id: "flab-altitude",
    title: "Cruising Altitude Lab",
    subtitle: "Course in, altitude out",
    teaches:
      "The semicircular rule as a procedure: hemisphere from the course, parity from the hemisphere, and the +500 only if VFR.",
    unit: "f6",
    conceptIds: ["fr-semicircular", "fr-vfr-altitudes", "fr-ifr-altitudes"],
    component: "AltitudeLab",
    chain: [
      "Take the magnetic COURSE, never the heading",
      "0–179 is east, 180–359 is west",
      "East flies odd, west flies even",
      "VFR adds 500 ft. IFR does not.",
    ],
  },
  {
    id: "flab-airspace",
    title: "Airspace Lab",
    subtitle: "Class in, requirements out",
    teaches:
      "What each class demands before you may enter, and where the VFR minimums depart from the standard 1,000 / 500 / 2,000 / 3.",
    unit: "f7",
    conceptIds: ["fr-class-b", "fr-class-c", "fr-two-way-established", "fr-vfr-minimums-table"],
    component: "AirspaceLab",
    chain: [
      "A, B, C, D and E are controlled — only G is not",
      "Class B needs a clearance",
      "Class C and D need two-way communication established",
      "Class B minimums are clear of clouds; high Class E is 1,000 / 1,000 / 1 / 5",
    ],
  },
  {
    id: "flab-rules",
    title: "Right of Way Lab",
    subtitle: "Two aircraft, one conflict",
    teaches:
      "That the situation is resolved first and the category hierarchy second — head-on and overtaking have answers that ignore category entirely.",
    unit: "f8",
    conceptIds: ["fr-row-order", "fr-row-category"],
    component: "RulesLab",
    chain: [
      "An aircraft in distress outranks everything",
      "Head-on: BOTH turn right, whatever they are",
      "Overtaking: the overtaken aircraft has it, pass to the right",
      "Converging, different categories: least manoeuvrable wins",
      "Converging, same category: the aircraft on the right",
    ],
  },
];
