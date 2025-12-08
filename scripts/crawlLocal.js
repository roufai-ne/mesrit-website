#!/usr/bin/env node
// scripts/crawlLocal.js
/**
 * Script pour crawler le site en local et peupler la base PageContent
 * Utilisé pour permettre au chatbot d'accéder au contenu du site
 */

require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

// Configuration
const BASE_URL = process.env.CRAWLER_BASE_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI;

// Schéma PageContent (copié depuis le modèle)
const PageContentSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  section: { type: String, default: 'general' },
  category: String,
  keywords: [String],
  description: String,
  lastCrawled: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  referenceCount: { type: Number, default: 0 },
  relevanceScore: { type: Number, default: 1.0 },
  crawlMeta: {
    statusCode: Number,
    crawlDuration: Number,
    contentLength: Number,
    lastError: String
  }
}, {
  timestamps: true,
  collection: 'pagecontents'
});

PageContentSchema.index({ title: 'text', content: 'text', description: 'text', keywords: 'text' });

const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema);

/**
 * Liste des pages à crawler
 */
const PAGES_TO_CRAWL = [
  // Pages principales
  { url: '/', section: 'accueil', title: 'Accueil', relevanceScore: 10 },
  { url: '/sitemap', section: 'support', title: 'Plan du Site', relevanceScore: 5 },
  { url: '/support', section: 'support', title: 'Support', relevanceScore: 6 },
  { url: '/services-etudiants', section: 'services', title: 'Services aux Étudiants', relevanceScore: 9 },

  // Le Ministère
  { url: '/ministere', section: 'ministere', title: 'Le Ministère', relevanceScore: 10 },
  { url: '/ministere/missions', section: 'ministere', title: 'Missions et Vision', relevanceScore: 9 },
  { url: '/ministere/historique', section: 'ministere', title: 'Historique', relevanceScore: 7 },
  { url: '/ministere/organisation', section: 'ministere', title: 'Organisation', relevanceScore: 8 },
  { url: '/ministere/direction', section: 'ministere', title: 'Directions', relevanceScore: 8 },

  // Établissements
  { url: '/etablissements', section: 'etablissements', title: 'Établissements', relevanceScore: 10 },
  { url: '/etablissements/universites', section: 'etablissements', title: 'Universités', relevanceScore: 9 },
  { url: '/etablissements/instituts', section: 'etablissements', title: 'Instituts', relevanceScore: 8 },
  { url: '/etablissements/ecoles', section: 'etablissements', title: 'Écoles', relevanceScore: 8 },
  { url: '/etablissements/centres', section: 'etablissements', title: 'Centres de Formation', relevanceScore: 7 },

  // Actualités
  { url: '/actualites', section: 'actualites', title: 'Actualités', relevanceScore: 9 },

  // Documentation
  { url: '/documentation', section: 'documentation', title: 'Documentation', relevanceScore: 8 },
  { url: '/documentation/lois', section: 'documentation', title: 'Lois et Décrets', relevanceScore: 7 },
  { url: '/documentation/circulaires', section: 'documentation', title: 'Circulaires', relevanceScore: 6 },
  { url: '/documentation/rapports', section: 'documentation', title: 'Rapports', relevanceScore: 6 },
  { url: '/documentation/guides', section: 'documentation', title: 'Guides', relevanceScore: 7 },

  // Services
  { url: '/services', section: 'services', title: 'Services', relevanceScore: 9 },

  // Contact et Support
  { url: '/contact', section: 'contact', title: 'Contact', relevanceScore: 10 },
  { url: '/faq', section: 'support', title: 'FAQ - Questions Fréquentes', relevanceScore: 8 },

  // Newsletter
  { url: '/newsletter/confirm-email', section: 'newsletter', title: 'Confirmation Newsletter', relevanceScore: 3 },
  { url: '/newsletter/unsubscribe', section: 'newsletter', title: 'Désinscription Newsletter', relevanceScore: 2 },

  // Pages légales
  { url: '/mentions-legales', section: 'legal', title: 'Mentions Légales', relevanceScore: 4 },
  { url: '/politique-confidentialite', section: 'legal', title: 'Politique de Confidentialité', relevanceScore: 5 },
  { url: '/conditions-utilisation', section: 'legal', title: 'Conditions d\'Utilisation', relevanceScore: 4 }
];

/**
 * Extraire le contenu textuel d'une page
 */
