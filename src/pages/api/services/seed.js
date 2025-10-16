import { connectDB } from '@/lib/mongodb';
import Service from '@/models/Service';

const sampleServices = [
  {
    title: 'Inscription en ligne',
    description: 'Inscription aux formations et programmes d\'études',
    longDescription: 'Système complet d\'inscription en ligne permettant aux étudiants de s\'inscrire aux formations, programmes d\'études et cours proposés par les établissements d\'enseignement supérieur du Niger.',
    icon: 'GraduationCap',
    category: 'etudiants',
    status: 'published',
    url: 'https://inscription.mesrit.ne',
    features: [
      {
        title: 'Formulaire d\'inscription',
        description: 'Formulaire en ligne simple et intuitif'
      },
      {
        title: 'Validation automatique',
        description: 'Vérification automatique des documents'
      },
      {
        title: 'Suivi en temps réel',
        description: 'Suivi du statut de l\'inscription'
      }
    ],
    image: 'https://images.unsplash.com/photo-1523240798132-8757214e8b56?w=800',
    priority: 10,
    tags: ['inscription', 'formation', 'étudiants'],
    isExternal: false,
    isPopular: true,
    usageCount: 1250
  },
  {
    title: 'Gestion des bourses',
    description: 'Demande et suivi des bourses d\'études',
    longDescription: 'Plateforme de gestion des bourses d\'études permettant aux étudiants éligibles de déposer leur demande, suivre l\'avancement et recevoir les notifications de décision.',
    icon: 'Award',
    category: 'etudiants',
    status: 'published',
    url: 'https://bourses.mesrit.ne',
    features: [
      {
        title: 'Demande en ligne',
        description: 'Dépôt de demande de bourse simplifié'
      },
      {
        title: 'Critères d\'éligibilité',
        description: 'Vérification automatique des critères'
      },
      {
        title: 'Notifications',
        description: 'Alertes et mises à jour en temps réel'
      }
    ],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    priority: 9,
    tags: ['bourses', 'aides', 'étudiants'],
    isExternal: false,
    isPopular: true,
    usageCount: 890
  },
  {
    title: 'Consultation des résultats',
    description: 'Accès aux résultats d\'examens et concours',
    longDescription: 'Service de consultation des résultats d\'examens, concours et évaluations pour tous les niveaux d\'enseignement supérieur.',
    icon: 'FileText',
    category: 'etudiants',
    status: 'published',
    url: 'https://resultats.mesrit.ne',
    features: [
      {
        title: 'Recherche rapide',
        description: 'Recherche par nom, numéro ou établissement'
      },
      {
        title: 'Historique complet',
        description: 'Accès à tous les résultats passés'
      },
      {
        title: 'Téléchargement',
        description: 'Téléchargement des relevés de notes'
      }
    ],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    priority: 8,
    tags: ['résultats', 'examens', 'concours'],
    isExternal: false,
    isPopular: true,
    usageCount: 2100
  },
  {
    title: 'Accréditation des établissements',
    description: 'Processus d\'accréditation et d\'évaluation',
    longDescription: 'Système de gestion de l\'accréditation des établissements d\'enseignement supérieur, incluant l\'évaluation des programmes et la certification de qualité.',
    icon: 'Shield',
    category: 'etablissements',
    status: 'published',
    url: 'https://accreditation.mesrit.ne',
    features: [
      {
        title: 'Dossier d\'accréditation',
        description: 'Gestion complète du dossier'
      },
      {
        title: 'Évaluation en ligne',
        description: 'Processus d\'évaluation digitalisé'
      },
      {
        title: 'Suivi des audits',
        description: 'Planification et suivi des audits'
      }
    ],
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    priority: 7,
    tags: ['accréditation', 'qualité', 'évaluation'],
    isExternal: false,
    isPopular: false,
    usageCount: 45
  },
  {
    title: 'Gestion des programmes',
    description: 'Création et modification des programmes d\'études',
    longDescription: 'Plateforme permettant aux établissements de créer, modifier et gérer leurs programmes d\'études avec validation par le ministère.',
    icon: 'BookOpen',
    category: 'etablissements',
    status: 'published',
    url: 'https://programmes.mesrit.ne',
    features: [
      {
        title: 'Éditeur de programmes',
        description: 'Interface intuitive de création'
      },
      {
        title: 'Workflow de validation',
        description: 'Processus de validation structuré'
      },
      {
        title: 'Versioning',
        description: 'Gestion des versions et modifications'
      }
    ],
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800',
    priority: 6,
    tags: ['programmes', 'curriculum', 'formation'],
    isExternal: false,
    isPopular: false,
    usageCount: 78
  },
  {
    title: 'Base de données de recherche',
    description: 'Accès aux publications et travaux de recherche',
    longDescription: 'Base de données centralisée regroupant toutes les publications, travaux de recherche et thèses produites dans les établissements d\'enseignement supérieur du Niger.',
    icon: 'Database',
    category: 'recherche',
    status: 'published',
    url: 'https://recherche.mesrit.ne',
    features: [
      {
        title: 'Recherche avancée',
        description: 'Moteur de recherche puissant'
      },
      {
        title: 'Filtres multiples',
        description: 'Filtrage par domaine, date, auteur'
      },
      {
        title: 'Téléchargement',
        description: 'Accès aux documents complets'
      }
    ],
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    priority: 5,
    tags: ['recherche', 'publications', 'thèses'],
    isExternal: false,
    isPopular: false,
    usageCount: 320
  },
  {
    title: 'Gestion des projets',
    description: 'Suivi des projets de recherche et innovation',
    longDescription: 'Plateforme de gestion des projets de recherche, d\'innovation technologique et de développement soutenus par le ministère.',
    icon: 'TrendingUp',
    category: 'recherche',
    status: 'published',
    url: 'https://projets.mesrit.ne',
    features: [
      {
        title: 'Dépôt de projets',
        description: 'Soumission de projets en ligne'
      },
      {
        title: 'Suivi budgétaire',
        description: 'Gestion des budgets et dépenses'
      },
      {
        title: 'Rapports d\'avancement',
        description: 'Génération automatique des rapports'
      }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    priority: 4,
    tags: ['projets', 'recherche', 'innovation'],
    isExternal: false,
    isPopular: false,
    usageCount: 156
  },
  {
    title: 'Formation continue',
    description: 'Programmes de formation professionnelle',
    longDescription: 'Catalogue des programmes de formation continue et de perfectionnement professionnel destinés aux enseignants et personnels administratifs.',
    icon: 'Users',
    category: 'formation',
    status: 'published',
    url: 'https://formation.mesrit.ne',
    features: [
      {
        title: 'Catalogue des formations',
        description: 'Recherche et inscription aux formations'
      },
      {
        title: 'Certification',
        description: 'Délivrance de certificats de formation'
      },
      {
        title: 'Suivi des compétences',
        description: 'Évaluation et suivi des acquis'
      }
    ],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    priority: 3,
    tags: ['formation', 'continue', 'professionnelle'],
    isExternal: false,
    isPopular: false,
    usageCount: 234
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Supprimer les services existants
    await Service.deleteMany({});
    
    // Insérer les nouveaux services
    const insertedServices = await Service.insertMany(sampleServices);
    
    res.status(200).json({
      message: `${insertedServices.length} services créés avec succès`,
      services: insertedServices
    });
  } catch (error) {
    console.error('Erreur lors du seed des services:', error);
    res.status(500).json({
      error: 'Erreur lors de la création des services',
      details: error.message
    });
  }
}
