// src/services/crawler.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { connectDB } from '../lib/mongodb.js';
import PageContent from '../models/PageContent.js';

/**
 * Service de crawling pour indexer le contenu du site
 * Utilise axios pour fetch et cheerio pour parsing HTML
 */
class SiteCrawler {

  constructor(baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://site.mesrit.com') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.crawledUrls = new Set();
    this.errors = [];
  }

  /**
   * Liste des pages à crawler (basée sur l'exploration du projet)
   * Total: 31 pages publiques
   */
  static getPagesToIndex() {
    return [
      // Pages principales
      { url: '/', section: 'accueil', title: 'Accueil' },
      { url: '/sitemap', section: 'support', title: 'Plan du Site' },
      { url: '/support', section: 'support', title: 'Support' },
      { url: '/services-etudiants', section: 'services', title: 'Services aux Étudiants' },

      // Le Ministère
      { url: '/ministere', section: 'ministere', title: 'Le Ministère' },
      { url: '/ministere/missions', section: 'ministere', title: 'Missions et Vision' },
      { url: '/ministere/historique', section: 'ministere', title: 'Historique' },
      { url: '/ministere/organisation', section: 'ministere', title: 'Organisation' },
      { url: '/ministere/direction', section: 'ministere', title: 'Directions' },

      // Établissements
      { url: '/etablissements', section: 'etablissements', title: 'Établissements' },
      { url: '/etablissements/universites', section: 'etablissements', title: 'Universités' },
      { url: '/etablissements/instituts', section: 'etablissements', title: 'Instituts' },
      { url: '/etablissements/ecoles', section: 'etablissements', title: 'Écoles' },
      { url: '/etablissements/centres', section: 'etablissements', title: 'Centres de Formation' },

      // Actualités (page liste, pas les articles individuels)
      { url: '/actualites', section: 'actualites', title: 'Actualités' },

      // Documentation
      { url: '/documentation', section: 'documentation', title: 'Documentation' },
      { url: '/documentation/lois', section: 'documentation', title: 'Lois et Décrets' },
      { url: '/documentation/circulaires', section: 'documentation', title: 'Circulaires' },
      { url: '/documentation/rapports', section: 'documentation', title: 'Rapports' },
      { url: '/documentation/guides', section: 'documentation', title: 'Guides' },

      // Services
      { url: '/services', section: 'services', title: 'Services' },

      // Contact et Support
      { url: '/contact', section: 'contact', title: 'Contact' },
      { url: '/faq', section: 'support', title: 'FAQ - Questions Fréquentes' },
      { url: '/search', section: 'support', title: 'Recherche' },

      // Newsletter
      { url: '/newsletter/confirm-email', section: 'newsletter', title: 'Confirmation Newsletter' },
      { url: '/newsletter/unsubscribe', section: 'newsletter', title: 'Désinscription Newsletter' },

      // Pages légales
      { url: '/mentions-legales', section: 'legal', title: 'Mentions Légales' },
      { url: '/politique-confidentialite', section: 'legal', title: 'Politique de Confidentialité' },
      { url: '/conditions-utilisation', section: 'legal', title: 'Conditions d\'Utilisation' }
    ];
  }

  /**
   * Extraire le contenu textuel d'une page
   */
  extractContent($) {
    // Retirer les éléments non pertinents
    $('script, style, nav, header, footer, .cookie-banner, #chatbot').remove();

    // Extraire le contenu principal
    let content = '';

    // Essayer différents sélecteurs pour le contenu principal
    const mainSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '#content',
      'article',
      '.content'
    ];

    for (const selector of mainSelectors) {
      const mainContent = $(selector);
      if (mainContent.length > 0) {
        content = mainContent.text();
        break;
      }
    }

    // Si aucun sélecteur n'a fonctionné, prendre le body
    if (!content) {
      content = $('body').text();
    }

    // Nettoyer le contenu
    content = content
      .replace(/\s+/g, ' ') // Espaces multiples → un seul
      .replace(/\n+/g, '\n') // Sauts de ligne multiples → un seul
      .trim();

