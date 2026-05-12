import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', m => console.log('[page', m.type() + ']', m.text()));
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });
await page.locator('button.crt-grid-cell:has-text("charizard")').first().click();
await page.waitForSelector('.crt-card', { timeout: 15000 });

// Take readings over time
for (const t of [500, 1500, 3000, 5000, 8000]) {
  await page.waitForTimeout(t === 500 ? 500 : t - 500);
  const r = await page.evaluate(() => {
    const img = document.querySelector('.crt-card-top img');
    return img ? { src: img.getAttribute('src'), nat: img.naturalWidth + 'x' + img.naturalHeight } : null;
  });
  console.log(`t=${t}ms`, r);
}
await ctx.close();
await browser.close();
