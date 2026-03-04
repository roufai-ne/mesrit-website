// src/pages/api/ministere/content.js
import logger from '@/lib/logger';
import { fetchAPI } from '@/lib/strapi';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const defaultContent = {
      hero: {
        title: "Le Ministère",
        subtitle: "Enseignement Supérieur, Recherche et Innovation",
        description: "Au service de l'excellence académique et de l'innovation pour construire l'avenir de l'enseignement supérieur au Niger avec une vision moderne et inclusive."
      },
      sections: [
        {
          title: "Notre Mission",
          icon: "Target",
          content: "Promouvoir l'excellence dans l'enseignement supérieur et la recherche au Niger par des programmes innovants et une vision stratégique claire pour l'avenir de l'éducation.",
          link: "/ministere/missions",
          color: "bg-blue-50 text-blue-600",
          stats: {
            etablissements: 10,
            etudiants: 100000,
            enseignants: 1500
          }
        },
        {
          title: "Organisation",
          icon: "Building",
          content: "Découvrez notre structure organisationnelle, nos différentes directions et services, et comment nous travaillons ensemble pour atteindre nos objectifs.",
          link: "/ministere/organisation",
          color: "bg-purple-50 text-purple-600",
          stats: {
            directions: 15,
            services: 45,
            agents: 2000
          }
        },
        {
          title: "Direction",
          icon: "Users",
          content: "Notre équipe de direction, composée d'experts dévoués, guide le ministère vers l'excellence et l'innovation dans l'enseignement supérieur.",
          link: "/ministere/direction",
          color: "bg-emerald-50 text-emerald-600",
          stats: {
            directeurs: 25,
            experience: 15,
            projets: 50
          }
        }
      ],
      quickLinks: [
        {
          title: "Nous contacter",
          icon: "Mail",
          link: "/contact",
          description: "Pour toute question ou demande d'information"
        },
        {
          title: "Documentation",
          icon: "BookOpen",
          link: "/documentation",
          description: "Accédez à nos ressources et publications"
        },
        {
          title: "Établissements",
          icon: "GraduationCap",
          link: "/etablissements",
          description: "Explorer nos institutions d'enseignement"
        }
      ],
      lastUpdated: new Date(),
      version: "1.0"
    };

    // Try to fetch from Strapi MinistryPage Single Type
    let strapiContent = null;
    try {
      const response = await fetchAPI('/ministry-page', {});
      if (response?.data) {
        const attrs = response.data.attributes || response.data;
        strapiContent = {
          hero: {
            title: attrs.heroTitle || defaultContent.hero.title,
            subtitle: attrs.heroSubtitle || defaultContent.hero.subtitle,
            description: attrs.heroDescription || defaultContent.hero.description,
          },
          sections: [
            {
              ...defaultContent.sections[0],
              content: attrs.missionContent || defaultContent.sections[0].content,
            },
            {
              ...defaultContent.sections[1],
              content: attrs.organisationContent || defaultContent.sections[1].content,
            },
            {
              ...defaultContent.sections[2],
              content: attrs.directionContent || defaultContent.sections[2].content,
            },
          ],
          quickLinks: defaultContent.quickLinks,
          lastUpdated: attrs.updatedAt || new Date(),
          version: "strapi"
        };
      }
    } catch (strapiError) {
      // Strapi unreachable or single type not set — use default
      logger.warn('ministry_page_strapi_fallback', 'MinistryPage not available from Strapi, using defaults', {});
    }

    const content = strapiContent || defaultContent;

    logger.info('minister_content_accessed', 'Minister content accessed', {
      hasCustomContent: !!strapiContent,
      sectionsCount: content.sections.length,
      userAgent: req.headers['user-agent']
    });

    res.status(200).json({
      success: true,
      data: content,
      cached: !strapiContent
    });

  } catch (error) {
    logger.error('Error fetching minister content:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contenu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}