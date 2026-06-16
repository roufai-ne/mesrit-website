/**
 * Seed des missions — insère les 3 missions stratégiques (précédemment codées en
 * dur dans src/pages/api/ministere/missions.js) dans la collection Strapi `missions`.
 *
 * Contrairement à scripts/seed.js (insertion directe en SQLite), ce script passe
 * par l'API REST de Strapi car le content-type `mission` utilise des composants
 * répétables (objectifs, stats) dont le schéma de tables internes n'est pas stable
 * à manipuler directement en SQL.
 *
 * Prérequis :
 *   - Le serveur Strapi doit être démarré (`npm run develop` depuis backend/)
 *   - STRAPI_API_TOKEN doit être un token avec les droits de création sur `mission`
 *     (Réglages → Tokens API → Full access, ou un token dédié avec permission Create)
 *
 * Usage : STRAPI_API_TOKEN=xxxx node scripts/seed-missions.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('✗ STRAPI_API_TOKEN manquant. Voir l\'en-tête de ce script pour les prérequis.');
  process.exit(1);
}

const missions = [
  {
    title: 'Enseignement Supérieur',
    icon: 'BookOpen',
    color: 'from-niger-green to-niger-green-dark',
    content: "Assurer le développement et la qualité de l'enseignement supérieur au Niger pour former les cadres de demain et répondre aux besoins du développement socio-économique du pays.",
    order: 0,
    objectifs: [
      { text: "Améliorer l'accès à l'enseignement supérieur", progress: 78, description: 'Augmentation du taux de scolarisation dans le supérieur de 15% à 25%' },
      { text: 'Garantir la qualité des formations', progress: 85, description: "Mise en place de standards d'accréditation et d'évaluation" },
      { text: 'Renforcer les capacités des établissements', progress: 62, description: 'Modernisation des infrastructures et équipements pédagogiques' },
    ],
    stats: [
      { label: 'etablissements', value: '10+' },
      { label: 'etudiants', value: '100k+' },
      { label: 'programmes', value: '200+' },
      { label: 'diplomes', value: '15k+/an' },
    ],
    achievements: [
      'Création de 3 nouvelles universités régionales',
      'Augmentation de 40% des effectifs étudiants',
      'Mise en place du système LMD dans tous les établissements',
    ],
  },
  {
    title: 'Recherche',
    icon: 'Target',
    color: 'from-niger-orange to-niger-orange-dark',
    content: "Promouvoir la recherche scientifique et l'innovation pour le développement socio-économique du Niger en favorisant l'excellence et les partenariats stratégiques.",
    order: 1,
    objectifs: [
      { text: 'Développer les infrastructures de recherche', progress: 45, description: 'Construction de laboratoires et centres de recherche modernes' },
      { text: 'Soutenir les projets de recherche', progress: 72, description: 'Financement et accompagnement des chercheurs nationaux' },
      { text: 'Favoriser les partenariats internationaux', progress: 83, description: 'Collaborations avec universités et centres de recherche étrangers' },
    ],
    stats: [
      { label: 'chercheurs', value: '500+' },
      { label: 'projets', value: '150+' },
      { label: 'publications', value: '300+' },
      { label: 'partenariats', value: '25+' },
    ],
    achievements: [
      'Signature de 15 accords de coopération internationale',
      'Création du Fonds National de Recherche',
      'Lancement de 50 projets de recherche prioritaires',
    ],
  },
  {
    title: 'Innovation',
    icon: 'Award',
    color: 'from-purple-500 to-purple-700',
    content: "Stimuler l'innovation technologique et le transfert de connaissances vers le secteur productif pour favoriser l'entrepreneuriat et la création d'emplois.",
    order: 2,
    objectifs: [
      { text: 'Encourager les initiatives innovantes', progress: 58, description: 'Incubateurs et pépinières d\'entreprises dans les universités' },
      { text: 'Faciliter le transfert technologique', progress: 41, description: 'Partenariats université-industrie et valorisation de la recherche' },
      { text: 'Soutenir les startups universitaires', progress: 67, description: 'Accompagnement entrepreneurial des étudiants et jeunes diplômés' },
    ],
    stats: [
      { label: 'startups', value: '50+' },
      { label: 'brevets', value: '25+' },
      { label: 'partenariats', value: '30+' },
      { label: 'emplois', value: '500+' },
    ],
    achievements: [
      'Création de 5 incubateurs universitaires',
      "Lancement du concours national d'innovation",
      'Formation de 200 jeunes entrepreneurs',
    ],
  },
];

async function missionExists(title) {
  const res = await fetch(`${STRAPI_URL}/api/missions?filters[title][$eq]=${encodeURIComponent(title)}`, {
    headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Lecture échouée (${res.status}) : ${await res.text()}`);
  const json = await res.json();
  return (json.data || []).length > 0;
}

async function createMission(mission) {
  const res = await fetch(`${STRAPI_URL}/api/missions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify({ data: { ...mission, publishedAt: new Date().toISOString() } }),
  });
  if (!res.ok) throw new Error(`Création échouée (${res.status}) : ${await res.text()}`);
  return res.json();
}

(async () => {
  console.log('\n=== Seed Missions ===');
  let created = 0;
  let skipped = 0;
  for (const mission of missions) {
    try {
      if (await missionExists(mission.title)) {
        console.log(`  ↷  [missions] skip  "${mission.title}"`);
        skipped++;
        continue;
      }
      await createMission(mission);
      console.log(`  ✓  [missions] créé  "${mission.title}"`);
      created++;
    } catch (err) {
      console.error(`  ✗  [missions] erreur pour "${mission.title}" :`, err.message);
      process.exitCode = 1;
    }
  }
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Seed missions terminé : ${created} créées, ${skipped} ignorées`);
  console.log(`${'─'.repeat(50)}\n`);
})();
