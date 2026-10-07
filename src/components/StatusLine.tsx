interface Props {
  state: 'ready' | 'scanning' | 'err-not-found' | 'err-api' | 'loading-dex';
}

const TEXT: Record<Props['state'], string> = {
  ready: '[ READY ]',
  scanning: '[ SCANNING... ]',
  'err-not-found': '[ ERR: NOT FOUND ]',
  'err-api': '[ ERR: TRANSMISSION LOST ]',
  'loading-dex': '[ LOADING DEX... ]',
};

export default function StatusLine({ state }: Props) {
  const busy = state === 'scanning' || state === 'loading-dex';
  const className =
    'crt-status' +
    (busy ? ' scanning' : '') +
    (state === 'err-not-found' || state === 'err-api' ? ' err' : '');
  // The live region stays mounted through READY so screen readers hear each change.
  return (
    <div className="crt-status-live" role="status">
      {state !== 'ready' && (
        <div className={className}>
          {TEXT[state]}{' '}
          {busy && (
            <span className="crt-cursor" aria-hidden="true">
              &nbsp;
            </span>
          )}
        </div>
      )}
    </div>
  );
}
