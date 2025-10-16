//pages/api/faq/[id].js
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
import { verifyToken } from '@/lib/auth';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  // Vérification authentification pour toutes les opérations
  const user = await verifyToken(req);
  if (!user) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentification requise' 
    });
  }

  try {
    switch (req.method) {
      case 'PUT':
        // Vérification permissions RBAC pour modification
        if (!RBAC.hasPermission(user, RESOURCES.FAQ, ACTIONS.UPDATE)) {
          return res.status(403).json({ 
            success: false,
            error: 'Vous n\'avez pas les permissions nécessaires pour cette action.' 
          });
        }

        const updatedFaq = await FAQ.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updatedFaq);

      case 'DELETE':
        // Vérification permissions RBAC pour suppression
        if (!RBAC.hasPermission(user, RESOURCES.FAQ, ACTIONS.DELETE)) {
          return res.status(403).json({ 
            success: false,
            error: 'Vous n\'avez pas les permissions nécessaires pour cette action.' 
          });
        }

        await FAQ.findByIdAndDelete(id);
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}