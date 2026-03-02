// Route non implémentée — à développer avec un vrai modèle Strapi et une authentification
export default function handler(req, res) {
  return res.status(501).json({
    success: false,
    error: 'Non implémenté',
  });
}
