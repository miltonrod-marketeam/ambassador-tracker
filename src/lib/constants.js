export const CATS = {
  community: { name: 'Community', label: 'Comunidad' },
  social: { name: 'Social Media', label: 'Contenido' },
  governance: { name: 'Governance', label: 'Gobernanza' },
  video: { name: 'Video Content', label: 'Video' },
  institutional: { name: 'Institutional', label: 'Institucional' },
  events: { name: 'Events', label: 'Eventos' },
  growth: { name: 'Growth', label: 'Crecimiento' },
  special: { name: 'Special', label: 'Especial' },
};

// pref = días de la semana preferidos (1 = lunes … 5 = viernes)
export const TASKS = [
  { code: '01', name: 'Like, Comment & Quote Tweet', short: 'Ronda L/C/QT', cat: 'community', points: 10, views: false, cfg: 'task01', pref: [1, 4] },
  { code: '02', name: 'Telegram & Discord Active Days', short: 'Telegram & Discord', cat: 'community', points: 2, views: false, cfg: 'task02_tg', pref: [] },
  { code: '03', name: 'Governance Feedback', short: 'Governance Feedback', cat: 'governance', points: 10, views: false, cfg: 'task03', pref: [1] },
  { code: '04', name: 'Educational Content (Post)', short: 'Educational Post', cat: 'social', points: 30, views: true, cfg: 'task04', pref: [1, 3] },
  { code: '05', name: 'Explainer Video (≤5min)', short: 'Explainer Video', cat: 'video', points: 70, views: true, cfg: 'task05', pref: [2] },
  { code: '06', name: 'Weekly Ecosystem Update', short: 'Weekly Update', cat: 'social', points: 35, views: false, cfg: 'task06', pref: [3] },
  { code: '07', name: 'Institutional Convos (Set of 3)', short: 'Institutional Convos', cat: 'institutional', points: 15, views: false, cfg: 'task07', pref: [4] },
  { code: '08', name: 'Institutional Lead', short: 'Institutional Lead', cat: 'institutional', points: 10, views: false, cfg: 'task08', pref: [4] },
  { code: '09', name: 'Attend Bitcoin/DeFi Event', short: 'Evento Bitcoin/DeFi', cat: 'institutional', points: 40, views: false, cfg: 'task09', pref: [5] },
  { code: '10', name: 'Host Online Inst. Event', short: 'Host Evento Online', cat: 'institutional', points: 35, views: false, cfg: 'task10', pref: [4] },
  { code: '11', name: 'Co-Host / Speak Online Event', short: 'Speaker Online', cat: 'events', points: 60, views: false, cfg: 'task11', pref: [4] },
  { code: '12', name: 'Co-Host / Speak Onsite Event', short: 'Speaker Presencial', cat: 'events', points: 100, views: false, cfg: 'task12', pref: [5] },
  { code: '13', name: 'New Verified Staker', short: 'Nuevo Staker', cat: 'growth', points: 80, views: false, cfg: 'task13', pref: [2, 3] },
  { code: '14', name: 'New Member Referral', short: 'Referido', cat: 'growth', points: 20, views: false, cfg: 'task14', pref: [2] },
  { code: '15', name: 'Task of the Week', short: 'Task of the Week', cat: 'special', points: 20, views: false, cfg: 'task15', pref: [5] },
];
export const TASK_BY_CODE = Object.fromEntries(TASKS.map((t) => [t.code, t]));
export const catOf = (code) => TASK_BY_CODE[code]?.cat || 'special';

export const SLIDER_GROUPS = [
  { title: 'Comunidad y gobernanza', cat: 'community', rows: [
    { key: 'task01', code: '01', label: 'Like, Comment & Quote Tweet', pts: 10, max: 20, hint: '10 pts por ronda · mín. 2 por semana' },
    { key: 'task02_tg', code: '02', label: 'Días activos en Telegram', pts: 1, max: 23, hint: '1 pt por día · mín. 1 por semana' },
    { key: 'task02_dc', code: '02', label: 'Días activos en Discord', pts: 1, max: 23, hint: '1 pt por día · mín. 1 por semana' },
    { key: 'task03', code: '03', label: 'Governance Feedback', pts: 10, max: 5, hint: '10 pts cada uno · mín. 1 al mes' },
  ] },
  { title: 'Contenido y video', cat: 'video', rows: [
    { key: 'task04', code: '04', label: 'Educational Content', pts: 30, max: 16, hint: '30 pts · mín. 4, máx. 16 al mes · 300 views' },
    { key: 'task05', code: '05', label: 'Explainer Video (≤5 min)', pts: 70, max: 4, hint: '70 pts · máx. 4 al mes · 300 views' },
    { key: 'task06', code: '06', label: 'Weekly Ecosystem Update', pts: 35, max: 12, hint: '35 pts · mín. 2, máx. 12 al mes' },
  ] },
  { title: 'Institucional y eventos', cat: 'institutional', rows: [
    { key: 'task07', code: '07', label: 'Institutional Convos (set de 3)', pts: 15, max: 10, hint: '15 pts por set de 3 reuniones' },
    { key: 'task08', code: '08', label: 'Institutional Lead', pts: 10, max: 10, hint: '10 pts por lead calificado' },
    { key: 'task09', code: '09', label: 'Asistir a evento Bitcoin/DeFi', pts: 40, max: 5, hint: '40 pts · mín. 2 al mes' },
    { key: 'task10', code: '10', label: 'Host evento online institucional', pts: 35, max: 4, hint: '35 pts · máx. 4 al mes' },
    { key: 'task11', code: '11', label: 'Co-host / speaker online', pts: 60, max: 4, hint: '60 pts · máx. 4 al mes · ≥30 min' },
    { key: 'task12', code: '12', label: 'Co-host / speaker presencial', pts: 100, max: 3, hint: '100 pts por evento presencial' },
  ] },
  { title: 'Crecimiento y especiales', cat: 'social', rows: [
    { key: 'task13', code: '13', label: 'New Verified Staker', pts: 80, max: 10, hint: '80 pts por staker nuevo ($10+ USD)' },
    { key: 'task14', code: '14', label: 'New Member Referral', pts: 20, max: 10, hint: '20 pts por miembro activo referido' },
    { key: 'task15', code: '15', label: 'Task of the Week', pts: 20, max: 5, hint: '20 pts · máx. 4 al mes' },
  ] },
];

