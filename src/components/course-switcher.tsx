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
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Lock } from "lucide-react";
import { motion } from "motion/react";
import type { CourseMeta } from "@/lib/types";
import { PLANNED_COURSES, contentFor } from "@/content";
import { overallReadiness } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { cn } from "./ui";

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

/**
 * One icon family, two members. Both are drawn on the same 32-unit grid with
 * the same stroke weight so they read as siblings: Aerodynamics is a wing
 * cutting through airflow, Engines is a turbine seen head-on.
 */
export function CourseIcon({
  name,
  size = 30,
  tone = "solid",
}: {
  name: string;
  size?: number;
  tone?: "solid" | "flat";
}) {
  const bg = tone === "solid" ? "var(--color-ink-800)" : "transparent";
  const fg = "var(--color-brand-light)";

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      {tone === "solid" && <rect width="32" height="32" rx="9" fill={bg} />}

      {name === "turbine" ? (
        <>
          {/* Turbine face: hub plus blades, with a compressed-air arc. */}
          <circle cx="16" cy="16" r="9.4" fill="none" stroke={fg} strokeWidth="1.9" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const inner = 3.6;
            const outer = 9;
            return (
              <line
                key={i}
                x1={16 + Math.cos(a) * inner}
                y1={16 + Math.sin(a) * inner}
                x2={16 + Math.cos(a + 0.5) * outer}
                y2={16 + Math.sin(a + 0.5) * outer}
                stroke={fg}
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            );
          })}
          <circle cx="16" cy="16" r="3" fill="#fff" />
        </>
      ) : (
        <>
          {/* Wing with airflow over it. */}
          <path
            d="M6 19.5 C11 16.5 14 15.6 16 15.6 C18 15.6 21 16.5 26 19.5 L26 21.4 C20.6 19.6 18 19 16 19 C14 19 11.4 19.6 6 21.4 Z"
            fill={fg}
          />
          <path d="M16 8.6 L17.9 13.4 L16 15 L14.1 13.4 Z" fill="#fff" />
          <circle cx="16" cy="23.6" r="1.5" fill={fg} />
        </>
      )}
    </svg>
  );
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
    router.push("/");
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
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.09em] text-navy-faint">
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

          <div className="border-t border-line bg-surface-2/60 px-3.5 py-2.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-navy-faint">
              <Lock size={11} />
              {PLANNED_COURSES.join(" · ")} coming soon
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
