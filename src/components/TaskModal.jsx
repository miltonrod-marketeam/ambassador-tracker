import { useRef, useState } from 'react';
import { Camera, Trash2, Search, FileText, Copy, Loader2 } from 'lucide-react';
import { TASKS, TASK_BY_CODE, STATUSES, catOf } from '../lib/constants';
import { autoStatus, dayInfo, viewsInfo } from '../lib/schedule';
import { compressImage } from '../lib/files';
import { Modal, Field } from './ui';

export default function TaskModal({ task, isNew, actions, onSave, onDelete, onDoc, onCopy, notify }) {
  const [d, setD] = useState({ ...task, linksText: (task.links || []).join('\n') });
  const [uploading, setUploading] = useState(0);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef(null);
  const set = (patch) => setD((p) => ({ ...p, ...patch }));
  const def = TASK_BY_CODE[d.taskCode];
  const comm = d.taskCode === '02';
  const links = d.linksText.split('\n').map((l) => l.trim()).filter(Boolean);
  const xLink = links.find((l) => /(x|twitter)\.com\//i.test(l));

  const addFiles = async (files) => {
    const imgs = [...files].filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) return;
    setUploading((n) => n + imgs.length);
    for (const f of imgs) {
      const dataUrl = await compressImage(f);
      const url = await actions.upload(dataUrl);
      setD((p) => ({ ...p, images: [...(p.images || []), url] }));
      setUploading((n) => n - 1);
    }
    notify(`${imgs.length} captura${imgs.length > 1 ? 's' : ''} agregada${imgs.length > 1 ? 's' : ''}`);
  };

  const onPaste = (e) => {
    const files = [...(e.clipboardData?.items || [])].filter((i) => i.type.startsWith('image/')).map((i) => i.getAsFile()).filter(Boolean);
    if (files.length) { e.preventDefault(); addFiles(files); }
  };

  const scan = async () => {
    setScanning(true);
    try {
      const r = await actions.oembed(xLink);
      set({ xAuthor: r.author, xText: r.text, copy: d.copy || r.text });
      notify(`Post de ${r.author || 'X'} escaneado`);
    } catch (e) { notify(e.message); }
    setScanning(false);
  };

  const final = () => {
    const { linksText, ...rest } = d;
    return autoStatus({ ...rest, links, points: comm ? rest.points : Number(rest.points) || 0 }, isNew ? null : task);
  };

  const info = d.dateStr ? dayInfo(d.dateStr) : null;
  const vi = viewsInfo(d);

  return (
    <Modal wide cat={catOf(d.taskCode)} eyebrow={isNew ? 'Nueva tarea' : `${d.taskCode} · ${info ? `Semana ${info.week}, ${info.dayName}` : ''}`}
      title={isNew ? 'Agregar tarea al calendario' : d.title} onClose={() => onSave(null)}
      footer={<>
        {!isNew && <button type="button" className="btn danger-ghost" onClick={() => onDelete(task)}><Trash2 size={15} /> Eliminar</button>}
        {!isNew && <button type="button" className="btn ghost" onClick={() => onDoc(final())}><FileText size={15} /> .doc</button>}
        {!isNew && <button type="button" className="btn ghost" onClick={() => onCopy(final())}><Copy size={15} /> Copiar y abrir Google Docs</button>}
        <span className="push" />
        <button type="button" className="btn ghost" onClick={() => onSave(null)}>Cancelar</button>
        <button type="button" className="btn primary" disabled={uploading > 0} onClick={() => onSave(final())}>{isNew ? 'Crear tarea' : 'Guardar cambios'}</button>
      </>}>
      <div className="form" onPaste={onPaste}>
        <div className="grid2">
          <Field label="Categoría" id="m_code">
            <select id="m_code" className="select" value={d.taskCode} onChange={(e) => {
              const n = TASK_BY_CODE[e.target.value];
              const autoTitle = !d.title || TASKS.some((t) => d.title.startsWith(t.short));
              set({ taskCode: n.code, points: n.code === '02' ? 0 : n.points, requiresViews: n.views, targetViews: n.views ? 300 : 0, title: autoTitle ? n.short : d.title, tgPlanned: true, dcPlanned: true });
            }}>
              {TASKS.map((t) => <option key={t.code} value={t.code}>{t.code} · {t.name} ({t.points} pts)</option>)}
            </select>
          </Field>
          <Field label="Título" id="m_title">
            <input id="m_title" className="input" value={d.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="Fecha" id="m_date">
            <input id="m_date" type="date" className="input" value={d.dateStr} onChange={(e) => set({ dateStr: e.target.value })} />
          </Field>
          <div className="grid2 tight">
            <Field label="Estado" id="m_status">
              <select id="m_status" className="select" value={d.status} onChange={(e) => set({ status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            {!comm && (
              <Field label="Puntos" id="m_pts">
                <input id="m_pts" type="number" min="0" max="500" className="input num" value={d.points} onChange={(e) => set({ points: e.target.value })} />
              </Field>
            )}
          </div>
        </div>

        {comm ? (
          <div className="comm">
            <button type="button" className={`comm-btn tg ${d.telegramChecked ? 'on' : ''}`} onClick={() => set({ telegramChecked: !d.telegramChecked })} aria-pressed={!!d.telegramChecked}>Telegram <b>{d.telegramChecked ? '+1 ✓' : '+1'}</b></button>
            <button type="button" className={`comm-btn dc ${d.discordChecked ? 'on' : ''}`} onClick={() => set({ discordChecked: !d.discordChecked })} aria-pressed={!!d.discordChecked}>Discord <b>{d.discordChecked ? '+1 ✓' : '+1'}</b></button>
          </div>
        ) : (
          <>
            <Field label="Enlaces de evidencia" hint="uno por línea" id="m_links">
              <textarea id="m_links" rows={3} className="input mono" value={d.linksText} placeholder="https://x.com/MiltonRodM/status/…"
                onChange={(e) => set({ linksText: e.target.value })} />
            </Field>
            {xLink && (
              <button type="button" className="btn ghost sm self-start" onClick={scan} disabled={scanning}>
                {scanning ? <Loader2 size={14} className="spin" /> : <Search size={14} />} Traer texto del post de X
              </button>
            )}
            {d.xText && <blockquote className="xquote"><b>@{d.xAuthor}</b> {d.xText}</blockquote>}
          </>
        )}

        <Field label="Copy de la publicación" id="m_copy">
          <textarea id="m_copy" rows={4} className="input" value={d.copy || ''} placeholder="Redacta o pega el texto que vas a publicar"
            onChange={(e) => set({ copy: e.target.value })} />
        </Field>
        <Field label="Tema o nota" id="m_topic">
          <input id="m_topic" className="input" value={d.topic || ''} onChange={(e) => set({ topic: e.target.value })} />
        </Field>

        {vi?.risk && (
          <div className="views-warn" role="alert">
            <b>{vi.risk === 'late' ? 'La semana de views se pasa del mes.' : 'Queda sin colchón para la captura.'}</b>
            <span> Publicada el {dayInfo(d.dateStr).display}, llega a la meta el {dayInfo(vi.due).display} y el mes cierra el {dayInfo(vi.last).display}. Prográmala a más tardar el {dayInfo(vi.latest).display}.</span>
            <button type="button" className="chip-btn" onClick={() => set({ dateStr: vi.latest })}>Mover al {dayInfo(vi.latest).display}</button>
          </div>
        )}
        {d.requiresViews && (
          <Field label="Views acumuladas" hint={`meta ${d.targetViews || 300} en 1 semana`} id="m_views">
            <input id="m_views" type="number" min="0" className="input num" value={d.views || 0} onChange={(e) => set({ views: Number(e.target.value) })} />
          </Field>
        )}

        {!comm && (
          <div className="drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
            <div className="drop-head">
              <div>
                <b>Capturas de evidencia</b>
                <p className="small muted">Arrástralas aquí, pégalas con Ctrl+V o súbelas.</p>
              </div>
              <button type="button" className="btn ghost sm" onClick={() => fileRef.current?.click()}><Camera size={14} /> Subir fotos</button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
            </div>
            {((d.images || []).length > 0 || uploading > 0) && (
              <div className="thumbs editable">
                {(d.images || []).map((src, i) => (
                  <figure key={src + i}>
                    <img src={src} alt={`Captura ${i + 1}`} />
                    <button type="button" className="thumb-del" aria-label="Quitar captura" onClick={() => {
                      actions.removeImage(src);
                      set({ images: d.images.filter((_, k) => k !== i) });
                    }}><Trash2 size={13} /></button>
                  </figure>
                ))}
                {Array.from({ length: uploading }, (_, i) => <figure key={`u${i}`} className="uploading"><Loader2 className="spin" /></figure>)}
              </div>
            )}
          </div>
        )}
        {isNew && def && <p className="small muted">Se suma 1 al contador de “{def.name}” en el Planificador.</p>}
      </div>
    </Modal>
  );
}
