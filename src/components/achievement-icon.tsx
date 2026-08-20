"use client";

/** Aviation-flavoured achievement glyphs, drawn rather than emoji. */

const GOLD = "var(--color-gold)";
const BRAND = "var(--color-brand-light)";

export function AchievementIcon({
  icon,
  size = 32,
  locked = false,
}: {
  icon: string;
  size?: number;
  locked?: boolean;
}) {
  const stroke = locked ? "var(--color-navy-faint)" : GOLD;
  const accent = locked ? "var(--color-navy-faint)" : BRAND;

  const glyphs: Record<string, React.ReactNode> = {
    takeoff: (
      <>
        <path d="M6 26 H26" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <path d="M7 20 L20 9 L23 12 L14 22 Z" fill={accent} />
      </>
    ),
    wings: (
      <>
        <path d="M4 17 C10 13 13 12 16 12 C19 12 22 13 28 17 L28 19 C22 16.6 19 16 16 16 C13 16 10 16.6 4 19 Z" fill={accent} />
        <circle cx="16" cy="22" r="2" fill={stroke} />
      </>
    ),
    airfoil: (
      <path d="M5 19 C10 12 20 9 27 12 C22 18 13 21 5 19 Z" fill={accent} stroke={stroke} strokeWidth={1.4} />
    ),
    drag: (
      <>
        <path d="M5 22 C11 22 13 10 27 10" fill="none" stroke={accent} strokeWidth={2.2} />
        <path d="M5 10 C11 10 13 22 27 22" fill="none" stroke={stroke} strokeWidth={2.2} />
      </>
    ),
    stall: (
      <>
        <path d="M5 20 C11 20 14 8 27 8" fill="none" stroke={accent} strokeWidth={2.2} />
        <path d="M20 8 C23 11 24 16 22 22" fill="none" stroke={stroke} strokeWidth={2.2} strokeDasharray="2 2" />
      </>
    ),
    chart: (
      <>
        <path d="M6 24 V8" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <path d="M6 24 H26" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <path d="M8 20 C13 20 15 11 25 11" fill="none" stroke={accent} strokeWidth={2.2} />
      </>
    ),
    chain: (
      <>
        <circle cx="9" cy="16" r="4" fill="none" stroke={accent} strokeWidth={2} />
        <circle cx="23" cy="16" r="4" fill="none" stroke={stroke} strokeWidth={2} />
        <path d="M13 16 H19" stroke={stroke} strokeWidth={2} />
      </>
    ),
    flame: (
      <path
        d="M16 5 C19 10 22 11 22 16 C22 20.4 19.3 23 16 23 C12.7 23 10 20.4 10 16 C10 12 13 12 16 5 Z"
        fill={accent}
        stroke={stroke}
        strokeWidth={1.4}
      />
    ),
    target: (
      <>
        <circle cx="16" cy="16" r="9" fill="none" stroke={stroke} strokeWidth={2} />
        <circle cx="16" cy="16" r="4.4" fill="none" stroke={accent} strokeWidth={2} />
        <circle cx="16" cy="16" r="1.6" fill={stroke} />
      </>
    ),
    star: (
      <path
        d="M16 6 L18.6 13.2 L26 13.6 L20.2 18.2 L22.2 25.4 L16 21.2 L9.8 25.4 L11.8 18.2 L6 13.6 L13.4 13.2 Z"
        fill={accent}
        stroke={stroke}
        strokeWidth={1.2}
      />
    ),
    medal: (
      <>
        <path d="M11 5 L15 14 H17 L21 5" stroke={accent} strokeWidth={2} fill="none" />
        <circle cx="16" cy="20" r="7" fill="none" stroke={stroke} strokeWidth={2.2} />
        <circle cx="16" cy="20" r="2.6" fill={stroke} />
      </>
    ),
    shield: (
      <>
        <path d="M16 5 L26 9 V16 C26 22 21.4 26 16 27.6 C10.6 26 6 22 6 16 V9 Z" fill="none" stroke={stroke} strokeWidth={2} />
        <path d="M11.4 16.2 L14.8 19.6 L20.8 12.8" fill="none" stroke={accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
      <rect
        width="32"
        height="32"
        rx="10"
        fill={locked ? "var(--color-surface-2)" : "color-mix(in srgb, var(--color-gold) 12%, transparent)"}
      />
      {glyphs[icon] ?? glyphs.star}
    </svg>
  );
}
