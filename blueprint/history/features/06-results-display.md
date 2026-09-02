# Feature: Results display

**From build-plan:** feature 6
**Status:** verified

## Goal

Show the two numbers the whole app exists to produce: the **cut radius** to draw
on the fabric and the **fabric length** to buy, live in the selected unit, with an
empty state until there is enough input to compute them.

This is the first feature that calls `calculateSkirt`. Features 1 to 5 built the
engine and every input around it; nothing has ever rendered a result. It also
settles which radius the user sees, which is the difference between a skirt that
fits and cut fabric that cannot be uncut.

## Design reference

- `prototypes/calculator.html` lines 63-75 - the `.results` block: two tiles in a
  two-column grid, footnote spanning both, separated from the fields by a top
  border.
- `prototypes/calculator-states.html` lines 66-78 - the empty state: both tiles
  `is-empty` showing `--`, footnote "Enter your waist measurement to see the
  numbers."
- `prototypes/calculator-states.html` lines 199-211 - a filled state.
- `prototypes/calculator-states.html` lines 131-143 - the invalid state.
  **Feature 7, not this one.** Its "Fix the highlighted fields to see the
  numbers." footnote is not built here.
- `prototypes/mockup.css` lines 179-227 - `.results`, `.result`, `.name`,
  `.value`, `.unit`, `.is-empty`, `.footnote`. Throwaway: reproduce with utility
  classes.

> **The mockup's numbers are wrong. The calculation contract wins.**
> `calculator.html` shows a 68 cm full circle midi as radius `10.6` and fabric
> `72.6`. The correct values are `9.3` and `145.6`. Their `72.6` is a single
> radius span (`10.6 + 60 + 2`), which is exactly the under-reporting failure
> mode `project-overview.md` settled against: fabric length spans the full
> circle, so it is `2 x (R + L + hem)`. Their `10.6` does not match `R` (`10.8`)
> or `Rcut` (`9.3`) either. The mockups were drawn before those decisions. Copy
> their **layout**, never their **arithmetic**.

## In scope

- `formatResult` - fixed-decimal display formatting for a result number.
- `toSkirtInput` - assembles a valid `SkirtInput` from form state, or `null` when
  the input is not yet complete enough to compute.
- `ResultsDisplay` - the two-tile grid, the unit-suffixed values, the empty
  state, and the allowance footnote.
- Moving the allowance footnote out of `App` and into the results block, where
  the mockup puts it.
- Live recalculation on every input change, with no Calculate button.

## Out of scope

- **Validation** (feature 7). No error styling, no messages, no range checks, and
  not the invalid-state footnote copy. An out-of-range waist such as `900`
  computes and displays here; feature 7 is what stops it.
- **Persistence** (feature 8) and the "Restored your last measurements." notice
  in the mockup's third state.
- **The pattern diagram** (feature 10). No SVG, no circles.
- **A third number.** `SkirtResult` also carries `waistRadiusCm` (the finished
  radius) and `skirtLengthCm`. Neither gets a tile. The mockup has two.
- **Rounding up to a safe cutting margin.** `project-overview.md` lists this as
  open. Results round to the nearest display unit, not up. The fabric figure is
  already generous, since it spans the full circle for every skirt type.
- **An `aria-live` region.** Reasoning in Notes for the AI; revisit in feature 9.
- Deleting `prototypes/`. Features 7 and 9 still build against the mockups.

## Build loop

`blueprint/config.json` sets `stepReview: "feature"` with checkpoint commits
disabled:

1. The AI implements steps 1 to 4 in order, running `npm test` after each.
2. It presents one review packet covering all four, with the diffs.
3. You read it and approve, or send it back.

`/complete` makes the single feature commit. If a diff turns out too big to read
in one sitting, the step was too big, so say so and it gets split.

## Build steps

- [x] **Step 1 - `formatResult`** - add it to `src/lib/units.ts` beside
  `formatMeasurement`, reusing the module's `DECIMALS`, with tests in
  `src/lib/units.test.ts`. Contract below. *Done when:* `npm test` is green over
  every case in the Testing table, including `15` cm rendering as `"15.0"` rather
  than `formatMeasurement`'s trimmed `"15"`.
