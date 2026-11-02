import { useMemo, useState } from 'react';
import { Plus, Search, Copy, Pencil, Trash2, ExternalLink, Lightbulb } from 'lucide-react';

const COLORS = ['social', 'community', 'governance', 'video', 'institutional', 'events', 'growth', 'special'];

export default function Ideas({ ideas, onNew, onEdit, onDelete, onCopy }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const sorted = [...ideas].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    if (!s) return sorted;
    return sorted.filter((i) => [i.title, i.description, ...(i.links || [])].some((x) => (x || '').toLowerCase().includes(s)));
  }, [ideas, q]);

  return (
    <section className="stack">
      <div className="panel filters">
        <div className="filter-row">
          <div className="search">
            <Search size={16} />
            <input id="idea_q" type="search" placeholder="Buscar en ideas, notas o enlaces" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <span className="muted small">{list.length} ideas</span>
          <button type="button" className="btn primary sm push" onClick={onNew}><Plus size={15} /> Nueva idea</button>
        </div>
      </div>
      {list.length ? (
        <div className="ideas">
          {list.map((idea, i) => (
            <article key={idea.id} className="idea" data-cat={COLORS[i % COLORS.length]}>
              <div className="idea-head">
                <Lightbulb size={18} />
                {idea.createdAt && <span className="date-chip">{idea.createdAt}</span>}
              </div>
              <h4>{idea.title}</h4>
              {idea.description && <p className="idea-desc">{idea.description}</p>}
              {(idea.links || []).length > 0 && (
                <div className="links">
                  {idea.links.map((l, k) => <a key={k} href={l.startsWith('http') ? l : `https://${l}`} target="_blank" rel="noreferrer"><ExternalLink size={12} /><span>{l}</span></a>)}
                </div>
              )}
              <div className="card-foot">
                <button type="button" className="icon-btn danger-ghost" onClick={() => onDelete(idea)} aria-label="Eliminar idea"><Trash2 size={15} /></button>
                <button type="button" className="btn ghost sm" onClick={() => onCopy(idea)}><Copy size={13} /> Copiar</button>
                <button type="button" className="btn primary sm" onClick={() => onEdit(idea)}><Pencil size={13} /> Editar</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty panel">
          <p>{q ? 'Ninguna idea coincide con la búsqueda.' : 'Todavía no tienes ideas guardadas. Anota la primera para desarrollarla después.'}</p>
          {!q && <button type="button" className="btn primary" onClick={onNew}><Plus size={15} /> Agregar idea</button>}
        </div>
      )}
    </section>
  );
}
