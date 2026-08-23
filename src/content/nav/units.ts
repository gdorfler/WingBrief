import type { Unit } from "@/lib/types";

/**
 * The route.
 *
 * The trainee guide is organised as seven lesson topics, and four of them are
 * enormous. Topic 6.2 alone carries twelve enabling objectives across chart
 * projections, direction, variation, global timekeeping and every plotting
 * technique in the course — five unrelated skills sharing one chapter number
 * because they happen to be taught in the same period. Topic 6.3, by contrast,
 * is one instrument used three ways.
 *
 * So the units here follow the *skills* rather than the chapter numbering.
 * Each one is a leg of the route: you arrive able to do a thing you could not
 * do before, and the next leg starts from there. Every enabling objective the
 * guide publishes is carried by exactly one unit.
 */
export const UNITS: Unit[] = [
  {
    id: "n1",
    index: 1,
    title: "Dead Reckoning",
    subtitle: "Position, direction, time, speed",
    promise:
      "Know what navigation actually is, what four numbers it runs on, and which instrument gives you each one.",
    accent: "navy",
  },
  {
    id: "n2",
    index: 2,
    title: "The Earth on Paper",
    subtitle: "Great circles and the Lambert conformal chart",
    promise:
      "Understand why a sphere will not lie flat, and what the chart in front of you did about it.",
    accent: "brand",
  },
  {
    id: "n3",
    index: 3,
    title: "Direction",
    subtitle: "Course, heading, track and variation",
    promise:
      "Tell three directions apart that everyone confuses, and convert between true and magnetic without guessing the sign.",
    accent: "brand",
  },
  {
    id: "n4",
    index: 4,
    title: "Global Timekeeping",
    subtitle: "Zone descriptions and Zulu",
    promise:
      "Convert any local time to Zulu and back, and fly a leg across time zones without arriving on the wrong day.",
    accent: "violet",
  },
  {
    id: "n5",
    index: 5,
    title: "Chart Work",
    subtitle: "Plotter, dividers, coordinates and fixes",
    promise:
      "Pull a position off the sheet, plot one onto it, measure a course to a degree and a distance to half a mile.",
    accent: "go",
  },
  {
    id: "n6",
    index: 6,
    title: "The CR-3",
    subtitle: "Ratios, time, speed, distance and fuel",
    promise:
      "Work the calculation side fluently: one setup, many reads, and an estimate that puts the decimal point where it belongs.",
    accent: "caution",
  },
  {
    id: "n7",
    index: 7,
    title: "Altitude and Airspeed",
    subtitle: "Pressure altitude, true airspeed, Mach",
    promise:
      "Get from what the instruments read to what the aircraft is actually doing through the air.",
    accent: "brand",
  },
  {
    id: "n8",
    index: 8,
    title: "Preflight Winds",
    subtitle: "The wind triangle, forwards",
    promise:
      "Given a course and a forecast wind, produce the heading to fly and the groundspeed to expect — and know roughly both before you touch the wheel.",
    accent: "go",
  },
  {
    id: "n9",
    index: 9,
    title: "In-Flight Winds",
    subtitle: "The wind triangle, backwards — and point to point",
    promise:
      "Take a fix, recover the wind that is actually blowing, and go direct to any radial and DME you are given.",
    accent: "violet",
  },
  {
    id: "n10",
    index: 10,
    title: "Flight Planning",
    subtitle: "The jet log, end to end",
    promise:
      "Plan a whole route onto a jet log, then update it in flight when the winds turn out to be someone else's forecast.",
    accent: "navy",
  },
];
