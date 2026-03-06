# Src Root

App shell and bootstrap files live here. Keep guidance here limited to cross-cutting source concerns that do not belong to a single feature folder.

## File Roles

- `App.tsx` composes the whole SPA shell: background chrome, screen switching, global toolbar, and the victory modal wiring
- `main.tsx` is the Vite bootstrap only; keep it minimal and free of app logic
- `index.css` owns global visual tokens, app-wide utility classes, and background/decorative animations

## Rules

- Keep game state, history, persistence, and screen transitions in `useNonogramGame`; `App.tsx` should stay orchestration-only
- Do not move screen-specific rendering logic into `App.tsx`; delegate to `src/screens` and `src/components`
- Add global CSS only when a style is reused across screens or must exist outside a component boundary; otherwise keep styles closer to the owning component
- `App.tsx` currently default-exports `App` for the Vite entrypoint. Do not treat that as a precedent for new modules; keep named exports everywhere else unless you are intentionally normalizing the entrypoint too
- When changing global metadata, shell layout, or CSS classes relied on by Playwright, update E2E coverage as needed
