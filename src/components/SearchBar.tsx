import { useEffect, useMemo, useState } from 'react';

interface Props {
  names: string[];
  onSearch: (name: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ names, onSearch, disabled }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return names.filter((n) => n.includes(q)).slice(0, 8);
  }, [value, names]);

  useEffect(() => {
    setHighlight(-1);
  }, [value]);

  const open = focused && suggestions.length > 0;

  const submit = (raw: string) => {
    const clean = raw.trim().toLowerCase();
    if (!clean) return;
    onSearch(clean);
    setValue(clean);
    setFocused(false);
    setHighlight(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && open) {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && open) {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, -1));
    } else if (e.key === 'Escape') {
      setFocused(false);
      setHighlight(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlight >= 0) submit(suggestions[highlight]);
      else submit(value);
    }
  };

  return (
    <div className="crt-search">
      <div className="crt-search-row">
        <span className="crt-search-prompt">&gt;</span>
        <input
          aria-label="search pokemon"
          type="text"
          value={value}
          disabled={disabled}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 100)}
          onKeyDown={onKeyDown}
          placeholder="enter pokemon name..."
        />
        <span className="crt-cursor">&nbsp;</span>
      </div>
      {open && (
        <ul role="listbox">
          {suggestions.map((name, i) => (
            <li
              key={name}
              role="option"
              aria-selected={i === highlight}
              data-active={i === highlight ? 'true' : undefined}
              onMouseDown={() => submit(name)}
              onMouseEnter={() => setHighlight(i)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
