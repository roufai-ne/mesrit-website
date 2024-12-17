// src/pages/api/contact/index.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Configuration nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Configuration de l'email
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `Contact MESRIT: ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Message envoyé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
}