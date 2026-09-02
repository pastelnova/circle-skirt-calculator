# Feature: Responsive layout

**From build-plan:** feature 9
**Status:** verified

## Goal

Make the calculator usable one-handed on a phone at the cutting table or in a
fabric shop. The app already renders at narrow widths without collapsing, so this
is a deliberate pass over the four places that still assume a desktop-width
column: the segmented controls, the results grid, the restored-inputs notice, and
touch target sizes.

This is the last MVP feature and the last one that reads from `prototypes/`.

## Design reference

`prototypes/` is the design source of truth for this feature.

- `prototypes/calculator.html` - the main layout
- `prototypes/calculator-states.html` - empty, error, and restored states
- `prototypes/mockup.css` lines 274-280 - the mobile block this feature ports:

      @media (max-width: 480px) {
        body { padding: var(--space-4) var(--space-3); }
        .card { padding: var(--space-4) var(--space-3); }
        .results { grid-template-columns: 1fr; }
        .seg { flex-wrap: wrap; }
        .seg button { flex: 1 0 40%; }
      }

`prototypes/theme.css` is **already ported** into the `@theme` block in
`src/index.css`. Do not re-port it. The body and card padding lines above are
also already done (`px-3 py-5 sm:px-5 sm:py-12` on `main`, and the matching pair
on the card). What is left is the grid, the segmented controls, and the touch
work the mockup does not cover.

## In scope

- A `480px` breakpoint token, so the mockup's mobile breakpoint exists in the app
  instead of being approximated by Tailwind's `sm:` (640px).
- Segmented controls wrap to two rows below 480px instead of squeezing four
  labels into one line.
- The results grid stacks to one column below 480px.
- The restored-inputs notice wraps instead of crushing its "Start over" button.
- Touch targets reach a comfortable minimum height on coarse-pointer devices,
  without changing the desktop look.
- Verification at 320px, 390px, 480px, and 768px in a real browser.

## Out of scope

- Dark mode. `coding-standards.md` fixes v1 as light only.
- Print styles. Feature 12 (cut sheet export) owns those.
- Any change to copy, labels, validation messages, or calculation output.
- Any change to `src/lib/`. This feature adds no logic.
- Landscape-specific or short-viewport layouts.
- Deleting `prototypes/`. See Notes for the AI.

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.
   Checkpoints are optional; `/complete` makes the real feature-level commit at the end.

`workflow.stepReview` is `feature`, so the four steps run through and land as one
review packet at the end. Never accept a step you haven't read. If a diff is too
big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - add the 480px breakpoint and confirm the page frame** - add
  `--breakpoint-xs: 30rem` to the `@theme` block in `src/index.css`, so the
  mockup's breakpoint is a named token rather than a magic value repeated in
  markup. Then open the app at 320px and confirm the existing `main` and card
  padding already match the mockup's mobile block; change them only if they do
  not. *Done when:* an `xs:` utility compiles and applies at 480px and above, and
  at a 320px viewport the page has no horizontal scrollbar and the card's left
  and right padding is visibly even.

- [x] **Step 2 - wrap the segmented controls** - in `SegmentedControl.tsx`, let
  the non-compact button row wrap below 480px with each button taking roughly
  half the row (`flex: 1 0 40%` in the mockup), returning to a single row at
  `xs:` and up. The `compact` variant (the two-option unit toggle) keeps its
  current fixed-width behavior and must not start wrapping. *Done when:* at 320px
  both four-option groups (Skirt type, Length) show all four labels in full on
  two rows with nothing clipped or overflowing the card, the Units toggle still
  sits on one line at its content width, and at 480px all four options are back
  on a single row.

- [x] **Step 3 - stack the results** - in `ResultsDisplay.tsx`, make the grid
  `grid-cols-1 xs:grid-cols-2`. The caption's `col-span-2` must become
  `col-span-full`, or it will span a column that no longer exists once the grid
  is one wide. *Done when:* at 320px the two result tiles are stacked full-width
  with the caption beneath them, at 480px and up they are side by side as they
  are today, and all three result states render correctly at both widths: the
  `--` placeholder, a valid pair of numbers, and the "Fix the highlighted fields"
  message. Check the widest realistic value (a three-digit number with one
  decimal plus the unit suffix) does not clip in the two-column layout at 480px.

