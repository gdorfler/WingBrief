"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { UNIT_BY_ID } from "@/content";
import { conceptFraction } from "@/lib/mastery";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { Card, PageHeader, ProgressBar } from "@/components/ui";

export default function LabIndexPage() {
  const { state } = useProgress();
  const { content, meta } = useCourse();

  return (
    <>
      <PageHeader
        eyebrow={meta.labLabel}
        title={meta.labIntro.title}
        subtitle={`${content.labs.length} labs. ${meta.labIntro.blurb}`}
      />

      <ul className="grid gap-4 md:grid-cols-2">
        {content.labs.map((lab) => {
          const unit = UNIT_BY_ID[lab.unit];
          const mastery =
            lab.conceptIds.reduce((s, id) => s + conceptFraction(state.mastery[id]), 0) /
            Math.max(1, lab.conceptIds.length);
          return (
            <li key={lab.id}>
              <Link
                href={`/lab/${lab.id}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-all hover:border-brand/40 hover:shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-series-alt)_12%,white)] text-[var(--color-series-alt)]">
                    <FlaskConical size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-navy-faint">
                      Unit {unit.index} · {unit.title}
                    </p>
                    <h3 className="mt-0.5 text-[17px] font-semibold text-navy">{lab.title}</h3>
                    <p className="text-[12.5px] text-navy-soft">{lab.subtitle}</p>
                  </div>
                  <ArrowRight
                    size={17}
                    className="mt-1 shrink-0 text-navy-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                  />
                </div>

                <p className="mt-3.5 flex-1 text-[13px] leading-relaxed text-navy">{lab.teaches}</p>

                {lab.chain && (
                  <div className="mt-3 flex flex-wrap items-center gap-1">
                    {lab.chain.map((step, i) => (
                      <span key={step} className="flex items-center gap-1">
                        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-navy-soft">
                          {step}
                        </span>
                        {i < lab.chain!.length - 1 && (
                          <span className="text-[11px] font-bold text-navy-faint">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 border-t border-line pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-semibold text-navy-faint">
                      {lab.conceptIds.length} concepts
                    </span>
                    <span className="tabular text-[12px] font-bold text-navy">
                      {Math.round(mastery * 100)}% mastered
                    </span>
                  </div>
                  <ProgressBar
                    value={mastery}
                    tone={mastery >= 0.8 ? "go" : mastery >= 0.4 ? "brand" : "caution"}
                    height={5}
                    className="mt-1.5"
                  />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {meta.id === "aero" && (
      <Card className="mt-6 border-caution/25 bg-caution-soft/40">
        <p className="text-[12.5px] leading-relaxed text-navy">
          <span className="font-bold">A note on the numbers. </span>
          Standard atmosphere, airspeed conversions, load factor, turn rate and radius, stall-speed
          ratios and the V-n envelope are all computed exactly from the equations in the trainee
          guide. Drag, thrust and power are shown as <em>indexed</em> values, because the guide
          publishes the relationships rather than the coefficients for any one airframe.
        </p>
      </Card>
      )}
    </>
  );
}
