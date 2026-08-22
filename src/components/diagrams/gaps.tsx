/**
 * Diagrams for lessons that previously had no visual at all.
 *
 * These twelve lessons carried their material entirely in text, which left
 * them as the only lessons in the platform without an explainer. Each diagram
 * here exists to make one specific lesson animatable — they are deliberately
 * simple, because the material they carry is definitional rather than
 * mechanical.
 */

import { Diagram, type DiagramProps, bool, num, str } from "./primitives";

const NAVY = "var(--color-navy)";
const BRAND = "var(--color-brand)";
const GO = "var(--color-go)";
const CAUTION = "var(--color-caution)";
const NOGO = "var(--color-nogo)";
const MUTED = "var(--color-navy-faint)";

/* ------------------------------------------------------------------ */
/* Aerodynamics                                                        */
/* ------------------------------------------------------------------ */

/** Mass, volume, weight and density, as one picture. */
export function MassWeightDensity(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  const on = (id: string) => highlight === "none" || highlight === id;

  // Two boxes of identical mass, the right one twice the volume.
  const box = (x: number, w: number, dots: number, label: string, sub: string, tone: string) => (
    <g opacity={on(label.toLowerCase()) ? 1 : 0.3}>
      <rect x={x} y={92} width={w} height={104} rx={8} fill="var(--color-surface-2)" stroke={tone} strokeWidth={2} />
      {Array.from({ length: dots }, (_, i) => (
        <circle
          key={i}
          cx={x + 16 + ((i * 23) % (w - 30))
          }
          cy={106 + Math.floor((i * 23) / (w - 30)) * 20}
          r={4.5}
          fill={tone}
          opacity={0.75}
        />
      ))}
      <text x={x + w / 2} y={214} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={NAVY}>
        {label}
      </text>
      <text x={x + w / 2} y={230} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
        {sub}
      </text>
    </g>
  );

  return (
    <Diagram title="Mass, volume and density">
      <text x={250} y={40} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={MUTED}>
        SAME MASS, DIFFERENT VOLUME
      </text>

      {box(48, 150, 12, "Dense", "small volume", BRAND)}
      {box(262, 190, 12, "Less dense", "twice the volume", GO)}

      <text x={250} y={268} textAnchor="middle" fontSize={11} fontWeight={750} fill={NAVY}>
        ρ = mass ÷ volume
      </text>
      <text x={250} y={284} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
        Weight is a FORCE: the pull of gravity on that mass
      </text>
    </Diagram>
  );
}

