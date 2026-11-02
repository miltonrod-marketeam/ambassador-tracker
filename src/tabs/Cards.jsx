import { useMemo } from 'react';
import { Plus, X, Filter } from 'lucide-react';
import { TASKS, STATUSES, catOf } from '../lib/constants';
import { DAY_NAMES, dayInfo, earned, projected, isDone, hasImages } from '../lib/schedule';
import TaskCard from '../components/TaskCard';

export default function Cards({ tasks, filters, setFilters, onAdd, cardProps }) {
  const f = filters;
  const set = (patch) => setFilters({ ...f, ...patch });

  const stats = useMemo(() => TASKS.map((def) => {
    const list = tasks.filter((t) => t.taskCode === def.code);
    if (def.code === '02') {
      const planned = list.reduce((a, t) => a + projected(t), 0);
      const done = list.reduce((a, t) => a + earned(t), 0);
      return { def, planned, done, unit: 'checks' };
    }
    return { def, planned: list.length, done: list.filter((t) => isDone(t) || t.status === 'Publicado').length, unit: 'hechas' };
  }).filter((s) => s.planned || s.done), [tasks]);

  const weeks = [...new Set(tasks.map((t) => dayInfo(t.dateStr).week))].sort();

  const list = useMemo(() => tasks.filter((t) => {
    const info = dayInfo(t.dateStr);
    if (f.date && t.dateStr !== f.date) return false;
    if (f.week !== 'ALL' && info.week !== Number(f.week)) return false;
    if (f.day !== 'ALL' && info.dayName !== f.day) return false;
    if (f.code !== 'ALL' && t.taskCode !== f.code) return false;
    if (f.status !== 'ALL' && t.status !== f.status) return false;
    if (f.evidence === 'MISSING' && (t.taskCode === '02' || hasImages(t))) return false;
    if (f.evidence === 'ATTACHED' && t.taskCode !== '02' && !hasImages(t)) return false;
    return true;
  }).sort((a, b) => a.dateStr.localeCompare(b.dateStr)), [tasks, f]);

  const proj = list.reduce((a, t) => a + projected(t), 0);
  const got = list.reduce((a, t) => a + earned(t), 0);
  const active = f.date || f.week !== 'ALL' || f.day !== 'ALL' || f.code !== 'ALL' || f.status !== 'ALL' || f.evidence !== 'ALL';

  return (
    <section className="stack">
      <div className="counters">
        {stats.map(({ def, planned, done, unit }) => {
          const on = f.code === def.code;
          const full = planned > 0 && done >= planned;
          return (
            <button key={def.code} type="button" className={`counter ${on ? 'on' : ''} ${full ? 'full' : ''}`} data-cat={catOf(def.code)}
              onClick={() => set({ code: on ? 'ALL' : def.code })} aria-pressed={on}>
              <span className="counter-code">{def.code}</span>
              <span className="counter-name">{def.short}</span>
              <span className="counter-n num">{done}<small>/{planned}</small></span>
              <span className="counter-bar"><i style={{ width: `${planned ? Math.min(100, (done / planned) * 100) : 0}%` }} /></span>
              <span className="counter-unit">{full ? 'Completo' : `faltan ${Math.max(0, planned - done)} · ${unit}`}</span>
            </button>
          );
        })}
      </div>

      <div className="panel filters">
        <div className="filter-row">
          <Filter size={16} className="muted" />
          <div className="seg" role="group" aria-label="Semana">
            {['ALL', ...weeks].map((w) => (
              <button key={w} type="button" className={String(f.week) === String(w) ? 'on' : ''} onClick={() => set({ week: w, date: null })}>
                {w === 'ALL' ? 'Todas' : `S${w}`}
              </button>
            ))}
          </div>
          <select id="f_code" className="select" value={f.code} onChange={(e) => set({ code: e.target.value })} aria-label="Tarea">
            <option value="ALL">Todas las tareas</option>
            {TASKS.map((t) => <option key={t.code} value={t.code}>{t.code} · {t.name}</option>)}
          </select>
          <select id="f_status" className="select" value={f.status} onChange={(e) => set({ status: e.target.value })} aria-label="Estado">
            <option value="ALL">Todos los estados</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select id="f_ev" className="select" value={f.evidence} onChange={(e) => set({ evidence: e.target.value })} aria-label="Evidencia">
            <option value="ALL">Toda la evidencia</option>
            <option value="MISSING">Faltan capturas</option>
            <option value="ATTACHED">Con captura</option>
          </select>
          <select id="f_day" className="select" value={f.day} onChange={(e) => set({ day: e.target.value, date: null })} aria-label="Día">
            <option value="ALL">Todos los días</option>
            {DAY_NAMES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button type="button" className="btn primary sm push" onClick={() => onAdd()}><Plus size={15} /> Tarea extra</button>
        </div>
        <div className="filter-sum">
          {f.date && <span className="pill">Día {dayInfo(f.date).display}</span>}
          <span>{list.length} tareas · proyectados <b className="num">{proj}</b> · ganados <b className="num ok-t">{got}</b> pts</span>
          {active && <button type="button" className="chip-btn" onClick={() => setFilters({ week: 'ALL', day: 'ALL', code: 'ALL', status: 'ALL', evidence: 'ALL', date: null })}><X size={12} /> Quitar filtros</button>}
        </div>
      </div>

      {list.length ? (
        <div className="cards">{list.map((t) => <TaskCard key={t.id} t={t} {...cardProps} />)}</div>
      ) : (
        <div className="empty panel"><p>No hay tareas con estos filtros.</p><button type="button" className="btn primary" onClick={() => onAdd()}><Plus size={15} /> Agregar una</button></div>
      )}
    </section>
  );
}
