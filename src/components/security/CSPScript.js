// src/components/security/CSPScript.js
import { useEffect } from 'react';
import { useCSPNonce } from '@/hooks/useCSPNonce';

/**
 * Composant pour exécuter des scripts de manière sécurisée avec CSP
 */
export default function CSPScript({ 
  children, 
  src, 
  async = false, 
  defer = false,
  onLoad,
  onError 
}) {
  const nonce = useCSPNonce();

  useEffect(() => {
    if (src) {
      // Script externe
      const script = document.createElement('script');
      script.src = src;
      script.async = async;
      script.defer = defer;
      
      if (nonce) {
        script.nonce = nonce;
      }
      
      if (onLoad) {
        script.onload = onLoad;
      }
      
      if (onError) {
        script.onerror = onError;
      }
      
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } else if (children) {
      // Script inline
      const script = document.createElement('script');
      script.textContent = children;
      
      if (nonce) {
        script.nonce = nonce;
      }
      
      document.head.appendChild(script);
      
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [src, children, nonce, async, defer, onLoad, onError]);

  return null; // Ce composant ne rend rien visuellement
}

/**
 * Hook pour exécuter du code JavaScript de manière sécurisée
 */
export function useSecureScript(scriptContent, dependencies = []) {
  const nonce = useCSPNonce();

  useEffect(() => {
    if (!scriptContent) return;

    try {
      // Créer une fonction sécurisée
      const secureFunction = new Function(scriptContent);
      secureFunction();
    } catch (error) {
      console.error('Erreur exécution script sécurisé:', error);
      
      // Reporter l'erreur comme violation potentielle
      if (typeof window !== 'undefined' && window.fetch) {
        fetch('/api/security/csp-violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'script-execution-error',
            error: error.message,
            script: scriptContent.substring(0, 100), // Premiers 100 caractères
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}); // Ignorer les erreurs de rapport
      }
    }
  }, [...dependencies, nonce]);
}

/**
 * Composant pour les styles inline sécurisés
 */
export function CSPStyle({ children, href }) {
  const nonce = useCSPNonce();

  useEffect(() => {
    if (href) {
      // Feuille de style externe
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      if (nonce) {
        link.nonce = nonce;
      }
      
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    } else if (children) {
      // Style inline
      const style = document.createElement('style');
      style.textContent = children;
      
      if (nonce) {
        style.nonce = nonce;
      }
      
      document.head.appendChild(style);
      
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, [href, children, nonce]);

  return null;
}

/**
 * Utilitaire pour générer des styles inline sécurisés
 */
export function CreateSecureStyle({ cssContent, children }) {
  const nonce = useCSPNonce();
  
  return (
    <style 
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: cssContent }}
    />
  );
}

/**
 * Wrapper pour les composants tiers qui utilisent dangerouslySetInnerHTML
 */
export function SecureHTMLContent({ html, className, tag = 'div' }) {
  const nonce = useCSPNonce();
  const Tag = tag;
  
  // Nettoyer le HTML pour enlever les scripts inline dangereux
  const cleanHTML = html
    ?.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Supprimer les scripts
    ?.replace(/on\w+="[^"]*"/gi, '') // Supprimer les event handlers inline
    ?.replace(/javascript:/gi, ''); // Supprimer les liens javascript:
  
  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
      data-nonce={nonce}
    />
  );
}

/**
 * Hook pour détecter les violations CSP côté client
 */
export function useCSPViolationDetector() {
  useEffect(() => {
    const handleViolation = (event) => {
      const violation = event.originalEvent || event;
      
      // Reporter la violation
      if (typeof window !== 'undefined' && window.fetch) {
        fetch('/api/security/csp-violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockedURI: violation.blockedURI,
            violatedDirective: violation.violatedDirective,
            originalPolicy: violation.originalPolicy,
            sourceFile: violation.sourceFile,
            lineNumber: violation.lineNumber,
            columnNumber: violation.columnNumber,
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}); // Ignorer les erreurs de rapport
      }
    };

    // Écouter les violations CSP
    document.addEventListener('securitypolicyviolation', handleViolation);
    
    return () => {
      document.removeEventListener('securitypolicyviolation', handleViolation);
    };
  }, []);
}