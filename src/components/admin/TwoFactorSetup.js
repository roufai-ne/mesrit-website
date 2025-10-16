// src/components/admin/TwoFactorSetup.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { secureApi, useApiAction } from '@/lib/secureApi';

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const { execute, loading } = useApiAction();
  
  // États
  const [step, setStep] = useState('status'); // status, setup, verify, manage
  const [setupData, setSetupData] = useState(null);
  const [status, setStatus] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  // Charger le statut au montage
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await secureApi.get('/api/auth/2fa/manage', true);
      setStatus(response.data);
    } catch (error) {
      console.error('Erreur chargement statut 2FA:', error);
    }
  };

  const startSetup = async () => {
    try {
      await execute(async () => {
        const response = await secureApi.get('/api/auth/2fa/setup', true);
        setSetupData(response.data);
        setStep('setup');
      });
    } catch (error) {
      alert(`Erreur lors de l'initialisation: ${error.message}`);
    }
  };

  const enable2FA = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      alert('Veuillez entrer un code à 6 chiffres');
      return;
    }

    try {
      await execute(async () => {
        const response = await secureApi.post('/api/auth/2fa/setup', {
          secret: setupData.secret,
          verificationToken,
          action: 'enable'
        }, true);
        
        if (response.success) {
          setBackupCodes(response.data.backupCodes);
          setStep('backup-codes');
          await loadStatus();
        }
      });
    } catch (error) {
      alert(`Erreur lors de l'activation: ${error.message}`);
    }
  };

  const disable2FA = async () => {
    const currentPassword = prompt('Entrez votre mot de passe actuel:');
    if (!currentPassword) return;

    const token = prompt('Entrez votre code 2FA actuel:');
    if (!token) return;

    if (!confirm('Êtes-vous sûr de vouloir désactiver le 2FA ?')) return;

    try {
      await execute(async () => {
        const response = await secureApi.post('/api/auth/2fa/manage', {
          action: 'disable',
          currentPassword,
          verificationToken: token
        }, true);
        
        if (response.success) {
          await loadStatus();
          setStep('status');
          alert('2FA désactivé avec succès');
        }
      });
    } catch (error) {
      alert(`Erreur lors de la désactivation: ${error.message}`);
    }
  };

  const regenerateBackupCodes = async () => {
    const currentPassword = prompt('Entrez votre mot de passe actuel:');
    if (!currentPassword) return;

    const token = prompt('Entrez votre code 2FA actuel:');
    if (!token) return;

    if (!confirm('Régénérer les codes de sauvegarde ? Les anciens codes seront invalidés.')) return;

    try {
      await execute(async () => {
        const response = await secureApi.post('/api/auth/2fa/manage', {
          action: 'regenerate-backup-codes',
          currentPassword,
          verificationToken: token
        }, true);
        
        if (response.success) {
          setBackupCodes(response.data.backupCodes);
          setShowBackupCodes(true);
          alert('Codes de sauvegarde régénérés');
        }
      });
    } catch (error) {
      alert(`Erreur lors de la régénération: ${error.message}`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadBackupCodes = () => {
    const content = `MESRIT - Codes de sauvegarde 2FA
Générés le: ${new Date().toLocaleString('fr-FR')}
Utilisateur: ${user.username}

IMPORTANT: Conservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Instructions:
- Utilisez ces codes si vous perdez l'accès à votre application d'authentification
- Chaque code ne fonctionne qu'une seule fois
- Régénérez de nouveaux codes après en avoir utilisé plusieurs
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mesrit-backup-codes-${user.username}-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-niger-orange" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-niger-orange/10 rounded-full">
            <Shield className="w-8 h-8 text-niger-orange" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-niger-green dark:text-niger-green-light mb-2">
          Authentification à Deux Facteurs
        </h1>
        <p className="text-readable-muted dark:text-muted-foreground">
          Sécurisez votre compte avec une couche de protection supplémentaire
        </p>
      </div>

      {/* Statut actuel */}
      {step === 'status' && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Statut 2FA
            </h2>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
              status.enabled 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
            }`}>
              {status.enabled ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Activé</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Désactivé</span>
                </>
              )}
            </div>
          </div>

          {status.enabled ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-niger-cream/50 dark:bg-secondary-700 rounded-lg">
                  <div className="text-sm text-readable-muted dark:text-muted-foreground mb-1">
                    Activé le
                  </div>
                  <div className="font-medium text-niger-green dark:text-niger-green-light">
                    {status.activatedAt ? 
                      new Date(status.activatedAt).toLocaleDateString('fr-FR') : 
                      'Date inconnue'
                    }
                  </div>
                </div>
                
                <div className="p-4 bg-niger-cream/50 dark:bg-secondary-700 rounded-lg">
                  <div className="text-sm text-readable-muted dark:text-muted-foreground mb-1">
                    Codes de sauvegarde
                  </div>
                  <div className="font-medium text-niger-green dark:text-niger-green-light">
                    {status.backupCodesCount} restants
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={regenerateBackupCodes}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Régénérer codes</span>
                </button>
                
                <button
                  onClick={disable2FA}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Désactiver 2FA</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-niger-green dark:text-niger-green-light mb-2">
                2FA non activé
              </h3>
              <p className="text-readable-muted dark:text-muted-foreground mb-6">
                Activez l'authentification à deux facteurs pour sécuriser votre compte
              </p>
              
              <button
                onClick={startSetup}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-niger-green text-white rounded-lg hover:bg-niger-green-dark transition-colors disabled:opacity-50 mx-auto"
              >
                <Shield className="w-5 h-5" />
                <span>Activer le 2FA</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Configuration */}
      {step === 'setup' && setupData && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light mb-6">
            Configuration 2FA
          </h2>

          <div className="space-y-6">
            {/* QR Code */}
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-lg border">
                <Image 
                  src={setupData.qrCode} 
                  alt="QR Code 2FA"
                  width={192}
                  height={192}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-readable-muted dark:text-muted-foreground mt-2">
                Scannez ce QR code avec votre application d'authentification
              </p>
            </div>

            {/* Clé manuelle */}
            <div>
              <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                Ou entrez cette clé manuellement :
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={setupData.manualEntryKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-niger-orange/20 rounded-lg bg-gray-50 dark:bg-secondary-700 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(setupData.manualEntryKey)}
                  className="p-2 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Vérification */}
            <div>
              <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                Code de vérification :
              </label>
              <input
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-3 py-2 border border-niger-orange/20 rounded-lg focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange text-center font-mono text-lg"
                maxLength={6}
              />
              <p className="text-sm text-readable-muted dark:text-muted-foreground mt-1">
                Entrez le code à 6 chiffres généré par votre application
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('status')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-secondary-700 transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={enable2FA}
                disabled={loading || verificationToken.length !== 6}
                className="flex-1 px-4 py-2 bg-niger-green text-white rounded-lg hover:bg-niger-green-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Activation...' : 'Activer 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codes de sauvegarde */}
      {step === 'backup-codes' && backupCodes.length > 0 && (
        <div className="bg-white dark:bg-secondary-800 rounded-xl p-6 border border-niger-orange/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-niger-green dark:text-niger-green-light">
              Codes de Sauvegarde
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="p-2 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
              >
                {showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={downloadBackupCodes}
                className="p-2 text-niger-orange hover:bg-niger-orange/10 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                  Important !
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Conservez ces codes en lieu sûr. Ils vous permettront d'accéder à votre compte 
                  si vous perdez votre appareil d'authentification. Chaque code ne peut être utilisé qu'une seule fois.
                </p>
              </div>
            </div>
          </div>

          {showBackupCodes && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-secondary-700 rounded-lg font-mono text-center">
                  {code}
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={downloadBackupCodes}
              className="flex items-center space-x-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger</span>
            </button>
            
            <button
              onClick={() => setStep('status')}
              className="flex-1 px-4 py-2 bg-niger-green text-white rounded-lg hover:bg-niger-green-dark transition-colors"
            >
              Terminer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}