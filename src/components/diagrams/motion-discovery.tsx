"use client";

import { useId } from "react";
import type { Experiment } from "@/lib/discovery";
import { DensityDiscoveryDiagram } from "./density-discovery";

const BLUE = "#1767bc";
const ORANGE = "#ce501d";
const NAVY = "#20394a";

/** A trainer in true side elevation: nose right, propeller forward. */
function SideTrainer({ ghost = false }: { ghost?: boolean }) {
  return <g opacity={ghost ? .22 : 1}>
    <path d="M-92 13Q-35 30 57 19L83 6 83-3Q42-17 2-11L-33 3-66 1-81-39-94-40-88 8Z" fill={ghost ? "#b8c9d0" : "#fffaf0"} stroke={NAVY} strokeWidth="2" strokeLinejoin="round"/>
    <path d="M-27 2-7-20Q13-27 33-9L38 1Z" fill="#7aa3bc" stroke={NAVY} strokeWidth="2"/>
    <path d="M5-22 12 1M-83-36-74-9" stroke={ghost ? NAVY : "#df883c"} strokeWidth="3"/>
    <path d="M-84 12Q-13 21 79 5" fill="none" stroke={ghost ? NAVY : "#df883c"} strokeWidth="4"/>
    <path d="M-11 12-39 32 28 24 48 12Z" fill="#dce5e5" stroke={NAVY} strokeWidth="2"/>
    <path d="M-88 10-108 20-64 16Z" fill="#dce5e5" stroke={NAVY} strokeWidth="2"/>
    <path d="M87-31V34" stroke={NAVY} strokeWidth="4" strokeLinecap="round"/>
    <path d="M82-5 97 2 82 9Z" fill="#e9ad60" stroke={NAVY} strokeWidth="2"/>
    <circle cx="-14" cy="35" r="5" fill={NAVY}/><circle cx="64" cy="27" r="4" fill={NAVY}/>
    <path d="M-14 22V30M63 17 64 23" stroke={NAVY} strokeWidth="2"/>
  </g>;
}

/** Top elevation, nose up. Rotations describe heading, never bank angle. */
function TopTrainer() {
  return <g>
    <path d="M-7-24-53 3-54 15-8 4-6 32-23 43-23 50 0 43 23 50 23 43 6 32 8 4 54 15 53 3 7-24Z" fill="#e4e9e6" stroke={NAVY} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M0-52Q12-46 9-11L5 34 0 44-5 34-9-11Q-12-46 0-52Z" fill="#fff8e7" stroke={NAVY} strokeWidth="1.8"/>
    <path d="M-6-25Q0-33 6-25L5-9Q0-5-5-9Z" fill="#6e97b2" stroke={NAVY}/>
    <path d="M-38 5-14-8M38 5 14-8M0 12V37" stroke="#d28b37" strokeWidth="3"/>
    <path d="M-20-53H20" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"/>
  </g>;
}

