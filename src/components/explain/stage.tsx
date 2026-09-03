"use client";

/**
 * The explainer shell.
 *
 * The old player put a title, a promise, a bordered card, a dark caption bar
 * and a video transport on one scrolling page, and the teaching visual came
 * out at 47% of the viewport on desktop and 24% on a phone. The diagram was
 * the smallest thing on screen in a product whose whole claim is that the
 * diagram IS the explanation.
 *
 * This inverts it. The stage is the page: it fills the space between a thin
 * header and a thin control bar, the visual is drawn edge to edge inside it,
 * and the teaching line sits ON the stage as a caption rather than under it in
 * a box competing for the eye. Chrome earns its pixels or it is not there.
 */

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../ui";
import { GrammarSprite } from "./grammar";

/* ------------------------------------------------------------------ */
/* Stage                                                               */
/* ------------------------------------------------------------------ */

export function Stage({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-surface", className)}>
      <GrammarSprite />
      {/* From sm up the caption floats over the stage, so the drawing area
          reserves a band for it. Without this a scene that genuinely fills its
          frame — the two-up comparison — gets its own numbers covered up. */}
      <div className="relative min-h-0 flex-1 sm:pb-24">{children}</div>
      {caption && (
        <div className="relative z-10 shrink-0 sm:absolute sm:inset-x-0 sm:bottom-0">{caption}</div>
      )}
    </div>
  );
}

/**
 * The teaching line.
 *
 * One idea, in the student's field of view, over the visual rather than under
 * it. Deliberately not a filled dark bar — that bar was the loudest element on
 * the old screen and pulled the eye off the diagram every time it changed.
 */
export function SceneIdea({
  children,
  sub,
  tone = "default",
}: {
  children: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "reveal";
}) {
  return (
    <div className="pointer-events-none border-t border-line p-3.5 sm:border-t-0 sm:p-5">
      <motion.div
        key={String(children)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "mx-auto max-w-2xl px-1 py-0 sm:rounded-xl sm:px-4 sm:py-3 sm:ring-1 sm:backdrop-blur-sm",
          tone === "reveal"
            ? "sm:bg-go-soft/92 sm:ring-go/30"
            : "sm:bg-surface/86 sm:ring-line",
        )}
      >
        <p
          className={cn(
            "text-[15px] font-bold leading-snug sm:text-[16.5px]",
            tone === "reveal" ? "text-go-dark" : "text-navy",
          )}
        >
          {children}
        </p>
        {sub && (
          <p className="mt-1 text-[12.5px] font-medium leading-snug text-navy-soft">{sub}</p>
        )}
      </motion.div>
    </div>
  );
}

/** A small chip pinned to a stage corner — scene counter, mode, units. */
export function StageChip({
  children,
  corner = "tl",
}: {
  children: ReactNode;
  corner?: "tl" | "tr";
}) {
  return (
    <div
      className={cn(
        "absolute top-3 z-10 rounded-full bg-surface-2/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-navy-faint ring-1 ring-line backdrop-blur-sm",
        corner === "tl" ? "left-3" : "right-3",
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Prediction gate                                                     */
/* ------------------------------------------------------------------ */

/**
 * Stop, commit, then reveal.
 *
 * The single most important difference between this system and the old one:
 * at least once per explainer the animation refuses to continue until the
 * student has said what they think happens. Passive viewing produces
 * recognition; committing to an answer first is what produces recall.
 */
export function PredictionGate({
  question,
  options,
  answer,
  chosen,
  onChoose,
  because,
}: {
  question: string;
  options: string[];
  answer: number;
  chosen: number | null;
  onChoose: (i: number) => void;
  because?: string;
}) {
  const settled = chosen !== null;
  return (
    <div className="pointer-events-auto border-t border-line p-3.5 sm:border-t-0 sm:p-5">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl rounded-xl p-1 sm:bg-surface/95 sm:p-4 sm:ring-1 sm:ring-line sm:backdrop-blur-md"
      >
        <p className="eyebrow mb-2 text-brand">Predict first</p>
        <p className="text-[15px] font-bold leading-snug text-navy">{question}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {options.map((o, i) => {
            const isAnswer = i === answer;
            const isChosen = i === chosen;
            return (
              <button
                key={o}
                type="button"
                onClick={() => !settled && onChoose(i)}
                disabled={settled}
                aria-pressed={isChosen}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-[13.5px] font-bold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                  !settled && "bg-surface-2 text-navy hover:bg-brand-soft hover:text-brand-dark",
                  settled && isAnswer && "bg-go-soft text-go-dark ring-2 ring-go",
                  settled && !isAnswer && isChosen && "bg-nogo-soft text-nogo ring-2 ring-nogo",
                  settled && !isAnswer && !isChosen && "bg-surface-2 text-navy-faint",
                )}
              >
                {o}
              </button>
            );
          })}
        </div>
        {settled && because && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-3 text-[13px] font-medium leading-relaxed text-navy-soft"
          >
            {because}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Memory anchor                                                       */
/* ------------------------------------------------------------------ */

/**
 * The one line that compresses what was just watched.
 *
 * Deliberately at the END and nowhere else. The old player showed a Know Cold
 * panel that mostly restated the caption the student had read four seconds
 * earlier, which teaches nothing and trains people to skip panels.
 */
export function MemoryAnchor({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl border border-gold/30 bg-gold-soft p-4">
      <p className="eyebrow mb-2 text-gold">Know cold</p>
      <ul className="space-y-1.5">
        {lines.map((l) => (
          <li key={l} className="flex gap-2 text-[14.5px] font-bold leading-snug text-navy">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Controls                                                            */
/* ------------------------------------------------------------------ */

/**
 * Staged learning is not video, so it does not get a video transport.
 *
 * There is no Pause, because nothing is running away from the student — a
 * scene holds until they advance it. The primary action names what happens
 * next in teaching terms, which is also what makes the gate legible: when a
 * prediction is pending the button says so instead of going quietly disabled.
 */
export function SceneControls({
  index,
  total,
  onBack,
  onNext,
  nextLabel,
  blocked,
  onJump,
}: {
  index: number;
  total: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
  blocked?: boolean;
  onJump: (i: number) => void;
}) {
  return (
    <div className="border-t border-line bg-surface px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={index === 0}
          className={cn(
            "shrink-0 rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            index === 0
              ? "cursor-not-allowed text-navy-faint/45"
              : "text-navy-soft hover:bg-surface-2 hover:text-navy",
          )}
        >
          Back
        </button>

        {/* Scene ticks double as a jump target and as a progress readout. */}
        <div className="flex min-w-0 flex-1 gap-1.5" role="tablist" aria-label="Scenes">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Scene ${i + 1} of ${total}`}
              onClick={() => onJump(i)}
              className="group h-6 flex-1 focus-visible:outline-none"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all group-focus-visible:ring-2 group-focus-visible:ring-brand",
                  i < index && "bg-brand/45",
                  i === index && "bg-brand",
                  i > index && "bg-surface-3 group-hover:bg-line-strong",
                )}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={blocked}
          className={cn(
            "shrink-0 rounded-lg px-4 py-2.5 text-[13.5px] font-bold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
            blocked
              ? "cursor-not-allowed bg-surface-2 text-navy-faint"
              : "bg-brand text-white hover:bg-brand-dark",
          )}
        >
          {blocked ? "Answer first" : nextLabel}
        </button>
      </div>
    </div>
  );
}
