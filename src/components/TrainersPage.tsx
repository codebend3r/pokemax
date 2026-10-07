import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { dataOf, useAsync } from '@/async';
import TrainerCard from '@/components/TrainerCard';
import TrainerGrid from '@/components/TrainerGrid';
import { formIndex, speciesIndex } from '@/dex';
import type { GameId } from '@/games';
import { trainerPath, trainersPath } from '@/routes';
import { TRAINERS } from '@/trainers';
import type { DexEntry } from '@/types';

interface Props {
  /** `null` renders the trainer list; an id renders that trainer's page. */
  trainerId: string | null;
  /** `game` is the trainer's game — roster and counter picks preselect its build. */
  onSelectPokemon: (name: string, game: GameId) => void;
}

// The roster dataset is ~108 KB of source. It is only ever imported from this
// lazily-loaded page, which keeps it out of the main bundle.
export default function TrainersPage({ trainerId, onSelectPokemon }: Props) {
  const [, navigate] = useLocation();
  // The last trainer page shown — the list hands focus back to that trainer's card.
  const [lastTrainerId, setLastTrainerId] = useState(trainerId);
  if (trainerId !== null && trainerId !== lastTrainerId) setLastTrainerId(trainerId);
  // Counter picks map slugs to ids and gens through the dex index; alternate
  // forms join it only once the Pokédex has loaded them.
  const species = dataOf(useAsync(speciesIndex, true, undefined));
  const forms = dataOf(useAsync(formIndex, false, undefined));
  const speciesIndexEntries = useMemo(
    (): DexEntry[] => [...(species ?? []), ...(forms ?? [])],
    [species, forms],
  );

  if (trainerId === null) {
    return (
      <TrainerGrid
        trainers={TRAINERS}
        onSelect={(t) => navigate(trainerPath(t.id))}
        returnFocusTo={lastTrainerId}
      />
    );
  }
  const trainer = TRAINERS.find((t) => t.id === trainerId);
  if (!trainer) {
    return (
      <>
        <h1 className="crt-visually-hidden">Trainer not found</h1>
        <div className="crt-error">ERR: TRAINER "{trainerId}" NOT FOUND</div>
      </>
    );
  }
  return (
    <TrainerCard
      trainer={trainer}
      onBack={() => navigate(trainersPath())}
      onSelectPokemon={(name) => onSelectPokemon(name, trainer.game)}
      speciesIndex={speciesIndexEntries}
    />
  );
}
