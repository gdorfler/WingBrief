/**
 * Domain model for the WingBrief learning engine.
 *
 * Curriculum DATA (src/content) is kept strictly separate from UI code, so one
 * engine hosts every NIFE course. Aerodynamics and Engines are two courses on
 * the same platform, the way two languages sit inside one language app;
 * Weather, Navigation and Flight Rules can join without the mastery, review or
 * exam logic changing at all.
 */

/* ------------------------------------------------------------------ */
/* Source traceability                                                 */
/* ------------------------------------------------------------------ */

export type SourceDocument =
  | "Aerodynamics Trainee Guide"
  | "Principles of Gas Turbine/Reciprocating Operation"
  | "Gas Turbine/Reciprocating Engines"
  | "Compressor Stalls"
  | "Gas Turbine/Reciprocating Engine Types"
  | "Hydraulic Systems"
  | "Electrical Systems"
  | "Fuel Systems"
  | "Lubricants and Lubrication Systems"
  | "Accessory, Starter and Ignition Systems"
  | "Engines Condensed Notes"
  | "Flight Rules and Regulations Trainee Guide"
  | "FR&R Condensed Notes"
  | "Weather Trainee Guide"
  | "Weather Condensed Notes"
  | "Weather Dump Sheet"
  | "Navigation Trainee Guide"
  | "Navigation Final Examination"
  | "Basic Theory and Lift Production"
  | "Drag and Stalls"
  | "Performance Characteristics"
  | "Maneuvering and Hazards"
  | "Aerodynamics Condensed Notes"
  | "Official Practice Test";

export interface SourceReference {
  document: SourceDocument;
  /** Information-sheet / chapter name, e.g. "Lift Production and Drag". */
  chapter?: string;
  /** Enabling Objective ids this content satisfies, e.g. ["2.84", "2.85"]. */
  eo?: string[];
}

/* ------------------------------------------------------------------ */
/* Curriculum structure                                                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Courses                                                             */
/* ------------------------------------------------------------------ */

/** One course on the WingBrief platform. Adding a course adds an id here. */
export type CourseId = "aero" | "engines" | "frr" | "weather" | "nav";

export interface CourseMeta {
  id: CourseId;
  /** Short name used in the switcher and headers, e.g. "Aerodynamics". */
  name: string;
  /** One line describing what the course covers. */
  tagline: string;
  /** Which NIFE lecture series this course is built from. */
  sourceLabel: string;
  /** Registry key for the course mark, resolved by <CourseIcon>. */
  icon: string;
  /**
   * Value written to data-course on the document root. The stylesheet keys the
   * whole accent palette off it, so one attribute re-themes the app.
   */
  theme: CourseId;
  /** Accent used where a raw colour is unavoidable (SVG fills, gradients). */
  accent: string;
  accentSoft: string;
  /**
   * What this course calls its interactive section. Aerodynamics and Engines
   * simulate a physical relationship ("Sim Lab"); Flight Rules resolves a
   * situation ("Scenario Lab").
   */
  labLabel: string;
  /** Heading and blurb for that section's index page. */
  labIntro: { title: string; blurb: string };
  /**
   * Which home screen and course map this course uses.
   *
   * "standard" is the readiness dashboard and flight-path map every course
   * shipped with. "desk" is the problem-solving variant Navigation needs: the
   * headline numbers are accuracy and solve time rather than concepts seen,
   * and the map is a route plotted across a chart rather than a path of nodes.
   */
  layout?: "standard" | "desk";
  /** Exam conditions, where the source publishes them. */
  examPolicy?: ExamPolicy;
}

/**
 * What the real examination allows. Only filled in where a source states it —
 * inventing a restriction would be as wrong as inventing a tolerance.
 */
export interface ExamPolicy {
  questionCount: number;
  minutes: number;
  /** Passing score as a percentage. */
  passPct: number;
  allowedTools: NavToolId[];
  referencesAllowed: boolean;
  hintsAllowed: boolean;
  /** Where these conditions come from, shown to the student before they start. */
  note: string;
}

/**
 * Everything one course teaches. The engine only ever sees this shape, which
 * is what keeps courses from knowing about each other.
 */