function extractContent($) {
  // Retirer les éléments non pertinents
  $('script, style, nav, header, footer, .cookie-banner, button').remove();

  // Extraire le contenu principal
  let content = '';

  const mainSelectors = ['main', '[role="main"]', '.main-content', '#main-content', 'article', '.content'];

  for (const selector of mainSelectors) {
    const mainContent = $(selector);
    if (mainContent.length > 0) {
      content = mainContent.text();
      break;
    }
  }

  if (!content) {
    content = $('body').text();
  }

  // Nettoyer
  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  return content;
}

/**
 * Extraire les métadonnées
 */
function extractMetadata($) {
  const metadata = {};

  metadata.description =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    '';

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
async function crawlPage(pageInfo) {
  const startTime = Date.now();
  const fullUrl = `${BASE_URL}${pageInfo.url}`;

  console.log(`[Crawler] 📄 Crawling: ${fullUrl}`);

  try {
    const response = await axios.get(fullUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'MESRIT-Chatbot-Crawler/1.0',
        'Accept': 'text/html'
      },
      validateStatus: (status) => status < 500 // Accepter les 404 mais pas les 500
    });

    if (response.status === 404) {
      throw new Error('Page not found (404)');
    }

    const $ = cheerio.load(response.data);

    // Extraire le titre
    const title = pageInfo.title ||
                  $('h1').first().text().trim() ||
                  $('title').text().trim() ||
                  'Sans titre';

    // Extraire le contenu
    const content = extractContent($);

    if (!content || content.length < 50) {
      throw new Error('Contenu trop court ou vide');
    }

    // Extraire métadonnées
    const metadata = extractMetadata($);

    // Limiter à 50KB
    const truncatedContent = content.length > 50000
      ? content.substring(0, 50000) + '...'
      : content;

    // Sauvegarder dans MongoDB
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
      relevanceScore: pageInfo.relevanceScore || 5,
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

    console.log(`[Crawler] ✅ ${title} (${content.length} chars, score: ${pageData.relevanceScore})`);

    return { success: true, url: fullUrl, title, length: content.length };

  } catch (error) {
    console.error(`[Crawler] ❌ ${fullUrl}: ${error.message}`);

    // Marquer comme inactive
    try {
      await PageContent.findOneAndUpdate(
        { url: fullUrl },
        {
          isActive: false,
          'crawlMeta.lastError': error.message,
          lastCrawled: new Date()
        },
        { upsert: true }
      );
    } catch (dbError) {
      // Ignore
    }

    return { success: false, url: fullUrl, error: error.message };
  }
}

/**
 * Crawler toutes les pages
 */
async function crawlAll() {
  console.log('═══════════════════════════════════════════');
  console.log('🚀 MESRIT Site Crawler - Local Mode');
  console.log('═══════════════════════════════════════════');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🗄️  MongoDB: ${MONGODB_URI ? 'Configured' : 'NOT CONFIGURED'}`);
  console.log(`📊 Pages to crawl: ${PAGES_TO_CRAWL.length}`);
  console.log('═══════════════════════════════════════════\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not configured in .env');
    process.exit(1);
  }

  // Connexion MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }

  // Vérifier que le serveur local est accessible
  try {
    await axios.get(BASE_URL, { timeout: 5000 });
    console.log('✅ Local server is running\n');
  } catch (error) {
    console.error('❌ Local server is not accessible at', BASE_URL);
    console.error('   Please start the dev server with: npm run dev');
    process.exit(1);
  }

  const results = {
    total: PAGES_TO_CRAWL.length,
    successful: 0,
    failed: 0,
    errors: [],
    totalChars: 0
  };

  // Crawler chaque page
  for (let i = 0; i < PAGES_TO_CRAWL.length; i++) {
    const pageInfo = PAGES_TO_CRAWL[i];
    console.log(`[${i + 1}/${PAGES_TO_CRAWL.length}]`);

    const result = await crawlPage(pageInfo);

    if (result.success) {
      results.successful++;
      results.totalChars += result.length || 0;
    } else {
      results.failed++;
      results.errors.push(result);
    }

    // Pause entre chaque requête
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Résumé
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 CRAWL COMPLETED');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Successful: ${results.successful}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`📝 Total content: ${(results.totalChars / 1024).toFixed(2)} KB`);

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:');
    results.errors.forEach(err => {
      console.log(`   - ${err.url}: ${err.error}`);
    });
  }

  console.log('\n💬 Chatbot is now ready to use with site content!');
  console.log('═══════════════════════════════════════════\n');

  await mongoose.connection.close();
  return results;
}

// Exécution
if (require.main === module) {
  crawlAll()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { crawlAll, crawlPage };
