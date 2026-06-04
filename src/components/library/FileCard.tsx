import { useState } from 'react';
import type { FileRecord } from '../../types/api';

interface Props {
  file: FileRecord;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

export function FileCard({ file, selected, onSelect, onOpen, onDelete }: Props) {
  const [hover, setHover] = useState(false);
  const sizeMb = (file.sizeBytes / 1024 / 1024).toFixed(1);
  const progressPct = file.progress
    ? Math.round((file.progress.currentWordIndex / Math.max(1, file.totalWords)) * 100)
    : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen();
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`group relative flex aspect-[3/4] cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
        selected
          ? 'border-accent bg-accent/5'
          : 'border-border bg-bg-terminal hover:border-text-muted'
      }`}
    >
      <div className="flex flex-1 items-center justify-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={selected ? 'text-accent' : 'text-text-secondary'}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>

      <div className="w-full">
        <p className="truncate font-mono text-xs text-text-primary" title={file.name}>
          {file.name}
        </p>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg-header">
          <div className="h-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-1 flex justify-between font-mono text-[10px] text-text-muted">
          <span>{progressPct}%</span>
          <span>{sizeMb} MB</span>
        </p>
      </div>

      {hover && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute right-1.5 top-1.5 rounded-md bg-bg-primary/80 p-1 text-text-muted transition-colors hover:bg-error/20 hover:text-error"
          title="Delete"
          aria-label="Delete"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}