export interface CourseContent {
  units: Unit[];
  concepts: Concept[];
  lessons: Lesson[];
  questions: Question[];
  explainers: Explainer[];
  labs: Lab[];
  knowCold: KnowColdCard[];
  /**
   * The three structures below exist for problem-solving courses and are
   * absent from the four knowledge courses, which is why they are optional.
   *
   * A concept is something you know. A skill is something you can do, at a
   * stated speed, to a stated tolerance — and Navigation is graded on the
   * second kind. Drills are the reps; missions are the integration.
   */
  skills?: Skill[];
  drills?: Drill[];
  missions?: Mission[];
}

/**
 * Unit ids are namespaced per course ("u1" for Aero, "e1" for Engines) so a
 * single global lookup can never collide across courses.
 */
export type UnitId = string;

export interface Unit {
  id: UnitId;
  index: number;
  title: string;
  subtitle: string;
  /** One-line statement of what this unit buys the student. */
  promise: string;
  accent: "brand" | "go" | "caution" | "violet" | "navy" | "nogo";
}

export type ConceptId = string;

export interface Concept {
  id: ConceptId;
  unit: UnitId;
  name: string;
  /** Exam-grade definition. Kept to one or two sentences. */
  definition: string;
  /** Directional relationships, one per line: "AOA ↑ → CL ↑ (to CLmax)". */
  relationships?: string[];
  /** KaTeX source, no delimiters. */
  formula?: string;
  /** Wording traps the NIFE exam is known to exploit. */
  commonTraps?: string[];
  source: SourceReference;
}

/* ------------------------------------------------------------------ */
/* Lesson screens                                                      */
/* ------------------------------------------------------------------ */

/** Every visual is a registered diagram id rendered by DiagramHost. */
export type DiagramId = string;

export interface DiagramSpec {
  id: DiagramId;
  /** Static props forwarded to the diagram component. */
  props?: Record<string, unknown>;
  caption?: string;
}

export interface ChainNode {
  label: string;
  /** Rendered as a coloured trend pill. */
  trend?: "up" | "down" | "same" | "none";
  emphasis?: boolean;
}

export type LessonScreen =
  /** Why this matters — one sentence, then straight into the visual. */
  | { kind: "hook"; headline: string; line: string; diagram?: DiagramSpec }
  /** Diagram or animation carrying the model. */
  | {
      kind: "model";
      headline: string;
      line?: string;
      diagram: DiagramSpec;
      bullets?: string[];
    }
  /** Slider / toggle / lab embed — the student changes something. */
  | {
      kind: "manipulate";
      headline: string;
      line?: string;
      widget: string;
      props?: Record<string, unknown>;
    }
  /** The signature cause→effect chain. */
  | {
      kind: "chain";
      headline: string;
      line?: string;
      nodes: ChainNode[];
      footnote?: string;
    }
  /** Very short "Know Cold" statement. */
  | {
      kind: "anchor";
      headline: string;
      statements: string[];
      formula?: string;
      mnemonic?: string;
    }
  /** Side-by-side comparison table. */
  | {
      kind: "compare";
      headline: string;
      line?: string;
      columns: [string, string];
      rows: { label: string; a: string; b: string }[];
    }
  /**
   * The signature Flight Rules screen. A regulation is not much use as a
   * sentence: what a student needs is the rule, the conditions that switch it
   * on, and the exception that catches people out. Splitting those three apart
   * on the page is what turns a paragraph of regulation into something
   * recallable under exam pressure.
   */
  | {
      kind: "rule";
      headline: string;
      /** The regulation itself, stated as tightly as the source allows. */
      rule: string;
      /** The conditions under which it bites. */
      appliesWhen: string[];
      /** The exception, or the wording the exam exploits. */
      watchFor?: string;
      /** Which publication this comes from, e.g. "CNAF M-3710.7". */
      authority?: string;
    }
  /**
   * The signature Navigation screen. A method is not a fact, and writing one
   * as a paragraph loses the thing that makes it usable: what you are handed,
   * what you have to produce, and the order of operations in between. The
   * estimate line comes first on the card because it comes first in the
   * procedure — the guide puts "ESTIMATE!" above step 1 of every wind
   * solution it prints.
   */
  | {
      kind: "method";
      headline: string;
      /** What the problem gives you. */
      given: string[];
      /** What you have to produce. */
      find: string[];
      /** The order of operations. */
      steps: string[];
      /** The estimate that precedes the tool. */
      estimateFirst?: string;
      /** The error this method invites. */
      watchFor?: string;
      tolerance?: string;
    }
  /** A worked example, replayed one operation at a time. */
  | { kind: "worked"; headline: string; line?: string; problemId: string }
  /** A live navigation instrument, embedded in the lesson. */
  | {
      kind: "tool";
      headline: string;
      line?: string;
      tool: NavToolId;
      props?: Record<string, unknown>;
    }
  /** Retrieval — pulls a question from the lesson's question pool. */
  | { kind: "question"; questionId: string };

