import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEdgeAwarePosition } from '../../hooks/useEdgeAwarePosition';
import { CustomDropdown } from '../ui/CustomDropdown';
import { Tooltip } from '../ui/Tooltip';
import { LIBRARY_SORT_LABELS, useUiStore, type LibrarySort } from '../../stores/uiStore';

const SORT_OPTIONS = (Object.entries(LIBRARY_SORT_LABELS) as [LibrarySort, string][]).map(
  ([value, label]) => ({ value, label }),
);

export function FilterPopover() {
  const sort = useUiStore((s) => s.librarySort);
  const setSort = useUiStore((s) => s.setLibrarySort);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const pos = useEdgeAwarePosition({
    anchorRef: buttonRef,
    contentRef: panelRef,
    preferred: 'bottom',
    preferredHAlign: 'end',
    open,
  });

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
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
    <>
      <Tooltip text="Filter & sort">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
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
      </Tooltip>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            className="z-[80] w-64 rounded-lg border border-border bg-bg-terminal p-3 shadow-lg"
          >
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
          </div>,
          document.body,
        )}
    </>
  );
}
