interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function ShinyToggle({ value, onChange }: Props) {
  return (
    <div className="crt-shiny">
      <button type="button" aria-pressed={!value} onClick={() => onChange(false)}>
        [ NORMAL ]
      </button>
      <button type="button" aria-pressed={value} onClick={() => onChange(true)}>
        [ SHINY ]
      </button>
    </div>
  );
}
