"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Bookmark, BookmarkCheck, Search } from "lucide-react";
import type { KnowColdCard } from "@/lib/types";
import { KNOW_COLD_CATEGORIES, UNIT_BY_ID } from "@/content";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import {
  Card,
  ChipRail,
  FilterChip,
  Formula,
  PageHeader,
  Pill,
  cn,
} from "@/components/ui";

export default function KnowColdPage() {
  return (
    <Suspense fallback={null}>
      <KnowCold />
    </Suspense>
  );
}

function KnowCold() {
  const params = useSearchParams();
  const { state, toggleSavedKnowCold } = useProgress();
  const { content } = useCourse();
  const [category, setCategory] = useState<string>(params.get("category") ?? "all");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return content.knowCold.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (savedOnly && !state.savedKnowColdIds.includes(c.id)) return false;
      if (!q) return true;
      return (
        c.term.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q) ||
        (c.formula ?? "").toLowerCase().includes(q)
      );
    });
  }, [content.knowCold, category, query, savedOnly, state.savedKnowColdIds]);

  const grouped = useMemo(() => {
    const map = new Map<string, KnowColdCard[]>();
    for (const c of filtered) {
      const list = map.get(c.category) ?? [];
      list.push(c);
      map.set(c.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <>
      <PageHeader
        eyebrow="Pre-exam compression"
        title="Know Cold"
        subtitle="Everything worth memorising, compressed. This does not replace the lessons — it is the layer you read the night before."
        actions={
          <Pill tone="gold">
            {content.knowCold.length} cards
          </Pill>
        }
      >
        <div className="mt-4 space-y-3">
          <label className="relative block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-faint"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search definitions, numbers, formulas…"
              className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-4 text-[14px] text-navy placeholder:text-navy-faint focus:border-brand focus:outline-none"
            />
          </label>
          <ChipRail>
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </FilterChip>
            {KNOW_COLD_CATEGORIES.map((c) => (
              <FilterChip
                key={c.key}
                active={category === c.key}
                onClick={() => setCategory(c.key)}
              >
                {c.label}
              </FilterChip>
            ))}
            <FilterChip active={savedOnly} onClick={() => setSavedOnly((s) => !s)}>
              Saved {state.savedKnowColdIds.length}
            </FilterChip>
          </ChipRail>
        </div>
      </PageHeader>

      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm font-semibold text-navy">No cards match</p>
          <p className="mt-1 text-[13px] text-navy-soft">
            Try a different search term or clear the filters.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {KNOW_COLD_CATEGORIES.filter((c) => grouped.has(c.key)).map((cat) => (
            <section key={cat.key}>
              <div className="mb-3">
                <h2 className="text-lg text-navy">{cat.label}</h2>
                <p className="text-[12.5px] text-navy-soft">{cat.blurb}</p>
              </div>
              <ul className="grid gap-3 md:grid-cols-2">
                {(grouped.get(cat.key) ?? []).map((c) => {
                  const saved = state.savedKnowColdIds.includes(c.id);
                  const unit = UNIT_BY_ID[c.unit];
                  return (
                    <li key={c.id}>
                      <Card
                        className={cn(
                          "h-full",
                          cat.key === "trap" && "border-caution/30 bg-caution-soft/30",
                          cat.key === "aircraft" && "border-brand/25 bg-brand-soft/25",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[14.5px] font-bold leading-snug text-navy">
                              {c.term}
                            </p>
                            <p className="mt-1.5 text-[13px] leading-relaxed text-navy-soft">
                              {c.body}
                            </p>
                            {c.formula && (
                              <div className="mt-2.5 rounded-lg bg-surface-2 px-3 py-2.5">
                                <Formula tex={c.formula} display />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSavedKnowCold(c.id)}
                            aria-pressed={saved}
                            aria-label={saved ? "Unsave card" : "Save card"}
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                              saved ? "bg-gold-soft text-gold" : "text-navy-faint hover:bg-surface-2",
                            )}
                          >
                            {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
                          <span className="text-[10.5px] font-bold uppercase tracking-wide text-navy-faint">
                            U{unit.index}
                          </span>
                          {c.conceptIds.slice(0, 2).map((id) => (
                            <Link key={id} href={`/review/concept/${id}`}>
                              <Pill tone="neutral" size="sm">
                                {id.replace(/^c-/, "").replace(/-/g, " ")}
                              </Pill>
                            </Link>
                          ))}
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
