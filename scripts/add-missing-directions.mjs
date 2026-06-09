// Ajoute les 9 directions centrales manquantes dans Strapi
// Usage: node scripts/add-missing-directions.mjs

const API = 'http://localhost:1337/api';
const TOKEN = 'd21f96e2119d529adaf00695b29b806f4a8658c6d128f8d211bbf7acb0ecd66ed15f80eeb154510db1f1844305fa12bfc9190b8b8d53cf86375de4cd5d3d90294a29e0806237fd3ecb70c6ca3540d2c5a6ed67451d72c8ecc0c01a05774696f31d83aa6a2fab575d249e4580e6e5756f2375bd60a0ad96bf697aff310455a78f';
const H = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: H, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data?.error)}`);
  return data;
}

const NEW_DIRECTIONS = [
  // Directions centrales sous SG (manquantes)
  { key: 'DEP',   titre: "Direction des Études et de la Programmation",                              direction: 'SG',   order: 13 },
  { key: 'DRH',   titre: "Direction des Ressources Humaines",                                        direction: 'SG',   order: 14 },
  { key: 'DRFM',  titre: "Direction des Ressources Financières et du Matériel",                      direction: 'SG',   order: 15 },
  { key: 'DMP',   titre: "Direction des Marchés Publics et de Délégation de Service Public",         direction: 'SG',   order: 16 },
  { key: 'DL',    titre: "Direction de la Législation",                                              direction: 'SG',   order: 17 },
  { key: 'DIEU',  titre: "Direction des Infrastructures et Équipements Universitaires",              direction: 'SG',   order: 18 },
  // Directions sous DGES (manquantes)
  { key: 'DSAC',  titre: "Direction des Sports et des Activités Culturelles Universitaires et des Grandes Écoles", direction: 'DGES', order: 22 },
  { key: 'DESA',  titre: "Direction de l'Enseignement Supérieur Arabe",                              direction: 'DGES', order: 23 },
  { key: 'DOSCE', titre: "Direction de l'Orientation et du Suivi du Cursus des Étudiants",           direction: 'DGES', order: 24 },
];

async function getExistingKeys() {
  const data = await apiFetch('/directors?pagination[limit]=100&fields[0]=key');
  return new Set(data.data.map(d => d.key).filter(Boolean));
}

async function createDirection(dir) {
  const body = { data: { key: dir.key, titre: dir.titre, nom: dir.nom || 'À compléter', direction: dir.direction, order: dir.order } };
  const result = await apiFetch('/directors', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return result.data;
}

async function main() {
  console.log('Récupération des directions existantes...');
  const existingKeys = await getExistingKeys();
  console.log(`Clés existantes: ${[...existingKeys].join(', ')}`);

  for (const dir of NEW_DIRECTIONS) {
    if (existingKeys.has(dir.key)) {
      console.log(`[SKIP] ${dir.key} — déjà existant`);
      continue;
    }
    try {
      const created = await createDirection(dir);
      console.log(`[OK]   id=${created.id} key=${dir.key} | ${dir.titre.substring(0, 50)}`);
    } catch (err) {
      console.error(`[ERR]  ${dir.key}: ${err.message}`);
    }
  }

  console.log('\nTerminé.');
}

main().catch(console.error);
