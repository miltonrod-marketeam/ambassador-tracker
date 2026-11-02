import { put, del } from '@vercel/blob';
import { guard } from './_lib.js';

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } };

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method === 'POST') {
    const m = /^data:(image\/[a-z+]+);base64,(.+)$/i.exec(req.body?.dataUrl || '');
    if (!m) return res.status(400).json({ error: 'La imagen no tiene un formato válido.' });
    const ext = m[1].split('/')[1].replace('jpeg', 'jpg');
    const blob = await put(`evidencias/captura.${ext}`, Buffer.from(m[2], 'base64'), {
      access: 'public', contentType: m[1], addRandomSuffix: true,
    });
    return res.json({ url: blob.url });
  }
  if (req.method === 'DELETE') {
    const url = req.body?.url;
    if (url && url.includes('.blob.vercel-storage.com')) await del(url);
    return res.json({ ok: true });
  }
  res.status(405).json({ error: 'Método no permitido' });
}
