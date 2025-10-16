// src/pages/api/news/slug/[slug].js
import News from '@/models/News';
import { connectDB } from '@/lib/mongodb';
import logger, { LOG_TYPES } from '@/lib/logger';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Slug requis'
      });
    }

    // Récupérer l'article par slug
    const article = await News.findOne({ 
      slug,
      status: 'published'
    })
    .populate('createdBy', 'username')
    .populate('updatedBy', 'username')
    .lean();

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }

    // Récupérer les articles précédent et suivant pour la navigation
    const [previousArticle, nextArticle] = await Promise.all([
      News.findOne({
        status: 'published',
        createdAt: { $lt: article.createdAt }
      })
      .select('_id title slug')
      .sort({ createdAt: -1 })
      .lean(),
      
      News.findOne({
        status: 'published',
        createdAt: { $gt: article.createdAt }
      })
      .select('_id title slug')
      .sort({ createdAt: 1 })
      .lean()
    ]);

    // Logger la consultation
    await logger.info(
      LOG_TYPES.CONTENT_VIEWED,
      'Article consulté par slug',
      {
        articleId: article._id,
        slug: article.slug,
        title: article.title,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }
    );

    res.status(200).json({
      success: true,
      news: article,
      navigation: {
        previous: previousArticle,
        next: nextArticle
      }
    });

  } catch (error) {
    console.error('Erreur récupération article par slug:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur récupération article par slug',
      {
        error: error.message,
        slug: req.query?.slug
      }
    );

    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
}