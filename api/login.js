import { redis, samePassword, setSession } from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const ip = String(req.headers['x-forwarded-for'] || 'local').split(',')[0].trim();
  const key = `agt:login:${ip}`;
  const tries = await redis.incr(key);
  if (tries === 1) await redis.expire(key, 900);
  if (tries > 10) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' });
  if (!samePassword(req.body?.password)) return res.status(401).json({ error: 'Contraseña incorrecta.' });
  await redis.del(key);
  setSession(res);
  res.json({ ok: true });
}
