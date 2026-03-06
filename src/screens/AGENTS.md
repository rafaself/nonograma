# Screens

Only two screens exist, and this is intentional. No React Router — switching is state-based via `useNonogramGame`.

## HomeScreen

- Groups puzzles by grid size with themed trail names: "Trail of the Panda" (5x5), "Trail of the Tiger" (10x10), "Trail of the Dragon" (15x15), "Trail of the Wukong" (20x20)
- Receives `completedIds` and `onStartPuzzle` as props

## PlayScreen

- Renders the game board (`NonogramBoardCanvas`), toolbar, and timer
- All game state comes from props drilled from `useNonogramGame`
- Calls `flushSave()` (via persistence) before navigating back to home

## Rules

- Do not add a third screen or introduce a router
- Keep screens as composition layers — game logic stays in `useNonogramGame`, rendering logic in components
