import { test, expect, type Page } from '@playwright/test';

/* ─── helpers ──────────────────────────────────────────────── */

/** Click the canvas cell at logical grid position (row, col). */
async function clickCell(page: Page, row: number, col: number) {
  const canvas = page.getByRole('main').locator('canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas not found');

  const style = await canvas.getAttribute('style');
  const wMatch = style?.match(/width:\s*([\d.]+)px/);
  const hMatch = style?.match(/height:\s*([\d.]+)px/);
  if (!wMatch || !hMatch)
    throw new Error('Cannot read canvas dimensions from style');

  const canvasW = Number(wMatch[1]);
  const cols = Math.round(
    box.width / (canvasW / Math.round(box.width / (canvasW / 5))),
  );
  const cellSize = canvasW / cols;
  const x = (col + 0.5) * cellSize;
  const y = (row + 0.5) * cellSize;
  await canvas.click({ position: { x, y } });
}

/**
 * Solve the first 5×5 puzzle ("Heart") by clicking every
 * filled cell in its known solution.
 */
async function solveHeart(page: Page) {
  const filled: [number, number][] = [
    [0, 1], [0, 3],
    [1, 0], [1, 1], [1, 2], [1, 3], [1, 4],
    [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
    [3, 1], [3, 2], [3, 3],
    [4, 2],
  ];
  for (const [r, c] of filled) {
    await clickCell(page, r, c);
    await page.waitForTimeout(60);
  }
}

/** Navigate from home to the first puzzle's play screen. */
async function goToFirstPuzzle(page: Page) {
  await page.goto('/');
  await page.locator('.oriental-card').first().click();
  await expect(page.getByRole('main').locator('canvas')).toBeVisible();
}

/* ─── Home screen ──────────────────────────────────────────── */

test.describe('Home screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders main heading and progress bar', async ({ page }) => {
    await expect(page.getByText('Enlightenment')).toBeVisible();
    await expect(page.getByText('Trails')).toBeVisible();
    // Progress counter e.g. "0/30" — scoped to the tabular-nums span
    await expect(page.locator('.tabular-nums').first()).toBeVisible();
    await expect(page.locator('.tabular-nums').first()).toHaveText(/\d+\/\d+/);
  });

  test('shows puzzle cards grouped by size', async ({ page }) => {
    await expect(page.locator('.oriental-card').first()).toBeVisible();
    await expect(page.getByText('Trail of the Panda')).toBeVisible();
  });

  test('size group sections are collapsible', async ({ page }) => {
    const firstCard = page.locator('.oriental-card').first();
    await expect(firstCard).toBeVisible();

    // Scope to the 5×5 section
    const section5x5 = page.locator('section').filter({ has: page.getByText('Trail of the Panda') }).first();
    const sectionButton = section5x5.locator('button').first();
    const collapseGrid = section5x5.locator('.collapse-grid');

    // Collapse
    await sectionButton.click();
    await expect(collapseGrid).not.toHaveClass(/expanded/);

    // Expand
    await sectionButton.click();
    await expect(collapseGrid).toHaveClass(/expanded/);
  });

  test('mute button toggles', async ({ page }) => {
    const muteBtn = page.getByRole('button', { name: /mute|unmute/i });
    await expect(muteBtn).toBeVisible();
    await muteBtn.click();
    await expect(
      page.getByRole('button', { name: /mute|unmute/i }),
    ).toBeVisible();
  });

  test('clicking a card navigates to play screen', async ({ page }) => {
    await page.locator('.oriental-card').first().click();
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
  });

  test('displays multiple size sections when puzzles exist', async ({
    page,
  }) => {
    // The dataset has 5×5, 10×10, and 15×15 puzzles
    await expect(page.getByText('Trail of the Panda')).toBeVisible();
    await expect(page.getByText('Trail of the Tiger')).toBeVisible();
    await expect(page.getByText('Trail of the Dragon')).toBeVisible();
  });

  test('uncompleted cards show RESOLVE label', async ({ page }) => {
    const firstCard = page.locator('.oriental-card').first();
    await expect(firstCard.locator('text=RESOLVE')).toBeVisible();
  });
});

