# WingBrief

A gamified, visual learning platform for NIFE / API, built for Student Naval Aviators
and Student Naval Flight Officers.

Duolingo-style progression + NotebookLM-style visual explainers + NIFE exam-focused content.

Four courses ship today. They share one engine, one design language and one streak, but
keep separate mastery, review queues, exams and visual identity — the way four languages
sit inside one language app.

| | Aerodynamics | Engines | Flight Rules | Weather |
|---|---|---|---|---|
| Identity | Aviation blue · air and flow | Burnt amber · power and machinery | Indigo · rules and charts | Teal · the moving atmosphere |
| Units | 6 | 7 | 8 | 10 |
| Lessons | 33 (~226 min) | 30 (~172 min) | 32 (~162 min) | 27 (~151 min) |
| Concepts | 136 | 100 | 106 | 73 |
| Questions | 344 | 205 | 220 | 163 |
| Explainers · Labs | 37 · 8 | 30 · 9 | 32 · 8 | 28 · 10 |
| Know Cold cards | 78 | 61 | 58 | 60 |
| Enabling Objectives | 219, all taught **and** assessed | 29, all taught **and** assessed | 42, all taught **and** assessed | none published — see below |

Every lesson in every course has a visual explainer, and every unit has a lab.

Lesson counts follow the material rather than a template. An earlier version of the
curriculum test capped every course at 30 lessons, and Aerodynamics and Engines both came
in at exactly 30 — evidence the quota was shaping the content rather than catching a
defect. The cap is gone. What is enforced instead is depth: **every concept and every
enabling objective is assessed by at least two questions**, and no single lesson may claim
more than fifteen objectives.

Navigation can be added without touching the learning engine.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>. No API keys, no database, no configuration — progress
lives in the browser's local storage.

Other scripts:

```bash
npm run build && npm start
```

```bash
npm run lint && npm run typecheck && npm test
```

> **Note on OneDrive.** This project currently lives inside a OneDrive-synced folder.
> `node_modules/` and `.next/` will be continuously synced, which slows installs and dev
> rebuilds and occasionally corrupts the dev cache. Moving the folder outside OneDrive (or
> excluding it in the OneDrive settings) makes the dev server noticeably faster and more
> stable. If the dev server starts returning 404s or "Cannot find module ./vendor-chunks/…",
> stop it, `rm -rf .next`, and restart.


---

## Accounts and cross-device sync

Optional. With no configuration the app runs entirely in the browser — every
feature works, progress just does not follow you to another device.

To turn sync on:

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New query**, paste [supabase/schema.sql](supabase/schema.sql), run it
3. Copy `.env.local.example` to `.env.local` and fill in the two values from
   **Project Settings → API**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

4. In **Authentication → URL Configuration**, set **Site URL** to your deployed
   origin and add `<your-site>/auth/callback` to **Redirect URLs**. Add
   `http://localhost:3000/auth/callback` too if you want sign-in to work locally.
5. Restart the dev server

Sign-in is a magic link — no passwords to store or reset. On Vercel, add the same
two variables under **Settings → Environment Variables** and redeploy.

Both values are safe to expose in the browser. The anon key grants nothing on its
own; the row-level security policies in `schema.sql` are what keep each
student's row private to them.

### How merging works

Progress is one JSONB document per user, and sync **merges** rather than
overwrites. Every rule is commutative and idempotent, so it does not matter which
device syncs first and a retried upload cannot double-count:

- Answers are keyed on question + timestamp, so the same answer arriving from two
  devices collapses into one
- Mastery keeps whichever record came from more practice; a tie never demotes a concept
- Streaks rebuild from the union of active days, so a run split across a phone and
  a laptop is recognised as one continuous streak
- XP takes the larger total rather than the sum

Anything done signed-out is folded into the account the first time you sign in.
Writes hit localStorage before the network, so losing signal mid-lesson costs
nothing — the next successful save carries it up.

---

## What's in it

