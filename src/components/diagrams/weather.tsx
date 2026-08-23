/**
 * Weather diagrams.
 *
 * The other courses draw objects: an airfoil in side view, an engine in
 * cutaway, an airspace shelf from the side. Weather draws a MEDIUM, so almost
 * everything here is a vertical cross-section of the atmosphere with the
 * ground at the bottom and altitude running up the page. That vertical axis is
 * the course's visual signature, and it is deliberate: weather is the one
 * subject in this platform where the third dimension is the content.
 *
 * Every number rendered comes from the Weather Condensed Notes.
 */

import { Diagram, type DiagramProps, bool, num, str } from "./primitives";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";
/** Weather reserves magenta for hazards; the theme maps it to --color-series-alt. */
const HAZARD = "var(--color-series-alt)";

/* ------------------------------------------------------------------ */
/* w1 — the atmosphere                                                 */
/* ------------------------------------------------------------------ */

/** Troposphere, tropopause and what changes with height inside them. */
export function WxAtmosphereColumn(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  const labels = bool(p.labels, true);
  const on = (id: string) => highlight === "none" || highlight === id;

  const ground = 254;
  const tropopause = 92;
  const top = 44;

  return (
    <Diagram title="The troposphere">
      {/* Stratosphere above */}
      <g opacity={on("stratosphere") ? 1 : 0.28}>
        <rect x={70} y={top} width={330} height={tropopause - top} fill="color-mix(in srgb, var(--color-ink-700) 10%, transparent)" />
        {labels && (
          <text x={86} y={top + 22} fontSize={10.5} fontWeight={750} fill={MUTED}>
            Stratosphere
          </text>
        )}
      </g>

      {/* Tropopause — the isothermal transition */}
      <g opacity={on("tropopause") ? 1 : 0.28}>
        <rect x={70} y={tropopause} width={330} height={22} fill="color-mix(in srgb, var(--color-brand) 22%, transparent)" />
        <line x1={70} y1={tropopause} x2={400} y2={tropopause} stroke={BRAND} strokeWidth={2} strokeDasharray="7 4" />
        <line x1={70} y1={tropopause + 22} x2={400} y2={tropopause + 22} stroke={BRAND} strokeWidth={2} strokeDasharray="7 4" />
        {labels && (
          <>
            <text x={86} y={tropopause + 15} fontSize={10.5} fontWeight={800} fill={BRAND}>
              TROPOPAUSE — isothermal
            </text>
            <text x={406} y={tropopause + 6} fontSize={9.5} fontWeight={700} fill={MUTED}>
              28k–55k MSL
            </text>
            <text x={406} y={tropopause + 20} fontSize={9.5} fontWeight={700} fill={MUTED}>
              ~36k over the US
            </text>
          </>
        )}
      </g>

      {/* Troposphere */}
      <g opacity={on("troposphere") ? 1 : 0.28}>
        <rect
          x={70}
          y={tropopause + 22}
          width={330}
          height={ground - tropopause - 22}
          fill="color-mix(in srgb, var(--color-brand) 9%, transparent)"
        />
        {/* Moisture stipple — this is the layer that holds water */}
        {Array.from({ length: 26 }, (_, i) => (
          <circle
            key={i}
            cx={84 + ((i * 47) % 300)}
            cy={tropopause + 40 + ((i * 31) % 96)}
            r={2.2}
            fill={BRAND}
            opacity={0.3}
          />
        ))}
        {labels && (
          <>
            <text x={86} y={tropopause + 46} fontSize={11.5} fontWeight={800} fill={BRAND}>
              TROPOSPHERE
            </text>
            <text x={86} y={tropopause + 63} fontSize={9.5} fontWeight={650} fill={MUTED}>
              0–5% water vapour · nearly all weather
            </text>
          </>
        )}
      </g>

      {/* Trend arrows up the right-hand side */}
      {labels && (
        <g>
          <line x1={434} y1={ground - 10} x2={434} y2={tropopause + 34} stroke={NOGO} strokeWidth={1.8} />
          <path d="M430 138 L434 130 L438 138" fill="none" stroke={NOGO} strokeWidth={1.8} strokeLinecap="round" />
          <text x={444} y={176} fontSize={9.5} fontWeight={750} fill={NOGO}>
            temp ↓
          </text>
          <text x={444} y={190} fontSize={9.5} fontWeight={750} fill={CAUTION}>
            wind ↑
          </text>
        </g>
      )}

      {/* Ground */}
      <line x1={40} y1={ground} x2={460} y2={ground} stroke={NAVY} strokeWidth={2.6} />
      {labels && (
        <text x={40} y={272} fontSize={9.5} fontWeight={700} fill={MUTED}>
          surface · 29.92 inHg · 15 °C standard
        </text>
      )}
    </Diagram>
  );
}

