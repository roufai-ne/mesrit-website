// src/lib/strapiAdmin.js
// Fonctions d'écriture Strapi — SERVER ONLY
// À importer uniquement dans src/pages/api/** (jamais dans des composants React)
import { breakers } from '@/lib/circuitBreaker';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
  };
}

export async function createSubscriber(data) {
  return breakers.strapi.execute(async () => {
    const res = await fetch(`${STRAPI_URL}/api/subscribers`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erreur création subscriber Strapi');
    }
    return res.json();
  });
}

export async function findSubscriberByEmail(email) {
  return breakers.strapi.execute(async () => {
    const res = await fetch(
      `${STRAPI_URL}/api/subscribers?filters[email][$eq]=${encodeURIComponent(email)}`,
      { headers: adminHeaders() }
    );
    if (!res.ok) throw new Error('Erreur recherche subscriber Strapi');
    return res.json();
  });
}

export async function updateSubscriber(id, data) {
  return breakers.strapi.execute(async () => {
    const res = await fetch(`${STRAPI_URL}/api/subscribers/${id}`, {
      method: 'PUT',
      headers: adminHeaders(),
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erreur mise à jour subscriber Strapi');
    }
    return res.json();
  });
}

export async function findSubscriberByToken(tokenField, tokenValue) {
  return breakers.strapi.execute(async () => {
    const params = new URLSearchParams({
      [`filters[${tokenField}][$eq]`]: tokenValue,
      [`filters[${tokenField}Expires][$gt]`]: new Date().toISOString(),
    });
    const res = await fetch(`${STRAPI_URL}/api/subscribers?${params}`, {
      headers: adminHeaders(),
    });
    if (!res.ok) throw new Error('Erreur recherche subscriber par token Strapi');
    return res.json();
  });
}

export async function deleteSubscriber(id) {
  return breakers.strapi.execute(async () => {
    const res = await fetch(`${STRAPI_URL}/api/subscribers/${id}`, {
      method: 'DELETE',
      headers: adminHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Erreur suppression subscriber Strapi');
    }
    return res.status === 204 ? null : res.json();
  });
}

export async function createMessage(data) {
  return breakers.strapi.execute(async () => {
    const res = await fetch(`${STRAPI_URL}/api/messages`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ data }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Erreur création message Strapi');
    }
    return res.json();
  });
}
