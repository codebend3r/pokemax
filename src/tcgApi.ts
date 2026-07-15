import type { TcgCard, TcgCardsResponse } from '@/types';

const BASE = 'https://api.pokemontcg.io/v2';

export async function fetchTcgCards(pokemonName: string): Promise<TcgCard[]> {
  const query = pokemonName.replace(/-/g, ' ');
  const url = `${BASE}/cards?q=${encodeURIComponent(`name:"${query}"`)}&orderBy=-set.releaseDate&pageSize=12`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${url}`);
  }
  const data = (await res.json()) as TcgCardsResponse;
  return data.data;
}
