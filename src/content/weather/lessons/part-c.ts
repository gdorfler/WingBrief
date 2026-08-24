import type { Lesson, SourceReference } from "@/lib/types";

const TG = (chapter: string): SourceReference => ({
  document: "Weather Trainee Guide",
  chapter,
});

/**
 * Lessons for the trainee guide material the condensed notes never covered.
 *
 * Three topics were substantial enough to need lessons of their own rather
 * than screens bolted onto existing ones: what happens ahead of and behind a
 * front, mountain wave turbulence, and volcanic ash.
 */
export const LESSONS_C: Lesson[] = [
  {
    id: "wl14b-squall-lines-and-dry-fronts",
    unit: "w6",
    index: 15,
    title: "Squall Lines and Dry Fronts",
    subtitle: "The violent one out front, and the one with no weather at all",
    estimatedMinutes: 6,
    mapIcon: "wx-squall",
    enablingObjectives: [],
    conceptIds: ["wx-squall-line", "wx-inactive-front", "wx-frontal-weather-factors"],
    masteryThreshold: 0.8,
    screens: [
      {
        kind: "hook",
        headline: "The worst weather at a cold front is often not at the front",
        line: "It is 50 to 300 miles out in front of it. And some fronts produce no weather whatsoever.",
      },
      {
        kind: "rule",
        headline: "Squall line",
        rule:
          "A squall line is a line of violent thunderstorms, shown on surface charts by a dashed, double-dotted red line. They develop 50 to 300 miles ahead of a cold front and roughly parallel to it, when cold air downdrafts running ahead of the front lift additional warm, unstable air.",
        appliesWhen: [
          "Ahead of a cold front — or from convergence, nowhere near a front at all",
          "Most intense late afternoon and early evening, just after maximum daytime heating",
        ],
        watchFor:
          "It is often impossible to fly through a squall line EVEN WITH RADAR, because the storms sit extremely close together. Like a cold front, it carries a 90° wind shift from SW to NW.",
        authority: "Trainee guide",
      },
      {
        kind: "chain",
        headline: "How one forms",
        nodes: [
          { label: "Cold air downdrafts run out ahead of the cold front", trend: "none" },
          { label: "They lift additional warm, unstable air", trend: "up" },
          { label: "That air develops its own updrafts and downdrafts", trend: "up" },
          { label: "The thunderstorm cycle starts, 50–300 miles out front", trend: "up", emphasis: true },
        ],
      },
      {
        kind: "compare",
        headline: "And the opposite case",
        line: "An inactive front is a boundary with nothing happening at it.",
        columns: ["Squall line", "Inactive (dry) front"],
        rows: [
          { label: "Cloud", a: "Violent thunderstorms", b: "None" },
          { label: "Precipitation", a: "Heavy", b: "None" },
          { label: "Why", a: "Warm unstable air, lifted hard", b: "The warm air mass is too dry for cloud to form" },
          { label: "What you get", a: "Everything at once", b: "A wind shift, and a temperature and pressure change" },
        ],
      },
      {
        kind: "chain",
        headline: "What decides which one you get",
        nodes: [
          { label: "Moisture available, shown by the dew point", trend: "up", emphasis: true },
          { label: "Stability of the lifted air", trend: "none" },
          { label: "Slope of the front", trend: "none" },
          { label: "Speed of frontal movement", trend: "none" },
          { label: "Contrast in temperature and moisture between the masses", trend: "none" },
        ],
        footnote:
          "Moisture is the gate. Often there is no significant weather at a front simply because it is not there, despite every other factor being present.",
      },
      {
        kind: "anchor",
        headline: "Know Cold",
        statements: [
          "Squall line: 50–300 miles AHEAD of the cold front, parallel to it",
          "Dashed double-dotted red line · 90° wind shift SW to NW",
          "Inactive front: no cloud, no precipitation — wind, temperature, pressure only",
          "Five factors: moisture, stability, slope, speed, contrast",
        ],
      },
      { kind: "question", questionId: "wq-wg-018" },
      { kind: "question", questionId: "wq-wg-020" },
      { kind: "question", questionId: "wq-wg-021" },
      { kind: "question", questionId: "wq-wg-015" },
      { kind: "question", questionId: "wq-wg-016" },
    ],
    questionIds: [
      "wq-wg-015", "wq-wg-016", "wq-wg-017", "wq-wg-018", "wq-wg-019",
      "wq-wg-020", "wq-wg-021", "wq-wg-022",
    ],
    memorize: [
      "Squall line: 50–300 miles ahead, and radar will not get you through",
      "Moisture is the gate on all frontal weather",
    ],
    sourceReferences: [TG("Frontal Mechanics")],
    explainerIds: ["wx-x-squall-line"],
  },
  {
    id: "wl16b-mountain-waves",
    unit: "w7",
    index: 19,
    title: "Mountain Waves",
    subtitle: "Standing waves, and the clouds that mark them",
    estimatedMinutes: 7,
    mapIcon: "wx-wave",
    enablingObjectives: [],
    conceptIds: ["wx-mountain-wave", "wx-wave-clouds", "wx-wave-technique", "wx-clear-air-turbulence"],
    masteryThreshold: 0.85,
    screens: [
      {
        kind: "hook",
        headline: "A wave that stands still while the air pours through it",
        line: "Strong wind across a ridge sets up a standing wave that can reach the lower stratosphere and run 300 miles downwind.",
      },
      {
        kind: "model",
        headline: "How the wave forms",
        diagram: { id: "wx-mountain-wave", props: { wind: 60, clouds: true } },
        bullets: [
          "Strong winds approximately PERPENDICULAR to the range",
          "Stable air, so the disturbance oscillates rather than mixing out",
          "Updrafts and downdrafts reaching 2 to 20 times the height of the peaks",
          "Waves on the LEE side, extending 300 miles or more downwind",
        ],
      },
      {
        kind: "model",
        headline: "Three clouds, three heights",
        diagram: { id: "wx-mountain-wave", props: { wind: 60, clouds: true, highlight: "clouds" } },
        bullets: [
          "LENTICULAR: usually above 20,000 ft, smooth unless the flow there is turbulent",
          "ROTOR: lower, at about the height of the mountain ridge",
          "CAP: obscuring both sides of the peak",
          "All three are STATIONARY, even though the wind flows through them",
        ],
      },
      {
        kind: "rule",
        headline: "When it turns extreme",
        rule:
          "Extreme turbulence is usually found at low levels on the leeward side, in or near the rotor and cap clouds, when the winds are 50 knots or greater at the mountaintop. With those winds, severe turbulence can exist from the surface to the tropopause and 150 miles downwind, and moderate turbulence as far as 300 miles downwind.",
        appliesWhen: ["Winds 50 kt or greater at peak level"],
        watchFor:
          "Wave action can occur when the air is too dry to form any cloud at all — clear air turbulence, with no visual warning.",
      },
      {
        kind: "chain",
        headline: "The six techniques",
        nodes: [
          { label: "Fly around the wave area if you can", trend: "none" },
          { label: "If not, fly 50% higher than the highest range on route", trend: "up" },
          { label: "Avoid the rotor, lenticular and cap clouds", trend: "none" },
          { label: "Approach the range at 45°, so you can turn away", trend: "none" },
          { label: "Avoid the leeward side", trend: "none" },
          { label: "Distrust the altimeter — it can over-read by 2,500 ft", trend: "down", emphasis: true },
        ],
        footnote: "And penetrate turbulent areas at the airspeed recommended for the aircraft.",
      },
      {
        kind: "manipulate",
        headline: "Wind the flow up over the ridge",
        widget: "MountainWaveSlider",
        line: "Below about 25 knots there is little wave. Increase it and watch the disturbance climb.",
      },
      {
        kind: "anchor",
        headline: "Know Cold",
        statements: [
          "Strong wind PERPENDICULAR to the ridge, in stable air",
          "50 kt at the peak → severe turbulence to the tropopause, 150 miles downwind",
          "Lenticular above 20,000 · rotor at ridge height · cap on the peak",
          "50% above the highest terrain · 45° approach · altimeter over-reads 2,500 ft",
        ],
      },
      { kind: "question", questionId: "wq-wg-024" },
      { kind: "question", questionId: "wq-wg-025" },
      { kind: "question", questionId: "wq-wg-026" },
      { kind: "question", questionId: "wq-wg-028" },
      { kind: "question", questionId: "wq-wg-030" },
    ],
    questionIds: [
      "wq-wg-023", "wq-wg-024", "wq-wg-025", "wq-wg-026", "wq-wg-027",
      "wq-wg-028", "wq-wg-029", "wq-wg-030",
    ],
    memorize: [
      "50 kt at the peak is the threshold",
      "Lenticular, rotor, cap — all stationary",
      "50% above the terrain, 45° to the ridge",
    ],
    sourceReferences: [TG("Turbulence")],
    explainerIds: ["wx-x-mountain-wave"],
    labIds: ["wxlab-wave"],
  },
  {
    id: "wl23b-volcanic-ash",
    unit: "w9",
    index: 26,
    title: "Volcanic Ash",
    subtitle: "The hazard radar cannot see",
    estimatedMinutes: 5,
    mapIcon: "wx-ash",
    enablingObjectives: [],
    conceptIds: ["wx-ash-clouds", "wx-ash-avoidance"],
    masteryThreshold: 0.85,
    screens: [
      {
        kind: "hook",
        headline: "The only hazard in this course where over and under are both wrong",
        line: "An ash cloud is hundreds of miles long and thousands of feet thick, and your radar will not show it to you.",
      },
      {
        kind: "compare",
        headline: "How you find out you are in it",
        line: "Radar detection is unlikely because the particles are too small, so the first indications are visual.",
        columns: ["Indication", "What it is"],
        rows: [
          { label: "Torching", a: "Flames from the engine tailpipe", b: "" },
          { label: "St. Elmo's fire", a: "A glowing electrical discharge effect", b: "" },
          { label: "Engine inlets", a: "A bright glow inside them", b: "" },
        ],
      },
      {
        kind: "chain",
        headline: "What it does",
        nodes: [
          { label: "Multiple engine malfunctions", trend: "down" },
          { label: "Flameout — ALL engines on a multi-engine aircraft", trend: "down", emphasis: true },
          { label: "Pitted windscreens, affecting cockpit visibility", trend: "down" },
          { label: "Sandblasting of external surfaces", trend: "down" },
        ],
      },
      {
        kind: "rule",
        headline: "Getting out",
        rule:
          "Avoid flying in areas of known volcanic activity. If you encounter an ash cloud, do not proceed and do not try to fly over or under it. Make a 180° turn to escape, then notify the nearest ATC and transmit a PIREP.",
        appliesWhen: ["Any encounter with volcanic ash"],
        watchFor:
          "Over and under are the second and third options for a thunderstorm. For an ash cloud they are not options at all — it is far too large for either.",
      },
      {
        kind: "anchor",
        headline: "Know Cold",
        statements: [
          "Radar detection is unlikely — the particles are too small",
          "Torching, St. Elmo's fire, bright glow in the inlets",
          "ALL engines affected on a multi-engine aircraft",
          "180° turn out. Never over, never under. Then ATC and a PIREP.",
        ],
      },
      { kind: "question", questionId: "wq-wg-041" },
      { kind: "question", questionId: "wq-wg-042" },
      { kind: "question", questionId: "wq-wg-043" },
      { kind: "question", questionId: "wq-wg-044" },
    ],
    questionIds: ["wq-wg-041", "wq-wg-042", "wq-wg-043", "wq-wg-044"],
    memorize: ["Radar cannot see it. Turn 180° out."],
    sourceReferences: [TG("Atmospheric Hazards")],
    explainerIds: ["wx-x-ash"],
  },
];