| | Total |
|---|---|
| Courses | 4 |
| Lessons | 60 |
| Concepts tracked for mastery | 219 |
| Questions | 387 |
| Visual explainers | 32 |
| Sim Labs | 16 |
| Parametric SVG diagrams | 60 |
| Know Cold cards | 139 |
| Enabling Objectives mapped | 248 — all taught **and** assessed |

### Screens

- **Course switcher** — sidebar, mobile header and profile; shows each course's readiness
- **Home** — course readiness, streak, XP, Today's Flight, weak areas, explainers, achievements
- **Lessons** — the flight path: a snaking route through the course's units, per-node state
- **Lesson player** — hook → visual model → manipulation → cause-effect chain → Know Cold → retrieval
- **Review** — spaced review, weak areas, mistakes, saved, plus per-concept detail pages
- **Sim Lab / Scenario Lab / Weather Lab** — interactive labs per course, each named for
  what it actually does. Aerodynamics and Engines simulate a physical relationship;
  Flight Rules resolves a situation; Weather changes an atmospheric condition and shows
  what the air does about it
- **Exam** — quick / full / unit / weak-area / custom, timed or untimed, with results and review
- **Know Cold** — the pre-exam compression layer, searchable and filterable
- **Explainers** — animated 60–120 second visual explainers
- **Profile** — mastery, achievements, activity, the EO coverage matrix, export/import/reset

---

## Source hierarchy

Every concept, question and lesson carries the document, chapter and Enabling Objectives it
was written from.

1. **Aerodynamics Trainee Guide** — `NAVAVSCOLSCOM-SG-200`, CIN Q-9B-0020L, Unit 2
   (Basic Theory · Lift Production and Drag · Stalls · Performance & Maneuvering · Spins ·
   Wake Turbulence and Wind Shear). This is the authority for definitions, numbers,
   equations, sequences and aircraft-specific facts.
2. **Enabling Objectives** — treated as the exam blueprint, across the 2.x and 3.x
   series. `buildEoMatrix()` rebuilds the EO → lesson → concept → question matrix
   from the content at runtime, and a test asserts every EO a lesson claims to teach is also
   assessed by at least one question.
3. **Official review and study questions** — the Assignment Sheets, plus the 50-question
   "Aero Official Un-official Practice Test". These set question wording, expected depth and
   distractor style. Questions modelled on them are tagged `officialStyle`.
4. **Condensed notes** — used for high-value groupings and efficient phrasing.
5. **Gouge Compressor logic** — applied throughout: keep definitions, numbers, equations,
   sequences, directional relationships, curve shifts, comparisons and wording traps; cut
   history, anecdote and repetition.

Where the guide and the condensed notes disagree, the guide wins.

### Engines

1. **Principles of Gas Turbine/Reciprocating Operation** — authoritative for
   pressure/velocity, nozzles and diffusers, the gas generator, both cycles, and every
   factor affecting thrust.
2. **Gas Turbine/Reciprocating Engines** — inlet, compressor, burner, turbine,
   exhaust, afterburner and reciprocating components.
3. **Compressor Stalls** — blade AOA, indications, causes, avoidance, prevention
   and recovery.
4. **Engines Condensed Notes** — the only supplied source covering engine types and the
   surrounding aircraft systems.

Units e1–e5 come from the official lectures and carry enabling objectives. Units e6–e7
(engine types, fuel, lubrication, starting, hydraulics, electrics) exist only in the
condensed notes, which state no EOs — so those lessons **claim none** rather than
inventing them. The EO matrix on the profile shows exactly that split.

### Flight Rules and Regulations

1. **Flight Rules and Regulations Trainee Guide** — `NAVAVSCOLSCOM-SG-200` Module 7,
   lesson topics 7-1 (Federal Aviation Organization), 7-2 (Visual / Instrument Flight
   Rules) and 7-3 (Airspace and General Flight Rules). Authoritative for everything.
2. **Enabling objectives 2.345 – 2.386** — 42 in one contiguous block. Every lesson names
   the ones it teaches; every one is assessed.
3. **The Assignment Sheet study questions**, whose answer keys the guide publishes. Those
   questions set wording, depth and distractor style, and items modelled on them are
   tagged `officialStyle`.
