import { useUiStore, type LibraryView } from '../../stores/uiStore';
import { Tooltip } from '../ui/Tooltip';
import { FilterPopover } from './FilterPopover';

export function LibraryToolbar() {
  const view = useUiStore((s) => s.libraryView);
  const setView = useUiStore((s) => s.setLibraryView);

  return (
    <div className="flex items-center justify-end gap-2 border-b border-border pb-3">
      <div className="flex h-8 items-stretch overflow-hidden rounded-md border border-border bg-bg-terminal">
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

      <FilterPopover />
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
    <Tooltip text={label}>
      <button
        type="button"
        onClick={() => onSelect(value)}
        aria-label={label}
        aria-pressed={active}
        className={`flex aspect-square items-center justify-center transition-colors ${
          active ? 'bg-bg-header text-accent' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );
}
