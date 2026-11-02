import { generateMonth, currentMonth, dayInfo, todayIso } from './schedule';
import { DEFAULT_CFG } from './constants';

export const IS_DEMO = import.meta.env.MODE === 'demo';

async function call(path, { method = 'GET', body } = {}) {
  const r = await fetch(path, {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(data.error || `Error ${r.status}`); e.status = r.status; throw e; }
  return data;
}

export function remoteAdapter() {
  return {
    session: () => call('/api/session'),
    setup: (password) => call('/api/setup', { method: 'POST', body: { password } }),
    login: (password) => call('/api/login', { method: 'POST', body: { password } }),
    logout: () => call('/api/logout', { method: 'POST' }),
    load: () => call('/api/data'),
    saveTasks: (tasks) => call('/api/tasks', { method: 'PUT', body: { tasks } }),
    deleteTask: (id) => call(`/api/tasks?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    replaceMonth: (month, tasks) => call('/api/tasks', { method: 'PUT', body: { month, tasks } }),
    saveIdea: (idea) => call('/api/ideas', { method: 'PUT', body: { idea } }),
    deleteIdea: (id) => call(`/api/ideas?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
    saveSettings: (settings) => call('/api/settings', { method: 'PUT', body: { settings } }),
    importAll: (payload) => call('/api/import', { method: 'POST', body: payload }),
    upload: (dataUrl) => call('/api/upload', { method: 'POST', body: { dataUrl } }).then((r) => r.url),
    removeImage: (url) => call('/api/upload', { method: 'DELETE', body: { url } }),
    oembed: (url) => call(`/api/oembed?url=${encodeURIComponent(url)}`),
  };
}

// Modo vista previa: datos de ejemplo guardados solo en este navegador.
const DEMO_KEY = 'agt_demo_v2';
function demoSeed() {
  const month = currentMonth();
  const today = todayIso();
  const tasks = generateMonth(month, DEFAULT_CFG).map((t) => {
    if (t.dateStr >= today) return t;
    if (t.taskCode === '02') return { ...t, telegramChecked: true, discordChecked: dayInfo(t.dateStr).dow !== 5, status: 'Completado', points: 2 };
    const done = { ...t, status: t.taskCode === '04' ? 'Brandchamp' : 'Completado', links: ['https://x.com/ejemplo/status/1'], views: t.requiresViews ? 340 : 0 };
    return t.taskCode === '05' ? { ...t, status: 'Publicado', links: ['https://youtube.com/ejemplo'], views: 180 } : done;
  });
  tasks.forEach((t) => { if (t.taskCode === '04' && t.status !== 'Programado') t.topic = 'Ejemplo: merge-mining y seguridad heredada de Bitcoin'; });
  return {
    tasks, settings: { cfg: DEFAULT_CFG, month },
    ideas: [{ id: 'idea_demo', title: 'Ejemplo: ¿Cómo funciona el merge-mining en Rootstock?', description: 'Cómo los mineros de Bitcoin aseguran Rootstock sin energía adicional. Proof of Proof y seguridad heredada de L1.', links: ['https://dev.rootstock.io/concepts/merge-mining/'], createdAt: today }],
  };
}

export function demoAdapter() {
  let db;
  try { db = JSON.parse(localStorage.getItem(DEMO_KEY)); } catch { db = null; }
  if (!db) db = demoSeed();
  const save = () => { try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); } catch { /* sin almacenamiento */ } };
  const upsert = (list, items) => { const m = new Map(list.map((x) => [x.id, x])); items.forEach((x) => m.set(x.id, x)); return [...m.values()]; };
  const ok = async () => ({ ok: true });
  return {
    session: async () => ({ ok: true }),
    setup: ok, login: ok, logout: ok,
    load: async () => JSON.parse(JSON.stringify(db)),
    saveTasks: async (tasks) => { db.tasks = upsert(db.tasks, tasks); save(); },
    deleteTask: async (id) => { db.tasks = db.tasks.filter((t) => t.id !== id); save(); },
    replaceMonth: async (month, tasks) => { db.tasks = [...db.tasks.filter((t) => !t.dateStr.startsWith(month)), ...tasks]; save(); },
    saveIdea: async (idea) => { db.ideas = upsert(db.ideas, [idea]); save(); },
    deleteIdea: async (id) => { db.ideas = db.ideas.filter((i) => i.id !== id); save(); },
    saveSettings: async (s) => { db.settings = s; save(); },
    importAll: async (p) => { db = { tasks: p.tasks || [], ideas: p.ideas || [], settings: p.settings || db.settings }; save(); },
    upload: async (dataUrl) => dataUrl,
    removeImage: ok,
    oembed: async () => { throw new Error('El escaneo de X funciona en la versión publicada en Vercel.'); },
  };
}
