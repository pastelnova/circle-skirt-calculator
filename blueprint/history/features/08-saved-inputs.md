# Feature: Saved inputs

**From build-plan:** feature 8
**Status:** verified

## Goal

Remember the last-used form values in local storage and restore them on the next
visit, so a sewist who comes back to check a number does not retype their waist
every time. A restored session says so, with one click to start fresh.

Nothing is stored on a server and nothing identifies anyone. This is one record
in the visitor's own browser.

## Design reference

- `prototypes/calculator-states.html`, the **Restored** section: the notice bar
  above the card contents, its copy, and the Start over control.
- `prototypes/mockup.css`, `.notice` and `.notice button`: layout, colors, and
  the underlined text button.
- `src/index.css` already carries `--color-notice`, `--color-notice-soft`, and
  `--color-notice-border` in `@theme`. Use those, do not add new tokens.

Keep `prototypes/` after this feature. Feature 9 still needs the mockups for the
responsive pass.

## In scope

- One local storage record holding unit, skirt type, length preset, waist, and
  custom length.
- Writing it whenever the form changes.
- Reading and restoring it on load, before first paint.
- Rejecting a missing, unparseable, or invalid record and falling back to
  defaults.
- The restored notice and its Start over control.

## Out of scope

- Cross-tab sync via the `storage` event. Two open tabs will fight, last write
  wins, and that is acceptable for a single-page calculator.
- Migrating records written by an older version. The key is versioned instead, so
  a future shape change ignores old records rather than upgrading them.
- Remembering anything but the five form values: no scroll position, no
  "how to measure" panel state, no results (they are derived, never stored).
- Server-side or cross-device persistence. There is no backend.
- The responsive pass (feature 9).

## Decisions this spec makes

| Decision | Value | Why |
| --- | --- | --- |
| Storage key | `circle-skirt-calculator:v1` | The version segment is the migration path: a later shape change bumps to `:v2` and old records are simply never read |
| Measurements stored | cm, always | `project-overview.md` locks this. A unit toggle then never rewrites stored data |
| Invalid record | dropped whole, defaults used | `project-overview.md` says treat a missing, unparseable, or partial record as absent. All-or-nothing keeps the rule one line instead of a per-field salvage policy |
| Waist and custom length | nullable in the record | The one refinement to the documented shape. Without it, the unit toggle could not be remembered until a valid waist existed |
| What gets written | validated cm only | The draft's parsed cm has no range check. Writing only validated values is what makes "a restored record is valid by construction" true |
| Notice lifetime | until Start over or the first edit | It explains why the fields are pre-filled. Once the visitor changes something, it is describing a state that no longer exists |
| A default record | never written | Otherwise the write effect fires on mount for a visitor who typed nothing, and their next visit is greeted by "Restored your last measurements." over an empty form |

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.
   Checkpoints are optional; `/complete` makes the real feature-level commit at the end.

Never accept a step you haven't read. If a diff is too big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - the storage module, no UI** - write `src/lib/storage.ts` with the
  key, the `SavedInputs` contract below, a Zod schema, the pure
  `parseSavedInputs` / `serializeSavedInputs` pair, and the thin
  `readSavedInputs` / `writeSavedInputs` / `clearSavedInputs` wrappers that touch
  `localStorage` inside try/catch. Ship `src/lib/storage.test.ts` in the same
  diff.
  *Done when:* `npm test` is green with new cases for `null`, `''`, `not json`,
  `[]`, `{}`, an unknown `skirtType`, a waist outside the feature 7 bounds, a
  waist sent as a string, null measurements, unknown extra keys, and a valid full
  record; plus one case where the storage object itself throws and the reader
  returns `null` instead of propagating; `npx tsc -b` clean; the app is visibly
  unchanged because nothing imports the module yet.

- [x] **Step 2 - write on change** - call `writeSavedInputs` from `App` whenever
  the form state changes, building the record from the validation results rather
  than the raw drafts.
  *Done when:* in the browser, after choosing Inches, 3/4, Custom, a custom
  length of `18` and a waist of `28`,
  `localStorage.getItem('circle-skirt-calculator:v1')` returns a record whose
  `unit` is `in`, `skirtType` is `threeQuarter`, `lengthPreset` is `custom`, and
  whose `waist` and `customLength` are the cm equivalents (71.12 and 45.72), not
  the typed inches; typing a waist of `4` (below the minimum) writes `waist:
  null` rather than the out-of-range number; a reload still shows an empty form,
  because nothing reads the record yet. Loading the page and touching nothing
  leaves `localStorage.getItem('circle-skirt-calculator:v1')` as `null`: a record
  identical to the defaults is not worth writing, and writing one would fake a
  return visit for someone who never entered anything.

- [x] **Step 3 - restore on load** - give `useMeasurementDraft` an optional
  initial cm value, read the record once in a lazy `useState` initializer in
  `App`, and seed all five values from it.
  *Done when:* with the record from step 2 in place, a reload shows Inches, 3/4,
  Custom, `18`, and `28` already filled in, with the results computed and no
  error text anywhere; hand-editing the stored JSON to an invalid `skirtType` and
  reloading gives the default empty form instead of a crash; clearing the key and
  reloading gives the default empty form.

