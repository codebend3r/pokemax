import { useMemo, useState } from 'react';
import { GAME_LABELS, type Trainer } from '@/trainers';
import { GAME_MAX_GEN, pickCounterTeam } from '@/counters';
import Detail from '@/components/Detail';
import { useTypeIndex } from '@/hooks/useTypeIndex';
import { TYPE_COLORS } from '@/typeChart';
import type { Gen8Species } from '@/types';

interface Props {
  trainer: Trainer;
  onBack: () => void;
  onSelectPokemon: (speciesSlug: string) => void;
  /** Full species index (base + alt forms). Used to map slug ↔ id and apply a gen cap. */
  speciesIndex: Gen8Species[];
}

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
  const typeIndex = useTypeIndex(openCounters);

  const counterTeam = useMemo(() => {
    if (!openCounters || !typeIndex.index) return null;
    const nameToId = new Map<string, number>();
    const idToName = new Map<number, string>();
    const allowed = new Set<number>();
    const maxGen = GAME_MAX_GEN[trainer.game];
    for (const s of speciesIndex) {
      nameToId.set(s.name, s.id);
      idToName.set(s.id, s.name);
      if (s.gen <= maxGen) allowed.add(s.id);
    }
    return pickCounterTeam(trainer.team, {
      typeIndex: typeIndex.index,
      nameToId,
      idToName,
      candidateFilter: (id) => allowed.has(id),
    });
  }, [openCounters, typeIndex.index, speciesIndex, trainer.team, trainer.game]);

  return (
    <div className="crt-trainer-detail">
      <button type="button" className="crt-trainer-back" onClick={onBack}>
        ← BACK
      </button>

      <div className="crt-trainer-detail-header">
        <div className="crt-trainer-detail-name">{trainer.name.toUpperCase()}</div>
        <div className="crt-trainer-detail-class">{trainer.trainerClass.toUpperCase()}</div>
        <div className="crt-trainer-detail-game">{GAME_LABELS[trainer.game]}</div>
        {trainer.location && <div className="crt-trainer-detail-location">{trainer.location}</div>}
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
              src={`https://play.pokemonshowdown.com/sprites/gen5/${m.species}.png`}
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

      <Section
        title={`BEST COUNTER TEAM (Gen ≤ ${GAME_MAX_GEN[trainer.game]})`}
        open={openCounters}
        onToggle={() => setOpenCounters((v) => !v)}
      >
        {typeIndex.loading && (
          <div className="crt-trainer-counters-status">
            ▶ INDEXING TYPES<span className="crt-cursor">&nbsp;</span>
          </div>
        )}
        {typeIndex.error && (
          <div className="crt-trainer-counters-status crt-error">ERR: {typeIndex.error}</div>
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
                  src={`https://play.pokemonshowdown.com/sprites/gen5/${pick.name}.png`}
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
        <div>{GAME_LABELS[trainer.game]}</div>
      </Section>
    </div>
  );
}
