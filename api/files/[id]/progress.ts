import { getDb, requireUser, withErrorHandling, type FileRecord } from '../../_lib.js';

export default withErrorHandling(async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Bad id' });

  const ref = getDb().collection('users').doc(user.sub).collection('files').doc(id);

  if (req.method === 'PUT') {
    const { currentWordIndex, wpm } = req.body as Partial<{
      currentWordIndex: number;
      wpm: number;
    }>;
    if (typeof currentWordIndex !== 'number' || typeof wpm !== 'number') {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    await ref.update({
      progress: { currentWordIndex, wpm, lastReadAt: Date.now() },
    });
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Not found' });
    const record = snap.data() as FileRecord;
    return res.status(200).json({ progress: record.progress ?? null });
  }

  res.setHeader('Allow', 'GET,PUT');
  return res.status(405).json({ error: 'Method not allowed' });
});
