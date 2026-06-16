// src/pages/api/strapi/[...path].js
// Proxy transparent vers Strapi — évite le CORS côté navigateur
// et garde le token Strapi côté serveur (jamais exposé au client)

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

// Méthodes autorisées en lecture seule via ce proxy
const ALLOWED_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Seules les collections publiques en lecture peuvent être proxifiées.
// Les collections contenant des données personnelles (subscribers, messages, users)
// ne sont JAMAIS accessibles via ce proxy — elles utilisent des routes dédiées avec auth.
const ALLOWED_COLLECTIONS = new Set([
  'articles',
  'categories',
  'documents',
  'services',
  'establishments',
  'directors',
  'statistics',
  'events',
  'partners',
  'alerts',
  'faqs',
  'history-milestones',
  'organizational-units',
  'missions',
  'external-services',
  'global',
  'homepage',
]);

export default async function handler(req, res) {
  if (!ALLOWED_METHODS.includes(req.method)) {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { path } = req.query;
  const strapiPath = Array.isArray(path) ? path.join('/') : path;

  // Vérification de l'allowlist avant tout forwarding
  const rootSegment = strapiPath.split('/')[0].split('?')[0];
  if (!ALLOWED_COLLECTIONS.has(rootSegment)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Utiliser la query string brute de req.url pour préserver la notation brackets
  // (ex: populate[0]=cover) — URLSearchParams la corromprait en populate=cover
  const rawQuery = req.url.includes('?') ? req.url.split('?')[1] : '';

  const targetUrl = `${STRAPI_URL}/api/${strapiPath}${rawQuery ? `?${rawQuery}` : ''}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  try {
    const strapiRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      signal: AbortSignal.timeout(10000),
    });

    const data = await strapiRes.json();

    // Cache en lecture : 60s navigateur, 120s CDN (stale-while-revalidate)
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    return res.status(strapiRes.status).json(data);
  } catch (error) {
    console.error(`[Strapi proxy] Erreur pour ${targetUrl}:`, error.message);
    return res.status(503).json({ error: 'Service Strapi indisponible' });
  }
}
