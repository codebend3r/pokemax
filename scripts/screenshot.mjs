#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs/screenshots');
mkdirSync(out, { recursive: true });

const URL = process.env.URL ?? 'http://localhost:5173/';

async function shot(page, file) {
  await page.screenshot({ path: resolve(out, file), fullPage: true });
  console.log('wrote', file);
}

const browser = await chromium.launch();

// Desktop home (Gen VIII default)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });
  await page.waitForTimeout(800);
  await shot(page, 'desktop-home.png');

  // Switch to Gen 1 (Kanto)
  await page.locator('button.crt-tab:has-text("Kanto")').click();
  await page.waitForTimeout(1500);
  await shot(page, 'desktop-gen1.png');

  // Click Charizard
  await page.locator('button.crt-grid-cell:has-text("charizard")').click();
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shot(page, 'desktop-card.png');

  // Switch back to Gen 8 and click Dragapult, expand a type
  await page.locator('button.crt-tab:has-text("Galar")').click();
  await page.waitForTimeout(1200);
  await page.locator('button.crt-grid-cell:has-text("dragapult")').click();
  await page.waitForTimeout(1500);
  await page.locator('.crt-type').first().click();
  await page.waitForTimeout(800);
  await shot(page, 'desktop-type-matchup.png');

  await ctx.close();
}

// Mobile home (Gen VIII default)
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });
  await page.waitForTimeout(800);
  await shot(page, 'mobile-home.png');

  await page.locator('button.crt-grid-cell:has-text("zacian")').click();
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shot(page, 'mobile-card.png');

  await ctx.close();
}

await browser.close();
console.log('done');
