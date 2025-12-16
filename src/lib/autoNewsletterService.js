// src/lib/autoNewsletterService.js
import { fetchAPI, endpoints, getStrapiURL } from '@/lib/strapi';
import logger, { LOG_TYPES } from '@/lib/logger';
import nodemailer from 'nodemailer';

/**
 * Service d'envoi automatique de newsletter lors de publication d'actualités (Version Strapi)
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
      // 1. Vérifier la configuration
      // TODO: Créer un Single Type 'NewsletterConfig' dans Strapi pour gérer ça dynamiquement
      const autoSendEnabled = true; // Par défaut actif
      // const excludedCategories = ['Communiqué']; 

      if (!autoSendEnabled) {
        return { success: false, reason: 'Envoi automatique désactivé' };
      }

      // 2. Récupérer les abonnés actifs via Strapi
      const subscribersData = await fetchAPI(endpoints.subscribers, {
        filters: { status: 'active' },
        pagination: { limit: -1 } // Tous les abonnés
      });

      const subscribers = subscribersData?.data || [];

      if (subscribers.length === 0) {
        console.log('Aucun abonné actif trouvé');
        return { success: false, reason: 'Aucun abonné actif' };
      }

      // 3. Générer le contenu de l'email
      const emailContent = this.generateEmailTemplate(article);
      const subject = `Nouvelle actualité MESRIT : ${article.title}`;

      // 4. Configurer le transporteur email
      const transporter = nodemailer.createTransport({
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

      // 5. Envoyer à tous les abonnés
      // Note: Pour une grosse liste, utiliser une queue (Redis/Bull) serait mieux
      for (const subscriber of subscribers) {
        try {
          const subAttrs = subscriber.attributes || subscriber;
          const unsubscribeToken = subAttrs.unsubscribeToken || 'token-missing';
          const unsubscribeLink = `${process.env.NEXT_PUBLIC_BASE_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`;

          const info = await transporter.sendMail({
            from: `"MESRIT Niger" <${process.env.SMTP_USER}>`,
            to: subAttrs.email,
            subject: subject,
            html: emailContent + `
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #666; text-align: center;">
                Vous recevez cet email car vous êtes abonné à la newsletter MESRIT.<br/>
                <a href="${unsubscribeLink}" style="color: #007bff;">Se désinscrire</a>
              </p>
            `,
          });

          results.push({ email: subAttrs.email, status: 'success' });
          successCount++;

        } catch (error) {
          console.error(`Erreur envoi pour ${subscriber.email}:`, error.message);
          results.push({
            email: subscriber.email, // Might fail if subscriber is undefined, but loop protects it
            status: 'error',
            error: error.message
          });
          errorCount++;
        }
      }

      // 6. Logger l'opération globale
      await logger.info(
        LOG_TYPES.CONTENT_PUBLISHED,
        `Newsletter automatique envoyée pour: ${article.title}`,
        {
          articleId: article.id,
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
    const articleUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/actualites/${article.slug}`;

    // Gérer l'image (Strapi format)
    let imageUrl = null;
    if (article.cover?.data?.attributes?.url) {
      imageUrl = getStrapiURL(article.cover.data.attributes.url);
    } else if (article.image) {
      // Fallback for mapped object
      imageUrl = article.image.startsWith('http') ? article.image : getStrapiURL(article.image);
    }

    // Extraire un extrait du contenu (200 premiers caractères)
    const contentText = article.content || article.summary || '';
    const excerpt = contentText.replace(/<[^>]*>/g, '').substring(0, 200) + '...';

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
            <strong>Publié le:</strong> ${new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('fr-FR')}
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

  // Legacy methods kept but simplified or stubbed if not used
  static async isAutoSendEnabled() { return true; }
  static async createWeeklyDigest() { return { success: false, reason: 'Not implemented for Strapi yet' }; }
  static generateDigestTemplate(articles) { return ''; }
}

export default AutoNewsletterService;