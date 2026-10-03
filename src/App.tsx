import { lazy, Suspense, useEffect, useState } from 'react';
import { Redirect, Route, Switch, useLocation, useRoute, useSearch } from 'wouter';
import LoadingCard from '@/components/LoadingCard';
import PokedexPage from '@/components/PokedexPage';
import ShareButton from '@/components/ShareButton';
import ThemeToggle from '@/components/ThemeToggle';
import { cryUrlById, primeCry, setCryVolume } from '@/cry';
import { formIndex, resolveDexRoute, speciesIndex } from '@/dex';
import type { GameId } from '@/games';
import { useTheme } from '@/hooks/useTheme';
import { useVolume } from '@/hooks/useVolume';
import { pokedexPath, teamsPath, trainersPath } from '@/routes';

// Lazy-loaded — only fetched when first needed
const MusicPlayer = lazy(() => import('@/components/MusicPlayer'));
const TrainersPage = lazy(() => import('@/components/TrainersPage'));
const TeamsBrowser = lazy(() => import('@/components/TeamsBrowser'));

const MODES = [
  { label: 'POKÉDEX', path: pokedexPath() },
  { label: 'TRAINERS', path: trainersPath() },
  { label: 'TEAMS', path: teamsPath() },
];

/** `/` and unknown paths land on the Pokédex; pre-routing links were `/?p=charizard`. */
function HomeRedirect() {
  const legacy = new URLSearchParams(useSearch()).get('p')?.trim().toLowerCase();
  return <Redirect to={pokedexPath(legacy || undefined)} replace />;
}

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [cryVolume, saveCryVolume] = useVolume('pokemax.cry.volume', 0.25);
  useEffect(() => setCryVolume(cryVolume), [cryVolume]);
  const [query, setQuery] = useState('');
  // A fresh object per pick, so re-picking the shown Pokémon still scrolls to
  // it and replays its cry. `buildGame` is the game a TEAMS / trainer pick
  // came from — it preselects the competitive build.
  const [pick, setPick] = useState<{ buildGame: GameId | null } | null>(null);

  const [location, navigate] = useLocation();
  const [, pokedexParams] = useRoute('/pokedex/:name');

  const select = (name: string, buildGame: GameId | null = null) => {
    setQuery('');
    setPick({ buildGame });
    const index = speciesIndex.peek() ?? [];
    // Pre-warm the cry while the Pokémon's data is still being fetched —
    // the URL is predictable from the variety id.
    const entry = [...index, ...(formIndex.peek() ?? [])].find((s) => s.name === name);
    if (entry) primeCry(cryUrlById(entry.name, entry.id));
    // Picks land on the canonical URL — a form opens as its species + `?form=`.
    const picked = resolveDexRoute(name, 'base', index);
    navigate(
      picked.status === 'found' && !picked.canonical
        ? pokedexPath(picked.species, { form: picked.form })
        : pokedexPath(name),
    );
  };

  const goHome = () => {
    setQuery('');
    navigate(pokedexPath());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="crt">
      <div className="crt-topbar">
        <button
          type="button"
          className="crt-header crt-header-link"
          onClick={goHome}
          aria-label="Go to top"
        >
          <svg
            className="crt-header-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h7.5M14.5 12H22" />
            <circle cx="12" cy="12" r="3.25" />
          </svg>
          POKEMAX
        </button>
        <div className="crt-topbar-controls">
          <ShareButton selected={pokedexParams?.name.toLowerCase() ?? null} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>
      <div className="crt-mode-toggle" role="tablist" aria-label="App mode">
        {MODES.map(({ label, path }) => {
          const active = location === path || location.startsWith(`${path}/`);
          return (
            <button
              key={path}
              type="button"
              role="tab"
              aria-selected={active}
              className={'crt-mode-tab' + (active ? ' active' : '')}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="crt-subheader">ALL POKéMON · GEN I — IX</div>
      <Suspense
        fallback={
          <div className="crt-music">
            <div className="crt-music-row">
              <span className="crt-music-track">♪ loading player…</span>
            </div>
          </div>
        }
      >
        <MusicPlayer />
      </Suspense>

      <Switch>
        <Route path="/pokedex/:name?">
          {(params) => (
            <PokedexPage
              name={params.name?.toLowerCase() ?? null}
              query={query}
              onQueryChange={setQuery}
              pick={pick}
              onSelect={select}
              onHome={goHome}
              cryVolume={cryVolume}
              onCryVolumeChange={saveCryVolume}
            />
          )}
        </Route>
        <Route path="/trainers/:id?">
          {(params) => (
            <Suspense fallback={<LoadingCard what="TRAINERS" />}>
              <TrainersPage trainerId={params.id ?? null} onSelectPokemon={select} />
            </Suspense>
          )}
        </Route>
        <Route path="/teams">
          <Suspense fallback={<LoadingCard what="TEAMS" />}>
            <TeamsBrowser onSelectPokemon={select} />
          </Suspense>
        </Route>
        <Route>
          <HomeRedirect />
        </Route>
      </Switch>

      <footer className="crt-footer">
        <span>v{__APP_VERSION__}</span>
        <span className="crt-footer-sep" aria-hidden="true">
          ·
        </span>
        <span>
          built by Max Rivas-Alfaro and{' '}
          <a
            className="crt-footer-link"
            href="https://github.com/codebend3r"
            target="_blank"
            rel="noopener noreferrer"
          >
            CJ Rivas
          </a>
        </span>
        <span className="crt-footer-sep" aria-hidden="true">
          ·
        </span>
        <a
          className="crt-footer-link"
          href="https://github.com/codebend3r/pokemax"
          target="_blank"
          rel="noopener noreferrer"
        >
          source on github
        </a>
      </footer>
    </div>
  );
}
