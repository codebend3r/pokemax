/** Placeholder while a lazily-loaded page or card chunk downloads. */
export default function LoadingCard({ what }: { what: string }) {
  return (
    <div className="crt-card crt-card-loading">
      ▶ LOADING {what}
      <span className="crt-cursor">&nbsp;</span>
    </div>
  );
}
