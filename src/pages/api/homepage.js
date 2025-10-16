// API consolidée pour la page d'accueil
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import Service from '@/models/Service';
import logger from '@/lib/logger';
import { validateRequest } from '@/lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    await connectDB();

    // Récupération parallèle de toutes les données nécessaires
    const [newsData, servicesData, statsData] = await Promise.allSettled([
      // Actualités récentes (4 dernières)
      News.find({ status: 'published' })
        .sort({ createdAt: -1 })
        .limit(4)
        .select('title content summary image mainVideo videos category createdAt slug')
        .lean(),

      // Services populaires (6 premiers)
      Service.find({ status: 'active' })
        .sort({ popularity: -1 })
        .limit(6)
        .select('title description category isPopular isExternal url icon')
        .lean(),

      // Statistiques du système
      getHomepageStats()
    ]);

    // Traitement des résultats
    const news = newsData.status === 'fulfilled' ? newsData.value : [];
    const services = servicesData.status === 'fulfilled' ? servicesData.value : [];
    const stats = statsData.status === 'fulfilled' ? statsData.value : getDefaultStats();

    // Formatage des actualités
    const formattedNews = news.map(item => ({
      _id: item._id,
      title: item.title,
      content: item.content?.substring(0, 200) + '...',
      summary: item.summary,
      excerpt: item.summary || item.content?.substring(0, 150) + '...',
      image: item.image,
      mainVideo: item.mainVideo,
      videos: item.videos,
      category: item.category,
      createdAt: item.createdAt,
      slug: item.slug
    }));

    // Formatage des services
    const formattedServices = services.map(service => ({
      _id: service._id,
      title: service.title,
      description: service.description,
      category: service.category,
      isPopular: service.isPopular,
      isExternal: service.isExternal,
      url: service.url,
      icon: service.icon
    }));

    // Réponse consolidée
    const response = {
      success: true,
      data: {
        news: formattedNews,
        services: formattedServices,
        stats: stats,
        meta: {
          newsCount: formattedNews.length,
          servicesCount: formattedServices.length,
          lastUpdated: new Date().toISOString()
        }
      }
    };

    // Cache pour 5 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return res.status(200).json(response);

  } catch (error) {
    logger.error('Erreur API homepage:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      success: false,
      error: 'Erreur lors du chargement des données de la page d\'accueil',
      fallback: {
        news: [],
        services: [],
        stats: getDefaultStats()
      }
    });
  }
}

// Fonction pour récupérer les statistiques du système
async function getHomepageStats() {
  try {
    const [newsCount, servicesCount] = await Promise.all([
      News.countDocuments({ status: 'published' }),
      Service.countDocuments({ status: 'active' })
    ]);

    return {
      students: { value: 25000, label: "Étudiants", color: "blue" },
      institutions: { value: 15, label: "Établissements", color: "green" },
      programs: { value: 120, label: "Programmes", color: "purple" },
      research: { value: 50, label: "Projets de Recherche", color: "orange" },
      scholarships: { value: 1200, label: "Bourses Attribuées", color: "red" },
      growth: { value: 15, label: "Croissance Annuelle", color: "indigo", suffix: "%" },
      // Statistiques dynamiques
      publishedNews: { value: newsCount, label: "Actualités Publiées", color: "blue" },
      activeServices: { value: servicesCount, label: "Services Actifs", color: "green" }
    };
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques:', error);
    return getDefaultStats();
  }
}

// Statistiques par défaut en cas d'erreur
function getDefaultStats() {
  return {
    students: { value: 25000, label: "Étudiants", color: "blue" },
    institutions: { value: 15, label: "Établissements", color: "green" },
    programs: { value: 120, label: "Programmes", color: "purple" },
    research: { value: 50, label: "Projets de Recherche", color: "orange" },
    scholarships: { value: 1200, label: "Bourses Attribuées", color: "red" },
    growth: { value: 15, label: "Croissance Annuelle", color: "indigo", suffix: "%" }
  };
}
