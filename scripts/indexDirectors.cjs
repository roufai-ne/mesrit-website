// scripts/indexDirectors.cjs
// Script pour indexer les données des directeurs dans PageContent
// pour que le chatbot puisse les trouver

require('dotenv').config();
const mongoose = require('mongoose');

/**
 * Connexion MongoDB
 */
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI non défini dans .env');
  }

  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  console.log('[MongoDB] Connecté');
}

/**
 * Modèle Director
 */
const DirectorSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  nom: { type: String, required: true },
  photo: { type: String },
  email: { type: String },
  telephone: { type: String },
  message: String,
  key: String,
  nomComplet: String,
  responsable: String,
  mission: String,
  direction: String
}, { timestamps: true });

const Director = mongoose.models.Director || mongoose.model('Director', DirectorSchema);

/**
 * Modèle PageContent
 */
const PageContentSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  section: { type: String, trim: true, default: 'general' },
  keywords: [{ type: String, trim: true }],
  description: { type: String, trim: true },
  lastCrawled: { type: Date, default: Date.now, index: true },
  isActive: { type: Boolean, default: true, index: true },
  referenceCount: { type: Number, default: 0 },
  relevanceScore: { type: Number, default: 1.0, min: 0, max: 10 },
  crawlMetadata: {
    statusCode: Number,
    contentLength: Number,
    crawlDuration: Number
  }
}, { timestamps: true, collection: 'pagecontents' });

// Index text search
PageContentSchema.index({
  title: 'text',
  content: 'text',
  description: 'text',
  keywords: 'text'
}, {
  weights: { title: 10, keywords: 8, description: 5, content: 1 },
  name: 'page_text_search',
  default_language: 'french'
});

const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema);

/**
 * Générer le contenu textuel pour un directeur
 */
function generateDirectorContent(director) {
  const parts = [];

  // Informations de base
  parts.push(`${director.titre}: ${director.nom}`);

  if (director.nomComplet) {
    parts.push(`Nom complet du poste: ${director.nomComplet}`);
  }

  if (director.key) {
    parts.push(`Clé: ${director.key}`);
  }

  if (director.direction) {
    parts.push(`Direction de rattachement: ${director.direction}`);
  }

  if (director.responsable) {
    parts.push(`Responsable: ${director.responsable}`);
  }

  // Mission
  if (director.mission) {
    parts.push(`Mission: ${director.mission}`);
  }

  // Message
  if (director.message) {
    parts.push(`Message: ${director.message}`);
  }

  // Contact
  if (director.email) {
    parts.push(`Email: ${director.email}`);
  }

  if (director.telephone) {
    parts.push(`Téléphone: ${director.telephone}`);
  }

  return parts.join('\n\n');
}

/**
 * Générer les mots-clés pour un directeur
 */
function generateDirectorKeywords(director) {
  const keywords = new Set();

  // Nom
  const nomParts = director.nom.split(' ');
  nomParts.forEach(part => keywords.add(part.toLowerCase()));

  // Titre
  const titreParts = director.titre.split(' ');
  titreParts.forEach(part => keywords.add(part.toLowerCase()));

  // Key
  if (director.key) {
    keywords.add(director.key.toLowerCase());
  }

  // Direction
  if (director.direction) {
    keywords.add(director.direction.toLowerCase());
  }

  // Mots-clés génériques
  keywords.add('direction');
  keywords.add('équipe');
  keywords.add('dirigeante');
  keywords.add('ministere');
  keywords.add('mesrit');

  // Mots-clés spécifiques selon le titre
  if (director.titre.toLowerCase().includes('ministre')) {
    keywords.add('ministre');
    keywords.add('cabinet');
  }

  if (director.titre.toLowerCase().includes('secrétaire général')) {
    keywords.add('secrétaire');
    keywords.add('général');
    keywords.add('sg');
  }

  if (director.titre.toLowerCase().includes('directeur général')) {
    keywords.add('directeur');
    keywords.add('général');
    keywords.add('dg');
  }

  return Array.from(keywords).filter(k => k.length > 2);
}

/**
 * Indexer un directeur
 */
async function indexDirector(director, baseUrl) {
  const startTime = Date.now();

  // URL de la page
  const url = `${baseUrl}/ministere/direction/${director._id}`;

  // Générer le contenu
  const content = generateDirectorContent(director);
  const keywords = generateDirectorKeywords(director);

  // Description
  const description = director.mission
    ? director.mission.substring(0, 200)
    : `${director.titre} du MESRIT - ${director.nom}`;

  // Créer ou mettre à jour
  await PageContent.findOneAndUpdate(
    { url },
    {
      url,
      title: `${director.titre} - ${director.nom}`,
      content,
      section: 'ministere',
      keywords,
      description,
      lastCrawled: new Date(),
      isActive: true,
      relevanceScore: 3.0, // Score élevé pour l'équipe dirigeante
      crawlMetadata: {
        statusCode: 200,
        contentLength: content.length,
        crawlDuration: Date.now() - startTime
      }
    },
    { upsert: true, new: true }
  );

  console.log(`[Index] ✅ ${director.titre} - ${director.nom}`);
}

/**
 * Créer une page de synthèse de l'équipe dirigeante
 */
