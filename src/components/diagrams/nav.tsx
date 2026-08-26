"use client";

/**
 * Navigation diagrams.
 *
 * The other courses draw a thing: an airfoil in section, an engine in cutaway,
 * a column of atmosphere. Navigation draws a WORKSPACE — chart paper, ruled
 * lines, an instrument face, pencil marks, a vector triangle with its sides
 * labelled. Almost nothing here is a graph, because almost nothing in this
 * course is a relationship between two continuous quantities. It is geometry
 * and procedure, and both are best drawn as the thing on the desk.
 *
 * The recurring grammar: chart paper is warm cream with a fine grid, plotted
 * work is the bright plotting green, pencil work is graphite, and anything the
 * student is being asked to read is drawn at the size it would be read at.
 */

import { Diagram, DIAGRAM_H, DIAGRAM_W, bool, num, px, str } from "./primitives";
import type { DiagramProps } from "./primitives";

const PAPER = "#faf8f2";
const GRID = "#cfc9b6";
const INK = "#12181f";
const PENCIL = "#4a5560";
const PLOT = "#12a86e";
const BLUE = "#3d6f9e";
const EMERALD = "#0b6b4f";

/** A sheet of chart paper filling the diagram, with an optional graticule. */
function Paper({ grid = true, step = 25 }: { grid?: boolean; step?: number }) {
  const lines = [];
  if (grid) {
    for (let x = step; x < DIAGRAM_W; x += step) {
      lines.push(<line key={`v${x}`} x1={x} y1={0} x2={x} y2={DIAGRAM_H} stroke={GRID} strokeWidth={0.4} />);
    }
    for (let y = step; y < DIAGRAM_H; y += step) {
      lines.push(<line key={`h${y}`} x1={0} y1={y} x2={DIAGRAM_W} y2={y} stroke={GRID} strokeWidth={0.4} />);
    }
  }
  return (
    <g>
      <rect x={0} y={0} width={DIAGRAM_W} height={DIAGRAM_H} fill={PAPER} />
      {lines}
    </g>
  );
}

function Label({
  x,
  y,
  children,
  anchor = "start",
  size = 11,
  weight = 700,
  fill = INK,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
  fill?: string;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={fill}>
      {children}
    </text>
  );
}

function ArrowHead({ x, y, angle, color, size = 7 }: { x: number; y: number; angle: number; color: string; size?: number }) {
  return (
    <path
      d={`M ${x} ${y} l ${-size} ${-size * 0.45} l 0 ${size * 0.9} Z`}
      fill={color}
      transform={`rotate(${angle} ${x} ${y})`}
    />
  );
}

/* ================================================================== */
/* n1 — Dead reckoning                                                */
/* ================================================================== */

/** The four components, and the fact that any three give the fourth. */
export function DrComponents(props: DiagramProps) {
  const highlight = str<string>(props.highlight, "none");
  const items = [
    { key: "position", label: "POSITION", detail: "A set of coordinates" },
    { key: "direction", label: "DIRECTION", detail: "An angle from a reference" },
    { key: "time", label: "TIME", detail: "Of day, or elapsed" },
    { key: "speed", label: "SPEED", detail: "Nautical miles per hour" },
  ];
  return (
    <Diagram title="The four components of dead reckoning">
      <Paper grid={false} />
      {items.map((item, i) => {
        const x = 22 + i * 118;
        const on = highlight === item.key || highlight === "none";
        return (
          <g key={item.key} opacity={on ? 1 : 0.32}>
            <rect
              x={x}
              y={78}
              width={104}
              height={92}
              rx={10}
              fill={highlight === item.key ? "#e6f0ea" : "#fff"}
              stroke={highlight === item.key ? EMERALD : GRID}
              strokeWidth={highlight === item.key ? 2 : 1}
            />
            <Label x={x + 52} y={110} anchor="middle" size={12} fill={EMERALD}>
              {item.label}
            </Label>
            <foreignObject x={x + 8} y={120} width={88} height={44}>
              <div
                style={{
                  fontSize: 10,
                  lineHeight: 1.3,
                  color: PENCIL,
                  textAlign: "center",
                  fontFamily: "inherit",
                }}
              >
                {item.detail}
              </div>
            </foreignObject>
          </g>
        );
      })}
      <Label x={DIAGRAM_W / 2} y={48} anchor="middle" size={13}>
        Know any three — the fourth follows
      </Label>
      <Label x={DIAGRAM_W / 2} y={206} anchor="middle" size={12} fill={PENCIL}>
        Speed × Time = Distance
      </Label>
      <Label x={DIAGRAM_W / 2} y={236} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        Compass · Clock · Airspeed indicator give you three of them directly
      </Label>
      <Label x={DIAGRAM_W / 2} y={256} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        Altimeter and OAT are secondary: they correct the speed
      </Label>
    </Diagram>
  );
}

/* ================================================================== */
/* n2 — Charts                                                        */
/* ================================================================== */

