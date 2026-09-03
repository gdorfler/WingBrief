"use client";


import { lessonStates, unitReadiness } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { LessonMap } from "@/components/lesson-map";
import { ChipRail, PageHeader, Pill, cn } from "@/components/ui";
import { PlacementBanner } from "@/components/placement-banner";

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
        eyebrow={meta.layout === "desk" ? "Your route" : "Your flight path"}
        title={meta.layout === "desk" ? "Navigation route" : `${meta.name} course map`}
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
        {/*
          Each chip carries its own progress. A row of unit names is a table of
          contents; the same row with "6/6" against each one tells a student
          where they actually are before they have scrolled anywhere, and marks
          the finished units without needing a second colour.
        */}
        <div className="mt-4">
          <ChipRail>
            {content.units.map((u) => {
              const unitLessons = content.lessons.filter((l) => l.unit === u.id);
              const doneInUnit = unitLessons.filter(
                (l) => states[l.id] !== "locked" && states[l.id] !== "current",
              ).length;
              const finished = doneInUnit === unitLessons.length && unitLessons.length > 0;
              return (
                <a
                  key={u.id}
                  href={`#${u.id}`}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                    finished
                      ? "border-go/40 bg-go-soft text-go hover:border-go/60"
                      : "border-line bg-surface text-navy-soft hover:border-line-strong hover:text-navy",
                  )}
                >
                  <span className="tabular text-navy-faint">{u.index}</span>
                  <span>{u.title}</span>
                  <span
                    className={cn(
                      "tabular text-[12px] font-extrabold",
                      finished ? "text-go" : "text-navy-faint",
                    )}
                  >
                    {doneInUnit}/{unitLessons.length}
                  </span>
                </a>
              );
            })}
          </ChipRail>
        </div>
      </PageHeader>

      <PlacementBanner />

      <LessonMap
        units={content.units}
        lessons={content.lessons}
        states={states}
        readinessByUnit={readinessByUnit}
      />
    </>
  );
}
