# circle-skirt-calculator

A browser app for working out circle skirt pattern measurements. Enter your
measurements, get the numbers to cut.

> This project is still being planned. The purpose above is a placeholder until
> `blueprint/project-plan.md` is filled in.

## Stack

React 19 + TypeScript, built with Vite. npm for packages.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

No test runner is configured yet.

## Project structure

- `src/` - application source (`main.tsx` mounts `App.tsx`)
- `public/` - static assets served at the site root
- `index.html` - Vite entry document

Agent and workflow instructions live in [AGENTS.md](AGENTS.md).
