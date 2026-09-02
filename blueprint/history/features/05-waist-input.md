# Feature: Waist input

**From build-plan:** feature 5
**Status:** verified

## Goal

Add the one measurement the whole calculator rests on: waist circumference, typed
into a field that behaves exactly like feature 4's custom length, plus a
collapsible "How to measure your waist" helper so the number the user enters is
the number the maths expects.

This is the second measurement field in the app, so it is also where the draft
plus canonical-cm pattern stops being one-off. The feature extracts that pattern
into a hook and has both fields use it, rather than leaving two hand-written
copies of the unit-conversion logic to drift apart.

Nothing consumes `waistCm` yet. Feature 6 turns it into results.

## Design reference

- `prototypes/calculator.html` lines 47-61 - the waist field: a real
  `<label for="waist">Waist measurement</label>`, the `.input-wrap` with value
  `68` and unit suffix, then the `<details class="helper">` disclosure. Note it
  sits **after** Length, last field in the card.
- `prototypes/calculator-states.html` lines 50-64 - the empty first-visit state:
  placeholder "Enter your waist", disclosure collapsed.
- `prototypes/calculator-states.html` lines 123-128 - the invalid state. **Feature
  7, not this one.** No `is-error` border and no error text here.
- `prototypes/mockup.css` lines 47-56 (`.field > label`), 94-131 (`.input-wrap`,
  already built), 145-167 (`.helper`, `summary`, `.helper .body`). Throwaway
  reference: reproduce with utility classes.

## In scope

- `useMeasurementDraft` - the draft string plus canonical cm pair and its
  unit-change rewrite, extracted from `App` and used by both measurement fields.
- Visible-label support in `MeasurementInput`, so the waist field gets the
  mockup's real `<label for>` instead of a placeholder-only name.
- `WaistInput` - label, measurement field, and the "How to measure your waist"
  disclosure, rendered last in the card.
- `waist` draft state in `App`, defaulting to empty, converted on unit toggle.

## Out of scope

- **Validation** (feature 7). No range check, no `is-error` styling, no "Waist
  must be between 40 and 300 cm." A waist that is empty, zero, negative, or 900
  is held as typed and simply not used yet.
- **Results** (feature 6). `waistCm` is computed and stored in state, and nothing
  reads it. `calculateSkirt` is not called anywhere in this feature, and the
  results block, including its "Enter your waist measurement to see the numbers."
  empty state, is not built here.
- **Persistence** (feature 8). The field is empty on every reload.
- Autofocus on load, and moving focus into the field. A judgement call for the
  feature 9 pass.
- Comma decimal separators. Still deferred to feature 7's input rules.
- Any change to `src/lib/skirt.ts`, `src/lib/units.ts`, `src/lib/constants.ts`,
  or `src/types/skirt.ts`. This feature adds no maths.
- Deleting `prototypes/`. Features 6, 7, and 9 still build against the mockups.

## Build loop

`blueprint/config.json` sets `stepReview: "feature"` with checkpoint commits
disabled:

1. The AI implements steps 1 to 4 in order, running `npm test` after each.
2. It presents one review packet covering all four, with the diffs.
3. You read it and approve, or send it back.

`/complete` makes the single feature commit. If a diff turns out too big to read
in one sitting, the step was too big, so say so and it gets split.

## Build steps

- [x] **Step 1 - `useMeasurementDraft`, with the custom length migrated onto it** -
  new `src/lib/useMeasurementDraft.ts` holding the draft string, the canonical cm
  value, and the two write rules from feature 4 (contract below). Replace
  `customLengthInput` / `customLengthCm` and their two handlers in `App` with one
  call to it. **Pure refactor: no behavior change, no new UI.** *Done when:* every
  custom-length behavior from feature 4 still holds by hand - typing `45.5`
  leaves `45.5` character by character, `18` in inches toggled to cm and back
  returns exactly `18` rather than `17.99`, an empty field and `abc` both survive
  a unit toggle untouched - and `npm test` and `npm run build` are green.
- [x] **Step 2 - visible label in `MeasurementInput`** - add the `showLabel` prop
  (contract below). When true, render the mockup's `.field > label` above the
  input with `htmlFor` wired to a `useId`-generated input id; when false, keep
  today's `aria-label` exactly as it is. *Done when:* the custom length field is
  visually and semantically unchanged (still no visible label, still named
  "Custom length" to a screen reader); no element in the app carries both a
  visible `<label>` and an `aria-label`.
