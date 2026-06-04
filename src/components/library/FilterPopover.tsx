import { useEffect, useRef, useState } from 'react';
import { CustomDropdown } from '../ui/CustomDropdown';
import { LIBRARY_SORT_LABELS, useUiStore, type LibrarySort } from '../../stores/uiStore';

const SORT_OPTIONS = (Object.entries(LIBRARY_SORT_LABELS) as [LibrarySort, string][]).map(
  ([value, label]) => ({ value, label }),
);

export function FilterPopover() {
  const sort = useUiStore((s) => s.librarySort);
  const setSort = useUiStore((s) => s.setLibrarySort);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Filter & sort"
        className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${
          open
            ? 'border-accent text-accent'
            : 'border-border bg-bg-terminal text-text-secondary hover:border-text-muted hover:text-text-primary'
        }`}
      >
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
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-lg border border-border bg-bg-terminal p-3 shadow-lg">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Sort by
          </p>
          <CustomDropdown
            value={sort}
            options={SORT_OPTIONS}
            onChange={setSort}
            ariaLabel="Sort by"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
