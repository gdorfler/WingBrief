# WingBrief — Project Brief

Re-read this file at the start of every session. It is the source of truth for
what this project is.

**This project is not Breakfast Ball.** Breakfast Ball is a separate golf app in
a separate repository (`gdorfler/breakfast-ball`) with its own `CLAUDE.md`, its
own Supabase project, and its own design skills (`fairway-design-system`,
`fairway-share-card`). None of that applies here. If a session appears to be
carrying instructions about golf courses, course logging or want-to-play lists,
it is pointed at the wrong project — stop and check the working directory.

## What this is

WingBrief is a study platform for NIFE (Naval Introductory Flight Evaluation)
ground school. Adult military students preparing for a written examination.
Five courses live on one engine:

| id | Course | Identity |
|---|---|---|
| `aero` | Aerodynamics | blue, airflow |
| `engines` | Engines | orange, mechanical |
| `frr` | Flight Rules and Regulations | indigo, procedural |
| `weather` | Weather | teal, atmospheric |
| `nav` | Navigation | emerald, chart and calculation |

## Stack

Next.js (App Router), TypeScript, Tailwind **v4**, `motion/react` for animation,
Supabase for auth and sync, Vitest for tests. Dev server runs on **port 3210**
(see `.claude/launch.json`) — deliberately not 3000, so it cannot collide with
another local project.

## Architecture, and why

- **Content is separate from UI.** Curriculum lives in `src/content/<course>/`
  and never imports from components. One engine hosts every course; adding a
  course means adding an id to `CourseId`, a row in `courses.ts`, a content
  bundle and a palette block — no changes to the learning, review or exam logic.
- **Theming is one attribute.** The active course writes `data-course` on the
  document root and `globals.css` repoints the brand ramp. Anything using
  `text-brand` / `bg-brand` / `--color-brand` re-themes for free. A component
  that needs a *non-active* course's colour must hand the variables down
  itself — see `course-grid.tsx`.
- **Progress is one multi-course document**, flattened to the active course for
  screens (`toView` in `progress-store`). Screens read `state`; only a
  genuinely platform-wide screen reads the whole document via `exportState`.
- **Routing.** `/` is the platform entry and is course-agnostic. `/course` is
  the active course's dashboard and is where Navigation's desk layout and
  Weather's claims layout diverge. `/lessons` is the flight path.

## Design language

Night sky, badge tokens, restrained gamification. Specifics:

- `SkyBackdrop` is the shared background (SVG stars, cloud bank, flight arc),
  re-tinting per course. Pass a `clouds` fraction on tall panels.
- `LessonToken` owns every lesson node's appearance. Faces are a state colour
  mixed into a **dark base**, never into `transparent` — translucent faces turn
  to mud over a warm course theme and the icons stop reading.
- `chunky` is the solid-lip press. Reserved for the primary action on a screen
  and the lesson nodes. Using it everywhere turns the app into a toy.
- Gamification is limited to things that measure real work: streak, XP, level,
  mastery, a single reachable daily goal. **Do not add** chests, timed rewards,
  or leaderboard/percentile claims — two of those would require inventing data
  the app does not have, and all reward opening the app rather than learning.

## Content rules

- **Never surface ACA-prefixed lecture identifiers** (`ACA0101`, `ACA0201`…)
  anywhere a user can see, and do not reintroduce them into content, comments
  or the README. Descriptive chapter titles are fine; the deck codes are not.
  Note `TACAN` contains those letters and is an ordinary navigation term —
  never match on the bare letters, always on the `ACA0NNN` shape.
- Where a source does not state a number, do not invent one. Show relative
  values instead.

## Gotchas found the hard way

- **`@layer base` matters.** Unlayered CSS beats every layered rule regardless
  of specificity, and Tailwind v4 emits utilities into a layer. A bare
  `* { border-color }` silently killed every border-colour utility in the app.
- **Do not gate visibility on `whileInView`.** Its IntersectionObserver does
  not reliably fire on first paint; with `once: true` nothing latches and the
  content stays at opacity 0 until the user happens to scroll.
- **Unit ids are course-scoped** (`u1…` for Aerodynamics, `e1…` for Engines).
  Never hardcode one.
- **`next build` and `next dev` fight over `.next`.** After a production build,
  `rm -rf .next` before starting the dev server or it exits with an EINVAL
  readlink error.
- Timers belong in their own `useEffect`. A timer created in an arbitrary
  callback and cleaned up by an unrelated effect gets cancelled by React Strict
  Mode's mount rehearsal before it fires.

## Before calling anything done

`npx tsc --noEmit`, `npm run lint`, `npx vitest run` (510 tests), and
`npm run build`. Verify UI changes in a browser against seeded progress rather
than an empty account — most of the design only exists once there is data.
