# Nonograma — Agent Guide

Oriental-themed Nonogram (Picross) puzzle game. React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4.

> **Package manager: `pnpm` only.** Never use `npm` or `yarn`.

## Skills

Reusable skills live in `.agents/skills/`. Each has a `SKILL.md` with instructions and, where applicable, scripts.

| Skill | When to use |
|-------|-------------|
| `verify` | After any change — runs lint → typecheck → test (100% coverage) → build |
| `add-puzzle` | Adding a new nonogram puzzle — visual `.puzzle` format, auto-ID, solvability check |
| `add-component` | Creating a new React component with correct conventions and tests |
| `add-e2e-test` | Writing a Playwright E2E test with project-specific helpers and selectors |

**Always run `verify` when you finish a task.**

## Commands

```bash
pnpm dev                 # Dev server (Vite, hot reload)
pnpm build               # Puzzle tests + tsc -b + vite build
pnpm test                # Unit tests (Vitest)
pnpm test -- --coverage  # Unit tests with 100% coverage check
pnpm lint                # ESLint
npx tsc --noEmit         # Type check only
pnpm test:e2e:ci         # E2E tests (Chromium only — use for local CI simulation)
pnpm test:e2e            # E2E tests (all browsers)

npx vitest run src/lib/game-logic.test.ts   # Run a single test file
```

> `pnpm build` runs puzzle solvability tests first — invalid puzzle data fails before compilation.

## Architecture

Two-screen SPA with no router. Screen switching via `useState` in `useNonogramGame`. No state library — all state lives in a single hook with props drilled explicitly. See local `AGENTS.md` files in subfolders for context-specific rules.

```
App -> useNonogramGame() -> state + actions
  |- HomeScreen: puzzle selection, calls startPuzzle(puzzle)
  '- PlayScreen -> NonogramBoardCanvas: pointer events, drag
       '- handleCellAction(row, col, button)
           '- updates grid -> checkWin -> persists to localStorage
```

## Global Conventions

- **TypeScript strict**: `exactOptionalPropertyTypes`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`
- `import type` for type-only imports
- Named exports only — no default exports, no barrel `index.ts` files
- Relative imports only — no `@/` aliases
- Types defined in the file that owns them
- Tailwind CSS 4 + `cn()` from `src/lib/utils.ts` for conditional classes
- Color palette: `#ae2012` red · `#c9a227` gold · `#0a0a0a` bg · `#fdf5e6` text
- **100% test coverage required** — lines, functions, branches, statements
- Tests colocated: `{name}.test.ts(x)` next to the source file
- Commits: `{type}: {description}` — types: `feat`, `fix`, `refactor`. Imperative mood, lowercase after colon.

## Constraints

- No puzzle generator, editor, user accounts, cloud sync, or hints
- No React Router — two screens only, switched by state in `useNonogramGame`
- No Redux, Zustand, or Context — single hook pattern is intentional
- No barrel exports (`index.ts`) or path aliases (`@/`)
- Do not reduce coverage below 100%
- Do not use `npm` or `yarn` — use `pnpm`

## CI

GitHub Actions on push/PR to `main`: lint → typecheck → audit → unit tests (coverage) → build → E2E (chromium).
