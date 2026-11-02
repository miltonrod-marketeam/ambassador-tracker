import { redis, K, guard } from './_lib.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Método no permitido' });
  await redis.set(K.settings, JSON.stringify(req.body?.settings || {}));
  res.json({ ok: true });
}
