import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_CFG } from './constants';
import { currentMonth, generateMonth } from './schedule';

const CACHE = 'agt_cache_v2';
const QUEUE = 'agt_queue_v2';
const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* lleno o bloqueado */ } };

const upsert = (list, items) => { const m = new Map(list.map((x) => [x.id, x])); items.forEach((x) => m.set(x.id, x)); return [...m.values()]; };

export function useTracker(adapter, { onAuthLost }) {
  const [data, setData] = useState(() => read(CACHE));
  const [sync, setSync] = useState('loading');
  const queue = useRef(read(QUEUE) || []);
  const busy = useRef(0);
  const settingsTimer = useRef(null);

  const mutate = (fn) => setData((d) => { const n = fn(d); write(CACHE, n); return n; });
  const saveQueue = () => write(QUEUE, queue.current);

  const exec = useCallback(async (fn, ...args) => {
    busy.current++; setSync('saving');
    try {
      await adapter[fn](...args);
      setSync(queue.current.length ? 'offline' : 'ok');
    } catch (e) {
      if (e.status === 401) onAuthLost();
      else { queue.current.push({ fn, args }); saveQueue(); setSync('offline'); }
    } finally { busy.current--; }
  }, [adapter, onAuthLost]);

  const flush = useCallback(async () => {
    while (queue.current.length) {
      const op = queue.current[0];
      try { await adapter[op.fn](...op.args); queue.current.shift(); saveQueue(); }
      catch (e) { if (e.status === 401) onAuthLost(); return false; }
    }
    return true;
  }, [adapter, onAuthLost]);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    if (!(await flush())) { setSync('offline'); return; }
    try {
      const d = await adapter.load();
      if (!d.settings && !d.tasks.length) {
        // Primer uso: arranca con la parrilla del mes actual
        const settings = { cfg: DEFAULT_CFG, month: currentMonth() };
        const tasks = generateMonth(settings.month, settings.cfg);
        d.settings = settings; d.tasks = tasks;
        exec('saveSettings', settings); exec('replaceMonth', settings.month, tasks);
      }
      if (busy.current || queue.current.length) return;
      const next = { tasks: d.tasks, ideas: d.ideas || [], settings: { cfg: { ...DEFAULT_CFG, ...(d.settings?.cfg || {}) }, month: d.settings?.month || currentMonth() } };
      setData(next); write(CACHE, next); setSync('ok');
    } catch (e) {
      if (e.status === 401) onAuthLost();
      else setSync('offline');
    }
  }, [adapter, exec, flush, onAuthLost]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    const onVis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('online', refresh);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); window.removeEventListener('online', refresh); };
  }, [refresh]);

  const actions = {
    saveTasks: (list) => {
      const stamped = list.map((t) => ({ ...t, updatedAt: Date.now() }));
      mutate((d) => ({ ...d, tasks: upsert(d.tasks, stamped) }));
      exec('saveTasks', stamped);
    },
    deleteTask: (id) => { mutate((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })); exec('deleteTask', id); },
    replaceMonth: (month, tasks) => {
      mutate((d) => ({ ...d, tasks: [...d.tasks.filter((t) => !t.dateStr.startsWith(month)), ...tasks] }));
      exec('replaceMonth', month, tasks);
    },
    saveIdea: (idea) => { mutate((d) => ({ ...d, ideas: upsert(d.ideas, [idea]) })); exec('saveIdea', idea); },
    deleteIdea: (id) => { mutate((d) => ({ ...d, ideas: d.ideas.filter((i) => i.id !== id) })); exec('deleteIdea', id); },
    setSettings: (patch, { immediate } = {}) => {
      let next;
      mutate((d) => { next = { ...d.settings, ...patch }; return { ...d, settings: next }; });
      clearTimeout(settingsTimer.current);
      settingsTimer.current = setTimeout(() => exec('saveSettings', next), immediate ? 0 : 700);
    },
    importAll: async (payload) => {
      const next = { tasks: payload.tasks, ideas: payload.ideas, settings: payload.settings };
      setData(next); write(CACHE, next);
      await exec('importAll', payload);
    },
    upload: async (dataUrl) => { try { return await adapter.upload(dataUrl); } catch { return dataUrl; } },
    removeImage: (url) => { if (!url.startsWith('data:')) adapter.removeImage(url).catch(() => {}); },
    oembed: (url) => adapter.oembed(url),
    refresh,
  };

  return { data, sync, actions };
}
