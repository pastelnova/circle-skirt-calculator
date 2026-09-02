# Feature: Input validation

**From build-plan:** feature 7
**Status:** verified

## Goal

Stop bad measurements before they reach the calculation engine. Waist and custom
length are the only two numbers the user types, and both can be empty, zero,
negative, non-numeric, or absurd. This feature validates them with Zod at the
form boundary, shows an inline message beside the offending field, and holds the
results at their empty state until every field is valid.

The engine is already correct for valid input. This is about never handing it
input it cannot be correct about, and never showing a plausible-looking number
derived from a 400 cm waist.

## Design reference

The look is already locked, so no new tokens are needed.

- `prototypes/calculator-states.html`, the **Invalid** section: error field
  styling, error text with its `!` marker, and the results footnote in the
  invalid state.
- `prototypes/mockup.css`, `.input-wrap.is-error` and `.error-text`: exact border,
  background, focus ring, and type treatment.
- `src/index.css` already carries `--color-error`, `--color-error-soft`, and
  `--color-error-border` in `@theme`. Use those tokens, do not add new ones.

## In scope

- Zod installed as a runtime dependency, first use in the project.
- Bound constants in cm for waist and custom length.
- `src/lib/validation.ts`: one exported validator covering both fields, with the
  user-facing message text.
- Error affordance in `MeasurementInput`: error styling, message, `aria-invalid`,
  and `aria-describedby`.
- `touched` tracking, so a field the user has not typed in yet is not scolded on
  first paint.
- Results held at `--` while any field is invalid, with the invalid footnote.
- Unit-aware messages: bounds are stated in the unit currently selected.

## Out of scope

- Local storage restore (feature 8). This feature only makes the validator that
  feature 8 will run restored values through.
- The mobile styling pass (feature 9).
- User-configurable allowances (feature 13).
- Validating skirt type and length preset. Both are closed sets driven by
  segmented controls, so there is no invalid value to reach.
- A submit button, disabled states, or form-level submission. Recalculation stays
  live.
- Comma decimal separators (`45,5`). They currently fail as "Enter a number.",
  which is honest but not friendly. Locale-aware parsing is a later decision.
- Replacing `src/types/skirt.ts` with Zod-derived types. The existing hand-written
  types stay; only the new validation shapes are Zod's.

## Decisions this spec makes

Flag these in review if you disagree, because they are baked into the messages.

| Bound | Value (cm) | Where it comes from |
| --- | --- | --- |
| `WAIST_MIN_CM` | 40 | The mockup's error copy states 40 to 300 cm |
| `WAIST_MAX_CM` | 300 | Same, and the project plan's example of unreasonable |
| `CUSTOM_LENGTH_MIN_CM` | 10 | New. `project-overview.md` lists custom length bounds as an open question |
| `CUSTOM_LENGTH_MAX_CM` | 200 | New. Longer than a maxi at the tallest, short of nonsense |

Two more calls worth naming:

- **Empty is treated differently per field.** An untouched waist field is not an
  error, it is the app's starting state. An empty custom length *is* an error the
  moment Custom is selected, because selecting Custom is itself the user asserting
  a length exists. That matches the mockup, which shows the error on an empty
  custom field.
- **Range is checked in cm, messages are printed in the display unit.** Comparing
  in cm avoids rounding twice. The inch messages therefore read "between 15.75
  and 118.11 in", which is exact rather than tidy. Rounding those to whole inches
  would make the message disagree with the check.

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.
   Checkpoints are optional; `/complete` makes the real feature-level commit at the end.

Never accept a step you haven't read. If a diff is too big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - the validator, no UI** - install Zod, add the four bound
  constants to `src/lib/constants.ts`, and write `src/lib/validation.ts` with the
  `MeasurementValidation` contract below plus its Zod schemas. Ship
  `src/lib/validation.test.ts` in the same diff.
  *Done when:* `npm test` is green with new cases for empty string,
  whitespace-only, `abc`, `45abc`, `0`, `-5`, below min, above max, exactly min,
  exactly max, and a valid mid-range value, each run in both cm and inches so the
  conversion is inside the assertion; `npx tsc -b` is clean; the running app is
  visibly unchanged because nothing imports the module yet.

- [x] **Step 2 - waist errors on screen** - add an optional `error` prop to
  `MeasurementInput` (error border, error background, error focus ring, `!`-marked
  message, `aria-invalid`, `aria-describedby`), add `touched` to
  `useMeasurementDraft`, wire the waist field in `App`, gate the result on
  validation, and add the invalid footnote to `ResultsDisplay`.
  *Done when:* in the browser, with cm selected, typing `400` turns the waist
  field red, shows "Waist must be between 40 and 300 cm.", drops both tiles to
  `--`, and prints "Fix the highlighted fields to see the numbers."; typing `abc`
  shows "Enter a number."; clearing the field after typing shows "Enter your
  waist measurement."; typing `80` clears the error and brings the numbers back;
  toggling to inches while `400` is in the field rewrites it to `157.48` and the
  message becomes "Waist must be between 15.75 and 118.11 in"; a freshly loaded
  page shows no error text at all.

- [x] **Step 3 - custom length errors** - validate the custom length field on the
  same contract and pass its error into `LengthSelector`.
  *Done when:* selecting Custom with the field empty shows "Enter a custom
  length." and holds the results at `--`; typing `5` shows "Length must be
  between 10 and 200 cm."; typing `55` clears the error and computes; switching
  back to Midi clears the error and computes even though the custom field still
  holds `5`; the waist error from step 2 still behaves as it did.

