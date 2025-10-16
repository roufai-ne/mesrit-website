// src/middleware/cspMiddleware.js
import { NextResponse } from 'next/server';
import { generateNonce, buildCSPString } from '@/lib/securityHeaders';

/**
 * Middleware pour injecter les nonces CSP dans les pages
 */
export function cspMiddleware(request) {
  const response = NextResponse.next();
  
  // Générer un nonce unique pour cette requête
  const nonce = generateNonce();
  
  // Construire la CSP avec le nonce
  const cspWithNonce = buildCSPString(nonce);
  
  // Ajouter les headers CSP avec nonce
  response.headers.set('Content-Security-Policy', cspWithNonce);
  response.headers.set('X-Nonce', nonce);
  
  // Stocker le nonce pour l'utiliser dans les composants
  response.cookies.set('csp-nonce', nonce, {
    httpOnly: false, // Accessible côté client
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 300 // 5 minutes
  });
  
  return response;
}

/**
 * Matcher pour appliquer le middleware CSP
 */
export const cspConfig = {
  matcher: [
    /*
     * Appliquer à toutes les routes sauf :
     * - api (gérées séparément)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

/**
 * Utilitaire pour injecter le nonce dans le HTML
 */
export function injectNonceInHTML(html, nonce) {
  if (!nonce || !html) return html;
  
  // Injecter le nonce dans les balises script et style existantes
  let modifiedHTML = html;
  
  // Ajouter nonce aux scripts inline
  modifiedHTML = modifiedHTML.replace(
    /<script(?![^>]*src=)([^>]*)>/gi,
    `<script$1 nonce="${nonce}">`
  );
  
  // Ajouter nonce aux styles inline
  modifiedHTML = modifiedHTML.replace(
    /<style([^>]*)>/gi,
    `<style$1 nonce="${nonce}">`
  );
  
  // Ajouter une meta tag avec le nonce pour l'accès côté client
  const nonceMetaTag = `<meta name="csp-nonce" content="${nonce}">`;
  modifiedHTML = modifiedHTML.replace(
    /<\/head>/i,
    `${nonceMetaTag}</head>`
  );
  
  return modifiedHTML;
}

/**
 * Hook Next.js pour modifier le HTML avant l'envoi
 */
export function withCSPNonce(handler) {
  return async (req, res) => {
    const nonce = generateNonce();
    
    // Stocker le nonce dans la requête
    req.nonce = nonce;
    
    // Intercepter la méthode send pour modifier le HTML
    const originalSend = res.send;
    res.send = function(body) {
      if (typeof body === 'string' && body.includes('<html')) {
        body = injectNonceInHTML(body, nonce);
      }
      return originalSend.call(this, body);
    };
    
    // Ajouter les headers CSP avec nonce
    const cspWithNonce = buildCSPString(nonce);
    res.setHeader('Content-Security-Policy', cspWithNonce);
    res.setHeader('X-Nonce', nonce);
    
    return handler(req, res);
  };
}

export default cspMiddleware;