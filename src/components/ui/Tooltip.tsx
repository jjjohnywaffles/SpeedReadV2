import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEdgeAwarePosition, type Placement } from '../../hooks/useEdgeAwarePosition';

interface Props {
  text: string;
  placement?: Placement;
  delay?: number;
  className?: string;
  children: ReactNode;
}

export function Tooltip({ text, placement = 'top', delay = 500, className = '', children }: Props) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  const pos = useEdgeAwarePosition({
    anchorRef,
    contentRef,
    preferred: placement,
    open,
  });

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  };

  return (
    <>
      <span
        ref={anchorRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={`inline-flex ${className}`}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <div
            ref={contentRef}
            role="tooltip"
            className="pointer-events-none fixed z-[100] rounded-md border border-border bg-bg-header px-2 py-1 font-mono text-[11px] text-text-primary shadow-md"
            style={{ top: pos.top, left: pos.left }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
