// lib/auth.js
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';

export async function verifyToken(req) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('Token non fourni');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      throw new Error('Utilisateur non trouvé ou inactif');
    }

    return user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}