/** The stability–maneuverability trade, drawn as a beam that tips. */
export function StabilityTrade(p: DiagramProps) {
  // -1 fully stable, +1 fully maneuverable.
  const bias = Math.max(-1, Math.min(1, num(p.bias, 0)));
  const angle = bias * 14;

  return (
    <Diagram title="Stability versus maneuverability">
      <text x={250} y={38} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={MUTED}>
        ONE GOES UP ONLY IF THE OTHER GOES DOWN
      </text>

      <g transform={`translate(250 150) rotate(${angle})`}>
        <rect x={-190} y={-6} width={380} height={12} rx={6} fill="var(--color-surface-3)" stroke={NAVY} strokeWidth={2} />
        <g transform="translate(-135 -46)">
          <rect x={-62} y={-22} width={124} height={44} rx={10} fill="color-mix(in srgb, var(--color-brand) 14%, transparent)" stroke={BRAND} strokeWidth={2} />
          <text x={0} y={-2} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={BRAND}>
            STABILITY
          </text>
          <text x={0} y={13} textAnchor="middle" fontSize={9} fontWeight={650} fill={MUTED}>
            resists leaving equilibrium
          </text>
        </g>
        <g transform="translate(135 -46)">
          <rect x={-70} y={-22} width={140} height={44} rx={10} fill="color-mix(in srgb, var(--color-caution) 16%, transparent)" stroke={CAUTION} strokeWidth={2} />
          <text x={0} y={-2} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={CAUTION}>
            MANEUVERABILITY
          </text>
          <text x={0} y={13} textAnchor="middle" fontSize={9} fontWeight={650} fill={MUTED}>
            leaves it easily
          </text>
        </g>
      </g>

      <path d="M230 156 L250 132 L270 156 Z" fill={NAVY} />
      <rect x={214} y={156} width={72} height={9} rx={4} fill={NAVY} />

      <text x={250} y={216} textAnchor="middle" fontSize={10} fontWeight={750} fill={MUTED}>
        Two ways to shift the beam right:
      </text>
      <text x={250} y={234} textAnchor="middle" fontSize={11} fontWeight={800} fill={NAVY}>
        weaken the stability · enlarge the control surfaces
      </text>
      <text x={250} y={266} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
        A transport wants the left. A fighter wants the right.
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Engines                                                             */
/* ------------------------------------------------------------------ */

/** Thrust as mass flow times acceleration, with gross and net separated. */
export function ThrustEquation(p: DiagramProps) {
  const airspeed = num(p.airspeed, 0);
  const moving = airspeed > 0;

  return (
    <Diagram title="Thrust = mass × acceleration">
      {/* Engine body */}
      <path d="M150 108 L360 118 L360 182 L150 192 Z" fill="var(--color-surface-2)" stroke={NAVY} strokeWidth={2.2} />
      <text x={255} y={155} textAnchor="middle" fontSize={11} fontWeight={800} fill={MUTED}>
        ENGINE
      </text>

      {/* Inlet velocity */}
      <g opacity={moving ? 1 : 0.35}>
        {[126, 150].map((y) => (
          <line key={y} x1={44} y1={y} x2={140} y2={y} stroke={BRAND} strokeWidth={2.6} strokeLinecap="round" />
        ))}
        <line x1={44} y1={174} x2={140} y2={174} stroke={BRAND} strokeWidth={2.6} strokeLinecap="round" />
        <text x={92} y={100} textAnchor="middle" fontSize={10} fontWeight={800} fill={BRAND}>
          V₁ — inlet
        </text>
        <text x={92} y={200} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
          {moving ? `${Math.round(airspeed)}% of exhaust speed` : "static, on the ramp"}
        </text>
      </g>

      {/* Exhaust velocity — always faster */}
      {[126, 150, 174].map((y) => (
        <line key={y} x1={370} y1={y} x2={470} y2={y} stroke={NOGO} strokeWidth={3.4} strokeLinecap="round" />
      ))}
      <text x={420} y={100} textAnchor="middle" fontSize={10} fontWeight={800} fill={NOGO}>
        V₂ — exhaust
      </text>

      <text x={250} y={240} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={NAVY}>
        Thrust = mass flow × (V₂ − V₁)
      </text>
      <text x={250} y={262} textAnchor="middle" fontSize={10} fontWeight={700} fill={MUTED}>
        {moving
          ? "Net thrust: the aircraft is moving, so V₁ subtracts"
          : "Gross thrust: static, so V₁ is zero and net equals gross"}
      </text>
      <text x={250} y={282} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
        Raise either the mass or the acceleration and thrust rises
      </text>
    </Diagram>
  );
}

/** The two families of compressor stall cause. */
export function StallCauses(p: DiagramProps) {
  const cause = str<"none" | "distortion" | "mechanical">(p.cause, "none");
  const on = (id: string) => cause === "none" || cause === id;

  const col = (x: number, id: string, title: string, tone: string, items: string[]) => (
    <g opacity={on(id) ? 1 : 0.28}>
      <rect x={x} y={78} width={196} height={168} rx={12} fill="var(--color-surface-2)" stroke={tone} strokeWidth={cause === id ? 2.6 : 1.8} />
      <text x={x + 98} y={104} textAnchor="middle" fontSize={11.5} fontWeight={800} fill={tone}>
        {title}
      </text>
      {items.map((t, i) => (
        <text key={t} x={x + 16} y={130 + i * 22} fontSize={10} fontWeight={650} fill={NAVY}>
          • {t}
        </text>
      ))}
    </g>
  );

  return (
    <Diagram title="Causes of compressor stall">
      <text x={250} y={44} textAnchor="middle" fontSize={11} fontWeight={800} fill={NAVY}>
        Both change the blade&rsquo;s angle of attack
      </text>
      <text x={250} y={62} textAnchor="middle" fontSize={9.5} fontWeight={650} fill={MUTED}>
        Relative wind = inlet airflow + compressor RPM
      </text>

      {col(38, "distortion", "AIRFLOW DISTORTION", CAUTION, [
        "High aircraft AOA",
        "Yaw or sideslip",
        "Turbulence, gusts",
        "Foreign object damage",
        "Icing at the inlet",
      ])}
      {col(266, "mechanical", "MECHANICAL", NOGO, [
        "Damaged blades",
        "Worn or dirty blades",
        "Fuel control failure",
        "Variable geometry fault",
        "Bleed valve malfunction",
      ])}

      <text x={250} y={274} textAnchor="middle" fontSize={10} fontWeight={750} fill={MUTED}>
        Either one, and the blade exceeds its stalling angle of attack
      </text>
    </Diagram>
  );
}

/** Avoid, prevent, recover — three responses at three different moments. */
export function StallResponse(p: DiagramProps) {
  const stage = str<"none" | "avoid" | "prevent" | "recover">(p.stage, "none");

  const rows = [
    { id: "avoid", label: "AVOID", when: "Before it happens", tone: GO },
    { id: "prevent", label: "PREVENT", when: "Conditions are developing", tone: CAUTION },
    { id: "recover", label: "RECOVER", when: "It has already stalled", tone: NOGO },
  ];

  return (
    <Diagram title="Avoid, prevent, recover">
      <text x={250} y={44} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={MUTED}>
        THREE RESPONSES, THREE DIFFERENT MOMENTS
      </text>

      {rows.map((r, i) => {
        const y = 74 + i * 66;
        const active = stage === "none" || stage === r.id;
        return (
          <g key={r.id} opacity={active ? 1 : 0.28}>
            <rect
              x={54}
              y={y}
              width={392}
              height={54}
              rx={12}
              fill={stage === r.id ? "var(--color-surface-2)" : "transparent"}
              stroke={r.tone}
              strokeWidth={stage === r.id ? 2.6 : 1.7}
            />
            <circle cx={92} cy={y + 27} r={16} fill={`color-mix(in srgb, ${r.tone} 18%, transparent)`} stroke={r.tone} strokeWidth={1.8} />
            <text x={92} y={y + 32} textAnchor="middle" fontSize={13} fontWeight={800} fill={r.tone}>
              {i + 1}
            </text>
            <text x={124} y={y + 24} fontSize={12} fontWeight={800} fill={r.tone}>
              {r.label}
            </text>
            <text x={124} y={y + 41} fontSize={10} fontWeight={650} fill={MUTED}>
              {r.when}
            </text>
          </g>
        );
      })}

      <text x={250} y={286} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        Recovery is the last resort, not the plan
      </text>
    </Diagram>
  );
}

/** Thrust ratings plotted against the turbine temperature limit. */
export function ThrustRatings(p: DiagramProps) {
  const rating = str<"none" | "normal" | "military" | "combat">(p.rating, "none");

  const bars = [
    { id: "normal", label: "Normal", limit: "Max continuous turbine temp", time: "No time limit", w: 190, tone: GO },
    { id: "military", label: "Military", limit: "Max turbine temp", time: "About 30 minutes", w: 262, tone: CAUTION },
    { id: "combat", label: "Combat", limit: "Afterburner — not turbine-limited", time: "Short periods", w: 340, tone: NOGO },
  ];

  return (
    <Diagram title="Thrust ratings">
      <text x={250} y={40} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={MUTED}>
        RATINGS ARE SET BY ALLOWABLE TURBINE INLET TEMPERATURE
      </text>

      {bars.map((b, i) => {
        const y = 68 + i * 62;
        const active = rating === "none" || rating === b.id;
        return (
          <g key={b.id} opacity={active ? 1 : 0.28}>
            <text x={44} y={y + 18} fontSize={11.5} fontWeight={800} fill={b.tone}>
              {b.label}
            </text>
            <rect x={44} y={y + 26} width={b.w} height={16} rx={8} fill={`color-mix(in srgb, ${b.tone} 22%, transparent)`} stroke={b.tone} strokeWidth={1.6} />
            <text x={44 + b.w + 10} y={y + 39} fontSize={9.5} fontWeight={700} fill={MUTED}>
              {b.time}
            </text>
            <text x={140} y={y + 18} fontSize={9.5} fontWeight={650} fill={MUTED}>
              {b.limit}
            </text>
          </g>
        );
      })}

      <line x1={306} y1={60} x2={306} y2={252} stroke={NOGO} strokeWidth={1.6} strokeDasharray="5 4" />
      <text x={312} y={266} fontSize={9.5} fontWeight={750} fill={NOGO}>
        turbine temperature limit
      </text>
      <text x={44} y={284} fontSize={9.5} fontWeight={650} fill={MUTED}>
        Combat crosses it because the afterburner burns aft of the turbine
      </text>
    </Diagram>
  );
}

/* ------------------------------------------------------------------ */
/* Flight Rules                                                        */
/* ------------------------------------------------------------------ */

/** Shall, should, may, will — ranked by how much each obliges. */
export function RegulatoryWording(p: DiagramProps) {
  const word = str(p.word, "none");

  const rows = [
    { id: "shall", label: "SHALL", meaning: "Mandatory", force: 1, tone: NOGO },
    { id: "should", label: "SHOULD", meaning: "Recommended", force: 0.62, tone: CAUTION },
    { id: "may", label: "MAY", meaning: "Optional", force: 0.3, tone: BRAND },
    { id: "will", label: "WILL", meaning: "Futurity only — no requirement", force: 0, tone: MUTED },
  ];

  return (
    <Diagram title="Regulatory wording">
      <text x={250} y={40} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={MUTED}>
        HOW MUCH EACH WORD OBLIGES YOU
      </text>

      {rows.map((r, i) => {
        const y = 66 + i * 52;
        const active = word === "none" || word === r.id;
        const w = 24 + r.force * 300;
        return (
          <g key={r.id} opacity={active ? 1 : 0.25}>
            <text x={44} y={y + 22} fontSize={12} fontWeight={800} fill={r.tone}>
              {r.label}
            </text>
            <rect
              x={116}
              y={y + 8}
              width={w}
              height={20}
              rx={10}
              fill={`color-mix(in srgb, ${r.tone} 24%, transparent)`}
              stroke={r.tone}
              strokeWidth={word === r.id ? 2.4 : 1.5}
            />
            <text x={116 + w + 10} y={y + 23} fontSize={10} fontWeight={700} fill={NAVY}>
              {r.meaning}
            </text>
          </g>
        );
      })}

      <text x={250} y={288} textAnchor="middle" fontSize={9.8} fontWeight={750} fill={CAUTION}>
        Only SHALL makes you do anything. WILL makes you do nothing at all.
      </text>
    </Diagram>
  );
}

/** What each transponder mode answers. */
export function TransponderModes(p: DiagramProps) {
  const mode = str(p.mode, "none");

  const cards = [
    { id: "mode3", label: "Mode 3", question: "Who are you?", answer: "Aircraft identity", tone: BRAND },
    { id: "modec", label: "Mode C", question: "How high are you?", answer: "Pressure altitude", tone: CAUTION },
    { id: "adsb", label: "ADS-B", question: "Where, how high, how fast?", answer: "GPS position, altitude, ground speed", tone: GO },
  ];

  return (
    <Diagram title="Transponder modes">
      <text x={250} y={40} textAnchor="middle" fontSize={10.5} fontWeight={800} fill={MUTED}>
        WHAT EACH MODE ANSWERS
      </text>

      {cards.map((c, i) => {
        const y = 62 + i * 74;
        const active = mode === "none" || mode === c.id;
        return (
          <g key={c.id} opacity={active ? 1 : 0.26}>
            <rect x={44} y={y} width={412} height={62} rx={12} fill="var(--color-surface-2)" stroke={c.tone} strokeWidth={mode === c.id ? 2.6 : 1.7} />
            <text x={64} y={y + 26} fontSize={12} fontWeight={800} fill={c.tone}>
              {c.label}
            </text>
            <text x={64} y={y + 46} fontSize={10.5} fontWeight={700} fill={MUTED}>
              &ldquo;{c.question}&rdquo;
            </text>
            <text x={436} y={y + 37} textAnchor="end" fontSize={11} fontWeight={800} fill={NAVY}>
              {c.answer}
            </text>
          </g>
        );
      })}

      <text x={250} y={290} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        ADS-B broadcasts once per second
      </text>
    </Diagram>
  );
}

/** Three preflight-adjacent responsibilities, each with its exception list. */
export function ClosingResponsibilities(p: DiagramProps) {
  const item = str(p.item, "none");

  const rows = [
    { id: "airfield", label: "Authorized airfields", rule: "Prior permission required", tone: BRAND },
    { id: "fuel", label: "Fuel purchases", rule: "Military or contract sources", tone: CAUTION },
    { id: "close", label: "Closing the flight plan", rule: "PIC and formation leader — both", tone: GO },
  ];

  return (
    <Diagram title="Airfields, fuel and closing out">
      {rows.map((r, i) => {
        const y = 54 + i * 76;
        const active = item === "none" || item === r.id;
        return (
          <g key={r.id} opacity={active ? 1 : 0.26}>
            <rect x={40} y={y} width={420} height={62} rx={12} fill="var(--color-surface-2)" stroke={r.tone} strokeWidth={item === r.id ? 2.6 : 1.7} />
            <circle cx={74} cy={y + 31} r={13} fill={`color-mix(in srgb, ${r.tone} 20%, transparent)`} stroke={r.tone} strokeWidth={1.8} />
            <text x={74} y={y + 36} textAnchor="middle" fontSize={12} fontWeight={800} fill={r.tone}>
              {i + 1}
            </text>
            <text x={100} y={y + 26} fontSize={11.5} fontWeight={800} fill={NAVY}>
              {r.label}
            </text>
            <text x={100} y={y + 45} fontSize={10} fontWeight={700} fill={r.tone}>
              {r.rule}
            </text>
          </g>
        );
      })}

      <text x={250} y={290} textAnchor="middle" fontSize={9.8} fontWeight={750} fill={MUTED}>
        Fuel exceptions: mission requirement · emergency landing · alternate landing
      </text>
    </Diagram>
  );
}

/** Minimum aircrew personal protective equipment, on the body. */
export function AircrewPpe(p: DiagramProps) {
  const highlight = str(p.highlight, "none");
  const on = (id: string) => highlight === "none" || highlight === id;

  const tag = (x: number, y: number, anchor: "start" | "end", text: string, id: string) => (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={10}
      fontWeight={on(id) ? 800 : 650}
      fill={on(id) ? NAVY : MUTED}
      opacity={on(id) ? 1 : 0.4}
    >
      {text}
    </text>
  );

  return (
    <Diagram title="Minimum aircrew equipment">
      {/* Figure */}
      <g stroke={NAVY} strokeWidth={2.4} fill="none" strokeLinecap="round">
        <circle cx={250} cy={70} r={22} fill="var(--color-surface-2)" />
        <path d="M250 92 L250 178" />
        <path d="M250 108 L206 146 M250 108 L294 146" />
        <path d="M250 178 L222 244 M250 178 L278 244" />
      </g>
      {/* Helmet cap */}
      <path d="M228 62 A22 22 0 0 1 272 62 Z" fill={BRAND} opacity={on("helmet") ? 0.85 : 0.25} />
      {/* Torso suit */}
      <rect x={232} y={98} width={36} height={62} rx={8} fill={CAUTION} opacity={on("suit") ? 0.35 : 0.12} />
      {/* Gloves */}
      <circle cx={204} cy={149} r={7} fill={CAUTION} opacity={on("suit") ? 0.7 : 0.2} />
      <circle cx={296} cy={149} r={7} fill={CAUTION} opacity={on("suit") ? 0.7 : 0.2} />
      {/* Boots */}
      <rect x={212} y={242} width={22} height={10} rx={4} fill={NAVY} opacity={on("boots") ? 0.85 : 0.25} />
      <rect x={266} y={242} width={22} height={10} rx={4} fill={NAVY} opacity={on("boots") ? 0.85 : 0.25} />
      {/* Kit on the hip */}
      <rect x={272} y={160} width={20} height={16} rx={3} fill={GO} opacity={on("kit") ? 0.8 : 0.22} />

      {/* Leaders */}
      <line x1={228} y1={58} x2={168} y2={44} stroke={MUTED} strokeWidth={1} />
      <line x1={232} y1={126} x2={150} y2={112} stroke={MUTED} strokeWidth={1} />
      <line x1={292} y1={168} x2={356} y2={158} stroke={MUTED} strokeWidth={1} />
      <line x1={230} y1={246} x2={158} y2={252} stroke={MUTED} strokeWidth={1} />
      <line x1={276} y1={110} x2={356} y2={92} stroke={MUTED} strokeWidth={1} />

      {tag(164, 47, "end", "Protective helmet", "helmet")}
      {tag(146, 115, "end", "Fire-resistant suit and gloves", "suit")}
      {tag(154, 255, "end", "Safety or flyer boots", "boots")}
      {tag(360, 161, "start", "Survival knife · kit", "kit")}
      {tag(360, 95, "start", "Signal device · radio", "signal")}
      {tag(360, 112, "start", "Beacon · flashlight · ID tags", "signal")}

      <text x={250} y={288} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        Life preserver aboard ship, in ejection seats, and below 1,000 ft over water
      </text>
    </Diagram>
  );
}

/** The airport by colour, at night. */
export function AirportLighting(p: DiagramProps) {
  const element = str(p.element, "none");
  const on = (id: string) => element === "none" || element === id;

  return (
    <Diagram title="Airport lighting">
      {/* Runway */}
      <path d="M96 200 L404 200 L366 148 L134 148 Z" fill="var(--color-surface-3)" stroke={NAVY} strokeWidth={1.8} />

      {/* Edge lights, white */}
      <g opacity={on("edge") ? 1 : 0.25}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const t = i / 5;
          return (
            <g key={i}>
              <circle cx={96 + t * 38} cy={200 - t * 52} r={3.4} fill="#ffffff" stroke={MUTED} strokeWidth={0.9} />
              <circle cx={404 - t * 38} cy={200 - t * 52} r={3.4} fill="#ffffff" stroke={MUTED} strokeWidth={0.9} />
            </g>
          );
        })}
      </g>

      {/* Threshold green, approaching */}
      <g opacity={on("threshold") ? 1 : 0.25}>
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={116 + i * 24} cy={200} r={4} fill={GO} />
        ))}
        <text x={100} y={222} fontSize={10} fontWeight={800} fill={GO}>
          GREEN approaching — threshold
        </text>
      </g>

      {/* Overrun red, from the runway */}
      <g opacity={on("overrun") ? 1 : 0.25}>
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={310 + i * 24} cy={152} r={4} fill={NOGO} />
        ))}
        <text x={396} y={140} textAnchor="end" fontSize={10} fontWeight={800} fill={NOGO}>
          RED from the runway — overrun
        </text>
      </g>

      {/* Centerline */}
      <g opacity={on("centerline") ? 1 : 0.25}>
        <line x1={124} y1={174} x2={300} y2={174} stroke="#ffffff" strokeWidth={2.6} strokeDasharray="10 8" />
        <line x1={300} y1={174} x2={344} y2={174} stroke={NOGO} strokeWidth={2.6} strokeDasharray="10 8" />
        <text x={250} y={166} textAnchor="middle" fontSize={9.5} fontWeight={750} fill={MUTED}>
          white → alternating → red for the last 1,000 ft
        </text>
      </g>

      {/* Taxiway, blue edges and green centerline */}
      <g opacity={on("taxiway") ? 1 : 0.25}>
        <path d="M404 200 L452 236" stroke={MUTED} strokeWidth={10} strokeLinecap="round" opacity={0.35} />
        <path d="M404 200 L452 236" stroke={GO} strokeWidth={1.8} strokeDasharray="5 5" />
        <circle cx={416} cy={216} r={3.2} fill={BRAND} />
        <circle cx={438} cy={232} r={3.2} fill={BRAND} />
        <text x={396} y={258} fontSize={9.5} fontWeight={750} fill={BRAND}>
          taxiway: blue edges, green centerline
        </text>
      </g>

      {/* Rotating beacon */}
      <g opacity={on("beacon") ? 1 : 0.25}>
        <line x1={64} y1={128} x2={64} y2={92} stroke={NAVY} strokeWidth={2.4} />
        <circle cx={64} cy={86} r={7} fill="#ffffff" stroke={NAVY} strokeWidth={1.6} />
        <circle cx={78} cy={80} r={4} fill="#ffffff" stroke={MUTED} strokeWidth={0.9} />
        <circle cx={50} cy={80} r={4} fill={GO} />
        <text x={64} y={70} textAnchor="middle" fontSize={9} fontWeight={800} fill={MUTED}>
          two whites = military
        </text>
      </g>

      <text x={250} y={286} textAnchor="middle" fontSize={9.5} fontWeight={700} fill={MUTED}>
        Green approaching · red from the runway · red is always the end
      </text>
    </Diagram>
  );
}

