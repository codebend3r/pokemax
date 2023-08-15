import axios from 'axios';
import { useState, useEffect } from 'react';
import axiosClient from '../axios';
import { PokeCard } from '../components/Pokecard';
import { useRequestProcessor } from '../requestProcessor';

export const MainApp = () => {
  const [searchText, setSearchText] = useState<string>('');
  const [pokemonResults, setPokemonResults] = useState<object | null>(null);
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [autoSuggestList, setAutoSuggestList] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const { query } = useRequestProcessor();

  const {
    data: pokemonData,
    isLoading,
    isError,
  } = query<object[]>(
    ['pokemon'],
    () => axiosClient.get('/pokemon?limit=151').then((res) => res.data),
    {
      enabled: true,
    }
  );

  console.log({
    pokemonData,
    isLoading,
    isError,
  });

  // raichu-alola
  // original pokemon = 151

  useEffect(() => {
    // axios.get('https://pokeapi.co/api/v2/pokemon?limit=151').then(
    //   ({ data: { results } }) => {
    //     setPokemonList(results);
    //     setAutoSuggestList(results.map(({ name }: any) => name));
    //   },
    //   () => {
    //     console.log('error fetching all pokemon');
    //   }
    // );

    if (Array.isArray(pokemonData)) {
      setPokemonList(pokemonData);
      setAutoSuggestList(pokemonData.map(({ name }: any) => name));
    }
  }, [pokemonData]);

  useEffect(() => {
    if (searchText.length > 0) {
      setFilteredSuggestions(
        autoSuggestList.filter((name) => name.includes(searchText))
      );

      axios.get(`https://pokeapi.co/api/v2/pokemon/${searchText}`).then(
        ({ data }) => {
          setPokemonResults(data);
        },
        () => {
          console.log('could not find pokemon:', searchText);
        }
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
                axios
                  .get(`https://pokeapi.co/api/v2/pokemon/${searchText}`)
                  .then(
                    ({ data }) => {
                      setPokemonResults(data);
                    },
                    () => {
                      console.log('could not find pokemon:', searchText);
                      setPokemonResults(null);
                    }
                  );
              }}
            >
              Search
            </button>
            {!pokemonResults && filteredSuggestions.length > 0 && (
              <ul className="autosuggest-list">
                {filteredSuggestions.map((hint, index) => (
                  <li className="autosuggest-item" key={`item-${index}`}>
                    <button
                      onClick={() => {
                        const matchingPokemon = pokemonList.find(
                          ({ name }) => name === hint
                        );
                        if (!!matchingPokemon) {
                          axios.get(matchingPokemon.url).then(
                            ({ data }) => {
                              setPokemonResults(data);
                              setFilteredSuggestions([]);
                            },
                            () => {
                              console.log('error fetching all pokemon');
                            }
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
