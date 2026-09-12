"use client";
import Image from "next/image";
import { TechnicalSymbol, COURSE_MARKS } from "./technical-symbol";
import { Flame, Star } from "lucide-react";
import type { CourseId } from "@/lib/types";
import { useProgress } from "@/lib/progress-store";
import { liveStreak } from "@/lib/xp";
import { pilotRecord } from "@/lib/pilot-record";
import { cn } from "./ui";

export const WORLD_COPY: Record<CourseId, { name: string; caption: string }> = {
  aero: { name: "The open sky", caption: "Find your feel for flight." },
  engines: { name: "The power hangar", caption: "Bring every system to life." },
  frr: { name: "The airspace network", caption: "Make the right call, every time." },
  weather: { name: "The atmosphere", caption: "Read the sky before you fly." },
  nav: { name: "The chart room", caption: "Turn a heading into a destination." },
};
export function WorldBadge({ course, className }: { course: CourseId; className?: string }) {
  return <span className={cn("world-badge", className)} data-world={course} aria-hidden="true"><TechnicalSymbol name={COURSE_MARKS[course]} /></span>;
}
export function WorldAtmosphere(_props: { course?: CourseId }) {
  return null;
}
export function Aviator({ className }: { className?: string }) {
  return <Image src="/brand/aviator.png" alt="WingBrief aviator" width={1024} height={1024} className={cn("aviator-art", className)} />;
}
export function Trainer({ className, priority = false }: { className?: string; priority?: boolean }) {
  return <Image src="/brand/trainer.png" alt="" width={1024} height={1024} priority={priority} className={cn("trainer-art", className)} />;
}
export function FlightStats() {
  const { state, exportState } = useProgress();
  const { level, xp } = pilotRecord(exportState());
  const streak = liveStreak(state.streak, Date.now());
  return <div className="flight-stats" aria-label="Your progress">
    <span><Flame size={19} className="text-orange" fill="currentColor" /><strong>{streak}</strong><span>day streak</span></span>
    <span><Star size={19} className="text-gold" fill="currentColor" /><strong>{xp.toLocaleString()}</strong><span>XP</span></span>
    <span className="flight-level"><span className="level-insignia">{level.level}</span><span>Flight level</span></span>
  </div>;
}
