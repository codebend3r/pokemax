import axios from 'axios';
import { useEffect, useState } from 'react';

import defaultPokemonImage from './images/pokemon-default.png';

import './App.scss';

const PokeCard = ({ pokemon }: any) => {
  // console.log(JSON.stringify(pokemon, null, 2));
  // console.log(JSON.stringify(pokemon.name, null, 2));
  // console.log(JSON.stringify(pokemon.weight, null, 2));
  // console.log(JSON.stringify(pokemon.height, null, 2));
  // console.log(JSON.stringify(pokemon.base_experience, null, 2));
  console.log(JSON.stringify(pokemon.abilities, null, 2));

  return (
    <div className="pokecard">
      <p className="pokemon-name">{pokemon.name}</p>
      {!!pokemon.sprites && (
        <>
          <img
            width="200px"
            height="200px"
            src={pokemon?.sprites?.front_default ?? defaultPokemonImage}
            alt="pokemon image"
          />
          <img
            width="200px"
            height="200px"
            src={pokemon?.sprites?.front_shiny ?? defaultPokemonImage}
            alt="pokemon image"
          />
          <img
            width="200px"
            height="200px"
            src={pokemon?.sprites?.back_shiny ?? defaultPokemonImage}
            alt="pokemon image"
          />
        </>
      )}
      <div className="pokemon-stats">
        {!!pokemon.weight && <p>XP: {pokemon.weight}</p>}
        {!!pokemon.height && <p>height: {pokemon.height}</p>}
        {!!pokemon.abilities && !!pokemon.abilities.length && (
          <p>
            abilities:
            {pokemon.abilities.reduce((acc: string, { ability }: any) => ` ${acc} ${ability.name}`, '')}
          </p>
        )}
        {!!pokemon.base_experience && <p>weight: {pokemon.base_experience}</p>}
      </div>
    </div>
  );
};

const MainApp = () => {
  // console.log("MainApp");
  const [searchText, setSearchText] = useState<string>('');
  const [pokemonResults, setPokemonResults] = useState<object | null>(null);
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [autoSuggestList, setAutoSuggestList] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // raichu-alola
  // original pokemon = 151

  useEffect(() => {
    axios.get('https://pokeapi.co/api/v2/pokemon?limit=151').then(
      ({ data: { results } }) => {
        setPokemonList(results);
        setAutoSuggestList(results.map(({ name }: any) => name));
      },
      () => {
        console.log('error fetching all pokemon');
      },
    );
  }, []);

  useEffect(() => {
    if (searchText.length > 0) {
      setFilteredSuggestions(autoSuggestList.filter((name) => name.includes(searchText)));

      axios.get(`https://pokeapi.co/api/v2/pokemon/${searchText}`).then(
        ({ data }) => {
          setPokemonResults(data);
        },
        () => {
          console.log('could not find pokemon:', searchText);
        },
      );
    }
  }, [searchText]);

  return (
    <div className="container">
      <div className="inner-container">
        <h1 className="title">Pokemax</h1>
        <div className="row">
          <div className="search-autosuggest">
            <input
              type="text"
              className="main-search"
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
            />
            <button
              className="main-button"
              onClick={() => {
                axios.get(`https://pokeapi.co/api/v2/pokemon/${searchText}`).then(
                  ({ data }) => {
                    setPokemonResults(data);
                  },
                  () => {
                    console.log('could not find pokemon:', searchText);
                    setPokemonResults(null);
                  },
                );
              }}
            >
              Search
            </button>
            {!pokemonResults && filteredSuggestions.length > 0 && (
              <ul className="autosuggest-list">
                {filteredSuggestions.map((hint) => (
                  <li className="autosuggest-item">
                    <button
                      onClick={() => {
                        const matchingPokemon = pokemonList.find(({ name }) => name === hint);
                        if (!!matchingPokemon) {
                          axios.get(matchingPokemon.url).then(
                            ({ data }) => {
                              setPokemonResults(data);
                              setFilteredSuggestions([]);
                            },
                            () => {
                              console.log('error fetching all pokemon');
                            },
                          );
                        }
                      }}
                    >
                      {hint}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {!!pokemonResults && <PokeCard pokemon={pokemonResults} />}

        {/* <div className="row">
          <ul className="pokemon-grid-container">
            {pokemonList.length > 0 &&
              pokemonList.map((pokemon) => {
                return <PokeCard pokemon={pokemon} />;
              })}
          </ul>
        </div> */}
      </div>
    </div>
  );
};

const App = () => {
  return <MainApp />;
};

export default App;
