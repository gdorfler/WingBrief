"use client";

/**
 * Exam setup.
 *
 * One question is asked at a time. First: which paper. Only once that is
 * answered does the screen commit to a specific exam and offer to start it,
 * and only if the student asks to customise does it show a question count or
 * a clock. Presenting the type cards, the length slider and the timer switch
 * together made a settings form out of what is really a single choice.
 */

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { TechnicalSymbol, type TechnicalMark } from "@/components/technical-symbol";
import type { UnitId } from "@/lib/types";
import { SessionBrief } from "@/components/session-brief";
import { parsePickableExamMode, type PickableExamMode } from "@/lib/exam-config";

import { weakConcepts } from "@/lib/review";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { Button, LoadingState, cn } from "@/components/ui";

/** The papers a student can pick. `custom` is not one of them — see below. */
type Mode = PickableExamMode | "custom";

const MODES: {
  id: PickableExamMode;
  title: string;
  body: string;
  count: number;
  icon: TechnicalMark;
}[] = [
  {
    id: "quick",
    title: "Quick exam",
    body: "Across the whole course, weighted toward your weak areas.",
    count: 20,
    icon: "lift",
  },
  {
    id: "full",
    title: "Full exam",
    body: "The length and spread of the real NIFE exam.",
    count: 50,
    icon: "plot",
  },
  {
    id: "unit",
    title: "Unit exam",
    body: "One unit, to find out whether it has actually landed.",
    count: 15,
    icon: "circuit",
  },
  {
    id: "weak",
    title: "Weak areas",
    body: "Built entirely from the concepts you are weakest on.",
    count: 20,
    icon: "propeller",
  },
];

export default function ExamPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading exam options…" />}>
      <ExamConfigurator />
    </Suspense>
  );
}

