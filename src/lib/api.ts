import { useAuthStore } from '../stores/authStore';
import type { FileRecord } from '../types/api';

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
  sizeBytes: number;
  contentHash: string;
  numPages: number;
  totalWords: number;
}

export async function createFile(
  payload: CreateFilePayload,
): Promise<{ uploadUrl: string; file: FileRecord }> {
  return json(
    await authedFetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }),
  );
}

export async function getFile(fileId: string): Promise<{ file: FileRecord; downloadUrl: string }> {
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

export async function uploadToSignedUrl(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/pdf' },
    body: file,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
}
