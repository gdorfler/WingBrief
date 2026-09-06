"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Clock, Play } from "lucide-react";

import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { DiagramHost } from "@/components/diagrams/registry";
import { ChipRail, FilterChip, ButtonLink, Pill, cn } from "@/components/ui";
import { SessionBrief } from "@/components/session-brief";

export default function ExplainersPage() {
  const { state } = useProgress();
  const { content } = useCourse();
  const [unit, setUnit] = useState<string>("all");

  const shown = content.explainers.filter((e) => unit === "all" || e.unit === unit);
  const watched = state.watchedExplainerIds.length;
  const next = content.explainers.find(e => !state.watchedExplainerIds.includes(e.id)) ?? content.explainers[0];

  return (
    <>
      <SessionBrief title="See it. Then get it." description="Short visual flights through the ideas that need to click.">
        {next && <ButtonLink href={`/explainers/${next.id}`} className="mt-4"><Play size={16} fill="currentColor"/>Watch next</ButtonLink>}
        <p className="mt-4 text-sm text-navy-soft">{watched} / {content.explainers.length} explored</p>
      </SessionBrief>
        <div className="mt-4">
          <ChipRail>
            <FilterChip active={unit === "all"} onClick={() => setUnit("all")}>
              All
            </FilterChip>
            {content.units.map((u) => (
              <FilterChip key={u.id} active={unit === u.id} onClick={() => setUnit(u.id)}>
                {u.title}
              </FilterChip>
            ))}
          </ChipRail>
        </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((e) => {
          const seen = state.watchedExplainerIds.includes(e.id);
          const seconds = Math.round(e.frames.reduce((s, f) => s + f.hold, 0) / 1000);
          return (
            <li key={e.id}>
              <Link
                href={`/explainers/${e.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface-tint transition-all hover:bg-brand-soft"
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
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
