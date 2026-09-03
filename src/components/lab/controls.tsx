"use client";

/** Control primitives shared by every interactive widget and Sim Lab. */

import { type ReactNode } from "react";
import { Pill, type Tone, cn } from "@/components/ui";

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  display,
  tone = "brand",
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display: string;
  tone?: Tone;
  hint?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const accent: Record<Tone, string> = {
    neutral: "var(--color-navy-soft)",
    brand: "var(--color-brand)",
    go: "var(--color-go)",
    caution: "var(--color-caution)",
    nogo: "var(--color-nogo)",
    gold: "var(--color-gold)",
    violet: "var(--color-series-alt)",
  };
  return (
    <label className="block select-none">
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-semibold text-navy">{label}</span>
        <span className="tabular text-[13px] font-bold" style={{ color: accent[tone] }}>
          {display}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lab-range h-6 w-full cursor-pointer appearance-none bg-transparent"
        style={
          {
            "--accent": accent[tone],
            "--track": `linear-gradient(to right, ${accent[tone]} 0%, ${accent[tone]} ${pct}%, var(--color-surface-3) ${pct}%, var(--color-surface-3) 100%)`,
          } as React.CSSProperties
        }
      />
      {hint && <span className="mt-0.5 block text-[11px] text-navy-faint">{hint}</span>}
    </label>
  );
}

export function Toggle({
  label,
  value,
  onChange,
  onLabel = "ON",
  offLabel = "OFF",
  tone = "brand",
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  tone?: Tone;
}) {
  const bg: Record<Tone, string> = {
    neutral: "bg-navy-soft",
    brand: "bg-brand",
    go: "bg-go",
    caution: "bg-caution",
    nogo: "bg-nogo",
    gold: "bg-gold",
    violet: "bg-[var(--color-series-alt)]",
  };
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="text-[12.5px] font-semibold text-navy">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative flex h-7 w-[62px] shrink-0 items-center rounded-full px-1 transition-colors",
          value ? bg[tone] : "bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute text-[9.5px] font-extrabold tracking-wide transition-all",
            value ? "left-2 text-white" : "right-2 text-navy-faint",
          )}
        >
          {value ? onLabel : offLabel}
        </span>
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-[36px]" : "translate-x-0",
          )}
        />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      {label && <p className="mb-1.5 text-[12.5px] font-semibold text-navy">{label}</p>}
      <div className="flex gap-1 rounded-xl bg-surface-3 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-lg px-2 py-1.5 text-[12px] font-semibold transition-all",
              value === o.value
                ? "bg-surface text-navy shadow-sm"
                : "text-navy-soft hover:text-navy",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Readout({
  label,
  value,
  tone = "neutral",
  hint,
  big = false,
}: {
  label: string;
  value: string;
  tone?: Tone;
  hint?: string;
  big?: boolean;
}) {
  const color: Record<Tone, string> = {
    neutral: "text-navy",
    brand: "text-brand",
    go: "text-go",
    caution: "text-caution",
    nogo: "text-nogo",
    gold: "text-gold",
    violet: "text-[var(--color-series-alt)]",
  };
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5">
      <p className="eyebrow text-navy-faint">{label}</p>
      <p className={cn("tabular font-bold leading-none", big ? "mt-1.5 text-2xl" : "mt-1 text-lg", color[tone])}>
        {value}
      </p>
      {hint && <p className="mt-1 text-[11px] text-navy-faint">{hint}</p>}
    </div>
  );
}

/** The signature cause-and-effect chain, rendered inline in labs. */
export function ChainStrip({
  nodes,
  tone = "brand",
}: {
  nodes: { label: string; trend?: "up" | "down" | "same" }[];
  tone?: Tone;
}) {
  const border: Record<Tone, string> = {
    neutral: "border-line",
    brand: "border-brand/30",
    go: "border-go/30",
    caution: "border-caution/30",
    nogo: "border-nogo/30",
    gold: "border-gold/30",
    violet: "border-[var(--color-series-alt)]/30",
  };
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 rounded-xl border bg-surface-2 px-3 py-2.5", border[tone])}>
      {nodes.map((n, i) => (
        <span key={`${n.label}-${i}`} className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-[11.5px] font-semibold text-navy">
            {n.label}
            {n.trend && (
              <span
                className={cn(
                  "font-extrabold",
                  n.trend === "up" ? "text-go" : n.trend === "down" ? "text-nogo" : "text-navy-faint",
                )}
              >
                {n.trend === "up" ? "↑" : n.trend === "down" ? "↓" : "="}
              </span>
            )}
          </span>
          {i < nodes.length - 1 && <span className="text-[13px] font-bold text-navy-faint">→</span>}
        </span>
      ))}
    </div>
  );
}

export function LabNote({ children, tone = "brand" }: { children: ReactNode; tone?: Tone }) {
  return (
    <Pill tone={tone} className="!items-start !rounded-xl !px-3 !py-2 text-left !text-[11.5px] leading-snug">
      {children}
    </Pill>
  );
}
