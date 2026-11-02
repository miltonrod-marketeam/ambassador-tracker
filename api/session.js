import { isAuthed } from './_lib.js';
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: isAuthed(req) });
}
