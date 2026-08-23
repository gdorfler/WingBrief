import type { Concept, SourceReference } from "@/lib/types";

const TG = (chapter: string, eo: string[]): SourceReference => ({
  document: "Navigation Trainee Guide",
  chapter,
  eo,
});

const C1 = "Introduction to Air Navigation";
const C2 = "Chart Projections, Plotting and Global Timekeeping";
const C3 = "CR-3 Air Navigation Computer";
const C4 = "Airspeeds";
const C5 = "Preflight Winds";
const C6 = "In Flight Winds";
const C7 = "Flight Planning and Conduct";

/**
 * What a Navigation student has to know, as distinct from what they have to be
 * able to do. The doing lives in skills.ts; this is the vocabulary, the
 * definitions the exam tests by wording, and the relationships that make the
 * procedures make sense rather than being sequences to memorise.
 */
export const CONCEPTS: Concept[] = [
  /* ================= n1 — Dead reckoning ================= */
  {
    id: "nav-definition",
    unit: "n1",
    name: "Air navigation",
    definition:
      "The process of determining the geographic position and maintaining the desired direction of an aircraft relative to the surface of the earth.",
    relationships: ["Navigation = the history of the flight path + the prediction of it"],
    source: TG(C1, ["2.330"]),
  },
  {
    id: "nav-dead-reckoning",
    unit: "n1",
    name: "Dead reckoning",
    definition:
      "Directing an aircraft and determining its position by applying direction and speed data from a previous position. It is the basis for all types of air navigation.",
    commonTraps: [
      "Visual and electronic navigation are back-ups to DR, not alternatives to it. Neither relieves the aircrew of keeping a good DR plot.",
    ],
    source: TG(C1, ["2.331", "2.332"]),
  },
  {
    id: "nav-dr-components",
    unit: "n1",
    name: "The four components of DR",
    definition:
      "Position, direction, time and speed. Know any three and the fourth follows, which is the whole of dead reckoning in one sentence.",
    relationships: ["Speed × Time = Distance", "Any three of the four → the fourth"],
    formula: "\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}",
    commonTraps: ["Altitude and temperature are not components. They are secondary inputs that affect speed."],
    source: TG(C1, ["2.332"]),
  },
  {
    id: "nav-types",
    unit: "n1",
    name: "The three types of navigation",
    definition:
      "Dead reckoning, visual and electronic. Visual and electronic exist to support DR, and neither is a stand-alone method.",
    commonTraps: [
      "Autopilot and inertial are not types. Inertial is a category of electronic navigation — a fast DR computer.",
    ],
    source: TG(C1, ["2.331"]),
  },
  {
    id: "nav-visual",
    unit: "n1",
    name: "Visual navigation",
    definition:
      "Maintaining direct visual contact with the surface and using ground references to fix position or steer. Common in helicopters and in high-speed low-level flight.",
    relationships: ["No visibility → no visual navigation", "Without a DR plot → references get misidentified"],
    source: TG(C1, ["2.331"]),
  },
  {
    id: "nav-electronic",
    unit: "n1",
    name: "Electronic navigation",
    definition:
      "Three families: receiving from ground stations (VOR, TACAN, ADF, VORTAC, VOR/DME), transmitting your own signal (radar, Doppler), and self-contained systems you initialise yourself (INS). GPS receives from satellites.",
    commonTraps: ["The INS is self-contained but still needs the crew to input a starting position."],
    source: TG(C1, ["2.331"]),
  },
  {
    id: "nav-primary-instruments",
    unit: "n1",
    name: "The three primary DR instruments",
    definition:
      "Compass for direction and position, clock for time, airspeed indicator for speed — one instrument for each component of DR that the aircraft can measure directly.",
    relationships: ["BDHI → direction and position", "Clock → time", "Airspeed indicator → speed"],
    source: TG(C1, ["2.333"]),
  },
  {
    id: "nav-secondary-instruments",
    unit: "n1",
    name: "The two secondary DR instruments",
    definition:
      "The altimeter and the outside air temperature gauge. They give altitude and temperature, which set air density, which sets true airspeed.",
    commonTraps: ["Asked for the secondary instruments, the answer is altimeter and OAT — not compass and airspeed."],
    source: TG(C1, ["2.333"]),
  },
  {
    id: "nav-bdhi",
    unit: "n1",
    name: "The remote gyro vertical compass card",
    definition:
      "The aircrew's primary direction instrument, also called the BDHI or EHSI. In modern aircraft a ring laser gyro INS drives it, with no magnetic input needed.",
    commonTraps: ["The primary instrument is the compass card, not the stand-by compass."],
    source: TG(C1, ["2.333"]),
  },
  {
    id: "nav-standby-compass",
    unit: "n1",
    name: "The stand-by compass",
    definition:
      "A direct-reading magnetic compass, fluid-filled to damp the needle. Unstable in manoeuvre, but reliable and independent of the aircraft's electrical system.",
    relationships: ["Manoeuvring → unreliable", "Electrical failure → still works"],
    commonTraps: ["It is damped by fluid, not stabilised by gyroscopes."],
    source: TG(C1, ["2.333"]),
  },
  {
    id: "nav-latitude-longitude",
    unit: "n1",
    name: "Latitude and longitude",
    definition:
      "The primary aviation coordinate system. Latitude is angular distance north or south of the equator, 0 to 90; longitude is angular distance east or west of the prime meridian, 0 to 180.",
    relationships: ["Parallels = lines of latitude", "Meridians = lines of longitude", "60 minutes in a degree"],
    commonTraps: [
      "Read latitude first, and write longitude with three digits.",
      "There are 60 minutes in a degree, not 60 degrees in a minute.",
    ],
    source: TG(C1, ["2.330"]),
  },
  {
    id: "nav-tacan-station",
    unit: "n1",
    name: "TACAN",
    definition:
      "A ground station giving distance in nautical miles and magnetic bearing. It emits 360 radials calibrated to magnetic north, on channels 1 to 126 with an X or Y sub-designation, in the 962 to 1213 MHz band.",
    relationships: ["Known station position + radial + DME → your position"],
    source: TG(C1, ["2.331"]),
  },
  {
    id: "nav-elapsed-time",
    unit: "n1",
    name: "Time of day and elapsed time",
    definition:
      "Time of day is four digits: 0815, 1400. Elapsed time uses a plus sign: 2+30, or 09+15+20 in six-digit form.",
    relationships: ["ETD and ETA → time of day", "ETE → elapsed time"],
    source: TG(C1, ["2.330"]),
  },

  /* ================= n2 — The earth on paper ================= */
  {
    id: "nav-undevelopable",
    unit: "n2",
    name: "The undevelopable surface",
    definition:
      "A sphere cannot be flattened without stretching or tearing, so every chart distorts something. A chart projection transfers the graticule onto a surface that can be flattened — a cone or a cylinder.",
    source: TG(C2, ["2.335"]),
  },
  {
    id: "nav-great-circle",
    unit: "n2",
    name: "Great circle",
    definition:
      "A circle whose plane passes through the earth's centre, dividing it into two equal halves. It is the shortest distance between two points on the surface.",
    relationships: ["Great circle → shortest distance → saves time and fuel"],
    commonTraps: [
      "All meridians are great circles. Only one parallel is — the equator.",
      "Great circles are not restricted to horizontal or vertical; any plane through the centre gives one.",
    ],
    source: TG(C2, ["2.334"]),
  },
  {
    id: "nav-small-circle",
    unit: "n2",
    name: "Small circle",
    definition:
      "The intersection of a sphere and a plane that does not pass through the centre. Every parallel except the equator is one.",
    source: TG(C2, ["2.334"]),
  },
  {
    id: "nav-lambert",
    unit: "n2",
    name: "Lambert conformal projection",
    definition:
      "The most widely used aviation projection. A conic, developed by laying a secant cone over the earth cutting at two standard parallels.",
    relationships: [
      "Parallels → equally spaced concentric circles",
      "Meridians → straight lines converging at the poles",
      "Scale → constant",
      "Great circles → plot as straight lines",
    ],
    commonTraps: [
      "Parallels appear curved and meridians straight — the reverse of what most people guess.",
      "Lambert meridians are oriented to TRUE north, so a line drawn on one is a true course.",
    ],
    source: TG(C2, ["2.335"]),
  },
  {
    id: "nav-onc-tpc",
    unit: "n2",
    name: "ONC and TPC",
    definition:
      "The two Lambert charts in use. The ONC is 1:1,000,000 for long-range planning; the TPC is 1:500,000 with more ground detail and is the usual chart for route and checkpoint work.",
    commonTraps: ["The larger number is the smaller scale: 1:1,000,000 shows less detail than 1:500,000."],
    source: TG(C2, ["2.335"]),
  },
  {
    id: "nav-mercator",
    unit: "n2",
    name: "Mercator projection",
    definition:
      "A cylindrical projection. Its variable distance scale and curved great-circle routes make it awkward for air navigation, so it is used less often.",
    source: TG(C2, ["2.335"]),
  },

  /* ================= n3 — Direction ================= */
  {
    id: "nav-direction",
    unit: "n3",
    name: "Direction",
    definition:
      "An angular distance from a reference, stated in whole numbers from 001° to 360°. The reference is either true north or magnetic north.",
    commonTraps: ["Directions run 001 to 360. There is no 000."],
    source: TG(C2, ["2.336"]),
  },
  {
    id: "nav-course",
    unit: "n3",
    name: "Course",
    definition: "The aircraft's intended flight path — the line you drew from departure to destination.",
    source: TG(C2, ["2.336"]),
  },
  {
    id: "nav-heading",
    unit: "n3",
    name: "Heading",
    definition:
      "The angular distance of the aircraft's longitudinal axis from a reference — where the nose is pointed. It differs from course to compensate for crosswind.",
    source: TG(C2, ["2.336"]),
  },
  {
    id: "nav-track",
    unit: "n3",
    name: "Track",
    definition: "The aircraft's actual flight path over the ground — a line from departure to the current fix.",
    relationships: ["Course = intended", "Heading = pointed", "Track = achieved"],
    commonTraps: ["Track is what happened. Course is what you meant. The exam swaps them constantly."],
    source: TG(C2, ["2.336"]),
  },
  {
    id: "nav-true-vs-magnetic-north",
    unit: "n3",
    name: "True and magnetic north",
    definition:
      "True north is the top of the earth. Magnetic north is where the earth's magnetic lines of force emanate from, currently near Hudson Bay in Canada.",
    source: TG(C2, ["2.337"]),
  },
  {
    id: "nav-variation",
    unit: "n3",
    name: "Variation",
    definition:
      "The angular difference between true north and magnetic north from a given position on the earth's surface, expressed in degrees east or west.",
    relationships: ["Magnetic north east of true north → easterly variation"],
    source: TG(C2, ["2.337"]),
  },
  {
    id: "nav-isogonic",
    unit: "n3",
    name: "Isogonic line",
    definition:
      "A line connecting points of equal variation. On TPC and ONC charts they appear as dashed blue lines with the variation printed in degrees.",
    commonTraps: ["An isogonic line joins equal VARIATION, not equal elevation, deviation or pressure."],
    source: TG(C2, ["2.337"]),
  },
  {
    id: "nav-variation-conversion",
    unit: "n3",
    name: "Converting true to magnetic",
    definition:
      "Subtract easterly variation and add westerly variation. East is least, and west is best.",
    formula: "MC = TC - \\text{East} \\qquad MC = TC + \\text{West}",
    relationships: ["True → magnetic: east subtracts", "Magnetic → true: the formula reverses"],
    commonTraps: [
      "Plotting a TACAN radial runs the other way: the radial is magnetic and the chart is true, so easterly variation is ADDED.",
    ],
    source: TG(C2, ["2.338"]),
  },

  /* ================= n4 — Global timekeeping ================= */
  {
    id: "nav-gmt",
    unit: "n4",
    name: "Greenwich mean time",
    definition:
      "The time at the prime meridian, also called Zulu. Aviation's common reference, because it is the same everywhere at any instant — weather briefs and flight plans are filed in it.",
    source: TG(C2, ["4.1"]),
  },
  {
    id: "nav-time-zones",
    unit: "n4",
    name: "Time zones",
    definition:
      "The earth turns 360° in 24 hours, so 15° an hour. That divides it into 24 zones, each 15° of longitude wide and centred on a meridian that is a multiple of 15°.",
    formula: "\\frac{360°}{24\\text{ h}} = 15°/\\text{h}",
    source: TG(C2, ["4.1"]),
  },
  {
    id: "nav-zone-description",
    unit: "n4",
    name: "Zone description",
    definition:
      "The numeric designator for a zone: the difference in hours from local time to GMT. Found in the IFR en route supplement after the airfield's coordinates.",
    commonTraps: [
      "You cannot reliably get it by dividing longitude by 15 — zone boundaries follow political lines and daylight saving moves them.",
    ],
    source: TG(C2, ["4.1"]),
  },
  {
    id: "nav-zulu-conversion",
    unit: "n4",
    name: "Converting to and from Zulu",
    definition:
      "GMT equals local mean time minus the zone description; local mean time equals GMT plus the zone description.",
    formula: "GMT = LMT - (ZD) \\qquad LMT = GMT + (ZD)",
    commonTraps: [
      "Subtracting a negative adds. A zone description of −6 means GMT is six hours later than local, not earlier.",
    ],
    source: TG(C2, ["4.2"]),
  },
  {
    id: "nav-fly-in-zulu",
    unit: "n4",
    name: "Fly in Zulu",
    definition:
      "Convert the departure time to Zulu, add the time en route in Zulu, then convert the arrival to the destination's local time. Three steps, and the middle one never crosses a zone.",
    relationships: ["Convert out → add ETE → convert back"],
    source: TG(C2, ["4.2"]),
  },

  /* ================= n5 — Chart work ================= */
  {
    id: "nav-plotter",
    unit: "n5",
    name: "The plotter",
    definition:
      "A combination protractor and straightedge. Its parts are the straightedge, the grommet at the centre of the protractor, the outer scales running 0–180 and 180–360, and an inner north/south scale.",
    commonTraps: [
      "The number line is reversed — values increase to the left.",
      "Do not use the distance scales on the straightedge; they are not accurate. Distance is the dividers' job.",
    ],
    source: TG(C2, ["4.3", "4.6"]),
  },
  {
    id: "nav-dividers",
    unit: "n5",
    name: "The dividers",
    definition:
      "Used primarily for measuring distance, and with the plotter as a way of carrying a course line to a convenient meridian.",
    source: TG(C2, ["4.5", "4.6"]),
  },
  {
    id: "nav-pulling-coordinates",
    unit: "n5",
    name: "Pulling coordinates",
    definition:
      "Align the grommet and the 90° mark along one meridian, slide the straightedge onto the point, mark where it crosses the meridian, and count up from the nearest whole degree. Repeat against a parallel for longitude.",
    relationships: ["Latitude → align to a meridian", "Longitude → align to a parallel"],
    source: TG(C2, ["4.3"]),
  },
  {
    id: "nav-speed-marks",
    unit: "n5",
    name: "Speed marks",
    definition:
      "The graduation up a meridian: a mark every minute, a longer one every five that stays on the left of the line, and a longer one still every ten that crosses it. Round to the nearest tenth of a minute.",
    relationships: ["Ten-minute marks cross the meridian", "Five-minute marks sit to its left"],
    source: TG(C2, ["4.3"]),
  },
  {
    id: "nav-plotting-coordinates",
    unit: "n5",
    name: "Plotting coordinates",
    definition:
      "Draw the latitude line with the plotter horizontal and the grommet on a meridian, rotate 90° and draw the longitude line with the grommet on a parallel. The point is where they cross.",
    source: TG(C2, ["4.4"]),
  },
  {
    id: "nav-measuring-direction",
    unit: "n5",
    name: "Measuring direction",
    definition:
      "Connect the points, estimate the answer, span the dividers along the line, lay the straightedge against their points, and slide until the grommet sits on a meridian. Read the outer scale.",
    relationships: ["Grommet on a meridian → read the outer scale", "Grommet on a parallel → read the inner north/south scale"],
    commonTraps: [
      "There are always two candidate readings. The estimate picks between them, and skipping it is how a 180° error happens.",
      "Bracket the meridian — read the numbers to its left and right — or you can be ten degrees out.",
    ],
    source: TG(C2, ["4.6"]),
  },
  {
    id: "nav-north-south-scale",
    unit: "n5",
    name: "The north/south scale",
    definition:
      "The innermost scale, for course lines running close to north–south where no meridian can be brought under the grommet. Put a parallel under the grommet instead and read the inner scale.",
    relationships: ["Meridian under the grommet → outer scale", "Parallel under the grommet → inner scale"],
    source: TG(C2, ["4.6"]),
  },
  {
    id: "nav-plotting-direction",
    unit: "n5",
    name: "Plotting direction",
    definition:
      "Estimate, hold a pencil on the point, slide the straightedge against it, then slide the grommet along the nearest meridian until the desired direction reads under the outer scale.",
    source: TG(C2, ["4.5"]),
  },
  {
    id: "nav-measuring-distance",
    unit: "n5",
    name: "Measuring distance",
    definition:
      "One nautical mile is one minute of arc along any great circle. All meridians are great circles, so a degree of latitude measured up a meridian is 60 NM.",
    relationships: ["1 minute of latitude = 1 NM", "1 degree of latitude = 60 NM"],
    commonTraps: [
      "Never measure distance along a parallel — a parallel is not a great circle and its minutes are short.",
      "The degrees marked on the longitude lines are degrees of LATITUDE. That is what you are counting.",
    ],
    source: TG(C2, ["4.5"]),
  },
  {
    id: "nav-walking-dividers",
    unit: "n5",
    name: "Walking the dividers",
    definition:
      "When a leg will not fit in one span, set the dividers to a fixed distance — 30 NM works well — and step them along the line, counting in multiples, then close them on the remainder.",
    source: TG(C2, ["4.5"]),
  },
  {
    id: "nav-tacan-fix",
    unit: "n5",
    name: "TACAN position fixing",
    definition:
      "Take the radial and DME off the BDHI, convert the radial from magnetic to true using the variation at the station, plot it out from the station and mark off the distance.",
    relationships: ["Magnetic radial + variation → true radial → plot"],
    commonTraps: [
      "The radial is magnetic and the chart is true, so the conversion runs the reverse of the usual one — easterly variation is added.",
      "The DME is slant range. For this course, treat it as ground range.",
    ],
    source: TG(C2, ["4.7"]),
  },
  {
    id: "nav-needle-head-tail",
    unit: "n5",
    name: "Head and tail of the #2 needle",
    definition:
      "The head gives the magnetic bearing TO the station. The tail gives the radial you are on. They are reciprocals.",
    commonTraps: ["A problem that gives you a bearing to the station has not given you the radial. Flip it first."],
    source: TG(C2, ["4.7"]),
  },

  /* ================= n6 — The CR-3 ================= */
  {
    id: "nav-cr3",
    unit: "n6",
    name: "The CR-3",
    definition:
      "A two-sided disc: a circular slide rule on the front and a wind-solution graphic on the back. Chosen over an electronic calculator for reliability and cost.",
    commonTraps: ["Use only soft pencil or felt tip on the wind side, and keep it out of direct sunlight — heat warps it."],
    source: TG(C3, ["4.8"]),
  },
  {
    id: "nav-cr3-wheels",
    unit: "n6",
    name: "Outer and inner wheels",
    definition:
      "The outer white scale on the base carries distance and fuel; the inner grey rotating scale carries time. Both are logarithmic and identical, so lining up the 10s makes them read the same.",
    relationships: ["Numerator → outer wheel", "Denominator → inner wheel"],
    source: TG(C3, ["4.8"]),
  },
  {
    id: "nav-floating-decimal",
    unit: "n6",
    name: "The floating decimal",
    definition:
      "A printed number stands for any power of ten of itself: 21 may be 0.21, 2.1, 21, 210 or 2100. The scale gives you the digits; the estimate gives you the decimal point.",
    commonTraps: ["This is why the guide says to estimate first. Without an estimate the wheel cannot tell you which answer it means."],
    source: TG(C3, ["4.8", "4.9"]),
  },
  {
    id: "nav-tick-values",
    unit: "n6",
    name: "What a tick mark is worth",
    definition:
      "Nine ticks between whole numbers from 10 to 15, so each is worth one. Four between 15 and 30, so each is worth two. One between whole numbers from 30 to 60, worth five.",
    relationships: ["10–15 → 1 per tick", "15–30 → 2 per tick", "30–60 → 5 per tick"],
    commonTraps: ["The ±1% tolerance is defined against the 10-to-15 section, where the ticks are finest."],
    source: TG(C3, ["4.8"]),
  },
  {
    id: "nav-rate-index",
    unit: "n6",
    name: "The rate index",
    definition:
      "The triangle where 60 would be on the inner wheel. Used for any problem where the unit of time is an hour, which is most of them.",
    commonTraps: ["It marks 60 MINUTES, not 1. The value there is 0.6, 6.0 or 60 — never one."],
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nav-high-speed-index",
    unit: "n6",
    name: "The high-speed index",
    definition:
      "The small SEC arrow at 36 on the inner wheel, because 3,600 seconds is an hour. Used when the time being read is seconds.",
    relationships: [
      "Time ≤ 5 min → use it",
      "Distance ≤ 5 NM → use it",
      "Speed ≥ 500 kt → use it",
      "Seconds anywhere in the problem → use it",
    ],
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nav-unit-index",
    unit: "n6",
    name: "The unit index",
    definition:
      "The mark at 10 on both wheels, for any calculation that does not involve time — fuel conversion above all.",
    commonTraps: ["Do not use the rate index for a gallons-to-pounds conversion. There is no time in the problem."],
    source: TG(C3, ["4.10"]),
  },
  {
    id: "nav-cursor",
    unit: "n6",
    name: "The cursor hairline",
    definition:
      "Primarily the way temperature is entered for a true airspeed solution. Secondarily an aid to interpolating any value between the printed marks.",
    source: TG(C3, ["4.8"]),
  },
  {
    id: "nav-ratio",
    unit: "n6",
    name: "Ratios on the wheel",
    definition:
      "Set the proportion on the two scales exactly as it is written on paper. Every other equal fraction is then set up at the same time, and any one of them can be read straight off.",
    relationships: ["Numerators must share a unit", "Denominators must share a unit", "Numerator outside, denominator inside"],
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nav-hour-circle",
    unit: "n6",
    name: "The hour circle",
    definition:
      "The scale under the minute scale that reads hours and minutes directly. 150 minutes shows 2:30 beneath it; the small marks between hours are ten-minute steps.",
    relationships: ["Time scale as minutes → hour circle reads hours", "Time scale as seconds → hour circle reads minutes"],
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nav-rule-of-60",
    unit: "n6",
    name: "The rule of 60",
    definition: "Groundspeed divided by 60 is the distance covered in one minute.",
    formula: "\\frac{GS}{60} = \\text{NM per minute}",
    relationships: ["60 kt → 1 NM/min", "300 kt → 5 NM/min", "600 kt → 10 NM/min"],
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nav-rule-of-6",
    unit: "n6",
    name: "The rule of 6",
    definition: "A tenth of groundspeed is the distance covered in six minutes.",
    relationships: ["300 kt → 30 NM in 6 minutes"],
    source: TG(C3, ["4.9"]),
  },
  {
    id: "nav-fuel-consumption",
    unit: "n6",
    name: "Fuel consumption",
    definition:
      "The same rate problem as time, speed and distance, with fuel in place of distance. The outer scale becomes pounds; the inner stays time.",
    formula: "\\frac{\\text{Fuel flow}}{\\text{Rate index}} = \\frac{\\text{Fuel consumed}}{\\text{Time}}",
    source: TG(C3, ["4.10"]),
  },
  {
    id: "nav-fuel-conversion",
    unit: "n6",
    name: "Fuel conversion",
    definition:
      "Fuel is bought in gallons and flown in pounds. On a standard day most aviation fuel weighs between 6.5 and 6.9 pounds per gallon.",
    formula: "\\frac{\\text{Fuel weight}}{1\\text{ gal}} = \\frac{\\text{Total pounds}}{\\text{Total gallons}}",
    commonTraps: ["There are always more pounds than gallons. If your answer says otherwise, the setup is inverted."],
    source: TG(C3, ["4.10"]),
  },

  /* ================= n7 — Altitude and airspeed ================= */
  {
    id: "nav-standard-day",
    unit: "n7",
    name: "Standard day",
    definition:
      "29.92 inches of mercury and +15 °C at mean sea level, with a standard lapse rate of 2 °C and 1 inHg per 1,000 feet of altitude.",
    relationships: ["On a standard day, calibrated altitude = true altitude"],
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nav-altitude-types",
    unit: "n7",
    name: "The five altitudes",
    definition:
      "Indicated is what the altimeter reads on the local setting. Calibrated is indicated corrected for instrument error. Pressure is calibrated corrected to 29.92. True is height above mean sea level. Absolute is height above the ground.",
    relationships: ["Indicated → calibrated → pressure (for TAS)", "Calibrated corrected for density → true"],
    commonTraps: ["Pressure altitude is the reference for true airspeed. True altitude is what terrain elevation is measured against."],
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nav-instrument-error",
    unit: "n7",
    name: "Instrument error",
    definition:
      "The difference between known airfield elevation and indicated altitude with the current setting dialled in. It cannot be corrected for, and above 75 feet total the aircraft is unsafe for IFR.",
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nav-pressure-altitude",
    unit: "n7",
    name: "Pressure altitude and LAGS",
    definition:
      "Find the difference between the altimeter setting and 29.92, turn it into feet at 1,000 per inch, then add or subtract. Less than 29.92 → Add. Greater → Subtract.",
    formula: "PA = CA + (29.92 - \\text{setting}) \\times 1000",
    commonTraps: ["In flight you can read pressure altitude straight off the altimeter — but only with 29.92 set and no instrument error."],
    source: TG(C4, ["2.340"]),
  },
  {
    id: "nav-altimeter-errors",
    unit: "n7",
    name: "Flying into changing pressure",
    definition:
      "Without a current setting, flying from high pressure to low leaves the altimeter reading high and the aircraft lower than indicated. The reverse also holds.",
    relationships: [
      "High to low → look out below",
      "Low to high → plenty of sky",
      "0.10 inHg → 100 feet of altimeter error",
    ],
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nav-temperature-error",
    unit: "n7",
    name: "Temperature and the altimeter",
    definition:
      "Every 11 °C away from the standard lapse rate puts the altimeter out by 4%. Colder than standard and the aircraft is lower than indicated; warmer and it is higher.",
    source: TG(C4, ["2.339"]),
  },
  {
    id: "nav-ias",
    unit: "n7",
    name: "Indicated airspeed",
    definition: "The airspeed read directly off the cockpit indicator.",
    source: TG(C4, ["2.42"]),
  },
  {
    id: "nav-cas",
    unit: "n7",
    name: "Calibrated airspeed",
    definition:
      "Indicated airspeed corrected for instrument and installation error, using the airspeed calibration card in the cockpit. Use it in place of indicated wherever possible.",
    source: TG(C4, ["2.43"]),
  },
  {
    id: "nav-tas",
    unit: "n7",
    name: "True airspeed",
    definition:
      "Calibrated airspeed corrected for air density — that is, for pressure and temperature. It is the speed of the aircraft through the air mass, and wind does not affect it.",
    relationships: ["Altitude ↑ at constant IAS → TAS ↑"],
    source: TG(C4, ["2.45", "2.47"]),
  },
  {
    id: "nav-groundspeed",
    unit: "n7",
    name: "Ground speed",
    definition:
      "The aircraft's actual speed relative to the ground, found by correcting true airspeed for the head or tail component of the wind.",
    relationships: ["GS = TAS ± head/tail component"],
    source: TG(C4, ["2.46"]),
  },
  {
    id: "nav-density-effect",
    unit: "n7",
    name: "Density and true airspeed",
    definition:
      "Temperature and pressure set air density, and density is the whole difference between what the pitot-static system reads and how fast the aircraft is really moving through the air.",
    relationships: ["Density ↓ → TAS above CAS by more", "Altitude ↑ → density ↓ → TAS ↑ at a given CAS"],
    source: TG(C4, ["2.339", "2.47"]),
  },
  {
    id: "nav-tas-procedure",
    unit: "n7",
    name: "Solving for true airspeed",
    definition:
      "Set the CAS over the pressure altitude in the window, then put the hairline where the temperature curve crosses the Mach spiral and read TAS below it.",
    commonTraps: ["The CAS and altitude scales in that window increase in opposite directions — 10,000 sits to the right of 15,000."],
    source: TG(C4, ["2.340"]),
  },
  {
    id: "nav-mach",
    unit: "n7",
    name: "Mach number",
    definition:
      "The ratio of true airspeed to the local speed of sound. Read off the Mach index in the same window, from the same CAS-over-altitude setting.",
    formula: "M = \\frac{TAS}{LSOS}",
    relationships: ["At a constant Mach number the corresponding TAS is temperature dependent"],
    commonTraps: ["Mach needs no temperature input on the CR-3. TAS does."],
    source: TG(C4, ["2.341"]),
  },
  {
    id: "nav-shock-wave",
    unit: "n7",
    name: "Why Mach matters",
    definition:
      "Pressure waves travel at the speed of sound. As the aircraft approaches it they pile up into a shock wave, so the two velocities are worth comparing directly.",
    source: TG(C4, ["2.341"]),
  },

  /* ================= n8 — Preflight winds ================= */
  {
    id: "nav-wind-reporting",
    unit: "n8",
    name: "How wind is reported",
    definition:
      "Direction is where the wind blows FROM, in degrees, and velocity is always in knots. En route winds from the forecaster are TRUE; surface winds from the tower are MAGNETIC, to match the runways.",
    commonTraps: ["A 045 wind comes from the north-east and blows toward the south-west."],
    source: TG(C5, ["4.14"]),
  },
  {
    id: "nav-balloon",
    unit: "n8",
    name: "The moving balloon",
    definition:
      "Think of the air mass as a balloon. Inside it the aircraft goes where it points at its own speed; over the ground it goes where the balloon takes it as well.",
    relationships: ["Air mass parallel to the course → simple addition", "At an angle → vector addition"],
    source: TG(C5, ["4.14"]),
  },
  {
    id: "nav-wind-triangle",
    unit: "n8",
    name: "The wind triangle",
    definition:
      "Three vectors. The air vector is true heading and true airspeed; the wind vector is direction and velocity; their sum is the ground vector, true course or track with groundspeed.",
    relationships: ["Air vector + wind vector = ground vector", "Any two sides → the third"],
    source: TG(C5, ["4.14"]),
  },
  {
    id: "nav-crab-drift",
    unit: "n8",
    name: "Crab angle and drift angle",
    definition:
      "Drift is the difference between heading and track, left or right of heading. Crab is the correction turned into the wind to hold the course. They are equal in size and opposite in direction.",
    commonTraps: ["A right crosswind drifts you left, so you crab right. The two words describe the same angle from opposite ends."],
    source: TG(C5, ["4.14"]),
  },
  {
    id: "nav-ten-percent",
    unit: "n8",
    name: "The ten percent rule",
    definition:
      "A crosswind equal to 10% of true airspeed gives about 6° of crab, and the relationship holds across the airspeeds of tactical aviation.",
    relationships: ["5% of TAS → 3°", "10% of TAS → 6°", "15% of TAS → 9°"],
    source: TG(C5, ["4.15"]),
  },
  {
    id: "nav-quartering",
    unit: "n8",
    name: "Quartering analysis",
    definition:
      "Before touching the wheel, sketch the wind against the course and name the quarter it is in. That fixes whether heading will be more or less than course and whether groundspeed will beat true airspeed.",
    relationships: [
      "Left head → TH < TC, GS < TAS",
      "Right head → TH > TC, GS < TAS",
      "Left tail → TH < TC, GS > TAS",
      "Right tail → TH > TC, GS > TAS",
    ],
    source: TG(C5, ["4.14"]),
  },
  {
    id: "nav-wind-scales",
    unit: "n8",
    name: "The two wind scales",
    definition:
      "The large scale runs 0 to 80 and is used when the wind is under 60 knots; the small scale runs 0 to 160 for anything stronger. Once chosen, the same scale is used throughout the problem.",
    commonTraps: ["Mixing the two scales inside one problem gives a plausible answer that is wrong by a factor of two."],
    source: TG(C5, ["4.15"]),
  },
  {
    id: "nav-preflight-procedure",
    unit: "n8",
    name: "The preflight wind procedure",
    definition:
      "Estimate. Plot the wind, set the TAS, set the true course, read the crosswind, read the head or tail component, apply it for groundspeed, read the crab, apply it for heading, then check the estimate again.",
    source: TG(C5, ["4.15"]),
  },

  /* ================= n9 — In-flight winds ================= */
  {
    id: "nav-inflight-theory",
    unit: "n9",
    name: "Why the wind is never the forecast",
    definition:
      "Once fixed in flight you know track and groundspeed, and you already know heading and true airspeed. That is two sides of the triangle, so the wind actually blowing can be recovered.",
    relationships: ["Fix → track and GS", "Track and GS + heading and TAS → the wind"],
    source: TG(C6, ["2.342"]),
  },
  {
    id: "nav-inflight-procedure",
    unit: "n9",
    name: "The in-flight wind procedure",
    definition:
      "Estimate. Set TAS over the index, set TRACK — not course — over the course index, input the drift angle, read the crosswind, draw it, draw the head or tail component, rotate the intersection to twelve o'clock, and read direction and velocity.",
    commonTraps: ["Step two takes track, not course. Setting the course here is the standard way to get a confident wrong answer."],
    source: TG(C6, ["2.343"]),
  },
  {
    id: "nav-inflight-estimate",
    unit: "n9",
    name: "Estimating the wind",
    definition:
      "Compare groundspeed to true airspeed for head or tail, and heading to track for which side. Then all of the big component and half of the small gives the strength.",
    relationships: ["GS > TAS → tailwind", "TH < TK → right drift → wind from the left"],
    source: TG(C6, ["2.343"]),
  },
  {
    id: "nav-point-to-point",
    unit: "n9",
    name: "TACAN point to point",
    definition:
      "Navigating direct from one radial and DME fix to another without first flying to the station. On the CR-3 the wind grid becomes a map with the station at its centre.",
    relationships: ["Plot both fixes → connect → rotate the line vertical, destination up → read the course at the index"],
    commonTraps: [
      "Circle the destination dot. Without it the answer comes out as the reciprocal.",
      "The radials are magnetic, so the course you read is magnetic.",
    ],
    source: TG(C6, ["2.344"]),
  },

  /* ================= n10 — Flight planning ================= */
  {
    id: "nav-planning-steps",
    unit: "n10",
    name: "The four planning steps",
    definition:
      "Measure true courses and distances. Use preflight winds for headings and groundspeeds. Compute an ETE for each leg from groundspeed. Compute leg fuel from the ETE and the fuel flow.",
    relationships: ["Course and distance → heading and GS → ETE → leg fuel"],
    source: TG(C7, ["4.11"]),
  },
  {
    id: "nav-jet-log",
    unit: "n10",
    name: "The jet log",
    definition:
      "A five-by-seven card for the knee board. Its primary purpose is fuel management; it also carries en route communications, navigation and navaid identification in one place.",
    commonTraps: ["Asked for the PRIMARY purpose, the answer is fuel management — not navigation data or timing."],
    source: TG(C7, ["4.12"]),
  },
  {
    id: "nav-jet-log-enroute",
    unit: "n10",
    name: "The en route section",
    definition:
      "The only part of the log this course uses. Columns for the navaid, magnetic course, distance, ETE, ETA and actual, leg fuel, and estimated fuel remaining with actual alongside.",
    relationships: ["EFR at a fix = previous EFR − this leg's fuel"],
    source: TG(C7, ["4.12", "4.13"]),
  },
  {
    id: "nav-flight-conduct",
    unit: "n10",
    name: "The four updating steps",
    definition:
      "Plot the fix and measure track and distance. Measure the updated course and distance to the next turn point. Determine the actual in-flight winds. Apply them to the remaining legs and update ETA and EFR.",
    commonTraps: [
      "Off course, this course does not turn back to the original line — it computes a new course and heading direct to the turn point.",
    ],
    source: TG(C7, ["4.11", "4.16", "4.17"]),
  },
  {
    id: "nav-eta-update",
    unit: "n10",
    name: "Updating the ETA",
    definition:
      "New groundspeed and the distance still to run give a new ETE, which is added to the current time.",
    source: TG(C7, ["4.16"]),
  },
  {
    id: "nav-efr-update",
    unit: "n10",
    name: "Updating the fuel",
    definition:
      "Fuel on board now, less the burn for the time still to run at the predicted flow, gives the estimated fuel remaining at the next point.",
    relationships: ["Time off the plan costs fuel too — subtract what the detour burned before starting the new leg"],
    source: TG(C7, ["4.17"]),
  },
  {
    id: "nav-plan-is-an-estimate",
    unit: "n10",
    name: "The plan is only an estimate",
    definition:
      "Strapped in, everything on the log is the crew's best guess about what will happen. Aviation is dynamic, and the log exists to be rewritten in flight.",
    source: TG(C7, ["4.11"]),
  },
];
