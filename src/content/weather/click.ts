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

  /* ================================================================ */
  {
    conceptId: "wx-frontal-turbulence",
    intuition:
      "Turbulence at a front comes from how hard the front shoves air upward, not from the front itself. A cold front forces air up abruptly — worse still if it's moving fast — and that abruptness is what shakes the airframe. A warm front's lift is so gradual it produces no frontal turbulence at all.",
    analogies: [
      {
        picture:
          "Driving over a speed bump. Cross it slowly and the car barely rocks. Cross the exact same bump at highway speed and the whole car jolts hard. A cold front is the fast approach to the bump; a warm front is closer to crawling over it.",
        maps: [
          ["The front's slope — how steeply it forces air upward", "the speed bump's shape"],
          ["A fast-moving cold front forcing abrupt, violent lift", "hitting the bump at highway speed"],
          ["A warm front's slow, shallow lift", "crawling over the same bump at walking pace"],
          ["Resulting turbulence severity", "how hard the car jolts"],
        ],
        breaksDown:
          "A speed bump is identical every time; only your speed across it changes. A cold front and a warm front are not the same shape at all — the cold front is inherently steeper, which is why even a slow-moving one out-jolts a warm front, though a fast-moving one is worse still.",
      },
    ],
    chain: [
      { label: "A front forces the air ahead of it to lift", trend: "none" },
      {
        label: "A cold front lifts that air abruptly, over a steep frontal slope",
        trend: "up",
        because: "Dense cold air undercuts the warmer air ahead of it and shoves it upward rather than sliding beneath it gently.",
      },
      {
        label: "That abrupt lift is what produces turbulence — worse still in a fast-moving cold front",
        trend: "up",
      },
      {
        label: "A warm front lifts the same air over a long, shallow slope, producing no frontal turbulence at all — not less, none",
        trend: "down",
        terminal: true,
        because: "Gentle, gradual lift has nothing sudden in it to shake the airframe.",
      },
    ],
    wrongModel: {
      brainWants:
        "Every front should produce at least some turbulence — a front is a front, so a warm front must make a milder version of the same rough ride a cold front does.",
      actually:
        "Warm fronts produce no frontal turbulence at all. It is not 'less' — it is zero, because a warm front's lift is too gradual to shake anything.",
      whyItsTempting:
        "Warm and cold fronts get taught side by side with matched categories for clouds, icing, and precipitation, so it is natural to assume turbulence gets a matched pair of answers too — this is the one category where only one front shows up at all.",
    },
    deeper:
      "'No warm frontal turbulence' is worth memorizing as its own flat fact rather than trying to derive a 'small amount' from the general lifting logic — the syllabus draws the line at zero, deliberately, and an exam answer that hedges toward 'a little' is wrong.",
  },

  /* ================================================================ */
  {
    conceptId: "wx-wind-shear",
    intuition:
      "The danger in wind shear is not the wind itself — it is how suddenly your airspeed changes when you cross the boundary between two different wind conditions. Low-level shear is the worst kind, because it can steal your airspeed exactly when you have the least altitude to trade for it back.",
    analogies: [
      {
        picture:
          "Stepping off a moving walkway at the airport. While you're on it, your body and the walkway move together and you feel almost nothing. The moment you step off onto still ground, your body is still moving at walkway speed, and it takes an instant to adjust — worse the less room you have to catch your balance.",
        maps: [
          ["Flying steadily within one wind condition", "riding smoothly on the moving walkway"],
          ["Crossing the shear boundary into a different wind", "stepping off the walkway onto still ground"],
          ["The sudden airspeed change at the boundary", "the jolt of your body still moving at walkway speed"],
          ["Low altitude leaving no room to recover the lost airspeed", "having no railing to catch yourself right at that step-off point"],
        ],
        breaksDown:
          "You choose when to step off a walkway. An aircraft crosses a shear boundary without warning, at whatever altitude it happens to be flying — which is why low-level wind shear, near the ground on a cool, clear night, is the dangerous case: there is no altitude left to trade for the airspeed the shear just took.",
      },
    ],
    chain: [
      { label: "A boundary exists between two different wind conditions — commonly a surface temperature inversion on a cool, clear night", trend: "none" },
      { label: "The aircraft crosses that boundary", trend: "none" },
      {
        label: "Airspeed changes suddenly as the relative wind changes, independent of any pilot input",
        trend: "none",
        because: "The aircraft's speed through the AIR is what the wings feel, and that just changed out from under it, even though groundspeed did not.",
      },
      {
        label: "At low altitude there is little room to trade altitude for the lost airspeed before reaching the stall angle",
        trend: "up",
        terminal: true,
        because: "Recovering from an airspeed loss normally means lowering the nose and trading altitude for speed — low-level shear is defined by having almost none of that altitude to spend.",
      },
    ],
    wrongModel: {
      brainWants:
        "Wind shear is dangerous because the winds involved are extremely strong — it is basically a scaled-up version of ordinary gusty, windy conditions.",
      actually:
        "The danger is the SUDDEN CHANGE at the boundary, not the wind speed itself — a shear zone can exist with fairly modest winds on either side. Low-level wind shear is singled out as most dangerous specifically because it happens with no altitude left to recover the airspeed it costs.",
      whyItsTempting:
        "Every other 'this is dangerous' weather phenomenon in the course really is about intensity — stronger storms, heavier icing, worse turbulence — so it is natural to assume shear danger scales with wind speed too, rather than with how little altitude is available when it occurs.",
    },
    deeper:
      "High-level shear produces clear air turbulence instead of the stall risk low-level shear does — same underlying mechanism, a sudden wind change, but the consequence differs entirely because there is no ground and no imminent stall margin to worry about at altitude.",
  },
];
