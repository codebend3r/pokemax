interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;
  const atFirst = page <= 0;
  const atLast = page >= totalPages - 1;
  return (
    <div className="crt-pagination">
      <button
        type="button"
        className="crt-pagination-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={atFirst}
        aria-label="Previous page"
      >
        ‹ PREV
      </button>
      <span className="crt-pagination-status">
        PAGE {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        className="crt-pagination-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={atLast}
        aria-label="Next page"
      >
        NEXT ›
      </button>
    </div>
  );
}
