"use client";

/**
 * The chart workspace: a Lambert sheet, a plotter and a pair of dividers.
 *
 * The instruments behave the way the physical ones do. The plotter has a
 * grommet, a straightedge and the reversed outer scale the guide warns about;
 * the dividers hold a span you carry to a meridian and count. Neither prints
 * an answer, because the answer is the reading, and reading is the skill the
 * chart lessons exist to build.
 *
 * The sheet itself is generated — see src/lib/nav/chart.ts. It says so on the
 * face, and no problem in the course depends on it resembling any real chart.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import {
  Crosshair,
  Eraser,
  Minus,
  MousePointer2,
  Pencil,
  Plus,
  Ruler,
  Split,
} from "lucide-react";
import {
  CHART_BOUNDS,
  CHART_FEATURES,
  CHART_SCALE,
  COASTLINE,
  ISOGONIC_LINES,
  type ChartFeature,
  meridianTicks,
  meridians,
  parallels,
  project,
  unproject,
} from "@/lib/nav/chart";
import { formatLat, formatLon, type LatLon } from "@/lib/nav/math";
import { cn } from "../ui";

/* ------------------------------------------------------------------ */
/* Sheet geometry                                                      */
/* ------------------------------------------------------------------ */

/** Corners of the sheet in projected nautical miles, for the initial view. */
const SHEET = (() => {
  const corners = [
    project({ lat: CHART_BOUNDS.north, lonW: CHART_BOUNDS.west }),
    project({ lat: CHART_BOUNDS.north, lonW: CHART_BOUNDS.east }),
    project({ lat: CHART_BOUNDS.south, lonW: CHART_BOUNDS.west }),
    project({ lat: CHART_BOUNDS.south, lonW: CHART_BOUNDS.east }),
  ];
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  return {
    minX: Math.min(...xs) - 8,
    maxX: Math.max(...xs) + 8,
    minY: Math.min(...ys) - 8,
    maxY: Math.max(...ys) + 8,
  };
})();

const SHEET_W = SHEET.maxX - SHEET.minX;
const SHEET_H = SHEET.maxY - SHEET.minY;

export type ChartTool = "pointer" | "pencil" | "plotter" | "dividers";

export interface PlottedPoint {
  id: string;
  lat: number;
  lonW: number;
  label?: string;
}

export interface PlottedLine {
  id: string;
  from: LatLon;
  to: LatLon;
}

export interface ChartWorkspaceProps {
  /** Points pre-drawn on the sheet, e.g. a route a mission hands you. */
  initialPoints?: PlottedPoint[];
  initialLines?: PlottedLine[];
  /** Names the grommet, the scales and the speed marks. */
  training?: boolean;
  /** Called whenever the student's work changes, for "check my plot". */
  onWorkChange?: (work: { points: PlottedPoint[]; lines: PlottedLine[] }) => void;
  height?: number;
}

