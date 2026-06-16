/**
 * Seed script — insère les données par défaut dans la base SQLite Strapi.
 * Usage : node scripts/seed.js  (depuis le dossier backend/)
 */
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('.tmp/data.db');
const now = new Date().toISOString();

let created = 0;
let skipped = 0;

function insert(table, item, checkCol) {
  const val = item[checkCol];
  const existing = db.prepare(`SELECT id FROM "${table}" WHERE "${checkCol}" = ?`).get(val);
  if (existing) {
    console.log(`  ↷  [${table}] skip  "${val}"`);
    skipped++;
    return;
  }
  const cols = Object.keys(item).map(k => `"${k}"`).join(', ');
  const placeholders = Object.keys(item).map(() => '?').join(', ');
  db.prepare(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`).run(Object.values(item));
  console.log(`  ✓  [${table}] créé  "${val}"`);
  created++;
}

/* ──────────────────────────────────────────────────────────────
   1. SERVICES EXTERNES (ANAB, OBEECS, ANAQ-SUP)
────────────────────────────────────────────────────────────── */
console.log('\n=== Services Externes ===');
[
  {
    document_id: randomUUID(),
    title: 'ANAB',
    description: 'Agence Nationale des Allocations et Bourses',
    long_desc: 'Gérez vos demandes de bourses et suivez leur état d\'avancement en ligne',
    url: 'https://anab.ne',
    icon: 'Award',
    color: 'blue',
    order: 0,
    created_at: now, updated_at: now, published_at: now,
  },
  {
    document_id: randomUUID(),
    title: 'OBEECS',
    description: 'Office du Baccalauréat et des Examens et Concours du Supérieur',
    long_desc: 'Consultez les résultats du baccalauréat et les informations sur les concours',
    url: 'https://obeecs.gov.ne',
    icon: 'GraduationCap',
    color: 'green',
    order: 1,
    created_at: now, updated_at: now, published_at: now,
  },
  {
    document_id: randomUUID(),
    title: 'ANAQ-SUP',
    description: 'Agence Nationale d\'Assurance Qualité de l\'Enseignement Supérieur',
    long_desc: 'Évaluation et accréditation des établissements et des programmes d\'enseignement supérieur',
    url: 'https://anaqsup.gov.ne',
    icon: 'FileCheck',
    color: 'purple',
    order: 2,
    created_at: now, updated_at: now, published_at: now,
  },
].forEach(item => insert('external_services', item, 'title'));

/* ──────────────────────────────────────────────────────────────
   2. JALONS HISTORIQUES
────────────────────────────────────────────────────────────── */
console.log('\n=== Jalons Historiques ===');
[
  {
    document_id: randomUUID(),
    year: '1960',
    title: 'Indépendance du Niger',
    content: 'Le Niger accède à l\'indépendance. Les bases d\'une politique nationale d\'éducation sont posées.',
    icon: 'Flag',
    color: 'orange',
    order: 0,
    created_at: now, updated_at: now, published_at: now,
  },
  {
    document_id: randomUUID(),
    year: '1962',
    title: 'Création du Ministère',
    content: 'Création du Ministère de l\'Éducation Nationale, ancêtre direct du MESRIT, chargé de l\'enseignement à tous les niveaux.',
    icon: 'Building',
    color: 'blue',
    order: 1,
    created_at: now, updated_at: now, published_at: now,
  },
  {
    document_id: randomUUID(),
    year: '1973',
    title: 'Université Abdou Moumouni',
    content: 'Fondation de l\'Université Abdou Moumouni de Niamey, première université nationale, symbole d\'accès au savoir pour tous les Nigériens.',
    icon: 'GraduationCap',
    color: 'green',
    order: 2,
    created_at: now, updated_at: now, published_at: now,
  },
  {
    document_id: randomUUID(),
    year: '1990',
    title: 'Réformes de l\'enseignement supérieur',
    content: 'Lancement des grandes réformes visant à moderniser les filières, diversifier l\'offre et améliorer la qualité de l\'enseignement supérieur.',
    icon: 'BookOpen',
    color: 'purple',
    order: 3,
    created_at: now, updated_at: now, published_at: now,
  },
  {
    document_id: randomUUID(),
    year: '2010',
    title: 'Création de l\'ANAB',
    content: 'Création de l\'Agence Nationale des Allocations et Bourses pour renforcer le soutien financier aux étudiants nigériens.',
    icon: 'Award',
    color: 'orange',
    order: 4,
    created_at: now, updated_at: now, published_at: now,
  },
  {
    document_id: randomUUID(),
    year: '2024',
    title: 'Transformation Numérique',
    content: 'Lancement du plan stratégique de transformation numérique du système d\'enseignement supérieur et de recherche du Niger.',
    icon: 'Cpu',
    color: 'blue',
    order: 5,
    created_at: now, updated_at: now, published_at: now,
  },
].forEach(item => insert('history_milestones', item, 'year'));

/* ──────────────────────────────────────────────────────────────
   3. PAGE MINISTÈRE (Single Type — 1 seule entrée)
────────────────────────────────────────────────────────────── */
console.log('\n=== Page Ministère (Single Type) ===');
const mpExists = db.prepare('SELECT id FROM ministry_page LIMIT 1').get();
if (mpExists) {
  console.log('  ↷  [ministry_page] déjà existant');
  skipped++;
} else {
  db.prepare(`
    INSERT INTO ministry_page
      (document_id, hero_title, hero_subtitle, hero_description,
       mission_content, organisation_content, direction_content,
       created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(),
    'Le Ministère',
    'Enseignement Supérieur, Recherche et Innovation',
    'Au service de l\'excellence académique et de l\'innovation pour construire l\'avenir de l\'enseignement supérieur au Niger avec une vision moderne et inclusive.',
    'Promouvoir l\'excellence dans l\'enseignement supérieur et la recherche au Niger par des programmes innovants, une coopération internationale renforcée et une vision stratégique claire pour l\'avenir de l\'éducation.',
    'Structure organisationnelle moderne composée d\'un cabinet ministériel, d\'un secrétariat général, de directions centrales et d\'établissements sous tutelle œuvrant collectivement pour l\'excellence académique.',
    'Une équipe de direction composée d\'experts et de hauts fonctionnaires dévoués qui guident le ministère vers l\'excellence, l\'innovation et la transformation du secteur de l\'enseignement supérieur.',
    now, now
  );
  console.log('  ✓  [ministry_page] créé');
  created++;
}

/* ──────────────────────────────────────────────────────────────
   4. UNITÉS ORGANISATIONNELLES
   (remplace l'ancien jeu de données générique par le contenu réel
   précédemment codé en dur dans src/pages/ministere/organisation.js)
────────────────────────────────────────────────────────────── */
console.log('\n=== Unités Organisationnelles ===');

// Nettoyage ponctuel des entrées génériques d'une précédente version de ce seed
const OLD_PLACEHOLDER_NAMES = [
  'Cabinet du Ministre', 'Secrétariat Général', 'Direction Générale des Enseignements',
  'Direction Générale de la Recherche et de l\'Innovation Technologique',
  'Direction des Ressources Humaines', 'Direction des Affaires Financières',
  'Direction des Affaires Juridiques', 'ANAB', 'ANAQ-SUP', 'OBEECS',
  'Université Abdou Moumouni de Niamey', 'Université de Zinder', 'Université de Tahoua',
  'Université Dan Dicko DanKoulodo de Maradi',
];
const deleteOldUnit = db.prepare('DELETE FROM "organizational_units" WHERE "name" = ?');
OLD_PLACEHOLDER_NAMES.forEach(name => {
  const { changes } = deleteOldUnit.run(name);
  if (changes > 0) console.log(`  ✗  [organizational_units] supprimé (ancien placeholder) "${name}"`);
});

[
  { document_id: randomUUID(), name: 'Conseillers Techniques', type: 'cabinet', description: null, order: 0, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Responsable de la communication', type: 'cabinet', description: null, order: 1, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Chef de Cabinet', type: 'cabinet', description: null, order: 2, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Attaché de Protocole', type: 'cabinet', description: null, order: 3, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Secrétaire Particulier', type: 'cabinet', description: null, order: 4, created_at: now, updated_at: now, published_at: now },

  { document_id: randomUUID(), name: 'Attachés académiques', type: 'sg_direct', description: null, order: 0, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Cellule Santé Universitaire et des Grandes Écoles', type: 'sg_direct', description: null, order: 1, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Cellule Genre', type: 'sg_direct', description: null, order: 2, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Bureau d\'Ordre', type: 'sg_direct', description: null, order: 3, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Secrétariat', type: 'sg_direct', description: null, order: 4, created_at: now, updated_at: now, published_at: now },

  { document_id: randomUUID(), name: 'Direction de l\'Enseignement Supérieur Public (DESP)', type: 'dge', description: null, order: 0, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction de l\'Enseignement Supérieur Privé (DESPRI)', type: 'dge', description: null, order: 1, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Sports et des Activités Culturelles Universitaires et des Grandes Écoles (DSAC/U/GE)', type: 'dge', description: null, order: 2, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction de l\'Enseignement Supérieur Arabe (DESA)', type: 'dge', description: null, order: 3, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction de l\'Orientation et du Suivi du Cursus des Étudiants (DOSCE)', type: 'dge', description: null, order: 4, created_at: now, updated_at: now, published_at: now },

  { document_id: randomUUID(), name: 'Direction de la Recherche (DR)', type: 'dgrit', description: null, order: 0, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction de l\'Innovation Technologique (DIT)', type: 'dgrit', description: null, order: 1, created_at: now, updated_at: now, published_at: now },

  { document_id: randomUUID(), name: 'Direction des Études et de la Programmation (DEP)', type: 'centrales', description: null, order: 0, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Ressources Humaines (DRH)', type: 'centrales', description: null, order: 1, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Ressources Financières et du Matériel (DRFM)', type: 'centrales', description: null, order: 2, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Marchés Publics et de Délégation de Service Public (DMP/DSP)', type: 'centrales', description: null, order: 3, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Statistiques et de l\'Informatique (DSI)', type: 'centrales', description: null, order: 4, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction de la Législation (DL)', type: 'centrales', description: null, order: 5, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Archives, de l\'Information, de la Documentation et des Relations Publiques (DAIDRP)', type: 'centrales', description: null, order: 6, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Infrastructures et Équipements Universitaires (DIEU)', type: 'centrales', description: null, order: 7, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Direction des Affaires Financières et du Matériel (DAF)', type: 'centrales', description: null, order: 8, created_at: now, updated_at: now, published_at: now },

  { document_id: randomUUID(), name: 'Agence Nigérienne des Allocations et des Bourses (ANAB)', type: 'rattaches', description: null, order: 0, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Agence Nationale pour l\'Assurance Qualité de l\'Enseignement Supérieur et de la Recherche (ANAQ-Sup)', type: 'rattaches', description: null, order: 1, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Centres Régionaux des Œuvres Universitaires (CROU)', type: 'rattaches', description: null, order: 2, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Office du Baccalauréat, des Équivalences et des Examens et Concours du Supérieur (OBEECS)', type: 'rattaches', description: null, order: 3, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Académie des Sciences du Niger (ASNI)', type: 'rattaches', description: null, order: 4, created_at: now, updated_at: now, published_at: now },

  { document_id: randomUUID(), name: 'Université Abdou Moumouni de Niamey (UAM)', type: 'etablissements', description: null, order: 0, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université Numérique du Niger (UNN)', type: 'etablissements', description: null, order: 1, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université Dan Dicko Dankoulodo de Maradi (UDDM)', type: 'etablissements', description: null, order: 2, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université Djibo Hamani de Tahoua (UDH)', type: 'etablissements', description: null, order: 3, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université André Salifou de Zinder (UAS)', type: 'etablissements', description: null, order: 4, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université Boubacar Bah de Tillabéry (UBBA)', type: 'etablissements', description: null, order: 5, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université de Dosso (UDO)', type: 'etablissements', description: null, order: 6, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université d\'Agadez (UAZ)', type: 'etablissements', description: null, order: 7, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université de Diffa (UDA)', type: 'etablissements', description: null, order: 8, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'Université Islamique au Niger (UIN)', type: 'etablissements', description: null, order: 9, created_at: now, updated_at: now, published_at: now },
  { document_id: randomUUID(), name: 'École des Mines de l\'Industrie et de la Géologie (EMIG)', type: 'etablissements', description: null, order: 10, created_at: now, updated_at: now, published_at: now },
].forEach(item => insert('organizational_units', item, 'name'));

/* ──────────────────────────────────────────────────────────────
   5. SERVICES ÉTUDIANTS (category = etudiants)
────────────────────────────────────────────────────────────── */
console.log('\n=== Services Étudiants ===');
const existingEtudiants = db.prepare("SELECT COUNT(*) as n FROM services WHERE category = 'etudiants'").get();
if (existingEtudiants.n > 0) {
  console.log(`  ↷  [services] ${existingEtudiants.n} services étudiants déjà présents — skip`);
  skipped += existingEtudiants.n;
} else {
  [
    {
      document_id: randomUUID(),
      title: 'Bourses et Aides Financières',
      description: 'Informations sur les bourses nationales et internationales disponibles pour les étudiants nigériens.',
      icon: 'Award',
      category: 'etudiants',
      priority: 0,
      is_external: 0,
      contact_name: 'ANAB - Agence Nationale des Allocations et Bourses',
      contact_phone: '+227 20 72 35 48',
      contact_email: 'info@anab.ne',
      details: JSON.stringify(["Bourses d'excellence académique", "Aides sociales pour étudiants en difficulté", "Bourses de mobilité internationale", "Prêts étudiants à taux préférentiel"]),
      created_at: now, updated_at: now, published_at: now,
    },
    {
      document_id: randomUUID(),
      title: 'Logement Universitaire',
      description: 'Hébergement dans les cités universitaires et résidences conventionnées.',
      icon: 'Home',
      category: 'etudiants',
      priority: 1,
      is_external: 0,
      contact_name: 'CROU - Centre Régional des Œuvres Universitaires',
      contact_phone: '+227 20 73 42 15',
      contact_email: 'logement@crou.ne',
      details: JSON.stringify(["Cités universitaires publiques", "Résidences privées conventionnées", "Aide à la recherche de logement", "Médiation locataire-propriétaire"]),
      created_at: now, updated_at: now, published_at: now,
    },
    {
      document_id: randomUUID(),
      title: 'Restauration Universitaire',
      description: 'Services de restauration subventionnés dans les campus universitaires.',
      icon: 'Utensils',
      category: 'etudiants',
      priority: 2,
      is_external: 0,
      contact_name: 'CROU - Centre Régional des Œuvres Universitaires',
      contact_phone: '+227 20 73 42 15',
      contact_email: 'restauration@crou.ne',
      details: JSON.stringify(["Restaurants universitaires subventionnés", "Tickets restaurant à tarif étudiant", "Cafétérias sur les campus", "Services de catering pour événements"]),
      created_at: now, updated_at: now, published_at: now,
    },
    {
      document_id: randomUUID(),
      title: 'Santé et Bien-être',
      description: 'Services médicaux et de soutien psychologique pour les étudiants.',
      icon: 'Heart',
      category: 'etudiants',
      priority: 3,
      is_external: 0,
      contact_name: 'Service de Santé Universitaire',
      contact_phone: '+227 20 73 28 94',
      contact_email: 'sante@mesrit.gov.ne',
      details: JSON.stringify(["Centres de santé universitaires", "Consultations médicales gratuites", "Pharmacie universitaire", "Soutien psychologique et conseil"]),
      created_at: now, updated_at: now, published_at: now,
    },
    {
      document_id: randomUUID(),
      title: 'Transport et Mobilité',
      description: 'Solutions de transport pour faciliter les déplacements des étudiants.',
      icon: 'MapPin',
      category: 'etudiants',
      priority: 4,
      is_external: 0,
      contact_name: 'Service des Transports Universitaires',
      contact_phone: '+227 20 73 51 67',
      contact_email: 'transport@mesrit.gov.ne',
      details: JSON.stringify(["Bus universitaires gratuits", "Réductions sur les transports publics", "Covoiturage étudiant organisé", "Stationnement vélos sécurisé"]),
      created_at: now, updated_at: now, published_at: now,
    },
    {
      document_id: randomUUID(),
      title: 'Orientation et Conseil',
      description: "Accompagnement dans les choix d'études et l'insertion professionnelle.",
      icon: 'BookOpen',
      category: 'etudiants',
      priority: 5,
      is_external: 0,
      contact_name: "DOSCE - Direction de l'Orientation et du Suivi du Cursus Étudiant",
      contact_phone: '+227 20 73 19 83',
      contact_email: 'orientation@mesrit.gov.ne',
      details: JSON.stringify(["Conseil d'orientation académique", "Aide à l'insertion professionnelle", "Ateliers de développement personnel", "Mentorat par des anciens étudiants"]),
      created_at: now, updated_at: now, published_at: now,
    },
  ].forEach(item => insert('services', item, 'title'));
}

db.close();

console.log(`\n${'─'.repeat(50)}`);
console.log(`Seed terminé : ${created} créés, ${skipped} ignorés`);
console.log(`${'─'.repeat(50)}\n`);
