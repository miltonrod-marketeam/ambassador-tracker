import { useState } from 'react';
import { Check } from 'lucide-react';
import { dayInfo } from '../lib/schedule';

const TARGET = ['04', '05', '06', '10', '11'];

export default function Topics({ tasks, onAssign }) {
  const [raw, setRaw] = useState('');
  const lines = raw.split('\n').map((l) => l.replace(/^\s*\d+[.)-]\s*/, '').trim()).filter(Boolean);
  const free = tasks.filter((t) => TARGET.includes(t.taskCode) && !t.topic).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  return (
    <section className="topics panel">
      <div>
        <h3 className="h3">Cargar temas a la parrilla</h3>
        <p className="muted">Pega un tema por línea. Se asignan en orden de fecha a los posts, videos y eventos online del mes que todavía no tienen tema.</p>
      </div>
      <textarea id="topics_raw" rows={9} className="input mono" value={raw} onChange={(e) => setRaw(e.target.value)}
        placeholder={'1. Seguridad de Bitcoin L2 explicada sin tecnicismos\n2. Tutorial: tu primer préstamo en DOC paso a paso'} />
      <div className="row-wrap between">
        <span className="small">{lines.length} temas detectados · {free.length} lugares libres</span>
        <button type="button" className="btn primary" disabled={!lines.length || !free.length} onClick={() => {
          const updated = free.slice(0, lines.length).map((t, i) => ({ ...t, topic: lines[i] }));
          onAssign(updated); setRaw('');
        }}><Check size={15} /> Asignar temas</button>
      </div>
      {free.length > 0 && (
        <div className="slots">
          <h4 className="panel-title">Siguientes lugares libres</h4>
          <ol>
            {free.slice(0, Math.max(lines.length, 6)).map((t, i) => (
              <li key={t.id} data-cat="social"><span className="num">{dayInfo(t.dateStr).display}</span> {t.title}{lines[i] && <em>→ {lines[i]}</em>}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
