import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { AppShell } from '../components/shell/AppShell';
import { ApiError, createFile } from '../lib/api';
import { sha256Text } from '../lib/hash';
import { parsePastedText } from '../lib/parsers';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import { useFilesStore } from '../stores/filesStore';
import type { DuplicateError, FileRecord, QuotaError } from '../types/api';

export const Route = createFileRoute('/paste')({
  component: PastePage,
});

const WORD_CAP = 10000;

function PastePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isGuest = useAuthStore((s) => s.isGuest);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const setParsed = useDocumentStore((s) => s.setParsed);
  const upsert = useFilesStore((s) => s.upsert);

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<FileRecord | null>(null);

  const wordCount = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [text]);

  const overCap = wordCount > WORD_CAP;
  const canSubmit = wordCount > 0 && !overCap && !busy;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setDuplicate(null);
    setBusy(true);

    const finalTitle = title.trim() || 'Untitled';
    const parsed = parsePastedText(text);

    if (!user) {
      if (!isGuest) continueAsGuest();
      setParsed({
        fileName: finalTitle,
        source: 'paste',
        pages: parsed.pages,
        location: { type: 'guest' },
      });
      navigate({ to: '/read/$fileId', params: { fileId: 'guest' } });
      return;
    }

    try {
      const contentHash = await sha256Text(text);
      const created = await createFile({
        name: finalTitle,
        source: 'paste',
        sizeBytes: new Blob([text]).size,
        contentHash,
        numPages: parsed.numPages,
        totalWords: parsed.totalWords,
        pages: parsed.pages,
      });
      upsert(created.file);
      setParsed({
        fileName: finalTitle,
        source: 'paste',
        pages: parsed.pages,
        location: { type: 'stored', fileId: created.file.fileId },
      });
      navigate({ to: '/read/$fileId', params: { fileId: created.file.fileId } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setDuplicate((e.body as DuplicateError).existing);
      } else if (e instanceof ApiError && e.status === 413) {
        const body = e.body as QuotaError;
        const usedMb = (body.usedBytes / 1024 / 1024).toFixed(1);
        const quotaMb = (body.quotaBytes / 1024 / 1024).toFixed(0);
        setError(`Quota exceeded — using ${usedMb} / ${quotaMb} MB.`);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to save');
      }
      setBusy(false);
    }
  };

  return (
    <AppShell centerSlot={<span className="text-text-primary">Paste text</span>}>
      <div className="custom-scrollbar h-full overflow-y-auto px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-text-secondary" htmlFor="paste-title">
              Title
            </label>
            <input
              id="paste-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="rounded-md border border-border bg-bg-terminal px-3 py-2 font-mono text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <label className="font-mono text-xs text-text-secondary" htmlFor="paste-text">
                Text
              </label>
              <span
                className={`font-mono text-[11px] tabular-nums ${
                  overCap ? 'text-error' : 'text-text-muted'
                }`}
              >
                {wordCount.toLocaleString()} / {WORD_CAP.toLocaleString()} words
              </span>
            </div>
            <textarea
              id="paste-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste up to 10,000 words…"
              rows={18}
              className="resize-y rounded-md border border-border bg-bg-terminal px-3 py-2 font-mono text-sm leading-relaxed text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
          </div>

          {error && <p className="font-mono text-xs text-error">{error}</p>}
          {duplicate && (
            <div className="flex flex-col items-start gap-2 rounded-lg border border-border bg-bg-terminal p-3 font-mono text-xs">
              <span className="text-text-secondary">
                Already in your library as{' '}
                <span className="text-text-primary">{duplicate.name}</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate({ to: '/read/$fileId', params: { fileId: duplicate.fileId } })
                  }
                  className="rounded-md bg-accent px-3 py-1.5 font-semibold text-bg-primary transition-colors hover:bg-accent/80"
                >
                  Open existing
                </button>
                <button
                  type="button"
                  onClick={() => setDuplicate(null)}
                  className="rounded-md border border-border px-3 py-1.5 text-text-secondary transition-colors hover:bg-bg-header hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate({ to: '/home' })}
              className="rounded-lg border border-border px-4 py-2 font-mono text-xs text-text-secondary transition-colors hover:bg-bg-terminal hover:text-text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit}
              className="rounded-lg bg-accent px-6 py-2 font-mono text-sm font-semibold text-bg-primary transition-colors hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Saving…' : 'Save & read'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
