import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const wranglerConfig = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');

const requiredPatterns = [
  {
    description: 'pages project name',
    pattern: /^name = "nonogram"$/m,
  },
  {
    description: 'compatibility date',
    pattern: /^compatibility_date = "\d{4}-\d{2}-\d{2}"$/m,
  },
  {
    description: 'pages build output directory',
    pattern: /^pages_build_output_dir = "\.\/dist"$/m,
  },
];

for (const { description, pattern } of requiredPatterns) {
  if (!pattern.test(wranglerConfig)) {
    throw new Error(`wrangler.toml is missing the required ${description} entry.`);
  }
}

if (/^\[build\]$/m.test(wranglerConfig)) {
  throw new Error('wrangler.toml contains an unsupported [build] section for Cloudflare Pages. Configure the Git-integrated Pages build command in the Cloudflare dashboard instead.');
}

if (!existsSync(new URL('../dist', import.meta.url))) {
  throw new Error('dist/ was not generated. Run pnpm build before validating, and set the Cloudflare Pages dashboard Build command to `pnpm build` for Git-integrated deployments.');
}

const distStatus = execFileSync('git', ['status', '--porcelain', '--', 'dist'], {
  cwd: new URL('..', import.meta.url),
  encoding: 'utf8',
}).trim();

if (distStatus.length > 0) {
  throw new Error('dist/ is out of date. Run pnpm build and commit the resulting dist/ changes so Cloudflare Pages Git integration has deployable assets.');
}
