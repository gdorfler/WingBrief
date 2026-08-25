"use client";

/**
 * Chooses the player for an explainer.
 *
 * Rebuilt explainers render as scene-based visual stories; everything not yet
 * migrated keeps the original frame player. One switch, so the migration can
 * land explainer by explainer without a flag day.
 */

import type { Explainer } from "@/lib/types";
import { ExplainerPlayer } from "../explainer-player";
import { ScenePlayer } from "./player";
import { SCENE_EXPLAINERS } from "./registry";

export function ExplainerHost({ explainer }: { explainer: Explainer }) {
  const Render = SCENE_EXPLAINERS[explainer.id];
  if (!Render) return <ExplainerPlayer explainer={explainer} />;

  return (
    <ScenePlayer
      id={explainer.id}
      title={explainer.title}
      promise={explainer.promise}
      lessonId={explainer.lessonId}
      conceptIds={explainer.conceptIds}
      Render={Render}
    />
  );
}
