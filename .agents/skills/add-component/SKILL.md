---
name: add-component
description: Create a new React component following project conventions — memo wrapping, Props interface, Tailwind styling, colocated tests with 100% coverage.
---

# Add Component

Create a new React component that follows all project conventions.

## File placement

- Reusable components: `src/components/{ComponentName}.tsx`
- Screen-level components: `src/screens/{Name}Screen.tsx`
- Tests colocated: `src/components/{ComponentName}.test.tsx` or `src/screens/{Name}Screen.test.tsx`

## Component template

```tsx
import { memo } from 'react';

interface {ComponentName}Props {
  // Props here — use `import type` for type-only imports
}

export const {ComponentName} = memo(function {ComponentName}({ prop1, prop2 }: {ComponentName}Props) {
  return (
    <div className="...">
      {/* component content */}
    </div>
  );
});
```

### Key conventions

- Wrap every component with `memo()`.
- Name the inner function the same as the export: `memo(function Foo() { ... })`.
- Props interface named `{ComponentName}Props`, destructured in the function params.
- Use `import type` for type-only imports (`import type { Puzzle } from '../lib/game-logic'`).
- No default exports — always named exports.
- No barrel exports (no `index.ts` re-export files).
- Relative imports only (no `@/` aliases).

### Alternative pattern (VolumeControl style)

The `VolumeControl` component uses a slightly different but accepted pattern:

```tsx
import React, { memo } from 'react';

interface FooProps { /* ... */ }

const FooBase: React.FC<FooProps> = ({ prop1 }) => {
  // ...
};

export const Foo = memo(FooBase);
```

Both patterns are acceptable. Prefer the primary pattern for new components.

## Styling

- Use Tailwind CSS 4 utility classes.
- Use the `cn()` helper from `src/lib/utils.ts` for conditional classes:
  ```tsx
  import { cn } from '../lib/utils';
  className={cn('base-classes', condition && 'conditional-classes')}
  ```
- Color palette: `#ae2012` (red accent), `#c9a227` (gold), `#0a0a0a` (bg), `#fdf5e6` (text).
- Complex decorative CSS goes in a dedicated `.css` file (e.g., `MountFujiBackground.css`).

## Test template

```tsx
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { {ComponentName} } from './{ComponentName}';

// Mock child components if needed
vi.mock('../components/ChildComponent', () => ({
  ChildComponent: (props: Record<string, unknown>) => <div data-testid="child" {...props} />,
}));

describe('{ComponentName}', () => {
  const defaultProps: {ComponentName}Props = {
    // fill in required props
  };

  it('renders correctly', () => {
    render(<{ComponentName} {...defaultProps} />);
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  // Add tests for all branches, interactions, and edge cases
});
```

### Testing rules

- 100% code coverage is required (lines, functions, branches, statements).
- Mock child components and external modules with `vi.mock()`.
- Use `/* c8 ignore start */` / `/* c8 ignore stop */` only for DOM-only code untestable in jsdom (canvas, WebGL, ResizeObserver).
- Run tests: `npx vitest run src/components/{ComponentName}.test.tsx`
- Run with coverage: `pnpm test -- --coverage`

## Checklist

- [ ] Component file created with `memo()` wrapping
- [ ] Props interface defined and named `{ComponentName}Props`
- [ ] Uses `import type` for type-only imports
- [ ] Tailwind styling with project color palette
- [ ] Colocated test file with 100% coverage
- [ ] No lint or type errors (`pnpm lint && npx tsc --noEmit`)
