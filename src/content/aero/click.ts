/**
 * Make It Click entries for Aerodynamics.
 *
 * An entry is a DELTA. The chain, the NIFE definition, the know-cold rule, the
 * visual and the lab are all resolved from the curriculum at runtime, so what
 * is written here is only the part nothing else in the corpus holds: a
 * jargon-free intuition, a physical analogy that states its own mapping, and a
 * wrong model paired against the right one.
 *
 * The rule for an intuition: if a student who has not done the lesson could not
 * follow it, it is not an intuition, it is a summary. Terminology is allowed
 * back in at Stage 9 and not before.
 */

import type { ClickEntry } from "@/lib/make-it-click";

export const CLICK: ClickEntry[] = [
  /* ================================================================ */
  {
    conceptId: "c-pitch-vs-aoa",
    intuition:
      "Where the nose is pointing and where the aeroplane is actually going are two different things. You can hold the nose perfectly still and the wing can still meet the air at a completely different angle.",
    analogies: [
      {
        picture:
          "Paddling a canoe straight across a fast river. You point the bow at the far bank, but the current means the water is not hitting the hull head-on — it arrives from the side.",
        maps: [
          ["Where the nose points (pitch attitude)", "the direction you point the bow"],
          ["The flight path — where the aircraft actually goes", "the track you really make across the river"],
          ["Relative wind", "the direction the water actually strikes the hull"],
          ["Angle of attack", "the angle between the hull and the water hitting it"],
        ],
        breaksDown:
          "A canoe hull does not stop working when that angle gets too big. A wing does, and that is the whole reason this distinction matters.",
      },
      {
        picture:
          "Holding an umbrella at exactly the same angle while you stand still, then walk forward, then run. The rain hits it differently every time and you never moved the handle.",
        maps: [
          ["The chord line, held fixed", "the umbrella angle you are holding"],
          ["Relative wind", "the direction rain seems to come from"],
          ["Angle of attack", "the angle between the umbrella and the rain"],
        ],
        breaksDown: "Rain does not care about the umbrella. Air very much cares about the wing.",
      },
    ],
    show: {
      explainerId: "x-aoa-in-90-seconds",
      watchFor:
        "The nose never moves. Watch only the angle between the chord line and the arriving air.",
    },
    chain: [
      { label: "Hold the nose exactly where it is", trend: "none" },
      {
        label: "Start descending",
        trend: "down",
        because: "Nothing about the nose changed — the aircraft simply began going down instead of along.",
      },
      {
        label: "The air now arrives more from below",
        trend: "none",
        because: "Relative wind is always exactly opposite the flight path, so a downward path means upward-arriving air.",
      },
      {
        label: "The angle between chord line and relative wind opens up",
        trend: "up",
        because: "The chord line has not moved and the wind has swung. The gap between them is angle of attack.",
      },
      {
        label: "AOA rises toward the critical angle — same nose attitude",
        trend: "up",
        terminal: true,
        because: "Which is why an attitude indicator can read 10° nose-up in cruise and 10° nose-up on the edge of a stall.",
      },
    ],
    manipulate: {
      labId: "lab-aoa",
      driver: "Flight path",
      proves: "Lock the pitch and move the flight path. AOA does whatever it likes.",
    },
    wrongModel: {
      brainWants:
        "Nose up means a high angle of attack. Nose down means a low one. So I can read AOA off the attitude indicator.",
      actually:
        "Pitch attitude is measured against the HORIZON. Angle of attack is measured against the RELATIVE WIND. They are unrelated quantities, and the same 10° nose-up can be 6° AOA or 16° AOA.",
      whyItsTempting:
        "In steady level flight the two usually do move together, so the habit works — right up until the moment it stops working, which is the moment it matters.",
    },
    deeper:
      "Relative wind is not a separate thing that happens to the aircraft; it is defined as exactly opposite the flight path. So asking what the relative wind is doing is the same as asking where the aircraft is going — which is why the flight path, not the nose, is the thing to watch.",
    prerequisites: ["c-chordline-chord"],
  },

  /* ================================================================ */
  {
    conceptId: "c-induced-drag",
    intuition:
      "Making lift costs you something. The wing pushes air downward, and that tilts the lifting force slightly backwards. The backwards part is drag you only have because you are lifting.",
    analogies: [
      {
        picture:
          "Flying a kite. The string does not pull straight up — it pulls up and BACK, and you can feel the backward part in your hand.",
        maps: [
          ["The wing", "the face of the kite"],
          ["Downwash — air pushed downward", "the air the kite deflects down and behind it"],
          ["Total lift, perpendicular to the tilted wind", "the full pull along the string"],
          ["Effective lift", "the part of that pull holding the kite up"],
          ["Induced drag", "the part of that pull dragging your hand backwards"],
        ],
        breaksDown:
          "A kite is anchored and an aeroplane is not, so the kite never has to overcome its own backward pull with thrust. The aircraft does.",
      },
    ],
    show: {
      explainerId: "x-parasite-vs-induced",
      watchFor: "Watch the lift vector tilt aft. Nothing about the air's stickiness changed.",
    },
    chain: [
      { label: "Angle of attack increases", trend: "up" },
      {
        label: "The wing throws more air downward",
        trend: "up",
        because: "A higher angle deflects more air, more steeply. That deflected air is downwash.",
      },
      {
        label: "The average relative wind is tilted downward",
        trend: "down",
        because: "The wing is now flying through air that is already moving down as it arrives.",
      },
      {
        label: "Total lift rotates aft to stay perpendicular to it",
        trend: "none",
        because: "Lift is by definition perpendicular to the relative wind. Tilt the wind and the lift tilts with it.",
      },
      {
        label: "Effective lift falls and induced drag rises",
        trend: "up",
        terminal: true,
        because:
          "The tilted force splits: the part still holding you up is EFFECTIVE lift, and the part now pointing backwards is induced drag. Effective lift is always LESS than total lift.",
      },
    ],
    manipulate: { driver: "Angle of attack", proves: "More angle, more downwash, more of the lift pointing backwards." },
    wrongModel: {
      brainWants:
        "Drag is air rubbing against the aeroplane. So induced drag must be some extra friction that shows up when you fly slowly.",
      actually:
        "Induced drag is not friction at all. It is the lift vector itself tilting backwards, because the wing pushed air down. It is the price of the lift, not a surface effect.",
      whyItsTempting:
        "Every other kind of drag you have met — form, friction, interference — really is about the shape or the surface. The word 'drag' pulls you toward the same picture, and here it is the wrong one.",
    },
    deeper:
      "Induced drag rises as speed falls because a slower wing must fly at a higher angle of attack to make the same lift — and a higher angle means more downwash, more tilt, more backward component. That is why the induced drag curve climbs to the left, opposite to parasite drag.",
  },

  /* ================================================================ */
  {
    conceptId: "c-power-required",
    intuition:
      "Thrust is how hard you push. Power is how hard you push multiplied by how fast you are going. Because speed is in one and not the other, the two curves do not bottom out in the same place.",
    analogies: [
      {
        picture:
          "Cycling up a hill in the wrong gear. You are standing on the pedals, pushing extremely hard, and barely moving. Enormous force, very little power.",
        maps: [
          ["Thrust required", "how hard you are pushing the pedals"],
          ["Velocity", "how fast you are actually travelling"],
          ["Power required", "push multiplied by speed — the effort per second"],
          ["Minimum thrust required", "the gear where the pedals feel lightest"],
          ["Minimum power required", "the speed where you could keep going the longest"],
        ],
        breaksDown:
          "A bicycle's drag does not have an induced component that grows as you slow down. A wing's does, which is what curves the left-hand end of both graphs upward.",
      },
    ],
    show: {
      explainerId: "x-thrust-versus-power",
      watchFor:
        "Watch the bottom of each curve. They are not above the same airspeed, and that is the entire point.",
    },
    chain: [
      { label: "Airspeed changes", trend: "none" },
      {
        label: "Thrust required follows the total drag curve",
        trend: "none",
        because: "In equilibrium flight thrust must equal drag, so the two curves are numerically the same thing.",
      },
      {
        label: "Power required is that thrust multiplied by the speed",
        trend: "none",
        because: "P_R = T_R × V ÷ 325. Speed enters the power curve and does not enter the thrust curve.",
      },
      {
        label: "The multiplication drags the power curve's minimum to the LEFT",
        trend: "down",
        because:
          "At low speed a modest thrust times a small velocity is a very small power, so the power curve bottoms out slower than the thrust curve does.",
      },
      {
        label: "Minimum power is slower than L/Dmax — and L/Dmax is to the RIGHT of it",
        trend: "none",
        terminal: true,
        because:
          "Same aircraft, same conditions, two different best speeds depending on whether you care about thrust or about power.",
      },
    ],
    manipulate: {
      labId: "lab-performance",
      driver: "Airspeed",
      proves: "Move the speed and watch which curve bottoms out first.",
    },
    wrongModel: {
      brainWants:
        "The bottom of the curve is 'the efficient speed', so the bottom of the thrust curve and the bottom of the power curve must be the same place.",
      actually:
        "The bottom of the TOTAL DRAG / thrust required curve is L/Dmax. The bottom of the POWER REQUIRED curve is max endurance for a prop, and it sits to the LEFT — at a slower speed. Different points, different uses.",
      whyItsTempting:
        "Both graphs are U-shaped, plotted against the same axis, and usually drawn on the same page. Nothing about the picture warns you that the minima have moved.",
    },
    deeper:
      "The velocity and the angle of attack for L/Dmax are identical on both curves — L/Dmax is a property of the WING, not of the graph you happen to be reading. What changes between the two graphs is where that fixed point falls relative to each curve's own minimum.",
  },

  /* ================================================================ */
  {
    conceptId: "c-vn-diagram",
    intuition:
      "One picture of every way you can break the aeroplane. Go too slow and the wing stops flying. Pull too hard and you bend it. Go too fast and it comes apart. Stay inside the shape and none of that happens.",
    analogies: [
      {
        picture:
          "A room with four walls, except the left-hand wall is curved. Walk anywhere inside and you are fine. Each wall hurts you in a different way, and the curved one moves toward you the harder you pull.",
        maps: [
          ["The left boundary — accelerated stall lines", "the curved wall, set by C_Lmax AOA"],
          ["The upper and lower limit load factors", "the ceiling and the floor"],
          ["Redline airspeed, V_NE", "the wall on the right"],
          ["The safe flight envelope", "the floor space you can actually walk on"],
        ],
        breaksDown:
          "A room's walls stay put. These move with weight, altitude and configuration — the diagram is drawn for one set of conditions only.",
      },
    ],
    show: {
      explainerId: "x-vn-diagram",
      watchFor:
        "Watch the left-hand boundary curve to the right as load factor climbs. That curve is why a hard pull raises your stall speed.",
    },
    chain: [
      { label: "Pull harder — load factor increases", trend: "up" },
      {
        label: "The wing must make more lift to sustain the turn",
        trend: "up",
        because: "Load factor is total lift divided by weight, so more g means proportionally more lift.",
      },
      {
        label: "At a given speed, more lift needs more angle of attack",
        trend: "up",
        because: "Speed is fixed, so the only lever left is the angle the wing meets the air at.",
      },
      {
        label: "You reach C_Lmax AOA at a HIGHER airspeed than before",
        trend: "up",
        because: "The critical angle never moves. What changes is the speed at which you arrive at it.",
      },
      {
        label: "The stall boundary has swung right — that is the curved left wall",
        trend: "none",
        terminal: true,
        because: "Accelerated stall. Same wing, same critical angle, higher stall speed because you are pulling.",
      },
    ],
    manipulate: {
      labId: "lab-vn",
      driver: "Load factor",
      proves: "Move speed and g. Watch where you leave the envelope, and which wall you hit.",
    },
    wrongModel: {
      brainWants:
        "Stall speed is a number for the aircraft. It is in the handbook, so it is fixed.",
      actually:
        "The published stall speed is for 1 g, wings level. The V-n diagram's curved left boundary shows that stall speed climbs with load factor — pull 2 g and it rises by about 40%.",
      whyItsTempting:
        "Every other limit on the page really is a single number. Redline is redline. It is reasonable to assume the stall speed behaves the same way, and it does not.",
    },
    deeper:
      "The left boundary is a curve rather than a line because lift varies with the SQUARE of airspeed while load factor varies directly — so the speed needed to reach C_Lmax goes up with the square root of the load factor. That square root is the shape of the wall.",
  },
];
