"use client";

/**
 * The seven-day streak strip.
 *
 * Reads the real `streak.history` day keys rather than drawing a decorative
 * row: a day is filled only if the student actually studied on it. Today is
 * ringed whether or not it is done yet, because the empty ring is the thing
 * that gets someone to open a lesson.
 */

import { Flame } from "lucide-react";
import { dayKey } from "@/lib/xp";
import { cn } from "./ui";

const LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/** The seven day keys of the week containing `now`, Monday first. */
function weekDays(now: number): string[] {
  const d = new Date(now);
  // getDay(): 0 = Sunday. Shift so Monday is index 0.
  const offset = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return dayKey(day.getTime());
  });
}

export function StreakWeek({
  history,
  current,
  now = Date.now(),
  onInk = false,
  className,
}: {
  /** YYYY-MM-DD keys, any order. */
  history: string[];
  current: number;
  now?: number;
  /** Rendered on a dark surface. */
  onInk?: boolean;
  className?: string;
}) {
  const done = new Set(history);
  const today = dayKey(now);
  const days = weekDays(now);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <Flame size={16} className="shrink-0 text-caution" />
        <p className={cn("text-[13.5px] font-extrabold", onInk ? "text-white" : "text-navy")}>
          {current} day streak
        </p>
      </div>
      <p className={cn("mt-0.5 text-[11.5px]", onInk ? "text-[#a9c2da]" : "text-navy-soft")}>
        {current > 0 ? "Keep the momentum going." : "Study today to start one."}
      </p>

      <ul className="mt-2.5 flex items-center justify-between gap-1">
        {days.map((key, i) => {
          const isDone = done.has(key);
          const isToday = key === today;
          return (
            <li key={key} className="flex flex-col items-center gap-1">
              <span className={cn("text-[10px] font-bold", onInk ? "text-[#7d97b3]" : "text-navy-faint")}>
                {LABELS[i]}
              </span>
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold transition-colors",
                  isDone
                    ? "bg-caution text-white"
                    : onInk
                      ? "bg-white/10 text-[#7d97b3]"
                      : "bg-surface-3 text-navy-faint",
                  // Today is ringed even when unfilled: the gap is the prompt.
                  isToday && !isDone && "ring-2 ring-caution ring-offset-1",
                  isToday && !isDone && (onInk ? "ring-offset-ink-800" : "ring-offset-surface"),
                )}
                title={key}
              >
                {isDone ? <Flame size={12} fill="currentColor" strokeWidth={0} /> : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
