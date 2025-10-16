// src/pages/api/newsletter/config.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { connectDB } from '@/lib/mongodb';
import NewsletterConfig from '@/models/NewsletterConfig';
import logger, { LOG_TYPES } from '@/lib/logger';

// GET - Récupérer la configuration newsletter
const getConfig = async (req, res) => {
  try {
    await connectDB();
    
    let config = await NewsletterConfig.findOne();
    
    // Créer une configuration par défaut si elle n'existe pas
    if (!config) {
      config = await NewsletterConfig.create({
        autoSendEnabled: true,
        sendType: 'immediate',
        includedCategories: [],
        excludedCategories: [],
        digestTime: '09:00',
        weeklyDigestDay: 1,
        emailSignature: 'Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation Technologique\\nRépublique du Niger',
        lastModifiedBy: req.user?.username || req.user?.id || 'system'
      });
    }
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Consultation configuration newsletter',
      {
        adminId: req.user?.id,
        adminUsername: req.user?.username
      },
      req
    );
    
    res.status(200).json(config);
    
  } catch (error) {
    console.error('Erreur récupération config newsletter:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur récupération config newsletter',
      {
        error: error.message,
        adminId: req.user?.id
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la configuration'
    });
  }
};

// POST - Sauvegarder la configuration newsletter
const saveConfig = async (req, res) => {
  try {
    await connectDB();
    
    const {
      autoSendEnabled,
      sendType,
      includedCategories,
      excludedCategories,
      digestTime,
      weeklyDigestDay,
      emailSignature
    } = req.body;
    
    // Validation des données
    if (sendType && !['immediate', 'daily_digest', 'weekly_digest', 'manual_only'].includes(sendType)) {
      return res.status(400).json({
        success: false,
        error: 'Type d\'envoi invalide'
      });
    }
    
    if (weeklyDigestDay !== undefined && (weeklyDigestDay < 0 || weeklyDigestDay > 6)) {
      return res.status(400).json({
        success: false,
        error: 'Jour de la semaine invalide'
      });
    }
    
    // Mettre à jour ou créer la configuration
    const configData = {
      autoSendEnabled: autoSendEnabled !== undefined ? autoSendEnabled : true,
      sendType: sendType || 'immediate',
      includedCategories: includedCategories || [],
      excludedCategories: excludedCategories || [],
      digestTime: digestTime || '09:00',
      weeklyDigestDay: weeklyDigestDay !== undefined ? weeklyDigestDay : 1,
      emailSignature: emailSignature || 'MESRIT Niger',
      lastModifiedBy: req.user?.username || req.user?.id || 'admin',
      lastModifiedAt: new Date()
    };
    
    const config = await NewsletterConfig.findOneAndUpdate(
      {}, // Pas de filtre car il n'y a qu'une seule config
      configData,
      { 
        new: true, 
        upsert: true, // Créer si n'existe pas
        runValidators: true 
      }
    );
    
    await logger.info(
      LOG_TYPES.ADMIN_ACTION,
      'Configuration newsletter mise à jour',
      {
        adminId: req.user?.id,
        adminUsername: req.user?.username,
        changes: {
          autoSendEnabled: config.autoSendEnabled,
          sendType: config.sendType,
          categoriesIncluded: config.includedCategories.length,
          categoriesExcluded: config.excludedCategories.length
        }
      },
      req
    );
    
    res.status(200).json({
      success: true,
      message: 'Configuration sauvegardée avec succès',
      data: config
    });
    
  } catch (error) {
    console.error('Erreur sauvegarde config newsletter:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur sauvegarde config newsletter',
      {
        error: error.message,
        adminId: req.user?.id,
        requestBody: req.body
      },
      req
    );
    
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la sauvegarde de la configuration'
    });
  }
};

export default apiHandler(
  {
    GET: getConfig,
    POST: saveConfig
  },
  {
    GET: ROUTE_TYPES.PROTECTED,  // Admin seulement
    POST: ROUTE_TYPES.PROTECTED  // Admin seulement
  }
);