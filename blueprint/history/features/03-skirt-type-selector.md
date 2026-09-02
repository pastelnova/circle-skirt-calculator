# Feature: Skirt type selector

**From build-plan:** feature 3
**Status:** verified

## Goal

Let the user choose quarter, half, 3/4, or full circle. The engine already knows
what each type means (`CIRCLE_FRACTION` in `src/lib/skirt.ts`); this feature gives
the choice a home in the UI and holds it in `App` state, ready for feature 6 to
read.

It is also the second segmented control on the page, so the button, label, and
group markup that feature 2 wrote inline for the unit toggle gets extracted once,
here, before features 4 and 5 copy it a third and fourth time.

## Design reference

`/prototype` has run, so the mockups are the target:

- `prototypes/theme.css` - the locked tokens, already ported into `@theme` in
  `src/index.css`. No new tokens are needed.
- `prototypes/calculator.html` lines 26-34 - the `Skirt type` field: a full-width
  `.seg` with four equal buttons, `Full` pressed.
- `prototypes/calculator-states.html` - the same field with `Half` and `3/4`
  pressed, confirming the pressed style is identical across positions.
- `prototypes/mockup.css` - reference for `.field`, `.label`, `.seg`. The only
  difference from the unit toggle is `.seg.seg-compact`: the unit control is
  `width: fit-content` with `flex: none` buttons, this one is full width with
  `flex: 1`. Throwaway file: reproduce with utility classes, do not port it.

## In scope

- `SegmentedControl`, a generic controlled component holding the field label, the
  `role="group"` wrapper, and the button styling. Full-width by default, compact
  as a variant.
- `UnitToggle` refactored onto it, rendering identically to today.
- `SkirtTypeSelector`: Quarter / Half / 3/4 / Full.
- `skirtType` state in `App`, defaulting to `'full'`.
- Label-to-group association via `useId` and `aria-labelledby`, which the inline
  markup from feature 2 does not have.

## Out of scope

- **Any use of the selected value.** Nothing calculates or displays yet; the
  waist input is feature 5 and results are feature 6. Selecting a type changes
  the pressed button and nothing else, and that is the whole feature.
- Length selector (feature 4). It is the third `SegmentedControl` consumer, but
  it is its own build-plan item.
- A `Field` wrapper for non-segmented fields. The waist input (feature 5) needs a
  real `<label for>`, not the `<span>` this control renders, so let feature 5
  decide whether the two share anything.
- Zod and validation (feature 7). No user-typed values exist on the page yet.
- Persistence (feature 8). The choice resets to Full on reload.
- The responsive pass (feature 9). Build mobile-first and check 375px, but the
  audit is its own feature.
- Turning on `strict` in `tsconfig.app.json`, and deleting `prototypes/`. Both
  are open items, neither belongs in this diff.

## Build loop

`blueprint/config.json` sets `stepReview: "feature"` with checkpoint commits
disabled, so this is the efficient loop:

1. The AI implements step 1, then step 2, running `npm test` after each.
2. It presents one review packet covering both steps, with the diffs.
3. You read it and approve, or send it back.

`/complete` makes the single feature commit at the end. If a diff turns out too
big to read in one sitting, the step was too big, so say so and it gets split.

## Build steps

- [x] **Step 1 - Extract `SegmentedControl` and move `UnitToggle` onto it** -
  new `src/components/SegmentedControl.tsx` (see Data / contracts for the props),
  rendering the uppercase field label as a `<span>` with a `useId` id, then a
  `role="group" aria-labelledby` wrapper holding one `<button type="button">` per
  option with `aria-pressed`. `compact` reproduces today's unit-toggle sizing
  (`w-fit`, `flex-none`, `min-w-14`); the default is full width (`flex-1`).
  Rewrite `UnitToggle` as a thin wrapper that supplies the `Inches` / `cm`
  options and `compact`, keeping its current props, and move the `Units` label
  out of `App` into it. *Done when:* the page is visually unchanged from before
  the step at desktop and 375px; the unit toggle still moves `aria-pressed` and
  still switches the allowance footnote between cm and inches; the group exposes
  an accessible name of "Units"; `npm test` and `npm run build` pass.
