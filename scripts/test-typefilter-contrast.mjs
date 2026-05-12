import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'docs/screenshots');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });

// Force light theme
await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'light');
  try { localStorage.setItem('pokemax-theme', 'light'); } catch {}
});
await page.waitForTimeout(400);

// Helper: relative luminance + contrast
function lum(rgb) {
  const a = rgb.map(v => {
    v = v / 255;
    return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
  });
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}
function parseColor(s) {
  let m = s.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(',').map(x => parseFloat(x.trim()));
    return parts.slice(0,3);
  }
  m = s.match(/color\(srgb\s+([^)]+)\)/);
  if (m) {
    const parts = m[1].split(/\s+/).map(x => parseFloat(x) * 255);
    return parts.slice(0,3);
  }
  return null;
}
function contrast(c1, c2) {
  const l1 = lum(c1), l2 = lum(c2);
  const [hi,lo] = l1>l2 ? [l1,l2] : [l2,l1];
  return (hi+0.05)/(lo+0.05);
}

const TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];
const readings = [];
for (const t of TYPES) {
  const c = await page.evaluate((type) => {
    const btn = Array.from(document.querySelectorAll('.crt-tf-chip')).find(b => b.textContent.trim().toLowerCase() === type);
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    return { color: cs.color, bg: cs.backgroundColor, border: cs.borderColor };
  }, t);
  if (!c) { readings.push({ t, skipped: true }); continue; }
  const fg = parseColor(c.color);
  const bg = parseColor(c.bg);
  const ratio = fg && bg ? contrast(fg, bg) : null;
  readings.push({ t, color: c.color, bg: c.bg, ratio });
}

console.log('\n=== LIGHT-MODE TYPE CHIP CONTRAST ===');
console.log('(WCAG: ≥4.5 normal text, ≥3.0 large text)');
for (const r of readings) {
  if (r.skipped) { console.log(r.t.padEnd(10), 'skipped'); continue; }
  if (r.ratio == null) { console.log(r.t.padEnd(10), 'no ratio  fg=', r.color, ' bg=', r.bg); continue; }
  const flag = r.ratio >= 4.5 ? '✓' : r.ratio >= 3.0 ? '⚠ marginal' : '❌ fail';
  console.log(`${r.t.padEnd(10)} ratio=${r.ratio.toFixed(2)}  ${flag}  fg=${r.color}  bg=${r.bg}`);
}

await page.screenshot({ path: resolve(out, 'typefilter-light.png'), clip: { x: 0, y: 200, width: 1280, height: 220 } });
await ctx.close();
await browser.close();
