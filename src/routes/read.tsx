import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { PageNavigator } from '../components/reader/PageNavigator';
import { PageTextPane } from '../components/reader/PageTextPane';
import { PlaybackControls } from '../components/reader/PlaybackControls';
import { ProgressBar } from '../components/reader/ProgressBar';
import { RsvpFlasher } from '../components/reader/RsvpFlasher';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { usePdfReader } from '../hooks/usePdfReader';
import { useDocumentStore } from '../stores/documentStore';

export const Route = createFileRoute('/read')({
  component: ReadPage,
});

function ReadPage() {
  const navigate = useNavigate();
  const fileName = useDocumentStore((s) => s.fileName);
  const numPages = useDocumentStore((s) => s.numPages);

  useEffect(() => {
    if (numPages === 0) void navigate({ to: '/home' });
  }, [numPages, navigate]);

  const pdf = usePdfReader(300);
  useKeyboardControls(pdf.reader);

  const { reader, pages, pageStartIndices, currentPage, goToPage, isReady, loadError } = pdf;

  if (loadError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-bg-primary px-6 text-center">
        <p className="font-mono text-sm text-error">Failed to load PDF: {loadError}</p>
        <Link
          to="/home"
          className="rounded-lg border border-border px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg-primary">
        <p className="font-mono text-sm text-text-muted">Parsing PDF…</p>
      </div>
    );
  }

  const currentPageWords = pages[currentPage - 1] ?? [];
  const currentPageStart = pageStartIndices[currentPage - 1] ?? 0;

  return (
    <div className="flex h-screen w-full flex-col bg-bg-primary">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link
          to="/"
          className="font-mono text-sm font-semibold text-accent transition-opacity hover:opacity-80"
        >
          SpeedRead
        </Link>
        <span className="truncate px-4 font-mono text-xs text-text-muted">{fileName}</span>
        <Link
          to="/home"
          className="font-mono text-xs text-text-muted transition-colors hover:text-text-secondary"
        >
          ← Back
        </Link>
      </header>

      <div className="flex h-72 shrink-0 flex-col items-center justify-center border-b border-border px-8 sm:h-96">
        {!reader.hasStarted ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-sm text-text-secondary">
              {reader.totalWords} words across {numPages} pages
            </p>
            <button
              type="button"
              onClick={reader.play}
              className="rounded-lg bg-accent px-8 py-3 font-mono text-sm font-semibold text-bg-primary transition-colors hover:bg-accent/80"
            >
              Start Reading
            </button>
          </div>
        ) : reader.isFinished ? (
          <div className="flex flex-col items-center gap-3">
            <p className="font-mono text-lg text-text-primary">Done!</p>
            <button
              type="button"
              onClick={reader.reset}
              className="rounded-lg border border-border px-6 py-2 font-mono text-sm text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
            >
              Read Again
            </button>
          </div>
        ) : (
          <RsvpFlasher word={reader.currentWord} />
        )}
      </div>

      <ProgressBar reader={reader} />
      <PlaybackControls reader={reader} />
      <PageNavigator currentPage={currentPage} numPages={numPages} onGoToPage={goToPage} />

      <PageTextPane
        words={currentPageWords}
        pageStartIndex={currentPageStart}
        currentGlobalIndex={reader.currentIndex}
        onWordClick={(globalIndex) => {
          reader.pause();
          reader.seekTo(globalIndex);
        }}
      />
    </div>
  );
}
