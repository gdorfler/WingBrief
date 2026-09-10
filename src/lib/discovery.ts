import type { LessonScreen } from "./types";

export type DiscoveryScreen = Extract<LessonScreen, { kind: "discovery" }>;
export type Experiment = DiscoveryScreen["experiment"];

/** Relative values, not aircraft performance data. Each experiment changes one variable. */
export function discoveryModel(experiment: Experiment, input: number) {
  const min = experiment === "balance" ? 0 : 1;
  const max = experiment === "balance" ? 1 : 2;
  const value = Math.min(max, Math.max(min, Number.isFinite(input) ? input : min));
  return {
    value, min, max,
    complete: value === max,
    moment: value,
    density: value > 0 ? 1 / value : 1,
    potentialEnergy: value,
    kineticEnergy: 1,
    turning: experiment === "balance" && value === 1,
  };
}
