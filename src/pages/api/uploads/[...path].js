// src/pages/api/uploads/[...path].js
// Proxy pour les fichiers statiques Strapi (images, documents)
// Permet d'éviter le blocage "private IP" de Next.js Image Optimization

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }

  const { path } = req.query;
  const filePath = Array.isArray(path) ? path.join('/') : path;
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
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

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
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    }

    const buffer = await upstream.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error(`[Uploads proxy] Erreur pour ${targetUrl}:`, error.message);
    return res.status(503).end();
  }
}
