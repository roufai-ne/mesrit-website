// lib/secureApi.js
import { AppError, handleFetchError, ERROR_TYPES, getErrorTypeFromStatus } from '@/lib/errorHandler';
// Router import removed

/**
 * Client API sécurisé pour les appels frontend
 */
export const secureApi = {
  async fetch(url, options = {}, requireAuth = false) {
    try {
      // Headers de base
      const headers = {
        'Content-Type': 'application/json',
      };

      if (requireAuth) {
        // Authentication handled via httpOnly cookies
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
        if (response.status === 401 || response.status === 403) {
          console.warn('Unauthorized access', url);
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
        // Build error from already-parsed body — response body can only be read once
        throw new AppError(
          errorData?.message || `Erreur HTTP ${response.status}`,
          getErrorTypeFromStatus(response.status),
          response.status,
          errorData?.details || null
        );
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
      // Cookies httpOnly gèrent l'authentification automatiquement
      const formData = new FormData();
      formData.append('file', file);

      // Log uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        console.log('Upload de fichier à:', url);
      }

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `Erreur HTTP ${response.status}` };
        }
        throw new AppError(
          errorData?.message || `Erreur HTTP ${response.status}`,
          getErrorTypeFromStatus(response.status),
          response.status,
          errorData?.details || null
        );
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