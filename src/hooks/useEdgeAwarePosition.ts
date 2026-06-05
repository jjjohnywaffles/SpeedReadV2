import { useLayoutEffect, useState, type RefObject } from 'react';

export type Placement = 'top' | 'bottom' | 'left' | 'right';
export type HAlign = 'start' | 'center' | 'end';

export interface ResolvedPlacement {
  placement: Placement;
  hAlign: HAlign;
  top: number;
  left: number;
}

interface Options {
  anchorRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  preferred: Placement;
  preferredHAlign?: HAlign;
  gap?: number;
  margin?: number;
  open: boolean;
}

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export function useEdgeAwarePosition({
  anchorRef,
  contentRef,
  preferred,
  preferredHAlign = 'center',
  gap = 8,
  margin = 8,
  open,
}: Options): ResolvedPlacement {
  const [resolved, setResolved] = useState<ResolvedPlacement>({
    placement: preferred,
    hAlign: preferredHAlign,
    top: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    if (!open) return;
    const anchor = anchorRef.current;
    const content = contentRef.current;
    if (!anchor || !content) return;

    const compute = () => {
      const a = anchor.getBoundingClientRect();
      const cw = content.offsetWidth;
      const ch = content.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const fits = (placement: Placement): boolean => {
        if (placement === 'top') return a.top - gap - ch >= margin;
        if (placement === 'bottom') return a.bottom + gap + ch <= vh - margin;
        if (placement === 'left') return a.left - gap - cw >= margin;
        return a.right + gap + cw <= vw - margin;
      };

      const placement = fits(preferred)
        ? preferred
        : fits(OPPOSITE[preferred])
          ? OPPOSITE[preferred]
          : preferred;

      let top = 0;
      let left = 0;

      if (placement === 'top' || placement === 'bottom') {
        top = placement === 'top' ? a.top - gap - ch : a.bottom + gap;
        let baseLeft;
        if (preferredHAlign === 'start') baseLeft = a.left;
        else if (preferredHAlign === 'end') baseLeft = a.right - cw;
        else baseLeft = a.left + a.width / 2 - cw / 2;
        left = Math.max(margin, Math.min(baseLeft, vw - margin - cw));
      } else {
        left = placement === 'left' ? a.left - gap - cw : a.right + gap;
        const baseTop = a.top + a.height / 2 - ch / 2;
        top = Math.max(margin, Math.min(baseTop, vh - margin - ch));
      }

      const hAlign: HAlign =
        placement === 'top' || placement === 'bottom' ? preferredHAlign : 'center';

      setResolved((prev) =>
        prev.placement === placement &&
        prev.hAlign === hAlign &&
        prev.top === top &&
        prev.left === left
          ? prev
          : { placement, hAlign, top, left },
      );
    };

    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open, preferred, preferredHAlign, gap, margin, anchorRef, contentRef]);

  return resolved;
}
