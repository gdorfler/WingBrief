/**
 * Make It Click entries for Weather.
 *
 * Weather's hardest ideas are the ones where the instrument lies to you in a
 * direction you would not guess, so the wrong model is doing most of the work
 * in these entries.
 */

import type { ClickEntry } from "@/lib/make-it-click";

export const CLICK: ClickEntry[] = [
  {
    conceptId: "wx-temp-altimeter-error",
    intuition:
      "The altimeter does not measure height. It measures pressure and converts, assuming the air is a standard temperature. When the air is colder than that, the conversion comes out too generous and the instrument reads higher than you actually are.",
    analogies: [
      {
        picture:
          "Counting stairs in the dark to work out which floor you are on. You are assuming every stair is the usual height. In cold air the stairs are packed closer together, so counting the same number leaves you lower in the building than you think.",
        maps: [
          ["Pressure levels in the atmosphere", "the stairs"],
          ["The altimeter counting pressure", "you counting stairs in the dark"],
          ["Standard temperature", "the usual stair height you are assuming"],
          ["Cold air packing the levels closer", "shorter stairs than you assumed"],
          ["Being lower than indicated", "arriving at a lower floor than you counted"],
        ],
        breaksDown:
          "Stairs cannot stretch. Pressure levels genuinely do spread out in warm air, which is why the error runs the other way when it is hot.",
      },
    ],
    chain: [
      { label: "Air is colder than standard", trend: "down" },
      {
        label: "The air column contracts — pressure levels sit closer together",
        trend: "down",
        because: "Cold air is denser, so a given drop in pressure happens over a shorter climb.",
      },
      {
        label: "The altimeter still converts as though the air were standard",
        trend: "none",
        because: "It has no thermometer. It only knows pressure and the setting you gave it.",
      },
      {
        label: "It over-reads — the needle says more height than you have",
        trend: "up",
        because: "The instrument thinks you climbed further than you did to reach that pressure.",
      },
      {
        label: "You are LOWER than indicated. Terrain clearance is not what it says.",
        trend: "down",
        terminal: true,
        because: "Which is why cold is the dangerous case and hot is the forgiving one.",
      },
    ],
    manipulate: {
      labId: "wxlab-altimeter",
      driver: "Temperature",
      proves: "Move temperature away from standard and watch indicated and true altitude separate.",
    },
    wrongModel: {
      brainWants:
        "Cold air is denser, so it should hold the aircraft up better and the altimeter should read low, if it is wrong at all.",
      actually:
        "Colder than standard makes the altimeter read HIGHER than true — so the aircraft is LOWER than the instrument says. Hotter than standard reads lower than true, which is the safe direction.",
      whyItsTempting:
        "Density is the thing you have been trained to think about all course, and here density is not what the instrument is responding to. It is responding to pressure, and it has no idea how cold it is.",
    },
    deeper:
      "This is the same rule as the pressure error, stated for temperature: from HIGH to LOW, look out below. Fly from high pressure to low pressure, or from warm air to cold air, without resetting, and in both cases you end up lower than the instrument claims.",
  },
];
