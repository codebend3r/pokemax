import type { ReactNode, SyntheticEvent } from 'react';

interface Props {
  label: string;
  count?: number | string;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
}

export default function Section({ label, count, defaultOpen = true, onToggle, children }: Props) {
  return (
    <details
      className="crt-section"
      open={defaultOpen}
      onToggle={(e: SyntheticEvent<HTMLDetailsElement>) => onToggle?.(e.currentTarget.open)}
    >
      <summary className="crt-section-summary">
        <span className="crt-section-label">{label}</span>
        {count !== undefined && <span className="crt-section-count"> · {count}</span>}
      </summary>
      <div className="crt-section-body">{children}</div>
    </details>
  );
}