async function createTeamSummaryPage(directors, baseUrl) {
  const startTime = Date.now();

  const url = `${baseUrl}/ministere/direction`;

  // Organiser les directeurs par catégorie
  const ministre = directors.find(d => d.titre.toLowerCase().includes('ministre'));
  const sg = directors.find(d => d.key === 'SG');
  const sga = directors.find(d => d.key === 'SGA');
  const dgs = directors.filter(d => ['DGES', 'DGR'].includes(d.key));
  const sousDirections = directors.filter(d => d.direction);

  // Générer le contenu de synthèse
  const contentParts = [
    'ÉQUIPE DIRIGEANTE DU MESRIT',
    '',
    'Organisation hiérarchique du Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation Technologique.',
    ''
  ];

  // Cabinet du Ministre
  if (ministre) {
    contentParts.push('=== CABINET DU MINISTRE ===');
    contentParts.push(`${ministre.titre}: ${ministre.nom}`);
    if (ministre.message) {
      contentParts.push(`Message: ${ministre.message}`);
    }
    if (ministre.email) contentParts.push(`Contact: ${ministre.email}`);
    contentParts.push('');
  }

  // Secrétariat Général
  if (sg) {
    contentParts.push('=== SECRÉTARIAT GÉNÉRAL ===');
    contentParts.push(`${sg.titre}: ${sg.nom}`);
    if (sg.mission) contentParts.push(`Mission: ${sg.mission}`);
    if (sg.email) contentParts.push(`Contact: ${sg.email}`);
    contentParts.push('');

    if (sga) {
      contentParts.push(`Secrétaire Général Adjoint: ${sga.nom}`);
      if (sga.mission) contentParts.push(`Mission: ${sga.mission}`);
      contentParts.push('');
    }
  }

  // Directions Générales
  if (dgs.length > 0) {
    contentParts.push('=== DIRECTIONS GÉNÉRALES ===');
    dgs.forEach(dg => {
      contentParts.push(`${dg.titre}: ${dg.nom}`);
      if (dg.nomComplet) contentParts.push(`  ${dg.nomComplet}`);
      if (dg.mission) contentParts.push(`  Mission: ${dg.mission}`);
      if (dg.email) contentParts.push(`  Contact: ${dg.email}`);
      contentParts.push('');
    });
  }

  // Sous-directions
  if (sousDirections.length > 0) {
    contentParts.push('=== DIRECTIONS ET SOUS-DIRECTIONS ===');

    // Grouper par direction
    const groupedByDirection = sousDirections.reduce((acc, sd) => {
      if (!acc[sd.direction]) {
        acc[sd.direction] = [];
      }
      acc[sd.direction].push(sd);
      return acc;
    }, {});

    Object.entries(groupedByDirection).forEach(([directionKey, dirs]) => {
      contentParts.push(`Rattachement: ${directionKey}`);
      dirs.forEach(dir => {
        contentParts.push(`  - ${dir.nomComplet || dir.titre}`);
        if (dir.responsable) contentParts.push(`    Responsable: ${dir.responsable}`);
        if (dir.mission) contentParts.push(`    Mission: ${dir.mission}`);
      });
      contentParts.push('');
    });
  }

  const content = contentParts.join('\n');

  // Keywords
  const keywords = [
    'équipe', 'dirigeante', 'direction', 'ministere', 'mesrit',
    'ministre', 'secrétaire', 'général', 'directeur',
    'organisation', 'structure', 'hiérarchie',
    'cabinet', 'dges', 'dgr', 'sg', 'sga'
  ];

  // Description
  const description = `Équipe dirigeante du MESRIT: Cabinet du Ministre, Secrétariat Général, Directions Générales et Sous-Directions. ${directors.length} membres au total.`;

  await PageContent.findOneAndUpdate(
    { url },
    {
      url,
      title: 'Équipe Dirigeante - Direction du MESRIT',
      content,
      section: 'ministere',
      keywords,
      description,
      lastCrawled: new Date(),
      isActive: true,
      relevanceScore: 5.0, // Score très élevé pour la page principale
      crawlMetadata: {
        statusCode: 200,
        contentLength: content.length,
        crawlDuration: Date.now() - startTime
      }
    },
    { upsert: true, new: true }
  );

  console.log(`[Index] ✅ Page de synthèse de l'équipe dirigeante`);
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('   INDEXATION DES DIRECTEURS');
  console.log('═══════════════════════════════════════\n');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://site.mesrit.com';
  console.log(`[Config] Base URL: ${baseUrl}`);

  try {
    // Connexion
    await connectDB();

    // Récupérer tous les directeurs
    const directors = await Director.find().sort({ ordre: 1 }).lean();
    console.log(`[Info] ${directors.length} directeurs trouvés dans la base\n`);

    if (directors.length === 0) {
      console.log('⚠️  Aucun directeur à indexer');
      return;
    }

    // Indexer chaque directeur
    for (const director of directors) {
      await indexDirector(director, baseUrl);
      await new Promise(resolve => setTimeout(resolve, 100)); // Petite pause
    }

    // Créer la page de synthèse
    await createTeamSummaryPage(directors, baseUrl);

    // Statistiques
    const activePages = await PageContent.countDocuments({
      isActive: true,
      section: 'ministere',
      url: { $regex: /\/ministere\/direction/ }
    });

    console.log('\n═══════════════════════════════════════');
    console.log('   INDEXATION TERMINÉE');
    console.log('═══════════════════════════════════════');
    console.log(`✅ ${directors.length} directeurs indexés`);
    console.log(`✅ 1 page de synthèse créée`);
    console.log(`📊 ${activePages} pages actives au total`);
    console.log('\n💡 Le chatbot peut maintenant répondre aux questions sur l\'équipe dirigeante!\n');

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    throw error;
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('[MongoDB] Connexion fermée');
    }
  }
}

// Exécuter
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { main };
