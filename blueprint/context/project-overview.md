# Circle Skirt Calculator - Project Overview

<!-- blueprint:source-hash 70225e486f75589aab868632f86673463344376a237d63a58575b4d854a190ae -->

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

Pre-build setup is done: Vitest and Tailwind v4 are both installed.

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

With `C` as the waist circumference in cm, as measured on the body:

| Skirt type | Finished waist radius |
| --- | --- |
| Full circle | `R = C / (2π)` |
| 3/4 circle | `R = (4/3 × C) / (2π)` |
| Half circle | `R = (2 × C) / (2π)` |
| Quarter circle | `R = (4 × C) / (2π)` |

**Seam allowance applies to the radius, not the circumference.** The waist hole
is cut smaller so that sewing the seam opens it back out to the measured waist:

    Rcut = R - SEAM_ALLOWANCE

**Fabric length is the amount to buy**, spanning the full circle rather than a
single radius, and computed from the finished `R`, not `Rcut`:

    F = 2 × (R + skirtLength + HEM_ALLOWANCE)

Seam and hem allowance are named constants, not literals scattered through the
code.

> Both rules above were open questions and are now settled. A sewist reading
> "fabric length" is buying fabric, so under-reporting it by half is the
> expensive failure mode here.

## Tech stack

- **React 19 + TypeScript** - UI and type safety
- **Vite** - dev server and build. No SSR; this is a pure client-side app
- **Tailwind CSS v4** - styling. Installed, wired through the Vite plugin,
  configured CSS-first via `@theme` in `src/index.css`
- **Zod** - input validation at the form boundary. Not yet installed; arrives
  with Feature 7
- **Vitest** - unit tests for the calculation engine. Installed, and `npm test`
  is declared in `AGENTS.md`, so the logic-test gate is on
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

- **Zod not yet installed.** Tailwind and Vitest are in; Zod arrives with
  Feature 7.
- **Fabric length is uniform across skirt types.** `F = 2 x (R + L + hem)`
  describes the full circle's span. A quarter circle pattern physically needs
  less fabric than that, so the figure is safe but generous. Refine later if it
  matters.
- **`strict` is off** in `tsconfig.app.json`. Cheap to enable now, before the
  calculation engine exists.
- **Custom length bounds undefined.** Feature 7 validates "unreasonable values"
  and the plan gives waist > 300cm as the example, but names no limit for a
  custom skirt length.
- **Rounding and precision unspecified.** Neither plan says how many decimal
  places results show, or whether output rounds up to a safe cutting margin.
