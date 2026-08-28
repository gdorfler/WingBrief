/**
 * Make It Click — the schema and the resolver.
 *
 * What this exists to do: recreate the moment a good instructor notices that a
 * student has read the words and not yet understood the thing, and changes
 * approach rather than repeating themselves louder.
 *
 * The design constraint that shaped everything here is that MOST OF IT IS
 * ALREADY WRITTEN. Measured across all 537 concepts:
 *
 *   relationships   59%   already in "AOA ↑ → CL ↑ (to CLmax)" form — a chain
 *   commonTraps     47%   the wording traps NIFE exploits — a wrong model
 *   definition     100%   exam-grade, one or two sentences — the NIFE line
 *   know-cold       59%   the smallest memorisable rule
 *   an explainer    64%   something that already shows the mechanism
 *   a lab           28%   something that already lets you change one variable
 *
 * So an authored entry is a DELTA, not a document. It supplies the two things
 * nothing else in the corpus has — a jargon-free intuition and a physical
 * analogy — and overrides the derived material only where the derivation is
 * worse than a hand-written version. Everything else is resolved at runtime.
 *
 * That matters for more than authoring cost: it means an entry cannot drift out
 * of sync with the curriculum, because the curriculum is still the source.
 */

import type {
  Concept,
  ConceptId,
  CourseContent,
  Explainer,
  KnowColdCard,
  Lab,
  Question,
} from "./types";

/* ------------------------------------------------------------------ */
/* Authored parts                                                      */
/* ------------------------------------------------------------------ */

/**
 * A physical picture the student can hold.
 *
 * `maps` is the part that makes this teaching rather than decoration: it states
 * which piece of the analogy stands for which piece of the mechanism. An
 * analogy that cannot state its own mapping is a mnemonic, and mnemonics do not
 * survive a question phrased a new way.
 */
export interface Analogy {
  /** One line: "A garden hose with your thumb over the end." */
  picture: string;
  /** How it lines up, real thing first: [["the wing", "your thumb"], ...] */
  maps: [real: string, inAnalogy: string][];
  /** Where the analogy stops being true. Always state it. */
  breaksDown?: string;
}

/** One link of the mechanism, revealed on its own. */
export interface ChainLink {
  /** "AOA increases" */
  label: string;
  /** Why this one causes the next. Shown when the link is opened. */
  because?: string;
  /** Which way the quantity moves, for the arrow. */
  trend?: "up" | "down" | "none";
  /** The last link is what the aircraft actually does. */
  terminal?: boolean;
}

/**
 * The intuitive-but-wrong reading, beside the real one.
 *
 * Held as a pair on purpose. Showing the correct model alone leaves the wrong
 * one intact and unexamined underneath it, which is why a student can recite
 * the right answer and still fly the wrong one.
 */
export interface WrongModel {
  /** "Your brain wants to think…" */
  brainWants: string;
  /** "What is actually happening…" */
  actually: string;
  /** Why the wrong one is seductive. Naming this is what dislodges it. */
  whyItsTempting?: string;
}

/** What to show, and where it comes from. */
export interface ShowMe {
  /** An existing explainer. Preferred — it is already built and QA'd. */
  explainerId?: string;
  /** Or a diagram with props, for a single decisive picture. */
  diagram?: { id: string; props?: Record<string, unknown> };
  /** One line telling the student what to watch for. */
  watchFor?: string;
}

/** What to let them change, and where it comes from. */
export interface Manipulate {
  /** An existing lab. Preferred. */
  labId?: string;
  /** Or a widget directly, when the lab around it would be too much. */
  widget?: string;
  /** The relationship the manipulation should make undeniable. */
  proves?: string;
  /**
   * The ONE thing the student changes, named as a variable.
   *
   * Not the first link's label. A chain opens with a clause — "Hold the nose
   * exactly where it is" — and a control reading "Hold the nose exactly where
   * it is ↑" is nonsense. The driver is the quantity behind that clause, short
   * enough to sit on a button: "Flight path", "Load factor", "Inlet airflow".
   */
  driver?: string;
}

/**
 * The authored delta for one concept.
 *
 * Every field except `intuition` is optional, and the resolver fills what it
 * can from the curriculum. An entry with nothing but an intuition still works —
 * which is the property that lets this ship across 537 concepts incrementally
 * instead of all at once.
 */
