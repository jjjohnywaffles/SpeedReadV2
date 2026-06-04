import { useState } from 'react';
import { ApiError, createFile, uploadToSignedUrl } from '../lib/api';
import { sha256 } from '../lib/hash';
import { loadPdf, getPageText } from '../lib/pdf';
import { useAuthStore } from '../stores/authStore';
import { useDocumentStore } from '../stores/documentStore';
import { useFilesStore } from '../stores/filesStore';
import type { DuplicateError, FileRecord, QuotaError } from '../types/api';

export type UploadStatus = 'idle' | 'parsing' | 'hashing' | 'uploading' | 'done';

export interface UploadResult {
  source: 'guest' | 'stored';
  file?: FileRecord;
}

export type UploadOutcome =
  | { kind: 'done'; result: UploadResult }
  | { kind: 'duplicate'; existing: FileRecord }
  | { kind: 'quota'; usedBytes: number; quotaBytes: number }
  | { kind: 'error'; message: string };

export function useUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isGuest = useAuthStore((s) => s.isGuest);
  const user = useAuthStore((s) => s.user);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const loadFile = useDocumentStore((s) => s.loadFile);
  const upsert = useFilesStore((s) => s.upsert);

  const upload = async (file: File): Promise<UploadOutcome> => {
    setError(null);
    try {
      setStatus('parsing');
      const buf = await file.arrayBuffer();
      const doc = await loadPdf(buf.slice(0));
      const numPages = doc.numPages;
      const allPages = await Promise.all(
        Array.from({ length: numPages }, (_, i) => getPageText(doc, i + 1)),
      );
      const totalWords = allPages.reduce((sum, p) => sum + p.words.length, 0);

      if (!user) {
        if (!isGuest) continueAsGuest();
        await loadFile(file, { type: 'guest' });
        setStatus('done');
        return { kind: 'done', result: { source: 'guest' } };
      }

      setStatus('hashing');
      const contentHash = await sha256(file);

      setStatus('uploading');
      let created;
      try {
        created = await createFile({
          name: file.name,
          sizeBytes: file.size,
          contentHash,
          numPages,
          totalWords,
        });
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          const body = e.body as DuplicateError;
          setStatus('idle');
          return { kind: 'duplicate', existing: body.existing };
        }
        if (e instanceof ApiError && e.status === 413) {
          const body = e.body as QuotaError;
          setStatus('idle');
          return { kind: 'quota', usedBytes: body.usedBytes, quotaBytes: body.quotaBytes };
        }
        throw e;
      }

      await uploadToSignedUrl(created.uploadUrl, file);
      upsert(created.file);
      await loadFile(file, { type: 'stored', fileId: created.file.fileId });
      setStatus('done');
      return { kind: 'done', result: { source: 'stored', file: created.file } };
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed';
      setError(message);
      setStatus('idle');
      return { kind: 'error', message };
    }
  };

  return { upload, status, error, isGuest };
}
