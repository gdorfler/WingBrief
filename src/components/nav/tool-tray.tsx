"use client";

/**
 * The tool tray.
 *
 * A row of instruments along the bottom of the workspace; tapping one brings
 * it onto the desk. The panel overlaps the problem rather than replacing it,
 * because the whole point of a desk is that the problem and the tools are in
 * front of you at the same time — a tool that navigated away from the question
 * would make the student memorise the numbers first, which is not the skill.
 *
 * Desktop and tablet get a side panel next to the work. Phones get a sheet
 * from the bottom, which is the only honest answer at that width: a CR-3 and a
 * chart and a question do not fit in a portrait card, and pretending otherwise
 * would produce something unusable rather than something compact.
 */

import { useEffect, useState } from "react";
import { BookOpen, Clock, Compass, Map, PencilLine, Table2, X } from "lucide-react";
import type { NavToolId } from "@/lib/types";
import { Cr3Calc } from "./cr3-calc";
import { Cr3Wind } from "./cr3-wind";
import { ChartWorkspace } from "./chart-workspace";
import { JetLog, ReferenceCard, ScratchPad, ZoneWheel, emptyJetLogRow, type JetLogRow } from "./tools";
import { cn } from "../ui";

export const TOOL_META: Record<
  NavToolId,
  { label: string; short: string; icon: typeof Compass }
> = {
  cr3calc: { label: "CR-3 · calculation side", short: "CR-3", icon: Compass },
  cr3wind: { label: "CR-3 · wind side", short: "Wind", icon: Compass },
  chart: { label: "Chart, plotter and dividers", short: "Chart", icon: Map },
  jetlog: { label: "Jet log", short: "Jet log", icon: Table2 },
  scratch: { label: "Scratch pad", short: "Scratch", icon: PencilLine },
  timezone: { label: "Zone wheel", short: "Zulu", icon: Clock },
  reference: { label: "Reference card", short: "Reference", icon: BookOpen },
};

export const ALL_NAV_TOOLS: NavToolId[] = [
  "cr3calc",
  "cr3wind",
  "chart",
  "jetlog",
  "scratch",
  "timezone",
  "reference",
];

export interface NavToolTrayProps {
  /** Which instruments this problem or screen permits. */
  allowed: NavToolId[];
  /** Opened by default, e.g. the chart on a plotting lesson. */
  initial?: NavToolId | null;
  /** Keeps scratch work separate per problem. */
  scratchKey?: string;
  /** Jet log state, when a mission owns it. */
  jetLog?: { rows: JetLogRow[]; onChange: (rows: JetLogRow[]) => void };
  /** Side panel on desktop, or an overlay sheet everywhere. */
  layout?: "panel" | "sheet";
  children?: React.ReactNode;
}

export function NavToolTray({
  allowed,
  initial = null,
  scratchKey,
  jetLog,
  layout = "panel",
  children,
}: NavToolTrayProps) {
  const [open, setOpen] = useState<NavToolId | null>(initial);
  const [ownRows, setOwnRows] = useState<JetLogRow[]>([
    emptyJetLogRow(),
    emptyJetLogRow(),
    emptyJetLogRow(),
  ]);

  useEffect(() => {
    if (open && !allowed.includes(open)) setOpen(null);
  }, [allowed, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (allowed.length === 0) return <>{children}</>;

  const panel = open ? (
    <div className="tool-window flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface-2 px-3 py-2">
        <p className="text-[12.5px] font-bold text-navy">{TOOL_META[open].label}</p>
        <button
          type="button"
          onClick={() => setOpen(null)}
          aria-label="Put the tool away"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-soft hover:bg-surface-3 hover:text-navy"
        >
          <X size={15} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <ToolBody
          tool={open}
          scratchKey={scratchKey}
          rows={jetLog?.rows ?? ownRows}
          onRows={jetLog?.onChange ?? setOwnRows}
        />
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "grid gap-4",
          layout === "panel" && open ? "lg:grid-cols-[minmax(0,1fr)_minmax(24rem,29rem)]" : "",
        )}
      >
        <div className="min-w-0">{children}</div>
        {layout === "panel" && open && (
          <div className="hidden lg:block">
            <div className="sticky top-4 max-h-[calc(100dvh-3rem)]">{panel}</div>
          </div>
        )}
      </div>

      {/* The tray itself. */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line-strong bg-surface-2 p-1.5">
        {allowed.map((id) => {
          const meta = TOOL_META[id];
          const active = open === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setOpen(active ? null : id)}
              aria-pressed={active}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-bold transition-colors",
                active
                  ? "bg-brand text-white shadow-sm"
                  : "bg-surface text-navy-soft hover:text-navy",
              )}
            >
              <meta.icon size={14} />
              {meta.short}
            </button>
          );
        })}
        <span className="ml-auto hidden pr-1 text-[10.5px] text-navy-faint sm:block">
          Tools stay open while you work
        </span>
      </div>

      {/* Overlay sheet: always on small screens, and everywhere in sheet layout. */}
      {open && (
        <div
          className={cn(
            "fixed inset-0 z-40 flex items-end",
            layout === "panel" ? "lg:hidden" : "",
          )}
        >
          <button
            type="button"
            aria-label="Close the tool"
            onClick={() => setOpen(null)}
            className="absolute inset-0 bg-ink-900/45 backdrop-blur-[2px]"
          />
          {/*
           * A definite height, not a max. The panel inside is a flex column
           * with a scrolling body, and a max-height alone leaves the container
           * auto-sized — which resolves the body to zero and shows an empty
           * sheet on a phone.
           */}
          <div className="relative h-[86dvh] w-full overflow-hidden rounded-t-2xl bg-surface">
            {panel}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolBody({
  tool,
  scratchKey,
  rows,
  onRows,
}: {
  tool: NavToolId;
  scratchKey?: string;
  rows: JetLogRow[];
  onRows: (rows: JetLogRow[]) => void;
}) {
  switch (tool) {
    case "cr3calc":
      return <Cr3Calc />;
    case "cr3wind":
      return <Cr3Wind />;
    case "chart":
      return <ChartWorkspace height={380} />;
    case "jetlog":
      return <JetLog rows={rows} onChange={onRows} mode="practice" />;
    case "scratch":
      return <ScratchPad storageKey={scratchKey} height={300} />;
    case "timezone":
      return <ZoneWheel />;
    case "reference":
      return <ReferenceCard />;
  }
}
