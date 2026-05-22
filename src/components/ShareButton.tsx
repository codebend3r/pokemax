import { useState } from 'react';

interface Props {
  selected: string | null;
}

export default function ShareButton({ selected }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    const text = window.location.href;

    const nav = navigator as Navigator & {
      share?: (data: { title?: string; url?: string }) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({
          title: selected ? `Pokemax | ${selected}` : 'Pokemax',
          url: text,
        });
        return;
      } catch {
        /* user dismissed — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', text);
    }
  };

  return (
    <button
      type="button"
      className={'crt-share-btn' + (copied ? ' copied' : '')}
      onClick={handle}
      aria-label="Share link"
      title="Copy share link"
    >
      {copied ? '✓ COPIED' : '⇪ SHARE'}
    </button>
  );
}
