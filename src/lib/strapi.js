// src/lib/strapi.js
import qs from 'qs';

/**
 * Utility to get Strapi URL
 */
export function getStrapiURL(path = '') {
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337'
    }${path}`;
}

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path The API path
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {Object} options Options passed to fetch
 * @returns Parsed API response
 */
export async function fetchAPI(path, urlParamsObject = {}, options = {}) {
  // Merge default and user options
  const headers = {
    'Content-Type': 'application/json',
  };

  if (process.env.STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.STRAPI_API_TOKEN}`;
  }

  const mergedOptions = {
    headers,
    ...options,
  };

  // Build request URL
  const queryString = qs.stringify(urlParamsObject, {
    encodeValuesOnly: true, // prettify URL
  });

  const requestUrl = `${getStrapiURL(`/api${path}`)}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(requestUrl, mergedOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching Strapi API from ${requestUrl}:`, error);
    throw new Error(`An error occured while fetching the Strapi API`);
  }
}

/**
 * Helper to get media URL
 */
export function getStrapiMedia(media) {
  if (!media || !media.data || !media.data.attributes) {
    return null;
  }

  const { url } = media.data.attributes;
  const imageUrl = url.startsWith('/') ? getStrapiURL(url) : url;
  return imageUrl;
}

// Client configurations for specific features
export const endpoints = {
  articles: '/articles',
  categories: '/categories',
  documents: '/documents',
  faqs: '/faqs',
  services: '/services',
  establishments: '/establishments',
  partners: '/partners',
  alert: '/alerts', // Singular/Plural mismatch handling if needed, usually plural
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
