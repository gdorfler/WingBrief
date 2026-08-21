"use client";

/**
 * Engines Sim Labs.
 *
 * Relationship simulators, not engine models. The sources publish directions,
 * splits and one break point (36,000 ft) — they do not publish a thrust table
 * or a compressor map, so nothing here computes an absolute value it cannot
 * justify. Where a magnitude appears it is explicitly relative.
 */

import { useState } from "react";
import { DiagramHost } from "@/components/diagrams/registry";
import { Formula, type Tone, cn } from "@/components/ui";
import { ChainStrip, Readout, Segmented, Slider } from "./controls";
import { STATIONS, STATION_CHANGES, STATION_LABEL, type Station } from "@/components/diagrams/engines";

/* ------------------------------------------------------------------ */
/* Frame                                                               */
/* ------------------------------------------------------------------ */

function LabFrame({
  diagram,
  diagramProps,
  controls,
  readouts,
  chain,
  formula,
  note,
}: {
  diagram: string;
  diagramProps: Record<string, unknown>;
  controls: React.ReactNode;
  readouts: { label: string; value: string; tone?: Tone; hint?: string; big?: boolean }[];
  chain?: { label: string; trend?: "up" | "down" | "same" }[];
  formula?: string;
  note?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface p-3">
            <DiagramHost id={diagram} props={diagramProps} />
          </div>
          {formula && (
            <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
              <Formula tex={formula} display />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-3.5">
          <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
            <p className="eyebrow text-navy-faint">Controls</p>
            {controls}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {readouts.map((r) => (
              <Readout key={r.label} {...r} />
            ))}
          </div>
        </div>
      </div>

      {chain && chain.length > 0 && <ChainStrip nodes={chain} />}

      {note && (
        <p className="rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[13px] leading-relaxed text-navy-soft">
          {note}
        </p>
      )}
    </div>
  );
}

const DIR_WORD: Record<string, string> = {
  up: "Increases",
  down: "Decreases",
  slightDown: "Slightly decreases",
  flat: "Unchanged",
};

const DIR_TONE: Record<string, Tone> = {
  up: "go",
  down: "nogo",
  slightDown: "caution",
  flat: "neutral",
};

/* ------------------------------------------------------------------ */
/* Labs                                                                */
/* ------------------------------------------------------------------ */

/** Step the gas path one station at a time and read what changes. */
export function EngineFlowLab() {
  const [station, setStation] = useState<Station>("inlet");
  const change = STATION_CHANGES[station];

  return (
    <LabFrame
      diagram="eng-cutaway"
      diagramProps={{ highlight: station }}
      controls={
        <Segmented<Station>
          label="Station"
          value={station}
          onChange={setStation}
          options={STATIONS.map((s) => ({ value: s, label: STATION_LABEL[s] }))}
        />
      }
      readouts={[
        { label: "Pressure", value: DIR_WORD[change.pressure], tone: DIR_TONE[change.pressure], big: true },
        { label: "Temperature", value: DIR_WORD[change.temperature], tone: DIR_TONE[change.temperature] },
        { label: "Velocity", value: DIR_WORD[change.velocity], tone: DIR_TONE[change.velocity] },
        {
          label: "Section role",
          value:
            station === "inlet"
              ? "Diffuser"
              : station === "compressor"
                ? "Adds energy"
                : station === "burner"
                  ? "Adds heat"
                  : station === "turbine"
                    ? "Extracts 75%"
                    : "Nozzle",
          tone: "brand",
        },
      ]}
      chain={[
        { label: "Inlet", trend: "up" },
        { label: "Compressor", trend: "up" },
        { label: "Burner", trend: "same" },
        { label: "Turbine", trend: "down" },
        { label: "Exhaust", trend: "down" },
      ]}
      note={
        station === "burner"
          ? "Combustion is the section people get wrong: pressure drops SLIGHTLY. The heat goes into temperature and velocity, not pressure."
          : "Step through all five stations. The whole engine is one continuous set of pressure, temperature and velocity trades."
      }
    />
  );
}

/** Shape and speed regime, and whether the duct is acting as a nozzle or diffuser. */
export function DuctLab() {
  const [shape, setShape] = useState<"convergent" | "divergent">("convergent");
  const [regime, setRegime] = useState<"subsonic" | "supersonic">("subsonic");

  const convergent = shape === "convergent";
  const subsonic = regime === "subsonic";
  // Subsonic obeys Bernoulli; supersonic inverts it.
  const velocityUp = subsonic ? convergent : !convergent;

  return (
    <LabFrame
      diagram="eng-duct"
      diagramProps={{ shape, regime }}
      controls={
        <>
          <Segmented<"convergent" | "divergent">
            label="Duct shape"
            value={shape}
            onChange={setShape}
            options={[
              { value: "convergent", label: "Convergent" },
              { value: "divergent", label: "Divergent" },
            ]}
          />
          <Segmented<"subsonic" | "supersonic">
            label="Flow regime"
            value={regime}
            onChange={setRegime}
            options={[
              { value: "subsonic", label: "Subsonic" },
              { value: "supersonic", label: "Supersonic" },
            ]}
          />
        </>
      }
      readouts={[
        { label: "Velocity", value: velocityUp ? "Increases" : "Decreases", tone: velocityUp ? "go" : "nogo", big: true },
        { label: "Pressure", value: velocityUp ? "Decreases" : "Increases", tone: velocityUp ? "nogo" : "go" },
        { label: "Acting as a", value: velocityUp ? "NOZZLE" : "DIFFUSER", tone: "brand" },
        { label: "Compressibility", value: subsonic ? "Treated as none" : "Significant", tone: "neutral" },
      ]}
      chain={[
        { label: subsonic ? "Subsonic" : "Supersonic", trend: "same" },
        { label: convergent ? "Convergent" : "Divergent", trend: "same" },
        { label: velocityUp ? "Velocity up" : "Velocity down", trend: velocityUp ? "up" : "down" },
      ]}
      note="Hold the shape and flip only the regime. The same duct does the opposite thing — which is why a supersonic nozzle is divergent."
    />
  );
}

/** Which way thrust moves for each factor, on a relative scale. */
export function ThrustFactorLab() {
  type Factor = "temperature" | "altitude" | "rpm" | "airspeed";
  const [factor, setFactor] = useState<Factor>("altitude");
  const [point, setPoint] = useState(0.4);

  const RANGE: Record<Factor, [number, number]> = {
    temperature: [-40, 45],
    altitude: [0, 50],
    rpm: [30, 100],
    airspeed: [0, 100],
  };
  const [lo, hi] = RANGE[factor];
  const marker = lo + (hi - lo) * point;

  const SUMMARY: Record<Factor, { label: string; value: string; tone: Tone }> = {
    temperature: { label: "Colder air is denser", value: "Thrust increases", tone: "go" },
    altitude: { label: "Pressure beats temperature", value: "Thrust decreases", tone: "nogo" },
    rpm: { label: "Strongly non-linear", value: "Thrust increases", tone: "go" },
    airspeed: { label: "Before ram effect", value: "Thrust decreases", tone: "caution" },
  };
  const summary = SUMMARY[factor];

  return (
    <LabFrame
      diagram="eng-thrust-factor"
      diagramProps={{ factor, marker }}
      formula="T = m \times a"
      controls={
        <>
          <Segmented<Factor>
            label="Factor"
            value={factor}
            onChange={setFactor}
            options={[
              { value: "temperature", label: "Temp" },
              { value: "altitude", label: "Altitude" },
              { value: "rpm", label: "RPM" },
              { value: "airspeed", label: "Airspeed" },
            ]}
          />
          <Slider
            label="Operating point"
            value={point}
            min={0}
            max={1}
            step={0.01}
            display={`${Math.round(point * 100)}%`}
            onChange={setPoint}
            hint="relative position along the range"
          />
        </>
      }
      readouts={[
        { label: summary.label, value: summary.value, tone: summary.tone, big: true },
        {
          label: "Mechanism",
          value: factor === "rpm" ? "Through acceleration" : "Through density / mass",
          tone: "brand",
        },
        ...(factor === "altitude"
          ? [{ label: "Break point", value: "36,000 ft", tone: "nogo" as Tone, hint: "temperature stabilises" }]
          : []),
        ...(factor === "airspeed"
          ? [{ label: "Ram effect", value: "Offsets the loss", tone: "go" as Tone, hint: "constant subsonic" }]
          : []),
      ]}
      note="The vertical scale is relative. The sources give the direction of each relationship and one break point; they do not publish a thrust table."
    />
  );
}

/** Stage count against overall pressure rise. */
export function CompressorLab() {
  const [stages, setStages] = useState(4);
  const [view, setView] = useState<"stages" | "spools">("stages");
  const dual = view === "spools";

  return (
    <LabFrame
      diagram={dual ? "eng-spools" : "eng-axial"}
      diagramProps={dual ? { dual: true } : { stages }}
      controls={
        <>
          <Segmented<"stages" | "spools">
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "stages", label: "Stages" },
              { value: "spools", label: "Spools" },
            ]}
          />
          {!dual && (
            <Slider
              label="Compressor stages"
              value={stages}
              min={2}
              max={8}
              step={1}
              display={String(stages)}
              onChange={setStages}
              hint="one rotor + one stator per stage"
            />
          )}
        </>
      }
      readouts={
        !dual
          ? [
              { label: "Stages", value: String(stages), tone: "brand", big: true },
              { label: "Blade rows", value: String(stages * 2), tone: "neutral" },
              {
                label: "Overall ratio",
                value: stages >= 7 ? "Toward 30:1" : stages >= 5 ? "Mid range" : "Toward 15:1",
                tone: "go",
                hint: "axial runs 15:1 to 30:1",
              },
              { label: "Highest pressure", value: "At the diffuser", tone: "caution" },
            ]
          : [
              { label: "Forward to aft", value: "LPC, HPC, HPT, LPT", tone: "brand", big: true },
              { label: "LP turbine drives", value: "LP compressor", tone: "neutral" },
              { label: "HP turbine drives", value: "HP compressor", tone: "neutral" },
              { label: "Benefit", value: "Smoother airflow", tone: "go", hint: "and stall resistance" },
            ]
      }
      chain={
        !dual
          ? [
              { label: "Rotor: velocity and pressure", trend: "up" },
              { label: "Stator: velocity", trend: "down" },
              { label: "Stator: pressure", trend: "up" },
              { label: "Diffuser: final rise", trend: "up" },
            ]
          : undefined
      }
      note={
        !dual
          ? "Each stage adds a modest pressure rise. Stacking them is the whole reason axial compressors reach 15:1 to 30:1."
          : "Two independent spools turning at different speeds ease the transition of air through the compressor — and it is one of the four stall-prevention features."
      }
    />
  );
}

