import type { Question, SourceReference } from "@/lib/types";

/**
 * Flight controls, trim, balancing and control feel — EOs 2.117–2.123 — plus
 * asymmetric thrust, 2.186.
 *
 * These eight objectives were the only block of the Aerodynamics guide the app
 * did not cover. They are unusually testable: five of the eight are STATE or
 * DEFINE verbs, and most carry a T-6B-specific answer the exam can ask for
 * directly — shielded horns, the trim aid device, two downsprings, the CG on
 * the hinge line.
 *
 * The distractors are drawn from the confusions the material invites: mass
 * balance against aerodynamic balance, servo against anti-servo, downspring
 * against bobweight, and which way a tab moves for trimming as opposed to
 * for feel.
 */

const LIFT: SourceReference = {
  document: "Aerodynamics Trainee Guide",
  chapter: "Lift Production and Drag",
};
const PERF: SourceReference = {
  document: "Aerodynamics Trainee Guide",
  chapter: "Performance and Maneuvering",
};

export const CONTROL_QUESTIONS: Question[] = [
  /* ---------------- 2.117 primary flight controls ---------------- */
  {
    id: "q-ctl-001",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-primary-controls"],
    prompt: "Moving the control stick forward causes the elevator to move",
    options: [
      "up, decreasing camber and pitching the nose down",
      "down, increasing camber and pitching the nose down",
      "down, increasing camber and pitching the nose up",
      "up, increasing camber and pitching the nose up",
    ],
    answer: 1,
    explanation:
      "Stick forward moves the elevator DOWN. That increases the camber of the horizontal stabiliser, which produces more lift there, forces the tail UP, and therefore pitches the nose DOWN.",
    knowCold: "Stick forward → elevator down → more lift on the tail → tail up → nose down.",
    difficulty: 2,
    source: LIFT,
  },
  {
    id: "q-ctl-002",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-primary-controls"],
    prompt: "The control stick is pushed to the left. The right aileron",
    options: [
      "rises, creating negative camber on the right wing",
      "lowers, increasing camber and producing more lift on the right wing",
      "stays neutral while only the left aileron moves",
      "lowers, reducing lift on the right wing",
    ],
    answer: 1,
    explanation:
      "Ailerons move in unison in OPPOSITE directions. Stick left raises the LEFT aileron, giving that wing negative camber and downward lift, while the RIGHT aileron lowers, increasing camber and lift. The lift difference rolls the aircraft left.",
    whyWrong:
      "Only one aileron moving is the common picture and it is wrong — both move, always opposite.",
    knowCold: "Stick left: left aileron up, right aileron down.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-003",
    type: "spotTheTrap",
    unit: "u6",
    conceptIds: ["c-primary-controls"],
    prompt:
      '"Holding the ailerons deflected establishes a bank angle, and the aircraft then holds that bank."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. As long as the ailerons are deflected the aircraft keeps ROLLING. It stops rolling and holds the bank when the stick is CENTRED. Deflection commands a roll rate, not a bank angle.",
    knowCold: "Deflected = still rolling. Centred = bank holds.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-004",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-primary-controls"],
    prompt:
      "Some aircraft use spoilers on the upper wing surface for roll control. A spoiler rolls the aircraft by",
    options: [
      "increasing camber and adding lift on that wing",
      "disrupting airflow to decrease lift on that wing",
      "increasing the effective wingspan",
      "deflecting the relative wind downward",
    ],
    answer: 1,
    explanation:
      "A spoiler DISRUPTS the airflow over the top of the wing to DECREASE lift, dropping that wing. It is the opposite mechanism to an aileron, which adds lift on the rising wing, and spoilers may be used alongside ailerons or stabilators.",
    knowCold: "Ailerons add lift to roll. Spoilers destroy it.",
    difficulty: 3,
    source: LIFT,
  },

  /* ---------------- 2.118 trim ---------------- */
  {
    id: "q-ctl-005",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-trim-tabs"],
    prompt:
      "A trim tab exerts a much smaller force than the control surface it trims, yet it can hold that surface in place. This works because the tab has",
    options: [
      "a greater moment arm from the hinge line",
      "a higher coefficient of lift",
      "a shorter moment arm, concentrating the force",
      "a direct mechanical link to the control stick",
    ],
    answer: 0,
    explanation:
      "Moment is force × moment arm. The tab sits at the trailing edge, far behind the hinge line, so a small force there produces a moment that exactly opposes the larger force acting closer in. Once the moments sum to zero the surface stays put.",
    whyWrong:
      "A shorter arm would need a LARGER force, which is precisely what the tab is there to avoid.",
    knowCold: "Small force, long arm — same moment.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-006",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-trim-tabs"],
    prompt: "For TRIMMING, a trim tab must be moved",
    options: [
      "in the same direction as the control surface",
      "in the opposite direction to the control surface",
      "to the neutral position and locked",
      "in whichever direction reduces stick force at that airspeed",
    ],
    answer: 1,
    explanation:
      "Always opposite. The tab has to generate a moment that opposes the one trying to return the control surface to neutral, and that requires the tab to deflect the other way.",
    knowCold: "Trimming: tab opposite the surface. Always.",
    difficulty: 2,
    source: LIFT,
  },
  {
    id: "q-ctl-007",
    type: "spotTheTrap",
    unit: "u6",
    conceptIds: ["c-trim-tabs"],
    prompt:
      '"Once trimmed, the pilot can move the control surface to a new position, release it, and it will stay there."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Move a control away from its trimmed position and release it, and the trim tab drives the surface BACK to the trimmed position. To hold a new position the aircraft must be re-trimmed.",
    knowCold: "Trim holds ONE position. Change it, re-trim it.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-008",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-t6b-trim"],
    prompt:
      "Power is increased for a slow-speed manoeuvre in the T-6B. The rudder trim required is",
    options: ["left rudder trim", "right rudder trim", "none — rudder trim is fixed", "whichever centres the ball at cruise"],
    answer: 1,
    explanation:
      "Right rudder trim is required for power increases and slower airspeeds; left for power reductions and faster airspeeds. Rudder trim compensates for prop wash and torque, which vary with power — and power changes take precedence at low speeds.",
    knowCold: "Power up or slow down → RIGHT rudder trim.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-009",
    type: "spotTheTrap",
    unit: "u6",
    conceptIds: ["c-t6b-trim"],
    prompt: '"The T-6B has aileron trim tabs that the pilot adjusts in flight."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. There are no aileron trim tabs adjustable in flight on the T-6B. When the aileron trim switch is used, the AILERONS THEMSELVES move. Aileron and elevator trim are on the stick; rudder trim is on the PCL and is handled automatically by the trim aid device.",
    knowCold: "T-6B aileron trim moves the ailerons, not a tab.",
    difficulty: 3,
    source: LIFT,
  },

  /* ---------------- 2.119 / 2.120 balancing ---------------- */
  {
    id: "q-ctl-010",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-control-balancing"],
    prompt: "Aerodynamic balance and mass balance differ in that aerodynamic balance concerns forces acting at the",
    options: [
      "centre of gravity, and mass balance those at the aerodynamic centre",
      "aerodynamic centre, and mass balance those at the centre of gravity",
      "hinge line, and mass balance those at the trailing edge",
      "trim tab, and mass balance those at the control horn",
    ],
    answer: 1,
    explanation:
      "Aerodynamic balance concerns the forces acting at the AERODYNAMIC CENTRE; mass balance concerns those at the CENTRE OF GRAVITY. Both are balanced about the hinge line, which is why the two are easy to confuse and worth separating deliberately.",
    whyWrong: "Reversing the two is the single most likely error on this objective.",
    knowCold: "Aerodynamic balance → AC. Mass balance → CG.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-011",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-control-balancing"],
    prompt: "Balancing a control surface about its hinge line is done in order to",
    options: [
      "regulate control pressure, prevent flutter and provide control-free stability",
      "reduce the weight of the empennage",
      "increase the maximum deflection available",
      "eliminate the need for trim tabs",
    ],
    answer: 0,
    explanation:
      "Three purposes, and the exam can ask for any of them: regulate control pressure, prevent control flutter, and provide control-free stability. Control-free simply means the pilot is not touching the controls.",
    knowCold: "Balance for: pressure, flutter, control-free stability.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-012",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-control-balancing"],
    prompt:
      "A designer places the control surface CG AFT of the hinge line. Compared with placing it forward, this gives",
    options: [
      "greater control-free stability, favoured on transports",
      "faster control response and more manoeuvrability",
      "lower control forces at low speed only",
      "no change — the CG position affects only weight",
    ],
    answer: 1,
    explanation:
      "With the CG aft of the hinge line the surface tends to float into the relative wind and displace further, which speeds up the response and makes the aircraft more manoeuvrable. Forward of the hinge line is the stable choice, favoured on transports and bombers because the surface stays aligned when a gust hits it.",
    knowCold: "CG forward → stable. CG aft → responsive.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-013",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-t6b-balancing"],
    prompt: "The T-6B achieves aerodynamic balance using",
    options: [
      "shielded horns on the elevator and rudder",
      "weights in the aileron overhang",
      "two downsprings on the elevator",
      "an anti-servo tab on each surface",
    ],
    answer: 0,
    explanation:
      "Shielded horns on the elevator and rudder provide the T-6B's aerodynamic balance. Weights in the overhang are how its ailerons are MASS balanced, and downsprings are an artificial-feel device — three different jobs that are easy to blur together.",
    knowCold: "Shielded horns = aerodynamic balance, elevator and rudder.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-014",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-t6b-balancing"],
    prompt: "On the T-6B the control surface centre of gravity is located",
    options: [
      "forward of the hinge line, for maximum stability",
      "on the hinge line",
      "aft of the hinge line, for maximum response",
      "at the trailing edge",
    ],
    answer: 1,
    explanation:
      "On the hinge line — a deliberate compromise between control response and stability. It is achieved by placing weights inside the surface forward of the hinge line, in the shielded horn and leading edges. That technique is mass balancing.",
    whyWrong:
      "Forward is the transport answer and aft is the fighter answer. The T-6B is a trainer and sits between them.",
    knowCold: "T-6B: CG ON the hinge line.",
    difficulty: 3,
    source: LIFT,
  },

  /* ---------------- 2.121 control systems ---------------- */
  {
    id: "q-ctl-015",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-control-systems"],
    prompt:
      "An external force moves a control surface and the stick moves in the cockpit. This property is called",
    options: ["artificial feel", "reversibility", "aerodynamic balance", "boost assistance"],
    answer: 1,
    explanation:
      "Reversibility. It is what gives the pilot feedback — the force felt for a given deflection — and without feedback a pilot tends to over-control and can overstress the aircraft. Conventional systems are fully reversible, and the T-6B uses conventional controls.",
    knowCold: "Reversible = the surface can move the stick = feedback.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-016",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-control-systems"],
    prompt: "Which control system requires an artificial means of producing control feel?",
    options: [
      "Conventional",
      "Power-boosted",
      "Full power or fly-by-wire",
      "All three require it equally",
    ],
    answer: 2,
    explanation:
      "Full-power and fly-by-wire systems have no direct connection between stick and surface, so they are NOT reversible: the stick moves the surface, but the surface cannot move the stick. With no natural feedback, feel has to be manufactured.",
    whyWrong:
      "Power-boosted systems retain SOME reversibility and give the pilot some feel through the cockpit controls.",
    knowCold: "Not reversible → artificial feel required.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-017",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-control-systems"],
    prompt: "If the boost system fails in a power-boosted control system, the pilot",
    options: [
      "loses control of the aircraft entirely",
      "can still control it, but with greatly increased control forces",
      "must switch to fly-by-wire",
      "experiences no change, as the linkage is unpowered",
    ],
    answer: 1,
    explanation:
      "Power-boosted controls keep their mechanical linkages, so a boost failure leaves the aircraft controllable — just very much heavier. The booster assists the pilot the way power steering assists a driver; losing it does not sever the connection.",
    knowCold: "Boost fails → still flyable, much heavier.",
    difficulty: 3,
    source: LIFT,
  },

  /* ---------------- 2.122 artificial feel ---------------- */
  {
    id: "q-ctl-018",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-artificial-feel"],
    prompt:
      "A tab that moves in the SAME direction as the control surface, requiring more force to hold full deflection, is a",
    options: ["servo tab", "anti-servo tab", "neutral tab", "balance tab"],
    answer: 1,
    explanation:
      "Anti-servo. It works against the pilot deliberately, so the harder the rudder pedal is pressed the greater the resistance felt. The T-6B rudder uses one, and its tab moves in the same direction at a FASTER rate than the rudder.",
    knowCold: "Anti-servo: same direction, more force. T-6B rudder.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-019",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-artificial-feel"],
    prompt: "A servo trim tab makes the aircraft easier to manoeuvre because it",
    options: [
      "moves opposite the control surface and helps deflect it",
      "moves with the control surface and adds resistance",
      "holds a constant angle regardless of deflection",
      "locks the surface once the desired attitude is reached",
    ],
    answer: 0,
    explanation:
      "A servo tab moves OPPOSITE the surface and helps the pilot deflect it, lightening the control. Servo tabs are generally found on ailerons — although the T-6B itself uses neutral tabs there.",
    knowCold: "Servo: opposite, helps. Anti-servo: same, resists.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-020",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-artificial-feel"],
    prompt: "The T-6B elevator uses a neutral trim tab. A neutral tab",
    options: [
      "returns to centre whenever the stick is released",
      "maintains a constant angle to the control surface when it is deflected",
      "is fixed on the ground and cannot move in flight",
      "moves opposite the surface at half the rate",
    ],
    answer: 1,
    explanation:
      "A neutral tab holds a CONSTANT ANGLE to the surface as it deflects, so it neither helps nor resists. Because trim tabs alone do not give the desired feel on the elevator, the T-6B adds a bobweight and two downsprings alongside it.",
    knowCold: "Neutral tab: constant angle to the surface.",
    difficulty: 3,
    source: LIFT,
  },

  /* ---------------- 2.123 bobweights and downsprings ---------------- */
  {
    id: "q-ctl-021",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-bobweight-downspring"],
    prompt:
      "The T-6B elevator is being pulled aft during a hard turn at high g. The device increasing the force the pilot feels is the",
    options: ["downsprings", "bobweight", "neutral trim tab", "shielded horn"],
    answer: 1,
    explanation:
      "The bobweight increases the force required to pull the stick aft during MANOEUVRING flight. The downsprings do the same job but at LOW AIRSPEEDS — the two answer to different conditions, which is exactly what makes them a pair worth separating.",
    whyWrong: "Downsprings respond to speed, not to g.",
    knowCold: "Downsprings → low airspeed. Bobweight → manoeuvring.",
    difficulty: 3,
    source: LIFT,
  },
  {
    id: "q-ctl-022",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-bobweight-downspring"],
    prompt: "The T-6B elevator provides artificial feel using",
    options: [
      "a servo tab alone",
      "a neutral trim tab, two downsprings and a bobweight",
      "an anti-servo tab and one downspring",
      "shielded horns and mass balance weights",
    ],
    answer: 1,
    explanation:
      "All three together: a neutral trim tab, TWO downsprings and a bobweight. Trim tabs alone do not give the desired feel on the elevator, which is why the extra devices are fitted. Shielded horns are aerodynamic balance, not feel.",
    knowCold: "T-6B elevator feel: neutral tab + 2 downsprings + bobweight.",
    difficulty: 3,
    source: LIFT,
  },

  /* ---------------- 2.186 asymmetric thrust ---------------- */
  {
    id: "q-ctl-023",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-asymmetric-thrust"],
    prompt:
      "A twin-engine aircraft loses its left engine. The resulting yawing moment is",
    options: [
      "toward the right, away from the dead engine",
      "toward the left, toward the dead engine",
      "zero, provided the aircraft is trimmed",
      "toward whichever wing is heavier",
    ],
    answer: 1,
    explanation:
      "The operating engine produces a yawing moment TOWARD the dead engine — here, to the left. The farther the engines sit from the longitudinal axis, the larger that moment, which is why it is most pronounced on aircraft like the S-3, E-2 or KC-10.",
    whyWrong:
      "Yawing away from the dead engine is the intuitive guess and it is backwards: the thrust that remains is on the other side, pushing that side forward.",
    knowCold: "Yaw is TOWARD the dead engine.",
    difficulty: 3,
    source: PERF,
  },
  {
    id: "q-ctl-024",
    type: "mcq",
    unit: "u6",
    conceptIds: ["c-asymmetric-thrust"],
    prompt:
      "Following an engine failure the yaw is severe enough to induce proverse roll. The correct control response is",
    options: [
      "opposite rudder for the yaw, opposite aileron for the roll",
      "opposite aileron for the yaw, opposite rudder for the roll",
      "rudder alone — aileron would aggravate the yaw",
      "reduce power on the operating engine until the yaw stops",
    ],
    answer: 0,
    explanation:
      "Full opposite RUDDER compensates for the yawing moment, and opposite AILERON corrects the proverse roll it induces. Each control answers the axis it owns. Every multi-engine aircraft also has a minimum directional control speed that must be flown to keep the vertical stabiliser effective.",
    knowCold: "Rudder for the yaw, aileron for the roll. Respect Vmc.",
    difficulty: 3,
    source: PERF,
  },
];
