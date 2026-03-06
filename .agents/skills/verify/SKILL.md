---
name: verify
description: Run the full quality pipeline — lint, type-check, unit tests (with 100% coverage), production build, and optionally E2E tests. Use after any code change to validate before committing.
---

# Verify

Run every quality gate in the correct order. Stop at the first failure and report clearly.

## Steps

1. **Lint** — `pnpm lint`
2. **Type-check** — `npx tsc --noEmit`
3. **Unit tests with coverage** — `pnpm test -- --coverage`
   - Coverage thresholds are 100% for lines, functions, branches, and statements.
   - If coverage drops, identify uncovered lines and either add tests or wrap truly untestable code (canvas/WebGL/ResizeObserver DOM APIs) in `/* c8 ignore start */` / `/* c8 ignore stop */`.
4. **Production build** — `pnpm build`
   - This runs puzzle solvability tests first, then `tsc -b`, then `vite build`.
5. **(Optional) E2E tests** — `pnpm test:e2e:ci` (chromium only, faster) or `pnpm test:e2e` (all browsers).
   - Only run if changes touch UI, navigation, persistence, or canvas interaction.

## Failure handling

- **Lint errors**: fix them. Prefer auto-fix (`pnpm lint --fix`) for formatting issues.
- **Type errors**: resolve strict TS issues. Remember: `exactOptionalPropertyTypes`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` are all enabled.
- **Test failures**: read the failure output, fix the source or test as appropriate.
- **Coverage gaps**: add missing tests. Use `/* c8 ignore */` only for code that physically cannot run in jsdom (canvas drawing, WebGL, ResizeObserver).
- **Build failures**: puzzle solvability tests run first during build. If a puzzle was modified, check that its solution grid is valid and clues are derivable.