- [x] **Step 4 - touch targets and the restored notice** - raise interactive
  elements to a 44px minimum height under Tailwind's `pointer-coarse:` variant so
  the desktop rendering is untouched: the segmented buttons, the measurement
  input rows, the "How to measure your waist" summary, and "Start over". In
  `RestoredNotice.tsx`, let the row wrap so the sentence and the button stack at
  narrow widths rather than compressing the sentence to one word per line.
  *Done when:* with a coarse pointer emulated at 320px every listed control
  measures at least 44px tall, the restored notice shows its full sentence and a
  reachable "Start over" with no overflow, and with a fine pointer at 1024px
  every control's height is unchanged from before this step.

- [x] **Step 5 - repair the disclosure marker spacing on touch** - `/check`
  found that step 4's `pointer-coarse:flex` makes the `::before` marker a flex
  item, which collapses the trailing space in its `'?_'` content. The label
  renders as `?How to measure your waist` on touch devices only. Restore the gap
  through the flex row rather than the collapsed text node. *Done when:* under an
  emulated coarse pointer the distance from the summary's left edge to the start
  of the label text is within 1px of the fine-pointer value (10.45px), and the
  fine-pointer rendering at 1024px is unchanged.

## Files / areas

| File | Change |
| --- | --- |
| `src/index.css` | Add `--breakpoint-xs: 30rem` to `@theme` |
| `src/components/SegmentedControl.tsx` | Wrapping below `xs`, coarse-pointer height |
| `src/components/ResultsDisplay.tsx` | `grid-cols-1 xs:grid-cols-2`, `col-span-full` |
| `src/components/RestoredNotice.tsx` | Wrapping row, coarse-pointer target |
| `src/components/MeasurementInput.tsx` | Coarse-pointer height on the input row |
| `src/components/WaistInput.tsx` | Coarse-pointer target on the `details` summary |
| `src/App.tsx` | Only if step 1 finds the shell padding wrong |

## Data / contracts

No types, stored shapes, or function signatures change.

One load-bearing addition: **`--breakpoint-xs: 30rem` (480px)** in `@theme`. It
becomes part of the project's design token set alongside the colors and radii, so
later features that need a mobile breakpoint (10, pattern diagram; 12, cut sheet
export) use `xs:` rather than introducing a second, competing value. Tailwind
sorts breakpoints by value, so `xs:` orders correctly before the built-in `sm:`.

## Testing

**No new unit tests.** The test gate in `coding-standards.md` covers pure logic in
`src/lib/`, and this feature adds none. `npm test` must still pass unchanged, and
`npm run build` must pass, but the real evidence here is visual.

Browser evidence is the gate. `AGENTS.md` declares no `Browser tests` command, so
do not install a harness mid-feature; use the dev server and screenshots.

Widths to check, per step:

| Width | Stands for | What must hold |
| --- | --- | --- |
| 320px | iPhone SE, smallest realistic | No horizontal scroll; segmented controls on two rows; results stacked |
| 390px | Common modern phone | Same as 320px, with comfortable spacing |
| 480px | The breakpoint itself | Segmented controls back to one row; results side by side |
| 768px | Tablet and up | Identical to today's desktop rendering |

Also verify, once, across the pass:

- Both restored and fresh first-load states (clear local storage for the second).
- The waist error state at 320px, since the error message adds a line under the
  field.
- Tapping the waist field on a touch emulation does **not** zoom the page. The
  input is already `17px`, above iOS's 16px zoom threshold, so this is a
  regression check, not a change to make.

## Notes for the AI

- Client-only React, no server. Tailwind v4 with CSS-first config: the breakpoint
  goes in the `@theme` block in `src/index.css`, not a `tailwind.config.js`.
- Utility classes in markup only. No inline styles, no hard-coded hex, no new
  `@apply` class unless the same long string genuinely repeats.
- Mobile-first: write the narrow rule as the base and the wide rule under `xs:`,
  not the reverse. That matches the existing `sm:` usage in `App.tsx`.
- Existing responsive work from features 1-8 is already in place (`max-w-measure`,
  `sm:` padding pairs, `min-w-0 flex-1` on the input, the viewport meta tag).
  Extend it; do not rewrite it.
- Tailwind v4.3 supports the `pointer-coarse:` variant. If it does not resolve in
  practice, fall back to applying the minimum height at the base width and
  removing it at `xs:` and up, and say so in the review packet.
- The `--` empty-state placeholder in `ResultsDisplay` is existing UI copy. Leave
  it alone.
- **Ask before deleting `prototypes/`.** `coding-standards.md` says the mockups
  are discarded once the look is built, and this is the last feature that reads
  them, so `/complete` is the natural moment. It is a file deletion, so it needs
  an explicit yes rather than being folded into a build step.
