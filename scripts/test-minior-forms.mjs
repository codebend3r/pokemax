import { chromium } from 'playwright';
const URL = process.env.URL ?? 'http://localhost:5173/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

await page.locator('button.crt-grid-cell:has-text("minior")').first().click();
await page.waitForSelector('.crt-card', { timeout: 15000 });
await page.waitForTimeout(2500);

async function snapshot(label) {
  await page.waitForTimeout(3500);
  return await page.evaluate(() => {
    const img = document.querySelector('.crt-card-top img');
    return img ? {
      src: img.getAttribute('src'),
      natW: img.naturalWidth,
      natH: img.naturalHeight,
    } : null;
  }).then((r) => ({ label, ...r }));
}

const reports = [];
reports.push(await snapshot('BASE'));

const names = [
  'minior-red-meteor', 'minior-blue-meteor', 'minior-violet-meteor',
  'minior-red', 'minior-orange', 'minior-yellow', 'minior-green',
  'minior-blue', 'minior-indigo', 'minior-violet',
];
for (const name of names) {
  const chip = page.locator(`.crt-form-chip[title="${name}"]`).first();
  if (!(await chip.count())) { reports.push({ label: name, skipped: true }); continue; }
  await chip.click();
  reports.push(await snapshot(name));
}

console.log('\n=== MINIOR ALL FORMS ===');
for (const r of reports) {
  if (r.skipped) { console.log(r.label.padEnd(22), '❓ no chip'); continue; }
  const ok = r.natW >= 100 ? '✓' : '❌ TOO SMALL';
  const kind = r.src.includes('official-artwork') ? 'ART ' : r.src.includes('showdown') ? 'SHOW' : 'OTHR';
  console.log(r.label.padEnd(22), kind, `nat=${r.natW}x${r.natH}  ${ok}`);
}
await ctx.close();
await browser.close();
