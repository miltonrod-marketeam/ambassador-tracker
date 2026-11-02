import { redis, K, guard } from './_lib.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method === 'PUT') {
    const idea = req.body?.idea;
    if (!idea?.id) return res.status(400).json({ error: 'Idea sin id.' });
    await redis.hset(K.ideas, { [idea.id]: JSON.stringify(idea) });
    return res.json({ ok: true });
  }
  if (req.method === 'DELETE') {
    await redis.hdel(K.ideas, req.query.id);
    return res.json({ ok: true });
  }
  res.status(405).json({ error: 'Método no permitido' });
}
