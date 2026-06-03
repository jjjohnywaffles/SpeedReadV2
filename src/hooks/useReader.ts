import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const MIN_PROGRESSIVE_WPM = 200;
const MAX_PROGRESSIVE_WPM = 900;

function getProgressiveWpm(index: number, total: number): number {
  const t = total > 1 ? index / (total - 1) : 0;
  return Math.round(MIN_PROGRESSIVE_WPM + t * (MAX_PROGRESSIVE_WPM - MIN_PROGRESSIVE_WPM));
}

export interface UseReaderOptions {
  text: string;
  initialWpm?: number;
  progressive?: boolean;
}

export interface UseReader {
  words: string[];
  currentIndex: number;
  currentWord: string;
  totalWords: number;
  progress: number;
  isPlaying: boolean;
  hasStarted: boolean;
  isFinished: boolean;
  wpm: number;
  effectiveWpm: number;
  progressive: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skipForward: () => void;
  skipBackward: () => void;
  setWpm: (wpm: number) => void;
  seekTo: (index: number) => void;
}

export function useReader({
  text,
  initialWpm = 300,
  progressive = false,
}: UseReaderOptions): UseReader {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const totalWords = words.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(initialWpm);
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveWpm = progressive ? getProgressiveWpm(currentIndex, totalWords) : wpm;
  const msPerWord = 60000 / effectiveWpm;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const play = useCallback(() => {
    if (isFinished) return;
    setIsPlaying(true);
    setHasStarted(true);
  }, [isFinished]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
    setCurrentIndex(0);
    setIsFinished(false);
    setHasStarted(false);
  }, []);

  const skipForward = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(i + 10, totalWords - 1);
      if (next >= totalWords - 1) {
        setIsFinished(true);
        setIsPlaying(false);
      }
      return next;
    });
  }, [totalWords]);

  const skipBackward = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 10, 0));
    setIsFinished(false);
  }, []);

  const seekTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalWords - 1));
      setCurrentIndex(clamped);
      setIsFinished(false);
    },
    [totalWords],
  );

  useEffect(() => {
    clearTimer();
    if (!isPlaying || isFinished) return;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= totalWords) {
          setIsPlaying(false);
          setIsFinished(true);
          return prev;
        }
        return next;
      });
    }, msPerWord);

    return clearTimer;
  }, [isPlaying, isFinished, msPerWord, totalWords, currentIndex]);

  return {
    words,
    currentIndex,
    currentWord: words[currentIndex] || '',
    totalWords,
    progress: totalWords > 0 ? ((currentIndex + 1) / totalWords) * 100 : 0,
    isPlaying,
    hasStarted,
    isFinished,
    wpm,
    effectiveWpm,
    progressive,
    play,
    pause,
    toggle,
    reset,
    skipForward,
    skipBackward,
    setWpm,
    seekTo,
  };
}
