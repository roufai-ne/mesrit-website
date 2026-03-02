// crawler.js — désactivé (MongoDB déconnecté, contenu indexé via Strapi directement)
// Le chatbot utilise SearchService.adaptiveSearch() qui lit depuis Strapi.
export class SiteCrawler {
  async crawlAll() { return { total: 0, successful: 0, failed: 0 }; }
  async crawlIncremental() { return { total: 0, successful: 0, failed: 0 }; }
}

export default new SiteCrawler();