/* ─── Play screen ──────────────────────────────────────────── */

test.describe('Play screen', () => {
  test.beforeEach(async ({ page }) => {
    await goToFirstPuzzle(page);
  });

  test('shows canvas, mode toggle, and toolbar buttons', async ({ page }) => {
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /switch to (mark|fill) mode/i }),
    ).toBeVisible();
    await expect(page.getByTitle('Undo')).toBeVisible();
    await expect(page.getByTitle('Redo')).toBeVisible();
    await expect(page.getByTitle('Reset')).toBeVisible();
  });

  test('mode toggle switches between fill and mark', async ({ page }) => {
    const toggle = page.getByRole('button', {
      name: /switch to (mark|fill) mode/i,
    });
    await expect(toggle).toHaveAttribute('aria-label', /switch to mark mode/i);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', /switch to fill mode/i);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', /switch to mark mode/i);
  });

  test('back button returns to home', async ({ page }) => {
    await page
      .locator('button')
      .filter({ hasText: /return to trails/i })
      .first()
      .click();
    await expect(page.getByText('Enlightenment')).toBeVisible();
  });

  test('undo is disabled initially and enabled after interacting', async ({
    page,
  }) => {
    const undoBtn = page.getByTitle('Undo');
    await expect(undoBtn).toBeDisabled();
    await clickCell(page, 0, 1);
    await expect(undoBtn).toBeEnabled();
  });

  test('undo reverts last action', async ({ page }) => {
    const undoBtn = page.getByTitle('Undo');
    await clickCell(page, 0, 1);
    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();
    await expect(undoBtn).toBeDisabled();
  });

  test('redo re-applies undone action', async ({ page }) => {
    const undoBtn = page.getByTitle('Undo');
    const redoBtn = page.getByTitle('Redo');

    await clickCell(page, 0, 1);
    await undoBtn.click();
    await expect(redoBtn).toBeEnabled();
    await redoBtn.click();
    await expect(redoBtn).toBeDisabled();
  });

  test('reset clears the entire board', async ({ page }) => {
    const undoBtn = page.getByTitle('Undo');
    const resetBtn = page.getByTitle('Reset');

    await clickCell(page, 0, 0);
    await clickCell(page, 1, 1);
    await expect(undoBtn).toBeEnabled();

    // Reset triggers window.confirm — accept it
    page.on('dialog', (dialog) => dialog.accept());
    await resetBtn.click();
    await expect(undoBtn).toBeDisabled();
  });

  test('multiple undo steps walk back one at a time', async ({ page }) => {
    const undoBtn = page.getByTitle('Undo');

    await clickCell(page, 0, 0);
    await page.waitForTimeout(60);
    await clickCell(page, 1, 1);
    await page.waitForTimeout(60);
    await clickCell(page, 2, 2);

    await undoBtn.click();
    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();
    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();
    await expect(undoBtn).toBeDisabled();
  });
});

/* ─── Solve puzzle & victory ───────────────────────────────── */

