"use client";

/**
 * Missions.
 *
 * One continuous problem, worked in stages, with the situation card and the
 * jet log persisting the whole way through. This is the capstone: a chart
 * measurement feeds a wind solution feeds a rate problem feeds a fuel problem,
 * and then a fix says the forecast was wrong and the second half is done again
 * with the numbers that actually happened.
 *
 * The jet log stays open across every stage, because on a real flight it does.
 */

import { useCallback, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Target } from "lucide-react";
import type { Mission, Question } from "@/lib/types";
import { COURSE_OF_UNIT, QUESTION_BY_ID, UNIT_BY_ID } from "@/content";
import { useProgress } from "@/lib/progress-store";
import { useCourse, useEnsureCourse } from "@/lib/course";
import { QuestionPlayer, type QuestionResult } from "@/components/questions";
import { ButtonLink, Card, PageHeader, Pill, ProgressBar, cn } from "@/components/ui";
import { JetLog, emptyJetLogRow, type JetLogRow } from "./tools";
import { NavToolTray } from "./tool-tray";
import type { NavToolId } from "@/lib/types";

const MISSION_TOOLS: NavToolId[] = [
  "chart",
  "cr3calc",
  "cr3wind",
  "jetlog",
  "scratch",
  "timezone",
  "reference",
];

