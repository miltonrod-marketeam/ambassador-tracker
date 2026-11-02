import { createPassword, hasPassword, setSession } from './_lib.js';

// Primer uso: crea la contraseña. Solo funciona mientras no exista una.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  if (await hasPassword()) return res.status(409).json({ error: 'La contraseña ya fue creada. Entra con ella.' });
  const pw = String(req.body?.password || '');
  if (pw.length < 8) return res.status(400).json({ error: 'Usa al menos 8 caracteres.' });
  if (!(await createPassword(pw))) return res.status(409).json({ error: 'La contraseña ya fue creada. Entra con ella.' });
  await setSession(res);
  res.json({ ok: true });
}
