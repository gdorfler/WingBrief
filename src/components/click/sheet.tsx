"use client";

/**
 * Make It Click — the sheet.
 *
 * Four acts, not nine stages. The brief listed nine, but six of them are one
 * beat each and the ninth ("Go deeper") is not a stage at all — it is what the
 * student can say AT ANY POINT, which is exactly what a real instructor offers.
 * So the controls live in a rail that is present in every act rather than
 * arriving at the end, and the acts are:
 *
 *   GRASP  plain-language intuition, then an analogy that states its mapping
 *   SEE    the mechanism demonstrated, reusing the explainer already built
 *   MOVE   the chain opened link by link, then run
 *   LAND   the wrong model beside the right one, then the NIFE words
 *
 * Terminology is deliberately withheld until LAND. A student who arrives here
 * has already failed to understand the official sentence once; leading with it
 * again is the thing this system exists to stop doing.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  Check,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  Repeat,
  Sparkles,
  X,
} from "lucide-react";
import type { ClickAct, ResolvedClick } from "@/lib/make-it-click";
import { DiagramHost } from "../diagrams/registry";
import { Button, cn } from "../ui";
import { CauseChain } from "./chain";

const ACT_LABEL: Record<ClickAct, string> = {
  grasp: "Grasp",
  see: "See it",
  move: "Move it",
  land: "Speak NIFE",
};

/* ------------------------------------------------------------------ */
/* Acts                                                                */
/* ------------------------------------------------------------------ */

