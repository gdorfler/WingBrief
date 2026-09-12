"use client";

/**
 * Course switcher.
 *
 * The one control that makes WingBrief feel like a platform rather than a
 * single course. It shows each course's readiness so switching is an informed
 * decision, not just a change of colour, and it lives in the sidebar, the
 * mobile header and the profile so it is never more than one tap away.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Lock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import type { CourseMeta } from "@/lib/types";
import { PLANNED_COURSES, contentFor } from "@/content";
import { overallReadiness } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { cn } from "./ui";
import { TechnicalSymbol, type TechnicalMark } from "./technical-symbol";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

/** Course identity uses the same standalone marks in every context. */
const COURSE_ICON_MARKS: Record<string, TechnicalMark> = {
  wing: "airfoil", turbine: "turbine", waypoint: "circuit", atmosphere: "isobar", plotter: "compass",
};
export function CourseIcon({ name, size = 30 }: {
  name: string; size?: number; tone?: "solid" | "flat";
}) {
  return <TechnicalSymbol name={COURSE_ICON_MARKS[name] ?? "airfoil"} size={size} className="shrink-0 text-navy" />;
}

/* ------------------------------------------------------------------ */
/* Switcher                                                            */
/* ------------------------------------------------------------------ */



export function CourseSwitcher({ compact = false }: { compact?: boolean }) {
  const { id, meta, all, setCourse } = useCourse();
  const { exportState } = useProgress();
  const router = useRouter();
  // The full document, so the menu can show readiness for courses that are
  // not the active one — otherwise switching is a blind choice.
  const stored = exportState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Dismiss on outside click or Escape, the two things a dropdown must do.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (next: CourseMeta) => {
    setOpen(false);
    if (next.id === id) return;
    setCourse(next.id);
    // Ids are course-specific, so any detail route would 404 after the swap.
    router.push("/course");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface transition-colors hover:border-line-strong",
          compact ? "px-2 py-1.5" : "px-2.5 py-2",
        )}
      >
        <CourseIcon name={meta.icon} size={compact ? 24 : 28} />
        <span className="min-w-0 flex-1 text-left leading-tight">
          <span className="block truncate text-[13px] font-extrabold tracking-tight text-navy">
            {meta.name}
          </span>
          {!compact && (
            <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.09em] text-navy-faint">
              Course
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={cn(
            "shrink-0 text-navy-faint transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <motion.div
          role="listbox"
          initial={{ opacity: 0, y: -6, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_18px_40px_-16px_rgba(10,30,56,0.35)]"
        >
          <ul className="p-1.5">
            {all.map((course) => {
              const active = course.id === id;
              const readiness = overallReadiness(
                contentFor(course.id).concepts,
                stored.courses[course.id].mastery,
              );
              return (
                <li key={course.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(course)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
                      active ? "bg-brand-soft" : "hover:bg-surface-2",
                    )}
                  >
                    <CourseIcon name={course.icon} size={30} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-bold text-navy">
                          {course.name}
                        </span>
                        {active && <Check size={13} strokeWidth={3.2} className="shrink-0 text-brand" />}
                      </span>
                      <span className="mt-0.5 block truncate text-[11.5px] font-medium text-navy-soft">
                        {readiness > 0 ? `${readiness}% ready` : course.tagline}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/*
            The "coming soon" line this replaces read as a lock icon followed
            by a bare " coming soon": PLANNED_COURSES is empty, and joining an
            empty array yields an empty string. When there is genuinely
            something to announce the branch below brings it back.
          */}
          <div className="border-t border-line bg-surface-2/60 px-3.5 py-2.5">
            {PLANNED_COURSES.length > 0 ? (
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-faint">
                <Lock size={11} />
                {PLANNED_COURSES.join(" · ")} coming soon
              </p>
            ) : (
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 text-[12px] font-bold text-navy-soft transition-colors hover:text-brand"
              >
                All courses
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
