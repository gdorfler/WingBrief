"use client";

import { useEffect, useState } from "react";
import { lessonStates, unitReadiness } from "@/lib/review";
import { conceptFraction } from "@/lib/mastery";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { LessonMap } from "@/components/lesson-map";
import { SegmentedProgress } from "@/components/segmented-progress";
import { PageHeader } from "@/components/ui";
import { PlacementBanner } from "@/components/placement-banner";

const AERO_INDEX = ["Language", "Wing", "Drag", "Performance", "Maneuvering", "Hazards"];

export default function LessonsPage() {
  const { state } = useProgress();
  const { id, content, stats, meta } = useCourse();
  const states = lessonStates(content.lessons, state);
  const readiness = unitReadiness(content.units, content.concepts, content.lessons, state);
  const readinessByUnit = Object.fromEntries(readiness.map(r => [r.unit, r.readiness]));
  const masteryByLesson = Object.fromEntries(content.lessons.map(l => [l.id,
    Math.round(l.conceptIds.reduce((sum, c) => sum + conceptFraction(state.mastery[c]), 0) / Math.max(1, l.conceptIds.length) * 100),
  ]));
  const completed = content.lessons.filter(l => state.lessons[l.id]?.completed).length;
  const currentUnit = content.lessons.find(l => states[l.id] === "current")?.unit ?? content.units[0]?.id;
  const [visibleUnit, setVisibleUnit] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const sections = content.units.map(u => document.getElementById(u.id)).filter((el): el is HTMLElement => !!el);
      const passed = sections.filter(el => el.getBoundingClientRect().top <= 180);
      // A short final unit cannot reach the reading line when the page ends.
      const atEnd = window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      setVisibleUnit((atEnd ? sections.at(-1) : passed.at(-1))?.id ?? null);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [content.units]);

  return <>
    <PageHeader eyebrow="Training manual / Course outline" title={meta.name}
      subtitle="Pick up where you left off, or revisit a completed lesson."
      actions={<div className="outline-completion"><p><strong>{String(completed).padStart(2, "0")}</strong> / {stats.lessons}<span>LESSONS COMPLETE</span></p><SegmentedProgress completed={completed} total={stats.lessons} label="Lessons completed" /></div>}>
      <nav className="unit-index" aria-label="Unit index">
        {content.units.map(u => {
          const unitLessons = content.lessons.filter(l => l.unit === u.id);
          const done = unitLessons.filter(l => state.lessons[l.id]?.completed).length;
          return <a key={u.id} href={`#${u.id}`} aria-current={(visibleUnit ?? currentUnit) === u.id ? "location" : undefined}>
            <span className="unit-index-number">{String(u.index).padStart(2, "0")}</span>
            <span>{id === "aero" ? AERO_INDEX[u.index - 1] ?? u.title : u.title}</span>
            <small data-complete={done === unitLessons.length}>{done}/{unitLessons.length}</small>
          </a>;
        })}
      </nav>
    </PageHeader>
    <details className="placement-note"><summary>Already know this material?</summary><PlacementBanner /></details>
    <LessonMap units={content.units} lessons={content.lessons} states={states}
      readinessByUnit={readinessByUnit} masteryByLesson={masteryByLesson} />
  </>;
}
