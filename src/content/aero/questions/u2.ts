import type { Question, SourceReference } from "@/lib/types";

const LIFT = (eo: string[]): SourceReference => ({
  document: "Aerodynamics Trainee Guide",
  chapter: "Lift Production and Drag",
  eo,
});

const SRC = (eo: string[]): SourceReference => ({
  document: "Basic Theory and Lift Production",
  chapter: "Lift",
  eo,
});

/** Unit 2 — Understand the Wing. */
export const U2_QUESTIONS: Question[] = [
  {
    id: "q-u2-001",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-aero-force"],
    prompt: "Aerodynamic force is the",
    options: [
      "force that is perpendicular to the relative wind",
      "leading edge stagnation point",
      "result of pressure and friction distribution over an airfoil",
      "force that is parallel to the relative wind",
    ],
    answer: 2,
    explanation:
      "Pressure and shear stress are the only two mechanisms by which air communicates force to a body. Integrated over the surface, they give the aerodynamic force.",
    whyWrong:
      "The perpendicular component is lift; the parallel component is drag. Both are components OF the aerodynamic force, not the force itself.",
    knowCold: "AF = net result of pressure + friction distribution. Lift and drag are its components.",
    difficulty: 2,
    officialStyle: true,
    source: LIFT(["2.80"]),
  },
  {
    id: "q-u2-002",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-lift-def"],
    prompt: "Lift is the",
    options: [
      "leading edge stagnation point",
      "component of aerodynamic force that acts perpendicular to the relative wind",
      "result of pressure and friction distribution over an airfoil",
      "component of aerodynamic force that acts parallel to the relative wind",
    ],
    answer: 1,
    explanation:
      "Lift acts perpendicular to the relative wind — not to the horizon. In a loop the lift vector rotates with the relative wind.",
    knowCold: "Lift ⟂ relative wind. Drag ∥ relative wind.",
    difficulty: 1,
    officialStyle: true,
    source: LIFT(["2.83"]),
  },
  {
    id: "q-u2-003",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-drag-def"],
    prompt:
      "___ is the component acting parallel and in the same direction as the relative wind.",
    options: ["Lift", "Drag", "Weight", "Flight path"],
    answer: 1,
    explanation:
      "Drag is the component of aerodynamic force parallel to, and in the same direction as, the relative wind.",
    knowCold: "Drag: parallel AND same direction as relative wind.",
    difficulty: 1,
    officialStyle: true,
    source: LIFT(["2.86"]),
  },
  {
    id: "q-u2-004",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-aero-force"],
    prompt:
      "Of the four primary forces of flight, which are considered aerodynamic forces?",
    options: [
      "Lift and weight",
      "Thrust and drag",
      "Lift and drag",
      "All four",
    ],
    answer: 2,
    explanation:
      "Only lift and drag arise from the airflow over the airframe. Weight is gravity; thrust is engine output.",
    knowCold: "Aerodynamic forces = lift + drag only.",
    difficulty: 1,
    source: LIFT(["2.80"]),
  },
  {
    id: "dl-u2-005",
    type: "dragLabel",
    unit: "u2",
    conceptIds: ["c-lift-def", "c-drag-def", "c-equilibrium"],
    prompt: "Drag each force onto the correct vector.",
    diagram: { id: "four-forces", props: { labels: false } },
    labels: ["Lift", "Weight", "Thrust", "Drag"],
    slots: [
      { id: "s-lift", label: "", x: 250, y: 58 },
      { id: "s-weight", label: "", x: 250, y: 226 },
      { id: "s-thrust", label: "", x: 392, y: 142 },
      { id: "s-drag", label: "", x: 108, y: 142 },
    ],
    answer: {
      "s-lift": "Lift",
      "s-weight": "Weight",
      "s-thrust": "Thrust",
      "s-drag": "Drag",
    },
    explanation:
      "In equilibrium level flight lift opposes weight and thrust opposes drag, and all four sum to zero.",
    knowCold: "Lift up, weight down, thrust forward, drag aft — summing to zero in equilibrium.",
    difficulty: 1,
    source: LIFT(["2.80", "2.81"]),
  },

  /* ---------------- Pressure distribution ---------------- */
  {
    id: "cc-u2-006",
    type: "connectChain",
    unit: "u2",
    conceptIds: ["c-pressure-distribution", "c-continuity", "c-bernoulli"],
    prompt: "Build the chain that produces lift on a cambered wing.",
    trigger: "Air meets the upper surface",
    steps: [
      "Streamtube cross-sectional area decreases",
      "Velocity increases (continuity)",
      "Static pressure decreases (Bernoulli)",
      "Pressure differential produces lift toward the lower pressure",
    ],
    explanation:
      "Continuity gives the speed-up, Bernoulli converts that into a static-pressure drop, and the resulting differential between lower and upper surfaces is lift.",
    knowCold: "Squeeze → faster → lower static pressure → lift toward the low pressure.",
    difficulty: 2,
    source: LIFT(["2.82"]),
  },
  {
    id: "q-u2-007",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-pressure-distribution"],
    prompt:
      "Maximum airflow velocity over an airfoil corresponds to the point of",
    options: [
      "maximum static pressure",
      "minimum static pressure",
      "the leading edge stagnation point",
      "the trailing edge stagnation point",
    ],
    answer: 1,
    explanation:
      "Airflow accelerates to maximum velocity at the airfoil's maximum thickness. By Bernoulli, maximum velocity means minimum static pressure.",
    knowCold: "Max velocity = min static pressure = max thickness.",
    difficulty: 2,
    source: LIFT(["2.82"]),
  },
  {
    id: "sp-u2-008",
    type: "sliderPredict",
    unit: "u2",
    conceptIds: ["c-pressure-distribution", "c-cl-vs-aoa"],
    widget: "PressureDistributionSlider",
    prompt:
      "Increase angle of attack and watch the pressure arrows. Below CLmax AOA, what happens to the suction over the upper surface?",
    options: [
      "It weakens as AOA increases",
      "It strengthens as AOA increases",
      "It is unchanged — only camber affects it",
    ],
    answer: 1,
    explanation:
      "Raising AOA further reduces the streamtube area over the top surface, accelerating the flow and dropping static pressure further — so suction and lift both grow, up to CLmax AOA.",
    knowCold: "AOA ↑ → upper-surface suction ↑ → CL ↑, up to CLmax.",
    difficulty: 2,
    source: LIFT(["2.82", "2.96"]),
  },

  /* ---------------- Lift equation ---------------- */
  {
    id: "q-u2-009",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-lift-equation"],
    prompt: "The lift equation is",
    options: [
      "L = ρVSC_L",
      "L = ½ρV²SC_L",
      "L = ½ρVS²C_L",
      "L = ½ρV²SC_D",
    ],
    answer: 1,
    explanation:
      "Lift equals dynamic pressure (½ρV²) times wing surface area (S) times the coefficient of lift (C_L).",
    knowCold: "L = ½ρV²SC_L.",
    difficulty: 1,
    source: LIFT(["2.84"]),
  },
  {
    id: "q-u2-010",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-lift-equation"],
    prompt:
      "If true airspeed doubles and everything else is held constant, lift",
    options: ["doubles", "triples", "quadruples", "is unchanged"],
    answer: 2,
    explanation:
      "Velocity appears squared in the lift equation, so doubling V multiplies lift by four.",
    knowCold: "V² — double the speed, four times the lift.",
    difficulty: 2,
    source: LIFT(["2.84"]),
  },
  {
    id: "sp-u2-011",
    type: "sliderPredict",
    unit: "u2",
    conceptIds: ["c-lift-equation"],
    widget: "LiftLabMini",
    prompt:
      "Halve the air density and hold everything else fixed. Lift becomes",
    options: [
      "one quarter of its original value",
      "half of its original value",
      "unchanged",
      "double its original value",
    ],
    answer: 1,
    explanation:
      "Density appears to the first power in L = ½ρV²SC_L, so halving ρ halves lift. Only velocity is squared.",
    knowCold: "ρ, S and C_L are linear. Only V is squared.",
    difficulty: 2,
    source: LIFT(["2.84"]),
  },
  {
    id: "q-u2-012",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-coefficient-of-lift"],
    prompt: "The variables within the lift equation a pilot can affect in flight are",
    options: [
      "AOA and camber only",
      "AOA, camber, velocity",
      "AOA and velocity only",
      "AOA, camber, viscosity",
    ],
    answer: 1,
    explanation:
      "In the lift equation the pilot controls velocity and C_L; within C_L (C.AR.V.A.C) the controllable factors are AOA and camber.",
    whyWrong:
      "Viscosity and compressibility vary with conditions and cannot be set by the pilot.",
    knowCold: "Pilot controls: velocity, AOA, camber.",
    difficulty: 2,
    officialStyle: true,
    source: LIFT(["2.85"]),
  },
  {
    id: "q-u2-013",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-coefficient-of-lift"],
    prompt: "C.AR.V.A.C stands for the factors making up",
    options: [
      "the coefficient of drag",
      "the coefficient of lift",
      "equivalent parasite area",
      "the load factor",
    ],
    answer: 1,
    explanation:
      "Compressibility, Aspect Ratio, Viscosity, AOA and Camber are the five factors folded into the coefficient of lift.",
    knowCold: "C_L = Compressibility, Aspect Ratio, Viscosity, AOA, Camber.",
    difficulty: 1,
    source: SRC(["2.85"]),
  },
  {
    id: "q-u2-014",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-v-aoa-inverse"],
    prompt:
      "In level flight at constant weight, velocity and angle of attack are",
    options: [
      "directly related",
      "inversely related",
      "unrelated",
      "related only when flaps are extended",
    ],
    answer: 1,
    explanation:
      "Lift must stay equal to weight. If velocity falls, C_L must rise to compensate — which means a higher AOA.",
    knowCold: "Level flight: slower needs more AOA.",
    difficulty: 2,
    source: LIFT(["2.84"]),
  },

  /* ---------------- CL vs AOA ---------------- */
  {
    id: "gr-u2-015",
    type: "graphRead",
    unit: "u2",
    conceptIds: ["c-clmax", "c-cl-vs-aoa"],
    prompt: "Tap CLmax on the curve.",
    diagram: { id: "cl-vs-aoa", props: { camber: "positive", marker: null } },
    targets: [
      { id: "clmax", label: "CLmax", x: 322, y: 62, r: 26 },
      { id: "linear", label: "Linear region", x: 208, y: 132, r: 26 },
      { id: "zerolift", label: "Zero-lift AOA", x: 104, y: 196, r: 26 },
      { id: "stallregion", label: "Stall region", x: 392, y: 108, r: 26 },
    ],
    answer: "clmax",
    explanation:
      "CLmax is the peak of the curve. The AOA at that peak is CLmax AOA — the critical or stalling angle of attack.",
    knowCold: "CLmax = the peak. Past it, more AOA gives less CL.",
    difficulty: 2,
    source: LIFT(["2.96"]),
  },
  {
    id: "q-u2-016",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-clmax"],
    prompt: "CLmax AOA is best described as the",
    options: [
      "most efficient angle of attack",
      "most effective angle of attack",
      "angle of attack that produces minimum total drag",
      "angle of attack for maximum range",
    ],
    answer: 1,
    explanation:
      "CLmax AOA produces the greatest coefficient of lift, so the trainee guide calls it the most EFFECTIVE angle of attack. The most EFFICIENT angle of attack is L/Dmax AOA.",
    whyWrong:
      "Minimum total drag, max range and 'most efficient' all describe L/Dmax AOA, not CLmax AOA.",
    knowCold: "Effective = CLmax AOA. Efficient = L/Dmax AOA.",
    difficulty: 3,
    source: LIFT(["2.96"]),
  },
  {
    id: "q-u2-017",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-clmax"],
    prompt:
      "For a given airfoil, CLmax AOA remains constant regardless of",
    options: [
      "camber",
      "flap setting",
      "weight, dynamic pressure and bank angle",
      "airfoil shape",
    ],
    answer: 2,
    explanation:
      "As long as the airfoil's shape does not change, CLmax AOA is fixed — weight, q and bank angle do not move it. Changing camber with flaps DOES move it.",
    knowCold: "Same shape → same stalling AOA, always.",
    difficulty: 3,
    source: LIFT(["2.96"]),
  },
  {
    id: "q-u2-018",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-cl-vs-aoa", "c-camber-types"],
    prompt:
      "On a CL vs AOA plot, a positively cambered airfoil crosses zero lift at",
    options: [
      "a positive angle of attack",
      "zero angle of attack",
      "a negative angle of attack",
      "CLmax AOA",
    ],
    answer: 2,
    explanation:
      "A positively cambered airfoil already makes lift at 0° AOA, so its curve must be pushed to a negative AOA before C_L reaches zero.",
    knowCold: "Positive camber → zero-lift AOA is negative.",
    difficulty: 3,
    source: LIFT(["2.96"]),
  },

  /* ---------------- Flaps ---------------- */
  {
    id: "q-u2-019",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-flaps-cl"],
    prompt: "Retracting the flaps ___ CLmax and ___ CLmax AOA.",
    options: [
      "increases, decreases",
      "decreases, decreases",
      "decreases, increases",
      "increases, increases",
    ],
    answer: 2,
    explanation:
      "Lowering flaps increases camber: CLmax up, CLmax AOA down. Retracting them reverses both — CLmax decreases and CLmax AOA increases.",
    knowCold: "Flaps DOWN: CLmax ↑, CLmax AOA ↓. Flaps UP: the reverse.",
    difficulty: 3,
    officialStyle: true,
    source: SRC(["3.13"]),
  },
  {
    id: "ba-u2-020",
    type: "beforeAfter",
    unit: "u2",
    conceptIds: ["c-flaps-cl"],
    prompt: "Flaps go from UP to DOWN. What happens to each quantity?",
    diagram: { id: "cl-vs-aoa", props: { flaps: false, camber: "positive" } },
    states: ["Flaps UP", "Flaps DOWN"],
    beforeProps: { flaps: false },
    afterProps: { flaps: true },
    rows: [
      {
        label: "C_L at a given AOA",
        options: ["Increases", "Decreases", "Unchanged"],
        answer: 0,
      },
      { label: "CLmax", options: ["Increases", "Decreases", "Unchanged"], answer: 0 },
      { label: "CLmax AOA", options: ["Increases", "Decreases", "Unchanged"], answer: 1 },
      { label: "Stall speed", options: ["Increases", "Decreases", "Unchanged"], answer: 1 },
    ],
    explanation:
      "Flaps add positive camber. The whole curve shifts up and left: more C_L everywhere, a higher peak, and that peak reached at a LOWER angle of attack.",
    knowCold: "Flaps down: CL ↑, CLmax ↑, CLmax AOA ↓, stall speed ↓.",
    difficulty: 3,
    source: SRC(["3.12", "3.13"]),
  },
  {
    id: "q-u2-021",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-flaps-cl", "c-high-lift-purpose"],
    prompt:
      "Lowering flaps improves visibility on takeoff and landing because",
    options: [
      "the nose sits lower for the same lift, giving a flatter attitude",
      "the flaps physically move the pilot's eye position forward",
      "CLmax AOA increases so the aircraft flies at a higher pitch",
      "drag decreases, allowing a shallower approach",
    ],
    answer: 0,
    explanation:
      "Higher C_L means the required lift is available at a lower AOA and lower speed, so the aircraft can be flown in a flatter attitude.",
    whyWrong:
      "Flaps DECREASE CLmax AOA and INCREASE drag. Both of those are the opposite of options C and D.",
    knowCold: "Flaps → flatter attitude → better over-the-nose visibility.",
    difficulty: 2,
    source: SRC(["3.12", "3.13"]),
  },
  {
    id: "trap-u2-022",
    type: "spotTheTrap",
    unit: "u2",
    conceptIds: ["c-lift-def"],
    prompt: '"Lift always acts in the upward direction, opposing weight."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Lift is always perpendicular to the RELATIVE WIND, not to the horizon. Inverted at the top of a loop, the lift vector points toward the ground.",
    knowCold: "Lift is perpendicular to the relative wind, in any attitude.",
    difficulty: 2,
    source: LIFT(["2.83"]),
  },
  {
    id: "trap-u2-023",
    type: "spotTheTrap",
    unit: "u2",
    conceptIds: ["c-pressure-distribution"],
    prompt:
      '"Air splitting at the leading edge must rejoin at the trailing edge, so the longer upper path forces a higher velocity."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. The trainee guide names this explicitly as a common misconception: the upper element departs the surface long before its companion reaches the trailing edge. The real mechanism is streamtube constriction — continuity, then Bernoulli.",
    knowCold: "Equal-transit-time is a myth. Continuity + Bernoulli is the mechanism.",
    difficulty: 3,
    source: LIFT(["2.82"]),
  },
  {
    id: "q-u2-024",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-lift-equation", "c-coefficient-of-lift"],
    prompt:
      "Which factor in lift production can the pilot NOT control in flight?",
    options: ["Velocity", "Angle of attack", "Camber", "Air viscosity"],
    answer: 3,
    explanation:
      "Viscosity and compressibility vary with altitude, airspeed and air composition. The pilot has no direct control over them.",
    knowCold: "Uncontrollable: viscosity, compressibility, aspect ratio (on most aircraft).",
    difficulty: 1,
    source: LIFT(["2.85"]),
  },
  {
    id: "cs-u2-025",
    type: "curveShift",
    unit: "u2",
    conceptIds: ["c-flaps-cl"],
    diagram: { id: "cl-vs-aoa", props: { flaps: false, camber: "positive" } },
    prompt: "The pilot lowers full flaps.",
    change: "Flaps extended",
    curveLabel: "CL vs AOA curve",
    options: ["upLeft", "upRight", "downLeft", "downRight"],
    answer: "upLeft",
    afterProps: { flaps: true },
    explanation:
      "Extra camber raises C_L at every AOA (curve moves up) and brings the stall on at a lower AOA (curve moves left).",
    knowCold: "Flaps shift the CL curve UP and LEFT.",
    difficulty: 3,
    source: SRC(["3.13"]),
  },
  {
    id: "q-u2-026",
    type: "mcq",
    unit: "u2",
    conceptIds: ["c-lift-equation"],
    prompt:
      "Two identical aircraft fly at the same AOA and airspeed, one at sea level and one at 15,000 ft. The one at altitude produces",
    options: [
      "more lift, because true airspeed is higher",
      "less lift, because density is lower",
      "the same lift, because AOA is the same",
      "the same lift, because indicated airspeed is the same",
    ],
    answer: 1,
    explanation:
      "At the same TRUE airspeed and AOA, the only difference is density. Lower ρ means lower dynamic pressure and therefore less lift.",
    knowCold: "Same TAS + less density = less lift.",
    difficulty: 3,
    source: LIFT(["2.84"]),
  },
];
