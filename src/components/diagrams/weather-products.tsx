"use client";

/**
 * Coded weather report decoders.
 *
 * The rest of the Weather course draws a medium — cross-sections of atmosphere
 * with altitude up the page. These two draw a STRING, because that is what the
 * enabling objectives actually ask for: 4.19 and 4.22 say INTERPRET weather
 * conditions from a METAR and from a TAF, and no cross-section teaches that.
 *
 * A coded report is not prose and not a picture. It is a fixed sequence of
 * positional groups, and the only way to read one is to know which slot you
 * are looking at. So the report is rendered as its actual groups, one
 * highlightable at a time, with the plain-language reading alongside.
 *
 * Every report shown here is the trainee guide's own worked example, not an
 * invented one — Figures 6-2 through 6-13 for the METAR, Figure 6-27 for the
 * military TAF. A student who has decoded these has decoded the ones the
 * instructor will put on the board.
 */

import { Diagram, type DiagramProps, str } from "./primitives";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";

/**
 * Greedy word wrap for SVG text.
 *
 * SVG has no flow layout, and `foreignObject` is not used anywhere else in
 * this codebase — so the readings are wrapped here and drawn as tspans, which
 * keeps these two diagrams exporting and printing like all the others.
 */
function wrap(text: string, charsPerLine: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > charsPerLine) {
      out.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  }
  if (line) out.push(line);
  return out;
}

