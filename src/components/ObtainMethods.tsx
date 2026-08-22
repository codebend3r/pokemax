import { useState, type SyntheticEvent } from 'react';
import { getGen, REGIONS, REGION_OF_VERSION_GROUP, type RegionMeta } from '@/generations';
import type { ObtainState } from '@/hooks/useObtainData';
import {
  conditionMeta,
  LEGEND_CONDITIONS,
  LEGEND_METHODS,
  levelRate,
  METHOD_COLOR,
  METHOD_LABEL,
  prettyCondition,
} from '@/obtain/labels';
import type { ObtainEntry, ObtainFile, ObtainGame } from '@/obtain/types';

interface Props {
  state: ObtainState;
  currentGen: number;
}

// Groups are by REGION, not generation — BDSP belongs with the other Sinnoh
// games regardless of when it shipped, and Hisui sits under Sinnoh. Both facts
// live in the canonical `REGIONS` model.
function regionLabel({ name, note }: RegionMeta): string {
  return note ? `${name.toUpperCase()} · ${note.toUpperCase()}` : name.toUpperCase();
}

function regionOf(game: ObtainGame): string {
  return REGION_OF_VERSION_GROUP[game.versionGroup];
}

function prettyVersions(versions: string[]): string {
  return versions.map((v) => v.toUpperCase().replace(/-/g, ' ')).join(' / ');
}

// Sanctioned colorful-chip pattern from `PokemonCard.tsx`'s type pills:
// palette color as text + border, plus a matching low-opacity glow.
function tintStyle(color: string): React.CSSProperties {
  return { color, borderColor: color, textShadow: `0 0 4px ${color}66` };
}

function EntryRow({ entry }: { entry: ObtainEntry }) {
  const meta = levelRate(entry);
  return (
    <li className="crt-obtain-row">
      <span className="crt-obtain-tag" style={tintStyle(METHOD_COLOR[entry.method])}>
        {METHOD_LABEL[entry.method]}
      </span>
      {entry.location && <span className="crt-obtain-loc">{entry.location}</span>}
      {meta && <span className="crt-obtain-meta">{meta}</span>}
      {entry.conditions?.map((c) => {
        const { icon, color } = conditionMeta(c);
        return (
          <span key={c} className="crt-obtain-cond" style={tintStyle(color)}>
            {icon} {prettyCondition(c)}
          </span>
        );
      })}
      {entry.detail && <span className="crt-obtain-detail">{entry.detail}</span>}
    </li>
  );
}

function GameRow({ game }: { game: ObtainGame }) {
  return (
    <div className="crt-obtain-game">
      <div className="crt-obtain-game-name">{prettyVersions(game.versions)}</div>
      <ul className="crt-obtain-entries">
        {game.entries.map((e, i) => (
          <EntryRow key={i} entry={e} />
        ))}
      </ul>
    </div>
  );
}

function Legend() {
  const [open, setOpen] = useState(false);
  return (
    <details
      className="crt-obtain-legend"
      onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => setOpen(e.currentTarget.open)}
    >
      <summary>{open ? '▼' : '▶'} LEGEND</summary>
      <div className="crt-obtain-legend-section">
        <div className="crt-obtain-legend-title">METHODS</div>
        <ul className="crt-obtain-legend-list">
          {LEGEND_METHODS.map(([method, gloss]) => (
            <li key={method}>
              <span className="crt-obtain-tag" style={tintStyle(METHOD_COLOR[method])}>
                {METHOD_LABEL[method]}
              </span>{' '}
              {gloss}
            </li>
          ))}
        </ul>
      </div>
      <div className="crt-obtain-legend-section">
        <div className="crt-obtain-legend-title">CONDITIONS</div>
        <ul className="crt-obtain-legend-list">
          {LEGEND_CONDITIONS.map(({ icon, color, label }) => (
            <li key={icon}>
              <span className="crt-obtain-cond" style={tintStyle(color)}>
                {icon}
              </span>{' '}
              {label}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

// Mounted only once the file is loaded, so the default open region is known at
// mount and expansion is plain, non-nullable state. Deliberately NOT persisted
// via `useExpandedRegions` — that hook's stored value would carry one Pokémon's
// open region onto the next, whose regions are a different set entirely.
function ObtainRegions({ file, currentGen }: { file: ObtainFile; currentGen: number }) {
  const regions = REGIONS.filter((r) => file.games.some((g) => regionOf(g) === r.name));
  // Regional forms can carry a `currentGen` whose home region the file's
  // games never reach (e.g. Alolan Vulpix is gen 1, but its file starts in
  // Alola) — default to the first region actually present.
  const homeRegion = getGen(currentGen).region;
  const defaultRegion = regions.some((r) => r.name === homeRegion) ? homeRegion : regions[0]?.name;
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultRegion === undefined ? [] : [defaultRegion]),
  );
  const toggle = (region: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });

  return (
    <div className="crt-obtain">
      {file.breeding && (
        <div className="crt-obtain-breeding">
          EGG GROUPS: {file.breeding.eggGroups.map((g) => g.toUpperCase()).join('/')}
          {file.breeding.breedable
            ? ` · HATCH: ${file.breeding.hatchCycles} CYCLES (${file.breeding.steps.toLocaleString('en-US')} STEPS)`
            : ' · CANNOT BREED'}
        </div>
      )}
      <Legend />
      {regions.map((region) => {
        const open = expanded.has(region.name);
        const gamesInRegion = file.games.filter((g) => regionOf(g) === region.name);
        return (
          <div key={region.name} className="crt-obtain-region">
            <button
              type="button"
              className="crt-obtain-region-toggle"
              aria-expanded={open}
              onClick={() => toggle(region.name)}
            >
              {open ? '▼' : '▶'} {regionLabel(region)}
            </button>
            {open && gamesInRegion.map((g, i) => <GameRow key={i} game={g} />)}
          </div>
        );
      })}
    </div>
  );
}

export default function ObtainMethods({ state, currentGen }: Props) {
  if (state.status === 'loading') {
    return <div className="crt-obtain-status">LOADING OBTAIN DATA…</div>;
  }
  if (state.status !== 'ready') {
    return <div className="crt-obtain-status">OBTAIN DATA UNAVAILABLE</div>;
  }
  return <ObtainRegions file={state.file} currentGen={currentGen} />;
}