export const DEFAULT_CFG = {
  task01: 8, task02_tg: 20, task02_dc: 20, task03: 1, task04: 8, task05: 2, task06: 2,
  task07: 2, task08: 1, task09: 1, task10: 1, task11: 2, task12: 0, task13: 3, task14: 2, task15: 2,
};
export const ZERO_CFG = Object.fromEntries(Object.keys(DEFAULT_CFG).map((k) => [k, 0]));
export const CORE_CFG = { ...ZERO_CFG, task01: 8, task02_tg: 20, task02_dc: 20, task03: 1, task04: 4 };

export const TIERS = [
  { min: 0, reward: 0, label: 'Sin premio' },
  { min: 200, reward: 300 },
  { min: 400, reward: 500 },
  { min: 600, reward: 700 },
  { min: 800, reward: 900 },
  { min: 900, reward: 1100 },
  { min: 1000, reward: 1300 },
];
export const tierFor = (pts) => [...TIERS].reverse().find((t) => pts >= t.min) || TIERS[0];
export const tierIndex = (pts) => TIERS.indexOf(tierFor(pts));

export const STATUSES = ['Programado', 'Publicado', 'Completado', 'Brandchamp'];

export const RULES = [
  { code: '01', points: '10 pts por ronda', req: 'Interactuar en posts oficiales (@rootstock_io, @RIFTechnology, @RootstockColl). Mínimo 2 por semana.', ev: 'Enlace o captura de pantalla.' },
  { code: '02', points: '1 pt por día y red', req: 'Participación sustantiva diaria en Telegram y en el servidor oficial de Discord.', ev: 'Verificación en sistema o reporte diario.' },
  { code: '03', points: '10 pts cada uno', req: 'Comentarios sustantivos en propuestas de gobernanza en Discourse o Snapshot. Mínimo 1 al mes.', ev: 'Enlace al comentario o propuesta.' },
  { code: '04', points: '30 pts cada uno', req: 'Artículos o hilos técnicos de calidad en X o LinkedIn. Mínimo 4, máximo 16 al mes.', ev: 'Enlace, mínimo 300 views en 1 semana y captura.' },
  { code: '05', points: '70 pts cada uno', req: 'Video educativo en canal propio (YouTube, X o TikTok) sobre productos Rootstock. Máximo 4 al mes.', ev: 'Enlace, mínimo 300 views en 1 semana y captura.' },
  { code: '06', points: '35 pts cada uno', req: 'Resumen técnico o noticioso de las novedades semanales del ecosistema.', ev: 'Enlace al post o hilo publicado.' },
  { code: '07', points: '15 pts por set', req: 'Reuniones o acercamientos con instituciones o proyectos para integrar Rootstock.', ev: 'Reporte de la conversación y contactos.' },
  { code: '08', points: '10 pts cada uno', req: 'Lead calificado de institución o protocolo interesado en desplegar.', ev: 'Detalles del lead y contacto.' },
  { code: '09', points: '40 pts cada uno', req: 'Asistencia presencial o virtual a eventos relevantes de la industria. Mínimo 2 al mes.', ev: 'Fotos, tickets o acreditación.' },
  { code: '10', points: '35 pts cada uno', req: 'Organizar un evento virtual para instituciones o desarrolladores. Máximo 4 al mes.', ev: 'Link de Luma, grabación y lista de asistentes.' },
  { code: '11', points: '60 pts cada uno', req: 'Ponente o co-host en X Spaces, AMAs o webinars de 30 minutos o más. Máximo 4 al mes.', ev: 'Enlace a la grabación y al evento.' },
  { code: '12', points: '100 pts cada uno', req: 'Ponente presencial representando a Rootstock en conferencia o meetup.', ev: 'Fotos del evento y programa oficial.' },
  { code: '13', points: '80 pts cada uno', req: 'Onboarding de un usuario nuevo que haga staking de mínimo $10 USD.', ev: 'Wallet del usuario y tx hash en el explorer.' },
  { code: '14', points: '20 pts cada uno', req: 'Referir nuevos miembros activos al programa de embajadores.', ev: 'Usuario o ID del referido.' },
  { code: '15', points: '20–25 pts aprox.', req: 'Desafíos sorpresa semanales anunciados en los canales del programa. Máximo 4 al mes.', ev: 'Cumplir el requerimiento específico.' },
];
