// src/components/debug/AuthDebug.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthDebug() {
  const { user, loading, sessionId, sessionInfo, isAuthenticated } = useAuth();
  const [renderCount, setRenderCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Compteur de rendus pour détecter les boucles
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastUpdate(new Date());
  });

  // Log des changements d'état
  useEffect(() => {
    console.log('🔍 AuthDebug - Auth state changed:', {
      user: user?.username,
      loading,
      sessionId,
      isAuthenticated,
      renderCount,
      timestamp: new Date().toISOString()
    });
  }, [user, loading, sessionId, isAuthenticated, renderCount]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Ne pas afficher en production
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      
      <div className="space-y-1">
        <div>Renders: {renderCount}</div>
        <div>Last Update: {lastUpdate.toLocaleTimeString()}</div>
        <div>Loading: {loading ? '🔄' : '✅'}</div>
        <div>Authenticated: {isAuthenticated ? '🔐' : '❌'}</div>
        {user && (
          <div>User: {user.username} ({user.role})</div>
        )}
        {sessionId && (
          <div>Session: {sessionId.substring(0, 8)}...</div>
        )}
        {sessionInfo && (
          <div>Session Info: {sessionInfo.lastActivity ? 'Active' : 'No activity'}</div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-white/20">
        <div className="text-xs opacity-70">
          Check console for detailed logs
        </div>
      </div>
    </div>
  );
}