import TrainerCard from '@/components/TrainerCard';
import TrainerGrid from '@/components/TrainerGrid';
import type { GameId } from '@/games';
import { TRAINERS } from '@/trainers';
import type { Gen8Species } from '@/types';

interface Props {
  /** `null` renders the trainer list; an id renders that trainer's page. */
  trainerId: string | null;
  onOpenTrainer: (id: string) => void;
  onBack: () => void;
  /** `game` is the trainer's game — roster and counter picks preselect its build. */
  onSelectPokemon: (name: string, game: GameId) => void;
  speciesIndex: Gen8Species[];
}

// The roster dataset is ~108 KB of source. It is only ever imported from this
// lazily-loaded page, which keeps it out of the main bundle.
export default function TrainersPage({
  trainerId,
  onOpenTrainer,
  onBack,
  onSelectPokemon,
  speciesIndex,
}: Props) {
  if (trainerId === null) {
    return <TrainerGrid trainers={TRAINERS} onSelect={(t) => onOpenTrainer(t.id)} />;
  }
  const trainer = TRAINERS.find((t) => t.id === trainerId);
  if (!trainer) return <div className="crt-error">ERR: TRAINER "{trainerId}" NOT FOUND</div>;
  return (
    <TrainerCard
      trainer={trainer}
      onBack={onBack}
      onSelectPokemon={(name) => onSelectPokemon(name, trainer.game)}
      speciesIndex={speciesIndex}
    />
  );
}
