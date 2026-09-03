"use client";

/**
 * The rest of the desk: the jet log, the zone wheel, the scratch pad and the
 * reference card.
 *
 * The same rule governs all of them as governs the CR-3. A tool may do the
 * mechanical part — hold a span, carry a ratio, lay out a column — but it must
 * not do the part the student is being examined on. The jet log therefore does
 * not total itself, and the zone wheel is a wheel rather than a text box with
 * an equals sign.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eraser, Redo2, Undo2 } from "lucide-react";
import { formatClock, formatHoursMinutes, parseClock, parseElapsed } from "@/lib/nav/math";
import { normalizeRotation } from "@/lib/nav/slide-rule";
import { Pill, cn } from "../ui";

/* ================================================================== */
/* The jet log                                                        */
/* ================================================================== */

export interface JetLogRow {
  fix: string;
  /** Magnetic course for the leg into this fix. */
  cus: string;
  dist: string;
  ete: string;
  eta: string;
  legFuel: string;
  efr: string;
  notes: string;
}

export function emptyJetLogRow(fix = ""): JetLogRow {
  return { fix, cus: "", dist: "", ete: "", eta: "", legFuel: "", efr: "", notes: "" };
}

const JETLOG_COLUMNS: {
  key: keyof JetLogRow;
  head: string;
  width: string;
  explain: string;
}[] = [
  { key: "fix", head: "FIX / NAVAID", width: "minmax(7rem,1.4fr)", explain: "The point this line is about — a turn point, a navaid, or the destination." },
  { key: "cus", head: "CUS", width: "4.2rem", explain: "Magnetic course for the leg into this fix, measured off the chart and corrected for variation." },
  { key: "dist", head: "DIST", width: "4.2rem", explain: "Leg distance in nautical miles, measured with the dividers against a meridian." },
  { key: "ete", head: "ETE", width: "5rem", explain: "Estimated time en route for the leg, from the leg distance and the predicted groundspeed." },
  { key: "eta", head: "ETA / ATA", width: "5.4rem", explain: "Estimated time of arrival over the fix. The actual goes in the same box in flight." },
  { key: "legFuel", head: "LEG FUEL", width: "5.4rem", explain: "Fuel for the leg, from the ETE and the fuel flow." },
  { key: "efr", head: "EFR / AFR", width: "5.6rem", explain: "Estimated fuel remaining over the fix: the previous EFR less this leg's fuel." },
  { key: "notes", head: "NOTES", width: "minmax(7rem,1.2fr)", explain: "Heading and groundspeed for the leg, and anything else you want in front of you." },
];

export type JetLogMode = "learn" | "practice" | "mission";

export interface JetLogProps {
  rows: JetLogRow[];
  onChange?: (rows: JetLogRow[]) => void;
  mode?: JetLogMode;
  /** Given data shown above the log: TAS, fuel flow, fuel on board, takeoff. */
  header?: { label: string; value: string }[];
  /** Per-cell verdicts once the work is checked, keyed `${rowIndex}.${column}`. */
  verdicts?: Record<string, boolean>;
  readOnly?: boolean;
}

/**
 * The en-route section of the jet log — the only part this course uses.
 *
 * It does not auto-calculate. Information Sheet 6-7-2 makes the log the record
 * of four computations the aircrew performs; a form that filled itself in
 * would be a record of nothing.
 */
