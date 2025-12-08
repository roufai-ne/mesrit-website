// src/services/statsService.js
import { connectDB } from '@/lib/mongodb';
import { StudentStats } from '@/models/StudentStats';
import { TeacherStats } from '@/models/TeacherStats';
import { InstitutionStats } from '@/models/InstitutionStats';
import { PublicationStats } from '@/models/PublicationStats';

/**
 * Service pour récupérer les statistiques du MESRIT
 * Utilisé par le chatbot pour répondre aux questions sur les chiffres
 */
class StatsService {

  /**
   * Récupérer un résumé des statistiques pour le chatbot
   * @param {number} year - Année (optionnel, prend la plus récente par défaut)
   * @returns {Object} Résumé des statistiques
   */
  static async getStatsSummary(year = null) {
    try {
      await connectDB();

      // Si pas d'année spécifiée, prendre la plus récente
      if (!year) {
        year = new Date().getFullYear();
      }

      // Récupérer les stats en parallèle
      const [
        studentStats,
        teacherStats,
        institutionStats,
        publicationStats
      ] = await Promise.all([
        StudentStats.findOne({ year }).lean(),
        this.getTeacherStats(year),
        InstitutionStats.findOne({ year }).lean(),
        PublicationStats.findOne({ year }).lean()
      ]);

      // Si aucune stat pour l'année demandée, essayer l'année précédente
      if (!studentStats && !institutionStats && !publicationStats) {
        console.log(`[StatsService] No stats for ${year}, trying ${year - 1}`);
        return this.getStatsSummary(year - 1);
      }

      return {
        year,
        students: this.formatStudentStats(studentStats),
        teachers: this.formatTeacherStats(teacherStats),
        institutions: this.formatInstitutionStats(institutionStats),
        publications: this.formatPublicationStats(publicationStats),
        hasData: !!(studentStats || institutionStats || publicationStats)
      };

    } catch (error) {
      console.error('[StatsService] Error fetching stats:', error);
      return {
        year: year || new Date().getFullYear(),
        hasData: false,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les statistiques enseignants (avec fallback)
   */
  static async getTeacherStats(year) {
    try {
      // Essayer le modèle TeacherStats
      const TeacherStatsModel = (await import('@/models/TeacherStats')).TeacherStats;
      return await TeacherStatsModel.findOne({ year }).lean();
    } catch (error) {
      console.warn('[StatsService] TeacherStats model not available');
      return null;
    }
  }

  /**
   * Formater les statistiques étudiants pour le chatbot
   */
  static formatStudentStats(stats) {
    if (!stats) return null;

    return {
      total: stats.totalStudents?.toLocaleString('fr-FR') || 'N/A',
      perCapita: stats.studentsPerCapita || 'N/A',
      gender: {
        male: stats.genderDistribution?.male?.toLocaleString('fr-FR') || 'N/A',
        female: stats.genderDistribution?.female?.toLocaleString('fr-FR') || 'N/A',
        femalePercent: stats.genderDistribution?.female && stats.totalStudents
          ? ((stats.genderDistribution.female / stats.totalStudents) * 100).toFixed(1)
          : 'N/A'
      },
      sector: {
        public: stats.sectorDistribution?.public?.total?.toLocaleString('fr-FR') || 'N/A',
        private: stats.sectorDistribution?.private?.total?.toLocaleString('fr-FR') || 'N/A'
      }
    };
  }

  /**
   * Formater les statistiques enseignants pour le chatbot
   */
  static formatTeacherStats(stats) {
    if (!stats) return null;

    // Calculer le total des enseignants publics
    const publicTotal = (stats.publicUniversities || [])
      .reduce((sum, grade) => sum + (grade.total || 0), 0);

    // Total privé
    const privateTotal = stats.privateInstitutions?.total || 0;

    const total = publicTotal + privateTotal;

    return {
      total: total.toLocaleString('fr-FR'),
      public: publicTotal.toLocaleString('fr-FR'),
      private: privateTotal.toLocaleString('fr-FR')
    };
  }

  /**
   * Formater les statistiques établissements pour le chatbot
   */
  static formatInstitutionStats(stats) {
    if (!stats) return null;

    const byType = {};
    stats.institutions?.forEach(inst => {
      if (!byType[inst.type]) {
        byType[inst.type] = { public: 0, private: 0 };
      }
      byType[inst.type][inst.sector] = inst.count;
    });

    return {
      totalPublic: stats.totalPublic || 0,
      totalPrivate: stats.totalPrivate || 0,
      total: (stats.totalPublic || 0) + (stats.totalPrivate || 0),
      byType
    };
  }

  /**
   * Formater les statistiques publications pour le chatbot
   */
  static formatPublicationStats(stats) {
    if (!stats) return null;

    // Top 3 types de publications
    const topTypes = (stats.publicationsByType || [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(p => `${p.type}: ${p.count}`);

    // Top 3 domaines
    const topDomains = (stats.publicationsByDomain || [])
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(p => `${p.domain}: ${p.count}`);

    return {
      total: stats.totalPublications?.toLocaleString('fr-FR') || 'N/A',
      international: stats.publicationsByScope?.international?.toLocaleString('fr-FR') || 'N/A',
      national: stats.publicationsByScope?.national?.toLocaleString('fr-FR') || 'N/A',
      topTypes: topTypes.length > 0 ? topTypes : null,
      topDomains: topDomains.length > 0 ? topDomains : null,
      indexed: stats.qualityMetrics?.indexedPublications?.toLocaleString('fr-FR') || 'N/A',
      citations: stats.qualityMetrics?.citationsTotal?.toLocaleString('fr-FR') || 'N/A'
    };
  }

  /**
   * Générer un texte de résumé pour le prompt du chatbot
   */
  static generateSummaryText(summary) {
    if (!summary.hasData) {
      return "Aucune donnée statistique disponible pour le moment.";
    }

    const parts = [];
    parts.push(`STATISTIQUES ${summary.year}:`);

    // Étudiants
    if (summary.students) {
      const s = summary.students;
      parts.push(
        `\nÉTUDIANTS:`,
        `- Total: ${s.total} étudiants`,
        `- Répartition: ${s.gender.male} hommes (${100 - parseFloat(s.gender.femalePercent || 0)}%), ${s.gender.female} femmes (${s.gender.femalePercent}%)`,
        `- Secteur: ${s.sector.public} public, ${s.sector.private} privé`
      );
    }

    // Enseignants
    if (summary.teachers) {
      const t = summary.teachers;
      parts.push(
        `\nENSEIGNANTS:`,
        `- Total: ${t.total} enseignants`,
        `- ${t.public} dans le public, ${t.private} dans le privé`
      );
    }

    // Établissements
    if (summary.institutions) {
      const i = summary.institutions;
      parts.push(
        `\nÉTABLISSEMENTS:`,
        `- Total: ${i.total} (${i.totalPublic} publics, ${i.totalPrivate} privés)`
      );

      if (Object.keys(i.byType).length > 0) {
        Object.entries(i.byType).forEach(([type, counts]) => {
          const total = counts.public + counts.private;
          if (total > 0) {
            parts.push(`  * ${type}: ${total} (${counts.public} public, ${counts.private} privé)`);
          }
        });
      }
    }

    // Publications
    if (summary.publications) {
      const p = summary.publications;
      parts.push(
        `\nPUBLICATIONS SCIENTIFIQUES:`,
        `- Total: ${p.total} publications`,
        `- Portée: ${p.international} internationales, ${p.national} nationales`,
        `- Qualité: ${p.indexed} indexées, ${p.citations} citations`
      );

      if (p.topTypes) {
        parts.push(`- Types principaux: ${p.topTypes.join(', ')}`);
      }

      if (p.topDomains) {
        parts.push(`- Domaines principaux: ${p.topDomains.join(', ')}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Rechercher des statistiques spécifiques selon une question
   */
  static async searchStats(question, year = null) {
    const lowerQuestion = question.toLowerCase();

    // Détecter le type de statistique demandé
    const wantsStudents = /étudiant|élève|inscription|effectif/i.test(question);
    const wantsTeachers = /enseignant|professeur|personnel académique/i.test(question);
    const wantsInstitutions = /établissement|université|institut|école/i.test(question);
    const wantsPublications = /publication|recherche|scientifique|article/i.test(question);

    // Si demande spécifique, ne récupérer que ces stats
    if (wantsStudents || wantsTeachers || wantsInstitutions || wantsPublications) {
      try {
        await connectDB();
        const targetYear = year || new Date().getFullYear();

        const result = {
          year: targetYear,
          hasData: false
        };

        if (wantsStudents) {
          const stats = await StudentStats.findOne({ year: targetYear }).lean();
          if (stats) {
            result.students = this.formatStudentStats(stats);
            result.hasData = true;
          }
        }

        if (wantsTeachers) {
          const stats = await this.getTeacherStats(targetYear);
          if (stats) {
            result.teachers = this.formatTeacherStats(stats);
            result.hasData = true;
          }
        }

        if (wantsInstitutions) {
          const stats = await InstitutionStats.findOne({ year: targetYear }).lean();
          if (stats) {
            result.institutions = this.formatInstitutionStats(stats);
            result.hasData = true;
          }
        }

        if (wantsPublications) {
          const stats = await PublicationStats.findOne({ year: targetYear }).lean();
          if (stats) {
            result.publications = this.formatPublicationStats(stats);
            result.hasData = true;
          }
        }

        return result;
      } catch (error) {
        console.error('[StatsService] Error in searchStats:', error);
        return { hasData: false, error: error.message };
      }
    }

    // Sinon, retourner toutes les stats
    return this.getStatsSummary(year);
  }
}

export default StatsService;
