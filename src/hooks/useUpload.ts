import { useState } from 'react';
import { ApiError, createFile, uploadOriginal, uploadParsedJson } from '../lib/api';
import { sha256 } from '../lib/hash';
import { parseFile, UnsupportedFormatError } from '../lib/parsers';
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
  | { kind: 'unsupported'; fileName: string }
  | { kind: 'error'; message: string };

export function useUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const isGuest = useAuthStore((s) => s.isGuest);
  const user = useAuthStore((s) => s.user);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);
  const setParsed = useDocumentStore((s) => s.setParsed);
  const upsert = useFilesStore((s) => s.upsert);

  const upload = async (file: File): Promise<UploadOutcome> => {
    setError(null);
    try {
      setStatus('parsing');
      let parsed;
      try {
        parsed = await parseFile(file);
      } catch (e) {
        if (e instanceof UnsupportedFormatError) {
          setStatus('idle');
          return { kind: 'unsupported', fileName: e.fileName };
        }
        throw e;
      }

      if (!user) {
        if (!isGuest) continueAsGuest();
        setParsed({
          fileName: file.name,
          source: parsed.source,
          pages: parsed.pages,
          location: { type: 'guest' },
        });
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
          source: parsed.source,
          sizeBytes: file.size,
          contentHash,
          numPages: parsed.numPages,
          totalWords: parsed.totalWords,
          pages: parsed.pages,
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

      const uploads: Promise<void>[] = [];
      if (created.originalUploadUrl) uploads.push(uploadOriginal(created.originalUploadUrl, file));
      if (created.parsedUploadUrl)
        uploads.push(uploadParsedJson(created.parsedUploadUrl, parsed.pages));
      if (uploads.length > 0) await Promise.all(uploads);

      upsert(created.file);
      setParsed({
        fileName: file.name,
        source: parsed.source,
        pages: parsed.pages,
        location: { type: 'stored', fileId: created.file.fileId },
      });
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
