import type { Explainer, SourceReference } from "@/lib/types";

const L201: SourceReference = {
  document: "Principles of Gas Turbine/Reciprocating Operation",
  chapter: "Principles of Gas Turbine/Reciprocating Operation",
};
const L202: SourceReference = {
  document: "Gas Turbine/Reciprocating Engines",
  chapter: "Gas Turbine/Reciprocating Engines",
};
const L203: SourceReference = {
  document: "Compressor Stalls",
  chapter: "Compressor Stalls",
};
const NOTES = (chapter: string): SourceReference => ({
  document: "Engines Condensed Notes",
  chapter,
});

/**
 * Second explainer set. Eighteen Engines lessons had no walkthrough; these
 * cover the thirteen whose diagram can carry a frame sequence.
 */
export const EXPLAINERS_B: Explainer[] = [
  {
    id: "ex-duct-inversion",
    title: "The Same Duct, Twice",
    promise: "One shape, two speed regimes, opposite answers.",
    unit: "e1",
    conceptIds: ["e-subsonic-convergent", "e-subsonic-divergent", "e-nozzle", "e-diffuser"],
    lessonId: "el02-nozzles-and-diffusers",
    diagram: { id: "eng-duct" },
    frames: [
      { caption: "Subsonic, convergent: velocity up, pressure down. A nozzle.", hold: 3200, props: { shape: "convergent", regime: "subsonic" } },
      { caption: "Subsonic, divergent: velocity down, pressure up. A diffuser.", hold: 3200, props: { shape: "divergent", regime: "subsonic" } },
      { caption: "Now go supersonic. The same convergent duct…", hold: 2800, props: { shape: "convergent", regime: "supersonic" } },
      { caption: "…now slows the flow. It has become a diffuser.", hold: 3200, props: { shape: "convergent", regime: "supersonic" } },
      { caption: "And the divergent duct accelerates it. Shape alone tells you nothing.", hold: 3400, props: { shape: "divergent", regime: "supersonic" } },
    ],
    predict: {
      at: 2,
      question:
        "Same convergent duct — but the flow is now supersonic. What does it do to the air?",
      options: [
        "Accelerates it, as before",
        "Slows it down",
        "Shape decides, so nothing changes",
      ],
      answer: 1,
      because:
        "Past Mach 1 the air compresses faster than the duct narrows, so density wins the trade and the duct decelerates. Shape alone never tells you the answer — you need the shape and the speed regime together.",
    },
    knowCold: "Shape plus regime. Neither one decides alone.",
    source: L201,
  },
  {
    id: "ex-thrust-factors",
    title: "Four Levers on Thrust",
    promise: "Temperature, altitude, RPM and airspeed — and which one has a break point.",
    unit: "e2",
    conceptIds: ["e-rpm-thrust", "e-airspeed-thrust", "e-ram-effect"],
    lessonId: "el07-rpm-airspeed-ram",
    diagram: { id: "eng-thrust-factor" },
    frames: [
      { caption: "Temperature up, density down, thrust down.", hold: 3000, props: { factor: "temperature" } },
      { caption: "Altitude costs pressure faster than the cold gains it back.", hold: 3200, props: { factor: "altitude" } },
      { caption: "Above 36,000 ft temperature stops falling — thrust drops away.", hold: 3400, props: { factor: "altitude" } },
      { caption: "RPM is strongly non-linear: the last few percent give the most.", hold: 3200, props: { factor: "rpm" } },
      { caption: "Airspeed loses thrust to acceleration, then ram effect wins it back.", hold: 3400, props: { factor: "airspeed" } },
    ],
    predict: {
      at: 2,
      question:
        "Which ten-point throttle change buys more thrust — 30% to 40% RPM, or 90% to 100%?",
      options: [
        "90 to 100",
        "30 to 40",
        "The same either way",
      ],
      answer: 0,
      because:
        "Thrust climbs roughly as the square of RPM fraction, so the curve is flat down low and steep at the top. Most of the thrust in the whole range lives in the last few percent — which is why a small throttle change up high is a big change in thrust.",
    },
    knowCold: "36,000 ft is the altitude break point. RPM is non-linear.",
    source: L201,
  },
  {
    id: "ex-stall-indications",
    title: "What a Stall Looks Like",
    promise: "The gauges during a compressor stall, and what each one is telling you.",
    unit: "e2",
    conceptIds: ["e-epr", "e-torquemeter", "e-tachometer"],
    lessonId: "el08-thrust-instruments",
    diagram: { id: "eng-stall-indications" },
    frames: [
      { caption: "Normal operation: everything sits where you set it.", hold: 2800, props: { stalled: false } },
      { caption: "A stall breaks the airflow over the compressor blades.", hold: 3000, props: { stalled: true } },
      { caption: "RPM falls off as the compressor stops doing work.", hold: 3000, props: { stalled: true } },
      { caption: "Exhaust gas temperature rises — the burn has nowhere to go.", hold: 3200, props: { stalled: true } },
      { caption: "The tachometer monitors. It never measured thrust in the first place.", hold: 3200, props: { stalled: false } },
    ],
    predict: {
      at: 1,
      question:
        "Airflow over the compressor blades has just broken down. What do RPM and EGT do?",
      options: [
        "Both fall",
        "RPM falls and EGT rises",
        "Both rise",
      ],
      answer: 1,
      because:
        "They move opposite ways, and the pair is what identifies a stall. The compressor stops delivering air so RPM sags, while the same fuel now burns in less air and the heat shows up downstream as rising EGT.",
    },
    knowCold: "RPM down, EGT up.",
    source: L201,
  },
  {
    id: "ex-inlet-job",
    title: "The Inlet's One Job",
    promise: "Before anything else happens, the air has to be slowed down.",
    unit: "e3",
    conceptIds: ["e-inlet-purpose", "e-single-entrance", "e-divided-entrance"],
    lessonId: "el09-inlet-ducts",
    diagram: { id: "eng-cutaway" },
    frames: [
      { caption: "Air arrives fast. The compressor cannot use it that way.", hold: 3000, props: { highlight: "inlet" } },
      { caption: "The inlet acts as a diffuser: velocity down, pressure up.", hold: 3200, props: { highlight: "inlet" } },
      { caption: "Single entrance: maximum ram, minimum turbulence, but long ducting.", hold: 3200, props: { highlight: "inlet" } },
      { caption: "Divided entrance: shorter, less friction — but more turbulence.", hold: 3200, props: { highlight: "inlet" } },
      { caption: "Only then does the compressor get to work.", hold: 2800, props: { highlight: "compressor" } },
    ],
    predict: {
      at: 0,
      question:
        "Air arrives at the inlet far faster than the compressor can use it. So what shape must the inlet be?",
      options: [
        "Convergent — a nozzle",
        "Divergent — a diffuser",
        "Constant area, to hold the speed",
      ],
      answer: 1,
      because:
        "The compressor needs slow, high-pressure air, and a diverging duct is exactly the thing that trades velocity for pressure. Whatever else it does, the inlet is always a diffuser.",
    },
    knowCold: "The inlet is always a diffuser.",
    source: L202,
  },
  {
    id: "ex-supersonic-inlet",
    title: "Slowing Supersonic Air",
    promise: "Why a supersonic inlet needs two sections to do one job.",
    unit: "e3",
    conceptIds: ["e-inlet-geometry", "e-variable-geometry-inlet"],
    lessonId: "el10-inlet-geometry",
    diagram: { id: "eng-duct" },
    frames: [
      { caption: "Subsonic, the inlet is simply divergent.", hold: 3000, props: { shape: "divergent", regime: "subsonic" } },
      { caption: "Supersonic, a divergent duct would speed the air UP.", hold: 3200, props: { shape: "divergent", regime: "supersonic" } },
      { caption: "So the convergent section goes first, to slow it below sonic.", hold: 3400, props: { shape: "convergent", regime: "supersonic" } },
      { caption: "Then a divergent section finishes the job, subsonically.", hold: 3200, props: { shape: "divergent", regime: "subsonic" } },
      { caption: "A variable geometry inlet reshapes itself to stay a diffuser throughout.", hold: 3400, props: { shape: "divergent", regime: "subsonic" } },
    ],
    predict: {
      at: 1,
      question:
        "Supersonic air needs slowing, but a divergent duct would only speed it up. What has to come first?",
      options: [
        "A convergent section",
        "Another divergent section",
        "A constant-area section",
      ],
      answer: 0,
      because:
        "Above Mach 1 convergent decelerates, so the convergent section brings the flow back below sonic. Only then does a divergent section behave normally and finish the job. Convergent, then divergent.",
    },
    knowCold: "Supersonic inlet: convergent then divergent.",
    source: L202,
  },
  {
    id: "ex-centrifugal-path",
    title: "Around, Not Through",
    promise: "Follow air through an impeller, a diffuser and a manifold.",
    unit: "e3",
    conceptIds: ["e-centrifugal-compressor", "e-centrifugal-tradeoffs"],
    lessonId: "el11-centrifugal-compressor",
    diagram: { id: "eng-centrifugal" },
    frames: [
      { caption: "The impeller throws air outward, raising velocity.", hold: 3000, props: { labels: true } },
      { caption: "Its divergent blade shape raises pressure at the same time.", hold: 3200, props: { labels: true } },
      { caption: "The diffuser then converts that velocity into more pressure.", hold: 3200, props: { labels: true } },
      { caption: "The manifold routes it to the combustion chambers.", hold: 3000, props: { labels: true } },
      { caption: "High rise per stage — but the frontal area is the price.", hold: 3200, props: { labels: true } },
    ],
    predict: {
      at: 3,
      question:
        "A centrifugal compressor gets a large pressure rise out of a single stage. What does that cost?",
      options: [
        "Frontal area",
        "Reliability",
        "Fuel efficiency at idle",
      ],
      answer: 0,
      because:
        "Throwing air outward means the machine has to be wide, and frontal area is drag. That is the whole trade against an axial compressor, which is slim but needs many stages to reach the same pressure.",
    },
    knowCold: "Impeller, diffuser, manifold.",
    source: L202,
  },
  {
    id: "ex-station-by-station",
    title: "Station by Station",
    promise: "Pressure, temperature and velocity, one section at a time.",
    unit: "e3",
    conceptIds: ["e-guide-vanes", "e-compressor-diffuser", "e-station-changes"],
    lessonId: "el13-guide-vanes-diffuser",
    diagram: { id: "eng-station-changes" },
    frames: [
      { caption: "Inlet: pressure up, velocity down.", hold: 2800, props: { highlight: "inlet" } },
      { caption: "Compressor: pressure, temperature and velocity all up.", hold: 3000, props: { highlight: "compressor" } },
      { caption: "The diffuser is the point of HIGHEST pressure in the engine.", hold: 3400, props: { highlight: "compressor" } },
      { caption: "Burner: temperature and velocity up, pressure slightly down.", hold: 3200, props: { highlight: "burner" } },
      { caption: "Turbine and exhaust: velocity up, pressure down.", hold: 3000, props: { highlight: "turbine" } },
    ],
    predict: {
      at: 1,
      question:
        "Where in the engine is pressure at its highest?",
      options: [
        "The last compressor stage",
        "The diffuser, just after the compressor",
        "Inside the burner",
      ],
      answer: 1,
      because:
        "The compressor hands its air to the diffuser, which trades the remaining velocity for still more pressure. That makes the diffuser — not the final compressor stage — the highest-pressure point in the engine. Everything after it loses pressure.",
    },
    knowCold: "Highest pressure is the diffuser, not the last compressor stage.",
    source: L202,
  },
  {
    id: "ex-three-chambers",
    title: "Three Ways to Burn",
    promise: "Can, annular and can-annular, and what each trades away.",
    unit: "e4",
    conceptIds: ["e-can-chamber", "e-annular-chamber", "e-can-annular-chamber"],
    lessonId: "el15-combustion-chambers",
    diagram: { id: "eng-cutaway" },
    frames: [
      { caption: "The burner has to mix, cool and add energy all at once.", hold: 3000, props: { highlight: "burner" } },
      { caption: "Can: strong, durable, easy to maintain — used with centrifugal engines.", hold: 3200, props: { highlight: "burner" } },
      { caption: "But a clogged can leaves a COLD SPOT on the turbine.", hold: 3200, props: { highlight: "turbine" } },
      { caption: "Can-annular burns in cans, mixes in an annulus — no cold spots.", hold: 3400, props: { highlight: "burner" } },
      { caption: "It is better in almost every way. Cost is what it trades.", hold: 3000, props: { highlight: "burner" } },
    ],
    predict: {
      at: 1,
      question:
        "One can in a can-type burner clogs. What does the turbine downstream of it see?",
      options: [
        "A hot spot",
        "A cold spot",
        "Nothing — the annulus evens it out",
      ],
      answer: 1,
      because:
        "A clogged can stops burning, so the turbine behind it gets gas that was never heated. The uneven temperature across the turbine face is the weakness of the can design, and it is exactly what can-annular was built to remove.",
    },
    knowCold: "Cans risk cold spots. Can-annular solves them, expensively.",
    source: L202,
  },
  {
    id: "ex-out-the-back",
    title: "Out the Back",
    promise: "What is left after the turbine, and what an afterburner does with it.",
    unit: "e4",
    conceptIds: ["e-exhaust-section", "e-exhaust-nozzles", "e-afterburner"],
    lessonId: "el17-exhaust-and-afterburner",
    diagram: { id: "eng-cutaway" },
    frames: [
      { caption: "The turbine has already taken 75% of the energy back.", hold: 3000, props: { highlight: "turbine" } },
      { caption: "What remains reaches the exhaust section.", hold: 2800, props: { highlight: "exhaust" } },
      { caption: "A convergent nozzle accelerates it toward the speed of sound.", hold: 3200, props: { highlight: "exhaust" } },
      { caption: "Supersonic aircraft add a divergent section to go beyond it.", hold: 3200, props: { highlight: "exhaust" } },
      { caption: "The afterburner relights secondary air: 50% more thrust, briefly.", hold: 3400, props: { highlight: "exhaust" } },
    ],
    predict: {
      at: 2,
      question:
        "A convergent nozzle accelerates exhaust up to the speed of sound and no further. What do supersonic aircraft add?",
      options: [
        "A longer convergent section",
        "A divergent section after it",
        "A second nozzle in parallel",
      ],
      answer: 1,
      because:
        "Once the flow is sonic the rules invert, so a divergent section now accelerates rather than slows. Convergent to reach Mach 1, divergent to go beyond it.",
    },
    knowCold: "Convergent reaches sonic. Divergent goes beyond.",
    source: L202,
  },
  {
    id: "ex-otto-versus-brayton",
    title: "Sequential or Continuous",
    promise: "The same four events, arranged two completely different ways.",
    unit: "e6",
    conceptIds: ["e-otto", "e-recip-propulsion"],
    lessonId: "el24-reciprocating",
    diagram: { id: "eng-cycles" },
    frames: [
      { caption: "Intake, compression, combustion, exhaust. Both cycles, same four.", hold: 3000, props: { cycle: "both" } },
      { caption: "Otto runs them SEQUENTIALLY, in one cylinder.", hold: 3200, props: { cycle: "otto" } },
      { caption: "Suck, squeeze, bang, blow — one at a time.", hold: 3000, props: { cycle: "otto" } },
      { caption: "Brayton runs all four SIMULTANEOUSLY, in separate sections.", hold: 3400, props: { cycle: "brayton" } },
      { caption: "That is why a gas turbine produces continuous thrust.", hold: 3000, props: { cycle: "both" } },
    ],
    predict: {
      at: 2,
      question:
        "Otto runs its four events one at a time in one cylinder. How does a gas turbine run the same four?",
      options: [
        "The same way, only faster",
        "All four at once, in separate sections",
        "It skips compression entirely",
      ],
      answer: 1,
      because:
        "Both cycles do intake, compression, combustion and exhaust. The turbine gives each one its own permanent section and runs them all simultaneously — which is precisely why its thrust is continuous instead of arriving in pulses.",
    },
    knowCold: "Otto: sequential. Brayton: simultaneous and continuous.",
    source: L201,
  },
  {
    id: "ex-fuel-path",
    title: "Tank to Nozzle",
    promise: "Eight stops between the fuel tank and the flame.",
    unit: "e7",
    conceptIds: ["e-fuel-path", "e-boost-pump", "e-fcu", "e-fuel-manifolds"],
    lessonId: "el25-fuel-system",
    diagram: { id: "eng-fuel-system" },
    frames: [
      { caption: "The boost pump's critical job is preventing AERATION.", hold: 3200, props: { highlight: "boost" } },
      { caption: "Through the low pressure filter to the engine-driven pump.", hold: 3000, props: { highlight: "pump" } },
      { caption: "The Fuel Control Unit meters what the engine actually gets.", hold: 3200, props: { highlight: "fcu" } },
      { caption: "The P&D valve splits flow between two manifolds.", hold: 3000, props: { highlight: "pd" } },
      { caption: "Primary is small, so fuel atomizes well when flow is low.", hold: 3400, props: { highlight: "manifold" } },
    ],
    predict: {
      at: 3,
      question:
        "The P&D valve splits flow between a small primary manifold and a larger secondary. Why is primary the small one?",
      options: [
        "To save fuel",
        "So fuel still atomises properly when flow is low",
        "To keep pressure down at high power",
      ],
      answer: 1,
      because:
        "Atomisation depends on pressure across the nozzle. At low flow, small nozzles keep that pressure high enough to break the fuel into a fine spray — push it all through large nozzles and it would dribble instead of atomise.",
    },
    knowCold: "Tank, boost, filter, pump, FCU, P&D, manifolds, nozzles.",
    source: NOTES("Fuel System"),
  },
  {
    id: "ex-oil-three-ways",
    title: "Three Oil Subsystems",
    promise: "Supply, return and the one that uses bleed air.",
    unit: "e7",
    conceptIds: ["e-oil-subsystems", "e-oil-pump", "e-chip-detector"],
    lessonId: "el27-lubrication",
    diagram: { id: "eng-oil-system" },
    frames: [
      { caption: "Pressure supplies oil to the engine and accessory gear box.", hold: 3000, props: { subsystem: "pressure" } },
      { caption: "Scavenge removes it from bearings and drives, via the coolers.", hold: 3200, props: { subsystem: "scavenge" } },
      { caption: "Scavenge capacity is deliberately GREATER than pressure.", hold: 3400, props: { subsystem: "scavenge" } },
      { caption: "Otherwise oil pools in the sumps and backs up into the bearings.", hold: 3200, props: { subsystem: "scavenge" } },
      { caption: "Breather uses bleed air to pressurize the tank and engine.", hold: 3200, props: { subsystem: "breather" } },
    ],
    predict: {
      at: 1,
      question:
        "Which subsystem is deliberately built with MORE capacity — pressure, or scavenge?",
      options: [
        "Pressure",
        "Scavenge",
        "They are matched on purpose",
      ],
      answer: 1,
      because:
        "Scavenge has to clear oil faster than pressure delivers it, because oil arriving at a bearing is dense and oil leaving is frothed with air. Undersize scavenge and oil pools in the sumps and backs up into the bearings.",
    },
    knowCold: "Pressure, scavenge, breather. Scavenge is the bigger one.",
    source: NOTES("Oil System"),
  },
  {
    id: "ex-pascal-tradeoff",
    title: "Force for Distance",
    promise: "Hydraulics multiply force, and charge you in travel.",
    unit: "e7",
    conceptIds: ["e-pascal", "e-hydraulic-pumps", "e-accumulator"],
    lessonId: "el29-hydraulics",
    diagram: { id: "eng-hydraulic" },
    frames: [
      { caption: "Pressure applied to a confined liquid is constant throughout.", hold: 3000, props: { ratio: 1 } },
      { caption: "A larger output piston sees the same pressure over more area.", hold: 3200, props: { ratio: 2 } },
      { caption: "So the output force is multiplied.", hold: 2800, props: { ratio: 3 } },
      { caption: "But displacement is divided by exactly the same factor.", hold: 3400, props: { ratio: 4 } },
      { caption: "Six times the force, one sixth the travel. Nothing is free.", hold: 3200, props: { ratio: 6 } },
    ],
    predict: {
      at: 2,
      question:
        "The larger output piston gives you six times the force. What does it cost?",
      options: [
        "Nothing — that is what hydraulics are for",
        "One sixth of the travel",
        "Six times the system pressure",
      ],
      answer: 1,
      because:
        "Pressure is the same everywhere, so force scales with area — but the same volume of fluid spread over six times the area moves one sixth as far. Force multiplied means displacement divided by exactly the same factor.",
    },
    knowCold: "Force × n means displacement ÷ n.",
    source: NOTES("Hydraulics"),
  },
  {
    id: "ex-four-buses",
    title: "Four Buses",
    promise: "What gets power first when there is not enough to go around.",
    unit: "e7",
    conceptIds: ["e-buses", "e-power-sources", "e-ac-dc"],
    lessonId: "el30-electrical",
    diagram: { id: "eng-electrical" },
    frames: [
      { caption: "The essential bus supplies what flight safety requires.", hold: 3000, props: { highlight: "essential" } },
      { caption: "The primary bus supplies the equipment the mission needs.", hold: 3000, props: { highlight: "primary" } },
      { caption: "The monitor bus supplies convenience circuits — cabin lighting.", hold: 3200, props: { highlight: "monitor" } },
      { caption: "The starter bus supplies the starter circuit.", hold: 2800, props: { highlight: "starter" } },
      { caption: "Inverter goes DC to AC. Transformer rectifier goes AC to DC.", hold: 3400, props: { highlight: "none" } },
    ],
    predict: {
      at: 0,
      question:
        "You are shedding electrical load. Which bus is the last one you give up?",
      options: [
        "Monitor",
        "Primary",
        "Essential",
      ],
      answer: 2,
      because:
        "The names are the priority order. Essential carries what flight safety requires, primary carries what the mission needs, and monitor carries convenience — cabin lighting and the like. You shed in the opposite order to that.",
    },
    knowCold: "Essential = safety, primary = mission, monitor = convenience.",
    source: NOTES("Electrical"),
  },
];