test.describe('Solve puzzle & Victory', () => {
  test('solving the first puzzle shows the victory modal', async ({
    page,
  }) => {
    await goToFirstPuzzle(page);
    await solveHeart(page);

    await expect(page.getByText('Achieved')).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByText('The path is clear. Enlightenment attained.'),
    ).toBeVisible();

    // "Review Trial" closes the modal but stays on play screen
    await page.getByRole('button', { name: /review trial/i }).click();
    await expect(page.getByText('Achieved')).not.toBeVisible();
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
  });

  test('"Ascend Next" advances to next puzzle', async ({ page }) => {
    await goToFirstPuzzle(page);
    await solveHeart(page);
    await expect(page.getByText('Achieved')).toBeVisible({ timeout: 5000 });

    await page.getByRole('button', { name: /ascend next/i }).click();
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
  });

  test('progress updates on home after solving', async ({ page }) => {
    await goToFirstPuzzle(page);
    await solveHeart(page);
    await expect(page.getByText('Achieved')).toBeVisible({ timeout: 5000 });

    // Return home
    await page.getByRole('button', { name: /review trial/i }).click();
    await page
      .locator('button')
      .filter({ hasText: /return to trails/i })
      .first()
      .click();

    // Scoped to the tabular-nums progress counter
    await expect(page.locator('.tabular-nums').first()).toHaveText(/[1-9]\d*\/\d+/);
    const firstCard = page.locator('.oriental-card').first();
    await expect(firstCard.getByText('SUCCESS')).toBeVisible();
  });
});

/* ─── Persistence ──────────────────────────────────────────── */

test.describe('Persistence', () => {
  test('in-progress state survives page reload', async ({ page }) => {
    await goToFirstPuzzle(page);
    await clickCell(page, 0, 1);

    await page.reload();
    await expect(page.getByText('Enlightenment')).toBeVisible();

    // Re-enter the puzzle – canvas renders without error
    await page.locator('.oriental-card').first().click();
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
  });

  test('completed status persists across reloads', async ({ page }) => {
    await goToFirstPuzzle(page);
    await solveHeart(page);
    await expect(page.getByText('Achieved')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: /review trial/i }).click();
    await page
      .locator('button')
      .filter({ hasText: /return to trails/i })
      .first()
      .click();

    await page.reload();
    await expect(page.locator('.tabular-nums').first()).toHaveText(/[1-9]\d*\/\d+/);
  });

  test('localStorage stores grid data', async ({ page }) => {
    await goToFirstPuzzle(page);
    await clickCell(page, 0, 1);
    await page.waitForTimeout(200);

    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys.length).toBeGreaterThan(0);
  });
});

/* ─── Responsive & Accessibility ──────────────────────────── */

test.describe('Responsive & Accessibility', () => {
  test('works on mobile viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.getByText('Trails')).toBeVisible();
    await page.locator('.oriental-card').first().click();
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();

    await context.close();
  });

  test('works on tablet viewport', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    await page.goto('/');

    await expect(page.getByText('Trails')).toBeVisible();
    await page.locator('.oriental-card').first().click();
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();

    await context.close();
  });

  test('no console errors on home and play screens', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(500);
    await page.locator('.oriental-card').first().click();
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });

  test('keyboard navigation: Tab focuses toolbar buttons', async ({
    page,
  }) => {
    await goToFirstPuzzle(page);

    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).toBe('BUTTON');
  });
});

/* ─── Edge cases ──────────────────────────────────────────── */

test.describe('Edge cases', () => {
  test('rapid clicking does not break the board', async ({ page }) => {
    await goToFirstPuzzle(page);

    for (let i = 0; i < 10; i++) {
      await clickCell(page, 0, 0);
    }

    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
  });

  test('switching mode then clicking does not crash', async ({ page }) => {
    await goToFirstPuzzle(page);

    const toggle = page.getByRole('button', {
      name: /switch to (mark|fill) mode/i,
    });
    await toggle.click(); // Switch to mark mode
    await clickCell(page, 0, 0);
    await toggle.click(); // Back to fill mode
    await clickCell(page, 1, 1);

    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
  });

  test('navigating home and back preserves game state', async ({ page }) => {
    await goToFirstPuzzle(page);
    await clickCell(page, 0, 1);
    await page.waitForTimeout(100);

    await page
      .locator('button')
      .filter({ hasText: /return to trails/i })
      .first()
      .click();
    await page.locator('.oriental-card').first().click();
    await expect(page.getByRole('main').locator('canvas')).toBeVisible();
  });
});
