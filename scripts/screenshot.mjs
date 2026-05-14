#!/usr/bin/env node
// Generates the screenshots embedded in README.md.
//
// Everything here uses `fullPage: false` — README images are intentionally clipped
// to the viewport so they read as a wide hero strip instead of a tall scroll capture.
// If you change a viewport, keep height ≤ width to preserve the landscape feel.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs/screenshots');
mkdirSync(out, { recursive: true });

const URL = process.env.URL ?? 'http://localhost:5173/';

async function shot(page, file) {
  await page.screenshot({ path: resolve(out, file), fullPage: false });
  console.log('wrote', file);
}

async function gotoFresh(page) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('.crt-grid-cell', { timeout: 20000 });
  await page.waitForTimeout(900);
}

const browser = await chromium.launch();

// Wide desktop — landscape 16:9-ish, never tall.
{
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // 1. Home — grid + filters in default state
  await gotoFresh(page);
  await shot(page, 'desktop-home.png');

  // 2. Type filter — Fire+Flying combo, showing the matrix in action
  await page.locator('button.crt-tf-chip:has-text("fire")').click();
  await page.waitForTimeout(400);
  await page.locator('button.crt-tf-chip:has-text("flying")').click();
  await page.waitForTimeout(900);
  await shot(page, 'desktop-types-filter.png');

  // Clear types before the next shot
  await page.locator('button.crt-tf-clear').click().catch(() => {});
  await page.waitForTimeout(300);

  // 3. Pokemon card — pick an iconic gen-1 species (Charizard) so the card hero
  //    feels familiar and the type chips are bright red/orange. Drive it via the
  //    search bar instead of clicking the grid cell, since the grid paginates and
  //    Charizard might not be on the visible page.
  const cardSearch = page.locator('input[aria-label="search pokemon"]').first();
  await cardSearch.fill('charizard');
  await cardSearch.press('Enter');
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(1600);
  // Scroll so the card header + stats fill the viewport, not the page nav
  await page.locator('.crt-card').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, 'desktop-card.png');

  // 4. Type matchup — click the first type chip on the open card to expand the matchup grid
  await page.locator('.crt-card .crt-type').first().click();
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const el = document.querySelector('.crt-card .crt-type');
    if (el) el.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(300);
  await shot(page, 'desktop-type-matchup.png');

  // 5. Alt forms — turn on the MEGA chip so the grid surfaces mega forms inline
  //    with their base species. Showcases a feature unique to this app.
  await gotoFresh(page);
  await page.locator('button.crt-extra-chip:has-text("MEGA / PRIMAL")').click();
  await page.waitForTimeout(1500);
  await shot(page, 'desktop-forms.png');

  await ctx.close();
}

// Mobile — phone aspect, but we cap the viewport height (and use 2× DPI rather than
// 3×) so the resulting PNG isn't a giant scroll. Aspect ≈ 414:620, which renders as
// a tidy phone-shaped tile when placed side-by-side in the README.
{
  const ctx = await browser.newContext({ viewport: { width: 414, height: 620 }, deviceScaleFactor: 2, isMobile: true });
  const page = await ctx.newPage();

  // Home: scroll past the filters so the grid is visible — that's the headline
  // mobile feature, not the toolbar.
  await gotoFresh(page);
  await page.evaluate(() => {
    const grid = document.querySelector('.crt-grid');
    if (grid) grid.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(400);
  await shot(page, 'mobile-home.png');

  // Card: zacian is a clean visual (one type chip, bold colors).
  const mSearch = page.locator('input[aria-label="search pokemon"]').first();
  await mSearch.click();
  await mSearch.fill('zacian');
  await mSearch.press('Enter');
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(1600);
  await page.locator('.crt-card').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await shot(page, 'mobile-card.png');
  await ctx.close();
}

await browser.close();
console.log('done');
