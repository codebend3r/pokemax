interface Props {
  state: 'ready' | 'scanning' | 'err-not-found' | 'err-api' | 'loading-dex';
}

const TEXT: Record<Props['state'], string> = {
  ready: '[ READY ]',
  scanning: '[ SCANNING... ]',
  'err-not-found': '[ ERR: NOT FOUND IN GEN VIII ]',
  'err-api': '[ ERR: TRANSMISSION LOST ]',
  'loading-dex': '[ LOADING DEX... ]',
};

export default function StatusLine({ state }: Props) {
  const className =
    'crt-status' +
    (state === 'scanning' || state === 'loading-dex' ? ' scanning' : '') +
    (state === 'err-not-found' || state === 'err-api' ? ' err' : '');
  return (
    <div className={className}>
      {TEXT[state]} {(state === 'scanning' || state === 'loading-dex') && <span className="crt-cursor">&nbsp;</span>}
    </div>
  );
}