/** Why a sphere will not lie flat, and what a cone does about it. */
export function ConicProjection(props: DiagramProps) {
  const showCone = bool(props.cone, true);
  return (
    <Diagram title="Developing a Lambert conformal projection">
      <Paper grid={false} />
      <circle cx={150} cy={168} r={78} fill="#e8eef2" stroke={BLUE} strokeWidth={1.2} />
      {[-52, -26, 0, 26, 52].map((dy) => {
        const r = Math.sqrt(Math.max(0, 78 * 78 - dy * dy));
        return (
          <ellipse
            key={dy}
            cx={150}
            cy={168 + dy}
            rx={r}
            ry={r * 0.22}
            fill="none"
            stroke={BLUE}
            strokeWidth={dy === 0 ? 1.4 : 0.7}
            opacity={dy === 0 ? 0.9 : 0.55}
          />
        );
      })}
      {[-26, 26].map((dy) => (
        <ellipse
          key={`sp${dy}`}
          cx={150}
          cy={168 + dy}
          rx={Math.sqrt(78 * 78 - dy * dy)}
          ry={Math.sqrt(78 * 78 - dy * dy) * 0.22}
          fill="none"
          stroke={EMERALD}
          strokeWidth={2}
        />
      ))}
      <Label x={150} y={272} anchor="middle" size={10.5} fill={EMERALD}>
        Two standard parallels
      </Label>

      {showCone && (
        <>
          <path d="M 150 46 L 74 200 L 226 200 Z" fill="none" stroke={PENCIL} strokeWidth={1.4} strokeDasharray="5 4" />
          <Label x={150} y={38} anchor="middle" size={10} fill={PENCIL}>
            Secant cone
          </Label>
        </>
      )}

      <g transform="translate(300 60)">
        <rect x={0} y={0} width={176} height={166} fill="#fff" stroke={GRID} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={`m${i}`}
            d={`M ${20 + i * 34} 166 Q ${88} ${-80} ${88 + (20 + i * 34 - 88) * 0.34} 0`}
            fill="none"
            stroke={GRID}
            strokeWidth={0.9}
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={`p${i}`}
            d={`M 2 ${34 + i * 34} Q 88 ${34 + i * 34 - 14} 174 ${34 + i * 34}`}
            fill="none"
            stroke={GRID}
            strokeWidth={0.9}
          />
        ))}
        <line x1={26} y1={140} x2={152} y2={40} stroke={PLOT} strokeWidth={2} />
        <Label x={88} y={-10} anchor="middle" size={10.5} fill={PENCIL}>
          Flattened
        </Label>
        <Label x={88} y={186} anchor="middle" size={10} fill={PLOT}>
          A great circle plots as a straight line
        </Label>
      </g>

      <Label x={DIAGRAM_W / 2} y={22} anchor="middle" size={12.5}>
        A sphere is undevelopable. A cone is not.
      </Label>
    </Diagram>
  );
}

/** Great circles versus small circles. */
export function GreatCircles(props: DiagramProps) {
  const highlight = str<string>(props.highlight, "none");
  return (
    <Diagram title="Great circles and small circles">
      <Paper grid={false} />
      <circle cx={250} cy={155} r={110} fill="#e8eef2" stroke={BLUE} strokeWidth={1.4} />
      {/* Meridians: every one a great circle. */}
      {[0.25, 0.5, 0.75, 1].map((k, i) => (
        <ellipse
          key={`mer${i}`}
          cx={250}
          cy={155}
          rx={110 * k}
          ry={110}
          fill="none"
          stroke={highlight === "meridians" || highlight === "none" ? EMERALD : GRID}
          strokeWidth={highlight === "meridians" ? 2 : 1.2}
        />
      ))}
      {/* Parallels: only the equator is a great circle. */}
      {[-70, -40, 40, 70].map((dy) => {
        const r = Math.sqrt(Math.max(0, 110 * 110 - dy * dy));
        return (
          <ellipse
            key={`par${dy}`}
            cx={250}
            cy={155 + dy}
            rx={r}
            ry={r * 0.2}
            fill="none"
            stroke={highlight === "parallels" ? "#d92d20" : PENCIL}
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        );
      })}
      <ellipse
        cx={250}
        cy={155}
        rx={110}
        ry={22}
        fill="none"
        stroke={highlight === "equator" || highlight === "none" ? EMERALD : GRID}
        strokeWidth={highlight === "equator" ? 3 : 2}
      />
      <Label x={250} y={20} anchor="middle" size={12.5}>
        Every meridian is a great circle. Of the parallels, only the equator.
      </Label>
      <Label x={370} y={152} size={10.5} fill={EMERALD}>
        Equator
      </Label>
      <Label x={370} y={92} size={10.5} fill={PENCIL}>
        Small circles
      </Label>
      <Label x={250} y={288} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        A great circle&apos;s plane passes through the centre of the earth
      </Label>
    </Diagram>
  );
}

/* ================================================================== */
/* n3 — Direction                                                     */
/* ================================================================== */

/** Course, heading and track drawn as three separate lines from one point. */
export function CourseHeadingTrack(props: DiagramProps) {
  const show = str<string>(props.show, "all");
  const drift = num(props.drift, 12);
  const origin = { x: 90, y: 232 };
  const len = 300;
  const courseAngle = -34;
  const headingAngle = courseAngle - drift;
  const trackAngle = courseAngle + drift * 0.55;
  const at = (deg: number, d: number) => ({
    x: origin.x + Math.cos((deg * Math.PI) / 180) * d,
    y: origin.y + Math.sin((deg * Math.PI) / 180) * d,
  });
  const c = at(courseAngle, len);
  const h = at(headingAngle, len * 0.72);
  const t = at(trackAngle, len * 0.78);

  return (
    <Diagram title="Course, heading and track">
      <Paper />
      {/* Meridian, so the angles have a reference. */}
      <line x1={origin.x} y1={20} x2={origin.x} y2={280} stroke={GRID} strokeWidth={1.4} />
      <Label x={origin.x} y={16} anchor="middle" size={9.5} fill={PENCIL}>
        TRUE N
      </Label>

      {(show === "all" || show === "course") && (
        <>
          <line x1={origin.x} y1={origin.y} x2={c.x} y2={c.y} stroke={INK} strokeWidth={2.4} />
          <ArrowHead x={c.x} y={c.y} angle={courseAngle} color={INK} />
          <Label x={c.x - 96} y={c.y - 10} size={11} fill={INK}>
            COURSE — intended
          </Label>
        </>
      )}
      {(show === "all" || show === "heading") && (
        <>
          <line
            x1={origin.x}
            y1={origin.y}
            x2={h.x}
            y2={h.y}
            stroke={EMERALD}
            strokeWidth={2.2}
            strokeDasharray="7 4"
          />
          <ArrowHead x={h.x} y={h.y} angle={headingAngle} color={EMERALD} />
          <Label x={h.x + 6} y={h.y - 6} size={11} fill={EMERALD}>
            HEADING — pointed
          </Label>
        </>
      )}
      {(show === "all" || show === "track") && (
        <>
          <line x1={origin.x} y1={origin.y} x2={t.x} y2={t.y} stroke={PLOT} strokeWidth={2.2} />
          <ArrowHead x={t.x} y={t.y} angle={trackAngle} color={PLOT} />
          <Label x={t.x + 6} y={t.y + 16} size={11} fill={PLOT}>
            TRACK — achieved
          </Label>
        </>
      )}

      <circle cx={origin.x} cy={origin.y} r={4} fill={INK} />
      <Label x={origin.x + 8} y={origin.y + 18} size={10} fill={PENCIL}>
        Departure
      </Label>
      <Label x={250} y={286} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        The nose points into the wind; the aircraft goes somewhere else
      </Label>
    </Diagram>
  );
}