export function JetLog({
  rows,
  onChange,
  mode = "practice",
  header,
  verdicts,
  readOnly = false,
}: JetLogProps) {
  const [focused, setFocused] = useState<keyof JetLogRow | null>(null);

  const set = (index: number, key: keyof JetLogRow, value: string) => {
    if (!onChange || readOnly) return;
    onChange(rows.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  };

  const template = JETLOG_COLUMNS.map((c) => c.width).join(" ");

  return (
    <div className="space-y-2">
      {header && header.length > 0 && (
        <div className="given-block flex flex-wrap gap-x-5 gap-y-1.5 rounded-lg px-3 py-2">
          {header.map((h) => (
            <div key={h.label}>
              <p className="eyebrow text-[9px] text-navy-faint">{h.label}</p>
              <p className="figure text-[13px] font-bold text-navy">{h.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="chart-paper overflow-x-auto rounded-lg">
        <div className="min-w-[46rem]">
          <div
            className="grid border-b border-line-strong bg-[color-mix(in_srgb,var(--color-brand-soft)_60%,#fffdf7)]"
            style={{ gridTemplateColumns: template }}
          >
            {JETLOG_COLUMNS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFocused(focused === c.key ? null : c.key)}
                className={cn(
                  "border-r border-line-strong px-2 py-1.5 text-left text-[11px] font-extrabold uppercase tracking-[0.1em] last:border-r-0",
                  focused === c.key ? "bg-brand text-white" : "text-navy-soft",
                )}
              >
                {c.head}
              </button>
            ))}
          </div>

          {rows.map((row, i) => (
            <div
              key={i}
              className="grid border-b border-line last:border-b-0"
              style={{ gridTemplateColumns: template }}
            >
              {JETLOG_COLUMNS.map((c) => {
                const verdict = verdicts?.[`${i}.${c.key}`];
                return (
                  <div
                    key={c.key}
                    className={cn(
                      "border-r border-line last:border-r-0",
                      verdict === true && "bg-go-soft",
                      verdict === false && "bg-nogo-soft",
                    )}
                  >
                    <input
                      value={row[c.key]}
                      onChange={(e) => set(i, c.key, e.target.value)}
                      readOnly={readOnly}
                      aria-label={`${c.head}, row ${i + 1}`}
                      className={cn(
                        "figure h-9 w-full bg-transparent px-2 text-[12.5px] text-navy outline-none placeholder:text-navy-faint/50",
                        c.key === "fix" || c.key === "notes" ? "font-sans font-semibold" : "",
                        "focus:bg-brand-soft/60",
                      )}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {mode === "learn" && focused && (
        <div className="rounded-lg border border-brand/25 bg-brand-soft px-3 py-2">
          <p className="eyebrow text-brand-dark">
            {JETLOG_COLUMNS.find((c) => c.key === focused)?.head}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-navy">
            {JETLOG_COLUMNS.find((c) => c.key === focused)?.explain}
          </p>
        </div>
      )}
      {mode === "learn" && !focused && (
        <p className="text-[11px] text-navy-faint">Tap a column heading to see what belongs in it.</p>
      )}
      {mode !== "learn" && (
        <p className="text-[11px] text-navy-faint">
          The log does not add up for you. Each column is a computation you make and then record.
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/* The zone wheel                                                     */
/* ================================================================== */

/**
 * Global timekeeping as a wheel rather than a text box.
 *
 * A converter that took LMT and a zone description and printed Zulu would end
 * EO 4.2 as a skill. This does what the CR-3 does for a ratio: it holds the
 * relationship once you have set it, and setting it correctly requires knowing
 * which way the sign runs. Turn the inner ring by the zone description and
 * every local hour lines up against its Zulu hour at once.
 *
 *   GMT (Z) = LMT − (ZD)      LMT = GMT + (ZD)
 */
export function ZoneWheel({ initialZd = 0 }: { initialZd?: number }) {
  const [zd, setZd] = useState(initialZd);
  const size = 300;
  const c = size / 2;

  /**
   * Rotating the inner ring by −ZD hours puts each local hour against the Zulu
   * hour it equals, because Zulu is local minus the zone description.
   */
  const rotation = normalizeRotation(-zd * 15);

  return (
    <div className="space-y-3">
      <div className="instrument-face mx-auto w-full max-w-[300px] overflow-hidden rounded-full">
        <svg viewBox={`0 0 ${size} ${size}`} className="block w-full select-none" role="img" aria-label={`Zone wheel set to ${zd >= 0 ? "+" : ""}${zd}`}>
          <circle cx={c} cy={c} r={140} fill="#fbfaf6" stroke="var(--color-line-strong)" />
          {Array.from({ length: 24 }, (_, h) => {
            const a = h * 15;
            return (
              <g key={`z-${h}`} transform={`rotate(${a} ${c} ${c})`}>
                <line x1={c} y1={c - 140} x2={c} y2={c - 128} stroke="var(--color-ink-700)" strokeWidth={h % 6 === 0 ? 1.4 : 0.7} />
                <text
                  x={c}
                  y={c - 116}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={h % 6 === 0 ? 800 : 600}
                  className="figure"
                  fill="var(--color-ink-800)"
                  transform={`rotate(${-a} ${c} ${c - 116})`}
                >
                  {String(h).padStart(2, "0")}
                </text>
              </g>
            );
          })}
          <text x={c} y={c - 152 + 14} textAnchor="middle" fontSize={8} fontWeight={800} letterSpacing="0.16em" fill="var(--color-navy-faint)">
            ZULU
          </text>

          <g transform={`rotate(${rotation} ${c} ${c})`}>
            <circle cx={c} cy={c} r={104} fill="var(--color-brand-soft)" stroke="var(--color-brand)" strokeWidth={0.8} />
            {Array.from({ length: 24 }, (_, h) => {
              const a = h * 15;
              return (
                <g key={`l-${h}`} transform={`rotate(${a} ${c} ${c})`}>
                  <line x1={c} y1={c - 104} x2={c} y2={c - 94} stroke="var(--color-brand-dark)" strokeWidth={h % 6 === 0 ? 1.3 : 0.6} />
                  <text
                    x={c}
                    y={c - 82}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10.5}
                    fontWeight={h % 6 === 0 ? 800 : 600}
                    className="figure"
                    fill="var(--color-brand-dark)"
                    transform={`rotate(${-a - rotation} ${c} ${c - 82})`}
                  >
                    {String(h).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
            <text x={c} y={c + 24} textAnchor="middle" fontSize={8} fontWeight={800} letterSpacing="0.16em" fill="var(--color-brand-dark)" transform={`rotate(${-rotation} ${c} ${c + 24})`}>
              LOCAL
            </text>
          </g>

          <circle cx={c} cy={c} r={30} fill="#fbfaf6" stroke="var(--color-line-strong)" />
          <text x={c} y={c - 2} textAnchor="middle" fontSize={15} fontWeight={800} className="figure" fill="var(--color-ink-800)">
            {zd >= 0 ? "+" : "−"}
            {Math.abs(zd)}
          </text>
          <text x={c} y={c + 12} textAnchor="middle" fontSize={7} letterSpacing="0.14em" fill="var(--color-navy-faint)">
            ZD
          </text>
        </svg>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setZd((z) => Math.max(-12, z - 1))}
          className="h-8 w-9 rounded-lg border border-line-strong bg-surface text-[15px] font-bold text-navy-soft hover:bg-surface-2"
          aria-label="Decrease zone description"
        >
          −
        </button>
        <span className="figure w-20 text-center text-[13px] font-bold text-navy">
          ZD {zd >= 0 ? "+" : "−"}
          {Math.abs(zd)}
        </span>
        <button
          type="button"
          onClick={() => setZd((z) => Math.min(12, z + 1))}
          className="h-8 w-9 rounded-lg border border-line-strong bg-surface text-[15px] font-bold text-navy-soft hover:bg-surface-2"
          aria-label="Increase zone description"
        >
          +
        </button>
      </div>

      <div className="rounded-lg bg-surface-2 px-3 py-2 text-center">
        <p className="figure text-[13px] font-bold text-navy">GMT (Z) = LMT − (ZD)</p>
        <p className="figure mt-0.5 text-[13px] font-bold text-navy">LMT = GMT + (ZD)</p>
        <p className="mt-1 text-[11px] text-navy-faint">
          Subtracting a negative adds. Fly in Zulu, convert at each end.
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/* The scratch pad                                                    */
/* ================================================================== */

interface Stroke {
  points: { x: number; y: number }[];
}

/**
 * Somewhere to sketch a wind T and do the arithmetic the wheel does not do.
 * Strokes are kept as point lists so undo is a pop rather than a bitmap
 * history, and so a stylus and a mouse behave the same.
 */
export function ScratchPad({
  height = 260,
  storageKey,
}: {
  height?: number;
  storageKey?: string;
}) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);
  const [note, setNote] = useState("");
  const [tab, setTab] = useState<"draw" | "type">("draw");
  const drawing = useRef<Stroke | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [, force] = useState(0);

  /* Scratch work has to survive opening a tool and coming back. */
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.sessionStorage.getItem(`wingbrief:scratch:${storageKey}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { strokes: Stroke[]; note: string };
        setStrokes(parsed.strokes ?? []);
        setNote(parsed.note ?? "");
      }
    } catch {
      /* A corrupt scratch pad is not worth reporting; start blank. */
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      window.sessionStorage.setItem(
        `wingbrief:scratch:${storageKey}`,
        JSON.stringify({ strokes, note }),
      );
    } catch {
      /* Storage full or blocked — the pad still works for this session. */
    }
  }, [storageKey, strokes, note]);

  const at = useCallback((event: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 400,
      y: ((event.clientY - rect.top) / rect.height) * (400 * (height / 400)),
    };
  }, [height]);

  const down = (event: React.PointerEvent) => {
    (event.target as Element).setPointerCapture?.(event.pointerId);
    drawing.current = { points: [at(event)] };
    setRedo([]);
  };

  const move = (event: React.PointerEvent) => {
    if (!drawing.current) return;
    drawing.current.points.push(at(event));
    force((n) => n + 1);
  };

  const up = () => {
    if (drawing.current && drawing.current.points.length > 1) {
      setStrokes((s) => [...s, drawing.current!]);
    }
    drawing.current = null;
  };

  const toPath = (s: Stroke) =>
    s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const viewH = 400 * (height / 400);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="flex overflow-hidden rounded-lg border border-line-strong">
          {(["draw", "type"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                tab === t ? "bg-brand text-white" : "bg-surface text-navy-soft hover:bg-surface-2",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "draw" && (
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              onClick={() => {
                setStrokes((s) => {
                  if (s.length === 0) return s;
                  setRedo((r) => [...r, s[s.length - 1]]);
                  return s.slice(0, -1);
                });
              }}
              aria-label="Undo"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-surface text-navy-soft hover:bg-surface-2"
            >
              <Undo2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                setRedo((r) => {
                  if (r.length === 0) return r;
                  setStrokes((s) => [...s, r[r.length - 1]]);
                  return r.slice(0, -1);
                });
              }}
              aria-label="Redo"
              disabled={redo.length === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-surface text-navy-soft transition-opacity hover:bg-surface-2 disabled:opacity-40"
            >
              <Redo2 size={13} />
            </button>
            <button
              type="button"
              onClick={() => {
                setStrokes([]);
                setRedo([]);
              }}
              aria-label="Clear the pad"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-surface text-navy-soft hover:bg-surface-2"
            >
              <Eraser size={13} />
            </button>
          </div>
        )}
      </div>

      {tab === "draw" ? (
        <svg
          ref={svgRef}
          viewBox={`0 0 400 ${viewH}`}
          className="chart-paper block w-full touch-none rounded-lg"
          style={{ height }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerLeave={up}
          role="img"
          aria-label="Scratch pad"
        >
          {strokes.map((s, i) => (
            <path key={i} d={toPath(s)} className="pencil-line" strokeWidth={1.6} />
          ))}
          {drawing.current && (
            <path d={toPath(drawing.current)} className="pencil-line" strokeWidth={1.6} />
          )}
        </svg>
      ) : (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="TC 218  TAS 325  wind 100/40&#10;left tail → TH < TC, GS > TAS"
          className="chart-paper figure w-full rounded-lg p-3 text-[13px] leading-relaxed text-navy outline-none focus:ring-2 focus:ring-brand/30"
          style={{ height }}
        />
      )}
    </div>
  );
}

/* ================================================================== */
/* The reference card                                                 */
/* ================================================================== */

interface ReferenceSection {
  title: string;
  rows: { term: string; body: string }[];
}

/**
 * The memory aids the trainee guide prints on its own back cover — sheets 42
 * to 44 of Assignment 6-7-3. Nothing here is invented; if the guide does not
 * print it, it is not on the card.
 */
export const NAV_REFERENCE: ReferenceSection[] = [
  {
    title: "Formulas",
    rows: [
      { term: "Speed", body: "SPEED ÷ RATE INDEX = DISTANCE ÷ TIME" },
      { term: "Fuel", body: "FUEL FLOW ÷ RATE INDEX = TOTAL LB ÷ TIME" },
      { term: "Fuel weight", body: "WEIGHT OF 1 GAL ÷ 1.0 = TOTAL LB ÷ TOTAL GAL" },
      { term: "Mach", body: "M = TAS ÷ local speed of sound" },
      { term: "Zulu", body: "GMT (Z) = LMT − (ZD) · LMT = GMT + (ZD)" },
    ],
  },
  {
    title: "Estimation",
    rows: [
      { term: "Rule of 60", body: "Groundspeed ÷ 60 is nautical miles per minute. 300 kt is 5 NM a minute." },
      { term: "Rule of 6", body: "A tenth of groundspeed is the distance covered in six minutes." },
      { term: "Ten percent rule", body: "A crosswind of 10% of TAS gives about 6° of crab, at any airspeed." },
      { term: "Wind strength", body: "All of the big, half of the small." },
    ],
  },
  {
    title: "High-speed index",
    rows: [
      { term: "Use it when", body: "Time is 5 minutes or less" },
      { term: "or", body: "Distance is 5 NM or less" },
      { term: "or", body: "Speed is 500 kt or more" },
      { term: "or", body: "Seconds appear in the estimate, the answer or the question" },
    ],
  },
  {
    title: "Direction",
    rows: [
      { term: "True to magnetic", body: "M = T − East variation · M = T + West variation" },
      { term: "Memory aid", body: "East is least, and west is best." },
      { term: "Course", body: "The intended flight path." },
      { term: "Heading", body: "Where the nose is pointed." },
      { term: "Track", body: "The path actually flown over the ground." },
      { term: "Drift vs crab", body: "Equal in size, opposite in direction." },
    ],
  },
  {
    title: "Altitude",
    rows: [
      { term: "LAGS", body: "Setting Less than 29.92 → Add. Greater → Subtract." },
      { term: "Standard day", body: "29.92 inHg and +15 °C at mean sea level." },
      { term: "Lapse rate", body: "2 °C and 1 inHg per 1,000 ft." },
      { term: "High to low", body: "Look out below." },
      { term: "Low to high", body: "Plenty of sky." },
    ],
  },
  {
    title: "Quartering analysis",
    rows: [
      { term: "Left head", body: "TH < TC and GS < TAS" },
      { term: "Right head", body: "TH > TC and GS < TAS" },
      { term: "Left tail", body: "TH < TC and GS > TAS" },
      { term: "Right tail", body: "TH > TC and GS > TAS" },
    ],
  },
  {
    title: "Tolerances",
    rows: [
      { term: "Direction", body: "±1°" },
      { term: "Distance", body: "±½ NM" },
      { term: "Latitude and longitude", body: "±1 minute" },
      { term: "Log scale (time, GS, distance, fuel)", body: "±1 unit, about ±1%" },
      { term: "True airspeed", body: "±2 kt" },
      { term: "Mach", body: "±0.01" },
      { term: "Wind components", body: "±3 kt under 70 kt, ±5 kt at or above" },
      { term: "In-flight winds", body: "±3° and 3 kt under 70 kt, ±5° and 5 kt at or above" },
      { term: "Point to point", body: "±3° and ±1 NM" },
    ],
  },
];

export function ReferenceCard({ only }: { only?: string[] }) {
  const sections = useMemo(
    () => (only ? NAV_REFERENCE.filter((s) => only.includes(s.title)) : NAV_REFERENCE),
    [only],
  );
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.title} className="chart-paper rounded-lg p-3">
          <p className="eyebrow mb-1.5 text-brand-dark">{section.title}</p>
          <dl className="space-y-1">
            {section.rows.map((row) => (
              <div key={row.term + row.body} className="flex flex-wrap gap-x-2">
                <dt className="min-w-[8.5rem] text-[12px] font-bold text-navy">{row.term}</dt>
                <dd className="figure flex-1 text-[12px] leading-relaxed text-navy-soft">
                  {row.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <p className="text-[11px] leading-relaxed text-navy-faint">
        Everything on this card is printed in NAVAVSCOLSCOM-SG-200 Unit 6 — the memory aids on the
        back sheets of Assignment 6-7-3, and the tolerances in Appendix A.
      </p>
    </div>
  );
}

/* ================================================================== */
/* Shared bits                                                        */
/* ================================================================== */

/** A GIVEN block: the data a problem hands you, boxed off from the prose. */
export function GivenBlock({
  items,
  title = "Given",
}: {
  items: { label: string; value: string }[];
  title?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="given-block rounded-lg px-3 py-2.5">
      <p className="eyebrow mb-1.5 text-brand-dark">{title}</p>
      <div className="grid gap-x-5 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-2">
            <span className="text-[11.5px] font-semibold text-navy-soft">{item.label}</span>
            <span className="figure text-[13px] font-bold text-navy">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Turns a seconds value into the two formats the course writes. */
export function elapsedLabel(seconds: number): string {
  return seconds < 3600 ? formatHoursMinutes(seconds) : formatHoursMinutes(seconds);
}

export { formatClock, parseClock, parseElapsed };

export function ToleranceChip({ label }: { label: string }) {
  return (
    <Pill tone="neutral" size="sm">
      {label}
    </Pill>
  );
}
