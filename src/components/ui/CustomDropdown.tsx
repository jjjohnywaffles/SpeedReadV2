import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEdgeAwarePosition } from '../../hooks/useEdgeAwarePosition';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  ariaLabel?: string;
  className?: string;
}

export function CustomDropdown<T extends string>({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  className = '',
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  const pos = useEdgeAwarePosition({
    anchorRef: buttonRef,
    contentRef: listRef,
    preferred: 'bottom',
    preferredHAlign: 'start',
    open,
  });

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
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

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === value),
    );
    activeIndexRef.current = idx;
    const id = requestAnimationFrame(() => itemRefs.current[idx]?.focus());
    return () => cancelAnimationFrame(id);
  }, [open, options, value]);

  const focusItem = (idx: number) => {
    activeIndexRef.current = idx;
    itemRefs.current[idx]?.focus();
  };

  const handleListKey = (e: React.KeyboardEvent) => {
    const current = activeIndexRef.current;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusItem((current + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem((current - 1 + options.length) % options.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(options.length - 1);
    }
  };

  const [buttonWidth, setButtonWidth] = useState<number | undefined>(undefined);
  useLayoutEffect(() => {
    if (!open) return;
    if (buttonRef.current) setButtonWidth(buttonRef.current.offsetWidth);
  }, [open]);

  return (
    <div className={`relative inline-block ${className}`}>
      {label && <label className="mb-1 block font-mono text-[11px] text-text-muted">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-bg-terminal px-3 py-1.5 font-mono text-xs text-text-primary transition-colors hover:border-text-muted focus:border-accent focus:outline-none"
      >
        <span>{selected?.label ?? 'Select…'}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            onKeyDown={handleListKey}
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              minWidth: buttonWidth,
            }}
            className="z-[80] max-h-60 overflow-auto rounded-md border border-border bg-bg-terminal py-1 shadow-lg"
          >
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      buttonRef.current?.focus();
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left font-mono text-xs transition-colors ${
                      isSelected
                        ? 'text-accent'
                        : 'text-text-secondary hover:bg-bg-header hover:text-text-primary'
                    } focus:bg-bg-header focus:text-text-primary focus:outline-none`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
