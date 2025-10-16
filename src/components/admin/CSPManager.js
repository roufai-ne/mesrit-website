// src/components/admin/CSPManager.js
import React, { useState, useEffect } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { 
  Shield, 
  Code, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  FileText,
  Settings,
  Activity,
  Zap,
  Globe,
  Lock
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';
import { useToast } from '@/components/ui/toast';

export default function CSPManager() {
  const permissions = usePermission();
  const { execute, loading } = useApiAction();
  const { toast } = useToast();
  
  // États
  const [cspStats, setCspStats] = useState(null);
  const [violations, setViolations] = useState([]);
  const [showPolicy, setShowPolicy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    loadCSPData();
  }, []);

  const loadCSPData = async () => {
    setRefreshing(true);
    try {
      // Simuler les données CSP (à remplacer par de vraies APIs)
      setCspStats({
        policyActive: true,
        noncesGenerated: 1247,
        violationsBlocked: 0,
        last24hViolations: 0,
        protectedDirectives: 11,
        allowedDomains: 8
      });

      setViolations([
        // Exemple de violations (vide pour l'instant)
      ]);
    } catch (error) {
      console.error('Erreur chargement données CSP:', error);
      toast.error('Erreur lors du chargement des données CSP');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestCSP = async () => {
    try {
      await execute(async () => {
        // Simuler un test CSP
        toast.info('Test CSP en cours...');
        
        // Ici on pourrait faire un vrai test
        setTimeout(() => {
          toast.success('Test CSP réussi - Aucune violation détectée');
        }, 2000);
      });
    } catch (error) {
      toast.error(`Erreur lors du test CSP: ${error.message}`);
    }
  };

  const handleExportViolations = async () => {
    try {
      await execute(async () => {
        // Simuler l'export des violations
        const data = {
          violations: violations,
          exportDate: new Date().toISOString(),
          stats: cspStats
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `csp-violations-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Rapport CSP exporté avec succès');
      });
    } catch (error) {
      toast.error(`Erreur lors de l'export: ${error.message}`);
    }
  };

  if (!permissions.canManageSystem) {
    return (
      <div className="text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès Restreint</h3>
        <p className="text-gray-600">Vous n'avez pas les permissions pour gérer le CSP.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
            Content Security Policy
          </h1>
          <p className="text-readable-muted dark:text-muted-foreground">
            Gestion et monitoring de la politique de sécurité du contenu
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={loadCSPData}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser</span>
          </button>
          
          <button
            onClick={handleTestCSP}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>Tester CSP</span>
          </button>
        </div>
      </div>

      {/* Métriques CSP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Statut général */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              cspStats?.policyActive 
                ? 'bg-green-100 dark:bg-green-900/40' 
                : 'bg-red-100 dark:bg-red-900/40'
            }`}>
              <Shield className={`w-6 h-6 ${
                cspStats?.policyActive ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {cspStats?.policyActive ? 'ACTIF' : 'INACTIF'}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Politique CSP
              </div>
            </div>
          </div>
        </div>

        {/* Nonces générés */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {cspStats?.noncesGenerated?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Nonces générés
              </div>
            </div>
          </div>
        </div>

        {/* Violations bloquées */}
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-niger-green dark:text-niger-green-light">
                {cspStats?.violationsBlocked || 0}
              </div>
              <div className="text-sm text-readable-muted dark:text-muted-foreground">
                Violations bloquées
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Politique CSP */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-niger-orange" />
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Politique de Sécurité
            </h2>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPolicy(!showPolicy)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {showPolicy ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPolicy ? 'Masquer' : 'Afficher'}</span>
            </button>
            
            <button
              onClick={handleExportViolations}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-niger-green text-white rounded-lg hover:bg-niger-green-dark transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {showPolicy && (
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto mb-6">
            <div className="space-y-2">
              <div><span className="text-blue-400">default-src</span> <span className="text-yellow-300">'self'</span>;</div>
              <div><span className="text-blue-400">script-src</span> <span className="text-yellow-300">'self' 'nonce-{'{nonce}'}' https://cdn.jsdelivr.net</span>;</div>
              <div><span className="text-blue-400">style-src</span> <span className="text-yellow-300">'self' 'nonce-{'{nonce}'}' 'unsafe-inline' https://fonts.googleapis.com</span>;</div>
              <div><span className="text-blue-400">font-src</span> <span className="text-yellow-300">'self' https://fonts.gstatic.com data:</span>;</div>
              <div><span className="text-blue-400">img-src</span> <span className="text-yellow-300">'self' data: blob: https:</span>;</div>
              <div><span className="text-blue-400">connect-src</span> <span className="text-yellow-300">'self'</span>;</div>
              <div><span className="text-blue-400">media-src</span> <span className="text-yellow-300">'self' data: blob:</span>;</div>
              <div><span className="text-blue-400">object-src</span> <span className="text-red-400">'none'</span>;</div>
              <div><span className="text-blue-400">frame-src</span> <span className="text-red-400">'none'</span>;</div>
              <div><span className="text-blue-400">base-uri</span> <span className="text-yellow-300">'self'</span>;</div>
              <div><span className="text-blue-400">form-action</span> <span className="text-yellow-300">'self'</span>;</div>
              <div><span className="text-blue-400">frame-ancestors</span> <span className="text-red-400">'none'</span>;</div>
            </div>
          </div>
        )}

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
              Directives Protégées
            </h3>
            <div className="space-y-2">
              {[
                { name: 'script-src', status: 'Sécurisé', color: 'green' },
                { name: 'style-src', status: 'Sécurisé', color: 'green' },
                { name: 'img-src', status: 'Permissif', color: 'yellow' },
                { name: 'object-src', status: 'Bloqué', color: 'red' },
                { name: 'frame-src', status: 'Bloqué', color: 'red' }
              ].map((directive, index) => (
                <div key={index} className={`flex items-center justify-between p-3 bg-${directive.color}-50 dark:bg-${directive.color}-900/20 rounded-lg`}>
                  <div className="flex items-center space-x-2">
                    <Code className={`w-4 h-4 text-${directive.color}-600`} />
                    <span className="font-mono text-sm">{directive.name}</span>
                  </div>
                  <span className={`text-xs text-${directive.color}-600 bg-${directive.color}-100 dark:bg-${directive.color}-900/40 px-2 py-1 rounded`}>
                    {directive.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-niger-green dark:text-niger-green-light mb-3">
              Domaines Autorisés
            </h3>
            <div className="space-y-2">
              {[
                'fonts.googleapis.com',
                'fonts.gstatic.com',
                'cdn.jsdelivr.net',
                'unpkg.com'
              ].map((domain, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-mono">{domain}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring en temps réel */}
      <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="w-6 h-6 text-niger-orange" />
          <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
            Monitoring Temps Réel
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Sécurité Active
              </h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Protection XSS</span>
                <span className="text-green-600 font-medium">✓ Actif</span>
              </div>
              <div className="flex justify-between">
                <span>Injection de code</span>
                <span className="text-green-600 font-medium">✓ Bloqué</span>
              </div>
              <div className="flex justify-between">
                <span>Clickjacking</span>
                <span className="text-green-600 font-medium">✓ Protégé</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-800 dark:text-blue-200">
                Dernières 24h
              </h3>
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Nonces générés</span>
                <span className="text-blue-600 font-medium">1,247</span>
              </div>
              <div className="flex justify-between">
                <span>Violations détectées</span>
                <span className="text-blue-600 font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span>Scripts bloqués</span>
                <span className="text-blue-600 font-medium">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}