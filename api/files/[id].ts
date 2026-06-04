import {
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

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Bad id' });

  const ref = getDb().collection('users').doc(user.sub).collection('files').doc(id);

  if (req.method === 'GET') {
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    const record = snap.data() as FileRecord;
    const [downloadUrl] = await getBucket()
      .file(gcsPath(user.sub, id))
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000,
      });
    return res.status(200).json({ file: record, downloadUrl });
  }

  if (req.method === 'DELETE') {
    await getBucket().file(gcsPath(user.sub, id)).delete({ ignoreNotFound: true });
    await ref.delete();
    return res.status(204).end();
  }

  res.setHeader('Allow', 'GET,DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
});
