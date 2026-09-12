"use client";

import Link from "next/link";
import { LessonIcon } from "./lesson-icon";
import { TechnicalSymbol } from "./technical-symbol";
import { ArrowRight, Target } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCourse } from "@/lib/course";
import { useProgress } from "@/lib/progress-store";
import { buildDailyFlight, lessonStates, overallReadiness, weakConcepts } from "@/lib/review";
import { DAILY_LESSON_GOAL, dayKey } from "@/lib/xp";
import { ButtonLink, ProgressBar, SectionHeading } from "./ui";
import { CourseGrid, useCourseRows } from "./course-grid";
import { claimsFor, evaluateClaims, summariseClaims } from "@/lib/claims";

export function FlightHome({ platform = false }: { platform?: boolean }) {
  const { displayName } = useAuth();
  const { id, content, meta } = useCourse();
  const { state, exportState } = useProgress();
  const rows = useCourseRows();
  const now = Date.now();
  const states = lessonStates(content.lessons, state);
  const next = [...content.lessons].sort((a, b) => a.index - b.index).find(l => states[l.id] === "current");
  const flight = buildDailyFlight(content, state, now);
  const orderedFlight = [...flight.items].sort((a, b) => Number(b.kind === "newLesson") - Number(a.kind === "newLesson"));
  const weak = weakConcepts(content.concepts, content.questions, state.mastery, now, { limit: 3 });
  const today = dayKey(now);
  const doneToday = Object.values(exportState().courses).reduce((n, bucket) => n + Object.values(bucket?.lessons ?? {}).filter(l => l.completed && l.lastCompletedAt !== null && dayKey(l.lastCompletedAt) === today).length, 0);
  const readiness = overallReadiness(content.concepts, state.mastery);
  const claims = claimsFor(id);
  const earnedClaims = claims.length ? summariseClaims(evaluateClaims(content, state.attempts, claims)) : null;
  const hour = new Date(now).getHours();

  return <div className="study-home">
    <div className="home-greeting">
      <p>{hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"}{displayName ? `, ${displayName}` : ""}.</p>
      <Link href="/profile">Your progress <ArrowRight size={14} /></Link>
    </div>
    <section className="study-next" aria-labelledby="next-flight-title">
      <div className="study-next-copy">
        <p className="study-eyebrow study-subject">{next && <LessonIcon name={next.mapIcon} className="h-4 w-4" />}{meta.name} <span>/</span> {next ? "Next lesson" : "Course complete"}</p>
        <h1 id="next-flight-title">{next?.title ?? "Keep your knowledge sharp."}</h1>
        <p className="study-subtitle">{next?.subtitle ?? "Revisit the ideas that need practice, or test what you know."}</p>
        <div className="study-next-action">
          <ButtonLink href={next ? `/lessons/${next.id}` : "/review"} size="lg">{next ? "Continue learning" : "Review course"}<ArrowRight size={17} /></ButtonLink>
          {next && <span>{next.estimatedMinutes} min</span>}
        </div>
      </div>
      <aside className="study-course-progress" aria-label="Course progress">
        <p className="study-eyebrow">{earnedClaims ? "Skills verified" : "Knowledge readiness"}</p>
        <p className="study-readiness">{earnedClaims ? earnedClaims.earned.length : readiness}<span>{earnedClaims ? ` / ${claims.length}` : "%"}</span></p>
        <ProgressBar value={earnedClaims ? earnedClaims.earned.length / Math.max(1, claims.length) : readiness / 100} height={4} />
        <Link href="/lessons">View lessons <ArrowRight size={14} /></Link>
      </aside>
    </section>
    <div className="study-columns">
      <section>
        <SectionHeading title="Today’s study" />
        <ol className="study-plan">{orderedFlight.slice(0, 3).map((item, i) => <li key={item.kind}>
          <Link href={item.href}><span className="study-step">{String(i + 1).padStart(2, "0")}</span><span className="study-plan-title">{item.title}</span><span className="study-duration">{item.minutes} min</span><ArrowRight size={16} /></Link>
        </li>)}</ol>
        <div className="study-goal"><span className="status-dot" data-complete={doneToday >= DAILY_LESSON_GOAL} aria-hidden="true" /><span>{doneToday} of {DAILY_LESSON_GOAL} daily lessons completed</span></div>
      </section>
      <section className="study-review">
        <SectionHeading title="Worth another look" />
        {weak.length ? <ul className="study-weak">{weak.map(w => <li key={w.concept.id}><Link href={`/review/concept/${w.concept.id}`}><span>{w.concept.name}</span><ArrowRight size={15} /></Link></li>)}</ul> : <div className="study-empty"><TechnicalSymbol name="propeller" size={28} /><p>{state.attempts.length ? "No weak areas right now. Keep building with your next lesson." : "Your review list will take shape as you learn."}</p></div>}
        <Link className="study-text-link" href="/review">Open review <ArrowRight size={14} /></Link>
        {id === "nav" && <Link className="study-text-link" href="/nav-desk"><Target size={16} />Navigation tools <ArrowRight size={14} /></Link>}
      </section>
    </div>
    {platform && <section id="courses" className="study-courses"><SectionHeading title="Your courses" /><CourseGrid rows={rows} /></section>}
    <footer className="study-resources"><span>Study resources</span><Link href="/explainers">Explainers</Link><Link href="/know-cold">Know cold</Link><Link href="/lab">{meta.labLabel}</Link></footer>
  </div>;
}