function ExamConfigurator() {
  const router = useRouter();
  const params = useSearchParams();
  const { state } = useProgress();
  const { content, meta } = useCourse();
  /*
   * Where a source states the real examination's conditions, use them. The
   * NETSAFA Navigation booklet prints 50 questions in 2 hours 30 minutes, which
   * is three minutes a question rather than the one minute the other courses
   * allow — because half of those questions are worked on a slide rule.
   */
  const policy = meta.examPolicy;

  const [mode, setMode] = useState<PickableExamMode>(() =>
    parsePickableExamMode(params.get("mode")),
  );
  /*
   * Unit ids are course-scoped: Aerodynamics numbers them u1..u6, Engines
   * e1..e7, and so on. Defaulting to a literal "u1" therefore selected a unit
   * that does not exist on four of the five courses, and the unit paper came
   * out with zero questions in it. Fall back to whichever unit the active
   * course actually starts with, and re-anchor if the course changes while
   * this screen is open.
   */
  const [unit, setUnit] = useState<UnitId>(
    (params.get("unit") as UnitId) ?? content.units[0].id,
  );
  const activeUnit = content.units.some((u) => u.id === unit)
    ? unit
    : (content.units[0]?.id ?? unit);
  const [timed, setTimed] = useState(true);
  const [customising, setCustomising] = useState(false);
  /*
   * Null means "however many this paper normally has". Only once the student
   * moves the slider does the exam stop being the paper they picked and become
   * a custom one, which is what the stored result should be called.
   */
  const [countOverride, setCountOverride] = useState<number | null>(null);

  const weak = useMemo(
    () => weakConcepts(content.concepts, content.questions, state.mastery, Date.now(), { limit: 12 }),
    [content.concepts, content.questions, state.mastery],
  );

  const selected = MODES.find((m) => m.id === mode)!;

  const available = useMemo(() => {
    if (mode === "unit") return content.questions.filter((q) => q.unit === activeUnit).length;
    if (mode === "weak") {
      const ids = new Set(weak.map((w) => w.concept.id));
      return content.questions.filter((q) => q.conceptIds.some((c) => ids.has(c))).length || content.questions.length;
    }
    return content.questions.length;
  }, [content.questions, mode, activeUnit, weak]);

  const baseCount = mode === "full" && policy ? policy.questionCount : selected.count;
  const effectiveCount = Math.min(countOverride ?? baseCount, available);
  const perQuestion = policy ? policy.minutes / policy.questionCount : 1;
  const minutes = Math.max(5, Math.round(effectiveCount * perQuestion));
  const submittedMode: Mode = countOverride === null ? mode : "custom";

  const pick = (m: PickableExamMode) => {
    setMode(m);
    setCountOverride(null);
  };

  const start = () => {
    const seed = `exam-${Date.now().toString(36)}`;
    const qs = new URLSearchParams({
      seed,
      mode: submittedMode,
      scope: mode,
      count: String(effectiveCount),
      timed: timed ? "1" : "0",
      minutes: String(minutes),
    });
    if (mode === "unit") qs.set("unit", activeUnit);
    router.push(`/exam/run?${qs.toString()}`);
  };

  const history = [...state.exams].sort((a, b) => b.at - a.at).slice(0, 5);
  const best = state.exams.reduce((m, e) => Math.max(m, e.score), 0);
  const sliderMax = Math.max(10, Math.min(60, available));
  const sliderValue = Math.min(countOverride ?? baseCount, sliderMax);

  return <div className="exam-page">
    <SessionBrief title="Examination room" description="One focused paper. No hints. See how your knowledge holds up.">
      <p className="exam-reference">{meta.id.toUpperCase()} / PRACTICE PAPERS{state.exams.length > 0 && <> · BEST {Math.round(best * 100)}%</>}</p>
    </SessionBrief>
    <div className="exam-layout">
      <section className="exam-selection" aria-labelledby="exam-menu-title">
        <div className="exam-section-heading"><span className="study-eyebrow">01 / Select a paper</span><h2 id="exam-menu-title">What will you practice?</h2></div>
        <ul className="exam-mode-menu">
          {MODES.map((m, i) => <li key={m.id}>
            <button type="button" onClick={() => pick(m.id)} aria-pressed={mode === m.id} className="exam-mode">
              <span className="exam-mode-number">0{i + 1}</span><TechnicalSymbol name={m.icon} size={26} />
              <span className="exam-mode-copy"><strong>{m.title}</strong><span>{m.body}</span></span>
              <span className="exam-mode-mark" aria-hidden="true">{mode === m.id ? "●" : "—"}</span>
            </button>
          </li>)}
        </ul>
        {mode === "unit" && <fieldset className="exam-unit-picker"><legend>Choose a unit</legend>
          <div>{content.units.map(u => <button key={u.id} type="button" onClick={() => setUnit(u.id)} aria-pressed={activeUnit === u.id}>
            <span className="exam-unit-number">{String(u.index).padStart(2, "0")}</span><span>{u.title}</span>
            <small>{content.questions.filter(q => q.unit === u.id).length} Q</small>
          </button>)}</div>
        </fieldset>}
        <section className="exam-commitment" aria-labelledby="selected-paper-title">
          <div className="exam-section-heading"><span className="study-eyebrow">02 / Your paper</span><h2 id="selected-paper-title">{countOverride === null ? selected.title : "Custom exam"}</h2></div>
          <p className="exam-paper-spec"><strong>{effectiveCount}</strong> QUESTIONS <span>/</span> {timed ? minutes + " MIN" : "UNTIMED"}</p>
          {mode === "weak" && <p className="exam-note">{weak.length === 0 ? "Nothing is weak yet, so this uses a full-course sample." : `Targeting ${weak.length} concept${weak.length === 1 ? "" : "s"} you are weakest on.`}</p>}
          <div className="exam-start-row"><Button size="lg" onClick={start} disabled={effectiveCount === 0}>Start exam <ArrowRight size={17} /></Button>
            <button type="button" onClick={() => setCustomising(c => !c)} aria-expanded={customising} aria-controls="exam-options" className="exam-customize">{customising ? "Hide options" : "Customize paper"}</button>
          </div>
          {customising && <div id="exam-options" className="exam-options">
            <div><div className="exam-option-label"><label htmlFor="exam-question-count">Questions</label><span>{effectiveCount}</span></div>
              <input id="exam-question-count" type="range" min={5} max={sliderMax} step={5} value={sliderValue}
                onChange={e => setCountOverride(Number(e.target.value))} className="lab-range h-6 w-full cursor-pointer appearance-none bg-transparent"
                style={{ "--accent": "var(--color-orange)", "--track": `linear-gradient(to right, var(--color-orange) 0%, var(--color-orange) ${((sliderValue - 5) / Math.max(1, sliderMax - 5)) * 100}%, var(--color-surface-3) ${((sliderValue - 5) / Math.max(1, sliderMax - 5)) * 100}%, var(--color-surface-3) 100%)` } as React.CSSProperties} />
              <p className="exam-note">{available} available for this selection</p>
            </div>
            <div className="exam-timer-row"><div><p>Timed</p><p className="exam-note">{timed ? "Auto-submits at zero" : "No clock"}</p></div>
              <button type="button" role="switch" aria-checked={timed} aria-label="Timed exam" onClick={() => setTimed(t => !t)}
                className={cn("exam-timer-switch", timed && "is-on")}><span>{timed ? "ON" : "OFF"}</span><span className="exam-switch-knob" /></button>
            </div>
            {policy && <div className="exam-policy"><p className="study-eyebrow">Real exam conditions</p><p>{policy.note}</p></div>}
          </div>}
        </section>
      </section>
      <aside className="exam-margin">
        <section className="exam-log" aria-labelledby="exam-log-title">
          <p className="study-eyebrow">Record / Last five papers</p><h2 id="exam-log-title">Recent exams</h2>
          {history.length > 0 ? <table><caption className="sr-only">Recent exam dates, modes, question counts and scores. Select a paper to review its result.</caption>
            <thead><tr><th scope="col">Date / paper</th><th scope="col">Q</th><th scope="col">Score</th></tr></thead>
            <tbody>{history.map(e => <tr key={e.id}>
              <th scope="row"><Link href={`/exam/results/${encodeURIComponent(e.id)}`} aria-label={`Review ${e.label}, ${new Date(e.at).toLocaleDateString("en-US")}, ${Math.round(e.score * 100)} percent`}>
                <time dateTime={new Date(e.at).toISOString()}>{new Date(e.at).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}</time><span>{e.mode}</span>
              </Link></th><td>{e.questionIds.length}</td><td className={e.score >= 0.8 ? "is-mastered" : undefined}>{Math.round(e.score * 100)}%
                <span className="exam-score-rule" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, e.score * 100))}%` }} /></span>
              </td>
            </tr>)}</tbody>
          </table> : <div className="exam-log-empty"><TechnicalSymbol name="plot" size={30} /><p>Your first paper starts the record.</p><span>DATE / PAPER / Q / SCORE</span></div>}
        </section>
        <section className="exam-scope"><p className="study-eyebrow">Scope / {meta.name}</p><h2>Inside the paper</h2><p>Drawn from your course question bank and source material.</p>
          <ol>{content.units.map(u => <li key={u.id}><span>{String(u.index).padStart(2, "0")}</span>{u.title}</li>)}</ol>
        </section>
      </aside>
    </div>
  </div>;
}
