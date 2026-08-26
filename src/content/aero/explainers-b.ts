import type { Explainer, SourceReference } from "@/lib/types";

const TG = (chapter: string): SourceReference => ({
  document: "Aerodynamics Trainee Guide",
  chapter,
});

const BASIC = TG("Basic Theory");
const LIFT = TG("Lift Production and Drag");
const PERF = TG("Performance and Maneuvering");
const STALL = TG("Stalls");

/**
 * Second explainer set.
 *
 * Roughly half the Aerodynamics lessons had no sixty-second walkthrough, which
 * left their diagram sitting still on a model screen. These animate the
 * diagram each lesson already uses, so the picture does the explaining.
 */
export const EXPLAINERS_B: Explainer[] = [
  {
    id: "x-continuity-bernoulli",
    title: "Squeeze the Tube",
    promise: "Watch velocity and pressure trade places as a streamtube narrows.",
    unit: "u1",
    conceptIds: ["c-continuity", "c-bernoulli", "c-dynamic-pressure"],
    lessonId: "l03-continuity-bernoulli",
    diagram: { id: "streamtube" },
    frames: [
      { caption: "A streamtube is a closed system. Mass in equals mass out.", hold: 2800, props: { constriction: 0 } },
      { caption: "Narrow it, and the same mass must move faster.", hold: 3000, props: { constriction: 0.3 } },
      { caption: "Faster air carries more dynamic pressure.", hold: 2800, props: { constriction: 0.5 } },
      { caption: "Total pressure never changes — so static must fall.", hold: 3200, props: { constriction: 0.7 } },
      { caption: "That falling static pressure over the wing is lift.", hold: 3000, props: { constriction: 0.5 } },
    ],
    predict: {
      at: 2,
      question:
        "Narrow the streamtube and the air speeds up, so dynamic pressure rises. What must static pressure do?",
      options: [
        "Rise as well",
        "Fall by the same amount",
        "Stay where it was",
      ],
      answer: 1,
      because:
        "Total pressure is the fixed budget and it never changes along the tube. Whatever dynamic pressure gains, static pressure gives up — and that falling static pressure over the top of the wing is lift.",
    },
    knowCold: "Area down, velocity up, static pressure down. Total is fixed.",
    source: BASIC,
  },
  {
    id: "x-camber-at-zero-aoa",
    title: "Camber at Zero AOA",
    promise: "Three airfoils at the same zero angle of attack, doing three different things.",
    unit: "u1",
    conceptIds: ["c-mean-camber-line", "c-camber-types", "c-chordline-chord"],
    lessonId: "l05-wing-geometry",
    diagram: { id: "airfoil-geometry" },
    frames: [
      { caption: "The chord line joins the leading and trailing EDGES.", hold: 2800, props: { camber: 0.06, labels: true } },
      { caption: "The mean camber line runs between the SURFACES.", hold: 2800, props: { camber: 0.06, labels: true } },
      { caption: "Positive camber: MCL above the chord line, lift at 0° AOA.", hold: 3200, props: { camber: 0.09, labels: true } },
      { caption: "Symmetric: the two lines coincide. Zero lift at 0° AOA.", hold: 3200, props: { camber: 0, labels: true } },
      { caption: "Negative camber: MCL below. Negative lift at 0° AOA.", hold: 3000, props: { camber: -0.07, labels: true } },
    ],
    predict: {
      at: 2,
      question:
        "A SYMMETRIC airfoil sits at exactly zero angle of attack. How much lift does it make?",
      options: [
        "Some, because it is still an airfoil",
        "None",
        "Negative lift",
      ],
      answer: 1,
      because:
        "On a symmetric section the mean camber line and the chord line are the same line, so there is nothing to bias the flow either way. Positive camber makes lift at 0°, negative camber makes negative lift, symmetric makes none.",
    },
    knowCold: "Symmetric airfoil, zero AOA, zero lift.",
    source: BASIC,
  },
  {
    id: "x-planform-vocabulary",
    title: "Reading a Planform",
    promise: "Four measurements, and the one everybody takes from the wrong line.",
    unit: "u1",
    conceptIds: ["c-root-tip-chord", "c-sweep-angle", "c-dihedral", "c-wing-planform"],
    lessonId: "l05b-airplane-and-wing",
    diagram: { id: "wing-planform" },
    frames: [
      { caption: "Root chord at the centerline, tip chord at the wingtip.", hold: 3000, props: { labels: true } },
      { caption: "Taper ratio is tip divided by root — less than one.", hold: 3000, props: { labels: true } },
      { caption: "Sweep is measured to the 25% chord line, not the leading edge.", hold: 3400, props: { labels: true } },
      { caption: "On a tapered wing those two lines are not parallel.", hold: 3000, props: { labels: true } },
      { caption: "Dihedral needs a front view — it is invisible from above.", hold: 3000, props: { labels: true } },
    ],
    predict: {
      at: 1,
      question:
        "Sweep angle is measured to which line?",
      options: [
        "The leading edge",
        "The 25% chord line",
        "The trailing edge",
      ],
      answer: 1,
      because:
        "It is the quarter-chord line, and on a tapered wing that is not parallel to the leading edge — so reading sweep off the leading edge gives the wrong number. Taper ratio is separate again: tip chord divided by root chord.",
    },
    knowCold: "Taper is tip ÷ root. Sweep is to the 25% line.",
    source: BASIC,
  },
  {
    id: "x-resolving-aero-force",
    title: "Splitting the Force",
    promise: "One aerodynamic force, resolved into the two you actually care about.",
    unit: "u2",
    conceptIds: ["c-aero-force", "c-lift-def", "c-drag-def"],
    lessonId: "l07-aerodynamic-force",
    diagram: { id: "aero-force-components" },
    frames: [
      { caption: "The wing produces one total aerodynamic force.", hold: 2800, props: { aoa: 6 } },
      { caption: "Lift is the component PERPENDICULAR to the relative wind.", hold: 3200, props: { aoa: 6 } },
      { caption: "Drag is the component PARALLEL to it.", hold: 3000, props: { aoa: 6 } },
      { caption: "Raise the AOA and the whole force grows and tilts back.", hold: 3200, props: { aoa: 12 } },
      { caption: "Both references are the RELATIVE WIND — never the horizon.", hold: 3200, props: { aoa: 12 } },
    ],
    predict: {
      at: 2,
      question:
        "In a steep climb, is lift still perpendicular to the horizon?",
      options: [
        "Yes — lift is always vertical",
        "No — lift is perpendicular to the RELATIVE WIND",
        "Only in unaccelerated flight",
      ],
      answer: 1,
      because:
        "Both components are defined against the relative wind, never the horizon. Lift is the part perpendicular to it and drag the part parallel to it — so in a climb the lift vector is tilted back along with everything else.",
    },
    knowCold: "Lift ⟂ relative wind. Drag ∥ relative wind.",
    source: LIFT,
  },
  {
    id: "x-lift-equation-terms",
    title: "One Squared Term",
    promise: "Why velocity matters more than everything else in the lift equation.",
    unit: "u2",
    conceptIds: ["c-lift-equation", "c-coefficient-of-lift", "c-dynamic-pressure"],
    lessonId: "l09-lift-equation",
    diagram: { id: "lift-equation-anatomy" },
    frames: [
      { caption: "Four terms: density, velocity, wing area, coefficient of lift.", hold: 3000, props: { highlight: "all" } },
      { caption: "Density and area are linear — double them, double lift.", hold: 3000, props: { highlight: "rho" } },
      { caption: "C_L is set by angle of attack, and it is linear too.", hold: 3000, props: { highlight: "cl" } },
      { caption: "Velocity is the only SQUARED term.", hold: 3400, props: { highlight: "v" } },
      { caption: "Double the speed and lift quadruples. Nothing else does that.", hold: 3200, props: { highlight: "v" } },
    ],
    predict: {
      at: 2,
      question:
        "You double your airspeed and change nothing else. What happens to lift?",
      options: [
        "It doubles",
        "It quadruples",
        "It rises by about half",
      ],
      answer: 1,
      because:
        "Velocity is the only squared term in the lift equation. Density, wing area and coefficient of lift are all linear — double any of those and lift doubles. Double the speed and it goes up four times.",
    },
    knowCold: "V is squared. Everything else is linear.",
    source: LIFT,
  },
  {
    id: "x-parasite-breakdown",
    title: "Three Kinds of Parasite",
    promise: "Form, friction and interference, and what each one is actually caused by.",
    unit: "u3",
    conceptIds: ["c-parasite-drag", "c-form-drag", "c-friction-drag", "c-interference-drag"],
    lessonId: "l11-parasite-drag",
    diagram: { id: "parasite-components" },
    frames: [
      { caption: "Parasite drag is everything not caused by producing lift.", hold: 2800, props: { highlight: "none" } },
      { caption: "Form drag: the shape's frontal area pushing air aside.", hold: 3000, props: { highlight: "form" } },
      { caption: "Friction drag: viscosity dragging on the skin.", hold: 3000, props: { highlight: "friction" } },
      { caption: "Interference drag: streamlines colliding where parts meet.", hold: 3200, props: { highlight: "interference" } },
      { caption: "All three grow with velocity squared.", hold: 3000, props: { highlight: "none" } },
    ],
    predict: {
      at: 2,
      question:
        "Form, friction and interference drag all come from different mechanisms. What do they share?",
      options: [
        "They all fall as speed rises",
        "They all grow with velocity squared",
        "They are all independent of speed",
      ],
      answer: 1,
      because:
        "That common V-squared growth is why they are grouped together as parasite drag in the first place — everything not caused by producing lift. Induced drag is the one that goes the other way.",
    },
    knowCold: "Form, friction, interference — and all rise with V².",
    source: LIFT,
  },
  {
    id: "x-thrust-versus-power",
    title: "Thrust or Power",
    promise: "Two curves that look alike and answer completely different questions.",
    unit: "u4",
    conceptIds: ["c-thrust-required", "c-power-required", "c-thrust-available", "c-power-available"],
    lessonId: "l14-thrust-and-power",
    diagram: { id: "thrust-power-pair" },
    frames: [
      { caption: "Thrust required is just the total drag curve, in pounds.", hold: 3000, props: { highlight: "thrust" } },
      { caption: "Its minimum is at L/Dmax AOA.", hold: 2800, props: { highlight: "thrust" } },
      { caption: "Power required is thrust times velocity.", hold: 3000, props: { highlight: "power" } },
      { caption: "Multiplying by V pushes its minimum to a SLOWER speed.", hold: 3400, props: { highlight: "power" } },
      { caption: "Thrust excess climbs steeply. Power excess climbs quickly.", hold: 3200, props: { highlight: "both" } },
    ],
    predict: {
      at: 2,
      question:
        "Power required is thrust required multiplied by velocity. What does that do to where the minimum sits?",
      options: [
        "Nothing — same speed as minimum thrust",
        "Moves it to a SLOWER speed",
        "Moves it to a faster speed",
      ],
      answer: 1,
      because:
        "Multiplying by V penalises the fast end of the curve more than the slow end, so the minimum slides left. That is why minimum power speed is slower than L/Dmax — and why thrust excess gives you climb ANGLE while power excess gives you climb RATE.",
    },
    knowCold: "Thrust excess → angle. Power excess → rate.",
    source: LIFT,
  },
  {
    id: "x-takeoff-factors",
    title: "The 4-H Club",
    promise: "Four conditions that lengthen your takeoff roll, all through one mechanism.",
    unit: "u4",
    conceptIds: ["c-takeoff-distance", "c-4h-club", "c-takeoff-landing-speeds"],
    lessonId: "l16-takeoff-landing",
    diagram: { id: "takeoff-forces" },
    frames: [
      { caption: "Takeoff needs 1.2 times power-off stall speed.", hold: 2800, props: { phase: "roll" } },
      { caption: "High, hot and humid all reduce air density.", hold: 3000, props: { phase: "roll" } },
      { caption: "Less density means less thrust and less lift per knot.", hold: 3200, props: { phase: "roll" } },
      { caption: "Heavy is the fourth H — and it needs more lift as well.", hold: 3000, props: { phase: "rotate" } },
      { caption: "Double the weight and takeoff distance goes up four times.", hold: 3400, props: { phase: "rotate" } },
    ],
    predict: {
      at: 2,
      question:
        "You double the aircraft's weight. What happens to the takeoff distance?",
      options: [
        "It doubles",
        "It goes up about four times",
        "It rises by roughly half",
      ],
      answer: 1,
      because:
        "Heavy is the fourth H, and it hurts twice: more lift needed to fly, and more mass to accelerate. The two compound, so distance goes as weight squared. High, hot and humid attack the same problem from the density side.",
    },
    knowCold: "High, Hot, Humid, Heavy. Weight doubles, distance ×4.",
    source: PERF,
  },
  {
    id: "x-angle-versus-rate",
    title: "Steepest or Fastest",
    promise: "Vx and Vy answer different questions, and only one clears the obstacle.",
    unit: "u4",
    conceptIds: ["c-vx-vy", "c-excess-thrust", "c-excess-power", "c-best-climb-profile"],
    lessonId: "l17-climb",
    diagram: { id: "climb-vectors" },
    frames: [
      { caption: "Climb ANGLE is altitude gained per unit of ground distance.", hold: 3000, props: { mode: "angle" } },
      { caption: "It comes from THRUST excess, and peaks at Vx.", hold: 3000, props: { mode: "angle" } },
      { caption: "Climb RATE is altitude gained per unit of TIME.", hold: 3000, props: { mode: "rate" } },
      { caption: "It comes from POWER excess, and peaks at Vy.", hold: 3000, props: { mode: "rate" } },
      { caption: "The T-6B flies 140 KIAS instead — max AOC sits near stall.", hold: 3400, props: { mode: "rate" } },
    ],
    predict: {
      at: 2,
      question:
        "There is an obstacle off the end of the runway. Which speed do you want?",
      options: [
        "Vy — the best rate of climb",
        "Vx — the best angle of climb",
        "Whichever is faster on the day",
      ],
      answer: 1,
      because:
        "Angle is altitude per unit of GROUND distance, and that is what clears an obstacle. It comes from thrust excess and peaks at Vx. Vy is altitude per unit of TIME, from power excess — that is the one for getting up to cruise.",
    },
    knowCold: "Vx for the obstacle. Vy for the altitude. 140 KIAS in the T-6B.",
    source: PERF,
  },
  {
    id: "x-range-versus-endurance",
    title: "Distance or Time",
    promise: "Two points on the same curve, and the tangent line that separates them.",
    unit: "u4",
    conceptIds: ["c-max-range", "c-max-endurance", "c-fuel-flow-turboprop"],
    lessonId: "l18-range-endurance",
    diagram: { id: "power-curves" },
    frames: [
      { caption: "Endurance asks: how long can I stay airborne?", hold: 2800, props: { highlight: "min" } },
      { caption: "Minimum fuel flow — the BOTTOM of the power required curve.", hold: 3200, props: { highlight: "min" } },
      { caption: "Range asks: how far can I go on this fuel?", hold: 2800, props: { highlight: "tangent" } },
      { caption: "Minimum fuel per mile — a tangent from the origin.", hold: 3200, props: { highlight: "tangent" } },
      { caption: "For a turboprop both live on the POWER curve, not thrust.", hold: 3400, props: { highlight: "both" } },
    ],
    predict: {
      at: 2,
      question:
        "Maximum endurance sits at the bottom of the power required curve. Where does maximum RANGE sit?",
      options: [
        "At the same point",
        "Where a tangent from the origin touches the curve",
        "At the fastest speed the curve allows",
      ],
      answer: 1,
      because:
        "Endurance minimises fuel per HOUR, which is the minimum of the curve. Range minimises fuel per MILE, which is the smallest ratio of fuel flow to speed — and that is the tangent drawn from the origin, always faster than max endurance.",
    },
    knowCold: "Endurance at the minimum. Range at the tangent.",
    source: PERF,
  },
  {
    id: "x-boundary-layer-transition",
    title: "Laminar to Turbulent",
    promise: "Follow the boundary layer from the leading edge to separation.",
    unit: "u5",
    conceptIds: ["c-boundary-layer", "c-laminar-turbulent", "c-pressure-gradient"],
    lessonId: "l20-boundary-layer",
    diagram: { id: "boundary-layer" },
    frames: [
      { caption: "At the leading edge the layer is laminar and about 1 mm thick.", hold: 3000, props: { aoa: 4 } },
      { caption: "Falling pressure to max thickness is a FAVOURABLE gradient.", hold: 3200, props: { aoa: 4 } },
      { caption: "Past max thickness pressure rises again — ADVERSE.", hold: 3200, props: { aoa: 8 } },
      { caption: "Turbulent flow has more energy and hangs on longer.", hold: 3000, props: { aoa: 12 } },
      { caption: "Raise AOA and separation marches forward toward the nose.", hold: 3400, props: { aoa: 16 } },
    ],
    predict: {
      at: 1,
      question:
        "Where along the airfoil does the pressure gradient turn ADVERSE?",
      options: [
        "Right at the leading edge",
        "Aft of the point of maximum thickness",
        "Only at high angles of attack",
      ],
      answer: 1,
      because:
        "Pressure falls from the leading edge back to maximum thickness — a favourable gradient that helps the flow along. Past that point pressure rises again and the boundary layer is fighting it, which is where separation eventually begins.",
    },
    knowCold: "Favourable to max thickness. Adverse after it.",
    source: STALL,
  },
  {
    id: "x-stall-speed-factors",
    title: "What Moves Stall Speed",
    promise: "Four factors, and the one that leaves indicated stall speed alone.",
    unit: "u5",
    conceptIds: ["c-stall-speed", "c-stall-speed-altitude", "c-accelerated-stall"],
    lessonId: "l22-stall-speed",
    diagram: { id: "stall-speed-equation" },
    frames: [
      { caption: "Stall always happens at C_Lmax AOA — never at a speed.", hold: 3000, props: { highlight: "clmax" } },
      { caption: "More weight needs more lift, so stall SPEED rises.", hold: 3000, props: { highlight: "weight" } },
      { caption: "Load factor does the same, by the square root of n.", hold: 3200, props: { highlight: "n" } },
      { caption: "Altitude raises TRUE stall speed as density falls.", hold: 3200, props: { highlight: "rho" } },
      { caption: "But INDICATED stall speed uses ρ₀ — so it does not move.", hold: 3400, props: { highlight: "rho" } },
    ],
    predict: {
      at: 2,
      question:
        "You climb to altitude. What happens to your INDICATED stall speed?",
      options: [
        "It rises with the true stall speed",
        "It does not move",
        "It falls",
      ],
      answer: 1,
      because:
        "True stall speed rises as density falls, but the airspeed indicator is calibrated to sea-level density and reads dynamic pressure — the same dynamic pressure that stalls the wing. So the indicated number stays put, which is exactly what makes it useful.",
    },
    knowCold: "Indicated stall speed is fixed with altitude. True is not.",
    source: STALL,
  },
  {
    id: "x-high-lift-two-ways",
    title: "Two Ways to Raise C_L",
    promise: "Change the camber, or re-energise the boundary layer.",
    unit: "u5",
    conceptIds: ["c-high-lift-purpose", "c-blc-devices", "c-camber-devices"],
    lessonId: "l23-high-lift-devices",
    diagram: { id: "high-lift-comparison" },
    frames: [
      { caption: "High lift devices exist to lower stall speed for landing.", hold: 2800, props: { device: "none" } },
      { caption: "Camber devices raise C_Lmax and LOWER C_Lmax AOA.", hold: 3200, props: { device: "flap" } },
      { caption: "Plain, split, slotted and Fowler are all camber devices.", hold: 3000, props: { device: "fowler" } },
      { caption: "BLC devices re-energise the boundary layer instead.", hold: 3200, props: { device: "slat" } },
      { caption: "Those raise C_Lmax AND raise C_Lmax AOA — slats and slots.", hold: 3400, props: { device: "slat" } },
    ],
    predict: {
      at: 2,
      question:
        "Camber devices lower the AOA at which CLmax occurs. What do boundary layer control devices do to it?",
      options: [
        "Lower it as well",
        "RAISE it",
        "Leave it unchanged",
      ],
      answer: 1,
      because:
        "That is the whole distinction. Flaps add camber: more CLmax, but it arrives sooner. Slats and slots re-energise the boundary layer so it hangs on longer: more CLmax AND a higher critical angle.",
    },
    knowCold: "Camber devices lower the stall AOA. BLC devices raise it.",
    source: STALL,
  },
  {
    id: "x-left-turning-tendencies",
    title: "Everything Pulls Left",
    promise: "Four propeller effects, and why right rudder is the answer to all of them.",
    unit: "u6",
    conceptIds: ["c-p-factor", "c-slipstream-swirl", "c-torque-gyro"],
    lessonId: "l26-slips-skids-prop",
    diagram: { id: "slip-skid" },
    frames: [
      { caption: "Torque rolls the fuselage opposite the propeller.", hold: 3000, props: { state: "coordinated" } },
      { caption: "Slipstream swirl strikes the vertical stabiliser's left side.", hold: 3200, props: { state: "slip" } },
      { caption: "That pulls the tail right, yawing the nose LEFT.", hold: 3000, props: { state: "slip" } },
      { caption: "P-factor: the descending blade bites harder at high AOA.", hold: 3200, props: { state: "slip" } },
      { caption: "Gyroscopic precession acts 90° later in the rotation.", hold: 3200, props: { state: "coordinated" } },
    ],
    predict: {
      at: 1,
      question:
        "The propeller slipstream corkscrews back and strikes the left side of the vertical stabiliser. Which way does the nose go?",
      options: [
        "Right",
        "Left",
        "It pitches rather than yaws",
      ],
      answer: 1,
      because:
        "Pushing the tail to the right swings the nose to the LEFT. All four tendencies — torque, slipstream, P-factor and gyroscopic precession — end up wanting the nose left, which is why the answer is always right rudder.",
    },
    knowCold: "Right rudder. All four want the nose left.",
    source: PERF,
  },
  {
    id: "x-static-then-dynamic",
    title: "The Ball in the Bowl",
    promise: "Static stability is the first instant. Dynamic is everything after.",
    unit: "u6",
    conceptIds: ["c-static-stability", "c-dynamic-stability", "c-dynamic-modes"],
    lessonId: "l28-stability",
    diagram: { id: "stability-ball" },
    frames: [
      { caption: "Displace the ball. What it does FIRST is static stability.", hold: 3000, props: { state: "positive" } },
      { caption: "Returning toward equilibrium: positive static stability.", hold: 3000, props: { state: "positive" } },
      { caption: "Moving further away: negative. Staying put: neutral.", hold: 3200, props: { state: "negative" } },
      { caption: "Dynamic stability is what happens over TIME after that.", hold: 3000, props: { state: "neutral" } },
      { caption: "Static instability guarantees dynamic instability.", hold: 3400, props: { state: "negative" } },
    ],
    predict: {
      at: 2,
      question:
        "An aircraft has NEGATIVE static stability. What can you say about its dynamic stability?",
      options: [
        "It could still be dynamically stable",
        "It must be dynamically unstable too",
        "Dynamic stability is unrelated",
      ],
      answer: 1,
      because:
        "Static is the first instant, dynamic is the whole story over time — and you cannot converge on equilibrium if your very first move is away from it. Static instability guarantees dynamic instability. The reverse does not hold.",
    },
    knowCold: "Static is the first instant. Dynamic is the whole story.",
    source: PERF,
  },
];

