# Minimalist UI refresh

The study home now emphasizes the next lesson, a short daily plan, and areas to review. A compact course outline replaces the illustrated lesson route, and secondary desktop navigation sits under Study resources. Progress, mastery, locked lessons, and Navigation's practical tools remain available.

The shared palette uses warm paper, dark ink, rust actions, and muted course accents. Headings use a restrained serif; cards, badges, and controls have simpler borders and fewer effects. Instructional diagrams retain meaningful success, caution, and warning colors.

Browser verification exposed two additional issues: long formulas and Navigation review cards could widen a 320-pixel page, and immediate navigation could interrupt the debounced course-selection save. Formulas now scroll within their container, grids can shrink, and page exit flushes pending progress to the local cache.

## Validation

- 564 tests passed across 21 files with `npm test -- --maxWorkers=2`. Two workers avoid intermittent cold-import timeouts on the local Windows workspace.
- TypeScript, ESLint, and the production build passed; 390 pages generated.
- 105 browser route checks passed across all five courses at 1440, 390, and 320 pixels, using isolated seeded progress. No page errors or page overflow. Course selection survived immediate full navigation; current and locked lesson states and expandable resources behaved correctly.
- The guided lesson passed again at 1280 and 390 pixels, including keyboard exploration, reduced motion, a wrong-answer retry, six saved attempts, reload persistence, and next-lesson unlocking. Perfect completion earned 125 XP; the retry case earned 91 XP. No page errors.
- Desktop home and mobile home/outline screenshots were visually reviewed.
