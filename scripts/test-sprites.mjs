#!/usr/bin/env node
import { chromium } from 'playwright';

const URL = process.env.URL ?? 'http://localhost:5173/';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

async function check(name) {
  console.log(`\n--- ${name.toUpperCase()} ---`);
  await page.locator(`button.crt-grid-cell:has-text("${name}")`).first().click();
  await page.waitForSelector('.crt-card-top img', { timeout: 15000 });
  await page.waitForTimeout(3000);
  const def = await page.locator('.crt-card-top img').first().evaluate((el) => el.getAttribute('src'));
  console.log('default (should be 2D):', def);

  await page.locator('button:has-text("[ 3D ]")').click();
  await page.waitForTimeout(2000);
  const d3 = await page.locator('.crt-card-top img').first().evaluate((el) => el.getAttribute('src'));
  console.log('3D:', d3);

  await page.locator('button:has-text("[ 2D ]")').click();
  await page.waitForTimeout(2000);
  const d2 = await page.locator('.crt-card-top img').first().evaluate((el) => el.getAttribute('src'));
  console.log('2D:', d2);

  console.log('2D ≠ 3D?', d2 !== d3);
  console.log('default is 2D?', def === d2);

  // Back to home for next iteration
  await page.locator('button.crt-header-link').click();
  await page.waitForTimeout(500);
}

await check('charizard');
await check('eternatus');
await check('cinderace');
await check('mewtwo');

await ctx.close();
await browser.close();
