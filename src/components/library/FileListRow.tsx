import { useState } from 'react';
import { formatBytes, formatRelativeTime } from '../../lib/format';
import type { FileRecord } from '../../types/api';

interface Props {
  file: FileRecord;
  selected: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

export function FileListRow({ file, selected, onSelect, onOpen, onDelete }: Props) {
  const [hover, setHover] = useState(false);
  const progressPct = file.progress
    ? Math.round((file.progress.currentWordIndex / Math.max(1, file.totalWords)) * 100)
    : 0;
  const lastActivity = file.progress?.lastReadAt ?? file.uploadedAt;
  const lastLabel = file.progress
    ? formatRelativeTime(file.progress.lastReadAt)
    : formatRelativeTime(file.uploadedAt);
  const lastTitle = new Date(lastActivity).toLocaleString();

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
      className={`grid cursor-pointer grid-cols-[20px_minmax(0,1fr)_180px_120px_80px_24px] items-center gap-3 rounded-md border px-3 py-2 transition-colors ${
        selected
          ? 'border-accent bg-accent/5'
          : 'border-transparent hover:border-border hover:bg-bg-terminal'
      }`}
    >
      <svg
        width="16"
        height="16"
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

      <span className="truncate font-mono text-xs text-text-primary" title={file.name}>
        {file.name}
      </span>

      <div className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-bg-header">
          <div className="h-full bg-accent transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="w-8 text-right tabular-nums">{progressPct}%</span>
      </div>

      <span className="font-mono text-[11px] text-text-muted" title={lastTitle}>
        {lastLabel}
      </span>

      <span className="font-mono text-[11px] text-text-muted tabular-nums">
        {formatBytes(file.sizeBytes)}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        tabIndex={-1}
        className={`rounded-md p-1 text-text-muted transition-opacity hover:bg-error/20 hover:text-error ${
          hover ? 'opacity-100' : 'opacity-0'
        }`}
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
    </div>
  );
}