- [x] **Step 3 - `WaistInput` and the waist draft** - new
  `src/components/WaistInput.tsx` rendering `MeasurementInput` with
  `showLabel`, label "Waist measurement", placeholder "Enter your waist"; a second
  `useMeasurementDraft` call in `App`; the field rendered **after**
  `LengthSelector`, and `handleUnitChange` reformatting both drafts. *Done when:*
  the card shows Units, Skirt type, Length, then Waist, with the uppercase muted
  label above an empty field showing "Enter your waist" and the current unit
  suffix; clicking the label focuses the input; typing `68` then clicking
  `Inches` gives `26.77`, and clicking `cm` gives back `68`; typing `27` in
  inches, toggling to cm and back returns exactly `27`; both fields convert on the
  same toggle, neither blanks when empty or unparseable; at 375px nothing
  overflows horizontally.
- [x] **Step 4 - "How to measure your waist" disclosure** - a `<details>` below
  the field, collapsed by default, summary in accent with the bold `?` marker and
  the native triangle suppressed, body in a sunken rounded block. Copy is in
  Data / contracts. *Done when:* the summary sits 8px under the field and reads
  "? How to measure your waist"; clicking it reveals the paragraph and clicking
  again hides it; it is reachable by Tab and toggles with Enter or Space; no
  native disclosure triangle shows in Chrome or Safari; the card's bottom
  footnote is unaffected; `npm run build` passes.

## Files / areas

**Created**

- `src/lib/useMeasurementDraft.ts`
- `src/components/WaistInput.tsx`

**Changed**

- `src/App.tsx` - both drafts through the hook, waist field, unit handler
- `src/components/MeasurementInput.tsx` - `showLabel`

Untouched: `src/lib/units.ts`, `src/lib/skirt.ts`, `src/lib/constants.ts`,
`src/types/skirt.ts`, `src/index.css`, `src/components/SegmentedControl.tsx`,
`src/components/LengthSelector.tsx` (its props do not change).

## Data / contracts

### `useMeasurementDraft`

The load-bearing piece. Feature 4 wrote this rule out in prose and implemented it
once; this makes it the only implementation.

```ts
export function useMeasurementDraft(unit: Unit): {
  /** Exactly what the user typed. The field renders it verbatim. */
  input: string
  /** Canonical value, always cm, never rounded for display. */
  cm: number | null
  /** On every keystroke: store the raw string, re-derive cm. */
  change: (next: string) => void
  /** On a unit change: rewrite the draft from cm, leave cm untouched. */
  reformat: (nextUnit: Unit) => void
}
```

- `change` sets `input` to the raw string and `cm` to
  `fromDisplay(parseMeasurement(next), unit)`, or `null` when it does not parse.
- `reformat` sets `input` to `formatMeasurement(cm, nextUnit)` and touches
  nothing else. **When `cm` is `null` it must leave `input` exactly as it is**,
  never `''` or `'0'`.
- `reformat` takes the next unit as an argument rather than reading the hook's
  `unit`, because `App` calls it from the same handler that calls `setUnit`, and
  the new unit is not in scope for this render yet.
- It must never parse the string it just wrote. Re-deriving `cm` from the rounded
  display string is the precision drift feature 4 documented at length, and the
  `27` in / `68` cm round trips in step 3 are there to catch it coming back.

`cm` is the shape `SavedInputs.waist` and `SavedInputs.customLength` want in
`project-overview.md`, so feature 8 persists both directly. Feature 8 will also
need a way to seed a restored value into both halves at once. **Do not add that
now**; it would be dead code today, and it is a one-function addition when
feature 8 arrives.

It lives in `src/lib/` beside the measurement helpers it wraps, not in a new
`src/hooks/` folder, since it is the only hook in the project. Say so if you would
rather start `src/hooks/` here.

> This extraction touches working feature 4 code. It is contained and step 1
> changes no behavior, but if you would rather leave `LengthSelector`'s state
> alone and hand-write a second copy for the waist, say so and step 1 is dropped.

### `MeasurementInput` props

Extends the feature 4 shape by one:

