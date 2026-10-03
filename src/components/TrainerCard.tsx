import { useMemo, useState } from 'react';
import { GAMES } from '@/games';
import { trainerPortraitUrl, type Trainer } from '@/trainers';
import { counterTeamFor, minLevels } from '@/counters';
import Detail from '@/components/Detail';
import { useAsync } from '@/async';
import { typeIndex } from '@/dex';
import { TYPE_COLORS } from '@/typeChart';
import type { DexEntry } from '@/types';
import { showdownSpriteUrl } from '@/sprites';

interface Props {
  trainer: Trainer;
  onBack: () => void;
  onSelectPokemon: (speciesSlug: string) => void;
  /** Full species index (base + alt forms). Used to map slug ↔ id and apply a gen cap. */
  speciesIndex: DexEntry[];
}

// A failed level fetch turns the level gate off rather than blocking counters.
const NO_LEVEL_GATE = new Map<number, number>();

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={'crt-trainer-section' + (open ? ' open' : '')}>
      <button
        type="button"
        className="crt-trainer-section-header"
        onClick={onToggle}
        aria-expanded={open}
      >
        {title}
      </button>
      {open && <div className="crt-trainer-section-body">{children}</div>}
    </div>
  );
}

export default function TrainerCard({ trainer, onBack, onSelectPokemon, speciesIndex }: Props) {
  const [openMoves, setOpenMoves] = useState(false);
  const [openMeta, setOpenMeta] = useState(false);
  const [openLoc, setOpenLoc] = useState(false);
  const [openCounters, setOpenCounters] = useState(false);
  const types = useAsync(typeIndex, openCounters, undefined);
  const levels = useAsync(minLevels, openCounters, undefined);
  const typeMap = types.status === 'ready' ? types.data : null;
  const levelMap =
    levels.status === 'ready' ? levels.data : levels.status === 'error' ? NO_LEVEL_GATE : null;

  const counterTeam = useMemo(
    () =>
      openCounters && typeMap && levelMap
        ? counterTeamFor(trainer, speciesIndex, typeMap, levelMap)
        : null,
    [openCounters, typeMap, levelMap, trainer, speciesIndex],
  );

  return (
    <div className="crt-trainer-detail">
      <button type="button" className="crt-trainer-back" onClick={onBack}>
        ← BACK
      </button>

      <div className="crt-trainer-detail-header">
        {trainerPortraitUrl(trainer) && (
          <img
            className="crt-trainer-detail-portrait"
            src={trainerPortraitUrl(trainer)}
            alt={trainer.name}
          />
        )}
        <div className="crt-trainer-detail-header-text">
          <div className="crt-trainer-detail-name">{trainer.name.toUpperCase()}</div>
          <div className="crt-trainer-detail-class">{trainer.trainerClass.toUpperCase()}</div>
          <div className="crt-trainer-detail-game">{GAMES[trainer.game].label}</div>
          {trainer.location && (
            <div className="crt-trainer-detail-location">{trainer.location}</div>
          )}
        </div>
      </div>

      <div className="crt-trainer-team">
        {trainer.team.map((m, i) => (
          <button
            key={`${m.species}-${i}`}
            type="button"
            className="crt-trainer-member"
            onClick={() => onSelectPokemon(m.species)}
            title={`View ${m.species}`}
          >
            <img
              className="crt-trainer-member-sprite"
              src={showdownSpriteUrl(m.species)}
              alt={m.species}
            />
            <div className="crt-trainer-member-name">
              {m.species.replace(/-/g, ' ').toUpperCase()}
            </div>
            <div className="crt-trainer-member-level">Lv {m.level}</div>
          </button>
        ))}
      </div>

      <Section title="MOVES" open={openMoves} onToggle={() => setOpenMoves((v) => !v)}>
        <div className="crt-trainer-moves-grid">
          {trainer.team.map((m, i) => (
            <div key={`${m.species}-${i}`} className="crt-trainer-moves-row">
              <div className="crt-trainer-moves-species">
                {m.species.replace(/-/g, ' ').toUpperCase()}
              </div>
              <div className="crt-trainer-moves-list">
                {m.moves && m.moves.length > 0 ? (
                  m.moves.map((mv) => <Detail key={mv} kind="move" name={mv} />)
                ) : (
                  <span className="crt-trainer-moves-empty">no moves known</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {trainer.team.some((m) => m.ability || m.item || m.nature) && (
        <Section
          title="ABILITY / ITEM / NATURE"
          open={openMeta}
          onToggle={() => setOpenMeta((v) => !v)}
        >
          <div className="crt-trainer-meta-grid">
            {trainer.team.map((m, i) => (
              <div key={`${m.species}-${i}`} className="crt-trainer-meta-row">
                <div className="crt-trainer-meta-species">
                  {m.species.replace(/-/g, ' ').toUpperCase()}
                </div>
                <div className="crt-trainer-meta-cell">
                  <span className="crt-trainer-meta-label">ABILITY</span>
                  {m.ability ? (
                    <Detail kind="ability" name={m.ability} />
                  ) : (
                    <span className="crt-trainer-meta-empty">—</span>
                  )}
                </div>
                <div className="crt-trainer-meta-cell">
                  <span className="crt-trainer-meta-label">ITEM</span>
                  {m.item ? (
                    <Detail kind="item" name={m.item} />
                  ) : (
                    <span className="crt-trainer-meta-empty">—</span>
                  )}
                </div>
                <div className="crt-trainer-meta-cell">
                  <span className="crt-trainer-meta-label">NATURE</span>
                  {m.nature ? (
                    <Detail kind="nature" name={m.nature} />
                  ) : (
                    <span className="crt-trainer-meta-empty">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section
        title={
          trainer.availableBefore
            ? 'BEST COUNTER TEAM (OBTAINABLE BY THIS FIGHT)'
            : `BEST COUNTER TEAM (Gen ≤ ${GAMES[trainer.game].dexGen})`
        }
        open={openCounters}
        onToggle={() => setOpenCounters((v) => !v)}
      >
        {types.status === 'loading' && (
          <div className="crt-trainer-counters-status">
            ▶ INDEXING TYPES<span className="crt-cursor">&nbsp;</span>
          </div>
        )}
        {types.status === 'error' && (
          <div className="crt-trainer-counters-status crt-error">ERR: {types.message}</div>
        )}
        {counterTeam && counterTeam.length === 0 && (
          <div className="crt-trainer-counters-status">▶ NO COUNTERS FOUND</div>
        )}
        {counterTeam && counterTeam.length > 0 && (
          <div className="crt-trainer-counters-grid">
            {counterTeam.map((pick) => (
              <button
                key={pick.id}
                type="button"
                className="crt-trainer-counter"
                onClick={() => onSelectPokemon(pick.name)}
                title={`View ${pick.name}`}
              >
                <img
                  className="crt-trainer-counter-sprite"
                  src={showdownSpriteUrl(pick.name)}
                  alt={pick.name}
                />
                <div className="crt-trainer-counter-name">
                  {pick.name.replace(/-/g, ' ').toUpperCase()}
                </div>
                <div className="crt-trainer-counter-types">
                  {pick.types.map((t) => (
                    <span
                      key={t}
                      className="crt-trainer-counter-type"
                      style={{ borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="crt-trainer-counter-vs">
                  vs {pick.countersSpecies.replace(/-/g, ' ')}
                </div>
                <div className="crt-trainer-counter-why">{pick.rationale}</div>
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section title="LOCATION" open={openLoc} onToggle={() => setOpenLoc((v) => !v)}>
        <div>{trainer.location ?? '—'}</div>
        <div>{GAMES[trainer.game].label}</div>
      </Section>
    </div>
  );
}
