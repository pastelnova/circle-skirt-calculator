# Build Plan

## Pre-build setup

Not features, so they are not numbered or spec'd through `/feature`. Do these
before Feature 1.

- Vitest, via `/tests`. Feature 1 is the calculation engine, so the runner needs
  to exist first for the engine to ship with its tests.
- Tailwind CSS, installed and configured, with one styled element confirmed
  rendering before real UI is built on top of it.

## MVP

- [x] 1. **Calculation engine** - pure functions in `src/lib/` for waist radius and fabric length across all four skirt types, cm internally, seam and hem allowance as named constants. No UI.
- [x] 2. **Unit toggle** - inches/cm switch, with conversion at the input and output boundary only.
- [x] 3. **Skirt type selector** - quarter, half, 3/4, full circle.
- [x] 4. **Length selector** - mini, midi, and maxi presets plus a custom override.
- [ ] 5. **Waist input** - measurement field with a short "how to measure your waist" helper.
- [ ] 6. **Results display** - waist radius and total fabric length in the selected unit.
- [ ] 7. **Input validation** - Zod schema for waist and custom length: empty, zero, negative, and out-of-range values.
- [ ] 8. **Saved inputs** - persist last-used values to local storage and restore them on reload.
- [ ] 9. **Responsive layout** - mobile-first styling pass so the calculator is usable at the cutting table.

## Post-MVP

- [ ] 10. **Pattern diagram** - SVG of two concentric circles drawn to scale.
- [ ] 11. **Size presets** - XS/S/M/L/XL as an alternative to manual waist entry.
- [ ] 12. **Cut sheet export** - printable or downloadable summary.
- [ ] 13. **Adjustable allowances** - user-configurable seam allowance and waistband style.
