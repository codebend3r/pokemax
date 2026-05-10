import type { ReactNode } from 'react';

interface Props {
  label: string;
  count?: number | string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function Section({ label, count, defaultOpen = true, children }: Props) {
  return (
    <details className="crt-section" open={defaultOpen}>
      <summary className="crt-section-summary">
        <span className="crt-section-label">{label}</span>
        {count !== undefined && <span className="crt-section-count"> · {count}</span>}
      </summary>
      <div className="crt-section-body">{children}</div>
    </details>
  );
}
