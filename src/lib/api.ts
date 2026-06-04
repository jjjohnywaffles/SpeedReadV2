import { useAuthStore } from '../stores/authStore';
import type { FileRecord } from '../types/api';

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
  }
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
  return json(await fetch('/api/files', { headers: authHeaders() }));
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
    await fetch('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    }),
  );
}

export async function getFile(fileId: string): Promise<{ file: FileRecord; downloadUrl: string }> {
  return json(await fetch(`/api/files/${fileId}`, { headers: authHeaders() }));
}

export async function deleteFile(fileId: string): Promise<void> {
  const res = await fetch(`/api/files/${fileId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, await res.text());
}

export async function putProgress(
  fileId: string,
  payload: { currentWordIndex: number; wpm: number },
): Promise<void> {
  const res = await fetch(`/api/files/${fileId}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
