"use client";

/**
 * Navigation benches.
 *
 * Every other course calls this section a Sim Lab or a Scenario Lab, and puts
 * a relationship in it to be manipulated. Navigation's equivalent is the
 * workbench: the instrument itself, out on the desk, with nothing riding on
 * the answer. This is where you turn the wheel until the scales make sense,
 * before a problem asks you to get one right.
 *
 * The distinction from a problem is deliberate and it matters. Two of these
 * benches — variation and airspeed — do compute a value for you, because
 * exploring a relationship is what a lab is for. Neither is available as a
 * tool inside a problem, and the tool tray does not offer them.
 */

import { useMemo, useState } from "react";
import {
  machFromCas,
  magneticToTrue,
  pressureAltitude,
  trueAirspeed,
  trueToMagnetic,
} from "@/lib/nav/math";
import { Cr3Calc } from "../nav/cr3-calc";
import { Cr3Wind } from "../nav/cr3-wind";
import { ChartWorkspace } from "../nav/chart-workspace";
import { JetLog, ReferenceCard, ZoneWheel, emptyJetLogRow, type JetLogRow } from "../nav/tools";
import { ChainStrip, LabNote, Readout, Segmented, Slider } from "./controls";
import { Card, SectionHeading, cn } from "../ui";

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

/**
 * The bench layout: the instrument on the left at working size, the notes
 * beside it. The tool leads, because on this course the tool is the subject.
 */
