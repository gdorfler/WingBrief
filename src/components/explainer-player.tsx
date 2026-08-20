"use client";

/**
 * Quick Visual Explainer player.
 *
 * A single parametric diagram stepped through a handful of frames, each with
 * one short caption. Auto-plays by default; scrubbing and replay are always
 * available. No narration, no talking head — the diagram is the explanation.
 */

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Explainer } from "@/lib/types";
import { CONCEPT_BY_ID, LESSON_BY_ID } from "@/content";
import { useProgress } from "@/lib/progress-store";
import { DiagramHost } from "./diagrams/registry";
import { Button, ButtonLink, Pill, ProgressBar, cn } from "./ui";

export function ExplainerPlayer({ explainer }: { explainer: Explainer }) {
  const { state, markExplainerWatched } = useProgress();
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [completed, setCompleted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const frames = explainer.frames;
  const current = frames[frame];
  const lesson = LESSON_BY_ID[explainer.lessonId];
  const alreadyWatched = state.watchedExplainerIds.includes(explainer.id);

  // Props accumulate across frames so a frame only needs to state what changes.
  const props = useMemo(() => {
    let acc = { ...(explainer.diagram.props ?? {}) };
    for (let i = 0; i <= frame; i++) acc = { ...acc, ...(frames[i].props ?? {}) };
    return acc;
  }, [explainer.diagram.props, frame, frames]);

  const advance = useCallback(() => {
    setFrame((f) => {
      if (f + 1 >= frames.length) {
        setPlaying(false);
        setCompleted(true);
        return f;
      }
      return f + 1;
    });
  }, [frames.length]);

  useEffect(() => {
    if (!playing) return;
    timer.current = setTimeout(advance, current.hold);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [advance, current.hold, frame, playing]);

  useEffect(() => {
    if (completed) markExplainerWatched(explainer.id);
  }, [completed, explainer.id, markExplainerWatched]);

  const go = (n: number) => {
    setPlaying(false);
    setFrame(Math.max(0, Math.min(frames.length - 1, n)));
  };

  const replay = () => {
    setFrame(0);
    setPlaying(true);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/explainers"
            aria-label="Close explainer"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-navy-faint transition-colors hover:bg-surface-2 hover:text-navy"
          >
            <X size={19} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-[12.5px] font-semibold text-navy">{explainer.title}</p>
              <span className="tabular shrink-0 text-[11.5px] font-bold text-navy-faint">
                {frame + 1} / {frames.length}
              </span>
            </div>
            <div className="mt-1.5 flex gap-1">
              {frames.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Frame ${i + 1}`}
                  onClick={() => go(i)}
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3"
                >
                  <span
                    className={cn(
                      "block h-full rounded-full bg-brand transition-all",
                      i < frame ? "w-full" : i === frame ? "w-full opacity-80" : "w-0",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5 pb-32">
        <p className="eyebrow mb-2 text-brand">Visual explainer</p>
        <h1 className="text-2xl leading-tight text-navy">{explainer.title}</h1>
        <p className="mt-1.5 text-[14px] leading-relaxed text-navy-soft">{explainer.promise}</p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface p-3">
          <DiagramHost id={explainer.diagram.id} props={props} />
        </div>

        <motion.p
          key={frame}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 min-h-[3.5rem] rounded-2xl bg-ink-800 px-4 py-3.5 text-[15px] font-semibold leading-snug text-white"
        >
          {current.caption}
        </motion.p>

        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-5 space-y-4"
          >
            <div className="rounded-2xl border border-gold/30 bg-gold-soft p-4">
              <p className="eyebrow text-gold">Know cold</p>
              <p className="mt-1 text-[15px] font-bold leading-snug text-navy">
                {explainer.knowCold}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4">
              <p className="eyebrow mb-2 text-navy-faint">Concepts covered</p>
              <div className="flex flex-wrap gap-1.5">
                {explainer.conceptIds.map((id) => {
                  const level = state.mastery[id]?.level ?? 0;
                  return (
                    <Link key={id} href={`/review/concept/${id}`}>
                      <Pill tone={level >= 4 ? "go" : level >= 2 ? "brand" : "neutral"}>
                        {CONCEPT_BY_ID[id]?.name ?? id}
                        <span className="tabular ml-0.5 opacity-70">{level}/5</span>
                      </Pill>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {lesson && (
                <ButtonLink href={`/lessons/${lesson.id}`} variant="secondary" size="lg">
                  <BookOpen size={16} />
                  Open the lesson
                </ButtonLink>
              )}
              <ButtonLink href="/explainers" variant="primary" size="lg">
                More explainers
                <ArrowRight size={16} />
              </ButtonLink>
            </div>

            {alreadyWatched && (
              <p className="flex items-center justify-center gap-1.5 text-[12px] font-semibold text-go">
                <Check size={13} strokeWidth={3} /> Marked as watched
              </p>
            )}
          </motion.div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => go(frame - 1)}
            disabled={frame === 0}
            aria-label="Previous frame"
          >
            <ChevronLeft size={18} />
          </Button>
          {completed ? (
            <Button variant="secondary" size="lg" fullWidth onClick={replay}>
              <RotateCcw size={16} />
              Replay
            </Button>
          ) : (
            <Button
              variant={playing ? "secondary" : "primary"}
              size="lg"
              fullWidth
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
              {playing ? "Pause" : "Play"}
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            onClick={() => go(frame + 1)}
            disabled={frame === frames.length - 1}
            aria-label="Next frame"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
        <div className="mx-auto mt-2 max-w-3xl">
          <ProgressBar value={(frame + 1) / frames.length} tone="brand" height={4} />
        </div>
      </footer>
    </div>
  );
}
