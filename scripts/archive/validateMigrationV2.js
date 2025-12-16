// scripts/validateMigrationV2.js
// Script de validation de la migration vers le système V2

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Fonction de connexion MongoDB adaptée
async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Veuillez definir la variable d environnement MONGODB_URI');
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

async function validateMigrationV2() {
  try {
    console.log('🔍 Début de la validation de la migration V2...');

    // Connexion à MongoDB
    await connectDB();

    // 1. Vérifier les collections V2
    console.log('\n📋 Vérification des collections V2...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const requiredCollections = [
      'viewevents',
      'shareevents',
      'dailynewsstats',
      'news'
    ];

    const migrationStatus = {
      collections: {},
      indexes: {},
      data: {},
      overall: 'PENDING'
    };

    for (const collectionName of requiredCollections) {
      if (collectionNames.includes(collectionName)) {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        migrationStatus.collections[collectionName] = {
          exists: true,
          documents: count,
          status: count > 0 ? 'HAS_DATA' : 'EMPTY'
        };
        console.log(`  ✅ ${collectionName}: ${count} documents`);
      } else {
        migrationStatus.collections[collectionName] = {
          exists: false,
          documents: 0,
          status: 'MISSING'
        };
        console.log(`  ❌ ${collectionName}: collection manquante`);
      }
    }

    // 2. Vérifier les index V2
    console.log('\n🔍 Vérification des index V2...');

    for (const collectionName of requiredCollections) {
      if (collectionNames.includes(collectionName)) {
        const collection = mongoose.connection.db.collection(collectionName);
        const indexes = await collection.listIndexes().toArray();
        migrationStatus.indexes[collectionName] = {
          count: indexes.length,
          indexes: indexes.map(idx => idx.name),
          status: indexes.length > 1 ? 'OPTIMIZED' : 'BASIC'
        };
        console.log(`  ✅ ${collectionName}: ${indexes.length} index(es)`);
      }
    }

    // 3. Vérifier la structure des données
    console.log('\n📊 Vérification de la structure des données...');

    // Vérifier ViewEvent
    if (collectionNames.includes('viewevents')) {
      const viewEvents = mongoose.connection.db.collection('viewevents');
      const sampleViewEvent = await viewEvents.findOne({});
      if (sampleViewEvent) {
        const hasRequiredFields = ['newsId', 'timestamp', 'sessionId'].every(field =>
          sampleViewEvent.hasOwnProperty(field)
        );
        migrationStatus.data.viewevents = {
          hasData: true,
          hasValidStructure: hasRequiredFields,
          status: hasRequiredFields ? 'VALID' : 'INVALID_STRUCTURE'
        };
        console.log(`  ✅ ViewEvent: structure ${hasRequiredFields ? 'valide' : 'invalide'}`);
      } else {
        migrationStatus.data.viewevents = { hasData: false, status: 'NO_DATA' };
        console.log('  ⚠️  ViewEvent: aucune donnée');
      }
    }

    // Vérifier ShareEvent
    if (collectionNames.includes('shareevents')) {
      const shareEvents = mongoose.connection.db.collection('shareevents');
      const sampleShareEvent = await shareEvents.findOne({});
      if (sampleShareEvent) {
        const hasRequiredFields = ['newsId', 'timestamp', 'platform'].every(field =>
          sampleShareEvent.hasOwnProperty(field)
        );
        migrationStatus.data.shareevents = {
          hasData: true,
          hasValidStructure: hasRequiredFields,
          status: hasRequiredFields ? 'VALID' : 'INVALID_STRUCTURE'
        };
        console.log(`  ✅ ShareEvent: structure ${hasRequiredFields ? 'valide' : 'invalide'}`);
      } else {
        migrationStatus.data.shareevents = { hasData: false, status: 'NO_DATA' };
        console.log('  ⚠️  ShareEvent: aucune donnée');
      }
    }

    // 4. Calculer le statut général
    const allCollectionsExist = requiredCollections.every(name =>
      migrationStatus.collections[name].exists
    );

    const hasAnalyticsData = migrationStatus.collections.viewevents?.documents > 0 ||
                            migrationStatus.collections.shareevents?.documents > 0;

    if (allCollectionsExist && hasAnalyticsData) {
      migrationStatus.overall = 'COMPLETED';
    } else if (allCollectionsExist) {
      migrationStatus.overall = 'READY_FOR_DATA';
    } else {
      migrationStatus.overall = 'INCOMPLETE';
    }

    // 5. Rapport final
    console.log('\n📋 RAPPORT DE VALIDATION V2');
    console.log('=====================================');
    console.log(`Statut général: ${migrationStatus.overall}`);
    console.log(`Collections créées: ${Object.values(migrationStatus.collections).filter(c => c.exists).length}/${requiredCollections.length}`);
    console.log(`Index optimisés: ${Object.values(migrationStatus.indexes).filter(i => i.status === 'OPTIMIZED').length}/${requiredCollections.length}`);

    const totalDocs = Object.values(migrationStatus.collections).reduce((sum, c) => sum + c.documents, 0);
    console.log(`Documents analytics: ${totalDocs}`);

    // 6. Recommandations
    console.log('\n🎯 RECOMMANDATIONS:');

    switch (migrationStatus.overall) {
      case 'COMPLETED':
        console.log('✅ Migration V2 terminée avec succès!');
        console.log('🔄 Vous pouvez maintenant utiliser le système analytics V2');
        break;

      case 'READY_FOR_DATA':
        console.log('⚠️  Infrastructure V2 prête, mais aucune donnée analytics');
        console.log('🚀 Commencez à utiliser l\'application pour générer des données');
        break;

      case 'INCOMPLETE':
        console.log('❌ Migration incomplète');
        console.log('🔧 Exécutez: node scripts/migrateAnalytics.js');
        break;
    }

    return migrationStatus;

  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error);
    throw error;
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔒 Connexion MongoDB fermée');
  }
}

// Exécuter la validation si le script est appelé directement
if (require.main === module) {
  validateMigrationV2()
    .then((status) => {
      console.log(`\n✅ Validation terminée - Statut: ${status.overall}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Validation échouée:', error);
      process.exit(1);
    });
}

module.exports = { validateMigrationV2 };