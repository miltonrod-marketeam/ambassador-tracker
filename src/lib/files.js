import { TASK_BY_CODE } from './constants';
import { dayInfo, uid, currentMonth, linkHref } from './schedule';

export function compressImage(file, maxWidth = 1000, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(reader.result);
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Convierte la copia .json de la app anterior (Gemini) o de esta versión
export function normalizeBackup(raw) {
  if (raw.version === 2) return { tasks: raw.tasks || [], ideas: raw.ideas || [], settings: raw.settings };
  const tasks = (raw.schedule || []).filter((i) => i.dateStr).map((i) => {
    const imgs = Array.isArray(i.screenshots) && i.screenshots.length ? i.screenshots : (i.screenshotDataUrl ? [i.screenshotDataUrl] : []);
    const def = TASK_BY_CODE[i.taskCode] || TASK_BY_CODE['04'];
    return {
      id: i.id || uid('t'), dateStr: i.dateStr, taskCode: i.taskCode || '04', title: i.title || def.short,
      topic: i.topic || '', copy: i.copy || '', links: i.links || [], images: imgs.filter(Boolean),
      views: Number(i.views) || 0, targetViews: i.targetViews || (def.views ? 300 : 0),
      requiresViews: i.requiresViews ?? def.views, status: i.status || 'Programado',
      points: Number(i.points) || 0, telegramChecked: !!i.telegramChecked, discordChecked: !!i.discordChecked,
      tgPlanned: true, dcPlanned: true, updatedAt: Date.now(),
    };
  });
  return {
    tasks,
    ideas: (raw.ideas || []).map((x) => ({ ...x, id: x.id || uid('idea') })),
    settings: { cfg: raw.scenarioCfg || {}, month: (raw.cycleStartDate || currentMonth()).slice(0, 7) },
  };
}

export function downloadFile(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function taskHtml(t, n) {
  const d = dayInfo(t.dateStr);
  return `<div style="margin:0 0 22px;padding:0 0 16px;border-bottom:1px solid #d8d4e6">
  <p style="font-size:11px;font-weight:bold;color:#c2410c;margin:0">${n ? `Entregable #${n} · ` : ''}Código ${t.taskCode} · ${esc(t.status)}</p>
  <h2 style="font-size:17px;margin:4px 0 6px;color:#16122a">${esc(t.title)}</h2>
  <p style="font-size:13px;margin:3px 0"><b>Fecha:</b> Semana ${d.week} · ${d.dayName} ${d.display}</p>
  ${t.copy ? `<p style="font-size:13px;margin:6px 0;padding:8px 10px;border-left:3px solid #ea580c;background:#f7f5fb;white-space:pre-wrap">${esc(t.copy)}</p>` : ''}
  ${t.topic ? `<p style="font-size:13px;margin:3px 0"><b>Nota:</b> ${esc(t.topic)}</p>` : ''}
  ${(t.links || []).length ? `<p style="font-size:13px;margin:3px 0"><b>Enlaces:</b> ${t.links.map((l) => `<a href="${esc(linkHref(l))}">${esc(l)}</a>`).join(' · ')}</p>` : ''}
  ${t.views > 0 ? `<p style="font-size:13px;margin:3px 0"><b>Alcance:</b> ${t.views} views</p>` : ''}
  ${(t.images || []).map((src, i) => `<img src="${esc(src)}" alt="Captura ${i + 1}" width="520" style="max-width:520px;display:block;margin:10px 0;border:1px solid #d8d4e6">`).join('')}
</div>`;
}

export function reportHtml(tasks, pts, monthName) {
  return `<h1 style="font-size:21px;color:#ea580c;margin:0 0 4px">Rootstock Ambassador Program · Evidencias de ${esc(monthName)}</h1>
<p style="font-size:13px;margin:0 0 20px">Puntos acumulados: <b>${pts} pts</b> · Exportado el ${new Date().toLocaleDateString('es-MX')}</p>
${tasks.map((t, i) => taskHtml(t, i + 1)).join('')}`;
}

export function downloadDoc(title, body) {
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(title)}</title></head><body style="font-family:Arial,sans-serif;color:#16122a">${body}</body></html>`;
  downloadFile(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.doc`, new Blob(['﻿', html], { type: 'application/msword' }));
}

export async function copyRich(html, plain) {
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([plain], { type: 'text/plain' }),
    })]);
    return true;
  } catch {
    const div = document.createElement('div');
    div.innerHTML = html; div.style.position = 'fixed'; div.style.left = '-9999px';
    document.body.appendChild(div);
    const r = document.createRange(); r.selectNodeContents(div);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    const ok = document.execCommand('copy');
    sel.removeAllRanges(); div.remove();
    return ok;
  }
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok;
  }
}
