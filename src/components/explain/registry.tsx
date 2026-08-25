"use client";

/**
 * Which explainers have been rebuilt as scene-based visual stories.
 *
 * The migration is deliberately incremental: an id in here renders through the
 * new scene player, and everything else keeps working on the old frame player
 * untouched. That keeps 146 explainers shipping while the rebuilt ones land a
 * few at a time.
 */

import type { SceneRenderer } from "./player";
import { AoaExplainer } from "./aoa";
import { EngineFlowExplainer } from "./engine-flow";
import { MicroburstExplainer } from "./microburst";

export const SCENE_EXPLAINERS: Record<string, SceneRenderer> = {
  "x-aoa-in-90-seconds": AoaExplainer as unknown as SceneRenderer,
  "ex-air-through-engine": EngineFlowExplainer as unknown as SceneRenderer,
  "wx-x-microburst": MicroburstExplainer as unknown as SceneRenderer,
};

export function hasSceneVersion(id: string): boolean {
  return id in SCENE_EXPLAINERS;
}
