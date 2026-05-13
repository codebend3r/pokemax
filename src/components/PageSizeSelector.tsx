import { PAGE_SIZE_OPTIONS, type PageSize } from '../hooks/usePageSize';

interface Props {
  pageSize: PageSize;
  onChange: (size: PageSize) => void;
}

export default function PageSizeSelector({ pageSize, onChange }: Props) {
  return (
    <label className="crt-pagesize">
      <span className="crt-pagesize-label">SHOW</span>
      <select
        className="crt-pagesize-select"
        value={pageSize === Infinity ? 'all' : String(pageSize)}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === 'all' ? Infinity : (Number(v) as PageSize));
        }}
      >
        {PAGE_SIZE_OPTIONS.map((opt) => (
          <option key={opt} value={opt === Infinity ? 'all' : String(opt)}>
            {opt === Infinity ? 'ALL' : opt}
          </option>
        ))}
      </select>
    </label>
  );
}
