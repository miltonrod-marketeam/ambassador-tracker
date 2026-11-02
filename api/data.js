import { redis, K, guard, parse } from './_lib.js';

export default async function handler(req, res) {
  if (!(await guard(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  const [tasks, ideas, settings] = await Promise.all([
    redis.hgetall(K.tasks), redis.hgetall(K.ideas), redis.get(K.settings),
  ]);
  res.json({
    tasks: Object.values(tasks || {}).map(parse),
    ideas: Object.values(ideas || {}).map(parse),
    settings: settings ? parse(settings) : null,
  });
}
