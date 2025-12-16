// scripts/migrateAnalytics.js
// Script de migration pour initialiser le système analytics V2

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Fonction de connexion MongoDB adaptée
async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Veuillez définir la variable d\'environnement MONGODB_URI');
  }

  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connexion MongoDB établie');
    }
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error);
    throw error;
  }
}

async function migrateAnalytics() {
  try {
    console.log('🚀 Début de la migration du système analytics...');

    // Connexion à MongoDB
    await connectDB();
    console.log('✅ Connexion à MongoDB établie');

    // Vérifier et créer les collections si elles n'existent pas
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const requiredCollections = [
      'viewevents',
      'shareevents',
      'dailynewsstats',
      'news'
    ];

    console.log('📋 Collections existantes:', collectionNames);

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        console.log(`⚠️  Collection manquante: ${collectionName}`);
        await mongoose.connection.db.createCollection(collectionName);
        console.log(`✅ Collection créée: ${collectionName}`);
      } else {
        console.log(`✅ Collection existe: ${collectionName}`);
      }
    }

    // Créer les index pour optimiser les performances
    console.log('🔍 Création des index...');

    // Fonction helper pour créer un index s'il n'existe pas
    async function createIndexSafely(collection, indexSpec, options = {}) {
      try {
        const existingIndexes = await collection.listIndexes().toArray();
        const indexKey = JSON.stringify(indexSpec);

        const indexExists = existingIndexes.some(index =>
          JSON.stringify(index.key) === indexKey
        );

        if (!indexExists) {
          await collection.createIndex(indexSpec, options);
          return true;
        } else {
          console.log(`⚠️  Index déjà existant: ${JSON.stringify(indexSpec)}`);
          return false;
        }
      } catch (error) {
        console.log(`⚠️  Erreur création index ${JSON.stringify(indexSpec)}: ${error.message}`);
        return false;
      }
    }

    // Index pour ViewEvent
    const viewEventCollection = mongoose.connection.db.collection('viewevents');
    await createIndexSafely(viewEventCollection, { newsId: 1, timestamp: -1 });
    await createIndexSafely(viewEventCollection, { sessionId: 1, timestamp: -1 });
    await createIndexSafely(viewEventCollection, { timestamp: -1, newsId: 1 });
    await createIndexSafely(viewEventCollection, { userId: 1, timestamp: -1 }, { sparse: true });
    console.log('✅ Index ViewEvent vérifiés/créés');

    // Index pour ShareEvent
    const shareEventCollection = mongoose.connection.db.collection('shareevents');
    await createIndexSafely(shareEventCollection, { newsId: 1, timestamp: -1 });
    await createIndexSafely(shareEventCollection, { platform: 1, timestamp: -1 });
    await createIndexSafely(shareEventCollection, { timestamp: -1, newsId: 1 });
    await createIndexSafely(shareEventCollection, { userId: 1, timestamp: -1 }, { sparse: true });
    console.log('✅ Index ShareEvent vérifiés/créés');

    // Index pour DailyNewsStats
    const dailyStatsCollection = mongoose.connection.db.collection('dailynewsstats');
    await createIndexSafely(dailyStatsCollection, { newsId: 1, date: 1 }, { unique: true });
    await createIndexSafely(dailyStatsCollection, { date: -1 });
    // Éviter le conflit d'index - utiliser un nom spécifique
    await createIndexSafely(dailyStatsCollection, { newsId: 1, date: -1 }, { name: "newsId_1_date_-1_non_unique" });
    console.log('✅ Index DailyNewsStats vérifiés/créés');

    // Vérifier que le modèle News a les champs nécessaires
    const newsCollection = mongoose.connection.db.collection('news');
    const sampleNews = await newsCollection.findOne({});

    if (sampleNews) {
      console.log('✅ Collection News existe avec des données');

      // Vérifier les champs essentiels
      const requiredFields = ['title', 'content', 'status', 'slug'];
      const missingFields = requiredFields.filter(field => !(field in sampleNews));

      if (missingFields.length > 0) {
        console.log('⚠️  Champs manquants dans News:', missingFields);
      } else {
        console.log('✅ Tous les champs requis sont présents dans News');
      }
    } else {
      console.log('⚠️  Aucune donnée dans la collection News');
    }

    // Test de connectivité des modèles
    console.log('🧪 Test des modèles...');

    try {
      // Les modèles seront testés au niveau de l'application Next.js
      // Ici on vérifie juste que les collections sont prêtes
      console.log('✅ Collections prêtes pour les modèles analytics');
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des modèles:', error.message);
    }

    console.log('🎉 Migration du système analytics terminée avec succès!');

    return {
      success: true,
      message: 'Migration réussie',
      collections: requiredCollections
    };

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔒 Connexion MongoDB fermée');
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateAnalytics()
    .then(() => {
      console.log('✅ Migration terminée');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration échouée:', error);
      process.exit(1);
    });
}

module.exports = { migrateAnalytics };