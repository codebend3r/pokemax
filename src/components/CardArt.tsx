import { useEffect, useState } from 'react';
import ShinyToggle from '@/components/ShinyToggle';
import SpriteToggle from '@/components/SpriteToggle';
import { cryUrlOf, playCry } from '@/cry';
import { useAnyLoads, useFallbackSrc } from '@/hooks/useFallbackSrc';
import type { Dimension } from '@/routes';
import { cardSprites } from '@/sprites';
import type { PokemonResponse } from '@/types';

interface Particle {
  id: number;
  type: 'heart' | 'star' | 'sparkle';
  x: number;
  delay: number;
  rotate: number;
}

function CardSprite({
  pokemon,
  shiny,
  view,
  cryVolume,
  onCryVolumeChange,
}: {
  pokemon: PokemonResponse;
  shiny: boolean;
  view: Dimension;
  cryVolume: number;
  onCryVolumeChange?: (v: number) => void;
}) {
  const [reacting, setReacting] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const candidates = cardSprites(pokemon, shiny, view);
  const { src, next } = useFallbackSrc(candidates.map((c) => c.url));
  // Past the last candidate, keep showing it rather than an empty frame.
  const sprite = candidates.find((c) => c.url === src) ?? candidates[candidates.length - 1];
  const cryUrl = cryUrlOf(pokemon);
  const replayCry = () => {
    if (cryUrl) playCry(pokemon.name, cryUrl);
  };

  const handleSpriteClick = () => {
    replayCry();
    setReacting(true);
    const types: Particle['type'][] = ['heart', 'star', 'sparkle', 'heart', 'sparkle'];
    const newParticles: Particle[] = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      type: types[i] ?? 'heart',
      x: (Math.random() - 0.5) * 120, // -60 to +60 px
      delay: Math.random() * 180, // staggered launch
      rotate: (Math.random() - 0.5) * 120,
    }));
    setParticles((p) => [...p, ...newParticles]);
    window.setTimeout(() => setReacting(false), 720);
    window.setTimeout(() => {
      setParticles((p) => p.filter((x) => !newParticles.includes(x)));
    }, 1300);
  };

  const className =
    'crt-sprite-' +
    view +
    (sprite.animated ? ' is-anim' : ' is-static') +
    (reacting ? ' reacting' : '');

  return (
    <div className="crt-card-sprite-wrap">
      <img
        key={sprite.url}
        className={className}
        src={sprite.url}
        alt={pokemon.name}
        onClick={handleSpriteClick}
        onError={next}
        title="click to play cry"
      />
      {particles.map((p) => (
        <span
          key={p.id}
          className={`crt-card-particle ${p.type}`}
          aria-hidden="true"
          style={{
            '--x': `${p.x}px`,
            '--rotate': `${p.rotate}deg`,
            animationDelay: `${p.delay}ms`,
          }}
        >
          {p.type === 'heart' ? '♥' : p.type === 'star' ? '★' : '✦'}
        </span>
      ))}
      {cryUrl && (
        <div className="crt-cry-row">
          <button
            type="button"
            className="crt-cry-button"
            onClick={replayCry}
            aria-label={`play ${pokemon.name} cry`}
            title="play cry"
          >
            ♪ CRY
          </button>
          {onCryVolumeChange && (
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={cryVolume}
              aria-label="Cry volume"
              title="Cry volume"
              onChange={(e) => onCryVolumeChange(parseFloat(e.target.value))}
              className="crt-volume-slider crt-cry-slider"
            />
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  pokemon: PokemonResponse;
  shiny: boolean;
  onShinyChange: (v: boolean) => void;
  view: Dimension;
  onViewChange: (view: Dimension) => void;
  cryVolume: number;
  onCryVolumeChange?: (v: number) => void;
}

/** The card's sprite column: the sprite with its cry controls, and the 2D/3D and shiny toggles. */
export default function CardArt({
  pokemon,
  shiny,
  onShinyChange,
  view,
  onViewChange,
  cryVolume,
  onCryVolumeChange,
}: Props) {
  // 2D shows only frame-animated pixel art. When none of the 2D candidates
  // loads, hide the 2D toggle and force 3D — 3D always has something.
  const has2D = useAnyLoads(cardSprites(pokemon, false, '2d').map((c) => c.url));
  useEffect(() => {
    if (!has2D && view === '2d') onViewChange('3d');
  }, [has2D, view, onViewChange]);

  return (
    <div className="crt-card-art">
      <CardSprite
        pokemon={pokemon}
        shiny={shiny}
        view={view}
        cryVolume={cryVolume}
        onCryVolumeChange={onCryVolumeChange}
      />
      <SpriteToggle value={view} onChange={onViewChange} has2D={has2D} />
      <ShinyToggle value={shiny} onChange={onShinyChange} />
    </div>
  );
}
