"use client";
import { useRef, useState } from "react";
import { Check, Download, Upload, Lock, Star, Compass, Plane, ChevronDown } from "lucide-react";
import { LESSON_BY_ID, COURSE_OF_UNIT, COURSES } from "@/content";
import { ACHIEVEMENTS, dayKey, liveStreak, rankForLevel } from "@/lib/xp";
import { pilotRecord } from "@/lib/pilot-record";
import { exportProgress, importProgress } from "@/lib/storage";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { AccountCard } from "@/components/account-card";
import { AchievementIcon } from "@/components/achievement-icon";
import { StreakWeek } from "@/components/streak-week";
import { Aviator, Trainer, FlightStats, WorldBadge } from "@/components/flight-world";
import { useCourseRows } from "@/components/course-grid";
import { Button, Card, ProgressBar, SectionHeading, cn } from "@/components/ui";

export default function ProfilePage() {
  const { state, resetProgress, exportState, importState } = useProgress();
  const { meta } = useCourse();
  const rows = useCourseRows();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const now = Date.now();
  const record = pilotRecord(exportState(), now);
  const owned = new Set(state.achievements.map(a => a.id));
  const streak = liveStreak(state.streak, now);
  const doExport = () => {
    const url = URL.createObjectURL(new Blob([exportProgress(exportState())], { type:"application/json" }));
    const a = document.createElement("a"); a.href=url; a.download=`wingbrief-progress-${dayKey(now)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const doImport = async (file:File) => {
    try {
      const parsed = importProgress(await file.text());
      if (!parsed) { setImportMessage("That file could not be read as progress data."); return; }
      importState(parsed); setImportMessage("Progress restored.");
    } catch { setImportMessage("The file could not be opened. Please try again."); }
  };
  return <div className="space-y-9">
    <section className="pilot-profile">
      <div className="pilot-portrait"><Aviator/><span className="pilot-level">Level {record.level.level}</span></div>
      <div className="pilot-profile-copy"><p className="flight-eyebrow">YOUR AVIATOR RECORD</p><h1>{rankForLevel(record.level.level)}</h1><p>Every flight adds to your story.</p><FlightStats/>
      <div className="mt-6 flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{record.xp.toLocaleString()} total XP</span><span className="text-navy-soft">{Math.max(0,record.level.span-record.level.intoLevel)} to next level</span></div><ProgressBar value={record.level.progress} height={10} className="mt-2"/></div>
    </section>
    <div className="profile-rhythm"><section><SectionHeading title="Keep the streak alive"/><StreakWeek history={state.streak.history} current={streak}/><p className="mt-3 text-sm text-navy-soft">Longest streak: {state.streak.longest} days</p></section><section><SectionHeading title="Your daily flight goal"/><p className="text-sm text-navy-soft">{record.doneToday >= record.goal ? "Today’s goal is in the log. Nice flying." : `${record.goal} lessons. A little stronger every day.`}</p><ProgressBar value={Math.min(1,record.doneToday/record.goal)} height={10} className="mt-4"/><p className="mt-2 text-sm font-bold">{Math.min(record.doneToday,record.goal)} / {record.goal} complete</p></section></div>
    <section><SectionHeading title="Your hangar" action={<span className="text-sm text-navy-soft">{record.collectibles.filter(c=>c.earned).length} patches earned</span>}/><div className="hangar"><div className="hangar-plane"><Trainer/><div><p className="text-lg font-extrabold">The WingBrief trainer</p><p className="mt-1 text-sm text-navy-soft">Your companion from first flight to mastery.</p></div></div><div className="patch-collection">{record.collectibles.map((c,i)=>{ const Icon=[Plane,Star,Compass][i]; return <div key={c.id} className={cn("collectible-patch",c.earned && "earned")}><span className="patch-medal"><Icon size={32}/>{!c.earned && <Lock size={12} className="patch-lock"/>}</span><h3>{c.name}</h3><p>{c.detail}</p><span className="text-xs font-bold">{c.earned ? "Earned" : `${c.progress} / ${c.target}`}</span></div>; })}</div></div></section>
    <section><SectionHeading title="Mastery wings" action={<span className="text-sm text-navy-soft">{record.mastered} concepts mastered</span>}/><div className="mastery-wings">{rows.map(row=><div key={row.id} style={{"--color-brand":row.accent,"--color-brand-dark":row.accent,"--color-brand-soft":row.accentSoft} as React.CSSProperties}><WorldBadge course={row.id}/><h3>{row.name}</h3><ProgressBar value={row.conceptsMastered/Math.max(1,row.conceptsTotal)} height={6}/><p>{row.conceptsMastered} / {row.conceptsTotal} mastered</p></div>)}</div></section>
    <section><SectionHeading title="Flight log" action={<span className="text-sm text-navy-soft">{record.lessons} lessons flown · {record.perfect} perfect</span>}/>{record.log.length ? <ol className="flight-log">{record.log.map(l=>{const lesson=LESSON_BY_ID[l.lessonId];return <li key={l.lessonId}><span className={cn("log-stamp",l.perfect && "perfect")}>{l.perfect ? <Star size={18}/> : <Check size={18}/>}</span><div className="flex-1"><h3>{lesson?.title ?? "Completed lesson"}</h3><p>{lesson ? COURSES[COURSE_OF_UNIT[lesson.unit]]?.name : ""} · {new Date(l.lastCompletedAt!).toLocaleDateString(undefined,{month:"short",day:"numeric"})}</p></div><span className="text-sm font-bold">{Math.round(l.bestScore * 100)}%</span></li>})}</ol> : <p className="quiet-empty">Your first completed lesson will land here.</p>}</section>
    <section><SectionHeading title="Achievement collection" action={<span className="text-sm text-navy-soft">{owned.size} / {ACHIEVEMENTS.length} earned</span>}/><ul className="achievement-collection">{ACHIEVEMENTS.map(a=><li key={a.id} className={cn(owned.has(a.id) && "earned")}><AchievementIcon icon={a.icon} size={52} locked={!owned.has(a.id)}/><div><h3>{a.name}</h3><p>{a.description}</p></div>{owned.has(a.id) && <Check size={16} className="shrink-0 text-go"/>}</li>)}</ul></section>
    <details className="profile-settings"><summary>Account & progress settings <ChevronDown size={17}/></summary><div className="mt-5 space-y-5"><AccountCard/><Card><h2 className="text-lg font-bold">Your data</h2><p className="mt-2 text-sm leading-relaxed text-navy-soft">Export a backup of every course, or restore a previous backup. Importing replaces the progress on this device.</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={doExport}><Download size={16}/>Export progress</Button><Button variant="secondary" onClick={()=>fileInput.current?.click()}><Upload size={16}/>Import progress</Button><Button variant="ghost" onClick={()=>setConfirmReset(true)}>Reset {meta.name}</Button><input ref={fileInput} type="file" accept="application/json" className="hidden" aria-label="Import progress file" onChange={e=>{const f=e.target.files?.[0];if(f)void doImport(f);e.target.value="";}}/></div>{importMessage && <p role="status" className="mt-3 text-sm">{importMessage}</p>}{confirmReset && <div className="mt-4 rounded-xl bg-nogo-soft p-4"><p className="text-sm font-semibold">Erase {meta.name} progress? Other courses stay intact. Export a backup first to make this recoverable.</p><div className="mt-3 flex gap-2"><Button variant="secondary" onClick={()=>setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={()=>{resetProgress();setConfirmReset(false);}}>Erase this course</Button></div></div>}</Card></div></details>
    <p className="text-center text-xs text-navy-faint">Educational aid only. Not a substitute for official NIFE instruction or NATOPS.</p>
  </div>;
}
