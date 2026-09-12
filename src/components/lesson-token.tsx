import type { LessonNodeState } from "@/lib/review";
import { LessonIcon } from "./lesson-icon";

/** Completion changes the ink; the subject symbol stays the same. */
export function LessonToken({ state, icon, size, className = "" }: {
  state: LessonNodeState; icon: string; size: number; celebrate?: boolean; className?: string;
}) {
  return <span className={`lesson-symbol ${className}`} data-state={state}
    style={{ width: size, height: size }} aria-hidden="true">
    <LessonIcon name={icon} className="h-full w-full" />
  </span>;
}
