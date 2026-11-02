import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Award, Moon, Sun, Download, Upload, LogOut, Cloud, CloudOff, Loader2, Sliders, CalendarDays, Layers, Lightbulb, ListPlus, ShieldCheck, BookOpen, Plus, Lock } from 'lucide-react';
import { IS_DEMO, remoteAdapter, demoAdapter } from './lib/api';
import { useTracker } from './lib/store';
import { TASK_BY_CODE, tierIndex } from './lib/constants';
import { generateMonth, newTask, earned, projected, monthLabel, todayIso, currentMonth } from './lib/schedule';
import { normalizeBackup, downloadFile, downloadDoc, taskHtml, reportHtml, copyRich, copyText } from './lib/files';
import { CountUp, Toast, Confirm, Confetti } from './components/ui';
import RewardPath from './components/RewardPath';
import TaskModal from './components/TaskModal';
import IdeaModal from './components/IdeaModal';
import Simulator from './tabs/Simulator';
import Calendar from './tabs/Calendar';
import Cards from './tabs/Cards';
import Ideas from './tabs/Ideas';
import Topics from './tabs/Topics';
import Vault, { vaultItems } from './tabs/Vault';
import Rules from './tabs/Rules';

const TABS = [
  { id: 'sim', label: 'Planificador', short: 'Plan', icon: Sliders, cat: 'social' },
  { id: 'cal', label: 'Calendario', short: 'Mes', icon: CalendarDays, cat: 'community' },
  { id: 'cards', label: 'Tareas', short: 'Tareas', icon: Layers, cat: 'video' },
  { id: 'ideas', label: 'Ideas', short: 'Ideas', icon: Lightbulb, cat: 'events' },
  { id: 'topics', label: 'Temas', short: 'Temas', icon: ListPlus, cat: 'governance' },
  { id: 'vault', label: 'Bóveda', short: 'Bóveda', icon: ShieldCheck, cat: 'growth' },
  { id: 'rules', label: 'Reglas', short: 'Reglas', icon: BookOpen, cat: 'institutional' },
];
const NO_FILTERS = { week: 'ALL', day: 'ALL', code: 'ALL', status: 'ALL', evidence: 'ALL', date: null };

function useTheme() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('agt_theme') || 'light'; } catch { return 'light'; } });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('agt_theme', theme); } catch { /* sin almacenamiento */ }
  }, [theme]);
  return [theme, () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))];
}

