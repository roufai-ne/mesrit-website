import { fetchAPI } from '@/lib/strapi';
import { rateLimiters } from '@/middleware/securityMiddleware';

const MAX_QUERY_LENGTH = 200;
const MAX_LIMIT = 20;
const DEFAULT_LIMIT = 5;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Rate limit partagé API générale (60 req/min)
  if (!rateLimiters.api.check(req, res)) {
    return res.status(429).json({ message: 'Trop de requêtes. Veuillez patienter.' });
  }

  const { q, limit } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ message: 'Paramètre de recherche requis' });
  }

  if (q.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ message: `Recherche limitée à ${MAX_QUERY_LENGTH} caractères` });
  }

  const searchQuery = q.trim();
  const searchLimit = Math.min(
    Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT),
    MAX_LIMIT
  );

  try {
    const newsResponse = await fetchAPI('/news', {
      filters: {
        $or: [
          { title: { $containsi: searchQuery } },
          { content: { $containsi: searchQuery } },
        ],
      },
      pagination: { limit: searchLimit },
      populate: ['cover'],
    });

    const results = [];

    if (newsResponse?.data) {
      newsResponse.data.forEach((item) => {
        const attrs = item.attributes || item;
        results.push({
          id: item.id,
          title: attrs.title,
          type: 'news',
          category: attrs.category || 'Actualités',
          url: `/actualites/${attrs.slug}`,
          description: attrs.summary || (attrs.content?.substring(0, 150) + '...'),
        });
      });
    }

    return res.status(200).json({ results });

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
