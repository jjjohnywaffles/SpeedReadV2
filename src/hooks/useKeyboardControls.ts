import { useEffect } from 'react';
import type { UseReader } from './useReader';

export function useKeyboardControls(reader: UseReader) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        reader.toggle();
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        reader.skipForward();
      } else if (e.key === 'ArrowLeft' || e.key === 'h') {
        reader.skipBackward();
      } else if (e.key === 'r') {
        reader.reset();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [reader]);
}
