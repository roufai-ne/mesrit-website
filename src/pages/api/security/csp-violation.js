// src/pages/api/security/csp-violation.js
import { withSecurityHeaders } from '@/lib/securityHeaders';
import logger, { LOG_TYPES } from '@/lib/logger';

/**
 * Endpoint pour recevoir les rapports de violation CSP
 */
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const violation = req.body;
    
    // Valider les données de violation
    if (!violation || typeof violation !== 'object') {
      return res.status(400).json({ error: 'Données de violation invalides' });
    }

    // Logger la violation
    await logger.warning(
      LOG_TYPES.SECURITY_VIOLATION,
      'Violation CSP détectée',
      {
        violation: {
          blockedURI: violation.blockedURI,
          violatedDirective: violation.violatedDirective,
          originalPolicy: violation.originalPolicy,
          sourceFile: violation.sourceFile,
          lineNumber: violation.lineNumber,
          columnNumber: violation.columnNumber
        },
        userAgent: violation.userAgent,
        url: violation.url,
        timestamp: violation.timestamp,
        clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }
    );

    // Analyser la violation pour des suggestions
    const analysis = analyzeCSPViolation(violation);
    
    // En développement, afficher des informations détaillées
    if (process.env.NODE_ENV === 'development') {
      console.log('🚨 Violation CSP:', {
        directive: violation.violatedDirective,
        blocked: violation.blockedURI,
        source: violation.sourceFile,
        line: violation.lineNumber,
        suggestions: analysis.suggestions
      });
    }

    // Compter les violations par type
    await trackViolationStats(violation);

    res.status(200).json({ 
      success: true, 
      message: 'Violation CSP enregistrée',
      analysis: process.env.NODE_ENV === 'development' ? analysis : undefined
    });

  } catch (error) {
    console.error('Erreur traitement violation CSP:', error);
    
    await logger.error(
      LOG_TYPES.SYSTEM_ERROR,
      'Erreur lors du traitement d\'une violation CSP',
      { error: error.message, stack: error.stack }
    );

    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

/**
 * Analyser une violation CSP et fournir des suggestions
 */
function analyzeCSPViolation(violation) {
  const suggestions = [];
  const severity = determineSeverity(violation);
  
  const directive = violation.violatedDirective;
  const blockedURI = violation.blockedURI;

  if (directive?.includes('script-src')) {
    if (blockedURI?.includes('inline') || blockedURI === 'eval') {
      suggestions.push({
        type: 'script-inline',
        message: 'Script inline détecté',
        solution: 'Déplacer le script vers un fichier externe ou utiliser un nonce/hash',
        priority: 'high'
      });
    }
    
    if (blockedURI?.includes('eval')) {
      suggestions.push({
        type: 'script-eval',
        message: 'Utilisation d\'eval() détectée',
        solution: 'Éviter eval() et utiliser des alternatives sécurisées',
        priority: 'critical'
      });
    }
  }

  if (directive?.includes('style-src')) {
    if (blockedURI?.includes('inline')) {
      suggestions.push({
        type: 'style-inline',
        message: 'Style inline détecté',
        solution: 'Utiliser des classes CSS externes ou CSS-in-JS avec nonce',
        priority: 'medium'
      });
    }
  }

  if (directive?.includes('img-src')) {
    suggestions.push({
      type: 'image-source',
      message: 'Source d\'image non autorisée',
      solution: `Ajouter '${blockedURI}' aux sources autorisées ou utiliser un proxy d'images`,
      priority: 'low'
    });
  }

  return {
    severity,
    suggestions,
    recommendation: getRecommendation(directive, blockedURI)
  };
}

/**
 * Déterminer la sévérité d'une violation
 */
function determineSeverity(violation) {
  const directive = violation.violatedDirective;
  const blockedURI = violation.blockedURI;

  if (blockedURI?.includes('eval') || directive?.includes('unsafe-eval')) {
    return 'critical';
  }
  
  if (directive?.includes('script-src') && blockedURI?.includes('inline')) {
    return 'high';
  }
  
  if (directive?.includes('style-src') || directive?.includes('img-src')) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Obtenir une recommandation spécifique
 */
function getRecommendation(directive, blockedURI) {
  const recommendations = {
    'script-src': {
      'inline': 'Utiliser des nonces ou des hashes pour les scripts inline critiques',
      'eval': 'Remplacer eval() par des alternatives sécurisées comme JSON.parse()',
      'default': 'Vérifier que la source du script est fiable et l\'ajouter à la whitelist'
    },
    'style-src': {
      'inline': 'Migrer vers des feuilles de style externes ou utiliser CSS-in-JS avec nonces',
      'default': 'Ajouter la source CSS à la liste des domaines autorisés'
    },
    'img-src': {
      'default': 'Vérifier la source de l\'image et l\'ajouter aux domaines autorisés'
    }
  };

  const directiveType = Object.keys(recommendations).find(key => directive?.includes(key));
  if (!directiveType) return 'Vérifier la politique CSP pour cette directive';

  const specificRec = recommendations[directiveType];
  if (blockedURI?.includes('inline')) return specificRec.inline || specificRec.default;
  if (blockedURI?.includes('eval')) return specificRec.eval || specificRec.default;
  
  return specificRec.default;
}

/**
 * Suivre les statistiques de violations
 */
async function trackViolationStats(violation) {
  try {
    // Ici, on pourrait stocker dans une base de données ou un cache
    // Pour l'instant, on utilise juste le logger
    const directive = violation.violatedDirective;
    const hour = new Date().getHours();
    
    await logger.info(
      LOG_TYPES.SECURITY_METRICS,
      'Statistique violation CSP',
      {
        directive,
        hour,
        date: new Date().toISOString().split('T')[0],
        count: 1
      }
    );
  } catch (error) {
    console.error('Erreur tracking violations:', error);
  }
}

export default withSecurityHeaders(handler);