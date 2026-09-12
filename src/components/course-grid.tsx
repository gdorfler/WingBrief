"use client";

/** Course directory: shared ink and typography, distinct subject symbols. */

import { useMemo } from "react";
import { useRouter } from "next/navigation";


import type { CourseId } from "@/lib/types";
import { contentFor } from "@/content";
import { overallReadiness } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { WorldBadge } from "./flight-world";
import { SegmentedProgress } from "./segmented-progress";


export interface CourseRow {
  id: CourseId;
  name: string;
  tagline: string;
  icon: string;
  accent: string;
  accentSoft: string;
  readiness: number;
  lessonsDone: number;
  lessonsTotal: number;
  conceptsMastered: number;
  conceptsTotal: number;
  units: { title: string; done: number; total: number }[];
}

/** One row per course, each computed from that course's own progress bucket. */
export function useCourseRows(): CourseRow[] {
  const { all } = useCourse();
  /*
   * `exportState` is the only reader of the whole multi-course document. It is
   * named for the backup flow, but a dashboard genuinely needs every course at
   * once, which the flattened active-course view cannot provide.
   */
  const { exportState } = useProgress();
  const stored = exportState();

  return useMemo(
    () =>
      all.map((meta) => {
        const content = contentFor(meta.id);
        const bucket = stored.courses[meta.id];
        const done = (lessonId: string) => Boolean(bucket?.lessons?.[lessonId]?.completed);
        const mastery = bucket?.mastery ?? {};

        return {
          id: meta.id,
          name: meta.name,
          tagline: meta.tagline,
          icon: meta.icon,
          accent: meta.accent,
          accentSoft: meta.accentSoft,
          readiness: overallReadiness(content.concepts, mastery),
          lessonsDone: content.lessons.filter((l) => done(l.id)).length,
          lessonsTotal: content.lessons.length,
          conceptsMastered: Object.values(mastery).filter((m) => m.level >= 5).length,
          conceptsTotal: content.concepts.length,
          units: content.units.slice(0, 3).map((u) => {
            const unitLessons = content.lessons.filter((l) => l.unit === u.id);
            return {
              title: u.title,
              done: unitLessons.filter((l) => done(l.id)).length,
              total: unitLessons.length,
            };
          }),
        };
      }),
    [all, stored],
  );
}

export function CourseGrid({ rows }: { rows: CourseRow[] }) {
  const router = useRouter();
  const { id: activeId, setCourse } = useCourse();
  return <ul className="course-worlds">{rows.map(row => <li key={row.id}>
    <button type="button" className="course-world" aria-current={row.id === activeId ? "true" : undefined}
      onClick={() => { setCourse(row.id); router.push("/course"); }}>
      <WorldBadge course={row.id}/>
      <div className="course-world-label"><h3>{row.name}</h3><p>{row.id === activeId ? "Current course" : "Open course"}</p></div>
      <div className="world-progress"><span>{row.lessonsDone} / {row.lessonsTotal} lessons</span>
      <SegmentedProgress completed={row.lessonsDone} total={row.lessonsTotal} label={`${row.name} lessons completed`} className="mt-2"/></div>
    </button></li>)}</ul>;
}
