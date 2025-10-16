// src/components/admin/NewsletterConfigManager.js
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Settings, Save, RefreshCw } from 'lucide-react';
import { secureApi } from '@/lib/secureApi';

export default function NewsletterConfigManager() {
  const [config, setConfig] = useState({
    autoSendEnabled: true,
    sendType: 'immediate',
    includedCategories: [],
    excludedCategories: [],
    digestTime: '09:00',
    weeklyDigestDay: 1,
    emailSignature: 'Ministère de l\'Enseignement Supérieur, de la Recherche et de l\'Innovation Technologique\nRépublique du Niger'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const categories = ['Communiqués', 'Événements', 'Annonces', 'Formations', 'Recherche'];
  const sendTypes = [
    { value: 'immediate', label: 'Envoi immédiat lors de publication' },
    { value: 'daily_digest', label: 'Digest quotidien' },
    { value: 'weekly_digest', label: 'Digest hebdomadaire' },
    { value: 'manual_only', label: 'Manuel uniquement' }
  ];
  
  const weekDays = [
    { value: 0, label: 'Dimanche' },
    { value: 1, label: 'Lundi' },
    { value: 2, label: 'Mardi' },
    { value: 3, label: 'Mercredi' },
    { value: 4, label: 'Jeudi' },
    { value: 5, label: 'Vendredi' },
    { value: 6, label: 'Samedi' }
  ];

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await secureApi.get('/api/newsletter/config', true);
      setConfig(data);
    } catch (error) {
      console.error('Erreur chargement config:', error);
      toast.error('Erreur de chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      await secureApi.post('/api/newsletter/config', config, true);
      toast.success('Configuration sauvegardée');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category, type) => {
    setConfig(prev => {
      const field = type === 'include' ? 'includedCategories' : 'excludedCategories';
      const otherField = type === 'include' ? 'excludedCategories' : 'includedCategories';
      
      const newCategories = prev[field].includes(category)
        ? prev[field].filter(c => c !== category)
        : [...prev[field], category];
      
      // Supprimer de l'autre liste si présent
      const otherCategories = prev[otherField].filter(c => c !== category);
      
      return {
        ...prev,
        [field]: newCategories,
        [otherField]: otherCategories
      };
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Chargement de la configuration...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-niger-green" />
        <div>
          <h2 className="text-2xl font-bold text-niger-green">Configuration Newsletter</h2>
          <p className="text-gray-500">Paramètres d'envoi automatique des actualités</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        
        {/* Activation générale */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-niger-green">Envoi automatique</h3>
            <p className="text-sm text-gray-600">Activer l'envoi automatique de newsletters</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoSendEnabled}
              onChange={(e) => setConfig(prev => ({ ...prev, autoSendEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {config.autoSendEnabled && (
          <>
            {/* Type d'envoi */}
            <div>
              <label className="block text-sm font-medium mb-2">Type d'envoi</label>
              <select
                value={config.sendType}
                onChange={(e) => setConfig(prev => ({ ...prev, sendType: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-niger-orange focus:border-niger-orange"
              >
                {sendTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Configuration digest */}
            {(config.sendType === 'daily_digest' || config.sendType === 'weekly_digest') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Heure d'envoi</label>
                  <input
                    type="time"
                    value={config.digestTime}
                    onChange={(e) => setConfig(prev => ({ ...prev, digestTime: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-niger-orange focus:border-niger-orange"
                  />
                </div>
                
                {config.sendType === 'weekly_digest' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Jour de la semaine</label>
                    <select
                      value={config.weeklyDigestDay}
                      onChange={(e) => setConfig(prev => ({ ...prev, weeklyDigestDay: parseInt(e.target.value) }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-niger-orange focus:border-niger-orange"
                    >
                      {weekDays.map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Catégories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-green-700">Catégories à inclure</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.includedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category, 'include')}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Si aucune catégorie sélectionnée, toutes seront incluses
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-red-700">Catégories à exclure</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.excludedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category, 'exclude')}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ces catégories ne seront jamais envoyées automatiquement
                </p>
              </div>
            </div>

            {/* Signature email */}
            <div>
              <label className="block text-sm font-medium mb-2">Signature email</label>
              <textarea
                value={config.emailSignature}
                onChange={(e) => setConfig(prev => ({ ...prev, emailSignature: e.target.value }))}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-niger-orange focus:border-niger-orange"
                placeholder="Signature qui apparaîtra en bas des emails automatiques"
              />
            </div>
          </>
        )}

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">ℹ️ Informations</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Envoi immédiat :</strong> Newsletter envoyée dès qu'une actualité est publiée</li>
          <li>• <strong>Digest quotidien :</strong> Résumé des actualités du jour envoyé à l'heure choisie</li>
          <li>• <strong>Digest hebdomadaire :</strong> Résumé des actualités de la semaine</li>
          <li>• <strong>Manuel uniquement :</strong> Pas d'envoi automatique, comme actuellement</li>
        </ul>
      </div>
    </div>
  );
}