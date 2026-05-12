#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs/screenshots/sweep');
mkdirSync(out, { recursive: true });

const URL = process.env.URL ?? 'http://localhost:5173/';
const NAMES = [
  ['bulbasaur',  'baseline, no forms'],
  ['minior',     '14 forms'],
  ['vivillon',   '20 forms'],
  ['alcremie',   '70+ forms'],
  ['genesect',   '5 drives'],
  ['toxtricity', '2 forms'],
  ['urshifu',    '2 styles'],
  ['zacian',     '2 forms'],
  ['calyrex',    '2 riders'],
  ['rotom',      '5 appliances'],
  ['deoxys',     '4 forms'],
  ['tauros',     'paldean variants'],
  ['greninja',   'ash form'],
  ['lugia',      'baseline legendary'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

const reports = [];

for (const [name, note] of NAMES) {
  const target = page.locator(`button.crt-grid-cell:has-text("${name}")`).first();
  if (!(await target.count())) {
    reports.push({ name, note, skipped: 'no grid cell' });
    continue;
  }
  await target.click();
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(3000);

  const m = await page.evaluate(() => {
    const card = document.querySelector('.crt-card');
    const cardTop = document.querySelector('.crt-card-top');
    const cardArt = document.querySelector('.crt-card-art');
    const cardMeta = document.querySelector('.crt-card-meta');
    const sprite = document.querySelector('.crt-card-top img');
    const forms = document.querySelectorAll('.crt-form-chip').length;
    function b(el) { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) }; }
    return { card: b(card), cardTop: b(cardTop), cardArt: b(cardArt), cardMeta: b(cardMeta), sprite: b(sprite), forms };
  });

  // Detect overflow: art shouldn't extend past card; meta shouldn't be < 200px
  const cardRight = (m.card?.x ?? 0) + (m.card?.w ?? 0);
  const artRight = (m.cardArt?.x ?? 0) + (m.cardArt?.w ?? 0);
  const overflow = artRight > cardRight + 1 || (m.cardArt?.x ?? 0) < (m.card?.x ?? 0);
  const metaTooSmall = (m.cardMeta?.w ?? 0) < 200;

  reports.push({ name, note, ...m, overflow, metaTooSmall });
  await page.screenshot({ path: resolve(out, `${name}.png`), clip: { x: 0, y: 0, width: 1280, height: 520 } });

  await page.locator('button.crt-header-link').click();
  await page.waitForTimeout(400);
}

await ctx.close();
await browser.close();

console.log('\n=== LAYOUT SWEEP ===');
for (const r of reports) {
  if (r.skipped) {
    console.log(`${r.name.padEnd(12)} ❓ ${r.skipped}`);
    continue;
  }
  const flag = r.overflow ? '❌ OVERFLOW' : r.metaTooSmall ? '⚠ META TOO SMALL' : '✓';
  console.log(`${r.name.padEnd(12)} ${flag}  forms=${r.forms}  art=${r.cardArt?.w}  meta=${r.cardMeta?.w}  sprite=${r.sprite?.w}x${r.sprite?.h}  (${r.note})`);
}
