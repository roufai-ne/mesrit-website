// Script pour ajouter des statistiques de publications de base
import { connectDB } from '@/lib/mongodb';
import { PublicationStats } from '@/models/PublicationStats';

const seedPublicationStats = async () => {
  try {
    await connectDB();
    
    // Vérifier si des données existent déjà
    const existingStats = await PublicationStats.findOne();
    if (existingStats) {
      console.log('Des statistiques de publications existent déjà');
      return;
    }
    
    // Créer des statistiques de base pour 2024
    const publicationStats = new PublicationStats({
      year: 2024,
      publicationsByType: [
        { type: 'Article de journal', count: 45 },
        { type: 'Communication de conférence', count: 35 },
        { type: 'Livre/Chapitre', count: 15 },
        { type: 'Thèse', count: 25 },
        { type: 'Rapport de recherche', count: 20 },
        { type: 'Autre', count: 10 }
      ],
      publicationsByDomain: [
        { domain: 'Sciences exactes', count: 30 },
        { domain: 'Sciences de l\'ingénieur', count: 25 },
        { domain: 'Sciences médicales', count: 20 },
        { domain: 'Sciences humaines', count: 35 },
        { domain: 'Sciences sociales', count: 30 },
        { domain: 'Sciences économiques', count: 15 },
        { domain: 'Sciences juridiques', count: 10 },
        { domain: 'Autre', count: 5 }
      ],
      publicationsByScope: {
        international: 75,
        national: 75
      },
      qualityMetrics: {
        indexedPublications: 45,
        peerReviewedPublications: 120,
        impactFactorTotal: 125.5,
        citationsTotal: 890
      },
      totalPublications: 150,
      averagePublicationsPerResearcher: 2.1,
      dataSource: 'Seed Script',
      notes: 'Données initiales créées par script de seed'
    });
    
    await publicationStats.save();
    console.log('Statistiques de publications créées avec succès');
    
  } catch (error) {
    console.error('Erreur lors de la création des statistiques de publications:', error);
  }
};

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPublicationStats().then(() => process.exit(0));
}

export default seedPublicationStats;