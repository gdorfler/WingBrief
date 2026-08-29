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

  /* ================================================================ */
  {
    conceptId: "nav-crab-drift",
    intuition:
      "Drift and crab describe the exact same angle, measured from opposite ends of the problem. Drift is what the wind does TO you with no correction; crab is what YOU do to cancel it back out — and when the correction is exactly right, the two numbers are identical.",
    analogies: [
      {
        picture:
          "Swimming straight across a river with a current. Aim your body straight at the far dock and the current sweeps you downstream past it — that sideways slide is drift. Aim upstream at an angle instead, and you land exactly at the dock — that upstream aim is your crab, and it is the same size as the drift it cancels.",
        maps: [
          ["Track — the path you actually want over the ground", "the straight line to the dock"],
          ["Drift — how far the wind would push you off track, uncorrected", "how far the current sweeps you downstream if you swim straight at the dock"],
          ["Heading — the direction you actually point", "the angle you aim your body upstream"],
          ["Crab — the correction angle you add", "how far upstream of the dock you had to aim"],
        ],
        breaksDown:
          "A swimmer can feel the current directly. A pilot has no such sense — heading and track only reveal the wind indirectly, through instruments and elapsed time, which is the entire reason a computed correction matters.",
      },
    ],
    chain: [
      { label: "Wind blows across your intended track", trend: "none" },
      {
        label: "Flown with no correction, the wind pushes the aircraft off track by the drift angle",
        trend: "none",
        because: "The aircraft is carried along with the air mass exactly as a boat is carried by a current.",
      },
      {
        label: "Turn the nose into the wind by that same angle — now you are crabbed",
        trend: "none",
        because: "You are deliberately aiming off your desired path to cancel the sideways push before it happens.",
      },
      {
        label: "Drift and crab exactly cancel, and the aircraft tracks the intended course over the ground",
        trend: "none",
        terminal: true,
        because: "A right crosswind drifts you left, so the correction is a crab to the right — same angle, opposite direction, netting to zero sideways motion.",
      },
    ],
    wrongModel: {
      brainWants:
        "Crab and drift sound like two different problems — drift is the mistake and crab is the fix, so they must be two separate numbers to solve for.",
      actually:
        "They are the same angle. Once you know the drift a crosswind would cause, you already know exactly how much crab cancels it — there is no separate calculation, only a sign flip.",
      whyItsTempting:
        "The two words show up in different parts of a nav problem — drift when analyzing the wind, crab when setting the heading — so it is easy to treat solving one as a separate step from solving the other, rather than seeing they are the same number stated twice.",
    },
    deeper:
      "This equivalence is what makes the ten percent rule work as a shortcut: since crab exactly cancels drift, you never need to separately estimate how far the wind would blow you before correcting for it — the crab angle IS the answer to both questions at once.",
    prerequisites: ["nav-track"],
  },

  /* ================================================================ */
  {
    conceptId: "nav-zulu-conversion",
    intuition:
      "Zone description is a signed number for the gap between your local clock and Zulu. The formula runs GMT = LMT minus that number, which sounds like plain subtraction — until the zone description itself is negative, and subtracting a negative flips into addition.",
    analogies: [
      {
        picture:
          "Think of zone description as a bill. If the bill is $6, subtracting it lowers your balance by $6. But if the bill is actually a $6 CREDIT — marked as −$6 — then 'subtracting' it does not lower your balance. It raises it by $6, because subtracting a negative amount adds.",
        maps: [
          ["Zone description, ZD", "the amount on the bill"],
          ["GMT = LMT − ZD", "your balance after 'paying' the bill"],
          ["A negative zone description", "a bill that's actually a credit, marked negative"],
          ["Subtracting a negative ZD, so GMT ends up LATER than LMT", "subtracting a credit, so your balance goes UP instead of down"],
        ],
        breaksDown:
          "Money never flips sign on its own. A zone description does, constantly, because it is defined relative to Greenwich in both directions — which is exactly why the sign has to be tracked explicitly rather than assumed.",
      },
    ],
    chain: [
      { label: "Read the zone description off the chart or table, sign and all", trend: "none" },
      {
        label: "Plug it into GMT = LMT − ZD exactly as signed, without treating it as always-positive",
        trend: "none",
        because: "The formula already has the subtraction built in — a negative ZD does the sign-flip work for you.",
      },
      {
        label: "A negative ZD makes GMT come out LATER than LMT, not earlier",
        trend: "up",
        terminal: true,
        because: "Double-negative arithmetic, not a special rule — subtracting a negative six hours is the same as adding six hours.",
      },
    ],
    wrongModel: {
      brainWants:
        "Zone description is a hard offset — subtract it and get Zulu, full stop, regardless of the sign printed in front of it.",
      actually:
        "A zone description of −6 means GMT ends up SIX HOURS LATER than local, because GMT = LMT − (−6) = LMT + 6. Treating every zone description as something you just subtract, sign unread, gets exactly the wrong answer this problem is designed to catch.",
      whyItsTempting:
        "Every other subtraction in nav work makes the answer smaller. This is the one case where the number in front of the minus sign can itself be negative, and that single flipped sign is easy to skim past under time pressure.",
    },
    deeper:
      "The same relationship, LMT = GMT + ZD, runs in reverse for converting a Zulu time back to local — worth deriving live from the one formula rather than memorizing twice.",
    prerequisites: ["nav-zone-description"],
  },
];
