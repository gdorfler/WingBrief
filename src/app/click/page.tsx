"use client";

/**
 * Make It Click — the index.
 *
 * The five trigger surfaces (a lesson, an explainer, a missed question, a weak
 * concept, a review card) only ever show up beside the concept they explain,
 * which means a student who has not yet stumbled into one of those five places
 * has no way to know the system exists at all. This page is the sixth surface:
 * a plain list of everything it currently covers, reachable from the nav rail
 * on every course.
 */

import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";

import { useCourse } from "@/lib/course";
import { clickListingsFor, type ClickListing } from "@/content/click";
import type { ConceptId } from "@/lib/types";
import { Card, PageHeader, Pill } from "@/components/ui";
import { MakeItClickSheet } from "@/components/click/sheet";

export default function ClickIndexPage() {
  const { content } = useCourse();
  const [openId, setOpenId] = useState<ConceptId | null>(null);

  const listings = useMemo(() => clickListingsFor(content), [content]);

  const byUnit = useMemo(() => {
    const groups = new Map<string, ClickListing[]>();
    for (const item of listings) {
      const list = groups.get(item.concept.unit) ?? [];
      list.push(item);
      groups.set(item.concept.unit, list);
    }
    return content.units
      .map((unit) => ({ unit, items: groups.get(unit.id) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [listings, content.units]);

  const open = listings.find((item) => item.concept.id === openId) ?? null;

  return (
    <>
      <PageHeader
        eyebrow="A different explanation, not a louder one"
        title="Make it click"
        subtitle="For the concepts where a definition alone hasn't worked: a plain-language intuition, a physical analogy, and the specific wrong idea most people default to before this clicks."
        actions={
          <Pill tone="brand">
            <Lightbulb size={12} /> {listings.length} available
          </Pill>
        }
      />

      {byUnit.length === 0 ? (
        <Card className="text-center">
          <Lightbulb size={22} className="mx-auto mb-2 text-navy-faint" />
          <p className="text-sm font-semibold text-navy">Not built out here yet</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-navy-soft">
            This course doesn&apos;t have any Make It Click entries yet. Look for the
            &quot;Make it click&quot; button in a lesson instead, or check back as more get
            added.
          </p>
        </Card>
      ) : (
        <div className="space-y-7">
          {byUnit.map(({ unit, items }) => (
            <section key={unit.id}>
              <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wide text-navy-faint">
                {unit.title}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map(({ concept, resolved }) => (
                  <li key={concept.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(concept.id)}
                      className="card card-lift flex h-full w-full flex-col items-start gap-2 p-4 text-left"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-gold-soft)] text-gold">
                        <Lightbulb size={15} />
                      </span>
                      <p className="text-[14px] font-semibold leading-snug text-navy">
                        {concept.name}
                      </p>
                      <p className="line-clamp-2 text-[12px] leading-relaxed text-navy-soft">
                        {resolved.intuition}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {open && <MakeItClickSheet click={open.resolved} onClose={() => setOpenId(null)} />}
    </>
  );
}