    return content;
  }

  /**
   * Extraire les métadonnées d'une page
   */
  extractMetadata($) {
    const metadata = {};

    // Description
    metadata.description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    // Keywords
    const keywordsStr = $('meta[name="keywords"]').attr('content') || '';
    metadata.keywords = keywordsStr
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    return metadata;
  }

  /**
   * Crawler une seule page
   */
  async crawlPage(pageInfo) {
    const startTime = Date.now();
    const fullUrl = pageInfo.url.startsWith('http')
      ? pageInfo.url
      : `${this.baseUrl}${pageInfo.url}`;

    console.log(`[Crawler] Crawling: ${fullUrl}`);

    try {
      // Fetch la page
      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'MESRIT-Chatbot-Crawler/1.0'
        }
      });

      // Parser le HTML
      const $ = cheerio.load(response.data);

      // Extraire le titre
      const title = pageInfo.title ||
                    $('h1').first().text().trim() ||
                    $('title').text().trim() ||
                    'Sans titre';

      // Extraire le contenu
      const content = this.extractContent($);

      // Extraire les métadonnées
      const metadata = this.extractMetadata($);

      // Vérifier que le contenu n'est pas vide
      if (!content || content.length < 50) {
        throw new Error('Contenu trop court ou vide');
      }

      // Limiter la taille du contenu (pour éviter de dépasser les limites MongoDB)
      const truncatedContent = content.length > 50000
        ? content.substring(0, 50000) + '...'
        : content;

      // Créer ou mettre à jour dans la BD
      const pageData = {
        url: fullUrl,
        title: title,
        content: truncatedContent,
        section: pageInfo.section || 'general',
        category: pageInfo.category,
        description: metadata.description || truncatedContent.substring(0, 200) + '...',
        keywords: metadata.keywords,
        lastCrawled: new Date(),
        isActive: true,
        crawlMeta: {
          statusCode: response.status,
          crawlDuration: Date.now() - startTime,
          contentLength: content.length
        }
      };

      await PageContent.findOneAndUpdate(
        { url: fullUrl },
        pageData,
        { upsert: true, new: true }
      );

      this.crawledUrls.add(fullUrl);
      console.log(`[Crawler] ✅ Success: ${title} (${content.length} chars)`);

      return { success: true, url: fullUrl, title };

    } catch (error) {
      const errorMsg = `Failed to crawl ${fullUrl}: ${error.message}`;
      console.error(`[Crawler] ❌ ${errorMsg}`);

      this.errors.push({
        url: fullUrl,
        error: error.message,
        timestamp: new Date()
      });

      // Marquer comme inactive si échec
      try {
        await PageContent.findOneAndUpdate(
          { url: fullUrl },
          {
            isActive: false,
            'crawlMeta.lastError': error.message,
            lastCrawled: new Date()
          }
        );
      } catch (dbError) {
        console.error('[Crawler] Error updating DB:', dbError);
      }

      return { success: false, url: fullUrl, error: error.message };
    }
  }

  /**
   * Crawler toutes les pages
   */
  async crawlAll() {
    console.log('[Crawler] Starting site crawl...');
    console.log(`[Crawler] Base URL: ${this.baseUrl}`);

    // Connexion à MongoDB
    await connectDB();

    const pages = SiteCrawler.getPagesToIndex();
    console.log(`[Crawler] ${pages.length} pages to crawl`);

    const results = {
      total: pages.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    // Crawler chaque page séquentiellement (pour éviter de surcharger le serveur)
    for (const pageInfo of pages) {
      const result = await this.crawlPage(pageInfo);

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(result);
      }

      // Pause entre chaque requête (politesse)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n[Crawler] ═══ CRAWL COMPLETED ═══');
    console.log(`[Crawler] Total: ${results.total}`);
    console.log(`[Crawler] Successful: ${results.successful}`);
    console.log(`[Crawler] Failed: ${results.failed}`);

    if (results.errors.length > 0) {
      console.log('[Crawler] Errors:');
      results.errors.forEach(err => {
        console.log(`  - ${err.url}: ${err.error}`);
      });
    }

    return results;
  }

  /**
   * Crawler uniquement les pages modifiées récemment
   */
  async crawlIncremental(daysOld = 7) {
    await connectDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Pages pas crawlées depuis X jours
    const oldPages = await PageContent.find({
      lastCrawled: { $lt: cutoffDate }
    }).lean();

    console.log(`[Crawler] Found ${oldPages.length} pages older than ${daysOld} days`);

    // Re-crawler ces pages
    const results = { successful: 0, failed: 0 };

    for (const page of oldPages) {
      const pageInfo = {
        url: page.url,
        section: page.section,
        title: page.title
      };

      const result = await this.crawlPage(pageInfo);

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[Crawler] Incremental crawl: ${results.successful} success, ${results.failed} failed`);

    return results;
  }
}

// Export pour utilisation dans d'autres modules
export default SiteCrawler;

// Permettre l'exécution en ligne de commande
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const crawler = new SiteCrawler();

      const command = process.argv[2] || 'all';

      if (command === 'incremental') {
        const days = parseInt(process.argv[3]) || 7;
        await crawler.crawlIncremental(days);
      } else {
        await crawler.crawlAll();
      }

      process.exit(0);
    } catch (error) {
      console.error('[Crawler] Fatal error:', error);
      process.exit(1);
    }
  })();
}
