import type { Explainer, SourceReference } from "@/lib/types";

const TG = (chapter: string, eo: string[]): SourceReference => ({
  document: "Aerodynamics Trainee Guide",
  chapter,
  eo,
});

/**
 * Quick Visual Explainers — 60 to 180 seconds each.
 *
 * Each one is a single animated diagram stepped through a handful of frames.
 * The caption never exceeds about fourteen words: if a frame needs a paragraph,
 * it needs to be two frames.
 */
export const EXPLAINERS: Explainer[] = [
  {
    id: "x-what-lift-really-is",
    title: "What Lift Really Is",
    promise: "Two equations, one pressure difference. Not equal transit time.",
    unit: "u2",
    lessonId: "l08-pressure-distribution",
    conceptIds: ["c-pressure-distribution", "c-continuity", "c-bernoulli"],
    diagram: { id: "airfoil-pressure", props: { aoa: 0, camber: 0.06, arrows: false } },
    frames: [
      { caption: "A cambered airfoil in undisturbed air.", hold: 2600, props: { aoa: 0, arrows: false } },
      {
        caption: "The upper streamtube is squeezed into a smaller area.",
        hold: 3200,
        props: { aoa: 0, arrows: false, showTubes: true },
      },
      {
        caption: "Continuity: smaller area means higher velocity.",
        hold: 3200,
        props: { aoa: 0, showTubes: true, showVelocity: true },
      },
      {
        caption: "Bernoulli: higher velocity means lower static pressure.",
        hold: 3400,
        props: { aoa: 0, arrows: true, showVelocity: true },
      },
      {
        caption: "The pressure difference pushes the wing toward the low pressure.",
        hold: 3600,
        props: { aoa: 4, arrows: true, showResultant: true },
      },
      {
        caption: "More angle of attack squeezes harder — more lift.",
        hold: 3600,
        props: { aoa: 12, arrows: true, showResultant: true },
      },
    ],
    predict: {
      at: 1,
      question:
        "The streamtube over the top of the wing is squeezed into a smaller area. What happens to the air in it?",
      options: [
        "It slows down, and static pressure rises",
        "It speeds up, and static pressure falls",
        "Nothing — the wing pushes air down instead",
      ],
      answer: 1,
      because:
        "Two rules in sequence. Continuity says the same mass through a smaller area must move faster; Bernoulli says faster flow has lower static pressure. The wing is then pushed toward the low pressure — which is upward.",
    },
    knowCold: "Continuity then Bernoulli. Lift acts toward the lower static pressure.",
    source: TG("Lift Production and Drag", ["2.82"]),
  },
  {
    id: "x-aoa-in-90-seconds",
    title: "AOA in 90 Seconds",
    promise: "Why the same nose attitude can be safe or stalled.",
    unit: "u1",
    lessonId: "l06-axes-and-aoa",
    conceptIds: ["c-pitch-vs-aoa"],
    diagram: { id: "aoa-vs-pitch", props: { pitch: 0, flightPath: 0 } },
    frames: [
      { caption: "Level flight. Nose on the horizon, flight path level.", hold: 2600, props: { pitch: 2, flightPath: 0 } },
      {
        caption: "Pitch attitude is measured against the HORIZON.",
        hold: 3000,
        props: { pitch: 10, flightPath: 8, highlight: "pitch" },
      },
      {
        caption: "Angle of attack is measured against the RELATIVE WIND.",
        hold: 3200,
        props: { pitch: 10, flightPath: 8, highlight: "aoa" },
      },
      {
        caption: "Hold the nose up but descend — AOA grows sharply.",
        hold: 3400,
        props: { pitch: 10, flightPath: -6, highlight: "aoa" },
      },
      {
        caption: "Nose high, climbing steeply — AOA can be small.",
        hold: 3400,
        props: { pitch: 20, flightPath: 18, highlight: "aoa" },
      },
      {
        caption: "Same pitch attitude, very different AOA. Never infer one from the other.",
        hold: 4000,
        props: { pitch: 10, flightPath: -6, highlight: "both" },
      },
    ],
    knowCold: "Pitch attitude vs horizon. AOA vs relative wind. Unrelated quantities.",
    source: TG("Basic Theory", ["2.65", "2.68"]),
  },
  {
    id: "x-icetg",
    title: "ICE-TG",
    promise: "Five airspeeds, four corrections, one order.",
    unit: "u1",
    lessonId: "l04-airspeed-ladder",
    conceptIds: ["c-icetg"],
    diagram: { id: "icetg-ladder", props: { step: 0 } },
    frames: [
      { caption: "Indicated airspeed — what the instrument shows.", hold: 2600, props: { step: 0 } },
      { caption: "Correct for instrument and position error → Calibrated.", hold: 3000, props: { step: 1 } },
      { caption: "Correct for compressibility → Equivalent.", hold: 3000, props: { step: 2 } },
      { caption: "Correct for density → True. This is your real speed through the air.", hold: 3400, props: { step: 3 } },
      { caption: "Correct for wind → Ground. Your speed over the earth.", hold: 3200, props: { step: 4 } },
      { caption: "TAS = EAS × √(ρ₀/ρ). Above sea level, IAS is always less than TAS.", hold: 3800, props: { step: 5 } },
    ],
    predict: {
      at: 2,
      question:
        "You have corrected indicated for instrument error and for compressibility. Which correction turns that into TRUE airspeed?",
      options: [
        "Wind",
        "Density",
        "Position error",
      ],
      answer: 1,
      because:
        "ICE-TG in order: Indicated, Calibrated, Equivalent, True, Ground. Instrument and position error give calibrated, compressibility gives equivalent, DENSITY gives true, and only wind takes you to ground speed.",
    },
    knowCold: "IAS → CAS → EAS → TAS → GS.",
    source: TG("Basic Theory", ["2.42", "2.46"]),
  },
  {
    id: "x-why-tas-changes-with-altitude",
    title: "Why TAS Changes With Altitude",
    promise: "The needle stays put while you go faster and faster.",
    unit: "u1",
    lessonId: "l04-airspeed-ladder",
    conceptIds: ["c-tas-altitude", "c-density"],
    diagram: { id: "ias-tas-ladder", props: { altitude: 0 } },
    frames: [
      { caption: "Sea level, standard day. TAS equals IAS.", hold: 2800, props: { altitude: 0 } },
      { caption: "Climb. Air density falls.", hold: 2800, props: { altitude: 5000 } },
      { caption: "Thinner air makes less dynamic pressure at the same true speed.", hold: 3400, props: { altitude: 10000 } },
      { caption: "To hold the same indication, you must fly faster.", hold: 3200, props: { altitude: 15000 } },
      { caption: "Roughly +3 knots of TAS per 1,000 ft at constant IAS.", hold: 3600, props: { altitude: 20000 } },
    ],
    predict: {
      at: 1,
      question:
        "You climb holding a constant indicated airspeed. What is your TRUE airspeed doing?",
      options: [
        "Holding steady — that is what indicated means",
        "Rising steadily",
        "Falling with the density",
      ],
      answer: 1,
      because:
        "The indicator measures dynamic pressure, and thinner air makes less of it at the same true speed. To keep the needle where it is you must genuinely fly faster — roughly 3 knots of TAS per 1,000 ft.",
    },
    knowCold: "Constant IAS in a climb means a steadily rising TAS.",
    source: TG("Basic Theory", ["2.45", "2.47"]),
  },
  {
    id: "x-cl-vs-aoa",
    title: "CL vs AOA",
    promise: "The one curve that explains lift, stalls and flaps.",
    unit: "u2",
    lessonId: "l10-cl-vs-aoa",
    conceptIds: ["c-cl-vs-aoa", "c-clmax", "c-flaps-cl"],
    diagram: { id: "cl-vs-aoa", props: { camber: "positive", marker: -2 } },
    frames: [
      { caption: "Below zero AOA a cambered wing already makes some lift.", hold: 2800, props: { marker: -2 } },
      { caption: "CL rises almost linearly as AOA increases.", hold: 3000, props: { marker: 6 } },
      { caption: "The peak is CLmax. That AOA is CLmax AOA — the critical angle.", hold: 3600, props: { marker: 16 } },
      { caption: "Push past it and CL FALLS. That is a stall.", hold: 3400, props: { marker: 20 } },
      { caption: "Flaps down: the whole curve moves up and to the LEFT.", hold: 3600, props: { marker: 14, flaps: true } },
      { caption: "Higher CLmax, but it arrives at a LOWER angle of attack.", hold: 3800, props: { marker: 14, flaps: true } },
    ],
    predict: {
      at: 3,
      question:
        "You lower the flaps. CLmax rises — but what happens to the angle of attack where it occurs?",
      options: [
        "It rises as well",
        "It falls — CLmax arrives at a LOWER AOA",
        "It does not move",
      ],
      answer: 1,
      because:
        "The whole curve shifts up and to the LEFT. You get more maximum lift, but the critical angle arrives sooner, which is why the stall warning comes at a lower nose attitude with flaps down.",
    },
    knowCold: "Flaps down: CLmax ↑, CLmax AOA ↓.",
    source: TG("Lift Production and Drag", ["2.96"]),
  },
  {
    id: "x-why-a-wing-stalls",
    title: "Why a Wing Stalls",
    promise: "Watch the separation point walk forward until CL breaks.",
    unit: "u5",
    lessonId: "l21-the-stall",
    conceptIds: ["c-bl-separation", "c-stall", "c-pressure-gradient"],
    diagram: { id: "stall-progression", props: { aoa: 2 } },
    frames: [
      { caption: "Low AOA. The boundary layer stays attached almost to the trailing edge.", hold: 3000, props: { aoa: 2 } },
      { caption: "The adverse gradient runs from max thickness aft to the trailing edge.", hold: 3400, props: { aoa: 6, showGradient: true } },
      { caption: "More AOA drains the boundary layer's kinetic energy.", hold: 3200, props: { aoa: 10, showGradient: true } },
      { caption: "The separation point marches FORWARD.", hold: 3200, props: { aoa: 14 } },
      { caption: "Far enough forward, the suction collapses and CL drops.", hold: 3600, props: { aoa: 18 } },
      { caption: "That is a stall. Airspeed never entered into it.", hold: 3800, props: { aoa: 22 } },
    ],
    predict: {
      at: 2,
      question:
        "As angle of attack increases, which way does the boundary-layer separation point move?",
      options: [
        "Aft, toward the trailing edge",
        "Forward, toward the leading edge",
        "It stays where the wing is thickest",
      ],
      answer: 1,
      because:
        "More AOA drains the boundary layer's kinetic energy sooner against the adverse pressure gradient, so separation marches FORWARD. Far enough forward and the suction peak collapses and CL drops. Airspeed never entered into it.",
    },
    knowCold: "AOA ↑ → separation moves forward → CL ↓ → stall.",
    source: TG("Stalls", ["3.3", "3.5"]),
  },
  {
    id: "x-parasite-vs-induced",
    title: "Parasite vs Induced Drag",
    promise: "Two drags moving in opposite directions.",
    unit: "u3",
    lessonId: "l13-total-drag-ldmax",
    conceptIds: ["c-parasite-drag", "c-induced-drag", "c-total-drag"],
    diagram: { id: "drag-curves", props: { reveal: "parasite" } },
    frames: [
      { caption: "Parasite drag climbs with velocity squared.", hold: 3000, props: { reveal: "parasite" } },
      { caption: "Induced drag falls as velocity rises — less AOA, weaker vortices.", hold: 3400, props: { reveal: "induced" } },
      { caption: "Add them and you get the U-shaped total drag curve.", hold: 3400, props: { reveal: "total" } },
      { caption: "The minimum is L/Dmax, exactly where the two curves cross.", hold: 3800, props: { reveal: "all", marker: 0.5 } },
      { caption: "Slow side: induced dominates. Fast side: parasite dominates.", hold: 3800, props: { reveal: "all", showRegions: true } },
    ],
    predict: {
      at: 2,
      question:
        "Parasite drag climbs with velocity and induced drag falls with it. What is true at the bottom of the total drag curve?",
      options: [
        "Parasite drag is zero",
        "The two are exactly equal",
        "Induced drag is at its maximum",
      ],
      answer: 1,
      because:
        "The minimum of the sum sits precisely where the two curves cross, so at L/Dmax parasite drag equals induced drag. Slower than that and induced dominates; faster and parasite does.",
    },
    knowCold: "At L/Dmax, parasite drag equals induced drag.",
    source: TG("Lift Production and Drag", ["2.98", "2.100"]),
  },
  {
    id: "x-ldmax-made-simple",
    title: "L/Dmax Made Simple",
    promise: "One point, five different names.",
    unit: "u3",
    lessonId: "l13-total-drag-ldmax",
    conceptIds: ["c-ldmax", "c-max-range", "c-glide"],
    diagram: { id: "drag-curves", props: { marker: 0.5, reveal: "all" } },
    frames: [
      { caption: "The bottom of the total drag curve.", hold: 2800, props: { marker: 0.5, label: "min-drag" } },
      { caption: "Minimum total drag — and therefore minimum thrust required.", hold: 3200, props: { marker: 0.5, label: "min-tr" } },
      { caption: "The greatest ratio of lift to drag: the most EFFICIENT AOA.", hold: 3400, props: { marker: 0.5, label: "efficient" } },
      { caption: "For a turboprop, this is max range.", hold: 3000, props: { marker: 0.5, label: "range" } },
      { caption: "For any aircraft, this is best glide range.", hold: 3200, props: { marker: 0.5, label: "glide" } },
      { caption: "Not maximum lift. Not maximum speed. Wing efficiency, not engine.", hold: 4000, props: { marker: 0.5, label: "caveat" } },
    ],
    predict: {
      at: 2,
      question:
        "L/Dmax is the most efficient angle of attack. Is it also the speed for maximum lift?",
      options: [
        "Yes — the name says maximum",
        "No — it is the best lift-to-drag RATIO, not the most lift",
        "Only in a glide",
      ],
      answer: 1,
      because:
        "It is a ratio, not a maximum of either term. L/Dmax gives minimum total drag, minimum thrust required, max range for a turboprop and best glide range for anything. It is a property of the wing, not the engine.",
    },
    knowCold: "L/Dmax: min drag, min thrust required, max range (prop), best glide.",
    source: TG("Lift Production and Drag", ["2.98"]),
  },
  {
    id: "x-ground-effect",
    title: "Ground Effect",
    promise: "Why the aircraft floats — and why it sinks when you leave.",
    unit: "u3",
    lessonId: "l12-induced-drag",
    conceptIds: ["c-ground-effect", "c-induced-drag"],
    diagram: { id: "ground-effect", props: { heightFraction: 1.6 } },
    frames: [
      { caption: "Well clear of the ground: full downwash, lift vector tilted aft.", hold: 3200, props: { heightFraction: 1.6 } },
      { caption: "Descend within one wingspan and the ground blocks the downwash.", hold: 3400, props: { heightFraction: 0.9 } },
      { caption: "Less downwash lets the total lift vector rotate FORWARD.", hold: 3400, props: { heightFraction: 0.5 } },
      { caption: "Effective lift increases. Induced drag decreases.", hold: 3200, props: { heightFraction: 0.25 } },
      { caption: "Just before touchdown, induced drag is cut by about 60%.", hold: 3600, props: { heightFraction: 0.08 } },
      { caption: "Climb out of it and lift falls while induced drag returns. Do not coast.", hold: 4000, props: { heightFraction: 1.4 } },
    ],
    predict: {
      at: 1,
      question:
        "You descend to within one wingspan of the runway. What does the ground do to the downwash?",
      options: [
        "Increases it, so induced drag rises",
        "Blocks it, so induced drag falls",
        "Nothing until the wheels touch",
      ],
      answer: 1,
      because:
        "With the downwash blocked the total lift vector rotates forward: effective lift goes up and induced drag comes down — by around 60% just before touchdown. Climb out of it and both reverse, which is why you never coast out of ground effect.",
    },
    knowCold: "Within one wingspan: effective lift ↑, induced drag ↓.",
    source: TG("Lift Production and Drag", ["2.94", "2.95"]),
  },
  {
    id: "x-weight-changes-everything",
    title: "Weight Changes Everything",
    promise: "One variable, five consequences.",
    unit: "u4",
    lessonId: "l15-excess-and-shifts",
    conceptIds: ["c-weight-curve-shift", "c-takeoff-distance", "c-stall-speed"],
    diagram: { id: "thrust-curves", props: { weight: 1 } },
    frames: [
      { caption: "Baseline weight. Thrust required curve and its L/Dmax.", hold: 2800, props: { weight: 1 } },
      { caption: "Add weight. More lift needed, so more velocity at the same AOA.", hold: 3400, props: { weight: 1.2 } },
      { caption: "The curve shifts UP and RIGHT. L/Dmax airspeed increases.", hold: 3400, props: { weight: 1.35, ghost: true } },
      { caption: "Thrust available does not change — so excess thrust shrinks.", hold: 3400, props: { weight: 1.35, ghost: true, showExcess: true } },
      { caption: "Climb performance falls. Stall speed rises. Takeoff distance goes up as W².", hold: 4200, props: { weight: 1.35, ghost: true, showExcess: true } },
    ],
    predict: {
      at: 2,
      question:
        "You add weight. Thrust available is unchanged. What happens to your excess thrust and climb performance?",
      options: [
        "Both unchanged — thrust available did not move",
        "Both shrink, because thrust required moved up and right",
        "Excess thrust grows at higher speed",
      ],
      answer: 1,
      because:
        "More weight needs more lift, so the same AOA needs more speed and the whole thrust-required curve shifts up and right. Thrust available stays put, so the gap between them — the excess — closes. Climb falls, stall speed rises, and takeoff distance goes as weight squared.",
    },
    knowCold: "Weight ↑ → curves up and right, excesses down, stall speed up.",
    source: TG("Lift Production and Drag", ["2.112"]),
  },
  {
    id: "x-altitude-curve-shifts",
    title: "Altitude Curve Shifts",
    promise: "The one shift students always get backwards.",
    unit: "u4",
    lessonId: "l15-excess-and-shifts",
    conceptIds: ["c-altitude-curve-shift"],
    diagram: { id: "thrust-power-pair", props: { altitude: 0 } },
    frames: [
      { caption: "Sea level. Thrust required left, power required right.", hold: 3000, props: { altitude: 0 } },
      { caption: "Climb. Density falls, so you need more velocity for the same lift.", hold: 3400, props: { altitude: 8000 } },
      { caption: "But dynamic pressure is unchanged — so drag is unchanged.", hold: 3600, props: { altitude: 8000, highlight: "tr" } },
      { caption: "Thrust required shifts RIGHT only. It does not go up.", hold: 3600, props: { altitude: 15000, highlight: "tr" } },
      { caption: "Power required is thrust × velocity — so it shifts RIGHT AND UP.", hold: 3800, props: { altitude: 15000, highlight: "pr" } },
      { caption: "Both thrust available and power available fall. Excesses shrink.", hold: 3800, props: { altitude: 15000, showAvailable: true } },
    ],
    predict: {
      at: 2,
      question:
        "You climb. The thrust-required curve shifts right. Does it also shift UP?",
      options: [
        "Yes — everything gets harder with altitude",
        "No — dynamic pressure is unchanged, so drag is unchanged",
        "Only above 10,000 ft",
      ],
      answer: 1,
      because:
        "At the same indicated speed the dynamic pressure is the same, so the drag is the same — thrust required moves RIGHT only. Power required is thrust times velocity, and since velocity grew, that one moves right AND up.",
    },
    knowCold: "Altitude: T_R right only. P_R right and up.",
    source: TG("Lift Production and Drag", ["2.113"]),
  },
  {
    id: "x-region-of-reverse-command",
    title: "Region of Reverse Command",
    promise: "Where pulling back makes you go down.",
    unit: "u4",
    lessonId: "l19-glide-reverse-command",
    conceptIds: ["c-reverse-command"],
    diagram: { id: "power-curves", props: { showRegions: true, marker: 0.72 } },
    frames: [
      { caption: "Right of max endurance: the region of NORMAL command.", hold: 3000, props: { marker: 0.75, showRegions: true } },
      { caption: "A gust slows you; a thrust excess appears and speeds you back up. Stable.", hold: 3600, props: { marker: 0.75, showRegions: true, gust: true } },
      { caption: "Left of max endurance: the region of REVERSE command.", hold: 3200, props: { marker: 0.28, showRegions: true } },
      { caption: "A gust slows you; power required RISES and you slow further. Unstable.", hold: 3800, props: { marker: 0.24, showRegions: true, gust: true } },
      { caption: "To fly slower in level flight here, you must ADD power.", hold: 3600, props: { marker: 0.2, showRegions: true } },
      { caption: "Every takeoff and landing happens in or near this region.", hold: 3800, props: { marker: 0.2, showRegions: true } },
    ],
    predict: {
      at: 2,
      question:
        "You are slow, left of max endurance, and a gust slows you further. What happens next if you do nothing?",
      options: [
        "Excess thrust appears and you speed back up",
        "Power required rises and you slow down further",
        "Nothing — airspeed is self-correcting",
      ],
      answer: 1,
      because:
        "That is what makes it REVERSE command: slower needs MORE power, so a speed loss feeds on itself instead of correcting. The fix is throttle, not stick — and every takeoff and landing happens in or near this region.",
    },
    knowCold: "Reverse command: slower needs more power. Fix it with throttle, not stick.",
    source: TG("Performance and Maneuvering", ["2.145", "2.146"]),
  },
  {
    id: "x-why-bank-raises-stall-speed",
    title: "Why Bank Raises Stall Speed",
    promise: "The chain behind the approach-turn accident.",
    unit: "u5",
    lessonId: "l24-turns-load-factor",
    conceptIds: ["c-turn-lift", "c-load-factor", "c-accelerated-stall"],
    diagram: { id: "turn-forces", props: { bank: 0 } },
    frames: [
      { caption: "Wings level. Lift equals weight. Load factor is 1.", hold: 2800, props: { bank: 0 } },
      { caption: "Bank. The lift vector tilts — its vertical part shrinks.", hold: 3200, props: { bank: 30 } },
      { caption: "To hold altitude, TOTAL lift must increase.", hold: 3200, props: { bank: 45, showRequired: true } },
      { caption: "More lift means more load factor. At 60° bank, that is 2 G.", hold: 3600, props: { bank: 60, showRequired: true } },
      { caption: "More lift at the same speed means more AOA — closer to CLmax.", hold: 3600, props: { bank: 60, showAoa: true } },
      { caption: "Stall speed rises by √n. At 2 G that is 40% higher.", hold: 4000, props: { bank: 60, showStall: true } },
    ],
    predict: {
      at: 3,
      question:
        "You roll into a 60° banked level turn. What does that do to stall speed?",
      options: [
        "Nothing — stall is an AOA limit, not a speed",
        "It rises about 40%",
        "It rises about 15%",
      ],
      answer: 1,
      because:
        "Holding altitude in a bank needs more total lift, so load factor rises — 2 G at 60°. Stall speed scales with the square root of load factor, and the square root of 2 is 1.41. The AOA limit has not moved; the speed at which you reach it has.",
    },
    knowCold: "Bank ↑ → n ↑ → lift required ↑ → stall speed × √n.",
    source: TG("Performance and Maneuvering", ["2.163"]),
  },
  {
    id: "x-turn-rate-vs-radius",
    title: "Turn Rate vs Turn Radius",
    promise: "Two numbers, two formulas, one pair of inputs.",
    unit: "u5",
    lessonId: "l24-turns-load-factor",
    conceptIds: ["c-turn-rate-radius"],
    diagram: { id: "turn-geometry", props: { bank: 30, speed: 0.5 } },
    frames: [
      { caption: "Turn rate: degrees of heading per second.", hold: 2800, props: { bank: 30, speed: 0.5, show: "rate" } },
      { caption: "Turn radius: the size of the circle the flight path scribes.", hold: 3000, props: { bank: 30, speed: 0.5, show: "radius" } },
      { caption: "Speed up at the same bank: the circle grows and the rate falls.", hold: 3400, props: { bank: 30, speed: 0.9, show: "both" } },
      { caption: "Bank harder at the same speed: the circle shrinks and the rate rises.", hold: 3400, props: { bank: 60, speed: 0.5, show: "both" } },
      { caption: "Weight appears in neither formula. It cannot change the turn.", hold: 3800, props: { bank: 60, speed: 0.5, show: "formulas" } },
    ],
    predict: {
      at: 3,
      question:
        "Two aircraft, same airspeed and same bank angle, but one is far heavier. Whose turn is tighter?",
      options: [
        "The lighter one",
        "Neither — the turns are identical",
        "The heavier one",
      ],
      answer: 1,
      because:
        "Weight appears in neither formula. Rate is g·tan(bank)/V and radius is V²/(g·tan(bank)) — airspeed and bank angle, nothing else. Weight changes what it costs you to hold the turn, not the geometry of the turn.",
    },
    knowCold: "ω = g tan φ / V · r = V² / (g tan φ). Airspeed and bank only.",
    source: TG("Performance and Maneuvering", ["2.158", "2.160"]),
  },
  {
    id: "x-vn-diagram",
    title: "The V-n Diagram",
    promise: "Every structural limit you have, in one box.",
    unit: "u5",
    lessonId: "l25-vn-diagram",
    conceptIds: ["c-vn-diagram", "c-maneuver-speed", "c-load-definitions"],
    diagram: { id: "vn-diagram", props: { reveal: 0 } },
    frames: [
      { caption: "Indicated airspeed across the bottom, load factor up the side.", hold: 3000, props: { reveal: 1 } },
      { caption: "The curved lines on the left are the accelerated stall lines, set by CLmax AOA.", hold: 3600, props: { reveal: 2 } },
      { caption: "The flat lines top and bottom are the limit load factors.", hold: 3200, props: { reveal: 3 } },
      { caption: "The vertical line on the right is redline, V_NE.", hold: 3000, props: { reveal: 4 } },
      { caption: "Where the stall line meets the limit load is the maneuver point.", hold: 3600, props: { reveal: 5 } },
      { caption: "Below Va you stall before you over-G. Above it, you can break the aircraft.", hold: 4200, props: { reveal: 6 } },
    ],
    predict: {
      at: 3,
      question:
        "You haul back hard on the stick below manoeuvre speed, Va. What happens?",
      options: [
        "You exceed the limit load and damage the aircraft",
        "You stall before you can over-G",
        "Nothing — Va is only about gust loads",
      ],
      answer: 1,
      because:
        "Below Va the accelerated stall line is reached before the limit load line, so the wing gives up first and protects the structure. Above Va that protection is gone and full deflection can break the aeroplane. The corner where those two lines meet IS the manoeuvre point.",
    },
    knowCold: "Maneuver point = accelerated stall line ∩ limit load. Below Va you cannot over-G.",
    source: TG("Performance and Maneuvering", ["2.166", "2.167"]),
  },
  {
    id: "x-why-spins-happen",
    title: "Why Spins Happen",
    promise: "Two stalled wings, unequally stalled.",
    unit: "u6",
    lessonId: "l27-spins",
    conceptIds: ["c-spin-definition", "c-spin-wings"],
    diagram: { id: "spin-wings", props: { yaw: 0 } },
    frames: [
      { caption: "Both wings stalled, no yaw. Symmetric — no rotation.", hold: 3000, props: { yaw: 0 } },
      { caption: "Introduce yaw. One wing goes down, the other goes up.", hold: 3200, props: { yaw: 0.4 } },
      { caption: "The down-going wing meets a roll relative wind from below.", hold: 3400, props: { yaw: 0.7, showRelWind: true } },
      { caption: "Its AOA is higher. It is MORE stalled: lower CL, higher drag.", hold: 3800, props: { yaw: 1, showRelWind: true, showCoeffs: true } },
      { caption: "The lift difference sustains the roll.", hold: 3200, props: { yaw: 1, highlight: "lift" } },
      { caption: "The drag difference sustains the yaw. Together: autorotation.", hold: 3800, props: { yaw: 1, highlight: "drag" } },
    ],
    predict: {
      at: 2,
      question:
        "Both wings are stalled and yaw is introduced. What is different about the DOWN-going wing?",
      options: [
        "It is less stalled — it has more airspeed",
        "It is MORE stalled — its AOA is higher",
        "Both wings behave identically",
      ],
      answer: 1,
      because:
        "The down-going wing meets a roll relative wind from below, which raises its angle of attack further. So it makes less lift and more drag than the up-going wing — the lift difference sustains the roll and the drag difference sustains the yaw. That is autorotation.",
    },
    knowCold: "Down-going wing is more stalled. Lift differential rolls, drag differential yaws.",
    source: TG("Spins", ["3.19", "3.21"]),
  },
  {
    id: "x-wake-turbulence",
    title: "Wake Turbulence",
    promise: "Where the vortices go, and where you should be.",
    unit: "u6",
    lessonId: "l29-wake-turbulence",
    conceptIds: ["c-wake-turbulence", "c-wake-behavior", "c-wake-avoidance"],
    diagram: { id: "wake-vortex", props: { time: 0 } },
    frames: [
      { caption: "Vortices begin the instant the nosewheel leaves the runway.", hold: 3000, props: { time: 0.1 } },
      { caption: "They sink at 400 to 500 feet per minute.", hold: 3200, props: { time: 0.4 } },
      { caption: "They level off about 900 feet below the generating flight path.", hold: 3400, props: { time: 0.7 } },
      { caption: "On the ground they drift outward at about 5 knots.", hold: 3400, props: { time: 1, showGround: true } },
      { caption: "Stay ABOVE their flight path. Rotate before their rotation point.", hold: 3800, props: { time: 1, showAvoidance: "takeoff" } },
      { caption: "Landing: stay at or above the approach path, touch down BEYOND theirs.", hold: 4000, props: { time: 1, showAvoidance: "landing" } },
    ],
    predict: {
      at: 2,
      question:
        "You are landing behind a heavy. Where should you touch down relative to its touchdown point?",
      options: [
        "Short of it",
        "Beyond it",
        "Exactly on it",
      ],
      answer: 1,
      because:
        "The vortices start where its nosewheel left the ground and stop where its wheels touched, so beyond that point the runway is clean. Stay at or above its approach path on the way in, and on departure rotate BEFORE its rotation point.",
    },
    knowCold: "Sink 400–500 fpm, level 900 ft below, drift 5 kt. Stay above; rotate before, land beyond.",
    source: TG("Wake Turbulence and Wind Shear", ["2.187", "2.191", "2.192"]),
  },
  {
    id: "x-wind-shear",
    title: "Wind Shear",
    promise: "Why the microburst gives you good news first.",
    unit: "u6",
    lessonId: "l30-wind-shear",
    conceptIds: ["c-wind-shear", "c-wind-shear-performance"],
    diagram: { id: "wind-shear", props: { phase: 0 } },
    frames: [
      { caption: "Stabilised on glidepath, trimmed for a constant airspeed descent.", hold: 3000, props: { phase: 0 } },
      { caption: "Enter the outflow: a sudden headwind. IAS jumps.", hold: 3200, props: { phase: 1 } },
      { caption: "More lift — the aircraft balloons above glidepath.", hold: 3200, props: { phase: 2 } },
      { caption: "The instinct is nose down and power back. Both are about to hurt.", hold: 3600, props: { phase: 3 } },
      { caption: "Cross the core: the headwind becomes a tailwind. IAS collapses.", hold: 3600, props: { phase: 4 } },
      { caption: "Lift falls with the nose already low and the power already back.", hold: 4200, props: { phase: 5 } },
    ],
    predict: {
      at: 2,
      question:
        "Entering the outflow your airspeed jumps and you balloon above glidepath. What does instinct say — and is it right?",
      options: [
        "Nose down and power back, and yes",
        "Nose down and power back, and no — the tailwind is coming",
        "Add power, and yes",
      ],
      answer: 1,
      because:
        "Both instinctive corrections spend the energy the shear just lent you. Cross the core and the headwind becomes a tailwind: airspeed collapses with the nose already low and the power already back. The performance increase is the warning, not the gift.",
    },
    knowCold: "Microburst: performance increase FIRST, then the decrease that kills.",
    source: TG("Wake Turbulence and Wind Shear", ["2.194", "2.195", "2.196"]),
  },
  {
    id: "x-equilibrium-vs-trimmed",
    title: "Equilibrium vs Trimmed",
    promise: "One implies the other. Only in one direction.",
    unit: "u1",
    lessonId: "l01-language-of-motion",
    conceptIds: ["c-equilibrium", "c-trimmed"],
    diagram: { id: "equilibrium-forces", props: { mode: "level" } },
    frames: [
      { caption: "Straight and level. Forces cancel, moments cancel. Equilibrium.", hold: 3000, props: { mode: "level" } },
      { caption: "A steady climb at constant airspeed. Still no acceleration.", hold: 3400, props: { mode: "climb" } },
      { caption: "That is equilibrium too — equilibrium does not mean level.", hold: 3200, props: { mode: "climb" } },
      { caption: "A constant-bank turn. Moments cancel, so it is trimmed.", hold: 3400, props: { mode: "turn" } },
      { caption: "But the turn is an acceleration. Forces do not cancel. Not equilibrium.", hold: 3800, props: { mode: "turn" } },
      { caption: "Equilibrium always implies trimmed. Trimmed does not imply equilibrium.", hold: 4000, props: { mode: "summary" } },
    ],
    predict: {
      at: 2,
      question:
        "A steady, constant-bank level turn. Moments cancel, so it is trimmed. Is it in equilibrium?",
      options: [
        "Yes — nothing is changing",
        "No — a turn is an acceleration, so forces do not cancel",
        "Only if the bank is under 30°",
      ],
      answer: 1,
      because:
        "Equilibrium needs forces AND moments to cancel; trimmed needs only moments. A turn is a continuous acceleration toward the centre, so it is trimmed but not in equilibrium. Equilibrium always implies trimmed — never the other way round.",
    },
    knowCold: "Forces AND moments = equilibrium. Moments only = trimmed.",
    source: TG("Basic Theory", ["2.15", "2.16"]),
  },
  {
    id: "x-why-humid-air-is-thin",
    title: "Why Humid Air Is Thin",
    promise: "The one atmospheric relationship people get backwards.",
    unit: "u1",
    lessonId: "l02-atmosphere",
    conceptIds: ["c-humidity-density", "c-4h-club"],
    diagram: { id: "humidity-density", props: { humidity: 0 } },
    frames: [
      { caption: "Dry air: a fixed number of particles in this volume.", hold: 3000, props: { humidity: 0 } },
      { caption: "Add water vapour. Each water molecule displaces an air molecule.", hold: 3400, props: { humidity: 0.4 } },
      { caption: "The particle COUNT is unchanged.", hold: 3000, props: { humidity: 0.7 } },
      { caption: "But water molecules have less mass than the air they replaced.", hold: 3400, props: { humidity: 1 } },
      { caption: "Same volume, less mass — so density falls.", hold: 3400, props: { humidity: 1, showDensity: true } },
      { caption: "Humid means thin. Thin means longer takeoff rolls.", hold: 3800, props: { humidity: 1, showPerformance: true } },
    ],
    predict: {
      at: 2,
      question:
        "Water vapour displaces air molecules one for one, so the particle count is unchanged. Why is humid air less dense?",
      options: [
        "It is not — density is unchanged",
        "A water molecule has less mass than the air molecule it replaced",
        "Water vapour occupies more volume",
      ],
      answer: 1,
      because:
        "Same volume, same particle count, but each swap trades a heavier molecule for a lighter one — so total mass falls and density with it. Humid means thin, and thin means longer takeoff rolls and worse climb.",
    },
    knowCold: "Humidity ↑ → density ↓ → performance ↓.",
    source: TG("Basic Theory", ["2.23", "2.24"]),
  },
];

export const EXPLAINER_BY_ID: Record<string, Explainer> = Object.fromEntries(
  EXPLAINERS.map((e) => [e.id, e]),
);
