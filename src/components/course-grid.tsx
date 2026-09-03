"use client";

/**
 * Every course, at full size, in its own colours.
 *
 * Each card hands its own palette and ground down as inline custom
 * properties. That is not a flourish: `bg-ink-900` and `--color-brand` both
 * resolve to whatever course is *active*, so a card that did not override
 * them rendered in the wrong colour entirely — five Engines-brown cards while
 * Engines was selected.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Lock } from "lucide-react";

import type { CourseId } from "@/lib/types";
import { contentFor } from "@/content";
import { overallReadiness } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { CourseIcon } from "./course-switcher";
import { ProgressRing, cn } from "./ui";
import { SkyBackdrop } from "./sky";

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

function verdict(readiness: number): string {
  if (readiness >= 85) return "Checkride ready.";
  if (readiness >= 60) return "Solid foundation.";
  if (readiness >= 35) return "Good start.";
  if (readiness > 0) return "Early days.";
  return "Not started.";
}

export function CourseGrid({ rows }: { rows: CourseRow[] }) {
  const router = useRouter();
  const { id: activeId, setCourse } = useCourse();

  const open = (id: CourseId) => {
    setCourse(id);
    router.push("/lessons");
  };

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((row, i) => {
        const isActive = row.id === activeId;
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => open(row.id)}
              aria-current={isActive ? "true" : undefined}
              className="group chunky relative flex h-full w-full flex-col overflow-hidden rounded-3xl text-left transition-all hover:brightness-[1.08]"
              style={
                {
                  "--color-brand": row.accent,
                  "--color-brand-light": `color-mix(in srgb, ${row.accent} 62%, white)`,
                  "--color-brand-soft": row.accentSoft,
                  "--lip": `color-mix(in srgb, ${row.accent} 55%, black)`,
                  background: `color-mix(in srgb, ${row.accent} 14%, #0a0c12)`,
                } as React.CSSProperties
              }
            >
              <SkyBackdrop arc={false} />

              {/* An inner rim, so the card has an edge that catches light
                  rather than a hard cut against the page. */}
              <span
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.14), inset 0 0 0 1px rgba(255,255,255,0.07)",
                }}
                aria-hidden
              />

              <div className="relative flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-2xl"
                      style={{
                        background: `color-mix(in srgb, ${row.accent} 30%, transparent)`,
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 10px -4px rgba(0,0,0,0.5)",
                      }}
                    >
                      <CourseIcon name={row.icon} size={26} tone="flat" />
                    </span>
                    <span className="tabular text-[12.5px] font-extrabold text-white/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                      Current
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-[21px] font-extrabold leading-tight text-white">
                  {row.name}
                </h3>
                <p className="mt-1 text-[13.5px] leading-snug text-[#bed2e6]">{row.tagline}</p>

                <ul className="mt-4 space-y-1.5">
                  {row.units.map((u) => {
                    const finished = u.total > 0 && u.done === u.total;
                    const started = u.done > 0;
                    return (
                      <li key={u.title} className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            finished ? "bg-go text-white" : started ? "bg-white/25" : "bg-white/10",
                          )}
                        >
                          {finished ? (
                            <Check size={10} strokeWidth={3.5} />
                          ) : started ? null : (
                            <Lock size={8} className="text-white/50" strokeWidth={3} />
                          )}
                        </span>
                        <span
                          className={cn(
                            "truncate text-[12.5px] font-semibold",
                            finished ? "text-white" : started ? "text-[#cfe0f0]" : "text-white/45",
                          )}
                        >
                          {u.title}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                  <ProgressRing
                    value={row.readiness / 100}
                    size={46}
                    stroke={5}
                    tone="brand"
                    trackClassName="stroke-white/15"
                  >
                    <span className="tabular text-[12px] font-extrabold text-white">
                      {row.readiness}
                    </span>
                  </ProgressRing>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-white">{verdict(row.readiness)}</p>
                    {/* white/70 rather than a fixed blue-grey: the ground under
                        this differs per card, and one literal cannot hold
                        contrast across five of them. */}
                    <p className="tabular mt-0.5 text-[11.5px] font-semibold text-white/70">
                      {row.lessonsDone}/{row.lessonsTotal} lessons
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="shrink-0 text-white/50 transition-transform group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
