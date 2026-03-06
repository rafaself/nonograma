---
name: add-e2e-test
description: Write a Playwright E2E test following the project's existing patterns — page helpers, test grouping, and CI-compatible assertions.
---

# Add E2E Test

Write a Playwright E2E test in the `e2e/` directory.

## File placement

- E2E tests go in `e2e/{name}.spec.ts`.
- Existing specs: `e2e/smoke.spec.ts` (core gameplay), `e2e/seo.spec.ts` (meta tags, structured data).

## Setup

- Playwright config: `playwright.config.ts`
- Dev server starts automatically via `webServer` config on port 4173.
- Projects: chromium, firefox, webkit, mobile-chrome.
- CI only runs chromium (`pnpm test:e2e:ci`).

## Test structure

```typescript
import { test, expect, type Page } from '@playwright/test';

test.describe('Feature name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('describes expected behavior', async ({ page }) => {
    // Arrange: navigate, set up state
    // Act: interact with the page
    // Assert: verify outcomes
  });
});
```

## Available helpers (from smoke.spec.ts)

These helpers are defined in `e2e/smoke.spec.ts`. If you need them in a new spec file, copy the relevant helpers:

### clickCell — Click a canvas grid cell by logical position

```typescript
async function clickCell(page: Page, row: number, col: number) {
  const canvas = page.getByRole('main').locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');

  const style = await canvas.getAttribute('style');
  const wMatch = style?.match(/width:\s*([\d.]+)px/);
  const hMatch = style?.match(/height:\s*([\d.]+)px/);
  if (!wMatch || !hMatch) throw new Error('Cannot read canvas dimensions from style');

  const canvasW = Number(wMatch[1]);
  const cols = Math.round(box.width / (canvasW / Math.round(box.width / (canvasW / 5))));
  const cellSize = canvasW / cols;
  const x = (col + 0.5) * cellSize;
  const y = (row + 0.5) * cellSize;
  await canvas.click({ position: { x, y } });
}
```

### goToFirstPuzzle — Navigate from home to play screen

```typescript
async function goToFirstPuzzle(page: Page) {
  await page.goto('/');
  await page.locator('.oriental-card').first().click();
  await expect(page.getByRole('main').locator('canvas')).toBeVisible();
}
```

## Key selectors

| Element | Selector |
|---------|----------|
| Puzzle cards | `.oriental-card` |
| Game canvas | `page.getByRole('main').locator('canvas')` |
| Mode toggle | `page.getByRole('button', { name: /switch to (mark\|fill) mode/i })` |
| Undo button | `page.getByTitle('Undo')` |
| Redo button | `page.getByTitle('Redo')` |
| Reset button | `page.getByTitle('Reset')` |
| Mute button | `page.getByRole('button', { name: /mute\|unmute/i })` |
| Back to home | `page.locator('button').filter({ hasText: /return to trails/i })` |
| Victory modal | `page.getByText('Achieved')` |
| Progress counter | `page.locator('.tabular-nums').first()` |
| Size sections | `page.getByText('Trail of the Panda')` (5x5), `'Trail of the Tiger'` (10x10), `'Trail of the Dragon'` (15x15) |

## Testing tips

- Use `await page.waitForTimeout(60)` between rapid cell clicks to avoid race conditions.
- For `window.confirm` dialogs (Reset), register a handler before clicking:
  ```typescript
  page.on('dialog', (dialog) => dialog.accept());
  ```
- Use `{ timeout: 5000 }` for assertions that depend on animations or async state (e.g., victory modal).
- For responsive tests, create a new browser context with custom viewport:
  ```typescript
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  // ... test ...
  await context.close();
  ```

## Running

```bash
pnpm test:e2e          # All browsers
pnpm test:e2e:ci       # Chromium only (CI)
pnpm test:e2e:headed   # With browser visible
```

Run a single spec:

```bash
npx playwright test e2e/{name}.spec.ts
```
