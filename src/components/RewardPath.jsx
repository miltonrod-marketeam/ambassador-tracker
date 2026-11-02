import { TIERS, tierFor } from '../lib/constants';

const pos = (pts) => Math.min(100, (pts / 1000) * 100);

export default function RewardPath({ real, projected }) {
  const current = tierFor(real);
  const next = TIERS.find((t) => t.min > real);
  return (
    <div className="path">
      <div className="path-track">
        <div className="path-proj" style={{ width: `${pos(projected)}%` }} />
        <div className="path-fill" style={{ width: `${pos(real)}%` }} />
        {TIERS.slice(1).map((t, i) => (
          <div key={t.min} className={`path-stop ${real >= t.min ? 'reached' : ''}`} style={{ left: `${pos(t.min)}%` }} data-i={i}>
            <span className="path-dot" />
            <span className="path-reward">${t.reward.toLocaleString('en-US')}</span>
            <span className="path-pts">{t.min}{t.min === 1000 ? '+' : ''}</span>
          </div>
        ))}
        <div className="path-me" style={{ left: `${pos(real)}%` }} title={`${real} pts reales`}><span>Tú</span></div>
        {projected > real && <div className="path-ghost" style={{ left: `${pos(projected)}%` }} title={`${projected} pts proyectados`} />}
      </div>
      <p className="path-note">
        {next
          ? <>Te faltan <b>{next.min - real} pts</b> para el siguiente nivel de <b>${next.reward.toLocaleString('en-US')}</b>.{current.reward ? <> Ya aseguraste ${current.reward.toLocaleString('en-US')}.</> : null}</>
          : <>Llegaste al nivel máximo: <b>$1,300 USD</b> este mes.</>}
      </p>
    </div>
  );
}
