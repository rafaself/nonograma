# Components

## Pattern

```tsx
export const Foo = memo(function Foo({ bar }: FooProps) { ... });
interface FooProps { bar: string; }
```

- Wrap every component in `memo()` with the inner function named the same as the export
- Props interface: `{Component}Props`, destructured in params
- Use `cn()` from `../lib/utils` for conditional Tailwind classes
- Complex decorative CSS goes in a dedicated `.css` file (see `MountFujiBackground.css`)
- Use the `add-component` skill when creating a new component

## Special Files

- **`SmokeSimulation.tsx`** contains embedded GLSL shader strings (vertex + fragment). Do not lint, reformat, or modify the shader code.
- **`NonogramBoardCanvas.tsx`** renders the game board on HTML Canvas. Uses `/* c8 ignore start/stop */` around `useEffect` hooks that call canvas DOM API and `ResizeObserver` — these cannot run in jsdom and must stay ignored.
- **`VolumeControl.tsx`** uses a slightly different pattern (`React.FC` + separate Base component). Both patterns are acceptable.

## Testing

- Mock child components with `vi.mock()` to isolate unit tests
- Canvas/WebGL code that touches real DOM API must be wrapped in `/* c8 ignore start/stop */`
