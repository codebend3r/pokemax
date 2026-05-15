#!/usr/bin/env node
// Generate per-Pokémon OG card images for social-link unfurls.
//
// One-species prototype: `node scripts/og-generate.mjs pikachu`
// Outputs dist/og/<id>.png (also writes the source HTML to /tmp/og-preview.html for iteration).

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'dist/og');
mkdirSync(OUT, { recursive: true });

// Snapshot of TYPE_COLORS — kept in sync with src/typeChart.ts.
const TYPE_COLORS = {
  normal: '#a8a878', fire: '#f08030', water: '#6890f0', electric: '#f8d030',
  grass: '#78c850', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0',
  ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820',
  rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848',
  steel: '#b8b8d0', fairy: '#ee99ac',
};

async function fetchSpecies(slug) {
  const pkm = await fetch(`https://pokeapi.co/api/v2/pokemon/${slug}`).then((r) => r.json());
  const sp = await fetch(pkm.species.url).then((r) => r.json());
  const flavor = sp.flavor_text_entries.find((f) => f.language.name === 'en');
  const blurb = (flavor?.flavor_text ?? '').replace(/[\n\f]/g, ' ').replace(/\s+/g, ' ').trim();
  const genus = (sp.genera.find((g) => g.language.name === 'en')?.genus ?? '').replace(/Pokémon/i, '').trim();
  return {
    id: pkm.id,
    name: pkm.name,
    genus,
    types: pkm.types.map((t) => t.type.name),
    artwork: pkm.sprites.other['official-artwork'].front_default,
    blurb,
  };
}

const typeChip = (t) => {
  const c = TYPE_COLORS[t] ?? '#00ff9f';
  return `<span class="type" style="color:${c};border-color:${c}">${t.toUpperCase()}</span>`;
};

function renderHtml(p) {
  const dex = `#${String(p.id).padStart(3, '0')}`;
  const name = p.name.replace(/-/g, ' ').toUpperCase();
  const genus = (p.genus || '').toUpperCase();
  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg: #0a0e27;
    --bg-elev: #131838;
    --primary: #00ff9f;
    --accent: #ff00aa;
    --tertiary: #4dd2ff;
    --dim: rgba(168, 240, 215, 0.85);
    --border: rgba(0, 255, 159, 0.55);
  }
  * { box-sizing: border-box; }
  body { margin:0; padding:0; background: var(--bg); font-family: 'Pixelify Sans', 'Courier New', monospace; color: var(--primary); -webkit-font-smoothing: antialiased; }
  .og { width: 1200px; height: 630px; position: relative; overflow: hidden; }
  .scanlines { position:absolute; inset:0; background: repeating-linear-gradient(180deg, transparent 0 2px, rgba(0,0,0,0.28) 2px 3px); pointer-events:none; z-index:5; }
  .frame { position:absolute; inset:24px; border:2px solid var(--border); padding: 28px 44px; display:grid; grid-template-columns: 540px 1fr; gap: 28px; align-items: center; }
  .corner { position:absolute; width:18px; height:18px; border:2px solid var(--primary); }
  .c-tl { top:-2px; left:-2px; border-right:none; border-bottom:none; }
  .c-tr { top:-2px; right:-2px; border-left:none; border-bottom:none; }
  .c-bl { bottom:-2px; left:-2px; border-right:none; border-top:none; }
  .c-br { bottom:-2px; right:-2px; border-left:none; border-top:none; }
  .art-cell { display:flex; align-items:center; justify-content:center; height:100%; position:relative; }
  .art-cell::before {
    content:''; position:absolute; inset:10px; border-radius:50%;
    background: radial-gradient(closest-side, rgba(0,255,159,0.18), rgba(0,255,159,0.04) 60%, transparent 75%);
    filter: blur(2px);
  }
  .artwork { position:relative; max-width:500px; max-height:520px; object-fit:contain; filter: drop-shadow(0 0 24px rgba(0,255,159,0.35)); }
  .meta { display:flex; flex-direction:column; gap:10px; padding-right: 12px; }
  .label-row { display:flex; align-items:center; gap:14px; }
  .pokedex-tag { color: var(--accent); font-size: 22px; letter-spacing: 0.12em; }
  .dex { color: var(--tertiary); font-size: 30px; letter-spacing: 0.06em; }
  .name { font-size: 78px; font-weight: 700; color: var(--primary); line-height: 1; margin: 6px 0 0; text-shadow: 0 0 14px rgba(0,255,159,0.45); letter-spacing: 0.02em; word-break: break-word; }
  .genus { color: var(--dim); font-size: 22px; letter-spacing: 0.08em; margin-top: 4px; }
  .types { display:flex; gap:10px; flex-wrap:wrap; margin-top: 14px; }
  .type { padding: 6px 14px; border: 2px solid; border-radius: 999px; font-size: 20px; letter-spacing: 0.1em; background: rgba(0,0,0,0.25); }
  .blurb { color: var(--dim); font-size: 22px; line-height: 1.35; margin-top: 18px; max-height: 116px; overflow: hidden; }
  .brand { position: absolute; bottom: 22px; right: 36px; color: var(--accent); font-size: 22px; letter-spacing: 0.22em; z-index: 6; }
  .brand .caret { color: var(--primary); margin-right: 8px; }
</style></head>
<body><div class="og">
  <div class="frame">
    <div class="corner c-tl"></div><div class="corner c-tr"></div>
    <div class="corner c-bl"></div><div class="corner c-br"></div>
    <div class="art-cell"><img class="artwork" src="${p.artwork}" crossorigin="anonymous"/></div>
    <div class="meta">
      <div class="label-row">
        <span class="pokedex-tag">▶ POKÉDEX ENTRY</span>
        <span class="dex">${dex}</span>
      </div>
      <div class="name">${name}</div>
      ${genus ? `<div class="genus">${genus}</div>` : ''}
      <div class="types">${p.types.map(typeChip).join('')}</div>
      ${p.blurb ? `<div class="blurb">${p.blurb}</div>` : ''}
    </div>
  </div>
  <div class="brand"><span class="caret">▌</span>POKEMAX</div>
  <div class="scanlines"></div>
</div></body></html>`;
}

const slug = process.argv[2] ?? 'pikachu';
console.log('fetching', slug, '…');
const data = await fetchSpecies(slug);
const html = renderHtml(data);
writeFileSync('/tmp/og-preview.html', html);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('file:///tmp/og-preview.html', { waitUntil: 'networkidle' });
await page.waitForFunction(() => document.fonts && document.fonts.ready).catch(() => {});
await page.waitForTimeout(500);

const out = resolve(OUT, `${data.id}.png`);
await page.screenshot({ path: out, type: 'png' });
await browser.close();
console.log('wrote', out);
