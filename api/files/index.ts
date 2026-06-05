import { randomUUID } from 'crypto';
import {
  FIRESTORE_INLINE_MAX_BYTES,
  QUOTA_BYTES,
  fromFirestoreShape,
  getBucket,
  getDb,
  originalGcsPath,
  parsedGcsPath,
  requireUser,
  toFirestoreShape,
  withErrorHandling,
  type DocumentSourceType,
  type FileRecord,
} from '../_lib.js';

const ALLOWED_SOURCES: DocumentSourceType[] = [
  'pdf',
  'epub',
  'docx',
  'html',
  'txt',
  'md',
  'paste',
];

export default withErrorHandling(async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const db = getDb();
  const filesCol = db.collection('users').doc(user.sub).collection('files');

  if (req.method === 'GET') {
    const snap = await filesCol.orderBy('uploadedAt', 'desc').get();
    const files = snap.docs.map((d) => fromFirestoreShape(d.data() as never));
    return res.status(200).json({ files });
  }

  if (req.method === 'POST') {
    const body = req.body as Partial<FileRecord> & {
      source?: DocumentSourceType;
      pages?: string[][];
    };
    const { name, source, sizeBytes, contentHash, numPages, totalWords, pages } = body;

    if (
      typeof name !== 'string' ||
      typeof source !== 'string' ||
      !ALLOWED_SOURCES.includes(source) ||
      typeof sizeBytes !== 'number' ||
      typeof contentHash !== 'string' ||
      typeof numPages !== 'number' ||
      typeof totalWords !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const dupSnap = await filesCol.where('contentHash', '==', contentHash).limit(1).get();
    if (!dupSnap.empty) {
      const existing = fromFirestoreShape(dupSnap.docs[0].data() as never);
      return res.status(409).json({ error: 'duplicate', existing });
    }

    const existingSnap = await filesCol.get();
    const usedBytes = existingSnap.docs.reduce(
      (sum, d) => sum + ((d.data() as FileRecord).sizeBytes || 0),
      0,
    );
    if (usedBytes + sizeBytes > QUOTA_BYTES) {
      return res.status(413).json({
        error: 'quota',
        usedBytes,
        quotaBytes: QUOTA_BYTES,
      });
    }

    const fileId = randomUUID();
    const isPaste = source === 'paste';

    if (isPaste) {
      if (!Array.isArray(pages)) {
        return res.status(400).json({ error: 'Pasted source requires pages' });
      }
      const record: FileRecord = {
        fileId,
        name,
        source,
        sizeBytes,
        contentHash,
        numPages,
        totalWords,
        uploadedAt: Date.now(),
        parsedInline: { pages },
      };
      await filesCol.doc(fileId).set(toFirestoreShape(record));
      return res.status(200).json({ file: record });
    }

    if (!Array.isArray(pages)) {
      return res.status(400).json({ error: 'pages required for file upload' });
    }
    const parsedJson = JSON.stringify({ pages });
    const inlineEligible = Buffer.byteLength(parsedJson, 'utf-8') <= FIRESTORE_INLINE_MAX_BYTES;

    let parsedUploadUrl: string | null = null;
    if (!inlineEligible) {
      const [url] = await getBucket()
        .file(parsedGcsPath(user.sub, fileId))
        .getSignedUrl({
          version: 'v4',
          action: 'write',
          expires: Date.now() + 15 * 60 * 1000,
          contentType: 'application/json',
        });
      parsedUploadUrl = url;
    }

    const [originalUploadUrl] = await getBucket()
      .file(originalGcsPath(user.sub, fileId, source))
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
      });

    const record: FileRecord = {
      fileId,
      name,
      source,
      sizeBytes,
      contentHash,
      numPages,
      totalWords,
      uploadedAt: Date.now(),
      ...(inlineEligible ? { parsedInline: { pages } } : { hasParsedBlob: true }),
    };
    await filesCol.doc(fileId).set(toFirestoreShape(record));

    return res.status(200).json({
      file: record,
      originalUploadUrl,
      parsedUploadUrl,
    });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method not allowed' });
});
