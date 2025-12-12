// scripts/testChatbotDirectors.cjs
// Script de test pour vérifier que le chatbot trouve les infos des directeurs

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
  relevanceScore: { type: Number, default: 1.0, min: 0, max: 10 }
}, { timestamps: true, collection: 'pagecontents' });

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
 * Tests de recherche
 */
const testQueries = [
  {
    name: "Recherche 'ministre'",
    query: "ministre",
    expectedKeywords: ["ministre", "cabinet"]
  },
  {
    name: "Recherche 'équipe dirigeante'",
    query: "équipe dirigeante",
    expectedKeywords: ["équipe", "dirigeante", "direction"]
  },
  {
    name: "Recherche 'secrétaire général'",
    query: "secrétaire général",
    expectedKeywords: ["secrétaire", "général", "sg"]
  },
  {
    name: "Recherche 'DGES'",
    query: "DGES",
    expectedKeywords: ["dges", "enseignement"]
  },
  {
    name: "Recherche 'directeur recherche'",
    query: "directeur recherche",
    expectedKeywords: ["directeur", "recherche", "dgr"]
  },
  {
    name: "Recherche 'Saidou Mamadou'",
    query: "Saidou Mamadou",
    expectedKeywords: ["saidou", "mamadou", "ministre"]
  }
];

/**
 * Effectuer un test de recherche
 */
async function testSearch(testCase) {
  console.log(`\n[Test] ${testCase.name}`);
  console.log(`[Query] "${testCase.query}"`);

  const results = await PageContent.find({
    $text: { $search: testCase.query },
    section: 'ministere',
    isActive: true
  })
    .select('title url keywords relevanceScore')
    .limit(3)
    .sort({ score: { $meta: 'textScore' }, relevanceScore: -1 })
    .lean();

  if (results.length === 0) {
    console.log('  ❌ Aucun résultat trouvé');
    return false;
  }

  console.log(`  ✅ ${results.length} résultat(s) trouvé(s)`);

  results.forEach((result, index) => {
    console.log(`\n  [${index + 1}] ${result.title}`);
    console.log(`      URL: ${result.url}`);
    console.log(`      Score: ${result.relevanceScore}`);

    // Vérifier si les mots-clés attendus sont présents
    const foundKeywords = testCase.expectedKeywords.filter(kw =>
      result.keywords.some(k => k.toLowerCase().includes(kw.toLowerCase()))
    );

    if (foundKeywords.length > 0) {
      console.log(`      Keywords match: ✅ [${foundKeywords.join(', ')}]`);
    } else {
      console.log(`      Keywords match: ⚠️  Aucun mot-clé attendu trouvé`);
    }
  });

  return true;
}

/**
 * Statistiques générales
 */
async function displayStats() {
  console.log('\n═══════════════════════════════════════');
  console.log('   STATISTIQUES');
  console.log('═══════════════════════════════════════\n');

  // Total de pages de directeurs
  const totalDirectors = await PageContent.countDocuments({
    section: 'ministere',
    url: { $regex: /\/ministere\/direction/ },
    isActive: true
  });

  console.log(`📊 Total de pages de directeurs actives: ${totalDirectors}`);

  // Page de synthèse
  const synthese = await PageContent.findOne({
    url: { $regex: /\/direction$/ },
    isActive: true
  }).select('title relevanceScore').lean();

  if (synthese) {
    console.log(`📄 Page de synthèse: "${synthese.title}" (score: ${synthese.relevanceScore})`);
  }

  // Scores de pertinence
  const scores = await PageContent.aggregate([
    {
      $match: {
        section: 'ministere',
        url: { $regex: /\/ministere\/direction/ },
        isActive: true
      }
    },
    {
      $group: {
        _id: '$relevanceScore',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);

  console.log(`\n📈 Distribution des scores de pertinence:`);
  scores.forEach(s => {
    console.log(`   Score ${s._id}: ${s.count} page(s)`);
  });
}

/**
 * Fonction principale
 */
async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('   TEST CHATBOT - DIRECTEURS');
  console.log('═══════════════════════════════════════\n');

  try {
    await connectDB();

    // Afficher les statistiques
    await displayStats();

    // Effectuer les tests
    console.log('\n═══════════════════════════════════════');
    console.log('   TESTS DE RECHERCHE');
    console.log('═══════════════════════════════════════');

    let successCount = 0;
    let failCount = 0;

    for (const testCase of testQueries) {
      const success = await testSearch(testCase);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Résumé
    console.log('\n═══════════════════════════════════════');
    console.log('   RÉSUMÉ DES TESTS');
    console.log('═══════════════════════════════════════\n');

    const total = testQueries.length;
    const successRate = Math.round((successCount / total) * 100);

    console.log(`Total de tests: ${total}`);
    console.log(`✅ Réussis: ${successCount}`);
    console.log(`❌ Échoués: ${failCount}`);
    console.log(`📊 Taux de réussite: ${successRate}%`);

    if (successRate === 100) {
      console.log('\n🎉 Tous les tests sont passés ! Le chatbot peut trouver les informations sur l\'équipe dirigeante.\n');
    } else if (successRate >= 80) {
      console.log('\n✅ La plupart des tests sont passés. Le chatbot devrait fonctionner correctement.\n');
    } else {
      console.log('\n⚠️  Attention : Plusieurs tests ont échoué. Vérifiez l\'indexation.\n');
    }

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
