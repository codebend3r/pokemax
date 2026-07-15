import type { TcgCard } from '@/types';

interface Props {
  cards: TcgCard[];
  loading: boolean;
  error: string | null;
}

function lowestMarketPrice(card: TcgCard): number | null {
  const prices = card.tcgplayer?.prices;
  if (!prices) return null;
  const markets = Object.values(prices)
    .map((p) => p.market)
    .filter((m): m is number => typeof m === 'number');
  return markets.length > 0 ? Math.min(...markets) : null;
}

function CardTile({ card }: { card: TcgCard }) {
  const price = lowestMarketPrice(card);
  const body = (
    <>
      <img src={card.images.small} alt={card.name} className="crt-tcg-card-img" loading="lazy" />
      <div className="crt-tcg-card-set">{card.set.name}</div>
      {price !== null && <div className="crt-tcg-card-price">${price.toFixed(2)}</div>}
    </>
  );
  if (card.tcgplayer?.url) {
    return (
      <a className="crt-tcg-card" href={card.tcgplayer.url} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }
  return <div className="crt-tcg-card">{body}</div>;
}

export default function TcgCards({ cards, loading, error }: Props) {
  if (loading) return <div className="crt-detail-loading">scanning card market...</div>;
  if (error) return <div className="crt-detail-error">err: {error}</div>;
  if (cards.length === 0) {
    return <div style={{ color: 'var(--dim)' }}>no cards found.</div>;
  }
  return (
    <div className="crt-tcg-grid">
      {cards.map((card) => (
        <CardTile key={card.id} card={card} />
      ))}
    </div>
  );
}
