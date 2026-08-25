import type { Concept } from "@/lib/types";

/**
 * The concept graph. Every question is tagged to one or more of these, and
 * mastery is tracked here — not at lesson level — so the review engine can say
 * "you are weak on CLmax AOA", not "you are weak on lesson 23".
 *
 * Definitions are taken verbatim-in-meaning from the trainee guide. Where the
 * guide and the condensed notes differ in wording, the guide wins.
 */

const TG = "Aerodynamics Trainee Guide" as const;

export const CONCEPTS: Concept[] = [
  /* ================================================================ */
  /* UNIT 1 — LEARN THE LANGUAGE                                       */
  /* ================================================================ */
  {
    id: "c-scalar-vector",
    unit: "u1",
    name: "Scalar vs vector",
    definition:
      "A scalar represents magnitude only. A vector represents magnitude and direction, and can be resolved into components.",
    relationships: [
      "Speed is a scalar; velocity is a vector",
      "Any vector can be broken into perpendicular components",
    ],
    commonTraps: [
      "Speed and velocity are not interchangeable — velocity carries direction.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.1", "2.2"] },
  },
  {
    id: "c-density",
    unit: "u1",
    name: "Air density (ρ)",
    definition:
      "Density is mass per unit volume. Air density is the total mass of air particles per unit of volume.",
    formula: "\\rho = \\frac{m}{V}",
    relationships: [
      "Altitude ↑ → density ↓",
      "Temperature ↑ → density ↓",
      "Humidity ↑ → density ↓",
    ],
    commonTraps: [
      "Density is mass per volume, not volume per mass, and not 'the amount of molecular material' (that is mass).",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.5", "2.20"] },
  },
  {
    id: "c-moment",
    unit: "u1",
    name: "Moment and moment arm",
    definition:
      "A moment is a rotational force created when a force is applied at a distance from an axis or fulcrum. It equals force times the perpendicular distance from the point of rotation — that distance is the moment arm.",
    formula: "M = F \\times d",
    commonTraps: [
      "Moment is force × perpendicular distance from a fulcrum — not force × distance of displacement (that is work), and not mass × acceleration (that is force).",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.8"] },
  },
  {
    id: "c-work-power-energy",
    unit: "u1",
    name: "Work, power and energy",
    definition:
      "Work is force times the distance of displacement. Power is the rate of doing work. Energy is a body's capacity to do work, and is either potential (position) or kinetic (motion).",
    formula: "W = F \\times s \\quad\\quad P = \\frac{W}{t} \\quad\\quad KE = \\tfrac{1}{2}mV^2",
    relationships: ["Total energy = potential + kinetic; energy is conserved"],
    commonTraps: [
      "Power is work per unit time. Work is force × displacement. Do not swap them.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.9", "2.10", "2.11", "2.12", "2.13"] },
  },
  {
    id: "c-newton-laws",
    unit: "u1",
    name: "Newton's three laws",
    definition:
      "Equilibrium: a body remains at rest or in uniform motion unless acted on by an unbalanced force. Acceleration: F = ma, in the direction of the force. Interaction: for every action there is an equal and opposite reaction.",
    formula: "F = ma",
    source: { document: TG, chapter: "Basic Theory", eo: ["2.14", "2.17", "2.18"] },
  },
  {
    id: "c-equilibrium",
    unit: "u1",
    name: "Equilibrium flight",
    definition:
      "Equilibrium flight exists when the sum of all forces AND the sum of all moments around the centre of gravity equal zero. There is no linear or angular acceleration.",
    relationships: [
      "Equilibrium flight is always trimmed flight",
      "A steady climb at constant airspeed is still equilibrium flight",
    ],
    commonTraps: [
      "Equilibrium does not mean straight and level — a constant-speed climb is equilibrium too.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.15"] },
  },
  {
    id: "c-trimmed",
    unit: "u1",
    name: "Trimmed flight",
    definition:
      "Trimmed flight exists when the sum of all moments around the centre of gravity equals zero. The sum of the forces may not be zero.",
    relationships: [
      "Equilibrium ⇒ trimmed",
      "Trimmed ⇏ equilibrium (a constant-bank turn is trimmed, not equilibrium)",
    ],
    commonTraps: [
      "Forces AND moments = equilibrium. Moments only = trimmed. The exam swaps these two.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.16"] },
  },
  {
    id: "c-static-pressure",
    unit: "u1",
    name: "Static pressure",
    definition:
      "Static pressure is the pressure air particles exert on adjacent bodies. Ambient static pressure equals the weight of a column of air over a given area, and always acts perpendicular to a surface.",
    relationships: ["Altitude ↑ → static pressure ↓ (≈1.0 in-Hg per 1,000 ft at low altitude)"],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.19"] },
  },
  {
    id: "c-temperature-lapse",
    unit: "u1",
    name: "Temperature and lapse rate",
    definition:
      "Temperature measures the average random kinetic energy of air particles. Air temperature decreases linearly with altitude at the average lapse rate of 2 °C (3.57 °F) per 1,000 ft up to about 36,000 ft.",
    relationships: [
      "Altitude ↑ → temperature ↓ at 2 °C / 1,000 ft",
      "36,000–66,000 ft: isothermal layer at −56.5 °C",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.21", "2.22"] },
  },
  {
    id: "c-humidity-density",
    unit: "u1",
    name: "Humidity and air density",
    definition:
      "Humidity is the amount of water vapour in the air. Water molecules displace an equal number of air molecules but have less mass, so density falls.",
    relationships: [
      "Humidity ↑ → density ↓ → performance ↓ → takeoff speed and distance ↑",
    ],
    commonTraps: [
      "Humid air is LESS dense, not more. Students reverse this constantly.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.23", "2.24"] },
  },
  {
    id: "c-viscosity",
    unit: "u1",
    name: "Viscosity",
    definition:
      "Viscosity is the air's resistance to flow and shearing, shown by its tendency to stick to a surface.",
    relationships: ["Air temperature ↑ → air viscosity ↑ (the opposite of liquids)"],
    commonTraps: [
      "For liquids, hotter means thinner. For AIR, hotter means more viscous.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.25", "2.26"] },
  },
  {
    id: "c-speed-of-sound",
    unit: "u1",
    name: "Local speed of sound",
    definition:
      "The rate at which sound waves travel through a particular air mass. In air it depends only on temperature.",
    relationships: ["Temperature ↑ → local speed of sound ↑"],
    commonTraps: [
      "Speed of sound depends on temperature ALONE — not pressure, not density, not altitude directly.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.27", "2.28"] },
  },
  {
    id: "c-standard-atmosphere",
    unit: "u1",
    name: "Standard atmosphere",
    definition:
      "The engineering baseline for sea-level conditions: 29.92 in-Hg, 59 °F (15 °C), density 0.0024 slugs/ft³, local speed of sound 661.7 knots, lapse rate 3.57 °F (2 °C) per 1,000 ft.",
    source: { document: TG, chapter: "Basic Theory", eo: ["2.29"] },
  },
  {
    id: "c-gas-law",
    unit: "u1",
    name: "General Gas Law",
    definition:
      "The General Gas Law relates static pressure, density and temperature: P = ρRT, where R is constant for a given gas.",
    formula: "P = \\rho R T",
    relationships: [
      "Pressure constant → temperature and density are INVERSELY related",
      "Density constant → temperature ↑ gives pressure ↑",
    ],
    commonTraps: [
      "With pressure held constant, T and ρ are inverse — not direct.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.30"] },
  },
  {
    id: "c-steady-airflow",
    unit: "u1",
    name: "Steady airflow, streamline, streamtube",
    definition:
      "Steady airflow exists if at every point static pressure, density, temperature and velocity remain constant over time. A streamline is the path particles follow in steady airflow; a streamtube is a bundle of adjacent streamlines behaving as a closed system.",
    commonTraps: [
      "The four constants are pressure, density, temperature, velocity — viscosity is not on the list.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.32", "2.33", "2.34"] },
  },
  {
    id: "c-continuity",
    unit: "u1",
    name: "Continuity equation",
    definition:
      "In a subsonic streamtube, cross-sectional area times velocity is constant. Area and velocity are inversely related.",
    formula: "A_1V_1 = A_2V_2",
    relationships: ["Area ↓ → velocity ↑", "Area ↑ → velocity ↓"],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.35"] },
  },
  {
    id: "c-bernoulli",
    unit: "u1",
    name: "Bernoulli's equation",
    definition:
      "Total pressure equals static pressure plus dynamic pressure. In a closed system total pressure is constant, so an increase in one means a decrease in the other.",
    formula: "H = P_S + \\tfrac{1}{2}\\rho V^2",
    relationships: [
      "Velocity ↑ → dynamic pressure ↑ → static pressure ↓",
      "Continuity + Bernoulli together produce the pressure difference that makes lift",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.31"] },
  },
  {
    id: "c-dynamic-pressure",
    unit: "u1",
    name: "Dynamic pressure (q)",
    definition:
      "Dynamic pressure is the impact pressure of a moving mass of air: one half density times velocity squared.",
    formula: "q = \\tfrac{1}{2}\\rho V^2",
    relationships: ["Velocity doubles → q quadruples", "Density ↓ → q ↓ for the same TAS"],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.31"] },
  },
  {
    id: "c-altitude-types",
    unit: "u1",
    name: "Types of altitude",
    definition:
      "True altitude is height above mean sea level. Pressure altitude is height above the standard datum plane (where pressure is 29.92 in-Hg). Absolute altitude is height above the terrain (AGL).",
    source: { document: TG, chapter: "Basic Theory", eo: ["2.36", "2.37", "2.38", "2.39"] },
  },
  {
    id: "c-density-altitude",
    unit: "u1",
    name: "Density altitude",
    definition:
      "Density altitude is the altitude in the standard atmosphere at which air density equals local air density — pressure altitude corrected for temperature and humidity. It is a predictor of performance, not a height reference.",
    relationships: [
      "Temperature ↑ or humidity ↑ → density altitude ↑ → performance ↓",
      "High DA → less engine power, less thrust, higher TAS needed for takeoff → longer takeoff distance",
    ],
    commonTraps: [
      "A HIGH density altitude means LOW air density.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.40"] },
  },
  {
    id: "c-pitot-static",
    unit: "u1",
    name: "Pitot-static system",
    definition:
      "The pitot tube senses total pressure (H), the static port senses static pressure (Pₛ), and a differential pressure gauge outputs dynamic pressure. Velocity is then solved from Bernoulli's equation and displayed as indicated airspeed.",
    formula: "V = \\sqrt{\\frac{2(H - P_S)}{\\rho}}",
    relationships: ["Indicated airspeed is a display of DYNAMIC pressure"],
    commonTraps: [
      "The cockpit shows INDICATED airspeed, computed from DYNAMIC pressure. Not true airspeed, not static pressure.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.41"] },
  },
  {
    id: "c-icetg",
    unit: "u1",
    name: "ICE-TG airspeed ladder",
    definition:
      "Indicated → Calibrated (IAS corrected for instrument/position error) → Equivalent (CAS corrected for compressibility) → True (EAS corrected for density) → Ground (TAS corrected for wind).",
    formula: "TAS = EAS\\sqrt{\\frac{\\rho_0}{\\rho}}",
    relationships: [
      "CAS = IAS corrected for instrument error",
      "EAS = CAS corrected for compressibility",
      "TAS = EAS corrected for density",
      "GS = TAS corrected for wind",
    ],
    commonTraps: [
      "TAS is EAS corrected for DENSITY — not CAS corrected for density, and not EAS corrected for compressibility.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.42", "2.43", "2.44", "2.45", "2.46"] },
  },
  {
    id: "c-tas-altitude",
    unit: "u1",
    name: "TAS vs IAS with altitude",
    definition:
      "The pitot-static system is calibrated for standard sea-level density, so TAS equals IAS only on a standard day at sea level. Above sea level, density is lower, so for a constant IAS the TAS must be higher.",
    relationships: [
      "Altitude ↑ → density ↓ → for constant IAS, TAS ↑",
      "Rule of thumb: TAS ≈ +3 knots per 1,000 ft at constant IAS",
      "At any altitude above sea level, IAS is LESS than TAS",
    ],
    commonTraps: [
      "IAS is less than TAS above sea level, and the gap widens as TAS increases.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.45", "2.47"] },
  },
  {
    id: "c-chordline-chord",
    unit: "u1",
    name: "Chord line and chord",
    definition:
      "The chord line is an infinitely long straight line passing through the leading and trailing edges. Chord is the measurement between those edges along the chord line; average chord (c) is the average of every chord from root to tip.",
    source: { document: TG, chapter: "Basic Theory", eo: ["2.54", "2.55", "2.58"] },
  },
  {
    id: "c-mean-camber-line",
    unit: "u1",
    name: "Mean camber line",
    definition:
      "The mean camber line runs from leading edge to trailing edge, halfway between the UPPER and LOWER surfaces of the airfoil.",
    commonTraps: [
      "Halfway between upper and lower SURFACES. The line through the leading and trailing EDGES is the chord line.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.59"] },
  },
  {
    id: "c-camber-types",
    unit: "u1",
    name: "Camber and camber types",
    definition:
      "Camber is the maximum distance between the mean camber line and the chord line, measured perpendicular to the chord line. Positive camber puts the MCL above the chord line, symmetric has zero camber, negative puts it below.",
    relationships: [
      "Positively cambered → produces positive lift at 0° AOA",
      "Symmetric → produces ZERO lift at 0° AOA",
      "Negatively cambered → produces negative lift at 0° AOA",
    ],
    commonTraps: [
      "Only the symmetric airfoil produces zero lift at zero AOA.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.60", "2.61", "2.62"] },
  },
  {
    id: "c-wing-planform",
    unit: "u1",
    name: "Wingspan, area, aspect ratio",
    definition:
      "Wingspan (b) is wingtip to wingtip. Wing area (S) is wingspan × average chord. Aspect ratio is wingspan ÷ average chord. Taper ratio is tip chord ÷ root chord. Wing loading is weight ÷ wing area.",
    formula: "S = b\\,c \\quad\\quad AR = \\frac{b}{c} \\quad\\quad WL = \\frac{W}{S}",
    relationships: [
      "Gliders: high aspect ratio, low wing loading",
      "Fighters: low aspect ratio, high wing loading",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.71", "2.72", "2.73", "2.74", "2.76"] },
  },
  {
    id: "c-chordwise-spanwise",
    unit: "u1",
    name: "Chordwise vs spanwise flow",
    definition:
      "Chordwise flow travels at right angles (perpendicular) to the leading edge and is the ONLY flow that accelerates over the wing and produces lift. Spanwise flow travels parallel to the leading edge, along the span, and produces no lift.",
    commonTraps: [
      "Spanwise is PARALLEL to the leading edge; chordwise is PERPENDICULAR to it. Only chordwise makes lift.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.63", "2.64"] },
  },
  {
    id: "c-axes",
    unit: "u1",
    name: "Three-axis reference system",
    definition:
      "Longitudinal axis runs nose to tail — roll, controlled by ailerons. Lateral axis runs wingtip to wingtip — pitch, controlled by elevators. Vertical axis runs vertically through the CG — yaw, controlled by the rudder.",
    relationships: [
      "Roll → longitudinal axis → ailerons",
      "Pitch → lateral axis → elevator",
      "Yaw → vertical axis → rudder",
    ],
    commonTraps: [
      "A PITCHING moment is around the LATERAL axis. 'Longitudinal' sounds like pitch but means roll.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.53", "2.79"] },
  },
  {
    id: "c-cg",
    unit: "u1",
    name: "Centre of gravity",
    definition:
      "The centre of gravity is the point where all three axes intersect and all weight is considered to be concentrated, and about which all forces and moments are measured. It shifts as fuel burns or cargo moves.",
    commonTraps: [
      "CG is where WEIGHT is concentrated. The aerodynamic centre is where aerodynamic force acts.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.77"] },
  },
  {
    id: "c-aerodynamic-center",
    unit: "u1",
    name: "Aerodynamic centre",
    definition:
      "The aerodynamic centre is the point along the chord line around which all changes in aerodynamic force take place. On a subsonic airfoil it sits approximately 25% (23–27%) of the chord aft of the leading edge, at maximum airfoil thickness.",
    commonTraps: [
      "≈25% aft of the LEADING edge, and it stays put subsonically.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.78"] },
  },
  {
    id: "c-pitch-vs-aoa",
    unit: "u1",
    name: "Pitch attitude vs AOA",
    definition:
      "Pitch attitude is the angle between the longitudinal axis and the HORIZON. Flight path is the path of the CG through the air mass. Relative wind is equal and opposite to the flight path. Angle of attack is the angle between the CHORD LINE and the RELATIVE WIND. Angle of incidence is the fixed angle between the longitudinal axis and the chord line.",
    relationships: [
      "Same pitch attitude can produce many different AOAs",
      "Flight path, relative wind and AOA can never be inferred from pitch attitude",
    ],
    commonTraps: [
      "Pitch attitude is measured against the HORIZON; AOA is measured against the RELATIVE WIND. They are unrelated quantities.",
      "Angle of incidence is chord line vs LONGITUDINAL AXIS — not vs relative wind.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.65", "2.66", "2.67", "2.68", "2.69"] },
  },

  {
    id: "c-mass-volume",
    unit: "u1",
    name: "Mass and volume",
    definition:
      "Mass (m) is the quantity of molecular material that comprises an object. Volume (V) is the amount of space occupied by an object. Density is the ratio between them.",
    formula: "\\rho = \\frac{m}{V}",
    relationships: ["Same mass in more volume → lower density"],
    commonTraps: [
      "Mass is the quantity of material; weight is the force gravity exerts on it. They are not the same thing.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.3", "2.4"] },
  },
  {
    id: "c-force-weight",
    unit: "u1",
    name: "Force and weight",
    definition:
      "Force (F) is mass times acceleration. Weight (W) is the force with which a mass is attracted toward the centre of the earth by gravity.",
    formula: "F = m \\times a",
    relationships: ["Weight is a force, so it is measured in pounds, not slugs"],
    commonTraps: [
      "Weight is a FORCE, not a quantity of material. Mass stays the same off the planet; weight does not.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.6", "2.7"] },
  },
  {
    id: "c-aircraft-airplane",
    unit: "u1",
    name: "Aircraft vs airplane",
    definition:
      "An aircraft is any device used or intended to be used for flight in the air, supported either by the buoyancy of the structure or by the dynamic reaction of the air against its surfaces. An airplane is a mechanically driven fixed-wing aircraft, heavier than air, supported by the dynamic reaction of the air against its wings.",
    relationships: ["Every airplane is an aircraft; a balloon is an aircraft but not an airplane"],
    commonTraps: [
      "The airplane definition carries four qualifiers: mechanically driven, fixed-wing, heavier than air, supported by dynamic reaction. Dropping one is how distractors are built.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.48", "2.49"] },
  },
  {
    id: "c-airplane-components",
    unit: "u1",
    name: "The five components",
    definition:
      "The components of a conventional airplane are the fuselage, wings, empennage, landing gear and engine(s). The fuselage is the basic structure to which all other components attach. The empennage provides the greatest stabilising influence of all the components.",
    relationships: [
      "Ailerons control roll · rudder controls yaw · elevators control pitch",
      "The empennage is the aft fuselage, the vertical stabiliser and the horizontal stabiliser",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.50"] },
  },
  {
    id: "c-fuselage-construction",
    unit: "u1",
    name: "Fuselage construction",
    definition:
      "Three fuselage types exist. Truss is a frame under a light skin: strong and easily repaired, but heavy. Full monocoque is a highly stressed skin shell: extremely light and strong, but almost impossible to repair. Semi-monocoque adds transverse frame members and stringers that share the stress load, so it is light AND readily repairable. The T-6B uses semi-monocoque.",
    relationships: ["Truss: skin carries none · Monocoque: skin carries all · Semi: shared"],
    commonTraps: [
      "The advantage of semi-monocoque is repairability with the strength retained — not that it is the lightest. Full monocoque is lighter and cannot be repaired.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.51"] },
  },
  {
    id: "c-cantilever-wing",
    unit: "u1",
    name: "Full cantilever wing",
    definition:
      "A wing whose bracing is entirely internal, requiring no external struts or wires. The T-6B has a single low-mounted full cantilever wing with split flaps inboard of the ailerons.",
    commonTraps: [
      "'Full cantilever' is about where the bracing lives, not about wing position or shape.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.52"] },
  },
  {
    id: "c-root-tip-chord",
    unit: "u1",
    name: "Root chord and tip chord",
    definition:
      "The root chord (c_R) is the chord at the wing centerline. The tip chord (c_T) is the chord measured at the wingtip. Taper ratio is the ratio of the tip chord to the root chord.",
    formula: "\\lambda = \\frac{c_T}{c_R}",
    relationships: ["Taper reduces weight, improves structural stiffness and reduces wingtip vortices"],
    commonTraps: [
      "Taper ratio is tip over root, so it is less than 1 on a tapered wing. Inverting it is the usual error.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.56", "2.57"] },
  },
  {
    id: "c-dihedral",
    unit: "u1",
    name: "Dihedral angle",
    definition:
      "Dihedral angle is the angle between the spanwise inclination of the wing and the lateral axis — more simply, the upward slope of the wing seen from the front. A negative dihedral angle is called anhedral.",
    relationships: ["The T-6B has dihedral wings to improve LATERAL stability"],
    commonTraps: [
      "Dihedral buys lateral stability, not longitudinal. Sweep is the one that helps longitudinally.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.70"] },
  },
  {
    id: "c-sweep-angle",
    unit: "u1",
    name: "Sweep angle",
    definition:
      "Sweep angle (Λ) is the angle between the lateral axis and a line drawn 25% aft of the leading edge. On a tapered wing it is NOT parallel to the leading edge. Wing sweep affects maximum lift and stall characteristics. The T-6B wing is swept.",
    relationships: ["Sweep ↑ → the wing's AC moves aft toward the CG → more longitudinally stable"],
    commonTraps: [
      "Sweep is measured to the 25% chord line, not along the leading edge.",
    ],
    source: { document: TG, chapter: "Basic Theory", eo: ["2.75"] },
  },
  /* ================================================================ */
  /* UNIT 2 — UNDERSTAND THE WING                                      */
  /* ================================================================ */
  {
    id: "c-aero-force",
    unit: "u2",
    name: "Aerodynamic force",
    definition:
      "Aerodynamic force is the net force resulting from the pressure and shear-stress distribution over an airfoil. It resolves into two components: lift and drag.",
    relationships: [
      "Of the four forces of flight, only LIFT and DRAG are aerodynamic forces",
    ],
    commonTraps: [
      "Aerodynamic force is the RESULT of pressure and friction distribution — lift alone is only one component of it.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.80", "2.81"] },
  },
  {
    id: "c-lift-def",
    unit: "u2",
    name: "Lift",
    definition:
      "Lift is the component of the aerodynamic force acting PERPENDICULAR to the relative wind.",
    relationships: [
      "Lift is perpendicular to the relative wind, not to the horizon",
      "In a loop the lift vector rotates with the relative wind",
    ],
    commonTraps: [
      "Perpendicular to the RELATIVE WIND — not to the horizon, and not 'upward'.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.83"] },
  },
  {
    id: "c-drag-def",
    unit: "u2",
    name: "Drag",
    definition:
      "Drag is the component of the aerodynamic force acting PARALLEL to, and in the SAME DIRECTION as, the relative wind.",
    commonTraps: [
      "Parallel AND in the same direction as the relative wind. Lift is the perpendicular one.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.86"] },
  },
  {
    id: "c-pressure-distribution",
    unit: "u2",
    name: "Pressure distribution",
    definition:
      "Airflow over the upper surface is squeezed into a smaller cross-section, so by continuity its velocity rises; by Bernoulli its static pressure falls. The pressure differential between lower and upper surfaces produces lift toward the LOWER static pressure.",
    relationships: [
      "Smaller streamtube area → higher velocity → lower static pressure",
      "Maximum velocity occurs at maximum airfoil thickness, where Pₛ is minimum",
      "Flow decelerates to near zero at the trailing edge stagnation point",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.82"] },
  },
  {
    id: "c-lift-equation",
    unit: "u2",
    name: "The lift equation",
    definition:
      "Lift equals dynamic pressure times wing surface area times coefficient of lift.",
    formula: "L = \\tfrac{1}{2}\\rho V^2 S C_L",
    relationships: [
      "Density ↑ → lift ↑",
      "Velocity doubles → lift quadruples (V²)",
      "Surface area ↑ → lift ↑",
      "C_L ↑ → lift ↑",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.84"] },
  },
  {
    id: "c-coefficient-of-lift",
    unit: "u2",
    name: "Coefficient of lift (C.AR.V.A.C)",
    definition:
      "C_L accounts for Compressibility, Aspect Ratio, Viscosity, Angle of attack and Camber. Of these, the pilot can directly control only AOA and camber.",
    relationships: [
      "Pilot controls in the LIFT equation: velocity and C_L",
      "Pilot controls within C_L: AOA and camber (flaps)",
    ],
    commonTraps: [
      "In flight the pilot can affect AOA, camber AND velocity. Viscosity and compressibility are not controllable.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.85"] },
  },
  {
    id: "c-v-aoa-inverse",
    unit: "u2",
    name: "Velocity and AOA in level flight",
    definition:
      "In level flight lift must equal weight, so velocity and angle of attack are inversely related: to fly slower you must raise AOA, and to fly faster you must lower it.",
    relationships: ["Velocity ↓ → AOA must ↑ to hold lift constant"],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.84"] },
  },
  {
    id: "c-cl-vs-aoa",
    unit: "u2",
    name: "CL vs AOA curve",
    definition:
      "As AOA increases, C_L increases nearly linearly to a maximum value, then decreases. The curve's shape is similar for most airfoils; camber shifts it left or right.",
    relationships: [
      "AOA ↑ → C_L ↑ up to C_Lmax",
      "AOA beyond C_Lmax AOA → C_L ↓ (stall)",
      "Positive camber: curve shifted left (positive C_L at 0° AOA)",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.96"] },
  },
  {
    id: "c-clmax",
    unit: "u2",
    name: "CLmax and CLmax AOA",
    definition:
      "C_Lmax is the greatest coefficient of lift an airfoil can produce. The AOA at which it occurs is C_Lmax AOA — also called the critical or stalling angle of attack, and the most EFFECTIVE angle of attack.",
    relationships: [
      "C_Lmax AOA is constant for a given airfoil regardless of weight, q or bank angle",
      "Most EFFECTIVE AOA = C_Lmax AOA. Most EFFICIENT AOA = L/Dmax AOA",
    ],
    commonTraps: [
      "Most EFFECTIVE (C_Lmax AOA) and most EFFICIENT (L/Dmax AOA) are different angles.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.96"] },
  },
  {
    id: "c-flaps-cl",
    unit: "u2",
    name: "Flaps and the CL curve",
    definition:
      "Lowering flaps increases the airfoil's positive camber. This increases C_L at every AOA, increases C_Lmax, and DECREASES C_Lmax AOA.",
    relationships: [
      "Flaps down → C_L ↑, C_Lmax ↑, C_Lmax AOA ↓",
      "Flaps up (retracted) → C_Lmax ↓, C_Lmax AOA ↑",
      "Flaps down → lower stall speed → flatter, better-visibility takeoff and landing attitudes",
    ],
    commonTraps: [
      "Flaps raise C_Lmax but LOWER the AOA at which it occurs. Retracting flaps does the reverse.",
    ],
    source: {
      document: "Basic Theory and Lift Production",
      chapter: "Flaps effect on CL",
      eo: ["3.13"],
    },
  },

  /* ================================================================ */
  /* UNIT 3 — MASTER DRAG                                              */
  /* ================================================================ */
  {
    id: "c-parasite-drag",
    unit: "u3",
    name: "Parasite drag",
    definition:
      "Parasite drag is drag NOT associated with the production of lift. It is composed of form drag, friction drag and interference drag.",
    formula: "D_P = q f = \\tfrac{1}{2}\\rho V^2 f",
    relationships: [
      "Parasite drag varies with velocity SQUARED — double the speed, four times the parasite drag",
      "f is equivalent parasite area: the flat plate that would make the same drag",
    ],
    commonTraps: [
      "Equivalent parasite area f is NOT the cross-sectional area of the aircraft.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.87"] },
  },
  {
    id: "c-form-drag",
    unit: "u3",
    name: "Form drag",
    definition:
      "Form drag (also pressure or profile drag) results from airflow separation from a surface and the low-pressure wake that separation creates. It depends primarily on shape and is reduced by streamlining.",
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.87", "2.88"] },
  },
  {
    id: "c-friction-drag",
    unit: "u3",
    name: "Friction drag",
    definition:
      "Friction drag is the retarding force created by viscosity as air interacts with the aircraft's surfaces. It is reduced by painting, cleaning, waxing and flush rivets.",
    relationships: [
      "Some extra friction drag can REDUCE total parasite drag by delaying separation (golf-ball dimples)",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.87", "2.88"] },
  },
  {
    id: "c-interference-drag",
    unit: "u3",
    name: "Interference drag",
    definition:
      "Interference drag is generated by the mixing of streamlines between components — the whole is greater than the sum of the parts. It accounts for roughly 5–10% of total drag and is minimised by fairing and filleting.",
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.87", "2.88"] },
  },
  {
    id: "c-infinite-wing",
    unit: "u3",
    name: "Infinite wing: upwash and downwash",
    definition:
      "On an infinite wing the relative wind can only flow chordwise. Upwash increases lift by raising average AOA; downwash decreases it by lowering average AOA. On an infinite wing the two exactly balance, so there is no net change in lift.",
    relationships: ["Upwash and downwash exist any time an airfoil produces lift"],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.89"] },
  },
  {
    id: "c-finite-wing-vortices",
    unit: "u3",
    name: "Finite wing and wingtip vortices",
    definition:
      "On a finite wing, high-pressure air below flows spanwise to the tip and around it to the low-pressure upper surface, forming wingtip vortices. Downwash approximately DOUBLES, so downwash exceeds upwash.",
    relationships: [
      "High pressure below → around the tip → low pressure above → vortex",
      "Downwash roughly doubles on a finite wing",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.90", "2.92"] },
  },
  {
    id: "c-induced-drag",
    unit: "u3",
    name: "Induced drag",
    definition:
      "Induced drag is the portion of total drag associated with the production of lift. Increased downwash inclines the average relative wind downward; total lift rotates aft to stay perpendicular to it. The component parallel to the free-stream relative wind is induced drag; the perpendicular component is EFFECTIVE lift.",
    relationships: [
      "Downwash ↑ → total lift vector rotates aft → effective lift ↓ and induced drag ↑",
      "Effective lift is always LESS than total lift",
    ],
    commonTraps: [
      "Induced drag comes from increased DOWNWASH, and it increases as AOA increases.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.91", "2.92"] },
  },
  {
    id: "c-induced-drag-factors",
    unit: "u3",
    name: "Factors affecting induced drag",
    definition:
      "Induced drag is directly proportional to lift (or weight) squared, and inversely proportional to density, velocity squared and wingspan squared.",
    formula: "D_I = \\frac{k L^2}{\\rho V^2 b^2} = \\frac{k W^2}{\\rho V^2 b^2}",
    relationships: [
      "Weight ↑ → induced drag ↑",
      "Velocity ↑ → induced drag ↓",
      "Density ↑ → induced drag ↓",
      "Wingspan ↑ → induced drag ↓",
      "Slower airspeed → higher AOA → greater C_L → stronger vortices → more induced drag",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.93"] },
  },
  {
    id: "c-induced-drag-reduction",
    unit: "u3",
    name: "Reducing induced drag",
    definition:
      "Devices that impede spanwise airflow around the wingtip reduce induced drag: winglets, wingtip fuel tanks and missile rails. Ground effect also reduces it.",
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.93"] },
  },
  {
    id: "c-ground-effect",
    unit: "u3",
    name: "Ground effect",
    definition:
      "Within one wingspan of the ground, downwash at the trailing edge cannot flow fully downward. The reduced downwash lets the total lift vector rotate forward, INCREASING effective lift and DECREASING induced drag.",
    relationships: [
      "Enters within ONE WINGSPAN of the ground",
      "At one wingspan: induced drag reduced only 1.4%",
      "At one-quarter wingspan: reduced 23.5%",
      "Maximum reduction ≈60% just before touchdown or after liftoff",
      "Leaving ground effect: induced drag ↑, lift ↓ — risk of settling back onto the runway",
    ],
    commonTraps: [
      "Ground effect increases EFFECTIVE lift and decreases INDUCED drag. It does not change total lift production capability.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.94", "2.95"] },
  },
  {
    id: "c-total-drag",
    unit: "u3",
    name: "Total drag curve",
    definition:
      "Total drag is the sum of parasite and induced drag. Parasite drag rises with V², induced drag falls with velocity, so total drag is a U-shaped curve with a minimum in the middle.",
    formula: "D_T = D_P + D_I",
    relationships: [
      "Below L/Dmax velocity: INDUCED drag dominates",
      "Above L/Dmax velocity: PARASITE drag dominates",
      "As airspeed decreases, total drag becomes primarily induced drag",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.99", "2.100"] },
  },
  {
    id: "c-ldmax",
    unit: "u3",
    name: "L/Dmax",
    definition:
      "L/Dmax is the maximum ratio of lift to drag — the most EFFICIENT angle of attack. It produces MINIMUM TOTAL DRAG and sits at the bottom of the total drag curve, where parasite drag and induced drag are EQUAL.",
    formula: "\\frac{L}{D} = \\frac{C_L}{C_D}",
    relationships: [
      "At L/Dmax AOA: parasite drag = induced drag",
      "L/Dmax = minimum total drag = max range (prop) = max glide range (any aircraft)",
      "Weight ↑ or altitude ↑ → L/Dmax AIRSPEED ↑, but L/Dmax and L/Dmax AOA unchanged",
    ],
    commonTraps: [
      "L/Dmax is minimum total drag — NOT maximum lift, NOT the aircraft's maximum speed.",
      "L/D measures the efficiency of the WING, not the engine.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.97", "2.98"] },
  },

  /* ================================================================ */
  /* UNIT 4 — PERFORMANCE                                              */
  /* ================================================================ */
  {
    id: "c-thrust-required",
    unit: "u4",
    name: "Thrust required",
    definition:
      "Thrust required is the thrust needed to overcome total drag in equilibrium flight — numerically the total drag curve, expressed in pounds. It is specific to one weight, altitude and configuration.",
    relationships: ["L/Dmax AOA is the point of MINIMUM thrust required"],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.101", "2.109"] },
  },
  {
    id: "c-thrust-available",
    unit: "u4",
    name: "Thrust available",
    definition:
      "Thrust available is the thrust the engines actually produce at a given throttle setting, velocity and density. Throttle is the most important factor.",
    relationships: [
      "Turboprop: thrust available DECREASES with velocity",
      "Turbojet: thrust available is roughly constant with velocity (ram effect offsets the loss)",
      "Density ↓ → thrust available ↓ for both",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.101", "2.103"] },
  },
  {
    id: "c-power-required",
    unit: "u4",
    name: "Power required",
    definition:
      "Power required is the power needed to produce thrust required — the product of thrust required and velocity.",
    formula: "P_R = \\frac{T_R \\times V}{325}",
    relationships: [
      "L/Dmax is NOT at the bottom of the P_R curve — it is to the RIGHT of the bottom",
      "Minimum power required is to the LEFT of L/Dmax",
      "Velocity and AOA for L/Dmax are identical on the T_R and P_R curves",
    ],
    commonTraps: [
      "Bottom of the TOTAL DRAG / thrust required curve = L/Dmax. Bottom of the POWER REQUIRED curve = max endurance (prop). Different points.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.102", "2.107", "2.108"] },
  },
  {
    id: "c-power-available",
    unit: "u4",
    name: "Power available",
    definition:
      "Power available is the power the engines actually produce at a given throttle, velocity and density.",
    formula: "P_A = \\frac{T_A \\times V}{325}",
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.102", "2.103"] },
  },
  {
    id: "c-prop-efficiency",
    unit: "u4",
    name: "Propeller efficiency",
    definition:
      "Thrust horsepower (THP) is the propeller's output; shaft horsepower (SHP) is the engine's output. Propeller efficiency is THP ÷ SHP, and is never 100% because of gearbox friction and propeller drag.",
    formula: "PE = \\frac{THP}{SHP}",
    relationships: [
      "Altitude ↑ or temperature ↑ → density ↓ → propeller efficiency ↓",
      "T-6B: PT6A-68 flat rated at 1,100 SHP at sea level; constant-speed prop at 2,000 RPM",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.104", "2.105", "2.106"] },
  },
  {
    id: "c-excess-thrust",
    unit: "u4",
    name: "Excess thrust",
    definition:
      "Thrust excess is thrust available minus thrust required. A positive excess produces a climb, an acceleration, or both. Angle of climb depends on thrust excess.",
    formula: "T_E = T_A - T_R \\quad\\quad \\sin\\gamma = \\frac{T_E}{W}",
    relationships: [
      "Turbojet: max thrust excess at L/Dmax",
      "Turboprop: max thrust excess at a velocity LESS than L/Dmax",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.110", "2.111"] },
  },
  {
    id: "c-excess-power",
    unit: "u4",
    name: "Excess power",
    definition:
      "Power excess is power available minus power required. Rate of climb depends on power excess. A power excess cannot exist if thrust excess is zero.",
    formula: "P_E = P_A - P_R \\quad\\quad ROC = \\frac{P_E}{W}",
    relationships: [
      "Turbojet: max power excess at a velocity GREATER than L/Dmax",
      "Turboprop: max power excess AT L/Dmax",
      "Max power excess always occurs at a greater velocity and lower AOA than max thrust excess",
    ],
    commonTraps: [
      "For a PROP, max power excess is AT L/Dmax and max thrust excess is BELOW it. For a JET it is the other way round.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.110", "2.111"] },
  },
  {
    id: "c-weight-curve-shift",
    unit: "u4",
    name: "Weight and the curves",
    definition:
      "More weight requires more lift, which at constant AOA requires more velocity. Both drag and velocity rise, so the thrust required and power required curves shift UP AND RIGHT. Thrust and power available are unaffected, so both excesses decrease.",
    relationships: [
      "Weight ↑ → T_R and P_R shift up and right",
      "Weight ↑ → T_A and P_A unchanged → T_E and P_E ↓",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.112"] },
  },
  {
    id: "c-altitude-curve-shift",
    unit: "u4",
    name: "Altitude and the curves",
    definition:
      "Lower density requires a higher velocity for the same lift at the same AOA, but dynamic pressure is unchanged — so drag is unchanged. The thrust required curve shifts RIGHT ONLY. Because power required is thrust times a higher velocity, the power required curve shifts RIGHT AND UP. Thrust and power available both DECREASE.",
    relationships: [
      "Altitude ↑ → T_R shifts RIGHT (not up)",
      "Altitude ↑ → P_R shifts RIGHT AND UP",
      "Altitude ↑ → T_A ↓ and P_A ↓ → both excesses ↓",
    ],
    commonTraps: [
      "The thrust required curve moves right but NOT up with altitude. Only the power required curve moves up.",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.113"] },
  },
  {
    id: "c-config-curve-shift",
    unit: "u4",
    name: "Configuration and the curves",
    definition:
      "Landing gear adds parasite drag with no lift change: T_R and P_R shift straight UP. Flaps increase C_L (allowing lower velocity) and greatly increase drag: T_R and P_R shift UP AND LEFT. Neither affects the engine, so both excesses decrease.",
    relationships: [
      "Gear down → T_R and P_R shift UP",
      "Flaps down → T_R and P_R shift UP AND LEFT",
      "Either → excess thrust and excess power ↓ → climb performance ↓",
    ],
    source: { document: TG, chapter: "Lift Production and Drag", eo: ["2.114", "2.115", "2.116"] },
  },
  {
    id: "c-takeoff-landing-speeds",
    unit: "u4",
    name: "Takeoff and landing speeds",
    definition:
      "Minimum takeoff speed is 20% above power-off stall speed (1.2 Vs). Minimum landing speed is 30% above stall speed (1.3 Vs).",
    formula: "V_{TO} \\approx 1.2 V_S \\quad\\quad V_{LDG} \\approx 1.3 V_S",
    commonTraps: [
      "LANDING is the 1.3 one, TAKEOFF is the 1.2 one. The exam presents them in the opposite order to trip you.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.124"] },
  },
  {
    id: "c-takeoff-distance",
    unit: "u4",
    name: "Takeoff and landing distance",
    definition:
      "Takeoff distance depends on the net accelerating force: thrust minus drag minus rolling friction. Weight is the greatest single factor — DOUBLING weight QUADRUPLES takeoff and landing distance.",
    formula: "S_{TO} = \\frac{W^2}{g\\rho S C_{L\\,max}(T - D - F_R)}",
    relationships: [
      "Weight doubles → distance ×4",
      "Rolling friction F_R = μ(W − L)",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.125", "2.126", "2.127"] },
  },
  {
    id: "c-4h-club",
    unit: "u4",
    name: "The 4-H Club",
    definition:
      "High, Hot, Humid and Heavy all degrade takeoff and landing performance. The first three reduce density; the fourth raises the required speed and rolling friction. All four increase required speed and required distance.",
    relationships: [
      "High / Hot / Humid → density ↓ → true takeoff speed ↑ and thrust ↓ → distance ↑",
      "Indicated takeoff airspeed does NOT change with density — only TAS and distance do",
      "Headwind → distance ↓ · Tailwind → distance ↑",
      "Flaps → distance ↓",
    ],
    commonTraps: [
      "Indicated takeoff speed stays constant regardless of temperature, humidity and elevation. It is the TRUE airspeed and the distance that grow.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.127", "2.128"] },
  },
  {
    id: "c-hydroplaning",
    unit: "u4",
    name: "Hydroplaning",
    definition:
      "Hydroplaning is the tyres skimming on a thin layer of water. It can occur with standing water over 0.1 in. Speed depends on TYRE PRESSURE, not weight.",
    formula: "V_{hydroplane}\\,(mph) = 9\\sqrt{\\text{tyre pressure}}",
    commonTraps: [
      "Hydroplaning speed is independent of weight. A heavier aircraft just makes a bigger footprint.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.150", "2.151"] },
  },
  {
    id: "c-vx-vy",
    unit: "u4",
    name: "Vx and Vy",
    definition:
      "Maximum angle of climb (Vx) maximises altitude gained per unit of GROUND DISTANCE — used for obstacle clearance, and set by maximum thrust excess. Maximum rate of climb (Vy) maximises altitude gained per unit of TIME — used to expedite a climb, and set by maximum power excess.",
    relationships: [
      "Vx ← max thrust excess · Turboprop: velocity LESS than L/Dmax, AOA greater",
      "Vy ← max power excess · Turboprop: AT L/Dmax AOA and velocity",
      "Headwind increases max angle of climb; wind does NOT affect rate of climb",
    ],
    commonTraps: [
      "Vx = obstacle clearance (angle). Vy = expedited climb (rate). Do not swap.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.129", "2.130", "2.131"] },
  },
  {
    id: "c-ceilings",
    unit: "u4",
    name: "Ceilings",
    definition:
      "Combat ceiling: max power excess gives only 500 fpm. Cruise ceiling: 300 fpm. Service ceiling: 100 fpm. Absolute ceiling: maximum power excess is zero and rate of climb is zero.",
    relationships: ["T-6B operational ceiling: 31,000 ft"],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.133", "2.134"] },
  },
  {
    id: "c-max-range",
    unit: "u4",
    name: "Maximum range",
    definition:
      "Maximum range is the greatest distance travelled for a given amount of fuel. For a TURBOPROP it occurs at L/Dmax AOA and velocity — the most efficient AOA and minimum total drag.",
    relationships: [
      "Turboprop max range = L/Dmax = minimum total drag = parasite drag equals induced drag",
      "Turbojet max range: velocity GREATER than L/Dmax, AOA less",
      "Max range is FASTER than max endurance",
    ],
    commonTraps: [
      "Max range is a HIGHER velocity and LOWER AOA than max endurance, not the other way round.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.136", "2.137"] },
  },
  {
    id: "c-max-endurance",
    unit: "u4",
    name: "Maximum endurance",
    definition:
      "Maximum endurance is the greatest time airborne for a given amount of fuel — minimum fuel flow. For a TURBOPROP it is the bottom of the POWER REQUIRED curve: a velocity LESS than L/Dmax and an AOA GREATER than L/Dmax AOA.",
    relationships: [
      "Turboprop max endurance = bottom of the power required curve (T-6B: 8.8 units AOA)",
      "Turbojet max endurance = L/Dmax AOA and velocity",
      "Turboprop max range = L/Dmax (T-6B: 4.4 units AOA)",
      "Endurance → range: DECREASE AOA, INCREASE velocity",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.136", "2.137"] },
  },
  {
    id: "c-range-endurance-factors",
    unit: "u4",
    name: "Factors on range and endurance",
    definition:
      "Weight ↑ or gear/flaps down both reduce range and endurance. Altitude ↑ IMPROVES both, because colder inlet temperatures make turbine engines more fuel efficient. Headwind reduces range; wind has no effect on endurance.",
    relationships: [
      "Altitude ↑ → max range ↑ and max endurance ↑",
      "Weight ↑ → both ↓, and both airspeeds ↑",
      "Headwind → max range ↓ · Tailwind → max range ↑ · Wind → endurance unchanged",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.138"] },
  },
  {
    id: "c-mach",
    unit: "u4",
    name: "Mach number and critical Mach",
    definition:
      "Mach number is the ratio of TAS to the local speed of sound. Critical Mach is the lowest Mach number at which sonic flow first appears somewhere on the aircraft.",
    formula: "M = \\frac{TAS}{LSOS}",
    relationships: [
      "Altitude ↑ → TAS ↑ for constant IAS, and temperature ↓ so LSOS ↓ → Mach number ↑",
      "Critical Mach is fixed by design and does NOT change with altitude",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.139", "2.140", "2.141"] },
  },
  {
    id: "c-glide",
    unit: "u4",
    name: "Glide range and glide endurance",
    definition:
      "Maximum glide RANGE is the minimum angle of descent and occurs at L/Dmax for ANY aircraft regardless of engine type. Maximum glide ENDURANCE is the minimum rate of descent, at the bottom of the power required curve — a velocity less than L/Dmax and an AOA greater than L/Dmax AOA.",
    relationships: [
      "Glide range → L/Dmax (T-6B best glide 125 KIAS, glide ratio 11:1 clean)",
      "Weight ↑ → glide RANGE unchanged (same AOA, same L/D), but faster and higher rate of descent",
      "Altitude ↑ → both glide range and glide endurance ↑",
      "Gear/flaps down or a windmilling propeller → glide performance ↓ (feather the prop)",
    ],
    commonTraps: [
      "Trying to stretch a glide by raising AOA above L/Dmax AOA REDUCES distance travelled.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.142", "2.143", "2.144"] },
  },
  {
    id: "c-reverse-command",
    unit: "u4",
    name: "Region of reverse command",
    definition:
      "Velocities BELOW maximum endurance airspeed. Characterised by airspeed instability: velocity and throttle setting are INVERSELY related, so to fly slower in level flight you must add power.",
    relationships: [
      "Slower in reverse command → induced drag ↑ → power required ↑",
      "Region of NORMAL command is above max endurance and is airspeed-stable",
      "Most accidents happen here — every takeoff and landing is in or near this region",
    ],
    commonTraps: [
      "Increasing AOA to slow down here makes the deficit worse. The fix is throttle, not stick.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.145", "2.146"] },
  },

  {
    id: "c-best-climb-profile",
    unit: "u4",
    name: "T-6B best climb profile",
    definition:
      "At maximum angle of climb an aircraft can be operating near stall speed, so the T-6B flies a recommended best climb speed of 140 KIAS instead. That speed meets or exceeds any obstacle clearance requirement while providing a greater safety margin. Max angle of climb is not flown in the T-6B.",
    relationships: ["Best climb speed 140 KIAS · max AOC is not used in the T-6B"],
    commonTraps: [
      "The T-6B does not fly max angle of climb. The exam offers it as a plausible answer.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.132"] },
  },
  {
    id: "c-fuel-flow-turboprop",
    unit: "u4",
    name: "Fuel flow on a turboprop",
    definition:
      "A turbojet produces thrust directly, so its fuel consumption is proportional to thrust available and minimum fuel flow is found on the THRUST required curve. A propeller's thrust is not produced directly by the engine — the engine turns a shaft and so produces power — therefore for a turboprop fuel flow varies directly with power output, and minimum fuel flow is found on the POWER required curve.",
    relationships: [
      "Turbojet: minimum fuel flow at minimum T_R",
      "Turboprop: minimum fuel flow at minimum P_R",
    ],
    commonTraps: [
      "The T-6B is a turboprop, so its endurance point sits on the POWER required curve — at a velocity below L/Dmax and an AOA above L/Dmax AOA, 8.8 units.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.135"] },
  },
  {
    id: "c-nwlotd",
    unit: "u4",
    name: "Nosewheel liftoff/touchdown speed",
    definition:
      "NWLO/TD is the minimum safe airspeed at which the nosewheel may leave the runway during takeoff, or the minimum airspeed at which it must return to the runway after landing. It is read from the Takeoff/Landing Crosswind chart in NATOPS and the Dash-1.",
    relationships: ["Below NWLO/TD the airplane may weathercock into the wind and run off the runway"],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.147"] },
  },
  {
    id: "c-crosswind-technique",
    unit: "u4",
    name: "Crosswind control inputs",
    definition:
      "In a crosswind takeoff or landing the ailerons are NOT used to maintain directional control. They are used to overcome the lateral stability that is trying to roll the airplane away from the sideslip relative wind.",
    commonTraps: [
      "Directional control in a crosswind is the rudder's job. The aileron is fighting the roll that lateral stability produces, not steering the aircraft.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.148"] },
  },
  {
    id: "c-crosswind-limits",
    unit: "u4",
    name: "T-6B crosswind limits",
    definition:
      "Maximum crosswind component for takeoff or landing in the T-6B is 25 knots. The major consideration in setting a maximum authorised crosswind component is the ability to maintain directional control at low speeds. For variable or gusting winds, always use the maximum wind angle and the maximum gust velocity to compute the component.",
    relationships: ["25 kt flaps UP or TO on a dry runway · 10 kt with flaps LDG or a wet runway"],
    commonTraps: [
      "Gusting wind is computed from the MAXIMUM gust and the MAXIMUM angle, never the average.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.149"] },
  },
  {
    id: "c-turn-weight-thrust-drag",
    unit: "u5",
    name: "Weight, thrust and drag in a turn",
    definition:
      "Turn rate and turn radius are INDEPENDENT of weight: any two airplanes able to fly the same velocity and angle of bank can fly formation regardless of weight, though the heavier one produces more lift. Thrust can limit turn performance, because induced drag is proportional to lift squared — an airplane pulling 5 G produces 25 times the induced drag of level flight, so if maximum thrust only overcomes 16 times as much, it can hold level flight at only 4 G.",
    relationships: [
      "Weight → no effect on turn rate or radius",
      "Thrust limit → caps the sustainable load factor",
      "Induced drag ∝ lift², so G² sets the drag penalty",
    ],
    commonTraps: [
      "Weight feels like it should matter and does not. The three real limits are C_Lmax AOA, the limit load factor, and thrust.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.155", "2.156", "2.157"] },
  },
  {
    id: "c-increasing-maneuverability",
    unit: "u5",
    name: "Increasing maneuverability",
    definition:
      "Maneuverability is the ease with which an airplane will move out of its equilibrium position, and it is the opposite of stability. There are two ways to increase it: give the airplane weaker stability, or give it larger control surfaces, which generate larger moments from greater aerodynamic forces.",
    relationships: [
      "Stability ↓ → maneuverability ↑, at the cost of pilot attention",
      "Control surface size ↑ → maneuverability ↑",
    ],
    commonTraps: [
      "A transport is deliberately stable; a fighter is deliberately maneuverable. The designer is choosing, not failing.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.174"] },
  },
  /* ================================================================ */
  /* UNIT 5 — LIMITS & MANEUVERING                                     */
  /* ================================================================ */
  {
    id: "c-boundary-layer",
    unit: "u5",
    name: "Boundary layer",
    definition:
      "The boundary layer is the layer of airflow over a surface that shows local airflow retardation due to viscosity. It is about 1 mm thick at the leading edge and thickens as it moves aft.",
    source: { document: TG, chapter: "Stalls", eo: ["3.1"] },
  },
  {
    id: "c-laminar-turbulent",
    unit: "u5",
    name: "Laminar vs turbulent flow",
    definition:
      "Laminar flow moves smoothly in streamlines, producing very little friction but separating easily. Turbulent flow is disorganised and irregular, producing higher friction drag but adhering better and delaying separation.",
    relationships: [
      "Boundary layer is laminar near the leading edge, then transitions to turbulent aft",
      "Turbulent = more friction drag BUT later separation",
    ],
    commonTraps: [
      "Turbulent flow is the one that STICKS BETTER. Laminar separates easily.",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.2"] },
  },
  {
    id: "c-pressure-gradient",
    unit: "u5",
    name: "Favourable vs adverse pressure gradient",
    definition:
      "From the leading edge (high Pₛ) to maximum thickness (low Pₛ) the gradient is FAVOURABLE and helps the boundary layer adhere. From maximum thickness (low Pₛ) to the trailing edge (high Pₛ) the gradient is ADVERSE and impedes the flow.",
    relationships: ["AOA ↑ → boundary-layer kinetic energy ↓ and adverse gradient ↑"],
    source: { document: TG, chapter: "Stalls", eo: ["3.3"] },
  },
  {
    id: "c-bl-separation",
    unit: "u5",
    name: "Boundary layer separation",
    definition:
      "When the boundary layer lacks the kinetic energy to overcome the adverse pressure gradient it stagnates and separates from the surface; aft of the separation point the flow reverses and a turbulent wake replaces the low pressure that produced lift.",
    relationships: [
      "AOA ↑ → separation point moves FORWARD, toward the leading edge",
      "Separation point far enough forward → C_L decreases → stall",
    ],
    commonTraps: [
      "Approaching a stall the separation point moves FORWARD (toward the leading edge), not aft.",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.3"] },
  },
  {
    id: "c-stall",
    unit: "u5",
    name: "Stall",
    definition:
      "A stall is a condition of flight in which an INCREASE in AOA results in a DECREASE in coefficient of lift. It occurs at angles of attack greater than C_Lmax AOA.",
    relationships: [
      "The ONLY cause of a stall is excessive AOA",
      "A wing always stalls at the same AOA regardless of airspeed, attitude, weight or altitude",
      "The only action needed for recovery is to decrease AOA below C_Lmax AOA",
    ],
    commonTraps: [
      "A stalled wing still produces lift — just less of it. 'The wing no longer produces lift' is wrong.",
      "Stalls depend on AOA, not on velocity.",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.5", "3.6", "3.7"] },
  },
  {
    id: "c-clmax-aoa",
    unit: "u5",
    name: "CLmax AOA (critical AOA)",
    definition:
      "C_Lmax AOA is the angle of attack beyond which C_L begins to decrease — the stalling or critical angle of attack. In the T-6B it is 18 units, regardless of airspeed, attitude, weight or altitude.",
    relationships: [
      "T-6B: stall at 18 units AOA; stick shakers at 15.5 units",
      "T-6B loss of control effectiveness order: ailerons → elevator → rudder",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.4", "3.9", "3.16"] },
  },
  {
    id: "c-stall-speed",
    unit: "u5",
    name: "Stall speed",
    definition:
      "Stall speed is the minimum TRUE airspeed required to maintain level flight at C_Lmax AOA.",
    formula: "V_S = \\sqrt{\\frac{2W}{\\rho S C_{L\\,max}}}",
    relationships: [
      "Weight ↑ → stall speed ↑",
      "C_Lmax ↑ (flaps down) → stall speed ↓",
      "Altitude ↑ → TRUE stall speed ↑, but INDICATED stall speed unchanged (ρ₀ is a constant)",
    ],
    commonTraps: [
      "It is the minimum TRUE airspeed, at C_Lmax AOA, in LEVEL flight.",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.10", "3.11"] },
  },
  {
    id: "c-stall-speed-altitude",
    unit: "u5",
    name: "True vs indicated stall speed",
    definition:
      "Because indicated stall speed uses sea-level density ρ₀, which is a constant, indicated stall speed does not change with altitude. True stall speed increases with altitude because local density falls.",
    formula: "IAS_S = \\sqrt{\\frac{2W}{\\rho_0 S C_{L\\,max}}}",
    source: { document: TG, chapter: "Stalls", eo: ["3.10"] },
  },
  {
    id: "c-power-on-off-stall",
    unit: "u5",
    name: "Power-on vs power-off stall",
    definition:
      "Power-on stall speed is LOWER than power-off. At high pitch attitudes the vertical component of thrust supports part of the weight, and for propeller aircraft the propeller accelerates air over the wing root.",
    formula: "V_S = \\sqrt{\\frac{2(W - T\\sin\\theta)}{\\rho S C_{L\\,max}}}",
    relationships: [
      "Power ON → stall speed ↓ (favourable)",
      "Power OFF → stall speed ↑",
    ],
    commonTraps: [
      "Stall speed INCREASES in power-off flight. Power-on is the lower one.",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.8"] },
  },
  {
    id: "c-stall-recovery",
    unit: "u5",
    name: "Stall recovery",
    definition:
      "RELAX, MAX, LEVEL, BALL — relax back stick pressure to reduce AOA and break the stall, advance the PCL to full power, level the wings, and use rudder to centre the ball. Recovery is complete wings level, clean and safely climbing.",
    source: { document: TG, chapter: "Stalls", eo: ["3.6"] },
  },
  {
    id: "c-high-lift-purpose",
    unit: "u5",
    name: "Purpose of high lift devices",
    definition:
      "High lift devices increase C_L at high AOA. Their primary purpose is to reduce takeoff and landing speeds by reducing both indicated and true stall speeds.",
    source: { document: TG, chapter: "Stalls", eo: ["3.12"] },
  },
  {
    id: "c-blc-devices",
    unit: "u5",
    name: "Boundary layer control devices",
    definition:
      "Slots, slats and vortex generators re-energise the boundary layer so separation is delayed. They increase BOTH C_Lmax AND C_Lmax AOA, and because they do not change camber they do not change C_L at low AOA.",
    relationships: [
      "BLC devices → C_Lmax ↑ AND C_Lmax AOA ↑",
      "Camber devices (flaps) → C_Lmax ↑ but C_Lmax AOA ↓",
    ],
    commonTraps: [
      "Slats/slots raise the stalling AOA. Flaps lower it. That is the whole distinction.",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.13", "3.14"] },
  },
  {
    id: "c-camber-devices",
    unit: "u5",
    name: "Camber-change devices",
    definition:
      "Plain, split, slotted and Fowler flaps increase camber and therefore C_Lmax, while decreasing C_Lmax AOA. Fowler flaps also increase wing area. Flaps add drag, allowing a steeper glideslope at a higher power setting.",
    relationships: [
      "T-6B uses split flaps",
      "First 50% of flap travel gives most of the lift for less than half the drag",
    ],
    source: { document: TG, chapter: "Stalls", eo: ["3.13", "3.15"] },
  },
  {
    id: "c-stall-pattern",
    unit: "u5",
    name: "Stall pattern and wing planform",
    definition:
      "The most desirable stall pattern begins at the ROOT, preserving aileron effectiveness and giving buffet warning. Rectangular wings stall at the root. Tapered and swept wings have a strong TIP stall tendency. Elliptical wings stall everywhere at once, with little warning.",
    source: { document: TG, chapter: "Stalls", eo: ["3.17"] },
  },
  {
    id: "c-wing-tailoring",
    unit: "u5",
    name: "Wing tailoring",
    definition:
      "Geometric twist decreases angle of incidence from root to tip so the root reaches stalling AOA first. Aerodynamic twist changes airfoil shape so C_Lmax AOA is higher at the tip. Stall strips force root separation; stall fences redirect spanwise flow on swept wings.",
    relationships: ["The T-6B wing is both geometrically and aerodynamically twisted, and uses stall strips"],
    source: { document: TG, chapter: "Stalls", eo: ["3.18"] },
  },
  {
    id: "c-turn-lift",
    unit: "u5",
    name: "Turning flight",
    definition:
      "A turn reorients the lift vector. Lift splits into a horizontal component (centripetal force, which turns the aircraft) and a vertical component (which opposes weight). To hold altitude, TOTAL lift must be increased — normally by increasing AOA with back stick — and power must be added to offset the increased induced drag.",
    relationships: [
      "Bank ↑ → vertical lift component ↓ → total lift must ↑ to hold altitude",
      "Total lift ↑ → induced drag ↑ → power must ↑",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.154", "2.162"] },
  },
  {
    id: "c-load-factor",
    unit: "u5",
    name: "Load factor",
    definition:
      "Load factor (n) is the ratio of total lift to weight — the Gs felt. In a level constant-airspeed turn it depends only on bank angle.",
    formula: "n = \\frac{L}{W} = \\frac{1}{\\cos\\phi}",
    relationships: [
      "60° angle of bank → 2 G",
      "Above 45° bank the load factor and stall speed rise rapidly",
      "T-6B limit load: +7.0 / −3.5 G",
    ],
    commonTraps: [
      "Load factor is Lift ÷ Weight. L/D is the efficiency ratio — different thing entirely.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.163", "2.164"] },
  },
  {
    id: "c-accelerated-stall",
    unit: "u5",
    name: "Accelerated stall speed",
    definition:
      "Maneuvering raises stall speed. Accelerated stall speed is the normal stall speed multiplied by the square root of the load factor.",
    formula: "V_S = \\sqrt{\\frac{2Wn}{\\rho S C_{L\\,max}}} = V_{S1}\\sqrt{n}",
    relationships: [
      "60° bank → 2 G → stall speed ×√2 ≈ 40% higher",
      "Bank ↑ → load factor ↑ → lift required ↑ → stall speed ↑",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.163"] },
  },
  {
    id: "c-turn-rate-radius",
    unit: "u5",
    name: "Turn rate and turn radius",
    definition:
      "Turn rate (ω) is the rate of heading change in degrees per second. Turn radius (r) is the radius of the circle the flight path scribes. In a level coordinated turn both are controlled ONLY by airspeed and angle of bank — they are independent of weight.",
    formula: "\\omega = \\frac{g\\tan\\phi}{V} \\quad\\quad r = \\frac{V^2}{g\\tan\\phi}",
    relationships: [
      "Velocity ↑ at constant bank → turn rate ↓, turn radius ↑",
      "Bank ↑ at constant velocity → turn rate ↑, turn radius ↓",
      "Best turn performance is at the maneuver point on the V-n diagram",
    ],
    commonTraps: [
      "Turn performance is independent of WEIGHT. Two aircraft at the same speed and bank turn identically.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.158", "2.159", "2.160"] },
  },
  {
    id: "c-load-definitions",
    unit: "u5",
    name: "Limit, elastic and ultimate load",
    definition:
      "Limit load factor is the greatest load factor sustainable with NO risk of permanent deformation — the maximum anticipated in normal operation. Elastic limit is the maximum load a component can take and still return to its original shape. Ultimate load factor is the maximum sustainable without structural failure, and equals 150% of the limit load.",
    formula: "n_{ultimate} = 1.5 \\times n_{limit}",
    relationships: [
      "Ultimate = 1.5 × limit, so limit = 2/3 of ultimate",
      "Exceeding limit load → possible permanent deformation (over-G — always report it)",
      "Exceeding ultimate load → structural failure imminent",
    ],
    commonTraps: [
      "Asked 'the limit load is ___ the ultimate load', the answer is 2/3 of. Asked the other way, ultimate is 1.5 times limit.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.164", "2.165"] },
  },
  {
    id: "c-vn-diagram",
    unit: "u5",
    name: "V-n diagram",
    definition:
      "The V-n diagram plots load factor against INDICATED airspeed and summarises the aircraft's structural and aerodynamic limits for one weight, altitude and configuration. The safe flight envelope is bounded by the accelerated stall lines, the limit load factors and redline airspeed.",
    relationships: [
      "Accelerated stall lines (left) are set by C_Lmax AOA",
      "Limit load factors bound the envelope above and below",
      "Redline airspeed (V_NE) bounds it on the right",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.166", "2.167"] },
  },
  {
    id: "c-maneuver-speed",
    unit: "u5",
    name: "Maneuver speed / cornering velocity",
    definition:
      "The maneuver point is where the accelerated stall line meets the limit load factor line. The indicated airspeed there is maneuver speed (Va) or cornering velocity — the LOWEST airspeed at which the limit load factor can be reached, and the point of best turn performance.",
    relationships: [
      "Below Va the aircraft stalls before it can be over-G'd",
      "T-6B maneuver speed: 227 KIAS at max gross weight",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.166", "2.167"] },
  },
  {
    id: "c-envelope-factors",
    unit: "u5",
    name: "Factors affecting the envelope",
    definition:
      "Gross weight, altitude, configuration, asymmetric loading and gust loading all change the safe flight envelope.",
    relationships: [
      "Weight ↑ → limit load factor ↓, accelerated stall lines sweep RIGHT, maneuver speed ↑",
      "Altitude ↑ → indicated redline must DECREASE (to stay below critical Mach); load limits and stall lines unchanged",
      "Gear/flaps down → envelope substantially smaller",
      "Asymmetric or gust loading → reduce pilot-induced limit load to about 2/3 of normal",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.167", "2.168"] },
  },

  {
    id: "c-empennage-spin",
    unit: "u6",
    name: "Empennage design and spins",
    definition:
      "Vertical stabiliser and rudder design and the placement of the horizontal surfaces significantly affect spin recovery. With a swept vertical fin the horizontal surfaces block almost all airflow to the rudder, so it cannot stop the autorotation. The T-6B tail leaves the rudder unblocked and places the horizontal stabiliser farther aft, exposing more rudder in a spin. The T-6B also uses a dorsal fin, strakes and a ventral fin to reduce spin severity.",
    relationships: [
      "Dorsal fin: increases vertical stabiliser area, decreases spin rate, aids stopping autorotation",
      "Ventral fin: decreases spin rate, helps hold a nose-down attitude",
      "Strakes: increase horizontal stabiliser area, keep the nose down, prevent a flat spin",
    ],
    commonTraps: [
      "An inverted T-6B spin is hard to enter and disorienting but EASY to recover, because the whole vertical stabiliser is exposed to the relative wind.",
    ],
    source: { document: TG, chapter: "Spins", eo: ["3.25"] },
  },
  /* ================================================================ */
  /* UNIT 6 — DEPARTURES & HAZARDS                                     */
  /* ================================================================ */
  {
    id: "c-slip",
    unit: "u6",
    name: "Slipping turn",
    definition:
      "A slip is caused by insufficient (or opposite) rudder in the direction of the turn. The nose yaws to the OUTSIDE of the turn, turn radius INCREASES and turn rate DECREASES. The ball is deflected toward the INSIDE — the same side as the turn.",
    relationships: [
      "Slip → insufficient rudder → nose outside → radius ↑, rate ↓ → ball same side as turn",
      "Useful for crosswind landings (wing down, top rudder) and increasing rate of descent",
      "A stall in a slip rolls the aircraft toward wings level — the safer failure",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.161"] },
  },
  {
    id: "c-skid",
    unit: "u6",
    name: "Skidding turn",
    definition:
      "A skid is caused by excessive rudder in the direction of the turn. The nose yaws to the INSIDE of the turn, turn radius DECREASES and turn rate INCREASES. The ball is deflected toward the OUTSIDE — the opposite side from the turn.",
    relationships: [
      "Skid → excessive rudder → nose inside → radius ↓, rate ↑ → ball opposite side",
      "Dangerous: a skidded-turn stall rolls the aircraft INVERTED",
      "Correction for either: step on the ball",
    ],
    commonTraps: [
      "In a SKID the ball is on the OPPOSITE side of the turn needle and the nose is INSIDE the turn.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.161"] },
  },
  {
    id: "c-p-factor",
    unit: "u6",
    name: "P-factor",
    definition:
      "P-factor is a yawing moment caused by one propeller blade producing more thrust than the other. At high AOA the relative wind is below the thrust line, so the DOWN-GOING blade on the right side has a larger AOA and makes more thrust, yawing the nose LEFT.",
    relationships: [
      "Requires a HIGH power setting AND the thrust axis displaced from the relative wind",
      "Most notable at high power and LOW airspeed → yaws left → right rudder",
    ],
    commonTraps: [
      "P-factor needs high power AND low airspeed (high AOA). At cruise the designers align the thrust axis so it nearly vanishes.",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.152", "2.153"] },
  },
  {
    id: "c-slipstream-swirl",
    unit: "u6",
    name: "Slipstream swirl",
    definition:
      "The propeller imparts a corkscrewing motion to the air, which flows around the fuselage and strikes the LEFT side of the vertical stabiliser, increasing its AOA. The resulting horizontal lift pulls the tail right and yaws the nose LEFT.",
    relationships: [
      "Greatest at HIGH power and LOW airspeed",
      "Correction: RIGHT rudder",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.152", "2.153"] },
  },
  {
    id: "c-torque-gyro",
    unit: "u6",
    name: "Torque and gyroscopic precession",
    definition:
      "Torque is Newton's third law: the propeller turning clockwise rolls the fuselage counter-clockwise. Gyroscopic precession makes a force applied to a spinning propeller act 90° later in the direction of rotation — pitching the T-6B's nose down produces a LEFT yaw.",
    relationships: [
      "T-6B: rudder and the automatic Trim Aid Device compensate for torque",
      "Gyroscopic precession strongly influences spin entry characteristics",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.152", "2.153"] },
  },
  {
    id: "c-spin-definition",
    unit: "u6",
    name: "Spin and autorotation",
    definition:
      "A spin is an aggravated stall that results in autorotation. Autorotation is a self-sustaining combination of roll and yaw caused by asymmetrically stalled wings. Two conditions are required: the aircraft must be STALLED, and YAW must be present.",
    relationships: [
      "Stall + yaw = spin. Remove either and it cannot happen.",
      "Four phases: post-stall gyration → incipient → developed → recovery",
    ],
    commonTraps: [
      "The two conditions are exceeding C_Lmax AOA and a YAWING moment — not a pitching moment, and not L/Dmax AOA.",
    ],
    source: { document: TG, chapter: "Spins", eo: ["3.19", "3.20", "3.23"] },
  },
  {
    id: "c-spin-wings",
    unit: "u6",
    name: "Wing asymmetry in a spin",
    definition:
      "Both wings are stalled, but the inside (down-going) wing is MORE stalled. It senses a roll relative wind from beneath, giving it a HIGHER AOA, LOWER C_L and MORE drag. The lift differential sustains the roll; the drag differential sustains the yaw.",
    relationships: [
      "Down-going / inside wing: AOA ↑, C_L ↓, drag ↑ — more stalled",
      "Up-going / outside wing: AOA ↓, C_L ↑, drag ↓ — less stalled",
      "Lift differential → roll · Drag differential → yaw · Together → autorotation",
    ],
    commonTraps: [
      "Both wings are stalled. Neither loses all its lift. The DOWN-going wing is the more stalled one and the one with more drag.",
    ],
    source: { document: TG, chapter: "Spins", eo: ["3.21"] },
  },
  {
    id: "c-spin-recovery",
    unit: "u6",
    name: "Spin recovery",
    definition:
      "T-6B recovery: gear, flaps and speed brake retracted; PCL to IDLE; rudder FULL OPPOSITE to turn needle deflection; control stick FORWARD of neutral with ailerons NEUTRAL; then smoothly recover to level flight after rotation stops.",
    relationships: [
      "Rudder is the principal control for stopping autorotation",
      "The TURN NEEDLE is the only reliable indicator of spin direction — disregard the ball",
      "Ailerons are neutral: the deeply stalled wing gives them almost nothing to work with",
    ],
    commonTraps: [
      "The balance ball gives NO useful spin-direction information. Use the turn needle.",
    ],
    source: { document: TG, chapter: "Spins", eo: ["3.26", "3.27"] },
  },
  {
    id: "c-spin-factors",
    unit: "u6",
    name: "Factors affecting spins",
    definition:
      "Conservation of angular momentum governs spin behaviour. Full aft stick gives the flattest attitude and the SLOWEST rotation (unaccelerated spin); any other stick position steepens the pitch and speeds rotation (accelerated spin). A heavier aircraft enters more slowly with fewer oscillations; a lighter one enters faster but recovers faster.",
    relationships: [
      "Nose pitches down → moment arm shortens → rotation rate ↑ (the ice-skater effect)",
      "T-6B right spin: nose lower, faster rotation, more oscillatory (gyroscopic precession)",
      "T-6B left spin: flatter, slower, smoother",
      "Progressive spin: full opposite rudder while holding full aft stick",
      "Aggravated spin: pro-spin rudder held while moving the stick forward",
    ],
    source: { document: TG, chapter: "Spins", eo: ["3.22", "3.23", "3.24", "3.28", "3.29"] },
  },
  {
    id: "c-static-stability",
    unit: "u6",
    name: "Static stability",
    definition:
      "Static stability is the INITIAL tendency of an object to move toward or away from its original equilibrium position after a disturbance. Positive returns toward it, negative continues away, neutral accepts the new position.",
    relationships: [
      "Stability and maneuverability are opposites",
      "Static instability guarantees dynamic instability",
    ],
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.169", "2.170", "2.173"] },
  },
  {
    id: "c-dynamic-stability",
    unit: "u6",
    name: "Dynamic stability",
    definition:
      "Dynamic stability describes motion over TIME after a disturbance. Positive static + positive dynamic gives damped oscillation; positive static + neutral dynamic gives undamped oscillation; positive static + negative dynamic gives divergent oscillation.",
    source: { document: TG, chapter: "Performance and Maneuvering", eo: ["2.171", "2.172"] },
  },
  {
    id: "c-stability-contributors",
    unit: "u6",
    name: "Component contributions to stability",
    definition:
      "Longitudinal: the horizontal stabiliser is the greatest positive contributor; wings and fuselage are usually negative (their AC is forward of the CG). Directional: the vertical stabiliser is the greatest positive contributor; the fuselage is negative. Lateral: dihedral wings are the greatest positive contributor; anhedral the greatest negative.",
    relationships: [
      "AC behind the CG → positive longitudinal contributor",
      "Aft CG → less longitudinal stability; the neutral point is the aft-most CG without negative stability",
      "High-mounted wings and swept wings are laterally stabilising",
    ],
    source: {
      document: TG,
      chapter: "Performance and Maneuvering",
      eo: ["2.175", "2.176", "2.177", "2.178"],
    },
  },
  {
    id: "c-dynamic-modes",
    unit: "u6",
    name: "Divergence, Dutch roll and yaw modes",
    definition:
      "Directional divergence comes from NEGATIVE directional stability. Spiral divergence comes from STRONG directional and WEAK lateral stability. Dutch roll comes from STRONG lateral and WEAK directional stability. Adverse yaw is the yaw away from the direction of aileron roll input, caused by extra induced drag on the up-going wing.",
    relationships: [
      "Strong directional + weak lateral → spiral divergence",
      "Strong lateral + weak directional → Dutch roll",
      "Adverse yaw fixes: spoilers, rudder input, differential ailerons",
      "Phugoid: long-period (20–100 s) altitude/airspeed oscillation at near-constant AOA",
    ],
    source: {
      document: TG,
      chapter: "Performance and Maneuvering",
      eo: ["2.179", "2.180", "2.181", "2.182", "2.183", "2.184", "2.185"],
    },
  },
  {
    id: "c-wake-turbulence",
    unit: "u6",
    name: "Wake turbulence",
    definition:
      "Wingtip vortices are spiralling masses of air formed at the wingtips ANY TIME an aircraft is producing lift. Flying into them can instantly change the relative wind, stall a wing, or cause a compressor stall.",
    relationships: [
      "Generated from rotation on takeoff until nosewheel touchdown on landing",
      "Primary hazards: INDUCED ROLL and the INDUCED FLOW FIELD (downwash to 1,500 fpm between the vortices)",
      "Relative wingspan is the most significant factor in counteracting induced roll",
    ],
    commonTraps: [
      "Every aircraft producing lift makes a vortex hazard — not just heavies, not only with flaps out.",
    ],
    source: { document: TG, chapter: "Wake Turbulence and Wind Shear", eo: ["2.187", "2.189"] },
  },
  {
    id: "c-wake-strength",
    unit: "u6",
    name: "Vortex strength",
    definition:
      "Vortex strength depends on aircraft weight, speed and wing shape. The greatest vortex strength occurs when the generating aircraft is HEAVY, SLOW and CLEAN.",
    relationships: [
      "Heavy + slow + clean → STRONGEST vortices",
      "Light + fast + dirty → WEAKEST vortices",
      "Flaps down → more lift at the root → smaller tip pressure differential → weaker vortex",
      "Vortex strength correlates directly with induced drag",
    ],
    source: { document: TG, chapter: "Wake Turbulence and Wind Shear", eo: ["2.188"] },
  },
  {
    id: "c-wake-behavior",
    unit: "u6",
    name: "Vortex behaviour",
    definition:
      "Vortices sink at 400–500 fpm and level off about 900 ft below the generating aircraft's flight path. On contact with the ground they move laterally outward at about 5 knots.",
    relationships: [
      "A 4–6 knot crosswind holds the upwind vortex over the touchdown zone",
      "Use caution on parallel runways less than 2,500 ft apart",
      "Vortex core diameter ≈ one quarter of the generating aircraft's wingspan",
    ],
    source: { document: TG, chapter: "Wake Turbulence and Wind Shear", eo: ["2.187"] },
  },
  {
    id: "c-wake-avoidance",
    unit: "u6",
    name: "Wake avoidance procedures",
    definition:
      "Stay ABOVE the other aircraft's flight path. Taking off behind a departing aircraft, rotate BEFORE its rotation point. Landing behind a landing aircraft, touch down BEYOND its touchdown point.",
    relationships: [
      "T-6B minimum TAKEOFF spacing behind a heavy: 2 minutes",
      "T-6B minimum LANDING spacing behind a heavy: 3 minutes",
      "Departing after a larger aircraft LANDED: rotate before its nosewheel touchdown point",
      "Landing after a larger aircraft DEPARTED: touch down before its rotation point",
    ],
    commonTraps: [
      "Takeoff spacing is 2 minutes, landing spacing is 3 minutes. Rotate PRIOR to their liftoff point; land BEYOND their touchdown point.",
    ],
    source: {
      document: TG,
      chapter: "Wake Turbulence and Wind Shear",
      eo: ["2.190", "2.191", "2.192"],
    },
  },
  {
    id: "c-wind-shear",
    unit: "u6",
    name: "Wind shear",
    definition:
      "Wind shear is a sudden change in wind direction and/or speed over a short distance. It momentarily changes indicated airspeed and AOA until the aircraft stabilises in the new air mass.",
    relationships: [
      "Common causes: jet streams, land/sea breezes, fronts, inversions, thunderstorms",
      "Hazardous at low altitude and low airspeed — takeoff and landing",
    ],
    source: { document: TG, chapter: "Wake Turbulence and Wind Shear", eo: ["2.193"] },
  },
  {
    id: "c-wind-shear-performance",
    unit: "u6",
    name: "Increasing vs decreasing performance shear",
    definition:
      "An INCREASING performance shear raises indicated airspeed (increasing headwind or decreasing tailwind), increasing lift and steepening the climb or pushing the aircraft above glidepath. A DECREASING performance shear lowers indicated airspeed, reducing lift — the most hazardous case on landing.",
    relationships: [
      "Headwind component ↓ 20 kt → IAS ↓ 20 kt → lift ↓",
      "Tailwind → headwind on approach → IAS ↑ → balloon above glidepath",
      "A microburst gives an INCREASING shear first, then a strong DECREASING shear",
    ],
    commonTraps: [
      "The initial microburst encounter is a HEADWIND (performance increase). The killer is the decrease that follows.",
    ],
    source: {
      document: TG,
      chapter: "Wake Turbulence and Wind Shear",
      eo: ["2.194", "2.195", "2.196"],
    },
  },
  {
    id: "c-wind-shear-procedures",
    unit: "u6",
    name: "Wind shear procedures",
    definition:
      "Best technique is avoidance — delay, divert or go around. If unavoidable in the T-6B: use the longest suitable runway, set flaps to TAKEOFF, and add up to 10 knots to rotation or approach speed. Establish approach pitch, trim and power by 1,000 ft AGL and resist large power reductions.",
    relationships: [
      "Reported 10-knot loss on final → flaps TAKEOFF, add 10 knots, expect to land long",
    ],
    source: {
      document: TG,
      chapter: "Wake Turbulence and Wind Shear",
      eo: ["2.197", "2.198"],
    },
  },
  /* ================================================================ */
  /* Flight controls, trim, balancing and control feel                 */
  /* EOs 2.117–2.123, taught in the guide as Lesson 2.2 sections 15–19 */
  /* ================================================================ */
  {
    id: "c-primary-controls",
    unit: "u6",
    name: "The three primary flight controls",
    definition:
      "Control surfaces let the pilot change the lift of the airfoil they are attached to. The elevator is on the trailing edge of the horizontal stabiliser and controls pitch about the lateral axis. The ailerons are on the outboard trailing edges of the wings and produce a rolling moment. The rudder is on the trailing edge of the vertical stabiliser and produces a yawing moment.",
    relationships: [
      "Stick forward → elevator DOWN → more camber → more lift → tail up → nose DOWN",
      "Stick left → left aileron UP, right aileron DOWN → rolls left",
      "Right rudder pedal → rudder right → tail flies left → nose yaws RIGHT",
      "Ailerons deflected → the aircraft keeps rolling. Stick centred → rolling stops and the bank holds",
    ],
    commonTraps: [
      "Ailerons move in unison in OPPOSITE directions. One goes up as the other goes down.",
      "A stabilator is the whole horizontal stabiliser moving as one surface — F-15 and F/A-18, not the T-6B.",
      "Spoilers do the opposite of an aileron: they DISRUPT airflow to REDUCE lift and drop that wing.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.117"],
    },
  },
  {
    id: "c-trim-tabs",
    unit: "u6",
    name: "How a trim tab holds trimmed flight",
    definition:
      "A trim tab is attached to the trailing edge of a control surface. Deflect the elevator and airflow creates a force on it acting at a moment arm from the hinge line, producing a moment that tries to return it to neutral — which the pilot must hold. Moving the tab in the OPPOSITE direction creates a small force with a GREATER moment arm, producing a moment that exactly opposes it. Once the sum of the moments is zero the surface stays put.",
    relationships: [
      "Small force × long moment arm = the same moment as a large force × short arm",
      "Sum of moments about the hinge line is zero → the surface holds, hands off",
      "Move a control off its trimmed position and release it → the tab returns it",
    ],
    commonTraps: [
      "For TRIMMING, the tab always moves OPPOSITE the control surface. Trim reduces the force required; it does not hold the aircraft's attitude by itself.",
      "Trim is the PRIMARY purpose of a trim tab. Artificial feel is the second one.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.118"],
    },
  },
  {
    id: "c-t6b-trim",
    unit: "u6",
    name: "Trimming the T-6B",
    definition:
      "Aileron and elevator trim are set from switches on the control stick; rudder trim is on the PCL. There are no aileron trim tabs adjustable in flight — the ailerons themselves move. Rudder trim is adjusted automatically by the trim aid device (TAD) and compensates for prop wash and torque, which vary with power.",
    relationships: [
      "Power INCREASE or slower airspeed → RIGHT rudder trim",
      "Power reduction or faster airspeed → LEFT rudder trim",
      "Elevator trim UP at slower speeds, DOWN at higher speeds",
    ],
    commonTraps: [
      "Power changes take precedence at low speeds.",
      "The T-6B has no in-flight aileron trim TAB; the aileron surface itself deflects when the switch is used.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.118"],
    },
  },
  {
    id: "c-control-balancing",
    unit: "u6",
    name: "Aerodynamic and mass balancing",
    definition:
      "The forces acting at a control surface's aerodynamic centre and at its centre of gravity must be balanced about the hinge line, in order to regulate control pressure, prevent control flutter and provide control-free stability. Aerodynamic balance concerns the forces at the AERODYNAMIC CENTRE; mass balance concerns the forces at the CENTRE OF GRAVITY. Control-free means the pilot is not touching the controls.",
    relationships: [
      "Aerodynamic balance → keeps control pressures at high velocity within reasonable limits",
      "Trailing edge deflects one way → leading edge deflects into the airstream forward of the hinge → that force reduces the effort required",
      "CG forward of the hinge line → more control-free stability (transports, bombers)",
      "CG on or aft of the hinge line → faster response, more manoeuvrable (high performance)",
    ],
    commonTraps: [
      "Aerodynamic balance is about the AERODYNAMIC CENTRE. Mass balance is about the CENTRE OF GRAVITY. The two are different points and different problems.",
      "Three purposes, not one: regulate control pressure, prevent flutter, and provide control-free stability.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.119"],
    },
  },
  {
    id: "c-t6b-balancing",
    unit: "u6",
    name: "Balancing on the T-6B",
    definition:
      "For aerodynamic balance the T-6B uses shielded horns on the elevator and rudder. For mass balancing, weights are placed inside the control surface forward of the hinge line — in the shielded horn and leading edges — which puts the control surface CG exactly ON the hinge line. T-6B aileron mass balancing is achieved with weights in the overhang.",
    relationships: [
      "Shielded horns → aerodynamic balance, on the elevator and rudder",
      "Weights forward of the hinge line → mass balance",
      "CG on the hinge line → a deliberate balance between control response and stability",
    ],
    commonTraps: [
      "The T-6B puts the CG ON the hinge line, not forward or aft of it. Forward is the transport choice; aft is the high-performance one.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.120"],
    },
  },
  {
    id: "c-control-systems",
    unit: "u6",
    name: "The three control systems",
    definition:
      "Conventional controls transfer stick and pedal forces directly to the surfaces through push-pull tubes, pulleys, cables and levers; they are REVERSIBLE, so an external force on a surface moves the cockpit control and gives the pilot feedback. Power-boosted controls add hydraulic, pneumatic or electrical assistance and retain SOME reversibility. Full-power and fly-by-wire systems have no direct connection at all and are NOT reversible, so they require artificial feel.",
    relationships: [
      "Reversibility → feedback → the pilot does not over-control and overstress the aircraft",
      "Boost failure → still controllable, but control forces greatly increased",
      "Not reversible → artificial feel must be manufactured",
    ],
    commonTraps: [
      "The T-6B uses CONVENTIONAL controls.",
      "In a full-power system, moving the stick moves the surface — but moving the surface does NOT move the stick. That is what irreversible means.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.121"],
    },
  },
  {
    id: "c-artificial-feel",
    unit: "u6",
    name: "Artificial feel and the three tab types",
    definition:
      "Artificial feel is any device used to create or enhance control feedback as airspeed and acceleration change. Three types of trim tab provide it. A SERVO tab moves opposite the control surface and helps the pilot deflect it. An ANTI-SERVO tab moves in the same direction and requires more force to hold at full deflection. A NEUTRAL tab maintains a constant angle to the surface when it is deflected.",
    relationships: [
      "Servo → moves OPPOSITE → easier to manoeuvre → generally on ailerons",
      "Anti-servo → moves the SAME direction, faster → more pedal, more resistance → T-6B rudder",
      "Neutral → constant angle to the surface → T-6B elevator and ailerons",
    ],
    commonTraps: [
      "A servo tab and a trimming tab both move opposite the surface, but they are doing different jobs: one lightens the control, the other holds it.",
      "The T-6B rudder's anti-servo tab moves in the same direction at a FASTER rate than the rudder.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.122"],
    },
  },
  {
    id: "c-bobweight-downspring",
    unit: "u6",
    name: "Bobweights and downsprings",
    definition:
      "The T-6B elevator uses a neutral trim tab, two downsprings and a bobweight to give the pilot artificial feel. The downsprings increase the force required to pull the stick aft at LOW AIRSPEEDS. The bobweight increases the force required to pull the stick aft during MANOEUVRING FLIGHT.",
    relationships: [
      "Downsprings → low airspeed",
      "Bobweight → manoeuvring flight, where g is being pulled",
    ],
    commonTraps: [
      "Both make the stick heavier to pull aft, but under different conditions. Downsprings answer to SPEED; the bobweight answers to ACCELERATION.",
      "The T-6B elevator needs all three — neutral tab, two downsprings and a bobweight — because trim tabs alone do not give the desired feel.",
    ],
    source: {
      document: TG,
      chapter: "Lift Production and Drag",
      eo: ["2.123"],
    },
  },
  {
    id: "c-asymmetric-thrust",
    unit: "u6",
    name: "Asymmetric thrust",
    definition:
      "Any aircraft with more than one engine can have directional control problems if one engine fails. The thrust from the operating engine creates a yawing moment TOWARD the dead engine. The farther the engines sit from the longitudinal axis, the greater that moment.",
    relationships: [
      "Engine fails → operating engine yaws the aircraft TOWARD the dead one",
      "Engines farther from the longitudinal axis → greater yawing moment",
      "The yaw may be enough to cause PROVERSE roll",
      "Full opposite RUDDER for the yaw · opposite AILERON for the proverse roll",
    ],
    commonTraps: [
      "The yaw is toward the DEAD engine, not toward the working one.",
      "Every multi-engine aircraft has a minimum directional control speed that must be flown to keep the vertical stabiliser effective after an engine failure.",
    ],
    source: {
      document: TG,
      chapter: "Performance and Maneuvering",
      eo: ["2.186"],
    },
  },
];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);

export const CONCEPT_IDS = CONCEPTS.map((c) => c.id);
