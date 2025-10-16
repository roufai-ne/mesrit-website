import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import Log from '@/models/Log';
import { verifyToken } from '@/lib/auth';
import { RBAC, RESOURCES, ACTIONS } from '@/lib/rbac';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  try {
    await connectDB();

    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentification requise' 
      });
    }

    // Vérifier les permissions RBAC
    if (!RBAC.hasPermission(user, RESOURCES.NEWSLETTER, ACTIONS.SEND)) {
      return res.status(403).json({ 
        success: false,
        message: 'Vous n\'avez pas les permissions nécessaires pour cette action.' 
      });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Contenu de la newsletter requis' });
    }

    const subscribers = await Newsletter.find({ status: 'active' });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const results = [];
    for (const subscriber of subscribers) {
      try {
        const unsubscribeLink = `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?token=${subscriber.unsubscribeToken}`;

        const info = await transporter.sendMail({
          from: `"MESRIT Niger" <${process.env.SMTP_USER}>`,
          to: subscriber.email,
          subject: 'Votre Newsletter MESRIT',
          html: `
            ${content}
            <hr />
            <p>Si vous ne souhaitez plus recevoir nos newsletters, vous pouvez vous <a href="${unsubscribeLink}" style="color: #007bff; text-decoration: underline;">désinscrire ici</a>. Ce lien est valide pendant 30 jours.</p>
          `,
        });

        await Log.create({
          email: subscriber.email,
          status: 'success',
          message: 'Newsletter envoyée avec succès',
          response: info.response,
          timestamp: new Date(),
        });

        results.push({ email: subscriber.email, status: 'success' });
      } catch (error) {
        await Log.create({
          email: subscriber.email,
          status: 'error',
          message: 'Erreur lors de l’envoi de la newsletter',
          error: error.message,
          timestamp: new Date(),
        });

        results.push({ email: subscriber.email, status: 'error', error: error.message });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Erreur générale:', error);
    await Log.create({
      email: null,
      status: 'error',
      message: 'Erreur lors de l’envoi global de la newsletter',
      error: error.message,
      timestamp: new Date(),
    });
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}