/* ------------------------------------------------------------------ */
/* Questions                                                           */
/* ------------------------------------------------------------------ */

export type QuestionType =
  | "mcq"
  | "tapDiagram"
  | "dragLabel"
  | "connectChain"
  | "curveShift"
  | "sliderPredict"
  | "beforeAfter"
  | "spotTheTrap"
  | "graphRead"
  | "numeric";

export type Difficulty = 1 | 2 | 3;

/**
 * What a correct answer proves. Derived from the question shape by
 * `evidenceFor` in src/lib/evidence.ts; see that file for the reasoning.
 *
 * "recall" is retrieval of a stored fact. "apply" is doing something with it.
 * Full mastery of a concept requires at least one of the second kind, which is
 * what stops six recognition questions from reading as understanding.
 */
export type EvidenceKind = "recall" | "apply";

interface QuestionBase {
  id: string;
  type: QuestionType;
  conceptIds: ConceptId[];
  unit: UnitId;
  prompt: string;
  /** 1–2 sentences on why the key is right. */
  explanation: string;
  /** Only when a distractor is genuinely instructive. */
  whyWrong?: string;
  /** One line the student should be able to recite. */
  knowCold?: string;
  difficulty: Difficulty;
  source: SourceReference;
  tags?: string[];
  /** True when modelled directly on an official review/practice question. */
  officialStyle?: boolean;
  /** Skills exercised, for courses that track them. */
  skillIds?: string[];
  /**
   * Forces the evidence tier when the derivation would be wrong for this one
   * question — a difficulty-2 item that genuinely requires applying a
   * relationship, or a difficulty-3 item that is really just a hard fact.
   */
  evidenceOverride?: EvidenceKind;
}

/* ------------------------------------------------------------------ */
/* Numeric answers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Units a navigation answer can carry.
 *
 * The unit is part of the answer, not decoration. 250 knots and 250 nautical
 * miles are different answers to different questions, and a grader that
 * accepts one for the other is teaching the student that units do not matter.
 */
export type NavUnit =
  | "deg"
  | "kt"
  | "nm"
  | "lb"
  | "gal"
  | "pph"
  | "ft"
  | "inHg"
  | "mach"
  | "minutes"
  | "elapsed"
  | "clock"
  | "latMinutes"
  | "lonMinutes"
  | "latDegrees"
  | "lonDegrees";

/**
 * Tolerance kinds, mirroring Appendix A of the trainee guide. The string
 * values are the keys of TOLERANCES in src/lib/nav/math.ts; keeping the type
 * here rather than importing it stops the domain model depending on one
 * course's maths.
 */
export type NavToleranceKind =
  | "logScale"
  | "trueAirspeed"
  | "mach"
  | "direction"
  | "distance"
  | "latLong"
  | "windComponent"
  | "windComponentStrong"
  | "inflightWindDirection"
  | "inflightWindDirectionStrong"
  | "pointToPointCourse"
  | "pointToPointDistance"
  | "exact";

export interface NumericField {
  key: string;
  label: string;
  unit: NavUnit;
  /**
   * The answer of record, in the unit's canonical measure: seconds for
   * "elapsed", minutes past midnight for "clock", minutes for the coordinate
   * units, and the obvious thing everywhere else.
   */
  answer: number;
  tolerance: NavToleranceKind;
  /** Directions compare with a wrap, so 359 and 001 are two degrees apart. */
  wraps?: boolean;
  /**
   * A left/right or head/tail qualifier the student must also get right. A
   * crosswind of 35 knots is only half an answer if you cannot say which side
   * it is on.
   */
  qualifier?: { options: [string, string]; answer: string; label: string };
  /** Shown when the student asks for a nudge, where hints are permitted. */
  hint?: string;
}

/**
 * The scaffolding ladder. The same skill appears at several rungs: watch it
 * done, do it with the next operation named, do it when asked what comes
 * next, do it alone, then do it alone against a clock.
 */
