// pages/api/contact/index.js
import nodemailer from 'nodemailer';
import { apiHandler, ROUTE_TYPES } from '@/middleware/securityMiddleware';

// Handler pour la méthode POST
const handleContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation avec des messages d'erreur spécifiques
    const validationErrors = [];
    
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      validationErrors.push('Le nom doit contenir au moins 2 caractères');
    }
    
    if (!email || typeof email !== 'string') {
      validationErrors.push('Email requis');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('Format d\'email invalide');
    }
    
    if (!subject || typeof subject !== 'string' || subject.trim().length < 2) {
      validationErrors.push('Le sujet doit contenir au moins 2 caractères');
    }
    
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      validationErrors.push('Le message doit contenir au moins 10 caractères');
    }
    
    // Retourner toutes les erreurs de validation à la fois
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation échouée',
        validationErrors
      });
    }

    // Vérifier la configuration de l'email
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('Configuration SMTP manquante');
      return res.status(500).json({ 
        success: false,
        error: 'Configuration serveur incomplète',
        debug: process.env.NODE_ENV === 'development' ? 'Configuration SMTP manquante' : undefined
      });
    }

    // Configuration nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Sanitisation des données
    const sanitizedName = name.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sanitizedSubject = subject.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sanitizedMessage = message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                          .replace(/\n/g, '<br>');

    // Configuration de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@example.com',
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email.trim(),
      subject: `Contact MESRIT: ${sanitizedSubject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${email.trim()}</p>
        <p><strong>Sujet:</strong> ${sanitizedSubject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${sanitizedMessage}</p>
      `
    };

    // Envoi de l'email avec gestion explicite des erreurs
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Erreur d\'envoi d\'email:', emailError);
      return res.status(500).json({ 
        success: false, 
        error: 'Échec de l\'envoi du message',
        debug: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur contact:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Une erreur inattendue est survenue',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default apiHandler(
  { POST: handleContact },
  { POST: ROUTE_TYPES.PUBLIC }
);