// pages/api/auth/login.js
export default function handler(req, res) {
    if (req.method === 'POST') {
      const { username, password } = req.body;
  
      // Pour démo - à remplacer par votre système d'authentification
      if (username === 'admin' && password === 'password') {
        res.status(200).json({
          token: 'demo_token',
          user: { id: 1, username: 'admin' }
        });
      } else {
        res.status(401).json({ message: 'Identifiants invalides' });
      }
    } else {
      res.status(405).end();
    }
  }