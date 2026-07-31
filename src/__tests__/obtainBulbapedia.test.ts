import { describe, expect, it } from 'vitest';
import { bulbaNameToSlug, parseTradeLists } from '@/obtain/bulbapedia';

const HTML = `
<h4><span class="mw-headline" id="Pokémon_X_and_Y">Pokémon X and Y</span></h4>
<table class="roundtable"><tbody>
<tr><th>Location</th><th colspan="2">Player's Pokémon</th><th colspan="2">NPC's Pokémon</th></tr>
<tr>
<td><a href="/wiki/Santalune_City" title="Santalune City">Santalune City</a></td>
<td><a href="/wiki/Bunnelby_(Pok%C3%A9mon)" title="Bunnelby (Pokémon)"><img alt="Bunnelby"></a></td>
<td><a href="/wiki/Bunnelby_(Pok%C3%A9mon)" title="Bunnelby (Pokémon)">Bunnelby</a></td>
<td><a href="/wiki/Farfetch%27d_(Pok%C3%A9mon)" title="Farfetch'd (Pokémon)"><img alt="Farfetch'd"></a></td>
<td><a href="/wiki/Farfetch%27d_(Pok%C3%A9mon)" title="Farfetch'd (Pokémon)">Farfetch'd</a></td>
</tr>
</tbody></table>
<h4><span class="mw-headline" id="Pokémon_Stadium_2">Pokémon Stadium 2</span></h4>
<table class="roundtable"><tbody>
<tr><th>Location</th><th>Player's Pokémon</th><th>NPC's Pokémon</th></tr>
<tr>
<td>Somewhere</td>
<td><a href="/wiki/Abra_(Pok%C3%A9mon)" title="Abra (Pokémon)">Abra</a></td>
<td><a href="/wiki/Alakazam_(Pok%C3%A9mon)" title="Alakazam (Pokémon)">Alakazam</a></td>
</tr>
</tbody></table>`;

describe('parseTradeLists', () => {
  it('extracts give/receive/location per mapped game section', () => {
    const trades = parseTradeLists(HTML);
    expect(trades).toEqual([
      {
        versions: ['x', 'y'],
        give: 'bunnelby',
        receive: 'farfetchd',
        location: 'Santalune City',
      },
    ]);
  });
});

describe('bulbaNameToSlug', () => {
  it('handles punctuation, gender marks, and accents', () => {
    expect(bulbaNameToSlug("Farfetch'd")).toBe('farfetchd');
    expect(bulbaNameToSlug('Mr. Mime')).toBe('mr-mime');
    expect(bulbaNameToSlug('Nidoran♀')).toBe('nidoran-f');
    expect(bulbaNameToSlug('Nidoran♂')).toBe('nidoran-m');
    expect(bulbaNameToSlug('Flabébé')).toBe('flabebe');
    expect(bulbaNameToSlug('Type: Null')).toBe('type-null');
    expect(bulbaNameToSlug('Mime Jr.')).toBe('mime-jr');
    expect(bulbaNameToSlug("Farfetch'd")).toBe('farfetchd');
    expect(bulbaNameToSlug("Sirfetch'd")).toBe('sirfetchd');
  });
});
