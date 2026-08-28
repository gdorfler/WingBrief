"use client";

/**
 * The bridge from the old frame model to the new scene system.
 *
 * Five explainers are bespoke: their geometry was rebuilt so the drawing itself
 * teaches. The other 141 already own a perfectly good parametric diagram — what
 * they lacked was everything AROUND the diagram. They rendered it in a bordered
 * card at 47% of the viewport, auto-played through it, put the sentence in a
 * dark bar that pulled the eye off the picture, and never once asked the student
 * to commit to anything.
 *
 * So this adapter does not redraw them. It gives every frame-based explainer the
 * scene shell: the diagram fills the stage, the caption sits on the stage
 * instead of under it, the transport is gone, and a prediction gate stops the
 * sequence at the moment the explainer is actually about to teach something.
 *
 * A bespoke renderer in the registry always wins. This is the floor, not the
 * ceiling — an explainer graduates out of here when its diagram is rebuilt.
 */

import { useRef, useState } from "react";
import type { Explainer } from "@/lib/types";
import { DiagramHost } from "../diagrams/registry";
import type { SceneRenderer } from "./player";
import { PredictionGate, SceneIdea, Stage, StageChip } from "./stage";
import { revealKey, useRevealEntrance, useTweenedProps } from "./motion";

/** Know Cold is one line; an anchor wants the two or three facts inside it. */
function anchorFor(e: Explainer): string[] {
  if (e.anchor?.length) return e.anchor;
  const parts = e.knowCold
    .split(/\s+·\s+|\s+—\s+(?=[A-Z])/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [e.knowCold];
}

export function makeFramesRenderer(e: Explainer): SceneRenderer {
  const frames = e.frames;
  /**
   * The gate is its own scene, inserted AFTER the frame it hangs off.
   *
   * Replacing that frame's caption with the question would silently delete a
   * teaching line, so instead the gate holds the same picture and asks what
   * happens next — which is the state the student needs to be looking at while
   * they commit. Scenes after the gate map back one frame.
   */
  const gateAt = e.predict ? Math.min(Math.max(e.predict.at, 0), frames.length - 1) : -1;
  const gateScene = gateAt < 0 ? -1 : gateAt + 1;
  const total = frames.length + (gateScene < 0 ? 0 : 1);
  const frameFor = (n: number) => (gateScene < 0 || n <= gateAt ? n : n - 1);

  function Render({
    scene,
    onResolveGate,
  }: {
    scene: number;
    onResolveGate: (ok: boolean) => void;
  }) {
    const [choice, setChoice] = useState<number | null>(null);
    const n = Math.min(Math.max(scene, 0), total - 1);
    const i = frameFor(n);
    const f = frames[i];

    /* Props accumulate, so a frame only has to state what changed — the same
     * contract the frames were authored against. */
    let props: Record<string, unknown> = { ...(e.diagram.props ?? {}) };
    for (let k = 0; k <= i; k++) props = { ...props, ...(frames[k].props ?? {}) };

    /*
     * Numbers ease to their new value instead of jumping, so the wing rotates
     * from 4 degrees to 12 rather than teleporting, and whatever the scene
     * reveals fades in while the settled drawing steps back.
     */
    const shown = useTweenedProps(props, n);
    const figure = useRef<HTMLDivElement>(null);
    useRevealEntrance(figure, revealKey(shown));

    const gate = n === gateScene && e.predict ? e.predict : null;

    const caption = gate ? (
      <PredictionGate
        question={gate.question}
        options={gate.options}
        answer={gate.answer}
        chosen={choice}
        because={gate.because}
        onChoose={(n) => {
          setChoice(n);
          onResolveGate(true);
        }}
      />
    ) : (
      <SceneIdea sub={f.sub} tone={f.tone}>
        {f.caption}
      </SceneIdea>
    );

    return (
      <Stage caption={caption}>
        <StageChip>
          Scene {n + 1} / {total}
        </StageChip>

        {/* wb-stage-figure lets the diagram fill the stage rather than sit in a
            fixed-width card — the single change that moves 141 explainers from
            a 47% visual to a stage-filling one. */}
        <div
          ref={figure}
          className="wb-stage-figure flex h-full w-full items-center justify-center p-3 sm:p-5"
        >
          <DiagramHost id={e.diagram.id} props={shown} />
        </div>
      </Stage>
    );
  }

  const R = Render as unknown as SceneRenderer;
  R.sceneCount = total;
  R.blocksAt = (n: number) => n === gateScene;
  R.nextLabel = (n: number) => {
    if (n === gateScene) return "Reveal";
    if (n >= total - 1) return "Finish";
    return "Next";
  };
  R.anchor = anchorFor(e);
  return R;
}
