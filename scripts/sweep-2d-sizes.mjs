import { chromium } from 'playwright';
const URL = process.env.URL ?? 'http://localhost:5173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

const NAMES = [
  'bulbasaur',     // BW
  'charizard',     // BW
  'mewtwo',        // BW
  'lugia',         // BW
  'garchomp',      // BW
  'greninja',      // > BW (id 658 still BW? actually <=649)
  'goodra',        // > BW (id 706 > 649)
  'minior',        // small showdown — must bump
  'koraidon',      // recent
  'eternatus',     // recent
];

const reports = [];
for (const name of NAMES) {
  const cell = page.locator(`button.crt-grid-cell:has-text("${name}")`).first();
  if (!(await cell.count())) { reports.push({ name, skipped: true }); continue; }
  await cell.click();
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    const img = document.querySelector('.crt-card-top img');
    return img ? {
      src: img.getAttribute('src'),
      natW: img.naturalWidth,
      natH: img.naturalHeight,
    } : null;
  });
  reports.push({ name, ...info });
  await page.locator('button.crt-header-link').click();
  await page.waitForTimeout(300);
}

console.log('\n=== 2D SPRITE SWEEP ===');
for (const r of reports) {
  if (r.skipped) { console.log(r.name.padEnd(12), '❓ skipped'); continue; }
  const kind = r.src.includes('black-white') ? 'BW  ' : r.src.includes('showdown') ? 'SHOW' : r.src.includes('official-artwork') ? 'ART ' : 'OTHR';
  const ok = r.natW >= 80 ? '✓' : '❌';
  console.log(r.name.padEnd(12), kind, `nat=${r.natW}x${r.natH}  ${ok}`);
}
await ctx.close();
await browser.close();
