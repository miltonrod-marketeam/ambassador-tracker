// Compara dos estados de datos sin importar el orden de las listas ni de las llaves.
const norm = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x)
  ? Object.fromEntries(Object.keys(x).sort().map((key) => [key, x[key]])) : x));
const byId = (list = []) => [...list].sort((a, b) => String(a.id).localeCompare(String(b.id)));
export const sameData = (a, b) => !!a && !!b
  && norm(byId(a.tasks)) === norm(byId(b.tasks))
  && norm(byId(a.ideas)) === norm(byId(b.ideas))
  && norm(a.settings) === norm(b.settings);
