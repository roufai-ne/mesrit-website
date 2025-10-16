// pages/api/auth/refresh.js
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get refresh token from cookies
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken, 
      process.env.REFRESH_SECRET || 'refresh_secret_development'
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Connect to database and get user
    await connectDB();
    const user = await User.findById(decoded.userId);
    
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET || 'secret_key_development',
      { expiresIn: '15m' }
    );

    // Set new access token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    
    const accessTokenCookie = [
      `accessToken=${newAccessToken}`,
      'HttpOnly',
      'Path=/',
      `SameSite=Strict`,
      `Max-Age=${15 * 60}`, // 15 minutes in seconds
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', [accessTokenCookie]);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    // If refresh token is invalid, clear cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    const clearAccessTokenCookie = [
      'accessToken=',
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    const clearRefreshTokenCookie = [
      'refreshToken=',
      'HttpOnly',
      'Path=/',
      'SameSite=Strict',
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', [clearAccessTokenCookie, clearRefreshTokenCookie]);

    return res.status(401).json({ 
      message: 'Invalid refresh token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}