"use client";

import { useId } from "react";
import { discoveryModel } from "@/lib/discovery";

// Fixed, irregular sample positions: no random render values or disappearing particles.
const PARTICLES = [
  [.06, .12], [.26, .06], [.47, .19], [.73, .09], [.92, .24],
  [.14, .38], [.35, .29], [.62, .38], [.81, .43], [.98, .53],
  [.04, .65], [.25, .57], [.46, .49], [.57, .72], [.76, .65],
  [.15, .91], [.36, .82], [.48, .98], [.69, .94], [.92, .85],
  [.02, .99], [.97, .02], [.04, .01], [.86, .99],
] as const;

export function DensityDiscoveryDiagram({ value }: { value: number }) {
  const id = useId();
  const model = discoveryModel("density", value);
  const width = 220 * model.value;
  const wall = 60 + width;
  return <>
    <div className="density-constant"><strong>Same air. Mass stays fixed.</strong><span>Sealed inside · no air enters or leaves</span></div>
    <svg className="motion-discovery-diagram density-chamber" viewBox="0 0 600 280" role="img" aria-label={`Side view of a sealed air sample. Only the blue space contains the measured air. The same 24 particle symbols occupy ${model.value.toFixed(2)} times the starting volume, at ${model.density.toFixed(2)} times the starting density. The cross-section stays fixed. Symbols are enlarged and still; real molecules move.`}>
      <defs>
        <marker id={`${id}-arrow`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 1 9 5 0 9Z" fill="#1767bc"/></marker>
        <pattern id={`${id}-outside`} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V12" stroke="#b4c2c5" strokeWidth="2" opacity=".3"/></pattern>
      </defs>
      <path d="M60 65H530M60 197H530" stroke="#acbdc2" strokeWidth="2"/>
      <rect x={wall+14} y="70" width={Math.max(0, 536-wall)} height="122" fill={`url(#${id}-outside)`}/>
      <path d={`M${wall+14} 131h48`} stroke="#9bafb9" strokeWidth="8"/>
      <path d={`M${wall+62} 114v34`} stroke="#698997" strokeWidth="6" strokeLinecap="round"/>
      <rect className="density-air-sample" x="60" y="65" width={width} height="132" rx="9" fill="#c8e4ef" stroke="#417d9c" strokeWidth="2"/>
      <path d={`M69 72H${wall-7}`} stroke="#f8fcff" strokeWidth="3"/>
      {PARTICLES.map(([x, y], index) => <g className="density-particle" key={index} transform={`translate(${74+x*(width-30)} ${85+y*95}) rotate(${index*73%180})`}>
        <circle cx="-3" r="4.5" fill="#4e8eb4"/><circle cx="3" r="4.5" fill="#236487"/><circle cx="-4" cy="-1.5" r="1.3" fill="#dbeef8"/>
      </g>)}
      {model.value > 1 && <path className="density-start-wall" d="M280 59V203" stroke="#587383" strokeWidth="2" strokeDasharray="5 5"/>}
      {model.value >= 1.3 && <text x="280" y="48" textAnchor="middle" className="density-small-label">Start</text>}
      <rect x={wall} y="62" width="14" height="138" rx="4" fill="#698997" stroke="#335368" strokeWidth="2"/>
      <path d={`M${wall+4} 74V187`} stroke="#c8d9dd" strokeWidth="2"/>
      <path d={`M${wall+7} 55V36`} stroke="#526c7c" strokeWidth="1.5"/>
      <text x={wall+7} y="25" textAnchor="middle">Sealed piston</text>
      {model.value <= 1.5 && <text x={(wall+550)/2} y="229" textAnchor="middle" className="density-small-label">Outside sample</text>}
      <path d={`M63 220H${wall-3}`} stroke="#1767bc" strokeWidth="2" markerStart={`url(#${id}-arrow)`} markerEnd={`url(#${id}-arrow)`}/>
      <text x={60+width/2} y="253" textAnchor="middle">Length · {model.value.toFixed(2)}×</text>
    </svg>
    <p className="density-geometry"><span className="density-sample-key"/>Only the blue space is measured.<br/><strong>Same cross-section × longer chamber = more volume.</strong></p>
  </>;
}

export function DensityComparison({ value }: { value: number }) {
  const model = discoveryModel("density", value);
  return <div className="density-comparison">
    <p className="density-conclusion">{model.value === 2 ? "Twice the space. Half the density." : model.value > 1 ? "More space. Lower density." : "One sample. One starting point."}</p>
    <table aria-label="Density experiment: starting values compared with now">
      <thead><tr><td/><th scope="col">Start</th><th scope="col">Now</th></tr></thead>
      <tbody>
        <tr><th scope="row">Volume</th><td>1×</td><td>{model.value.toFixed(2)}×</td></tr>
        <tr className="density-result"><th scope="row">Density</th><td>1×</td><td>{model.density.toFixed(2)}×</td></tr>
      </tbody>
    </table>
    <p className="density-equation">Density = fixed mass ÷ volume<br/><strong>1 ÷ {model.value.toFixed(2)} = {model.density.toFixed(2)}× starting density</strong></p>
    <p className="density-model-note">Relative values · particle symbols enlarged and still; real molecules move.</p>
  </div>;
}
