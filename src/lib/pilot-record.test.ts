import { describe, expect, it } from "vitest";
import { COURSE_ORDER, contentFor, COURSES } from "@/content";
import { emptyProgress } from "./storage";
import { emptyMastery } from "./mastery";
import { pilotRecord } from "./pilot-record";
import { isLessonOpen, lessonStates } from "./review";
import type { CourseProgressView, LessonProgress } from "./types";

const NOW = new Date(2026, 8, 5, 12).getTime();
const complete = (lessonId:string, at=NOW, perfect=false):LessonProgress => ({lessonId,started:true,completed:true,bestScore:perfect?1:.8,attempts:1,lastCompletedAt:at,perfect});

describe("pilot record", () => {
  it("starts without unearned rewards", () => {
    const record=pilotRecord(emptyProgress(),NOW);
    expect(record.xp).toBe(0); expect(record.level.level).toBe(1);
    expect(record.collectibles.every(c=>!c.earned)).toBe(true); expect(record.log).toEqual([]);
  });
  it("keeps XP and levels stable when switching courses", () => {
    const p=emptyProgress(); p.courses.aero.xp=150; p.courses.engines.xp=200;
    const before=pilotRecord(p,NOW); p.activeCourse="nav";
    expect(pilotRecord(p,NOW)).toEqual(before); expect(before.xp).toBe(350);
  });
  it("counts today's completed lessons across all courses", () => {
    const p=emptyProgress(); p.courses.aero.lessons.a=complete("a"); p.courses.nav.lessons.n=complete("n");
    p.courses.weather.lessons.w=complete("w",NOW-86400000);
    expect(pilotRecord(p,NOW).doneToday).toBe(2);
  });
  it("awards collectible patches only at their thresholds", () => {
    const p=emptyProgress(); for(let i=0;i<3;i++)p.courses.aero.lessons[String(i)]=complete(String(i),NOW,true);
    for(let i=0;i<10;i++)p.courses.nav.mastery[String(i)]={...emptyMastery(String(i)),level:5};
    const r=pilotRecord(p,NOW); expect(r.collectibles.every(c=>c.earned)).toBe(true);
    expect(r.perfect).toBe(3); expect(r.mastered).toBe(10);
  });
  it("orders the flight log newest first without mutating progress", () => {
    const p=emptyProgress(); p.courses.aero.lessons.a=complete("a",NOW-5000); p.courses.nav.lessons.n=complete("n",NOW);
    const before=JSON.stringify(p); expect(pilotRecord(p,NOW).log.map(l=>l.lessonId)).toEqual(["n","a"]); expect(JSON.stringify(p)).toBe(before);
  });
});

for(const id of COURSE_ORDER) describe(`${id} progression and public content`,()=>{
  const c=contentFor(id);
  const view=():CourseProgressView=>{const p=emptyProgress();return {...p.courses[id],activeCourse:id,streak:p.streak,achievements:[],onboarded:false};};
  it("opens exactly the first lesson on an empty record",()=>{
    const states=lessonStates(c.lessons,view()); expect(Object.values(states).filter(s=>s==="current")).toHaveLength(1);
    expect(states[c.lessons[0].id]).toBe("current"); expect(isLessonOpen("unknown",states)).toBe(false);
    expect(states[c.lessons[1].id]).toBe("locked");
  });
  it("completing a lesson unlocks only the next waypoint",()=>{
    const p=view();p.lessons[c.lessons[0].id]=complete(c.lessons[0].id); const states=lessonStates(c.lessons,p);
    expect(states[c.lessons[0].id]).toBe("completed");expect(states[c.lessons[1].id]).toBe("current");expect(states[c.lessons[2].id]).toBe("locked");
  });
  it("distinguishes perfect, mastered, and needs-review lessons",()=>{
    const p=view();const l=c.lessons[0];p.lessons[l.id]=complete(l.id,NOW,true);
    expect(lessonStates(c.lessons,p)[l.id]).toBe("perfect");
    l.conceptIds.forEach(cid=>{p.mastery[cid]={...emptyMastery(cid),level:5};});
    expect(lessonStates(c.lessons,p)[l.id]).toBe("mastered");
    p.mastery[l.conceptIds[0]].level=2;expect(lessonStates(c.lessons,p)[l.id]).toBe("weak");
  });
  it("keeps restricted source codes out of client-visible content and metadata",()=>{
    expect(JSON.stringify({content:c,meta:COURSES[id]})).not.toMatch(/\bACA[0-9_-][A-Z0-9_-]*/i);
  });
});
