// src/pages/api/chat.js
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import AIChatService from '@/lib/aiChatService';
import logger, { LOG_TYPES } from '@/lib/logger';

// POST - Envoyer un message au chatbot (public avec rate limiting)
const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [], provider = 'openai' } = req.body;

    console.log('[Chat API] Nouvelle requête chat');

    // Validation du message
    const validation = AIChatService.validateMessage(message);
    if (!validation.valid) {
      console.log('[Chat API] Message invalide:', validation.reason);
      return res.status(400).json({
        success: false,
        error: validation.reason
      });
    }

    // Limiter l'historique pour éviter de dépasser les limites de tokens
    const limitedHistory = conversationHistory.slice(-10); // Garder les 10 derniers messages

    console.log('[Chat API] Message validé, génération de la réponse...');

    // Générer la réponse
    const result = await AIChatService.chat(message, limitedHistory, provider);

    if (!result.success) {
      console.error('[Chat API] Erreur génération réponse:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error,
        ...(process.env.NODE_ENV === 'development' && {
          technicalError: result.technicalError
        })
      });
    }

    console.log('[Chat API] Réponse générée avec succès');

    // Logger l'interaction (non-bloquant)
    try {
      await logger.info(
        LOG_TYPES.SYSTEM_INFO,
        'Interaction chatbot',
        {
          messageLength: message.length,
          responseLength: result.message.length,
          provider: provider,
          tokensUsed: result.usage?.total_tokens
        },
        req
      );
    } catch (logError) {
      console.warn('[Chat API] Erreur logging:', logError.message);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      usage: result.usage
    });

  } catch (error) {
    console.error('[Chat API] Erreur inattendue:', error);

    // Logger l'erreur
    try {
      await logger.error(
        LOG_TYPES.SYSTEM_ERROR,
        'Erreur API chat',
        {
          error: error.message,
          stack: error.stack
        },
        req
      );
    } catch (logError) {
      console.error('[Chat API] Erreur lors du logging:', logError.message);
    }

    return res.status(500).json({
      success: false,
      error: 'Une erreur est survenue. Veuillez réessayer.',
      ...(process.env.NODE_ENV === 'development' && {
        technicalError: error.message,
        stack: error.stack
      })
    });
  }
};

// Configuration des types de routes
export default apiHandler(
  {
    POST: sendMessage
  },
  {
    POST: ROUTE_TYPES.PUBLIC // Public mais avec rate limiting
  }
);
