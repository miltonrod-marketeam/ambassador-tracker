import crypto from 'node:crypto';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export const K = { tasks: 'agt:tasks', ideas: 'agt:ideas', settings: 'agt:settings' };
const COOKIE = 'agt_session';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 días

const secret = () => process.env.SESSION_SECRET || '';
const hmac = (v) => crypto.createHmac('sha256', secret()).update(v).digest('hex');

export const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

export function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export function isAuthed(req) {
  if (!secret()) return false;
  const token = readCookie(req, COOKIE);
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = hmac(exp);
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

export function setSession(res) {
  const exp = String(Date.now() + MAX_AGE * 1000);
  const token = `${exp}.${hmac(exp)}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

export function guard(req, res) {
  if (!isAuthed(req)) {
    res.status(401).json({ error: 'Tu sesión expiró. Vuelve a entrar con tu contraseña.' });
    return false;
  }
  return true;
}

export function samePassword(input) {
  const a = crypto.createHash('sha256').update(String(input || '')).digest();
  const b = crypto.createHash('sha256').update(String(process.env.APP_PASSWORD || '')).digest();
  return !!process.env.APP_PASSWORD && crypto.timingSafeEqual(a, b);
}

export async function hsetMany(key, items) {
  for (let i = 0; i < items.length; i += 40) {
    const chunk = {};
    items.slice(i, i + 40).forEach((it) => { chunk[it.id] = JSON.stringify(it); });
    await redis.hset(key, chunk);
  }
}
