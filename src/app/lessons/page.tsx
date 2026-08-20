"use client";

import { CONCEPTS, CURRICULUM_STATS, LESSONS, UNITS } from "@/content";
import { lessonStates, unitReadiness } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { LessonMap } from "@/components/lesson-map";
import { ChipRail, PageHeader, Pill } from "@/components/ui";

export default function LessonsPage() {
  const { state } = useProgress();
  const states = lessonStates(LESSONS, state);
  const readiness = unitReadiness(UNITS, CONCEPTS, LESSONS, state);
  const readinessByUnit = Object.fromEntries(readiness.map((r) => [r.unit, r.readiness]));
  const completed = Object.values(states).filter((s) => s !== "locked" && s !== "current").length;

  return (
    <>
      <PageHeader
        eyebrow="Your flight path"
        title="Aerodynamics course map"
        subtitle={`${CURRICULUM_STATS.lessons} lessons across six units, about ${CURRICULUM_STATS.totalMinutes} minutes of instruction. Every enabling objective in the trainee guide is mapped to a lesson and assessed by a question.`}
        actions={
          <Pill tone="brand">
            {completed}/{CURRICULUM_STATS.lessons} complete
          </Pill>
        }
      >
        <div className="mt-4">
          <ChipRail>
            {UNITS.map((u) => (
              <a
                key={u.id}
                href={`#${u.id}`}
                className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-navy-soft transition-colors hover:border-line-strong hover:text-navy"
              >
                <span className="tabular mr-1.5 text-navy-faint">{u.index}</span>
                {u.title}
              </a>
            ))}
          </ChipRail>
        </div>
      </PageHeader>

      <LessonMap
        units={UNITS}
        lessons={LESSONS}
        states={states}
        readinessByUnit={readinessByUnit}
      />
    </>
  );
}
