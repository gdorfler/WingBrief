"use client";

/**
 * The question engine.
 *
 * One <QuestionPlayer> renders any of the ten interaction types, grades it,
 * and hands the result back. Every type collapses to a serialized answer key
 * so lessons, review sessions and exams all share the same plumbing.
 */

import { motion } from "motion/react";
import { Bookmark, BookmarkCheck, Check, Flag, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BeforeAfterQuestion,
  ConnectChainQuestion,
  CurveShiftQuestion,
  DragLabelQuestion,
  GraphReadQuestion,
  McqQuestion,
  Question,
  ShiftDirection,
  SliderPredictQuestion,
  TapDiagramQuestion,
} from "@/lib/types";
import { correctKey, isCorrect, seededShuffle, serializeAnswer } from "@/lib/scoring";
import { CONCEPT_BY_ID } from "@/content";
import { DiagramHost } from "./diagrams/registry";
import { Widget } from "./lab/widgets";
import { Button, Card, Pill, cn } from "./ui";

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export interface QuestionResult {
  questionId: string;
  answerKey: string;
  correct: boolean;
  elapsedMs: number;
  firstTry: boolean;
}

export interface QuestionPlayerProps {
  question: Question;
  /** Called once the student commits an answer. */
  onAnswer: (result: QuestionResult) => void;
  /** Called when they press Continue after seeing feedback. */
  onContinue: () => void;
  /** Exam mode: grade silently, no explanation, allow changing the answer. */
  mode?: "practice" | "exam";
  /** Exam only — restores a previously chosen answer. */
  initialAnswer?: string;
  /** Exam only. */
  flagged?: boolean;
  onToggleFlag?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
  /** Label for the continue button. */
  continueLabel?: string;
  /** Show the concept tags under the prompt. */
  showConcepts?: boolean;
}

const TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "Multiple choice",
  spotTheTrap: "Spot the trap",
  tapDiagram: "Tap the diagram",
  dragLabel: "Drag the label",
  connectChain: "Connect the chain",
  curveShift: "Curve shift",
  sliderPredict: "Predict",
  beforeAfter: "Before / after",
  graphRead: "Read the graph",
};

