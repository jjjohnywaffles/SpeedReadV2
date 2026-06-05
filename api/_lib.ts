import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import { Storage } from '@google-cloud/storage';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function readEnv(key: string): string {
  const raw = process.env[key] ?? '';
  // Some env loaders preserve surrounding quotes from .env files; strip them.
  if (raw.length >= 2 && raw.startsWith('"') && raw.endsWith('"')) {
    return raw.slice(1, -1);
  }
  return raw;
}

const GOOGLE_CLIENT_ID = readEnv('GOOGLE_CLIENT_ID');
const GCS_BUCKET_NAME = readEnv('GCS_BUCKET_NAME');
const GCP_PROJECT_ID = readEnv('GCP_PROJECT_ID');
const GCP_SERVICE_ACCOUNT_KEY = readEnv('GCP_SERVICE_ACCOUNT_KEY');
const FIRESTORE_DATABASE_ID = readEnv('FIRESTORE_DATABASE_ID');

function decodeServiceAccount(): {
  client_email: string;
  private_key: string;
  project_id: string;
} {
  if (!GCP_SERVICE_ACCOUNT_KEY) throw new Error('GCP_SERVICE_ACCOUNT_KEY not set');
  const raw = Buffer.from(GCP_SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8');
  return JSON.parse(raw);
}

let storageClient: Storage | null = null;
export function getStorage(): Storage {
  if (!storageClient) {
    const sa = decodeServiceAccount();
    storageClient = new Storage({
      projectId: sa.project_id,
      credentials: { client_email: sa.client_email, private_key: sa.private_key },
    });
  }
  return storageClient;
}

export function getBucket() {
  return getStorage().bucket(GCS_BUCKET_NAME);
}

let dbInitLogged = false;
export function getDb() {
  if (!getApps().length) {
    const sa = decodeServiceAccount();
    initializeApp({
      credential: cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
      projectId: GCP_PROJECT_ID || sa.project_id,
    });
  }
  const db = FIRESTORE_DATABASE_ID ? getFirestore(FIRESTORE_DATABASE_ID) : getFirestore();
  if (!dbInitLogged) {
    console.log(
      `[api] Firestore init — project=${GCP_PROJECT_ID || '(from SA)'} database=${FIRESTORE_DATABASE_ID || '(default)'}`,
    );
    dbInitLogged = true;
  }
  return db;
}

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function requireUser(
  req: VercelRequest,
  res: VercelResponse,
): Promise<{ sub: string; email: string } | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing auth' });
    return null;
  }
  const token = auth.slice(7);
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      res.status(401).json({ error: 'Invalid token' });
      return null;
    }
    return { sub: payload.sub, email: payload.email };
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return null;
  }
}

export const QUOTA_BYTES = 100 * 1024 * 1024;
export const FIRESTORE_INLINE_MAX_BYTES = 700 * 1024;

export type DocumentSourceType = 'pdf' | 'epub' | 'docx' | 'html' | 'txt' | 'md' | 'paste';

export function originalGcsPath(
  userId: string,
  fileId: string,
  source: DocumentSourceType,
): string {
  return `users/${userId}/${fileId}.original.${source}`;
}

export function parsedGcsPath(userId: string, fileId: string): string {
  return `users/${userId}/${fileId}.parsed.json`;
}

export function withErrorHandling(
  fn: (req: VercelRequest, res: VercelResponse) => Promise<unknown>,
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      await fn(req, res);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[api] ${req.method} ${req.url} —`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'internal', message });
      }
    }
  };
}

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

interface StoredPage {
  words: string[];
}

interface FirestoreFileRecord extends Omit<FileRecord, 'parsedInline'> {
  parsedInline?: { pages: StoredPage[] };
}

export function toFirestoreShape(record: FileRecord): FirestoreFileRecord {
  const { parsedInline, ...rest } = record;
  if (!parsedInline) return rest;
  return {
    ...rest,
    parsedInline: { pages: parsedInline.pages.map((words) => ({ words })) },
  };
}

export function fromFirestoreShape(stored: FirestoreFileRecord): FileRecord {
  const { parsedInline, ...rest } = stored;
  if (!parsedInline) return rest;
  return {
    ...rest,
    parsedInline: { pages: parsedInline.pages.map((p) => p.words) },
  };
}
