"use client";

/**
 * Chooses the player for an explainer.
 *
 * Rebuilt explainers render as scene-based visual stories; everything not yet
 * migrated keeps the original frame player. One switch, so the migration can
 * land explainer by explainer without a flag day.
 */

import { useMemo } from "react";
import type { Explainer } from "@/lib/types";
import { COURSE_OF_UNIT } from "@/content";
import { useEnsureCourse } from "@/lib/course";
import { LoadingState } from "@/components/ui";
import { makeFramesRenderer } from "./frames-adapter";
import { ScenePlayer } from "./player";
import { SCENE_EXPLAINERS } from "./registry";

/**
 * Every explainer now plays as scenes.
 *
 * A bespoke renderer wins when one exists, because its geometry was rebuilt to
 * teach. Everything else runs its existing diagram through the frames adapter,
 * which gives it the same shell — stage-filling visual, caption on the stage,
 * no transport, and a prediction gate.
 */
export function ExplainerHost({ explainer }: { explainer: Explainer }) {
  const courseReady = useEnsureCourse(COURSE_OF_UNIT[explainer.unit]);
  const bespoke = SCENE_EXPLAINERS[explainer.id];
  const adapted = useMemo(() => makeFramesRenderer(explainer), [explainer]);
  const Render = bespoke ?? adapted;

  if (!courseReady) return <LoadingState label="Loading explainer progress…" fullPage />;

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
