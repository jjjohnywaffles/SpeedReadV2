import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { PageNavigator } from '../components/reader/PageNavigator';
import { PageTextPane } from '../components/reader/PageTextPane';
import { PlaybackControls } from '../components/reader/PlaybackControls';
import { ProgressBar } from '../components/reader/ProgressBar';
import { RsvpFlasher } from '../components/reader/RsvpFlasher';
import { AppShell } from '../components/shell/AppShell';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { usePdfReader } from '../hooks/usePdfReader';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { getFile } from '../lib/api';
import { useDocumentStore } from '../stores/documentStore';

export const Route = createFileRoute('/read/$fileId')({
  component: ReadPage,
});

function ReadPage() {
  const { fileId } = Route.useParams();
  const navigate = useNavigate();
  const fileName = useDocumentStore((s) => s.fileName);
  const numPages = useDocumentStore((s) => s.numPages);
  const source = useDocumentStore((s) => s.source);
  const loadFromBuffer = useDocumentStore((s) => s.loadFromBuffer);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const currentSource = useDocumentStore.getState().source;

    if (fileId === 'guest') {
      if (!currentSource || currentSource.type !== 'guest') void navigate({ to: '/home' });
      return;
    }

    if (currentSource?.type === 'stored' && currentSource.fileId === fileId) {
      console.log('[reader] reusing already-loaded doc', { fileId });
      return;
    }

    let cancelled = false;
    (async () => {
      console.log('[reader] fetch start', { fileId });
      setIsFetching(true);
      setFetchError(null);
      try {
        const { file, downloadUrl } = await getFile(fileId);
        console.log('[reader] metadata ok', { name: file.name, sizeBytes: file.sizeBytes });
        const res = await fetch(downloadUrl);
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        const bytes = await res.arrayBuffer();
        console.log('[reader] download ok', { bytes: bytes.byteLength });
        if (cancelled) {
          console.log('[reader] cancelled before loadFromBuffer');
          return;
        }
        await loadFromBuffer(bytes, file.name, { type: 'stored', fileId });
        console.log('[reader] loadFromBuffer ok');
        if (!cancelled) setIsFetching(false);
      } catch (e) {
        console.error('[reader] fetch failed', e);
        if (!cancelled) {
          setFetchError(e instanceof Error ? e.message : 'Failed to load PDF');
          setIsFetching(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileId, loadFromBuffer, navigate]);

  const pdf = usePdfReader(300);
  useKeyboardControls(pdf.reader);
  useReadingProgress(pdf.reader, source);

  const { reader, pages, pageStartIndices, currentPage, goToPage, isReady, loadError } = pdf;

  if (fetchError || loadError) {
    return (
      <AppShell centerSlot={<span>Error</span>}>
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-mono text-sm text-error">{fetchError ?? loadError}</p>
          <Link
            to="/home"
            className="rounded-lg border border-border px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
          >
            ← Back to library
          </Link>
        </div>
      </AppShell>
    );
  }

  if (isFetching || numPages === 0 || !isReady) {
    return (
      <AppShell centerSlot={<span>Loading…</span>}>
        <div className="flex h-full items-center justify-center">
          <p className="font-mono text-sm text-text-muted">
            {isFetching ? 'Downloading PDF…' : 'Parsing PDF…'}
          </p>
        </div>
      </AppShell>
    );
  }

  const currentPageWords = pages[currentPage - 1] ?? [];
  const currentPageStart = pageStartIndices[currentPage - 1] ?? 0;

  return (
    <AppShell centerSlot={<span className="truncate text-text-primary">{fileName}</span>}>
      <div className="flex h-full w-full flex-col">
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
    </AppShell>
  );
}
