import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Valider le token côté serveur via /api/auth/me
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser({ ...userData, token });
      } else {
        // Token invalide ou expiré — nettoyer
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Identifiants invalides');
    }

    const data = await res.json();
    const { jwt, user: userData } = data;

    localStorage.setItem('token', jwt);
    setUser({ ...userData, token: jwt });

    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
