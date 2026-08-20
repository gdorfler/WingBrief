"use client";

/**
 * Lesson map icons.
 *
 * Each node carries a miniature of the diagram the lesson is built around, so
 * the map is scannable by picture: the CL curve, the drag curves, the V-n
 * envelope, the spin spiral.
 */

export function LessonIcon({ name, className }: { name: string; className?: string }) {
  const S = 32;
  const glyph: Record<string, React.ReactNode> = {
    vector: (
      <>
        <path d="M6 24 L22 10" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M16 9 L23 9 L23 16" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 24 L6 14" strokeWidth={1.6} strokeDasharray="2 2" />
      </>
    ),
    atmosphere: (
      <>
        <path d="M5 24 H27" strokeWidth={2} strokeLinecap="round" />
        <path d="M7 19 H25" strokeWidth={1.7} strokeLinecap="round" opacity={0.7} />
        <path d="M9 14 H23" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
        <path d="M11 9 H21" strokeWidth={1.3} strokeLinecap="round" opacity={0.35} />
      </>
    ),
    streamtube: (
      <>
        <path d="M4 9 C12 9 12 14 16 14 C20 14 20 9 28 9" strokeWidth={2} strokeLinecap="round" />
        <path d="M4 23 C12 23 12 18 16 18 C20 18 20 23 28 23" strokeWidth={2} strokeLinecap="round" />
        <path d="M13 16 H19" strokeWidth={2.2} strokeLinecap="round" />
      </>
    ),
    pitot: (
      <>
        <rect x="4" y="12" width="13" height="6" rx="3" strokeWidth={2} />
        <path d="M17 15 H23" strokeWidth={2} />
        <circle cx="25" cy="15" r="4" strokeWidth={2} />
      </>
    ),
    airfoil: <path d="M4 20 C10 12 22 9 28 12 C22 19 12 22 4 20 Z" strokeWidth={2} strokeLinejoin="round" />,
    axes: (
      <>
        <path d="M6 16 H26" strokeWidth={2} strokeLinecap="round" />
        <path d="M16 6 V26" strokeWidth={2} strokeLinecap="round" />
        <path d="M9 23 L23 9" strokeWidth={1.6} strokeDasharray="3 2" />
        <circle cx="16" cy="16" r="2.4" strokeWidth={0} fill="currentColor" />
      </>
    ),
    vectors: (
      <>
        <path d="M16 22 V8" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M12 12 L16 8 L20 12" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 22 H6" strokeWidth={2} strokeLinecap="round" />
        <path d="M16 22 L26 22" strokeWidth={2} strokeLinecap="round" opacity={0.5} />
      </>
    ),
    pressure: (
      <>
        <path d="M4 19 C10 12 22 10 28 13" strokeWidth={2} />
        {[9, 14, 19, 24].map((x, i) => (
          <path key={x} d={`M${x} ${11 - i * 0.4} V${6 + i}`} strokeWidth={1.8} strokeLinecap="round" />
        ))}
      </>
    ),
    equation: (
      <>
        <path d="M5 16 H12" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M15 10 L27 10" strokeWidth={2} strokeLinecap="round" />
        <path d="M15 22 L27 22" strokeWidth={2} strokeLinecap="round" />
        <path d="M17 16 L25 16" strokeWidth={2} strokeLinecap="round" />
      </>
    ),
    clcurve: (
      <>
        <path d="M5 26 V6" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M5 26 H27" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M7 23 C13 23 17 9 20 9 C23 9 24 14 26 17" strokeWidth={2.2} strokeLinecap="round" />
      </>
    ),
    parasite: (
      <>
        <path d="M5 26 V6" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M5 26 H27" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M7 25 C14 25 20 12 26 7" strokeWidth={2.2} strokeLinecap="round" />
      </>
    ),
    vortex: (
      <path
        d="M22 8 C14 8 9 12 9 17 C9 21 13 23 17 22 C20 21 21 18 19 16 C17 14 14 15 14 17"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    ),
    dragcurve: (
      <>
        <path d="M5 26 V6" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M5 26 H27" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M8 8 C11 20 14 21 16 21 C19 21 22 14 26 7" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx="16" cy="21" r="2" fill="currentColor" strokeWidth={0} />
      </>
    ),
    thrustcurve: (
      <>
        <path d="M5 26 V6" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M5 26 H27" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M8 10 C12 20 15 21 17 21 C20 21 23 15 26 11" strokeWidth={2} strokeLinecap="round" />
        <path d="M7 12 C13 14 20 15 26 15" strokeWidth={2} strokeLinecap="round" strokeDasharray="3 2" />
      </>
    ),
    shift: (
      <>
        <path d="M6 22 C10 14 14 12 17 12" strokeWidth={2} strokeLinecap="round" strokeDasharray="3 2" opacity={0.5} />
        <path d="M12 22 C16 14 20 12 24 12" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M20 6 L26 6 L26 12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    runway: (
      <>
        <path d="M9 27 L14 6 H18 L23 27 Z" strokeWidth={2} strokeLinejoin="round" />
        <path d="M16 10 V13 M16 17 V20" strokeWidth={2} strokeLinecap="round" />
      </>
    ),
    climb: (
      <>
        <path d="M5 26 L26 8" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M19 7 L27 7 L27 15" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 26 H24" strokeWidth={1.5} strokeDasharray="2 2" opacity={0.6} />
      </>
    ),
    cruise: (
      <>
        <path d="M4 16 H28" strokeWidth={2} strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M11 16 L20 12 L20 20 Z" fill="currentColor" strokeWidth={0} />
      </>
    ),
    glide: (
      <>
        <path d="M6 7 L26 24" strokeWidth={2.2} strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M6 24 H26" strokeWidth={1.8} strokeLinecap="round" />
        <circle cx="8" cy="9" r="2.4" fill="currentColor" strokeWidth={0} />
      </>
    ),
    boundary: (
      <>
        <path d="M4 20 C10 14 20 12 28 14" strokeWidth={2.2} />
        <path d="M6 16 C11 11 18 9 25 10" strokeWidth={1.5} strokeDasharray="2 2" opacity={0.7} />
        <path d="M20 15 q3 3 0 5 M24 16 q3 3 0 5" strokeWidth={1.6} strokeLinecap="round" />
      </>
    ),
    stall: (
      <>
        <path d="M4 19 C10 13 18 11 24 13" strokeWidth={2.2} />
        <path d="M16 13 q4 4 0 8 q-4 4 0 6" strokeWidth={1.8} strokeLinecap="round" opacity={0.8} />
        <path d="M24 8 L28 12" strokeWidth={2} strokeLinecap="round" />
        <path d="M28 8 L24 12" strokeWidth={2} strokeLinecap="round" />
      </>
    ),
    stallspeed: (
      <>
        <circle cx="16" cy="16" r="10" strokeWidth={2} />
        <path d="M16 16 L21 10" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M16 6 V8 M26 16 H24 M16 26 V24 M6 16 H8" strokeWidth={1.8} strokeLinecap="round" />
      </>
    ),
    flaps: (
      <>
        <path d="M4 15 C11 11 19 10 24 12" strokeWidth={2.2} />
        <path d="M22 13 L28 19" strokeWidth={2.4} strokeLinecap="round" />
      </>
    ),
    turn: (
      <>
        <ellipse cx="16" cy="18" rx="11" ry="6" strokeWidth={2} strokeDasharray="4 3" />
        <path d="M16 12 L12 8 L20 8 Z" fill="currentColor" strokeWidth={0} />
      </>
    ),
    vn: (
      <>
        <path d="M5 26 V6" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M5 16 H27" strokeWidth={1.5} opacity={0.5} />
        <path d="M7 16 C11 16 13 8 17 8 H25" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16 C10 16 12 22 15 22 H25" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M25 8 V22" strokeWidth={2.2} strokeLinecap="round" />
      </>
    ),
    rudder: (
      <>
        <path d="M16 26 V8" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M16 8 L24 14 L16 16 Z" fill="currentColor" strokeWidth={0} />
        <circle cx="16" cy="26" r="2.4" strokeWidth={2} />
      </>
    ),
    spin: (
      <path
        d="M16 5 C22 5 26 9 26 14 C26 19 22 22 18 22 C15 22 13 20 13 17 C13 15 15 13 17 13.6"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    ),
    stability: (
      <>
        <path d="M5 20 Q16 8 27 20" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx="22" cy="16.5" r="3.2" fill="currentColor" strokeWidth={0} />
      </>
    ),
    wake: (
      <>
        <path d="M4 10 H24" strokeWidth={1.6} strokeDasharray="3 2" />
        <circle cx="9" cy="17" r="4" strokeWidth={2} />
        <circle cx="21" cy="20" r="5" strokeWidth={2} />
      </>
    ),
    shear: (
      <>
        <path d="M4 12 H16" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M12 9 L16 12 L12 15" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 21 H16" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M20 18 L16 21 L20 24" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 5 V27" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
      </>
    ),
  };

  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden
    >
      {glyph[name] ?? glyph.airfoil}
    </svg>
  );
}
