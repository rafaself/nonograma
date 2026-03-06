import { test, expect } from '@playwright/test';

const SITE_URL = 'https://nonograma.alsogravity.com';
const DESCRIPTION =
  'Play Nonograma, a free oriental-themed Picross puzzle game. Solve 35 handcrafted nonogram puzzles in 5×5, 10×10 and 15×15 grids — right in your browser.';

/* ─── Page title & meta tags ───────────────────────────────── */

test.describe('SEO: head meta tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page title is set correctly', async ({ page }) => {
    await expect(page).toHaveTitle('Nonograma — Oriental Picross');
  });

  test('meta description is present', async ({ page }) => {
    const content = await page
      .locator('meta[name="description"]')
      .getAttribute('content');
    expect(content).toBe(DESCRIPTION);
  });

  test('canonical URL is set', async ({ page }) => {
    const href = await page
      .locator('link[rel="canonical"]')
      .getAttribute('href');
    expect(href).toBe(`${SITE_URL}/`);
  });

  test('theme-color meta tag is present', async ({ page }) => {
    const content = await page
      .locator('meta[name="theme-color"]')
      .getAttribute('content');
    expect(content).toBe('#1a1a2e');
  });

  test('apple-touch-icon is linked', async ({ page }) => {
    const href = await page
      .locator('link[rel="apple-touch-icon"]')
      .getAttribute('href');
    expect(href).toBe('/logo.png');
  });

  test('manifest is linked', async ({ page }) => {
    const href = await page
      .locator('link[rel="manifest"]')
      .getAttribute('href');
    expect(href).toBe('/manifest.webmanifest');
  });
});

/* ─── Open Graph ───────────────────────────────────────────── */

test.describe('SEO: Open Graph tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const ogExpected: Record<string, string> = {
    'og:type': 'website',
    'og:site_name': 'Nonograma',
    'og:title': 'Nonograma — Oriental Picross',
    'og:description': DESCRIPTION,
    'og:url': `${SITE_URL}/`,
    'og:image': `${SITE_URL}/logo.png`,
    'og:image:width': '640',
    'og:image:height': '640',
  };

  for (const [property, expected] of Object.entries(ogExpected)) {
    test(`${property} is set correctly`, async ({ page }) => {
      const content = await page
        .locator(`meta[property="${property}"]`)
        .getAttribute('content');
      expect(content).toBe(expected);
    });
  }
});

/* ─── Twitter Card ─────────────────────────────────────────── */

test.describe('SEO: Twitter Card tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  const twitterExpected: Record<string, string> = {
    'twitter:card': 'summary_large_image',
    'twitter:title': 'Nonograma — Oriental Picross',
    'twitter:description': DESCRIPTION,
    'twitter:image': `${SITE_URL}/logo.png`,
  };

  for (const [name, expected] of Object.entries(twitterExpected)) {
    test(`${name} is set correctly`, async ({ page }) => {
      const content = await page
        .locator(`meta[name="${name}"]`)
        .getAttribute('content');
      expect(content).toBe(expected);
    });
  }
});

/* ─── Structured data (JSON-LD) ────────────────────────────── */

test.describe('SEO: Structured data', () => {
  test('JSON-LD contains WebApplication schema', async ({ page }) => {
    await page.goto('/');
    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .textContent();
    expect(jsonLd).toBeTruthy();

    const data = JSON.parse(jsonLd!);
    expect(data['@type']).toBe('WebApplication');
    expect(data.name).toBe('Nonograma — Oriental Picross');
    expect(data.applicationCategory).toBe('Game');
    expect(data.url).toBe(`${SITE_URL}/`);
    expect(data.offers.price).toBe('0');
  });
});

/* ─── Static SEO files ─────────────────────────────────────── */

test.describe('SEO: static files', () => {
  test('robots.txt is accessible and allows all', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
    expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  test('sitemap.xml is accessible and valid', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain('<urlset');
    expect(body).toContain(`<loc>${SITE_URL}/</loc>`);
    expect(body).toContain('<lastmod>');
  });

  test('manifest.webmanifest is accessible and valid', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name).toBe('Nonograma — Oriental Picross');
    expect(manifest.short_name).toBe('Nonograma');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#1a1a2e');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('logo.png is accessible (used as OG image)', async ({ request }) => {
    const res = await request.get('/logo.png');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });
});
