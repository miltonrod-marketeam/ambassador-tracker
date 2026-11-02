import { useState } from 'react';
import { Modal, Field } from './ui';
import { uid, todayIso } from '../lib/schedule';

export default function IdeaModal({ idea, onSave }) {
  const [d, setD] = useState({ title: idea?.title || '', description: idea?.description || '', linksText: (idea?.links || []).join('\n') });
  const save = () => {
    if (!d.title.trim()) return;
    onSave({
      ...(idea || { id: uid('idea'), createdAt: todayIso() }),
      title: d.title.trim(), description: d.description.trim(),
      links: d.linksText.split('\n').map((l) => l.trim()).filter(Boolean), updatedAt: todayIso(),
    });
  };
  return (
    <Modal cat="events" eyebrow="Banco de ideas" title={idea ? 'Editar idea' : 'Nueva idea'} onClose={() => onSave(null)}
      footer={<><button type="button" className="btn ghost" onClick={() => onSave(null)}>Cancelar</button><button type="button" className="btn primary" disabled={!d.title.trim()} onClick={save}>Guardar idea</button></>}>
      <div className="form">
        <Field label="Título o concepto" id="i_title"><input id="i_title" className="input" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Rootstock frente a otras L2 de Bitcoin" /></Field>
        <Field label="Notas y apuntes" id="i_desc"><textarea id="i_desc" rows={6} className="input" value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="Esquema, puntos clave, ángulo del post…" /></Field>
        <Field label="Enlaces de referencia" hint="uno por línea" id="i_links"><textarea id="i_links" rows={3} className="input mono" value={d.linksText} onChange={(e) => setD({ ...d, linksText: e.target.value })} /></Field>
      </div>
    </Modal>
  );
}
