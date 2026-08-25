"use client";

/**
 * The scene player.
 *
 * Thin by design. It owns the scene index, the header, the controls and the
 * ending — and nothing about how any individual explainer teaches. Each
 * explainer supplies its own stage renderer, because a wind triangle, an
 * engine cutaway and a regulation decision tree do not want the same
 * composition, and forcing them into one recoloured template is exactly how
 * the old system ended up with 93 of 146 explainers running exactly five
 * frames apiece.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, X } from "lucide-react";
import { useProgress } from "@/lib/progress-store";
import { CONCEPT_BY_ID, LESSON_BY_ID } from "@/content";
import { ButtonLink, Pill } from "../ui";
import { MemoryAnchor, SceneControls } from "./stage";

export interface SceneRenderer {
  (props: { scene: number; onResolveGate: (ok: boolean) => void }): React.ReactNode;
  sceneCount: number;
  blocksAt: (scene: number) => boolean;
  nextLabel: (scene: number) => string;
  anchor: string[];
}

export function ScenePlayer({
  id,
  title,
  promise,
  lessonId,
  conceptIds,
  Render,
}: {
  id: string;
  title: string;
  promise: string;
  lessonId?: string;
  conceptIds: string[];
  Render: SceneRenderer;
}) {
  const { state, markExplainerWatched } = useProgress();
  const [scene, setScene] = useState(0);
  const [resolved, setResolved] = useState<Record<number, boolean>>({});
  const [done, setDone] = useState(false);

  const total = Render.sceneCount;
  const lesson = lessonId ? LESSON_BY_ID[lessonId] : undefined;
  const blocked = Render.blocksAt(scene) && !resolved[scene];

  const next = useCallback(() => {
    if (blocked) return;
    setScene((s) => {
      if (s + 1 >= total) {
        setDone(true);
        return s;
      }
      return s + 1;
    });
  }, [blocked, total]);

  useEffect(() => {
    if (done) markExplainerWatched(id);
  }, [done, id, markExplainerWatched]);

  /* Arrow keys move between scenes; the gate still holds. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") setScene((s) => Math.max(0, s - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next]);

  if (done) {
    return (
      <div className="min-h-dvh bg-canvas">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5"
          >
            <div>
              <p className="eyebrow text-brand">Explainer complete</p>
              <h1 className="mt-1 text-2xl leading-tight text-navy">{title}</h1>
            </div>

            <MemoryAnchor lines={Render.anchor} />

            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="eyebrow mb-2 text-navy-faint">Concepts covered</p>
              <div className="flex flex-wrap gap-1.5">
                {conceptIds.map((cid) => {
                  const level = state.mastery[cid]?.level ?? 0;
                  return (
                    <Link key={cid} href={`/review/concept/${cid}`}>
                      <Pill tone={level >= 4 ? "go" : level >= 2 ? "brand" : "neutral"}>
                        {CONCEPT_BY_ID[cid]?.name ?? cid}
                        <span className="tabular ml-0.5 opacity-70">{level}/5</span>
                      </Pill>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setScene(0);
                  setResolved({});
                  setDone(false);
                }}
                className="rounded-xl border border-line bg-surface px-4 py-3 text-[14px] font-bold text-navy transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Watch it again
              </button>
              {lesson ? (
                <ButtonLink href={`/lessons/${lesson.id}`} variant="primary" size="lg">
                  <BookOpen size={16} />
                  Open the lesson
                </ButtonLink>
              ) : (
                <ButtonLink href="/explainers" variant="primary" size="lg">
                  More explainers
                  <ArrowRight size={16} />
                </ButtonLink>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas">
      <header className="shrink-0 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
          <Link
            href="/explainers"
            aria-label="Close explainer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-navy-faint transition-colors hover:bg-surface-2 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-navy">{title}</p>
            <p className="truncate text-[11.5px] font-medium text-navy-faint">{promise}</p>
          </div>
        </div>
      </header>

      <Render
        scene={scene}
        onResolveGate={(ok) => setResolved((r) => ({ ...r, [scene]: ok }))}
      />

      <div className="shrink-0">
        <SceneControls
          index={scene}
          total={total}
          onBack={() => setScene((s) => Math.max(0, s - 1))}
          onNext={next}
          onJump={(i) => setScene(i)}
          nextLabel={Render.nextLabel(scene)}
          blocked={blocked}
        />
      </div>
    </div>
  );
}
