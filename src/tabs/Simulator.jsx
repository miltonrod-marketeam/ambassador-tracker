import { RotateCcw, Sparkles, Eraser } from 'lucide-react';
import { SLIDER_GROUPS, CATS, TIERS, CORE_CFG, catOf, tierFor } from '../lib/constants';
import { simTotal, monthLabel } from '../lib/schedule';
import { CountUp } from '../components/ui';

export default function Simulator({ cfg, month, onCfg, onGenerate, onZero }) {
  const { by, total } = simTotal(cfg);
  const tier = tierFor(total);
  const maxCat = Math.max(1, ...Object.values(by));
  return (
    <section className="sim">
      <div className="sim-sliders">
        {SLIDER_GROUPS.map((g) => (
          <div key={g.title} className="panel">
            <h4 className="panel-title">{g.title}</h4>
            <div className="sliders">
              {g.rows.map((r) => {
                const v = cfg[r.key] || 0;
                return (
                  <div key={r.key} className="slider-row" data-cat={g.cat}>
                    <div className="slider-info">
                      <span className="code-tag">{r.code}</span>
                      <div>
                        <div className="slider-label">{r.label}</div>
                        <div className="slider-hint">{r.hint}</div>
                      </div>
                    </div>
                    <div className="slider-ctrl">
                      <input id={`sl_${r.key}`} type="range" min="0" max={r.max} value={v}
                        style={{ '--p': `${(v / r.max) * 100}%` }}
                        aria-label={r.label}
                        onChange={(e) => onCfg({ ...cfg, [r.key]: Number(e.target.value) })} />
                      <span className="slider-n num">{v}</span>
                      <span className="slider-pts num">{v * r.pts} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="row-wrap">
          <button type="button" className="btn ghost" onClick={onZero}><Eraser size={15} /> Todo en cero</button>
          <button type="button" className="btn ghost" onClick={() => onCfg({ ...CORE_CFG })}><RotateCcw size={15} /> Solo mínimos</button>
        </div>
      </div>

      <aside className="sim-side">
        <div className="panel sim-total">
          <div className="eyebrow">Escenario simulado</div>
          <div className="big"><CountUp value={total} /><small>pts</small></div>
          <div className="sim-reward">{tier.reward ? `$${tier.reward.toLocaleString('en-US')} USD` : 'Sin premio todavía'}</div>
          <ol className="tier-list">
            {TIERS.map((t, i) => {
              const nextMin = TIERS[i + 1]?.min;
              const active = t === tier;
              return (
                <li key={t.min} className={active ? 'on' : total >= t.min ? 'past' : ''}>
                  <span className="num">{t.min}{nextMin ? `–${nextMin - 1}` : '+'}</span>
                  <b>{t.reward ? `$${t.reward.toLocaleString('en-US')}` : '—'}</b>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="panel">
          <h4 className="panel-title">Desglose por categoría</h4>
          <div className="breakdown">
            {Object.entries(by).map(([k, pts]) => (
              <div key={k} className="bd-row" data-cat={k}>
                <span className="bd-name"><i className="dot" />{CATS[k].label}</span>
                <span className="bd-bar"><i style={{ width: `${(pts / maxCat) * 100}%` }} /></span>
                <span className="bd-pts num">{pts}</span>
              </div>
            ))}
          </div>
          <p className="small muted">Tocas {Object.values(by).filter(Boolean).length} de 8 categorías.</p>
        </div>
        <div className="panel gen">
          <p>Distribuye este escenario en el calendario de <b>{monthLabel(month)}</b>. Solo reemplaza las tareas de ese mes.</p>
          <button type="button" className="btn primary big-btn" onClick={onGenerate}><Sparkles size={16} /> Generar parrilla del mes</button>
        </div>
      </aside>
    </section>
  );
}
