import { redis, K, guard, parse, hsetMany } from './_lib.js';

export default async function handler(req, res) {
  if (!(await guard(req, res))) return;
  if (req.method === 'PUT') {
    const { tasks = [], month } = req.body || {};
    if (month) {
      // Reemplaza solo las tareas de ese mes; los demás meses quedan intactos.
      const all = Object.values((await redis.hgetall(K.tasks)) || {}).map(parse);
      const old = all.filter((t) => (t.dateStr || '').startsWith(month)).map((t) => t.id);
      for (let i = 0; i < old.length; i += 100) await redis.hdel(K.tasks, ...old.slice(i, i + 100));
    }
    if (tasks.length) await hsetMany(K.tasks, tasks);
    return res.json({ ok: true });
  }
  if (req.method === 'DELETE') {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'Falta el id de la tarea.' });
    await redis.hdel(K.tasks, id);
    return res.json({ ok: true });
  }
  res.status(405).json({ error: 'Método no permitido' });
}
