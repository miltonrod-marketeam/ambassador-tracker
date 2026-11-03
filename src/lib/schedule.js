import { TASK_BY_CODE } from './constants';

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const pad = (n) => String(n).padStart(2, '0');

export const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
export const currentMonth = () => todayIso().slice(0, 7);
export const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const uid = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export function dayInfo(s) {
  const dt = parseDate(s);
  const first = new Date(dt.getFullYear(), dt.getMonth(), 1).getDay();
  return {
    dow: dt.getDay(), day: dt.getDate(), dayName: DAY_NAMES[dt.getDay()],
    week: Math.floor((dt.getDate() - 1 + first) / 7) + 1, // admite meses de 6 semanas
    display: `${dt.getDate()} ${MONTHS[dt.getMonth()].slice(0, 3)}`,
  };
}

export function monthDays(month) {
  const [y, m] = month.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  return Array.from({ length: total }, (_, i) => `${y}-${pad(m)}-${pad(i + 1)}`);
}
export const monthLabel = (month) => { const [y, m] = month.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
export const shiftMonth = (month, delta) => { const [y, m] = month.split('-').map(Number); const d = new Date(y, m - 1 + delta, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };

// Las tareas con views necesitan 1 semana para llegar a la meta, más 2 días de colchón
// para tomar la captura y subirla antes de que cierre el mes.
export const VIEWS_WEEK = 7;
export const VIEWS_MARGIN = 2;
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function addDays(s, n) { const d = parseDate(s); d.setDate(d.getDate() + n); return iso(d); }
export function viewsInfo(t) {
  if (!t.requiresViews || !t.dateStr) return null;
  const due = addDays(t.dateStr, VIEWS_WEEK);
  const [y, m] = t.dateStr.split('-').map(Number);
  const total = new Date(y, m, 0).getDate();
  const last = `${y}-${pad(m)}-${pad(total)}`;
  const latest = `${y}-${pad(m)}-${pad(total - VIEWS_WEEK - VIEWS_MARGIN)}`;
  const risk = due > last ? 'late' : t.dateStr > latest ? 'tight' : null;
  return { due, last, latest, risk };
}

export function newTask(code, dateStr, extra = {}) {
  const t = TASK_BY_CODE[code];
  const base = {
    id: uid('t'), dateStr, taskCode: code, title: t.short, topic: '', copy: '', links: [], images: [],
    views: 0, targetViews: t.views ? 300 : 0, requiresViews: t.views, status: 'Programado',
    points: t.points, updatedAt: Date.now(),
  };
  if (code === '02') Object.assign(base, { points: 0, tgPlanned: true, dcPlanned: true, telegramChecked: false, discordChecked: false });
  return { ...base, ...extra };
}

const ORDER = ['12', '11', '10', '05', '04', '06', '01', '03', '13', '14', '07', '08', '09', '15'];

export function generateMonth(month, cfg) {
  const days = monthDays(month);
  const work = days.filter((d) => { const w = dayInfo(d).dow; return w >= 1 && w <= 5; });
  const cutoff = days.length - VIEWS_WEEK - VIEWS_MARGIN; // views: 1 semana + 2 días de colchón antes de cerrar el mes
  const items = [];

  const tg = cfg.task02_tg || 0; const dc = cfg.task02_dc || 0;
  work.slice(0, Math.max(tg, dc)).forEach((d, i) => {
    items.push(newTask('02', d, { tgPlanned: i < tg, dcPlanned: i < dc }));
  });

  const load = {}; const codes = {};
  const can = (d, code, views, limit) =>
    (load[d] || 0) < limit && !(codes[d] || []).includes(code) && !(views && dayInfo(d).day > cutoff);

  ORDER.forEach((code) => {
    const t = TASK_BY_CODE[code];
    const n = cfg[t.cfg] || 0;
    const cand = work.filter((d) => t.pref.includes(dayInfo(d).dow));
    for (let i = 0; i < n; i++) {
      let chosen = null;
      const s1 = cand.length ? Math.floor((i * cand.length) / n) : 0;
      const s2 = Math.floor((i * work.length) / n);
      const order = [...cand.slice(s1), ...cand.slice(0, s1), ...work.slice(s2), ...work.slice(0, s2)];
      for (const limit of [2, 3, 6]) { chosen = order.find((d) => can(d, code, t.views, limit)); if (chosen) break; }
      if (!chosen) chosen = order.find((d) => !(t.views && dayInfo(d).day > cutoff)) || work[0];
      load[chosen] = (load[chosen] || 0) + 1;
      (codes[chosen] = codes[chosen] || []).push(code);
      items.push(newTask(code, chosen));
    }
  });
  // Numera cada tipo de tarea en orden de fecha
  const count = {};
  items.sort((a, b) => a.dateStr.localeCompare(b.dateStr)).forEach((it) => {
    if (it.taskCode === '02') return;
    count[it.taskCode] = (count[it.taskCode] || 0) + 1;
    it.title = `${TASK_BY_CODE[it.taskCode].short} #${count[it.taskCode]}`;
  });
  return items;
}

// Puntos
export const hasImages = (t) => (t.images || []).length > 0;
export function earned(t) {
  if (t.taskCode === '02') return (t.telegramChecked ? 1 : 0) + (t.discordChecked ? 1 : 0);
  return t.status === 'Completado' || t.status === 'Brandchamp' ? Number(t.points) || 0 : 0;
}
export function projected(t) {
  if (t.taskCode === '02') return (t.tgPlanned !== false ? 1 : 0) + (t.dcPlanned !== false ? 1 : 0);
  return Number(t.points) || 0;
}
export const isDone = (t) => t.status === 'Completado' || t.status === 'Brandchamp';

export function simTotal(cfg) {
  const by = {
    social: (cfg.task04 || 0) * 30 + (cfg.task06 || 0) * 35,
    community: (cfg.task01 || 0) * 10 + (cfg.task02_tg || 0) + (cfg.task02_dc || 0),
    governance: (cfg.task03 || 0) * 10,
    video: (cfg.task05 || 0) * 70,
    institutional: (cfg.task07 || 0) * 15 + (cfg.task08 || 0) * 10 + (cfg.task09 || 0) * 40 + (cfg.task10 || 0) * 35,
    events: (cfg.task11 || 0) * 60 + (cfg.task12 || 0) * 100,
    growth: (cfg.task13 || 0) * 80 + (cfg.task14 || 0) * 20,
    special: (cfg.task15 || 0) * 20,
  };
  return { by, total: Object.values(by).reduce((a, b) => a + b, 0) };
}

// Reglas de estado automáticas. Solo se recalculan cuando cambian views, links o tipo,
// así un cambio manual de estado no se pisa. Brandchamp siempre es manual.
export function autoStatus(t, prev) {
  if (t.status === 'Brandchamp') return t;
  if (t.taskCode === '02') {
    const pts = earned(t);
    return { ...t, points: pts, status: pts > 0 ? 'Completado' : 'Programado' };
  }
  const hasLinks = (t.links || []).length > 0;
  const changed = !prev || (t.views || 0) !== (prev.views || 0) || (t.links || []).join('|') !== (prev.links || []).join('|') || t.taskCode !== prev.taskCode;
  if (!changed) return t;
  let status = t.status;
  if (t.requiresViews) {
    if ((t.views || 0) >= (t.targetViews || 300)) status = 'Completado';
    else if (hasLinks) status = 'Publicado';
    else if (status === 'Completado') status = 'Programado';
  } else if (hasLinks && status === 'Programado') status = 'Completado';
  return { ...t, status };
}

export const linkHref = (l) => (/^https?:\/\//i.test(l) ? l : `https://${l}`);

export const goalReached = (t) => !!t.requiresViews && (t.views || 0) >= (t.targetViews || 300);
