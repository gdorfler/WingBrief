/**
 * The course registry.
 *
 * WingBrief is the platform; each entry here is a course on it. Adding Weather
 * or Navigation later means adding an id to `CourseId`, a row here, a content
 * bundle under src/content/<id>/, and a palette block in globals.css — no
 * changes to the learning engine, the review logic or any screen.
 *
 * `accent` duplicates the CSS custom property because SVG gradients and a few
 * canvas-style fills cannot read a Tailwind class. The stylesheet remains the
 * source of truth for everything else.
 */

import type { CourseId, CourseMeta } from "@/lib/types";

export const COURSES: Record<CourseId, CourseMeta> = {
  aero: {
    id: "aero",
    name: "Aerodynamics",
    tagline: "Air, lift, drag and the limits of the wing",
    sourceLabel: "Aerodynamics · Trainee Guide",
    icon: "wing",
    theme: "aero",
    accent: "#1f6fb2",
    accentSoft: "#e8f1fa",
  },
  engines: {
    id: "engines",
    name: "Engines",
    tagline: "Gas turbines, systems and what breaks them",
    sourceLabel: "Engines · Condensed Notes",
    icon: "turbine",
    theme: "engines",
    accent: "#e8752a",
    accentSoft: "#fdf0e6",
  },
};

/** Display order in the switcher. */
export const COURSE_ORDER: CourseId[] = ["aero", "engines"];

export const DEFAULT_COURSE: CourseId = "aero";

export function isCourseId(value: unknown): value is CourseId {
  return typeof value === "string" && value in COURSES;
}

/** Courses named in the switcher's "coming soon" footer. Not yet built. */
export const PLANNED_COURSES = ["Weather", "Navigation", "Flight Rules"];
