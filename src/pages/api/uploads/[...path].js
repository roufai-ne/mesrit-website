// src/pages/api/uploads/[...path].js
// Proxy pour les fichiers statiques Strapi (images, documents)
// Permet d'éviter le blocage "private IP" de Next.js Image Optimization

import { Readable } from 'stream';
import { rateLimiters } from '@/middleware/securityMiddleware';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }

  // Rate limiting partagé avec l'API générale (60 req/min par IP)
  if (!rateLimiters.api.check(req, res)) {
    return res.status(429).end();
  }

  const { path } = req.query;
  const filePath = Array.isArray(path) ? path.join('/') : path;

  // Refuse path traversal attempts
  if (!filePath || filePath.includes('..') || filePath.startsWith('/')) {
    return res.status(400).end();
  }

  const targetUrl = `${STRAPI_URL}/uploads/${filePath}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
      return res.status(upstream.status).end();
    }

    // Transmettre les headers pertinents
    const contentType = upstream.headers.get('content-type');
    const contentLength = upstream.headers.get('content-length');
    if (contentType) res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    // 1 jour de cache — les fichiers Strapi n'ont pas de noms hachés,
    // donc immutable serait dangereux si un fichier est remplacé
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

    // Forcer le téléchargement pour les documents (pas les images)
    const isDocument = contentType && (
      contentType.includes('pdf') ||
      contentType.includes('msword') ||
      contentType.includes('officedocument') ||
      contentType.includes('opendocument') ||
      contentType.includes('application/octet-stream')
    );
    if (isDocument) {
      const filename = filePath.split('/').pop();
      const encodedFilename = encodeURIComponent(filename);
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    }

    // Stream the response instead of buffering the entire file in memory
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    console.error(`[Uploads proxy] Erreur pour ${targetUrl}:`, error.message);
    if (!res.headersSent) res.status(503).end();
  }
}
