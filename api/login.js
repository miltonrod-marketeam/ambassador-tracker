import { redis, checkPassword, setSession, hasPassword } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (!(await hasPassword())) return res.status(409).json({ error: 'Todavía no creas tu contraseña.', setup: true });
  const ip = String(req.headers['x-forwarded-for'] || 'local').split(',')[0].trim();
  const key = `agt:login:${ip}`;
  const tries = await redis.incr(key);
  if (tries === 1) await redis.expire(key, 900);
  if (tries > 10) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' });
  if (!(await checkPassword(req.body?.password))) return res.status(401).json({ error: 'Contraseña incorrecta.' });
  await redis.del(key);
  await setSession(res);
  res.json({ ok: true });
}