4. **Condensed notes**, for grouping and phrasing only.

The guide cites two publications constantly — **FAR Part 91** and **CNAF M-3710.7** — and
they do not always agree. Where they differ the course states both, because knowing which
document a rule comes from is itself testable: CNAF is usually the more restrictive, and
its priority over the FAR is the subject of an entire lesson.

Terminology follows the NIFE material. Where the guide says "Aldis lamp", "waveoff" or
"flat hatting", the course does too, rather than substituting more familiar FAA or general
aviation wording.

**Table 2-3, IFR Filing Criteria, is an image in the source and did not extract.** The
course therefore teaches only what the guide states in text — that an alternate, when one
is required, must have a published approach flyable without two-way radio whenever the
alternate's forecast is below 3,000 ft and 3 SM during ETA ± 1 hour — and never invents
the table's own thresholds for *whether* an alternate is required. Questions on that point
name the table as the authority instead of quoting numbers it does not supply.

### Weather

**Weather is the one course with no official material.** The other three are built on
trainee guides or lecture PDFs that publish numbered enabling objectives. The supplied
Weather sources are:

1. **Weather Condensed Notes** — four blocks: WX 1 Theory, WX 2 Mechanics, WX 3 Hazards,
   WX 4 Planning and Resources. This is level 4 in the source hierarchy.
2. **Exhaustive Weather Dump Sheet** — the mnemonics: IWRUM, TDWP, FOCT, WTFM, HI MELT,
   COUT and the turbulence intensity ladder. Level 5.

There is no Weather trainee guide and there are **no enabling objectives**, so no Weather
lesson claims one — exactly as Engines units e6–e7 do, for the same reason. The EO matrix
on the profile is empty for Weather, which is the correct answer rather than a gap. What
is enforced instead is the coverage rule that applies to every course: every concept is
taught by a lesson and assessed by at least two questions.

Every number in the course is quoted from the notes: 29.92 and 15 °C, the 2 °C and 1 inHg
lapse rates, 2,000 ft AGL for the wind layer, FL300 for the jet stream, the clear/rime/mixed
temperature bands, 2,000–6,000 fpm for a microburst, 50 ft and 20 ft and ⅝ SM for fog, and
the 2 / 4 / 6 hour advisory validity periods. Where the notes state a relationship, the
direction is preserved; nothing is filled in from general meteorology.

---

## Model fidelity

The brief forbids fabricating aircraft performance values, so the physics is split in two.

**Computed exactly** from equations in the guide:

- Standard atmosphere (pressure, temperature, density, speed of sound, lapse rate,
  isothermal layer)
- Density altitude, humidity effect on density
- IAS ⇄ TAS, Mach number
- Load factor `n = 1/cos φ`, accelerated stall speed `Vs√n`
- Turn rate `g·tanφ/V` and turn radius `V²/(g·tanφ)`
- Stall-speed ratios for weight, density, C_Lmax and load factor
- The V-n envelope, maneuver speed and ultimate load

**Indexed / relative** because the guide publishes the relationship rather than the
coefficients for any one airframe:

- Parasite, induced and total drag
- Thrust required/available, power required/available, excess thrust and excess power
- Vortex strength

Every relationship's *direction* is unit-tested (`src/lib/aero.test.ts`, 65 assertions),
because a diagram that animates the wrong way is worse than no diagram.

T-6B specific values (18 units stall AOA, +7.0/−3.5 G, Va 227 KIAS, 125 KIAS best glide,
11:1 glide ratio, 1,100 SHP, 2-minute takeoff / 3-minute landing wake spacing, 31,000 ft
ceiling) are quoted from the guide, never invented.

For Engines the same rule applies harder, because the sources publish almost no absolute
numbers. **Stated exactly** where the sources state them: the 25/75 burner air split, the
75/25 turbine energy split, 15:1–30:1 axial compression, the 36,000 ft thrust break point,
30% RPM at fuel-on, fuel flash points, and the 90/10 turboprop thrust split. **Relative or
indexed** everywhere else — the thrust-versus-factor curves carry a relative y-axis and say
so on the diagram, and the sim labs are relationship simulators, not engine models. No
compressor map, thrust table or airframe-specific engine value appears anywhere.

