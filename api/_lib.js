import crypto from 'node:crypto';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export const K = { tasks: 'agt:tasks', ideas: 'agt:ideas', settings: 'agt:settings' };
const COOKIE = 'agt_session';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 días

let secretCache = process.env.SESSION_SECRET || '';
async function getSecret() {
  if (secretCache) return secretCache;
  let s = await redis.get('agt:secret');
  if (!s) {
    await redis.set('agt:secret', crypto.randomBytes(32).toString('hex'), { nx: true });
    s = await redis.get('agt:secret');
  }
  secretCache = String(s);
  return secretCache;
}
const hmac = (v, key) => crypto.createHmac('sha256', key).update(v).digest('hex');

export const parse = (v) => (typeof v === 'string' ? JSON.parse(v) : v);

export function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export async function isAuthed(req) {
  const token = readCookie(req, COOKIE);
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const good = hmac(exp, await getSecret());
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good));
}

export async function setSession(res) {
  const exp = String(Date.now() + MAX_AGE * 1000);
  const token = `${exp}.${hmac(exp, await getSecret())}`;
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`);
}

export function clearSession(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`);
}

export async function guard(req, res) {
  if (!(await isAuthed(req))) {
    res.status(401).json({ error: 'Tu sesión expiró. Vuelve a entrar con tu contraseña.' });
    return false;
  }
  return true;
}

// Contraseña creada por el usuario: se guarda solo su huella (scrypt con sal).
const AUTH_KEY = 'agt:auth';
// Solo cuenta la contraseña creada en la app. APP_PASSWORD (si existe) es un acceso de emergencia
// y no impide que la primera vez puedas crear la tuya.
export const hasPassword = async () => !!(await redis.get(AUTH_KEY));

export async function createPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  const res = await redis.set(AUTH_KEY, `${salt}:${hash}`, { nx: true });
  return res !== null; // false si alguien ya la había creado
}

export async function checkPassword(input) {
  const pw = String(input || '');
  if (process.env.APP_PASSWORD) {
    const a = crypto.createHash('sha256').update(pw).digest();
    const b = crypto.createHash('sha256').update(process.env.APP_PASSWORD).digest();
    if (crypto.timingSafeEqual(a, b)) return true;
  }
  const stored = await redis.get(AUTH_KEY);
  if (!stored) return false;
  const [salt, hash] = String(stored).split(':');
  const test = crypto.scryptSync(pw, salt, 64);
  const good = Buffer.from(hash, 'hex');
  return test.length === good.length && crypto.timingSafeEqual(test, good);
}

export async function hsetMany(key, items) {
  for (let i = 0; i < items.length; i += 40) {
    const chunk = {};
    items.slice(i, i + 40).forEach((it) => { chunk[it.id] = JSON.stringify(it); });
    await redis.hset(key, chunk);
  }
}
