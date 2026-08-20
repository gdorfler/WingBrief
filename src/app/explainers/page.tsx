"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Clock, Play } from "lucide-react";
import { EXPLAINERS, UNITS } from "@/content";
import { useProgress } from "@/lib/progress-store";
import { DiagramHost } from "@/components/diagrams/registry";
import { ChipRail, FilterChip, PageHeader, Pill, cn } from "@/components/ui";

export default function ExplainersPage() {
  const { state } = useProgress();
  const [unit, setUnit] = useState<string>("all");

  const shown = EXPLAINERS.filter((e) => unit === "all" || e.unit === unit);
  const watched = state.watchedExplainerIds.length;

  return (
    <>
      <PageHeader
        eyebrow="Quick visual explainers"
        title="Sixty seconds each"
        subtitle="One concept, one animated diagram, one line of caption per frame. Built for the moment a lesson has not quite landed."
        actions={
          <Pill tone={watched === EXPLAINERS.length ? "go" : "brand"}>
            {watched}/{EXPLAINERS.length} watched
          </Pill>
        }
      >
        <div className="mt-4">
          <ChipRail>
            <FilterChip active={unit === "all"} onClick={() => setUnit("all")}>
              All
            </FilterChip>
            {UNITS.map((u) => (
              <FilterChip key={u.id} active={unit === u.id} onClick={() => setUnit(u.id)}>
                {u.title}
              </FilterChip>
            ))}
          </ChipRail>
        </div>
      </PageHeader>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((e) => {
          const seen = state.watchedExplainerIds.includes(e.id);
          const seconds = Math.round(e.frames.reduce((s, f) => s + f.hold, 0) / 1000);
          return (
            <li key={e.id}>
              <Link
                href={`/explainers/${e.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <div className="pointer-events-none border-b border-line bg-surface-2 p-2">
                  <div className="origin-center scale-[0.94]">
                    <DiagramHost id={e.diagram.id} props={{ ...e.diagram.props, ...(e.frames.at(-1)?.props ?? {}) }} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Pill tone={seen ? "go" : "brand"} size="sm">
                      {seen ? <Check size={11} strokeWidth={3} /> : <Play size={10} fill="currentColor" />}
                      {seen ? "Watched" : "New"}
                    </Pill>
                    <span className="tabular flex items-center gap-1 text-[11px] font-semibold text-navy-faint">
                      <Clock size={11} /> {seconds}s
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "text-[15.5px] font-semibold leading-snug",
                      seen ? "text-navy-soft" : "text-navy",
                    )}
                  >
                    {e.title}
                  </h3>
                  <p className="mt-1 flex-1 text-[12.5px] leading-relaxed text-navy-soft">
                    {e.promise}
                  </p>
                  <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] font-semibold text-navy-faint">
                    {e.knowCold}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
