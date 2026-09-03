"use client";

/**
 * The numeric problem body.
 *
 * A navigation question is a small piece of work rather than a choice: here is
 * what you were handed, here are the tools, produce these numbers to these
 * tolerances. The shape of the screen follows the shape of the procedure —
 * given, estimate, tools, answers — and the feedback follows the shape of the
 * error, naming which output broke and what kind of mistake it looks like.
 *
 * Estimating comes before the tools and cannot be skipped where a problem
 * carries one. The trainee guide prints "ESTIMATE!" above step one of every
 * wind solution and repeats it through the ratio, time, speed and fuel
 * sections, and it is not politeness: on a floating-decimal slide rule the
 * estimate is the only thing standing between a student and an answer that is
 * ten times too large.
 */

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronRight, Lightbulb, Play, X } from "lucide-react";
import type { NumericQuestion } from "@/lib/types";
import {
  UNIT_LABEL,
  deserializeFields,
  diagnoseField,
  formatFieldValue,
  gradeNumeric,
  serializeFields,
  type NumericAnswerMap,
} from "@/lib/nav/grade";
import { TOLERANCES } from "@/lib/nav/math";
import { NavToolTray, TOOL_META } from "./tool-tray";
import { useCourse } from "@/lib/course";
import { GivenBlock } from "./tools";
import { Pill, cn } from "../ui";