export function MissionRunner({ mission }: { mission: Mission }) {
  // Reached by direct link from any course; file the reps against this one.
  useEnsureCourse(COURSE_OF_UNIT[mission.unit]);
  const { recordAnswer } = useProgress();
  const unit = UNIT_BY_ID[mission.unit];

  const [stageIndex, setStageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<string, boolean>>({});
  const [rows, setRows] = useState<JetLogRow[]>(
    (mission.jetLogLegs ?? ["", "", ""]).map((name) => emptyJetLogRow(name)),
  );

  const stage = mission.stages[stageIndex];
  const questions = (stage?.questionIds ?? [])
    .map((id) => QUESTION_BY_ID[id])
    .filter(Boolean) as Question[];
  const current = questions[questionIndex];
  const finished = stageIndex >= mission.stages.length;

  const handleAnswer = useCallback(
    (r: QuestionResult) => {
      const q = QUESTION_BY_ID[r.questionId];
      if (!q) return;
      recordAnswer({
        questionId: r.questionId,
        conceptIds: q.conceptIds,
        correct: r.correct,
        firstTry: r.firstTry,
        elapsedMs: r.elapsedMs,
        context: "lesson",
        answerKey: r.answerKey,
      });
      setOutcomes((prev) => ({ ...prev, [r.questionId]: r.correct }));
    },
    [recordAnswer],
  );

  const advance = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((i) => i + 1);
    } else {
      setStageIndex((s) => s + 1);
      setQuestionIndex(0);
    }
  };

  if (finished) {
    return <MissionSummary mission={mission} outcomes={outcomes} rows={rows} />;
  }

  const answered = Object.keys(outcomes).length;
  const totalQuestions = mission.stages.reduce((s, st) => s + st.questionIds.length, 0);

  return (
    <>
      <Link
        href="/missions"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-soft transition-colors hover:text-navy"
      >
        <ArrowLeft size={15} />
        All missions
      </Link>

      <div className="mb-4">
        <p className="eyebrow text-brand">
          Mission · Unit {unit?.index} {unit?.title}
        </p>
        <h1 className="mt-0.5 text-[22px] font-semibold leading-tight text-navy">{mission.title}</h1>
        <p className="mt-0.5 text-[13px] text-navy-soft">{mission.subtitle}</p>
      </div>

      <div className="mb-4">
        <ProgressBar value={answered / Math.max(1, totalQuestions)} tone="brand" height={5} />
        <ol className="mt-2.5 flex flex-wrap gap-1.5">
          {mission.stages.map((s, i) => (
            <li
              key={s.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold",
                i < stageIndex
                  ? "bg-go-soft text-go-dark"
                  : i === stageIndex
                    ? "bg-brand text-white"
                    : "bg-surface-2 text-navy-faint",
              )}
            >
              {i < stageIndex ? <CheckCircle2 size={12} /> : <Circle size={12} />}
              {s.title}
            </li>
          ))}
        </ol>
      </div>

      <NavToolTray
        allowed={MISSION_TOOLS}
        scratchKey={mission.id}
        jetLog={{ rows, onChange: setRows }}
        layout="panel"
      >
        <div className="space-y-4">
          <Card className="border-brand/25 bg-brand-soft/35">
            <p className="eyebrow mb-1.5 text-brand-dark">The situation</p>
            <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2">
              {mission.situation.map((item) => (
                <div key={item.label} className="flex items-baseline justify-between gap-2">
                  <span className="text-[11.5px] font-semibold text-navy-soft">{item.label}</span>
                  <span className="figure text-[13px] font-bold text-navy">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="eyebrow mb-1 text-navy-faint">
              Stage {stageIndex + 1} · {stage.title}
            </p>
            <p className="mb-4 text-[13.5px] leading-relaxed text-navy-soft">{stage.brief}</p>
            {current ? (
              <QuestionPlayer
                key={current.id}
                question={current}
                onAnswer={handleAnswer}
                onContinue={advance}
                continueLabel={
                  questionIndex + 1 < questions.length
                    ? "Next"
                    : stageIndex + 1 < mission.stages.length
                      ? "Next stage"
                      : "Finish the mission"
                }
                showConcepts={false}
              />
            ) : (
              <p className="text-[13px] text-navy-soft">This stage has nothing to work.</p>
            )}
          </Card>

          {mission.jetLogLegs && (
            <Card>
              <p className="eyebrow mb-2 text-navy-faint">Your jet log</p>
              <JetLog rows={rows} onChange={setRows} mode="mission" />
            </Card>
          )}
        </div>
      </NavToolTray>
    </>
  );
}

/* ------------------------------------------------------------------ */

function MissionSummary({
  mission,
  outcomes,
  rows,
}: {
  mission: Mission;
  outcomes: Record<string, boolean>;
  rows: JetLogRow[];
}) {
  const all = mission.stages.flatMap((s) => s.questionIds);
  const correct = all.filter((id) => outcomes[id]).length;
  const pct = Math.round((correct / Math.max(1, all.length)) * 100);

  return (
    <>
      <PageHeader
        eyebrow="Mission complete"
        title={mission.title}
        subtitle={`${correct} of ${all.length} stages solved inside tolerance.`}
      />

      <Card className={cn(pct >= 80 ? "border-go/30 bg-go-soft/50" : "border-caution/30 bg-caution-soft/40")}>
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
              pct >= 80 ? "bg-go text-white" : "bg-caution text-white",
            )}
          >
            <Target size={24} />
          </span>
          <div>
            <p className="figure text-[28px] font-extrabold leading-none text-navy">{pct}%</p>
            <p className="mt-1 text-[13px] leading-snug text-navy-soft">
              {pct >= 80
                ? "The chain held all the way to the fuel figure."
                : "Appendix A calls this a pyramid for a reason — check which step broke first, because everything after it inherited the error."}
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-3">
        {mission.stages.map((stage, i) => (
          <Card key={stage.id} padded={false}>
            <div className="flex items-center gap-2.5 border-b border-line px-4 py-2.5">
              <span className="figure flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 text-[11px] font-extrabold text-navy-soft">
                {i + 1}
              </span>
              <p className="text-[13.5px] font-semibold text-navy">{stage.title}</p>
              <span className="ml-auto">
                {stage.questionIds.every((id) => outcomes[id]) ? (
                  <Pill tone="go" size="sm">Solved</Pill>
                ) : (
                  <Pill tone="nogo" size="sm">Missed</Pill>
                )}
              </span>
            </div>
            <ul className="divide-y divide-line">
              {stage.questionIds.map((id) => {
                const q = QUESTION_BY_ID[id];
                return (
                  <li key={id} className="flex items-start gap-2.5 px-4 py-2.5">
                    {outcomes[id] ? (
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-go" />
                    ) : (
                      <Circle size={15} className="mt-0.5 shrink-0 text-nogo" />
                    )}
                    <p className="text-[12.5px] leading-relaxed text-navy">{q?.prompt}</p>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      {mission.jetLogLegs && (
        <Card className="mt-4">
          <p className="eyebrow mb-2 text-navy-faint">The log you filled</p>
          <JetLog rows={rows} mode="mission" readOnly />
        </Card>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <ButtonLink href="/missions" size="lg">
          All missions
        </ButtonLink>
        <ButtonLink href="/nav-desk" variant="secondary" size="lg">
          Open the desk
        </ButtonLink>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

export function MissionIndex() {
  const { content } = useCourse();
  const { state } = useProgress();
  const missions = content.missions ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Missions"
        title="Put it back together"
        subtitle="One continuous problem: plot the route, work the winds, compute the times and the fuel — then take a fix and do the second half again with the numbers that actually happened."
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {missions.map((mission) => {
          const unit = UNIT_BY_ID[mission.unit];
          const all = mission.stages.flatMap((s) => s.questionIds);
          const attempted = all.filter((id) =>
            state.attempts.some((a) => a.questionId === id),
          ).length;
          return (
            <li key={mission.id}>
              <Link
                href={`/missions/${mission.id}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
                    <Target size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-navy-faint">
                      Unit {unit?.index} · {unit?.title}
                    </p>
                    <h3 className="mt-0.5 text-[17px] font-semibold text-navy">{mission.title}</h3>
                    <p className="text-[12.5px] text-navy-soft">{mission.subtitle}</p>
                  </div>
                </div>

                <ol className="mt-3.5 flex-1 space-y-1.5">
                  {mission.stages.map((s, i) => (
                    <li key={s.id} className="flex gap-2">
                      <span className="figure mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[9.5px] font-extrabold text-navy-soft">
                        {i + 1}
                      </span>
                      <span className="text-[12.5px] leading-snug text-navy">{s.title}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[11.5px] font-semibold text-navy-faint">
                    {mission.skillIds.length} skills · {all.length} problems
                  </span>
                  <Pill tone={attempted === 0 ? "neutral" : attempted === all.length ? "go" : "brand"} size="sm">
                    {attempted === 0 ? "Not started" : `${attempted}/${all.length}`}
                  </Pill>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
