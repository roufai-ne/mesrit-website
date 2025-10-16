// src/lib/publicApi.js
// Utilitaire pour les appels API publics avec API key

/**
 * Effectue un appel API public avec l'API key automatiquement incluse
 * @param {string} url - L'URL de l'API à appeler
 * @param {object} options - Options pour fetch (method, body, etc.)
 * @returns {Promise<Response>} - La réponse de l'API
 */
export async function fetchWithApiKey(url, options = {}) {
  // Récupérer l'API key depuis les variables d'environnement côté client
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  
  if (!apiKey) {
    console.warn('API key manquante pour les appels publics');
  }

  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey && { 'x-api-key': apiKey }),
      ...options.headers
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    console.error('Erreur lors de l\'appel API:', error);
    throw error;
  }
}

/**
 * Effectue un appel GET avec API key et retourne directement les données JSON
 * @param {string} url - L'URL de l'API à appeler
 * @returns {Promise<any>} - Les données JSON de la réponse
 */
export async function getPublicData(url) {
  const response = await fetchWithApiKey(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Effectue un appel POST avec API key
 * @param {string} url - L'URL de l'API à appeler
 * @param {any} data - Les données à envoyer
 * @returns {Promise<any>} - Les données JSON de la réponse
 */
export async function postPublicData(url, data) {
  const response = await fetchWithApiKey(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return await response.json();
}