/** Drive compressor blade AOA to the stall and read the indications. */
export function CompressorStallLab() {
  const [inletFlow, setInletFlow] = useState(1);
  const [rpm, setRpm] = useState(1);

  // Same geometry as the diagram, so lab and picture cannot disagree.
  const rwAngle = (Math.atan2(92 * rpm, 92 * inletFlow) * 180) / Math.PI;
  const aoa = rwAngle - 32;
  const stalled = aoa > 18;

  return (
    <LabFrame
      diagram={stalled ? "eng-stall-indications" : "eng-blade-aoa"}
      diagramProps={stalled ? { stalled: true } : { inletFlow, rpm }}
      controls={
        <>
          <Slider
            label="Inlet airflow"
            value={inletFlow}
            min={0.25}
            max={1.4}
            step={0.01}
            display={`×${inletFlow.toFixed(2)}`}
            onChange={setInletFlow}
            hint="disturbed air, attitude change, turbulence"
          />
          <Slider
            label="Compressor RPM"
            value={rpm}
            min={0.4}
            max={1.5}
            step={0.01}
            display={`×${rpm.toFixed(2)}`}
            onChange={setRpm}
            tone="caution"
            hint="rapid throttle movement"
          />
        </>
      }
      readouts={[
        { label: "Blade AOA", value: `${aoa.toFixed(0)}°`, tone: stalled ? "nogo" : "neutral", big: true },
        { label: "State", value: stalled ? "STALLED" : "Attached", tone: stalled ? "nogo" : "go" },
        { label: "RPM", value: stalled ? "Decays" : "Steady", tone: stalled ? "nogo" : "neutral" },
        { label: "ITT", value: stalled ? "Rises" : "Steady", tone: stalled ? "nogo" : "neutral" },
      ]}
      chain={[
        { label: "Inlet airflow", trend: inletFlow < 1 ? "down" : inletFlow > 1 ? "up" : "same" },
        { label: "Compressor RPM", trend: rpm > 1 ? "up" : rpm < 1 ? "down" : "same" },
        { label: "Relative wind swings", trend: aoa > 10 ? "up" : "same" },
        { label: "Blade AOA", trend: stalled ? "up" : "same" },
      ]}
      note={
        stalled
          ? "Recovery, in order: lower the nose to reduce inlet AOA, slowly retard the PCL, bleed valves increase airflow, then slowly advance the PCL."
          : "Two controls, one outcome. Reducing inlet airflow and raising RPM both swing the relative wind toward a stall."
      }
    />
  );
}

