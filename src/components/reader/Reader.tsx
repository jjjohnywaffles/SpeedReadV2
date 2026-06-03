import { Link } from '@tanstack/react-router';
import { useReader } from '../../hooks/useReader';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { RsvpFlasher } from './RsvpFlasher';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';

interface Props {
  text: string;
  initialWpm?: number;
  progressive?: boolean;
  backHref?: string;
}

export function Reader({ text, initialWpm = 300, progressive = false, backHref = '/home' }: Props) {
  const reader = useReader({ text, initialWpm, progressive });
  useKeyboardControls(reader);

  const { hasStarted, isFinished, totalWords, wpm, currentWord } = reader;

  return (
    <div className="flex h-screen w-full flex-col bg-bg-primary">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link
          to="/"
          className="font-mono text-sm font-semibold text-accent transition-opacity hover:opacity-80"
        >
          SpeedRead
        </Link>
        <Link
          to={backHref}
          className="font-mono text-xs text-text-muted transition-colors hover:text-text-secondary"
        >
          ← Back
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8">
        {!hasStarted ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-mono text-sm text-text-secondary">
              {totalWords} words {progressive ? '(200 → 900 WPM)' : `at ${wpm} WPM`}
            </p>
            <button
              type="button"
              onClick={reader.play}
              className="rounded-lg bg-accent px-8 py-3 font-mono text-sm font-semibold text-bg-primary transition-colors hover:bg-accent/80"
            >
              Start Reading
            </button>
            <p className="font-mono text-xs text-text-muted">Press Space to start</p>
          </div>
        ) : isFinished ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-mono text-lg text-text-primary">Done!</p>
            <p className="font-mono text-sm text-text-secondary">{totalWords} words read</p>
            <button
              type="button"
              onClick={reader.reset}
              className="rounded-lg border border-border px-6 py-2.5 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
            >
              Read Again
            </button>
          </div>
        ) : (
          <RsvpFlasher word={currentWord} />
        )}
      </div>

      <ProgressBar reader={reader} />
      <PlaybackControls reader={reader} />
    </div>
  );
}
