// Utilitaire pour vérifier la configuration de la clé API côté client
export const checkApiKeyConfiguration = () => {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  
  const result = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiKeyPreview: apiKey ? apiKey.substring(0, 8) + '...' : 'Non définie',
    isValid: apiKey && apiKey.length > 10
  };

  // Only log in development mode and avoid frequent logging
  if (process.env.NODE_ENV === 'development' && !global.apiKeyLogged) {
    console.log('🔑 Configuration clé API:', result);
    global.apiKeyLogged = true; // Prevent repeated logging
  }

  return result;
};

// Hook React pour vérifier la clé API
import { useEffect, useState } from 'react';

export const useApiKeyCheck = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState(null);

  useEffect(() => {
    const status = checkApiKeyConfiguration();
    setApiKeyStatus(status);

    if (!status.isValid) {
      console.warn('⚠️ Clé API manquante ou invalide. Certaines fonctionnalités peuvent ne pas fonctionner.');
    }
  }, []);

  return apiKeyStatus;
};