function Grasp({
  click,
  analogyIndex,
  simplified,
}: {
  click: ResolvedClick;
  analogyIndex: number;
  simplified: boolean;
}) {
  const analogy = click.analogies[analogyIndex] ?? click.analogies[0];
  return (
    <div className="space-y-4">
      <p className="text-[19px] font-semibold leading-snug text-navy sm:text-[21px]">
        {click.intuition}
      </p>

      {simplified && click.prerequisites.length > 0 && (
        <div className="rounded-xl border border-caution/35 bg-caution-soft px-3.5 py-3">
          <p className="eyebrow mb-1.5 text-caution">Start further back</p>
          <p className="text-[13px] leading-relaxed text-navy">
            This one usually will not land until these have. That is not a gap in
            you — it is a gap in the order.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {click.prerequisites.map((p) => (
              <Link
                key={p.id}
                href={`/review/concept/${p.id}`}
                className="rounded-full border border-caution/40 bg-surface px-2.5 py-1 text-[12px] font-semibold text-navy hover:border-caution"
              >
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {analogy && (
        <div className="rounded-xl border border-line bg-surface-2 p-4">
          <p className="eyebrow mb-2 text-brand">Picture this</p>
          <p className="text-[15px] font-medium leading-relaxed text-navy">{analogy.picture}</p>

          {/* The mapping is the part that makes it teaching rather than a
              mnemonic, so it is shown, not left implicit. */}
          <dl className="mt-3 divide-y divide-line border-t border-line">
            {analogy.maps.map(([real, inAnalogy]) => (
              <div key={real} className="grid grid-cols-2 gap-3 py-1.5">
                <dt className="text-[12.5px] font-semibold leading-snug text-navy">{real}</dt>
                <dd className="text-[12.5px] leading-snug text-navy-soft">{inAnalogy}</dd>
              </div>
            ))}
          </dl>

          {analogy.breaksDown && (
            <p className="mt-3 border-t border-line pt-2.5 text-[12px] leading-relaxed text-navy-faint">
              <span className="font-bold text-navy-soft">Where it breaks down. </span>
              {analogy.breaksDown}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function See({ click }: { click: ResolvedClick }) {
  const diagram = click.show?.diagram ?? click.explainer?.diagram;
  return (
    <div className="space-y-3">
      {click.show?.watchFor && (
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-[13.5px] font-semibold leading-snug text-brand-dark">
          {click.show.watchFor}
        </p>
      )}

      {diagram && (
        <div className="wb-stage-figure flex min-h-[220px] items-center justify-center rounded-xl border border-line bg-surface p-3 sm:min-h-[300px]">
          <DiagramHost id={diagram.id} props={diagram.props ?? {}} />
        </div>
      )}

      {click.explainer && (
        <Link
          href={`/explainers/${click.explainer.id}`}
          className="card card-lift flex items-center gap-3 p-3.5"
        >
          <Sparkles size={18} className="shrink-0 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-navy">
              Play it: {click.explainer.title}
            </span>
            <span className="block truncate text-[12.5px] text-navy-soft">
              {click.explainer.promise}
            </span>
          </span>
          <ArrowRight size={16} className="shrink-0 text-navy-faint" />
        </Link>
      )}
    </div>
  );
}

function Move({ click }: { click: ResolvedClick }) {
  return (
    <div className="space-y-4">
      <CauseChain links={click.chain} driver={click.manipulate?.driver} />

      {click.lab && (
        <Link href={`/lab/${click.lab.id}`} className="card card-lift flex items-center gap-3 p-3.5">
          <FlaskConical size={18} className="shrink-0 text-brand" />
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-semibold text-navy">
              Take it apart: {click.lab.title}
            </span>
            <span className="block text-[12.5px] leading-snug text-navy-soft">
              {click.manipulate?.proves ?? click.lab.teaches}
            </span>
          </span>
          <ArrowRight size={16} className="shrink-0 text-navy-faint" />
        </Link>
      )}
    </div>
  );
}

function Land({ click }: { click: ResolvedClick }) {
  const wrong = click.wrongModel;
  return (
    <div className="space-y-4">
      {wrong && wrong.brainWants && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-xl border border-nogo/30 bg-nogo-soft p-3.5">
            <p className="eyebrow mb-1.5 text-nogo">Your brain wants to think…</p>
            <p className="text-[13.5px] leading-relaxed text-navy">{wrong.brainWants}</p>
          </div>
          <div className="rounded-xl border border-go/30 bg-go-soft p-3.5">
            <p className="eyebrow mb-1.5 text-go-dark">What is actually happening…</p>
            <p className="text-[13.5px] leading-relaxed text-navy">{wrong.actually}</p>
          </div>
          {wrong.whyItsTempting && (
            <p className="text-[12.5px] leading-relaxed text-navy-soft sm:col-span-2">
              <span className="font-bold text-navy">Why it is tempting. </span>
              {wrong.whyItsTempting}
            </p>
          )}
        </div>
      )}

      {/* Terminology arrives only now, once there is something for it to name. */}
      <div className="rounded-xl border border-navy/20 bg-ink-800 p-4 text-white">
        <p className="eyebrow mb-2 text-[#8fb0d4]">Now speak NIFE</p>
        <p className="text-[13.5px] leading-relaxed text-[#e8f1fb]">
          {click.speakNife.definition}
        </p>
        {click.speakNife.relationships.length > 0 && (
          <ul className="mt-2.5 space-y-1 border-t border-ink-line pt-2.5">
            {click.speakNife.relationships.map((r) => (
              <li key={r} className="text-[12.5px] font-semibold text-[#c9dcf0]">
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      {click.knowCold && (
        <div className="rounded-xl border-2 border-gold/50 bg-[var(--color-gold-soft)] p-4">
          <p className="eyebrow mb-1.5 text-gold">Know cold</p>
          <p className="text-[14px] font-bold leading-snug text-navy">{click.knowCold.term}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-navy-soft">{click.knowCold.body}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The sheet                                                           */
/* ------------------------------------------------------------------ */

export function MakeItClickSheet({
  click,
  /** The wrong answer that brought them here, when launched from a mistake. */
  mistake,
  onClose,
}: {
  click: ResolvedClick;
  mistake?: { chosenText: string; correctText: string };
  onClose: () => void;
}) {
  const [act, setAct] = useState<ClickAct>("grasp");
  const [analogyIndex, setAnalogyIndex] = useState(0);
  const [showDeeper, setShowDeeper] = useState(false);
  const [simplified, setSimplified] = useState(false);

  const acts = click.acts;
  const index = acts.indexOf(act);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/45 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Make it click: ${click.concept.name}`}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-canvas shadow-e3 sm:rounded-2xl"
      >
        {/* ---------- Header ---------- */}
        <header className="shrink-0 border-b border-line bg-surface px-4 py-3">
          <div className="flex items-start gap-3">
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-gold" />
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-brand">Make it click</p>
              <p className="truncate text-[15px] font-bold text-navy">{click.concept.name}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-navy-faint hover:bg-surface-2 hover:text-navy"
            >
              <X size={18} />
            </button>
          </div>

          {/* Acts as a route, so the student always knows how much is left. */}
          <div className="mt-3 flex gap-1">
            {acts.map((a, i) => (
              <button
                key={a}
                type="button"
                onClick={() => setAct(a)}
                className={cn(
                  "flex-1 rounded-md px-2 py-1.5 text-[11.5px] font-bold transition-colors",
                  a === act
                    ? "bg-brand text-white"
                    : i < index
                      ? "bg-surface-3 text-navy-soft"
                      : "bg-surface-2 text-navy-faint hover:text-navy",
                )}
              >
                {ACT_LABEL[a]}
              </button>
            ))}
          </div>
        </header>

        {/* ---------- Body ---------- */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {/*
            Launched from a wrong answer, the student's own mistake leads —
            everything after it is addressed to that specific error rather than
            broadcast at the concept in general.
          */}
          {mistake && act === "grasp" && (
            <div className="mb-4 rounded-xl border border-nogo/30 bg-nogo-soft p-3.5">
              <p className="eyebrow mb-1.5 text-nogo">You answered</p>
              <p className="text-[13.5px] font-semibold leading-snug text-navy">
                “{mistake.chosenText}”
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-navy-soft">
                That is a reasonable thing to think, and it is worth knowing exactly
                why it is wrong rather than just replacing it. Start here.
              </p>
            </div>
          )}

          <motion.div
            key={act}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {act === "grasp" && (
              <Grasp click={click} analogyIndex={analogyIndex} simplified={simplified} />
            )}
            {act === "see" && <See click={click} />}
            {act === "move" && <Move click={click} />}
            {act === "land" && <Land click={click} />}
          </motion.div>

          {showDeeper && click.deeper && (
            <div className="mt-4 rounded-xl border-l-[3px] border-brand bg-surface px-3.5 py-3">
              <p className="eyebrow mb-1.5 text-brand">One layer down</p>
              <p className="text-[13px] leading-relaxed text-navy">{click.deeper}</p>
            </div>
          )}
        </div>

        {/* ---------- The rail ----------
            Present in every act, because "I still don't get it" does not wait
            politely until the end. */}
        <footer className="shrink-0 border-t border-line bg-surface px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {click.deeper && (
              <button
                type="button"
                onClick={() => setShowDeeper((v) => !v)}
                className={cn(
                  "pressable rounded-lg border px-3 py-2 text-[12.5px] font-bold",
                  showDeeper
                    ? "border-brand bg-brand-soft text-brand-dark"
                    : "border-line bg-surface text-navy",
                )}
              >
                <HelpCircle size={13} className="mr-1 inline" />
                Why though?
              </button>
            )}

            {click.analogies.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setAnalogyIndex((i) => (i + 1) % click.analogies.length);
                  setAct("grasp");
                }}
                className="pressable rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] font-bold text-navy"
              >
                <Repeat size={13} className="mr-1 inline" />
                Different analogy
              </button>
            )}

            {click.prerequisites.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSimplified(true);
                  setAct("grasp");
                }}
                className={cn(
                  "pressable rounded-lg border px-3 py-2 text-[12.5px] font-bold",
                  simplified
                    ? "border-caution bg-caution-soft text-caution"
                    : "border-line bg-surface text-navy",
                )}
              >
                Still confused
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              {index < acts.length - 1 ? (
                <Button size="sm" onClick={() => setAct(acts[index + 1])}>
                  {acts[index + 1] === "land" ? "Now name it" : "Next"}
                  <ArrowRight size={15} />
                </Button>
              ) : (
                <Button size="sm" variant="success" onClick={onClose}>
                  <Check size={15} strokeWidth={3} />
                  I get it
                </Button>
              )}
            </div>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
