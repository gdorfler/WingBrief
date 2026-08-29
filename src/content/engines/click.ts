/**
 * Make It Click entries for Engines.
 *
 * Anchored on blade angle of attack rather than on the stall itself. A student
 * who understands why the angle climbs can derive every cause, indication and
 * recovery from it; one who has memorised the stall definition can derive none
 * of them, which is exactly the gap this system exists to close.
 */

import type { ClickEntry } from "@/lib/make-it-click";

export const CLICK: ClickEntry[] = [
  {
    conceptId: "e-compressor-aoa",
    intuition:
      "Every blade in the compressor is a tiny wing. It does not know or care what the aircraft is doing — it only feels the angle between itself and the air arriving at it. Two things set that angle: how fast air is coming in the front, and how fast the blade is spinning.",
    analogies: [
      {
        picture:
          "Walking through falling rain. The rain is coming straight down, but as you walk it seems to come at you from an angle — and the faster you walk, the more it slants toward your face.",
        maps: [
          ["Inlet airflow coming down the axis", "the rain falling straight down"],
          ["Compressor RPM — the blade's own speed", "how fast you are walking"],
          ["Compressor relative wind", "the direction the rain APPEARS to come from"],
          ["The blade's chord line", "the angle you are holding your umbrella at"],
          ["Blade angle of attack", "the angle between the umbrella and the apparent rain"],
        ],
        breaksDown:
          "Rain never separates from the umbrella and stops working. Airflow over a blade does, and that is the stall.",
      },
      {
        picture:
          "Your hand out of a car window, held at a fixed tilt. Speed up and the air hits it at a different angle without you moving your hand at all.",
        maps: [
          ["The blade, at a fixed built-in angle", "your hand, held at a fixed tilt"],
          ["A change in inlet airflow or RPM", "a change in the car's speed"],
          ["The resulting change in blade AOA", "the change in how the air strikes your hand"],
        ],
        breaksDown:
          "A car has one speed. A compressor blade has two inputs that combine, and either one can move the angle on its own.",
      },
    ],
    show: {
      explainerId: "ex-why-stalls-happen",
      watchFor:
        "Watch the two arrows combine into one. The blade never moves — only the wind it feels.",
    },
    chain: [
      { label: "Inlet airflow falls, or RPM rises", trend: "none" },
      {
        label: "The two velocities combine into a different relative wind",
        trend: "none",
        because:
          "Relative wind inside the compressor is inlet airflow plus compressor RPM. Change either input and the resultant swings.",
      },
      {
        label: "The angle between the blade chord and that wind opens up",
        trend: "up",
        because: "The blade's own angle is fixed by how it was built. Only the wind moved.",
      },
      {
        label: "Blade angle of attack rises past what the blade can hold",
        trend: "up",
        because: "Too low an AOA is merely inefficient. Too high and the airflow can no longer follow the blade's surface.",
      },
      {
        label: "Airflow separates — compressor stall, and possibly flameout",
        trend: "none",
        terminal: true,
        because:
          "The blade is an airfoil and it has stalled for the same reason a wing does: excessive angle of attack.",
      },
    ],
    manipulate: {
      labId: "elab-compressor",
      driver: "Inlet airflow",
      proves: "Move inlet airflow and RPM independently. Watch the angle climb from either direction.",
    },
    wrongModel: {
      brainWants:
        "A compressor stall must be the engine running out of air, or the engine stalling the way a car engine stalls — it stops.",
      actually:
        "It is an aerodynamic stall of the blades themselves. Rotors and stators are airfoils, and the airflow breaks away from them because the angle of attack got too high. The engine may keep running.",
      whyItsTempting:
        "The word 'stall' means 'stops' everywhere else you have met it, and 'compressor' sounds like plumbing rather than like a row of little wings.",
    },
    deeper:
      "This is why the two apparently opposite causes — losing inlet airflow and gaining RPM — produce the same failure. They are not two mechanisms. They are two ways of swinging the same resultant vector past the same critical angle.",
    prerequisites: ["e-compressor-relative-wind"],
  },

  /* ================================================================ */
  {
    conceptId: "e-altitude-thrust",
    intuition:
      "Climbing does two opposite things to the engine. The air gets colder, which helps it. The air gets thinner, which hurts it. Thinner wins, so thrust falls the whole way up — and above about 36,000 feet the helping half stops entirely.",
    analogies: [
      {
        picture:
          "A tug of war where one side was always stronger. Cold air is pulling for you and thin air is pulling against you, and thin air wins. Then at 36,000 feet your side simply lets go of the rope.",
        maps: [
          ["Falling temperature — denser air, better combustion", "the side pulling for you"],
          ["Falling pressure — less air mass per second", "the stronger side pulling against you"],
          ["Net thrust loss with altitude", "the rope moving steadily the wrong way"],
          ["The tropopause, about 36,000 ft", "your side letting go of the rope"],
        ],
        breaksDown:
          "In a tug of war the rope can come back. Thrust does not recover with further climb — above the tropopause it only falls faster.",
      },
    ],
    chain: [
      { label: "Climb", trend: "up" },
      {
        label: "Pressure falls and temperature falls together",
        trend: "down",
        because: "Both are properties of the standard atmosphere, and both change on the way up.",
      },
      {
        label: "Colder air helps thrust; thinner air hurts it",
        trend: "none",
        because:
          "Denser air burns better, but there is simply less mass flowing through the engine each second.",
      },
      {
        label: "The pressure loss outweighs the temperature gain, so thrust falls",
        trend: "down",
        because: "This is the whole answer to the exam question: pressure wins.",
      },
      {
        label: "Above 36,000 ft temperature stabilises and thrust falls faster",
        trend: "down",
        terminal: true,
        because:
          "The offsetting effect has stopped, so nothing works against the pressure loss any more.",
      },
    ],
    manipulate: {
      labId: "elab-thrust",
      driver: "Altitude",
      proves: "Move altitude alone. Watch thrust fall, then fall harder past the tropopause.",
    },
    wrongModel: {
      brainWants:
        "Cold air is denser and engines like cold air, so climbing into colder air should help thrust.",
      actually:
        "Both things happen at once and the pressure drop is the larger effect. Thrust decreases with altitude, and above 36,000 ft it decreases more rapidly because temperature has stopped falling.",
      whyItsTempting:
        "The cold-air-is-good rule is true on the ground — a cold day really does give better performance. It fails on the climb because altitude changes pressure as well, and a cold day at sea level does not.",
    },
    deeper:
      "36,000 feet matters because it is the base of the tropopause, where temperature stops falling with height. Almost every altitude answer in this course keys off that one fact.",
  },

  /* ================================================================ */
  {
    conceptId: "e-rpm-thrust",
    intuition:
      "Thrust does not grow evenly as you push the throttle up. Down low, a big handful of throttle buys you almost nothing; up near the top, the same handful buys you a lot. Most of an engine's thrust lives in the top of the RPM range, not spread evenly across it.",
    analogies: [
      {
        picture:
          "Wringing out a soaking wet towel. The first twists barely squeeze out any water because the towel is still loosely bunched — but once you have taken up the slack, each additional twist wrings out noticeably more water per turn.",
        maps: [
          ["Low RPM range", "the first twists, taking up slack"],
          ["High RPM range", "the twists once the towel is already tight"],
          ["A given throttle increase producing more thrust at high RPM", "a given twist wringing out more water once the towel is tight"],
        ],
        breaksDown:
          "A towel eventually runs out of water to wring. The thrust curve keeps climbing all the way to max RPM — the rate of increase only ever gets steeper, it never reverses.",
      },
    ],
    chain: [
      { label: "Throttle moved up by a fixed amount, anywhere in the range", trend: "none" },
      {
        label: "At low RPM the compressor is turning slowly and inefficiently, so the extra fuel buys little extra airflow",
        trend: "none",
        because: "A slow compressor cannot take advantage of the added fuel — most of the engine's efficiency depends on RPM itself.",
      },
      {
        label: "At high RPM the same fuel increase meets a compressor already moving fast and efficiently",
        trend: "up",
        because: "Efficiency compounds with speed, so the compressor turns the same extra fuel into much more added airflow.",
      },
      {
        label: "Thrust output for that same throttle movement is far larger at high RPM",
        trend: "up",
        terminal: true,
        because: "Which is why the top of the RPM range is where the power lives, and why small throttle movements up there demand a light touch.",
      },
    ],
    wrongModel: {
      brainWants:
        "Thrust should track the throttle in a straight line — halfway on the throttle should mean roughly half the thrust.",
      actually:
        "The curve is bowed, not straight. Most of the thrust is packed into the top of the RPM range, so identical throttle movements produce very different results depending on where you already are.",
      whyItsTempting:
        "Most things you operate with a lever — volume knobs, a car's gas pedal at low speed — feel roughly linear, so a throttle is easy to assume behaves the same way until you actually fly one.",
    },
    deeper:
      "This is also why small throttle corrections near max RPM move thrust — and therefore airspeed — more than the same-sized correction would down low. Precise power control means using smaller inputs the higher up the range you already are.",
    prerequisites: ["e-compressor-purpose"],
  },

  /* ================================================================ */
  {
    conceptId: "e-turbine-purpose",
    intuition:
      "The turbine has one job that matters for keeping the engine alive: spend most of the energy in the hot gas turning the compressor and accessories. Whatever is left over after that is what actually leaves out the back as thrust.",
    analogies: [
      {
        picture:
          "An old mill wheel on a river that grinds grain first, then lets whatever flow is left over continue downstream to also turn a smaller wheel at the farm beyond it. The mill takes its share; the farm gets only what's left over.",
        maps: [
          ["The turbine extracting energy from the hot gas", "the mill wheel taking energy from the flowing river"],
          ["75% of that energy driving the compressor and accessory gearbox", "most of the water's force turning the millstone"],
          ["The remaining 25% continuing on as thrust", "the leftover flow continuing downstream to the smaller wheel"],
        ],
        breaksDown:
          "The mill takes a fixed share by design, at every flow rate — which is the whole point: the turbine is not a leftover-thrust generator that occasionally helps the compressor. It exists FOR the compressor, and thrust is what happens to be left when that job is done.",
      },
    ],
    chain: [
      { label: "Hot, high-energy gas leaves the combustion chamber", trend: "none" },
      {
        label: "The turbine extracts roughly 75% of that energy as the gas passes through",
        trend: "down",
        because: "The turbine's blades are shaped to pull the maximum energy the compressor and gearbox actually need.",
      },
      {
        label: "That extracted energy drives the compressor and accessory gearbox",
        trend: "none",
        because: "This is the turbine's entire reason for existing — without it, the compressor has nothing spinning it.",
      },
      {
        label: "The remaining ~25% of the gas's energy continues rearward as thrust",
        trend: "none",
        terminal: true,
        because: "That leftover is what accelerates out the nozzle — a byproduct of the split, not the turbine's main assignment.",
      },
    ],
    wrongModel: {
      brainWants:
        "The turbine's job is to make thrust — it's part of the engine, and the engine makes thrust, so the turbine must be a thrust-making part.",
      actually:
        "The turbine's sole purpose is turning the compressor and accessory gearbox. Thrust comes from whatever gas energy the turbine did NOT take — a separate 25%, further downstream, that the turbine had nothing to do with producing.",
      whyItsTempting:
        "There's a genuinely separate 25/75 split just one section earlier: in the combustor, 25% of the AIR is primary air for combustion and 75% is secondary air for cooling and dilution. Two different 25/75 splits, back to back, about two different things, is a made-to-be-confused trap.",
    },
    deeper:
      "Notice the two splits run in opposite proportions: 25% of the AIR does the combusting, but 75% of the resulting ENERGY does the compressor-driving. Keeping straight which stage and which quantity a 25 or 75 belongs to is the entire difficulty here — the physics itself is simple once the two are not tangled together.",
  },
];
