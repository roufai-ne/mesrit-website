// src/pages/api/chat.js
import { apiHandler, ROUTE_TYPES, rateLimiters } from '@/middleware/securityMiddleware';
import AIChatService from '@/lib/aiChatService';
import logger, { LOG_TYPES } from '@/lib/logger';

// POST - Envoyer un message au chatbot (public avec rate limiting)
const sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [], provider: rawProvider = 'groq' } = req.body;
    const VALID_PROVIDERS = ['groq', 'openai', 'claude'];
    const provider = VALID_PROVIDERS.includes(rawProvider) ? rawProvider : 'groq';

    // Check Rate Limit
    if (!rateLimiters.chat.check(req, res)) {
      console.warn(`[Chat API] Rate limit exceeded for IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
      return res.status(429).json({
        success: false,
        error: 'Trop de requêtes. Veuillez patienter une minute.'
      });
    }

    console.info('[Chat API] Nouvelle requête chat');

    // Validation du message
    const validation = AIChatService.validateMessage(message);
    if (!validation.valid) {
      console.info('[Chat API] Message invalide:', validation.reason);
      return res.status(400).json({
        success: false,
        error: validation.reason
      });
    }

    // Valider et assainir l'historique : exclure les rôles système, ne garder que
    // les champs attendus, et limiter pour ne pas dépasser les quotas de tokens
    const ALLOWED_ROLES = new Set(['user', 'assistant']);
    const limitedHistory = (Array.isArray(conversationHistory) ? conversationHistory : [])
      .filter(item =>
        item &&
        typeof item === 'object' &&
        ALLOWED_ROLES.has(item.role) &&
        typeof item.content === 'string' &&
        item.content.length <= 2000
      )
      .map(item => ({ role: item.role, content: item.content }))
      .slice(-10);

    console.info('[Chat API] Message validé, génération de la réponse...');

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

    console.info('[Chat API] Réponse générée avec succès');

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
