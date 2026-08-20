/**
 * Domain model for the NIFE Aerodynamics learning engine.
 *
 * Curriculum DATA (src/content) is kept strictly separate from UI code so the
 * same engine can later host Engines, Weather, Navigation and Flight Rules
 * without touching the learning/mastery/exam logic.
 */

/* ------------------------------------------------------------------ */
/* Source traceability                                                 */
/* ------------------------------------------------------------------ */

export type SourceDocument =
  | "Aerodynamics Trainee Guide"
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

export type UnitId = "u1" | "u2" | "u3" | "u4" | "u5" | "u6";

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
  | "graphRead";

export type Difficulty = 1 | 2 | 3;

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
  | GraphReadQuestion;

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
}

export interface Attempt {
  questionId: string;
  conceptIds: ConceptId[];
  correct: boolean;
  /** Milliseconds spent on the question. */
  elapsedMs: number;
  at: number;
  context: "lesson" | "review" | "exam" | "rapidFire";
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

export const PROGRESS_SCHEMA_VERSION = 1;

export interface ProgressState {
  version: number;
  xp: number;
  streak: StreakState;
  mastery: Record<ConceptId, MasteryRecord>;
  lessons: Record<string, LessonProgress>;
  attempts: Attempt[];
  exams: ExamResult[];
  achievements: AchievementState[];
  savedQuestionIds: string[];
  savedKnowColdIds: string[];
  watchedExplainerIds: string[];
  /** Set once the student has seen the first-run tour. */
  onboarded: boolean;
}
