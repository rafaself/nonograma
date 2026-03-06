# GitHub Automation

Repository automation and CI configuration.

## Scope

- `workflows/ci.yml` is the main quality gate and should stay aligned with the root `verify` workflow
- `dependabot.yml` and `copilot-instructions.md` support maintenance and external agent guidance

## Rules

- Keep CI on `pnpm`; do not introduce `npm` or `yarn` commands in workflows
- Preserve the core gate sequence: lint, typecheck, audit, unit tests with coverage, build, then Chromium E2E
- If repository commands change, update both workflow files and relevant agent instructions so local guidance matches CI
- Prefer least-privilege GitHub Actions permissions and pin to official actions already used in the repo unless there is a clear reason to expand
- When changing artifacts, coverage paths, or Playwright outputs, keep upload steps consistent so failures remain debuggable in CI
