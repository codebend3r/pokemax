#!/usr/bin/env node
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:5173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

await page.locator('button.crt-grid-cell:has-text("mewtwo")').first().click();
await page.waitForSelector('.crt-card', { timeout: 15000 });
await page.waitForTimeout(8000);

const text = await page.locator('.crt-section').filter({ hasText: 'COMPETITIVE BUILD' }).textContent();
console.log('section header + body:', text?.slice(0, 600));

const pairs = await page.evaluate(() => {
  const labels = Array.from(document.querySelectorAll('.crt-build-label')).map((el) => el.textContent);
  const values = Array.from(document.querySelectorAll('.crt-build-value')).map((el) => el.textContent);
  return { labels, values };
});
console.log('label→value pairs:');
for (let i = 0; i < pairs.labels.length; i++) {
  console.log(' ', pairs.labels[i], '=', pairs.values[i] ?? '(no value)');
}

await ctx.close();
await browser.close();