/** Trace turboprop power and compare thrust splits across engine types. */
export function TurbopropLab() {
  type Stage = "combustion" | "turbine" | "shaft" | "rgb" | "prop";
  type EngType = "turbojet" | "turbofan" | "turboprop" | "turboshaft";
  const [step, setStep] = useState<Stage>("combustion");
  const [type, setType] = useState<EngType>("turboprop");
  const isProp = type === "turboprop";

  const DETAIL: Record<Stage, { label: string; value: string; tone: Tone }> = {
    combustion: { label: "Combustion", value: "Heat energy released", tone: "nogo" },
    turbine: { label: "Turbine", value: "Extracts 75%", tone: "caution" },
    shaft: { label: "Shaft", value: "High RPM, low torque", tone: "neutral" },
    rgb: { label: "Reduction gear box", value: "Trades RPM for torque", tone: "brand" },
    prop: { label: "Propeller", value: "90% of thrust", tone: "go" },
  };
  const detail = DETAIL[step];

  const TYPE_FACTS: Record<EngType, { source: string; strength: string; weakness: string }> = {
    turbojet: { source: "All exhaust", strength: "Highest and fastest", weakness: "High TSFC" },
    turbofan: { source: "Core + fan", strength: "Low TSFC, quiet", weakness: "Large frontal area" },
    turboprop: { source: "90% prop", strength: "Short-field lift", weakness: "Speed limited" },
    turboshaft: { source: "All rotor", strength: "Rotor drive", weakness: "No exhaust thrust" },
  };
  const facts = TYPE_FACTS[type];

  return (
    <LabFrame
      diagram={isProp ? "eng-turboprop-flow" : "eng-type-split"}
      diagramProps={isProp ? { highlight: step } : { type }}
      controls={
        <>
          <Segmented<EngType>
            label="Engine type"
            value={type}
            onChange={setType}
            options={[
              { value: "turbojet", label: "Jet" },
              { value: "turbofan", label: "Fan" },
              { value: "turboprop", label: "Prop" },
              { value: "turboshaft", label: "Shaft" },
            ]}
          />
          {isProp && (
            <Segmented<Stage>
              label="Stage"
              value={step}
              onChange={setStep}
              options={[
                { value: "combustion", label: "Burn" },
                { value: "turbine", label: "Turbine" },
                { value: "shaft", label: "Shaft" },
                { value: "rgb", label: "RGB" },
                { value: "prop", label: "Prop" },
              ]}
            />
          )}
        </>
      }
      readouts={
        isProp
          ? [
              { label: detail.label, value: detail.value, tone: detail.tone, big: true },
              { label: "Thrust split", value: "90% prop, 10% exhaust", tone: "brand" },
              { label: "TSFC", value: "Lowest of any GTE", tone: "go" },
              { label: "Speed limit", value: "≈ 400–450 kt", tone: "caution" },
            ]
          : [
              { label: "Thrust source", value: facts.source, tone: "brand", big: true },
              { label: "Strength", value: facts.strength, tone: "go" },
              { label: "Weakness", value: facts.weakness, tone: "nogo" },
            ]
      }
      note={
        isProp
          ? "The reduction gear box is the point of the whole arrangement: without it the propeller tips would go supersonic and efficiency would collapse."
          : "Match the engine to the mission by where its thrust comes from. A turboshaft gets nothing at all from exhaust; a turboprop still gets 10%."
      }
    />
  );
}

