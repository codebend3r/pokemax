interface Props {
  names: string[];
  value: string;
  onValueChange: (v: string) => void;
  onSearch: (name: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ value, onValueChange, onSearch, disabled }: Props) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(value);
    } else if (e.key === 'Escape') {
      onValueChange('');
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
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search for any Pokémon (ESC to clear)"
        />
        <span className="crt-cursor">&nbsp;</span>
      </div>
    </div>
  );
}
