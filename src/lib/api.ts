import { useAuthStore } from '../stores/authStore';
import type { DocumentSourceType, FileRecord } from '../types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const token = useAuthStore.getState().token;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}

async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const firstAttempt = await fetch(input, { ...init, headers: buildHeaders(init.headers) });
  if (firstAttempt.status !== 401) return firstAttempt;

  const { refresh, token } = useAuthStore.getState();
  if (!token) return firstAttempt;

  const newToken = await refresh();
  if (!newToken) return firstAttempt;

  return fetch(input, { ...init, headers: buildHeaders(init.headers) });
}

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new ApiError(res.status, body);
  }
  return res.json() as Promise<T>;
}

export async function listFiles(): Promise<{ files: FileRecord[] }> {
  return json(await authedFetch('/api/files'));
}

export interface CreateFilePayload {
  name: string;
  source: DocumentSourceType;
  sizeBytes: number;
  contentHash: string;
  numPages: number;
  totalWords: number;
  pages: string[][];
}

export interface CreateFileResponse {
  file: FileRecord;
  originalUploadUrl?: string | null;
  parsedUploadUrl?: string | null;
}

export async function createFile(payload: CreateFilePayload): Promise<CreateFileResponse> {
  return json(
    await authedFetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}

export interface GetFileResponse {
  file: FileRecord;
  parsedDownloadUrl: string | null;
}

export async function getFile(fileId: string): Promise<GetFileResponse> {
  return json(await authedFetch(`/api/files/${fileId}`));
}

export async function deleteFile(fileId: string): Promise<void> {
  const res = await authedFetch(`/api/files/${fileId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, await res.text());
}

export async function putProgress(
  fileId: string,
  payload: { currentWordIndex: number; wpm: number },
): Promise<void> {
  const res = await authedFetch(`/api/files/${fileId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, await res.text());
}

export async function uploadOriginal(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
}

export async function uploadParsedJson(uploadUrl: string, pages: string[][]): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pages }),
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
}

export async function fetchParsedJson(downloadUrl: string): Promise<{ pages: string[][] }> {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json();
}