- [x] **Step 2 - `SkirtTypeSelector` and `skirtType` state** - new
  `src/components/SkirtTypeSelector.tsx` supplying the four options in mockup
  order (Quarter, Half, 3/4, Full) under a `Skirt type` label, plus
  `useState<SkirtType>('full')` in `App` and the field rendered under the unit
  field with the mockup's field spacing. *Done when:* four full-width equal
  buttons render with `Full` pressed on load; clicking any of them moves
  `aria-pressed="true"` and the surface background, strong border, and terracotta
  bold label to it; the control is reachable by Tab and operable by Enter and
  Space; at 375px viewport width all four labels sit on one line with no wrapping
  and no horizontal page scroll; `npm run build` passes.

## Files / areas

**Created**

- `src/components/SegmentedControl.tsx`
- `src/components/SkirtTypeSelector.tsx`

**Changed**

- `src/components/UnitToggle.tsx` - becomes a wrapper, owns its own label
- `src/App.tsx` - `skirtType` state, the new field, label markup removed

Untouched: `src/lib/`, `src/types/skirt.ts`, `src/index.css`, `index.html`.

## Data / contracts

`SkirtType` already exists in `src/types/skirt.ts` as
`'quarter' | 'half' | 'threeQuarter' | 'full'`, and `src/lib/skirt.ts` keys
`CIRCLE_FRACTION` off it. Do not redefine or rename it: feature 8 persists these
literals verbatim into local storage.

**Load-bearing: the default is `'full'`.** The mockup shows `Full` pressed, and
feature 8's fallback for a missing or unparseable stored record must use the same
value, or a first visit and a reset visit will disagree.

Display labels are presentation, not data, so they live in
`SkirtTypeSelector`, not in `src/lib/` or the type:

| `SkirtType` | Label |
| --- | --- |
| `quarter` | Quarter |
| `half` | Half |
| `threeQuarter` | 3/4 |
| `full` | Full |

`SegmentedControl` props, generic over the option value so a wrong literal is a
type error rather than a silent no-op:

```ts
interface SegmentedControlProps<T extends string> {
  label: string
  options: readonly { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  compact?: boolean
}
```

`UnitToggle` and `SkirtTypeSelector` keep the same `value` / `onChange` prop
shape they have today, so `App` reads the same way for every field.

## Testing

`npm test` is declared in `AGENTS.md`, so the logic gate is on, but **this
feature adds no logic to `src/lib/`**: it is three components and one piece of
component state. Per the scope rule in `coding-standards.md` those ride on
browser evidence plus the build, so no new test files. The existing suite must
still be green after each step.

No `Browser tests` command is declared in `AGENTS.md`. Do not add a browser
runner mid-feature.

Manual pass for `/check`:

1. `npm run dev`, load the page. Two fields in the card: `Units` (compact, two
   buttons, unchanged from feature 2) and `Skirt type` (full width, four
   buttons).
2. `Full` is pressed on load; `cm` is still pressed on load.
3. Click `Quarter`, `Half`, `3/4`. The pressed state follows each click and only
   one button is ever pressed.
4. Click `Inches`. The footnote still converts, proving step 1 broke nothing.
5. Tab through both controls and press Enter and Space on a button.
6. At 375px width nothing overflows horizontally and no label wraps to a second
   line.
7. No console errors, and `npm run build` passes.

## Notes for the AI

- **Client-only.** No server, no API. State stays in `useState` in `App`; do not
  reach for context or a store, features 4 to 8 sit beside this one under the
  same owner.
- **The selected type feeds nothing yet.** Do not import `calculateSkirt`, and do
  not build a preview, helper line, or diagram that the mockup does not show.
- **No hex in components.** Every color, font, radius, and width resolves to a
  theme token already in `@theme`.
- Buttons carry `type="button"` and `aria-pressed`, matching the mockup. Native
  buttons give Enter and Space for free, so do not add key handlers or roving
  tabindex.
- Keep `aria-pressed` on buttons rather than switching to radios: the mockup, the
  existing toggle, and feature 4's control are all the same pattern, and changing
  it here would leave two idioms on one card.
- `3/4` is the button label. The value stays `threeQuarter`.
- Tailwind v4, utility classes in markup. `@apply` is not needed once the
  markup lives in one component.
- No em dashes in code, comments, or commit messages.
