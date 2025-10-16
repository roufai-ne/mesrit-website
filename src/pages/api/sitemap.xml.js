// src/pages/api/sitemap.xml.js
import News from '@/models/News';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mesri.ne';
    
    // Récupérer tous les articles publiés avec slug
      const articles = await News.find({
        status: 'published',
        slug: { $exists: true }
    })
    .select('slug updatedAt')
    .sort({ updatedAt: -1 })
    .lean();
    
    // Générer le XML du sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Page d'accueil -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Pages principales -->
  <url>
    <loc>${baseUrl}/actualites</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/ministere</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/ministere/missions</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/services-etudiants</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/faq</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Articles -->
${articles.map(article => `  <url>
      <loc>${baseUrl}/actualites/${article.slug || article._id}</loc>
      <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${article.slug ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Définir les headers appropriés
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache 1 heure
    
    res.status(200).send(sitemap);
    
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération du sitemap' 
    });
  }
}