// src/lib/strapi.js
// Fonctions client-safe uniquement — importable par composants React ET API routes
// Les fonctions d'écriture (admin token) sont dans strapiAdmin.js
import qs from 'qs';

/**
 * Utility to get Strapi URL
 */
export function getStrapiURL(path = '') {
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'}${path}`;
}

/**
 * Helper to make GET requests to Strapi API endpoints.
 * - Navigateur  : passe par le proxy Next.js /api/strapi/[...path] (évite CORS, cache le token)
 * - Serveur (getStaticProps, ISR, SSR) : appel direct à Strapi avec STRAPI_API_TOKEN
 *   → pas de dépendance au serveur Next.js (résout le bug "ministre absent en production")
 */
export async function fetchAPI(path, urlParamsObject = {}, options = {}) {
  const queryString = qs.stringify(urlParamsObject, { encodeValuesOnly: true });
  const suffix = queryString ? `?${queryString}` : '';

  const isServer = typeof window === 'undefined';

  let requestUrl;
  let mergedOptions;

  if (isServer) {
    // Appel direct à Strapi — valable pendant `npm run build` ET pendant ISR
    const strapiBase = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
    requestUrl = `${strapiBase}/api${path}${suffix}`;
    const token = process.env.STRAPI_API_TOKEN;
    mergedOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };
  } else {
    // Proxy Next.js côté navigateur (évite CORS + ne jamais exposer le token au client)
    requestUrl = `/api/strapi${path}${suffix}`;
    mergedOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
  }

  try {
    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();
    // Propager les erreurs HTTP (400, 404, 500…) pour que les appelants puissent les gérer
    if (!response.ok) {
      const message = data?.error?.message || `HTTP ${response.status} — ${requestUrl}`;
      const err = new Error(message);
      err.status = response.status;
      err.strapiError = data?.error;
      throw err;
    }
    return data;
  } catch (error) {
    if (error.status === 404) {
      console.warn(`Strapi 404 — ressource non trouvée : ${requestUrl}`);
    } else {
      console.warn(`Strapi indisponible — ${requestUrl}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Helper to get media URL — compatible Strapi 5 et v4.
 * Strapi 5 retourne les champs media comme un tableau même si multiple: false.
 * Les URLs /uploads/... sont réécrites en /api/uploads/... pour passer par le proxy
 * Next.js (évite le blocage "private IP" de l'optimiseur d'images).
 */
export function getStrapiMedia(media) {
  if (!media) return null;

  // Strapi 5 retourne un tableau même pour les champs single — déballer le premier élément
  const item = Array.isArray(media) ? media[0] : media;
  if (!item) return null;

  let url = null;

  // Strapi 5 format plat: { id, url, ... }
  if (item.url) {
    url = item.url;
  // Strapi v4 format: { data: { attributes: { url } } }
  } else if (item.data?.attributes?.url) {
    url = item.data.attributes.url;
  // v4 format direct (déjà déballé)
  } else if (item.attributes?.url) {
    url = item.attributes.url;
  }

  if (!url) return null;

  // Réécriture /uploads/... → /api/uploads/... (proxy Next.js, évite IP privée)
  if (url.startsWith('/uploads/')) {
    return `/api${url}`;
  }

  // URL absolue externe (Cloudinary, etc.) : retourner telle quelle
  return url;
}

// Endpoints Strapi
export const endpoints = {
  articles: '/articles',
  categories: '/categories',
  documents: '/documents',
  faqs: '/faqs',
  services: '/services',
  establishments: '/establishments',
  partners: '/partners',
  alert: '/alerts',
  alerts: '/alerts',
  directors: '/directors',
  subscribers: '/subscribers',
  statistics: '/statistics',
  events: '/events',
  global: '/global',
  homepage: '/homepage',
  externalServices: '/external-services',
  history: '/history-milestones',
  organisation: '/organizational-units',
};