export type GuidanceLevel = "watch" | "guided" | "prompted" | "independent" | "timed";

/** One move in a worked solution, replayed a step at a time. */
export interface WorkedStep {
  /** What you do. */
  action: string;
  /** Why, or what goes wrong here. */
  detail?: string;
  /** The value this step produces. */
  result?: string;
  /** Which tool the step happens on, so the replay can open it. */
  tool?: NavToolId;
}

export interface NumericQuestion extends QuestionBase {
  type: "numeric";
  /** The data the problem hands you. */
  given: { label: string; value: string }[];
  fields: NumericField[];
  /**
   * Estimate first. The guide says it in almost every procedure — before the
   * wheel, before the plotter, before interpreting anything — because a
   * decimal place or a reciprocal is invisible in the answer and obvious in
   * the estimate.
   */
  estimate?: { prompt: string; options: string[]; answer: number; why: string };
  allowedTools?: NavToolId[];
  worked: WorkedStep[];
  guidance?: GuidanceLevel;
  diagram?: DiagramSpec;
}

export interface McqQuestion extends QuestionBase {
  type: "mcq" | "spotTheTrap";
  options: string[];
  /** Index into `options`. */
  answer: number;
  diagram?: DiagramSpec;
}

export interface TapDiagramQuestion extends QuestionBase {
  type: "tapDiagram";
  diagram: DiagramSpec;
  /** Hit targets in the diagram's own viewBox coordinates. */
  targets: { id: string; label: string; x: number; y: number; r: number }[];
  /** Which target id is correct. */
  answer: string;
}

export interface DragLabelQuestion extends QuestionBase {
  type: "dragLabel";
  diagram: DiagramSpec;
  labels: string[];
  /**
   * Drop zones in the diagram's viewBox coordinates. `x`/`y` position the drop
   * pill itself, which needs clear space; `tx`/`ty` optionally anchor it to the
   * exact feature being labelled, drawn as a leader line so a pill sitting in
   * open space still points unambiguously at one part of the diagram.
   */
  slots: { id: string; label: string; x: number; y: number; tx?: number; ty?: number }[];
  /** slot id -> correct label. */
  answer: Record<string, string>;
}

export interface ConnectChainQuestion extends QuestionBase {
  type: "connectChain";
  /** Fixed first link, shown to anchor the chain. */
  trigger: string;
  /** Correct order. The UI shuffles deterministically per attempt. */
  steps: string[];
}

export type ShiftDirection =
  | "left"
  | "right"
  | "up"
  | "down"
  | "upRight"
  | "upLeft"
  | "downRight"
  | "downLeft"
  | "none";

export interface CurveShiftQuestion extends QuestionBase {
  type: "curveShift";
  diagram: DiagramSpec;
  /** The change being applied, e.g. "Weight increases". */
  change: string;
  /** Which curve moves, e.g. "Thrust required". */
  curveLabel: string;
  options: ShiftDirection[];
  answer: ShiftDirection;
  /** Prop patch applied to the diagram to animate the true answer. */
  afterProps: Record<string, unknown>;
}

export interface SliderPredictQuestion extends QuestionBase {
  type: "sliderPredict";
  widget: string;
  props?: Record<string, unknown>;
  options: string[];
  answer: number;
}

export interface BeforeAfterQuestion extends QuestionBase {
  type: "beforeAfter";
  diagram: DiagramSpec;
  states: [string, string];
  beforeProps: Record<string, unknown>;
  afterProps: Record<string, unknown>;
  /** Each row is its own mini-question: what happens to this quantity? */
  rows: { label: string; options: string[]; answer: number }[];
}

export interface GraphReadQuestion extends QuestionBase {
  type: "graphRead";
  diagram: DiagramSpec;
  targets: { id: string; label: string; x: number; y: number; r: number }[];
  answer: string;
}

export type Question =
  | McqQuestion
  | TapDiagramQuestion
  | DragLabelQuestion
  | ConnectChainQuestion
  | CurveShiftQuestion
  | SliderPredictQuestion
  | BeforeAfterQuestion
  | GraphReadQuestion
  | NumericQuestion;

/* ------------------------------------------------------------------ */
/* Lessons, explainers, labs                                           */
/* ------------------------------------------------------------------ */

