import { useEffect, useRef, useState } from 'react';
import { Clock, Send, Check, Star, X } from 'lucide-react';
import { CATS, TASK_BY_CODE, catOf } from '../lib/constants';

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function CountUp({ value, duration = 700 }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced()) { setShown(value); from.current = value; return; }
    const start = performance.now(); const a = from.current; let raf;
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(a + (value - a) * eased));
      if (p < 1) raf = requestAnimationFrame(step); else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value, duration]);
  return <span className="num">{shown.toLocaleString('es-MX')}</span>;
}

const STAMP = {
  Programado: { icon: Clock, cls: 'st-plan', text: 'Programado' },
  Publicado: { icon: Send, cls: 'st-pub', text: 'Publicado' },
  Completado: { icon: Check, cls: 'st-done', text: 'Hecho' },
  Brandchamp: { icon: Star, cls: 'st-brand', text: 'Subido' },
};
export function Stamp({ status, small }) {
  const s = STAMP[status] || STAMP.Programado;
  const Icon = s.icon;
  return (
    <span key={status} className={`stamp ${s.cls} ${small ? 'stamp-sm' : ''}`} title={status}>
      <Icon size={small ? 11 : 13} strokeWidth={3} />{s.text}
    </span>
  );
}

export function CatChip({ code, withName = true }) {
  const t = TASK_BY_CODE[code];
  const cat = catOf(code);
  return (
    <span className="catchip" data-cat={cat}>
      <b>{code}</b>{withName && <span>{t?.name || CATS[cat].name}</span>}
    </span>
  );
}

export function Modal({ title, eyebrow, cat, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('modal-open'); };
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} data-cat={cat} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-head">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h3>{title}</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Confirm({ title, text, confirmLabel = 'Sí, eliminar', danger = true, onConfirm, onClose }) {
  return (
    <Modal title={title} onClose={onClose} footer={<>
      <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
      <button type="button" className={`btn ${danger ? 'danger' : 'primary'}`} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</button>
    </>}>
      <p className="muted">{text}</p>
    </Modal>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast" role="status" key={msg.id}>{msg.text}</div>;
}

export function Bar({ value, max, cat, tone }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <div className="bar" data-cat={cat} data-tone={tone}><i style={{ width: `${pct}%` }} /></div>;
}

export function Confetti({ fire }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!fire || reduced()) return;
    const c = ref.current; const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const colors = Object.keys(CATS).map((k) => css.getPropertyValue(`--c-${k}`).trim()).filter(Boolean);
    const parts = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.3,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 14 - 4,
      w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4, color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const start = performance.now(); let raf;
    const tick = (now) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += 0.4; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= 0.99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (now - start < 2600) raf = requestAnimationFrame(tick); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire]);
  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}

export function Field({ label, hint, children, id }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}{hint && <em>{hint}</em>}</span>
      {children}
    </label>
  );
}
