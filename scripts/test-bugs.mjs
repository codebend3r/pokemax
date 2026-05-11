#!/usr/bin/env node
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:5173/';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('console', (m) => console.log('[browser]', m.type(), m.text().slice(0, 200)));
page.on('pageerror', (e) => console.log('[browser-error]', e.message));

await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

// BUG 1: Competitive build values blank
console.log('\n=== BUG 1: COMPETITIVE BUILD (Cinderace) ===');
await page.locator('button.crt-grid-cell:has-text("cinderace")').click();
await page.waitForSelector('.crt-card', { timeout: 15000 });
await page.waitForTimeout(8000); // Wait for Smogon fetch

// Dump the entire COMPETITIVE BUILD section text
const compSection = page.locator('.crt-section').filter({ hasText: 'COMPETITIVE BUILD' }).first();
const compText = await compSection.textContent();
console.log('comp section text:', compText?.slice(0, 600));

const buildBlock = await page.locator('.crt-build').textContent().catch(() => null);
console.log('.crt-build text:', buildBlock?.slice(0, 400));

const buildEmpty = await page.locator('.crt-build-empty').textContent().catch(() => null);
console.log('.crt-build-empty text:', buildEmpty);

const buildLabels = await page.locator('.crt-build-label').allTextContents();
const buildValues = await page.locator('.crt-build-value').allTextContents();
console.log('build labels:', buildLabels);
console.log('build values:', buildValues);

// BUG 2: Alt forms don't show
console.log('\n=== BUG 2: ALT FORMS ===');
await page.locator('button.crt-header-link').click();
await page.waitForTimeout(800);

const beforeCount = await page.locator('.crt-grid-cell').count();
console.log('cells before mega:', beforeCount);

// Watch for the API call
let formsResponse = null;
page.on('response', async (r) => {
  if (r.url().includes('/pokemon?limit=')) {
    formsResponse = { status: r.status(), url: r.url() };
  }
});

await page.locator('button.crt-extra-chip:has-text("MEGA / PRIMAL")').click();
console.log('chip aria-pressed after click:',
  await page.locator('button.crt-extra-chip:has-text("MEGA / PRIMAL")').getAttribute('aria-pressed'));

await page.waitForTimeout(8000);

console.log('forms fetch response:', formsResponse);

const afterCount = await page.locator('.crt-grid-cell').count();
console.log('cells after mega:', afterCount);

const megaSampleNames = await page.locator('.crt-grid-cell .crt-grid-name').evaluateAll((els) =>
  els.slice(0, 12).map((el) => el.textContent),
);
console.log('first 12 names:', megaSampleNames);

const megaChipText = await page.locator('button.crt-extra-chip:has-text("MEGA / PRIMAL")').textContent();
console.log('MEGA chip text:', megaChipText);

await ctx.close();
await browser.close();
