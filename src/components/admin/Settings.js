import React, { useState } from 'react';
import Image from 'next/image';
import { Settings as SettingsIcon, Save, Globe, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Trash2, Plus, Upload, Image as ImageIcon, BarChart3, Edit, Eye, EyeOff, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { secureApi } from '@/lib/secureApi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { settings, setSettings } = useSettings();
  const [previews, setPreviews] = useState({});
  const [activeStatsTab, setActiveStatsTab] = useState('mission');
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

  const handleSave = async () => {
    try {
      await secureApi.post('/api/settings/update', settings, true);
      toast.success('Paramètres enregistrés avec succès');
      setPreviews({});
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des paramètres');
    }
  };

  // Fonctions pour gérer les statistiques du ministère
  const updateMinistryStats = (section, field, value) => {
    setSettings({
      ...settings,
      ministryStats: {
        ...settings.ministryStats,
        [section]: {
          ...settings.ministryStats?.[section],
          [field]: value
        }
      }
    });
  };

  const updateStat = (section, statId, field, value) => {
    const stats = settings.ministryStats?.[section]?.stats || [];
    const updatedStats = stats.map(stat => 
      stat.id === statId ? { ...stat, [field]: value } : stat
    );
    
    setSettings({
      ...settings,
      ministryStats: {
        ...settings.ministryStats,
        [section]: {
          ...settings.ministryStats?.[section],
          stats: updatedStats
        }
      }
    });
  };

  const addStat = (section) => {
    const stats = settings.ministryStats?.[section]?.stats || [];
    const newStat = {
      id: `stat_${Date.now()}`,
      label: 'Nouvelle statistique',
      value: 0,
      unit: '',
      order: stats.length + 1
    };
    
    setSettings({
      ...settings,
      ministryStats: {
        ...settings.ministryStats,
        [section]: {
          ...settings.ministryStats?.[section],
          stats: [...stats, newStat]
        }
      }
    });
  };

  const removeStat = (section, statId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette statistique ?')) return;
    
    const stats = settings.ministryStats?.[section]?.stats || [];
    const updatedStats = stats.filter(stat => stat.id !== statId);
    
    setSettings({
      ...settings,
      ministryStats: {
        ...settings.ministryStats,
        [section]: {
          ...settings.ministryStats?.[section],
          stats: updatedStats
        }
      }
    });
  };

  const moveStat = (section, statId, direction) => {
    const stats = settings.ministryStats?.[section]?.stats || [];
    const currentIndex = stats.findIndex(stat => stat.id === statId);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === stats.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newStats = [...stats];
    [newStats[currentIndex], newStats[newIndex]] = [newStats[newIndex], newStats[currentIndex]];
    
    // Mettre à jour les ordres
    newStats.forEach((stat, index) => {
      stat.order = index + 1;
    });

    setSettings({
      ...settings,
      ministryStats: {
        ...settings.ministryStats,
        [section]: {
          ...settings.ministryStats?.[section],
          stats: newStats
        }
      }
    });
  };

  const resetSection = (section) => {
    if (!confirm(`Êtes-vous sûr de vouloir réinitialiser la section ${section} ?`)) return;
    
    const defaultStats = {
      mission: [
        { id: 'programs', label: 'Programmes', value: 25, unit: '', order: 1 },
        { id: 'partnerships', label: 'Partenariats', value: 12, unit: '', order: 2 },
        { id: 'initiatives', label: 'Initiatives', value: 8, unit: '', order: 3 }
      ],
      organisation: [
        { id: 'directions', label: 'Directions', value: 8, unit: '', order: 1 },
        { id: 'services', label: 'Services', value: 24, unit: '', order: 2 },
        { id: 'departments', label: 'Départements', value: 15, unit: '', order: 3 }
      ],
      direction: [
        { id: 'executives', label: 'Cadres', value: 15, unit: '', order: 1 },
        { id: 'experience', label: 'Années d\'exp.', value: 180, unit: '+', order: 2 },
        { id: 'projects', label: 'Projets menés', value: 45, unit: '', order: 3 }
      ]
    };

    setSettings({
      ...settings,
      ministryStats: {
        ...settings.ministryStats,
        [section]: {
          enabled: true,
          stats: defaultStats[section] || []
        }
      }
    });
  };

  // Fonctions pour le mode JSON
  const toggleJsonMode = () => {
    if (!jsonMode) {
      // Passer en mode JSON : synchroniser le texte avec les données actuelles
      setJsonText(JSON.stringify(settings.ministryStats || {}, null, 2));
      setJsonError('');
    } else {
      // Sortir du mode JSON : appliquer les changements si le JSON est valide
      try {
        const parsedJson = JSON.parse(jsonText);
        setSettings({
          ...settings,
          ministryStats: parsedJson
        });
        setJsonError('');
      } catch (error) {
        setJsonError('JSON invalide : ' + error.message);
        return; // Ne pas changer de mode si le JSON est invalide
      }
    }
    setJsonMode(!jsonMode);
  };

  const handleJsonChange = (value) => {
    setJsonText(value);
    // Validation en temps réel
    try {
      JSON.parse(value);
      setJsonError('');
    } catch (error) {
      setJsonError('JSON invalide : ' + error.message);
    }
  };

  const applyJsonChanges = () => {
    try {
      const parsedJson = JSON.parse(jsonText);
      setSettings({
        ...settings,
        ministryStats: parsedJson
      });
      setJsonError('');
      toast.success('Modifications JSON appliquées avec succès !');
    } catch (error) {
      setJsonError('JSON invalide : ' + error.message);
      toast.error('JSON invalide : ' + error.message);
    }
  };

  const resetAllStats = () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser TOUTES les statistiques du ministère ? Cette action est irréversible.')) {
      return;
    }

    const defaultMinistryStats = {
      mission: {
        enabled: true,
        stats: [
          { id: 'programs', label: 'Programmes', value: 25, unit: '', order: 1 },
          { id: 'partnerships', label: 'Partenariats', value: 12, unit: '', order: 2 },
          { id: 'initiatives', label: 'Initiatives', value: 8, unit: '', order: 3 }
        ]
      },
      organisation: {
        enabled: true,
        stats: [
          { id: 'directions', label: 'Directions', value: 8, unit: '', order: 1 },
          { id: 'services', label: 'Services', value: 24, unit: '', order: 2 },
          { id: 'departments', label: 'Départements', value: 15, unit: '', order: 3 }
        ]
      },
      direction: {
        enabled: true,
        stats: [
          { id: 'executives', label: 'Cadres', value: 15, unit: '', order: 1 },
          { id: 'experience', label: 'Années d\'exp.', value: 180, unit: '+', order: 2 },
          { id: 'projects', label: 'Projets menés', value: 45, unit: '', order: 3 }
        ]
      }
    };

    setSettings({
      ...settings,
      ministryStats: defaultMinistryStats
    });

    // Si on est en mode JSON, mettre à jour le texte JSON aussi
    if (jsonMode) {
      setJsonText(JSON.stringify(defaultMinistryStats, null, 2));
      setJsonError('');
    }

    toast.success('Toutes les statistiques du ministère ont été réinitialisées aux valeurs par défaut.');
  };

  const handleHeaderImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      toast.error('Type de fichier invalide. Utilisez JPG, PNG ou WebP.');
      return;
    }
    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux. Taille maximum : 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews((prev) => ({ ...prev, headerImage: e.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      const response = await secureApi.uploadFile('/api/upload/image', file, true);
      const { url } = response;
      setSettings({ 
        ...settings, 
        header: { 
          ...settings.header, 
          backgroundImage: url 
        } 
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!validTypes.includes(file.type)) {
      toast.error('Type de fichier invalide. Utilisez JPG, PNG ou SVG.');
      return;
    }
    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux. Taille maximum : 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews((prev) => ({ ...prev, logo: e.target.result }));
    };
    reader.readAsDataURL(file);

    try {
      const response = await secureApi.uploadFile('/api/upload/image', file, true);
      const { url } = response;
      setSettings({ 
        ...settings, 
        header: { 
          ...settings.header, 
          logo: url 
        } 
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload du logo');
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-secondary-800 rounded-lg shadow border border-niger-orange/10 transition-colors duration-300 dark:bg-secondary-800">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center text-niger-green dark:text-niger-green-light">
              <SettingsIcon className="w-6 h-6 mr-2 text-niger-orange" />
              Paramètres du site
            </h2>
            <button onClick={handleSave} className="px-4 py-2 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center">
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-niger-green dark:text-niger-green-light">
                <Globe className="w-5 h-5 mr-2 text-niger-orange" />
                Informations générales
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Titre du site</label>
                  <input
                    type="text"
                    value={settings.site.title}
                    onChange={(e) => setSettings({ ...settings, site: { ...settings.site, title: e.target.value } })}
                    className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Description</label>
                  <input
                    type="text"
                    value={settings.site.description}
                    onChange={(e) => setSettings({ ...settings, site: { ...settings.site, description: e.target.value } })}
                    className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-niger-green dark:text-niger-green-light">Coordonnées</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground" />
                    <input
                      type="email"
                      value={settings.site.email}
                      onChange={(e) => setSettings({ ...settings, site: { ...settings.site, email: e.target.value } })}
                      className="w-full pl-10 pr-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground" />
                    <input
                      type="text"
                      value={settings.site.phone}
                      onChange={(e) => setSettings({ ...settings, site: { ...settings.site, phone: e.target.value } })}
                      className="w-full pl-10 pr-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground" />
                    <input
                      type="text"
                      value={settings.site.address}
                      onChange={(e) => setSettings({ ...settings, site: { ...settings.site, address: e.target.value } })}
                      className="w-full pl-10 pr-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-niger-green dark:text-niger-green-light">
                <ImageIcon className="w-5 h-5 mr-2 text-niger-orange" />
                Header et Logo
              </h3>
              
              <div className="space-y-6">
                {/* Image de fond du header */}
                <div className="p-4 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-niger-cream/20 dark:bg-secondary-700/50 transition-colors duration-300">
                  <h4 className="text-md font-medium mb-3 text-niger-green dark:text-niger-green-light">Image de fond du header</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Choisir une image</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleHeaderImageUpload}
                        className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                      />
                      <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPG, PNG, WebP (max 5MB)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Aperçu</label>
                      <div className="h-20 w-full relative border border-niger-orange/20 rounded-lg overflow-hidden">
                        <Image
                          src={previews.headerImage || settings.header?.backgroundImage || '/images/hero/Slide1.jpg'}
                          alt="Aperçu header"
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Opacité de l'image</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={(settings.header?.opacity || 5)}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        header: { 
                          ...settings.header, 
                          opacity: parseInt(e.target.value) 
                        } 
                      })}
                      className="w-full h-2 bg-niger-orange/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Très subtile</span>
                      <span>Visible</span>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="p-4 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-niger-cream/20 dark:bg-secondary-700/50 transition-colors duration-300">
                  <h4 className="text-md font-medium mb-3 text-niger-green dark:text-niger-green-light">Logo du ministère</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Choisir un logo</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                      />
                      <p className="text-xs text-gray-500 mt-1">Formats acceptés: JPG, PNG, SVG (max 2MB)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Aperçu</label>
                      <div className="h-20 w-20 relative border border-niger-orange/20 rounded-lg overflow-hidden bg-white">
                        <Image
                          src={previews.logo || settings.header?.logo || '/images/logos/mesrit-logo.png'}
                          alt="Aperçu logo"
                          fill
                          className="object-contain p-2"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Taille du logo</label>
                      <select
                        value={settings.header?.logoSize || 'medium'}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          header: { 
                            ...settings.header, 
                            logoSize: e.target.value 
                          } 
                        })}
                        className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                      >
                        <option value="small">Petit</option>
                        <option value="medium">Moyen</option>
                        <option value="large">Grand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Position du logo</label>
                      <select
                        value={settings.header?.logoPosition || 'left'}
                        onChange={(e) => setSettings({ 
                          ...settings, 
                          header: { 
                            ...settings.header, 
                            logoPosition: e.target.value 
                          } 
                        })}
                        className="w-full px-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                      >
                        <option value="left">Gauche</option>
                        <option value="center">Centre</option>
                        <option value="right">Droite</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-niger-green dark:text-niger-green-light">
                <BarChart3 className="w-5 h-5 mr-2 text-niger-orange" />
                Statistiques du Ministère
              </h3>
              
              <div className="bg-blue-50 dark:bg-secondary-700/50 border border-blue-200 dark:border-secondary-600 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      <strong>Statistiques secondaires :</strong> Configurez les petites statistiques affichées dans les sections Mission, Organisation et Direction de la page ministère.
                    </p>
                  </div>
                  <button
                    onClick={() => resetAllStats()}
                    className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                    title="Réinitialiser toutes les statistiques"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Tout réinitialiser
                  </button>
                </div>
              </div>

              {/* Onglets des sections et bouton mode JSON */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-1 bg-gray-100 dark:bg-secondary-700 p-1 rounded-lg">
                  {['mission', 'organisation', 'direction'].map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveStatsTab(section)}
                      disabled={jsonMode}
                      className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeStatsTab === section && !jsonMode
                          ? 'bg-white dark:bg-secondary-600 text-niger-green dark:text-niger-green-light shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-niger-green dark:hover:text-niger-green-light disabled:opacity-50'
                      }`}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={toggleJsonMode}
                  className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                    jsonMode
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-secondary-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-secondary-600 hover:bg-gray-50 dark:hover:bg-secondary-600'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  {jsonMode ? 'Mode Visuel' : 'Mode JSON'}
                </button>
              </div>

              {/* Contenu : Mode JSON ou Mode Visuel */}
              {jsonMode ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Edit className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div className="text-sm text-yellow-800 dark:text-yellow-300">
                        <p className="font-medium mb-1">Mode JSON Avancé</p>
                        <p>Modifiez directement la configuration en JSON. Les modifications sont appliquées en temps réel lors du retour au mode visuel.</p>
                      </div>
                    </div>
                  </div>
                  
                  {jsonError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-800 dark:text-red-300 text-sm font-medium">
                        {jsonError}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light">
                      Configuration JSON des statistiques du ministère
                    </label>
                    <textarea
                      value={jsonText}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      className="w-full h-96 p-4 border border-gray-300 dark:border-secondary-600 rounded-lg font-mono text-sm bg-white dark:bg-secondary-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange"
                      placeholder="Configuration JSON..."
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={applyJsonChanges}
                      disabled={!!jsonError}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Appliquer les modifications
                    </button>
                    
                    <button
                      onClick={() => setJsonText(JSON.stringify(settings.ministryStats || {}, null, 2))}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Réinitialiser
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                {/* Toggle pour activer/désactiver la section */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-secondary-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-niger-green dark:text-niger-green-light">
                      Section {activeStatsTab.charAt(0).toUpperCase() + activeStatsTab.slice(1)}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Afficher les statistiques dans cette section
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => resetSection(activeStatsTab)}
                      className="p-2 rounded-lg text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                      title="Réinitialiser cette section"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => updateMinistryStats(activeStatsTab, 'enabled', !settings.ministryStats?.[activeStatsTab]?.enabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        settings.ministryStats?.[activeStatsTab]?.enabled
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      title={settings.ministryStats?.[activeStatsTab]?.enabled ? 'Masquer cette section' : 'Afficher cette section'}
                    >
                      {settings.ministryStats?.[activeStatsTab]?.enabled ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Liste des statistiques */}
                {settings.ministryStats?.[activeStatsTab]?.enabled && (
                  <div className="space-y-3">
                    {(settings.ministryStats?.[activeStatsTab]?.stats || [])
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((stat, index) => (
                      <div key={stat.id} className="border border-gray-200 dark:border-secondary-600 rounded-lg p-4 bg-white dark:bg-secondary-800">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-niger-green dark:text-niger-green-light">
                            Statistique {index + 1}
                          </h5>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveStat(activeStatsTab, stat.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveStat(activeStatsTab, stat.id, 'down')}
                              disabled={index === (settings.ministryStats?.[activeStatsTab]?.stats || []).length - 1}
                              className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeStat(activeStatsTab, stat.id)}
                              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">
                              Libellé
                            </label>
                            <input
                              type="text"
                              value={stat.label}
                              onChange={(e) => updateStat(activeStatsTab, stat.id, 'label', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">
                              Valeur
                            </label>
                            <input
                              type="number"
                              value={stat.value}
                              onChange={(e) => updateStat(activeStatsTab, stat.id, 'value', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">
                              Unité (optionnel)
                            </label>
                            <input
                              type="text"
                              value={stat.unit}
                              onChange={(e) => updateStat(activeStatsTab, stat.id, 'unit', e.target.value)}
                              placeholder="%, +, etc."
                              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-1 text-niger-green dark:text-niger-green-light">
                              ID (lecture seule)
                            </label>
                            <input
                              type="text"
                              value={stat.id}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 dark:border-secondary-600 rounded-lg bg-gray-100 dark:bg-secondary-600 text-gray-600 dark:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Bouton d'ajout */}
                    <button
                      onClick={() => addStat(activeStatsTab)}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-secondary-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-niger-orange hover:text-niger-orange transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Ajouter une statistique
                    </button>
                  </div>
                )}
              </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-niger-green dark:text-niger-green-light">Services externes</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">ANAB</label>
                  <input
                    type="url"
                    value={settings.external.anab}
                    onChange={(e) => setSettings({ ...settings, external: { ...settings.external, anab: e.target.value } })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">BAC</label>
                  <input
                    type="url"
                    value={settings.external.bac}
                    onChange={(e) => setSettings({ ...settings, external: { ...settings.external, bac: e.target.value } })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">BTS</label>
                  <input
                    type="url"
                    value={settings.external.bts}
                    onChange={(e) => setSettings({ ...settings, external: { ...settings.external, bts: e.target.value } })}
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center text-niger-green dark:text-niger-green-light">
                <Facebook className="w-5 h-5 mr-2 text-niger-orange" />
                Réseaux sociaux
              </h3>
              <div className="bg-blue-50 dark:bg-secondary-700/50 border border-blue-200 dark:border-secondary-600 rounded-lg p-4 mb-4">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  <strong>URLs des réseaux sociaux :</strong> Configurez les liens vers les comptes officiels du ministère qui apparaîtront dans le footer du site.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Facebook</label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground" />
                    <input
                      type="url"
                      value={settings.social?.facebook || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          facebook: e.target.value
                        }
                      })}
                      placeholder="https://facebook.com/ministere..."
                      className="w-full pl-10 pr-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">Twitter</label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground" />
                    <input
                      type="url"
                      value={settings.social?.twitter || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          twitter: e.target.value
                        }
                      })}
                      placeholder="https://twitter.com/ministere..."
                      className="w-full pl-10 pr-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-niger-green dark:text-niger-green-light">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-readable-muted dark:text-muted-foreground" />
                    <input
                      type="url"
                      value={settings.social?.linkedin || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        social: {
                          ...settings.social,
                          linkedin: e.target.value
                        }
                      })}
                      placeholder="https://linkedin.com/company/ministere..."
                      className="w-full pl-10 pr-3 py-2 border border-niger-orange/20 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-niger-green dark:text-niger-green-light focus:ring-2 focus:ring-niger-orange/20 focus:border-niger-orange transition-colors duration-300 dark:bg-secondary-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}