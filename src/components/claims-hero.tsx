"use client";

/**
 * The hero for a course that reports claims instead of coverage.
 *
 * What this replaces said "62% ready" — the share of concepts touched to a
 * threshold. That is the publisher's view of the student: it measures how far
 * through the book they are, it only ever rises, and no student has ever wanted
 * to know it.
 *
 * This panel leads with sentences the app will stand behind, and with the ones
 * it will not. There is no total, no ratio and no bar, because the moment a
 * count of claims becomes the headline it is a percentage again with extra
 * steps. The claims themselves are the content.
 */

import Link from "next/link";
import { Check, ClipboardCheck, Lock, Play, TriangleAlert } from "lucide-react";
import type { ClaimState, ClaimSummary } from "@/lib/claims";
import { ButtonLink, InkCard, cn } from "./ui";

/* ------------------------------------------------------------------ */
/* One claim                                                           */
/* ------------------------------------------------------------------ */

function EarnedRow({ state }: { state: ClaimState }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-go">
        <Check size={12} strokeWidth={3.5} className="text-white" />
      </span>
      <span className="text-[14.5px] font-semibold leading-snug text-white">
        {state.claim.label}
      </span>
    </li>
  );
}

/**
 * A withdrawn claim, and the answer that withdrew it.
 *
 * Named in the student's own wrong words rather than as "review this concept",
 * because the specific belief is the actionable part and the app already knows
 * it. This is the only place in the product where something can be taken away.
 */
function ContestedRow({ state }: { state: ClaimState }) {
  return (
    <li className="rounded-lg border border-caution/40 bg-caution/10 px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <TriangleAlert size={15} className="mt-0.5 shrink-0 text-caution" />
        <div className="min-w-0">
          <p className="text-[14px] font-semibold leading-snug text-white">
            {state.claim.label}
          </p>
          <p className="mt-1 text-[12.5px] leading-snug text-[#e8c98f]">
            Withdrawn — you last answered{" "}
            <span className="font-semibold">“{state.contradiction?.text}”</span>, and that is
            not right.
          </p>
        </div>
      </div>
    </li>
  );
}

function OpenRow({ state }: { state: ClaimState }) {
  const started = state.have > 0;
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border border-[#38567a] bg-ink-700">
        <Lock size={9} className="text-[#7d9cc0]" />
      </span>
      <span className="min-w-0 text-[14px] leading-snug text-[#a6c1de]">
        {state.claim.label}
        {started && (
          <span className="tabular ml-1.5 text-[12px] font-bold text-[#7d9cc0]">
            {state.have}/{state.need}
          </span>
        )}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* The panel                                                           */
/* ------------------------------------------------------------------ */

export function ClaimsHero({
  summary,
  courseName,
  continueHref,
  isNew,
}: {
  summary: ClaimSummary;
  courseName: string;
  continueHref: string;
  isNew: boolean;
}) {
  const { earned, contested, states, nearest } = summary;
  const unearned = states.filter((s) => s.status === "open" || s.status === "untouched");

  return (
    <InkCard className="relative overflow-hidden" padded={false}>
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
        {/* ---------- What the app will say ---------- */}
        <div className="min-w-0">
          <p className="eyebrow text-[#8fb0d4]">What I&apos;ll vouch for</p>

          {earned.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {earned.map((s) => (
                <EarnedRow key={s.claim.id} state={s} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 max-w-[26rem] text-[15px] font-semibold leading-snug text-white">
              {isNew
                ? `Nothing yet — you haven${"’"}t done any ${courseName} work.`
                : "Nothing yet."}
              <span className="mt-1.5 block text-[13px] font-medium leading-relaxed text-[#a6c1de]">
                A claim is earned by doing the thing, not by reading about it. Answer the
                applied questions on a topic and I&apos;ll start saying you can do it.
              </span>
            </p>
          )}

          {contested.length > 0 && (
            <ul className="mt-3 space-y-2">
              {contested.map((s) => (
                <ContestedRow key={s.claim.id} state={s} />
              ))}
            </ul>
          )}
        </div>

        {/* ---------- What it will not ---------- */}
        <div className="min-w-0 lg:border-l lg:border-ink-line lg:pl-6">
          <p className="eyebrow text-[#8fb0d4]">Not yet</p>
          {unearned.length > 0 ? (
            <ul className="mt-3 space-y-2.5">
              {unearned.map((s) => (
                <OpenRow key={s.claim.id} state={s} />
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] font-semibold leading-snug text-go">
              Everything on the list. Hold it with exams.
            </p>
          )}
        </div>

        {/* ---------- What to do about it ---------- */}
        <div className="flex flex-col gap-2 lg:w-48">
          {nearest && (
            <div className="mb-1 rounded-lg bg-ink-700/70 px-3 py-2.5">
              <p className="eyebrow text-[#8fb0d4]">
                {nearest.status === "contested" ? "Win back" : "Closest"}
              </p>
              <p className="mt-1 text-[12.5px] font-semibold leading-snug text-white">
                {nearest.claim.label}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-[#8fb0d4]">
                {nearest.claim.earnedBy}
              </p>
            </div>
          )}
          <ButtonLink href={continueHref} variant="primary" size="lg" fullWidth>
            <Play size={17} fill="currentColor" />
            {isNew ? "Start flying" : "Continue"}
          </ButtonLink>
          <ButtonLink href="/exam" variant="ink" size="md" fullWidth>
            <ClipboardCheck size={16} />
            Practice exam
          </ButtonLink>
        </div>
      </div>
    </InkCard>
  );
}

/* ------------------------------------------------------------------ */
/* The strip that replaces the readiness row elsewhere on the page     */
/* ------------------------------------------------------------------ */

/**
 * A one-line reading of the same data, for the unit list further down the
 * dashboard. Kept deliberately plain: the hero is where the claims are read.
 */
export function ClaimsNote({ summary }: { summary: ClaimSummary }) {
  const { earned, contested } = summary;
  if (contested.length > 0) {
    return (
      <p className="text-[12.5px] font-medium text-caution">
        {contested.length === 1 ? "One claim is" : `${contested.length} claims are`} withdrawn
        until you beat the answer that took {contested.length === 1 ? "it" : "them"} away.
      </p>
    );
  }
  if (earned.length === 0) {
    return (
      <p className="text-[12.5px] font-medium text-navy-soft">
        No claims earned yet. Applied questions are what earn them.
      </p>
    );
  }
  return (
    <p className={cn("text-[12.5px] font-medium text-navy-soft")}>
      <Link href="/profile" className="font-semibold text-brand hover:underline">
        {earned.length} {earned.length === 1 ? "claim" : "claims"}
      </Link>{" "}
      the app will stand behind.
    </p>
  );
}
