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
    /* ---------------- Flight Rules ---------------- */
    "frr-book": (
      <>
        <path d="M5 7 C10 5 13 6 16 8 C19 6 22 5 27 7 V25 C22 23 19 24 16 26 C13 24 10 23 5 25 Z" strokeWidth={2} strokeLinejoin="round" />
        <path d="M16 8 V26" strokeWidth={1.6} />
      </>
    ),
    "frr-stack": (
      <>
        <rect x="11" y="5" width="10" height="5" rx="1.6" strokeWidth={2} />
        <rect x="8" y="12" width="16" height="5" rx="1.6" strokeWidth={1.8} opacity={0.8} />
        <rect x="5" y="19" width="22" height="5" rx="1.6" strokeWidth={1.6} opacity={0.55} />
      </>
    ),
    "frr-words": (
      <>
        <path d="M5 10 H27" strokeWidth={2.2} strokeLinecap="round" />
        <path d="M5 16 H20" strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
        <path d="M5 22 H15" strokeWidth={1.8} strokeLinecap="round" opacity={0.4} />
        <circle cx="24" cy="21" r="4" strokeWidth={2} />
      </>
    ),
    "frr-atc": (
      <>
        <path d="M13 27 L16 12 L19 27" strokeWidth={2} strokeLinejoin="round" />
        <rect x="11" y="6" width="10" height="7" rx="2" strokeWidth={2} />
        <path d="M6 9 C8 11 8 15 6 17" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
        <path d="M26 9 C24 11 24 15 26 17" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
      </>
    ),
    "frr-signal": (
      <>
        <circle cx="16" cy="20" r="3" strokeWidth={2} />
        <path d="M10 15 C12 12 20 12 22 15" strokeWidth={1.9} strokeLinecap="round" />
        <path d="M6 10 C10 5 22 5 26 10" strokeWidth={1.7} strokeLinecap="round" opacity={0.55} />
      </>
    ),
    "frr-pic": (
      <>
        <circle cx="16" cy="11" r="5" strokeWidth={2} />
        <path d="M6 27 C6 20 26 20 26 27" strokeWidth={2} strokeLinecap="round" />
        <path d="M13 11 L15 13 L20 8" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    "frr-plan": (
      <>
        <rect x="7" y="4" width="18" height="24" rx="2.5" strokeWidth={2} />
        <path d="M11 11 H21" strokeWidth={1.8} strokeLinecap="round" />
        <path d="M11 16 H21" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
        <path d="M11 21 H17" strokeWidth={1.6} strokeLinecap="round" opacity={0.4} />
      </>
    ),
    "frr-clock": (
      <>
        <circle cx="16" cy="16" r="11" strokeWidth={2} />
        <path d="M16 9 V16 L21 19" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    "frr-airfield": (
      <>
        <path d="M8 27 L13 5 H19 L24 27" strokeWidth={2} strokeLinejoin="round" />
        <path d="M16 9 V13 M16 17 V21" strokeWidth={1.8} strokeLinecap="round" opacity={0.6} />
      </>
    ),
    "frr-ppe": (
      <>
        <path d="M6 18 C6 10 26 10 26 18 V21 H6 Z" strokeWidth={2} strokeLinejoin="round" />
        <path d="M11 21 V25 H21 V21" strokeWidth={1.8} strokeLinejoin="round" />
        <path d="M13 15 H19" strokeWidth={1.6} opacity={0.6} />
      </>
    ),
    "frr-oxygen": (
      <>
        <path d="M6 25 H26" strokeWidth={2} strokeLinecap="round" />
        <path d="M6 18 H26" strokeWidth={1.8} strokeLinecap="round" strokeDasharray="3 3" opacity={0.7} />
        <path d="M6 11 H26" strokeWidth={1.6} strokeLinecap="round" strokeDasharray="3 3" opacity={0.45} />
        <path d="M16 28 V6 M13 9 L16 6 L19 9" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    "frr-human": (
      <>
        <circle cx="16" cy="8" r="4" strokeWidth={2} />
        <path d="M16 12 V21 M16 21 L11 27 M16 21 L21 27 M9 16 H23" strokeWidth={1.9} strokeLinecap="round" />
      </>
    ),
    "frr-runway": (
      <>
        <path d="M11 27 L13 6 H19 L21 27 Z" strokeWidth={2} strokeLinejoin="round" />
        <path d="M16 11 V14 M16 18 V21" strokeWidth={2} strokeLinecap="round" />
      </>
    ),
    "frr-lightgun": (
      <>
        <path d="M5 12 H16 L25 7 V25 L16 20 H5 Z" strokeWidth={2} strokeLinejoin="round" />
        <circle cx="10" cy="16" r="2" strokeWidth={1.6} opacity={0.7} />
      </>
    ),
    "frr-lights": (
      <>
        <circle cx="8" cy="20" r="2.6" strokeWidth={2} />
        <circle cx="16" cy="14" r="2.6" strokeWidth={2} />
        <circle cx="24" cy="20" r="2.6" strokeWidth={2} />
        <path d="M6 27 H26" strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
      </>
    ),
    "frr-vasi": (
      <>
        <circle cx="11" cy="12" r="3.2" strokeWidth={2} />
        <circle cx="21" cy="12" r="3.2" strokeWidth={2} fill="currentColor" opacity={0.25} />
        <path d="M5 25 H27" strokeWidth={2} strokeLinecap="round" />
        <path d="M7 22 L25 8" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.55} />
      </>
    ),
    "frr-cloud": (
      <>
        <path d="M9 21 C5 21 5 15 9 15 C9 9 19 8 20 14 C25 13 27 21 22 21 Z" strokeWidth={2} strokeLinejoin="round" />
        <path d="M9 26 H23" strokeWidth={1.7} strokeLinecap="round" strokeDasharray="3 3" opacity={0.6} />
      </>
    ),
    "frr-minimums": (
      <>
        <path d="M5 10 H27" strokeWidth={1.8} strokeLinecap="round" strokeDasharray="3 3" opacity={0.6} />
        <path d="M5 25 H27" strokeWidth={2} strokeLinecap="round" />
        <path d="M16 10 V25 M13 13 L16 10 L19 13 M13 22 L16 25 L19 22" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    "frr-ifr": (
      <>
        <circle cx="16" cy="16" r="11" strokeWidth={2} />
        <path d="M6 16 C10 12 22 20 26 16" strokeWidth={1.9} strokeLinecap="round" />
        <path d="M16 5 V9 M16 23 V27" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
      </>
    ),
    "frr-approach": (
      <>
        <path d="M4 8 L22 22" strokeWidth={2} strokeLinecap="round" />
        <path d="M20 26 H28" strokeWidth={2} strokeLinecap="round" />
        <path d="M8 14 H14 M13 19 H19" strokeWidth={1.6} strokeLinecap="round" opacity={0.55} />
      </>
    ),
    "frr-alternate": (
      <>
        <path d="M6 26 C10 14 16 14 16 6" strokeWidth={2} strokeLinecap="round" />
        <path d="M16 14 C20 14 24 18 26 26" strokeWidth={1.8} strokeLinecap="round" strokeDasharray="3 3" />
        <circle cx="16" cy="6" r="2.4" strokeWidth={1.8} />
      </>
    ),
    "frr-compass": (
      <>
        <circle cx="16" cy="16" r="11" strokeWidth={2} />
        <path d="M20 12 L14 14 L12 20 L18 18 Z" strokeWidth={1.9} strokeLinejoin="round" />
        <path d="M16 3 V6" strokeWidth={2} strokeLinecap="round" />
      </>
    ),
    "frr-aerobatic": (
      <>
        <path d="M5 26 C5 12 14 5 20 11 C25 16 19 23 15 19 C12 16 15 12 19 13" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="26" cy="8" r="2" strokeWidth={1.8} />
      </>
    ),
    "frr-airspace": (
      <>
        <path d="M4 25 H28" strokeWidth={2} strokeLinecap="round" />
        <path d="M4 17 H28" strokeWidth={1.6} strokeDasharray="3 3" opacity={0.6} />
        <path d="M4 9 H28" strokeWidth={1.6} strokeDasharray="3 3" opacity={0.4} />
        <path d="M12 25 V17 H20 V9" strokeWidth={2} strokeLinejoin="round" />
      </>
    ),
    "frr-classes": (
      <>
        <path d="M4 26 H28" strokeWidth={2} strokeLinecap="round" />
        <rect x="12" y="18" width="8" height="8" strokeWidth={1.9} />
        <rect x="8" y="12" width="16" height="6" strokeWidth={1.7} opacity={0.75} />
        <rect x="4" y="6" width="24" height="6" strokeWidth={1.5} opacity={0.5} />
      </>
    ),
    "frr-route": (
      <>
        <circle cx="6" cy="24" r="2.6" strokeWidth={2} />
        <circle cx="26" cy="8" r="2.6" strokeWidth={2} />
        <path d="M8.5 22 L23.5 10" strokeWidth={2} strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M14 11 L18 15 L14 19" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      </>
    ),
    "frr-table": (
      <>
        <rect x="5" y="7" width="22" height="18" rx="2.5" strokeWidth={2} />
        <path d="M5 13 H27 M16 13 V25 M5 19 H27" strokeWidth={1.6} opacity={0.7} />
      </>
    ),
    "frr-sua": (
      <>
        <path d="M16 4 L27 10 V19 C27 24 16 28 16 28 C16 28 5 24 5 19 V10 Z" strokeWidth={2} strokeLinejoin="round" />
        <path d="M11 11 L21 21 M21 11 L11 21" strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
      </>
    ),
    "frr-nightlights": (
      <>
        <path d="M6 16 H26" strokeWidth={2} strokeLinecap="round" />
        <ellipse cx="16" cy="16" rx="3" ry="5" strokeWidth={2} />
        <circle cx="6" cy="16" r="2.4" strokeWidth={2} />
        <circle cx="26" cy="16" r="2.4" strokeWidth={2} />
        <circle cx="16" cy="25" r="2" strokeWidth={1.8} opacity={0.7} />
      </>
    ),
    "frr-rightofway": (
      <>
        <path d="M4 20 H15 M12 17 L15 20 L12 23" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 12 H17 M20 9 L17 12 L20 15" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 4 V28" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
      </>
    ),
    "frr-limits": (
      <>
        <path d="M5 26 H27" strokeWidth={2} strokeLinecap="round" />
        <path d="M5 8 H27" strokeWidth={2} strokeLinecap="round" strokeDasharray="4 3" />
        <path d="M16 12 L16 22 M12 16 L16 12 L20 16" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    "frr-conduct": (
      <>
        <path d="M16 4 L28 26 H4 Z" strokeWidth={2} strokeLinejoin="round" />
        <path d="M16 13 V18" strokeWidth={2.2} strokeLinecap="round" />
        <circle cx="16" cy="22" r="1.3" fill="currentColor" stroke="none" />
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
      {glyph[name] ?? glyph.vector}
    </svg>
  );
}
