#!/usr/bin/env node
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:5173/';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

page.on('console', (m) => console.log('[browser]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[browser-error]', e.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

await page.locator('button.crt-grid-cell:has-text("eternatus")').click();
await page.waitForSelector('.crt-card-top img', { timeout: 15000 });

// Wait longer for fallback chain to settle
await page.waitForTimeout(4000);

const card3d = await page
  .locator('.crt-card-top img')
  .first()
  .evaluate((el) => ({
    src: el.getAttribute('src'),
    complete: el.complete,
    naturalWidth: el.naturalWidth,
  }));
console.log('3D (after 4s):', card3d);

await page.locator('button:has-text("[ 2D ]")').click();
await page.waitForTimeout(3000);

const card2d = await page
  .locator('.crt-card-top img')
  .first()
  .evaluate((el) => ({
    src: el.getAttribute('src'),
    complete: el.complete,
    naturalWidth: el.naturalWidth,
  }));
console.log('2D (after toggle):', card2d);

await page.locator('button:has-text("[ 3D ]")').click();
await page.waitForTimeout(3000);

const back3d = await page
  .locator('.crt-card-top img')
  .first()
  .evaluate((el) => ({
    src: el.getAttribute('src'),
    complete: el.complete,
    naturalWidth: el.naturalWidth,
  }));
console.log('3D again:', back3d);

console.log('---');
console.log('2D and 3D differ?      ', card2d.src !== card3d.src);

await ctx.close();
await browser.close();
