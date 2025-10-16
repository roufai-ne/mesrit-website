// API pour les statistiques de la page d'accueil
import { connectDB } from '@/lib/mongodb';
import { StudentStats } from '@/models/StudentStats';
import { TeacherStats } from '@/models/TeacherStats';
import { InstitutionStats } from '@/models/InstitutionStats';
import { PublicationStats } from '@/models/PublicationStats';
import Establishment from '@/models/Establishment';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// GET - Récupérer les statistiques de la page d'accueil (public avec API key)
const getHomepageStats = async (req, res) => {
  try {
    // Log pour debugging
    console.log(`[${new Date().toISOString()}] Fetching homepage stats from database...`);

    // Connexion à la base de données
    await connectDB();

    // Récupération des dernières statistiques de chaque type
    const [
      latestStudentStats,
      latestTeacherStats,
      latestInstitutionStats,
      latestPublicationStats,
      establishmentCount
    ] = await Promise.all([
      StudentStats.findOne().sort({ year: -1 }).lean(),
      TeacherStats.findOne().sort({ year: -1 }).lean(),
      InstitutionStats.findOne().sort({ year: -1 }).lean(),
      PublicationStats.findOne().sort({ year: -1 }).lean(),
      Establishment.countDocuments()
    ]);

    // Calcul des statistiques étudiants
    let totalStudents = 25000; // Valeur par défaut
    let studentYear = new Date().getFullYear();
    if (latestStudentStats) {
      totalStudents = latestStudentStats.totalStudents;
      studentYear = latestStudentStats.year;
    }

    // Calcul des statistiques enseignants
    let totalTeachers = 1500; // Valeur par défaut
    let teacherYear = new Date().getFullYear();
    if (latestTeacherStats) {
      // Calcul du total des enseignants du public
      const publicTeachers = latestTeacherStats.publicUniversities?.reduce((sum, grade) => sum + grade.total, 0) || 0;
      const privateTeachers = latestTeacherStats.privateInstitutions?.total || 0;
      totalTeachers = publicTeachers + privateTeachers;
      teacherYear = latestTeacherStats.year;
    }

    // Calcul des statistiques institutions
    let totalInstitutions = establishmentCount || 15;
    let publicInstitutions = 8;
    let privateInstitutions = 7;
    let institutionYear = new Date().getFullYear();
    
    if (latestInstitutionStats) {
      publicInstitutions = latestInstitutionStats.totalPublic || 0;
      privateInstitutions = latestInstitutionStats.totalPrivate || 0;
      totalInstitutions = publicInstitutions + privateInstitutions;
      institutionYear = latestInstitutionStats.year;
    } else {
      // Fallback: compter directement depuis les établissements
      const [publicCount, privateCount] = await Promise.all([
        Establishment.countDocuments({ statut: 'public' }),
        Establishment.countDocuments({ statut: 'privé' })
      ]);
      publicInstitutions = publicCount;
      privateInstitutions = privateCount;
      totalInstitutions = publicCount + privateCount;
    }

    // Calcul des statistiques publications
    let totalPublications = 120; // Valeur par défaut
    let publicationYear = new Date().getFullYear();
    let internationalPubs = 45;
    let nationalPubs = 75;
    let indexedPubs = 30;
    
    if (latestPublicationStats) {
      totalPublications = latestPublicationStats.totalPublications || 0;
      publicationYear = latestPublicationStats.year;
      internationalPubs = latestPublicationStats.publicationsByScope?.international || 0;
      nationalPubs = latestPublicationStats.publicationsByScope?.national || 0;
      indexedPubs = latestPublicationStats.qualityMetrics?.indexedPublications || 0;
    }

    const stats = {
      students: { 
        value: totalStudents, 
        label: "Étudiants", 
        color: "blue",
        year: studentYear
      },
      institutions: { 
        value: totalInstitutions, 
        label: "Établissements", 
        color: "green",
        breakdown: {
          public: publicInstitutions,
          private: privateInstitutions
        }
      },
      teachers: {
        value: totalTeachers,
        label: "Enseignants",
        color: "purple",
        year: teacherYear
      },
      publications: { 
        value: totalPublications, 
        label: "Publications Scientifiques", 
        color: "orange",
        year: publicationYear,
        breakdown: {
          international: internationalPubs,
          national: nationalPubs,
          indexed: indexedPubs
        }
      }
    };

    // Cache réduit pour permettre les mises à jour fréquentes
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-Data-Source', 'database');
    res.setHeader('X-Last-Updated', new Date().toISOString());

    // Log des résultats
    console.log(`[${new Date().toISOString()}] Stats calculated from database:`, {
      students: totalStudents,
      teachers: totalTeachers,
      institutions: totalInstitutions,
      publications: totalPublications,
      dataAvailable: {
        studentStats: !!latestStudentStats,
        teacherStats: !!latestTeacherStats,
        institutionStats: !!latestInstitutionStats,
        publicationStats: !!latestPublicationStats
      }
    });

    return res.status(200).json({
      success: true,
      stats,
      metadata: {
        dataSource: 'mongodb',
        lastUpdated: new Date().toISOString(),
        studentStatsYear: studentYear,
        teacherStatsYear: teacherYear,
        institutionStatsYear: institutionYear,
        publicationStatsYear: publicationYear,
        counts: {
          establishmentCount: totalInstitutions,
          totalStudents,
          totalTeachers,
          totalInstitutions,
          totalPublications
        },
        dataAvailability: {
          studentStats: !!latestStudentStats,
          teacherStats: !!latestTeacherStats,
          institutionStats: !!latestInstitutionStats,
          publicationStats: !!latestPublicationStats,
          establishmentCount: establishmentCount > 0
        }
      }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in homepage stats:`, error);
    
    // Log l'erreur (éviter le logger pour éviter les erreurs circulaires)
    console.error('Erreur API stats homepage:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Retourne les statistiques par défaut en cas d'erreur
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Data-Source', 'fallback');
    res.setHeader('X-Error', error.message);
    
    return res.status(200).json({
      success: true,
      stats: {
        students: { value: 25000, label: "Étudiants", color: "blue", year: new Date().getFullYear() },
        institutions: { value: 15, label: "Établissements", color: "green", breakdown: { public: 8, private: 7 } },
        teachers: { value: 1500, label: "Enseignants", color: "purple", year: new Date().getFullYear() },
        publications: { value: 120, label: "Publications Scientifiques", color: "orange", year: new Date().getFullYear(), breakdown: { international: 45, national: 75, indexed: 30 } }
      },
      metadata: {
        dataSource: 'fallback',
        lastUpdated: new Date().toISOString(),
        error: error.message
      }
    });
  }
};

export default apiHandler(
  {
    GET: getHomepageStats
  },
  {
    GET: ROUTE_TYPES.PUBLIC
  }
);
