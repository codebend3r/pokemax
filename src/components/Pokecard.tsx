import defaultPokemonImage from '../images/pokemon-default.png';

export const PokeCard = ({ pokemon }: any) => {
  // console.log(JSON.stringify(pokemon, null, 2));
  // console.log(JSON.stringify(pokemon.name, null, 2));
  // console.log(JSON.stringify(pokemon.weight, null, 2));
  // console.log(JSON.stringify(pokemon.height, null, 2));
  // console.log(JSON.stringify(pokemon.base_experience, null, 2));
  // console.log(JSON.stringify(pokemon.abilities, null, 2));

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
            {pokemon.abilities.reduce(
              (acc: string, { ability }: any) => ` ${acc} ${ability.name}`,
              ''
            )}
          </p>
        )}
        {!!pokemon.base_experience && <p>weight: {pokemon.base_experience}</p>}
      </div>
    </div>
  );
};
