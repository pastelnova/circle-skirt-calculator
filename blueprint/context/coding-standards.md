# Coding Standards

> Your conventions: React 19 + TypeScript on Vite with Tailwind CSS, Zod, and
> Vitest, no backend. Edit freely as the project takes shape. Build and
> verification commands live in `AGENTS.md`, not here.

## TypeScript

- No `any` types - use proper typing or `unknown`
- Define types for all component props and shared data models
- Use type inference where obvious, explicit types where helpful
- `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` are on, so
  dead bindings and runtime-only TS syntax (enums, parameter properties) fail the
  build
- Typecheck through the project's build or typecheck command in `AGENTS.md`

> TODO: `strict` is not enabled in `tsconfig.app.json`. Turning it on early is
> cheap and is worth deciding before much code exists.

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks

## Vite

- Client-only single page app. There is no server, no SSR, and no API routes
- `index.html` is the entry document; `src/main.tsx` mounts `App` into `#root`
- Import assets from `src/assets/` so Vite fingerprints them; put files in
  `public/` only when they must keep a stable URL
- Use `import.meta.env` for build-time config, and remember `VITE_`-prefixed
  variables are bundled into the client and are not secret

## File Organization

- Components: `src/components/ComponentName.tsx`, grouped into
  `src/components/[feature]/` once a feature owns several
- Pure logic and calculations: `src/lib/[utility].ts`
- Shared types: `src/types/[feature].ts`
- Static assets that get bundled: `src/assets/`

Keep the skirt maths in `src/lib/` as plain functions, separate from the
components that render them. That is the code most worth testing later.

## Naming

