// src/lib/aiChatService.js
/**
 * Service de chatbot IA pour le site MESRIT
 * Utilise OpenAI API pour répondre aux questions sur le contenu public
 */

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
    // Contexte de base
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
      const wantsStats = userQuestion && /combien|nombre|statistique|chiffre|total|effectif/i.test(userQuestion);

      if (userQuestion) {
        console.log('[AIChatService] Recherche de contenu pertinent pour:', userQuestion);
      }

      // Lancer recherche de contenu et stats en parallèle
      const [relevantContent, statsResult] = await Promise.all([
        userQuestion
          ? SearchService.adaptiveSearch(userQuestion, { maxResults: 5 })
          : SearchService.getGeneralContext(5),
        wantsStats
          ? StatsService.searchStats(userQuestion).catch(err => {
              console.warn('[AIChatService] Stats unavailable:', err.message);
              return null;
            })
          : Promise.resolve(null),
      ]);

      const statistics = statsResult?.hasData
        ? StatsService.generateSummaryText(statsResult)
        : null;

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
        statistics
      };
    } catch (error) {
      console.error('[AIChatService] Erreur récupération contexte:', error.message);

      // Retourner un contexte minimal mais fonctionnel
      return {
        siteInfo,
        relevantContent: [],
        degradedMode: true,
        ...(process.env.NODE_ENV === 'development' && { error: error.message })
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
5. JAMAIS d'informations inventé - reste fidèle au contexte fourni
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
   ${item.content ? `Contenu: ${item.content}` : ''}
   URL: ${item.url}
`).join('\n')}
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
        model: 'gpt-4o-mini',
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
        model: 'claude-haiku-4-5-20251001',
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
        const err = new Error(`API_KEY_MISSING:${apiProvider}`);
        err.isConfigError = true;
        throw err;
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

      if (error.isConfigError || error.message.startsWith('API_KEY_MISSING') || error.message.toLowerCase().includes('api key')) {
        errorMessage = "Le service de chat n'est pas configuré. Veuillez contacter l'administrateur.";
      } else if (error.message.toLowerCase().includes('rate limit') || error.message.includes('429')) {
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

    // Filtrage des tentatives de prompt injection et contenu inapproprié
    const blockedPatterns = [
      // Prompt injection classique
      /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i,
      /you\s+are\s+now\s+/i,
      /act\s+as\s+(if\s+you\s+(are|were)|a\s+)/i,
      /forget\s+(everything|all)\s+(you|your)/i,
      /new\s+persona/i,
      /jailbreak/i,
      /DAN\b/,
      // Tentatives d'exfiltration de la config système
      /system\s+prompt/i,
      /reveal\s+(your\s+)?(instructions?|prompt|system)/i,
      /print\s+(your\s+)?(instructions?|prompt|system)/i,
      // Contenu hors périmètre manifeste
      /\b(spam|phishing)\b/i,
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(trimmed)) {
        return { valid: false, reason: 'Contenu inapproprié détecté' };
      }
    }

    return { valid: true };
  }
}

export default AIChatService;