/** Trace fuel and oil through their systems. */
export function SystemsTraceLab() {
  type Sub = "pressure" | "scavenge" | "breather";
  const [system, setSystem] = useState<"fuel" | "oil">("fuel");
  const [fuelStep, setFuelStep] = useState(4);
  const [oilSub, setOilSub] = useState<Sub>("pressure");
  const isFuel = system === "fuel";

  const fuelNodes = ["tank", "boost", "filter", "pump", "fcu", "pd", "manifold", "nozzle"];
  const fuelDetail = [
    { label: "Fuel tank", value: "Holding cell", tone: "neutral" as Tone },
    { label: "Boost pump", value: "Prevents aeration", tone: "go" as Tone },
    { label: "LP filter", value: "Strains impurities", tone: "neutral" as Tone },
    { label: "Engine-driven pump", value: "High pressure supply", tone: "brand" as Tone },
    { label: "Fuel Control Unit", value: "Meters to demand", tone: "caution" as Tone },
    { label: "P&D valve", value: "Drains at shutdown", tone: "neutral" as Tone },
    { label: "Manifolds", value: "Primary and secondary", tone: "brand" as Tone },
    { label: "Fuel nozzles", value: "Atomized spray", tone: "go" as Tone },
  ][fuelStep];

  const OIL: Record<Sub, { label: string; value: string; tone: Tone }> = {
    pressure: { label: "Pressure", value: "Supplies engine + AGB", tone: "brand" },
    scavenge: { label: "Scavenge", value: "Returns and cools", tone: "caution" },
    breather: { label: "Breather", value: "Pressurizes sumps", tone: "go" },
  };
  const oilDetail = OIL[oilSub];

  return (
    <LabFrame
      diagram={isFuel ? "eng-fuel-system" : "eng-oil-system"}
      diagramProps={isFuel ? { highlight: fuelNodes[fuelStep] } : { subsystem: oilSub }}
      controls={
        <>
          <Segmented<"fuel" | "oil">
            label="System"
            value={system}
            onChange={setSystem}
            options={[
              { value: "fuel", label: "Fuel" },
              { value: "oil", label: "Oil" },
            ]}
          />
          {isFuel ? (
            <Slider
              label="Component"
              value={fuelStep}
              min={0}
              max={7}
              step={1}
              display={fuelDetail.label}
              onChange={setFuelStep}
              hint="follow the path from tank to nozzle"
            />
          ) : (
            <Segmented<Sub>
              label="Subsystem"
              value={oilSub}
              onChange={setOilSub}
              options={[
                { value: "pressure", label: "Pressure" },
                { value: "scavenge", label: "Scavenge" },
                { value: "breather", label: "Breather" },
              ]}
            />
          )}
        </>
      }
      readouts={
        isFuel
          ? [
              { label: fuelDetail.label, value: fuelDetail.value, tone: fuelDetail.tone, big: true },
              { label: "FCU senses", value: "CIT, RPM, ITT, PCL", tone: "caution" },
            ]
          : [
              { label: oilDetail.label, value: oilDetail.value, tone: oilDetail.tone, big: true },
              { label: "Scavenge capacity", value: "Greater than pressure", tone: "caution" },
              { label: "Chip detector", value: "In the scavenge path", tone: "nogo" },
              { label: "Viscosity", value: "Inverse to temperature", tone: "neutral" },
            ]
      }
      note={
        isFuel
          ? "Everything upstream of the FCU simply delivers clean fuel at pressure. The FCU is what decides how much the engine actually gets."
          : "Three subsystems: pressure supplies, scavenge returns, breather pressurizes. Scavenge is deliberately the bigger pump."
      }
    />
  );
}

