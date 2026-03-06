# Lib — Core Logic and Utilities

Pure utility and logic modules. No React imports here.

## Key Modules

- **`game-logic.ts`** — Owns core types: `CellState`, `Puzzle`, `GameState`, `Clues`. Also exports `deriveClues`, `createEmptyGrid`, `checkWin`, `isLineSatisfied`. This is the source of truth for game types.
- **`persistence.ts`** — localStorage wrapper with debounced saves (300ms delay). Always call `flushSave()` before navigating away from a screen to avoid data loss.
- **`boardRender.ts`** + **`canvasSizing.ts`** — Canvas 2D rendering and responsive cell sizing. Tests mock the canvas context since jsdom has no real canvas.
- **`sounds.ts`** — Web Audio API oscillator-based beeps. No audio files — sounds are generated programmatically.
- **`utils.ts`** — `cn()` helper (clsx + tailwind-merge). Kept minimal.

## Rules

- Keep modules pure and framework-agnostic — no React, no DOM globals (except in persistence/sounds which access `localStorage`/`AudioContext`)
- Types belong in the file that owns them, not in a shared `types.ts`
- Do not add new exports to `utils.ts` without good reason — avoid it becoming a dumping ground