/** The plain-language reading panel shared by both decoders. */
function Reading({
  label,
  reads,
  tone,
  y,
}: {
  label: string;
  reads: string;
  tone: string;
  y: number;
}) {
  const lines = wrap(reads, 74);
  return (
    <>
      <rect
        x={26}
        y={y}
        width={448}
        height={30 + lines.length * 15}
        rx={12}
        fill="var(--color-surface-2)"
        stroke={tone}
        strokeWidth={1.4}
      />
      <text x={44} y={y + 22} fontSize={10.5} fontWeight={800} fill={tone}>
        {label.toUpperCase()}
      </text>
      <text x={44} y={y + 40} fontSize={11.2} fontWeight={600} fill={NAVY}>
        {lines.map((l, i) => (
          <tspan key={l} x={44} dy={i === 0 ? 0 : 15}>
            {l}
          </tspan>
        ))}
      </text>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* METAR                                                               */
/* ------------------------------------------------------------------ */

/**
 * The ten coded groups of the guide's sample METAR, in report order.
 *
 * `text` is the literal token as it appears on the wire. Splitting the body
 * from the remarks matters: the body is what governs takeoff and landing, and
 * the remarks are elaboration.
 */
const METAR_GROUPS: { id: string; text: string; label: string; reads: string }[] = [
  { id: "type", text: "METAR", label: "Type of report", reads: "Routine hourly observation. SPECI would mean an unscheduled special." },
  { id: "station", text: "KNPA", label: "Station identifier", reads: "NAS Pensacola. Four-letter ICAO; K prefixes the lower 48." },
  { id: "time", text: "082255Z", label: "Date and time", reads: "8th of the month, 2255 Zulu. Always Zulu, always ends in Z." },
  { id: "wind", text: "27004KT", label: "Wind", reads: "From 270 true at 4 knots. Direction first in three digits, then speed, then KT." },
  { id: "vis", text: "7/8SM", label: "Visibility", reads: "Seven eighths of a statute mile. Under 7 SM, so an obstruction must also be reported." },
  { id: "rvr", text: "R04/4500FT", label: "Runway visual range", reads: "Runway 04, RVR 4,500 feet. Reported when visibility is 1 SM or less." },
  { id: "weather", text: "DZ FG", label: "Present weather", reads: "Drizzle and fog. This is the obstruction the visibility group demanded." },
  { id: "sky", text: "SCT000 BKN011 OVC380", label: "Sky condition", reads: "Scattered surface-based, broken at 1,100 ft, overcast at 38,000 ft. Ceiling is 1,100." },
  { id: "temp", text: "19/18", label: "Temperature / dew point", reads: "19 °C over 18 °C. One degree of spread — that is why there is fog." },
  { id: "altimeter", text: "A2997", label: "Altimeter setting", reads: "29.97 inHg. Always four digits after the A." },
  { id: "rmk", text: "RMK VIS1/2V1 CIG009V013", label: "Remarks", reads: "Visibility variable 1/2 to 1, ceiling variable 900 to 1,300 ft. Elaboration, not the governing report." },
];

/**
 * One METAR, drawn as its groups.
 *
 * `group` highlights a single slot and prints its reading underneath. With no
 * group named the whole report reads at once, which is the view a student
 * needs once they can already take it apart.
 */
export function MetarDecode(p: DiagramProps) {
  const group = str(p.group, "none");
  const active = METAR_GROUPS.find((g) => g.id === group);

  /* Wrap the tokens across lines by measured width rather than a fixed count,
     so a long sky-condition group does not overflow the canvas. */
  const CHAR_W = 8.1;
  const GAP = 11;
  const MAX_W = 452;
  const rows: { id: string; text: string; x: number; w: number; y: number }[][] = [[]];
  let x = 0;
  for (const g of METAR_GROUPS) {
    const w = g.text.length * CHAR_W;
    if (x + w > MAX_W && rows[rows.length - 1].length > 0) {
      rows.push([]);
      x = 0;
    }
    rows[rows.length - 1].push({ id: g.id, text: g.text, x, w, y: 0 });
    x += w + GAP;
  }

  const rowH = 30;
  const top = 62;

  return (
    <Diagram title="Reading a METAR">
      <text x={250} y={34} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Trainee guide sample · NAS Pensacola
      </text>

      {rows.map((row, ri) =>
        row.map((tok) => {
          const on = group === "none" || group === tok.id;
          const lit = group === tok.id;
          const gx = 26 + tok.x;
          const gy = top + ri * rowH;
          return (
            <g key={tok.id} opacity={on ? 1 : 0.26}>
              {lit && (
                <rect
                  x={gx - 5}
                  y={gy - 15}
                  width={tok.w + 10}
                  height={23}
                  rx={6}
                  fill="color-mix(in srgb, var(--color-brand) 15%, transparent)"
                  stroke={BRAND}
                  strokeWidth={1.6}
                />
              )}
              <text
                x={gx}
                y={gy}
                fontSize={13}
                fontWeight={lit ? 800 : 650}
                fill={lit ? BRAND : NAVY}
                style={{ fontFamily: "var(--font-mono, ui-monospace), monospace" }}
              >
                {tok.text}
              </text>
            </g>
          );
        }),
      )}

      {active ? (
        <Reading label={active.label} reads={active.reads} tone={BRAND} y={186} />
      ) : (
        <text x={250} y={224} textAnchor="middle" fontSize={11} fontWeight={700} fill={MUTED}>
          Eleven groups, always in this order. Position is what tells you what a token means.
        </text>
      )}
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* TAF                                                                 */
/* ------------------------------------------------------------------ */

/** The guide's military TAF for NAS Whiting Field, line by line. */
const TAF_LINES: { id: string; text: string; label: string; reads: string; tone: string }[] = [
  {
    id: "base",
    text: "KNSE TAF 2609/2709 28004KT 9000 HZ SCT020 SCT200 QNH2998INS",
    label: "Base forecast",
    reads: "Whiting Field, valid 26th 0900Z up to but not including 27th 0900Z. 280 at 4, 6 miles in haze, scattered 2,000 and 20,000, altimeter 29.98.",
    tone: NAVY,
  },
  {
    id: "fm",
    text: "FM261200 26007KT 9000 HZ SCT025 SCT080 BKN250 QNH2996INS",
    label: "FM — a fast, permanent change",
    reads: "From the 26th at 1200Z everything on the line above is superseded. FM lines carry ALL elements, because the whole pattern has changed.",
    tone: NOGO,
  },
  {
    id: "becmg",
    text: "BECMG 2614/2616 9999 SCT025CB SCT250",
    label: "BECMG — a slow, permanent change",
    reads: "Between 1400Z and 1600Z these elements change gradually and then persist. Anything NOT listed carries over unchanged.",
    tone: CAUTION,
  },
  {
    id: "tempo",
    text: "TEMPO 2619/2702 8000 TSSHRA SCT010 BKN025CB",
    label: "TEMPO — a temporary overlay",
    reads: "From 1900Z on the 26th to 0200Z on the 27th, and only these elements. Afterwards the underlying forecast resumes — nothing is superseded.",
    tone: BRAND,
  },
];

/**
 * A military TAF, one change group at a time.
 *
 * The change groups are the whole difficulty of a TAF: three of them look
 * alike and mean three different things about how fast a change arrives and
 * whether it sticks.
 */
export function TafDecode(p: DiagramProps) {
  const line = str(p.line, "none");
  const active = TAF_LINES.find((l) => l.id === line);

  return (
    <Diagram title="Reading a TAF">
      <text x={250} y={30} textAnchor="middle" fontSize={10.5} fontWeight={700} fill={MUTED}>
        Trainee guide sample · military TAF, NAS Whiting Field
      </text>

      {TAF_LINES.map((l, i) => {
        const on = line === "none" || line === l.id;
        const lit = line === l.id;
        const y = 56 + i * 30;
        return (
          <g key={l.id} opacity={on ? 1 : 0.24}>
            {lit && (
              <rect
                x={18}
                y={y - 15}
                width={464}
                height={24}
                rx={6}
                fill={`color-mix(in srgb, ${l.tone} 13%, transparent)`}
                stroke={l.tone}
                strokeWidth={1.5}
              />
            )}
            <text
              x={26}
              y={y}
              fontSize={9.6}
              fontWeight={lit ? 800 : 600}
              fill={lit ? l.tone : NAVY}
              style={{ fontFamily: "var(--font-mono, ui-monospace), monospace" }}
            >
              {l.text}
            </text>
          </g>
        );
      })}

      {active ? (
        <Reading label={active.label} reads={active.reads} tone={active.tone} y={190} />
      ) : (
        <>
          <text x={250} y={214} textAnchor="middle" fontSize={11} fontWeight={700} fill={MUTED}>
            FM supersedes everything. BECMG changes some things, slowly, and they stay.
          </text>
          <text x={250} y={234} textAnchor="middle" fontSize={11} fontWeight={700} fill={GO}>
            TEMPO is the only one that does not stick.
          </text>
        </>
      )}
    </Diagram>
  );
}
