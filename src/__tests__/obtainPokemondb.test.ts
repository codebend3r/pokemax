import { describe, expect, it } from 'vitest';
import { parseWhereToFind } from '@/obtain/pokemondb';

const HTML = `
<h2>Where to find Testmon</h2>
<div class="resp-scroll">
<table class="vitals-table"><tbody>
<tr>
  <th><span class="igame red">Red</span><br><span class="igame blue">Blue</span></th>
  <td><a href="/location/kanto-power-plant">Power Plant</a>, <a href="/location/kanto-viridian-forest">Viridian Forest</a></td>
</tr>
<tr>
  <th><span class="igame black">Black</span><br><span class="igame white">White</span></th>
  <td><small>Trade/migrate from another game</small></td>
</tr>
<tr>
  <th><span class="igame sword">Sword</span></th>
  <td><small>Evolve <a href="/pokedex/pikachu">Pikachu</a>/<a href="/pokedex/pichu">Pichu</a></small></td>
</tr>
<tr>
  <th><span class="igame scarlet">Scarlet</span><br><span class="igame violet">Violet</span></th>
  <td><small>Not available in this game</small></td>
</tr>
<tr>
  <th><span class="igame legends-arceus">Legends: Arceus</span></th>
  <td><small>Location data not yet available</small></td>
</tr>
</tbody></table>
</div>
<h2>Other</h2>
<table class="vitals-table"><tbody><tr><th>Ignore me</th><td>x</td></tr></tbody></table>`;

describe('parseWhereToFind', () => {
  it('yields wild entries per version from location links', () => {
    const rows = parseWhereToFind(HTML);
    expect(rows.get('red')).toEqual([
      { method: 'wild', location: 'Power Plant' },
      { method: 'wild', location: 'Viridian Forest' },
    ]);
    expect(rows.get('blue')).toEqual(rows.get('red'));
  });

  it('classifies note rows', () => {
    const rows = parseWhereToFind(HTML);
    expect(rows.get('black')?.[0].method).toBe('transfer');
    expect(rows.get('sword')?.[0]).toEqual({ method: 'evolve', detail: 'Evolve Pikachu/Pichu' });
    expect(rows.get('scarlet')?.[0].method).toBe('unavailable');
    expect(rows.get('legends-arceus')?.[0]).toEqual({
      method: 'special',
      detail: 'Location data not yet available',
    });
  });

  it('ignores tables without igame rows', () => {
    expect(parseWhereToFind(HTML).has('Ignore me')).toBe(false);
  });
});
