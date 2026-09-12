import type { CourseId } from "@/lib/types";

/** Eight recurring marks on one grid, with a single stroke and no backing shape. */
const MARKS = {
  airfoil: "M3 16C6 8 16 7 29 15C18 14 9 18 3 16Z M4 23H28",
  lift: "M4 21H27 M16 24V5 M12 9L16 5L20 9 M7 18L25 14",
  turbine: "M3 10H10L13 7H21L25 11H29 M3 22H10L13 25H21L25 21H29 M2 16H30 M10 12V20 M15 10V22 M20 10V22 M25 13V19",
  isobar: "M3 22C8 9 20 5 29 11 M4 27C11 15 20 11 29 16 M12 7V20 M8 11L12 7L16 11",
  compass: "M16 2V30 M2 16H30 M16 6L20 16L16 26L12 16Z M7 7L10 10 M22 22L25 25 M7 25L10 22 M22 10L25 7",
  plot: "M4 5V27H28 M7 23L14 12L25 8 M10 12H18 M14 8V16 M21 8H29 M25 4V12",
  circuit: "M3 9H12V23H21V9H29 M8 6V12 M24 6V12 M17 20V26 M26 19H30 M28 17V21",
  propeller: "M16 13C10 9 9 3 13 3C17 3 19 8 17 13 M19 16C25 13 30 15 28 19C26 23 21 23 18 19 M14 19C14 26 10 30 7 27C4 24 8 19 13 17 M13 16A3 3 0 1 0 19 16A3 3 0 1 0 13 16",
};

export type TechnicalMark = keyof typeof MARKS;
export const COURSE_MARKS: Record<CourseId, TechnicalMark> = {
  aero: "airfoil", engines: "turbine", frr: "circuit", weather: "isobar", nav: "compass",
};

export function TechnicalSymbol({ name, size = 24, className }: {
  name: TechnicalMark; size?: number; className?: string;
}) {
  return <svg className={className} width={size} height={size} viewBox="0 0 32 32"
    fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="butt"
    strokeLinejoin="miter" aria-hidden="true" focusable="false"><path d={MARKS[name]} /></svg>;
}
