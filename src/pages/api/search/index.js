// src/pages/api/search/index.js
import { connectDB } from '@/lib/mongodb';
import News from '@/models/News';
import Document from '@/models/Document';
import { validators, safeValidate } from '@/lib/validation';
import { sanitizeInput } from '@/lib/sanitize';

// Search validation schema
const searchSchema = {
  q: (value) => {
    if (!value) return '';
    return validators.string(value, { 
      minLength: 1, 
      maxLength: 100,
      pattern: /^[\w\s\-\.À-ÿ]+$/,
      patternMessage: 'Le terme de recherche contient des caractères invalides'
    });
  },
  type: (value) => {
    if (!value) return 'all'; // Défaut à 'all' au lieu de null
    return validators.enum(value, ['news', 'document', 'all']);
  },
  limit: (value) => {
    if (!value) return 10;
    return validators.number(value, { min: 1, max: 50, integer: true });
  },
  page: (value) => {
    if (!value) return 1;
    return validators.number(value, { min: 1, max: 100, integer: true });
  }
};

// Enhanced search function with full-text search capabilities
const performSearch = async (query, searchType = 'all', limit = 10, page = 1) => {
  const skip = (page - 1) * limit;
  const results = [];
  let total = 0;

  // Secure search with length validation to prevent ReDoS attacks
  const maxQueryLength = 50;
  const safeQuery = query.length > maxQueryLength ? query.slice(0, maxQueryLength) : query;
  
  const searchTerms = safeQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  const searchRegex = new RegExp(
    searchTerms.map(term => `(?=.*${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`).join(''),
    'i'
  );

  // Construire les critères de recherche (regex simple et efficace)
  const buildSearchCriteria = (fields) => {
    // Échapper les caractères spéciaux pour regex
    const escapedQuery = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    return {
      $and: [
        {
          $or: fields.map(field => ({
            [field]: { $regex: escapedQuery, $options: 'i' }
          }))
        },
        { status: 'published' }
      ]
    };
  };

  try {
    // Search in news if requested
    if (searchType === 'all' || searchType === 'news') {
      const newsQuery = buildSearchCriteria(['title', 'content', 'summary', 'tags']);
      
      // Pour le mode 'all', ne pas appliquer skip/limit ici, on le fera après tri
      const newsSkip = searchType === 'all' ? 0 : skip;
      const newsLimit = searchType === 'all' ? 1000 : limit; // Limite élevée pour 'all'
      
      const [newsResults, newsCount] = await Promise.all([
        News.find(newsQuery)
          .select('title content createdAt category summary tags')
          .sort({ createdAt: -1, _id: 1 })
          .skip(newsSkip)
          .limit(newsLimit)
          .lean()
          .exec(),
        News.countDocuments(newsQuery)
      ]);
      
      results.push(...newsResults.map(news => ({
        ...news,
        type: 'news',
        url: `/actualites/${news._id}`,
        score: calculateRelevanceScore(query, news.title, news.summary || news.content, news.tags),
        category: news.category || 'Actualité',
        date: news.date || news.createdAt
      })));
      
      total += newsCount;
    }

    // Search in documents if requested
    if (searchType === 'all' || searchType === 'document') {
      const documentsQuery = buildSearchCriteria(['title', 'description']);
      
      // Pour le mode 'all', ne pas appliquer skip/limit ici, on le fera après tri
      const docsSkip = searchType === 'all' ? 0 : skip;
      const docsLimit = searchType === 'all' ? 1000 : limit; // Limite élevée pour 'all'
      
      const [documentResults, documentsCount] = await Promise.all([
        Document.find(documentsQuery)
          .select('title description type size publicationDate category createdAt')
          .sort({ createdAt: -1, _id: 1 })
          .skip(docsSkip)
          .limit(docsLimit)
          .lean()
          .exec(),
        Document.countDocuments(documentsQuery)
      ]);
      
      results.push(...documentResults.map(doc => ({
        ...doc,
        type: 'document',
        url: `/documents/${doc._id}`,
        score: calculateRelevanceScore(query, doc.title, doc.description, []),
        category: doc.category || 'Document',
        date: doc.publicationDate || doc.createdAt
      })));
      
      total += documentsCount;
    }

    // Sort by relevance score and then by date
    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Handle different date fields for different types
      const dateA = a.date || a.publicationDate || a.createdAt;
      const dateB = b.date || b.publicationDate || b.createdAt;
      return new Date(dateB) - new Date(dateA);
    });
    
    return {
      results: results.slice(0, limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: (page * limit) < total,
      query,
      searchType
    };
    
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Erreur lors de la recherche');
  }
};

// Enhanced relevance score calculation
const calculateRelevanceScore = (query, title = '', description = '', tags = []) => {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  const titleLower = title.toLowerCase();
  const descriptionLower = description.toLowerCase();
  const tagsLower = Array.isArray(tags) ? tags.map(tag => tag.toLowerCase()) : [];
  
  let score = 0;
  
  queryTerms.forEach(term => {
    // Title matches (highest weight)
    if (titleLower.includes(term)) {
      // Bonus for exact match at start
      if (titleLower.startsWith(term)) {
        score += 20;
      } else if (titleLower.indexOf(term) < 10) {
        score += 15; // Bonus for early occurrence
      } else {
        score += 10;
      }
    }
    
    // Description matches (medium weight)
    if (descriptionLower.includes(term)) {
      score += 5;
    }
    
    // Tags matches (high weight)
    if (tagsLower.some(tag => tag.includes(term))) {
      score += 8;
    }
    
    // Exact phrase match bonus
    if (titleLower.includes(query.toLowerCase())) {
      score += 25;
    }
    
    // Word boundary bonus
    const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
    if (wordBoundaryRegex.test(titleLower)) {
      score += 5;
    }
  });
  
  return score;
};

// Get search suggestions for autocomplete
const getSearchSuggestions = async (query, limit = 5) => {
  try {
    const suggestions = new Set();
    
    // Get popular search terms from news titles
    const newsTerms = await News.find(
      { 
        title: { $regex: query, $options: 'i' },
        status: 'published'
      },
      { title: 1 }
    )
    .limit(limit * 2)
    .lean();
    
    newsTerms.forEach(news => {
      const words = news.title.split(/\s+/);
      words.forEach(word => {
        if (word.toLowerCase().startsWith(query.toLowerCase()) && word.length > 2) {
          suggestions.add(word.toLowerCase());
        }
      });
    });
    
    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error('Suggestions error:', error);
    return [];
  }
};

// Main handler function
const searchHandler = async (req, res) => {
  try {
    await connectDB();
    
    // Validate and sanitize query parameters
    const validation = safeValidate(req.query, searchSchema);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Paramètres de recherche invalides',
        details: validation.fields
      });
    }
    
    const { q: query, type: searchType, limit, page } = validation.data;
    
    // Handle empty query
    if (!query) {
      return res.status(200).json({
        results: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
        suggestions: []
      });
    }
    
    // Handle suggestions request
    if (req.query.suggestions === 'true') {
      const suggestions = await getSearchSuggestions(query, 8);
      return res.status(200).json({ suggestions });
    }
    
    // Perform search
    const searchResults = await performSearch(query, searchType, limit, page);
    
    // Add search suggestions for autocomplete
    if (page === 1) {
      searchResults.suggestions = await getSearchSuggestions(query, 5);
    }
    
    return res.status(200).json(searchResults);
    
  } catch (error) {
    console.error('Search handler error:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de la recherche',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export with security middleware for public search (requires API key)
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

export default apiHandler({
  GET: searchHandler
}, {
  GET: ROUTE_TYPES.PUBLIC
});