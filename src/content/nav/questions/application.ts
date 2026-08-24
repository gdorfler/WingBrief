import type { Question, SourceReference } from "@/lib/types";
import { CONCEPTS } from "../concepts";

/**
 * Application-tier questions for concepts the bank could previously only
 * assess by recognition.
 *
 * Navigation is the strongest course in the app on application — 293 of its
 * 417 questions are worked numeric problems — which made the 29 concepts that
 * had escaped that treatment stand out all the more. They were the conceptual
 * ones: course versus track, variation, the altimeter errors, the jet log.
 * Precisely the vocabulary the calculation rests on, assessed only as
 * vocabulary.
 *
 * Where a concept carries a number, these questions make the student produce
 * it. Where it carries a distinction the exam is documented to swap — course
 * against track, radial against bearing — the question forces the
 * discrimination rather than accepting the definition back.
 */

function sourceOf(conceptId: string): SourceReference {
  const concept = CONCEPTS.find((c) => c.id === conceptId);
  if (!concept) throw new Error(`application.ts references unknown concept ${conceptId}`);
  return concept.source;
}

type AppliedSpec = Question extends infer T
  ? T extends Question
    ? Omit<T, "source" | "conceptIds">
    : never
  : never;

function applied(conceptId: string, q: AppliedSpec): Question {
  return { ...q, conceptIds: [conceptId], source: sourceOf(conceptId) } as Question;
}