/** Present symptoms, ask for the cause, then show the mechanism. */
const CASES = [
  {
    symptom: "RPM decays and ITT rises with the PCL untouched, plus loud bangs.",
    options: ["Compressor stall", "Hot start", "Oil contamination", "Boost pump failure"],
    answer: 0,
    mechanism:
      "Airflow has broken away from the compressor blades. Reduce aircraft attitude to lower inlet AOA, then slowly retard the PCL so the engine can catch up with the airflow.",
    diagram: "eng-stall-indications",
    props: { stalled: true },
  },
  {
    symptom: "During start, compressor RPM stabilizes below normal while turbine temperature keeps climbing.",
    options: ["False start", "Hung start", "Wet start", "Hot start"],
    answer: 1,
    mechanism:
      "A hung start. RPM low AND temperature rising is what separates it from a false start, where temperature stays within limits.",
    diagram: "eng-start-sequence",
    props: { stage: "fuel" },
  },
  {
    symptom: "During afterburner selection the engine surges and back pressure builds.",
    options: ["FOD", "Variable exhaust nozzle failed to open", "Boost pump cavitation", "Chip detector fault"],
    answer: 1,
    mechanism:
      "If the nozzle cannot open, expanding gases have nowhere to go. Back pressure travels forward through the engine and stalls the compressor.",
    diagram: "eng-cutaway",
    props: { highlight: "exhaust" },
  },
  {
    symptom: "A cockpit warning light illuminates from the oil system after a period of rough running.",
    options: ["Low fuel pressure", "Magnetic chip detector", "Bleed air overtemp", "Hydraulic fuse"],
    answer: 1,
    mechanism:
      "The magnetic chip detector sits in the scavenge oil path and lights once it has collected enough metal particles — the most common form of oil contamination.",
    diagram: "eng-oil-system",
    props: { subsystem: "scavenge" },
  },
];

