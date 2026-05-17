import { existsSync, readFileSync } from 'node:fs';

const wranglerConfig = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');

const requiredPatterns = [
  {
    description: 'pages build output directory',
    pattern: /^pages_build_output_dir = "\.\/dist"$/m,
  },
  {
    description: 'pages build section',
    pattern: /^\[build\]$/m,
  },
  {
    description: 'pages build command',
    pattern: /^command = "pnpm build"$/m,
  },
];

for (const { description, pattern } of requiredPatterns) {
  if (!pattern.test(wranglerConfig)) {
    throw new Error(`wrangler.toml is missing the required ${description} entry.`);
  }
}

if (!existsSync(new URL('../dist', import.meta.url))) {
  throw new Error('dist/ was not generated. Run the configured Pages build command before validating.');
}