export const APPLICATION_QUESTIONS: Question[] = [
  /* ================================================================ */
  /* N1 — DEAD RECKONING                                               */
  /* ================================================================ */

  applied("nav-types", {
    id: "nq-ap-001",
    type: "spotTheTrap",
    unit: "n1",
    prompt:
      '"Inertial navigation is a fourth type of air navigation, alongside dead reckoning, visual and electronic."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. There are three types: dead reckoning, visual and electronic. Inertial is a CATEGORY OF ELECTRONIC navigation — in effect a very fast DR computer. Autopilot is not a type of navigation at all.",
    knowCold: "Three types only. Inertial lives inside electronic.",
    difficulty: 3,
  }),

  applied("nav-visual", {
    id: "nq-ap-002",
    type: "mcq",
    unit: "n1",
    prompt:
      "A crew navigating visually without maintaining a DR plot is most likely to",
    options: [
      "drift steadily left of course",
      "misidentify ground references and become lost",
      "lose the ability to compute groundspeed only",
      "be unaffected, provided visibility is good",
    ],
    answer: 1,
    explanation:
      "Without a DR plot there is no expectation of what should be below, so a river or a road confirms nothing — it merely suggests. The guide is explicit: the aviator is likely to misidentify ground references and become lost. Visual navigation confirms a position you already predicted; it does not supply one.",
    knowCold: "No DR plot → references get misidentified. Visual confirms, it does not supply.",
    difficulty: 3,
  }),

  applied("nav-electronic", {
    id: "nq-ap-003",
    type: "spotTheTrap",
    unit: "n1",
    prompt:
      '"Because an INS is self-contained, it requires no input from the crew to begin navigating."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Self-contained means it needs no external signal in flight — but the crew must still input a STARTING POSITION, because the system works by accumulating movement from a known point. Get the initialisation wrong and every position after it is wrong by the same amount.",
    knowCold: "Self-contained still needs a starting position from the crew.",
    difficulty: 3,
  }),

  applied("nav-bdhi", {
    id: "nq-ap-004",
    type: "mcq",
    unit: "n1",
    prompt: "The aircrew's PRIMARY direction instrument is",
    options: [
      "the stand-by compass",
      "the compass card of the BDHI or EHSI",
      "the attitude indicator",
      "the TACAN radial readout",
    ],
    answer: 1,
    explanation:
      "The compass card — the BDHI or EHSI — is the primary direction instrument, driven in modern aircraft by a ring laser gyro INS needing no magnetic input. The stand-by compass is exactly that: a stand-by, and the distractor the exam reaches for.",
    knowCold: "Primary direction = compass card, not the stand-by compass.",
    difficulty: 3,
  }),

  applied("nav-tacan-station", {
    id: "nq-ap-005",
    type: "mcq",
    unit: "n1",
    prompt:
      "A TACAN gives 20 NM on the 090 radial from a station of known position. This is sufficient to determine",
    options: [
      "your position, 20 NM east of the station",
      "your position, 20 NM west of the station",
      "your heading but not your position",
      "nothing without a second station",
    ],
    answer: 0,
    explanation:
      "A known station position plus a radial plus DME fixes you completely — one station is enough. Radials are magnetic bearings measured FROM the station, so the 090 radial puts you east of it, at the DME distance.",
    whyWrong:
      "'20 NM west' inverts the radial into a bearing TO the station, which is the reciprocal error the plotting lesson warns about.",
    knowCold: "Station + radial + DME = a fix. The radial points FROM the station.",
    difficulty: 3,
  }),

  applied("nav-elapsed-time", {
    id: "nq-ap-006",
    type: "mcq",
    unit: "n1",
    prompt:
      "A flight departs at 0815 with an ETE of 2+30. Written correctly, the ETA is",
    options: ["10+45", "1045", "2+30", "0815+2"],
    answer: 1,
    explanation:
      "ETD and ETA are TIMES OF DAY and take the four-digit form; ETE is an ELAPSED time and takes the plus sign. 0815 plus two and a half hours is 1045 — a time of day, so no plus sign.",
    whyWrong:
      "'10+45' is the right arithmetic in the wrong notation, and the notation is what this question is checking.",
    knowCold: "Times of day: 1045. Elapsed times: 2+30.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N2 — THE EARTH ON PAPER                                           */
  /* ================================================================ */

  applied("nav-undevelopable", {
    id: "nq-ap-007",
    type: "mcq",
    unit: "n2",
    prompt:
      "Every chart of the earth distorts something. The reason is that a sphere",
    options: [
      "is too large to represent at a usable scale",
      "cannot be flattened without stretching or tearing",
      "rotates, so no projection can be fixed",
      "has an irregular surface",
    ],
    answer: 1,
    explanation:
      "A sphere is undevelopable: it cannot be flattened without stretching or tearing, so distortion is not a flaw in a given chart but a mathematical certainty for all of them. A projection transfers the graticule onto a cone or cylinder — a surface that CAN be flattened — and each choice decides what gets distorted.",
    knowCold: "Undevelopable: every chart distorts something. The projection picks what.",
    difficulty: 3,
  }),

  applied("nav-great-circle", {
    id: "nq-ap-008",
    type: "spotTheTrap",
    unit: "n2",
    prompt: '"Every meridian and every parallel is a great circle."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False, and only the second half is wrong. ALL meridians are great circles, because each meridian and its opposite form a plane through the earth's centre. Of the parallels, only the EQUATOR qualifies — every other parallel is a small circle.",
    knowCold: "All meridians are great circles. Only one parallel is: the equator.",
    difficulty: 3,
  }),

  applied("nav-small-circle", {
    id: "nq-ap-009",
    type: "mcq",
    unit: "n2",
    prompt: "The 40° North parallel is",
    options: [
      "a great circle, since it circles the earth",
      "a small circle, since its plane misses the earth's centre",
      "a great circle only in a Lambert projection",
      "neither, being a line of latitude rather than a circle",
    ],
    answer: 1,
    explanation:
      "A small circle is the intersection of the sphere with a plane that does NOT pass through the centre — which is true of every parallel except the equator. Circling the whole earth is not the test; passing through the centre is.",
    knowCold: "Plane misses the centre → small circle. Every parallel but the equator.",
    difficulty: 3,
  }),

  applied("nav-mercator", {
    id: "nq-ap-010",
    type: "mcq",
    unit: "n2",
    prompt: "The Mercator is used less often for air navigation because",
    options: [
      "it cannot show the poles at all",
      "its distance scale varies and great-circle routes plot as curves",
      "it distorts direction, so courses cannot be measured",
      "it is a conic projection unsuited to small areas",
    ],
    answer: 1,
    explanation:
      "The Mercator is a CYLINDRICAL projection whose distance scale varies with latitude, and on which the shortest route between two points plots as a curve rather than a straight line. Both properties make air navigation awkward — which is why the Lambert conformal is the chart actually used.",
    knowCold: "Mercator: cylindrical, variable scale, curved great circles.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N3 — DIRECTION                                                    */
  /* ================================================================ */

  applied("nav-direction", {
    id: "nq-ap-011",
    type: "spotTheTrap",
    unit: "n3",
    prompt: '"A course of due north is correctly written as 000°."',
    options: ["True", "False"],
    answer: 1,
    explanation:
      "False. Directions run from 001° to 360° in whole numbers — there is no 000. Due north is 360°. The reference is either true north or magnetic north, and which one must always be stated.",
    knowCold: "001 to 360. There is no 000.",
    difficulty: 2,
  }),

  applied("nav-course", {
    id: "nq-ap-012",
    type: "mcq",
    unit: "n3",
    prompt:
      "A crew draws a line from departure to destination and measures 095°. That 095° is the",
    options: ["heading", "course", "track", "variation"],
    answer: 1,
    explanation:
      "Course is the INTENDED flight path — the line you drew. The heading will differ from it to compensate for crosswind, and the track is what the aircraft actually achieves over the ground.",
    knowCold: "Course = what you meant. Drawn on the chart before you fly.",
    difficulty: 3,
  }),

  applied("nav-heading", {
    id: "nq-ap-013",
    type: "mcq",
    unit: "n3",
    prompt:
      "Course is 090° and there is a wind from the north. The aircraft flies heading 083°. The 7° difference exists to",
    options: [
      "correct for magnetic variation",
      "compensate for the crosswind so the track matches the course",
      "correct for compass deviation",
      "account for the difference between IAS and TAS",
    ],
    answer: 1,
    explanation:
      "Heading is where the NOSE points, and it differs from course specifically to compensate for crosswind. Crabbing 7° into a northerly wind is what makes the track over the ground come out on the intended 090°. Variation and deviation are separate corrections between reference systems.",
    knowCold: "Heading = where the nose points. It differs from course because of wind.",
    difficulty: 3,
  }),

  applied("nav-track", {
    id: "nq-ap-014",
    type: "mcq",
    unit: "n3",
    prompt:
      "After an hour, a fix shows the aircraft has actually moved along 097° rather than the intended 090°. The 097° is the",
    options: ["course", "heading", "track", "true bearing"],
    answer: 2,
    explanation:
      "Track is the ACHIEVED path over the ground, measured from departure to the current fix. Course was the 090° intention; track is the 097° reality. The exam swaps these two constantly, so tie each word to its tense: course is what you meant, track is what happened.",
    knowCold: "Course = intended · Heading = pointed · Track = achieved.",
    difficulty: 3,
  }),

  applied("nav-true-vs-magnetic-north", {
    id: "nq-ap-015",
    type: "mcq",
    unit: "n3",
    prompt: "Magnetic north differs from true north because magnetic north is",
    options: [
      "the top of the earth's axis of rotation",
      "where the earth's magnetic lines of force emanate from, currently near Hudson Bay",
      "a point that moves with the aircraft's position",
      "defined differently on each chart projection",
    ],
    answer: 1,
    explanation:
      "True north is the top of the earth — the axis of rotation. Magnetic north is where the magnetic lines of force emanate from, presently near Hudson Bay in Canada. The angle between them, seen from where you are, is variation, which is why it changes with position.",
    knowCold: "True north = the axis. Magnetic north = Hudson Bay, near enough.",
    difficulty: 3,
  }),

  applied("nav-variation", {
    id: "nq-ap-016",
    type: "mcq",
    unit: "n3",
    prompt:
      "True course is 100° and the chart shows 10° East variation. The magnetic course is",
    options: ["090°", "100°", "110°", "080°"],
    answer: 0,
    explanation:
      "East is least: easterly variation is SUBTRACTED from true to get magnetic, so 100 − 10 = 090°. The reverse conversion adds it back, and reversing the sign is the documented trap — check which direction you are converting before you touch the arithmetic.",
    whyWrong: "110° is the same sum with the sign reversed — the classic error.",
    knowCold: "True to magnetic: East is least, West is best.",
    difficulty: 3,
  }),

  applied("nav-isogonic", {
    id: "nq-ap-017",
    type: "mcq",
    unit: "n3",
    prompt:
      "A dashed blue line on a TPC is annotated 8°W. Points along it share equal",
    options: ["elevation", "variation", "deviation", "magnetic bearing to the nearest station"],
    answer: 1,
    explanation:
      "Isogonic lines connect points of equal VARIATION and appear on TPC and ONC charts as dashed blue lines with the value printed in degrees. Deviation is a compass error specific to one aircraft, not a property of a place, so it could never be charted.",
    knowCold: "Isogonic = equal variation. Dashed blue, value in degrees.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N4 — GLOBAL TIMEKEEPING                                           */
  /* ================================================================ */

  applied("nav-time-zones", {
    id: "nq-ap-018",
    type: "mcq",
    unit: "n4",
    prompt:
      "The earth turns 360° in 24 hours. Each time zone therefore spans",
    options: ["10° of longitude", "15° of longitude", "24° of longitude", "30° of longitude"],
    answer: 1,
    explanation:
      "360 ÷ 24 = 15° an hour, so each of the 24 zones is 15° of longitude wide and centred on a meridian that is a multiple of 15°. That said, you cannot reliably derive a zone description by dividing longitude by 15 — real boundaries follow political lines and daylight saving moves them.",
    knowCold: "15° of longitude per zone, per hour. Boundaries still follow politics.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N5 — CHART WORK                                                   */
  /* ================================================================ */

  applied("nav-north-south-scale", {
    id: "nq-ap-019",
    type: "mcq",
    unit: "n5",
    prompt:
      "A course line runs almost due north, so no meridian can be brought under the plotter grommet. The correct action is to",
    options: [
      "estimate the direction by eye and accept the error",
      "put a parallel under the grommet and read the inner scale",
      "rotate the chart 90° and use the outer scale",
      "measure from the nearest meridian and add 90°",
    ],
    answer: 1,
    explanation:
      "The innermost scale exists for exactly this case. Meridian under the grommet, read the OUTER scale; parallel under the grommet, read the INNER scale. The north–south scale is not a workaround — it is the designed answer to a near-north course.",
    knowCold: "Meridian → outer scale. Parallel → inner scale.",
    difficulty: 3,
  }),

  applied("nav-walking-dividers", {
    id: "nq-ap-020",
    type: "mcq",
    unit: "n5",
    prompt:
      "A leg is far too long to span with the dividers in one setting. The technique is to",
    options: [
      "use the distance scale printed on the plotter straightedge",
      "set the dividers to a fixed distance, step along the line counting multiples, then close on the remainder",
      "measure along the nearest parallel instead",
      "halve the leg and double the measured result",
    ],
    answer: 1,
    explanation:
      "Walking the dividers: set a convenient fixed span — 30 NM works well — step it along the line counting as you go, then close the dividers on whatever is left over. The plotter's straightedge distance scales are not accurate enough for this; distance is the dividers' job.",
    knowCold: "Walk the dividers in fixed steps, then close on the remainder.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N6 — THE CR-3                                                     */
  /* ================================================================ */

  applied("nav-cursor", {
    id: "nq-ap-021",
    type: "mcq",
    unit: "n6",
    prompt: "On the CR-3, the cursor's primary role is to",
    options: [
      "set the index for a time-speed-distance problem",
      "enter temperature for a true airspeed solution",
      "hold the wind vector during a preflight solution",
      "convert between nautical and statute miles",
    ],
    answer: 1,
    explanation:
      "The cursor is primarily how TEMPERATURE is entered for a true airspeed solution. Its secondary use is as an aid to interpolating any value between the printed marks — useful everywhere, but the temperature entry is what it is for.",
    knowCold: "Cursor = temperature in, for TAS. Interpolation second.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N7 — ALTITUDE AND AIRSPEED                                        */
  /* ================================================================ */

  applied("nav-altimeter-errors", {
    id: "nq-ap-022",
    type: "mcq",
    unit: "n7",
    prompt:
      "An aircraft flies from an area of high pressure into low pressure without updating the altimeter setting. The aircraft is",
    options: [
      "higher than indicated, with a safety margin in hand",
      "lower than indicated, and closer to the terrain",
      "exactly at the indicated altitude",
      "lower than indicated, but only above 10,000 ft",
    ],
    answer: 1,
    explanation:
      "High to low, look out below. With a stale setting the altimeter over-reads on entering lower pressure, so the aircraft is actually LOWER than the number in the window — the dangerous direction. Low to high gives plenty of sky, the harmless one. The scale is 0.10 inHg to 100 feet.",
    knowCold: "High to low → look out below. 0.10 inHg = 100 ft.",
    difficulty: 3,
  }),

  applied("nav-ias", {
    id: "nq-ap-023",
    type: "mcq",
    unit: "n7",
    prompt: "Indicated airspeed is",
    options: [
      "read directly off the cockpit indicator, uncorrected",
      "corrected for instrument and installation error",
      "corrected for density",
      "the speed over the ground",
    ],
    answer: 0,
    explanation:
      "IAS is the raw number on the dial, before any correction. Applying the airspeed calibration card for instrument and installation error gives CAS; correcting further for density gives TAS; correcting TAS for wind gives groundspeed. The ladder only works if the bottom rung is right.",
    knowCold: "IAS is what the dial says. Nothing has been corrected yet.",
    difficulty: 3,
  }),

  applied("nav-cas", {
    id: "nq-ap-024",
    type: "mcq",
    unit: "n7",
    prompt:
      "A true airspeed problem is to be worked and both IAS and CAS are available. The correct input is",
    options: [
      "IAS, since it is the raw measurement",
      "CAS, wherever it is available",
      "either — the difference is negligible",
      "the average of the two",
    ],
    answer: 1,
    explanation:
      "Use CAS in place of indicated wherever possible. CAS is IAS corrected for instrument and installation error using the cockpit calibration card, so it is the more accurate starting point — and every later step inherits whatever error you begin with.",
    knowCold: "Use CAS if you have it. It is IAS with the instrument error taken out.",
    difficulty: 3,
  }),

  applied("nav-groundspeed", {
    id: "nq-ap-025",
    type: "mcq",
    unit: "n7",
    prompt:
      "True airspeed is 240 kt and the wind gives a 30 kt headwind component. Groundspeed is",
    options: ["270 kt", "240 kt", "210 kt", "180 kt"],
    answer: 2,
    explanation:
      "Groundspeed is TAS corrected for the head or tail component: 240 − 30 = 210 kt. A headwind subtracts, a tailwind adds. Note it is the COMPONENT along the course that counts, not the raw wind speed.",
    knowCold: "GS = TAS ± head/tail component. Headwind subtracts.",
    difficulty: 3,
  }),

  applied("nav-shock-wave", {
    id: "nq-ap-026",
    type: "mcq",
    unit: "n7",
    prompt:
      "As an aircraft approaches the local speed of sound, pressure waves ahead of it",
    options: [
      "travel further ahead, warning the air of its arrival",
      "pile up into a shock wave",
      "slow down relative to the air mass",
      "are unaffected until the aircraft is supersonic",
    ],
    answer: 1,
    explanation:
      "Pressure waves travel at the speed of sound. As the aircraft's own velocity closes on that figure, the waves can no longer outrun it and pile up into a shock wave — which is why comparing the two velocities directly is what Mach number is for.",
    knowCold: "Aircraft speed catches the pressure waves → they pile into a shock wave.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N8 — PREFLIGHT WINDS                                              */
  /* ================================================================ */

  applied("nav-balloon", {
    id: "nq-ap-027",
    type: "mcq",
    unit: "n8",
    prompt:
      "Using the balloon model, a wind blowing directly along the course line is handled by",
    options: [
      "vector addition on the wind side of the CR-3",
      "simple addition or subtraction of the wind speed",
      "ignoring it, since it does not change the heading",
      "converting it to a crosswind component first",
    ],
    answer: 1,
    explanation:
      "Inside the air mass the aircraft goes where it points at its own speed; over the ground it also goes wherever the balloon goes. When the balloon moves parallel to the course, the two simply add or subtract. Only when the air mass moves at an ANGLE to the course does the problem become vector addition.",
    knowCold: "Air mass parallel to course → simple addition. At an angle → vectors.",
    difficulty: 3,
  }),

  /* ================================================================ */
  /* N10 — FLIGHT PLANNING                                             */
  /* ================================================================ */

  applied("nav-jet-log", {
    id: "nq-ap-028",
    type: "mcq",
    unit: "n10",
    prompt: "The PRIMARY purpose of the jet log is",
    options: [
      "navigation data",
      "fuel management",
      "recording en route communications",
      "timing each leg",
    ],
    answer: 1,
    explanation:
      "Fuel management. The jet log is a five-by-seven knee board card that also carries en route communications, navigation and navaid identification — but asked for the PRIMARY purpose, all of those are the secondary ones.",
    knowCold: "Jet log's primary purpose: fuel management.",
    difficulty: 3,
  }),

  applied("nav-plan-is-an-estimate", {
    id: "nq-ap-029",
    type: "mcq",
    unit: "n10",
    prompt:
      "Airborne, the crew finds the actual winds differ substantially from the forecast. The correct understanding of the jet log is that it",
    options: [
      "has been invalidated and should be set aside",
      "is a best estimate, written to be revised in flight",
      "must be flown as planned and reconciled after landing",
      "only requires revision if fuel becomes critical",
    ],
    answer: 1,
    explanation:
      "Strapped in, everything on the log is the crew's best guess about what will happen. Aviation is dynamic and the log exists to be rewritten — updating it in flight is using it correctly, not admitting the plan failed.",
    knowCold: "The log is an estimate. Rewriting it in flight is the job.",
    difficulty: 3,
  }),
];
