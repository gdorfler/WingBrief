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
    labLabel: "Sim Lab",
    labIntro: {
      title: "Manipulate the relationships",
      blurb:
        "Labs built to teach cause and effect, not to simulate an aircraft. Where the trainee guide does not publish a number, outputs are shown as relative values rather than invented ones.",
    },
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
    labLabel: "Sim Lab",
    labIntro: {
      title: "Drive the engine, watch what moves",
      blurb:
        "Relationship simulators rather than engine models. The lectures publish directions and splits, not thrust tables, so nothing here computes a value it cannot justify.",
    },
  },
  frr: {
    id: "frr",
    name: "Flight Rules",
    tagline: "What rule applies, when, and what you do next",
    sourceLabel: "NAVAVSCOLSCOM-SG-200 Module 7 · CNAF M-3710.7",
    icon: "waypoint",
    theme: "frr",
    accent: "#6d5ae0",
    accentSoft: "#efecfd",
    labLabel: "Scenario Lab",
    labIntro: {
      title: "Set the situation, read the ruling",
      blurb:
        "Regulations have no curve to plot, so these are decision engines: change the conditions and watch which clause of the rule produces the answer.",
    },
  },
  weather: {
    id: "weather",
    name: "Weather",
    tagline: "What the atmosphere is doing, and what happens next",
    sourceLabel: "NAVAVSCOLSCOM-SG-200 · EOs 2.199–2.279",
    icon: "atmosphere",
    theme: "weather",
    accent: "#0d9aa8",
    accentSoft: "#e2f6f8",
    labLabel: "Weather Lab",
    labIntro: {
      title: "Change a condition, watch the atmosphere answer",
      blurb:
        "The atmosphere is one system with a few inputs. These labs let you move temperature, moisture, pressure and altitude and watch what the air does about it.",
    },
  },
};

/** Display order in the switcher. */
export const COURSE_ORDER: CourseId[] = ["aero", "engines", "frr", "weather"];

export const DEFAULT_COURSE: CourseId = "aero";

export function isCourseId(value: unknown): value is CourseId {
  return typeof value === "string" && value in COURSES;
}

/** Courses named in the switcher's "coming soon" footer. Not yet built. */
export const PLANNED_COURSES = ["Navigation"];