/** Variation as the angle between two norths, with isogonic lines. */
export function VariationChart(props: DiagramProps) {
  const east = num(props.east, 6);
  return (
    <Diagram title="Magnetic variation">
      <Paper />
      <g transform="translate(140 175)">
        <line x1={0} y1={0} x2={0} y2={-136} stroke={INK} strokeWidth={2.2} />
        <ArrowHead x={0} y={-136} angle={-90} color={INK} />
        <Label x={-4} y={-146} anchor="end" size={10.5}>
          TRUE N
        </Label>
        <line
          x1={0}
          y1={0}
          x2={Math.sin((east * Math.PI) / 180) * 136}
          y2={-Math.cos((east * Math.PI) / 180) * 136}
          stroke="#d92d20"
          strokeWidth={2.2}
        />
        <ArrowHead
          x={Math.sin((east * Math.PI) / 180) * 136}
          y={-Math.cos((east * Math.PI) / 180) * 136}
          angle={-90 + east}
          color="#d92d20"
        />
        <Label x={Math.sin((east * Math.PI) / 180) * 136 + 6} y={-Math.cos((east * Math.PI) / 180) * 136 - 6} size={10.5} fill="#d92d20">
          MAGNETIC N
        </Label>
        <path
          d={`M 0 -56 A 56 56 0 0 1 ${Math.sin((east * Math.PI) / 180) * 56} ${-Math.cos((east * Math.PI) / 180) * 56}`}
          fill="none"
          stroke={EMERALD}
          strokeWidth={1.6}
        />
        <Label x={20} y={-62} size={11} fill={EMERALD}>
          {east}° E
        </Label>
        <circle cx={0} cy={0} r={3.5} fill={INK} />
      </g>

      {/* Isogonic lines, dashed blue, as a TPC draws them. */}
      {[300, 350, 400, 450].map((x, i) => (
        <g key={x}>
          <path
            d={`M ${x} 40 Q ${x + 14} 155 ${x + 4} 268`}
            fill="none"
            stroke={BLUE}
            strokeWidth={1}
            strokeDasharray="7 5"
            opacity={0.8}
          />
          <text x={x + 6} y={158} fontSize={9.5} fontWeight={700} fill={BLUE}>
            {4 + i}°E
          </text>
        </g>
      ))}
      <Label x={375} y={26} anchor="middle" size={10.5} fill={BLUE}>
        Isogonic lines — equal variation
      </Label>

      <rect x={22} y={232} width={230} height={50} rx={8} fill="#fff" stroke={GRID} />
      <Label x={137} y={252} anchor="middle" size={11.5} fill={EMERALD}>
        MC = TC − East · MC = TC + West
      </Label>
      <Label x={137} y={270} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        East is least, and west is best
      </Label>
    </Diagram>
  );
}

/* ================================================================== */
/* n4 — Time                                                          */
/* ================================================================== */

/** The 24 zones, and where the sign convention comes from. */
export function TimeZones(props: DiagramProps) {
  const zd = num(props.zd, -6);
  return (
    <Diagram title="Time zones and the zone description">
      <Paper grid={false} />
      <rect x={26} y={72} width={448} height={96} fill="#e8eef2" stroke={GRID} />
      {Array.from({ length: 25 }, (_, i) => i).map((i) => {
        const x = 26 + (i * 448) / 24;
        const value = i - 12;
        const active = value === zd;
        return (
          <g key={i}>
            <line x1={x} y1={72} x2={x} y2={168} stroke={active ? EMERALD : GRID} strokeWidth={active ? 2 : 0.6} />
            {i % 3 === 0 && (
              <text x={x} y={186} textAnchor="middle" fontSize={9} fontWeight={700} fill={value === 0 ? EMERALD : PENCIL}>
                {value === 0 ? "Z" : value > 0 ? `+${value}` : value}
              </text>
            )}
          </g>
        );
      })}
      <rect x={26 + (12 * 448) / 24 - 1} y={72} width={448 / 24} height={96} fill={EMERALD} opacity={0.12} />
      <Label x={26 + (12 * 448) / 24 + 9} y={64} anchor="middle" size={10} fill={EMERALD}>
        Prime meridian
      </Label>
      <rect
        x={26 + ((zd + 12) * 448) / 24}
        y={72}
        width={448 / 24}
        height={96}
        fill={EMERALD}
        opacity={0.28}
      />

      <Label x={250} y={38} anchor="middle" size={12.5}>
        360° ÷ 24 h = 15° an hour, so 24 zones
      </Label>
      <rect x={100} y={210} width={300} height={62} rx={8} fill="#fff" stroke={GRID} />
      <Label x={250} y={232} anchor="middle" size={12} fill={EMERALD}>
        GMT (Z) = LMT − (ZD)
      </Label>
      <Label x={250} y={252} anchor="middle" size={12} fill={EMERALD}>
        LMT = GMT + (ZD)
      </Label>
      <Label x={250} y={268} anchor="middle" size={9.5} weight={600} fill={PENCIL}>
        Subtracting a negative adds
      </Label>
    </Diagram>
  );
}

