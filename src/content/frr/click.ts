/**
 * Make It Click entries for Flight Rules and Regulations.
 *
 * FR&R is memorisation-heavy, which makes it the course where "I read it and
 * it did not stick" is most common and where an intuition earns its keep — a
 * student who understands WHY the order is the order can rebuild it under
 * pressure instead of hoping they recall four acronyms in the right sequence.
 */

import type { ClickEntry } from "@/lib/make-it-click";

export const CLICK: ClickEntry[] = [
  {
    conceptId: "fr-priority",
    intuition:
      "When two rulebooks disagree, the one written for the narrower situation wins. A rule about every aircraft in the country cannot know what your particular aeroplane needs, so the document written for your aeroplane outranks it.",
    analogies: [
      {
        picture:
          "A recipe book that says bake at 180°C, and a note taped to your own oven saying it runs 20 degrees hot. You follow the note. It was written by someone who knew about YOUR oven.",
        maps: [
          ["FAR Part 91 — general rules for US airspace", "the recipe book, written for everyone"],
          ["CNAF M-3710.7 — all naval aircraft", "the kitchen's own house rules"],
          ["Aircraft NATOPS — one model", "the note taped to your specific oven"],
          ["Following the most specific document", "trusting the note over the book"],
        ],
        breaksDown:
          "A recipe book has no authority. These do, and the ordering is published rather than a matter of judgement — which is why it can be examined.",
      },
    ],
    chain: [
      { label: "Two publications give different guidance", trend: "none" },
      {
        label: "Ask which was written for the narrower audience",
        trend: "none",
        because: "The FAA writes for everyone in US airspace; NATOPS writes for one aircraft model.",
      },
      {
        label: "Narrower means it knows more about your situation",
        trend: "up",
        because: "It could account for things a general rule could not possibly anticipate.",
      },
      {
        label: "NATOPS beats CNAF, which beats FLIP, which beats FAR Part 91",
        trend: "none",
        because: "One aircraft, then all naval aircraft, then all DOD, then all US airspace.",
      },
      {
        label: "Follow the most specific document that covers the situation",
        trend: "none",
        terminal: true,
        because: "And CNAF is usually MORE stringent than the FAR, so the tighter rule is normally the right instinct.",
      },
    ],
    manipulate: {
      labId: "flab-publications",
      driver: "Specificity",
      proves: "Pick a document and see what it beats. Specific always outranks general.",
    },
    wrongModel: {
      brainWants:
        "Federal law is the highest authority in the country, so the FAR must sit at the top and everything else fills in underneath it.",
      actually:
        "The order runs the other way: aircraft NATOPS, then CNAF M-3710.7, then FLIP, then FAR Part 91. The aircraft-specific document wins.",
      whyItsTempting:
        "Everywhere else in life the federal rule does outrank the local one. Here the ordering is by how narrowly the document was written, not by how much authority issued it.",
    },
    deeper:
      "The ordering is not a claim that NATOPS overrides federal law in general — it is the order in which a naval aviator resolves a conflict in PROCEDURE, and the services accept it because a rule written for one airframe is better informed than a rule written for all of them.",
  },
];
