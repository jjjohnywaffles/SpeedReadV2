import { useNavigate } from '@tanstack/react-router';
import { useRef, useState } from 'react';
import { useUpload, type UploadStatus } from '../../hooks/useUpload';
import { SUPPORTED_EXTENSIONS } from '../../lib/parsers';
import type { FileRecord } from '../../types/api';

interface Props {
  disabled?: boolean;
  disabledHint?: string;
}

const STATUS_LABEL: Record<UploadStatus, string> = {
  idle: 'Click to upload or drag a document',
  parsing: 'Parsing…',
  hashing: 'Hashing…',
  uploading: 'Uploading…',
  done: 'Done',
};

const ACCEPT_ATTR = SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(',');
const SUPPORTED_LABEL = SUPPORTED_EXTENSIONS.map((ext) => ext.toUpperCase()).join(', ');

export function PdfUpload({ disabled, disabledHint }: Props) {
  const navigate = useNavigate();
  const { upload, status } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<FileRecord | null>(null);

  const busy = status !== 'idle' && status !== 'done';

  const handleFile = async (file: File) => {
    setError(null);
    setDuplicate(null);
    const outcome = await upload(file);
    if (outcome.kind === 'done') {
      if (outcome.result.source === 'guest') {
        navigate({ to: '/read/$fileId', params: { fileId: 'guest' } });
      }
      // Signed-in: stay on /home so the user can see the new file land in the library.
    } else if (outcome.kind === 'duplicate') {
      setDuplicate(outcome.existing);
    } else if (outcome.kind === 'quota') {
      const usedMb = (outcome.usedBytes / 1024 / 1024).toFixed(1);
      const quotaMb = (outcome.quotaBytes / 1024 / 1024).toFixed(0);
      setError(`Quota exceeded — using ${usedMb} / ${quotaMb} MB. Delete files to upload more.`);
    } else if (outcome.kind === 'unsupported') {
      setError(`Unsupported file: ${outcome.fileName}. Supported formats: ${SUPPORTED_LABEL}.`);
    } else {
      setError(outcome.message);
    }
  };

  const openExisting = () => {
    if (!duplicate) return;
    navigate({ to: '/read/$fileId', params: { fileId: duplicate.fileId } });
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        disabled={disabled || busy}
        className={`flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 font-mono text-sm transition-colors ${
          isDragging
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>
          {disabled && disabledHint
            ? disabledHint
            : isDragging
              ? 'Drop your document here'
              : STATUS_LABEL[status]}
        </span>
        {!disabled && status === 'idle' && (
          <span className="font-mono text-[10px] text-text-muted">{SUPPORTED_LABEL}</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
        className="hidden"
      />
      {error && <p className="font-mono text-xs text-error">{error}</p>}
      {duplicate && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-bg-terminal p-3 font-mono text-xs">
          <span className="text-text-secondary">
            Already in your library as <span className="text-text-primary">{duplicate.name}</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={openExisting}
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
    </div>
  );
}
