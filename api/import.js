import { redis, K, guard, hsetMany } from './_lib.js';

// Restaura una copia completa: reemplaza tareas, ideas y ajustes.
export default async function handler(req, res) {
  if (!guard(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const { tasks = [], ideas = [], settings } = req.body || {};
  await redis.del(K.tasks, K.ideas);
  if (tasks.length) await hsetMany(K.tasks, tasks);
  if (ideas.length) await hsetMany(K.ideas, ideas);
  if (settings) await redis.set(K.settings, JSON.stringify(settings));
  res.json({ ok: true, tasks: tasks.length, ideas: ideas.length });
}
