/** Subject-specific handbook symbols. All strokes inherit a single weight. */

const GLYPHS: Record<string, React.ReactNode> = {
    "wx-squall": <><path d="M4 24L28 8 M5 17L8 12L11 14 M13 12L16 7L19 9 M21 7L24 2L27 4" /><path d="M8 27L10 23 M16 23L18 19 M24 19L26 15" /></>,
    "wx-wave": <><path d="M3 25L10 14L17 25H29 M3 10C8 2 12 2 16 10S24 18 29 10 M16 20C20 14 24 14 28 20" /></>,
    "wx-ash": <><path d="M5 27L13 16H18L26 27 M14 12L10 5 M19 12L24 4 M16 10V3" /><circle cx="7" cy="13" r="1" /><circle cx="26" cy="14" r="1" /><circle cx="22" cy="9" r="1" /></>,
    "wx-taf": <><path d="M4 7H28 M4 15H22 M4 23H16 M7 4V10 M16 4V10 M25 4V10 M22 21H29 M26 18L29 21L26 24" /></>,
    vector: (
      <>
        <path d="M6 24 L22 10" />
        <path d="M16 9 L23 9 L23 16" />
        <path d="M6 24 L6 14" strokeDasharray="2 2" />
      </>
    ),
    atmosphere: (
      <>
        <path d="M5 24 H27" />
        <path d="M7 19 H25" />
        <path d="M9 14 H23" />
        <path d="M11 9 H21" />
      </>
    ),
    streamtube: (
      <>
        <path d="M4 9 C12 9 12 14 16 14 C20 14 20 9 28 9" />
        <path d="M4 23 C12 23 12 18 16 18 C20 18 20 23 28 23" />
        <path d="M13 16 H19" />
      </>
    ),
    pitot: (
      <>
        <rect x="4" y="12" width="13" height="6" />
        <path d="M17 15 H23" />
        <circle cx="25" cy="15" r="4" />
      </>
    ),
    airfoil: <path d="M4 20 C10 12 22 9 28 12 C22 19 12 22 4 20 Z" />,
    axes: (
      <>
        <path d="M6 16 H26" />
        <path d="M16 6 V26" />
        <path d="M9 23 L23 9" strokeDasharray="3 2" />
        <circle cx="16" cy="16" r="2.4" fill="currentColor" />
      </>
    ),
    vectors: (
      <>
        <path d="M16 22 V8" />
        <path d="M12 12 L16 8 L20 12" />
        <path d="M16 22 H6" />
        <path d="M16 22 L26 22" />
      </>
    ),
    pressure: (
      <>
        <path d="M4 19 C10 12 22 10 28 13" />
        {[9, 14, 19, 24].map((x, i) => (
          <path key={x} d={`M${x} ${11 - i * 0.4} V${6 + i}`} />
        ))}
      </>
    ),
    equation: (
      <>
        <path d="M5 16 H12" />
        <path d="M15 10 L27 10" />
        <path d="M15 22 L27 22" />
        <path d="M17 16 L25 16" />
      </>
    ),
    clcurve: (
      <>
        <path d="M5 26 V6" />
        <path d="M5 26 H27" />
        <path d="M7 23 C13 23 17 9 20 9 C23 9 24 14 26 17" />
      </>
    ),
    parasite: (
      <>
        <path d="M5 26 V6" />
        <path d="M5 26 H27" />
        <path d="M7 25 C14 25 20 12 26 7" />
      </>
    ),
    vortex: (
      <path
        d="M22 8 C14 8 9 12 9 17 C9 21 13 23 17 22 C20 21 21 18 19 16 C17 14 14 15 14 17"

      />
    ),
    dragcurve: (
      <>
        <path d="M5 26 V6" />
        <path d="M5 26 H27" />
        <path d="M8 8 C11 20 14 21 16 21 C19 21 22 14 26 7" />
        <circle cx="16" cy="21" r="2" fill="currentColor" />
      </>
    ),
    thrustcurve: (
      <>
        <path d="M5 26 V6" />
        <path d="M5 26 H27" />
        <path d="M8 10 C12 20 15 21 17 21 C20 21 23 15 26 11" />
        <path d="M7 12 C13 14 20 15 26 15" strokeDasharray="3 2" />
      </>
    ),
    shift: (
      <>
        <path d="M6 22 C10 14 14 12 17 12" strokeDasharray="3 2" />
        <path d="M12 22 C16 14 20 12 24 12" />
        <path d="M20 6 L26 6 L26 12" />
      </>
    ),
    runway: (
      <>
        <path d="M9 27 L14 6 H18 L23 27 Z" />
        <path d="M16 10 V13 M16 17 V20" />
      </>
    ),
    climb: (
      <>
        <path d="M5 26 L26 8" />
        <path d="M19 7 L27 7 L27 15" />
        <path d="M5 26 H24" strokeDasharray="2 2" />
      </>
    ),
    cruise: (
      <>
        <path d="M4 16 H28" strokeDasharray="4 3" />
        <path d="M11 16 L20 12 L20 20 Z" fill="currentColor" />
      </>
    ),
    glide: (
      <>
        <path d="M6 7 L26 24" strokeDasharray="4 3" />
        <path d="M6 24 H26" />
        <circle cx="8" cy="9" r="2.4" fill="currentColor" />
      </>
    ),
    boundary: (
      <>
        <path d="M4 20 C10 14 20 12 28 14" />
        <path d="M6 16 C11 11 18 9 25 10" strokeDasharray="2 2" />
        <path d="M20 15 q3 3 0 5 M24 16 q3 3 0 5" />
      </>
    ),
    stall: (
      <>
        <path d="M4 19 C10 13 18 11 24 13" />
        <path d="M16 13 q4 4 0 8 q-4 4 0 6" />
        <path d="M24 8 L28 12" />
        <path d="M28 8 L24 12" />
      </>
    ),
    stallspeed: (
      <>
        <circle cx="16" cy="16" r="10" />
        <path d="M16 16 L21 10" />
        <path d="M16 6 V8 M26 16 H24 M16 26 V24 M6 16 H8" />
      </>
    ),
    flaps: (
      <>
        <path d="M4 15 C11 11 19 10 24 12" />
        <path d="M22 13 L28 19" />
      </>
    ),
    turn: (
      <>
        <ellipse cx="16" cy="18" ry="6" strokeDasharray="4 3" />
        <path d="M16 12 L12 8 L20 8 Z" fill="currentColor" />
      </>
    ),
    vn: (
      <>
        <path d="M5 26 V6" />
        <path d="M5 16 H27" />
        <path d="M7 16 C11 16 13 8 17 8 H25" />
        <path d="M7 16 C10 16 12 22 15 22 H25" />
        <path d="M25 8 V22" />
      </>
    ),
    rudder: (
      <>
        <path d="M16 26 V8" />
        <path d="M16 8 L24 14 L16 16 Z" fill="currentColor" />
        <circle cx="16" cy="26" r="2.4" />
      </>
    ),
    spin: (
      <path
        d="M16 5 C22 5 26 9 26 14 C26 19 22 22 18 22 C15 22 13 20 13 17 C13 15 15 13 17 13.6"

      />
    ),
    stability: (
      <>
        <path d="M5 20 Q16 8 27 20" />
        <circle cx="22" cy="16.5" r="3.2" fill="currentColor" />
      </>
    ),
    wake: (
      <>
        <path d="M4 10 H24" strokeDasharray="3 2" />
        <circle cx="9" cy="17" r="4" />
        <circle cx="21" cy="20" r="5" />
      </>
    ),
    shear: (
      <>
        <path d="M4 12 H16" />
        <path d="M12 9 L16 12 L12 15" />
        <path d="M28 21 H16" />
        <path d="M20 18 L16 21 L20 24" />
        <path d="M16 5 V27" strokeDasharray="3 3" />
      </>
    ),
    /* ---------------- Flight Rules ---------------- */
    "frr-book": (
      <>
        <path d="M5 7 C10 5 13 6 16 8 C19 6 22 5 27 7 V25 C22 23 19 24 16 26 C13 24 10 23 5 25 Z" />
        <path d="M16 8 V26" />
      </>
    ),
    "frr-stack": (
      <>
        <rect x="11" y="5" width="10" height="5" />
        <rect x="8" y="12" width="16" height="5" />
        <rect x="5" y="19" width="22" height="5" />
      </>
    ),
    "frr-words": (
      <>
        <path d="M5 10 H27" />
        <path d="M5 16 H20" />
        <path d="M5 22 H15" />
        <circle cx="24" cy="21" r="4" />
      </>
    ),
    "frr-atc": (
      <>
        <path d="M13 27 L16 12 L19 27" />
        <rect x="11" y="6" width="10" height="7" />
        <path d="M6 9 C8 11 8 15 6 17" />
        <path d="M26 9 C24 11 24 15 26 17" />
      </>
    ),
    "frr-signal": (
      <>
        <circle cx="16" cy="20" r="3" />
        <path d="M10 15 C12 12 20 12 22 15" />
        <path d="M6 10 C10 5 22 5 26 10" />
      </>
    ),
    "frr-pic": (
      <>
        <circle cx="16" cy="11" r="5" />
        <path d="M6 27 C6 20 26 20 26 27" />
        <path d="M13 11 L15 13 L20 8" />
      </>
    ),
    /* ---------------- Engines ---------------- */
    "eng-pressure": (
      <>
        <path d="M6 24 V17" />
        <path d="M14 24 V11" />
        <path d="M6 17 L14 11" strokeDasharray="2 2" />
        <path d="M23 24 V6" />
        <path d="M14 11 L23 6" strokeDasharray="2 2" />
      </>
    ),
    "eng-duct": (
      <>
        <path d="M4 9 C13 9 15 15 21 15" />
        <path d="M4 23 C13 23 15 17 21 17" />
        <path d="M23 12 L28 16 L23 20" />
      </>
    ),
    "eng-supersonic": (
      <>
        <path d="M4 15 C10 15 12 9 21 9" />
        <path d="M4 17 C10 17 12 23 21 23" />
        <path d="M23 12 L28 16 L23 20" />
      </>
    ),
    "eng-core": (
      <>
        <path d="M4 11 H12 V21 H4 Z" />
        <path d="M12 8 H20 V24 H12 Z" />
        <path d="M20 11 H28 V21 H20 Z" />
      </>
    ),
    "eng-thrust": (
      <>
        <path d="M4 10 L18 10 L24 16 L18 22 L4 22 Z" />
        <path d="M22 16 H28" />
        <path d="M25 12.5 L29 16 L25 19.5" />
      </>
    ),
    "eng-density": (
      <>
        <path d="M16 27 V6" />
        <path d="M12 10 L16 5 L20 10" />
        <circle cx="9" cy="24" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="24" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="20" cy="24" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="25.5" cy="24" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="11" cy="16.5" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="18" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="24" cy="17" r="1.3" fill="currentColor" stroke="none" />
      </>
    ),
    "eng-rpm": (
      <>
        <circle cx="16" cy="16" r="2.2" fill="currentColor" stroke="none" />
        <path d="M16 16 C16 9 22 7 25 10" />
        <path d="M16 16 C10 18 7 24 11 27" />
        <path d="M16 16 C22 15 27 19 25 24" />
      </>
    ),
    "eng-gauge": (
      <>
        <circle cx="16" cy="17" r="10" />
        <path d="M16 17 L21 11" />
        <path d="M16 7 V9.4 M25 12.4 L23 13.6 M7 12.4 L9 13.6 M16 27 V24.6" />
        <circle cx="16" cy="17" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
    "eng-gauge-alert": (
      <>
        <circle cx="13" cy="18" r="8.5" />
        <path d="M13 18 L18.5 11" />
        <path d="M25 21 V26.4" />
        <circle cx="25" cy="29.4" r="1.1" fill="currentColor" stroke="none" />
      </>
    ),
    "eng-inlet": (
      <>
        <path d="M4 8 C8 8 8 12 12 12 H28" />
        <path d="M4 24 C8 24 8 20 12 20 H28" />
        <path d="M4 8 V24" />
      </>
    ),
    "eng-variable": (
      <>
        <path d="M4 10 H24" />
        <path d="M4 22 H16 L24 15" />
        <path d="M16 22 V26" strokeDasharray="2 2" />
        <path d="M20 25 L25 22.5 L25 26.5 Z" fill="currentColor" stroke="none" />
      </>
    ),
    "eng-centrifugal": (
      <>
        <circle cx="16" cy="16" r="5" />
        <path
          d="M16 16 L16 6 M16 16 L24.5 11 M16 16 L24.5 21 M16 16 L16 26 M16 16 L7.5 21 M16 16 L7.5 11"

        />
      </>
    ),
    "eng-axial": (
      <path
        d="M5 8 V24 M9 9 V23 M13 10 V22 M17 11 V21 M21 12 V20 M25 13 V19"

      />
    ),
    "eng-diffuser": (
      <>
        <path d="M6 14 C12 14 12 10 20 8 C24 7 26 7 28 7" />
        <path d="M6 18 C12 18 12 22 20 24 C24 25 26 25 28 25" />
        <path d="M10 15 V17 M14 14.5 V17.5 M18 14 V18" />
      </>
    ),
    "eng-burner": (
      <>
        <path d="M6 8 H26 V24 H6 Z" />
        <path d="M16 20 C13 17 13 14 16 10 C19 14 19 17 16 20 Z" />
        <circle cx="9" cy="12" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="9" cy="20" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="23" cy="12" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="23" cy="20" r="0.9" fill="currentColor" stroke="none" />
      </>
    ),
    "eng-chamber": (
      <>
        <circle cx="16" cy="16" r="10" />
        <circle cx="16" cy="16" r="5" />
        <path d="M16 6 V11 M26 16 H21 M16 26 V21 M6 16 H11" />
      </>
    ),
    "eng-turbine": (
      <>
        <circle cx="16" cy="16" r="4" />
        <path d="M16 12 L19 5 L21 6.5 L18 13 Z" />
        <path d="M20 16 L27 14 L27 16.5 L20.5 18 Z" />
        <path d="M16 20 L14 27 L11.5 26 L13.5 19 Z" />
        <path d="M12 16 L5 18 L5 15.5 L11.5 14 Z" />
      </>
    ),
    "eng-exhaust": (
      <>
        <path d="M6 11 L20 11 L26 16 L20 21 L6 21 Z" />
        <path d="M26 16 L30 12 M26 16 H30 M26 16 L30 20" />
      </>
    ),
    "eng-blade": (
      <>
        <path d="M6 22 C10 16 20 12 26 14 C21 19 13 23 6 22 Z" />
        <path d="M4 24 L26 14" strokeDasharray="2.4 2" />
        <path d="M10.5 21 A8 8 0 0 1 12.5 16.2" />
      </>
    ),
    "eng-distortion": (
      <>
        <path d="M4 10 C8 6 10 14 14 10" />
        <path d="M4 16 C9 18 11 12 16 16" />
        <path d="M4 22 C7 20 12 24 15 20" />
        <path d="M19 6 V26" strokeDasharray="2.4 2" />
      </>
    ),
    "eng-recovery": (
      <>
        <path d="M8 18 A9 9 0 1 1 11 24.5" />
        <path d="M11 20 L11 25 L6 25" />
        <path d="M20 12 L23 15 L28 8" />
      </>
    ),
    "eng-turbofan": (
      <>
        <circle cx="12" cy="16" r="9" />
        <path d="M12 8 V24 M5 16 H19" />
        <circle cx="23" cy="16" r="4" />
        <path d="M27 16 H30" />
      </>
    ),
    "eng-prop": (
      <>
        <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
        <path d="M16 16 C13 9 17 4 22 5 C21 10 19 14 16 16 Z" />
        <path d="M16 16 C19 23 15 28 10 27 C11 22 13 18 16 16 Z" />
      </>
    ),
    "eng-piston": (
      <>
        <path d="M11 6 H19 V18 H11 Z" />
        <path d="M15 18 V22" />
        <circle cx="15" cy="25" r="3.4" />
        <path d="M15 22 L18 25" />
      </>
    ),
    "eng-fuel": (
      <>
        <path d="M4 12 H12 V22 H4 Z" />
        <path d="M12 17 H21" />
        <circle cx="24" cy="17" r="3.4" />
        <path d="M24 13.6 V14.6 M24 19.4 V20.4" />
      </>
    ),
    "eng-fuel-type": (
      <>
        <path
          d="M16 6 C21 14 23 18 23 21.5 A7 7 0 1 1 9 21.5 C9 18 11 14 16 6 Z"

        />
        <path d="M16 16 V24" strokeDasharray="2 2" />
      </>
    ),
    "eng-oil": (
      <>
        <path
          d="M14 6 C18 12 20 15 20 18 A6 6 0 1 1 8 18 C8 15 10 12 14 6 Z"

        />
        <path d="M22 20 A6 6 0 1 1 20 14.5" />
        <path d="M19 13 L20 15 L22 13.6" />
      </>
    ),
    "eng-start": <path d="M17 4 L9 18 H15 L13 28 L23 13 H17 Z" />,
    "eng-hydraulic": (
      <>
        <path d="M6 12 H18 V20 H6 Z" />
        <path d="M12 12 V6" />
        <path d="M9 8 L12 4.6 L15 8" />
        <path d="M20 16 H27" />
        <path d="M24 13 L27 16 L24 19" />
      </>
    ),
    "eng-electrical": (
      <>
        <path d="M5 10 H27" />
        <path d="M5 22 H27" />
        <path d="M10 10 V22 M16 10 V22 M22 10 V22" />
        <path d="M17 4 L12 15 H16 L14 22 L21 11 H17 Z" />
      </>
    ),

    "frr-plan": (
      <>
        <rect x="7" y="4" width="18" height="24" />
        <path d="M11 11 H21" />
        <path d="M11 16 H21" />
        <path d="M11 21 H17" />
      </>
    ),
    "frr-clock": (
      <>
        <circle cx="16" cy="16" r="11" />
        <path d="M16 9 V16 L21 19" />
      </>
    ),
    "frr-airfield": (
      <>
        <path d="M8 27 L13 5 H19 L24 27" />
        <path d="M16 9 V13 M16 17 V21" />
      </>
    ),
    "frr-ppe": (
      <>
        <path d="M6 18 C6 10 26 10 26 18 V21 H6 Z" />
        <path d="M11 21 V25 H21 V21" />
        <path d="M13 15 H19" />
      </>
    ),
    "frr-human": (
      <>
        <circle cx="16" cy="8" r="4" />
        <path d="M16 12 V21 M16 21 L11 27 M16 21 L21 27 M9 16 H23" />
      </>
    ),
    "frr-runway": (
      <>
        <path d="M11 27 L13 6 H19 L21 27 Z" />
        <path d="M16 11 V14 M16 18 V21" />
      </>
    ),
    "frr-lightgun": (
      <>
        <path d="M5 12 H16 L25 7 V25 L16 20 H5 Z" />
        <circle cx="10" cy="16" r="2" />
      </>
    ),
    "frr-lights": (
      <>
        <circle cx="8" cy="20" r="2.6" />
        <circle cx="16" cy="14" r="2.6" />
        <circle cx="24" cy="20" r="2.6" />
        <path d="M6 27 H26" />
      </>
    ),
    "frr-vasi": (
      <>
        <circle cx="11" cy="12" r="3.2" />
        <circle cx="21" cy="12" r="3.2" fill="currentColor" />
        <path d="M5 25 H27" />
        <path d="M7 22 L25 8" strokeDasharray="3 3" />
      </>
    ),
    "frr-cloud": (
      <>
        <path d="M9 21 C5 21 5 15 9 15 C9 9 19 8 20 14 C25 13 27 21 22 21 Z" />
        <path d="M9 26 H23" strokeDasharray="3 3" />
      </>
    ),
    "frr-minimums": (
      <>
        <path d="M5 10 H27" strokeDasharray="3 3" />
        <path d="M5 25 H27" />
        <path d="M16 10 V25 M13 13 L16 10 L19 13 M13 22 L16 25 L19 22" />
      </>
    ),
    "frr-ifr": (
      <>
        <circle cx="16" cy="16" r="11" />
        <path d="M6 16 C10 12 22 20 26 16" />
        <path d="M16 5 V9 M16 23 V27" />
      </>
    ),
    "frr-approach": (
      <>
        <path d="M4 8 L22 22" />
        <path d="M20 26 H28" />
        <path d="M8 14 H14 M13 19 H19" />
      </>
    ),
    "frr-alternate": (
      <>
        <path d="M6 26 C10 14 16 14 16 6" />
        <path d="M16 14 C20 14 24 18 26 26" strokeDasharray="3 3" />
        <circle cx="16" cy="6" r="2.4" />
      </>
    ),
    "frr-compass": (
      <>
        <circle cx="16" cy="16" r="11" />
        <path d="M20 12 L14 14 L12 20 L18 18 Z" />
        <path d="M16 3 V6" />
      </>
    ),
    "frr-aerobatic": (
      <>
        <path d="M5 26 C5 12 14 5 20 11 C25 16 19 23 15 19 C12 16 15 12 19 13" />
        <circle cx="26" cy="8" r="2" />
      </>
    ),
    "frr-airspace": (
      <>
        <path d="M4 25 H28" />
        <path d="M4 17 H28" strokeDasharray="3 3" />
        <path d="M4 9 H28" strokeDasharray="3 3" />
        <path d="M12 25 V17 H20 V9" />
      </>
    ),
    "frr-classes": (
      <>
        <path d="M4 26 H28" />
        <rect x="12" y="18" width="8" height="8" />
        <rect x="8" y="12" width="16" height="6" />
        <rect x="4" y="6" width="24" height="6" />
      </>
    ),
    "frr-route": (
      <>
        <circle cx="6" cy="24" r="2.6" />
        <circle cx="26" cy="8" r="2.6" />
        <path d="M8.5 22 L23.5 10" strokeDasharray="4 3" />
        <path d="M14 11 L18 15 L14 19" />
      </>
    ),
    "frr-table": (
      <>
        <rect x="5" y="7" width="22" height="18" />
        <path d="M5 13 H27 M16 13 V25 M5 19 H27" />
      </>
    ),
    "frr-sua": (
      <>
        <path d="M16 4 L27 10 V19 C27 24 16 28 16 28 C16 28 5 24 5 19 V10 Z" />
        <path d="M11 11 L21 21 M21 11 L11 21" />
      </>
    ),
    "frr-nightlights": (
      <>
        <path d="M6 16 H26" />
        <ellipse cx="16" cy="16" ry="5" />
        <circle cx="6" cy="16" r="2.4" />
        <circle cx="26" cy="16" r="2.4" />
        <circle cx="16" cy="25" r="2" />
      </>
    ),
    "frr-rightofway": (
      <>
        <path d="M4 20 H15 M12 17 L15 20 L12 23" />
        <path d="M28 12 H17 M20 9 L17 12 L20 15" />
        <path d="M16 4 V28" strokeDasharray="3 3" />
      </>
    ),
    "frr-limits": (
      <>
        <path d="M5 26 H27" />
        <path d="M5 8 H27" strokeDasharray="4 3" />
        <path d="M16 12 L16 22 M12 16 L16 12 L20 16" />
      </>
    ),
    "frr-conduct": (
      <>
        <path d="M16 4 L28 26 H4 Z" />
        <path d="M16 13 V18" />
        <circle cx="16" cy="22" r="1.3" fill="currentColor" stroke="none" />
      </>
    ),
    /* ---------------- Weather ---------------- */
    "wx-atmosphere": (
      <>
        <path d="M4 25 H28" />
        <path d="M6 19 H26" />
        <path d="M8 13 H24" strokeDasharray="3 2.5" />
        <path d="M10 7 H22" />
      </>
    ),
    "wx-pressure": (
      <>
        <ellipse cx="16" cy="16" ry="8" />
        <ellipse cx="16" cy="16" ry="5" />
        <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="800" fill="currentColor" stroke="none">H</text>
      </>
    ),
    "wx-gradient": (
      <>
        <path d="M6 6 V26" />
        <path d="M13 6 V26" />
        <path d="M22 6 V26" />
        <path d="M8 16 H26" />
        <path d="M22 12 L27 16 L22 20" />
      </>
    ),
    "wx-altitude": (
      <>
        <path d="M4 27 H28" />
        <path d="M6 20 L13 20 L18 13 L26 13" />
        <path d="M16 5 V27" strokeDasharray="3 2.5" />
        <path d="M11 8 H21 M13 5.5 L16 3 L19 5.5" />
      </>
    ),
    "wx-altimeter": (
      <>
        <circle cx="16" cy="16" r="11" />
        <path d="M16 16 L16 8" />
        <path d="M16 16 L21 20" />
        <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none" />
      </>
    ),
    "wx-moisture": (
      <>
        <path d="M5 10 H27" />
        <path d="M5 22 H27" />
        <path d="M16 12 V20" strokeDasharray="2 2" />
        <path d="M22 15 C25 18 25 21 22 21 C19 21 19 18 22 15 Z" />
      </>
    ),
    "wx-stability": (
      <>
        <rect x="6" y="5" width="20" height="22" strokeDasharray="3 2.5" />
        <circle cx="16" cy="19" r="5.4" />
        <path d="M16 12 V6 M13 8.5 L16 5 L19 8.5" />
      </>
    ),
    "wx-wind": (
      <>
        <path d="M4 11 H19 C22 11 22 6 19 6" />
        <path d="M4 17 H24 C27 17 27 12 24 12" />
        <path d="M4 23 H16 C19 23 19 27 16 27" />
      </>
    ),
    "wx-breeze": (
      <>
        <path d="M4 22 H15" />
        <path d="M16 22 H28 L28 27 H4 V22 H4" fill="none" />
        <path d="M4 22 H28" />
        <path d="M22 20 C22 14 26 12 26 8" />
        <path d="M8 20 C8 15 12 13 12 9" />
        <path d="M12 12 L12 8 L15 10" />
      </>
    ),
    "wx-jetstream": (
      <>
        <path d="M3 12 C10 8 22 16 29 11" />
        <path d="M3 19 C10 15 22 23 29 18" />
        <path d="M25 8 L29 11 L25 14" />
      </>
    ),
    "wx-lifting": (
      <>
        <path d="M4 26 L12 14 L20 26" />
        <path d="M25 26 V10 M22 13 L25 9 L28 13" />
        <path d="M3 26 H29" />
      </>
    ),
    "wx-cloud": (
      <>
        <path d="M9 22 C5 22 5 16 9 16 C9 10 18 9 19 15 C24 14 26 22 21 22 Z" />
        <path d="M11 26 L10 29 M16 26 L15 29 M21 26 L20 29" />
      </>
    ),
    "wx-front": (
      <>
        <path d="M3 24 L3 12 L19 24 Z" />
        <path d="M20 22 L26 10" />
        <path d="M23 14 L26.5 8 L29 15" />
        <path d="M2 24 H30" />
      </>
    ),
    "wx-occluded": (
      <>
        <path d="M3 16 H29" />
        <path d="M6 16 L9.5 10 L13 16 Z" fill="currentColor" stroke="none" />
        <path d="M17 16 A3.5 3.5 0 0 1 24 16 Z" fill="currentColor" stroke="none" />
        <path d="M3 24 H29" />
      </>
    ),
    "wx-turbulence": (
      <>
        <path d="M3 12 C7 6 11 18 15 12 C19 6 23 18 29 12" />
        <path d="M3 22 C7 16 11 28 15 22 C19 16 23 28 29 22" />
      </>
    ),
    "wx-causes": (
      <>
        <path d="M4 8 H14" />
        <path d="M18 8 H28" />
        <path d="M4 16 C7 12 10 20 14 16" />
        <rect x="18" y="13" width="6" height="6" />
        <path d="M4 26 L10 20 L16 26" />
        <path d="M20 26 H28" />
      </>
    ),
    "wx-technique": (
      <>
        <circle cx="16" cy="16" r="11" />
        <path d="M6 16 H26" />
        <path d="M12 16 L16 12 L20 16" />
      </>
    ),
    "wx-icing": (
      <>
        <path d="M4 18 C10 14 14 20 20 16 C24 13 27 15 29 14" />
        <path d="M6 18 L5 22 M11 17 L10 21 M16 18 L15 22 M21 16 L20 20" />
        <path d="M3 10 H29" strokeDasharray="3 2.5" />
      </>
    ),
    "wx-icetype": (
      <>
        <path d="M16 4 V28 M6 10 L26 22 M26 10 L6 22" />
        <path d="M13 7 L16 4 L19 7 M13 25 L16 28 L19 25" />
      </>
    ),
    "wx-deice": (
      <>
        <path d="M5 20 C11 16 15 22 21 18 C24 16 26 17 28 16" />
        <circle cx="11" cy="9" r="5" />
        <path d="M8.5 9 L13.5 9" />
        <path d="M20 6 L26 12 M26 6 L20 12" />
      </>
    ),
    "wx-thunderstorm": (
      <>
        <path d="M8 17 C4 17 4 11 8 11 C8 5 18 4 19 10 C24 9 26 17 21 17 Z" />
        <path d="M16 18 L12 24 H16 L13 29" />
        <path d="M22 20 L21 24 M8 20 L7 24" />
      </>
    ),
    "wx-microburst": (
      <>
        <ellipse cx="16" cy="7" ry="3.6" />
        <path d="M16 11 V20 M12.5 17 L16 21.5 L19.5 17" />
        <path d="M14 22 C10 27 6 26 4 22" />
        <path d="M18 22 C22 27 26 26 28 22" />
      </>
    ),
    "wx-fog": (
      <>
        <path d="M4 14 H26" />
        <path d="M6 19 H28" />
        <path d="M4 24 H24" />
        <path d="M3 28 H29" />
      </>
    ),
    "wx-ceiling": (
      <>
        <path d="M4 9 H28" />
        <path d="M4 27 H28" />
        <path d="M16 11 V25 M13 14 L16 11 L19 14 M13 22 L16 25 L19 22" />
      </>
    ),
    "wx-metar": (
      <>
        <circle cx="12" cy="22" r="3.4" />
        <path d="M12 18.6 V6" />
        <path d="M12 7 L21 10" />
        <path d="M12 12 L21 15" />
        <path d="M12 17 L17 18.6" />
      </>
    ),
    "wx-chart": (
      <>
        <rect x="4" y="6" width="24" height="20" />
        <ellipse cx="12" cy="16" ry="3.5" />
        <path d="M20 10 C22 14 20 18 22 22" />
        <path d="M20.5 12 L23 13.5 L20.5 15" fill="currentColor" />
      </>
    ),
    "wx-advisory": (
      <>
        <path d="M16 5 L28 26 H4 Z" />
        <path d="M16 13 V19" />
        <circle cx="16" cy="22.5" r="1.3" fill="currentColor" stroke="none" />
      </>
    ),

  /* ---------------- Navigation ---------------- */

  compass: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M15.4 8.6 L13.2 13.2 L8.6 15.4 L10.8 10.8 Z" />
    </>
  ),
  grid: (
    <>
      <path d="M4 9 H20 M4 15 H20 M9 4 V20 M15 4 V20" />
      <circle cx="15" cy="9" r="1.6" />
    </>
  ),
  gauge: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 12 L16.4 8.6" />
      <path d="M12 3.6 V5.4 M20.4 12 H18.6 M12 20.4 V18.6 M3.6 12 H5.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <ellipse cx="12" cy="12" ry="8.4" />
      <path d="M3.6 12 H20.4" />
    </>
  ),
  map: (
    <>
      <path d="M4 6.6 L9.4 4.4 L14.6 6.6 L20 4.4 V17.4 L14.6 19.6 L9.4 17.4 L4 19.6 Z" />
      <path d="M9.4 4.4 V17.4 M14.6 6.6 V19.6" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M7.6 16.4 C11 13 12 12 16.4 7.6" strokeDasharray="2.6 2.4" />
    </>
  ),
  "compass-rose": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4 L13.6 10.4 L12 12 L10.4 10.4 Z" />
      <path d="M12 20 L10.4 13.6 L12 12 L13.6 13.6 Z" />
      <path d="M4 12 H6 M18 12 H20" />
    </>
  ),
  swap: (
    <>
      <path d="M5 9 H17 L14 6" />
      <path d="M19 15 H7 L10 18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 6.8 V12 L15.8 14" />
    </>
  ),
  "clock-arrow": (
    <>
      <circle cx="11" cy="12" r="7.4" />
      <path d="M11 7.4 V12 L14.2 13.8" />
      <path d="M18.4 6 L20.6 8.6 L18 10.4" />
    </>
  ),
  ruler: (
    <>
      <path d="M3.6 14.6 L14.6 3.6 L20.4 9.4 L9.4 20.4 Z" />
      <path d="M7.6 10.6 L9.4 12.4 M10.6 7.6 L12.4 9.4 M13.6 4.6 L15.4 6.4" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="6.8" />
      <path d="M12 2.6 V6.4 M12 17.6 V21.4 M2.6 12 H6.4 M17.6 12 H21.4" />
      <circle cx="12" cy="12" r="1.4" />
    </>
  ),
  protractor: (
    <>
      <path d="M3.6 16 A8.4 8.4 0 0 1 20.4 16 Z" />
      <circle cx="12" cy="16" r="2" />
      <path d="M6.4 11.6 L7.4 12.8 M12 8.2 V9.8 M17.6 11.6 L16.6 12.8" />
    </>
  ),
  dividers: (
    <>
      <circle cx="12" cy="5" r="1.8" />
      <path d="M11.2 6.6 L6.4 19.4" />
      <path d="M12.8 6.6 L17.6 19.4" />
      <path d="M5.4 19 L6.4 20.6 L7.6 19" />
      <path d="M16.4 19 L17.6 20.6 L18.6 19" />
    </>
  ),
  pencil: (
    <>
      <path d="M4.4 19.6 L5.4 15.6 L16.6 4.4 L19.6 7.4 L8.4 18.6 Z" />
      <path d="M14.6 6.4 L17.6 9.4" />
    </>
  ),
  radial: (
    <>
      <path d="M12 12 L20.4 7.6 M12 12 L20.4 16.4 M12 12 L5 6" strokeDasharray="2.4 2" />
      <path d="M8.4 12 L12 8.4 L15.6 12 L12 15.6 Z" />
    </>
  ),
  cr3: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.6" />
      <path d="M12 3.6 V5.6 M12 18.4 V20.4 M3.6 12 H5.6 M18.4 12 H20.4" />
      <path d="M12 12 L17 8" />
    </>
  ),
  index: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 3.6 L9.6 8 H14.4 Z" />
      <path d="M6 18 L8.4 14.6 M18 18 L15.6 14.6" />
    </>
  ),
  tsd: (
    <>
      <path d="M5 9.6 H19" />
      <path d="M9 5.4 H15" />
      <path d="M7.6 18.6 H16.4" />
      <path d="M12 12 V16" />
    </>
  ),
  stopwatch: (
    <>
      <circle cx="12" cy="13.4" r="7.4" />
      <path d="M9.6 3.4 H14.4 M12 3.4 V6" />
      <path d="M12 9.4 V13.4 L15 15.4" />
    </>
  ),
  fuel: (
    <>
      <path d="M5.4 20.4 V5.4 A1.6 1.6 0 0 1 7 3.8 H12.6 A1.6 1.6 0 0 1 14.2 5.4 V20.4 Z" />
      <path d="M5.4 10.4 H14.2" />
      <path d="M14.2 8 H17 A1.6 1.6 0 0 1 18.6 9.6 V16 A1.6 1.6 0 0 0 20.2 17.6" />
    </>
  ),
  altimeter: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 12 L12 6.6 M12 12 L16 14.4" />
      <path d="M12 3.8 V5.2 M20.2 12 H18.8 M12 20.2 V18.8 M3.8 12 H5.2" />
    </>
  ),
  airspeed: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 12 L17.4 9" />
      <path d="M6 16.8 A8.4 8.4 0 0 1 6 7.2" />
    </>
  ),
  mach: (
    <>
      <path d="M4 18 L9 6 L12 14 L15 6 L20 18" />
      <path d="M17 10 A6 6 0 0 1 21 15" strokeDasharray="2 1.8" />
    </>
  ),
  triangle: (
    <>
      <path d="M4.6 19 L15.4 5.6 L19.4 19 Z" />
      <path d="M15.4 5.6 L19.4 19" />
    </>
  ),
  quarter: (
    <>
      <path d="M12 3.6 V20.4 M3.6 12 H20.4" />
      <path d="M17.4 6.6 L14.4 9.6" />
      <path d="M14.4 9.6 L14.4 7.4 M14.4 9.6 L16.6 9.6" />
    </>
  ),
  wind: (
    <>
      <path d="M3.6 8.6 H14 A2.6 2.6 0 1 0 11.4 6" />
      <path d="M3.6 13.4 H18 A2.6 2.6 0 1 1 15.4 16" />
      <path d="M3.6 18 H11" />
    </>
  ),
  "wind-back": (
    <>
      <path d="M20.4 8.6 H10 A2.6 2.6 0 1 1 12.6 6" />
      <path d="M20.4 13.4 H6 A2.6 2.6 0 1 0 8.6 16" />
      <path d="M20.4 18 H13" />
    </>
  ),
  "wind-solve": (
    <>
      <path d="M4.6 19 L14.6 6.6 L19.4 13" />
      <path d="M4.6 19 L19.4 13" strokeDasharray="2.4 2" />
      <circle cx="4.6" cy="19" r="1.4" />
    </>
  ),
  direct: (
    <>
      <circle cx="12" cy="12" r="2" />
      <circle cx="5.6" cy="17.4" r="1.6" />
      <circle cx="19" cy="6.4" r="2.2" />
      <path d="M6.8 16.2 L17.6 7.6" />
    </>
  ),
  log: (
    <>
      <path d="M4.6 4.6 H19.4 V19.4 H4.6 Z" />
      <path d="M4.6 9 H19.4 M4.6 14 H19.4 M11 9 V19.4 M15.4 9 V19.4" />
    </>
  ),
  plan: (
    <>
      <path d="M5 19.4 V5.6 H15.4 L19 9.2 V19.4 Z" />
      <path d="M8.4 12 H15.6 M8.4 15.4 H13.4" />
      <path d="M15.4 5.6 V9.2 H19" />
    </>
  ),
  update: (
    <>
      <path d="M19.4 12 A7.4 7.4 0 1 1 16.6 6.2" />
      <path d="M17 3.2 V6.6 H13.6" />
      <path d="M12 8.4 V12 L14.8 13.6" />
    </>
  ),
};

export function LessonIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  /** Inherits the same semantic ink as its surrounding text. */
  style?: React.CSSProperties;
}) {
  const S = ["compass","grid","gauge","globe","map","route","compass-rose","swap","clock","clock-arrow","ruler","crosshair","protractor","dividers","pencil","radial","cr3","index","tsd","stopwatch","fuel","altimeter","airspeed","mach","triangle","quarter","wind","wind-back","wind-solve","direct","log","plan","update"].includes(name) ? 24 : 32;
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={S === 24 ? 1.3 : 1.75}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      focusable="false"
      aria-hidden
    >
      {GLYPHS[name] ?? GLYPHS.vector}
    </svg>
  );
}
