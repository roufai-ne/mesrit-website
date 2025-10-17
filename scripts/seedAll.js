// src/scripts/seedAll.js
// Script pour initialiser toutes les données par défaut
/* eslint-disable @typescript-eslint/no-require-imports */

const { seedEvents } = require('./seedEvents');
const { seedAlerts } = require('./seedAlerts');

async function seedAll() {
  console.log('🚀 Début de l\'initialisation complète du système MESRIT...\n');
  
  try {
    // Initialiser les alertes
    console.log('📢 === INITIALISATION DES ALERTES ===');
    await seedAlerts();
    
    console.log('\n📅 === INITIALISATION DES ÉVÉNEMENTS ===');
    // Initialiser les événements
    await seedEvents();
    
    console.log('\n🎉 === INITIALISATION COMPLÈTE TERMINÉE ===');
    console.log('✅ Toutes les données par défaut ont été créées avec succès !');
    console.log('\n📊 Résumé :');
    console.log('- Alertes : Informations et annonces importantes');
    console.log('- Événements : Agenda ministériel et institutionnel');
    console.log('\n🚀 Le système MESRIT est maintenant prêt à être utilisé !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation complète :', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation si le script est appelé directement
if (require.main === module) {
  seedAll()
    .then(() => {
      console.log('\n🏁 Initialisation complète terminée avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale lors de l\'initialisation :', error);
      process.exit(1);
    });
}

module.exports = { seedAll };