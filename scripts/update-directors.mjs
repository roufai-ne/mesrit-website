// Script de mise à jour complète de l'organigramme MESRIT dans Strapi
// Usage: node scripts/update-directors.mjs

const API = 'http://localhost:1337/api';
const TOKEN = 'd21f96e2119d529adaf00695b29b806f4a8658c6d128f8d211bbf7acb0ecd66ed15f80eeb154510db1f1844305fa12bfc9190b8b8d53cf86375de4cd5d3d90294a29e0806237fd3ecb70c6ca3540d2c5a6ed67451d72c8ecc0c01a05774696f31d83aa6a2fab575d249e4580e6e5756f2375bd60a0ad96bf697aff310455a78f';
const H = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, { headers: H, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data?.error)}`);
  return data;
}

// Structure complète de l'organigramme MESRIT
// key: identifiant unique | direction: clé de la DG/direction parente
const DIRECTORS = [
  // Cabinet
  { key: 'MINISTRE', titre: 'Ministre', nom: 'Pr. Saidou Mamadou', email: 'ministre@mesrit.ne', telephone: '+227 XX XX XX', order: 1 },
  // Secrétariat Général
  { key: 'SG',  titre: 'Secrétaire Général', nom: 'Pr. HAMIDOU TALIBI Moussa', email: 'moussahamidoutalibi@gmail.com', telephone: '+227 XX XX XX', order: 2 },
  { key: 'SGA', titre: 'Secrétaire Général Adjoint', nom: 'Dr. Daou Ibrahim', order: 3 },
  // IGS
  { key: 'IGS', titre: "Inspecteur Général des Services", nom: 'Pr. NAROUA Harouna', order: 4 },
  // Directions générales
  { key: 'DGES',  titre: "Directeur Général de l'Enseignement Supérieur", nom: 'Pr. Bahari Mahamadou', order: 5 },
  { key: 'DGRIT', titre: "Directeur Général de la Recherche et de l'Innovation Technologique", nom: 'Pr. Aichatou', order: 6 },
  // Directions centrales rattachées au SG
  { key: 'DSI',    titre: "Direction des Statistiques et de l'Informatique", nom: 'Haboubacar Amadou Roufai', direction: 'SG', order: 10 },
  { key: 'DAIDRP', titre: "Direction des Archives, de l'Information, de la Documentation et des Relations Publiques", nom: 'Mme. Aminou Absatou', direction: 'SG', order: 11 },
  { key: 'DAF',    titre: "Direction des Affaires Financières et du Matériel", nom: 'Jdoud Mohamed', direction: 'SG', order: 12 },
  // Directions rattachées à DGES
  { key: 'DESP',   titre: "Direction de l'Enseignement Supérieur Public",  nom: 'Pr. Douma',  direction: 'DGES', order: 20 },
  { key: 'DESPRI', titre: "Direction de l'Enseignement Supérieur Privé",   nom: 'Pr. Grema',  direction: 'DGES', order: 21 },
  // Directions rattachées à DGRIT
  { key: 'DR',  titre: "Direction de la Recherche",              nom: 'Dr Salamatou',            direction: 'DGRIT', order: 30 },
  { key: 'DIT', titre: "Direction de l'Innovation Technologique", nom: 'Dr GALADIMA Moustapha', direction: 'DGRIT', order: 31 },
];

async function main() {
  // 1. Lister les directors existants
  const { data: existing } = await apiFetch('/directors?pagination[limit]=100');
  console.log(`Directors existants dans Strapi: ${existing.length}`);
  existing.forEach(x => console.log(`  [${x.id}] key=${x.key ?? '(null)'} | ${x.titre?.substring(0, 50)}`));

  const existingByKey = {};
  const existingByTitre = {};
  existing.forEach(d => {
    if (d.key) existingByKey[d.key] = d;
    existingByTitre[d.titre] = d;
  });

  // Correspondance manuelle pour les entrées sans key (Ministre et SG déjà dans Strapi)
  const titreToKey = {
    'Ministre': 'MINISTRE',
    'Secrétaire Général': 'SG',
  };
  existing.forEach(d => {
    const inferredKey = titreToKey[d.titre];
    if (inferredKey && !existingByKey[inferredKey]) {
      existingByKey[inferredKey] = d;
    }
  });

  console.log('\n=== Traitement ===');

  for (const dir of DIRECTORS) {
    const found = existingByKey[dir.key] || existingByTitre[dir.titre];

    const payload = {
      titre: dir.titre,
      nom: dir.nom,
      key: dir.key,
      order: dir.order,
      ...(dir.direction ? { direction: dir.direction } : {}),
      ...(dir.email ? { email: dir.email } : {}),
      ...(dir.telephone ? { telephone: dir.telephone } : {}),
    };

    if (found) {
      // Mettre à jour si key, direction, ou titre changent
      const needsUpdate =
        found.key !== dir.key ||
        found.direction !== (dir.direction ?? null) ||
        found.titre !== dir.titre;

      if (needsUpdate) {
        process.stdout.write(`  MISE À JOUR [${found.documentId}] ${dir.key}...`);
        await apiFetch(`/directors/${found.documentId}`, {
          method: 'PUT',
          body: JSON.stringify({ data: payload }),
        });
        console.log(' OK');
      } else {
        console.log(`  SKIP [${found.id}] ${dir.key} — déjà à jour`);
      }
    } else {
      process.stdout.write(`  CRÉATION ${dir.key}...`);
      const created = await apiFetch('/directors', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
      });
      console.log(` OK — id=${created.data?.id}`);
    }
  }

  // Vérification finale
  console.log('\n=== État final ===');
  const { data: final } = await apiFetch('/directors?pagination[limit]=100');
  console.log(`Total: ${final.length} directors`);
  final.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
  final.forEach(x => console.log(`  [${x.id}] key=${x.key ?? '(null)'} | ${x.titre?.substring(0, 55)} | dir=${x.direction ?? '-'}`));
  console.log('\nTerminé.');
}

main().catch(e => { console.error('ERREUR:', e.message); process.exit(1); });
