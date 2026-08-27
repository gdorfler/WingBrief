"use client";

/**
 * Reward primitives — the parts of the interface whose job is to feel good.
 *
 * Two rules hold this file together. Reward fires ONCE on the transition into
 * the earned state and then gets out of the way, because an effect that keeps
 * running stops reading as a reward and starts reading as chrome. And nothing
 * here carries information that is not also written in text next to it, so a
 * reader with reduced motion, or one who simply looks away, misses nothing.
 */

import { Flame, Lock } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "./ui";

/* ------------------------------------------------------------------ */
/* Fires once when a condition becomes true                            */
/* ------------------------------------------------------------------ */

/**
 * True for `ms` after `when` first becomes true.
 *
 * The initial value is deliberately false even when `when` starts true: a
 * badge that is already earned when the page loads should render earned, not
 * re-celebrate on every navigation.
 */
function useEarned(when: boolean, ms = 1600): boolean {
  const [firing, setFiring] = useState(false);
  const previous = useRef(when);
  useEffect(() => {
    if (when && !previous.current) {
      setFiring(true);
      const t = setTimeout(() => setFiring(false), ms);
      previous.current = when;
      return () => clearTimeout(t);
    }
    previous.current = when;
  }, [when, ms]);
  return firing;
}

/* ------------------------------------------------------------------ */
/* XP                                                                  */
/* ------------------------------------------------------------------ */

/**
 * A gain floating up off whatever earned it.
 *
 * Absolutely positioned and pointer-transparent so it can be dropped inside
 * any relatively-positioned container without disturbing the layout.
 */
export function XpBurst({
  amount,
  show,
  className,
}: {
  amount: number;
  show: boolean;
  className?: string;
}) {
  const firing = useEarned(show, 1100);
  if (!firing) return null;
  return (
    <span
      aria-hidden
      className={cn(
        "animate-rise pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2",
        "tabular rounded-full bg-go px-2.5 py-1 text-[12px] font-extrabold text-white shadow-e2",
        className,
      )}
    >
      +{amount} XP
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Streak                                                              */
/* ------------------------------------------------------------------ */

/**
 * Day streak. The flame idles with a slow flicker once the streak is alive,
 * and goes cold and grey at zero — the difference between the two states is
 * colour and motion, not just a number.
 */
export function StreakFlame({
  days,
  size = "md",
}: {
  days: number;
  size?: "sm" | "md";
}) {
  const alive = days > 0;
  const px = size === "sm" ? 15 : 19;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-extrabold",
        size === "sm" ? "px-2 py-0.5 text-[12px]" : "px-2.5 py-1 text-[13px]",
        alive
          ? "bg-[color-mix(in_srgb,var(--color-caution)_16%,transparent)] text-caution"
          : "bg-surface-3 text-navy-faint",
      )}
      title={alive ? `${days}-day streak` : "No streak yet"}
    >
      <Flame
        size={px}
        className={cn(alive && "animate-flicker")}
        fill={alive ? "currentColor" : "none"}
        strokeWidth={alive ? 1.5 : 2}
      />
      <span className="tabular">{days}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Mastery                                                             */
/* ------------------------------------------------------------------ */

/**
 * A mastery badge that pops the moment it is earned and then sits still.
 *
 * The expanding ring is a separate absolutely-positioned element rather than a
 * pseudo-element on the badge, so it can outgrow its parent without forcing
 * the badge itself to have room for it.
 */
export function MasteryBadge({
  earned,
  label,
  icon,
  className,
}: {
  earned: boolean;
  label: string;
  icon: ReactNode;
  className?: string;
}) {
  const firing = useEarned(earned);
  return (
    <span className={cn("relative inline-flex", className)}>
      {firing && (
        <span
          aria-hidden
          className="animate-burst absolute inset-0 rounded-full border-2 border-gold"
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors",
          earned
            ? "border-gold bg-[var(--color-gold-soft)] text-gold shadow-e2"
            : "border-line bg-surface-2 text-navy-faint",
          firing && "animate-pop",
        )}
        title={label}
      >
        {earned ? icon : <Lock size={16} />}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Completion                                                          */
/* ------------------------------------------------------------------ */

/** Deterministic per-index so the pieces do not move between renders. */
const CONFETTI = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 96}%`,
  delay: `${(i % 7) * 70}ms`,
  hue: ["var(--color-brand)", "var(--color-go)", "var(--color-gold)", "var(--color-brand-light)"][i % 4],
  wide: i % 3 === 0,
}));

/**
 * A short burst of confetti for a finished lesson.
 *
 * Positions come from the index rather than Math.random so the server and the
 * client agree — randomising here is the classic way to earn a hydration
 * mismatch on a component that exists purely to look nice.
 */
export function Confetti({ show }: { show: boolean }) {
  const firing = useEarned(show, 1700);
  if (!firing) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0 overflow-visible">
      {CONFETTI.map((piece, i) => (
        <span
          key={i}
          className="animate-confetti absolute top-0 block rounded-[1px]"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            background: piece.hue,
            width: piece.wide ? 7 : 4,
            height: piece.wide ? 4 : 9,
          }}
        />
      ))}
    </span>
  );
}
