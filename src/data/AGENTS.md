# Data — Puzzle Definitions

## Structure

`puzzles.ts` defines all curated puzzles and validates them at import time. Exports:
- `PUZZLES` — the validated puzzle array used by the app
- `__puzzlesInternals` — intentionally exposed internal validation functions for testing (not a leak)

## Puzzle Format

- ID format: `{width}x{height}-{number}` (regex: `^\d+x\d+-\d+$`)
- Max grid size: 25x25
- `solution`: `boolean[][]` — `true` = filled cell
- `resultColors`: optional `(string | null)[][]` — hex colors shown on solved cells
- `backgroundColors`: optional `(string | null)[][]` — backdrop colors in solved state
- All hex colors must be lowercase `#rrggbb` format

## Rules

- **Never modify solution arrays without updating solvability tests** — `puzzles-solvability.test.ts` verifies every puzzle is line-solvable
- `pnpm build` runs puzzle tests FIRST — invalid data fails the build before TypeScript compilation
- Use the `add-puzzle` skill when adding new puzzles — it handles ID assignment, validation, and solvability checks
- Dimensions are derived from the solution grid, not declared manually