- [x] **Step 2 - `toSkirtInput`** - add it to `src/lib/skirt.ts` with tests in
  `src/lib/skirt.test.ts`. It is the gate that decides whether there is a result
  at all. Contract below. *Done when:* `npm test` is green, covering a null
  waist, a zero and a negative waist, `custom` with a null and with a
  non-positive custom length, `custom` with a real length, and each of the three
  presets ignoring the custom value entirely.
- [x] **Step 3 - `ResultsDisplay`, empty state only** - new
  `src/components/ResultsDisplay.tsx` rendering the two-column grid, both tiles
  showing `--` in faint with the unit suffix, and the footnote spanning both
  columns. Move the allowance footnote out of `App` into this component, keeping
  its exact current wording, and give the block the top border and 32px
  separation the mockup has. Render it with `result={null}` for this step only.
  *Done when:* the card shows two sunken tiles under a hairline border, named
  "Cut radius" and "Fabric length", each reading `--` with a `cm` suffix, above
  the footnote "Enter your waist measurement to see the numbers."; `App` no
  longer renders the allowance paragraph itself and no longer imports
  `SEAM_ALLOWANCE` or `HEM_ALLOWANCE`; at 375px the two tiles still sit side by
  side with no horizontal page scroll.
- [x] **Step 4 - Wire the real numbers** - `App` derives
  `toSkirtInput(...)` then `calculateSkirt(...)` on render and passes
  `SkirtResult | null` down; `ResultsDisplay` renders values through
  `formatResult` and swaps the footnote back to the allowance sentence whenever
  there is a result. *Done when:* with `cm`, Full, Midi and a waist of `68`, the
  tiles read exactly `9.3 cm` and `145.6 cm`; clicking `Inches` gives `3.67 in`
  and `57.34 in` with no other input change; switching to Quarter changes the cut
  radius to `41.8 cm`; clearing the waist returns both tiles to `--` and the
  footnote to the empty-state copy; selecting Custom with an empty custom length
  also returns the empty state, and typing `45` there brings the numbers back;
  the numbers update as each character is typed, with no Calculate button;
  `npm test` and `npm run build` are green.

## Files / areas

**Created**

- `src/components/ResultsDisplay.tsx`

**Changed**

- `src/lib/units.ts` - `formatResult`
- `src/lib/units.test.ts` - its tests
- `src/lib/skirt.ts` - `toSkirtInput`
- `src/lib/skirt.test.ts` - its tests
- `src/App.tsx` - derives the result, renders `ResultsDisplay`, drops the
  standalone footnote and the two allowance imports

Untouched: `src/lib/constants.ts`, `src/lib/useMeasurementDraft.ts`,
`src/types/skirt.ts`, `src/index.css`, and every existing component.

## Data / contracts

### Which radius the user sees

**The tile shows `cutRadiusCm`, labelled "Cut radius".** Decided in this feature,
and load-bearing for feature 10's diagram and feature 12's cut sheet.

The mockup labels it "Waist radius", and that label is being changed
deliberately. The footnote under it already says "After a 1.5 cm seam
allowance", so the mockup's own copy implies the allowance is applied; a tile
labelled "Waist radius" showing an allowance-adjusted number would be a trap. The
cut radius is what gets drawn on fabric, so it is the number that prevents a
ruined cut.

`waistRadiusCm`, the finished radius, stays computed and unshown. Nothing needs a
change in `src/lib/skirt.ts` beyond the new adapter.

### `formatResult`

```ts
/** A result number in the display unit, at fixed precision. */
export function formatResult(cm: number, unit: Unit): string
```

- `toDisplay(cm, unit).toFixed(DECIMALS[unit])`, so cm keeps 1 decimal and
  inches keep 2. Reuse the existing private `DECIMALS`; do not redeclare it.