export interface Lesson {
  id: string;
  unit: UnitId;
  index: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  enablingObjectives: string[];
  conceptIds: ConceptId[];
  /** Small icon key drawn on the flight-path map node. */
  mapIcon: string;
  screens: LessonScreen[];
  /** Question ids used by the lesson's retrieval screens and end quiz. */
  questionIds: string[];
  memorize: string[];
  sourceReferences: SourceReference[];
  /** Fraction of questions correct needed to count as a mastered pass. */
  masteryThreshold: number;
  /** Related visual explainers. */
  explainerIds?: string[];
  /** Related sim labs. */
  labIds?: string[];
}

export interface ExplainerFrame {
  /** Caption shown under the animation — max ~14 words. */
  caption: string;
  /** Milliseconds this frame holds when auto-playing. */
  hold: number;
  /** Diagram prop patch for this frame. */
  props?: Record<string, unknown>;
}

export interface Explainer {
  id: string;
  title: string;
  /** One line: what you will understand after 90 seconds. */
  promise: string;
  unit: UnitId;
  conceptIds: ConceptId[];
  lessonId: string;
  diagram: DiagramSpec;
  frames: ExplainerFrame[];
  knowCold: string;
  source: SourceReference;
}

export interface Lab {
  id: string;
  title: string;
  subtitle: string;
  /** Which relationship this lab exists to make undeniable. */
  teaches: string;
  unit: UnitId;
  conceptIds: ConceptId[];
  component: string;
  chain?: string[];
}

/* ------------------------------------------------------------------ */
/* Skills — the doing half of a problem-solving course                 */
/* ------------------------------------------------------------------ */

/**
 * One operation the student must be able to perform.
 *
 * Concepts and skills are tracked separately on purpose. Knowing that
 * groundspeed is true airspeed corrected for wind is a concept; producing the
 * right groundspeed on a CR-3 inside ±1% is a skill, and a student can have
 * the first without the second. Navigation is examined on the second.
 */
export interface Skill {
  id: string;
  name: string;
  /** The operation as a verb phrase: "Pull coordinates off a chart". */
  operation: string;
  unit: UnitId;
  /** Which tool the operation is performed on, when it needs one. */
  tool?: NavToolId;
  /** The tolerance the course holds this skill to, in words. */
  tolerance?: string;
  source: SourceReference;
}

/* ------------------------------------------------------------------ */
/* Navigation tools                                                    */
/* ------------------------------------------------------------------ */

/** The instruments on the desk. Job Sheet 6-7-4 lists the physical set. */
export type NavToolId =
  | "cr3calc"
  | "cr3wind"
  | "chart"
  | "jetlog"
  | "scratch"
  | "timezone"
  | "reference";

/* ------------------------------------------------------------------ */
/* Drills and missions                                                 */
/* ------------------------------------------------------------------ */

/**
 * A drill is ten reps of one operation, not another lesson. It exists so a
 * skill can be made fast and automatic, which is the difference between
 * having seen a method and being able to use it under time pressure.
 */
export interface Drill {
  id: string;
  title: string;
  /** The single operation being repeated. */
  operation: string;
  unit: UnitId;
  skillIds: string[];
  questionIds: string[];
  /** Pace target in seconds per rep, used by the pace readout. */
  targetSeconds: number;
  source: SourceReference;
}

export interface MissionStage {
  id: string;
  title: string;
  /** What the aircrew is doing at this point in the flight. */
  brief: string;
  questionIds: string[];
}

/**
 * A mission is one continuous navigation problem: plot the route, measure it,
 * work the winds, compute the times and the fuel, then take a fix in flight
 * and do it all again with the numbers that actually happened.
 */
export interface Mission {
  id: string;
  title: string;
  subtitle: string;
  unit: UnitId;
  skillIds: string[];
  /** The data card the whole mission works from. */
  situation: { label: string; value: string }[];
  stages: MissionStage[];
  /** Waypoint names, in order, when the mission fills in a jet log. */
  jetLogLegs?: string[];
  source: SourceReference;
}

/* ------------------------------------------------------------------ */
/* Know Cold reference                                                 */
/* ------------------------------------------------------------------ */

export type KnowColdCategory =
  | "definition"
  | "number"
  | "equation"
  | "sequence"
  | "relationship"
  | "curveShift"
  | "aircraft"
  | "trap";

export interface KnowColdCard {
  id: string;
  category: KnowColdCategory;
  term: string;
  body: string;
  formula?: string;
  unit: UnitId;
  conceptIds: ConceptId[];
  source: SourceReference;
}

