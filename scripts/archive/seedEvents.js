// src/scripts/seedEvents.js
// Script pour initialiser des événements par défaut
/* eslint-disable @typescript-eslint/no-require-imports */

const { connectDB } = require('../lib/mongodb');
const Event = require('../models/Event').default;

async function seedEvents() {
  try {
    await connectDB();
    console.log('🔄 Début de l\'initialisation des événements...');

    // Vérifier s'il y a déjà des événements
    const existingEvents = await Event.countDocuments();
    
    if (existingEvents > 0) {
      console.log(`📊 ${existingEvents} événements déjà présents dans la base de données`);
      console.log('⏭️  Initialisation annulée - événements déjà existants');
      return;
    }

    // Créer des événements par défaut
    const defaultEvents = [
      {
        title: 'Conseil des Ministres',
        description: 'Réunion hebdomadaire du conseil des ministres pour examiner les dossiers de l\'enseignement supérieur et de la recherche.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
        time: '09:00',
        location: 'Palais de la Présidence, Niamey',
        participants: 'Membres du gouvernement, Ministre MESRIT',
        status: 'upcoming'
      },
      {
        title: 'Conférence Nationale sur l\'Enseignement Supérieur',
        description: 'Grande conférence nationale pour définir les orientations stratégiques de l\'enseignement supérieur au Niger pour les 5 prochaines années.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
        time: '14:00',
        location: 'Centre de Conférences MESRIT, Niamey',
        participants: 'Recteurs, Directeurs d\'établissements, Étudiants, Partenaires',
        status: 'upcoming'
      },
      {
        title: 'Remise des Diplômes - Université Abdou Moumouni',
        description: 'Cérémonie officielle de remise des diplômes aux nouveaux diplômés de l\'Université Abdou Moumouni de Niamey.',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // Dans 21 jours
        time: '16:00',
        location: 'Amphithéâtre Principal, Université Abdou Moumouni',
        participants: 'Diplômés, Familles, Corps professoral, Autorités',
        status: 'upcoming'
      },
      {
        title: 'Forum de l\'Innovation Technologique',
        description: 'Forum national sur l\'innovation technologique et l\'entrepreneuriat étudiant au Niger.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // Dans 28 jours
        time: '10:00',
        location: 'Institut National de la Jeunesse, Niamey',
        participants: 'Étudiants, Entrepreneurs, Investisseurs, Incubateurs',
        status: 'upcoming'
      },
      {
        title: 'Séminaire sur la Recherche Scientifique',
        description: 'Séminaire national sur le développement de la recherche scientifique et l\'innovation au Niger.',
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // Dans 35 jours
        time: '09:30',
        location: 'Centre de Recherche MESRIT, Niamey',
        participants: 'Chercheurs, Doctorants, Partenaires internationaux',
        status: 'upcoming'
      }
    ];

    // Insérer les événements
    const createdEvents = await Event.insertMany(defaultEvents);
    
    console.log('\n📈 Résumé de l\'initialisation :');
    console.log(`✅ ${createdEvents.length} événements créés avec succès`);
    
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.date.toLocaleDateString('fr-FR')}`);
    });
    
    console.log('\n🎉 Initialisation des événements terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des événements :', error);
    process.exit(1);
  }
}

// Exécuter l'initialisation si le script est appelé directement
if (require.main === module) {
  seedEvents()
    .then(() => {
      console.log('🏁 Script d\'initialisation terminé');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale :', error);
      process.exit(1);
    });
}

module.exports = { seedEvents };