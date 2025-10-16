// lib/sanitize.js
import DOMPurify from 'dompurify';

// Server-side safe DOMPurify configuration
const createDOMPurify = () => {
  if (typeof window === 'undefined') {
    // Server-side: use jsdom
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const createDOMPurify = require('dompurify');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    const DOMPurify = createDOMPurify(window);
    return DOMPurify;
  } else {
    // Client-side: use regular DOMPurify
    return DOMPurify;
  }
};

// Configuration for different sanitization levels
const sanitizeConfigs = {
  // Basic sanitization for user input
  basic: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
  
  // Rich text sanitization for editors
  rich: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  },
  
  // Strict sanitization for dangerous contexts
  strict: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    STRIP_COMMENTS: true,
    STRIP_CDATA: true,
  },
  
  // Admin content sanitization (more permissive)
  admin: {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'class', 'src', 'alt', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  }
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - The HTML string to sanitize
 * @param {string} level - Sanitization level: 'basic', 'rich', 'strict', 'admin'
 * @returns {string} - The sanitized HTML string
 */
export const sanitizeHtml = (dirty, level = 'basic') => {
  if (typeof dirty !== 'string') {
    return '';
  }

  try {
    const purify = createDOMPurify();
    const config = sanitizeConfigs[level] || sanitizeConfigs.basic;
    
    // Add custom hooks for additional security
    purify.addHook('beforeSanitizeElements', (node) => {
      // Remove any script tags that might have slipped through
      if (node.tagName === 'SCRIPT') {
        node.remove();
      }
    });

    purify.addHook('beforeSanitizeAttributes', (node) => {
      // Remove any javascript: URLs
      if (node.hasAttribute('href')) {
        const href = node.getAttribute('href');
        if (href && href.toLowerCase().startsWith('javascript:')) {
          node.removeAttribute('href');
        }
      }
    });

    const clean = purify.sanitize(dirty, config);
    
    // Clear hooks after use to prevent memory leaks
    purify.removeAllHooks();
    
    return clean;
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    // Return empty string on error for security
    return '';
  }
};

/**
 * Sanitize text content (removes all HTML)
 * @param {string} dirty - The text to sanitize
 * @returns {string} - The sanitized text
 */
export const sanitizeText = (dirty) => {
  if (typeof dirty !== 'string') {
    return '';
  }

  try {
    const purify = createDOMPurify();
    
    // Strip all HTML tags and return text only
    const clean = purify.sanitize(dirty, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true 
    });
    
    return clean;
  } catch (error) {
    console.error('Text sanitization failed:', error);
    return '';
  }
};

/**
 * Sanitize user input for database storage
 * @param {any} input - The input to sanitize
 * @returns {any} - The sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return sanitizeText(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize object keys and values
      const cleanKey = sanitizeText(key);
      sanitized[cleanKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Sanitize HTML for display in React components
 * @param {string} html - The HTML to sanitize
 * @param {string} level - Sanitization level
 * @returns {object} - Object with __html property for dangerouslySetInnerHTML
 */
export const sanitizeForReact = (html, level = 'basic') => {
  const cleanHtml = sanitizeHtml(html, level);
  return { __html: cleanHtml };
};

/**
 * Validate and sanitize URL
 * @param {string} url - The URL to validate and sanitize
 * @returns {string} - The sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return '';
  }

  try {
    // Allow only safe protocols
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    const urlObj = new URL(url);
    
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return '';
    }
    
    return urlObj.toString();
  } catch (error) {
    // Invalid URL
    return '';
  }
};

// Export default sanitization function
export default sanitizeHtml;