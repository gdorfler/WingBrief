"use client";

/**
 * Active course context.
 *
 * Screens ask this for their content instead of importing global arrays, which
 * is what makes a screen course-agnostic: the lesson map, review queue and exam
 * builder have no idea whether they are showing Aerodynamics or Engines.
 *
 * The active course also drives theming. `data-course` is written to the
 * document root and the stylesheet re-points the whole accent palette off that
 * one attribute, so switching courses recolours the app without a single
 * component re-reading a colour.
 */

import { createContext, useContext, useEffect, useMemo } from "react";
import type { CourseContent, CourseId, CourseMeta } from "@/lib/types";
import { COURSES, COURSE_ORDER, contentFor, statsFor, type CurriculumStats } from "@/content";
import { useProgress } from "./progress-store";

export interface CourseApi {
  id: CourseId;
  meta: CourseMeta;
  content: CourseContent;
  stats: CurriculumStats;
  /** Every course on the platform, in switcher order. */
  all: CourseMeta[];
  setCourse: (id: CourseId) => void;
}

const CourseContext = createContext<CourseApi | null>(null);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const { state, setActiveCourse } = useProgress();
  const id = state.activeCourse;

  /**
   * Theme the document from the active course. Written on the root element so
   * portals and fixed overlays inherit it too, not just the React subtree.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-course", id);
    return () => {
      root.removeAttribute("data-course");
    };
  }, [id]);

  const value = useMemo<CourseApi>(
    () => ({
      id,
      meta: COURSES[id],
      content: contentFor(id),
      stats: statsFor(id),
      all: COURSE_ORDER.map((c) => COURSES[c]),
      setCourse: setActiveCourse,
    }),
    [id, setActiveCourse],
  );

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourse(): CourseApi {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error("useCourse must be used inside CourseProvider");
  return ctx;
}

/**
 * Points the active course at whatever the student actually opened.
 *
 * Progress is stored per course and every mutation writes to the ACTIVE
 * bucket, but nothing was keeping the active course in step with the page.
 * Open an Engines lesson from a bookmark, a search result, or the back button
 * while Aerodynamics is active, and the answers — and the mastery built from
 * them — were filed under Aerodynamics: invisible to Engines, and quietly
 * corrupting the readiness and review queue of a course the student was not
 * even studying.
 *
 * Any screen that renders a course-scoped entity resolved by global id should
 * call this before recording anything.
 */
export function useEnsureCourse(courseId: CourseId | undefined) {
  const { ready, setActiveCourse } = useProgress();
  useEffect(() => {
    // Must wait for hydration. The store loads asynchronously and replaces the
    // whole document when it lands, so a switch made before that arrives is
    // silently overwritten by the stored activeCourse.
    if (ready && courseId) setActiveCourse(courseId);
  }, [ready, courseId, setActiveCourse]);
}