/** Temperature and pressure against altitude, at the standard lapse rates. */
export function LapseRates(p: DiagramProps) {
  const altitude = Math.max(0, Math.min(20000, num(p.altitude, 0)));
  const show = str<"both" | "temperature" | "pressure">(p.show, "both");

  const top = 52;
  const ground = 244;
  const y = (alt: number) => ground - (alt / 20000) * (ground - top);

  const temp = 15 - (altitude / 1000) * 2;
  const press = 29.92 - altitude / 1000;

  return (
    <Diagram title="Standard lapse rates">
      {/* Axis */}
      <line x1={112} y1={top} x2={112} y2={ground} stroke={NAVY} strokeWidth={2} />
      <line x1={112} y1={ground} x2={452} y2={ground} stroke={NAVY} strokeWidth={2} />
      {[0, 5000, 10000, 15000, 20000].map((a) => (
        <g key={a}>
          <line x1={107} y1={y(a)} x2={112} y2={y(a)} stroke={MUTED} strokeWidth={1.4} />
          <text x={101} y={y(a) + 4} textAnchor="end" fontSize={9} fontWeight={700} fill={MUTED}>
            {a / 1000}k
          </text>
        </g>
      ))}

      {/* Temperature line: 2 C per 1,000 ft */}
      {(show === "both" || show === "temperature") && (
        <>
          <line x1={392} y1={y(0)} x2={168} y2={y(20000)} stroke={NOGO} strokeWidth={2.6} />
          <text x={398} y={y(0) - 8} fontSize={10} fontWeight={800} fill={NOGO}>
            temperature
          </text>
          <text x={398} y={y(0) + 6} fontSize={9} fontWeight={650} fill={MUTED}>
            2 °C / 1,000 ft
          </text>
        </>
      )}

      {/* Pressure line: 1 inHg per 1,000 ft */}
      {(show === "both" || show === "pressure") && (
        <>
          <line x1={352} y1={y(0)} x2={140} y2={y(20000)} stroke={BRAND} strokeWidth={2.6} strokeDasharray="7 4" />
          <text x={132} y={y(20000) - 10} fontSize={10} fontWeight={800} fill={BRAND}>
            pressure
          </text>
          <text x={132} y={y(20000) + 3} fontSize={9} fontWeight={650} fill={MUTED}>
            1 inHg / 1,000 ft
          </text>
        </>
      )}

      {/* Read-off at the chosen altitude */}
      <line x1={112} y1={y(altitude)} x2={452} y2={y(altitude)} stroke={MUTED} strokeWidth={1.3} strokeDasharray="4 4" />
      <circle cx={112} cy={y(altitude)} r={4.5} fill={NAVY} />
      <g transform={`translate(198 ${Math.min(y(altitude) + 4, ground - 8)})`}>
        <rect x={0} y={-17} width={200} height={24} rx={7} fill="var(--color-surface)" stroke={MUTED} strokeWidth={1.2} />
        <text x={10} y={0} fontSize={10.5} fontWeight={800} fill={NOGO}>
          {temp.toFixed(0)} °C
        </text>
        <text x={72} y={0} fontSize={10.5} fontWeight={800} fill={BRAND}>
          {press.toFixed(2)} inHg
        </text>
        <text x={158} y={0} fontSize={9.5} fontWeight={700} fill={MUTED}>
          {(altitude / 1000).toFixed(0)}k ft
        </text>
      </g>

      <text x={282} y={276} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        Two variables, two lapse rates, two units
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w2 — altitude and the altimeter                                     */
/* ------------------------------------------------------------------ */

/** The five altitudes, measured from four different references. */
export function AltitudeTypes(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  const labels = bool(p.labels, true);
  const on = (id: string) => highlight === "none" || highlight === id;

  const acY = 88;
  const seaY = 236;
  const terrainY = 186;
  const sdpY = 214;

  const measure = (id: string, x: number, y2: number, label: string, tone: string) => (
    <g opacity={on(id) ? 1 : 0.22}>
      <line x1={x} y1={acY} x2={x} y2={y2} stroke={tone} strokeWidth={2.2} />
      <line x1={x - 5} y1={acY} x2={x + 5} y2={acY} stroke={tone} strokeWidth={2.2} />
      <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} stroke={tone} strokeWidth={2.2} />
      {labels && (
        <text
          x={x + 9}
          y={(acY + y2) / 2 + 4}
          fontSize={9.8}
          fontWeight={800}
          fill={tone}
        >
          {label}
        </text>
      )}
    </g>
  );

  return (
    <Diagram title="Types of altitude">
      {/* Aircraft */}
      <g transform="translate(96 88)">
        <path d="M-18 0 L14 0 M0 -9 L0 9 M11 -5 L11 5" stroke={NAVY} strokeWidth={3} strokeLinecap="round" />
      </g>

      {/* Terrain */}
      <path d="M40 236 L150 236 L210 186 L300 186 L360 236 L460 236" fill="none" stroke={NAVY} strokeWidth={2.4} />
      <path d="M40 236 L150 236 L210 186 L300 186 L360 236 L460 236 L460 262 L40 262 Z" fill="var(--color-surface-3)" opacity={0.7} />

      {/* Sea level */}
      <line x1={40} y1={seaY} x2={460} y2={seaY} stroke={BRAND} strokeWidth={1.8} strokeDasharray="6 4" />
      <text x={462} y={seaY + 4} textAnchor="end" fontSize={9} fontWeight={750} fill={BRAND} opacity={0.001}>
        .
      </text>

      {/* Standard datum plane */}
      <line x1={40} y1={sdpY} x2={460} y2={sdpY} stroke={CAUTION} strokeWidth={1.6} strokeDasharray="3 4" />

      {measure("true", 150, seaY, "TRUE — MSL", BRAND)}
      {measure("absolute", 252, terrainY, "ABSOLUTE — AGL", GO)}
      {measure("pressure", 372, sdpY, "PRESSURE — from 29.92", CAUTION)}

{labels && (
        <>
          <text x={44} y={62} fontSize={10} fontWeight={800} fill={NAVY}>
            INDICATED: what the altimeter reads, trying to be true
          </text>
          <text x={44} y={280} fontSize={9.5} fontWeight={700} fill={MUTED}>
            DENSITY: not a height — the altitude the aircraft is performing at
          </text>
          <text x={210} y={252} fontSize={9} fontWeight={750} fill={MUTED}>
            terrain
          </text>
          <text x={44} y={232} fontSize={9} fontWeight={750} fill={BRAND}>
            sea level
          </text>
          <text x={44} y={210} fontSize={9} fontWeight={750} fill={CAUTION}>
            standard datum plane
          </text>
        </>
      )}
    </Diagram>
  );
}

/** Why a cold day puts the aircraft lower than the altimeter claims. */
export function AltimeterError(p: DiagramProps) {
  const condition = str<"standard" | "cold" | "hot">(p.condition, "standard");

  // Indicated stays where the pilot set it; TRUE height moves with temperature.
  const cfg = {
    standard: { trueY: 118, text: "Indicated equals true", tone: GO, note: "Standard day — no error" },
    cold: { trueY: 158, text: "Indicates HIGHER than true", tone: NOGO, note: "You are LOWER than it says" },
    hot: { trueY: 82, text: "Indicates LOWER than true", tone: CAUTION, note: "You are higher than it says" },
  }[condition];

  return (
    <Diagram title="Temperature error on the altimeter">
      <text x={250} y={38} textAnchor="middle" fontSize={11} fontWeight={800} fill={cfg.tone}>
        {cfg.text}
      </text>

      {/* Indicated altitude — fixed reference */}
      <line x1={60} y1={118} x2={440} y2={118} stroke={MUTED} strokeWidth={1.8} strokeDasharray="6 4" />
      <text x={60} y={112} fontSize={9.5} fontWeight={750} fill={MUTED}>
        INDICATED — what the needle says
      </text>

      {/* Actual aircraft position */}
      <g transform={`translate(250 ${cfg.trueY})`}>
        <path d="M-20 0 L16 0 M0 -10 L0 10 M12 -6 L12 6" stroke={cfg.tone} strokeWidth={3.2} strokeLinecap="round" />
      </g>
      <line x1={60} y1={cfg.trueY} x2={440} y2={cfg.trueY} stroke={cfg.tone} strokeWidth={2} />
      <text x={444} y={cfg.trueY + 4} textAnchor="end" fontSize={9.5} fontWeight={800} fill={cfg.tone} opacity={0.001}>
        .
      </text>
      <text x={60} y={cfg.trueY - 8} fontSize={9.5} fontWeight={800} fill={cfg.tone}>
        TRUE — where you actually are
      </text>

      {/* Gap callout */}
      {condition !== "standard" && (
        <g>
          <line x1={396} y1={118} x2={396} y2={cfg.trueY} stroke={cfg.tone} strokeWidth={1.6} />
          <text x={402} y={(118 + cfg.trueY) / 2 + 4} fontSize={9.5} fontWeight={800} fill={cfg.tone}>
            error
          </text>
        </g>
      )}

      {/* Terrain */}
      <path d="M40 236 L170 236 L230 208 L300 208 L350 236 L460 236 L460 262 L40 262 Z" fill="var(--color-surface-3)" stroke={NAVY} strokeWidth={2} />

      <text x={250} y={284} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={cfg.tone}>
        {cfg.note}
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w3 — moisture and stability                                         */
/* ------------------------------------------------------------------ */

/** Temperature and dew point closing on each other. */
export function DewPointSpread(p: DiagramProps) {
  const spread = Math.max(0, Math.min(20, num(p.spread, 10)));
  const temp = 20;
  const dew = temp - spread;

  const top = 60;
  const bottom = 224;
  const y = (t: number) => bottom - ((t + 5) / 30) * (bottom - top);

  const saturated = spread <= 0.5;

  return (
    <Diagram title="Temperature and dew point">
      <line x1={100} y1={top} x2={100} y2={bottom} stroke={NAVY} strokeWidth={2} />
      {[-5, 5, 15, 25].map((t) => (
        <g key={t}>
          <line x1={95} y1={y(t)} x2={100} y2={y(t)} stroke={MUTED} strokeWidth={1.3} />
          <text x={90} y={y(t) + 4} textAnchor="end" fontSize={9} fontWeight={700} fill={MUTED}>
            {t}°
          </text>
        </g>
      ))}

      {/* Temperature */}
      <line x1={100} y1={y(temp)} x2={400} y2={y(temp)} stroke={NOGO} strokeWidth={3} />
      <text x={408} y={y(temp) + 4} fontSize={10} fontWeight={800} fill={NOGO}>
        temp
      </text>

      {/* Dew point */}
      <line x1={100} y1={y(dew)} x2={400} y2={y(dew)} stroke={BRAND} strokeWidth={3} />
      <text x={408} y={y(dew) + 4} fontSize={10} fontWeight={800} fill={BRAND}>
        dew pt
      </text>

      {/* The spread itself */}
      <line x1={250} y1={y(temp)} x2={250} y2={y(dew)} stroke={MUTED} strokeWidth={1.8} />
      <rect x={196} y={(y(temp) + y(dew)) / 2 - 12} width={108} height={24} rx={7} fill="var(--color-surface)" stroke={MUTED} strokeWidth={1.2} />
      <text x={250} y={(y(temp) + y(dew)) / 2 + 4} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={NAVY}>
        spread {spread.toFixed(0)} °C
      </text>

      {/* Condensation appears as the spread closes */}
      {spread < 6 && (
        <g opacity={Math.min(1, (6 - spread) / 5)}>
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={130 + i * 30} cy={y(dew) - 16 - (i % 3) * 7} r={5 + (i % 3)} fill={BRAND} opacity={0.42} />
          ))}
        </g>
      )}

      <text x={250} y={254} textAnchor="middle" fontSize={11} fontWeight={800} fill={saturated ? BRAND : MUTED}>
        {saturated ? "SATURATED — condensation" : "Smaller spread → more moisture condenses"}
      </text>
      <text x={250} y={276} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        Relative humidity is the same idea as a percentage
      </text>
    </Diagram>
  );
}

