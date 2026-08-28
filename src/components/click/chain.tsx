"use client";

/**
 * The cause chain, revealed one link at a time — and then run.
 *
 * Two jobs in one component, because they are the same picture. First the
 * student opens each link and reads why it causes the next. Then they flip the
 * driving variable and watch the consequence travel the whole chain.
 *
 * Built from the ChainLink schema rather than hand-drawn per concept, which is
 * what lets the 59% of the corpus that already states a relationship get an
 * interactive mechanism without anyone authoring one. A concept with a lab gets
 * the lab as well; a concept without one still gets this.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowDown, RotateCcw } from "lucide-react";
import type { ChainLink } from "@/lib/make-it-click";
import { cn } from "../ui";

/** The arrow a link carries, mirrored when the chain is run backwards. */
function Trend({ trend, flipped }: { trend?: "up" | "down" | "none"; flipped: boolean }) {
  if (!trend || trend === "none") return null;
  const up = flipped ? trend === "down" : trend === "up";
  return (
    <span
      aria-hidden
      className={cn(
        "tabular ml-1.5 text-[15px] font-black leading-none",
        up ? "text-nogo" : "text-go",
      )}
    >
      {up ? "↑" : "↓"}
    </span>
  );
}

export function CauseChain({
  links,
  /** Label for the control that drives the chain, e.g. "Angle of attack". */
  driver,
}: {
  links: ChainLink[];
  driver?: string;
}) {
  /** How many links the student has opened. The first is free. */
  const [open, setOpen] = useState(1);
  /** Which link the propagation has reached, or -1 when idle. */
  const [live, setLive] = useState(-1);
  const [flipped, setFlipped] = useState(false);
  const timers = useRef<number[]>([]);

  const allOpen = open >= links.length;

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  /**
   * Run the consequence down the chain.
   *
   * Staggered rather than instant because the point being made is that these
   * happen IN ORDER — a simultaneous highlight would say "these are related",
   * which the student already knew, instead of "this one causes that one".
   */
  const run = (nextFlipped: boolean) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setFlipped(nextFlipped);
    setOpen(links.length);
    setLive(0);
    links.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setLive(i), i * 420),
      );
    });
    timers.current.push(
      window.setTimeout(() => setLive(-1), links.length * 420 + 1400),
    );
  };

  return (
    <div>
      {/* ---------- The chain ---------- */}
      <ol className="space-y-0">
        {links.map((link, i) => {
          const revealed = i < open;
          const isLive = live === i;
          return (
            <li key={`${link.label}-${i}`}>
              {i > 0 && (
                <div className="flex justify-start pl-[19px]">
                  <ArrowDown
                    size={16}
                    className={cn(
                      "my-0.5 transition-colors duration-200",
                      isLive || (revealed && live < 0) ? "text-brand" : "text-line-strong",
                    )}
                  />
                </div>
              )}

              <div
                className={cn(
                  "rounded-xl border px-3.5 py-2.5 transition-all duration-200",
                  !revealed && "border-dashed border-line bg-surface-2/60",
                  revealed && !isLive && "border-line bg-surface shadow-e1",
                  isLive && "border-brand bg-brand-soft shadow-e2",
                  link.terminal && revealed && "border-navy/25",
                )}
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "tabular mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold",
                      isLive
                        ? "bg-brand text-white"
                        : revealed
                          ? "bg-surface-3 text-navy-soft"
                          : "bg-surface-3 text-navy-faint",
                    )}
                  >
                    {i + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    {revealed ? (
                      <p
                        className={cn(
                          "text-[14.5px] font-semibold leading-snug",
                          link.terminal ? "text-navy" : "text-navy",
                        )}
                      >
                        {link.label}
                        <Trend trend={link.trend} flipped={flipped} />
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpen(i + 1)}
                        className="text-left text-[14px] font-semibold text-navy-faint transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        …then what happens?
                      </button>
                    )}

                    {/* The reason is attached to the link it explains, so it is
                        read at the moment the causation is in question. */}
                    {revealed && link.because && (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-navy-soft">
                        {link.because}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* ---------- Run it ---------- */}
      {allOpen && (
        <div className="mt-4 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
          <p className="eyebrow mb-2 text-navy-faint">Change one thing</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => run(false)}
              className="pressable rounded-lg bg-brand px-3 py-2 text-[13px] font-bold text-white"
            >
              {driver ?? "The driver"} ↑
            </button>
            <button
              type="button"
              onClick={() => run(true)}
              className="pressable rounded-lg border border-line bg-surface px-3 py-2 text-[13px] font-bold text-navy"
            >
              {driver ?? "The driver"} ↓
            </button>
            {live >= 0 && (
              <button
                type="button"
                onClick={() => {
                  timers.current.forEach(clearTimeout);
                  setLive(-1);
                }}
                aria-label="Stop"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-navy-faint hover:bg-surface-3"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
          <p className="mt-2 text-[12px] leading-snug text-navy-soft">
            Watch it travel. Every arrow flips together because they are one
            mechanism, not five separate facts.
          </p>
        </div>
      )}
    </div>
  );
}
