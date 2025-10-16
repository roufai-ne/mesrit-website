// src/pages/api/ministere/missions.js
import { connectDB } from '@/lib/mongodb';
import logger from '@/lib/logger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Pour l'instant, utiliser les données par défaut
    // TODO: Créer un modèle Mongoose pour les missions
    const missionsData = null;

    // Missions par défaut avec données réalistes
    const defaultMissions = {
      missions: [
        {
          id: "enseignement",
          title: "Enseignement Supérieur",
          icon: "BookOpen",
          color: "from-niger-green to-niger-green-dark",
          content: "Assurer le développement et la qualité de l'enseignement supérieur au Niger pour former les cadres de demain et répondre aux besoins du développement socio-économique du pays.",
          objectifs: [
            {
              text: "Améliorer l'accès à l'enseignement supérieur",
              progress: 78,
              description: "Augmentation du taux de scolarisation dans le supérieur de 15% à 25%",
              target: 2025,
              indicator: "Taux de scolarisation supérieur"
            },
            {
              text: "Garantir la qualité des formations",
              progress: 85,
              description: "Mise en place de standards d'accréditation et d'évaluation",
              target: 2024,
              indicator: "Programmes accrédités"
            },
            {
              text: "Renforcer les capacités des établissements",
              progress: 62,
              description: "Modernisation des infrastructures et équipements pédagogiques",
              target: 2026,
              indicator: "Infrastructures modernisées"
            }
          ],
          stats: {
            etablissements: "10+",
            etudiants: "100k+",
            programmes: "200+",
            diplomes: "15k+/an"
          },
          achievements: [
            "Création de 3 nouvelles universités régionales",
            "Augmentation de 40% des effectifs étudiants",
            "Mise en place du système LMD dans tous les établissements"
          ]
        },
        {
          id: "recherche",
          title: "Recherche",
          icon: "Target",
          color: "from-niger-orange to-niger-orange-dark",
          content: "Promouvoir la recherche scientifique et l'innovation pour le développement socio-économique du Niger en favorisant l'excellence et les partenariats stratégiques.",
          objectifs: [
            {
              text: "Développer les infrastructures de recherche",
              progress: 45,
              description: "Construction de laboratoires et centres de recherche modernes",
              target: 2027,
              indicator: "Laboratoires opérationnels"
            },
            {
              text: "Soutenir les projets de recherche",
              progress: 72,
              description: "Financement et accompagnement des chercheurs nationaux",
              target: 2025,
              indicator: "Projets financés"
            },
            {
              text: "Favoriser les partenariats internationaux",
              progress: 83,
              description: "Collaborations avec universités et centres de recherche étrangers",
              target: 2024,
              indicator: "Accords signés"
            }
          ],
          stats: {
            chercheurs: "500+",
            projets: "150+",
            publications: "300+",
            partenariats: "25+"
          },
          achievements: [
            "Signature de 15 accords de coopération internationale",
            "Création du Fonds National de Recherche",
            "Lancement de 50 projets de recherche prioritaires"
          ]
        },
        {
          id: "innovation",
          title: "Innovation",
          icon: "Award",
          color: "from-purple-500 to-purple-700",
          content: "Stimuler l'innovation technologique et le transfert de connaissances vers le secteur productif pour favoriser l'entrepreneuriat et la création d'emplois.",
          objectifs: [
            {
              text: "Encourager les initiatives innovantes",
              progress: 58,
              description: "Incubateurs et pépinières d'entreprises dans les universités",
              target: 2026,
              indicator: "Incubateurs créés"
            },
            {
              text: "Faciliter le transfert technologique",
              progress: 41,
              description: "Partenariats université-industrie et valorisation de la recherche",
              target: 2027,
              indicator: "Brevets déposés"
            },
            {
              text: "Soutenir les startups universitaires",
              progress: 67,
              description: "Accompagnement entrepreneurial des étudiants et jeunes diplômés",
              target: 2025,
              indicator: "Startups créées"
            }
          ],
          stats: {
            startups: "50+",
            brevets: "25+",
            partenariats: "30+",
            emplois: "500+"
          },
          achievements: [
            "Création de 5 incubateurs universitaires",
            "Lancement du concours national d'innovation",
            "Formation de 200 jeunes entrepreneurs"
          ]
        }
      ],
      globalStats: {
        budget: "50 milliards FCFA",
        beneficiaires: "150,000+",
        projets: "200+",
        partenaires: "50+"
      },
      lastUpdated: new Date(),
      version: "2.0"
    };

    const missions = missionsData || defaultMissions;

    // Log de l'accès
    logger.info('Minister missions accessed', {
      hasCustomData: !!missionsData,
      missionsCount: missions.missions?.length || 0,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      data: missions,
      cached: !missionsData
    });

  } catch (error) {
    logger.error('Error fetching minister missions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des missions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}