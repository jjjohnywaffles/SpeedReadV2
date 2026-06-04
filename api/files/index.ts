import { randomUUID } from 'crypto';
import {
  QUOTA_BYTES,
  gcsPath,
  getBucket,
  getDb,
  requireUser,
  withErrorHandling,
  type FileRecord,
} from '../_lib.js';

export default withErrorHandling(async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const db = getDb();
  const filesCol = db.collection('users').doc(user.sub).collection('files');

  if (req.method === 'GET') {
    const snap = await filesCol.orderBy('uploadedAt', 'desc').get();
    const files = snap.docs.map((d) => d.data() as FileRecord);
    return res.status(200).json({ files });
  }

  if (req.method === 'POST') {
    const { name, sizeBytes, contentHash, numPages, totalWords } = req.body as Partial<FileRecord>;
    if (
      typeof name !== 'string' ||
      typeof sizeBytes !== 'number' ||
      typeof contentHash !== 'string' ||
      typeof numPages !== 'number' ||
      typeof totalWords !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const dupSnap = await filesCol.where('contentHash', '==', contentHash).limit(1).get();
    if (!dupSnap.empty) {
      const existing = dupSnap.docs[0].data() as FileRecord;
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
    const path = gcsPath(user.sub, fileId);
    const [uploadUrl] = await getBucket()
      .file(path)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
        contentType: 'application/pdf',
      });

    const record: FileRecord = {
      fileId,
      name,
      sizeBytes,
      contentHash,
      numPages,
      totalWords,
      uploadedAt: Date.now(),
    };
    await filesCol.doc(fileId).set(record);

    return res.status(200).json({ uploadUrl, file: record });
  }

  res.setHeader('Allow', 'GET,POST');
  return res.status(405).json({ error: 'Method not allowed' });
});