/** A parcel against its environment: stable, unstable or neutral. */
export function AirStability(p: DiagramProps) {
  const state = str<"stable" | "unstable" | "neutral">(p.state, "stable");

  const cfg = {
    stable: { label: "STABLE", cause: "Parcel COLDER than the surrounding air", result: "It sinks back. Air resists rising.", tone: BRAND, dy: 42 },
    unstable: { label: "UNSTABLE", cause: "Parcel HOTTER than the surrounding air", result: "It keeps rising. Air wants to lift.", tone: NOGO, dy: -46 },
    neutral: { label: "NEUTRAL", cause: "Parcel the SAME temperature", result: "It stays where you put it.", tone: MUTED, dy: 0 },
  }[state];

  return (
    <Diagram title="Air stability">
      {/* Environment column */}
      <rect x={150} y={54} width={200} height={168} rx={10} fill="color-mix(in srgb, var(--color-brand) 7%, transparent)" stroke={MUTED} strokeWidth={1.3} strokeDasharray="5 4" />
      <text x={250} y={44} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
        surrounding air
      </text>

      {/* Parcel */}
      <g transform={`translate(250 ${138 + cfg.dy})`}>
        <circle r={30} fill={`color-mix(in srgb, ${cfg.tone} 22%, transparent)`} stroke={cfg.tone} strokeWidth={2.4} />
        <text y={5} textAnchor="middle" fontSize={11} fontWeight={800} fill={cfg.tone}>
          parcel
        </text>
      </g>

      {/* Motion arrow */}
      {state !== "neutral" && (
        <g stroke={cfg.tone} strokeWidth={2.6} strokeLinecap="round" fill="none">
          {state === "unstable" ? (
            <>
              <line x1={250} y1={126} x2={250} y2={72} />
              <path d="M242 82 L250 70 L258 82" />
            </>
          ) : (
            <>
              <line x1={250} y1={150} x2={250} y2={206} />
              <path d="M242 196 L250 208 L258 196" />
            </>
          )}
        </g>
      )}

      <text x={250} y={246} textAnchor="middle" fontSize={13} fontWeight={800} fill={cfg.tone}>
        {cfg.label}
      </text>
      <text x={250} y={266} textAnchor="middle" fontSize={10} fontWeight={700} fill={NAVY}>
        {cfg.cause}
      </text>
      <text x={250} y={284} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
        {cfg.result}
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w4 — wind                                                           */
/* ------------------------------------------------------------------ */

/** A pressure field with isobars, and the wind that results. */
export function PressureField(p: DiagramProps) {
  const level = str<"gradient" | "surface" | "both">(p.level, "both");
  const labels = bool(p.labels, true);

  // Concentric isobars around a low on the left and a high on the right.
  const centre = (cx: number, cy: number, kind: "L" | "H", tone: string) => (
    <g>
      {[26, 46, 66].map((r) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={tone} strokeWidth={1.5} opacity={0.55} />
      ))}
      <circle cx={cx} cy={cy} r={17} fill={`color-mix(in srgb, ${tone} 18%, transparent)`} stroke={tone} strokeWidth={2.2} />
      <text x={cx} y={cy + 7} textAnchor="middle" fontSize={17} fontWeight={800} fill={tone}>
        {kind}
      </text>
    </g>
  );

  // Circulation arrows: counter-clockwise into a low, clockwise out of a high.
  const swirl = (cx: number, cy: number, ccw: boolean, tone: string, inset: number, dash: boolean) =>
    [0, 1, 2, 3].map((i) => {
      const a = (i / 4) * Math.PI * 2 + (ccw ? 0.4 : -0.4);
      const r = inset;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const t = a + (ccw ? Math.PI / 2 : -Math.PI / 2);
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(t * 180) / Math.PI})`}>
          <line x1={-11} y1={0} x2={11} y2={0} stroke={tone} strokeWidth={2.2} strokeLinecap="round" strokeDasharray={dash ? "4 3" : undefined} />
          <path d="M6 -5 L12 0 L6 5" fill="none" stroke={tone} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    });

  return (
    <Diagram title="Pressure systems and wind">
      {centre(140, 148, "L", NOGO)}
      {centre(360, 148, "H", BRAND)}

      {(level === "gradient" || level === "both") && (
        <>
          {swirl(140, 148, true, NOGO, 46, false)}
          {swirl(360, 148, false, BRAND, 46, false)}
        </>
      )}
      {(level === "surface" || level === "both") && (
        <>
          {swirl(140, 148, true, CAUTION, 66, true)}
          {swirl(360, 148, false, CAUTION, 66, true)}
        </>
      )}

      {labels && (
        <>
          <text x={140} y={238} textAnchor="middle" fontSize={10} fontWeight={800} fill={NOGO}>
            counter-clockwise
          </text>
          <text x={360} y={238} textAnchor="middle" fontSize={10} fontWeight={800} fill={BRAND}>
            clockwise
          </text>
          <text x={250} y={44} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
            isobars · the gradient is measured PERPENDICULAR to them
          </text>
          {level === "both" && (
            <>
              <text x={250} y={266} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
                solid: gradient wind, above 2,000 ft AGL, parallel to isobars
              </text>
              <text x={250} y={282} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={CAUTION}>
                dashed: surface wind, below 2,000 ft AGL, deflected by friction
              </text>
            </>
          )}
          {level === "gradient" && (
            <text x={250} y={274} textAnchor="middle" fontSize={10} fontWeight={750} fill={MUTED}>
              Gradient wind — above 2,000 ft AGL, parallel to the isobars
            </text>
          )}
          {level === "surface" && (
            <text x={250} y={274} textAnchor="middle" fontSize={10} fontWeight={750} fill={CAUTION}>
              Surface wind — below 2,000 ft AGL, friction turns it across the isobars
            </text>
          )}
        </>
      )}
    </Diagram>
  );
}

/** Buys Ballot's Law, from the pilot's point of view. */
export function BuysBallot() {
  return (
    <Diagram title="Buys Ballot's Law">
      <text x={250} y={44} textAnchor="middle" fontSize={11} fontWeight={800} fill={NAVY}>
        Stand with the wind at your BACK
      </text>

      {/* Wind arriving from behind */}
      {[126, 150, 174].map((y, i) => (
        <g key={y}>
          <line x1={150} y1={y} x2={222} y2={y} stroke={MUTED} strokeWidth={2.2} strokeLinecap="round" />
          <path d="M216 -6 L224 0 L216 6" transform={`translate(0 ${y})`} fill="none" stroke={MUTED} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          <text x={140} y={y + 4} textAnchor="end" fontSize={9} fontWeight={700} fill={MUTED} opacity={i === 1 ? 1 : 0}>
            wind
          </text>
        </g>
      ))}

      {/* Figure, facing right */}
      <g transform="translate(250 150)">
        <circle cx={0} cy={-26} r={13} fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.2} />
        <path d="M0 -13 L0 22 M0 -4 L-16 10 M0 -4 L16 10 M0 22 L-11 46 M0 22 L11 46" stroke={NAVY} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      </g>

      {/* Low to the left */}
      <g>
        <circle cx={90} cy={150} r={24} fill="color-mix(in srgb, var(--color-nogo) 15%, transparent)" stroke={NOGO} strokeWidth={2.4} />
        <text x={90} y={158} textAnchor="middle" fontSize={20} fontWeight={800} fill={NOGO}>
          L
        </text>
        <text x={90} y={192} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={NOGO}>
          LEFT
        </text>
      </g>

      {/* High to the right */}
      <g>
        <circle cx={410} cy={150} r={24} fill="color-mix(in srgb, var(--color-brand) 15%, transparent)" stroke={BRAND} strokeWidth={2.4} />
        <text x={410} y={158} textAnchor="middle" fontSize={20} fontWeight={800} fill={BRAND}>
          H
        </text>
        <text x={410} y={192} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={BRAND}>
          RIGHT
        </text>
      </g>

      <text x={250} y={252} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={NAVY}>
        Low to the left. High to the right.
      </text>
      <text x={250} y={274} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        One glance at the windsock locates the pressure systems
      </text>
    </Diagram>
  );
}

/** Sea breeze by day, land breeze by night. */
export function SeaLandBreeze(p: DiagramProps) {
  const phase = str<"day" | "night">(p.phase, "day");
  const day = phase === "day";

  const ground = 218;

  return (
    <Diagram title={day ? "Sea breeze" : "Land breeze"}>
      {/* Sea on the left, land on the right */}
      <rect x={40} y={ground} width={200} height={44} fill="color-mix(in srgb, var(--color-brand) 26%, transparent)" />
      <path d="M240 218 L460 218 L460 262 L240 262 Z" fill="var(--color-surface-3)" />
      <line x1={40} y1={ground} x2={460} y2={ground} stroke={NAVY} strokeWidth={2.2} />
      <text x={140} y={250} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={BRAND}>
        SEA {day ? "cool" : "warm"}
      </text>
      <text x={350} y={250} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={day ? NOGO : MUTED}>
        LAND {day ? "warm" : "cool"}
      </text>

      {/* Circulation cell — the direction flips with the phase */}
      <g stroke={day ? NOGO : BRAND} strokeWidth={2.6} fill="none" strokeLinecap="round">
        {day ? (
          <>
            {/* rising over land, out to sea aloft, back in at the surface */}
            <path d="M350 210 L350 108" />
            <path d="M342 120 L350 104 L358 120" />
            <path d="M350 104 L150 104" />
            <path d="M162 96 L146 104 L162 112" />
            <path d="M150 104 L150 196" />
            <path d="M142 184 L150 200 L158 184" />
            <path d="M150 200 L340 200" />
            <path d="M328 192 L344 200 L328 208" />
          </>
        ) : (
          <>
            {/* rising over sea, back over land aloft, out from land at the surface */}
            <path d="M150 210 L150 108" />
            <path d="M142 120 L150 104 L158 120" />
            <path d="M150 104 L350 104" />
            <path d="M338 96 L354 104 L338 112" />
            <path d="M350 104 L350 196" />
            <path d="M342 184 L350 200 L358 184" />
            <path d="M350 200 L160 200" />
            <path d="M172 192 L156 200 L172 208" />
          </>
        )}
      </g>

      <text x={250} y={54} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={day ? NOGO : BRAND}>
        {day ? "DAY — sea breeze" : "NIGHT — land breeze"}
      </text>
      <text x={250} y={74} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        {day
          ? "Warm land air rises; cool dense sea air moves in beneath it · 15–20 kt"
          : "Land cools faster than sea, so the whole cycle flips"}
      </text>
      <text x={250} y={288} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
        Named for where the surface air comes FROM
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w5 — clouds and lifting                                             */
/* ------------------------------------------------------------------ */

/** The four cloud groups, stacked by the altitude that defines them. */
export function CloudGroups(p: DiagramProps) {
  const group = str(p.group, "none");
  const on = (id: string) => group === "none" || group === id;

  const ground = 252;

  const puff = (cx: number, cy: number, w: number, tone: string, o: number) => (
    <g opacity={o}>
      <ellipse cx={cx} cy={cy} rx={w} ry={w * 0.42} fill={tone} />
      <ellipse cx={cx - w * 0.42} cy={cy + 2} rx={w * 0.5} ry={w * 0.34} fill={tone} />
      <ellipse cx={cx + w * 0.44} cy={cy + 2} rx={w * 0.46} ry={w * 0.32} fill={tone} />
    </g>
  );

  return (
    <Diagram title="Cloud groups by altitude">
      {/* Band guides */}
      {[
        { id: "high", y: 74, label: "HIGH" },
        { id: "middle", y: 136, label: "MIDDLE" },
        { id: "low", y: 198, label: "LOW" },
      ].map((b) => (
        <g key={b.id} opacity={on(b.id) ? 1 : 0.22}>
          <line x1={92} y1={b.y + 24} x2={330} y2={b.y + 24} stroke={MUTED} strokeWidth={1} strokeDasharray="4 5" />
          <text x={84} y={b.y + 28} textAnchor="end" fontSize={9.5} fontWeight={800} fill={MUTED}>
            {b.label}
          </text>
        </g>
      ))}

      <g opacity={on("high") ? 1 : 0.22}>
        {puff(150, 82, 26, BRAND, 0.4)}
        {puff(250, 76, 20, BRAND, 0.34)}
      </g>
      <g opacity={on("middle") ? 1 : 0.22}>
        {puff(160, 142, 32, BRAND, 0.55)}
        {puff(268, 148, 26, BRAND, 0.5)}
      </g>
      <g opacity={on("low") ? 1 : 0.22}>
        {puff(150, 206, 36, BRAND, 0.72)}
        {puff(256, 210, 30, BRAND, 0.66)}
      </g>

      {/* Special: cumulonimbus spans everything */}
      <g opacity={on("special") ? 1 : 0.22}>
        <path
          d="M348 226 C338 200 344 168 358 152 C356 122 372 100 392 100 C412 96 430 112 428 134 L446 62 L364 62 L352 92 C338 118 336 200 348 226 Z"
          fill="color-mix(in srgb, var(--color-navy) 22%, transparent)"
          stroke={NAVY}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M356 58 L452 58 L446 44 L362 44 Z" fill="color-mix(in srgb, var(--color-navy) 30%, transparent)" stroke={NAVY} strokeWidth={1.6} />
        <text x={404} y={244} textAnchor="middle" fontSize={9.8} fontWeight={800} fill={NAVY}>
          SPECIAL
        </text>
        <text x={404} y={258} textAnchor="middle" fontSize={8.8} fontWeight={700} fill={MUTED}>
          CB: low base, high tops
        </text>
      </g>

      <line x1={40} y1={ground} x2={460} y2={ground} stroke={NAVY} strokeWidth={2.6} />
      <text x={40} y={276} fontSize={9.5} fontWeight={700} fill={MUTED}>
        A cloud is defined by the altitude group it sits in
      </text>
    </Diagram>
  );
}

/** Four ways to lift air. */
export function LiftingMethods(p: DiagramProps) {
  const method = str(p.method, "none");
  const on = (id: string) => method === "none" || method === id;

  const cell = (
    id: string,
    x: number,
    y: number,
    title: string,
    tone: string,
    art: React.ReactNode,
  ) => (
    <g opacity={on(id) ? 1 : 0.24}>
      <rect x={x} y={y} width={196} height={98} rx={11} fill="var(--color-surface-2)" stroke={method === id ? tone : MUTED} strokeWidth={method === id ? 2.4 : 1.3} />
      <text x={x + 12} y={y + 20} fontSize={10.5} fontWeight={800} fill={tone}>
        {title}
      </text>
      <g transform={`translate(${x} ${y})`}>{art}</g>
    </g>
  );

  const up = (x: number, tone: string) => (
    <g stroke={tone} strokeWidth={2.2} fill="none" strokeLinecap="round">
      <line x1={x} y1={82} x2={x} y2={40} />
      <path d={`M${x - 6} 50 L${x} 36 L${x + 6} 50`} />
    </g>
  );

  return (
    <Diagram title="The four lifting methods">
      {cell("frontal", 40, 44, "FRONTAL", NOGO, (
        <>
          <path d="M14 84 L120 44" stroke={NOGO} strokeWidth={2.2} fill="none" />
          <path d="M14 84 L120 84" stroke={MUTED} strokeWidth={1.6} />
          {up(150, NOGO)}
        </>
      ))}
      {cell("orographic", 262, 44, "OROGRAPHIC", CAUTION, (
        <>
          <path d="M14 86 L62 42 L110 86" stroke={CAUTION} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
          {up(150, CAUTION)}
        </>
      ))}
      {cell("convergence", 40, 158, "CONVERGENCE", BRAND, (
        <>
          <path d="M12 78 L54 78 M48 72 L58 78 L48 84" stroke={BRAND} strokeWidth={2.1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M112 78 L70 78 M76 72 L66 78 L76 84" stroke={BRAND} strokeWidth={2.1} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {up(150, BRAND)}
        </>
      ))}
      {cell("thermal", 262, 158, "THERMAL", GO, (
        <>
          <line x1={14} y1={86} x2={110} y2={86} stroke={GO} strokeWidth={2.4} />
          {[30, 58, 86].map((x) => (
            <path key={x} d={`M${x} 82 C${x - 5} 70 ${x + 5} 64 ${x} 54`} stroke={GO} strokeWidth={1.7} fill="none" strokeLinecap="round" />
          ))}
          {up(150, GO)}
        </>
      ))}

      <text x={250} y={30} textAnchor="middle" fontSize={9.8} fontWeight={800} fill={MUTED}>
        AIR MUST BE LIFTED BEFORE IT CAN COOL TO SATURATION
      </text>
      <text x={250} y={288} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
        Frontal · Orographic · Convergence · Thermal
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w6 — fronts                                                         */
/* ------------------------------------------------------------------ */

/** A front in vertical cross-section, with the weather it builds. */
export function FrontCrossSection(p: DiagramProps) {
  const kind = str<"cold" | "warm" | "stationary" | "occluded">(p.kind, "cold");
  const labels = bool(p.labels, true);

  const ground = 234;

  const cfg = {
    cold: {
      tone: BRAND,
      title: "COLD FRONT",
      caption: "Cold air undercuts the warm and forces it up — steeply",
      weather: "Unstable · cumuliform · showery precipitation",
    },
    warm: {
      tone: NOGO,
      title: "WARM FRONT",
      caption: "Warm air overtakes the cold and rides up over it — gently",
      weather: "Stable · stratiform · continuous precipitation · little to no turbulence",
    },
    stationary: {
      tone: CAUTION,
      title: "STATIONARY FRONT",
      caption: "Neither air mass is strong enough to move the other",
      weather: "Similar to a warm front, often less intense",
    },
    occluded: {
      tone: HAZARD,
      title: "OCCLUDED FRONT",
      caption: "A cold front overtakes a warm front and lifts it clear of the ground",
      weather: "Weather of BOTH fronts · wind shifts 180°, SE to NW",
    },
  }[kind];

  return (
    <Diagram title={cfg.title}>
      {/* Ground */}
      <line x1={30} y1={ground} x2={470} y2={ground} stroke={NAVY} strokeWidth={2.6} />

      {kind === "cold" && (
        <>
          <path d="M30 234 L30 120 L200 234 Z" fill="color-mix(in srgb, var(--color-brand) 20%, transparent)" stroke={BRAND} strokeWidth={2.2} />
          {/* Steep lifting and a towering cloud */}
          <path d="M186 226 L206 118" stroke={NOGO} strokeWidth={2.2} strokeLinecap="round" />
          <path d="M198 132 L208 112 L216 134" fill="none" stroke={NOGO} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M214 210 C204 176 214 132 234 118 C246 92 286 92 292 120 C316 116 324 152 306 158 L306 210 Z"
            fill="color-mix(in srgb, var(--color-navy) 20%, transparent)"
            stroke={NAVY}
            strokeWidth={1.8}
            strokeLinejoin="round"
          />
          {[236, 258, 280].map((x) => (
            <line key={x} x1={x} y1={212} x2={x - 6} y2={232} stroke={BRAND} strokeWidth={2} strokeLinecap="round" />
          ))}
          {labels && (
            <>
              <text x={62} y={198} fontSize={10} fontWeight={800} fill={BRAND}>
                COLD
              </text>
              <text x={370} y={198} fontSize={10} fontWeight={800} fill={NOGO}>
                WARM
              </text>
            </>
          )}
        </>
      )}

      {kind === "warm" && (
        <>
          <path d="M30 234 L250 234 L470 152 L470 234 Z" fill="color-mix(in srgb, var(--color-brand) 16%, transparent)" stroke={BRAND} strokeWidth={2} opacity={0.001} />
          <path d="M30 234 L30 190 L330 234 Z" fill="color-mix(in srgb, var(--color-brand) 18%, transparent)" stroke={BRAND} strokeWidth={2.2} />
          {/* Shallow slope, layered cloud */}
          {[
            { x: 150, y: 176, w: 40 },
            { x: 216, y: 158, w: 46 },
            { x: 288, y: 142, w: 42 },
            { x: 356, y: 130, w: 36 },
          ].map((c) => (
            <ellipse key={c.x} cx={c.x} cy={c.y} rx={c.w} ry={11} fill="color-mix(in srgb, var(--color-navy) 16%, transparent)" stroke={MUTED} strokeWidth={1.2} />
          ))}
          {[140, 170, 200, 230, 260].map((x) => (
            <line key={x} x1={x} y1={190} x2={x} y2={228} stroke={BRAND} strokeWidth={1.4} strokeDasharray="3 4" />
          ))}
          {labels && (
            <>
              <text x={56} y={222} fontSize={10} fontWeight={800} fill={BRAND}>
                COLD
              </text>
              <text x={392} y={196} fontSize={10} fontWeight={800} fill={NOGO}>
                WARM overtaking
              </text>
            </>
          )}
        </>
      )}

      {kind === "stationary" && (
        <>
          <path d="M30 234 L30 148 L250 234 Z" fill="color-mix(in srgb, var(--color-brand) 18%, transparent)" stroke={BRAND} strokeWidth={2.2} />
          <path d="M470 234 L470 148 L250 234 Z" fill="color-mix(in srgb, var(--color-nogo) 14%, transparent)" stroke={NOGO} strokeWidth={2.2} />
          {/* Opposing arrows that cancel */}
          <g stroke={MUTED} strokeWidth={2.2} fill="none" strokeLinecap="round">
            <path d="M180 130 L228 130 M220 124 L230 130 L220 136" />
            <path d="M320 130 L272 130 M280 124 L270 130 L280 136" />
          </g>
          <text x={250} y={112} textAnchor="middle" fontSize={10} fontWeight={800} fill={MUTED}>
            neither one wins
          </text>
          {labels && (
            <>
              <text x={62} y={214} fontSize={10} fontWeight={800} fill={BRAND}>
                COLD
              </text>
              <text x={404} y={214} fontSize={10} fontWeight={800} fill={NOGO}>
                WARM
              </text>
            </>
          )}
        </>
      )}

      {kind === "occluded" && (
        <>
          <path d="M30 234 L30 130 L188 234 Z" fill="color-mix(in srgb, var(--color-brand) 22%, transparent)" stroke={BRAND} strokeWidth={2.2} />
          <path d="M470 234 L470 168 L320 234 Z" fill="color-mix(in srgb, var(--color-brand) 12%, transparent)" stroke={BRAND} strokeWidth={1.8} />
          {/* The warm air lifted clear of the surface */}
          <path
            d="M188 234 L206 128 C232 96 300 96 322 132 L320 234 Z"
            fill="color-mix(in srgb, var(--color-nogo) 13%, transparent)"
            stroke={NOGO}
            strokeWidth={2}
            strokeDasharray="6 4"
          />
          <text x={256} y={150} textAnchor="middle" fontSize={10} fontWeight={800} fill={NOGO}>
            WARM, lifted clear
          </text>
          <text x={256} y={166} textAnchor="middle" fontSize={9} fontWeight={700} fill={MUTED}>
            no longer touching the ground
          </text>
          {labels && (
            <>
              <text x={56} y={212} fontSize={10} fontWeight={800} fill={BRAND}>
                COLD
              </text>
              <text x={402} y={212} fontSize={10} fontWeight={800} fill={BRAND}>
                COOL
              </text>
            </>
          )}
        </>
      )}

      {labels && (
        <>
          <text x={250} y={38} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={cfg.tone}>
            {cfg.title}
          </text>
          <text x={250} y={56} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
            {cfg.caption}
          </text>
          <text x={250} y={264} textAnchor="middle" fontSize={10} fontWeight={800} fill={cfg.tone}>
            {cfg.weather}
          </text>
        </>
      )}
    </Diagram>
  );
}

/** The map symbols, since a front is also something you read off a chart. */
export function FrontSymbols(p: DiagramProps) {
  const kind = str(p.kind, "none");
  const labels = bool(p.labels, true);
  const on = (id: string) => kind === "none" || kind === id;

  const row = (id: string, y: number, label: string, tone: string, art: React.ReactNode) => (
    <g opacity={on(id) ? 1 : 0.24}>
      {labels && (
        <text x={44} y={y + 5} fontSize={10.5} fontWeight={800} fill={tone}>
          {label}
        </text>
      )}
      <g transform={`translate(174 ${y})`}>{art}</g>
    </g>
  );

  const tri = (x: number, tone: string, flip = false) => (
    <path d={flip ? `M${x} 0 L${x + 9} 9 L${x + 18} 0 Z` : `M${x} 0 L${x + 9} -9 L${x + 18} 0 Z`} fill={tone} />
  );
  const bump = (x: number, tone: string, flip = false) => (
    <path d={flip ? `M${x} 0 A9 9 0 0 0 ${x + 18} 0 Z` : `M${x} 0 A9 9 0 0 1 ${x + 18} 0 Z`} fill={tone} />
  );

  return (
    <Diagram title="Frontal symbols">
      {row("cold", 74, "Cold front", BRAND, (
        <>
          <line x1={0} y1={0} x2={252} y2={0} stroke={BRAND} strokeWidth={2.6} />
          {[16, 76, 136, 196].map((x) => tri(x, BRAND))}
        </>
      ))}
      {row("warm", 128, "Warm front", NOGO, (
        <>
          <line x1={0} y1={0} x2={252} y2={0} stroke={NOGO} strokeWidth={2.6} />
          {[16, 76, 136, 196].map((x) => bump(x, NOGO))}
        </>
      ))}
      {row("stationary", 182, "Stationary front", CAUTION, (
        <>
          <line x1={0} y1={0} x2={252} y2={0} stroke={CAUTION} strokeWidth={2.6} />
          {[16, 136].map((x) => tri(x, BRAND))}
          {[76, 196].map((x) => bump(x, NOGO, true))}
        </>
      ))}
      {row("occluded", 236, "Occluded front", HAZARD, (
        <>
          <line x1={0} y1={0} x2={252} y2={0} stroke={HAZARD} strokeWidth={2.6} />
          {[16, 136].map((x) => tri(x, HAZARD))}
          {[76, 196].map((x) => bump(x, HAZARD))}
        </>
      ))}

      {labels && (
        <text x={250} y={38} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
          Stationary alternates, and points in OPPOSITE directions. Occluded is purple.
        </text>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w7 — turbulence                                                     */
/* ------------------------------------------------------------------ */

/** The four causative factors, each drawn as the disturbance it is. */
export function TurbulenceCauses(p: DiagramProps) {
  const cause = str(p.cause, "none");
  const on = (id: string) => cause === "none" || cause === id;

  const panel = (id: string, x: number, y: number, title: string, tone: string, art: React.ReactNode) => (
    <g opacity={on(id) ? 1 : 0.24}>
      <rect x={x} y={y} width={196} height={94} rx={11} fill="var(--color-surface-2)" stroke={cause === id ? tone : MUTED} strokeWidth={cause === id ? 2.4 : 1.3} />
      <text x={x + 12} y={y + 19} fontSize={10.5} fontWeight={800} fill={tone}>
        {title}
      </text>
      <g transform={`translate(${x} ${y})`}>{art}</g>
    </g>
  );

  return (
    <Diagram title="Four causes of turbulence">
      {panel("windshear", 40, 40, "WIND SHEAR", NOGO, (
        <>
          <line x1={16} y1={48} x2={110} y2={48} stroke={NOGO} strokeWidth={2.4} strokeLinecap="round" />
          <path d="M104 42 L114 48 L104 54" fill="none" stroke={NOGO} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          <line x1={16} y1={74} x2={70} y2={74} stroke={NOGO} strokeWidth={2.4} strokeLinecap="round" opacity={0.5} />
          <path d="M64 68 L74 74 L64 80" fill="none" stroke={NOGO} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
          <text x={126} y={78} fontSize={8.5} fontWeight={700} fill={MUTED}>
            sudden change
          </text>
        </>
      ))}
      {panel("thermal", 262, 40, "THERMAL", CAUTION, (
        <>
          <line x1={16} y1={82} x2={120} y2={82} stroke={CAUTION} strokeWidth={2.4} />
          {[34, 62, 90].map((x) => (
            <path key={x} d={`M${x} 78 C${x - 6} 66 ${x + 6} 58 ${x} 44`} stroke={CAUTION} strokeWidth={1.9} fill="none" strokeLinecap="round" />
          ))}
          <text x={130} y={62} fontSize={8.5} fontWeight={700} fill={MUTED}>
            heating below
          </text>
        </>
      ))}
      {panel("frontal", 40, 152, "FRONTAL", BRAND, (
        <>
          <path d="M16 82 L16 44 L92 82 Z" fill={`color-mix(in srgb, ${BRAND} 22%, transparent)`} stroke={BRAND} strokeWidth={1.9} />
          <path d="M96 78 L112 48" stroke={BRAND} strokeWidth={2.1} strokeLinecap="round" />
          <path d="M106 58 L114 44 L118 60" fill="none" stroke={BRAND} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
          <text x={126} y={72} fontSize={8.5} fontWeight={700} fill={MUTED}>
            cold front only
          </text>
        </>
      ))}
      {panel("mechanical", 262, 152, "MECHANICAL", GO, (
        <>
          <rect x={20} y={58} width={20} height={24} fill={`color-mix(in srgb, ${GO} 30%, transparent)`} stroke={GO} strokeWidth={1.7} />
          <path d="M50 64 L74 58 L98 74 L120 64" stroke={GO} strokeWidth={1.4} fill="none" />
          <line x1={16} y1={82} x2={130} y2={82} stroke={GO} strokeWidth={2.2} />
          <path d="M4 62 L18 62" stroke={GO} strokeWidth={2.1} strokeLinecap="round" />
          <text x={64} y={50} fontSize={8.5} fontWeight={700} fill={MUTED}>
            below 1,000 ft AGL
          </text>
        </>
      ))}

      <text x={250} y={276} textAnchor="middle" fontSize={9.8} fontWeight={800} fill={MUTED}>
        Wind shear · Thermal · Frontal · Mechanical
      </text>
      <text x={250} y={292} textAnchor="middle" fontSize={9} fontWeight={700} fill={MUTED}>
        There is no warm frontal turbulence — warm fronts barely lift
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w8 — icing                                                          */
/* ------------------------------------------------------------------ */

/** Ice type against free air temperature. */
export function IcingLadder(p: DiagramProps) {
  const temp = Math.max(-25, Math.min(5, num(p.temp, -5)));
  const labels = bool(p.labels, true);

  const left = 104;
  const right = 430;
  const x = (t: number) => right - ((t + 25) / 30) * (right - left);

  const band = (from: number, to: number, y: number, h: number, tone: string, label: string, sub: string) => (
    <g>
      <rect x={x(to)} y={y} width={x(from) - x(to)} height={h} rx={6} fill={`color-mix(in srgb, ${tone} 20%, transparent)`} stroke={tone} strokeWidth={1.7} />
      {labels && (
        <>
          <text x={(x(from) + x(to)) / 2} y={y + 16} textAnchor="middle" fontSize={10} fontWeight={800} fill={tone}>
            {label}
          </text>
          <text x={(x(from) + x(to)) / 2} y={y + 29} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={MUTED}>
            {sub}
          </text>
        </>
      )}
    </g>
  );

  const current =
    temp > 0
      ? { name: "Above freezing", tone: MUTED, note: "Structural ice cannot form" }
      : temp >= -10
        ? { name: "CLEAR", tone: NOGO, note: "Unstable · large droplets · most severe" }
        : temp >= -20
          ? { name: "RIME", tone: BRAND, note: "Stable · tiny droplets · freezes instantly" }
          : { name: "Below −20 °C", tone: GO, note: "Climb here to escape icing" };

  return (
    <Diagram title="Icing by temperature">
      {/* Scale */}
      <line x1={left} y1={222} x2={right} y2={222} stroke={NAVY} strokeWidth={2} />
      {[-25, -20, -15, -10, -5, 0, 5].map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={222} x2={x(t)} y2={228} stroke={MUTED} strokeWidth={1.3} />
          <text x={x(t)} y={242} textAnchor="middle" fontSize={9} fontWeight={700} fill={MUTED}>
            {t}
          </text>
        </g>
      ))}
      <text x={right + 8} y={226} fontSize={9} fontWeight={750} fill={MUTED}>
        °C
      </text>

      {band(0, -10, 66, 38, NOGO, "CLEAR", "0 to −10")}
      {band(-10, -20, 110, 38, BRAND, "RIME", "−10 to −20")}
      {band(-8, -15, 154, 38, CAUTION, "MIXED", "−8 to −15 · overlaps both")}

      {/* Current temperature marker */}
      <line x1={x(temp)} y1={58} x2={x(temp)} y2={222} stroke={NAVY} strokeWidth={2.2} strokeDasharray="5 4" />
      <circle cx={x(temp)} cy={222} r={5} fill={NAVY} />
      <g transform={`translate(${Math.max(96, Math.min(x(temp), 404))} 48)`}>
        <rect x={-58} y={-16} width={116} height={22} rx={7} fill="var(--color-surface)" stroke={current.tone} strokeWidth={1.6} />
        <text x={0} y={0} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={current.tone}>
          {current.name}
        </text>
      </g>

      <text x={250} y={266} textAnchor="middle" fontSize={9.8} fontWeight={750} fill={current.tone}>
        {current.note}
      </text>
      <text x={250} y={284} textAnchor="middle" fontSize={9} fontWeight={700} fill={MUTED}>
        Frost is ground icing · induction icing can occur up to +10 °C
      </text>
    </Diagram>
  );
}

/** The three conditions icing needs, as an intersection. */
export function IcingRequirements(p: DiagramProps) {
  const missing = str(p.missing, "none");

  const circle = (id: string, cx: number, cy: number, label: string, tone: string) => {
    const gone = missing === id;
    return (
      <g opacity={gone ? 0.22 : 1}>
        <circle cx={cx} cy={cy} r={62} fill={`color-mix(in srgb, ${tone} 15%, transparent)`} stroke={tone} strokeWidth={2.2} strokeDasharray={gone ? "6 5" : undefined} />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize={10} fontWeight={800} fill={tone}>
          {label.split("|")[0]}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={9} fontWeight={700} fill={MUTED}>
          {label.split("|")[1]}
        </text>
      </g>
    );
  };

  const forms = missing === "none";

  return (
    <Diagram title="What icing requires">
      {circle("moisture", 178, 128, "Visible|moisture", BRAND)}
      {circle("fat", 322, 128, "Free air temp|below freezing", CAUTION)}
      {circle("surface", 250, 196, "Aircraft surface|below freezing", NOGO)}

      <text x={250} y={276} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={forms ? NOGO : GO}>
        {forms ? "All three present — ICE FORMS" : "One condition missing — no ice"}
      </text>
      <text x={250} y={40} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
        Remove any one and it cannot form
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w9 — storms and low visibility                                      */
/* ------------------------------------------------------------------ */

/** Circumnavigate, Over, Under, Through — in priority order. */
export function ThunderstormAvoidance(p: DiagramProps) {
  const option = str(p.option, "none");
  const on = (id: string) => option === "none" || option === id;

  const ground = 250;

  return (
    <Diagram title="Thunderstorm avoidance">
      {/* The storm */}
      <path
        d="M196 250 C182 208 190 150 212 128 C214 92 262 78 286 108 C324 100 340 148 318 158 L318 250 Z"
        fill="color-mix(in srgb, var(--color-navy) 20%, transparent)"
        stroke={NAVY}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path d="M204 84 L332 84 L320 62 L216 62 Z" fill="color-mix(in srgb, var(--color-navy) 26%, transparent)" stroke={NAVY} strokeWidth={1.7} />

      {/* Over */}
      <g opacity={on("over") ? 1 : 0.22}>
        <path d="M60 46 C160 40 340 40 452 46" fill="none" stroke={GO} strokeWidth={2.4} strokeDasharray="7 5" />
        <text x={256} y={34} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={GO}>
          OVER — 1,000 ft per 10 kt of wind at the top
        </text>
      </g>

      {/* Circumnavigate — drawn as a lateral detour */}
      <g opacity={on("circumnavigate") ? 1 : 0.22}>
        <path d="M56 196 C110 196 120 118 176 112" fill="none" stroke={BRAND} strokeWidth={2.6} />
        <path d="M166 106 L180 111 L168 120" fill="none" stroke={BRAND} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        <text x={64} y={182} fontSize={9.5} fontWeight={800} fill={BRAND}>
          CIRCUMNAVIGATE
        </text>
        <text x={64} y={168} fontSize={8.6} fontWeight={700} fill={MUTED}>
          first choice: fly around
        </text>
      </g>

      {/* Through — lower third */}
      <g opacity={on("through") ? 1 : 0.22}>
        <line x1={196} y1={218} x2={318} y2={218} stroke={CAUTION} strokeWidth={1.3} strokeDasharray="4 4" />
        <path d="M170 234 L344 234" stroke={CAUTION} strokeWidth={2.6} />
        <text x={356} y={230} fontSize={9.5} fontWeight={800} fill={CAUTION}>
          THROUGH
        </text>
        <text x={356} y={243} fontSize={8.6} fontWeight={700} fill={MUTED}>
          lower ⅓, no angle
        </text>
      </g>

      {/* Under — lower third of base-to-ground */}
      <g opacity={on("under") ? 1 : 0.22}>
        <line x1={196} y1={250} x2={318} y2={250} stroke={MUTED} strokeWidth={1} />
        <path d="M150 268 L360 268" stroke={HAZARD} strokeWidth={2.4} />
        <text x={128} y={264} textAnchor="end" fontSize={9.5} fontWeight={800} fill={HAZARD}>
          UNDER
        </text>
        <text x={128} y={276} textAnchor="end" fontSize={8.6} fontWeight={700} fill={MUTED}>
          lower ⅓ base to ground
        </text>
      </g>

      <line x1={30} y1={ground} x2={470} y2={ground} stroke={NAVY} strokeWidth={2.4} opacity={0.3} />
      <line x1={30} y1={284} x2={470} y2={284} stroke={NAVY} strokeWidth={2.6} />
    </Diagram>
  );
}

/** A microburst, and what it does to airspeed on the way through. */
export function Microburst(p: DiagramProps) {
  const stage = str<"approach" | "headwind" | "downdraft" | "tailwind">(p.stage, "approach");

  const ground = 246;
  const posX = { approach: 84, headwind: 168, downdraft: 250, tailwind: 340 }[stage];
  const note = {
    approach: "Virga, blowing dust, rain shafts, roll clouds — the visual cues",
    headwind: "Entering: headwind increases, airspeed rises. It feels good.",
    downdraft: "Core: 2,000–6,000 ft per minute straight down",
    tailwind: "Exiting: the headwind becomes a tailwind. Sudden airspeed LOSS.",
  }[stage];
  const tone = { approach: MUTED, headwind: GO, downdraft: CAUTION, tailwind: NOGO }[stage];

  return (
    <Diagram title="Microburst">
      {/* Source cloud */}
      <ellipse cx={250} cy={72} rx={92} ry={26} fill="color-mix(in srgb, var(--color-navy) 18%, transparent)" stroke={NAVY} strokeWidth={1.8} />

      {/* Downdraft core */}
      <g stroke={CAUTION} strokeWidth={2.6} strokeLinecap="round" fill="none">
        {[228, 250, 272].map((x) => (
          <g key={x}>
            <line x1={x} y1={98} x2={x} y2={206} />
            <path d={`M${x - 7} 194 L${x} 210 L${x + 7} 194`} />
          </g>
        ))}
      </g>

      {/* Outflow vortex ring, both sides */}
      <g stroke={NOGO} strokeWidth={2.4} strokeLinecap="round" fill="none">
        <path d="M226 214 C196 240 150 238 128 210" />
        <path d="M136 220 L124 206 L140 202" />
        <path d="M274 214 C304 240 350 238 372 210" />
        <path d="M364 220 L376 206 L360 202" />
      </g>
      <text x={250} y={232} textAnchor="middle" fontSize={9} fontWeight={750} fill={NOGO}>
        vortex ring 20–200 kt
      </text>

      {/* Aircraft on the profile */}
      <g transform={`translate(${posX} 176)`}>
        <path d="M-16 0 L13 0 M0 -8 L0 8 M10 -5 L10 5" stroke={tone} strokeWidth={3} strokeLinecap="round" />
      </g>

      <line x1={30} y1={ground} x2={470} y2={ground} stroke={NAVY} strokeWidth={2.6} />

      <text x={250} y={44} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
        Severe, localised, and gone in 5–10 minutes
      </text>
      <text x={250} y={272} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={tone}>
        {note}
      </text>
    </Diagram>
  );
}

/** Fog: three conditions and three numbers. */
export function FogConditions(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  const on = (id: string) => highlight === "none" || highlight === id;

  const ground = 232;

  return (
    <Diagram title="Fog">
      {/* Fog layer, sitting on the deck */}
      <g opacity={0.9}>
        <rect x={40} y={182} width={420} height={50} fill="color-mix(in srgb, var(--color-brand) 22%, transparent)" />
        {Array.from({ length: 16 }, (_, i) => (
          <ellipse key={i} cx={56 + i * 26} cy={190 + ((i * 13) % 30)} rx={22} ry={9} fill={BRAND} opacity={0.18} />
        ))}
      </g>

      {/* The 50 ft / 20 ft geometry */}
      <g opacity={on("geometry") ? 1 : 0.25}>
        <line x1={110} y1={182} x2={110} y2={ground} stroke={NAVY} strokeWidth={1.8} />
        <text x={118} y={200} fontSize={9.5} fontWeight={800} fill={NAVY}>
          base within 50 ft of the ground
        </text>
        <text x={118} y={216} fontSize={9.5} fontWeight={800} fill={NAVY}>
          more than 20 ft thick
        </text>
      </g>

      <line x1={40} y1={ground} x2={460} y2={ground} stroke={NAVY} strokeWidth={2.6} />

      {/* The three requirements */}
      {[
        { id: "nuclei", x: 68, label: "Condensation nuclei" },
        { id: "spread", x: 208, label: "Low temp/dew point spread" },
        { id: "wind", x: 356, label: "Light surface winds" },
      ].map((r) => (
        <g key={r.id} opacity={on(r.id) ? 1 : 0.25}>
          <rect x={r.x} y={72} width={132} height={44} rx={10} fill="var(--color-surface-2)" stroke={BRAND} strokeWidth={highlight === r.id ? 2.4 : 1.4} />
          <text x={r.x + 66} y={92} textAnchor="middle" fontSize={9.4} fontWeight={800} fill={BRAND}>
            {r.label.split(" ").slice(0, 2).join(" ")}
          </text>
          <text x={r.x + 66} y={106} textAnchor="middle" fontSize={9.4} fontWeight={800} fill={BRAND}>
            {r.label.split(" ").slice(2).join(" ")}
          </text>
          <line x1={r.x + 66} y1={116} x2={r.x + 66} y2={150} stroke={MUTED} strokeWidth={1.2} strokeDasharray="3 3" />
        </g>
      ))}

      <text x={250} y={166} textAnchor="middle" fontSize={10} fontWeight={800} fill={NAVY}>
        visibility less than ⅝ SM
      </text>
      <text x={250} y={44} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
        Three requirements, and three numbers that define it
      </text>
      <text x={250} y={264} textAnchor="middle" fontSize={9.2} fontWeight={700} fill={MUTED}>
        Light winds, not calm: the moisture has to be mixed through the layer
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* w10 — weather products                                              */
/* ------------------------------------------------------------------ */

/** A wind barb, decoded. */
export function StationModel(p: DiagramProps) {
  const knots = Math.max(0, Math.min(95, num(p.knots, 25)));
  const labels = bool(p.labels, true);

  // Build the barb from flags, full lines and half lines.
  let left = Math.round(knots / 5) * 5;
  const flags = Math.floor(left / 50);
  left -= flags * 50;
  const fulls = Math.floor(left / 10);
  left -= fulls * 10;
  const halves = Math.floor(left / 5);

  const shaftX = 250;
  const shaftTop = 96;
  const shaftBottom = 196;
  let cursor = shaftTop;
  const marks: React.ReactNode[] = [];

  for (let i = 0; i < flags; i++) {
    marks.push(
      <path key={`f${i}`} d={`M${shaftX} ${cursor} L${shaftX + 26} ${cursor + 7} L${shaftX} ${cursor + 14} Z`} fill={NAVY} />,
    );
    cursor += 18;
  }
  for (let i = 0; i < fulls; i++) {
    marks.push(
      <line key={`n${i}`} x1={shaftX} y1={cursor} x2={shaftX + 26} y2={cursor + 8} stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />,
    );
    cursor += 12;
  }
  for (let i = 0; i < halves; i++) {
    marks.push(
      <line key={`h${i}`} x1={shaftX} y1={cursor} x2={shaftX + 14} y2={cursor + 4} stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />,
    );
    cursor += 12;
  }

  return (
    <Diagram title="Station model wind barb">
      <line x1={shaftX} y1={shaftTop} x2={shaftX} y2={shaftBottom} stroke={NAVY} strokeWidth={2.6} />
      <circle cx={shaftX} cy={shaftBottom} r={9} fill="var(--color-surface)" stroke={NAVY} strokeWidth={2.4} />
      {marks}

      {labels && (
        <>
          <g transform="translate(70 90)">
            <path d="M0 0 L26 7 L0 14 Z" fill={NAVY} />
            <text x={34} y={12} fontSize={10.5} fontWeight={800} fill={NAVY}>
              flag = 50 kt
            </text>
          </g>
          <g transform="translate(70 124)">
            <line x1={0} y1={0} x2={26} y2={8} stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
            <text x={34} y={12} fontSize={10.5} fontWeight={800} fill={NAVY}>
              full line = 10 kt
            </text>
          </g>
          <g transform="translate(70 158)">
            <line x1={0} y1={0} x2={14} y2={4} stroke={NAVY} strokeWidth={2.6} strokeLinecap="round" />
            <text x={34} y={8} fontSize={10.5} fontWeight={800} fill={NAVY}>
              half line = 5 kt
            </text>
          </g>

          <text x={370} y={140} fontSize={22} fontWeight={800} fill={BRAND}>
            {Math.round(knots / 5) * 5} kt
          </text>
          <text x={370} y={160} fontSize={9.5} fontWeight={700} fill={MUTED}>
            {flags} flag · {fulls} full · {halves} half
          </text>
          <text x={250} y={238} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
            The station circle sits at the reporting location
          </text>
          <text x={250} y={256} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
            Cig is the cloud ceiling, in hundreds of feet
          </text>
        </>
      )}
    </Diagram>
  );
}

/** How long each product is good for. */
export function ProductTimeline(p: DiagramProps) {
  const product = str(p.product, "none");
  const on = (id: string) => product === "none" || product === id;

  const left = 128;
  const right = 452;
  const x = (hours: number) => left + (hours / 24) * (right - left);

  const rows = [
    { id: "metar", label: "METAR", from: 0, to: 1, tone: BRAND, note: "hourly, xx:55–xx:59 · current" },
    { id: "csigmet", label: "Conv SIGMET", from: 0, to: 2, tone: HAZARD, note: "issued xx:55 · 2 hours" },
    { id: "sigmet", label: "SIGMET", from: 0, to: 4, tone: NOGO, note: "4 hours · 6 for hurricanes" },
    { id: "airmet", label: "AIRMET", from: 0, to: 6, tone: CAUTION, note: "every 6 hours · moderate" },
    { id: "taf", label: "TAF", from: 0, to: 24, tone: GO, note: "every 6 hours, covers 24+" },
  ];

  return (
    <Diagram title="Product validity">
      {[0, 6, 12, 18, 24].map((h) => (
        <g key={h}>
          <line x1={x(h)} y1={58} x2={x(h)} y2={238} stroke={MUTED} strokeWidth={1} strokeDasharray="3 5" opacity={0.55} />
          <text x={x(h)} y={254} textAnchor="middle" fontSize={9} fontWeight={700} fill={MUTED}>
            {h}h
          </text>
        </g>
      ))}

      {rows.map((r, i) => {
        const y = 72 + i * 34;
        return (
          <g key={r.id} opacity={on(r.id) ? 1 : 0.24}>
            <text x={120} y={y + 12} textAnchor="end" fontSize={10} fontWeight={800} fill={r.tone}>
              {r.label}
            </text>
            <rect
              x={x(r.from)}
              y={y}
              width={Math.max(10, x(r.to) - x(r.from))}
              height={17}
              rx={8}
              fill={`color-mix(in srgb, ${r.tone} 26%, transparent)`}
              stroke={r.tone}
              strokeWidth={product === r.id ? 2.2 : 1.4}
            />
            <text x={x(r.to) + 8} y={y + 13} fontSize={8.6} fontWeight={700} fill={MUTED}>
              {r.to < 20 ? r.note : ""}
            </text>
          </g>
        );
      })}

      <text x={250} y={40} textAnchor="middle" fontSize={9.8} fontWeight={800} fill={MUTED}>
        HOW FAR FORWARD EACH PRODUCT REACHES
      </text>
      <text x={250} y={280} textAnchor="middle" fontSize={9.3} fontWeight={700} fill={MUTED}>
        METAR governs takeoff and landing · TAF is for planning
      </text>
    </Diagram>
  );
}

/** A standing wave on the lee side, with the three clouds that mark it. */
export function MountainWave(p: DiagramProps) {
  const wind = num(p.wind, 60);
  const clouds = bool(p.clouds, true);
  const highlight = str(p.highlight, "none");
  const severe = wind >= 50;

  const ground = 250;
  const peak = 128;

  // One damped oscillation downwind of the ridge.
  const wave = (y0: number, amp: number) =>
    `M150 ${y0} C176 ${y0} 186 ${peak - 16} 214 ${peak - 16} ` +
    `C250 ${peak - 16} 254 ${y0 + amp} 292 ${y0 + amp} ` +
    `C330 ${y0 + amp} 334 ${y0 - amp * 0.55} 372 ${y0 - amp * 0.55} ` +
    `C404 ${y0 - amp * 0.55} 412 ${y0} 460 ${y0}`;

  return (
    <Diagram title="Mountain wave turbulence">
      {/* Wind arriving from the left */}
      {[70, 100, 130].map((y) => (
        <g key={y}>
          <line x1={24} y1={y} x2={92} y2={y} stroke={MUTED} strokeWidth={2} strokeLinecap="round" />
          <path d={`M86 ${y - 5} L96 ${y} L86 ${y + 5}`} fill="none" stroke={MUTED} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <text x={24} y={54} fontSize={9.5} fontWeight={800} fill={MUTED}>
        {Math.round(wind)} kt, perpendicular to the ridge
      </text>

      {/* The ridge */}
      <path
        d={`M60 ${ground} L150 ${peak} L240 ${ground} Z`}
        fill="var(--color-surface-3)"
        stroke={NAVY}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* Streamlines forming the standing wave */}
      {[
        { y: 96, amp: 30 },
        { y: 148, amp: 36 },
        { y: 196, amp: 30 },
      ].map((s, i) => (
        <path
          key={i}
          d={wave(s.y, s.amp)}
          fill="none"
          stroke={severe ? NOGO : BRAND}
          strokeWidth={2}
          opacity={0.75}
        />
      ))}

      {clouds && (
        <g opacity={highlight === "none" || highlight === "clouds" ? 1 : 0.3}>
          {/* Cap cloud, over the peak */}
          <ellipse cx={150} cy={peak - 6} rx={44} ry={13} fill="color-mix(in srgb, var(--color-navy) 20%, transparent)" stroke={NAVY} strokeWidth={1.5} />
          <text x={150} y={peak - 24} textAnchor="middle" fontSize={9} fontWeight={800} fill={NAVY}>
            CAP
          </text>

          {/* Rotor, at about ridge height, downwind */}
          <ellipse cx={296} cy={peak + 34} rx={34} ry={16} fill="color-mix(in srgb, var(--color-nogo) 22%, transparent)" stroke={NOGO} strokeWidth={1.7} />
          <path d="M282 158 A14 14 0 1 1 310 158" fill="none" stroke={NOGO} strokeWidth={1.5} />
          <text x={296} y={peak + 62} textAnchor="middle" fontSize={9} fontWeight={800} fill={NOGO}>
            ROTOR
          </text>
          <text x={296} y={peak + 74} textAnchor="middle" fontSize={8} fontWeight={650} fill={MUTED}>
            at ridge height
          </text>

          {/* Lenticular, high and downwind */}
          <ellipse cx={366} cy={62} rx={54} ry={11} fill="color-mix(in srgb, var(--color-brand) 24%, transparent)" stroke={BRAND} strokeWidth={1.6} />
          <ellipse cx={366} cy={46} rx={36} ry={8} fill="color-mix(in srgb, var(--color-brand) 18%, transparent)" stroke={BRAND} strokeWidth={1.4} />
          <text x={430} y={58} fontSize={9} fontWeight={800} fill={BRAND}>
            LENTICULAR
          </text>
          <text x={430} y={70} fontSize={8} fontWeight={650} fill={MUTED}>
            above 20,000 ft
          </text>
        </g>
      )}

      <line x1={20} y1={ground} x2={480} y2={ground} stroke={NAVY} strokeWidth={2.6} />

      <text x={250} y={276} textAnchor="middle" fontSize={9.6} fontWeight={800} fill={severe ? NOGO : MUTED}>
        {severe
          ? "50 kt or more at the peak — severe turbulence to the tropopause, 150 miles downwind"
          : "Below 50 kt at the peak, a lesser degree of turbulence"}
      </text>
      <text x={250} y={290} textAnchor="middle" fontSize={8.8} fontWeight={650} fill={MUTED}>
        The clouds stand still while the wind flows through them
      </text>
    </Diagram>
  );
}
