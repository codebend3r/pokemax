import { useState } from 'react';
import { GAME_LABELS, type Trainer } from '@/trainers';
import Detail from '@/components/Detail';

interface Props {
  trainer: Trainer;
  onBack: () => void;
  onSelectPokemon: (speciesSlug: string) => void;
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
        {open ? '▼' : '▶'} {title}
      </button>
      {open && <div className="crt-trainer-section-body">{children}</div>}
    </div>
  );
}

export default function TrainerCard({ trainer, onBack, onSelectPokemon }: Props) {
  const [openMoves, setOpenMoves] = useState(false);
  const [openMeta, setOpenMeta] = useState(false);
  const [openLoc, setOpenLoc] = useState(false);

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

      <Section title="LOCATION" open={openLoc} onToggle={() => setOpenLoc((v) => !v)}>
        <div>{trainer.location ?? '—'}</div>
        <div>{GAME_LABELS[trainer.game]}</div>
      </Section>
    </div>
  );
}
