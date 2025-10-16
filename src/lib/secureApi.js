// lib/secureApi.js
import { AppError, parseApiError, handleFetchError, ERROR_TYPES } from '@/lib/errorHandler';
import router from 'next/router';

// Lazy AuthContext/Toast import to avoid circular deps
let logoutFn = null;
let toastFn = null;
export function registerAuthUtils({ logout, toast }) {
  logoutFn = logout;
  toastFn = toast;
}

/**
 * Client API sécurisé pour les appels frontend et backend
 */
export const secureApi = {
  async fetch(url, options = {}, requireAuth = false) {
    try {
      // Headers de base avec la clé API
      const headers = {
        'Content-Type': 'application/json',
      };

      // Ajouter l'API key seulement si elle est disponible
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY;
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      // Ajouter le token d'authentification uniquement si nécessaire
      if (requireAuth) {
        // Côté client : récupérer le token depuis les cookies (httpOnly cookies are handled automatically)
        // For client-side requests, cookies will be sent automatically
        // No need to manually add authorization header for httpOnly cookies
      }

      // Log uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('Requête à:', url, 'RequireAuth:', requireAuth);
      }

      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Ensure cookies are sent with requests
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Gérer les différents types de réponses
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        // Gestion centralisée session expirée
        if (response.status === 401 || response.status === 403) {
          if (logoutFn) logoutFn();
          if (toastFn) toastFn.error('Votre session a expiré, veuillez vous reconnecter.');
          if (typeof window !== 'undefined') {
            router.push('/auth/login');
          }
          throw new AppError('Session expirée', ERROR_TYPES.AUTHENTICATION, response.status);
        }
        let errorData;
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorData = { message: await response.text() };
          }
        } catch (e) {
          errorData = { message: `Erreur HTTP ${response.status}` };
        }
        const appError = await parseApiError(response);
        throw appError;
      }

      // Retourner le bon format selon le content-type
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      } else if (contentType && contentType.includes('text/')) {
        return response.text();
      } else {
        return response.blob();
      }
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      const handledError = await handleFetchError(error, url);
      throw handledError;
    }
  },

  async get(url, requireAuth = false, options = {}) {
    return this.fetch(url, { method: 'GET', ...options }, requireAuth);
  },

  async post(url, data, requireAuth = true, options = {}) {
    return this.fetch(
      url, 
      {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
      }, 
      requireAuth
    );
  },

  async put(url, data, requireAuth = true, options = {}) {
    return this.fetch(
      url, 
      {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
      }, 
      requireAuth
    );
  },

  async delete(url, requireAuth = true, options = {}) {
    return this.fetch(
      url, 
      {
        method: 'DELETE',
        ...options
      }, 
      requireAuth
    );
  },

  async uploadFile(url, file, requireAuth = true) {
    try {
      // Headers de base
      const headers = {
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY,
      };

      // Ajouter le token d'authentification si nécessaire
      // With httpOnly cookies, authentication is handled automatically
      // No need to manually add authorization header

      // Préparer les données du fichier
      const formData = new FormData();
      formData.append('file', file);

      // Log uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('Upload de fichier à:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
        headers,
        body: formData
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Erreur HTTP ${response.status}` };
        }
        const appError = await parseApiError(response);
        throw appError;
      }

      return response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      const handledError = await handleFetchError(error, url);
      throw handledError;
    }
  },
  
  // Méthode utilitaire pour créer des URL avec paramètres
  buildUrl(baseUrl, params = {}) {
    const url = new URL(baseUrl, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  }
};

// Hook pour la gestion des états de chargement et d'erreur
import { useState, useCallback } from 'react';

export function useApiAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (action) => {
    try {
      setLoading(true);
      setError(null);
      const result = await action();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []); // Pas de dépendances, car setLoading et setError sont stables

  return { execute, loading, error };
}