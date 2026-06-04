export interface FileRecord {
  fileId: string;
  name: string;
  sizeBytes: number;
  contentHash: string;
  numPages: number;
  totalWords: number;
  uploadedAt: number;
  progress?: {
    currentWordIndex: number;
    wpm: number;
    lastReadAt: number;
  };
}

export interface DuplicateError {
  error: 'duplicate';
  existing: FileRecord;
}

export interface QuotaError {
  error: 'quota';
  usedBytes: number;
  quotaBytes: number;
}
