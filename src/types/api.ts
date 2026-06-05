export type DocumentSourceType = 'pdf' | 'epub' | 'docx' | 'html' | 'txt' | 'md' | 'paste';

export interface FileRecord {
  fileId: string;
  name: string;
  source: DocumentSourceType;
  sizeBytes: number;
  contentHash: string;
  numPages: number;
  totalWords: number;
  uploadedAt: number;
  parsedInline?: { pages: string[][] };
  hasParsedBlob?: boolean;
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
