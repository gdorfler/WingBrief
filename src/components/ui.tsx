"use client";

/** Shared interface primitives. Everything visual composes from these. */

import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import katex from "katex";

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  children,
  className,
  as: As = "div",
  padded = true,
  interactive = false,
  tinted = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  padded?: boolean;
  /** Lifts toward the cursor. Only for cards that are actually clickable. */
  interactive?: boolean;
  /** A wash of the course accent, for cards that should not read as plain paper. */
  tinted?: boolean;
}) {
  return (
    <As
      className={cn(
        "card",
        padded && "p-5",
        interactive && "card-lift",
        tinted && "bg-[var(--color-surface-tint)]",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function InkCard({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <div className={cn("card-ink", padded && "p-5", className)}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow text-navy-faint">{eyebrow}</p>}
        <h2 className="text-lg text-navy sm:text-xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "ink";
type ButtonSize = "sm" | "md" | "lg";

/*
 * Solid buttons travel: they rise a pixel under the cursor and sink under the
 * press, with the shadow compressing as they go. Ghost has no surface to
 * raise, so it stays flat rather than pretending to have depth.
 */
const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold disabled:pointer-events-none disabled:opacity-45 select-none";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "pressable bg-brand text-white hover:bg-brand-dark",
  secondary: "pressable bg-surface-2 text-navy hover:bg-surface-3 border border-line",
  ghost: "text-navy-soft transition-colors duration-150 hover:bg-surface-2 hover:text-navy",
  danger: "pressable bg-nogo text-white hover:brightness-95",
  success: "pressable bg-go text-white hover:bg-go-dark",
  ink: "pressable bg-ink-700 text-white hover:bg-ink-600 border border-ink-line",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-[15px]",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  fullWidth,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  return (
    <button
      className={cn(
        BUTTON_BASE,
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  fullWidth,
}: {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        BUTTON_BASE,
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        fullWidth && "w-full",
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Pills and badges                                                    */
/* ------------------------------------------------------------------ */

export type Tone = "neutral" | "brand" | "go" | "caution" | "nogo" | "gold" | "violet";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-surface-2 text-navy-soft",
  brand: "bg-brand-soft text-brand",
  go: "bg-go-soft text-go",
  caution: "bg-caution-soft text-caution",
  nogo: "bg-nogo-soft text-nogo",
  gold: "bg-gold-soft text-gold",
  violet: "bg-[color-mix(in_srgb,var(--color-series-alt)_12%,white)] text-[var(--color-series-alt)]",
};

export function Pill({
  children,
  tone = "neutral",
  className,
  size = "md",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-1 text-[11.5px]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Trend chip used throughout the cause-and-effect chains. */
export function TrendChip({ trend }: { trend: "up" | "down" | "same" | "none" }) {
  if (trend === "none") return null;
  const map = {
    up: { tone: "go" as Tone, glyph: "↑" },
    down: { tone: "nogo" as Tone, glyph: "↓" },
    same: { tone: "neutral" as Tone, glyph: "=" },
  };
  const { tone, glyph } = map[trend];
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[13px] font-extrabold leading-none",
        TONE_CLASSES[tone],
      )}
      aria-hidden
    >
      {glyph}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Progress                                                            */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  tone = "brand",
  height = 8,
  className,
  label,
}: {
  /** 0–1. */
  value: number;
  tone?: Tone;
  height?: number;
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;

  // A highlight sweeps the bar when the value climbs. Gated on having seen a
  // previous value, so a bar that simply mounts at 60% does not celebrate.
  const previous = useRef<number | null>(null);
  const [gained, setGained] = useState(false);
  useEffect(() => {
    if (previous.current !== null && pct > previous.current) {
      setGained(true);
      const t = setTimeout(() => setGained(false), 1100);
      previous.current = pct;
      return () => clearTimeout(t);
    }
    previous.current = pct;
  }, [pct]);

  // Brand takes the gradient treatment; the semantic tones stay flat so that
  // "you are in the red" reads as a state rather than as decoration.
  const fill: Record<Tone, string> = {
    neutral: "bg-navy-faint",
    brand: "progress-fill",
    go: "bg-go",
    caution: "bg-caution",
    nogo: "bg-nogo",
    gold: "bg-gold",
    violet: "bg-[var(--color-series-alt)]",
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-surface-3",
        "shadow-[inset_0_1px_2px_rgb(10_30_56/0.07)]",
        className,
      )}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          fill[tone],
          gained && "progress-shine",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 84,
  stroke = 9,
  tone = "go",
  children,
  trackClassName,
}: {
  /** 0–1. */
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  children?: ReactNode;
  trackClassName?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  const colors: Record<Tone, string> = {
    neutral: "var(--color-navy-faint)",
    brand: "var(--color-brand)",
    go: "var(--color-go)",
    caution: "var(--color-caution)",
    nogo: "var(--color-nogo)",
    gold: "var(--color-gold)",
    violet: "var(--color-series-alt)",
  };
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={cn(trackClassName ?? "stroke-surface-3")}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors[tone]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Formula rendering                                                   */
/* ------------------------------------------------------------------ */

export function Formula({
  tex,
  display = false,
  className,
}: {
  tex: string;
  display?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(tex, ref.current, {
        displayMode: display,
        throwOnError: false,
        output: "html",
      });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [tex, display]);

  return (
    <span
      className={cn(display ? "block text-center" : "inline-block", className)}
      aria-label={tex}
    >
      {failed ? <code className="font-mono text-sm">{tex}</code> : <span ref={ref} />}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Layout helpers                                                      */
/* ------------------------------------------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow text-brand">{eyebrow}</p>}
          <h1 className="mt-1 text-2xl leading-tight text-navy sm:text-[30px]">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-navy-soft">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </header>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="text-navy-faint">{icon}</div>}
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-navy-soft">{body}</p>
      {action}
    </Card>
  );
}

/** Horizontally scrolling chip rail used for filters. */
export function ChipRail({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">{children}</div>
  );
}

export function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-surface text-navy-soft hover:border-line-strong hover:text-navy",
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

/**
 * A small stat for a dark hero, where a full StatTile would be too loud.
 *
 * The heroes carry two of these at most. A hero's job is to say where you are
 * and offer the next action; a row of four boxed metrics inside it turns that
 * into a dashboard, which is the thing these screens are trying not to be.
 */
export function InkChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "caution";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold",
        tone === "caution" ? "bg-caution/20 text-[#ffc46b]" : "bg-white/10 text-[#c5d8ec]",
      )}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  ink = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  ink?: boolean;
}) {
  const valueColor: Record<Tone, string> = {
    neutral: ink ? "text-white" : "text-navy",
    brand: "text-brand",
    go: "text-go",
    caution: "text-caution",
    nogo: "text-nogo",
    gold: "text-gold",
    violet: "text-[var(--color-series-alt)]",
  };
  return (
    <div
      className={cn(
        "rounded-xl px-3.5 py-3",
        ink ? "bg-ink-700/70" : "bg-surface-2",
      )}
    >
      <p className={cn("eyebrow", ink ? "text-[#8fb0d4]" : "text-navy-faint")}>{label}</p>
      <p className={cn("tabular mt-1 text-xl font-bold leading-none", valueColor[tone])}>{value}</p>
      {hint && (
        <p className={cn("mt-1 text-[11px]", ink ? "text-[#7d9cc0]" : "text-navy-faint")}>{hint}</p>
      )}
    </div>
  );
}

/** Screen-reader-only text. */
export function SrOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
