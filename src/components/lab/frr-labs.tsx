"use client";

/**
 * Flight Rules Scenario Labs.
 *
 * Aerodynamics and Engines labs simulate a physical relationship — move a
 * slider, watch a curve. Regulations have no curve. What a student needs
 * instead is a situation they can vary and a ruling that changes with it, so
 * these labs are decision engines: set the conditions, read what the rule says,
 * and see which clause produced that answer.
 *
 * Every ruling here traces to a stated rule in the NIFE material. Where the
 * source does not publish a threshold, the lab does not invent one.
 */

import { useState } from "react";
import { DiagramHost } from "@/components/diagrams/registry";
import { type Tone, cn } from "@/components/ui";
import { ChainStrip, Readout, Segmented, Slider } from "./controls";

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

function ScenarioFrame({
  diagram,
  diagramProps,
  controls,
  verdict,
  readouts,
  because,
  note,
}: {
  diagram?: string;
  diagramProps?: Record<string, unknown>;
  controls: React.ReactNode;
  /** The ruling. This is the point of the lab, so it gets the top of the page. */
  verdict: { label: string; value: string; tone: Tone };
  readouts?: { label: string; value: string; tone?: Tone; hint?: string }[];
  /** The clauses that produced the verdict, in the order they were applied. */
  because?: { label: string; trend?: "up" | "down" | "same" }[];
  note?: string;
}) {
  const ring: Record<string, string> = {
    go: "border-go/40 bg-go-soft/60",
    nogo: "border-nogo/40 bg-nogo-soft/60",
    caution: "border-caution/40 bg-caution-soft/60",
    brand: "border-brand/40 bg-brand-soft/60",
    neutral: "border-line bg-surface-2",
    gold: "border-gold/40 bg-surface-2",
    violet: "border-[var(--color-series-alt)]/40 bg-surface-2",
  };
  const text: Record<string, string> = {
    go: "text-go",
    nogo: "text-nogo",
    caution: "text-caution",
    brand: "text-brand",
    neutral: "text-navy",
    gold: "text-gold",
    violet: "text-[var(--color-series-alt)]",
  };

  return (
    <div className="space-y-4">
      <div className={cn("rounded-2xl border px-5 py-4", ring[verdict.tone])}>
        <p className="eyebrow mb-1 text-navy-faint">{verdict.label}</p>
        <p className={cn("text-[19px] font-extrabold leading-snug", text[verdict.tone])}>
          {verdict.value}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          {diagram && (
            <div className="overflow-hidden rounded-2xl border border-line bg-surface p-3">
              <DiagramHost id={diagram} props={diagramProps ?? {}} />
            </div>
          )}
          {because && because.length > 0 && <ChainStrip nodes={because} />}
        </div>

        <div className="min-w-0 space-y-3.5">
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            <p className="eyebrow text-navy-faint">The situation</p>
            {controls}
          </div>
          {readouts && readouts.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {readouts.map((r) => (
                <Readout key={r.label} {...r} />
              ))}
            </div>
          )}
        </div>
      </div>

      {note && (
        <p className="rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[13px] leading-relaxed text-navy-soft">
          {note}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Labs                                                                */
/* ------------------------------------------------------------------ */

/** Read the airport: runway number, light gun signal, glideslope. */
export function AirportLab() {
  const [heading, setHeading] = useState(93);
  const [signal, setSignal] = useState<"green" | "red" | "white">("green");
  const [slope, setSlope] = useState<"low" | "on" | "high">("on");

  const rounded = Math.round(heading / 10) * 10;
  const rwy = String((rounded === 0 ? 36 : rounded / 10)).padStart(2, "0");
  const recipNum = ((rounded + 180) % 360) / 10;
  const recip = String(recipNum === 0 ? 36 : recipNum).padStart(2, "0");

  // The trainee guide names three Aldis signals. Nothing else is invented here.
  const gun = {
    green: { say: "Steady green", mean: "Cleared to land", tone: "go" as Tone },
    red: { say: "Steady red", mean: "Give way to other aircraft and continue circling", tone: "nogo" as Tone },
    white: { say: "Flashing white", mean: "Return for landing", tone: "caution" as Tone },
  }[signal];

  const vasi = {
    low: { mean: "Red over red — below glideslope", tone: "nogo" as Tone, act: "Climb" },
    on: { mean: "Red over white — on glideslope", tone: "go" as Tone, act: "Hold it" },
    high: { mean: "White over white — above glideslope", tone: "caution" as Tone, act: "Descend" },
  }[slope];

  return (
    <ScenarioFrame
      diagram="frr-runway-numbering"
      diagramProps={{ heading: rounded }}
      verdict={{ label: "You are landing on", value: `Runway ${rwy}`, tone: "brand" }}
      controls={
        <>
          <Slider
            label="Magnetic heading"
            value={heading}
            min={0}
            max={359}
            step={1}
            onChange={setHeading}
            display={`${Math.round(heading)}°`}
            tone="brand"
          />
          <Segmented
            label="Light gun signal"
            value={signal}
            options={[
              { value: "green", label: "Steady green" },
              { value: "red", label: "Steady red" },
              { value: "white", label: "Flashing white" },
            ]}
            onChange={setSignal}
          />
          <Segmented
            label="VASI"
            value={slope}
            options={[
              { value: "low", label: "Low" },
              { value: "on", label: "On" },
              { value: "high", label: "High" },
            ]}
            onChange={setSlope}
          />
        </>
      }
      readouts={[
        { label: "Reciprocal end", value: recip, tone: "violet" },
        { label: gun.say, value: gun.mean, tone: gun.tone },
        { label: "VASI", value: vasi.mean, tone: vasi.tone },
        { label: "Action", value: vasi.act, tone: vasi.tone },
      ]}
      because={[
        { label: `Heading ${Math.round(heading)}°` },
        { label: `Rounds to ${rounded === 0 ? 360 : rounded}°` },
        { label: `Runway ${rwy}` },
      ]}
      note="Round the heading to the nearest ten and drop the last digit. The far end of the same strip is always 18 away."
    />
  );
}

/** Given the forecast, decide which set of rules you may file under. */
export function VfrIfrLab() {
  const [ceiling, setCeiling] = useState(2500);
  const [visibility, setVisibility] = useState(5);
  const [route, setRoute] = useState<"clear" | "marginal">("clear");

  const meetsDestination = ceiling >= 1000 && visibility >= 3;
  const routeOk = route === "clear";
  const vfrOk = meetsDestination && routeOk;

  const why: { label: string; trend?: "up" | "down" | "same" }[] = [
    {
      label: `Destination forecast ${ceiling.toLocaleString()}' / ${visibility} SM`,
      trend: meetsDestination ? "up" : "down",
    },
    { label: meetsDestination ? "Meets 1,000 and 3" : "Below 1,000 and 3", trend: meetsDestination ? "up" : "down" },
    { label: routeOk ? "Route permits visual flight" : "Route precludes visual flight", trend: routeOk ? "up" : "down" },
    { label: vfrOk ? "VFR may be filed" : "IFR is required", trend: vfrOk ? "up" : "down" },
  ];

  return (
    <ScenarioFrame
      diagram="frr-cloud-clearance"
      diagramProps={{ regime: "standard" }}
      verdict={{
        label: "You may file",
        value: vfrOk ? "VFR" : "IFR — VFR is not available",
        tone: vfrOk ? "go" : "nogo",
      }}
      controls={
        <>
          <Slider
            label="Destination ceiling (ETA ± 1 hr)"
            value={ceiling}
            min={0}
            max={5000}
            step={100}
            onChange={setCeiling}
            display={`${ceiling.toLocaleString()} ft`}
            tone={ceiling >= 1000 ? "go" : "nogo"}
          />
          <Slider
            label="Destination visibility"
            value={visibility}
            min={0}
            max={10}
            step={0.5}
            onChange={setVisibility}
            display={`${visibility} SM`}
            tone={visibility >= 3 ? "go" : "nogo"}
          />
          <Segmented
            label="Conditions along the route"
            value={route}
            options={[
              { value: "clear", label: "Permit VFR" },
              { value: "marginal", label: "Preclude VFR" },
            ]}
            onChange={setRoute}
          />
        </>
      }
      readouts={[
        { label: "Ceiling test", value: ceiling >= 1000 ? "Pass" : "Fail", tone: ceiling >= 1000 ? "go" : "nogo", hint: "1,000 ft" },
        { label: "Visibility test", value: visibility >= 3 ? "Pass" : "Fail", tone: visibility >= 3 ? "go" : "nogo", hint: "3 SM" },
        { label: "Route test", value: routeOk ? "Pass" : "Fail", tone: routeOk ? "go" : "nogo" },
        { label: "Fuel reserve", value: "10%, min 20 min", tone: "neutral" },
      ]}
      because={why}
      note="Both destination tests and the route test must pass. Marginal or deteriorating conditions anywhere along the route mean an IFR flight plan."
    />
  );
}

/** Turn a course into a legal cruising altitude. */
export function AltitudeLab() {
  const [course, setCourse] = useState(90);
  const [rules, setRules] = useState<"vfr" | "ifr">("vfr");
  const [band, setBand] = useState<"low" | "mid" | "high">("low");

  const east = course < 180;
  const parity = east ? "Odd" : "Even";

  const answer =
    band === "low"
      ? rules === "vfr"
        ? `${parity} thousands + 500`
        : `${parity} thousands`
      : band === "mid"
        ? rules === "vfr"
          ? `${parity} flight levels + 500`
          : `${parity} flight levels`
        : rules === "vfr"
          ? east
            ? "4,000 ft intervals from FL300"
            : "4,000 ft intervals from FL320"
          : east
            ? "4,000 ft intervals from FL290"
            : "4,000 ft intervals from FL310";

  const bandLabel =
    band === "low" ? "Below 18,000 MSL" : band === "mid" ? "18,000 to FL290" : "Above FL290";

  return (
    <ScenarioFrame
      diagram="frr-semicircular"
      diagramProps={{ course, rules }}
      verdict={{ label: "Cruise at", value: answer, tone: east ? "brand" : "violet" }}
      controls={
        <>
          <Slider
            label="Magnetic course"
            value={course}
            min={0}
            max={359}
            step={1}
            onChange={setCourse}
            display={`${Math.round(course)}°`}
            tone={east ? "brand" : "violet"}
          />
          <Segmented
            label="Flight rules"
            value={rules}
            options={[
              { value: "vfr", label: "VFR" },
              { value: "ifr", label: "IFR" },
            ]}
            onChange={setRules}
          />
          <Segmented
            label="Altitude band"
            value={band}
            options={[
              { value: "low", label: "< 18,000" },
              { value: "mid", label: "to FL290" },
              { value: "high", label: "> FL290" },
            ]}
            onChange={setBand}
          />
        </>
      }
      readouts={[
        { label: "Hemisphere", value: east ? "East" : "West", tone: east ? "brand" : "violet", hint: east ? "0–179°" : "180–359°" },
        { label: "Thousands", value: parity, tone: "neutral" },
        { label: "Add 500?", value: rules === "vfr" ? "Yes" : "No", tone: rules === "vfr" ? "go" : "neutral" },
        { label: "Band", value: bandLabel, tone: "neutral" },
      ]}
      because={[
        { label: `Course ${Math.round(course)}°` },
        { label: east ? "East semicircle" : "West semicircle" },
        { label: `${parity} thousands` },
        { label: rules === "vfr" ? "+ 500 for VFR" : "No addition for IFR" },
      ]}
      note="VFR cruising altitudes only apply above 3,000 ft AGL. In controlled airspace under IFR the real answer is whatever ATC assigns — these rules are for planning and for uncontrolled airspace."
    />
  );
}

/** Identify a class of airspace and what it demands of you. */
export function AirspaceLab() {
  const [cls, setCls] = useState<"a" | "b" | "c" | "d" | "e" | "g">("c");
  const [high, setHigh] = useState<"below" | "above">("below");

  const data = {
    a: {
      dims: "18,000 MSL to FL600",
      entry: "IFR flight plan and clearance",
      tone: "nogo" as Tone,
      mins: "Not applicable — IFR only",
      note: "Everyone in Class A is on an IFR clearance, so there are no VFR minimums to state.",
    },
    b: {
      dims: "Surface to about 10,000 MSL",
      entry: "An ATC CLEARANCE",
      tone: "nogo" as Tone,
      mins: "Clear of clouds · 3 SM",
      note: "Class B is the one that needs an actual clearance. Being in contact is not enough.",
    },
    c: {
      dims: "Surface to about 4,000 AGL · 5 nm core",
      entry: "Two-way communication established",
      tone: "caution" as Tone,
      mins: "1,000 / 500 / 2,000 · 3 SM",
      note: "The controller must use your call sign. 'Remain outside and standby' is not establishment.",
    },
    d: {
      dims: "Surface to about 2,500 AGL",
      entry: "Two-way communication established",
      tone: "caution" as Tone,
      mins: "1,000 / 500 / 2,000 · 3 SM",
      note: "Class D exists where there is an operating control tower.",
    },
    e: {
      dims: "Controlled airspace that is not A, B, C or D",
      entry: "Nothing required for VFR",
      tone: "go" as Tone,
      mins: "1,000 / 500 / 2,000 · 3 SM",
      note: "Class E is where the high-altitude exception bites: at or above 10,000 MSL the minimums change.",
    },
    g: {
      dims: "Uncontrolled — usually below 1,200 AGL",
      entry: "Nothing",
      tone: "neutral" as Tone,
      mins: "Varies with altitude and time of day",
      note: "ATC has neither the authority nor the responsibility to control traffic in Class G.",
    },
  }[cls];

  const showsHigh = cls === "e";
  const mins = showsHigh && high === "above" ? "1,000 / 1,000 / 1 SM · 5 SM" : data.mins;

  return (
    <ScenarioFrame
      diagram="frr-airspace-profile"
      diagramProps={{ highlight: cls }}
      verdict={{ label: `Class ${cls.toUpperCase()} — to enter you need`, value: data.entry, tone: data.tone }}
      controls={
        <>
          <Segmented
            label="Class"
            value={cls}
            options={[
              { value: "a", label: "A" },
              { value: "b", label: "B" },
              { value: "c", label: "C" },
              { value: "d", label: "D" },
              { value: "e", label: "E" },
              { value: "g", label: "G" },
            ]}
            onChange={setCls}
          />
          {showsHigh && (
            <Segmented
              label="Altitude"
              value={high}
              options={[
                { value: "below", label: "Below 10,000 MSL" },
                { value: "above", label: "At or above 10,000" },
              ]}
              onChange={setHigh}
            />
          )}
        </>
      }
      readouts={[
        { label: "Dimensions", value: data.dims, tone: "brand" },
        { label: "Controlled?", value: cls === "g" ? "No" : "Yes", tone: cls === "g" ? "neutral" : "brand" },
        { label: "VFR minimums", value: mins, tone: "caution" },
        { label: "Mode C", value: cls === "b" || cls === "c" ? "Required in and above, to 10,000 MSL" : "At and above 10,000 MSL", tone: "neutral" },
      ]}
      because={[
        { label: `Class ${cls.toUpperCase()}` },
        { label: cls === "g" ? "Uncontrolled" : "Controlled" },
        { label: data.entry },
      ]}
      note={data.note}
    />
  );
}

/** Two aircraft, one conflict — and a speed limit to check. */
export function RulesLab() {
  const [situation, setSituation] = useState<"headon" | "converging" | "overtaking" | "landing">(
    "headon",
  );
  const [mine, setMine] = useState<"balloon" | "glider" | "airship" | "airplane" | "helicopter">(
    "airplane",
  );
  const [theirs, setTheirs] = useState<"balloon" | "glider" | "airship" | "airplane" | "helicopter">(
    "helicopter",
  );

  const rank = { balloon: 0, glider: 1, airship: 2, airplane: 3, helicopter: 4 };
  const sameCategory = mine === theirs;

  let ruling: string;
  let tone: Tone;
  let chain: { label: string; trend?: "up" | "down" | "same" }[];

  if (situation === "headon") {
    ruling = "You both alter course to the RIGHT";
    tone = "caution";
    chain = [
      { label: "Head-on, or nearly so, at the same altitude" },
      { label: "Category does not matter here" },
      { label: "Each pilot turns right", trend: "same" },
    ];
  } else if (situation === "overtaking") {
    ruling = "The aircraft being overtaken has the right of way — the overtaker passes to the RIGHT";
    tone = "brand";
    chain = [
      { label: "One aircraft is overtaking the other" },
      { label: "The overtaken aircraft has right of way", trend: "up" },
      { label: "Alter course to the right to pass well clear" },
    ];
  } else if (situation === "landing") {
    ruling = "The aircraft at the LOWER altitude has the right of way";
    tone = "brand";
    chain = [
      { label: "Two or more approaching to land" },
      { label: "Lower aircraft has right of way", trend: "up" },
      { label: "But may not cut in front of another on final", trend: "down" },
    ];
  } else if (sameCategory) {
    ruling = "Same category — the aircraft to the other's RIGHT has the right of way";
    tone = "brand";
    chain = [
      { label: "Converging, other than head-on" },
      { label: "Both are the same category" },
      { label: "The one on the right has it", trend: "up" },
    ];
  } else {
    const youHaveIt = rank[mine] < rank[theirs];
    const a = (w: string) => `${"aeiou".includes(w[0]) ? "an" : "a"} ${w}`;
    ruling = youHaveIt
      ? `You have the right of way — ${a(mine)} outranks ${a(theirs)}`
      : `Give way — ${a(theirs)} outranks ${a(mine)}`;
    tone = youHaveIt ? "go" : "nogo";
    chain = [
      { label: "Converging, different categories" },
      { label: "Priority runs least manoeuvrable first" },
      { label: youHaveIt ? "You have it" : "They have it", trend: youHaveIt ? "up" : "down" },
    ];
  }

  return (
    <ScenarioFrame
      diagram="frr-right-of-way"
      diagramProps={{
        scenario: situation,
        detail:
          situation === "converging" && !sameCategory
            ? "Converging, different categories — the least manoeuvrable has priority"
            : "",
      }}
      verdict={{ label: "Right of way", value: ruling, tone }}
      controls={
        <>
          <Segmented
            label="Situation"
            value={situation}
            options={[
              { value: "headon", label: "Head-on" },
              { value: "converging", label: "Converging" },
              { value: "overtaking", label: "Overtaking" },
              { value: "landing", label: "Landing" },
            ]}
            onChange={setSituation}
          />
          <Segmented
            label="You are a"
            value={mine}
            options={[
              { value: "balloon", label: "Balloon" },
              { value: "glider", label: "Glider" },
              { value: "airship", label: "Airship" },
              { value: "airplane", label: "Airplane" },
              { value: "helicopter", label: "Helo" },
            ]}
            onChange={setMine}
          />
          <Segmented
            label="They are a"
            value={theirs}
            options={[
              { value: "balloon", label: "Balloon" },
              { value: "glider", label: "Glider" },
              { value: "airship", label: "Airship" },
              { value: "airplane", label: "Airplane" },
              { value: "helicopter", label: "Helo" },
            ]}
            onChange={setTheirs}
          />
        </>
      }
      readouts={[
        { label: "Highest priority of all", value: "An aircraft in distress", tone: "nogo" },
        { label: "Category order", value: "Balloon → glider → airship → airplane → helicopter", tone: "neutral" },
      ]}
      because={chain}
      note="Distress outranks everything. After that the rule follows manoeuvrability, not size or speed — which is why a balloon has priority over a jet."
    />
  );
}
