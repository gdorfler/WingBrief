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
];
