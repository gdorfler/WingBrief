"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import type { Lesson, Unit } from "@/lib/types";
import type { LessonNodeState } from "@/lib/review";
import { clearLessonCompletedSignal } from "@/lib/route-marker-signal";
import { LessonIcon } from "./lesson-icon";
import { cn } from "./ui";

const LABELS: Record<LessonNodeState, string> = {
  locked: "Locked", current: "New", completed: "Complete",
  perfect: "Perfect", mastered: "Mastered", weak: "Review",
};

/** Subject marks persist across every state. Text carries the status and mastery. */
export function LessonMap({ units, lessons, states, readinessByUnit, masteryByLesson }: {
  units: Unit[]; lessons: Lesson[]; states: Record<string, LessonNodeState>;
  readinessByUnit: Record<string, number>; masteryByLesson: Record<string, number>;
}) {
  useEffect(() => { clearLessonCompletedSignal(); }, []);
  return <div className="lesson-outline">{units.map(unit => {
    const unitLessons = lessons.filter(l => l.unit === unit.id).sort((a, b) => a.index - b.index);
    return <section key={unit.id} id={unit.id} className="outline-unit">
      <header className="outline-unit-heading">
        <div><p className="study-eyebrow">Unit {String(unit.index).padStart(2, "0")}</p><h2>{unit.title}</h2><p>{unit.promise}</p></div>
        <div className="outline-unit-actions"><span>{readinessByUnit[unit.id] ?? 0}% MASTERY</span><Link href={`/exam?mode=unit&unit=${unit.id}`}>Test out <ArrowRight size={13} /></Link></div>
      </header>
      <ol>{unitLessons.map((lesson, i) => {
        const state = states[lesson.id] ?? "locked";
        const locked = state === "locked";
        const current = state === "current";
        const mastery = masteryByLesson[lesson.id] ?? 0;
        const body = <>
          <span className="outline-lesson-number">{unit.index}.{i + 1}</span>
          <span className="outline-lesson-icon"><LessonIcon name={lesson.mapIcon} className="h-4 w-4" /></span>
          <span className="outline-lesson-title"><strong>{lesson.title}</strong><span className="outline-status" aria-label={`${LABELS[state]}${!locked && !current ? ', ' + mastery + '% mastery' : ''}`}>{LABELS[state]}{!locked && !current && <> · {mastery}</>}</span></span>
          <span className="outline-duration">{lesson.estimatedMinutes} MIN</span>
          {!locked && <ArrowRight size={15} className="outline-lesson-arrow" aria-hidden="true" />}
        </>;
        return <li key={lesson.id} id={`waypoint-${lesson.id}`} data-state={state}>
          {locked ? <div className="outline-lesson is-locked" aria-disabled="true">{body}</div> : <Link href={`/lessons/${lesson.id}`} className={cn("outline-lesson", current && "current-waypoint")} aria-current={current ? "step" : undefined}>{body}</Link>}
        </li>;
      })}</ol>
    </section>;
  })}</div>;
}
