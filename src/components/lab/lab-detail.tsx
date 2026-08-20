"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { useEffect } from "react";
import type { Lab } from "@/lib/types";
import { CONCEPT_BY_ID, EXPLAINERS, UNIT_BY_ID, lessonsForConcept } from "@/content";
import { conceptFraction } from "@/lib/mastery";
import { useProgress } from "@/lib/progress-store";
import { Card, PageHeader, Pill, ProgressBar, SectionHeading, cn } from "@/components/ui";
import { LabHost } from "./labs";

export function LabDetail({ lab }: { lab: Lab }) {
  const { state, markLabExplored } = useProgress();
  const unit = UNIT_BY_ID[lab.unit];

  useEffect(() => {
    markLabExplored(lab.id);
  }, [lab.id, markLabExplored]);

  const relatedLessons = [
    ...new Map(
      lab.conceptIds.flatMap((id) => lessonsForConcept(id)).map((l) => [l.id, l]),
    ).values(),
  ];
  const relatedExplainers = EXPLAINERS.filter((e) =>
    e.conceptIds.some((c) => lab.conceptIds.includes(c)),
  );

  return (
    <>
      <Link
        href="/lab"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-soft transition-colors hover:text-navy"
      >
        <ArrowLeft size={15} />
        All labs
      </Link>

      <PageHeader
        eyebrow={`Sim Lab · Unit ${unit.index} ${unit.title}`}
        title={lab.title}
        subtitle={lab.teaches}
      />

      <LabHost component={lab.component} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <SectionHeading eyebrow="What this lab covers" title="Concepts" />
          <Card padded={false}>
            <ul className="divide-y divide-line">
              {lab.conceptIds.map((id) => {
                const concept = CONCEPT_BY_ID[id];
                if (!concept) return null;
                const frac = conceptFraction(state.mastery[id]);
                return (
                  <li key={id}>
                    <Link
                      href={`/review/concept/${id}`}
                      className="block px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="text-[13.5px] font-semibold text-navy">{concept.name}</p>
                        <span
                          className={cn(
                            "tabular shrink-0 text-[12.5px] font-bold",
                            frac >= 0.8 ? "text-go" : frac >= 0.4 ? "text-brand" : "text-caution",
                          )}
                        >
                          {Math.round(frac * 100)}%
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-navy-soft">
                        {concept.definition}
                      </p>
                      <ProgressBar
                        value={frac}
                        tone={frac >= 0.8 ? "go" : frac >= 0.4 ? "brand" : "caution"}
                        height={4}
                        className="mt-2"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <aside className="min-w-0 space-y-4">
          {lab.chain && (
            <Card>
              <p className="eyebrow mb-2.5 text-navy-faint">The chain</p>
              <ol className="space-y-1.5">
                {lab.chain.map((step, i) => (
                  <li key={step} className="flex items-start gap-2">
                    <span className="tabular mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-2 text-[10.5px] font-extrabold text-navy-soft">
                      {i + 1}
                    </span>
                    <span className="text-[12.5px] font-medium leading-snug text-navy">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {(relatedLessons.length > 0 || relatedExplainers.length > 0) && (
            <Card>
              <p className="eyebrow mb-2.5 text-navy-faint">Related</p>
              <ul className="space-y-1">
                {relatedLessons.slice(0, 4).map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/lessons/${l.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] font-semibold text-navy transition-colors hover:bg-surface-2"
                    >
                      <BookOpen size={14} className="shrink-0 text-navy-faint" />
                      <span className="min-w-0 truncate">{l.title}</span>
                    </Link>
                  </li>
                ))}
                {relatedExplainers.slice(0, 3).map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/explainers/${e.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] font-semibold text-navy transition-colors hover:bg-surface-2"
                    >
                      <Sparkles size={14} className="shrink-0 text-brand" />
                      <span className="min-w-0 truncate">{e.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <p className="eyebrow mb-1.5 text-navy-faint">Model fidelity</p>
            <p className="text-[12px] leading-relaxed text-navy-soft">
              This lab teaches relationships. Exact values come from the trainee guide equations;
              anything the guide leaves open is shown as a relative or indexed figure rather than an
              invented number.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1">
              <Pill tone="go" size="sm">
                Directionally exact
              </Pill>
              <Pill tone="neutral" size="sm">
                Indexed magnitudes
              </Pill>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
