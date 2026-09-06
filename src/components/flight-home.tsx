"use client";
import Link from "next/link";
import { ArrowRight, Check, Play, Target, Sparkles } from "lucide-react";
import { useCourse } from "@/lib/course";
import { useProgress } from "@/lib/progress-store";
import { buildDailyFlight, lessonStates, overallReadiness, weakConcepts } from "@/lib/review";
import { DAILY_LESSON_GOAL, dayKey } from "@/lib/xp";
import { ButtonLink, ProgressBar, SectionHeading } from "./ui";
import { CourseGrid, useCourseRows } from "./course-grid";
import { Aviator, Trainer, FlightStats, WorldAtmosphere, WORLD_COPY } from "./flight-world";
import { LessonToken } from "./lesson-token";
import { claimsFor, evaluateClaims, summariseClaims } from "@/lib/claims";

export function FlightHome({ platform = false }: { platform?: boolean }) {
  const { id, content, meta } = useCourse();
  const { state, exportState } = useProgress();
  const rows = useCourseRows();
  const now = Date.now();
  const states = lessonStates(content.lessons, state);
  const next = [...content.lessons].sort((a,b) => a.index-b.index).find(l => states[l.id] === "current");
  const flight = buildDailyFlight(content, state, now);
  const weak = weakConcepts(content.concepts, content.questions, state.mastery, now, { limit: 3 });
  const explainers = content.explainers.filter(e => !state.watchedExplainerIds.includes(e.id)).slice(0, 3);
  const today = dayKey(now);
  const doneToday = Object.values(exportState().courses).reduce((n, bucket) => n + Object.values(bucket?.lessons ?? {}).filter(l => l.completed && l.lastCompletedAt !== null && dayKey(l.lastCompletedAt) === today).length, 0);
  const readiness = overallReadiness(content.concepts, state.mastery);
  const claims = claimsFor(id);
  const earnedClaims = claims.length ? summariseClaims(evaluateClaims(content, state.attempts, claims)) : null;
  const hour = new Date(now).getHours();
  return <div className="flight-home space-y-9">
    <div className="home-greeting"><p>{hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}, aviator.</p><FlightStats /></div>
    <section className="flight-hero" aria-labelledby="next-flight-title">
      <WorldAtmosphere />
      <div className="flight-hero-copy"><p className="flight-eyebrow">{meta.name} <span> / </span> {WORLD_COPY[id].name}</p><h1 id="next-flight-title">A little further.<br /><span>A little higher.</span></h1><p className="hero-support">{next ? "Your next flight is ready. Let’s make it count." : "Every lesson flown. Keep your knowledge sharp."}</p><ButtonLink href={next ? `/lessons/${next.id}` : "/review"} size="lg" className="continue-button"><Play size={17} fill="currentColor" />Continue<ArrowRight size={18} /></ButtonLink><p className="hero-next">{next ? `${next.title} · ${next.estimatedMinutes} min` : "Review your course"}</p></div>
      <div className="hero-aircraft"><Trainer priority /><span className="aircraft-shadow" /></div>
      <div className="hero-footer"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-go" />{earnedClaims ? `${earnedClaims.earned.length} of ${claims.length} skills verified` : `${readiness}% knowledge readiness`}</span><Link href="/lessons">View flight path <ArrowRight size={14} /></Link></div>
    </section>
    <div className="home-columns"><div className="space-y-8">
      <section><SectionHeading title="Today’s flight" action={<span className="text-sm text-navy-soft">One step at a time</span>} /><ol className="daily-route">{flight.items.slice(0, 3).map((item, i) => <li key={item.kind}><Link href={item.href} className="daily-stop"><span className="daily-stop-token">{item.kind === "newLesson" ? <LessonToken icon={item.art ?? "wing"} state="current" size={58} /> : <span className="daily-step-number">{String(i+1).padStart(2,"0")}</span>}</span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-navy-soft">{item.kind === "newLesson" ? "Learn something new" : item.kind === "explainer" ? "Make it click" : "Strengthen your skills"}</span><span className="mt-1 block font-bold text-navy">{item.title}</span></span><span className="text-sm text-navy-soft">{item.minutes} min</span><ArrowRight size={17} /></Link></li>)}</ol></section>
      <section><SectionHeading title="Weak areas" action={weak.length > 0 ? <Link href="/review" className="text-sm font-semibold text-brand">Review <ArrowRight className="inline" size={14}/></Link> : undefined} />{weak.length ? <div className="weak-list">{weak.map(w => <Link key={w.concept.id} href={`/review/concept/${w.concept.id}`}><span className="review-dot" /><span className="flex-1">{w.concept.name}</span><ArrowRight size={15}/></Link>)}</div> : <p className="quiet-empty"><Check size={19} className="text-go" />{state.attempts.length ? "Looking good. Your next lesson will keep you moving." : "As you learn, we’ll find the ideas worth another look."}</p>}</section>
      {id === "nav" && <Link href="/nav-desk" className="quiet-empty font-semibold"><Target size={22} className="text-brand"/>Open your navigation tools<ArrowRight size={17}/></Link>}
    </div><aside><section className="daily-goal"><div className="flex items-center justify-between"><Target size={24} className="text-orange"/><span className="text-sm font-bold text-navy-soft">{Math.min(doneToday, DAILY_LESSON_GOAL)} / {DAILY_LESSON_GOAL} lessons</span></div><h2 className="mt-4 text-xl font-extrabold">{doneToday >= DAILY_LESSON_GOAL ? "Goal complete. Nice flying." : "Small flights. Big progress."}</h2><p className="mt-2 text-sm leading-relaxed text-navy-soft">{doneToday >= DAILY_LESSON_GOAL ? "You showed up for yourself today. That’s how good habits take flight." : `Your daily goal: ${DAILY_LESSON_GOAL} lessons across any course.`}</p><ProgressBar value={Math.min(1,doneToday/DAILY_LESSON_GOAL)} tone={doneToday >= DAILY_LESSON_GOAL ? "go" : "brand"} height={10} className="mt-5"/><div className="goal-aviator"><Aviator/><span>See you in the sky.</span></div></section></aside></div>
    {explainers.length > 0 && <section><SectionHeading title="Quick explainers" action={<Link href="/explainers" className="text-sm font-semibold text-brand">Explore all <ArrowRight className="inline" size={14}/></Link>}/><div className="explainer-strip">{explainers.map((e,i) => <Link key={e.id} href={`/explainers/${e.id}`} className="explainer-preview"><div className="explainer-preview-art" data-variant={i}><Sparkles size={38} strokeWidth={1.3}/><span className="explainer-play"><Play size={15} fill="currentColor"/></span></div><h3>{e.title}</h3><p>Watch & explore</p></Link>)}</div></section>}
    {platform && <section id="courses"><SectionHeading title="Five worlds. One aviator." action={<span className="text-sm text-navy-soft">Your courses</span>}/><CourseGrid rows={rows}/></section>}
  </div>;
}