/** Lessons that had no diagram at all until the gap-fill set was added. */
export const EXPLAINERS_C: Explainer[] = [
  {
    id: "x-mass-force-weight",
    title: "Material, Space, Force",
    promise: "Three quantities the exam swaps for each other, separated once.",
    unit: "u1",
    conceptIds: ["c-mass-volume", "c-force-weight"],
    lessonId: "l01b-mass-force-weight",
    diagram: { id: "mass-weight-density" },
    frames: [
      { caption: "Mass is the quantity of molecular material in an object.", hold: 3000, props: { highlight: "dense" } },
      { caption: "Volume is the space it occupies. Two boxes, same mass.", hold: 3000, props: { highlight: "none" } },
      { caption: "Spread that mass over twice the volume and density halves.", hold: 3200, props: { highlight: "less dense" } },
      { caption: "Weight is none of these — it is a FORCE.", hold: 3000, props: { highlight: "none" } },
      { caption: "Mass times the acceleration of gravity. Measured in pounds.", hold: 3200, props: { highlight: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "Two boxes hold the same mass, but one has twice the volume. What differs?",
      options: [
        "Their mass",
        "Their density",
        "Their weight",
      ],
      answer: 1,
      because:
        "Mass is the quantity of material and does not change; volume is the space it occupies. Spread the same mass over twice the volume and density halves. Weight is none of those — it is a force, mass times gravity, measured in pounds.",
    },
    knowCold: "Mass is material. Volume is space. Weight is force.",
    source: BASIC,
  },
  {
    id: "x-stability-trade",
    title: "The Beam Tips One Way",
    promise: "Stability and maneuverability are the same beam, not two dials.",
    unit: "u6",
    conceptIds: ["c-increasing-maneuverability"],
    lessonId: "l28b-maneuverability",
    diagram: { id: "stability-trade" },
    frames: [
      { caption: "Stability resists leaving equilibrium. Maneuverability leaves it easily.", hold: 3200, props: { bias: 0 } },
      { caption: "They are opposites, so the beam cannot favour both.", hold: 3000, props: { bias: 0 } },
      { caption: "A transport tips left: stable, easy to fly for hours.", hold: 3200, props: { bias: -1 } },
      { caption: "A fighter tips right: it departs equilibrium on demand.", hold: 3200, props: { bias: 1 } },
      { caption: "Two ways to tip it: weaken stability, or enlarge the control surfaces.", hold: 3400, props: { bias: 0.6 } },
    ],
    predict: {
      at: 2,
      question:
        "You want an aircraft that departs equilibrium more readily. What are your two options?",
      options: [
        "Add weight, or add power",
        "Weaken the stability, or enlarge the control surfaces",
        "Only enlarging the control surfaces works",
      ],
      answer: 1,
      because:
        "Stability and manoeuvrability are opposite ends of one beam, so you cannot have more of both. You either reduce what resists leaving equilibrium, or increase the authority that pushes it out — a transport tips one way, a fighter the other.",
    },
    knowCold: "Weaker stability, or bigger control surfaces.",
    source: PERF,
  },
];