export interface ClickEntry {
  conceptId: ConceptId;
  /** 1–3 sentences. No terminology that is not load-bearing yet. */
  intuition: string;
  /** First is the default. Two is the cap; a third is authoring for its own sake. */
  analogies?: Analogy[];
  show?: ShowMe;
  /** Overrides the chain derived from Concept.relationships. */
  chain?: ChainLink[];
  manipulate?: Manipulate;
  /** Overrides the wrong model derived from Concept.commonTraps. */
  wrongModel?: WrongModel;
  /** One layer down, for "Why though?". Not a longer version — a deeper one. */
  deeper?: string;
  /**
   * What has to be true before this can land, for "Still confused".
   *
   * The instructor move this encodes: a student who cannot get induced drag
   * usually does not actually have downwash yet, and explaining induced drag
   * again in simpler words will not fix that.
   */
  prerequisites?: ConceptId[];
  /** Tests the same idea from a different angle. Used after a mistake. */
  transferQuestionIds?: string[];
}

/* ------------------------------------------------------------------ */
/* Resolved                                                            */
/* ------------------------------------------------------------------ */

export type ChainSource = "authored" | "relationships" | "none";
export type WrongModelSource = "authored" | "traps" | "none";

/** What the player consumes: the delta, merged with what the curriculum knows. */
export interface ResolvedClick {
  concept: Concept;
  intuition: string;
  analogies: Analogy[];
  show: ShowMe | null;
  explainer: Explainer | null;
  chain: ChainLink[];
  chainSource: ChainSource;
  manipulate: Manipulate | null;
  lab: Lab | null;
  wrongModel: WrongModel | null;
  wrongModelSource: WrongModelSource;
  deeper: string | null;
  prerequisites: Concept[];
  /** Stage 9, first half: the source-accurate line. */
  speakNife: { definition: string; formula?: string; relationships: string[] };
  /** Stage 9, second half: the smallest thing worth memorising. */
  knowCold: KnowColdCard | null;
  transferQuestions: Question[];
  /** Which acts have enough material to be worth showing. */
  acts: ClickAct[];
}

export type ClickAct = "grasp" | "see" | "move" | "land";

/* ------------------------------------------------------------------ */
/* Deriving a chain                                                    */
/* ------------------------------------------------------------------ */

/**
 * Turn a relationship line into links.
 *
 * Concepts already state these as "AOA ↑ → CL ↑ (to CLmax)", which is the exact
 * shape Make It Click wants, so 59% of the corpus has a usable chain the moment
 * this function exists. Splits on the arrow and reads a trailing ↑/↓ as the
 * direction so the rendered arrow agrees with the words.
 */
