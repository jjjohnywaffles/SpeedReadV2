import { useEffect, useRef } from 'react';
import { getFile, putProgress } from '../lib/api';
import { useFilesStore } from '../stores/filesStore';
import type { DocumentSource } from '../stores/documentStore';
import type { UseReader } from './useReader';

const DEBOUNCE_MS = 5000;

function flushProgress(
  fileId: string,
  index: number,
  wpm: number,
  updateStore: (
    fileId: string,
    progress: { currentWordIndex: number; wpm: number; lastReadAt: number },
  ) => void,
): void {
  void putProgress(fileId, { currentWordIndex: index, wpm }).then(() => {
    updateStore(fileId, {
      currentWordIndex: index,
      wpm,
      lastReadAt: Date.now(),
    });
  });
}

export function useReadingProgress(reader: UseReader, source: DocumentSource | null) {
  const fileId = source?.type === 'stored' ? source.fileId : null;
  const updateProgress = useFilesStore((s) => s.updateProgress);

  const hasLoadedRef = useRef<string | null>(null);
  const lastWrittenRef = useRef<number>(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readerRef = useRef(reader);

  useEffect(() => {
    readerRef.current = reader;
  });

  const totalWords = reader.totalWords;
  const currentIndex = reader.currentIndex;
  const wpm = reader.wpm;

  useEffect(() => {
    if (!fileId) return;
    if (totalWords === 0) return;
    if (hasLoadedRef.current === fileId) return;
    hasLoadedRef.current = fileId;

    let cancelled = false;
    (async () => {
      try {
        const { file } = await getFile(fileId);
        if (cancelled || !file.progress) return;
        readerRef.current.seekTo(file.progress.currentWordIndex);
        readerRef.current.setWpm(file.progress.wpm);
        lastWrittenRef.current = file.progress.currentWordIndex;
      } catch {
        // ignore — fall back to default position
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileId, totalWords]);

  useEffect(() => {
    if (!fileId) return;
    if (hasLoadedRef.current !== fileId) return;
    if (currentIndex === lastWrittenRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      lastWrittenRef.current = currentIndex;
      flushProgress(fileId, currentIndex, wpm, updateProgress);
    }, DEBOUNCE_MS);
  }, [fileId, currentIndex, wpm, updateProgress]);

  useEffect(() => {
    const id = fileId;
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!id || hasLoadedRef.current !== id) return;
      const idx = readerRef.current.currentIndex;
      const w = readerRef.current.wpm;
      if (idx === lastWrittenRef.current) return;
      lastWrittenRef.current = idx;
      flushProgress(id, idx, w, updateProgress);
    };
  }, [fileId, updateProgress]);
}
