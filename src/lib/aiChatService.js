// src/lib/aiChatService.js
/**
 * Service de chatbot IA pour le site MESRIT
 * Utilise OpenAI API pour répondre aux questions sur le contenu public
 */

import { connectDB } from './mongodb';
import News from '@/models/News';
import SearchService from '@/services/search';
import StatsService from '@/services/statsService';

/**
 * Service de chat IA
 */
export class AIChatService {

  /**
   * Récupérer le contexte depuis le contenu du site
   * Utilise désormais la recherche intelligente pour un contexte pertinent
   */
  static async getSiteContext(userQuestion = null) {
    // Contexte de base (toujours disponible, même sans MongoDB)
    const siteInfo = {
      name: "MESRIT - Ministère de l'Enseignement Supérieur de la Recherche et de l'Innovation Technologique",
      description: "Site officiel du MESRIT",
      sections: [
        "Ministère et Organisation",
        "Services aux étudiants, chercheurs et établissements",
        "Formations (Licence, Master, Doctorat)",
        "Recherche et Innovation",
        "Coopération Internationale",
        "Actualités et Communiqués",
        "Ressources et Documents"
      ],
      mainUrls: [
        { title: "Accueil", url: "/", description: "Page d'accueil du site MESRIT" },
        { title: "À propos", url: "/a-propos", description: "Informations sur le ministère" },
        { title: "Services", url: "/services", description: "Services disponibles" },
        { title: "Contact", url: "/contact", description: "Nous contacter" }
      ]
    };

    try {
      // Tenter de se connecter à MongoDB
      await connectDB();

      // Si une question est fournie, utiliser la recherche adaptative
      let relevantContent = [];
      if (userQuestion) {
        console.log('[AIChatService] Recherche de contenu pertinent pour:', userQuestion);
        relevantContent = await SearchService.adaptiveSearch(userQuestion, { maxResults: 5 });
      } else {
        // Sinon, récupérer le contexte général
        relevantContent = await SearchService.getGeneralContext(5);
      }

      // Récupérer aussi quelques actualités récentes
      const recentNews = await News.find({ status: 'published' })
        .select('title slug excerpt category createdAt')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

      // Récupérer les statistiques si la question concerne des chiffres
      let statistics = null;
      if (userQuestion && /combien|nombre|statistique|chiffre|total|effectif/i.test(userQuestion)) {
        try {
          const statsResult = await StatsService.searchStats(userQuestion);
          if (statsResult.hasData) {
            statistics = StatsService.generateSummaryText(statsResult);
          }
        } catch (statsError) {
          console.warn('[AIChatService] Stats unavailable:', statsError.message);
        }
      }

      return {
        siteInfo,
        relevantContent: relevantContent.map(item => ({
          type: item.type,
          title: item.title,
          url: item.url,
          section: item.section,
          description: item.description,
          // Limiter le contenu pour économiser les tokens (max 800 chars)
          content: item.content?.substring(0, 800) || item.description
        })),
        recentNews: recentNews.map(news => ({
          title: news.title,
          excerpt: news.excerpt,
          category: news.category,
          date: news.createdAt
        })),
        statistics
      };
    } catch (error) {
      console.error('[AIChatService] Erreur récupération contexte depuis MongoDB:', error.message);
      console.warn('[AIChatService] Utilisation du contexte de base (mode dégradé)');

      // Retourner un contexte minimal mais fonctionnel
      return {
        siteInfo,
        relevantContent: [],
        recentNews: [],
        degradedMode: true
      };
    }
  }

