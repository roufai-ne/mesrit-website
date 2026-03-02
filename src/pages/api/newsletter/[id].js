import { deleteSubscriber } from '@/lib/strapiAdmin';

// Valider que l'id est un entier positif (Strapi utilise des IDs numériques)
const ID_REGEX = /^\d+$/;

// Vérification minimale du token admin en header
function isAdmin(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7);
  return token === process.env.STRAPI_ADMIN_TOKEN;
}

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Auth requise — seul un admin peut supprimer un subscriber
  if (!isAdmin(req)) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const { id } = req.query;

  if (!id || !ID_REGEX.test(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }

  try {
    await deleteSubscriber(id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete subscriber error:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