## Files / areas

| File | Change |
| --- | --- |
| `package.json` | Zod added to `dependencies` |
| `src/lib/constants.ts` | Four bound constants, in cm, SCREAMING_SNAKE_CASE |
| `src/lib/validation.ts` | New. Zod schemas plus `validateMeasurement` |
| `src/lib/validation.test.ts` | New. Covers the validator |
| `src/lib/useMeasurementDraft.ts` | `touched` added to the draft |
| `src/components/MeasurementInput.tsx` | Optional `error` prop, styling, a11y wiring |
| `src/components/WaistInput.tsx` | Passes `error` through |
| `src/components/LengthSelector.tsx` | Passes `customLengthError` through |
| `src/components/ResultsDisplay.tsx` | `hasErrors` prop selects the footnote |

`hasErrors` means "an error message is visible right now", not "some validation
failed". An untouched empty waist is not an error, so a page where only the
custom length is complaining still shows "Fix the highlighted fields", while a
page where nothing has been typed shows the original empty-state sentence.
| `src/App.tsx` | Runs both validators, gates the result, distributes errors |

`src/lib/skirt.ts` is deliberately untouched. Its non-positive guards in
`toSkirtInput` stay as a safety net behind the new validation layer.

## Data / contracts

**Load-bearing for feature 8.** Saved inputs will read cm values out of local
storage and must run them back through this same validator, because stored data
can be stale, hand-edited, or written by an older version of the app. Lock these
now.

```ts
// src/lib/validation.ts
export type MeasurementField = 'waist' | 'customLength'

export type MeasurementValidation =
  | { status: 'empty'; message: string }
  | { status: 'valid'; cm: number }
  | { status: 'invalid'; message: string }

export function validateMeasurement(
  input: string,
  field: MeasurementField,
  unit: Unit,
): MeasurementValidation
```

- `input` is the raw string the user typed, in the display unit, never pre-parsed.
- `status: 'empty'` still carries a message, so all user-facing copy lives in one
  module. The caller decides whether an empty field is currently an error.
- `status: 'valid'` carries cm, so callers never re-convert.
- Zod does the work inside: a string schema that trims, parses, converts to cm,
  and range-checks, with `error` params carrying the messages. Zod 4 syntax:
  messages pass as a string or `{ error: '...' }`, and `safeParse` returns
  `{ success, data, error }` with the text at `error.issues[0].message`.
- The exact schema composition is the implementer's call. The exported contract
  and the message strings are not.

Message copy, exactly:

| Case | Waist | Custom length |
| --- | --- | --- |
| Empty | `Enter your waist measurement.` | `Enter a custom length.` |
| Not a number | `Enter a number.` | `Enter a number.` |
| Zero, negative, or out of range | `Waist must be between {min} and {max} {unit}.` | `Length must be between {min} and {max} {unit}.` |

Bounds in the message go through `formatMeasurement`, so they follow the unit
toggle. Zero and negative values share the range message rather than getting
their own: the range statement is already true and actionable for them.

**Draft contract change:**

```ts
export interface MeasurementDraft {
  input: string
  cm: number | null
  touched: boolean   // true once change() has run at least once
  change: (next: string) => void
  reformat: (nextUnit: Unit) => void
}
```

## Testing

`AGENTS.md` declares `npm test` (Vitest), so the logic gate is on. It declares no
`Browser tests` command, so UI claims ride on direct browser evidence plus the
build.

- **Step 1 is the logic-bearing step** and ships `src/lib/validation.test.ts` in
  the same diff. In-scope: `validateMeasurement` across both fields, both units,
  and every case listed in the step's done-when. Assert the returned `status` and
  the message text, not just that something failed, since the copy is the
  contract.
- **Steps 2 and 3 are UI.** No unit tests. Verify in the browser at
  `npm run dev`, against the done-whens, then `npm run build` and `npx tsc -b`.
- Boundary values matter more than the middle: test exactly `40` and exactly
  `300` as valid, and `39.9` and `300.1` as invalid.
- Test at least one inch case where the display value is valid but the cm value
  is not, or the reverse, so the conversion is genuinely covered rather than
  incidentally passing.

## Notes for the AI

- Client-only, no server, no auth. Everything runs in the browser.
- Zod install is its own deliberate step, inside step 1, never a mid-step silent
  add. It is a runtime `dependency`, not a devDependency.
- Keep the Zod schemas in `src/lib/` beside the logic they guard, per
  `coding-standards.md`.
- `MeasurementInput` is already `type="text"` on purpose, so the user's bad value
  can be shown back to them beside the message. Do not change it to
  `type="number"`.
- A visible label and an `aria-label` must never both be set on the same field.
  The existing `showLabel` logic already handles this, so extend it rather than
  reworking it.
- No hard-coded hex. Error colors resolve to the `--color-error*` tokens already
  in `@theme`.
- Never render `NaN`, `Infinity`, or `undefined`. An invalid field means the
  tiles read `--`, not a computed number.
- Invalid input is a normal state, not an exception. The rest of the UI stays
  usable, and the segmented controls keep working while a field is in error.
- No em dashes in code, comments, or copy.
- Comment the why, not the what. The existing comments in `units.ts` and
  `useMeasurementDraft.ts` are the density to match.