- **Trailing zeros are kept**, unlike `formatMeasurement`. `15` renders as
  `"15.0"`. The tiles use `tabular-nums` at 30px, so a trimmed value would break
  the digit alignment between the two tiles. This is the reason both functions
  exist rather than one taking a flag.
- It returns the number only. `ResultsDisplay` renders the unit in its own
  `<span>`, matching `.value .unit` in the mockup.

### `toSkirtInput`

```ts
export function toSkirtInput(state: {
  waistCm: number | null
  skirtType: SkirtType
  lengthPreset: LengthPreset
  customLengthCm: number | null
}): SkirtInput | null
```

Returns `null`, meaning "show the empty state", when:

| Condition | Why |
| --- | --- |
| `waistCm` is `null` | nothing typed, or the field does not parse |
| `waistCm <= 0` | see the note below |
| `lengthPreset === 'custom'` and `customLengthCm` is `null` | the length is missing |
| `lengthPreset === 'custom'` and `customLengthCm <= 0` | same reason as the waist |

Otherwise it returns the discriminated `SkirtInput` from `src/types/skirt.ts`,
attaching `customLengthCm` only in the `custom` branch. That type already makes
a custom skirt without its length unconstructable, so this function is where the
runtime check that satisfies it lives.

**On the non-positive check.** This is not validation, and feature 7 still owns
all of it. It is the minimum needed to stop this feature from rendering nonsense
on its own: a waist of `0` gives a `0.0 cm` cut radius, and a waist of `-10`
gives a plausible-looking `120.8 cm` fabric length beside a `0.0` radius, which
`coding-standards.md` rules out. Feature 6 makes those cases silently empty;
feature 7 replaces the silence with "Waist must be between 40 and 300 cm." Do not
add a range, a maximum, or a message here.

### `ResultsDisplay` props

| Prop | Type | Purpose |
| --- | --- | --- |
| `result` | `SkirtResult \| null` | `null` renders the empty state |
| `unit` | `Unit` | drives `formatResult` and the suffix |

No other props. The component does no arithmetic and never calls
`calculateSkirt`; `App` hands it a finished result. That keeps the maths in
`src/lib/` and out of a component, per `coding-standards.md`.

### Copy

| Slot | With a result | Empty |
| --- | --- | --- |
| Tile 1 name | `Cut radius` | same |
| Tile 2 name | `Fabric length` | same |
| Values | `9.3` + `cm` | `--` + `cm`, in `--color-faint` |
| Footnote | `After a 1.5 cm seam allowance, plus 2 cm for the hem.` | `Enter your waist measurement to see the numbers.` in `--color-faint` |

The allowance sentence keeps its current live-formatted form, so it tracks the
constants and the unit rather than hard-coding `1.5` and `2`.

### Layout, from `.results` and `.result`

| Element | Utilities |
| --- | --- |
| Block | `mt-8 grid grid-cols-2 gap-3 border-t border-border pt-8` |
| Tile | `rounded-md bg-sunken p-5` |
| Tile name | `mb-2 text-[12px] font-semibold tracking-[0.04em] text-muted uppercase` |
| Value | `font-mono text-[30px] leading-[1.1] tabular-nums`, `text-accent` or `text-faint` |
| Unit span | `ml-1 text-[15px] text-muted` |
| Footnote | `col-span-2 text-[13px]`, `text-muted` or `text-faint` |

`mt-8`/`pt-8` are 32px, matching `--space-5`, and reproduce the separation the
standalone footnote has in `App` today.

## Testing

`npm test` is declared in `AGENTS.md`, so the logic gate is on. **Steps 1 and 2
are the logic-bearing steps** and each ships its tests in the same diff. Steps 3
and 4 are components and rendering, which per `coding-standards.md` ride on
browser evidence plus the build. No `Browser tests` command is declared; do not
add a browser runner mid-feature.

`formatResult`, in `src/lib/units.test.ts`:

