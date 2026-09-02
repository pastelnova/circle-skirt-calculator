# Feature: Length selector

**From build-plan:** feature 4
**Status:** verified

## Goal

Let the user pick how long the skirt is: mini, midi, or maxi from the presets in
`LENGTH_PRESETS`, or a custom length they type. Mini/midi/maxi are one more
segmented control, but Custom brings the app's first text input, which is where
the actual work is.

That input has to survive a unit toggle. A measurement field cannot store a
number and reformat it on every keystroke, because typing `45.` would parse to
`45` and eat the decimal point mid-entry. So this feature settles how a
unit-aware input holds its value, and feature 5's waist field follows the same
pattern.

## Design reference

- `prototypes/calculator.html` lines 36-45 - the `Length` field with `Midi`
  pressed and the helper line "Midi falls at 60 cm from the waist."
- `prototypes/calculator-states.html` lines 107-120 - `Custom` pressed, with the
  input revealed below the segmented control at `space-2` (8px) separation,
  placeholder "Custom length", suffix showing the unit.
- `prototypes/calculator-states.html` lines 177-188 - `Custom` with a value
  entered (`45`), confirming the non-error input styling.
- `prototypes/mockup.css` - reference for `.input-wrap`, `.input-wrap input`,
  `.suffix`, `.helper`. Throwaway: reproduce with utility classes.

Note the mockup's `is-error` and `.error-text` styling in the invalid state is
feature 7's, not this one's. Do not build it here.

## In scope

- `LengthSelector`: the four-option segmented control (Mini / Midi / Maxi /
  Custom) reusing `SegmentedControl`, plus whatever appears below it.
- The preset helper line, unit-aware, rendered for mini/midi/maxi only.
- `MeasurementInput`: the `.input-wrap` widget (mono tabular input plus unit
  suffix), revealed when Custom is selected.
- `parseMeasurement` in `src/lib/units.ts`, with tests: the string-to-number
  boundary that every measurement field needs.
- `lengthPreset` state in `App`, defaulting to `'midi'`, plus the custom length
  draft string and its canonical cm value.
- Rewriting the custom draft into the new unit when the unit toggle changes,
  without losing precision.

## Out of scope

- **Validation and error styling** (feature 7). No `is-error` border, no
  "Enter a custom length." message, no range checks. A custom length that is
  empty, negative, or absurd is simply held as typed for now.
- **Anything consuming the length.** No calculation and no results; those are
  features 5 and 6. Selecting Maxi changes the helper line and nothing else.
- Comma decimal separators (`45,5`). `parseMeasurement` rejects them as
  unparseable for now. It is a one-line change if you want it, but it belongs
  with feature 7's input rules rather than being smuggled in here. Say so if you
  would rather have it now.
- Moving focus into the custom input when Custom is selected. Not in the mockup,
  and auto-focus is a judgement call better made in the feature 9 pass.
- Persistence (feature 8). The preset resets to Midi and the custom draft clears
  on reload.
- Extracting a shared field wrapper. `SegmentedControl` renders its own label;
  the waist field in feature 5 needs a real `<label for>`. Let feature 5 decide
  whether they share anything.
- Deleting `prototypes/`. Features 5, 6, and 9 still build against the mockups.

## Build loop

`blueprint/config.json` sets `stepReview: "feature"` with checkpoint commits
disabled:

1. The AI implements steps 1 to 4 in order, running `npm test` after each.
2. It presents one review packet covering all four, with the diffs.
3. You read it and approve, or send it back.

`/complete` makes the single feature commit. If a diff turns out too big to read
in one sitting, the step was too big, so say so and it gets split.

## Build steps

- [x] **Step 1 - `parseMeasurement`** - add it to `src/lib/units.ts` beside
  `fromDisplay`, with tests in `src/lib/units.test.ts`. Signature and contract
  are in Data / contracts. *Done when:* `npm test` is green, covering every case
  named under Testing, including the `Infinity` and `NaN` string rejections.
- [x] **Step 2 - `LengthSelector` with presets only** - new
  `src/components/LengthSelector.tsx` rendering a `SegmentedControl` labelled
  `Length` with the four options, plus the helper line below it for
  mini/midi/maxi, built from `LENGTH_PRESETS` through `formatMeasurement`. Add
  `useState<LengthPreset>('midi')` in `App`. Selecting Custom renders no helper
  and, for this step only, nothing else. *Done when:* the page shows the Length
  field under Skirt type with `Midi` pressed and "Midi falls at 60 cm from the
  waist."; clicking `Mini` and `Maxi` changes it to 40 cm and 95 cm; clicking
  `Inches` changes the same line to 23.62 in; clicking `Custom` removes the
  helper line entirely; at 375px all four labels sit on one line with no
  horizontal page scroll.
