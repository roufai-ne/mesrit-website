// src/services/search.js
import { connectDB } from '@/lib/mongodb';
import PageContent from '@/models/PageContent';
import News from '@/models/News';

/**
 * Service de recherche unifié
 * Combine la recherche dans les pages crawlées + les actualités
 */
class SearchService {

  /**
   * Recherche dans les pages crawlées (PageContent)
   */
  static async searchPages(query, options = {}) {
    const {
      limit = 5,
      activeOnly = true,
      sections = null
    } = options;

    try {
      await connectDB();

      const results = await PageContent.searchPages(query, {
        limit,
        activeOnly,
        sections
      });

      console.log(`[Search] Pages trouvées: ${results.length}`);

      // Tronquer le contenu pour économiser les tokens
      return results.map(page => ({
        type: 'page',
        title: page.title,
        url: page.url,
        section: page.section,
        description: page.description || '',
        content: page.content ? page.content.substring(0, 5000) : '',
        relevanceScore: page.relevanceScore || 1.0,
        category: page.category
      }));

    } catch (error) {
      console.error('[Search] Erreur recherche pages:', error);
      return [];
    }
  }

  /**
   * Recherche dans les actualités (News)
   */
  static async searchNews(query, options = {}) {
    const { limit = 5 } = options;

    try {
      await connectDB();

      // Recherche texte MongoDB dans les news
      const results = await News.find(
        {
          $text: { $search: query },
          status: 'published'
        },
        {
          score: { $meta: 'textScore' }
        }
      )
        .select('title slug excerpt content category tags createdAt')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      console.log(`[Search] News trouvées: ${results.length}`);

      // Tronquer le contenu
      return results.map(news => ({
        type: 'news',
        title: news.title,
        url: `/actualites/${news.slug}`,
        section: 'actualites',
        description: news.excerpt || '',
        content: news.content ? news.content.substring(0, 5000) : '',
        category: news.category,
        tags: news.tags || [],
        publishedAt: news.createdAt
      }));

    } catch (error) {
      console.error('[Search] Erreur recherche news:', error);
      return [];
    }
  }

  /**
   * Recherche unifiée dans TOUT le contenu du site
   * Combine pages + news avec pondération
   */
  static async searchAll(query, options = {}) {
    const {
      maxResults = 5,
      pageWeight = 0.8,    // 80% pages statiques
      newsWeight = 0.2,    // 20% actualités
      sections = null
    } = options;

    console.log(`[Search] Recherche unifiée: "${query}"`);

    try {
      // Recherche parallèle dans les deux sources
      const [pages, news] = await Promise.all([
        this.searchPages(query, { limit: Math.ceil(maxResults * 1.5), sections }),
        this.searchNews(query, { limit: Math.ceil(maxResults * 0.5) })
      ]);

      // Pondérer les scores
      const weightedPages = pages.map(p => ({
        ...p,
        finalScore: (p.relevanceScore || 1.0) * pageWeight
      }));

      const weightedNews = news.map(n => ({
        ...n,
        finalScore: newsWeight  // Score constant pour les news
      }));

      // Combiner et trier par score
      const allResults = [...weightedPages, ...weightedNews];
      allResults.sort((a, b) => b.finalScore - a.finalScore);

      // Limiter au nombre de résultats demandés
      const topResults = allResults.slice(0, maxResults);

      console.log(`[Search] Résultats retournés: ${topResults.length} (${pages.length} pages + ${news.length} news)`);

      return topResults;

    } catch (error) {
      console.error('[Search] Erreur recherche unifiée:', error);
      return [];
    }
  }

