"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { AlertTriangle, ArrowRight, BookOpen, FlaskConical, Sparkles } from "lucide-react";
import {
  CONCEPT_BY_ID,
  UNIT_BY_ID,
  courseOfConcept,
  lessonsForConcept,
  questionsForConcept,
} from "@/content";
import { MASTERY_LABELS } from "@/lib/mastery";
import { useProgress } from "@/lib/progress-store";
import { useCourse, useEnsureCourse } from "@/lib/course";
import { QuestionReview } from "@/components/questions";
import { MakeItClick } from "@/components/click/trigger";
import {
  ButtonLink,
  Card,
  Formula,
  PageHeader,
  Pill,
  ProgressBar,
  SectionHeading,
  cn,
} from "@/components/ui";

export default function ConceptPage() {
  const params = useParams<{ id: string }>();
  const { state } = useProgress();
  const { content } = useCourse();
  /*
   * Concepts resolve by global id, but everything this page shows around one
   * — the mastery record, the explainers, the labs, the Know Cold cards, and
   * where "Drill this" leads — comes from the ACTIVE course. Opening an
   * Aerodynamics concept while Engines is active therefore showed an empty
   * mastery bar and drilled the wrong subject. Called before the notFound so
   * the hook order is unconditional.
   */
  useEnsureCourse(courseOfConcept(params.id));
  const concept = CONCEPT_BY_ID[params.id];
  if (!concept) notFound();

  const record = state.mastery[concept.id];
  const level = record?.level ?? 0;
  const questions = questionsForConcept(concept.id);
  const lessons = lessonsForConcept(concept.id);
  const explainers = content.explainers.filter((e) => e.conceptIds.includes(concept.id));
  const labs = content.labs.filter((l) => l.conceptIds.includes(concept.id));
  const cards = content.knowCold.filter((k) => k.conceptIds.includes(concept.id));
  const unit = UNIT_BY_ID[concept.unit];

  const answered = state.attempts.filter((a) => a.conceptIds.includes(concept.id));
  const correct = answered.filter((a) => a.correct).length;
  const missedQuestionIds = new Set(
    answered.filter((a) => !a.correct).map((a) => a.questionId),
  );

  return (
    <>
      <PageHeader
        eyebrow={`Unit ${unit.index} · ${unit.title}`}
        title={concept.name}
        subtitle={concept.definition}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* This page is where a weak concept and a review session both land,
                so it is the natural place to offer a different explanation
                before offering more repetitions of the same one. */}
            <MakeItClick conceptId={concept.id} />
            <ButtonLink href="/review/weak" size="md">
              Drill this
              <ArrowRight size={16} />
            </ButtonLink>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {concept.formula && (
            <Card>
              <p className="eyebrow mb-2 text-navy-faint">Formula</p>
              <div className="rounded-xl bg-surface-2 px-4 py-4">
                <Formula tex={concept.formula} display />
              </div>
            </Card>
          )}

          {concept.relationships && concept.relationships.length > 0 && (
            <section>
              <SectionHeading eyebrow="Cause and effect" title="Relationships" />
              <Card>
                <ul className="space-y-2">
                  {concept.relationships.map((r) => (
                    <li key={r} className="flex gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <span className="text-[13.5px] leading-relaxed text-navy">{r}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {concept.commonTraps && concept.commonTraps.length > 0 && (
            <section>
              <SectionHeading eyebrow="Where the exam bites" title="Common traps" />
              <Card className="border-caution/25 bg-caution-soft/40">
                <ul className="space-y-2.5">
                  {concept.commonTraps.map((t) => (
                    <li key={t} className="flex gap-2.5">
                      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-caution" />
                      <span className="text-[13.5px] leading-relaxed text-navy">{t}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          )}

          {cards.length > 0 && (
            <section>
              <SectionHeading eyebrow="Pre-exam" title="Know Cold cards" />
              <ul className="space-y-2">
                {cards.map((c) => (
                  <li key={c.id}>
                    <Card>
                      <p className="text-[13px] font-bold text-navy">{c.term}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-navy-soft">{c.body}</p>
                      {c.formula && (
                        <div className="mt-2">
                          <Formula tex={c.formula} />
                        </div>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {missedQuestionIds.size > 0 && (
            <section>
              <SectionHeading
                eyebrow="You got these wrong"
                title="Questions to re-read"
              />
              <ul className="space-y-3">
                {questions
                  .filter((q) => missedQuestionIds.has(q.id))
                  .map((q) => (
                    <li key={q.id}>
                      <QuestionReview question={q} />
                    </li>
                  ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-4">
          <Card>
            <p className="eyebrow mb-2 text-navy-faint">Your mastery</p>
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "tabular text-3xl font-extrabold",
                  level >= 4 ? "text-go" : level >= 3 ? "text-brand" : level > 0 ? "text-caution" : "text-navy-faint",
                )}
              >
                {level}
              </span>
              <span className="text-lg font-semibold text-navy-faint">/ 5</span>
              <span className="ml-auto text-[13px] font-bold text-navy">
                {MASTERY_LABELS[level]}
              </span>
            </div>
            <ProgressBar
              value={level / 5}
              tone={level >= 4 ? "go" : level >= 3 ? "brand" : "caution"}
              height={7}
              className="mt-3"
            />
            <dl className="mt-4 space-y-1.5 text-[12.5px]">
              <div className="flex justify-between">
                <dt className="text-navy-soft">Answered</dt>
                <dd className="tabular font-semibold text-navy">{answered.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-soft">Correct</dt>
                <dd className="tabular font-semibold text-navy">
                  {correct}
                  {answered.length > 0 && (
                    <span className="ml-1 text-navy-faint">
                      ({Math.round((correct / answered.length) * 100)}%)
                    </span>
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-navy-soft">Next review</dt>
                <dd className="font-semibold text-navy">
                  {record?.dueAt
                    ? record.dueAt <= Date.now()
                      ? "Due now"
                      : new Date(record.dueAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                    : "—"}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <p className="eyebrow mb-2.5 text-navy-faint">Study this concept</p>
            <ul className="space-y-2">
              {lessons.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/lessons/${l.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-surface-2"
                  >
                    <BookOpen size={15} className="shrink-0 text-navy-faint" />
                    <span className="min-w-0 truncate">{l.title}</span>
                  </Link>
                </li>
              ))}
              {explainers.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/explainers/${e.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-surface-2"
                  >
                    <Sparkles size={15} className="shrink-0 text-brand" />
                    <span className="min-w-0 truncate">{e.title}</span>
                  </Link>
                </li>
              ))}
              {labs.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/lab/${l.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-surface-2"
                  >
                    <FlaskConical size={15} className="shrink-0 text-[var(--color-series-alt)]" />
                    <span className="min-w-0 truncate">{l.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <p className="eyebrow mb-2 text-navy-faint">Official reference</p>
            <p className="text-[12.5px] font-semibold text-navy">{concept.source.document}</p>
            {concept.source.chapter && (
              <p className="mt-0.5 text-[12px] text-navy-soft">{concept.source.chapter}</p>
            )}
            {concept.source.eo && concept.source.eo.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {concept.source.eo.map((eo) => (
                  <Pill key={eo} tone="neutral" size="sm">
                    EO {eo}
                  </Pill>
                ))}
              </div>
            )}
          </Card>

          <p className="px-1 text-[11.5px] text-navy-faint">
            {questions.length} question{questions.length === 1 ? "" : "s"} in the bank assess this
            concept.
          </p>
        </aside>
      </div>
    </>
  );
}
