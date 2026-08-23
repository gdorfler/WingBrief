"use client";

/**
 * The Nav Desk.
 *
 * A working surface with every instrument within reach, and nothing being
 * marked. It exists because the alternative — tools that only appear inside a
 * question — teaches students to fetch a tool for an answer rather than to
 * work at a desk. Somewhere to try a setup, check a reading, or work a problem
 * out of a book is part of learning navigation, and it should not require a
 * question to be attached.
 *
 * The layout is the desk: the surface in the middle, the tool tray along the
 * bottom, and a tool comes out and sits on top of the work rather than
 * replacing it. On a phone the tray becomes a sheet, because a CR-3 and a
 * chart and a jet log genuinely do not fit in a portrait card and pretending
 * otherwise produces something unusable.
 */

import { useState } from "react";
import { Compass, Map, Table2, Wind } from "lucide-react";
import type { NavToolId } from "@/lib/types";
import { Cr3Calc } from "./cr3-calc";
import { Cr3Wind, type WindMode } from "./cr3-wind";
import { ChartWorkspace } from "./chart-workspace";
import { JetLog, ScratchPad, emptyJetLogRow, type JetLogRow } from "./tools";
import { NavToolTray } from "./tool-tray";
import { Card, PageHeader, Pill, cn } from "../ui";

type Surface = "chart" | "cr3calc" | "cr3wind" | "jetlog";

const SURFACES: { id: Surface; label: string; hint: string; icon: typeof Compass }[] = [
  { id: "chart", label: "Chart table", hint: "Plotter, dividers, pencil", icon: Map },
  { id: "cr3calc", label: "CR-3 calculation", hint: "Ratios, time, fuel", icon: Compass },
  { id: "cr3wind", label: "CR-3 wind", hint: "Winds and point to point", icon: Wind },
  { id: "jetlog", label: "Jet log", hint: "Plan a whole route", icon: Table2 },
];

/** Everything is on the desk. Nothing here is graded, so nothing is withheld. */
const ALL_TOOLS: NavToolId[] = [
  "cr3calc",
  "cr3wind",
  "chart",
  "jetlog",
  "scratch",
  "timezone",
  "reference",
];

export function NavDesk() {
  const [surface, setSurface] = useState<Surface>("chart");
  const [windMode, setWindMode] = useState<WindMode>("preflight");
  const [rows, setRows] = useState<JetLogRow[]>([
    emptyJetLogRow("Departure"),
    emptyJetLogRow(),
    emptyJetLogRow(),
    emptyJetLogRow("Destination"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Nav Desk"
        title="Everything within reach"
        subtitle="A working surface with no answer attached. Set something up, check a reading, or work a problem out of a book — nothing here is marked."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {SURFACES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSurface(s.id)}
            aria-pressed={surface === s.id}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left transition-all",
              surface === s.id
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-line bg-surface text-navy-soft hover:border-brand/40 hover:text-navy",
            )}
          >
            <s.icon size={18} />
            <span>
              <span className="block text-[13.5px] font-bold leading-tight">{s.label}</span>
              <span
                className={cn(
                  "block text-[11px] leading-tight",
                  surface === s.id ? "text-white/75" : "text-navy-faint",
                )}
              >
                {s.hint}
              </span>
            </span>
          </button>
        ))}
      </div>

      <NavToolTray allowed={ALL_TOOLS} scratchKey="nav-desk" layout="panel">
        <Card className="min-w-0">
          {surface === "chart" && <ChartWorkspace height={560} />}

          {surface === "cr3calc" && (
            <div className="mx-auto max-w-[560px]">
              <Cr3Calc mode="training" />
            </div>
          )}

          {surface === "cr3wind" && (
            <div className="mx-auto max-w-[560px] space-y-3">
              <div className="flex flex-wrap justify-center gap-1.5">
                {(
                  [
                    ["preflight", "Preflight winds"],
                    ["inflight", "In-flight winds"],
                    ["pointToPoint", "Point to point"],
                  ] as [WindMode, string][]
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setWindMode(mode)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-[12px] font-bold transition-colors",
                      windMode === mode
                        ? "bg-brand text-white"
                        : "bg-surface-2 text-navy-soft hover:text-navy",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Cr3Wind mode={windMode} training />
            </div>
          )}

          {surface === "jetlog" && (
            <div className="space-y-4">
              <JetLog rows={rows} onChange={setRows} mode="practice" />
              <div>
                <p className="eyebrow mb-1.5 text-navy-faint">Scratch</p>
                <ScratchPad storageKey="nav-desk-log" height={220} />
              </div>
              <button
                type="button"
                onClick={() => setRows((r) => [...r, emptyJetLogRow()])}
                className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-bold text-navy-soft hover:bg-surface-2"
              >
                Add a leg
              </button>
            </div>
          )}
        </Card>
      </NavToolTray>

      <Card className="mt-6 border-brand/25 bg-brand-soft/40">
        <p className="text-[12.5px] leading-relaxed text-navy">
          <span className="font-bold">Nothing here computes an answer for you. </span>
          The CR-3 renders its scales with the graduation the trainee guide describes and stops
          there; the plotter and dividers hold a direction and a span, and the reading is yours. That
          is the whole point — the tolerance the course grades to exists precisely because these
          readings are done by eye.
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <Pill tone="neutral" size="sm">Direction ±1°</Pill>
          <Pill tone="neutral" size="sm">Distance ±½ NM</Pill>
          <Pill tone="neutral" size="sm">Log scale ±1%</Pill>
          <Pill tone="neutral" size="sm">TAS ±2 kt</Pill>
          <Pill tone="neutral" size="sm">Winds ±3° / ±3 kt</Pill>
        </div>
      </Card>
    </>
  );
}
