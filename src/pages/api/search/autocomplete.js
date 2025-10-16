// src/pages/api/search/autocomplete.js
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import Document from '@/models/Document';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';
import { validators, safeValidate } from '@/lib/validation';

// Autocomplete validation schema
const autocompleteSchema = {
  q: (value) => {
    if (!value) return '';
    return validators.string(value, { 
      minLength: 1, 
      maxLength: 100,
      pattern: /^[\w\s\-\.\u00c0-\u00ff]+$/,
      patternMessage: 'Le terme de recherche contient des caractères invalides'
    });
  },
  limit: (value) => {
    if (!value) return 8;
    return validators.number(value, { min: 1, max: 20, integer: true });
  }
};

// Get autocomplete suggestions with caching
const getAutocompleteSuggestions = async (query, limit = 8) => {
  try {
    const suggestions = new Map(); // Use Map to maintain order and avoid duplicates
    
    if (query.length < 2) {
      return [];
    }
    
    // Build regex for prefix matching with length validation to prevent ReDoS
    const maxQueryLength = 30;
    const safeQuery = query.length > maxQueryLength ? query.slice(0, maxQueryLength) : query;
    const prefixRegex = new RegExp(`\\b${safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    
    // Search in news titles
    const newsResults = await News.find(
      { 
        title: { $regex: prefixRegex },
        status: 'published'
      },
      { title: 1, createdAt: 1 }
    )
    .sort({ createdAt: -1 })
    .limit(limit * 2)
    .lean();
    
    // Extract meaningful terms from news titles
    newsResults.forEach(news => {
      const words = news.title.split(/[\s\-\.,;:]+/);
      words.forEach(word => {
        const cleanWord = word.trim().toLowerCase();
        if (cleanWord.length > 2 && cleanWord.startsWith(query.toLowerCase())) {
          if (!suggestions.has(cleanWord)) {
            suggestions.set(cleanWord, {
              text: cleanWord,
              type: 'term',
              source: 'news',
              frequency: 1
            });
          } else {
            suggestions.get(cleanWord).frequency++;
          }
        }
      });
      
      // Add full title if it's a good match
      const titleLower = news.title.toLowerCase();
      if (titleLower.includes(query.toLowerCase()) && !suggestions.has(titleLower)) {
        suggestions.set(titleLower, {
          text: news.title,
          type: 'title',
          source: 'news',
          frequency: 5, // Higher frequency for full titles
          id: news._id
        });
      }
    });
    
    // Search in document titles
    const documentResults = await Document.find(
      { 
        title: { $regex: prefixRegex },
        status: 'published'
      },
      { title: 1, type: 1, createdAt: 1 }
    )
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
    
    documentResults.forEach(doc => {
      const titleLower = doc.title.toLowerCase();
      if (titleLower.includes(query.toLowerCase()) && !suggestions.has(titleLower)) {
        suggestions.set(titleLower, {
          text: doc.title,
          type: 'title',
          source: 'document',
          frequency: 4,
          id: doc._id,
          docType: doc.type
        });
      }
    });
    
    // Convert to array and sort by frequency and relevance
    const sortedSuggestions = Array.from(suggestions.values())
      .sort((a, b) => {
        // Prioritize exact matches at the beginning
        const aStartsExact = a.text.toLowerCase().startsWith(query.toLowerCase());
        const bStartsExact = b.text.toLowerCase().startsWith(query.toLowerCase());
        
        if (aStartsExact && !bStartsExact) return -1;
        if (!aStartsExact && bStartsExact) return 1;
        
        // Then sort by frequency and type priority
        const typePriority = { title: 3, term: 1 };
        const aPriority = (typePriority[a.type] || 1) * a.frequency;
        const bPriority = (typePriority[b.type] || 1) * b.frequency;
        
        return bPriority - aPriority;
      })
      .slice(0, limit)
      .map(suggestion => ({
        text: suggestion.text,
        type: suggestion.type,
        source: suggestion.source,
        ...(suggestion.id && { id: suggestion.id }),
        ...(suggestion.docType && { docType: suggestion.docType })
      }));
    
    return sortedSuggestions;
    
  } catch (error) {
    console.error('Autocomplete error:', error);
    return [];
  }
};

// Get popular search terms (trending)
const getPopularSearchTerms = async (limit = 5) => {
  try {
    // Get most recent news titles as trending terms
    const recentNews = await News.find(
      { status: 'published' },
      { title: 1, tags: 1 }
    )
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
    const popularTerms = new Set();
    
    recentNews.forEach(news => {
      // Add tags as popular terms
      if (news.tags && Array.isArray(news.tags)) {
        news.tags.forEach(tag => {
          if (tag.length > 3) {
            popularTerms.add(tag.toLowerCase());
          }
        });
      }
      
      // Extract key words from titles
      const words = news.title.split(/[\s\-\.,;:]+/);
      words.forEach(word => {
        const cleanWord = word.trim().toLowerCase();
        if (cleanWord.length > 4 && !commonWords.has(cleanWord)) {
          popularTerms.add(cleanWord);
        }
      });
    });
    
    return Array.from(popularTerms).slice(0, limit);
    
  } catch (error) {
    console.error('Popular terms error:', error);
    return [];
  }
};

// Common words to filter out
const commonWords = new Set([
  'dans', 'avec', 'pour', 'par', 'sur', 'sous', 'entre', 'vers', 'chez',
  'depuis', 'pendant', 'avant', 'après', 'selon', 'contre', 'sans', 'sauf',
  'comme', 'ainsi', 'alors', 'donc', 'mais', 'car', 'or', 'ni', 'soit',
  'que', 'qui', 'quoi', 'dont', 'où', 'comment', 'pourquoi', 'quand',
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'à'
]);

// Main autocomplete handler
const autocompleteHandler = async (req, res) => {
  try {
    await connectDB();
    
    // Validate query parameters
    const validation = safeValidate(req.query, autocompleteSchema);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: validation.fields
      });
    }
    
    const { q: query, limit } = validation.data;
    
    // Handle empty query - return popular terms
    if (!query || query.length < 2) {
      const popularTerms = await getPopularSearchTerms(limit);
      return res.status(200).json({
        suggestions: popularTerms.map(term => ({
          text: term,
          type: 'popular',
          source: 'trending'
        })),
        query: query || '',
        type: 'popular'
      });
    }
    
    // Get autocomplete suggestions
    const suggestions = await getAutocompleteSuggestions(query, limit);
    
    return res.status(200).json({
      suggestions,
      query,
      type: 'autocomplete'
    });
    
  } catch (error) {
    console.error('Autocomplete handler error:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'autocomplétion',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export with security middleware
export default apiHandler({
  GET: autocompleteHandler
}, {
  GET: ROUTE_TYPES.PUBLIC
});