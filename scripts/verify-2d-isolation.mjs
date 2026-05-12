import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const NAMES = [
  ['bulbasaur', 'BW'],
  ['charizard', 'BW'],
  ['lugia', 'BW'],
  ['greninja', 'BW'], // 658, in BW range
  ['goodra', 'ART'],  // small showdown, should bump
  ['minior', 'ART'],  // small showdown, should bump
  ['koraidon', 'SHOW'],
  ['eternatus', 'SHOW'],
];

const results = [];
for (const [name, expected] of NAMES) {
  const page = await ctx.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });
  await page.locator(`button.crt-grid-cell:has-text("${name}")`).first().click();
  await page.waitForSelector('.crt-card', { timeout: 15000 });
  await page.waitForTimeout(4000);
  const r = await page.evaluate(() => {
    const img = document.querySelector('.crt-card-top img');
    return img ? { src: img.getAttribute('src'), nat: img.naturalWidth + 'x' + img.naturalHeight } : null;
  });
  const kind = r.src.includes('black-white') ? 'BW' : r.src.includes('showdown') ? 'SHOW' : r.src.includes('official-artwork') ? 'ART' : 'OTHR';
  const ok = kind === expected ? '✓' : `✗ (got ${kind})`;
  results.push({ name, expected, kind, ok, nat: r.nat });
  await page.close();
}

console.log('\n=== ISOLATED 2D SPRITE VERIFICATION ===');
for (const r of results) {
  console.log(`${r.name.padEnd(12)} expect=${r.expected.padEnd(4)} got=${r.kind.padEnd(4)} ${r.nat.padEnd(10)} ${r.ok}`);
}
await ctx.close();
await browser.close();
