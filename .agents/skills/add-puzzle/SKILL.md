---
name: add-puzzle
description: Add a new nonogram puzzle to the game. Guides through solution grid creation, color palettes, ID assignment, validation, and solvability testing. Includes a script to convert visual .puzzle files to TypeScript.
---

# Add Puzzle

Add a new nonogram puzzle to `src/data/puzzles.ts`.

## Quick start with the create-puzzle script

The fastest way to add a puzzle is to write a visual `.puzzle` file and run the script:

```bash
# Generate TypeScript from a .puzzle file
node .agents/skills/add-puzzle/scripts/create-puzzle.mjs my-puzzle.puzzle

# Preview in terminal with colored output
node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --preview my-puzzle.puzzle

# Validate without generating output
node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --validate my-puzzle.puzzle

# Find next available ID for a size
node .agents/skills/add-puzzle/scripts/create-puzzle.mjs --next-id 10x10
```

### .puzzle file format

```
title: Heart

palette:
  R = #e63941

grid:
  .R.R.
  RRRRR
  RRRRR
  .RRR.
  ..R..
```

Grid characters:
- `.` = empty cell (solution: false)
- `#` = filled cell with default gold color (#c9a227)
- `A-Z` = filled cell with the palette color mapped to that letter

Optional background section for scenic solved-state backdrop:

```
background:
  S = #1d4e89

  SS.SS
  S...S
  .....
  SS.SS
  SS.SS
```

See `references/example-simple.puzzle`, `references/example-scenic.puzzle`, and `references/example-default.puzzle` for complete examples.

## Manual workflow

If you prefer to write puzzle data directly:

### Puzzle data structure

```typescript
interface Puzzle {
  id: string;            // Format: "{width}x{height}-{number}" e.g. "5x5-6"
  title: string;         // Display name
  width: number;         // Columns (derived from solution, max 25)
  height: number;        // Rows (derived from solution, max 25)
  solution: boolean[][]; // [row][col] — true = filled, false = empty
  resultColors?: (string | null)[][];      // Per-cell solved color (#rrggbb or null)
  backgroundColors?: (string | null)[][];  // Per-cell backdrop color (#rrggbb or null)
}
```

### Steps

1. **Choose size and assign ID** — Supported: 5x5, 10x10, 15x15, 20x20. ID format: `{width}x{height}-{N}`. Use `--next-id` to find the next number.
2. **Design the solution grid** — `boolean[][]` where `true` = filled. Every row must have the same width. At least one filled cell.
3. **Add color palettes** — `resultColors` for solved cell colors, `backgroundColors` for scenic backdrop. Colors must be lowercase 6-digit hex (`#rrggbb`). Empty cells must be `null`.
4. **Add to RAW_PUZZLES array** — In `src/data/puzzles.ts`. Width/height can be omitted (auto-derived). Place after last puzzle of same size.
5. **Update trail grouping if needed** — HomeScreen groups by size: "Trail of the Panda" (5x5), "Trail of the Tiger" (10x10), "Trail of the Dragon" (15x15), "Trail of the Wukong" (20x20). New puzzles in existing sizes are picked up automatically.

### Validate

```bash
npx vitest run src/data/puzzles.test.ts src/data/puzzles-solvability.test.ts
```

Validates: ID format, no duplicates, grid dimensions, color grid alignment, empty cells are null, hex format, clue derivation, and `checkWin()`.

### Update solvability test expectations if needed

- Custom (non-default) result colors for a "major level": add ID to `upgradedIds` in `src/data/puzzles-solvability.test.ts`.
- Background colors for scenic effect: add ID to `scenicIds` in the same file.

## Common mistakes

- Empty solution cells MUST have `null` in resultColors (not a color string).
- Using 3-digit hex (`#abc`) instead of 6-digit (`#aabbcc`).
- Rows with inconsistent lengths in the solution grid.
- Not running the puzzle tests before committing.