| Input | Expected | Why |
| --- | --- | --- |
| `10.8225`, `cm` | `'10.8'` | ordinary rounding |
| `15`, `cm` | `'15.0'` | the trailing zero survives, unlike `formatMeasurement` |
| `0`, `cm` | `'0.0'` | not `'0'` |
| `145.645`, `cm` | `'145.6'` | the real fabric figure |
| `9.3225`, `in` | `'3.67'` | converts, then two decimals |
| `10`, `in` | `'3.94'` | same |

`toSkirtInput`, in `src/lib/skirt.test.ts`:

| Case | Expected |
| --- | --- |
| waist `null` | `null` |
| waist `0`, waist `-10` | `null` |
| `custom` with `customLengthCm: null` | `null` |
| `custom` with `customLengthCm: 0` or `-5` | `null` |
| `custom` with `45` | input with `lengthPreset: 'custom'` and `customLengthCm: 45` |
| `midi` with `customLengthCm: 99` | input with no `customLengthCm` key |
| each of `mini`, `midi`, `maxi` | passes through with the given waist and type |

Worth one end-to-end assertion in `skirt.test.ts`: `toSkirtInput` for a 68 cm
full-circle midi, fed to `calculateSkirt`, gives `cutRadiusCm` about `9.32` and
`fabricLengthCm` about `145.65`. That pins the numbers the mockup gets wrong.

Manual pass for `/check`:

1. `npm run dev`. Below the waist field sit two tiles reading `--`, and the
   footnote reads "Enter your waist measurement to see the numbers."
2. Type `68` in the waist field. The tiles fill in as you type and settle on
   `9.3 cm` and `145.6 cm`, and the footnote becomes the allowance sentence.
3. Click `Inches`: `3.67 in` and `57.34 in`. Click `cm`: back to `9.3` and
   `145.6`.
4. Click `Quarter`: the cut radius jumps to `41.8 cm`. Click `Full` again.
5. Click `Maxi`: the fabric length rises to `215.6 cm`. Back to `Midi`.
6. Click `Custom` with an empty length: both tiles return to `--`. Type `45`:
   `9.3 cm` and `115.6 cm`.
7. Clear the waist field: `--` again. Type `abc`: still `--`, no `NaN` anywhere.
8. Type `0`, then `-5`: both leave the tiles empty rather than showing `0.0`.
9. At 375px the two tiles stay side by side and nothing overflows.
10. No console errors. `npm test` and `npm run build` are both green.

## Notes for the AI

- **Derive, do not store.** The result is computed during render from existing
  state. No `useState` for it, no `useEffect`, no recalculation trigger. If it
  ever gets slow enough to matter, that is a `useMemo` conversation, not a
  cache.
- **The component does no maths.** `App` calls `toSkirtInput` and
  `calculateSkirt`; `ResultsDisplay` formats what it is handed. Do not import
  `calculateSkirt` into a component.
- **Copy the mockup's layout, not its numbers.** See the boxed warning under
  Design reference. If a rendered figure disagrees with the mockup, the mockup
  is what is wrong.
- **Never render `NaN`.** Every path into a tile goes through a non-null
  `SkirtResult`, and the `toSkirtInput` gate is what guarantees it. Do not add a
  defensive `isNaN` in the component; fix the gate if something slips through.
- **No `aria-live` on the results.** The numbers change on every keystroke, and a
  polite live region would announce a partial value after each character. Doing
  it properly means debouncing and a considered announcement, which belongs in
  the feature 9 accessibility and responsive pass. Noted here so it is a decision
  rather than an oversight.
- **No hex in components.** `--color-sunken`, `--color-accent`, `--color-muted`,
  `--color-faint`, `--color-border`, and `--radius-md` are all in the `@theme`
  block already. No new tokens.
- Two tiles is a list, so render them from a small local array rather than
  copying the markup twice. It stays one file; no separate `ResultTile`
  component for two entries.
- **`App` gets shorter, not longer.** The footnote and its two constant imports
  leave. Do not introduce a form-state object or a context while touching it.
- No em dashes in code, comments, or commit messages.
- Commit messages carry no `Co-Authored-By` or `Claude-Session` trailer.
