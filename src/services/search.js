// src/services/search.js
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapArticleToNews, mapDocument, mapService, mapEstablishment, mapDirector } from '@/utils/strapiMapper';

/**
 * Service de recherche unifié (Version Strapi)
 * Recherche via l'API Strapi dans les différents types de contenus
 */
class SearchService {

  /**
   * Recherche dans les actualités (Articles)
   */
  static async searchArticles(query, limit = 5) {
    try {
      // Recherche Strapi avec filtres
      const data = await fetchAPI(endpoints.articles, {
        filters: {
          $or: [
            { title: { $containsi: query } },
            { summary: { $containsi: query } },
            { content: { $containsi: query } }
          ]
        },
        pagination: { limit }
        // populate removed specifically to avoid 400 Bad Request on string fields like category
      });

      if (!data?.data) return [];

      return data.data.map(article => {
        try {
          const mapped = mapArticleToNews(article);
          if (!mapped) return null;

          return {
            type: 'news',
            title: mapped.title,
            url: `/actualites/${mapped.slug}`,
            section: 'actualites',
            description: mapped.summary || '',
            content: mapped.content ? mapped.content.substring(0, 800) : '',
            category: mapped.category,
            publishedAt: mapped.publishedAt,
            relevanceScore: 1.0
          };
        } catch (err) {
          console.error('Error mapping article:', err);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('[Search] Erreur recherche articles:', error);
      return [];
    }
  }

  /**
   * Recherche dans les documents
   */
  static async searchDocuments(query, limit = 5) {
    try {
      const data = await fetchAPI(endpoints.documents, {
        filters: {
          $or: [
            { title: { $containsi: query } },
            { description: { $containsi: query } }
          ]
        },
        pagination: { limit },
        populate: ['file'] // 'category' est un enum, pas une relation
      });

      if (!data?.data) return [];

      return data.data.map(doc => {
        const mapped = mapDocument(doc);
        return {
          type: 'document',
          title: mapped.title,
          url: mapped.url, // URL du fichier directement
          section: 'documents',
          description: mapped.description || '',
          content: mapped.description, // Pas de contenu complet pour les docs
          category: mapped.category,
          publishedAt: mapped.publicationDate,
          relevanceScore: 0.8
        };
      });
    } catch (error) {
      console.error('[Search] Erreur recherche documents:', error);
      return [];
    }
  }

  /**
   * Recherche dans les services
   */
  static async searchServices(query, limit = 5) {
    try {
      const data = await fetchAPI(endpoints.services, {
        filters: {
          $or: [
            { title: { $containsi: query } },
            { description: { $containsi: query } }
          ]
        },
        pagination: { limit },
        populate: ['image']
      });

      if (!data?.data) return [];

      return data.data.map(svc => {
        const mapped = mapService(svc);
        return {
          type: 'page', // Treat as page for chatbot context
          title: mapped.title,
          url: mapped.url || `/services`,
          section: 'services',
          description: mapped.description || '',
          content: mapped.longDescription || mapped.description,
          category: mapped.category,
          relevanceScore: 0.9
        };
      });
    } catch (error) {
      console.error('[Search] Erreur recherche services:', error);
      return [];
    }
  }

  /**
  * Recherche dans les établissements
  */
  static async searchEstablishments(query, limit = 5) {
    try {
      const data = await fetchAPI(endpoints.establishments, {
        filters: {
          $or: [
            { name: { $containsi: query } },
            { description: { $containsi: query } },
            { city: { $containsi: query } }
          ]
        },
        pagination: { limit },
        populate: ['logo']
      });

      if (!data?.data) return [];

      return data.data.map(est => {
        const mapped = mapEstablishment(est);
        return {
          type: 'page',
          title: mapped.name,
          url: `/etablissements`,
          section: 'etablissements',
          description: mapped.description || '',
          content: `Établissement: ${mapped.name}. Type: ${mapped.type}. Ville: ${mapped.city}. ${mapped.description}`,
          category: mapped.type,
          relevanceScore: 0.85
        };
      });
    } catch (error) {
      console.error('[Search] Erreur recherche établissements:', error);
      return [];
    }
  }

  /**
   * Recherche dans les directeurs/responsables
   */
  static async searchDirectors(query, limit = 5) {
    try {
      // Basic keyword extraction for better matching on short fields
      const stopWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'qui', 'est', 'sont', 'il', 'elle', 'a', 'pour', 'sur', 'dans'];
      const keywords = query.toLowerCase()
        .replace(/[?.,!]/g, '') // Remove punctuation
        .split(' ')
        .filter(w => w.length > 2 && !stopWords.includes(w));

      // If no valid keywords found (e.g. very short query), fallback to original query
      const searchTerms = keywords.length > 0 ? keywords : [query];

      console.debug('[Search] Recherche directeurs:', { query, keywords: searchTerms });

      // Build OR filters for each keyword
      const orFilters = [];
      searchTerms.forEach(term => {
        orFilters.push({ nom: { $containsi: term } });
        orFilters.push({ titre: { $containsi: term } });
        orFilters.push({ mission: { $containsi: term } });
      });

      const data = await fetchAPI(endpoints.directors, {
        filters: { $or: orFilters },
        pagination: { limit },
        populate: ['photo']
      });

      if (!data?.data) return [];

      // ... rest of mapping logic

      // const { mapDirector } = require('@/utils/strapiMapper'); // Imported at top
      return data.data.map(d => {
        try {
          const mapped = mapDirector(d);
          return {
            type: 'page', // Treat as page info
            title: `${mapped.titre} - ${mapped.nom}`,
            url: `/ministere/organigramme`,
            section: 'ministere',
            description: mapped.mission || `Responsable: ${mapped.titre}`,
            content: `Rôle: ${mapped.titre}. Nom: ${mapped.nom}. Mission: ${mapped.mission || 'N/A'}. Contact: ${mapped.email || 'N/A'}.`,
            category: 'Organisation',
            relevanceScore: 0.95
          };
        } catch (e) { return null; }
      }).filter(Boolean);
    } catch (error) {
      console.error('[Search] Erreur recherche directeurs:', error);
      return [];
    }
  }

  /**
   * Recherche unifiée
   */
  static async searchAll(query, options = {}) {
    const { maxResults = 5 } = options;
    console.debug(`[Search] Recherche unifiée: "${query}"`);

    try {
      // Parallel requests
      const [articles, documents, services, establishments, directors] = await Promise.all([
        this.searchArticles(query, maxResults),
        this.searchDocuments(query, Math.ceil(maxResults / 2)),
        this.searchServices(query, Math.ceil(maxResults / 2)),
        this.searchEstablishments(query, Math.ceil(maxResults / 2)),
        this.searchDirectors(query, Math.ceil(maxResults / 2))
      ]);

      // Combine and sort by relevance score so the best matches surface first
      const allResults = [...directors, ...articles, ...services, ...establishments, ...documents]
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      return allResults.slice(0, maxResults);

    } catch (error) {
      console.error('[Search] Erreur recherche unifiée:', error);
      return [];
    }
  }

  /**
   * Recherche adaptative — alias de searchAll, utilisé par aiChatService
   */
  static async adaptiveSearch(query, options = {}) {
    return this.searchAll(query, options);
  }

  /**
   * Récupérer le contexte général (Derniers articles/services + Ministre)
   */
  static async getGeneralContext(limit = 5) {
    try {
      const [articles, services, directors] = await Promise.all([
        this.searchArticles('', limit), // Empty query = list latest
        this.searchServices('', limit),
        this.searchDirectors('Ministre', 1) // Always attempt to get Minister
      ]);
      return [...directors, ...services, ...articles].slice(0, limit + 1);
    } catch (error) {
      console.error('[Search] Erreur contexte général:', error);
      return [];
    }
  }
}

export default SearchService;
