import type { EvolutionChainResponse, PokemonResponse, SpeciesResponse } from '../types';
import StatBar from './StatBar';
import AbilityList from './AbilityList';
import EvolutionChain from './EvolutionChain';
import MoveList from './MoveList';
import ShinyToggle from './ShinyToggle';

interface Props {
  pokemon: PokemonResponse;
  species: SpeciesResponse;
  chain: EvolutionChainResponse;
  shiny: boolean;
  onShinyChange: (v: boolean) => void;
}

const STAT_ORDER = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

function pickSprite(p: PokemonResponse, shiny: boolean): string {
  const art = p.sprites.other['official-artwork'];
  if (shiny) {
    return art.front_shiny ?? p.sprites.front_shiny ?? p.sprites.front_default ?? '';
  }
  return art.front_default ?? p.sprites.front_default ?? '';
}

export default function PokemonCard({ pokemon, chain, shiny, onShinyChange }: Props) {
  const sprite = pickSprite(pokemon, shiny);
  const sortedStats = [...pokemon.stats].sort(
    (a, b) => STAT_ORDER.indexOf(a.stat.name) - STAT_ORDER.indexOf(b.stat.name),
  );

  return (
    <div className="crt-card">
      <div className="crt-card-top">
        <div>
          <img src={sprite} alt={pokemon.name} />
          <ShinyToggle value={shiny} onChange={onShinyChange} />
        </div>
        <div className="crt-card-meta">
          <div className="crt-card-name">{pokemon.name.toUpperCase()}</div>
          <div className="crt-card-dex">№ {String(pokemon.id).padStart(3, '0')}</div>
          <div className="crt-types">
            {pokemon.types.map((t) => (
              <span key={t.type.name} className="crt-type">{t.type.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="crt-section">
        <div className="crt-section-label">▶ BASE STATS</div>
        {sortedStats.map((s) => (
          <StatBar key={s.stat.name} name={s.stat.name} value={s.base_stat} />
        ))}
      </div>

      <AbilityList abilities={pokemon.abilities} />

      <EvolutionChain chain={chain.chain} active={pokemon.name} />

      <MoveList moves={pokemon.moves} />
    </div>
  );
}
