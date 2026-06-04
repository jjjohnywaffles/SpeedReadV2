import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import { Storage } from '@google-cloud/storage';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME ?? '';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID ?? '';
const GCP_SERVICE_ACCOUNT_KEY = process.env.GCP_SERVICE_ACCOUNT_KEY ?? '';
const FIRESTORE_DATABASE_ID = process.env.FIRESTORE_DATABASE_ID ?? '';

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

export function gcsPath(userId: string, fileId: string): string {
  return `users/${userId}/${fileId}.pdf`;
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
