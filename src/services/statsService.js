// src/services/statsService.js
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStatistic } from '@/utils/strapiMapper';

/**
 * Service pour récupérer les statistiques du MESRIT (Version Strapi)
 * Utilise l'endpoint /statistics de Strapi
 */
class StatsService {

  /**
   * Récupérer toutes les statistiques formatées
   */
  static async getAllStats() {
    try {
      const data = await fetchAPI(endpoints.statistics, {
        pagination: { limit: 100 },
        sort: ['order:asc']
      });

      if (!data?.data) return [];

      return data.data.map(mapStatistic);
    } catch (error) {
      console.error('[StatsService] Error fetching stats:', error);
      return [];
    }
  }

  /**
   * Récupérer un résumé des statistiques pour le chatbot
   */
  static async getStatsSummary() {
    try {
      const stats = await this.getAllStats();

      if (stats.length === 0) {
        return { hasData: false };
      }

      // Group by category/context if possible, otherwise list all
      // The current Strapi model is simple (key, value, label).

      const formattedStats = stats.map(s => `- ${s.label}: ${s.value}${s.suffix ? ' ' + s.suffix : ''}`).join('\n');

      return {
        hasData: true,
        statsText: formattedStats,
        raw: stats
      };

    } catch (error) {
      console.error('[StatsService] Error getting summary:', error);
      return { hasData: false, error: error.message };
    }
  }

  /**
   * Générer un texte de résumé pour le prompt du chatbot
   */
  static generateSummaryText(summary) {
    if (!summary || !summary.hasData) {
      return "Aucune donnée statistique disponible pour le moment.";
    }

    return `STATISTIQUES OFFICIELLES :\n${summary.statsText}`;
  }

  /**
   * Rechercher des statistiques spécifiques selon une question
   * (Filtre simple côté client sur les labels)
   */
  static async searchStats(question) {
    const lowerQuestion = question.toLowerCase();
    const summary = await this.getStatsSummary();

    if (!summary.hasData) {
      return summary;
    }

    // Filter relevant stats
    const relevantStats = summary.raw.filter(s => {
      const text = (s.label + ' ' + s.key).toLowerCase();
      // Basic keyword matching from question
      const keywords = lowerQuestion.split(' ').filter(w => w.length > 3);
      return keywords.some(k => text.includes(k));
    });

    if (relevantStats.length > 0) {
      const formatted = relevantStats.map(s => `- ${s.label}: ${s.value}${s.suffix ? ' ' + s.suffix : ''}`).join('\n');
      return {
        hasData: true,
        statsText: formatted,
        raw: relevantStats
      };
    }

    // Fallback to all stats if specific search fails but we have data
    // (Or maybe return empty? Better to return all context than nothing for AI)
    return summary;
  }
}

export default StatsService;
