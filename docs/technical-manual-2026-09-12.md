# Technical manual symbol system — September 12, 2026

WingBrief now uses subject symbols, typography and fine rules as its shared visual language. Every course retains the same warm paper, ink, rust action color and green completion color. Instructional diagram colors remain semantic.

## Changes

- All 162 lessons have subject-specific symbols, including four previously missing Weather marks. The existing symbol library now uses one optical stroke weight, square joins and appropriately scaled Navigation viewboxes. The glyph registry is built once rather than once per lesson row.
- Lesson entries keep their symbol in every state. Completed symbols turn green; text distinguishes mastery, review, completion, new and locked lessons. Displayed figures use current concept mastery. Lesson and unit numbering follows curriculum order.
- The course outline uses a scrolling index with completion counts and an underline that follows the visible unit. Completion is shown as an exact count and one tick per actual lesson.
- Eight recurring technical marks appear in course rows, the course switcher, session headers, exam modes and empty states. Completion screens retain the subject mark without a badge container.
- Exam setup is a ruled vertical menu with settings below, beside a dated score log. The log includes exam mode, actual question count, score and a thin performance rule. The paper scope reflects the active course's units.
- Lesson headers carry real enabling-objective references when available, and segmented screen progress. No publication citations or objective numbers are fabricated.
- Shared structural corners are 2–4 pixels; controls retain usable shapes and focus states. Metadata uses the existing local monospace stack, without a network font dependency. Background grain is almost invisible.

## Validation

- All 564 existing tests pass across 21 files.
- TypeScript, ESLint and the production build pass; all 390 pages generated.
- 60 browser route checks pass across all five courses at 1440, 390 and 320 pixels, with seeded completion/mastery and exam history. No page errors or horizontal page overflow.
- Desktop Home and desktop/mobile Lessons and Exam screenshots were visually inspected.
- Across all five courses, browser interaction checks verify lesson opening and references, unit selection, full-exam timing (including Navigation's 150-minute policy), custom 10-question untimed unit launches, weak-area selection and past-result links. Empty-account exam history, weak-area fallback, zero progress and first-lesson availability also pass.
- Rendered and visually inspected the complete symbol register at normal and 16-pixel sizes.
- A mobile overflow found in course progress ticks was corrected by reducing their spacing in the narrow course column. A short final unit also exposed an index-tracking edge case; reaching the bottom of the page now selects the final unit even when its heading cannot reach the normal reading line.
- QA uses an isolated browser with fabricated progress; no seed data is shipped or written to a user's account.
- Final-unit index tracking passes in every course at desktop width; first/final anchors also pass at 320 pixels. The 320-pixel unit picker, customization controls, untimed custom launch and exam runner fit without overflow.
