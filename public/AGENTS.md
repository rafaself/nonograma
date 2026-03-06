# Public Assets

Static files served as-is by Vite.

## Scope

- SEO and PWA metadata: `manifest.webmanifest`, `robots.txt`, `sitemap.xml`
- Social/share and install assets: `logo.png`, `favicon.png`
- Background illustration images under `public/images/`

## Rules

- Keep canonical URLs, sitemap URLs, robots sitemap entry, and SEO tests aligned to the production domain `https://nonograma.alsogravity.com`
- When changing metadata text, colors, icons, or URLs here, update the matching assertions in `e2e/seo.spec.ts`
- Preserve stable asset paths once referenced by meta tags or CSS backgrounds; prefer replacing file contents over renaming files casually
- Compress replacement images and keep dimensions intentional because these files ship directly to the client
- `sitemap.xml` `lastmod` should reflect a real content change date, not an arbitrary edit timestamp
