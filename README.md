# WingBrief

A gamified, visual learning platform for NIFE / API, built for Student Naval Aviators
and Student Naval Flight Officers.

Duolingo-style progression + NotebookLM-style visual explainers + NIFE exam-focused content.

Five courses ship today. They share one engine, one design language and one streak, but
keep separate mastery, review queues, exams and visual identity — the way five languages
sit inside one language app.

| | Aerodynamics | Engines | Flight Rules | Weather | Navigation |
|---|---|---|---|---|---|
| Identity | Aviation blue · air and flow | Burnt amber · power and machinery | Indigo · rules and charts | Teal · the moving atmosphere | Emerald on chart paper · the navigator's desk |
| Asks | Why does the aircraft behave this way? | What is happening inside the machine? | What rule applies, and what next? | What is the atmosphere doing? | Given this, how do I find the answer? |
| Units | 6 | 7 | 8 | 10 | 10 |
| Lessons | 33 (~226 min) | 30 (~172 min) | 32 (~162 min) | 30 (~169 min) | 33 (~233 min) |
| Concepts | 136 | 100 | 106 | 94 | 91 |
| Questions | 344 | 205 | 220 | 217 | 415 |
| Explainers · Labs | 37 · 8 | 30 · 9 | 32 · 8 | 31 · 11 | 16 · 9 |
| Know Cold cards | 78 | 61 | 58 | 78 | 69 |
| Enabling Objectives | 219, all taught **and** assessed | 29, all taught **and** assessed | 42, all taught **and** assessed | 81, all taught **and** assessed | 37, all taught **and** assessed |

Every lesson in every course has a visual explainer, and every unit has a lab.