export function MalfunctionLab() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const scenario = CASES[caseIndex];
  const correct = picked === scenario.answer;

  return (
    <div className="space-y-4">
      <Segmented<string>
        label="Case"
        value={String(caseIndex)}
        onChange={(v) => {
          setCaseIndex(Number(v));
          setPicked(null);
        }}
        options={CASES.map((_, i) => ({ value: String(i), label: String(i + 1) }))}
      />

      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="eyebrow mb-2 text-navy-faint">Indications</p>
        <p className="text-[15px] font-semibold leading-snug text-navy">{scenario.symptom}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {scenario.options.map((opt, i) => {
          const isPicked = picked === i;
          const isAnswer = i === scenario.answer;
          const graded = picked !== null;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setPicked(i)}
              disabled={graded}
              className={cn(
                "rounded-xl border px-3.5 py-3 text-left text-[13.5px] font-semibold transition-colors",
                graded && isAnswer && "border-go bg-go-soft text-go",
                graded && isPicked && !isAnswer && "border-nogo bg-nogo-soft text-nogo",
                !graded && "border-line bg-surface text-navy hover:border-brand/50",
                graded && !isPicked && !isAnswer && "border-line bg-surface text-navy-faint",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <>
          <div className="overflow-hidden rounded-2xl border border-line bg-surface p-3">
            <DiagramHost id={scenario.diagram} props={scenario.props} />
          </div>
          <p
            className={cn(
              "rounded-2xl border px-4 py-3 text-[13.5px] leading-relaxed",
              correct ? "border-go/30 bg-go-soft/50 text-navy" : "border-caution/30 bg-caution-soft/50 text-navy",
            )}
          >
            <span className="font-bold">{correct ? "Correct. " : "Not quite. "}</span>
            {scenario.mechanism}
          </p>
        </>
      )}
    </div>
  );
}