- [x] **Step 3 - `MeasurementInput` and the custom draft** - new
  `src/components/MeasurementInput.tsx` matching `.input-wrap`, plus
  `customLengthInput` (string) and `customLengthCm` (`number | null`) state in
  `App`, both written on every keystroke, rendered by `LengthSelector` only when
  `lengthPreset === 'custom'`. *Done when:* selecting Custom reveals the input
  8px below the control with placeholder "Custom length" and the current unit as
  its suffix; typing `45.5` leaves exactly `45.5` in the field, one character at
  a time, with no reformatting mid-entry; the field is reachable by Tab and has
  an accessible name of "Custom length"; switching away to Midi and back to
  Custom preserves what was typed.
- [x] **Step 4 - Convert the draft on unit change** - replace the bare `setUnit`
  in `App` with a handler that rewrites `customLengthInput` from
  `customLengthCm` through `formatMeasurement`, leaving `customLengthCm` itself
  untouched. *Done when:* with Custom selected and `45` typed in cm, clicking
  `Inches` changes the field to `17.72` and the suffix to `in`, and clicking `cm`
  returns it to `45`; typing `18` in inches then toggling to cm and back returns
  exactly `18`, not `17.99`, proving the canonical value was not re-derived from
  the rounded display string; an empty field and an unparseable field (`abc`) are
  both left exactly as they are rather than being blanked or turned into `0`;
  `npm run build` passes.

## Files / areas

**Created**

- `src/components/LengthSelector.tsx`
- `src/components/MeasurementInput.tsx`

**Changed**

- `src/lib/units.ts` - `parseMeasurement`
- `src/lib/units.test.ts` - its tests
- `src/App.tsx` - `lengthPreset` and `customLengthInput` state, the unit-change
  handler, the new field

Untouched: `src/lib/skirt.ts`, `src/lib/constants.ts`, `src/types/skirt.ts`,
`src/index.css`, `src/components/SegmentedControl.tsx`.

## Data / contracts

`LengthPreset` already exists in `src/types/skirt.ts` as
`'mini' | 'midi' | 'maxi' | 'custom'`, and `LENGTH_PRESETS` in
`src/lib/constants.ts` holds the three preset values in cm. Do not redefine
either. `LENGTH_PRESETS` deliberately has no `custom` key, so read it only in the
preset branch.

**Load-bearing: the default is `'midi'`**, matching the mockup, and feature 8's
fallback for a missing stored record must use the same value.

### How a measurement field holds its value

**Two pieces of state, with one rule about which is written when.** This is the
load-bearing part of the feature, and feature 5's waist field copies it exactly.

| State | Type | Role |
| --- | --- | --- |
| `customLengthInput` | `string` | exactly what the user typed; the field renders it verbatim |
| `customLengthCm` | `number \| null` | the canonical value, always cm, never rounded for display |

- **On every keystroke:** set the draft to the raw string, and set
  `customLengthCm` to `fromDisplay(parseMeasurement(draft), unit)`, or `null`
  when the draft does not parse.
- **On a unit change:** rewrite the draft to
  `formatMeasurement(customLengthCm, newUnit)` and leave `customLengthCm`
  untouched. When it is `null`, leave the draft alone too.

Storing only a number and rendering `formatMeasurement` back into the field
breaks typing outright: `45.` parses to `45` and renders as `45`, deleting the
decimal point the user just pressed. That is why the draft exists.

Storing only the draft looks simpler but loses precision on every unit toggle,
because the rewritten string is rounded to display precision and the next toggle
reads that rounded string back. Typing `18` in inches gives 45.72 cm, which
renders as `45.7`, which converts back to `17.99`. The user's number decays just
because they looked at it in the other unit. Keeping the unrounded cm value out
of the display path is what stops that, and it is why the round trip in step 4's
done-when is worth checking.

`customLengthCm` is also exactly the shape `SavedInputs.customLength` wants in
`project-overview.md`, so feature 8 persists it directly. The display unit never
changes what gets stored.

### `parseMeasurement`

```ts
/** A string the user typed, to a number in the unit they typed it in. */
export function parseMeasurement(input: string): number | null
```

