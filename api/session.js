import { isAuthed, hasPassword } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (await isAuthed(req)) return res.json({ ok: true });
  res.json({ ok: false, setup: !(await hasPassword()) });
}
