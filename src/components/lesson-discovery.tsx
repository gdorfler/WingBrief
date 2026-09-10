"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ArrowRight, FlaskConical } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { discoveryModel, type DiscoveryScreen, type Experiment } from "@/lib/discovery";
import { cn } from "./ui";
import { MotionDiscoveryDiagram } from "./diagrams/motion-discovery";
import { DensityComparison } from "./diagrams/density-discovery";

export function LessonDiscovery({ screen, onReady }: { screen: DiscoveryScreen; onReady: () => void }) {
  const [prediction, setPrediction] = useState<number | null>(null);
  const [value, setValue] = useState(screen.experiment === "balance" ? 0 : 1);
  const [explored, setExplored] = useState(false);
  const controls = useRef<HTMLDivElement>(null);
  const feedback = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    // Density's live comparison sits beside its control; don't pull it away at 2×.
    if (explored && screen.experiment !== "density") feedback.current?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "instant" : "smooth" });
  }, [explored, reduceMotion, screen.experiment]);
  useEffect(() => {
    if (prediction !== null) {
      controls.current?.querySelector<HTMLElement>("input,button")?.focus({ preventScroll: true });
      if (screen.experiment === "density") controls.current?.scrollIntoView({ block: "center", behavior: reduceMotion ? "instant" : "smooth" });
    }
  }, [prediction, reduceMotion, screen.experiment]);
  const model = discoveryModel(screen.experiment, value);
  const change = (next: number) => {
    if (prediction === null) return;
    const updated = discoveryModel(screen.experiment, next);
    setValue(updated.value);
    if (updated.complete && !explored) { setExplored(true); onReady(); }
  };
  const controlPanel = <div ref={controls} className="discovery-controls">
    <p className="discovery-task">{screen.task}</p>
    {screen.experiment === "balance" ? <div className="discovery-toggle" role="group" aria-label={screen.controlLabel}>
      {["Straight & steady", "Steady turn"].map((label, index) => <button key={label} type="button" aria-pressed={value === index} onClick={() => change(index)}>{label}</button>)}
    </div> : <>
      <label htmlFor="discovery-control">{screen.controlLabel}<output htmlFor="discovery-control">{value.toFixed(2)}×</output></label>
      <input id="discovery-control" type="range" min={model.min} max={model.max} step={0.05} value={value} onChange={event => change(Number(event.target.value))} aria-valuetext={screen.experiment === "density" ? `Volume ${value.toFixed(2)} times starting volume; density ${model.density.toFixed(2)} times starting density; mass unchanged` : `${value.toFixed(2)} times the starting value`}/>
      <div className="discovery-range-ends"><span>Original · 1×</span><span>Double · 2×</span></div>
    </>}
  </div>;
  return <section className="discovery" aria-labelledby="discovery-heading">
    <p className="discovery-kicker"><FlaskConical size={16}/> {prediction === null ? "Predict" : explored ? "Discovered" : "Explore"} <span>· practice, not scored</span></p>
    <h2 id="discovery-heading">{screen.headline}</h2>
    <p className="discovery-lead">{screen.line}</p>
    <ExperimentScene experiment={screen.experiment} value={value} showComparison={prediction !== null}>
      {screen.experiment === "density" && (prediction !== null ? controlPanel : <p className="density-interaction-cue">Predict below, then move the piston <ArrowRight size={16}/></p>)}
    </ExperimentScene>
    {prediction === null ? <fieldset className="discovery-prediction">
      <legend>{screen.prediction}</legend>
      <div>{screen.options.map((option, index) => <button type="button" key={option} onClick={() => setPrediction(index)}><span>{String.fromCharCode(65 + index)}</span>{option}<ArrowRight size={17}/></button>)}</div>
    </fieldset> : <>
      <p className="discovery-predicted">Your prediction: <strong>{screen.options[prediction]}</strong></p>
      {screen.experiment !== "density" && controlPanel}
      <div ref={feedback} className={cn("discovery-feedback", explored && "is-discovered")} role="status" aria-live="polite">
        {explored ? <><Check size={22}/><div><strong>{prediction === screen.answer ? "Your prediction checks out." : "A useful surprise."}</strong><p>{screen.takeaway}</p></div></> : <p>Try the change above to test your prediction.</p>}
      </div>
      {explored && screen.flightConnection && <aside className="discovery-flight-connection" aria-label="Why air density matters in flight"><h3>Why it matters in flight</h3><p>{screen.flightConnection.line}</p><p>{screen.flightConnection.caveat}</p></aside>}
    </>}
  </section>;
}

/** One variable per scene; all quantities are ratios to the initial state. */
function ExperimentScene({ experiment, value, children, showComparison }: { experiment: Experiment; value: number; children?: ReactNode; showComparison: boolean }) {
  const model = discoveryModel(experiment, value);
  const readouts = experiment === "moment"
    ? [["Force", "1×"], ["Arm", `${value.toFixed(2)}×`], ["Moment", `${model.moment.toFixed(2)}×`]]
    : experiment === "energy"
        ? [["Speed", "1×"], ["Potential energy", `${model.potentialEnergy.toFixed(2)}×`], ["Kinetic energy", "1×"]]
        : [["Net moment", "Zero"], ["Net force", model.turning ? "Inward" : "Zero"], ["Equilibrium", model.turning ? "No" : "Yes"]];
  return <div className="discovery-scene" data-experiment={experiment}>
    <MotionDiscoveryDiagram experiment={experiment} value={value}/>
    {children}
    {experiment === "density" ? (showComparison && <DensityComparison value={value}/>) : <>
      <dl className="discovery-readouts">{readouts.map(([label, result]) => <div key={label}><dt>{label}</dt><dd>{result}</dd></div>)}</dl>
      <p className="discovery-scale">{experiment === "balance" ? "Idealized flight conditions" : "Relative model · starting values = 1×"}</p>
    </>}
  </div>;
}
