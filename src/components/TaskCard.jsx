import { Trash2, Pencil, Copy, ExternalLink, Camera, CheckCircle2, Send, MessageSquare } from 'lucide-react';
import { STATUSES, TASK_BY_CODE, catOf } from '../lib/constants';
import { dayInfo, todayIso, hasImages } from '../lib/schedule';
import { Stamp } from './ui';

const href = (l) => (l.startsWith('http') ? l : `https://${l}`);

export default function TaskCard({ t, onEdit, onDelete, onStatus, onToggle, onCopy }) {
  const info = dayInfo(t.dateStr);
  const cat = catOf(t.taskCode);
  const comm = t.taskCode === '02';
  const pct = t.requiresViews ? Math.min(100, ((t.views || 0) / (t.targetViews || 300)) * 100) : 0;
  return (
    <article className={`card ${t.dateStr === todayIso() ? 'is-today' : ''} ${t.status === 'Completado' || t.status === 'Brandchamp' ? 'is-done' : ''}`} data-cat={cat}>
      <div className="card-top">
        <span className="date-chip">S{info.week} · {info.dayName} {info.display}</span>
        <span className="pts num">+{comm ? (t.tgPlanned !== false) + (t.dcPlanned !== false) : t.points}</span>
      </div>
      <div className="card-title-row">
        <h4 className="card-title">{t.title}</h4>
        <Stamp status={t.status} />
      </div>
      <div className="card-type"><b>{t.taskCode}</b> {TASK_BY_CODE[t.taskCode]?.name}</div>

      {t.topic && <p className="card-topic">{t.topic}</p>}

      {t.copy && (
        <div className="copybox">
          <div className="copybox-head"><span>Copy</span>
            <button type="button" className="chip-btn" onClick={() => onCopy(t.copy)}><Copy size={12} /> Copiar</button>
          </div>
          <p>{t.copy}</p>
        </div>
      )}

      {(t.links || []).length > 0 && (
        <div className="links">
          {t.links.map((l, i) => <a key={i} href={href(l)} target="_blank" rel="noreferrer"><ExternalLink size={12} /><span>{l}</span></a>)}
        </div>
      )}

      {comm ? (
        <div className="comm">
          <button type="button" className={`comm-btn tg ${t.telegramChecked ? 'on' : ''}`} disabled={t.tgPlanned === false && !t.telegramChecked}
            onClick={() => onToggle(t, 'telegramChecked')} aria-pressed={!!t.telegramChecked}>
            <Send size={14} /> Telegram <b>{t.telegramChecked ? '+1 ✓' : '+1'}</b>
          </button>
          <button type="button" className={`comm-btn dc ${t.discordChecked ? 'on' : ''}`} disabled={t.dcPlanned === false && !t.discordChecked}
            onClick={() => onToggle(t, 'discordChecked')} aria-pressed={!!t.discordChecked}>
            <MessageSquare size={14} /> Discord <b>{t.discordChecked ? '+1 ✓' : '+1'}</b>
          </button>
        </div>
      ) : (
        <div className={`evidence ${hasImages(t) ? 'ok' : 'missing'}`}>
          {hasImages(t) ? <><CheckCircle2 size={15} /> {t.images.length} captura{t.images.length > 1 ? 's' : ''} adjunta{t.images.length > 1 ? 's' : ''}</> : <><Camera size={15} /> Falta captura de evidencia</>}
        </div>
      )}

      {t.requiresViews && (
        <div className="views">
          <div className="views-row"><span>Views en 1 semana</span><b className="num">{t.views || 0} / {t.targetViews || 300}</b></div>
          <div className="bar" data-tone={pct >= 100 ? 'ok' : 'warn'}><i style={{ width: `${pct}%` }} /></div>
        </div>
      )}

      <div className="card-foot">
        <button type="button" className="icon-btn danger-ghost" onClick={() => onDelete(t)} aria-label="Eliminar tarea"><Trash2 size={15} /></button>
        <select id={`st_${t.id}`} className="select sm" value={t.status} onChange={(e) => onStatus(t, e.target.value)} aria-label="Estado">
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button type="button" className="btn primary sm" onClick={() => onEdit(t)}><Pencil size={13} /> Editar</button>
      </div>
    </article>
  );
}
