// contexts/AuthContext.js
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/components/ui/toast';
import { registerAuthUtils } from '@/lib/secureApi';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const router = useRouter();
  const { toast } = useToast();
  
  // Enregistrement des utilitaires pour secureApi (logout, toast)
  useEffect(() => {
    registerAuthUtils({ logout, toast });
  }, [toast]);

  // Refs pour éviter les re-renders inutiles
  const refreshIntervalRef = useRef(null);
  const monitorIntervalRef = useRef(null);
  const lastRefreshRef = useRef(0);


  const fetchSessionInfo = useCallback(async (targetSessionId) => {
    try {
      const response = await fetch(`/api/admin/sessions/${targetSessionId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionInfo(data.session);
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error);
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('[AuthContext] Checking auth status...');
      
      // Use direct fetch instead of apiCall to avoid error notifications
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[AuthContext] Auth check successful, user:', data.user.username);
        setUser(data.user);
        
        // Gérer les informations de session si disponibles
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          if (data.user.role === 'admin') {
            fetchSessionInfo(data.sessionId);
          }
        }
      } else {
        // Authentication failed - this is normal for non-authenticated users
        console.log('[AuthContext] User not authenticated (status:', response.status, ')');
        setUser(null);
        setSessionId(null);
        setSessionInfo(null);
      }
    } catch (error) {
      console.log('[AuthContext] Auth check network error:', error.message);
      // Only log network errors, don't treat auth failures as errors
      setUser(null);
      setSessionId(null);
      setSessionInfo(null);
    } finally {
      setLoading(false);
      console.log('[AuthContext] Auth check finished. Loading:', false);
    }
  }, [sessionId, fetchSessionInfo]);

  useEffect(() => {
    console.log('[AuthContext] useEffect mount: checkAuthStatus');
    // Wrap in try-catch to prevent errors from propagating to ErrorBoundary
    const initAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('[AuthContext] Failed to check auth status on mount:', error);
        // Don't re-throw the error, just ensure loading is set to false
        setLoading(false);
      }
    };
    initAuth();
  }, [checkAuthStatus]);

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include session tracking headers
          'X-Client-Info': JSON.stringify({
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || 'Erreur de connexion');
        error.status = response.status;
        error.type = response.status === 401 ? 'AUTHENTICATION' : 'UNKNOWN';
        throw error;
      }

      const data = await response.json();

      // Set user data from response
      setUser(data.user);
      
      console.log('Connexion réussie pour:', data.user.username);

      // Show success notification
      toast.success(`Bienvenue, ${data.user.username} !`, {
        duration: 3000
      });

      // Handle first login redirect
      if (data.user.isFirstLogin) {
        toast.info('Veuillez changer votre mot de passe pour continuer', {
          duration: 5000
        });
        router.push('/admin/change-password');
      } else {
        router.push('/admin/Dashboard');
      }

      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Re-lancer l'erreur pour que le composant puisse la gérer
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear intervals first
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }

      // Call logout endpoint to clear cookies and invalidate session
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId || ''
        },
        credentials: 'include'
      });

      // Clear all session state
      setUser(null);
      setSessionId(null);
      setSessionInfo(null);

      // Show logout notification
      toast.success('You have been logged out successfully', {
        duration: 3000
      });

      // Log chemin courant (console et localStorage)
      const logMsg = `[AuthContext] logout: pathname ${router.pathname} @ ${new Date().toISOString()}`;
      console.log(logMsg);
      try {
        const prevLogs = JSON.parse(localStorage.getItem('auth_logout_logs') || '[]');
        prevLogs.push(logMsg);
        localStorage.setItem('auth_logout_logs', JSON.stringify(prevLogs));
      } catch (e) {}

      // Ne pas rediriger si sur une page publique
      const publicPaths = ['/', '/index'];
      if (!publicPaths.includes(router.pathname)) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state and redirect
      setUser(null);
      setSessionId(null);
      setSessionInfo(null);
      toast.warning('Logout completed (with some issues)', {
        duration: 3000
      });
      // Log chemin courant (console et localStorage)
      const logMsg = `[AuthContext] logout (error): pathname ${router.pathname} @ ${new Date().toISOString()}`;
      console.log(logMsg);
      try {
        const prevLogs = JSON.parse(localStorage.getItem('auth_logout_logs') || '[]');
        prevLogs.push(logMsg);
        localStorage.setItem('auth_logout_logs', JSON.stringify(prevLogs));
      } catch (e) {}
      if (!['/', '/index'].includes(router.pathname)) {
        router.push('/auth/login');
      }
    }
  };

  // Enhanced auto-refresh token mechanism with session validation
  useEffect(() => {
    if (!user || !sessionId) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      return;
    }
    // ...existing code pour refresh interval...
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    refreshIntervalRef.current = setInterval(async () => {
      try {
        const now = Date.now();
        if (now - lastRefreshRef.current < 60000) {
          return;
        }
        lastRefreshRef.current = now;
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'X-Session-ID': sessionId
          },
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setSessionInfo(prev => prev ? {
            ...prev,
            lastActivity: new Date().toISOString()
          } : null);
        } else {
          console.warn('Token refresh failed, logging out user');
          logout();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 14 * 60 * 1000);
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user, sessionId]);

  // Session monitoring for security (detect concurrent sessions, etc.)
  useEffect(() => {
  // Suppression du contrôle isPublicPage, monitoring toujours actif si user admin et sessionId
    if (!user || user.role !== 'admin' || !sessionId) {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
      return;
    }
    // ...existing code pour monitoring interval...
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
    }
    monitorIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/sessions/${sessionId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setSessionInfo(data.session);
        }
      } catch (error) {
        console.error('Session monitoring error:', error);
      }
    }, 60 * 1000);
    return () => {
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
    };
  }, [user?.role, sessionId]);

  const terminateSession = async (targetSessionId) => {
    try {
      const response = await fetch(`/api/admin/sessions/${targetSessionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Session terminated successfully');
        return true;
      } else {
        throw new Error('Failed to terminate session');
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
      return false;
    }
  };

  const isAdmin = user?.role === 'admin';
  const isEditor = user?.role === 'editor';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAdmin,
      isEditor,
      isAuthenticated,
      checkAuthStatus,
      // Session management features
      sessionId,
      sessionInfo,
      terminateSession,
      fetchSessionInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};