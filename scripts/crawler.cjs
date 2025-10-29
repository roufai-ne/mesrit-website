// scripts/crawler.cjs
// Version CommonJS du crawler pour compatibilité Node.js
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

/**
 * Connexion MongoDB
 */
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI non défini dans .env');
  }

  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  console.log('[MongoDB] Connecté');
}

/**
 * Modèle PageContent
 */
const PageContentSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  section: { type: String, trim: true, default: 'general' },
  keywords: [{ type: String, trim: true }],
  description: { type: String, trim: true },
  lastCrawled: { type: Date, default: Date.now, index: true },
  isActive: { type: Boolean, default: true, index: true },
  referenceCount: { type: Number, default: 0 },
  relevanceScore: { type: Number, default: 1.0, min: 0, max: 10 },
  crawlMetadata: {
    statusCode: Number,
    contentLength: Number,
    crawlDuration: Number
  }
}, { timestamps: true, collection: 'pagecontents' });

// Index text search
PageContentSchema.index({
  title: 'text',
  content: 'text',
  description: 'text',
  keywords: 'text'
}, {
  weights: { title: 10, keywords: 8, description: 5, content: 1 },
  name: 'page_text_search',
  default_language: 'french'
});

const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema);

/**
 * Service de crawling
 */
class SiteCrawler {

  constructor(baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://site.mesrit.com') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
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
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
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
   * Crawler une page spécifique
   */
  async crawlPage(pageInfo) {
    const fullUrl = `${this.baseUrl}${pageInfo.url}`;
    console.log(`[Crawler] Crawling: ${fullUrl}`);

    const startTime = Date.now();

    try {
      // Fetch la page
      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'MESRIT-Chatbot-Crawler/1.0'
        }
      });

      const $ = cheerio.load(response.data);

      // Extraire le contenu
      const content = this.extractContent($);
      const metadata = this.extractMetadata($);

      // Vérifier qu'il y a du contenu
      if (!content || content.length < 100) {
        console.log(`[Crawler] ⚠️  Contenu insuffisant pour ${pageInfo.url} (${content.length} chars)`);

        // Si la page existe mais est vide, on la sauvegarde quand même avec un flag
        // Cela permet au chatbot de savoir que la page existe
        await PageContent.findOneAndUpdate(
          { url: pageInfo.url },
          {
            url: pageInfo.url,
            title: pageInfo.title,
            content: content || `Page en construction: ${pageInfo.title}`,
            section: pageInfo.section,
            description: metadata.description || `Page ${pageInfo.title} - Contenu à venir`,
            keywords: metadata.keywords,
            lastCrawled: new Date(),
            isActive: false, // Marquer comme inactive car contenu insuffisant
            crawlMetadata: {
              statusCode: response.status,
              contentLength: content.length,
              crawlDuration: Date.now() - startTime
            }
          },
          { upsert: true, new: true }
        );

        this.errors.push({ url: pageInfo.url, error: 'Contenu insuffisant' });
        return;
      }

      const crawlDuration = Date.now() - startTime;

      // Sauvegarder dans MongoDB
      await PageContent.findOneAndUpdate(
        { url: pageInfo.url },
        {
          url: pageInfo.url,
          title: pageInfo.title,
          content: content,
          section: pageInfo.section,
          description: metadata.description,
          keywords: metadata.keywords,
          lastCrawled: new Date(),
          isActive: true,
          crawlMetadata: {
            statusCode: response.status,
            contentLength: content.length,
            crawlDuration: crawlDuration
          }
        },
        { upsert: true, new: true }
      );

      this.crawledUrls.add(pageInfo.url);
      console.log(`[Crawler] ✅ Success: ${pageInfo.title} (${content.length} chars, ${crawlDuration}ms)`);

    } catch (error) {
      console.error(`[Crawler] ❌ Error crawling ${pageInfo.url}:`, error.message);
      this.errors.push({ url: pageInfo.url, error: error.message });
    }
  }

  /**
   * Crawler toutes les pages
   */
  async crawlAll() {
    console.log('\n═══════════════════════════════════════');
    console.log('   MESRIT SITE CRAWLER');
    console.log('═══════════════════════════════════════\n');
    console.log(`[Crawler] Starting site crawl...`);
    console.log(`[Crawler] Base URL: ${this.baseUrl}`);

    const pages = SiteCrawler.getPagesToIndex();
    console.log(`[Crawler] ${pages.length} pages to crawl\n`);

    // Connexion MongoDB
    await connectDB();

    // Crawler chaque page
    for (const pageInfo of pages) {
      await this.crawlPage(pageInfo);
      // Rate limiting: 1 seconde entre chaque requête
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n═══════════════════════════════════════');
    console.log('   CRAWL COMPLETED');
    console.log('═══════════════════════════════════════\n');
    console.log(`[Crawler] Total pages: ${pages.length}`);
    console.log(`[Crawler] ✅ Successful: ${this.crawledUrls.size} (content OK)`);
    console.log(`[Crawler] ⚠️  Warnings: ${this.errors.length} (empty/insufficient content)`);

    // Compter les pages actives dans la DB
    const activeCount = await PageContent.countDocuments({ isActive: true });
    const inactiveCount = await PageContent.countDocuments({ isActive: false });

    console.log(`\n[MongoDB] Pages in database:`);
    console.log(`  - Active (ready for chatbot): ${activeCount}`);
    console.log(`  - Inactive (empty pages): ${inactiveCount}`);
    console.log(`  - Total: ${activeCount + inactiveCount}`);

    if (this.errors.length > 0) {
      console.log('\n[Crawler] Pages with insufficient content:');
      this.errors.forEach(err => {
        console.log(`  - ${err.url}: ${err.error}`);
      });
      console.log('\n💡 Tip: These pages exist but are empty/under construction.');
      console.log('   They are saved as inactive and won\'t appear in chatbot responses.');
    }

    return {
      total: pages.length,
      success: this.crawledUrls.size,
      warnings: this.errors.length,
      activePages: activeCount,
      inactivePages: inactiveCount,
      errors: this.errors
    };
  }

  /**
   * Crawler incrémental (uniquement les pages anciennes)
   */
  async crawlIncremental(daysOld = 7) {
    console.log(`[Crawler] Incremental crawl (pages older than ${daysOld} days)...`);

    await connectDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const pages = SiteCrawler.getPagesToIndex();
    let crawled = 0;

    for (const pageInfo of pages) {
      // Vérifier si la page existe et sa date
      const existingPage = await PageContent.findOne({ url: pageInfo.url });

      if (!existingPage || existingPage.lastCrawled < cutoffDate) {
        await this.crawlPage(pageInfo);
        crawled++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`[Crawler] ⏭️  Skipping ${pageInfo.url} (recently crawled)`);
      }
    }

    console.log(`\n[Crawler] Incremental crawl complete: ${crawled} pages updated`);

    return {
      total: pages.length,
      crawled: crawled,
      skipped: pages.length - crawled
    };
  }
}

/**
 * Exécution CLI
 */
async function main() {
  const mode = process.argv[2] || 'all';
  const days = parseInt(process.argv[3]) || 7;

  const crawler = new SiteCrawler();

  try {
    if (mode === 'incremental') {
      await crawler.crawlIncremental(days);
    } else {
      await crawler.crawlAll();
    }

    console.log('\n✅ Crawler terminé avec succès!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    // Fermer la connexion MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('[MongoDB] Connexion fermée');
    }
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

module.exports = { SiteCrawler };
