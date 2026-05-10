import { useMemo, useState } from 'react';

interface Props {
  names: string[];
  onSearch: (name: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ names, onSearch, disabled }: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    return names.filter((n) => n.includes(q)).slice(0, 8);
  }, [value, names]);

  const submit = (raw: string) => {
    const clean = raw.trim().toLowerCase();
    if (!clean) return;
    onSearch(clean);
    setValue(clean);
    setFocused(false);
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit(value);
          }}
          placeholder="enter pokemon name..."
        />
        <span className="crt-cursor">&nbsp;</span>
      </div>
      {focused && suggestions.length > 0 && (
        <ul>
          {suggestions.map((name) => (
            <li key={name} onMouseDown={() => submit(name)}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
