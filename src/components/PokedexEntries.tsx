import Section from '@/components/Section';
import { dedupeEntries } from '@/textUtil';
import type { SpeciesResponse } from '@/types';

export default function PokedexEntries({ species }: { species: SpeciesResponse }) {
  const entries = dedupeEntries(species);
  if (entries.length === 0) return null;
  return (
    <Section label="POKéDEX ENTRIES" count={entries.length} defaultOpen={false}>
      <div className="crt-pokedex-entries">
        {entries.map((entry, i) => (
          <div key={i} className="crt-pokedex-entry-item">
            <div className="crt-pokedex-versions">
              {entry.versions.map((v) => v.toUpperCase().replace(/-/g, '/')).join(' · ')}
            </div>
            <p>{entry.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
