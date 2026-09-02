# Feature: Unit toggle

**From build-plan:** feature 2
**Status:** verified

## Goal

Let the user work in inches or cm. The app keeps every value in cm internally and
converts only when a number enters or leaves the UI, so no formula ever sees
inches.

This is the first UI feature, so it also stands the app up: the locked theme
tokens move into Tailwind, the Vite starter page goes, and the masthead plus card
shell that features 3 to 9 fill in gets built once, here.

## Design reference

`/prototype` has run, so the mockups are the target, not a screenshot:

- `prototypes/theme.css` - the locked tokens. Source of truth for color, type,
  spacing, radius.
- `prototypes/calculator.html` - the full calculator. The `Units` field at the
  top and the allowance footnote at the bottom are this feature's targets.
- `prototypes/mockup.css` - reference for `.seg.seg-compact` (the toggle),
  `.masthead`, `.card`, `.field`, `.footnote`. Throwaway: reproduce the look with
  utility classes, do not port this file.

## In scope

- Theme tokens ported into an `@theme` block in `src/index.css`.
- Vite starter markup, CSS, and assets removed.
- App shell: masthead (title + tagline) and the paper card.
- `Unit` state, defaulting to `cm`, owned by `App`.
- `UnitToggle` segmented control, matching `.seg.seg-compact`.
- Display-boundary helpers in `src/lib/units.ts` with tests.
- The allowance footnote rendered through those helpers, so the toggle has a real
  converted string to change. It sits in the results block in the mockup, so
  feature 6 would otherwise own it, but it is the only permanent unit-dependent
  string that can exist before the waist input. Bringing it forward proves the
  boundary now without building throwaway UI.

## Out of scope

- Skirt type, length, waist input, results (features 3 to 6). The card holds the
  unit field and the footnote only.
- Zod and validation (feature 7). Nothing here parses user-entered numbers yet.
- Persisting the chosen unit (feature 8). It resets to cm on reload.
- The mobile styling pass (feature 9). Build mobile-first, but the responsive
  audit is its own feature.
- Turning on `strict` in `tsconfig.app.json`, and replacing `public/favicon.svg`.
  Both are open items, neither belongs in this diff.
- Deleting `prototypes/`. They stay until the look is fully built; `/complete`
  discards them later.

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.
   Checkpoints are optional; `/complete` makes the real feature-level commit at the end.

Never accept a step you haven't read. If a diff is too big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - Port the theme and strip the starter** - replace the body of
  `src/index.css` with `@import "tailwindcss"` plus an `@theme` block carrying
  the `theme.css` tokens under Tailwind namespaces (see Data / contracts). Delete
  the starter files listed below, empty `App.tsx` down to a bare `<main>`, and set
  the `index.html` title to `Circle Skirt Calculator`. *Done when:* `npm run dev`
  serves a cream (`#f7f3ec`) page with no Vite starter content and no console
  errors; `src/index.css` contains only the import and the `@theme` block, with no
  unlayered rules left; `npm run build` passes.
- [x] **Step 2 - App shell** - masthead (`h1` "Circle Skirt Calculator" in the
  serif face, tagline "Waist to pattern, in one step.") and the empty card,
  centered in a 560px column, built with utility classes off the new tokens.
  *Done when:* the page matches `prototypes/calculator.html` in the header and
  card area at desktop and 375px width; no hard-coded hex value appears in the
  markup.
- [x] **Step 3 - Display-boundary helpers** - add `toDisplay`, `fromDisplay`,
  `formatMeasurement`, and `unitLabel` to `src/lib/units.ts`, with tests in
  `src/lib/units.test.ts`. *Done when:* `npm test` is green, covering the cases
  named under Testing.
- [x] **Step 4 - UnitToggle component and unit state** - `src/components/UnitToggle.tsx`
  as a controlled segmented control (`Inches` / `cm`), plus `useState<Unit>('cm')`
  in `App` under a `Units` label. *Done when:* clicking a button moves
  `aria-pressed="true"` to it and gives it the surface background, strong border,
  and terracotta bold label; the control is reachable by Tab and operable by
  Enter and Space.
- [x] **Step 5 - Convert at the boundary** - render the allowance footnote under
  the card through `formatMeasurement`, reading `SEAM_ALLOWANCE` and
  `HEM_ALLOWANCE`. *Done when:* with `cm` selected the footnote reads
  "After a 1.5 cm seam allowance, plus 2 cm for the hem."; clicking `Inches`
  changes it to "After a 0.59 in seam allowance, plus 0.79 in for the hem."; and
  back again.

## Files / areas

**Created**

- `src/components/UnitToggle.tsx`

**Changed**

- `src/index.css` - `@theme` block, starter CSS removed
- `src/App.tsx` - shell, unit state, footnote
- `src/lib/units.ts` - boundary helpers
- `src/lib/units.test.ts` - their tests
- `index.html` - page title

**Deleted** (flagged for approval, since none is referenced once the starter page
goes; `blueprint/context/ai-interaction.md` requires clarification before any
deletion, and approving this spec is it)

