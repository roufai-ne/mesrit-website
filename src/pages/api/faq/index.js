//pages/api/faq/index.js
import { connectDB } from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
import { verifyToken } from '@/lib/auth';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';

export default async function handler(req, res) {
  await connectDB();

  try {
    switch (req.method) {
      case 'GET':
        // FAQ en lecture libre pour tous
        const faqs = await FAQ.find({ 
          isActive: true 
        }).sort({ order: 1 });
        return res.status(200).json(faqs);

      case 'POST':
        // Vérification authentification pour création
        const user = await verifyToken(req);
        if (!user) {
          return res.status(401).json({ 
            success: false,
            error: 'Authentification requise' 
          });
        }

        // Vérification permissions RBAC
        if (!RBAC.hasPermission(user, RESOURCES.FAQ, ACTIONS.CREATE)) {
          return res.status(403).json({ 
            success: false,
            error: 'Vous n\'avez pas les permissions nécessaires pour cette action.' 
          });
        }

        const newFaq = await FAQ.create(req.body);
        return res.status(201).json(newFaq);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}