import { useEffect, useMemo, useState } from 'react';
import { useDocumentStore } from '../stores/documentStore';
import { useReader, type UseReader } from './useReader';

export interface PdfReader {
  reader: UseReader;
  pages: string[][];
  pageStartIndices: number[];
  currentPage: number;
  goToPage: (pageNumber: number) => void;
  isReady: boolean;
  loadError: string | null;
}

export function usePdfReader(initialWpm = 300): PdfReader {
  const numPages = useDocumentStore((s) => s.numPages);
  const getPageWords = useDocumentStore((s) => s.getPageWords);

  const [pages, setPages] = useState<string[][]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (numPages === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await Promise.all(
          Array.from({ length: numPages }, (_, i) => getPageWords(i + 1)),
        );
        if (!cancelled) {
          setPages(all);
          setLoadError(null);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to parse PDF.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numPages, getPageWords]);

  const { flatText, pageStartIndices } = useMemo(() => {
    const starts: number[] = [];
    let acc = 0;
    for (const p of pages) {
      starts.push(acc);
      acc += p.length;
    }
    return { flatText: pages.flat().join(' '), pageStartIndices: starts };
  }, [pages]);

  const reader = useReader({ text: flatText, initialWpm });

  const currentPage = useMemo(() => {
    if (pageStartIndices.length === 0) return 1;
    for (let i = pageStartIndices.length - 1; i >= 0; i--) {
      if (reader.currentIndex >= pageStartIndices[i]) return i + 1;
    }
    return 1;
  }, [reader.currentIndex, pageStartIndices]);

  const goToPage = (pageNumber: number) => {
    const idx = pageStartIndices[pageNumber - 1];
    if (idx !== undefined) reader.seekTo(idx);
  };

  return {
    reader,
    pages,
    pageStartIndices,
    currentPage,
    goToPage,
    isReady: pages.length > 0,
    loadError,
  };
}
