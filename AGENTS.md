# AGENTS.md

Oriental-themed Nonogram (Picross) puzzle game. React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS 4.

## Commands

```bash
pnpm dev              # Dev server (Vite, hot reload)
pnpm build            # Runs puzzle tests + tsc -b + vite build
pnpm test             # Unit tests (Vitest)
pnpm test -- --coverage  # Unit tests with coverage
pnpm lint             # ESLint
npx tsc --noEmit      # Type check only
pnpm test:e2e         # E2E tests (Playwright, all browsers)
pnpm test:e2e:ci      # E2E tests (Chromium only)
```

### Single test file

```bash
npx vitest run src/lib/game-logic.test.ts
```

### E2E notes

Playwright config auto-starts `pnpm dev`. For CI, only chromium runs.

## Architecture

Two-screen SPA with no router. Screen switching via `useState` in `useNonogramGame` hook.

### Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useNonogramGame.ts` | Central game state hook (state, undo/redo, persistence) |
| `src/lib/game-logic.ts` | Core types (`CellState`, `Puzzle`, `GameState`, `Clues`) + validation |
| `src/lib/persistence.ts` | localStorage read/write with debounced saves and type guards |
| `src/lib/boardRender.ts` | Canvas 2D rendering of the game grid |
| `src/lib/canvasSizing.ts` | Responsive cell size calculation |
| `src/lib/sounds.ts` | Web Audio API sound effects (oscillator-based, no audio files) |
| `src/lib/utils.ts` | `cn()` helper (clsx + tailwind-merge) |
| `src/data/puzzles.ts` | 35 curated puzzles (~201KB). Exports `PUZZLES` array |
| `src/components/NonogramBoardCanvas.tsx` | Interactive canvas board (pointer events, drag) |
| `src/components/SmokeSimulation.tsx` | WebGL smoke effect with embedded GLSL shaders |
| `src/screens/HomeScreen.tsx` | Puzzle selection grouped by grid size |
| `src/screens/PlayScreen.tsx` | Game board + controls |
| `src/App.tsx` | Root component, composes screens + toolbar + decorations |

### Data Flow

```
App -> useNonogramGame() -> returns game state + actions
  |- HomeScreen: displays puzzles, calls startPuzzle(puzzle)
  '- PlayScreen -> NonogramBoardCanvas: renders grid, handles pointer events
       '- calls handleCellAction(row, col, mouseButton)
           '- updates grid -> checks win -> persists to localStorage
```

## Coding Conventions

### Components

- All wrapped with `memo()`: `export const X = memo(function X(props) { ... })`
- Props typed as `{ComponentName}Props` interface, destructured in params
- Screens in `src/screens/` as `{Name}Screen.tsx`, reusable components in `src/components/`

### TypeScript

- Very strict: `exactOptionalPropertyTypes`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`
- Use `import type` for type-only imports
- Types defined in the file that owns them (e.g., `CellState`, `Puzzle`, `Clues` in `game-logic.ts`)
- No barrel exports (no index.ts re-export files)
- Relative paths only (no `@/` aliases)

### Styling

- Tailwind CSS 4 utilities + `cn()` from `src/lib/utils.ts`
- Complex decorative CSS in dedicated `.css` files (e.g., `MountFujiBackground.css`)
- Color palette: `#ae2012` (red accent), `#c9a227` (gold), `#0a0a0a` (bg), `#fdf5e6` (text)

### State Management

- Single custom hook `useNonogramGame` -- no Redux, Zustand, or Context
- All game state flows through this hook via props

### Testing

- Vitest + Testing Library for unit tests. Playwright for E2E.
- **100% code coverage required** (branches, functions, lines, statements)
- Use `/* c8 ignore start */` / `/* c8 ignore stop */` for DOM-only code untestable in jsdom (canvas, WebGL, ResizeObserver)
- Tests colocated as `{name}.test.ts(x)` next to source
- Mock child components and external modules with `vi.mock()`
- Puzzles have dedicated solvability tests that run during `pnpm build`

### Commits

Format: `{type}: {description}` (feat, fix, refactor). Imperative mood, lowercase after colon.

## What NOT To Do

- Do NOT add a puzzle generator, editor, user accounts, cloud sync, or hints (out of scope)
- Do NOT add React Router -- screen switching uses state in useNonogramGame
- Do NOT add Redux, Zustand, or Context -- the single hook pattern is intentional
- Do NOT add barrel exports (index.ts re-export files) or path aliases (`@/`)
- Do NOT modify puzzle solution arrays without updating solvability tests
- Do NOT reduce coverage below 100% -- use `/* c8 ignore */` for untestable code
- Do NOT use `npm` or `yarn` -- this project uses `pnpm`

## Agent Skills

Reusable skills for common tasks live in `.agents/skills/`. Load them to get step-by-step instructions and scripts.

| Skill | Description |
|-------|-------------|
| `verify` | Run the full quality pipeline: lint → typecheck → test (100% coverage) → build → optional E2E |
| `add-puzzle` | Add a new nonogram puzzle via visual `.puzzle` files. Includes `scripts/create-puzzle.mjs` to generate TypeScript, preview in terminal, validate, and auto-assign IDs |
| `add-component` | Create a React component following project conventions (memo, Props interface, colocated tests) |
| `add-e2e-test` | Write a Playwright E2E test with the right helpers and selectors for this project |

### add-puzzle script

```bash
node .agents/skills/add-puzzle/scripts/create-puzzle.mjs my-puzzle.puzzle   # Generate TS
node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --preview my.puzzle # Terminal preview
node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --next-id 10x10     # Next available ID
```

## CI Pipeline

GitHub Actions on push/PR to main: lint, type-check, audit, unit tests (with coverage), build, e2e (chromium only).
