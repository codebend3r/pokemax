/** Placeholder while a lazily-loaded page or card chunk downloads. */
export default function LoadingCard({ what }: { what: string }) {
  return (
    <div className="crt-card crt-card-loading" role="status">
      ▶ LOADING {what}
      <span className="crt-cursor" aria-hidden="true">
        &nbsp;
      </span>
    </div>
  );
}
