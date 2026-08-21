# WingBrief

A gamified, visual learning platform for NIFE / API, built for Student Naval Aviators
and Student Naval Flight Officers.

Duolingo-style progression + NotebookLM-style visual explainers + NIFE exam-focused content.

Two courses ship today. They share one engine, one design language and one streak, but
keep separate mastery, review queues, exams and visual identity — the way two languages
sit inside one language app.

| | Aerodynamics | Engines |
|---|---|---|
| Identity | Aviation blue · air and flow | Burnt amber · power and machinery |
| Units | 6 | 7 |
| Lessons | 30 (~209 min) | 30 (~172 min) |
| Concepts | 119 | 100 |
| Questions | 242 | 145 |
| Explainers · Labs | 20 · 8 | 12 · 8 |
| Know Cold cards | 78 | 61 |
| Enabling Objectives | 219, all taught **and** assessed | 29, all taught **and** assessed |

Weather, Navigation and Flight Rules can be added without touching the learning engine.

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
| Courses | 2 |
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
- **Sim Lab** — eight interactive labs per course
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
