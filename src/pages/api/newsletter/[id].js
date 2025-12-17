const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'DELETE':
        if (!STRAPI_TOKEN) {
          return res.status(500).json({ error: 'Configuration serveur incomplète (Token manquant)' });
        }

        const deleteRes = await fetch(`${STRAPI_URL}/api/subscribers/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${STRAPI_TOKEN}`
          }
        });

        if (!deleteRes.ok) {
          // Strapi might return 404 if not found, or other error
          return res.status(deleteRes.status).json({ error: 'Erreur lors de la suppression' });
        }

        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}