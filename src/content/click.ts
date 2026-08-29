/**
 * The Make It Click registry.
 *
 * One lookup across every course. Courses without a click.ts simply contribute
 * nothing, which is how this rolls out concept by concept rather than as a
 * flag day — a concept with no entry is not clickable, and everything else in
 * the app carries on exactly as before.
 */

import { resolveClick, type ClickEntry, type ResolvedClick } from "@/lib/make-it-click";
import type { Concept, ConceptId, CourseContent } from "@/lib/types";
import { CLICK as AERO } from "./aero/click";
import { CLICK as ENGINES } from "./engines/click";
import { CLICK as FRR } from "./frr/click";
import { CLICK as NAV } from "./nav/click";
import { CLICK as WEATHER } from "./weather/click";

const ALL: ClickEntry[] = [...AERO, ...ENGINES, ...FRR, ...NAV, ...WEATHER];

export const CLICK_BY_CONCEPT: Map<ConceptId, ClickEntry> = new Map(
  ALL.map((e) => [e.conceptId, e]),
);

/** Whether "Make it click" should be offered for this concept at all. */
export function hasClick(conceptId: ConceptId): boolean {
  return CLICK_BY_CONCEPT.has(conceptId);
}

export function clickEntry(conceptId: ConceptId): ClickEntry | undefined {
  return CLICK_BY_CONCEPT.get(conceptId);
}

/** Every concept with an entry, for coverage reporting. */
export const CLICK_CONCEPT_IDS: ConceptId[] = ALL.map((e) => e.conceptId);

export interface ClickListing {
  concept: Concept;
  resolved: ResolvedClick;
}

/**
 * Every concept in this course with a Make It Click entry, resolved and ready
 * to render — the one list both the home page teaser and the full index page
 * draw from, so a concept added to a course's click.ts shows up in both
 * automatically.
 */
export function clickListingsFor(content: CourseContent): ClickListing[] {
  return content.concepts.flatMap((concept) => {
    const entry = clickEntry(concept.id);
    if (!entry) return [];
    const resolved = resolveClick(content, concept.id, entry);
    return resolved ? [{ concept, resolved }] : [];
  });
}
