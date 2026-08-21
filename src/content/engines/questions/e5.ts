import type { Question, SourceReference } from "@/lib/types";

const L203 = (eo: string[]): SourceReference => ({
  document: "Compressor Stalls",
  chapter: "Compressor Stalls",
  eo,
});

/**
 * Unit e5 — Compressor Stalls.
 *
 * The block's two structural traps drive the distractors: avoidance (what the
 * pilot does) versus prevention (what the engine is designed with), and the
 * ordering of the recovery.
 */
export const E5_QUESTIONS: Question[] = [
  {
    id: "eq-e5-001",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-compressor-relative-wind"],
    prompt: "Relative wind within the compressor is formed by combining",
    options: [
      "aircraft airspeed and altitude",
      "the inlet airflow with the compressor RPM",
      "exhaust velocity with inlet pressure",
      "fuel flow with airflow",
    ],
    answer: 1,
    explanation:
      "Compressor relative wind is the vector combination of inlet airflow and compressor RPM. Change either one and the relative wind changes.",
    knowCold: "Compressor RW = inlet airflow + compressor RPM.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.1"]),
  },
  {
    id: "eq-e5-002",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-compressor-aoa"],
    prompt:
      "Compressor blade angle of attack is the angle formed between the",
    options: [
      "rotor blade chordline and the relative wind of the compressor",
      "rotor blade chordline and the engine centreline",
      "inlet airflow and the aircraft longitudinal axis",
      "stator vane and the rotor blade",
    ],
    answer: 0,
    explanation:
      "AOA is between the rotor blade chordline and the compressor relative wind. Too low is inefficient; too high stalls.",
    knowCold: "Blade AOA = chordline vs compressor relative wind.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.1"]),
  },
  {
    id: "eq-e5-003",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-compressor-aoa"],
    prompt:
      "Anything that ___ inlet airflow or ___ compressor RPM will increase blade AOA and the possibility of a compressor stall.",
    options: [
      "increases, decreases",
      "decreases, increases",
      "increases, increases",
      "decreases, decreases",
    ],
    answer: 1,
    explanation:
      "Decreasing inlet airflow or increasing compressor RPM swings the relative wind and raises blade AOA, increasing stall likelihood.",
    whyWrong:
      "The pair runs in opposite directions, which is exactly why the exam asks it this way.",
    knowCold: "Inlet airflow ↓ or RPM ↑ → AOA ↑ → stall risk ↑.",
    difficulty: 3,
    officialStyle: true,
    source: L203(["3.1", "3.2"]),
  },
  {
    id: "esl-e5-004",
    type: "sliderPredict",
    unit: "e5",
    conceptIds: ["e-compressor-aoa"],
    prompt: "Hold compressor RPM constant and reduce the inlet airflow. What happens to blade AOA?",
    widget: "BladeAoaWidget",
    props: { rpm: 1 },
    options: ["AOA increases", "AOA decreases", "AOA is unchanged"],
    answer: 0,
    explanation:
      "With less axial airflow but the same blade speed, the relative wind swings further from the chordline — AOA rises and the blade moves toward a stall.",
    knowCold: "Less inlet airflow at the same RPM = higher AOA.",
    difficulty: 2,
    source: L203(["3.1"]),
  },
  {
    id: "eq-e5-005",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-definition"],
    prompt: "A compressor stall occurs when",
    options: [
      "the engine RPM exceeds its maximum limit",
      "airflow over an airfoil breaks away, causing loss of lift due to excessive angle of attack",
      "fuel flow exceeds the FCU schedule",
      "the exhaust nozzle fails to close",
    ],
    answer: 1,
    explanation:
      "Rotors and stators are airfoils. Like any airfoil they stall when flow breaks away from excessive AOA, and a compressor stall could lead to engine flameout.",
    knowCold: "Compressor blades are airfoils — they stall like wings do.",
    difficulty: 1,
    officialStyle: true,
    source: L203(["3.2"]),
  },
  {
    id: "eq-e5-006",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-indications"],
    prompt: "During a severe compressor stall, engine RPM ___ and ITT ___.",
    options: ["increases, decreases", "decreases, increases", "increases, increases", "decreases, decreases"],
    answer: 1,
    explanation:
      "Severe stall indications are a noticeable change in engine sound with loud bangs, engine RPM decrease and ITT increase.",
    whyWrong:
      "This directional pair is the single most reliable indication question in the block.",
    knowCold: "Stall: RPM down, ITT up.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.2"]),
  },
  {
    id: "eq-e5-007",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-indications"],
    prompt: "Mild compressor stall indications include all of the following EXCEPT",
    options: [
      "mild pulsations",
      "engine vibration with noise",
      "fluctuating torquemeter and ITT gauges",
      "immediate engine flameout",
    ],
    answer: 3,
    explanation:
      "Mild indications are pulsations, vibration with noise, and fluctuating torquemeter, ITT, compressor and fuel flow gauges. Flameout is a possible consequence of a stall, not a mild indication of one.",
    knowCold: "Mild: pulsations, vibration, fluctuating gauges.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.2"]),
  },
  {
    id: "eq-e5-008",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-airflow-distortion"],
    prompt: "The most common cause of a compressor stall is",
    options: [
      "foreign object damage",
      "airflow distortion",
      "fuel control unit failure",
      "variable exhaust nozzle failure",
    ],
    answer: 1,
    explanation:
      "Airflow distortion is the most common cause. Mechanical malfunctions are the other category, but they are less common.",
    knowCold: "Airflow distortion is the most common cause.",
    difficulty: 1,
    officialStyle: true,
    source: L203(["3.3"]),
  },
  {
    id: "eq-e5-009",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-airflow-distortion"],
    prompt: "Which is an example of airflow distortion leading to a compressor stall?",
    options: [
      "Variable inlet guide vane failure",
      "Rapid throttle movement",
      "Foreign object damage",
      "Fuel control unit failure",
    ],
    answer: 1,
    explanation:
      "Airflow distortions are abrupt aircraft attitude change, air turbulence, deficiency of air velocity or volume from atmospheric conditions, and rapid throttle movement. The other three options are mechanical malfunctions.",
    whyWrong:
      "The block splits causes into two families. Anything involving a broken component is mechanical.",
    knowCold: "Distortion = attitude, turbulence, atmospherics, rapid throttle.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.3"]),
  },
  {
    id: "eq-e5-010",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-mechanical-malfunctions"],
    prompt:
      "Which mechanical malfunction causes extra fuel to flow to the burner section, creating excessive back pressure?",
    options: [
      "Variable inlet guide vane failure",
      "Fuel control unit failure",
      "Foreign object damage",
      "Variable exhaust nozzle failure",
    ],
    answer: 1,
    explanation:
      "Failure of FCU metering can send extra fuel to the burner section, causing excessive back pressure and a stall.",
    knowCold: "FCU failure → too much fuel → back pressure → stall.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.3"]),
  },
  {
    id: "eq-e5-011",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-mechanical-malfunctions"],
    prompt: "Variable inlet guide vane failure causes a compressor stall by",
    options: [
      "creating insufficient airflow at lower engine RPMs",
      "allowing foreign objects into the compressor",
      "increasing fuel flow beyond the schedule",
      "preventing the exhaust nozzle from opening",
    ],
    answer: 0,
    explanation:
      "Engines with variable inlet guide vanes can malfunction, causing insufficient airflow at lower engine RPMs — and less inlet airflow raises blade AOA.",
    knowCold: "IGV failure → insufficient airflow at low RPM.",
    difficulty: 2,
    source: L203(["3.3"]),
  },
  {
    id: "eq-e5-012",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-avoidance", "e-stall-prevention"],
    prompt:
      "Which of the following is an engine DESIGN FEATURE that reduces the possibility of a compressor stall, rather than a pilot action?",
    options: [
      "Avoiding abrupt PCL movement",
      "Bleed valves",
      "Maintaining prescribed minimums",
      "Avoiding flight through severe turbulence",
    ],
    answer: 1,
    explanation:
      "The four design features are variable inlet guide vanes, a dual/twin/split-spool axial flow compressor, bleed valves and a variable exhaust nozzle. The other options are pilot avoidance actions.",
    whyWrong:
      "The lecture separates AVOIDANCE (pilot) from PREVENTION (engine design). Mixing them is the intended trap.",
    knowCold: "Avoidance = pilot. Prevention = hardware.",
    difficulty: 3,
    officialStyle: true,
    source: L203(["3.4", "3.5"]),
  },
  {
    id: "eq-e5-013",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-prevention"],
    prompt: "The four engine system components used to reduce compressor stalls are",
    options: [
      "variable inlet guide vanes, dual-spool axial compressor, bleed valves, variable exhaust nozzle",
      "inlet guide vanes, diffuser, burner basket, screech liner",
      "boost pump, FCU, P&D valve, fuel nozzles",
      "impeller, diffuser, manifold, stator",
    ],
    answer: 0,
    explanation:
      "Variable inlet guide vanes, a dual/twin/split-spool axial flow compressor, bleed valves and a variable exhaust nozzle.",
    knowCold: "IGVs, dual spool, bleed valves, variable exhaust nozzle.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.5"]),
  },
  {
    id: "eq-e5-014",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-recovery"],
    prompt: "Once a compressor stall occurs, the FIRST reaction should be to",
    options: [
      "immediately retard the PCL to idle",
      "reduce the aircraft attitude, lowering the inlet air AOA",
      "shut down the engine",
      "open the bleed valves",
    ],
    answer: 1,
    explanation:
      "The first action is lowering the nose to reduce the inlet air AOA. Only then is the PCL slowly retarded below the stall threshold.",
    whyWrong:
      "Going straight to the throttle — and going there quickly — is exactly what the recovery warns against.",
    knowCold: "Lower the nose first.",
    difficulty: 3,
    officialStyle: true,
    source: L203(["3.4"]),
  },
  {
    id: "ecc-e5-015",
    type: "connectChain",
    unit: "e5",
    conceptIds: ["e-stall-recovery"],
    prompt: "Put the compressor stall recovery in order.",
    trigger: "A compressor stall occurs",
    steps: [
      "Reduce aircraft attitude to lower the inlet air AOA",
      "Slowly retard the PCL below the stall threshold",
      "Bleed valves increase airflow",
      "Once indications are normal, slowly advance the PCL",
    ],
    explanation:
      "Attitude first, then a slow PCL reduction to let the engine catch up with the inlet airflow. Every throttle movement in the sequence is deliberate and slow.",
    knowCold: "Nose down → PCL back slowly → bleed valves → PCL forward slowly.",
    difficulty: 3,
    source: L203(["3.4"]),
  },
  {
    id: "eq-e5-016",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-recovery"],
    prompt: "During compressor stall recovery, PCL movements should be",
    options: [
      "rapid, to clear the stall quickly",
      "slow, avoiding unnecessary movement",
      "made only after the engine is shut down",
      "alternated rapidly to clear the compressor",
    ],
    answer: 1,
    explanation:
      "The PCL is retarded slowly to let the engine catch up with the inlet airflow, and advanced slowly once indications return to normal. The warning is explicit: avoid unnecessary PCL movement.",
    knowCold: "Everything about the throttle in a stall recovery is slow.",
    difficulty: 2,
    source: L203(["3.4"]),
  },
  {
    id: "eq-e5-017",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-avoidance"],
    prompt: "Pilots can reduce the possibility of compressor stalls by all of the following EXCEPT",
    options: [
      "avoiding erratic or abrupt PCL movement",
      "avoiding abrupt changes in aircraft attitude",
      "installing bleed valves",
      "avoiding flight through severe weather or air turbulence",
    ],
    answer: 2,
    explanation:
      "Bleed valves are an engine design feature, not something a pilot does in flight. The rest are avoidance actions, along with maintaining prescribed minimums.",
    knowCold: "A pilot flies smoothly; a designer fits bleed valves.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.4", "3.5"]),
  },
  {
    id: "etrap-e5-018",
    type: "spotTheTrap",
    unit: "e5",
    conceptIds: ["e-compressor-aoa"],
    prompt: '"Increasing compressor RPM always reduces the chance of a compressor stall."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Increasing compressor RPM increases the relative wind and therefore raises blade AOA with the same inlet airflow — which increases stall likelihood.",
    knowCold: "More RPM at the same airflow = more blade AOA = more stall risk.",
    difficulty: 3,
    source: L203(["3.1"]),
  },
  {
    id: "eq-e5-019",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-stall-indications"],
    prompt:
      "With the PCL held in a constant position, indications of a compressor stall include",
    options: [
      "RPM decay, a rise in ITT, and possible loud noises",
      "RPM increase and falling ITT",
      "steady RPM with rising fuel flow only",
      "no cockpit indications at all",
    ],
    answer: 0,
    explanation:
      "At a constant PCL position a stall shows as RPM decay, a rise in ITT and possible loud noises.",
    knowCold: "Constant PCL, falling RPM, rising ITT — suspect a stall.",
    difficulty: 2,
    source: L203(["3.2"]),
  },
  {
    id: "eq-e5-020",
    type: "mcq",
    unit: "e5",
    conceptIds: ["e-mechanical-malfunctions", "e-variable-exhaust-nozzle"],
    prompt:
      "Failure of the variable exhaust nozzle to open during afterburner operation causes a compressor stall because it",
    options: [
      "starves the burner of secondary air",
      "creates massive back pressure",
      "reduces compressor RPM below idle",
      "allows foreign objects into the turbine",
    ],
    answer: 1,
    explanation:
      "If the nozzle cannot open, the expanding gases have nowhere to go and back pressure builds forward through the engine, stalling the compressor.",
    knowCold: "Nozzle won't open → back pressure → stall.",
    difficulty: 2,
    officialStyle: true,
    source: L203(["3.3"]),
  },
];
