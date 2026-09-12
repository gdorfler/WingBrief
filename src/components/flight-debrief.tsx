"use client";
import { ArrowRight, Star, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/progress-store";
import { pilotRecord } from "@/lib/pilot-record";
import type { Lesson } from "@/lib/types";
import { Aviator, WorldAtmosphere } from "./flight-world";
import { LessonToken } from "./lesson-token";
import { ButtonLink, ProgressBar } from "./ui";
import { Confetti, useCountUp } from "./reward";

export function FlightDebrief({ lesson, score, xp, before, nextId }: {
  lesson:Lesson; score:number; xp:number; before:ReturnType<typeof pilotRecord> | null; nextId?:string;
}) {
  const { displayName }=useAuth();
  const { exportState }=useProgress();
  const record=pilotRecord(exportState());
  const earned=record.collectibles.find(c=>c.earned && before?.collectibles.some(b=>b.id===c.id && !b.earned));
  const levelUp=before && record.level.level>before.level.level;
  const dailyGoal=before && before.doneToday<record.goal && record.doneToday>=record.goal;
  const shown=useCountUp(xp,550);
  const heading=score===1 ? "Perfect flight" : score>=.8 ? "Nice flying" : "Another flight in the log";
  return <section className="flight-debrief" aria-labelledby="debrief-title">
    <WorldAtmosphere/><Confetti show={score>=.8}/>
    <div className="debrief-badge"><LessonToken icon={lesson.mapIcon} size={48} state={score===1?"perfect":"completed"} celebrate={score>=.8}/></div>
    <p className="flight-eyebrow">LESSON COMPLETE</p><h1 id="debrief-title">{heading}{displayName ? `, ${displayName}` : ""}.</h1>
    <p className="debrief-lesson">{lesson.title}</p>
    <div className="debrief-totals"><span><Star size={20}/><strong>+{shown}</strong> XP earned</span><span><strong>{Math.round(score*100)}%</strong> first try</span></div>
    <div className="debrief-milestone"><Aviator/><div><p className="font-extrabold">{earned ? `${earned.name} earned` : levelUp ? `Flight level ${record.level.level} reached` : dailyGoal ? "Daily goal complete" : "One step closer"}</p><p className="mt-1 text-sm leading-relaxed text-navy-soft">{earned ? "Your new patch is waiting in your hangar." : score<.8 ? "A few ideas need another look. Your debrief below shows which ones." : `${Math.max(0, record.level.span-record.level.intoLevel)} XP to your next flight level.`}</p></div></div>
    <div className="debrief-progress"><div className="mb-2 flex justify-between text-sm"><span className="flex items-center gap-2"><Target size={16}/>Today’s goal</span><strong>{Math.min(record.doneToday,record.goal)} / {record.goal} lessons</strong></div><ProgressBar value={Math.min(1,record.doneToday/record.goal)} height={10} tone={dailyGoal?"go":"brand"}/></div>
    <ButtonLink href={nextId ? `/lessons#waypoint-${nextId}` : "/lessons"} size="lg" fullWidth>See your flight path<ArrowRight size={18}/></ButtonLink>
    <p className="mt-4 text-xs text-navy-soft">{nextId ? "Your next waypoint is ready." : "Every lesson flown. Your course is complete."} Progress saved automatically.</p>
  </section>;
}
