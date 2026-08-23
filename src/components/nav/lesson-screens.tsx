"use client";

/**
 * The two Navigation lesson screens that need live components.
 *
 * `WorkedExample` shows a problem with its solution already unlocked — the
 * point of a worked example is to watch, so it does not gate the replay behind
 * an attempt. `NavToolPanel` drops an instrument straight into the lesson, so
 * "here is the plotter" is followed immediately by the plotter.
 */

import { useState } from "react";
import { ChevronRight, Play } from "lucide-react";
import type { NavToolId, NumericQuestion, Question } from "@/lib/types";
import { formatFieldValue } from "@/lib/nav/grade";
import { Cr3Calc } from "./cr3-calc";
import { Cr3Wind, type WindMode } from "./cr3-wind";
import { ChartWorkspace } from "./chart-workspace";
import { GivenBlock, JetLog, ReferenceCard, ScratchPad, ZoneWheel, emptyJetLogRow, type JetLogMode, type JetLogRow } from "./tools";
import { TOOL_META } from "./tool-tray";
import { Card, Pill, cn } from "../ui";

/* ------------------------------------------------------------------ */
/* Worked example                                                      */
/* ------------------------------------------------------------------ */

export function WorkedExample({ question }: { question: Question }) {
  if (question.type !== "numeric") {
    return (
      <Card>
        <p className="text-[14px] font-semibold text-navy">{question.prompt}</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-navy-soft">{question.explanation}</p>
      </Card>
    );
  }
  return <NumericWorkedExample question={question} />;
}

function NumericWorkedExample({ question }: { question: NumericQuestion }) {
  const [step, setStep] = useState(0);
  const shown = question.worked.slice(0, step + 1);
  const done = step >= question.worked.length - 1;

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <p className="text-[14.5px] font-semibold leading-snug text-navy">{question.prompt}</p>
        <GivenBlock items={question.given} />
      </Card>

      <div className="rounded-2xl border border-line bg-surface p-3.5">
        <p className="eyebrow mb-2.5 text-navy-faint">
          Step {step + 1} of {question.worked.length}
        </p>
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
                <p className="text-[13.5px] font-semibold leading-snug text-navy">{s.action}</p>
                {s.detail && (
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-navy-soft">{s.detail}</p>
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

        {!done ? (
          <button
            type="button"
            onClick={() => setStep((n) => n + 1)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2.5 text-[13.5px] font-bold text-white"
          >
            {step === 0 ? (
              <>
                <Play size={14} /> Next step
              </>
            ) : (
              <>
                Next step <ChevronRight size={15} />
              </>
            )}
          </button>
        ) : (
          <div className="mt-3 rounded-xl border border-go/25 bg-go-soft px-3 py-2.5">
            <p className="eyebrow mb-1.5 text-go-dark">The answer</p>
            <div className="space-y-1">
              {question.fields.map((f) => (
                <div key={f.key} className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[12.5px] font-semibold text-navy-soft">{f.label}</span>
                  <span className="figure text-[14px] font-bold text-go-dark">
                    {formatFieldValue(f.answer, f.unit)}
                    {f.qualifier ? ` ${f.qualifier.answer}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Embedded instrument                                                 */
/* ------------------------------------------------------------------ */

export function NavToolPanel({
  tool,
  props = {},
}: {
  tool: NavToolId;
  props?: Record<string, unknown>;
}) {
  const [rows, setRows] = useState<JetLogRow[]>([
    emptyJetLogRow(),
    emptyJetLogRow(),
    emptyJetLogRow(),
  ]);

  switch (tool) {
    case "cr3calc":
      return <Cr3Calc mode="training" />;
    case "cr3wind":
      return <Cr3Wind mode={(props.mode as WindMode) ?? "preflight"} training />;
    case "chart":
      return <ChartWorkspace height={420} />;
    case "jetlog":
      return <JetLog rows={rows} onChange={setRows} mode={(props.mode as JetLogMode) ?? "learn"} />;
    case "scratch":
      return <ScratchPad height={280} />;
    case "timezone":
      return <ZoneWheel initialZd={(props.zd as number) ?? -6} />;
    case "reference":
      return <ReferenceCard only={props.only as string[] | undefined} />;
  }
}
