import type { Question, SourceReference } from "@/lib/types";

const TG = (chapter: string, eo: string[]): SourceReference => ({
  document: "Aerodynamics Trainee Guide",
  chapter,
  eo,
});

/**
 * Coverage questions.
 *
 * These exist so that every Enabling Objective a lesson claims to teach is
 * also assessed. They cover the lower-yield definitional and aircraft-specific
 * EOs that do not warrant a dedicated teaching screen but still appear on the
 * course blueprint. The content test asserts this file keeps the matrix whole.
 */
export const COVERAGE_QUESTIONS: Question[] = [
  /* ---------------- Unit 1 ---------------- */
  {
    id: "q-cov-001",
    type: "mcq",
    unit: "u1",
    conceptIds: ["c-density", "c-work-power-energy"],
    prompt: "Which pairing of definitions is correct?",
    options: [
      "Mass is the space an object occupies; volume is its molecular content",
      "Mass is the quantity of molecular material; volume is the space occupied",
      "Weight is mass; force is acceleration",
      "Force is mass divided by acceleration",
    ],
    answer: 1,
    explanation:
      "Mass is the quantity of molecular material comprising an object. Volume is the amount of space it occupies. Weight is the force with which gravity attracts that mass, and force is mass times acceleration.",
    knowCold: "Mass = molecular content. Volume = space. Weight = a force. F = ma.",
    difficulty: 1,
    source: TG("Basic Theory", ["2.3", "2.4", "2.6", "2.7"]),
  },
  {
    id: "q-cov-002",
    type: "mcq",
    unit: "u1",
    conceptIds: ["c-wing-planform"],
    prompt:
      "The T-6B uses semi-monocoque fuselage construction. Its advantage is that",
    options: [
      "the skin alone carries the entire stress load",
      "skin, transverse frames and stringers share the stress load, and it may be readily repaired",
      "it is the lightest possible structure, though it cannot be repaired",
      "an internal truss carries the entire load, making it very light",
    ],
    answer: 1,
    explanation:
      "Truss construction is strong but heavy. Full monocoque is light and strong but almost impossible to repair. Semi-monocoque spreads the load across skin, frames and stringers and can be repaired.",
    knowCold:
      "Five components: fuselage, wings, empennage, landing gear, engine. T-6B: semi-monocoque fuselage, full cantilever wing.",
    difficulty: 2,
    source: TG("Basic Theory", ["2.48", "2.49", "2.50", "2.51", "2.52"]),
  },
  {
    id: "q-cov-003",
    type: "mcq",
    unit: "u1",
    conceptIds: ["c-wing-planform", "c-chordline-chord"],
    prompt: "Dihedral angle is the angle between",
    options: [
      "the spanwise inclination of the wing and the lateral axis",
      "the chord line and the longitudinal axis",
      "the lateral axis and a line drawn 25% aft of the leading edge",
      "the tip chord and the root chord",
    ],
    answer: 0,
    explanation:
      "Dihedral is the upward slope of the wing viewed from the front. Option C describes sweep angle; option D describes taper ratio; option B is angle of incidence.",
    knowCold:
      "Root chord at the centreline, tip chord at the tip. Dihedral aids lateral stability; anhedral is negative dihedral.",
    difficulty: 2,
    source: TG("Basic Theory", ["2.56", "2.57", "2.70", "2.75"]),
  },

  /* ---------------- Unit 4 ---------------- */
  {
    id: "q-cov-004",
    type: "mcq",
    unit: "u4",
    conceptIds: ["c-power-available", "c-thrust-available"],
    prompt:
      "For a PROPELLER-driven aircraft, as velocity increases from zero, power available",
    options: [
      "increases linearly throughout",
      "initially increases, then decreases as thrust available falls",
      "decreases throughout",
      "remains constant",
    ],
    answer: 1,
    explanation:
      "P_A = T_A × V. At first the rising velocity dominates, so power available climbs. Eventually the prop's falling thrust available takes over and power available drops. For a jet, power available rises linearly because thrust stays roughly flat.",
    knowCold: "Prop P_A: up then down. Jet P_A: linear rise. Both fall with density.",
    difficulty: 3,
    source: TG("Lift Production and Drag", ["2.102", "2.103"]),
  },
  {
    id: "q-cov-005",
    type: "mcq",
    unit: "u4",
    conceptIds: ["c-vx-vy", "c-ceilings"],
    prompt: "The T-6B recommended best climb speed is 140 KIAS because",
    options: [
      "it is exactly the maximum angle of climb speed",
      "it meets or exceeds obstacle clearance requirements while keeping a safety margin above stall",
      "it is the maximum rate of climb speed at all weights",
      "it is the maneuver speed",
    ],
    answer: 1,
    explanation:
      "At max angle of climb an aircraft can be operating near stall speed. The T-6B therefore publishes a best climb speed that clears obstacles with more margin. Max angle of climb is not flown in the T-6B.",
    knowCold: "T-6B best climb 140 KIAS. Max angle of climb is not flown.",
    difficulty: 2,
    source: TG("Performance and Maneuvering", ["2.132"]),
  },
  {
    id: "q-cov-006",
    type: "mcq",
    unit: "u4",
    conceptIds: ["c-max-endurance", "c-power-required"],
    prompt:
      "For a TURBOPROP in straight and level flight, fuel flow varies directly with",
    options: [
      "thrust available",
      "the power output of the engine",
      "true airspeed alone",
      "indicated airspeed alone",
    ],
    answer: 1,
    explanation:
      "A propeller's thrust is not produced directly by the engine — the engine turns a shaft and produces POWER. So a turboprop's minimum fuel flow is found on the power required curve. A turbojet's is found on the thrust required curve.",
    knowCold: "Prop → power curve. Jet → thrust curve.",
    difficulty: 3,
    source: TG("Performance and Maneuvering", ["2.135"]),
  },
  {
    id: "q-cov-007",
    type: "mcq",
    unit: "u4",
    conceptIds: ["c-4h-club", "c-takeoff-distance"],
    prompt:
      "During a crosswind takeoff or landing, the ailerons are placed into the wind in order to",
    options: [
      "maintain directional control down the runway",
      "overcome the lateral stability that is trying to roll the aircraft away from the sideslip relative wind",
      "increase the crosswind component the aircraft can accept",
      "reduce the nosewheel liftoff speed",
    ],
    answer: 1,
    explanation:
      "Directional control is the RUDDER's job. The ailerons counter the roll that lateral stability generates in response to the crosswind. Lifting the nosewheel below minimum NWLO/TD speed risks weathercocking off the runway. The T-6B crosswind limit is 25 knots.",
    knowCold:
      "Crosswind: wing down, top rudder. Rudder for direction, aileron for roll. T-6B limit 25 kt.",
    difficulty: 3,
    source: TG("Performance and Maneuvering", ["2.147", "2.148", "2.149"]),
  },

  /* ---------------- Unit 5 ---------------- */
  {
    id: "q-cov-008",
    type: "mcq",
    unit: "u5",
    conceptIds: ["c-turn-rate-radius", "c-turn-lift"],
    prompt:
      "Which of the following DOES affect turn rate and turn radius in a level coordinated turn?",
    options: [
      "Gross weight",
      "Airspeed and angle of bank",
      "Thrust available",
      "Wingspan",
    ],
    answer: 1,
    explanation:
      "Turn performance is controlled only by airspeed and bank angle. Weight, thrust and drag can LIMIT the airspeed or bank the aircraft can sustain — a thrust limit caps how much induced drag you can overcome — but the resulting turn is still computed from airspeed and bank alone.",
    knowCold:
      "Weight, thrust and drag set the limits. Airspeed and bank set the actual turn.",
    difficulty: 3,
    source: TG("Performance and Maneuvering", ["2.155", "2.156", "2.157"]),
  },

  /* ---------------- Unit 6 ---------------- */
  {
    id: "q-cov-009",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-dynamic-stability", "c-static-stability"],
    prompt:
      "An aircraft with POSITIVE static stability and NEGATIVE dynamic stability exhibits",
    options: [
      "damped oscillation",
      "undamped oscillation",
      "divergent oscillation",
      "no oscillation at all",
    ],
    answer: 2,
    explanation:
      "Positive static means it always starts back toward equilibrium. Negative dynamic means each swing overshoots further than the last — divergent oscillation. Positive + positive is damped; positive + neutral is undamped.",
    knowCold:
      "Damped = positive/positive. Undamped = positive/neutral. Divergent = positive/negative.",
    difficulty: 3,
    source: TG("Performance and Maneuvering", ["2.171", "2.172"]),
  },
  {
    id: "q-cov-010",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-dynamic-stability", "c-static-stability"],
    prompt:
      "If an object does NOT have positive static stability, it",
    options: [
      "may still have positive dynamic stability",
      "cannot have positive dynamic stability",
      "will always exhibit damped oscillation",
      "is by definition in equilibrium",
    ],
    answer: 1,
    explanation:
      "Static instability guarantees dynamic instability. Positive static stability is a prerequisite — with it, any type of dynamic stability is possible.",
    knowCold: "Static instability ⇒ dynamic instability. The reverse does not hold.",
    difficulty: 3,
    source: TG("Performance and Maneuvering", ["2.169", "2.171"]),
  },
];
