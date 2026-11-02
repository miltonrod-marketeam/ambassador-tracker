import { guard } from './_lib.js';

export default async function handler(req, res) {
  if (!guard(req, res)) return;
  const url = String(req.query.url || '');
  if (!/^https:\/\/(www\.)?(x|twitter)\.com\//i.test(url)) {
    return res.status(400).json({ error: 'Pega un enlace de X que empiece con https://x.com/' });
  }
  const r = await fetch(`https://publish.twitter.com/oembed?omit_script=1&url=${encodeURIComponent(url)}`);
  if (!r.ok) return res.status(502).json({ error: 'X no devolvió la vista previa de ese post.' });
  const d = await r.json();
  const text = String(d.html || '')
    .replace(/<p[^>]*>([\s\S]*?)<\/p>[\s\S]*/i, '$1')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .trim();
  res.json({ author: d.author_name || '', authorUrl: d.author_url || '', text });
}
