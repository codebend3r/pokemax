import { parse } from 'node-html-parser';
import type { ObtainEntry } from '@/obtain/types';

function classifyNote(text: string): ObtainEntry {
  const detail = text.replace(/\s+/g, ' ').trim();
  if (/^trade\/migrate/i.test(detail)) return { method: 'transfer', detail };
  if (/^not available/i.test(detail)) return { method: 'unavailable', detail };
  if (/^evolve/i.test(detail)) return { method: 'evolve', detail };
  if (/^breed/i.test(detail)) return { method: 'egg', detail };
  return { method: 'special', detail };
}

/**
 * Parses the "Where to find" vitals table on a pokemondb.net pokedex page.
 * Returns entries keyed by the `igame` class slug, which matches PokéAPI
 * version names ('red', 'black-2', 'lets-go-pikachu', 'legends-arceus', …).
 */
export function parseWhereToFind(html: string): Map<string, ObtainEntry[]> {
  const out = new Map<string, ObtainEntry[]>();
  const root = parse(html);
  for (const table of root.querySelectorAll('table.vitals-table')) {
    for (const tr of table.querySelectorAll('tr')) {
      const games = tr
        .querySelectorAll('th span.igame')
        .map((s) =>
          s.classNames
            .split(/\s+/)
            .filter((c) => c !== 'igame')
            .join(' '),
        )
        .filter((slug) => slug.length > 0);
      if (games.length === 0) continue;
      const td = tr.querySelector('td');
      if (!td) continue;
      const entries: ObtainEntry[] = [];
      const links = td.querySelectorAll('a[href^="/location/"]');
      for (const a of links) {
        entries.push({ method: 'wild', location: a.text.trim() });
      }
      if (entries.length === 0) {
        const note = td.querySelector('small');
        if (note) entries.push(classifyNote(note.text));
      }
      if (entries.length === 0) continue;
      for (const g of games) out.set(g, entries);
    }
  }
  return out;
}
