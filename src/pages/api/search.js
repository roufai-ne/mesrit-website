import SearchService from '@/services/search';
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
    const items = await SearchService.searchAll(searchQuery, { maxResults: searchLimit });

    const results = items.map(item => ({
      title: item.title,
      type: item.type === 'news' ? 'news' : 'page',
      category: item.category || 'Actualités',
      url: item.url,
      description: item.description || '',
    }));

    return res.status(200).json({ results });

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}
