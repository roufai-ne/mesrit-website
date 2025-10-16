// src/hooks/useCSPNonce.js
import { useEffect, useState } from 'react';

/**
 * Hook React pour utiliser les nonces CSP
 */
export function useCSPNonce() {
  const [nonce, setNonce] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Côté client, récupérer le nonce depuis les meta tags
      const nonceElement = document.querySelector('meta[name="csp-nonce"]');
      const nonceValue = nonceElement?.getAttribute('content') || null;
      setNonce(nonceValue);
      
      // Aussi vérifier dans window.__CSP_NONCE__ si défini
      if (!nonceValue && window.__CSP_NONCE__) {
        setNonce(window.__CSP_NONCE__);
      }
    }
  }, []);

  return nonce;
}

export default useCSPNonce;