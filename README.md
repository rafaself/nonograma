# 🧩 Nonogram (Picross)

Mobile-responsive Nonogram web app built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🎨 **95 Curated Puzzles** — 5×5, 10×10, 15x15 and 20×20 grids.
- 📱 **Mobile Friendly** — Fill / X mode toggle for touch devices.
- 🖱️ **Desktop Enhanced** — Left-click to fill, right-click to mark X.
- 💾 **Persistence** — Game state and progress saved in `localStorage`.
- ↩️ **Undo** — 50-step undo history.
- 🔄 **Reset** — Restart any puzzle from scratch.
- 👁️ **Visual Feedback** — Clues dim when satisfied.
- 🎉 **Victory Modal** — Celebration when a puzzle is solved.

## 🛠️ Tech Stack

| Layer | Tool |
|-------|------|
| Framework | React 19 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Testing | Vitest + Testing Library + Playwright |

## 🚀 Getting Started

```bash
pnpm install        # install dependencies
pnpm dev            # start dev server
pnpm test           # run unit tests
pnpm test:e2e       # run E2E tests (Playwright)
pnpm build          # production build
```

## 🐳 Docker

```bash
docker compose run --rm coverage   # unit test coverage
docker compose run --rm e2e        # E2E tests (Playwright + Chromium)
```

## 📁 Project Structure

| File | Description |
|------|-------------|
| `src/lib/game-logic.ts` | Nonogram rules, clue generation, win checks |
| `src/lib/persistence.ts` | LocalStorage management |
| `src/data/puzzles.ts` | Curated puzzle definitions |
| `src/App.tsx` | Main UI, routing, and game loop |
| `src/index.css` | Global styles and Tailwind directives |

## 🧱 Puzzle Format

Puzzles follow this structure — clues are derived from `solution` at runtime:

```ts
{
  id: string;
  title: string;
  width: number;
  height: number;
  solution: boolean[][]; // 2D grid of the solved state
}
```

## 📌 Scope

| ✅ In Scope | ❌ Out of Scope |
|-------------|----------------|
| Solving puzzles | Puzzle generator / editor |
| Persistence & undo | User accounts / cloud sync |
| Responsive UI | Hints / cheats |
