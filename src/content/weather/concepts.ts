import type { Concept } from "@/lib/types";

/**
 * The Weather concept graph.
 *
 * Source note: unlike Aerodynamics, Engines and Flight Rules, the supplied
 * Weather material is the CONDENSED NOTES and a dump sheet — there is no
 * trainee guide and no enabling objectives. So no Weather concept claims an
 * EO. Where the notes state a number, it is quoted exactly; where they state a
 * relationship, the direction is preserved; nothing here is filled in from
 * general meteorology.
 */

const NOTES = (chapter: string) => ({
  document: "Weather Condensed Notes" as const,
  chapter,
});
const DUMP = {
  document: "Weather Dump Sheet" as const,
  chapter: "Mnemonics",
};

export const CONCEPTS: Concept[] = [
  /* ================================================================ */
  /* w1 — THE ATMOSPHERE                                               */
  /* ================================================================ */
  {
    id: "wx-troposphere",
    unit: "w1",
    name: "The troposphere",
    definition:
      "The layer containing a large amount of moisture — 0–5% water vapour by volume — and where nearly all weather occurs. Its top runs 28,000 to 55,000 ft MSL, and about 36,000 ft MSL over the US.",
    relationships: [
      "Altitude ↑ → temperature ↓ and wind ↑, within the troposphere",
    ],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-tropopause",
    unit: "w1",
    name: "The tropopause",
    definition:
      "The isothermal transition layer between the troposphere and the stratosphere, where temperature is constant.",
    commonTraps: [
      "Isothermal means CONSTANT temperature, not falling and not rising.",
    ],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-heat-exchange",
    unit: "w1",
    name: "All weather is heat exchange",
    definition:
      "Heating and cooling of the earth causes air circulation and pressure differentials. All weather is the result of heat exchange.",
    relationships: ["Uneven heating → pressure differences → circulation → weather"],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-atmospheric-pressure",
    unit: "w1",
    name: "Atmospheric pressure",
    definition:
      "Measured by the weight of a column of air above an area on the earth's surface. Expressed in inches of mercury (inHg) and millibars (mb).",
    relationships: ["Standard pressure lapse rate: 1 inHg lost per 1,000 ft of altitude"],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-standard-atmosphere",
    unit: "w1",
    name: "Standard atmosphere",
    definition: "At sea level: 29.92 inHg and 15 °C (59 °F).",
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-lapse-rate",
    unit: "w1",
    name: "Lapse rate",
    definition:
      "The rate of change of an atmospheric variable — usually temperature — with altitude. Average temperature lapse rate is 2 °C per 1,000 ft; pressure is 1 inHg per 1,000 ft.",
    relationships: ["Temperature: 2 °C / 1,000 ft", "Pressure: 1 inHg / 1,000 ft"],
    commonTraps: [
      "Two different lapse rates, two different units. Mixing them is the usual slip.",
    ],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-slp-sp",
    unit: "w1",
    name: "Sea level and station pressure",
    definition:
      "Sea Level Pressure (SLP) is the pressure directly at sea level, or calculated from a known station pressure — the altimeter setting. Station Pressure (SP) is the pressure directly at the airfield or a specific altitude.",
    relationships: ["Station above sea level → SP is always LESS than SLP"],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-pgf",
    unit: "w1",
    name: "Pressure Gradient Force",
    definition:
      "The initiating force for all winds. A pressure gradient is a rate of change perpendicular to the isobars.",
    relationships: ["PGF is what starts every wind"],
    commonTraps: [
      "The gradient is measured PERPENDICULAR to the isobars, not along them.",
    ],
    source: NOTES("WX 1: Theory"),
  },

  /* ================================================================ */
  /* w2 — ALTITUDE AND THE ALTIMETER                                   */
  /* ================================================================ */
  {
    id: "wx-indicated-altitude",
    unit: "w2",
    name: "Indicated altitude",
    definition:
      "What the barometric altimeter indicates. It attempts to be true altitude.",
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-true-altitude",
    unit: "w2",
    name: "True altitude (MSL)",
    definition: "Height above mean sea level. The standard altitude.",
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-absolute-altitude",
    unit: "w2",
    name: "Absolute altitude (AGL)",
    definition: "Height above the terrain below you.",
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-density-altitude",
    unit: "w2",
    name: "Density altitude",
    definition:
      "A calculation that determines the altitude the airplane is effectively experiencing given the air density environment. Used to gauge performance.",
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-pressure-altitude",
    unit: "w2",
    name: "Pressure altitude",
    definition:
      "The altitude displayed when 29.92 is set in the Kollsman window — height above the standard datum plane. Standard in Class A.",
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-altimeter",
    unit: "w2",
    name: "The altimeter",
    definition:
      "Measures the difference between static pressure and the sea level pressure set in the Kollsman window. Calibrated to display 1,000 ft for every 1 inHg of difference.",
    relationships: ["1 inHg of setting error = 1,000 ft of indication error"],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-temp-altimeter-error",
    unit: "w2",
    name: "Temperature effect on the altimeter",
    definition:
      "Colder than standard means the altimeter indicates HIGHER than true. Hotter than standard means it indicates LOWER than true. Less noticeable than pressure changes.",
    relationships: ["Cold → indicates high → you are LOWER than it says"],
    commonTraps: [
      "The dangerous case is cold: the altimeter over-reads, so the aircraft is lower than indicated.",
    ],
    source: NOTES("WX 1: Theory"),
  },

  /* ================================================================ */
  /* w3 — MOISTURE AND STABILITY                                       */
  /* ================================================================ */
  {
    id: "wx-dew-point",
    unit: "w3",
    name: "Dew point",
    definition:
      "The temperature an air parcel must be cooled to, at constant pressure, to condense into water.",
    commonTraps: ["The definition carries 'at constant pressure' — that clause is testable."],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-dew-point-spread",
    unit: "w3",
    name: "Dew point depression",
    definition:
      "The difference between temperature and dew point, also called the spread. The smaller the depression, the more moisture that will condense.",
    relationships: ["Spread ↓ → condensation ↑ → cloud, fog or precipitation more likely"],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-relative-humidity",
    unit: "w3",
    name: "Relative humidity",
    definition:
      "The ratio of the actual amount of moisture in the air to the maximum total amount that could be in the air. Equivalent to percent saturation.",
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-air-mass",
    unit: "w3",
    name: "Air mass",
    definition:
      "A large body of air with relatively the same temperature and moisture across a horizontal plane. Warm air masses are stable; cold air masses are unstable.",
    relationships: ["Warm air mass → stable", "Cold air mass → unstable"],
    source: NOTES("WX 1: Theory"),
  },
  {
    id: "wx-air-stability",
    unit: "w3",
    name: "Air stability",
    definition:
      "The stability of air is determined by the temperature of the surrounding air. Stable when cold, unstable when hot, neutral when the same temperature as the surroundings.",
    relationships: ["Cold → stable · Hot → unstable · Same → neutral"],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-inversion",
    unit: "w3",
    name: "Temperature inversion",
    definition: "When temperature increases as altitude increases.",
    relationships: ["An inversion is a very stable layer, and it traps what is under it"],
    source: NOTES("WX 1: Theory"),
  },

  /* ================================================================ */
  /* w4 — WIND                                                         */
  /* ================================================================ */
  {
    id: "wx-gradient-wind",
    unit: "w4",
    name: "Gradient wind",
    definition:
      "Wind above 2,000 ft AGL, flowing parallel to the isobars. Counter-clockwise around low pressure centres and clockwise around high pressure centres.",
    relationships: ["Above 2,000 ft AGL · parallel to isobars"],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-surface-wind",
    unit: "w4",
    name: "Surface wind",
    definition:
      "Wind below 2,000 ft AGL. Similar to the gradient wind but with directional variation, because it is influenced by surface friction.",
    relationships: ["Below 2,000 ft AGL · friction adds directional variation"],
    commonTraps: [
      "2,000 ft AGL is the dividing line for BOTH gradient and surface wind.",
    ],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-buys-ballot",
    unit: "w4",
    name: "Buys Ballot's Law",
    definition: "With the wind at your back: low to the left, high to the right.",
    relationships: ["Wind at your back → L left, H right"],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-sea-land-breeze",
    unit: "w4",
    name: "Sea breeze and land breeze",
    definition:
      "The sea breeze occurs during the day as cool dense sea air moves over the warm land and the warm land air rises, moving back out to sea. About 15–20 kt around the shore. The land breeze occurs at night — the flipped cycle, because land cools faster than sea.",
    relationships: ["Day → sea breeze · Night → land breeze"],
    commonTraps: [
      "The breeze is named for where the air comes FROM. A sea breeze blows from sea to land.",
    ],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-jet-stream",
    unit: "w4",
    name: "Jet stream",
    definition:
      "A narrow band of strong winds at the top of the troposphere, averaging FL300 over the US. Generally west to east, can change hourly. Averages 100–150 kt but can exceed 250 kt. It is 100–400 miles wide, 1,000–3,000 miles long and 3,000–7,000 ft thick.",
    source: NOTES("WX 2: Mechanics"),
  },

  /* ================================================================ */
  /* w5 — CLOUDS AND LIFTING                                           */
  /* ================================================================ */
  {
    id: "wx-cloud-groups",
    unit: "w5",
    name: "The four cloud groups",
    definition:
      "Low, Middle, High and Special. A cloud is defined by the altitude group it is in.",
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-special-clouds",
    unit: "w5",
    name: "Special clouds",
    definition:
      "Nimbo- or -nimbus means violent or heavy. Cumulonimbus — the thunderstorm cloud — has its base at low altitudes and its tops at high altitudes, with severe to extreme turbulence, hail, icing and lightning. Nimbostratus is thick, uniform and widespread, building downwards, with heavy continuous rain and moderate turbulence, but no thunder.",
    relationships: ["Nimbo / nimbus = violent or heavy"],
    commonTraps: [
      "Nimbostratus brings heavy continuous rain and moderate turbulence — but NO thunder.",
    ],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-lifting-methods",
    unit: "w5",
    name: "The four lifting methods",
    definition:
      "Frontal, Orographic, Convergence and Thermal. Air has to be lifted before it can cool to saturation and build cloud.",
    relationships: ["FOCT: Frontal · Orographic · Convergence · Thermal"],
    source: DUMP,
  },
  {
    id: "wx-precipitation-types",
    unit: "w5",
    name: "Precipitation characteristics",
    definition:
      "Shower: sudden start and stop with abrupt intensity changes, from cumuliform clouds. Continuous: steady with gradual changes, from stratiform clouds. Intermittent: starts and stops at least once during the hour, from either cloud type.",
    relationships: [
      "Cumuliform → showery",
      "Stratiform → continuous",
      "Intermittent → either type",
    ],
    commonTraps: [
      "Intermittent is the only one that does not identify the cloud type for you.",
    ],
    source: NOTES("WX 2: Mechanics"),
  },

  /* ================================================================ */
  /* w6 — FRONTS                                                       */
  /* ================================================================ */
  {
    id: "wx-cold-front",
    unit: "w6",
    name: "Cold front",
    definition:
      "Cooler, more dense air moves into warm air, sliding underneath and forcing the warm air up. Results in unstable conditions, cumuliform clouds and showery precipitation.",
    relationships: ["Cold front → unstable → cumuliform → showers"],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-warm-front",
    unit: "w6",
    name: "Warm front",
    definition:
      "Warmer air overtakes cooler air, usually more slowly. Results in stable conditions prior to passage, stratiform clouds, little to no turbulence and continuous precipitation.",
    relationships: ["Warm front → stable → stratiform → continuous precipitation"],
    commonTraps: [
      "Warm fronts move more slowly than cold fronts, and produce little or no turbulence.",
    ],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-stationary-front",
    unit: "w6",
    name: "Stationary front",
    definition:
      "A warm and a cold front colliding where neither is powerful enough to move the other. Drawn with alternating cold and warm front symbols pointing in opposite directions. Can align in any direction, with weather similar to a warm front but often less intense.",
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-occluded-front",
    unit: "w6",
    name: "Occluded front",
    definition:
      "Forms when a cold front overtakes a warm front. The wind shifts 180°, from SE to NW, with weather associated with both warm and cold fronts, potentially over a very widespread area. Drawn with a purple frontal symbol. Named a cold or a warm occlusion based on which front is touching the ground.",
    relationships: ["Wind shifts 180° · SE to NW"],
    source: NOTES("WX 2: Mechanics"),
  },
  {
    id: "wx-frontal-discontinuities",
    unit: "w6",
    name: "The four frontal discontinuities",
    definition:
      "Temperature, Dew point (moisture), Wind and Pressure. A front is a discontinuity between contrasting air masses; at the surface it is called a surface front.",
    relationships: ["TDWP: Temperature · Dew point · Wind · Pressure"],
    source: NOTES("WX 2: Mechanics"),
  },

  /* ================================================================ */
  /* w7 — TURBULENCE AND WIND SHEAR                                    */
  /* ================================================================ */
  {
    id: "wx-turbulence",
    unit: "w7",
    name: "Turbulence",
    definition:
      "Irregular or disturbed atmospheric flow producing gusts and/or eddies. Most hazardous at low altitudes.",
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-turbulence-intensity",
    unit: "w7",
    name: "Turbulence intensity",
    definition:
      "Classified light, moderate, severe and extreme. Extreme requires declaring an emergency and exiting the area as soon as possible. PIREPs use trace, light, moderate, severe and extreme.",
    relationships: ["Extreme → declare an emergency, exit ASAP"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-turbulence-duration",
    unit: "w7",
    name: "Turbulence duration",
    definition:
      "Occasional is less than one third of the time. Intermittent is one third to two thirds. Continuous is more than two thirds.",
    relationships: ["Occasional < ⅓ · Intermittent ⅓–⅔ · Continuous > ⅔"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-turbulence-causes",
    unit: "w7",
    name: "The four causative factors",
    definition:
      "Large scale Wind shear, Thermal, Frontal and Mechanical.",
    relationships: ["WTF Man: Wind shear · Thermal · Frontal · Mechanical"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-wind-shear",
    unit: "w7",
    name: "Wind shear turbulence",
    definition:
      "A sudden, drastic change in wind speed and/or direction that can occur anywhere. High level shear is associated with clear air turbulence such as the jet stream. Low level wind shear is due to local phenomena such as a temperature inversion, occurring near the surface on cool, clear nights. LLWS is the most dangerous because of the risk of stall at low altitude.",
    relationships: ["LLWS is most dangerous — stall risk with no altitude to recover"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-shear-sources",
    unit: "w7",
    name: "Jet stream and inversion shear",
    definition:
      "Large fluctuations in wind intensity throughout the jet stream create a high degree of wind shear. Separately, the high speed warm air wind that causes a temperature inversion generates large wind shear at the inversion boundary.",
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-thermal-turbulence",
    unit: "w7",
    name: "Thermal turbulence",
    definition:
      "Results from heating below. Its strength depends on the type of surface being heated — generally, the drier the surface, the stronger the turbulence.",
    relationships: ["Drier surface → stronger thermal turbulence"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-frontal-turbulence",
    unit: "w7",
    name: "Frontal turbulence",
    definition:
      "The result of frontal lifting associated with the passage of a cold front. More prominent in a fast cold front. There is little or no lifting with warm fronts, so there is no warm frontal turbulence.",
    commonTraps: [
      "No warm frontal turbulence at all — the notes say so explicitly.",
    ],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-mechanical-turbulence",
    unit: "w7",
    name: "Mechanical turbulence",
    definition:
      "Occurs when buildings, ground objects or hills and valleys interfere with normal wind flow, usually below 1,000 ft AGL. Rougher terrain, faster wind and more unstable air all create more turbulence.",
    relationships: ["Usually below 1,000 ft AGL"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-turbulence-technique",
    unit: "w7",
    name: "Turbulence penetration technique",
    definition:
      "Maintain the power setting consistent with the aircraft's recommended turbulence penetration airspeed, trim for level flight, do not chase airspeed deviations with power corrections, allow altitude to vary and do not chase the altimeter, and maintain pitch and bank by reference to the attitude indicator with a VFR scan when conditions permit. Keep a level attitude.",
    relationships: ["Fly ATTITUDE. Let airspeed and altitude wander."],
    source: NOTES("WX 3: Hazards"),
  },

  /* ================================================================ */
  /* w8 — ICING                                                        */
  /* ================================================================ */
  {
    id: "wx-icing-requirements",
    unit: "w8",
    name: "What icing requires",
    definition:
      "Visible moisture, free air temperature below freezing, and aircraft surface temperature below freezing.",
    relationships: ["All three, together. Remove any one and ice cannot form."],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-structural-icing",
    unit: "w8",
    name: "Structural icing",
    definition:
      "Its most hazardous aspect is the aerodynamic effect on the airfoil. Structural concerns include flight controls and vibration, pitot tube blockage and panels freezing over.",
    commonTraps: [
      "The most hazardous aspect is AERODYNAMIC, not the weight of the ice.",
    ],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-clear-ice",
    unit: "w8",
    name: "Clear ice",
    definition:
      "0 °C to −10 °C, in unstable conditions. From freezing rain and large droplets, in cumulus clouds. The most severe type and difficult to remove. It freezes slowly after spreading out, which alters the shape of the wing.",
    relationships: ["0 to −10 °C · unstable · large droplets · most severe"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-rime-ice",
    unit: "w8",
    name: "Rime ice",
    definition:
      "−10 °C to −20 °C, in stable conditions. From stratus clouds and tiny droplets that freeze instantly.",
    relationships: ["−10 to −20 °C · stable · tiny droplets · freezes instantly"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-mixed-ice",
    unit: "w8",
    name: "Mixed ice",
    definition: "−8 °C to −15 °C. A combination of rime and clear ice.",
    commonTraps: [
      "The mixed band OVERLAPS both clear and rime — it is not a gap between them.",
    ],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-frost",
    unit: "w8",
    name: "Frost",
    definition:
      "Ground icing. It occurs on the ground and you SHALL remove it prior to flight. Do not scrape it off the aircraft, especially the windshield.",
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-engine-icing",
    unit: "w8",
    name: "Engine icing",
    definition:
      "Two types. Compressor icing forms on the compressor inlet screen and inlet guide vanes, restricting airflow into the inlet. Induction icing forms on the air intake of engines and in carburettors, reducing engine pressure and possibly causing ice ingestion — FOD. Induction icing can occur in high humidity at temperatures up to +10 °C.",
    relationships: ["Induction icing possible up to +10 °C"],
    commonTraps: [
      "Induction icing does not need freezing air — up to +10 °C in high humidity.",
    ],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-icing-effects",
    unit: "w8",
    name: "Icing effects on performance",
    definition:
      "Drag, weight, stall speed and fuel consumption all increase. Thrust, range and lift all decrease. Performance falls.",
    relationships: [
      "↑ drag, weight, stall speed, fuel consumption",
      "↓ thrust, range, lift",
    ],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-icing-response",
    unit: "w8",
    name: "Avoiding and escaping icing",
    definition:
      "De-icing equipment eliminates or removes ice that is present; anti-icing equipment prevents accumulation. After encountering icing: use anti-ice and/or de-ice equipment, climb to where it is colder than −20 °C, descend to warmer temperatures, get out of visible moisture, land in an emergency, and minimise manoeuvring because performance has decreased.",
    relationships: ["De-ice removes · Anti-ice prevents"],
    source: NOTES("WX 3: Hazards"),
  },

  /* ================================================================ */
  /* w9 — STORMS AND LOW VISIBILITY                                    */
  /* ================================================================ */
  {
    id: "wx-thunderstorm-hazards",
    unit: "w9",
    name: "Thunderstorm hazards",
    definition:
      "Hail, Icing, Microbursts, Extreme turbulence, Lightning and Tornados.",
    relationships: ["HI MELT"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-thunderstorm-avoidance",
    unit: "w9",
    name: "Thunderstorm avoidance",
    definition:
      "In order of priority: Circumnavigate — fly around. Over — 1,000 ft above the top for every 10 kt of wind at the top. Under — the lower third of the distance from cloud base to ground. Through — penetrate the lower third of the storm with no angle.",
    relationships: ["COUT, and the order IS the priority"],
    commonTraps: [
      "Over costs 1,000 ft per 10 kt of wind AT THE TOP, which is why it is rarely practical.",
    ],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-microburst",
    unit: "w9",
    name: "Microburst",
    definition:
      "A severe, localised downdraft of 2,000–6,000 ft per minute, producing a vortex ring of wind of 20–200 kt. Usually lasts only 5–10 minutes and is very localised. Visual cues are virga, localised blowing dust, rain shafts and roll clouds. The sudden loss of airspeed on the far side creates a severe hazard on takeoff and landing.",
    relationships: ["2,000–6,000 fpm down · 20–200 kt vortex ring · 5–10 minutes"],
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-obscuring-phenomenon",
    unit: "w9",
    name: "Obscuring phenomenon",
    definition: "Anything that reduces horizontal visibility to less than 7 SM.",
    source: NOTES("WX 3: Hazards"),
  },
  {
    id: "wx-fog",
    unit: "w9",
    name: "Fog",
    definition:
      "Fog exists when the cloud base is within 50 ft of the ground, is greater than 20 ft thick, and visibility is less than ⅝ SM. It requires condensation nuclei, a low temperature/dew point spread, and light surface winds.",
    relationships: ["Nuclei + small spread + light winds → fog"],
    commonTraps: [
      "Fog needs LIGHT surface winds. Calm air will not mix the moisture through the layer, and strong wind disperses it.",
    ],
    source: NOTES("WX 3: Hazards"),
  },

  /* ================================================================ */
  /* w10 — WEATHER PRODUCTS                                            */
  /* ================================================================ */
  {
    id: "wx-ceiling",
    unit: "w10",
    name: "Ceiling and sky coverage",
    definition:
      "The ceiling is the lowest broken, overcast or vertical visibility layer, in AGL. Vertical visibility is the distance seen upward from the ground into a total obscuration.",
    commonTraps: [
      "Scattered is not a ceiling. Broken, overcast or vertical visibility are.",
    ],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-station-model",
    unit: "w10",
    name: "Station model",
    definition:
      "On wind barbs, a half line represents 5 kt, a full line 10 kt, and a triangular flag 50 kt. Cig is the cloud ceiling in hundreds of feet.",
    relationships: ["Half 5 · full 10 · flag 50"],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-metar",
    unit: "w10",
    name: "METAR",
    definition:
      "Meteorological Aerodrome Report. Issued on an hourly schedule at xx:55 to xx:59. Reports current conditions, and is used as the criteria for takeoff and landing.",
    relationships: ["Current conditions → takeoff and landing criteria"],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-taf",
    unit: "w10",
    name: "TAF",
    definition:
      "Terminal Aerodrome Forecast. Issued every 6 hours for at least 24 hours from issue, and used for planning. All elements are forecast weather until the end of the TAF unless changed by a later line.",
    relationships: ["Forecast → planning"],
    commonTraps: [
      "METAR is what IS, and governs takeoff and landing. TAF is what WILL BE, and is for planning.",
    ],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-pirep",
    unit: "w10",
    name: "PIREP",
    definition:
      "A voice report to ATC while airborne, to warn other aviators. Required when: conditions differ from the last observation on an IFR approach, wind shear on departure or arrival, requested in-flight by ATC, unusual or unforeseen weather conditions, or a missed approach.",
    relationships: ["IWRUM"],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-surface-analysis",
    unit: "w10",
    name: "Surface analysis chart",
    definition:
      "Shows troughs, fronts, pressure systems and isobars at 4 mb spacing. No precipitation.",
    commonTraps: [
      "The surface analysis has no precipitation on it. The prognostic chart is the one that does.",
    ],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-prognostic-chart",
    unit: "w10",
    name: "Prognostic chart",
    definition:
      "Forecast future conditions, with precipitation, for big picture planning.",
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-radar-satellite",
    unit: "w10",
    name: "Radar and satellite",
    definition:
      "Radar is ground based and restricted to line of sight. Satellite is NOT ground based and shows the reflectivity of clouds — the whiter the image, the thicker the clouds.",
    relationships: ["Radar: ground based, line of sight", "Satellite: not ground based"],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-winds-aloft",
    unit: "w10",
    name: "Winds aloft forecast",
    definition:
      "Provides current and forecast winds at altitude. Used with other variables to choose a flight level and to aid navigation planning.",
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-weather-briefing",
    unit: "w10",
    name: "Weather briefings",
    definition:
      "A DD Form 175-1 is prepared by weather offices to brief the pilot on local, en route and destination conditions. Received from the Navy Flight Weather briefer website, or 1-800-WXBRIEF if unable. A FLIMSY number is needed. The FAR requires knowledge of VFR minimums and says you SHOULD receive a brief; M-3710.7 says you SHALL receive a brief, and an en route brief for IFR.",
    commonTraps: [
      "FAR says should. CNAF M-3710.7 says shall. That difference is the question.",
    ],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-visibility-types",
    unit: "w10",
    name: "The four visibilities",
    definition:
      "Flight visibility is the ability to see prominent unlighted objects by day and prominent lighted objects by night, from the cockpit, in SM. Prevailing visibility is the maximum horizontal visibility through at least half of the horizon circle, on METARs and TAFs, in SM. Slant range visibility is the distance on final when the runway comes in sight, in SM. Runway visual range is the horizontal distance looking down the runway, in feet or metres, and can appear on METARs and TAFs.",
    relationships: ["RVR is the only one measured in feet or metres"],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-convective-sigmet",
    unit: "w10",
    name: "Convective SIGMET",
    definition:
      "An in-flight weather advisory for thunderstorm-related significant meteorological hazards. Specifically: a 60 mile long line with storms affecting 40% of the line, thunderstorms with very high radar reflectivity covering 40% of an area, severe or embedded storms for more than 30 minutes, a tornado, hail greater than ¾ inch, or wind gusts of 50 kt or more. Issued at xx:55 for up to 2 hours.",
    relationships: ["Thunderstorm-related · valid 2 hours"],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-nonconvective-sigmet",
    unit: "w10",
    name: "Non-convective SIGMET",
    definition:
      "Not associated with thunderstorms. Specifically severe icing, severe or extreme turbulence, dust or sand storms reducing visibility below 3 SM, and volcanic ash. Issued for 4 hours, or 6 for hurricanes.",
    relationships: ["Valid 4 hours · 6 for hurricanes"],
    source: NOTES("WX 4: Planning and Resources"),
  },
  {
    id: "wx-airmet",
    unit: "w10",
    name: "AIRMET",
    definition:
      "Affects at least 3,000 square miles. Covers moderate turbulence, low level wind shear below 2,000 ft AGL with a shift greater than 20 kt, strong surface winds over 30 kt, icing and moderate structural icing, freezing level, IFR conditions with ceiling below 1,000 ft AGL and/or visibility below 3 SM, and mountain obscuration. Routinely issued every 6 hours.",
    relationships: ["At least 3,000 sq mi · every 6 hours"],
    commonTraps: [
      "AIRMET is the moderate one. SIGMET is severe. Both the intensity and the validity period differ.",
    ],
    source: NOTES("WX 4: Planning and Resources"),
  },
];
