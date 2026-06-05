import {
  fromFirestoreShape,
  getBucket,
  getDb,
  originalGcsPath,
  parsedGcsPath,
  requireUser,
  withErrorHandling,
  type FileRecord,
} from '../_lib.js';

export default withErrorHandling(async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Bad id' });

  const ref = getDb().collection('users').doc(user.sub).collection('files').doc(id);

  if (req.method === 'GET') {
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    const record = fromFirestoreShape(snap.data() as never);

    let parsedDownloadUrl: string | null = null;
    if (record.hasParsedBlob) {
      const [url] = await getBucket()
        .file(parsedGcsPath(user.sub, id))
        .getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000,
        });
      parsedDownloadUrl = url;
    }

    return res.status(200).json({ file: record, parsedDownloadUrl });
  }

  if (req.method === 'DELETE') {
    const snap = await ref.get();
    if (snap.exists) {
      const record = snap.data() as FileRecord;
      if (record.source !== 'paste') {
        await getBucket()
          .file(originalGcsPath(user.sub, id, record.source))
          .delete({ ignoreNotFound: true });
      }
      if (record.hasParsedBlob) {
        await getBucket().file(parsedGcsPath(user.sub, id)).delete({ ignoreNotFound: true });
      }
    }
    await ref.delete();
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET,DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
});
