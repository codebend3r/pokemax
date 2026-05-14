#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs/screenshots');
mkdirSync(out, { recursive: true });

const URL = process.env.URL ?? 'http://localhost:5173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

await page.locator('button.crt-grid-cell:has-text("minior")').first().click();
await page.waitForSelector('.crt-card', { timeout: 15000 });
await page.waitForTimeout(3500);

// Inspect layout dimensions
const layout = await page.evaluate(() => {
  const card = document.querySelector('.crt-card');
  const cardTop = document.querySelector('.crt-card-top');
  const cardArt = document.querySelector('.crt-card-art');
  const cardMeta = document.querySelector('.crt-card-meta');
  const forms = document.querySelector('.crt-forms');
  const formsRow = document.querySelector('.crt-forms-row');

  function box(el) {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  }
  return {
    card: box(card),
    cardTop: box(cardTop),
    cardArt: box(cardArt),
    cardMeta: box(cardMeta),
    forms: box(forms),
    formsRow: box(formsRow),
    chipCount: document.querySelectorAll('.crt-form-chip').length,
    chipLabels: Array.from(document.querySelectorAll('.crt-form-chip')).map((el) => el.textContent),
  };
});
console.log(JSON.stringify(layout, null, 2));

await page.screenshot({
  path: resolve(out, 'minior-layout.png'),
  clip: { x: 0, y: 0, width: 1280, height: 900 },
});
await ctx.close();
await browser.close();
