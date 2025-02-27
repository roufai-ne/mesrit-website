// lib/secureApi.js
import { verifyToken } from './auth';
import { connectDB } from './mongodb';

/**
 * Client API sécurisé pour les appels frontend et backend
 */
export const secureApi = {
  async fetch(url, options = {}, requireAuth = false) {
    try {
      // Initialiser la connexion à MongoDB côté serveur uniquement si authentification requise
      if (requireAuth && typeof window === 'undefined') {
        await connectDB();
      }

      // Headers de base avec la clé API
      const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY,
      };

      // Ajouter le token d'authentification uniquement si nécessaire
      if (requireAuth) {
        let token;
        // Côté serveur : utiliser verifyToken avec req
        if (typeof window === 'undefined') {
          const req = options.req;
          if (!req) throw new Error('Requête non fournie côté serveur');
          const user = await verifyToken(req);
          if (!user) throw new Error('Non authentifié');
          token = req.headers.authorization?.replace('Bearer ', '');
        } else {
          // Côté client : récupérer le token depuis localStorage ou cookies
          if (typeof window !== 'undefined') {
            token = localStorage.getItem('token') || document.cookie.match(/token=([^;]+)/)?.[1];
            if (!token) throw new Error('Non authentifié');
          }
        }
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      // Log uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('Requête à:', url, 'RequireAuth:', requireAuth);
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      // Gérer les différents types de réponses
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
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
        
        throw new Error(errorData.message || 'Une erreur est survenue');
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
      throw error;
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
      if (requireAuth && typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || document.cookie.match(/token=([^;]+)/)?.[1];
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        } else if (requireAuth) {
          throw new Error('Non authentifié');
        }
      }

      // Préparer les données du fichier
      const formData = new FormData();
      formData.append('file', file);

      // Log uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('Upload de fichier à:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
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
        throw new Error(errorData.message || "Erreur lors de l'upload");
      }

      return response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
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