/** Lessons that had no diagram at all until the gap-fill set was added. */
export const EXPLAINERS_C: Explainer[] = [
  {
    id: "ex-thrust-equation",
    title: "Gross and Net",
    promise: "Why the same engine produces less thrust once the aircraft is moving.",
    unit: "e2",
    conceptIds: ["e-thrust-equation", "e-gross-thrust", "e-net-thrust"],
    lessonId: "el05-thrust-equation",
    diagram: { id: "eng-thrust-equation" },
    frames: [
      { caption: "Thrust is mass times acceleration. Nothing more complicated.", hold: 3000, props: { airspeed: 0 } },
      { caption: "Static on the ramp, inlet velocity is zero.", hold: 3000, props: { airspeed: 0 } },
      { caption: "So all of the exhaust velocity counts. Gross equals net.", hold: 3200, props: { airspeed: 0 } },
      { caption: "Start moving, and the air is already arriving fast.", hold: 3200, props: { airspeed: 40 } },
      { caption: "The engine only gets credit for the DIFFERENCE it adds.", hold: 3400, props: { airspeed: 70 } },
    ],
    predict: {
      at: 2,
      question:
        "The aircraft starts moving, so air now arrives at the inlet already fast. What happens to NET thrust?",
      options: [
        "Unchanged — exhaust velocity is what matters",
        "It falls, because the engine only gets credit for the difference",
        "It rises, because more air is coming in",
      ],
      answer: 1,
      because:
        "Thrust is mass flow times the CHANGE in velocity, V2 minus V1. Static on the ramp V1 is zero, so gross equals net. Moving, the engine is only credited with the speed it adds on top of what the air already had.",
    },
    knowCold: "Thrust = mass flow × (V₂ − V₁).",
    source: L201,
  },
  {
    id: "ex-stall-causes",
    title: "Two Families of Cause",
    promise: "Everything that stalls a compressor does it the same way.",
    unit: "e5",
    conceptIds: ["e-airflow-distortion", "e-mechanical-malfunctions"],
    lessonId: "el20-stall-causes",
    diagram: { id: "eng-stall-causes" },
    frames: [
      { caption: "Relative wind inside the compressor is inlet airflow plus RPM.", hold: 3200, props: { cause: "none" } },
      { caption: "Disturb the inlet, and the blade's angle of attack changes.", hold: 3200, props: { cause: "distortion" } },
      { caption: "High aircraft AOA, yaw, turbulence, FOD, inlet icing.", hold: 3200, props: { cause: "distortion" } },
      { caption: "Or break something, and the RPM side changes instead.", hold: 3200, props: { cause: "mechanical" } },
      { caption: "Either route ends at the same place: the blade stalls.", hold: 3400, props: { cause: "none" } },
    ],
    predict: {
      at: 1,
      question:
        "Blade angle of attack is set by inlet airflow and RPM together. So how many ways are there to upset it?",
      options: [
        "One — only the inlet matters",
        "Two — disturb the airflow, or change the RPM side",
        "Three, one per compressor section",
      ],
      answer: 1,
      because:
        "The blade's relative wind is the sum of the two. Aircraft AOA, yaw, turbulence, FOD or inlet ice all attack the airflow side; a mechanical failure attacks the RPM side. Different causes, identical result — the blade stalls.",
    },
    knowCold: "Airflow distortion or mechanical. Both change blade AOA.",
    source: L203,
  },
  {
    id: "ex-stall-response",
    title: "Three Moments",
    promise: "Avoid, prevent and recover happen at three different times.",
    unit: "e5",
    conceptIds: ["e-stall-avoidance", "e-stall-prevention", "e-stall-recovery"],
    lessonId: "el21-avoid-prevent-recover",
    diagram: { id: "eng-stall-response" },
    frames: [
      { caption: "Avoidance happens before anything is wrong.", hold: 3000, props: { stage: "avoid" } },
      { caption: "Smooth throttle movements, and stay inside the envelope.", hold: 3000, props: { stage: "avoid" } },
      { caption: "Prevention acts once the conditions start developing.", hold: 3200, props: { stage: "prevent" } },
      { caption: "Recovery is what is left when it has already stalled.", hold: 3200, props: { stage: "recover" } },
      { caption: "Recovery is the last resort, not the plan.", hold: 3000, props: { stage: "none" } },
    ],
    predict: {
      at: 0,
      question:
        "Avoid, prevent, recover. Which of the three is the actual plan?",
      options: [
        "Recover — it is the one that fixes the stall",
        "Avoid — the other two are what is left when avoidance fails",
        "Prevent — it catches it in time",
      ],
      answer: 1,
      because:
        "They are in order of preference, not order of use. Avoidance costs nothing and works every time: smooth throttle, stay in the envelope. Recovery is what remains once the stall has already happened, which makes it the last resort rather than the plan.",
    },
    knowCold: "Avoid, prevent, recover — in that order of preference.",
    source: L203,
  },
  {
    id: "ex-thrust-ratings",
    title: "Rated by Temperature",
    promise: "Three thrust ratings, and the one the turbine limit does not govern.",
    unit: "e7",
    conceptIds: ["e-thrust-ratings", "e-fuel-types"],
    lessonId: "el26-fuels-and-ratings",
    diagram: { id: "eng-thrust-ratings" },
    frames: [
      { caption: "Thrust ratings are set by allowable turbine inlet temperature.", hold: 3200, props: { rating: "none" } },
      { caption: "Normal: maximum CONTINUOUS turbine temperature. No time limit.", hold: 3200, props: { rating: "normal" } },
      { caption: "Military: maximum turbine temperature, roughly 30 minutes.", hold: 3200, props: { rating: "military" } },
      { caption: "Combat uses the afterburner — which burns AFT of the turbine.", hold: 3400, props: { rating: "combat" } },
      { caption: "So combat alone is not based on turbine temperature limits.", hold: 3200, props: { rating: "combat" } },
    ],
    predict: {
      at: 2,
      question:
        "Normal and military ratings are both set by turbine inlet temperature. Why is combat the exception?",
      options: [
        "It is not — combat just has a higher limit",
        "The afterburner burns AFT of the turbine",
        "Combat has no temperature limit at all",
      ],
      answer: 1,
      because:
        "Combat thrust comes from the afterburner, which relights secondary air downstream of the turbine. The turbine never sees that heat, so a turbine-inlet-temperature limit is not what defines the rating.",
    },
    knowCold: "Normal unlimited, military ~30 min, combat is afterburner.",
    source: NOTES("Fuel System"),
  },
];
