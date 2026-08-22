"use client";

/**
 * Weather Labs.
 *
 * The Aero Sim Lab manipulates an equation; the FR&R Scenario Lab resolves a
 * rule. A Weather Lab does something different again: it changes an ATMOSPHERIC
 * CONDITION and shows what the air does about it. So the frame here leads with
 * the atmosphere's response — the thing the student is trying to learn to
 * predict — rather than with a readout panel.
 *
 * These are relationship models built from the Weather Condensed Notes. Where
 * the notes state a number it is used exactly; nothing computes a value the
 * source does not publish.
 */

import { useState } from "react";
import { DiagramHost } from "@/components/diagrams/registry";
import { type Tone, cn } from "@/components/ui";
import { ChainStrip, Readout, Segmented, Slider } from "./controls";

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

function AtmosphereFrame({
  diagram,
  diagramProps,
  controls,
  /** What the atmosphere is doing as a result — the point of the lab. */
  response,
  readouts,
  chain,
  note,
}: {
  diagram: string;
  diagramProps: Record<string, unknown>;
  controls: React.ReactNode;
  response: { label: string; value: string; tone: Tone };
  readouts?: { label: string; value: string; tone?: Tone; hint?: string }[];
  chain?: { label: string; trend?: "up" | "down" | "same" }[];
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
      <div className={cn("rounded-2xl border px-5 py-4", ring[response.tone])}>
        <p className="eyebrow mb-1 text-navy-faint">{response.label}</p>
        <p className={cn("text-[19px] font-extrabold leading-snug", text[response.tone])}>
          {response.value}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface p-3">
            <DiagramHost id={diagram} props={diagramProps} />
          </div>
          {chain && chain.length > 0 && <ChainStrip nodes={chain} />}
        </div>

        <div className="min-w-0 space-y-3.5">
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            <p className="eyebrow text-navy-faint">Conditions</p>
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

/** Climb the column and read what the standard atmosphere does. */
export function AtmosphereLab() {
  const [altitude, setAltitude] = useState(0);

  const temp = 15 - (altitude / 1000) * 2;
  const press = 29.92 - altitude / 1000;
  const inTropopause = altitude >= 36000;

  return (
    <AtmosphereFrame
      diagram="wx-lapse-rates"
      diagramProps={{ altitude: Math.min(altitude, 20000), show: "both" }}
      response={{
        label: "At this altitude, a standard day gives you",
        value: `${temp.toFixed(0)} °C and ${press.toFixed(2)} inHg`,
        tone: temp < 0 ? "brand" : "go",
      }}
      controls={
        <Slider
          label="Altitude"
          value={altitude}
          min={0}
          max={20000}
          step={500}
          onChange={setAltitude}
          display={`${altitude.toLocaleString()} ft`}
          tone="brand"
        />
      }
      readouts={[
        { label: "Temperature", value: `${temp.toFixed(0)} °C`, tone: "nogo", hint: "2 °C / 1,000 ft" },
        { label: "Pressure", value: `${press.toFixed(2)} inHg`, tone: "brand", hint: "1 inHg / 1,000 ft" },
        { label: "Below freezing", value: temp < 0 ? "Yes" : "No", tone: temp < 0 ? "caution" : "go" },
        {
          label: "Icing possible",
          value: temp < 0 && temp >= -20 ? "In visible moisture" : temp >= 0 ? "No — too warm" : "Below the bands",
          tone: temp < 0 && temp >= -20 ? "caution" : "neutral",
        },
      ]}
      chain={[
        { label: "Altitude", trend: "up" },
        { label: "Pressure", trend: "down" },
        { label: "Temperature", trend: "down" },
        { label: "Wind", trend: "up" },
      ]}
      note={
        inTropopause
          ? "Around 36,000 ft over the US you reach the tropopause, where the temperature stops falling and holds constant."
          : "Two variables, two lapse rates, two units. Both are measured from the standard sea level values of 29.92 inHg and 15 °C."
      }
    />
  );
}

/** Set the temperature deviation and read which way the altimeter lies. */
export function AltimeterLab() {
  const [condition, setCondition] = useState<"standard" | "cold" | "hot">("standard");
  const [setting, setSetting] = useState(29.92);

  // 1,000 ft of indication for every 1 inHg of difference.
  const settingError = Math.round((setting - 29.92) * 1000);

  const temp = {
    standard: { reads: "Correctly", where: "Indicated equals true", tone: "go" as Tone },
    cold: { reads: "HIGHER than true", where: "You are LOWER than indicated", tone: "nogo" as Tone },
    hot: { reads: "LOWER than true", where: "You are higher than indicated", tone: "caution" as Tone },
  }[condition];

  return (
    <AtmosphereFrame
      diagram="wx-altimeter-error"
      diagramProps={{ condition }}
      response={{
        label: "With this temperature deviation, the altimeter reads",
        value: `${temp.reads} — ${temp.where.toLowerCase()}`,
        tone: temp.tone,
      }}
      controls={
        <>
          <Segmented
            label="Temperature versus standard"
            value={condition}
            options={[
              { value: "cold", label: "Colder" },
              { value: "standard", label: "Standard" },
              { value: "hot", label: "Hotter" },
            ]}
            onChange={setCondition}
          />
          <Slider
            label="Kollsman setting"
            value={setting}
            min={28.92}
            max={30.92}
            step={0.01}
            onChange={setSetting}
            display={`${setting.toFixed(2)} inHg`}
            tone="brand"
          />
        </>
      }
      readouts={[
        { label: "Temperature error", value: temp.reads, tone: temp.tone },
        {
          label: "Setting error",
          value: settingError === 0 ? "None" : `${settingError > 0 ? "+" : ""}${settingError} ft`,
          tone: settingError === 0 ? "go" : "caution",
          hint: "1 inHg = 1,000 ft",
        },
        { label: "Where you actually are", value: temp.where, tone: temp.tone },
        { label: "Which error is larger", value: "Pressure, usually", tone: "neutral" },
      ]}
      chain={[
        { label: condition === "cold" ? "Colder than standard" : condition === "hot" ? "Hotter than standard" : "Standard day" },
        { label: `Altimeter indicates ${temp.reads.toLowerCase()}` },
        { label: temp.where, trend: condition === "cold" ? "down" : condition === "hot" ? "up" : "same" },
      ]}
      note="Temperature effects are less noticeable than pressure changes — but cold is the dangerous direction, because the altimeter over-reads and the aircraft is lower than it says."
    />
  );
}

/** Place a cloud in its group and read what it brings. */
export function CloudTypeLab() {
  const [group, setGroup] = useState<"low" | "middle" | "high" | "special">("special");
  const [shape, setShape] = useState<"cumuliform" | "stratiform">("cumuliform");

  const precip = shape === "cumuliform" ? "Showery" : "Continuous";
  const stability = shape === "cumuliform" ? "Unstable" : "Stable";

  const special =
    group === "special"
      ? shape === "cumuliform"
        ? {
            name: "Cumulonimbus",
            detail: "Base low, tops high · severe to extreme turbulence, hail, icing, lightning",
            tone: "nogo" as Tone,
          }
        : {
            name: "Nimbostratus",
            detail: "Thick, uniform, builds DOWNWARDS · heavy continuous rain, moderate turbulence, NO thunder",
            tone: "brand" as Tone,
          }
      : null;

  return (
    <AtmosphereFrame
      diagram="wx-cloud-groups"
      diagramProps={{ group }}
      response={{
        label: special ? special.name : `${group[0].toUpperCase()}${group.slice(1)} group`,
        value: special ? special.detail : `${stability} air · ${precip.toLowerCase()} precipitation`,
        tone: special ? special.tone : shape === "cumuliform" ? "caution" : "brand",
      }}
      controls={
        <>
          <Segmented
            label="Altitude group"
            value={group}
            options={[
              { value: "low", label: "Low" },
              { value: "middle", label: "Middle" },
              { value: "high", label: "High" },
              { value: "special", label: "Special" },
            ]}
            onChange={setGroup}
          />
          <Segmented
            label="Shape"
            value={shape}
            options={[
              { value: "cumuliform", label: "Cumuliform" },
              { value: "stratiform", label: "Stratiform" },
            ]}
            onChange={setShape}
          />
        </>
      }
      readouts={[
        { label: "Group is set by", value: "Altitude", tone: "neutral" },
        { label: "Shape tells you", value: stability, tone: shape === "cumuliform" ? "caution" : "brand" },
        { label: "Precipitation", value: precip, tone: "neutral" },
        { label: "Nimbus means", value: "Violent or heavy", tone: "nogo" },
      ]}
      chain={[
        { label: stability },
        { label: shape === "cumuliform" ? "Builds vertically" : "Builds in layers" },
        { label: `${precip} precipitation` },
      ]}
      note="Intermittent precipitation is the exception: it starts and stops at least once an hour and can come from either cloud type, so it tells you nothing about the shape."
    />
  );
}

/** Pick a cause and read the turbulence it produces. */
export function TurbulenceLab() {
  const [cause, setCause] = useState<"windshear" | "thermal" | "frontal" | "mechanical">("windshear");

  const data = {
    windshear: {
      where: "Anywhere — high level with the jet stream, low level near the surface",
      worst: "LLWS: risk of stall at low altitude",
      driver: "A sudden, drastic change in wind speed and/or direction",
      tone: "nogo" as Tone,
    },
    thermal: {
      where: "Over heated surfaces",
      worst: "Strongest over DRY surfaces",
      driver: "Heating from below",
      tone: "caution" as Tone,
    },
    frontal: {
      where: "At cold fronts only",
      worst: "More prominent in a FAST cold front",
      driver: "Frontal lifting",
      tone: "brand" as Tone,
    },
    mechanical: {
      where: "Usually below 1,000 ft AGL",
      worst: "Rougher terrain, faster wind, more unstable air",
      driver: "Buildings, ground objects, hills and valleys",
      tone: "violet" as Tone,
    },
  }[cause];

  return (
    <AtmosphereFrame
      diagram="wx-turbulence-causes"
      diagramProps={{ cause }}
      response={{ label: "Caused by", value: data.driver, tone: data.tone }}
      controls={
        <Segmented
          label="Causative factor"
          value={cause}
          options={[
            { value: "windshear", label: "Wind shear" },
            { value: "thermal", label: "Thermal" },
            { value: "frontal", label: "Frontal" },
            { value: "mechanical", label: "Mechanical" },
          ]}
          onChange={setCause}
        />
      }
      readouts={[
        { label: "Where", value: data.where, tone: "neutral" },
        { label: "Worst case", value: data.worst, tone: data.tone },
        { label: "Intensity scale", value: "Light, moderate, severe, extreme", tone: "neutral" },
        { label: "Duration scale", value: "Occasional ⅓ · Intermittent ⅔ · Continuous", tone: "neutral" },
      ]}
      chain={[
        { label: data.driver },
        { label: data.where },
        { label: data.worst, trend: "up" },
      ]}
      note={
        cause === "frontal"
          ? "There is no warm frontal turbulence at all — warm fronts produce little or no lifting."
          : "Extreme turbulence of any cause requires declaring an emergency and exiting the area as soon as possible."
      }
    />
  );
}

/** Bring temperature and dew point together and watch cloud appear. */
export function CloudLab() {
  const [temp, setTemp] = useState(20);
  const [dew, setDew] = useState(8);
  const [lifting, setLifting] = useState<"none" | "frontal" | "orographic" | "convergence" | "thermal">("none");

  const spread = Math.max(0, temp - dew);
  const lifted = lifting !== "none";
  // Lifting cools the parcel, which is what actually closes the spread.
  const effectiveSpread = lifted ? Math.max(0, spread - 6) : spread;
  const saturated = effectiveSpread <= 0.5;

  const response = saturated
    ? { value: "Saturated — cloud forms", tone: "brand" as Tone }
    : lifted
      ? { value: `Rising and cooling · ${effectiveSpread.toFixed(0)} °C from saturation`, tone: "caution" as Tone }
      : { value: `No lifting — nothing happens`, tone: "neutral" as Tone };

  return (
    <AtmosphereFrame
      diagram="wx-dewpoint-spread"
      diagramProps={{ spread: effectiveSpread }}
      response={{ label: "The parcel", value: response.value, tone: response.tone }}
      controls={
        <>
          <Slider
            label="Surface temperature"
            value={temp}
            min={0}
            max={35}
            step={1}
            onChange={(v) => {
              setTemp(v);
              if (dew > v) setDew(v);
            }}
            display={`${temp} °C`}
            tone="nogo"
          />
          <Slider
            label="Dew point"
            value={dew}
            min={-10}
            max={temp}
            step={1}
            onChange={setDew}
            display={`${dew} °C`}
            tone="brand"
          />
          <Segmented
            label="Lifting mechanism"
            value={lifting}
            options={[
              { value: "none", label: "None" },
              { value: "frontal", label: "Frontal" },
              { value: "orographic", label: "Orographic" },
              { value: "convergence", label: "Converge" },
              { value: "thermal", label: "Thermal" },
            ]}
            onChange={setLifting}
          />
        </>
      }
      readouts={[
        { label: "Surface spread", value: `${spread.toFixed(0)} °C`, tone: "neutral" },
        { label: "After lifting", value: `${effectiveSpread.toFixed(0)} °C`, tone: lifted ? "caution" : "neutral" },
        { label: "Relative humidity", value: saturated ? "100%" : "Below 100%", tone: saturated ? "brand" : "neutral" },
        { label: "Cloud", value: saturated ? "Forming" : "None", tone: saturated ? "brand" : "neutral" },
      ]}
      chain={
        lifted
          ? [
              { label: "Lifting acts", trend: "up" },
              { label: "Parcel rises", trend: "up" },
              { label: "Parcel cools", trend: "down" },
              { label: "Spread closes", trend: "down" },
              { label: saturated ? "Cloud" : "Not yet saturated", trend: saturated ? "up" : "same" },
            ]
          : [{ label: "No lifting mechanism — the parcel stays where it is" }]
      }
      note="Moisture alone builds nothing. It takes one of the four lifting methods to raise the parcel so it can cool to its dew point."
    />
  );
}

/** Push two air masses together and read the front. */
export function FrontLab() {
  const [kind, setKind] = useState<"cold" | "warm" | "stationary" | "occluded">("cold");

  const data = {
    cold: {
      advancing: "The cold air",
      slope: "Steep",
      stability: "Unstable",
      cloud: "Cumuliform",
      precip: "Showery",
      turb: "Frontal turbulence",
      tone: "brand" as Tone,
      note: "Steep lifting is what makes everything else about a cold front what it is.",
    },
    warm: {
      advancing: "The warm air",
      slope: "Shallow",
      stability: "Stable prior to passage",
      cloud: "Stratiform",
      precip: "Continuous",
      turb: "Little to none",
      tone: "nogo" as Tone,
      note: "Warm fronts barely lift, which is why there is no warm frontal turbulence at all.",
    },
    stationary: {
      advancing: "Neither",
      slope: "—",
      stability: "Warm-front-like",
      cloud: "Stratiform",
      precip: "Continuous",
      turb: "Little",
      tone: "caution" as Tone,
      note: "Neither air mass is powerful enough to move the other. Weather resembles a warm front, often less intense.",
    },
    occluded: {
      advancing: "Cold, overtaking warm",
      slope: "Both",
      stability: "Both",
      cloud: "Both types",
      precip: "Both",
      turb: "Both",
      tone: "violet" as Tone,
      note: "The wind shifts 180°, SE to NW, and you get the weather of both fronts over a potentially very widespread area.",
    },
  }[kind];

  return (
    <AtmosphereFrame
      diagram="wx-front"
      diagramProps={{ kind }}
      response={{
        label: "Weather at this front",
        value: `${data.stability} · ${data.cloud} · ${data.precip}`,
        tone: data.tone,
      }}
      controls={
        <Segmented
          label="Front type"
          value={kind}
          options={[
            { value: "cold", label: "Cold" },
            { value: "warm", label: "Warm" },
            { value: "stationary", label: "Stationary" },
            { value: "occluded", label: "Occluded" },
          ]}
          onChange={setKind}
        />
      }
      readouts={[
        { label: "Which air advances", value: data.advancing, tone: "neutral" },
        { label: "Slope of lifting", value: data.slope, tone: "neutral" },
        { label: "Cloud", value: data.cloud, tone: data.tone },
        { label: "Turbulence", value: data.turb, tone: data.turb === "Little to none" ? "go" : "caution" },
      ]}
      chain={[
        { label: data.advancing },
        { label: `${data.slope} lifting` },
        { label: data.stability },
        { label: data.cloud },
        { label: data.precip },
      ]}
      note={data.note}
    />
  );
}

/** Step through a thunderstorm and read the hazard at each option. */
export function StormLab() {
  const [option, setOption] = useState<"circumnavigate" | "over" | "under" | "through">("circumnavigate");
  const [topWind, setTopWind] = useState(40);

  const clearance = (topWind / 10) * 1000;

  const data = {
    circumnavigate: {
      priority: "First choice",
      requirement: "Lateral deviation around the cell",
      tone: "go" as Tone,
    },
    over: {
      priority: "Second choice",
      requirement: `${clearance.toLocaleString()} ft above the top`,
      tone: "caution" as Tone,
    },
    under: {
      priority: "Third choice",
      requirement: "Lower third of the base-to-ground distance",
      tone: "caution" as Tone,
    },
    through: {
      priority: "Last resort",
      requirement: "Lower third of the storm, with no angle",
      tone: "nogo" as Tone,
    },
  }[option];

  return (
    <AtmosphereFrame
      diagram="wx-storm-avoidance"
      diagramProps={{ option }}
      response={{
        label: `${data.priority} — what it requires`,
        value: data.requirement,
        tone: data.tone,
      }}
      controls={
        <>
          <Segmented
            label="Option"
            value={option}
            options={[
              { value: "circumnavigate", label: "Around" },
              { value: "over", label: "Over" },
              { value: "under", label: "Under" },
              { value: "through", label: "Through" },
            ]}
            onChange={setOption}
          />
          {option === "over" && (
            <Slider
              label="Wind at the top"
              value={topWind}
              min={10}
              max={120}
              step={10}
              onChange={setTopWind}
              display={`${topWind} kt`}
              tone="caution"
            />
          )}
        </>
      }
      readouts={[
        { label: "Priority", value: data.priority, tone: data.tone },
        {
          label: "Clearance if going over",
          value: `${clearance.toLocaleString()} ft`,
          tone: "caution",
          hint: "1,000 ft per 10 kt",
        },
        { label: "Hazards inside", value: "Hail, icing, microbursts", tone: "nogo" },
        { label: "And", value: "Extreme turbulence, lightning, tornados", tone: "nogo" },
      ]}
      chain={[
        { label: "Circumnavigate", trend: option === "circumnavigate" ? "up" : "same" },
        { label: "Over", trend: option === "over" ? "up" : "same" },
        { label: "Under", trend: option === "under" ? "up" : "same" },
        { label: "Through", trend: option === "through" ? "down" : "same" },
      ]}
      note={
        option === "over"
          ? `At ${topWind} kt over the top you would need ${clearance.toLocaleString()} ft of clearance — which is why going over is rarely practical.`
          : "The order is the priority order. Circumnavigating is always the first choice."
      }
    />
  );
}

/** Set the conditions and find out whether ice forms, and which kind. */
export function IcingLab() {
  const [temp, setTemp] = useState(-5);
  const [moisture, setMoisture] = useState<"visible" | "clear">("visible");
  const [conditions, setConditions] = useState<"stable" | "unstable">("unstable");

  const canForm = moisture === "visible" && temp < 0;
  const type =
    !canForm
      ? "None"
      : temp >= -10
        ? "Clear"
        : temp >= -20
          ? "Rime"
          : "Below the published bands";
  const mixedPossible = canForm && temp <= -8 && temp >= -15;

  const response = !canForm
    ? moisture === "clear"
      ? { value: "No visible moisture — no structural ice", tone: "go" as Tone }
      : { value: "Above freezing — no structural ice", tone: "go" as Tone }
    : { value: `${type} ice${mixedPossible ? ", or mixed" : ""}`, tone: temp >= -10 ? "nogo" as Tone : "brand" as Tone };

  return (
    <AtmosphereFrame
      diagram="wx-icing-ladder"
      diagramProps={{ temp }}
      response={{ label: "Expected icing", value: response.value, tone: response.tone }}
      controls={
        <>
          <Slider
            label="Free air temperature"
            value={temp}
            min={-25}
            max={5}
            step={1}
            onChange={setTemp}
            display={`${temp} °C`}
            tone={temp < 0 ? "brand" : "go"}
          />
          <Segmented
            label="Moisture"
            value={moisture}
            options={[
              { value: "visible", label: "Visible moisture" },
              { value: "clear", label: "Clear air" },
            ]}
            onChange={setMoisture}
          />
          <Segmented
            label="Conditions"
            value={conditions}
            options={[
              { value: "unstable", label: "Unstable · cumulus" },
              { value: "stable", label: "Stable · stratus" },
            ]}
            onChange={setConditions}
          />
        </>
      }
      readouts={[
        { label: "Visible moisture", value: moisture === "visible" ? "Present" : "Absent", tone: moisture === "visible" ? "caution" : "go" },
        { label: "FAT below freezing", value: temp < 0 ? "Yes" : "No", tone: temp < 0 ? "caution" : "go" },
        { label: "Primary type", value: type, tone: response.tone },
        { label: "Mixed possible", value: mixedPossible ? "Yes, −8 to −15" : "No", tone: mixedPossible ? "caution" : "neutral" },
      ]}
      chain={
        canForm
          ? [
              { label: "Visible moisture", trend: "up" },
              { label: "FAT below freezing", trend: "down" },
              { label: "Surface below freezing", trend: "down" },
              { label: `${type} ice`, trend: "up" },
            ]
          : [{ label: "One of the three conditions is missing — no ice can form" }]
      }
      note={
        conditions === "unstable" && temp >= -10 && canForm
          ? "Unstable conditions and large droplets are the clear ice signature — it spreads before it freezes, which is what alters the shape of the wing."
          : "Three conditions are required: visible moisture, free air temperature below freezing, and aircraft surface below freezing."
      }
    />
  );
}

/** Locate the pressure systems from the wind, and vice versa. */
export function WindLab() {
  const [level, setLevel] = useState<"gradient" | "surface" | "both">("both");

  const data = {
    gradient: {
      value: "Parallel to the isobars",
      detail: "Above 2,000 ft AGL",
      friction: "Negligible",
      tone: "brand" as Tone,
    },
    surface: {
      value: "Across the isobars, deflected by friction",
      detail: "Below 2,000 ft AGL",
      friction: "Turns the wind",
      tone: "caution" as Tone,
    },
    both: {
      value: "Same rotation, different angle to the isobars",
      detail: "2,000 ft AGL divides them",
      friction: "Only below 2,000 ft",
      tone: "brand" as Tone,
    },
  }[level];

  return (
    <AtmosphereFrame
      diagram="wx-pressure-field"
      diagramProps={{ level }}
      response={{ label: "The wind blows", value: data.value, tone: data.tone }}
      controls={
        <Segmented
          label="Altitude band"
          value={level}
          options={[
            { value: "gradient", label: "Above 2,000" },
            { value: "surface", label: "Below 2,000" },
            { value: "both", label: "Both" },
          ]}
          onChange={setLevel}
        />
      }
      readouts={[
        { label: "Band", value: data.detail, tone: "neutral" },
        { label: "Friction", value: data.friction, tone: "caution" },
        { label: "Around a LOW", value: "Counter-clockwise", tone: "nogo" },
        { label: "Around a HIGH", value: "Clockwise", tone: "brand" },
      ]}
      chain={[
        { label: "Uneven heating" },
        { label: "Pressure gradient", trend: "up" },
        { label: "PGF acts across the isobars" },
        { label: "Wind ends up parallel to them" },
      ]}
      note="Buys Ballot's Law falls straight out of this picture: stand with the wind at your back and the low is on your left."
    />
  );
}

/** Decode a station model and place each product in time. */
export function ProductLab() {
  const [knots, setKnots] = useState(25);
  const [product, setProduct] = useState<"none" | "metar" | "taf" | "csigmet" | "sigmet" | "airmet">("none");

  const rounded = Math.round(knots / 5) * 5;
  let left = rounded;
  const flags = Math.floor(left / 50);
  left -= flags * 50;
  const fulls = Math.floor(left / 10);
  left -= fulls * 10;
  const halves = Math.floor(left / 5);

  const validity = {
    none: { value: "Pick a product", tone: "neutral" as Tone, note: "" },
    metar: { value: "Hourly, xx:55–xx:59 · current conditions", tone: "brand" as Tone, note: "Used as the criteria for takeoff and landing." },
    taf: { value: "Every 6 hours · covers at least 24 hours", tone: "go" as Tone, note: "Used for planning. Elements persist until a later line changes them." },
    csigmet: { value: "Issued xx:55 · valid 2 hours", tone: "violet" as Tone, note: "Thunderstorm-related hazards only." },
    sigmet: { value: "Valid 4 hours · 6 for hurricanes", tone: "nogo" as Tone, note: "Severe icing, severe or extreme turbulence, dust or sand below 3 SM, volcanic ash." },
    airmet: { value: "Every 6 hours · at least 3,000 sq mi", tone: "caution" as Tone, note: "The MODERATE one. SIGMET is severe." },
  }[product];

  return (
    <AtmosphereFrame
      diagram={product === "none" || product === "metar" ? "wx-station-model" : "wx-product-timeline"}
      diagramProps={product === "none" || product === "metar" ? { knots: rounded } : { product }}
      response={{ label: "Validity", value: validity.value, tone: validity.tone }}
      controls={
        <>
          <Segmented
            label="Product"
            value={product}
            options={[
              { value: "none", label: "Barb only" },
              { value: "metar", label: "METAR" },
              { value: "taf", label: "TAF" },
              { value: "csigmet", label: "Conv SIG" },
              { value: "sigmet", label: "SIGMET" },
              { value: "airmet", label: "AIRMET" },
            ]}
            onChange={setProduct}
          />
          {(product === "none" || product === "metar") && (
            <Slider
              label="Wind speed on the barb"
              value={knots}
              min={0}
              max={95}
              step={5}
              onChange={setKnots}
              display={`${rounded} kt`}
              tone="brand"
            />
          )}
        </>
      }
      readouts={[
        { label: "Flags (50 kt)", value: String(flags), tone: "nogo" },
        { label: "Full lines (10 kt)", value: String(fulls), tone: "brand" },
        { label: "Half lines (5 kt)", value: String(halves), tone: "caution" },
        { label: "Total", value: `${rounded} kt`, tone: "neutral" },
      ]}
      note={
        validity.note ||
        "Build a barb from 50s first, then 10s, then a single 5. Cig on a station model is the ceiling in hundreds of feet."
      }
    />
  );
}
