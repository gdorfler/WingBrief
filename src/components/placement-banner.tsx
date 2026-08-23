"use client";

/**
 * "You already know this."
 *
 * A lesson unlocks the next one only once it is marked complete, and normally
 * that only happens by walking through its screens. This banner closes the
 * gap for anyone who has already proven the material some other way — a
 * returning student, someone who studied elsewhere, or someone who just did
 * well on a unit exam: the concept mastery is real (see lib/placement.ts for
 * exactly how conservative the bar is), so the credit is real too.
 *
 * Nothing here fabricates an attempt. It calls the same `completeLesson` a
 * finished lesson calls, with the mastery-derived score standing in for the
 * lesson's own end-of-lesson score, and it never touches a lesson the student
 * has already been through.
 */

import { useState } from "react";
import { GraduationCap, X } from "lucide-react";
import { groupPlacementCandidates, placementCandidates } from "@/lib/placement";
import { useProgress } from "@/lib/progress-store";
import { useCourse } from "@/lib/course";
import { Button, Card, Pill } from "./ui";

export function PlacementBanner() {
  const { state, completeLesson } = useProgress();
  const { content } = useCourse();
  const [dismissed, setDismissed] = useState(false);
  const [claimed, setClaimed] = useState<{ count: number; xpLabel: string } | null>(null);

  const candidates = placementCandidates(content.lessons, content.units, state);
  const grouped = groupPlacementCandidates(candidates);

  if (claimed) {
    return (
      <Card className="mb-6 border-go/25 bg-go-soft/60">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-go text-white">
            <GraduationCap size={18} />
          </span>
          <p className="text-[13.5px] font-semibold text-navy">
            {claimed.count} lesson{claimed.count === 1 ? "" : "s"} marked complete from what you
            already knew. {claimed.xpLabel}
          </p>
        </div>
      </Card>
    );
  }

  if (dismissed || candidates.length === 0) return null;

  const claim = () => {
    for (const c of candidates) {
      completeLesson(c.lessonId, c.score, c.score >= 0.999);
    }
    setClaimed({
      count: candidates.length,
      xpLabel: "Everything they unlock is open now.",
    });
  };

  const preview = candidates.slice(0, 4);
  const extra = candidates.length - preview.length;

  return (
    <Card className="mb-6 border-brand/25 bg-brand-soft/40">
      <div className="flex flex-wrap items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <GraduationCap size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-navy">You already know this</p>
            <Pill tone="brand">
              {candidates.length} lesson{candidates.length === 1 ? "" : "s"}
            </Pill>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-navy-soft">
            Your answer history already clears each lesson&rsquo;s own mastery bar for every
            concept it teaches — not a lucky guess, but sustained accuracy across several
            questions. Skip the screens and mark them done, or leave them for later.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {preview.map((c) => (
              <span
                key={c.lessonId}
                className="rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-navy-soft"
              >
                {c.title}
              </span>
            ))}
            {extra > 0 && (
              <span className="rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-navy-faint">
                +{extra} more
              </span>
            )}
          </div>
          {grouped.length > 1 && (
            <p className="mt-1.5 text-[11px] text-navy-faint">
              Across {grouped.length} units: {grouped.map((g) => g.unitTitle).join(", ")}.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button size="sm" onClick={claim}>
            Mark complete
          </Button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-navy-faint hover:bg-surface hover:text-navy"
          >
            <X size={15} />
          </button>
        </div>
      </div>
      <p className="mt-3 border-t border-brand/15 pt-2.5 text-[11px] text-navy-faint">
        Want to test out of a whole unit at once instead? Take that unit&rsquo;s exam — the same
        check runs automatically on the results page.
      </p>
    </Card>
  );
}
