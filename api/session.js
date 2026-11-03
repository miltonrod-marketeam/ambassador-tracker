import { isAuthed, hasPassword, OPEN } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (OPEN) return res.json({ ok: true, open: true });
  if (await isAuthed(req)) return res.json({ ok: true });
  res.json({ ok: false, setup: !(await hasPassword()) });
}