| Prop | Type | Purpose |
| --- | --- | --- |
| `showLabel` | `boolean` (default `false`) | render `label` as a visible `<label for>` instead of an `aria-label` |

The two are exclusive, never both. A visible label plus an `aria-label` gives a
screen reader one name and a sighted user another, and breaks "click the label to
focus the field". Generate the input id with `useId` inside the component; do not
take an `id` prop, since a caller-supplied id is one more thing to keep unique.

Visible label styling, from `.field > label`: `block`, `mb-2`, 13px, semibold,
`tracking-[0.02em]`, `uppercase`, `text-muted`. Identical to the `<span>`
`SegmentedControl` already renders, so the four field labels line up.

### Waist state

**Load-bearing: the waist field starts empty.** Not `0`, not a placeholder
number. Feature 8's fallback for a missing or unparseable stored record must use
the same empty default, and feature 6's empty results state keys off `cm` being
`null`.

### Helper copy

Summary: `How to measure your waist`

Body, from the mockup:

> Measure around the narrowest part of your torso, usually just above the navel.
> Keep the tape snug but not tight, and level all the way around. Measure where
> the skirt will actually sit.

## Testing

`npm test` is declared in `AGENTS.md`, so the logic gate is on. **No step in this
feature adds in-scope logic.** The hook is React state, not a pure function, and
Vitest runs in the node environment with no DOM, so there is nothing to render
against; per `coding-standards.md` component and component-state steps ride on
browser evidence plus the build. The existing suite must stay green through step
1, since it covers the `parseMeasurement` and `formatMeasurement` the hook calls.
If a step surfaces pure logic this spec did not foresee, it ships a test with the
step.

No `Browser tests` command is declared. Do not add a browser runner mid-feature.

Manual pass for `/check`:

1. `npm run dev`. The card reads Units, Skirt type, Length, Waist, then the
   allowance footnote.
2. The waist field is empty, showing "Enter your waist" and suffix `cm`, under an
   uppercase "Waist measurement" label.
3. Click the label. The input takes focus and shows the accent focus ring.
4. Type `68`, then click `Inches`. The field reads `26.77`, suffix `in`. Click
   `cm`: `68`.
5. Clear it, type `27` in inches, toggle to cm and back. It reads exactly `27`,
   not `26.99`.
6. Type `68.5` and watch each keystroke. The field never rewrites itself
   mid-entry, and the `.` survives.
7. Clear the field and toggle units. It stays empty, not `0`. Type `abc` and
   toggle. It stays `abc`.
8. Select Custom length, type `45`, then toggle units. Both fields convert on the
   same click, and neither disturbs the other.
9. Click "How to measure your waist". The paragraph opens in the sunken block;
   click again and it closes. No native triangle is drawn.
10. Tab through the whole card. Every control is reachable in visual order, both
    inputs and the disclosure included, and the disclosure toggles on Enter.
11. At 375px nothing overflows horizontally and the label stays on one line.
12. No console errors. `npm test` and `npm run build` are both green.

## Notes for the AI

- **Client-only.** State stays in `useState` via the hook, owned by `App`. No
  context, no store. `App` holds unit, skirt type, length preset, and two drafts
  after this; that is the crowding point flagged in feature 4, and the hook is the
  answer to it. Do not go further and introduce a form object.
- **Step 1 must not change behavior.** If the migration tempts a fix or a tweak to
  how the custom length behaves, stop and raise it instead.
- **Never convert inside a formula.** `parseMeasurement` returns display units,
  `fromDisplay` converts, and neither `src/lib/skirt.ts` nor `src/lib/units.ts`
  changes here.
- **No validation.** Resist adding a range check, a `min`, or an error message
  while building the field. Feature 7 owns all of it, and a half-version here
  would have to be undone.
- **No hex in components.** `--color-accent`, `--color-accent-hover`,
  `--color-sunken`, `--color-muted`, and `--radius-sm` are all already in the
  `@theme` block. No new tokens.
- The disclosure is a native `<details>`/`<summary>`. Do not hand-roll it with a
  button and `useState`; the native element already gives the keyboard behavior
  and semantics. Suppress the marker with `list-none` plus the
  `::-webkit-details-marker` rule, and add the `?` with a `before:` utility.
- No em dashes in code, comments, or commit messages.
- Commit messages carry no `Co-Authored-By` or `Claude-Session` trailer.
