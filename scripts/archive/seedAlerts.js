// src/scripts/seedAlerts.js
// Script pour initialiser des alertes par défaut
/* eslint-disable @typescript-eslint/no-require-imports */

const { connectDB } = require('../lib/mongodb');
const Alert = require('../models/Alert').default;

async function seedAlerts() {
  try {
    await connectDB();
    console.log('🔄 Début de l\'initialisation des alertes...');

    // Vérifier s'il y a déjà des alertes
    const existingAlerts = await Alert.countDocuments();
    
    if (existingAlerts > 0) {
      console.log(`📊 ${existingAlerts} alertes déjà présentes dans la base de données`);
      console.log('⏭️  Initialisation annulée - alertes déjà existantes');
      return;
    }

    // Créer des alertes par défaut
    const defaultAlerts = [
      {
        title: 'Bienvenue sur le portail MESRIT',
        description: 'Découvrez les dernières actualités et services du Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation Technologique du Niger.',
        priority: 'high',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 jours
      },
      {
        title: 'Nouvelle année académique 2024-2025',
        description: 'Les inscriptions pour la nouvelle année académique sont ouvertes. Consultez les modalités d\'inscription sur les sites des établissements.',
        priority: 'high',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 jours
      },
      {
        title: 'Bourses d\'études disponibles',
        description: 'Le MESRIT informe les étudiants de la disponibilité de bourses d\'études nationales et internationales. Renseignez-vous auprès de votre établissement.',
        priority: 'medium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 jours
      },
      {
        title: 'Appel à projets de recherche',
        description: 'Le ministère lance un appel à projets pour soutenir la recherche scientifique et l\'innovation technologique au Niger.',
        priority: 'medium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      },
      {
        title: 'Services en ligne disponibles',
        description: 'Profitez des services numériques du MESRIT : consultation des établissements, actualités, et bien plus encore.',
        priority: 'low',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) // 120 jours
      }
    ];

    // Insérer les alertes
    const createdAlerts = await Alert.insertMany(defaultAlerts);
    
    console.log('\n📈 Résumé de l\'initialisation :');
    console.log(`✅ ${createdAlerts.length} alertes créées avec succès`);
    
    createdAlerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert.title} - Priorité: ${alert.priority}`);
    });
    
    console.log('\n🎉 Initialisation des alertes terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des alertes :', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation si le script est appelé directement
if (require.main === module) {
  seedAlerts()
    .then(() => {
      console.log('🏁 Script d\'initialisation terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale :', error);
      process.exit(1);
    });
}

module.exports = { seedAlerts };