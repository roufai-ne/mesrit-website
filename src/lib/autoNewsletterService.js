// src/lib/autoNewsletterService.js
import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import Log from '@/models/Log';
import logger, { LOG_TYPES } from '@/lib/logger';
import nodemailer from 'nodemailer';

/**
 * Service d'envoi automatique de newsletter lors de publication d'actualités
 */
export class AutoNewsletterService {
  
  /**
   * Envoyer automatiquement une newsletter pour une nouvelle actualité
   */
  static async notifyNewArticle(article, publishedBy = 'system') {
    if (!article || article.status !== 'published') {
      console.log('Article non publié, pas d\'envoi newsletter');
      return { success: false, reason: 'Article non publié' };
    }

    try {
      await connectDB();
      
      // Vérifier si l'envoi automatique est activé pour cette catégorie
      const autoSendEnabled = await this.isAutoSendEnabled(article.category);
      if (!autoSendEnabled) {
        console.log(`Envoi automatique désactivé pour la catégorie: ${article.category}`);
        return { success: false, reason: `Envoi automatique désactivé pour la catégorie: ${article.category}` };
      }

      // Récupérer les abonnés actifs
      const subscribers = await Newsletter.find({ status: 'active' });
      
      if (subscribers.length === 0) {
        console.log('Aucun abonné actif trouvé');
        return { success: false, reason: 'Aucun abonné actif' };
      }

      // Générer le contenu de l'email
      const emailContent = this.generateEmailTemplate(article);
      const subject = `Nouvelle actualité MESRIT : ${article.title}`;

      // Configurer le transporteur email
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const results = [];
      let successCount = 0;
      let errorCount = 0;

      // Envoyer à tous les abonnés
      for (const subscriber of subscribers) {
        try {
          const unsubscribeLink = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
          
          const info = await transporter.sendMail({
            from: `"MESRIT Niger" <${process.env.SMTP_USER}>`,
            to: subscriber.email,
            subject: subject,
            html: emailContent + `
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #666; text-align: center;">
                Vous recevez cet email car vous êtes abonné à la newsletter MESRIT.<br/>
                <a href="${unsubscribeLink}" style="color: #007bff;">Se désinscrire</a>
              </p>
            `,
          });

          // Logger le succès
          await Log.create({
            email: subscriber.email,
            status: 'success',
            message: 'Newsletter automatique envoyée avec succès',
            content: `Actualité: ${article.title}`,
            response: info.response,
            timestamp: new Date(),
          });

          results.push({ email: subscriber.email, status: 'success' });
          successCount++;

        } catch (error) {
          // Logger l'erreur
          await Log.create({
            email: subscriber.email,
            status: 'error',
            message: 'Erreur envoi newsletter automatique',
            content: `Actualité: ${article.title}`,
            error: error.message,
            timestamp: new Date(),
          });

          results.push({ 
            email: subscriber.email, 
            status: 'error', 
            error: error.message 
          });
          errorCount++;
        }
      }

      // Logger l'opération globale
      await logger.info(
        LOG_TYPES.CONTENT_PUBLISHED,
        `Newsletter automatique envoyée pour: ${article.title}`,
        {
          articleId: article._id,
          articleTitle: article.title,
          totalSubscribers: subscribers.length,
          successCount,
          errorCount,
          publishedBy
        }
      );

      console.log(`Newsletter automatique envoyée: ${successCount} succès, ${errorCount} erreurs`);

      return {
        success: true,
        totalSent: subscribers.length,
        successCount,
        errorCount,
        results
      };

    } catch (error) {
      console.error('Erreur envoi newsletter automatique:', error);
      
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur envoi newsletter automatique',
        {
          articleId: article._id,
          articleTitle: article.title,
          error: error.message,
          publishedBy
        }
      );

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Générer le template HTML pour l'email automatique
   */
  static generateEmailTemplate(article) {
    const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/actualites/${article._id}`;
    const imageUrl = article.image ? 
      (article.image.startsWith('http') ? article.image : `${process.env.NEXT_PUBLIC_BASE_URL}${article.image}`) 
      : null;

    // Extraire un extrait du contenu (200 premiers caractères)
    const excerpt = article.content ? 
      article.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' 
      : 'Découvrez cette nouvelle actualité sur notre site.';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle actualité MESRIT</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #FF6B35, #2E8B57); color: white; border-radius: 8px;">
          <h1 style="margin: 0; font-size: 24px;">MESRIT Niger</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Nouvelle actualité disponible</p>
        </div>

        <!-- Content -->
        <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2E8B57; margin-top: 0; font-size: 22px; line-height: 1.3;">
            ${article.title}
          </h2>
          
          ${imageUrl ? `
            <img src="${imageUrl}" alt="${article.title}" 
                 style="width: 100%; max-width: 500px; height: auto; border-radius: 6px; margin: 15px 0;" />
          ` : ''}
          
          <p style="font-size: 16px; line-height: 1.6; color: #555; margin: 15px 0;">
            ${excerpt}
          </p>
          
          <div style="margin: 25px 0;">
            <a href="${articleUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #FF6B35, #2E8B57); 
                      color: white; text-decoration: none; padding: 12px 25px; 
                      border-radius: 6px; font-weight: bold; font-size: 16px;">
              Lire l'article complet →
            </a>
          </div>
          
          ${article.category ? `
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              <strong>Catégorie:</strong> ${article.category}
            </p>
          ` : ''}
          
          <p style="font-size: 14px; color: #666;">
            <strong>Publié le:</strong> ${new Date(article.date || article.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee;">
          <p style="margin: 0;">
            Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique
          </p>
          <p style="margin: 5px 0 0 0;">
            République du Niger
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Vérifier si l'envoi automatique est activé
   */
  static async isAutoSendEnabled(category = null) {
    try {
      const NewsletterConfig = (await import('@/models/NewsletterConfig')).default;
      
      // Récupérer la configuration (créer une par défaut si n'existe pas)
      let config = await NewsletterConfig.findOne();
      
      if (!config) {
        config = await NewsletterConfig.create({
          autoSendEnabled: true,
          sendType: 'immediate',
          lastModifiedBy: 'system'
        });
      }
      
      if (!config.autoSendEnabled) {
        return false;
      }
      
      // Vérifier les catégories incluses/exclues
      if (category) {
        if (config.excludedCategories.includes(category)) {
          return false;
        }
        
        if (config.includedCategories.length > 0 && !config.includedCategories.includes(category)) {
          return false;
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('Erreur vérification config newsletter:', error);
      // En cas d'erreur, désactiver par sécurité
      return false;
    }
  }

  /**
   * Créer un digest des actualités récentes
   */
  static async createWeeklyDigest() {
    try {
      await connectDB();
      
      // Récupérer les actualités de la semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { default: News } = await import('@/models/News');
      const recentNews = await News.find({
        status: 'published',
        date: { $gte: oneWeekAgo }
      }).sort({ date: -1 }).limit(10);

      if (recentNews.length === 0) {
        console.log('Aucune actualité récente pour le digest');
        return { success: false, reason: 'Aucune actualité récente' };
      }

      // Générer le template digest
      const digestContent = this.generateDigestTemplate(recentNews);
      
      // Envoyer aux abonnés
      const subscribers = await Newsletter.find({ status: 'active' });
      
      // TODO: Implémenter l'envoi du digest
      console.log(`Digest prêt pour ${subscribers.length} abonnés`);
      
      return {
        success: true,
        articlesCount: recentNews.length,
        subscribersCount: subscribers.length
      };

    } catch (error) {
      console.error('Erreur création digest:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Générer le template pour le digest hebdomadaire
   */
  static generateDigestTemplate(articles) {
    const articlesHtml = articles.map(article => {
      const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/actualites/${article._id}`;
      const excerpt = article.content ? 
        article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
        : '';

      return `
        <div style="margin-bottom: 25px; padding: 15px; border-left: 4px solid #2E8B57; background: #f9f9f9;">
          <h3 style="margin: 0 0 10px 0; color: #2E8B57;">
            <a href="${articleUrl}" style="color: #2E8B57; text-decoration: none;">
              ${article.title}
            </a>
          </h3>
          <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
            ${excerpt}
          </p>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${article.category} • ${new Date(article.date).toLocaleDateString('fr-FR')}
          </p>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Digest Hebdomadaire MESRIT</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #FF6B35, #2E8B57); color: white; border-radius: 8px;">
          <h1 style="margin: 0;">MESRIT Niger</h1>
          <p style="margin: 5px 0 0 0;">Actualités de la semaine</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2E8B57;">Les actualités de cette semaine</h2>
          ${articlesHtml}
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px; border-top: 1px solid #eee;">
          <p>Ministère de l'Enseignement Supérieur, de la Recherche et de l'Innovation Technologique</p>
        </div>
      </body>
      </html>
    `;
  }
}

export default AutoNewsletterService;