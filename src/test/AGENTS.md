# Test Support

Shared test harness code for Vitest and Testing Library.

## Scope

- `setup.ts` runs before tests and should stay small, deterministic, and framework-level only

## Rules

- Keep this folder free of app logic; helpers here should support many tests, not one component
- Global setup should be idempotent and safe for parallel test execution
- Prefer per-test explicit mocks in colocated test files over hidden global mocks here
- Add cleanup, matcher, timer, or DOM polyfill setup only when multiple test files need it
- If a new global shim changes browser-like behavior, verify impacted tests still reflect real runtime behavior rather than masking bugs
