# E2E Tests

Playwright tests that run against the local Vite dev server.

## Running

```bash
pnpm test:e2e:ci   # Chromium only (matches CI)
pnpm test:e2e      # All browsers
```

## Canvas Interaction

The game board is an HTML Canvas, so standard DOM selectors don't work for cells. Use the `clickCell(page, row, col)` helper pattern (see `smoke.spec.ts`) which calculates pixel coordinates from logical grid positions.

## Conventions

- Use the `add-e2e-test` skill when creating new E2E tests
- Locate elements by role/accessible name, not CSS selectors
- Tests should be independent and not rely on state from other tests
- `smoke.spec.ts` covers the full play-through flow; `seo.spec.ts` covers meta tags and static files
