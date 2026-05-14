import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.crt-grid-cell', { timeout: 15000 });
await page.evaluate(() => {
  document.documentElement.setAttribute('data-theme', 'dark');
  try {
    localStorage.setItem('pokemax-theme', 'dark');
  } catch {}
});
await page.waitForTimeout(400);

function parseColor(s) {
  let m = s.match(/rgba?\(([^)]+)\)/);
  if (m)
    return m[1]
      .split(',')
      .map((x) => parseFloat(x.trim()))
      .slice(0, 3);
  m = s.match(/color\(srgb\s+([^)]+)\)/);
  if (m)
    return m[1]
      .split(/\s+/)
      .map((x) => parseFloat(x) * 255)
      .slice(0, 3);
  return null;
}
function lum(rgb) {
  const a = rgb.map((v) => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function contrast(c1, c2) {
  const l1 = lum(c1),
    l2 = lum(c2);
  return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
}

const types = [
  'normal',
  'fire',
  'water',
  'bug',
  'rock',
  'steel',
  'ice',
  'electric',
  'ghost',
  'dark',
];
console.log('\n=== DARK MODE TYPE CHIPS ===');
for (const t of types) {
  const c = await page.evaluate((type) => {
    const btn = Array.from(document.querySelectorAll('.crt-tf-chip')).find(
      (b) => b.textContent.trim().toLowerCase() === type,
    );
    if (!btn) return null;
    const cs = getComputedStyle(btn);
    return { color: cs.color, bg: cs.backgroundColor, border: cs.borderColor };
  }, t);
  const fg = parseColor(c.color),
    bg = parseColor(c.bg);
  // The chip is on the page bg (dark), but its own bg overlay is rgba(0,0,0,0.3).
  // For practical contrast, compute against the page bg color.
  const pageBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const pageBgRgb = parseColor(pageBg);
  // The chip bg is rgba(0,0,0,0.3) on top of pageBg. Effective bg = mix.
  const effBg = bg && bg[0] !== undefined ? bg : pageBgRgb;
  const r = contrast(fg, effBg);
  console.log(`${t.padEnd(10)} ratio=${r.toFixed(2)}  fg=${c.color}  bg=${c.bg}`);
}
await ctx.close();
await browser.close();