Navigation additionally carries **25 skills, 14 drills and 2 integrated missions**, because
it is examined on what a student can produce rather than on what they can recognise. See
[Navigation](#navigation) below for what that changed.

Lesson counts follow the material rather than a template. An earlier version of the
curriculum test capped every course at 30 lessons, and Aerodynamics and Engines both came
in at exactly 30 — evidence the quota was shaping the content rather than catching a
defect. The cap is gone. What is enforced instead is depth: **every concept and every
enabling objective is assessed by at least two questions**, and no single lesson may claim
more than fifteen objectives.

Adding Navigation did touch the engine — a course examined on production needed a numeric
answer type, tolerance-aware grading and a skill axis alongside the concept graph. The
other four courses were not modified to accommodate it: every new field is optional, and
their content, progress and behaviour are byte-for-byte what they were.

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
| Courses | 5 |
| Lessons | 158 |
| Concepts tracked for mastery | 527 |
| Skills tracked for proficiency | 25 |
| Questions | 1,401 |
| Visual explainers | 146 |
| Labs and benches | 45 |
| Drills · Missions | 14 · 2 |
| Parametric SVG diagrams | 127 |
| Know Cold cards | 344 |
| Enabling Objectives mapped | 408 — all taught **and** assessed |

### Screens

- **Course switcher** — sidebar, mobile header and profile; shows each course's readiness
- **Home** — course readiness, streak, XP, Today's Flight, weak areas, explainers, achievements
- **Lessons** — the flight path: a snaking route through the course's units, per-node state
- **Lesson player** — hook → visual model → manipulation → cause-effect chain → Know Cold → retrieval
- **Review** — spaced review, weak areas, mistakes, saved, plus per-concept detail pages
- **Sim Lab / Scenario Lab / Weather Lab / Nav Bench** — interactive sections per course,
  each named for what it actually does. Aerodynamics and Engines simulate a physical
  relationship; Flight Rules resolves a situation; Weather changes an atmospheric condition
  and shows what the air does about it; Navigation puts the instrument itself on the bench
- **Nav Desk** — Navigation only. A working surface with the chart, both faces of the CR-3
  and the jet log, and every tool within reach. Nothing on it is graded
- **Drills** — Navigation only. Ten reps of one operation with a pace clock, built from the
  trainee guide's own published problem sets
- **Missions** — Navigation only. One continuous flight-planning problem worked in stages,
  with the jet log persisting throughout, ending in an in-flight fix and a replan
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

1. **Weather Trainee Guide** — `NAVAVSCOLSCOM-SG-200`, publishing **enabling objectives
   2.199 through 2.279**: 81 in one contiguous block, covering atmospheric physics,
   circulation, moisture, frontal mechanics, turbulence, icing, hazards, thunderstorms and
   weather products. Authoritative.
2. **Weather Condensed Notes** — WX 1 Theory, WX 2 Mechanics, WX 3 Hazards, WX 4 Planning
   and Resources. Used for phrasing where it agrees with the guide and states things more
   tightly.
3. **Exhaustive Weather Dump Sheet** — the mnemonics: IWRUM, TDWP, FOCT, WTFM, HI MELT,
   COUT and the turbulence ladder.

The course was originally built from sources 2 and 3, before the guide was available. The
guide then turned out to cover a good deal the notes never mention, and that material was
added rather than glossed: the stratosphere and its flight conditions, mountain and valley
winds, saturation, the eight forms of precipitation, the clues that read stable versus
unstable air from the cockpit, the five factors influencing frontal weather, squall lines,
inactive fronts, clear air turbulence, mountain wave turbulence with its three stationary
cloud types, frontal icing signatures, the PIREP icing scale, radiation versus advection
fog, volcanic ash, radar near thunderstorms, and the WS / WST / WA and Sierra / Tango /
Zulu advisory identifiers.

Every number is quoted from the sources: 29.92 and 15 °C, the 2 °C and 1 inHg lapse rates,
66,000 and 158,000 ft in the stratosphere, 2,000 ft AGL for the wind layer, FL300 for the
jet stream, 50–300 miles for a squall line, 50 kt at a mountaintop, the clear/rime/mixed
bands, 2,000–6,000 fpm for a microburst, 50 ft and 20 ft and ⅝ SM for fog, 35,000 ft radar
echo tops, and the 2 / 4 / 6 hour advisory validity periods. Nothing is filled in from
general meteorology.

---

### Navigation

1. **Navigation Trainee Guide** — `NAVAVSCOLSCOM-SG-200` Module/Unit 6, "Introduction to
   Air Navigation", CIN Q-9B-0020L. Seven lesson topics, and the authority for everything
   in the course. It publishes its enabling objectives in two numbering series: 2.42–2.47
   and 2.330–2.344 in the syllabus-wide block, and 4.1–4.17 in a block of its own —
   **37 distinct objectives**, all of them carried.
2. **NETSAFA Navigation final examination**, Test Booklet No. 4 — an official 50-question
   paper. Used for question wording, and for the exam conditions: 50 questions in
   2 hours 30 minutes, with blank paper supplied for calculations.

Objectives 2.42, 2.43, 2.45, 2.46 and 2.47 — the airspeed definitions — appear in both the
Aerodynamics and the Navigation chapters, because both chapters publish them. Both courses
teach and assess them, and both EO matrices show them. That is the source's duplication,
not the app's.

#### What the guide made us build

Navigation is not a memorisation course. Of its 37 objectives, **seventeen** begin with a
doing verb — six CALCULATE, three SOLVE, three PLOT, and one each of COMPUTE, LOCATE,
MEASURE, DETERMINE and PERFORM — and each of those publishes a **tolerance**. A course whose exam asks for a groundspeed to ±1% cannot
be delivered with multiple choice, so the platform grew four things:

- **A numeric answer type** with per-field units, tolerances and left/right qualifiers.
  A crosswind of 35 knots is only half an answer if you cannot say which side it is on.
- **Tolerance-aware grading.** Every band comes from Appendix A of the guide: ±1° on a
  direction, ±½ NM on a distance, ±1 minute on a coordinate, ±1 unit on the logarithmic
  scale for anything read off the CR-3, ±2 kt on true airspeed, ±0.01 on Mach, ±3° and
  ±3 kt on winds under 70 knots and ±5 and ±5 above.
- **A skill axis** alongside the concept graph. Concepts are what you know; skills are what
  you can do, at a stated speed, to a stated tolerance. Navigation's readiness figure is
  computed from skills, and the dashboard leads with accuracy and median solve time rather
  than with concepts seen.
- **An error taxonomy.** "Incorrect" is close to useless in a calculation course: a
  reciprocal, a decimal-place slip and a sign error all look identical in the answer box
  and need completely different remediation. Each has a signature readable off the number
  itself, and the feedback names it.

#### The instruments

The CR-3, the plotter and the dividers are simulated rather than illustrated, and none of
them computes an answer.

- **CR-3 calculation side** is a real circular slide rule. Both logarithmic scales are
  drawn with the graduation the guide describes — nine ticks between whole numbers from 10
  to 15, four from 15 to 30, one from 30 to 60 — with the rate index at 60, the seconds bug
  at 36, the unit index at 10 and the hour circle beneath. Rotating the inner wheel fixes a
  ratio, and every equivalent pair aligns at once. **It never prints the value under the
  hairline.** Reading the scale is the skill, and a numeric readout would quietly delete it
  while looking like a feature — which is also why the course grades to ±1%.
- **CR-3 wind side** carries a compass rose, both grid scales (0–80 under 60 knots, 0–160
  above) and a crab scale geared to crab ≈ 57.3 × crosswind ÷ TAS. That gearing is where
  the ten percent rule comes from: a crosswind a tenth of TAS reads 57.3 × 0.1 ≈ 6°, at any
  airspeed. The same face solves preflight winds, in-flight winds and TACAN point-to-point.
- **Plotter and dividers** behave like the physical ones: a grommet, a straightedge, and the
  outer scale that counts up to the LEFT — the detail the guide warns about twice. The
  dividers hold a span and carry it to a meridian; the counting stays with the student.
- **The jet log** does not total itself. Information Sheet 6-7-2 makes it the record of four
  computations the aircrew performs, and a form that filled itself in would be a record of
  nothing.
- **The zone wheel** is a wheel rather than a text box with an equals sign, for the same
  reason: a converter that took a local time and a zone description and printed Zulu would
  end objective 4.2 as a skill.

#### The chart

WingBrief cannot ship a Tactical Pilotage Chart, so it draws one. `src/lib/nav/chart.ts`
generates a real **Lambert conformal conic projection** with converging meridians, standard
parallels at 29° and 33°, one nautical mile per minute of latitude ticked up every meridian
with the five- and ten-minute speed marks the guide tells you to count by, and dashed blue
isogonic lines carrying whole-degree variation.

The place names on it are invented, it says so on its face, and no problem depends on it
resembling any published chart. What it does have to be is *correct*: `chart.test.ts`
measures a course between all 190 pairs of features on the sheet, the way a student would
with a plotter against the meridian nearest the midpoint, and asserts the drawing agrees
with the answer-key geometry to better than 1° and half a mile.

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

### Navigation

Navigation's numbers are not indexed at all — the guide publishes answer keys, so every
formula is checked against them rather than asserted.

`src/lib/nav/official-data.ts` transcribes every answer key the trainee guide prints: 25
time problems, 25 speed, 25 distance, 25 fuel consumption, 10 fuel conversions, 10
time-zone conversions, 50 true airspeeds, 50 preflight wind solutions, 47 in-flight wind
solutions, the point-to-point items and the chart legs. `math.test.ts` runs all of it
through the same functions the app grades with and asserts each result lands inside the
tolerance Appendix A allows for that quantity. It is the single most important test in the
repository: a navigation course cannot tolerate a wrong answer key, and the only way to be
sure is to check against the source rather than against my own arithmetic.

Those same published problems then become the drill bank. Generating lookalikes when the
real ones are keyed would have been strictly worse — worse provenance, worse coverage of
the awkward cases the course deliberately includes, and nothing to check the answers
against.

**One empirical constant.** The CR-3's true-airspeed window treats the temperature you dial
in as an *indicated* reading and removes the ram rise as part of the solution, which is why
a purely static-temperature calculation runs two to three knots fast against the answer key
at every airspeed. `CR3_RECOVERY_FACTOR = 0.76` is not a physical constant; it is the value
that reproduces the official 50-row table most closely, and at it **49 of the 50 published
answers fall inside the ±2 kt** the guide allows. The test asserts exactly that, so the
claim cannot rot.

**Three published answers do not reproduce**, and they are listed in
`SOURCE_DISCREPANCIES` rather than papered over with a loosened tolerance:

| Where | Printed | Computed | Why |
|---|---|---|---|
| 6-4-3 A, item 49 | 865 kt | 847 kt | Mach 1.53. A Mach spiral printed on a plastic wheel is not trustworthy that far supersonic. Every subsonic row in the same table reproduces inside ±2 kt. |
| 6-4-3 B, items 51 and 53 | CAS 166 and 249 | CAS 169 and 245 | These disagree with the 50-row table on the same sheet: the ratios they imply are higher at −15 °C than the table's own rows at +15 °C, which is backwards. The table is larger and self-consistent, so the model follows it. |
| 6-6-3 C, item 6 | 87 NM | 85.4 NM | A CR-3 point-to-point distance is read off a grid ruled at 10 NM per square, so the published answer is a visual estimate good to about half a square. |

None of the three is used as question material anywhere in the course.

**One deliberate departure from textbook physics.** Step 6 of Information Sheet 6-5-2
computes groundspeed as TAS ± the head/tail component and stops there; a strict vector
solution would also shave off the cos(crab) term. At the crab angles this course produces
that is a knot or two, inside the ±1% the CR-3 is read to, and the exam key is built on the
guide's arithmetic. A student who followed a "better" method would be marked wrong on the
real exam, so `math.ts` teaches the course and says so in a comment.

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

429 tests across nine files:

- `lib/mastery.test.ts` — levels, recency weighting, scheduling, readiness, priority
- `lib/scoring.test.ts` — answer serialization, grading of every question type, exam
  scoring, deterministic selection
- `lib/retry-scoring.test.ts` — that a retry cannot cancel a miss
- `lib/merge-progress.test.ts` — cross-device merge, per course
- `lib/aero.test.ts` — the direction and magnitude of every taught relationship
- `lib/nav/math.test.ts` — **every answer key the Navigation trainee guide prints**, run
  through the app's own functions and checked against the tolerance Appendix A allows.
  Several hundred published values; three documented disagreements and no others
- `lib/nav/slide-rule.test.ts` — the simulated CR-3 against the guide's worked examples,
  and against the validated formulas across all 100 published rate problems
- `lib/nav/chart.test.ts` — that the generated Lambert projection inverts, that a minute of
  latitude is a nautical mile everywhere on the sheet, and that a course measured off the
  drawing agrees with the answer-key geometry on all 190 pairs of chart features
- `content/content.test.ts` — curriculum shape, unique ids, referential integrity, question
  wellformedness, concept/EO coverage, and that every diagram, widget and lab referenced by
  content actually exists

---

## Scope

Educational aid only. Not a substitute for official NIFE instruction or NATOPS.