function Arrows({ id }: { id: string }) {
  return <defs>{[["motion", BLUE], ["force", ORANGE], ["dimension", NAVY]].map(([kind, color]) => <marker key={kind} id={`${id}-${kind}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 1 9 5 0 9Z" fill={color}/></marker>)}</defs>;
}

export function MotionDiscoveryDiagram({ experiment, value }: { experiment: Experiment; value: number }) {
  const id = useId();
  const arrow = (kind: string) => `url(#${id}-${kind})`;
  const forceX = 145 + 150 * value;
  const planeY = 250 - 85 * value;
  const turning = experiment === "balance" && value === 1;
  if (experiment === "density") return <DensityDiscoveryDiagram value={value}/>;
  const descriptions: Record<Experiment, string> = {
    moment: "A downward force acts at right angles to a hinged arm. Moving the force farther from the hinge increases clockwise turning effect.",
    density: "A movable wall expands a sealed air chamber. The same 24 illustrated particles occupy more space; their mass is unchanged.",
    energy: "An aircraft points and travels right at constant speed. Height is measured vertically above a fixed reference. The ghost marks the original height.",
    balance: turning ? "Top view: the aircraft travels tangent to a circular path. Velocity points down the page and net force points left toward the turn centre. Net moment remains zero." : "Top view: the aircraft travels straight to the right at constant speed. Net force and net moment are zero.",
  };
  return <>
    <div className="experiment-view-label">{experiment === "moment" ? "Hinged arm · side view" : experiment === "energy" ? "Same aircraft · same speed" : "Flight path · top view"}</div>
    <svg className="motion-discovery-diagram" viewBox="0 0 600 310" role="img" aria-label={descriptions[experiment]}>
      <Arrows id={id}/>
      {experiment === "moment" && <>
        <path d="M70 201H515" stroke="#c9d6d8" strokeWidth="2"/>
        <rect x="111" y="176" width="68" height="20" rx="5" fill="#bccad0"/>
        <path d="M126 177 145 135 164 177Z" fill="#8196a4" stroke={NAVY} strokeWidth="2"/>
        <rect x="125" y="123" width="372" height="18" rx="8" fill="#c0d3df" stroke="#59758a" strokeWidth="2"/>
        <path d="M161 128H483" stroke="#f8fbfc" strokeWidth="3"/>
        <circle cx="145" cy="132" r="11" fill="#f8f7ef" stroke={NAVY} strokeWidth="3"/>
        <circle cx="145" cy="132" r="3" fill={NAVY}/>
        <path d="M108 101 135 122" stroke="#718793" strokeWidth="1.5"/>
        <text x="94" y="93" textAnchor="middle">Hinge</text>
        <path d={`M${forceX} 60V120`} stroke={ORANGE} strokeWidth="6" markerEnd={arrow("force")}/>
        <text x={forceX} y="40" textAnchor="middle" className="force-label">Force F · fixed</text>
        <path d={`M145 147V238M${forceX} 145V238`} stroke="#95adbb" strokeWidth="1.5" strokeDasharray="4 5"/>
        <path d={`M150 224H${forceX-5}`} stroke={BLUE} strokeWidth="2" markerStart={arrow("motion")} markerEnd={arrow("motion")}/>
        <path d={`M${forceX-15} 224V209H${forceX}`} fill="none" stroke={NAVY} strokeWidth="1.5"/>
        <text x={(145+forceX)/2} y="260" textAnchor="middle">Arm d · {value.toFixed(1)}×</text>
        {value > 1 && <path d="M295 143V232" stroke="#95adbb" strokeWidth="1.5" strokeDasharray="3 5"/>}
        <path d="M93 55A79 79 0 0 1 215 83" fill="none" stroke={BLUE} strokeWidth={2.5 * value} markerEnd={arrow("motion")}/>
        <text x="300" y="296" textAnchor="middle">M = F × d</text>
      </>}
      {experiment === "energy" && <>
        <path d="M55 250H548" stroke="#849d9b" strokeWidth="2" strokeDasharray="6 5"/>
        <path d="M55 260Q160 249 240 264T548 261V276H55Z" fill="#d3dfd3"/>
        {value > 1 && <><g transform="translate(310 165) scale(.8)"><SideTrainer ghost/></g><path d="M116 165H210" stroke="#a7bac2" strokeWidth="1.5" strokeDasharray="4 5"/></>}
        <path d={`M103 246V${planeY+4}`} stroke={BLUE} strokeWidth="2.5" markerStart={arrow("motion")} markerEnd={arrow("motion")}/>
        <path d={`M87 ${planeY}H203`} stroke="#95adbb" strokeWidth="1.5" strokeDasharray="4 5"/>
        <g transform={`translate(310 ${planeY}) scale(.8)`}><SideTrainer/></g>
        <path d={`M401 ${planeY}H524`} stroke={BLUE} strokeWidth="4" markerEnd={arrow("motion")}/>
        <text x="461" y={planeY-17} textAnchor="middle">Velocity</text>
        <text x="76" y={(250+planeY)/2} textAnchor="middle">h</text>
        <text x="300" y="302" textAnchor="middle">Fixed reference · h = 0</text>
      </>}
      {experiment === "balance" && <>
        {turning ? <>
          <circle cx="275" cy="155" r="100" fill="none" stroke="#91adbc" strokeWidth="2" strokeDasharray="5 7"/>
          <circle cx="275" cy="155" r="4" fill={ORANGE}/>
          <text x="268" y="130" textAnchor="middle">Turn centre</text>
          <g transform="translate(375 155) rotate(180)"><TopTrainer/></g>
          <path d="M363 155H287" stroke={ORANGE} strokeWidth="5" markerEnd={arrow("force")}/>
          <path d="M455 130V227" stroke={BLUE} strokeWidth="4" markerEnd={arrow("motion")}/>
          <text x="472" y="154">v</text>
          <text x="265" y="207" textAnchor="middle" className="force-label">Net force</text>
        </> : <>
          <path d="M78 155H522" stroke="#91adbc" strokeWidth="2" strokeDasharray="5 7"/>
          <g transform="translate(280 155) rotate(90)"><TopTrainer/></g>
          <path d="M370 155H494" stroke={BLUE} strokeWidth="4" markerEnd={arrow("motion")}/>
          <text x="434" y="128" textAnchor="middle">Velocity</text>
          <text x="280" y="248" textAnchor="middle">Net force = 0</text>
        </>}
        <text x="300" y="296" textAnchor="middle">{turning ? "Speed steady · direction changing" : "Speed steady · direction steady"}</text>
      </>}
    </svg>
    <div className="experiment-legend">
      {experiment === "moment" ? <><span><i className="force-key"/>Applied force</span><span><i/>Arm / turning effect</span></> : experiment === "balance" ? <><span><i/>Velocity · travel direction</span>{turning && <span><i className="force-key"/>Net force · inward</span>}</> : experiment === "energy" ? <><span><i/>Velocity and height</span><span><i className="ghost-key"/>Original height</span></> : <span>Same particle count · fixed mass</span>}
    </div>
  </>;
}

/** Equal and opposite interaction forces act on different bodies, not one aircraft. */
export function NewtonInteractionDiagram() {
  const id = useId();
  return <div className="newton-interaction">
    <svg viewBox="0 0 600 290" role="img" aria-label="The propeller pushes air backward. The air exerts an equal and opposite forward force on the aircraft. These forces act on different bodies.">
      <Arrows id={id}/>
      <g transform="translate(290 132) scale(.85)"><SideTrainer/></g>
      {[180,204,228].map(y => <path key={y} d={`M390 ${y}Q300 ${y-8} 175 ${y}`} stroke="#9db8c5" strokeWidth="2" fill="none" strokeDasharray="5 6"/>)}
      <path d="M314 213H165" stroke={ORANGE} strokeWidth="5" markerEnd={`url(#${id}-force)`}/>
      <path d="M370 68H519" stroke={ORANGE} strokeWidth="5" markerEnd={`url(#${id}-force)`}/>
      <text x="427" y="42" textAnchor="middle">Force on aircraft</text>
      <text x="248" y="265" textAnchor="middle">Force on air</text>
    </svg>
    <p>Equal and opposite. <strong>Different bodies.</strong></p>
  </div>;
}