/** Victor airways and jet routes, stacked by altitude. */
export function RouteStructure(p: DiagramProps) {
  const band = str(p.band, "none");
  const labels = bool(p.labels, true);

  const y18 = 148;

  return (
    <Diagram title="Victor airways and jet routes">
      {/* Jet routes band */}
      <g opacity={band === "none" || band === "jet" ? 1 : 0.25}>
        <rect x={40} y={56} width={420} height={y18 - 56} fill="color-mix(in srgb, var(--color-nogo) 9%, transparent)" />
        {labels && (
          <>
            <text x={56} y={80} fontSize={11.5} fontWeight={800} fill={NOGO}>
              JET ROUTES
            </text>
            <text x={56} y={98} fontSize={10} fontWeight={650} fill={MUTED}>
              18,000 MSL to FL450
            </text>
          </>
        )}
        <line x1={56} y1={116} x2={444} y2={116} stroke={NOGO} strokeWidth={2.4} strokeDasharray="14 7" />
      </g>

      {/* Boundary */}
      <line x1={30} y1={y18} x2={470} y2={y18} stroke={NAVY} strokeWidth={2.4} />
      {labels && (
        <text x={470} y={y18 - 7} textAnchor="end" fontSize={10} fontWeight={800} fill={NAVY}>
          18,000 ft MSL
        </text>
      )}

      {/* Victor band */}
      <g opacity={band === "none" || band === "victor" ? 1 : 0.25}>
        <rect x={40} y={y18} width={420} height={92} fill="color-mix(in srgb, var(--color-brand) 9%, transparent)" />
        {labels && (
          <>
            <text x={56} y={y18 + 24} fontSize={11.5} fontWeight={800} fill={BRAND}>
              VICTOR AIRWAYS
            </text>
            <text x={56} y={y18 + 42} fontSize={10} fontWeight={650} fill={MUTED}>
              1,200 ft AGL to 18,000 ft MSL · 8 nm wide
            </text>
          </>
        )}
        {/* Width callout: 4 nm each side of centerline */}
        <line x1={150} y1={y18 + 64} x2={350} y2={y18 + 64} stroke={BRAND} strokeWidth={2.2} />
        <line x1={250} y1={y18 + 56} x2={250} y2={y18 + 72} stroke={BRAND} strokeWidth={1.6} strokeDasharray="3 3" />
        {labels && (
          <>
            <text x={200} y={y18 + 82} textAnchor="middle" fontSize={9} fontWeight={750} fill={BRAND}>
              4 nm
            </text>
            <text x={300} y={y18 + 82} textAnchor="middle" fontSize={9} fontWeight={750} fill={BRAND}>
              4 nm
            </text>
          </>
        )}
      </g>

      {/* Ground */}
      <line x1={30} y1={262} x2={470} y2={262} stroke={NAVY} strokeWidth={2.6} />
      {labels && (
        <text x={40} y={278} fontSize={9.5} fontWeight={700} fill={MUTED}>
          surface
        </text>
      )}
    </Diagram>
  );
}