/* ================================================================== */
/* n5 — Chart work                                                    */
/* ================================================================== */

/** The plotter, named, with the reversed scale called out. */
export function PlotterAnatomy(props: DiagramProps) {
  const highlight = str<string>(props.highlight, "none");
  const cx = 250;
  const cy = 178;
  const r = 96;
  return (
    <Diagram title="The plotter">
      <Paper />
      <line x1={cx} y1={26} x2={cx} y2={286} stroke={GRID} strokeWidth={1.6} />
      <Label x={cx + 6} y={38} size={9} fill={PENCIL}>
        meridian
      </Label>

      <rect
        x={cx - 200}
        y={cy - 8}
        width={400}
        height={16}
        fill="rgba(255,255,255,0.6)"
        stroke={highlight === "straightedge" ? EMERALD : INK}
        strokeWidth={highlight === "straightedge" ? 2.4 : 1}
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy} Z`}
        fill="rgba(255,255,255,0.5)"
        stroke={INK}
        strokeWidth={1}
      />
      {Array.from({ length: 19 }, (_, i) => i * 10).map((deg) => {
        const a = ((deg - 180) * Math.PI) / 180;
        const inner = deg % 30 === 0 ? r - 16 : r - 9;
        return (
          <g key={deg}>
            <line
              x1={cx + r * Math.cos(a)}
              y1={cy - r * Math.sin(a)}
              x2={cx + inner * Math.cos(a)}
              y2={cy - inner * Math.sin(a)}
              stroke={INK}
              strokeWidth={deg % 30 === 0 ? 1.2 : 0.6}
            />
            {deg % 30 === 0 && (
              <text
                x={cx + (r - 28) * Math.cos(a)}
                y={cy - (r - 28) * Math.sin(a) + 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill={highlight === "outer" ? EMERALD : INK}
              >
                {String(deg === 0 ? 360 : deg).padStart(3, "0")}
              </text>
            )}
          </g>
        );
      })}
      {[0, 90, 180].map((deg) => {
        const a = ((deg - 180) * Math.PI) / 180;
        return (
          <text
            key={`ns${deg}`}
            x={cx + (r - 56) * Math.cos(a)}
            y={cy - (r - 56) * Math.sin(a) + 4}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill={highlight === "inner" ? EMERALD : BLUE}
          >
            {String(((450 - deg) % 360) || 360).padStart(3, "0")}
          </text>
        );
      })}

      <circle
        cx={cx}
        cy={cy}
        r={7}
        fill="none"
        stroke={highlight === "grommet" ? EMERALD : "#d92d20"}
        strokeWidth={highlight === "grommet" ? 3 : 2}
      />
      <circle cx={cx} cy={cy} r={2} fill="#d92d20" />

      <Label x={cx} y={cy + 30} anchor="middle" size={10} fill="#d92d20">
        GROMMET — put it on a meridian
      </Label>
      <Label x={30} y={cy - 16} size={10} fill={PENCIL}>
        STRAIGHTEDGE
      </Label>
      <Label x={250} y={24} anchor="middle" size={12}>
        Outer scale counts up to the LEFT
      </Label>
      <Label x={250} y={288} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        Two readings always present themselves. The estimate chooses.
      </Label>
    </Diagram>
  );
}

/** Speed marks up a meridian, at the size they are actually counted at. */
export function SpeedMarks() {
  const x = 150;
  return (
    <Diagram title="Counting distance up a meridian">
      <Paper />
      <line x1={x} y1={20} x2={x} y2={282} stroke={PENCIL} strokeWidth={1.6} />
      {Array.from({ length: 26 }, (_, i) => i).map((i) => {
        const y = 32 + i * 9.6;
        const ten = i % 10 === 0;
        const five = i % 5 === 0 && !ten;
        const left = ten ? 11 : five ? 8 : 4;
        const right = ten ? 11 : 0;
        return (
          <g key={i}>
            <line x1={x - left} y1={y} x2={x + right} y2={y} stroke={INK} strokeWidth={ten ? 1.5 : five ? 1.1 : 0.6} />
            {ten && (
              <text x={x + 18} y={y + 4} fontSize={10} fontWeight={700} fill={EMERALD}>
                {i} NM
              </text>
            )}
          </g>
        );
      })}
      <Label x={250} y={24} anchor="middle" size={12}>
        One minute of latitude is one nautical mile
      </Label>

      <g transform="translate(310 70)">
        <rect x={0} y={0} width={160} height={112} rx={8} fill="#fff" stroke={GRID} />
        <Label x={12} y={24} size={10.5} fill={EMERALD}>
          Ten-minute mark
        </Label>
        <Label x={12} y={40} size={9.5} weight={600} fill={PENCIL}>
          crosses the meridian
        </Label>
        <Label x={12} y={64} size={10.5} fill={EMERALD}>
          Five-minute mark
        </Label>
        <Label x={12} y={80} size={9.5} weight={600} fill={PENCIL}>
          stays on the left
        </Label>
        <Label x={12} y={102} size={9.5} weight={600} fill={PENCIL}>
          Round to the nearest tenth
        </Label>
      </g>
      <Label x={310} y={230} size={11} fill="#d92d20">
        Never count along a parallel
      </Label>
      <Label x={310} y={248} size={9.5} weight={600} fill={PENCIL}>
        A parallel is not a great circle;
      </Label>
      <Label x={310} y={262} size={9.5} weight={600} fill={PENCIL}>
        its minutes are short of a mile.
      </Label>
    </Diagram>
  );
}

/** A TACAN fix: radial converted to true, then plotted. */
export function TacanFix(props: DiagramProps) {
  const radial = num(props.radial, 135);
  const variation = num(props.variation, 7);
  const stage = str<string>(props.stage, "true");
  const cx = 180;
  const cy = 160;
  const trueRadial = radial + variation;
  const end = (deg: number, d: number) => ({
    x: cx + Math.sin((deg * Math.PI) / 180) * d,
    y: cy - Math.cos((deg * Math.PI) / 180) * d,
  });
  const magEnd = end(radial, 120);
  const trueEnd = end(trueRadial, 120);

  return (
    <Diagram title="Plotting a TACAN position fix">
      <Paper />
      <line x1={cx} y1={20} x2={cx} y2={286} stroke={GRID} strokeWidth={1.2} />
      <Label x={cx + 5} y={48} size={9} fill={PENCIL}>
        TRUE N
      </Label>

      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d={hex(cx, cy, 12)}
          fill="none"
          stroke={EMERALD}
          strokeWidth={1.4}
          opacity={i === 0 ? 1 : 0}
        />
      ))}
      <circle cx={cx} cy={cy} r={3} fill={EMERALD} />
      <Label x={cx - 8} y={cy - 18} anchor="end" size={10} fill={EMERALD}>
        STATION
      </Label>

      <line
        x1={cx}
        y1={cy}
        x2={magEnd.x}
        y2={magEnd.y}
        stroke="#d92d20"
        strokeWidth={1.6}
        strokeDasharray="6 4"
        opacity={stage === "true" ? 0.45 : 1}
      />
      <Label x={magEnd.x - 14} y={magEnd.y + 4} anchor="end" size={10} fill="#d92d20">
        {radial}° magnetic
      </Label>

      {stage === "true" && (
        <>
          <line x1={cx} y1={cy} x2={trueEnd.x} y2={trueEnd.y} className="plot-line" strokeWidth={2.2} />
          <circle cx={trueEnd.x} cy={trueEnd.y} r={5} fill="none" stroke={PLOT} strokeWidth={2} />
          <circle cx={trueEnd.x} cy={trueEnd.y} r={2} fill={PLOT} />
          <Label x={trueEnd.x - 14} y={trueEnd.y + 24} anchor="end" size={10.5} fill={PLOT}>
            {trueRadial}° true — the fix
          </Label>
        </>
      )}

      <rect x={296} y={216} width={186} height={66} rx={8} fill="#fff" stroke={GRID} />
      <Label x={389} y={238} anchor="middle" size={11.5} fill={EMERALD}>
        {radial} + {variation} = {trueRadial}
      </Label>
      <Label x={389} y={256} anchor="middle" size={10} weight={600} fill={PENCIL}>
        Magnetic → true, so east ADDS
      </Label>
      <Label x={389} y={272} anchor="middle" size={9.5} weight={600} fill="#d92d20">
        the reverse of the usual rule
      </Label>
      <Label x={250} y={24} anchor="middle" size={12}>
        The radial is magnetic. The chart is true.
      </Label>
    </Diagram>
  );
}

function hex(cx: number, cy: number, r: number): string {
  return (
    Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 - 90) * Math.PI) / 180;
      return `${i === 0 ? "M" : "L"} ${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    }).join(" ") + " Z"
  );
}

