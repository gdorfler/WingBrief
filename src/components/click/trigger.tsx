"use client";

/**
 * The way into Make It Click, from anywhere.
 *
 * One component rather than five, because the trigger has to appear beside a
 * concept in a lesson, under a diagram, on a missed question, on a weak concept
 * and inside a review session — and a per-surface implementation would drift
 * into five slightly different behaviours within a month.
 *
 * It resolves the concept itself and renders NOTHING when there is no entry.
 * A button that opens an empty explanation is worse than no button: it teaches
 * the student that asking for help does not work.
 */

import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { clickEntry, hasClick } from "@/content/click";
import { resolveClick } from "@/lib/make-it-click";
import { useCourse } from "@/lib/course";
import type { ConceptId } from "@/lib/types";
import { cn } from "../ui";
import { MakeItClickSheet } from "./sheet";

export function MakeItClick({
  conceptId,
  /** The wrong answer that brought them here, when launched from a mistake. */
  mistake,
  variant = "button",
  className,
}: {
  conceptId: ConceptId;
  mistake?: { chosenText: string; correctText: string };
  /** `button` stands alone; `inline` sits in a row of other chips. */
  variant?: "button" | "inline";
  className?: string;
}) {
  const { content } = useCourse();
  const [open, setOpen] = useState(false);

  const resolved = useMemo(
    () => (hasClick(conceptId) ? resolveClick(content, conceptId, clickEntry(conceptId)) : null),
    [content, conceptId],
  );

  if (!resolved) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "pressable inline-flex items-center gap-1.5 rounded-lg font-bold transition-colors",
          variant === "button"
            ? "border border-gold/45 bg-[var(--color-gold-soft)] px-3 py-2 text-[13px] text-navy hover:border-gold"
            : "border border-line bg-surface px-2.5 py-1 text-[12px] text-navy-soft hover:border-gold hover:text-navy",
          className,
        )}
      >
        <Lightbulb size={variant === "button" ? 15 : 13} className="text-gold" />
        {mistake ? "Explain my mistake" : "Make it click"}
      </button>

      {open && (
        <MakeItClickSheet click={resolved} mistake={mistake} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
