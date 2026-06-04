import { useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useEffect } from 'react';
import { deleteFile } from '../../lib/api';
import { useFilesStore } from '../../stores/filesStore';
import { useUiStore, type LibrarySort } from '../../stores/uiStore';
import type { FileRecord } from '../../types/api';
import { PdfUpload } from '../upload/PdfUpload';
import { FileCard } from './FileCard';
import { FileListRow } from './FileListRow';
import { LibraryToolbar } from './LibraryToolbar';

function sortFiles(files: FileRecord[], sort: LibrarySort): FileRecord[] {
  const copy = [...files];
  switch (sort) {
    case 'lastOpened':
      return copy.sort((a, b) => {
        const aT = a.progress?.lastReadAt ?? a.uploadedAt;
        const bT = b.progress?.lastReadAt ?? b.uploadedAt;
        return bT - aT;
      });
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'uploadedAt':
      return copy.sort((a, b) => b.uploadedAt - a.uploadedAt);
    case 'sizeDesc':
      return copy.sort((a, b) => b.sizeBytes - a.sizeBytes);
    case 'progressDesc':
      return copy.sort((a, b) => progressPct(b) - progressPct(a));
    case 'progressAsc':
      return copy.sort((a, b) => progressPct(a) - progressPct(b));
  }
}

function progressPct(f: FileRecord): number {
  if (!f.progress) return 0;
  return f.progress.currentWordIndex / Math.max(1, f.totalWords);
}

export function Library() {
  const navigate = useNavigate();
  const files = useFilesStore((s) => s.files);
  const loading = useFilesStore((s) => s.loading);
  const error = useFilesStore((s) => s.error);
  const refresh = useFilesStore((s) => s.refresh);
  const remove = useFilesStore((s) => s.remove);
  const view = useUiStore((s) => s.libraryView);
  const sort = useUiStore((s) => s.librarySort);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const sorted = useMemo(() => sortFiles(files, sort), [files, sort]);
  const usedBytes = useMemo(() => files.reduce((sum, f) => sum + f.sizeBytes, 0), [files]);

  const onDelete = async (fileId: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    try {
      await deleteFile(fileId);
      remove(fileId);
      if (selectedId === fileId) setSelectedId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const isEmpty = !loading && files.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-6">
        <div className="w-full max-w-md">
          <PdfUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 py-6">
      <PdfUpload />
      {error && <p className="font-mono text-xs text-error">{error}</p>}
      <LibraryToolbar usedBytes={usedBytes} />

      {view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sorted.map((file) => (
            <FileCard
              key={file.fileId}
              file={file}
              selected={selectedId === file.fileId}
              onSelect={() => setSelectedId(file.fileId)}
              onOpen={() => navigate({ to: '/read/$fileId', params: { fileId: file.fileId } })}
              onDelete={() => onDelete(file.fileId)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="grid grid-cols-[20px_minmax(0,1fr)_180px_120px_80px_24px] items-center gap-3 border-b border-border px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
            <span />
            <span>Name</span>
            <span>Progress</span>
            <span>Last opened</span>
            <span className="text-left">Size</span>
            <span />
          </div>
          <div className="flex flex-col gap-0.5 pt-2">
            {sorted.map((file) => (
              <FileListRow
                key={file.fileId}
                file={file}
                selected={selectedId === file.fileId}
                onSelect={() => setSelectedId(file.fileId)}
                onOpen={() => navigate({ to: '/read/$fileId', params: { fileId: file.fileId } })}
                onDelete={() => onDelete(file.fileId)}
              />
            ))}
          </div>
        </div>
      )}

      {loading && files.length === 0 && (
        <p className="text-center font-mono text-xs text-text-muted">Loading library…</p>
      )}
    </div>
  );
}
