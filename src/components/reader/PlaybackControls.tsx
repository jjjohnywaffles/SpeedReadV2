import type { UseReader } from '../../hooks/useReader';

interface Props {
  reader: UseReader;
}

export function PlaybackControls({ reader }: Props) {
  const { isPlaying, isFinished, currentIndex, totalWords, wpm, progressive, effectiveWpm } =
    reader;

  return (
    <div className="flex flex-col gap-3 border-t border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reader.skipBackward}
            className="rounded-md p-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
            title="Back 10 words (←)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={reader.toggle}
            disabled={isFinished}
            className="rounded-lg bg-accent p-2.5 text-bg-primary transition-colors hover:bg-accent/80 disabled:opacity-30"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={reader.skipForward}
            className="rounded-md p-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
            title="Forward 10 words (→)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>

          <button
            type="button"
            onClick={reader.reset}
            className="ml-1 rounded-md p-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
            title="Reset (R)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
        </div>

        <span className="font-mono text-xs text-text-muted">
          {currentIndex + 1} / {totalWords}
        </span>

        {progressive ? (
          <span className="font-mono text-xs text-accent">{effectiveWpm} WPM</span>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="range"
              value={wpm}
              onChange={(e) => reader.setWpm(Number(e.target.value))}
              min={100}
              max={1000}
              step={25}
              className="w-40 accent-accent"
              aria-label="Words per minute"
            />
            <span className="w-20 text-right font-mono text-xs text-accent tabular-nums">
              {wpm} WPM
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4 font-mono text-[10px] text-text-muted">
        <span>Space: play/pause</span>
        <span>←→: skip 10</span>
        <span>R: reset</span>
      </div>
    </div>
  );
}
