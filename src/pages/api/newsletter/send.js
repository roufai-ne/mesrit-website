import { connectDB } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import Log from '@/models/Log'; // Modèle pour les logs
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { toast } from 'react-hot-toast';

export default async function handler(req, res) {
  try {
    await connectDB();

    // Vérifier le token et les permissions
    const user = await verifyToken(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Contenu de la newsletter requis' });
    }

    // Récupérer tous les abonnés actifs
    const subscribers = await Newsletter.find({ status: 'active' });

    // Configurer Nodemailer avec SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // true pour SSL/TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Envoyer l'email à chaque abonné et enregistrer les logs
    for (const subscriber of subscribers) {
      try {
        const info = await transporter.sendMail({
          from: `"Votre Nom" <${process.env.SMTP_USER}>`,
          to: subscriber.email,
          subject: 'Votre Newsletter',
          html: content,
        });

        // Enregistrer un log de succès
        await Log.create({
          email: subscriber.email,
          status: 'success',
          message: 'Newsletter envoyée avec succès',
          response: info.response,
          timestamp: new Date(),
        });
      } catch (error) {
        // Enregistrer un log d'erreur
        await Log.create({
          email: subscriber.email,
          status: 'error',
          message: 'Erreur lors de l\'envoi de la newsletter',
          error: error.message,
          timestamp: new Date(),
        });

        toast.error(`Erreur lors de l'envoi à ${subscriber.email}: ${error.message}`);
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    toast.error('Erreur lors de l\'envoi de la newsletter : ' + error.message);

    // Enregistrer un log d'erreur globale
    await Log.create({
        email: subscriber.email,
        status: 'success',
        message: 'Newsletter envoyée avec succès',
        content: emailContent,
        userId: user.id, // ID de l'utilisateur
        response: info.response,
        timestamp: new Date(),
      });

    return res.status(500).json({ error: 'Erreur lors de l\'envoi de la newsletter' });
  }
}