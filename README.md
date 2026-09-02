# circle-skirt-calculator

A browser app that turns a waist measurement into circle skirt pattern numbers:
the radius to cut the waist hole at, and how much fabric to buy.

The geometry is simple but easy to get wrong, and a wrong radius means cut fabric
that cannot be uncut. This does the arithmetic so you can get on with sewing.

Everything runs client side. There is no backend, no account, and no data leaves
the browser.

## Using it

Pick your units, the skirt type, and a length, then enter your waist. The results
update as you type.

- **Units** - inches or cm, switchable at any time
- **Skirt type** - quarter, half, 3/4, or full circle
- **Length** - mini (40cm), midi (60cm), maxi (95cm), or a custom value
- **Waist** - with a note on where to measure

Your last inputs are saved to local storage and restored on your next visit.
"Start over" clears them.

## How the numbers work

All internal maths runs in centimetres. Values are converted at the input and
output boundary only, so a unit switch never rewrites stored data.

With `C` as the waist circumference measured on the body:

| Skirt type | Finished waist radius |
| --- | --- |
| Full circle | `R = C / 2π` |
| 3/4 circle | `R = (4/3 × C) / 2π` |
| Half circle | `R = (2 × C) / 2π` |
| Quarter circle | `R = (4 × C) / 2π` |

A quarter circle skirt takes its waist from a quarter of a circle, so the circle
it is cut from has to be four times the body waist. Hence the multipliers.

Two things worth knowing, because both are easy to get backwards:

**Seam allowance comes off the radius, not the circumference.** The waist hole is
cut smaller so that sewing the seam opens it back out to the measured waist.

    cut radius = R - 1.5cm

**Fabric length spans the whole circle, not one radius.** It is the amount to
buy, so it is deliberately the generous figure:

    fabric length = 2 × (R + skirt length + 2cm hem)

This is uniform across skirt types. A quarter circle physically needs less than
that, so the number is safe rather than tight.

Seam allowance (1.5cm) and hem allowance (2cm) are named constants in
`src/lib/constants.ts`, not literals scattered through the code. Making them
user-adjustable is a planned feature, not a current one.

## Stack

- **React 19 + TypeScript** on **Vite**, client only, no SSR
- **Tailwind CSS v4**, configured CSS-first through an `@theme` block in
  `src/index.css`. There is no `tailwind.config.js`
- **Zod** for input validation at the form boundary
- **Vitest** for the calculation engine
- **ESLint** flat config

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Typecheck (`tsc -b`), then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |

## Project structure

    src/
      lib/          calculation, conversion, validation, storage (all pure, all tested)
      components/   UI
      types/        shared types
      index.css     Tailwind entry and the @theme design tokens
      App.tsx       the single view; main.tsx mounts it

The maths lives in `src/lib/` as plain functions, separate from the components
that render it. That split is what makes it testable without a DOM, and the test
suite covers the four skirt types, unit conversion, allowance handling,
validation, and the local storage round trip.

Components are not unit tested. They are verified in a real browser instead.

## Deployment

Not yet chosen. `npm run build` produces static files in `dist/`, so any static
host will serve it.

## Status

The v1 feature set is complete. Planned next: a scale pattern diagram, size
presets as an alternative to manual entry, a printable cut sheet, and
user-adjustable allowances.

Agent and workflow instructions live in [AGENTS.md](AGENTS.md). The build plan
and per-feature history are under `blueprint/`.