/* ================================================================== */
/* n6 — The CR-3                                                      */
/* ================================================================== */

/** The three indexes and what each is for. */
export function Cr3Indexes(props: DiagramProps) {
  const highlight = str<string>(props.highlight, "none");
  const cx = 250;
  const cy = 152;
  const r = 112;
  const marks = [
    { value: 60, label: "RATE", detail: "60 minutes = 1 hour", colour: EMERALD, key: "rate" },
    { value: 36, label: "SEC", detail: "3,600 seconds = 1 hour", colour: "#d92d20", key: "sec" },
    { value: 10, label: "UNIT", detail: "no time in the problem", colour: INK, key: "unit" },
  ];
  const angleFor = (v: number) => (Math.log10(v / 10) / 1) * 360;
  return (
    <Diagram title="The three indexes on the CR-3">
      <Paper grid={false} />
      <circle cx={cx} cy={cy} r={r + 22} fill="#fbfaf6" stroke={GRID} />
      <circle cx={cx} cy={cy} r={r} fill="#e7e4d8" stroke={GRID} />
      {Array.from({ length: 90 }, (_, i) => i * 4).map((deg) => (
        <line
          key={deg}
          x1={cx}
          y1={cy - r}
          x2={cx}
          y2={cy - r + 6}
          stroke={PENCIL}
          strokeWidth={0.4}
          transform={`rotate(${deg} ${cx} ${cy})`}
          opacity={0.5}
        />
      ))}
      {marks.map((m) => {
        const a = angleFor(m.value);
        const on = highlight === m.key || highlight === "none";
        return (
          <g key={m.key} transform={`rotate(${a} ${cx} ${cy})`} opacity={on ? 1 : 0.25}>
            <path
              d={`M ${cx} ${cy - r} l -9 16 l 18 0 Z`}
              fill={m.colour}
            />
            <text
              x={cx}
              y={cy - r + 34}
              textAnchor="middle"
              fontSize={10}
              fontWeight={800}
              fill={m.colour}
              transform={`rotate(${-a} ${cx} ${cy - r + 34})`}
            >
              {m.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={30} fill="#fbfaf6" stroke={GRID} />
      <Label x={cx} y={cy + 4} anchor="middle" size={11} fill={EMERALD}>
        CR-3
      </Label>

      {marks.map((m, i) => (
        <g key={`k${m.key}`} opacity={highlight === m.key || highlight === "none" ? 1 : 0.3}>
          <rect x={18} y={236 + 0} width={0} height={0} />
          <circle cx={40 + i * 158} cy={272} r={5} fill={m.colour} />
          <text x={52 + i * 158} y={268} fontSize={10.5} fontWeight={800} fill={m.colour}>
            {m.label} · {m.value}
          </text>
          <text x={52 + i * 158} y={282} fontSize={9} fontWeight={600} fill={PENCIL}>
            {m.detail}
          </text>
        </g>
      ))}
      <Label x={250} y={22} anchor="middle" size={12}>
        Which mark you set against is the first decision, every time
      </Label>
    </Diagram>
  );
}

/** Why the scale's tick marks are not evenly worth the same. */
export function LogScaleTicks() {
  const y = 150;
  const x0 = 40;
  const x1 = 460;
  const pos = (v: number) => px(x0 + (Math.log10(v / 10) / 1) * (x1 - x0));
  const bands = [
    { from: 10, to: 15, per: "1", colour: EMERALD },
    { from: 15, to: 30, per: "2", colour: BLUE },
    { from: 30, to: 60, per: "5", colour: "#d98200" },
    { from: 60, to: 100, per: "5", colour: PENCIL },
  ];
  return (
    <Diagram title="What one tick mark is worth">
      <Paper grid={false} />
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={INK} strokeWidth={1.6} />
      {bands.map((b) => (
        <g key={b.from}>
          <rect x={pos(b.from)} y={y - 42} width={pos(b.to) - pos(b.from)} height={30} fill={b.colour} opacity={0.12} />
          <text
            x={(pos(b.from) + pos(b.to)) / 2}
            y={y - 22}
            textAnchor="middle"
            fontSize={11}
            fontWeight={800}
            fill={b.colour}
          >
            {b.per} per tick
          </text>
        </g>
      ))}
      {Array.from({ length: 91 }, (_, i) => 10 + i).map((v) => {
        const whole = Number.isInteger(v);
        const major = v % 5 === 0 || v < 15;
        if (v > 60 && v % 10 !== 0) return null;
        if (v > 30 && v <= 60 && v % 5 !== 0) return null;
        return (
          <g key={v}>
            <line x1={pos(v)} y1={y} x2={pos(v)} y2={y + (major ? 12 : 7)} stroke={INK} strokeWidth={major ? 1 : 0.5} />
            {whole && (v < 16 || v % 10 === 0 || v === 15 || v === 25 || v === 35) && (
              <text x={pos(v)} y={y + 26} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={INK}>
                {v}
              </text>
            )}
          </g>
        );
      })}
      <Label x={250} y={26} anchor="middle" size={12}>
        The scale is logarithmic, so the graduation changes as you go round
      </Label>
      <Label x={250} y={228} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        ±1 unit on the log scale is defined against the 10-to-15 section — about ±1%
      </Label>
      <Label x={250} y={252} anchor="middle" size={10.5} weight={600} fill="#d92d20">
        Read a tick as the wrong value and the answer is plausible and wrong
      </Label>
    </Diagram>
  );
}

/* ================================================================== */
/* n7 — Altitude and airspeed                                         */
/* ================================================================== */

/** The five altitudes stacked, with what each is measured from. */
export function AltitudeLadder(props: DiagramProps) {
  const highlight = str<string>(props.highlight, "none");
  const rows = [
    { key: "absolute", label: "ABSOLUTE", detail: "Height above the ground (AGL)" },
    { key: "true", label: "TRUE", detail: "Height above mean sea level" },
    { key: "pressure", label: "PRESSURE", detail: "From 29.92 — the reference for TAS" },
    { key: "calibrated", label: "CALIBRATED", detail: "Indicated, corrected for instrument error" },
    { key: "indicated", label: "INDICATED", detail: "What the altimeter reads on the local setting" },
  ];
  return (
    <Diagram title="The five altitudes">
      <Paper grid={false} />
      <rect x={0} y={252} width={DIAGRAM_W} height={48} fill="#e6e0cc" />
      <path d="M 40 252 L 96 214 L 152 252 Z" fill="#cfc9b6" />
      <line x1={0} y1={230} x2={DIAGRAM_W} y2={230} stroke={BLUE} strokeWidth={1.2} strokeDasharray="6 4" />
      <Label x={8} y={226} size={9} fill={BLUE}>
        MSL
      </Label>
      {rows.map((row, i) => {
        const y = 34 + i * 38;
        const on = highlight === row.key || highlight === "none";
        return (
          <g key={row.key} opacity={on ? 1 : 0.3}>
            <rect
              x={130}
              y={y - 15}
              width={352}
              height={28}
              rx={6}
              fill={highlight === row.key ? "#e6f0ea" : "#fff"}
              stroke={highlight === row.key ? EMERALD : GRID}
            />
            <text x={142} y={y + 4} fontSize={10.5} fontWeight={800} fill={EMERALD}>
              {row.label}
            </text>
            <text x={232} y={y + 4} fontSize={10} fontWeight={600} fill={PENCIL}>
              {row.detail}
            </text>
          </g>
        );
      })}
      <Label x={62} y={140} anchor="middle" size={11} fill={PENCIL}>
        aircraft
      </Label>
      <path d="M 40 150 l 44 0 l 10 8 l -54 0 Z" fill={INK} />
      <Label x={250} y={20} anchor="middle" size={11.5}>
        Each one is measured from something different
      </Label>
    </Diagram>
  );
}

/** IAS to CAS to TAS to GS, as a chain of corrections. */
export function AirspeedChain(props: DiagramProps) {
  const stage = num(props.stage, 4);
  const steps = [
    { label: "IAS", note: "read off the dial" },
    { label: "CAS", note: "− instrument error" },
    { label: "TAS", note: "− air density" },
    { label: "GS", note: "± head / tail wind" },
  ];
  return (
    <Diagram title="From indicated airspeed to ground speed">
      <Paper grid={false} />
      {steps.map((s, i) => {
        const x = 30 + i * 118;
        const on = i < stage;
        return (
          <g key={s.label} opacity={on ? 1 : 0.25}>
            <rect x={x} y={110} width={98} height={64} rx={10} fill={on ? "#e6f0ea" : "#fff"} stroke={on ? EMERALD : GRID} strokeWidth={on ? 1.8 : 1} />
            <text x={x + 49} y={142} textAnchor="middle" fontSize={19} fontWeight={800} fill={EMERALD}>
              {s.label}
            </text>
            <text x={x + 49} y={162} textAnchor="middle" fontSize={9} fontWeight={600} fill={PENCIL}>
              {s.note}
            </text>
            {i < 3 && (
              <>
                <line x1={x + 100} y1={142} x2={x + 116} y2={142} stroke={on ? EMERALD : GRID} strokeWidth={2} />
                <ArrowHead x={x + 118} y={142} angle={0} color={on ? EMERALD : GRID} size={6} />
              </>
            )}
          </g>
        );
      })}
      <Label x={250} y={44} anchor="middle" size={12.5}>
        Four numbers, three corrections
      </Label>
      <Label x={250} y={70} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        Only the last one involves the wind. TAS is speed through the air mass.
      </Label>
      <Label x={250} y={220} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        Climb at a fixed IAS and TAS rises — the air is thinner up there
      </Label>
      <Label x={250} y={244} anchor="middle" size={10.5} weight={600} fill="#d92d20">
        TAS needs PRESSURE altitude, not true altitude
      </Label>
    </Diagram>
  );
}

/* ================================================================== */
/* n8 / n9 — The wind triangle                                        */
/* ================================================================== */

/** The three vectors, labelled, with the crab angle picked out. */
export function WindTriangle(props: DiagramProps) {
  const show = str<string>(props.show, "all");
  const crab = num(props.crab, 14);
  const a = { x: 70, y: 250 };
  const airLen = 250;
  const courseAngle = -30;
  const headingAngle = courseAngle - crab;
  const h = {
    x: a.x + Math.cos((headingAngle * Math.PI) / 180) * airLen,
    y: a.y + Math.sin((headingAngle * Math.PI) / 180) * airLen,
  };
  const windLen = 62;
  const windAngle = 44;
  const g = {
    x: h.x + Math.cos((windAngle * Math.PI) / 180) * windLen,
    y: h.y + Math.sin((windAngle * Math.PI) / 180) * windLen,
  };
  return (
    <Diagram title="The wind triangle">
      <Paper />
      {(show === "all" || show === "air") && (
        <>
          <line x1={a.x} y1={a.y} x2={h.x} y2={h.y} stroke={INK} strokeWidth={2.6} />
          <ArrowHead x={h.x} y={h.y} angle={headingAngle} color={INK} />
          <Label x={a.x + 46} y={a.y - 74} size={11} fill={INK}>
            AIR VECTOR
          </Label>
          <Label x={a.x + 46} y={a.y - 60} size={9.5} weight={600} fill={PENCIL}>
            true heading + TAS
          </Label>
        </>
      )}
      {(show === "all" || show === "wind") && (
        <>
          <line x1={h.x} y1={h.y} x2={g.x} y2={g.y} stroke={BLUE} strokeWidth={2.6} />
          <ArrowHead x={g.x} y={g.y} angle={windAngle} color={BLUE} />
          <Label x={h.x + 8} y={h.y - 10} size={11} fill={BLUE}>
            WIND VECTOR
          </Label>
        </>
      )}
      {(show === "all" || show === "ground") && (
        <>
          <line x1={a.x} y1={a.y} x2={g.x} y2={g.y} className="plot-line" strokeWidth={2.6} />
          <ArrowHead
            x={g.x}
            y={g.y}
            angle={(Math.atan2(g.y - a.y, g.x - a.x) * 180) / Math.PI}
            color={PLOT}
          />
          <Label x={a.x + 130} y={a.y - 26} size={11} fill={PLOT}>
            GROUND VECTOR
          </Label>
          <Label x={a.x + 130} y={a.y - 12} size={9.5} weight={600} fill={PENCIL}>
            course or track + groundspeed
          </Label>
        </>
      )}
      <path
        d={`M ${a.x + 76} ${a.y - 44} A 88 88 0 0 1 ${a.x + 82} ${a.y - 62}`}
        fill="none"
        stroke="#d98200"
        strokeWidth={2}
      />
      <Label x={a.x + 96} y={a.y - 52} size={10.5} fill="#d98200">
        crab
      </Label>
      <circle cx={a.x} cy={a.y} r={4} fill={INK} />
      <Label x={250} y={24} anchor="middle" size={12}>
        Air vector + wind vector = ground vector
      </Label>
      <Label x={250} y={288} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        Any two sides give the third — which is why one triangle solves both wind problems
      </Label>
    </Diagram>
  );
}

/** The four quarters, and what each does to heading and speed. */
export function QuarteringAnalysis(props: DiagramProps) {
  const highlight = str<string>(props.highlight, "none");
  const cx = 150;
  const cy = 152;
  const quarters = [
    { key: "leftHead", label: "LEFT HEAD", angle: -135, th: "TH < TC", gs: "GS < TAS" },
    { key: "rightHead", label: "RIGHT HEAD", angle: -45, th: "TH > TC", gs: "GS < TAS" },
    { key: "leftTail", label: "LEFT TAIL", angle: 135, th: "TH < TC", gs: "GS > TAS" },
    { key: "rightTail", label: "RIGHT TAIL", angle: 45, th: "TH > TC", gs: "GS > TAS" },
  ];
  return (
    <Diagram title="Quartering analysis">
      <Paper />
      <line x1={cx} y1={cy - 108} x2={cx} y2={cy + 108} stroke={INK} strokeWidth={2.4} />
      <ArrowHead x={cx} y={cy - 108} angle={-90} color={INK} />
      <Label x={cx} y={cy - 118} anchor="middle" size={10} fill={INK}>
        COURSE
      </Label>
      <line x1={cx - 108} y1={cy} x2={cx + 108} y2={cy} stroke={GRID} strokeWidth={1} />
      {quarters.map((q) => {
        const a = (q.angle * Math.PI) / 180;
        const on = highlight === q.key || highlight === "none";
        return (
          <g key={q.key} opacity={on ? 1 : 0.22}>
            <line
              x1={cx + Math.cos(a) * 92}
              y1={cy + Math.sin(a) * 92}
              x2={cx + Math.cos(a) * 34}
              y2={cy + Math.sin(a) * 34}
              stroke={BLUE}
              strokeWidth={2}
            />
            <ArrowHead
              x={cx + Math.cos(a) * 34}
              y={cy + Math.sin(a) * 34}
              angle={(q.angle + 180) % 360}
              color={BLUE}
              size={6}
            />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={4} fill={INK} />

      {quarters.map((q, i) => (
        <g key={`k${q.key}`} opacity={highlight === q.key || highlight === "none" ? 1 : 0.28}>
          <rect x={288} y={44 + i * 56} width={196} height={46} rx={7} fill="#fff" stroke={highlight === q.key ? EMERALD : GRID} />
          <text x={300} y={64 + i * 56} fontSize={10.5} fontWeight={800} fill={EMERALD}>
            {q.label}
          </text>
          <text x={300} y={80 + i * 56} fontSize={10} fontWeight={600} fill={PENCIL}>
            {q.th} · {q.gs}
          </text>
        </g>
      ))}
      <Label x={150} y={24} anchor="middle" size={11.5}>
        Name the quarter before the wheel
      </Label>
      <Label x={150} y={282} anchor="middle" size={10} weight={600} fill={PENCIL}>
        Wind arrows point the way the air goes
      </Label>
    </Diagram>
  );
}

/** The jet log's en-route section, as a shape to recognise. */
export function JetLogShape(props: DiagramProps) {
  const highlight = str<string>(props.highlight, "none");
  const cols = [
    { key: "fix", label: "FIX", w: 92 },
    { key: "cus", label: "CUS", w: 52 },
    { key: "dist", label: "DIST", w: 52 },
    { key: "ete", label: "ETE", w: 58 },
    { key: "eta", label: "ETA / ATA", w: 74 },
    { key: "fuel", label: "LEG FUEL", w: 72 },
    { key: "efr", label: "EFR / AFR", w: 78 },
  ];
  const rows = ["Blountstown", "Marianna", ""];
  const total = cols.reduce((s, c) => s + c.w, 0);
  const x0 = (DIAGRAM_W - total) / 2;
  return (
    <Diagram title="The en-route section of the jet log">
      <Paper grid={false} />
      <rect x={x0 - 8} y={62} width={total + 16} height={150} rx={6} fill={PAPER} stroke={GRID} />
      {cols.map((c, i) => {
        const x = x0 + cols.slice(0, i).reduce((s, cc) => s + cc.w, 0);
        const on = highlight === c.key;
        return (
          <g key={c.key}>
            <rect x={x} y={70} width={c.w} height={26} fill={on ? EMERALD : "#e6f0ea"} stroke={GRID} />
            <text
              x={x + c.w / 2}
              y={87}
              textAnchor="middle"
              fontSize={9}
              fontWeight={800}
              fill={on ? "#fff" : EMERALD}
            >
              {c.label}
            </text>
            {rows.map((r, ri) => (
              <g key={ri}>
                <rect x={x} y={96 + ri * 34} width={c.w} height={34} fill={on ? "#e6f0ea" : "transparent"} stroke={GRID} strokeWidth={0.6} />
                {c.key === "fix" && (
                  <text x={x + 6} y={117 + ri * 34} fontSize={9.5} fontWeight={600} fill={PENCIL}>
                    {r}
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}
      <Label x={250} y={44} anchor="middle" size={12}>
        Primary purpose: fuel management
      </Label>
      <Label x={250} y={240} anchor="middle" size={10.5} weight={600} fill={PENCIL}>
        Each line starts where the line above it finished
      </Label>
      <Label x={250} y={262} anchor="middle" size={10.5} weight={600} fill={EMERALD}>
        EFR at a fix = the previous EFR − this leg&apos;s fuel
      </Label>
    </Diagram>
  );
}

/** The four planning steps and the four updating steps, side by side. */
export function PlanVersusConduct(props: DiagramProps) {
  const side = str<string>(props.side, "both");
  const plan = [
    "Measure courses and distances",
    "Preflight winds → heading and GS",
    "Ground speed → ETE",
    "ETE and fuel flow → leg fuel",
  ];
  const conduct = [
    "Plot the fix, measure track and distance",
    "Measure the new course to the turn point",
    "Determine the ACTUAL winds",
    "Apply them, update ETA and EFR",
  ];
  const column = (items: string[], x: number, title: string, colour: string, dim: boolean) => (
    <g opacity={dim ? 0.25 : 1}>
      <rect x={x} y={48} width={214} height={228} rx={10} fill="#fff" stroke={colour} strokeWidth={1.4} />
      <text x={x + 107} y={72} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={colour}>
        {title}
      </text>
      {items.map((t, i) => (
        <g key={i}>
          <circle cx={x + 22} cy={104 + i * 44} r={9} fill={colour} />
          <text x={x + 22} y={108 + i * 44} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">
            {i + 1}
          </text>
          <foreignObject x={x + 38} y={92 + i * 44} width={166} height={40}>
            <div style={{ fontSize: 9.6, lineHeight: 1.3, color: PENCIL, fontFamily: "inherit" }}>{t}</div>
          </foreignObject>
        </g>
      ))}
    </g>
  );
  return (
    <Diagram title="Flight planning and flight conduct">
      <Paper grid={false} />
      {column(plan, 22, "PLANNING", EMERALD, side === "conduct")}
      {column(conduct, 264, "CONDUCT", BLUE, side === "plan")}
      <Label x={250} y={30} anchor="middle" size={11.5}>
        Same four operations, different starting point
      </Label>
      <Label x={250} y={292} anchor="middle" size={10} weight={600} fill={PENCIL}>
        Off course, you do not turn back to the line — you replan direct from the fix
      </Label>
    </Diagram>
  );
}
