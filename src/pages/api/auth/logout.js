// pages/api/auth/logout.js
import { SecureCookies } from '@/lib/secureCookies';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear authentication cookies using secure method
    const clearAccessTokenCookie = SecureCookies.clearCookie('accessToken');
    const clearRefreshTokenCookie = SecureCookies.clearCookie('refreshToken');
    const clearCSRFCookie = SecureCookies.clearCookie('csrfToken');

    res.setHeader('Set-Cookie', [
      clearAccessTokenCookie, 
      clearRefreshTokenCookie, 
      clearCSRFCookie
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      message: 'Server error during logout',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}