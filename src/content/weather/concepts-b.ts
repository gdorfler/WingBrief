import type { Concept } from "@/lib/types";

/**
 * Weather concepts that come from the trainee guide but not the condensed
 * notes.
 *
 * The course was originally built from the notes and the dump sheet, which is
 * all that was available. The trainee guide covers a good deal the notes never
 * mention — the stratosphere, mountain and valley winds, the eight forms of
 * precipitation, squall lines, inactive fronts, mountain wave turbulence,
 * frontal icing signatures, PIREP icing scales, the two types of fog, volcanic
 * ash and the advisory letter identifiers. These are those.
 */

const TG = (chapter: string, eo: string[]) => ({
  document: "Weather Trainee Guide" as const,
  chapter,
  eo,
});

export const CONCEPTS_B: Concept[] = [
  /* ================= w1 · the atmosphere ================= */
  {
    id: "wx-stratosphere",
    unit: "w1",
    name: "The stratosphere",
    definition:
      "Smooth flying conditions and excellent visibility. Temperature is constant to approximately 66,000 ft, then slowly increases with altitude above that. Few aircraft can fly in the stratosphere. Average top over the USA is 158,000 ft MSL.",
    relationships: [
      "Isothermal to ~66,000 ft, then an inverted lapse rate above it",
    ],
    commonTraps: [
      "The stratosphere is the SMOOTH one. All the weather and turbulence is below it.",
    ],
    source: TG("Atmospheric Physics", ["2.201", "2.204"]),
  },
  {
    id: "wx-layer-flight-conditions",
    unit: "w1",
    name: "Flight conditions by layer",
    definition:
      "The troposphere carries nearly all the weather, so it carries the turbulence, icing and restricted visibility with it. The tropopause is where the jet stream and its wind shear sit. The stratosphere is smooth, with excellent visibility.",
    relationships: [
      "Troposphere: the weather · Tropopause: the jet stream · Stratosphere: smooth",
    ],
    source: TG("Atmospheric Physics", ["2.202", "2.203", "2.204"]),
  },

  /* ================= w3 · moisture ================= */
  {
    id: "wx-saturation",
    unit: "w3",
    name: "Saturation",
    definition:
      "Saturation is the state in which the air is holding the maximum water vapour possible for its temperature and pressure — relative humidity 100%, with the dew point spread at zero. Air can reach it two ways: by COOLING, which lowers the temperature toward the dew point, or by EVAPORATION, which adds moisture and raises the dew point. Either closes the spread.",
    relationships: [
      "Cooling → temperature falls toward the dew point",
      "Evaporation → dew point rises toward the temperature",
      "Either one → spread closes → RH toward 100%",
    ],
    commonTraps: [
      "Two roads to saturation, not one. Adding moisture works as well as taking away heat.",
      "Once the spread reaches 4 °F the relative humidity is 90% and vapour begins condensing into fog or cloud.",
    ],
    source: TG("Atmospheric Moisture", ["2.222", "2.226"]),
  },

  /* ================= w4 · wind ================= */
  {
    id: "wx-mountain-valley-wind",
    unit: "w4",
    name: "Mountain and valley winds",
    definition:
      "By day the sun heats the mountain slopes, which heat the adjacent air by conduction. That air becomes warmer and less dense than air at the same altitude away from the slope, so it rises — and the air flowing up from the valley to replace it is called the VALLEY wind. At night the slope air is cooled by outgoing terrestrial radiation, becomes denser than its surroundings and flows downhill: the MOUNTAIN wind, a circulation opposite to the daytime pattern.",
    relationships: [
      "Day → valley wind, flowing up the slope",
      "Night → mountain wind, flowing down the slope",
    ],
    commonTraps: [
      "The wind is named for where it comes FROM, like the sea breeze. The valley wind blows out of the valley and up the mountain.",
    ],
    source: TG("Atmospheric Circulation", ["2.220", "2.221"]),
  },

  /* ================= w5 · clouds and lifting ================= */
  {
    id: "wx-precipitation-forms",
    unit: "w5",
    name: "Forms of precipitation",
    definition:
      "Drizzle is very small droplets that appear to float. Freezing drizzle and freezing rain freeze on impact with objects. Rain is droplets larger than drizzle. Hail or graupel is irregular lumps of ice from severe thunderstorms — it does NOT lead to structural ice but can cause structural damage. Ice pellets or sleet form when rain falls through air below freezing, and do not produce structural icing unless mixed with super-cooled water. Snow is ice crystals; partially melted or wet snow CAN lead to structural icing. Snow grains are small opaque grains that do not bounce.",
    relationships: [
      "Hail damages but does not ice · Ice pellets do not ice unless mixed with super-cooled water · Wet snow DOES ice",
    ],
    commonTraps: [
      "Hail causes structural DAMAGE, not structural ICE. The distinction is the question.",
    ],
    source: TG("Atmospheric Moisture", ["2.228"]),
  },
  {
    id: "wx-stability-clues",
    unit: "w3",
    name: "Clues to flight conditions",
    definition:
      "Stable air is indicated by temperature inversions, widespread fog or low clouds, and rising or only slightly decreasing temperature while climbing. Unstable air is indicated by thunderstorms, towering cumulus clouds, heavy showers, dust devils, and rapidly decreasing temperature while climbing.",
    relationships: [
      "Stable: inversions, fog, low cloud, temperature barely falling with height",
      "Unstable: thunderstorms, towering cumulus, showers, dust devils, temperature falling fast",
    ],
    source: TG("Atmospheric Moisture", ["2.233", "2.234"]),
  },

  /* ================= w6 · fronts ================= */
  {
    id: "wx-frontal-weather-factors",
    unit: "w6",
    name: "Factors influencing frontal weather",
    definition:
      "Five factors determine how severe the clouds and precipitation along a front will be: the amount of moisture available, shown by the dew point; the degree of stability of the lifted air; the slope of the front; the speed of frontal movement; and the contrast in temperature and moisture between the two air masses.",
    relationships: [
      "Moisture · Stability · Slope · Speed · Contrast",
      "Stability decides stratiform versus cumuliform; moisture decides whether there is weather at all",
    ],
    commonTraps: [
      "Often there is little or no significant weather at a front simply because the moisture is not there, despite every other factor being present.",
    ],
    source: TG("Frontal Mechanics", ["2.239"]),
  },
  {
    id: "wx-squall-line",
    unit: "w6",
    name: "Squall line",
    definition:
      "A line of violent thunderstorms, shown on surface charts by a dashed, double-dotted red line. They develop 50 to 300 miles AHEAD of a cold front and roughly parallel to it, when cold air downdrafts running ahead of the front lift additional warm unstable air. They can also form nowhere near a cold front, from convergence. Usually most intense during the late afternoon and early evening, just after maximum daytime heating. Like a cold front, a squall line has a 90° wind shift from SW to NW.",
    relationships: ["50–300 miles ahead of the cold front · 90° wind shift, SW to NW"],
    commonTraps: [
      "It is often impossible to fly through a squall line even with radar, because the storms sit too close together.",
    ],
    source: TG("Frontal Mechanics", ["2.241"]),
  },
  {
    id: "wx-inactive-front",
    unit: "w6",
    name: "Inactive front",
    definition:
      "A front with no clouds and no precipitation, sometimes called a dry front, because the warm air mass is too dry for cloud to form even after being lifted and cooled. It is shown on the chart to mark the boundary of the opposing air masses and the location of potentially unfavourable flying weather. In many cases it produces only a wind shift and a change in temperature and pressure.",
    relationships: ["No cloud, no precipitation — only wind, temperature and pressure change"],
    source: TG("Frontal Mechanics", ["2.245"]),
  },

  /* ================= w7 · turbulence ================= */
  {
    id: "wx-clear-air-turbulence",
    unit: "w7",
    name: "Clear air turbulence",
    definition:
      "Turbulence in the absence of, or outside of, clouds. Any of the four causative types may occur without the visual warning that clouds provide. Occurrences of turbulence are local in extent and transient in character — general forecasts are quite good, but forecasting precise locations is difficult.",
    relationships: ["Any of the four causes can occur as CAT"],
    commonTraps: [
      "CAT is not a fifth cause. It describes turbulence occurring where there is no cloud to warn you.",
    ],
    source: TG("Turbulence", ["2.246"]),
  },
  {
    id: "wx-mountain-wave",
    unit: "w7",
    name: "Mountain wave turbulence",
    definition:
      "When strong winds blow approximately perpendicular to a mountain range, the resulting turbulence can be severe. Updrafts and downdrafts may extend to 2 to 20 times the height of the peaks. In stable air, standing or mountain waves form on the LEE side and extend up to 300 miles or more downwind. Extreme turbulence is usually found at low levels on the leeward side, in or near the rotor and cap clouds, when winds are 50 kt or greater at the mountaintop.",
    relationships: [
      "Winds ≥ 50 kt at the peak → severe turbulence from the surface to the tropopause, 150 miles downwind",
      "Moderate turbulence as far as 300 miles downwind",
    ],
    source: TG("Turbulence", ["2.251"]),
  },
  {
    id: "wx-wave-clouds",
    unit: "w7",
    name: "Mountain wave cloud formations",
    definition:
      "Lenticular clouds occur singly or in layers, usually above 20,000 ft, and are smooth in contour unless the airflow at that level is turbulent. The rotor cloud forms lower, generally at about the height of the mountain ridge. The cap cloud usually obscures both sides of the mountain peak. All three are STATIONARY in position even though the wind flows through them.",
    relationships: [
      "Lenticular high · rotor at ridge height · cap over the peak — all stationary",
    ],
    commonTraps: [
      "Wave action can occur when the air is too dry to form any cloud at all, producing clear air turbulence with no visual warning.",
    ],
    source: TG("Turbulence", ["2.251"]),
  },
  {
    id: "wx-wave-technique",
    unit: "w7",
    name: "Flying near mountain waves",
    definition:
      "Avoid the turbulence by flying around the wave area if possible; if not, fly at a level at least 50% higher than the highest mountain range along the route. Avoid the rotor, lenticular and cap clouds. Approach the range at a 45° angle so a quick turn away is possible if a severe downdraft is encountered. Avoid the leeward side. Do not place too much confidence in pressure altimeter readings near peaks — they may indicate more than 2,500 ft higher than true altitude. Penetrate turbulent areas at the airspeed recommended for the aircraft.",
    relationships: [
      "50% above the highest terrain · 45° approach angle · altimeter may over-read by 2,500 ft",
    ],
    source: TG("Turbulence", ["2.252"]),
  },

  /* ================= w8 · icing ================= */
  {
    id: "wx-frontal-icing",
    unit: "w8",
    name: "Frontal icing",
    definition:
      "A warm front gives stratiform clouds, rime icing, a low rate of accumulation and a widespread area. A cold front gives cumuliform clouds, clear icing, a high rate of accumulation and a limited area. An occluded front mixes both — stratus and cumulus, rime clear and mixed icing, rapid and heavy accumulation, over a very widespread area.",
    relationships: [
      "Warm front → rime, slow, widespread",
      "Cold front → clear, fast, limited",
      "Occluded → mixed, rapid and heavy, very widespread",
    ],
    commonTraps: [
      "The occluded front is the worst of all three: rapid heavy accumulation over a very widespread area.",
    ],
    source: TG("Icing", ["2.260"]),
  },
  {
    id: "wx-pirep-icing",
    unit: "w8",
    name: "PIREP icing intensities",
    definition:
      "Icing is reported by type — clear, rime or mixed — and by intensity. TRACE: ice becomes perceptible, accumulating slightly faster than it sublimates; de-ice is not used unless the encounter is extended. LIGHT: a problem over an extended time, over an hour, and occasional use of the equipment prevents accumulation. MODERATE: potentially hazardous even in short encounters, and equipment or diversion is necessary. SEVERE: the equipment FAILS to reduce or control it, and immediate diversion is necessary.",
    relationships: ["Trace · Light · Moderate · Severe"],
    commonTraps: [
      "Severe is defined by the equipment failing to cope, not by the rate alone.",
    ],
    source: TG("Icing", ["2.264", "2.265"]),
  },

  /* ================= w9 · storms and low visibility ================= */
  {
    id: "wx-fog-types",
    unit: "w9",
    name: "The two main types of fog",
    definition:
      "Radiation fog occurs from nocturnal cooling, usually on clear nights, when the earth radiates heat away and the surface cools. Cooling begins after the maximum daily temperature, usually between 1530 and 1600 local, and continues until sunrise or shortly after. Advection fog occurs when warm moist air moves over a cold surface and is cooled to the dew point — common in coastal areas, where it is called sea fog.",
    relationships: [
      "Radiation fog: nocturnal cooling, clear nights",
      "Advection fog: warm moist air over a cold surface",
    ],
    source: TG("Atmospheric Hazards", ["2.271"]),
  },
  {
    id: "wx-fog-winds",
    unit: "w9",
    name: "Wind and fog",
    definition:
      "For radiation fog, winds under 5 kt usually give shallow fog, 5 to 10 kt usually give dense fog, and more than 10 kt usually disperses it into low stratus or stratocumulus. Advection fog behaves oppositely: it becomes thicker and denser as wind speed increases, up to about 15 kt, and much stronger winds lift it into a layer of low stratus.",
    relationships: [
      "Radiation fog: 5–10 kt is the dense band, over 10 kt disperses it",
      "Advection fog: thicker as the wind rises, up to about 15 kt",
    ],
    commonTraps: [
      "The two types respond to wind in OPPOSITE directions. More wind thins radiation fog and thickens advection fog.",
    ],
    source: TG("Atmospheric Hazards", ["2.271"]),
  },
  {
    id: "wx-ash-clouds",
    unit: "w9",
    name: "Volcanic ash clouds",
    definition:
      "Ash clouds have severe effects on the aircraft and on its ability to remain airborne. Radar detection is unlikely because of the small particle size, so their presence may be unknown until you are inside one. Flight in ash is indicated by torching flames from the engine tailpipe, a St. Elmo's fire effect, and a bright glow in the engine inlets. Hazards include multiple engine malfunctions and flameout — all engines on a multi-engine aircraft — pitted windscreens affecting visibility, and sandblasting of external surfaces.",
    relationships: ["Radar cannot see it · all engines affected · windscreen pitted"],
    source: TG("Atmospheric Hazards", ["2.272"]),
  },
  {
    id: "wx-ash-avoidance",
    unit: "w9",
    name: "Escaping an ash cloud",
    definition:
      "Avoid flying in areas of known volcanic activity. If you encounter an ash cloud, do NOT proceed and do not try to fly over or under it — they are hundreds of miles long and thousands of feet thick. Make a 180° turn to escape, then notify the nearest ATC and transmit a PIREP.",
    relationships: ["180° turn out. Never over, never under, never through."],
    commonTraps: [
      "Over or under works for a thunderstorm and not for an ash cloud. The cloud is far too large.",
    ],
    source: TG("Atmospheric Hazards", ["2.272"]),
  },
  {
    id: "wx-thunderstorm-radar",
    unit: "w9",
    name: "Radar near thunderstorms",
    definition:
      "A direct relationship exists between the strength of the radar echoes, the presence of aircraft icing and the intensity of turbulence — stronger echoes mean a more severe thunderstorm. Radar echo tops above 35,000 ft often mean extreme turbulence and hail. Scattered echoes can usually be circumnavigated; broken or solid lines of moderate to strong intensity can be avoided only if the aircraft is radar equipped. Severe clear air turbulence and hail may be experienced BETWEEN thunderstorms if the echoes are separated by less than 30 miles.",
    relationships: [
      "Echo tops above 35,000 ft → extreme turbulence and hail",
      "Echoes less than 30 miles apart → severe CAT and hail between them",
    ],
    commonTraps: [
      "Radar shows only precipitation, so it locates the severe areas — it does not eliminate the hazard, and it is not a penetration aid.",
    ],
    source: TG("Thunderstorms", ["2.275"]),
  },

  /* ================= w10 · weather products ================= */
  {
    id: "wx-advisory-identifiers",
    unit: "w10",
    name: "Advisory letter identifiers",
    definition:
      "SIGMETs are WS, Convective SIGMETs are WST, and AIRMETs are WA. Within a WA there are three AIRMET types: Sierra for widespread IFR conditions — ceilings below 1,000 ft and/or visibility below 3 miles affecting over 50% of the area — or extensive mountain obscuration; Tango for moderate turbulence or sustained surface winds of 30 kt or more; and Zulu for moderate icing or freezing level data.",
    relationships: [
      "WS SIGMET · WST Convective SIGMET · WA AIRMET",
      "Sierra IFR · Tango turbulence and wind · Zulu icing and freezing level",
    ],
    commonTraps: [
      "Sierra, Tango and Zulu are reserved for the scheduled AIRMETs, which is why non-convective SIGMETs use other phonetic designators.",
    ],
    source: TG("Weather Products", ["2.277", "2.278"]),
  },
];