export function ChartWorkspace({
  initialPoints = [],
  initialLines = [],
  training = true,
  onWorkChange,
  height = 460,
}: ChartWorkspaceProps) {
  const [tool, setTool] = useState<ChartTool>("pointer");
  const [points, setPoints] = useState<PlottedPoint[]>(initialPoints);
  const [lines, setLines] = useState<PlottedLine[]>(initialLines);
  const [pendingLine, setPendingLine] = useState<LatLon | null>(null);
  const [inspect, setInspect] = useState<LatLon | null>(null);

  // Viewport in projected NM.
  const [view, setView] = useState({ x: SHEET.minX, y: SHEET.minY, w: SHEET_W });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const aspect = height / 760;
  const viewH = view.w * aspect;

  const commit = useCallback(
    (nextPoints: PlottedPoint[], nextLines: PlottedLine[]) => {
      setPoints(nextPoints);
      setLines(nextLines);
      onWorkChange?.({ points: nextPoints, lines: nextLines });
    },
    [onWorkChange],
  );

  /** Screen event → projected chart coordinates. */
  const toChart = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: view.x + ((event.clientX - rect.left) / rect.width) * view.w,
        y: view.y + ((event.clientY - rect.top) / rect.height) * viewH,
      };
    },
    [view, viewH],
  );

  /* ---------------- Panning and zooming ---------------- */
  const pan = useRef<{ x: number; y: number; viewX: number; viewY: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent) => {
    if (tool !== "pointer") return;
    (event.target as Element).setPointerCapture?.(event.pointerId);
    pan.current = { x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const p = pan.current;
    if (!p || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const dx = ((event.clientX - p.x) / rect.width) * view.w;
    const dy = ((event.clientY - p.y) / rect.height) * viewH;
    setView((v) => ({ ...v, x: p.viewX - dx, y: p.viewY - dy }));
  };

  const onPointerUp = () => {
    pan.current = null;
  };

  const zoom = (factor: number) => {
    setView((v) => {
      const w = Math.min(SHEET_W, Math.max(24, v.w * factor));
      const cx = v.x + v.w / 2;
      const cy = v.y + (v.w * aspect) / 2;
      return { x: cx - w / 2, y: cy - (w * aspect) / 2, w };
    });
  };

  /* ---------------- Clicking the sheet ---------------- */
  const onClick = (event: React.MouseEvent) => {
    const chartXY = toChart(event);
    const ll = unproject(chartXY);

    if (tool === "pointer") {
      setInspect(ll);
      return;
    }
    if (tool === "pencil") {
      if (pendingLine) {
        commit(points, [
          ...lines,
          { id: `line-${lines.length}-${Math.round(chartXY.x)}`, from: pendingLine, to: ll },
        ]);
        setPendingLine(null);
      } else {
        const id = `pt-${points.length}-${Math.round(chartXY.x)}`;
        commit([...points, { id, lat: ll.lat, lonW: ll.lonW }], lines);
        setPendingLine(ll);
      }
    }
  };

  const clearWork = () => {
    commit([], []);
    setPendingLine(null);
    setInspect(null);
  };

  /* ---------------- Layers ---------------- */
  const graticule = useMemo(() => ({ mer: meridians(), par: parallels() }), []);
  const visibleTickMeridians = useMemo(
    () => graticule.mer.filter((m) => m.major || view.w < 150),
    [graticule.mer, view.w],
  );

  const path = (pts: LatLon[]) =>
    pts
      .map((p, i) => {
        const xy = project(p);
        return `${i === 0 ? "M" : "L"} ${xy.x.toFixed(2)} ${xy.y.toFixed(2)}`;
      })
      .join(" ");

  /** A meridian or parallel drawn as a curve, since a conic bends them. */
  const graticulePath = (kind: "meridian" | "parallel", value: number) => {
    const steps = 24;
    const pts: LatLon[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push(
        kind === "meridian"
          ? { lat: CHART_BOUNDS.south + t * (CHART_BOUNDS.north - CHART_BOUNDS.south), lonW: value }
          : { lat: value, lonW: CHART_BOUNDS.east + t * (CHART_BOUNDS.west - CHART_BOUNDS.east) },
      );
    }
    return path(pts);
  };

  return (
    <div className="space-y-2">
      <ChartToolbar
        tool={tool}
        onTool={setTool}
        onZoomIn={() => zoom(0.7)}
        onZoomOut={() => zoom(1.4)}
        onClear={clearWork}
        onFit={() => setView({ x: SHEET.minX, y: SHEET.minY, w: SHEET_W })}
      />

      <div
        className="chart-paper relative overflow-hidden rounded-xl"
        style={{ height }}
      >
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${viewH}`}
          className={cn(
            "block h-full w-full touch-none select-none",
            tool === "pointer" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair",
          )}
          role="img"
          aria-label="Training navigation chart"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onClick={onClick}
        >
          {/* ---- Water ---- */}
          <rect
            x={SHEET.minX}
            y={SHEET.minY}
            width={SHEET_W}
            height={SHEET_H}
            fill="var(--color-chart-water)"
          />
          {/* ---- Land ---- */}
          <path
            d={`${path([
              { lat: CHART_BOUNDS.north, lonW: CHART_BOUNDS.west },
              { lat: CHART_BOUNDS.north, lonW: CHART_BOUNDS.east },
            ])} L ${project({ lat: COASTLINE[COASTLINE.length - 1].lat, lonW: CHART_BOUNDS.east }).x} ${project({ lat: COASTLINE[COASTLINE.length - 1].lat, lonW: CHART_BOUNDS.east }).y} ${path([...COASTLINE].reverse()).replace(/^M/, "L")} Z`}
            fill="#f3f0e4"
          />
          <path d={path(COASTLINE)} fill="none" stroke="#a8a48f" strokeWidth={0.6} />

          {/* ---- Graticule ---- */}
          {graticule.par.map((p) => (
            <path
              key={`par-${p.value}`}
              d={graticulePath("parallel", p.value)}
              className={p.major ? "chart-grid-line-major" : "chart-grid-line"}
            />
          ))}
          {graticule.mer.map((m) => (
            <path
              key={`mer-${m.value}`}
              d={graticulePath("meridian", m.value)}
              className={m.major ? "chart-grid-line-major" : "chart-grid-line"}
            />
          ))}

          {/* ---- Speed marks up the meridians ---- */}
          {visibleTickMeridians.map((m) => (
            <g key={`tick-${m.value}`}>
              {meridianTicks(m.value).map((t) => {
                const at = project({ lat: t.lat, lonW: m.value });
                const len = t.kind === "ten" ? 1.5 : t.kind === "five" ? 1.1 : 0.6;
                const left = t.kind === "ten" ? -len : -len;
                const right = t.kind === "ten" ? len : 0;
                return (
                  <line
                    key={t.lat}
                    x1={at.x + left}
                    y1={at.y}
                    x2={at.x + right}
                    y2={at.y}
                    stroke="var(--color-pencil)"
                    strokeWidth={t.kind === "minute" ? 0.16 : 0.28}
                    opacity={t.kind === "minute" ? 0.55 : 0.9}
                  />
                );
              })}
            </g>
          ))}

          {/* ---- Graticule labels ---- */}
          {graticule.par
            .filter((p) => p.major)
            .map((p) => {
              const at = project({ lat: p.value, lonW: CHART_BOUNDS.west });
              return (
                <text
                  key={`pl-${p.value}`}
                  x={at.x + 2}
                  y={at.y - 1.5}
                  fontSize={Math.max(2.4, view.w / 90)}
                  className="figure"
                  fill="var(--color-pencil)"
                >
                  {p.label}
                </text>
              );
            })}
          {graticule.mer
            .filter((m) => m.major)
            .map((m) => {
              const at = project({ lat: CHART_BOUNDS.south, lonW: m.value });
              return (
                <text
                  key={`ml-${m.value}`}
                  x={at.x}
                  y={at.y - 2}
                  textAnchor="middle"
                  fontSize={Math.max(2.4, view.w / 90)}
                  className="figure"
                  fill="var(--color-pencil)"
                >
                  {m.label}
                </text>
              );
            })}

          {/* ---- Isogonic lines ---- */}
          {ISOGONIC_LINES.map((line) => {
            const pts: LatLon[] = [];
            for (let i = 0; i <= 12; i++) {
              const t = i / 12;
              pts.push({
                lat: CHART_BOUNDS.south + t * (CHART_BOUNDS.north - CHART_BOUNDS.south),
                lonW: line.lonAtSouth + t * (line.lonAtNorth - line.lonAtSouth),
              });
            }
            const mid = project(pts[7]);
            return (
              <g key={line.variationEast}>
                <path d={path(pts)} className="isogonic-line" strokeWidth={0.35} />
                <text
                  x={mid.x + 2}
                  y={mid.y}
                  fontSize={Math.max(2.6, view.w / 85)}
                  className="figure"
                  fill="var(--color-series-alt)"
                  fontWeight={700}
                >
                  {line.variationEast}°E
                </text>
              </g>
            );
          })}

          {/* ---- Features ---- */}
          {CHART_FEATURES.map((f) => (
            <FeatureMark key={f.id} feature={f} scale={view.w} />
          ))}

          {/* ---- The student's work ---- */}
          {lines.map((l) => {
            const a = project(l.from);
            const b = project(l.to);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
            return (
              <g key={l.id}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="plot-line"
                  strokeWidth={Math.max(0.35, view.w / 700)}
                />
                {/* The single arrow the guide asks for, to fix the direction. */}
                <path
                  d={`M ${mx} ${my} l -2.4 -1.2 l 0 2.4 Z`}
                  fill="var(--color-plot)"
                  transform={`rotate(${ang} ${mx} ${my})`}
                />
              </g>
            );
          })}
          {points.map((p) => {
            const at = project(p);
            const r = Math.max(0.5, view.w / 420);
            return (
              <g key={p.id}>
                <circle cx={at.x} cy={at.y} r={r} fill="var(--color-plot)" />
                <circle
                  cx={at.x}
                  cy={at.y}
                  r={r * 3}
                  fill="none"
                  stroke="var(--color-plot)"
                  strokeWidth={r * 0.5}
                />
              </g>
            );
          })}

          {/* ---- Instruments ---- */}
          {tool === "plotter" && <Plotter view={view} viewH={viewH} training={training} />}
          {tool === "dividers" && <Dividers view={view} viewH={viewH} />}
        </svg>

        {/* ---- Sheet legend ---- */}
        <div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-surface/85 px-2 py-1 backdrop-blur-sm">
          <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-navy-soft">
            Training chart · Lambert conformal · {CHART_SCALE}
          </p>
          <p className="text-[9px] leading-tight text-navy-faint">
            Generated for practice. Place names are invented.
          </p>
        </div>

        {inspect && (
          <div className="pointer-events-none absolute right-2 top-2 rounded-lg bg-ink-800/92 px-2.5 py-1.5 text-white backdrop-blur-sm">
            <p className="eyebrow text-[9px] text-white/60">Cursor</p>
            <p className="figure text-[12px] font-bold leading-tight">{formatLat(inspect.lat)}</p>
            <p className="figure text-[12px] font-bold leading-tight">{formatLon(inspect.lonW)}</p>
          </div>
        )}
      </div>

      <p className="text-[11px] leading-relaxed text-navy-faint">
        {tool === "pointer" && "Drag to pan, tap to read a position off the sheet."}
        {tool === "pencil" &&
          (pendingLine
            ? "Tap the second point to draw the course line."
            : "Tap to mark a point. Tap again to run a course line from it.")}
        {tool === "plotter" &&
          "Drag the body to move it, drag the arm to rotate. Put the grommet on a meridian, then read the outer scale — remember it counts up to the left."}
        {tool === "dividers" &&
          "Drag each tip onto the two points, then carry the span to a meridian and count the marks. Ten-minute marks cross the line; five-minute marks sit to its left."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Toolbar                                                             */
/* ------------------------------------------------------------------ */

function ChartToolbar({
  tool,
  onTool,
  onZoomIn,
  onZoomOut,
  onClear,
  onFit,
}: {
  tool: ChartTool;
  onTool: (t: ChartTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClear: () => void;
  onFit: () => void;
}) {
  const items: { id: ChartTool; label: string; icon: typeof Pencil }[] = [
    { id: "pointer", label: "Read", icon: MousePointer2 },
    { id: "pencil", label: "Pencil", icon: Pencil },
    { id: "plotter", label: "Plotter", icon: Ruler },
    { id: "dividers", label: "Dividers", icon: Split },
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div className="flex overflow-hidden rounded-lg border border-line-strong">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTool(item.id)}
            aria-pressed={tool === item.id}
            className={cn(
              "flex h-8 items-center gap-1.5 px-2.5 text-[11.5px] font-semibold transition-colors",
              tool === item.id
                ? "bg-brand text-white"
                : "bg-surface text-navy-soft hover:bg-surface-2 hover:text-navy",
            )}
          >
            <item.icon size={13} />
            {item.label}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <SmallButton onClick={onZoomOut} label="Zoom out">
          <Minus size={13} />
        </SmallButton>
        <SmallButton onClick={onZoomIn} label="Zoom in">
          <Plus size={13} />
        </SmallButton>
        <SmallButton onClick={onFit} label="Fit the sheet">
          <Crosshair size={13} />
        </SmallButton>
        <SmallButton onClick={onClear} label="Erase your work">
          <Eraser size={13} />
        </SmallButton>
      </div>
    </div>
  );
}

function SmallButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line-strong bg-surface text-navy-soft transition-colors hover:bg-surface-2 hover:text-navy"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

function FeatureMark({ feature, scale }: { feature: ChartFeature; scale: number }) {
  const at = project(feature);
  const s = Math.max(0.9, scale / 260);
  const label = Math.max(2.2, scale / 95);

  return (
    <g>
      {feature.kind === "tacan" && (
        <>
          <path
            d={hexagon(at.x, at.y, s * 3)}
            fill="none"
            stroke="var(--color-brand-dark)"
            strokeWidth={s * 0.34}
          />
          <circle cx={at.x} cy={at.y} r={s * 0.7} fill="var(--color-brand-dark)" />
        </>
      )}
      {feature.kind === "airfield" && (
        <>
          <circle
            cx={at.x}
            cy={at.y}
            r={s * 2.1}
            fill="none"
            stroke="var(--color-ink-700)"
            strokeWidth={s * 0.3}
          />
          <line
            x1={at.x - s * 2.1}
            y1={at.y}
            x2={at.x + s * 2.1}
            y2={at.y}
            stroke="var(--color-ink-700)"
            strokeWidth={s * 0.3}
          />
        </>
      )}
      {feature.kind === "tower" && (
        <path
          d={`M ${at.x} ${at.y} l ${-s * 1.5} ${s * 2.6} l ${s * 3} 0 Z`}
          fill="var(--color-nogo)"
          opacity={0.85}
        />
      )}
      {feature.kind === "town" && (
        <rect
          x={at.x - s * 1.6}
          y={at.y - s * 1.2}
          width={s * 3.2}
          height={s * 2.4}
          fill="#c9b98f"
          stroke="var(--color-pencil)"
          strokeWidth={s * 0.2}
        />
      )}
      {feature.kind === "island" && (
        <ellipse cx={at.x} cy={at.y} rx={s * 3} ry={s * 1.6} fill="#e6e0cc" stroke="#a8a48f" strokeWidth={s * 0.2} />
      )}
      {feature.kind === "platform" && (
        <rect
          x={at.x - s * 1.1}
          y={at.y - s * 1.1}
          width={s * 2.2}
          height={s * 2.2}
          fill="none"
          stroke="var(--color-ink-700)"
          strokeWidth={s * 0.3}
          transform={`rotate(45 ${at.x} ${at.y})`}
        />
      )}
      <text
        x={at.x + s * 3.6}
        y={at.y + label * 0.34}
        fontSize={label}
        fontWeight={feature.kind === "tacan" ? 800 : 600}
        fill={feature.kind === "tacan" ? "var(--color-brand-dark)" : "var(--color-ink-700)"}
      >
        {feature.name}
        {feature.channel !== undefined ? ` ${feature.channel}` : ""}
        {feature.heightFt !== undefined ? ` ${feature.heightFt}'` : ""}
      </text>
    </g>
  );
}

function hexagon(cx: number, cy: number, r: number): string {
  return (
    Array.from({ length: 6 }, (_, i) => {
      const a = ((i * 60 - 90) * Math.PI) / 180;
      return `${i === 0 ? "M" : "L"} ${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ") + " Z"
  );
}

/* ------------------------------------------------------------------ */
/* The plotter                                                         */
/* ------------------------------------------------------------------ */

interface ViewBox {
  x: number;
  y: number;
  w: number;
}

/**
 * A CP-1LX-style plotter: straightedge, protractor, grommet, and the outer
 * scale that counts anticlockwise — the detail the guide calls out twice,
 * because reading it the intuitive way puts you exactly ten degrees or a
 * hundred and eighty degrees out.
 */
function Plotter({ view, viewH, training }: { view: ViewBox; viewH: number; training: boolean }) {
  const [pos, setPos] = useState({ x: view.x + view.w * 0.5, y: view.y + viewH * 0.55 });
  const [angle, setAngle] = useState(0);
  const dragRef = useRef<{ mode: "move" | "rotate"; ox: number; oy: number; start: number } | null>(
    null,
  );

  /** The plotter is drawn at a fixed size relative to the visible sheet. */
  const s = view.w / 12;

  const onDown = (mode: "move" | "rotate") => (event: React.PointerEvent) => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    dragRef.current = { mode, ox: event.clientX, oy: event.clientY, start: angle };
  };

  const onMove = (event: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    event.stopPropagation();
    const svg = (event.currentTarget as SVGGElement).ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (d.mode === "move") {
      const dx = ((event.clientX - d.ox) / rect.width) * view.w;
      const dy = ((event.clientY - d.oy) / rect.height) * viewH;
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      dragRef.current = { ...d, ox: event.clientX, oy: event.clientY };
    } else {
      const cx = rect.left + ((pos.x - view.x) / view.w) * rect.width;
      const cy = rect.top + ((pos.y - view.y) / viewH) * rect.height;
      setAngle((Math.atan2(event.clientX - cx, -(event.clientY - cy)) * 180) / Math.PI);
    }
  };

  const onUp = () => {
    dragRef.current = null;
  };

  const ticks = Array.from({ length: 37 }, (_, i) => i * 5);

  return (
    <g
      transform={`translate(${pos.x} ${pos.y}) rotate(${angle})`}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      style={{ opacity: 0.94 }}
    >
      {/* Straightedge */}
      <rect
        x={-s * 3.4}
        y={-s * 0.14}
        width={s * 6.8}
        height={s * 0.28}
        fill="rgba(255,255,255,0.5)"
        stroke="var(--color-ink-700)"
        strokeWidth={s * 0.018}
        onPointerDown={onDown("move")}
        className="cursor-move"
      />
      <line
        x1={-s * 3.4}
        y1={0}
        x2={s * 3.4}
        y2={0}
        stroke="var(--color-ink-800)"
        strokeWidth={s * 0.014}
      />

      {/* Protractor body */}
      <path
        d={`M ${-s * 1.9} 0 A ${s * 1.9} ${s * 1.9} 0 0 0 ${s * 1.9} 0 Z`}
        fill="rgba(255,255,255,0.42)"
        stroke="var(--color-ink-700)"
        strokeWidth={s * 0.018}
        onPointerDown={onDown("move")}
        className="cursor-move"
      />

      {/* Outer scale. Numbers increase to the LEFT, as the real plotter does. */}
      {ticks.map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        if (Math.sin(a) < -0.02) return null;
        const r1 = s * 1.9;
        const r2 = s * (deg % 10 === 0 ? 1.72 : 1.8);
        return (
          <g key={deg}>
            <line
              x1={r1 * Math.cos(a)}
              y1={r1 * Math.sin(a)}
              x2={r2 * Math.cos(a)}
              y2={r2 * Math.sin(a)}
              stroke="var(--color-ink-800)"
              strokeWidth={s * (deg % 30 === 0 ? 0.02 : 0.012)}
            />
            {deg % 30 === 0 && (
              <text
                x={s * 1.56 * Math.cos(a)}
                y={s * 1.56 * Math.sin(a) + s * 0.05}
                textAnchor="middle"
                fontSize={s * 0.15}
                fontWeight={700}
                fill="var(--color-ink-800)"
              >
                {String(((360 - deg) % 360) || 360).padStart(3, "0")}
              </text>
            )}
          </g>
        );
      })}

      {/* Inner north/south scale, for course lines that run up and down. */}
      {ticks
        .filter((d) => d % 30 === 0)
        .map((deg) => {
          const a = ((deg - 90) * Math.PI) / 180;
          if (Math.sin(a) < -0.02) return null;
          return (
            <text
              key={`ns-${deg}`}
              x={s * 1.16 * Math.cos(a)}
              y={s * 1.16 * Math.sin(a) + s * 0.04}
              textAnchor="middle"
              fontSize={s * 0.12}
              fontWeight={600}
              fill="var(--color-series-alt)"
            >
              {String(((450 - deg) % 360) || 360).padStart(3, "0")}
            </text>
          );
        })}

      {/* Grommet */}
      <circle cx={0} cy={0} r={s * 0.13} fill="none" stroke="var(--color-nogo)" strokeWidth={s * 0.03} />
      <circle cx={0} cy={0} r={s * 0.03} fill="var(--color-nogo)" />

      {/* Rotation handle */}
      <g onPointerDown={onDown("rotate")} className="cursor-grab active:cursor-grabbing">
        <circle cx={s * 3.0} cy={0} r={s * 0.3} fill="var(--color-brand)" opacity={0.9} />
        <circle cx={s * 3.0} cy={0} r={s * 0.12} fill="#fff" />
      </g>

      {training && (
        <>
          <text
            x={0}
            y={s * 0.55}
            textAnchor="middle"
            fontSize={s * 0.13}
            fontWeight={800}
            letterSpacing="0.1em"
            fill="var(--color-nogo)"
          >
            GROMMET
          </text>
          <text
            x={-s * 2.5}
            y={-s * 0.3}
            fontSize={s * 0.12}
            fontWeight={700}
            fill="var(--color-navy-faint)"
          >
            STRAIGHTEDGE
          </text>
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* The dividers                                                        */
/* ------------------------------------------------------------------ */

/**
 * Two points and a span. Deliberately no readout: on a real pair you set the
 * span across the leg, carry it to a meridian, and count. The "carry" button
 * does the carrying, which is the fiddly part on a screen; the counting stays
 * with the student.
 */
function Dividers({ view, viewH }: { view: ViewBox; viewH: number }) {
  const s = view.w / 12;
  const [a, setA] = useState({ x: view.x + view.w * 0.34, y: view.y + viewH * 0.42 });
  const [b, setB] = useState({ x: view.x + view.w * 0.5, y: view.y + viewH * 0.52 });
  const dragRef = useRef<"a" | "b" | null>(null);

  const onDown = (which: "a" | "b") => (event: React.PointerEvent) => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    dragRef.current = which;
  };

  const onMove = (event: React.PointerEvent) => {
    const which = dragRef.current;
    if (!which) return;
    event.stopPropagation();
    const svg = (event.currentTarget as SVGGElement).ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const p = {
      x: view.x + ((event.clientX - rect.left) / rect.width) * view.w,
      y: view.y + ((event.clientY - rect.top) / rect.height) * viewH,
    };
    if (which === "a") setA(p);
    else setB(p);
  };

  const onUp = () => {
    dragRef.current = null;
  };

  /** Carry the span, unchanged, to the nearest meridian. */
  const carry = () => {
    const span = Math.hypot(b.x - a.x, b.y - a.y);
    const mid = unproject({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    const nearest = meridians().reduce((best, m) =>
      Math.abs(m.value - mid.lonW) < Math.abs(best.value - mid.lonW) ? m : best,
    );
    const top = project({ lat: mid.lat + span / 120, lonW: nearest.value });
    const bottom = project({ lat: mid.lat - span / 120, lonW: nearest.value });
    setA(top);
    setB(bottom);
  };

  const legLen = s * 2.4;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const hingeAngle = Math.atan2(b.y - a.y, b.x - a.x);
  const hinge = {
    x: midX - Math.sin(hingeAngle) * -legLen * 0.85,
    y: midY + Math.cos(hingeAngle) * -legLen * 0.85,
  };

  return (
    <g onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      {/* Legs */}
      <line x1={hinge.x} y1={hinge.y} x2={a.x} y2={a.y} stroke="var(--color-ink-700)" strokeWidth={s * 0.05} />
      <line x1={hinge.x} y1={hinge.y} x2={b.x} y2={b.y} stroke="var(--color-ink-700)" strokeWidth={s * 0.05} />
      <circle cx={hinge.x} cy={hinge.y} r={s * 0.14} fill="var(--color-ink-700)" />

      {/* The span itself */}
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="var(--color-plot)"
        strokeWidth={s * 0.022}
        strokeDasharray={`${s * 0.08} ${s * 0.08}`}
      />

      {[a, b].map((p, i) => (
        <g
          key={i}
          onPointerDown={onDown(i === 0 ? "a" : "b")}
          className="cursor-grab active:cursor-grabbing"
        >
          <circle cx={p.x} cy={p.y} r={s * 0.3} fill="transparent" />
          <path
            d={`M ${p.x} ${p.y} l ${-s * 0.09} ${-s * 0.26} l ${s * 0.18} 0 Z`}
            fill="var(--color-ink-800)"
          />
          <circle cx={p.x} cy={p.y} r={s * 0.04} fill="var(--color-nogo)" />
        </g>
      ))}

      {/* Carry to the nearest meridian */}
      <g onPointerDown={(e) => { e.stopPropagation(); carry(); }} className="cursor-pointer">
        <rect
          x={hinge.x - s * 0.85}
          y={hinge.y - s * 0.72}
          width={s * 1.7}
          height={s * 0.42}
          rx={s * 0.1}
          fill="var(--color-brand)"
        />
        <text
          x={hinge.x}
          y={hinge.y - s * 0.42}
          textAnchor="middle"
          fontSize={s * 0.19}
          fontWeight={800}
          fill="#fff"
        >
          CARRY
        </text>
      </g>
    </g>
  );
}
