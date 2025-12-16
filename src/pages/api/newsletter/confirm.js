// Configuration
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token requis' });
    }

    // 1. Find subscriber by token and ensure token is valid (expiration check done manually or via filter if datetime supported)
    // Strapi filters with date logic might be tricky with url params, but lets try fetching by token first.
    const query = new URLSearchParams({
      'filters[confirmationToken][$eq]': token,
      'filters[confirmationTokenExpires][$gt]': new Date().toISOString()
    });

    const searchRes = await fetch(`${STRAPI_URL}/api/subscribers?${query}`, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` }
    });

    if (!searchRes.ok) throw new Error('Erreur Strapi fetch');

    const searchData = await searchRes.json();
    const subscriber = searchData.data?.[0];

    if (!subscriber) {
      return res.status(400).json({ error: 'Token invalide ou expiré' });
    }

    // 2. Update subscriber
    const updateRes = await fetch(`${STRAPI_URL}/api/subscribers/${subscriber.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`
      },
      body: JSON.stringify({
        data: {
          status: 'active',
          confirmationToken: null,
          confirmationTokenExpires: null
        }
      })
    });

    if (!updateRes.ok) throw new Error('Erreur Strapi update');

    return res.status(200).json({ message: 'Inscription confirmée avec succès' });
  } catch (error) {
    console.error('Confirm Newsletter Error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}