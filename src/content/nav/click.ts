/**
 * Make It Click entries for Navigation.
 *
 * Navigation is examined on production, so its confusions are procedural: the
 * student knows the rule and applies it in the wrong direction under time
 * pressure. The wrong model here is therefore about DIRECTION, not definition.
 */

import type { ClickEntry } from "@/lib/make-it-click";

export const CLICK: ClickEntry[] = [
  {
    conceptId: "nav-variation-conversion",
    intuition:
      "There are two norths. The chart is drawn to one and your compass points at the other, and variation is the gap between them. Converting is just deciding which way to step across that gap.",
    analogies: [
      {
        picture:
          "Two clocks in the same room, one running a few minutes fast. To convert a time from one to the other you do not need to understand clocks — you only need to know which one is ahead, and by how much.",
        maps: [
          ["True north — what the chart uses", "the clock on the wall"],
          ["Magnetic north — what the compass points at", "the clock running fast"],
          ["Variation", "the few minutes between them"],
          ["Converting true to magnetic", "reading one clock and stating the other"],
        ],
        breaksDown:
          "Clock error is the same everywhere in the room. Variation changes with where you are on the earth, which is why it is printed on the chart rather than memorised.",
      },
    ],
    chain: [
      { label: "You have a TRUE course off the chart", trend: "none" },
      {
        label: "The compass does not point at true north",
        trend: "none",
        because: "It points at magnetic north, and the difference is the local variation.",
      },
      {
        label: "Easterly variation means magnetic reads LESS than true",
        trend: "down",
        because: "East is least — so going true to magnetic you subtract.",
      },
      {
        label: "Westerly variation means magnetic reads MORE than true",
        trend: "up",
        because: "West is best — so going true to magnetic you add.",
      },
      {
        label: "Fly the magnetic course; the aircraft only understands that one",
        trend: "none",
        terminal: true,
        because: "The chart work is true, the flying is magnetic, and the conversion is the bridge.",
      },
    ],
    manipulate: {
      driver: "Variation",
      proves: "Swing variation east and west and watch the magnetic course move opposite ways.",
    },
    wrongModel: {
      brainWants:
        "East is least and west is best is one rule, so it must work the same way whichever direction I am converting.",
      actually:
        "It is stated for TRUE to MAGNETIC. Going the other way the formula reverses. And plotting a TACAN radial runs differently again: the radial is already magnetic and the chart is true, so easterly variation is ADDED.",
      whyItsTempting:
        "The rhyme is short, memorable and does not mention a direction — so it feels like a fact about variation rather than an instruction for one particular conversion.",
    },
    deeper:
      "Every one of these conversions is the same single question asked three ways: which north is this number referenced to, and which one do I need it in? Answer that first and the sign takes care of itself, which is faster under time pressure than recalling which version of the rhyme applies.",
    prerequisites: ["nav-measuring-direction"],
  },
];
