# Circle Skirt Calculator - Project Overview

<!-- blueprint:source-hash bcc8ee4b385d6b4515a1915086063a306a73bd5ccc4155668e6c8e380f020357 -->

> A client-side calculator that turns a waist measurement into circle skirt
> pattern numbers: waist radius and total fabric length.

## Problem

Sewists planning a circle skirt have to derive the waist radius and fabric
length by hand, working through pi, seam and hem allowances, and inch/cm
conversions. The geometry is simple but easy to get wrong, and a wrong radius
means cut fabric that cannot be uncut. Doing it manually also slows down the
planning stage of a project.

## Users

Hobbyist and semi-professional sewists who want accurate pattern measurements
without doing the geometry themselves.

There is one user type and no access tiers. Nobody signs in; every visitor gets
the same calculator. Returning visitors are recognized only by what their own
browser has in local storage.

## Features

MVP, in build-plan order. Feature 1 is the headline: everything else is input
and presentation around it.

1. **Calculation engine** (headline) - pure functions that convert waist,
   skirt type, and length into a waist radius and fabric length. No UI.
2. **Unit toggle** - lets the user work in inches or cm.
3. **Skirt type selector** - quarter, half, 3/4, or full circle.
4. **Length selector** - mini, midi, maxi presets, or a custom length.
5. **Waist input** - the one measurement the calculation needs, with guidance on
   how to take it.
6. **Results display** - shows radius and fabric length in the selected unit.
7. **Input validation** - rejects empty, zero, negative, and out-of-range values
   before they reach the engine.
8. **Saved inputs** - restores the last-used form values on return visits.
9. **Responsive layout** - makes the calculator usable on a phone at the cutting
   table or fabric store.

Post-MVP, tracked but not built: pattern diagram (10), size presets (11), cut
sheet export (12), adjustable allowances (13).

Pre-build setup, not features: Vitest via `/tests`, then Tailwind CSS. Both
precede Feature 1.

## Data model

No database and no server. Persisted state is a single local storage record of
the last-used form values, written on change and read on load.

### SavedInputs (local storage, one record)

- `unit` (`'in' | 'cm'`) - the display unit; does not affect stored values
- `skirtType` (`'quarter' | 'half' | 'threeQuarter' | 'full'`) - selected type
- `lengthPreset` (`'mini' | 'midi' | 'maxi' | 'custom'`) - which length mode
- `customLength` (number, cm) - used only when `lengthPreset` is `'custom'`
- `waist` (number, cm) - waist circumference

> Lock this shape before Feature 8. Store every measurement in cm regardless of
> the display unit, so a unit change never rewrites stored data. Treat a missing,
> unparseable, or partial record as absent and fall back to defaults.

### Derived values (never stored)

- `waistRadius` (number, cm) - computed from waist and skirt type
- `fabricLength` (number, cm) - computed from radius, skirt length, hem allowance

### Constants (code, not user data until Feature 13)

- `SEAM_ALLOWANCE` (number, cm)
- `HEM_ALLOWANCE` (number, cm)

## Calculation contract

This is the correctness requirement the whole project rests on, and it binds
every feature that touches a number.

**All internal math runs in cm.** Convert on input, convert on output, never mix
units inside a formula.

With `C` as waist circumference in cm after seam allowance is applied:

| Skirt type | Waist radius |
| --- | --- |
| Full circle | `R = C / (2π)` |
| 3/4 circle | `R = (4/3 × C) / (2π)` |
| Half circle | `R = (2 × C) / (2π)` |
| Quarter circle | `R = (4 × C) / (2π)` |

Fabric length: `F = R + skirtLength + hemAllowance`

Seam and hem allowance are named constants, not literals scattered through the
code.

> TODO: the project plan says `C` is the waist circumference "after seam
> allowance subtracted," but a seam allowance is normally added at the cut edge.
> Settle the sign before Feature 1; it changes every output.

## Tech stack

- **React 19 + TypeScript** - UI and type safety
- **Vite** - dev server and build. No SSR; this is a pure client-side app
- **Tailwind CSS** - styling. Not yet installed; a pre-build step
- **Zod** - input validation at the form boundary. Not yet installed; arrives
  with Feature 7
- **Vitest** - unit tests for the calculation engine. Not yet installed; a
  pre-build step
- **ESLint (flat config)** - linting. Already configured

Source layout: `src/components/` for UI, `src/lib/` for calculation, conversion,
validation, and storage helpers, `src/types/` for shared types.

## Monetization

Not in v1. The project plan defines no monetization.

## UI/UX

Single-page app, one calculator view. No routing in v1, so there are no routes to
enumerate.

- Recalculation is live or near-live as inputs change. A separate "Calculate"
  button is allowed but not required; decide during implementation.
- Responsive and mobile-first. Sewists use this on a phone while shopping for
  fabric or standing at a cutting table.

## Deployment

> TODO: not decided. The project plan has no deployment section. A Vite build
> produces static files in `dist/`, so any static host will serve it. Run
> `/release` when a target is chosen.

## Open questions

> Resolve these in the plans, then re-run `/overview`.

- **Seam allowance sign.** See the Calculation contract TODO above. This is the
  highest-value thing to settle, because it silently changes every result.
- **Stack not yet installed.** Tailwind, Zod, and Vitest are all planned but
  absent from `package.json`.
- **`coding-standards.md` contradicts the plans.** It was tuned from the bare
  scaffold and still says plain CSS, no framework, and no test gate. Update it
  before `/implement` reads it.
- **`strict` is off** in `tsconfig.app.json`. Cheap to enable now, before the
  calculation engine exists.
- **Custom length bounds undefined.** Feature 7 validates "unreasonable values"
  and the plan gives waist > 300cm as the example, but names no limit for a
  custom skirt length.
- **Rounding and precision unspecified.** Neither plan says how many decimal
  places results show, or whether output rounds up to a safe cutting margin.
