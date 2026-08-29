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

  /* ================================================================ */
  {
    conceptId: "fr-wording",
    intuition:
      "These four words are not synonyms for 'important' — each one is a precise flag for how much compliance is required, and one of them, 'will', is not about obligation at all. It only announces something that is going to happen.",
    analogies: [
      {
        picture:
          "A parent laying out a Saturday: \"You must brush your teeth\" (no choice), \"you should eat your vegetables\" (strongly urged, but skipping broccoli once is not a crisis), \"you may have dessert\" (entirely up to you), and \"we will leave at 8\" — just a plan, with no instruction embedded in it at all.",
        maps: [
          ["Shall — mandatory", "\"You must brush your teeth\""],
          ["Should — recommended", "\"You should eat your vegetables\""],
          ["May — optional", "\"You may have dessert\""],
          ["Will — futurity only, no requirement", "\"We will leave at 8\" — a plan, not an instruction"],
        ],
        breaksDown:
          "A parent's 'must' still carries some real-world flexibility. In a NATOPS manual, 'shall' does not — it is treated as absolute.",
      },
    ],
    chain: [
      { label: "You read a directive containing shall, should, may, or will", trend: "none" },
      {
        label: "Shall means mandatory — no exceptions are implied",
        trend: "none",
        because: "It is used only when a procedure is required, full stop.",
      },
      {
        label: "Should means recommended, and may means entirely optional — neither is compliance-mandatory",
        trend: "none",
        because: "Both leave room for judgment that 'shall' deliberately removes.",
      },
      {
        label: "Will means futurity only — it announces what is going to happen, with no requirement attached",
        trend: "none",
        terminal: true,
        because: "This is the one most likely to be misread as a command, since everyday speech uses 'will' that way and this convention does not.",
      },
    ],
    wrongModel: {
      brainWants:
        "These all basically mean 'this is important' — different flavors of emphasis, so it barely matters which one is used.",
      actually:
        "'Will' is the one to watch: it carries NO requirement, ever. It only announces something that is going to happen — mixing it up with 'shall' is exactly the trap being tested.",
      whyItsTempting:
        "In everyday speech 'will' often functions like a soft command (\"you will be here at 8\", said as a warning) — but this convention deliberately strips that out, so the everyday reading runs precisely backward here.",
    },
    deeper:
      "Wording and priority compose in real questions: if a general publication says 'should' about a procedure and a more specific one says 'shall' about the same procedure, the 'shall' governs — a specific mandatory instruction beats a general recommendation, regardless of which document sits higher in the priority order for anything else.",
  },

  /* ================================================================ */
  {
    conceptId: "fr-vfr-on-top",
    intuition:
      "VFR-on-top sounds like an escape from IFR rules, but it is not — it is still an IFR clearance that happens to let you pick your own altitude by VFR cloud-clearance criteria. Every other IFR rule, including which specific altitudes are legal, still applies underneath it.",
    analogies: [
      {
        picture:
          "A restaurant that lets you seat yourself instead of waiting to be seated. You still order off the same menu, pay the same bill, and follow the same house rules — the only thing that changed is who chooses the table.",
        maps: [
          ["The IFR flight plan and clearance, still in effect", "the menu, the bill, and the house rules — unchanged"],
          ["VFR-on-top authorization to pick your own cruising altitude", "seating yourself instead of waiting for the host"],
          ["Still following the IFR semicircular altitude table and IFR minimums", "still following the dress code and ordering off the same menu"],
        ],
        breaksDown:
          "Self-seating is purely a convenience with nothing else attached. VFR-on-top comes bundled with real obligations — visibility, cloud clearance, and IFR altitude rules all apply at once — so the analogy only covers the ONE thing that actually changed: who picks the altitude.",
      },
    ],
    chain: [
      { label: "ATC authorizes VFR-on-top for an IFR flight", trend: "none" },
      {
        label: "The pilot now selects the cruising altitude instead of ATC assigning one",
        trend: "none",
        because: "That is the one specific freedom VFR-on-top actually grants.",
      },
      {
        label: "The chosen altitude must still satisfy the VFR semicircular rule AND normal IFR minimum altitudes",
        trend: "none",
        because: "The aircraft never stopped being an IFR flight — only the altitude-picking authority moved.",
      },
      {
        label: "The pilot must also maintain VFR visibility and cloud clearance the entire time",
        trend: "none",
        terminal: true,
        because: "If either lapses, the flight is no longer legally VFR-on-top and needs an ATC-assigned IFR altitude again.",
      },
    ],
    wrongModel: {
      brainWants:
        "It has 'VFR' right in the name, so once I'm on top I'm basically flying VFR — normal VFR rules apply and I can treat it like any other VFR flight.",
      actually:
        "It is still an IFR flight, full stop. The VFR semicircular cruising altitudes apply on top of — not instead of — the IFR rules, and minimum IFR altitudes still govern where you can legally be.",
      whyItsTempting:
        "The name front-loads the word 'VFR' and describes what you can see — clear of clouds, on top — which reads as permission to relax IFR discipline, when it is actually the opposite: one added freedom bolted onto an otherwise fully intact IFR clearance.",
    },
    deeper:
      "This is the general pattern behind every 'on-top' or 'special' authorization in the regs: read the name as naming the ONE exception it grants, not as replacing the whole rule set around it.",
  },
];
