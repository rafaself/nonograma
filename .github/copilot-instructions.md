# Copilot Instructions -- Nonograma

Oriental-themed Nonogram puzzle game. React 19, TypeScript 5.9 (strict), Vite 7, Tailwind CSS 4, pnpm.

## Component Pattern

All components use `memo()` with named functions:

```tsx
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export const MyComponent = memo(function MyComponent({ value, onChange }: MyComponentProps) {
  return <div>{value}</div>;
});
```

## Import Conventions

- Use `import type` for type-only imports: `import type { Puzzle } from '../lib/game-logic';`
- Relative paths only -- no `@/` aliases
- No barrel exports (no index.ts re-export files)

## Styling

- Tailwind utilities with `cn()` helper: `cn('base-class', condition && 'conditional-class')`
- `cn()` is from `src/lib/utils.ts` (clsx + tailwind-merge)
- Colors: `#ae2012` (red accent), `#c9a227` (gold), `#0a0a0a` (bg), `#fdf5e6` (text)

## TypeScript Strictness

- `exactOptionalPropertyTypes` enabled -- use `prop?: T | undefined` not just `prop?: T`
- `noUnusedLocals` and `noUnusedParameters` -- no unused variables
- `verbatimModuleSyntax` -- must use `import type` for type imports

## Testing

- Vitest + Testing Library, tests colocated as `{name}.test.ts(x)`
- 100% coverage required
- Use `/* c8 ignore start/stop */` for canvas/WebGL code untestable in jsdom

## Types

- Types live in the file that owns them (`CellState`, `Puzzle`, `GameState` in `game-logic.ts`)
- `CellState` enum: `EMPTY = 0`, `FILLED = 1`, `MARKED_X = 2`

## State

- All game state in `useNonogramGame` hook -- no Redux/Context
- Screen switching via `screen` state (`'home' | 'play'`), not React Router

## Do NOT

- Add path aliases, barrel exports, or state management libraries
- Add React Router
- Reduce test coverage below 100%
- Use npm/yarn (use pnpm)
