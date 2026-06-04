import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { deleteFile } from '../../lib/api';
import { useFilesStore } from '../../stores/filesStore';
import { PdfUpload } from '../upload/PdfUpload';
import { FileCard } from './FileCard';

export function Library() {
  const navigate = useNavigate();
  const files = useFilesStore((s) => s.files);
  const loading = useFilesStore((s) => s.loading);
  const error = useFilesStore((s) => s.error);
  const refresh = useFilesStore((s) => s.refresh);
  const remove = useFilesStore((s) => s.remove);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-6 py-6">
      <div className={isEmpty ? 'mx-auto w-full max-w-md flex-1 flex flex-col justify-center' : ''}>
        <PdfUpload />
      </div>

      {error && <p className="font-mono text-xs text-error">{error}</p>}

      {!isEmpty && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {files.map((file) => (
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
      )}

      {loading && files.length === 0 && (
        <p className="text-center font-mono text-xs text-text-muted">Loading library…</p>
      )}
    </div>
  );
}
