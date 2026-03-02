// src/pages/api/auth/me.js
// Valide un token JWT Strapi et retourne l'utilisateur courant

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.slice(7);

  try {
    // Valider le token auprès de Strapi
    const strapiRes = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!strapiRes.ok) {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }

    const user = await strapiRes.json();

    return res.status(200).json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role?.name || 'Authenticated',
    });
  } catch (error) {
    console.error('[auth/me] Erreur:', error.message);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
