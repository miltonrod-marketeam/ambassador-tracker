import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import { catOf } from '../lib/constants';
import { DAY_SHORT, dayInfo, monthDays, monthLabel, shiftMonth, todayIso, earned, projected, hasImages } from '../lib/schedule';
import { Stamp } from '../components/ui';

function DayTasks({ tasks, onOpen }) {
  return tasks.map((t) => (
    <button key={t.id} type="button" className={`mini ${t.status === 'Completado' ? 'done' : ''}`}
      data-cat={catOf(t.taskCode)} data-status={t.status} onClick={(e) => { e.stopPropagation(); onOpen(t); }} title={t.title}>
      <span className="mini-t">{t.taskCode === '02' ? 'TG + Discord' : t.title}</span>
      {t.taskCode !== '02' && !hasImages(t) && <AlertTriangle size={11} className="warn-ic" aria-label="Falta captura" />}
    </button>
  ));
}

export default function Calendar({ tasks, month, onMonth, onOpen, onAdd, onDay }) {
  const days = monthDays(month);
  const lead = dayInfo(days[0]).dow;
  const today = todayIso();
  const byDay = (d) => tasks.filter((t) => t.dateStr === d);
  const weeks = {};
  days.forEach((d) => { const w = dayInfo(d).week; (weeks[w] = weeks[w] || []).push(d); });

  return (
    <section className="cal">
      <div className="cal-head panel">
        <button type="button" className="icon-btn" onClick={() => onMonth(shiftMonth(month, -1))} aria-label="Mes anterior"><ChevronLeft /></button>
        <h3 className="cal-title">{monthLabel(month)}</h3>
        <button type="button" className="icon-btn" onClick={() => onMonth(shiftMonth(month, 1))} aria-label="Mes siguiente"><ChevronRight /></button>
        <button type="button" className="btn primary sm push" onClick={() => onAdd()}><Plus size={15} /> Tarea extra</button>
      </div>

      <div className="cal-grid">
        {DAY_SHORT.map((d, i) => <div key={d} className={`cal-dow ${i === 0 || i === 6 ? 'wk' : ''}`}>{d}</div>)}
        {Array.from({ length: lead }, (_, i) => <div key={`e${i}`} className="cal-empty" />)}
        {days.map((d) => {
          const list = byDay(d); const info = dayInfo(d);
          const proj = list.reduce((a, t) => a + projected(t), 0);
          const got = list.reduce((a, t) => a + earned(t), 0);
          const weekend = info.dow === 0 || info.dow === 6;
          return (
            <div key={d} className={`cal-cell ${d === today ? 'today' : ''} ${weekend ? 'weekend' : ''} ${proj && got >= proj ? 'full' : ''}`}
              onClick={() => (list.length ? onDay(d) : onAdd(d))} role="button" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') (list.length ? onDay(d) : onAdd(d)); }}>
              <div className="cal-top">
                <span className="cal-n">{info.day}</span>
                {proj > 0 && <span className="cal-pts num">{got}/{proj}</span>}
                {d === today && <span className="today-tag">Hoy</span>}
              </div>
              <div className="cal-list"><DayTasks tasks={list} onOpen={onOpen} /></div>
              <button type="button" className="cal-add" onClick={(e) => { e.stopPropagation(); onAdd(d); }} aria-label={`Agregar tarea el ${info.display}`}><Plus size={13} /></button>
            </div>
          );
        })}
      </div>

      <div className="agenda">
        {Object.entries(weeks).map(([w, list]) => (
          <div key={w} className="agenda-week">
            <h4>Semana {w}</h4>
            {list.map((d) => {
              const items = byDay(d); const info = dayInfo(d);
              if (!items.length && (info.dow === 0 || info.dow === 6)) return null;
              return (
                <div key={d} className={`agenda-day ${d === today ? 'today' : ''}`}>
                  <div className="agenda-date"><b>{info.day}</b><span>{DAY_SHORT[info.dow]}</span></div>
                  <div className="agenda-items">
                    {items.length ? items.map((t) => (
                      <button key={t.id} type="button" className="agenda-item" data-cat={catOf(t.taskCode)} data-status={t.status} onClick={() => onOpen(t)}>
                        <span>{t.taskCode === '02' ? 'Telegram + Discord' : t.title}</span>
                        <Stamp status={t.status} small />
                      </button>
                    )) : <button type="button" className="agenda-free" onClick={() => onAdd(d)}>Día libre · agregar</button>}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
