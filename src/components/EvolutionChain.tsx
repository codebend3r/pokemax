import type { ChainLink, EvolutionDetail } from '../types';

interface Props {
  chain: ChainLink;
  active: string;
}

function describeCondition(d: EvolutionDetail): string {
  const parts: string[] = [];
  if (d.min_level != null) parts.push(`Lv ${d.min_level}`);
  if (d.item) parts.push(`use ${d.item.name.replace(/-/g, ' ')}`);
  if (d.held_item) parts.push(`hold ${d.held_item.name.replace(/-/g, ' ')}`);
  if (d.known_move) parts.push(`knows ${d.known_move.name.replace(/-/g, ' ')}`);
  if (d.min_happiness != null) parts.push(`happiness ${d.min_happiness}`);
  if (d.time_of_day) parts.push(d.time_of_day);
  if (d.needs_overworld_rain) parts.push('in rain');
  if (d.location) parts.push(`at ${d.location.name.replace(/-/g, ' ')}`);
  if (d.trigger.name === 'trade' && parts.length === 0) parts.push('trade');
  if (parts.length === 0) parts.push(d.trigger.name);
  return parts.join(' · ');
}

function Node({ link, active }: { link: ChainLink; active: string }) {
  const isActive = link.species.name === active;
  return (
    <span className={'crt-evo-node' + (isActive ? ' active' : '')}>{link.species.name}</span>
  );
}

function Branch({ link, active }: { link: ChainLink; active: string }) {
  if (link.evolves_to.length === 0) {
    return <Node link={link} active={active} />;
  }
  if (link.evolves_to.length === 1) {
    const child = link.evolves_to[0];
    const cond = child.evolution_details[0];
    return (
      <>
        <Node link={link} active={active} />
        <span className="crt-evo-arrow">→</span>
        {cond && <span className="crt-evo-cond">{describeCondition(cond)}</span>}
        <span className="crt-evo-arrow">→</span>
        <Branch link={child} active={active} />
      </>
    );
  }
  return (
    <>
      <Node link={link} active={active} />
      <span className="crt-evo-arrow">→</span>
      <span className="crt-evo-branch">
        {link.evolves_to.map((child) => {
          const cond = child.evolution_details[0];
          return (
            <span key={child.species.name} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {cond && <span className="crt-evo-cond">{describeCondition(cond)}</span>}
              <span className="crt-evo-arrow">→</span>
              <Branch link={child} active={active} />
            </span>
          );
        })}
      </span>
    </>
  );
}

export default function EvolutionChain({ chain, active }: Props) {
  return (
    <div className="crt-section">
      <div className="crt-section-label">▶ EVOLUTION</div>
      <div className="crt-evo">
        <Branch link={chain} active={active} />
      </div>
    </div>
  );
}
