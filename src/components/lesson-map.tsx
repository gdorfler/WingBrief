"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Check, Lock, RotateCcw } from "lucide-react";
import type { Lesson, Unit } from "@/lib/types";
import type { LessonNodeState } from "@/lib/review";
import { clearLessonCompletedSignal } from "@/lib/route-marker-signal";
import { cn } from "./ui";

const LABELS: Record<LessonNodeState, string> = {
  locked: "Locked", current: "Next lesson", completed: "Complete",
  perfect: "Perfect", mastered: "Mastered", weak: "Needs review",
};

/** A quiet course outline. Completion and mastery still come from the learning engine. */
export function LessonMap({ units, lessons, states, readinessByUnit }: {
  units: Unit[];
  lessons: Lesson[];
  states: Record<string, LessonNodeState>;
  readinessByUnit: Record<string, number>;
}) {
  useEffect(() => { clearLessonCompletedSignal(); }, []);

  return <div className="lesson-outline">{units.map(unit => {
    const unitLessons = lessons.filter(l => l.unit === unit.id).sort((a, b) => a.index - b.index);
    return <section key={unit.id} id={unit.id} className="outline-unit">
      <header className="outline-unit-heading">
        <div><p className="study-eyebrow">Unit {String(unit.index).padStart(2, "0")}</p><h2>{unit.title}</h2><p>{unit.promise}</p></div>
        <div className="outline-unit-actions"><span>{readinessByUnit[unit.id] ?? 0}% mastery</span><Link href={`/exam?mode=unit&unit=${unit.id}`}>Test out <ArrowRight size={13} /></Link></div>
      </header>
      <ol>{unitLessons.map(lesson => {
        const state = states[lesson.id] ?? "locked";
        const locked = state === "locked";
        const current = state === "current";
        const Icon = locked ? Lock : current ? ArrowRight : state === "weak" ? RotateCcw : Check;
        const body = <><span className="outline-lesson-icon"><Icon size={17} aria-hidden="true" /></span><span className="outline-lesson-title"><strong>{lesson.title}</strong><span>{LABELS[state]}</span></span><span className="outline-duration">{lesson.estimatedMinutes} min</span>{!locked && <ArrowRight size={15} className="outline-lesson-arrow" aria-hidden="true" />}</>;
        return <li key={lesson.id} id={`waypoint-${lesson.id}`} data-state={state}>
          {locked ? <div className="outline-lesson is-locked" aria-disabled="true">{body}</div> : <Link href={`/lessons/${lesson.id}`} className={cn("outline-lesson", current && "current-waypoint")} aria-current={current ? "step" : undefined}>{body}</Link>}
        </li>;
      })}</ol>
    </section>;
  })}</div>;
}
