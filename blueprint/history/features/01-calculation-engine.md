# Feature: Calculation engine

**From build-plan:** feature 1
**Status:** verified

## Goal

Pure TypeScript functions in `src/lib/` that turn a waist measurement, skirt
type, and skirt length into the numbers a sewist cuts from: the finished waist
radius, the cut waist radius, and the fabric length to buy. No UI.

This is the feature the whole product rests on. Every later feature is input
collection or presentation around these functions, so the contracts defined here
are load-bearing and the edge cases are worth getting right once.

## Design reference

None. This feature renders nothing.

`prototypes/theme.css` and the mockups stay untouched. Porting those tokens into
the Tailwind `@theme` block belongs to the first feature that renders UI, not
this one.

## In scope

- Shared types for skirt type and unit
- Named allowance constants and the length presets
- Finished waist radius for all four skirt types
- Cut waist radius, with the seam allowance applied to the radius
- Fabric length to buy, spanning the full circle
- One entry point that takes the inputs and returns all three results
- Unit tests for every function above

## Out of scope

- Any React component, and any change to `App.tsx` or the stylesheets
- Zod validation. The engine trusts its inputs; Feature 7 guards the boundary
- Reading or writing local storage
- Formatting for display, including decimal places and unit suffixes
- Converting between cm and inches beyond what `src/lib/units.ts` already does

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.
   Checkpoints are optional; `/complete` makes the real feature-level commit at the end.

Never accept a step you haven't read. If a diff is too big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - types and constants** - add `src/types/skirt.ts` with the
  `SkirtType`, `Unit`, and `LengthPreset` unions, and `src/lib/constants.ts` with
  `SEAM_ALLOWANCE` (1.5), `HEM_ALLOWANCE` (2), and `LENGTH_PRESETS`
  (`mini` 40, `midi` 60, `maxi` 95), all in cm.
  *Done when:* `npx tsc -b` passes and both modules export the named values, with
  every measurement commented as cm.

- [x] **Step 2 - finished waist radius** - add `waistRadius(waistCm, skirtType)`
  to `src/lib/skirt.ts`, covering all four types through a single fraction
  lookup rather than four branches.
  *Done when:* `npm test` passes with cases for each type. A 68cm waist gives
  10.82 full, 14.43 three-quarter, 21.65 half, and 43.29 quarter, each to two
  decimal places.

- [x] **Step 3 - cut radius and fabric length** - add `cutRadius(radiusCm)` and
  `fabricLength(radiusCm, skirtLengthCm)` to the same module.
  *Done when:* `npm test` passes. `cutRadius(10.82)` returns 9.32 with a 1.5cm
  seam allowance, and `fabricLength(10.82, 60)` returns 145.64 with a 2cm hem.

- [x] **Step 4 - the entry point** - add `calculateSkirt(input)` returning
  `SkirtResult`, resolving a length preset or custom length into centimetres.
  *Done when:* `npm test` passes for a preset input and a custom-length input,
  and `npm run build` and `npm run lint` are both clean.
  Note: end-to-end fabric length is `145.6451`, not the `145.64` in Step 3.
  Step 3 feeds `fabricLength` a radius already rounded to 2dp; here it gets the
  full-precision radius, and doubling amplifies the difference past a 2dp
  tolerance. Assert this one to 3dp.

## Files / areas

- `src/types/skirt.ts` - new. Shared unions
- `src/lib/constants.ts` - new. Allowances and length presets
- `src/lib/skirt.ts` - new. The engine
- `src/lib/skirt.test.ts` - new. Its tests
- `src/lib/units.ts` - existing, untouched. Conversion is a caller's concern;
  the engine never sees inches

## Data / contracts

**Load-bearing.** Features 3 through 9 all consume these shapes, so changing them
later means touching every one.

```ts
type SkirtType = 'quarter' | 'half' | 'threeQuarter' | 'full'
type Unit = 'cm' | 'in'
type LengthPreset = 'mini' | 'midi' | 'maxi' | 'custom'

// Discriminated on lengthPreset: a custom skirt cannot be constructed without
// its length, so the engine has no missing-value case to handle at runtime.
type SkirtInput = {
  waistCm: number
  skirtType: SkirtType
} & (
  | { lengthPreset: 'mini' | 'midi' | 'maxi' }
  | { lengthPreset: 'custom'; customLengthCm: number }
)

interface SkirtResult {
  waistRadiusCm: number     // finished, what the seamline sits on
  cutRadiusCm: number       // what you actually cut
  fabricLengthCm: number    // what you buy
  skirtLengthCm: number     // resolved from the preset or the custom value
}
```

The field names match the `SavedInputs` record in the project overview, but the
shapes are not identical: `SavedInputs` always carries a `customLength`, while
`SkirtInput` only admits one for a custom skirt. Feature 8 reads the looser
stored record and narrows it into this type, which is the right place for that
seam.

Every number in and out is centimetres. The type names say so, and no function
here accepts or returns inches.

## Testing

`npm test` is declared in `AGENTS.md`, so the gate is on and every step above is
logic-bearing. Each step ships its tests in the same diff.

Because the engine returns unrounded numbers, assert with
`expect(x).toBeCloseTo(expected, 2)` rather than `toBe`. Floating point makes an
exact match on `10.82` fail.

Coverage to write:

- `waistRadius` for all four skirt types
- `cutRadius` for the ordinary case
- `fabricLength` for a preset length and a custom length
- `calculateSkirt` end to end, once per length branch

Degenerate inputs, each with a named test:

| Input | Expected |
| --- | --- |
| `waistCm` of 0 | All radii 0, no throw, no `NaN` |
| Waist small enough that seam allowance exceeds the radius | `cutRadiusCm` clamps to 0, never negative |
| Skirt length of 0 | Fabric length still positive, from the radius alone |

Not tested here: anything React, and anything to do with display formatting.
There is nothing to click through, so verification is `npm test`, `npm run build`,
and `npm run lint`.

## Notes for the AI

- Read the **Calculation contract** in `blueprint/context/project-overview.md`
  before writing a formula. It is the authority, and it changed recently:
  seam allowance applies to the radius, and fabric length spans the full circle.
- Everything is cm. Never accept inches into these functions.
- Keep the four skirt types as a fraction lookup keyed by `SkirtType`, so adding
  a type later is a data change rather than a new branch.
- Return raw unrounded numbers. Rounding is a display concern and is still an
  open question in the overview; deciding it here would leak presentation into
  the engine.
- Allowances come from `constants.ts`. No numeric literals in the formulas
  beyond the mathematical constants themselves.
- **`cutRadius` can go negative** on a small waist with a large seam allowance.
  Clamp at 0 and let Feature 7 decide what to tell the user. Do not throw.
- The `LENGTH_PRESETS` values are a starting point, not a researched standard.
  They are trivial to change in `constants.ts` once real garments are measured.
- These are pure functions with no side effects, no I/O, and no React imports.