export function chainFromRelationship(line: string): ChainLink[] {
  const parts = line
    .split(/\s*(?:→|->|=>)\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return [];

  return parts.map((label, i) => ({
    label,
    trend: /↑|increase|rise|more\b/i.test(label)
      ? ("up" as const)
      : /↓|decrease|fall|drop|less\b/i.test(label)
        ? ("down" as const)
        : ("none" as const),
    terminal: i === parts.length - 1,
  }));
}

/** The longest relationship a concept states, as links. Longest = most causal steps. */
function derivedChain(concept: Concept): ChainLink[] {
  let best: ChainLink[] = [];
  for (const line of concept.relationships ?? []) {
    const links = chainFromRelationship(line);
    if (links.length > best.length) best = links;
  }
  return best;
}

/**
 * Read a wording trap as a wrong model.
 *
 * Traps are authored as prose warnings rather than as a pair, so this cannot
 * invent the "your brain wants" half out of nothing — it presents the trap as
 * the correction and leaves the tempting reading unstated unless the entry
 * supplies it. A derived wrong model is therefore weaker than an authored one,
 * and `wrongModelSource` says which the student is looking at.
 */
function derivedWrongModel(concept: Concept): WrongModel | null {
  const trap = concept.commonTraps?.[0];
  if (!trap) return null;
  return { brainWants: "", actually: trap };
}

/* ------------------------------------------------------------------ */
/* Resolver                                                            */
/* ------------------------------------------------------------------ */

/**
 * Merge an authored entry with everything the curriculum already knows.
 *
 * Authored always wins; derived fills the gaps; absent is absent. The `acts`
 * list is computed rather than assumed so the player never renders an empty
 * stage — a concept with no explainer and no lab simply has no "see" or "move"
 * act, and the experience stays short instead of padded.
 */
export function resolveClick(
  content: CourseContent,
  conceptId: ConceptId,
  entry: ClickEntry | undefined,
): ResolvedClick | null {
  const concept = content.concepts.find((c) => c.id === conceptId);
  if (!concept) return null;

  const byId = new Map(content.concepts.map((c) => [c.id, c]));

  const explainer =
    (entry?.show?.explainerId
      ? content.explainers.find((e) => e.id === entry.show!.explainerId)
      : content.explainers.find((e) => e.conceptIds.includes(conceptId))) ?? null;

  const lab =
    (entry?.manipulate?.labId
      ? content.labs.find((l) => l.id === entry.manipulate!.labId)
      : content.labs.find((l) => l.conceptIds.includes(conceptId))) ?? null;

  const authoredChain = entry?.chain?.length ? entry.chain : null;
  const chain = authoredChain ?? derivedChain(concept);
  const chainSource: ChainSource = authoredChain
    ? "authored"
    : chain.length
      ? "relationships"
      : "none";

  const authoredWrong = entry?.wrongModel ?? null;
  const wrongModel = authoredWrong ?? derivedWrongModel(concept);
  const wrongModelSource: WrongModelSource = authoredWrong
    ? "authored"
    : wrongModel
      ? "traps"
      : "none";

  const knowCold = content.knowCold.find((k) => k.conceptIds.includes(conceptId)) ?? null;

  const show: ShowMe | null = entry?.show ?? (explainer ? { explainerId: explainer.id } : null);
  const manipulate: Manipulate | null =
    entry?.manipulate ?? (lab ? { labId: lab.id, proves: lab.teaches } : null);

  const acts: ClickAct[] = ["grasp"];
  if (show || explainer) acts.push("see");
  if (chain.length >= 2 || manipulate) acts.push("move");
  acts.push("land");

  return {
    concept,
    intuition: entry?.intuition ?? "",
    analogies: entry?.analogies ?? [],
    show,
    explainer,
    chain,
    chainSource,
    manipulate,
    lab,
    wrongModel,
    wrongModelSource,
    deeper: entry?.deeper ?? null,
    prerequisites: (entry?.prerequisites ?? [])
      .map((id) => byId.get(id))
      .filter((c): c is Concept => Boolean(c)),
    speakNife: {
      definition: concept.definition,
      formula: concept.formula,
      relationships: concept.relationships ?? [],
    },
    knowCold,
    transferQuestions: (entry?.transferQuestionIds ?? [])
      .map((id) => content.questions.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q)),
    acts,
  };
}

/* ------------------------------------------------------------------ */
/* Coverage                                                            */
/* ------------------------------------------------------------------ */

export interface ClickCoverage {
  conceptId: ConceptId;
  /** Authored — the thing only a person can write. */
  hasIntuition: boolean;
  hasAnalogy: boolean;
  /** Derived or authored. */
  hasChain: boolean;
  hasWrongModel: boolean;
  hasShow: boolean;
  hasManipulate: boolean;
  hasKnowCold: boolean;
  /**
   * Whether this concept is worth opening at all.
   *
   * An intuition alone is a real answer to "I don't get it"; a definition alone
   * is the thing the student already failed to understand, so a concept with no
   * entry is deliberately NOT clickable rather than clickable-but-empty.
   */
  ready: boolean;
}

export function clickCoverage(
  content: CourseContent,
  entries: Map<ConceptId, ClickEntry>,
): ClickCoverage[] {
  return content.concepts.map((c) => {
    const e = entries.get(c.id);
    const resolved = resolveClick(content, c.id, e);
    return {
      conceptId: c.id,
      hasIntuition: Boolean(e?.intuition),
      hasAnalogy: Boolean(e?.analogies?.length),
      hasChain: (resolved?.chain.length ?? 0) >= 2,
      hasWrongModel: Boolean(resolved?.wrongModel),
      hasShow: Boolean(resolved?.show),
      hasManipulate: Boolean(resolved?.manipulate),
      hasKnowCold: Boolean(resolved?.knowCold),
      ready: Boolean(e?.intuition),
    };
  });
}