Weather is the same discipline again, one layer out: its labs are relationship models,
not meteorological simulations. The Cloud Lab closes a dew point spread when a lifting
mechanism is applied because the notes say lifting cools a parcel toward saturation — it
does not compute a lapse rate the source never published. The Storm Lab computes the
over-the-top clearance from the one rule that exists, 1,000 ft per 10 kt of wind at the
top, and nothing else.

Flight Rules has no physics to model, so its equivalent discipline is numerical: every
threshold in the course — 1,000 and 3, 3,000 and 3, brief + 3 hours or ETD + 30 minutes,
10,000 ft cabin altitude, 250 below 10,000 and 200 under the Class B shelf, 175 / 230 /
265 / 80 holding speeds — is quoted from the guide. The Scenario Labs decide rulings from
those stated rules and nothing else; where the source does not publish a threshold, the
lab does not offer one.

---

## Architecture

Curriculum **data** is completely separate from UI **code**, so Weather, Navigation
and Flight Rules can be added later without touching the learning engine.

```
src/
  content/            curriculum data only — no React
    courses.ts        the course registry: id, name, icon, accent
    index.ts          aggregation, global id lookups, buildEoMatrix(course)
    aero/             units, concepts, questions, lessons, explainers, labs, know-cold
    engines/          the same shape, and the template for any future course
    frr/              Flight Rules and Regulations
    weather/          Weather

  lib/                the engine — pure, testable, no UI
    types.ts          Course/Unit/Lesson/Concept/Question/Mastery/Attempt/Exam
    course.tsx        active course context + data-course theming
    aero.ts           the aerodynamic models
    mastery.ts        0–5 concept mastery + deterministic spaced repetition
    scoring.ts        answer serialization, grading, exam scoring, question selection
    review.ts         weak areas, lesson gating, Today's Flight
    xp.ts             XP, streaks, achievements
    storage.ts        persistence behind a ProgressStore interface
    progress-store.tsx  the single React funnel for all mutations

  components/
    diagrams/         40 parametric SVG diagrams + registry
    lab/              controls, 30 data-driven widgets, 8 full labs
    questions.tsx     the ten interaction types
    lesson-player.tsx, explainer-player.tsx, review-session.tsx, exam-runner.tsx
```

### Mastery and scheduling

Mastery is tracked per **concept**, not per lesson, so review can say "you are weak on CLmax
AOA" rather than "you are weak on lesson 23".

- Levels 0–5: unseen · introduced · familiar · developing · strong · mastered
- Recency-weighted accuracy over the last 8 answers, so a fresh miss dents a strong concept
- Two consecutive misses always drop a concept back into review territory
- Interval ladder 0 → 0.25 → 1 → 3 → 7 → 14 days
- Correct-and-fast earns the full interval; correct-but-slow earns half; a miss collapses it
- Everything is deterministic: the same answer history always yields the same level and due
  date, which makes it testable and explainable to the student

### Persistence

`LocalProgressStore` implements a `ProgressStore` interface with async `load`/`save`/`clear`.
Swapping in Supabase later is a single class, with no call-site changes. The stored blob is
versioned and defensively migrated, pruned to stay small, and degrades gracefully if the
quota is hit.

---

## Testing

153 tests across four files:

- `lib/mastery.test.ts` — levels, recency weighting, scheduling, readiness, priority
- `lib/scoring.test.ts` — answer serialization, grading of all ten types, exam scoring,
  deterministic selection
- `lib/aero.test.ts` — the direction and magnitude of every taught relationship
- `content/content.test.ts` — curriculum shape, unique ids, referential integrity, question
  wellformedness, concept/EO coverage, and that every diagram, widget and lab referenced by
  content actually exists

---

## Scope

Educational aid only. Not a substitute for official NIFE instruction or NATOPS.
