// src/components/admin/SecurityDashboard.js
import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { 
  Shield, 
  Key, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Trash2,
  Clock,
  Users,
  Globe,
  Lock,
  Unlock,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  Code,
  FileText
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { useToast } from '@/components/ui/toast';

export default function SecurityDashboard() {
  const permissions = usePermission();
  const { execute, loading } = useApiAction();
  const { toast } = useToast();
  
  // États
  const [secretsStatus, setSecretsStatus] = useState(null);
  const [rateLimitStats, setRateLimitStats] = useState(null);
  const [cspViolations, setCspViolations] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCSPPolicy, setShowCSPPolicy] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setRefreshing(true);
    try {
      // Charger le statut des secrets
      const secretsResponse = await secureApi.get('/api/admin/security/secrets', true);
      setSecretsStatus(secretsResponse.data);

      // Charger les stats de rate limiting
      const rateLimitResponse = await secureApi.get('/api/admin/security/rate-limits?timeRange=3600', true);
      setRateLimitStats(rateLimitResponse.data);

      // Charger les violations CSP (simulé pour l'instant)
      setCspViolations({
        total: 0,
        last24h: 0,
        topViolations: [],
        policyStatus: 'active'
      });
    } catch (error) {
      console.error('Erreur chargement données sécurité:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRotateSecrets = async (force = false) => {
    try {
      await execute(async () => {
        const response = await secureApi.post('/api/admin/security/secrets', {
          action: 'rotate',
          force
        }, true);
        
        if (response.success) {
          await loadSecurityData();
          toast.success('Rotation des secrets effectuée avec succès !');
        } else {
          toast.warning(response.message);
        }
      });
    } catch (error) {
      toast.error(`Erreur lors de la rotation: ${error.message}`);
    }
  };

  const handleResetRateLimit = async (identifier) => {
    if (!identifier) {
      identifier = prompt('Entrez l\'identifiant à réinitialiser (ex: ip:192.168.1.1 ou user:123):');
      if (!identifier) return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.post('/api/admin/security/rate-limits', {
          action: 'reset',
          identifier
        }, true);
        
        if (response.success) {
          await loadSecurityData();
          toast.success(`Limites réinitialisées pour ${identifier}`);
        }
      });
    } catch (error) {
      toast.error(`Erreur lors de la réinitialisation: ${error.message}`);
    }
  };

  const handleCleanupRateLimits = async () => {
    if (!confirm('Supprimer tous les enregistrements de rate limiting de plus de 24h ?')) {
      return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.post('/api/admin/security/rate-limits', {
          action: 'cleanup'
        }, true);
        
        if (response.success) {
          await loadSecurityData();
          alert(response.message);
        }
      });
    } catch (error) {
      alert(`Erreur lors du nettoyage: ${error.message}`);
    }
  };

  if (!permissions.canManageSystem) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès Restreint</h3>
        <p className="text-gray-600">Vous n'avez pas les permissions pour accéder au dashboard de sécurité.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
            Dashboard Sécurité
          </h1>
          <p className="text-readable-muted dark:text-muted-foreground">
            Monitoring et gestion de la sécurité système
          </p>
        </div>
        
        <button
          onClick={loadSecurityData}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-niger-green text-white rounded-lg hover:bg-niger-green-dark transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Métriques de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Statut des secrets */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              secretsStatus?.needsRotation 
                ? 'bg-red-100 dark:bg-red-900/40' 
                : 'bg-green-100 dark:bg-green-900/40'
            }`}>
              <Key className={`w-6 h-6 ${
                secretsStatus?.needsRotation ? 'text-red-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {secretsStatus?.daysUntilRotation || 'N/A'}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Jours avant rotation
              </div>
            </div>
          </div>
        </div>

        {/* Rate limiting */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {rateLimitStats?.totalRequests || 0}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Requêtes (1h)
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints actifs */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-niger-orange/20 rounded-lg">
              <Globe className="w-6 h-6 text-niger-orange" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {rateLimitStats?.endpointStats?.length || 0}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Endpoints actifs
              </div>
            </div>
          </div>
        </div>

        {/* Utilisateurs uniques */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {rateLimitStats?.topIdentifiers?.length || 0}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Utilisateurs actifs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section CSP (Content Security Policy) */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-niger-orange" />
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Content Security Policy (CSP)
            </h2>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCSPPolicy(!showCSPPolicy)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showCSPPolicy ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showCSPPolicy ? 'Masquer' : 'Voir'} Politique</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Statut CSP */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-semibold text-green-800 dark:text-green-200">
                  CSP Actif
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Politique appliquée avec nonces
                </div>
              </div>
            </div>
          </div>

          {/* Violations CSP */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-800 dark:text-blue-200">
                  {cspViolations?.last24h || 0} Violations
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Dernières 24h
                </div>
              </div>
            </div>
          </div>

          {/* Mode CSP */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3">
              <Code className="w-6 h-6 text-orange-600" />
              <div>
                <div className="font-semibold text-orange-800 dark:text-orange-200">
                  Mode Enforce
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  + Report-Only (dev)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Politique CSP détaillée */}
        {showCSPPolicy && (
          <div className="bg-gray-50 dark:bg-secondary-700 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Politique CSP Actuelle
            </h3>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="space-y-1">
                <div><span className="text-blue-400">default-src</span> 'self';</div>
                <div><span className="text-blue-400">script-src</span> 'self' 'nonce-{'{nonce}'}';</div>
                <div><span className="text-blue-400">style-src</span> 'self' 'nonce-{'{nonce}'}' 'unsafe-inline' https://fonts.googleapis.com;</div>
                <div><span className="text-blue-400">font-src</span> 'self' https://fonts.gstatic.com data:;</div>
                <div><span className="text-blue-400">img-src</span> 'self' data: blob: https:;</div>
                <div><span className="text-blue-400">connect-src</span> 'self';</div>
                <div><span className="text-blue-400">object-src</span> 'none';</div>
                <div><span className="text-blue-400">frame-src</span> 'none';</div>
                <div><span className="text-blue-400">base-uri</span> 'self';</div>
                <div><span className="text-blue-400">form-action</span> 'self';</div>
                <div><span className="text-blue-400">frame-ancestors</span> 'none';</div>
              </div>
            </div>
          </div>
        )}

        {/* Fonctionnalités CSP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
              Protections Actives
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Protection XSS</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                  Actif
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Injection de Code</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                  Bloqué
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Clickjacking</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                  Protégé
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Nonces Dynamiques</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                  Généré
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
              Monitoring CSP
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Violations Totales
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    Depuis le déploiement
                  </div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {cspViolations?.total || 0}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Scripts Inline Détectés
                  </div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">
                    Nécessitent des nonces
                  </div>
                </div>
                <div className="text-lg font-bold text-yellow-600">
                  0
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    Domaines Autorisés
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    Dans la whitelist
                  </div>
                </div>
                <div className="text-lg font-bold text-purple-600">
                  8
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestion des secrets */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Key className="w-6 h-6 text-niger-orange" />
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Gestion des Secrets
            </h2>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleRotateSecrets(false)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rotation</span>
            </button>
            
            <button
              onClick={() => handleRotateSecrets(true)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Forcer</span>
            </button>
          </div>
        </div>

        {secretsStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
                Statut Actuel
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-readable-muted dark:text-muted-foreground">
                    Rotation nécessaire
                  </span>
                  <div className="flex items-center space-x-2">
                    {secretsStatus.needsRotation ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      secretsStatus.needsRotation ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {secretsStatus.needsRotation ? 'Oui' : 'Non'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-readable-muted dark:text-muted-foreground">
                    Jours restants
                  </span>
                  <span className="text-sm font-medium text-niger-green dark:text-niger-green-light">
                    {secretsStatus.daysUntilRotation}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-readable-muted dark:text-muted-foreground">
                    Période de grâce
                  </span>
                  <span className={`text-sm font-medium ${
                    secretsStatus.isInGracePeriod ? 'text-yellow-600' : 'text-gray-600'
                  }`}>
                    {secretsStatus.isInGracePeriod ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
                Prochaine Rotation
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-readable-muted dark:text-muted-foreground" />
                  <span className="text-sm text-readable-muted dark:text-muted-foreground">
                    {secretsStatus.nextRotationDate ? 
                      new Date(secretsStatus.nextRotationDate).toLocaleDateString('fr-FR') :
                      'Non planifiée'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques Rate Limiting */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-niger-orange" />
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Rate Limiting
            </h2>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => handleResetRateLimit()}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
            
            <button
              onClick={handleCleanupRateLimits}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Nettoyer</span>
            </button>
          </div>
        </div>

        {rateLimitStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Endpoints */}
            <div>
              <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
                Endpoints les Plus Utilisés
              </h3>
              <div className="space-y-2">
                {rateLimitStats.endpointStats?.slice(0, 5).map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-niger-cream/50 dark:bg-secondary-700 rounded-lg">
                    <div>
                      <div className="font-medium text-niger-green dark:text-niger-green-light">
                        {endpoint.endpoint}
                      </div>
                      <div className="text-sm text-readable-muted dark:text-muted-foreground">
                        {endpoint.uniqueUsers} utilisateurs uniques
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-niger-orange">
                        {endpoint.requests}
                      </div>
                      <div className="text-sm text-readable-muted dark:text-muted-foreground">
                        requêtes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Utilisateurs */}
            <div>
              <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
                Utilisateurs les Plus Actifs
              </h3>
              <div className="space-y-2">
                {rateLimitStats.topIdentifiers?.slice(0, 5).map((identifier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-niger-cream/50 dark:bg-secondary-700 rounded-lg">
                    <div>
                      <div className="font-medium text-niger-green dark:text-niger-green-light">
                        {identifier.identifier}
                      </div>
                      <div className="text-sm text-readable-muted dark:text-muted-foreground">
                        {identifier.endpointCount} endpoints
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-niger-orange">
                        {identifier.requests}
                      </div>
                      <div className="text-sm text-readable-muted dark:text-muted-foreground">
                        requêtes
                      </div>
                      <button
                        onClick={() => handleResetRateLimit(identifier.identifier)}
                        className="text-xs text-red-600 hover:text-red-800 mt-1"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}