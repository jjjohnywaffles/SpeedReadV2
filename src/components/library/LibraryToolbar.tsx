import {
  LIBRARY_SORT_LABELS,
  useUiStore,
  type LibrarySort,
  type LibraryView,
} from '../../stores/uiStore';
import { formatBytes } from '../../lib/format';

const QUOTA_BYTES = 100 * 1024 * 1024;

interface Props {
  usedBytes: number;
}

export function LibraryToolbar({ usedBytes }: Props) {
  const view = useUiStore((s) => s.libraryView);
  const setView = useUiStore((s) => s.setLibraryView);
  const sort = useUiStore((s) => s.librarySort);
  const setSort = useUiStore((s) => s.setLibrarySort);

  const usedPct = Math.min(100, Math.round((usedBytes / QUOTA_BYTES) * 100));

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
      <div className="flex items-center rounded-md border border-border bg-bg-terminal p-0.5">
        <ViewButton current={view} value="grid" onSelect={setView} label="Grid">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </ViewButton>
        <ViewButton current={view} value="list" onSelect={setView} label="List">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </ViewButton>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
        <label htmlFor="library-sort">Sort:</label>
        <select
          id="library-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as LibrarySort)}
          className="rounded-md border border-border bg-bg-terminal px-2 py-1 text-text-primary focus:border-accent focus:outline-none"
        >
          {(Object.entries(LIBRARY_SORT_LABELS) as [LibrarySort, string][]).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="flex min-w-[160px] flex-col items-end gap-1 font-mono text-[11px] text-text-muted">
        <span>
          {formatBytes(usedBytes)} / {formatBytes(QUOTA_BYTES)}
        </span>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-bg-terminal">
          <div
            className={`h-full transition-all ${usedPct > 90 ? 'bg-warning' : 'bg-accent'}`}
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface ViewButtonProps {
  current: LibraryView;
  value: LibraryView;
  label: string;
  onSelect: (view: LibraryView) => void;
  children: React.ReactNode;
}

function ViewButton({ current, value, label, onSelect, children }: ViewButtonProps) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`rounded-sm px-2 py-1 transition-colors ${
        active ? 'bg-bg-header text-accent' : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  );
}