function Login({ adapter, setup, onDone, theme, toggleTheme }) {
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const tooShort = setup && pw.length > 0 && pw.length < 8;
  const mismatch = setup && pw2.length > 0 && pw !== pw2;
  const ready = setup ? pw.length >= 8 && pw === pw2 : pw.length > 0;
  return (
    <div className="login">
      <form className="login-card" onSubmit={async (e) => {
        e.preventDefault(); if (!ready) return; setBusy(true); setErr('');
        try { await (setup ? adapter.setup(pw) : adapter.login(pw)); onDone(); } catch (x) { setErr(x.message); }
        setBusy(false);
      }}>
        <div className="brand-mark big"><Award size={28} /></div>
        <h1>Ambassador Growth Tracker</h1>
        <p className="muted">{setup ? 'Es tu primera vez aquí. Crea la contraseña con la que vas a entrar desde cualquier dispositivo.' : 'Entra con tu contraseña. Este dispositivo queda recordado por 90 días.'}</p>
        <label className="field" htmlFor="pw"><span className="field-label">{setup ? 'Crea tu contraseña' : 'Contraseña'}{setup && <em>mínimo 8 caracteres</em>}</span>
          <input id="pw" type={show ? 'text' : 'password'} className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus autoComplete={setup ? 'new-password' : 'current-password'} />
        </label>
        {setup && (
          <label className="field" htmlFor="pw2"><span className="field-label">Repítela</span>
            <input id="pw2" type={show ? 'text' : 'password'} className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" />
          </label>
        )}
        <label className="check"><input id="pw_show" type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Mostrar contraseña</label>
        {tooShort && <p className="err">Usa al menos 8 caracteres.</p>}
        {mismatch && <p className="err">Las dos contraseñas no coinciden.</p>}
        {err && <p className="err">{err}</p>}
        <button className="btn primary big-btn" disabled={!ready || busy}>{busy ? <Loader2 size={16} className="spin" /> : <Lock size={16} />} {setup ? 'Crear contraseña y entrar' : 'Entrar'}</button>
        {setup && <p className="small muted">Guárdala en tu gestor de contraseñas. Si la pierdes se restablece desde Vercel, sin perder tus datos.</p>}
        <button type="button" className="icon-btn theme-corner" onClick={toggleTheme} aria-label="Cambiar tema">{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
      </form>
    </div>
  );
}

export default function App() {
  const adapter = useMemo(() => (IS_DEMO ? demoAdapter() : remoteAdapter()), []);
  const [theme, toggleTheme] = useTheme();
  const [auth, setAuth] = useState('checking');
  const [setup, setSetup] = useState(false);
  useEffect(() => { adapter.session().then((r) => { setSetup(!!r.setup); setAuth(r.ok ? 'ok' : 'login'); }).catch(() => setAuth('ok')); }, [adapter]);
  const lost = useCallback(() => { setSetup(false); setAuth('login'); }, []);
  if (auth === 'checking') return <div className="splash"><Loader2 className="spin" /></div>;
  if (auth === 'login') return <Login adapter={adapter} setup={setup} onDone={() => setAuth('ok')} theme={theme} toggleTheme={toggleTheme} />;
  return <Dashboard adapter={adapter} onAuthLost={lost} theme={theme} toggleTheme={toggleTheme} />;
}

function Dashboard({ adapter, onAuthLost, theme, toggleTheme }) {
  const { data, sync, actions } = useTracker(adapter, { onAuthLost });
  const [tab, setTab] = useState(() => (location.hash.slice(1) && TABS.some((t) => t.id === location.hash.slice(1)) ? location.hash.slice(1) : 'sim'));
  const [filters, setFilters] = useState(NO_FILTERS);
  const [editing, setEditing] = useState(null); // { task, isNew }
  const [ideaEdit, setIdeaEdit] = useState(undefined);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [confetti, setConfetti] = useState(0);
  const importRef = useRef(null);
  const lastTier = useRef(null);

  const notify = useCallback((text) => { setToast({ text, id: Date.now() }); }, []);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 3800); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { try { history.replaceState(null, '', `#${tab}`); } catch { /* frame sin historial */ } }, [tab]);

  const month = data?.settings?.month || currentMonth();
  const cfg = data?.settings?.cfg || {};
  const monthTasks = useMemo(() => (data?.tasks || []).filter((t) => t.dateStr?.startsWith(month)), [data, month]);
  const real = monthTasks.reduce((a, t) => a + earned(t), 0);
  const proj = monthTasks.reduce((a, t) => a + projected(t), 0);
  const tier = tierIndex(real);

  useEffect(() => {
    if (!data) return;
    if (lastTier.current !== null && tier > lastTier.current) { setConfetti((n) => n + 1); notify('Subiste de nivel de recompensa'); }
    lastTier.current = tier;
  }, [tier, data, notify]);
  useEffect(() => { lastTier.current = null; }, [month]);

  if (!data) return <div className="splash"><Loader2 className="spin" /><p>Cargando tus datos…</p></div>;

  const bumpCfg = (code, delta, base = cfg) => {
    const key = TASK_BY_CODE[code]?.cfg; if (!key) return base;
    const next = { ...base, [key]: Math.max(0, (base[key] || 0) + delta) };
    if (code === '02') next.task02_dc = Math.max(0, (base.task02_dc || 0) + delta);
    return next;
  };

  const saveTask = (t, original) => {
    actions.saveTasks([t]);
    if (!original) { actions.setSettings({ cfg: bumpCfg(t.taskCode, 1) }); notify(`“${t.title}” agregada`); }
    else {
      if (original.taskCode !== t.taskCode) actions.setSettings({ cfg: bumpCfg(t.taskCode, 1, bumpCfg(original.taskCode, -1)) });
      notify(`Guardado · ${t.status}`);
    }
    if (!t.dateStr.startsWith(month)) actions.setSettings({ month: t.dateStr.slice(0, 7) });
  };

  const askDelete = (t) => setConfirm({
    title: 'Eliminar tarea', text: `Vas a borrar “${t.title}”. Sus capturas también se eliminan.`,
    onConfirm: () => {
      actions.deleteTask(t.id); (t.images || []).forEach(actions.removeImage);
      actions.setSettings({ cfg: bumpCfg(t.taskCode, -1) }); setEditing(null); notify('Tarea eliminada');
    },
  });

  const copyTask = async (t) => {
    const ok = await copyRich(taskHtml(t), `${t.title}\n${(t.links || []).join('\n')}`);
    notify(ok ? 'Ficha copiada con sus capturas. Pégala en Google Docs.' : 'No se pudo copiar. Usa la descarga .doc.');
  };

  const cardProps = {
    onEdit: (t) => setEditing({ task: t }),
    onDelete: askDelete,
    onStatus: (t, status) => { actions.saveTasks([{ ...t, status }]); notify(`Estado: ${status}`); },
    onToggle: (t, key) => {
      const n = { ...t, [key]: !t[key] };
      const pts = earned(n);
      actions.saveTasks([{ ...n, points: pts, status: n.status === 'Brandchamp' ? n.status : pts ? 'Completado' : 'Programado' }]);
    },
    onCopy: async (text) => { notify((await copyText(text)) ? 'Copy copiado' : 'No se pudo copiar'); },
  };

  const exportBackup = () => {
    downloadFile(`ambassador_tracker_${todayIso()}.json`, JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), ...data }, null, 2), 'application/json');
    notify('Copia de seguridad descargada');
  };
  const importBackup = async (file) => {
    try {
      const parsed = normalizeBackup(JSON.parse(await file.text()));
      let moved = 0;
      for (const t of parsed.tasks) {
        const imgs = [];
        for (const src of t.images || []) { if (src.startsWith('data:')) { imgs.push(await actions.upload(src)); moved++; } else imgs.push(src); }
        t.images = imgs;
      }
      parsed.settings = { cfg: { ...cfg, ...(parsed.settings?.cfg || {}) }, month: parsed.settings?.month || month };
      setConfirm({
        title: 'Restaurar copia', danger: false, confirmLabel: 'Sí, restaurar',
        text: `La copia trae ${parsed.tasks.length} tareas y ${parsed.ideas.length} ideas${moved ? `, con ${moved} capturas ya subidas` : ''}. Reemplaza todo lo que tienes ahora.`,
        onConfirm: async () => { await actions.importAll(parsed); notify('Copia restaurada'); },
      });
    } catch { notify('Ese archivo no es una copia válida del tracker.'); }
  };

  const SyncIcon = sync === 'saving' || sync === 'loading' ? Loader2 : sync === 'offline' ? CloudOff : Cloud;
  const syncText = IS_DEMO ? 'Vista previa' : { saving: 'Guardando', loading: 'Cargando', offline: 'Sin conexión', ok: 'Guardado' }[sync];

  return (
    <div className="app">
      <Confetti fire={confetti} />
      <header className="topbar">
        <div className="topbar-in">
          <div className="brand">
            <div className="brand-mark"><Award size={20} /></div>
            <div>
              <h1>Ambassador Growth Tracker</h1>
              <p>Rootstock · Bitcoin L2</p>
            </div>
          </div>
          <div className="top-actions">
            <span className={`sync sync-${IS_DEMO ? 'demo' : sync}`} title={sync === 'offline' ? 'Los cambios se guardan cuando vuelva la conexión' : ''}>
              <SyncIcon size={14} className={sync === 'saving' ? 'spin' : ''} /> {syncText}
            </span>
            <button type="button" className="icon-btn" onClick={exportBackup} title="Descargar copia .json" aria-label="Descargar copia"><Download size={17} /></button>
            <button type="button" className="icon-btn" onClick={() => importRef.current?.click()} title="Restaurar copia .json" aria-label="Restaurar copia"><Upload size={17} /></button>
            <input ref={importRef} type="file" accept=".json,application/json" hidden onChange={(e) => { if (e.target.files[0]) importBackup(e.target.files[0]); e.target.value = ''; }} />
            <button type="button" className="icon-btn" onClick={toggleTheme} aria-label="Cambiar tema">{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
            {!IS_DEMO && <button type="button" className="icon-btn" onClick={async () => { await adapter.logout(); onAuthLost(); }} aria-label="Cerrar sesión"><LogOut size={17} /></button>}
          </div>
        </div>
      </header>

      {IS_DEMO && <div className="demo-band"><div>Vista previa con datos de ejemplo. Los cambios se guardan solo en este navegador. En Vercel usarás tus datos reales.</div></div>}

      <main className="wrap">
        <section className="score">
          <div className="score-main">
            <div className="eyebrow">Puntos reales · {monthLabel(month)}</div>
            <div className="score-big"><CountUp value={real} /><span>/ 1,000</span></div>
            <div className="score-sub">
              <span className="pill proj">Parrilla: <b className="num">{proj}</b> pts</span>
              <span className="pill gain">Asegurado: <b className="num">${[0, 300, 500, 700, 900, 1100, 1300][tier].toLocaleString('en-US')}</b></span>
            </div>
          </div>
          <RewardPath real={real} projected={proj} />
        </section>

        <nav className="tabs" aria-label="Secciones">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} type="button" className={`tab ${tab === t.id ? 'on' : ''}`} data-cat={t.cat} onClick={() => setTab(t.id)} aria-current={tab === t.id ? 'page' : undefined}>
                <Icon size={17} /><span className="tab-l">{t.label}</span><span className="tab-s">{t.short}</span>
              </button>
            );
          })}
        </nav>

        <div className="view" key={tab}>
          {tab === 'sim' && (
            <Simulator cfg={cfg} month={month} onCfg={(c) => actions.setSettings({ cfg: c })}
              onGenerate={() => setConfirm({
                title: `Generar parrilla de ${monthLabel(month)}`, danger: false, confirmLabel: 'Generar',
                text: monthTasks.length ? `Se reemplazan las ${monthTasks.length} tareas de este mes, incluidas sus capturas y estados. Los otros meses no se tocan.` : 'Se crean las tareas del mes según tu escenario.',
                onConfirm: () => { actions.replaceMonth(month, generateMonth(month, cfg)); setTab('cal'); notify('Parrilla del mes lista'); },
              })} />
          )}
          {tab === 'cal' && (
            <Calendar tasks={monthTasks} month={month} onMonth={(m) => actions.setSettings({ month: m }, { immediate: true })}
              onOpen={(t) => setEditing({ task: t })} onAdd={(d) => setEditing({ isNew: true, task: newTask('04', d || (todayIso().startsWith(month) ? todayIso() : `${month}-01`)) })}
              onDay={(d) => { setFilters({ ...NO_FILTERS, date: d }); setTab('cards'); }} />
          )}
          {tab === 'cards' && <Cards tasks={monthTasks} filters={filters} setFilters={setFilters} cardProps={cardProps}
            onAdd={() => setEditing({ isNew: true, task: newTask('04', todayIso().startsWith(month) ? todayIso() : `${month}-01`) })} />}
          {tab === 'ideas' && <Ideas ideas={data.ideas} onNew={() => setIdeaEdit(null)} onEdit={(i) => setIdeaEdit(i)}
            onDelete={(i) => setConfirm({ title: 'Eliminar idea', text: `Vas a borrar “${i.title}”.`, onConfirm: () => { actions.deleteIdea(i.id); notify('Idea eliminada'); } })}
            onCopy={async (i) => notify((await copyText(`${i.title}\n\n${i.description || ''}\n\n${(i.links || []).join('\n')}`.trim())) ? 'Idea copiada' : 'No se pudo copiar')} />}
          {tab === 'topics' && <Topics tasks={monthTasks} onAssign={(list) => { actions.saveTasks(list); notify(`${list.length} temas asignados`); }} />}
          {tab === 'vault' && (
            <Vault tasks={monthTasks}
              onDocAll={() => { downloadDoc(`Evidencias Rootstock ${monthLabel(month)}`, reportHtml(vaultItems(monthTasks), real, monthLabel(month))); notify('Reporte .doc descargado'); }}
              onCopyAll={async () => notify((await copyRich(reportHtml(vaultItems(monthTasks), real, monthLabel(month)), 'Reporte de evidencias')) ? 'Reporte copiado. Pégalo en un Google Doc nuevo.' : 'No se pudo copiar. Usa la descarga .doc.')}
              onDoc={(t) => { downloadDoc(`Evidencia ${t.taskCode} ${t.title}`, taskHtml(t)); notify('Ficha .doc descargada'); }}
              onCopy={copyTask}
              onUploaded={(t) => { actions.saveTasks([{ ...t, status: t.status === 'Brandchamp' ? 'Completado' : 'Brandchamp' }]); }} />
          )}
          {tab === 'rules' && <Rules />}
        </div>
      </main>

      {tab !== 'sim' && tab !== 'rules' && (
        <button type="button" className="fab" aria-label="Agregar tarea" onClick={() => setEditing({ isNew: true, task: newTask('04', todayIso().startsWith(month) ? todayIso() : `${month}-01`) })}><Plus size={24} /></button>
      )}

      {editing && (
        <TaskModal task={editing.task} isNew={editing.isNew} actions={actions} notify={notify}
          onSave={(t) => { if (t) saveTask(t, editing.isNew ? null : editing.task); setEditing(null); }}
          onDelete={askDelete} onCopy={copyTask}
          onDoc={(t) => { downloadDoc(`Evidencia ${t.taskCode} ${t.title}`, taskHtml(t)); notify('Ficha .doc descargada'); }} />
      )}
      {ideaEdit !== undefined && <IdeaModal idea={ideaEdit} onSave={(i) => { if (i) { actions.saveIdea(i); notify('Idea guardada'); } setIdeaEdit(undefined); }} />}
      {confirm && <Confirm {...confirm} onClose={() => setConfirm(null)} />}
      <Toast msg={toast} />
    </div>
  );
}
