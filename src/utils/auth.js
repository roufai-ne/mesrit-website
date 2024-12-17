// src/utils/auth.js
import { createContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    try {
      // Simuler une connexion
      if (credentials.username === 'admin' && credentials.password === 'password') {
        setUser({
          id: 1,
          username: 'admin',
          role: 'admin'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