- [x] **Step 4 - the restored notice** - add the notice bar with Start over,
  shown only when this load actually restored a record.
  *Done when:* a reload with a stored record shows "Restored your last
  measurements." above the Units control, styled per the mockup; clicking Start
  over empties every field, returns the controls to cm / Full / Midi, removes the
  notice, and leaves `localStorage.getItem('circle-skirt-calculator:v1')` as
  `null`; changing any field also removes the notice without clearing storage; a
  first visit with no stored record never shows the notice.

## Files / areas

| File | Change |
| --- | --- |
| `src/lib/storage.ts` | New. Key, schema, parse/serialize, read/write/clear |
| `src/lib/storage.test.ts` | New. Covers the parser and the throwing-storage fallback |
| `src/lib/useMeasurementDraft.ts` | Optional initial cm value, plus a reset |
| `src/components/RestoredNotice.tsx` | New. The notice bar and its Start over button |
| `src/App.tsx` | Reads once on load, writes on change, owns the notice and Start over |

## Data / contracts

**Load-bearing.** This is the only persisted shape in the project, and it is what
a future `:v2` would be measured against.

```ts
// src/lib/storage.ts
export const SAVED_INPUTS_KEY = 'circle-skirt-calculator:v1'

export interface SavedInputs {
  unit: Unit
  skirtType: SkirtType
  lengthPreset: LengthPreset
  /** cm, or null when the field is empty or currently invalid. */
  waist: number | null
  /** cm, or null. Legitimately null even when lengthPreset is 'custom'. */
  customLength: number | null
}

export function parseSavedInputs(raw: string | null): SavedInputs | null
export function serializeSavedInputs(inputs: SavedInputs): string
export function readSavedInputs(): SavedInputs | null
export function writeSavedInputs(inputs: SavedInputs): void
export function clearSavedInputs(): void
```

- Field names follow `project-overview.md` (`waist`, `customLength`), which
  documents both as cm.
- The Zod schema range-checks `waist` and `customLength` against the same
  `WAIST_*` and `CUSTOM_LENGTH_*` constants feature 7 uses, so a hand-edited or
  stale record cannot smuggle in a value the form would have rejected.
- Unknown keys are stripped, not rejected. Zod's object schemas already do this,
  and a record written by a later version should degrade rather than explode.
- `parseSavedInputs` and `serializeSavedInputs` are pure and take no storage
  dependency. That is deliberate: Vitest runs in the node environment with no
  `localStorage`, and adding jsdom mid-feature is not this feature's job.
- Every function that touches `localStorage` wraps it in try/catch and behaves
  correctly with no stored value, per `coding-standards.md`. A browser with site
  data blocked gets a working calculator that simply forgets.

**Draft contract change:**

```ts
export function useMeasurementDraft(
  unit: Unit,
  initialCm?: number | null,
): MeasurementDraft
```

- The initial value seeds both `input` (through `formatMeasurement`) and `cm`.
- `touched` stays `false` on a restored value. Safe, because an invalid record
  never restores, so there is nothing to warn about before the user types.
- The draft also gains a `reset()` for Start over, clearing input, cm, and
  touched together.

## Testing

`AGENTS.md` declares `npm test` (Vitest), so the logic gate is on. It declares no
`Browser tests` command, so UI claims ride on direct browser evidence plus the
build.

- **Step 1 is the logic-bearing step** and ships `src/lib/storage.test.ts` in the
  same diff. In-scope: `parseSavedInputs` across every malformed shape listed in
  its done-when, and a round-trip through `serializeSavedInputs`.
- Cover the range check explicitly: a record whose `waist` is 400 must be
  rejected, because that is the case where storage and feature 7 could otherwise
  disagree.
- Test the throwing-storage path by stubbing the global with
  `vi.stubGlobal('localStorage', ...)`. That needs no jsdom and no new
  dependency.
- **Steps 2, 3, and 4 are UI and integration.** No unit tests. Verify in the
  browser at `npm run dev` against the done-whens, reading and hand-editing
  `localStorage` from the console, then `npm run build` and `npx tsc -b`.

## Notes for the AI

- Client-only, no server, no auth.
- Read the record **once**, in a lazy `useState` initializer, not in an effect.
  An effect would paint the empty defaults first and then visibly overwrite them.
- Write in a `useEffect` keyed on the values that make up the record, so the
  write follows the state that caused it.
- Initialize the `unit` state from the record **before** the draft hooks are
  called. They format their initial input string with the unit they are handed,
  so a draft seeded while `unit` is still the default would show a cm number
  under an "in" label.
- Do not store derived values. `waistRadius` and `fabricLength` are computed on
  every render and must stay that way.
- Do not install jsdom or change the Vitest environment. The module is shaped so
  the logic is testable without it.
- Reuse the feature 7 bound constants rather than restating the numbers.
- No hard-coded hex. The notice resolves to the `--color-notice*` tokens.
- No em dashes in code, comments, or copy.
- Comment the why, not the what. `units.ts` and `useMeasurementDraft.ts` set the
  density.
