import type { UseReader } from '../../hooks/useReader';
import { Tooltip } from '../ui/Tooltip';

interface Props {
  reader: UseReader;
}

export function PlaybackControls({ reader }: Props) {
  const { isPlaying, isFinished, currentIndex, totalWords, wpm, progressive, effectiveWpm } =
    reader;

  return (
    <div className="border-t border-border p-4">
      <div className="relative flex items-center gap-4">
        <span className="flex-1 font-mono text-xs tabular-nums text-text-muted">
          {currentIndex + 1} / {totalWords}
        </span>

        <div className="absolute left-1/2 flex -translate-x-1/2 items-center">
          <Tooltip text="Back 10 words (←)">
            <button
              type="button"
              onClick={reader.skipBackward}
              className="mr-2 rounded-md p-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
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
          </Tooltip>

          <Tooltip text={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
            <button
              type="button"
              onClick={reader.toggle}
              disabled={isFinished}
              className="rounded-lg bg-accent p-2.5 text-bg-primary transition-colors hover:bg-accent/80 disabled:opacity-30"
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
          </Tooltip>

          <Tooltip text="Forward 10 words (→)">
            <button
              type="button"
              onClick={reader.skipForward}
              className="ml-2 rounded-md p-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
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
          </Tooltip>
        </div>

        <div className="absolute left-1/2 ml-[110px] flex items-center">
          <Tooltip text="Reset (R)">
            <button
              type="button"
              onClick={reader.reset}
              className="rounded-md p-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
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
          </Tooltip>
        </div>

        {progressive ? (
          <span className="flex-1 text-right font-mono text-xs text-accent">
            {effectiveWpm} WPM
          </span>
        ) : (
          <div className="flex flex-1 items-center justify-end gap-3">
            <input
              type="range"
              value={wpm}
              onChange={(e) => reader.setWpm(Number(e.target.value))}
              onPointerUp={(e) => e.currentTarget.blur()}
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
    </div>
  );
}
