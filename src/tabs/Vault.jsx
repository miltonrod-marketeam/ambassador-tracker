import { FileText, Copy, Star, Eye } from 'lucide-react';
import { catOf } from '../lib/constants';
import { dayInfo } from '../lib/schedule';
import { Stamp } from '../components/ui';

export const vaultItems = (tasks) => tasks
  .filter((t) => t.taskCode !== '02' && ((t.links || []).length || (t.images || []).length || t.status === 'Completado' || t.status === 'Brandchamp'))
  .sort((a, b) => a.dateStr.localeCompare(b.dateStr));

export default function Vault({ tasks, onDocAll, onCopyAll, onDoc, onCopy, onUploaded }) {
  const items = vaultItems(tasks);
  const pending = items.filter((t) => t.status !== 'Brandchamp').length;
  return (
    <section className="stack">
      <div className="panel vault-head">
        <div>
          <h3 className="h3">Bóveda BrandChamp</h3>
          <p className="muted">{items.length} entregables con evidencia este mes · {pending} por subir a BrandChamp.</p>
        </div>
        <div className="row-wrap">
          <button type="button" className="btn primary" onClick={onDocAll} disabled={!items.length}><FileText size={15} /> Descargar reporte .doc</button>
          <button type="button" className="btn ghost" onClick={onCopyAll} disabled={!items.length}><Copy size={15} /> Copiar para Google Docs</button>
        </div>
      </div>
      {items.length ? (
        <div className="vault">
          {items.map((t) => {
            const info = dayInfo(t.dateStr);
            return (
              <article key={t.id} className="vault-item" data-cat={catOf(t.taskCode)}>
                <div className="card-top">
                  <span className="date-chip">{t.taskCode} · S{info.week} · {info.display}</span>
                  <Stamp status={t.status} small />
                </div>
                <h4 className="card-title">{t.title}</h4>
                {t.topic && <p className="card-topic">{t.topic}</p>}
                {t.views > 0 && <p className="small"><Eye size={13} /> {t.views} views</p>}
                {(t.links || []).map((l, i) => <a key={i} className="vault-link" href={l} target="_blank" rel="noreferrer">{l}</a>)}
                {(t.images || []).length > 0 && (
                  <div className="thumbs">{t.images.map((src, i) => <img key={i} src={src} alt={`Captura ${i + 1} de ${t.title}`} loading="lazy" />)}</div>
                )}
                <div className="card-foot">
                  <button type="button" className="btn ghost sm" onClick={() => onDoc(t)}><FileText size={13} /> .doc</button>
                  <button type="button" className="btn ghost sm" onClick={() => onCopy(t)}><Copy size={13} /> Copiar</button>
                  <button type="button" className={`btn sm ${t.status === 'Brandchamp' ? 'brand' : 'primary'}`} onClick={() => onUploaded(t)}>
                    <Star size={13} /> {t.status === 'Brandchamp' ? 'Subido' : 'Marcar subido'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : <div className="empty panel"><p>Cuando una tarea tenga enlace, captura o esté completada, aparece aquí lista para exportar.</p></div>}
    </section>
  );
}