- Components: PascalCase (`ItemCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling
- Tailwind v4: CSS-first config via an `@theme` block in `src/index.css`. No
  `tailwind.config.js`
- The theme tokens come from `prototypes/theme.css`, the durable output of
  `/prototype`. Port that block into `@theme` at the first UI feature, then
  delete the mockups
- Use utility classes in markup. Reach for an `@apply` component class only when
  the same long utility string repeats across files
- No inline styles, and no hard-coded hex values in components. Every color,
  font, and spacing value resolves to a theme token
- No component library is installed. Adding one is a deliberate decision, not a
  mid-feature install
- **Keep hand-written CSS inside a layer.** Tailwind puts utilities in
  `@layer utilities`, and unlayered CSS beats any layered rule no matter how
  specific. The Vite starter's plain `h1 { color: ... }` in `src/index.css`
  already overrides `text-*` utilities because of this. Delete that leftover CSS
  at the first UI feature, and wrap anything you must keep in `@layer base`

The look is settled: warm and crafty, light mode. A cream ground with ink text,
terracotta accent, serif headings, sans body, and mono tabular numerals for every
measurement so digits align in a column. No dark mode in v1.

## State and Data

- No database, no backend, no auth. Everything runs in the browser
- Local component state with `useState`; lift state only when two components
  genuinely share it. Reach for a store only when prop drilling actually hurts
- Keep calculations as pure functions that take inputs and return results, so
  they can be tested without rendering
- Validate user input with Zod at the form boundary, so the calculation layer
  only ever receives values it can trust. Never let `NaN` reach a calculation
- Keep the Zod schemas in `src/lib/` next to the logic they guard, and derive
  TypeScript types from them rather than declaring the shape twice
- `localStorage` is the only persistence available. Wrap every read and write in
  try/catch and render correctly with no stored value

## Error Handling

- Invalid input is a normal state, not an exception. Show an inline message next
  to the field and keep the rest of the UI usable
- Never render `NaN`, `Infinity`, or `undefined` to the user
- Fail loudly in development: throw on genuinely impossible states rather than
  silently substituting a default

## Testing

The blueprint installs no test runner; testing is opt-in at the project level,
because the overlay can't know your stack. Adding unit testing is an explicit
setup task the AI can do through the normal workflow, either as a build-plan item
or with `/tests`. The setup should choose the stack-native runner, wire the
scripts or commands, add a small example test, and update the Commands section
of `AGENTS.md`.

When `AGENTS.md` declares a `Verify` command, treat it as the umbrella automated
gate. It combines only the checks this project actually has, in this order when
available: typecheck, tests, then build. The command does not enable an absent
test runner or replace focused evidence. It gives local work and optional CI one
exact command to run. `/ci` owns Verify and CI setup. `/tests` adds the real test
command to Verify when it already exists, but never creates CI only because
testing was configured.

**The opt-in switch is one signal: a `test` command in the Commands section of
`AGENTS.md`.** Declare one and **tests become a gate for logic-bearing steps**,
not an optional extra; leave it out and the loop verifies logic with the evidence
it already uses (run it, a screenshot, the build). Adding the runner is itself a
deliberate step, never a silent mid-step install. This is the single definition
of the switch; the skills and `ai-interaction.md` only point back here.

- **What to test (the scope rule):** pure logic where a wrong answer is possible -
  parsers, formatters, validators, id/slug builders, server actions. These have
  assertable inputs and outputs and real edge cases (empty, missing, malformed).
- **What not to test:** UI components and integration-level surfaces (render or
  export routes, anything driving a real browser or external service). Verify those
  with a screenshot and the build, not brittle unit tests.
- **The gate (when a runner is configured):** a build step that adds in-scope logic
  must ship a passing test in the same reviewable diff. The project's test command
  must be green before the step is approved, before any checkpoint commit, and
  before `/complete` merges. UI and integration-only steps are exempt and ride on
  screenshot plus build evidence.
- **When it's named:** the `/feature` spec's Testing section predicts the coverage,
  `/implement` writes the test with the step, and if a step surfaces logic the spec
  didn't foresee, add a focused test then.
- An empty suite should fail, not pass, so "no tests ran" never looks like "passed".
- Test files live next to source files (for example `feature.test.ts`).
- Run them via the project's test command (see Commands in `AGENTS.md`), not a
  hardcoded tool name.

Stack binding for this project: **Vitest**, installed and running with no config
file. It picks up `*.test.ts` beside the source it covers and runs in the node
environment, which suits the pure functions in `src/lib/`. `AGENTS.md` declares
`npm test`, so **the gate is on**. Vitest globals are not enabled: import
`describe`, `it`, and `expect` from `vitest` explicitly.

The calculation engine in `src/lib/` is the primary target: four skirt types,
unit conversion, and allowance handling are all pure functions with real edge
cases. The Tailwind-styled components are not, and ride on browser evidence and
the build instead.

## Browser Verification

For UI and integration behavior, prefer real browser evidence over reading the
code and assuming it works.

- Browser automation is separately opt-in through `/browser-tests`. That setup
  reuses a compatible runner or prefers Playwright for supported projects, then
  documents the exact command as `Browser tests` in `AGENTS.md`.
- When `Browser tests` is declared, add focused coverage for stable behavioral
  done-whens when it is proportionate, and run the documented command during
  `/check`. Do not assume it proves visual fidelity, real authenticated-profile
  behavior, browser chrome, or another claim the test does not observe.
- If no Browser tests command is declared, do not add a runner silently in the
  middle of an unrelated feature. Use the available dev server, browser
  screenshots, build output, API output, or manual evidence instead.
- Browser tests are not part of the default Verify command or CI unless the user
  separately chooses that slower gate.
- Browser evidence is especially important for flows that click, type, submit,
  navigate, download files, render complex layouts, or depend on client-side
  state.

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible

## Comments

Write code that explains itself; comment only what the code cannot say.
Over-commenting is a common AI tell, so resist it.

- Comment the **why**, not the **what**. Delete any comment that restates the code.
- No banner/header blocks, section dividers, or step-by-step narration of obvious
  code. A file does not need a comment announcing each region.
- A comment earns its place only when it captures something the code can't: a
  non-obvious decision, a gotcha or workaround, why a value is what it is, or a
  link to a spec or issue.
- Prefer self-documenting names and small functions over explanatory comments.
- Keep doc comments minimal: a one-line purpose on an exported type or function is
  plenty; don't write JSDoc that just repeats the signature.
- When in doubt, leave the comment out.

## Writing

- No em dashes (U+2014) in generated content: docs, comments, commit messages,
  READMEs, specs. They read as AI-generated.
- Use a hyphen for `term - description` separators; rephrase prose with commas,
  parentheses, or a colon. Avoid en dashes and the ellipsis character too.
