"use client";


import { lessonStates, unitReadiness } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { LessonMap } from "@/components/lesson-map";
import { ChipRail, PageHeader, Pill } from "@/components/ui";

export default function LessonsPage() {
  const { state } = useProgress();
  const { content, stats, meta } = useCourse();
  const states = lessonStates(content.lessons, state);
  const readiness = unitReadiness(content.units, content.concepts, content.lessons, state);
  const readinessByUnit = Object.fromEntries(readiness.map((r) => [r.unit, r.readiness]));
  const completed = Object.values(states).filter((s) => s !== "locked" && s !== "current").length;
  const hasObjectives = content.lessons.some((l) => l.enablingObjectives.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Your flight path"
        title={`${meta.name} course map`}
        subtitle={`${stats.lessons} lessons across ${stats.units} units, about ${stats.totalMinutes} minutes of instruction. ${
          hasObjectives
            ? "Every enabling objective in the trainee guide is mapped to a lesson and assessed by a question."
            : "Every concept is taught by a lesson and assessed by at least two questions."
        }`}
        actions={
          <Pill tone="brand">
            {completed}/{stats.lessons} complete
          </Pill>
        }
      >
        <div className="mt-4">
          <ChipRail>
            {content.units.map((u) => (
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
        units={content.units}
        lessons={content.lessons}
        states={states}
        readinessByUnit={readinessByUnit}
      />
    </>
  );
}
