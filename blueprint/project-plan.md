# Project Plan — Circle Skirt Calculator

## Problem

Sewists need to calculate the correct waist radius and fabric length for a circle skirt, based on their waist measurement, desired skirt type, and length. Doing this math by hand (with pi, seam allowances, unit conversions) is error-prone and slows down planning a sewing project.

## Users

Hobbyist and semi-professional sewists who want quick, accurate pattern measurements without doing the geometry manually.

## Core features (v1 / MVP)

- **Unit toggle** — inches or cm. All internal math runs in cm; convert on input and output only, never mix formulas across units.
- **Skirt type selector** — quarter, half, 3/4, full circle.
- **Length selector** — mini / midi / maxi presets, plus a custom length override.
- **Waist measurement input** — with a short "how to measure" helper/tooltip.
- **Results display** — waist radius and total fabric length, shown in the selected unit.
- **Input validation** — Zod schema covering empty fields, negative/zero numbers, and unreasonable values (e.g. waist > 300cm).
- **Local persistence** — last-used inputs (unit, skirt type, length, waist) are saved to local storage and restored on reload, so returning users don't have to re-enter everything. No account, no backend — this is local-only, matching a "no auth, no database" v1 posture.

## Post-MVP (tracked, not built yet)

- SVG pattern diagram — two concentric circles rendered to scale, showing waist and hem radius visually.
- Size presets (XS/S/M/L/XL) as an alternative to manual waist entry, for users without a tape measure.
- Printable / exportable cut sheet.
- Seam allowance and waistband style as user-configurable options (currently fixed constants).

## Explicit exclusions / non-goals

- No user accounts, no backend, no database. All state is either derived from the current form or stored in local storage.
- No hip-based sizing — waist circumference is the only measurement that matters for a circle skirt's core geometry.
- No multi-language support in v1.

## Data

All data is client-side only. Local storage holds a single object of last-used form values (unit, skirt type, length category, custom length, waist). No exported files are stored anywhere — any future PDF/print export (Post-MVP) would be generated on demand and downloaded, never persisted server-side.

## Tech stack

- React + TypeScript
- Vite (build tool / dev server) — no server-side rendering needed; this is a pure client-side calculator, unlike SSR-based reference examples
- Tailwind CSS for styling
- Zod for input validation (waist measurement, custom length overrides)
- Vitest for unit tests
- ESLint (flat config) for linting

## Project structure

- `src/components/` — UI components (selectors, input fields, results display), split between generic UI and calculator-specific components
- `src/lib/` — shared logic: calculation engine, unit conversion, validation schemas, local storage helpers
- `src/types/` — shared TypeScript types (skirt type, unit, form state)
- `blueprint/` — AI Blueprint workflow files (this plan, build plan, generated context, feature history)

## Key logic (non-negotiable correctness requirement)

All internal calculations must happen in a single unit (cm) to avoid conversion bugs. Convert user input to cm on the way in, convert results to the display unit on the way out. Never mix formulas across units.

Formulas (C = waist circumference in cm, after seam allowance subtracted):
- Full circle radius: R = C / (2π)
- 3/4 circle radius: R = (4/3 × C) / (2π)
- Half circle radius: R = (2 × C) / (2π)
- Quarter circle radius: R = (4 × C) / (2π)
- Fabric length: F = R + skirtLength + hemAllowance

Seam allowance and hem allowance should be configurable constants, not hardcoded magic numbers scattered through the code.

## UI / UX

- Single-page app, one calculator view — no routing needed for v1.
- Live or near-live recalculation as the user changes inputs (no separate "Calculate" button required, but not a hard requirement — decide during implementation).
- Responsive layout: usable on mobile (sewists often reference this on a phone while at the fabric store or cutting table).