- Trims, and returns `null` for empty or whitespace-only input.
- Returns `null` for anything `Number()` cannot turn into a finite number, so
  `abc`, `45abc`, `Infinity`, and `NaN` all give `null`.
- Returns the number otherwise, **including negatives and zero**. Its one job is
  "is this a number at all". Range and sign are feature 7's rules, and putting
  them here would leave two places deciding what a valid measurement is.
- It returns the value in the unit the user typed. Converting to cm stays with
  `fromDisplay`, so the existing boundary is not duplicated.

### `MeasurementInput` props

Only what this feature needs. Feature 5 extends it for the waist field.

| Prop | Type | Purpose |
| --- | --- | --- |
| `value` | `string` | the draft, rendered verbatim |
| `onChange` | `(value: string) => void` | raw string out, no parsing |
| `unit` | `Unit` | drives the suffix |
| `placeholder` | `string` | mockup text |
| `label` | `string` | the accessible name, via `aria-label` |

`type="text"` with `inputMode="decimal"`, per the mockup. Not `type="number"`:
it brings spinners, silently discards invalid input so the draft cannot be shown
back to the user, and would fight feature 7's error message.

The mockup labels this field with a placeholder alone, which leaves it unnamed
for a screen reader once text is typed. `label` closes that without changing the
visual design.

## Testing

`npm test` is declared in `AGENTS.md`, so the logic gate is on. **Step 1 is the
only logic-bearing step** and ships its tests in the same diff. Steps 2 to 4 are
components and component state, which per `coding-standards.md` ride on browser
evidence plus the build.

No `Browser tests` command is declared. Do not add a browser runner mid-feature.

New cases in `src/lib/units.test.ts`, all for `parseMeasurement`:

| Input | Expected | Why |
| --- | --- | --- |
| `'45'` | `45` | the ordinary case |
| `'45.5'` | `45.5` | decimals |
| `' 45 '` | `45` | trimmed |
| `'0'` | `0` | zero is a number; feature 7 rejects it, not this |
| `'-5'` | `-5` | same |
| `'45.'` | `45` | mid-typing state must not throw |
| `''` | `null` | empty |
| `'   '` | `null` | whitespace only, not `0` |
| `'abc'` | `null` | not a number |
| `'45abc'` | `null` | must not be a lenient `parseFloat` that returns `45` |
| `'Infinity'` | `null` | never let it reach a calculation |
| `'NaN'` | `null` | same |

Manual pass for `/check`:

1. `npm run dev`. The card shows Units, Skirt type, then Length with `Midi`
   pressed and "Midi falls at 60 cm from the waist."
2. Click Mini, then Maxi. The helper reads 40 cm, then 95 cm.
3. Click Inches. The helper converts, and so does the allowance footnote.
4. Click Custom. The helper is replaced by the input, suffix `in`.
5. Type `18`, click cm. The field reads `45.7`, the suffix reads `cm`. Click
   Inches again: it reads `18`, not `17.99`.
6. Type `45.5` fresh in cm and watch each keystroke. The field never rewrites
   itself while typing.
7. Clear the field, toggle units. It stays empty, not `0`.
8. Type `abc`, toggle units. It stays `abc`.
9. Tab through the whole card. Every control is reachable, the input included.
10. At 375px nothing overflows horizontally.
11. No console errors, and `npm run build` passes.

## Notes for the AI

- **Client-only.** State stays in `useState` in `App`. Do not reach for context
  or a store; features 5 to 8 sit beside these under the same owner.
- **`App` now owns five pieces of state.** That is still fine. If it starts to
  feel crowded at feature 6, that is a conversation, not a mid-feature refactor.
- **Never convert inside a formula.** `parseMeasurement` returns display units;
  `fromDisplay` converts. `src/lib/skirt.ts` stays untouched.
- **The unit handler must not blank the draft.** `customLengthCm` being `null`
  means leave `customLengthInput` exactly as it is. Rewriting it to `''` or `'0'`
  would destroy what the user typed on an accidental toggle.
- **Never feed the display string back into the canonical value.** The unit
  handler reads `customLengthCm` and writes the draft. It must not parse the
  draft it just wrote, or the rounding drift described above comes straight back.
- **No hex in components.** The `@theme` block already carries every token this
  needs, `--color-faint` for the placeholder and `--font-mono` for the value
  included. No new tokens.
- Reuse `SegmentedControl` as-is. If it needs a change to fit, stop and say so
  rather than forking it.
- No em dashes in code, comments, or commit messages.
- Commit messages carry no `Co-Authored-By` or `Claude-Session` trailer.
