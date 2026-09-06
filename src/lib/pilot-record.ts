import type { ProgressState } from "./types";
import { DAILY_LESSON_GOAL, dayKey, levelFromXp } from "./xp";

/** Platform rewards are derived from all courses, never from the open tab. */
export function pilotRecord(progress: ProgressState, now = Date.now()) {
  const buckets = Object.values(progress.courses);
  const lessons = buckets.flatMap(b => Object.values(b.lessons));
  const completed = lessons.filter(l => l.completed);
  const xp = buckets.reduce((sum, b) => sum + b.xp, 0);
  const perfect = completed.filter(l => l.perfect).length;
  const mastered = buckets.reduce((sum, b) => sum + Object.values(b.mastery).filter(m => m.level >= 5).length, 0);
  const today = dayKey(now);
  const doneToday = completed.filter(l => l.lastCompletedAt !== null && dayKey(l.lastCompletedAt) === today).length;
  const collectibles = [
    { id:"first-flight", name:"First Flight", detail:"Complete your first lesson", earned:completed.length >= 1, progress:Math.min(1,completed.length), target:1 },
    { id:"precision-wings", name:"Precision Wings", detail:"Fly 3 perfect lessons", earned:perfect >= 3, progress:Math.min(3,perfect), target:3 },
    { id:"golden-compass", name:"Golden Compass", detail:"Master 10 concepts", earned:mastered >= 10, progress:Math.min(10,mastered), target:10 },
  ];
  return { xp, level:levelFromXp(xp), lessons:completed.length, perfect, mastered, doneToday, goal:DAILY_LESSON_GOAL, collectibles,
    log:completed.filter(l => l.lastCompletedAt !== null).sort((a,b) => b.lastCompletedAt!-a.lastCompletedAt!).slice(0,8) };
}