export function NumericBody({
  question,
  answer,
  graded,
  onChange,
  examMode = false,
}: {
  question: NumericQuestion;
  answer: string | null;
  graded: boolean;
  onChange: (value: string) => void;
  /** Under exam conditions the course's tool policy overrides the question's. */
  examMode?: boolean;
}) {
  const { meta } = useCourse();
  const values = useMemo<NumericAnswerMap>(
    () => (answer ? deserializeFields(answer) : {}),
    [answer],
  );

  const [estimate, setEstimate] = useState<number | null>(null);
  const needsEstimate = question.estimate !== undefined && estimate === null && !graded;

  const set = (key: string, raw: string, qualifier?: string) => {
    const next: NumericAnswerMap = { ...values };
    const q = qualifier ?? (values[key]?.includes("~") ? values[key].split("~")[1] : undefined);
    next[key] = q ? `${raw}~${q}` : raw;
    onChange(serializeFields(next));
  };

  const fieldValue = (key: string) => (values[key] ?? "").split("~")[0];
  const fieldQualifier = (key: string) => {
    const v = values[key] ?? "";
    return v.includes("~") ? v.split("~")[1] : undefined;
  };

  const verdict = graded && answer ? gradeNumeric(question, answer) : null;

  /*
   * A question names the tools its method needs. An exam names the tools the
   * examination room allows. Under exam conditions the second wins, and the
   * intersection is what appears — so a problem that would normally offer the
   * reference card simply does not, because the real test does not either.
   */
  const policy = examMode ? meta.examPolicy : undefined;
  const tools = policy
    ? (question.allowedTools ?? []).filter((t) => policy.allowedTools.includes(t))
    : (question.allowedTools ?? []);

  const body = (
    <div className="space-y-3">
      <GivenBlock items={question.given} />

      {question.estimate && (
        <EstimateGate
          prompt={question.estimate.prompt}
          options={question.estimate.options}
          answerIndex={question.estimate.answer}
          why={question.estimate.why}
          chosen={estimate}
          onChoose={setEstimate}
          reveal={graded}
        />
      )}

      <fieldset
        disabled={needsEstimate}
        className={cn(
          "space-y-2 transition-opacity",
          needsEstimate && "pointer-events-none opacity-40",
        )}
      >
        <legend className="eyebrow mb-1 text-navy-faint">
          {question.fields.length > 1 ? "Your answers" : "Your answer"}
        </legend>
        {question.fields.map((field) => {
          const fv = verdict?.fields.find((f) => f.key === field.key);
          return (
            <div
              key={field.key}
              className={cn(
                "rounded-xl border px-3 py-2.5",
                fv?.correct === true
                  ? "border-go/30 bg-go-soft"
                  : fv?.correct === false
                    ? "border-nogo/30 bg-nogo-soft"
                    : "border-line bg-surface",
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <label
                  htmlFor={`nf-${question.id}-${field.key}`}
                  className="min-w-[8rem] flex-1 text-[13px] font-bold text-navy"
                >
                  {field.label}
                </label>

                {field.qualifier && (
                  <div className="flex overflow-hidden rounded-lg border border-line-strong">
                    {field.qualifier.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => set(field.key, fieldValue(field.key), opt)}
                        aria-pressed={fieldQualifier(field.key) === opt}
                        className={cn(
                          "px-2.5 py-1 text-[11.5px] font-bold transition-colors",
                          fieldQualifier(field.key) === opt
                            ? "bg-ink-800 text-white"
                            : "bg-surface text-navy-soft hover:bg-surface-2",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    id={`nf-${question.id}-${field.key}`}
                    value={fieldValue(field.key)}
                    onChange={(e) => set(field.key, e.target.value)}
                    inputMode={field.unit === "elapsed" || field.unit === "clock" ? "text" : "decimal"}
                    placeholder={
                      field.unit === "elapsed" ? "1+24+33" : field.unit === "clock" ? "1427" : ""
                    }
                    aria-describedby={`nt-${question.id}-${field.key}`}
                    className="figure h-10 w-32 rounded-lg border border-line-strong bg-surface px-2.5 pr-12 text-[15px] font-bold text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-navy-faint">
                    {UNIT_LABEL[field.unit]}
                  </span>
                </div>

                {fv && (
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white",
                      fv.correct ? "bg-go" : "bg-nogo",
                    )}
                  >
                    {fv.correct ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                  </span>
                )}
              </div>

              <p
                id={`nt-${question.id}-${field.key}`}
                className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-navy-faint"
              >
                {TOLERANCES[field.tolerance].label}
                {field.qualifier ? ` · ${field.qualifier.label}` : ""}
              </p>

              {fv && !fv.correct && <FieldVerdictLine verdict={fv} field={field} />}
            </div>
          );
        })}
      </fieldset>

      {graded && <WorkedSolution question={question} />}
    </div>
  );

  if (tools.length === 0) return body;

  return (
    <NavToolTray allowed={tools} scratchKey={question.id} layout="panel">
      {body}
    </NavToolTray>
  );
}

/* ------------------------------------------------------------------ */
/* Estimate first                                                      */
/* ------------------------------------------------------------------ */

function EstimateGate({
  prompt,
  options,
  answerIndex,
  why,
  chosen,
  onChoose,
  reveal,
}: {
  prompt: string;
  options: string[];
  answerIndex: number;
  why: string;
  chosen: number | null;
  onChoose: (i: number) => void;
  reveal: boolean;
}) {
  const settled = chosen !== null;
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5",
        settled ? "border-line bg-surface-2" : "border-brand/35 bg-brand-soft",
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Lightbulb size={14} className="text-brand-dark" />
        <p className="eyebrow text-brand-dark">Estimate first</p>
      </div>
      <p className="mb-2 text-[13.5px] font-semibold leading-snug text-navy">{prompt}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => {
          const isKey = i === answerIndex;
          const picked = chosen === i;
          const show = settled || reveal;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => chosen === null && onChoose(i)}
              disabled={settled}
              className={cn(
                "figure rounded-lg border px-3 py-1.5 text-[13px] font-bold transition-colors",
                !show && "border-line-strong bg-surface text-navy hover:border-brand hover:bg-surface",
                show && isKey && "border-go bg-go-soft text-go-dark",
                show && !isKey && picked && "border-nogo bg-nogo-soft text-nogo",
                show && !isKey && !picked && "border-line bg-surface text-navy-faint",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {settled && (
        <p className="mt-2 text-[12px] leading-relaxed text-navy-soft">
          {chosen === answerIndex ? (
            <span className="font-bold text-go-dark">Good estimate. </span>
          ) : (
            <span className="font-bold text-nogo">Off. </span>
          )}
          {why}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Field feedback                                                      */
/* ------------------------------------------------------------------ */

function FieldVerdictLine({
  verdict,
  field,
}: {
  verdict: ReturnType<typeof gradeNumeric>["fields"][number];
  field: NumericQuestion["fields"][number];
}) {
  const diagnosis = diagnoseField(verdict);
  return (
    <div className="mt-2 border-t border-nogo/20 pt-2">
      <p className="text-[12.5px] leading-relaxed text-navy">
        <span className="font-bold">Answer </span>
        <span className="figure font-bold">{formatFieldValue(field.answer, field.unit)}</span>
        {field.qualifier && (
          <span className="font-bold"> {field.qualifier.answer}</span>
        )}
        {verdict.value !== null && (
          <>
            <span className="text-navy-soft"> · you were </span>
            <span className="figure font-bold text-nogo">
              {verdict.error !== null
                ? `${verdict.error > 0 ? "+" : ""}${Math.abs(verdict.error) < 1 ? verdict.error.toFixed(2) : Math.round(verdict.error)}`
                : "—"}
            </span>
            <span className="text-navy-soft"> off, allowance ±{formatBand(verdict.band)}</span>
          </>
        )}
      </p>
      {diagnosis && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-caution" />
          <p className="text-[12px] leading-relaxed text-navy-soft">
            <span className="font-bold text-navy">{diagnosis.label}. </span>
            {diagnosis.advice}
          </p>
        </div>
      )}
    </div>
  );
}

function formatBand(band: number): string {
  if (band === 0) return "0";
  if (band < 1) return band.toFixed(2);
  if (band < 10) return band.toFixed(1);
  return String(Math.round(band));
}

/* ------------------------------------------------------------------ */
/* Solution replay                                                     */
/* ------------------------------------------------------------------ */

/**
 * Not the equation — the workflow. The guide solves every problem as a numbered
 * sequence of physical operations, and stepping through those is what watching
 * an instructor work beside you actually looks like.
 */
function WorkedSolution({ question }: { question: NumericQuestion }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  if (question.worked.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface py-2.5 text-[13px] font-bold text-navy-soft transition-colors hover:border-brand hover:text-brand"
      >
        <Play size={14} />
        Watch it solved
      </button>
    );
  }

  const shown = question.worked.slice(0, step + 1);
  const last = step >= question.worked.length - 1;

  return (
    <div className="rounded-xl border border-line-strong bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="eyebrow text-navy-faint">
          Solution · step {step + 1} of {question.worked.length}
        </p>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setStep(0);
          }}
          className="text-[11.5px] font-semibold text-navy-faint hover:text-navy"
        >
          Close
        </button>
      </div>

      <ol className="space-y-2">
        {shown.map((s, i) => (
          <li
            key={i}
            className={cn(
              "flex gap-2.5 rounded-lg px-2.5 py-2 transition-colors",
              i === step ? "bg-brand-soft" : "bg-surface-2",
            )}
          >
            <span
              className={cn(
                "figure flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                i === step ? "bg-brand text-white" : "bg-surface-3 text-navy-soft",
              )}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-snug text-navy">{s.action}</p>
              {s.detail && (
                <p className="mt-0.5 text-[12px] leading-relaxed text-navy-soft">{s.detail}</p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {s.tool && (
                  <Pill tone="neutral" size="sm">
                    {TOOL_META[s.tool].short}
                  </Pill>
                )}
                {s.result && (
                  <span className="figure rounded-md bg-ink-800 px-2 py-0.5 text-[11.5px] font-bold text-white">
                    {s.result}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {!last && (
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[13px] font-bold text-white"
        >
          Next step
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review rendering                                                    */
/* ------------------------------------------------------------------ */

/** The answer summary shown in review and exam results. */
export function NumericAnswerSummary({
  question,
  given,
}: {
  question: NumericQuestion;
  given?: string;
}) {
  const verdict = given ? gradeNumeric(question, given) : null;
  return (
    <div className="space-y-1">
      {question.fields.map((f) => {
        const v = verdict?.fields.find((x) => x.key === f.key);
        return (
          <div key={f.key} className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
            <span className="font-semibold text-navy-soft">{f.label}</span>
            <span className="figure font-bold text-go-dark">
              {formatFieldValue(f.answer, f.unit)}
              {f.qualifier ? ` ${f.qualifier.answer}` : ""}
            </span>
            {v && !v.correct && (
              <span className="figure text-navy-faint">
                (you: {v.given || "blank"})
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