  /**
   * Extraire les mots-clés d'une question
   * Utilisé pour améliorer la pertinence de la recherche
   */
  static extractKeywords(question) {
    // Mots vides français à ignorer
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais',
      'dans', 'sur', 'pour', 'avec', 'par', 'est', 'sont', 'qui', 'que', 'quoi',
      'comment', 'combien', 'quel', 'quelle', 'quels', 'quelles', 'où', 'quand',
      'pourquoi', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles',
      'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses', 'notre', 'votre',
      'leur', 'leurs', 'ce', 'cet', 'cette', 'ces', 'a', 'ai', 'as', 'avez',
      'avoir', 'être', 'été', 'faire', 'fait', 'peut', 'puis', 'donc', 'très',
      'bien', 'plus', 'moins', 'tous', 'tout', 'toute', 'toutes', 'aussi'
    ]);

    // Nettoyer et diviser la question
    const words = question
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿç]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // Retourner les mots uniques
    return [...new Set(words)];
  }

  /**
   * Recherche intelligente avec extraction de mots-clés
   * Améliore la pertinence en utilisant les mots-clés extraits
   */
  static async smartSearch(question, options = {}) {
    // Extraire les mots-clés
    const keywords = this.extractKeywords(question);
    console.log(`[Search] Mots-clés extraits:`, keywords);

    if (keywords.length === 0) {
      // Si aucun mot-clé, rechercher avec la question complète
      return this.searchAll(question, options);
    }

    // Rechercher avec les mots-clés (meilleure précision)
    const keywordQuery = keywords.join(' ');
    return this.searchAll(keywordQuery, options);
  }

  /**
   * Récupérer le contexte d'une section spécifique
   * Utilisé quand on sait que la question concerne une section précise
   */
  static async getSectionContext(section, limit = 5) {
    console.log(`[Search] Contexte section: ${section}`);

    try {
      await connectDB();

      const pages = await PageContent.find({
        section: section,
        isActive: true
      })
        .select('title url content description category')
        .sort({ relevanceScore: -1 })
        .limit(limit)
        .lean();

      return pages.map(page => ({
        type: 'page',
        title: page.title,
        url: page.url,
        section: page.section,
        description: page.description || '',
        content: page.content ? page.content.substring(0, 5000) : '',
        category: page.category
      }));

    } catch (error) {
      console.error('[Search] Erreur contexte section:', error);
      return [];
    }
  }

  /**
   * Récupérer le contexte général du site (pages les plus importantes)
   * Utilisé pour les questions générales
   */
  static async getGeneralContext(limit = 5) {
    console.log(`[Search] Contexte général`);

    try {
      await connectDB();

      // Pages principales (haute pertinence)
      const mainPages = await PageContent.find({
        isActive: true
      })
        .select('title url content description section category')
        .sort({ relevanceScore: -1, referenceCount: -1 })
        .limit(limit)
        .lean();

      return mainPages.map(page => ({
        type: 'page',
        title: page.title,
        url: page.url,
        section: page.section,
        description: page.description || '',
        content: page.content ? page.content.substring(0, 3000) : '',
        category: page.category
      }));

    } catch (error) {
      console.error('[Search] Erreur contexte général:', error);
      return [];
    }
  }

  /**
   * Détecter l'intention de la question
   * Retourne: { type: 'section' | 'search' | 'general', section?: string }
   */
  static detectIntent(question) {
    const lowerQuestion = question.toLowerCase();

    // Mapping section keywords (basé sur les vraies sections du site)
    const sectionKeywords = {
      ministere: ['ministère', 'ministre', 'mission', 'organisation', 'direction', 'historique'],
      etablissements: ['établissement', 'université', 'institut', 'école', 'centre', 'formation'],
      services: ['service', 'étudiant', 'chercheur'],
      documentation: ['documentation', 'loi', 'décret', 'circulaire', 'rapport', 'guide', 'document'],
      actualites: ['actualité', 'news', 'annonce', 'événement', 'nouveau', 'communiqué'],
      support: ['aide', 'faq', 'question', 'support', 'assistance', 'contact'],
      newsletter: ['newsletter', 'inscription', 'désinscription', 'bulletin'],
      legal: ['mention', 'légal', 'confidentialité', 'condition', 'utilisation', 'politique']
    };

    // Détecter la section
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
        return { type: 'section', section };
      }
    }

    // Question spécifique → recherche
    if (lowerQuestion.length > 20) {
      return { type: 'search' };
    }

    // Question générale
    return { type: 'general' };
  }

  /**
   * Méthode principale: recherche adaptative selon l'intention
   */
  static async adaptiveSearch(question, options = {}) {
    const intent = this.detectIntent(question);
    console.log(`[Search] Intention détectée:`, intent);

    switch (intent.type) {
      case 'section':
        // Rechercher dans la section + recherche générale
        const [sectionResults, generalResults] = await Promise.all([
          this.getSectionContext(intent.section, 3),
          this.smartSearch(question, { maxResults: 2 })
        ]);
        return [...sectionResults, ...generalResults].slice(0, options.maxResults || 5);

      case 'search':
        // Recherche intelligente
        return this.smartSearch(question, options);

      case 'general':
        // Contexte général + recherche
        const [generalContext, searchResults] = await Promise.all([
          this.getGeneralContext(3),
          this.smartSearch(question, { maxResults: 2 })
        ]);
        return [...generalContext, ...searchResults].slice(0, options.maxResults || 5);

      default:
        return this.smartSearch(question, options);
    }
  }
}

export default SearchService;
