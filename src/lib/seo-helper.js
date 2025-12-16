/**
 * Helper SEO pour le client (Portage de autoSEO.js)
 * Permet d'analyser et générer des metadata sans dépendance backend.
 */

export const SEOHelper = {
    /**
     * Générer un slug à partir d'un texte
     */
    slugify(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 60)
            .replace(/-[^-]*$/, '');
    },

    /**
     * Générer une meta description
     */
    generateMetaDescription(content, maxLength = 160) {
        if (!content) return '';
        const cleanContent = content
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (cleanContent.length <= maxLength) return cleanContent;

        let description = cleanContent.substring(0, maxLength);
        const lastSentence = description.lastIndexOf('.');
        const lastSpace = description.lastIndexOf(' ');

        if (lastSentence > maxLength * 0.7) {
            description = description.substring(0, lastSentence + 1);
        } else if (lastSpace > maxLength * 0.8) {
            description = description.substring(0, lastSpace) + '...';
        } else {
            description = description.substring(0, maxLength - 3) + '...';
        }
        return description;
    },

    /**
     * Extraire les mots-clés
     */
    extractKeywords(title, content, maxKeywords = 10) {
        const stopWords = new Set([
            'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais',
            'donc', 'car', 'ni', 'que', 'qui', 'quoi', 'dont', 'où', 'ce', 'cet',
            'cette', 'ces', 'est', 'sont', 'pour', 'par', 'sur', 'dans'
        ]);

        const text = `${title} ${title} ${content}`.toLowerCase();
        const words = text
            .replace(/<[^>]*>/g, '')
            .replace(/[^\w\sàâäéèêëïîôöùûüÿç]/g, ' ')
            .split(/\s+/)
            .filter(word =>
                word.length >= 4 &&
                !stopWords.has(word) &&
                !/^\d+$/.test(word)
            );

        const wordCount = {};
        words.forEach(word => wordCount[word] = (wordCount[word] || 0) + 1);

        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, maxKeywords)
            .map(([word]) => word);
    },

    /**
     * Calculer le score SEO
     */
    calculateSEOScore(title, content, metaDescription, keywordCount) {
        let score = 0;
        const checks = {};

        // Titre
        if (title?.length >= 30 && title?.length <= 60) {
            score += 20;
            checks.title = 'Perfect';
        } else {
            score += 5;
            checks.title = 'Needs Improvement';
        }

        // Description
        if (metaDescription?.length >= 120 && metaDescription?.length <= 160) {
            score += 20;
            checks.desc = 'Perfect';
        } else {
            score += 5;
            checks.desc = 'Needs Improvement';
        }

        // Content
        const contentLength = content?.replace(/<[^>]*>/g, '').length || 0;
        if (contentLength > 300) score += 20;
        else score += 5;

        // Keywords
        if (keywordCount >= 5) score += 20;
        else score += 5;

        return {
            total: Math.min(score, 100),
            details: checks
        };
    }
};
