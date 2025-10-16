// pages/api/auth/clear-cookies.js
// Endpoint temporaire pour nettoyer les anciens cookies et forcer une nouvelle connexion

import { SecureCookies } from '@/lib/secureCookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear tous les cookies d'authentification
    const clearAccessToken = SecureCookies.clearCookie('accessToken');
    const clearRefreshToken = SecureCookies.clearCookie('refreshToken');
    const clearCSRF = SecureCookies.clearCookie('csrfToken');

    // Aussi nettoyer les anciens cookies sans signature
    const clearOldAccessToken = [
      'accessToken=',
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    const clearOldRefreshToken = [
      'refreshToken=',
      'HttpOnly', 
      'Path=/',
      'SameSite=Strict',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      process.env.NODE_ENV === 'production' ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', [
      clearAccessToken,
      clearRefreshToken, 
      clearCSRF,
      clearOldAccessToken,
      clearOldRefreshToken
    ]);

    return res.status(200).json({
      success: true,
      message: 'All authentication cookies cleared. Please login again.'
    });

  } catch (error) {
    console.error('Clear cookies error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}