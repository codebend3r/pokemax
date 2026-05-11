#!/usr/bin/env node
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:5173/';
const NAMES = [
  'bulbasaur',
  'charizard',
  'pikachu',
  'lugia',
  'mewtwo',
  'garchomp',
  'greninja',
  'goodra',
  'articuno',
  'koraidon',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

for (const name of NAMES) {
  await page.locator(`button.crt-grid-cell:has-text("${name}")`).first().click();
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(4500); // Smogon fetch

  const header = await page.locator('.crt-section').filter({ hasText: 'COMPETITIVE BUILD' }).locator('.crt-section-count').textContent().catch(() => '');
  const labelValuePairs = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('.crt-build-label')).map((el) => el.textContent ?? '');
    const values = Array.from(document.querySelectorAll('.crt-build-value')).map((el) => el.textContent ?? '');
    return { labels, values };
  });

  console.log('\n=== ' + name.toUpperCase() + ' ===');
  console.log('source/tier:', header?.trim());
  for (let i = 0; i < labelValuePairs.labels.length; i++) {
    const l = labelValuePairs.labels[i];
    const v = labelValuePairs.values[i];
    const mark = !v || v.trim() === '—' ? ' ⚠️ ' : '';
    console.log(' ', mark, l, '=', v);
  }

  // First flavor entry
  const flavor = await page.locator('.crt-pokedex-entry-item p').first().textContent().catch(() => null);
  if (flavor) console.log('  flavor[0]:', flavor.slice(0, 130));

  // Back to grid
  await page.locator('button.crt-header-link').click();
  await page.waitForTimeout(400);
}

await ctx.close();
await browser.close();
