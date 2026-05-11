#!/usr/bin/env node
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:5173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

// Force light theme
await page.evaluate(() => {
  document.documentElement.dataset.theme = 'light';
  localStorage.setItem('pokemax.theme', 'light');
});
await page.waitForTimeout(500);

await page.locator('button.crt-grid-cell:has-text("cinderace")').click();
await page.waitForSelector('.crt-card', { timeout: 15000 });
await page.waitForTimeout(7000); // Smogon fetch

// Capture build values + their computed colors so we can see if they're invisible
const buildDetails = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('.crt-build-value').forEach((el) => {
    const cs = getComputedStyle(el);
    const innerButton = el.querySelector('.crt-detail-trigger');
    const buttonCs = innerButton ? getComputedStyle(innerButton) : null;
    out.push({
      text: (el.textContent ?? '').trim(),
      color: cs.color,
      buttonColor: buttonCs ? buttonCs.color : null,
      buttonText: innerButton ? (innerButton.textContent ?? '').trim() : null,
    });
  });
  return { bg: getComputedStyle(document.body).backgroundColor, fields: out };
});
console.log('background:', buildDetails.bg);
console.log('build fields:');
for (const f of buildDetails.fields) console.log(' ', f);

await ctx.close();
await browser.close();
