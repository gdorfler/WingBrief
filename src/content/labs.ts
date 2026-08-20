import type { Lab } from "@/lib/types";

/**
 * Sim Lab.
 *
 * These labs teach RELATIONSHIPS, not flight dynamics. Where the trainee guide
 * does not supply a real number, outputs are shown as relative or indexed
 * values rather than invented pounds and knots.
 */
export const LABS: Lab[] = [
  {
    id: "lab-lift",
    title: "Lift Lab",
    subtitle: "L = ½ρV²SC_L, made obvious",
    teaches:
      "Velocity is the only squared term. Doubling it quadruples lift; doubling anything else merely doubles it.",
    unit: "u2",
    conceptIds: ["c-lift-equation", "c-coefficient-of-lift", "c-cl-vs-aoa", "c-flaps-cl"],
    component: "LiftLab",
    chain: ["Velocity ↑", "Dynamic pressure ↑ (as V²)", "Lift ↑ (as V²)"],
  },
  {
    id: "lab-aoa",
    title: "AOA Lab",
    subtitle: "Pitch attitude is not angle of attack",
    teaches:
      "Pitch attitude and flight path angle move independently. AOA is the difference — and only AOA stalls a wing.",
    unit: "u1",
    conceptIds: ["c-pitch-vs-aoa", "c-clmax-aoa"],
    component: "AoaLab",
    chain: ["Flight path ↓ at constant pitch", "AOA ↑", "Approaching CLmax AOA"],
  },
  {
    id: "lab-drag",
    title: "Drag Lab",
    subtitle: "Two curves crossing at L/Dmax",
    teaches:
      "Parasite drag rises with V², induced drag falls with velocity, and their crossing point is minimum total drag.",
    unit: "u3",
    conceptIds: [
      "c-parasite-drag",
      "c-induced-drag-factors",
      "c-total-drag",
      "c-ldmax",
      "c-ground-effect",
    ],
    component: "DragLab",
    chain: [
      "Velocity ↑",
      "Parasite drag ↑ rapidly",
      "Induced drag ↓",
      "L/Dmax where the two are equal",
    ],
  },
  {
    id: "lab-performance",
    title: "Performance Lab",
    subtitle: "Watch the curves shift",
    teaches:
      "Weight moves the curves up and right, altitude moves thrust required right only, and configuration moves them up.",
    unit: "u4",
    conceptIds: [
      "c-thrust-required",
      "c-thrust-available",
      "c-power-required",
      "c-power-available",
      "c-excess-thrust",
      "c-excess-power",
      "c-weight-curve-shift",
      "c-altitude-curve-shift",
      "c-config-curve-shift",
    ],
    component: "PerformanceLab",
    chain: [
      "Gear down",
      "Parasite drag ↑",
      "Thrust required ↑",
      "Excess thrust ↓",
      "Climb performance ↓",
    ],
  },
  {
    id: "lab-turn",
    title: "Turn Lab",
    subtitle: "Bank, load factor and stall speed",
    teaches:
      "Turn performance depends only on airspeed and bank angle — and bank always costs you stall margin.",
    unit: "u5",
    conceptIds: ["c-turn-lift", "c-load-factor", "c-accelerated-stall", "c-turn-rate-radius"],
    component: "TurnLab",
    chain: [
      "Bank angle ↑",
      "Load factor ↑",
      "Lift required ↑",
      "Stall speed ↑",
    ],
  },
  {
    id: "lab-vn",
    title: "V-n Lab",
    subtitle: "Drag your state around the envelope",
    teaches:
      "Below maneuver speed the wing stalls before the structure loads. Above it, the structure is what gives way first.",
    unit: "u5",
    conceptIds: ["c-vn-diagram", "c-maneuver-speed", "c-load-definitions", "c-envelope-factors"],
    component: "VnLab",
    chain: [
      "Airspeed below Va",
      "Accelerated stall line is below the limit load line",
      "The wing stalls first — over-G is impossible",
    ],
  },
  {
    id: "lab-spin",
    title: "Spin Lab",
    subtitle: "Two wings, unequally stalled",
    teaches:
      "Both wings are stalled. It is the ASYMMETRY between them that produces and sustains autorotation.",
    unit: "u6",
    conceptIds: ["c-spin-definition", "c-spin-wings", "c-spin-recovery"],
    component: "SpinLab",
    chain: [
      "Stall + yaw",
      "Down-going wing AOA ↑",
      "Its CL ↓ and drag ↑",
      "Lift differential rolls, drag differential yaws",
      "Autorotation",
    ],
  },
  {
    id: "lab-wake",
    title: "Wake Lab",
    subtitle: "Vortex strength, drift and avoidance",
    teaches:
      "Heavy, slow and clean makes the strongest wake — and the avoidance geometry follows from where the vortices go.",
    unit: "u6",
    conceptIds: ["c-wake-turbulence", "c-wake-strength", "c-wake-behavior", "c-wake-avoidance"],
    component: "WakeLab",
    chain: [
      "Heavy + slow + clean",
      "Vortex strength ↑",
      "Sink 400–500 fpm to 900 ft below",
      "Stay above their path; rotate before, land beyond",
    ],
  },
];

export const LAB_BY_ID: Record<string, Lab> = Object.fromEntries(
  LABS.map((l) => [l.id, l]),
);