  /**
   * Construire le prompt système avec le contexte du site
   */
  static buildSystemPrompt(context) {
    const degradedModeNotice = context.degradedMode ?
      '\n⚠️ MODE DÉGRADÉ: Base de données indisponible. Tu disposes uniquement des informations générales du site.\n' : '';

    return `Tu es un assistant virtuel pour le site ${context.siteInfo.name}.
${degradedModeNotice}
RÔLE:
Tu dois aider les visiteurs en répondant uniquement aux questions concernant le contenu public du site MESRIT:
- Informations sur le ministère, sa mission et son organisation
- Services aux étudiants, chercheurs et établissements
- Formations (Licence, Master, Doctorat)
- Recherche scientifique et innovation
- Coopération internationale
- Actualités et communiqués
- Ressources et documents officiels

RÈGLES IMPORTANTES:
1. Base tes réponses UNIQUEMENT sur les informations fournies dans le contexte ci-dessous
2. Si la question n'est pas liée au site MESRIT, réponds poliment que tu ne peux aider que pour les informations du site
3. Sois concis, précis et professionnel (max 3-4 phrases)
4. Si tu ne trouves pas l'information exacte dans le contexte, suggère de:
   - Consulter la page concernée (en indiquant l'URL si disponible)
   - Contacter le ministère directement via la page /contact
5. JAMAIS d'informations inventées - reste fidèle au contexte fourni
${context.degradedMode ? '6. En mode dégradé, informe l\'utilisateur que le contenu complet n\'est pas disponible actuellement' : ''}

PAGES PRINCIPALES DU SITE:
${context.siteInfo.mainUrls.map(page => `- ${page.title}: ${page.url} - ${page.description}`).join('\n')}

${context.statistics ? `
STATISTIQUES OFFICIELLES:
${context.statistics}
` : ''}

${context.relevantContent && context.relevantContent.length > 0 ? `
CONTEXTE PERTINENT:
Pages et informations du site:
${context.relevantContent.map((item, i) =>
  `${i + 1}. [${item.type === 'page' ? 'PAGE' : 'ACTUALITÉ'}] ${item.title}
   Section: ${item.section}
   ${item.description ? `Description: ${item.description}` : ''}
   ${item.content ? `Contenu: ${item.content.substring(0, 500)}...` : ''}
   URL: ${item.url}
`).join('\n')}
` : ''}

${context.recentNews && context.recentNews.length > 0 ? `
DERNIÈRES ACTUALITÉS:
${context.recentNews.map((news, i) =>
  `${i + 1}. ${news.title} (${news.category}) - ${news.excerpt || 'Voir l\'actualité pour plus de détails'}`
).join('\n')}
` : ''}

Réponds toujours en français, de manière professionnelle et concise. Cite les URLs quand tu fais référence à des pages spécifiques.`;
  }

  /**
   * Appeler l'API OpenAI
   */
  static async callOpenAI(messages, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API OpenAI');
    }

    return await response.json();
  }

  /**
   * Appeler l'API Claude (Anthropic)
   */
  static async callClaude(messages, apiKey) {
    // Convertir le format des messages pour Claude
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemMessage?.content || '',
        messages: userMessages
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Claude');
    }

    const data = await response.json();

    // Convertir la réponse Claude au format OpenAI
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: data.content[0].text
        }
      }],
      usage: data.usage
    };
  }

  /**
   * Générer une réponse du chatbot
   */
  static async chat(userMessage, conversationHistory = [], apiProvider = 'openai') {
    try {
      // Récupérer la clé API depuis les variables d'environnement
      const apiKey = apiProvider === 'openai'
        ? process.env.OPENAI_API_KEY
        : process.env.ANTHROPIC_API_KEY;

      if (!apiKey) {
        throw new Error(`Clé API ${apiProvider.toUpperCase()} non configurée`);
      }

      // Récupérer le contexte du site avec recherche intelligente
      console.log('[AIChatService] Récupération du contexte pertinent pour:', userMessage);
      const context = await this.getSiteContext(userMessage);

      // Construire les messages
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(context)
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      console.log('[AIChatService] Appel API', apiProvider);

      // Appeler l'API appropriée
      let response;
      if (apiProvider === 'openai') {
        response = await this.callOpenAI(messages, apiKey);
      } else if (apiProvider === 'claude') {
        response = await this.callClaude(messages, apiKey);
      } else {
        throw new Error('Provider IA non supporté');
      }

      const assistantMessage = response.choices[0].message.content;

      console.log('[AIChatService] Réponse générée avec succès');

      return {
        success: true,
        message: assistantMessage,
        usage: response.usage
      };

    } catch (error) {
      console.error('[AIChatService] Erreur génération réponse:', error);

      // Message d'erreur user-friendly
      let errorMessage = "Désolé, je rencontre actuellement un problème technique. Veuillez réessayer dans quelques instants.";

      if (error.message.includes('API key')) {
        errorMessage = "Le service de chat n'est pas configuré. Veuillez contacter l'administrateur.";
      } else if (error.message.includes('rate limit')) {
        errorMessage = "Le service est temporairement surchargé. Veuillez réessayer dans quelques minutes.";
      }

      return {
        success: false,
        error: errorMessage,
        technicalError: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }

  /**
   * Valider une question (filtrage de contenu inapproprié basique)
   */
  static validateMessage(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, reason: 'Message invalide' };
    }

    const trimmed = message.trim();

    if (trimmed.length === 0) {
      return { valid: false, reason: 'Message vide' };
    }

    if (trimmed.length > 1000) {
      return { valid: false, reason: 'Message trop long (max 1000 caractères)' };
    }

    // Filtrage basique de contenu inapproprié (à personnaliser)
    const inappropriatePatterns = [
      /\b(spam|hack|exploit)\b/i
    ];

    for (const pattern of inappropriatePatterns) {
      if (pattern.test(trimmed)) {
        return { valid: false, reason: 'Contenu inapproprié détecté' };
      }
    }

    return { valid: true };
  }
}

export default AIChatService;
