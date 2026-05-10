export type SpriteView = '2d' | '3d';

interface Props {
  value: SpriteView;
  onChange: (v: SpriteView) => void;
}

export default function SpriteToggle({ value, onChange }: Props) {
  return (
    <div className="crt-shiny crt-view-toggle">
      <button type="button" aria-pressed={value === '2d'} onClick={() => onChange('2d')}>
        [ 2D ]
      </button>
      <button type="button" aria-pressed={value === '3d'} onClick={() => onChange('3d')}>
        [ 3D ]
      </button>
    </div>
  );
}
