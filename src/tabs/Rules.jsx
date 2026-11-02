import { RULES, TASK_BY_CODE, catOf } from '../lib/constants';

export default function Rules() {
  return (
    <section className="rules">
      {RULES.map((r) => (
        <article key={r.code} className="rule" data-cat={catOf(r.code)}>
          <div className="rule-head"><span className="code-tag">{r.code}</span><span className="rule-pts">{r.points}</span></div>
          <h4>{TASK_BY_CODE[r.code].name}</h4>
          <p><b>Requisito.</b> {r.req}</p>
          <p className="muted"><b>Evidencia.</b> {r.ev}</p>
        </article>
      ))}
    </section>
  );
}