export function QuestionPlayer(props: QuestionPlayerProps) {
  const {
    question,
    onAnswer,
    onContinue,
    mode = "practice",
    initialAnswer,
    flagged,
    onToggleFlag,
    saved,
    onToggleSave,
    continueLabel = "Continue",
    showConcepts = true,
  } = props;

  const [answer, setAnswer] = useState<string | null>(initialAnswer ?? null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const startedAt = useRef(Date.now());

  // Reset when the question changes.
  useEffect(() => {
    setAnswer(initialAnswer ?? null);
    setSubmitted(false);
    setAttempts(0);
    startedAt.current = Date.now();
  }, [question.id, initialAnswer]);

  const graded = submitted && mode === "practice";
  const correct = answer !== null && isCorrect(question, answer);

  const submit = useCallback(() => {
    if (answer === null) return;
    const elapsedMs = Date.now() - startedAt.current;
    const ok = isCorrect(question, answer);
    setSubmitted(true);
    setAttempts((a) => a + 1);
    onAnswer({
      questionId: question.id,
      answerKey: answer,
      correct: ok,
      elapsedMs,
      firstTry: attempts === 0,
    });
  }, [answer, attempts, onAnswer, question]);

  const retry = useCallback(() => {
    setSubmitted(false);
    setAnswer(null);
    startedAt.current = Date.now();
  }, []);

  // Exam mode records every change immediately without feedback.
  const setExamAnswer = useCallback(
    (value: string) => {
      setAnswer(value);
      onAnswer({
        questionId: question.id,
        answerKey: value,
        correct: isCorrect(question, value),
        elapsedMs: Date.now() - startedAt.current,
        firstTry: attempts === 0,
      });
      setAttempts((a) => a + 1);
    },
    [attempts, onAnswer, question],
  );

  const handleChange = mode === "exam" ? setExamAnswer : setAnswer;

  const body = (
    <QuestionBody
      question={question}
      answer={answer}
      graded={graded}
      onChange={handleChange}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Pill tone="brand" size="sm">
              {TYPE_LABEL[question.type]}
            </Pill>
            {question.officialStyle && (
              <Pill tone="neutral" size="sm">
                NIFE style
              </Pill>
            )}
            {showConcepts &&
              question.conceptIds.slice(0, 2).map((id) => (
                <Pill key={id} tone="neutral" size="sm">
                  {CONCEPT_BY_ID[id]?.name ?? id}
                </Pill>
              ))}
          </div>
          <h3 className="text-[17px] font-semibold leading-snug text-navy sm:text-lg">
            {question.prompt}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onToggleFlag && (
            <button
              type="button"
              onClick={onToggleFlag}
              aria-pressed={flagged}
              aria-label={flagged ? "Remove flag" : "Flag for review"}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                flagged ? "bg-caution-soft text-caution" : "text-navy-faint hover:bg-surface-2",
              )}
            >
              <Flag size={16} fill={flagged ? "currentColor" : "none"} />
            </button>
          )}
          {onToggleSave && (
            <button
              type="button"
              onClick={onToggleSave}
              aria-pressed={saved}
              aria-label={saved ? "Unsave question" : "Save question"}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                saved ? "bg-brand-soft text-brand" : "text-navy-faint hover:bg-surface-2",
              )}
            >
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          )}
        </div>
      </div>

      {body}

      {mode === "practice" && (
        <>
          {graded && (
            <motion.div
              key={`feedback-${question.id}-${correct}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <Feedback question={question} correct={correct} />
            </motion.div>
          )}

          <div className="flex gap-2">
            {!graded ? (
              <Button onClick={submit} disabled={answer === null} fullWidth size="lg">
                Check
              </Button>
            ) : (
              <>
                {!correct && (
                  <Button variant="secondary" size="lg" onClick={retry}>
                    <RotateCcw size={16} />
                    Try again
                  </Button>
                )}
                <Button
                  onClick={onContinue}
                  fullWidth
                  size="lg"
                  variant={correct ? "success" : "primary"}
                >
                  {continueLabel}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

function Feedback({ question, correct }: { question: Question; correct: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        correct ? "border-go/25 bg-go-soft" : "border-nogo/25 bg-nogo-soft",
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-white",
            correct ? "bg-go" : "bg-nogo",
          )}
        >
          {correct ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
        </span>
        <p className={cn("text-[15px] font-bold", correct ? "text-go-dark" : "text-nogo")}>
          {correct ? "Correct" : "Not quite"}
        </p>
      </div>
      <p className="text-[13.5px] leading-relaxed text-navy">{question.explanation}</p>
      {question.whyWrong && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-navy-soft">
          <span className="font-semibold text-navy">Why the others are wrong. </span>
          {question.whyWrong}
        </p>
      )}
      {question.knowCold && (
        <div className="mt-3 rounded-xl bg-surface/80 px-3 py-2">
          <p className="eyebrow text-navy-faint">Know cold</p>
          <p className="mt-0.5 text-[13px] font-semibold leading-snug text-navy">
            {question.knowCold}
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Body dispatcher                                                     */
/* ------------------------------------------------------------------ */

interface BodyProps {
  question: Question;
  answer: string | null;
  graded: boolean;
  onChange: (value: string) => void;
}

function QuestionBody({ question, answer, graded, onChange }: BodyProps) {
  switch (question.type) {
    case "mcq":
    case "spotTheTrap":
      return <ChoiceBody q={question} answer={answer} graded={graded} onChange={onChange} />;
    case "sliderPredict":
      return <SliderPredictBody q={question} answer={answer} graded={graded} onChange={onChange} />;
    case "curveShift":
      return <CurveShiftBody q={question} answer={answer} graded={graded} onChange={onChange} />;
    case "tapDiagram":
    case "graphRead":
      return <TapBody q={question} answer={answer} graded={graded} onChange={onChange} />;
    case "dragLabel":
      return <DragLabelBody q={question} answer={answer} graded={graded} onChange={onChange} />;
    case "connectChain":
      return <ConnectChainBody q={question} answer={answer} graded={graded} onChange={onChange} />;
    case "beforeAfter":
      return <BeforeAfterBody q={question} answer={answer} graded={graded} onChange={onChange} />;
  }
}

/* ------------------------------------------------------------------ */
/* Multiple choice / spot the trap                                     */
/* ------------------------------------------------------------------ */

const LETTERS = ["A", "B", "C", "D", "E", "F"];

function OptionRow({
  index,
  label,
  selected,
  state,
  onClick,
  compact = false,
}: {
  index: number;
  label: string;
  selected: boolean;
  state: "idle" | "correct" | "wrong" | "missed";
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all",
        state === "idle" &&
          (selected
            ? "border-brand bg-brand-soft"
            : "border-line bg-surface hover:border-line-strong hover:bg-surface-2"),
        state === "correct" && "border-go bg-go-soft",
        state === "wrong" && "border-nogo bg-nogo-soft",
        state === "missed" && "border-go/40 bg-go-soft/50",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg text-[12.5px] font-extrabold",
          compact ? "h-6 w-6" : "h-7 w-7",
          state === "correct" || state === "missed"
            ? "bg-go text-white"
            : state === "wrong"
              ? "bg-nogo text-white"
              : selected
                ? "bg-brand text-white"
                : "bg-surface-3 text-navy-soft",
        )}
      >
        {state === "correct" || state === "missed" ? (
          <Check size={14} strokeWidth={3} />
        ) : state === "wrong" ? (
          <X size={14} strokeWidth={3} />
        ) : (
          LETTERS[index]
        )}
      </span>
      <span className="pt-0.5 text-[14px] font-medium leading-snug text-navy">{label}</span>
    </button>
  );
}

function optionState(
  index: number,
  selectedIndex: number | null,
  correctIndex: number,
  graded: boolean,
): "idle" | "correct" | "wrong" | "missed" {
  if (!graded) return "idle";
  if (index === correctIndex) return selectedIndex === correctIndex ? "correct" : "missed";
  return index === selectedIndex ? "wrong" : "idle";
}

function ChoiceBody({
  q,
  answer,
  graded,
  onChange,
}: {
  q: McqQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (v: string) => void;
}) {
  const selected = answer?.startsWith("i:") ? Number(answer.slice(2)) : null;
  return (
    <div className="space-y-3">
      {q.diagram && (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface p-3">
          <DiagramHost id={q.diagram.id} props={q.diagram.props} caption={q.diagram.caption} />
        </div>
      )}
      <div className={cn("grid gap-2", q.options.length === 2 && "sm:grid-cols-2")}>
        {q.options.map((opt, i) => (
          <OptionRow
            key={i}
            index={i}
            label={opt}
            selected={selected === i}
            state={optionState(i, selected, q.answer, graded)}
            onClick={() => !graded && onChange(serializeAnswer({ kind: "index", value: i }))}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Slider predict                                                      */
/* ------------------------------------------------------------------ */

function SliderPredictBody({
  q,
  answer,
  graded,
  onChange,
}: {
  q: SliderPredictQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (v: string) => void;
}) {
  const selected = answer?.startsWith("i:") ? Number(answer.slice(2)) : null;
  return (
    <div className="space-y-3">
      <Widget name={q.widget} compact />
      <div className="grid gap-2">
        {q.options.map((opt, i) => (
          <OptionRow
            key={i}
            index={i}
            label={opt}
            selected={selected === i}
            state={optionState(i, selected, q.answer, graded)}
            onClick={() => !graded && onChange(serializeAnswer({ kind: "index", value: i }))}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Curve shift                                                         */
/* ------------------------------------------------------------------ */

const SHIFT_LABEL: Record<ShiftDirection, string> = {
  left: "Left",
  right: "Right",
  up: "Up",
  down: "Down",
  upRight: "Up and right",
  upLeft: "Up and left",
  downRight: "Down and right",
  downLeft: "Down and left",
  none: "No shift",
};

const SHIFT_ARROW: Record<ShiftDirection, string> = {
  left: "←",
  right: "→",
  up: "↑",
  down: "↓",
  upRight: "↗",
  upLeft: "↖",
  downRight: "↘",
  downLeft: "↙",
  none: "—",
};

function CurveShiftBody({
  q,
  answer,
  graded,
  onChange,
}: {
  q: CurveShiftQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (v: string) => void;
}) {
  const selected = answer?.startsWith("i:") ? Number(answer.slice(2)) : null;
  const correctIndex = q.options.indexOf(q.answer);
  // Once graded, animate the diagram to the true post-change state.
  const props = graded ? { ...q.diagram.props, ...q.afterProps } : q.diagram.props;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2 px-1">
          <Pill tone="nogo" size="sm">
            {q.change}
          </Pill>
          <span className="text-[12px] font-semibold text-navy-soft">
            Which way does the {q.curveLabel.toLowerCase()} move?
          </span>
        </div>
        <motion.div
          key={graded ? "after" : "before"}
          initial={graded ? { opacity: 0.55 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        >
          <DiagramHost id={q.diagram.id} props={props} />
        </motion.div>
        {graded && (
          <p className="mt-1 text-center text-[11.5px] font-semibold text-brand">
            Animated to the actual result. The dashed curve is the baseline.
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {q.options.map((opt, i) => {
          const state = optionState(i, selected, correctIndex, graded);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => !graded && onChange(serializeAnswer({ kind: "index", value: i }))}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border py-3 transition-all",
                state === "idle" &&
                  (selected === i
                    ? "border-brand bg-brand-soft"
                    : "border-line bg-surface hover:border-line-strong"),
                state === "correct" && "border-go bg-go-soft",
                state === "wrong" && "border-nogo bg-nogo-soft",
                state === "missed" && "border-go/40 bg-go-soft/50",
              )}
            >
              <span className="text-2xl leading-none text-navy">{SHIFT_ARROW[opt]}</span>
              <span className="text-[11.5px] font-semibold text-navy-soft">
                {SHIFT_LABEL[opt]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tap the diagram / read the graph                                    */
/* ------------------------------------------------------------------ */

function TapBody({
  q,
  answer,
  graded,
  onChange,
}: {
  q: TapDiagramQuestion | GraphReadQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (v: string) => void;
}) {
  const selected = answer?.startsWith("t:") ? answer.slice(2) : null;

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-3">
        <div className="relative">
          <DiagramHost id={q.diagram.id} props={q.diagram.props} />
          <svg
            viewBox="0 0 500 300"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {q.targets.map((t) => {
              const isSelected = selected === t.id;
              const isAnswer = t.id === q.answer;
              const stroke = graded
                ? isAnswer
                  ? "var(--color-go)"
                  : isSelected
                    ? "var(--color-nogo)"
                    : "transparent"
                : isSelected
                  ? "var(--color-brand)"
                  : "var(--color-navy-faint)";
              const fill = graded
                ? isAnswer
                  ? "color-mix(in srgb, var(--color-go) 18%, transparent)"
                  : isSelected
                    ? "color-mix(in srgb, var(--color-nogo) 16%, transparent)"
                    : "transparent"
                : isSelected
                  ? "color-mix(in srgb, var(--color-brand) 15%, transparent)"
                  : "color-mix(in srgb, var(--color-navy) 4%, transparent)";
              return (
                <g key={t.id}>
                  <circle
                    cx={t.x}
                    cy={t.y}
                    r={t.r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={2.2}
                    strokeDasharray={graded || isSelected ? undefined : "4 4"}
                    className={graded ? "" : "cursor-pointer"}
                    onClick={() => !graded && onChange(serializeAnswer({ kind: "target", value: t.id }))}
                  />
                  {graded && isAnswer && (
                    <text
                      x={t.x}
                      y={t.y - t.r - 6}
                      textAnchor="middle"
                      fill="var(--color-go)"
                      fontSize={11}
                      fontWeight={800}
                    >
                      {t.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <p className="text-center text-[12px] font-medium text-navy-faint">
        {graded
          ? `Correct target: ${q.targets.find((t) => t.id === q.answer)?.label}`
          : "Tap a highlighted region on the diagram."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Drag the label                                                      */
/* ------------------------------------------------------------------ */

function DragLabelBody({
  q,
  answer,
  graded,
  onChange,
}: {
  q: DragLabelQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (v: string) => void;
}) {
  const placed = useMemo<Record<string, string>>(() => {
    if (!answer?.startsWith("m:")) return {};
    const out: Record<string, string> = {};
    for (const pair of answer.slice(2).split("|")) {
      const [k, v] = pair.split("=");
      if (k && v) out[k] = v;
    }
    return out;
  }, [answer]);

  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const used = new Set(Object.values(placed));
  const remaining = q.labels.filter((l) => !used.has(l));

  const place = (slotId: string) => {
    if (graded) return;
    if (!activeLabel) {
      // Tapping a filled slot picks the label back up.
      if (placed[slotId]) {
        const next = { ...placed };
        delete next[slotId];
        onChange(serializeAnswer({ kind: "map", value: next }));
      }
      return;
    }
    const next = { ...placed };
    for (const k of Object.keys(next)) if (next[k] === activeLabel) delete next[k];
    next[slotId] = activeLabel;
    setActiveLabel(null);
    onChange(serializeAnswer({ kind: "map", value: next }));
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-3">
        <div className="relative">
          <DiagramHost id={q.diagram.id} props={q.diagram.props} />
          <svg viewBox="0 0 500 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
            {q.slots.map((slot) => {
              const value = placed[slot.id];
              const ok = graded && value === q.answer[slot.id];
              const bad = graded && value !== undefined && !ok;
              const w = Math.max(64, (value ?? "drop").length * 6.4 + 18);
              return (
                <g
                  key={slot.id}
                  className={graded ? "" : "cursor-pointer"}
                  onClick={() => place(slot.id)}
                >
                  <rect
                    x={slot.x - w / 2}
                    y={slot.y - 11}
                    width={w}
                    height={22}
                    rx={11}
                    fill={
                      ok
                        ? "var(--color-go-soft)"
                        : bad
                          ? "var(--color-nogo-soft)"
                          : value
                            ? "var(--color-brand-soft)"
                            : "var(--color-surface-2)"
                    }
                    stroke={
                      ok
                        ? "var(--color-go)"
                        : bad
                          ? "var(--color-nogo)"
                          : value
                            ? "var(--color-brand)"
                            : "var(--color-navy-faint)"
                    }
                    strokeWidth={1.8}
                    strokeDasharray={value ? undefined : "4 3"}
                  />
                  <text
                    x={slot.x}
                    y={slot.y + 4}
                    textAnchor="middle"
                    fontSize={10.5}
                    fontWeight={700}
                    fill={
                      ok
                        ? "var(--color-go)"
                        : bad
                          ? "var(--color-nogo)"
                          : value
                            ? "var(--color-brand)"
                            : "var(--color-navy-faint)"
                    }
                  >
                    {value ?? "drop here"}
                  </text>
                  {graded && bad && (
                    <text
                      x={slot.x}
                      y={slot.y + 22}
                      textAnchor="middle"
                      fontSize={9.5}
                      fontWeight={700}
                      fill="var(--color-go)"
                    >
                      → {q.answer[slot.id]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {!graded && (
        <div className="flex flex-wrap gap-2">
          {remaining.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveLabel(activeLabel === label ? null : label)}
              className={cn(
                "rounded-xl border px-3 py-2 text-[13px] font-semibold transition-all",
                activeLabel === label
                  ? "border-brand bg-brand text-white"
                  : "border-line bg-surface text-navy hover:border-line-strong",
              )}
            >
              {label}
            </button>
          ))}
          {remaining.length === 0 && (
            <p className="text-[12px] font-medium text-navy-faint">
              All labels placed. Tap a label on the diagram to move it.
            </p>
          )}
        </div>
      )}
      {!graded && (
        <p className="text-[12px] font-medium text-navy-faint">
          {activeLabel ? `Now tap where “${activeLabel}” belongs.` : "Pick a label, then tap its place on the diagram."}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Connect the chain                                                   */
/* ------------------------------------------------------------------ */

function ConnectChainBody({
  q,
  answer,
  graded,
  onChange,
}: {
  q: ConnectChainQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (v: string) => void;
}) {
  // Deterministic shuffle keyed on the question id, so the same student always
  // sees the same starting order and the exercise is reproducible.
  const shuffled = useMemo(() => {
    const s = seededShuffle(q.steps, q.id);
    // Guard against the shuffle happening to produce the answer.
    return s.join("|") === q.steps.join("|") ? [...s].reverse() : s;
  }, [q.id, q.steps]);

  const order = useMemo(
    () => (answer?.startsWith("o:") ? answer.slice(2).split("|") : shuffled),
    [answer, shuffled],
  );

  useEffect(() => {
    if (answer === null) onChange(serializeAnswer({ kind: "order", value: shuffled }));
    // Only seeds the initial order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  const move = (from: number, to: number) => {
    if (graded || to < 0 || to >= order.length) return;
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(serializeAnswer({ kind: "order", value: next }));
  };

  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-ink-800 px-4 py-3">
        <p className="eyebrow text-[#8fb0d4]">Trigger</p>
        <p className="mt-0.5 text-[14px] font-semibold text-white">{q.trigger}</p>
      </div>

      <ul className="space-y-2">
        {order.map((step, i) => {
          const ok = graded && q.steps[i] === step;
          return (
            <li key={step}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                  graded
                    ? ok
                      ? "border-go bg-go-soft"
                      : "border-nogo bg-nogo-soft"
                    : "border-line bg-surface",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12.5px] font-extrabold",
                    graded ? (ok ? "bg-go text-white" : "bg-nogo text-white") : "bg-surface-3 text-navy-soft",
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex-1 text-[13.5px] font-medium leading-snug text-navy">
                  {step}
                </span>
                {!graded && (
                  <span className="flex shrink-0 flex-col gap-0.5">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={i === 0}
                      onClick={() => move(i, i - 1)}
                      className="flex h-6 w-7 items-center justify-center rounded-md bg-surface-2 text-navy-soft transition-colors hover:bg-surface-3 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={i === order.length - 1}
                      onClick={() => move(i, i + 1)}
                      className="flex h-6 w-7 items-center justify-center rounded-md bg-surface-2 text-navy-soft transition-colors hover:bg-surface-3 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </span>
                )}
              </div>
              {i < order.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <span className="text-[15px] font-bold text-navy-faint">↓</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {graded && (
        <div className="rounded-xl bg-surface-2 p-3">
          <p className="eyebrow mb-1.5 text-navy-faint">Correct order</p>
          <ol className="space-y-1">
            {q.steps.map((s, i) => (
              <li key={s} className="text-[12.5px] font-medium text-navy">
                {i + 1}. {s}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Before / after                                                      */
/* ------------------------------------------------------------------ */

function BeforeAfterBody({
  q,
  answer,
  graded,
  onChange,
}: {
  q: BeforeAfterQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (v: string) => void;
}) {
  const values = useMemo<number[]>(
    () =>
      answer?.startsWith("r:")
        ? answer.slice(2).split("|").map(Number)
        : q.rows.map(() => -1),
    [answer, q.rows],
  );
  const [showAfter, setShowAfter] = useState(false);
  const active = graded || showAfter;

  const setRow = (rowIndex: number, optionIndex: number) => {
    if (graded) return;
    const next = [...values];
    next[rowIndex] = optionIndex;
    onChange(serializeAnswer({ kind: "rows", value: next }));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 flex gap-1 rounded-xl bg-surface-3 p-1">
          {[0, 1].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setShowAfter(i === 1)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-all",
                (i === 1) === active ? "bg-surface text-navy shadow-sm" : "text-navy-soft",
              )}
            >
              {q.states[i]}
            </button>
          ))}
        </div>
        <DiagramHost
          id={q.diagram.id}
          props={{ ...q.diagram.props, ...(active ? q.afterProps : q.beforeProps) }}
        />
      </div>

      <ul className="space-y-2">
        {q.rows.map((row, ri) => {
          const chosen = values[ri];
          const rowGraded = graded;
          return (
            <li key={row.label} className="rounded-xl border border-line bg-surface p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-navy">{row.label}</p>
                {rowGraded && (
                  <Pill tone={chosen === row.answer ? "go" : "nogo"} size="sm">
                    {chosen === row.answer ? "Correct" : row.options[row.answer]}
                  </Pill>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {row.options.map((opt, oi) => {
                  const state = optionState(oi, chosen, row.answer, rowGraded);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRow(ri, oi)}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-[12px] font-semibold transition-all",
                        state === "idle" &&
                          (chosen === oi
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-line bg-surface text-navy-soft hover:border-line-strong"),
                        state === "correct" && "border-go bg-go-soft text-go",
                        state === "wrong" && "border-nogo bg-nogo-soft text-nogo",
                        state === "missed" && "border-go/40 bg-go-soft/50 text-go",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Read-only review card                                               */
/* ------------------------------------------------------------------ */

/** Shows a question with its correct answer revealed — used on results screens. */
export function QuestionReview({
  question,
  givenAnswer,
}: {
  question: Question;
  givenAnswer?: string;
}) {
  const key = correctKey(question);
  const wasCorrect = givenAnswer === key;
  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
            wasCorrect ? "bg-go" : "bg-nogo",
          )}
        >
          {wasCorrect ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-semibold leading-snug text-navy">{question.prompt}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {question.conceptIds.map((id) => (
              <Pill key={id} tone="neutral" size="sm">
                {CONCEPT_BY_ID[id]?.name ?? id}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <AnswerSummary question={question} givenAnswer={givenAnswer} />

      <div className="rounded-xl bg-surface-2 p-3">
        <p className="text-[13px] leading-relaxed text-navy">{question.explanation}</p>
        {question.knowCold && (
          <p className="mt-2 text-[12.5px] font-semibold text-navy">
            <span className="eyebrow mr-1.5 text-navy-faint">Know cold</span>
            {question.knowCold}
          </p>
        )}
      </div>
    </Card>
  );
}

function AnswerSummary({
  question,
  givenAnswer,
}: {
  question: Question;
  givenAnswer?: string;
}) {
  const describe = (key: string | undefined): string => {
    if (!key) return "Not answered";
    if (key.startsWith("i:")) {
      const i = Number(key.slice(2));
      if (question.type === "curveShift") return SHIFT_LABEL[question.options[i]] ?? "—";
      if ("options" in question) return question.options[i] ?? "—";
      return `Option ${LETTERS[i]}`;
    }
    if (key.startsWith("t:")) {
      const id = key.slice(2);
      if (question.type === "tapDiagram" || question.type === "graphRead") {
        return question.targets.find((t) => t.id === id)?.label ?? id;
      }
      return id;
    }
    if (key.startsWith("o:")) return key.slice(2).split("|").join(" → ");
    if (key.startsWith("r:")) return "See rows above";
    if (key.startsWith("m:")) return key.slice(2).split("|").join(", ");
    return key;
  };

  const key = correctKey(question);
  const wasCorrect = givenAnswer === key;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className={cn("rounded-xl px-3 py-2", wasCorrect ? "bg-go-soft" : "bg-nogo-soft")}>
        <p className="eyebrow text-navy-faint">Your answer</p>
        <p className={cn("mt-0.5 text-[13px] font-semibold", wasCorrect ? "text-go" : "text-nogo")}>
          {describe(givenAnswer)}
        </p>
      </div>
      {!wasCorrect && (
        <div className="rounded-xl bg-go-soft px-3 py-2">
          <p className="eyebrow text-navy-faint">Correct answer</p>
          <p className="mt-0.5 text-[13px] font-semibold text-go">{describe(key)}</p>
        </div>
      )}
    </div>
  );
}
