# Hooks

## Architecture

`useNonogramGame` is the single central state hook for the entire app. This is intentional — no Redux, Zustand, or React Context.

It manages:
- Screen state (`'home' | 'play'`) — this is the app's "router"
- Game state (grid, puzzle, clues, solved status, elapsed time)
- Undo/redo history stacks
- Input mode toggle (fill vs mark X)
- Completion tracking and persistence
- Sound playback gating (muted/volume)

## Drag Batching

`beginBatch()` / `endBatch()` wrap drag strokes so the entire drag produces a single undo entry instead of one per cell. Components call `onDragStart` / `onDragEnd` which map to these.

## Rules

- Do not introduce additional state libraries or Context providers
- Props are drilled explicitly from this hook to screens and components
- New game-wide state belongs here, not in individual components
