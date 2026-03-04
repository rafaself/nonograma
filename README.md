# Nonogram (Picross) MVP

A fully-featured, mobile-responsive Nonogram web app built with React, TypeScript, and Tailwind CSS.

## Features
- **30 Curated Puzzles**: Includes sizes 5x5, 10x10, and 15x15.
- **Mobile Friendly**: Mode toggle (Fill / X) for touch devices.
- **Desktop Enhanced**: Right-click to toggle X, Left-click to fill.
- **Persistence**: Game state and completion status saved in `localStorage`.
- **QoL**: 50-step undo history, reset puzzle, and onboarding guide.
- **Visual Feedback**: Row/Column clues dim when satisfied.
- **Victory States**: Celebratory modal when a puzzle is solved.

## Tech Stack
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library

## How to Run
1. Install dependencies: `pnpm install`
2. Run development server: `pnpm dev`
3. Run tests: `pnpm test`
4. Build for production: `pnpm build`

## Project Structure
- `src/lib/game-logic.ts`: Pure logic forNonogram rules, clue generation, and win checks.
- `src/lib/persistence.ts`: LocalStorage management.
- `src/data/puzzles.ts`: Curated puzzle definitions.
- `src/App.tsx`: Main UI, routing, and game loop.
- `src/index.css`: Global styles and Tailwind directives.

## Puzzle Definitions
Puzzles are defined as a `Puzzle` object:
```ts
{
  id: string;
  title: string;
  width: number;
  height: number;
  solution: boolean[][]; // 2D array representing the solved state
}
```
Clues are automatically derived from the `solution` at runtime.

## Scope
- **In Scope**: Solving puzzles, persistence, undo, responsive UI.
- **Out of Scope**: Puzzle generator, editor, accounts, cloud sync, hints/cheats.
# nonograma
# nonograma
# nonograma
# nonograma
# nonograma