/* ------------------------------------------------------------------ */
/* Learner state                                                       */
/* ------------------------------------------------------------------ */

/** 0 unseen · 1 introduced · 2 familiar · 3 developing · 4 strong · 5 mastered */
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface MasteryRecord {
  conceptId: ConceptId;
  level: MasteryLevel;
  /** Correct / total, all time. */
  seen: number;
  correct: number;
  /** Most recent outcomes, newest last, capped at 8. Recency-weighted. */
  recent: boolean[];
  /** Epoch ms of the last answer. */
  lastSeenAt: number | null;
  /** Epoch ms this concept is next due for review. */
  dueAt: number | null;
  /** Current spacing interval in days. */
  intervalDays: number;
  /**
   * How many correct answers were application-tier rather than recognition.
   *
   * Gates the top of the ladder: a concept cannot read as mastered on
   * recognition alone, however many definition questions went right.
   */
  applied: number;
}

export interface Attempt {
  questionId: string;
  conceptIds: ConceptId[];
  correct: boolean;
  /** Milliseconds spent on the question. */
  elapsedMs: number;
  at: number;
  context: "lesson" | "review" | "exam" | "rapidFire";
  /**
   * The serialized answer the student gave.
   *
   * Optional, and absent from every attempt recorded before this field
   * existed. It is here for the Navigation error taxonomy: "incorrect" is
   * close to useless in a calculation course, and telling a reciprocal apart
   * from a decimal-place slip needs the number that was actually typed.
   */
  answerKey?: string;
  /**
   * What this answer proved. Absent on attempts recorded before the evidence
   * model existed; `migrate` backfills those from the question bank so a
   * student who really did work the problems is not demoted for it.
   */
  evidence?: EvidenceKind;
}

export interface LessonProgress {
  lessonId: string;
  started: boolean;
  completed: boolean;
  /** Best score across all completions, 0–1. */
  bestScore: number;
  attempts: number;
  lastCompletedAt: number | null;
  /** Completed with every question right on the first try. */
  perfect: boolean;
}

export interface ExamResult {
  id: string;
  at: number;
  mode: "quick" | "full" | "unit" | "weak" | "custom";
  label: string;
  questionIds: string[];
  /** questionId -> chosen answer key (index or serialized value). */
  answers: Record<string, string>;
  correctIds: string[];
  incorrectIds: string[];
  flaggedIds: string[];
  elapsedMs: number;
  timed: boolean;
  score: number;
}

export interface StreakState {
  current: number;
  longest: number;
  /** YYYY-MM-DD of the last day with any completed activity. */
  lastActiveDay: string | null;
  /** Distinct YYYY-MM-DD strings, newest first, capped at 60. */
  history: string[];
}

export interface AchievementState {
  id: string;
  unlockedAt: number;
}

export const PROGRESS_SCHEMA_VERSION = 2;

/**
 * Everything a student has done in ONE course. Kept in its own bucket so
 * studying Engines can never move an Aerodynamics number.
 */
export interface CourseProgress {
  xp: number;
  mastery: Record<ConceptId, MasteryRecord>;
  lessons: Record<string, LessonProgress>;
  attempts: Attempt[];
  exams: ExamResult[];
  savedQuestionIds: string[];
  savedKnowColdIds: string[];
  watchedExplainerIds: string[];
}

/**
 * The stored progress document.
 *
 * Streak, achievements and onboarding sit at the platform level rather than
 * inside a course: a student who studies Engines today has kept their streak
 * alive, and being asked to redo the first-run tour after switching courses
 * would be nonsense. Everything measuring *subject* progress lives per course.
 */
export interface ProgressState {
  version: number;
  /** Which course the app opens into. */
  activeCourse: CourseId;
  streak: StreakState;
  achievements: AchievementState[];
  /** Set once the student has seen the first-run tour. */
  onboarded: boolean;
  courses: Record<CourseId, CourseProgress>;
}

/**
 * The flattened view a screen actually consumes: one course's progress plus
 * the platform-level fields. Components never index into `courses` themselves,
 * which is what lets a screen stay course-agnostic.
 */
export interface CourseProgressView extends CourseProgress {
  streak: StreakState;
  achievements: AchievementState[];
  onboarded: boolean;
  activeCourse: CourseId;
}
