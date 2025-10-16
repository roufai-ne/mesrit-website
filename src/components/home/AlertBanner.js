// src/components/home/AlertBanner.js
import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Loader2 } from 'lucide-react';


export default function AlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [currentAlert, setCurrentAlert] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    if (!fetchAttempted) {
      fetchAlerts();
    }
  }, [fetchAttempted]);

  // Auto-rotation des alertes
  useEffect(() => {
    if (alerts.length <= 1) return;
    
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentAlert((prev) => (prev + 1) % alerts.length);
        setIsAnimating(false);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, [alerts.length]);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    setFetchAttempted(true);
    try {
      const response = await fetch('/api/alerts');
      if (!response.ok) {
        let message = `Erreur de chargement des alertes (${response.status})`;
        if (response.status === 429) message = 'Trop de requêtes, veuillez patienter.';
        if (response.status === 401) message = 'Accès non autorisé.';
        if (response.status === 403) message = 'Accès interdit.';
        throw new Error(message);
      }
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.message);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-col items-center justify-center py-4">
            <AlertTriangle className="w-8 h-8 text-white mb-2" />
            <div className="text-white font-semibold mb-2">Impossible de charger les alertes</div>
            <div className="text-white/80 text-sm mb-4">{error}</div>
            <button
              className="px-4 py-2 bg-white/20 text-white rounded hover:bg-white/30"
              onClick={() => { setFetchAttempted(false); setError(null); }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (alerts.length === 0 || isDismissed) return null;

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'from-red-600 to-red-700 shadow-red-500/20';
      case 'medium':
        return 'from-amber-500 to-amber-600 shadow-amber-500/20';
      default:
        return 'from-blue-600 to-blue-700 shadow-blue-500/20';
    }
  };

  const currentAlertStyles = getPriorityStyles(alerts[currentAlert].priority);

  return (
    <div className={`relative z-50 bg-gradient-to-r ${currentAlertStyles} shadow-lg`}>
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white animate-shine" />
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center flex-1">
            <span className={`flex rounded-lg p-2 backdrop-blur-sm bg-white/10 animate-bounce-slow`}>
              {alerts[currentAlert].priority === 'high' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Bell className="h-5 w-5" />
              )}
            </span>

            <div className={`ml-3 flex-1 transition-all duration-500 ${
              isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}>
              <p className="font-semibold text-white">
                {alerts[currentAlert].title}
              </p>
              <p className="text-sm text-white/80">
                {alerts[currentAlert].description}
              </p>
            </div>
          </div>
          
          {alerts.length > 1 && (
            <div className="flex items-center space-x-2 mx-4">
              {alerts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentAlert(idx)}
                  className={`transition-all duration-300 ${
                    idx === currentAlert
                      ? 'w-6 h-1.5 bg-white'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
                  } rounded-full`}
                  aria-label={`Afficher l'alerte ${idx + 1}`}
                />
              ))}
            </div>
          )}
          
          <button 
            onClick={() => setIsDismissed(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-4"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}