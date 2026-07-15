import { useEffect, useState } from 'react';
import { fetchTcgCards } from '@/tcgApi';
import type { TcgCard } from '@/types';

export interface TcgCardsState {
  cards: TcgCard[];
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, TcgCard[]>();

export function useTcgCards(name: string | null): TcgCardsState {
  const [state, setState] = useState<TcgCardsState>(() => ({
    cards: (name && cache.get(name)) || [],
    loading: false,
    error: null,
  }));

  useEffect(() => {
    if (!name) {
      setState({ cards: [], loading: false, error: null });
      return;
    }
    const cached = cache.get(name);
    if (cached) {
      setState({ cards: cached, loading: false, error: null });
      return;
    }
    let active = true;
    setState({ cards: [], loading: true, error: null });
    fetchTcgCards(name)
      .then((cards) => {
        cache.set(name, cards);
        if (active) setState({ cards, loading: false, error: null });
      })
      .catch((e: Error) => {
        if (active) setState({ cards: [], loading: false, error: e.message });
      });
    return () => {
      active = false;
    };
  }, [name]);

  return state;
}