- `src/App.css`
- `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`
- `public/icons.svg`

## Data / contracts

**Load-bearing.** Features 5 to 8 all consume these, so they get settled here.

`Unit` already exists in `src/types/skirt.ts` as `'cm' | 'in'`. Do not redefine
it, and keep those two literals: feature 8 persists this value verbatim.

New in `src/lib/units.ts`, alongside the existing `inchesToCm` / `cmToInches`:

| Function | Signature | Purpose |
| --- | --- | --- |
| `toDisplay` | `(cm: number, unit: Unit) => number` | cm out to the chosen unit |
| `fromDisplay` | `(value: number, unit: Unit) => number` | user's number in to cm |
| `formatMeasurement` | `(cm: number, unit: Unit) => string` | rounded display string, no unit label |
| `unitLabel` | `(unit: Unit) => string` | `'cm'` or `'in'` |

`formatMeasurement` returns the bare number so the UI can render the label in its
own element, the way the mockup wraps it in `.unit`.

**Rounding, previously an open question, is settled here:** 1 decimal place in
cm, 2 in inches (0.01 in is about 0.25 mm, so inches need the extra digit to stay
as precise as cm), with trailing zeros trimmed so 2 cm renders as `2`, not `2.0`.
Say so if you would rather round up to a safe cutting margin instead; it is
cheaper to change now than after feature 6 reads it.

**Tailwind `@theme` port.** Tokens only generate utilities inside Tailwind's
namespaces, so `theme.css` names are renamed, not pasted:

| `theme.css` | `@theme` | Gives |
| --- | --- | --- |
| `--bg`, `--surface`, `--sunken`, `--border`, `--border-strong` | `--color-*` same names | `bg-bg`, `bg-surface`, `border-border-strong` |
| `--text`, `--muted`, `--faint` | `--color-text`, `--color-muted`, `--color-faint` | `text-muted` |
| `--accent`, `--accent-hover`, `--accent-soft`, `--accent-ink` | `--color-accent*` | `text-accent`, `bg-accent-soft` |
| `--error*`, `--notice*` | `--color-error*`, `--color-notice*` | carried now for features 7 and 8 |
| `--font-serif`, `--font-sans`, `--font-mono` | unchanged | `font-serif`, `font-mono` |
| `--radius-sm`, `--radius`, `--radius-lg` | `--radius-sm`, `--radius-md`, `--radius-lg` | `rounded-md`, `rounded-lg` |
| `--space-1` to `--space-6` | dropped | Tailwind's 4px scale already gives 4/8/12/20/32/48 as `1/2/3/5/8/12` |
| `--measure: 560px` | `--container-measure` | `max-w-measure` |

Keep the hex values exactly as `theme.css` has them.

## Testing

Vitest is configured and `npm test` is declared in `AGENTS.md`, so **the logic
gate is on**: step 3 ships its tests in the same diff. No `Browser tests` command
is declared, so steps 1, 2, 4, and 5 ride on the dev server, a look at the page,
and `npm run build`. Do not add a browser runner mid-feature.

In-scope logic, all in `src/lib/units.test.ts`:

- `toDisplay` / `fromDisplay` - cm passes through untouched; inches convert;
  `fromDisplay(toDisplay(x, 'in'), 'in')` round-trips.
- `formatMeasurement` - `(1.5, 'cm')` is `'1.5'`; `(2, 'cm')` is `'2'`, not
  `'2.0'`; `(1.5, 'in')` is `'0.59'`; `(2, 'in')` is `'0.79'`; `(0, ...)` is `'0'`;
  a value needing rounding lands on the right digit rather than truncating.
- `unitLabel` - both units.

Not tested: `UnitToggle` and `App`. They are components, so per
`coding-standards.md` they ride on browser evidence and the build.

Manual pass for `/check`:

1. `npm run dev`, load the page. Cream ground, serif heading, paper card, no Vite
   starter.
2. `cm` is selected on load.
3. Click `Inches`. The pressed state moves and the footnote reads in inches.
4. Click `cm`. Both go back.
5. Tab to the control and toggle with the keyboard.
6. At 375px width nothing overflows horizontally.

## Notes for the AI

- **Client-only.** No server, no API, no SSR. State is `useState` in `App`.
- **Never convert inside a formula.** `src/lib/skirt.ts` takes cm and returns cm,
  and stays untouched by this feature. Conversion happens only in the render path
  and, later, when reading a user's input.
- **`App` owns the unit state.** `UnitToggle` is controlled, taking `value` and
  `onChange`. Features 3 to 6 will sit beside it under the same owner, so do not
  reach for a store or context.
- **Delete the starter CSS, do not layer over it.** The leftover `h1 { }` in
  `src/index.css` is unlayered and beats every Tailwind utility, which is exactly
  the trap `coding-standards.md` warns about. Anything hand-written that must
  survive goes in `@layer base`.
- **No hex in components.** Every color, font, and radius resolves to a token.
- Buttons carry `type="button"` and `aria-pressed`, matching the mockup.
- No em dashes in code, comments, or commit messages.