function BenchFrame({
  instrument,
  brief,
  notes,
  chain,
  note,
}: {
  instrument: React.ReactNode;
  brief: string;
  notes?: { label: string; value: string; hint?: string; tone?: "brand" | "go" | "caution" | "nogo" | "neutral" }[];
  chain?: { label: string; trend?: "up" | "down" | "same" }[];
  note?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-navy-soft">{brief}</p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Card className="min-w-0">{instrument}</Card>
        <div className="space-y-3">
          {notes && notes.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {notes.map((n) => (
                <Readout key={n.label} label={n.label} value={n.value} hint={n.hint} tone={n.tone} />
              ))}
            </div>
          )}
          {chain && <ChainStrip nodes={chain} />}
          {note && <LabNote>{note}</LabNote>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* n3 — Variation                                                      */
/* ------------------------------------------------------------------ */

export function VariationLab() {
  const [trueCourse, setTrueCourse] = useState(45);
  const [variation, setVariation] = useState(4);
  const [side, setSide] = useState<"E" | "W">("E");

  const signed = side === "E" ? variation : -variation;
  const magnetic = trueToMagnetic(trueCourse, signed);
  const backToTrue = magneticToTrue(magnetic, signed);

  return (
    <BenchFrame
      brief="Both directions of the same conversion, side by side. Watch what happens to the number when you swap east for west — and then watch the second row, which is the trip a TACAN radial makes."
      instrument={
        <div className="space-y-4">
          <div className="given-block rounded-lg px-3 py-3">
            <p className="eyebrow mb-2 text-brand-dark">Chart to cockpit</p>
            <p className="figure text-[17px] font-bold text-navy">
              {String(trueCourse).padStart(3, "0")}° true − {side === "E" ? "" : "(−)"}
              {variation}°{side} = {String(magnetic).padStart(3, "0")}° magnetic
            </p>
            <p className="mt-1 text-[11.5px] text-navy-soft">
              {side === "E" ? "East is least, so it comes off." : "West is best, so it goes on."}
            </p>
          </div>
          <div className="rounded-lg border border-line-strong bg-surface-2 px-3 py-3">
            <p className="eyebrow mb-2 text-navy-faint">Cockpit to chart — plotting a radial</p>
            <p className="figure text-[17px] font-bold text-navy">
              {String(magnetic).padStart(3, "0")}° magnetic {side === "E" ? "+" : "−"} {variation}°
              {side} = {String(backToTrue).padStart(3, "0")}° true
            </p>
            <p className="mt-1 text-[11.5px] text-navy-soft">
              The formula reverses, because the direction of travel has.
            </p>
          </div>
          <Slider
            label="True course"
            value={trueCourse}
            min={1}
            max={360}
            step={1}
            onChange={setTrueCourse}
            display={`${String(trueCourse).padStart(3, "0")}°`}
            tone="brand"
          />
          <Slider
            label="Variation"
            value={variation}
            min={0}
            max={20}
            step={1}
            onChange={setVariation}
            display={`${variation}°`}
            tone="caution"
          />
          <Segmented
            label="East or west"
            value={side}
            options={[
              { value: "E", label: "East" },
              { value: "W", label: "West" },
            ]}
            onChange={setSide}
          />
        </div>
      }
      notes={[
        { label: "True course", value: `${String(trueCourse).padStart(3, "0")}°`, tone: "neutral" },
        { label: "Magnetic course", value: `${String(magnetic).padStart(3, "0")}°`, tone: "brand" },
        { label: "Difference", value: `${variation}° ${side}`, tone: "caution" },
        {
          label: "Direction of change",
          value: side === "E" ? "Number falls" : "Number rises",
          tone: side === "E" ? "go" : "nogo",
        },
      ]}
      chain={[
        { label: "Chart line", trend: "same" },
        { label: side === "E" ? "Subtract east" : "Add west", trend: side === "E" ? "down" : "up" },
        { label: "Cockpit heading", trend: "same" },
      ]}
      note={
        <>
          Set the variation to 0 and the two directions collapse into one. Everything about this
          conversion — including the trap — comes from the fact that the chart and the compass point
          at different norths.
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* n4 — Zone wheel                                                     */
/* ------------------------------------------------------------------ */

export function ZoneWheelLab() {
  return (
    <BenchFrame
      brief="Turn the inner ring to a zone description and every local hour lines up against its Zulu hour at once. Turning it the wrong way is the same mistake as getting the sign wrong in the formula — which is the point of doing it here rather than in your head."
      instrument={<ZoneWheel initialZd={-6} />}
      chain={[
        { label: "Local time", trend: "same" },
        { label: "Minus the zone description", trend: "same" },
        { label: "Zulu", trend: "same" },
      ]}
      note={
        <>
          A zone description of −6 puts Zulu six hours <strong>ahead</strong> of local, because
          subtracting a negative adds. Set it to +9 and watch the ring go the other way.
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* n5 — Chart                                                          */
/* ------------------------------------------------------------------ */

export function ChartLab() {
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-navy-soft">
        The sheet, with nothing riding on it. Pick up the plotter and put the grommet on a meridian.
        Span the dividers across a leg and carry them somewhere useful. Draw a line and measure it,
        then measure it again against a different meridian and see whether you get the same answer.
      </p>
      <Card>
        <ChartWorkspace height={520} />
      </Card>
      <LabNote>
        The chart is generated — a real Lambert conformal projection with converging meridians and a
        one-mile graticule, drawn to the conventions the trainee guide teaches against. The place
        names on it are invented, and no problem in the course depends on it resembling any
        published chart.
      </LabNote>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* n6 — The calculation side                                           */
/* ------------------------------------------------------------------ */

export function Cr3CalcLab() {
  return (
    <BenchFrame
      brief="Set one pair and look at what else lined up. That is the whole trick of a slide rule: a rotation fixes a ratio, and every pair of values in that ratio is simultaneously aligned. Put 150 over the rate index and read under 350 — then read under 175, and 70, without touching anything."
      instrument={<Cr3Calc mode="training" />}
      chain={[
        { label: "Rotate the wheel", trend: "same" },
        { label: "A ratio is fixed", trend: "same" },
        { label: "Every equivalent pair reads at once", trend: "same" },
      ]}
      note={
        <>
          Notice what the instrument never does: tell you a number. The scales are drawn with the
          graduation the guide describes — nine ticks from 10 to 15, four from 15 to 30, one from 30
          to 60 — and reading between them is the skill the ±1% tolerance exists to allow for.
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* n7 — Airspeed                                                       */
/* ------------------------------------------------------------------ */

export function AirspeedLab() {
  const [cas, setCas] = useState(200);
  const [calt, setCalt] = useState(10000);
  const [altimeter, setAltimeter] = useState(29.92);
  const [oat, setOat] = useState(-5);

  const pa = pressureAltitude(calt, altimeter);
  const tas = trueAirspeed(cas, pa, oat);
  const mach = machFromCas(cas, pa);
  const standardOat = 15 - (pa / 1000) * 2;

  return (
    <BenchFrame
      brief="A relationship explorer, not a calculator you may use in a problem. Move the altitude and watch true airspeed pull away from calibrated; move the temperature and watch it move again while the Mach number sits perfectly still."
      instrument={
        <div className="space-y-4">
          <div className="given-block rounded-lg px-3 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="eyebrow text-brand-dark">True airspeed</p>
                <p className="figure text-[26px] font-extrabold leading-none text-navy">
                  {Math.round(tas)} <span className="text-[15px]">kt</span>
                </p>
              </div>
              <div className="text-right">
                <p className="eyebrow text-brand-dark">Mach</p>
                <p className="figure text-[26px] font-extrabold leading-none text-navy">
                  {mach.toFixed(3)}
                </p>
              </div>
            </div>
          </div>
          <Slider
            label="Calibrated airspeed"
            value={cas}
            min={80}
            max={500}
            step={5}
            onChange={setCas}
            display={`${cas} kt`}
            tone="brand"
          />
          <Slider
            label="Calibrated altitude"
            value={calt}
            min={0}
            max={35000}
            step={500}
            onChange={setCalt}
            display={`${calt.toLocaleString()} ft`}
            tone="brand"
          />
          <Slider
            label="Altimeter setting"
            value={altimeter}
            min={28.0}
            max={31.0}
            step={0.02}
            onChange={setAltimeter}
            display={`${altimeter.toFixed(2)}"`}
            tone="caution"
          />
          <Slider
            label="Outside air temperature"
            value={oat}
            min={-60}
            max={40}
            step={1}
            onChange={setOat}
            display={`${oat > 0 ? "+" : ""}${oat} °C`}
            tone="nogo"
          />
        </div>
      }
      notes={[
        {
          label: "Pressure altitude",
          value: `${Math.round(pa).toLocaleString()} ft`,
          hint: altimeter < 29.92 ? "Less → Add" : altimeter > 29.92 ? "Greater → Subtract" : "On the datum",
          tone: "brand",
        },
        {
          label: "TAS − CAS",
          value: `${tas >= cas ? "+" : ""}${Math.round(tas - cas)} kt`,
          tone: tas >= cas ? "go" : "nogo",
        },
        {
          label: "Standard OAT here",
          value: `${standardOat.toFixed(0)} °C`,
          hint: oat > standardOat ? "warmer than standard" : oat < standardOat ? "colder" : "standard",
          tone: "neutral",
        },
        { label: "Mach", value: mach.toFixed(3), hint: "no temperature input", tone: "caution" },
      ]}
      chain={[
        { label: "Altitude", trend: "up" },
        { label: "Density", trend: "down" },
        { label: "TAS at a fixed CAS", trend: "up" },
      ]}
      note={
        tas < cas ? (
          <>
            True airspeed has come out <strong>below</strong> calibrated. That happens low down in
            cold, dense air, and it surprises people — the guide&apos;s own answer table contains
            several rows like it.
          </>
        ) : (
          <>
            Change the temperature and the Mach number does not move. Mach is read from the same
            CAS-over-altitude setting with no temperature input at all, which is exactly what the
            CR-3 does.
          </>
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* n8 — The wind side                                                  */
/* ------------------------------------------------------------------ */

export function Cr3WindLab() {
  return (
    <BenchFrame
      brief="Plot a wind dot, set a TAS, and rotate the rose through a whole circle of courses. The two components swap places as you go round, and the quarter names itself long before the wheel says anything."
      instrument={<Cr3Wind mode="preflight" training />}
      chain={[
        { label: "Plot the wind", trend: "same" },
        { label: "Set the TAS", trend: "same" },
        { label: "Turn the rose to the course", trend: "same" },
        { label: "Read both components", trend: "same" },
      ]}
      note={
        <>
          Try the same wind at a course 180° away. The crosswind swaps sides and the headwind becomes
          a tailwind — which is why the quartering estimate is worth doing first, and why an answer
          that disagrees with it is worth a second look.
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* n9 — Point to point                                                 */
/* ------------------------------------------------------------------ */

export function PointToPointLab() {
  return (
    <BenchFrame
      brief="The same face, used as a map. Tap two positions to plot them, then turn the grid until the line between them is vertical with the destination on top. The number above the index is the magnetic course."
      instrument={<Cr3Wind mode="pointToPoint" training />}
      chain={[
        { label: "Plot both fixes", trend: "same" },
        { label: "Turn the line vertical", trend: "same" },
        { label: "Read the course at the index", trend: "same" },
      ]}
      note={
        <>
          Turn the line the other way up and read again. That reciprocal is the answer you get for
          free if you forget to circle the destination, and it is right about half the time by
          accident.
        </>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* n10 — Jet log                                                       */
/* ------------------------------------------------------------------ */

export function JetLogLab() {
  const [rows, setRows] = useState<JetLogRow[]>([
    emptyJetLogRow("Departure"),
    emptyJetLogRow(""),
    emptyJetLogRow(""),
    emptyJetLogRow("Destination"),
  ]);
  const [mode, setMode] = useState<"learn" | "practice">("learn");

  const header = useMemo(
    () => [
      { label: "TAS", value: "190 kt" },
      { label: "Fuel flow", value: "240 pph" },
      { label: "Fuel on board", value: "1,800 lb" },
      { label: "Take-off", value: "1400Z" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-navy-soft">
        The en route section, empty. In Learn mode, tapping a column heading tells you what belongs
        in it. In Practice, it just sits there and waits — which is what it does in an aircraft.
      </p>
      <div className="flex gap-1.5">
        {(["learn", "practice"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-[12px] font-bold capitalize transition-colors",
              mode === m ? "bg-brand text-white" : "bg-surface-2 text-navy-soft hover:text-navy",
            )}
          >
            {m}
          </button>
        ))}
      </div>
      <Card>
        <JetLog rows={rows} onChange={setRows} mode={mode} header={header} />
      </Card>
      <LabNote>
        Nothing here totals itself. Information Sheet 6-7-2 makes the log the record of four
        computations the aircrew performs, and a form that filled itself in would be a record of
        nothing.
      </LabNote>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reference                                                           */
/* ------------------------------------------------------------------ */

export function ReferenceLab() {
  return (
    <div className="space-y-4">
      <p className="text-[13.5px] leading-relaxed text-navy-soft">
        Everything the trainee guide prints on its own back cover, plus the tolerance table from
        Appendix A. Nothing on this card is invented; if the guide does not print it, it is not here.
      </p>
      <SectionHeading eyebrow="Reference" title="The card" />
      <ReferenceCard />
    </div>
  );
}

export const NAV_LAB_COMPONENTS = {
  VariationLab,
  ZoneWheelLab,
  ChartLab,
  Cr3CalcLab,
  AirspeedLab,
  Cr3WindLab,
  PointToPointLab,
  JetLogLab,
  ReferenceLab,
};
